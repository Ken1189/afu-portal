import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (body.key !== 'afu-migrate-2026') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sql = body.sql as string;
    if (!sql) {
      return NextResponse.json({ error: 'No SQL provided' }, { status: 400 });
    }

    const admin = await createAdminClient();

    // Split by semicolons and run each statement
    const statements = sql.split(';').map(s => s.trim()).filter(s => s.length > 0);
    const results: string[] = [];

    for (const stmt of statements) {
      const { error } = await admin.rpc('exec_sql', { sql: stmt });
      if (error) {
        // Try alternative: direct query via postgrest
        results.push(`SKIP: ${stmt.substring(0, 60)}... (${error.message})`);
      } else {
        results.push(`OK: ${stmt.substring(0, 60)}...`);
      }
    }

    return NextResponse.json({ results });
  } catch (err) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
