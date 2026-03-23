'use client';

import { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  Briefcase,
  BarChart3,
  Users,
  Landmark,
  CheckCircle2,
  Globe,
  ArrowUpRight,
} from 'lucide-react';
import { useAuth } from '@/lib/supabase/auth-context';
import { createClient } from '@/lib/supabase/client';

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

// Demo data fallbacks
const demoStats = {
  totalCommitted: 2500000,
  totalDeployed: 1850000,
  returnsToDate: 312000,
  activeProjects: 8,
};

const demoPlatformMetrics = {
  farmersOnboarded: 4200,
  activeLoans: 1340,
  repaymentRate: 94.2,
  countriesActive: 3,
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

function formatCurrency(val: number) {
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}K`;
  return `$${val.toFixed(0)}`;
}

function formatNumber(val: number) {
  return val.toLocaleString();
}

const typeBadgeColors: Record<string, string> = {
  report: 'bg-blue-50 text-blue-700',
  announcement: 'bg-[#EBF7E5] text-[#5DB347]',
  impact: 'bg-purple-50 text-purple-700',
  financial: 'bg-amber-50 text-amber-700',
};

export default function InvestorDashboard() {
  const { user, profile } = useAuth();
  const [investorProfile, setInvestorProfile] = useState<InvestorProfile | null>(null);
  const [updates, setUpdates] = useState<InvestorUpdate[]>(demoUpdates);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();
  const displayName = profile?.full_name || 'Investor';

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      try {
        // Fetch investor profile
        const { data: ip } = await supabase
          .from('investor_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        if (ip) setInvestorProfile(ip);

        // Fetch updates
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

  const stats = investorProfile
    ? {
        totalCommitted: investorProfile.total_committed,
        totalDeployed: investorProfile.total_deployed,
        returnsToDate: investorProfile.returns_to_date,
        activeProjects: demoStats.activeProjects,
      }
    : demoStats;

  const statCards = [
    { label: 'Total Committed', value: formatCurrency(stats.totalCommitted), icon: DollarSign, color: 'bg-[#5DB347]' },
    { label: 'Total Deployed', value: formatCurrency(stats.totalDeployed), icon: Briefcase, color: 'bg-[#1B2A4A]' },
    { label: 'Returns to Date', value: formatCurrency(stats.returnsToDate), icon: TrendingUp, color: 'bg-emerald-500' },
    { label: 'Active Projects', value: stats.activeProjects.toString(), icon: BarChart3, color: 'bg-amber-500' },
  ];

  const platformCards = [
    { label: 'Farmers Onboarded', value: formatNumber(demoPlatformMetrics.farmersOnboarded), icon: Users },
    { label: 'Active Loans', value: formatNumber(demoPlatformMetrics.activeLoans), icon: Landmark },
    { label: 'Repayment Rate', value: `${demoPlatformMetrics.repaymentRate}%`, icon: CheckCircle2 },
    { label: 'Countries Active', value: demoPlatformMetrics.countriesActive.toString(), icon: Globe },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-[#1B2A4A]">
          Welcome back, {displayName.split(' ')[0]}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Here is an overview of your investment portfolio and platform performance.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 ${s.color} rounded-xl flex items-center justify-center`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-gray-300" />
              </div>
              <p className="text-2xl font-bold text-[#1B2A4A]">{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Updates */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#1B2A4A]">Recent Updates</h2>
          <a href="/investor/updates" className="text-sm font-medium text-[#5DB347] hover:underline">
            View all
          </a>
        </div>
        <div className="space-y-3">
          {loading ? (
            <div className="bg-white rounded-2xl p-6 text-center text-gray-400 text-sm">Loading...</div>
          ) : (
            updates.slice(0, 3).map((u) => (
              <div key={u.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${typeBadgeColors[u.update_type] || 'bg-gray-100 text-gray-600'}`}>
                        {u.update_type}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(u.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <h3 className="font-semibold text-[#1B2A4A] text-sm">{u.title}</h3>
                    <p className="text-gray-500 text-xs mt-1 line-clamp-2">{u.body}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Platform Metrics */}
      <div>
        <h2 className="text-lg font-semibold text-[#1B2A4A] mb-4">Platform Metrics</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {platformCards.map((m) => {
            const Icon = m.icon;
            return (
              <div key={m.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm text-center">
                <div className="w-10 h-10 bg-[#EBF7E5] rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-5 h-5 text-[#5DB347]" />
                </div>
                <p className="text-xl font-bold text-[#1B2A4A]">{m.value}</p>
                <p className="text-xs text-gray-500 mt-1">{m.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
