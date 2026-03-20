'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Star,
  Users,
  Clock,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  Search,
  RefreshCw,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Info,
  CalendarClock,
  ListChecks,
} from 'lucide-react';

// ── Animation Variants ──────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 100, damping: 15 },
  },
};

// ── Types ───────────────────────────────────────────────────────
type FilterTab = 'All' | 'Excellent' | 'Good' | 'Fair' | 'Poor';
type SortKey = 'score' | 'name';
type SortDir = 'asc' | 'desc';

// ── Mock Data ───────────────────────────────────────────────────

const scoringFactors = [
  { name: 'Payment History',       weight: 30, color: 'bg-[#1B2A4A]' },
  { name: 'Loan Repayment',        weight: 25, color: 'bg-[#8CB89C]' },
  { name: 'Farm Productivity',     weight: 15, color: 'bg-blue-500' },
  { name: 'Membership Tenure',     weight: 10, color: 'bg-indigo-500' },
  { name: 'Training Completion',   weight: 10, color: 'bg-[#D4A843]' },
  { name: 'Cooperative Membership',weight: 5,  color: 'bg-amber-400' },
  { name: 'Collateral',            weight: 5,  color: 'bg-rose-400' },
];

const scoreDistribution = [
  { label: 'Excellent', range: '800–1000', count: 84,  color: 'bg-green-500',        text: 'text-green-700',  badge: 'bg-green-100 text-green-700' },
  { label: 'Good',      range: '600–799',  count: 101, color: 'bg-[#8CB89C]',         text: 'text-[#8CB89C]',  badge: 'bg-teal-100 text-teal-700' },
  { label: 'Fair',      range: '400–599',  count: 45,  color: 'bg-[#D4A843]',         text: 'text-amber-700',  badge: 'bg-amber-100 text-amber-700' },
  { label: 'Poor',      range: '0–399',    count: 17,  color: 'bg-red-500',           text: 'text-red-700',    badge: 'bg-red-100 text-red-700' },
];

const totalScored = scoreDistribution.reduce((s, d) => s + d.count, 0);

interface Member {
  rank: number;
  name: string;
  country: string;
  score: number;
  tier: FilterTab;
  trend: 'up' | 'down' | 'flat';
  paymentHistory: number;
  farmProductivity: number;
  lastUpdated: string;
}

const members: Member[] = [
  { rank: 1,  name: 'Amara Diallo',      country: 'Kenya',      score: 948, tier: 'Excellent', trend: 'up',   paymentHistory: 98, farmProductivity: 91, lastUpdated: '2026-03-18' },
  { rank: 2,  name: 'Chidi Okonkwo',     country: 'Nigeria',    score: 921, tier: 'Excellent', trend: 'up',   paymentHistory: 96, farmProductivity: 88, lastUpdated: '2026-03-18' },
  { rank: 3,  name: 'Fatima Nkosi',      country: 'Zimbabwe',   score: 887, tier: 'Excellent', trend: 'flat', paymentHistory: 94, farmProductivity: 82, lastUpdated: '2026-03-18' },
  { rank: 4,  name: 'Kwame Asante',      country: 'Ghana',      score: 854, tier: 'Excellent', trend: 'up',   paymentHistory: 92, farmProductivity: 80, lastUpdated: '2026-03-17' },
  { rank: 5,  name: 'Zanele Dlamini',    country: 'Botswana',   score: 736, tier: 'Good',      trend: 'up',   paymentHistory: 85, farmProductivity: 74, lastUpdated: '2026-03-18' },
  { rank: 6,  name: 'Tendai Moyo',       country: 'Zimbabwe',   score: 692, tier: 'Good',      trend: 'up',   paymentHistory: 88, farmProductivity: 70, lastUpdated: '2026-03-18' },
  { rank: 7,  name: 'Aisha Kamara',      country: 'Tanzania',   score: 645, tier: 'Good',      trend: 'down', paymentHistory: 80, farmProductivity: 65, lastUpdated: '2026-03-17' },
  { rank: 8,  name: 'Sipho Ndlovu',      country: 'Zimbabwe',   score: 538, tier: 'Fair',      trend: 'flat', paymentHistory: 72, farmProductivity: 58, lastUpdated: '2026-03-16' },
  { rank: 9,  name: 'Miriam Owusu',      country: 'Uganda',     score: 471, tier: 'Fair',      trend: 'down', paymentHistory: 65, farmProductivity: 51, lastUpdated: '2026-03-17' },
  { rank: 10, name: 'Babajide Adeyemi',  country: 'Nigeria',    score: 352, tier: 'Poor',      trend: 'down', paymentHistory: 42, farmProductivity: 38, lastUpdated: '2026-03-15' },
];

const recentOverrides = [
  {
    id: 1,
    member: 'Tendai Moyo',
    country: 'Zimbabwe',
    from: 450,
    to: 600,
    reason: 'Seasonal crop failure; strong repayment history prior to drought period.',
    admin: 'Admin: Grace Mutema',
    date: '2026-03-12',
  },
  {
    id: 2,
    member: 'Aisha Kamara',
    country: 'Tanzania',
    from: 580,
    to: 645,
    reason: 'Farm productivity data updated after co-op audit confirmed higher yield records.',
    admin: 'Admin: James Kariuki',
    date: '2026-03-08',
  },
];

// ── Helpers ─────────────────────────────────────────────────────

function scoreBadge(score: number) {
  if (score >= 800) return 'bg-green-100 text-green-700';
  if (score >= 600) return 'bg-teal-100 text-teal-700';
  if (score >= 400) return 'bg-amber-100 text-amber-700';
  return 'bg-red-100 text-red-700';
}

function getTier(score: number): FilterTab {
  if (score >= 800) return 'Excellent';
  if (score >= 600) return 'Good';
  if (score >= 400) return 'Fair';
  return 'Poor';
}

// ═══════════════════════════════════════════════════════════════
//  PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function CreditScoresPage() {
  const [filterTab, setFilterTab] = useState<FilterTab>('All');
  const [search, setSearch]       = useState('');
  const [sortKey, setSortKey]     = useState<SortKey>('score');
  const [sortDir, setSortDir]     = useState<SortDir>('desc');

  // ── Filtering & Sorting ──
  const filtered = members
    .filter((m) => {
      const matchTab    = filterTab === 'All' || getTier(m.score) === filterTab;
      const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) ||
                          m.country.toLowerCase().includes(search.toLowerCase());
      return matchTab && matchSearch;
    })
    .sort((a, b) => {
      const mult = sortDir === 'asc' ? 1 : -1;
      if (sortKey === 'score') return (a.score - b.score) * mult;
      return a.name.localeCompare(b.name) * mult;
    });

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('desc'); }
  }

  function sortIcon(col: SortKey) {
    if (sortKey !== col) return <Minus className="w-3 h-3 text-gray-300" />;
    return sortDir === 'desc'
      ? <ChevronDown className="w-3 h-3 text-[#8CB89C]" />
      : <ChevronUp   className="w-3 h-3 text-[#8CB89C]" />;
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* ── Header ─────────────────────────────────────────────── */}
      <motion.div variants={cardVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#1B2A4A] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Admin
          </Link>
          <span className="text-gray-300">/</span>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#1B2A4A] rounded-xl flex items-center justify-center shadow-sm">
              <Star className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#1B2A4A]">Credit Scoring</h1>
              <p className="text-gray-400 text-sm mt-0.5">Member creditworthiness model &amp; scores</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Stats Cards ─────────────────────────────────────────── */}
      <motion.div variants={cardVariants} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          {
            label: 'Average Score',
            value: '712',
            sub: 'out of 1,000',
            icon: <Star className="w-5 h-5" />,
            iconBg: 'bg-[#8CB89C]/10',
            iconColor: 'text-[#8CB89C]',
            accent: 'border-l-[#8CB89C]',
          },
          {
            label: 'Members Scored',
            value: '247',
            sub: 'of 342 total',
            icon: <Users className="w-5 h-5" />,
            iconBg: 'bg-[#1B2A4A]/10',
            iconColor: 'text-[#1B2A4A]',
            accent: 'border-l-[#1B2A4A]',
          },
          {
            label: 'Last Batch Run',
            value: 'Today, 06:00 AM',
            sub: 'Completed successfully',
            icon: <Clock className="w-5 h-5" />,
            iconBg: 'bg-[#D4A843]/10',
            iconColor: 'text-[#D4A843]',
            accent: 'border-l-[#D4A843]',
          },
          {
            label: 'Score Disputes',
            value: '2',
            sub: 'pending review',
            icon: <AlertCircle className="w-5 h-5" />,
            iconBg: 'bg-red-50',
            iconColor: 'text-red-500',
            accent: 'border-l-red-400',
          },
        ].map((card, i) => (
          <div
            key={i}
            className={`bg-white rounded-xl border border-gray-100 border-l-4 ${card.accent} p-5 flex items-center gap-4`}
          >
            <div className={`w-11 h-11 ${card.iconBg} rounded-xl flex items-center justify-center flex-shrink-0 ${card.iconColor}`}>
              {card.icon}
            </div>
            <div>
              <p className="text-xl font-bold text-[#1B2A4A]">{card.value}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{card.label}</p>
              <p className="text-[10px] text-gray-300">{card.sub}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* ── Two-Column Row: Scoring Model + Score Distribution ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── Scoring Model Explanation ───────────────────────── */}
        <motion.div variants={cardVariants} className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-[#1B2A4A] mb-1 flex items-center gap-2">
            <ListChecks className="w-4 h-4 text-[#8CB89C]" />
            Scoring Model — Factor Weights
          </h2>
          <p className="text-xs text-gray-400 mb-5">
            The AFU credit score is computed from 7 factors. Weights reflect their relative impact.
          </p>
          <div className="space-y-4">
            {scoringFactors.map((factor, i) => (
              <div key={i}>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-medium text-gray-700">{factor.name}</span>
                  <span className="font-bold text-[#1B2A4A]">{factor.weight}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <motion.div
                    className={`h-2.5 rounded-full ${factor.color}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${factor.weight * (100 / 30)}%` }}
                    transition={{ delay: i * 0.06, duration: 0.6, ease: 'easeOut' }}
                    style={{ maxWidth: '100%' }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-gray-300 mt-5">Bar widths are proportional to 30% (max weight).</p>
        </motion.div>

        {/* ── Score Distribution ──────────────────────────────── */}
        <motion.div variants={cardVariants} className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-[#1B2A4A] mb-1 flex items-center gap-2">
            <Users className="w-4 h-4 text-[#8CB89C]" />
            Score Distribution
          </h2>
          <p className="text-xs text-gray-400 mb-5">
            {totalScored} members scored across 4 tiers.
          </p>

          {/* Stacked horizontal bar */}
          <div className="w-full h-9 rounded-xl overflow-hidden flex mb-6">
            {scoreDistribution.map((seg, i) => {
              const pct = ((seg.count / totalScored) * 100).toFixed(1);
              return (
                <motion.div
                  key={i}
                  className={`${seg.color} flex items-center justify-center relative group`}
                  style={{ width: `${(seg.count / totalScored) * 100}%` }}
                  initial={{ scaleX: 0, originX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: i * 0.1, duration: 0.5, ease: 'easeOut' }}
                  title={`${seg.label}: ${seg.count} members (${pct}%)`}
                >
                  <span className="text-white text-[10px] font-bold select-none truncate px-1">
                    {seg.count}
                  </span>
                </motion.div>
              );
            })}
          </div>

          {/* Legend rows */}
          <div className="space-y-3">
            {scoreDistribution.map((seg, i) => {
              const pct = ((seg.count / totalScored) * 100).toFixed(1);
              return (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-sm flex-shrink-0 ${seg.color}`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-700">
                        {seg.label}
                        <span className="text-gray-400 font-normal ml-1">({seg.range})</span>
                      </span>
                      <span className={`text-xs font-semibold ${seg.text}`}>
                        {seg.count} members — {pct}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
                      <motion.div
                        className={`h-1.5 rounded-full ${seg.color}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${(seg.count / totalScored) * 100}%` }}
                        transition={{ delay: 0.3 + i * 0.08, duration: 0.5 }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* ── Member Scores Table ─────────────────────────────────── */}
      <motion.div variants={cardVariants} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-[#1B2A4A] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#8CB89C]" />
              Member Scores
            </h2>
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or country…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8CB89C]/40 text-gray-700 placeholder-gray-400"
              />
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-1 mt-3 flex-wrap">
            {(['All', 'Excellent', 'Good', 'Fair', 'Poor'] as FilterTab[]).map((tab) => {
              const seg = scoreDistribution.find((s) => s.label === tab);
              return (
                <button
                  key={tab}
                  onClick={() => setFilterTab(tab)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    filterTab === tab
                      ? tab === 'All'
                        ? 'bg-[#1B2A4A] text-white'
                        : seg
                          ? `${seg.badge}`
                          : 'bg-[#1B2A4A] text-white'
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {tab}
                  {tab !== 'All' && seg && (
                    <span className="ml-1 opacity-60">{seg.count}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 text-gray-400 uppercase tracking-wider text-[10px]">
                <th className="pl-5 pr-2 py-3 text-left font-semibold">Rank</th>
                <th className="px-2 py-3 text-left font-semibold">
                  <button
                    onClick={() => toggleSort('name')}
                    className="flex items-center gap-1 hover:text-[#1B2A4A] transition-colors"
                  >
                    Member {sortIcon("name")}
                  </button>
                </th>
                <th className="px-2 py-3 text-left font-semibold">Country</th>
                <th className="px-2 py-3 text-left font-semibold">
                  <button
                    onClick={() => toggleSort('score')}
                    className="flex items-center gap-1 hover:text-[#1B2A4A] transition-colors"
                  >
                    Score {sortIcon("score")}
                  </button>
                </th>
                <th className="px-2 py-3 text-left font-semibold">Trend</th>
                <th className="px-2 py-3 text-left font-semibold">Pmt History</th>
                <th className="px-2 py-3 text-left font-semibold">Farm Prod.</th>
                <th className="px-2 py-3 pr-5 text-left font-semibold">Last Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">
                    No members match your search or filter.
                  </td>
                </tr>
              ) : (
                filtered.map((m, i) => (
                  <motion.tr
                    key={m.rank}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="hover:bg-gray-50/60 transition-colors"
                  >
                    <td className="pl-5 pr-2 py-3.5 text-gray-400 font-medium">#{m.rank}</td>
                    <td className="px-2 py-3.5 font-semibold text-[#1B2A4A]">{m.name}</td>
                    <td className="px-2 py-3.5 text-gray-500">{m.country}</td>
                    <td className="px-2 py-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${scoreBadge(m.score)}`}>
                        {m.score}
                      </span>
                    </td>
                    <td className="px-2 py-3.5">
                      {m.trend === 'up' && (
                        <span className="flex items-center gap-1 text-green-600 font-medium">
                          <TrendingUp className="w-3.5 h-3.5" /> Up
                        </span>
                      )}
                      {m.trend === 'down' && (
                        <span className="flex items-center gap-1 text-red-500 font-medium">
                          <TrendingDown className="w-3.5 h-3.5" /> Down
                        </span>
                      )}
                      {m.trend === 'flat' && (
                        <span className="flex items-center gap-1 text-gray-400 font-medium">
                          <Minus className="w-3.5 h-3.5" /> Flat
                        </span>
                      )}
                    </td>
                    <td className="px-2 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <div className="w-16 bg-gray-100 rounded-full h-1.5">
                          <div
                            className="h-1.5 rounded-full bg-[#8CB89C]"
                            style={{ width: `${m.paymentHistory}%` }}
                          />
                        </div>
                        <span className="text-gray-500">{m.paymentHistory}%</span>
                      </div>
                    </td>
                    <td className="px-2 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <div className="w-16 bg-gray-100 rounded-full h-1.5">
                          <div
                            className="h-1.5 rounded-full bg-blue-400"
                            style={{ width: `${m.farmProductivity}%` }}
                          />
                        </div>
                        <span className="text-gray-500">{m.farmProductivity}%</span>
                      </div>
                    </td>
                    <td className="px-2 pr-5 py-3.5 text-gray-400">{m.lastUpdated}</td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 border-t border-gray-50 text-[10px] text-gray-400">
          Showing {filtered.length} of {members.length} members
        </div>
      </motion.div>

      {/* ── Score Override Section ──────────────────────────────── */}
      <motion.div variants={cardVariants} className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
          <div>
            <h2 className="text-sm font-semibold text-[#1B2A4A] flex items-center gap-2 mb-1">
              <ShieldCheck className="w-4 h-4 text-[#D4A843]" />
              Score Overrides
            </h2>
            <p className="text-xs text-gray-400 max-w-lg">
              Admins can manually override a member&apos;s credit score when automated data does not
              reflect their true creditworthiness. All overrides are logged with a justification
              reason and are included in the audit trail.
            </p>
          </div>
          <button
            disabled
            title="Feature coming soon"
            className="flex items-center gap-2 px-4 py-2 bg-[#1B2A4A]/10 text-[#1B2A4A]/40 rounded-xl text-xs font-semibold cursor-not-allowed flex-shrink-0"
          >
            <ShieldCheck className="w-4 h-4" />
            Override a Score
          </button>
        </div>

        {/* Info banner */}
        <div className="flex items-start gap-2 bg-[#8CB89C]/5 border border-[#8CB89C]/20 rounded-lg p-3 mb-5">
          <Info className="w-4 h-4 text-[#8CB89C] mt-0.5 flex-shrink-0" />
          <p className="text-xs text-[#8CB89C]">
            Overrides are reviewed by a second admin before taking effect. The original score is
            preserved and visible in the member audit log.
          </p>
        </div>

        {/* Recent Override Entries */}
        <h3 className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-3">
          Recent Overrides
        </h3>
        <div className="space-y-3">
          {recentOverrides.map((ov) => (
            <div
              key={ov.id}
              className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100"
            >
              <div className="flex items-center gap-2 flex-shrink-0">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="text-xs font-semibold text-[#1B2A4A]">{ov.member}</span>
                <span className="text-[10px] text-gray-400">({ov.country})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-600">
                  {ov.from}
                </span>
                <span className="text-gray-300 text-xs">→</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700">
                  {ov.to}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 flex-1">
                <span className="italic">&quot;{ov.reason}&quot;</span>
              </p>
              <div className="text-[10px] text-gray-400 flex-shrink-0 text-right">
                <p>{ov.admin}</p>
                <p>{ov.date}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Batch Operations Card ───────────────────────────────── */}
      <motion.div variants={cardVariants} className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-sm font-semibold text-[#1B2A4A] flex items-center gap-2 mb-5">
          <CalendarClock className="w-4 h-4 text-[#8CB89C]" />
          Batch Scoring Operations
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Last Run',          value: 'Today, 06:00 AM',      sub: 'Completed in 4m 12s',  color: 'bg-green-50',  text: 'text-green-700' },
            { label: 'Next Scheduled Run',value: 'Tomorrow, 06:00 AM',   sub: 'Daily at 06:00 UTC',   color: 'bg-blue-50',   text: 'text-blue-700' },
            { label: 'Members in Queue',  value: '0',                    sub: 'No pending jobs',      color: 'bg-gray-50',   text: 'text-gray-700' },
            { label: 'Members Scored',    value: totalScored.toString(), sub: 'This batch cycle',     color: 'bg-[#8CB89C]/5', text: 'text-[#8CB89C]' },
          ].map((item, i) => (
            <div key={i} className={`${item.color} rounded-xl p-4`}>
              <p className={`text-lg font-bold ${item.text}`}>{item.value}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">{item.label}</p>
              <p className="text-[10px] text-gray-400">{item.sub}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-[#1B2A4A] hover:bg-[#1B2A4A]/90 text-white rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow-md active:scale-95">
            <RefreshCw className="w-4 h-4" />
            Recalculate All Scores
          </button>
          <p className="text-[11px] text-gray-400">
            This will trigger a full score recalculation for all{' '}
            <span className="font-semibold text-[#1B2A4A]">247 active members</span> using the
            latest data. Estimated time: ~4 minutes.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
