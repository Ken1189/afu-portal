/**
 * GET   /api/notifications  — Fetch user's notifications (paginated)
 * PATCH /api/notifications  — Mark notification(s) as read
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase/server';

/**
 * GET — Fetch current user's notifications
 * Query params: ?page=1&limit=20&filter=unread&unread=true
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20', 10), 100);
    const filter = url.searchParams.get('filter');
    const unreadOnly = url.searchParams.get('unread') === 'true';
    const offset = (page - 1) * limit;

    const adminClient = await createAdminClient();

    // Get unread count
    const { count: unreadCount } = await adminClient
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    // Build notifications query
    let query = adminClient
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (filter === 'unread' || unreadOnly) {
      query = query.eq('is_read', false);
    } else if (filter === 'read') {
      query = query.eq('is_read', true);
    }

    const { data: notifications, error } = await query;

    // If notifications table doesn't exist yet, return empty
    if (error?.message?.includes('does not exist')) {
      return NextResponse.json({ notifications: [], unreadCount: 0, page, limit });
    }
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      notifications: notifications || [],
      unreadCount: unreadCount || 0,
      page,
      limit,
    });
  } catch (err) {
    console.error('GET /api/notifications error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH — Mark notifications as read
 * Body: { notificationId: string } or { markAllRead: true }
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { notificationId, markAllRead } = body;

    const adminClient = await createAdminClient();

    if (markAllRead) {
      const { error } = await adminClient
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: 'All notifications marked as read' });
    }

    if (notificationId) {
      const { error } = await adminClient
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: 'Provide notificationId or markAllRead: true' },
      { status: 400 },
    );
  } catch (err) {
    console.error('PATCH /api/notifications error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
