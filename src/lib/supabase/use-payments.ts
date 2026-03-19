'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from './client';

export interface PaymentRow {
  id: string;
  member_id: string;
  gateway_id: string | null;
  purpose: string;
  method: string;
  provider: string;
  amount: number;
  currency: string;
  status: string;
  provider_reference: string | null;
  phone_number: string | null;
  description: string | null;
  metadata: Record<string, unknown>;
  related_entity_type: string | null;
  related_entity_id: string | null;
  error_message: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaymentAttemptRow {
  id: string;
  payment_id: string;
  gateway_id: string | null;
  amount: number;
  currency: string;
  status: string;
  provider_reference: string | null;
  provider_response: Record<string, unknown>;
  error_message: string | null;
  created_at: string;
}

export interface PaymentGatewayRow {
  id: string;
  name: string;
  provider: string;
  country: string;
  config: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function usePayments(filters?: { status?: string; purpose?: string }) {
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.purpose) query = query.eq('purpose', filters.purpose);

    const { data, error: fetchError } = await query;

    if (fetchError) {
      setError(fetchError.message);
      setPayments([]);
    } else {
      setPayments((data as PaymentRow[]) || []);
    }
    setLoading(false);
  }, [supabase, filters?.status, filters?.purpose]);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  return { payments, loading, error, refetch: fetchPayments };
}

export function usePaymentDetail(paymentId: string | null) {
  const [payment, setPayment] = useState<PaymentRow | null>(null);
  const [attempts, setAttempts] = useState<PaymentAttemptRow[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchDetail = useCallback(async () => {
    if (!paymentId) { setLoading(false); return; }
    setLoading(true);

    const [paymentRes, attemptsRes] = await Promise.all([
      supabase.from('payments').select('*').eq('id', paymentId).single(),
      supabase.from('payment_attempts').select('*').eq('payment_id', paymentId).order('created_at', { ascending: false }),
    ]);

    if (paymentRes.data) setPayment(paymentRes.data as PaymentRow);
    if (attemptsRes.data) setAttempts((attemptsRes.data as PaymentAttemptRow[]) || []);
    setLoading(false);
  }, [supabase, paymentId]);

  useEffect(() => { fetchDetail(); }, [fetchDetail]);

  return { payment, attempts, loading, refetch: fetchDetail };
}

export function usePaymentGateways(country?: string) {
  const [gateways, setGateways] = useState<PaymentGatewayRow[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchGateways = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('payment_gateways')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (country) query = query.eq('country', country);

    const { data, error } = await query;
    if (!error && data) setGateways(data as PaymentGatewayRow[]);
    setLoading(false);
  }, [supabase, country]);

  useEffect(() => { fetchGateways(); }, [fetchGateways]);

  return { gateways, loading };
}
