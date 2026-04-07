import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { notifyAdmins } from '@/lib/events/notifications';

/**
 * Self-service capability activation.
 *
 * Users can opt themselves into these capabilities without admin approval.
 * Supplier + farmer are explicitly excluded — those require admin vetting.
 */
const SELF_SERVICE_CAPABILITIES = ['ambassador', 'investor', 'sponsor', 'advisor'] as const;
type SelfServiceCapability = (typeof SELF_SERVICE_CAPABILITIES)[number];

/**
 * POST /api/user/capabilities/activate
 * Body: { capability: 'ambassador' | 'investor' | 'sponsor' | 'advisor' }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const capability = body?.capability as string | undefined;

    if (!capability || !SELF_SERVICE_CAPABILITIES.includes(capability as SelfServiceCapability)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid capability. Must be one of: ${SELF_SERVICE_CAPABILITIES.join(', ')}`,
        },
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
          getAll() {
            return cookieStore.getAll();
          },
          setAll() {},
        },
      }
    );

    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();
    if (authErr || !user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // ── Service-role client for writes ───────────────────────────────────
    const svc = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Fetch caller profile for side-effect row creation
    const { data: profile, error: profileErr } = await svc
      .from('profiles')
      .select('id, full_name, email, country, capabilities')
      .eq('id', user.id)
      .single();

    if (profileErr || !profile) {
      return NextResponse.json(
        { success: false, error: 'Profile not found' },
        { status: 404 }
      );
    }

    // ── Call RPC — idempotent add ────────────────────────────────────────
    const { error: rpcErr } = await svc.rpc('add_user_capability', {
      p_user_id: user.id,
      p_capability: capability,
    });
    if (rpcErr) {
      return NextResponse.json(
        { success: false, error: `add_user_capability failed: ${rpcErr.message}` },
        { status: 500 }
      );
    }

    const sideEffects: string[] = [];

    // ── Side-effects: create companion row so portal has something to show ──
    if (capability === 'ambassador') {
      const { data: existing } = await svc
        .from('ambassadors')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      if (!existing) {
        const { error: ambErr } = await svc.from('ambassadors').insert({
          user_id: user.id,
          full_name: profile.full_name || 'Unnamed',
          email: profile.email,
          country: profile.country || 'Unknown',
          bio: 'Profile pending — self-activated via capabilities API.',
          sector: 'mixed',
        });
        if (!ambErr) sideEffects.push('created ambassadors row');
        else console.error('[capabilities/activate] ambassadors insert failed:', ambErr.message);
      }
    }

    if (capability === 'investor') {
      // Table name is investor_interests in existing code; try both gracefully.
      try {
        const { data: existing } = await svc
          .from('investor_interests')
          .select('id')
          .eq('email', profile.email)
          .limit(1)
          .maybeSingle();
        if (!existing) {
          const { error: invErr } = await svc.from('investor_interests').insert({
            opportunity_id: 'general',
            opportunity_name: 'General Interest',
            amount: 0,
            entity_name: profile.full_name || 'Unnamed',
            email: profile.email,
            phone: '',
            notes: 'Self-activated via capabilities API.',
            investor_name: profile.full_name || '',
            status: 'pending',
          });
          if (!invErr) sideEffects.push('created investor_interests row');
          else console.error('[capabilities/activate] investor_interests insert failed:', invErr.message);
        }
      } catch (e) {
        console.warn('[capabilities/activate] investor_interests side-effect skipped:', e);
      }
    }

    // ── Refresh capabilities ─────────────────────────────────────────────
    const { data: refreshed } = await svc
      .from('profiles')
      .select('capabilities')
      .eq('id', user.id)
      .single();

    // ── Notify admins ────────────────────────────────────────────────────
    try {
      await notifyAdmins(
        `New ${capability} self-activation`,
        `${profile.full_name || profile.email} has activated the ${capability} capability.`,
        {
          type: 'capability_activation',
          actionUrl: `/admin/members?q=${encodeURIComponent(profile.email || '')}`,
          metadata: {
            user_id: user.id,
            capability,
            side_effects: sideEffects,
          },
        }
      );
    } catch (notifyErr) {
      console.error('[capabilities/activate] notifyAdmins failed:', notifyErr);
    }

    return NextResponse.json({
      success: true,
      capabilities: refreshed?.capabilities || [],
      sideEffects,
    });
  } catch (err) {
    console.error('[capabilities/activate] error', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
