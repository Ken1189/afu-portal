/**
 * Legal Assistance API
 * GET  — Get user's cases or admin view all cases
 * POST — Submit new legal case
 * PATCH — Update case status (admin)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, createServerSupabaseClient } from '@/lib/supabase/server';

async function getAuthUser() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = await createAdminClient();
    const role = user.user_metadata?.role;
    const isAdmin = role === 'admin' || role === 'super_admin';

    const caseId = req.nextUrl.searchParams.get('id');
    const status = req.nextUrl.searchParams.get('status');
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '50');
    const offset = parseInt(req.nextUrl.searchParams.get('offset') || '0');

    if (caseId) {
      const { data, error } = await db.from('legal_cases').select('*').eq('id', caseId).single();
      if (error) return NextResponse.json({ error: 'Case not found' }, { status: 404 });
      if (!isAdmin && data.user_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      return NextResponse.json(data);
    }

    let query = db.from('legal_cases').select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (!isAdmin) query = query.eq('user_id', user.id);
    if (status) query = query.eq('status', status);

    const { data, error, count } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Also get firms for reference
    const { data: firms } = await db.from('legal_firms').select('*').eq('is_active', true);

    return NextResponse.json({ cases: data || [], total: count || 0, firms: firms || [] });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { case_type, title, description, country_code, region, priority } = body;

    if (!case_type || !title || !description) {
      return NextResponse.json({ error: 'case_type, title, and description required' }, { status: 400 });
    }

    const db = await createAdminClient();

    // Generate case number
    const caseNumber = 'LEG-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') +
      '-' + Math.floor(Math.random() * 10000).toString().padStart(4, '0');

    const { data, error } = await db.from('legal_cases').insert({
      user_id: user.id,
      case_number: caseNumber,
      case_type,
      title,
      description,
      country_code: country_code || null,
      region: region || null,
      priority: priority || 'medium',
      status: 'pending',
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const role = user.user_metadata?.role;
    if (role !== 'admin' && role !== 'super_admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ error: 'Case id required' }, { status: 400 });

    const db = await createAdminClient();

    // If resolving, set resolved_at
    if (updates.status === 'resolved') {
      updates.resolved_at = new Date().toISOString();
    }

    const { data, error } = await db.from('legal_cases').update(updates).eq('id', id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
