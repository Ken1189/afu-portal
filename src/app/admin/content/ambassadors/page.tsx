'use client';

/**
 * Dedicated Content Editor for /ambassadors
 *
 * Every piece of copy on the live page is editable here.
 * Saves to site_config key 'page_chrome_ambassadors'.
 * The live page reads the same key and falls back to hardcoded defaults.
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import {
  Save, Loader2, CheckCircle2, AlertCircle, ArrowLeft, Eye, RotateCcw, Plus, Trash2,
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

// ── Types ─────────────────────────────────────────────

type Step = { title: string; description: string };
type Tier = { name: string; minReferrals: number; commission: string; perks: string[] };
type CommissionRate = { label: string; amount: string; description: string };

type FormShape = {
  hero_badge: string;
  hero_title: string;
  hero_subtitle: string;
  hero_cta_text: string;
  stat1_value: string;
  stat1_label: string;
  stat2_value: string;
  stat2_label: string;
  stat3_value: string;
  stat3_label: string;
  how_it_works_title: string;
  how_it_works_subtitle: string;
  how_it_works_steps: Step[];
  commission_title: string;
  commission_subtitle: string;
  commission_footer: string;
  commission_rates: CommissionRate[];
  tiers_title: string;
  tiers_subtitle: string;
  tiers: Tier[];
  ambassadors_section_title: string;
  ambassadors_section_subtitle: string;
  apply_title: string;
  apply_subtitle: string;
  apply_success_heading: string;
  apply_success_message: string;
  form_review_note: string;
};

// ── Current live defaults (match /ambassadors/page.tsx exactly) ─────

const LIVE_DEFAULTS: FormShape = {
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
  how_it_works_subtitle: 'Start earning in four simple steps. No experience required.',
  how_it_works_steps: [
    { title: 'Sign Up', description: 'Apply to join the ambassador programme and get approved within 48 hours' },
    { title: 'Share Your Link', description: 'Get a unique referral link and share it with farmers, suppliers, and investors' },
    { title: 'Farmers Join', description: 'When people sign up through your link, they are tracked to your account' },
    { title: 'Earn Commissions', description: 'Get paid for every signup, transaction, and milestone your referrals achieve' },
  ],
  commission_title: 'Commission Structure',
  commission_subtitle: 'Multiple revenue streams to maximise your earnings',
  commission_footer: 'Rates are configurable by admin and may vary by region and tier level.',
  commission_rates: [
    { label: 'Membership Fees', amount: '10% recurring', description: 'Earn 10% of every membership fee your referrals pay — every month, for life' },
    { label: 'Fundraising $100K-$500K', amount: '2%', description: 'Commission on capital raised between $100K and $500K' },
    { label: 'Fundraising $500K-$1M', amount: '2.5%', description: 'Commission on capital raised between $500K and $1M' },
    { label: 'Fundraising $1M-$5M', amount: '5%', description: 'Commission on capital raised between $1M and $5M' },
    { label: 'Fundraising $5M-$10M', amount: '7.5%', description: 'Commission on capital raised between $5M and $10M' },
    { label: 'Fundraising $100M+', amount: '10%', description: 'Commission on capital raised above $100M' },
  ],
  tiers_title: 'Ambassador Tiers',
  tiers_subtitle: 'The more you grow, the more you earn. Advance through tiers as you bring new members to AFU.',
  tiers: [
    { name: 'Bronze', minReferrals: 0, commission: '2%', perks: ['Base commission rate', 'Ambassador dashboard', 'Referral link'] },
    { name: 'Silver', minReferrals: 10, commission: '4%', perks: ['Increased commission', 'Monthly bonus', 'Priority email support'] },
    { name: 'Gold', minReferrals: 25, commission: '6%', perks: ['Premium commission', 'Quarterly bonus', 'Priority support'] },
    { name: 'Platinum', minReferrals: 50, commission: '8%', perks: ['Top commission rate', 'Exclusive events', 'Dedicated manager'] },
    { name: 'Diamond', minReferrals: 100, commission: '10%', perks: ['Maximum commission', 'Advisory role', 'Revenue sharing'] },
  ],
  ambassadors_section_title: 'Our Ambassadors',
  ambassadors_section_subtitle: "The people driving Africa's agricultural revolution",
  apply_title: 'Apply to Become an Ambassador',
  apply_subtitle: 'Join our network of ambassadors across Africa and start earning commissions today.',
  apply_success_heading: 'Application Submitted!',
  apply_success_message: "Thank you for your interest in becoming an AFU Ambassador. We review applications within 48 hours. You'll receive a confirmation email shortly.",
  form_review_note: 'Your application will be reviewed within 48 hours.',
};

// ── Main Page ─────────────────────────────────────────────

export default function AmbassadorsContentEditor() {
  const supabase = createClient();
  const [form, setForm] = useState<FormShape>(LIVE_DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [dbLoaded, setDbLoaded] = useState(false);

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

  const updateField = <K extends keyof FormShape>(key: K, value: FormShape[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // Step helpers
  const updateStep = (idx: number, key: keyof Step, value: string) => {
    setForm((prev) => ({
      ...prev,
      how_it_works_steps: prev.how_it_works_steps.map((s, i) => (i === idx ? { ...s, [key]: value } : s)),
    }));
  };
  const addStep = () => setForm((p) => ({ ...p, how_it_works_steps: [...p.how_it_works_steps, { title: '', description: '' }] }));
  const removeStep = (idx: number) => setForm((p) => ({ ...p, how_it_works_steps: p.how_it_works_steps.filter((_, i) => i !== idx) }));

  // Tier helpers
  const updateTier = (idx: number, key: keyof Tier, value: string | number | string[]) => {
    setForm((prev) => ({
      ...prev,
      tiers: prev.tiers.map((t, i) => (i === idx ? { ...t, [key]: value } : t)),
    }));
  };
  const updateTierPerk = (tierIdx: number, perkIdx: number, value: string) => {
    setForm((prev) => ({
      ...prev,
      tiers: prev.tiers.map((t, i) =>
        i === tierIdx ? { ...t, perks: t.perks.map((p, j) => (j === perkIdx ? value : p)) } : t,
      ),
    }));
  };
  const addTierPerk = (tierIdx: number) => {
    setForm((prev) => ({
      ...prev,
      tiers: prev.tiers.map((t, i) => (i === tierIdx ? { ...t, perks: [...t.perks, ''] } : t)),
    }));
  };
  const removeTierPerk = (tierIdx: number, perkIdx: number) => {
    setForm((prev) => ({
      ...prev,
      tiers: prev.tiers.map((t, i) => (i === tierIdx ? { ...t, perks: t.perks.filter((_, j) => j !== perkIdx) } : t)),
    }));
  };
  const addTier = () => setForm((p) => ({ ...p, tiers: [...p.tiers, { name: '', minReferrals: 0, commission: '', perks: [] }] }));
  const removeTier = (idx: number) => setForm((p) => ({ ...p, tiers: p.tiers.filter((_, i) => i !== idx) }));

  // Commission rate helpers
  const updateRate = (idx: number, key: keyof CommissionRate, value: string) => {
    setForm((prev) => ({
      ...prev,
      commission_rates: prev.commission_rates.map((r, i) => (i === idx ? { ...r, [key]: value } : r)),
    }));
  };
  const addRate = () => setForm((p) => ({ ...p, commission_rates: [...p.commission_rates, { label: '', amount: '', description: '' }] }));
  const removeRate = (idx: number) => setForm((p) => ({ ...p, commission_rates: p.commission_rates.filter((_, i) => i !== idx) }));

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

        {/* How It Works */}
        <Section title="How It Works" description="The four-step explainer section">
          <Field label="Section title" value={form.how_it_works_title} onChange={(v) => updateField('how_it_works_title', v)} />
          <Field label="Section subtitle" value={form.how_it_works_subtitle} onChange={(v) => updateField('how_it_works_subtitle', v)} multiline />
          <div className="space-y-3 pt-2">
            {form.how_it_works_steps.map((step, idx) => (
              <div key={idx} className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500">Step {idx + 1}</span>
                  <button type="button" onClick={() => removeStep(idx)} className="text-red-500 hover:text-red-700 text-xs inline-flex items-center gap-1">
                    <Trash2 className="w-3 h-3" /> Remove
                  </button>
                </div>
                <Field label="Title" value={step.title} onChange={(v) => updateStep(idx, 'title', v)} />
                <Field label="Description" value={step.description} onChange={(v) => updateStep(idx, 'description', v)} multiline />
              </div>
            ))}
            <button type="button" onClick={addStep} className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-[#5DB347] border border-[#5DB347]/30 rounded-lg hover:bg-[#5DB347]/5">
              <Plus className="w-4 h-4" /> Add step
            </button>
          </div>
        </Section>

        {/* Commission Structure */}
        <Section title="Commission Structure" description="Commission rates shown as cards">
          <Field label="Section title" value={form.commission_title} onChange={(v) => updateField('commission_title', v)} />
          <Field label="Section subtitle" value={form.commission_subtitle} onChange={(v) => updateField('commission_subtitle', v)} multiline />
          <Field label="Footer note (below the cards)" value={form.commission_footer} onChange={(v) => updateField('commission_footer', v)} multiline />
          <div className="space-y-3 pt-2">
            {form.commission_rates.map((rate, idx) => (
              <div key={idx} className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500">Rate {idx + 1}</span>
                  <button type="button" onClick={() => removeRate(idx)} className="text-red-500 hover:text-red-700 text-xs inline-flex items-center gap-1">
                    <Trash2 className="w-3 h-3" /> Remove
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Label" value={rate.label} onChange={(v) => updateRate(idx, 'label', v)} />
                  <Field label="Amount (e.g. '5%')" value={rate.amount} onChange={(v) => updateRate(idx, 'amount', v)} />
                </div>
                <Field label="Description" value={rate.description} onChange={(v) => updateRate(idx, 'description', v)} multiline />
              </div>
            ))}
            <button type="button" onClick={addRate} className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-[#5DB347] border border-[#5DB347]/30 rounded-lg hover:bg-[#5DB347]/5">
              <Plus className="w-4 h-4" /> Add commission rate
            </button>
          </div>
        </Section>

        {/* Tiers */}
        <Section title="Ambassador Tiers" description="Tier cards (Bronze, Silver, Gold, etc.)">
          <Field label="Section title" value={form.tiers_title} onChange={(v) => updateField('tiers_title', v)} />
          <Field label="Section subtitle" value={form.tiers_subtitle} onChange={(v) => updateField('tiers_subtitle', v)} multiline />
          <div className="space-y-3 pt-2">
            {form.tiers.map((tier, idx) => (
              <div key={idx} className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500">Tier {idx + 1}</span>
                  <button type="button" onClick={() => removeTier(idx)} className="text-red-500 hover:text-red-700 text-xs inline-flex items-center gap-1">
                    <Trash2 className="w-3 h-3" /> Remove
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Field label="Name" value={tier.name} onChange={(v) => updateTier(idx, 'name', v)} />
                  <Field label="Min referrals" value={String(tier.minReferrals)} onChange={(v) => updateTier(idx, 'minReferrals', Number(v) || 0)} />
                  <Field label="Commission (e.g. '6%')" value={tier.commission} onChange={(v) => updateTier(idx, 'commission', v)} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Perks</label>
                  <div className="space-y-2">
                    {tier.perks.map((perk, perkIdx) => (
                      <div key={perkIdx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={perk}
                          onChange={(e) => updateTierPerk(idx, perkIdx, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347] outline-none"
                        />
                        <button type="button" onClick={() => removeTierPerk(idx, perkIdx)} className="text-red-500 hover:text-red-700 p-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button type="button" onClick={() => addTierPerk(idx)} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-[#5DB347] border border-[#5DB347]/30 rounded-md hover:bg-[#5DB347]/5">
                      <Plus className="w-3 h-3" /> Add perk
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <button type="button" onClick={addTier} className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-[#5DB347] border border-[#5DB347]/30 rounded-lg hover:bg-[#5DB347]/5">
              <Plus className="w-4 h-4" /> Add tier
            </button>
          </div>
        </Section>

        {/* Ambassadors list section */}
        <Section title="Our Ambassadors Section" description="The header above the ambassador profile cards">
          <Field label="Section title" value={form.ambassadors_section_title} onChange={(v) => updateField('ambassadors_section_title', v)} />
          <Field label="Section subtitle" value={form.ambassadors_section_subtitle} onChange={(v) => updateField('ambassadors_section_subtitle', v)} multiline />
          <p className="text-xs text-gray-400 mt-1">
            To add/edit individual ambassador profiles, go to <Link href="/admin/ambassadors" className="text-[#5DB347] hover:underline">Admin → Ambassadors</Link>.
          </p>
        </Section>

        {/* Apply form */}
        <Section title="Apply Form Section" description="The application form at the bottom of the page">
          <Field label="Form section title" value={form.apply_title} onChange={(v) => updateField('apply_title', v)} />
          <Field label="Form section subtitle" value={form.apply_subtitle} onChange={(v) => updateField('apply_subtitle', v)} multiline />
          <Field label="Review note (below the submit button)" value={form.form_review_note} onChange={(v) => updateField('form_review_note', v)} multiline />
          <Field label="Success heading (after submit)" value={form.apply_success_heading} onChange={(v) => updateField('apply_success_heading', v)} />
          <Field label="Success message" value={form.apply_success_message} onChange={(v) => updateField('apply_success_message', v)} multiline />
        </Section>
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
