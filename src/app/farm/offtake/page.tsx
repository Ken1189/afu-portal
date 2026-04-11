'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { useContracts } from '@/lib/supabase/use-contracts';
import {
  ShieldCheck,
  TrendingUp,
  Package,
  DollarSign,
  Truck,
  Calendar,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  Globe2,
  Star,
  Search,
  Handshake,
  Send,
  Filter,
  FileText,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface OfftakeContract {
  id: string;
  buyer: string;
  crop: string;
  volume: number;
  volumeUnit: string;
  pricePerKg: number;
  currency: string;
  contractPeriod: { start: string; end: string };
  deliveredVolume: number;
  deliveredPercentage: number;
  qualityGrade: 'A' | 'B' | 'C';
  status: 'active' | 'completed' | 'pending-renewal';
  nextDeliveryDate: string;
  incoterm: string;
}

interface OffTaker {
  id: string;
  name: string;
  crops: string[];
  minVolume: number;
  priceRange: string;
  currency: string;
  incoterm: string;
  description: string;
  rating: number;
}

/* ------------------------------------------------------------------ */
/*  Adapter: DB row -> OfftakeContract                                 */
/* ------------------------------------------------------------------ */

function adaptContract(row: {
  id: string;
  buyer_name?: string;
  commodity?: string;
  quantity?: number;
  price_per_unit?: number;
  created_at?: string;
  delivery_date?: string;
  status?: string;
}): OfftakeContract {
  return {
    id: row.id,
    buyer: row.buyer_name || '',
    crop: row.commodity || '',
    volume: row.quantity || 0,
    volumeUnit: 'kg',
    pricePerKg: row.price_per_unit || 0,
    currency: 'USD',
    contractPeriod: { start: row.created_at || '', end: row.delivery_date || '' },
    deliveredVolume: 0,
    deliveredPercentage: 0,
    qualityGrade: 'A' as const,
    status: (row.status as OfftakeContract['status']) || 'active',
    nextDeliveryDate: row.delivery_date || '',
    incoterm: '',
  };
}

/* ------------------------------------------------------------------ */
/*  Fallback data                                                      */
/* ------------------------------------------------------------------ */

const FALLBACK_CONTRACTS: OfftakeContract[] = [
  { id: 'OFT-001', buyer: 'Berry Fresh UK', crop: 'Blueberries', volume: 50000, volumeUnit: 'kg', pricePerKg: 12.50, currency: 'USD', contractPeriod: { start: '2026-01-01', end: '2026-12-31' }, deliveredVolume: 12500, deliveredPercentage: 25, qualityGrade: 'A', status: 'active', nextDeliveryDate: '2026-04-25', incoterm: 'FOB Harare' },
  { id: 'OFT-002', buyer: 'EuroFruit GmbH', crop: 'Blueberries', volume: 30000, volumeUnit: 'kg', pricePerKg: 11.80, currency: 'EUR', contractPeriod: { start: '2026-02-01', end: '2026-11-30' }, deliveredVolume: 5400, deliveredPercentage: 18, qualityGrade: 'A', status: 'active', nextDeliveryDate: '2026-04-15', incoterm: 'CIF Frankfurt' },
  { id: 'OFT-003', buyer: 'Dubai Fresh Markets', crop: 'Sesame', volume: 200000, volumeUnit: 'kg', pricePerKg: 2.80, currency: 'USD', contractPeriod: { start: '2025-10-01', end: '2026-09-30' }, deliveredVolume: 110000, deliveredPercentage: 55, qualityGrade: 'B', status: 'active', nextDeliveryDate: '2026-04-20', incoterm: 'FOB Dar es Salaam' },
  { id: 'OFT-004', buyer: 'Woolworths SA', crop: 'Fresh Produce', volume: 15000, volumeUnit: 'kg', pricePerKg: 10.50, currency: 'ZAR', contractPeriod: { start: '2025-06-01', end: '2026-05-31' }, deliveredVolume: 13200, deliveredPercentage: 88, qualityGrade: 'A', status: 'active', nextDeliveryDate: '2026-04-18', incoterm: 'EXW Johannesburg' },
  { id: 'OFT-005', buyer: 'Marks & Spencer', crop: 'Premium Berries', volume: 20000, volumeUnit: 'kg', pricePerKg: 14.00, currency: 'GBP', contractPeriod: { start: '2025-01-01', end: '2025-12-31' }, deliveredVolume: 20000, deliveredPercentage: 100, qualityGrade: 'A', status: 'completed', nextDeliveryDate: '', incoterm: 'CIF London' },
  { id: 'OFT-006', buyer: 'Metro AG', crop: 'Sesame', volume: 100000, volumeUnit: 'kg', pricePerKg: 3.10, currency: 'EUR', contractPeriod: { start: '2025-04-01', end: '2026-03-31' }, deliveredVolume: 98500, deliveredPercentage: 98, qualityGrade: 'A', status: 'pending-renewal', nextDeliveryDate: '2026-04-12', incoterm: 'CIF Hamburg' },
];

const FALLBACK_OFFTAKERS: OffTaker[] = [
  { id: 'BUY-001', name: 'Berry Fresh UK', crops: ['Blueberries', 'Raspberries'], minVolume: 10000, priceRange: '$12-15/kg', currency: 'USD', incoterm: 'FOB', description: 'Premium UK berry importer with 15+ years in African sourcing', rating: 4.8 },
  { id: 'BUY-002', name: 'EuroFruit GmbH', crops: ['Stone fruit', 'Berries'], minVolume: 5000, priceRange: '\u20ac10-14/kg', currency: 'EUR', incoterm: 'CIF', description: 'Leading European fresh fruit distributor, GAP certified', rating: 4.6 },
  { id: 'BUY-003', name: 'Dubai Fresh Markets', crops: ['Sesame', 'Groundnuts'], minVolume: 50000, priceRange: '$2.50-3.50/kg', currency: 'USD', incoterm: 'FOB', description: 'Major Middle East commodity buyer, consistent orders', rating: 4.5 },
  { id: 'BUY-004', name: 'Woolworths SA', crops: ['Fresh Produce', 'Berries'], minVolume: 5000, priceRange: 'R150-200/kg', currency: 'ZAR', incoterm: 'EXW', description: 'South Africa\'s premium retailer, direct farm-to-shelf', rating: 4.7 },
  { id: 'BUY-005', name: 'Carrefour Africa', crops: ['Cassava', 'Maize'], minVolume: 100000, priceRange: '$0.15-0.25/kg', currency: 'USD', incoterm: 'DDP', description: 'Pan-African retail network, high volume staple crops', rating: 4.3 },
  { id: 'BUY-006', name: 'Metro AG', crops: ['Spices', 'Sesame'], minVolume: 20000, priceRange: '\u20ac2.80-3.50/kg', currency: 'EUR', incoterm: 'CIF', description: 'German wholesale giant, long-term partnership focus', rating: 4.4 },
  { id: 'BUY-007', name: 'Tesco Direct', crops: ['Berries', 'Avocado'], minVolume: 10000, priceRange: '\u00a312-16/kg', currency: 'GBP', incoterm: 'DDP', description: 'UK supermarket chain, growing African sourcing programme', rating: 4.5 },
  { id: 'BUY-008', name: 'Marks & Spencer', crops: ['Premium Berries'], minVolume: 5000, priceRange: '\u00a313-15/kg', currency: 'GBP', incoterm: 'CIF', description: 'Premium UK retailer, strict quality standards, premium pricing', rating: 4.9 },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

type StatusFilter = 'all' | OfftakeContract['status'];

const statusConfig: Record<string, { label: string; cls: string; icon: React.ElementType; dot: string }> = {
  active: { label: 'Active', cls: 'bg-green-50 text-green-700', icon: CheckCircle2, dot: 'bg-[#5DB347]' },
  'pending-renewal': { label: 'Pending Renewal', cls: 'bg-amber-50 text-amber-700', icon: Clock, dot: 'bg-amber-500' },
  completed: { label: 'Completed', cls: 'bg-blue-50 text-blue-700', icon: CheckCircle2, dot: 'bg-blue-500' },
};

function formatPeriod(period: { start: string; end: string }) {
  const fmt = (d: string) => {
    try {
      return new Date(d).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
    } catch {
      return d;
    }
  };
  return `${fmt(period.start)} \u2014 ${fmt(period.end)}`;
}

function formatDate(d: string) {
  try {
    return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return d;
  }
}

/* ------------------------------------------------------------------ */
/*  Animation variants                                                 */
/* ------------------------------------------------------------------ */

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4, ease: 'easeOut' as const } }),
};

const stagger = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } };

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function FarmOfftakePage() {
  const { contracts: liveContracts, loading: contractsLoading } = useContracts();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const contracts: OfftakeContract[] = liveContracts.length > 0 ? liveContracts.map((c: any) => adaptContract(c)) : FALLBACK_CONTRACTS;

  const [activeTab, setActiveTab] = useState<'contracts' | 'browse'>('contracts');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [cropSearch, setCropSearch] = useState('');

  /* ---------- Contract stats ---------- */
  const activeContracts = contracts.filter((c) => c.status === 'active');
  const totalActiveValue = activeContracts.reduce((s, c) => s + c.volume * c.pricePerKg, 0);
  const avgDelivered =
    activeContracts.length > 0
      ? activeContracts.reduce((s, c) => s + c.deliveredPercentage, 0) / activeContracts.length
      : 0;
  const nextDelivery = contracts
    .filter((c) => c.nextDeliveryDate && c.status === 'active')
    .sort((a, b) => new Date(a.nextDeliveryDate).getTime() - new Date(b.nextDeliveryDate).getTime())[0]?.nextDeliveryDate;

  const filteredContracts = statusFilter === 'all' ? contracts : contracts.filter((c) => c.status === statusFilter);

  /* ---------- Browse off-takers ---------- */
  const filteredOffTakers = useMemo(() => {
    if (!cropSearch.trim()) return FALLBACK_OFFTAKERS;
    const q = cropSearch.toLowerCase();
    return FALLBACK_OFFTAKERS.filter(
      (o) =>
        o.name.toLowerCase().includes(q) ||
        o.crops.some((crop) => crop.toLowerCase().includes(q))
    );
  }, [cropSearch]);

  const allCropTags = useMemo(() => {
    const set = new Set<string>();
    FALLBACK_OFFTAKERS.forEach((o) => o.crops.forEach((c) => set.add(c)));
    return Array.from(set).sort();
  }, []);

  /* ---------- Render ---------- */
  return (
    <div className="min-h-screen bg-[#FAF8F3]">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-[#5DB347]/10 rounded-xl flex items-center justify-center">
              <Handshake className="w-5 h-5 text-[#5DB347]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#1B2A4A]">Offtake Contracts</h1>
              <p className="text-sm text-gray-500">
                Manage your forward contracts and discover new buyers for your produce
              </p>
            </div>
          </div>
        </motion.div>

        {/* Tab Switch */}
        <div className="flex gap-2 mb-8">
          {[
            { key: 'contracts' as const, label: 'My Contracts', icon: FileText },
            { key: 'browse' as const, label: 'Browse Off-takers', icon: Search },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === tab.key
                    ? 'bg-[#5DB347] text-white shadow-md shadow-[#5DB347]/20'
                    : 'bg-white text-[#1B2A4A] border border-gray-200 hover:border-[#5DB347]/40 hover:text-[#5DB347]'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {/* ============================================================= */}
          {/*  TAB 1: MY CONTRACTS                                          */}
          {/* ============================================================= */}
          {activeTab === 'contracts' && (
            <motion.div
              key="contracts"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Stats Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                  { label: 'Total Contracts', value: String(contracts.length), icon: ShieldCheck, color: 'text-[#5DB347]', bg: 'bg-[#5DB347]/10' },
                  { label: 'Active Value', value: `$${(totalActiveValue / 1000).toFixed(0)}K`, icon: DollarSign, color: 'text-[#1B2A4A]', bg: 'bg-[#1B2A4A]/5' },
                  { label: 'Delivered', value: `${avgDelivered.toFixed(0)}%`, icon: TrendingUp, color: 'text-[#5DB347]', bg: 'bg-[#5DB347]/10' },
                  { label: 'Next Delivery', value: nextDelivery ? formatDate(nextDelivery) : 'N/A', icon: Calendar, color: 'text-amber-600', bg: 'bg-amber-50' },
                ].map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <motion.div
                      key={stat.label}
                      custom={i}
                      variants={fadeUp}
                      initial="hidden"
                      animate="visible"
                      className="bg-white rounded-xl p-5 border border-gray-100 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center`}>
                          <Icon className={`w-5 h-5 ${stat.color}`} />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">{stat.label}</p>
                          <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Status Filter */}
              <div className="flex gap-2 mb-6 flex-wrap">
                {[
                  { key: 'all' as StatusFilter, label: 'All', count: contracts.length },
                  { key: 'active' as StatusFilter, label: 'Active', count: contracts.filter((c) => c.status === 'active').length },
                  { key: 'pending-renewal' as StatusFilter, label: 'Pending Renewal', count: contracts.filter((c) => c.status === 'pending-renewal').length },
                  { key: 'completed' as StatusFilter, label: 'Completed', count: contracts.filter((c) => c.status === 'completed').length },
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setStatusFilter(f.key)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      statusFilter === f.key
                        ? 'bg-[#5DB347] text-white'
                        : 'bg-white border border-gray-200 text-gray-600 hover:border-[#5DB347]/30 hover:text-[#5DB347]'
                    }`}
                  >
                    {f.label} ({f.count})
                  </button>
                ))}
              </div>

              {/* Loading state */}
              {contractsLoading && (
                <div className="text-center py-16">
                  <div className="w-8 h-8 border-2 border-[#5DB347] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-sm text-gray-500">Loading contracts...</p>
                </div>
              )}

              {/* Contract Cards */}
              {!contractsLoading && (
                <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-4">
                  {filteredContracts.map((contract, i) => {
                    const status = statusConfig[contract.status] || statusConfig.active;
                    const StatusIcon = status.icon;
                    const isExpanded = expanded === contract.id;
                    const contractValue = contract.volume * contract.pricePerKg;

                    return (
                      <motion.div
                        key={contract.id}
                        custom={i}
                        variants={fadeUp}
                        layout
                        className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                      >
                        {/* Contract Row */}
                        <div
                          className="p-5 flex items-center gap-4 cursor-pointer"
                          onClick={() => setExpanded(isExpanded ? null : contract.id)}
                        >
                          {/* Status dot */}
                          <div className={`w-3 h-3 rounded-full shrink-0 ${status.dot}`} />

                          {/* Main Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-[#1B2A4A] text-sm truncate">{contract.buyer}</h3>
                              <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${status.cls}`}>
                                <StatusIcon className="w-3 h-3" />
                                {status.label}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500">
                              {contract.id} &middot; {contract.crop} &middot; {(contract.volume / 1000).toFixed(0)}T
                            </p>
                          </div>

                          {/* Price & Delivery Progress */}
                          <div className="hidden sm:flex items-center gap-6">
                            <div className="text-right">
                              <p className="text-sm font-bold text-[#1B2A4A]">{contract.currency} {contract.pricePerKg.toFixed(2)}/kg</p>
                              <p className="text-xs text-gray-400">Grade {contract.qualityGrade}</p>
                            </div>
                            <div className="w-24">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-gray-500">Delivered</span>
                                <span className="text-xs font-semibold text-[#1B2A4A]">{contract.deliveredPercentage}%</span>
                              </div>
                              <div className="h-1.5 bg-gray-100 rounded-full">
                                <div
                                  className="h-1.5 bg-[#5DB347] rounded-full transition-all"
                                  style={{ width: `${contract.deliveredPercentage}%` }}
                                />
                              </div>
                            </div>
                          </div>

                          <ArrowRight className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                        </div>

                        {/* Expanded Details */}
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="border-t border-gray-100 p-5 bg-[#FAF8F3]/60"
                          >
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                              {[
                                { label: 'Contract Value', value: `${contract.currency} ${contractValue.toLocaleString()}`, icon: DollarSign },
                                { label: 'Volume', value: `${(contract.deliveredVolume / 1000).toFixed(1)}T / ${(contract.volume / 1000).toFixed(1)}T`, icon: Package },
                                { label: 'Period', value: formatPeriod(contract.contractPeriod), icon: Calendar },
                                { label: 'Incoterm', value: contract.incoterm || 'N/A', icon: Truck },
                              ].map((detail) => {
                                const Icon = detail.icon;
                                return (
                                  <div key={detail.label} className="flex items-start gap-2">
                                    <Icon className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                                    <div>
                                      <p className="text-xs text-gray-500">{detail.label}</p>
                                      <p className="text-sm font-medium text-[#1B2A4A]">{detail.value}</p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                              <div className="flex items-start gap-2">
                                <Star className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                                <div>
                                  <p className="text-xs text-gray-500">Quality Grade</p>
                                  <p className="text-sm font-medium text-[#1B2A4A]">Grade {contract.qualityGrade}</p>
                                </div>
                              </div>
                              {contract.nextDeliveryDate && (
                                <div className="flex items-start gap-2">
                                  <Calendar className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                                  <div>
                                    <p className="text-xs text-gray-500">Next Delivery</p>
                                    <p className="text-sm font-medium text-[#5DB347]">{formatDate(contract.nextDeliveryDate)}</p>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Delivery Progress Bar (mobile-visible) */}
                            <div className="sm:hidden mb-4 bg-white rounded-lg p-3 border border-gray-100">
                              <div className="flex justify-between mb-1">
                                <span className="text-xs text-gray-500">Delivered</span>
                                <span className="text-xs font-semibold text-[#1B2A4A]">{contract.deliveredPercentage}%</span>
                              </div>
                              <div className="h-2 bg-gray-100 rounded-full">
                                <div className="h-2 bg-[#5DB347] rounded-full transition-all" style={{ width: `${contract.deliveredPercentage}%` }} />
                              </div>
                            </div>

                            <div className="flex gap-3 flex-wrap">
                              <button className="flex items-center gap-2 text-sm text-[#5DB347] font-medium hover:text-green-700 transition-colors px-4 py-2 rounded-lg hover:bg-[#5DB347]/5">
                                <Eye className="w-4 h-4" />
                                View Contract
                              </button>
                              <button className="flex items-center gap-2 text-sm text-[#1B2A4A] font-medium hover:text-[#5DB347] transition-colors px-4 py-2 rounded-lg hover:bg-gray-50">
                                <Truck className="w-4 h-4" />
                                Log Delivery
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}

              {!contractsLoading && filteredContracts.length === 0 && (
                <div className="text-center py-16">
                  <ShieldCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No contracts match your filter</p>
                </div>
              )}
            </motion.div>
          )}

          {/* ============================================================= */}
          {/*  TAB 2: BROWSE OFF-TAKERS                                     */}
          {/* ============================================================= */}
          {activeTab === 'browse' && (
            <motion.div
              key="browse"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Search & Filter Bar */}
              <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search by buyer name or crop type..."
                      value={cropSearch}
                      onChange={(e) => setCropSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm text-[#1B2A4A] placeholder-gray-400 focus:outline-none focus:border-[#5DB347] focus:ring-1 focus:ring-[#5DB347]/20 transition-colors"
                    />
                  </div>
                </div>
                {/* Crop tags */}
                <div className="flex gap-2 mt-3 flex-wrap">
                  <button
                    onClick={() => setCropSearch('')}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      !cropSearch ? 'bg-[#5DB347] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    All Crops
                  </button>
                  {allCropTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setCropSearch(tag)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        cropSearch === tag ? 'bg-[#5DB347] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Results count */}
              <p className="text-sm text-gray-500 mb-4">
                Showing {filteredOffTakers.length} off-taker{filteredOffTakers.length !== 1 ? 's' : ''}
              </p>

              {/* Off-taker Cards Grid */}
              <motion.div variants={stagger} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredOffTakers.map((buyer, i) => (
                  <motion.div
                    key={buyer.id}
                    custom={i}
                    variants={fadeUp}
                    className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-[#1B2A4A] text-base">{buyer.name}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{buyer.description}</p>
                      </div>
                      <div className="flex items-center gap-1 text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span className="text-xs font-semibold">{buyer.rating}</span>
                      </div>
                    </div>

                    {/* Crop tags */}
                    <div className="flex gap-1.5 flex-wrap mb-3">
                      {buyer.crops.map((crop) => (
                        <span key={crop} className="px-2 py-0.5 bg-[#5DB347]/10 text-[#5DB347] text-xs font-medium rounded-full">
                          {crop}
                        </span>
                      ))}
                    </div>

                    {/* Details grid */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div>
                        <p className="text-xs text-gray-400">Min Volume</p>
                        <p className="text-sm font-semibold text-[#1B2A4A]">{(buyer.minVolume / 1000).toFixed(0)}T</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Price Range</p>
                        <p className="text-sm font-semibold text-[#1B2A4A]">{buyer.priceRange}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Incoterm</p>
                        <p className="text-sm font-semibold text-[#1B2A4A]">{buyer.incoterm}</p>
                      </div>
                    </div>

                    {/* Action */}
                    <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#5DB347]/10 text-[#5DB347] font-semibold text-sm hover:bg-[#5DB347] hover:text-white transition-all group-hover:shadow-sm">
                      <Send className="w-4 h-4" />
                      Express Interest
                    </button>
                  </motion.div>
                ))}
              </motion.div>

              {filteredOffTakers.length === 0 && (
                <div className="text-center py-16">
                  <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No off-takers match your search</p>
                  <button
                    onClick={() => setCropSearch('')}
                    className="mt-3 text-sm text-[#5DB347] font-medium hover:underline"
                  >
                    Clear search
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
