'use client';

import { useState, useEffect, useCallback } from 'react';
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
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchOrders = useCallback(async () => {
    if (!memberId) { setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('member_id', memberId)
      .order('created_at', { ascending: false });
    setOrders((data as OrderRow[]) || []);
    setLoading(false);
  }, [supabase, memberId]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const createOrder = async (
    memberId: string,
    items: OrderItemInsert[],
    shippingAddress?: Record<string, string>,
    notes?: string
  ) => {
    const subtotal = items.reduce((s, i) => s + i.total_price, 0);
    const discount = 0;
    const shipping = subtotal > 500 ? 0 : 25;
    const tax = Math.round(subtotal * 0.05 * 100) / 100; // 5% tax
    const total = subtotal - discount + shipping + tax;

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        member_id: memberId,
        subtotal,
        discount,
        shipping,
        tax,
        total,
        shipping_address: shippingAddress || null,
        notes: notes || null,
      })
      .select()
      .single();

    if (orderError) return { data: null, error: orderError.message };

    // Create order items
    const orderItems = items.map(item => ({
      order_id: order.id,
      ...item,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) return { data: order as OrderRow, error: itemsError.message };

    // Create pending payment record
    await supabase.from('payments').insert({
      order_id: order.id,
      member_id: memberId,
      amount: total,
      description: `Order ${order.order_number}`,
    });

    // Create commissions for each supplier
    for (const item of items) {
      const { data: supplier } = await supabase
        .from('suppliers')
        .select('commission_rate')
        .eq('id', item.supplier_id)
        .single();

      if (supplier) {
        await supabase.from('commissions').insert({
          supplier_id: item.supplier_id,
          order_id: order.id,
          sale_amount: item.total_price,
          commission_rate: supplier.commission_rate,
          commission_amount: Math.round(item.total_price * (supplier.commission_rate / 100) * 100) / 100,
        });
      }
    }

    // Update supplier total_sales and total_orders
    const supplierTotals = new Map<string, number>();
    items.forEach(i => {
      supplierTotals.set(i.supplier_id, (supplierTotals.get(i.supplier_id) || 0) + i.total_price);
    });

    for (const [sid, amount] of supplierTotals) {
      const { data: sup } = await supabase
        .from('suppliers')
        .select('total_sales, total_orders')
        .eq('id', sid)
        .single();
      if (sup) {
        await supabase.from('suppliers').update({
          total_sales: (sup.total_sales || 0) + amount,
          total_orders: (sup.total_orders || 0) + 1,
        }).eq('id', sid);
      }
    }

    await fetchOrders();
    return { data: order as OrderRow, error: null };
  };

  return { orders, loading, fetchOrders, createOrder };
}
