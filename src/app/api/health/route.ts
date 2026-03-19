import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { version } from '../../../../package.json';

/**
 * GET /api/health
 * Health check endpoint — tests Supabase connectivity via the members table.
 */
export async function GET() {
  const checks: Record<string, { status: string; latency?: number; error?: string }> = {};

  // Supabase connectivity check
  const start = Date.now();
  try {
    const svc = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { error } = await svc
      .from('members')
      .select('*', { count: 'exact', head: true });

    checks.supabase = {
      status: error ? 'degraded' : 'ok',
      latency: Date.now() - start,
      ...(error ? { error: error.message } : {}),
    };
  } catch (err) {
    checks.supabase = {
      status: 'degraded',
      latency: Date.now() - start,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }

  const allOk = Object.values(checks).every(c => c.status === 'ok');

  return NextResponse.json(
    {
      status: allOk ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      version,
      checks,
    },
    { status: allOk ? 200 : 503 }
  );
}
