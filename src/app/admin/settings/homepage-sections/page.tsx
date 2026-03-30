'use client';

import { useState, useEffect } from 'react';
import {
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  LayoutGrid,
  ArrowUp,
  ArrowDown,
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

interface HomepageSection {
  section: string;
  label: string;
  visible: boolean;
  order: number;
}

const defaultSections: HomepageSection[] = [
  { section: 'hero', label: 'Hero Banner', visible: true, order: 0 },
  { section: 'stats', label: 'Statistics Bar', visible: true, order: 1 },
  { section: 'services', label: 'Services', visible: true, order: 2 },
  { section: 'programs', label: 'Programs', visible: true, order: 3 },
  { section: 'testimonials', label: 'Testimonials', visible: true, order: 4 },
  { section: 'partners', label: 'Partners', visible: true, order: 5 },
  { section: 'membership_preview', label: 'Membership Preview', visible: true, order: 6 },
  { section: 'cta', label: 'Call to Action', visible: true, order: 7 },
  { section: 'blog_preview', label: 'Blog Preview', visible: true, order: 8 },
];

// ── Main Page ─────────────────────────────────────────────

export default function HomepageSectionsPage() {
  const supabase = createClient();
  const [sections, setSections] = useState<HomepageSection[]>(defaultSections);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const { data } = await supabase
          .from('site_config')
          .select('*')
          .eq('key', 'homepage_sections')
          .single();
        if (data) {
          const parsed = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
          if (Array.isArray(parsed) && parsed.length > 0) setSections(parsed);
        }
      } catch {
        // Use defaults
      }
      setLoading(false);
    }
    load();
  }, [supabase]);

  const persist = async (updated: HomepageSection[]) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('site_config')
        .upsert(
          {
            key: 'homepage_sections',
            value: JSON.stringify(updated),
            value_type: 'json',
            category: 'homepage',
            label: 'Homepage Sections',
            description: 'Visibility and ordering of homepage sections',
          },
          { onConflict: 'key' }
        );
      if (error) throw error;
      setSections(updated);
      setToast({ message: 'Homepage sections saved', type: 'success' });
    } catch {
      setToast({ message: 'Failed to save sections', type: 'error' });
    }
    setSaving(false);
  };

  const toggleVisibility = (idx: number) => {
    const updated = [...sections];
    updated[idx] = { ...updated[idx], visible: !updated[idx].visible };
    persist(updated);
  };

  const moveSection = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= sections.length) return;
    const updated = [...sections];
    [updated[idx], updated[target]] = [updated[target], updated[idx]];
    updated.forEach((s, i) => s.order = i);
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
      <div className="max-w-3xl mx-auto mb-8">
        <Link href="/admin/settings" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1B2A4A] mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Settings
        </Link>
        <h1 className="text-2xl font-bold text-[#1B2A4A] flex items-center gap-2">
          <LayoutGrid className="w-6 h-6 text-[#5DB347]" />
          Homepage Sections
        </h1>
        <p className="text-sm text-gray-500 mt-1">Toggle visibility and reorder homepage sections</p>
      </div>

      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="divide-y divide-gray-50">
          {sections.sort((a, b) => a.order - b.order).map((section, idx) => (
            <div key={section.section} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/50 transition-colors">
              {/* Reorder */}
              <div className="flex items-center gap-4">
                <div className="flex flex-col gap-0.5">
                  <button onClick={() => moveSection(idx, -1)} disabled={idx === 0} className="p-0.5 rounded hover:bg-gray-200 disabled:opacity-30 text-gray-400">
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => moveSection(idx, 1)} disabled={idx === sections.length - 1} className="p-0.5 rounded hover:bg-gray-200 disabled:opacity-30 text-gray-400">
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div>
                  <p className="text-sm font-medium text-[#1B2A4A]">{section.label}</p>
                  <p className="text-xs text-gray-400 font-mono">{section.section}</p>
                </div>
              </div>

              {/* Toggle */}
              <button
                onClick={() => toggleVisibility(idx)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${section.visible ? 'bg-[#5DB347]' : 'bg-gray-300'}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${section.visible ? 'translate-x-6' : 'translate-x-1'}`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto mt-4 text-right">
        <p className="text-xs text-gray-400">Changes are saved automatically</p>
      </div>
    </div>
  );
}
