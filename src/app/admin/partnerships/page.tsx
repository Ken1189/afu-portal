'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  Trash2,
  Pencil,
  Eye,
  EyeOff,
  Award,
  Handshake,
  ExternalLink,
  Filter,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

// ── Types ─────────────────────────────────────────────────

interface ManagedPartner {
  id: string;
  name: string;
  logo_url: string | null;
  website_url: string | null;
  description: string | null;
  category: string;
  country: string | null;
  is_featured: boolean;
  is_published: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

interface FormData {
  name: string;
  logo_url: string;
  website_url: string;
  description: string;
  category: string;
  country: string;
  is_featured: boolean;
  is_published: boolean;
  display_order: number;
}

const emptyForm: FormData = {
  name: '',
  logo_url: '',
  website_url: '',
  description: '',
  category: 'technology',
  country: '',
  is_featured: false,
  is_published: true,
  display_order: 0,
};

const CATEGORIES = [
  { value: 'technology', label: 'Technology', color: '#3B82F6' },
  { value: 'banking', label: 'Banking', color: '#5DB347' },
  { value: 'ngo', label: 'NGO', color: '#F59E0B' },
  { value: 'government', label: 'Government', color: '#1B2A4A' },
  { value: 'telecom', label: 'Telecom', color: '#8B5CF6' },
  { value: 'insurance', label: 'Insurance', color: '#EF4444' },
  { value: 'research', label: 'Research', color: '#06B6D4' },
];

const COUNTRIES = [
  { code: '', name: 'Global' },
  { code: 'BW', name: 'Botswana' },
  { code: 'ZW', name: 'Zimbabwe' },
  { code: 'TZ', name: 'Tanzania' },
  { code: 'KE', name: 'Kenya' },
  { code: 'ZM', name: 'Zambia' },
  { code: 'SL', name: 'Sierra Leone' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'MZ', name: 'Mozambique' },
  { code: 'UG', name: 'Uganda' },
  { code: 'ZA', name: 'South Africa' },
];

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
      {type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
      {message}
    </div>
  );
}

export default function PartnershipsAdmin() {
  const [partners, setPartners] = useState<ManagedPartner[]>([]);
  const [_loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [filterCat, setFilterCat] = useState<string>('all');

  const supabase = createClient();

  const fetchPartners = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('managed_partners')
      .select('*')
      .order('display_order', { ascending: true });
    if (error) {
      setToast({ message: 'Failed to load partners', type: 'error' });
    } else {
      setPartners(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchPartners(); }, [fetchPartners]);

  const filtered = filterCat === 'all' ? partners : partners.filter((p) => p.category === filterCat);

  const openAdd = () => {
    setEditingId(null);
    setForm({ ...emptyForm, display_order: partners.length + 1 });
    setModalOpen(true);
  };

  const openEdit = (p: ManagedPartner) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      logo_url: p.logo_url || '',
      website_url: p.website_url || '',
      description: p.description || '',
      category: p.category,
      country: p.country || '',
      is_featured: p.is_featured,
      is_published: p.is_published,
      display_order: p.display_order,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      setToast({ message: 'Partner name is required', type: 'error' });
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      logo_url: form.logo_url || null,
      website_url: form.website_url || null,
      description: form.description || null,
      category: form.category,
      country: form.country || null,
      is_featured: form.is_featured,
      is_published: form.is_published,
      display_order: form.display_order,
    };

    let error;
    if (editingId) {
      ({ error } = await supabase.from('managed_partners').update(payload).eq('id', editingId));
    } else {
      ({ error } = await supabase.from('managed_partners').insert(payload));
    }

    if (error) {
      setToast({ message: `Failed to ${editingId ? 'update' : 'create'} partner`, type: 'error' });
    } else {
      setToast({ message: `Partner ${editingId ? 'updated' : 'added'} successfully`, type: 'success' });
      setModalOpen(false);
      fetchPartners();
    }
    setSaving(false);
  };

  const toggleField = async (id: string, field: 'is_featured' | 'is_published', value: boolean) => {
    const { error } = await supabase.from('managed_partners').update({ [field]: !value }).eq('id', id);
    if (error) {
      setToast({ message: 'Failed to update', type: 'error' });
    } else {
      setPartners((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: !value } : p)));
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('managed_partners').delete().eq('id', id);
    if (error) {
      setToast({ message: 'Failed to delete partner', type: 'error' });
    } else {
      setToast({ message: 'Partner deleted', type: 'success' });
      setPartners((prev) => prev.filter((p) => p.id !== id));
    }
    setDeleteConfirm(null);
  };

  const getCatColor = (cat: string) => CATEGORIES.find((c) => c.value === cat)?.color || '#6B7280';
  const getCatLabel = (cat: string) => CATEGORIES.find((c) => c.value === cat)?.label || cat;

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">Partners</h1>
          <p className="text-sm text-gray-500 mt-1">Manage partner organizations displayed on the site</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-opacity"
          style={{ background: '#5DB347' }}
        >
          <Plus className="w-4 h-4" />
          Add Partner
        </button>
      </div>

      {/* Category filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-4 h-4 text-gray-400" />
        <button
          onClick={() => setFilterCat('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterCat === 'all' ? 'bg-[#1B2A4A] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          All ({partners.length})
        </button>
        {CATEGORIES.map((cat) => {
          const count = partners.filter((p) => p.category === cat.value).length;
          if (count === 0) return null;
          return (
            <button
              key={cat.value}
              onClick={() => setFilterCat(cat.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterCat === cat.value ? 'text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              style={filterCat === cat.value ? { background: cat.color } : {}}
            >
              {cat.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-xl p-6 border border-gray-100 animate-pulse">
              <div className="w-16 h-16 bg-gray-200 rounded-xl mb-4" />
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-full" />
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && partners.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <Handshake className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-[#1B2A4A]">No partners yet</h3>
          <p className="text-sm text-gray-500 mt-1">Add your first partner organization</p>
          <button onClick={openAdd} className="mt-4 px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ background: '#5DB347' }}>
            <Plus className="w-4 h-4 inline mr-1" />Add Partner
          </button>
        </div>
      )}

      {/* Grid */}
      {!loading && filtered.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <div
              key={p.id}
              className={`bg-white rounded-xl border p-5 relative group transition-shadow hover:shadow-md ${
                !p.is_published ? 'border-gray-200 opacity-60' : p.is_featured ? 'border-yellow-300 ring-1 ring-yellow-200' : 'border-gray-100'
              }`}
            >
              {/* Logo / initials */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-sm flex-shrink-0 overflow-hidden">
                  {p.logo_url ? (
                    <img src={p.logo_url} alt={p.name} loading="lazy" className="w-full h-full object-contain p-1" />
                  ) : (
                    p.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[#1B2A4A] truncate">{p.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-white"
                      style={{ background: getCatColor(p.category) }}
                    >
                      {getCatLabel(p.category)}
                    </span>
                    {p.country && (
                      <span className="text-[10px] text-gray-400">
                        {COUNTRIES.find((c) => c.code === p.country)?.name || p.country}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              {p.description && (
                <p className="text-xs text-gray-500 line-clamp-2 mb-3">{p.description}</p>
              )}

              {/* Website link */}
              {p.website_url && (
                <a
                  href={p.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700"
                >
                  <ExternalLink className="w-3 h-3" />
                  Website
                </a>
              )}

              {/* Badges */}
              <div className="flex items-center gap-1.5 mt-3">
                {p.is_featured && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-yellow-100 text-yellow-700">
                    <Award className="w-3 h-3" /> Featured
                  </span>
                )}
                {!p.is_published && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-500">
                    <EyeOff className="w-3 h-3" /> Draft
                  </span>
                )}
                <span className="ml-auto text-[10px] text-gray-400">#{p.display_order}</span>
              </div>

              {/* Actions */}
              <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => toggleField(p.id, 'is_featured', p.is_featured)} className={`p-1.5 rounded-lg ${p.is_featured ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-400 hover:text-yellow-600'}`} title="Toggle featured">
                  <Award className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => toggleField(p.id, 'is_published', p.is_published)} className={`p-1.5 rounded-lg ${p.is_published ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400 hover:text-green-600'}`} title="Toggle published">
                  {p.is_published ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
                <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg bg-gray-100 text-gray-500 hover:text-blue-600" title="Edit">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setDeleteConfirm(p.id)} className="p-1.5 rounded-lg bg-gray-100 text-gray-400 hover:text-red-600" title="Delete">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-[#1B2A4A] mb-2">Delete Partner?</h3>
            <p className="text-sm text-gray-500 mb-4">This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-xl max-w-lg w-full shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-[#1B2A4A]">{editingId ? 'Edit Partner' : 'Add Partner'}</h3>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded-lg hover:bg-gray-100"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Partner Name *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-200 focus:border-green-400 outline-none" placeholder="World Bank IFC" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Category</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-200 focus:border-green-400 outline-none">
                    {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Country</label>
                  <select value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-200 focus:border-green-400 outline-none">
                    {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Logo URL</label>
                <input value={form.logo_url} onChange={(e) => setForm({ ...form, logo_url: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-200 focus:border-green-400 outline-none" placeholder="https://..." />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Website URL</label>
                <input value={form.website_url} onChange={(e) => setForm({ ...form, website_url: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-200 focus:border-green-400 outline-none" placeholder="https://..." />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-200 focus:border-green-400 outline-none resize-none" placeholder="Brief description of partnership..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Display Order</label>
                  <input type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-200 focus:border-green-400 outline-none" />
                </div>
                <div className="flex items-end pb-2 gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} className="w-4 h-4 rounded border-gray-300 text-yellow-500 focus:ring-yellow-200" />
                    <span className="text-sm text-gray-600">Featured</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} className="w-4 h-4 rounded border-gray-300 text-green-500 focus:ring-green-200" />
                    <span className="text-sm text-gray-600">Published</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-5 border-t border-gray-100">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm hover:opacity-90 disabled:opacity-50" style={{ background: '#5DB347' }}>
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
