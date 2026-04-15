import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase/server';

/**
 * GET /api/admin/audit/export
 * Export audit trail with filtering by date range, action, entity type, and user.
 * Returns CSV data.
 *
 * Query params:
 *   from - ISO date string (start of range)
 *   to - ISO date string (end of range)
 *   action - filter by action type
 *   entity_type - filter by entity type
 *   user_id - filter by acting user
 *   format - 'csv' (default) or 'json'
 *   limit - max rows (default 5000, max 10000)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const db = await createAdminClient();

    // Verify admin
    const { data: profile } = await db.from('profiles').select('role').eq('id', user.id).single();
    if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden: admin access required' }, { status: 403 });
    }

    const params = request.nextUrl.searchParams;
    const from = params.get('from');
    const to = params.get('to');
    const action = params.get('action');
    const entityType = params.get('entity_type');
    const userId = params.get('user_id');
    const format = params.get('format') || 'csv';
    const limit = Math.min(parseInt(params.get('limit') || '5000', 10), 10000);

    // Build query
    let query = db
      .from('audit_log')
      .select('id, user_id, action, entity_type, entity_id, details, created_at')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (from) query = query.gte('created_at', from);
    if (to) query = query.lte('created_at', to);
    if (action) query = query.eq('action', action);
    if (entityType) query = query.eq('entity_type', entityType);
    if (userId) query = query.eq('user_id', userId);

    const { data: rows, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const entries = rows || [];

    if (format === 'json') {
      return NextResponse.json({
        total: entries.length,
        from: from || 'all',
        to: to || 'all',
        entries,
      });
    }

    // CSV format
    const csvHeaders = ['id', 'timestamp', 'user_id', 'action', 'entity_type', 'entity_id', 'details'];
    const csvRows = entries.map((e) => [
      e.id,
      e.created_at,
      e.user_id || '',
      e.action,
      e.entity_type || '',
      e.entity_id || '',
      JSON.stringify(e.details || {}).replace(/"/g, '""'),
    ]);

    const csv = [
      csvHeaders.join(','),
      ...csvRows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="afu-audit-log-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (err) {
    console.error('[admin/audit/export] error:', err);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
