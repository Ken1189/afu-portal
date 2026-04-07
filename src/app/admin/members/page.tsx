'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search, Users, Eye, MapPin, Loader2, Download, LogIn,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/supabase/auth-context';
import { startImpersonation } from '@/components/ui/ImpersonationBanner';

interface ProfileRow {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string | null;
  country: string | null;
  region: string | null;
  created_at: string;
  members?: { tier: string | null }[] | { tier: string | null } | null;
}

const roleColors: Record<string, string> = {
  farmer: 'bg-green-100 text-green-700',
  member: 'bg-green-100 text-green-700',
  supplier: 'bg-orange-100 text-orange-700',
  ambassador: 'bg-purple-100 text-purple-700',
  investor: 'bg-blue-100 text-blue-700',
  partner: 'bg-amber-100 text-amber-700',
  admin: 'bg-red-100 text-red-700',
  super_admin: 'bg-red-100 text-red-700',
};

const roleLabels: Record<string, string> = {
  farmer: 'Farmer',
  member: 'Farmer',
  supplier: 'Supplier',
  ambassador: 'Ambassador',
  investor: 'Investor',
  partner: 'Partner',
  admin: 'Admin',
  super_admin: 'Admin',
};

const tierColors: Record<string, string> = {
  free: 'bg-gray-100 text-gray-600',
  smallholder: 'bg-teal/10 text-teal',
  commercial: 'bg-navy/10 text-navy',
  enterprise: 'bg-purple-100 text-purple-700',
};

const tierLabels: Record<string, string> = {
  free: 'Free',
  smallholder: 'Smallholder',
  commercial: 'Commercial',
  enterprise: 'Enterprise',
};

export default function AdminMembersPage() {
  const supabase = useMemo(() => createClient(), []);
  const { isSuperAdmin, user: authUser } = useAuth();
  const router = useRouter();
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [countryFilter, setCountryFilter] = useState('all');
  const [impersonateLoading, setImpersonateLoading] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchProfiles = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, role, country, region, created_at, members(tier)')
        .order('created_at', { ascending: false });
      if (error) {
        console.error('[admin/members] fetch error', error);
        setErrorMsg(error.message);
        setTimeout(() => setErrorMsg(null), 4000);
        setProfiles([]);
      } else {
        setProfiles((data || []) as ProfileRow[]);
      }
    } catch (err) {
      console.error('[admin/members] exception', err);
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => { fetchProfiles(); }, [fetchProfiles]);

  const getTier = (p: ProfileRow): string | null => {
    if (!p.members) return null;
    if (Array.isArray(p.members)) return p.members[0]?.tier ?? null;
    return p.members.tier ?? null;
  };

  const handleImpersonate = async (profileId: string) => {
    if (!profileId || profileId === authUser?.id) return;
    setImpersonateLoading(profileId);
    try {
      const res = await fetch('/api/admin/impersonate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start', targetUserId: profileId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Impersonation failed');
        setTimeout(() => setErrorMsg(null), 3000);
        return;
      }
      startImpersonation(data.impersonation);
      const role = data.impersonation.role;
      const redirectMap: Record<string, string> = {
        member: '/dashboard',
        farmer: '/dashboard',
        supplier: '/supplier',
        ambassador: '/ambassador',
        investor: '/investor',
        partner: '/supplier',
        admin: '/admin',
        super_admin: '/admin',
        warehouse_operator: '/warehouse',
      };
      router.push(redirectMap[role] || '/dashboard');
    } catch {
      setErrorMsg('Impersonation request failed');
      setTimeout(() => setErrorMsg(null), 3000);
    } finally {
      setImpersonateLoading(null);
    }
  };

  const normalizedRole = (r: string | null): string => {
    if (!r) return 'member';
    if (r === 'super_admin') return 'admin';
    if (r === 'member') return 'farmer';
    return r;
  };

  const filtered = useMemo(() => {
    let result = [...profiles];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.full_name?.toLowerCase().includes(q) ||
        p.email?.toLowerCase().includes(q)
      );
    }
    if (roleFilter !== 'all') {
      result = result.filter(p => normalizedRole(p.role) === roleFilter);
    }
    if (countryFilter !== 'all') result = result.filter(p => p.country === countryFilter);
    return result;
  }, [profiles, searchQuery, roleFilter, countryFilter]);

  const stats = useMemo(() => {
    const counts: Record<string, number> = { all: profiles.length, farmer: 0, supplier: 0, ambassador: 0, investor: 0, partner: 0, admin: 0 };
    profiles.forEach(p => {
      const r = normalizedRole(p.role);
      counts[r] = (counts[r] || 0) + 1;
    });
    return counts;
  }, [profiles]);

  const handleExportCSV = () => {
    const headers = ['Name', 'Email', 'Role', 'Tier', 'Country', 'Joined'];
    const rows = filtered.map(p => [
      p.full_name || '',
      p.email || '',
      roleLabels[normalizedRole(p.role)] || p.role || '',
      getTier(p) || '',
      p.country || '',
      p.created_at,
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `afu-people-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const summaryCards = [
    { label: 'Total People', value: stats.all || 0, color: 'text-navy', bg: 'bg-navy/10' },
    { label: 'Farmers', value: stats.farmer || 0, color: 'text-green-700', bg: 'bg-green-50' },
    { label: 'Suppliers', value: stats.supplier || 0, color: 'text-orange-700', bg: 'bg-orange-50' },
    { label: 'Ambassadors', value: stats.ambassador || 0, color: 'text-purple-700', bg: 'bg-purple-50' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">People Directory</h1>
          <p className="text-sm text-gray-500 mt-0.5">All members, suppliers, ambassadors, investors, partners, and admins</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2 bg-navy text-white text-sm font-medium rounded-lg hover:bg-navy/90 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {summaryCards.map((card, i) => (
          <div key={i} className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center ${card.color}`}>
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-navy">{card.value}</p>
                <p className="text-xs text-gray-500">{card.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal/50"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
              <option value="all">All Roles</option>
              <option value="farmer">Farmers</option>
              <option value="supplier">Suppliers</option>
              <option value="ambassador">Ambassadors</option>
              <option value="investor">Investors</option>
              <option value="partner">Partners</option>
              <option value="admin">Admins</option>
            </select>
            <select value={countryFilter} onChange={(e) => setCountryFilter(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
              <option value="all">All Countries</option>
              <option value="Botswana">Botswana</option>
              <option value="Kenya">Kenya</option>
              <option value="Mozambique">Mozambique</option>
              <option value="Nigeria">Nigeria</option>
              <option value="Sierra Leone">Sierra Leone</option>
              <option value="South Africa">South Africa</option>
              <option value="Tanzania">Tanzania</option>
              <option value="Uganda">Uganda</option>
              <option value="Zambia">Zambia</option>
              <option value="Zimbabwe">Zimbabwe</option>
            </select>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-3">
          Showing {filtered.length} of {profiles.length} people
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-8">
          <Loader2 className="w-6 h-6 text-teal animate-spin mx-auto mb-2" />
          <p className="text-sm text-gray-500">Loading directory...</p>
        </div>
      )}

      {/* Table */}
      {!loading && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-cream/50">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Name</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Email</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Role</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Tier</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Country</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((p) => {
                  const role = normalizedRole(p.role);
                  const tier = getTier(p);
                  return (
                    <tr key={p.id} className="hover:bg-cream/50 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-medium text-navy">{p.full_name || '—'}</p>
                      </td>
                      <td className="py-3 px-4 text-gray-500">{p.email || '—'}</td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleColors[role] || 'bg-gray-100 text-gray-600'}`}>
                          {roleLabels[role] || role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {role === 'farmer' && tier ? (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${tierColors[tier] || 'bg-gray-100 text-gray-600'}`}>
                            {tierLabels[tier] || tier}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 text-gray-500">
                          <MapPin className="w-3 h-3" />
                          {p.country || '—'}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/admin/members/${p.id}`} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-navy transition-colors" title="View details">
                            <Eye className="w-4 h-4" />
                          </Link>
                          {isSuperAdmin && p.id !== authUser?.id && (
                            <button
                              onClick={() => handleImpersonate(p.id)}
                              disabled={impersonateLoading === p.id}
                              className="p-2 rounded-lg hover:bg-purple-50 text-gray-400 hover:text-purple-600 transition-colors disabled:opacity-50"
                              title="Login as this user"
                            >
                              {impersonateLoading === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && !loading && (
            <div className="py-16 text-center">
              <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">
                {profiles.length === 0 ? 'No people in the directory yet.' : 'No people match your filters'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Toast */}
      {errorMsg && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium bg-red-600">
          {errorMsg}
        </div>
      )}
    </div>
  );
}
