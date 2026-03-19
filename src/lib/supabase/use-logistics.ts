'use client';

import { useState, useEffect, useCallback } from 'react';
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
  const [shipments, setShipments] = useState<ShipmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchShipments = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('shipments').select('*').order('created_at', { ascending: false });
    if (memberId) query = query.eq('member_id', memberId);
    const { data, error: fetchError } = await query;
    if (fetchError) { setError(fetchError.message); setShipments([]); }
    else { setShipments((data as ShipmentRow[]) || []); }
    setLoading(false);
  }, [supabase, memberId]);

  useEffect(() => { fetchShipments(); }, [fetchShipments]);

  const createShipment = async (shipment: Omit<ShipmentRow, 'id' | 'created_at' | 'updated_at'>) => {
    const { error } = await supabase.from('shipments').insert(shipment);
    if (!error) await fetchShipments();
    return { error: error?.message || null };
  };

  const updateShipment = async (id: string, updates: Partial<ShipmentRow>) => {
    const { error } = await supabase.from('shipments').update(updates).eq('id', id);
    if (!error) await fetchShipments();
    return { error: error?.message || null };
  };

  const stats = {
    total: shipments.length,
    inTransit: shipments.filter(s => s.status === 'in_transit').length,
    delivered: shipments.filter(s => s.status === 'delivered').length,
  };

  return { shipments, loading, error, stats, fetchShipments, createShipment, updateShipment };
}
