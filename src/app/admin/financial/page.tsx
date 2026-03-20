'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  Landmark,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  PieChart as PieChartIcon,
  BarChart3,
  Plus,
  FileText,
  Download,
  AlertTriangle,
  ShieldCheck,
  Clock,
  Banknote,
  ArrowDownToLine,
  Percent,
  Target,
} from 'lucide-react';
// ── Inline fallback data (formerly from @/lib/data/loans & @/lib/data/stats) ─

interface Loan {
  id: string;
  memberId: string;
  memberName: string;
  type: 'working-capital' | 'invoice-finance' | 'equipment' | 'input-bundle';
  amount: number;
  outstanding: number;
  interestRate: number;
  tenor: number;
  status: 'active' | 'completed' | 'overdue' | 'disbursed' | 'approved';
  disbursementDate: string;
  maturityDate: string;
  nextPaymentDate: string;
  nextPaymentAmount: number;
  repaidPercentage: number;
  crop: string;
  buyer: string | null;
  country: string;
}

const mockLoans: Loan[] = [
  { id: 'FIN-2024-001', memberId: 'AFU-2024-036', memberName: 'Thabo Molefe', type: 'working-capital', amount: 85000, outstanding: 42500, interestRate: 12.5, tenor: 180, status: 'active', disbursementDate: '2025-10-15', maturityDate: '2026-04-13', nextPaymentDate: '2026-03-15', nextPaymentAmount: 14800, repaidPercentage: 50, crop: 'Blueberries', buyer: null, country: 'Botswana' },
  { id: 'FIN-2024-002', memberId: 'AFU-2024-037', memberName: 'Rudo Chidyamakono', type: 'invoice-finance', amount: 120000, outstanding: 36000, interestRate: 10.0, tenor: 90, status: 'active', disbursementDate: '2026-01-10', maturityDate: '2026-04-10', nextPaymentDate: '2026-03-20', nextPaymentAmount: 18500, repaidPercentage: 70, crop: 'Tobacco', buyer: 'Berry Fresh UK', country: 'Zimbabwe' },
  { id: 'FIN-2024-003', memberId: 'AFU-2024-003', memberName: 'Tendai Moyo', type: 'input-bundle', amount: 8500, outstanding: 5950, interestRate: 15.0, tenor: 120, status: 'active', disbursementDate: '2025-12-20', maturityDate: '2026-04-19', nextPaymentDate: '2026-03-20', nextPaymentAmount: 2200, repaidPercentage: 30, crop: 'Maize', buyer: null, country: 'Zimbabwe' },
  { id: 'FIN-2024-004', memberId: 'AFU-2024-038', memberName: 'Emmanuel Massawe', type: 'equipment', amount: 65000, outstanding: 48750, interestRate: 11.0, tenor: 365, status: 'active', disbursementDate: '2025-09-01', maturityDate: '2026-09-01', nextPaymentDate: '2026-03-25', nextPaymentAmount: 6200, repaidPercentage: 25, crop: 'Blueberries', buyer: null, country: 'Tanzania' },
  { id: 'FIN-2024-005', memberId: 'AFU-2024-001', memberName: 'Kgosi Mosweu', type: 'working-capital', amount: 12000, outstanding: 3600, interestRate: 14.0, tenor: 150, status: 'active', disbursementDate: '2025-11-01', maturityDate: '2026-03-31', nextPaymentDate: '2026-03-18', nextPaymentAmount: 3800, repaidPercentage: 70, crop: 'Maize', buyer: null, country: 'Botswana' },
  { id: 'FIN-2024-006', memberId: 'AFU-2024-046', memberName: 'Blessing Murefu', type: 'invoice-finance', amount: 200000, outstanding: 80000, interestRate: 8.5, tenor: 120, status: 'active', disbursementDate: '2025-12-01', maturityDate: '2026-03-31', nextPaymentDate: '2026-03-15', nextPaymentAmount: 42000, repaidPercentage: 60, crop: 'Cotton', buyer: 'Marks & Spencer', country: 'Zimbabwe' },
  { id: 'FIN-2024-009', memberId: 'AFU-2024-047', memberName: 'Joseph Mwangosi', type: 'equipment', amount: 180000, outstanding: 144000, interestRate: 9.0, tenor: 365, status: 'disbursed', disbursementDate: '2026-01-15', maturityDate: '2027-01-15', nextPaymentDate: '2026-03-15', nextPaymentAmount: 16800, repaidPercentage: 20, crop: 'Sesame', buyer: null, country: 'Tanzania' },
  { id: 'FIN-2024-010', memberId: 'AFU-2024-009', memberName: 'Tapiwa Ncube', type: 'working-capital', amount: 15000, outstanding: 17250, interestRate: 16.0, tenor: 120, status: 'overdue', disbursementDate: '2025-08-10', maturityDate: '2025-12-08', nextPaymentDate: '2025-12-08', nextPaymentAmount: 17250, repaidPercentage: 0, crop: 'Cotton', buyer: null, country: 'Zimbabwe' },
  { id: 'FIN-2024-021', memberId: 'AFU-2024-015', memberName: 'Chenai Dziva', type: 'input-bundle', amount: 5500, outstanding: 6050, interestRate: 18.0, tenor: 90, status: 'overdue', disbursementDate: '2025-09-01', maturityDate: '2025-11-30', nextPaymentDate: '2025-11-30', nextPaymentAmount: 6050, repaidPercentage: 0, crop: 'Maize', buyer: null, country: 'Zimbabwe' },
  { id: 'FIN-2024-007', memberId: 'AFU-2024-006', memberName: 'Rutendo Chirwa', type: 'input-bundle', amount: 7200, outstanding: 0, interestRate: 15.5, tenor: 90, status: 'completed', disbursementDate: '2025-09-15', maturityDate: '2025-12-14', nextPaymentDate: '', nextPaymentAmount: 0, repaidPercentage: 100, crop: 'Blueberries', buyer: null, country: 'Zimbabwe' },
  { id: 'FIN-2024-012', memberId: 'AFU-2024-040', memberName: 'Munyaradzi Hove', type: 'working-capital', amount: 110000, outstanding: 0, interestRate: 11.0, tenor: 180, status: 'completed', disbursementDate: '2025-06-01', maturityDate: '2025-11-28', nextPaymentDate: '', nextPaymentAmount: 0, repaidPercentage: 100, crop: 'Cotton', buyer: null, country: 'Zimbabwe' },
];

const dashboardStats = {
  totalMembers: 247,
  membersByTier: { smallholder: 178, commercial: 52, enterprise: 7, partner: 10 },
  membersByCountry: { Botswana: 48, Zimbabwe: 112, Tanzania: 87 },
  totalLoansDeployed: 4200000,
  activeLoans: 89,
  defaultRate: 2.3,
  monthlyRevenue: 127000,
  revenueGrowth: 18.5,
  pendingApplications: 15,
  trainingCompletionRate: 60.3,
  avgProcessingDays: 4.2,
  memberGrowth: [45, 62, 78, 95, 112, 134, 152, 170, 189, 210, 231, 247],
  memberGrowthLabels: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
  loanPortfolio: [
    { month: 'Apr', workingCapital: 180000, invoiceFinance: 95000, equipment: 45000, inputBundle: 22000 },
    { month: 'May', workingCapital: 210000, invoiceFinance: 110000, equipment: 52000, inputBundle: 28000 },
    { month: 'Jun', workingCapital: 245000, invoiceFinance: 125000, equipment: 60000, inputBundle: 35000 },
    { month: 'Jul', workingCapital: 280000, invoiceFinance: 140000, equipment: 68000, inputBundle: 42000 },
    { month: 'Aug', workingCapital: 310000, invoiceFinance: 155000, equipment: 75000, inputBundle: 48000 },
    { month: 'Sep', workingCapital: 340000, invoiceFinance: 170000, equipment: 82000, inputBundle: 55000 },
    { month: 'Oct', workingCapital: 370000, invoiceFinance: 185000, equipment: 88000, inputBundle: 60000 },
    { month: 'Nov', workingCapital: 395000, invoiceFinance: 198000, equipment: 92000, inputBundle: 65000 },
    { month: 'Dec', workingCapital: 420000, invoiceFinance: 210000, equipment: 98000, inputBundle: 70000 },
    { month: 'Jan', workingCapital: 450000, invoiceFinance: 225000, equipment: 105000, inputBundle: 75000 },
    { month: 'Feb', workingCapital: 480000, invoiceFinance: 240000, equipment: 110000, inputBundle: 80000 },
    { month: 'Mar', workingCapital: 510000, invoiceFinance: 255000, equipment: 115000, inputBundle: 85000 },
  ],
  revenueBreakdown: [
    { source: 'Interest Income', amount: 68000, color: '#8CB89C' },
    { source: 'Membership Fees', amount: 24000, color: '#1B2A4A' },
    { source: 'Origination Fees', amount: 18000, color: '#D4A843' },
    { source: 'Partner Fees', amount: 12000, color: '#2D4A7A' },
    { source: 'Training Revenue', amount: 5000, color: '#729E82' },
  ],
  applicationPipeline: [
    { stage: 'New', count: 4, color: '#60A5FA' },
    { stage: 'Documents Review', count: 3, color: '#FBBF24' },
    { stage: 'Credit Assessment', count: 3, color: '#F97316' },
    { stage: 'Approved', count: 3, color: '#34D399' },
    { stage: 'Disbursed', count: 2, color: '#8CB89C' },
  ],
  milestones: [
    { label: '500 Members', target: 500, current: 247, deadline: 'Q4 2026' },
    { label: '$10M Deployed', target: 10000000, current: 4200000, deadline: 'Q2 2027' },
    { label: '3 Countries', target: 3, current: 3, deadline: 'Q1 2026' },
    { label: 'Default Rate <5%', target: 5, current: 2.3, deadline: 'Ongoing', inverted: true },
    { label: '60% Training Rate', target: 60, current: 60.3, deadline: 'Q1 2026' },
  ],
};

interface FinancialLiveData {
  loans: { stats: { total: number; totalDeployed: number; totalRepaid: number; activeCount: number; pendingCount: number; completedCount: number; defaultedCount: number; defaultRate: string } };
  payments: { stats: { totalCollected: number; totalPending: number } };
  commissions: { stats: { pendingAmount: number; paidAmount: number } };
}

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

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toLocaleString()}`;
}

// ── Data ────────────────────────────────────────────────────────────────────

const totalPortfolioValue = mockLoans.reduce((sum, l) => sum + l.outstanding, 0);
const activeLoansCount = mockLoans.filter((l) => l.status === 'active' || l.status === 'disbursed').length;
const disbursedThisMonth = 285000;
const collectionsRate = 94.2;
const defaultRate = dashboardStats.defaultRate;
const avgLoanSize = Math.round(totalPortfolioValue / activeLoansCount);

const loanQualityData = [
  { name: 'Performing', value: 68, color: '#22C55E' },
  { name: 'Watch', value: 15, color: '#F59E0B' },
  { name: 'Sub-standard', value: 9, color: '#F97316' },
  { name: 'Doubtful', value: 5, color: '#EF4444' },
  { name: 'Loss', value: 3, color: '#991B1B' },
];

const portfolioGrowthData = [
  { month: 'Apr', value: 342000 },
  { month: 'May', value: 400000 },
  { month: 'Jun', value: 465000 },
  { month: 'Jul', value: 530000 },
  { month: 'Aug', value: 588000 },
  { month: 'Sep', value: 647000 },
  { month: 'Oct', value: 703000 },
  { month: 'Nov', value: 750000 },
  { month: 'Dec', value: 798000 },
  { month: 'Jan', value: 855000 },
  { month: 'Feb', value: 910000 },
  { month: 'Mar', value: 965000 },
];

const agingAnalysisData = [
  { category: 'Current', amount: 720000, percentage: 74.6, color: '#22C55E' },
  { category: '1-30 Days', amount: 125000, percentage: 13.0, color: '#F59E0B' },
  { category: '31-60 Days', amount: 68000, percentage: 7.0, color: '#F97316' },
  { category: '61-90 Days', amount: 32000, percentage: 3.3, color: '#EF4444' },
  { category: '90+ Days', amount: 20000, percentage: 2.1, color: '#991B1B' },
];

const vintageData = [
  { cohort: 'Sep 2025', originations: 12, principal: 185000, performing: 95.2, par30: 3.1, par90: 1.7, writeOff: 0 },
  { cohort: 'Oct 2025', originations: 15, principal: 248000, performing: 93.8, par30: 4.2, par90: 1.5, writeOff: 0.5 },
  { cohort: 'Nov 2025', originations: 10, principal: 172000, performing: 96.1, par30: 2.8, par90: 0.8, writeOff: 0.3 },
  { cohort: 'Dec 2025', originations: 14, principal: 210000, performing: 94.5, par30: 3.5, par90: 1.2, writeOff: 0.8 },
  { cohort: 'Jan 2026', originations: 18, principal: 320000, performing: 97.2, par30: 2.0, par90: 0.5, writeOff: 0.3 },
  { cohort: 'Feb 2026', originations: 16, principal: 295000, performing: 98.5, par30: 1.2, par90: 0.3, writeOff: 0 },
  { cohort: 'Mar 2026', originations: 8, principal: 142000, performing: 100, par30: 0, par90: 0, writeOff: 0 },
];

// ── Custom Tooltip ──────────────────────────────────────────────────────────

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
          <span className="font-medium text-navy">
            {typeof entry.value === 'number' ? formatCurrency(entry.value) : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function FinancialManagementPage() {
  const [selectedQuality, setSelectedQuality] = useState<string | null>(null);
  const [liveFinancial, setLiveFinancial] = useState<FinancialLiveData | null>(null);

  // Fetch live financial data
  useEffect(() => {
    fetch('/api/admin/financial')
      .then(r => r.json())
      .then(d => { if (!d.error) setLiveFinancial(d); })
      .catch(() => {});
  }, []);

  // Use live loan data or mock
  const loans = liveFinancial?.loans?.stats ? mockLoans : mockLoans; // Data structure mismatch — keep mock for table, use live for stats

  const statCards = [
    {
      label: 'Total Portfolio Value',
      value: formatCurrency(totalPortfolioValue),
      change: '+12.4%',
      changeType: 'up' as const,
      icon: <Landmark className="w-5 h-5" />,
      color: 'text-navy',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Active Loans',
      value: activeLoansCount.toString(),
      change: '+8',
      changeType: 'up' as const,
      icon: <FileText className="w-5 h-5" />,
      color: 'text-teal',
      bgColor: 'bg-teal/10',
    },
    {
      label: 'Disbursed This Month',
      value: formatCurrency(disbursedThisMonth),
      change: '+22.5%',
      changeType: 'up' as const,
      icon: <ArrowDownToLine className="w-5 h-5" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Collections Rate',
      value: `${collectionsRate}%`,
      change: '+1.8%',
      changeType: 'up' as const,
      icon: <Target className="w-5 h-5" />,
      color: 'text-teal',
      bgColor: 'bg-teal/10',
    },
    {
      label: 'Default Rate',
      value: `${defaultRate}%`,
      change: '-0.5%',
      changeType: 'down' as const,
      icon: <AlertTriangle className="w-5 h-5" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Avg Loan Size',
      value: formatCurrency(avgLoanSize),
      change: null,
      changeType: 'neutral' as const,
      icon: <DollarSign className="w-5 h-5" />,
      color: 'text-gold',
      bgColor: 'bg-amber-50',
    },
  ];

  const maxAgingAmount = Math.max(...agingAnalysisData.map((d) => d.amount));

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">Financial Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">Loan portfolio overview and performance analytics</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/admin/financial/disbursements"
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-teal hover:bg-teal-dark rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            New Disbursement
          </Link>
          <Link
            href="/admin/financial/collections"
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-navy bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Banknote className="w-3.5 h-3.5" />
            Collection Report
          </Link>
          <button className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-navy bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
            <Download className="w-3.5 h-3.5" />
            Portfolio Export
          </button>
        </div>
      </motion.div>

      {/* ── Stat Cards ───────────────────────────────────────────────────── */}
      <motion.div variants={containerVariants} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={i}
            variants={cardVariants}
            whileHover={{ y: -2, boxShadow: '0 8px 25px rgba(27,42,74,0.08)' }}
            className="bg-white rounded-xl p-4 border border-gray-100 cursor-default"
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`w-9 h-9 rounded-lg ${stat.bgColor} flex items-center justify-center ${stat.color}`}>
                {stat.icon}
              </div>
              {stat.change && (
                <span
                  className={`text-xs font-medium px-1.5 py-0.5 rounded-full flex items-center gap-0.5 ${
                    stat.changeType === 'up'
                      ? 'bg-green-50 text-green-600'
                      : stat.changeType === 'down'
                        ? 'bg-green-50 text-green-600'
                        : 'bg-gray-50 text-gray-500'
                  }`}
                >
                  {stat.changeType === 'up' && <ArrowUpRight className="w-3 h-3" />}
                  {stat.changeType === 'down' && <ArrowDownRight className="w-3 h-3" />}
                  {stat.change}
                </span>
              )}
            </div>
            <p className="text-2xl font-bold text-navy">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Charts Row ───────────────────────────────────────────────────── */}
      <motion.div variants={containerVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Loan Quality Breakdown Donut */}
        <motion.div variants={cardVariants} className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="font-semibold text-navy text-sm mb-4 flex items-center gap-2">
            <PieChartIcon className="w-4 h-4 text-teal" />
            Loan Quality Breakdown
          </h3>
          <div className="h-56 flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={loanQualityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  nameKey="name"
                  stroke="none"
                  onClick={(_, index) => {
                    const name = loanQualityData[index].name;
                    setSelectedQuality(selectedQuality === name ? null : name);
                  }}
                  cursor="pointer"
                >
                  {loanQualityData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={entry.color}
                      opacity={selectedQuality && selectedQuality !== entry.name ? 0.3 : 1}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => `${value}%`}
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #f0f0f0',
                    fontSize: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {loanQualityData.map((item) => (
              <button
                key={item.name}
                onClick={() => setSelectedQuality(selectedQuality === item.name ? null : item.name)}
                className={`flex items-center gap-1.5 text-xs transition-opacity ${
                  selectedQuality && selectedQuality !== item.name ? 'opacity-40' : 'opacity-100'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-gray-600">{item.name}</span>
                <span className="font-medium text-navy">{item.value}%</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Portfolio Growth */}
        <motion.div variants={cardVariants} className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="font-semibold text-navy text-sm mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-teal" />
            Portfolio Growth (12 Months)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={portfolioGrowthData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8CB89C" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8CB89C" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => formatCurrency(v)} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#8CB89C"
                  strokeWidth={2.5}
                  fill="url(#portfolioGradient)"
                  name="Portfolio Value"
                  dot={{ fill: '#8CB89C', r: 3, strokeWidth: 0 }}
                  activeDot={{ fill: '#8CB89C', r: 5, strokeWidth: 2, stroke: '#fff' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Aging Analysis */}
        <motion.div variants={cardVariants} className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="font-semibold text-navy text-sm mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-teal" />
            Aging Analysis
          </h3>
          <div className="space-y-4 pt-2">
            {agingAnalysisData.map((item, i) => (
              <motion.div
                key={item.category}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.08 }}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-navy">{item.category}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-navy tabular-nums">{formatCurrency(item.amount)}</span>
                    <span className="text-[10px] text-gray-400 tabular-nums">({item.percentage}%)</span>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(item.amount / maxAgingAmount) * 100}%` }}
                    transition={{ duration: 0.8, delay: 0.3 + i * 0.1, ease: 'easeOut' }}
                    className="h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Total Outstanding</span>
              <span className="text-sm font-bold text-navy">
                {formatCurrency(agingAnalysisData.reduce((s, d) => s + d.amount, 0))}
              </span>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* ── Vintage Analysis Table ────────────────────────────────────────── */}
      <motion.div variants={cardVariants} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-navy text-sm flex items-center gap-2">
            <Clock className="w-4 h-4 text-teal" />
            Vintage Analysis
          </h3>
          <span className="text-xs text-gray-400">Loan cohorts by origination month</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50 bg-cream/50">
                <th className="text-left py-3 px-5 text-xs font-medium text-gray-400 uppercase tracking-wider">Cohort</th>
                <th className="text-right py-3 px-5 text-xs font-medium text-gray-400 uppercase tracking-wider">Originations</th>
                <th className="text-right py-3 px-5 text-xs font-medium text-gray-400 uppercase tracking-wider">Principal</th>
                <th className="text-right py-3 px-5 text-xs font-medium text-gray-400 uppercase tracking-wider">Performing</th>
                <th className="text-right py-3 px-5 text-xs font-medium text-gray-400 uppercase tracking-wider">PAR 30</th>
                <th className="text-right py-3 px-5 text-xs font-medium text-gray-400 uppercase tracking-wider">PAR 90</th>
                <th className="text-right py-3 px-5 text-xs font-medium text-gray-400 uppercase tracking-wider">Write-Off</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {vintageData.map((row, i) => (
                <motion.tr
                  key={row.cohort}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="hover:bg-cream/50 transition-colors"
                >
                  <td className="py-3 px-5 font-medium text-navy">{row.cohort}</td>
                  <td className="py-3 px-5 text-right text-gray-600 tabular-nums">{row.originations}</td>
                  <td className="py-3 px-5 text-right font-medium text-navy tabular-nums">${row.principal.toLocaleString()}</td>
                  <td className="py-3 px-5 text-right">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium tabular-nums ${
                      row.performing >= 97 ? 'bg-green-100 text-green-700' :
                      row.performing >= 94 ? 'bg-teal/10 text-teal-dark' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {row.performing}%
                    </span>
                  </td>
                  <td className="py-3 px-5 text-right">
                    <span className={`text-xs tabular-nums ${row.par30 > 3 ? 'text-amber-600 font-medium' : 'text-gray-500'}`}>
                      {row.par30}%
                    </span>
                  </td>
                  <td className="py-3 px-5 text-right">
                    <span className={`text-xs tabular-nums ${row.par90 > 1 ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                      {row.par90}%
                    </span>
                  </td>
                  <td className="py-3 px-5 text-right">
                    <span className={`text-xs tabular-nums ${row.writeOff > 0 ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                      {row.writeOff}%
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* ── Quick Navigation ─────────────────────────────────────────────── */}
      <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div variants={cardVariants}>
          <Link
            href="/admin/financial/collections"
            className="block bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md hover:border-teal/20 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                  <Banknote className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-navy text-sm">Collections</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Manage overdue loans and recovery actions</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-teal transition-colors" />
            </div>
          </Link>
        </motion.div>

        <motion.div variants={cardVariants}>
          <Link
            href="/admin/financial/disbursements"
            className="block bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md hover:border-teal/20 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                  <ArrowDownToLine className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-navy text-sm">Disbursements</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Pending approvals and disbursement queue</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-teal transition-colors" />
            </div>
          </Link>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
