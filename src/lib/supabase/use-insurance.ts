'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from './client';

export interface InsuranceProductRow {
  id: string;
  name: string;
  type: string;
  description: string | null;
  coverage_details: Record<string, unknown> | null;
  premium_range: { min: number; max: number; currency: string } | null;
  deductible_percent: number;
  waiting_period_days: number;
  eligibility: string[] | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface InsurancePolicyRow {
  id: string;
  product_id: string;
  member_id: string;
  policy_number: string;
  status: string;
  start_date: string;
  end_date: string;
  premium: number;
  coverage_amount: number;
  created_at: string;
  updated_at: string;
  product?: InsuranceProductRow;
}

export interface InsuranceClaimRow {
  id: string;
  policy_id: string;
  member_id: string;
  status: string;
  claim_amount: number;
  approved_amount: number | null;
  description: string | null;
  evidence_urls: string[] | null;
  submitted_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
}

export function useInsuranceProducts() {
  const [products, setProducts] = useState<InsuranceProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const { data, error: fetchError } = await supabase
      .from('insurance_products')
      .select('*')
      .eq('active', true)
      .order('name');
    if (fetchError) { setError(fetchError.message); setProducts([]); }
    else { setProducts((data as InsuranceProductRow[]) || []); }
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  return { products, loading, error, fetchProducts };
}

export function useInsurancePolicies(memberId?: string) {
  const [policies, setPolicies] = useState<InsurancePolicyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchPolicies = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('insurance_policies')
      .select('*, product:insurance_products(*)')
      .order('created_at', { ascending: false });
    if (memberId) query = query.eq('member_id', memberId);
    const { data, error: fetchError } = await query;
    if (fetchError) { setError(fetchError.message); setPolicies([]); }
    else { setPolicies((data as InsurancePolicyRow[]) || []); }
    setLoading(false);
  }, [supabase, memberId]);

  useEffect(() => { fetchPolicies(); }, [fetchPolicies]);

  const stats = {
    total: policies.length,
    active: policies.filter(p => p.status === 'active').length,
    totalCoverage: policies.filter(p => p.status === 'active').reduce((s, p) => s + p.coverage_amount, 0),
    totalPremium: policies.filter(p => p.status === 'active').reduce((s, p) => s + p.premium, 0),
  };

  return { policies, loading, error, stats, fetchPolicies };
}

export function useInsuranceClaims(memberId?: string) {
  const [claims, setClaims] = useState<InsuranceClaimRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchClaims = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('insurance_claims').select('*').order('submitted_at', { ascending: false });
    if (memberId) query = query.eq('member_id', memberId);
    const { data, error: fetchError } = await query;
    if (fetchError) { setError(fetchError.message); setClaims([]); }
    else { setClaims((data as InsuranceClaimRow[]) || []); }
    setLoading(false);
  }, [supabase, memberId]);

  useEffect(() => { fetchClaims(); }, [fetchClaims]);

  const submitClaim = async (claim: Omit<InsuranceClaimRow, 'id' | 'submitted_at' | 'reviewed_at' | 'reviewed_by' | 'approved_amount' | 'status'>) => {
    const { error } = await supabase.from('insurance_claims').insert(claim);
    if (!error) await fetchClaims();
    return { error: error?.message || null };
  };

  return { claims, loading, error, fetchClaims, submitClaim };
}
