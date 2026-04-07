import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

/**
 * POST /api/admin/impersonate
 *
 * Start or stop impersonation.
 *
 * Start:  { action: 'start', targetUserId: string }
 *   - Verifies caller is super_admin
 *   - Returns the target user's profile so the frontend can store it in localStorage
 *
 * Stop:   { action: 'stop' }
 *   - Returns success (frontend clears localStorage)
 *
 * The actual impersonation state lives in localStorage on the client.
 * This endpoint exists to:
 *   1. Server-side verify that the caller is super_admin before allowing impersonation
 *   2. Fetch the target user's profile data securely via service role
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, targetUserId } = body as {
      action: 'start' | 'stop';
      targetUserId?: string;
    };

    if (!action || !['start', 'stop'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "start" or "stop".' },
        { status: 400 }
      );
    }

    // ── Authenticate caller ──────────────────────────────────────────────
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll() {
            // read-only in route handlers
          },
        },
      }
    );

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Use service role to check caller's role
    const svc = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: callerProfile } = await svc
      .from('profiles')
      .select('role, full_name')
      .eq('id', user.id)
      .single();

    if (callerProfile?.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Forbidden — super_admin only' },
        { status: 403 }
      );
    }

    // ── Stop impersonation ───────────────────────────────────────────────
    if (action === 'stop') {
      return NextResponse.json({
        success: true,
        originalUserId: user.id,
      });
    }

    // ── Start impersonation ──────────────────────────────────────────────
    if (!targetUserId) {
      return NextResponse.json(
        { error: 'Missing targetUserId for start action' },
        { status: 400 }
      );
    }

    // Cannot impersonate yourself
    if (targetUserId === user.id) {
      return NextResponse.json(
        { error: 'Cannot impersonate yourself' },
        { status: 400 }
      );
    }

    // Fetch target user's profile
    const { data: targetProfile, error: targetError } = await svc
      .from('profiles')
      .select('id, email, full_name, role, country, region')
      .eq('id', targetUserId)
      .single();

    if (targetError || !targetProfile) {
      return NextResponse.json(
        { error: 'Target user not found' },
        { status: 404 }
      );
    }

    // Audit log: record impersonation start
    try {
      await svc.from('audit_log').insert({
        action: 'impersonation_start',
        entity_type: 'user',
        entity_id: targetProfile.id,
        user_id: user.id,
        details: {
          admin_id: user.id,
          admin_name: callerProfile?.full_name || null,
          target_id: targetProfile.id,
          target_email: targetProfile.email,
          target_role: targetProfile.role,
          started_at: new Date().toISOString(),
        },
      });
    } catch (e) {
      console.warn('Failed to write audit_log for impersonation:', e);
    }

    return NextResponse.json({
      success: true,
      impersonation: {
        userId: targetProfile.id,
        fullName: targetProfile.full_name,
        email: targetProfile.email,
        role: targetProfile.role,
        country: targetProfile.country,
        region: targetProfile.region,
        originalUserId: user.id,
      },
    });
  } catch (err) {
    console.error('POST /api/admin/impersonate error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
