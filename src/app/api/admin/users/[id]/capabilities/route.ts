import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const ALLOWED_CAPABILITIES = [
  'ambassador', 'supplier', 'investor', 'sponsor', 'advisor', 'warehouse_op',
] as const;

type AllowedCapability = typeof ALLOWED_CAPABILITIES[number];

 
async function writeAudit(
  svc: any,
  payload: { user_id: string; action: string; details: Record<string, unknown>; entity_id: string }
) {
  try {
    // audit_log may not be in generated types — cast through unknown
    const { error } = await (svc.from('audit_log') as unknown as {
      insert: (row: Record<string, unknown>) => Promise<{ error: { message: string } | null }>;
    }).insert({
      user_id: payload.user_id,
      action: payload.action,
      details: payload.details,
      entity_id: payload.entity_id,
    });
    if (error) {
      console.warn('[AUDIT] insert failed:', error.message, payload);
      // TODO: ensure audit_log table exists in production
    }
  } catch (e) {
    console.warn('[AUDIT] exception:', e, payload);
    // TODO: ensure audit_log table exists in production
  }
}

/**
 * PATCH /api/admin/users/[id]/capabilities
 * Body: { action: 'add'|'remove', capability: AllowedCapability }
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: targetUserId } = await context.params;
    if (!targetUserId) {
      return NextResponse.json({ success: false, error: 'Missing user id' }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const action = body?.action as 'add' | 'remove' | undefined;
    const capability = body?.capability as string | undefined;

    if (action !== 'add' && action !== 'remove') {
      return NextResponse.json(
        { success: false, error: 'action must be "add" or "remove"' },
        { status: 400 }
      );
    }
    if (!capability || !ALLOWED_CAPABILITIES.includes(capability as AllowedCapability)) {
      return NextResponse.json(
        { success: false, error: `Invalid capability. Must be one of: ${ALLOWED_CAPABILITIES.join(', ')}` },
        { status: 400 }
      );
    }

    // ── Auth ─────────────────────────────────────────────────────────────
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

    // Fetch target profile (needed for side-effect inserts)
    const { data: targetProfile, error: targetErr } = await svc
      .from('profiles')
      .select('id, full_name, email, country')
      .eq('id', targetUserId)
      .single();

    if (targetErr || !targetProfile) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // Call RPC
    const rpcName = action === 'add' ? 'add_user_capability' : 'remove_user_capability';
    const { error: rpcErr } = await svc.rpc(rpcName, {
      p_user_id: targetUserId,
      p_capability: capability,
    });

    if (rpcErr) {
      return NextResponse.json(
        { success: false, error: `RPC ${rpcName} failed: ${rpcErr.message}` },
        { status: 500 }
      );
    }

    const sideEffects: string[] = [];

    // Side effects: only on add (preserve history on remove)
    if (action === 'add') {
      if (capability === 'supplier') {
        const { data: existing } = await svc
          .from('suppliers')
          .select('id')
          .eq('profile_id', targetUserId)
          .maybeSingle();
        if (!existing) {
          const { error: supErr } = await svc.from('suppliers').insert({
            profile_id: targetUserId,
            company_name: targetProfile.full_name || 'Unnamed',
            contact_name: targetProfile.full_name || 'Unknown',
            email: targetProfile.email,
            category: 'input-supplier',
            country: targetProfile.country || 'Unknown',
            status: 'active',
            verified: false,
          });
          if (!supErr) sideEffects.push('created suppliers row');
          else console.error('[capabilities PATCH] suppliers insert failed:', supErr.message);
        }
      }

      if (capability === 'ambassador') {
        const { data: existing } = await svc
          .from('ambassadors')
          .select('id')
          .eq('user_id', targetUserId)
          .maybeSingle();
        if (!existing) {
          const { error: ambErr } = await svc.from('ambassadors').insert({
            user_id: targetUserId,
            full_name: targetProfile.full_name || 'Unnamed',
            email: targetProfile.email,
            country: targetProfile.country || 'Unknown',
            bio: null,
            sector: 'mixed',
          });
          if (!ambErr) sideEffects.push('created ambassadors row');
          else console.error('[capabilities PATCH] ambassadors insert failed:', ambErr.message);
        }
      }
    }

    // Read updated capabilities
    const { data: refreshed } = await svc
      .from('profiles')
      .select('capabilities')
      .eq('id', targetUserId)
      .single();

    await writeAudit(svc, {
      user_id: caller.id,
      action: `capability_${action}`,
      entity_id: targetUserId,
      details: {
        target_user_id: targetUserId,
        capability,
        action,
        side_effects: sideEffects,
      },
    });

    return NextResponse.json({
      success: true,
      capabilities: refreshed?.capabilities || [],
      sideEffects,
    });
  } catch (err) {
    console.error('[admin/users capabilities PATCH] error', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
