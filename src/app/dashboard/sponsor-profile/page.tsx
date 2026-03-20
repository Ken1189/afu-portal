'use client';

import { useState, useEffect, useCallback, KeyboardEvent } from 'react';
import { useAuth } from '@/lib/supabase/auth-context';
import { createClient } from '@/lib/supabase/client';
import {
  Heart,
  Copy,
  CheckCircle2,
  ExternalLink,
  Camera,
  Loader2,
  Send,
  ChevronRight,
  ChevronLeft,
  X,
  Plus,
} from 'lucide-react';

// ── Supabase client ──
const supabase = createClient();

// ── Constants ──
const AFU_COUNTRIES = [
  'Botswana',
  'Zimbabwe',
  'Tanzania',
  'Kenya',
  'South Africa',
  'Nigeria',
  'Zambia',
  'Mozambique',
  'Sierra Leone',
];

// ── Slug generator ──
function generateSlug(name: string): string {
  const base = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base}-${suffix}`;
}

// ── Types ──
interface FarmerProfile {
  id: string;
  member_id: string;
  display_name: string;
  story: string;
  farm_description: string;
  crops: string;
  country: string;
  region: string;
  farm_size_ha: number | null;
  family_members_supported: number | null;
  years_farming: number | null;
  monthly_funding_needed: number;
  photo_urls: string[];
  hero_photo_url: string;
  is_active: boolean;
  is_featured: boolean;
  slug: string;
  active_sponsors?: number;
  monthly_funding_received?: number;
}

interface FarmerUpdate {
  title: string;
  content: string;
  photo_url: string;
}

interface WizardForm {
  display_name: string;
  story: string;
  farm_description: string;
  country: string;
  region: string;
  crops: string[];
  cropInput: string;
  farm_size_ha: string;
  family_members_supported: string;
  years_farming: string;
  monthly_funding_needed: string;
  hero_photo_url: string;
  photo_2: string;
  photo_3: string;
  is_active: boolean;
}

// ── Step indicator component ──
function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {Array.from({ length: total }).map((_, i) => {
        const stepNum = i + 1;
        const isComplete = stepNum < current;
        const isActive = stepNum === current;
        return (
          <div key={i} className="flex items-center gap-2">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all ${
                isActive
                  ? 'text-white shadow-md'
                  : isComplete
                  ? 'text-white'
                  : 'bg-gray-100 text-gray-400'
              }`}
              style={
                isActive
                  ? { background: '#5DB347' }
                  : isComplete
                  ? { background: '#1B2A4A' }
                  : {}
              }
            >
              {isComplete ? <CheckCircle2 className="w-4 h-4" /> : stepNum}
            </div>
            {i < total - 1 && (
              <div
                className={`h-0.5 w-8 rounded-full transition-all ${
                  stepNum < current ? 'bg-navy' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Field wrapper ──
function Field({ label, hint, required, children }: { label: string; hint?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-1.5" style={{ color: '#1B2A4A' }}>
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {hint && <p className="text-xs text-gray-400 mb-2">{hint}</p>}
      {children}
    </div>
  );
}

const inputCls =
  'w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-green-400 bg-white transition-all';

// ── Main Component ──
export default function SponsorProfilePage() {
  const { user, profile } = useAuth();
  const [farmerProfile, setFarmerProfile] = useState<FarmerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [published, setPublished] = useState(false);
  const [updateSaving, setUpdateSaving] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [stepErrors, setStepErrors] = useState<string[]>([]);

  const [form, setForm] = useState<WizardForm>({
    display_name: '',
    story: '',
    farm_description: '',
    country: '',
    region: '',
    crops: [],
    cropInput: '',
    farm_size_ha: '',
    family_members_supported: '',
    years_farming: '',
    monthly_funding_needed: '100',
    hero_photo_url: '',
    photo_2: '',
    photo_3: '',
    is_active: true,
  });

  const [updateForm, setUpdateForm] = useState<FarmerUpdate>({
    title: '',
    content: '',
    photo_url: '',
  });

  // ── Load existing profile ──
  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      try {
        const { data } = await supabase
          .from('farmer_public_profiles')
          .select('*')
          .eq('member_id', user.id)
          .maybeSingle();

        if (data) {
          setFarmerProfile(data);
          // Hydrate wizard form for editing
          const cropsArr =
            typeof data.crops === 'string'
              ? data.crops.split(',').map((c: string) => c.trim()).filter(Boolean)
              : Array.isArray(data.crops)
              ? data.crops
              : [];
          setForm({
            display_name: data.display_name || '',
            story: data.story || '',
            farm_description: data.farm_description || '',
            country: data.country || '',
            region: data.region || '',
            crops: cropsArr,
            cropInput: '',
            farm_size_ha: data.farm_size_ha?.toString() || '',
            family_members_supported: data.family_members_supported?.toString() || '',
            years_farming: data.years_farming?.toString() || '',
            monthly_funding_needed: data.monthly_funding_needed?.toString() || '100',
            hero_photo_url: data.hero_photo_url || '',
            photo_2: data.photo_urls?.[0] || '',
            photo_3: data.photo_urls?.[1] || '',
            is_active: data.is_active ?? true,
          });
        } else {
          setForm((prev) => ({
            ...prev,
            display_name: profile?.full_name || '',
          }));
        }
      } catch {
        // Graceful degradation — table may not exist yet
      } finally {
        setLoading(false);
      }
    })();
  }, [user, profile]);

  // ── Validation per step ──
  const validateStep = useCallback(
    (step: number): string[] => {
      const errors: string[] = [];
      if (step === 2) {
        if (!form.display_name.trim()) errors.push('Display name is required.');
        if (!form.story.trim()) errors.push('Your story is required.');
        if (!form.country) errors.push('Please select your country.');
      }
      if (step === 3) {
        if (form.crops.length === 0) errors.push('Add at least one crop.');
        if (!form.monthly_funding_needed || Number(form.monthly_funding_needed) < 1)
          errors.push('Monthly funding needed must be at least $1.');
      }
      return errors;
    },
    [form]
  );

  // ── Save to Supabase ──
  const handleSave = useCallback(async () => {
    if (!user) return;
    setSaving(true);
    try {
      const photoUrls = [form.photo_2, form.photo_3].filter(Boolean);
      const slug = farmerProfile?.slug || generateSlug(form.display_name || 'farmer');
      const cropsString = form.crops.join(', ');

      const payload = {
        member_id: user.id,
        display_name: form.display_name,
        story: form.story,
        farm_description: form.farm_description,
        crops: cropsString,
        country: form.country,
        region: form.region,
        farm_size_ha: form.farm_size_ha ? Number(form.farm_size_ha) : null,
        family_members_supported: form.family_members_supported
          ? Number(form.family_members_supported)
          : null,
        years_farming: form.years_farming ? Number(form.years_farming) : null,
        monthly_funding_needed: Number(form.monthly_funding_needed) || 100,
        photo_urls: photoUrls,
        hero_photo_url: form.hero_photo_url,
        is_active: form.is_active,
        slug,
      };

      const { data, error } = await supabase
        .from('farmer_public_profiles')
        .upsert(payload, { onConflict: 'member_id' })
        .select()
        .single();

      if (data) {
        setFarmerProfile(data);
        setPublished(true);
        setShowWizard(false);
      }
      if (error) console.error('Sponsor profile save error:', error);
    } catch (err) {
      console.error('Sponsor profile save exception:', err);
    } finally {
      setSaving(false);
    }
  }, [user, form, farmerProfile]);

  // ── Post update ──
  const handlePostUpdate = useCallback(async () => {
    if (!user || !farmerProfile) return;
    setUpdateSaving(true);
    try {
      await supabase.from('farmer_updates').insert({
        farmer_profile_id: farmerProfile.id,
        title: updateForm.title,
        content: updateForm.content,
        photo_url: updateForm.photo_url || null,
        posted_at: new Date().toISOString(),
      });
      setUpdateForm({ title: '', content: '', photo_url: '' });
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch {
      // Graceful
    } finally {
      setUpdateSaving(false);
    }
  }, [user, farmerProfile, updateForm]);

  // ── Copy URL ──
  const handleCopy = useCallback(() => {
    if (!farmerProfile) return;
    navigator.clipboard.writeText(`https://afu.org/farmers/${farmerProfile.slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [farmerProfile]);

  // ── Crop tag helpers ──
  const addCrop = useCallback(() => {
    const val = form.cropInput.trim();
    if (val && !form.crops.includes(val)) {
      setForm((p) => ({ ...p, crops: [...p.crops, val], cropInput: '' }));
    } else {
      setForm((p) => ({ ...p, cropInput: '' }));
    }
  }, [form.cropInput, form.crops]);

  const removeCrop = useCallback((crop: string) => {
    setForm((p) => ({ ...p, crops: p.crops.filter((c) => c !== crop) }));
  }, []);

  const handleCropKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        addCrop();
      }
    },
    [addCrop]
  );

  // ── Navigation ──
  const goNext = useCallback(() => {
    const errors = validateStep(wizardStep);
    if (errors.length) {
      setStepErrors(errors);
      return;
    }
    setStepErrors([]);
    if (wizardStep === 4) {
      handleSave();
    } else {
      setWizardStep((s) => s + 1);
    }
  }, [wizardStep, validateStep, handleSave]);

  const goBack = useCallback(() => {
    setStepErrors([]);
    if (wizardStep === 1) {
      setShowWizard(false);
      setWizardStep(1);
    } else {
      setWizardStep((s) => s - 1);
    }
  }, [wizardStep]);

  const fundingPct = farmerProfile
    ? Math.min(
        100,
        Math.round(
          ((farmerProfile.monthly_funding_received || 0) / farmerProfile.monthly_funding_needed) *
            100
        )
      )
    : 0;

  // ── Loading ──
  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#5DB347' }} />
      </div>
    );
  }

  // ── Published success overlay ──
  if (published && farmerProfile) {
    return (
      <div className="max-w-2xl mx-auto py-8 space-y-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center space-y-5 shadow-sm">
          <div className="text-5xl">🎉</div>
          <h1 className="text-2xl font-bold" style={{ color: '#1B2A4A' }}>
            Your profile is now live!
          </h1>
          <p className="text-gray-500 text-sm">
            Sponsors worldwide can now find and fund your farm. Share your link to get noticed.
          </p>

          {/* Profile URL */}
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-3 max-w-md mx-auto">
            <ExternalLink className="w-4 h-4 shrink-0" style={{ color: '#5DB347' }} />
            <span className="text-sm font-mono flex-1 truncate text-gray-700">
              afu.org/farmers/{farmerProfile.slug}
            </span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
              style={{ background: '#5DB347', color: 'white' }}
            >
              {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>

          <div className="flex gap-3 justify-center">
            <a
              href={`/farmers/${farmerProfile.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 text-sm font-semibold transition-colors hover:bg-gray-50"
              style={{ borderColor: '#1B2A4A', color: '#1B2A4A' }}
            >
              <ExternalLink className="w-4 h-4" />
              View Public Profile
            </a>
            <button
              onClick={() => setPublished(false)}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
              style={{ background: '#5DB347', color: 'white' }}
            >
              Go to Dashboard
            </button>
          </div>
        </div>

        {/* Post an Update */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4 shadow-sm">
          <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: '#1B2A4A' }}>
            <Send className="w-5 h-5" style={{ color: '#5DB347' }} />
            Post Your First Update
          </h2>
          <p className="text-sm text-gray-500">Tell your future sponsors what&apos;s happening on the farm right now.</p>
          <div className="space-y-3">
            <input
              type="text"
              value={updateForm.title}
              onChange={(e) => setUpdateForm((p) => ({ ...p, title: e.target.value }))}
              className={inputCls}
              placeholder="Update title (e.g. Planting season underway!)"
            />
            <textarea
              value={updateForm.content}
              onChange={(e) => setUpdateForm((p) => ({ ...p, content: e.target.value }))}
              rows={4}
              className={`${inputCls} resize-none`}
              placeholder="Tell your sponsors what&apos;s happening on the farm..."
            />
            <input
              type="url"
              value={updateForm.photo_url}
              onChange={(e) => setUpdateForm((p) => ({ ...p, photo_url: e.target.value }))}
              className={inputCls}
              placeholder="Photo URL (optional)"
            />
          </div>
          <button
            onClick={handlePostUpdate}
            disabled={updateSaving || !updateForm.title || !updateForm.content}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            style={{ background: '#1B2A4A' }}
          >
            {updateSaving ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Posting...</>
            ) : updateSuccess ? (
              <><CheckCircle2 className="w-4 h-4" /> Posted!</>
            ) : (
              <><Send className="w-4 h-4" /> Post Update</>
            )}
          </button>
        </div>
      </div>
    );
  }

  // ── Profile exists — dashboard view ──
  if (farmerProfile && !showWizard) {
    return (
      <div className="max-w-3xl mx-auto py-8 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: '#1B2A4A' }}>
              <Heart className="w-6 h-6" style={{ color: '#5DB347' }} />
              Your Sponsor Profile
            </h1>
            <p className="text-gray-500 mt-1 text-sm">Manage how sponsors discover your farm</p>
          </div>
          <button
            onClick={() => { setShowWizard(true); setWizardStep(2); }}
            className="px-5 py-2.5 rounded-xl border-2 text-sm font-semibold transition-colors hover:bg-gray-50"
            style={{ borderColor: '#5DB347', color: '#5DB347' }}
          >
            Edit Profile
          </button>
        </div>

        {/* Profile card */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          {farmerProfile.hero_photo_url && (
            <div className="h-44 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={farmerProfile.hero_photo_url}
                alt="Farm hero"
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold" style={{ color: '#1B2A4A' }}>
                  {farmerProfile.display_name}
                </h2>
                <p className="text-gray-500 text-sm mt-0.5">{farmerProfile.crops}</p>
                {farmerProfile.country && (
                  <p className="text-gray-400 text-xs mt-0.5">
                    {farmerProfile.region ? `${farmerProfile.region}, ` : ''}{farmerProfile.country}
                  </p>
                )}
                <span
                  className={`inline-block mt-2 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                    farmerProfile.is_active
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {farmerProfile.is_active ? 'Profile Live' : 'Hidden'}
                </span>
              </div>
              <div className="text-right shrink-0">
                <div className="text-xl font-bold" style={{ color: '#1B2A4A' }}>
                  {farmerProfile.active_sponsors ?? 0}
                </div>
                <div className="text-xs text-gray-500">sponsors</div>
              </div>
            </div>

            {/* Funding bar */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-gray-500">Monthly Funding</span>
                <span className="font-semibold" style={{ color: '#1B2A4A' }}>
                  ${farmerProfile.monthly_funding_received ?? 0} / ${farmerProfile.monthly_funding_needed}
                </span>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${fundingPct}%`,
                    background: fundingPct >= 100 ? '#16a34a' : '#5DB347',
                  }}
                />
              </div>
              <div className="text-xs text-gray-400 mt-1">{fundingPct}% funded this month</div>
            </div>

            {/* Public URL */}
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-3">
              <ExternalLink className="w-4 h-4 shrink-0" style={{ color: '#5DB347' }} />
              <span className="text-sm font-mono flex-1 truncate text-gray-700">
                afu.org/farmers/{farmerProfile.slug}
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs font-medium transition-colors shrink-0"
                style={{ color: '#5DB347' }}
              >
                {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        </div>

        {/* Post an update */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4 shadow-sm">
          <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: '#1B2A4A' }}>
            <Send className="w-5 h-5" style={{ color: '#5DB347' }} />
            Post an Update
          </h2>
          <p className="text-sm text-gray-500">Share your latest news with your sponsors</p>
          <div className="space-y-3">
            <input
              type="text"
              value={updateForm.title}
              onChange={(e) => setUpdateForm((p) => ({ ...p, title: e.target.value }))}
              className={inputCls}
              placeholder="Update title (e.g. Harvest season begins!)"
            />
            <textarea
              value={updateForm.content}
              onChange={(e) => setUpdateForm((p) => ({ ...p, content: e.target.value }))}
              rows={4}
              className={`${inputCls} resize-none`}
              placeholder="Tell your sponsors what's happening on the farm..."
            />
            <input
              type="url"
              value={updateForm.photo_url}
              onChange={(e) => setUpdateForm((p) => ({ ...p, photo_url: e.target.value }))}
              className={inputCls}
              placeholder="Photo URL (optional)"
            />
          </div>
          <button
            onClick={handlePostUpdate}
            disabled={updateSaving || !updateForm.title || !updateForm.content}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            style={{ background: '#1B2A4A' }}
          >
            {updateSaving ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Posting...</>
            ) : updateSuccess ? (
              <><CheckCircle2 className="w-4 h-4" /> Posted!</>
            ) : (
              <><Send className="w-4 h-4" /> Post Update</>
            )}
          </button>
        </div>
      </div>
    );
  }

  // ── Wizard ──
  if (showWizard || !farmerProfile) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        {/* Page title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold" style={{ color: '#1B2A4A' }}>
            {farmerProfile ? 'Edit Your Sponsor Profile' : 'Create Your Sponsor Profile'}
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            {farmerProfile ? 'Update your details below' : 'Get discovered by sponsors worldwide'}
          </p>
        </div>

        {/* Step indicator — only show steps 1-4 when relevant */}
        {wizardStep > 1 && <StepIndicator current={wizardStep - 1} total={4} />}

        {/* Validation errors */}
        {stepErrors.length > 0 && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-4 space-y-1">
            {stepErrors.map((err, i) => (
              <p key={i} className="text-sm text-red-600 flex items-start gap-1.5">
                <span className="mt-0.5 shrink-0">•</span> {err}
              </p>
            ))}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

          {/* ── STEP 1: Opt In ── */}
          {wizardStep === 1 && (
            <div className="p-8 text-center space-y-6">
              <div className="text-5xl space-x-1 leading-none">
                <span>🌱</span><span>🚜</span><span>🌾</span>
              </div>
              <div>
                <h2 className="text-xl font-bold mb-3" style={{ color: '#1B2A4A' }}>
                  Would you like to be sponsorable?
                </h2>
                <p className="text-gray-500 text-sm leading-relaxed max-w-md mx-auto">
                  Your profile will appear on the public{' '}
                  <span className="font-semibold text-gray-700">/sponsor</span> page where
                  supporters worldwide — impact investors, corporates, and individuals — can fund
                  your farm, membership costs, and inputs.
                </p>
              </div>

              <ul className="text-left inline-block space-y-2.5 text-sm text-gray-700 w-full max-w-xs mx-auto">
                {[
                  'Monthly funding towards your membership',
                  'Input cost support from global donors',
                  'Worldwide visibility to impact investors',
                  'Post seasonal updates to your sponsors',
                ].map((benefit) => (
                  <li key={benefit} className="flex items-start gap-2.5">
                    <CheckCircle2
                      className="w-4 h-4 mt-0.5 shrink-0"
                      style={{ color: '#5DB347' }}
                    />
                    {benefit}
                  </li>
                ))}
              </ul>

              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <button
                  onClick={() => { setStepErrors([]); setWizardStep(2); }}
                  className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-white transition-all hover:opacity-90 shadow-md"
                  style={{ background: '#5DB347' }}
                >
                  <Heart className="w-4 h-4" />
                  Yes, I want to be sponsored
                </button>
                <button
                  onClick={() => {
                    if (farmerProfile) {
                      setShowWizard(false);
                    }
                    // If no profile, they are on the "no profile" entry screen — do nothing visible
                  }}
                  className="px-8 py-3.5 rounded-xl font-semibold border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
                >
                  Not right now
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 2: Your Story ── */}
          {wizardStep === 2 && (
            <div className="p-6 sm:p-8 space-y-5">
              <div className="mb-2">
                <h2 className="text-lg font-bold" style={{ color: '#1B2A4A' }}>Your Story</h2>
                <p className="text-sm text-gray-400 mt-0.5">Help sponsors connect with you personally</p>
              </div>

              <Field label="Display Name" required>
                <input
                  type="text"
                  value={form.display_name}
                  onChange={(e) => setForm((p) => ({ ...p, display_name: e.target.value }))}
                  className={inputCls}
                  placeholder="Your name as shown to sponsors"
                />
              </Field>

              <Field label="Your Story" required hint="Tell sponsors why you farm and what motivates you">
                <textarea
                  value={form.story}
                  onChange={(e) => setForm((p) => ({ ...p, story: e.target.value }))}
                  rows={4}
                  className={`${inputCls} resize-none`}
                  placeholder="Tell sponsors why you farm and what drives you..."
                />
              </Field>

              <Field label="Farm Description" hint="Describe your farm — location, size, what you grow">
                <textarea
                  value={form.farm_description}
                  onChange={(e) => setForm((p) => ({ ...p, farm_description: e.target.value }))}
                  rows={3}
                  className={`${inputCls} resize-none`}
                  placeholder="Describe your farm — location, size, what you grow"
                />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Country" required>
                  <select
                    value={form.country}
                    onChange={(e) => setForm((p) => ({ ...p, country: e.target.value }))}
                    className={inputCls}
                  >
                    <option value="">Select country...</option>
                    {AFU_COUNTRIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Region / Province">
                  <input
                    type="text"
                    value={form.region}
                    onChange={(e) => setForm((p) => ({ ...p, region: e.target.value }))}
                    className={inputCls}
                    placeholder="e.g. Mashonaland East"
                  />
                </Field>
              </div>
            </div>
          )}

          {/* ── STEP 3: Farm Details ── */}
          {wizardStep === 3 && (
            <div className="p-6 sm:p-8 space-y-5">
              <div className="mb-2">
                <h2 className="text-lg font-bold" style={{ color: '#1B2A4A' }}>Farm Details</h2>
                <p className="text-sm text-gray-400 mt-0.5">Give sponsors a clear picture of your operation</p>
              </div>

              {/* Crops tag input */}
              <Field
                label="Crops"
                required
                hint="Type a crop name and press Enter or comma to add it"
              >
                <div className="border border-gray-200 rounded-xl p-3 bg-white focus-within:ring-2 focus-within:ring-green-300 focus-within:border-green-400 transition-all">
                  {form.crops.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {form.crops.map((crop) => (
                        <span
                          key={crop}
                          className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full text-white"
                          style={{ background: '#5DB347' }}
                        >
                          {crop}
                          <button
                            type="button"
                            onClick={() => removeCrop(crop)}
                            className="hover:opacity-70 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={form.cropInput}
                      onChange={(e) => setForm((p) => ({ ...p, cropInput: e.target.value }))}
                      onKeyDown={handleCropKeyDown}
                      className="flex-1 text-sm outline-none bg-transparent placeholder-gray-400"
                      placeholder={
                        form.crops.length === 0 ? 'e.g. Coffee, Maize, Cashews...' : 'Add another crop...'
                      }
                    />
                    <button
                      type="button"
                      onClick={addCrop}
                      className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg text-white transition-colors"
                      style={{ background: '#5DB347' }}
                    >
                      <Plus className="w-3 h-3" /> Add
                    </button>
                  </div>
                </div>
              </Field>

              {/* Number grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Field label="Farm Size (ha)">
                  <input
                    type="number"
                    value={form.farm_size_ha}
                    onChange={(e) => setForm((p) => ({ ...p, farm_size_ha: e.target.value }))}
                    className={inputCls}
                    placeholder="0"
                    min="0"
                    step="0.1"
                  />
                </Field>
                <Field label="Family Members">
                  <input
                    type="number"
                    value={form.family_members_supported}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, family_members_supported: e.target.value }))
                    }
                    className={inputCls}
                    placeholder="0"
                    min="0"
                  />
                </Field>
                <Field label="Years Farming">
                  <input
                    type="number"
                    value={form.years_farming}
                    onChange={(e) => setForm((p) => ({ ...p, years_farming: e.target.value }))}
                    className={inputCls}
                    placeholder="0"
                    min="0"
                  />
                </Field>
                <Field label="Monthly Need ($)" required>
                  <input
                    type="number"
                    value={form.monthly_funding_needed}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, monthly_funding_needed: e.target.value }))
                    }
                    className={inputCls}
                    placeholder="100"
                    min="1"
                  />
                </Field>
              </div>
            </div>
          )}

          {/* ── STEP 4: Photos & Publish ── */}
          {wizardStep === 4 && (
            <div className="p-6 sm:p-8 space-y-5">
              <div className="mb-2">
                <h2 className="text-lg font-bold" style={{ color: '#1B2A4A' }}>Photos & Publish</h2>
                <p className="text-sm text-gray-400 mt-0.5">Add photos to bring your profile to life</p>
              </div>

              {/* Hero photo */}
              <Field label="Hero Photo URL" hint="Main profile photo — shown at the top of your sponsor page">
                <input
                  type="url"
                  value={form.hero_photo_url}
                  onChange={(e) => setForm((p) => ({ ...p, hero_photo_url: e.target.value }))}
                  className={inputCls}
                  placeholder="https://..."
                />
                {form.hero_photo_url && (
                  <div className="mt-2 h-32 rounded-xl overflow-hidden border border-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={form.hero_photo_url}
                      alt="Hero preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </Field>

              {/* Additional photos */}
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <Camera className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-semibold" style={{ color: '#1B2A4A' }}>
                    Additional Photos (optional)
                  </span>
                </div>
                <p className="text-xs text-gray-400 mb-3">
                  Paste image URLs — direct upload coming soon
                </p>
                <div className="space-y-2">
                  {(['photo_2', 'photo_3'] as const).map((key, i) => (
                    <input
                      key={key}
                      type="url"
                      value={form[key]}
                      onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                      className={inputCls}
                      placeholder={`Photo ${i + 2} URL`}
                    />
                  ))}
                </div>
              </div>

              {/* Visibility toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <div className="text-sm font-semibold" style={{ color: '#1B2A4A' }}>
                    Publish my profile
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    Sponsors can discover and fund your farm
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, is_active: !p.is_active }))}
                  className="relative w-12 h-6 rounded-full transition-colors focus:outline-none"
                  style={{ background: form.is_active ? '#5DB347' : '#D1D5DB' }}
                  aria-label="Toggle visibility"
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                      form.is_active ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Profile preview summary */}
              <div className="p-4 bg-green-50 border border-green-100 rounded-xl space-y-1.5">
                <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">Profile Summary</p>
                <p className="text-sm font-bold" style={{ color: '#1B2A4A' }}>{form.display_name || 'Your Name'}</p>
                {form.country && (
                  <p className="text-xs text-gray-500">
                    {form.region ? `${form.region}, ` : ''}{form.country}
                  </p>
                )}
                {form.crops.length > 0 && (
                  <p className="text-xs text-gray-500">{form.crops.join(' · ')}</p>
                )}
                <p className="text-xs text-gray-500">
                  Funding goal: <span className="font-semibold text-gray-700">${form.monthly_funding_needed || '100'}/month</span>
                </p>
              </div>
            </div>
          )}

          {/* ── Wizard footer nav ── */}
          {wizardStep > 1 && (
            <div
              className="flex items-center justify-between gap-3 px-6 sm:px-8 py-4 border-t border-gray-100 bg-gray-50"
            >
              <button
                onClick={goBack}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-white transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>

              <button
                onClick={goNext}
                disabled={saving}
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60 disabled:cursor-not-allowed transition-all hover:opacity-90 shadow-sm"
                style={{ background: '#5DB347' }}
              >
                {saving ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                ) : wizardStep === 4 ? (
                  <><CheckCircle2 className="w-4 h-4" /> Publish My Profile</>
                ) : (
                  <>Next <ChevronRight className="w-4 h-4" /></>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Fallback — should not be reached
  return null;
}
