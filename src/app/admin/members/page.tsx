'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search, Users, Eye, MapPin, Loader2, Download, LogIn, UserCog, Save, X,
  UserPlus, Mail, Trash2,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/supabase/auth-context';
import { startImpersonation } from '@/components/ui/ImpersonationBanner';
import Pagination from '@/components/admin/Pagination';

interface ProfileRow {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string | null;
  country: string | null;
  region: string | null;
  capabilities?: string[] | null;
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

const CAPABILITY_LIST: { key: string; label: string; chipClass: string }[] = [
  { key: 'ambassador', label: 'Ambassador', chipClass: 'bg-purple-100 text-purple-700 border-purple-200' },
  { key: 'supplier', label: 'Supplier', chipClass: 'bg-blue-100 text-blue-700 border-blue-200' },
  { key: 'investor', label: 'Investor', chipClass: 'bg-green-100 text-green-700 border-green-200' },
  { key: 'sponsor', label: 'Sponsor', chipClass: 'bg-orange-100 text-orange-700 border-orange-200' },
  { key: 'advisor', label: 'Advisor', chipClass: 'bg-gray-100 text-gray-700 border-gray-200' },
  { key: 'warehouse_op', label: 'Warehouse Op', chipClass: 'bg-amber-100 text-amber-700 border-amber-200' },
];

const PRIMARY_ROLE_OPTIONS: { value: string; label: string }[] = [
  { value: 'farmer', label: 'Farmer' },
  { value: 'member', label: 'Member' },
  { value: 'supplier', label: 'Supplier' },
  { value: 'ambassador', label: 'Ambassador' },
  { value: 'investor', label: 'Investor' },
  { value: 'partner', label: 'Partner' },
  { value: 'admin', label: 'Admin' },
  { value: 'super_admin', label: 'Super Admin' },
];

interface UserDetails {
  profile: ProfileRow & { capabilities: string[] };
  linked: {
    supplier: { id: string; created_at: string } | null;
    ambassador: { id: string; created_at: string } | null;
    member: { id: string; tier: string | null; created_at: string } | null;
  };
}

export default function AdminMembersPage() {
  const supabase = useMemo(() => createClient(), []);
  const { isSuperAdmin, user: authUser } = useAuth();
  const router = useRouter();
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 50;
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [countryFilter, setCountryFilter] = useState('all');
  const [capabilityFilter, setCapabilityFilter] = useState('all');
  const [impersonateLoading, setImpersonateLoading] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Manage modal state
  const [manageUserId, setManageUserId] = useState<string | null>(null);
  const [manageDetails, setManageDetails] = useState<UserDetails | null>(null);
  const [manageLoading, setManageLoading] = useState(false);
  const [pendingRole, setPendingRole] = useState<string>('');
  const [savingRole, setSavingRole] = useState(false);
  const [togglingCapability, setTogglingCapability] = useState<string | null>(null);

  // Add User modal state
  const [showAddUser, setShowAddUser] = useState(false);
  const [addForm, setAddForm] = useState({
    email: '',
    full_name: '',
    role: 'farmer',
    capabilities: [] as string[],
    country: '',
    phone: '',
    send_welcome: true,
  });
  const [addSubmitting, setAddSubmitting] = useState(false);

  // Delete confirmation modal state
  const [deleteTarget, setDeleteTarget] = useState<ProfileRow | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  // Resend welcome state (track per-user loading)
  const [resendingWelcome, setResendingWelcome] = useState<string | null>(null);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };
  const showError = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(null), 4000);
  };

  const fetchProfiles = useCallback(async (pg: number = 1) => {
    setLoading(true);
    const from = (pg - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    try {
      // Try with capabilities first; gracefully fall back if column doesn't exist
      let { data, error, count } = await supabase
        .from('profiles')
        .select('id, full_name, email, role, country, region, capabilities, created_at, members(tier)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);
      if (error && /capabilities/i.test(error.message)) {
        const fallback = await supabase
          .from('profiles')
          .select('id, full_name, email, role, country, region, created_at, members(tier)', { count: 'exact' })
          .order('created_at', { ascending: false })
          .range(from, to);
        data = (fallback.data as unknown) as typeof data;
        error = fallback.error;
        count = fallback.count;
      }
      if (error) {
        console.error('[admin/members] fetch error', error);
        setErrorMsg(error.message);
        setTimeout(() => setErrorMsg(null), 4000);
        setProfiles([]);
      } else {
        setProfiles((data || []) as ProfileRow[]);
        setTotalCount(count ?? 0);
      }
    } catch (err) {
      console.error('[admin/members] exception', err);
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => { fetchProfiles(page); }, [fetchProfiles, page]);

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
    if (capabilityFilter !== 'all') {
      result = result.filter(p => Array.isArray(p.capabilities) && p.capabilities.includes(capabilityFilter));
    }
    return result;
  }, [profiles, searchQuery, roleFilter, countryFilter, capabilityFilter]);

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

  // ── Manage Modal ────────────────────────────────────────────────
  const openManage = async (userId: string) => {
    setManageUserId(userId);
    setManageDetails(null);
    setManageLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`);
      const data = await res.json();
      if (!res.ok) {
        showError(data.error || 'Failed to load user');
        setManageUserId(null);
      } else {
        setManageDetails(data);
        setPendingRole(data.profile.role || '');
      }
    } catch {
      showError('Failed to load user');
      setManageUserId(null);
    } finally {
      setManageLoading(false);
    }
  };

  const closeManage = () => {
    setManageUserId(null);
    setManageDetails(null);
    setPendingRole('');
  };

  const handleSaveRole = async () => {
    if (!manageDetails || !manageUserId) return;
    if (pendingRole === manageDetails.profile.role) return;

    if (pendingRole === 'super_admin') {
      const ok = window.confirm(
        'Are you sure you want to grant super_admin? This is a powerful role with full system access.'
      );
      if (!ok) return;
    }

    setSavingRole(true);
    try {
      const res = await fetch(`/api/admin/users/${manageUserId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: pendingRole }),
      });
      const data = await res.json();
      if (!res.ok) {
        showError(data.error || 'Failed to update role');
        return;
      }
      const sideEffectMsg = data.sideEffects?.length ? ` (${data.sideEffects.join(', ')})` : '';
      showSuccess(`Role updated to ${pendingRole}${sideEffectMsg}`);
      // Update local state
      setProfiles(prev => prev.map(p => p.id === manageUserId ? { ...p, role: pendingRole } : p));
      setManageDetails(prev => prev ? { ...prev, profile: { ...prev.profile, role: pendingRole } } : prev);
      // Re-fetch user details to refresh linked records
      const refresh = await fetch(`/api/admin/users/${manageUserId}`);
      if (refresh.ok) setManageDetails(await refresh.json());
    } catch {
      showError('Failed to update role');
    } finally {
      setSavingRole(false);
    }
  };

  const handleToggleCapability = async (capability: string, currentlyOn: boolean) => {
    if (!manageUserId || !manageDetails) return;
    setTogglingCapability(capability);
    try {
      const res = await fetch(`/api/admin/users/${manageUserId}/capabilities`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: currentlyOn ? 'remove' : 'add', capability }),
      });
      const data = await res.json();
      if (!res.ok) {
        showError(data.error || 'Failed to update capability');
        return;
      }
      showSuccess(`${currentlyOn ? 'Removed' : 'Added'} ${capability}`);
      setManageDetails(prev => prev ? {
        ...prev,
        profile: { ...prev.profile, capabilities: data.capabilities || [] },
      } : prev);
      // Update table row capabilities
      setProfiles(prev => prev.map(p =>
        p.id === manageUserId ? { ...p, capabilities: data.capabilities || [] } : p
      ));
      // If linked records changed, refresh
      if (data.sideEffects?.length) {
        const refresh = await fetch(`/api/admin/users/${manageUserId}`);
        if (refresh.ok) {
          const refreshed = await refresh.json();
          setManageDetails(refreshed);
        }
      }
    } catch {
      showError('Failed to update capability');
    } finally {
      setTogglingCapability(null);
    }
  };

  // ── Add User ────────────────────────────────────────────────────
  const resetAddForm = () => {
    setAddForm({
      email: '',
      full_name: '',
      role: 'farmer',
      capabilities: [],
      country: '',
      phone: '',
      send_welcome: true,
    });
  };

  const handleAddUser = async () => {
    if (!addForm.email || !addForm.full_name || !addForm.role) {
      showError('Email, full name, and role are required');
      return;
    }
    setAddSubmitting(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: addForm.email.trim().toLowerCase(),
          full_name: addForm.full_name.trim(),
          role: addForm.role,
          capabilities: addForm.capabilities,
          country: addForm.country || null,
          phone: addForm.phone || null,
          send_welcome: addForm.send_welcome,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        showError(data.error || 'Failed to create user');
        return;
      }
      const emailMsg = addForm.send_welcome
        ? 'User created. Welcome email sent.'
        : `User created. Temporary password: ${data.user?.temp_password || '—'}`;
      showSuccess(emailMsg);
      setShowAddUser(false);
      resetAddForm();
      await fetchProfiles();
    } catch {
      showError('Failed to create user');
    } finally {
      setAddSubmitting(false);
    }
  };

  const toggleAddCapability = (cap: string) => {
    setAddForm(prev => ({
      ...prev,
      capabilities: prev.capabilities.includes(cap)
        ? prev.capabilities.filter(c => c !== cap)
        : [...prev.capabilities, cap],
    }));
  };

  // ── Delete ─────────────────────────────────────────────────────
  const openDeleteConfirm = (user: ProfileRow) => {
    setDeleteTarget(user);
    setDeleteConfirmText('');
  };

  const closeDeleteConfirm = () => {
    setDeleteTarget(null);
    setDeleteConfirmText('');
  };

  const handleDeleteUser = async () => {
    if (!deleteTarget) return;
    if (deleteConfirmText !== 'DELETE') {
      showError('Type DELETE to confirm');
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/users/${deleteTarget.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: 'DELETE' }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        showError(data.error || 'Failed to delete user');
        return;
      }
      showSuccess(`User ${deleteTarget.full_name || deleteTarget.email || ''} deleted (${data.mode})`);
      closeDeleteConfirm();
      await fetchProfiles();
    } catch {
      showError('Failed to delete user');
    } finally {
      setDeleting(false);
    }
  };

  // ── Resend Welcome ─────────────────────────────────────────────
  const handleResendWelcome = async (userId: string, name: string) => {
    setResendingWelcome(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}/send-welcome`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        showError(data.error || 'Failed to resend welcome');
        return;
      }
      showSuccess(`Welcome email sent to ${name}`);
    } catch {
      showError('Failed to resend welcome');
    } finally {
      setResendingWelcome(null);
    }
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
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-navy text-white text-sm font-medium rounded-lg hover:bg-navy/90 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={() => { resetAddForm(); setShowAddUser(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white text-sm font-semibold rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            Add User
          </button>
        </div>
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
            <select value={capabilityFilter} onChange={(e) => setCapabilityFilter(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
              <option value="all">All Capabilities</option>
              <option value="ambassador">Has Ambassador</option>
              <option value="supplier">Has Supplier</option>
              <option value="investor">Has Investor</option>
              <option value="sponsor">Has Sponsor</option>
              <option value="advisor">Has Advisor</option>
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
          Showing {filtered.length} of {totalCount.toLocaleString()} people (page {page})
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
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Role &amp; Capabilities</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Tier</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Country</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((p) => {
                  const role = normalizedRole(p.role);
                  const tier = getTier(p);
                  const caps = Array.isArray(p.capabilities) ? p.capabilities : [];
                  return (
                    <tr key={p.id} className="hover:bg-cream/50 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-medium text-navy">{p.full_name || '—'}</p>
                      </td>
                      <td className="py-3 px-4 text-gray-500">{p.email || '—'}</td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap items-center gap-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleColors[role] || 'bg-gray-100 text-gray-600'}`}>
                            {roleLabels[role] || role}
                          </span>
                          {caps.map((c) => {
                            const def = CAPABILITY_LIST.find(x => x.key === c);
                            if (!def) return null;
                            return (
                              <span key={c} className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium border ${def.chipClass}`}>
                                +{def.label}
                              </span>
                            );
                          })}
                        </div>
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
                          <button
                            onClick={() => openManage(p.id)}
                            className="p-2 rounded-lg hover:bg-teal/10 text-gray-400 hover:text-teal transition-colors"
                            title="Manage roles & capabilities"
                          >
                            <UserCog className="w-4 h-4" />
                          </button>
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
                          <button
                            onClick={() => handleResendWelcome(p.id, p.full_name || p.email || 'user')}
                            disabled={resendingWelcome === p.id}
                            className="p-2 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors disabled:opacity-50"
                            title="Resend welcome email (generates new temp password)"
                          >
                            {resendingWelcome === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                          </button>
                          {isSuperAdmin && p.id !== authUser?.id && p.role !== 'super_admin' && (
                            <button
                              onClick={() => openDeleteConfirm(p)}
                              className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                              title="Delete user"
                            >
                              <Trash2 className="w-4 h-4" />
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

          <Pagination
            page={page}
            pageSize={PAGE_SIZE}
            totalCount={totalCount}
            onPageChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          />
        </div>
      )}

      {/* Manage Modal */}
      {manageUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
              <div className="flex items-center gap-2">
                <UserCog className="w-5 h-5 text-teal" />
                <h2 className="text-lg font-bold text-navy">Manage User</h2>
              </div>
              <button onClick={closeManage} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {manageLoading && (
              <div className="py-12 text-center">
                <Loader2 className="w-6 h-6 text-teal animate-spin mx-auto" />
              </div>
            )}

            {!manageLoading && manageDetails && (
              <div className="p-6 space-y-6">
                {/* User identity */}
                <div className="bg-cream/50 rounded-xl p-4">
                  <p className="font-semibold text-navy text-base">{manageDetails.profile.full_name || '—'}</p>
                  <p className="text-sm text-gray-500">{manageDetails.profile.email || '—'}</p>
                  <div className="mt-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleColors[normalizedRole(manageDetails.profile.role)] || 'bg-gray-100 text-gray-600'}`}>
                      Current: {roleLabels[normalizedRole(manageDetails.profile.role)] || manageDetails.profile.role || 'unknown'}
                    </span>
                  </div>
                </div>

                {/* Primary Role */}
                <div>
                  <h3 className="text-sm font-semibold text-navy mb-2">Primary Role</h3>
                  <div className="flex gap-2">
                    <select
                      value={pendingRole}
                      onChange={(e) => setPendingRole(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal/50"
                    >
                      {PRIMARY_ROLE_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <button
                      onClick={handleSaveRole}
                      disabled={savingRole || pendingRole === manageDetails.profile.role}
                      className="flex items-center gap-1 px-4 py-2 bg-teal text-white rounded-lg text-sm font-medium hover:bg-teal/90 transition-colors disabled:opacity-50"
                    >
                      {savingRole ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Save
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Changing the role may auto-create supplier, ambassador, or member records.
                  </p>
                </div>

                {/* Capabilities */}
                <div>
                  <h3 className="text-sm font-semibold text-navy mb-2">Capabilities (additive)</h3>
                  <div className="flex flex-wrap gap-2">
                    {CAPABILITY_LIST.map((cap) => {
                      const on = (manageDetails.profile.capabilities || []).includes(cap.key);
                      const isLoading = togglingCapability === cap.key;
                      return (
                        <button
                          key={cap.key}
                          onClick={() => handleToggleCapability(cap.key, on)}
                          disabled={isLoading}
                          className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-all flex items-center gap-1 ${
                            on
                              ? cap.chipClass + ' opacity-100'
                              : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300'
                          } disabled:opacity-50`}
                        >
                          {isLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                          {cap.label}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Toggles save instantly. Removing a capability does not delete linked records.
                  </p>
                </div>

                {/* Linked Records */}
                <div>
                  <h3 className="text-sm font-semibold text-navy mb-2">Linked Records</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                      <span className="text-gray-600">Suppliers row</span>
                      {manageDetails.linked.supplier ? (
                        <span className="text-xs text-green-700">
                          Created {new Date(manageDetails.linked.supplier.created_at).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                      <span className="text-gray-600">Ambassadors row</span>
                      {manageDetails.linked.ambassador ? (
                        <span className="text-xs text-green-700">
                          Created {new Date(manageDetails.linked.ambassador.created_at).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                      <span className="text-gray-600">Members row</span>
                      {manageDetails.linked.member ? (
                        <span className="text-xs text-green-700">
                          {manageDetails.linked.member.tier || 'free'} · Created {new Date(manageDetails.linked.member.created_at).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-gray-100">
                  <button
                    onClick={closeManage}
                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-navy transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-green-600" />
                <h2 className="text-lg font-bold text-navy">Add New User</h2>
              </div>
              <button
                onClick={() => { setShowAddUser(false); resetAddForm(); }}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Email *</label>
                  <input
                    type="email"
                    value={addForm.email}
                    onChange={(e) => setAddForm(p => ({ ...p, email: e.target.value }))}
                    placeholder="user@example.com"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={addForm.full_name}
                    onChange={(e) => setAddForm(p => ({ ...p, full_name: e.target.value }))}
                    placeholder="Jane Farmer"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Primary Role *</label>
                  <select
                    value={addForm.role}
                    onChange={(e) => setAddForm(p => ({ ...p, role: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500/50"
                  >
                    {PRIMARY_ROLE_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Country</label>
                  <select
                    value={addForm.country}
                    onChange={(e) => setAddForm(p => ({ ...p, country: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500/50"
                  >
                    <option value="">Select country</option>
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
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={addForm.phone}
                    onChange={(e) => setAddForm(p => ({ ...p, phone: e.target.value }))}
                    placeholder="+254 700 000 000"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">Additional Capabilities</label>
                <div className="flex flex-wrap gap-2">
                  {CAPABILITY_LIST.map((cap) => {
                    const on = addForm.capabilities.includes(cap.key);
                    return (
                      <button
                        key={cap.key}
                        type="button"
                        onClick={() => toggleAddCapability(cap.key)}
                        className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-all ${
                          on
                            ? cap.chipClass
                            : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {cap.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="send_welcome"
                  checked={addForm.send_welcome}
                  onChange={(e) => setAddForm(p => ({ ...p, send_welcome: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <label htmlFor="send_welcome" className="text-sm text-gray-700">
                  Send welcome email with login credentials
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  onClick={() => { setShowAddUser(false); resetAddForm(); }}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-navy transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddUser}
                  disabled={addSubmitting || !addForm.email || !addForm.full_name}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white text-sm font-semibold rounded-lg hover:from-green-700 hover:to-green-800 transition-all disabled:opacity-50"
                >
                  {addSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                  Create User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-red-600" />
                <h2 className="text-lg font-bold text-navy">Delete User</h2>
              </div>
              <button
                onClick={closeDeleteConfirm}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-700">
                Delete <strong>{deleteTarget.full_name || deleteTarget.email}</strong>?
                This will <strong>soft-delete</strong> the account — the user will be
                anonymized, banned from sign-in, and their role set to{' '}
                <code className="bg-gray-100 px-1 rounded">deleted</code>.
              </p>
              <p className="text-xs text-gray-500">
                Linked records (suppliers, members, ambassadors) are preserved for audit history.
              </p>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Type <code className="bg-red-50 text-red-700 px-1 rounded">DELETE</code> to confirm
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="DELETE"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  onClick={closeDeleteConfirm}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-navy transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteUser}
                  disabled={deleting || deleteConfirmText !== 'DELETE'}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Delete User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toasts */}
      {errorMsg && (
        <div className="fixed top-4 right-4 z-[60] px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium bg-red-600">
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="fixed top-4 right-4 z-[60] px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium bg-green-600">
          {successMsg}
        </div>
      )}
    </div>
  );
}
