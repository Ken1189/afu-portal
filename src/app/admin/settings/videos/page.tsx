'use client';

import { useState, useEffect } from 'react';
import {
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Video,
  Plus,
  Trash2,
  Pencil,
  X,
  Star,
  ArrowLeft,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

// ── Toast ─────────────────────────────────────────────────

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
      {type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
      {message}
    </div>
  );
}

// ── Types ─────────────────────────────────────────────────

interface VideoItem {
  id: string;
  title: string;
  description: string;
  youtube_url: string;
  thumbnail_url: string;
  is_featured: boolean;
}

const emptyVideo: Omit<VideoItem, 'id'> = {
  title: '',
  description: '',
  youtube_url: '',
  thumbnail_url: '',
  is_featured: false,
};

const defaultVideos: VideoItem[] = [
  { id: '1', title: 'Platform Overview', description: 'Learn how AFU connects farmers with finance', youtube_url: '', thumbnail_url: '', is_featured: true },
  { id: '2', title: 'Farmer Stories', description: 'Real stories from farmers using AFU', youtube_url: '', thumbnail_url: '', is_featured: false },
  { id: '3', title: 'How It Works', description: 'Step-by-step guide to using the platform', youtube_url: '', thumbnail_url: '', is_featured: false },
  { id: '4', title: 'Impact Report', description: 'Our impact across Africa', youtube_url: '', thumbnail_url: '', is_featured: false },
];

// ── Main Page ─────────────────────────────────────────────

export default function VideoSectionPage() {
  const supabase = createClient();
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<VideoItem, 'id'>>(emptyVideo);

  useEffect(() => {
    async function load() {
      try {
        const { data } = await supabase
          .from('site_config')
          .select('*')
          .eq('key', 'video_section')
          .single();
        if (data) {
          const parsed = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
          setVideos(Array.isArray(parsed) ? parsed : defaultVideos);
        } else {
          setVideos(defaultVideos);
        }
      } catch {
        setVideos(defaultVideos);
      }
      setLoading(false);
    }
    load();
  }, [supabase]);

  const persist = async (updated: VideoItem[]) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('site_config')
        .upsert(
          {
            key: 'video_section',
            value: JSON.stringify(updated),
            value_type: 'json',
            category: 'media',
            label: 'Video Section',
            description: 'Homepage and about page video content',
          },
          { onConflict: 'key' }
        );
      if (error) throw error;
      setVideos(updated);
      setToast({ message: 'Videos saved', type: 'success' });
    } catch {
      setToast({ message: 'Failed to save videos', type: 'error' });
    }
    setSaving(false);
  };

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyVideo);
    setModalOpen(true);
  };

  const openEdit = (v: VideoItem) => {
    setEditingId(v.id);
    setForm({ title: v.title, description: v.description, youtube_url: v.youtube_url, thumbnail_url: v.thumbnail_url, is_featured: v.is_featured });
    setModalOpen(true);
  };

  const handleSubmit = () => {
    if (!form.title.trim()) return;
    let updated: VideoItem[];
    if (editingId) {
      updated = videos.map((v) => v.id === editingId ? { ...v, ...form } : v);
    } else {
      updated = [...videos, { ...form, id: crypto.randomUUID() }];
    }
    setModalOpen(false);
    persist(updated);
  };

  const handleDelete = (id: string) => {
    const updated = videos.filter((v) => v.id !== id);
    persist(updated);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-[#5DB347] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/60 p-6 md:p-10">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <Link href="/admin/settings" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1B2A4A] mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Settings
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1B2A4A] flex items-center gap-2">
              <Video className="w-6 h-6 text-[#5DB347]" />
              Video Section
            </h1>
            <p className="text-sm text-gray-500 mt-1">Manage homepage and about page videos</p>
          </div>
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#5DB347] text-white rounded-xl font-medium text-sm hover:bg-[#4a9a38] transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Video
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="text-left px-5 py-3 font-medium text-gray-600">Title</th>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Description</th>
              <th className="text-center px-5 py-3 font-medium text-gray-600">Featured</th>
              <th className="text-right px-5 py-3 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {videos.map((v) => (
              <tr key={v.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                <td className="px-5 py-3 font-medium text-[#1B2A4A]">{v.title}</td>
                <td className="px-5 py-3 text-gray-600 truncate max-w-[200px]">{v.description}</td>
                <td className="px-5 py-3 text-center">
                  {v.is_featured && <Star className="w-4 h-4 text-amber-500 mx-auto fill-amber-500" />}
                </td>
                <td className="px-5 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => openEdit(v)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#1B2A4A]">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(v.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {videos.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-10 text-center text-gray-400">No videos configured</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#1B2A4A]">{editingId ? 'Edit Video' : 'Add Video'}</h2>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347] outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347] outline-none resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">YouTube URL</label>
                <input
                  type="text"
                  value={form.youtube_url}
                  onChange={(e) => setForm({ ...form, youtube_url: e.target.value })}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347] outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail URL</label>
                <input
                  type="text"
                  value={form.thumbnail_url}
                  onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })}
                  placeholder="https://example.com/thumb.jpg"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347] outline-none"
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.is_featured}
                  onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                  className="rounded border-gray-300 text-[#5DB347] focus:ring-[#5DB347]"
                />
                <span className="text-gray-700">Featured video</span>
              </label>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100">Cancel</button>
              <button
                onClick={handleSubmit}
                disabled={saving || !form.title.trim()}
                className="px-5 py-2 text-sm bg-[#5DB347] text-white rounded-xl font-medium hover:bg-[#4a9a38] disabled:opacity-50 inline-flex items-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {editingId ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
