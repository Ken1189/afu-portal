'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from './client';
import { captureError } from '@/lib/capture-error';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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
  photo_url: string | null;
  image_url?: string | null;
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

// ---------------------------------------------------------------------------
// useEquipment — fetch available equipment (public read)
// ---------------------------------------------------------------------------

export function useEquipment(country?: string) {
  const supabase = useMemo(() => createClient(), []);
  const [equipment, setEquipment] = useState<EquipmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEquipment = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase.from('equipment').select('*').order('name');
      if (country) query = query.eq('country', country);

      const { data, error: fetchError } = await query;

      if (fetchError) {
        console.error('[useEquipment] fetch error:', fetchError);
        setError(fetchError.message);
        setEquipment([]);
      } else {
        setEquipment((data || []) as EquipmentRow[]);
      }
    } catch (err) {
      captureError('useEquipment.fetch', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setEquipment([]);
    } finally {
      setLoading(false);
    }
  }, [supabase, country]);

  useEffect(() => {
    fetchEquipment();
  }, [fetchEquipment]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('equipment-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'equipment' }, () => {
        fetchEquipment();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, fetchEquipment]);

  const available = equipment.filter((e) => e.status === 'available');

  return { equipment, available, loading, error, fetchEquipment, refetch: fetchEquipment };
}

// ---------------------------------------------------------------------------
// useEquipmentBookings — fetch bookings for a member
// ---------------------------------------------------------------------------

export function useEquipmentBookings(memberId?: string) {
  const supabase = useMemo(() => createClient(), []);
  const [bookings, setBookings] = useState<EquipmentBookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('equipment_bookings')
        .select('*, equipment:equipment(*)')
        .order('created_at', { ascending: false });

      if (memberId) query = query.eq('member_id', memberId);

      const { data, error: fetchError } = await query;

      if (fetchError) {
        console.error('[useEquipmentBookings] fetch error:', fetchError);
        setError(fetchError.message);
        setBookings([]);
      } else {
        setBookings((data || []) as EquipmentBookingRow[]);
      }
    } catch (err) {
      captureError('useEquipmentBookings.fetch', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [supabase, memberId]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('equipment-bookings-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'equipment_bookings' }, () => {
        fetchBookings();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, fetchBookings]);

  const cancelBooking = async (id: string) => {
    try {
      const { error: cancelError } = await supabase
        .from('equipment_bookings')
        .update({ status: 'cancelled' })
        .eq('id', id);
      if (cancelError) return { error: cancelError.message };
      await fetchBookings();
      return { error: null };
    } catch (err) {
      captureError('useEquipmentBookings.cancelBooking', err);
      return { error: err instanceof Error ? err.message : 'Unknown error' };
    }
  };

  return { bookings, loading, error, fetchBookings, refetch: fetchBookings, cancelBooking };
}

// ---------------------------------------------------------------------------
// useCreateBooking — insert booking
// ---------------------------------------------------------------------------

export function useCreateBooking() {
  const supabase = useMemo(() => createClient(), []);

  const createBooking = async (
    booking: Omit<EquipmentBookingRow, 'id' | 'created_at' | 'updated_at' | 'status' | 'equipment'>
  ) => {
    try {
      const { data, error } = await supabase.from('equipment_bookings').insert(booking).select().single();
      if (error) return { data: null, error: error.message };
      return { data, error: null };
    } catch (err) {
      captureError('useCreateBooking', err);
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  };

  return { createBooking };
}
