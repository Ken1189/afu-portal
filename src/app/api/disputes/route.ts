import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const admin = await createAdminClient();
    const { data, error } = await admin
      .from('disputes')
      .select('*')
      .eq('raised_by', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[disputes GET] Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ disputes: data ?? [] });
  } catch (err) {
    console.error('[disputes GET] Error:', err);
    return NextResponse.json({ error: 'Failed to load disputes' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const body = await req.json();
    const { entity_type, entity_id, category, description, against_user } = body;

    if (!description || !description.trim()) {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 });
    }

    const admin = await createAdminClient();
    const { data, error } = await admin
      .from('disputes')
      .insert({
        raised_by: user.id,
        against_user: against_user ?? null,
        entity_type: entity_type ?? null,
        entity_id: entity_id ?? null,
        category: category ?? 'other',
        description,
        status: 'open',
      })
      .select()
      .single();

    if (error) {
      console.error('[disputes POST] Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ dispute: data });
  } catch (err) {
    console.error('[disputes POST] Error:', err);
    return NextResponse.json({ error: 'Failed to raise dispute' }, { status: 500 });
  }
}
