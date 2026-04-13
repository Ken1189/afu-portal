'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Camera, Plus, Pencil, Trash2, Eye, EyeOff, Loader2, X, CheckCircle2, AlertCircle,
} from 'lucide-react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import ImageUploader from '@/components/ui/ImageUploader';
import { ALL_AFRICAN_COUNTRIES } from '@/lib/countries';

/* ── Types ──────────────────────────────────────────────────────── */

interface GalleryItem {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  category: string;
  country: string | null;
  photographer: string | null;
  date_taken: string | null;
  tags: string[];
  display_order: number;
  visible: boolean;
  created_at: string;
}

interface FormData {
  title: string;
  description: string;
  image_url: string;
  category: string;
  country: string;
  photographer: string;
  date_taken: string;
  tags: string;
  display_order: number;
  visible: boolean;
}

const CATEGORIES = ['general', 'farming', 'events', 'team', 'partners', 'facilities'];

const CATEGORY_COLORS: Record<string, string> = {
  general: 'bg-gray-100 text-gray-700',
  farming: 'bg-green-100 text-green-700',
  events: 'bg-purple-100 text-purple-700',
  team: 'bg-blue-100 text-blue-700',
  partners: 'bg-amber-100 text-amber-700',
  facilities: 'bg-cyan-100 text-cyan-700',
};

const EMPTY_FORM: FormData = {
  title: '',
  description: '',
  image_url: '',
  category: 'general',
  country: '',
  photographer: '',
  date_taken: '',
  tags: '',
  display_order: 0,
  visible: true,
};

/* ── Toast ──────────────────────────────────────────────────────── */

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium ${type === 'success' ? 'bg-[#5DB347]' : 'bg-red-500'}`}>
      {type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
      {message}
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────────────── */

export default function AdminGalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState<GalleryItem | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const supabase = createClient();

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('gallery_items')
      .select('*')
      .order('display_order', { ascending: true });

    if (!error && data) {
      setItems(data as GalleryItem[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  /* ── CRUD ─────────────────────────────────────────────────── */

  function openCreate() {
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setShowModal(true);
  }

  function openEdit(item: GalleryItem) {
    setEditingId(item.id);
    setFormData({
      title: item.title,
      description: item.description || '',
      image_url: item.image_url,
      category: item.category,
      country: item.country || '',
      photographer: item.photographer || '',
      date_taken: item.date_taken || '',
      tags: (item.tags || []).join(', '),
      display_order: item.display_order,
      visible: item.visible,
    });
    setShowModal(true);
  }

  async function handleSave() {
    if (!formData.title.trim()) {
      setToast({ message: 'Title is required', type: 'error' });
      return;
    }
    if (!formData.image_url.trim()) {
      setToast({ message: 'Image URL is required', type: 'error' });
      return;
    }
    setSaving(true);

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim() || null,
      image_url: formData.image_url.trim(),
      category: formData.category,
      country: formData.country || null,
      photographer: formData.photographer.trim() || null,
      date_taken: formData.date_taken || null,
      tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
      display_order: formData.display_order,
      visible: formData.visible,
      updated_at: new Date().toISOString(),
    };

    let error;
    if (editingId) {
      ({ error } = await supabase.from('gallery_items').update(payload).eq('id', editingId));
    } else {
      ({ error } = await supabase.from('gallery_items').insert({ ...payload, display_order: payload.display_order || items.length }));
    }

    if (error) {
      setToast({ message: `Failed to save: ${error.message}`, type: 'error' });
    } else {
      setToast({ message: editingId ? 'Image updated' : 'Image added', type: 'success' });
      setShowModal(false);
      await fetchItems();
    }
    setSaving(false);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    const { error } = await supabase.from('gallery_items').delete().eq('id', deleteTarget.id);
    if (error) {
      setToast({ message: 'Failed to delete', type: 'error' });
    } else {
      setToast({ message: 'Image deleted', type: 'success' });
      await fetchItems();
    }
    setDeleteTarget(null);
  }

  async function toggleVisibility(item: GalleryItem) {
    await supabase.from('gallery_items').update({ visible: !item.visible }).eq('id', item.id);
    setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, visible: !i.visible } : i));
  }

  /* ── Stats ────────────────────────────────────────────────── */

  const total = items.length;
  const visibleCount = items.filter((i) => i.visible).length;
  const hiddenCount = total - visibleCount;
  const categoryCount = new Set(items.map((i) => i.category)).size;

  /* ── Render ───────────────────────────────────────────────── */

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#5DB347]/10 flex items-center justify-center">
            <Camera className="w-5 h-5 text-[#5DB347]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#1B2A4A]">Gallery Management</h1>
            <p className="text-sm text-gray-500">Manage gallery images displayed on the public site</p>
          </div>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium bg-[#5DB347] hover:bg-[#4a9a39] transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Image
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Images', value: total },
          { label: 'Visible', value: visibleCount },
          { label: 'Hidden', value: hiddenCount },
          { label: 'Categories', value: categoryCount },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-xs text-gray-400 uppercase tracking-wider">{stat.label}</p>
            <p className="text-2xl font-bold text-[#1B2A4A] mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-[#5DB347]" />
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Camera className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-[#1B2A4A] mb-2">No gallery images yet</h3>
          <p className="text-sm text-gray-500 mb-6">Add your first image to the gallery.</p>
          <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-medium bg-[#5DB347]">
            <Plus className="w-4 h-4" /> Add Image
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Image</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Title</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Category</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Country</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Visible</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Order</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                        <Image src={item.image_url} alt={item.title} fill className="object-cover" sizes="48px" />
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-[#1B2A4A]">{item.title}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${CATEGORY_COLORS[item.category] || CATEGORY_COLORS.general}`}>
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{item.country || '—'}</td>
                    <td className="py-3 px-4">
                      <button onClick={() => toggleVisibility(item)} className="text-gray-400 hover:text-[#5DB347]">
                        {item.visible ? <Eye className="w-4 h-4 text-[#5DB347]" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-gray-500">{item.display_order}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#5DB347]">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteTarget(item)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500">
                          <Trash2 className="w-4 h-4" />
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

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-[#1B2A4A]">{editingId ? 'Edit Image' : 'Add Image'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-gray-100"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none"
                  placeholder="Image title"
                />
              </div>
              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none"
                  placeholder="Brief description"
                />
              </div>
              {/* Image URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image *</label>
                <ImageUploader
                  value={formData.image_url}
                  onChange={(url) => setFormData({ ...formData, image_url: url })}
                  folder="gallery"
                />
              </div>
              {/* Category + Country */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <select
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none"
                  >
                    <option value="">-- Select --</option>
                    {ALL_AFRICAN_COUNTRIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              {/* Photographer + Date Taken */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Photographer</label>
                  <input
                    value={formData.photographer}
                    onChange={(e) => setFormData({ ...formData, photographer: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none"
                    placeholder="Photographer name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Taken</label>
                  <input
                    type="date"
                    value={formData.date_taken}
                    onChange={(e) => setFormData({ ...formData, date_taken: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none"
                  />
                </div>
              </div>
              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
                <input
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none"
                  placeholder="e.g. harvest, maize, Kenya"
                />
              </div>
              {/* Display Order + Visible */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none"
                  />
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.visible}
                      onChange={(e) => setFormData({ ...formData, visible: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-[#5DB347] focus:ring-[#5DB347]"
                    />
                    <span className="text-sm text-gray-700">Visible on public site</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-gray-100">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl text-sm text-gray-600 hover:bg-gray-100">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-medium bg-[#5DB347] hover:bg-[#4a9a39] disabled:opacity-50"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingId ? 'Update' : 'Add Image'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setDeleteTarget(null)}>
          <div className="bg-white rounded-2xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-[#1B2A4A] mb-2">Delete Image</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete &quot;{deleteTarget.title}&quot;? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 rounded-xl text-sm text-gray-600 hover:bg-gray-100">Cancel</button>
              <button onClick={handleDelete} className="px-4 py-2 rounded-xl text-sm text-white bg-red-500 hover:bg-red-600">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
