'use client';

import { useState } from 'react';
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
/*  Demo Data                                                          */
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

const fundProducts: FundProduct[] = [
  { name: 'AFU Agricultural Debt Fund', aum: 2375000, deployed: 1680000, investors: 5, irr: 20.1, color: '#1B2A4A' },
  { name: 'AFU Insurance Premium Pool', aum: 950000, deployed: 580000, investors: 3, irr: 16.8, color: '#5DB347' },
  { name: 'AFU Trade Finance Facility', aum: 675000, deployed: 540000, investors: 3, irr: 18.5, color: '#3B82F6' },
  { name: 'AFU Direct Farm Equity', aum: 375000, deployed: 375000, investors: 2, irr: 24.5, color: '#8B5CF6' },
  { name: 'AFU Blended Finance Vehicle', aum: 375000, deployed: 275000, investors: 2, irr: 21.2, color: '#F59E0B' },
];

const countryAllocations: CountryAllocation[] = [
  { country: 'Zimbabwe', flag: '\uD83C\uDDFF\uD83C\uDDFC', invested: 1625000, pct: 34, color: '#1B2A4A' },
  { country: 'Uganda', flag: '\uD83C\uDDFA\uD83C\uDDEC', invested: 1000000, pct: 21, color: '#5DB347' },
  { country: 'Kenya', flag: '\uD83C\uDDF0\uD83C\uDDEA', invested: 925000, pct: 20, color: '#3B82F6' },
  { country: 'Tanzania', flag: '\uD83C\uDDF9\uD83C\uDDFF', invested: 500000, pct: 11, color: '#8B5CF6' },
  { country: 'Botswana', flag: '\uD83C\uDDE7\uD83C\uDDFC', invested: 375000, pct: 8, color: '#F59E0B' },
  { country: 'Mozambique', flag: '\uD83C\uDDF2\uD83C\uDDFF', invested: 325000, pct: 6, color: '#EC4899' },
];

const quarterlyData: QuarterlyData[] = [
  { quarter: 'Q1 2025', invested: 500000, returned: 21000, newInvestors: 1 },
  { quarter: 'Q2 2025', invested: 1250000, returned: 63750, newInvestors: 2 },
  { quarter: 'Q3 2025', invested: 750000, returned: 42000, newInvestors: 1 },
  { quarter: 'Q4 2025', invested: 1000000, returned: 48000, newInvestors: 1 },
  { quarter: 'Q1 2026', invested: 1250000, returned: 61250, newInvestors: 1 },
];

const topInvestments = [
  { name: 'Zimbabwe Maize Lending', type: 'Debt', totalCommitted: 900000, investors: 3, irr: 22.1, status: 'Active' },
  { name: 'Uganda Smallholder Lending Pool', type: 'Debt', totalCommitted: 750000, investors: 2, irr: 19.2, status: 'Active' },
  { name: 'East Africa Crop Insurance Fund', type: 'Insurance', totalCommitted: 950000, investors: 3, irr: 16.8, status: 'Active' },
  { name: 'Kenya Trade Finance Facility', type: 'Debt', totalCommitted: 925000, investors: 4, irr: 18.5, status: 'Active' },
  { name: 'Zimbabwe Input Finance', type: 'Debt', totalCommitted: 850000, investors: 2, irr: 20.3, status: 'Active' },
  { name: 'Zim Blueberry Export Program', type: 'Equity', totalCommitted: 375000, investors: 2, irr: 24.5, status: 'Active' },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

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

  const totalAUM = 4750000;
  const totalDeployed = 3450000;
  const totalReturns = 236000;
  const weightedIRR = 19.8;
  const totalInvestors = 6;
  const activeDeals = 6;
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
