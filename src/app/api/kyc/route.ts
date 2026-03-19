import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase/server';

async function getAuthMember(supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const adminClient = await createAdminClient();
  const { data: member } = await adminClient.from('members').select('id').eq('profile_id', user.id).single();
  return member ? { userId: user.id, memberId: member.id } : null;
}

/**
 * GET /api/kyc
 * Returns member's KYC documents, latest verification, and calculated tier.
 */
export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const auth = await getAuthMember(supabase);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const adminClient = await createAdminClient();

  // Fetch KYC documents
  const { data: documents, error: docsError } = await adminClient
    .from('kyc_documents')
    .select('*')
    .eq('member_id', auth.memberId)
    .order('created_at', { ascending: false });

  if (docsError) {
    return NextResponse.json({ error: docsError.message }, { status: 500 });
  }

  // Fetch latest KYC verification
  const { data: verification, error: verError } = await adminClient
    .from('kyc_verifications')
    .select('*')
    .eq('member_id', auth.memberId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (verError) {
    return NextResponse.json({ error: verError.message }, { status: 500 });
  }

  // Calculate tier based on documents and verification status
  let tier = 'basic';
  if (verification?.status === 'approved') {
    const approvedDocs = documents?.filter((d) => d.status === 'approved') || [];
    if (approvedDocs.length >= 3) {
      tier = 'full';
    } else if (approvedDocs.length >= 1) {
      tier = 'intermediate';
    }
  }

  return NextResponse.json({
    documents,
    verification,
    tier,
  });
}

/**
 * POST /api/kyc
 * Submit a KYC document.
 * Body: { documentType, documentNumber, fileUrl, expiresAt? }
 */
export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const auth = await getAuthMember(supabase);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { documentType, documentNumber, fileUrl, expiresAt } = body as {
    documentType: string;
    documentNumber: string;
    fileUrl: string;
    expiresAt?: string;
  };

  if (!documentType || !documentNumber || !fileUrl) {
    return NextResponse.json(
      { error: 'Missing required fields: documentType, documentNumber, fileUrl' },
      { status: 400 }
    );
  }

  const adminClient = await createAdminClient();

  const { data: document, error } = await adminClient
    .from('kyc_documents')
    .insert({
      member_id: auth.memberId,
      document_type: documentType,
      document_number: documentNumber,
      file_url: fileUrl,
      expires_at: expiresAt || null,
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Audit log
  await adminClient.from('audit_log').insert({
    user_id: auth.userId,
    action: 'create',
    entity_type: 'kyc_document',
    entity_id: document.id,
    details: { document_type: documentType },
  });

  return NextResponse.json({ document }, { status: 201 });
}
