'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from './client';

export interface OfftakeContractRow {
  id: string;
  member_id: string;
  buyer_name: string;
  commodity: string;
  quantity: number;
  unit: string;
  price_per_unit: number;
  currency: string;
  delivery_date: string | null;
  status: string;
  contract_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export function useContracts(memberId?: string) {
  const supabase = useMemo(() => createClient(), []);
  const [contracts, setContracts] = useState<OfftakeContractRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContracts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase.from('offtake_contracts').select('*').order('created_at', { ascending: false });
      if (memberId) query = query.eq('member_id', memberId);
      const { data, error: fetchError } = await query;
      if (fetchError) {
        console.error('[useContracts] fetch error:', fetchError);
        setError(fetchError.message);
        setContracts([]);
      } else {
        setContracts((data || []) as OfftakeContractRow[]);
      }
    } catch (err) {
      console.error('[useContracts] exception:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setContracts([]);
    } finally {
      setLoading(false);
    }
  }, [supabase, memberId]);

  useEffect(() => { fetchContracts(); }, [fetchContracts]);

  const createContract = async (contract: Omit<OfftakeContractRow, 'id' | 'created_at' | 'updated_at' | 'status'>) => {
    try {
      const { data, error: insertError } = await supabase.from('offtake_contracts').insert(contract).select().single();
      if (insertError) return { data: null, error: insertError.message };
      await fetchContracts();
      return { data, error: null };
    } catch (err) {
      console.error('[useContracts] createContract exception:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  };

  const updateContract = async (id: string, updates: Partial<OfftakeContractRow>) => {
    try {
      const { error: updateError } = await supabase.from('offtake_contracts').update(updates).eq('id', id);
      if (updateError) return { error: updateError.message };
      await fetchContracts();
      return { error: null };
    } catch (err) {
      console.error('[useContracts] updateContract exception:', err);
      return { error: err instanceof Error ? err.message : 'Unknown error' };
    }
  };

  const totalValue = contracts.reduce((s, c) => s + (c.quantity * c.price_per_unit), 0);
  const activeContracts = contracts.filter(c => c.status === 'active');

  return { contracts, activeContracts, totalValue, loading, error, fetchContracts, refetch: fetchContracts, createContract, updateContract };
}
