'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/supabase/auth-context';
import Link from 'next/link';
import {
  Coins,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Star,
  X,
  ShoppingBag,
  Wrench,
  Wheat,
  TrendingUp,
  MapPin,
  Warehouse,
  Beef,
  Sprout,
  GraduationCap,
  Truck,
  ChevronRight,
} from 'lucide-react';

// ── Types ──
interface Transaction {
  id: string;
  type: 'earned' | 'spent';
  description: string;
  amount: number;
  date: string;
}

interface MyListing {
  id: string;
  title: string;
  category: string;
  price: string;
  priceType: string;
  status: 'active' | 'sold' | 'paused';
  views: number;
}

interface Trade {
  id: string;
  type: 'purchase' | 'sale';
  title: string;
  counterparty: string;
  amount: number;
  status: 'pending' | 'completed' | 'disputed';
  date: string;
  rated: boolean;
}

// ── Demo data ──
const DEMO_TRANSACTIONS: Transaction[] = [
  { id: '1', type: 'earned', description: 'Sold: Surplus Maize — 500kg', amount: 1500, date: '2026-03-22' },
  { id: '2', type: 'spent', description: 'Purchased: Irrigation Pump Rental', amount: 200, date: '2026-03-20' },
  { id: '3', type: 'earned', description: 'Tractor hire payment', amount: 500, date: '2026-03-18' },
  { id: '4', type: 'spent', description: 'Bought: Certified Maize Seed', amount: 800, date: '2026-03-15' },
  { id: '5', type: 'earned', description: 'Credit purchase ($50)', amount: 500, date: '2026-03-12' },
];

const DEMO_MY_LISTINGS: MyListing[] = [
  { id: '1', title: 'John Deere Tractor — Available for Hire', category: 'equipment', price: '500', priceType: 'credits/day', status: 'active', views: 42 },
  { id: '2', title: 'Surplus Maize — 2 Tonnes', category: 'produce', price: '3,000', priceType: 'credits', status: 'active', views: 28 },
  { id: '3', title: 'Warehouse Storage Space — 50sqm', category: 'storage', price: '100', priceType: 'credits/month', status: 'paused', views: 15 },
];

const DEMO_TRADES: Trade[] = [
  { id: '1', type: 'sale', title: 'Surplus Maize — 500kg', counterparty: 'Tendai M.', amount: 1500, status: 'completed', date: '2026-03-22', rated: true },
  { id: '2', type: 'purchase', title: 'Irrigation Pump Rental', counterparty: 'James O.', amount: 200, status: 'completed', date: '2026-03-20', rated: false },
  { id: '3', type: 'sale', title: 'Tractor Hire — 1 Day', counterparty: 'Grace K.', amount: 500, status: 'pending', date: '2026-03-23', rated: false },
  { id: '4', type: 'purchase', title: 'Certified Maize Seed — 50kg', counterparty: 'Peter N.', amount: 800, status: 'completed', date: '2026-03-15', rated: true },
];

const CATEGORY_OPTIONS = [
  { value: 'equipment', label: 'Equipment', icon: Wrench },
  { value: 'produce', label: 'Produce', icon: Wheat },
  { value: 'services', label: 'Services', icon: TrendingUp },
  { value: 'land', label: 'Land', icon: MapPin },
  { value: 'storage', label: 'Storage', icon: Warehouse },
  { value: 'livestock', label: 'Livestock', icon: Beef },
  { value: 'seeds', label: 'Seeds', icon: Sprout },
  { value: 'knowledge', label: 'Knowledge', icon: GraduationCap },
];

const PRICE_TYPE_OPTIONS = ['fixed', 'per day', 'per hour', 'per kg', 'per month'];
const CONDITION_OPTIONS = ['New', 'Excellent', 'Good', 'Fair', 'Used'];

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-700',
  sold: 'bg-blue-50 text-blue-700',
  paused: 'bg-amber-50 text-amber-700',
  pending: 'bg-amber-50 text-amber-700',
  completed: 'bg-emerald-50 text-emerald-700',
  disputed: 'bg-red-50 text-red-700',
};

const STATUS_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  pending: Clock,
  completed: CheckCircle2,
  disputed: AlertTriangle,
};

// ── Page ──
export default function FarmExchangePage() {
  const { user } = useAuth();
  const [dbTransactions, setDbTransactions] = useState<Transaction[]>([]);
  const [dbListings, setDbListings] = useState<MyListing[]>([]);
  const [dbTrades, setDbTrades] = useState<Trade[]>([]);
  const [dbLoading, setDbLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    async function fetchExchangeData() {
      try {
        const { data: orders } = await supabase
          .from('trade_orders')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);
        if (orders && orders.length > 0) {
          // Map trade_orders to transactions
          const txns: Transaction[] = orders.slice(0, 10).map((o: Record<string, unknown>, idx: number) => ({
            id: String(idx + 1),
            type: ((o.order_type as string) === 'sell' ? 'earned' : 'spent') as 'earned' | 'spent',
            description: (o.description as string) || (o.commodity as string) || 'Trade',
            amount: (o.total_amount as number) || (o.amount as number) || 0,
            date: ((o.created_at as string) || '').slice(0, 10),
          }));
          if (txns.length > 0) setDbTransactions(txns);

          // Map to listings (my orders with status marketplace/active)
          const listings: MyListing[] = orders
            .filter((o: Record<string, unknown>) => o.status === 'marketplace' || o.status === 'active' || o.status === 'open')
            .map((o: Record<string, unknown>, idx: number) => ({
              id: String(idx + 1),
              title: (o.title as string) || (o.commodity as string) || 'Listing',
              category: (o.category as string) || 'produce',
              price: String((o.price as number) || (o.total_amount as number) || 0),
              priceType: 'credits',
              status: 'active' as const,
              views: 0,
            }));
          if (listings.length > 0) setDbListings(listings);

          // Map to trades
          const trades: Trade[] = orders.map((o: Record<string, unknown>, idx: number) => ({
            id: String(idx + 1),
            type: ((o.order_type as string) === 'sell' ? 'sale' : 'purchase') as 'purchase' | 'sale',
            title: (o.title as string) || (o.commodity as string) || 'Trade',
            counterparty: (o.counterparty as string) || (o.buyer_id as string) || (o.seller_id as string) || 'Unknown',
            amount: (o.total_amount as number) || (o.amount as number) || 0,
            status: ((o.status as string) === 'completed' ? 'completed' : (o.status as string) === 'disputed' ? 'disputed' : 'pending') as 'pending' | 'completed' | 'disputed',
            date: ((o.created_at as string) || '').slice(0, 10),
            rated: false,
          }));
          if (trades.length > 0) setDbTrades(trades);
        }
      } catch {
        // keep fallback demo data
      } finally {
        setDbLoading(false);
      }
    }
    fetchExchangeData();
  }, []);

  // Use DB data if available, otherwise fallback to demo
  const transactions = dbTransactions.length > 0 ? dbTransactions : DEMO_TRANSACTIONS;
  const myListings = dbListings.length > 0 ? dbListings : DEMO_MY_LISTINGS;
  const trades = dbTrades.length > 0 ? dbTrades : DEMO_TRADES;

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'equipment',
    subcategory: '',
    price: '',
    priceType: 'fixed',
    condition: 'Good',
    quantity: '1',
    unit: 'units',
    photoUrl: '',
    country: 'Zimbabwe',
    region: '',
    delivery: false,
  });

  const handleFormChange = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      category: 'equipment',
      subcategory: '',
      price: '',
      priceType: 'fixed',
      condition: 'Good',
      quantity: '1',
      unit: 'units',
      photoUrl: '',
      country: 'Zimbabwe',
      region: '',
      delivery: false,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormMessage(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.from('trade_orders').insert({
        user_id: user?.id || null,
        title: form.title,
        description: form.description,
        category: form.category,
        commodity: form.subcategory || form.category,
        price: parseFloat(form.price) || 0,
        total_amount: parseFloat(form.price) || 0,
        order_type: 'sell',
        status: 'active',
        condition: form.condition,
        quantity: parseInt(form.quantity) || 1,
        unit: form.unit,
        image_url: form.photoUrl || null,
        country: form.country,
        region: form.region || null,
        delivery_available: form.delivery,
        price_type: form.priceType,
      });

      if (error) throw error;

      setFormMessage({ type: 'success', text: 'Listing published successfully!' });
      resetForm();
      setTimeout(() => {
        setShowCreateModal(false);
        setFormMessage(null);
      }, 1500);
    } catch (err: unknown) {
      setFormMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to create listing. Please try again.' });
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1B2A4A]">AFU Exchange</h1>
          <p className="text-sm text-gray-500 mt-0.5">Trade goods, services & equipment with fellow farmers</p>
        </div>
        <Link
          href="/exchange"
          className="text-sm text-[#5DB347] hover:underline font-medium flex items-center gap-1"
        >
          Browse Marketplace
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* ── A) Credit Wallet ── */}
      <section className="bg-gradient-to-br from-[#1B2A4A] to-[#2D4A7A] rounded-xl p-5 sm:p-6 text-white">
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Balance */}
          <div className="flex-1">
            <p className="text-white/60 text-xs uppercase tracking-wider mb-1">Credit Balance</p>
            <div className="flex items-center gap-2 mb-1">
              <Coins className="w-6 h-6 text-amber-400" />
              <span className="text-3xl sm:text-4xl font-bold">2,450</span>
              <span className="text-white/50 text-sm mt-2">credits</span>
            </div>
            <div className="flex gap-4 text-sm mt-3">
              <div>
                <p className="text-white/50 text-xs">Total Earned</p>
                <p className="font-semibold text-green-400">+4,200</p>
              </div>
              <div>
                <p className="text-white/50 text-xs">Total Spent</p>
                <p className="font-semibold text-red-400">-1,750</p>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Link
                href="/contact?subject=buy-credits"
                className="bg-amber-400 hover:bg-amber-500 text-[#1B2A4A] px-4 py-2 rounded-lg text-xs font-bold transition-colors"
              >
                Buy Credits
              </Link>
              <Link
                href="/contact?subject=cash-out"
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors"
              >
                Cash Out
              </Link>
            </div>
          </div>

          {/* Mini Ledger */}
          <div className="flex-1 bg-white/10 rounded-xl p-4">
            <p className="text-white/60 text-xs uppercase tracking-wider mb-3">Recent Transactions</p>
            <div className="space-y-2">
              {transactions.slice(0, 5).map((tx) => (
                <div key={tx.id} className="flex items-center gap-3 text-sm">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                      tx.type === 'earned' ? 'bg-green-400/20' : 'bg-red-400/20'
                    }`}
                  >
                    {tx.type === 'earned' ? (
                      <ArrowDownLeft className="w-3.5 h-3.5 text-green-400" />
                    ) : (
                      <ArrowUpRight className="w-3.5 h-3.5 text-red-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white/80 text-xs truncate">{tx.description}</p>
                  </div>
                  <span
                    className={`text-xs font-bold whitespace-nowrap ${
                      tx.type === 'earned' ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {tx.type === 'earned' ? '+' : '-'}{tx.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── B) My Listings ── */}
      <section className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-[#1B2A4A] flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#5DB347]" />
            My Listings
          </h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-[#5DB347] hover:bg-[#4A9E35] text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Create New Listing
          </button>
        </div>

        {myListings.length === 0 ? (
          <div className="py-12 text-center">
            <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 text-sm font-medium">No listings yet</p>
            <p className="text-gray-400 text-xs mt-1">Create your first listing to start trading</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {myListings.map((listing) => (
              <div key={listing.id} className="px-5 py-4 flex items-center gap-4 hover:bg-gray-50/50 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-[#1B2A4A] truncate">{listing.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500 capitalize">{listing.category}</span>
                    <span className="text-gray-300">|</span>
                    <span className="text-xs font-semibold text-[#1B2A4A]">{listing.price} {listing.priceType}</span>
                    <span className="text-gray-300">|</span>
                    <span className="text-xs text-gray-400">{listing.views} views</span>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full capitalize ${
                    STATUS_COLORS[listing.status] || 'bg-gray-50 text-gray-600'
                  }`}
                >
                  {listing.status}
                </span>
                <div className="flex items-center gap-1">
                  <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#5DB347] transition-colors" title="Edit">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-red-500 transition-colors" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-blue-500 transition-colors" title="Mark as Sold">
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── C) My Trades ── */}
      <section className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-[#1B2A4A] flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#5DB347]" />
            My Trades
          </h2>
        </div>

        <div className="divide-y divide-gray-50">
          {trades.map((trade) => {
            const StatusIcon = STATUS_ICONS[trade.status] || Clock;
            return (
              <div key={trade.id} className="px-5 py-4 flex items-center gap-4 hover:bg-gray-50/50 transition-colors">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    trade.type === 'sale' ? 'bg-green-50' : 'bg-blue-50'
                  }`}
                >
                  {trade.type === 'sale' ? (
                    <ArrowUpRight className="w-4 h-4 text-green-600" />
                  ) : (
                    <ArrowDownLeft className="w-4 h-4 text-blue-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-[#1B2A4A] truncate">{trade.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {trade.type === 'sale' ? 'Sold to' : 'Bought from'} {trade.counterparty} &bull; {trade.date}
                  </p>
                </div>
                <span
                  className={`text-xs font-bold ${
                    trade.type === 'sale' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {trade.type === 'sale' ? '+' : '-'}{trade.amount} credits
                </span>
                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full capitalize flex items-center gap-1 ${
                    STATUS_COLORS[trade.status] || 'bg-gray-50 text-gray-600'
                  }`}
                >
                  <StatusIcon className="w-3 h-3" />
                  {trade.status}
                </span>
                {trade.status === 'completed' && !trade.rated && (
                  <button className="text-amber-500 hover:text-amber-600 transition-colors" title="Rate this trade">
                    <Star className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── D) Create Listing Modal ── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl z-10">
              <h3 className="font-bold text-[#1B2A4A]">Create New Listing</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => handleFormChange('title', e.target.value)}
                  placeholder="e.g., John Deere Tractor for Hire"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                  rows={3}
                  placeholder="Describe your item or service..."
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none resize-none"
                />
              </div>

              {/* Category + Subcategory */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Category *</label>
                  <select
                    value={form.category}
                    onChange={(e) => handleFormChange('category', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none"
                  >
                    {CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Subcategory</label>
                  <input
                    type="text"
                    value={form.subcategory}
                    onChange={(e) => handleFormChange('subcategory', e.target.value)}
                    placeholder="e.g., Tractor"
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none"
                  />
                </div>
              </div>

              {/* Price + Price Type */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Price (credits) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={form.price}
                    onChange={(e) => handleFormChange('price', e.target.value)}
                    placeholder="500"
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Price Type</label>
                  <select
                    value={form.priceType}
                    onChange={(e) => handleFormChange('priceType', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none"
                  >
                    {PRICE_TYPE_OPTIONS.map((pt) => (
                      <option key={pt} value={pt}>{pt}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Condition + Quantity + Unit */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Condition</label>
                  <select
                    value={form.condition}
                    onChange={(e) => handleFormChange('condition', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none"
                  >
                    {CONDITION_OPTIONS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={form.quantity}
                    onChange={(e) => handleFormChange('quantity', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Unit</label>
                  <input
                    type="text"
                    value={form.unit}
                    onChange={(e) => handleFormChange('unit', e.target.value)}
                    placeholder="kg, units..."
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none"
                  />
                </div>
              </div>

              {/* Photo URL */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Photo URL</label>
                <input
                  type="url"
                  value={form.photoUrl}
                  onChange={(e) => handleFormChange('photoUrl', e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none"
                />
              </div>

              {/* Country + Region */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Country</label>
                  <input
                    type="text"
                    value={form.country}
                    onChange={(e) => handleFormChange('country', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none bg-gray-50"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Region</label>
                  <input
                    type="text"
                    value={form.region}
                    onChange={(e) => handleFormChange('region', e.target.value)}
                    placeholder="e.g., Harare"
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none"
                  />
                </div>
              </div>

              {/* Delivery toggle */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                <Truck className="w-5 h-5 text-gray-400" />
                <label className="flex-1 text-sm font-medium text-gray-700">Delivery Available</label>
                <button
                  type="button"
                  onClick={() => handleFormChange('delivery', !form.delivery)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    form.delivery ? 'bg-[#5DB347]' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                      form.delivery ? 'translate-x-5.5 left-[1px]' : 'left-0.5'
                    }`}
                    style={{ transform: form.delivery ? 'translateX(22px)' : 'translateX(0)' }}
                  />
                </button>
              </div>

              {/* Status message */}
              {formMessage && (
                <div className={`p-3 rounded-lg text-sm font-medium ${
                  formMessage.type === 'success'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {formMessage.text}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={formSubmitting}
                className="w-full bg-[#5DB347] hover:bg-[#4A9E35] text-white py-3 rounded-xl font-semibold text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {formSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    Publishing...
                  </>
                ) : (
                  'Publish Listing'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
