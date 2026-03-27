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
  Scale,
  ArrowLeft,
  Globe,
  Clock,
  FileText,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

// ── Types ─────────────────────────────────────────────────

interface LegalPage {
  id: string;
  slug: string;
  title: string;
  content: string;
  country: string | null;
  version: string;
  is_published: boolean;
  published_at: string;
  created_at: string;
  updated_at: string;
}

interface FormData {
  slug: string;
  title: string;
  content: string;
  country: string;
  version: string;
  is_published: boolean;
}

const emptyForm: FormData = {
  slug: '',
  title: '',
  content: '',
  country: '',
  version: '1.0',
  is_published: true,
};

const COUNTRIES = [
  { code: '', name: 'Global (All Countries)' },
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

export default function LegalAdmin() {
  const [pages, setPages] = useState<LegalPage[]>([]);
  const [_loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const supabase = createClient();

  const fetchPages = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('legal_pages')
      .select('*')
      .order('slug', { ascending: true });
    if (error) {
      setToast({ message: 'Failed to load legal pages', type: 'error' });
    } else {
      setPages(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchPages(); }, [fetchPages]);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setIsEditing(true);
  };

  const openEdit = (page: LegalPage) => {
    setEditingId(page.id);
    setForm({
      slug: page.slug,
      title: page.title,
      content: page.content,
      country: page.country || '',
      version: page.version,
      is_published: page.is_published,
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.slug.trim() || !form.content.trim()) {
      setToast({ message: 'Title, slug, and content are required', type: 'error' });
      return;
    }
    setSaving(true);
    const payload = {
      slug: form.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      title: form.title.trim(),
      content: form.content,
      country: form.country || null,
      version: form.version,
      is_published: form.is_published,
      published_at: form.is_published ? new Date().toISOString() : undefined,
    };

    let error;
    if (editingId) {
      ({ error } = await supabase.from('legal_pages').update(payload).eq('id', editingId));
    } else {
      ({ error } = await supabase.from('legal_pages').insert(payload));
    }

    if (error) {
      setToast({ message: `Failed to ${editingId ? 'update' : 'create'} legal page. ${error.message}`, type: 'error' });
    } else {
      setToast({ message: `Legal page ${editingId ? 'updated' : 'created'} successfully`, type: 'success' });
      setIsEditing(false);
      fetchPages();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('legal_pages').delete().eq('id', id);
    if (error) {
      setToast({ message: 'Failed to delete legal page', type: 'error' });
    } else {
      setToast({ message: 'Legal page deleted', type: 'success' });
      setPages((prev) => prev.filter((p) => p.id !== id));
    }
    setDeleteConfirm(null);
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  // ── Editor View ─────────────────────────────────────────

  if (isEditing) {
    return (
      <div className="space-y-6">
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsEditing(false)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-500" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-[#1B2A4A]">{editingId ? 'Edit Legal Page' : 'New Legal Page'}</h1>
              <p className="text-sm text-gray-500 mt-0.5">Write content in Markdown format</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm hover:opacity-90 disabled:opacity-50"
            style={{ background: '#5DB347' }}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Title *</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-200 focus:border-green-400 outline-none" placeholder="Terms of Service" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Slug *</label>
              <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-200 focus:border-green-400 outline-none font-mono" placeholder="terms-of-service" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Country Scope</label>
              <select value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-200 focus:border-green-400 outline-none">
                {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Version</label>
              <input value={form.version} onChange={(e) => setForm({ ...form, version: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-200 focus:border-green-400 outline-none" placeholder="1.0" />
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} className="w-4 h-4 rounded border-gray-300 text-green-500 focus:ring-green-200" />
                <span className="text-sm text-gray-600">Published</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Content (Markdown) *</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={24}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm font-mono leading-relaxed focus:ring-2 focus:ring-green-200 focus:border-green-400 outline-none resize-y"
              placeholder="# Terms of Service&#10;&#10;Write your legal content here in Markdown..."
            />
          </div>
        </div>
      </div>
    );
  }

  // ── List View ───────────────────────────────────────────

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">Legal Pages</h1>
          <p className="text-sm text-gray-500 mt-1">Manage terms, privacy policy, and other legal documents</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm hover:opacity-90" style={{ background: '#5DB347' }}>
          <Plus className="w-4 h-4" />
          Add Legal Page
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-xl p-5 border border-gray-100 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-1/3 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && pages.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <Scale className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-[#1B2A4A]">No legal pages yet</h3>
          <p className="text-sm text-gray-500 mt-1">Add your first legal document</p>
          <button onClick={openAdd} className="mt-4 px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ background: '#5DB347' }}>
            <Plus className="w-4 h-4 inline mr-1" />Add Legal Page
          </button>
        </div>
      )}

      {/* Page list */}
      {!loading && pages.length > 0 && (
        <div className="space-y-3">
          {pages.map((page) => (
            <div
              key={page.id}
              className={`bg-white rounded-xl border p-5 group hover:shadow-md transition-shadow cursor-pointer ${
                !page.is_published ? 'border-gray-200 opacity-70' : 'border-gray-100'
              }`}
              onClick={() => openEdit(page)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-[#1B2A4A]">{page.title}</h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-mono">/{page.slug}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">v{page.version}</span>
                      {!page.is_published && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">Draft</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                        <Globe className="w-3 h-3" />
                        {page.country ? COUNTRIES.find((c) => c.code === page.country)?.name || page.country : 'Global'}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                        <Clock className="w-3 h-3" />
                        Updated {formatDate(page.updated_at)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => { e.stopPropagation(); openEdit(page); }}
                    className="p-2 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setDeleteConfirm(page.id); }}
                    className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-[#1B2A4A] mb-2">Delete Legal Page?</h3>
            <p className="text-sm text-gray-500 mb-4">This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
