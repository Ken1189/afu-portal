'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  PenSquare, Plus, Pencil, Trash2, Save, Loader2, X, CheckCircle2, AlertCircle,
  Eye, Calendar, User, Tag, Star,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface BlogPost {
  id: string;
  page: string;
  section: string;
  key: string;
  value: string;
  content_type: string;
  updated_at: string;
}

interface ParsedPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  category: string;
  featured_image: string;
  author: string;
  published: boolean;
  featured: boolean;
  created_at: string;
}

interface PostFormData {
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  category: string;
  featured_image: string;
  author: string;
  published: boolean;
  featured: boolean;
}

const CATEGORIES = ['News', 'Update', 'Farmer Story', 'Market Report', 'Partnership'];

const EMPTY_FORM: PostFormData = {
  title: '', slug: '', excerpt: '', body: '', category: 'News', featured_image: '', author: '', published: false, featured: false,
};

const CATEGORY_COLORS: Record<string, string> = {
  News: 'bg-blue-100 text-blue-700', Update: 'bg-green-100 text-green-700',
  'Farmer Story': 'bg-amber-100 text-amber-700', 'Market Report': 'bg-purple-100 text-purple-700',
  Partnership: 'bg-cyan-100 text-cyan-700',
};

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
      {type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
      {message}
    </div>
  );
}

function generateSlug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function parsePost(raw: BlogPost): ParsedPost {
  try {
    const data = JSON.parse(raw.value);
    return {
      id: raw.id, title: data.title || '', slug: data.slug || raw.key,
      excerpt: data.excerpt || '', body: data.body || '', category: data.category || 'News',
      featured_image: data.featured_image || '', author: data.author || '',
      published: data.published ?? false, featured: data.featured ?? false,
      created_at: raw.updated_at,
    };
  } catch {
    return {
      id: raw.id, title: raw.key, slug: raw.key, excerpt: '', body: raw.value,
      category: 'News', featured_image: '', author: '', published: false, featured: false, created_at: raw.updated_at,
    };
  }
}

// Simple markdown renderer
// S1.7: Sanitize HTML before rendering to prevent XSS
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderMarkdown(md: string): string {
  // Escape HTML first to prevent XSS, then apply markdown transforms
  return escapeHtml(md)
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mt-4 mb-2">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br/>');
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<ParsedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<PostFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ParsedPost | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [previewPost, setPreviewPost] = useState<ParsedPost | null>(null);
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');

  const supabase = createClient();

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('site_content')
      .select('*')
      .eq('content_type', 'blog_post')
      .order('updated_at', { ascending: false });
    if (error) {
      setPosts([]);
    } else {
      setPosts((data || []).map(parsePost));
    }
    setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const openCreate = () => {
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (p: ParsedPost) => {
    setEditingId(p.id);
    setFormData({
      title: p.title, slug: p.slug, excerpt: p.excerpt, body: p.body,
      category: p.category, featured_image: p.featured_image, author: p.author,
      published: p.published, featured: p.featured,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.title.trim()) { setToast({ message: 'Title is required', type: 'error' }); return; }
    setSaving(true);
    const slug = formData.slug || generateSlug(formData.title);
    const value = JSON.stringify({
      title: formData.title, slug, excerpt: formData.excerpt, body: formData.body,
      category: formData.category, featured_image: formData.featured_image,
      author: formData.author, published: formData.published, featured: formData.featured,
    });

    if (editingId) {
      const { error } = await supabase.from('site_content').update({ value, key: slug }).eq('id', editingId);
      if (error) { setToast({ message: 'Failed to update', type: 'error' }); }
      else { setToast({ message: 'Post updated', type: 'success' }); setShowModal(false); await fetchPosts(); }
    } else {
      const { error } = await supabase.from('site_content').insert({
        page: 'blog', section: 'posts', key: slug, value, content_type: 'blog_post',
      });
      if (error) { setToast({ message: 'Failed to create', type: 'error' }); }
      else { setToast({ message: 'Post created', type: 'success' }); setShowModal(false); await fetchPosts(); }
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const { error } = await supabase.from('site_content').delete().eq('id', deleteTarget.id);
    if (error) { setToast({ message: 'Failed to delete', type: 'error' }); }
    else { setToast({ message: 'Post deleted', type: 'success' }); setPosts((p) => p.filter((x) => x.id !== deleteTarget.id)); }
    setDeleteTarget(null); setDeleting(false);
  };

  const filteredPosts = posts.filter((p) => {
    if (filter === 'published') return p.published;
    if (filter === 'draft') return !p.published;
    return true;
  });

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">Blog & News</h1>
          <p className="text-sm text-gray-500 mt-1">Manage blog posts and news articles</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#5DB347] text-white text-sm font-medium rounded-lg hover:bg-[#4a9a38] shadow-sm transition-all">
          <Plus className="w-4 h-4" /> New Post
        </button>
      </div>

      {/* Stats & Filter */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <div className="grid grid-cols-3 gap-4 flex-1">
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <p className="text-2xl font-bold text-[#1B2A4A]">{posts.length}</p>
            <p className="text-xs text-gray-500">Total Posts</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <p className="text-2xl font-bold text-[#5DB347]">{posts.filter((p) => p.published).length}</p>
            <p className="text-xs text-gray-500">Published</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <p className="text-2xl font-bold text-gray-400">{posts.filter((p) => !p.published).length}</p>
            <p className="text-xs text-gray-500">Drafts</p>
          </div>
        </div>
        <div className="flex gap-2">
          {(['all', 'published', 'draft'] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${filter === f ? 'bg-[#1B2A4A] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#5DB347] mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading posts...</p>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <PenSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-[#1B2A4A]">No posts yet</h3>
          <p className="text-sm text-gray-500 mt-1">Create your first blog post.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPosts.map((p) => (
            <div key={p.id} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-semibold text-[#1B2A4A] truncate">{p.title}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${CATEGORY_COLORS[p.category] || 'bg-gray-100 text-gray-600'}`}>{p.category}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${p.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {p.published ? 'Published' : 'Draft'}
                    </span>
                    {p.featured && <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />}
                  </div>
                  {p.excerpt && <p className="text-sm text-gray-500 line-clamp-1">{p.excerpt}</p>}
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    {p.author && <span className="flex items-center gap-1"><User className="w-3 h-3" /> {p.author}</span>}
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(p.created_at).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><Tag className="w-3 h-3" /> /{p.slug}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setPreviewPost(p)} className="p-1.5 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100" title="Preview"><Eye className="w-3.5 h-3.5" /></button>
                  <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100" title="Edit"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => setDeleteTarget(p)} className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#1B2A4A]">{editingId ? 'Edit Post' : 'Create Post'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input value={formData.title} onChange={(e) => { setFormData({ ...formData, title: e.target.value, slug: formData.slug || generateSlug(e.target.value) }); }} placeholder="Post title"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                  <input value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} placeholder="auto-generated-slug"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347]">
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
                <textarea value={formData.excerpt} onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })} rows={2} placeholder="Brief summary..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347] resize-y" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Body (Markdown supported)</label>
                <textarea value={formData.body} onChange={(e) => setFormData({ ...formData, body: e.target.value })} rows={12} placeholder="Write your post content here... Supports **bold**, *italic*, # headings"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347] resize-y" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Featured Image URL</label>
                  <input value={formData.featured_image} onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })} placeholder="https://..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                  <input value={formData.author} onChange={(e) => setFormData({ ...formData, author: e.target.value })} placeholder="Author name"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347]" />
                </div>
              </div>
              <div className="flex gap-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <button type="button" onClick={() => setFormData({ ...formData, published: !formData.published })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.published ? 'bg-[#5DB347]' : 'bg-gray-200'}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${formData.published ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                  <span className="text-sm font-medium text-gray-700">Published</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <button type="button" onClick={() => setFormData({ ...formData, featured: !formData.featured })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.featured ? 'bg-yellow-400' : 'bg-gray-200'}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${formData.featured ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                  <span className="text-sm font-medium text-gray-700">Featured</span>
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleSave} disabled={saving || !formData.title.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-[#5DB347] text-white text-sm font-medium rounded-lg hover:bg-[#4a9a38] disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {editingId ? 'Update' : 'Create Post'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewPost && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setPreviewPost(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#1B2A4A]">Post Preview</h3>
              <button onClick={() => setPreviewPost(null)} className="p-1.5 rounded-lg hover:bg-gray-100"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            {previewPost.featured_image && (
              <img src={previewPost.featured_image} alt={`Featured image for ${previewPost.title}`} className="w-full h-48 object-cover rounded-xl" />
            )}
            <div>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${CATEGORY_COLORS[previewPost.category] || 'bg-gray-100 text-gray-600'}`}>{previewPost.category}</span>
            </div>
            <h2 className="text-2xl font-bold text-[#1B2A4A]">{previewPost.title}</h2>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              {previewPost.author && <span>By {previewPost.author}</span>}
              <span>{new Date(previewPost.created_at).toLocaleDateString()}</span>
            </div>
            {previewPost.excerpt && <p className="text-gray-600 italic">{previewPost.excerpt}</p>}
            <div className="prose prose-sm max-w-none border-t border-gray-100 pt-4" dangerouslySetInnerHTML={{ __html: renderMarkdown(previewPost.body) }} />
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setDeleteTarget(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-[#1B2A4A]">Delete Post</h3>
            <p className="text-sm text-gray-600">Are you sure you want to delete &quot;{deleteTarget.title}&quot;? This cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleDelete} disabled={deleting}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50">
                {deleting && <Loader2 className="w-4 h-4 animate-spin" />} Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
