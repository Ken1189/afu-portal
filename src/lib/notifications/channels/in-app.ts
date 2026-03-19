/**
 * In-app notification channel — writes directly to the Supabase
 * `notifications` table so the frontend can display them in real time.
 *
 * Uses the admin (service-role) client to bypass RLS.
 */

import { createAdminClient } from '@/lib/supabase/server';

/**
 * Create an in-app notification for a member.
 *
 * @param memberId   The target member's ID
 * @param title      Short notification title
 * @param body       Notification body text
 * @param actionUrl  Optional deep-link within the portal
 * @param data       Optional key-value metadata
 * @returns          The ID of the inserted notification row
 */
export async function sendInApp(
  memberId: string,
  title: string,
  body: string,
  actionUrl?: string,
  data?: Record<string, string>,
): Promise<{ id: string }> {
  const supabase = await createAdminClient();

  const { data: row, error } = await supabase
    .from('notifications')
    .insert({
      member_id: memberId,
      title,
      body,
      action_url: actionUrl ?? null,
      data: data ?? null,
      read: false,
      created_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (error || !row) {
    throw new Error(
      `[in-app] Failed to insert notification: ${error?.message ?? 'unknown error'}`,
    );
  }

  return { id: row.id as string };
}
