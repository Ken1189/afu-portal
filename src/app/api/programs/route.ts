import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function svc() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * GET /api/programs
 * Query params: ?country=Uganda &status=active &crop=Coffee &status=all
 */
export async function GET(req: NextRequest) {
  try {
    const db = svc();
    const { searchParams } = new URL(req.url);
    const country = searchParams.get('country');
    const status = searchParams.get('status');
    const crop = searchParams.get('crop');

    let query = db
      .from('programs')
      .select(`
        *,
        program_inclusions (*)
      `)
      .order('created_at', { ascending: false });

    // Only filter by status if a specific status is requested.
    // "all" means no status filter.
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (country) {
      query = query.eq('country', country);
    }

    if (crop) {
      query = query.eq('crop', crop);
    }

    const { data, error } = await query;

    if (error) {
      console.error('GET /api/programs error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ programs: data ?? [] });
  } catch (err) {
    console.error('GET /api/programs unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/programs
 * Body: all program fields + inclusions array
 * Admin only (validated via service role + auth header check)
 */
export async function POST(req: NextRequest) {
  try {
    const db = svc();

    // Verify admin auth — check Authorization header contains a valid admin user
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.slice(7);

    // Validate the token against Supabase auth
    const { data: { user }, error: authError } = await db.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await db
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { inclusions, ...programFields } = body;

    // Generate slug from title
    const slug = programFields.title
      ? programFields.title
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .slice(0, 80)
      : undefined;

    // Insert program
    const { data: program, error: programError } = await db
      .from('programs')
      .insert({
        ...programFields,
        slug,
        created_by: user.id,
        current_participants: 0,
      })
      .select()
      .single();

    if (programError) {
      console.error('POST /api/programs program insert error:', programError);
      return NextResponse.json({ error: programError.message }, { status: 500 });
    }

    // Insert inclusions if provided
    let insertedInclusions: unknown[] = [];
    if (Array.isArray(inclusions) && inclusions.length > 0) {
      const inclusionRows = inclusions.map((inc: Record<string, unknown>) => ({
        ...inc,
        program_id: program.id,
      }));

      const { data: incData, error: incError } = await db
        .from('program_inclusions')
        .insert(inclusionRows)
        .select();

      if (incError) {
        console.error('POST /api/programs inclusions insert error:', incError);
        // Non-fatal — program was created, log inclusion failure
      } else {
        insertedInclusions = incData ?? [];
      }
    }

    return NextResponse.json(
      { program: { ...program, program_inclusions: insertedInclusions } },
      { status: 201 }
    );
  } catch (err) {
    console.error('POST /api/programs unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
