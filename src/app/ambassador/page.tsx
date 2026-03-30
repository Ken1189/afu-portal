'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  UserCheck,
  DollarSign,
  Clock,
  Award,
  Copy,
  Check,
  TrendingUp,
  ArrowUpRight,
  Zap,
} from 'lucide-react';
import { useAuth } from '@/lib/supabase/auth-context';
import { createClient } from '@/lib/supabase/client';

// ── Tier System ──────────────────────────────────────────────────────────────

const TIERS = [
  { name: 'Bronze', minReferrals: 0, color: '#CD7F32' },
  { name: 'Silver', minReferrals: 10, color: '#C0C0C0' },
  { name: 'Gold', minReferrals: 25, color: '#FFD700' },
  { name: 'Platinum', minReferrals: 50, color: '#E5E4E2' },
  { name: 'Diamond', minReferrals: 100, color: '#B9F2FF' },
];

function getTier(referralCount: number) {
  let current = TIERS[0];
  for (const tier of TIERS) {
    if (referralCount >= tier.minReferrals) current = tier;
  }
  return current;
}

function getNextTier(referralCount: number) {
  for (const tier of TIERS) {
    if (referralCount < tier.minReferrals) return tier;
  }
  return null;
}

// ── Types ────────────────────────────────────────────────────────────────────

interface CommissionEntry {
  id: string;
  amount: number;
  type: string;
  status: string;
  description: string | null;
  created_at: string;
}

interface ReferralLink {
  id: string;
  code: string;
  clicks: number;
  conversions: number;
  created_at: string;
}

interface AmbassadorPayout {
  id: string;
  amount: number;
  status: string;
  method: string | null;
  created_at: string;
}

interface DashboardStats {
  totalReferrals: number;
  activeReferrals: number;
  totalEarnings: number;
  pendingEarnings: number;
}

// ── Fallback (Demo) Data ────────────────────────────────────────────────────

const FALLBACK_COMMISSIONS: CommissionEntry[] = [
  { id: '1', type: 'membership', amount: 25, status: 'paid', created_at: '2026-03-25T10:00:00Z', description: 'John Doe membership signup' },
  { id: '2', type: 'fundraising', amount: 250, status: 'paid', created_at: '2026-03-22T14:00:00Z', description: 'Community fundraiser - Kampala' },
  { id: '3', type: 'advertising', amount: 120, status: 'pending', created_at: '2026-03-20T09:00:00Z', description: 'AgriTech Co. ad placement' },
  { id: '4', type: 'membership', amount: 25, status: 'paid', created_at: '2026-03-18T16:00:00Z', description: 'Sarah Kimani membership signup' },
  { id: '5', type: 'membership', amount: 50, status: 'pending', created_at: '2026-03-15T11:00:00Z', description: 'Cooperative Premium membership' },
  { id: '6', type: 'fundraising', amount: 100, status: 'paid', created_at: '2026-03-12T08:00:00Z', description: 'Water project fundraiser' },
  { id: '7', type: 'advertising', amount: 80, status: 'paid', created_at: '2026-03-10T13:00:00Z', description: 'Farm Supplies Ltd. ad' },
  { id: '8', type: 'membership', amount: 25, status: 'pending', created_at: '2026-03-08T15:00:00Z', description: 'Peter Obi membership signup' },
  { id: '9', type: 'fundraising', amount: 700, status: 'paid', created_at: '2026-03-05T10:00:00Z', description: 'Large-scale irrigation fundraiser' },
  { id: '10', type: 'membership', amount: 25, status: 'paid', created_at: '2026-03-01T09:00:00Z', description: 'Grace Achieng membership signup' },
];

const FALLBACK_STATS: DashboardStats = {
  totalReferrals: 34,
  activeReferrals: 28,
  totalEarnings: 4250,
  pendingEarnings: 475,
};

// ── Component ────────────────────────────────────────────────────────────────

export default function AmbassadorDashboard() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>(FALLBACK_STATS);
  const [commissions, setCommissions] = useState<CommissionEntry[]>(FALLBACK_COMMISSIONS);
  const [referralCode, setReferralCode] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Default referral code from user id until we load the real one
    const code = user.id.slice(0, 8).toUpperCase();
    setReferralCode(code);

    const supabase = createClient();

    async function fetchData() {
      try {
        // 1. Find ambassador record for this user
        const { data: ambassador, error: ambError } = await supabase
          .from('ambassadors')
          .select('*')
          .eq('user_id', user!.id)
          .single();

        if (ambError || !ambassador) {
          // No ambassador record — keep fallback data
          setLoading(false);
          return;
        }

        // Use the ambassador's stored referral code if available
        if (ambassador.referral_code) {
          setReferralCode(ambassador.referral_code);
        }

        // 2. Fetch all related data in parallel
        const [
          commissionsResult,
          referralLinksResult,
          payoutsResult,
          allCommissionsStatsResult,
        ] = await Promise.all([
          // Recent commissions for the activity list (latest 20)
          supabase
            .from('commission_entries')
            .select('id, amount, type, status, description, created_at')
            .eq('ambassador_id', ambassador.id)
            .order('created_at', { ascending: false })
            .limit(20),

          // All referral links (for total referrals count + conversion rate)
          supabase
            .from('referral_links')
            .select('id, code, clicks, conversions, created_at')
            .eq('ambassador_id', ambassador.id),

          // Payouts (for pending payout calculation)
          supabase
            .from('ambassador_payouts')
            .select('id, amount, status, method, created_at')
            .eq('ambassador_id', ambassador.id),

          // All commission entries for accurate totals (not just latest 20)
          supabase
            .from('commission_entries')
            .select('amount, status')
            .eq('ambassador_id', ambassador.id),
        ]);

        // 3. Process commission entries for the activity list
        const entries = commissionsResult.data as CommissionEntry[] | null;
        if (entries && entries.length > 0) {
          setCommissions(entries);
        }
        // If DB returns empty, FALLBACK_COMMISSIONS remain

        // 4. Compute stats from real data
        const allCommissions = allCommissionsStatsResult.data || [];
        const referralLinks = referralLinksResult.data as ReferralLink[] | null;
        const payouts = payoutsResult.data as AmbassadorPayout[] | null;

        // Total referrals = number of referral links
        const totalReferrals = referralLinks?.length || 0;

        // Active referrals = links with at least 1 conversion
        const activeReferrals = referralLinks?.filter(
          (link) => link.conversions > 0
        ).length || 0;

        // Total earned = sum of all paid commissions
        const totalEarnings = allCommissions.reduce(
          (sum: number, e: { amount: number; status: string }) =>
            e.status === 'paid' ? sum + (e.amount || 0) : sum,
          0
        );

        // Pending payout = sum of pending commissions minus any pending/completed payouts
        const pendingCommissions = allCommissions.reduce(
          (sum: number, e: { amount: number; status: string }) =>
            e.status === 'pending' ? sum + (e.amount || 0) : sum,
          0
        );

        // Also check the ambassador record's stored totals as a cross-reference
        const computedStats: DashboardStats = {
          totalReferrals: totalReferrals || (ambassador.total_referrals ?? FALLBACK_STATS.totalReferrals),
          activeReferrals: activeReferrals || FALLBACK_STATS.activeReferrals,
          totalEarnings: totalEarnings || (ambassador.total_earned ?? FALLBACK_STATS.totalEarnings),
          pendingEarnings: pendingCommissions || FALLBACK_STATS.pendingEarnings,
        };

        setStats(computedStats);
      } catch {
        // On any error, keep fallback demo data
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user]);

  const currentTier = getTier(stats.totalReferrals);
  const nextTier = getNextTier(stats.totalReferrals);
  const progressPercent = nextTier
    ? ((stats.totalReferrals - currentTier.minReferrals) / (nextTier.minReferrals - currentTier.minReferrals)) * 100
    : 100;

  const referralLink = `africanfarmingunion.org/apply?ref=${referralCode}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(`https://${referralLink}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(val);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const kpiCards = [
    { label: 'Total Referrals', value: stats.totalReferrals.toString(), icon: Users, color: 'bg-blue-50 text-blue-600' },
    { label: 'Active Referrals', value: stats.activeReferrals.toString(), icon: UserCheck, color: 'bg-green-50 text-green-600' },
    { label: 'Total Earnings', value: formatCurrency(stats.totalEarnings), icon: DollarSign, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Pending Earnings', value: formatCurrency(stats.pendingEarnings), icon: Clock, color: 'bg-amber-50 text-amber-600' },
    { label: 'Current Tier', value: currentTier.name, icon: Award, color: 'bg-purple-50 text-purple-600' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <svg className="animate-spin h-8 w-8 text-[#5DB347]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1B2A4A]">
          Welcome back, {profile?.full_name?.split(' ')[0] || 'Ambassador'}
        </h1>
        <p className="text-gray-500 text-sm mt-1">Track your referrals, commissions, and program progress.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {kpiCards.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${kpi.color}`}>
                <Icon className="w-4.5 h-4.5" />
              </div>
              <p className="text-xs text-gray-500 mb-1">{kpi.label}</p>
              <p className="text-xl font-bold text-[#1B2A4A]">{kpi.value}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Tier Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-[#5DB347]" />
            <h2 className="text-lg font-semibold text-[#1B2A4A]">Tier Progress</h2>
          </div>

          {/* Tier badges */}
          <div className="flex justify-between mb-3">
            {TIERS.map((tier) => (
              <div
                key={tier.name}
                className={`text-center ${stats.totalReferrals >= tier.minReferrals ? 'opacity-100' : 'opacity-40'}`}
              >
                <div
                  className="w-8 h-8 rounded-full mx-auto mb-1 flex items-center justify-center text-xs font-bold"
                  style={{ backgroundColor: tier.color, color: tier.name === 'Diamond' ? '#1B2A4A' : '#fff' }}
                >
                  {tier.name[0]}
                </div>
                <p className="text-[10px] text-gray-500">{tier.name}</p>
                <p className="text-[9px] text-gray-400">{tier.minReferrals}+</p>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-100 rounded-full h-3 mb-2">
            <div
              className="h-3 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(progressPercent, 100)}%`, backgroundColor: currentTier.color }}
            />
          </div>
          <p className="text-xs text-gray-500">
            {nextTier
              ? `${stats.totalReferrals} / ${nextTier.minReferrals} referrals to reach ${nextTier.name}`
              : 'You have reached the highest tier!'}
          </p>
        </motion.div>

        {/* Commission Rates */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-[#5DB347]" />
            <h2 className="text-lg font-semibold text-[#1B2A4A]">Commission Rates</h2>
          </div>
          <div className="space-y-3">
            {[
              { type: 'Membership Fees', rate: '10%', desc: 'Per new member signup' },
              { type: 'Fundraising (< $5K)', rate: '5%', desc: 'On fundraising revenue' },
              { type: 'Fundraising ($5K - $25K)', rate: '7%', desc: 'On fundraising revenue' },
              { type: 'Fundraising (> $25K)', rate: '10%', desc: 'On fundraising revenue' },
              { type: 'Advertising Revenue', rate: '10%', desc: 'On ad placements referred' },
              { type: 'Supplier Partnerships', rate: '5%', desc: 'First-year revenue share' },
            ].map((item) => (
              <div key={item.type} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-[#1B2A4A]">{item.type}</p>
                  <p className="text-xs text-gray-400">{item.desc}</p>
                </div>
                <span className="text-sm font-bold text-[#5DB347]">{item.rate}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick Share */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="bg-gradient-to-r from-[#1B2A4A] to-[#2a3f6e] rounded-2xl p-6 text-white"
      >
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-5 h-5 text-[#5DB347]" />
          <h2 className="text-lg font-semibold">Your Referral Link</h2>
        </div>
        <p className="text-sm text-gray-300 mb-4">Share this link with farmers and organizations to earn commissions on their activity.</p>
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-white/10 rounded-xl px-4 py-3 text-sm font-mono truncate">
            {referralLink}
          </div>
          <button
            onClick={handleCopy}
            className={`px-4 py-3 rounded-xl font-medium text-sm flex items-center gap-2 transition-all ${
              copied ? 'bg-green-500' : 'bg-[#5DB347] hover:bg-[#4ea03c]'
            }`}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </motion.div>

      {/* Recent Commission Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-[#5DB347]" />
            <h2 className="text-lg font-semibold text-[#1B2A4A]">Recent Commission Activity</h2>
          </div>
          <a href="/ambassador/commissions" className="text-sm text-[#5DB347] hover:underline flex items-center gap-1">
            View all <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>
        <div className="space-y-3">
          {commissions.slice(0, 10).map((entry) => (
            <div key={entry.id} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${entry.status === 'paid' ? 'bg-green-400' : 'bg-amber-400'}`} />
                <div>
                  <p className="text-sm font-medium text-[#1B2A4A]">{entry.description || 'Commission'}</p>
                  <p className="text-xs text-gray-400">{formatDate(entry.created_at)} &middot; {entry.type}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-[#1B2A4A]">{formatCurrency(entry.amount)}</p>
                <p className={`text-xs ${entry.status === 'paid' ? 'text-green-500' : 'text-amber-500'}`}>
                  {entry.status}
                </p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
