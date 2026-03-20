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
 * GET /api/programs/[id]
 * Returns program with inclusions and enrollment count.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = svc();
    const { id } = await params;

    const { data: program, error } = await db
      .from('programs')
      .select(`
        *,
        program_inclusions (*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Program not found' }, { status: 404 });
      }
      console.error('GET /api/programs/[id] error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get enrollment count by status
    const { data: enrollments, error: enrollError } = await db
      .from('program_enrollments')
      .select('id, status')
      .eq('program_id', id);

    if (enrollError) {
      console.error('GET /api/programs/[id] enrollment count error:', enrollError);
    }

    const enrollmentStats = {
      total: enrollments?.length ?? 0,
      applied: enrollments?.filter(e => e.status === 'applied').length ?? 0,
      approved: enrollments?.filter(e => e.status === 'approved').length ?? 0,
      active: enrollments?.filter(e => e.status === 'active').length ?? 0,
      completed: enrollments?.filter(e => e.status === 'completed').length ?? 0,
      rejected: enrollments?.filter(e => e.status === 'rejected').length ?? 0,
    };

    return NextResponse.json({ program: { ...program, enrollmentStats } });
  } catch (err) {
    console.error('GET /api/programs/[id] unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PUT /api/programs/[id]
 * Full program update. Admin only.
 * Body: all program fields + optional inclusions array (replaces existing).
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = svc();
    const user = await requireAdmin(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { inclusions, ...programFields } = body;

    // Remove read-only fields
    const { id: _id, created_at: _ca, created_by: _cb, ...updateFields } = programFields;
    void _id; void _ca; void _cb;

    const { data: program, error } = await db
      .from('programs')
      .update({
        ...updateFields,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Program not found' }, { status: 404 });
      }
      console.error('PUT /api/programs/[id] error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // If inclusions provided, replace them
    if (Array.isArray(inclusions)) {
      // Delete existing
      await db.from('program_inclusions').delete().eq('program_id', id);

      let insertedInclusions: unknown[] = [];
      if (inclusions.length > 0) {
        const inclusionRows = inclusions.map((inc: Record<string, unknown>) => {
          const { id: _incId, ...incFields } = inc;
          void _incId;
          return { ...incFields, program_id: id };
        });

        const { data: incData, error: incError } = await db
          .from('program_inclusions')
          .insert(inclusionRows)
          .select();

        if (incError) {
          console.error('PUT /api/programs/[id] inclusions error:', incError);
        } else {
          insertedInclusions = incData ?? [];
        }
      }

      return NextResponse.json({ program: { ...program, program_inclusions: insertedInclusions } });
    }

    return NextResponse.json({ program });
  } catch (err) {
    console.error('PUT /api/programs/[id] unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/programs/[id]
 * Status-only update: draft → active → closed → completed. Admin only.
 * Body: { status: 'active' | 'draft' | 'closed' | 'completed' }
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = svc();
    const user = await requireAdmin(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    const validStatuses = ['draft', 'active', 'closed', 'completed'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    const { data: program, error } = await db
      .from('programs')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Program not found' }, { status: 404 });
      }
      console.error('PATCH /api/programs/[id] error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ program });
  } catch (err) {
    console.error('PATCH /api/programs/[id] unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
