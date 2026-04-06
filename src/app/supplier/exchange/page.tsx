'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/supabase/auth-context';
import {
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  X,
  Loader2,
  Package,
  ShoppingCart,
  ArrowLeftRight,
  DollarSign,
  MapPin,
  Truck,
  Eye,
} from 'lucide-react';

// ── Types ──
interface Offer {
  id: string;
  commodity: string;
  description: string;
  quantity: number;
  unit: string;
  price: number;
  price_type: string;
  delivery_terms: string;
  country: string;
  region: string;
  status: string;
  created_at: string;
}

interface BuyRequest {
  id: string;
  commodity: string;
  description: string;
  quantity: number;
  unit: string;
  budget: number;
  buyer_name: string;
  country: string;
  region: string;
  status: string;
  created_at: string;
}

interface Transaction {
  id: string;
  commodity: string;
  counterparty: string;
  amount: number;
  quantity: number;
  unit: string;
  type: string;
  status: string;
  date: string;
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-700',
  open: 'bg-emerald-50 text-emerald-700',
  sold: 'bg-blue-50 text-blue-700',
  paused: 'bg-amber-50 text-amber-700',
  pending: 'bg-amber-50 text-amber-700',
  completed: 'bg-emerald-50 text-emerald-700',
  disputed: 'bg-red-50 text-red-700',
  cancelled: 'bg-gray-100 text-gray-600',
};

const STATUS_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  pending: Clock,
  completed: CheckCircle2,
  disputed: AlertTriangle,
  active: CheckCircle2,
  open: Clock,
};

const UNIT_OPTIONS = ['kg', 'tonnes', 'bags', 'litres', 'crates', 'units', 'bundles'];
const PRICE_TYPE_OPTIONS = ['per kg', 'per tonne', 'per bag', 'per litre', 'per crate', 'per unit', 'total'];
const DELIVERY_OPTIONS = ['Ex-works', 'FOB', 'CIF', 'Delivered to buyer', 'Pickup only'];

export default function SupplierExchangePage() {
  const { user } = useAuth();
  const supabase = createClient();

  const [tab, setTab] = useState<'offers' | 'requests' | 'transactions'>('offers');
  const [loading, setLoading] = useState(true);

  // Offers state
  const [offers, setOffers] = useState<Offer[]>([]);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [offerForm, setOfferForm] = useState({
    commodity: '', description: '', quantity: '', unit: 'kg',
    price: '', price_type: 'per kg', delivery_terms: 'Ex-works',
    country: '', region: '',
  });
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Browse requests state
  const [requests, setRequests] = useState<BuyRequest[]>([]);

  // Transactions state
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // ── Fetch data ──
  const fetchOffers = useCallback(async () => {
    if (!user?.id) return;
    try {
      const { data } = await supabase
        .from('trade_orders')
        .select('*')
        .eq('user_id', user.id)
        .eq('order_type', 'sell')
        .order('created_at', { ascending: false })
        .limit(100);
      if (data) {
        setOffers(data.map((o: Record<string, unknown>) => ({
          id: o.id as string,
          commodity: (o.commodity as string) || (o.title as string) || '',
          description: (o.description as string) || '',
          quantity: (o.quantity as number) || 0,
          unit: (o.unit as string) || 'kg',
          price: (o.price as number) || (o.total_amount as number) || 0,
          price_type: (o.price_type as string) || 'per kg',
          delivery_terms: (o.delivery_terms as string) || 'Ex-works',
          country: (o.country as string) || '',
          region: (o.region as string) || '',
          status: (o.status as string) || 'active',
          created_at: (o.created_at as string) || '',
        })));
      }
    } catch { /* keep empty */ }
  }, [user?.id]);

  const fetchRequests = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('trade_orders')
        .select('*')
        .eq('order_type', 'buy')
        .in('status', ['active', 'open', 'marketplace'])
        .order('created_at', { ascending: false })
        .limit(100);
      if (data) {
        setRequests(data.map((o: Record<string, unknown>) => ({
          id: o.id as string,
          commodity: (o.commodity as string) || (o.title as string) || '',
          description: (o.description as string) || '',
          quantity: (o.quantity as number) || 0,
          unit: (o.unit as string) || 'kg',
          budget: (o.price as number) || (o.total_amount as number) || 0,
          buyer_name: (o.buyer_name as string) || (o.counterparty as string) || 'Anonymous Farmer',
          country: (o.country as string) || '',
          region: (o.region as string) || '',
          status: (o.status as string) || 'open',
          created_at: (o.created_at as string) || '',
        })));
      }
    } catch { /* keep empty */ }
  }, []);

  const fetchTransactions = useCallback(async () => {
    if (!user?.id) return;
    try {
      const { data } = await supabase
        .from('trade_orders')
        .select('*')
        .or(`seller_id.eq.${user.id},user_id.eq.${user.id}`)
        .in('status', ['completed', 'disputed'])
        .order('created_at', { ascending: false })
        .limit(100);
      if (data) {
        setTransactions(data.map((o: Record<string, unknown>) => ({
          id: o.id as string,
          commodity: (o.commodity as string) || (o.title as string) || '',
          counterparty: (o.counterparty as string) || (o.buyer_name as string) || 'Unknown',
          amount: (o.total_amount as number) || (o.price as number) || 0,
          quantity: (o.quantity as number) || 0,
          unit: (o.unit as string) || 'kg',
          type: (o.order_type as string) || 'sell',
          status: (o.status as string) || 'completed',
          date: ((o.created_at as string) || '').slice(0, 10),
        })));
      }
    } catch { /* keep empty */ }
  }, [user?.id]);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchOffers(), fetchRequests(), fetchTransactions()]).finally(() => setLoading(false));
  }, [fetchOffers, fetchRequests, fetchTransactions]);

  // ── Offer form helpers ──
  const resetOfferForm = () => {
    setOfferForm({
      commodity: '', description: '', quantity: '', unit: 'kg',
      price: '', price_type: 'per kg', delivery_terms: 'Ex-works',
      country: '', region: '',
    });
    setEditingOffer(null);
  };

  const openCreateModal = () => {
    resetOfferForm();
    setShowOfferModal(true);
  };

  const openEditModal = (offer: Offer) => {
    setEditingOffer(offer);
    setOfferForm({
      commodity: offer.commodity,
      description: offer.description,
      quantity: String(offer.quantity),
      unit: offer.unit,
      price: String(offer.price),
      price_type: offer.price_type,
      delivery_terms: offer.delivery_terms,
      country: offer.country,
      region: offer.region,
    });
    setShowOfferModal(true);
  };

  const handleOfferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    setFormSubmitting(true);

    const payload = {
      user_id: user.id,
      commodity: offerForm.commodity,
      title: offerForm.commodity,
      description: offerForm.description,
      quantity: parseFloat(offerForm.quantity) || 0,
      unit: offerForm.unit,
      price: parseFloat(offerForm.price) || 0,
      total_amount: parseFloat(offerForm.price) || 0,
      price_type: offerForm.price_type,
      delivery_terms: offerForm.delivery_terms,
      country: offerForm.country,
      region: offerForm.region || null,
      order_type: 'sell',
      status: 'active',
    };

    try {
      if (editingOffer) {
        const { error } = await supabase
          .from('trade_orders')
          .update(payload)
          .eq('id', editingOffer.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('trade_orders')
          .insert(payload);
        if (error) throw error;
      }
      setShowOfferModal(false);
      resetOfferForm();
      await fetchOffers();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save offer');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteOffer = async (offer: Offer) => {
    if (!window.confirm(`Delete offer for "${offer.commodity}"? This cannot be undone.`)) return;
    try {
      const { error } = await supabase.from('trade_orders').delete().eq('id', offer.id);
      if (error) throw error;
      setOffers((prev) => prev.filter((o) => o.id !== offer.id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete offer');
    }
  };

  const handleMarkSold = async (offer: Offer) => {
    try {
      const { error } = await supabase
        .from('trade_orders')
        .update({ status: 'completed' })
        .eq('id', offer.id);
      if (error) throw error;
      setOffers((prev) =>
        prev.map((o) => (o.id === offer.id ? { ...o, status: 'completed' } : o))
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update offer');
    }
  };

  // ── Tab content ──
  const tabs = [
    { key: 'offers' as const, label: 'My Offers', icon: Package },
    { key: 'requests' as const, label: 'Browse Requests', icon: ShoppingCart },
    { key: 'transactions' as const, label: 'Transactions', icon: ArrowLeftRight },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">Exchange</h1>
          <p className="text-sm text-gray-500 mt-1">Post bulk supply offers, browse farmer requests, and track trades</p>
        </div>
        {tab === 'offers' && (
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#5DB347] text-white text-sm font-medium rounded-lg hover:bg-[#4a9a38] shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" /> New Offer
          </button>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
              <Package className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Active Offers</p>
              <p className="text-xl font-bold text-[#1B2A4A]">{offers.filter((o) => o.status === 'active').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Eye className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Open Buy Requests</p>
              <p className="text-xl font-bold text-[#1B2A4A]">{requests.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Completed Trades</p>
              <p className="text-xl font-bold text-[#1B2A4A]">{transactions.filter((t) => t.status === 'completed').length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                tab === t.key ? 'bg-white text-[#1B2A4A] shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Loading */}
      {loading ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#5DB347] mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading exchange data...</p>
        </div>
      ) : (
        <>
          {/* ─── My Offers Tab ─── */}
          {tab === 'offers' && (
            <div className="space-y-4">
              {offers.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-[#1B2A4A]">No offers yet</h3>
                  <p className="text-sm text-gray-500 mt-1">Post your first bulk supply offer to reach farmers.</p>
                  <button onClick={openCreateModal} className="mt-4 px-4 py-2 bg-[#5DB347] text-white text-sm font-medium rounded-lg hover:bg-[#4a9a38]">
                    <Plus className="w-4 h-4 inline mr-1" /> Create Offer
                  </button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {offers.map((offer) => {
                    const StatusIcon = STATUS_ICONS[offer.status] || Clock;
                    return (
                      <div key={offer.id} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-[#1B2A4A] truncate">{offer.commodity}</h3>
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[offer.status] || 'bg-gray-100 text-gray-600'}`}>
                                <StatusIcon className="w-3 h-3" /> {offer.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 line-clamp-1">{offer.description || 'No description'}</p>
                            <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                              <span className="flex items-center gap-1"><Package className="w-3.5 h-3.5" /> {offer.quantity} {offer.unit}</span>
                              <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" /> {offer.price.toLocaleString()} ({offer.price_type})</span>
                              <span className="flex items-center gap-1"><Truck className="w-3.5 h-3.5" /> {offer.delivery_terms}</span>
                              {offer.country && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {offer.country}{offer.region ? `, ${offer.region}` : ''}</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {offer.status === 'active' && (
                              <>
                                <button onClick={() => openEditModal(offer)} className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100" title="Edit">
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleMarkSold(offer)} className="p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100" title="Mark Sold">
                                  <CheckCircle2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                            <button onClick={() => handleDeleteOffer(offer)} className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100" title="Delete">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ─── Browse Requests Tab ─── */}
          {tab === 'requests' && (
            <div className="space-y-4">
              {requests.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
                  <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-[#1B2A4A]">No buy requests</h3>
                  <p className="text-sm text-gray-500 mt-1">No farmers have posted buy requests yet. Check back soon.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {requests.map((req) => (
                    <div key={req.id} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-[#1B2A4A] truncate">{req.commodity}</h3>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[req.status] || 'bg-gray-100 text-gray-600'}`}>
                              {req.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 line-clamp-2">{req.description || 'No description provided'}</p>
                          <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                            <span className="flex items-center gap-1"><Package className="w-3.5 h-3.5" /> Wants: {req.quantity} {req.unit}</span>
                            <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" /> Budget: {req.budget.toLocaleString()}</span>
                            <span>Buyer: {req.buyer_name}</span>
                            {req.country && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {req.country}{req.region ? `, ${req.region}` : ''}</span>}
                          </div>
                          <p className="text-[10px] text-gray-400 mt-1">Posted {new Date(req.created_at).toLocaleDateString()}</p>
                        </div>
                        <button
                          onClick={() => alert('Responding to buy requests will be available soon. You will be able to submit a quote directly.')}
                          className="shrink-0 px-4 py-2 bg-[#5DB347] text-white text-sm font-medium rounded-lg hover:bg-[#4a9a38] transition-all"
                        >
                          Respond
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ─── Transactions Tab ─── */}
          {tab === 'transactions' && (
            <div className="space-y-4">
              {transactions.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
                  <ArrowLeftRight className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-[#1B2A4A]">No transactions yet</h3>
                  <p className="text-sm text-gray-500 mt-1">Completed and disputed trades will appear here.</p>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/50">
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500">Commodity</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500">Counterparty</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500">Quantity</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500">Amount</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500">Status</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {transactions.map((tx) => {
                        const StatusIcon = STATUS_ICONS[tx.status] || Clock;
                        return (
                          <tr key={tx.id} className="hover:bg-gray-50/50">
                            <td className="py-3 px-4 font-medium text-[#1B2A4A]">{tx.commodity}</td>
                            <td className="py-3 px-4 text-gray-600">{tx.counterparty}</td>
                            <td className="py-3 px-4 text-gray-600">{tx.quantity} {tx.unit}</td>
                            <td className="py-3 px-4 font-medium text-[#1B2A4A]">{tx.amount.toLocaleString()}</td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[tx.status] || 'bg-gray-100 text-gray-600'}`}>
                                <StatusIcon className="w-3 h-3" /> {tx.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-gray-500">{tx.date}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ─── Create / Edit Offer Modal ─── */}
      {showOfferModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => { setShowOfferModal(false); resetOfferForm(); }}>
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-[#1B2A4A]">{editingOffer ? 'Edit Offer' : 'New Supply Offer'}</h3>
              <button onClick={() => { setShowOfferModal(false); resetOfferForm(); }} className="p-2 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleOfferSubmit} className="p-6 space-y-4">
              {/* Commodity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Commodity / Product *</label>
                <input
                  type="text" required value={offerForm.commodity}
                  onChange={(e) => setOfferForm((p) => ({ ...p, commodity: e.target.value }))}
                  placeholder="e.g. Maize, Fertilizer, Seeds"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347]"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows={3} value={offerForm.description}
                  onChange={(e) => setOfferForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Describe your offer, quality, grade, certifications..."
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347]"
                />
              </div>

              {/* Quantity + Unit */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                  <input
                    type="number" required min="0" step="any" value={offerForm.quantity}
                    onChange={(e) => setOfferForm((p) => ({ ...p, quantity: e.target.value }))}
                    placeholder="0"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <select
                    value={offerForm.unit}
                    onChange={(e) => setOfferForm((p) => ({ ...p, unit: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347]"
                  >
                    {UNIT_OPTIONS.map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>

              {/* Price + Price Type */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                  <input
                    type="number" required min="0" step="any" value={offerForm.price}
                    onChange={(e) => setOfferForm((p) => ({ ...p, price: e.target.value }))}
                    placeholder="0"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price Type</label>
                  <select
                    value={offerForm.price_type}
                    onChange={(e) => setOfferForm((p) => ({ ...p, price_type: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347]"
                  >
                    {PRICE_TYPE_OPTIONS.map((pt) => <option key={pt} value={pt}>{pt}</option>)}
                  </select>
                </div>
              </div>

              {/* Delivery Terms */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Terms</label>
                <select
                  value={offerForm.delivery_terms}
                  onChange={(e) => setOfferForm((p) => ({ ...p, delivery_terms: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347]"
                >
                  {DELIVERY_OPTIONS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              {/* Country + Region */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <input
                    type="text" value={offerForm.country}
                    onChange={(e) => setOfferForm((p) => ({ ...p, country: e.target.value }))}
                    placeholder="e.g. Zimbabwe"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
                  <input
                    type="text" value={offerForm.region}
                    onChange={(e) => setOfferForm((p) => ({ ...p, region: e.target.value }))}
                    placeholder="e.g. Mashonaland"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347]"
                  />
                </div>
              </div>

              {/* Submit */}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => { setShowOfferModal(false); resetOfferForm(); }}
                  className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={formSubmitting}
                  className="flex items-center gap-2 px-5 py-2 bg-[#5DB347] text-white text-sm font-medium rounded-lg hover:bg-[#4a9a38] disabled:opacity-50">
                  {formSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingOffer ? 'Update Offer' : 'Publish Offer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
