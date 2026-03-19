'use client';

import { useState, useEffect, useCallback } from 'react';
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
  const [ads, setAds] = useState<AdvertisementRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchAds = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('advertisements').select('*').order('created_at', { ascending: false });
    if (supplierId) query = query.eq('supplier_id', supplierId);
    const { data, error: fetchError } = await query;
    if (fetchError) { setError(fetchError.message); setAds([]); }
    else { setAds((data as AdvertisementRow[]) || []); }
    setLoading(false);
  }, [supabase, supplierId]);

  useEffect(() => { fetchAds(); }, [fetchAds]);

  const createAd = async (ad: Omit<AdvertisementRow, 'id' | 'created_at' | 'updated_at' | 'spent' | 'impressions' | 'clicks'>) => {
    const { error } = await supabase.from('advertisements').insert(ad);
    if (!error) await fetchAds();
    return { error: error?.message || null };
  };

  const updateAd = async (id: string, updates: Partial<AdvertisementRow>) => {
    const { error } = await supabase.from('advertisements').update(updates).eq('id', id);
    if (!error) await fetchAds();
    return { error: error?.message || null };
  };

  const totalSpent = ads.reduce((s, a) => s + a.spent, 0);
  const totalImpressions = ads.reduce((s, a) => s + a.impressions, 0);
  const totalClicks = ads.reduce((s, a) => s + a.clicks, 0);

  return { ads, totalSpent, totalImpressions, totalClicks, loading, error, fetchAds, createAd, updateAd };
}
