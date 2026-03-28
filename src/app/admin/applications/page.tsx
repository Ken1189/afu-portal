'use client';

import { useState, useMemo } from 'react';
import {
  Search, FileText, CheckCircle2, XCircle, Clock, Eye,
  Users, Loader2, AlertCircle,
} from 'lucide-react';
import { useApplications, type ApplicationRow } from '@/lib/supabase/use-applications';
import type { ApplicationStatus } from '@/lib/supabase/types';

// ── Status styling ──────────────────────────────────────────────────────────

const statusColors: Record<ApplicationStatus, string> = {
  pending: 'bg-amber-100 text-amber-700',
  under_review: 'bg-blue-100 text-blue-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-600',
};

const statusLabels: Record<ApplicationStatus, string> = {
  pending: 'Pending',
  under_review: 'Under Review',
  approved: 'Approved',
  rejected: 'Rejected',
};

const statusIcons: Record<ApplicationStatus, React.ReactNode> = {
  pending: <Clock className="w-3 h-3" />,
  under_review: <Eye className="w-3 h-3" />,
  approved: <CheckCircle2 className="w-3 h-3" />,
  rejected: <XCircle className="w-3 h-3" />,
};

// ── Tier styling ────────────────────────────────────────────────────────────

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

// ── Filter tab type ─────────────────────────────────────────────────────────

type FilterTab = 'all' | ApplicationStatus;

const filterTabs: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'under_review', label: 'Under Review' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
];

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// ═════════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════════════

export default function AdminApplicationsPage() {
  const {
    applications,
    loading,
    error,
    stats,
    approveApplication,
    rejectApplication,
  } = useApplications();

  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{message: string, type: 'success'|'error'}|null>(null);
  const showToast = (message: string, type: 'success'|'error' = 'success') => { setToast({message, type}); setTimeout(() => setToast(null), 3000); };
  const [tempPasswordModal, setTempPasswordModal] = useState<{
    email: string;
    tempPassword: string | null;
    message: string;
  } | null>(null);

  // ── Filtered & searched applications ──
  const filtered = useMemo(() => {
    let result = [...applications];

    // Status filter
    if (activeTab !== 'all') {
      result = result.filter((a) => a.status === activeTab);
    }

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.full_name.toLowerCase().includes(q) ||
          a.email.toLowerCase().includes(q) ||
          a.country.toLowerCase().includes(q)
      );
    }

    return result;
  }, [applications, activeTab, searchQuery]);

  // ── Actions ──
  const handleApprove = async (app: ApplicationRow) => {
    setActionLoading(app.id);
    try {
      const res = await fetch('/api/admin/applications/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId: app.id }),
      });
      const data = await res.json();
      if (data.success) {
        setTempPasswordModal({
          email: app.email,
          tempPassword: data.tempPassword,
          message: data.message,
        });
        // Also update the local state
        await approveApplication(app.id, app.profile_id || '');
      } else {
        showToast('Error approving: ' + (data.error || 'Unknown error'), 'error');
      }
    } catch {
      showToast('Failed to approve application. Please try again.', 'error');
    }
    setActionLoading(null);
  };

  const handleReject = async (app: ApplicationRow) => {
    setActionLoading(app.id);
    await rejectApplication(app.id);
    setActionLoading(null);
  };

  // ── Tab counts ──
  const tabCounts: Record<FilterTab, number> = {
    all: stats.total,
    pending: stats.pending,
    under_review: stats.underReview,
    approved: stats.approved,
    rejected: stats.rejected,
  };

  // ── Summary cards ──
  const summaryCards = [
    { label: 'Total Applications', value: stats.total, icon: <Users className="w-5 h-5" />, color: 'text-teal', bg: 'bg-teal/10' },
    { label: 'Pending', value: stats.pending, icon: <Clock className="w-5 h-5" />, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Under Review', value: stats.underReview, icon: <Eye className="w-5 h-5" />, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Approved', value: stats.approved, icon: <CheckCircle2 className="w-5 h-5" />, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Rejected', value: stats.rejected, icon: <XCircle className="w-5 h-5" />, color: 'text-red-500', bg: 'bg-red-50' },
  ];

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-navy rounded-xl flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-navy">Membership Applications</h1>
            <p className="text-sm text-gray-500 mt-0.5">Review and manage membership applications</p>
          </div>
        </div>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
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

      {/* ── Status Filter Tabs ── */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          {/* Tabs */}
          <div className="flex gap-1 bg-gray-50 rounded-lg p-1">
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'bg-navy text-white shadow-sm'
                    : 'text-gray-500 hover:text-navy hover:bg-white'
                }`}
              >
                {tab.label}
                {tabCounts[tab.key] > 0 && (
                  <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                    activeTab === tab.key ? 'bg-white/20' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {tabCounts[tab.key]}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or country..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal/50"
            />
          </div>
        </div>

        <p className="text-xs text-gray-400 mt-3">
          Showing {filtered.length} of {stats.total} applications
        </p>
      </div>

      {/* ── Error State ── */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* ── Loading State ── */}
      {loading && (
        <div className="text-center py-8">
          <Loader2 className="w-6 h-6 text-teal animate-spin mx-auto mb-2" />
          <p className="text-sm text-gray-500">Loading applications...</p>
        </div>
      )}

      {/* ── Applications Table ── */}
      {!loading && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-cream/50">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Name</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Email</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Country</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Tier</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Date</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((app) => (
                  <tr key={app.id} className="hover:bg-cream/50 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-medium text-navy">{app.full_name}</p>
                    </td>
                    <td className="py-3 px-4 text-gray-500">{app.email}</td>
                    <td className="py-3 px-4 text-gray-500">{app.country}</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${tierColors[app.requested_tier] || 'bg-gray-100 text-gray-600'}`}>
                        {tierLabels[app.requested_tier] || app.requested_tier}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[app.status]}`}>
                        {statusIcons[app.status]}
                        {statusLabels[app.status]}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-400 text-xs">
                      {formatDate(app.created_at)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
                        {(app.status === 'pending' || app.status === 'under_review') && (
                          <>
                            <button
                              onClick={() => handleApprove(app)}
                              disabled={actionLoading === app.id}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-green-50 text-green-700 hover:bg-green-100 transition-colors disabled:opacity-50"
                              title="Approve"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(app)}
                              disabled={actionLoading === app.id}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
                              title="Reject"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              Reject
                            </button>
                          </>
                        )}
                        {app.status === 'approved' && (
                          <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                          </span>
                        )}
                        {app.status === 'rejected' && (
                          <span className="text-xs text-red-500 font-medium flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5" /> Rejected
                          </span>
                        )}
                        {actionLoading === app.id && (
                          <Loader2 className="w-4 h-4 text-teal animate-spin ml-1" />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filtered.length === 0 && !loading && (
            <div className="py-16 text-center">
              <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">
                {stats.total === 0
                  ? 'No applications yet.'
                  : 'No applications match your filters.'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium transition-all ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.message}
        </div>
      )}

      {/* ── Temp Password Modal ── */}
      {tempPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-navy">Application Approved</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">{tempPasswordModal.message}</p>
            {tempPasswordModal.tempPassword && (
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <p className="text-xs text-gray-500 mb-1">Email</p>
                <p className="text-sm font-medium text-navy mb-3">{tempPasswordModal.email}</p>
                <p className="text-xs text-gray-500 mb-1">Temporary Password</p>
                <div className="flex items-center gap-2">
                  <code className="text-sm font-mono font-bold text-teal bg-teal/10 px-3 py-1.5 rounded-lg">
                    {tempPasswordModal.tempPassword}
                  </code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(tempPasswordModal.tempPassword || '');
                    }}
                    className="text-xs text-teal hover:text-teal/80 font-medium"
                  >
                    Copy
                  </button>
                </div>
                <p className="text-xs text-amber-600 mt-3">
                  Share these credentials securely with the applicant. They should change their password on first login.
                </p>
              </div>
            )}
            <button
              onClick={() => setTempPasswordModal(null)}
              className="w-full py-2.5 bg-navy text-white rounded-xl text-sm font-semibold hover:bg-navy/90 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
