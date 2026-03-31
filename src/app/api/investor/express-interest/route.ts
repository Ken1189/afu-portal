import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// ── In-memory store (will be replaced with Supabase table) ────────────────
interface InvestorExpression {
  id: string;
  opportunityId: string;
  opportunityName: string;
  amount: number;
  entityName: string;
  email: string;
  phone: string;
  notes: string;
  investorName: string;
  createdAt: string;
}

const investor_expressions: InvestorExpression[] = [];

// ── POST /api/investor/express-interest ───────────────────────────────────
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      opportunityId,
      opportunityName,
      amount,
      entityName,
      email,
      phone,
      notes,
      investorName,
    } = body;

    // Basic validation
    if (!opportunityId || !opportunityName || !entityName || !email) {
      return NextResponse.json(
        { error: 'Missing required fields: opportunityId, opportunityName, entityName, email' },
        { status: 400 }
      );
    }

    const expression: InvestorExpression = {
      id: crypto.randomUUID(),
      opportunityId,
      opportunityName,
      amount: Number(amount) || 0,
      entityName,
      email,
      phone: phone || '',
      notes: notes || '',
      investorName: investorName || '',
      createdAt: new Date().toISOString(),
    };

    // Save to in-memory store
    investor_expressions.push(expression);

    // ── Try saving to Supabase ────────────────────────────────────────────
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (supabaseUrl && supabaseKey) {
        const svc = createClient(supabaseUrl, supabaseKey);
        await svc.from('investor_interests').insert({
          opportunity_id: expression.opportunityId,
          opportunity_name: expression.opportunityName,
          amount: expression.amount,
          entity_name: expression.entityName,
          email: expression.email,
          phone: expression.phone,
          notes: expression.notes,
          investor_name: expression.investorName,
          status: 'pending',
        });
      }
    } catch {
      // Table may not exist yet — that's fine
    }

    // ── Send email notification via Resend ────────────────────────────────
    try {
      const resendKey = process.env.RESEND_API_KEY;
      if (resendKey) {
        const resend = new Resend(resendKey);
        const formattedAmount = expression.amount
          ? `$${expression.amount.toLocaleString()}`
          : 'Not specified';

        await resend.emails.send({
          from: 'AFU Investor Relations <noreply@mail.africanfarmingunion.org>',
          to: ['peterw@africanfarmingunion.org', 'devonk@africanfarmingunion.org'],
          subject: `New Investment Interest: ${expression.opportunityName} — ${expression.entityName}`,
          html: `
            <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
              <div style="background: #1B2A4A; padding: 32px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 600;">
                  New Expression of Interest
                </h1>
                <p style="color: #94a3b8; margin: 8px 0 0; font-size: 14px;">
                  AFU Investor Relations
                </p>
              </div>
              <div style="padding: 32px;">
                <div style="background: #f0fdf4; border-left: 4px solid #5DB347; padding: 16px; border-radius: 0 8px 8px 0; margin-bottom: 24px;">
                  <p style="margin: 0; font-size: 14px; color: #1B2A4A; font-weight: 600;">
                    ${expression.entityName} has expressed interest in ${expression.opportunityName}
                  </p>
                </div>
                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #64748b; width: 140px;">Investor Name</td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #1B2A4A; font-weight: 500;">${expression.investorName || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #64748b;">Entity</td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #1B2A4A; font-weight: 500;">${expression.entityName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #64748b;">Opportunity</td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #1B2A4A; font-weight: 500;">${expression.opportunityName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #64748b;">Amount</td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #5DB347; font-weight: 600; font-size: 16px;">${formattedAmount}</td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #64748b;">Email</td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #1B2A4A;">
                      <a href="mailto:${expression.email}" style="color: #2563eb; text-decoration: none;">${expression.email}</a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #64748b;">Phone</td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #1B2A4A;">${expression.phone || 'Not provided'}</td>
                  </tr>
                  ${expression.notes ? `
                  <tr>
                    <td style="padding: 12px 0; color: #64748b; vertical-align: top;">Notes</td>
                    <td style="padding: 12px 0; color: #1B2A4A;">${expression.notes}</td>
                  </tr>
                  ` : ''}
                </table>
                <div style="margin-top: 24px; text-align: center;">
                  <a href="https://portal.africanfarmersunion.org/admin/investor-relations" style="display: inline-block; background: #5DB347; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
                    View in Admin Portal
                  </a>
                </div>
              </div>
              <div style="background: #f8fafc; padding: 20px 32px; text-align: center; border-top: 1px solid #e2e8f0;">
                <p style="margin: 0; font-size: 12px; color: #94a3b8;">
                  African Farmers Union — Investor Relations
                </p>
              </div>
            </div>
          `,
        });

        // Auto-reply to investor
        const investorFirstName = (expression.investorName || expression.entityName).split(' ')[0];
        await resend.emails.send({
          from: 'African Farming Union <noreply@mail.africanfarmingunion.org>',
          to: expression.email,
          subject: `Thank you for your interest in ${expression.opportunityName}`,
          html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
            <div style="background:#1B2A4A;padding:30px;text-align:center">
              <h1 style="color:#5DB347;margin:0;font-size:24px">African Farming Union</h1>
              <p style="color:#8CB89C;margin:8px 0 0;font-size:14px">Investor Relations</p>
            </div>
            <div style="padding:30px;background:#f8faf6">
              <h2 style="color:#1B2A4A;margin-top:0">Thank you, ${investorFirstName}!</h2>
              <p style="color:#333;line-height:1.6">Thank you for your interest in the AFU <strong>${expression.opportunityName}</strong>. Our investor relations team will contact you within <strong>24 hours</strong>.</p>
              <div style="background:white;border-left:4px solid #5DB347;padding:15px;margin:20px 0;border-radius:4px">
                <p style="margin:0;color:#555;font-size:14px"><strong>Your expression of interest:</strong></p>
                <p style="margin:8px 0 0;color:#777;font-size:14px">Opportunity: ${expression.opportunityName}</p>
                ${expression.amount ? `<p style="margin:4px 0 0;color:#777;font-size:14px">Amount: $${expression.amount.toLocaleString()}</p>` : ''}
              </div>
              <p style="color:#333;line-height:1.6">In the meantime, explore our platform:</p>
              <ul style="color:#555;line-height:2">
                <li><a href="https://africanfarmingunion.org/investor" style="color:#5DB347">Investment Opportunities</a></li>
                <li><a href="https://africanfarmingunion.org/services" style="color:#5DB347">Our Services</a></li>
                <li><a href="https://africanfarmingunion.org/countries" style="color:#5DB347">Countries We Operate In</a></li>
                <li><a href="https://africanfarmingunion.org/about" style="color:#5DB347">About AFU</a></li>
              </ul>
              <p style="color:#333">Best regards,<br><strong>The AFU Investor Relations Team</strong></p>
            </div>
            <div style="padding:20px;text-align:center;color:#999;font-size:12px">African Farming Union | Gaborone, Botswana<br>africanfarmingunion.org</div>
          </div>`,
        });
      }
    } catch (emailErr) {
      // Email sending failed — log but don't fail the request
      console.error('[express-interest] Email notification failed:', emailErr);
    }

    return NextResponse.json({
      success: true,
      id: expression.id,
      message: 'Expression of interest received successfully',
    });
  } catch (err) {
    console.error('[express-interest] Error:', err);
    return NextResponse.json(
      { error: 'Failed to process expression of interest' },
      { status: 500 }
    );
  }
}

// ── GET /api/investor/express-interest ────────────────────────────────────
// Returns all in-memory expressions (for admin use)
export async function GET() {
  return NextResponse.json({
    expressions: investor_expressions,
    count: investor_expressions.length,
  });
}
