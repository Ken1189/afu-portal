import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

/**
 * GET /api/auth/me
 *
 * Returns the current user's role data: primary `role`, `roles[]` array,
 * and `capabilities[]`. Uses the service role to bypass RLS — safe because
 * we only return data for the authenticated user.
 *
 * Response shape:
 * {
 *   userId: string,
 *   email: string,
 *   role: string,             // primary role
 *   roles: string[],          // unified roles (primary + roles[] column)
 *   capabilities: string[],
 *   isAdmin: boolean,
 *   error: null
 * }
 */
export async function GET() {
  try {
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

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { role: null, roles: [], capabilities: [], error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const svc = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Fetch role first (always present)
    const { data: profile, error: profileError } = await svc
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const role = profileError || !profile ? 'member' : (profile.role || 'member');

    // Try to fetch roles[] and capabilities[] (columns may not exist on older schemas)
    let rolesArr: string[] = [];
    let capabilities: string[] = [];
    try {
      const { data: extra } = await svc
        .from('profiles')
        .select('roles, capabilities')
        .eq('id', user.id)
        .single();
      if (extra?.roles && Array.isArray(extra.roles)) rolesArr = extra.roles;
      if (extra?.capabilities && Array.isArray(extra.capabilities))
        capabilities = extra.capabilities;
    } catch (err) {
      console.error("[auth/me] roles/capabilities lookup non-critical:", err);
      // columns don't exist — fine
    }

    // Unified roles set (primary role + roles[] column)
    const rolesSet = new Set<string>([role, ...rolesArr]);
    const roles = Array.from(rolesSet);
    const isAdmin = roles.includes('admin') || roles.includes('super_admin');

    return NextResponse.json({
      userId: user.id,
      email: user.email,
      role,
      roles,
      capabilities,
      isAdmin,
      error: null,
    });
  } catch (err) {
    console.error("[auth/me] non-critical:", err);
    return NextResponse.json(
      { role: null, roles: [], capabilities: [], error: 'Server error' },
      { status: 500 }
    );
  }
}
