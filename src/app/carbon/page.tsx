'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Leaf, Globe, Users, TreePine, Filter, Search, ChevronDown,
  BadgeCheck, ShieldCheck, Loader2, ArrowUpDown, Heart, Droplets,
  X, CheckCircle2, DollarSign, MapPin, Award,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

// ── Types ────────────────────────────────────────────────────────────────────

interface CarbonCredit {
  id: string;
  serial_number: string;
  vintage_year: number;
  quantity: number;
  status: string;
  price_per_tonne: number;
  project_id: string;
  carbon_projects?: {
    name: string;
    registry: string;
    country: string;
    co_benefits: string[];
    methodology: string;
    description: string;
  };
}

// ── Demo data ────────────────────────────────────────────────────────────────

const demoCredits: CarbonCredit[] = [
  { id: 'c1', serial_number: 'ACR-2025-0012', vintage_year: 2025, quantity: 450, status: 'listed', price_per_tonne: 18.5, project_id: 'p1', carbon_projects: { name: 'Chobe Agroforestry Initiative', registry: 'Verra', country: 'Botswana', co_benefits: ['Biodiversity', 'Water', 'Community'], methodology: 'VM0042', description: 'Large-scale agroforestry carbon sequestration' } },
  { id: 'c2', serial_number: 'ACR-2025-0045', vintage_year: 2025, quantity: 280, status: 'listed', price_per_tonne: 22, project_id: 'p2', carbon_projects: { name: 'Makgadikgadi Soil Carbon Project', registry: 'Gold Standard', country: 'Botswana', co_benefits: ['Soil Health', 'Water Retention'], methodology: 'GS-Soil-001', description: 'Regenerative agriculture building soil organic carbon' } },
  { id: 'c3', serial_number: 'ACR-2024-0089', vintage_year: 2024, quantity: 620, status: 'listed', price_per_tonne: 15.75, project_id: 'p3', carbon_projects: { name: 'Eastern Highlands Methane Capture', registry: 'Verra', country: 'Zimbabwe', co_benefits: ['Clean Energy', 'Community', 'Health'], methodology: 'VM0017', description: 'Biogas from dairy farm methane capture' } },
  { id: 'c4', serial_number: 'ACR-2025-0102', vintage_year: 2025, quantity: 520, status: 'listed', price_per_tonne: 24.5, project_id: 'p4', carbon_projects: { name: 'Kilimanjaro Shade-Grown Coffee', registry: 'Gold Standard', country: 'Tanzania', co_benefits: ['Biodiversity', 'Livelihoods', 'Water'], methodology: 'GS-Agro-002', description: 'Shade-grown coffee agroforestry on Kilimanjaro' } },
  { id: 'c5', serial_number: 'ACR-2024-0156', vintage_year: 2024, quantity: 340, status: 'listed', price_per_tonne: 85, project_id: 'p5', carbon_projects: { name: 'Okavango Delta Biochar Programme', registry: 'Verra', country: 'Botswana', co_benefits: ['Soil Fertility', 'Waste Reduction'], methodology: 'Puro-BC-001', description: 'Agricultural waste to biochar carbon removal' } },
  { id: 'c6', serial_number: 'ACR-2025-0178', vintage_year: 2025, quantity: 310, status: 'issued', price_per_tonne: 13.5, project_id: 'p6', carbon_projects: { name: 'Tuli Block Conservation Tillage', registry: 'Gold Standard', country: 'Botswana', co_benefits: ['Soil Health', 'Erosion Prevention'], methodology: 'GS-Soil-002', description: 'No-till and minimum tillage farming' } },
];

const demoStats = {
  totalCredits: 2520,
  countries: 3,
  farmersEnrolled: 850,
  co2Offset: 4200,
};

// ── Component ────────────────────────────────────────────────────────────────

export default function CarbonMarketplacePage() {
  const supabase = createClient();
  const [credits, setCredits] = useState<CarbonCredit[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(demoStats);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [registryFilter, setRegistryFilter] = useState('');
  const [sortBy, setSortBy] = useState<'price' | 'newest' | 'quantity'>('price');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200]);

  // Purchase form
  const [purchaseCredit, setPurchaseCredit] = useState<CarbonCredit | null>(null);
  const [purchaseForm, setPurchaseForm] = useState({ buyer_name: '', buyer_email: '', buyer_company: '', quantity: 1, payment_method: 'bank_transfer' });
  const [purchasing, setPurchasing] = useState(false);
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = useCallback((type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }, []);

  useEffect(() => {
    const fetchCredits = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('carbon_credits')
          .select('*, carbon_projects(name, registry, country, co_benefits, methodology, description)')
          .in('status', ['issued', 'listed'])
          .order('created_at', { ascending: false });

        if (!error && data?.length) {
          setCredits(data);
          const countries = new Set(data.map(c => c.carbon_projects?.country).filter(Boolean));
          setStats({
            totalCredits: data.reduce((s, c) => s + (c.quantity || 0), 0),
            countries: countries.size || 3,
            farmersEnrolled: 850,
            co2Offset: data.reduce((s, c) => s + (c.quantity || 0), 0),
          });
        } else {
          setCredits(demoCredits);
        }
      } catch {
        setCredits(demoCredits);
      }
      setLoading(false);
    };
    fetchCredits();
  }, [supabase]);

  // Filter and sort credits
  const filteredCredits = credits
    .filter(c => {
      if (searchQuery && !c.carbon_projects?.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (countryFilter && c.carbon_projects?.country !== countryFilter) return false;
      if (registryFilter && c.carbon_projects?.registry !== registryFilter) return false;
      if (c.price_per_tonne < priceRange[0] || c.price_per_tonne > priceRange[1]) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'price') return a.price_per_tonne - b.price_per_tonne;
      if (sortBy === 'quantity') return b.quantity - a.quantity;
      return b.vintage_year - a.vintage_year;
    });

  const countries = [...new Set(credits.map(c => c.carbon_projects?.country).filter(Boolean))];

  // Purchase handler
  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!purchaseCredit) return;
    setPurchasing(true);
    try {
      const res = await fetch('/api/carbon/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credit_id: purchaseCredit.id,
          ...purchaseForm,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setConfirmation(data.message);
        setPurchaseCredit(null);
        setPurchaseForm({ buyer_name: '', buyer_email: '', buyer_company: '', quantity: 1, payment_method: 'bank_transfer' });
      } else {
        showToast('error', data.error || 'Purchase failed');
      }
    } catch {
      showToast('error', 'Network error. Please try again.');
    }
    setPurchasing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium ${toast.type === 'success' ? 'bg-[#5DB347]' : 'bg-red-500'}`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setConfirmation(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-md w-full p-8 text-center shadow-xl"
            >
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-[#5DB347]" />
              </div>
              <h3 className="text-xl font-bold text-[#1B2A4A] mb-2">Purchase Confirmed!</h3>
              <p className="text-sm text-gray-600 mb-6">{confirmation}</p>
              <button
                onClick={() => setConfirmation(null)}
                className="px-6 py-2.5 rounded-xl text-white font-medium text-sm"
                style={{ background: 'linear-gradient(135deg, #5DB347, #449933)' }}
              >
                Continue Browsing
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1B2A4A 0%, #0F1A30 60%, #1a3a2a 100%)' }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-[#5DB347] rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-green-400 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#5DB347]/20 text-[#5DB347] text-sm font-medium mb-6">
              <Leaf className="w-4 h-4" />
              AFU Carbon Credit Marketplace
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
              Offset Your Carbon Footprint with <span style={{ color: '#5DB347' }}>African Agriculture</span>
            </h1>
            <p className="text-lg text-gray-300 mb-8">
              Support smallholder farmers across Africa while achieving your sustainability goals. Every credit directly funds regenerative farming practices.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'Credits Available', value: stats.totalCredits.toLocaleString(), icon: Award, color: '#5DB347' },
              { label: 'Countries', value: stats.countries, icon: Globe, color: '#6366F1' },
              { label: 'Farmers Enrolled', value: stats.farmersEnrolled.toLocaleString(), icon: Users, color: '#F59E0B' },
              { label: 'CO\u2082 Offset (tonnes)', value: stats.co2Offset.toLocaleString(), icon: TreePine, color: '#10B981' },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${s.color}15` }}>
                  <s.icon className="w-5 h-5" style={{ color: s.color }} />
                </div>
                <div>
                  <p className="text-xl font-bold text-[#1B2A4A]">{s.value}</p>
                  <p className="text-xs text-gray-500">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search projects..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#5DB347]"
            />
          </div>
          <select
            value={countryFilter}
            onChange={e => setCountryFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#5DB347]"
          >
            <option value="">All Countries</option>
            {countries.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={registryFilter}
            onChange={e => setRegistryFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#5DB347]"
          >
            <option value="">All Certifications</option>
            <option value="Verra">Verra (VCS)</option>
            <option value="Gold Standard">Gold Standard</option>
          </select>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as typeof sortBy)}
            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#5DB347]"
          >
            <option value="price">Sort by Price</option>
            <option value="newest">Newest First</option>
            <option value="quantity">Most Available</option>
          </select>
        </div>

        {/* Credits Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#5DB347]" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCredits.map(credit => (
              <motion.div
                key={credit.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition group"
              >
                <div className="flex items-start justify-between mb-3">
                  <Link href={`/carbon/${credit.id}`} className="flex-1">
                    <h3 className="font-semibold text-[#1B2A4A] text-lg leading-tight group-hover:text-[#5DB347] transition">
                      {credit.carbon_projects?.name}
                    </h3>
                  </Link>
                  <span className={`ml-2 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                    credit.carbon_projects?.registry === 'Verra' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {credit.carbon_projects?.registry}
                  </span>
                </div>

                <p className="text-sm text-gray-500 mb-3 line-clamp-2">{credit.carbon_projects?.description}</p>

                {credit.carbon_projects?.co_benefits && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {credit.carbon_projects.co_benefits.map(b => (
                      <span key={b} className="px-2 py-0.5 bg-purple-50 text-purple-600 rounded-md text-xs">{b}</span>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{credit.carbon_projects?.country}</span>
                  <span className="flex items-center gap-1"><BadgeCheck className="w-3.5 h-3.5" />{credit.vintage_year}</span>
                  <span className="flex items-center gap-1"><TreePine className="w-3.5 h-3.5" />{credit.quantity}t available</span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div>
                    <p className="text-2xl font-bold text-[#5DB347]">${credit.price_per_tonne}</p>
                    <p className="text-xs text-gray-400">per tonne CO\u2082</p>
                  </div>
                  <button
                    onClick={() => { setPurchaseCredit(credit); setPurchaseForm(f => ({ ...f, quantity: 1 })); }}
                    className="px-5 py-2.5 rounded-xl text-white font-medium text-sm transition hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg, #5DB347, #449933)' }}
                  >
                    Buy Credits
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {filteredCredits.length === 0 && !loading && (
          <div className="text-center py-16 text-gray-400">
            <TreePine className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg">No credits match your filters</p>
            <p className="text-sm mt-1">Try adjusting your search criteria</p>
          </div>
        )}

        {/* Impact Section */}
        <div className="mt-16 rounded-2xl bg-gradient-to-br from-[#1B2A4A] to-[#0F1A30] p-8 md:p-12 text-white">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">How Carbon Credits Help African Farmers</h2>
            <p className="text-gray-300 mb-8">
              When you purchase carbon credits through AFU, you directly fund sustainable agriculture practices that improve farmer livelihoods, protect biodiversity, and build climate resilience across Africa.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: Users, title: '70% to Farmers', desc: 'Revenue goes directly to participating smallholder farmers' },
                { icon: TreePine, title: 'Verified Impact', desc: 'All credits are verified by Verra or Gold Standard registries' },
                { icon: Heart, title: 'Co-Benefits', desc: 'Projects deliver biodiversity, water, and community benefits beyond carbon' },
              ].map(item => (
                <div key={item.title} className="text-center">
                  <div className="w-12 h-12 rounded-xl bg-[#5DB347]/20 flex items-center justify-center mx-auto mb-3">
                    <item.icon className="w-6 h-6 text-[#5DB347]" />
                  </div>
                  <h4 className="font-semibold mb-1">{item.title}</h4>
                  <p className="text-sm text-gray-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Purchase Modal */}
      <AnimatePresence>
        {purchaseCredit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setPurchaseCredit(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-[#1B2A4A] text-lg">Purchase Carbon Credits</h3>
                <button onClick={() => setPurchaseCredit(null)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
              </div>
              <div className="bg-green-50 rounded-xl p-3 mb-4">
                <p className="font-medium text-[#1B2A4A]">{purchaseCredit.carbon_projects?.name}</p>
                <p className="text-sm text-gray-500">{purchaseCredit.carbon_projects?.registry} | {purchaseCredit.vintage_year} | ${purchaseCredit.price_per_tonne}/tonne</p>
              </div>
              <form onSubmit={handlePurchase} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input required type="text" value={purchaseForm.buyer_name} onChange={e => setPurchaseForm(f => ({ ...f, buyer_name: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#5DB347]" placeholder="John Smith" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input required type="email" value={purchaseForm.buyer_email} onChange={e => setPurchaseForm(f => ({ ...f, buyer_email: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#5DB347]" placeholder="john@company.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                  <input type="text" value={purchaseForm.buyer_company} onChange={e => setPurchaseForm(f => ({ ...f, buyer_company: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#5DB347]" placeholder="Company name (optional)" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity (tonnes) *</label>
                  <input required type="number" min={1} max={purchaseCredit.quantity} value={purchaseForm.quantity} onChange={e => setPurchaseForm(f => ({ ...f, quantity: parseInt(e.target.value) || 1 }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#5DB347]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                  <select value={purchaseForm.payment_method} onChange={e => setPurchaseForm(f => ({ ...f, payment_method: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#5DB347]">
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="card">Credit/Debit Card</option>
                    <option value="crypto">Cryptocurrency</option>
                  </select>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 mt-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-medium">${(purchaseForm.quantity * purchaseCredit.price_per_tonne).toFixed(2)}</span>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={purchasing}
                  className="w-full py-3 rounded-xl text-white font-medium text-sm transition hover:opacity-90 disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #5DB347, #449933)' }}
                >
                  {purchasing ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : `Purchase ${purchaseForm.quantity} Credits - $${(purchaseForm.quantity * purchaseCredit.price_per_tonne).toFixed(2)}`}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
