/**
 * Web Push channel — sends push notifications via the Web Push protocol.
 *
 * Requires:
 *   - VAPID_PUBLIC_KEY
 *   - VAPID_PRIVATE_KEY
 *   - web-push library (not yet installed)
 *
 * This is currently a stub. Once VAPID keys are configured and the
 * web-push package is added, replace the implementation below.
 */

/**
 * Send a web push notification.
 *
 * @param subscriptionData  The PushSubscription object from the client
 * @param title             Notification title
 * @param body              Notification body
 * @param url               Optional URL to open on click
 * @returns                 Whether the push was delivered
 */
export async function sendPush(
  subscriptionData: unknown,
  title: string,
  body: string,
  url?: string,
): Promise<{ success: boolean }> {
  const vapidPublic = process.env.VAPID_PUBLIC_KEY;
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY;

  if (!vapidPublic || !vapidPrivate) {
    console.warn(
      '[push] VAPID_PUBLIC_KEY and/or VAPID_PRIVATE_KEY not configured. Push notifications are disabled.',
    );
    return { success: false };
  }

  if (!subscriptionData) {
    console.warn('[push] No subscription data provided.');
    return { success: false };
  }

  // Stub: log the intent and return not-configured
  console.info('[push] Push notification requested but web-push library is not installed.', {
    title,
    body,
    url,
    subscriptionData,
  });

  return { success: false };
}
