'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/supabase/auth-context';
import Link from 'next/link';
import {
  ArrowLeftRight,
  ShoppingCart,
  Package,
  ClipboardList,
  BarChart3,
  Plus,
  Loader2,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  ChevronRight,
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────
interface TradeOrder {
  id: string;
  order_number: string;
  type: 'buy' | 'sell';
  commodity: string;
  quantity: number;
  unit: string;
  quality_grade: string;
  country: string;
  delivery_location: string;
  deadline: string;
  target_price: number;
  currency: string;
  status: string;
  created_at: string;
  afu_price: number | null;
}

interface CommodityPrice {
  id: string;
  commodity: string;
  country: string;
  buy_price: number;
  sell_price: number;
  currency: string;
  unit: string;
  updated_at: string;
}

// ── Status badges ─────────────────────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  open: 'bg-blue-100 text-blue-700',
  afu_review: 'bg-yellow-100 text-yellow-700',
  afu_fulfilling: 'bg-green-100 text-green-700',
  marketplace: 'bg-purple-100 text-purple-700',
  quoted: 'bg-indigo-100 text-indigo-700',
  accepted: 'bg-emerald-100 text-emerald-700',
  delivered: 'bg-teal-100 text-teal-700',
  completed: 'bg-gray-100 text-gray-700',
  cancelled: 'bg-red-100 text-red-700',
};

const STATUS_LABELS: Record<string, string> = {
  open: 'Open',
  afu_review: 'AFU Review',
  afu_fulfilling: 'AFU Fulfilling',
  marketplace: 'On Marketplace',
  quoted: 'Quoted',
  accepted: 'Accepted',
  delivered: 'Delivered',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const COMMODITIES = [
  'Maize', 'Wheat', 'Rice', 'Sorghum', 'Millet', 'Soybeans', 'Sunflower',
  'Coffee', 'Tea', 'Cocoa', 'Cotton', 'Sugar Cane', 'Cassava', 'Groundnuts',
  'Sesame', 'Beans', 'Cowpeas', 'Pigeon Peas', 'Chickpeas', 'Lentils',
  'Potatoes', 'Sweet Potatoes', 'Tomatoes', 'Onions', 'Cabbage',
  'Bananas', 'Mangoes', 'Avocados', 'Oranges', 'Pineapples',
  'Cattle', 'Goats', 'Sheep', 'Poultry', 'Fish', 'Honey',
  'Fertilizer', 'Seeds', 'Pesticides', 'Farm Equipment',
];

const UNITS = ['kg', 'tonnes', 'bags (50kg)', 'bags (90kg)', 'litres', 'heads', 'pieces', 'crates'];
const QUALITY_GRADES = ['Grade A (Premium)', 'Grade B (Standard)', 'Grade C (Economy)', 'Organic Certified', 'Fair Trade'];
const COUNTRIES = ['Kenya', 'Uganda', 'Tanzania', 'Rwanda', 'Ethiopia', 'Nigeria', 'Ghana', 'South Africa', 'Zambia', 'Malawi', 'Mozambique', 'Zimbabwe'];

// ── Tab names ──────────────────────────────────────────────────────────────
type Tab = 'buy' | 'sell' | 'orders' | 'prices';

export default function FarmTradePage() {
  const supabase = createClient();
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('buy');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Form state
  const [form, setForm] = useState({
    commodity: '',
    quantity: '',
    unit: 'kg',
    quality_grade: 'Grade B (Standard)',
    country: profile?.country || '',
    delivery_location: '',
    deadline: '',
    target_price: '',
    currency: 'USD',
    notes: '',
  });

  // Orders state
  const [orders, setOrders] = useState<TradeOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Price board state
  const [prices, setPrices] = useState<CommodityPrice[]>([]);
  const [pricesLoading, setPricesLoading] = useState(false);
  const [priceCountry, setPriceCountry] = useState(profile?.country || 'Kenya');

  // Set country from profile
  useEffect(() => {
    if (profile?.country) {
      setForm(f => ({ ...f, country: profile.country || '' }));
      setPriceCountry(profile.country || 'Kenya');
    }
  }, [profile?.country]);

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    if (!user) return;
    setOrdersLoading(true);
    try {
      const { data } = await supabase
        .from('trade_orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setOrders(data || []);
    } catch { /* ignore */ }
    setOrdersLoading(false);
  }, [user, supabase]);

  // Fetch prices
  const fetchPrices = useCallback(async () => {
    setPricesLoading(true);
    try {
      const { data } = await supabase
        .from('commodity_prices')
        .select('*')
        .eq('country', priceCountry)
        .order('commodity');
      setPrices(data || []);
    } catch { /* ignore */ }
    setPricesLoading(false);
  }, [supabase, priceCountry]);

  useEffect(() => {
    if (activeTab === 'orders') fetchOrders();
    if (activeTab === 'prices') fetchPrices();
  }, [activeTab, fetchOrders, fetchPrices]);

  // Submit order
  const handleSubmit = async (type: 'buy' | 'sell') => {
    if (!user) return;
    if (!form.commodity || !form.quantity || !form.delivery_location || !form.deadline || !form.target_price) {
      setError('Please fill in all required fields.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/trading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          commodity: form.commodity,
          quantity: parseFloat(form.quantity),
          unit: form.unit,
          quality_grade: form.quality_grade,
          country: form.country,
          delivery_location: form.delivery_location,
          deadline: form.deadline,
          target_price: parseFloat(form.target_price),
          currency: form.currency,
          notes: form.notes,
        }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || 'Failed to create order');
      }

      const { order } = await res.json();
      setSuccess(`Order ${order.order_number} created successfully!`);
      setForm(f => ({ ...f, commodity: '', quantity: '', delivery_location: '', deadline: '', target_price: '', notes: '' }));
      setTimeout(() => setSuccess(''), 4000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
    setLoading(false);
  };

  // ── Shared form ─────────────────────────────────────────────────────────
  const renderOrderForm = (type: 'buy' | 'sell') => (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Commodity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Commodity *</label>
          <select
            value={form.commodity}
            onChange={e => setForm(f => ({ ...f, commodity: e.target.value }))}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#5DB347] focus:border-transparent"
          >
            <option value="">Select commodity...</option>
            {COMMODITIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Quantity + Unit */}
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
            <input
              type="number"
              value={form.quantity}
              onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
              placeholder="e.g. 500"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#5DB347] focus:border-transparent"
            />
          </div>
          <div className="w-36">
            <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
            <select
              value={form.unit}
              onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#5DB347] focus:border-transparent"
            >
              {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
        </div>

        {/* Quality Grade */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Quality Grade</label>
          <select
            value={form.quality_grade}
            onChange={e => setForm(f => ({ ...f, quality_grade: e.target.value }))}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#5DB347] focus:border-transparent"
          >
            {QUALITY_GRADES.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>

        {/* Country */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
          <select
            value={form.country}
            onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#5DB347] focus:border-transparent"
          >
            <option value="">Select country...</option>
            {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Delivery Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Location *</label>
          <input
            type="text"
            value={form.delivery_location}
            onChange={e => setForm(f => ({ ...f, delivery_location: e.target.value }))}
            placeholder="e.g. Nairobi Warehouse"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#5DB347] focus:border-transparent"
          />
        </div>

        {/* Deadline */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Deadline *</label>
          <input
            type="date"
            value={form.deadline}
            onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#5DB347] focus:border-transparent"
          />
        </div>

        {/* Target Price + Currency */}
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Target Price *</label>
            <input
              type="number"
              step="0.01"
              value={form.target_price}
              onChange={e => setForm(f => ({ ...f, target_price: e.target.value }))}
              placeholder="per unit"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#5DB347] focus:border-transparent"
            />
          </div>
          <div className="w-28">
            <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
            <select
              value={form.currency}
              onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#5DB347] focus:border-transparent"
            >
              <option value="USD">USD</option>
              <option value="KES">KES</option>
              <option value="UGX">UGX</option>
              <option value="TZS">TZS</option>
              <option value="RWF">RWF</option>
              <option value="ETB">ETB</option>
              <option value="NGN">NGN</option>
              <option value="ZAR">ZAR</option>
            </select>
          </div>
        </div>

        {/* Notes */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
          <textarea
            value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            rows={2}
            placeholder="Any additional requirements..."
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#5DB347] focus:border-transparent"
          />
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 px-4 py-2 rounded-xl">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 text-green-700 text-sm bg-green-50 px-4 py-2 rounded-xl">
          <CheckCircle className="w-4 h-4 shrink-0" />
          {success}
        </div>
      )}

      <button
        onClick={() => handleSubmit(type)}
        disabled={loading}
        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#5DB347] hover:bg-[#449933] text-white font-semibold px-6 py-3 rounded-xl transition-colors disabled:opacity-50"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
        {type === 'buy' ? 'Submit Buy Request' : 'Submit Sell Offer'}
      </button>
    </div>
  );

  // ── Tab buttons ─────────────────────────────────────────────────────────
  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'buy', label: 'I Need', icon: <ShoppingCart className="w-4 h-4" /> },
    { key: 'sell', label: 'I Have', icon: <Package className="w-4 h-4" /> },
    { key: 'orders', label: 'My Orders', icon: <ClipboardList className="w-4 h-4" /> },
    { key: 'prices', label: 'Price Board', icon: <BarChart3 className="w-4 h-4" /> },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 bg-[#5DB347]/10 rounded-xl flex items-center justify-center">
            <ArrowLeftRight className="w-5 h-5 text-[#5DB347]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#1B2A4A]">Trading Hub</h1>
            <p className="text-sm text-gray-500">Buy inputs, sell produce — AFU is your counterparty</p>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setError(''); setSuccess(''); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.key
                ? 'bg-white text-[#1B2A4A] shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
        {/* ─── I Need (Buy) ─── */}
        {activeTab === 'buy' && (
          <div>
            <h2 className="text-lg font-semibold text-[#1B2A4A] mb-1">Post a Buy Request</h2>
            <p className="text-sm text-gray-500 mb-5">Tell us what you need. AFU will try to fulfil from stock or find a supplier on the marketplace.</p>
            {renderOrderForm('buy')}
          </div>
        )}

        {/* ─── I Have (Sell) ─── */}
        {activeTab === 'sell' && (
          <div>
            <h2 className="text-lg font-semibold text-[#1B2A4A] mb-1">Post a Sell Offer</h2>
            <p className="text-sm text-gray-500 mb-5">List your produce for sale. AFU will buy directly or connect you with buyers on the marketplace.</p>
            {renderOrderForm('sell')}
          </div>
        )}

        {/* ─── My Orders ─── */}
        {activeTab === 'orders' && (
          <div>
            <h2 className="text-lg font-semibold text-[#1B2A4A] mb-4">My Trade Orders</h2>
            {ordersLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-[#5DB347]" />
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12">
                <ClipboardList className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No trade orders yet. Start by posting a buy request or sell offer.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map(order => (
                  <Link
                    key={order.id}
                    href={`/farm/trade/${order.id}`}
                    className="block bg-gray-50 hover:bg-gray-100 rounded-xl p-4 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                          order.type === 'buy' ? 'bg-blue-100' : 'bg-green-100'
                        }`}>
                          {order.type === 'buy'
                            ? <ShoppingCart className="w-4 h-4 text-blue-600" />
                            : <Package className="w-4 h-4 text-green-600" />
                          }
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[#1B2A4A] truncate">
                            {order.order_number} — {order.commodity}
                          </p>
                          <p className="text-xs text-gray-500">
                            {order.quantity} {order.unit} &bull; {order.country} &bull; {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                          {STATUS_LABELS[order.status] || order.status}
                        </span>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── Price Board ─── */}
        {activeTab === 'prices' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
              <h2 className="text-lg font-semibold text-[#1B2A4A]">Commodity Prices</h2>
              <select
                value={priceCountry}
                onChange={e => setPriceCountry(e.target.value)}
                className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#5DB347] focus:border-transparent"
              >
                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {pricesLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-[#5DB347]" />
              </div>
            ) : prices.length === 0 ? (
              <div className="text-center py-12">
                <BarChart3 className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No prices available for {priceCountry}.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-3 px-3 font-medium text-gray-500">Commodity</th>
                      <th className="text-right py-3 px-3 font-medium text-gray-500">AFU Buy</th>
                      <th className="text-right py-3 px-3 font-medium text-gray-500">AFU Sell</th>
                      <th className="text-right py-3 px-3 font-medium text-gray-500">Unit</th>
                      <th className="text-right py-3 px-3 font-medium text-gray-500">Updated</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {prices.map(p => (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="py-3 px-3 font-medium text-[#1B2A4A]">{p.commodity}</td>
                        <td className="py-3 px-3 text-right">
                          <span className="inline-flex items-center gap-1 text-green-600 font-medium">
                            <TrendingUp className="w-3 h-3" />
                            {p.currency} {p.buy_price?.toLocaleString()}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <span className="inline-flex items-center gap-1 text-blue-600 font-medium">
                            <TrendingDown className="w-3 h-3" />
                            {p.currency} {p.sell_price?.toLocaleString()}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right text-gray-500">/{p.unit}</td>
                        <td className="py-3 px-3 text-right text-gray-400 text-xs">
                          {new Date(p.updated_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
