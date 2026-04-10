/**
 * POST /api/contracts/send
 * Sends a contract/proposal by email with a professional branded HTML template.
 * Body: { contractId: string }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/email';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Map document_type to a human-readable label. */
function documentLabel(docType: string | null): string {
  const map: Record<string, string> = {
    contract: 'Contract',
    proposal: 'Proposal',
    agreement: 'Agreement',
    mou: 'Memorandum of Understanding',
    nda: 'Non-Disclosure Agreement',
    invoice: 'Invoice',
    addendum: 'Addendum',
  };
  return map[(docType ?? 'contract').toLowerCase()] ?? 'Document';
}

/** Short type code for the reference number. */
function typeCode(docType: string | null): string {
  const map: Record<string, string> = {
    contract: 'CON',
    proposal: 'PRO',
    agreement: 'AGR',
    mou: 'MOU',
    nda: 'NDA',
    invoice: 'INV',
    addendum: 'ADD',
  };
  return map[(docType ?? 'contract').toLowerCase()] ?? 'DOC';
}

/** Format a date string to a readable format, or return null. */
function fmtDate(d: string | null | undefined): string | null {
  if (!d) return null;
  try {
    return new Date(d).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return d;
  }
}

/** Format percentage values. */
function fmtPct(v: number | null | undefined): string | null {
  if (v == null) return null;
  return `${v}%`;
}

/** Format currency values. */
function fmtCurrency(v: number | null | undefined): string | null {
  if (v == null) return null;
  return `$${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ---------------------------------------------------------------------------
// HTML email template builder
// ---------------------------------------------------------------------------

function buildEmailHtml(contract: Record<string, unknown>): string {
  const label = documentLabel(contract.document_type as string);
  const code = typeCode(contract.document_type as string);
  const year = new Date().getFullYear();
  const idShort = (contract.id as string).substring(0, 6).toUpperCase();
  const reference = `AFU-${code}-${year}-${idShort}`;

  const viewUrl = `https://africanfarmingunion.org/admin/contracts?view=${contract.id}`;

  // Build key terms rows — skip nulls
  const terms: [string, string | null][] = [
    ['Contract Type', contract.contract_type as string | null],
    ['Payment Terms', contract.payment_terms as string | null],
    ['Territory', contract.territory as string | null],
    ['Exclusivity', contract.exclusivity != null ? (contract.exclusivity ? 'Yes' : 'No') : null],
    ['Commission Rate', fmtPct(contract.commission_rate as number | null)],
    ['Discount Rate', fmtPct(contract.discount_rate as number | null)],
    ['Minimum Order Value', fmtCurrency(contract.minimum_order_value as number | null)],
    ['Start Date', fmtDate(contract.start_date as string | null)],
    ['End Date', fmtDate(contract.end_date as string | null)],
    ['Auto Renew', contract.auto_renew != null ? (contract.auto_renew ? 'Yes' : 'No') : null],
  ];

  const termRows = terms
    .filter(([, v]) => v != null)
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;color:#6b7280;font-size:14px;width:40%;">${label}</td>
          <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;color:#1B2A4A;font-size:14px;font-weight:600;">${value}</td>
        </tr>`,
    )
    .join('');

  const descriptionBlock =
    contract.description
      ? `
        <div style="margin:28px 0 0;">
          <h3 style="color:#1B2A4A;font-size:15px;margin:0 0 8px;font-weight:600;">Description</h3>
          <p style="color:#374151;font-size:14px;line-height:1.6;margin:0;white-space:pre-line;">${escapeHtml(contract.description as string)}</p>
        </div>`
      : '';

  const notesBlock =
    contract.notes
      ? `
        <div style="margin:20px 0 0;">
          <h3 style="color:#1B2A4A;font-size:15px;margin:0 0 8px;font-weight:600;">Additional Notes</h3>
          <p style="color:#374151;font-size:14px;line-height:1.6;margin:0;white-space:pre-line;">${escapeHtml(contract.notes as string)}</p>
        </div>`
      : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${label}: ${escapeHtml(contract.title as string)}</title>
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          <!-- Header -->
          <tr>
            <td style="background-color:#1B2A4A;padding:28px 32px;border-radius:12px 12px 0 0;text-align:center;">
              <img src="https://africanfarmingunion.org/afu-logo.svg" alt="African Farming Union" width="180" style="display:block;margin:0 auto 12px;" />
              <p style="margin:0;color:#5DB347;font-size:13px;letter-spacing:1px;text-transform:uppercase;font-weight:600;">Official ${label}</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background-color:#ffffff;padding:36px 32px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
              <!-- Title -->
              <h1 style="margin:0 0 4px;color:#1B2A4A;font-size:22px;font-weight:700;">${label}: ${escapeHtml(contract.title as string)}</h1>
              <p style="margin:0 0 20px;color:#6b7280;font-size:13px;">Reference: <strong>${reference}</strong></p>

              <!-- Parties -->
              <div style="background-color:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px 18px;margin-bottom:28px;">
                <p style="margin:0;color:#374151;font-size:14px;line-height:1.7;">
                  Between <strong style="color:#1B2A4A;">African Farming Union</strong><br />
                  and <strong style="color:#1B2A4A;">${escapeHtml(contract.party_name as string)}</strong>
                </p>
              </div>

              <!-- Key Terms Table -->
              ${termRows
                ? `<h3 style="color:#1B2A4A;font-size:15px;margin:0 0 12px;font-weight:600;">Key Terms</h3>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;margin-bottom:8px;">
                ${termRows}
              </table>`
                : ''}

              <!-- Description / Notes -->
              ${descriptionBlock}
              ${notesBlock}

              <!-- CTA -->
              <div style="text-align:center;margin:36px 0 8px;">
                <a href="${viewUrl}" style="display:inline-block;background-color:#5DB347;color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:8px;font-size:16px;font-weight:600;letter-spacing:0.3px;">View &amp; Sign Document</a>
              </div>
              <p style="text-align:center;color:#9ca3af;font-size:12px;margin:8px 0 0;">Or copy this link into your browser:<br/><a href="${viewUrl}" style="color:#5DB347;word-break:break-all;">${viewUrl}</a></p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#1B2A4A;padding:24px 32px;border-radius:0 0 12px 12px;text-align:center;">
              <p style="margin:0 0 4px;color:#ffffff;font-size:14px;font-weight:600;">African Farming Union</p>
              <p style="margin:0 0 12px;color:#9ca3af;font-size:12px;">Empowering Africa's Agricultural Future</p>
              <p style="margin:0;color:#6b7280;font-size:11px;">
                This email was sent by the African Farming Union portal.<br />
                If you did not expect this document, please contact
                <a href="mailto:info@africanfarmingunion.org" style="color:#5DB347;">info@africanfarmingunion.org</a>.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** Basic HTML escaping. */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ---------------------------------------------------------------------------
// POST handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    // --- Auth: require admin ---
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const admin = await createAdminClient();

    const { data: profile } = await admin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // --- Parse body ---
    const body = await request.json();
    const { contractId } = body;

    if (!contractId) {
      return NextResponse.json({ error: 'contractId is required' }, { status: 400 });
    }

    // --- Fetch contract ---
    const { data: contract, error: fetchErr } = await admin
      .from('contracts')
      .select('*')
      .eq('id', contractId)
      .single();

    if (fetchErr || !contract) {
      return NextResponse.json(
        { error: 'Contract not found' },
        { status: 404 },
      );
    }

    if (!contract.party_email) {
      return NextResponse.json(
        { error: 'Contract has no party_email — cannot send' },
        { status: 422 },
      );
    }

    // --- Build & send email ---
    const label = documentLabel(contract.document_type);
    const subject = `${label}: ${contract.title} — African Farming Union`;
    const html = buildEmailHtml(contract);

    const result = await sendEmail(
      contract.party_email,
      subject,
      html,
      undefined, // use default FROM
      'info@africanfarmingunion.org',
    );

    // --- Update contract status & record sent timestamp ---
    const now = new Date().toISOString();
    const updates: Record<string, unknown> = {};

    if (contract.status === 'draft') {
      updates.status = 'pending_signature';
    }

    // Append a sent note with timestamp
    const sentNote = `Emailed to ${contract.party_email} on ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`;
    updates.notes = contract.notes
      ? `${contract.notes}\n\n---\n${sentNote}`
      : sentNote;

    // Use sent_at if the column exists, otherwise just notes
    updates.sent_at = now;

    await admin.from('contracts').update(updates).eq('id', contractId);

    // --- Audit log ---
    await admin.from('audit_log').insert({
      user_id: user.id,
      action: 'contract_emailed',
      entity_type: 'contract',
      entity_id: contractId,
      metadata: {
        party_email: contract.party_email,
        document_type: contract.document_type,
        message_id: result.messageId,
      },
    }).then(() => {/* ignore errors */}, () => {/* ignore */});

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      sentTo: contract.party_email,
      statusUpdated: contract.status === 'draft' ? 'pending_signature' : contract.status,
    });
  } catch (err: unknown) {
    console.error('[contracts/send] error:', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
