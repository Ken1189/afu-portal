'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Save,
  Loader2,
  Award,
  Lock,
  Bell,
  Sprout,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/lib/supabase/auth-context';
import { createClient } from '@/lib/supabase/client';
import ImageUploader from '@/components/ui/ImageUploader';
import CapabilitiesCard from '@/components/CapabilitiesCard';
import { ALL_AFRICAN_COUNTRIES } from '@/lib/countries';
import { FARMER_TIERS, TIER_ORDER, type FarmerTier } from '@/lib/farmer-tiers';

interface ProfileForm {
  // Core
  full_name: string;
  phone: string;
  country: string;
  region: string;
  bio: string;
  profile_photo_url: string;
  // Demographics
  gender: string;
  date_of_birth: string;
  id_number: string;
  education_level: string;
  // Farming
  years_farming: string;
  number_of_staff: string;
  household_size: string;
  land_ownership: string;
  farming_method: string;
  irrigation_type: string;
  water_source: string;
  // Livestock
  cattle_count: string;
  goats_count: string;
  poultry_count: string;
  // Infrastructure
  road_access: string;
  electricity_source: string;
  distance_to_market_km: string;
  // Technology
  has_smartphone: boolean;
  internet_access: string;
  preferred_communication: string;
  // Financial
  mobile_money_number: string;
  mobile_money_provider: string;
  bank_name: string;
  // Social
  next_of_kin_name: string;
  next_of_kin_phone: string;
  next_of_kin_relationship: string;
}

const EMPTY_FORM: ProfileForm = {
  full_name: '', phone: '', country: '', region: '', bio: '', profile_photo_url: '',
  gender: '', date_of_birth: '', id_number: '', education_level: '',
  years_farming: '', number_of_staff: '', household_size: '', land_ownership: '', farming_method: '', irrigation_type: '', water_source: '',
  cattle_count: '', goats_count: '', poultry_count: '',
  road_access: '', electricity_source: '', distance_to_market_km: '',
  has_smartphone: true, internet_access: '', preferred_communication: 'whatsapp',
  mobile_money_number: '', mobile_money_provider: '', bank_name: '',
  next_of_kin_name: '', next_of_kin_phone: '', next_of_kin_relationship: '',
};

export default function FarmProfilePage() {
  const { user } = useAuth();
  const supabase = createClient();

  const [form, setForm] = useState<ProfileForm>(EMPTY_FORM);
  const [email, setEmail] = useState('');
  const [joinDate, setJoinDate] = useState<string | null>(null);
  const [memberTier, setMemberTier] = useState<string>('free');
  const [currentTier, setCurrentTier] = useState<FarmerTier>('seedling');
  const [totalXp, setTotalXp] = useState(0);
  const [coursesCompleted, setCoursesCompleted] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const fetchAll = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [profileRes, memberRes, tierRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('members').select('*').eq('profile_id', user.id).maybeSingle(),
        supabase.from('farmer_tiers').select('*').eq('user_id', user.id).maybeSingle(),
      ]);

      const p = profileRes.data;
      const m = memberRes.data;

      if (p) {
        setForm({
          full_name: p.full_name || '', phone: p.phone || '', country: p.country || '',
          region: p.region || '', bio: p.bio || '', profile_photo_url: p.profile_photo_url || p.avatar_url || '',
          gender: p.gender || '', date_of_birth: p.date_of_birth || '', id_number: p.id_number || '', education_level: p.education_level || '',
          // Member fields
          years_farming: m?.years_farming?.toString() || '', number_of_staff: m?.number_of_staff?.toString() || '',
          household_size: m?.household_size?.toString() || '', land_ownership: m?.land_ownership || '',
          farming_method: m?.farming_method || '', irrigation_type: m?.irrigation_type || '', water_source: m?.water_source || '',
          cattle_count: m?.cattle_count?.toString() || '', goats_count: m?.goats_count?.toString() || '', poultry_count: m?.poultry_count?.toString() || '',
          road_access: m?.road_access || '', electricity_source: m?.electricity_source || '', distance_to_market_km: m?.distance_to_market_km?.toString() || '',
          has_smartphone: m?.has_smartphone !== false, internet_access: m?.internet_access || '', preferred_communication: m?.preferred_communication || 'whatsapp',
          mobile_money_number: m?.mobile_money_number || '', mobile_money_provider: m?.mobile_money_provider || '', bank_name: m?.bank_name || '',
          next_of_kin_name: m?.next_of_kin_name || '', next_of_kin_phone: m?.next_of_kin_phone || '', next_of_kin_relationship: m?.next_of_kin_relationship || '',
        });
        setEmail(p.email || user.email || '');
        setJoinDate(p.created_at || null);
      } else {
        setEmail(user.email || '');
      }

      if (m) {
        setMemberTier(m.tier || 'free');
        if (m.join_date) setJoinDate(m.join_date);
      }

      if (tierRes.data) {
        setCurrentTier((tierRes.data.current_tier as FarmerTier) || 'seedling');
        setTotalXp(tierRes.data.total_xp || 0);
        setCoursesCompleted(tierRes.data.total_courses_completed || 0);
      }
    } catch (err) {
      console.error('[farm/profile] fetch error', err);
      setToast({ type: 'error', msg: 'Failed to load profile' });
    }
    setLoading(false);
  }, [user, supabase]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      // Save profile (demographics)
      const { error: profileErr } = await supabase
        .from('profiles')
        .update({
          full_name: form.full_name.trim() || null,
          phone: form.phone.trim() || null,
          country: form.country || null,
          region: form.region.trim() || null,
          bio: form.bio.trim() || null,
          profile_photo_url: form.profile_photo_url || null,
          gender: form.gender || null,
          date_of_birth: form.date_of_birth || null,
          id_number: form.id_number || null,
          education_level: form.education_level || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);
      if (profileErr) throw profileErr;

      // Save member (farming, financial, social)
      await supabase
        .from('members')
        .update({
          country: form.country || null,
          years_farming: form.years_farming ? Number(form.years_farming) : null,
          number_of_staff: form.number_of_staff ? Number(form.number_of_staff) : null,
          household_size: form.household_size ? Number(form.household_size) : null,
          land_ownership: form.land_ownership || null,
          farming_method: form.farming_method || null,
          irrigation_type: form.irrigation_type || null,
          water_source: form.water_source || null,
          cattle_count: form.cattle_count ? Number(form.cattle_count) : null,
          goats_count: form.goats_count ? Number(form.goats_count) : null,
          poultry_count: form.poultry_count ? Number(form.poultry_count) : null,
          road_access: form.road_access || null,
          electricity_source: form.electricity_source || null,
          distance_to_market_km: form.distance_to_market_km ? Number(form.distance_to_market_km) : null,
          has_smartphone: form.has_smartphone,
          internet_access: form.internet_access || null,
          preferred_communication: form.preferred_communication || null,
          mobile_money_number: form.mobile_money_number || null,
          mobile_money_provider: form.mobile_money_provider || null,
          bank_name: form.bank_name || null,
          next_of_kin_name: form.next_of_kin_name || null,
          next_of_kin_phone: form.next_of_kin_phone || null,
          next_of_kin_relationship: form.next_of_kin_relationship || null,
          updated_at: new Date().toISOString(),
        })
        .eq('profile_id', user.id);

      setToast({ type: 'success', msg: 'Profile saved' });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save';
      setToast({ type: 'error', msg });
    }
    setSaving(false);
    setTimeout(() => setToast(null), 3500);
  };

  const tierIdx = TIER_ORDER.indexOf(currentTier);
  const tierProgressPct = ((tierIdx + 1) / TIER_ORDER.length) * 100;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-[#5DB347] animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1B2A4A] flex items-center gap-2">
          <User className="w-6 h-6 text-[#5DB347]" />
          My Profile
        </h1>
        <p className="text-sm text-gray-500 mt-1">Manage your account, photo, and preferences</p>
      </div>

      {/* Tier progression */}
      <div className="bg-gradient-to-br from-[#1B2A4A] to-[#5DB347] rounded-2xl p-5 text-white">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs opacity-75 uppercase tracking-wider">Your Tier</p>
            <p className="text-xl font-bold">{FARMER_TIERS[currentTier].name}</p>
            <p className="text-xs opacity-80 mt-0.5">{FARMER_TIERS[currentTier].description}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-extrabold">{totalXp}</p>
            <p className="text-[10px] opacity-75 uppercase tracking-wider">Total XP</p>
          </div>
        </div>
        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all"
            style={{ width: `${tierProgressPct}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-[10px] opacity-80">
          {TIER_ORDER.map((t) => (
            <span key={t} className={t === currentTier ? 'font-bold' : ''}>
              {FARMER_TIERS[t].name}
            </span>
          ))}
        </div>
        <p className="text-[11px] opacity-75 mt-2">{coursesCompleted} courses completed</p>
      </div>

      {/* Editable form */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6">
        <h2 className="text-lg font-bold text-[#1B2A4A] mb-4">Personal Information</h2>

        <div className="space-y-4">
          {/* Photo */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Profile Photo</label>
            <ImageUploader
              bucket="media"
              folder={`profiles/${user?.id || 'shared'}`}
              value={form.profile_photo_url}
              onChange={(url) => setForm({ ...form, profile_photo_url: url })}
              label="Upload Profile Photo"
              round
            />
          </div>

          {/* Full name */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Full Name</label>
            <input
              type="text"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              placeholder="e.g. Tendai Moyo"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
            />
          </div>

          {/* Email (read only) */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Email (read-only)</label>
            <div className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl text-gray-500">
              <Mail className="w-4 h-4 text-gray-400" />
              {email}
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+263 77 123 4567"
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
              />
            </div>
          </div>

          {/* Country + Region */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Country</label>
              <select
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
              >
                <option value="">Select country</option>
                {ALL_AFRICAN_COUNTRIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Region / State</label>
              <input
                type="text"
                value={form.region}
                onChange={(e) => setForm({ ...form, region: e.target.value })}
                placeholder="e.g. Mashonaland West"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
              />
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">About / Bio</label>
            <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} placeholder="Tell us about yourself and your farm" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] resize-none" />
          </div>

          {/* Demographics */}
          <div className="border-t border-gray-100 pt-4 mt-2">
            <h3 className="text-sm font-bold text-[#1B2A4A] mb-3">Demographics</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Gender</label>
                <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white">
                  <option value="">Not specified</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Date of Birth</label>
                <input type="date" value={form.date_of_birth} onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">ID Number</label>
                <input value={form.id_number} onChange={(e) => setForm({ ...form, id_number: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl" placeholder="National ID" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Education Level</label>
                <select value={form.education_level} onChange={(e) => setForm({ ...form, education_level: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white">
                  <option value="">Not specified</option>
                  <option value="None">None</option>
                  <option value="Primary">Primary</option>
                  <option value="Secondary">Secondary</option>
                  <option value="Tertiary">Tertiary / University</option>
                  <option value="Vocational">Vocational / Technical</option>
                  <option value="Postgraduate">Postgraduate</option>
                </select>
              </div>
            </div>
          </div>

          {/* Farming Details */}
          <div className="border-t border-gray-100 pt-4 mt-2">
            <h3 className="text-sm font-bold text-[#1B2A4A] mb-3">Farming Details</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Years Farming</label>
                <input type="number" value={form.years_farming} onChange={(e) => setForm({ ...form, years_farming: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl" placeholder="0" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Number of Staff</label>
                <input type="number" value={form.number_of_staff} onChange={(e) => setForm({ ...form, number_of_staff: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl" placeholder="0" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Household Size</label>
                <input type="number" value={form.household_size} onChange={(e) => setForm({ ...form, household_size: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl" placeholder="0" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Land Ownership</label>
                <select value={form.land_ownership} onChange={(e) => setForm({ ...form, land_ownership: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white">
                  <option value="">Not specified</option>
                  <option value="owned">Owned</option>
                  <option value="leased">Leased</option>
                  <option value="communal">Communal</option>
                  <option value="family">Family</option>
                  <option value="rented">Rented</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Farming Method</label>
                <select value={form.farming_method} onChange={(e) => setForm({ ...form, farming_method: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white">
                  <option value="">Not specified</option>
                  <option value="conventional">Conventional</option>
                  <option value="organic">Organic</option>
                  <option value="conservation">Conservation</option>
                  <option value="mixed">Mixed</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Irrigation</label>
                <select value={form.irrigation_type} onChange={(e) => setForm({ ...form, irrigation_type: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white">
                  <option value="">Not specified</option>
                  <option value="rainfed">Rainfed</option>
                  <option value="drip">Drip</option>
                  <option value="sprinkler">Sprinkler</option>
                  <option value="flood">Flood</option>
                  <option value="pivot">Pivot</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Water Source</label>
                <select value={form.water_source} onChange={(e) => setForm({ ...form, water_source: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white">
                  <option value="">Not specified</option>
                  <option value="borehole">Borehole</option>
                  <option value="river">River</option>
                  <option value="dam">Dam</option>
                  <option value="municipal">Municipal</option>
                  <option value="rainwater">Rainwater</option>
                </select>
              </div>
            </div>
          </div>

          {/* Livestock */}
          <div className="border-t border-gray-100 pt-4 mt-2">
            <h3 className="text-sm font-bold text-[#1B2A4A] mb-3">Livestock</h3>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Cattle</label>
                <input type="number" value={form.cattle_count} onChange={(e) => setForm({ ...form, cattle_count: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl" placeholder="0" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Goats</label>
                <input type="number" value={form.goats_count} onChange={(e) => setForm({ ...form, goats_count: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl" placeholder="0" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Poultry</label>
                <input type="number" value={form.poultry_count} onChange={(e) => setForm({ ...form, poultry_count: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl" placeholder="0" />
              </div>
            </div>
          </div>

          {/* Infrastructure */}
          <div className="border-t border-gray-100 pt-4 mt-2">
            <h3 className="text-sm font-bold text-[#1B2A4A] mb-3">Infrastructure</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Road Access</label>
                <select value={form.road_access} onChange={(e) => setForm({ ...form, road_access: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white">
                  <option value="">Not specified</option>
                  <option value="tarred">Tarred</option>
                  <option value="gravel">Gravel</option>
                  <option value="dirt">Dirt</option>
                  <option value="none">No road</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Electricity</label>
                <select value={form.electricity_source} onChange={(e) => setForm({ ...form, electricity_source: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white">
                  <option value="">Not specified</option>
                  <option value="grid">Grid</option>
                  <option value="solar">Solar</option>
                  <option value="generator">Generator</option>
                  <option value="none">None</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Distance to Market (km)</label>
                <input type="number" value={form.distance_to_market_km} onChange={(e) => setForm({ ...form, distance_to_market_km: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl" placeholder="0" />
              </div>
            </div>
          </div>

          {/* Technology & Communication */}
          <div className="border-t border-gray-100 pt-4 mt-2">
            <h3 className="text-sm font-bold text-[#1B2A4A] mb-3">Technology</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={form.has_smartphone} onChange={(e) => setForm({ ...form, has_smartphone: e.target.checked })} className="rounded border-gray-300 text-[#5DB347]" id="smartphone" />
                <label htmlFor="smartphone" className="text-sm text-gray-700">Has smartphone</label>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Internet Access</label>
                <select value={form.internet_access} onChange={(e) => setForm({ ...form, internet_access: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white">
                  <option value="">Not specified</option>
                  <option value="mobile_data">Mobile Data</option>
                  <option value="wifi">WiFi</option>
                  <option value="none">None</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Preferred Contact</label>
                <select value={form.preferred_communication} onChange={(e) => setForm({ ...form, preferred_communication: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white">
                  <option value="whatsapp">WhatsApp</option>
                  <option value="sms">SMS</option>
                  <option value="call">Phone Call</option>
                  <option value="email">Email</option>
                </select>
              </div>
            </div>
          </div>

          {/* Financial / Mobile Money */}
          <div className="border-t border-gray-100 pt-4 mt-2">
            <h3 className="text-sm font-bold text-[#1B2A4A] mb-3">Financial</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Mobile Money Number</label>
                <input value={form.mobile_money_number} onChange={(e) => setForm({ ...form, mobile_money_number: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl" placeholder="+263 77..." />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Provider</label>
                <select value={form.mobile_money_provider} onChange={(e) => setForm({ ...form, mobile_money_provider: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white">
                  <option value="">Select...</option>
                  <option value="EcoCash">EcoCash</option>
                  <option value="M-Pesa">M-Pesa</option>
                  <option value="MTN MoMo">MTN MoMo</option>
                  <option value="Orange Money">Orange Money</option>
                  <option value="Airtel Money">Airtel Money</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Bank Name</label>
                <input value={form.bank_name} onChange={(e) => setForm({ ...form, bank_name: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl" placeholder="e.g. CBZ, FNB, Stanbic" />
              </div>
            </div>
          </div>

          {/* Next of Kin */}
          <div className="border-t border-gray-100 pt-4 mt-2">
            <h3 className="text-sm font-bold text-[#1B2A4A] mb-3">Next of Kin</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
                <input value={form.next_of_kin_name} onChange={(e) => setForm({ ...form, next_of_kin_name: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl" placeholder="Full name" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
                <input value={form.next_of_kin_phone} onChange={(e) => setForm({ ...form, next_of_kin_phone: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl" placeholder="+263..." />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Relationship</label>
                <select value={form.next_of_kin_relationship} onChange={(e) => setForm({ ...form, next_of_kin_relationship: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white">
                  <option value="">Select...</option>
                  <option value="spouse">Spouse</option>
                  <option value="parent">Parent</option>
                  <option value="sibling">Sibling</option>
                  <option value="child">Child</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Save */}
          <div className="pt-4 border-t border-gray-100 mt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#5DB347] text-white rounded-xl text-sm font-semibold hover:bg-[#449933] transition-colors disabled:opacity-50 min-h-[44px]"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save All Changes
            </button>
          </div>
        </div>
      </div>

      {/* Read-only info */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6">
        <h2 className="text-lg font-bold text-[#1B2A4A] mb-4">Account Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-[#5DB347] mt-0.5" />
            <div>
              <p className="text-xs text-gray-500">Joined</p>
              <p className="text-sm font-semibold text-[#1B2A4A]">
                {joinDate ? new Date(joinDate).toLocaleDateString() : '—'}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Award className="w-5 h-5 text-[#5DB347] mt-0.5" />
            <div>
              <p className="text-xs text-gray-500">Member Tier</p>
              <p className="text-sm font-semibold text-[#1B2A4A] capitalize">{memberTier}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Sprout className="w-5 h-5 text-[#5DB347] mt-0.5" />
            <div>
              <p className="text-xs text-gray-500">Progression Tier</p>
              <p className="text-sm font-semibold text-[#1B2A4A]">{FARMER_TIERS[currentTier].name}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#5DB347] mt-0.5" />
            <div>
              <p className="text-xs text-gray-500">Courses Completed</p>
              <p className="text-sm font-semibold text-[#1B2A4A]">{coursesCompleted}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Capabilities */}
      <CapabilitiesCard />

      {/* Quick links */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6">
        <h2 className="text-lg font-bold text-[#1B2A4A] mb-3">Account Settings</h2>
        <div className="space-y-2">
          <Link
            href="/dashboard/security"
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <Lock className="w-5 h-5 text-[#5DB347]" />
            <span className="text-sm font-medium text-[#1B2A4A] flex-1">Change Password & Security</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </Link>
          <Link
            href="/dashboard/preferences"
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <Bell className="w-5 h-5 text-[#5DB347]" />
            <span className="text-sm font-medium text-[#1B2A4A] flex-1">Notification Preferences</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </Link>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${
            toast.type === 'success' ? 'bg-[#5DB347] text-white' : 'bg-red-600 text-white'
          }`}
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
}
