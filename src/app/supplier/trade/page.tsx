'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/supabase/auth-context';
import {
  ArrowLeftRight,
  ShoppingCart,
  Package,
  Loader2,
  CheckCircle,
  AlertCircle,
  Send,
  ClipboardList,
  Store,
  DollarSign,
  MapPin,
  Calendar,
  X,
  Settings,
  BarChart3,
  TrendingUp,
  Award,
  Bell,
  Plus,
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
}

interface TradeQuote {
  id: string;
  order_id: string;
  supplier_id: string;
  price_per_unit: number;
  quantity_available: number;
  delivery_date: string;
  delivery_terms: string;
  notes: string | null;
  status: string;
  created_at: string;
  order?: TradeOrder;
}

const DELIVERY_TERMS = ['Ex-Works', 'Ex-Warehouse', 'FOB', 'CIF', 'DAP', 'DDP', 'FCA', 'Delivered'];

type SupplierTab = 'marketplace' | 'my-quotes' | 'analytics' | 'preferences';

export default function SupplierTradePage() {
  const supabase = createClient();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<SupplierTab>('marketplace');

  // Marketplace orders
  const [orders, setOrders] = useState<TradeOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // My quotes
  const [myQuotes, setMyQuotes] = useState<TradeQuote[]>([]);
  const [quotesLoading, setQuotesLoading] = useState(false);

  // Quote form state
  const [quotingOrder, setQuotingOrder] = useState<string | null>(null);
  const [quoteForm, setQuoteForm] = useState({
    price_per_unit: '',
    quantity_available: '',
    delivery_date: '',
    delivery_terms: 'FOB',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Preferences
  const [preferredCommodities, setPreferredCommodities] = useState<string[]>(['Maize', 'Wheat', 'Fertilizer']);
  const [newPref, setNewPref] = useState('');

  const COMMODITIES = [
    'Maize', 'Wheat', 'Rice', 'Sorghum', 'Soybeans', 'Coffee', 'Tea', 'Cocoa',
    'Cotton', 'Beans', 'Potatoes', 'Tomatoes', 'Fertilizer', 'Seeds', 'Pesticides',
  ];

  // ── Fetch marketplace orders ────────────────────────────────────────────
  const fetchOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const { data } = await supabase
        .from('trade_orders')
        .select('*')
        .eq('status', 'marketplace')
        .order('created_at', { ascending: false });
      setOrders(data || []);
    } catch { /* ignore */ }
    setOrdersLoading(false);
  }, [supabase]);

  // ── Fetch my quotes ─────────────────────────────────────────────────────
  const fetchMyQuotes = useCallback(async () => {
    if (!user) return;
    setQuotesLoading(true);
    try {
      const { data: quotes } = await supabase
        .from('trade_quotes')
        .select('*')
        .eq('supplier_id', user.id)
        .order('created_at', { ascending: false });

      if (quotes && quotes.length > 0) {
        const orderIds = [...new Set(quotes.map(q => q.order_id))];
        const { data: relatedOrders } = await supabase
          .from('trade_orders')
          .select('*')
          .in('id', orderIds);

        const orderMap = new Map((relatedOrders || []).map(o => [o.id, o]));
        setMyQuotes(quotes.map(q => ({ ...q, order: orderMap.get(q.order_id) })));
      } else {
        setMyQuotes([]);
      }
    } catch { /* ignore */ }
    setQuotesLoading(false);
  }, [user, supabase]);

  useEffect(() => {
    if (activeTab === 'marketplace') fetchOrders();
    if (activeTab === 'my-quotes' || activeTab === 'analytics') fetchMyQuotes();
  }, [activeTab, fetchOrders, fetchMyQuotes]);

  // ── Submit quote ────────────────────────────────────────────────────────
  const handleSubmitQuote = async (orderId: string) => {
    if (!user) return;
    if (!quoteForm.price_per_unit || !quoteForm.quantity_available || !quoteForm.delivery_date) {
      setError('Please fill in all required fields.');
      return;
    }
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/trading/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: orderId,
          price_per_unit: parseFloat(quoteForm.price_per_unit),
          quantity_available: parseFloat(quoteForm.quantity_available),
          delivery_date: quoteForm.delivery_date,
          delivery_terms: quoteForm.delivery_terms,
          notes: quoteForm.notes || null,
        }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || 'Failed to submit quote');
      }

      setSuccess('Quote submitted successfully!');
      setQuotingOrder(null);
      setQuoteForm({ price_per_unit: '', quantity_available: '', delivery_date: '', delivery_terms: 'FOB', notes: '' });
      setTimeout(() => setSuccess(''), 4000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
    setSubmitting(false);
  };

  // ── Analytics calculations ──────────────────────────────────────────────
  const analytics = useMemo(() => {
    const total = myQuotes.length;
    const accepted = myQuotes.filter(q => q.status === 'accepted').length;
    const rejected = myQuotes.filter(q => q.status === 'rejected').length;
    const pending = myQuotes.filter(q => q.status === 'pending').length;
    const acceptanceRate = total > 0 ? ((accepted / total) * 100).toFixed(1) : '0.0';
    const totalVolume = myQuotes.filter(q => q.status === 'accepted').reduce((s, q) => s + (q.price_per_unit * q.quantity_available), 0);
    return { total, accepted, rejected, pending, acceptanceRate, totalVolume };
  }, [myQuotes]);

  // ── Quote status colors ─────────────────────────────────────────────────
  const QUOTE_STATUS_COLORS: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    accepted: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
  };

  // ── Highlight preferred commodity orders ─────────────────────────────────
  const isPreferred = (commodity: string) => preferredCommodities.some(p => commodity.toLowerCase().includes(p.toLowerCase()));

  const tabs: { key: SupplierTab; label: string; icon: React.ReactNode }[] = [
    { key: 'marketplace', label: 'Marketplace', icon: <Store className="w-4 h-4" /> },
    { key: 'my-quotes', label: 'My Quotes', icon: <ClipboardList className="w-4 h-4" /> },
    { key: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { key: 'preferences', label: 'Preferences', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
            <ArrowLeftRight className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#1B2A4A]">Trade Marketplace</h1>
            <p className="text-sm text-gray-500">Submit quotes on open trade orders from AFU farmers</p>
          </div>
        </div>
      </div>

      {success && (
        <div className="flex items-center gap-2 text-green-700 text-sm bg-green-50 px-4 py-3 rounded-xl">
          <CheckCircle className="w-4 h-4 shrink-0" /> {success}
        </div>
      )}

      {/* Tab bar */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.key ? 'bg-white text-[#1B2A4A] shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ─── Marketplace Tab ─── */}
      {activeTab === 'marketplace' && (
        <div className="space-y-4">
          {ordersLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-[#5DB347]" />
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
              <Store className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No marketplace orders available right now. Check back soon!</p>
            </div>
          ) : (
            orders.map(order => (
              <div key={order.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${
                isPreferred(order.commodity) ? 'border-[#5DB347] ring-1 ring-[#5DB347]/20' : 'border-gray-100'
              }`}>
                {/* Preferred badge */}
                {isPreferred(order.commodity) && (
                  <div className="bg-[#EBF7E5] px-4 py-1.5 flex items-center gap-2">
                    <Bell className="w-3 h-3 text-[#5DB347]" />
                    <span className="text-xs font-medium text-[#5DB347]">Matches your preferred commodities</span>
                  </div>
                )}

                {/* Order summary */}
                <div className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        order.type === 'buy' ? 'bg-blue-100' : 'bg-green-100'
                      }`}>
                        {order.type === 'buy' ? <ShoppingCart className="w-5 h-5 text-blue-600" /> : <Package className="w-5 h-5 text-green-600" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-semibold text-[#1B2A4A]">{order.commodity}</h3>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            order.type === 'buy' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                          }`}>
                            {order.type === 'buy' ? 'Buyer needs' : 'Seller has'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{order.order_number}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (quotingOrder === order.id) { setQuotingOrder(null); }
                        else { setQuotingOrder(order.id); setError(''); }
                      }}
                      className="flex items-center gap-2 bg-[#5DB347] hover:bg-[#449933] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shrink-0"
                    >
                      <Send className="w-4 h-4" />
                      {quotingOrder === order.id ? 'Cancel' : 'Submit Quote'}
                    </button>
                  </div>

                  {/* Order details grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1"><Package className="w-3 h-3" /> Quantity</div>
                      <p className="text-sm font-medium text-[#1B2A4A]">{order.quantity.toLocaleString()} {order.unit}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1"><DollarSign className="w-3 h-3" /> Target Price</div>
                      <p className="text-sm font-medium text-[#1B2A4A]">{order.currency} {order.target_price?.toLocaleString()}/{order.unit}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1"><MapPin className="w-3 h-3" /> Delivery</div>
                      <p className="text-sm font-medium text-[#1B2A4A]">{order.delivery_location}, {order.country}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1"><Calendar className="w-3 h-3" /> Deadline</div>
                      <p className="text-sm font-medium text-[#1B2A4A]">{new Date(order.deadline).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">Quality: {order.quality_grade}</div>
                </div>

                {/* Quote form (expandable) */}
                {quotingOrder === order.id && (
                  <div className="border-t border-gray-100 bg-gray-50 p-5">
                    <h4 className="text-sm font-semibold text-[#1B2A4A] mb-4">Your Quote</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Price per {order.unit} ({order.currency}) *</label>
                        <input type="number" step="0.01" value={quoteForm.price_per_unit} onChange={e => setQuoteForm(f => ({ ...f, price_per_unit: e.target.value }))} placeholder="e.g. 45.00" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#5DB347] focus:border-transparent" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Quantity Available ({order.unit}) *</label>
                        <input type="number" value={quoteForm.quantity_available} onChange={e => setQuoteForm(f => ({ ...f, quantity_available: e.target.value }))} placeholder={`Max: ${order.quantity}`} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#5DB347] focus:border-transparent" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Delivery Date *</label>
                        <input type="date" value={quoteForm.delivery_date} onChange={e => setQuoteForm(f => ({ ...f, delivery_date: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#5DB347] focus:border-transparent" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Delivery Terms *</label>
                        <select value={quoteForm.delivery_terms} onChange={e => setQuoteForm(f => ({ ...f, delivery_terms: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#5DB347] focus:border-transparent">
                          {DELIVERY_TERMS.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Notes (optional)</label>
                        <textarea value={quoteForm.notes} onChange={e => setQuoteForm(f => ({ ...f, notes: e.target.value }))} rows={2} placeholder="Additional details, certifications, etc..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#5DB347] focus:border-transparent" />
                      </div>
                    </div>

                    {error && (
                      <div className="flex items-center gap-2 text-red-600 text-sm mt-3">
                        <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                      </div>
                    )}

                    <div className="flex gap-2 mt-4">
                      <button onClick={() => handleSubmitQuote(order.id)} disabled={submitting} className="flex items-center gap-2 bg-[#5DB347] hover:bg-[#449933] text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors disabled:opacity-50">
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Submit Quote
                      </button>
                      <button onClick={() => setQuotingOrder(null)} className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium px-5 py-2.5 rounded-lg transition-colors">Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* ─── My Quotes Tab (Enhanced with win/loss) ─── */}
      {activeTab === 'my-quotes' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          {quotesLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-[#5DB347]" />
            </div>
          ) : myQuotes.length === 0 ? (
            <div className="text-center py-16">
              <ClipboardList className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">You haven&apos;t submitted any quotes yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {myQuotes.map(quote => (
                <div key={quote.id} className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-semibold text-[#1B2A4A]">
                          {quote.order?.commodity || 'Unknown'} — {quote.order?.order_number || 'N/A'}
                        </h3>
                        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${QUOTE_STATUS_COLORS[quote.status] || 'bg-gray-100 text-gray-600'}`}>
                          {quote.status === 'accepted' ? 'Won' : quote.status === 'rejected' ? 'Lost' : 'Pending'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {quote.order?.currency} {quote.price_per_unit?.toLocaleString()}/{quote.order?.unit} &bull;
                        Qty: {quote.quantity_available?.toLocaleString()} &bull;
                        Delivery: {new Date(quote.delivery_date).toLocaleDateString()} &bull;
                        {quote.delivery_terms}
                      </p>
                      {quote.notes && <p className="text-xs text-gray-400 mt-1">{quote.notes}</p>}
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs text-gray-400">Submitted {new Date(quote.created_at).toLocaleDateString()}</div>
                      {quote.status === 'accepted' && (
                        <div className="text-xs font-semibold text-green-600 mt-1">
                          Total: {quote.order?.currency} {(quote.price_per_unit * quote.quantity_available).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── Analytics Tab ─── */}
      {activeTab === 'analytics' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-500">Total Quotes</span>
                <ClipboardList className="w-5 h-5 text-[#5DB347]" />
              </div>
              <p className="text-2xl font-bold text-[#1B2A4A]">{analytics.total}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-500">Acceptance Rate</span>
                <Award className="w-5 h-5 text-amber-500" />
              </div>
              <p className="text-2xl font-bold text-[#1B2A4A]">{analytics.acceptanceRate}%</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-500">Won Quotes</span>
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-[#1B2A4A]">{analytics.accepted}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-500">Volume Traded</span>
                <TrendingUp className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-[#1B2A4A]">${(analytics.totalVolume / 1000).toFixed(1)}K</p>
            </div>
          </div>

          {/* Win/Loss breakdown */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-semibold text-[#1B2A4A] mb-4">Quote Performance</h3>
            <div className="flex gap-4 h-6 rounded-full overflow-hidden bg-gray-100">
              {analytics.accepted > 0 && (
                <div className="bg-green-500 rounded-full" style={{ width: `${(analytics.accepted / Math.max(analytics.total, 1)) * 100}%` }} title={`Won: ${analytics.accepted}`} />
              )}
              {analytics.pending > 0 && (
                <div className="bg-yellow-400 rounded-full" style={{ width: `${(analytics.pending / Math.max(analytics.total, 1)) * 100}%` }} title={`Pending: ${analytics.pending}`} />
              )}
              {analytics.rejected > 0 && (
                <div className="bg-red-400 rounded-full" style={{ width: `${(analytics.rejected / Math.max(analytics.total, 1)) * 100}%` }} title={`Lost: ${analytics.rejected}`} />
              )}
            </div>
            <div className="flex gap-4 mt-3 text-xs">
              <div className="flex items-center gap-1"><div className="w-3 h-3 bg-green-500 rounded-full" /> Won ({analytics.accepted})</div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 bg-yellow-400 rounded-full" /> Pending ({analytics.pending})</div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 bg-red-400 rounded-full" /> Lost ({analytics.rejected})</div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Preferences Tab ─── */}
      {activeTab === 'preferences' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-5">
          <div>
            <h3 className="font-semibold text-[#1B2A4A] mb-1">Preferred Commodities</h3>
            <p className="text-sm text-gray-500">Get highlighted when matching orders appear on the marketplace</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {preferredCommodities.map(c => (
              <span key={c} className="inline-flex items-center gap-1 bg-[#EBF7E5] text-[#5DB347] text-sm font-medium px-3 py-1.5 rounded-full">
                {c}
                <button onClick={() => setPreferredCommodities(prev => prev.filter(p => p !== c))} className="hover:text-red-500 transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2">
            <select value={newPref} onChange={e => setNewPref(e.target.value)} className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#5DB347] focus:border-transparent">
              <option value="">Add commodity...</option>
              {COMMODITIES.filter(c => !preferredCommodities.includes(c)).map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <button
              onClick={() => {
                if (newPref && !preferredCommodities.includes(newPref)) {
                  setPreferredCommodities(prev => [...prev, newPref]);
                  setNewPref('');
                }
              }}
              disabled={!newPref}
              className="flex items-center gap-2 bg-[#5DB347] text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-[#449933] disabled:opacity-50 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>

          <div className="bg-blue-50 rounded-xl p-4 flex items-start gap-3">
            <Bell className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800">Notification Settings</p>
              <p className="text-xs text-blue-600 mt-1">When new marketplace orders match your preferred commodities, they will be highlighted at the top of your marketplace view.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
