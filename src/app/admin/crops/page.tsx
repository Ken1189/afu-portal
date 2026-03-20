'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Sprout,
  Search,
  HeartPulse,
  DollarSign,
  CheckCircle2,
  Leaf,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

// ── Types ────────────────────────────────────────────────────────────────────

interface CropRecord {
  id: string;
  cropName: string;
  variety: string;
  memberName: string;
  farmName: string;
  hectares: number;
  stage: 'seedling' | 'growing' | 'harvest-ready' | 'harvested';
  healthScore: number;
  plantingDate: string;
  expectedHarvest: string;
  estimatedRevenue: number;
}

type StageFilter = 'all' | 'seedling' | 'growing' | 'harvest-ready' | 'harvested';

// ── Placeholder Data ─────────────────────────────────────────────────────────

const FALLBACK_CROPS: CropRecord[] = [
  { id: 'CR-001', cropName: 'Maize', variety: 'SC 513', memberName: 'Grace Moyo', farmName: 'Moyo Farm', hectares: 45, stage: 'growing', healthScore: 88, plantingDate: '2025-11-15', expectedHarvest: '2026-04-20', estimatedRevenue: 28500 },
  { id: 'CR-002', cropName: 'Blueberries', variety: 'Duke', memberName: 'Tendai Chirwa', farmName: 'Chirwa Orchards', hectares: 12, stage: 'harvest-ready', healthScore: 94, plantingDate: '2025-08-01', expectedHarvest: '2026-03-25', estimatedRevenue: 96000 },
  { id: 'CR-003', cropName: 'Cassava', variety: 'TMS 30572', memberName: 'Amina Salim', farmName: 'Salim Holdings', hectares: 80, stage: 'growing', healthScore: 82, plantingDate: '2025-10-05', expectedHarvest: '2026-07-10', estimatedRevenue: 44000 },
  { id: 'CR-004', cropName: 'Sesame', variety: 'S-42', memberName: 'Baraka Mushi', farmName: 'Mushi Agri', hectares: 55, stage: 'seedling', healthScore: 76, plantingDate: '2026-02-20', expectedHarvest: '2026-06-15', estimatedRevenue: 38500 },
  { id: 'CR-005', cropName: 'Coffee', variety: 'Arabica SL28', memberName: 'Farai Ndlovu', farmName: 'Ndlovu Estate', hectares: 30, stage: 'growing', healthScore: 91, plantingDate: '2025-06-10', expectedHarvest: '2026-05-01', estimatedRevenue: 72000 },
  { id: 'CR-006', cropName: 'Groundnuts', variety: 'Natal Common', memberName: 'Kago Setshedi', farmName: 'Setshedi Farms', hectares: 25, stage: 'harvest-ready', healthScore: 85, plantingDate: '2025-12-01', expectedHarvest: '2026-03-28', estimatedRevenue: 15000 },
  { id: 'CR-007', cropName: 'Sorghum', variety: 'Macia', memberName: 'John Maseko', farmName: 'Maseko Fields', hectares: 60, stage: 'harvested', healthScore: 90, plantingDate: '2025-09-15', expectedHarvest: '2026-02-10', estimatedRevenue: 32000 },
  { id: 'CR-008', cropName: 'Cotton', variety: 'SZ-9314', memberName: 'Halima Mwanga', farmName: 'Mwanga Textiles Farm', hectares: 40, stage: 'growing', healthScore: 79, plantingDate: '2025-11-20', expectedHarvest: '2026-05-15', estimatedRevenue: 24000 },
  { id: 'CR-009', cropName: 'Tobacco', variety: 'KRK 26', memberName: 'Nyasha Mutasa', farmName: 'Mutasa Growers', hectares: 35, stage: 'seedling', healthScore: 72, plantingDate: '2026-02-10', expectedHarvest: '2026-06-30', estimatedRevenue: 56000 },
  { id: 'CR-010', cropName: 'Maize', variety: 'PAN 53', memberName: 'Rumbidzai Chikore', farmName: 'Chikore Ag', hectares: 20, stage: 'harvest-ready', healthScore: 87, plantingDate: '2025-10-25', expectedHarvest: '2026-03-30', estimatedRevenue: 12600 },
  { id: 'CR-011', cropName: 'Blueberries', variety: 'Emerald', memberName: 'Tinashe Gumbo', farmName: 'Gumbo Orchards', hectares: 8, stage: 'growing', healthScore: 93, plantingDate: '2025-07-15', expectedHarvest: '2026-04-05', estimatedRevenue: 64000 },
  { id: 'CR-012', cropName: 'Cassava', variety: 'NASE 14', memberName: 'Grace Moyo', farmName: 'Moyo Farm', hectares: 30, stage: 'seedling', healthScore: 68, plantingDate: '2026-03-01', expectedHarvest: '2026-09-15', estimatedRevenue: 16500 },
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

const stageColors: Record<string, string> = {
  seedling: 'bg-blue-100 text-blue-700',
  growing: 'bg-green-100 text-green-700',
  'harvest-ready': 'bg-amber-100 text-amber-700',
  harvested: 'bg-gray-100 text-gray-600',
};

const stageLabels: Record<string, string> = {
  seedling: 'Seedling',
  growing: 'Growing',
  'harvest-ready': 'Harvest Ready',
  harvested: 'Harvested',
};

function healthColor(score: number): string {
  if (score >= 90) return 'text-green-600';
  if (score >= 80) return 'text-teal';
  if (score >= 70) return 'text-amber-600';
  return 'text-red-600';
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toLocaleString()}`;
}

// ═══════════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function CropManagementPage() {
  const { locale: _locale } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<StageFilter>('all');

  const filtered = useMemo(() => {
    let result = [...FALLBACK_CROPS];
    if (stageFilter !== 'all') result = result.filter((c) => c.stage === stageFilter);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.cropName.toLowerCase().includes(q) ||
          c.memberName.toLowerCase().includes(q) ||
          c.variety.toLowerCase().includes(q)
      );
    }
    return result;
  }, [searchQuery, stageFilter]);

  const totalCrops = FALLBACK_CROPS.length;
  const avgHealth = Math.round(FALLBACK_CROPS.reduce((s, c) => s + c.healthScore, 0) / totalCrops);
  const harvestReady = FALLBACK_CROPS.filter((c) => c.stage === 'harvest-ready').length;
  const totalRevenue = FALLBACK_CROPS.reduce((s, c) => s + c.estimatedRevenue, 0);

  const summaryCards = [
    { label: 'Total Crops', value: totalCrops.toString(), icon: <Sprout className="w-5 h-5" />, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Avg Health Score', value: `${avgHealth}%`, icon: <HeartPulse className="w-5 h-5" />, color: 'text-teal', bg: 'bg-teal/10' },
    { label: 'Harvest Ready', value: harvestReady.toString(), icon: <CheckCircle2 className="w-5 h-5" />, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Est. Revenue', value: formatCurrency(totalRevenue), icon: <DollarSign className="w-5 h-5" />, color: 'text-navy', bg: 'bg-blue-50' },
  ];

  const tabs: { key: StageFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'seedling', label: 'Seedling' },
    { key: 'growing', label: 'Growing' },
    { key: 'harvest-ready', label: 'Harvest Ready' },
    { key: 'harvested', label: 'Harvested' },
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Header */}
      <motion.div variants={cardVariants}>
        <h1 className="text-2xl font-bold text-navy">Crop Management</h1>
        <p className="text-sm text-gray-500 mt-0.5">All crops across all member farms</p>
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
              placeholder="Search by crop, variety, or member..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal/50"
            />
          </div>
          <div className="flex flex-wrap gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setStageFilter(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  stageFilter === tab.key
                    ? 'bg-teal text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-3">Showing {filtered.length} of {totalCrops} crop records</p>
      </motion.div>

      {/* Table */}
      <motion.div variants={cardVariants} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-cream/50">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Crop</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Variety</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Member / Farm</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Hectares</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Stage</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Health</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Planted</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Exp. Harvest</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((crop) => (
                <tr key={crop.id} className="hover:bg-cream/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Leaf className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                      <span className="font-medium text-navy">{crop.cropName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-500">{crop.variety}</td>
                  <td className="py-3 px-4">
                    <p className="font-medium text-navy text-sm">{crop.memberName}</p>
                    <p className="text-xs text-gray-400">{crop.farmName}</p>
                  </td>
                  <td className="py-3 px-4 text-right tabular-nums text-gray-600">{crop.hectares}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${stageColors[crop.stage]}`}>
                      {stageLabels[crop.stage]}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={`font-semibold tabular-nums ${healthColor(crop.healthScore)}`}>
                      {crop.healthScore}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-500">{crop.plantingDate}</td>
                  <td className="py-3 px-4 text-xs text-gray-500">{crop.expectedHarvest}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <Sprout className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No crops match your filters</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
