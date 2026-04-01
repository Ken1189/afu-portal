import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = 'African Farming Union <noreply@mail.africanfarmingunion.org>';
const NOTIFY_TO = ['peterw@africanfarmingunion.org', 'devonk@africanfarmingunion.org'];

export async function POST(req: Request) {
  try {
    const { type, amount, currency, email, name, tier, program } = await req.json();

    const amountFormatted = amount ? `$${(amount / 100).toFixed(2)}` : 'Unknown';

    if (type === 'donation') {
      // Notify Devon + Peter
      await resend.emails.send({
        from: FROM,
        to: NOTIFY_TO,
        subject: `[AFU Donation] ${amountFormatted} from ${name || email || 'Anonymous'}`,
        html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto"><div style="background:#1B2A4A;padding:20px;text-align:center"><h2 style="color:#5DB347;margin:0">New Donation Received!</h2></div><div style="padding:20px;background:#f8faf6"><p><strong>Amount:</strong> ${amountFormatted} ${currency || 'USD'}</p><p><strong>Program:</strong> ${program || 'General Fund'}</p><p><strong>Donor:</strong> ${name || 'Anonymous'}</p><p><strong>Email:</strong> ${email || 'Not provided'}</p></div><div style="padding:15px;text-align:center;color:#999;font-size:12px">African Farming Union | africanfarmingunion.org</div></div>`,
      });

      // Auto-reply to donor
      if (email) {
        await resend.emails.send({
          from: FROM,
          to: email,
          subject: 'Thank you for your generous donation — African Farming Union',
          html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto"><div style="background:#1B2A4A;padding:30px;text-align:center"><h1 style="color:#5DB347;margin:0;font-size:24px">African Farming Union</h1><p style="color:#8CB89C;margin:8px 0 0;font-size:14px">Farmers for Farmers</p></div><div style="padding:30px;background:#f8faf6"><h2 style="color:#1B2A4A;margin-top:0">Thank you${name ? ', ' + name.split(' ')[0] : ''}!</h2><p style="color:#333;line-height:1.6">Your donation of <strong>${amountFormatted}</strong> to the <strong>${program || 'General Fund'}</strong> has been received. Your generosity directly supports African farmers with financing, inputs, insurance, and market access.</p><p style="color:#333;line-height:1.6">10% of all AFU earnings go to community programs: Women in Agriculture, Feed a Child, and Young Farmers.</p><div style="background:#5DB347;color:white;padding:12px 24px;border-radius:8px;display:inline-block;margin-top:16px;text-decoration:none"><a href="https://africanfarmingunion.org/sponsor" style="color:white;text-decoration:none">Sponsor a Farmer</a></div></div><div style="padding:20px;text-align:center;color:#999;font-size:12px">African Farming Union | Gaborone, Botswana<br>africanfarmingunion.org</div></div>`,
        });
      }
    } else if (type === 'sponsorship' || type === 'sponsor') {
      // Notify Devon + Peter
      await resend.emails.send({
        from: FROM,
        to: NOTIFY_TO,
        subject: `[AFU Sponsorship] ${amountFormatted}/mo from ${name || email || 'Anonymous'} — ${tier || 'Bronze'} tier`,
        html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto"><div style="background:#1B2A4A;padding:20px;text-align:center"><h2 style="color:#5DB347;margin:0">New Farmer Sponsorship!</h2></div><div style="padding:20px;background:#f8faf6"><p><strong>Amount:</strong> ${amountFormatted}/month</p><p><strong>Tier:</strong> ${tier || 'Bronze'}</p><p><strong>Sponsor:</strong> ${name || 'Anonymous'}</p><p><strong>Email:</strong> ${email || 'Not provided'}</p></div><div style="padding:15px;text-align:center;color:#999;font-size:12px">African Farming Union | africanfarmingunion.org</div></div>`,
      });

      // Auto-reply to sponsor
      if (email) {
        await resend.emails.send({
          from: FROM,
          to: email,
          subject: 'Welcome to the AFU Sponsor Family — African Farming Union',
          html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto"><div style="background:#1B2A4A;padding:30px;text-align:center"><h1 style="color:#5DB347;margin:0;font-size:24px">African Farming Union</h1><p style="color:#8CB89C;margin:8px 0 0;font-size:14px">Farmers for Farmers</p></div><div style="padding:30px;background:#f8faf6"><h2 style="color:#1B2A4A;margin-top:0">You're making a difference${name ? ', ' + name.split(' ')[0] : ''}!</h2><p style="color:#333;line-height:1.6">Your <strong>${tier || 'Bronze'}</strong> sponsorship of <strong>${amountFormatted}/month</strong> will directly fund a farmer's membership, inputs, insurance, and programme access.</p><p style="color:#333;line-height:1.6">You'll receive monthly updates as their season unfolds — real photos, real progress, real impact.</p><div style="background:#5DB347;color:white;padding:12px 24px;border-radius:8px;display:inline-block;margin-top:16px;text-decoration:none"><a href="https://africanfarmingunion.org/sponsor" style="color:white;text-decoration:none">Meet Your Farmer</a></div></div><div style="padding:20px;text-align:center;color:#999;font-size:12px">African Farming Union | Gaborone, Botswana<br>africanfarmingunion.org</div></div>`,
        });
      }
    } else if (type === 'membership') {
      // Notify Devon + Peter
      await resend.emails.send({
        from: FROM,
        to: NOTIFY_TO,
        subject: `[AFU Membership] New ${tier || 'Smallholder'} member — ${name || email || 'Unknown'}`,
        html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto"><div style="background:#1B2A4A;padding:20px;text-align:center"><h2 style="color:#5DB347;margin:0">New Membership Payment!</h2></div><div style="padding:20px;background:#f8faf6"><p><strong>Tier:</strong> ${tier || 'Smallholder'}</p><p><strong>Amount:</strong> ${amountFormatted}</p><p><strong>Member:</strong> ${name || 'Unknown'}</p><p><strong>Email:</strong> ${email || 'Not provided'}</p></div><div style="padding:15px;text-align:center;color:#999;font-size:12px">African Farming Union | africanfarmingunion.org</div></div>`,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Payment notification error:', err);
    return NextResponse.json({ success: true }); // Don't fail
  }
}
