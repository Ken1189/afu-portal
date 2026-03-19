// ============================================================================
// AFU Portal — Credit Score Factor Calculations
// Pure functions that score individual credit factors (0-1000 each).
// ============================================================================

/**
 * Payment History Factor (weight: 30%)
 * Scores based on ratio of completed payments vs total payments.
 * Failed and refunded payments reduce the score.
 */
export function scorePaymentHistory(
  payments: { status: string }[]
): number {
  if (payments.length === 0) return 0;

  const completed = payments.filter((p) => p.status === 'completed').length;
  const failed = payments.filter(
    (p) => p.status === 'failed' || p.status === 'refunded'
  ).length;

  // Base ratio of successful payments
  const successRate = completed / payments.length;

  // Extra penalty for failed/refunded — each failure weighs more
  const failurePenalty = (failed / payments.length) * 0.5;

  const raw = Math.max(0, successRate - failurePenalty);
  return Math.round(Math.min(1000, raw * 1000));
}

/**
 * Loan Repayment Factor (weight: 25%)
 * Scores based on on-time repayment rate from loan schedules.
 */
export function scoreLoanRepayment(
  schedules: { status: string; due_date: string; paid_at: string | null }[]
): number {
  if (schedules.length === 0) return 0;

  let onTimeCount = 0;
  let paidCount = 0;

  for (const schedule of schedules) {
    if (schedule.status === 'paid' && schedule.paid_at) {
      paidCount++;
      const dueDate = new Date(schedule.due_date);
      const paidDate = new Date(schedule.paid_at);
      if (paidDate <= dueDate) {
        onTimeCount++;
      }
    }
  }

  if (paidCount === 0) return 0;

  const onTimeRate = onTimeCount / schedules.length;
  const completionRate = paidCount / schedules.length;

  // Weighted: 70% on-time rate + 30% overall completion
  const score = onTimeRate * 0.7 + completionRate * 0.3;
  return Math.round(Math.min(1000, score * 1000));
}

/**
 * Farm Productivity Factor (weight: 15%)
 * Scores based on average health_score of farm plots, with a bonus for multiple active plots.
 */
export function scoreFarmProductivity(
  plots: { health_score: number | null }[]
): number {
  if (plots.length === 0) return 0;

  const validPlots = plots.filter(
    (p) => p.health_score !== null && p.health_score !== undefined
  );
  if (validPlots.length === 0) return 0;

  const avgHealth =
    validPlots.reduce((sum, p) => sum + (p.health_score ?? 0), 0) /
    validPlots.length;

  // health_score is assumed 0-100, multiply by 10 to get 0-1000 base
  let score = avgHealth * 10;

  // Bonus for multiple active plots: +50 per extra plot, up to +200
  const plotBonus = Math.min(200, (plots.length - 1) * 50);
  score += plotBonus;

  return Math.round(Math.min(1000, Math.max(0, score)));
}

/**
 * Membership Tenure Factor (weight: 10%)
 * Progressive scale: 0 at day 0, 500 at 6 months, 800 at 1 year, 1000 at 2+ years.
 */
export function scoreMembershipTenure(joinDate: string): number {
  const join = new Date(joinDate);
  const now = new Date();
  const diffMs = now.getTime() - join.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (diffDays <= 0) return 0;

  const sixMonths = 182.5;
  const oneYear = 365;
  const twoYears = 730;

  if (diffDays >= twoYears) return 1000;

  if (diffDays >= oneYear) {
    // 800 at 1 year, linear to 1000 at 2 years
    return Math.round(800 + ((diffDays - oneYear) / (twoYears - oneYear)) * 200);
  }

  if (diffDays >= sixMonths) {
    // 500 at 6 months, linear to 800 at 1 year
    return Math.round(500 + ((diffDays - sixMonths) / (oneYear - sixMonths)) * 300);
  }

  // 0 at day 0, linear to 500 at 6 months
  return Math.round((diffDays / sixMonths) * 500);
}

/**
 * Training Completion Factor (weight: 10%)
 * Scores based on how many courses are completed and their progress.
 */
export function scoreTrainingCompletion(
  enrollments: { progress_percent: number }[],
  totalCourses: number
): number {
  if (totalCourses === 0 || enrollments.length === 0) return 0;

  const completedCount = enrollments.filter(
    (e) => e.progress_percent >= 100
  ).length;

  const avgProgress =
    enrollments.reduce((sum, e) => sum + e.progress_percent, 0) /
    enrollments.length;

  // 60% weight on completion rate, 40% on average progress
  const completionRate = completedCount / totalCourses;
  const progressRate = avgProgress / 100;

  const score = completionRate * 0.6 + progressRate * 0.4;
  return Math.round(Math.min(1000, score * 1000));
}

/**
 * Cooperative Membership Factor (weight: 5%)
 * Scores based on membership presence and role hierarchy.
 * No membership: 0, member: 500, officer: 800, chair: 1000
 */
export function scoreCooperativeMembership(
  memberships: { role: string }[]
): number {
  if (memberships.length === 0) return 0;

  // Find the highest role across all memberships
  let highestScore = 500; // default "member" score

  for (const m of memberships) {
    const role = m.role.toLowerCase();
    if (role === 'chair' || role === 'chairperson' || role === 'president') {
      highestScore = Math.max(highestScore, 1000);
    } else if (
      role === 'officer' ||
      role === 'secretary' ||
      role === 'treasurer' ||
      role === 'vice_chair'
    ) {
      highestScore = Math.max(highestScore, 800);
    }
  }

  // Small bonus for being in multiple cooperatives (up to +100)
  const multiBonus = Math.min(100, (memberships.length - 1) * 50);

  return Math.min(1000, highestScore + multiBonus);
}

/**
 * Collateral Factor (weight: 5%)
 * Scores based on number and type of verified KYC documents.
 * Key document types: farm_registration (400pts), proof_of_address (300pts),
 * national_id (200pts), other verified docs (100pts each).
 */
export function scoreCollateral(
  documents: { document_type: string; verification_status: string }[]
): number {
  if (documents.length === 0) return 0;

  const verified = documents.filter(
    (d) => d.verification_status === 'verified'
  );

  if (verified.length === 0) return 0;

  let score = 0;
  const typesScored = new Set<string>();

  for (const doc of verified) {
    const docType = doc.document_type.toLowerCase();

    // Only count each document type once
    if (typesScored.has(docType)) continue;
    typesScored.add(docType);

    switch (docType) {
      case 'farm_registration':
        score += 400;
        break;
      case 'proof_of_address':
        score += 300;
        break;
      case 'national_id':
        score += 200;
        break;
      default:
        score += 100;
        break;
    }
  }

  return Math.min(1000, score);
}
