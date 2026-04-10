'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  Trash2,
  Pencil,
  Download,
  Upload,
  FileText,
  Image,
  Video,
  FolderOpen,
  Search,
  ExternalLink,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

// ── Types ────────────────────────────────────────────────────────────────────

interface MaterialAsset {
  id: string;
  name: string;
  type: string; // 'image' | 'pdf' | 'video'
  format: string; // 'PNG' | 'PDF' | 'MP4' etc
  size: string;
  category: string;
  url?: string;
}

// ── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  'Social Media',
  'Print',
  'Educational',
  'Messaging',
  'Email',
  'Video',
  'Investor Pack',
  'Ambassador Kit',
  'Brand Assets',
  'Other',
];

const ASSET_TYPES = [
  { value: 'image', label: 'Image' },
  { value: 'pdf', label: 'PDF' },
  { value: 'video', label: 'Video' },
];

const FORMAT_OPTIONS: Record<string, string[]> = {
  image: ['PNG', 'JPG', 'SVG', 'WEBP', 'GIF'],
  pdf: ['PDF'],
  video: ['MP4', 'MOV', 'WEBM'],
};

const EMPTY_FORM: Omit<MaterialAsset, 'id'> = {
  name: '',
  type: 'image',
  format: 'PNG',
  size: '',
  category: 'Social Media',
  url: '',
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function getTypeIcon(type: string) {
  switch (type) {
    case 'image':
      return Image;
    case 'pdf':
      return FileText;
    case 'video':
      return Video;
    default:
      return FolderOpen;
  }
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// ── Component ────────────────────────────────────────────────────────────────

export default function AdminAmbassadorMaterialsPage() {
  const [materials, setMaterials] = useState<MaterialAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');

  // Modal / form state
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [uploading, setUploading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // ── Toast helper ───────────────────────────────────────────────────────────
  const showToast = useCallback((type: 'success' | 'error', text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // ── Load materials ─────────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from('site_config')
          .select('value')
          .eq('key', 'ambassador_materials')
          .single();

        if (data?.value) {
          const config = data.value as { assets?: MaterialAsset[] };
          if (config.assets && Array.isArray(config.assets)) {
            setMaterials(config.assets);
          }
        }
      } catch {
        // No existing data — start empty
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // ── Save materials to site_config ──────────────────────────────────────────
  const saveMaterials = useCallback(
    async (updated: MaterialAsset[]) => {
      setSaving(true);
      try {
        const supabase = createClient();

        // First try to fetch existing row to preserve email/social templates
        const { data: existing } = await supabase
          .from('site_config')
          .select('value')
          .eq('key', 'ambassador_materials')
          .single();

        const existingValue = (existing?.value as Record<string, unknown>) || {};

        const { error } = await supabase.from('site_config').upsert(
          {
            key: 'ambassador_materials',
            value: { ...existingValue, assets: updated },
          },
          { onConflict: 'key' }
        );

        if (error) throw error;
        setMaterials(updated);
        showToast('success', 'Materials saved successfully');
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to save';
        showToast('error', message);
      } finally {
        setSaving(false);
      }
    },
    [showToast]
  );

  // ── File upload ────────────────────────────────────────────────────────────
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      const safeName = file.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[^a-zA-Z0-9-_]/g, '-')
        .toLowerCase();
      const filePath = `ambassador-materials/${safeName}-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('media').getPublicUrl(filePath);

      setForm((prev) => ({
        ...prev,
        url: urlData.publicUrl,
        size: formatFileSize(file.size),
        format: ext.toUpperCase(),
        name: prev.name || file.name.replace(/\.[^/.]+$/, ''),
      }));

      showToast('success', 'File uploaded');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      showToast('error', message);
    } finally {
      setUploading(false);
    }
  };

  // ── Open modal for create / edit ───────────────────────────────────────────
  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (asset: MaterialAsset) => {
    setEditingId(asset.id);
    setForm({
      name: asset.name,
      type: asset.type,
      format: asset.format,
      size: asset.size,
      category: asset.category,
      url: asset.url || '',
    });
    setShowModal(true);
  };

  // ── Submit form ────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!form.name.trim()) {
      showToast('error', 'Name is required');
      return;
    }

    let updated: MaterialAsset[];
    if (editingId) {
      updated = materials.map((m) =>
        m.id === editingId ? { ...m, ...form } : m
      );
    } else {
      const newAsset: MaterialAsset = {
        id: generateId(),
        ...form,
      };
      updated = [...materials, newAsset];
    }

    await saveMaterials(updated);
    setShowModal(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    const updated = materials.filter((m) => m.id !== id);
    await saveMaterials(updated);
    setDeleteConfirm(null);
  };

  // ── Filtering ──────────────────────────────────────────────────────────────
  const filtered = materials.filter((m) => {
    const matchesSearch =
      !searchQuery ||
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.format.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'All' || m.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium max-w-sm flex items-center gap-2 ${
              toast.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
            )}
            {toast.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">Ambassador Materials</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage downloadable assets for the ambassador portal.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#5DB347] hover:bg-[#4ea03c] text-white rounded-xl text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Material
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search materials..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] bg-white"
        >
          <option value="All">All Categories</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Materials', value: materials.length, color: 'bg-[#1B2A4A]' },
          {
            label: 'Images',
            value: materials.filter((m) => m.type === 'image').length,
            color: 'bg-blue-500',
          },
          {
            label: 'PDFs',
            value: materials.filter((m) => m.type === 'pdf').length,
            color: 'bg-amber-500',
          },
          {
            label: 'Videos',
            value: materials.filter((m) => m.type === 'video').length,
            color: 'bg-purple-500',
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
          >
            <p className="text-xs text-gray-500">{stat.label}</p>
            <p className="text-2xl font-bold text-[#1B2A4A] mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Materials Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
      >
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-[#5DB347]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <FolderOpen className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400">
              {materials.length === 0
                ? 'No materials yet. Click "Add Material" to get started.'
                : 'No materials match your filters.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Name</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Type</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Format</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Size</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Category</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">URL</th>
                  <th className="text-right px-5 py-3 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((asset, idx) => {
                  const Icon = getTypeIcon(asset.type);
                  return (
                    <motion.tr
                      key={asset.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.03 }}
                      className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#1B2A4A]/5 flex items-center justify-center flex-shrink-0">
                            <Icon className="w-4 h-4 text-[#1B2A4A]" />
                          </div>
                          <span className="font-medium text-[#1B2A4A] truncate max-w-[220px]">
                            {asset.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-gray-600 capitalize">{asset.type}</td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center bg-[#1B2A4A]/5 px-2 py-0.5 rounded text-xs font-medium text-[#1B2A4A]">
                          {asset.format}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-gray-500">{asset.size || '—'}</td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                          {asset.category}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        {asset.url ? (
                          <a
                            href={asset.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#5DB347] hover:underline flex items-center gap-1 text-xs"
                          >
                            <ExternalLink className="w-3 h-3" />
                            View
                          </a>
                        ) : (
                          <span className="text-gray-300 text-xs">No file</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEdit(asset)}
                            className="p-2 rounded-lg hover:bg-[#5DB347]/10 text-gray-400 hover:text-[#5DB347] transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          {deleteConfirm === asset.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleDelete(asset.id)}
                                disabled={saving}
                                className="px-2.5 py-1.5 rounded-lg bg-red-500 text-white text-xs font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirm(asset.id)}
                              className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden"
            >
              {/* Modal header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-[#1B2A4A]">
                  {editingId ? 'Edit Material' : 'Add New Material'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal body */}
              <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. AFU Ambassador Banner (1200x628)"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
                  />
                </div>

                {/* Type + Format row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Type</label>
                    <select
                      value={form.type}
                      onChange={(e) => {
                        const newType = e.target.value;
                        const formats = FORMAT_OPTIONS[newType] || [];
                        setForm((prev) => ({
                          ...prev,
                          type: newType,
                          format: formats[0] || '',
                        }));
                      }}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] bg-white"
                    >
                      {ASSET_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Format</label>
                    <select
                      value={form.format}
                      onChange={(e) => setForm((prev) => ({ ...prev, format: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] bg-white"
                    >
                      {(FORMAT_OPTIONS[form.type] || []).map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] bg-white"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Size (manual) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Size <span className="text-xs text-gray-400">(auto-filled on upload, or enter manually)</span>
                  </label>
                  <input
                    type="text"
                    value={form.size}
                    onChange={(e) => setForm((prev) => ({ ...prev, size: e.target.value }))}
                    placeholder="e.g. 245 KB"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
                  />
                </div>

                {/* File upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Upload File
                  </label>
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-[#5DB347]/40 transition-colors">
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="material-file-upload"
                      accept="image/*,.pdf,.mp4,.mov,.webm"
                    />
                    <label
                      htmlFor="material-file-upload"
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      {uploading ? (
                        <Loader2 className="w-8 h-8 text-[#5DB347] animate-spin" />
                      ) : (
                        <Upload className="w-8 h-8 text-gray-300" />
                      )}
                      <span className="text-sm text-gray-500">
                        {uploading ? 'Uploading...' : 'Click to upload a file'}
                      </span>
                      <span className="text-xs text-gray-400">
                        Images, PDFs, or videos up to 50MB
                      </span>
                    </label>
                  </div>
                </div>

                {/* URL (manual or auto-filled) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    URL <span className="text-xs text-gray-400">(auto-filled on upload, or paste a link)</span>
                  </label>
                  <input
                    type="url"
                    value={form.url}
                    onChange={(e) => setForm((prev) => ({ ...prev, url: e.target.value }))}
                    placeholder="https://..."
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
                  />
                  {form.url && (
                    <a
                      href={form.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-[#5DB347] mt-1.5 hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Preview uploaded file
                    </a>
                  )}
                </div>
              </div>

              {/* Modal footer */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={saving || uploading}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#5DB347] hover:bg-[#4ea03c] text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {editingId ? 'Update Material' : 'Add Material'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
