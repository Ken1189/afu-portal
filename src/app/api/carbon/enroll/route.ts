import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { project_id, plot_id, practices } = await req.json();

    if (!project_id || !plot_id || !practices?.length) {
      return NextResponse.json(
        { error: 'project_id, plot_id and practices are required' },
        { status: 400 }
      );
    }

    // Check project is active
    const { data: project, error: projErr } = await supabase
      .from('carbon_projects')
      .select('id, status, name')
      .eq('id', project_id)
      .single();

    if (projErr || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    if (project.status !== 'active') {
      return NextResponse.json({ error: 'Project is not currently accepting enrollments' }, { status: 400 });
    }

    // Check not already enrolled
    const { data: existing } = await supabase
      .from('carbon_enrollments')
      .select('id')
      .eq('project_id', project_id)
      .eq('farmer_id', user.id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: 'You are already enrolled in this project' }, { status: 409 });
    }

    // Insert enrollment
    const { data: enrollment, error: insertErr } = await supabase
      .from('carbon_enrollments')
      .insert({
        project_id,
        farmer_id: user.id,
        plot_id,
        practices_committed: practices,
        status: 'active',
        enrolled_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertErr) {
      return NextResponse.json({ error: insertErr.message }, { status: 500 });
    }

    return NextResponse.json({ enrollment }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to enroll' }, { status: 500 });
  }
}
