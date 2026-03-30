'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';

const AdminDashboardCharts = dynamic(
  () => import('@/components/admin/AdminDashboardCharts'),
  {
    ssr: false,
    loading: () => (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 h-72 animate-pulse">
            <div className="h-4 bg-gray-100 rounded w-32 mb-4" />
            <div className="h-56 bg-gray-50 rounded" />
          </div>
        ))}
      </div>
    ),
  }
);
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
  totalMembers: 0,
  membersByCountry: { Botswana: 0, Zimbabwe: 0, Tanzania: 0 } as Record<string, number>,
  totalLoansDeployed: 0,
  activeLoans: 0,
  defaultRate: 0,
  monthlyRevenue: 0,
  revenueGrowth: 0,
  pendingApplications: 0,
  memberGrowth: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  memberGrowthLabels: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
  loanPortfolio: [
    { month: 'Apr', workingCapital: 0, invoiceFinance: 0, equipment: 0, inputBundle: 0 },
    { month: 'May', workingCapital: 0, invoiceFinance: 0, equipment: 0, inputBundle: 0 },
    { month: 'Jun', workingCapital: 0, invoiceFinance: 0, equipment: 0, inputBundle: 0 },
    { month: 'Jul', workingCapital: 0, invoiceFinance: 0, equipment: 0, inputBundle: 0 },
    { month: 'Aug', workingCapital: 0, invoiceFinance: 0, equipment: 0, inputBundle: 0 },
    { month: 'Sep', workingCapital: 0, invoiceFinance: 0, equipment: 0, inputBundle: 0 },
    { month: 'Oct', workingCapital: 0, invoiceFinance: 0, equipment: 0, inputBundle: 0 },
    { month: 'Nov', workingCapital: 0, invoiceFinance: 0, equipment: 0, inputBundle: 0 },
    { month: 'Dec', workingCapital: 0, invoiceFinance: 0, equipment: 0, inputBundle: 0 },
    { month: 'Jan', workingCapital: 0, invoiceFinance: 0, equipment: 0, inputBundle: 0 },
    { month: 'Feb', workingCapital: 0, invoiceFinance: 0, equipment: 0, inputBundle: 0 },
    { month: 'Mar', workingCapital: 0, invoiceFinance: 0, equipment: 0, inputBundle: 0 },
  ],
  revenueBreakdown: [
    { source: 'Interest Income', amount: 0, color: '#8CB89C' },
    { source: 'Membership Fees', amount: 0, color: '#1B2A4A' },
    { source: 'Origination Fees', amount: 0, color: '#D4A843' },
    { source: 'Partner Fees', amount: 0, color: '#2D4A7A' },
    { source: 'Training Revenue', amount: 0, color: '#729E82' },
  ],
  applicationPipeline: [
    { stage: 'New', count: 0, color: '#60A5FA' },
    { stage: 'Documents Review', count: 0, color: '#FBBF24' },
    { stage: 'Credit Assessment', count: 0, color: '#F97316' },
    { stage: 'Approved', count: 0, color: '#34D399' },
    { stage: 'Disbursed', count: 0, color: '#8CB89C' },
  ],
  milestones: [
    { label: '500 Members', target: 500, current: 0, deadline: 'Q4 2026' },
    { label: '$10M Deployed', target: 10_000_000, current: 0, deadline: 'Q2 2027' },
    { label: '20 Countries', target: 20, current: 20, deadline: 'Q1 2026' },
    { label: 'Default Rate <5%', target: 5, current: 0, deadline: 'Ongoing', inverted: true },
    { label: '60% Training Rate', target: 60, current: 0, deadline: 'Q1 2026' },
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

const FALLBACK_ACTIVITIES: FallbackActivity[] = [];

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

const FALLBACK_APPLICATIONS: FallbackApplication[] = [];

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

// ═══════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function AdminDashboard() {
  const [selectedPipelineStage, setSelectedPipelineStage] = useState<string | null>(null);
  const [live, setLive] = useState<LiveStats | null>(null);
  const [realApplications, setRealApplications] = useState<FallbackApplication[] | null>(null);
  const [liveRevenue, setLiveRevenue] = useState<{ name: string; value: number }[] | null>(null);
  // liveKpis removed — stats now fetched directly from Supabase above
  const [livePortfolio, setLivePortfolio] = useState<{ month: string; disbursed: number; repaid: number }[] | null>(null);

  // Fetch live stats directly from Supabase in parallel
  useEffect(() => {
    const supabase = createClient();
    (async () => {
      try {
        const [
          membersRes,
          farmersRes,
          loansRes,
          loansDeployedRes,
          pendingAppsRes,
          totalAppsRes,
          approvedAppsRes,
          rejectedAppsRes,
          suppliersRes,
          ordersRes,
          productsRes,
          auditRes,
        ] = await Promise.all([
          // totalMembers: COUNT from profiles WHERE role != 'pending'
          supabase.from('profiles').select('id', { count: 'exact', head: true }).neq('role', 'pending'),
          // totalFarmers: COUNT from profiles WHERE role = 'farmer'
          supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'farmer'),
          // totalLoans: COUNT from loans
          supabase.from('loans').select('id', { count: 'exact', head: true }),
          // totalLoansDeployed: SUM of amount from loans WHERE status IN ('active','disbursed')
          supabase.from('loans').select('amount').in('status', ['active', 'disbursed']),
          // pendingApplications: COUNT from membership_applications WHERE status = 'pending'
          supabase.from('membership_applications').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
          // total applications
          supabase.from('membership_applications').select('id', { count: 'exact', head: true }),
          // approved applications
          supabase.from('membership_applications').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
          // rejected applications
          supabase.from('membership_applications').select('id', { count: 'exact', head: true }).eq('status', 'rejected'),
          // suppliers
          supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'supplier'),
          // orders
          supabase.from('orders').select('id, total_amount', { count: 'exact' }),
          // products
          supabase.from('products').select('id, status', { count: 'exact' }),
          // recentActivities: SELECT from audit_log ORDER BY created_at DESC LIMIT 10
          supabase.from('audit_log').select('id, action, entity_type, details, created_at').order('created_at', { ascending: false }).limit(10),
        ]);

        const totalLoansDeployed = loansDeployedRes.data
          ? loansDeployedRes.data.reduce((sum: number, l: { amount: number }) => sum + (l.amount || 0), 0)
          : FALLBACK_STATS.totalLoansDeployed;

        const activeLoansCount = loansDeployedRes.data ? loansDeployedRes.data.length : FALLBACK_STATS.activeLoans;

        const ordersRevenue = ordersRes.data
          ? ordersRes.data.reduce((sum: number, o: { total_amount: number }) => sum + (o.total_amount || 0), 0)
          : FALLBACK_STATS.monthlyRevenue;

        const productsTotal = productsRes.count ?? 0;
        const productsInStock = productsRes.data
          ? productsRes.data.filter((p: { status: string }) => p.status === 'active' || p.status === 'in_stock').length
          : 0;

        setLive({
          members: {
            total: membersRes.count ?? FALLBACK_STATS.totalMembers,
            active: farmersRes.count ?? 0,
            pending: 0,
            suspended: 0,
            byTier: {},
          },
          suppliers: {
            total: suppliersRes.count ?? 0,
            active: suppliersRes.count ?? 0,
            pending: 0,
            suspended: 0,
            totalSales: 0,
          },
          orders: {
            total: ordersRes.count ?? 0,
            revenue: ordersRevenue,
            pending: 0,
            completed: 0,
          },
          payments: { total: 0, collected: 0, pending: 0 },
          applications: {
            total: totalAppsRes.count ?? FALLBACK_STATS.pendingApplications,
            pending: pendingAppsRes.count ?? FALLBACK_STATS.pendingApplications,
            approved: approvedAppsRes.count ?? 0,
            rejected: rejectedAppsRes.count ?? 0,
          },
          loans: {
            total: loansRes.count ?? 0,
            totalAmount: totalLoansDeployed,
            active: activeLoansCount,
            pending: 0,
          },
          products: {
            total: productsTotal,
            inStock: productsInStock,
          },
          recentActivity: (auditRes.data || []) as LiveStats['recentActivity'],
        });
      } catch {
        // On any failure, live stays null and fallback data is used
      }
    })();
  }, []);

  // Fetch recent applications directly from Supabase
  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data, error } = await supabase
        .from('membership_applications')
        .select('id, status, created_at, full_name, email, country, membership_tier')
        .order('created_at', { ascending: false })
        .limit(8);
      if (!error && data && data.length > 0) {
        setRealApplications(data.map((a: Record<string, unknown>, i: number) => ({
          id: `APP-${String(i + 1).padStart(3, '0')}`,
          memberId: '',
          memberName: (a.full_name as string) || (a.email as string) || 'Unknown',
          type: (a.membership_tier as string) || 'membership',
          amount: 0,
          status: (a.status as string) || 'pending',
          submittedDate: (a.created_at as string)?.slice(0, 10) || '',
          assignedOfficer: 'Unassigned',
          crop: (a.country as string) || '',
        })));
      }
    })();
  }, []);

  // ── Country distribution — fetch real data from profiles table ──
  const [liveCountryData, setLiveCountryData] = useState<{ country: string; count: number; flag: string }[] | null>(null);
  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('country');
      if (!error && data && data.length > 0) {
        const countryFlags: Record<string, string> = {
          'Zimbabwe': '\u{1F1FF}\u{1F1FC}', 'Tanzania': '\u{1F1F9}\u{1F1FF}', 'Botswana': '\u{1F1E7}\u{1F1FC}',
          'Kenya': '\u{1F1F0}\u{1F1EA}', 'South Africa': '\u{1F1FF}\u{1F1E6}', 'Zambia': '\u{1F1FF}\u{1F1F2}',
          'Mozambique': '\u{1F1F2}\u{1F1FF}', 'Malawi': '\u{1F1F2}\u{1F1FC}', 'Namibia': '\u{1F1F3}\u{1F1E6}',
        };
        const counts: Record<string, number> = {};
        data.forEach((p: { country: string | null }) => {
          const c = p.country || 'Unknown';
          counts[c] = (counts[c] || 0) + 1;
        });
        const sorted = Object.entries(counts)
          .sort((a, b) => b[1] - a[1])
          .map(([country, count]) => ({ country, count, flag: countryFlags[country] || '\u{1F30D}' }));
        setLiveCountryData(sorted);
      }
    })();
  }, []);
  const countryData = liveCountryData ?? defaultCountryData;
  const maxCountryCount = Math.max(...countryData.map((c) => c.count), 1);
  const totalMemberCount = live?.members.total ?? FALLBACK_STATS.totalMembers;

  // ── Top-level stat cards data — real with mock fallback ───────────────
  const statCards = [
    {
      label: 'Total Members',
      value: (live?.members.total ?? FALLBACK_STATS.totalMembers).toString(),
      change: live ? `${live.members.active} active` : null,
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

  const first8Apps = realApplications ?? FALLBACK_APPLICATIONS.slice(0, 8);

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
          2. CHARTS ROW (3 columns) — lazy loaded
      ═════════════════════════════════════════════════════════════════ */}
      <AdminDashboardCharts
        memberGrowthData={memberGrowthData}
        revenueData={(liveRevenue || FALLBACK_STATS.revenueBreakdown) as Record<string, unknown>[]}
        revenueDataKey={liveRevenue ? 'value' : 'amount'}
        revenueNameKey={liveRevenue ? 'name' : 'source'}
        loanPortfolioData={(livePortfolio || loanPortfolioLast6) as Record<string, unknown>[]}
      />

      {/* ══════════════════════════════════════════════════════════════════
          3. APPLICATION PIPELINE
      ═════════════════════════════════════════════════════════════════ */}
      <motion.div
        variants={fadeUp}
        className="bg-white rounded-xl border border-gray-100 p-5 card-polished"
      >
        <h3 className="font-semibold text-navy text-sm mb-4">Application Pipeline</h3>
        <div className="flex items-center justify-center gap-2 overflow-x-auto py-2">
          {(() => {
            const pipeline = live?.applications
              ? [
                  { stage: 'New', count: live.applications.pending, color: '#60A5FA' },
                  { stage: 'Approved', count: live.applications.approved, color: '#34D399' },
                  { stage: 'Rejected', count: live.applications.rejected, color: '#F97316' },
                ]
              : FALLBACK_STATS.applicationPipeline;
            return pipeline.map((stage, i) => (
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
                {i < pipeline.length - 1 && (
                  <ChevronRight className="w-5 h-5 text-gray-300 flex-shrink-0 mx-1" />
                )}
              </div>
            ));
          })()}
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
            {[
              { label: '500 Members', target: 500, current: live?.members.total ?? FALLBACK_STATS.milestones[0].current, deadline: 'Q4 2026' },
              { label: '$10M Deployed', target: 10_000_000, current: live?.loans.totalAmount ?? FALLBACK_STATS.milestones[1].current, deadline: 'Q2 2027' },
              { label: '20 Countries', target: 20, current: FALLBACK_STATS.milestones[2].current, deadline: 'Q1 2026' },
              { label: 'Default Rate <5%', target: 5, current: FALLBACK_STATS.milestones[3].current, deadline: 'Ongoing', inverted: true },
              { label: '60% Training Rate', target: 60, current: FALLBACK_STATS.milestones[4].current, deadline: 'Q1 2026' },
            ].map((ms, i) => {
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
            <span className="text-xs text-gray-400">Total across 20 countries</span>
            <span className="text-sm font-bold text-navy">{totalMemberCount} members</span>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
