import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { sendTemplatedEmail } from '@/lib/email';

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

const sendEmailSchema = z.object({
  to: z.string().email('Invalid recipient email address'),
  templateKey: z.string().min(1, 'templateKey is required'),
  variables: z.record(z.string(), z.string()).default({}),
});

// ---------------------------------------------------------------------------
// POST /api/email/send
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  try {
    // --- Auth gate: require authenticated admin user ---------------------
    const auth = req.headers.get('authorization');
    if (!auth?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser(auth.slice(7));
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // --- Validate body ---------------------------------------------------
    const body = await req.json();
    const parsed = sendEmailSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    // --- Send email ------------------------------------------------------
    const result = await sendTemplatedEmail(parsed.data);

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Unknown error sending email';
    console.error('[POST /api/email/send]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
