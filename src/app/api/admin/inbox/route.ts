import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase/server';

/**
 * GET /api/admin/inbox — List conversations with filters
 * Query params: status, type, assigned_to, search, limit, offset
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const admin = await createAdminClient();
    const url = new URL(req.url);
    const status = url.searchParams.get('status');
    const type = url.searchParams.get('type');
    const assignedTo = url.searchParams.get('assigned_to');
    const search = url.searchParams.get('search');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    let query = admin.from('conversations').select('*', { count: 'exact' }).order('last_message_at', { ascending: false }).range(offset, offset + limit - 1);

    if (status && status !== 'all') query = query.eq('status', status);
    if (type && type !== 'all') query = query.eq('contact_type', type);
    if (assignedTo) query = query.eq('assigned_to', assignedTo);
    if (search) query = query.or(`contact_name.ilike.%${search}%,contact_email.ilike.%${search}%,subject.ilike.%${search}%`);

    const { data, count, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Get unread total
    const { count: unreadTotal } = await admin.from('conversations').select('id', { count: 'exact', head: true }).gt('unread_count', 0);

    return NextResponse.json({ conversations: data || [], total: count || 0, unread: unreadTotal || 0 });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

/**
 * POST /api/admin/inbox — Compose new conversation
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const admin = await createAdminClient();
    const body = await req.json();
    const { contact_name, contact_email, contact_phone, contact_type, subject, message, channel } = body;

    if (!contact_email && !contact_phone) {
      return NextResponse.json({ error: 'Email or phone required' }, { status: 400 });
    }

    // Create conversation
    const { data: conv, error: convErr } = await admin.from('conversations').insert({
      contact_name: contact_name || contact_email || contact_phone,
      contact_email,
      contact_phone,
      contact_type: contact_type || 'lead',
      subject,
      status: 'open',
      assigned_to: user.id,
      unread_count: 0,
      last_message_at: new Date().toISOString(),
    }).select().single();

    if (convErr) return NextResponse.json({ error: convErr.message }, { status: 500 });

    // Create first message
    const { data: profile } = await admin.from('profiles').select('full_name, email').eq('id', user.id).single();

    await admin.from('conversation_messages').insert({
      conversation_id: conv.id,
      direction: 'outbound',
      channel: channel || 'email',
      sender_name: profile?.full_name || 'AFU Admin',
      sender_email: profile?.email || 'admin@africanfarmingunion.org',
      subject,
      body: message,
    });

    // Actually send the message via appropriate channel
    if (channel === 'sms' && contact_phone) {
      await fetch(new URL('/api/sms/send', req.url).toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}` },
        body: JSON.stringify({ to: contact_phone, body: message }),
      }).catch(() => {});
    } else if (contact_email) {
      await fetch(new URL('/api/email/send', req.url).toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}` },
        body: JSON.stringify({ to: contact_email, subject: subject || 'Message from AFU', html: message }),
      }).catch(() => {});
    }

    return NextResponse.json({ conversation: conv }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
