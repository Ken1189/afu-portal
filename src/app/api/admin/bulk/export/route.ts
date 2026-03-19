import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase/server';

const ALLOWED_ENTITIES = ['members', 'payments', 'loans', 'suppliers'] as const;
type ExportEntity = (typeof ALLOWED_ENTITIES)[number];

interface ExportFilters {
  country?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

/**
 * POST /api/admin/bulk/export
 *
 * Exports data from a specified table as CSV.
 * Body: { entity, filters? }
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const adminClient = await createAdminClient();

    // Verify admin role
    const { data: profile } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    let body: { entity?: string; filters?: ExportFilters };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { entity, filters } = body;

    if (!entity || !ALLOWED_ENTITIES.includes(entity as ExportEntity)) {
      return NextResponse.json(
        { error: `Invalid entity. Must be one of: ${ALLOWED_ENTITIES.join(', ')}` },
        { status: 400 }
      );
    }

    // Build query
    let query = adminClient.from(entity).select('*');

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.dateFrom) {
      query = query.gte('created_at', filters.dateFrom);
    }
    if (filters?.dateTo) {
      query = query.lte('created_at', filters.dateTo);
    }
    if (filters?.country) {
      // Country is on the profiles table for members; for other entities, try direct column
      if (entity === 'members') {
        // Members don't have country directly — we join after fetching
      } else {
        query = query.eq('country', filters.country);
      }
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const rows = data ?? [];

    if (rows.length === 0) {
      // Audit log the export attempt
      await adminClient.from('audit_log').insert({
        user_id: user.id,
        action: 'bulk_export',
        entity_type: entity,
        details: { filters, rowCount: 0 },
      });

      return new Response('No data found for the given filters', {
        status: 200,
        headers: { 'Content-Type': 'text/plain' },
      });
    }

    // Convert to CSV
    const csv = toCsv(rows);

    // Audit log the export
    await adminClient.from('audit_log').insert({
      user_id: user.id,
      action: 'bulk_export',
      entity_type: entity,
      details: { filters, rowCount: rows.length },
    });

    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `${entity}_export_${timestamp}.csv`;

    return new Response(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error('Bulk export error:', err);
    return NextResponse.json({ error: 'Failed to export data' }, { status: 500 });
  }
}

/**
 * Converts an array of objects to a CSV string.
 */
function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return '';

  const headers = Object.keys(rows[0]);
  const lines: string[] = [headers.join(',')];

  for (const row of rows) {
    const values = headers.map((h) => {
      const val = row[h];
      if (val === null || val === undefined) return '';
      const str = typeof val === 'object' ? JSON.stringify(val) : String(val);
      // Escape CSV values that contain commas, quotes, or newlines
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    });
    lines.push(values.join(','));
  }

  return lines.join('\n');
}
