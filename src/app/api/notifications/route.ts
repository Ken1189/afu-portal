import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const unreadOnly = searchParams.get('unread') === 'true';

  const adminClient = await createAdminClient();
  let query = adminClient
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50);

  if (unreadOnly) query = query.eq('read', false);
  const { data, error } = await query;

  // If notifications table doesn't exist yet, return empty
  if (error?.message?.includes('does not exist')) {
    return NextResponse.json({ notifications: [], unreadCount: 0 });
  }
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const unreadCount = (data || []).filter(n => !n.read).length;
  return NextResponse.json({ notifications: data || [], unreadCount });
}
