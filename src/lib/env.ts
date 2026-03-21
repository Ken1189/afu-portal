import { z } from 'zod';

// ─── Server-side env vars (only validated on the server) ────────────────────

const serverSchema = z.object({
  // Supabase — required
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'Missing SUPABASE_SERVICE_ROLE_KEY'),

  // Sentry — optional for dev
  SENTRY_ORG: z.string().optional(),
  SENTRY_PROJECT: z.string().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),

  // Notifications — optional (only needed when channels are active)
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().email().optional(),
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_FROM_NUMBER: z.string().optional(),
  WHATSAPP_TOKEN: z.string().optional(),
  WHATSAPP_PHONE_NUMBER_ID: z.string().optional(),

  // Stripe — optional
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  // App
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
});

// ─── Client-side env vars (validated everywhere) ────────────────────────────

const clientSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('Invalid NEXT_PUBLIC_SUPABASE_URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'Missing NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NEXT_PUBLIC_APP_NAME: z.string().optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  NEXT_PUBLIC_EDMA_RPC_URL: z.string().url().optional(),
});

// ─── Validation ─────────────────────────────────────────────────────────────

function validateEnv() {
  // Client vars — always validated (explicitly pick NEXT_PUBLIC_ vars so
  // Next.js includes them in the client bundle via static analysis)
  const clientResult = clientSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_EDMA_RPC_URL: process.env.NEXT_PUBLIC_EDMA_RPC_URL,
  });

  // Server vars — only validate on the server side (not in client bundles)
  const isServer = typeof window === 'undefined';
  const serverResult = isServer
    ? serverSchema.safeParse(process.env)
    : null;

  // Collect ALL errors before throwing
  const errors: string[] = [];

  if (!clientResult.success) {
    for (const issue of clientResult.error.issues) {
      errors.push(`  ${issue.path.join('.')}: ${issue.message}`);
    }
  }

  if (serverResult && !serverResult.success) {
    for (const issue of serverResult.error.issues) {
      errors.push(`  ${issue.path.join('.')}: ${issue.message}`);
    }
  }

  if (errors.length > 0) {
    const message = `Invalid environment variables:\n${errors.join('\n')}`;
    console.error(`\u274c ${message}`);

    // In production, fail hard. In dev, warn but continue.
    if (process.env.NODE_ENV === 'production') {
      throw new Error(message);
    }
  }

  const clientEnv = clientResult.success
    ? clientResult.data
    : ({} as z.infer<typeof clientSchema>);

  const serverEnv = isServer && serverResult?.success
    ? serverResult.data
    : ({} as z.infer<typeof serverSchema>);

  return { ...serverEnv, ...clientEnv };
}

export type Env = z.infer<typeof serverSchema> & z.infer<typeof clientSchema>;

export const env = validateEnv();
