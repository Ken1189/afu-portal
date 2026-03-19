import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase/server';

const ALLOWED_ENTITIES = ['membership_applications', 'loans', 'claims'] as const;
type ApproveEntity = (typeof ALLOWED_ENTITIES)[number];

const ALLOWED_ACTIONS = ['approve', 'reject'] as const;
type ApproveAction = (typeof ALLOWED_ACTIONS)[number];

/**
 * POST /api/admin/bulk/approve
 *
 * Bulk approve or reject items across supported entities.
 * Body: { entity, ids, action, reason? }
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

    let body: {
      entity?: string;
      ids?: string[];
      action?: string;
      reason?: string;
    };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { entity, ids, action, reason } = body;

    // Validate entity
    if (!entity || !ALLOWED_ENTITIES.includes(entity as ApproveEntity)) {
      return NextResponse.json(
        { error: `Invalid entity. Must be one of: ${ALLOWED_ENTITIES.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate action
    if (!action || !ALLOWED_ACTIONS.includes(action as ApproveAction)) {
      return NextResponse.json(
        { error: `Invalid action. Must be one of: ${ALLOWED_ACTIONS.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate ids
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'ids must be a non-empty array of strings' },
        { status: 400 }
      );
    }

    if (ids.length > 500) {
      return NextResponse.json(
        { error: 'Cannot process more than 500 items at once' },
        { status: 400 }
      );
    }

    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    let processed = 0;
    let failed = 0;

    // Build update payload
    const updatePayload: Record<string, unknown> = {
      status: newStatus,
      updated_at: new Date().toISOString(),
    };

    // Some entities may have a reason/notes field
    if (reason) {
      updatePayload.review_notes = reason;
    }

    // Perform the bulk update
    const { data: updatedRows, error: updateError } = await adminClient
      .from(entity)
      .update(updatePayload)
      .in('id', ids)
      .select('id');

    if (updateError) {
      console.error('Bulk approve update error:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    processed = updatedRows?.length ?? 0;
    failed = ids.length - processed;

    // Create audit_log entries for each processed item
    const auditEntries = (updatedRows ?? []).map((row) => ({
      user_id: user.id,
      action: `bulk_${action}`,
      entity_type: entity,
      entity_id: row.id,
      details: {
        new_status: newStatus,
        reason: reason || null,
        performed_by: user.email,
      },
    }));

    if (auditEntries.length > 0) {
      // Insert audit entries in batches of 100 to avoid payload limits
      for (let i = 0; i < auditEntries.length; i += 100) {
        const batch = auditEntries.slice(i, i + 100);
        await adminClient.from('audit_log').insert(batch);
      }
    }

    return NextResponse.json({ processed, failed });
  } catch (err) {
    console.error('Bulk approve error:', err);
    return NextResponse.json({ error: 'Failed to process bulk action' }, { status: 500 });
  }
}
