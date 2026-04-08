import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';
import { rateLimitAsync } from '@/lib/rateLimit';

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
 * Checks whether a user has a members record (i.e. completed membership setup).
 */
async function hasMemberRecord(userId: string): Promise<boolean> {
  try {
    const svc = getServiceClient();
    const { data, error } = await svc
      .from('members')
      .select('id')
      .eq('profile_id', userId)
      .maybeSingle();
    if (error) return true; // on error, assume they have one (avoid redirect loop)
    return !!data;
  } catch {
    return true; // safe default
  }
}

/**
 * Looks up a user's role and roles array from the profiles table using service role (bypasses RLS).
 */
async function getUserRoleData(userId: string): Promise<{ role: string; roles: string[] }> {
  const defaultResult = { role: 'member', roles: [] as string[] };
  try {
    const svc = getServiceClient();
    // Single query selecting both columns. If `roles` column doesn't exist
    // PostgREST returns a 42703 error and we fall back to role only.
    const { data, error } = await svc
      .from('profiles')
      .select('role, roles')
      .eq('id', userId)
      .single();
    if (!error && data) {
      return {
        role: (data.role as string) ?? 'member',
        roles: Array.isArray(data.roles) ? (data.roles as string[]) : [],
      };
    }
    // Fallback: roles column missing — query role only
    const { data: roleOnly } = await svc
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
    return { role: (roleOnly?.role as string) ?? 'member', roles: [] };
  } catch (err) {
    console.error('[Middleware] Role lookup error:', err);
    return defaultResult;
  }
}

/** Check if user has a given role via primary role OR roles array */
function userHasRole(roleData: { role: string; roles: string[] }, target: string): boolean {
  return roleData.role === target || roleData.roles.includes(target);
}

/** Check if user has any of the given roles */
function userHasAnyRole(roleData: { role: string; roles: string[] }, targets: string[]): boolean {
  return targets.some((t) => userHasRole(roleData, t));
}

/**
 * Refreshes the Supabase session on every request and
 * protects authenticated routes.
 */
export async function updateSession(request: NextRequest) {
  // ── Rate limiting on API routes (Upstash-backed when configured) ────
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const rateLimitResponse = await rateLimitAsync(request);
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
  const publicExceptions = ['/farmers', '/farms', '/farming', '/investors', '/investor-login', '/supplier/apply', '/ambassador/apply', '/ambassadors'];
  const isPublicException = publicExceptions.some((p) => pathname.startsWith(p));

  const protectedPaths = ['/dashboard', '/farm', '/supplier', '/admin', '/investor', '/ambassador', '/warehouse', '/onboarding'];
  const isProtected = !isPublicException && protectedPaths.some((p) => pathname.startsWith(p));

  // If accessing a protected route without a session → redirect to login
  if (isProtected && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // S1.16: Fetch role ONCE and reuse for all checks (was 5 redundant DB calls)
  // Perf: only look up role when the path actually needs it. Public pages, API
  // routes, and unauthenticated requests all skip the DB round-trip entirely.
  const needsRoleCheck =
    !!user &&
    (pathname === '/login' ||
      pathname.startsWith('/admin') ||
      pathname.startsWith('/supplier') ||
      pathname.startsWith('/investor') ||
      pathname.startsWith('/ambassador') ||
      pathname.startsWith('/warehouse'));
  const roleData = needsRoleCheck ? await getUserRoleData(user!.id) : null;
  const role = roleData?.role ?? null;

  // If logged in and visiting /login → redirect based on primary role
  if (pathname === '/login' && user) {
    const dest = request.nextUrl.clone();
    switch (role) {
      case 'super_admin':
      case 'admin':
        dest.pathname = '/admin';
        break;
      case 'farmer':
        dest.pathname = '/farm';
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

  // ── Onboarding redirect for users without a member record ──────────
  // Only check on protected member paths (not /onboarding itself, not admin/supplier/etc.)
  // Onboarding is now OPTIONAL — accessible via /onboarding but never forced
  // Users without a member record can still browse their portal freely

  // ── Role-based access (checks both primary role AND roles[] array) ──
  if (user && roleData && pathname.startsWith('/admin')) {
    if (!userHasAnyRole(roleData, ['admin', 'super_admin'])) {
      const forbiddenUrl = request.nextUrl.clone();
      forbiddenUrl.pathname = '/dashboard';
      return NextResponse.redirect(forbiddenUrl);
    }
  }

  if (user && roleData && pathname.startsWith('/supplier')) {
    if (!userHasAnyRole(roleData, ['supplier', 'admin', 'super_admin'])) {
      const forbiddenUrl = request.nextUrl.clone();
      forbiddenUrl.pathname = '/dashboard';
      return NextResponse.redirect(forbiddenUrl);
    }
  }

  if (user && roleData && pathname.startsWith('/investor')) {
    if (!userHasAnyRole(roleData, ['investor', 'admin', 'super_admin'])) {
      const forbiddenUrl = request.nextUrl.clone();
      forbiddenUrl.pathname = '/dashboard';
      return NextResponse.redirect(forbiddenUrl);
    }
  }

  if (user && roleData && pathname.startsWith('/ambassador')) {
    if (!userHasAnyRole(roleData, ['ambassador', 'admin', 'super_admin'])) {
      const forbiddenUrl = request.nextUrl.clone();
      forbiddenUrl.pathname = '/dashboard';
      return NextResponse.redirect(forbiddenUrl);
    }
  }

  if (user && roleData && pathname.startsWith('/warehouse')) {
    if (!userHasAnyRole(roleData, ['warehouse_operator', 'admin', 'super_admin'])) {
      const forbiddenUrl = request.nextUrl.clone();
      forbiddenUrl.pathname = '/dashboard';
      return NextResponse.redirect(forbiddenUrl);
    }
  }

  return supabaseResponse;
}
