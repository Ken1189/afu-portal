'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  Users,
  Landmark,
  DollarSign,
  TrendingUp,
  FileText,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  CheckCircle2,
  Clock,
  Target,
  Activity,
  Upload,
  GraduationCap,
  Truck,
  CreditCard,
  BookOpen,
  Smartphone,
  Edit,
  Award,
  LogIn,
  XCircle,
  Image as ImageIcon,
} from 'lucide-react';
// ── Inline fallback data (replaces former @/lib/data/* mock imports) ─────────

const FALLBACK_STATS = {
  totalMembers: 247,
  membersByCountry: { Botswana: 48, Zimbabwe: 112, Tanzania: 87 } as Record<string, number>,
  totalLoansDeployed: 4_200_000,
  activeLoans: 89,
  defaultRate: 2.3,
  monthlyRevenue: 127_000,
  revenueGrowth: 18.5,
  pendingApplications: 15,
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
    { label: '$10M Deployed', target: 10_000_000, current: 4_200_000, deadline: 'Q2 2027' },
    { label: '3 Countries', target: 3, current: 3, deadline: 'Q1 2026' },
    { label: 'Default Rate <5%', target: 5, current: 2.3, deadline: 'Ongoing', inverted: true },
    { label: '60% Training Rate', target: 60, current: 60.3, deadline: 'Q1 2026' },
  ],
};

interface FallbackActivity {
  id: string;
  memberId: string;
  memberName: string;
  type: string;
  description: string;
  timestamp: string;
  icon: string;
}

const FALLBACK_ACTIVITIES: FallbackActivity[] = [
  { id: 'ACT-001', memberId: 'AFU-2024-005', memberName: 'Grace Moyo', type: 'application', description: 'Submitted financing application for $45,000 working capital', timestamp: '2026-03-13T09:15:00Z', icon: 'FileText' },
  { id: 'ACT-002', memberId: 'AFU-2024-025', memberName: 'Rumbidzai Chikore', type: 'application', description: 'Submitted financing application for $6,500', timestamp: '2026-03-13T08:42:00Z', icon: 'FileText' },
  { id: 'ACT-003', memberId: 'AFU-2024-018', memberName: 'Amina Salim', type: 'document', description: 'Uploaded invoice from EuroFruit GmbH', timestamp: '2026-03-12T16:30:00Z', icon: 'Upload' },
  { id: 'ACT-004', memberId: 'AFU-2024-022', memberName: 'Farai Ndlovu', type: 'training', description: 'Completed "Drip Irrigation Setup & Management" course', timestamp: '2026-03-12T14:20:00Z', icon: 'GraduationCap' },
  { id: 'ACT-005', memberId: 'AFU-2024-033', memberName: 'Nyasha Mutasa', type: 'application', description: 'Submitted financing application for $38,000 working capital', timestamp: '2026-03-12T11:00:00Z', icon: 'FileText' },
  { id: 'ACT-006', memberId: 'AFU-2024-041', memberName: 'Baraka Mushi', type: 'contract', description: 'Logged delivery: 15,000kg sesame to Dubai Fresh Markets', timestamp: '2026-03-12T08:30:00Z', icon: 'Truck' },
  { id: 'ACT-007', memberId: 'AFU-2024-012', memberName: 'Tendai Chirwa', type: 'document', description: 'Uploaded farm photos (3 images)', timestamp: '2026-03-11T15:45:00Z', icon: 'Image' },
  { id: 'ACT-008', memberId: 'AFU-2024-003', memberName: 'John Maseko', type: 'payment', description: 'Payment of $1,800 received for loan FIN-2026-002', timestamp: '2026-03-11T10:20:00Z', icon: 'DollarSign' },
];

interface FallbackApplication {
  id: string;
  memberId: string;
  memberName: string;
  type: string;
  amount: number;
  status: string;
  submittedDate: string;
  assignedOfficer: string;
  crop: string;
}

const FALLBACK_APPLICATIONS: FallbackApplication[] = [
  { id: 'APP-2026-001', memberId: 'AFU-2024-005', memberName: 'Grace Moyo', type: 'working-capital', amount: 45000, status: 'new', submittedDate: '2026-03-11', assignedOfficer: 'Unassigned', crop: 'Blueberries' },
  { id: 'APP-2026-002', memberId: 'AFU-2024-012', memberName: 'Tendai Chirwa', type: 'input-bundle', amount: 3500, status: 'documents-review', submittedDate: '2026-03-08', assignedOfficer: 'Lebo Molefe', crop: 'Cassava' },
  { id: 'APP-2026-003', memberId: 'AFU-2024-018', memberName: 'Amina Salim', type: 'invoice-finance', amount: 78000, status: 'credit-assessment', submittedDate: '2026-03-05', assignedOfficer: 'David Nkomo', crop: 'Sesame' },
  { id: 'APP-2026-004', memberId: 'AFU-2024-003', memberName: 'John Maseko', type: 'working-capital', amount: 8000, status: 'approved', submittedDate: '2026-02-28', assignedOfficer: 'Lebo Molefe', crop: 'Sorghum' },
  { id: 'APP-2026-005', memberId: 'AFU-2024-022', memberName: 'Farai Ndlovu', type: 'equipment', amount: 12000, status: 'new', submittedDate: '2026-03-12', assignedOfficer: 'Unassigned', crop: 'Blueberries' },
  { id: 'APP-2026-006', memberId: 'AFU-2024-031', memberName: 'Halima Mwanga', type: 'working-capital', amount: 95000, status: 'documents-review', submittedDate: '2026-03-06', assignedOfficer: 'David Nkomo', crop: 'Cassava' },
  { id: 'APP-2026-007', memberId: 'AFU-2024-009', memberName: 'Kago Setshedi', type: 'input-bundle', amount: 2200, status: 'approved', submittedDate: '2026-03-01', assignedOfficer: 'Lebo Molefe', crop: 'Groundnuts' },
  { id: 'APP-2026-008', memberId: 'AFU-2024-015', memberName: 'Tinashe Gumbo', type: 'working-capital', amount: 5000, status: 'rejected', submittedDate: '2026-02-20', assignedOfficer: 'David Nkomo', crop: 'Maize' },
];

// Types for live API data
interface LiveStats {
  members: { total: number; active: number; pending: number; suspended: number; byTier: Record<string, number> };
  suppliers: { total: number; active: number; pending: number; suspended: number; totalSales: number };
  orders: { total: number; revenue: number; pending: number; completed: number };
  payments: { total: number; collected: number; pending: number };
  applications: { total: number; pending: number; approved: number; rejected: number };
  loans: { total: number; totalAmount: number; active: number; pending: number };
  products: { total: number; inStock: number };
  recentActivity: Array<{ id: string; action: string; entity_type: string; details: Record<string, string>; created_at: string }>;
}

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

// ── Icon mapping for activities ─────────────────────────────────────────────

const iconMap: Record<string, React.ReactNode> = {
  FileText: <FileText className="w-4 h-4" />,
  Upload: <Upload className="w-4 h-4" />,
  GraduationCap: <GraduationCap className="w-4 h-4" />,
  Truck: <Truck className="w-4 h-4" />,
  DollarSign: <DollarSign className="w-4 h-4" />,
  Image: <ImageIcon className="w-4 h-4" />,
  Edit: <Edit className="w-4 h-4" />,
  CheckCircle: <CheckCircle2 className="w-4 h-4" />,
  BookOpen: <BookOpen className="w-4 h-4" />,
  Smartphone: <Smartphone className="w-4 h-4" />,
  Award: <Award className="w-4 h-4" />,
  LogIn: <LogIn className="w-4 h-4" />,
  CreditCard: <CreditCard className="w-4 h-4" />,
  XCircle: <XCircle className="w-4 h-4" />,
};

// ── Activity type colors ────────────────────────────────────────────────────

const activityTypeColor: Record<string, string> = {
  application: 'bg-blue-500',
  payment: 'bg-green-500',
  document: 'bg-amber-500',
  training: 'bg-purple-500',
  login: 'bg-gray-400',
  profile: 'bg-teal',
  contract: 'bg-navy',
};

// ── Status badge colors ─────────────────────────────────────────────────────

const statusColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700',
  'documents-review': 'bg-amber-100 text-amber-700',
  'credit-assessment': 'bg-orange-100 text-orange-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  disbursed: 'bg-teal-light text-teal-dark',
};

const statusLabels: Record<string, string> = {
  new: 'New',
  'documents-review': 'Docs Review',
  'credit-assessment': 'Credit Check',
  approved: 'Approved',
  rejected: 'Rejected',
  disbursed: 'Disbursed',
};

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toLocaleString()}`;
}

function relativeTime(timestamp: string): string {
  const now = new Date('2026-03-13T12:00:00Z');
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ── Chart data ──────────────────────────────────────────────────────────────

const memberGrowthData = FALLBACK_STATS.memberGrowthLabels.map((label, i) => ({
  month: label,
  members: FALLBACK_STATS.memberGrowth[i],
}));

const loanPortfolioLast6 = FALLBACK_STATS.loanPortfolio.slice(-6);

const defaultCountryData = [
  { country: 'Zimbabwe', count: FALLBACK_STATS.membersByCountry.Zimbabwe, flag: '🇿🇼' },
  { country: 'Tanzania', count: FALLBACK_STATS.membersByCountry.Tanzania, flag: '🇹🇿' },
  { country: 'Botswana', count: FALLBACK_STATS.membersByCountry.Botswana, flag: '🇧🇼' },
];

// ── Recharts custom tooltip ─────────────────────────────────────────────────

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

export default function AdminDashboard() {
  const [selectedPipelineStage, setSelectedPipelineStage] = useState<string | null>(null);
  const [live, setLive] = useState<LiveStats | null>(null);

  // Fetch live stats from API
  useEffect(() => {
    fetch('/api/admin/stats')
      .then(res => res.json())
      .then(data => { if (!data.error) setLive(data); })
      .catch(() => { /* fallback to mock */ });
  }, []);

  // ── Country distribution — use mock fallback (API doesn't break out by country yet) ──
  const countryData = defaultCountryData;
  const maxCountryCount = Math.max(...countryData.map((c) => c.count), 1);
  const totalMemberCount = live?.members.total ?? FALLBACK_STATS.totalMembers;

  // ── Top-level stat cards data — real with mock fallback ───────────────
  const statCards = [
    {
      label: 'Total Members',
      value: (live?.members.total ?? FALLBACK_STATS.totalMembers).toString(),
      change: live ? `${live.members.active} active` : '+15%',
      changeType: 'up' as const,
      icon: <Users className="w-5 h-5" />,
      color: 'text-teal',
      bgColor: 'bg-teal-light',
    },
    {
      label: 'Active Loans',
      value: (live?.loans.active ?? FALLBACK_STATS.activeLoans).toString(),
      change: live ? `${live.loans.pending} pending` : null,
      changeType: 'neutral' as const,
      icon: <Landmark className="w-5 h-5" />,
      color: 'text-navy',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Total Deployed',
      value: formatCurrency(live?.loans.totalAmount ?? FALLBACK_STATS.totalLoansDeployed),
      change: live ? `${live.suppliers.total} suppliers` : null,
      changeType: 'neutral' as const,
      icon: <DollarSign className="w-5 h-5" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Revenue',
      value: formatCurrency(live?.orders.revenue ?? FALLBACK_STATS.monthlyRevenue),
      change: live ? `${live.orders.total} orders` : `+${FALLBACK_STATS.revenueGrowth}%`,
      changeType: 'up' as const,
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'text-teal',
      bgColor: 'bg-teal-light',
    },
    {
      label: 'Pending Applications',
      value: (live?.applications.pending ?? FALLBACK_STATS.pendingApplications).toString(),
      change: live ? `${live.applications.total} total` : null,
      changeType: 'neutral' as const,
      icon: <FileText className="w-5 h-5" />,
      color: 'text-gold',
      bgColor: 'bg-amber-50',
    },
    {
      label: 'Products',
      value: live ? `${live.products.total}` : `${FALLBACK_STATS.defaultRate}%`,
      change: live ? `${live.products.inStock} in stock` : 'Low',
      changeType: 'down' as const,
      icon: <ShieldAlert className="w-5 h-5" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
  ];

  const first8Apps = FALLBACK_APPLICATIONS.slice(0, 8);

  // Map live audit log entries to activity format, fall back to mock
  const first8Activities: FallbackActivity[] = (live?.recentActivity && live.recentActivity.length > 0)
    ? live.recentActivity.slice(0, 8).map((entry) => {
        // Choose icon based on entity type / action
        const iconName = entry.entity_type === 'application' ? 'FileText'
          : entry.entity_type === 'payment' ? 'DollarSign'
          : entry.entity_type === 'document' ? 'Upload'
          : entry.entity_type === 'training' ? 'GraduationCap'
          : entry.entity_type === 'order' ? 'Truck'
          : entry.entity_type === 'member' ? 'LogIn'
          : 'Edit';
        return {
          id: entry.id,
          memberId: (entry.details as Record<string, string>)?.member_id || '',
          memberName: (entry.details as Record<string, string>)?.member_name || 'System',
          type: entry.entity_type || 'profile',
          description: entry.action + (entry.details ? ` — ${JSON.stringify(entry.details).slice(0, 80)}` : ''),
          timestamp: entry.created_at,
          icon: iconName,
        };
      })
    : FALLBACK_ACTIVITIES.slice(0, 8);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Overview of AFU portal activity and performance
          </p>
        </div>
        <div className="text-xs text-gray-400">
          Last updated: {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════════════════════════
          1. TOP STATS ROW
      ═════════════════════════════════════════════════════════════════ */}
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
      >
        {statCards.map((stat, i) => (
          <motion.div
            key={i}
            variants={cardVariants}
            whileHover={{ y: -2, boxShadow: '0 8px 25px rgba(27,42,74,0.08)' }}
            className="bg-white rounded-xl p-4 border border-gray-100 cursor-default card-polished stat-card"
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

      {/* ══════════════════════════════════════════════════════════════════
          2. CHARTS ROW (3 columns)
      ═════════════════════════════════════════════════════════════════ */}
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* ── Member Growth Line Chart ─────────────────────────────────── */}
        <motion.div
          variants={cardVariants}
          className="bg-white rounded-xl border border-gray-100 p-5 card-polished"
        >
          <h3 className="font-semibold text-navy text-sm mb-4">Member Growth</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={memberGrowthData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="memberGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8CB89C" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8CB89C" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="members"
                  stroke="#8CB89C"
                  strokeWidth={2.5}
                  fill="url(#memberGradient)"
                  name="Members"
                  dot={{ fill: '#8CB89C', r: 3, strokeWidth: 0 }}
                  activeDot={{ fill: '#8CB89C', r: 5, strokeWidth: 2, stroke: '#fff' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* ── Revenue Breakdown Donut ──────────────────────────────────── */}
        <motion.div
          variants={cardVariants}
          className="bg-white rounded-xl border border-gray-100 p-5 card-polished"
        >
          <h3 className="font-semibold text-navy text-sm mb-4">Revenue Breakdown</h3>
          <div className="h-56 flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={FALLBACK_STATS.revenueBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="amount"
                  nameKey="source"
                  stroke="none"
                >
                  {FALLBACK_STATS.revenueBreakdown.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => formatCurrency(Number(value))}
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #f0f0f0',
                    fontSize: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  }}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: '11px' }}
                  formatter={(value: string) => <span className="text-gray-600">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* ── Loan Portfolio Stacked Bar Chart ─────────────────────────── */}
        <motion.div
          variants={cardVariants}
          className="bg-white rounded-xl border border-gray-100 p-5 card-polished"
        >
          <h3 className="font-semibold text-navy text-sm mb-4">Loan Portfolio (Last 6 Months)</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={loanPortfolioLast6} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#9CA3AF' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => formatCurrency(v)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="workingCapital" stackId="a" fill="#8CB89C" name="Working Capital" radius={[0, 0, 0, 0]} />
                <Bar dataKey="invoiceFinance" stackId="a" fill="#1B2A4A" name="Invoice Finance" />
                <Bar dataKey="equipment" stackId="a" fill="#D4A843" name="Equipment" />
                <Bar dataKey="inputBundle" stackId="a" fill="#2D4A7A" name="Input Bundle" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </motion.div>

      {/* ══════════════════════════════════════════════════════════════════
          3. APPLICATION PIPELINE
      ═════════════════════════════════════════════════════════════════ */}
      <motion.div
        variants={fadeUp}
        className="bg-white rounded-xl border border-gray-100 p-5 card-polished"
      >
        <h3 className="font-semibold text-navy text-sm mb-4">Application Pipeline</h3>
        <div className="flex items-center justify-center gap-2 overflow-x-auto py-2">
          {FALLBACK_STATS.applicationPipeline.map((stage, i) => (
            <div key={stage.stage} className="flex items-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={() =>
                  setSelectedPipelineStage(
                    selectedPipelineStage === stage.stage ? null : stage.stage
                  )
                }
                className={`flex flex-col items-center px-5 py-3 rounded-xl transition-all cursor-pointer ${
                  selectedPipelineStage === stage.stage
                    ? 'ring-2 ring-offset-1'
                    : 'hover:bg-gray-50'
                }`}
                style={{
                  // @ts-expect-error Tailwind ring-color via CSS variable
                  '--tw-ring-color': selectedPipelineStage === stage.stage ? stage.color : undefined,
                }}
              >
                <span
                  className="text-xl font-bold mb-1 tabular-nums"
                  style={{ color: stage.color }}
                >
                  {stage.count}
                </span>
                <span
                  className="text-xs font-medium px-3 py-1 rounded-full text-white whitespace-nowrap"
                  style={{ backgroundColor: stage.color }}
                >
                  {stage.stage}
                </span>
              </motion.button>
              {i < FALLBACK_STATS.applicationPipeline.length - 1 && (
                <ChevronRight className="w-5 h-5 text-gray-300 flex-shrink-0 mx-1" />
              )}
            </div>
          ))}
        </div>
        <div className="text-center mt-2">
          <span className="text-xs text-gray-400">
            {selectedPipelineStage
              ? `Viewing: ${selectedPipelineStage}`
              : 'Click a stage to highlight'}
          </span>
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════════════════════════
          4. RECENT APPLICATIONS TABLE  +  5. ACTIVITY FEED
      ═════════════════════════════════════════════════════════════════ */}
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-1 xl:grid-cols-3 gap-6"
      >
        {/* ── Recent Applications Table ────────────────────────────────── */}
        <motion.div
          variants={cardVariants}
          className="xl:col-span-2 bg-white rounded-xl border border-gray-100 overflow-hidden card-polished"
        >
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-navy text-sm">Recent Applications</h3>
            <Link
              href="/admin/applications"
              className="text-teal text-xs font-medium hover:text-teal-dark flex items-center gap-1 transition-colors"
            >
              View all <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm table-striped">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="text-left py-2.5 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="text-left py-2.5 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Member
                  </th>
                  <th className="text-left py-2.5 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Crop
                  </th>
                  <th className="text-right py-2.5 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="text-left py-2.5 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left py-2.5 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="text-left py-2.5 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Officer
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {first8Apps.map((app) => (
                  <motion.tr
                    key={app.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-cream/50 transition-colors cursor-default"
                  >
                    <td className="py-2.5 px-4 text-xs font-mono text-gray-500">{app.id}</td>
                    <td className="py-2.5 px-4">
                      <span className="font-medium text-navy text-sm">{app.memberName}</span>
                    </td>
                    <td className="py-2.5 px-4 text-gray-600 text-xs">{app.crop}</td>
                    <td className="py-2.5 px-4 text-right font-medium text-navy text-sm tabular-nums">
                      ${app.amount.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-4">
                      <span
                        className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${
                          statusColors[app.status] || 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {statusLabels[app.status] || app.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-xs text-gray-400">{app.submittedDate}</td>
                    <td className="py-2.5 px-4 text-xs text-gray-500">{app.assignedOfficer}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* ── Activity Feed ─────────────────────────────────────────────── */}
        <motion.div
          variants={cardVariants}
          className="bg-white rounded-xl border border-gray-100 overflow-hidden card-polished"
        >
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-navy text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal" />
              Activity Feed
            </h3>
            <span className="text-xs text-gray-400">Latest 8</span>
          </div>
          <div className="divide-y divide-gray-50 max-h-[440px] overflow-y-auto">
            {first8Activities.map((act) => (
              <motion.div
                key={act.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="px-4 py-3 hover:bg-cream/50 transition-colors flex items-start gap-3"
              >
                <div className="flex-shrink-0 mt-0.5 relative">
                  <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-500">
                    {iconMap[act.icon] || <FileText className="w-4 h-4" />}
                  </div>
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                      activityTypeColor[act.type] || 'bg-gray-300'
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs">
                    <span className="font-semibold text-navy">{act.memberName}</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{act.description}</p>
                  <p className="text-[10px] text-gray-400 mt-1">{relativeTime(act.timestamp)}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* ══════════════════════════════════════════════════════════════════
          6. MILESTONES / KPI TRACKER  +  7. MEMBERS BY COUNTRY
      ═════════════════════════════════════════════════════════════════ */}
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* ── Milestones / KPI Tracker ─────────────────────────────────── */}
        <motion.div
          variants={cardVariants}
          className="bg-white rounded-xl border border-gray-100 p-5 card-polished"
        >
          <h3 className="font-semibold text-navy text-sm mb-4 flex items-center gap-2">
            <Target className="w-4 h-4 text-gold" />
            Milestones &amp; KPI Tracker
          </h3>
          <div className="space-y-4">
            {FALLBACK_STATS.milestones.map((ms, i) => {
              const isCompleted = ms.inverted
                ? ms.current <= ms.target
                : ms.current >= ms.target;
              const displayPct = ms.inverted
                ? Math.min(100, Math.max(0, (1 - ms.current / (ms.target * 2)) * 100 + 50))
                : Math.min(100, (ms.current / ms.target) * 100);

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : (
                        <Clock className="w-4 h-4 text-gray-400" />
                      )}
                      <span className="text-sm font-medium text-navy">{ms.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 tabular-nums">
                        {ms.inverted
                          ? `${ms.current}% / <${ms.target}%`
                          : ms.target >= 1_000_000
                            ? `${formatCurrency(ms.current)} / ${formatCurrency(ms.target)}`
                            : `${ms.current} / ${ms.target}`}
                      </span>
                      <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">
                        {ms.deadline}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${isCompleted ? 100 : displayPct}%` }}
                      transition={{ duration: 1, delay: 0.3 + i * 0.1, ease: 'easeOut' }}
                      className={`h-2 rounded-full ${isCompleted ? 'bg-green-500' : 'bg-teal'}`}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* ── Members by Country ────────────────────────────────────────── */}
        <motion.div
          variants={cardVariants}
          className="bg-white rounded-xl border border-gray-100 p-5 card-polished"
        >
          <h3 className="font-semibold text-navy text-sm mb-4">Members by Country</h3>
          <div className="space-y-5">
            {countryData.map((c, i) => (
              <motion.div
                key={c.country}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{c.flag}</span>
                    <span className="text-sm font-medium text-navy">{c.country}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-navy tabular-nums">{c.count}</span>
                    <span className="text-xs text-gray-400">
                      ({Math.round((c.count / totalMemberCount) * 100)}%)
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(c.count / maxCountryCount) * 100}%` }}
                    transition={{ duration: 0.8, delay: 0.4 + i * 0.15, ease: 'easeOut' }}
                    className={`h-3 rounded-full ${
                      i === 0 ? 'bg-teal' : i === 1 ? 'bg-navy' : 'bg-gold'
                    }`}
                  />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Country total summary */}
          <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-400">Total across 3 countries</span>
            <span className="text-sm font-bold text-navy">{totalMemberCount} members</span>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
