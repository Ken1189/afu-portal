'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from './client';
import { captureError } from '@/lib/capture-error';

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
  const supabase = useMemo(() => createClient(), []);
  const [activities, setActivities] = useState<FarmActivityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase.from('farm_activities').select('*').order('date', { ascending: false });
      if (memberId) query = query.eq('member_id', memberId);
      const { data, error: fetchError } = await query;
      if (fetchError) {
        console.error('[useFarmActivities] fetch error:', fetchError);
        setError(fetchError.message);
        setActivities([]);
      } else {
        setActivities((data || []) as FarmActivityRow[]);
      }
    } catch (err) {
      captureError('useFarmActivities.fetch', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }, [supabase, memberId]);

  useEffect(() => { fetchActivities(); }, [fetchActivities]);

  const createActivity = async (activity: Omit<FarmActivityRow, 'id' | 'created_at'>) => {
    try {
      const { data, error: insertError } = await supabase.from('farm_activities').insert(activity).select().single();
      if (insertError) return { data: null, error: insertError.message };
      await fetchActivities();
      return { data, error: null };
    } catch (err) {
      captureError('useFarmActivities.createActivity', err);
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  };

  return { activities, loading, error, fetchActivities, refetch: fetchActivities, createActivity };
}
