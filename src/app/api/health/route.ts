import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * GET /api/health
 * Health check endpoint — tests Supabase connectivity.
 */
export async function GET() {
  const checks: Record<string, { status: string; latency?: number }> = {};

  // Supabase connectivity
  const start = Date.now();
  try {
    const svc = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { error } = await svc.from('profiles').select('id').limit(1);
    checks.supabase = {
      status: error ? 'degraded' : 'healthy',
      latency: Date.now() - start,
    };
  } catch {
    checks.supabase = { status: 'unhealthy', latency: Date.now() - start };
  }

  const allHealthy = Object.values(checks).every(c => c.status === 'healthy');

  return NextResponse.json(
    {
      status: allHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      checks,
    },
    { status: allHealthy ? 200 : 503 }
  );
}
