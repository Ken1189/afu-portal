'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Search, Users, CheckCircle2, Clock, Ban, Eye, UserPlus,
  MapPin, CreditCard, Loader2, Download,
} from 'lucide-react';
import { useMembers } from '@/lib/supabase/use-members';

const tierColors: Record<string, string> = {
  student: 'bg-gray-100 text-gray-600',
  new_enterprise: 'bg-blue-100 text-blue-700',
  smallholder: 'bg-teal/10 text-teal',
  farmer_grower: 'bg-green-100 text-green-700',
  commercial: 'bg-navy/10 text-navy',
};

const tierLabels: Record<string, string> = {
  student: 'Student',
  new_enterprise: 'New Enterprise',
  smallholder: 'Smallholder',
  farmer_grower: 'Farmer Grower',
  commercial: 'Commercial',
};

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  pending: 'bg-amber-100 text-amber-700',
  suspended: 'bg-red-100 text-red-700',
  expired: 'bg-gray-100 text-gray-500',
};

export default function AdminMembersPage() {
  const { members, loading, stats, suspendMember, activateMember } = useMembers();
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [countryFilter, setCountryFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ id: string; action: 'suspend' | 'activate' } | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let result = [...members];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(m =>
        m.member_id.toLowerCase().includes(q) ||
        m.profile?.full_name?.toLowerCase().includes(q) ||
        m.profile?.email?.toLowerCase().includes(q) ||
        m.farm_name?.toLowerCase().includes(q)
      );
    }
    if (tierFilter !== 'all') result = result.filter(m => m.tier === tierFilter);
    if (statusFilter !== 'all') result = result.filter(m => m.status === statusFilter);
    if (countryFilter !== 'all') result = result.filter(m => m.profile?.country === countryFilter);
    return result;
  }, [members, searchQuery, tierFilter, statusFilter, countryFilter]);

  const handleAction = async (id: string, action: 'suspend' | 'activate') => {
    setActionLoading(id);
    const result = action === 'suspend' ? await suspendMember(id) : await activateMember(id);
    setActionLoading(null);
    setConfirmAction(null);
    if (result.error) {
      setErrorMsg(`Error: ${result.error}`);
      setTimeout(() => setErrorMsg(null), 3000);
    } else {
      const name = members.find(m => m.id === id)?.profile?.full_name || 'Member';
      setSuccessMsg(`${name} has been ${action === 'suspend' ? 'suspended' : 'activated'} successfully.`);
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Member ID', 'Name', 'Email', 'Tier', 'Country', 'Farm', 'Status', 'Join Date'];
    const rows = filtered.map(m => [
      m.member_id,
      m.profile?.full_name || '',
      m.profile?.email || '',
      m.tier,
      m.profile?.country || '',
      m.farm_name || '',
      m.status,
      m.join_date,
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `afu-members-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const summaryCards = [
    { label: 'Total Members', value: stats.total, icon: <Users className="w-5 h-5" />, color: 'text-teal', bg: 'bg-teal/10' },
    { label: 'Active', value: stats.active, icon: <CheckCircle2 className="w-5 h-5" />, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Pending', value: stats.pending, icon: <Clock className="w-5 h-5" />, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Suspended', value: stats.suspended, icon: <Ban className="w-5 h-5" />, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">Members</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage all AFU members</p>
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
                {card.icon}
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
              placeholder="Search by name, ID, email, or farm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal/50"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select value={tierFilter} onChange={(e) => setTierFilter(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
              <option value="all">All Tiers</option>
              <option value="student">Student</option>
              <option value="new_enterprise">New Enterprise</option>
              <option value="smallholder">Smallholder</option>
              <option value="farmer_grower">Farmer Grower</option>
              <option value="commercial">Commercial</option>
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
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
          Showing {filtered.length} of {stats.total} members
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-8">
          <Loader2 className="w-6 h-6 text-teal animate-spin mx-auto mb-2" />
          <p className="text-sm text-gray-500">Loading members...</p>
        </div>
      )}

      {/* Table */}
      {!loading && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-cream/50">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Member ID</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Name</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Email</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Tier</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Country</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Farm</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((m) => (
                  <tr key={m.id} className="hover:bg-cream/50 transition-colors">
                    <td className="py-3 px-4 font-mono text-xs text-gray-500">{m.member_id}</td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-navy">{m.profile?.full_name || '—'}</p>
                    </td>
                    <td className="py-3 px-4 text-gray-500">{m.profile?.email || '—'}</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${tierColors[m.tier] || 'bg-gray-100 text-gray-600'}`}>
                        {tierLabels[m.tier] || m.tier}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 text-gray-500">
                        <MapPin className="w-3 h-3" />
                        {m.profile?.country || '—'}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-500">{m.farm_name || '—'}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[m.status]}`}>
                        {m.status === 'active' && <CheckCircle2 className="w-3 h-3" />}
                        {m.status === 'pending' && <Clock className="w-3 h-3" />}
                        {m.status === 'suspended' && <Ban className="w-3 h-3" />}
                        {m.status.charAt(0).toUpperCase() + m.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/admin/members/${m.id}`} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-navy transition-colors">
                          <Eye className="w-4 h-4" />
                        </Link>
                        {m.status === 'active' && (
                          <button
                            onClick={() => setConfirmAction({ id: m.id, action: 'suspend' })}
                            disabled={actionLoading === m.id}
                            className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                            title="Suspend"
                          >
                            {actionLoading === m.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ban className="w-4 h-4" />}
                          </button>
                        )}
                        {m.status === 'suspended' && (
                          <button
                            onClick={() => setConfirmAction({ id: m.id, action: 'activate' })}
                            disabled={actionLoading === m.id}
                            className="p-2 rounded-lg hover:bg-green-50 text-gray-400 hover:text-green-600 transition-colors disabled:opacity-50"
                            title="Activate"
                          >
                            {actionLoading === m.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && !loading && (
            <div className="py-16 text-center">
              <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">
                {stats.total === 0 ? 'No members yet. Members are created when applications are approved.' : 'No members match your filters'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl">
            <h3 className="text-lg font-bold text-navy mb-2">
              {confirmAction.action === 'suspend' ? 'Suspend Member?' : 'Activate Member?'}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {confirmAction.action === 'suspend'
                ? 'This member will be suspended and lose access to the platform. You can reactivate them later.'
                : 'This member will be reactivated and regain full access to the platform.'}
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setConfirmAction(null)}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAction(confirmAction.id, confirmAction.action)}
                disabled={!!actionLoading}
                className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 ${
                  confirmAction.action === 'suspend'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {confirmAction.action === 'suspend' ? 'Suspend' : 'Activate'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {successMsg && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium bg-green-600">
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium bg-red-600">
          {errorMsg}
        </div>
      )}
    </div>
  );
}
