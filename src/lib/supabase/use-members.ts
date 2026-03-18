'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from './client';
import type { MembershipTier, MemberStatus } from './types';

export interface MemberRow {
  id: string;
  profile_id: string;
  member_id: string;
  tier: MembershipTier;
  status: MemberStatus;
  farm_name: string | null;
  farm_size_ha: number | null;
  primary_crops: string[] | null;
  livestock_types: string[] | null;
  join_date: string;
  expiry_date: string | null;
  bio: string | null;
  certifications: string[] | null;
  credit_score: number;
  total_spent: number;
  created_at: string;
  updated_at: string;
  // Joined profile fields
  profile?: {
    full_name: string;
    email: string;
    phone: string | null;
    avatar_url: string | null;
    country: string | null;
    region: string | null;
  };
}

export function useMembers() {
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    const { data, error: fetchError } = await supabase
      .from('members')
      .select('*, profile:profiles(full_name, email, phone, avatar_url, country, region)')
      .order('created_at', { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      setMembers([]);
    } else {
      setMembers((data as MemberRow[]) || []);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  const updateMember = async (id: string, updates: Partial<MemberRow>) => {
    const { error } = await supabase.from('members').update(updates).eq('id', id);
    if (!error) await fetchMembers();
    return { error: error?.message || null };
  };

  const suspendMember = (id: string) => updateMember(id, { status: 'suspended' as MemberStatus });
  const activateMember = (id: string) => updateMember(id, { status: 'active' as MemberStatus });

  const stats = {
    total: members.length,
    active: members.filter(m => m.status === 'active').length,
    pending: members.filter(m => m.status === 'pending').length,
    suspended: members.filter(m => m.status === 'suspended').length,
  };

  return { members, loading, error, stats, fetchMembers, updateMember, suspendMember, activateMember };
}
