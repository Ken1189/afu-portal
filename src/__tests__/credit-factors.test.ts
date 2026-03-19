import { describe, it, expect } from 'vitest';
import {
  scorePaymentHistory,
  scoreLoanRepayment,
  scoreFarmProductivity,
  scoreMembershipTenure,
  scoreTrainingCompletion,
  scoreCooperativeMembership,
  scoreCollateral,
} from '@/lib/credit/factors';

describe('Credit Score Factors', () => {
  describe('scorePaymentHistory', () => {
    it('returns 1000 for all completed payments', () => {
      const payments = [
        { status: 'completed' },
        { status: 'completed' },
        { status: 'completed' },
      ];
      expect(scorePaymentHistory(payments)).toBe(1000);
    });

    it('returns 0 for no payments', () => {
      expect(scorePaymentHistory([])).toBe(0);
    });

    it('reduces score for failed payments', () => {
      const payments = [
        { status: 'completed' },
        { status: 'failed' },
        { status: 'completed' },
      ];
      const score = scorePaymentHistory(payments);
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThan(1000);
    });
  });

  describe('scoreLoanRepayment', () => {
    it('returns 1000 for all on-time payments', () => {
      const schedules = [
        { status: 'paid', due_date: '2025-01-01', paid_at: '2025-01-01' },
        { status: 'paid', due_date: '2025-02-01', paid_at: '2025-01-30' },
      ];
      expect(scoreLoanRepayment(schedules)).toBe(1000);
    });

    it('returns 0 for no loan schedules', () => {
      expect(scoreLoanRepayment([])).toBe(0);
    });

    it('penalizes overdue payments', () => {
      const schedules = [
        { status: 'paid', due_date: '2025-01-01', paid_at: '2025-01-01' },
        { status: 'overdue', due_date: '2025-02-01', paid_at: null },
      ];
      const score = scoreLoanRepayment(schedules);
      expect(score).toBeLessThan(1000);
    });
  });

  describe('scoreFarmProductivity', () => {
    it('returns score based on average health', () => {
      const plots = [
        { health_score: 90 },
        { health_score: 80 },
      ];
      const score = scoreFarmProductivity(plots);
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(1000);
    });

    it('returns 0 for no plots', () => {
      expect(scoreFarmProductivity([])).toBe(0);
    });

    it('handles null health scores', () => {
      const plots = [{ health_score: null }, { health_score: 70 }];
      const score = scoreFarmProductivity(plots);
      expect(score).toBeGreaterThanOrEqual(0);
    });
  });

  describe('scoreMembershipTenure', () => {
    it('returns 0 for brand new member', () => {
      const today = new Date().toISOString();
      expect(scoreMembershipTenure(today)).toBeLessThan(100);
    });

    it('returns high score for 2+ year member', () => {
      const twoYearsAgo = new Date();
      twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 3);
      expect(scoreMembershipTenure(twoYearsAgo.toISOString())).toBe(1000);
    });

    it('returns mid score for 1 year member', () => {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      const score = scoreMembershipTenure(oneYearAgo.toISOString());
      expect(score).toBeGreaterThan(500);
      expect(score).toBeLessThan(1000);
    });
  });

  describe('scoreTrainingCompletion', () => {
    it('returns 1000 for completing all courses', () => {
      const enrollments = [
        { progress_percent: 100 },
        { progress_percent: 100 },
      ];
      expect(scoreTrainingCompletion(enrollments, 2)).toBe(1000);
    });

    it('returns 0 for no enrollments', () => {
      expect(scoreTrainingCompletion([], 10)).toBe(0);
    });
  });

  describe('scoreCooperativeMembership', () => {
    it('returns 0 for no memberships', () => {
      expect(scoreCooperativeMembership([])).toBe(0);
    });

    it('returns higher for officer role', () => {
      const memberScore = scoreCooperativeMembership([{ role: 'member' }]);
      const officerScore = scoreCooperativeMembership([{ role: 'officer' }]);
      expect(officerScore).toBeGreaterThan(memberScore);
    });
  });

  describe('scoreCollateral', () => {
    it('returns 0 for no documents', () => {
      expect(scoreCollateral([])).toBe(0);
    });

    it('returns higher for verified documents', () => {
      const unverified = scoreCollateral([
        { document_type: 'national_id', verification_status: 'pending' },
      ]);
      const verified = scoreCollateral([
        { document_type: 'national_id', verification_status: 'verified' },
      ]);
      expect(verified).toBeGreaterThan(unverified);
    });
  });
});
