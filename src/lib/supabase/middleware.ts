import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';
import { rateLimit } from '@/lib/rateLimit';

/**
 * Creates a service-role Supabase client that bypasses RLS.
 * Used only for role lookups in middleware.
 */
function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * Looks up a user's role from the profiles table using service role (bypasses RLS).
 */
async function getUserRole(userId: string): Promise<string | null> {
  const svc = getServiceClient();
  const { data } = await svc
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();
  return data?.role ?? null;
}

/**
 * Refreshes the Supabase session on every request and
 * protects authenticated routes.
 */
export async function updateSession(request: NextRequest) {
  // ── Rate limiting on API routes ──────────────────────────────────────
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const rateLimitResponse = rateLimit(request);
    if (rateLimitResponse) return rateLimitResponse;
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh the session (important for token rotation)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // ── Protected route patterns ────────────────────────────────────────
  // Public paths that start with protected prefixes (must be checked first)
  const publicExceptions = ['/farmers', '/farms', '/investors', '/investor-login', '/supplier/apply', '/ambassador/apply', '/ambassadors'];
  const isPublicException = publicExceptions.some((p) => pathname.startsWith(p));

  const protectedPaths = ['/dashboard', '/farm', '/supplier', '/admin', '/investor', '/ambassador', '/warehouse'];
  const isProtected = !isPublicException && protectedPaths.some((p) => pathname.startsWith(p));

  // If accessing a protected route without a session → redirect to login
  if (isProtected && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // S1.16: Fetch role ONCE and reuse for all checks (was 5 redundant DB calls)
  const role = user ? await getUserRole(user.id) : null;

  // If logged in and visiting /login → redirect based on role
  if (pathname === '/login' && user) {
    const dest = request.nextUrl.clone();
    switch (role) {
      case 'super_admin':
      case 'admin':
        dest.pathname = '/admin';
        break;
      case 'investor':
        dest.pathname = '/investor';
        break;
      case 'supplier':
        dest.pathname = '/supplier';
        break;
      case 'ambassador':
        dest.pathname = '/ambassador';
        break;
      case 'warehouse_operator':
        dest.pathname = '/warehouse';
        break;
      default:
        dest.pathname = '/dashboard';
    }
    return NextResponse.redirect(dest);
  }

  // ── Role-based access (single role lookup reused) ─────────────────
  if (user && pathname.startsWith('/admin')) {
    if (!role || !['admin', 'super_admin'].includes(role)) {
      const forbiddenUrl = request.nextUrl.clone();
      forbiddenUrl.pathname = '/dashboard';
      return NextResponse.redirect(forbiddenUrl);
    }
  }

  if (user && pathname.startsWith('/supplier')) {
    if (!role || !['supplier', 'admin', 'super_admin'].includes(role)) {
      const forbiddenUrl = request.nextUrl.clone();
      forbiddenUrl.pathname = '/dashboard';
      return NextResponse.redirect(forbiddenUrl);
    }
  }

  if (user && pathname.startsWith('/investor')) {
    if (!role || !['investor', 'admin', 'super_admin'].includes(role)) {
      const forbiddenUrl = request.nextUrl.clone();
      forbiddenUrl.pathname = '/dashboard';
      return NextResponse.redirect(forbiddenUrl);
    }
  }

  if (user && pathname.startsWith('/ambassador')) {
    if (!role || !['ambassador', 'admin', 'super_admin'].includes(role)) {
      const forbiddenUrl = request.nextUrl.clone();
      forbiddenUrl.pathname = '/dashboard';
      return NextResponse.redirect(forbiddenUrl);
    }
  }

  if (user && pathname.startsWith('/warehouse')) {
    if (!role || !['warehouse_operator', 'admin', 'super_admin'].includes(role)) {
      const forbiddenUrl = request.nextUrl.clone();
      forbiddenUrl.pathname = '/dashboard';
      return NextResponse.redirect(forbiddenUrl);
    }
  }

  return supabaseResponse;
}
