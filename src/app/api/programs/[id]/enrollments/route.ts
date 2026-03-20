import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function svc() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function requireAdmin(req: NextRequest) {
  const db = svc();
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);

  const { data: { user }, error } = await db.auth.getUser(token);
  if (error || !user) return null;

  const { data: profile } = await db
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !['admin', 'super_admin'].includes(profile.role)) return null;
  return user;
}

/**
 * GET /api/programs/[id]/enrollments
 * Admin only — list all enrollments for a program with member details.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = svc();
    const user = await requireAdmin(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: programId } = await params;
    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get('status');

    let query = db
      .from('program_enrollments')
      .select(`
        *,
        members (
          id,
          member_id,
          farm_name,
          profile_id,
          profiles (
            full_name,
            email,
            country,
            phone
          )
        )
      `)
      .eq('program_id', programId)
      .order('applied_at', { ascending: false });

    if (statusFilter && statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    const { data, error } = await query;

    if (error) {
      console.error('GET /api/programs/[id]/enrollments error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ enrollments: data ?? [] });
  } catch (err) {
    console.error('GET /api/programs/[id]/enrollments unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/programs/[id]/enrollments
 * Admin only — update an enrollment's status, stage, and/or notes.
 * Body: { enrollment_id, status?, stage?, notes? }
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = svc();
    const adminUser = await requireAdmin(req);
    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: programId } = await params;
    const body = await req.json();
    const { enrollment_id, status, stage, notes } = body;

    if (!enrollment_id) {
      return NextResponse.json({ error: 'enrollment_id is required' }, { status: 400 });
    }

    // Validate the enrollment belongs to this program
    const { data: existing, error: fetchError } = await db
      .from('program_enrollments')
      .select('id, status, current_stage, program_id')
      .eq('id', enrollment_id)
      .eq('program_id', programId)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 });
    }

    const validStatuses = ['applied', 'approved', 'active', 'completed', 'rejected', 'withdrawn'];
    const validStages = ['discover', 'approved', 'inputs', 'growing', 'harvest', 'offtake', 'complete'];

    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    if (stage && !validStages.includes(stage)) {
      return NextResponse.json(
        { error: `Invalid stage. Must be one of: ${validStages.join(', ')}` },
        { status: 400 }
      );
    }

    const updatePayload: Record<string, unknown> = {};
    if (status) updatePayload.status = status;
    if (stage) updatePayload.current_stage = stage;
    if (notes !== undefined) updatePayload.notes = notes;

    // Set approved_at / completed_at timestamps
    if (status === 'approved' && existing.status !== 'approved') {
      updatePayload.approved_at = new Date().toISOString();
    }
    if (status === 'completed' && existing.status !== 'completed') {
      updatePayload.completed_at = new Date().toISOString();
    }

    const { data: enrollment, error: updateError } = await db
      .from('program_enrollments')
      .update(updatePayload)
      .eq('id', enrollment_id)
      .select()
      .single();

    if (updateError) {
      console.error('PATCH /api/programs/[id]/enrollments update error:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Record stage history if stage changed
    if (stage && stage !== existing.current_stage) {
      await db.from('program_stage_history').insert({
        enrollment_id,
        stage,
        notes: notes ?? `Stage updated to ${stage} by admin`,
        updated_by: adminUser.id,
      });
    }

    return NextResponse.json({ enrollment });
  } catch (err) {
    console.error('PATCH /api/programs/[id]/enrollments unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
