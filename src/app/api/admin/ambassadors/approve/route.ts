import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import { Resend } from 'resend';
import { fireAutomations } from '@/lib/automations/executor';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = 'African Farming Union <noreply@mail.africanfarmingunion.org>';

/**
 * POST /api/admin/ambassadors/approve
 *
 * Approves an ambassador:
 * 1. Fetches the ambassador record
 * 2. Creates a Supabase auth user with a temp password (if no account exists)
 * 3. Creates/updates a profiles record with role: 'ambassador'
 * 4. Updates ambassador status to 'approved' + generates referral code
 * 5. Sends welcome email with login credentials + referral link
 */
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll() { /* read-only */ },
        },
      }
    );

    const { data: { user: adminUser }, error: authError } = await supabase.auth.getUser();
    if (authError || !adminUser) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    const svc = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Verify admin
    const { data: adminProfile } = await svc.from('profiles').select('role').eq('id', adminUser.id).single();
    if (!adminProfile || !['admin', 'super_admin'].includes(adminProfile.role)) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const { ambassadorId } = await request.json();
    if (!ambassadorId) {
      return NextResponse.json({ success: false, error: 'ambassadorId required' }, { status: 400 });
    }

    // Fetch ambassador
    const { data: amb, error: ambErr } = await svc.from('ambassadors').select('*').eq('id', ambassadorId).single();
    if (ambErr || !amb) {
      return NextResponse.json({ success: false, error: 'Ambassador not found' }, { status: 404 });
    }

    if (amb.status === 'approved' || amb.status === 'active') {
      return NextResponse.json({ success: false, error: 'Ambassador already approved' }, { status: 400 });
    }

    if (!amb.email) {
      return NextResponse.json({ success: false, error: 'Ambassador has no email address' }, { status: 400 });
    }

    // Generate temp password and referral code
    const tempPassword = `AFU-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const referralCode = `AMB-${amb.full_name?.split(' ')[0]?.toUpperCase() || 'REF'}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    // Try to create auth user
    let userId: string | null = amb.user_id || null;
    let accountCreated = false;

    if (!userId) {
      const { data: newUser, error: createErr } = await svc.auth.admin.createUser({
        email: amb.email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: { role: 'ambassador', full_name: amb.full_name },
      });

      if (createErr) {
        if (createErr.message?.includes('already been registered') || createErr.message?.includes('already exists')) {
          // User exists — find their ID
          const { data: existingUsers } = await svc.auth.admin.listUsers();
          const existing = existingUsers?.users?.find((u: { email?: string }) => u.email === amb.email);
          if (existing) {
            userId = existing.id;
          }
        } else {
          return NextResponse.json({ success: false, error: 'Failed to create account: ' + createErr.message }, { status: 500 });
        }
      } else {
        userId = newUser.user.id;
        accountCreated = true;
      }
    }

    // Create/update profile
    if (userId) {
      await svc.from('profiles').upsert({
        id: userId,
        email: amb.email,
        full_name: amb.full_name,
        phone: amb.phone || null,
        role: 'ambassador',
        country: amb.country || null,
      });
    }

    // Update ambassador record
    await svc.from('ambassadors').update({
      status: 'active',
      user_id: userId,
      referral_code: referralCode,
    }).eq('id', ambassadorId);

    // Create referral link
    if (userId) {
      await svc.from('referral_links').insert({
        ambassador_id: ambassadorId,
        user_id: userId,
        code: referralCode,
        url: `https://africanfarmingunion.org/apply?ref=${referralCode}`,
        status: 'active',
      });
      // Ignore errors — referral_links table might not exist yet
    }

    // Send welcome email with credentials
    const firstName = amb.full_name?.split(' ')[0] || 'Ambassador';
    const referralUrl = `https://africanfarmingunion.org/apply?ref=${referralCode}`;

    try {
      await resend.emails.send({
        from: FROM,
        to: amb.email,
        subject: 'Welcome to the AFU Ambassador Program! 🎉',
        html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
          <div style="background:#1B2A4A;padding:30px;text-align:center">
            <h1 style="color:#5DB347;margin:0;font-size:24px">African Farming Union</h1>
            <p style="color:#8CB89C;margin:8px 0 0;font-size:14px">Ambassador Program</p>
          </div>
          <div style="padding:30px;background:#f8faf6">
            <h2 style="color:#1B2A4A;margin-top:0">Congratulations, ${firstName}!</h2>
            <p style="color:#333;font-size:15px;line-height:1.6">
              Your application to the AFU Ambassador Program has been <strong style="color:#5DB347">approved</strong>.
              Welcome to the team — you're now part of the movement transforming African agriculture.
            </p>

            ${accountCreated ? `
            <div style="background:white;border:2px solid #5DB347;border-radius:12px;padding:20px;margin:20px 0">
              <h3 style="color:#1B2A4A;margin-top:0;font-size:16px">Your Login Credentials</h3>
              <table style="width:100%;font-size:14px">
                <tr>
                  <td style="padding:8px 0;color:#64748b;width:120px">Login URL</td>
                  <td style="padding:8px 0"><a href="https://africanfarmingunion.org/login" style="color:#2563eb;font-weight:600">africanfarmingunion.org/login</a></td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#64748b">Email</td>
                  <td style="padding:8px 0;color:#1B2A4A;font-weight:600">${amb.email}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#64748b">Password</td>
                  <td style="padding:8px 0;color:#1B2A4A;font-weight:600;font-family:monospace;font-size:16px">${tempPassword}</td>
                </tr>
              </table>
              <p style="color:#EF4444;font-size:12px;margin-bottom:0">Please change your password after your first login.</p>
            </div>
            ` : `
            <div style="background:white;border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin:20px 0">
              <p style="color:#333;font-size:14px;margin:0">You already have an account. Log in at <a href="https://africanfarmingunion.org/login" style="color:#2563eb;font-weight:600">africanfarmingunion.org/login</a> to access your ambassador dashboard.</p>
            </div>
            `}

            <div style="background:white;border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin:20px 0">
              <h3 style="color:#1B2A4A;margin-top:0;font-size:16px">Your Referral Link</h3>
              <p style="color:#333;font-size:14px">Share this link to earn commissions on every signup:</p>
              <div style="background:#f0fdf4;border:1px solid #5DB347;border-radius:8px;padding:12px;word-break:break-all">
                <a href="${referralUrl}" style="color:#5DB347;font-weight:600;font-size:14px;text-decoration:none">${referralUrl}</a>
              </div>
              <p style="color:#64748b;font-size:12px;margin-bottom:0">Referral Code: <strong>${referralCode}</strong></p>
            </div>

            <div style="background:white;border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin:20px 0">
              <h3 style="color:#1B2A4A;margin-top:0;font-size:16px">What's Next?</h3>
              <ol style="color:#333;font-size:14px;line-height:1.8;padding-left:20px">
                <li>Log into your <a href="https://africanfarmingunion.org/ambassador" style="color:#2563eb">Ambassador Dashboard</a></li>
                <li>Share your referral link with farmers, suppliers, and investors</li>
                <li>Track your referrals and commissions in real time</li>
                <li>Check out the <a href="https://africanfarmingunion.org/ambassadors/guide" style="color:#2563eb">Ambassador Guide</a> and <a href="https://africanfarmingunion.org/ambassadors/marketing" style="color:#2563eb">Marketing Kit</a></li>
              </ol>
            </div>

            <div style="text-align:center;margin-top:24px">
              <a href="https://africanfarmingunion.org/ambassador" style="display:inline-block;background:#5DB347;color:white;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px">Go to Ambassador Dashboard</a>
            </div>
          </div>
          <div style="padding:16px;text-align:center;color:#999;font-size:12px">
            African Farming Union | <a href="https://africanfarmingunion.org" style="color:#999">africanfarmingunion.org</a>
          </div>
        </div>`,
      });
    } catch (emailErr) {
      console.error('Failed to send welcome email:', emailErr);
      // Don't fail the approval if email fails
    }

    // Also notify Devon + Peter
    try {
      await resend.emails.send({
        from: FROM,
        to: ['peterw@africanfarmingunion.org', 'devonk@africanfarmingunion.org'],
        subject: `Ambassador Approved: ${amb.full_name} (${amb.country})`,
        html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
          <h2 style="color:#1B2A4A">Ambassador Approved</h2>
          <p><strong>${amb.full_name}</strong> from <strong>${amb.country}</strong> has been approved as an AFU Ambassador.</p>
          <p>Referral code: <strong>${referralCode}</strong></p>
          <p>Account created: ${accountCreated ? 'Yes (new account)' : 'No (existing account)'}</p>
          <a href="https://africanfarmingunion.org/admin/ambassadors" style="display:inline-block;background:#5DB347;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600">View in Admin</a>
        </div>`,
      });
    } catch { /* non-critical */ }

    // Fire marketing automations
    fireAutomations('ambassador_approved', {
      name: amb.full_name,
      email: amb.email,
      phone: amb.phone || undefined,
      country: amb.country || undefined,
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      accountCreated,
      tempPassword: accountCreated ? tempPassword : null,
      referralCode,
      message: accountCreated
        ? `Account created for ${amb.email}. Welcome email sent with login credentials and referral link.`
        : `Ambassador approved. Welcome email sent with referral link. (Existing account — no new password generated.)`,
    });
  } catch (err) {
    console.error('Ambassador approve error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
