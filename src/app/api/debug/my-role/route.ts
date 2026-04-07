import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

/**
 * GET /api/debug/my-role
 *
 * DIAGNOSTIC ENDPOINT — returns the current user's full role state and the
 * portals the PortalSwitcherDropdown would render for them.
 *
 * Devon: hit https://www.africanfarmingunion.org/api/debug/my-role while
 * logged in. The response shows your auth uid, profile.role, profile.roles[],
 * profile.capabilities[], and the portals you'd see in the switcher.
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
          setAll() {},
        },
      }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          authenticated: false,
          error: 'Not logged in. Sign in first, then hit this URL again.',
        },
        { status: 401 }
      );
    }

    const svc = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Fetch the full profile row using service role (bypasses RLS)
    const { data: profile, error: profileError } = await svc
      .from('profiles')
      .select('id, email, full_name, role')
      .eq('id', user.id)
      .single();

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
    } catch {
      // columns missing — fine
    }

    const primaryRole = profile?.role ?? null;
    const unifiedRoles = Array.from(
      new Set<string>([primaryRole, ...rolesArr].filter(Boolean) as string[])
    );

    const isAdmin =
      unifiedRoles.includes('admin') || unifiedRoles.includes('super_admin');

    // Mirror the PortalSwitcherDropdown logic so Devon sees what he'd get
    const portalDefs: {
      key: string;
      href: string;
      label: string;
      shows: boolean;
      reason: string;
    }[] = [
      {
        key: 'admin',
        href: '/admin',
        label: 'Admin Portal',
        shows: isAdmin,
        reason: isAdmin ? 'is admin/super_admin' : 'requires admin/super_admin role',
      },
      {
        key: 'farm',
        href: '/farm',
        label: 'Farmer Portal',
        shows: true,
        reason: 'always visible (default member portal)',
      },
      {
        key: 'supplier',
        href: '/supplier',
        label: 'Supplier Portal',
        shows:
          isAdmin ||
          unifiedRoles.includes('supplier') ||
          capabilities.includes('supplier'),
        reason: 'requires supplier role/capability or admin',
      },
      {
        key: 'ambassador',
        href: '/ambassador',
        label: 'Ambassador Portal',
        shows:
          isAdmin ||
          unifiedRoles.includes('ambassador') ||
          capabilities.includes('ambassador'),
        reason: 'requires ambassador role/capability or admin',
      },
      {
        key: 'investor',
        href: '/investor',
        label: 'Investor Portal',
        shows:
          isAdmin ||
          unifiedRoles.includes('investor') ||
          capabilities.includes('investor'),
        reason: 'requires investor role/capability or admin',
      },
      {
        key: 'warehouse',
        href: '/warehouse',
        label: 'Warehouse Portal',
        shows:
          isAdmin ||
          unifiedRoles.includes('warehouse_operator') ||
          capabilities.includes('warehouse_op'),
        reason: 'requires warehouse_operator role or warehouse_op capability or admin',
      },
      {
        key: 'public',
        href: '/',
        label: 'Public Site',
        shows: true,
        reason: 'always visible',
      },
    ];

    return NextResponse.json(
      {
        authenticated: true,
        authUid: user.id,
        email: user.email,
        profile: {
          found: !!profile && !profileError,
          primaryRole,
          rolesArray: rolesArr,
          capabilities,
        },
        unifiedRoles,
        isAdmin,
        portalsTheSwitcherWouldShow: portalDefs.filter((p) => p.shows).map((p) => ({
          key: p.key,
          href: p.href,
          label: p.label,
        })),
        allPortalsWithReasons: portalDefs,
        diagnosis: !primaryRole
          ? 'NO PROFILE ROW — sign-up may have failed. Run the signup flow or insert a profile row.'
          : !isAdmin && primaryRole === 'member' && rolesArr.length === 0
          ? 'You are role=member with NO roles[] entries. Middleware will redirect /admin, /supplier, /ambassador, /warehouse → /dashboard. Run: UPDATE profiles SET role=\'super_admin\' WHERE id=\'' +
            user.id +
            '\';'
          : isAdmin
          ? 'You ARE admin. The PortalSwitcher should show ALL portals and middleware will allow all routes.'
          : 'You have some specific roles. Only the matching portals will work.',
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (err) {
    return NextResponse.json(
      { error: 'Server error', details: String(err) },
      { status: 500 }
    );
  }
}
