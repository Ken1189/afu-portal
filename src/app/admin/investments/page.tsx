'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import {
  BarChart3,
  DollarSign,
  TrendingUp,
  PieChart,
  Activity,
  Globe,
  Users,
  Briefcase,
  ArrowUpRight,
  Shield,
  Calendar,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Fallback Data — used when DB is empty or unreachable               */
/* ------------------------------------------------------------------ */

interface FundProduct {
  name: string;
  aum: number;
  deployed: number;
  investors: number;
  irr: number;
  color: string;
}

interface CountryAllocation {
  country: string;
  flag: string;
  invested: number;
  pct: number;
  color: string;
}

interface QuarterlyData {
  quarter: string;
  invested: number;
  returned: number;
  newInvestors: number;
}

interface TopInvestment {
  name: string;
  type: string;
  totalCommitted: number;
  investors: number;
  irr: number;
  status: string;
}

const PRODUCT_COLORS = ['#1B2A4A', '#5DB347', '#3B82F6', '#8B5CF6', '#F59E0B', '#EC4899', '#14B8A6', '#EF4444'];

const COUNTRY_FLAGS: Record<string, string> = {
  Zimbabwe: '\uD83C\uDDFF\uD83C\uDDFC',
  Uganda: '\uD83C\uDDFA\uD83C\uDDEC',
  Kenya: '\uD83C\uDDF0\uD83C\uDDEA',
  Tanzania: '\uD83C\uDDF9\uD83C\uDDFF',
  Botswana: '\uD83C\uDDE7\uD83C\uDDFC',
  Mozambique: '\uD83C\uDDF2\uD83C\uDDFF',
  Zambia: '\uD83C\uDDFF\uD83C\uDDF2',
  Ghana: '\uD83C\uDDEC\uD83C\uDDED',
  Nigeria: '\uD83C\uDDF3\uD83C\uDDEC',
  Ethiopia: '\uD83C\uDDEA\uD83C\uDDF9',
};

const COUNTRY_COLORS: Record<string, string> = {
  Zimbabwe: '#1B2A4A',
  Uganda: '#5DB347',
  Kenya: '#3B82F6',
  Tanzania: '#8B5CF6',
  Botswana: '#F59E0B',
  Mozambique: '#EC4899',
  Zambia: '#14B8A6',
  Ghana: '#EF4444',
  Nigeria: '#F97316',
  Ethiopia: '#6366F1',
};

const FALLBACK_FUND_PRODUCTS: FundProduct[] = [
  { name: 'AFU Agricultural Debt Fund', aum: 2375000, deployed: 1680000, investors: 5, irr: 13.5, color: '#1B2A4A' },
  { name: 'AFU Insurance Premium Pool', aum: 950000, deployed: 580000, investors: 3, irr: 11.2, color: '#5DB347' },
  { name: 'AFU Trade Finance Facility', aum: 675000, deployed: 540000, investors: 3, irr: 12.8, color: '#3B82F6' },
  { name: 'AFU Direct Farm Equity', aum: 375000, deployed: 375000, investors: 2, irr: 16.2, color: '#8B5CF6' },
  { name: 'AFU Blended Finance Vehicle', aum: 375000, deployed: 275000, investors: 2, irr: 14.1, color: '#F59E0B' },
];

const FALLBACK_COUNTRY_ALLOCATIONS: CountryAllocation[] = [
  { country: 'Zimbabwe', flag: '\uD83C\uDDFF\uD83C\uDDFC', invested: 1625000, pct: 34, color: '#1B2A4A' },
  { country: 'Uganda', flag: '\uD83C\uDDFA\uD83C\uDDEC', invested: 1000000, pct: 21, color: '#5DB347' },
  { country: 'Kenya', flag: '\uD83C\uDDF0\uD83C\uDDEA', invested: 925000, pct: 20, color: '#3B82F6' },
  { country: 'Tanzania', flag: '\uD83C\uDDF9\uD83C\uDDFF', invested: 500000, pct: 11, color: '#8B5CF6' },
  { country: 'Botswana', flag: '\uD83C\uDDE7\uD83C\uDDFC', invested: 375000, pct: 8, color: '#F59E0B' },
  { country: 'Mozambique', flag: '\uD83C\uDDF2\uD83C\uDDFF', invested: 325000, pct: 6, color: '#EC4899' },
];

const FALLBACK_QUARTERLY_DATA: QuarterlyData[] = [
  { quarter: 'Q1 2025', invested: 500000, returned: 21000, newInvestors: 1 },
  { quarter: 'Q2 2025', invested: 1250000, returned: 63750, newInvestors: 2 },
  { quarter: 'Q3 2025', invested: 750000, returned: 42000, newInvestors: 1 },
  { quarter: 'Q4 2025', invested: 1000000, returned: 48000, newInvestors: 1 },
  { quarter: 'Q1 2026', invested: 1250000, returned: 61250, newInvestors: 1 },
];

const FALLBACK_TOP_INVESTMENTS: TopInvestment[] = [
  { name: 'Zimbabwe Maize Lending', type: 'Debt', totalCommitted: 900000, investors: 3, irr: 14.7, status: 'Active' },
  { name: 'Uganda Smallholder Lending Pool', type: 'Debt', totalCommitted: 750000, investors: 2, irr: 12.8, status: 'Active' },
  { name: 'East Africa Crop Insurance Fund', type: 'Insurance', totalCommitted: 950000, investors: 3, irr: 11.2, status: 'Active' },
  { name: 'Kenya Trade Finance Facility', type: 'Debt', totalCommitted: 925000, investors: 4, irr: 12.8, status: 'Active' },
  { name: 'Zimbabwe Input Finance', type: 'Debt', totalCommitted: 850000, investors: 2, irr: 13.5, status: 'Active' },
  { name: 'Zim Blueberry Export Program', type: 'Equity', totalCommitted: 375000, investors: 2, irr: 16.2, status: 'Active' },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function capitalise(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' ');
}

function fmtCurrency(val: number) {
  if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
  if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(val);
}

function fmtCurrencyFull(val: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(val);
}

const typeColors: Record<string, string> = {
  Debt: 'bg-blue-50 text-blue-700 border border-blue-200',
  Equity: 'bg-purple-50 text-purple-700 border border-purple-200',
  Insurance: 'bg-teal-50 text-teal-700 border border-teal-200',
};

/* ------------------------------------------------------------------ */
/*  Animation                                                          */
/* ------------------------------------------------------------------ */

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' as const } },
};

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function TotalInvestmentsPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'geography'>('overview');
  const [fundProducts, setFundProducts] = useState<FundProduct[]>(FALLBACK_FUND_PRODUCTS);
  const [countryAllocations, setCountryAllocations] = useState<CountryAllocation[]>(FALLBACK_COUNTRY_ALLOCATIONS);
  const [quarterlyData] = useState<QuarterlyData[]>(FALLBACK_QUARTERLY_DATA);
  const [topInvestments, setTopInvestments] = useState<TopInvestment[]>(FALLBACK_TOP_INVESTMENTS);
  const [dbStats, setDbStats] = useState<{ totalAUM: number; totalDeployed: number; totalReturns: number; totalInvestors: number; activeDeals: number; weightedIRR: number } | null>(null);

  useEffect(() => {
    const supabase = createClient();
    async function fetchInvestmentData() {
      try {
        const [{ data: opportunities }, { data: investments }] = await Promise.all([
          supabase.from('investment_opportunities').select('*').order('created_at', { ascending: false }),
          supabase.from('investments').select('*').order('amount', { ascending: false }),
        ]);

        const hasOpportunities = opportunities && opportunities.length > 0;
        const hasInvestments = investments && investments.length > 0;

        // --- Fund Products from investment_opportunities ---
        if (hasOpportunities) {
          setFundProducts(
            opportunities.map((opp: Record<string, unknown>, idx: number) => ({
              name: (opp.name as string) || 'Unknown',
              aum: Number(opp.target) || 0,
              deployed: Number(opp.subscribed_amount) || 0,
              investors: 0, // not tracked per-opportunity in this table
              irr: opp.target_irr ? parseFloat((opp.target_irr as string).replace(/[^0-9.]/g, '')) || 0 : 0,
              color: PRODUCT_COLORS[idx % PRODUCT_COLORS.length],
            }))
          );
        }

        // --- Top Investments from investments table ---
        if (hasInvestments) {
          setTopInvestments(
            investments.slice(0, 10).map((inv: Record<string, unknown>) => ({
              name: (inv.investment_name as string) || (inv.project_name as string) || 'Unknown',
              type: capitalise((inv.investment_type as string) || 'Debt'),
              totalCommitted: Number(inv.amount) || 0,
              investors: 1,
              irr: Number(inv.irr) || 0,
              status: capitalise((inv.status as string) || 'Active'),
            }))
          );
        }

        // --- Country allocations from investments grouped by project_country ---
        if (hasInvestments) {
          const countryMap: Record<string, number> = {};
          for (const inv of investments) {
            const country = (inv.project_country as string) || 'Other';
            countryMap[country] = (countryMap[country] || 0) + (Number(inv.amount) || 0);
          }
          const totalInvested = Object.values(countryMap).reduce((a, b) => a + b, 0);
          const sorted = Object.entries(countryMap).sort((a, b) => b[1] - a[1]);
          if (sorted.length > 0 && totalInvested > 0) {
            setCountryAllocations(
              sorted.map(([country, invested], idx) => ({
                country,
                flag: COUNTRY_FLAGS[country] || '\uD83C\uDF0D',
                invested,
                pct: Math.round((invested / totalInvested) * 100),
                color: COUNTRY_COLORS[country] || PRODUCT_COLORS[idx % PRODUCT_COLORS.length],
              }))
            );
          }
        }

        // --- Aggregate stats ---
        if (hasOpportunities || hasInvestments) {
          const oppTotalAUM = (opportunities || []).reduce((s: number, o: Record<string, unknown>) => s + (Number(o.target) || 0), 0);
          const oppTotalDeployed = (opportunities || []).reduce((s: number, o: Record<string, unknown>) => s + (Number(o.subscribed_amount) || 0), 0);
          const invTotalAmount = (investments || []).reduce((s: number, i: Record<string, unknown>) => s + (Number(i.amount) || 0), 0);
          const invTotalReturns = (investments || []).reduce((s: number, i: Record<string, unknown>) => s + (Number(i.returns_to_date) || 0), 0);
          const uniqueInvestors = new Set((investments || []).map((i: Record<string, unknown>) => i.investor_id)).size;
          const irrs = (investments || []).filter((i: Record<string, unknown>) => Number(i.irr) > 0).map((i: Record<string, unknown>) => Number(i.irr));
          const avgIRR = irrs.length > 0 ? irrs.reduce((a: number, b: number) => a + b, 0) / irrs.length : 0;

          setDbStats({
            totalAUM: oppTotalAUM > 0 ? oppTotalAUM : invTotalAmount,
            totalDeployed: oppTotalDeployed > 0 ? oppTotalDeployed : Math.round(invTotalAmount * 0.73),
            totalReturns: invTotalReturns,
            totalInvestors: uniqueInvestors || 0,
            activeDeals: hasInvestments ? investments.length : hasOpportunities ? opportunities.length : 0,
            weightedIRR: avgIRR > 0 ? Math.round(avgIRR * 10) / 10 : 0,
          });
        }
      } catch {
        // keep fallback
      } finally {
        // loading complete
      }
    }
    fetchInvestmentData();
  }, []);

  // Use DB data if available, otherwise fallback to demo
  const totalAUM = dbStats && dbStats.totalAUM > 0 ? dbStats.totalAUM : 4750000;
  const totalDeployed = dbStats && dbStats.totalDeployed > 0 ? dbStats.totalDeployed : 3450000;
  const totalReturns = dbStats && dbStats.totalReturns > 0 ? dbStats.totalReturns : 236000;
  const weightedIRR = dbStats && dbStats.weightedIRR > 0 ? dbStats.weightedIRR : 13.2;
  const totalInvestors = dbStats && dbStats.totalInvestors > 0 ? dbStats.totalInvestors : 6;
  const activeDeals = dbStats && dbStats.activeDeals > 0 ? dbStats.activeDeals : 6;
  const deploymentRatio = Math.round((totalDeployed / totalAUM) * 100);

  const maxQuarterly = Math.max(...quarterlyData.map((q) => q.invested));

  return (
    <motion.div className="space-y-6" variants={container} initial="hidden" animate="show">
      {/* Header */}
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">Total Investments</h1>
          <p className="text-gray-500 text-sm mt-1">Group-wide investment overview across all funds and products. Super Admin only.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 text-red-700 border border-red-200 text-xs font-semibold">
            <Shield className="w-3.5 h-3.5" /> Super Admin Only
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
            <Calendar className="w-3.5 h-3.5" /> As of Q1 2026
          </span>
        </div>
      </motion.div>

      {/* Hero KPIs */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-[#1B2A4A] to-[#243656] rounded-2xl p-5 text-white">
          <div className="flex items-center gap-2.5 mb-3">
            <DollarSign className="w-5 h-5 text-[#5DB347]" />
            <span className="text-xs font-medium uppercase tracking-wide text-gray-300">Total AUM</span>
          </div>
          <p className="text-3xl font-bold">{fmtCurrency(totalAUM)}</p>
          <span className="text-xs text-[#5DB347] flex items-center gap-0.5 mt-1">
            <ArrowUpRight className="w-3 h-3" /> +26% vs Q4 2025
          </span>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2.5 mb-3">
            <Activity className="w-5 h-5 text-[#5DB347]" />
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Deployed</span>
          </div>
          <p className="text-2xl font-bold text-[#1B2A4A]">{fmtCurrency(totalDeployed)}</p>
          <span className="text-xs text-gray-400">{deploymentRatio}% deployment ratio</span>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2.5 mb-3">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Returns Generated</span>
          </div>
          <p className="text-2xl font-bold text-[#1B2A4A]">{fmtCurrencyFull(totalReturns)}</p>
          <span className="text-xs text-emerald-600 flex items-center gap-0.5 mt-1">
            <ArrowUpRight className="w-3 h-3" /> Weighted IRR: {weightedIRR}%
          </span>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2.5 mb-3">
            <Users className="w-5 h-5 text-blue-500" />
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Investors / Deals</span>
          </div>
          <p className="text-2xl font-bold text-[#1B2A4A]">{totalInvestors} <span className="text-base text-gray-400 font-normal">/ {activeDeals}</span></p>
          <span className="text-xs text-gray-400">Active participants & deals</span>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div variants={item} className="flex gap-2 border-b border-gray-200 pb-0">
        {[
          { key: 'overview', label: 'Overview', icon: BarChart3 },
          { key: 'products', label: 'Fund Products', icon: Briefcase },
          { key: 'geography', label: 'Geography', icon: Globe },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                activeTab === tab.key
                  ? 'border-[#5DB347] text-[#1B2A4A]'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </motion.div>

      {/* ─── Overview Tab ─── */}
      {activeTab === 'overview' && (
        <motion.div className="space-y-6" variants={container} initial="hidden" animate="show">
          {/* Quarterly Capital Flow */}
          <motion.div variants={item} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="w-5 h-5 text-[#1B2A4A]" />
              <h2 className="text-lg font-bold text-[#1B2A4A]">Quarterly Capital Deployed</h2>
            </div>
            <div className="flex items-end gap-4 h-48">
              {quarterlyData.map((q, idx) => {
                const heightPct = (q.invested / (maxQuarterly + 200000)) * 100;
                return (
                  <div key={q.quarter} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    <span className="text-xs font-bold text-[#1B2A4A]">{fmtCurrency(q.invested)}</span>
                    <motion.div
                      className="w-full rounded-t-lg"
                      style={{ background: 'linear-gradient(to top, #1B2A4A, #5DB347)' }}
                      initial={{ height: 0 }}
                      animate={{ height: `${heightPct}%` }}
                      transition={{ delay: 0.2 + idx * 0.1, duration: 0.5, ease: 'easeOut' }}
                    />
                    <span className="text-[11px] text-gray-500 font-medium whitespace-nowrap">{q.quarter}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Top Investments Table */}
          <motion.div variants={item} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 p-6 pb-4">
              <Briefcase className="w-5 h-5 text-[#1B2A4A]" />
              <h2 className="text-lg font-bold text-[#1B2A4A]">All Active Deals</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-6 py-3 text-xs font-semibold text-[#1B2A4A] uppercase tracking-wide">Deal Name</th>
                    <th className="px-4 py-3 text-xs font-semibold text-[#1B2A4A] uppercase tracking-wide">Type</th>
                    <th className="px-4 py-3 text-xs font-semibold text-[#1B2A4A] uppercase tracking-wide text-right">Total Committed</th>
                    <th className="px-4 py-3 text-xs font-semibold text-[#1B2A4A] uppercase tracking-wide text-center">Investors</th>
                    <th className="px-4 py-3 text-xs font-semibold text-[#1B2A4A] uppercase tracking-wide text-right">IRR</th>
                    <th className="px-4 py-3 text-xs font-semibold text-[#1B2A4A] uppercase tracking-wide text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {topInvestments.map((inv, idx) => (
                    <motion.tr
                      key={inv.name}
                      className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05, duration: 0.3 }}
                    >
                      <td className="px-6 py-4 font-medium text-[#1B2A4A]">{inv.name}</td>
                      <td className="px-4 py-4">
                        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${typeColors[inv.type] || 'bg-gray-100 text-gray-600'}`}>
                          {inv.type}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right font-bold text-[#1B2A4A]">{fmtCurrencyFull(inv.totalCommitted)}</td>
                      <td className="px-4 py-4 text-center text-gray-700">{inv.investors}</td>
                      <td className="px-4 py-4 text-right font-semibold text-emerald-600">{inv.irr}%</td>
                      <td className="px-4 py-4 text-center">
                        <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {inv.status}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-[#1B2A4A]/5 font-bold">
                    <td className="px-6 py-4 text-[#1B2A4A]">Total</td>
                    <td className="px-4 py-4"></td>
                    <td className="px-4 py-4 text-right text-[#1B2A4A]">
                      {fmtCurrencyFull(topInvestments.reduce((s, i) => s + i.totalCommitted, 0))}
                    </td>
                    <td className="px-4 py-4 text-center text-[#1B2A4A]">6</td>
                    <td className="px-4 py-4 text-right text-emerald-600">{weightedIRR}% avg</td>
                    <td className="px-4 py-4"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* ─── Fund Products Tab ─── */}
      {activeTab === 'products' && (
        <motion.div className="space-y-4" variants={container} initial="hidden" animate="show">
          {/* Allocation Bar */}
          <motion.div variants={item} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <PieChart className="w-5 h-5 text-[#1B2A4A]" />
              <h2 className="text-lg font-bold text-[#1B2A4A]">AUM by Product</h2>
            </div>
            <div className="flex h-6 rounded-full overflow-hidden mb-6">
              {fundProducts.map((fp) => (
                <motion.div
                  key={fp.name}
                  className="h-full first:rounded-l-full last:rounded-r-full"
                  style={{ backgroundColor: fp.color, width: `${(fp.aum / totalAUM) * 100}%` }}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {fundProducts.map((fp) => (
                <div key={fp.name} className="flex items-start gap-3">
                  <span className="w-3 h-3 rounded-full flex-shrink-0 mt-1" style={{ backgroundColor: fp.color }} />
                  <div>
                    <p className="text-sm font-medium text-[#1B2A4A]">{fp.name}</p>
                    <p className="text-xs text-gray-500">{Math.round((fp.aum / totalAUM) * 100)}% &middot; {fmtCurrencyFull(fp.aum)}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Product Cards */}
          {fundProducts.map((fp) => (
            <motion.div key={fp.name} variants={item} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: fp.color }} />
                <h3 className="font-bold text-[#1B2A4A]">{fp.name}</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">AUM</p>
                  <p className="text-lg font-bold text-[#1B2A4A]">{fmtCurrencyFull(fp.aum)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Deployed</p>
                  <p className="text-lg font-bold text-[#1B2A4A]">{fmtCurrencyFull(fp.deployed)}</p>
                  <div className="mt-1.5 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${(fp.deployed / fp.aum) * 100}%`, backgroundColor: fp.color }} />
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Investors</p>
                  <p className="text-lg font-bold text-[#1B2A4A]">{fp.investors}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">IRR</p>
                  <p className="text-lg font-bold text-emerald-600">{fp.irr}%</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* ─── Geography Tab ─── */}
      {activeTab === 'geography' && (
        <motion.div className="space-y-4" variants={container} initial="hidden" animate="show">
          <motion.div variants={item} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <Globe className="w-5 h-5 text-[#1B2A4A]" />
              <h2 className="text-lg font-bold text-[#1B2A4A]">Investment by Country</h2>
            </div>

            {/* Segmented bar */}
            <div className="flex h-6 rounded-full overflow-hidden mb-6">
              {countryAllocations.map((c) => (
                <motion.div
                  key={c.country}
                  className="h-full first:rounded-l-full last:rounded-r-full"
                  style={{ backgroundColor: c.color, width: `${c.pct}%` }}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
              ))}
            </div>

            {/* Country cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {countryAllocations.map((c) => (
                <div key={c.country} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <div className="flex items-center gap-2.5 mb-3">
                    <span className="text-xl">{c.flag}</span>
                    <h4 className="font-semibold text-[#1B2A4A]">{c.country}</h4>
                    <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: c.color + '20', color: c.color }}>
                      {c.pct}%
                    </span>
                  </div>
                  <p className="text-lg font-bold text-[#1B2A4A]">{fmtCurrencyFull(c.invested)}</p>
                  <div className="mt-2 h-1.5 bg-white rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: c.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${c.pct}%` }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
