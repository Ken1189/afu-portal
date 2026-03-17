'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Users,
  DollarSign,
  CreditCard,
  Store,
  Ship,
  Star,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Globe,
  PieChart,
  Clock,
  Package,
  Truck,
  Headphones,
  Server,
  Zap,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

// ── Animation variants ──
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 100, damping: 15 } },
};

// ── Types ──
type TabKey = 'overview' | 'members' | 'financial' | 'operations';

// ── Mock Data ──

// KPI data
const kpis = [
  { label: 'Total Members', value: '342', change: '+12%', up: true, icon: <Users className="w-5 h-5" />, color: 'text-[#1B2A4A]', iconBg: 'bg-[#1B2A4A]/10' },
  { label: 'Revenue (MTD)', value: '$487K', change: '+8.3%', up: true, icon: <DollarSign className="w-5 h-5" />, color: 'text-[#2AA198]', iconBg: 'bg-[#2AA198]/10' },
  { label: 'Active Loans', value: '89', change: '+5', up: true, icon: <CreditCard className="w-5 h-5" />, color: 'text-blue-600', iconBg: 'bg-blue-50' },
  { label: 'Marketplace GMV', value: '$1.2M', change: '+23%', up: true, icon: <Store className="w-5 h-5" />, color: 'text-purple-600', iconBg: 'bg-purple-50' },
  { label: 'Export Value', value: '$2.8M', change: '-3.1%', up: false, icon: <Ship className="w-5 h-5" />, color: 'text-[#D4A843]', iconBg: 'bg-[#D4A843]/10' },
  { label: 'NPS Score', value: '72', change: '+4', up: true, icon: <Star className="w-5 h-5" />, color: 'text-amber-500', iconBg: 'bg-amber-50' },
];

// Member growth (12 months)
const memberGrowth = [
  { month: 'Apr', count: 180 }, { month: 'May', count: 195 }, { month: 'Jun', count: 210 },
  { month: 'Jul', count: 228 }, { month: 'Aug', count: 245 }, { month: 'Sep', count: 258 },
  { month: 'Oct', count: 275 }, { month: 'Nov', count: 290 }, { month: 'Dec', count: 298 },
  { month: 'Jan', count: 315 }, { month: 'Feb', count: 330 }, { month: 'Mar', count: 342 },
];

// Revenue trend (12 months)
const revenueTrend = [
  { month: 'Apr', value: 320 }, { month: 'May', value: 345 }, { month: 'Jun', value: 380 },
  { month: 'Jul', value: 365 }, { month: 'Aug', value: 410 }, { month: 'Sep', value: 398 },
  { month: 'Oct', value: 425 }, { month: 'Nov', value: 450 }, { month: 'Dec', value: 432 },
  { month: 'Jan', value: 468 }, { month: 'Feb', value: 475 }, { month: 'Mar', value: 487 },
];

// Active users
const activeUsers = { daily: 186, weekly: 298, monthly: 342 };

// Top features
const topFeatures = [
  { name: 'Marketplace', usage: 89 }, { name: 'Loan Applications', usage: 76 },
  { name: 'Training Portal', usage: 68 }, { name: 'Export Tracking', usage: 52 },
  { name: 'Financial Dashboard', usage: 45 }, { name: 'Document Library', usage: 38 },
];

// Member distribution by country
const membersByCountry = [
  { country: 'Zimbabwe', count: 128 }, { country: 'Tanzania', count: 85 },
  { country: 'Kenya', count: 62 }, { country: 'Botswana', count: 42 },
  { country: 'Uganda', count: 15 }, { country: 'Mozambique', count: 10 },
];

// Tier distribution
const tierDistribution = [
  { tier: 'Tier A - Commercial', count: 145, percent: 42, color: 'bg-[#1B2A4A]' },
  { tier: 'Tier B - Smallholder', count: 128, percent: 38, color: 'bg-[#2AA198]' },
  { tier: 'Tier C - Enterprise', count: 45, percent: 13, color: 'bg-[#D4A843]' },
  { tier: 'Partners', count: 24, percent: 7, color: 'bg-gray-400' },
];

// Growth rate by month
const growthRates = [
  { month: 'Oct', rate: 6.2 }, { month: 'Nov', rate: 5.5 }, { month: 'Dec', rate: 2.8 },
  { month: 'Jan', rate: 5.7 }, { month: 'Feb', rate: 4.8 }, { month: 'Mar', rate: 3.6 },
];

// Churn analysis
const churnData = { rate: 2.1, atRisk: 12, churned: 7, recovered: 3 };

// Engagement scores
const engagementScores = [
  { metric: 'Login Frequency', score: 78 }, { metric: 'Feature Adoption', score: 65 },
  { metric: 'Transaction Activity', score: 82 }, { metric: 'Training Participation', score: 58 },
  { metric: 'Support Interaction', score: 44 },
];

// Loan portfolio
const loanPortfolio = [
  { type: 'Working Capital', amount: 2500000, count: 45, rate: 95.2 },
  { type: 'Invoice Finance', amount: 1200000, count: 32, rate: 93.8 },
  { type: 'Equipment Finance', amount: 350000, count: 8, rate: 97.1 },
  { type: 'Input Bundle', amount: 150000, count: 4, rate: 100 },
];

// Revenue by service line
const revenueByService = [
  { service: 'Interest Income', amount: 312000, percent: 64 },
  { service: 'Origination Fees', amount: 78000, percent: 16 },
  { service: 'Membership Fees', amount: 47000, percent: 10 },
  { service: 'Training Revenue', amount: 35000, percent: 7 },
  { service: 'Processing Fees', amount: 15000, percent: 3 },
];

// Collection rate trends
const collectionRates = [
  { month: 'Oct', rate: 92.1 }, { month: 'Nov', rate: 93.4 }, { month: 'Dec', rate: 91.8 },
  { month: 'Jan', rate: 94.0 }, { month: 'Feb', rate: 94.2 }, { month: 'Mar', rate: 94.8 },
];

// Operations data
const marketplaceMetrics = { totalOrders: 1245, gmv: 1200000, avgOrderValue: 964, activeListings: 342 };
const logisticsMetrics = { totalShipments: 89, avgDeliveryDays: 4.2, onTimeRate: 91, inTransit: 12 };
const supportMetrics = { openTickets: 23, resolvedMtd: 145, avgResolutionHrs: 6.4, satisfaction: 4.6 };
const systemMetrics = { uptime: 99.97, responseTime: 142, errorRate: 0.03, activeConnections: 86 };

// ═══════════════════════════════════════════════════════
//  MAIN PAGE COMPONENT
// ═══════════════════════════════════════════════════════

export default function AdminAnalyticsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('overview');

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'members', label: 'Members' },
    { key: 'financial', label: 'Financial' },
    { key: 'operations', label: 'Operations' },
  ];

  const maxMemberCount = Math.max(...memberGrowth.map((m) => m.count));
  const maxRevenue = Math.max(...revenueTrend.map((r) => r.value));
  const maxCountryCount = Math.max(...membersByCountry.map((c) => c.count));
  const totalLoanAmount = loanPortfolio.reduce((s, l) => s + l.amount, 0);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      {/* ── Header ── */}
      <motion.div variants={cardVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#1B2A4A] rounded-xl flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1B2A4A]">Platform Analytics</h1>
            <p className="text-gray-500 text-sm mt-0.5">Comprehensive platform performance metrics</p>
          </div>
        </div>
      </motion.div>

      {/* ── KPI Row ── */}
      <motion.div variants={cardVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {kpis.map((kpi, i) => (
          <div key={i} className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div className={`w-8 h-8 ${kpi.iconBg} rounded-lg flex items-center justify-center ${kpi.color}`}>
                {kpi.icon}
              </div>
              <span className={`text-xs font-semibold flex items-center gap-0.5 ${kpi.up ? 'text-green-600' : 'text-red-500'}`}>
                {kpi.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {kpi.change}
              </span>
            </div>
            <p className="text-xl font-bold text-[#1B2A4A]">{kpi.value}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{kpi.label}</p>
          </div>
        ))}
      </motion.div>

      {/* ── Tab Switcher ── */}
      <motion.div variants={cardVariants} className="flex gap-1 bg-white rounded-xl p-1 border border-gray-100 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-[#1B2A4A] text-white shadow-sm'
                : 'text-gray-500 hover:text-[#1B2A4A] hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </motion.div>

      {/* ===== OVERVIEW TAB ===== */}
      {activeTab === 'overview' && (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Member Growth Chart */}
            <motion.div variants={cardVariants} className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="text-sm font-semibold text-[#1B2A4A] mb-4 flex items-center gap-2">
                <Users className="w-4 h-4" /> Member Growth (12 Months)
              </h3>
              <div className="flex items-end gap-2 h-44">
                {memberGrowth.map((m, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] font-medium text-[#1B2A4A]">{m.count}</span>
                    <div
                      className="w-full bg-[#2AA198] rounded-t-md transition-all hover:bg-[#2AA198]/80"
                      style={{ height: `${(m.count / maxMemberCount) * 100}%` }}
                    />
                    <span className="text-[9px] text-gray-400">{m.month}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Revenue Trend */}
            <motion.div variants={cardVariants} className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="text-sm font-semibold text-[#1B2A4A] mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> Revenue Trend ($K)
              </h3>
              <div className="flex items-end gap-2 h-44">
                {revenueTrend.map((r, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] font-medium text-[#1B2A4A]">{r.value}</span>
                    <div
                      className="w-full bg-[#D4A843] rounded-t-md transition-all hover:bg-[#D4A843]/80"
                      style={{ height: `${(r.value / maxRevenue) * 100}%` }}
                    />
                    <span className="text-[9px] text-gray-400">{r.month}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Active Users */}
            <motion.div variants={cardVariants} className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="text-sm font-semibold text-[#1B2A4A] mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4" /> Active Users
              </h3>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Daily', value: activeUsers.daily, percent: Math.round((activeUsers.daily / 342) * 100), color: 'bg-[#2AA198]' },
                  { label: 'Weekly', value: activeUsers.weekly, percent: Math.round((activeUsers.weekly / 342) * 100), color: 'bg-[#1B2A4A]' },
                  { label: 'Monthly', value: activeUsers.monthly, percent: Math.round((activeUsers.monthly / 342) * 100), color: 'bg-[#D4A843]' },
                ].map((u, i) => (
                  <div key={i} className="text-center">
                    <div className="relative w-20 h-20 mx-auto mb-2">
                      <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#E5E7EB" strokeWidth="3" />
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={u.color === 'bg-[#2AA198]' ? '#2AA198' : u.color === 'bg-[#1B2A4A]' ? '#1B2A4A' : '#D4A843'} strokeWidth="3" strokeDasharray={`${u.percent}, 100`} />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-[#1B2A4A]">{u.percent}%</span>
                    </div>
                    <p className="text-xl font-bold text-[#1B2A4A]">{u.value}</p>
                    <p className="text-[10px] text-gray-400">{u.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Top Features by Usage */}
            <motion.div variants={cardVariants} className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="text-sm font-semibold text-[#1B2A4A] mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4" /> Top Features by Usage
              </h3>
              <div className="space-y-3">
                {topFeatures.map((f, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-600">{f.name}</span>
                      <span className="font-semibold text-[#1B2A4A]">{f.usage}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-[#2AA198]"
                        style={{ width: `${f.usage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* ===== MEMBERS TAB ===== */}
      {activeTab === 'members' && (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Member Distribution by Country */}
            <motion.div variants={cardVariants} className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="text-sm font-semibold text-[#1B2A4A] mb-4 flex items-center gap-2">
                <Globe className="w-4 h-4" /> Member Distribution by Country
              </h3>
              <div className="space-y-3">
                {membersByCountry.map((c, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">{c.country}</span>
                      <span className="font-medium text-[#1B2A4A]">{c.count} members</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3">
                      <div
                        className="h-3 rounded-full bg-[#1B2A4A] transition-all"
                        style={{ width: `${(c.count / maxCountryCount) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Tier Distribution */}
            <motion.div variants={cardVariants} className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="text-sm font-semibold text-[#1B2A4A] mb-4 flex items-center gap-2">
                <PieChart className="w-4 h-4" /> Tier Distribution
              </h3>
              {/* CSS donut-style */}
              <div className="flex items-center gap-6">
                <div className="relative w-32 h-32 flex-shrink-0">
                  <svg viewBox="0 0 36 36" className="w-32 h-32 transform -rotate-90">
                    {tierDistribution.reduce<{ elements: React.ReactNode[], offset: number }>((acc, tier, i) => {
                      const strokeColor = tier.color === 'bg-[#1B2A4A]' ? '#1B2A4A' : tier.color === 'bg-[#2AA198]' ? '#2AA198' : tier.color === 'bg-[#D4A843]' ? '#D4A843' : '#9CA3AF';
                      acc.elements.push(
                        <path
                          key={i}
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke={strokeColor}
                          strokeWidth="4"
                          strokeDasharray={`${tier.percent} ${100 - tier.percent}`}
                          strokeDashoffset={`${-acc.offset}`}
                        />
                      );
                      acc.offset += tier.percent;
                      return acc;
                    }, { elements: [], offset: 0 }).elements}
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-lg font-bold text-[#1B2A4A]">342</p>
                      <p className="text-[9px] text-gray-400">Total</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2 flex-1">
                  {tierDistribution.map((t, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${t.color}`} />
                        <span className="text-gray-600">{t.tier}</span>
                      </div>
                      <span className="font-semibold text-[#1B2A4A]">{t.count} ({t.percent}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Growth Rate by Month */}
            <motion.div variants={cardVariants} className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="text-sm font-semibold text-[#1B2A4A] mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> Growth Rate by Month (%)
              </h3>
              <div className="flex items-end gap-3 h-32">
                {growthRates.map((g, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] font-medium text-[#1B2A4A]">{g.rate}%</span>
                    <div
                      className="w-full bg-[#2AA198] rounded-t-md transition-all"
                      style={{ height: `${(g.rate / Math.max(...growthRates.map((r) => r.rate))) * 100}%` }}
                    />
                    <span className="text-[9px] text-gray-400">{g.month}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Churn Analysis */}
            <motion.div variants={cardVariants} className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="text-sm font-semibold text-[#1B2A4A] mb-4 flex items-center gap-2">
                <TrendingDown className="w-4 h-4" /> Churn Analysis
              </h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-3 bg-red-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-red-600">{churnData.rate}%</p>
                  <p className="text-[10px] text-red-500">Churn Rate</p>
                </div>
                <div className="p-3 bg-amber-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-amber-600">{churnData.atRisk}</p>
                  <p className="text-[10px] text-amber-500">At Risk</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-gray-600">{churnData.churned}</p>
                  <p className="text-[10px] text-gray-500">Churned (MTD)</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-green-600">{churnData.recovered}</p>
                  <p className="text-[10px] text-green-500">Recovered</p>
                </div>
              </div>
            </motion.div>

            {/* Engagement Scores */}
            <motion.div variants={cardVariants} className="bg-white rounded-xl border border-gray-100 p-6 lg:col-span-2">
              <h3 className="text-sm font-semibold text-[#1B2A4A] mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4" /> Engagement Scores
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                {engagementScores.map((e, i) => (
                  <div key={i} className="text-center">
                    <div className="relative w-16 h-16 mx-auto mb-2">
                      <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#E5E7EB" strokeWidth="3" />
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none"
                          stroke={e.score >= 70 ? '#2AA198' : e.score >= 50 ? '#D4A843' : '#EF4444'}
                          strokeWidth="3"
                          strokeDasharray={`${e.score}, 100`}
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-[#1B2A4A]">{e.score}</span>
                    </div>
                    <p className="text-[10px] text-gray-500 leading-tight">{e.metric}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* ===== FINANCIAL TAB ===== */}
      {activeTab === 'financial' && (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Loan Portfolio Overview */}
            <motion.div variants={cardVariants} className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="text-sm font-semibold text-[#1B2A4A] mb-4 flex items-center gap-2">
                <CreditCard className="w-4 h-4" /> Loan Portfolio Overview
              </h3>
              <div className="space-y-4">
                {loanPortfolio.map((loan, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600 font-medium">{loan.type}</span>
                      <span className="text-[#1B2A4A] font-semibold">${(loan.amount / 1000000).toFixed(1)}M</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-gray-400 mb-1">
                      <span>{loan.count} active loans</span>
                      <span>Repayment: {loan.rate}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-[#2AA198]"
                        style={{ width: `${(loan.amount / totalLoanAmount) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between text-sm">
                <span className="text-gray-500">Total Portfolio</span>
                <span className="font-bold text-[#1B2A4A]">${(totalLoanAmount / 1000000).toFixed(1)}M</span>
              </div>
            </motion.div>

            {/* Revenue by Service Line */}
            <motion.div variants={cardVariants} className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="text-sm font-semibold text-[#1B2A4A] mb-4 flex items-center gap-2">
                <DollarSign className="w-4 h-4" /> Revenue by Service Line
              </h3>
              <div className="space-y-3">
                {revenueByService.map((r, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">{r.service}</span>
                      <span className="font-medium text-[#1B2A4A]">${(r.amount / 1000).toFixed(0)}K ({r.percent}%)</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-[#D4A843]"
                        style={{ width: `${r.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Collection Rate Trends */}
            <motion.div variants={cardVariants} className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="text-sm font-semibold text-[#1B2A4A] mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> Collection Rate Trends (%)
              </h3>
              <div className="flex items-end gap-3 h-36">
                {collectionRates.map((c, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] font-medium text-[#1B2A4A]">{c.rate}%</span>
                    <div
                      className="w-full bg-green-500 rounded-t-md transition-all"
                      style={{ height: `${((c.rate - 90) / 5) * 100}%` }}
                    />
                    <span className="text-[9px] text-gray-400">{c.month}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-2 border-t border-gray-50 flex items-center justify-between text-xs">
                <span className="text-gray-400">Target: 92%</span>
                <span className="text-green-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Above target
                </span>
              </div>
            </motion.div>

            {/* Outstanding & NPL */}
            <motion.div variants={cardVariants} className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="text-sm font-semibold text-[#1B2A4A] mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Outstanding & Risk Metrics
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl text-center">
                  <p className="text-2xl font-bold text-[#1B2A4A]">$2.8M</p>
                  <p className="text-[10px] text-gray-500 mt-1">Outstanding Amount</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl text-center">
                  <p className="text-2xl font-bold text-[#2AA198]">$4.2M</p>
                  <p className="text-[10px] text-gray-500 mt-1">Total Deployed</p>
                </div>
                <div className="p-4 bg-green-50 rounded-xl text-center">
                  <p className="text-2xl font-bold text-green-600">1.8%</p>
                  <p className="text-[10px] text-green-500 mt-1">NPL Ratio</p>
                </div>
                <div className="p-4 bg-amber-50 rounded-xl text-center">
                  <p className="text-2xl font-bold text-amber-600">$76K</p>
                  <p className="text-[10px] text-amber-500 mt-1">Non-Performing</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* ===== OPERATIONS TAB ===== */}
      {activeTab === 'operations' && (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Marketplace Metrics */}
            <motion.div variants={cardVariants} className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="text-sm font-semibold text-[#1B2A4A] mb-4 flex items-center gap-2">
                <Store className="w-4 h-4" /> Marketplace Metrics
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Total Orders</p>
                  <p className="text-xl font-bold text-[#1B2A4A] mt-1">{marketplaceMetrics.totalOrders.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">GMV</p>
                  <p className="text-xl font-bold text-[#2AA198] mt-1">${(marketplaceMetrics.gmv / 1000000).toFixed(1)}M</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Avg Order Value</p>
                  <p className="text-xl font-bold text-[#D4A843] mt-1">${marketplaceMetrics.avgOrderValue}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Active Listings</p>
                  <p className="text-xl font-bold text-[#1B2A4A] mt-1">{marketplaceMetrics.activeListings}</p>
                </div>
              </div>
            </motion.div>

            {/* Logistics Metrics */}
            <motion.div variants={cardVariants} className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="text-sm font-semibold text-[#1B2A4A] mb-4 flex items-center gap-2">
                <Truck className="w-4 h-4" /> Logistics Metrics
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Total Shipments</p>
                  <p className="text-xl font-bold text-[#1B2A4A] mt-1">{logisticsMetrics.totalShipments}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Avg Delivery (days)</p>
                  <p className="text-xl font-bold text-[#2AA198] mt-1">{logisticsMetrics.avgDeliveryDays}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">On-Time Rate</p>
                  <p className="text-xl font-bold text-green-600 mt-1">{logisticsMetrics.onTimeRate}%</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">In Transit</p>
                  <p className="text-xl font-bold text-amber-600 mt-1">{logisticsMetrics.inTransit}</p>
                </div>
              </div>
            </motion.div>

            {/* Support Tickets */}
            <motion.div variants={cardVariants} className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="text-sm font-semibold text-[#1B2A4A] mb-4 flex items-center gap-2">
                <Headphones className="w-4 h-4" /> Support Tickets
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-amber-50 rounded-lg">
                  <p className="text-xs text-amber-600">Open Tickets</p>
                  <p className="text-xl font-bold text-amber-700 mt-1">{supportMetrics.openTickets}</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-xs text-green-600">Resolved (MTD)</p>
                  <p className="text-xl font-bold text-green-700 mt-1">{supportMetrics.resolvedMtd}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-600">Avg Resolution (hrs)</p>
                  <p className="text-xl font-bold text-blue-700 mt-1">{supportMetrics.avgResolutionHrs}</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <p className="text-xs text-purple-600">Satisfaction</p>
                  <p className="text-xl font-bold text-purple-700 mt-1">{supportMetrics.satisfaction}/5</p>
                </div>
              </div>
            </motion.div>

            {/* System Uptime & Performance */}
            <motion.div variants={cardVariants} className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="text-sm font-semibold text-[#1B2A4A] mb-4 flex items-center gap-2">
                <Server className="w-4 h-4" /> System Uptime & Performance
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-xs text-green-600">Uptime</p>
                  <p className="text-xl font-bold text-green-700 mt-1">{systemMetrics.uptime}%</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-600">Response Time (ms)</p>
                  <p className="text-xl font-bold text-blue-700 mt-1">{systemMetrics.responseTime}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Error Rate</p>
                  <p className="text-xl font-bold text-gray-700 mt-1">{systemMetrics.errorRate}%</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Active Connections</p>
                  <p className="text-xl font-bold text-[#1B2A4A] mt-1">{systemMetrics.activeConnections}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
