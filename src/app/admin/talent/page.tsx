'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Briefcase,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronDown,
  ChevronRight,
  Loader2,
  AlertCircle,
  Users,
  FileText,
  Globe,
  ExternalLink,
  Star,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Pagination from '@/components/admin/Pagination';

/* ─── Types ─── */

type TalentStatus = 'pending' | 'approved' | 'rejected' | 'active';
type TabKey = 'all' | TalentStatus;

interface TalentApplication {
  id: string;
  created_at: string;
  full_name: string;
  email: string;
  phone: string | null;
  country: string;
  region: string | null;
  date_of_birth: string | null;
  gender: string | null;
  job_title: string | null;
  experience_years: string | null;
  education_level: string | null;
  qualifications: string | null;
  skills: string[];
  sectors: string[];
  preferred_countries: string[];
  employment_type: string | null;
  availability: string | null;
  salary_expectation: string | null;
  willing_to_relocate: boolean;
  cv_url: string | null;
  photo_url: string | null;
  bio: string | null;
  languages: string[];
  referral_source: string | null;
  status: TalentStatus;
  admin_notes: string | null;
  reviewed_at: string | null;
}

/* ─── Config ─── */

const statusConfig: Record<TalentStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending:  { label: 'Pending',  color: 'bg-amber-100 text-amber-700',  icon: <Clock className="w-3 h-3" /> },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-700',  icon: <CheckCircle2 className="w-3 h-3" /> },
  active:   { label: 'Active',   color: 'bg-blue-100 text-blue-700',    icon: <Star className="w-3 h-3" /> },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-600',      icon: <XCircle className="w-3 h-3" /> },
};

const TABS: { key: TabKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'active', label: 'Active' },
  { key: 'rejected', label: 'Rejected' },
];

const EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Contract', 'Seasonal', 'Freelance'];

const PAGE_SIZE = 20;

/* ─── Helpers ─── */

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/* ─── Component ─── */

export default function AdminTalentPage() {
  const [applications, setApplications] = useState<TalentApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<TabKey>('all');
  const [countryFilter, setCountryFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [sectorFilter, setSectorFilter] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const supabase = useMemo(() => createClient(), []);

  // ── Fetch ──
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data, error: fetchErr } = await supabase
        .from('talent_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchErr) throw new Error(fetchErr.message);
      setApplications((data as TalentApplication[]) || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Filter ──
  const filtered = useMemo(() => {
    let list = [...applications];

    if (tab !== 'all') {
      list = list.filter((a) => a.status === tab);
    }

    if (countryFilter) {
      list = list.filter((a) => a.country === countryFilter);
    }

    if (typeFilter) {
      list = list.filter((a) => a.employment_type === typeFilter);
    }

    if (sectorFilter) {
      list = list.filter((a) => a.sectors?.includes(sectorFilter));
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((a) =>
        a.full_name.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        a.country.toLowerCase().includes(q) ||
        (a.skills || []).some((s) => s.toLowerCase().includes(q)) ||
        (a.job_title || '').toLowerCase().includes(q)
      );
    }

    return list;
  }, [applications, tab, countryFilter, typeFilter, sectorFilter, search]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset page on filter change
  useEffect(() => { setPage(1); }, [tab, countryFilter, typeFilter, sectorFilter, search]);

  // ── Stats ──
  const stats = useMemo(() => ({
    total: applications.length,
    pending: applications.filter((a) => a.status === 'pending').length,
    active: applications.filter((a) => a.status === 'active').length,
    rejected: applications.filter((a) => a.status === 'rejected').length,
  }), [applications]);

  // ── Unique countries in data ──
  const countriesInData = useMemo(() =>
    [...new Set(applications.map((a) => a.country))].sort(),
  [applications]);

  const sectorsInData = useMemo(() => {
    const set = new Set<string>();
    applications.forEach((a) => (a.sectors || []).forEach((s) => set.add(s)));
    return [...set].sort();
  }, [applications]);

  // ── Actions ──
  const updateStatus = async (id: string, newStatus: TalentStatus) => {
    setActionLoading(id);
    try {
      const { error: updateErr } = await supabase
        .from('talent_applications')
        .update({
          status: newStatus,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (updateErr) throw new Error(updateErr.message);

      setApplications((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, status: newStatus, reviewed_at: new Date().toISOString() } : a
        )
      );
    } catch (e) {
      console.error('Failed to update status:', e);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#5DB347]/10 rounded-xl flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-[#5DB347]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1B2A4A]">Talent Pool</h1>
            <p className="text-sm text-gray-500">Manage job seeker registrations</p>
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'text-[#1B2A4A]', bg: 'bg-gray-50' },
          { label: 'Pending', value: stats.pending, color: 'text-amber-700', bg: 'bg-amber-50' },
          { label: 'Active', value: stats.active, color: 'text-blue-700', bg: 'bg-blue-50' },
          { label: 'Rejected', value: stats.rejected, color: 'text-red-600', bg: 'bg-red-50' },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} rounded-xl p-4 border border-gray-100`}>
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === t.key ? 'bg-white text-[#1B2A4A] shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
            {t.key !== 'all' && (
              <span className="ml-1.5 text-xs opacity-60">
                {t.key === 'pending' ? stats.pending : t.key === 'active' ? stats.active : stats.rejected}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Search & Filters ── */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search name, email, skills, country..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#5DB347]"
          />
        </div>
        <select
          value={countryFilter}
          onChange={(e) => setCountryFilter(e.target.value)}
          className="px-3 py-2.5 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:border-[#5DB347]"
        >
          <option value="">All Countries</option>
          {countriesInData.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2.5 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:border-[#5DB347]"
        >
          <option value="">All Types</option>
          {EMPLOYMENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select
          value={sectorFilter}
          onChange={(e) => setSectorFilter(e.target.value)}
          className="px-3 py-2.5 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:border-[#5DB347]"
        >
          <option value="">All Sectors</option>
          {sectorsInData.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-[#5DB347]" />
          <span className="ml-2 text-gray-500 text-sm">Loading talent pool...</span>
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 bg-red-50 text-red-700 p-4 rounded-lg border border-red-100">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
          <button onClick={fetchData} className="ml-auto text-sm underline">Retry</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No talent applications found.</p>
        </div>
      ) : (
        <>
          {/* ── Table ── */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left px-4 py-3 font-medium text-gray-500 w-8" />
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Date</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Name</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Country</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Skills</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Experience</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Type</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((app) => {
                    const expanded = expandedId === app.id;
                    const sc = statusConfig[app.status];
                    return (
                      <tr key={app.id} className="border-b border-gray-50 last:border-0">
                        <td className="px-4 py-3" colSpan={9}>
                          {/* Main row */}
                          <div className="flex items-center gap-0">
                            <button
                              onClick={() => setExpandedId(expanded ? null : app.id)}
                              className="p-1 rounded hover:bg-gray-100 mr-2"
                            >
                              {expanded
                                ? <ChevronDown className="w-4 h-4 text-gray-400" />
                                : <ChevronRight className="w-4 h-4 text-gray-400" />
                              }
                            </button>
                            <div className="grid grid-cols-8 gap-4 items-center flex-1 text-sm">
                              {/* Date */}
                              <span className="text-gray-500 text-xs">{formatDate(app.created_at)}</span>
                              {/* Name */}
                              <div>
                                <p className="font-medium text-[#1B2A4A]">{app.full_name}</p>
                                <p className="text-xs text-gray-400">{app.email}</p>
                              </div>
                              {/* Country */}
                              <span className="text-gray-700">{app.country}</span>
                              {/* Skills */}
                              <div className="flex flex-wrap gap-1">
                                {(app.skills || []).slice(0, 2).map((s) => (
                                  <span key={s} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#5DB347]/10 text-[#5DB347]">
                                    {s}
                                  </span>
                                ))}
                                {(app.skills || []).length > 2 && (
                                  <span className="text-[10px] text-gray-400">+{app.skills.length - 2}</span>
                                )}
                              </div>
                              {/* Experience */}
                              <span className="text-gray-600">{app.experience_years || '---'}</span>
                              {/* Type */}
                              <span className="text-gray-600">{app.employment_type || '---'}</span>
                              {/* Status */}
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold w-fit ${sc.color}`}>
                                {sc.icon} {sc.label}
                              </span>
                              {/* Actions */}
                              <div className="flex items-center gap-1">
                                {app.status !== 'active' && (
                                  <button
                                    onClick={() => updateStatus(app.id, 'active')}
                                    disabled={actionLoading === app.id}
                                    className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-green-50 text-green-700 hover:bg-green-100 transition-colors disabled:opacity-50"
                                  >
                                    {actionLoading === app.id ? '...' : 'Approve'}
                                  </button>
                                )}
                                {app.status !== 'rejected' && (
                                  <button
                                    onClick={() => updateStatus(app.id, 'rejected')}
                                    disabled={actionLoading === app.id}
                                    className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
                                  >
                                    {actionLoading === app.id ? '...' : 'Reject'}
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Expanded details */}
                          {expanded && (
                            <div className="mt-4 ml-8 p-5 bg-gray-50 rounded-xl border border-gray-100 space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div>
                                  <p className="text-xs text-gray-400 mb-1">Phone</p>
                                  <p className="text-[#1B2A4A]">{app.phone || '---'}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-400 mb-1">Region</p>
                                  <p className="text-[#1B2A4A]">{app.region || '---'}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-400 mb-1">Gender</p>
                                  <p className="text-[#1B2A4A]">{app.gender || '---'}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-400 mb-1">Date of Birth</p>
                                  <p className="text-[#1B2A4A]">{app.date_of_birth ? formatDate(app.date_of_birth) : '---'}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-400 mb-1">Job Title</p>
                                  <p className="text-[#1B2A4A] font-medium">{app.job_title || '---'}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-400 mb-1">Education</p>
                                  <p className="text-[#1B2A4A] capitalize">{app.education_level || '---'}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-400 mb-1">Availability</p>
                                  <p className="text-[#1B2A4A]">{app.availability?.replace(/_/g, ' ') || '---'}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-400 mb-1">Salary Expectation</p>
                                  <p className="text-[#1B2A4A]">{app.salary_expectation || '---'}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-400 mb-1">Willing to Relocate</p>
                                  <p className="text-[#1B2A4A]">{app.willing_to_relocate ? 'Yes' : 'No'}</p>
                                </div>
                              </div>

                              {/* Qualifications */}
                              {app.qualifications && (
                                <div>
                                  <p className="text-xs text-gray-400 mb-1">Qualifications</p>
                                  <p className="text-sm text-[#1B2A4A] whitespace-pre-line">{app.qualifications}</p>
                                </div>
                              )}

                              {/* Languages */}
                              {(app.languages || []).length > 0 && (
                                <div>
                                  <p className="text-xs text-gray-400 mb-1">Languages</p>
                                  <div className="flex flex-wrap gap-1">
                                    {app.languages.map((l) => (
                                      <span key={l} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700">
                                        {l}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* All Skills */}
                              {(app.skills || []).length > 0 && (
                                <div>
                                  <p className="text-xs text-gray-400 mb-1">All Skills</p>
                                  <div className="flex flex-wrap gap-1">
                                    {app.skills.map((s) => (
                                      <span key={s} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#5DB347]/10 text-[#5DB347]">
                                        {s}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Sectors */}
                              {(app.sectors || []).length > 0 && (
                                <div>
                                  <p className="text-xs text-gray-400 mb-1">Sectors</p>
                                  <div className="flex flex-wrap gap-1">
                                    {app.sectors.map((s) => (
                                      <span key={s} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-50 text-purple-700">
                                        {s}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Preferred Countries */}
                              {(app.preferred_countries || []).length > 0 && (
                                <div>
                                  <p className="text-xs text-gray-400 mb-1">Preferred Countries</p>
                                  <p className="text-sm text-[#1B2A4A]">{app.preferred_countries.join(', ')}</p>
                                </div>
                              )}

                              {/* Bio */}
                              {app.bio && (
                                <div>
                                  <p className="text-xs text-gray-400 mb-1">Bio</p>
                                  <p className="text-sm text-[#1B2A4A] whitespace-pre-line">{app.bio}</p>
                                </div>
                              )}

                              {/* Links */}
                              <div className="flex gap-4">
                                {app.cv_url && (
                                  <a href={app.cv_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-[#5DB347] hover:underline">
                                    <FileText className="w-3 h-3" /> View CV <ExternalLink className="w-3 h-3" />
                                  </a>
                                )}
                                {app.photo_url && (
                                  <a href={app.photo_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-[#5DB347] hover:underline">
                                    <Globe className="w-3 h-3" /> View Photo <ExternalLink className="w-3 h-3" />
                                  </a>
                                )}
                              </div>

                              {/* Referral */}
                              {app.referral_source && (
                                <div>
                                  <p className="text-xs text-gray-400 mb-1">Referral Source</p>
                                  <p className="text-sm text-[#1B2A4A] capitalize">{app.referral_source.replace(/_/g, ' ')}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Pagination ── */}
          <Pagination
            page={page}
            pageSize={PAGE_SIZE}
            totalCount={filtered.length}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
