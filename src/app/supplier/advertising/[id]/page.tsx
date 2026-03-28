'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
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
  ArrowLeft,
  Eye,
  MousePointerClick,
  Target,
  DollarSign,
  Calendar,
  Globe,
  Megaphone,
  Loader2,
  AlertCircle,
  Pencil,
  Pause,
  Play,
  Clock,
  CheckCircle2,
  XCircle,
  Image as ImageIcon,
  ExternalLink,
  TrendingUp,
} from 'lucide-react';

// ── Animation variants ──────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 260, damping: 24 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

// ── Types ───────────────────────────────────────────────────────────────────

interface AdDetail {
  id: string;
  title: string;
  description: string;
  image_url: string;
  target_url: string;
  status: string;
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  placement_type: string;
  creative_type: string;
  target_countries: string[];
  start_date: string;
  end_date: string;
  approved_at: string | null;
  approved_by: string | null;
  rejection_reason: string | null;
  created_at: string;
  package_name: string | null;
}

interface DailyStats {
  date: string;
  impressions: number;
  clicks: number;
}

interface CountryBreakdown {
  country_code: string;
  impressions: number;
  clicks: number;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatCompact(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString();
}

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

// ── Tooltip ─────────────────────────────────────────────────────────────────

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

export default function AdDetailPage() {
  const params = useParams();
  const adId = params.id as string;
  const { user } = useAuth();

  const [ad, setAd] = useState<AdDetail | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [countryBreakdown, setCountryBreakdown] = useState<CountryBreakdown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingStatus, setTogglingStatus] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  // ── Fetch ad details and stats ──────────────────────────────────────────
  useEffect(() => {
    async function fetchAdDetail() {
      try {
        const supabase = createClient();

        // Fetch ad
        const { data: adData, error: adError } = await supabase
          .from('advertisements')
          .select(`
            *,
            ad_packages(name)
          `)
          .eq('id', adId)
          .single();

        if (adError) throw adError;
        if (!adData) throw new Error('Advertisement not found');

        setAd({
          id: adData.id,
          title: adData.title || 'Untitled',
          description: adData.description || '',
          image_url: adData.image_url || '',
          target_url: adData.target_url || '',
          status: adData.status || 'draft',
          budget: Number(adData.budget) || 0,
          spent: Number(adData.spent) || 0,
          impressions: adData.impressions || 0,
          clicks: adData.clicks || 0,
          placement_type: adData.placement_type || 'banner',
          creative_type: adData.creative_type || 'image',
          target_countries: Array.isArray(adData.target_countries) ? adData.target_countries : [],
          start_date: adData.start_date || '',
          end_date: adData.end_date || '',
          approved_at: adData.approved_at || null,
          approved_by: adData.approved_by || null,
          rejection_reason: adData.rejection_reason || null,
          created_at: adData.created_at || '',
          package_name: adData.ad_packages?.name || null,
        });

        // Fetch daily impression stats (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data: impressionData } = await supabase
          .from('ad_impressions')
          .select('event_type, created_at, country_code')
          .eq('ad_id', adId)
          .gte('created_at', thirtyDaysAgo.toISOString())
          .order('created_at', { ascending: true });

        if (impressionData && impressionData.length > 0) {
          // Group by date
          const byDate: Record<string, { impressions: number; clicks: number }> = {};
          const byCountry: Record<string, { impressions: number; clicks: number }> = {};

          impressionData.forEach((imp: any) => {
            const date = new Date(imp.created_at).toISOString().split('T')[0];
            if (!byDate[date]) byDate[date] = { impressions: 0, clicks: 0 };
            if (imp.event_type === 'impression') byDate[date].impressions++;
            if (imp.event_type === 'click') byDate[date].clicks++;

            const cc = imp.country_code || 'Unknown';
            if (!byCountry[cc]) byCountry[cc] = { impressions: 0, clicks: 0 };
            if (imp.event_type === 'impression') byCountry[cc].impressions++;
            if (imp.event_type === 'click') byCountry[cc].clicks++;
          });

          setDailyStats(
            Object.entries(byDate).map(([date, stats]) => ({
              date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              impressions: stats.impressions,
              clicks: stats.clicks,
            }))
          );

          setCountryBreakdown(
            Object.entries(byCountry)
              .map(([country_code, stats]) => ({
                country_code,
                impressions: stats.impressions,
                clicks: stats.clicks,
              }))
              .sort((a, b) => b.impressions - a.impressions)
          );
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to load ad details');
      } finally {
        setLoading(false);
      }
    }

    if (adId) fetchAdDetail();
  }, [adId]);

  // ── Toggle pause/resume ─────────────────────────────────────────────────
  const handleToggleStatus = async () => {
    if (!ad) return;
    const newStatus = ad.status === 'active' ? 'paused' : 'active';
    setTogglingStatus(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('advertisements')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', ad.id);
      if (error) throw error;
      setAd((prev) => prev ? { ...prev, status: newStatus } : prev);
    } catch (err: any) {
      showToast('error', 'Failed to update: ' + (err?.message || 'Unknown error'));
    } finally {
      setTogglingStatus(false);
    }
  };

  // ── Loading ─────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-[#8CB89C] animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading ad details...</p>
        </div>
      </div>
    );
  }

  if (error || !ad) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-[#1B2A4A] mb-2">Error Loading Ad</h2>
          <p className="text-sm text-gray-500 mb-4">{error || 'Advertisement not found'}</p>
          <Link
            href="/supplier/advertising"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#8CB89C] text-white rounded-lg text-sm font-medium hover:bg-[#729E82] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Advertising
          </Link>
        </div>
      </div>
    );
  }

  const ctr = ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(1) : '0.0';
  const budgetPct = ad.budget > 0 ? Math.round((ad.spent / ad.budget) * 100) : 0;
  const canToggle = ad.status === 'active' || ad.status === 'paused';
  const canEdit = ad.status === 'pending' || ad.status === 'pending-review' || ad.status === 'paused' || ad.status === 'draft';

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* HEADER */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/supplier/advertising" className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-[#1B2A4A]">{ad.title}</h1>
              <span className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full font-medium ${statusBadgeColors[ad.status] || 'bg-gray-100'}`}>
                {statusLabels[ad.status] || ad.status}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">
              {ad.placement_type} &middot; {ad.package_name || 'Standard'} &middot; Created {new Date(ad.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canToggle && (
            <button
              onClick={handleToggleStatus}
              disabled={togglingStatus}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                ad.status === 'active'
                  ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                  : 'bg-green-50 text-green-700 hover:bg-green-100'
              }`}
            >
              {togglingStatus ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : ad.status === 'active' ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              {ad.status === 'active' ? 'Pause Ad' : 'Resume Ad'}
            </button>
          )}
          {canEdit && (
            <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
              <Pencil className="w-4 h-4" />
              Edit
            </button>
          )}
        </div>
      </motion.div>

      {/* TOAST BANNER */}
      {toast && (
        <motion.div variants={cardVariants} className={`rounded-xl p-4 flex items-center gap-3 ${
          toast.type === 'success'
            ? 'bg-emerald-50 border border-emerald-200'
            : 'bg-red-50 border border-red-200'
        }`}>
          <AlertCircle className={`w-5 h-5 flex-shrink-0 ${toast.type === 'success' ? 'text-emerald-500' : 'text-red-500'}`} />
          <p className={`text-sm ${toast.type === 'success' ? 'text-emerald-700' : 'text-red-700'}`}>{toast.text}</p>
        </motion.div>
      )}

      {/* REJECTION REASON */}
      {ad.status === 'rejected' && ad.rejection_reason && (
        <motion.div variants={cardVariants} className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-700 mb-1">Ad Rejected</p>
            <p className="text-sm text-red-600">{ad.rejection_reason}</p>
          </div>
        </motion.div>
      )}

      {/* APPROVAL INFO */}
      {ad.approved_at && (
        <motion.div variants={cardVariants} className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
          <p className="text-sm text-green-700">
            Approved on {new Date(ad.approved_at).toLocaleDateString()}
          </p>
        </motion.div>
      )}

      {/* KPI CARDS */}
      <motion.div variants={containerVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Impressions', value: formatCompact(ad.impressions), icon: <Eye className="w-5 h-5" />, color: 'text-[#1B2A4A]', bg: 'bg-blue-50' },
          { label: 'Clicks', value: formatCompact(ad.clicks), icon: <MousePointerClick className="w-5 h-5" />, color: 'text-[#D4A843]', bg: 'bg-amber-50' },
          { label: 'CTR', value: `${ctr}%`, icon: <Target className="w-5 h-5" />, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Spend', value: `$${ad.spent.toLocaleString()}`, icon: <DollarSign className="w-5 h-5" />, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((kpi, i) => (
          <motion.div
            key={i}
            variants={cardVariants}
            className="bg-white rounded-xl p-5 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg ${kpi.bg} flex items-center justify-center ${kpi.color}`}>
                {kpi.icon}
              </div>
            </div>
            <p className="text-2xl font-bold text-[#1B2A4A]">{kpi.value}</p>
            <p className="text-xs text-gray-500 mt-1">{kpi.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* BUDGET PROGRESS */}
      {ad.budget > 0 && (
        <motion.div variants={cardVariants} className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-[#1B2A4A] text-sm flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-[#8CB89C]" />
              Budget Usage
            </h3>
            <span className="text-sm font-medium text-[#1B2A4A]">{budgetPct}%</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full mb-2">
            <div
              className="h-full bg-[#8CB89C] rounded-full transition-all"
              style={{ width: `${Math.min(budgetPct, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400">
            <span>${ad.spent.toLocaleString()} spent</span>
            <span>${ad.budget.toLocaleString()} budget</span>
          </div>
        </motion.div>
      )}

      {/* DAILY PERFORMANCE CHART */}
      {dailyStats.length > 0 && (
        <motion.div variants={cardVariants} className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="font-semibold text-[#1B2A4A] text-sm mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#8CB89C]" />
            Daily Performance (Last 30 Days)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyStats} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="impressions" fill="#8CB89C" radius={[4, 4, 0, 0]} name="Impressions" />
                <Bar dataKey="clicks" fill="#D4A843" radius={[4, 4, 0, 0]} name="Clicks" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* COUNTRY BREAKDOWN */}
      {countryBreakdown.length > 0 && (
        <motion.div variants={cardVariants} className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="font-semibold text-[#1B2A4A] text-sm mb-4 flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#8CB89C]" />
            Country Breakdown
          </h3>
          <div className="space-y-3">
            {countryBreakdown.map((c) => {
              const maxImpressions = countryBreakdown[0]?.impressions || 1;
              const pct = Math.round((c.impressions / maxImpressions) * 100);
              const countryCtr = c.impressions > 0 ? ((c.clicks / c.impressions) * 100).toFixed(1) : '0.0';
              return (
                <div key={c.country_code}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-[#1B2A4A]">{c.country_code}</span>
                    <span className="text-gray-500">
                      {formatCompact(c.impressions)} impressions &middot; {countryCtr}% CTR
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full">
                    <div className="h-full bg-[#8CB89C] rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* AD PREVIEW */}
      <motion.div variants={cardVariants} className="bg-white rounded-xl border border-gray-100 p-5">
        <h3 className="font-semibold text-[#1B2A4A] text-sm mb-4 flex items-center gap-2">
          <Eye className="w-4 h-4 text-[#8CB89C]" />
          Ad Preview (How Farmers See It)
        </h3>
        <div className="rounded-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-[#8CB89C]/10 to-[#1B2A4A]/5 p-6">
            <div className="flex items-start gap-4">
              {ad.image_url ? (
                <img
                  src={ad.image_url}
                  alt={ad.title}
                  className="w-32 h-20 object-cover rounded-lg flex-shrink-0"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              ) : (
                <div className="w-32 h-20 bg-[#8CB89C]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <ImageIcon className="w-8 h-8 text-[#8CB89C]" />
                </div>
              )}
              <div className="flex-1">
                <span className="inline-block text-[9px] px-2 py-0.5 rounded-full bg-[#D4A843]/20 text-[#D4A843] font-semibold uppercase tracking-wider mb-1">
                  Sponsored
                </span>
                <h4 className="font-semibold text-[#1B2A4A]">{ad.title}</h4>
                {ad.description && (
                  <p className="text-sm text-gray-500 mt-1">{ad.description}</p>
                )}
                {ad.target_url && (
                  <a
                    href={ad.target_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-[#8CB89C] mt-2 hover:underline"
                  >
                    Learn More <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* AD DETAILS */}
      <motion.div variants={cardVariants} className="bg-white rounded-xl border border-gray-100 p-5">
        <h3 className="font-semibold text-[#1B2A4A] text-sm mb-4">Ad Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-gray-500">Placement Type</p>
            <p className="font-medium text-[#1B2A4A] capitalize">{ad.placement_type.replace('-', ' ')}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Package</p>
            <p className="font-medium text-[#1B2A4A]">{ad.package_name || 'Standard'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Target Countries</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {ad.target_countries.length > 0 ? (
                ad.target_countries.map((c) => (
                  <span key={c} className="text-[10px] px-2 py-0.5 rounded-full bg-[#8CB89C]/10 text-[#8CB89C] font-medium">
                    {c}
                  </span>
                ))
              ) : (
                <span className="text-gray-400">All countries</span>
              )}
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500">Schedule</p>
            <p className="font-medium text-[#1B2A4A]">
              {ad.start_date ? new Date(ad.start_date).toLocaleDateString() : 'Not set'}
              {' — '}
              {ad.end_date ? new Date(ad.end_date).toLocaleDateString() : 'Ongoing'}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
