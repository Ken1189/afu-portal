'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Newspaper, Plus, Pencil, Trash2, Eye, EyeOff, Loader2, X, CheckCircle2, AlertCircle, Star,
} from 'lucide-react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import ImageUploader from '@/components/ui/ImageUploader';
import { ALL_AFRICAN_COUNTRIES } from '@/lib/countries';

/* ── Types ──────────────────────────────────────────────────────── */

interface MediaArticle {
  id: string;
  title: string;
  publication: string;
  article_url: string | null;
  excerpt: string | null;
  image_url: string | null;
  published_date: string | null;
  article_type: string;
  country: string | null;
  tags: string[];
  is_featured: boolean;
  visible: boolean;
  created_at: string;
}

interface FormData {
  title: string;
  publication: string;
  article_url: string;
  excerpt: string;
  image_url: string;
  published_date: string;
  article_type: string;
  country: string;
  tags: string;
  is_featured: boolean;
  visible: boolean;
}

const ARTICLE_TYPES = ['press', 'blog_feature', 'tv', 'radio', 'podcast', 'award'];

const TYPE_LABELS: Record<string, string> = {
  press: 'Press',
  blog_feature: 'Blog Feature',
  tv: 'TV',
  radio: 'Radio',
  podcast: 'Podcast',
  award: 'Award',
};

const TYPE_COLORS: Record<string, string> = {
  press: 'bg-blue-100 text-blue-700',
  blog_feature: 'bg-purple-100 text-purple-700',
  tv: 'bg-red-100 text-red-700',
  radio: 'bg-amber-100 text-amber-700',
  podcast: 'bg-green-100 text-green-700',
  award: 'bg-yellow-100 text-yellow-700',
};

const EMPTY_FORM: FormData = {
  title: '',
  publication: '',
  article_url: '',
  excerpt: '',
  image_url: '',
  published_date: '',
  article_type: 'press',
  country: '',
  tags: '',
  is_featured: false,
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

export default function AdminMediaPRPage() {
  const [articles, setArticles] = useState<MediaArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState<MediaArticle | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const supabase = createClient();

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('media_articles')
      .select('*')
      .order('published_date', { ascending: false });

    if (!error && data) {
      setArticles(data as MediaArticle[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchArticles(); }, [fetchArticles]);

  /* ── CRUD ─────────────────────────────────────────────────── */

  function openCreate() {
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setShowModal(true);
  }

  function openEdit(article: MediaArticle) {
    setEditingId(article.id);
    setFormData({
      title: article.title,
      publication: article.publication,
      article_url: article.article_url || '',
      excerpt: article.excerpt || '',
      image_url: article.image_url || '',
      published_date: article.published_date || '',
      article_type: article.article_type,
      country: article.country || '',
      tags: (article.tags || []).join(', '),
      is_featured: article.is_featured,
      visible: article.visible,
    });
    setShowModal(true);
  }

  async function handleSave() {
    if (!formData.title.trim()) {
      setToast({ message: 'Title is required', type: 'error' });
      return;
    }
    if (!formData.publication.trim()) {
      setToast({ message: 'Publication is required', type: 'error' });
      return;
    }
    setSaving(true);

    const payload = {
      title: formData.title.trim(),
      publication: formData.publication.trim(),
      article_url: formData.article_url.trim() || null,
      excerpt: formData.excerpt.trim() || null,
      image_url: formData.image_url.trim() || null,
      published_date: formData.published_date || null,
      article_type: formData.article_type,
      country: formData.country || null,
      tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
      is_featured: formData.is_featured,
      visible: formData.visible,
      updated_at: new Date().toISOString(),
    };

    let error;
    if (editingId) {
      ({ error } = await supabase.from('media_articles').update(payload).eq('id', editingId));
    } else {
      ({ error } = await supabase.from('media_articles').insert(payload));
    }

    if (error) {
      setToast({ message: `Failed to save: ${error.message}`, type: 'error' });
    } else {
      setToast({ message: editingId ? 'Article updated' : 'Article added', type: 'success' });
      setShowModal(false);
      await fetchArticles();
    }
    setSaving(false);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    const { error } = await supabase.from('media_articles').delete().eq('id', deleteTarget.id);
    if (error) {
      setToast({ message: 'Failed to delete', type: 'error' });
    } else {
      setToast({ message: 'Article deleted', type: 'success' });
      await fetchArticles();
    }
    setDeleteTarget(null);
  }

  async function toggleVisibility(article: MediaArticle) {
    await supabase.from('media_articles').update({ visible: !article.visible }).eq('id', article.id);
    setArticles((prev) => prev.map((a) => a.id === article.id ? { ...a, visible: !a.visible } : a));
  }

  async function toggleFeatured(article: MediaArticle) {
    await supabase.from('media_articles').update({ is_featured: !article.is_featured }).eq('id', article.id);
    setArticles((prev) => prev.map((a) => a.id === article.id ? { ...a, is_featured: !a.is_featured } : a));
  }

  /* ── Stats ────────────────────────────────────────────────── */

  const total = articles.length;
  const featuredCount = articles.filter((a) => a.is_featured).length;
  const typeCounts = ARTICLE_TYPES.reduce((acc, t) => {
    const count = articles.filter((a) => a.article_type === t).length;
    if (count > 0) acc.push({ type: t, count });
    return acc;
  }, [] as { type: string; count: number }[]);

  function formatDate(date: string | null) {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  /* ── Render ───────────────────────────────────────────────── */

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#5DB347]/10 flex items-center justify-center">
            <Newspaper className="w-5 h-5 text-[#5DB347]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#1B2A4A]">Media & PR</h1>
            <p className="text-sm text-gray-500">Manage media coverage and press articles</p>
          </div>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium bg-[#5DB347] hover:bg-[#4a9a39] transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Article
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-400 uppercase tracking-wider">Total Articles</p>
          <p className="text-2xl font-bold text-[#1B2A4A] mt-1">{total}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-400 uppercase tracking-wider">Featured</p>
          <p className="text-2xl font-bold text-[#1B2A4A] mt-1">{featuredCount}</p>
        </div>
        {typeCounts.slice(0, 2).map((tc) => (
          <div key={tc.type} className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-xs text-gray-400 uppercase tracking-wider">{TYPE_LABELS[tc.type]}</p>
            <p className="text-2xl font-bold text-[#1B2A4A] mt-1">{tc.count}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-[#5DB347]" />
        </div>
      ) : articles.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Newspaper className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-[#1B2A4A] mb-2">No articles yet</h3>
          <p className="text-sm text-gray-500 mb-6">Add your first media article or press coverage.</p>
          <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-medium bg-[#5DB347]">
            <Plus className="w-4 h-4" /> Add Article
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Title</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Publication</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Type</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Date</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500">Featured</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500">Visible</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((article) => (
                  <tr key={article.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-medium text-[#1B2A4A] line-clamp-1">{article.title}</span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{article.publication}</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${TYPE_COLORS[article.article_type] || 'bg-gray-100 text-gray-600'}`}>
                        {TYPE_LABELS[article.article_type] || article.article_type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-500">{formatDate(article.published_date)}</td>
                    <td className="py-3 px-4 text-center">
                      <button onClick={() => toggleFeatured(article)} className="text-gray-300 hover:text-yellow-500">
                        <Star className={`w-4 h-4 ${article.is_featured ? 'text-yellow-500 fill-yellow-500' : ''}`} />
                      </button>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button onClick={() => toggleVisibility(article)} className="text-gray-400 hover:text-[#5DB347]">
                        {article.visible ? <Eye className="w-4 h-4 text-[#5DB347]" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(article)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#5DB347]">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteTarget(article)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500">
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
              <h2 className="text-lg font-bold text-[#1B2A4A]">{editingId ? 'Edit Article' : 'Add Article'}</h2>
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
                  placeholder="Article title"
                />
              </div>
              {/* Publication */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Publication *</label>
                <input
                  value={formData.publication}
                  onChange={(e) => setFormData({ ...formData, publication: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none"
                  placeholder="e.g. Reuters, Bloomberg, The Herald"
                />
              </div>
              {/* Article URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Article URL</label>
                <input
                  value={formData.article_url}
                  onChange={(e) => setFormData({ ...formData, article_url: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none"
                  placeholder="https://..."
                />
              </div>
              {/* Excerpt */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none"
                  placeholder="Brief excerpt or summary"
                />
              </div>
              {/* Image URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                <ImageUploader
                  value={formData.image_url}
                  onChange={(url) => setFormData({ ...formData, image_url: url })}
                  folder="media"
                />
              </div>
              {/* Type + Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Article Type</label>
                  <select
                    value={formData.article_type}
                    onChange={(e) => setFormData({ ...formData, article_type: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none"
                  >
                    {ARTICLE_TYPES.map((t) => (
                      <option key={t} value={t}>{TYPE_LABELS[t]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Published Date</label>
                  <input
                    type="date"
                    value={formData.published_date}
                    onChange={(e) => setFormData({ ...formData, published_date: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none"
                  />
                </div>
              </div>
              {/* Country */}
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
              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
                <input
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none"
                  placeholder="e.g. agriculture, funding, partnership"
                />
              </div>
              {/* Featured + Visible */}
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-[#5DB347] focus:ring-[#5DB347]"
                  />
                  <span className="text-sm text-gray-700">Featured</span>
                </label>
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
                {editingId ? 'Update' : 'Add Article'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setDeleteTarget(null)}>
          <div className="bg-white rounded-2xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-[#1B2A4A] mb-2">Delete Article</h3>
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
