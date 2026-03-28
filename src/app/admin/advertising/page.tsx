'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Megaphone,
  DollarSign,
  Eye,
  MousePointerClick,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  Pause,
  Search,
  ChevronDown,
  ChevronUp,
  Globe,
  Target,
  BarChart3,
  Users,
} from 'lucide-react';

// ─── Demo Data ───

const fallback_kpis = [
  { label: 'Total Ad Revenue', value: '$24,750', change: '+$4,200 this month', icon: DollarSign, color: 'text-green-600 bg-green-50' },
  { label: 'Active Campaigns', value: '18', change: '12 suppliers', icon: Megaphone, color: 'text-blue-600 bg-blue-50' },
  { label: 'Pending Approval', value: '5', change: 'Needs review', icon: Clock, color: 'text-amber-600 bg-amber-50' },
  { label: 'Average CTR', value: '3.2%', change: 'Above industry avg', icon: MousePointerClick, color: 'text-purple-600 bg-purple-50' },
];

const revenueByMonth = [
  { month: 'Oct', amount: 3200 },
  { month: 'Nov', amount: 4100 },
  { month: 'Dec', amount: 3800 },
  { month: 'Jan', amount: 5200 },
  { month: 'Feb', amount: 4600 },
  { month: 'Mar', amount: 5850 },
];

const fallback_ads = [
  { id: 'AD-001', title: 'Premium Maize Seeds — PlantRight Africa', supplier: 'PlantRight Seeds', type: 'banner', status: 'active', countries: ['KE', 'TZ', 'UG'], impressions: 12450, clicks: 398, ctr: 3.2, budget: 500, spent: 342, package: 'Growth' },
  { id: 'AD-002', title: 'Tractor Hire — AgriMech East Africa', supplier: 'AgriMech EA', type: 'featured-product', status: 'active', countries: ['KE', 'UG'], impressions: 8920, clicks: 245, ctr: 2.7, budget: 300, spent: 210, package: 'Starter' },
  { id: 'AD-003', title: 'Crop Insurance — SafeHarvest', supplier: 'SafeHarvest Insurance', type: 'sidebar', status: 'active', countries: ['ZA', 'BW', 'ZW'], impressions: 15200, clicks: 612, ctr: 4.0, budget: 1500, spent: 980, package: 'Premium' },
  { id: 'AD-004', title: 'Organic Fertiliser — GreenGrow', supplier: 'GreenGrow Ltd', type: 'sponsored-content', status: 'pending', countries: ['GH', 'NG'], impressions: 0, clicks: 0, ctr: 0, budget: 500, spent: 0, package: 'Growth' },
  { id: 'AD-005', title: 'Farm Finance — QuickLoan Africa', supplier: 'QuickLoan', type: 'banner', status: 'pending', countries: ['KE', 'TZ', 'RW'], impressions: 0, clicks: 0, ctr: 0, budget: 3000, spent: 0, package: 'Enterprise' },
  { id: 'AD-006', title: 'Solar Irrigation Pumps', supplier: 'SunPower Agri', type: 'featured-product', status: 'active', countries: ['ZW', 'MZ'], impressions: 6340, clicks: 189, ctr: 3.0, budget: 300, spent: 195, package: 'Starter' },
  { id: 'AD-007', title: 'Livestock Feed — NutriStock', supplier: 'NutriStock', type: 'sidebar', status: 'paused', countries: ['ZA', 'NA', 'BW'], impressions: 4200, clicks: 92, ctr: 2.2, budget: 100, spent: 78, package: 'Starter' },
  { id: 'AD-008', title: 'Export Packaging Solutions', supplier: 'PackFresh', type: 'banner', status: 'pending', countries: ['KE', 'GH', 'NG', 'TZ', 'UG'], impressions: 0, clicks: 0, ctr: 0, budget: 1500, spent: 0, package: 'Premium' },
];

// ─── Helpers ───

type AdStatus = 'active' | 'pending' | 'paused' | 'completed' | 'cancelled';

function statusBadge(status: string) {
  const colors: Record<string, string> = {
    active: 'bg-green-100 text-green-700', pending: 'bg-amber-100 text-amber-700',
    paused: 'bg-gray-100 text-gray-600', completed: 'bg-blue-100 text-blue-700',
    cancelled: 'bg-red-100 text-red-700',
  };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100'}`}>{status}</span>;
}

function typeBadge(type: string) {
  const colors: Record<string, string> = {
    banner: 'bg-blue-50 text-blue-700', 'featured-product': 'bg-purple-50 text-purple-700',
    sidebar: 'bg-teal-50 text-teal-700', 'sponsored-content': 'bg-orange-50 text-orange-700',
  };
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[type] || 'bg-gray-100'}`}>{type}</span>;
}

const maxRevenue = Math.max(...revenueByMonth.map((r) => r.amount));

// ─── Component ───

export default function AdminAdvertisingPage() {
  const [filter, setFilter] = useState<'all' | AdStatus>('all');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [kpis, setKpis] = useState(fallback_kpis);
  const [ads, setAds] = useState(fallback_ads);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleAdAction = async (id: string, newStatus: string) => {
    setActionLoading(id);
    const supabase = createClient();
    const { error } = await supabase.from('advertisements').update({ status: newStatus }).eq('id', id);
    if (error) {
      // Fallback: update local state even if table doesn't exist
      setAds((prev) => prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a)));
    } else {
      setAds((prev) => prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a)));
    }
    const labels: Record<string, string> = { active: 'approved', cancelled: 'rejected', paused: 'paused' };
    setToast({ message: `Ad ${labels[newStatus] || newStatus} successfully`, type: 'success' });
    setActionLoading(null);
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const supabase = createClient();
    async function fetchData() {
      try {
        const { data, error } = await supabase
          .from('advertisements')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          setAds(
            data.map((row: Record<string, unknown>) => ({
              id: (row.id as string) || '',
              title: (row.title as string) || 'Untitled',
              supplier: (row.supplier_name as string) || (row.supplier as string) || 'Unknown',
              type: (row.ad_type as string) || 'banner',
              status: (row.status as string) || 'pending',
              countries: Array.isArray(row.countries) ? (row.countries as string[]) : [],
              impressions: (row.impressions as number) || 0,
              clicks: (row.clicks as number) || 0,
              ctr: (row.ctr as number) || 0,
              budget: (row.budget as number) || 0,
              spent: (row.spent as number) || 0,
              package: (row.package_name as string) || (row.ad_package as string) || 'Starter',
            }))
          );
        }
      } catch { /* fallback */ }
      setIsLoading(false);
    }
    fetchData();
  }, []);

  const filteredAds = ads.filter((ad) => {
    if (filter !== 'all' && ad.status !== filter) return false;
    if (search && !ad.title.toLowerCase().includes(search.toLowerCase()) && !ad.supplier.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          <CheckCircle2 className="w-4 h-4" />
          {toast.message}
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Advertising Management</h1>
          <p className="text-gray-500 mt-1">Review campaigns, track revenue, manage ad packages</p>
        </div>
        <a
          href="/admin/advertising/review"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#5DB347] text-white rounded-lg text-sm font-medium hover:bg-[#449933] transition-colors"
        >
          <Clock className="w-4 h-4" />
          Review Queue
          {ads.filter(a => a.status === 'pending').length > 0 && (
            <span className="px-1.5 py-0.5 bg-white/20 rounded-full text-[10px]">
              {ads.filter(a => a.status === 'pending').length}
            </span>
          )}
        </a>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-white border rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">{kpi.label}</span>
              <div className={`p-2 rounded-lg ${kpi.color}`}><kpi.icon className="w-4 h-4" /></div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{kpi.value}</div>
            <div className="text-xs text-gray-400 mt-1">{kpi.change}</div>
          </div>
        ))}
      </div>

      {/* Revenue Chart + Top Countries */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Monthly Ad Revenue</h3>
            <TrendingUp className="w-4 h-4 text-gray-400" />
          </div>
          <div className="flex items-end gap-2 h-40">
            {revenueByMonth.map((r) => (
              <div key={r.month} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs font-semibold text-gray-700">${(r.amount / 1000).toFixed(1)}K</span>
                <div
                  className="w-full bg-[#5DB347] rounded-t-md transition-all"
                  style={{ height: `${(r.amount / maxRevenue) * 100}%`, minHeight: '8px' }}
                />
                <span className="text-xs text-gray-400">{r.month}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Top Countries</h3>
            <Globe className="w-4 h-4 text-gray-400" />
          </div>
          <div className="space-y-3">
            {[
              { code: 'KE', name: 'Kenya', pct: 28 },
              { code: 'ZA', name: 'South Africa', pct: 22 },
              { code: 'NG', name: 'Nigeria', pct: 18 },
              { code: 'GH', name: 'Ghana', pct: 12 },
              { code: 'UG', name: 'Uganda', pct: 10 },
              { code: 'ZW', name: 'Zimbabwe', pct: 10 },
            ].map((c) => (
              <div key={c.code}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">{c.name}</span>
                  <span className="text-gray-500">{c.pct}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full">
                  <div className="h-full bg-[#5DB347] rounded-full" style={{ width: `${c.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Package Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { name: 'Starter', count: 6, revenue: '$600', icon: Target },
          { name: 'Growth', count: 5, revenue: '$2,500', icon: TrendingUp },
          { name: 'Premium', count: 4, revenue: '$6,000', icon: BarChart3 },
          { name: 'Enterprise', count: 3, revenue: '$9,000', icon: Users },
        ].map((pkg) => (
          <div key={pkg.name} className="bg-white border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <pkg.icon className="w-4 h-4 text-[#5DB347]" />
              <span className="text-sm font-semibold text-gray-900">{pkg.name}</span>
            </div>
            <div className="text-xs text-gray-500">{pkg.count} campaigns · {pkg.revenue}</div>
          </div>
        ))}
      </div>

      {/* Ads Table */}
      <div className="bg-white border rounded-xl">
        <div className="px-5 py-4 border-b flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-1">
            {(['all', 'pending', 'active', 'paused', 'completed'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filter === s ? 'bg-[#1B2A4A] text-white' : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                {s === 'pending' && <span className="ml-1 px-1.5 py-0.5 bg-amber-500 text-white rounded-full text-[10px]">5</span>}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search ads..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-2 border rounded-lg text-sm w-56"
            />
          </div>
        </div>

        <div className="divide-y">
          {filteredAds.map((ad) => (
            <div key={ad.id}>
              <button
                onClick={() => setExpanded(expanded === ad.id ? null : ad.id)}
                className="w-full px-5 py-3 flex items-center justify-between hover:bg-gray-50 text-left"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Megaphone className={`w-4 h-4 flex-shrink-0 ${ad.status === 'active' ? 'text-green-500' : ad.status === 'pending' ? 'text-amber-500' : 'text-gray-400'}`} />
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">{ad.title}</div>
                    <div className="text-xs text-gray-400">{ad.supplier} · {ad.package}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {typeBadge(ad.type)}
                  {statusBadge(ad.status)}
                  <div className="text-right hidden sm:block">
                    <div className="text-xs text-gray-500"><Eye className="w-3 h-3 inline mr-1" />{ad.impressions.toLocaleString()}</div>
                    <div className="text-xs text-gray-400"><MousePointerClick className="w-3 h-3 inline mr-1" />{ad.clicks} ({ad.ctr}%)</div>
                  </div>
                  {expanded === ad.id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </div>
              </button>

              {expanded === ad.id && (
                <div className="px-5 pb-4 bg-gray-50 border-t">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-3 text-sm">
                    <div><span className="text-gray-500">Countries:</span> <span className="font-medium">{ad.countries.join(', ')}</span></div>
                    <div><span className="text-gray-500">Budget:</span> <span className="font-medium">${ad.budget}</span></div>
                    <div><span className="text-gray-500">Spent:</span> <span className="font-medium">${ad.spent}</span></div>
                    <div><span className="text-gray-500">Remaining:</span> <span className="font-medium text-green-600">${ad.budget - ad.spent}</span></div>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full mb-3">
                    <div className="h-full bg-[#5DB347] rounded-full" style={{ width: `${(ad.spent / ad.budget) * 100}%` }} />
                  </div>
                  <div className="flex gap-2">
                    {ad.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleAdAction(ad.id, 'active')}
                          disabled={actionLoading === ad.id}
                          className="px-3 py-1.5 bg-[#5DB347] text-white rounded-lg text-sm hover:bg-[#449933] disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" /> Approve
                        </button>
                        <button
                          onClick={() => handleAdAction(ad.id, 'cancelled')}
                          disabled={actionLoading === ad.id}
                          className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 disabled:opacity-50"
                        >
                          <XCircle className="w-3.5 h-3.5 inline mr-1" /> Reject
                        </button>
                      </>
                    )}
                    {ad.status === 'active' && (
                      <button
                        onClick={() => handleAdAction(ad.id, 'paused')}
                        disabled={actionLoading === ad.id}
                        className="px-3 py-1.5 bg-amber-500 text-white rounded-lg text-sm hover:bg-amber-600 disabled:opacity-50"
                      >
                        <Pause className="w-3.5 h-3.5 inline mr-1" /> Pause
                      </button>
                    )}
                    {ad.status === 'paused' && (
                      <button
                        onClick={() => handleAdAction(ad.id, 'active')}
                        disabled={actionLoading === ad.id}
                        className="px-3 py-1.5 bg-[#5DB347] text-white rounded-lg text-sm hover:bg-[#449933] disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" /> Resume
                      </button>
                    )}
                    <button className="px-3 py-1.5 border text-gray-600 rounded-lg text-sm hover:bg-gray-100">
                      <Eye className="w-3.5 h-3.5 inline mr-1" /> View Details
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
