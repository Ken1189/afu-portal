import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase/server';

/**
 * GET /api/suppliers/[id]
 * Get a single supplier by ID.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Supplier not found' }, { status: 404 });
  }

  return NextResponse.json({ supplier: data });
}

/**
 * PATCH /api/suppliers/[id]
 * Update a supplier. Admin or supplier owner only.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  // Auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const isAdmin = (profile?.role as string) === 'admin' || (profile?.role as string) === 'super_admin';

  // Check ownership if not admin
  if (!isAdmin) {
    const { data: supplier } = await supabase
      .from('suppliers')
      .select('profile_id')
      .eq('id', id)
      .single();

    if (!supplier || supplier.profile_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  const body = await request.json();

  // Allowed fields for update
  const allowedFields = [
    'company_name', 'contact_name', 'email', 'phone', 'website',
    'logo_url', 'category', 'status', 'country', 'region', 'description',
    'verified', 'is_founding', 'sponsorship_tier', 'commission_rate',
    'member_discount_percent', 'certifications',
  ];

  const updates: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      updates[field] = body[field];
    }
  }

  const adminClient = await createAdminClient();
  const { data, error } = await adminClient
    .from('suppliers')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Audit log
  await adminClient.from('audit_log').insert({
    user_id: user.id,
    action: 'update',
    entity_type: 'supplier',
    entity_id: id,
    details: { updated_fields: Object.keys(updates) },
  });

  return NextResponse.json({ supplier: data });
}

/**
 * DELETE /api/suppliers/[id]
 * Delete a supplier. Super admin only.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if ((profile?.role as string) !== 'super_admin') {
    return NextResponse.json({ error: 'Forbidden — super admin only' }, { status: 403 });
  }

  const adminClient = await createAdminClient();
  const { error } = await adminClient
    .from('suppliers')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Audit log
  await adminClient.from('audit_log').insert({
    user_id: user.id,
    action: 'delete',
    entity_type: 'supplier',
    entity_id: id,
  });

  return NextResponse.json({ success: true });
}
