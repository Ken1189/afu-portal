'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Search,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  DollarSign,
  TrendingUp,
  Calendar,
  Globe,
  Shield,
  ExternalLink,
  Eye,
  BarChart3,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Types & Demo Data                                                  */
/* ------------------------------------------------------------------ */

interface Investor {
  id: string;
  name: string;
  entity: string;
  email: string;
  phone: string;
  type: 'Individual' | 'Institutional' | 'Family Office' | 'Fund';
  status: 'Active' | 'Onboarding' | 'Inactive';
  totalInvested: number;
  currentValue: number;
  returns: number;
  joinDate: string;
  country: string;
  kycStatus: 'Verified' | 'Pending' | 'Expired';
  investments: {
    name: string;
    type: string;
    amount: number;
    irr: number;
    status: 'Active' | 'Exited';
  }[];
  lastActivity: string;
  relationshipManager: string;
}

const demoInvestors: Investor[] = [
  {
    id: '1',
    name: 'Devon Kennaird',
    entity: 'AFU Capital (Founder)',
    email: 'devonk@africanfarmingunion.org',
    phone: '+27 82 555 0101',
    type: 'Individual',
    status: 'Active',
    totalInvested: 2500000,
    currentValue: 2832500,
    returns: 13.3,
    joinDate: '2024-11-01',
    country: 'South Africa',
    kycStatus: 'Verified',
    investments: [
      { name: 'Zim Blueberry Export Program', type: 'Equity', amount: 125000, irr: 24.5, status: 'Active' },
      { name: 'Uganda Smallholder Lending Pool', type: 'Debt', amount: 500000, irr: 19.2, status: 'Active' },
      { name: 'East Africa Crop Insurance Fund', type: 'Insurance', amount: 500000, irr: 16.8, status: 'Active' },
      { name: 'Zimbabwe Maize Lending', type: 'Debt', amount: 500000, irr: 22.1, status: 'Active' },
      { name: 'Kenya Trade Finance Facility', type: 'Debt', amount: 375000, irr: 18.5, status: 'Active' },
      { name: 'Zimbabwe Input Finance', type: 'Debt', amount: 500000, irr: 20.3, status: 'Active' },
    ],
    lastActivity: '2026-03-25',
    relationshipManager: 'Peter Watson',
  },
  {
    id: '2',
    name: 'John Mitchell',
    entity: 'Meridian Capital Partners',
    email: 'john@meridiancap.com',
    phone: '+1 212 555 0142',
    type: 'Institutional',
    status: 'Onboarding',
    totalInvested: 0,
    currentValue: 0,
    returns: 0,
    joinDate: '2026-03-20',
    country: 'United States',
    kycStatus: 'Pending',
    investments: [],
    lastActivity: '2026-03-25',
    relationshipManager: 'Peter Watson',
  },
  {
    id: '3',
    name: 'Sarah Chen',
    entity: 'Pacific Rim Investments',
    email: 'sarah@pacificrim.hk',
    phone: '+852 9876 5432',
    type: 'Fund',
    status: 'Onboarding',
    totalInvested: 0,
    currentValue: 0,
    returns: 0,
    joinDate: '2026-03-18',
    country: 'Hong Kong',
    kycStatus: 'Pending',
    investments: [],
    lastActivity: '2026-03-24',
    relationshipManager: 'Peter Watson',
  },
  {
    id: '4',
    name: 'Oluwaseun Adebayo',
    entity: 'Lagos Angel Network',
    email: 'seun@lagosangels.ng',
    phone: '+234 803 555 1234',
    type: 'Institutional',
    status: 'Active',
    totalInvested: 750000,
    currentValue: 862500,
    returns: 15.0,
    joinDate: '2025-06-15',
    country: 'Nigeria',
    kycStatus: 'Verified',
    investments: [
      { name: 'Uganda Smallholder Lending Pool', type: 'Debt', amount: 250000, irr: 19.2, status: 'Active' },
      { name: 'Kenya Trade Finance Facility', type: 'Debt', amount: 250000, irr: 18.5, status: 'Active' },
      { name: 'East Africa Crop Insurance Fund', type: 'Insurance', amount: 250000, irr: 16.8, status: 'Active' },
    ],
    lastActivity: '2026-03-22',
    relationshipManager: 'Peter Watson',
  },
  {
    id: '5',
    name: 'Emma Van Der Berg',
    entity: 'Cape Agri Ventures',
    email: 'emma@capeagri.co.za',
    phone: '+27 21 555 4567',
    type: 'Family Office',
    status: 'Active',
    totalInvested: 1000000,
    currentValue: 1180000,
    returns: 18.0,
    joinDate: '2025-03-01',
    country: 'South Africa',
    kycStatus: 'Verified',
    investments: [
      { name: 'Zimbabwe Maize Lending', type: 'Debt', amount: 400000, irr: 22.1, status: 'Active' },
      { name: 'Zimbabwe Input Finance', type: 'Debt', amount: 350000, irr: 20.3, status: 'Active' },
      { name: 'Zim Blueberry Export Program', type: 'Equity', amount: 250000, irr: 24.5, status: 'Active' },
    ],
    lastActivity: '2026-03-20',
    relationshipManager: 'Peter Watson',
  },
  {
    id: '6',
    name: 'James Mwangi',
    entity: 'Nairobi Impact Fund',
    email: 'james@nairobiimpact.ke',
    phone: '+254 722 555 789',
    type: 'Fund',
    status: 'Active',
    totalInvested: 500000,
    currentValue: 575000,
    returns: 15.0,
    joinDate: '2025-09-01',
    country: 'Kenya',
    kycStatus: 'Verified',
    investments: [
      { name: 'Kenya Trade Finance Facility', type: 'Debt', amount: 300000, irr: 18.5, status: 'Active' },
      { name: 'East Africa Crop Insurance Fund', type: 'Insurance', amount: 200000, irr: 16.8, status: 'Active' },
    ],
    lastActivity: '2026-03-19',
    relationshipManager: 'Peter Watson',
  },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function fmtCurrency(val: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val);
}

const statusColors: Record<string, string> = {
  Active: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  Onboarding: 'bg-amber-50 text-amber-700 border border-amber-200',
  Inactive: 'bg-gray-100 text-gray-600 border border-gray-200',
};

const kycColors: Record<string, string> = {
  Verified: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  Pending: 'bg-amber-50 text-amber-700 border border-amber-200',
  Expired: 'bg-red-50 text-red-600 border border-red-200',
};

const typeColors: Record<string, string> = {
  Individual: 'bg-blue-50 text-blue-700 border border-blue-200',
  Institutional: 'bg-purple-50 text-purple-700 border border-purple-200',
  'Family Office': 'bg-teal-50 text-teal-700 border border-teal-200',
  Fund: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
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

export default function AllInvestorsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [dbInvestors, setDbInvestors] = useState<Investor[]>([]);
  const [dbLoading, setDbLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    async function fetchInvestors() {
      try {
        // Fetch profiles with investor role
        const { data: profiles } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'investor');
        if (profiles && profiles.length > 0) {
          // Also fetch their interests
          const profileIds = profiles.map((p: Record<string, unknown>) => p.id as string);
          const { data: interests } = await supabase
            .from('investor_interests')
            .select('*')
            .in('profile_id', profileIds);

          const mapped: Investor[] = profiles.map((p: Record<string, unknown>, idx: number) => {
            const myInterests = (interests || []).filter((i: Record<string, unknown>) => i.profile_id === p.id);
            const totalInvested = myInterests.reduce((s: number, i: Record<string, unknown>) => s + ((i.amount as number) || 0), 0);
            return {
              id: String(idx + 1),
              name: (p.full_name as string) || 'Unknown',
              entity: (p.company_name as string) || '',
              email: (p.email as string) || '',
              phone: (p.phone as string) || '',
              type: 'Individual' as const,
              status: 'Active' as const,
              totalInvested,
              currentValue: totalInvested,
              returns: 0,
              joinDate: ((p.created_at as string) || '').slice(0, 10),
              country: (p.country as string) || '',
              kycStatus: 'Pending' as const,
              investments: myInterests.map((i: Record<string, unknown>) => ({
                name: (i.opportunity as string) || (i.interest_type as string) || 'Investment',
                type: 'Debt',
                amount: (i.amount as number) || 0,
                irr: 0,
                status: 'Active' as const,
              })),
              lastActivity: ((p.updated_at as string) || '').slice(0, 10),
              relationshipManager: '',
            };
          });
          setDbInvestors(mapped);
        }
      } catch {
        // keep fallback
      } finally {
        setDbLoading(false);
      }
    }
    fetchInvestors();
  }, []);

  // Use DB data if available, otherwise fallback
  const investors = dbInvestors.length > 0 ? dbInvestors : demoInvestors;

  const filtered = investors.filter((inv) => {
    const matchesSearch =
      inv.name.toLowerCase().includes(search.toLowerCase()) ||
      inv.entity.toLowerCase().includes(search.toLowerCase()) ||
      inv.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalAUM = investors.reduce((s, i) => s + i.totalInvested, 0);
  const totalValue = investors.reduce((s, i) => s + i.currentValue, 0);
  const activeCount = investors.filter((i) => i.status === 'Active').length;
  const onboardingCount = investors.filter((i) => i.status === 'Onboarding').length;

  return (
    <motion.div className="space-y-6" variants={container} initial="hidden" animate="show">
      {/* Header */}
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">All Investors</h1>
          <p className="text-gray-500 text-sm mt-1">Manage individual investor profiles and portfolios. Super Admin only.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 text-red-700 border border-red-200 text-xs font-semibold">
            <Shield className="w-3.5 h-3.5" /> Super Admin Only
          </span>
        </div>
      </motion.div>

      {/* Summary Stats */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-9 h-9 bg-[#1B2A4A] rounded-xl flex items-center justify-center">
              <Users className="w-4 h-4 text-white" />
            </div>
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total Investors</span>
          </div>
          <p className="text-2xl font-bold text-[#1B2A4A]">{demoInvestors.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-9 h-9 bg-[#5DB347] rounded-xl flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-white" />
            </div>
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total AUM</span>
          </div>
          <p className="text-2xl font-bold text-[#1B2A4A]">{fmtCurrency(totalAUM)}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Current Value</span>
          </div>
          <p className="text-2xl font-bold text-[#1B2A4A]">{fmtCurrency(totalValue)}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-9 h-9 bg-blue-500 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Active / Onboarding</span>
          </div>
          <p className="text-2xl font-bold text-[#1B2A4A]">{activeCount} <span className="text-base text-gray-400 font-normal">/ {onboardingCount}</span></p>
        </div>
      </motion.div>

      {/* Search & Filter */}
      <motion.div variants={item} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, entity, or email..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#5DB347] focus:ring-1 focus:ring-[#5DB347]/20"
          />
        </div>
        <div className="flex gap-2">
          {['All', 'Active', 'Onboarding', 'Inactive'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                statusFilter === s
                  ? 'bg-[#1B2A4A] text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Investor Cards */}
      <motion.div variants={item} className="space-y-3">
        {filtered.map((inv) => (
          <div key={inv.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Row Header */}
            <button
              onClick={() => setExpanded(expanded === inv.id ? null : inv.id)}
              className="w-full flex items-center gap-4 p-5 text-left hover:bg-gray-50/50 transition-colors"
            >
              <div className="w-11 h-11 bg-[#1B2A4A] rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-bold">
                  {inv.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-[#1B2A4A]">{inv.name}</p>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${typeColors[inv.type]}`}>{inv.type}</span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColors[inv.status]}`}>{inv.status}</span>
                </div>
                <p className="text-sm text-gray-500 truncate">{inv.entity}</p>
              </div>
              <div className="hidden md:flex items-center gap-6 flex-shrink-0">
                <div className="text-right">
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Invested</p>
                  <p className="font-bold text-[#1B2A4A]">{fmtCurrency(inv.totalInvested)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Returns</p>
                  <p className="font-bold text-emerald-600">{inv.returns}%</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400 uppercase tracking-wide">KYC</p>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${kycColors[inv.kycStatus]}`}>{inv.kycStatus}</span>
                </div>
              </div>
              <div className="flex-shrink-0">
                {expanded === inv.id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </div>
            </button>

            {/* Expanded Detail */}
            <AnimatePresence>
              {expanded === inv.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-gray-100 p-5 bg-gray-50/30">
                    {/* Contact & Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      <div className="space-y-2">
                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Contact</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Mail className="w-3.5 h-3.5 text-gray-400" /> {inv.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Phone className="w-3.5 h-3.5 text-gray-400" /> {inv.phone}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Globe className="w-3.5 h-3.5 text-gray-400" /> {inv.country}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Account</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" /> Joined: {inv.joinDate}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Eye className="w-3.5 h-3.5 text-gray-400" /> Last active: {inv.lastActivity}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Users className="w-3.5 h-3.5 text-gray-400" /> RM: {inv.relationshipManager}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Portfolio Summary</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <DollarSign className="w-3.5 h-3.5 text-gray-400" /> Invested: {fmtCurrency(inv.totalInvested)}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <TrendingUp className="w-3.5 h-3.5 text-gray-400" /> Current Value: {fmtCurrency(inv.currentValue)}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-emerald-600 font-semibold">
                          <BarChart3 className="w-3.5 h-3.5" /> Net Return: {inv.returns}%
                        </div>
                      </div>
                    </div>

                    {/* Investments Table */}
                    {inv.investments.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Active Investments ({inv.investments.length})</h4>
                        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-gray-50/80 text-left">
                                <th className="px-4 py-2.5 text-xs font-semibold text-[#1B2A4A] uppercase tracking-wide">Investment</th>
                                <th className="px-4 py-2.5 text-xs font-semibold text-[#1B2A4A] uppercase tracking-wide">Type</th>
                                <th className="px-4 py-2.5 text-xs font-semibold text-[#1B2A4A] uppercase tracking-wide text-right">Amount</th>
                                <th className="px-4 py-2.5 text-xs font-semibold text-[#1B2A4A] uppercase tracking-wide text-right">IRR</th>
                                <th className="px-4 py-2.5 text-xs font-semibold text-[#1B2A4A] uppercase tracking-wide text-center">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {inv.investments.map((investment, idx) => (
                                <tr key={idx} className={idx % 2 === 0 ? '' : 'bg-gray-50/40'}>
                                  <td className="px-4 py-2.5 font-medium text-[#1B2A4A]">{investment.name}</td>
                                  <td className="px-4 py-2.5 text-gray-600">{investment.type}</td>
                                  <td className="px-4 py-2.5 text-right font-medium text-gray-700">{fmtCurrency(investment.amount)}</td>
                                  <td className="px-4 py-2.5 text-right font-semibold text-emerald-600">{investment.irr}%</td>
                                  <td className="px-4 py-2.5 text-center">
                                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                      {investment.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {inv.investments.length === 0 && (
                      <div className="bg-white rounded-xl border border-gray-100 p-6 text-center text-gray-400 text-sm">
                        No investments yet. Investor is still in onboarding.
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
                      <a
                        href={`mailto:${inv.email}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-[#1B2A4A] text-white hover:bg-[#243656] transition-colors"
                      >
                        <Mail className="w-3.5 h-3.5" /> Email Investor
                      </a>
                      <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
                        <ExternalLink className="w-3.5 h-3.5" /> View Portal
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No investors match your search.</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
