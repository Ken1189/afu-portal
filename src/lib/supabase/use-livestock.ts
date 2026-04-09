'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from './client';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LivestockRow {
  id: string;
  member_id: string;
  type: string;
  breed: string | null;
  count: number;
  tag_id: string | null;
  health_status: string;
  location: string | null;
  value_estimate: number | null;
  date_acquired: string | null;
  notes: string | null;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface LivestockHealthRecordRow {
  id: string;
  livestock_id: string;
  event_type: string;
  date: string;
  description: string | null;
  vet_name: string | null;
  cost: number;
  next_due_date: string | null;
  created_at: string;
}

// ---------------------------------------------------------------------------
// useLivestock — fetch livestock for current member
// ---------------------------------------------------------------------------

export function useLivestock(memberId?: string, farmId?: string | null) {
  const supabase = useMemo(() => createClient(), []);
  const [livestock, setLivestock] = useState<LivestockRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLivestock = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('livestock')
        .select('*')
        .order('created_at', { ascending: false });

      // Filter by farm when available, fall back to member_id
      if (farmId) {
        query = query.eq('farm_id', farmId);
      } else if (memberId) {
        query = query.eq('member_id', memberId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        console.error('[useLivestock] fetch error:', fetchError);
        setError(fetchError.message);
        setLivestock([]);
      } else {
        setLivestock((data || []) as LivestockRow[]);
      }
    } catch (err) {
      console.error('[useLivestock] exception:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLivestock([]);
    } finally {
      setLoading(false);
    }
  }, [supabase, memberId, farmId]);

  useEffect(() => {
    fetchLivestock();
  }, [fetchLivestock]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('livestock-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'livestock' }, () => {
        fetchLivestock();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, fetchLivestock]);

  const totalCount = livestock.reduce((s, l) => s + l.count, 0);
  const totalValue = livestock.reduce((s, l) => s + (l.value_estimate || 0), 0);

  return { livestock, loading, error, totalCount, totalValue, fetchLivestock, refetch: fetchLivestock };
}

// ---------------------------------------------------------------------------
// useCreateLivestock — insert livestock
// ---------------------------------------------------------------------------

export function useCreateLivestock() {
  const supabase = useMemo(() => createClient(), []);

  const createLivestock = async (
    item: Omit<LivestockRow, 'id' | 'created_at' | 'updated_at'>
  ) => {
    try {
      const { data, error } = await supabase.from('livestock').insert(item).select().single();
      if (error) return { data: null, error: error.message };
      return { data, error: null };
    } catch (err) {
      console.error('[useCreateLivestock] exception:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  };

  return { createLivestock };
}

// ---------------------------------------------------------------------------
// useUpdateLivestock — update livestock
// ---------------------------------------------------------------------------

export function useUpdateLivestock() {
  const supabase = useMemo(() => createClient(), []);

  const updateLivestock = async (id: string, updates: Partial<LivestockRow>) => {
    try {
      const { data, error } = await supabase.from('livestock').update(updates).eq('id', id).select().single();
      if (error) return { data: null, error: error.message };
      return { data, error: null };
    } catch (err) {
      console.error('[useUpdateLivestock] exception:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  };

  return { updateLivestock };
}

// ---------------------------------------------------------------------------
// useLivestockHealthRecords — fetch health records for a livestock entry
// ---------------------------------------------------------------------------

export function useLivestockHealthRecords(livestockId: string) {
  const supabase = useMemo(() => createClient(), []);
  const [records, setRecords] = useState<LivestockHealthRecordRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('livestock_health_records')
        .select('*')
        .eq('livestock_id', livestockId)
        .order('date', { ascending: false });

      if (fetchError) {
        console.error('[useLivestockHealthRecords] fetch error:', fetchError);
        setError(fetchError.message);
        setRecords([]);
      } else {
        setRecords((data || []) as LivestockHealthRecordRow[]);
      }
    } catch (err) {
      console.error('[useLivestockHealthRecords] exception:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [supabase, livestockId]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`livestock-health-${livestockId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'livestock_health_records' }, () => {
        fetchRecords();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, livestockId, fetchRecords]);

  return { records, loading, error, fetchRecords, refetch: fetchRecords };
}

// ---------------------------------------------------------------------------
// useCreateHealthRecord — insert health record
// ---------------------------------------------------------------------------

export function useCreateHealthRecord() {
  const supabase = useMemo(() => createClient(), []);

  const createHealthRecord = async (
    record: Omit<LivestockHealthRecordRow, 'id' | 'created_at'>
  ) => {
    try {
      const { data, error } = await supabase.from('livestock_health_records').insert(record).select().single();
      if (error) return { data: null, error: error.message };
      return { data, error: null };
    } catch (err) {
      console.error('[useCreateHealthRecord] exception:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  };

  return { createHealthRecord };
}
