'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/supabase/auth-context';
import {
  Factory, MapPin, Search, Filter, X, ChevronLeft,
  MessageSquare, LogIn, Loader2, CheckCircle, CalendarCheck,
  Award, Gauge, Warehouse,
} from 'lucide-react';

/* ─── Constants ─── */
const COUNTRIES = [
  'All', 'Zimbabwe', 'Botswana', 'Kenya', 'Tanzania', 'South Africa',
  'Nigeria', 'Ghana', 'Uganda', 'Zambia', 'Mozambique', 'Ethiopia',
  'Sierra Leone', 'Angola', 'Malawi', 'Rwanda', 'Senegal', 'Ivory Coast',
  'DRC', 'Namibia',
];

const PROCESSING_TYPES = [
  'All', 'Milling', 'Drying', 'Cold Storage', 'Packaging', 'Oil Extraction',
  'Roasting', 'Canning', 'Smoking', 'Fermentation', 'Sorting & Grading',
];

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

export default function ProcessingDirectoryPage() {
  const { user } = useAuth();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [countryFilter, setCountryFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

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

    async function fetchProcessing() {
      const { data, error } = await supabase
        .from('service_providers')
        .select('*')
        .eq('provider_type', 'processing')
        .eq('is_listed', true)
        .order('rating', { ascending: false, nullsFirst: false });

      if (!error && data) setProviders(data);
      setLoading(false);
    }

    fetchProcessing();
  }, []);

  const filtered = useMemo(() => {
    return providers.filter((p) => {
      if (countryFilter !== 'All' && p.country !== countryFilter) return false;
      if (typeFilter !== 'All') {
        const types = p.provider_details?.processing_types || [];
        if (!types.map((t: string) => t.toLowerCase()).includes(typeFilter.toLowerCase())) return false;
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
  }, [providers, countryFilter, typeFilter, search]);

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
          request_type: 'booking',
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
                <Factory className="w-6 h-6 text-[#5DB347]" />
              </div>
              <h1 className="text-2xl md:text-4xl font-bold">Processing Hubs</h1>
            </div>
            <p className="text-white/70 max-w-2xl">
              Find milling, drying, cold storage, and other processing facilities across Africa. Add value to your harvest.
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full py-2.5 px-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none bg-white"
            >
              {PROCESSING_TYPES.map((t) => (
                <option key={t} value={t}>{t === 'All' ? 'All Processing Types' : t}</option>
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
            <Factory className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No processing hubs found</h3>
            <p className="text-gray-500 text-sm">Try adjusting your filters or check back later.</p>
          </motion.div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">{filtered.length} facilit{filtered.length !== 1 ? 'ies' : 'y'} found</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((p, i) => {
                const details = p.provider_details || {};
                const utilisation = details.utilisation_percent;
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
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center flex-shrink-0">
                          <Factory className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-[#1B2A4A] truncate">{p.business_name}</h3>
                          <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>{p.country}{p.region ? `, ${p.region}` : ''}</span>
                          </div>
                        </div>
                      </div>

                      {/* Processing types */}
                      {details.processing_types && details.processing_types.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs text-gray-400 mb-1.5 font-medium uppercase tracking-wide">Processing Types</p>
                          <div className="flex flex-wrap gap-1.5">
                            {(details.processing_types as string[]).slice(0, 4).map((t) => (
                              <span key={t} className="px-2 py-0.5 bg-orange-50 text-orange-700 text-xs rounded-full font-medium">{t}</span>
                            ))}
                            {details.processing_types.length > 4 && (
                              <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">+{details.processing_types.length - 4}</span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Details */}
                      <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                        {details.capacity_mt_day && (
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <Warehouse className="w-3.5 h-3.5 text-gray-400" />
                            <span>{details.capacity_mt_day} MT/day</span>
                          </div>
                        )}
                        {details.certifications && details.certifications.length > 0 && (
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <Award className="w-3.5 h-3.5 text-gray-400" />
                            <span>{(details.certifications as string[]).slice(0, 2).join(', ')}</span>
                          </div>
                        )}
                        {utilisation != null && (
                          <div className="col-span-2">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="flex items-center gap-1 text-gray-500">
                                <Gauge className="w-3.5 h-3.5" /> Utilisation
                              </span>
                              <span className="font-medium text-gray-700">{utilisation}%</span>
                            </div>
                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  utilisation > 85 ? 'bg-red-400' : utilisation > 60 ? 'bg-amber-400' : 'bg-[#5DB347]'
                                }`}
                                style={{ width: `${Math.min(utilisation, 100)}%` }}
                              />
                            </div>
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
                            <CalendarCheck className="w-4 h-4" />
                            Book Processing
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
                    <h2 className="text-lg font-bold text-[#1B2A4A]">Book Processing</h2>
                    <p className="text-sm text-gray-500">{selectedProvider.business_name}</p>
                  </div>
                  <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                {submitSuccess ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-[#5DB347] mx-auto mb-3" />
                    <h3 className="font-semibold text-[#1B2A4A] mb-1">Booking Request Sent</h3>
                    <p className="text-sm text-gray-500">The processing facility will confirm your booking shortly.</p>
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
                        placeholder="e.g., Maize milling - 50 MT batch"
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
                          placeholder="e.g., Maize"
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Quantity (MT)</label>
                        <input
                          type="number"
                          value={formData.quantity}
                          onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                          placeholder="e.g., 50"
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
                        placeholder="Describe your processing requirements..."
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Processing Date</label>
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
                        <><CalendarCheck className="w-4 h-4" /> Submit Booking Request</>
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
