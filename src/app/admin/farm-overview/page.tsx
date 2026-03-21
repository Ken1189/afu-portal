'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MapPin,
  Sprout,
  Tractor,
  HeartPulse,
  TrendingUp,
  Search,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

// ── Types ────────────────────────────────────────────────────────────────────

interface CropBreakdown {
  name: string;
  totalHectares: number;
  farmerCount: number;
  avgYield: number;
  yieldUnit: string;
}

interface LivestockSummary {
  type: string;
  totalCount: number;
  avgHealthScore: number;
}

interface CountryProduction {
  country: string;
  flag: string;
  tonnes: number;
}

// ── Placeholder Data ─────────────────────────────────────────────────────────

const FALLBACK_SUMMARY = {
  totalPlots: 1_284,
  totalHectares: 18_740,
  activeCrops: 24,
  totalLivestock: 42_380,
};

const FALLBACK_CROPS: CropBreakdown[] = [
  { name: 'Maize', totalHectares: 4200, farmerCount: 186, avgYield: 5.2, yieldUnit: 't/ha' },
  { name: 'Cassava', totalHectares: 3100, farmerCount: 142, avgYield: 12.8, yieldUnit: 't/ha' },
  { name: 'Blueberries', totalHectares: 980, farmerCount: 48, avgYield: 6.4, yieldUnit: 't/ha' },
  { name: 'Sesame', totalHectares: 2400, farmerCount: 95, avgYield: 0.7, yieldUnit: 't/ha' },
  { name: 'Groundnuts', totalHectares: 1800, farmerCount: 78, avgYield: 1.4, yieldUnit: 't/ha' },
  { name: 'Sorghum', totalHectares: 2100, farmerCount: 110, avgYield: 2.1, yieldUnit: 't/ha' },
  { name: 'Coffee', totalHectares: 1560, farmerCount: 64, avgYield: 1.8, yieldUnit: 't/ha' },
  { name: 'Cotton', totalHectares: 1400, farmerCount: 52, avgYield: 1.2, yieldUnit: 't/ha' },
  { name: 'Tobacco', totalHectares: 1200, farmerCount: 41, avgYield: 2.4, yieldUnit: 't/ha' },
];

const FALLBACK_LIVESTOCK: LivestockSummary[] = [
  { type: 'Cattle', totalCount: 18_400, avgHealthScore: 87 },
  { type: 'Poultry', totalCount: 12_600, avgHealthScore: 91 },
  { type: 'Goats', totalCount: 6_200, avgHealthScore: 84 },
  { type: 'Sheep', totalCount: 3_100, avgHealthScore: 86 },
  { type: 'Pigs', totalCount: 2_080, avgHealthScore: 89 },
];

const FALLBACK_COUNTRY_PRODUCTION: CountryProduction[] = [
  { country: 'Zimbabwe', flag: '\uD83C\uDDFF\uD83C\uDDFC', tonnes: 48_200 },
  { country: 'Tanzania', flag: '\uD83C\uDDF9\uD83C\uDDFF', tonnes: 36_800 },
  { country: 'Botswana', flag: '\uD83C\uDDE7\uD83C\uDDFC', tonnes: 22_400 },
  { country: 'Kenya', flag: '\uD83C\uDDF0\uD83C\uDDEA', tonnes: 18_900 },
  { country: 'Zambia', flag: '\uD83C\uDDFF\uD83C\uDDF2', tonnes: 15_300 },
  { country: 'Nigeria', flag: '\uD83C\uDDF3\uD83C\uDDEC', tonnes: 12_100 },
  { country: 'South Africa', flag: '\uD83C\uDDFF\uD83C\uDDE6', tonnes: 9_800 },
  { country: 'Mozambique', flag: '\uD83C\uDDF2\uD83C\uDDFF', tonnes: 7_200 },
  { country: 'Sierra Leone', flag: '\uD83C\uDDF8\uD83C\uDDF1', tonnes: 4_600 },
  { country: 'Uganda', flag: '\uD83C\uDDFA\uD83C\uDDEC', tonnes: 11_500 },
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

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

function healthColor(score: number): string {
  if (score >= 90) return 'text-green-600 bg-green-50';
  if (score >= 80) return 'text-teal bg-teal/10';
  if (score >= 70) return 'text-amber-600 bg-amber-50';
  return 'text-red-600 bg-red-50';
}

// ═══════════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function FarmOverviewPage() {
  const { locale: _locale } = useLanguage();
  const [cropSearch, setCropSearch] = useState('');

  const maxTonnes = Math.max(...FALLBACK_COUNTRY_PRODUCTION.map((c) => c.tonnes), 1);

  const filteredCrops = FALLBACK_CROPS.filter((c) =>
    c.name.toLowerCase().includes(cropSearch.toLowerCase())
  );

  const summaryCards = [
    { label: 'Total Farm Plots', value: formatNumber(FALLBACK_SUMMARY.totalPlots), icon: <MapPin className="w-5 h-5" />, color: 'text-teal', bg: 'bg-teal/10' },
    { label: 'Hectares Under Mgmt', value: formatNumber(FALLBACK_SUMMARY.totalHectares), icon: <Tractor className="w-5 h-5" />, color: 'text-navy', bg: 'bg-blue-50' },
    { label: 'Active Crops', value: FALLBACK_SUMMARY.activeCrops.toString(), icon: <Sprout className="w-5 h-5" />, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Total Livestock', value: formatNumber(FALLBACK_SUMMARY.totalLivestock), icon: <HeartPulse className="w-5 h-5" />, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Header */}
      <motion.div variants={cardVariants}>
        <h1 className="text-2xl font-bold text-navy">Farm Overview</h1>
        <p className="text-sm text-gray-500 mt-0.5">Aggregate view of farming operations across all members</p>
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

      {/* Crops Breakdown + Livestock Summary */}
      <motion.div variants={containerVariants} className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Crops Breakdown Table */}
        <motion.div variants={cardVariants} className="xl:col-span-2 bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="font-semibold text-navy text-sm flex items-center gap-2">
              <Sprout className="w-4 h-4 text-green-600" />
              Crops Breakdown
            </h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search crops..."
                value={cropSearch}
                onChange={(e) => setCropSearch(e.target.value)}
                className="pl-9 pr-4 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal/50 w-full sm:w-48"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-cream/50">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Crop</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Hectares</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Farmers</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Avg Yield</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredCrops.map((crop) => (
                  <tr key={crop.name} className="hover:bg-cream/50 transition-colors">
                    <td className="py-3 px-4 font-medium text-navy">{crop.name}</td>
                    <td className="py-3 px-4 text-right tabular-nums text-gray-600">{crop.totalHectares.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right tabular-nums text-gray-600">{crop.farmerCount}</td>
                    <td className="py-3 px-4 text-right tabular-nums text-gray-600">{crop.avgYield} {crop.yieldUnit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredCrops.length === 0 && (
            <div className="py-12 text-center">
              <Sprout className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No crops match your search</p>
            </div>
          )}
        </motion.div>

        {/* Livestock Summary */}
        <motion.div variants={cardVariants} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h3 className="font-semibold text-navy text-sm flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-amber-600" />
              Livestock Summary
            </h3>
          </div>
          <div className="divide-y divide-gray-50">
            {FALLBACK_LIVESTOCK.map((ls) => (
              <div key={ls.type} className="px-5 py-3 flex items-center justify-between hover:bg-cream/50 transition-colors">
                <div>
                  <p className="font-medium text-navy text-sm">{ls.type}</p>
                  <p className="text-xs text-gray-500">{ls.totalCount.toLocaleString()} head</p>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${healthColor(ls.avgHealthScore)}`}>
                  {ls.avgHealthScore}% health
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Top Producing Countries */}
      <motion.div variants={cardVariants} className="bg-white rounded-xl border border-gray-100 p-5">
        <h3 className="font-semibold text-navy text-sm mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-teal" />
          Top Producing Countries (tonnes)
        </h3>
        <div className="space-y-3">
          {FALLBACK_COUNTRY_PRODUCTION.map((c, i) => (
            <motion.div
              key={c.country}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-base">{c.flag}</span>
                  <span className="text-sm font-medium text-navy">{c.country}</span>
                </div>
                <span className="text-sm font-bold text-navy tabular-nums">{c.tonnes.toLocaleString()} t</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(c.tonnes / maxTonnes) * 100}%` }}
                  transition={{ duration: 0.8, delay: 0.2 + i * 0.08, ease: 'easeOut' }}
                  className={`h-2.5 rounded-full ${i === 0 ? 'bg-teal' : i === 1 ? 'bg-navy' : i === 2 ? 'bg-gold' : 'bg-teal/60'}`}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
