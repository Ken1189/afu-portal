'use client';

import { useState, useEffect } from 'react';
import {
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Palette,
  Image as ImageIcon,
  Type,
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

interface BrandSettings {
  logo_url: string;
  favicon_url: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  font_family: string;
}

const defaultBrand: BrandSettings = {
  logo_url: '',
  favicon_url: '',
  primary_color: '#5DB347',
  secondary_color: '#1B2A4A',
  accent_color: '#8CB89C',
  font_family: 'Inter',
};

// ── Main Page ─────────────────────────────────────────────

export default function BrandSettingsPage() {
  const supabase = createClient();
  const [brand, setBrand] = useState<BrandSettings>(defaultBrand);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const { data } = await supabase
          .from('site_config')
          .select('*')
          .eq('key', 'brand_settings')
          .single();
        if (data) {
          const parsed = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
          setBrand({ ...defaultBrand, ...parsed });
        }
      } catch {
        // Use defaults if not found
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
            key: 'brand_settings',
            value: JSON.stringify(brand),
            value_type: 'json',
            category: 'branding',
            label: 'Brand Settings',
            description: 'Logo, favicon, colors, and font settings',
          },
          { onConflict: 'key' }
        );
      if (error) throw error;
      setToast({ message: 'Brand settings saved', type: 'success' });
    } catch {
      setToast({ message: 'Failed to save brand settings', type: 'error' });
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
              <Palette className="w-6 h-6 text-[#5DB347]" />
              Brand Settings
            </h1>
            <p className="text-sm text-gray-500 mt-1">Manage logo, colors, and typography</p>
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

      <div className="max-w-3xl mx-auto space-y-6">
        {/* Asset URLs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-semibold text-[#1B2A4A] flex items-center gap-2 mb-4">
            <ImageIcon className="w-5 h-5 text-[#5DB347]" />
            Brand Assets
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
              <input
                type="text"
                value={brand.logo_url}
                onChange={(e) => setBrand({ ...brand, logo_url: e.target.value })}
                placeholder="https://example.com/logo.png"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347] outline-none"
              />
              {brand.logo_url && (
                <div className="mt-2 p-3 bg-gray-50 rounded-lg inline-block">
                  <img src={brand.logo_url} alt="Logo preview" className="h-12 object-contain" />
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Favicon URL</label>
              <input
                type="text"
                value={brand.favicon_url}
                onChange={(e) => setBrand({ ...brand, favicon_url: e.target.value })}
                placeholder="https://example.com/favicon.ico"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347] outline-none"
              />
              {brand.favicon_url && (
                <div className="mt-2 p-3 bg-gray-50 rounded-lg inline-block">
                  <img src={brand.favicon_url} alt="Favicon preview" className="h-8 object-contain" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Colors */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-semibold text-[#1B2A4A] flex items-center gap-2 mb-4">
            <Palette className="w-5 h-5 text-[#5DB347]" />
            Brand Colors
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { key: 'primary_color' as const, label: 'Primary Color' },
              { key: 'secondary_color' as const, label: 'Secondary Color' },
              { key: 'accent_color' as const, label: 'Accent Color' },
            ].map((c) => (
              <div key={c.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{c.label}</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={brand[c.key]}
                    onChange={(e) => setBrand({ ...brand, [c.key]: e.target.value })}
                    className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={brand[c.key]}
                    onChange={(e) => setBrand({ ...brand, [c.key]: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347] outline-none"
                  />
                </div>
                <div className="mt-2 h-8 rounded-lg" style={{ backgroundColor: brand[c.key] }} />
              </div>
            ))}
          </div>
        </div>

        {/* Typography */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-semibold text-[#1B2A4A] flex items-center gap-2 mb-4">
            <Type className="w-5 h-5 text-[#5DB347]" />
            Typography
          </h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Font Family</label>
            <select
              value={brand.font_family}
              onChange={(e) => setBrand({ ...brand, font_family: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347] outline-none"
            >
              {['Inter', 'Roboto', 'Open Sans', 'Lato', 'Poppins', 'Montserrat', 'Nunito', 'Source Sans Pro'].map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
            <p className="mt-2 text-sm text-gray-500" style={{ fontFamily: brand.font_family }}>
              Preview: The quick brown fox jumps over the lazy dog. 0123456789
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
