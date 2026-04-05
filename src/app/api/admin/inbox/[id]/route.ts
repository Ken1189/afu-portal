import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase/server';

/**
 * GET /api/admin/inbox/[id] — Get conversation + messages
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const admin = await createAdminClient();

    const { data: conversation, error: convErr } = await admin.from('conversations').select('*').eq('id', id).single();
    if (convErr) return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });

    const { data: messages } = await admin.from('conversation_messages').select('*').eq('conversation_id', id).order('created_at', { ascending: true });

    // Mark as read
    if (conversation.unread_count > 0) {
      await admin.from('conversations').update({ unread_count: 0 }).eq('id', id);
    }

    return NextResponse.json({ conversation, messages: messages || [] });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/inbox/[id] — Update conversation (status, assign, tags, priority)
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const admin = await createAdminClient();
    const body = await req.json();
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

    if (body.status) updates.status = body.status;
    if (body.assigned_to !== undefined) updates.assigned_to = body.assigned_to;
    if (body.priority) updates.priority = body.priority;
    if (body.tags) updates.tags = body.tags;

    const { data, error } = await admin.from('conversations').update(updates).eq('id', id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ conversation: data });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
