'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/supabase/auth-context';
import {
  Users,
  Loader2,
  CheckCircle,
  AlertCircle,
  Plus,
  MapPin,
  Wheat,
  TrendingUp,
  Search,
  RefreshCw,
  ChevronRight,
  ChevronDown,
  Shield,
  XCircle,
  ShoppingCart,
  Globe,
  BarChart3,
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────
interface Cooperative {
  id: string;
  name: string;
  country: string;
  region: string | null;
  member_count: number;
  description: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  status: string;
  created_at: string;
}

interface CoopMember {
  id: string;
  cooperative_id: string;
  member_id: string;
  role: string;
  joined_at: string;
  full_name?: string;
}

// ── Demo Data ──────────────────────────────────────────────────────────────
const DEMO_COOPERATIVES: Cooperative[] = [
  { id: 'c1', name: 'Kilimanjaro Farmers Coop', country: 'Tanzania', region: 'Kilimanjaro', member_count: 48, description: 'Smallholder farmers in Kilimanjaro region', contact_email: 'info@kilifarmers.co.tz', contact_phone: '+255 700 111 222', status: 'active', created_at: '2023-06-15' },
  { id: 'c2', name: 'Lake Victoria Growers', country: 'Kenya', region: 'Kisumu', member_count: 72, description: 'Fish and crop farmers around Lake Victoria', contact_email: 'lvg@farmers.co.ke', contact_phone: '+254 700 333 444', status: 'active', created_at: '2023-03-10' },
  { id: 'c3', name: 'Savanna Agri Alliance', country: 'Nigeria', region: 'Kano', member_count: 120, description: 'Large cooperative of grain and pulse farmers', contact_email: 'info@savanna-agri.ng', contact_phone: '+234 800 555 666', status: 'active', created_at: '2022-11-01' },
  { id: 'c4', name: 'Cape Coffee Collective', country: 'South Africa', region: 'Western Cape', member_count: 35, description: 'Specialty coffee growers', contact_email: 'hello@capecoffee.co.za', contact_phone: '+27 21 777 888', status: 'forming', created_at: '2024-01-20' },
  { id: 'c5', name: 'Green Valley Farmers', country: 'Uganda', region: 'Mbale', member_count: 56, description: 'Organic farmers union', contact_email: 'info@greenvalley.ug', contact_phone: '+256 700 999 000', status: 'suspended', created_at: '2023-09-05' },
];

const COUNTRIES = ['Kenya', 'Uganda', 'Tanzania', 'Rwanda', 'Ethiopia', 'Nigeria', 'Ghana', 'South Africa', 'Zambia', 'Malawi', 'Mozambique', 'Zimbabwe'];
const COOP_TYPES = ['crop', 'livestock', 'mixed', 'processing', 'marketing'];

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  forming: 'bg-yellow-100 text-yellow-700',
  suspended: 'bg-red-100 text-red-700',
};

export default function AdminCooperativesPage() {
  const supabase = createClient();
  const { user } = useAuth();
  const [cooperatives, setCooperatives] = useState<Cooperative[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedMembers, setExpandedMembers] = useState<Record<string, CoopMember[]>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCountry, setFilterCountry] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Create form
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', country: '', region: '', type: 'mixed', description: '' });
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // ── Fetch cooperatives ───────────────────────────────────────────────────
  const fetchCooperatives = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error: fetchErr } = await supabase
        .from('cooperatives')
        .select('*')
        .order('name');

      if (fetchErr || !data || data.length === 0) {
        setCooperatives(DEMO_COOPERATIVES);
      } else {
        setCooperatives(data);
      }
    } catch {
      setCooperatives(DEMO_COOPERATIVES);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchCooperatives(); }, [fetchCooperatives]);

  // ── Expand and fetch members ─────────────────────────────────────────────
  const toggleExpand = async (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);
    if (!expandedMembers[id]) {
      try {
        const { data } = await supabase
          .from('cooperative_members')
          .select('*')
          .eq('cooperative_id', id)
          .order('joined_at');
        setExpandedMembers(prev => ({ ...prev, [id]: data || [] }));
      } catch {
        setExpandedMembers(prev => ({ ...prev, [id]: [] }));
      }
    }
  };

  // ── Create cooperative ───────────────────────────────────────────────────
  const handleCreate = async () => {
    if (!createForm.name || !createForm.country) {
      setError('Name and country are required.');
      return;
    }
    setActionLoading('create');
    setError('');
    try {
      const res = await fetch('/api/cooperatives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm),
      });
      if (!res.ok) throw new Error('Failed to create');
      setSuccess('Cooperative created successfully!');
      setShowCreate(false);
      setCreateForm({ name: '', country: '', region: '', type: 'mixed', description: '' });
      fetchCooperatives();
      setTimeout(() => setSuccess(''), 4000);
    } catch {
      // Demo fallback
      const newCoop: Cooperative = {
        id: `c-${Date.now()}`, name: createForm.name, country: createForm.country,
        region: createForm.region || null, member_count: 0, description: createForm.description || null,
        contact_email: null, contact_phone: null, status: 'forming', created_at: new Date().toISOString(),
      };
      setCooperatives(prev => [...prev, newCoop]);
      setShowCreate(false);
      setCreateForm({ name: '', country: '', region: '', type: 'mixed', description: '' });
      setSuccess('Cooperative created (demo)!');
      setError('');
      setTimeout(() => setSuccess(''), 4000);
    }
    setActionLoading(null);
  };

  // ── Update status ────────────────────────────────────────────────────────
  const handleStatusUpdate = async (id: string, status: string) => {
    setActionLoading(id);
    try {
      await supabase.from('cooperatives').update({ status }).eq('id', id);
      fetchCooperatives();
    } catch {
      setCooperatives(prev => prev.map(c => c.id === id ? { ...c, status } : c));
    }
    setActionLoading(null);
    setSuccess(`Cooperative ${status === 'active' ? 'approved' : 'suspended'}.`);
    setTimeout(() => setSuccess(''), 3000);
  };

  // ── Filtered ─────────────────────────────────────────────────────────────
  const filtered = cooperatives.filter(c => {
    if (filterCountry !== 'all' && c.country !== filterCountry) return false;
    if (filterStatus !== 'all' && c.status !== filterStatus) return false;
    if (searchTerm && !c.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  // ── KPIs ─────────────────────────────────────────────────────────────────
  const totalCoops = cooperatives.length;
  const totalMembers = cooperatives.reduce((s, c) => s + c.member_count, 0);
  const activeCoops = cooperatives.filter(c => c.status === 'active').length;
  const totalProduction = totalMembers * 5.2; // estimate tonnes
  const uniqueCountries = [...new Set(cooperatives.map(c => c.country))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">Cooperative Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage farmer cooperatives across all countries</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 bg-[#5DB347] text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-[#449933] transition-colors"
        >
          <Plus className="w-4 h-4" /> Create Cooperative
        </button>
      </div>

      {/* Toasts */}
      {success && (
        <div className="flex items-center gap-2 text-green-700 text-sm bg-green-50 px-4 py-3 rounded-xl">
          <CheckCircle className="w-4 h-4 shrink-0" /> {success}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 px-4 py-3 rounded-xl">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KPICard label="Total Cooperatives" value={totalCoops} icon={<Users className="w-5 h-5 text-[#5DB347]" />} />
        <KPICard label="Total Members" value={totalMembers.toLocaleString()} icon={<Users className="w-5 h-5 text-blue-500" />} />
        <KPICard label="Active Coops" value={activeCoops} icon={<Shield className="w-5 h-5 text-green-500" />} />
        <KPICard label="Est. Production" value={`${(totalProduction / 1000).toFixed(1)}K t`} icon={<Wheat className="w-5 h-5 text-amber-500" />} />
      </div>

      {/* Create Form */}
      {showCreate && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          <h3 className="font-semibold text-[#1B2A4A]">Create New Cooperative</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Name *</label>
              <input type="text" value={createForm.name} onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))} placeholder="Cooperative name" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#5DB347] focus:border-transparent" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Country *</label>
              <select value={createForm.country} onChange={e => setCreateForm(f => ({ ...f, country: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#5DB347] focus:border-transparent">
                <option value="">Select...</option>
                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Region</label>
              <input type="text" value={createForm.region} onChange={e => setCreateForm(f => ({ ...f, region: e.target.value }))} placeholder="Region/Province" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#5DB347] focus:border-transparent" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
              <select value={createForm.type} onChange={e => setCreateForm(f => ({ ...f, type: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#5DB347] focus:border-transparent">
                {COOP_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
              <textarea value={createForm.description} onChange={e => setCreateForm(f => ({ ...f, description: e.target.value }))} rows={2} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#5DB347] focus:border-transparent" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleCreate} disabled={actionLoading === 'create'} className="flex items-center gap-2 bg-[#5DB347] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#449933] disabled:opacity-50 transition-colors">
              {actionLoading === 'create' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Create
            </button>
            <button onClick={() => setShowCreate(false)} className="bg-gray-200 text-gray-700 px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-300 transition-colors">Cancel</button>
          </div>
        </div>
      )}

      {/* Cooperatives Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        {/* Filters */}
        <div className="p-4 border-b border-gray-100 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search cooperatives..." className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347] focus:border-transparent" />
          </div>
          <select value={filterCountry} onChange={e => setFilterCountry(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
            <option value="all">All Countries</option>
            {uniqueCountries.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="forming">Forming</option>
            <option value="suspended">Suspended</option>
          </select>
          <button onClick={fetchCooperatives} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-[#5DB347]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No cooperatives found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left py-3 px-4 font-medium text-gray-500 w-8"></th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Region</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Country</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Members</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(coop => (
                  <>
                    <tr key={coop.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => toggleExpand(coop.id)}>
                      <td className="py-3 px-4">
                        <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${expandedId === coop.id ? 'rotate-90' : ''}`} />
                      </td>
                      <td className="py-3 px-4 font-medium text-[#1B2A4A]">{coop.name}</td>
                      <td className="py-3 px-4 text-gray-600">{coop.region || '—'}</td>
                      <td className="py-3 px-4 text-gray-600">{coop.country}</td>
                      <td className="py-3 px-4 text-right font-medium">{coop.member_count}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[coop.status] || 'bg-gray-100 text-gray-600'}`}>
                          {coop.status.charAt(0).toUpperCase() + coop.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-4" onClick={e => e.stopPropagation()}>
                        <div className="flex gap-1">
                          {coop.status !== 'active' && (
                            <button
                              onClick={() => handleStatusUpdate(coop.id, 'active')}
                              disabled={actionLoading === coop.id}
                              className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-lg hover:bg-green-200 disabled:opacity-50 transition-colors"
                            >
                              Approve
                            </button>
                          )}
                          {coop.status === 'active' && (
                            <button
                              onClick={() => handleStatusUpdate(coop.id, 'suspended')}
                              disabled={actionLoading === coop.id}
                              className="text-xs bg-red-100 text-red-700 px-2.5 py-1 rounded-lg hover:bg-red-200 disabled:opacity-50 transition-colors"
                            >
                              Suspend
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    {expandedId === coop.id && (
                      <tr key={`${coop.id}-expanded`}>
                        <td colSpan={7} className="bg-gray-50 px-8 py-4">
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                              <div><span className="text-gray-500">Description:</span> <span className="font-medium">{coop.description || '—'}</span></div>
                              <div><span className="text-gray-500">Email:</span> <span className="font-medium">{coop.contact_email || '—'}</span></div>
                              <div><span className="text-gray-500">Phone:</span> <span className="font-medium">{coop.contact_phone || '—'}</span></div>
                              <div><span className="text-gray-500">Est:</span> <span className="font-medium">{new Date(coop.created_at).toLocaleDateString()}</span></div>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-gray-700 mb-2">Members ({expandedMembers[coop.id]?.length || 0})</p>
                              {(!expandedMembers[coop.id] || expandedMembers[coop.id].length === 0) ? (
                                <p className="text-xs text-gray-400">No detailed member data available.</p>
                              ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                  {expandedMembers[coop.id].map(m => (
                                    <div key={m.id} className="bg-white rounded-lg p-2 border border-gray-100 text-xs">
                                      <span className="font-medium">{m.full_name || m.member_id}</span>
                                      <span className="text-gray-400 ml-2 capitalize">{m.role}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ── KPI Card ──────────────────────────────────────────────────────────────
function KPICard({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-500">{label}</span>
        {icon}
      </div>
      <p className="text-2xl font-bold text-[#1B2A4A]">{value}</p>
    </div>
  );
}
