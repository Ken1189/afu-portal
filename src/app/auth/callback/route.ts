import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

/**
 * Handles the OAuth / magic-link callback.
 * Exchanges the auth code for a session, then redirects based on role.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const explicitRedirect = searchParams.get('redirect');

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // If explicit redirect was provided, use it
      if (explicitRedirect) {
        return NextResponse.redirect(`${origin}${explicitRedirect}`);
      }
      // Otherwise, check role and redirect accordingly
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        const role = profile?.role as string | undefined;
        const dest = (role === 'admin' || role === 'super_admin') ? '/admin' : '/dashboard';
        return NextResponse.redirect(`${origin}${dest}`);
      }
      return NextResponse.redirect(`${origin}/dashboard`);
    }
  }

  // If something went wrong, redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
