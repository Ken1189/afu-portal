'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/supabase/auth-context';
import ImageUploader from '@/components/ui/ImageUploader';
import {
  Video,
  Plus,
  Trash2,
  Pencil,
  X,
  Star,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Play,
  Eye,
  GripVertical,
  Upload,
  Youtube,
  Film,
} from 'lucide-react';

/* ── Types ── */

interface SupplierVideo {
  id: string;
  title: string;
  description: string | null;
  youtube_url: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
  is_featured: boolean;
  display_order: number;
}

const emptyForm = {
  title: '',
  description: '',
  youtube_url: '',
  video_url: '',
  thumbnail_url: '',
  is_featured: false,
};

/* ── Helpers ── */

function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

function youTubeThumbnail(url: string): string | null {
  const id = extractYouTubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : null;
}

/* ── Toast ── */

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
      {type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
      {message}
    </div>
  );
}

/* ── Page ── */

export default function SupplierVideosPage() {
  const supabase = createClient();
  const { user } = useAuth();

  const [supplierId, setSupplierId] = useState<string | null>(null);
  const [videos, setVideos] = useState<SupplierVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Load supplier ID & videos
  const loadVideos = useCallback(async () => {
    if (!user) return;
    try {
      // Get supplier record for this user
      const { data: supplier } = await supabase
        .from('suppliers')
        .select('id')
        .eq('profile_id', user.id)
        .maybeSingle();

      if (!supplier) {
        setLoading(false);
        return;
      }
      setSupplierId(supplier.id);

      const { data } = await supabase
        .from('supplier_videos')
        .select('*')
        .eq('supplier_id', supplier.id)
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

      setVideos(data || []);
    } catch {
      setToast({ message: 'Failed to load videos', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => { loadVideos(); }, [loadVideos]);

  // Open modal for new/edit
  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (v: SupplierVideo) => {
    setEditingId(v.id);
    setForm({
      title: v.title,
      description: v.description || '',
      youtube_url: v.youtube_url || '',
      video_url: v.video_url || '',
      thumbnail_url: v.thumbnail_url || '',
      is_featured: v.is_featured,
    });
    setModalOpen(true);
  };

  // Save (insert or update)
  const handleSave = async () => {
    if (!supplierId || !form.title.trim()) {
      setToast({ message: 'Title is required', type: 'error' });
      return;
    }
    if (!form.youtube_url && !form.video_url) {
      setToast({ message: 'Please add a YouTube URL or upload a video', type: 'error' });
      return;
    }

    setSaving(true);

    // Auto-generate thumbnail from YouTube if not provided
    let thumb = form.thumbnail_url;
    if (!thumb && form.youtube_url) {
      thumb = youTubeThumbnail(form.youtube_url) || '';
    }

    const payload = {
      supplier_id: supplierId,
      title: form.title.trim(),
      description: form.description.trim() || null,
      youtube_url: form.youtube_url.trim() || null,
      video_url: form.video_url.trim() || null,
      thumbnail_url: thumb || null,
      is_featured: form.is_featured,
      display_order: editingId ? undefined : videos.length,
      updated_at: new Date().toISOString(),
    };

    let error;
    if (editingId) {
      const { display_order: _, ...updatePayload } = payload as Record<string, unknown>;
      ({ error } = await supabase.from('supplier_videos').update(updatePayload).eq('id', editingId));
    } else {
      ({ error } = await supabase.from('supplier_videos').insert(payload));
    }

    setSaving(false);
    if (error) {
      setToast({ message: 'Failed to save video: ' + error.message, type: 'error' });
    } else {
      setToast({ message: editingId ? 'Video updated' : 'Video added', type: 'success' });
      setModalOpen(false);
      loadVideos();
    }
  };

  // Delete
  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('supplier_videos').delete().eq('id', id);
    if (error) {
      setToast({ message: 'Failed to delete', type: 'error' });
    } else {
      setToast({ message: 'Video deleted', type: 'success' });
      setVideos((prev) => prev.filter((v) => v.id !== id));
    }
    setDeleteConfirm(null);
  };

  // Toggle featured
  const toggleFeatured = async (v: SupplierVideo) => {
    const { error } = await supabase
      .from('supplier_videos')
      .update({ is_featured: !v.is_featured })
      .eq('id', v.id);
    if (!error) {
      setVideos((prev) =>
        prev.map((x) => (x.id === v.id ? { ...x, is_featured: !x.is_featured } : x))
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[#5DB347] animate-spin" />
      </div>
    );
  }

  if (!supplierId) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <Film className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-[#1B2A4A] mb-2">Supplier Profile Required</h2>
        <p className="text-gray-500">Please complete your supplier profile first before adding videos.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A] flex items-center gap-2">
            <Video className="w-6 h-6 text-[#5DB347]" />
            Videos
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Showcase your products, facilities, and expertise with video content
          </p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#5DB347] text-white rounded-xl font-semibold text-sm hover:bg-[#4a9e39] transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Video
        </button>
      </div>

      {/* Empty state */}
      {videos.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <Film className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-[#1B2A4A] mb-2">No videos yet</h3>
          <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
            Add product demos, facility tours, or testimonials to help farmers learn about your offerings.
          </p>
          <button
            onClick={openNew}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#5DB347] text-white rounded-xl font-semibold text-sm hover:bg-[#4a9e39] transition-colors"
          >
            <Upload className="w-4 h-4" /> Upload Your First Video
          </button>
        </div>
      )}

      {/* Video grid */}
      {videos.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((v) => {
            const thumb = v.thumbnail_url || (v.youtube_url ? youTubeThumbnail(v.youtube_url) : null);
            return (
              <div
                key={v.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group"
              >
                {/* Thumbnail */}
                <div
                  className="relative aspect-video bg-gray-100 cursor-pointer"
                  onClick={() => setPreviewUrl(v.youtube_url || v.video_url || null)}
                >
                  {thumb ? (
                    <Image src={thumb} alt={v.title} fill className="object-cover" unoptimized />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Film className="w-12 h-12 text-gray-300" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                      <Play className="w-6 h-6 text-[#1B2A4A] ml-0.5" />
                    </div>
                  </div>
                  {v.is_featured && (
                    <div className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3" /> Featured
                    </div>
                  )}
                  {v.youtube_url && (
                    <div className="absolute bottom-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Youtube className="w-3 h-3" /> YouTube
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-[#1B2A4A] text-sm line-clamp-1">{v.title}</h3>
                  {v.description && (
                    <p className="text-gray-500 text-xs mt-1 line-clamp-2">{v.description}</p>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50">
                    <button
                      onClick={() => openEdit(v)}
                      className="flex items-center gap-1 text-xs text-gray-500 hover:text-[#5DB347] transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => toggleFeatured(v)}
                      className={`flex items-center gap-1 text-xs transition-colors ${v.is_featured ? 'text-yellow-600 hover:text-yellow-700' : 'text-gray-500 hover:text-yellow-600'}`}
                    >
                      <Star className="w-3.5 h-3.5" /> {v.is_featured ? 'Unfeature' : 'Feature'}
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(v.id)}
                      className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-600 transition-colors ml-auto"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>

                {/* Delete confirmation */}
                {deleteConfirm === v.id && (
                  <div className="px-4 pb-4">
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm">
                      <p className="text-red-700 font-medium mb-2">Delete this video?</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDelete(v.id)}
                          className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700"
                        >
                          Yes, delete
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="px-3 py-1 bg-white border border-gray-200 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Video preview modal */}
      {previewUrl && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setPreviewUrl(null)}>
          <div className="relative w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setPreviewUrl(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300"
            >
              <X className="w-6 h-6" />
            </button>
            {extractYouTubeId(previewUrl) ? (
              <div className="aspect-video rounded-xl overflow-hidden">
                <iframe
                  src={`https://www.youtube.com/embed/${extractYouTubeId(previewUrl)}?autoplay=1`}
                  className="w-full h-full"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                />
              </div>
            ) : (
              <video src={previewUrl} controls autoPlay className="w-full rounded-xl" />
            )}
          </div>
        </div>
      )}

      {/* Add / Edit modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setModalOpen(false)}>
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-[#1B2A4A]">
                {editingId ? 'Edit Video' : 'Add Video'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-[#1B2A4A] mb-1">Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g., Product Demo — Premium Seeds Range"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/40 focus:border-[#5DB347]"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-[#1B2A4A] mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Brief description of this video..."
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/40 focus:border-[#5DB347] resize-none"
                />
              </div>

              {/* YouTube URL */}
              <div>
                <label className="block text-sm font-semibold text-[#1B2A4A] mb-1 flex items-center gap-1.5">
                  <Youtube className="w-4 h-4 text-red-600" /> YouTube URL
                </label>
                <input
                  type="url"
                  value={form.youtube_url}
                  onChange={(e) => setForm({ ...form, youtube_url: e.target.value })}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/40 focus:border-[#5DB347]"
                />
                {form.youtube_url && youTubeThumbnail(form.youtube_url) && (
                  <Image
                    src={youTubeThumbnail(form.youtube_url)!}
                    alt="YouTube preview"
                    width={240}
                    height={135}
                    className="mt-2 rounded-lg w-full max-w-[240px] border border-gray-100"
                    unoptimized
                  />
                )}
              </div>

              {/* Or: Upload video */}
              <div className="relative">
                <div className="absolute inset-x-0 top-0 flex items-center">
                  <div className="flex-1 border-t border-gray-200" />
                  <span className="px-3 text-xs text-gray-400 font-medium">or upload a video file</span>
                  <div className="flex-1 border-t border-gray-200" />
                </div>
                <div className="pt-6">
                  <ImageUploader
                    value={form.video_url || null}
                    onChange={(url) => setForm({ ...form, video_url: url || '' })}
                    bucket="media"
                    folder="supplier-videos"
                    label="Upload video (MP4, MOV, max 100MB)"
                  />
                </div>
              </div>

              {/* Custom thumbnail */}
              <div>
                <label className="block text-sm font-semibold text-[#1B2A4A] mb-1">
                  Custom Thumbnail <span className="text-gray-400 font-normal">(optional — auto-generated for YouTube)</span>
                </label>
                <ImageUploader
                  value={form.thumbnail_url || null}
                  onChange={(url) => setForm({ ...form, thumbnail_url: url || '' })}
                  bucket="media"
                  folder="supplier-videos/thumbnails"
                  label="Upload thumbnail image"
                />
              </div>

              {/* Featured toggle */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_featured}
                  onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                  className="rounded border-gray-300 text-[#5DB347] focus:ring-[#5DB347]"
                />
                <span className="text-sm text-gray-700 flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-yellow-500" /> Mark as featured video
                </span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-100">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#5DB347] text-white rounded-xl font-semibold text-sm hover:bg-[#4a9e39] transition-colors disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {editingId ? 'Update' : 'Add Video'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
