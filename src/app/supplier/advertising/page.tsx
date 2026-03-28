'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/supabase/auth-context';
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
  BarChart3,
  DollarSign,
  ArrowLeft,
  Clock,
  XCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';

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

// ── Types ───────────────────────────────────────────────────────────────────

interface Advertisement {
  id: string;
  supplierId: string;
  supplierName: string;
  type: string;
  placement: string;
  title: string;
  description: string;
  image: string;
  targetUrl: string;
  startDate: string;
  endDate: string;
  impressions: number;
  clicks: number;
  ctr: number;
  budget: number;
  spent: number;
  status: string;
  packageName: string;
  countries: string[];
  rejectionReason?: string;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatCompact(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString();
}

function formatCurrency(value: number): string {
  return `$${value.toLocaleString()}`;
}

// ── Badge helpers ───────────────────────────────────────────────────────────

const statusBadgeColors: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  paused: 'bg-amber-100 text-amber-700',
  completed: 'bg-gray-100 text-gray-500',
  pending: 'bg-blue-100 text-blue-700',
  'pending-review': 'bg-blue-100 text-blue-700',
  rejected: 'bg-red-100 text-red-700',
  expired: 'bg-gray-100 text-gray-400',
  draft: 'bg-gray-100 text-gray-500',
};

const statusLabels: Record<string, string> = {
  active: 'Active',
  paused: 'Paused',
  completed: 'Completed',
  pending: 'Pending Review',
  'pending-review': 'Pending Review',
  rejected: 'Rejected',
  expired: 'Expired',
  draft: 'Draft',
};

const statusIcons: Record<string, React.ReactNode> = {
  active: <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />,
  paused: <Pause className="w-3 h-3" />,
  pending: <Clock className="w-3 h-3" />,
  'pending-review': <Clock className="w-3 h-3" />,
  rejected: <XCircle className="w-3 h-3" />,
  expired: <AlertCircle className="w-3 h-3" />,
};

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
      <p className="font-semibold text-[#1B2A4A] mb-1">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-gray-600">{entry.name}:</span>
          <span className="font-medium text-[#1B2A4A]">{formatCompact(entry.value)}</span>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function AdvertisingDashboard() {
  const { user } = useAuth();
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // ── Fetch advertisements from Supabase ──────────────────────────────────
  useEffect(() => {
    async function fetchAds() {
      try {
        const supabase = createClient();
        const { data: supplier } = await supabase
          .from('suppliers')
          .select('id, company_name')
          .eq('email', user?.email ?? '')
          .single();

        if (supplier) {
          const { data: dbAds, error: adsError } = await supabase
            .from('advertisements')
            .select(`
              *,
              ad_packages(name, slug)
            `)
            .eq('supplier_id', supplier.id)
            .order('created_at', { ascending: false });

          if (adsError) throw adsError;

          if (dbAds && dbAds.length > 0) {
            const mapped: Advertisement[] = dbAds.map((a: any) => ({
              id: a.id,
              supplierId: a.supplier_id,
              supplierName: supplier.company_name,
              type: a.placement_type || a.creative_type || 'banner',
              placement: Array.isArray(a.placement_pages) && a.placement_pages.length > 0 ? a.placement_pages[0] : 'dashboard',
              title: a.title || 'Untitled',
              description: a.description || '',
              image: a.image_url || '',
              targetUrl: a.target_url || '',
              startDate: a.start_date || '',
              endDate: a.end_date || '',
              impressions: a.impressions || 0,
              clicks: a.clicks || 0,
              ctr: a.impressions > 0 ? Number(((a.clicks / a.impressions) * 100).toFixed(1)) : 0,
              budget: Number(a.budget) || 0,
              spent: Number(a.spent) || 0,
              status: a.status || 'draft',
              packageName: a.ad_packages?.name || 'Standard',
              countries: Array.isArray(a.target_countries) ? a.target_countries : [],
              rejectionReason: a.rejection_reason || undefined,
            }));
            setAds(mapped);
          }
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to load advertisements');
      } finally {
        setLoading(false);
      }
    }
    if (user) fetchAds();
    else setLoading(false);
  }, [user]);

  // ── Toggle pause/resume ─────────────────────────────────────────────────
  const handleTogglePause = async (adId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    setTogglingId(adId);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('advertisements')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', adId);
      if (error) throw error;
      setAds((prev) =>
        prev.map((ad) => (ad.id === adId ? { ...ad, status: newStatus } : ad))
      );
    } catch (err: any) {
      alert('Failed to update: ' + (err?.message || 'Unknown error'));
    } finally {
      setTogglingId(null);
    }
  };

  // ── Derived KPIs ────────────────────────────────────────────────────────
  const activeAds = ads.filter((a) => a.status === 'active').length;
  const totalImpressions = ads.reduce((sum, a) => sum + a.impressions, 0);
  const totalClicks = ads.reduce((sum, a) => sum + a.clicks, 0);
  const overallCTR = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(1) : '0.0';
  const totalSpend = ads.reduce((sum, a) => sum + a.spent, 0);

  const kpiCards = [
    {
      label: 'Active Ads',
      value: activeAds.toString(),
      icon: <Megaphone className="w-5 h-5" />,
      color: 'text-[#8CB89C]',
      bgColor: 'bg-[#8CB89C]/10',
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
      label: 'CTR',
      value: `${overallCTR}%`,
      icon: <Target className="w-5 h-5" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Total Spend',
      value: formatCurrency(totalSpend),
      icon: <DollarSign className="w-5 h-5" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  // ── Performance chart data ──────────────────────────────────────────────
  const performanceData = ads
    .filter((a) => a.status === 'active' || a.status === 'completed')
    .slice(0, 8)
    .map((a) => ({
      name: a.title.length > 18 ? a.title.substring(0, 18) + '...' : a.title,
      impressions: a.impressions,
      clicks: a.clicks,
    }));

  // ── Filter ads ──────────────────────────────────────────────────────────
  const filteredAds = filter === 'all' ? ads : ads.filter((a) => a.status === filter);

  const filterTabs = [
    { key: 'all', label: 'All', count: ads.length },
    { key: 'active', label: 'Active', count: ads.filter((a) => a.status === 'active').length },
    { key: 'pending', label: 'Pending', count: ads.filter((a) => a.status === 'pending' || a.status === 'pending-review').length },
    { key: 'paused', label: 'Paused', count: ads.filter((a) => a.status === 'paused').length },
    { key: 'rejected', label: 'Rejected', count: ads.filter((a) => a.status === 'rejected').length },
    { key: 'expired', label: 'Expired', count: ads.filter((a) => a.status === 'expired' || a.status === 'completed').length },
  ];

  // ── Loading state ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-[#8CB89C] animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading your advertisements...</p>
        </div>
      </div>
    );
  }

  // ── Empty state ─────────────────────────────────────────────────────────
  if (!loading && ads.length === 0 && !error) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <motion.div variants={fadeUp} className="flex items-center gap-3">
          <Link href="/supplier" className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[#1B2A4A]">Advertising</h1>
            <p className="text-sm text-gray-500 mt-0.5">Reach thousands of farmers across Africa</p>
          </div>
        </motion.div>

        <motion.div variants={cardVariants} className="flex flex-col items-center justify-center bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="w-20 h-20 rounded-2xl bg-[#8CB89C]/10 flex items-center justify-center mb-6">
            <Megaphone className="w-10 h-10 text-[#8CB89C]" />
          </div>
          <h2 className="text-xl font-bold text-[#1B2A4A] mb-2">No Advertisements Yet</h2>
          <p className="text-sm text-gray-500 mb-8 max-w-md">
            Create your first advertising campaign to reach farmers across the AFU portal.
            Choose from banners, featured products, sponsored content, and more.
          </p>
          <Link
            href="/supplier/advertising/create"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white text-sm font-medium transition-all hover:shadow-lg"
            style={{ background: 'linear-gradient(135deg, #D4A843 0%, #B8912E 100%)' }}
          >
            <Plus className="w-4 h-4" />
            Create Your First Ad
          </Link>
        </motion.div>
      </motion.div>
    );
  }

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
          Create New Ad
        </Link>
      </motion.div>

      {/* ══════════════════════════════════════════════════════════════════
          ERROR BANNER
      ═════════════════════════════════════════════════════════════════ */}
      {error && (
        <motion.div variants={cardVariants} className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </motion.div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          KPI ROW
      ═════════════════════════════════════════════════════════════════ */}
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4"
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
      {performanceData.length > 0 && (
        <motion.div
          variants={cardVariants}
          className="bg-white rounded-xl border border-gray-100 p-5"
        >
          <h3 className="font-semibold text-[#1B2A4A] text-sm mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#8CB89C]" />
            Campaign Performance Overview
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => formatCompact(v)} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="impressions" fill="#8CB89C" radius={[4, 4, 0, 0]} name="Impressions" />
                <Bar dataKey="clicks" fill="#D4A843" radius={[4, 4, 0, 0]} name="Clicks" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          FILTER TABS
      ═════════════════════════════════════════════════════════════════ */}
      <motion.div variants={cardVariants} className="flex flex-wrap gap-1">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === tab.key
                ? 'bg-[#1B2A4A] text-white'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${
                filter === tab.key ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </motion.div>

      {/* ══════════════════════════════════════════════════════════════════
          CAMPAIGN LIST
      ═════════════════════════════════════════════════════════════════ */}
      <motion.div variants={containerVariants} className="space-y-3">
        {filteredAds.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
            <p className="text-sm text-gray-500">No ads match this filter.</p>
          </div>
        )}

        {filteredAds.map((ad) => {
          const budgetPct = ad.budget > 0 ? Math.round((ad.spent / ad.budget) * 100) : 0;
          const canToggle = ad.status === 'active' || ad.status === 'paused';
          const isToggling = togglingId === ad.id;

          return (
            <motion.div
              key={ad.id}
              variants={cardVariants}
              whileHover={{ y: -1, boxShadow: '0 6px 20px rgba(27,42,74,0.06)' }}
              className="bg-white rounded-xl border border-gray-100 p-5 transition-shadow"
            >
              {/* Top row */}
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-[#1B2A4A] text-base truncate">
                      {ad.title}
                    </h4>
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full font-medium ${
                        statusBadgeColors[ad.status] || 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {statusIcons[ad.status]}
                      {statusLabels[ad.status] || ad.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">
                    {ad.packageName} &middot; {ad.type} &middot;{' '}
                    {ad.countries.length > 0 ? ad.countries.join(', ') : 'All countries'}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <div className="hidden sm:block">
                    <div className="text-xs text-gray-500">
                      <Eye className="w-3 h-3 inline mr-1" />
                      {formatCompact(ad.impressions)}
                    </div>
                    <div className="text-xs text-gray-400">
                      <MousePointerClick className="w-3 h-3 inline mr-1" />
                      {formatCompact(ad.clicks)} ({ad.ctr}%)
                    </div>
                  </div>
                  <div className="hidden sm:block text-right">
                    <div className="text-sm font-semibold text-[#1B2A4A]">{formatCurrency(ad.spent)}</div>
                    <div className="text-xs text-gray-400">of {formatCurrency(ad.budget)}</div>
                  </div>
                </div>
              </div>

              {/* Budget progress bar */}
              {ad.budget > 0 && (
                <div className="h-1.5 bg-gray-100 rounded-full mb-3">
                  <div
                    className="h-full bg-[#8CB89C] rounded-full transition-all"
                    style={{ width: `${Math.min(budgetPct, 100)}%` }}
                  />
                </div>
              )}

              {/* Rejection reason */}
              {ad.status === 'rejected' && ad.rejectionReason && (
                <div className="bg-red-50 border border-red-100 rounded-lg p-3 mb-3">
                  <p className="text-xs text-red-600">
                    <strong>Rejection reason:</strong> {ad.rejectionReason}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-2">
                {canToggle && (
                  <button
                    onClick={() => handleTogglePause(ad.id, ad.status)}
                    disabled={isToggling}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      ad.status === 'active'
                        ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                        : 'bg-green-50 text-green-700 hover:bg-green-100'
                    }`}
                  >
                    {isToggling ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : ad.status === 'active' ? (
                      <Pause className="w-3.5 h-3.5" />
                    ) : (
                      <Play className="w-3.5 h-3.5" />
                    )}
                    {ad.status === 'active' ? 'Pause' : 'Resume'}
                  </button>
                )}
                <Link
                  href={`/supplier/advertising/${ad.id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  View Stats
                </Link>
                {(ad.status === 'pending' || ad.status === 'pending-review' || ad.status === 'paused' || ad.status === 'draft') && (
                  <Link
                    href={`/supplier/advertising/${ad.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </Link>
                )}
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}
