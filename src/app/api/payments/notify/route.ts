import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase/server';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = 'African Farming Union <noreply@mail.africanfarmingunion.org>';
const NOTIFY_TO = ['peterw@africanfarmingunion.org', 'devonk@africanfarmingunion.org'];

function escapeHtml(input: unknown): string {
  if (input === null || input === undefined) return '';
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function isAuthorized(req: Request): Promise<boolean> {
  const internalToken = req.headers.get('x-internal-token');
  const expectedToken = process.env.INTERNAL_API_TOKEN;
  if (expectedToken && internalToken && internalToken === expectedToken) {
    return true;
  }

  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const admin = await createAdminClient();
    const { data: profile } = await admin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    return !!profile && ['admin', 'super_admin'].includes(profile.role);
  } catch (err) {
    console.error("[payments/notify] auth check non-critical:", err);
    return false;
  }
}

export async function POST(req: Request) {
  try {
    if (!(await isAuthorized(req))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type, amount, currency, email, name, tier, program } = await req.json();

    const amountFormatted = amount ? `$${(amount / 100).toFixed(2)}` : 'Unknown';
    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeTier = escapeHtml(tier);
    const safeProgram = escapeHtml(program);
    const safeCurrency = escapeHtml(currency);
    const safeAmount = escapeHtml(amountFormatted);
    const firstNameRaw = typeof name === 'string' ? name.split(' ')[0] : '';
    const safeFirstName = escapeHtml(firstNameRaw);

    if (type === 'donation') {
      await resend.emails.send({
        from: FROM,
        to: NOTIFY_TO,
        subject: `[AFU Donation] ${amountFormatted} from ${name || email || 'Anonymous'}`,
        html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto"><div style="background:#1B2A4A;padding:20px;text-align:center"><h2 style="color:#5DB347;margin:0">New Donation Received!</h2></div><div style="padding:20px;background:#f8faf6"><p><strong>Amount:</strong> ${safeAmount} ${safeCurrency || 'USD'}</p><p><strong>Program:</strong> ${safeProgram || 'General Fund'}</p><p><strong>Donor:</strong> ${safeName || 'Anonymous'}</p><p><strong>Email:</strong> ${safeEmail || 'Not provided'}</p></div><div style="padding:15px;text-align:center;color:#999;font-size:12px">African Farming Union | africanfarmingunion.org</div></div>`,
      });

      if (email) {
        await resend.emails.send({
          from: FROM,
          to: email,
          subject: 'Thank you for your generous donation — African Farming Union',
          html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto"><div style="background:#1B2A4A;padding:30px;text-align:center"><h1 style="color:#5DB347;margin:0;font-size:24px">African Farming Union</h1><p style="color:#8CB89C;margin:8px 0 0;font-size:14px">Farmers for Farmers</p></div><div style="padding:30px;background:#f8faf6"><h2 style="color:#1B2A4A;margin-top:0">Thank you${safeFirstName ? ', ' + safeFirstName : ''}!</h2><p style="color:#333;line-height:1.6">Your donation of <strong>${safeAmount}</strong> to the <strong>${safeProgram || 'General Fund'}</strong> has been received. Your generosity directly supports African farmers with financing, inputs, insurance, and market access.</p><p style="color:#333;line-height:1.6">10% of all AFU earnings go to community programs: Women in Agriculture, Feed a Child, and Young Farmers.</p><div style="background:#5DB347;color:white;padding:12px 24px;border-radius:8px;display:inline-block;margin-top:16px;text-decoration:none"><a href="https://africanfarmingunion.org/sponsor" style="color:white;text-decoration:none">Sponsor a Farmer</a></div></div><div style="padding:20px;text-align:center;color:#999;font-size:12px">African Farming Union | Gaborone, Botswana<br>africanfarmingunion.org</div></div>`,
        });
      }
    } else if (type === 'sponsorship' || type === 'sponsor') {
      await resend.emails.send({
        from: FROM,
        to: NOTIFY_TO,
        subject: `[AFU Sponsorship] ${amountFormatted}/mo from ${name || email || 'Anonymous'} — ${tier || 'Bronze'} tier`,
        html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto"><div style="background:#1B2A4A;padding:20px;text-align:center"><h2 style="color:#5DB347;margin:0">New Farmer Sponsorship!</h2></div><div style="padding:20px;background:#f8faf6"><p><strong>Amount:</strong> ${safeAmount}/month</p><p><strong>Tier:</strong> ${safeTier || 'Bronze'}</p><p><strong>Sponsor:</strong> ${safeName || 'Anonymous'}</p><p><strong>Email:</strong> ${safeEmail || 'Not provided'}</p></div><div style="padding:15px;text-align:center;color:#999;font-size:12px">African Farming Union | africanfarmingunion.org</div></div>`,
      });

      if (email) {
        await resend.emails.send({
          from: FROM,
          to: email,
          subject: 'Welcome to the AFU Sponsor Family — African Farming Union',
          html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto"><div style="background:#1B2A4A;padding:30px;text-align:center"><h1 style="color:#5DB347;margin:0;font-size:24px">African Farming Union</h1><p style="color:#8CB89C;margin:8px 0 0;font-size:14px">Farmers for Farmers</p></div><div style="padding:30px;background:#f8faf6"><h2 style="color:#1B2A4A;margin-top:0">You're making a difference${safeFirstName ? ', ' + safeFirstName : ''}!</h2><p style="color:#333;line-height:1.6">Your <strong>${safeTier || 'Bronze'}</strong> sponsorship of <strong>${safeAmount}/month</strong> will directly fund a farmer's membership, inputs, insurance, and programme access.</p><p style="color:#333;line-height:1.6">You'll receive monthly updates as their season unfolds — real photos, real progress, real impact.</p><div style="background:#5DB347;color:white;padding:12px 24px;border-radius:8px;display:inline-block;margin-top:16px;text-decoration:none"><a href="https://africanfarmingunion.org/sponsor" style="color:white;text-decoration:none">Meet Your Farmer</a></div></div><div style="padding:20px;text-align:center;color:#999;font-size:12px">African Farming Union | Gaborone, Botswana<br>africanfarmingunion.org</div></div>`,
        });
      }
    } else if (type === 'membership') {
      await resend.emails.send({
        from: FROM,
        to: NOTIFY_TO,
        subject: `[AFU Membership] New ${tier || 'Smallholder'} member — ${name || email || 'Unknown'}`,
        html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto"><div style="background:#1B2A4A;padding:20px;text-align:center"><h2 style="color:#5DB347;margin:0">New Membership Payment!</h2></div><div style="padding:20px;background:#f8faf6"><p><strong>Tier:</strong> ${safeTier || 'Smallholder'}</p><p><strong>Amount:</strong> ${safeAmount}</p><p><strong>Member:</strong> ${safeName || 'Unknown'}</p><p><strong>Email:</strong> ${safeEmail || 'Not provided'}</p></div><div style="padding:15px;text-align:center;color:#999;font-size:12px">African Farming Union | africanfarmingunion.org</div></div>`,
      });
    } else if (type === 'insurance_claim') {
      await resend.emails.send({
        from: FROM,
        to: NOTIFY_TO,
        subject: `[AFU Insurance] New claim filed by ${name || email || 'Unknown'}`,
        html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto"><div style="background:#1B2A4A;padding:20px;text-align:center"><h2 style="color:#5DB347;margin:0">New Insurance Claim Filed</h2></div><div style="padding:20px;background:#f8faf6"><p><strong>Claimant:</strong> ${safeName || 'Unknown'}</p><p><strong>Email:</strong> ${safeEmail || 'Not provided'}</p><p>Review in <a href="https://africanfarmingunion.org/admin/insurance" style="color:#5DB347">Admin Portal</a></p></div><div style="padding:15px;text-align:center;color:#999;font-size:12px">African Farming Union | africanfarmingunion.org</div></div>`,
      });
    } else if (type === 'order') {
      await resend.emails.send({
        from: FROM,
        to: NOTIFY_TO,
        subject: `[AFU Order] New marketplace order — ${amountFormatted} from ${name || email || 'Unknown'}`,
        html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto"><div style="background:#1B2A4A;padding:20px;text-align:center"><h2 style="color:#5DB347;margin:0">New Marketplace Order!</h2></div><div style="padding:20px;background:#f8faf6"><p><strong>Amount:</strong> ${safeAmount}</p><p><strong>Customer:</strong> ${safeName || 'Unknown'}</p><p><strong>Email:</strong> ${safeEmail || 'Not provided'}</p><p>View in <a href="https://africanfarmingunion.org/admin/payments" style="color:#5DB347">Admin Portal</a></p></div><div style="padding:15px;text-align:center;color:#999;font-size:12px">African Farming Union | africanfarmingunion.org</div></div>`,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Payment notification error:', err);
    return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 });
  }
}
