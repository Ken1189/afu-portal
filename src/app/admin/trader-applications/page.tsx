'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  BarChart3, Search, CheckCircle2, XCircle, Clock, ChevronDown, ChevronRight,
  Loader2, AlertCircle, FileText,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Pagination from '@/components/admin/Pagination';

// ── Types ────────────────────────────────────────────────────────────────────

type TraderStatus = 'pending' | 'approved' | 'rejected';

interface TraderApplication {
  id: string;
  created_at: string;
  full_name: string;
  email: string;
  phone: string | null;
  country: string;
  business_name: string | null;
  business_registration: string | null;
  trading_type: string;
  experience_level: string;
  annual_volume: string | null;
  preferred_commodities: string[];
  preferred_countries: string[];
  settlement_currency: string;
  bank_name: string | null;
  bank_account: string | null;
  has_export_license: boolean;
  export_license_number: string | null;
  motivation: string | null;
  referral_source: string | null;
  status: TraderStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
}

// ── Status styling ───────────────────────────────────────────────────────────

const statusConfig: Record<TraderStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending:  { label: 'Pending',  color: 'bg-amber-100 text-amber-700',  icon: <Clock className="w-3 h-3" /> },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-700',  icon: <CheckCircle2 className="w-3 h-3" /> },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-600',      icon: <XCircle className="w-3 h-3" /> },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

// ═════════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════════════

const PAGE_SIZE = 25;

export default function AdminTraderApplicationsPage() {
  const supabase = useMemo(() => createClient(), []);

  // ── State ────────────────────────────────────────────────────────────────
  const [applications, setApplications] = useState<TraderApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | TraderStatus>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Stats
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });

  // ── Toast helper ─────────────────────────────────────────────────────────
  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // ── Fetch stats ──────────────────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    const [totalRes, pendingRes, approvedRes, rejectedRes] = await Promise.all([
      supabase.from('service_provider_applications').select('*', { count: 'exact', head: true }).eq('provider_type', 'trader'),
      supabase.from('service_provider_applications').select('*', { count: 'exact', head: true }).eq('provider_type', 'trader').eq('status', 'pending'),
      supabase.from('service_provider_applications').select('*', { count: 'exact', head: true }).eq('provider_type', 'trader').eq('status', 'approved'),
      supabase.from('service_provider_applications').select('*', { count: 'exact', head: true }).eq('provider_type', 'trader').eq('status', 'rejected'),
    ]);
    setStats({
      total: totalRes.count ?? 0,
      pending: pendingRes.count ?? 0,
      approved: approvedRes.count ?? 0,
      rejected: rejectedRes.count ?? 0,
    });
  }, [supabase]);

  // ── Fetch applications ───────────────────────────────────────────────────
  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError(null);

    let query = supabase
      .from('service_provider_applications')
      .select('*', { count: 'exact' })
      .eq('provider_type', 'trader')
      .order('created_at', { ascending: false });

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    if (searchQuery.trim()) {
      const q = `%${searchQuery.trim()}%`;
      query = query.or(`full_name.ilike.${q},email.ilike.${q},country.ilike.${q}`);
    }

    const from = (page - 1) * PAGE_SIZE;
    query = query.range(from, from + PAGE_SIZE - 1);

    const { data, error: fetchError, count } = await query;

    if (fetchError) {
      setError(fetchError.message);
      setLoading(false);
      return;
    }

    setApplications((data ?? []) as TraderApplication[]);
    setTotalCount(count ?? 0);
    setLoading(false);
  }, [supabase, page, statusFilter, searchQuery]);

  // ── Effects ──────────────────────────────────────────────────────────────
  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { fetchApplications(); }, [fetchApplications]);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [statusFilter, searchQuery]);

  // ── Approve / Reject ─────────────────────────────────────────────────────
  const updateStatus = async (id: string, newStatus: 'approved' | 'rejected') => {
    setActionLoading(id);
    const { error: updateError } = await supabase
      .from('service_provider_applications')
      .update({
        status: newStatus,
        reviewed_at: new Date().toISOString(),
        reviewed_by: 'admin', // In production, use the logged-in admin's ID
      })
      .eq('id', id);

    if (updateError) {
      showToast(`Failed to ${newStatus === 'approved' ? 'approve' : 'reject'}: ${updateError.message}`, 'error');
    } else {
      showToast(`Application ${newStatus === 'approved' ? 'approved' : 'rejected'} successfully`, 'success');
      fetchApplications();
      fetchStats();
    }
    setActionLoading(null);
  };

  // ═══════════════════════════════════════════════════════════════════════════
  //  RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  return (
    <div className="space-y-6">
      {/* ── Toast ──────────────────────────────────────────────────────── */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium transition-all ${
          toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.message}
        </div>
      )}

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#5DB347]/10 flex items-center justify-center">
          <BarChart3 className="w-5 h-5 text-[#5DB347]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">Trader Applications</h1>
          <p className="text-sm text-gray-500">Review and manage trader signup requests</p>
        </div>
      </div>

      {/* ── Stats Row ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'bg-gray-50 text-[#1B2A4A]' },
          { label: 'Pending', value: stats.pending, color: 'bg-amber-50 text-amber-700' },
          { label: 'Approved', value: stats.approved, color: 'bg-green-50 text-green-700' },
          { label: 'Rejected', value: stats.rejected, color: 'bg-red-50 text-red-600' },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl p-4 ${s.color}`}>
            <p className="text-xs font-medium opacity-70">{s.label}</p>
            <p className="text-2xl font-bold mt-1">{s.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* ── Search & Filter ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or country..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
          />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | TraderStatus)}
            className="appearance-none pl-4 pr-10 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* ── Loading / Error / Empty ────────────────────────────────────── */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-[#5DB347]" />
          <span className="ml-2 text-sm text-gray-500">Loading applications...</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-red-50 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {!loading && !error && applications.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <FileText className="w-12 h-12 mb-3 opacity-40" />
          <p className="text-sm font-medium">No trader applications found</p>
          <p className="text-xs mt-1">Applications will appear here when traders sign up</p>
        </div>
      )}

      {/* ── Table ──────────────────────────────────────────────────────── */}
      {!loading && !error && applications.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Date</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Name</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Email</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Country</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Trading Type</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Volume</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {applications.map((app) => (
                  <React.Fragment key={app.id}>
                    {/* ── Main row ─────────────────────────────────────── */}
                    <tr
                      className="hover:bg-gray-50/50 cursor-pointer transition-colors"
                      onClick={() => setExpandedId(expandedId === app.id ? null : app.id)}
                    >
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDate(app.created_at)}</td>
                      <td className="px-4 py-3 font-medium text-[#1B2A4A] whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <ChevronRight className={`w-3.5 h-3.5 text-gray-400 transition-transform ${expandedId === app.id ? 'rotate-90' : ''}`} />
                          {app.full_name}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{app.email}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{app.country}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 capitalize">
                          {app.trading_type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{app.annual_volume || '-'}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig[app.status].color}`}>
                          {statusConfig[app.status].icon}
                          {statusConfig[app.status].label}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        {app.status === 'pending' && (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => updateStatus(app.id, 'approved')}
                              disabled={actionLoading === app.id}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-[#5DB347] text-white hover:bg-[#4a9a38] disabled:opacity-50 transition-colors"
                            >
                              {actionLoading === app.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                              Approve
                            </button>
                            <button
                              onClick={() => updateStatus(app.id, 'rejected')}
                              disabled={actionLoading === app.id}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 transition-colors"
                            >
                              {actionLoading === app.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
                              Reject
                            </button>
                          </div>
                        )}
                        {app.status !== 'pending' && (
                          <span className="text-xs text-gray-400">
                            {app.reviewed_at ? formatDate(app.reviewed_at) : '-'}
                          </span>
                        )}
                      </td>
                    </tr>

                    {/* ── Expanded detail row ──────────────────────────── */}
                    {expandedId === app.id && (
                      <tr className="bg-gray-50/70">
                        <td colSpan={8} className="px-6 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            {/* Business Info */}
                            <div className="space-y-2">
                              <h4 className="font-semibold text-[#1B2A4A] text-xs uppercase tracking-wider">Business Info</h4>
                              <DetailRow label="Business Name" value={app.business_name} />
                              <DetailRow label="Registration" value={app.business_registration} />
                              <DetailRow label="Experience" value={app.experience_level} />
                              <DetailRow label="Phone" value={app.phone} />
                            </div>

                            {/* Trading Preferences */}
                            <div className="space-y-2">
                              <h4 className="font-semibold text-[#1B2A4A] text-xs uppercase tracking-wider">Trading Preferences</h4>
                              <DetailRow label="Commodities" value={app.preferred_commodities?.length ? app.preferred_commodities.join(', ') : null} />
                              <DetailRow label="Countries" value={app.preferred_countries?.length ? app.preferred_countries.join(', ') : null} />
                              <DetailRow label="Settlement" value={app.settlement_currency} />
                              <DetailRow label="Annual Volume" value={app.annual_volume} />
                            </div>

                            {/* Banking & Licence */}
                            <div className="space-y-2">
                              <h4 className="font-semibold text-[#1B2A4A] text-xs uppercase tracking-wider">Banking & Licence</h4>
                              <DetailRow label="Bank" value={app.bank_name} />
                              <DetailRow label="Account" value={app.bank_account} />
                              <DetailRow label="Export Licence" value={app.has_export_license ? 'Yes' : 'No'} />
                              <DetailRow label="Licence #" value={app.export_license_number} />
                            </div>

                            {/* Motivation & Referral (full width) */}
                            {(app.motivation || app.referral_source) && (
                              <div className="md:col-span-3 space-y-2 border-t border-gray-200 pt-3">
                                {app.motivation && (
                                  <div>
                                    <span className="text-xs font-medium text-gray-500">Motivation:</span>
                                    <p className="text-sm text-gray-700 mt-0.5">{app.motivation}</p>
                                  </div>
                                )}
                                {app.referral_source && (
                                  <DetailRow label="Referral Source" value={app.referral_source} />
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Pagination ───────────────────────────────────────────── */}
          <Pagination
            page={page}
            pageSize={PAGE_SIZE}
            totalCount={totalCount}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}

// ── Detail row helper ────────────────────────────────────────────────────────

function DetailRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex gap-2">
      <span className="text-xs font-medium text-gray-500 min-w-[90px]">{label}:</span>
      <span className="text-xs text-gray-700">{value || '-'}</span>
    </div>
  );
}
