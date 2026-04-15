'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
  Layers, Plus, Pencil, Trash2, Save, Loader2, X,
  CheckCircle2, AlertCircle, Eye, EyeOff, GripVertical,
  ArrowUp, ArrowDown,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import ImageUploader from '@/components/ui/ImageUploader';

/* ─── Types ─── */
interface HeroSlide {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  image_url: string;
  cta_text: string;
  cta_link: string;
  display_order: number;
  visible: boolean;
  slide_duration: number;
  created_at: string;
}

interface FormData {
  title: string;
  subtitle: string;
  description: string;
  image_url: string;
  cta_text: string;
  cta_link: string;
  display_order: number;
  visible: boolean;
  slide_duration: number;
}

const EMPTY_FORM: FormData = {
  title: '',
  subtitle: '',
  description: '',
  image_url: '',
  cta_text: 'Learn More',
  cta_link: '/about',
  display_order: 0,
  visible: true,
  slide_duration: 5000,
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

export default function AdminHeroSlidesPage() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<HeroSlide | null>(null);
  const [deleting, setDeleting] = useState(false);

  const supabase = createClient();

  const fetchSlides = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('hero_slides')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      setSlides((data || []) as HeroSlide[]);
    } catch (err) {
      console.error('[hero-slides] fetch error:', err);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { fetchSlides(); }, [fetchSlides]);

  const openCreate = () => {
    setEditingId(null);
    setFormData({ ...EMPTY_FORM, display_order: slides.length });
    setShowModal(true);
  };

  const openEdit = (slide: HeroSlide) => {
    setEditingId(slide.id);
    setFormData({
      title: slide.title,
      subtitle: slide.subtitle || '',
      description: slide.description || '',
      image_url: slide.image_url,
      cta_text: slide.cta_text || 'Learn More',
      cta_link: slide.cta_link || '/about',
      display_order: slide.display_order,
      visible: slide.visible,
      slide_duration: slide.slide_duration || 5000,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.image_url) {
      setToast({ message: 'Title and image are required', type: 'error' });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: formData.title,
        subtitle: formData.subtitle || null,
        description: formData.description || null,
        image_url: formData.image_url,
        cta_text: formData.cta_text || 'Learn More',
        cta_link: formData.cta_link || '/about',
        display_order: formData.display_order,
        visible: formData.visible,
        slide_duration: formData.slide_duration || 5000,
        updated_at: new Date().toISOString(),
      };

      if (editingId) {
        const { error } = await supabase.from('hero_slides').update(payload).eq('id', editingId);
        if (error) throw error;
        setToast({ message: 'Slide updated', type: 'success' });
      } else {
        const { error } = await supabase.from('hero_slides').insert(payload);
        if (error) throw error;
        setToast({ message: 'Slide created', type: 'success' });
      }
      setShowModal(false);
      fetchSlides();
    } catch (err) {
      console.error('[hero-slides] save error:', err);
      setToast({ message: 'Failed to save slide', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const { error } = await supabase.from('hero_slides').delete().eq('id', deleteTarget.id);
      if (error) throw error;
      setToast({ message: 'Slide deleted', type: 'success' });
      setDeleteTarget(null);
      fetchSlides();
    } catch {
      setToast({ message: 'Failed to delete slide', type: 'error' });
    } finally {
      setDeleting(false);
    }
  };

  const toggleVisibility = async (slide: HeroSlide) => {
    try {
      const { error } = await supabase
        .from('hero_slides')
        .update({ visible: !slide.visible, updated_at: new Date().toISOString() })
        .eq('id', slide.id);
      if (error) throw error;
      fetchSlides();
    } catch {
      setToast({ message: 'Failed to toggle visibility', type: 'error' });
    }
  };

  const moveSlide = async (slide: HeroSlide, direction: 'up' | 'down') => {
    const idx = slides.findIndex((s) => s.id === slide.id);
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= slides.length) return;

    const otherSlide = slides[swapIdx];
    try {
      await Promise.all([
        supabase.from('hero_slides').update({ display_order: otherSlide.display_order }).eq('id', slide.id),
        supabase.from('hero_slides').update({ display_order: slide.display_order }).eq('id', otherSlide.id),
      ]);
      fetchSlides();
    } catch {
      setToast({ message: 'Failed to reorder', type: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#5DB347' }}>
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#1B2A4A' }}>Homepage Slides</h1>
            <p className="text-gray-500 text-sm">{slides.length} slides (max 4 shown on homepage)</p>
          </div>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-medium"
          style={{ background: '#5DB347' }}
        >
          <Plus className="w-4 h-4" />
          Add Slide
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-[#5DB347]" />
          </div>
        ) : slides.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Layers className="w-10 h-10 mb-3" />
            <p className="text-lg font-medium">No slides yet</p>
            <p className="text-sm">Add your first homepage slide</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600 w-12">Order</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 w-20">Image</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Title</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Subtitle</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">CTA</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Link</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Duration</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Visible</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {slides.map((slide, idx) => (
                <tr key={slide.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <GripVertical className="w-4 h-4 text-gray-300" />
                      <div className="flex flex-col">
                        <button
                          onClick={() => moveSlide(slide, 'up')}
                          disabled={idx === 0}
                          className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => moveSlide(slide, 'down')}
                          disabled={idx === slides.length - 1}
                          className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="w-16 h-10 rounded-lg overflow-hidden bg-gray-100">
                      <Image src={slide.image_url} alt={slide.title} className="w-full h-full object-cover" width={64} height={40} unoptimized />
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-[#1B2A4A]">{slide.title}</td>
                  <td className="px-4 py-3 text-gray-500 truncate max-w-[200px]">{slide.subtitle || '-'}</td>
                  <td className="px-4 py-3 text-gray-600">{slide.cta_text}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{slide.cta_link}</td>
                  <td className="px-4 py-3 text-center text-gray-500">{(slide.slide_duration / 1000).toFixed(0)}s</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleVisibility(slide)}
                      className={`p-1.5 rounded-lg transition-colors ${slide.visible ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}
                    >
                      {slide.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => openEdit(slide)} className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteTarget(slide)} className="p-1.5 rounded-lg text-red-600 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold" style={{ color: '#1B2A4A' }}>
                {editingId ? 'Edit Slide' : 'Add New Slide'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none"
                  placeholder="Slide title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none"
                  placeholder="Optional subtitle"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none resize-none"
                  placeholder="Optional longer description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Slide Image *</label>
                <ImageUploader
                  bucket="media"
                  folder="hero-slides"
                  value={formData.image_url}
                  onChange={(url) => setFormData({ ...formData, image_url: url })}
                  allowUrl
                  label="Upload slide image"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CTA Button Text</label>
                  <input
                    type="text"
                    value={formData.cta_text}
                    onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none"
                    placeholder="Learn More"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CTA Link</label>
                  <input
                    type="text"
                    value={formData.cta_link}
                    onChange={(e) => setFormData({ ...formData, cta_link: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none"
                    placeholder="/about"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none"
                    min={0}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slide Duration (ms)</label>
                  <input
                    type="number"
                    value={formData.slide_duration}
                    onChange={(e) => setFormData({ ...formData, slide_duration: parseInt(e.target.value) || 5000 })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none"
                    min={1000}
                    step={500}
                  />
                  <p className="text-xs text-gray-400 mt-1">{(formData.slide_duration / 1000).toFixed(1)} seconds</p>
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, visible: !formData.visible })}
                  className={`relative w-11 h-6 rounded-full transition-colors ${formData.visible ? 'bg-[#5DB347]' : 'bg-gray-200'}`}
                >
                  <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow ${formData.visible ? 'translate-x-5' : ''}`} />
                </button>
                <span className="text-sm font-medium text-gray-700">Visible on homepage</span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-white text-sm font-medium disabled:opacity-50"
                style={{ background: '#5DB347' }}
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {editingId ? 'Update' : 'Create'} Slide
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-2" style={{ color: '#1B2A4A' }}>Delete Slide</h3>
            <p className="text-gray-600 text-sm mb-6">
              Are you sure you want to delete &quot;{deleteTarget.title}&quot;? This cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-medium disabled:opacity-50"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
