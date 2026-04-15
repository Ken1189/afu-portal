import { NextRequest, NextResponse } from 'next/server';

// ---------------------------------------------------------------------------
// PDF Generation API
// ---------------------------------------------------------------------------
// Accepts a POST with { type, data } and returns a print-optimized HTML page
// that can be saved as PDF via the browser's print dialog.
// ---------------------------------------------------------------------------

type DocType = 'invoice' | 'contract' | 'report' | 'receipt' | 'certificate';

interface GenerateRequest {
  type: DocType;
  data: Record<string, unknown>;
}

// Shared styles injected into every generated document
const BASE_STYLES = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1B2A4A; line-height: 1.5; padding: 40px; }
  @media print {
    body { padding: 20px; }
    .no-print { display: none !important; }
    @page { margin: 15mm; size: A4; }
  }
  table { width: 100%; border-collapse: collapse; }
  th, td { padding: 8px 12px; text-align: left; }
  th { background: #f8faf9; font-weight: 600; font-size: 13px; text-transform: uppercase; letter-spacing: 0.03em; color: #1B2A4A; }
  td { border-bottom: 1px solid #e5e7eb; font-size: 14px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; padding-bottom: 20px; border-bottom: 3px solid #5DB347; }
  .logo-area h1 { font-size: 22px; color: #1B2A4A; font-weight: 700; }
  .logo-area p { font-size: 12px; color: #6b7280; }
  .doc-title { font-size: 28px; font-weight: 700; color: #5DB347; text-align: right; }
  .doc-meta { font-size: 13px; color: #6b7280; text-align: right; margin-top: 4px; }
  .section { margin-bottom: 24px; }
  .section-title { font-size: 14px; font-weight: 600; color: #1B2A4A; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.03em; }
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
  .detail-block p { font-size: 14px; margin-bottom: 2px; }
  .detail-block .label { font-size: 12px; color: #6b7280; font-weight: 500; }
  .totals { margin-left: auto; width: 280px; }
  .totals tr td { font-size: 14px; }
  .totals .grand-total td { font-weight: 700; font-size: 16px; border-top: 2px solid #1B2A4A; padding-top: 8px; color: #1B2A4A; }
  .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #9ca3af; text-align: center; }
  .print-btn { position: fixed; bottom: 24px; right: 24px; background: #5DB347; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-size: 15px; font-weight: 600; cursor: pointer; box-shadow: 0 4px 12px rgba(93,179,71,0.3); }
  .print-btn:hover { background: #449933; }
`;

function wrapHtml(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} - African Farming Union</title>
  <style>${BASE_STYLES}</style>
</head>
<body>
  ${body}
  <button class="print-btn no-print" onclick="window.print()">Download PDF</button>
  <script>
    // Auto-trigger print dialog after a brief delay for rendering
    setTimeout(() => { if (window.matchMedia('print').matches === false) { /* ready */ } }, 500);
  </script>
</body>
</html>`;
}

function generateInvoiceHtml(data: Record<string, unknown>): string {
  const items = (data.items as Array<Record<string, unknown>>) || [];
  const itemRows = items
    .map(
      (item, i) =>
        `<tr>
          <td>${i + 1}</td>
          <td>${item.description || item.name || '-'}</td>
          <td style="text-align:right">${item.quantity || 0}</td>
          <td style="text-align:right">${data.currency || 'USD'} ${Number(item.unit_price || 0).toFixed(2)}</td>
          <td style="text-align:right">${data.currency || 'USD'} ${Number(item.total || 0).toFixed(2)}</td>
        </tr>`
    )
    .join('');

  return wrapHtml(`Invoice ${data.invoice_number || ''}`, `
    <div class="header">
      <div class="logo-area">
        <h1>African Farming Union</h1>
        <p>By Farmers, For Farmers</p>
        <p style="margin-top:8px">info@africanfarmingunion.org</p>
      </div>
      <div>
        <div class="doc-title">INVOICE</div>
        <div class="doc-meta">${data.invoice_number || ''}</div>
      </div>
    </div>

    <div class="grid-2 section">
      <div class="detail-block">
        <div class="label">Bill To</div>
        <p><strong>${data.customer_name || '-'}</strong></p>
        <p>${data.customer_address || ''}</p>
        <p>${data.customer_email || ''}</p>
      </div>
      <div class="detail-block" style="text-align:right">
        <p><span class="label">Date:</span> ${data.date || '-'}</p>
        <p><span class="label">Due Date:</span> ${data.due_date || '-'}</p>
        <p><span class="label">Status:</span> ${data.status || 'Pending'}</p>
      </div>
    </div>

    <div class="section">
      <table>
        <thead>
          <tr>
            <th style="width:40px">#</th>
            <th>Description</th>
            <th style="text-align:right">Qty</th>
            <th style="text-align:right">Unit Price</th>
            <th style="text-align:right">Amount</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>
    </div>

    <div class="totals">
      <table>
        <tr><td>Subtotal</td><td style="text-align:right">${data.currency || 'USD'} ${Number(data.subtotal || 0).toFixed(2)}</td></tr>
        <tr><td>Tax</td><td style="text-align:right">${data.currency || 'USD'} ${Number(data.tax || 0).toFixed(2)}</td></tr>
        <tr><td>Shipping</td><td style="text-align:right">${data.currency || 'USD'} ${Number(data.shipping || 0).toFixed(2)}</td></tr>
        <tr class="grand-total"><td>Total</td><td style="text-align:right">${data.currency || 'USD'} ${Number(data.total || 0).toFixed(2)}</td></tr>
      </table>
    </div>

    ${data.payment_instructions ? `<div class="section" style="margin-top:32px"><div class="section-title">Payment Instructions</div><p style="font-size:14px">${data.payment_instructions}</p></div>` : ''}

    <div class="footer">
      <p>African Farming Union &middot; info@africanfarmingunion.org &middot; africanfarmingunion.org</p>
      <p style="margin-top:4px">Thank you for your business. This invoice was generated electronically.</p>
    </div>
  `);
}

function generateReceiptHtml(data: Record<string, unknown>): string {
  return wrapHtml(`Receipt ${data.receipt_number || ''}`, `
    <div class="header">
      <div class="logo-area">
        <h1>African Farming Union</h1>
        <p>Warehouse Receipt System</p>
      </div>
      <div>
        <div class="doc-title">WAREHOUSE RECEIPT</div>
        <div class="doc-meta">${data.receipt_number || ''}</div>
      </div>
    </div>

    <div class="grid-2 section">
      <div class="detail-block">
        <div class="label">Depositor</div>
        <p><strong>${data.farmer_name || '-'}</strong></p>
        <p>Farmer ID: ${data.farmer_id || '-'}</p>
      </div>
      <div class="detail-block" style="text-align:right">
        <p><span class="label">Date:</span> ${data.date || '-'}</p>
        <p><span class="label">Status:</span> ${data.status || '-'}</p>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Commodity Details</div>
      <table>
        <thead><tr><th>Field</th><th style="text-align:right">Value</th></tr></thead>
        <tbody>
          <tr><td>Commodity</td><td style="text-align:right">${data.commodity || '-'}</td></tr>
          <tr><td>Grade</td><td style="text-align:right">${data.grade || '-'}</td></tr>
          <tr><td>Bags</td><td style="text-align:right">${data.bags || '-'}</td></tr>
          <tr><td>Gross Weight</td><td style="text-align:right">${Number(data.gross_weight_kg || 0).toFixed(1)} kg</td></tr>
          <tr><td>Tare Weight</td><td style="text-align:right">${Number(data.tare_weight_kg || 0).toFixed(1)} kg</td></tr>
          <tr><td>Net Weight</td><td style="text-align:right"><strong>${Number(data.net_weight_kg || 0).toFixed(1)} kg</strong></td></tr>
          <tr><td>Unit Price</td><td style="text-align:right">${data.currency || 'USD'} ${Number(data.unit_price || 0).toFixed(2)}/kg</td></tr>
        </tbody>
      </table>
    </div>

    <div style="text-align:right;font-size:18px;font-weight:700;color:#1B2A4A;margin-top:16px">
      Total Value: ${data.currency || 'USD'} ${Number(data.total_value || 0).toFixed(2)}
    </div>

    <div class="footer">
      <p>African Farming Union &middot; Warehouse Receipt System</p>
      <p style="margin-top:4px">This receipt confirms deposit of the above commodity in an AFU-certified warehouse.</p>
    </div>
  `);
}

function generateCertificateHtml(data: Record<string, unknown>): string {
  return wrapHtml(`Certificate - ${data.farmer_name || ''}`, `
    <div style="border:4px double #5DB347; padding:48px; min-height:680px; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center;">
      <div style="border:2px solid #D4A843; padding:40px; width:100%;">
        <h1 style="font-size:16px;color:#5DB347;letter-spacing:0.15em;text-transform:uppercase;margin-bottom:8px;">African Farming Union</h1>
        <div style="font-size:32px;font-weight:700;color:#1B2A4A;margin:16px 0;">Certificate of Completion</div>
        <div style="width:80px;height:3px;background:#D4A843;margin:16px auto;"></div>
        <p style="font-size:14px;color:#6b7280;margin-bottom:24px;">This certifies that</p>
        <div style="font-size:28px;font-weight:700;color:#1B2A4A;margin-bottom:24px;">${data.farmer_name || '-'}</div>
        <p style="font-size:14px;color:#6b7280;margin-bottom:8px;">has successfully completed the course</p>
        <div style="font-size:20px;font-weight:600;color:#5DB347;margin-bottom:24px;">${data.course_title || '-'}</div>
        <div style="display:flex;justify-content:center;gap:48px;margin-top:32px;font-size:13px;color:#6b7280;">
          <div><div class="label">Date of Completion</div><p style="font-weight:600;color:#1B2A4A;">${data.completion_date || '-'}</p></div>
          <div><div class="label">Certificate No.</div><p style="font-weight:600;color:#1B2A4A;">${data.certificate_number || '-'}</p></div>
        </div>
        <div style="margin-top:48px;padding-top:16px;border-top:1px solid #e5e7eb;">
          <p style="font-size:12px;color:#9ca3af;">African Farming Union &middot; Education &amp; Training Division</p>
          <p style="font-size:11px;color:#9ca3af;margin-top:4px;">africanfarmingunion.org</p>
        </div>
      </div>
    </div>
  `);
}

function generateGenericHtml(type: string, data: Record<string, unknown>): string {
  const entries = Object.entries(data)
    .filter(([, v]) => v !== null && v !== undefined)
    .map(([k, v]) => `<tr><td style="font-weight:500">${k.replace(/_/g, ' ')}</td><td>${typeof v === 'object' ? JSON.stringify(v) : String(v)}</td></tr>`)
    .join('');

  return wrapHtml(`${type.charAt(0).toUpperCase() + type.slice(1)}`, `
    <div class="header">
      <div class="logo-area">
        <h1>African Farming Union</h1>
        <p>By Farmers, For Farmers</p>
      </div>
      <div>
        <div class="doc-title">${type.toUpperCase()}</div>
      </div>
    </div>
    <div class="section">
      <table><thead><tr><th>Field</th><th>Value</th></tr></thead><tbody>${entries}</tbody></table>
    </div>
    <div class="footer"><p>African Farming Union &middot; africanfarmingunion.org</p></div>
  `);
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as GenerateRequest;
    const { type, data } = body;

    if (!type || !data) {
      return NextResponse.json({ error: 'Missing required fields: type and data' }, { status: 400 });
    }

    let html: string;

    switch (type) {
      case 'invoice':
        html = generateInvoiceHtml(data);
        break;
      case 'receipt':
        html = generateReceiptHtml(data);
        break;
      case 'certificate':
        html = generateCertificateHtml(data);
        break;
      case 'contract':
      case 'report':
      default:
        html = generateGenericHtml(type, data);
        break;
    }

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="${type}-${Date.now()}.html"`,
      },
    });
  } catch (err) {
    console.error("[pdf/generate] non-critical:", err);
    return NextResponse.json({ error: 'Failed to generate document' }, { status: 500 });
  }
}
