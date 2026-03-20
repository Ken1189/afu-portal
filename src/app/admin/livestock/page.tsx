'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  HeartPulse,
  DollarSign,
  CheckCircle2,
  MapPin,
  Beef,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

// ── Types ────────────────────────────────────────────────────────────────────

interface LivestockRecord {
  id: string;
  animalType: string;
  breed: string;
  memberName: string;
  farmName: string;
  count: number;
  healthStatus: 'healthy' | 'fair' | 'poor' | 'quarantined';
  location: string;
  valueEstimate: number;
}

type TypeFilter = 'all' | 'cattle' | 'poultry' | 'goats' | 'sheep' | 'pigs';

// ── Placeholder Data ─────────────────────────────────────────────────────────

const FALLBACK_LIVESTOCK: LivestockRecord[] = [
  { id: 'LS-001', animalType: 'Cattle', breed: 'Brahman', memberName: 'Grace Moyo', farmName: 'Moyo Farm', count: 120, healthStatus: 'healthy', location: 'Zimbabwe', valueEstimate: 180000 },
  { id: 'LS-002', animalType: 'Poultry', breed: 'Rhode Island Red', memberName: 'Tendai Chirwa', farmName: 'Chirwa Orchards', count: 2500, healthStatus: 'healthy', location: 'Zimbabwe', valueEstimate: 25000 },
  { id: 'LS-003', animalType: 'Goats', breed: 'Boer', memberName: 'Amina Salim', farmName: 'Salim Holdings', count: 85, healthStatus: 'fair', location: 'Tanzania', valueEstimate: 12750 },
  { id: 'LS-004', animalType: 'Cattle', breed: 'Nguni', memberName: 'Baraka Mushi', farmName: 'Mushi Agri', count: 200, healthStatus: 'healthy', location: 'Tanzania', valueEstimate: 300000 },
  { id: 'LS-005', animalType: 'Pigs', breed: 'Large White', memberName: 'Farai Ndlovu', farmName: 'Ndlovu Estate', count: 150, healthStatus: 'healthy', location: 'Zimbabwe', valueEstimate: 45000 },
  { id: 'LS-006', animalType: 'Sheep', breed: 'Dorper', memberName: 'Kago Setshedi', farmName: 'Setshedi Farms', count: 300, healthStatus: 'healthy', location: 'Botswana', valueEstimate: 60000 },
  { id: 'LS-007', animalType: 'Poultry', breed: 'Kuroiler', memberName: 'John Maseko', farmName: 'Maseko Fields', count: 4000, healthStatus: 'fair', location: 'Zimbabwe', valueEstimate: 32000 },
  { id: 'LS-008', animalType: 'Cattle', breed: 'Tuli', memberName: 'Halima Mwanga', farmName: 'Mwanga Farm', count: 80, healthStatus: 'poor', location: 'Tanzania', valueEstimate: 96000 },
  { id: 'LS-009', animalType: 'Goats', breed: 'Kalahari Red', memberName: 'Nyasha Mutasa', farmName: 'Mutasa Growers', count: 60, healthStatus: 'healthy', location: 'Zimbabwe', valueEstimate: 10800 },
  { id: 'LS-010', animalType: 'Pigs', breed: 'Landrace', memberName: 'Rumbidzai Chikore', farmName: 'Chikore Ag', count: 90, healthStatus: 'quarantined', location: 'Zimbabwe', valueEstimate: 27000 },
  { id: 'LS-011', animalType: 'Sheep', breed: 'Merino', memberName: 'Tinashe Gumbo', farmName: 'Gumbo Orchards', count: 180, healthStatus: 'healthy', location: 'Botswana', valueEstimate: 43200 },
  { id: 'LS-012', animalType: 'Cattle', breed: 'Bonsmara', memberName: 'Grace Moyo', farmName: 'Moyo Farm', count: 50, healthStatus: 'healthy', location: 'Zimbabwe', valueEstimate: 87500 },
];

// ── Animation ────────────────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 260, damping: 24 } },
};

// ── Helpers ──────────────────────────────────────────────────────────────────

const healthColors: Record<string, string> = {
  healthy: 'bg-green-100 text-green-700',
  fair: 'bg-amber-100 text-amber-700',
  poor: 'bg-red-100 text-red-700',
  quarantined: 'bg-purple-100 text-purple-700',
};

const healthLabels: Record<string, string> = {
  healthy: 'Healthy',
  fair: 'Fair',
  poor: 'Poor',
  quarantined: 'Quarantined',
};

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toLocaleString()}`;
}

// ═══════════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function LivestockManagementPage() {
  const { locale: _locale } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');

  const filtered = useMemo(() => {
    let result = [...FALLBACK_LIVESTOCK];
    if (typeFilter !== 'all') result = result.filter((l) => l.animalType.toLowerCase() === typeFilter);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (l) =>
          l.animalType.toLowerCase().includes(q) ||
          l.breed.toLowerCase().includes(q) ||
          l.memberName.toLowerCase().includes(q)
      );
    }
    return result;
  }, [searchQuery, typeFilter]);

  const totalAnimals = FALLBACK_LIVESTOCK.reduce((s, l) => s + l.count, 0);
  const healthyCount = FALLBACK_LIVESTOCK.filter((l) => l.healthStatus === 'healthy').reduce((s, l) => s + l.count, 0);
  const healthyPct = Math.round((healthyCount / totalAnimals) * 100);
  const totalValue = FALLBACK_LIVESTOCK.reduce((s, l) => s + l.valueEstimate, 0);
  const farmsWithLivestock = new Set(FALLBACK_LIVESTOCK.map((l) => l.farmName)).size;

  const summaryCards = [
    { label: 'Total Animals', value: totalAnimals.toLocaleString(), icon: <Beef className="w-5 h-5" />, color: 'text-teal', bg: 'bg-teal/10' },
    { label: 'Healthy', value: `${healthyPct}%`, icon: <HeartPulse className="w-5 h-5" />, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Total Est. Value', value: formatCurrency(totalValue), icon: <DollarSign className="w-5 h-5" />, color: 'text-navy', bg: 'bg-blue-50' },
    { label: 'Farms w/ Livestock', value: farmsWithLivestock.toString(), icon: <CheckCircle2 className="w-5 h-5" />, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  const tabs: { key: TypeFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'cattle', label: 'Cattle' },
    { key: 'poultry', label: 'Poultry' },
    { key: 'goats', label: 'Goats' },
    { key: 'sheep', label: 'Sheep' },
    { key: 'pigs', label: 'Pigs' },
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Header */}
      <motion.div variants={cardVariants}>
        <h1 className="text-2xl font-bold text-navy">Livestock Management</h1>
        <p className="text-sm text-gray-500 mt-0.5">All livestock across member farms</p>
      </motion.div>

      {/* Summary Cards */}
      <motion.div variants={containerVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {summaryCards.map((card, i) => (
          <motion.div
            key={i}
            variants={cardVariants}
            whileHover={{ y: -2, boxShadow: '0 8px 25px rgba(27,42,74,0.08)' }}
            className="bg-white rounded-xl p-4 border border-gray-100"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center ${card.color}`}>
                {card.icon}
              </div>
              <div>
                <p className="text-2xl font-bold text-navy">{card.value}</p>
                <p className="text-xs text-gray-500">{card.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Filters */}
      <motion.div variants={cardVariants} className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by type, breed, or member..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal/50"
            />
          </div>
          <div className="flex flex-wrap gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setTypeFilter(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  typeFilter === tab.key
                    ? 'bg-teal text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-3">Showing {filtered.length} of {FALLBACK_LIVESTOCK.length} records</p>
      </motion.div>

      {/* Table */}
      <motion.div variants={cardVariants} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-cream/50">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Type</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Breed</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Member / Farm</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Count</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Health</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Location</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Value Est.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((ls) => (
                <tr key={ls.id} className="hover:bg-cream/50 transition-colors">
                  <td className="py-3 px-4 font-medium text-navy">{ls.animalType}</td>
                  <td className="py-3 px-4 text-gray-500">{ls.breed}</td>
                  <td className="py-3 px-4">
                    <p className="font-medium text-navy text-sm">{ls.memberName}</p>
                    <p className="text-xs text-gray-400">{ls.farmName}</p>
                  </td>
                  <td className="py-3 px-4 text-right tabular-nums font-medium text-navy">{ls.count.toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${healthColors[ls.healthStatus]}`}>
                      {healthLabels[ls.healthStatus]}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1 text-gray-500 text-xs">
                      <MapPin className="w-3 h-3" />
                      {ls.location}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right tabular-nums font-medium text-navy">{formatCurrency(ls.valueEstimate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <Beef className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No livestock match your filters</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
