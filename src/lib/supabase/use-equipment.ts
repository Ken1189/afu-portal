'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from './client';

export interface EquipmentRow {
  id: string;
  name: string;
  type: string;
  description: string | null;
  daily_rate: number;
  currency: string;
  owner_id: string | null;
  location: string | null;
  country: string | null;
  status: string;
  image_url: string | null;
  specifications: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface EquipmentBookingRow {
  id: string;
  equipment_id: string;
  member_id: string;
  start_date: string;
  end_date: string;
  total_cost: number;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  equipment?: EquipmentRow;
}

export function useEquipment(country?: string) {
  const [equipment, setEquipment] = useState<EquipmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchEquipment = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('equipment').select('*').order('name');
    if (country) query = query.eq('country', country);
    const { data, error: fetchError } = await query;
    if (fetchError) { setError(fetchError.message); setEquipment([]); }
    else { setEquipment((data as EquipmentRow[]) || []); }
    setLoading(false);
  }, [supabase, country]);

  useEffect(() => { fetchEquipment(); }, [fetchEquipment]);

  const available = equipment.filter(e => e.status === 'available');

  return { equipment, available, loading, error, fetchEquipment };
}

export function useEquipmentBookings(memberId?: string) {
  const [bookings, setBookings] = useState<EquipmentBookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('equipment_bookings')
      .select('*, equipment:equipment(*)')
      .order('created_at', { ascending: false });
    if (memberId) query = query.eq('member_id', memberId);
    const { data, error: fetchError } = await query;
    if (fetchError) { setError(fetchError.message); setBookings([]); }
    else { setBookings((data as EquipmentBookingRow[]) || []); }
    setLoading(false);
  }, [supabase, memberId]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const createBooking = async (booking: Omit<EquipmentBookingRow, 'id' | 'created_at' | 'updated_at' | 'status' | 'equipment'>) => {
    const { error } = await supabase.from('equipment_bookings').insert(booking);
    if (!error) await fetchBookings();
    return { error: error?.message || null };
  };

  const cancelBooking = async (id: string) => {
    const { error } = await supabase.from('equipment_bookings').update({ status: 'cancelled' }).eq('id', id);
    if (!error) await fetchBookings();
    return { error: error?.message || null };
  };

  return { bookings, loading, error, fetchBookings, createBooking, cancelBooking };
}
