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
 * POST /api/admin/suppliers/approve
 *
 * Approves a supplier:
 * 1. Creates auth account if needed
 * 2. Creates/updates profile with role 'supplier'
 * 3. Updates supplier status to 'active' + verified
 * 4. Sends welcome email with login credentials
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

    const { supplierId } = await request.json();
    if (!supplierId) {
      return NextResponse.json({ success: false, error: 'supplierId required' }, { status: 400 });
    }

    // Fetch supplier
    const { data: supplier, error: supErr } = await svc.from('suppliers').select('*').eq('id', supplierId).single();
    if (supErr || !supplier) {
      return NextResponse.json({ success: false, error: 'Supplier not found' }, { status: 404 });
    }

    const email = supplier.email || supplier.contact_email;
    if (!email) {
      // Just update status if no email
      await svc.from('suppliers').update({ status: 'active', verified: true }).eq('id', supplierId);
      return NextResponse.json({
        success: true,
        accountCreated: false,
        message: 'Supplier approved (no email on file — cannot send credentials).',
      });
    }

    // Generate temp password
    const tempPassword = `AFU-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    // Try to create auth user
    let userId: string | null = supplier.user_id || supplier.profile_id || null;
    let accountCreated = false;

    if (!userId) {
      const { data: newUser, error: createErr } = await svc.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: { role: 'supplier', full_name: supplier.company_name || supplier.contact_name },
      });

      if (createErr) {
        if (createErr.message?.includes('already been registered') || createErr.message?.includes('already exists')) {
          const { data: existingUsers } = await svc.auth.admin.listUsers();
          const existing = existingUsers?.users?.find((u: { email?: string }) => u.email === email);
          if (existing) userId = existing.id;
        } else {
          // Still approve the supplier even if account creation fails
          await svc.from('suppliers').update({ status: 'active', verified: true }).eq('id', supplierId);
          return NextResponse.json({
            success: true,
            accountCreated: false,
            message: `Supplier approved. Could not create account: ${createErr.message}`,
          });
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
        email,
        full_name: supplier.company_name || supplier.contact_name || email,
        phone: supplier.phone || supplier.contact_phone || null,
        role: 'supplier',
        country: supplier.country || null,
      });
    }

    // Update supplier record
    await svc.from('suppliers').update({
      status: 'active',
      verified: true,
      user_id: userId,
      profile_id: userId,
    }).eq('id', supplierId);

    // Send welcome email
    const companyName = supplier.company_name || 'Your Company';
    const contactName = supplier.contact_name || companyName;

    try {
      await resend.emails.send({
        from: FROM,
        to: email,
        subject: `Welcome to AFU Marketplace — ${companyName} is Approved! 🎉`,
        html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
          <div style="background:#1B2A4A;padding:30px;text-align:center">
            <h1 style="color:#5DB347;margin:0;font-size:24px">African Farming Union</h1>
            <p style="color:#8CB89C;margin:8px 0 0;font-size:14px">Supplier Marketplace</p>
          </div>
          <div style="padding:30px;background:#f8faf6">
            <h2 style="color:#1B2A4A;margin-top:0">Welcome, ${contactName}!</h2>
            <p style="color:#333;font-size:15px;line-height:1.6">
              Great news — <strong>${companyName}</strong> has been <strong style="color:#5DB347">approved</strong> as a verified supplier on the AFU Marketplace.
              You can now list products, receive orders from farmers across Africa, and grow your business.
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
                  <td style="padding:8px 0;color:#1B2A4A;font-weight:600">${email}</td>
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
              <p style="color:#333;font-size:14px;margin:0">You already have an account. Log in at <a href="https://africanfarmingunion.org/login" style="color:#2563eb;font-weight:600">africanfarmingunion.org/login</a> to access your supplier dashboard.</p>
            </div>
            `}

            <div style="background:white;border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin:20px 0">
              <h3 style="color:#1B2A4A;margin-top:0;font-size:16px">What You Can Do Now</h3>
              <ol style="color:#333;font-size:14px;line-height:1.8;padding-left:20px">
                <li>Log into your <a href="https://africanfarmingunion.org/supplier" style="color:#2563eb">Supplier Dashboard</a></li>
                <li>Add your products to the marketplace</li>
                <li>Set pricing and delivery options</li>
                <li>Start receiving orders from farmers across Africa</li>
              </ol>
            </div>

            <div style="text-align:center;margin-top:24px">
              <a href="https://africanfarmingunion.org/supplier" style="display:inline-block;background:#5DB347;color:white;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px">Go to Supplier Dashboard</a>
            </div>
          </div>
          <div style="padding:16px;text-align:center;color:#999;font-size:12px">
            African Farming Union | <a href="https://africanfarmingunion.org" style="color:#999">africanfarmingunion.org</a>
          </div>
        </div>`,
      });
    } catch (emailErr) {
      console.error('Failed to send supplier welcome email:', emailErr);
    }

    // Notify Devon + Peter
    try {
      await resend.emails.send({
        from: FROM,
        to: ['peterw@africanfarmingunion.org', 'devonk@africanfarmingunion.org'],
        subject: `Supplier Approved: ${companyName}`,
        html: `<div style="font-family:Arial,sans-serif;padding:20px">
          <h2 style="color:#1B2A4A">Supplier Approved</h2>
          <p><strong>${companyName}</strong> (${contactName}) has been approved as an AFU supplier.</p>
          <p>Country: ${supplier.country || 'N/A'}</p>
          <p>Account created: ${accountCreated ? 'Yes' : 'No (existing)'}</p>
          <a href="https://africanfarmingunion.org/admin/suppliers" style="display:inline-block;background:#5DB347;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600">View in Admin</a>
        </div>`,
      });
    } catch { /* non-critical */ }

    // Fire marketing automations
    fireAutomations('supplier_approved', {
      name: supplier.company_name || supplier.contact_name,
      email,
      phone: supplier.phone || supplier.contact_phone || undefined,
      country: supplier.country || undefined,
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      accountCreated,
      tempPassword: accountCreated ? tempPassword : null,
      message: accountCreated
        ? `Account created for ${email}. Welcome email sent with login credentials.`
        : `Supplier approved. Welcome email sent. (Existing account — no new password.)`,
    });
  } catch (err) {
    console.error('Supplier approve error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
