'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from './client';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// useMarketPrices — fetch prices with optional country / commodity filters
// ---------------------------------------------------------------------------

export function useMarketPrices(country?: string, commodity?: string) {
  const [prices, setPrices] = useState<MarketPriceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchPrices = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('market_prices')
      .select('*')
      .order('date', { ascending: false })
      .limit(200);

    if (country) query = query.eq('country', country);
    if (commodity) query = query.eq('commodity', commodity);

    const { data, error: fetchError } = await query;

    if (fetchError) {
      setError(fetchError.message);
      setPrices([]);
    } else {
      setPrices((data as MarketPriceRow[]) || []);
    }
    setLoading(false);
  }, [supabase, country, commodity]);

  useEffect(() => {
    fetchPrices();
  }, [fetchPrices]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('market-prices-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'market_prices' }, () => {
        fetchPrices();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, fetchPrices]);

  const commodities = [...new Set(prices.map((p) => p.commodity))];

  return { prices, commodities, loading, error, fetchPrices };
}
