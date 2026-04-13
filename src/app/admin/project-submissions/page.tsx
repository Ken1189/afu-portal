'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Sprout, Search, Filter, ChevronDown, ChevronLeft, ChevronRight,
  CheckCircle2, XCircle, Clock, Eye, AlertCircle, Loader2, X,
  Mail, Phone, MapPin, Building2, Calendar, DollarSign, FileText,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

/* ─── Types ─── */
interface Submission {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  country: string;
  organisation: string | null;
  role_in_project: string | null;
  project_name: string;
  project_category: string | null;
  project_stage: string | null;
  project_description: string;
  target_beneficiaries: string | null;
  beneficiary_count: number | null;
  project_country: string;
  project_region: string | null;
  project_countries: string[];
  funding_required: boolean;
  funding_amount: string | null;
  funding_purpose: string | null;
  existing_funding: string | null;
  support_needed: string[];
  proposal_url: string | null;
  timeline: string | null;
  impact_description: string | null;
  referral_source: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  pending: { label: 'Pending', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', icon: <Clock className="w-3.5 h-3.5" /> },
  under_review: { label: 'Under Review', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', icon: <Eye className="w-3.5 h-3.5" /> },
  approved: { label: 'Approved', color: 'text-green-700', bg: 'bg-green-50 border-green-200', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  rejected: { label: 'Rejected', color: 'text-red-700', bg: 'bg-red-50 border-red-200', icon: <XCircle className="w-3.5 h-3.5" /> },
};

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'under_review', label: 'Under Review' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
];

const PAGE_SIZE = 20;

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
      {type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
      {message}
    </div>
  );
}

export default function AdminProjectSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterCountry, setFilterCountry] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterFunding, setFilterFunding] = useState('');

  const supabase = createClient();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('project_submissions')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (tab !== 'all') query = query.eq('status', tab);
      if (search) {
        query = query.or(`full_name.ilike.%${search}%,project_name.ilike.%${search}%,email.ilike.%${search}%`);
      }
      if (filterCountry) query = query.eq('project_country', filterCountry);
      if (filterCategory) query = query.eq('project_category', filterCategory);
      if (filterFunding === 'yes') query = query.eq('funding_required', true);
      if (filterFunding === 'no') query = query.eq('funding_required', false);

      query = query.range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

      const { data, count, error } = await query;
      if (error) throw error;
      setSubmissions((data || []) as Submission[]);
      setTotal(count || 0);
    } catch (err) {
      console.error('[project-submissions] fetch error:', err);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, search, page, filterCountry, filterCategory, filterFunding]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      const { error } = await supabase
        .from('project_submissions')
        .update({ status, reviewed_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
      setToast({ message: `Project ${status === 'approved' ? 'approved' : status === 'rejected' ? 'rejected' : 'updated'}`, type: 'success' });
      fetchData();
    } catch {
      setToast({ message: 'Failed to update status', type: 'error' });
    } finally {
      setUpdatingId(null);
    }
  };

  const stats = {
    total,
    pending: submissions.filter((s) => s.status === 'pending').length,
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  // Get unique countries from data for filter dropdown
  const countries = [...new Set(submissions.map((s) => s.project_country))].sort();

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#5DB347' }}>
            <Sprout className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#1B2A4A' }}>Project Submissions</h1>
            <p className="text-gray-500 text-sm">{total} total submissions</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {TABS.filter((t) => t.key !== 'all').map((t) => {
          const cfg = STATUS_CONFIG[t.key];
          const count = tab === 'all'
            ? submissions.filter((s) => s.status === t.key).length
            : t.key === tab ? total : 0;
          return (
            <div key={t.key} className={`p-4 rounded-xl border ${cfg.bg}`}>
              <div className={`flex items-center gap-2 text-sm font-medium ${cfg.color}`}>
                {cfg.icon}
                {cfg.label}
              </div>
              <p className="text-2xl font-bold mt-1" style={{ color: '#1B2A4A' }}>{count}</p>
            </div>
          );
        })}
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); setPage(0); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                tab === t.key ? 'bg-white shadow text-[#1B2A4A]' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              placeholder="Search by name, project, or email..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-xl text-sm font-medium transition-colors ${
              showFilters ? 'border-[#5DB347] text-[#5DB347] bg-[#5DB347]/5' : 'border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="flex flex-wrap gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
          <div className="relative">
            <select
              value={filterCountry}
              onChange={(e) => { setFilterCountry(e.target.value); setPage(0); }}
              className="px-3 py-2 pr-8 border border-gray-200 rounded-lg text-sm appearance-none bg-white"
            >
              <option value="">All Countries</option>
              {countries.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={filterCategory}
              onChange={(e) => { setFilterCategory(e.target.value); setPage(0); }}
              className="px-3 py-2 pr-8 border border-gray-200 rounded-lg text-sm appearance-none bg-white"
            >
              <option value="">All Categories</option>
              {['Agronomy/Crops', 'Livestock', 'Technology/AgTech', 'Climate/Sustainability', 'Processing/Value Addition', 'Trade/Export', 'Forestry', 'Aquaculture'].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={filterFunding}
              onChange={(e) => { setFilterFunding(e.target.value); setPage(0); }}
              className="px-3 py-2 pr-8 border border-gray-200 rounded-lg text-sm appearance-none bg-white"
            >
              <option value="">Funding: Any</option>
              <option value="yes">Funding Required</option>
              <option value="no">No Funding</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          </div>
          {(filterCountry || filterCategory || filterFunding) && (
            <button
              onClick={() => { setFilterCountry(''); setFilterCategory(''); setFilterFunding(''); setPage(0); }}
              className="flex items-center gap-1 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
            >
              <X className="w-3.5 h-3.5" /> Clear
            </button>
          )}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-[#5DB347]" />
          </div>
        ) : submissions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Sprout className="w-10 h-10 mb-3" />
            <p className="text-lg font-medium">No submissions found</p>
            <p className="text-sm">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Project</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Submitter</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Country</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Category</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Stage</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Funding</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {submissions.map((sub) => {
                  const cfg = STATUS_CONFIG[sub.status] || STATUS_CONFIG.pending;
                  const isExpanded = expandedId === sub.id;
                  return (
                    <tr key={sub.id} className="group">
                      <td colSpan={9} className="p-0">
                        {/* Main row */}
                        <div
                          className="grid grid-cols-[1fr_1fr_auto_auto_auto_auto_auto_auto_auto] items-center cursor-pointer hover:bg-gray-50 transition-colors"
                          onClick={() => setExpandedId(isExpanded ? null : sub.id)}
                          style={{ gridTemplateColumns: '2fr 1.5fr 1fr 1fr 0.8fr 0.8fr 1fr 1fr auto' }}
                        >
                          <div className="px-4 py-3">
                            <p className="font-medium text-[#1B2A4A] truncate">{sub.project_name}</p>
                          </div>
                          <div className="px-4 py-3">
                            <p className="text-gray-700 truncate">{sub.full_name}</p>
                            <p className="text-gray-400 text-xs truncate">{sub.email}</p>
                          </div>
                          <div className="px-4 py-3 text-gray-600">{sub.project_country}</div>
                          <div className="px-4 py-3 text-gray-600 text-xs">{sub.project_category || '-'}</div>
                          <div className="px-4 py-3 text-gray-600 text-xs">{sub.project_stage || '-'}</div>
                          <div className="px-4 py-3">
                            {sub.funding_required ? (
                              <span className="text-xs font-medium text-green-700">{sub.funding_amount || 'Yes'}</span>
                            ) : (
                              <span className="text-xs text-gray-400">No</span>
                            )}
                          </div>
                          <div className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${cfg.bg} ${cfg.color}`}>
                              {cfg.icon} {cfg.label}
                            </span>
                          </div>
                          <div className="px-4 py-3 text-gray-500 text-xs">
                            {new Date(sub.created_at).toLocaleDateString()}
                          </div>
                          <div className="px-4 py-3 flex items-center gap-1">
                            {sub.status === 'pending' && (
                              <>
                                <button
                                  onClick={(e) => { e.stopPropagation(); updateStatus(sub.id, 'under_review'); }}
                                  disabled={updatingId === sub.id}
                                  className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50"
                                  title="Mark Under Review"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); updateStatus(sub.id, 'approved'); }}
                                  disabled={updatingId === sub.id}
                                  className="p-1.5 rounded-lg text-green-600 hover:bg-green-50"
                                  title="Approve"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); updateStatus(sub.id, 'rejected'); }}
                                  disabled={updatingId === sub.id}
                                  className="p-1.5 rounded-lg text-red-600 hover:bg-red-50"
                                  title="Reject"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </>
                            )}
                            {sub.status === 'under_review' && (
                              <>
                                <button
                                  onClick={(e) => { e.stopPropagation(); updateStatus(sub.id, 'approved'); }}
                                  disabled={updatingId === sub.id}
                                  className="p-1.5 rounded-lg text-green-600 hover:bg-green-50"
                                  title="Approve"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); updateStatus(sub.id, 'rejected'); }}
                                  disabled={updatingId === sub.id}
                                  className="p-1.5 rounded-lg text-red-600 hover:bg-red-50"
                                  title="Reject"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </>
                            )}
                            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                          </div>
                        </div>

                        {/* Expanded details */}
                        {isExpanded && (
                          <div className="px-4 py-5 bg-gray-50 border-t border-gray-100">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              {/* Contact */}
                              <div className="space-y-2">
                                <h4 className="font-semibold text-[#1B2A4A] text-sm">Contact Information</h4>
                                <div className="space-y-1.5 text-sm text-gray-600">
                                  <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-gray-400" /> {sub.email}</div>
                                  {sub.phone && <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-gray-400" /> {sub.phone}</div>}
                                  <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-gray-400" /> {sub.country}</div>
                                  {sub.organisation && <div className="flex items-center gap-2"><Building2 className="w-3.5 h-3.5 text-gray-400" /> {sub.organisation}</div>}
                                  {sub.role_in_project && <div className="text-xs text-gray-400">Role: {sub.role_in_project}</div>}
                                </div>
                              </div>

                              {/* Project */}
                              <div className="space-y-2">
                                <h4 className="font-semibold text-[#1B2A4A] text-sm">Project Details</h4>
                                <div className="space-y-1.5 text-sm text-gray-600">
                                  <p className="text-gray-800">{sub.project_description}</p>
                                  {sub.target_beneficiaries && <div>Beneficiaries: {sub.target_beneficiaries}</div>}
                                  {sub.beneficiary_count && <div>Count: {sub.beneficiary_count.toLocaleString()}</div>}
                                  {sub.project_region && <div>Region: {sub.project_region}</div>}
                                  {sub.project_countries.length > 0 && <div>Countries: {sub.project_countries.join(', ')}</div>}
                                </div>
                              </div>

                              {/* Funding & Support */}
                              <div className="space-y-2">
                                <h4 className="font-semibold text-[#1B2A4A] text-sm">Funding & Support</h4>
                                <div className="space-y-1.5 text-sm text-gray-600">
                                  {sub.funding_required && (
                                    <>
                                      <div className="flex items-center gap-2"><DollarSign className="w-3.5 h-3.5 text-gray-400" /> {sub.funding_amount || 'Amount TBD'}</div>
                                      {sub.funding_purpose && <div className="text-xs">{sub.funding_purpose}</div>}
                                    </>
                                  )}
                                  {sub.existing_funding && <div>Existing: {sub.existing_funding}</div>}
                                  {sub.timeline && <div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-gray-400" /> {sub.timeline}</div>}
                                  {sub.support_needed.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {sub.support_needed.map((s) => (
                                        <span key={s} className="px-2 py-0.5 bg-[#5DB347]/10 text-[#5DB347] rounded-full text-xs">{s.replace(/_/g, ' ')}</span>
                                      ))}
                                    </div>
                                  )}
                                  {sub.proposal_url && (
                                    <a href={sub.proposal_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[#5DB347] hover:underline">
                                      <FileText className="w-3.5 h-3.5" /> View Proposal
                                    </a>
                                  )}
                                  {sub.impact_description && (
                                    <div className="mt-2">
                                      <p className="text-xs text-gray-400 mb-1">Impact:</p>
                                      <p className="text-gray-700 text-xs">{sub.impact_description}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {page * PAGE_SIZE + 1}-{Math.min((page + 1) * PAGE_SIZE, total)} of {total}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 hover:bg-gray-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-gray-600">Page {page + 1} of {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 hover:bg-gray-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
