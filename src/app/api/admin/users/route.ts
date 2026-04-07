import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import { sendWelcomeEmail } from '@/lib/email/welcome-user';

const ALLOWED_ROLES = [
  'farmer', 'supplier', 'ambassador', 'investor',
  'partner', 'admin', 'super_admin', 'member',
] as const;

const ALLOWED_CAPABILITIES = [
  'ambassador', 'supplier', 'investor', 'sponsor', 'advisor', 'warehouse_op',
] as const;

type AllowedRole = typeof ALLOWED_ROLES[number];
type AllowedCapability = typeof ALLOWED_CAPABILITIES[number];

async function writeAudit(
  svc: SupabaseClient,
  payload: { user_id: string; action: string; entity_id: string; details: Record<string, unknown> }
) {
  try {
    const { error } = await (svc.from('audit_log') as unknown as {
      insert: (row: Record<string, unknown>) => Promise<{ error: { message: string } | null }>;
    }).insert({
      user_id: payload.user_id,
      action: payload.action,
      entity_type: 'profiles',
      entity_id: payload.entity_id,
      details: payload.details,
    });
    if (error) {
      console.warn('[AUDIT] insert failed, falling back to log:', error.message, payload);
    }
  } catch (e) {
    console.warn('[AUDIT] exception, falling back to log:', e, payload);
  }
}

function generateTempPassword(): string {
  // 14-char temp password with AFU prefix + 10 hex chars = safe & memorable
  return `AFU-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;
}

/**
 * POST /api/admin/users
 *
 * Create a new user account + profile + side-effect rows, optionally
 * sending a welcome email with a temporary password.
 *
 * Body:
 * {
 *   email, full_name, role,
 *   capabilities?: string[],
 *   country?, phone?,
 *   send_welcome?: boolean (default true)
 * }
 */
export async function POST(request: Request) {
  try {
    // ── Auth ─────────────────────────────────────────────────────────
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll() {},
        },
      }
    );

    const { data: { user: caller }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !caller) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    const svc = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: callerProfile } = await svc
      .from('profiles')
      .select('role')
      .eq('id', caller.id)
      .single();

    if (!callerProfile || !['admin', 'super_admin'].includes(callerProfile.role)) {
      return NextResponse.json({ success: false, error: 'Forbidden: admin access required' }, { status: 403 });
    }

    // ── Parse body ───────────────────────────────────────────────────
    const body = await request.json().catch(() => ({}));
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
    const full_name = typeof body?.full_name === 'string' ? body.full_name.trim() : '';
    const role = body?.role as string | undefined;
    const capabilities: string[] = Array.isArray(body?.capabilities) ? body.capabilities : [];
    const country = typeof body?.country === 'string' ? body.country : null;
    const phone = typeof body?.phone === 'string' ? body.phone : null;
    const send_welcome = body?.send_welcome !== false; // default true

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ success: false, error: 'Valid email is required' }, { status: 400 });
    }
    if (!full_name) {
      return NextResponse.json({ success: false, error: 'full_name is required' }, { status: 400 });
    }
    if (!role || !ALLOWED_ROLES.includes(role as AllowedRole)) {
      return NextResponse.json({
        success: false,
        error: `Invalid role. Must be one of: ${ALLOWED_ROLES.join(', ')}`,
      }, { status: 400 });
    }
    for (const cap of capabilities) {
      if (!ALLOWED_CAPABILITIES.includes(cap as AllowedCapability)) {
        return NextResponse.json({
          success: false,
          error: `Invalid capability: ${cap}. Allowed: ${ALLOWED_CAPABILITIES.join(', ')}`,
        }, { status: 400 });
      }
    }

    // Only super_admin can grant super_admin
    if (role === 'super_admin' && callerProfile.role !== 'super_admin') {
      return NextResponse.json({
        success: false,
        error: 'Only super_admin can create super_admin users',
      }, { status: 403 });
    }

    // ── Conflict: email already in auth.users ───────────────────────
    const { data: existingProfile } = await svc
      .from('profiles')
      .select('id, email')
      .eq('email', email)
      .maybeSingle();
    if (existingProfile) {
      return NextResponse.json({
        success: false,
        error: 'A user with this email already exists',
      }, { status: 409 });
    }

    // ── Create auth user ─────────────────────────────────────────────
    const tempPassword = generateTempPassword();
    const { data: newAuth, error: createErr } = await svc.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { role, full_name },
    });

    if (createErr || !newAuth?.user) {
      if (createErr?.message?.includes('already') || createErr?.message?.includes('exists')) {
        return NextResponse.json({
          success: false,
          error: 'A user with this email already exists',
        }, { status: 409 });
      }
      return NextResponse.json({
        success: false,
        error: 'Failed to create user: ' + (createErr?.message || 'unknown error'),
      }, { status: 500 });
    }

    const newUserId = newAuth.user.id;

    // ── Insert profile ───────────────────────────────────────────────
    const profileRow: Record<string, unknown> = {
      id: newUserId,
      email,
      full_name,
      role,
      country,
      phone,
    };
    if (capabilities.length > 0) {
      profileRow.capabilities = capabilities;
    }

    const { error: profileErr } = await svc.from('profiles').upsert(profileRow);
    if (profileErr) {
      // If capabilities column doesn't exist, retry without it
      if (/capabilities/i.test(profileErr.message)) {
        delete profileRow.capabilities;
        const { error: retryErr } = await svc.from('profiles').upsert(profileRow);
        if (retryErr) {
          console.error('[admin/users POST] profile upsert retry failed:', retryErr.message);
        }
      } else {
        console.error('[admin/users POST] profile upsert failed:', profileErr.message);
      }
    }

    // ── Side effects based on role ───────────────────────────────────
    const sideEffects: string[] = [];

    if (role === 'farmer' || role === 'member') {
      const memberId = `AFU-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 99999)).padStart(5, '0')}`;
      const { error: memErr } = await svc.from('members').insert({
        profile_id: newUserId,
        member_id: memberId,
        tier: 'free',
        status: 'active',
      });
      if (!memErr) sideEffects.push('created members row');
      else console.error('[admin/users POST] members insert failed:', memErr.message);
    }

    if (role === 'supplier' || role === 'partner') {
      const { error: supErr } = await svc.from('suppliers').insert({
        profile_id: newUserId,
        company_name: full_name,
        contact_name: full_name,
        email,
        phone,
        category: 'input-supplier',
        country: country || 'Unknown',
        status: 'active',
        verified: false,
      });
      if (!supErr) sideEffects.push('created suppliers row');
      else console.error('[admin/users POST] suppliers insert failed:', supErr.message);
    }

    if (role === 'ambassador') {
      const { error: ambErr } = await svc.from('ambassadors').insert({
        user_id: newUserId,
        full_name,
        email,
        country: country || 'Unknown',
        bio: 'Profile pending — created via admin user creation.',
        sector: 'mixed',
      });
      if (!ambErr) sideEffects.push('created ambassadors row');
      else console.error('[admin/users POST] ambassadors insert failed:', ambErr.message);
    }

    // ── Side effects based on capabilities ──────────────────────────
    for (const cap of capabilities) {
      if (cap === 'supplier') {
        const { data: existing } = await svc
          .from('suppliers').select('id').eq('profile_id', newUserId).maybeSingle();
        if (!existing) {
          await svc.from('suppliers').insert({
            profile_id: newUserId,
            company_name: full_name,
            contact_name: full_name,
            email,
            phone,
            category: 'input-supplier',
            country: country || 'Unknown',
            status: 'active',
            verified: false,
          });
          sideEffects.push('created suppliers row (capability)');
        }
      }
      if (cap === 'ambassador') {
        const { data: existing } = await svc
          .from('ambassadors').select('id').eq('user_id', newUserId).maybeSingle();
        if (!existing) {
          await svc.from('ambassadors').insert({
            user_id: newUserId,
            full_name,
            email,
            country: country || 'Unknown',
            bio: 'Profile pending — created via admin capability grant.',
            sector: 'mixed',
          });
          sideEffects.push('created ambassadors row (capability)');
        }
      }
    }

    // ── Audit ────────────────────────────────────────────────────────
    await writeAudit(svc, {
      user_id: caller.id,
      action: 'user_created',
      entity_id: newUserId,
      details: {
        target_user_id: newUserId,
        email,
        role,
        capabilities,
        side_effects: sideEffects,
        send_welcome,
      },
    });

    // ── Welcome email ────────────────────────────────────────────────
    let emailSent = false;
    if (send_welcome) {
      try {
        await sendWelcomeEmail({
          userId: newUserId,
          email,
          full_name,
          role,
          capabilities,
          temp_password: tempPassword,
        });
        emailSent = true;
      } catch (e) {
        console.error('[admin/users POST] welcome email failed:', e);
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        id: newUserId,
        email,
        full_name,
        role,
        capabilities,
        // Only return temp_password if we did NOT send an email so admin can copy it
        ...(send_welcome ? {} : { temp_password: tempPassword }),
      },
      sideEffects,
      emailSent,
    });
  } catch (err) {
    console.error('[admin/users POST] error', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
