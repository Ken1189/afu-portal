'use client';

import { useState, useEffect } from 'react';
import {
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
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

interface HomepageImages {
  hero_bg_url: string;
  services_bg_url: string;
  programs_bg_url: string;
  cta_bg_url: string;
  about_image_url: string;
}

const defaultImages: HomepageImages = {
  hero_bg_url: '',
  services_bg_url: '',
  programs_bg_url: '',
  cta_bg_url: '',
  about_image_url: '',
};

const IMAGE_FIELDS: { key: keyof HomepageImages; label: string; description: string }[] = [
  { key: 'hero_bg_url', label: 'Hero Background', description: 'Main hero section background image' },
  { key: 'services_bg_url', label: 'Services Background', description: 'Services section background image' },
  { key: 'programs_bg_url', label: 'Programs Background', description: 'Programs section background image' },
  { key: 'cta_bg_url', label: 'CTA Background', description: 'Call-to-action section background image' },
  { key: 'about_image_url', label: 'About Image', description: 'About section featured image' },
];

// ── Main Page ─────────────────────────────────────────────

export default function HomepageImagesPage() {
  const supabase = createClient();
  const [images, setImages] = useState<HomepageImages>(defaultImages);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const { data } = await supabase
          .from('site_config')
          .select('*')
          .eq('key', 'homepage_images')
          .single();
        if (data) {
          const parsed = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
          setImages({ ...defaultImages, ...parsed });
        }
      } catch {
        // Use defaults
      }
      setLoading(false);
    }
    load();
  }, [supabase]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('site_config')
        .upsert(
          {
            key: 'homepage_images',
            value: JSON.stringify(images),
            value_type: 'json',
            category: 'homepage',
            label: 'Homepage Images',
            description: 'Background and section images for the homepage',
          },
          { onConflict: 'key' }
        );
      if (error) throw error;
      setToast({ message: 'Homepage images saved', type: 'success' });
    } catch {
      setToast({ message: 'Failed to save homepage images', type: 'error' });
    }
    setSaving(false);
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
      <div className="max-w-3xl mx-auto mb-8">
        <Link href="/admin/settings" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1B2A4A] mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Settings
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1B2A4A] flex items-center gap-2">
              <ImageIcon className="w-6 h-6 text-[#5DB347]" />
              Homepage Images
            </h1>
            <p className="text-sm text-gray-500 mt-1">Manage background and section images for the homepage</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#5DB347] text-white rounded-xl font-medium text-sm hover:bg-[#4a9a38] disabled:opacity-50 transition-colors shadow-sm"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto space-y-5">
        {IMAGE_FIELDS.map((field) => (
          <div key={field.key} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <label className="block text-sm font-semibold text-[#1B2A4A] mb-0.5">{field.label}</label>
            <p className="text-xs text-gray-500 mb-3">{field.description}</p>
            <input
              type="text"
              value={images[field.key]}
              onChange={(e) => setImages({ ...images, [field.key]: e.target.value })}
              placeholder="https://example.com/image.jpg"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347] outline-none"
            />
            {images[field.key] && (
              <div className="mt-3 rounded-lg overflow-hidden border border-gray-100">
                <img
                  src={images[field.key]}
                  alt={field.label}
                  className="w-full h-40 object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
