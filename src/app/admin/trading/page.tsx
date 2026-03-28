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
  DollarSign,
  TrendingUp,
  ChevronRight,
  Store,
  BarChart3,
  Boxes,
  RefreshCw,
  Search,
  Save,
  Download,
  Zap,
} from 'lucide-react';
import {
  BarChart, Bar, LineChart as RechartsLine, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell,
} from 'recharts';

// ── Types ──────────────────────────────────────────────────────────────────
interface TradeOrder {
  id: string;
  order_number: string;
  user_id: string;
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
  afu_price: number | null;
  notes: string | null;
  created_at: string;
  user_name?: string;
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

interface InventoryPosition {
  id: string;
  commodity: string;
  country: string;
  quantity_available: number;
  unit: string;
  avg_cost: number;
  currency: string;
  warehouse_location: string;
  updated_at: string;
}

// ── Status ─────────────────────────────────────────────────────────────────
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
  open: 'Open', afu_review: 'AFU Review', afu_fulfilling: 'AFU Fulfilling',
  marketplace: 'Marketplace', quoted: 'Quoted', accepted: 'Accepted',
  delivered: 'Delivered', completed: 'Completed', cancelled: 'Cancelled',
};

const ALL_STATUSES = Object.keys(STATUS_LABELS);
const CHART_COLORS = ['#5DB347', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#EC4899', '#10B981'];

type AdminTab = 'orders' | 'prices' | 'inventory' | 'analytics' | 'auto-match';

export default function AdminTradingPage() {
  const supabase = createClient();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('orders');

  // Orders state
  const [orders, setOrders] = useState<TradeOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [orderQuotes, setOrderQuotes] = useState<Record<string, TradeQuote[]>>({});
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterCountry, setFilterCountry] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Action state
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [afuPriceInput, setAfuPriceInput] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState('');

  // Prices state
  const [prices, setPrices] = useState<CommodityPrice[]>([]);
  const [pricesLoading, setPricesLoading] = useState(false);
  const [editingPrice, setEditingPrice] = useState<string | null>(null);
  const [priceEdits, setPriceEdits] = useState<Record<string, { buy_price: string; sell_price: string }>>({});

  // Inventory state
  const [inventory, setInventory] = useState<InventoryPosition[]>([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);

  // ── Fetch orders ────────────────────────────────────────────────────────
  const fetchOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const { data } = await supabase
        .from('trade_orders')
        .select('*')
        .order('created_at', { ascending: false });
      setOrders(data || []);
    } catch { /* ignore */ }
    setOrdersLoading(false);
  }, [supabase]);

  const fetchQuotesForOrder = async (orderId: string) => {
    try {
      const { data } = await supabase.from('trade_quotes').select('*').eq('order_id', orderId).order('created_at', { ascending: false });
      setOrderQuotes(prev => ({ ...prev, [orderId]: data || [] }));
    } catch { /* ignore */ }
  };

  const fetchPrices = useCallback(async () => {
    setPricesLoading(true);
    try {
      const { data } = await supabase.from('commodity_prices').select('*').order('country').order('commodity');
      setPrices(data || []);
    } catch { /* ignore */ }
    setPricesLoading(false);
  }, [supabase]);

  const fetchInventory = useCallback(async () => {
    setInventoryLoading(true);
    try {
      const { data } = await supabase.from('inventory_positions').select('*').order('commodity');
      setInventory(data || []);
    } catch { /* ignore */ }
    setInventoryLoading(false);
  }, [supabase]);

  useEffect(() => {
    if (activeTab === 'orders' || activeTab === 'analytics' || activeTab === 'auto-match') fetchOrders();
    if (activeTab === 'prices') fetchPrices();
    if (activeTab === 'inventory') fetchInventory();
  }, [activeTab, fetchOrders, fetchPrices, fetchInventory]);

  // ── Admin actions ───────────────────────────────────────────────────────
  const handleFulfilAFU = async (orderId: string) => {
    const price = afuPriceInput[orderId];
    if (!price) return;
    setActionLoading(orderId);
    try {
      await fetch(`/api/trading/${orderId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'afu_fulfilling', afu_price: parseFloat(price) }) });
      await fetchOrders();
    } catch { /* ignore */ }
    setActionLoading(null);
  };

  const handleSendToMarketplace = async (orderId: string) => {
    setActionLoading(orderId);
    try {
      await fetch(`/api/trading/${orderId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'marketplace' }) });
      await fetchOrders();
    } catch { /* ignore */ }
    setActionLoading(null);
  };

  const handleUpdateStatus = async (orderId: string, status: string) => {
    setActionLoading(orderId);
    try {
      await fetch(`/api/trading/${orderId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
      await fetchOrders();
    } catch { /* ignore */ }
    setActionLoading(null);
  };

  const handleSavePrice = async (priceId: string) => {
    const edits = priceEdits[priceId];
    if (!edits) return;
    setActionLoading(priceId);
    try {
      await supabase.from('commodity_prices').update({ buy_price: parseFloat(edits.buy_price), sell_price: parseFloat(edits.sell_price), updated_at: new Date().toISOString() }).eq('id', priceId);
      setEditingPrice(null);
      await fetchPrices();
    } catch { /* ignore */ }
    setActionLoading(null);
  };

  const toggleExpand = (orderId: string) => {
    if (expandedOrder === orderId) { setExpandedOrder(null); } else { setExpandedOrder(orderId); if (!orderQuotes[orderId]) fetchQuotesForOrder(orderId); }
  };

  // ── Filtered orders ─────────────────────────────────────────────────────
  const filteredOrders = orders.filter(o => {
    if (filterStatus !== 'all' && o.status !== filterStatus) return false;
    if (filterType !== 'all' && o.type !== filterType) return false;
    if (filterCountry !== 'all' && o.country !== filterCountry) return false;
    if (searchTerm && !o.order_number.toLowerCase().includes(searchTerm.toLowerCase()) && !o.commodity.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  // ── KPIs ────────────────────────────────────────────────────────────────
  const totalOrders = orders.length;
  const openOrders = orders.filter(o => ['open', 'afu_review'].includes(o.status)).length;
  const afuFulfilled = orders.filter(o => o.status === 'afu_fulfilling' || (o.afu_price && o.status === 'completed')).length;
  const marketplaceOrders = orders.filter(o => ['marketplace', 'quoted'].includes(o.status)).length;
  const totalVolume = orders.reduce((sum, o) => sum + (o.target_price * o.quantity), 0);
  const uniqueCountries = [...new Set(orders.map(o => o.country))];

  // ── Analytics data ──────────────────────────────────────────────────────
  const volumeByCommodity = useMemo(() => {
    const map: Record<string, number> = {};
    orders.forEach(o => { map[o.commodity] = (map[o.commodity] || 0) + o.target_price * o.quantity; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, value]) => ({ name, value: Math.round(value) }));
  }, [orders]);

  const volumeByCountry = useMemo(() => {
    const map: Record<string, number> = {};
    orders.forEach(o => { map[o.country] = (map[o.country] || 0) + o.target_price * o.quantity; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value: Math.round(value) }));
  }, [orders]);

  const monthlyTrend = useMemo(() => {
    const map: Record<string, { buy: number; sell: number }> = {};
    orders.forEach(o => {
      const m = new Date(o.created_at).toLocaleDateString('en', { month: 'short', year: '2-digit' });
      if (!map[m]) map[m] = { buy: 0, sell: 0 };
      map[m][o.type] += o.target_price * o.quantity;
    });
    return Object.entries(map).map(([month, v]) => ({ month, buy: Math.round(v.buy), sell: Math.round(v.sell) }));
  }, [orders]);

  const topTraders = useMemo(() => {
    const map: Record<string, { volume: number; orders: number }> = {};
    orders.forEach(o => {
      const name = o.user_name || o.user_id?.slice(0, 8) || 'Unknown';
      if (!map[name]) map[name] = { volume: 0, orders: 0 };
      map[name].volume += o.target_price * o.quantity;
      map[name].orders += 1;
    });
    return Object.entries(map).sort((a, b) => b[1].volume - a[1].volume).slice(0, 5).map(([name, v]) => ({ name, ...v }));
  }, [orders]);

  // ── Auto-match: find buy orders that match sell orders ──────────────────
  const potentialMatches = useMemo(() => {
    const buys = orders.filter(o => o.type === 'buy' && ['open', 'afu_review', 'marketplace'].includes(o.status));
    const sells = orders.filter(o => o.type === 'sell' && ['open', 'afu_review', 'marketplace'].includes(o.status));
    const matches: { buy: TradeOrder; sell: TradeOrder; margin: number }[] = [];
    buys.forEach(b => {
      sells.forEach(s => {
        if (b.commodity === s.commodity && b.country === s.country && s.target_price <= b.target_price) {
          matches.push({ buy: b, sell: s, margin: b.target_price - s.target_price });
        }
      });
    });
    return matches.sort((a, b) => b.margin - a.margin);
  }, [orders]);

  const handleExecuteMatch = async (buyId: string, sellId: string) => {
    setActionLoading(`match-${buyId}`);
    try {
      await fetch(`/api/trading/${buyId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'accepted' }) });
      await fetch(`/api/trading/${sellId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'accepted' }) });
      setSuccess('Match executed!');
      fetchOrders();
      setTimeout(() => setSuccess(''), 3000);
    } catch { /* ignore */ }
    setActionLoading(null);
  };

  // ── Export CSV ──────────────────────────────────────────────────────────
  const handleExportCSV = () => {
    const headers = ['Order #', 'Type', 'Commodity', 'Quantity', 'Unit', 'Country', 'Target Price', 'Currency', 'Status', 'Deadline', 'Created'];
    const rows = filteredOrders.map(o => [o.order_number, o.type, o.commodity, o.quantity, o.unit, o.country, o.target_price, o.currency, o.status, o.deadline, o.created_at]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `afu-trades-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Tab defs ────────────────────────────────────────────────────────────
  const adminTabs: { key: AdminTab; label: string; icon: React.ReactNode }[] = [
    { key: 'orders', label: 'Orders', icon: <ArrowLeftRight className="w-4 h-4" /> },
    { key: 'prices', label: 'Commodity Prices', icon: <BarChart3 className="w-4 h-4" /> },
    { key: 'inventory', label: 'Inventory', icon: <Boxes className="w-4 h-4" /> },
    { key: 'analytics', label: 'Analytics', icon: <TrendingUp className="w-4 h-4" /> },
    { key: 'auto-match', label: 'Auto-Match', icon: <Zap className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">Trade Desk</h1>
          <p className="text-sm text-gray-500 mt-1">Manage trade orders, commodity prices, inventory, and analytics</p>
        </div>
        <button onClick={handleExportCSV} className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium px-4 py-2.5 rounded-xl transition-colors">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {success && (
        <div className="flex items-center gap-2 text-green-700 text-sm bg-green-50 px-4 py-3 rounded-xl">
          <CheckCircle className="w-4 h-4 shrink-0" /> {success}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <KPICard label="Total Orders" value={totalOrders} icon={<ArrowLeftRight className="w-5 h-5 text-[#5DB347]" />} />
        <KPICard label="Open Orders" value={openOrders} icon={<AlertCircle className="w-5 h-5 text-yellow-500" />} />
        <KPICard label="AFU Fulfilled" value={afuFulfilled} icon={<CheckCircle className="w-5 h-5 text-green-500" />} />
        <KPICard label="Marketplace" value={marketplaceOrders} icon={<Store className="w-5 h-5 text-purple-500" />} />
        <KPICard label="Total Volume" value={`$${(totalVolume / 1000).toFixed(0)}K`} icon={<TrendingUp className="w-5 h-5 text-blue-500" />} />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl overflow-x-auto">
        {adminTabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab.key ? 'bg-white text-[#1B2A4A] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ─── Orders Tab ─── */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="p-4 border-b border-gray-100 flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search orders..." className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347] focus:border-transparent" />
            </div>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
              <option value="all">All Status</option>
              {ALL_STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
            </select>
            <select value={filterType} onChange={e => setFilterType(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
              <option value="all">All Types</option><option value="buy">Buy</option><option value="sell">Sell</option>
            </select>
            <select value={filterCountry} onChange={e => setFilterCountry(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
              <option value="all">All Countries</option>
              {uniqueCountries.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button onClick={fetchOrders} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"><RefreshCw className="w-4 h-4" /></button>
          </div>

          {ordersLoading ? (
            <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-[#5DB347]" /></div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-16"><ArrowLeftRight className="w-10 h-10 text-gray-300 mx-auto mb-3" /><p className="text-gray-500 text-sm">No orders found.</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left py-3 px-4 font-medium text-gray-500 w-8"></th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Order #</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Commodity</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">Qty</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Country</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">Target</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">AFU Price</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">Margin</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredOrders.map(order => (
                    <>
                      <tr key={order.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => toggleExpand(order.id)}>
                        <td className="py-3 px-4"><ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${expandedOrder === order.id ? 'rotate-90' : ''}`} /></td>
                        <td className="py-3 px-4 font-medium text-[#1B2A4A]">{order.order_number}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${order.type === 'buy' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                            {order.type === 'buy' ? <ShoppingCart className="w-3 h-3" /> : <Package className="w-3 h-3" />} {order.type}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-700">{order.commodity}</td>
                        <td className="py-3 px-4 text-right text-gray-700">{order.quantity.toLocaleString()} {order.unit}</td>
                        <td className="py-3 px-4 text-gray-700">{order.country}</td>
                        <td className="py-3 px-4 text-right font-medium">{order.currency} {order.target_price?.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right font-medium text-[#5DB347]">{order.afu_price ? `${order.currency} ${order.afu_price}` : '—'}</td>
                        <td className="py-3 px-4 text-right">
                          {order.afu_price ? (
                            <span className={`font-medium ${(order.type === 'buy' ? order.afu_price - order.target_price : order.target_price - order.afu_price) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {order.currency} {Math.abs(order.type === 'buy' ? order.afu_price - order.target_price : order.target_price - order.afu_price).toFixed(2)}
                            </span>
                          ) : '—'}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                            {STATUS_LABELS[order.status] || order.status}
                          </span>
                        </td>
                        <td className="py-3 px-4" onClick={e => e.stopPropagation()}>
                          {(order.status === 'open' || order.status === 'afu_review') && (
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                <input type="number" step="0.01" placeholder="AFU price" value={afuPriceInput[order.id] || ''} onChange={e => setAfuPriceInput(prev => ({ ...prev, [order.id]: e.target.value }))} className="w-24 border border-gray-200 rounded-lg px-2 py-1.5 text-xs" />
                                <button onClick={() => handleFulfilAFU(order.id)} disabled={!afuPriceInput[order.id] || actionLoading === order.id} className="text-xs bg-[#5DB347] text-white px-2.5 py-1.5 rounded-lg hover:bg-[#449933] disabled:opacity-50 whitespace-nowrap">Fulfil</button>
                              </div>
                              <button onClick={() => handleSendToMarketplace(order.id)} disabled={actionLoading === order.id} className="text-xs bg-purple-600 text-white px-2.5 py-1.5 rounded-lg hover:bg-purple-700 disabled:opacity-50 whitespace-nowrap">Marketplace</button>
                            </div>
                          )}
                          {order.status === 'accepted' && (
                            <button onClick={() => handleUpdateStatus(order.id, 'delivered')} disabled={actionLoading === order.id} className="text-xs bg-teal-600 text-white px-2.5 py-1.5 rounded-lg hover:bg-teal-700 disabled:opacity-50">Delivered</button>
                          )}
                          {order.status === 'delivered' && (
                            <button onClick={() => handleUpdateStatus(order.id, 'completed')} disabled={actionLoading === order.id} className="text-xs bg-gray-600 text-white px-2.5 py-1.5 rounded-lg hover:bg-gray-700 disabled:opacity-50">Complete</button>
                          )}
                        </td>
                      </tr>
                      {expandedOrder === order.id && (
                        <tr key={`${order.id}-expanded`}>
                          <td colSpan={11} className="bg-gray-50 px-8 py-4">
                            <div className="space-y-3">
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                                <div><span className="text-gray-500">Quality:</span> <span className="font-medium">{order.quality_grade}</span></div>
                                <div><span className="text-gray-500">Location:</span> <span className="font-medium">{order.delivery_location}</span></div>
                                <div><span className="text-gray-500">Deadline:</span> <span className="font-medium">{new Date(order.deadline).toLocaleDateString()}</span></div>
                                <div><span className="text-gray-500">Created:</span> <span className="font-medium">{new Date(order.created_at).toLocaleString()}</span></div>
                              </div>
                              {order.notes && <p className="text-xs text-gray-500">Notes: {order.notes}</p>}
                              <div>
                                <p className="text-xs font-semibold text-gray-700 mb-2">Quotes ({orderQuotes[order.id]?.length || 0})</p>
                                {(!orderQuotes[order.id] || orderQuotes[order.id].length === 0) ? (
                                  <p className="text-xs text-gray-400">No quotes submitted yet.</p>
                                ) : (
                                  <div className="space-y-2">
                                    {orderQuotes[order.id].map(q => (
                                      <div key={q.id} className="bg-white rounded-lg p-3 border border-gray-100 text-xs flex items-center justify-between">
                                        <div>
                                          <span className="font-medium">{order.currency} {q.price_per_unit}</span>
                                          <span className="text-gray-500"> &bull; Qty {q.quantity_available} &bull; {new Date(q.delivery_date).toLocaleDateString()} &bull; {q.delivery_terms}</span>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded-full font-medium ${q.status === 'accepted' ? 'bg-green-100 text-green-700' : q.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{q.status}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ─── Commodity Prices Tab ─── */}
      {activeTab === 'prices' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-[#1B2A4A]">Commodity Prices</h3>
            <button onClick={fetchPrices} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"><RefreshCw className="w-4 h-4" /></button>
          </div>
          {pricesLoading ? (
            <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-[#5DB347]" /></div>
          ) : prices.length === 0 ? (
            <div className="text-center py-16"><BarChart3 className="w-10 h-10 text-gray-300 mx-auto mb-3" /><p className="text-gray-500 text-sm">No commodity prices configured.</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Commodity</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Country</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">Buy Price</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">Sell Price</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">Margin</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">Unit</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">Updated</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {prices.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-[#1B2A4A]">{p.commodity}</td>
                      <td className="py-3 px-4 text-gray-700">{p.country}</td>
                      <td className="py-3 px-4 text-right">
                        {editingPrice === p.id ? (
                          <input type="number" step="0.01" value={priceEdits[p.id]?.buy_price ?? p.buy_price} onChange={e => setPriceEdits(prev => ({ ...prev, [p.id]: { ...prev[p.id], buy_price: e.target.value, sell_price: prev[p.id]?.sell_price ?? String(p.sell_price) } }))} className="w-28 border border-gray-200 rounded-lg px-2 py-1 text-sm text-right" />
                        ) : (
                          <span className="text-green-600 font-medium">{p.currency} {p.buy_price?.toLocaleString()}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {editingPrice === p.id ? (
                          <input type="number" step="0.01" value={priceEdits[p.id]?.sell_price ?? p.sell_price} onChange={e => setPriceEdits(prev => ({ ...prev, [p.id]: { ...prev[p.id], sell_price: e.target.value, buy_price: prev[p.id]?.buy_price ?? String(p.buy_price) } }))} className="w-28 border border-gray-200 rounded-lg px-2 py-1 text-sm text-right" />
                        ) : (
                          <span className="text-blue-600 font-medium">{p.currency} {p.sell_price?.toLocaleString()}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-amber-600">{p.currency} {(p.sell_price - p.buy_price).toFixed(2)}</td>
                      <td className="py-3 px-4 text-right text-gray-500">/{p.unit}</td>
                      <td className="py-3 px-4 text-right text-gray-400 text-xs">{new Date(p.updated_at).toLocaleDateString()}</td>
                      <td className="py-3 px-4">
                        {editingPrice === p.id ? (
                          <div className="flex gap-1">
                            <button onClick={() => handleSavePrice(p.id)} disabled={actionLoading === p.id} className="text-xs bg-[#5DB347] text-white px-2.5 py-1.5 rounded-lg hover:bg-[#449933] disabled:opacity-50"><Save className="w-3 h-3" /></button>
                            <button onClick={() => setEditingPrice(null)} className="text-xs bg-gray-200 text-gray-700 px-2.5 py-1.5 rounded-lg hover:bg-gray-300">Cancel</button>
                          </div>
                        ) : (
                          <button onClick={() => { setEditingPrice(p.id); setPriceEdits(prev => ({ ...prev, [p.id]: { buy_price: String(p.buy_price), sell_price: String(p.sell_price) } })); }} className="text-xs text-[#5DB347] hover:text-[#449933] font-medium">Edit</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ─── Inventory Tab ─── */}
      {activeTab === 'inventory' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-[#1B2A4A]">Inventory Positions</h3>
            <button onClick={fetchInventory} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"><RefreshCw className="w-4 h-4" /></button>
          </div>
          {inventoryLoading ? (
            <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-[#5DB347]" /></div>
          ) : inventory.length === 0 ? (
            <div className="text-center py-16"><Boxes className="w-10 h-10 text-gray-300 mx-auto mb-3" /><p className="text-gray-500 text-sm">No inventory positions recorded.</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Commodity</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Country</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">Available</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">Avg Cost</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Warehouse</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {inventory.map(inv => (
                    <tr key={inv.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-[#1B2A4A]">{inv.commodity}</td>
                      <td className="py-3 px-4 text-gray-700">{inv.country}</td>
                      <td className="py-3 px-4 text-right font-medium">{inv.quantity_available?.toLocaleString()} {inv.unit}</td>
                      <td className="py-3 px-4 text-right text-gray-700">{inv.currency} {inv.avg_cost?.toLocaleString()}</td>
                      <td className="py-3 px-4 text-gray-700">{inv.warehouse_location}</td>
                      <td className="py-3 px-4 text-right text-gray-400 text-xs">{new Date(inv.updated_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ─── Analytics Tab ─── */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Volume by Commodity */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-semibold text-[#1B2A4A] mb-4">Volume by Commodity (USD)</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={volumeByCommodity} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={80} />
                    <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} formatter={(v) => `$${Number(v).toLocaleString()}`} />
                    <Bar dataKey="value" fill="#5DB347" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Volume by Country */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-semibold text-[#1B2A4A] mb-4">Volume by Country (USD)</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={volumeByCountry}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" height={60} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} formatter={(v) => `$${Number(v).toLocaleString()}`} />
                    <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]}>
                      {volumeByCountry.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Monthly Trend */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 lg:col-span-2">
              <h3 className="font-semibold text-[#1B2A4A] mb-4">Monthly Trade Volume</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLine data={monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} formatter={(v) => `$${Number(v).toLocaleString()}`} />
                    <Legend />
                    <Line type="monotone" dataKey="buy" stroke="#3B82F6" strokeWidth={2} name="Buy Volume" />
                    <Line type="monotone" dataKey="sell" stroke="#5DB347" strokeWidth={2} name="Sell Volume" />
                  </RechartsLine>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Top Traders */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-semibold text-[#1B2A4A] mb-4">Top Traders</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 px-3 font-medium text-gray-500">#</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-500">Trader</th>
                    <th className="text-right py-2 px-3 font-medium text-gray-500">Orders</th>
                    <th className="text-right py-2 px-3 font-medium text-gray-500">Volume (USD)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {topTraders.map((t, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="py-2 px-3 text-gray-400">{i + 1}</td>
                      <td className="py-2 px-3 font-medium text-[#1B2A4A]">{t.name}</td>
                      <td className="py-2 px-3 text-right">{t.orders}</td>
                      <td className="py-2 px-3 text-right font-medium">${t.volume.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── Auto-Match Tab ─── */}
      {activeTab === 'auto-match' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-[#1B2A4A]">Auto-Match Panel</h3>
            <p className="text-sm text-gray-500">Potential matches between buy and sell orders for the same commodity and country</p>
          </div>
          {potentialMatches.length === 0 ? (
            <div className="text-center py-16">
              <Zap className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No potential matches found. Need matching buy and sell orders for the same commodity and country.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {potentialMatches.map((match, i) => (
                <div key={i} className="p-5">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Buy side */}
                    <div className="flex-1 bg-blue-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <ShoppingCart className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-semibold text-blue-700">BUYER</span>
                      </div>
                      <p className="text-sm font-medium text-[#1B2A4A]">{match.buy.order_number}</p>
                      <p className="text-xs text-gray-600">{match.buy.quantity} {match.buy.unit} @ {match.buy.currency} {match.buy.target_price}</p>
                    </div>

                    {/* Arrow + margin */}
                    <div className="flex flex-col items-center gap-1 shrink-0">
                      <ArrowLeftRight className="w-5 h-5 text-[#5DB347]" />
                      <span className="text-xs font-bold text-green-600">Margin: {match.buy.currency} {match.margin.toFixed(2)}</span>
                    </div>

                    {/* Sell side */}
                    <div className="flex-1 bg-green-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Package className="w-4 h-4 text-green-600" />
                        <span className="text-xs font-semibold text-green-700">SELLER</span>
                      </div>
                      <p className="text-sm font-medium text-[#1B2A4A]">{match.sell.order_number}</p>
                      <p className="text-xs text-gray-600">{match.sell.quantity} {match.sell.unit} @ {match.sell.currency} {match.sell.target_price}</p>
                    </div>

                    {/* Execute button */}
                    <button
                      onClick={() => handleExecuteMatch(match.buy.id, match.sell.id)}
                      disabled={actionLoading === `match-${match.buy.id}`}
                      className="flex items-center gap-2 bg-[#5DB347] text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-[#449933] disabled:opacity-50 transition-colors shrink-0"
                    >
                      {actionLoading === `match-${match.buy.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                      Execute Match
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function KPICard({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-500">{label}</span>
        {icon}
      </div>
      <p className="text-2xl font-bold text-[#1B2A4A]">{value}</p>
    </div>
  );
}
