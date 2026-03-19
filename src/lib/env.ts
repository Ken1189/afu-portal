import { z } from 'zod';

/**
 * Environment variable validation.
 * Fails fast at build/start if required vars are missing.
 */

const serverSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is required'),
  RESEND_API_KEY: z.string().optional(),
});

const clientSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('NEXT_PUBLIC_SUPABASE_URL must be a valid URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required'),
  NEXT_PUBLIC_APP_URL: z.string().optional(),
  NEXT_PUBLIC_APP_NAME: z.string().optional(),
});

export type ServerEnv = z.infer<typeof serverSchema>;
export type ClientEnv = z.infer<typeof clientSchema>;

function validateEnv() {
  // Client env is always available
  const clientResult = clientSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  });

  if (!clientResult.success) {
    console.error('❌ Invalid client environment variables:', clientResult.error.flatten().fieldErrors);
    throw new Error('Invalid client environment variables');
  }

  // Server env only validated on server side
  if (typeof window === 'undefined') {
    const serverResult = serverSchema.safeParse({
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      RESEND_API_KEY: process.env.RESEND_API_KEY,
    });

    if (!serverResult.success) {
      console.error('❌ Invalid server environment variables:', serverResult.error.flatten().fieldErrors);
      throw new Error('Invalid server environment variables');
    }

    return {
      ...clientResult.data,
      ...serverResult.data,
    };
  }

  return clientResult.data;
}

export const env = validateEnv();
