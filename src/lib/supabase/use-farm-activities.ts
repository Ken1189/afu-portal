'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from './client';

export interface FarmActivityRow {
  id: string;
  plot_id: string | null;
  member_id: string;
  type: string;
  date: string;
  description: string | null;
  notes: string | null;
  photo_url: string | null;
  cost: number;
  currency: string;
  created_at: string;
}

export function useFarmActivities(memberId?: string) {
  const [activities, setActivities] = useState<FarmActivityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('farm_activities').select('*').order('date', { ascending: false });
    if (memberId) query = query.eq('member_id', memberId);
    const { data, error: fetchError } = await query;
    if (fetchError) { setError(fetchError.message); setActivities([]); }
    else { setActivities((data as FarmActivityRow[]) || []); }
    setLoading(false);
  }, [supabase, memberId]);

  useEffect(() => { fetchActivities(); }, [fetchActivities]);

  const createActivity = async (activity: Omit<FarmActivityRow, 'id' | 'created_at'>) => {
    const { error } = await supabase.from('farm_activities').insert(activity);
    if (!error) await fetchActivities();
    return { error: error?.message || null };
  };

  return { activities, loading, error, fetchActivities, createActivity };
}
