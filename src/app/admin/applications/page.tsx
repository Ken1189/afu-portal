'use client';

import React, { useState, useMemo } from 'react';
import {
  Search, FileText, CheckCircle2, XCircle, Clock, Eye,
  Users, Loader2, AlertCircle, ChevronRight, Phone, MapPin, Wheat, Building2,
} from 'lucide-react';
import { useApplications, type ApplicationRow } from '@/lib/supabase/use-applications';
import type { ApplicationStatus } from '@/lib/supabase/types';
import Pagination from '@/components/admin/Pagination';

// ── Status styling ──────────────────────────────────────────────────────────

const statusColors: Record<ApplicationStatus, string> = {
  pending: 'bg-amber-100 text-amber-700',
  pending_verification: 'bg-purple-100 text-purple-700',
  under_review: 'bg-blue-100 text-blue-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-600',
};

const statusLabels: Record<ApplicationStatus, string> = {
  pending: 'Pending',
  pending_verification: 'Awaiting Email',
  under_review: 'Under Review',
  approved: 'Approved',
  rejected: 'Rejected',
};

const statusIcons: Record<ApplicationStatus, React.ReactNode> = {
  pending: <Clock className="w-3 h-3" />,
  pending_verification: <Clock className="w-3 h-3" />,
  under_review: <Eye className="w-3 h-3" />,
  approved: <CheckCircle2 className="w-3 h-3" />,
  rejected: <XCircle className="w-3 h-3" />,
};

// ── Tier styling ────────────────────────────────────────────────────────────

const tierColors: Record<string, string> = {
  free: 'bg-gray-100 text-gray-600',
  student: 'bg-gray-100 text-gray-600',
  new_enterprise: 'bg-blue-100 text-blue-700',
  smallholder: 'bg-teal/10 text-teal',
  farmer_grower: 'bg-green-100 text-green-700',
  commercial: 'bg-navy/10 text-navy',
  enterprise: 'bg-purple-100 text-purple-700',
  partner: 'bg-indigo-100 text-indigo-700',
  ambassador: 'bg-amber-100 text-amber-700',
  driver: 'bg-orange-100 text-orange-700',
  trader: 'bg-cyan-100 text-cyan-700',
  vet: 'bg-pink-100 text-pink-700',
  offtaker: 'bg-lime-100 text-lime-700',
  processing_hub: 'bg-violet-100 text-violet-700',
  talent: 'bg-sky-100 text-sky-700',
};

const tierLabels: Record<string, string> = {
  free: 'Free',
  student: 'Student',
  new_enterprise: 'New Enterprise',
  smallholder: 'Smallholder',
  farmer_grower: 'Farmer Grower',
  commercial: 'Commercial',
  enterprise: 'Enterprise',
  partner: 'Partner / Vendor',
  ambassador: 'Ambassador',
  driver: 'Foober Driver',
  trader: 'Trader',
  vet: 'Veterinary',
  offtaker: 'Offtaker',
  processing_hub: 'Processing Hub',
  talent: 'Talent / Job Seeker',
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

const PAGE_SIZE = 50;

export default function AdminApplicationsPage() {
  const [page, setPage] = useState(1);
  const {
    applications,
    loading,
    error,
    stats,
    totalCount,
    approveApplication,
    rejectApplication,
  } = useApplications(page, PAGE_SIZE);

  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);

  // ── Multi-source applications (Foober drivers, service providers, talent) ──
  const [otherApps, setOtherApps] = useState<ApplicationRow[]>([]);
  const [otherLoading, setOtherLoading] = useState(true);

  React.useEffect(() => {
    async function fetchOtherSources() {
      setOtherLoading(true);
      const supabase = (await import('@/lib/supabase/client')).createClient();
      const results: ApplicationRow[] = [];

      // Foober driver applications
      try {
        const { data: drivers } = await supabase.from('foober_driver_applications').select('*').order('created_at', { ascending: false }).limit(100);
        if (drivers) {
          for (const d of drivers) {
            results.push({
              id: d.id, full_name: d.full_name, email: d.email, phone: d.phone || '',
              country: d.country || '', region: d.region || '', status: d.status as any,
              requested_tier: 'driver' as any, farm_name: d.vehicle_type || '', farm_size_ha: null,
              primary_crops: [], notes: d.experience_description || `Vehicle: ${d.vehicle_type}, Reg: ${d.vehicle_registration || 'N/A'}`,
              created_at: d.created_at, updated_at: d.created_at, reviewed_by: d.reviewed_by, reviewed_at: d.reviewed_at,
              _source: 'driver' as any,
            } as any);
          }
        }
      } catch { /* table may not exist */ }

      // Service provider applications (traders, vets, offtakers, processing)
      try {
        const { data: providers } = await supabase.from('service_provider_applications').select('*').order('created_at', { ascending: false }).limit(100);
        if (providers) {
          for (const p of providers) {
            results.push({
              id: p.id, full_name: p.full_name, email: p.email, phone: p.phone || '',
              country: p.country || '', region: p.region || '', status: p.status as any,
              requested_tier: p.provider_type as any, farm_name: p.business_name || '', farm_size_ha: null,
              primary_crops: [], notes: p.motivation || '',
              created_at: p.created_at, updated_at: p.updated_at, reviewed_by: p.reviewed_by, reviewed_at: p.reviewed_at,
              _source: p.provider_type as any,
            } as any);
          }
        }
      } catch { /* table may not exist */ }

      // Talent applications
      try {
        const { data: talent } = await supabase.from('talent_applications').select('*').order('created_at', { ascending: false }).limit(100);
        if (talent) {
          for (const t of talent) {
            results.push({
              id: t.id, full_name: t.full_name, email: t.email, phone: t.phone || '',
              country: t.country || '', region: t.region || '', status: t.status as any,
              requested_tier: 'talent' as any, farm_name: t.job_title || '', farm_size_ha: null,
              primary_crops: t.skills || [], notes: t.bio || '',
              created_at: t.created_at, updated_at: t.updated_at, reviewed_by: t.reviewed_by, reviewed_at: t.reviewed_at,
              _source: 'talent' as any,
            } as any);
          }
        }
      } catch { /* table may not exist */ }

      setOtherApps(results);
      setOtherLoading(false);
    }
    fetchOtherSources();
  }, []);

  // Merge all applications
  const allApplications = React.useMemo(() => {
    const membership = applications.map((a: any) => ({ ...a, _source: 'membership' }));
    const merged = [...membership, ...otherApps];
    // Filter by source
    if (sourceFilter !== 'all') {
      return merged.filter((a: any) => a._source === sourceFilter);
    }
    return merged.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [applications, otherApps, sourceFilter]);

  // Source counts for filter badges
  const sourceCounts = React.useMemo(() => {
    const membership = applications.map((a: any) => ({ ...a, _source: 'membership' }));
    const all = [...membership, ...otherApps];
    return {
      all: all.length,
      membership: membership.length,
      driver: otherApps.filter((a: any) => a._source === 'driver').length,
      trader: otherApps.filter((a: any) => a._source === 'trader').length,
      vet: otherApps.filter((a: any) => a._source === 'vet').length,
      offtaker: otherApps.filter((a: any) => a._source === 'offtaker').length,
      processing_hub: otherApps.filter((a: any) => a._source === 'processing_hub').length,
      talent: otherApps.filter((a: any) => a._source === 'talent').length,
    };
  }, [applications, otherApps]);

  // Bulk action handler
  const handleBulkAction = async (status: 'approved' | 'rejected') => {
    if (selectedIds.size === 0) return;
    const action = status === 'approved' ? 'approve' : 'reject';
    if (!confirm(`${action === 'approve' ? 'Approve' : 'Reject'} ${selectedIds.size} application${selectedIds.size > 1 ? 's' : ''}? This cannot be undone.`)) return;
    setBulkLoading(true);
    try {
      const res = await fetch('/api/admin/bulk/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: Array.from(selectedIds),
          action: status === 'approved' ? 'approve' : 'reject',
          entity: 'membership_applications',
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        showToast(`${selectedIds.size} application${selectedIds.size > 1 ? 's' : ''} ${status}.`, 'success');
        // Refresh local state for each by approving/rejecting individually as a safe fallback
        for (const id of selectedIds) {
          const app = applications.find(a => a.id === id);
          if (!app) continue;
          if (status === 'approved') await approveApplication(id, app.profile_id || '');
          else await rejectApplication(id);
        }
        setSelectedIds(new Set());
      } else {
        showToast(data.error || 'Bulk action failed', 'error');
      }
    } catch {
      showToast('Network error during bulk action', 'error');
    }
    setBulkLoading(false);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelectedIds(prev => {
      // If all currently filtered are selected, clear; else select all filtered
      const allIds = filtered.map(f => f.id);
      const allSelected = allIds.every(id => prev.has(id)) && allIds.length > 0;
      if (allSelected) return new Set();
      return new Set(allIds);
    });
  };

  // CSV Export
  const handleExport = () => {
    const csv = [
      'Name,Email,Phone,Country,Tier,Status,Created',
      ...filtered.map(row => `"${(row.full_name || '').replace(/"/g, '""')}","${(row.email || '').replace(/"/g, '""')}","${(row.phone || '').replace(/"/g, '""')}","${(row.country || '').replace(/"/g, '""')}","${row.requested_tier || ''}","${row.status}","${row.created_at}"`)
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `applications-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };
  const [toast, setToast] = useState<{message: string, type: 'success'|'error'}|null>(null);
  const showToast = (message: string, type: 'success'|'error' = 'success') => { setToast({message, type}); setTimeout(() => setToast(null), 3000); };
  const [tempPasswordModal, setTempPasswordModal] = useState<{
    email: string;
    tempPassword: string | null;
    message: string;
  } | null>(null);

  // ── Filtered & searched applications ──
  const filtered = useMemo(() => {
    let result = [...allApplications];

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
    // Send rejection notification email (fire and forget)
    fetch('/api/admin/applications/reject-notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: app.email,
        full_name: app.full_name,
        notes: app.notes || '',
        type: app.requested_tier,
      }),
    }).catch(() => {});
    showToast('Application rejected. Notification sent.', 'success');
    setActionLoading(null);
  };

  // ── Tab counts ──
  // Tab counts from ALL merged sources
  const mergedPending = allApplications.filter(a => a.status === 'pending' || a.status === 'applied').length;
  const mergedApproved = allApplications.filter(a => a.status === 'approved' || a.status === 'hired').length;
  const mergedRejected = allApplications.filter(a => a.status === 'rejected').length;
  const mergedUnderReview = allApplications.filter(a => a.status === 'under_review' || a.status === 'shortlisted' || a.status === 'interviewed').length;
  const mergedVerification = allApplications.filter(a => a.status === 'pending_verification').length;

  const tabCounts: Record<FilterTab, number> = {
    all: allApplications.length,
    pending: mergedPending,
    pending_verification: mergedVerification,
    under_review: mergedUnderReview,
    approved: mergedApproved,
    rejected: mergedRejected,
  };

  // ── Summary cards ──
  const summaryCards = [
    { label: 'Total Applications', value: allApplications.length, icon: <Users className="w-5 h-5" />, color: 'text-teal', bg: 'bg-teal/10' },
    { label: 'Pending', value: mergedPending, icon: <Clock className="w-5 h-5" />, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Under Review', value: mergedUnderReview, icon: <Eye className="w-5 h-5" />, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Approved', value: mergedApproved, icon: <CheckCircle2 className="w-5 h-5" />, color: 'text-green-600', bg: 'bg-green-50' },
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
            <h1 className="text-2xl font-bold text-navy">All Applications</h1>
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

      {/* ── Source Filter (All application types) ── */}
      <div className="flex gap-1.5 flex-wrap mb-3">
        {[
          { key: 'all', label: 'All Sources' },
          { key: 'membership', label: 'Membership' },
          { key: 'driver', label: 'Drivers' },
          { key: 'trader', label: 'Traders' },
          { key: 'vet', label: 'Vets' },
          { key: 'offtaker', label: 'Offtakers' },
          { key: 'processing_hub', label: 'Processing' },
          { key: 'talent', label: 'Talent' },
        ].filter(s => s.key === 'all' || (sourceCounts as any)[s.key] > 0).map((s) => (
          <button
            key={s.key}
            onClick={() => setSourceFilter(s.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              sourceFilter === s.key ? 'bg-[#5DB347] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {s.label}
            {(sourceCounts as any)[s.key] > 0 && (
              <span className="ml-1 opacity-70">({(sourceCounts as any)[s.key]})</span>
            )}
          </button>
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

      {/* ── Bulk Action Toolbar ── */}
      {!loading && (
        <div className="bg-white rounded-xl border border-gray-100 px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 text-sm">
            {selectedIds.size > 0 ? (
              <>
                <span className="font-semibold text-navy">{selectedIds.size} selected</span>
                <span className="text-gray-300">|</span>
                <button
                  onClick={() => handleBulkAction('approved')}
                  disabled={bulkLoading}
                  className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 disabled:opacity-50"
                >
                  {bulkLoading ? 'Working...' : 'Approve All'}
                </button>
                <button
                  onClick={() => handleBulkAction('rejected')}
                  disabled={bulkLoading}
                  className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 disabled:opacity-50"
                >
                  Reject All
                </button>
                <button
                  onClick={() => setSelectedIds(new Set())}
                  className="px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-50"
                >
                  Clear
                </button>
              </>
            ) : (
              <span className="text-gray-400 text-xs">Select applications to bulk approve/reject</span>
            )}
          </div>
          <button
            onClick={handleExport}
            className="px-3 py-1.5 bg-navy text-white rounded-lg text-xs font-semibold hover:bg-navy/90"
          >
            Download CSV
          </button>
        </div>
      )}

      {/* ── Applications Table ── */}
      {!loading && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-cream/50">
                  <th className="w-10 py-3 px-2 text-center">
                    <input
                      type="checkbox"
                      checked={filtered.length > 0 && filtered.every(f => selectedIds.has(f.id))}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300"
                      aria-label="Select all"
                    />
                  </th>
                  <th className="w-8 py-3 px-2"></th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Name</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Email</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Phone</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Country</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Tier</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Date</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((app) => (
                  <React.Fragment key={app.id}>
                    <tr
                      className="hover:bg-cream/50 transition-colors cursor-pointer"
                      onClick={() => setExpandedId(expandedId === app.id ? null : app.id)}
                    >
                      <td className="py-3 px-2 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedIds.has(app.id)}
                          onChange={() => toggleSelect(app.id)}
                          className="rounded border-gray-300"
                          aria-label={`Select ${app.full_name}`}
                        />
                      </td>
                      <td className="py-3 px-2">
                        <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${expandedId === app.id ? 'rotate-90' : ''}`} />
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-medium text-navy">{app.full_name}</p>
                      </td>
                      <td className="py-3 px-4 text-gray-500 text-xs">{app.email}</td>
                      <td className="py-3 px-4 text-gray-500 text-xs">{app.phone || '—'}</td>
                      <td className="py-3 px-4 text-gray-500">{app.country}</td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${tierColors[app.requested_tier] || 'bg-gray-100 text-gray-600'}`}>
                          {tierLabels[app.requested_tier] || app.requested_tier}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[app.status as ApplicationStatus] || 'bg-gray-100 text-gray-600'}`}>
                          {statusIcons[app.status as ApplicationStatus] || <Clock className="w-3 h-3" />}
                          {statusLabels[app.status as ApplicationStatus] || app.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-400 text-xs">
                        {formatDate(app.created_at)}
                      </td>
                      <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
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
                    {/* ── Expanded Detail Row ── */}
                    {expandedId === app.id && (
                      <tr>
                        <td colSpan={10} className="bg-gray-50 px-6 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="space-y-2">
                              <p className="text-xs font-semibold text-gray-500 uppercase">Contact</p>
                              <div className="flex items-center gap-2 text-gray-700">
                                <Phone className="w-3.5 h-3.5 text-gray-400" />
                                {app.phone || 'No phone'}
                              </div>
                              <div className="flex items-center gap-2 text-gray-700">
                                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                                {app.country}{app.region ? `, ${app.region}` : ''}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <p className="text-xs font-semibold text-gray-500 uppercase">Farm Details</p>
                              <div className="flex items-center gap-2 text-gray-700">
                                <Building2 className="w-3.5 h-3.5 text-gray-400" />
                                {app.farm_name || 'No farm name'}
                              </div>
                              <div className="flex items-center gap-2 text-gray-700">
                                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                                {app.farm_size_ha ? `${app.farm_size_ha} hectares` : 'No size specified'}
                              </div>
                              <div className="flex items-center gap-2 text-gray-700">
                                <Wheat className="w-3.5 h-3.5 text-gray-400" />
                                {app.primary_crops?.length ? app.primary_crops.join(', ') : 'No crops listed'}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <p className="text-xs font-semibold text-gray-500 uppercase">Notes</p>
                              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                                {app.notes || 'No notes'}
                              </p>
                              {app.reviewed_at && (
                                <p className="text-xs text-gray-400 mt-2">
                                  Reviewed: {formatDate(app.reviewed_at)}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
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

          {/* Pagination */}
          <Pagination
            page={page}
            pageSize={PAGE_SIZE}
            totalCount={totalCount}
            onPageChange={(p) => {
              setPage(p);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
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
                  Share these credentials securely with the applicant.
                </p>
                <div className="flex gap-2 mt-3">
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`Welcome to African Farming Union!\n\nYour account has been approved.\n\nLogin: https://africanfarmingunion.org/login\nEmail: ${tempPasswordModal.email}\nPassword: ${tempPasswordModal.tempPassword}\n\nPlease change your password after first login.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 bg-green-600 text-white rounded-lg text-xs font-semibold text-center hover:bg-green-700 transition-colors"
                  >
                    Share via WhatsApp
                  </a>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`Login: https://africanfarmingunion.org/login\nEmail: ${tempPasswordModal.email}\nPassword: ${tempPasswordModal.tempPassword}`);
                    }}
                    className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold text-center hover:bg-blue-700 transition-colors"
                  >
                    Copy All Details
                  </button>
                </div>
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
