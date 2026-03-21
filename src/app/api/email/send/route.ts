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
  variables: z.record(z.string()).default({}),
});

// ---------------------------------------------------------------------------
// Auth helpers
// ---------------------------------------------------------------------------

/** Returns true when the request carries a valid service-role key. */
function hasServiceRoleKey(req: NextRequest): boolean {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return false;
  return auth.slice(7) === process.env.SUPABASE_SERVICE_ROLE_KEY;
}

/** Returns true when the authenticated Supabase user has role = 'admin'. */
async function isAdminUser(req: NextRequest): Promise<boolean> {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return false;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  // Verify the JWT and get the user
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(auth.slice(7));
  if (error || !user) return false;

  // Check the profiles table for admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  return profile?.role === 'admin';
}

// ---------------------------------------------------------------------------
// POST /api/email/send
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  try {
    // --- Auth gate -------------------------------------------------------
    const isService = hasServiceRoleKey(req);
    const isAdmin = !isService ? await isAdminUser(req) : false;

    if (!isService && !isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized — admin or service role required' },
        { status: 401 },
      );
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
