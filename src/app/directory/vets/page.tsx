'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/supabase/auth-context';
import {
  Stethoscope, MapPin, Star, Search, Filter, X, ChevronLeft,
  Calendar, MessageSquare, Clock, LogIn, Loader2, CheckCircle,
} from 'lucide-react';

/* ─── Constants ─── */
const COUNTRIES = [
  'All', 'Zimbabwe', 'Botswana', 'Kenya', 'Tanzania', 'South Africa',
  'Nigeria', 'Ghana', 'Uganda', 'Zambia', 'Mozambique', 'Ethiopia',
  'Sierra Leone', 'Angola', 'Malawi', 'Rwanda', 'Senegal', 'Ivory Coast',
  'DRC', 'Namibia',
];

const SPECIES = [
  'All', 'Cattle', 'Poultry', 'Goats', 'Sheep', 'Pigs', 'Equine', 'Aquaculture',
];

const SERVICE_TYPES = [
  'All', 'General Practice', 'Surgery', 'Vaccination', 'Reproduction',
  'Nutrition', 'Laboratory', 'Emergency', 'Consulting',
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

export default function VetsDirectoryPage() {
  const { user, profile } = useAuth();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [countryFilter, setCountryFilter] = useState('All');
  const [speciesFilter, setSpeciesFilter] = useState('All');
  const [serviceFilter, setServiceFilter] = useState('All');

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
    notes: '',
  });

  useEffect(() => {
    const supabase = createClient();

    async function fetchVets() {
      const { data, error } = await supabase
        .from('service_providers')
        .select('*')
        .eq('provider_type', 'vet')
        .eq('is_listed', true)
        .order('rating', { ascending: false, nullsFirst: false });

      if (!error && data) setProviders(data);
      setLoading(false);
    }

    fetchVets();
  }, []);

  const filtered = useMemo(() => {
    return providers.filter((p) => {
      if (countryFilter !== 'All' && p.country !== countryFilter) return false;
      if (speciesFilter !== 'All') {
        const species = p.provider_details?.species || [];
        if (!species.map((s: string) => s.toLowerCase()).includes(speciesFilter.toLowerCase())) return false;
      }
      if (serviceFilter !== 'All') {
        const services = p.provider_details?.services || [];
        if (!services.map((s: string) => s.toLowerCase()).includes(serviceFilter.toLowerCase())) return false;
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
  }, [providers, countryFilter, speciesFilter, serviceFilter, search]);

  function openModal(provider: Provider) {
    setSelectedProvider(provider);
    setModalOpen(true);
    setSubmitSuccess(false);
    setSubmitError('');
    setFormData({ subject: '', description: '', preferred_date: '', notes: '' });
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
          request_type: 'consultation',
          subject: formData.subject,
          description: formData.description,
          preferred_date: formData.preferred_date || null,
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

  function renderStars(rating: number | null) {
    const r = rating ?? 0;
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            className={`w-4 h-4 ${s <= r ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
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
                <Stethoscope className="w-6 h-6 text-[#5DB347]" />
              </div>
              <h1 className="text-2xl md:text-4xl font-bold">Veterinary Services</h1>
            </div>
            <p className="text-white/70 max-w-2xl">
              Find trusted veterinary professionals across Africa. Filter by country, species, and service type.
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
            {/* Search */}
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

            {/* Country */}
            <select
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="w-full py-2.5 px-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none bg-white"
            >
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>{c === 'All' ? 'All Countries' : c}</option>
              ))}
            </select>

            {/* Species */}
            <select
              value={speciesFilter}
              onChange={(e) => setSpeciesFilter(e.target.value)}
              className="w-full py-2.5 px-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none bg-white"
            >
              {SPECIES.map((s) => (
                <option key={s} value={s}>{s === 'All' ? 'All Species' : s}</option>
              ))}
            </select>

            {/* Service type */}
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="w-full py-2.5 px-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none bg-white"
            >
              {SERVICE_TYPES.map((s) => (
                <option key={s} value={s}>{s === 'All' ? 'All Service Types' : s}</option>
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
            <Stethoscope className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No veterinary providers found</h3>
            <p className="text-gray-500 text-sm">Try adjusting your filters or check back later.</p>
          </motion.div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">{filtered.length} provider{filtered.length !== 1 ? 's' : ''} found</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden"
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#5DB347] to-emerald-600 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {p.photo_url ? (
                          <Image src={p.photo_url} alt={p.full_name} className="w-full h-full object-cover" width={56} height={56} unoptimized />
                        ) : (
                          <span className="text-white font-bold text-lg">
                            {p.full_name?.charAt(0) || 'V'}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-[#1B2A4A] truncate">{p.full_name}</h3>
                        <p className="text-sm text-gray-500 truncate">{p.business_name}</p>
                        <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{p.country}{p.region ? `, ${p.region}` : ''}</span>
                        </div>
                      </div>
                    </div>

                    {/* Species tags */}
                    {p.provider_details?.species && p.provider_details.species.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {(p.provider_details.species as string[]).slice(0, 4).map((s) => (
                          <span key={s} className="px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded-full font-medium">
                            {s}
                          </span>
                        ))}
                        {p.provider_details.species.length > 4 && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">
                            +{p.provider_details.species.length - 4}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Services tags */}
                    {p.provider_details?.services && p.provider_details.services.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {(p.provider_details.services as string[]).slice(0, 3).map((s) => (
                          <span key={s} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full font-medium">
                            {s}
                          </span>
                        ))}
                        {p.provider_details.services.length > 3 && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">
                            +{p.provider_details.services.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Rating + Contact */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        {renderStars(p.rating)}
                        {p.review_count > 0 && (
                          <span className="text-xs text-gray-400">({p.review_count})</span>
                        )}
                      </div>
                      {user ? (
                        <button
                          onClick={() => openModal(p)}
                          className="px-4 py-1.5 bg-[#5DB347] text-white text-sm font-medium rounded-lg hover:bg-[#4ea33c] transition-colors"
                        >
                          Contact
                        </button>
                      ) : (
                        <Link
                          href="/login"
                          className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          <LogIn className="w-3.5 h-3.5" />
                          Log in to contact
                        </Link>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
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
                    <h2 className="text-lg font-bold text-[#1B2A4A]">Contact {selectedProvider.full_name}</h2>
                    <p className="text-sm text-gray-500">{selectedProvider.business_name}</p>
                  </div>
                  <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                {submitSuccess ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-[#5DB347] mx-auto mb-3" />
                    <h3 className="font-semibold text-[#1B2A4A] mb-1">Request Sent</h3>
                    <p className="text-sm text-gray-500">The provider will be notified and will respond shortly.</p>
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
                        placeholder="e.g., Vaccination consultation for cattle"
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        rows={3}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Describe what you need help with..."
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
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <MessageSquare className="w-4 h-4" />
                          Send Request
                        </>
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
