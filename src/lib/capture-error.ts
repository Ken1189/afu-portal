import * as Sentry from '@sentry/nextjs';

/**
 * Log an error to both console and Sentry.
 * Use this in Supabase hooks and API routes instead of bare console.error().
 */
export function captureError(context: string, error: unknown) {
  console.error(`[${context}]`, error);

  try {
    if (error instanceof Error) {
      Sentry.captureException(error, { tags: { context } });
    } else {
      Sentry.captureMessage(`[${context}] ${String(error)}`, {
        level: 'error',
        tags: { context },
      });
    }
  } catch {
    // Sentry not configured — silent fallback
  }
}
