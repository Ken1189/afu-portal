'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Megaphone,
  Plus,
  Eye,
  MousePointerClick,
  Target,
  TrendingUp,
  Pause,
  Play,
  Pencil,
  LayoutDashboard,
  ShoppingBag,
  Sprout,
  GraduationCap,
  Calendar,
  DollarSign,
  ArrowLeft,
} from 'lucide-react';
import { advertisements } from '@/lib/data/advertisements';
import { suppliers } from '@/lib/data/suppliers';

// ── Animation variants ──────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 260,
      damping: 24,
    },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
};

// ── Supplier context ────────────────────────────────────────────────────────

const currentSupplier = suppliers.find((s) => s.id === 'SUP-001')!;
const supplierAds = advertisements.filter((a) => a.supplierId === currentSupplier.id);

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatCompact(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString();
}

function formatCurrency(value: number): string {
  return `$${value.toLocaleString()}`;
}

// ── KPI calculations ────────────────────────────────────────────────────────

const activeCampaigns = supplierAds.filter((a) => a.status === 'active').length;
const totalImpressions = supplierAds.reduce((sum, a) => sum + a.impressions, 0);
const totalClicks = supplierAds.reduce((sum, a) => sum + a.clicks, 0);
const avgCTR =
  supplierAds.length > 0
    ? (supplierAds.reduce((sum, a) => sum + a.ctr, 0) / supplierAds.length).toFixed(1)
    : '0.0';

// ── Badge colors ────────────────────────────────────────────────────────────

const typeBadgeColors: Record<string, string> = {
  banner: 'bg-blue-100 text-blue-700',
  'featured-product': 'bg-purple-100 text-purple-700',
  'sponsored-content': 'bg-amber-100 text-amber-700',
  sidebar: 'bg-gray-100 text-gray-600',
};

const typeLabels: Record<string, string> = {
  banner: 'Banner',
  'featured-product': 'Featured',
  'sponsored-content': 'Sponsored',
  sidebar: 'Sidebar',
};

const placementBadgeColors: Record<string, string> = {
  dashboard: 'bg-indigo-100 text-indigo-700',
  marketplace: 'bg-teal-100 text-teal-700',
  'farm-portal': 'bg-green-100 text-green-700',
  training: 'bg-orange-100 text-orange-700',
};

const placementLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  marketplace: 'Marketplace',
  'farm-portal': 'Farm Portal',
  training: 'Training',
};

const placementIcons: Record<string, React.ReactNode> = {
  dashboard: <LayoutDashboard className="w-3 h-3" />,
  marketplace: <ShoppingBag className="w-3 h-3" />,
  'farm-portal': <Sprout className="w-3 h-3" />,
  training: <GraduationCap className="w-3 h-3" />,
};

const statusBadgeColors: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  paused: 'bg-amber-100 text-amber-700',
  completed: 'bg-gray-100 text-gray-500',
  'pending-review': 'bg-blue-100 text-blue-700',
};

const statusLabels: Record<string, string> = {
  active: 'Active',
  paused: 'Paused',
  completed: 'Completed',
  'pending-review': 'Pending',
};

// ── Performance chart data ──────────────────────────────────────────────────

const performanceData = supplierAds
  .filter((a) => a.status === 'active' || a.status === 'completed')
  .map((a) => ({
    name: a.title.length > 20 ? a.title.substring(0, 20) + '...' : a.title,
    impressions: a.impressions,
    clicks: a.clicks,
  }));

// ── Custom tooltip ──────────────────────────────────────────────────────────

interface TooltipPayloadEntry {
  name: string;
  value: number;
  color: string;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
}) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-100 px-3 py-2 text-xs">
      <p className="font-semibold text-navy mb-1">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-gray-600">{entry.name}:</span>
          <span className="font-medium text-navy">{formatCompact(entry.value)}</span>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function AdvertisingDashboard() {
  const [campaignStatuses, setCampaignStatuses] = useState<Record<string, string>>(
    Object.fromEntries(supplierAds.map((a) => [a.id, a.status]))
  );

  const handleTogglePause = (adId: string) => {
    setCampaignStatuses((prev) => ({
      ...prev,
      [adId]: prev[adId] === 'active' ? 'paused' : prev[adId] === 'paused' ? 'active' : prev[adId],
    }));
  };

  // ── KPI cards data ────────────────────────────────────────────────────────

  const kpiCards = [
    {
      label: 'Active Campaigns',
      value: activeCampaigns.toString(),
      icon: <Megaphone className="w-5 h-5" />,
      color: 'text-[#2AA198]',
      bgColor: 'bg-[#2AA198]/10',
    },
    {
      label: 'Total Impressions',
      value: formatCompact(totalImpressions),
      icon: <Eye className="w-5 h-5" />,
      color: 'text-[#1B2A4A]',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Total Clicks',
      value: formatCompact(totalClicks),
      icon: <MousePointerClick className="w-5 h-5" />,
      color: 'text-[#D4A843]',
      bgColor: 'bg-amber-50',
    },
    {
      label: 'Avg CTR',
      value: `${avgCTR}%`,
      icon: <Target className="w-5 h-5" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* ══════════════════════════════════════════════════════════════════
          HEADER
      ═════════════════════════════════════════════════════════════════ */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/supplier"
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[#1B2A4A]">Advertising</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Manage your campaigns and track performance across the AFU portal
            </p>
          </div>
        </div>
        <Link
          href="/supplier/advertising/create"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-white text-sm font-medium transition-all hover:shadow-lg"
          style={{ background: 'linear-gradient(135deg, #D4A843 0%, #B8912E 100%)' }}
        >
          <Plus className="w-4 h-4" />
          Create Campaign
        </Link>
      </motion.div>

      {/* ══════════════════════════════════════════════════════════════════
          KPI ROW
      ═════════════════════════════════════════════════════════════════ */}
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {kpiCards.map((kpi, i) => (
          <motion.div
            key={i}
            variants={cardVariants}
            whileHover={{ y: -2, boxShadow: '0 8px 25px rgba(27,42,74,0.08)' }}
            className="bg-white rounded-xl p-5 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg ${kpi.bgColor} flex items-center justify-center ${kpi.color}`}>
                {kpi.icon}
              </div>
              <TrendingUp className="w-4 h-4 text-green-400" />
            </div>
            <p className="text-2xl font-bold text-[#1B2A4A]">{kpi.value}</p>
            <p className="text-xs text-gray-500 mt-1">{kpi.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* ══════════════════════════════════════════════════════════════════
          PERFORMANCE CHART
      ═════════════════════════════════════════════════════════════════ */}
      <motion.div
        variants={cardVariants}
        className="bg-white rounded-xl border border-gray-100 p-5"
      >
        <h3 className="font-semibold text-[#1B2A4A] text-sm mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#2AA198]" />
          Campaign Performance Overview
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={performanceData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => formatCompact(v)} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="impressions" fill="#2AA198" radius={[4, 4, 0, 0]} name="Impressions" />
              <Bar dataKey="clicks" fill="#D4A843" radius={[4, 4, 0, 0]} name="Clicks" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════════════════════════
          CAMPAIGN LIST
      ═════════════════════════════════════════════════════════════════ */}
      <motion.div variants={containerVariants} className="space-y-4">
        <h3 className="font-semibold text-[#1B2A4A] text-sm flex items-center gap-2">
          <Megaphone className="w-4 h-4 text-[#2AA198]" />
          Your Campaigns ({supplierAds.length})
        </h3>

        {supplierAds.map((ad, i) => {
          const currentStatus = campaignStatuses[ad.id] || ad.status;
          const budgetPct = Math.round((ad.spent / ad.budget) * 100);
          const canToggle = currentStatus === 'active' || currentStatus === 'paused';

          return (
            <motion.div
              key={ad.id}
              variants={cardVariants}
              whileHover={{ y: -1, boxShadow: '0 6px 20px rgba(27,42,74,0.06)' }}
              className="bg-white rounded-xl border border-gray-100 p-5 transition-shadow"
            >
              {/* Top row: title, badges, status */}
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3 mb-4">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-[#1B2A4A] text-base mb-2 truncate">
                    {ad.title}
                  </h4>
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Type badge */}
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full font-medium ${
                        typeBadgeColors[ad.type] || 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {typeLabels[ad.type] || ad.type}
                    </span>
                    {/* Placement badge */}
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full font-medium ${
                        placementBadgeColors[ad.placement] || 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {placementIcons[ad.placement]}
                      {placementLabels[ad.placement] || ad.placement}
                    </span>
                    {/* Status badge */}
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full font-medium ${
                        statusBadgeColors[currentStatus] || 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          currentStatus === 'active'
                            ? 'bg-green-500'
                            : currentStatus === 'paused'
                              ? 'bg-amber-500'
                              : currentStatus === 'completed'
                                ? 'bg-gray-400'
                                : 'bg-blue-500'
                        }`}
                      />
                      {statusLabels[currentStatus] || currentStatus}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {canToggle && (
                    <button
                      onClick={() => handleTogglePause(ad.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        currentStatus === 'active'
                          ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                          : 'bg-green-50 text-green-700 hover:bg-green-100'
                      }`}
                    >
                      {currentStatus === 'active' ? (
                        <>
                          <Pause className="w-3.5 h-3.5" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5" />
                          Resume
                        </>
                      )}
                    </button>
                  )}
                  <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors">
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </button>
                </div>
              </div>

              {/* Metrics row */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Impressions</p>
                    <p className="text-sm font-semibold text-[#1B2A4A] tabular-nums">
                      {formatCompact(ad.impressions)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MousePointerClick className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Clicks</p>
                    <p className="text-sm font-semibold text-[#1B2A4A] tabular-nums">
                      {formatCompact(ad.clicks)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">CTR</p>
                    <p className="text-sm font-semibold text-[#2AA198] tabular-nums">{ad.ctr}%</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Budget</p>
                    <p className="text-sm font-semibold text-[#1B2A4A] tabular-nums">
                      {formatCurrency(ad.budget)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Date Range</p>
                    <p className="text-xs font-medium text-[#1B2A4A]">
                      {new Date(ad.startDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}{' '}
                      -{' '}
                      {new Date(ad.endDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Budget progress */}
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${budgetPct}%` }}
                    transition={{ duration: 0.8, delay: 0.2 + i * 0.05, ease: 'easeOut' }}
                    className={`h-2.5 rounded-full ${
                      budgetPct >= 90 ? 'bg-red-400' : budgetPct >= 70 ? 'bg-[#D4A843]' : 'bg-[#2AA198]'
                    }`}
                  />
                </div>
                <span className="text-xs text-gray-500 tabular-nums whitespace-nowrap min-w-[140px] text-right">
                  {formatCurrency(ad.spent)} / {formatCurrency(ad.budget)} ({budgetPct}%)
                </span>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}
