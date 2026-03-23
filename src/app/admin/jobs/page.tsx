'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Briefcase,
  CheckCircle2,
  XCircle,
  Star,
  StarOff,
  Loader2,
  AlertCircle,
  Users,
  Clock,
  FileText,
} from 'lucide-react';
import FilterBar, {
  COUNTRY_FILTER,
  type FilterConfig,
  type FilterValues,
} from '@/components/admin/FilterBar';
import { createClient } from '@/lib/supabase/client';

/* ─── Types ─── */

interface JobListing {
  id: string;
  title: string;
  sector: string;
  country: string;
  region: string | null;
  job_type: string;
  pay_rate: string | null;
  pay_type: string | null;
  duration: string | null;
  workers_needed: number | null;
  farm_name: string | null;
  description: string | null;
  status: string;
  is_approved: boolean;
  is_featured: boolean;
  applications_count: number;
  created_at: string;
}

/* ─── Constants ─── */

const SECTORS = [
  'Livestock',
  'Horticulture',
  'Poultry',
  'Grains',
  'Cash Crops',
  'Machinery',
  'Processing',
];

const SECTOR_FILTER: FilterConfig = {
  key: 'sector',
  label: 'Sector',
  options: [
    { value: 'all', label: 'All Sectors' },
    ...SECTORS.map((s) => ({ value: s, label: s })),
  ],
};

const JOB_STATUS_FILTER: FilterConfig = {
  key: 'status',
  label: 'Status',
  options: [
    { value: 'all', label: 'All' },
    { value: 'draft', label: 'Draft' },
    { value: 'open', label: 'Open' },
    { value: 'closed', label: 'Closed' },
    { value: 'filled', label: 'Filled' },
    { value: 'expired', label: 'Expired' },
  ],
};

const STATUS_BADGES: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  open: 'bg-green-100 text-green-700',
  closed: 'bg-amber-100 text-amber-700',
  filled: 'bg-blue-100 text-blue-700',
  expired: 'bg-red-100 text-red-700',
};

/* ─── Toast ─── */

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
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
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
    </div>
  );
}

/* ─── Main Page ─── */

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);
  const [filters, setFilters] = useState<FilterValues>({
    search: '',
    sector: 'all',
    status: 'all',
    country: 'all',
  });

  const supabase = createClient();

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('job_listings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      setToast({ message: 'Failed to load job listings', type: 'error' });
      setJobs([]);
    } else {
      setJobs(
        (data || []).map((j: Record<string, unknown>) => ({
          ...j,
          is_approved: (j.is_approved as boolean) ?? false,
          is_featured: (j.is_featured as boolean) ?? false,
          applications_count:
            typeof j.applications_count === 'number'
              ? j.applications_count
              : 0,
        })) as JobListing[]
      );
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  /* ─── Filtered data ─── */

  const filtered = useMemo(() => {
    return jobs.filter((j) => {
      if (
        filters.sector !== 'all' &&
        j.sector !== filters.sector
      )
        return false;
      if (
        filters.status !== 'all' &&
        j.status !== filters.status
      )
        return false;
      if (
        filters.country !== 'all' &&
        j.country !== filters.country
      )
        return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        return (
          j.title.toLowerCase().includes(q) ||
          j.farm_name?.toLowerCase().includes(q) ||
          j.sector.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [jobs, filters]);

  /* ─── Stats ─── */

  const stats = useMemo(() => {
    const total = jobs.length;
    const open = jobs.filter((j) => j.status === 'open').length;
    const filled = jobs.filter((j) => j.status === 'filled').length;
    const applications = jobs.reduce(
      (s, j) => s + (j.applications_count || 0),
      0
    );
    return { total, open, filled, applications };
  }, [jobs]);

  /* ─── Actions ─── */

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    const { error } = await supabase
      .from('job_listings')
      .update({ is_approved: true })
      .eq('id', id);
    if (error) {
      setToast({ message: 'Failed to approve job', type: 'error' });
    } else {
      setJobs((prev) =>
        prev.map((j) => (j.id === id ? { ...j, is_approved: true } : j))
      );
      setToast({ message: 'Job approved', type: 'success' });
    }
    setActionLoading(null);
  };

  const handleClose = async (id: string) => {
    setActionLoading(id);
    const { error } = await supabase
      .from('job_listings')
      .update({ status: 'closed' })
      .eq('id', id);
    if (error) {
      setToast({ message: 'Failed to close job', type: 'error' });
    } else {
      setJobs((prev) =>
        prev.map((j) => (j.id === id ? { ...j, status: 'closed' } : j))
      );
      setToast({ message: 'Job closed', type: 'success' });
    }
    setActionLoading(null);
  };

  const handleToggleFeatured = async (id: string, current: boolean) => {
    setActionLoading(id);
    const { error } = await supabase
      .from('job_listings')
      .update({ is_featured: !current })
      .eq('id', id);
    if (error) {
      setToast({ message: 'Failed to update featured status', type: 'error' });
    } else {
      setJobs((prev) =>
        prev.map((j) =>
          j.id === id ? { ...j, is_featured: !current } : j
        )
      );
    }
    setActionLoading(null);
  };

  /* ─── Render ─── */

  const summaryCards = [
    {
      label: 'Total Jobs',
      value: stats.total,
      icon: <Briefcase className="w-5 h-5" />,
      color: '#1B2A4A',
      bg: 'bg-[#1B2A4A]/10',
    },
    {
      label: 'Open',
      value: stats.open,
      icon: <CheckCircle2 className="w-5 h-5" />,
      color: '#5DB347',
      bg: 'bg-[#5DB347]/10',
    },
    {
      label: 'Filled',
      value: stats.filled,
      icon: <Users className="w-5 h-5" />,
      color: '#3B82F6',
      bg: 'bg-blue-50',
    },
    {
      label: 'Applications',
      value: stats.applications,
      icon: <FileText className="w-5 h-5" />,
      color: '#8B5CF6',
      bg: 'bg-purple-50',
    },
  ];

  return (
    <div className="space-y-6">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1B2A4A]">Jobs Board</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage all job listings across the marketplace
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-xl p-4 border border-gray-100"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center`}
                style={{ color: card.color }}
              >
                {card.icon}
              </div>
              <div>
                <p
                  className="text-2xl font-bold"
                  style={{ color: card.color }}
                >
                  {card.value}
                </p>
                <p className="text-xs text-gray-500">{card.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <FilterBar
        filters={[SECTOR_FILTER, JOB_STATUS_FILTER, COUNTRY_FILTER]}
        values={filters}
        onChange={setFilters}
        searchPlaceholder="Search by title, farm, or sector..."
        resultCount={filtered.length}
      />

      {/* Loading */}
      {loading && (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#5DB347] mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading job listings...</p>
        </div>
      )}

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-[#1B2A4A]">
            No jobs found
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Try adjusting your filters
          </p>
        </div>
      )}

      {/* Table */}
      {!loading && filtered.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                    Title
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                    Sector
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                    Country
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                    Type
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                    Pay
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                    Workers
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                    Apps
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((job) => (
                  <tr
                    key={job.id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    {/* Title */}
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-[#1B2A4A]">
                          {job.title}
                        </p>
                        {job.farm_name && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            {job.farm_name}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Sector */}
                    <td className="py-3 px-4 text-gray-600">{job.sector}</td>

                    {/* Country */}
                    <td className="py-3 px-4 text-gray-600">{job.country}</td>

                    {/* Type */}
                    <td className="py-3 px-4 text-gray-600">{job.job_type}</td>

                    {/* Pay */}
                    <td className="py-3 px-4 text-gray-600">
                      {job.pay_rate || '-'}
                    </td>

                    {/* Workers */}
                    <td className="py-3 px-4 text-center text-gray-600">
                      {job.workers_needed ?? '-'}
                    </td>

                    {/* Applications */}
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-purple-600">
                        <FileText className="w-3 h-3" />
                        {job.applications_count || 0}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            STATUS_BADGES[job.status] ||
                            'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {job.status}
                        </span>
                        {job.is_featured && (
                          <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                        )}
                        {!job.is_approved && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-red-50 text-red-500">
                            Unapproved
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
                        {actionLoading === job.id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                        ) : (
                          <>
                            {/* Approve */}
                            {!job.is_approved && (
                              <button
                                onClick={() => handleApprove(job.id)}
                                className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                                title="Approve"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Close */}
                            {job.status !== 'closed' &&
                              job.status !== 'filled' &&
                              job.status !== 'expired' && (
                                <button
                                  onClick={() => handleClose(job.id)}
                                  className="p-1.5 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors"
                                  title="Close"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                </button>
                              )}

                            {/* Feature toggle */}
                            <button
                              onClick={() =>
                                handleToggleFeatured(
                                  job.id,
                                  job.is_featured
                                )
                              }
                              className={`p-1.5 rounded-lg transition-colors ${
                                job.is_featured
                                  ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                                  : 'bg-gray-50 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50'
                              }`}
                              title={
                                job.is_featured
                                  ? 'Remove featured'
                                  : 'Mark featured'
                              }
                            >
                              {job.is_featured ? (
                                <Star className="w-3.5 h-3.5" />
                              ) : (
                                <StarOff className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
