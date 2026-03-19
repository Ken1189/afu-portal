'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from './client';

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

export function useLivestock(memberId?: string) {
  const [livestock, setLivestock] = useState<LivestockRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchLivestock = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('livestock').select('*').order('created_at', { ascending: false });
    if (memberId) query = query.eq('member_id', memberId);
    const { data, error: fetchError } = await query;
    if (fetchError) { setError(fetchError.message); setLivestock([]); }
    else { setLivestock((data as LivestockRow[]) || []); }
    setLoading(false);
  }, [supabase, memberId]);

  useEffect(() => { fetchLivestock(); }, [fetchLivestock]);

  const createLivestock = async (item: Omit<LivestockRow, 'id' | 'created_at' | 'updated_at'>) => {
    const { error } = await supabase.from('livestock').insert(item);
    if (!error) await fetchLivestock();
    return { error: error?.message || null };
  };

  const updateLivestock = async (id: string, updates: Partial<LivestockRow>) => {
    const { error } = await supabase.from('livestock').update(updates).eq('id', id);
    if (!error) await fetchLivestock();
    return { error: error?.message || null };
  };

  const totalCount = livestock.reduce((s, l) => s + l.count, 0);
  const totalValue = livestock.reduce((s, l) => s + (l.value_estimate || 0), 0);

  return { livestock, loading, error, totalCount, totalValue, fetchLivestock, createLivestock, updateLivestock };
}

export function useLivestockHealth(livestockId: string) {
  const [records, setRecords] = useState<LivestockHealthRecordRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    const { data, error: fetchError } = await supabase
      .from('livestock_health_records')
      .select('*')
      .eq('livestock_id', livestockId)
      .order('date', { ascending: false });
    if (fetchError) { setError(fetchError.message); setRecords([]); }
    else { setRecords((data as LivestockHealthRecordRow[]) || []); }
    setLoading(false);
  }, [supabase, livestockId]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  const addRecord = async (record: Omit<LivestockHealthRecordRow, 'id' | 'created_at'>) => {
    const { error } = await supabase.from('livestock_health_records').insert(record);
    if (!error) await fetchRecords();
    return { error: error?.message || null };
  };

  return { records, loading, error, fetchRecords, addRecord };
}
