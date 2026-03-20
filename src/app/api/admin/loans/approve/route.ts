import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll() {},
        },
      }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const svc = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Verify admin role
    const { data: profile } = await svc
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { loanId, action, notes } = body as {
      loanId: string;
      action: 'approve' | 'reject';
      notes?: string;
    };

    if (!loanId || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request: loanId and action (approve|reject) required' }, { status: 400 });
    }

    const newStatus = action === 'approve' ? 'approved' : 'rejected';

    const { data: loan, error: updateError } = await svc
      .from('loans')
      .update({
        status: newStatus,
        approved_by: user.id,
        approved_at: new Date().toISOString(),
        ...(notes ? { purpose: notes } : {}),
        updated_at: new Date().toISOString(),
      })
      .eq('id', loanId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Log to audit
    await svc.from('audit_log').insert({
      user_id: user.id,
      action: `loan_${action}`,
      entity_type: 'loan',
      entity_id: loanId,
      details: { status: newStatus, notes },
    });

    return NextResponse.json({ success: true, loan });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
