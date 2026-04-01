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
  FileText,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  Download,
  ChevronDown,
  ChevronUp,
  Eye,
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
  pay_description: string | null;
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

interface JobFormData {
  title: string;
  sector: string;
  country: string;
  region: string;
  job_type: string;
  pay_rate: string;
  pay_type: string;
  pay_description: string;
  duration: string;
  workers_needed: string;
  farm_name: string;
  description: string;
  status: string;
}

const EMPTY_FORM: JobFormData = {
  title: '',
  sector: 'Operations',
  country: 'Botswana',
  region: '',
  job_type: 'Full-time',
  pay_rate: '',
  pay_type: 'Monthly',
  pay_description: '',
  duration: '',
  workers_needed: '1',
  farm_name: '',
  description: '',
  status: 'draft',
};

/* ─── Constants ─── */

const SECTORS = [
  'Executive', 'Technology', 'Operations', 'Commercial', 'Finance',
  'Regional', 'Country', 'Agronomy', 'Insurance', 'Legal', 'Community',
  'Marketing', 'Livestock', 'Horticulture', 'Poultry', 'Grains',
  'Cash Crops', 'Machinery', 'Processing',
];

const COUNTRIES = [
  'Botswana', 'Zimbabwe', 'Tanzania', 'Kenya', 'South Africa',
  'Nigeria', 'Zambia', 'Mozambique', 'Ghana', 'Uganda',
  'Sierra Leone', 'Malawi', 'Egypt', 'Ethiopia', 'Namibia',
];

const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Seasonal', 'Casual', 'Internship'];
const PAY_TYPES = ['Hourly', 'Daily', 'Weekly', 'Monthly', 'Per Season', 'Per Harvest', 'Negotiable'];

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

/* ─── Application Types ─── */

interface JobApplication {
  id: string;
  job_id: string;
  talent_id: string | null;
  applicant_name: string;
  applicant_email: string;
  applicant_phone: string | null;
  cover_message: string;
  cv_url: string | null;
  status: string;
  created_at: string;
  talent?: {
    full_name: string;
    email: string;
    phone: string | null;
    country: string | null;
    cv_url: string | null;
    skills: string[] | null;
  } | null;
  job?: {
    title: string;
    country: string;
    sector: string;
  } | null;
}

const APP_STATUS_BADGES: Record<string, string> = {
  applied: 'bg-blue-100 text-blue-700',
  shortlisted: 'bg-yellow-100 text-yellow-700',
  interviewed: 'bg-purple-100 text-purple-700',
  offered: 'bg-green-100 text-green-700',
  hired: 'bg-[#5DB347]/10 text-[#5DB347]',
  rejected: 'bg-red-100 text-red-700',
};

const APP_STATUS_OPTIONS = [
  { value: 'shortlisted', label: 'Shortlist' },
  { value: 'interviewed', label: 'Interview' },
  { value: 'offered', label: 'Offer' },
  { value: 'hired', label: 'Hire' },
  { value: 'rejected', label: 'Reject' },
];

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

/* ─── Confirm Dialog ─── */

function ConfirmDialog({
  title,
  message,
  onConfirm,
  onCancel,
  loading,
}: {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-[#1B2A4A]">{title}</h3>
        <p className="text-sm text-gray-600">{message}</p>
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Job Form Modal ─── */

function JobFormModal({
  form,
  onChange,
  onSave,
  onClose,
  saving,
  isEdit,
}: {
  form: JobFormData;
  onChange: (f: JobFormData) => void;
  onSave: () => void;
  onClose: () => void;
  saving: boolean;
  isEdit: boolean;
}) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-[#1B2A4A]">
            {isEdit ? 'Edit Job Listing' : 'Create Job Listing'}
          </h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Title */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
            <input
              value={form.title}
              onChange={(e) => onChange({ ...form, title: e.target.value })}
              placeholder="e.g. Senior Farm Manager"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347]"
            />
          </div>

          {/* Sector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sector *</label>
            <select
              value={form.sector}
              onChange={(e) => onChange({ ...form, sector: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347]"
            >
              {SECTORS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Country */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
            <select
              value={form.country}
              onChange={(e) => onChange({ ...form, country: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347]"
            >
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Region */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
            <input
              value={form.region}
              onChange={(e) => onChange({ ...form, region: e.target.value })}
              placeholder="e.g. Mashonaland East"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347]"
            />
          </div>

          {/* Job Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Type *</label>
            <select
              value={form.job_type}
              onChange={(e) => onChange({ ...form, job_type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347]"
            >
              {JOB_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Pay Rate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pay Rate</label>
            <input
              value={form.pay_rate}
              onChange={(e) => onChange({ ...form, pay_rate: e.target.value })}
              placeholder="e.g. $500"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347]"
            />
          </div>

          {/* Pay Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pay Type</label>
            <select
              value={form.pay_type}
              onChange={(e) => onChange({ ...form, pay_type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347]"
            >
              {PAY_TYPES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Pay Description */}
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Compensation Description</label>
            <input
              value={form.pay_description}
              onChange={(e) => onChange({ ...form, pay_description: e.target.value })}
              placeholder="e.g. Competitive + Equity — Based on experience"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347]"
            />
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
            <input
              value={form.duration}
              onChange={(e) => onChange({ ...form, duration: e.target.value })}
              placeholder="e.g. 6 months"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347]"
            />
          </div>

          {/* Workers Needed */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Workers Needed</label>
            <input
              type="number"
              min="1"
              value={form.workers_needed}
              onChange={(e) => onChange({ ...form, workers_needed: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347]"
            />
          </div>

          {/* Farm Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Farm Name</label>
            <input
              value={form.farm_name}
              onChange={(e) => onChange({ ...form, farm_name: e.target.value })}
              placeholder="e.g. Green Valley Farm"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347]"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={form.status}
              onChange={(e) => onChange({ ...form, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347]"
            >
              <option value="draft">Draft</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
              <option value="filled">Filled</option>
            </select>
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => onChange({ ...form, description: e.target.value })}
              rows={4}
              placeholder="Describe the job role, requirements, and benefits..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347] resize-y"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={saving || !form.title.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-[#5DB347] text-white text-sm font-medium rounded-lg hover:bg-[#4a9a38] disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isEdit ? 'Update Job' : 'Create Job'}
          </button>
        </div>
      </div>
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

  // Modal state
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [formData, setFormData] = useState<JobFormData>(EMPTY_FORM);
  const [formSaving, setFormSaving] = useState(false);

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<JobListing | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Tab state
  const [activeTab, setActiveTab] = useState<'jobs' | 'applications'>('jobs');

  // Applications state
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [appsLoading, setAppsLoading] = useState(false);
  const [expandedAppId, setExpandedAppId] = useState<string | null>(null);
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);

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

  /* ─── Fetch Applications ─── */

  const fetchApplications = useCallback(async () => {
    setAppsLoading(true);
    const { data, error } = await supabase
      .from('job_applications')
      .select('*, talent:talent_profiles(*), job:job_listings(title, country, sector)')
      .order('created_at', { ascending: false });

    if (error) {
      setToast({ message: 'Failed to load applications', type: 'error' });
      setApplications([]);
    } else {
      setApplications((data || []) as JobApplication[]);
    }
    setAppsLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeTab === 'applications') {
      fetchApplications();
    }
  }, [activeTab, fetchApplications]);

  const handleUpdateAppStatus = async (appId: string, newStatus: string) => {
    setStatusUpdating(appId);
    const { error } = await supabase
      .from('job_applications')
      .update({ status: newStatus })
      .eq('id', appId);

    if (error) {
      setToast({ message: 'Failed to update status', type: 'error' });
    } else {
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a))
      );
      setToast({ message: `Status updated to ${newStatus}`, type: 'success' });
    }
    setStatusUpdating(null);
  };

  /* ─── Filtered data ─── */

  const filtered = useMemo(() => {
    return jobs.filter((j) => {
      if (filters.sector !== 'all' && j.sector !== filters.sector) return false;
      if (filters.status !== 'all' && j.status !== filters.status) return false;
      if (filters.country !== 'all' && j.country !== filters.country) return false;
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

  /* ─── Create / Edit ─── */

  const openCreateModal = () => {
    setEditingJobId(null);
    setFormData(EMPTY_FORM);
    setShowFormModal(true);
  };

  const openEditModal = (job: JobListing) => {
    setEditingJobId(job.id);
    setFormData({
      title: job.title,
      sector: job.sector,
      country: job.country,
      region: job.region || '',
      job_type: job.job_type,
      pay_rate: job.pay_rate || '',
      pay_type: job.pay_type || 'Monthly',
      pay_description: job.pay_description || '',
      duration: job.duration || '',
      workers_needed: String(job.workers_needed || 1),
      farm_name: job.farm_name || '',
      description: job.description || '',
      status: job.status,
    });
    setShowFormModal(true);
  };

  const handleSaveJob = async () => {
    if (!formData.title.trim()) {
      setToast({ message: 'Job title is required', type: 'error' });
      return;
    }
    setFormSaving(true);
    const payload = {
      title: formData.title,
      sector: formData.sector,
      country: formData.country,
      region: formData.region || null,
      job_type: formData.job_type,
      pay_rate: formData.pay_rate || null,
      pay_type: formData.pay_type || null,
      pay_description: formData.pay_description || null,
      duration_description: formData.duration || null,
      workers_needed: formData.workers_needed ? parseInt(formData.workers_needed, 10) : null,
      farm_name: formData.farm_name || null,
      description: formData.description || null,
      status: formData.status,
    };

    if (editingJobId) {
      const { error } = await supabase
        .from('job_listings')
        .update(payload)
        .eq('id', editingJobId);
      if (error) {
        setToast({ message: 'Failed to update job: ' + error.message, type: 'error' });
      } else {
        setToast({ message: 'Job updated successfully', type: 'success' });
        setShowFormModal(false);
        await fetchJobs();
      }
    } else {
      const { error } = await supabase
        .from('job_listings')
        .insert({ ...payload, is_approved: false, is_featured: false });
      if (error) {
        setToast({ message: 'Failed to create job: ' + error.message, type: 'error' });
      } else {
        setToast({ message: 'Job created successfully', type: 'success' });
        setShowFormModal(false);
        await fetchJobs();
      }
    }
    setFormSaving(false);
  };

  /* ─── Delete ─── */

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const { error } = await supabase
      .from('job_listings')
      .delete()
      .eq('id', deleteTarget.id);
    if (error) {
      setToast({ message: 'Failed to delete job', type: 'error' });
    } else {
      setToast({ message: 'Job deleted', type: 'success' });
      setJobs((prev) => prev.filter((j) => j.id !== deleteTarget.id));
    }
    setDeleteTarget(null);
    setDeleting(false);
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">Jobs Board</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage all job listings across the marketplace
          </p>
        </div>
        {activeTab === 'jobs' && (
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#5DB347] text-white text-sm font-medium rounded-lg hover:bg-[#4a9a38] shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Create Job
          </button>
        )}
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('jobs')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'jobs'
              ? 'bg-white text-[#1B2A4A] shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          Jobs
        </button>
        <button
          onClick={() => setActiveTab('applications')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'applications'
              ? 'bg-white text-[#1B2A4A] shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <FileText className="w-4 h-4" />
          Applications
          {applications.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#5DB347]/10 text-[#5DB347]">
              {applications.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'jobs' && (<>
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
            Try adjusting your filters or create a new job listing
          </p>
          <button
            onClick={openCreateModal}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#5DB347] text-white text-sm font-medium rounded-lg hover:bg-[#4a9a38]"
          >
            <Plus className="w-4 h-4" />
            Create Job
          </button>
        </div>
      )}

      {/* Table */}
      {!loading && filtered.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Title</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Sector</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Country</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Type</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Pay</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Workers</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Apps</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-[#1B2A4A]">{job.title}</p>
                        {job.farm_name && (
                          <p className="text-xs text-gray-400 mt-0.5">{job.farm_name}</p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{job.sector}</td>
                    <td className="py-3 px-4 text-gray-600">{job.country}</td>
                    <td className="py-3 px-4 text-gray-600">{job.job_type}</td>
                    <td className="py-3 px-4 text-gray-600">{job.pay_description || job.pay_rate || '-'}</td>
                    <td className="py-3 px-4 text-center text-gray-600">{job.workers_needed ?? '-'}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-purple-600">
                        <FileText className="w-3 h-3" />
                        {job.applications_count || 0}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            STATUS_BADGES[job.status] || 'bg-gray-100 text-gray-600'
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
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
                        {actionLoading === job.id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                        ) : (
                          <>
                            {/* Edit */}
                            <button
                              onClick={() => openEditModal(job)}
                              className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                              title="Edit"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => setDeleteTarget(job)}
                              className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Approve */}
                            {!job.is_approved && (
                              <button
                                onClick={() => handleApprove(job.id)}
                                className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
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
                                  className="p-2 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors"
                                  title="Close"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                </button>
                              )}

                            {/* Feature toggle */}
                            <button
                              onClick={() =>
                                handleToggleFeatured(job.id, job.is_featured)
                              }
                              className={`p-2 rounded-lg transition-colors ${
                                job.is_featured
                                  ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                                  : 'bg-gray-50 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50'
                              }`}
                              title={
                                job.is_featured ? 'Remove featured' : 'Mark featured'
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

      </>)}

      {/* ─── Applications Tab ─── */}
      {activeTab === 'applications' && (
        <div className="space-y-4">
          {/* Applications Loading */}
          {appsLoading && (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#5DB347] mx-auto mb-3" />
              <p className="text-sm text-gray-500">Loading applications...</p>
            </div>
          )}

          {/* Applications Empty */}
          {!appsLoading && applications.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-[#1B2A4A]">No applications yet</h3>
              <p className="text-sm text-gray-500 mt-1">
                Applications will appear here when candidates apply for jobs.
              </p>
            </div>
          )}

          {/* Applications Table */}
          {!appsLoading && applications.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase w-8"></th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Applicant</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Job Title</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Date Applied</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                      <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">CV</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {applications.map((app) => (
                      <>
                        <tr
                          key={app.id}
                          className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                          onClick={() =>
                            setExpandedAppId(expandedAppId === app.id ? null : app.id)
                          }
                        >
                          <td className="py-3 px-4">
                            {expandedAppId === app.id ? (
                              <ChevronUp className="w-4 h-4 text-gray-400" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-gray-400" />
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium text-[#1B2A4A]">
                                {app.talent?.full_name || app.applicant_name}
                              </p>
                              <p className="text-xs text-gray-400 mt-0.5">
                                {app.talent?.email || app.applicant_email}
                              </p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              <p className="text-gray-700">{app.job?.title || 'Unknown'}</p>
                              {app.job?.country && (
                                <p className="text-xs text-gray-400 mt-0.5">
                                  {app.job.country} &middot; {app.job.sector}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-500">
                            {new Date(app.created_at).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                APP_STATUS_BADGES[app.status] || 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {app.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {(app.cv_url || app.talent?.cv_url) ? (
                              <a
                                href={app.cv_url || app.talent?.cv_url || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs font-medium text-[#5DB347] hover:underline"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Download className="w-3.5 h-3.5" />
                                Download
                              </a>
                            ) : (
                              <span className="text-xs text-gray-400">None</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div
                              className="flex items-center justify-end gap-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {statusUpdating === app.id ? (
                                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                              ) : (
                                APP_STATUS_OPTIONS.filter((opt) => opt.value !== app.status).map(
                                  (opt) => (
                                    <button
                                      key={opt.value}
                                      onClick={() => handleUpdateAppStatus(app.id, opt.value)}
                                      className={`px-2 py-1 rounded text-[10px] font-semibold transition-colors ${
                                        opt.value === 'rejected'
                                          ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                          : opt.value === 'hired'
                                            ? 'bg-[#5DB347]/10 text-[#5DB347] hover:bg-[#5DB347]/20'
                                            : opt.value === 'shortlisted'
                                              ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                                              : opt.value === 'interviewed'
                                                ? 'bg-purple-50 text-purple-600 hover:bg-purple-100'
                                                : 'bg-green-50 text-green-600 hover:bg-green-100'
                                      }`}
                                      title={opt.label}
                                    >
                                      {opt.label}
                                    </button>
                                  ),
                                )
                              )}
                            </div>
                          </td>
                        </tr>

                        {/* Expanded details */}
                        {expandedAppId === app.id && (
                          <tr key={`${app.id}-detail`}>
                            <td colSpan={7} className="bg-gray-50/50">
                              <div className="px-6 py-4 space-y-3">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                  <div>
                                    <p className="text-xs font-semibold text-gray-400 uppercase mb-1">
                                      Phone
                                    </p>
                                    <p className="text-[#1B2A4A]">
                                      {app.applicant_phone || app.talent?.phone || 'N/A'}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-semibold text-gray-400 uppercase mb-1">
                                      Country
                                    </p>
                                    <p className="text-[#1B2A4A]">
                                      {app.talent?.country || 'N/A'}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-semibold text-gray-400 uppercase mb-1">
                                      Skills
                                    </p>
                                    {app.talent?.skills && app.talent.skills.length > 0 ? (
                                      <div className="flex flex-wrap gap-1">
                                        {app.talent.skills.map((s) => (
                                          <span
                                            key={s}
                                            className="px-2 py-0.5 bg-[#5DB347]/10 text-[#5DB347] rounded-full text-xs"
                                          >
                                            {s}
                                          </span>
                                        ))}
                                      </div>
                                    ) : (
                                      <p className="text-gray-400">N/A</p>
                                    )}
                                  </div>
                                </div>

                                <div>
                                  <p className="text-xs font-semibold text-gray-400 uppercase mb-1">
                                    Cover Message
                                  </p>
                                  <div className="bg-white border border-gray-100 rounded-lg p-4 text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                                    {app.cover_message || 'No cover message provided.'}
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Job Form Modal */}
      {showFormModal && (
        <JobFormModal
          form={formData}
          onChange={setFormData}
          onSave={handleSaveJob}
          onClose={() => setShowFormModal(false)}
          saving={formSaving}
          isEdit={!!editingJobId}
        />
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <ConfirmDialog
          title="Delete Job Listing"
          message={`Are you sure you want to delete "${deleteTarget.title}"? This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}
