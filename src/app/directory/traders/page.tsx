'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/supabase/auth-context';
import {
  BarChart3, MapPin, Search, Filter, X, ChevronLeft,
  MessageSquare, LogIn, Loader2, CheckCircle,
  DollarSign, TrendingUp, ArrowLeftRight, Globe,
} from 'lucide-react';

/* ─── Constants ─── */
const COUNTRIES = [
  'All', 'Zimbabwe', 'Botswana', 'Kenya', 'Tanzania', 'South Africa',
  'Nigeria', 'Ghana', 'Uganda', 'Zambia', 'Mozambique', 'Ethiopia',
  'Sierra Leone', 'Angola', 'Malawi', 'Rwanda', 'Senegal', 'Ivory Coast',
  'DRC', 'Namibia',
];

const COMMODITY_TYPES = [
  'All', 'Maize', 'Wheat', 'Soybean', 'Coffee', 'Cocoa', 'Cotton',
  'Tobacco', 'Tea', 'Cashew Nuts', 'Groundnuts', 'Rice', 'Sorghum',
  'Sesame', 'Avocado', 'Macadamia', 'Beef', 'Poultry',
];

const TRADING_TYPES = ['All', 'Buyer', 'Seller', 'Both'];

/* ─── Types ─── */
interface Provider {
  id: string;
  profile_id: string;
  business_name: string;
  full_name: string;
  email: string;
  phone: string | null;
  country: string;
  region: string | null;
  provider_type: string;
  photo_url: string | null;
  bio: string | null;
  rating: number | null;
  review_count: number;
  is_listed: boolean;
  provider_details: Record<string, any> | null;
  created_at: string;
}

function TradingBadge({ type }: { type: string }) {
  const config: Record<string, { bg: string; text: string }> = {
    buyer: { bg: 'bg-blue-50', text: 'text-blue-700' },
    seller: { bg: 'bg-green-50', text: 'text-green-700' },
    both: { bg: 'bg-purple-50', text: 'text-purple-700' },
  };
  const c = config[type?.toLowerCase()] || config.both;
  return (
    <span className={`px-2.5 py-0.5 ${c.bg} ${c.text} text-xs rounded-full font-semibold capitalize`}>
      {type || 'Trader'}
    </span>
  );
}

export default function TradersDirectoryPage() {
  const { user } = useAuth();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [countryFilter, setCountryFilter] = useState('All');
  const [commodityFilter, setCommodityFilter] = useState('All');
  const [tradingTypeFilter, setTradingTypeFilter] = useState('All');

  // Modal state
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    preferred_date: '',
    commodity: '',
    quantity: '',
  });

  useEffect(() => {
    const supabase = createClient();

    async function fetchTraders() {
      const { data, error } = await supabase
        .from('service_providers')
        .select('*')
        .eq('provider_type', 'trader')
        .eq('is_listed', true)
        .order('rating', { ascending: false, nullsFirst: false });

      if (!error && data) setProviders(data);
      setLoading(false);
    }

    fetchTraders();
  }, []);

  const filtered = useMemo(() => {
    return providers.filter((p) => {
      if (countryFilter !== 'All' && p.country !== countryFilter) return false;
      if (commodityFilter !== 'All') {
        const commodities = p.provider_details?.commodities || [];
        if (!commodities.map((c: string) => c.toLowerCase()).includes(commodityFilter.toLowerCase())) return false;
      }
      if (tradingTypeFilter !== 'All') {
        const tt = (p.provider_details?.trading_type || '').toLowerCase();
        if (tt !== tradingTypeFilter.toLowerCase()) return false;
      }
      if (search) {
        const q = search.toLowerCase();
        return (
          p.business_name?.toLowerCase().includes(q) ||
          p.full_name?.toLowerCase().includes(q) ||
          p.country?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [providers, countryFilter, commodityFilter, tradingTypeFilter, search]);

  function openModal(provider: Provider) {
    setSelectedProvider(provider);
    setModalOpen(true);
    setSubmitSuccess(false);
    setSubmitError('');
    setFormData({ subject: '', description: '', preferred_date: '', commodity: '', quantity: '' });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedProvider || !user) return;

    setSubmitting(true);
    setSubmitError('');

    try {
      const res = await fetch('/api/service-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider_id: selectedProvider.id,
          request_type: 'general',
          subject: formData.subject,
          description: formData.description,
          preferred_date: formData.preferred_date || null,
          commodity: formData.commodity || null,
          quantity: formData.quantity ? Number(formData.quantity) : null,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to submit');

      setSubmitSuccess(true);
    } catch (err: any) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1B2A4A] to-[#2d4a7a] text-white py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4">
          <Link href="/directory" className="inline-flex items-center gap-1 text-white/60 hover:text-white text-sm mb-4 transition-colors">
            <ChevronLeft className="w-4 h-4" /> Back to Directory
          </Link>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/10">
                <BarChart3 className="w-6 h-6 text-[#5DB347]" />
              </div>
              <h1 className="text-2xl md:text-4xl font-bold">Traders</h1>
            </div>
            <p className="text-white/70 max-w-2xl">
              Browse commodity traders across Africa. Find buyers, sellers, and brokers for your agricultural products.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section className="max-w-6xl mx-auto px-4 -mt-6">
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
          <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none"
              />
            </div>
            <select
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="w-full py-2.5 px-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none bg-white"
            >
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>{c === 'All' ? 'All Countries' : c}</option>
              ))}
            </select>
            <select
              value={commodityFilter}
              onChange={(e) => setCommodityFilter(e.target.value)}
              className="w-full py-2.5 px-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none bg-white"
            >
              {COMMODITY_TYPES.map((c) => (
                <option key={c} value={c}>{c === 'All' ? 'All Commodities' : c}</option>
              ))}
            </select>
            <select
              value={tradingTypeFilter}
              onChange={(e) => setTradingTypeFilter(e.target.value)}
              className="w-full py-2.5 px-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none bg-white"
            >
              {TRADING_TYPES.map((t) => (
                <option key={t} value={t}>{t === 'All' ? 'All Trading Types' : t}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#5DB347] animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No traders found</h3>
            <p className="text-gray-500 text-sm">Try adjusting your filters or check back later.</p>
          </motion.div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">{filtered.length} trader{filtered.length !== 1 ? 's' : ''} found</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((p, i) => {
                const details = p.provider_details || {};
                return (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden"
                  >
                    <div className="p-6">
                      {/* Header */}
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center flex-shrink-0">
                          <BarChart3 className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h3 className="font-bold text-[#1B2A4A] truncate">{p.business_name}</h3>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <MapPin className="w-3.5 h-3.5" />
                              <span>{p.country}</span>
                            </div>
                            {details.trading_type && <TradingBadge type={details.trading_type} />}
                          </div>
                        </div>
                      </div>

                      {/* Commodities */}
                      {details.commodities && details.commodities.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs text-gray-400 mb-1.5 font-medium uppercase tracking-wide">Commodities</p>
                          <div className="flex flex-wrap gap-1.5">
                            {(details.commodities as string[]).slice(0, 4).map((c) => (
                              <span key={c} className="px-2 py-0.5 bg-violet-50 text-violet-700 text-xs rounded-full font-medium">{c}</span>
                            ))}
                            {details.commodities.length > 4 && (
                              <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">+{details.commodities.length - 4}</span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Details */}
                      <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                        {details.annual_volume && (
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <TrendingUp className="w-3.5 h-3.5 text-gray-400" />
                            <span>{details.annual_volume}</span>
                          </div>
                        )}
                        {details.settlement_currency && (
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <DollarSign className="w-3.5 h-3.5 text-gray-400" />
                            <span>{details.settlement_currency}</span>
                          </div>
                        )}
                        {details.markets && details.markets.length > 0 && (
                          <div className="flex items-center gap-1.5 text-gray-600 col-span-2">
                            <Globe className="w-3.5 h-3.5 text-gray-400" />
                            <span>{(details.markets as string[]).slice(0, 3).join(', ')}</span>
                          </div>
                        )}
                      </div>

                      {/* Action */}
                      <div className="pt-3 border-t border-gray-100">
                        {user ? (
                          <button
                            onClick={() => openModal(p)}
                            className="w-full py-2 bg-[#5DB347] text-white text-sm font-medium rounded-lg hover:bg-[#4ea33c] transition-colors flex items-center justify-center gap-2"
                          >
                            <MessageSquare className="w-4 h-4" />
                            Contact Trader
                          </button>
                        ) : (
                          <Link
                            href="/login"
                            className="w-full py-2 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-1.5"
                          >
                            <LogIn className="w-3.5 h-3.5" />
                            Log in to contact
                          </Link>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}
      </section>

      {/* Request Modal */}
      <AnimatePresence>
        {modalOpen && selectedProvider && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-[#1B2A4A]">Contact Trader</h2>
                    <p className="text-sm text-gray-500">{selectedProvider.business_name}</p>
                  </div>
                  <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                {submitSuccess ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-[#5DB347] mx-auto mb-3" />
                    <h3 className="font-semibold text-[#1B2A4A] mb-1">Message Sent</h3>
                    <p className="text-sm text-gray-500">The trader will review your inquiry and respond shortly.</p>
                    <button
                      onClick={() => setModalOpen(false)}
                      className="mt-4 px-6 py-2 bg-[#5DB347] text-white rounded-lg text-sm font-medium hover:bg-[#4ea33c] transition-colors"
                    >
                      Done
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                      <input
                        type="text"
                        required
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        placeholder="e.g., Interest in purchasing coffee beans"
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Commodity</label>
                        <input
                          type="text"
                          value={formData.commodity}
                          onChange={(e) => setFormData({ ...formData, commodity: e.target.value })}
                          placeholder="e.g., Coffee"
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Quantity (MT)</label>
                        <input
                          type="number"
                          value={formData.quantity}
                          onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                          placeholder="e.g., 200"
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        rows={3}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Describe your trading inquiry..."
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Date</label>
                      <input
                        type="date"
                        value={formData.preferred_date}
                        onChange={(e) => setFormData({ ...formData, preferred_date: e.target.value })}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none"
                      />
                    </div>

                    {submitError && (
                      <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{submitError}</p>
                    )}

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-2.5 bg-[#5DB347] text-white font-medium rounded-lg hover:bg-[#4ea33c] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
                      ) : (
                        <><MessageSquare className="w-4 h-4" /> Send Inquiry</>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
