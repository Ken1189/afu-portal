import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function svc() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * POST /api/programs/[id]/enroll
 * Member applies to a program. Requires authentication.
 * Body: { farm_size_ha, farm_location, notes, financing_requested }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = svc();
    const { id: programId } = await params;

    // Authenticate user
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.slice(7);

    const { data: { user }, error: authError } = await db.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch the program to confirm it exists and is open
    const { data: program, error: programError } = await db
      .from('programs')
      .select('id, status, max_participants, current_participants')
      .eq('id', programId)
      .single();

    if (programError || !program) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 });
    }

    if (program.status !== 'active') {
      return NextResponse.json(
        { error: 'This program is not currently accepting applications.' },
        { status: 400 }
      );
    }

    if (
      program.max_participants !== null &&
      program.current_participants >= program.max_participants
    ) {
      return NextResponse.json(
        { error: 'This program has reached its maximum number of participants.' },
        { status: 400 }
      );
    }

    // Resolve member_id from the authenticated user's profile
    const { data: profile } = await db
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Resolve member record linked to this profile
    const { data: member } = await db
      .from('members')
      .select('id')
      .eq('profile_id', profile.id)
      .single();

    if (!member) {
      return NextResponse.json(
        { error: 'No member record found for this account.' },
        { status: 404 }
      );
    }

    // Check for duplicate enrollment
    const { data: existing } = await db
      .from('program_enrollments')
      .select('id, status')
      .eq('program_id', programId)
      .eq('member_id', member.id)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: `You have already applied to this program (status: ${existing.status}).` },
        { status: 409 }
      );
    }

    const body = await req.json();
    const { farm_size_ha, farm_location, notes, financing_requested } = body;

    // Create enrollment
    const { data: enrollment, error: enrollError } = await db
      .from('program_enrollments')
      .insert({
        program_id: programId,
        member_id: member.id,
        status: 'applied',
        current_stage: 'discover',
        farm_size_ha: farm_size_ha ?? null,
        farm_location: farm_location ?? null,
        notes: notes ?? null,
        financing_requested: financing_requested ?? false,
        applied_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (enrollError) {
      console.error('POST /api/programs/[id]/enroll enrollment error:', enrollError);
      return NextResponse.json({ error: enrollError.message }, { status: 500 });
    }

    // Increment current_participants on the program
    const { error: updateError } = await db
      .from('programs')
      .update({
        current_participants: (program.current_participants ?? 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', programId);

    if (updateError) {
      console.error('POST /api/programs/[id]/enroll participant count update error:', updateError);
      // Non-fatal — enrollment was created
    }

    // Record initial stage history
    await db.from('program_stage_history').insert({
      enrollment_id: enrollment.id,
      stage: 'discover',
      notes: 'Application submitted',
      updated_by: user.id,
    });

    return NextResponse.json({ enrollment }, { status: 201 });
  } catch (err) {
    console.error('POST /api/programs/[id]/enroll unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
