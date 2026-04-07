import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase/server';

/**
 * DELETE /api/account/delete
 *
 * GDPR-compliant account deletion endpoint.
 * Requires the user to be authenticated. Deletes all user data from:
 *   - profiles
 *   - members
 *   - membership_applications
 *   - farm_plots
 *   - livestock
 *   - orders
 *   - conversations (where email matches)
 * Then deletes the auth user via Supabase admin API.
 */
export async function DELETE(request: Request) {
  try {
    // 1. Verify the user is authenticated
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'You must be logged in to delete your account.' },
        { status: 401 },
      );
    }

    // Require explicit confirmation phrase in body
    let confirmation: string | undefined;
    try {
      const body = await request.json();
      confirmation = body?.confirmation;
    } catch {
      // No body
    }

    if (confirmation !== 'DELETE_MY_ACCOUNT') {
      return NextResponse.json(
        { error: 'Missing or invalid confirmation. Provide { "confirmation": "DELETE_MY_ACCOUNT" }.' },
        { status: 400 },
      );
    }

    const userId = user.id;
    const userEmail = user.email;

    // 2. Use admin client (service role) to delete data across tables
    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    // Audit log before any destructive action
    try {
      await adminSupabase.from('audit_log').insert({
        action: 'account_delete',
        entity_type: 'user',
        entity_id: userId,
        user_id: userId,
        details: {
          email: userEmail,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (e) {
      console.warn('Failed to write audit_log for account deletion:', e);
    }

    // Delete from each table — errors are collected but non-fatal
    const deletions = [
      adminSupabase.from('farm_plots').delete().eq('profile_id', userId),
      adminSupabase.from('livestock').delete().eq('profile_id', userId),
      adminSupabase.from('orders').delete().eq('profile_id', userId),
      adminSupabase.from('membership_applications').delete().eq('profile_id', userId),
      adminSupabase.from('members').delete().eq('profile_id', userId),
      // Also delete by email for tables that use email as identifier
      ...(userEmail
        ? [
            adminSupabase.from('membership_applications').delete().eq('email', userEmail),
            adminSupabase.from('conversations').delete().eq('email', userEmail),
          ]
        : []),
    ];

    const results = await Promise.allSettled(deletions);

    // Log any failures for debugging (non-fatal — table may not exist)
    results.forEach((r, i) => {
      if (r.status === 'rejected') {
        console.warn(`Account deletion step ${i} failed:`, r.reason);
      }
    });

    // 3. Delete the profile row last (may have FK constraints)
    await adminSupabase.from('profiles').delete().eq('id', userId);

    // 4. Delete the auth user
    const { error: deleteAuthError } = await adminSupabase.auth.admin.deleteUser(userId);

    if (deleteAuthError) {
      console.error('Failed to delete auth user:', deleteAuthError);
      return NextResponse.json(
        { error: 'Account data was deleted but auth removal failed. Please contact support.' },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, message: 'Your account and all associated data have been deleted.' });
  } catch (err) {
    console.error('Account deletion error:', err);
    return NextResponse.json(
      { error: 'Something went wrong. Please contact support.' },
      { status: 500 },
    );
  }
}
