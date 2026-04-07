'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from './client';

export interface ShipmentRow {
  id: string;
  member_id: string;
  origin: string;
  destination: string;
  cargo_type: string | null;
  weight_kg: number | null;
  status: string;
  carrier: string | null;
  tracking_number: string | null;
  pickup_date: string | null;
  delivery_date: string | null;
  cost: number | null;
  currency: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export function useShipments(memberId?: string) {
  const supabase = useMemo(() => createClient(), []);
  const [shipments, setShipments] = useState<ShipmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchShipments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase.from('shipments').select('*').order('created_at', { ascending: false });
      if (memberId) query = query.eq('member_id', memberId);
      const { data, error: fetchError } = await query;
      if (fetchError) {
        console.error('[useShipments] fetch error:', fetchError);
        setError(fetchError.message);
        setShipments([]);
      } else {
        setShipments((data || []) as ShipmentRow[]);
      }
    } catch (err) {
      console.error('[useShipments] exception:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setShipments([]);
    } finally {
      setLoading(false);
    }
  }, [supabase, memberId]);

  useEffect(() => { fetchShipments(); }, [fetchShipments]);

  const createShipment = async (shipment: Omit<ShipmentRow, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error: insertError } = await supabase.from('shipments').insert(shipment).select().single();
      if (insertError) return { data: null, error: insertError.message };
      await fetchShipments();
      return { data, error: null };
    } catch (err) {
      console.error('[useShipments] createShipment exception:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  };

  const updateShipment = async (id: string, updates: Partial<ShipmentRow>) => {
    try {
      const { error: updateError } = await supabase.from('shipments').update(updates).eq('id', id);
      if (updateError) return { error: updateError.message };
      await fetchShipments();
      return { error: null };
    } catch (err) {
      console.error('[useShipments] updateShipment exception:', err);
      return { error: err instanceof Error ? err.message : 'Unknown error' };
    }
  };

  const stats = {
    total: shipments.length,
    inTransit: shipments.filter(s => s.status === 'in_transit').length,
    delivered: shipments.filter(s => s.status === 'delivered').length,
  };

  return { shipments, loading, error, stats, fetchShipments, refetch: fetchShipments, createShipment, updateShipment };
}
