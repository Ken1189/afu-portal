'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from './client';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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
  member?: {
    id: string;
    profile?: {
      full_name: string;
      email: string;
      avatar_url: string | null;
    };
  };
}

// ---------------------------------------------------------------------------
// useCooperatives — fetch all cooperatives
// ---------------------------------------------------------------------------

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

    if (fetchError) {
      setError(fetchError.message);
      setCooperatives([]);
    } else {
      setCooperatives((data as CooperativeRow[]) || []);
    }
    setLoading(false);
  }, [supabase, country]);

  useEffect(() => {
    fetchCooperatives();
  }, [fetchCooperatives]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('cooperatives-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cooperatives' }, () => {
        fetchCooperatives();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, fetchCooperatives]);

  return { cooperatives, loading, error, fetchCooperatives };
}

// ---------------------------------------------------------------------------
// useCooperativeMembers — fetch members of a cooperative
// ---------------------------------------------------------------------------

export function useCooperativeMembers(cooperativeId: string) {
  const [members, setMembers] = useState<CooperativeMemberRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    const { data, error: fetchError } = await supabase
      .from('cooperative_members')
      .select('*, member:members(id, profile:profiles(full_name, email, avatar_url))')
      .eq('cooperative_id', cooperativeId)
      .order('joined_at', { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      setMembers([]);
    } else {
      setMembers((data as CooperativeMemberRow[]) || []);
    }
    setLoading(false);
  }, [supabase, cooperativeId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`cooperative-members-${cooperativeId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cooperative_members' }, () => {
        fetchMembers();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, cooperativeId, fetchMembers]);

  return { members, loading, error, fetchMembers };
}

// ---------------------------------------------------------------------------
// useJoinCooperative — insert membership
// ---------------------------------------------------------------------------

export function useJoinCooperative() {
  const supabase = createClient();

  const joinCooperative = async (cooperativeId: string, memberId: string) => {
    const { error } = await supabase
      .from('cooperative_members')
      .insert({ cooperative_id: cooperativeId, member_id: memberId });
    return { error: error?.message || null };
  };

  return { joinCooperative };
}
