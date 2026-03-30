'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Megaphone,
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  Clock,
  Eye,
  MapPin,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────

interface AdPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_days: number;
  impressions_limit: number;
  placement: string;
  is_active: boolean;
  created_at: string;
}

interface AdPackageForm {
  name: string;
  description: string;
  price: number;
  duration_days: number;
  impressions_limit: number;
  placement: string;
  is_active: boolean;
}

const PLACEMENT_OPTIONS = ['homepage_banner', 'sidebar', 'search_results', 'category_page', 'featured_product', 'sponsored_content'];

const emptyForm: AdPackageForm = {
  name: '',
  description: '',
  price: 0,
  duration_days: 30,
  impressions_limit: 10000,
  placement: 'homepage_banner',
  is_active: true,
};

// ── Toast ────────────────────────────────────────────────────────────────────

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
      {type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
      {message}
    </div>
  );
}

// ── Component ────────────────────────────────────────────────────────────────

export default function AdPackagesConfig() {
  const [packages, setPackages] = useState<AdPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AdPackageForm>(emptyForm);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const supabase = createClient();

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('ad_packages')
      .select('*')
      .order('price', { ascending: true });

    if (error) {
      setToast({ message: 'Failed to load ad packages', type: 'error' });
    } else {
      setPackages(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (pkg: AdPackage) => {
    setEditingId(pkg.id);
    setForm({
      name: pkg.name,
      description: pkg.description || '',
      price: pkg.price,
      duration_days: pkg.duration_days,
      impressions_limit: pkg.impressions_limit,
      placement: pkg.placement || 'homepage_banner',
      is_active: pkg.is_active,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);

    if (editingId) {
      const { error } = await supabase
        .from('ad_packages')
        .update({
          name: form.name,
          description: form.description,
          price: form.price,
          duration_days: form.duration_days,
          impressions_limit: form.impressions_limit,
          placement: form.placement,
          is_active: form.is_active,
        })
        .eq('id', editingId);

      if (error) {
        setToast({ message: 'Failed to update package', type: 'error' });
      } else {
        setToast({ message: 'Ad package updated successfully', type: 'success' });
      }
    } else {
      const { error } = await supabase
        .from('ad_packages')
        .insert({
          name: form.name,
          description: form.description,
          price: form.price,
          duration_days: form.duration_days,
          impressions_limit: form.impressions_limit,
          placement: form.placement,
          is_active: form.is_active,
        });

      if (error) {
        setToast({ message: 'Failed to create package', type: 'error' });
      } else {
        setToast({ message: 'Ad package created successfully', type: 'success' });
      }
    }

    setSaving(false);
    setModalOpen(false);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('ad_packages').delete().eq('id', id);
    if (error) {
      setToast({ message: 'Failed to delete package', type: 'error' });
    } else {
      setToast({ message: 'Ad package deleted', type: 'success' });
      setPackages((prev) => prev.filter((p) => p.id !== id));
    }
    setDeleteConfirm(null);
  };

  const toggleActive = async (pkg: AdPackage) => {
    const { error } = await supabase
      .from('ad_packages')
      .update({ is_active: !pkg.is_active })
      .eq('id', pkg.id);

    if (error) {
      setToast({ message: 'Failed to update status', type: 'error' });
    } else {
      setPackages((prev) =>
        prev.map((p) => (p.id === pkg.id ? { ...p, is_active: !p.is_active } : p))
      );
    }
  };

  const formatPlacement = (p: string) => p.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#5DB347]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Advertising Packages</h1>
          <p className="text-gray-500 mt-1">Manage ad packages available to suppliers</p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#5DB347] text-white rounded-lg text-sm font-medium hover:bg-[#449933] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Package
        </button>
      </div>

      {/* Packages Grid */}
      {packages.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-12 text-center">
          <Megaphone className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No ad packages configured yet</p>
          <button onClick={openAdd} className="mt-3 text-sm text-[#5DB347] hover:underline">Create your first package</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {packages.map((pkg) => (
            <div key={pkg.id} className={`bg-white border rounded-xl shadow-sm overflow-hidden ${!pkg.is_active ? 'opacity-60' : ''} border-gray-100`}>
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-[#1B2A4A]/5 rounded-lg">
                      <Megaphone className="w-4 h-4 text-[#1B2A4A]" />
                    </div>
                    <h3 className="font-semibold text-gray-900">{pkg.name}</h3>
                  </div>
                  <button onClick={() => toggleActive(pkg)}>
                    {pkg.is_active
                      ? <ToggleRight className="w-6 h-6 text-[#5DB347]" />
                      : <ToggleLeft className="w-6 h-6 text-gray-300" />}
                  </button>
                </div>

                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{pkg.description || 'No description'}</p>

                <div className="text-2xl font-bold text-[#1B2A4A] mb-4">${pkg.price.toLocaleString()}</div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>{pkg.duration_days} days</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-gray-400" />
                    <span>{pkg.impressions_limit.toLocaleString()} impressions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span>{formatPlacement(pkg.placement)}</span>
                  </div>
                </div>
              </div>

              <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${pkg.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {pkg.is_active ? 'Active' : 'Inactive'}
                </span>
                <div className="flex items-center gap-1">
                  <button onClick={() => openEdit(pkg)} className="p-1.5 text-gray-400 hover:text-[#1B2A4A] hover:bg-gray-100 rounded-lg transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                  {deleteConfirm === pkg.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDelete(pkg.id)}
                        className="px-2 py-1 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setDeleteConfirm(pkg.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingId ? 'Edit Package' : 'Add Package'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Package Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#5DB347] focus:border-transparent outline-none"
                  placeholder="e.g. Premium Banner"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#5DB347] focus:border-transparent outline-none"
                  rows={2}
                  placeholder="Describe what this package includes"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#5DB347] focus:border-transparent outline-none"
                    min={0}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (days)</label>
                  <input
                    type="number"
                    value={form.duration_days}
                    onChange={(e) => setForm({ ...form, duration_days: parseInt(e.target.value) || 0 })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#5DB347] focus:border-transparent outline-none"
                    min={1}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Impressions Limit</label>
                  <input
                    type="number"
                    value={form.impressions_limit}
                    onChange={(e) => setForm({ ...form, impressions_limit: parseInt(e.target.value) || 0 })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#5DB347] focus:border-transparent outline-none"
                    min={0}
                    step={1000}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Placement</label>
                  <select
                    value={form.placement}
                    onChange={(e) => setForm({ ...form, placement: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#5DB347] focus:border-transparent outline-none"
                  >
                    {PLACEMENT_OPTIONS.map((p) => (
                      <option key={p} value={p}>{formatPlacement(p)}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  className="rounded border-gray-300 text-[#5DB347] focus:ring-[#5DB347]"
                />
                <label className="text-sm text-gray-700">Active</label>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 rounded-lg border border-gray-200 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.name.trim()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#5DB347] text-white rounded-lg text-sm font-medium hover:bg-[#449933] disabled:opacity-50 transition-colors"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {editingId ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
