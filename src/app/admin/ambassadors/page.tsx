'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Plus,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  Trash2,
  Pencil,
  Star,
  StarOff,
  Eye,
  EyeOff,
  Award,
  Megaphone,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

/* ─── Types ─── */

interface Ambassador {
  id: string;
  full_name: string;
  photo_url: string | null;
  bio: string | null;
  pull_quote: string | null;
  sector: string;
  country: string;
  region: string | null;
  farm_name: string | null;
  farm_size_ha: number | null;
  years_experience: number | null;
  achievements: string[] | null;
  crops_or_products: string[] | null;
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

interface FormData {
  full_name: string;
  photo_url: string;
  bio: string;
  pull_quote: string;
  sector: string;
  country: string;
  region: string;
  farm_name: string;
  farm_size_ha: string;
  years_experience: string;
  achievements: string[];
  crops_or_products: string[];
  is_featured: boolean;
  sort_order: string;
}

const emptyForm: FormData = {
  full_name: '',
  photo_url: '',
  bio: '',
  pull_quote: '',
  sector: '',
  country: '',
  region: '',
  farm_name: '',
  farm_size_ha: '',
  years_experience: '',
  achievements: [],
  crops_or_products: [],
  is_featured: false,
  sort_order: '0',
};

/* ─── Constants ─── */

const SECTORS = [
  'Grains',
  'Cash Crops',
  'Livestock',
  'Horticulture',
  'Poultry',
  'Machinery',
  'Processing',
  'Aquaculture',
];

const COUNTRIES = [
  'Botswana',
  'Ghana',
  'Kenya',
  'Mozambique',
  'Nigeria',
  'Sierra Leone',
  'South Africa',
  'Tanzania',
  'Uganda',
  'Zambia',
  'Zimbabwe',
];

const SECTOR_COLORS: Record<string, string> = {
  Grains: 'bg-amber-100 text-amber-700',
  'Cash Crops': 'bg-green-100 text-green-700',
  Livestock: 'bg-orange-100 text-orange-700',
  Horticulture: 'bg-emerald-100 text-emerald-700',
  Poultry: 'bg-yellow-100 text-yellow-700',
  Machinery: 'bg-blue-100 text-blue-700',
  Processing: 'bg-purple-100 text-purple-700',
  Aquaculture: 'bg-cyan-100 text-cyan-700',
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

/* ─── Tag Input ─── */

function TagInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  const [input, setInput] = useState('');

  const addTag = () => {
    const trimmed = input.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setInput('');
  };

  const removeTag = (tag: string) => {
    onChange(value.filter((t) => t !== tag));
  };

  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1">
        {label}
      </label>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[#1B2A4A]/10 text-[#1B2A4A]"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="hover:text-red-600"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addTag();
            }
          }}
          placeholder={placeholder || 'Type and press Enter...'}
          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-200 focus:border-green-400 outline-none"
        />
        <button
          type="button"
          onClick={addTag}
          className="px-3 py-2 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200"
        >
          Add
        </button>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */

export default function AdminAmbassadorsPage() {
  const [ambassadors, setAmbassadors] = useState<Ambassador[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const supabase = createClient();

  const fetchAmbassadors = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('ambassadors')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      setToast({ message: 'Failed to load ambassadors', type: 'error' });
      setAmbassadors([]);
    } else {
      setAmbassadors(
        (data || []).map((a: Record<string, unknown>) => ({
          ...a,
          is_featured: (a.is_featured as boolean) ?? false,
          is_active: (a.is_active as boolean) ?? true,
          sort_order: typeof a.sort_order === 'number' ? a.sort_order : 0,
          achievements: Array.isArray(a.achievements) ? a.achievements : [],
          crops_or_products: Array.isArray(a.crops_or_products)
            ? a.crops_or_products
            : [],
        })) as Ambassador[]
      );
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchAmbassadors();
  }, [fetchAmbassadors]);

  /* ─── Stats ─── */

  const stats = useMemo(() => {
    const total = ambassadors.length;
    const featured = ambassadors.filter((a) => a.is_featured).length;
    const sectorBreakdown: Record<string, number> = {};
    ambassadors.forEach((a) => {
      sectorBreakdown[a.sector] = (sectorBreakdown[a.sector] || 0) + 1;
    });
    return { total, featured, sectorBreakdown };
  }, [ambassadors]);

  /* ─── Form handlers ─── */

  const openAdd = () => {
    setEditingId(null);
    setForm({
      ...emptyForm,
      sort_order: String(ambassadors.length + 1),
    });
    setModalOpen(true);
  };

  const openEdit = (a: Ambassador) => {
    setEditingId(a.id);
    setForm({
      full_name: a.full_name,
      photo_url: a.photo_url || '',
      bio: a.bio || '',
      pull_quote: a.pull_quote || '',
      sector: a.sector,
      country: a.country,
      region: a.region || '',
      farm_name: a.farm_name || '',
      farm_size_ha: a.farm_size_ha != null ? String(a.farm_size_ha) : '',
      years_experience:
        a.years_experience != null ? String(a.years_experience) : '',
      achievements: a.achievements || [],
      crops_or_products: a.crops_or_products || [],
      is_featured: a.is_featured,
      sort_order: String(a.sort_order),
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.full_name.trim()) {
      setToast({ message: 'Name is required', type: 'error' });
      return;
    }
    if (!form.sector) {
      setToast({ message: 'Sector is required', type: 'error' });
      return;
    }
    if (!form.country) {
      setToast({ message: 'Country is required', type: 'error' });
      return;
    }

    setSaving(true);
    const payload = {
      full_name: form.full_name.trim(),
      photo_url: form.photo_url || null,
      bio: form.bio || null,
      pull_quote: form.pull_quote || null,
      sector: form.sector,
      country: form.country,
      region: form.region || null,
      farm_name: form.farm_name || null,
      farm_size_ha: form.farm_size_ha
        ? parseFloat(form.farm_size_ha)
        : null,
      years_experience: form.years_experience
        ? parseInt(form.years_experience)
        : null,
      achievements:
        form.achievements.length > 0 ? form.achievements : null,
      crops_or_products:
        form.crops_or_products.length > 0 ? form.crops_or_products : null,
      is_featured: form.is_featured,
      sort_order: parseInt(form.sort_order) || 0,
    };

    let error;
    if (editingId) {
      ({ error } = await supabase
        .from('ambassadors')
        .update(payload)
        .eq('id', editingId));
    } else {
      ({ error } = await supabase.from('ambassadors').insert(payload));
    }

    if (error) {
      setToast({
        message: `Failed to ${editingId ? 'update' : 'create'} ambassador`,
        type: 'error',
      });
    } else {
      setToast({
        message: `Ambassador ${editingId ? 'updated' : 'created'} successfully`,
        type: 'success',
      });
      setModalOpen(false);
      fetchAmbassadors();
    }
    setSaving(false);
  };

  const toggleField = async (
    id: string,
    field: 'is_featured' | 'is_active',
    currentValue: boolean
  ) => {
    const { error } = await supabase
      .from('ambassadors')
      .update({ [field]: !currentValue })
      .eq('id', id);
    if (error) {
      setToast({ message: 'Failed to update', type: 'error' });
    } else {
      setAmbassadors((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, [field]: !currentValue } : a
        )
      );
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('ambassadors')
      .delete()
      .eq('id', id);
    if (error) {
      setToast({ message: 'Failed to delete ambassador', type: 'error' });
    } else {
      setToast({ message: 'Ambassador deleted', type: 'success' });
      setAmbassadors((prev) => prev.filter((a) => a.id !== id));
    }
    setDeleteConfirm(null);
  };

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">
            Ambassador Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {stats.total} ambassador{stats.total !== 1 ? 's' : ''}{' '}
            {stats.featured > 0 && (
              <span className="text-yellow-600">
                ({stats.featured} featured)
              </span>
            )}
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-opacity"
          style={{ background: '#5DB347' }}
        >
          <Plus className="w-4 h-4" />
          Add New Ambassador
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-xs text-gray-500 uppercase tracking-wide">
            Total
          </p>
          <p className="text-2xl font-bold mt-1 text-[#1B2A4A]">
            {stats.total}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-xs text-gray-500 uppercase tracking-wide">
            Featured
          </p>
          <p className="text-2xl font-bold mt-1 text-yellow-600">
            {stats.featured}
          </p>
        </div>
        {Object.entries(stats.sectorBreakdown)
          .slice(0, 2)
          .map(([sector, count]) => (
            <div
              key={sector}
              className="bg-white rounded-xl p-4 border border-gray-100"
            >
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                {sector}
              </p>
              <p className="text-2xl font-bold mt-1 text-[#5DB347]">
                {count}
              </p>
            </div>
          ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#5DB347] mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading ambassadors...</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && ambassadors.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <Megaphone className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-[#1B2A4A]">
            No ambassadors yet
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Add your first ambassador profile
          </p>
          <button
            onClick={openAdd}
            className="mt-4 px-4 py-2 rounded-lg text-sm font-medium text-white"
            style={{ background: '#5DB347' }}
          >
            <Plus className="w-4 h-4 inline mr-1" />
            Add Ambassador
          </button>
        </div>
      )}

      {/* Table */}
      {!loading && ambassadors.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                    Ambassador
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                    Sector
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                    Country
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                    Farm
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                    Featured
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                    Active
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {ambassadors.map((amb) => (
                  <tr
                    key={amb.id}
                    className={`hover:bg-gray-50/50 transition-colors ${
                      !amb.is_active ? 'opacity-50' : ''
                    }`}
                  >
                    {/* Ambassador */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center text-green-700 font-bold text-xs flex-shrink-0 overflow-hidden">
                          {amb.photo_url ? (
                            <img
                              src={amb.photo_url}
                              alt={amb.full_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            amb.full_name
                              .split(' ')
                              .map((w) => w[0])
                              .join('')
                              .slice(0, 2)
                              .toUpperCase()
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-[#1B2A4A]">
                            {amb.full_name}
                          </p>
                          {amb.years_experience && (
                            <p className="text-xs text-gray-400">
                              {amb.years_experience} yrs exp
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Sector */}
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          SECTOR_COLORS[amb.sector] ||
                          'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {amb.sector}
                      </span>
                    </td>

                    {/* Country */}
                    <td className="py-3 px-4 text-gray-600">
                      {amb.country}
                    </td>

                    {/* Farm */}
                    <td className="py-3 px-4">
                      <p className="text-gray-600 text-sm">
                        {amb.farm_name || '-'}
                      </p>
                      {amb.farm_size_ha && (
                        <p className="text-xs text-gray-400">
                          {amb.farm_size_ha} ha
                        </p>
                      )}
                    </td>

                    {/* Featured */}
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() =>
                          toggleField(
                            amb.id,
                            'is_featured',
                            amb.is_featured
                          )
                        }
                        className={`p-1.5 rounded-lg transition-colors mx-auto ${
                          amb.is_featured
                            ? 'bg-yellow-100 text-yellow-600'
                            : 'bg-gray-50 text-gray-300 hover:text-yellow-600'
                        }`}
                        title={
                          amb.is_featured
                            ? 'Remove featured'
                            : 'Mark featured'
                        }
                      >
                        {amb.is_featured ? (
                          <Star className="w-4 h-4" />
                        ) : (
                          <StarOff className="w-4 h-4" />
                        )}
                      </button>
                    </td>

                    {/* Active */}
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() =>
                          toggleField(amb.id, 'is_active', amb.is_active)
                        }
                        className={`p-1.5 rounded-lg transition-colors mx-auto ${
                          amb.is_active
                            ? 'bg-green-100 text-green-600'
                            : 'bg-gray-50 text-gray-300 hover:text-green-600'
                        }`}
                        title={
                          amb.is_active ? 'Deactivate' : 'Activate'
                        }
                      >
                        {amb.is_active ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <EyeOff className="w-4 h-4" />
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(amb)}
                          className="p-1.5 rounded-lg bg-gray-50 text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(amb.id)}
                          className="p-1.5 rounded-lg bg-gray-50 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
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

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={() => setDeleteConfirm(null)}
        >
          <div
            className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-[#1B2A4A] mb-2">
              Delete Ambassador?
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-white rounded-xl max-w-2xl w-full shadow-xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-[#1B2A4A]">
                {editingId ? 'Edit Ambassador' : 'Add Ambassador'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Full Name *
                </label>
                <input
                  value={form.full_name}
                  onChange={(e) =>
                    setForm({ ...form, full_name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-200 focus:border-green-400 outline-none"
                  placeholder="Grace Moyo"
                />
              </div>

              {/* Photo URL */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Photo URL
                </label>
                <input
                  value={form.photo_url}
                  onChange={(e) =>
                    setForm({ ...form, photo_url: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-200 focus:border-green-400 outline-none"
                  placeholder="https://..."
                />
              </div>

              {/* Sector + Country */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Sector *
                  </label>
                  <select
                    value={form.sector}
                    onChange={(e) =>
                      setForm({ ...form, sector: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-200 focus:border-green-400 outline-none"
                  >
                    <option value="">Select sector...</option>
                    {SECTORS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Country *
                  </label>
                  <select
                    value={form.country}
                    onChange={(e) =>
                      setForm({ ...form, country: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-200 focus:border-green-400 outline-none"
                  >
                    <option value="">Select country...</option>
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Region + Farm Name */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Region
                  </label>
                  <input
                    value={form.region}
                    onChange={(e) =>
                      setForm({ ...form, region: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-200 focus:border-green-400 outline-none"
                    placeholder="e.g. Mashonaland West"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Farm Name
                  </label>
                  <input
                    value={form.farm_name}
                    onChange={(e) =>
                      setForm({ ...form, farm_name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-200 focus:border-green-400 outline-none"
                    placeholder="Moyo Family Farm"
                  />
                </div>
              </div>

              {/* Farm Size + Years Experience */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Farm Size (ha)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={form.farm_size_ha}
                    onChange={(e) =>
                      setForm({ ...form, farm_size_ha: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-200 focus:border-green-400 outline-none"
                    placeholder="4.5"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Years Experience
                  </label>
                  <input
                    type="number"
                    value={form.years_experience}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        years_experience: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-200 focus:border-green-400 outline-none"
                    placeholder="10"
                  />
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Bio
                </label>
                <textarea
                  value={form.bio}
                  onChange={(e) =>
                    setForm({ ...form, bio: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-200 focus:border-green-400 outline-none resize-none"
                  placeholder="Tell the ambassador's story..."
                />
              </div>

              {/* Quote */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Pull Quote
                </label>
                <textarea
                  value={form.pull_quote}
                  onChange={(e) =>
                    setForm({ ...form, pull_quote: e.target.value })
                  }
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-200 focus:border-green-400 outline-none resize-none"
                  placeholder="A short testimonial quote..."
                />
              </div>

              {/* Achievements tags */}
              <TagInput
                label="Achievements"
                value={form.achievements}
                onChange={(v) => setForm({ ...form, achievements: v })}
                placeholder="e.g. 18t harvest record"
              />

              {/* Crops/Products tags */}
              <TagInput
                label="Crops / Products"
                value={form.crops_or_products}
                onChange={(v) =>
                  setForm({ ...form, crops_or_products: v })
                }
                placeholder="e.g. Maize, Groundnuts"
              />

              {/* Sort Order + Featured */}
              <div className="grid grid-cols-2 gap-3 items-end">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    value={form.sort_order}
                    onChange={(e) =>
                      setForm({ ...form, sort_order: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-200 focus:border-green-400 outline-none"
                  />
                </div>
                <label className="flex items-center gap-2 cursor-pointer pb-2">
                  <input
                    type="checkbox"
                    checked={form.is_featured}
                    onChange={(e) =>
                      setForm({ ...form, is_featured: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-gray-300 text-yellow-500 focus:ring-yellow-200"
                  />
                  <span className="text-sm text-gray-600">Featured</span>
                </label>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 p-5 border-t border-gray-100">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                style={{ background: '#5DB347' }}
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {editingId ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
