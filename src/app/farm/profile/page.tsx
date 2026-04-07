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
  full_name: string;
  phone: string;
  country: string;
  region: string;
  bio: string;
  profile_photo_url: string;
}

const EMPTY_FORM: ProfileForm = {
  full_name: '',
  phone: '',
  country: '',
  region: '',
  bio: '',
  profile_photo_url: '',
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
        supabase.from('members').select('tier, join_date').eq('profile_id', user.id).maybeSingle(),
        supabase.from('farmer_tiers').select('*').eq('user_id', user.id).maybeSingle(),
      ]);

      if (profileRes.data) {
        const p = profileRes.data;
        setForm({
          full_name: p.full_name || '',
          phone: p.phone || '',
          country: p.country || '',
          region: p.region || '',
          bio: p.bio || '',
          profile_photo_url: p.profile_photo_url || p.avatar_url || '',
        });
        setEmail(p.email || user.email || '');
        setJoinDate(p.created_at || null);
      } else {
        setEmail(user.email || '');
      }

      if (memberRes.data) {
        setMemberTier(memberRes.data.tier || 'free');
        if (memberRes.data.join_date) setJoinDate(memberRes.data.join_date);
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
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: form.full_name.trim() || null,
          phone: form.phone.trim() || null,
          country: form.country || null,
          region: form.region.trim() || null,
          bio: form.bio.trim() || null,
          profile_photo_url: form.profile_photo_url || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);
      if (error) throw error;
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
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              rows={3}
              placeholder="Tell us about yourself and your farm"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] resize-none"
            />
          </div>

          {/* Save */}
          <div className="pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#5DB347] text-white rounded-xl text-sm font-semibold hover:bg-[#449933] transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
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
