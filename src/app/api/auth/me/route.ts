import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

/**
 * GET /api/auth/me
 *
 * Returns the current user's role from the profiles table.
 * Uses the service role key to bypass RLS — safe because
 * we only return the role of the authenticated user.
 */
export async function GET() {
  try {
    const cookieStore = await cookies();

    // Create a server client to read the session from cookies
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
      return NextResponse.json({ role: null, error: 'Not authenticated' }, { status: 401 });
    }

    // Use service role to bypass RLS and get the profile
    const svc = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: profile, error: profileError } = await svc
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ role: 'member', error: null });
    }

    return NextResponse.json({ role: profile.role, error: null });
  } catch {
    return NextResponse.json({ role: null, error: 'Server error' }, { status: 500 });
  }
}
