'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Users, Search, CheckCircle2, XCircle, Clock, ChevronDown, ChevronRight,
  Loader2, AlertCircle, FileText,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Pagination from '@/components/admin/Pagination';

// ── Types ────────────────────────────────────────────────────────────────────

type AppStatus = 'pending' | 'approved' | 'rejected';
type ProviderType = 'trader' | 'vet' | 'offtaker' | 'processing_hub';
type TabKey = 'all' | ProviderType;

interface ServiceProviderApplication {
  id: string;
  created_at: string;
  full_name: string;
  email: string;
  phone: string | null;
  country: string;
  business_name: string | null;
  business_registration: string | null;
  years_experience: number | null;
  website: string | null;
  motivation: string | null;
  referral_source: string | null;
  provider_type: ProviderType;
  provider_details: Record<string, unknown> | null;
  status: AppStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  admin_notes: string | null;
}

// ── Config ───────────────────────────────────────────────────────────────────

const statusConfig: Record<AppStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending:  { label: 'Pending',  color: 'bg-amber-100 text-amber-700',  icon: <Clock className="w-3 h-3" /> },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-700',  icon: <CheckCircle2 className="w-3 h-3" /> },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-600',      icon: <XCircle className="w-3 h-3" /> },
};

const typeConfig: Record<ProviderType, { label: string; color: string }> = {
  trader:         { label: 'Trader',         color: 'bg-blue-100 text-blue-700' },
  vet:            { label: 'Vet',            color: 'bg-teal-100 text-teal-700' },
  offtaker:       { label: 'Offtaker',       color: 'bg-amber-100 text-amber-700' },
  processing_hub: { label: 'Processing Hub', color: 'bg-purple-100 text-purple-700' },
};

const TABS: { key: TabKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'trader', label: 'Traders' },
  { key: 'vet', label: 'Vets' },
  { key: 'offtaker', label: 'Offtakers' },
  { key: 'processing_hub', label: 'Processing Hubs' },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

function DetailRow({ label, value }: { label: string; value: unknown }) {
  if (value === null || value === undefined || value === '') return null;
  const display = Array.isArray(value) ? value.join(', ') : String(value);
  return (
    <div className="flex justify-between gap-2">
      <span className="text-gray-500 whitespace-nowrap">{label}</span>
      <span className="text-[#1B2A4A] text-right font-medium">{display}</span>
    </div>
  );
}

function humanizeKey(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// ── Type-specific detail renderers ───────────────────────────────────────────

function TraderDetails({ d }: { d: Record<string, unknown> }) {
  return (
    <div className="space-y-2">
      <h4 className="font-semibold text-[#1B2A4A] text-xs uppercase tracking-wider">Trader Details</h4>
      <DetailRow label="Trading Type" value={d.trading_type} />
      <DetailRow label="Annual Volume" value={d.annual_volume} />
      <DetailRow label="Commodities" value={d.preferred_commodities} />
      <DetailRow label="Countries" value={d.preferred_countries} />
      <DetailRow label="Bank Name" value={d.bank_name} />
      <DetailRow label="Bank Account" value={d.bank_account} />
      <DetailRow label="Settlement Currency" value={d.settlement_currency} />
      <DetailRow label="Export Licence" value={d.has_export_license ? `Yes — ${d.export_license_number || 'N/A'}` : 'No'} />
    </div>
  );
}

function VetDetails({ d }: { d: Record<string, unknown> }) {
  return (
    <div className="space-y-2">
      <h4 className="font-semibold text-[#1B2A4A] text-xs uppercase tracking-wider">Vet Details</h4>
      <DetailRow label="Practice Name" value={d.practice_name} />
      <DetailRow label="Licence Number" value={d.licence_number} />
      <DetailRow label="Species" value={d.species} />
      <DetailRow label="Services" value={d.services} />
      <DetailRow label="Service Radius" value={d.service_radius} />
      <DetailRow label="Availability" value={d.availability} />
      <DetailRow label="Consultation Fees" value={d.consultation_fees} />
    </div>
  );
}

function OfftakerDetails({ d }: { d: Record<string, unknown> }) {
  return (
    <div className="space-y-2">
      <h4 className="font-semibold text-[#1B2A4A] text-xs uppercase tracking-wider">Offtaker Details</h4>
      <DetailRow label="Company Type" value={d.company_type} />
      <DetailRow label="Commodities" value={d.commodities} />
      <DetailRow label="Volume Required" value={d.volume_required} />
      <DetailRow label="Delivery" value={d.delivery_preference} />
      <DetailRow label="Contract Type" value={d.contract_type} />
      <DetailRow label="Payment Terms" value={d.payment_terms} />
      <DetailRow label="Certifications" value={d.certifications} />
    </div>
  );
}

function ProcessingDetails({ d }: { d: Record<string, unknown> }) {
  return (
    <div className="space-y-2">
      <h4 className="font-semibold text-[#1B2A4A] text-xs uppercase tracking-wider">Processing Hub Details</h4>
      <DetailRow label="Facility Name" value={d.facility_name} />
      <DetailRow label="Processing Types" value={d.processing_types} />
      <DetailRow label="Capacity" value={d.capacity} />
      <DetailRow label="Equipment" value={d.equipment} />
      <DetailRow label="Power Source" value={d.power_source} />
      <DetailRow label="Certifications" value={d.certifications} />
    </div>
  );
}

function TypeSpecificDetails({ type, details }: { type: ProviderType; details: Record<string, unknown> | null }) {
  if (!details || Object.keys(details).length === 0) return null;
  switch (type) {
    case 'trader': return <TraderDetails d={details} />;
    case 'vet': return <VetDetails d={details} />;
    case 'offtaker': return <OfftakerDetails d={details} />;
    case 'processing_hub': return <ProcessingDetails d={details} />;
    default: {
      // Fallback: render all keys
      return (
        <div className="space-y-2">
          <h4 className="font-semibold text-[#1B2A4A] text-xs uppercase tracking-wider">Additional Details</h4>
          {Object.entries(details).map(([k, v]) => (
            <DetailRow key={k} label={humanizeKey(k)} value={v} />
          ))}
        </div>
      );
    }
  }
}

// ═════════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════════════

const PAGE_SIZE = 25;

export default function AdminServiceProvidersPage() {
  const supabase = useMemo(() => createClient(), []);

  // ── State ──────────────────────────────────────────────────────────────
  const [applications, setApplications] = useState<ServiceProviderApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);

  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | AppStatus>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Admin notes per application (local edits before save)
  const [editingNotes, setEditingNotes] = useState<Record<string, string>>({});

  // Stats
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [tabCounts, setTabCounts] = useState<Record<TabKey, number>>({ all: 0, trader: 0, vet: 0, offtaker: 0, processing_hub: 0 });

  // Reject confirm modal
  const [rejectModalId, setRejectModalId] = useState<string | null>(null);

  // ── Toast helper ───────────────────────────────────────────────────────
  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // ── Fetch stats & tab counts ───────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    const table = 'service_provider_applications';
    const [totalRes, pendingRes, approvedRes, rejectedRes, traderRes, vetRes, offtakerRes, hubRes] = await Promise.all([
      supabase.from(table).select('*', { count: 'exact', head: true }),
      supabase.from(table).select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from(table).select('*', { count: 'exact', head: true }).eq('status', 'approved'),
      supabase.from(table).select('*', { count: 'exact', head: true }).eq('status', 'rejected'),
      supabase.from(table).select('*', { count: 'exact', head: true }).eq('provider_type', 'trader'),
      supabase.from(table).select('*', { count: 'exact', head: true }).eq('provider_type', 'vet'),
      supabase.from(table).select('*', { count: 'exact', head: true }).eq('provider_type', 'offtaker'),
      supabase.from(table).select('*', { count: 'exact', head: true }).eq('provider_type', 'processing_hub'),
    ]);
    setStats({
      total: totalRes.count ?? 0,
      pending: pendingRes.count ?? 0,
      approved: approvedRes.count ?? 0,
      rejected: rejectedRes.count ?? 0,
    });
    setTabCounts({
      all: totalRes.count ?? 0,
      trader: traderRes.count ?? 0,
      vet: vetRes.count ?? 0,
      offtaker: offtakerRes.count ?? 0,
      processing_hub: hubRes.count ?? 0,
    });
  }, [supabase]);

  // ── Fetch applications ─────────────────────────────────────────────────
  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError(null);

    let query = supabase
      .from('service_provider_applications')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (activeTab !== 'all') {
      query = query.eq('provider_type', activeTab);
    }

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    if (searchQuery.trim()) {
      const q = `%${searchQuery.trim()}%`;
      query = query.or(`full_name.ilike.${q},email.ilike.${q},business_name.ilike.${q},country.ilike.${q}`);
    }

    const from = (page - 1) * PAGE_SIZE;
    query = query.range(from, from + PAGE_SIZE - 1);

    const { data, error: fetchError, count } = await query;

    if (fetchError) {
      setError(fetchError.message);
      setLoading(false);
      return;
    }

    setApplications((data ?? []) as ServiceProviderApplication[]);
    setTotalCount(count ?? 0);
    setLoading(false);
  }, [supabase, page, activeTab, statusFilter, searchQuery]);

  // ── Effects ────────────────────────────────────────────────────────────
  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { fetchApplications(); }, [fetchApplications]);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [activeTab, statusFilter, searchQuery]);

  // ── Approve / Reject ───────────────────────────────────────────────────
  const updateStatus = async (id: string, newStatus: 'approved' | 'rejected') => {
    setActionLoading(id);
    const notes = editingNotes[id] ?? null;
    const { error: updateError } = await supabase
      .from('service_provider_applications')
      .update({
        status: newStatus,
        reviewed_at: new Date().toISOString(),
        reviewed_by: 'admin',
        ...(notes !== null ? { admin_notes: notes } : {}),
      })
      .eq('id', id);

    if (updateError) {
      showToast(`Failed to ${newStatus === 'approved' ? 'approve' : 'reject'}: ${updateError.message}`, 'error');
    } else {
      showToast(`Application ${newStatus === 'approved' ? 'approved' : 'rejected'} successfully`, 'success');
      setRejectModalId(null);
      fetchApplications();
      fetchStats();
    }
    setActionLoading(null);
  };

  // ── Save admin notes ───────────────────────────────────────────────────
  const saveNotes = async (id: string) => {
    const notes = editingNotes[id] ?? '';
    const { error: updateError } = await supabase
      .from('service_provider_applications')
      .update({ admin_notes: notes })
      .eq('id', id);

    if (updateError) {
      showToast(`Failed to save notes: ${updateError.message}`, 'error');
    } else {
      showToast('Notes saved', 'success');
      // Update local state
      setApplications((prev) =>
        prev.map((a) => (a.id === id ? { ...a, admin_notes: notes } : a))
      );
    }
  };

  // ═══════════════════════════════════════════════════════════════════════
  //  RENDER
  // ═══════════════════════════════════════════════════════════════════════

  return (
    <div className="space-y-6">
      {/* ── Toast ────────────────────────────────────────────────────── */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium transition-all ${
          toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.message}
        </div>
      )}

      {/* ── Reject Confirm Modal ─────────────────────────────────────── */}
      {rejectModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold text-[#1B2A4A] mb-2">Reject Application</h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to reject this application? You can add notes below before rejecting.
            </p>
            <textarea
              value={editingNotes[rejectModalId] ?? ''}
              onChange={(e) => setEditingNotes((prev) => ({ ...prev, [rejectModalId]: e.target.value }))}
              placeholder="Reason for rejection (optional)..."
              rows={3}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] mb-4"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setRejectModalId(null)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => updateStatus(rejectModalId, 'rejected')}
                disabled={actionLoading === rejectModalId}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 transition-colors"
              >
                {actionLoading === rejectModalId ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Header ───────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#5DB347]/10 flex items-center justify-center">
          <Users className="w-5 h-5 text-[#5DB347]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">Service Providers</h1>
          <p className="text-sm text-gray-500">Manage trader, vet, offtaker, and processing hub applications</p>
        </div>
      </div>

      {/* ── Tabs ──────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 border-b border-gray-200 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`relative px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.key
                ? 'text-[#5DB347] border-b-2 border-[#5DB347]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
            <span className={`ml-1.5 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-semibold ${
              activeTab === tab.key
                ? 'bg-[#5DB347]/10 text-[#5DB347]'
                : 'bg-gray-100 text-gray-500'
            }`}>
              {tabCounts[tab.key]}
            </span>
          </button>
        ))}
      </div>

      {/* ── Stats Row ────────────────────────────────────────────────── */}
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

      {/* ── Search & Filter ──────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, business name, or country..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
          />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | AppStatus)}
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

      {/* ── Loading / Error / Empty ──────────────────────────────────── */}
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
          <p className="text-sm font-medium">
            No {activeTab === 'all' ? 'service provider' : typeConfig[activeTab as ProviderType]?.label.toLowerCase()} applications found
          </p>
          <p className="text-xs mt-1">Applications will appear here when providers sign up</p>
        </div>
      )}

      {/* ── Table ────────────────────────────────────────────────────── */}
      {!loading && !error && applications.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Date</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Name</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Type</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Country</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Business</th>
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
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${typeConfig[app.provider_type]?.color ?? 'bg-gray-100 text-gray-700'}`}>
                          {typeConfig[app.provider_type]?.label ?? app.provider_type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{app.country}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{app.business_name || '-'}</td>
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
                              onClick={() => setRejectModalId(app.id)}
                              disabled={actionLoading === app.id}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 transition-colors"
                            >
                              <XCircle className="w-3 h-3" />
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
                        <td colSpan={7} className="px-6 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                            {/* Common Info */}
                            <div className="space-y-2">
                              <h4 className="font-semibold text-[#1B2A4A] text-xs uppercase tracking-wider">Contact & Business</h4>
                              <DetailRow label="Email" value={app.email} />
                              <DetailRow label="Phone" value={app.phone} />
                              <DetailRow label="Business Name" value={app.business_name} />
                              <DetailRow label="Registration" value={app.business_registration} />
                              <DetailRow label="Years Experience" value={app.years_experience} />
                              <DetailRow label="Website" value={app.website} />
                            </div>

                            {/* Type-specific details */}
                            <TypeSpecificDetails type={app.provider_type} details={app.provider_details} />

                            {/* Motivation & Admin */}
                            <div className="space-y-2">
                              <h4 className="font-semibold text-[#1B2A4A] text-xs uppercase tracking-wider">Application Info</h4>
                              <DetailRow label="Motivation" value={app.motivation} />
                              <DetailRow label="Referral Source" value={app.referral_source} />
                              <DetailRow label="Reviewed By" value={app.reviewed_by} />
                              <DetailRow label="Reviewed At" value={app.reviewed_at ? formatDate(app.reviewed_at) : null} />

                              {/* Admin notes */}
                              <div className="pt-2">
                                <label className="text-xs font-semibold text-[#1B2A4A] uppercase tracking-wider block mb-1">
                                  Admin Notes
                                </label>
                                <textarea
                                  value={editingNotes[app.id] ?? app.admin_notes ?? ''}
                                  onChange={(e) => setEditingNotes((prev) => ({ ...prev, [app.id]: e.target.value }))}
                                  placeholder="Add internal notes..."
                                  rows={3}
                                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
                                />
                                <button
                                  onClick={() => saveNotes(app.id)}
                                  className="mt-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-[#1B2A4A] text-white hover:bg-[#1B2A4A]/90 transition-colors"
                                >
                                  Save Notes
                                </button>
                              </div>
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

          {/* ── Pagination ──────────────────────────────────────────── */}
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
