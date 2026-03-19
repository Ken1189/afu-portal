'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from './client';

export interface CooperativeRow {
  id: string;
  name: string;
  country: string;
  region: string | null;
  member_count: number;
  established_date: string | null;
  description: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface CooperativeMemberRow {
  id: string;
  cooperative_id: string;
  member_id: string;
  role: string;
  joined_at: string;
  cooperative?: CooperativeRow;
}

export function useCooperatives(country?: string) {
  const [cooperatives, setCooperatives] = useState<CooperativeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchCooperatives = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('cooperatives').select('*').order('name');
    if (country) query = query.eq('country', country);
    const { data, error: fetchError } = await query;
    if (fetchError) { setError(fetchError.message); setCooperatives([]); }
    else { setCooperatives((data as CooperativeRow[]) || []); }
    setLoading(false);
  }, [supabase, country]);

  useEffect(() => { fetchCooperatives(); }, [fetchCooperatives]);

  return { cooperatives, loading, error, fetchCooperatives };
}

export function useMyCooperatives(memberId?: string) {
  const [memberships, setMemberships] = useState<CooperativeMemberRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchMemberships = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('cooperative_members')
      .select('*, cooperative:cooperatives(*)')
      .order('joined_at', { ascending: false });
    if (memberId) query = query.eq('member_id', memberId);
    const { data, error: fetchError } = await query;
    if (fetchError) { setError(fetchError.message); setMemberships([]); }
    else { setMemberships((data as CooperativeMemberRow[]) || []); }
    setLoading(false);
  }, [supabase, memberId]);

  useEffect(() => { fetchMemberships(); }, [fetchMemberships]);

  const joinCooperative = async (cooperativeId: string, memberId: string) => {
    const { error } = await supabase.from('cooperative_members').insert({ cooperative_id: cooperativeId, member_id: memberId });
    if (!error) await fetchMemberships();
    return { error: error?.message || null };
  };

  return { memberships, loading, error, fetchMemberships, joinCooperative };
}
