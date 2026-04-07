'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from './client';

export interface FarmTransactionRow {
  id: string;
  member_id: string;
  type: string;
  category: string;
  amount: number;
  currency: string;
  date: string;
  description: string | null;
  plot_id: string | null;
  created_at: string;
}

export function useFarmTransactions(memberId?: string) {
  const supabase = useMemo(() => createClient(), []);
  const [transactions, setTransactions] = useState<FarmTransactionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase.from('farm_transactions').select('*').order('date', { ascending: false });
      if (memberId) query = query.eq('member_id', memberId);
      const { data, error: fetchError } = await query;
      if (fetchError) {
        console.error('[useFarmTransactions] fetch error:', fetchError);
        setError(fetchError.message);
        setTransactions([]);
      } else {
        setTransactions((data || []) as FarmTransactionRow[]);
      }
    } catch (err) {
      console.error('[useFarmTransactions] exception:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [supabase, memberId]);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  const createTransaction = async (tx: Omit<FarmTransactionRow, 'id' | 'created_at'>) => {
    try {
      const { data, error: insertError } = await supabase.from('farm_transactions').insert(tx).select().single();
      if (insertError) return { data: null, error: insertError.message };
      await fetchTransactions();
      return { data, error: null };
    } catch (err) {
      console.error('[useFarmTransactions] createTransaction exception:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  };

  const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expenses = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  return { transactions, loading, error, income, expenses, balance: income - expenses, fetchTransactions, refetch: fetchTransactions, createTransaction };
}
