'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  GraduationCap,
  CalendarClock,
  ShieldAlert,
  AlertTriangle,
  X,
  ChevronRight,
  CloudSun,
  Droplets,
  Wind,
  BarChart3,
  FileText,
  Upload,
  BookOpen,
  Truck,
  Edit,
  Award,
  Smartphone,
  LogIn,
  CheckCircle,
  CreditCard,
  XCircle,
  Image as ImageIcon,
  Wallet,
  ShoppingCart,
  ScanLine,
  FileCheck,
  Handshake,
  BadgeCheck,
  User,
  Clock,
  Sparkles,
  Activity,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { useAuth } from '@/lib/supabase/auth-context';
import { createClient } from '@/lib/supabase/client';
import { ProgramBanner } from '@/components/programs/ProgramBanner';
import OnboardingChecklist from '@/components/dashboard/OnboardingChecklist';

// ---------------------------------------------------------------------------
// Static data (inlined to remove @/lib/data/ mock imports)
// ---------------------------------------------------------------------------

const WEATHER_DATA = {
  location: 'Harare, Zimbabwe',
  current: { temp: 28, condition: 'Sunny', humidity: 45, wind: 12 },
  forecast: [
    { day: 'Today', temp: 28, condition: 'Sunny', icon: '\u2600\uFE0F' },
    { day: 'Tomorrow', temp: 26, condition: 'Partly Cloudy', icon: '\uD83C\uDF24' },
    { day: 'Thursday', temp: 22, condition: 'Rain', icon: '\uD83C\uDF27' },
    { day: 'Friday', temp: 25, condition: 'Sunny', icon: '\u2600\uFE0F' },
    { day: 'Saturday', temp: 27, condition: 'Sunny', icon: '\u2600\uFE0F' },
  ],
};

/** Fallback scalar stats used when the API hasn't responded yet. */
const FALLBACK_STATS = {
  activeLoans: 0,
  totalLoansDeployed: 0,
  revenueGrowth: 0,
  trainingCompletionRate: 0,
  defaultRate: 0,
};

/** Loan portfolio chart data (static — no live DB source yet). */
const LOAN_PORTFOLIO = [
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
];

interface CommodityPrice {
  crop: string;
  currentPrice: number;
  currency: string;
  unit: string;
  change24h: number;
  change7d: number;
  prices: number[];
  icon: string;
}

/** Market prices with sparkline data (DB format lacks sparkline/change fields). */
const MARKET_PRICES: CommodityPrice[] = [
  {
    crop: 'Blueberries', currentPrice: 12.50, currency: 'USD', unit: 'kg', change24h: 0.8, change7d: 3.2, icon: '\uD83E\uDED0',
    prices: [11.20, 11.35, 11.50, 11.40, 11.60, 11.55, 11.70, 11.80, 11.75, 11.90, 12.00, 11.95, 12.10, 12.05, 12.20, 12.15, 12.30, 12.25, 12.10, 12.20, 12.35, 12.40, 12.30, 12.45, 12.50, 12.40, 12.55, 12.60, 12.45, 12.50],
  },
  {
    crop: 'Cassava', currentPrice: 0.15, currency: 'USD', unit: 'kg', change24h: -0.3, change7d: -1.1, icon: '\uD83C\uDF3F',
    prices: [0.16, 0.16, 0.16, 0.15, 0.16, 0.16, 0.15, 0.15, 0.16, 0.15, 0.15, 0.16, 0.15, 0.15, 0.15, 0.16, 0.15, 0.15, 0.15, 0.15, 0.16, 0.15, 0.15, 0.15, 0.15, 0.15, 0.15, 0.15, 0.15, 0.15],
  },
  {
    crop: 'Sesame', currentPrice: 2.80, currency: 'USD', unit: 'kg', change24h: 0.2, change7d: 0.5, icon: '\uD83C\uDF3E',
    prices: [2.65, 2.68, 2.70, 2.67, 2.72, 2.70, 2.73, 2.75, 2.72, 2.74, 2.76, 2.73, 2.75, 2.78, 2.76, 2.74, 2.77, 2.75, 2.78, 2.76, 2.79, 2.77, 2.80, 2.78, 2.76, 2.79, 2.78, 2.80, 2.79, 2.80],
  },
  {
    crop: 'Maize', currentPrice: 0.28, currency: 'USD', unit: 'kg', change24h: 0.5, change7d: 1.8, icon: '\uD83C\uDF3D',
    prices: [0.25, 0.25, 0.26, 0.25, 0.26, 0.26, 0.26, 0.27, 0.26, 0.27, 0.27, 0.26, 0.27, 0.27, 0.27, 0.28, 0.27, 0.27, 0.28, 0.27, 0.28, 0.28, 0.27, 0.28, 0.28, 0.28, 0.28, 0.27, 0.28, 0.28],
  },
  {
    crop: 'Sorghum', currentPrice: 0.32, currency: 'USD', unit: 'kg', change24h: -0.1, change7d: 0.3, icon: '\uD83C\uDF3F',
    prices: [0.30, 0.30, 0.31, 0.30, 0.31, 0.31, 0.31, 0.31, 0.31, 0.32, 0.31, 0.31, 0.32, 0.31, 0.32, 0.32, 0.31, 0.32, 0.32, 0.32, 0.32, 0.31, 0.32, 0.32, 0.32, 0.32, 0.32, 0.32, 0.32, 0.32],
  },
  {
    crop: 'Groundnuts', currentPrice: 1.45, currency: 'USD', unit: 'kg', change24h: 0.3, change7d: 1.2, icon: '\uD83E\uDD5C',
    prices: [1.32, 1.33, 1.35, 1.34, 1.36, 1.35, 1.37, 1.36, 1.38, 1.37, 1.38, 1.39, 1.38, 1.40, 1.39, 1.40, 1.41, 1.40, 1.42, 1.41, 1.42, 1.43, 1.42, 1.43, 1.44, 1.43, 1.44, 1.45, 1.44, 1.45],
  },
];

// S2.5: Fixed column names to match DB schema
interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  created_at: string;
  is_read: boolean;
  action_url?: string;
  priority?: 'high' | 'medium' | 'low';
}

/** Fallback notifications — empty until real data loads from API. */
const FALLBACK_NOTIFICATIONS: Notification[] = [];

interface Activity {
  id: string;
  memberId: string;
  memberName: string;
  type: 'application' | 'payment' | 'document' | 'training' | 'login' | 'profile' | 'contract';
  description: string;
  timestamp: string;
  icon: string;
}

/** Recent activities — empty until audit_log integration. */
const FALLBACK_ACTIVITIES: Activity[] = [];

// Real dashboard data from API
interface DashboardData {
  profile: { full_name: string; email: string; role: string } | null;
  member: { tier: string; credit_score: number; total_spent: number; member_id: string; join_date: string } | null;
  stats: {
    totalSpent: number;
    orderCount: number;
    totalLoanAmount: number;
    totalRepaid: number;
    activeLoanCount: number;
    unreadNotifications: number;
    tier: string;
    creditScore: number;
  };
  recentOrders: Array<{ id: string; order_number: string; total: number; status: string; created_at: string }>;
  recentLoans: Array<{ id: string; loan_number: string; loan_type: string; amount: number; status: string }>;
  // S2.5: Fixed column names to match DB schema
  notifications: Array<{ id: string; title: string; body: string; type: string; is_read: boolean }>;
}

// ---------------------------------------------------------------------------
// Icon map for activities (string -> Lucide component)
// ---------------------------------------------------------------------------
const iconMap: Record<string, LucideIcon> = {
  FileText,
  Upload,
  GraduationCap,
  BookOpen,
  Truck,
  Edit,
  Award,
  Smartphone,
  LogIn,
  CheckCircle,
  CreditCard,
  XCircle,
  Image: ImageIcon,
  DollarSign,
};

// ---------------------------------------------------------------------------
// Activity type color map
// ---------------------------------------------------------------------------
const activityTypeColors: Record<string, string> = {
  application: 'bg-blue-500',
  payment: 'bg-green-500',
  document: 'bg-amber-500',
  training: 'bg-purple-500',
  login: 'bg-gray-400',
  profile: 'bg-[#5DB347]',
  contract: 'bg-indigo-500',
};

// ---------------------------------------------------------------------------
// Framer Motion variants
// ---------------------------------------------------------------------------
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut' as const,
    },
  },
};

// ---------------------------------------------------------------------------
// Helper: relative time
// ---------------------------------------------------------------------------
function relativeTime(timestamp: string): string {
  const now = new Date('2026-03-13T12:00:00Z');
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}

// ---------------------------------------------------------------------------
// Helper: format currency
// ---------------------------------------------------------------------------
function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toLocaleString()}`;
}

// ---------------------------------------------------------------------------
// Sparkline mini-component for market prices
// ---------------------------------------------------------------------------
function MiniSparkline({ data, positive }: { data: number[]; positive: boolean }) {
  const chartData = data.map((v, i) => ({ i, v }));
  return (
    <ResponsiveContainer width={80} height={30}>
      <LineChart data={chartData}>
        <Line
          type="monotone"
          dataKey="v"
          stroke={positive ? '#16a34a' : '#dc2626'}
          strokeWidth={1.5}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ---------------------------------------------------------------------------
// Custom Recharts tooltip for Loan Portfolio
// ---------------------------------------------------------------------------
function LoanTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload) return null;
  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-3 text-sm">
      <p className="font-semibold text-navy mb-2">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: entry.color }} />
            <span className="text-gray-600">{entry.name}</span>
          </span>
          <span className="font-medium text-navy">{formatCurrency(entry.value)}</span>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Dashboard
// ---------------------------------------------------------------------------
export default function DashboardPage() {
  const { profile, user } = useAuth();
  // Market prices (DB format lacks sparkline/change data needed for UI)
  const marketPrices = MARKET_PRICES;
  const [alertDismissed, setAlertDismissed] = useState(false);
  const [dashData, setDashData] = useState<DashboardData | null>(null);
  const [showProgramBanner, setShowProgramBanner] = useState(true);
  const [availablePrograms, setAvailablePrograms] = useState<{ id: string; country: string; status: string; [key: string]: unknown }[]>([]);
  const userName = profile?.full_name || user?.email?.split('@')[0] || 'Member';
  const memberRole = profile?.role || 'member';

  // Fetch real dashboard data from API
  useEffect(() => {
    fetch('/api/member/dashboard')
      .then(res => res.json())
      .then(data => { if (!data.error) setDashData(data); })
      .catch(() => { /* fallback to mock */ });
  }, []);

  // Fetch available programs for banner
  useEffect(() => {
    fetch('/api/programs')
      .then(r => r.json())
      .then(data => { setAvailablePrograms(data.programs || []); })
      .catch(() => { /* silent — banner just won't show */ });
  }, []);

  // Fetch training stats directly from Supabase
  const [trainingStats, setTrainingStats] = useState<{ completed: number; total: number }>({ completed: 0, total: 0 });
  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    (async () => {
      const { data, error } = await supabase
        .from('course_enrollments')
        .select('id, status')
        .eq('user_id', user.id);
      if (!error && data) {
        setTrainingStats({
          total: data.length,
          completed: data.filter((e: { status: string }) => e.status === 'completed').length,
        });
      }
    })();
  }, [user]);

  // Use real notifications if available, otherwise fallback
  const notifications = dashData?.notifications?.length
    ? dashData.notifications.map(n => ({ ...n, priority: n.type === 'warning' ? 'high' as const : 'medium' as const }))
    : FALLBACK_NOTIFICATIONS;

  // Unread high-priority notifications
  const urgentNotifications = useMemo(
    () => notifications.filter((n) => !n.is_read && (('priority' in n) ? n.priority === 'high' : false)),
    [notifications]
  );

  // Recent 6 activities (static until audit_log integration in Sprint 11)
  const recentActivities = useMemo(() => FALLBACK_ACTIVITIES, []);

  // First 4 market commodities
  const topCommodities = useMemo(() => marketPrices.slice(0, 4), []);

  // Greeting based on hour
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  // Profile completion — calculate from real profile data
  const profileCompletion = useMemo(() => {
    if (!dashData?.profile) return 75; // fallback
    let score = 30; // base for having an account
    if (dashData.profile.full_name) score += 15;
    if (dashData.member?.tier && dashData.member.tier !== 'new_enterprise') score += 15;
    if (dashData.member?.member_id) score += 20;
    if (dashData.stats?.creditScore > 0) score += 20;
    return Math.min(score, 100);
  }, [dashData]);

  // Use real loan data if available, otherwise static
  const recentApplications = useMemo(() => {
    if (dashData?.recentLoans?.length) {
      const statusMap: Record<string, { label: string; color: string }> = {
        draft: { label: 'Draft', color: 'bg-gray-100 text-gray-600' },
        submitted: { label: 'Submitted', color: 'bg-blue-100 text-blue-700' },
        under_review: { label: 'Under Review', color: 'bg-amber-100 text-amber-700' },
        approved: { label: 'Approved', color: 'bg-green-100 text-green-700' },
        disbursed: { label: 'Active', color: 'bg-green-100 text-green-700' },
        repaying: { label: 'Repaying', color: 'bg-[#5DB347]/10 text-[#5DB347]' },
        completed: { label: 'Completed', color: 'bg-gray-100 text-gray-600' },
        rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700' },
        defaulted: { label: 'Defaulted', color: 'bg-red-100 text-red-700' },
      };
      return dashData.recentLoans.map(l => ({
        id: l.loan_number,
        type: l.loan_type,
        amount: `$${Number(l.amount).toLocaleString()}`,
        status: statusMap[l.status]?.label || l.status,
        statusColor: statusMap[l.status]?.color || 'bg-gray-100 text-gray-600',
      }));
    }
    // No real loan data available — show empty state
    return [];
  }, [dashData]);

  // Training courses in progress
  const coursesInProgress = [
    { title: 'Export Quality Standards — EU Market', completed: 5, total: 8, category: 'Export Compliance' },
    { title: 'Post-Harvest Handling & Cold Chain', completed: 2, total: 8, category: 'Post-Harvest' },
    { title: 'Soil Health & Fertility Management', completed: 4, total: 6, category: 'Farm Management' },
  ];

  // Quick actions
  const quickActions = [
    { label: 'Apply for Finance', href: '/dashboard/financing/apply', icon: Wallet, color: 'bg-[#5DB347]/10 text-[#5DB347]' },
    { label: 'Browse Inputs', href: '/dashboard/inputs', icon: ShoppingCart, color: 'bg-blue-50 text-blue-600' },
    { label: 'Start a Course', href: '/dashboard/training', icon: BookOpen, color: 'bg-purple-50 text-purple-600' },
    { label: 'Upload Document', href: '/dashboard/documents', icon: Upload, color: 'bg-amber-50 text-amber-600' },
    { label: 'View Contracts', href: '/dashboard/offtake', icon: Handshake, color: 'bg-indigo-50 text-indigo-600' },
    { label: 'Crop Scanner', href: '/dashboard', icon: ScanLine, color: 'bg-green-50 text-green-600' },
    { label: 'EDMA Wallet', href: '/dashboard/wallet', icon: Wallet, color: 'bg-orange-50 text-[#FF4500]' },
    { label: 'Refer & Earn', href: '/dashboard/referral', icon: Activity, color: 'bg-pink-50 text-pink-600' },
  ];

  return (
    <div className="space-y-6">
      {/* S5.3: Post-onboarding checklist */}
      <OnboardingChecklist />

      {/* ----------------------------------------------------------------- */}
      {/* 0. PROGRAM BANNER */}
      {/* ----------------------------------------------------------------- */}
      {showProgramBanner && (
        <ProgramBanner
          programs={availablePrograms}
          onDismiss={() => setShowProgramBanner(false)}
        />
      )}

      {/* ----------------------------------------------------------------- */}
      {/* 1. NOTIFICATION BAR (urgent unread) */}
      {/* ----------------------------------------------------------------- */}
      {!alertDismissed && urgentNotifications.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-gradient-to-r from-amber-100 via-amber-50 to-yellow-50 border border-amber-300 rounded-xl px-4 py-3 flex items-start gap-3 shadow-sm"
        >
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-800">
              {urgentNotifications.length} urgent notification{urgentNotifications.length > 1 ? 's' : ''}
            </p>
            <p className="text-sm text-amber-700 truncate">{urgentNotifications[0].body}</p>
          </div>
          <button
            onClick={() => setAlertDismissed(true)}
            className="text-amber-500 hover:text-amber-700 transition-colors shrink-0"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* 2. WELCOME BANNER */}
      {/* ----------------------------------------------------------------- */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="relative overflow-hidden bg-gradient-to-br from-navy via-navy-light to-navy rounded-2xl p-6 md:p-8 text-white"
      >
        {/* Decorative circles */}
        <div className="absolute -right-10 -top-10 w-48 h-48 bg-white/5 rounded-full" />
        <div className="absolute -right-4 -bottom-8 w-32 h-32 bg-[#5DB347]/10 rounded-full" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold">{greeting}, {userName}</h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-sm text-gray-300">{dashData?.member?.member_id || 'Member'}</span>
                  <span className="text-gray-500">|</span>
                  <span className="inline-flex items-center gap-1 text-sm bg-gold/20 text-gold px-2 py-0.5 rounded-full font-medium">
                    <BadgeCheck className="w-3.5 h-3.5" />
                    {(dashData?.member?.tier || dashData?.stats?.tier || memberRole).replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())} Tier
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile completion */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 min-w-[220px]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-gray-300">Profile Completion</span>
              <span className="text-sm font-bold text-white">{profileCompletion}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-[#5DB347] to-gold h-2 rounded-full transition-all"
                style={{ width: `${profileCompletion}%` }}
              />
            </div>
            <Link
              href="/dashboard/profile"
              className="text-xs text-[#EBF7E5] hover:text-white transition-colors mt-1.5 inline-flex items-center gap-1"
            >
              Complete your profile <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </motion.div>

      {/* ----------------------------------------------------------------- */}
      {/* 3. STATS ROW */}
      {/* ----------------------------------------------------------------- */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
      >
        {/* Active Loans */}
        <motion.div
          variants={staggerItem}
          className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-[#5DB347]/20 transition-all card-polished stat-card"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-[#5DB347]/10 rounded-lg flex items-center justify-center">
              <FileCheck className="w-5 h-5 text-[#5DB347]" />
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
              <TrendingUp className="w-3 h-3" /> +12%
            </span>
          </div>
          <p className="text-2xl font-bold text-navy">{dashData?.stats?.activeLoanCount ?? FALLBACK_STATS.activeLoans}</p>
          <p className="text-xs text-gray-500 mt-0.5">Active Loans</p>
        </motion.div>

        {/* Total Deployed */}
        <motion.div
          variants={staggerItem}
          className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-[#5DB347]/20 transition-all card-polished stat-card"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
              <TrendingUp className="w-3 h-3" /> {dashData ? `$${(dashData.stats.totalRepaid || 0).toLocaleString()} repaid` : '—'}
            </span>
          </div>
          <p className="text-2xl font-bold text-navy">{formatCurrency(dashData?.stats?.totalLoanAmount ?? FALLBACK_STATS.totalLoansDeployed)}</p>
          <p className="text-xs text-gray-500 mt-0.5">Total Deployed</p>
        </motion.div>

        {/* Training Rate */}
        <motion.div
          variants={staggerItem}
          className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-[#5DB347]/20 transition-all card-polished stat-card"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-purple-600" />
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
              <TrendingUp className="w-3 h-3" /> On track
            </span>
          </div>
          <div className="flex items-end gap-2">
            <p className="text-2xl font-bold text-navy">{trainingStats.total > 0 ? Math.round((trainingStats.completed / trainingStats.total) * 100) : 0}%</p>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">Training Completion ({trainingStats.completed}/{trainingStats.total})</p>
          <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
            <div
              className="bg-purple-500 h-1.5 rounded-full"
              style={{ width: `${trainingStats.total > 0 ? (trainingStats.completed / trainingStats.total) * 100 : 0}%` }}
            />
          </div>
        </motion.div>

        {/* Next Payment */}
        <motion.div
          variants={staggerItem}
          className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-[#5DB347]/20 transition-all card-polished stat-card"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
              <CalendarClock className="w-5 h-5 text-amber-600" />
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
              <Clock className="w-3 h-3" /> 15 days
            </span>
          </div>
          <p className="text-2xl font-bold text-navy">Mar 28</p>
          <p className="text-xs text-gray-500 mt-0.5">Next Payment — $4,500</p>
        </motion.div>

        {/* Default Rate */}
        <motion.div
          variants={staggerItem}
          className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-[#5DB347]/20 transition-all card-polished stat-card"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-green-600" />
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
              <TrendingDown className="w-3 h-3" /> Low
            </span>
          </div>
          <p className="text-2xl font-bold text-navy">{dashData?.stats?.creditScore ? `${dashData.stats.creditScore}` : '—'}</p>
          <p className="text-xs text-gray-500 mt-0.5">Credit Score</p>
          <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
            <div
              className="bg-green-500 h-1.5 rounded-full"
              style={{ width: `${dashData?.stats?.creditScore ? Math.min((dashData.stats.creditScore / 850) * 100, 100) : 0}%` }}
            />
          </div>
        </motion.div>
      </motion.div>

      {/* ----------------------------------------------------------------- */}
      {/* 4. MAIN CONTENT GRID — 2/3 + 1/3 */}
      {/* ----------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ============ LEFT COLUMN (2/3) ============ */}
        <div className="lg:col-span-2 space-y-6">
          {/* Loan Portfolio Chart */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 card-polished"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-semibold text-navy">Loan Portfolio</h3>
                <p className="text-sm text-gray-500">12-month stacked breakdown by product type</p>
              </div>
              <div className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                <TrendingUp className="w-3.5 h-3.5" />
                Growing steadily
              </div>
            </div>
            <div className="w-full" style={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={LOAN_PORTFOLIO} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradWC" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8CB89C" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8CB89C" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradIF" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1B2A4A" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#1B2A4A" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradEQ" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D4A843" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#D4A843" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradIB" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                  <YAxis
                    tick={{ fontSize: 12, fill: '#9CA3AF' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: number) => formatCurrency(v)}
                  />
                  <Tooltip content={<LoanTooltip />} />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="workingCapital"
                    name="Working Capital"
                    stackId="1"
                    stroke="#8CB89C"
                    fill="url(#gradWC)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="invoiceFinance"
                    name="Invoice Finance"
                    stackId="1"
                    stroke="#1B2A4A"
                    fill="url(#gradIF)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="equipment"
                    name="Equipment"
                    stackId="1"
                    stroke="#D4A843"
                    fill="url(#gradEQ)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="inputBundle"
                    name="Input Bundle"
                    stackId="1"
                    stroke="#7C3AED"
                    fill="url(#gradIB)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Financing Applications List */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="bg-white rounded-xl border border-gray-100 shadow-sm card-polished"
          >
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-navy">Financing Applications</h3>
                <p className="text-sm text-gray-500">Your recent applications</p>
              </div>
              <Link
                href="/dashboard/financing/apply"
                className="text-sm font-medium text-[#5DB347] hover:text-[#449933] transition-colors inline-flex items-center gap-1"
              >
                <Sparkles className="w-4 h-4" /> New Application
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {recentApplications.map((app) => (
                <div
                  key={app.id}
                  className="px-5 py-4 flex items-center justify-between hover:bg-cream/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-[#5DB347]/10 rounded-lg flex items-center justify-center">
                      <FileText className="w-4 h-4 text-[#5DB347]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-navy">{app.type}</p>
                      <p className="text-xs text-gray-400">{app.id}</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <span className="text-sm font-semibold text-navy">{app.amount}</span>
                    <span
                      className={`inline-block text-xs px-2.5 py-1 rounded-full font-medium ${app.statusColor}`}
                    >
                      {app.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-5 py-3 border-t border-gray-100">
              <Link
                href="/dashboard/financing"
                className="text-sm font-medium text-[#5DB347] hover:text-[#449933] transition-colors inline-flex items-center gap-1"
              >
                View all applications <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </div>

        {/* ============ RIGHT COLUMN (1/3) ============ */}
        <div className="space-y-6">
          {/* Weather Widget */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 card-polished"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-navy">Weather</h3>
              <CloudSun className="w-5 h-5 text-gray-400" />
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className="text-4xl">
                {WEATHER_DATA.forecast[0].icon}
              </div>
              <div>
                <p className="text-3xl font-bold text-navy">{WEATHER_DATA.current.temp}&deg;C</p>
                <p className="text-sm text-gray-500">{WEATHER_DATA.location}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
              <span className="flex items-center gap-1">
                <Droplets className="w-3.5 h-3.5" /> {WEATHER_DATA.current.humidity}%
              </span>
              <span className="flex items-center gap-1">
                <Wind className="w-3.5 h-3.5" /> {WEATHER_DATA.current.wind} km/h
              </span>
            </div>
            <div className="border-t border-gray-100 pt-3">
              <div className="grid grid-cols-5 gap-1">
                {WEATHER_DATA.forecast.map((day) => (
                  <div key={day.day} className="text-center">
                    <p className="text-[10px] text-gray-400 mb-1">{day.day.slice(0, 3)}</p>
                    <p className="text-lg leading-none mb-1">{day.icon}</p>
                    <p className="text-xs font-semibold text-navy">{day.temp}&deg;</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Market Prices Widget */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 card-polished"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-navy">Market Prices</h3>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {topCommodities.map((commodity) => {
                const positive = commodity.change24h >= 0;
                return (
                  <div
                    key={commodity.crop}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-cream/50 transition-colors"
                  >
                    <span className="text-xl w-8 text-center shrink-0">{commodity.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-navy">{commodity.crop}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-navy">
                          ${commodity.currentPrice.toFixed(2)}/{commodity.unit}
                        </span>
                        <span
                          className={`text-[11px] font-medium ${
                            positive ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {positive ? '+' : ''}
                          {commodity.change24h.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="shrink-0">
                      <MiniSparkline data={commodity.prices} positive={positive} />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-400 text-center">Prices updated daily &bull; 30-day trend</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* 5. BOTTOM ROW — Activity Feed + Quick Actions */}
      {/* ----------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity Feed */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="bg-white rounded-xl border border-gray-100 shadow-sm card-polished"
        >
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#5DB347]" />
              <h3 className="text-base font-semibold text-navy">Recent Activity</h3>
            </div>
            <span className="text-xs text-gray-400">Last 7 days</span>
          </div>
          <div className="divide-y divide-gray-50">
            {recentActivities.map((act) => {
              const IconComp = iconMap[act.icon] || FileText;
              const dotColor = activityTypeColors[act.type] || 'bg-gray-400';
              return (
                <div key={act.id} className="px-5 py-3.5 flex items-start gap-3 hover:bg-cream/50 transition-colors">
                  <div className="relative mt-0.5">
                    <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center">
                      <IconComp className="w-4 h-4 text-gray-600" />
                    </div>
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${dotColor}`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-navy leading-snug">
                      <span className="font-medium">{act.memberName}</span>{' '}
                      <span className="text-gray-600">{act.description.charAt(0).toLowerCase() + act.description.slice(1)}</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{relativeTime(act.timestamp)}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="px-5 py-3 border-t border-gray-100 text-center">
            <button className="text-sm font-medium text-[#5DB347] hover:text-[#449933] transition-colors inline-flex items-center gap-1">
              View all activity <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* Quick Actions Grid */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 card-polished"
        >
          <div className="flex items-center gap-2 mb-5">
            <Sparkles className="w-5 h-5 text-[#5DB347]" />
            <h3 className="text-base font-semibold text-navy">Quick Actions</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {quickActions.map((action) => {
              const ActionIcon = action.icon;
              return (
                <Link
                  key={action.label}
                  href={action.href}
                  className="group flex flex-col items-center gap-2.5 p-4 rounded-xl border border-gray-100 hover:border-[#5DB347]/20 hover:shadow-md transition-all text-center card-polished"
                >
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center ${action.color} group-hover:scale-110 transition-transform`}
                  >
                    <ActionIcon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-medium text-navy group-hover:text-[#5DB347] transition-colors leading-tight">
                    {action.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* 6. TRAINING PROGRESS */}
      {/* ----------------------------------------------------------------- */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 card-polished"
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-purple-600" />
            <h3 className="text-base font-semibold text-navy">Courses In Progress</h3>
          </div>
          <Link
            href="/dashboard/training"
            className="text-sm font-medium text-[#5DB347] hover:text-[#449933] transition-colors inline-flex items-center gap-1"
          >
            All courses <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {coursesInProgress.map((course) => {
            const pct = Math.round((course.completed / course.total) * 100);
            return (
              <div
                key={course.title}
                className="rounded-xl border border-gray-100 p-4 hover:border-[#5DB347]/20 hover:shadow-sm transition-all card-polished"
              >
                <span className="inline-block text-[10px] font-semibold uppercase tracking-wider text-gray-400 bg-gray-50 px-2 py-0.5 rounded mb-2">
                  {course.category}
                </span>
                <p className="text-sm font-medium text-navy leading-snug mb-3">{course.title}</p>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                  <span>
                    {course.completed}/{course.total} modules
                  </span>
                  <span className="font-semibold text-navy">{pct}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-[#5DB347] h-2 rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* ── Referral Programme ── */}
      <ReferralCard />
    </div>
  );
}

// ── Referral Card Component ──
function ReferralCard() {
  const [referralData, setReferralData] = useState<{
    referral_code: string;
    total_referrals: number;
    total_earnings: number;
    pending_earnings: number;
    is_ambassador: boolean;
    ambassador_tier: string | null;
    share_url: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/ambassadors?action=referral-code')
      .then((res) => res.json())
      .then((data) => {
        if (data.referral_code) setReferralData(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const copyCode = () => {
    if (!referralData) return;
    navigator.clipboard.writeText(referralData.share_url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.4, ease: 'easeOut' as const }}
      className="rounded-2xl border border-[#5DB347]/20 bg-gradient-to-r from-[#EBF7E5] to-white p-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-[#5DB347] flex items-center justify-center">
              <Award className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-base font-semibold text-[#1B2A4A]">
              Refer &amp; Earn
              {referralData?.is_ambassador && (
                <span className="ml-2 text-xs px-2 py-0.5 bg-[#5DB347] text-white rounded-full">
                  {referralData.ambassador_tier ? referralData.ambassador_tier.charAt(0).toUpperCase() + referralData.ambassador_tier.slice(1) : 'Ambassador'}
                </span>
              )}
            </h3>
          </div>
          <p className="text-sm text-gray-500 max-w-md">
            Share your referral link and earn <span className="font-semibold text-[#5DB347]">10% commission</span> on every membership fee your referrals pay. The more you refer, the more you earn.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {referralData && (
            <>
              <div className="text-center px-4">
                <div className="text-xl font-bold text-[#1B2A4A]">{referralData.total_referrals}</div>
                <div className="text-[10px] text-gray-400 uppercase tracking-wider">Referrals</div>
              </div>
              <div className="text-center px-4 border-l border-gray-200">
                <div className="text-xl font-bold text-[#5DB347]">${referralData.total_earnings.toFixed(2)}</div>
                <div className="text-[10px] text-gray-400 uppercase tracking-wider">Earned</div>
              </div>
            </>
          )}
        </div>
      </div>

      {referralData && (
        <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex-1 flex items-center gap-2 bg-white rounded-xl border px-4 py-2.5">
            <span className="text-xs text-gray-400">Your link:</span>
            <span className="text-sm font-mono font-medium text-[#1B2A4A] truncate flex-1">
              {referralData.share_url}
            </span>
          </div>
          <button
            onClick={copyCode}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              copied
                ? 'bg-[#5DB347] text-white'
                : 'bg-[#1B2A4A] text-white hover:bg-[#243556]'
            }`}
          >
            {copied ? '✓ Copied!' : 'Copy Link'}
          </button>
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: 'Join African Farming Union',
                  text: 'Join AFU and access financing, insurance, training, and market access for your farm.',
                  url: referralData.share_url,
                });
              }
            }}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-[#5DB347] text-[#5DB347] hover:bg-[#5DB347] hover:text-white transition-all sm:block hidden"
          >
            Share
          </button>
        </div>
      )}

      {referralData?.pending_earnings !== undefined && referralData.pending_earnings > 0 && (
        <div className="mt-3 text-xs text-gray-500">
          💰 You have <span className="font-semibold text-[#5DB347]">${referralData.pending_earnings.toFixed(2)}</span> in pending earnings
        </div>
      )}
    </motion.div>
  );
}
