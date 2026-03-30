import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

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
          value: new Date().toISOString(),
          content_type: 'text',
        },
        { onConflict: 'page,section,key' }
      );

    if (error) {
      console.error('Newsletter subscribe error:', error);
      return NextResponse.json({ error: 'Failed to subscribe. Please try again.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Thanks for subscribing!' });
  } catch {
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
