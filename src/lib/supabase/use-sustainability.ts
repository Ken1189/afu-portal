'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from './client';

export interface CarbonCreditRow {
  id: string;
  member_id: string;
  project_type: string;
  credits_earned: number;
  verification_status: string;
  vintage_year: number | null;
  registry: string | null;
  value_usd: number | null;
  created_at: string;
  updated_at: string;
}

export function useCarbonCredits(memberId?: string) {
  const [credits, setCredits] = useState<CarbonCreditRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchCredits = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('carbon_credits').select('*').order('created_at', { ascending: false });
    if (memberId) query = query.eq('member_id', memberId);
    const { data, error: fetchError } = await query;
    if (fetchError) { setError(fetchError.message); setCredits([]); }
    else { setCredits((data as CarbonCreditRow[]) || []); }
    setLoading(false);
  }, [supabase, memberId]);

  useEffect(() => { fetchCredits(); }, [fetchCredits]);

  const totalCredits = credits.reduce((s, c) => s + c.credits_earned, 0);
  const totalValue = credits.reduce((s, c) => s + (c.value_usd || 0), 0);
  const verified = credits.filter(c => c.verification_status === 'verified');

  return { credits, totalCredits, totalValue, verified, loading, error, fetchCredits };
}
