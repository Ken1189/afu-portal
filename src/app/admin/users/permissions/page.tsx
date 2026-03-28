'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/supabase/auth-context';
import { createClient } from '@/lib/supabase/client';
import {
  PERMISSION_GROUPS,
  PERMISSION_TEMPLATES,
  ALL_PERMISSIONS,
  type Permission,
} from '@/lib/permissions';
import {
  ShieldCheck,
  Users,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertCircle,
  Search,
  Loader2,
  Crown,
  Save,
} from 'lucide-react';

// ── Toast component ──────────────────────────────────────────────────────

function Toast({
  message,
  type,
  onClose,
}: {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium ${
        type === 'success' ? 'bg-green-600' : 'bg-red-600'
      }`}
    >
      {type === 'success' ? (
        <CheckCircle2 className="w-4 h-4" />
      ) : (
        <AlertCircle className="w-4 h-4" />
      )}
      {message}
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">
        &times;
      </button>
    </div>
  );
}

// ── Types ────────────────────────────────────────────────────────────────

interface AdminUser {
  id: string;
  full_name: string;
  email: string;
  role: string;
}

// ── Permission editor for a single user ──────────────────────────────────

function UserPermissionEditor({
  adminUser,
  onSave,
  onToast,
}: {
  adminUser: AdminUser;
  onSave: () => void;
  onToast: (msg: string, type: 'success' | 'error') => void;
}) {
  const [permissions, setPermissions] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch current permissions for this user
  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/permissions?userId=${adminUser.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.permissions) {
          setPermissions(new Set(data.permissions));
        }
      })
      .catch(() => onToast('Failed to load permissions', 'error'))
      .finally(() => setLoading(false));
  }, [adminUser.id, onToast]);

  const togglePermission = (perm: string) => {
    setPermissions((prev) => {
      const next = new Set(prev);
      if (next.has(perm)) next.delete(perm);
      else next.add(perm);
      return next;
    });
  };

  const toggleGroup = (groupPerms: string[]) => {
    const allSelected = groupPerms.every((p) => permissions.has(p));
    setPermissions((prev) => {
      const next = new Set(prev);
      groupPerms.forEach((p) => {
        if (allSelected) next.delete(p);
        else next.add(p);
      });
      return next;
    });
  };

  const applyTemplate = (templateName: string) => {
    const templatePerms = PERMISSION_TEMPLATES[templateName];
    if (templatePerms) {
      setPermissions(new Set(templatePerms));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: adminUser.id,
          permissions: Array.from(permissions),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save');
      }

      onToast(`Permissions saved for ${adminUser.full_name || adminUser.email}`, 'success');
      onSave();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save permissions';
      onToast(message, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-green-600" />
        <span className="ml-2 text-sm text-gray-500">Loading permissions...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Quick Templates */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Quick Templates:
        </span>
        {Object.keys(PERMISSION_TEMPLATES).map((name) => (
          <button
            key={name}
            onClick={() => applyTemplate(name)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 bg-white hover:bg-green-50 hover:border-green-300 text-gray-700 hover:text-green-700 transition-colors"
          >
            {name}
          </button>
        ))}
        <button
          onClick={() => setPermissions(new Set())}
          className="px-3 py-1.5 text-xs font-medium rounded-lg border border-red-200 bg-white hover:bg-red-50 text-red-600 transition-colors"
        >
          Clear All
        </button>
      </div>

      {/* Permission groups as cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {PERMISSION_GROUPS.map((group) => {
          const groupPermKeys = group.permissions.map((p) => p.key);
          const allSelected = groupPermKeys.every((k) => permissions.has(k));
          const someSelected = groupPermKeys.some((k) => permissions.has(k));

          return (
            <div
              key={group.label}
              className={`border rounded-xl p-4 transition-colors ${
                someSelected ? 'border-green-300 bg-green-50/50' : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-800">{group.label}</h4>
                <button
                  onClick={() => toggleGroup(groupPermKeys)}
                  className={`text-xs font-medium px-2 py-1 rounded-md transition-colors ${
                    allSelected
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {allSelected ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              <div className="space-y-2">
                {group.permissions.map((perm) => (
                  <label
                    key={perm.key}
                    className="flex items-center gap-2 cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      checked={permissions.has(perm.key)}
                      onChange={() => togglePermission(perm.key)}
                      className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
                    />
                    <span className="text-sm text-gray-700 group-hover:text-gray-900">
                      {perm.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary + Save */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-gray-100">
        <p className="text-sm text-gray-500">
          {permissions.size} of {ALL_PERMISSIONS.length} permissions selected
        </p>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium rounded-xl transition-colors text-sm shadow-sm"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saving ? 'Saving...' : 'Save Permissions'}
        </button>
      </div>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────

export default function PermissionsPage() {
  const router = useRouter();
  const { user, isSuperAdmin, isLoading: authLoading } = useAuth();
  const supabase = createClient();

  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((msg: string, type: 'success' | 'error') => {
    setToast({ message: msg, type });
  }, []);

  // Fetch admin users
  const fetchAdminUsers = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, role')
      .in('role', ['admin', 'super_admin'])
      .order('role', { ascending: false })
      .order('full_name', { ascending: true });

    if (!error && data) {
      setAdminUsers(data as AdminUser[]);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    if (!authLoading && user) {
      fetchAdminUsers();
    }
  }, [authLoading, user, fetchAdminUsers]);

  // Redirect if not super_admin
  useEffect(() => {
    if (!authLoading && !isSuperAdmin) {
      router.replace('/admin');
    }
  }, [authLoading, isSuperAdmin, router]);

  if (authLoading || !isSuperAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-green-600" />
      </div>
    );
  }

  // Filter users by search
  const filteredUsers = adminUsers.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      u.full_name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Toast */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-green-600" />
            Permission Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Assign granular permissions to admin users. Super admins automatically have full access.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent w-64"
            />
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-100 rounded-xl p-4">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total Admins</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{adminUsers.length}</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-4">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Super Admins</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {adminUsers.filter((u) => u.role === 'super_admin').length}
          </p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-4">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Regular Admins</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {adminUsers.filter((u) => u.role === 'admin').length}
          </p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-4">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
            Permission Groups
          </p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{PERMISSION_GROUPS.length}</p>
        </div>
      </div>

      {/* Users list */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-green-600" />
          <span className="ml-2 text-gray-500">Loading admin users...</span>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-16 bg-white border border-gray-100 rounded-xl">
          <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No admin users found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredUsers.map((adminUser) => {
            const isExpanded = expandedUserId === adminUser.id;
            const isSA = adminUser.role === 'super_admin';

            return (
              <div
                key={adminUser.id}
                className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm"
              >
                {/* User row */}
                <button
                  onClick={() =>
                    setExpandedUserId(isExpanded ? null : adminUser.id)
                  }
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600">
                      {adminUser.full_name
                        ? adminUser.full_name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .toUpperCase()
                            .slice(0, 2)
                        : adminUser.email?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {adminUser.full_name || 'Unnamed User'}
                      </p>
                      <p className="text-xs text-gray-500">{adminUser.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {isSA ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">
                        <Crown className="w-3 h-3" />
                        Super Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                        Admin
                      </span>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </button>

                {/* Expanded editor */}
                {isExpanded && (
                  <div className="border-t border-gray-100 px-5 py-5 bg-gray-50/50">
                    {isSA ? (
                      <div className="flex items-center gap-3 py-4 px-4 bg-amber-50 border border-amber-200 rounded-xl">
                        <Crown className="w-5 h-5 text-amber-600" />
                        <div>
                          <p className="text-sm font-semibold text-amber-800">
                            Full Access (automatic)
                          </p>
                          <p className="text-xs text-amber-600">
                            Super admins have all permissions by default. No editing needed.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <UserPermissionEditor
                        adminUser={adminUser}
                        onSave={fetchAdminUsers}
                        onToast={showToast}
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
