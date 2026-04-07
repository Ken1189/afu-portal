'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from './client';
import type { OrderStatus } from './types';

export interface OrderRow {
  id: string;
  order_number: string;
  member_id: string;
  status: OrderStatus;
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  currency: string;
  shipping_address: Record<string, string> | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItemInsert {
  product_id: string;
  supplier_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export function useOrders(memberId?: string) {
  const supabase = useMemo(() => createClient(), []);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    if (!memberId) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .eq('member_id', memberId)
        .order('created_at', { ascending: false });
      if (fetchError) {
        console.error('[useOrders] fetch error:', fetchError);
        setError(fetchError.message);
        setOrders([]);
      } else {
        setOrders((data || []) as OrderRow[]);
      }
    } catch (err) {
      console.error('[useOrders] exception:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [supabase, memberId]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const createOrder = async (
    memberId: string,
    items: OrderItemInsert[],
    shippingAddress?: Record<string, string>,
    notes?: string
  ) => {
    try {
      const subtotal = items.reduce((s, i) => s + i.total_price, 0);
      const discount = 0;
      const shipping = subtotal > 500 ? 0 : 25;
      const tax = Math.round(subtotal * 0.05 * 100) / 100; // 5% tax
      const total = subtotal - discount + shipping + tax;

      // Group items by supplier (orders are per-supplier in atomic RPC)
      const primarySupplierId = items[0]?.supplier_id;
      if (!primarySupplierId) {
        return { data: null, error: 'No supplier in order items' };
      }

      // Atomic order + items creation via RPC (prevents orphaned rows)
      const { data: newOrderId, error: rpcError } = await supabase.rpc('create_order_atomic', {
        p_member_id: memberId,
        p_supplier_id: primarySupplierId,
        p_total: total,
        p_status: 'pending',
        p_items: items,
      });

      if (rpcError) return { data: null, error: rpcError.message };

      // Fetch the created order for return value
      const { data: order, error: fetchErr } = await supabase
        .from('orders')
        .select('*')
        .eq('id', newOrderId)
        .single();

      if (fetchErr || !order) return { data: null, error: fetchErr?.message || 'Order fetch failed' };

      // Apply non-RPC fields (subtotal, discount, shipping, tax, address, notes)
      await supabase
        .from('orders')
        .update({
          subtotal,
          discount,
          shipping,
          tax,
          shipping_address: shippingAddress || null,
          notes: notes || null,
        })
        .eq('id', newOrderId);

      await supabase.from('payments').insert({
        order_id: order.id,
        member_id: memberId,
        amount: total,
        description: `Order ${order.order_number}`,
      });

      const supplierTotals = new Map<string, number>();
      items.forEach(i => {
        supplierTotals.set(i.supplier_id, (supplierTotals.get(i.supplier_id) || 0) + i.total_price);
      });

      for (const [sid, amount] of supplierTotals) {
        await supabase.rpc('increment_supplier_totals', {
          p_supplier_id: sid,
          p_sales: amount,
          p_orders: 1,
        });
      }

      await fetchOrders();
      return { data: order as OrderRow, error: null };
    } catch (err) {
      console.error('[useOrders] createOrder exception:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  };

  return { orders, loading, error, fetchOrders, refetch: fetchOrders, createOrder };
}
