// ============================================================================
// AFU Portal — Credit Score API Route Handler
// Convenience wrapper for API routes to recalculate a member's credit score.
// ============================================================================

import { createAdminClient } from '@/lib/supabase/server';
import { calculateCreditScore, type CreditScoreBreakdown } from './engine';

/**
 * Recalculate and persist the credit score for a given member.
 * Uses the admin (service-role) Supabase client to bypass RLS.
 *
 * @param memberId - The member UUID
 * @returns The full credit score breakdown
 */
export async function recalculateCreditScore(
  memberId: string
): Promise<CreditScoreBreakdown> {
  const supabase = await createAdminClient();
  return calculateCreditScore(supabase, memberId);
}
