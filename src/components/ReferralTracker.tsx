'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

/**
 * Global referral tracker — captures `?ref=CODE` from ANY page URL
 * and stores it in localStorage so it persists across sessions,
 * page navigations, and tab closures.
 *
 * Mounted once in the root layout so every page captures the param.
 * The apply page reads from localStorage when submitting.
 *
 * Also stores the timestamp so we can expire stale codes (30 days).
 */

const STORAGE_KEY = 'afu_referral_code';
const TIMESTAMP_KEY = 'afu_referral_ts';
const EXPIRY_DAYS = 30;

function ReferralTrackerInner() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref && ref.trim()) {
      // Always overwrite with the latest referral code
      localStorage.setItem(STORAGE_KEY, ref.trim());
      localStorage.setItem(TIMESTAMP_KEY, Date.now().toString());
    } else {
      // Check if existing code has expired
      const ts = localStorage.getItem(TIMESTAMP_KEY);
      if (ts) {
        const age = Date.now() - parseInt(ts, 10);
        if (age > EXPIRY_DAYS * 24 * 60 * 60 * 1000) {
          localStorage.removeItem(STORAGE_KEY);
          localStorage.removeItem(TIMESTAMP_KEY);
        }
      }
    }

    // Also migrate from old sessionStorage key if present
    const oldCode = sessionStorage.getItem('afu_referral_code');
    if (oldCode && !localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, oldCode);
      localStorage.setItem(TIMESTAMP_KEY, Date.now().toString());
      sessionStorage.removeItem('afu_referral_code');
    }
  }, [searchParams]);

  return null;
}

export default function ReferralTracker() {
  return (
    <Suspense fallback={null}>
      <ReferralTrackerInner />
    </Suspense>
  );
}

/** Helper to read the referral code from anywhere */
export function getReferralCode(): string | null {
  if (typeof window === 'undefined') return null;
  const code = localStorage.getItem(STORAGE_KEY);
  if (!code) return null;

  // Check expiry
  const ts = localStorage.getItem(TIMESTAMP_KEY);
  if (ts) {
    const age = Date.now() - parseInt(ts, 10);
    if (age > EXPIRY_DAYS * 24 * 60 * 60 * 1000) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(TIMESTAMP_KEY);
      return null;
    }
  }
  return code;
}

/** Clear after successful signup */
export function clearReferralCode(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(TIMESTAMP_KEY);
  sessionStorage.removeItem('afu_referral_code');
}
