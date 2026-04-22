'use client';

/**
 * Dedicated Content Editor for /ambassadors
 *
 * Follows the pattern established in /admin/settings/homepage-services:
 * - Shows the ACTUAL current fields on the live page
 * - Pre-populates with current live values (not empty defaults)
 * - Saves to site_config key 'page_chrome_ambassadors'
 * - Live page reads same key with fallback to hardcoded defaults
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import {
  Save, Loader2, CheckCircle2, AlertCircle, ArrowLeft, Eye, RotateCcw,
} from 'lucide-react';

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

// ── Current live defaults (match /ambassadors/page.tsx exactly) ─────

const LIVE_DEFAULTS = {
  hero_badge: 'Ambassador Program',
  hero_title: '',
  hero_subtitle: "Earn commissions by connecting farmers, suppliers, and investors to Africa's largest agricultural platform",
  hero_cta_text: 'Apply Now',
  stat1_value: '500+',
  stat1_label: 'Ambassadors',
  stat2_value: '20',
  stat2_label: 'Countries',
  stat3_value: '15%',
  stat3_label: 'Earn Up To',
  how_it_works_title: 'How It Works',
  tiers_title: 'Ambassador Tiers',
  apply_title: 'Apply to Become an Ambassador',
};

type FormShape = typeof LIVE_DEFAULTS;

// ── Main Page ─────────────────────────────────────────────

export default function AmbassadorsContentEditor() {
  const supabase = createClient();
  const [form, setForm] = useState<FormShape>(LIVE_DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [dbLoaded, setDbLoaded] = useState(false);

  // Load current DB values (if any), otherwise show live defaults
  useEffect(() => {
    async function load() {
      try {
        const { data } = await supabase
          .from('site_config')
          .select('value')
          .eq('key', 'page_chrome_ambassadors')
          .maybeSingle();
        if (data?.value) {
          const parsed = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
          // Merge with defaults so any new fields also show
          setForm({ ...LIVE_DEFAULTS, ...parsed });
          setDbLoaded(true);
        }
      } catch {
        // keep defaults
      }
      setLoading(false);
    }
    load();
  }, [supabase]);

  const updateField = (key: keyof FormShape, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const save = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('site_config')
        .upsert(
          {
            key: 'page_chrome_ambassadors',
            value: JSON.stringify(form),
            value_type: 'json',
            category: 'content',
            label: 'Ambassadors Page Content',
            description: 'Editable copy for /ambassadors page',
          },
          { onConflict: 'key' },
        );
      if (error) throw error;
      setToast({ message: 'Saved. Refresh /ambassadors to see changes.', type: 'success' });
      setDbLoaded(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Save failed';
      setToast({ message: msg, type: 'error' });
    }
    setSaving(false);
  };

  const resetToDefaults = () => {
    if (!confirm('Reset all fields to the current live defaults? Unsaved changes will be lost.')) return;
    setForm(LIVE_DEFAULTS);
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
      <div className="max-w-3xl mx-auto mb-6">
        <Link href="/admin" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1B2A4A] mb-3">
          <ArrowLeft className="w-4 h-4" /> Back to Admin
        </Link>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-[#1B2A4A]">Ambassadors Page</h1>
            <p className="text-sm text-gray-500 mt-1">
              Edit the text on <Link href="/ambassadors" target="_blank" className="text-[#5DB347] hover:underline inline-flex items-center gap-1">/ambassadors <Eye className="w-3 h-3" /></Link>.
              {!dbLoaded && (
                <span className="ml-2 text-amber-600 font-medium">Showing current live defaults — not yet saved to DB.</span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={resetToDefaults}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:text-[#1B2A4A] rounded-lg hover:bg-gray-100"
              type="button"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset to defaults
            </button>
            <button
              onClick={save}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#5DB347] text-white rounded-xl font-medium text-sm hover:bg-[#4a9a38] disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save
            </button>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Hero */}
        <Section title="Hero" description="The big banner at the top of the page">
          <Field label="Badge text (small label above headline)" value={form.hero_badge} onChange={(v) => updateField('hero_badge', v)} />
          <Field label="Hero title (leave empty to show default)" value={form.hero_title} onChange={(v) => updateField('hero_title', v)} placeholder="Default headline is used when empty" />
          <Field label="Hero subtitle" value={form.hero_subtitle} onChange={(v) => updateField('hero_subtitle', v)} multiline />
          <Field label="Call-to-action button text" value={form.hero_cta_text} onChange={(v) => updateField('hero_cta_text', v)} />
        </Section>

        {/* Stats */}
        <Section title="Stats Row" description="Three stats shown under the hero">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Stat 1 — Value" value={form.stat1_value} onChange={(v) => updateField('stat1_value', v)} />
            <Field label="Stat 1 — Label" value={form.stat1_label} onChange={(v) => updateField('stat1_label', v)} />
            <Field label="Stat 2 — Value" value={form.stat2_value} onChange={(v) => updateField('stat2_value', v)} />
            <Field label="Stat 2 — Label" value={form.stat2_label} onChange={(v) => updateField('stat2_label', v)} />
            <Field label="Stat 3 — Value" value={form.stat3_value} onChange={(v) => updateField('stat3_value', v)} />
            <Field label="Stat 3 — Label" value={form.stat3_label} onChange={(v) => updateField('stat3_label', v)} />
          </div>
        </Section>

        {/* Section titles */}
        <Section title="Section Titles" description="The headlines for each section on the page">
          <Field label="'How It Works' section title" value={form.how_it_works_title} onChange={(v) => updateField('how_it_works_title', v)} />
          <Field label="'Ambassador Tiers' section title" value={form.tiers_title} onChange={(v) => updateField('tiers_title', v)} />
          <Field label="Apply form section title" value={form.apply_title} onChange={(v) => updateField('apply_title', v)} />
        </Section>

        {/* Footer info */}
        <div className="bg-[#F0F4F8] border border-[#1B2A4A]/10 rounded-xl p-4 text-sm text-[#1B2A4A]">
          <p className="font-medium mb-1">What&apos;s NOT editable here (yet):</p>
          <ul className="list-disc list-inside text-xs text-gray-600 space-y-1">
            <li>The 4 &quot;How It Works&quot; steps (Sign Up, Share Your Link, Farmers Join, Earn Commissions)</li>
            <li>Ambassador tier names, amounts, and descriptions</li>
            <li>The commission rates (Signup, Transaction, Milestone)</li>
            <li>Featured ambassador cards (managed via /admin/ambassadors)</li>
            <li>The application form fields</li>
          </ul>
          <p className="text-xs text-gray-500 mt-2">These are still hardcoded. Tell Claude which ones you want editable next.</p>
        </div>
      </div>
    </div>
  );
}

// ── Helpers ─────────────────────────────────────────────

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div className="mb-4">
        <h2 className="text-base font-bold text-[#1B2A4A]">{title}</h2>
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={2}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347] outline-none resize-none"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347] outline-none"
        />
      )}
    </div>
  );
}
