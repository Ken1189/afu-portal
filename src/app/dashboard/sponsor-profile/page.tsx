'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/supabase/auth-context';
import { createClient } from '@/lib/supabase/client';
import {
  Heart,
  Copy,
  CheckCircle2,
  ExternalLink,
  Users,
  Camera,
  Plus,
  Loader2,
  Send,
} from 'lucide-react';

// ── Supabase client ──
const supabase = createClient();

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

export default function SponsorProfilePage() {
  const { user, profile } = useAuth();
  const [farmerProfile, setFarmerProfile] = useState<FarmerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [updateSaving, setUpdateSaving] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // ── Form state ──
  const [form, setForm] = useState({
    display_name: '',
    story: '',
    farm_description: '',
    crops: '',
    farm_size_ha: '',
    family_members_supported: '',
    years_farming: '',
    monthly_funding_needed: '100',
    hero_photo_url: '',
    photo_1: '',
    photo_2: '',
    photo_3: '',
    photo_4: '',
    photo_5: '',
    is_active: true,
  });

  // ── Update form state ──
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
        const { data, error } = await supabase
          .from('farmer_public_profiles')
          .select('*')
          .eq('member_id', user.id)
          .maybeSingle();

        if (data) {
          setFarmerProfile(data);
          setForm({
            display_name: data.display_name || '',
            story: data.story || '',
            farm_description: data.farm_description || '',
            crops: data.crops || '',
            farm_size_ha: data.farm_size_ha?.toString() || '',
            family_members_supported: data.family_members_supported?.toString() || '',
            years_farming: data.years_farming?.toString() || '',
            monthly_funding_needed: data.monthly_funding_needed?.toString() || '100',
            hero_photo_url: data.hero_photo_url || '',
            photo_1: data.photo_urls?.[0] || '',
            photo_2: data.photo_urls?.[1] || '',
            photo_3: data.photo_urls?.[2] || '',
            photo_4: data.photo_urls?.[3] || '',
            photo_5: data.photo_urls?.[4] || '',
            is_active: data.is_active ?? true,
          });
        } else {
          // Pre-fill display name from member profile
          setForm((prev) => ({
            ...prev,
            display_name: profile?.full_name || '',
          }));
        }
      } catch (err) {
        // Table may not exist yet — graceful degradation
      } finally {
        setLoading(false);
      }
    })();
  }, [user, profile]);

  // ── Save profile ──
  const handleSave = useCallback(async () => {
    if (!user) return;
    setSaving(true);
    setSaveSuccess(false);
    try {
      const photoUrls = [form.photo_1, form.photo_2, form.photo_3, form.photo_4, form.photo_5].filter(Boolean);
      const slug = farmerProfile?.slug || generateSlug(form.display_name || 'farmer');
      const payload = {
        member_id: user.id,
        display_name: form.display_name,
        story: form.story,
        farm_description: form.farm_description,
        crops: form.crops,
        farm_size_ha: form.farm_size_ha ? Number(form.farm_size_ha) : null,
        family_members_supported: form.family_members_supported ? Number(form.family_members_supported) : null,
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
        setSaveSuccess(true);
        setShowForm(false);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      // Handle error silently — table may not exist yet
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
    } catch (err) {
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

  const fundingPct = farmerProfile
    ? Math.min(100, Math.round(((farmerProfile.monthly_funding_received || 0) / farmerProfile.monthly_funding_needed) * 100))
    : 0;

  // ── Loading state ──
  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-teal animate-spin" />
      </div>
    );
  }

  // ── No profile yet ──
  if (!farmerProfile && !showForm) {
    return (
      <div className="max-w-2xl mx-auto py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-navy">Your Sponsor Profile</h1>
          <p className="text-gray-500 mt-1">Let supporters fund your farming journey</p>
        </div>

        <div className="card-elevated bg-white rounded-2xl p-8 border border-gray-100 text-center space-y-6">
          {/* Illustration */}
          <div className="text-5xl space-x-2 leading-none">
            <span>🌱</span><span>🚜</span><span>🌾</span>
          </div>

          <div>
            <h2 className="text-xl font-bold text-navy mb-3">
              Get Sponsored — Let the World Support Your Farm
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed max-w-lg mx-auto">
              Create a public profile and let impact investors, corporates, and do-gooders fund
              your membership, inputs, and programs. It&apos;s free and takes 2 minutes.
            </p>
          </div>

          {/* Benefits */}
          <ul className="text-left inline-block space-y-2 text-sm text-gray-700">
            {[
              'Monthly funding towards your membership',
              'Input cost support',
              'Global visibility',
              'Seasonal update channel',
            ].map((benefit) => (
              <li key={benefit} className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal shrink-0" />
                {benefit}
              </li>
            ))}
          </ul>

          <button
            onClick={() => setShowForm(true)}
            className="bg-teal text-white font-semibold px-8 py-3 rounded-xl hover:bg-teal/90 transition-colors shadow-sm"
          >
            Create My Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-8">
      {/* ── Page Header ── */}
      <div>
        <h1 className="text-2xl font-bold text-navy flex items-center gap-2">
          <Heart className="w-6 h-6 text-teal" />
          Your Sponsor Profile
        </h1>
        <p className="text-gray-500 mt-1">Let supporters fund your farming journey</p>
      </div>

      {/* ── Profile Summary (if exists) ── */}
      {farmerProfile && !showForm && (
        <div className="card-polished bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {/* Hero photo */}
          {farmerProfile.hero_photo_url && (
            <div className="h-40 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={farmerProfile.hero_photo_url} alt="Farm hero" className="w-full h-full object-cover" />
            </div>
          )}
          <div className="p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-navy">{farmerProfile.display_name}</h2>
                <p className="text-gray-500 text-sm mt-0.5">{farmerProfile.crops}</p>
                {farmerProfile.is_active ? (
                  <span className="inline-block mt-2 text-xs bg-green-100 text-green-700 font-semibold px-2.5 py-0.5 rounded-full">Profile Live</span>
                ) : (
                  <span className="inline-block mt-2 text-xs bg-gray-100 text-gray-500 font-semibold px-2.5 py-0.5 rounded-full">Hidden</span>
                )}
              </div>
              <div className="text-right shrink-0">
                <div className="text-lg font-bold text-navy">{farmerProfile.active_sponsors ?? 0}</div>
                <div className="text-xs text-gray-500">sponsors</div>
              </div>
            </div>

            {/* Funding progress */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-gray-500">Monthly Funding</span>
                <span className="font-semibold text-navy">
                  ${farmerProfile.monthly_funding_received ?? 0} / ${farmerProfile.monthly_funding_needed}
                </span>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${fundingPct}%`, background: fundingPct >= 100 ? '#16a34a' : '#2AA198' }}
                />
              </div>
              <div className="text-xs text-gray-400 mt-1">{fundingPct}% funded this month</div>
            </div>

            {/* Public URL */}
            <div className="flex items-center gap-2 bg-cream rounded-xl p-3">
              <ExternalLink className="w-4 h-4 text-teal shrink-0" />
              <span className="text-sm text-navy font-mono flex-1 truncate">
                afu.org/farmers/{farmerProfile.slug}
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs font-medium text-teal hover:text-teal/80 transition-colors shrink-0"
              >
                {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            <button
              onClick={() => setShowForm(true)}
              className="w-full py-2.5 rounded-xl border border-teal/30 text-teal text-sm font-semibold hover:bg-teal/5 transition-colors"
            >
              Edit Profile
            </button>
          </div>
        </div>
      )}

      {/* ── Create / Edit Form ── */}
      {(showForm || !farmerProfile) && (
        <div className="card-polished bg-white rounded-2xl border border-gray-100 p-6 space-y-6">
          <h2 className="text-lg font-bold text-navy">
            {farmerProfile ? 'Edit Your Profile' : 'Create Your Profile'}
          </h2>

          <div className="space-y-5">
            {/* Display Name */}
            <div>
              <label className="block text-sm font-medium text-navy mb-1.5">Display Name *</label>
              <input
                type="text"
                value={form.display_name}
                onChange={(e) => setForm((p) => ({ ...p, display_name: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
                placeholder="Your name as shown to sponsors"
              />
            </div>

            {/* Story */}
            <div>
              <label className="block text-sm font-medium text-navy mb-1.5">Your Story *</label>
              <textarea
                value={form.story}
                onChange={(e) => setForm((p) => ({ ...p, story: e.target.value }))}
                rows={4}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal resize-none"
                placeholder="Tell sponsors about your farming journey..."
              />
            </div>

            {/* Farm Description */}
            <div>
              <label className="block text-sm font-medium text-navy mb-1.5">Farm Description</label>
              <textarea
                value={form.farm_description}
                onChange={(e) => setForm((p) => ({ ...p, farm_description: e.target.value }))}
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal resize-none"
                placeholder="Describe your farm, what you grow, your goals..."
              />
            </div>

            {/* Crops */}
            <div>
              <label className="block text-sm font-medium text-navy mb-1.5">Crops</label>
              <input
                type="text"
                value={form.crops}
                onChange={(e) => setForm((p) => ({ ...p, crops: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
                placeholder="e.g. Coffee, Cashews, Blueberries"
              />
            </div>

            {/* Numbers row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-navy mb-1.5">Farm Size (ha)</label>
                <input
                  type="number"
                  value={form.farm_size_ha}
                  onChange={(e) => setForm((p) => ({ ...p, farm_size_ha: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
                  placeholder="0"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-navy mb-1.5">Family Members</label>
                <input
                  type="number"
                  value={form.family_members_supported}
                  onChange={(e) => setForm((p) => ({ ...p, family_members_supported: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
                  placeholder="0"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-navy mb-1.5">Years Farming</label>
                <input
                  type="number"
                  value={form.years_farming}
                  onChange={(e) => setForm((p) => ({ ...p, years_farming: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
                  placeholder="0"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-navy mb-1.5">Monthly Need ($)</label>
                <input
                  type="number"
                  value={form.monthly_funding_needed}
                  onChange={(e) => setForm((p) => ({ ...p, monthly_funding_needed: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
                  placeholder="100"
                  min="1"
                />
              </div>
            </div>

            {/* Hero Photo */}
            <div>
              <label className="block text-sm font-medium text-navy mb-1.5">Hero Photo URL</label>
              <input
                type="url"
                value={form.hero_photo_url}
                onChange={(e) => setForm((p) => ({ ...p, hero_photo_url: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
                placeholder="https://..."
              />
            </div>

            {/* Additional Photos */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Camera className="w-4 h-4 text-gray-400" />
                <label className="text-sm font-medium text-navy">Additional Photos (URL)</label>
              </div>
              <p className="text-xs text-gray-400 mb-3">Direct upload coming soon — paste an image URL for now</p>
              <div className="space-y-2">
                {([1, 2, 3, 4, 5] as const).map((n) => (
                  <input
                    key={n}
                    type="url"
                    value={form[`photo_${n}` as keyof typeof form] as string}
                    onChange={(e) => setForm((p) => ({ ...p, [`photo_${n}`]: e.target.value }))}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
                    placeholder={`Photo ${n} URL`}
                  />
                ))}
              </div>
            </div>

            {/* Visibility toggle */}
            <div className="flex items-center justify-between p-4 bg-cream rounded-xl">
              <div>
                <div className="text-sm font-medium text-navy">Make my profile visible to sponsors</div>
                <div className="text-xs text-gray-500 mt-0.5">Sponsors can find and support your farm</div>
              </div>
              <button
                onClick={() => setForm((p) => ({ ...p, is_active: !p.is_active }))}
                className={`relative w-12 h-6 rounded-full transition-colors ${form.is_active ? 'bg-teal' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${form.is_active ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={saving || !form.display_name}
              className="flex-1 flex items-center justify-center gap-2 bg-teal text-white font-semibold py-3 rounded-xl hover:bg-teal/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
              ) : saveSuccess ? (
                <><CheckCircle2 className="w-4 h-4" /> Saved!</>
              ) : (
                'Save Profile'
              )}
            </button>
            {farmerProfile && (
              <button
                onClick={() => setShowForm(false)}
                className="px-6 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Post an Update ── */}
      {farmerProfile && !showForm && (
        <div className="card-polished bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <h2 className="text-lg font-bold text-navy flex items-center gap-2">
            <Send className="w-5 h-5 text-teal" />
            Post an Update
          </h2>
          <p className="text-sm text-gray-500">Share your latest news with your sponsors</p>

          <div className="space-y-3">
            <input
              type="text"
              value={updateForm.title}
              onChange={(e) => setUpdateForm((p) => ({ ...p, title: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
              placeholder="Update title (e.g. Harvest season begins!)"
            />
            <textarea
              value={updateForm.content}
              onChange={(e) => setUpdateForm((p) => ({ ...p, content: e.target.value }))}
              rows={4}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal resize-none"
              placeholder="Tell your sponsors what's happening on the farm..."
            />
            <input
              type="url"
              value={updateForm.photo_url}
              onChange={(e) => setUpdateForm((p) => ({ ...p, photo_url: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
              placeholder="Photo URL (optional)"
            />
          </div>

          <button
            onClick={handlePostUpdate}
            disabled={updateSaving || !updateForm.title || !updateForm.content}
            className="w-full flex items-center justify-center gap-2 bg-navy text-white font-semibold py-3 rounded-xl hover:bg-navy/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
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
      )}
    </div>
  );
}
