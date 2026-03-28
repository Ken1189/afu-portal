import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

/**
 * Helper: authenticate the caller and verify they are super_admin.
 */
async function authenticateSuperAdmin() {
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
    return { error: 'Not authenticated', status: 401, user: null };
  }

  // Use service role to check caller's role
  const svc = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: profile } = await svc
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'super_admin') {
    return { error: 'Forbidden — super_admin only', status: 403, user: null };
  }

  return { error: null, status: 200, user, svc };
}

// ── GET /api/admin/permissions?userId=xxx ─────────────────────────────────
// Fetch all permissions for a specific user.

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 });
    }

    const auth = await authenticateSuperAdmin();
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { data, error } = await auth.svc!
      .from('admin_permissions')
      .select('permission')
      .eq('user_id', userId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const permissions = (data || []).map((row: { permission: string }) => row.permission);
    return NextResponse.json({ permissions });
  } catch (err) {
    console.error('GET /api/admin/permissions error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ── POST /api/admin/permissions ───────────────────────────────────────────
// Set permissions for a user. Replaces all existing permissions.
// Body: { userId: string, permissions: string[] }

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, permissions } = body as { userId: string; permissions: string[] };

    if (!userId || !Array.isArray(permissions)) {
      return NextResponse.json(
        { error: 'Invalid body — requires userId (string) and permissions (string[])' },
        { status: 400 }
      );
    }

    const auth = await authenticateSuperAdmin();
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const svc = auth.svc!;

    // Delete all existing permissions for this user
    const { error: deleteError } = await svc
      .from('admin_permissions')
      .delete()
      .eq('user_id', userId);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    // Insert new permissions (if any)
    if (permissions.length > 0) {
      const rows = permissions.map((perm: string) => ({
        user_id: userId,
        permission: perm,
      }));

      const { error: insertError } = await svc.from('admin_permissions').insert(rows);

      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, permissions });
  } catch (err) {
    console.error('POST /api/admin/permissions error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
