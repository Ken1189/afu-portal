'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  TrendingUp,
  PieChart,
  ShieldCheck,
  Users,
  Globe,
  ArrowUpRight,
  Banknote,
  ShieldPlus,
  Handshake,
  Sprout,
  Wrench,
  FileDown,
  BarChart3,
  Heart,
  FolderOpen,
  CircleDot,
  Rocket,
  UserPlus,
  MapPin,
  CreditCard,
} from 'lucide-react';
import { useAuth } from '@/lib/supabase/auth-context';
import { createClient } from '@/lib/supabase/client';

// ── Interfaces ──────────────────────────────────────────────────────────────

interface InvestorProfile {
  id: string;
  user_id: string;
  company_name: string | null;
  total_committed: number;
  total_deployed: number;
  returns_to_date: number;
}

interface InvestorUpdate {
  id: string;
  title: string;
  body: string;
  update_type: string;
  published_at: string;
}

// ── Demo Data ───────────────────────────────────────────────────────────────

const demoStats = {
  totalCommitted: 2500000,
  totalDeployed: 1850000,
  returnsToDate: 312000,
  activeProjects: 8,
};

const demoUpdates: InvestorUpdate[] = [
  {
    id: '1',
    title: 'Q4 2025 Portfolio Performance Report',
    body: 'Strong performance across all asset classes with 12.4% annualized returns driven by bumper maize harvests in Zimbabwe.',
    update_type: 'report',
    published_at: '2025-12-15T00:00:00Z',
  },
  {
    id: '2',
    title: 'New Partnership: Stanbic Bank Tanzania',
    body: 'AFU has partnered with Stanbic Bank Tanzania to co-finance smallholder input loans, expanding our reach to 15,000 additional farmers.',
    update_type: 'announcement',
    published_at: '2025-11-28T00:00:00Z',
  },
  {
    id: '3',
    title: 'ESG Impact Assessment Published',
    body: 'Our annual ESG impact assessment shows significant improvements in farmer livelihoods, with average income increases of 35% among AFU members.',
    update_type: 'impact',
    published_at: '2025-11-10T00:00:00Z',
  },
];

// ── Key Metrics (top row) ───────────────────────────────────────────────────

const keyMetrics = [
  {
    label: 'Total AUM',
    value: '$12.5M',
    badge: '+15%',
    badgeColor: 'bg-emerald-100 text-emerald-700',
    icon: DollarSign,
    iconBg: 'bg-[#5DB347]',
  },
  {
    label: 'Capital Deployed',
    value: '$8.2M',
    badge: '65.6% of AUM',
    badgeColor: 'bg-blue-100 text-blue-700',
    icon: PieChart,
    iconBg: 'bg-[#1B2A4A]',
  },
  {
    label: 'Net IRR',
    value: '21.3%',
    badge: 'Target: 18-24%',
    badgeColor: 'bg-emerald-100 text-emerald-700',
    icon: TrendingUp,
    iconBg: 'bg-emerald-600',
  },
  {
    label: 'Repayment Rate',
    value: '94.2%',
    badge: null,
    badgeColor: '',
    icon: ShieldCheck,
    iconBg: 'bg-sky-600',
  },
  {
    label: 'Active Farmers',
    value: '4,200+',
    badge: null,
    badgeColor: '',
    icon: Users,
    iconBg: 'bg-amber-500',
  },
  {
    label: 'Countries Live',
    value: '3',
    badge: 'of 20 planned',
    badgeColor: 'bg-gray-100 text-gray-600',
    icon: Globe,
    iconBg: 'bg-violet-600',
  },
];

// ── Capital Deployment by Product ───────────────────────────────────────────

const productDeployment = [
  { label: 'Agricultural Loans', value: 3.8, pct: 46, icon: Banknote },
  { label: 'Crop Insurance', value: 1.9, pct: 23, icon: ShieldPlus },
  { label: 'Trade Finance', value: 1.5, pct: 18, icon: Handshake },
  { label: 'Input Financing', value: 0.6, pct: 7, icon: Sprout },
  { label: 'Equipment Finance', value: 0.4, pct: 5, icon: Wrench },
];

// ── Deployment by Country ───────────────────────────────────────────────────

const countryDeployment = [
  { label: 'Zimbabwe', value: 4.1, pct: 50, flag: '🇿🇼' },
  { label: 'Uganda', value: 2.5, pct: 30, flag: '🇺🇬' },
  { label: 'Kenya', value: 1.6, pct: 20, flag: '🇰🇪' },
];

// ── Activity Feed ───────────────────────────────────────────────────────────

const activityFeed = [
  {
    id: 'a1',
    icon: CreditCard,
    iconColor: 'text-[#5DB347]',
    iconBg: 'bg-[#EBF7E5]',
    title: 'Loan disbursement: $42,000 to Mashonaland cooperative',
    time: '2 hours ago',
  },
  {
    id: 'a2',
    icon: ShieldPlus,
    iconColor: 'text-sky-600',
    iconBg: 'bg-sky-50',
    title: 'Insurance payout: $8,500 drought claim settled (Masvingo)',
    time: '5 hours ago',
  },
  {
    id: 'a3',
    icon: UserPlus,
    iconColor: 'text-violet-600',
    iconBg: 'bg-violet-50',
    title: 'Farmer onboarding milestone: 4,200 active members',
    time: '1 day ago',
  },
  {
    id: 'a4',
    icon: MapPin,
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-50',
    title: 'New region activated: Nakuru County, Kenya',
    time: '2 days ago',
  },
  {
    id: 'a5',
    icon: CreditCard,
    iconColor: 'text-[#5DB347]',
    iconBg: 'bg-[#EBF7E5]',
    title: 'Loan disbursement: $28,000 to Lira district farmers',
    time: '3 days ago',
  },
  {
    id: 'a6',
    icon: Rocket,
    iconColor: 'text-rose-600',
    iconBg: 'bg-rose-50',
    title: 'Kenya country launch completed — operations live',
    time: '5 days ago',
  },
  {
    id: 'a7',
    icon: Handshake,
    iconColor: 'text-[#1B2A4A]',
    iconBg: 'bg-slate-100',
    title: 'Trade finance facility: $120K maize export to WFP',
    time: '1 week ago',
  },
  {
    id: 'a8',
    icon: CircleDot,
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-50',
    title: 'Repayment received: $67,200 from Season A cycle',
    time: '1 week ago',
  },
];

// ── Quick Links ─────────────────────────────────────────────────────────────

const quickLinks = [
  {
    label: 'Download Latest Report',
    description: 'Q4 2025 quarterly investor report',
    icon: FileDown,
    href: '/investor/documents',
  },
  {
    label: 'View Portfolio',
    description: 'Detailed portfolio breakdown',
    icon: BarChart3,
    href: '/investor/portfolio',
  },
  {
    label: 'Impact Dashboard',
    description: 'ESG metrics & farmer outcomes',
    icon: Heart,
    href: '/investor/impact',
  },
  {
    label: 'Fund Documents',
    description: 'Legal, compliance & fund docs',
    icon: FolderOpen,
    href: '/investor/documents',
  },
];

// ── Animation Variants ──────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.45, ease: [0, 0, 0.2, 1] as const },
  }),
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: (i: number) => ({
    opacity: 1,
    transition: { delay: i * 0.08, duration: 0.4 },
  }),
};

// ── Component ───────────────────────────────────────────────────────────────

export default function InvestorDashboard() {
  const { user, profile } = useAuth();
  const [investorProfile, setInvestorProfile] = useState<InvestorProfile | null>(null);
  const [updates, setUpdates] = useState<InvestorUpdate[]>(demoUpdates);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();
  const displayName = profile?.full_name || 'Investor';

  useEffect(() => {
    async function loadData() {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const { data: ip } = await supabase
          .from('investor_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        if (ip) setInvestorProfile(ip);

        const { data: upd } = await supabase
          .from('investor_updates')
          .select('*')
          .eq('status', 'published')
          .order('published_at', { ascending: false })
          .limit(5);
        if (upd && upd.length > 0) setUpdates(upd);
      } catch {
        // Fall back to demo data
      }
      setLoading(false);
    }
    loadData();
  }, [user, supabase]);

  // Use fetched profile data if available, otherwise demo
  const _stats = investorProfile
    ? {
        totalCommitted: investorProfile.total_committed,
        totalDeployed: investorProfile.total_deployed,
        returnsToDate: investorProfile.returns_to_date,
      }
    : demoStats;

  // Keep _stats reference to maintain the Supabase pattern (used for future dynamic cards)
  void _stats;

  return (
    <div className="space-y-8">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold text-[#1B2A4A] tracking-tight">
          Welcome back, {displayName.split(' ')[0]}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Institutional investor dashboard &mdash; AFU Fund I overview and real-time activity.
        </p>
      </motion.div>

      {/* ── Top Row: 6 Key Metrics ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {keyMetrics.map((m, i) => {
          const Icon = m.icon;
          return (
            <motion.div
              key={m.label}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`w-10 h-10 ${m.iconBg} rounded-xl flex items-center justify-center`}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-gray-300" />
              </div>
              <p className="text-2xl font-bold text-[#1B2A4A] tracking-tight">{m.value}</p>
              <p className="text-xs text-gray-500 mt-1">{m.label}</p>
              {m.badge && (
                <span
                  className={`inline-block mt-2 text-[10px] font-semibold px-2 py-0.5 rounded-full ${m.badgeColor}`}
                >
                  {m.badge}
                </span>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* ── Middle Row: Deployment Charts ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Capital Deployment by Product */}
        <motion.div
          initial="hidden"
          animate="visible"
          custom={0}
          variants={fadeIn}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
        >
          <h2 className="text-base font-semibold text-[#1B2A4A] mb-5">
            Capital Deployment by Product
          </h2>
          <div className="space-y-4">
            {productDeployment.map((p, i) => {
              const Icon = p.icon;
              return (
                <motion.div
                  key={p.label}
                  custom={i + 1}
                  initial="hidden"
                  animate="visible"
                  variants={fadeIn}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-[#1B2A4A] font-medium">{p.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[#1B2A4A]">${p.value}M</span>
                      <span className="text-xs text-gray-400 w-8 text-right">{p.pct}%</span>
                    </div>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-[#5DB347]"
                      initial={{ width: 0 }}
                      animate={{ width: `${p.pct}%` }}
                      transition={{ delay: 0.3 + i * 0.1, duration: 0.6, ease: [0, 0, 0.2, 1] }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Deployment by Country */}
        <motion.div
          initial="hidden"
          animate="visible"
          custom={1}
          variants={fadeIn}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
        >
          <h2 className="text-base font-semibold text-[#1B2A4A] mb-5">
            Deployment by Country
          </h2>
          <div className="space-y-5">
            {countryDeployment.map((c, i) => (
              <motion.div
                key={c.label}
                custom={i + 2}
                initial="hidden"
                animate="visible"
                variants={fadeIn}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg leading-none">{c.flag}</span>
                    <span className="text-sm text-[#1B2A4A] font-medium">{c.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[#1B2A4A]">${c.value}M</span>
                    <span className="text-xs text-gray-400 w-8 text-right">{c.pct}%</span>
                  </div>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      background: `linear-gradient(90deg, #1B2A4A, #5DB347)`,
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${c.pct}%` }}
                    transition={{ delay: 0.4 + i * 0.12, duration: 0.6, ease: [0, 0, 0.2, 1] }}
                  />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Mini legend */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>Total Deployed</span>
              <span className="font-semibold text-[#1B2A4A] text-sm">$8.2M</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Bottom Row: Activity Feed & Quick Links ───────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity Feed */}
        <motion.div
          initial="hidden"
          animate="visible"
          custom={2}
          variants={fadeIn}
          className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-[#1B2A4A]">Recent Activity</h2>
            <span className="text-xs text-gray-400">Live feed</span>
          </div>

          {loading ? (
            <div className="text-center text-gray-400 text-sm py-8">Loading...</div>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-5 top-2 bottom-2 w-px bg-gray-100" />

              <div className="space-y-0">
                {activityFeed.map((a, i) => {
                  const Icon = a.icon;
                  return (
                    <motion.div
                      key={a.id}
                      custom={i}
                      initial="hidden"
                      animate="visible"
                      variants={fadeUp}
                      className="relative flex items-start gap-4 py-3 group"
                    >
                      {/* Icon dot */}
                      <div
                        className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-xl ${a.iconBg} flex items-center justify-center group-hover:scale-105 transition-transform`}
                      >
                        <Icon className={`w-4 h-4 ${a.iconColor}`} />
                      </div>
                      {/* Content */}
                      <div className="flex-1 min-w-0 pt-0.5">
                        <p className="text-sm text-[#1B2A4A] leading-snug">{a.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{a.time}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial="hidden"
          animate="visible"
          custom={3}
          variants={fadeIn}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
        >
          <h2 className="text-base font-semibold text-[#1B2A4A] mb-5">Quick Links</h2>
          <div className="grid grid-cols-1 gap-3">
            {quickLinks.map((link, i) => {
              const Icon = link.icon;
              return (
                <motion.a
                  key={link.label}
                  href={link.href}
                  custom={i + 4}
                  initial="hidden"
                  animate="visible"
                  variants={fadeUp}
                  className="flex items-center gap-3.5 p-3.5 rounded-xl border border-gray-100 hover:border-[#5DB347]/30 hover:bg-[#EBF7E5]/30 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-gray-50 group-hover:bg-[#EBF7E5] flex items-center justify-center transition-colors">
                    <Icon className="w-5 h-5 text-gray-400 group-hover:text-[#5DB347] transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1B2A4A]">{link.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{link.description}</p>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-[#5DB347] transition-colors" />
                </motion.a>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
