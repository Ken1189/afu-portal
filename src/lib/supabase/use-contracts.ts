'use client';

import { useState, useEffect, useCallback } from 'react';
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
  const [contracts, setContracts] = useState<OfftakeContractRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchContracts = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('offtake_contracts').select('*').order('created_at', { ascending: false });
    if (memberId) query = query.eq('member_id', memberId);
    const { data, error: fetchError } = await query;
    if (fetchError) { setError(fetchError.message); setContracts([]); }
    else { setContracts((data as OfftakeContractRow[]) || []); }
    setLoading(false);
  }, [supabase, memberId]);

  useEffect(() => { fetchContracts(); }, [fetchContracts]);

  const createContract = async (contract: Omit<OfftakeContractRow, 'id' | 'created_at' | 'updated_at' | 'status'>) => {
    const { error } = await supabase.from('offtake_contracts').insert(contract);
    if (!error) await fetchContracts();
    return { error: error?.message || null };
  };

  const updateContract = async (id: string, updates: Partial<OfftakeContractRow>) => {
    const { error } = await supabase.from('offtake_contracts').update(updates).eq('id', id);
    if (!error) await fetchContracts();
    return { error: error?.message || null };
  };

  const totalValue = contracts.reduce((s, c) => s + (c.quantity * c.price_per_unit), 0);
  const activeContracts = contracts.filter(c => c.status === 'active');

  return { contracts, activeContracts, totalValue, loading, error, fetchContracts, createContract, updateContract };
}
