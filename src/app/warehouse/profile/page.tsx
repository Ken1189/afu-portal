'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/supabase/auth-context';
import { createClient } from '@/lib/supabase/client';
import ImageUploader from '@/components/ui/ImageUploader';
import { User, Mail, Phone, MapPin, Globe, Loader2, CheckCircle2, AlertCircle, Save } from 'lucide-react';

interface ProfileFields {
  full_name: string;
  email: string;
  phone: string;
  country: string;
  region: string;
  avatar_url: string | null;
}

const COUNTRIES = [
  'Nigeria', 'Kenya', 'Ghana', 'South Africa', 'Tanzania',
  'Uganda', 'Ethiopia', 'Rwanda', 'Zambia',
];

export default function WarehouseProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const supabase = createClient();

  const [fields, setFields] = useState<ProfileFields>({
    full_name: '',
    email: '',
    phone: '',
    country: '',
    region: '',
    avatar_url: null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [avatarVersion, setAvatarVersion] = useState(Date.now());

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, phone, country, region, avatar_url')
        .eq('id', user.id)
        .maybeSingle();
      if (cancelled) return;
      if (error) {
        showToast('error', 'Failed to load profile');
      } else if (data) {
        setFields({
          full_name: data.full_name || '',
          email: user.email || '',
          phone: data.phone || '',
          country: data.country || '',
          region: data.region || '',
          avatar_url: data.avatar_url || null,
        });
      } else {
        setFields((f) => ({ ...f, email: user.email || '' }));
      }
      setLoading(false);
    };
    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fields.full_name,
          phone: fields.phone,
          country: fields.country,
          region: fields.region,
          avatar_url: fields.avatar_url,
        })
        .eq('id', user.id);
      if (error) throw error;
      showToast('success', 'Profile updated successfully');
      try {
        await refreshProfile?.();
      } catch {}
    } catch (e: any) {
      showToast('error', e?.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = (url: string) => {
    setFields((f) => ({ ...f, avatar_url: url }));
    setAvatarVersion(Date.now());
  };

  const displayAvatar = fields.avatar_url
    ? `${fields.avatar_url}${fields.avatar_url.includes('?') ? '&' : '?'}t=${avatarVersion}`
    : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-[#5DB347] animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-20 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg ${
            toast.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-[#1B2A4A]">My Profile</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your warehouse operator account details
        </p>
      </div>

      {/* Avatar card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-[#1B2A4A] mb-4">Profile Photo</h2>
        <div className="flex items-center gap-6">
          <div className="flex-shrink-0">
            {displayAvatar ? (
              <img
                src={displayAvatar}
                alt="Avatar"
                className="w-24 h-24 rounded-full object-cover border-4 border-gray-100"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#1B2A4A] to-[#2A3F6A] flex items-center justify-center text-white text-2xl font-bold border-4 border-gray-100">
                {(fields.full_name || fields.email || 'U').charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1">
            <ImageUploader
              bucket="avatars"
              folder={user?.id}
              value={fields.avatar_url}
              onChange={handleAvatarChange}
              round={true}
              compact={true}
              label="Upload avatar"
            />
          </div>
        </div>
      </div>

      {/* Details card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-[#1B2A4A] mb-4">Personal Details</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              <User className="w-3.5 h-3.5 inline mr-1" />
              Full Name
            </label>
            <input
              type="text"
              value={fields.full_name}
              onChange={(e) => setFields({ ...fields, full_name: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] text-sm"
              placeholder="Your full name"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              <Mail className="w-3.5 h-3.5 inline mr-1" />
              Email
            </label>
            <input
              type="email"
              value={fields.email}
              readOnly
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 text-sm cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              <Phone className="w-3.5 h-3.5 inline mr-1" />
              Phone
            </label>
            <input
              type="tel"
              value={fields.phone}
              onChange={(e) => setFields({ ...fields, phone: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] text-sm"
              placeholder="+254..."
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              <Globe className="w-3.5 h-3.5 inline mr-1" />
              Country
            </label>
            <select
              value={fields.country}
              onChange={(e) => setFields({ ...fields, country: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] text-sm bg-white"
            >
              <option value="">Select country</option>
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              <MapPin className="w-3.5 h-3.5 inline mr-1" />
              Region / State
            </label>
            <input
              type="text"
              value={fields.region}
              onChange={(e) => setFields({ ...fields, region: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] text-sm"
              placeholder="e.g. Nairobi, Lagos"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 bg-[#5DB347] text-white px-6 py-2.5 rounded-xl font-medium hover:bg-[#4ea03c] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
