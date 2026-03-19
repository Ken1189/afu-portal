'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from './client';

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
  created_at: string;
  updated_at: string;
}

export function useFarmPlots(memberId?: string) {
  const [plots, setPlots] = useState<FarmPlotRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchPlots = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('farm_plots').select('*').order('created_at', { ascending: false });
    if (memberId) query = query.eq('member_id', memberId);
    const { data, error: fetchError } = await query;
    if (fetchError) { setError(fetchError.message); setPlots([]); }
    else { setPlots((data as FarmPlotRow[]) || []); }
    setLoading(false);
  }, [supabase, memberId]);

  useEffect(() => { fetchPlots(); }, [fetchPlots]);

  const createPlot = async (plot: Omit<FarmPlotRow, 'id' | 'created_at' | 'updated_at' | 'health_score'>) => {
    const { error } = await supabase.from('farm_plots').insert(plot);
    if (!error) await fetchPlots();
    return { error: error?.message || null };
  };

  const updatePlot = async (id: string, updates: Partial<FarmPlotRow>) => {
    const { error } = await supabase.from('farm_plots').update(updates).eq('id', id);
    if (!error) await fetchPlots();
    return { error: error?.message || null };
  };

  const deletePlot = async (id: string) => {
    const { error } = await supabase.from('farm_plots').delete().eq('id', id);
    if (!error) await fetchPlots();
    return { error: error?.message || null };
  };

  const stats = {
    total: plots.length,
    totalArea: plots.reduce((sum, p) => sum + (p.size_ha || 0), 0),
    avgHealth: plots.length ? Math.round(plots.reduce((sum, p) => sum + p.health_score, 0) / plots.length) : 0,
  };

  return { plots, loading, error, stats, fetchPlots, createPlot, updatePlot, deletePlot };
}
