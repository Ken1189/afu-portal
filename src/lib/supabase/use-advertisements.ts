'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from './client';

export interface AdvertisementRow {
  id: string;
  supplier_id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  target_countries: string[] | null;
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  status: string;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

export function useAdvertisements(supplierId?: string) {
  const supabase = useMemo(() => createClient(), []);
  const [ads, setAds] = useState<AdvertisementRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAds = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase.from('advertisements').select('*').order('created_at', { ascending: false });
      if (supplierId) query = query.eq('supplier_id', supplierId);
      const { data, error: fetchError } = await query;
      if (fetchError) {
        console.error('[useAdvertisements] fetch error:', fetchError);
        setError(fetchError.message);
        setAds([]);
      } else {
        setAds((data || []) as AdvertisementRow[]);
      }
    } catch (err) {
      console.error('[useAdvertisements] exception:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setAds([]);
    } finally {
      setLoading(false);
    }
  }, [supabase, supplierId]);

  useEffect(() => { fetchAds(); }, [fetchAds]);

  const createAd = async (ad: Omit<AdvertisementRow, 'id' | 'created_at' | 'updated_at' | 'spent' | 'impressions' | 'clicks'>) => {
    try {
      const { data, error: insertError } = await supabase.from('advertisements').insert(ad).select().single();
      if (insertError) return { data: null, error: insertError.message };
      await fetchAds();
      return { data, error: null };
    } catch (err) {
      console.error('[useAdvertisements] createAd exception:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  };

  const updateAd = async (id: string, updates: Partial<AdvertisementRow>) => {
    try {
      const { error: updateError } = await supabase.from('advertisements').update(updates).eq('id', id);
      if (updateError) return { error: updateError.message };
      await fetchAds();
      return { error: null };
    } catch (err) {
      console.error('[useAdvertisements] updateAd exception:', err);
      return { error: err instanceof Error ? err.message : 'Unknown error' };
    }
  };

  const totalSpent = ads.reduce((s, a) => s + a.spent, 0);
  const totalImpressions = ads.reduce((s, a) => s + a.impressions, 0);
  const totalClicks = ads.reduce((s, a) => s + a.clicks, 0);

  return { ads, totalSpent, totalImpressions, totalClicks, loading, error, fetchAds, refetch: fetchAds, createAd, updateAd };
}
