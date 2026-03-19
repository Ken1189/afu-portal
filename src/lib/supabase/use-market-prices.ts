'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from './client';

export interface MarketPriceRow {
  id: string;
  commodity: string;
  market_location: string | null;
  country: string | null;
  price: number;
  currency: string;
  unit: string;
  date: string;
  source: string | null;
  created_at: string;
}

export interface MarketPriceAlertRow {
  id: string;
  member_id: string;
  commodity: string;
  target_price: number;
  direction: string;
  active: boolean;
  triggered_at: string | null;
  created_at: string;
}

export function useMarketPrices(commodity?: string, country?: string) {
  const [prices, setPrices] = useState<MarketPriceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchPrices = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('market_prices').select('*').order('date', { ascending: false }).limit(200);
    if (commodity) query = query.eq('commodity', commodity);
    if (country) query = query.eq('country', country);
    const { data, error: fetchError } = await query;
    if (fetchError) { setError(fetchError.message); setPrices([]); }
    else { setPrices((data as MarketPriceRow[]) || []); }
    setLoading(false);
  }, [supabase, commodity, country]);

  useEffect(() => { fetchPrices(); }, [fetchPrices]);

  const commodities = [...new Set(prices.map(p => p.commodity))];

  return { prices, commodities, loading, error, fetchPrices };
}

export function useMarketAlerts(memberId?: string) {
  const [alerts, setAlerts] = useState<MarketPriceAlertRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('market_price_alerts').select('*').order('created_at', { ascending: false });
    if (memberId) query = query.eq('member_id', memberId);
    const { data, error: fetchError } = await query;
    if (fetchError) { setError(fetchError.message); setAlerts([]); }
    else { setAlerts((data as MarketPriceAlertRow[]) || []); }
    setLoading(false);
  }, [supabase, memberId]);

  useEffect(() => { fetchAlerts(); }, [fetchAlerts]);

  const createAlert = async (alert: Omit<MarketPriceAlertRow, 'id' | 'created_at' | 'triggered_at' | 'active'>) => {
    const { error } = await supabase.from('market_price_alerts').insert(alert);
    if (!error) await fetchAlerts();
    return { error: error?.message || null };
  };

  const deleteAlert = async (id: string) => {
    const { error } = await supabase.from('market_price_alerts').delete().eq('id', id);
    if (!error) await fetchAlerts();
    return { error: error?.message || null };
  };

  return { alerts, loading, error, fetchAlerts, createAlert, deleteAlert };
}
