// ============================================================================
// AFU Portal — Credit Scoring Engine
// Orchestrates data fetching and factor calculation for smallholder farmers.
// ============================================================================

import type { SupabaseClient } from '@supabase/supabase-js';
import {
  scorePaymentHistory,
  scoreLoanRepayment,
  scoreFarmProductivity,
  scoreMembershipTenure,
  scoreTrainingCompletion,
  scoreCooperativeMembership,
  scoreCollateral,
} from './factors';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CreditScoreInput {
  memberId: string;
}

export interface FactorResult {
  score: number;
  weight: number;
  weighted: number;
  details: string;
}

export interface CreditScoreBreakdown {
  score: number; // 0-1000
  tier: 'poor' | 'fair' | 'good' | 'very_good' | 'excellent';
  maxLoanAmount: number;
  factors: {
    paymentHistory: FactorResult;
    loanRepayment: FactorResult;
    farmProductivity: FactorResult;
    membershipTenure: FactorResult;
    trainingCompletion: FactorResult;
    cooperativeMembership: FactorResult;
    collateral: FactorResult;
  };
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const WEIGHTS = {
  paymentHistory: 0.3,
  loanRepayment: 0.25,
  farmProductivity: 0.15,
  membershipTenure: 0.1,
  trainingCompletion: 0.1,
  cooperativeMembership: 0.05,
  collateral: 0.05,
} as const;

const TIER_THRESHOLDS: { max: number; tier: CreditScoreBreakdown['tier'] }[] = [
  { max: 299, tier: 'poor' },
  { max: 499, tier: 'fair' },
  { max: 649, tier: 'good' },
  { max: 799, tier: 'very_good' },
  { max: 1000, tier: 'excellent' },
];

const MAX_LOAN_BY_TIER: Record<CreditScoreBreakdown['tier'], number> = {
  poor: 0,
  fair: 500,
  good: 2500,
  very_good: 10000,
  excellent: 50000,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getTier(score: number): CreditScoreBreakdown['tier'] {
  for (const { max, tier } of TIER_THRESHOLDS) {
    if (score <= max) return tier;
  }
  return 'excellent';
}

function makeFactor(score: number, weight: number, details: string): FactorResult {
  return {
    score,
    weight,
    weighted: Math.round(score * weight),
    details,
  };
}

// ---------------------------------------------------------------------------
// Main Engine
// ---------------------------------------------------------------------------

/**
 * Calculate a full credit score breakdown for a member.
 * Queries all relevant tables, computes each factor, persists results.
 */
export async function calculateCreditScore(
  supabase: SupabaseClient,
  memberId: string
): Promise<CreditScoreBreakdown> {
  // ---- Parallel data fetching ------------------------------------------------
  const [
    paymentsRes,
    loansRes,
    schedulesRes,
    plotsRes,
    memberRes,
    enrollmentsRes,
    totalCoursesRes,
    coopMembershipsRes,
    documentsRes,
  ] = await Promise.all([
    supabase
      .from('payments')
      .select('status')
      .eq('member_id', memberId),

    supabase
      .from('loans')
      .select('id')
      .eq('member_id', memberId),

    // loan_schedules are fetched separately below using actual loan IDs
    Promise.resolve({ data: [] }),

    supabase
      .from('farm_plots')
      .select('health_score')
      .eq('member_id', memberId),

    supabase
      .from('members')
      .select('created_at')
      .eq('id', memberId)
      .single(),

    supabase
      .from('course_enrollments')
      .select('progress_percent')
      .eq('member_id', memberId),

    supabase
      .from('courses')
      .select('id', { count: 'exact', head: true }),

    supabase
      .from('cooperative_members')
      .select('role')
      .eq('member_id', memberId),

    supabase
      .from('kyc_documents')
      .select('document_type, verification_status')
      .eq('member_id', memberId),
  ]);

  // ---- Fetch loan schedules for all member loans ----------------------------
  const loanIds = (loansRes.data ?? []).map((l) => l.id);
  let loanSchedules: { status: string; due_date: string; paid_at: string | null }[] = [];

  if (loanIds.length > 0) {
    const { data } = await supabase
      .from('loan_schedules')
      .select('status, due_date, paid_at')
      .in('loan_id', loanIds);
    loanSchedules = data ?? [];
  }

  // ---- Calculate each factor ------------------------------------------------
  const payments = paymentsRes.data ?? [];
  const plots = plotsRes.data ?? [];
  const joinDate = memberRes.data?.created_at ?? new Date().toISOString();
  const enrollments = enrollmentsRes.data ?? [];
  const totalCourses = totalCoursesRes.count ?? 0;
  const coopMemberships = coopMembershipsRes.data ?? [];
  const documents = documentsRes.data ?? [];

  const paymentHistoryScore = scorePaymentHistory(payments);
  const loanRepaymentScore = scoreLoanRepayment(loanSchedules);
  const farmProductivityScore = scoreFarmProductivity(plots);
  const membershipTenureScore = scoreMembershipTenure(joinDate);
  const trainingCompletionScore = scoreTrainingCompletion(enrollments, totalCourses);
  const cooperativeMembershipScore = scoreCooperativeMembership(coopMemberships);
  const collateralScore = scoreCollateral(documents);

  // ---- Build factor results -------------------------------------------------
  const factors = {
    paymentHistory: makeFactor(
      paymentHistoryScore,
      WEIGHTS.paymentHistory,
      `${payments.filter((p) => p.status === 'completed').length}/${payments.length} payments completed`
    ),
    loanRepayment: makeFactor(
      loanRepaymentScore,
      WEIGHTS.loanRepayment,
      `${loanSchedules.filter((s) => s.status === 'paid').length}/${loanSchedules.length} loan installments paid`
    ),
    farmProductivity: makeFactor(
      farmProductivityScore,
      WEIGHTS.farmProductivity,
      `${plots.length} active plot(s)`
    ),
    membershipTenure: makeFactor(
      membershipTenureScore,
      WEIGHTS.membershipTenure,
      `Member since ${new Date(joinDate).toLocaleDateString()}`
    ),
    trainingCompletion: makeFactor(
      trainingCompletionScore,
      WEIGHTS.trainingCompletion,
      `${enrollments.filter((e) => e.progress_percent >= 100).length}/${totalCourses} courses completed`
    ),
    cooperativeMembership: makeFactor(
      cooperativeMembershipScore,
      WEIGHTS.cooperativeMembership,
      `${coopMemberships.length} cooperative membership(s)`
    ),
    collateral: makeFactor(
      collateralScore,
      WEIGHTS.collateral,
      `${documents.filter((d) => d.verification_status === 'verified').length} verified document(s)`
    ),
  };

  // ---- Compute total score --------------------------------------------------
  const totalScore = Math.round(
    Object.values(factors).reduce((sum, f) => sum + f.weighted, 0)
  );

  const tier = getTier(totalScore);
  const maxLoanAmount = MAX_LOAN_BY_TIER[tier];

  const breakdown: CreditScoreBreakdown = {
    score: totalScore,
    tier,
    maxLoanAmount,
    factors: factors as CreditScoreBreakdown['factors'],
  };

  // ---- Persist to database --------------------------------------------------
  await persistCreditScore(supabase, memberId, breakdown);

  return breakdown;
}

/**
 * Upsert into credit_scores and append to credit_score_history.
 */
async function persistCreditScore(
  supabase: SupabaseClient,
  memberId: string,
  breakdown: CreditScoreBreakdown
): Promise<void> {
  const now = new Date().toISOString();

  // Upsert current score
  await supabase.from('credit_scores').upsert(
    {
      member_id: memberId,
      score: breakdown.score,
      tier: breakdown.tier,
      max_loan_amount: breakdown.maxLoanAmount,
      factors: breakdown.factors,
      calculated_at: now,
      updated_at: now,
    },
    { onConflict: 'member_id' }
  );

  // Append to history
  await supabase.from('credit_score_history').insert({
    member_id: memberId,
    score: breakdown.score,
    tier: breakdown.tier,
    max_loan_amount: breakdown.maxLoanAmount,
    factors: breakdown.factors,
    calculated_at: now,
  });

  // Also update the members table credit_score field
  await supabase
    .from('members')
    .update({ credit_score: breakdown.score, updated_at: now })
    .eq('id', memberId);
}
