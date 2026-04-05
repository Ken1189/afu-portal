'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Users, DollarSign, TrendingUp, Globe, Filter, Download, Search,
  ArrowLeftRight, Shield, Award, CreditCard, Package, BarChart3,
  Calendar, ChevronDown, Loader2, RefreshCw,
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

/* ─── Types ─── */

type TabKey = 'members' | 'applications' | 'financial' | 'trading';
type DateRange = '7d' | '30d' | '90d' | '365d' | 'all';

interface MemberRow { id: string; profile_id: string; tier: string; status: string; created_at: string }
interface AppRow { id: string; full_name: string; email: string; country: string; requested_tier: string; status: string; phone: string | null; created_at: string }
interface PaymentRow { id: string; amount: number; currency: string; status: string; type: string; created_at: string }
interface TradeRow { id: string; order_number: string; order_type: string; commodity: string; quantity: number; target_price: number; country: string; status: string; created_at: string }
interface AmbassadorRow { id: string; full_name: string; country: string; status: string; created_at: string }

const CHART_COLORS = ['#5DB347', '#1B2A4A', '#3B82F6', '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4', '#EC4899', '#10B981', '#D97706'];
const TIER_LABELS: Record<string, string> = { free: 'Free', smallholder: 'Smallholder', farmer_grower: 'Farmer Grower', commercial: 'Commercial', enterprise: 'Enterprise', partner: 'Partner', ambassador: 'Ambassador' };
const DATE_LABELS: Record<DateRange, string> = { '7d': 'Last 7 days', '30d': 'Last 30 days', '90d': 'Last 90 days', '365d': 'Last year', all: 'All time' };

function getDateFrom(range: DateRange): string | null {
  if (range === 'all') return null;
  const d = new Date();
  const days = range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : 365;
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function formatCurrency(n: number) { return `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`; }

/* ─── Component ─── */

export default function AdminAnalyticsPage() {
  const supabase = useMemo(() => createClient(), []);

  const [tab, setTab] = useState<TabKey>('members');
  const [dateRange, setDateRange] = useState<DateRange>('90d');
  const [countryFilter, setCountryFilter] = useState('all');
  const [tierFilter, setTierFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Data
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [applications, setApplications] = useState<AppRow[]>([]);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [trades, setTrades] = useState<TradeRow[]>([]);
  const [ambassadors, setAmbassadors] = useState<AmbassadorRow[]>([]);
  const [countries, setCountries] = useState<string[]>([]);
  const [profiles, setProfiles] = useState<{ id: string; country: string | null; role: string; created_at: string }[]>([]);

  // Fetch all data
  const fetchData = useCallback(async () => {
    setLoading(true);
    const dateFrom = getDateFrom(dateRange);
    const wrap = (p: PromiseLike<unknown>) => Promise.resolve(p).catch(() => ({ data: null }));

    const [memRes, appRes, payRes, trdRes, ambRes, profRes] = await Promise.all([
      wrap(supabase.from('members').select('id, profile_id, tier, status, created_at').order('created_at', { ascending: false })),
      wrap(dateFrom
        ? supabase.from('membership_applications').select('id, full_name, email, country, requested_tier, status, phone, created_at').gte('created_at', dateFrom).order('created_at', { ascending: false })
        : supabase.from('membership_applications').select('id, full_name, email, country, requested_tier, status, phone, created_at').order('created_at', { ascending: false })
      ),
      wrap(supabase.from('payments').select('id, amount, currency, status, type, created_at').order('created_at', { ascending: false }).limit(500)),
      wrap(supabase.from('trade_orders').select('id, order_number, order_type, commodity, quantity, target_price, country, status, created_at').order('created_at', { ascending: false }).limit(500)),
      wrap(supabase.from('ambassadors').select('id, full_name, country, status, created_at').order('created_at', { ascending: false })),
      wrap(supabase.from('profiles').select('id, country, role, created_at').order('created_at', { ascending: false })),
    ]) as { data: unknown }[];

    setMembers((memRes.data || []) as MemberRow[]);
    setApplications((appRes.data || []) as AppRow[]);
    setPayments((payRes.data || []) as PaymentRow[]);
    setTrades((trdRes.data || []) as TradeRow[]);
    setAmbassadors((ambRes.data || []) as AmbassadorRow[]);
    setProfiles((profRes.data || []) as typeof profiles);

    // Extract unique countries from ALL data sources
    const allCountries = new Set<string>();
    ((appRes.data || []) as AppRow[]).forEach(a => { if (a.country) allCountries.add(a.country); });
    ((trdRes.data || []) as TradeRow[]).forEach(t => { if (t.country) allCountries.add(t.country); });
    ((profRes.data || []) as typeof profiles).forEach(p => { if (p.country) allCountries.add(p.country); });
    ((ambRes.data || []) as AmbassadorRow[]).forEach(a => { if (a.country) allCountries.add(a.country); });
    // Also add the AFU core countries in case data is sparse
    ['Botswana', 'Ghana', 'Kenya', 'Mozambique', 'Nigeria', 'Sierra Leone', 'South Africa', 'Tanzania', 'Uganda', 'Zambia', 'Zimbabwe'].forEach(c => allCountries.add(c));
    setCountries([...allCountries].sort());

    setLoading(false);
  }, [supabase, dateRange]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Filtered data ──
  const filteredApps = useMemo(() => {
    let list = applications;
    if (countryFilter !== 'all') list = list.filter(a => a.country === countryFilter);
    if (tierFilter !== 'all') list = list.filter(a => a.requested_tier === tierFilter);
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(a => a.full_name?.toLowerCase().includes(q) || a.email?.toLowerCase().includes(q) || a.country?.toLowerCase().includes(q));
    }
    return list;
  }, [applications, countryFilter, tierFilter, searchTerm]);

  const filteredTrades = useMemo(() => {
    let list = trades;
    if (countryFilter !== 'all') list = list.filter(t => t.country === countryFilter);
    return list;
  }, [trades, countryFilter]);

  // ── Computed stats ──

  // Members
  const membersByTier = useMemo(() => {
    const map: Record<string, number> = {};
    members.forEach(m => { map[m.tier] = (map[m.tier] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name: TIER_LABELS[name] || name, value })).sort((a, b) => b.value - a.value);
  }, [members]);

  const membersByStatus = useMemo(() => {
    const map: Record<string, number> = {};
    members.forEach(m => { map[m.status] = (map[m.status] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [members]);

  // Applications
  const appsByCountry = useMemo(() => {
    const map: Record<string, number> = {};
    filteredApps.forEach(a => { if (a.country) map[a.country] = (map[a.country] || 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }));
  }, [filteredApps]);

  const appsByTier = useMemo(() => {
    const map: Record<string, number> = {};
    filteredApps.forEach(a => { map[a.requested_tier] = (map[a.requested_tier] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name: TIER_LABELS[name] || name, value })).sort((a, b) => b.value - a.value);
  }, [filteredApps]);

  const appsByStatus = useMemo(() => {
    const map: Record<string, number> = {};
    filteredApps.forEach(a => { map[a.status] = (map[a.status] || 0) + 1; });
    return map;
  }, [filteredApps]);

  const appsByMonth = useMemo(() => {
    const map: Record<string, { applied: number; approved: number; rejected: number }> = {};
    filteredApps.forEach(a => {
      const m = new Date(a.created_at).toLocaleDateString('en', { month: 'short', year: '2-digit' });
      if (!map[m]) map[m] = { applied: 0, approved: 0, rejected: 0 };
      map[m].applied += 1;
      if (a.status === 'approved') map[m].approved += 1;
      if (a.status === 'rejected') map[m].rejected += 1;
    });
    return Object.entries(map).map(([month, v]) => ({ month, ...v }));
  }, [filteredApps]);

  // Trading
  const tradesByComm = useMemo(() => {
    const map: Record<string, number> = {};
    filteredTrades.forEach(t => { map[t.commodity] = (map[t.commodity] || 0) + t.target_price * t.quantity; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([name, value]) => ({ name, value: Math.round(value) }));
  }, [filteredTrades]);

  const tradesByCountry = useMemo(() => {
    const map: Record<string, number> = {};
    filteredTrades.forEach(t => { if (t.country) map[t.country] = (map[t.country] || 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }));
  }, [filteredTrades]);

  const tradesByStatus = useMemo(() => {
    const map: Record<string, number> = {};
    filteredTrades.forEach(t => { map[t.status] = (map[t.status] || 0) + 1; });
    return map;
  }, [filteredTrades]);

  const totalTradeVolume = filteredTrades.reduce((s, t) => s + t.target_price * t.quantity, 0);

  // CSV export
  const exportCSV = (data: Record<string, unknown>[], filename: string) => {
    if (!data.length) return;
    const headers = Object.keys(data[0]);
    const rows = data.map(r => headers.map(h => JSON.stringify(r[h] ?? '')).join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Tabs ──
  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: 'members', label: 'Members', icon: <Users className="w-4 h-4" /> },
    { key: 'applications', label: 'Applications', icon: <Package className="w-4 h-4" /> },
    { key: 'financial', label: 'Financial', icon: <DollarSign className="w-4 h-4" /> },
    { key: 'trading', label: 'Trading', icon: <ArrowLeftRight className="w-4 h-4" /> },
  ];

  // ── KPI cards ──
  const kpis = [
    { label: 'Total Members', value: members.length.toString(), icon: <Users className="w-5 h-5 text-[#5DB347]" /> },
    { label: 'Applications', value: applications.length.toString(), sub: `${appsByStatus.pending || 0} pending`, icon: <Package className="w-5 h-5 text-blue-500" /> },
    { label: 'Ambassadors', value: ambassadors.filter(a => a.status === 'active').length.toString(), icon: <Award className="w-5 h-5 text-amber-500" /> },
    { label: 'Trade Volume', value: formatCurrency(totalTradeVolume), sub: `${trades.length} orders`, icon: <ArrowLeftRight className="w-5 h-5 text-purple-500" /> },
    { label: 'Countries', value: countries.length.toString(), icon: <Globe className="w-5 h-5 text-teal-500" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">Analytics</h1>
          <p className="text-sm text-gray-500">Deep-dive into your platform data</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchData} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"><RefreshCw className="w-4 h-4" /></button>
        </div>
      </div>

      {/* ── Filters Bar ── */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 flex flex-wrap gap-3 items-center">
        <Filter className="w-4 h-4 text-gray-400" />

        {/* Date range */}
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <select value={dateRange} onChange={e => setDateRange(e.target.value as DateRange)} className="pl-9 pr-8 py-2 border border-gray-200 rounded-lg text-sm appearance-none bg-white cursor-pointer focus:ring-2 focus:ring-[#5DB347]">
            {Object.entries(DATE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
        </div>

        {/* Country */}
        <div className="relative">
          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <select value={countryFilter} onChange={e => setCountryFilter(e.target.value)} className="pl-9 pr-8 py-2 border border-gray-200 rounded-lg text-sm appearance-none bg-white cursor-pointer focus:ring-2 focus:ring-[#5DB347]">
            <option value="all">All Countries</option>
            {countries.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
        </div>

        {/* Tier */}
        <div className="relative">
          <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <select value={tierFilter} onChange={e => setTierFilter(e.target.value)} className="pl-9 pr-8 py-2 border border-gray-200 rounded-lg text-sm appearance-none bg-white cursor-pointer focus:ring-2 focus:ring-[#5DB347]">
            <option value="all">All Tiers</option>
            {Object.entries(TIER_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
        </div>

        {/* Search */}
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search name, email, country..." className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]" />
        </div>

        {(countryFilter !== 'all' || tierFilter !== 'all' || searchTerm) && (
          <button onClick={() => { setCountryFilter('all'); setTierFilter('all'); setSearchTerm(''); }} className="text-xs text-gray-500 hover:text-red-500 px-2 py-1">Clear filters</button>
        )}
      </div>

      {/* ── KPI Row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {kpis.map(k => (
          <div key={k.label} className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-500">{k.label}</span>
              {k.icon}
            </div>
            <p className="text-2xl font-bold text-[#1B2A4A]">{loading ? '—' : k.value}</p>
            {k.sub && <p className="text-xs text-gray-400 mt-1">{k.sub}</p>}
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl overflow-x-auto">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${tab === t.key ? 'bg-white text-[#1B2A4A] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-[#5DB347]" /></div>
      )}

      {/* ═══ MEMBERS TAB ═══ */}
      {!loading && tab === 'members' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tier distribution pie */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-semibold text-[#1B2A4A] mb-4">Members by Tier</h3>
              {membersByTier.length === 0 ? <p className="text-sm text-gray-400 py-8 text-center">No members yet</p> : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={membersByTier} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                        {membersByTier.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Status breakdown */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-semibold text-[#1B2A4A] mb-4">Member Status</h3>
              {membersByStatus.length === 0 ? <p className="text-sm text-gray-400 py-8 text-center">No data</p> : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={membersByStatus}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#5DB347" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Ambassador stats */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 lg:col-span-2">
              <h3 className="font-semibold text-[#1B2A4A] mb-4">Ambassadors by Country</h3>
              {ambassadors.length === 0 ? <p className="text-sm text-gray-400 py-8 text-center">No ambassadors yet</p> : (
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                  {Object.entries(ambassadors.reduce((m: Record<string, { total: number; active: number }>, a) => {
                    if (!m[a.country]) m[a.country] = { total: 0, active: 0 };
                    m[a.country].total += 1;
                    if (a.status === 'active') m[a.country].active += 1;
                    return m;
                  }, {})).sort((a, b) => b[1].total - a[1].total).map(([country, stats]) => (
                    <div key={country} className="bg-gray-50 rounded-lg p-3 text-center">
                      <p className="text-sm font-medium text-[#1B2A4A]">{country}</p>
                      <p className="text-xl font-bold text-[#5DB347]">{stats.total}</p>
                      <p className="text-xs text-gray-400">{stats.active} active</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══ APPLICATIONS TAB ═══ */}
      {!loading && tab === 'applications' && (
        <div className="space-y-6">
          {/* Status summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total', value: filteredApps.length, color: 'text-[#1B2A4A]' },
              { label: 'Pending', value: appsByStatus.pending || 0, color: 'text-amber-600' },
              { label: 'Approved', value: appsByStatus.approved || 0, color: 'text-green-600' },
              { label: 'Rejected', value: appsByStatus.rejected || 0, color: 'text-red-500' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4 text-center">
                <p className="text-xs font-medium text-gray-500">{s.label}</p>
                <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* By country */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-[#1B2A4A]">Applications by Country</h3>
                <button onClick={() => exportCSV(appsByCountry as Record<string, unknown>[], 'apps-by-country')} className="text-xs text-gray-400 hover:text-gray-600"><Download className="w-3.5 h-3.5" /></button>
              </div>
              {appsByCountry.length === 0 ? <p className="text-sm text-gray-400 py-8 text-center">No data</p> : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={appsByCountry} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis type="number" tick={{ fontSize: 11 }} />
                      <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={100} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#5DB347" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* By tier */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-semibold text-[#1B2A4A] mb-4">Applications by Tier</h3>
              {appsByTier.length === 0 ? <p className="text-sm text-gray-400 py-8 text-center">No data</p> : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={appsByTier} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                        {appsByTier.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 lg:col-span-2">
              <h3 className="font-semibold text-[#1B2A4A] mb-4">Application Timeline</h3>
              {appsByMonth.length === 0 ? <p className="text-sm text-gray-400 py-8 text-center">No data</p> : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={appsByMonth}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="applied" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Applied" />
                      <Bar dataKey="approved" fill="#5DB347" radius={[4, 4, 0, 0]} name="Approved" />
                      <Bar dataKey="rejected" fill="#EF4444" radius={[4, 4, 0, 0]} name="Rejected" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          {/* Application table */}
          <div className="bg-white rounded-2xl border border-gray-100">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-[#1B2A4A]">All Applications ({filteredApps.length})</h3>
              <button onClick={() => exportCSV(filteredApps as unknown as Record<string, unknown>[], 'applications')} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700"><Download className="w-3.5 h-3.5" /> Export CSV</button>
            </div>
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-gray-50">
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2.5 px-4 text-xs font-medium text-gray-500">Name</th>
                    <th className="text-left py-2.5 px-4 text-xs font-medium text-gray-500">Email</th>
                    <th className="text-left py-2.5 px-4 text-xs font-medium text-gray-500">Country</th>
                    <th className="text-left py-2.5 px-4 text-xs font-medium text-gray-500">Tier</th>
                    <th className="text-left py-2.5 px-4 text-xs font-medium text-gray-500">Status</th>
                    <th className="text-left py-2.5 px-4 text-xs font-medium text-gray-500">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredApps.slice(0, 100).map(a => (
                    <tr key={a.id} className="hover:bg-gray-50">
                      <td className="py-2.5 px-4 font-medium text-[#1B2A4A]">{a.full_name}</td>
                      <td className="py-2.5 px-4 text-gray-500 text-xs">{a.email}</td>
                      <td className="py-2.5 px-4 text-gray-500">{a.country}</td>
                      <td className="py-2.5 px-4"><span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{TIER_LABELS[a.requested_tier] || a.requested_tier}</span></td>
                      <td className="py-2.5 px-4"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${a.status === 'approved' ? 'bg-green-100 text-green-700' : a.status === 'rejected' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700'}`}>{a.status}</span></td>
                      <td className="py-2.5 px-4 text-gray-400 text-xs">{new Date(a.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ═══ FINANCIAL TAB ═══ */}
      {!loading && tab === 'financial' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
              <p className="text-xs font-medium text-gray-500">Total Payments</p>
              <p className="text-3xl font-bold text-[#1B2A4A]">{payments.length}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
              <p className="text-xs font-medium text-gray-500">Total Revenue</p>
              <p className="text-3xl font-bold text-[#5DB347]">{formatCurrency(payments.filter(p => p.status === 'completed').reduce((s, p) => s + (p.amount || 0), 0))}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
              <p className="text-xs font-medium text-gray-500">Pending</p>
              <p className="text-3xl font-bold text-amber-600">{payments.filter(p => p.status === 'pending').length}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[#1B2A4A]">Recent Payments</h3>
              <button onClick={() => exportCSV(payments as unknown as Record<string, unknown>[], 'payments')} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700"><Download className="w-3.5 h-3.5" /> Export CSV</button>
            </div>
            {payments.length === 0 ? <p className="text-sm text-gray-400 py-8 text-center">No payment data yet</p> : (
              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-gray-50">
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-2.5 px-4 text-xs font-medium text-gray-500">Date</th>
                      <th className="text-right py-2.5 px-4 text-xs font-medium text-gray-500">Amount</th>
                      <th className="text-left py-2.5 px-4 text-xs font-medium text-gray-500">Type</th>
                      <th className="text-left py-2.5 px-4 text-xs font-medium text-gray-500">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {payments.slice(0, 50).map(p => (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="py-2.5 px-4 text-gray-500 text-xs">{new Date(p.created_at).toLocaleDateString()}</td>
                        <td className="py-2.5 px-4 text-right font-medium">{p.currency || 'USD'} {p.amount?.toLocaleString()}</td>
                        <td className="py-2.5 px-4 text-gray-500">{p.type || 'payment'}</td>
                        <td className="py-2.5 px-4"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{p.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══ TRADING TAB ═══ */}
      {!loading && tab === 'trading' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
              <p className="text-xs font-medium text-gray-500">Total Orders</p>
              <p className="text-3xl font-bold text-[#1B2A4A]">{filteredTrades.length}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
              <p className="text-xs font-medium text-gray-500">Trade Volume</p>
              <p className="text-3xl font-bold text-[#5DB347]">{formatCurrency(totalTradeVolume)}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
              <p className="text-xs font-medium text-gray-500">Open</p>
              <p className="text-3xl font-bold text-blue-600">{tradesByStatus.open || 0}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
              <p className="text-xs font-medium text-gray-500">Completed</p>
              <p className="text-3xl font-bold text-green-600">{tradesByStatus.completed || 0}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* By commodity */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-semibold text-[#1B2A4A] mb-4">Volume by Commodity (USD)</h3>
              {tradesByComm.length === 0 ? <p className="text-sm text-gray-400 py-8 text-center">No trades</p> : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={tradesByComm} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
                      <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={80} />
                      <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                      <Bar dataKey="value" fill="#5DB347" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* By country */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-semibold text-[#1B2A4A] mb-4">Orders by Country</h3>
              {tradesByCountry.length === 0 ? <p className="text-sm text-gray-400 py-8 text-center">No trades</p> : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={tradesByCountry}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" height={60} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]}>
                        {tradesByCountry.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          {/* Trades table */}
          <div className="bg-white rounded-2xl border border-gray-100">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-[#1B2A4A]">Trade Orders ({filteredTrades.length})</h3>
              <button onClick={() => exportCSV(filteredTrades as unknown as Record<string, unknown>[], 'trades')} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700"><Download className="w-3.5 h-3.5" /> Export CSV</button>
            </div>
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-gray-50">
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2.5 px-4 text-xs font-medium text-gray-500">Order #</th>
                    <th className="text-left py-2.5 px-4 text-xs font-medium text-gray-500">Type</th>
                    <th className="text-left py-2.5 px-4 text-xs font-medium text-gray-500">Commodity</th>
                    <th className="text-right py-2.5 px-4 text-xs font-medium text-gray-500">Qty</th>
                    <th className="text-left py-2.5 px-4 text-xs font-medium text-gray-500">Country</th>
                    <th className="text-right py-2.5 px-4 text-xs font-medium text-gray-500">Value</th>
                    <th className="text-left py-2.5 px-4 text-xs font-medium text-gray-500">Status</th>
                    <th className="text-left py-2.5 px-4 text-xs font-medium text-gray-500">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredTrades.slice(0, 100).map(t => (
                    <tr key={t.id} className="hover:bg-gray-50">
                      <td className="py-2.5 px-4 font-medium text-[#1B2A4A]">{t.order_number}</td>
                      <td className="py-2.5 px-4"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${t.order_type === 'buy' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{t.order_type}</span></td>
                      <td className="py-2.5 px-4 text-gray-700">{t.commodity}</td>
                      <td className="py-2.5 px-4 text-right">{t.quantity?.toLocaleString()}</td>
                      <td className="py-2.5 px-4 text-gray-500">{t.country}</td>
                      <td className="py-2.5 px-4 text-right font-medium">{formatCurrency(t.target_price * t.quantity)}</td>
                      <td className="py-2.5 px-4"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${t.status === 'completed' ? 'bg-green-100 text-green-700' : t.status === 'open' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>{t.status}</span></td>
                      <td className="py-2.5 px-4 text-gray-400 text-xs">{new Date(t.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
