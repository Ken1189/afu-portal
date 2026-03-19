'use client';

import { useState, useEffect, useCallback } from 'react';
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
  const [transactions, setTransactions] = useState<FarmTransactionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('farm_transactions').select('*').order('date', { ascending: false });
    if (memberId) query = query.eq('member_id', memberId);
    const { data, error: fetchError } = await query;
    if (fetchError) { setError(fetchError.message); setTransactions([]); }
    else { setTransactions((data as FarmTransactionRow[]) || []); }
    setLoading(false);
  }, [supabase, memberId]);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  const createTransaction = async (tx: Omit<FarmTransactionRow, 'id' | 'created_at'>) => {
    const { error } = await supabase.from('farm_transactions').insert(tx);
    if (!error) await fetchTransactions();
    return { error: error?.message || null };
  };

  const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expenses = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  return { transactions, loading, error, income, expenses, balance: income - expenses, fetchTransactions, createTransaction };
}
