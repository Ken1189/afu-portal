'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  TrendingUp,
  DollarSign,
  BarChart3,
  PieChart,
  ArrowUpRight,
  Wallet,
  Activity,
  Sparkles,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/supabase/auth-context';
import { createClient } from '@/lib/supabase/client';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Investment {
  id: string;
  name: string;
  type: 'Debt' | 'Equity' | 'Insurance';
  committed: number;
  deployed: number;
  returns: number;
  irr: number;
  status: 'Active' | 'Exited' | 'Pending';
  vintage: number;
}

/* ------------------------------------------------------------------ */
/*  Fallback Demo Data                                                 */
/* ------------------------------------------------------------------ */

const FALLBACK_INVESTMENTS: Investment[] = [
  { id: '1', name: 'Zim Blueberry Export Program', type: 'Equity', committed: 125000, deployed: 125000, returns: 16.2, irr: 16.2, status: 'Active', vintage: 2025 },
  { id: '2', name: 'Uganda Smallholder Lending Pool', type: 'Debt', committed: 500000, deployed: 420000, returns: 12.8, irr: 12.8, status: 'Active', vintage: 2026 },
  { id: '3', name: 'East Africa Crop Insurance Fund', type: 'Insurance', committed: 500000, deployed: 380000, returns: 11.2, irr: 11.2, status: 'Active', vintage: 2026 },
  { id: '4', name: 'Zimbabwe Maize Lending', type: 'Debt', committed: 500000, deployed: 500000, returns: 14.7, irr: 14.7, status: 'Active', vintage: 2025 },
  { id: '5', name: 'Kenya Trade Finance Facility', type: 'Debt', committed: 375000, deployed: 290000, returns: 12.8, irr: 12.8, status: 'Active', vintage: 2026 },
  { id: '6', name: 'Zimbabwe Input Finance', type: 'Debt', committed: 500000, deployed: 470000, returns: 13.5, irr: 13.5, status: 'Active', vintage: 2025 },
];

const FALLBACK_ALLOCATION = [
  { name: 'AFU Agricultural Debt Fund', pct: 60, amount: 1500000, color: '#1B2A4A' },
  { name: 'AFU Insurance Premium Pool', pct: 20, amount: 500000, color: '#5DB347' },
  { name: 'AFU Trade Finance Facility', pct: 15, amount: 375000, color: '#3B82F6' },
  { name: 'AFU Direct Farm Equity', pct: 5, amount: 125000, color: '#8B5CF6' },
];

const FALLBACK_QUARTERLY_RETURNS = [
  { label: 'Q1 2025', value: 2.8 },
  { label: 'Q2 2025', value: 3.4 },
  { label: 'Q3 2025', value: 3.7 },
  { label: 'Q4 2025', value: 3.2 },
  { label: 'Q1 2026', value: 3.3 },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function fmtCurrency(val: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val);
}

const statusStyle: Record<string, string> = {
  Active: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  Exited: 'bg-blue-50 text-blue-700 border border-blue-200',
  Pending: 'bg-amber-50 text-amber-700 border border-amber-200',
};

const typeStyle: Record<string, string> = {
  Debt: 'bg-blue-50 text-blue-700 border border-blue-200',
  Equity: 'bg-purple-50 text-purple-700 border border-purple-200',
  Insurance: 'bg-teal-50 text-teal-700 border border-teal-200',
};

const ALLOCATION_COLORS = ['#1B2A4A', '#5DB347', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4', '#EC4899'];

/* ------------------------------------------------------------------ */
/*  Animation variants                                                 */
/* ------------------------------------------------------------------ */

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
};

/* ------------------------------------------------------------------ */
/*  Page Component                                                     */
/* ------------------------------------------------------------------ */

export default function PortfolioPage() {
  const { user } = useAuth();
  const [investments, setInvestments] = useState<Investment[]>(FALLBACK_INVESTMENTS);
  const [loading, setLoading] = useState(true);
  const [hasLiveData, setHasLiveData] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      if (!user) { setLoading(false); return; }
      try {
        // 1. Get investor profile to find investor_profile_id
        const { data: ip } = await supabase
          .from('investor_profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (ip) {
          // 2. Fetch investments for this profile
          const { data } = await supabase
            .from('investments')
            .select('*')
            .eq('investor_profile_id', ip.id)
            .order('invested_at', { ascending: false });

          if (data && data.length > 0) {
            const mapped: Investment[] = data.map((row: Record<string, unknown>, idx: number) => ({
              id: String(row.id || idx),
              name: String(row.opportunity_name || row.name || `Investment ${idx + 1}`),
              type: normalizeType(String(row.type || row.product_type || 'Debt')),
              committed: Number(row.amount || row.committed || 0),
              deployed: Number(row.deployed_amount || row.deployed || row.amount || 0),
              returns: Number(row.returns || 0),
              irr: Number(row.irr || row.returns || 0),
              status: normalizeStatus(String(row.status || 'Active')),
              vintage: new Date(String(row.invested_at || row.created_at || new Date())).getFullYear(),
            }));
            setInvestments(mapped);
            setHasLiveData(true);
          }
        } else {
          // Fallback: try investor_interests table
          const { data: interests } = await supabase
            .from('investor_interests')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
          if (interests && interests.length > 0) {
            const mapped: Investment[] = interests.map((row: Record<string, unknown>, idx: number) => ({
              id: String(row.id || idx),
              name: String(row.opportunity_name || row.name || `Investment ${idx + 1}`),
              type: normalizeType(String(row.investment_type || row.type || 'Debt')),
              committed: Number(row.amount || row.committed || 0),
              deployed: Number(row.deployed_amount || row.deployed || row.amount || 0),
              returns: Number(row.returns || row.irr || 0),
              irr: Number(row.irr || row.returns || 0),
              status: normalizeStatus(String(row.status || 'Active')),
              vintage: new Date(String(row.created_at || new Date())).getFullYear(),
            }));
            setInvestments(mapped);
            setHasLiveData(true);
          }
        }
      } catch {
        // use fallback demo data on error
      }
      setLoading(false);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // ── Compute summary stats from investments ─────────────────────────────
  const summaryStats = useMemo(() => {
    const totalInvested = investments.reduce((s, inv) => s + inv.committed, 0);
    const totalDeployed = investments.reduce((s, inv) => s + inv.deployed, 0);
    const avgReturn = investments.length > 0
      ? investments.reduce((s, inv) => s + inv.returns, 0) / investments.length
      : 0;
    const totalReturns = totalInvested > 0 ? Math.round(totalInvested * (avgReturn / 100)) : 0;
    const currentValue = totalInvested + totalReturns;
    const returnPct = totalInvested > 0 ? ((totalReturns / totalInvested) * 100).toFixed(1) : '0.0';
    const unrealised = currentValue - totalDeployed - totalReturns;

    return { totalInvested, currentValue, totalReturns, unrealised: Math.max(unrealised, 0), returnPct };
  }, [investments]);

  // ── Compute allocation from investments (grouped by type) ──────────────
  const allocationData = useMemo(() => {
    if (!hasLiveData) return FALLBACK_ALLOCATION;

    const grouped: Record<string, number> = {};
    investments.forEach((inv) => {
      const key = inv.type || 'Other';
      grouped[key] = (grouped[key] || 0) + inv.committed;
    });

    const total = Object.values(grouped).reduce((s, v) => s + v, 0);
    if (total === 0) return FALLBACK_ALLOCATION;

    return Object.entries(grouped)
      .sort((a, b) => b[1] - a[1])
      .map(([name, amount], idx) => ({
        name: `AFU ${name} Fund`,
        pct: Math.round((amount / total) * 100),
        amount,
        color: ALLOCATION_COLORS[idx % ALLOCATION_COLORS.length],
      }));
  }, [investments, hasLiveData]);

  // ── Compute quarterly returns from investments ─────────────────────────
  const quarterlyReturns = useMemo(() => {
    if (!hasLiveData) return FALLBACK_QUARTERLY_RETURNS;

    // Group investments by quarter of invested_at, compute avg return per quarter
    const quarterMap: Record<string, { totalReturn: number; count: number }> = {};

    // We need the original investment data with dates; use vintage as proxy
    // For a more accurate version we'd need invested_at from the raw data
    // Group by vintage year quarters
    investments.forEach((inv) => {
      const label = `Q1 ${inv.vintage}`;
      if (!quarterMap[label]) quarterMap[label] = { totalReturn: 0, count: 0 };
      quarterMap[label].totalReturn += inv.returns;
      quarterMap[label].count += 1;
    });

    const entries = Object.entries(quarterMap)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-5)
      .map(([label, data]) => ({
        label,
        value: Number((data.totalReturn / data.count).toFixed(1)),
      }));

    return entries.length > 0 ? entries : FALLBACK_QUARTERLY_RETURNS;
  }, [investments, hasLiveData]);

  const maxQuarterlyReturn = Math.max(...quarterlyReturns.map((q) => q.value));

  return (
    <motion.div
      className="space-y-8"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Page Header */}
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold text-[#1B2A4A]">Portfolio</h1>
        <p className="text-gray-500 text-sm mt-1">
          Comprehensive overview of your investment portfolio with AFU.
        </p>
      </motion.div>

      {/* ============================================================ */}
      {/*  EMPTY STATE CTA (when using demo data)                       */}
      {/* ============================================================ */}
      {!hasLiveData && !loading && (
        <motion.div
          variants={item}
          className="bg-gradient-to-r from-[#1B2A4A] to-[#2a3f6e] rounded-2xl p-6 text-white"
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-[#5DB347]" />
                <h3 className="font-semibold">Build Your Portfolio</h3>
              </div>
              <p className="text-sm text-gray-300">
                The data below is sample portfolio data. Express interest in opportunities to build your real portfolio with AFU.
              </p>
            </div>
            <Link
              href="/investor/opportunities"
              className="inline-flex items-center gap-2 bg-[#5DB347] hover:bg-[#4ea03c] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap"
            >
              <ArrowUpRight className="w-4 h-4" />
              View Opportunities
            </Link>
          </div>
        </motion.div>
      )}

      {/* ============================================================ */}
      {/*  PORTFOLIO SUMMARY HEADER                                     */}
      {/* ============================================================ */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Invested */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-[#1B2A4A] rounded-xl flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Invested</span>
          </div>
          <p className="text-2xl font-bold text-[#1B2A4A]">{fmtCurrency(summaryStats.totalInvested)}</p>
        </div>

        {/* Current Value */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-[#5DB347] rounded-xl flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Current Value</span>
          </div>
          <p className="text-2xl font-bold text-[#1B2A4A]">{fmtCurrency(summaryStats.currentValue)}</p>
        </div>

        {/* Total Returns */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Returns</span>
          </div>
          <p className="text-2xl font-bold text-[#1B2A4A]">{fmtCurrency(summaryStats.totalReturns)}</p>
          <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5 mt-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> {summaryStats.returnPct}%
          </span>
        </div>

        {/* Unrealised Gains */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Unrealised Gains</span>
          </div>
          <p className="text-2xl font-bold text-[#1B2A4A]">{fmtCurrency(summaryStats.unrealised)}</p>
        </div>
      </motion.div>

      {/* ============================================================ */}
      {/*  INVESTMENT ALLOCATION                                        */}
      {/* ============================================================ */}
      <motion.div variants={item} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <PieChart className="w-5 h-5 text-[#1B2A4A]" />
          <h2 className="text-lg font-bold text-[#1B2A4A]">Investment Allocation</h2>
        </div>

        {/* Segmented bar */}
        <div className="flex h-5 rounded-full overflow-hidden mb-6">
          {allocationData.map((seg) => (
            <motion.div
              key={seg.name}
              className="h-full first:rounded-l-full last:rounded-r-full"
              style={{ backgroundColor: seg.color, width: `${seg.pct}%` }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {allocationData.map((seg) => (
            <div key={seg.name} className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: seg.color }} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#1B2A4A] truncate">{seg.name}</p>
                <p className="text-xs text-gray-500">{seg.pct}% &middot; {fmtCurrency(seg.amount)}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ============================================================ */}
      {/*  ACTIVE INVESTMENTS TABLE                                     */}
      {/* ============================================================ */}
      <motion.div variants={item} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 p-6 pb-4">
          <Briefcase className="w-5 h-5 text-[#1B2A4A]" />
          <h2 className="text-lg font-bold text-[#1B2A4A]">Active Investments</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Loading investments...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-6 py-3 font-semibold text-[#1B2A4A] text-xs uppercase tracking-wide">Investment Name</th>
                  <th className="px-4 py-3 font-semibold text-[#1B2A4A] text-xs uppercase tracking-wide">Type</th>
                  <th className="px-4 py-3 font-semibold text-[#1B2A4A] text-xs uppercase tracking-wide text-right">Committed</th>
                  <th className="px-4 py-3 font-semibold text-[#1B2A4A] text-xs uppercase tracking-wide text-right">Deployed</th>
                  <th className="px-4 py-3 font-semibold text-[#1B2A4A] text-xs uppercase tracking-wide text-right">Returns</th>
                  <th className="px-4 py-3 font-semibold text-[#1B2A4A] text-xs uppercase tracking-wide text-right">IRR</th>
                  <th className="px-4 py-3 font-semibold text-[#1B2A4A] text-xs uppercase tracking-wide text-center">Status</th>
                  <th className="px-4 py-3 font-semibold text-[#1B2A4A] text-xs uppercase tracking-wide text-center">Vintage</th>
                </tr>
              </thead>
              <tbody>
                {investments.map((inv, idx) => (
                  <motion.tr
                    key={inv.id}
                    className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05, duration: 0.3 }}
                  >
                    <td className="px-6 py-4 font-medium text-[#1B2A4A] whitespace-nowrap">{inv.name}</td>
                    <td className="px-4 py-4">
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${typeStyle[inv.type] || 'bg-gray-100 text-gray-600'}`}>
                        {inv.type}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right text-gray-700 font-medium">{fmtCurrency(inv.committed)}</td>
                    <td className="px-4 py-4 text-right text-gray-700 font-medium">{fmtCurrency(inv.deployed)}</td>
                    <td className="px-4 py-4 text-right font-semibold text-emerald-600">{inv.returns}%</td>
                    <td className="px-4 py-4 text-right font-semibold text-[#1B2A4A]">{inv.irr}%</td>
                    <td className="px-4 py-4 text-center">
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${statusStyle[inv.status] || 'bg-gray-100 text-gray-600'}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center text-gray-600">{inv.vintage}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* ============================================================ */}
      {/*  PERFORMANCE CHART (div-based bar chart)                      */}
      {/* ============================================================ */}
      <motion.div variants={item} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="w-5 h-5 text-[#1B2A4A]" />
          <h2 className="text-lg font-bold text-[#1B2A4A]">Quarterly Performance</h2>
        </div>

        <div className="flex items-end gap-4 h-52">
          {quarterlyReturns.map((q, idx) => {
            const heightPct = (q.value / (maxQuarterlyReturn + 1)) * 100;
            return (
              <div key={q.label} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                {/* Value label */}
                <span className="text-xs font-bold text-[#1B2A4A]">{q.value}%</span>
                {/* Bar */}
                <motion.div
                  className="w-full rounded-t-lg"
                  style={{
                    background: 'linear-gradient(to top, #1B2A4A, #5DB347)',
                  }}
                  initial={{ height: 0 }}
                  animate={{ height: `${heightPct}%` }}
                  transition={{ delay: 0.2 + idx * 0.1, duration: 0.5, ease: 'easeOut' }}
                />
                {/* Quarter label */}
                <span className="text-[11px] text-gray-500 font-medium whitespace-nowrap">{q.label}</span>
              </div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Normalization helpers                                              */
/* ------------------------------------------------------------------ */

function normalizeType(raw: string): Investment['type'] {
  const lower = raw.toLowerCase();
  if (lower.includes('equity')) return 'Equity';
  if (lower.includes('insurance')) return 'Insurance';
  return 'Debt';
}

function normalizeStatus(raw: string): Investment['status'] {
  const lower = raw.toLowerCase();
  if (lower === 'active') return 'Active';
  if (lower === 'exited' || lower === 'completed') return 'Exited';
  if (lower === 'pending') return 'Pending';
  // Capitalize first letter as fallback
  return (raw.charAt(0).toUpperCase() + raw.slice(1)) as Investment['status'];
}
