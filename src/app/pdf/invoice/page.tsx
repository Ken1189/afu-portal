'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2, Printer } from 'lucide-react';

interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  product?: { name: string; sku: string } | null;
}

interface Order {
  id: string;
  order_number: string;
  member_id: string;
  status: string;
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  currency: string;
  shipping_address: Record<string, string> | null;
  notes: string | null;
  created_at: string;
  member?: { farm_name: string | null; profile?: { full_name: string; email: string; phone: string | null; address: string | null } | null } | null;
  items?: OrderItem[];
}

export default function InvoicePdfPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setError('No order ID provided. Add ?id=xxx to the URL.');
      setLoading(false);
      return;
    }

    async function fetchOrder() {
      const supabase = createClient();
      const { data, error: fetchError } = await supabase
        .from('orders')
        .select(`
          *,
          member:members(farm_name, profile:profiles(full_name, email, phone, address)),
          items:order_items(id, product_id, quantity, unit_price, total_price, product:products(name, sku))
        `)
        .eq('id', orderId!)
        .single();

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setOrder(data as unknown as Order);
      }
      setLoading(false);
    }

    fetchOrder();
  }, [orderId]);

  function handlePrint() {
    window.print();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-green" />
        <span className="ml-3 text-navy">Loading invoice...</span>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 font-semibold">Error</p>
          <p className="text-gray-600 mt-1">{error || 'Order not found'}</p>
        </div>
      </div>
    );
  }

  const profile = order.member?.profile;
  const invoiceDate = new Date(order.created_at).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
  const dueDate = new Date(new Date(order.created_at).getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <>
      {/* Print-optimized styles */}
      <style jsx global>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          nav, footer, .site-navbar, .site-footer, .announcement-banner,
          .cookie-consent, .chat-widget, .no-print { display: none !important; }
          @page { margin: 15mm; size: A4; }
        }
        @media screen {
          .invoice-page { max-width: 800px; margin: 0 auto; padding: 40px 24px; }
        }
      `}</style>

      <div className="invoice-page bg-white min-h-screen">
        {/* Print Button */}
        <div className="no-print fixed bottom-6 right-6 z-50 flex gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-green hover:bg-green-dark text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-colors cursor-pointer"
          >
            <Printer className="h-5 w-5" />
            Download PDF
          </button>
        </div>

        {/* Header */}
        <div className="flex justify-between items-start pb-5 mb-8 border-b-[3px] border-green">
          <div>
            <h1 className="text-[22px] font-bold text-navy">African Farming Union</h1>
            <p className="text-xs text-gray-500">By Farmers, For Farmers</p>
            <p className="text-xs text-gray-500 mt-2">info@africanfarmingunion.org</p>
          </div>
          <div className="text-right">
            <div className="text-[28px] font-bold text-green">INVOICE</div>
            <div className="text-sm text-gray-500">{order.order_number}</div>
          </div>
        </div>

        {/* Bill To + Meta */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Bill To</p>
            <p className="font-semibold text-navy">{profile?.full_name || '-'}</p>
            {order.member?.farm_name && <p className="text-sm text-gray-600">{order.member.farm_name}</p>}
            {profile?.address && <p className="text-sm text-gray-600">{profile.address}</p>}
            {profile?.email && <p className="text-sm text-gray-600">{profile.email}</p>}
            {profile?.phone && <p className="text-sm text-gray-600">{profile.phone}</p>}
          </div>
          <div className="text-right text-sm">
            <p><span className="text-gray-500">Invoice Date:</span> {invoiceDate}</p>
            <p><span className="text-gray-500">Due Date:</span> {dueDate}</p>
            <p><span className="text-gray-500">Status:</span>{' '}
              <span className="font-semibold capitalize">{order.status}</span>
            </p>
          </div>
        </div>

        {/* Line Items */}
        <div className="mb-8">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-2 px-3 text-left text-xs font-semibold uppercase tracking-wide text-navy w-10">#</th>
                <th className="py-2 px-3 text-left text-xs font-semibold uppercase tracking-wide text-navy">Description</th>
                <th className="py-2 px-3 text-right text-xs font-semibold uppercase tracking-wide text-navy">Qty</th>
                <th className="py-2 px-3 text-right text-xs font-semibold uppercase tracking-wide text-navy">Unit Price</th>
                <th className="py-2 px-3 text-right text-xs font-semibold uppercase tracking-wide text-navy">Amount</th>
              </tr>
            </thead>
            <tbody>
              {(order.items || []).map((item, i) => (
                <tr key={item.id} className="border-b border-gray-200">
                  <td className="py-2 px-3 text-sm">{i + 1}</td>
                  <td className="py-2 px-3 text-sm">
                    {item.product?.name || `Product ${item.product_id.slice(0, 8)}`}
                    {item.product?.sku && <span className="text-gray-400 ml-2 text-xs">({item.product.sku})</span>}
                  </td>
                  <td className="py-2 px-3 text-sm text-right">{item.quantity}</td>
                  <td className="py-2 px-3 text-sm text-right">{order.currency} {item.unit_price.toFixed(2)}</td>
                  <td className="py-2 px-3 text-sm text-right">{order.currency} {item.total_price.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-[280px]">
            <table className="w-full">
              <tbody>
                <tr><td className="py-1 text-sm">Subtotal</td><td className="py-1 text-sm text-right">{order.currency} {order.subtotal.toFixed(2)}</td></tr>
                {order.discount > 0 && (
                  <tr><td className="py-1 text-sm">Discount</td><td className="py-1 text-sm text-right text-green">-{order.currency} {order.discount.toFixed(2)}</td></tr>
                )}
                <tr><td className="py-1 text-sm">Tax</td><td className="py-1 text-sm text-right">{order.currency} {order.tax.toFixed(2)}</td></tr>
                <tr><td className="py-1 text-sm">Shipping</td><td className="py-1 text-sm text-right">{order.currency} {order.shipping.toFixed(2)}</td></tr>
                <tr className="border-t-2 border-navy">
                  <td className="py-2 text-base font-bold text-navy">Total</td>
                  <td className="py-2 text-base font-bold text-navy text-right">{order.currency} {order.total.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Instructions */}
        <div className="mb-8 p-4 bg-green-light rounded-lg">
          <p className="text-xs font-semibold uppercase tracking-wide text-navy mb-2">Payment Instructions</p>
          <p className="text-sm text-gray-700">
            Payment is due within 30 days. Bank transfers, mobile money, and card payments are accepted.
            Please reference invoice number <strong>{order.order_number}</strong> with your payment.
          </p>
        </div>

        {/* Notes */}
        {order.notes && (
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-wide text-navy mb-1">Notes</p>
            <p className="text-sm text-gray-600">{order.notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-10 pt-4 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-400">
            African Farming Union &middot; info@africanfarmingunion.org &middot; africanfarmingunion.org
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Thank you for your business. This invoice was generated electronically.
          </p>
        </div>
      </div>
    </>
  );
}
