import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { notifyAdmins } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const { email, name, country, interests } = await req.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    const supabase = await createAdminClient();

    // Upsert into site_content so duplicate emails don't cause errors
    // site_content has UNIQUE(page, section, key)
    const { error } = await supabase
      .from('site_content')
      .upsert(
        {
          page: 'global',
          section: 'newsletter_subscribers',
          key: email.toLowerCase().trim(),
          value: JSON.stringify({ subscribed: new Date().toISOString(), name: name || null, country: country || null, interests: interests || null }),
          content_type: 'text',
        },
        { onConflict: 'page,section,key' }
      );

    if (error) {
      console.error('Newsletter subscribe error:', error);
      return NextResponse.json({ error: 'Failed to subscribe. Please try again.' }, { status: 500 });
    }

    // Notify all 3 admins + write to universal inbox
    try {
      await notifyAdmins({
        subject: `Newsletter signup: ${email}`,
        type: 'newsletter',
        data: { email, name: name || '', country: country || '', interests: interests || '' },
        reply_to: email,
        name: name || email,
        country: country || undefined,
        tags: ['newsletter', 'signup'],
      });
    } catch (notifyErr) {
      console.error('[newsletter notifyAdmins]', notifyErr);
    }

    return NextResponse.json({ success: true, message: 'Thanks for subscribing!' });
  } catch {
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
