'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from './client';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FarmPlotRow {
  id: string;
  member_id: string;
  name: string;
  size_ha: number | null;
  crop: string | null;
  variety: string | null;
  stage: string;
  planting_date: string | null;
  expected_harvest: string | null;
  health_score: number;
  soil_ph: number | null;
  location: string | null;
  notes: string | null;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
}

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

// ---------------------------------------------------------------------------
// useFarmPlots — fetch plots for current member
// ---------------------------------------------------------------------------

export function useFarmPlots(memberId?: string) {
  const supabase = useMemo(() => createClient(), []);
  const [plots, setPlots] = useState<FarmPlotRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlots = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('farm_plots')
        .select('*')
        .order('created_at', { ascending: false });

      if (memberId) query = query.eq('member_id', memberId);

      const { data, error: fetchError } = await query;

      if (fetchError) {
        console.error('[useFarmPlots] fetch error:', fetchError);
        setError(fetchError.message);
        setPlots([]);
      } else {
        setPlots((data || []) as FarmPlotRow[]);
      }
    } catch (err) {
      console.error('[useFarmPlots] exception:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setPlots([]);
    } finally {
      setLoading(false);
    }
  }, [supabase, memberId]);

  useEffect(() => {
    fetchPlots();
  }, [fetchPlots]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('farm-plots-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'farm_plots' }, () => {
        fetchPlots();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, fetchPlots]);

  const stats = {
    total: plots.length,
    totalArea: plots.reduce((sum, p) => sum + (p.size_ha || 0), 0),
    avgHealth: plots.length
      ? Math.round(plots.reduce((sum, p) => sum + p.health_score, 0) / plots.length)
      : 0,
  };

  return { plots, loading, error, stats, fetchPlots, refetch: fetchPlots };
}

// ---------------------------------------------------------------------------
// useCreateFarmPlot — insert plot
// ---------------------------------------------------------------------------

export function useCreateFarmPlot() {
  const supabase = useMemo(() => createClient(), []);

  const createPlot = async (
    plot: Omit<FarmPlotRow, 'id' | 'created_at' | 'updated_at' | 'health_score'>
  ) => {
    try {
      const { data, error } = await supabase.from('farm_plots').insert(plot).select().single();
      if (error) return { data: null, error: error.message };
      return { data, error: null };
    } catch (err) {
      console.error('[useCreateFarmPlot] exception:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  };

  return { createPlot };
}

// ---------------------------------------------------------------------------
// useUpdateFarmPlot — update plot
// ---------------------------------------------------------------------------

export function useUpdateFarmPlot() {
  const supabase = useMemo(() => createClient(), []);

  const updatePlot = async (id: string, updates: Partial<FarmPlotRow>) => {
    try {
      const { data, error } = await supabase.from('farm_plots').update(updates).eq('id', id).select().single();
      if (error) return { data: null, error: error.message };
      return { data, error: null };
    } catch (err) {
      console.error('[useUpdateFarmPlot] exception:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  };

  return { updatePlot };
}

// ---------------------------------------------------------------------------
// useFarmActivities — fetch activities, optionally filtered by plotId
// ---------------------------------------------------------------------------

export function useFarmActivities(plotId?: string) {
  const supabase = useMemo(() => createClient(), []);
  const [activities, setActivities] = useState<FarmActivityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('farm_activities')
        .select('*')
        .order('date', { ascending: false });

      if (plotId) query = query.eq('plot_id', plotId);

      const { data, error: fetchError } = await query;

      if (fetchError) {
        console.error('[useFarmActivities] fetch error:', fetchError);
        setError(fetchError.message);
        setActivities([]);
      } else {
        setActivities((data || []) as FarmActivityRow[]);
      }
    } catch (err) {
      console.error('[useFarmActivities] exception:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }, [supabase, plotId]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('farm-activities-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'farm_activities' }, () => {
        fetchActivities();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, fetchActivities]);

  return { activities, loading, error, fetchActivities, refetch: fetchActivities };
}

// ---------------------------------------------------------------------------
// useCreateFarmActivity — insert activity
// ---------------------------------------------------------------------------

export function useCreateFarmActivity() {
  const supabase = useMemo(() => createClient(), []);

  const createActivity = async (
    activity: Omit<FarmActivityRow, 'id' | 'created_at'>
  ) => {
    try {
      const { data, error } = await supabase.from('farm_activities').insert(activity).select().single();
      if (error) return { data: null, error: error.message };
      return { data, error: null };
    } catch (err) {
      console.error('[useCreateFarmActivity] exception:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  };

  return { createActivity };
}

// ---------------------------------------------------------------------------
// useFarmTransactions — fetch transactions for current member
// ---------------------------------------------------------------------------

export function useFarmTransactions(memberId?: string) {
  const supabase = useMemo(() => createClient(), []);
  const [transactions, setTransactions] = useState<FarmTransactionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('farm_transactions')
        .select('*')
        .order('date', { ascending: false });

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

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('farm-transactions-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'farm_transactions' }, () => {
        fetchTransactions();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, fetchTransactions]);

  const income = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expenses = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  return { transactions, loading, error, income, expenses, balance: income - expenses, fetchTransactions, refetch: fetchTransactions };
}
