'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Shield,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  DollarSign,
  Clock,
  Percent,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

/* ─── Types ─── */

interface InsuranceProduct {
  id: string;
  name: string;
  type: string;
  description: string | null;
  coverage_details: { details?: string[] } | null;
  premium_range: { min?: number; max?: number; currency?: string } | null;
  deductible_percent: number | null;
  waiting_period_days: number | null;
  eligibility: string[] | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

interface ProductFormData {
  name: string;
  type: string;
  description: string;
  coverage_details_text: string;
  premium_min: string;
  premium_max: string;
  premium_currency: string;
  deductible_percent: string;
  waiting_period_days: string;
  eligibility_text: string;
  active: boolean;
}

const EMPTY_FORM: ProductFormData = {
  name: '',
  type: 'crop',
  description: '',
  coverage_details_text: '',
  premium_min: '',
  premium_max: '',
  premium_currency: 'USD',
  deductible_percent: '5',
  waiting_period_days: '30',
  eligibility_text: '',
  active: true,
};

/* ─── Constants ─── */

const PRODUCT_TYPES = ['crop', 'livestock', 'equipment', 'weather-index', 'medical', 'trade'];

const TYPE_LABELS: Record<string, string> = {
  crop: 'Crop',
  livestock: 'Livestock',
  equipment: 'Equipment',
  'weather-index': 'Weather Index',
  medical: 'Medical',
  trade: 'Trade',
};

const TYPE_BADGES: Record<string, string> = {
  crop: 'bg-green-100 text-green-700',
  livestock: 'bg-amber-100 text-amber-700',
  equipment: 'bg-blue-100 text-blue-700',
  'weather-index': 'bg-purple-100 text-purple-700',
  medical: 'bg-pink-100 text-pink-700',
  trade: 'bg-cyan-100 text-cyan-700',
};

const FALLBACK_PRODUCTS: InsuranceProduct[] = [
  {
    id: 'fallback-1',
    name: 'Crop Shield Basic',
    type: 'crop',
    description: 'Essential crop protection against drought, flood, and pest damage.',
    coverage_details: { details: ['Drought damage', 'Flood damage', 'Pest infestation', 'Hail damage', 'Fire'] },
    premium_range: { min: 15, max: 45, currency: 'USD' },
    deductible_percent: 10,
    waiting_period_days: 14,
    eligibility: ['AFU member in good standing', 'Farm size 0.5 - 20 hectares'],
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'fallback-2',
    name: 'Livestock Guardian',
    type: 'livestock',
    description: 'Protect your livestock investment against disease, theft, and natural disasters.',
    coverage_details: { details: ['Disease-related death', 'Theft', 'Natural disaster', 'Predator attack'] },
    premium_range: { min: 20, max: 80, currency: 'USD' },
    deductible_percent: 15,
    waiting_period_days: 21,
    eligibility: ['AFU member in good standing', 'Livestock registered with ear tags/photos'],
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'fallback-3',
    name: 'Equipment Protect',
    type: 'equipment',
    description: 'Insurance for farming equipment and machinery against breakdowns, theft, and damage.',
    coverage_details: { details: ['Mechanical breakdown', 'Theft', 'Fire and lightning', 'Flood damage'] },
    premium_range: { min: 25, max: 120, currency: 'USD' },
    deductible_percent: 10,
    waiting_period_days: 7,
    eligibility: ['AFU member in good standing', 'Equipment registered on platform'],
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'fallback-4',
    name: 'Weather Index',
    type: 'weather-index',
    description: 'Automatic payouts based on satellite weather data. No claims process needed.',
    coverage_details: { details: ['Rainfall deficit', 'Excess rainfall', 'Temperature extremes', 'Automatic payout'] },
    premium_range: { min: 10, max: 35, currency: 'USD' },
    deductible_percent: 0,
    waiting_period_days: 0,
    eligibility: ['AFU member in good standing', 'Farm GPS coordinates registered'],
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
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

/* ─── Product Form Modal ─── */

function ProductFormModal({
  form,
  onChange,
  onSave,
  onClose,
  saving,
  isEdit,
}: {
  form: ProductFormData;
  onChange: (f: ProductFormData) => void;
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
            {isEdit ? 'Edit Insurance Product' : 'Create Insurance Product'}
          </h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
            <input
              value={form.name}
              onChange={(e) => onChange({ ...form, name: e.target.value })}
              placeholder="e.g. Crop Shield Basic"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347]"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
            <select
              value={form.type}
              onChange={(e) => onChange({ ...form, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347]"
            >
              {PRODUCT_TYPES.map((t) => (
                <option key={t} value={t}>{TYPE_LABELS[t] || t}</option>
              ))}
            </select>
          </div>

          {/* Active */}
          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => onChange({ ...form, active: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-[#5DB347] focus:ring-[#5DB347]"
              />
              <span className="text-sm font-medium text-gray-700">Active (visible to members)</span>
            </label>
          </div>

          {/* Premium Min */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Premium Min (per season)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.premium_min}
              onChange={(e) => onChange({ ...form, premium_min: e.target.value })}
              placeholder="e.g. 15"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347]"
            />
          </div>

          {/* Premium Max */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Premium Max (per season)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.premium_max}
              onChange={(e) => onChange({ ...form, premium_max: e.target.value })}
              placeholder="e.g. 45"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347]"
            />
          </div>

          {/* Currency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
            <select
              value={form.premium_currency}
              onChange={(e) => onChange({ ...form, premium_currency: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347]"
            >
              <option value="USD">USD</option>
              <option value="ZAR">ZAR</option>
              <option value="KES">KES</option>
              <option value="NGN">NGN</option>
              <option value="BWP">BWP</option>
              <option value="TZS">TZS</option>
              <option value="GHS">GHS</option>
            </select>
          </div>

          {/* Deductible */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deductible (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={form.deductible_percent}
              onChange={(e) => onChange({ ...form, deductible_percent: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347]"
            />
          </div>

          {/* Waiting Period */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Waiting Period (days)</label>
            <input
              type="number"
              min="0"
              value={form.waiting_period_days}
              onChange={(e) => onChange({ ...form, waiting_period_days: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347]"
            />
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => onChange({ ...form, description: e.target.value })}
              rows={3}
              placeholder="Describe what this insurance product covers..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347] resize-y"
            />
          </div>

          {/* Coverage Details */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Coverage Details (one per line)
            </label>
            <textarea
              value={form.coverage_details_text}
              onChange={(e) => onChange({ ...form, coverage_details_text: e.target.value })}
              rows={4}
              placeholder={"Drought damage\nFlood damage\nPest infestation\nHail damage"}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347] resize-y font-mono"
            />
          </div>

          {/* Eligibility */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Eligibility Requirements (one per line)
            </label>
            <textarea
              value={form.eligibility_text}
              onChange={(e) => onChange({ ...form, eligibility_text: e.target.value })}
              rows={3}
              placeholder={"AFU member in good standing\nFarm size 0.5 - 20 hectares\nCrops registered on platform"}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347] resize-y font-mono"
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
            disabled={saving || !form.name.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-[#5DB347] text-white text-sm font-medium rounded-lg hover:bg-[#4a9a38] disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isEdit ? 'Update Product' : 'Create Product'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Helper: format premium range ─── */

function formatPremium(p: InsuranceProduct['premium_range']): string {
  if (!p) return '-';
  const cur = p.currency || 'USD';
  if (p.min != null && p.max != null) return `${cur} ${p.min} - ${p.max}`;
  if (p.min != null) return `${cur} ${p.min}+`;
  if (p.max != null) return `Up to ${cur} ${p.max}`;
  return '-';
}

/* ─── Main Page ─── */

export default function AdminInsuranceProductsPage() {
  const [products, setProducts] = useState<InsuranceProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal state
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(EMPTY_FORM);
  const [formSaving, setFormSaving] = useState(false);

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<InsuranceProduct | null>(null);
  const [deleting, setDeleting] = useState(false);

  const supabase = createClient();

  /* ─── Fetch ─── */

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('insurance_products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      setToast({ message: 'Failed to load insurance products', type: 'error' });
      // Use fallback data if DB fails or is empty
      setProducts(FALLBACK_PRODUCTS);
    } else if (!data || data.length === 0) {
      setProducts(FALLBACK_PRODUCTS);
    } else {
      setProducts(data as InsuranceProduct[]);
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  /* ─── Filtered data ─── */

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (typeFilter !== 'all' && p.type !== typeFilter) return false;
      if (statusFilter === 'active' && !p.active) return false;
      if (statusFilter === 'inactive' && p.active) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.type.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [products, search, typeFilter, statusFilter]);

  /* ─── Stats ─── */

  const stats = useMemo(() => {
    const total = products.length;
    const active = products.filter((p) => p.active).length;
    const inactive = products.filter((p) => !p.active).length;
    const types = new Set(products.map((p) => p.type)).size;
    return { total, active, inactive, types };
  }, [products]);

  /* ─── Create / Edit ─── */

  const openCreateModal = () => {
    setEditingProductId(null);
    setFormData(EMPTY_FORM);
    setShowFormModal(true);
  };

  const openEditModal = (product: InsuranceProduct) => {
    setEditingProductId(product.id);
    setFormData({
      name: product.name,
      type: product.type,
      description: product.description || '',
      coverage_details_text: product.coverage_details?.details?.join('\n') || '',
      premium_min: String(product.premium_range?.min ?? ''),
      premium_max: String(product.premium_range?.max ?? ''),
      premium_currency: product.premium_range?.currency || 'USD',
      deductible_percent: String(product.deductible_percent ?? '5'),
      waiting_period_days: String(product.waiting_period_days ?? '30'),
      eligibility_text: product.eligibility?.join('\n') || '',
      active: product.active,
    });
    setShowFormModal(true);
  };

  const handleSaveProduct = async () => {
    if (!formData.name.trim()) {
      setToast({ message: 'Product name is required', type: 'error' });
      return;
    }
    setFormSaving(true);

    const coverageLines = formData.coverage_details_text
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    const eligibilityLines = formData.eligibility_text
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    const payload = {
      name: formData.name,
      type: formData.type,
      description: formData.description || null,
      coverage_details: coverageLines.length > 0 ? { details: coverageLines } : null,
      premium_range: {
        min: formData.premium_min ? parseFloat(formData.premium_min) : null,
        max: formData.premium_max ? parseFloat(formData.premium_max) : null,
        currency: formData.premium_currency,
      },
      deductible_percent: formData.deductible_percent
        ? parseFloat(formData.deductible_percent)
        : 5,
      waiting_period_days: formData.waiting_period_days
        ? parseInt(formData.waiting_period_days, 10)
        : 30,
      eligibility: eligibilityLines.length > 0 ? eligibilityLines : null,
      active: formData.active,
    };

    if (editingProductId) {
      const { error } = await supabase
        .from('insurance_products')
        .update(payload)
        .eq('id', editingProductId);
      if (error) {
        setToast({ message: 'Failed to update product', type: 'error' });
      } else {
        setToast({ message: 'Product updated successfully', type: 'success' });
        setShowFormModal(false);
        await fetchProducts();
      }
    } else {
      const { error } = await supabase
        .from('insurance_products')
        .insert(payload);
      if (error) {
        setToast({ message: 'Failed to create product', type: 'error' });
      } else {
        setToast({ message: 'Product created successfully', type: 'success' });
        setShowFormModal(false);
        await fetchProducts();
      }
    }
    setFormSaving(false);
  };

  /* ─── Delete ─── */

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const { error } = await supabase
      .from('insurance_products')
      .delete()
      .eq('id', deleteTarget.id);
    if (error) {
      setToast({ message: 'Failed to delete product', type: 'error' });
    } else {
      setToast({ message: 'Product deleted', type: 'success' });
      setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
    }
    setDeleteTarget(null);
    setDeleting(false);
  };

  /* ─── Toggle active ─── */

  const handleToggleActive = async (id: string, current: boolean) => {
    const { error } = await supabase
      .from('insurance_products')
      .update({ active: !current })
      .eq('id', id);
    if (error) {
      setToast({ message: 'Failed to update status', type: 'error' });
    } else {
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, active: !current } : p))
      );
      setToast({
        message: !current ? 'Product activated' : 'Product deactivated',
        type: 'success',
      });
    }
  };

  /* ─── Summary cards ─── */

  const summaryCards = [
    {
      label: 'Total Products',
      value: stats.total,
      icon: <Shield className="w-5 h-5" />,
      color: '#1B2A4A',
      bg: 'bg-[#1B2A4A]/10',
    },
    {
      label: 'Active',
      value: stats.active,
      icon: <CheckCircle2 className="w-5 h-5" />,
      color: '#5DB347',
      bg: 'bg-[#5DB347]/10',
    },
    {
      label: 'Inactive',
      value: stats.inactive,
      icon: <XCircle className="w-5 h-5" />,
      color: '#EF4444',
      bg: 'bg-red-50',
    },
    {
      label: 'Product Types',
      value: stats.types,
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
          <h1 className="text-2xl font-bold text-[#1B2A4A]">Insurance Products</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage insurance product catalog for AFU members
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#5DB347] text-white text-sm font-medium rounded-lg hover:bg-[#4a9a38] shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Product
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
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by product name, type, or description..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347]"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347]"
          >
            <option value="all">All Types</option>
            {PRODUCT_TYPES.map((t) => (
              <option key={t} value={t}>{TYPE_LABELS[t] || t}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347]"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <div className="flex items-center text-xs text-gray-500 whitespace-nowrap">
            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#5DB347] mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading insurance products...</p>
        </div>
      )}

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-[#1B2A4A]">
            No products found
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Try adjusting your filters or create a new insurance product
          </p>
          <button
            onClick={openCreateModal}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#5DB347] text-white text-sm font-medium rounded-lg hover:bg-[#4a9a38]"
          >
            <Plus className="w-4 h-4" />
            Add Product
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
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Product</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Type</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Premium Range</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Deductible</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Waiting</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-[#1B2A4A]">{product.name}</p>
                        {product.description && (
                          <p className="text-xs text-gray-400 mt-0.5 line-clamp-1 max-w-xs">
                            {product.description}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          TYPE_BADGES[product.type] || 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {TYPE_LABELS[product.type] || product.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3 text-gray-400" />
                        {formatPremium(product.premium_range)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-gray-600">
                      <span className="flex items-center justify-center gap-1">
                        <Percent className="w-3 h-3 text-gray-400" />
                        {product.deductible_percent ?? 0}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-gray-600">
                      <span className="flex items-center justify-center gap-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        {product.waiting_period_days ?? 0}d
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleActive(product.id, product.active)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                          product.active
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        {product.active ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                        {product.active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
                        {/* Edit */}
                        <button
                          onClick={() => openEditModal(product)}
                          className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => setDeleteTarget(product)}
                          className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
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

      {/* Modals */}
      {showFormModal && (
        <ProductFormModal
          form={formData}
          onChange={setFormData}
          onSave={handleSaveProduct}
          onClose={() => setShowFormModal(false)}
          saving={formSaving}
          isEdit={!!editingProductId}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete Product"
          message={`Are you sure you want to delete "${deleteTarget.name}"? This action cannot be undone. Any active policies using this product will be affected.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}
