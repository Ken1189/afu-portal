'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Loader2,
  MapPin,
  Phone,
  Sprout,
  Tractor,
  BookOpen,
  ShoppingBag,
} from 'lucide-react';
import { useAuth } from '@/lib/supabase/auth-context';
import { createClient } from '@/lib/supabase/client';
import { ALL_AFRICAN_COUNTRIES } from '@/lib/countries';
import ImageUploader from '@/components/ui/ImageUploader';

// ── Constants ────────────────────────────────────────────────────────────
const NAVY = '#1B2A4A';
const GREEN = '#5DB347';
const CREAM = '#FAF8F3';

const CROP_OPTIONS = [
  'Maize', 'Rice', 'Cassava', 'Sorghum', 'Millet', 'Wheat', 'Beans',
  'Groundnuts', 'Soybeans', 'Coffee', 'Cocoa', 'Tea', 'Cotton', 'Sugarcane',
  'Tomatoes', 'Potatoes', 'Onions', 'Bananas', 'Mangoes', 'Avocado',
];

const LIVESTOCK_OPTIONS = ['Cattle', 'Goats', 'Sheep', 'Poultry', 'Fish'];

type Toast = { type: 'success' | 'error'; msg: string } | null;

// ── Page ─────────────────────────────────────────────────────────────────
export default function OnboardingPage() {
  const router = useRouter();
  const { user, profile, isLoading: authLoading } = useAuth();
  const supabase = useMemo(() => createClient(), []);

  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<Toast>(null);

  // Step 1: Profile
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [phone, setPhone] = useState('');

  // Step 2: Location + Crops
  const [country, setCountry] = useState('');
  const [region, setRegion] = useState('');
  const [selectedCrops, setSelectedCrops] = useState<string[]>([]);
  const [selectedLivestock, setSelectedLivestock] = useState<string[]>([]);

  // Step 3: First Farm
  const [farmName, setFarmName] = useState('');
  const [hectares, setHectares] = useState('');
  const [gps, setGps] = useState('');
  const [farmPhoto, setFarmPhoto] = useState('');

  const displayName = profile?.full_name || profile?.email?.split('@')[0] || 'Farmer';
  const firstName = displayName.split(' ')[0];

  // Pre-populate from existing profile
  useEffect(() => {
    if (!profile) return;
    if (profile.phone) setPhone(profile.phone);
    if (profile.avatar_url) setPhotoUrl(profile.avatar_url);
    if (profile.country) setCountry(profile.country);
    if (profile.region) setRegion(profile.region);
  }, [profile]);

  // Redirect away if already onboarded
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace('/login?redirect=/farm/onboarding');
      return;
    }
    (async () => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('onboarded_at')
          .eq('id', user.id)
          .single();
        if (data?.onboarded_at) {
          router.replace('/farm');
        }
      } catch {
        // column may not exist yet — ignore
      }
    })();
  }, [authLoading, user, router, supabase]);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const showToast = (type: 'success' | 'error', msg: string) =>
    setToast({ type, msg });

  // ── Step Save Handlers ─────────────────────────────────────────────────
  const handleStep1Save = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ phone: phone || null, avatar_url: photoUrl || null })
        .eq('id', user.id);
      if (error) throw error;
      setStep(2);
    } catch (err) {
      showToast('error', (err as Error).message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleStep2Save = async () => {
    if (!user) return;
    if (!country) {
      showToast('error', 'Please choose your country');
      return;
    }
    setSaving(true);
    try {
      const { error: profileErr } = await supabase
        .from('profiles')
        .update({ country, region: region || null })
        .eq('id', user.id);
      if (profileErr) throw profileErr;

      // Upsert members row with crops + livestock
      const { data: existing } = await supabase
        .from('members')
        .select('id')
        .eq('profile_id', user.id)
        .maybeSingle();

      if (existing?.id) {
        const { error: memErr } = await supabase
          .from('members')
          .update({
            primary_crops: selectedCrops,
            livestock_types: selectedLivestock,
          })
          .eq('id', existing.id);
        if (memErr) throw memErr;
      } else {
        const memberId = `AFU-${new Date().getFullYear()}-${user.id.slice(0, 8).toUpperCase()}`;
        const { error: memErr } = await supabase.from('members').insert({
          profile_id: user.id,
          member_id: memberId,
          primary_crops: selectedCrops,
          livestock_types: selectedLivestock,
        });
        if (memErr) throw memErr;
      }

      setStep(3);
    } catch (err) {
      showToast('error', (err as Error).message || 'Failed to save location');
    } finally {
      setSaving(false);
    }
  };

  const handleStep3Save = async (skip = false) => {
    if (!user) return;
    if (skip) {
      setStep(4);
      return;
    }
    if (!farmName.trim()) {
      showToast('error', 'Please enter a farm name');
      return;
    }
    const hectaresNum = parseFloat(hectares || '0');
    if (isNaN(hectaresNum) || hectaresNum < 0 || hectaresNum > 1_000_000) {
      showToast('error', 'Please enter valid hectares (0–1,000,000)');
      return;
    }

    let gpsLat: number | null = null;
    let gpsLng: number | null = null;
    if (gps.trim()) {
      const parts = gps.split(',').map((p) => p.trim());
      if (parts.length === 2) {
        const lat = parseFloat(parts[0]);
        const lng = parseFloat(parts[1]);
        if (!isNaN(lat) && !isNaN(lng)) {
          gpsLat = lat;
          gpsLng = lng;
        }
      }
    }

    setSaving(true);
    try {
      const { error } = await supabase.from('farms').insert({
        user_id: user.id,
        name: farmName.trim(),
        country: country || null,
        region: region || null,
        hectares: hectaresNum,
        gps_lat: gpsLat,
        gps_lng: gpsLng,
        photo_url: farmPhoto || null,
      });
      if (error) throw error;
      setStep(4);
    } catch (err) {
      showToast('error', (err as Error).message || 'Failed to save farm');
    } finally {
      setSaving(false);
    }
  };

  const handleFinish = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ onboarded_at: new Date().toISOString() })
        .eq('id', user.id);
      if (error && !/column .* does not exist/i.test(error.message)) {
        throw error;
      }
      router.push('/farm');
    } catch (err) {
      showToast('error', (err as Error).message || 'Failed to finish onboarding');
      setSaving(false);
    }
  };

  // ── Helpers ─────────────────────────────────────────────────────────────
  const toggleCrop = (crop: string) =>
    setSelectedCrops((prev) =>
      prev.includes(crop) ? prev.filter((c) => c !== crop) : [...prev, crop]
    );
  const toggleLivestock = (kind: string) =>
    setSelectedLivestock((prev) =>
      prev.includes(kind) ? prev.filter((k) => k !== kind) : [...prev, kind]
    );

  // ── Loading guard ──────────────────────────────────────────────────────
  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: CREAM }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: GREEN }} />
      </div>
    );
  }

  const progressPct = (step / 4) * 100;

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen py-8 px-4" style={{ background: CREAM }}>
      <div className="max-w-2xl mx-auto">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold" style={{ color: NAVY }}>
              Step {step} of 4
            </span>
            <span className="text-xs text-gray-500">
              {step === 1 && 'Welcome & Profile'}
              {step === 2 && 'Location & Crops'}
              {step === 3 && 'Your First Farm'}
              {step === 4 && 'All Done'}
            </span>
          </div>
          <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%`, background: GREEN }}
            />
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
          {/* ─── Step 1 ─────────────────────────────────────────── */}
          {step === 1 && (
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: NAVY }}>
                Welcome to African Farming Union, {firstName}!
              </h1>
              <p className="text-gray-600 mb-6">
                Let&apos;s get your account set up in 4 quick steps. This takes about 2 minutes.
              </p>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: NAVY }}>
                    Profile photo
                  </label>
                  <ImageUploader
                    bucket="media"
                    folder="profiles"
                    value={photoUrl}
                    onChange={setPhotoUrl}
                    label="Upload your photo"
                    round
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: NAVY }}>
                    <Phone className="w-4 h-4 inline mr-1" /> Phone number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+254 700 123 456"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5DB347]"
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  onClick={handleStep1Save}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all disabled:opacity-50"
                  style={{ background: GREEN }}
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ─── Step 2 ─────────────────────────────────────────── */}
          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: NAVY }}>
                Where are you farming?
              </h2>
              <p className="text-gray-600 mb-6">Tell us your location and what you grow.</p>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: NAVY }}>
                    <MapPin className="w-4 h-4 inline mr-1" /> Country
                  </label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5DB347] bg-white"
                  >
                    <option value="">Select a country</option>
                    {ALL_AFRICAN_COUNTRIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: NAVY }}>
                    Region / City
                  </label>
                  <input
                    type="text"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    placeholder="e.g. Nakuru, Western Province"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5DB347]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: NAVY }}>
                    <Sprout className="w-4 h-4 inline mr-1" /> Primary crops
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {CROP_OPTIONS.map((crop) => {
                      const active = selectedCrops.includes(crop);
                      return (
                        <button
                          key={crop}
                          type="button"
                          onClick={() => toggleCrop(crop)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition-all text-left ${
                            active
                              ? 'border-[#5DB347] bg-[#5DB347]/10 text-[#5DB347] font-semibold'
                              : 'border-gray-200 text-gray-600 hover:border-[#5DB347]/50'
                          }`}
                        >
                          <span
                            className={`w-4 h-4 rounded border flex items-center justify-center ${
                              active ? 'bg-[#5DB347] border-[#5DB347]' : 'border-gray-300'
                            }`}
                          >
                            {active && <Check className="w-3 h-3 text-white" />}
                          </span>
                          {crop}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: NAVY }}>
                    Livestock (optional)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {LIVESTOCK_OPTIONS.map((kind) => {
                      const active = selectedLivestock.includes(kind);
                      return (
                        <button
                          key={kind}
                          type="button"
                          onClick={() => toggleLivestock(kind)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition-all text-left ${
                            active
                              ? 'border-[#5DB347] bg-[#5DB347]/10 text-[#5DB347] font-semibold'
                              : 'border-gray-200 text-gray-600 hover:border-[#5DB347]/50'
                          }`}
                        >
                          <span
                            className={`w-4 h-4 rounded border flex items-center justify-center ${
                              active ? 'bg-[#5DB347] border-[#5DB347]' : 'border-gray-300'
                            }`}
                          >
                            {active && <Check className="w-3 h-3 text-white" />}
                          </span>
                          {kind}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl font-medium text-gray-600 hover:bg-gray-50"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  onClick={handleStep2Save}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all disabled:opacity-50"
                  style={{ background: GREEN }}
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ─── Step 3 ─────────────────────────────────────────── */}
          {step === 3 && (
            <div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: NAVY }}>
                Add your first farm
              </h2>
              <p className="text-gray-600 mb-6">
                You can always add more farms later from your dashboard.
              </p>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: NAVY }}>
                    Farm name
                  </label>
                  <input
                    type="text"
                    value={farmName}
                    onChange={(e) => setFarmName(e.target.value)}
                    placeholder="e.g. Green Valley Farm"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5DB347]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: NAVY }}>
                    Size (hectares)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={1000000}
                    step="0.01"
                    value={hectares}
                    onChange={(e) => setHectares(e.target.value)}
                    placeholder="e.g. 2.5"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5DB347]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: NAVY }}>
                    GPS coordinates (optional)
                  </label>
                  <input
                    type="text"
                    value={gps}
                    onChange={(e) => setGps(e.target.value)}
                    placeholder="e.g. -1.2921, 36.8219"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5DB347]"
                  />
                  <p className="text-xs text-gray-400 mt-1">Format: latitude, longitude</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: NAVY }}>
                    Farm photo (optional)
                  </label>
                  <ImageUploader
                    bucket="media"
                    folder="farms"
                    value={farmPhoto}
                    onChange={setFarmPhoto}
                    label="Upload a photo of your farm"
                  />
                </div>
              </div>

              <div className="mt-8 flex items-center justify-between flex-wrap gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl font-medium text-gray-600 hover:bg-gray-50"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleStep3Save(true)}
                    className="text-sm text-gray-500 underline hover:text-gray-700"
                  >
                    Skip for now
                  </button>
                  <button
                    onClick={() => handleStep3Save(false)}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all disabled:opacity-50"
                    style={{ background: GREEN }}
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    Add Farm & Continue
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ─── Step 4 ─────────────────────────────────────────── */}
          {step === 4 && (
            <div className="text-center">
              <div
                className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{ background: `${GREEN}20` }}
              >
                <CheckCircle2 className="w-12 h-12" style={{ color: GREEN }} />
              </div>
              <h2 className="text-3xl font-bold mb-2" style={{ color: NAVY }}>
                You&apos;re all set, {firstName}!
              </h2>
              <p className="text-gray-600 mb-8">
                Your account is ready. Here are a few things to try next:
              </p>

              <div className="grid sm:grid-cols-3 gap-3 mb-8 text-left">
                <Link
                  href="/farm/crops"
                  className="border border-gray-200 rounded-xl p-4 hover:border-[#5DB347] hover:shadow-md transition-all"
                >
                  <Sprout className="w-6 h-6 mb-2" style={{ color: GREEN }} />
                  <p className="font-semibold text-sm" style={{ color: NAVY }}>
                    Add your first crop
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Track planting & harvest</p>
                </Link>
                <Link
                  href="/marketplace"
                  className="border border-gray-200 rounded-xl p-4 hover:border-[#5DB347] hover:shadow-md transition-all"
                >
                  <ShoppingBag className="w-6 h-6 mb-2" style={{ color: GREEN }} />
                  <p className="font-semibold text-sm" style={{ color: NAVY }}>
                    Browse the marketplace
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Seeds, tools & supplies</p>
                </Link>
                <Link
                  href="/farm/training"
                  className="border border-gray-200 rounded-xl p-4 hover:border-[#5DB347] hover:shadow-md transition-all"
                >
                  <BookOpen className="w-6 h-6 mb-2" style={{ color: GREEN }} />
                  <p className="font-semibold text-sm" style={{ color: NAVY }}>
                    Take a free training course
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Earn XP & unlock features</p>
                </Link>
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={() => setStep(3)}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl font-medium text-gray-600 hover:bg-gray-50"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  onClick={handleFinish}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all disabled:opacity-50"
                  style={{ background: GREEN }}
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Tractor className="w-4 h-4" />}
                  Go to my dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <div
            className={`px-5 py-3 rounded-xl shadow-lg text-sm font-medium ${
              toast.type === 'success' ? 'bg-[#5DB347] text-white' : 'bg-red-600 text-white'
            }`}
          >
            {toast.msg}
          </div>
        </div>
      )}
    </div>
  );
}
