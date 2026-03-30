'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  TrendingUp,
  Briefcase,
  DollarSign,
  Target,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  Clock,
  Globe,
} from 'lucide-react';
import FilterBar, {
  type FilterConfig,
  type FilterValues,
} from '@/components/admin/FilterBar';
import { createClient } from '@/lib/supabase/client';

/* ─── Types ─── */

interface Opportunity {
  id: string;
  name: string;
  type: string;
  description: string;
  target: number;
  min_investment: number;
  target_irr: string;
  term: string;
  subscribed_percent: number;
  subscribed_amount: number;
  status: string;
  sector: string;
  country: string;
  risk_level: string;
  created_at: string;
}

interface OpportunityFormData {
  name: string;
  type: string;
  description: string;
  target: string;
  min_investment: string;
  target_irr: string;
  term: string;
  subscribed_percent: string;
  subscribed_amount: string;
  status: string;
  sector: string;
  country: string;
  risk_level: string;
}

const EMPTY_FORM: OpportunityFormData = {
  name: '',
  type: 'Debt Fund',
  description: '',
  target: '',
  min_investment: '',
  target_irr: '',
  term: '',
  subscribed_percent: '0',
  subscribed_amount: '0',
  status: 'Open',
  sector: 'Agriculture',
  country: 'Zimbabwe',
  risk_level: 'Medium',
};

/* ─── Constants ─── */

const FUND_TYPES = ['Debt Fund', 'Debt', 'Equity', 'Insurance', 'Trade Finance', 'Blended'];
const STATUSES = ['Open', 'Fully Subscribed', 'Closed', 'Coming Soon'];
const RISK_LEVELS = ['Low', 'Medium', 'Medium-High', 'High'];
const SECTORS = [
  'Agriculture', 'Agri-processing', 'Trade Finance', 'Insurance',
  'Horticulture', 'Livestock', 'Grains', 'Cash Crops', 'Macadamia',
  'Blueberry', 'Avocado', 'Mixed Farming',
];
const COUNTRIES = [
  'Pan-Africa', 'Zimbabwe', 'Kenya', 'Uganda', 'Tanzania',
  'Mozambique', 'South Africa', 'Botswana', 'Zambia', 'Ghana',
  'Nigeria', 'East Africa', 'Southern Africa',
];

const TYPE_FILTER: FilterConfig = {
  key: 'type',
  label: 'Type',
  options: [
    { value: 'all', label: 'All Types' },
    ...FUND_TYPES.map((t) => ({ value: t, label: t })),
  ],
};

const STATUS_FILTER: FilterConfig = {
  key: 'status',
  label: 'Status',
  options: [
    { value: 'all', label: 'All' },
    ...STATUSES.map((s) => ({ value: s, label: s })),
  ],
};

const RISK_FILTER: FilterConfig = {
  key: 'risk_level',
  label: 'Risk',
  options: [
    { value: 'all', label: 'All Risk Levels' },
    ...RISK_LEVELS.map((r) => ({ value: r, label: r })),
  ],
};

const STATUS_BADGES: Record<string, string> = {
  Open: 'bg-green-100 text-green-700',
  'Fully Subscribed': 'bg-blue-100 text-blue-700',
  Closed: 'bg-gray-100 text-gray-600',
  'Coming Soon': 'bg-amber-100 text-amber-700',
};

const RISK_BADGES: Record<string, string> = {
  Low: 'bg-green-50 text-green-600',
  Medium: 'bg-yellow-50 text-yellow-700',
  'Medium-High': 'bg-orange-50 text-orange-600',
  High: 'bg-red-50 text-red-600',
};

const TYPE_BADGES: Record<string, string> = {
  'Debt Fund': 'bg-blue-100 text-blue-700',
  Debt: 'bg-blue-100 text-blue-700',
  Equity: 'bg-purple-100 text-purple-700',
  Insurance: 'bg-teal-100 text-teal-700',
  'Trade Finance': 'bg-indigo-100 text-indigo-700',
  Blended: 'bg-pink-100 text-pink-700',
};

/* ─── Fallback Data ─── */

const FALLBACK_OPPORTUNITIES: Opportunity[] = [
  {
    id: 'fallback-1',
    name: 'AFU Agricultural Debt Fund II',
    type: 'Debt Fund',
    description: 'Senior secured lending to verified African farmers. Portfolio diversified across 20 countries, 15+ crop types.',
    target: 5000000,
    min_investment: 100000,
    target_irr: '18-22%',
    term: '3 years',
    subscribed_percent: 62,
    subscribed_amount: 3100000,
    status: 'Open',
    sector: 'Agriculture',
    country: 'Pan-Africa',
    risk_level: 'Medium',
    created_at: new Date().toISOString(),
  },
  {
    id: 'fallback-2',
    name: 'Zimbabwe Blueberry Expansion',
    type: 'Equity',
    description: 'Expand blueberry operation from 25ha to 100ha. EU export contracts secured. $18/kg farm-gate price.',
    target: 2000000,
    min_investment: 250000,
    target_irr: '24-30%',
    term: '5 years',
    subscribed_percent: 45,
    subscribed_amount: 900000,
    status: 'Open',
    sector: 'Blueberry',
    country: 'Zimbabwe',
    risk_level: 'Medium-High',
    created_at: new Date().toISOString(),
  },
  {
    id: 'fallback-3',
    name: 'East Africa Crop Insurance Pool',
    type: 'Insurance',
    description: "Parametric weather-triggered insurance products with 38% historical claims ratio. Covers 12,000+ farmers.",
    target: 3000000,
    min_investment: 150000,
    target_irr: '15-20%',
    term: '2 years (renewable)',
    subscribed_percent: 78,
    subscribed_amount: 2340000,
    status: 'Open',
    sector: 'Insurance',
    country: 'East Africa',
    risk_level: 'Medium',
    created_at: new Date().toISOString(),
  },
  {
    id: 'fallback-4',
    name: 'Trade Finance Facility',
    type: 'Trade Finance',
    description: 'Fund SBLCs, Letters of Credit, and export pre-financing for agricultural commodity exports. Average deal tenor: 90 days.',
    target: 10000000,
    min_investment: 500000,
    target_irr: '16-20%',
    term: '1 year (revolving)',
    subscribed_percent: 35,
    subscribed_amount: 3500000,
    status: 'Open',
    sector: 'Trade Finance',
    country: 'Pan-Africa',
    risk_level: 'Low',
    created_at: new Date().toISOString(),
  },
  {
    id: 'fallback-5',
    name: 'Uganda Smallholder Lending',
    type: 'Debt',
    description: '19,000 pre-identified farmers. MTN MoMo disbursement. 94% repayment rate on existing Zimbabwe portfolio.',
    target: 1500000,
    min_investment: 50000,
    target_irr: '20-24%',
    term: '2 years',
    subscribed_percent: 100,
    subscribed_amount: 1500000,
    status: 'Fully Subscribed',
    sector: 'Agriculture',
    country: 'Uganda',
    risk_level: 'Medium',
    created_at: new Date().toISOString(),
  },
];

/* ─── Helpers ─── */

function formatCurrency(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value.toLocaleString()}`;
}

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

/* ─── Opportunity Form Modal ─── */

function OpportunityFormModal({
  form,
  onChange,
  onSave,
  onClose,
  saving,
  isEdit,
}: {
  form: OpportunityFormData;
  onChange: (f: OpportunityFormData) => void;
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
            {isEdit ? 'Edit Investment Opportunity' : 'Create Investment Opportunity'}
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Opportunity Name *</label>
            <input
              value={form.name}
              onChange={(e) => onChange({ ...form, name: e.target.value })}
              placeholder="e.g. AFU Agricultural Debt Fund II"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347]"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fund Type *</label>
            <select
              value={form.type}
              onChange={(e) => onChange({ ...form, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347]"
            >
              {FUND_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
            <select
              value={form.status}
              onChange={(e) => onChange({ ...form, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347]"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Target Raise */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target Raise ($) *</label>
            <input
              type="number"
              value={form.target}
              onChange={(e) => onChange({ ...form, target: e.target.value })}
              placeholder="e.g. 5000000"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347]"
            />
          </div>

          {/* Min Investment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Investment ($) *</label>
            <input
              type="number"
              value={form.min_investment}
              onChange={(e) => onChange({ ...form, min_investment: e.target.value })}
              placeholder="e.g. 100000"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347]"
            />
          </div>

          {/* Target IRR */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target IRR</label>
            <input
              value={form.target_irr}
              onChange={(e) => onChange({ ...form, target_irr: e.target.value })}
              placeholder="e.g. 18-22%"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347]"
            />
          </div>

          {/* Term */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Term</label>
            <input
              value={form.term}
              onChange={(e) => onChange({ ...form, term: e.target.value })}
              placeholder="e.g. 3 years"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347]"
            />
          </div>

          {/* Sector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sector</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Country / Region</label>
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

          {/* Risk Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Risk Level</label>
            <select
              value={form.risk_level}
              onChange={(e) => onChange({ ...form, risk_level: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347]"
            >
              {RISK_LEVELS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Subscribed Percent */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subscribed %</label>
            <input
              type="number"
              min="0"
              max="100"
              value={form.subscribed_percent}
              onChange={(e) => onChange({ ...form, subscribed_percent: e.target.value })}
              placeholder="0"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347]"
            />
          </div>

          {/* Subscribed Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subscribed Amount ($)</label>
            <input
              type="number"
              value={form.subscribed_amount}
              onChange={(e) => onChange({ ...form, subscribed_amount: e.target.value })}
              placeholder="0"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347]"
            />
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => onChange({ ...form, description: e.target.value })}
              placeholder="Describe the investment opportunity, key highlights, risk factors..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347] resize-none"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-[#5DB347] text-white text-sm font-medium rounded-lg hover:bg-[#4a9a38] disabled:opacity-50 shadow-sm transition-all"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isEdit ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */

export default function AdminInvestmentOpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);
  const [filters, setFilters] = useState<FilterValues>({
    search: '',
    type: 'all',
    status: 'all',
    risk_level: 'all',
  });

  // Modal state
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<OpportunityFormData>(EMPTY_FORM);
  const [formSaving, setFormSaving] = useState(false);

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<Opportunity | null>(null);
  const [deleting, setDeleting] = useState(false);

  const supabase = createClient();

  /* ─── Fetch ─── */

  const fetchOpportunities = useCallback(async () => {
    setLoading(true);

    // Try dedicated table first
    const { data, error } = await supabase
      .from('investment_opportunities')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      setOpportunities(
        data.map((row: Record<string, unknown>) => ({
          id: String(row.id),
          name: String(row.name || ''),
          type: String(row.type || 'Debt'),
          description: String(row.description || ''),
          target: Number(row.target || 0),
          min_investment: Number(row.min_investment || 0),
          target_irr: String(row.target_irr || ''),
          term: String(row.term || ''),
          subscribed_percent: Number(row.subscribed_percent || 0),
          subscribed_amount: Number(row.subscribed_amount || 0),
          status: String(row.status || 'Open'),
          sector: String(row.sector || ''),
          country: String(row.country || ''),
          risk_level: String(row.risk_level || 'Medium'),
          created_at: String(row.created_at || ''),
        })) as Opportunity[]
      );
      setLoading(false);
      return;
    }

    // Fallback: try site_content JSON
    try {
      const { data: scData } = await supabase
        .from('site_content')
        .select('*')
        .eq('section', 'investment_opportunities')
        .single();

      if (scData) {
        const raw = scData.content || scData.value;
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
        if (Array.isArray(parsed) && parsed.length > 0) {
          setOpportunities(
            parsed.map((row: Record<string, unknown>) => ({
              id: String(row.id || crypto.randomUUID()),
              name: String(row.name || row.title || ''),
              type: String(row.type || row.fund_type || 'Debt'),
              description: String(row.description || ''),
              target: Number(row.target || 0),
              min_investment: Number(row.min_investment || row.minInvestment || 0),
              target_irr: String(row.target_irr || row.targetIRR || ''),
              term: String(row.term || ''),
              subscribed_percent: Number(row.subscribed_percent || row.subscribed || 0),
              subscribed_amount: Number(row.subscribed_amount || row.subscribedAmount || 0),
              status: String(row.status || 'Open'),
              sector: String(row.sector || ''),
              country: String(row.country || ''),
              risk_level: String(row.risk_level || 'Medium'),
              created_at: String(row.created_at || new Date().toISOString()),
            }))
          );
          setLoading(false);
          return;
        }
      }
    } catch {
      /* use fallback */
    }

    // Final fallback: hardcoded demo data
    setOpportunities(FALLBACK_OPPORTUNITIES);
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchOpportunities();
  }, [fetchOpportunities]);

  /* ─── Filtered data ─── */

  const filtered = useMemo(() => {
    return opportunities.filter((o) => {
      if (filters.type !== 'all' && o.type !== filters.type) return false;
      if (filters.status !== 'all' && o.status !== filters.status) return false;
      if (filters.risk_level !== 'all' && o.risk_level !== filters.risk_level) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        return (
          o.name.toLowerCase().includes(q) ||
          o.description.toLowerCase().includes(q) ||
          o.sector.toLowerCase().includes(q) ||
          o.country.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [opportunities, filters]);

  /* ─── Stats ─── */

  const stats = useMemo(() => {
    const total = opportunities.length;
    const open = opportunities.filter((o) => o.status === 'Open').length;
    const totalTarget = opportunities.reduce((s, o) => s + (o.target || 0), 0);
    const totalSubscribed = opportunities.reduce((s, o) => s + (o.subscribed_amount || 0), 0);
    return { total, open, totalTarget, totalSubscribed };
  }, [opportunities]);

  /* ─── Create / Edit ─── */

  const openCreateModal = () => {
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setShowFormModal(true);
  };

  const openEditModal = (opp: Opportunity) => {
    setEditingId(opp.id);
    setFormData({
      name: opp.name,
      type: opp.type,
      description: opp.description,
      target: String(opp.target || ''),
      min_investment: String(opp.min_investment || ''),
      target_irr: opp.target_irr,
      term: opp.term,
      subscribed_percent: String(opp.subscribed_percent || 0),
      subscribed_amount: String(opp.subscribed_amount || 0),
      status: opp.status,
      sector: opp.sector || 'Agriculture',
      country: opp.country || 'Zimbabwe',
      risk_level: opp.risk_level || 'Medium',
    });
    setShowFormModal(true);
  };

  /* ─── Save (Insert / Update) ─── */

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setToast({ message: 'Opportunity name is required', type: 'error' });
      return;
    }
    if (!formData.target || Number(formData.target) <= 0) {
      setToast({ message: 'Target raise amount is required', type: 'error' });
      return;
    }
    setFormSaving(true);

    const payload = {
      name: formData.name,
      type: formData.type,
      description: formData.description || null,
      target: Number(formData.target) || 0,
      min_investment: Number(formData.min_investment) || 0,
      target_irr: formData.target_irr || null,
      term: formData.term || null,
      subscribed_percent: Number(formData.subscribed_percent) || 0,
      subscribed_amount: Number(formData.subscribed_amount) || 0,
      status: formData.status,
      sector: formData.sector || null,
      country: formData.country || null,
      risk_level: formData.risk_level || 'Medium',
    };

    if (editingId) {
      // Check if this is a fallback item (not in DB)
      const isFallback = editingId.startsWith('fallback-');
      if (isFallback) {
        // Insert as new record instead of update
        const { error } = await supabase
          .from('investment_opportunities')
          .insert(payload);
        if (error) {
          setToast({ message: `Failed to save: ${error.message}`, type: 'error' });
        } else {
          setToast({ message: 'Opportunity saved to database', type: 'success' });
          setShowFormModal(false);
          await fetchOpportunities();
        }
      } else {
        const { error } = await supabase
          .from('investment_opportunities')
          .update(payload)
          .eq('id', editingId);
        if (error) {
          setToast({ message: `Failed to update: ${error.message}`, type: 'error' });
        } else {
          setToast({ message: 'Opportunity updated successfully', type: 'success' });
          setShowFormModal(false);
          await fetchOpportunities();
        }
      }
    } else {
      const { error } = await supabase
        .from('investment_opportunities')
        .insert(payload);
      if (error) {
        setToast({ message: `Failed to create: ${error.message}`, type: 'error' });
      } else {
        setToast({ message: 'Opportunity created successfully', type: 'success' });
        setShowFormModal(false);
        await fetchOpportunities();
      }
    }
    setFormSaving(false);
  };

  /* ─── Delete ─── */

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);

    // If fallback item, just remove from local state
    if (deleteTarget.id.startsWith('fallback-')) {
      setOpportunities((prev) => prev.filter((o) => o.id !== deleteTarget.id));
      setToast({ message: 'Opportunity removed', type: 'success' });
      setDeleteTarget(null);
      setDeleting(false);
      return;
    }

    const { error } = await supabase
      .from('investment_opportunities')
      .delete()
      .eq('id', deleteTarget.id);
    if (error) {
      setToast({ message: `Failed to delete: ${error.message}`, type: 'error' });
    } else {
      setToast({ message: 'Opportunity deleted', type: 'success' });
      setOpportunities((prev) => prev.filter((o) => o.id !== deleteTarget.id));
    }
    setDeleteTarget(null);
    setDeleting(false);
  };

  /* ─── Summary Cards ─── */

  const summaryCards = [
    {
      label: 'Total Opportunities',
      value: stats.total,
      icon: <Briefcase className="w-5 h-5" />,
      color: '#1B2A4A',
      bg: 'bg-[#1B2A4A]/10',
    },
    {
      label: 'Open',
      value: stats.open,
      icon: <TrendingUp className="w-5 h-5" />,
      color: '#5DB347',
      bg: 'bg-[#5DB347]/10',
    },
    {
      label: 'Target Raise',
      value: formatCurrency(stats.totalTarget),
      icon: <Target className="w-5 h-5" />,
      color: '#3B82F6',
      bg: 'bg-blue-50',
    },
    {
      label: 'Subscribed',
      value: formatCurrency(stats.totalSubscribed),
      icon: <DollarSign className="w-5 h-5" />,
      color: '#8B5CF6',
      bg: 'bg-purple-50',
    },
  ];

  /* ─── Render ─── */

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
          <h1 className="text-2xl font-bold text-[#1B2A4A]">Investment Opportunities</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage investment opportunities displayed in the investor portal
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#5DB347] text-white text-sm font-medium rounded-lg hover:bg-[#4a9a38] shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Opportunity
        </button>
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
        filters={[TYPE_FILTER, STATUS_FILTER, RISK_FILTER]}
        values={filters}
        onChange={setFilters}
        searchPlaceholder="Search by name, sector, or country..."
        resultCount={filtered.length}
      />

      {/* Loading */}
      {loading && (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#5DB347] mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading investment opportunities...</p>
        </div>
      )}

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-[#1B2A4A]">
            No opportunities found
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Try adjusting your filters or create a new investment opportunity
          </p>
          <button
            onClick={openCreateModal}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#5DB347] text-white text-sm font-medium rounded-lg hover:bg-[#4a9a38]"
          >
            <Plus className="w-4 h-4" />
            Add Opportunity
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
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Name</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Type</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Target</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Min Invest</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">IRR</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Term</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Subscribed</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Risk</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((opp) => (
                  <tr key={opp.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-[#1B2A4A]">{opp.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {opp.sector && (
                            <span className="text-xs text-gray-400">{opp.sector}</span>
                          )}
                          {opp.country && (
                            <span className="inline-flex items-center gap-0.5 text-xs text-gray-400">
                              <Globe className="w-3 h-3" />
                              {opp.country}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_BADGES[opp.type] || 'bg-gray-100 text-gray-600'}`}>
                        {opp.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 font-medium">{formatCurrency(opp.target)}</td>
                    <td className="py-3 px-4 text-gray-600">{formatCurrency(opp.min_investment)}</td>
                    <td className="py-3 px-4">
                      <span className="text-[#5DB347] font-semibold">{opp.target_irr || '-'}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-gray-600">
                        <Clock className="w-3 h-3 text-gray-400" />
                        {opp.term || '-'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div>
                        <p className="font-medium text-[#1B2A4A]">{opp.subscribed_percent}%</p>
                        <p className="text-xs text-gray-400">{formatCurrency(opp.subscribed_amount)}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${RISK_BADGES[opp.risk_level] || 'bg-gray-100 text-gray-600'}`}>
                        {opp.risk_level}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          STATUS_BADGES[opp.status] || 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {opp.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
                        {/* Edit */}
                        <button
                          onClick={() => openEditModal(opp)}
                          className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => setDeleteTarget(opp)}
                          className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Opportunity Form Modal */}
      {showFormModal && (
        <OpportunityFormModal
          form={formData}
          onChange={setFormData}
          onSave={handleSave}
          onClose={() => setShowFormModal(false)}
          saving={formSaving}
          isEdit={!!editingId}
        />
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <ConfirmDialog
          title="Delete Investment Opportunity"
          message={`Are you sure you want to delete "${deleteTarget.name}"? This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}
