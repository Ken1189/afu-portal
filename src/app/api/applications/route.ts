import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase/server';
import { notifyAdmins } from '@/lib/email';

/**
 * GET /api/applications
 * List membership applications. Admin only.
 */
export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { searchParams } = new URL(request.url);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !['admin', 'super_admin'].includes(profile.role as string)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const adminClient = await createAdminClient();
  let query = adminClient
    .from('membership_applications')
    .select('*', { count: 'exact' });

  const status = searchParams.get('status');
  if (status && status !== 'all') query = query.eq('status', status);

  query = query.order('created_at', { ascending: false });

  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '50');
  const from = (page - 1) * limit;
  query = query.range(from, from + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    applications: data,
    pagination: { page, limit, total: count },
  });
}

/**
 * POST /api/applications
 * Submit a membership application. Public.
 */
export async function POST(request: NextRequest) {
  // Rate limit: max 5 applications per IP per minute
  const { rateLimitAsync } = await import('@/lib/rateLimit');
  const blocked = await rateLimitAsync(request);
  if (blocked) return blocked;

  const body = await request.json();

  // ── Spam protection ──────────────────────────────────────────────────
  // 1. Honeypot: if hidden field is filled, it's a bot
  if (body.website_url || body.company_website || body.fax) {
    return NextResponse.json({ error: 'Application submitted' }, { status: 200 }); // fake success
  }

  // 2. Timing check: if form was submitted in < 3 seconds, likely a bot
  if (body._formLoadedAt) {
    const elapsed = Date.now() - Number(body._formLoadedAt);
    if (elapsed < 3000) {
      return NextResponse.json({ error: 'Application submitted' }, { status: 200 });
    }
  }

  // 3. Gibberish detection: check key text fields for random strings
  const textFields = [body.motivation, body.promotion_plan, body.full_name, body.notes].filter(Boolean);
  for (const text of textFields) {
    if (typeof text === 'string' && text.length > 5) {
      const vowelRatio = (text.match(/[aeiouAEIOU]/g) || []).length / text.length;
      const spaceRatio = (text.match(/ /g) || []).length / text.length;
      // Normal text has ~35-45% vowels and ~15-20% spaces
      // Random strings have <15% vowels and <5% spaces
      if (vowelRatio < 0.12 && spaceRatio < 0.05 && text.length > 10) {
        return NextResponse.json({ error: 'Application submitted' }, { status: 200 });
      }
    }
  }

  // Clean honeypot/timing fields before validation
  delete body.website_url;
  delete body.company_website;
  delete body.fax;
  delete body._formLoadedAt;

  const { validate, createApplicationSchema } = await import('@/lib/validation');
  const validation = validate(createApplicationSchema, body);
  if (!validation.success) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  // Use admin client to bypass RLS for public submission
  const adminClient = await createAdminClient();
  const { data, error } = await adminClient
    .from('membership_applications')
    .insert({
      ...validation.data,
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Notify all 3 admins + write to universal inbox
  try {
    const fields = (validation.data ?? {}) as Record<string, unknown>;
    const submitterEmail = (fields.email as string | undefined) ?? undefined;
    const submitterName =
      (fields.full_name as string | undefined) ??
      (fields.name as string | undefined) ??
      submitterEmail ??
      'Membership applicant';
    await notifyAdmins({
      subject: `New Membership Application from ${submitterName}`,
      type: 'application',
      data: { ...fields, application_id: data?.id },
      reply_to: submitterEmail,
      name: submitterName,
      tags: ['application'],
    });
  } catch (notifyErr) {
    console.error('[applications notifyAdmins]', notifyErr);
  }

  // Auto-approve free tier applications instantly
  if (data && (validation.data as Record<string, unknown>)?.requested_tier === 'free') {
    try {
      const tempPassword = 'AFU-' + Math.random().toString(36).slice(2, 10);
      const { data: newUser, error: authErr } = await adminClient.auth.admin.createUser({
        email: data.email,
        password: tempPassword,
        email_confirm: true,
      });
      if (!authErr && newUser?.user) {
        await adminClient.from('profiles').upsert({
          id: newUser.user.id,
          full_name: data.full_name,
          email: data.email,
          phone: data.phone,
          country: data.country,
          role: 'farmer',
        });
        await adminClient.from('members').insert({
          profile_id: newUser.user.id,
          tier: 'free',
          status: 'active',
          farm_name: data.farm_name,
          farm_size_ha: data.farm_size_ha,
          primary_crops: data.primary_crops,
        });
        await adminClient
          .from('membership_applications')
          .update({ status: 'approved', reviewed_at: new Date().toISOString() })
          .eq('id', data.id);

        // Send welcome email with login credentials
        const firstName = (data.full_name || '').split(' ')[0] || 'Farmer';
        try {
          const { sendEmail } = await import('@/lib/email');
          await sendEmail(
            data.email,
            'Welcome to AFU — Your Account is Ready!',
            `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #1B2A4A;">Welcome to the African Farming Union, ${firstName}!</h2>
              <p>Your free membership has been <strong style="color: #5DB347;">approved</strong> and your account is ready.</p>
              <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin: 20px 0;">
                <p style="margin: 0 0 8px;"><strong>Email:</strong> ${data.email}</p>
                <p style="margin: 0 0 8px;"><strong>Temporary Password:</strong> ${tempPassword}</p>
                <p style="margin: 0; font-size: 13px; color: #6b7280;">Please change your password after your first login.</p>
              </div>
              <a href="https://www.africanfarmingunion.org/login" style="display: inline-block; background: #5DB347; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">Log In to Your Farm Portal</a>
              <p style="color: #6b7280; font-size: 12px; margin-top: 24px;">African Farming Union — By Farmers, For Farmers</p>
            </div>`
          );
        } catch {
          // Email send failed — user can still reset password
        }
      }
    } catch {
      // Silent — admin can approve manually if auto-approve fails
    }
  }

  return NextResponse.json({ application: data }, { status: 201 });
}
