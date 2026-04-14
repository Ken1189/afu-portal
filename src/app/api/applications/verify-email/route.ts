import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { autoApprove } from '../auto-approve-free/route';

/**
 * GET /api/applications/verify-email?token=xxx
 * Verifies a free tier applicant's email, then auto-approves their account.
 * Redirects to /login?verified=true on success.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');
  const appId = searchParams.get('id');
  const email = searchParams.get('email');

  if (!token && !appId) {
    return NextResponse.redirect(
      new URL('/apply?error=missing-token', req.url),
    );
  }

  const svc = await createAdminClient();

  // Look up application by token OR by id+email
  let app;
  let fetchErr;

  if (token) {
    const result = await svc
      .from('membership_applications')
      .select('*')
      .eq('verification_token', token)
      .single();
    app = result.data;
    fetchErr = result.error;
  } else if (appId && email) {
    const result = await svc
      .from('membership_applications')
      .select('*')
      .eq('id', appId)
      .eq('email', decodeURIComponent(email))
      .single();
    app = result.data;
    fetchErr = result.error;
  }

  if (fetchErr || !app) {
    return NextResponse.redirect(
      new URL('/apply?error=invalid-token', req.url),
    );
  }

  // Check if already verified / approved
  if (app.email_verified && app.status === 'approved') {
    return NextResponse.redirect(new URL('/login?verified=true', req.url));
  }

  // Check token expiry — 48 hours
  if (app.verification_sent_at) {
    const sentAt = new Date(app.verification_sent_at).getTime();
    const now = Date.now();
    const hoursElapsed = (now - sentAt) / (1000 * 60 * 60);
    if (hoursElapsed > 48) {
      return NextResponse.redirect(
        new URL('/apply?error=token-expired', req.url),
      );
    }
  }

  // Mark email as verified
  await svc
    .from('membership_applications')
    .update({
      email_verified: true,
      verification_token: null, // Clear token after use
    })
    .eq('id', app.id);

  // Now auto-approve: create auth user, profile, and member
  try {
    const result = await autoApprove(svc, app, app.id);

    // If autoApprove returned an error response, redirect with error
    const body = await result.json();
    if (!body.success) {
      console.error('[verify-email] Auto-approve failed:', body.error);
      return NextResponse.redirect(
        new URL('/apply?error=approval-failed', req.url),
      );
    }
  } catch (err) {
    console.error('[verify-email] Auto-approve exception:', err);
    return NextResponse.redirect(
      new URL('/apply?error=approval-failed', req.url),
    );
  }

  // Redirect to login page with success indicator
  return NextResponse.redirect(new URL('/login?verified=true', req.url));
}
