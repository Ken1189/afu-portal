'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  User,
  CreditCard,
  Bell,
  Save,
  CheckCircle,
  Loader2,
  Camera,
  Globe,
  Eye,
  EyeOff,
  Linkedin,
  Instagram,
  MessageCircle,
} from 'lucide-react';
import { useAuth } from '@/lib/supabase/auth-context';
import { createClient } from '@/lib/supabase/client';

// ── Types ────────────────────────────────────────────────────────────────────

interface AmbassadorSettings {
  bio: string;
  whatsapp: string;
  linkedin: string;
  twitter: string;
  instagram: string;
  public_profile: boolean;
}

// ── Component ────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { user, profile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'payout' | 'notifications'>('profile');

  // Profile fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Ambassador-specific fields (stored in site_config)
  const [bio, setBio] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [twitter, setTwitter] = useState('');
  const [instagram, setInstagram] = useState('');
  const [publicProfile, setPublicProfile] = useState(true);

  // Payout fields
  const [payoutMethod, setPayoutMethod] = useState('bank_transfer');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [ecocashNumber, setEcocashNumber] = useState('');

  // Notification preferences
  const [notifyNewReferral, setNotifyNewReferral] = useState(true);
  const [notifyCommission, setNotifyCommission] = useState(true);
  const [notifyPayout, setNotifyPayout] = useState(true);
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifySMS, setNotifySMS] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Set profile data
    if (profile) {
      setFullName(profile.full_name || '');
      setEmail(profile.email || '');
      setPhone(profile.phone || '');
      setAvatarUrl(profile.avatar_url || '');
    }

    const supabase = createClient();

    async function fetchSettings() {
      try {
        // Fetch ambassador payout/notification data
        const { data: ambassador } = await supabase
          .from('ambassadors')
          .select('payout_method, payout_details, notification_preferences')
          .eq('user_id', user!.id)
          .single();

        if (ambassador) {
          if (ambassador.payout_method) setPayoutMethod(ambassador.payout_method);
          if (ambassador.payout_details) {
            const details = typeof ambassador.payout_details === 'string'
              ? JSON.parse(ambassador.payout_details)
              : ambassador.payout_details;
            setBankName(details.bank_name || '');
            setAccountNumber(details.account_number || '');
            setMobileNumber(details.mobile_number || '');
            setEcocashNumber(details.ecocash_number || '');
          }
          if (ambassador.notification_preferences) {
            const prefs = typeof ambassador.notification_preferences === 'string'
              ? JSON.parse(ambassador.notification_preferences)
              : ambassador.notification_preferences;
            setNotifyNewReferral(prefs.new_referral !== false);
            setNotifyCommission(prefs.commission_earned !== false);
            setNotifyPayout(prefs.payout_processed !== false);
            setNotifyEmail(prefs.email !== false);
            setNotifySMS(prefs.sms === true);
          }
        }

        // Fetch ambassador-specific settings from site_config
        const configKey = `ambassador_settings_${user!.id}`;
        const { data: configData } = await supabase
          .from('site_config')
          .select('value')
          .eq('key', configKey)
          .single();

        if (configData?.value) {
          const settings = configData.value as AmbassadorSettings;
          setBio(settings.bio || '');
          setWhatsapp(settings.whatsapp || '');
          setLinkedin(settings.linkedin || '');
          setTwitter(settings.twitter || '');
          setInstagram(settings.instagram || '');
          setPublicProfile(settings.public_profile !== false);
        }
      } catch {
        // Keep defaults
      } finally {
        setLoading(false);
      }
    }

    fetchSettings();
  }, [user, profile]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploadingAvatar(true);
    try {
      const supabase = createClient();
      const ext = file.name.split('.').pop();
      const filePath = `avatars/${user.id}.${ext}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('public-assets')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('public-assets')
        .getPublicUrl(filePath);

      if (urlData?.publicUrl) {
        setAvatarUrl(urlData.publicUrl);
        // Save to profile immediately
        await supabase
          .from('profiles')
          .update({ avatar_url: urlData.publicUrl })
          .eq('id', user.id);
      }
    } catch {
      // If storage fails, user can still paste a URL
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    try {
      const supabase = createClient();

      // Update profile table
      await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          phone: phone,
          avatar_url: avatarUrl || null,
        })
        .eq('id', user.id);

      // Update ambassador payout/notifications
      const payoutDetails: Record<string, string> = {};
      if (payoutMethod === 'bank_transfer') {
        payoutDetails.bank_name = bankName;
        payoutDetails.account_number = accountNumber;
      } else if (payoutMethod === 'mobile_money') {
        payoutDetails.mobile_number = mobileNumber;
      } else if (payoutMethod === 'ecocash') {
        payoutDetails.ecocash_number = ecocashNumber;
      }

      await supabase
        .from('ambassadors')
        .update({
          payout_method: payoutMethod,
          payout_details: payoutDetails,
          notification_preferences: {
            new_referral: notifyNewReferral,
            commission_earned: notifyCommission,
            payout_processed: notifyPayout,
            email: notifyEmail,
            sms: notifySMS,
          },
        })
        .eq('user_id', user.id);

      // Save ambassador-specific settings to site_config
      const configKey = `ambassador_settings_${user.id}`;
      const settingsValue: AmbassadorSettings = {
        bio,
        whatsapp,
        linkedin,
        twitter,
        instagram,
        public_profile: publicProfile,
      };

      // Upsert into site_config
      const { error: upsertError } = await supabase
        .from('site_config')
        .upsert(
          { key: configKey, value: settingsValue },
          { onConflict: 'key' }
        );

      if (upsertError) {
        // If upsert fails (e.g. no upsert support), try update then insert
        const { error: updateError } = await supabase
          .from('site_config')
          .update({ value: settingsValue })
          .eq('key', configKey);

        if (updateError) {
          await supabase
            .from('site_config')
            .insert({ key: configKey, value: settingsValue });
        }
      }

      await refreshProfile();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      // Silently fail
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <svg className="animate-spin h-8 w-8 text-[#5DB347]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  const tabs = [
    { id: 'profile' as const, label: 'Profile & Bio', icon: User },
    { id: 'payout' as const, label: 'Payout', icon: CreditCard },
    { id: 'notifications' as const, label: 'Notifications', icon: Bell },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1B2A4A]">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your profile, payout method, and notification preferences.</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 bg-gray-50 p-1 rounded-xl">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-[#1B2A4A] shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Profile & Bio Tab */}
      {activeTab === 'profile' && (
        <>
          {/* Profile Picture */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center gap-2 mb-5">
              <Camera className="w-5 h-5 text-[#5DB347]" />
              <h2 className="text-lg font-semibold text-[#1B2A4A]">Profile Picture</h2>
            </div>
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-[#1B2A4A]/5 border-2 border-gray-200 overflow-hidden flex items-center justify-center">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-10 h-10 text-gray-300" />
                  )}
                </div>
                {uploadingAvatar && (
                  <div className="absolute inset-0 bg-white/70 rounded-full flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-[#5DB347]" />
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="px-4 py-2 rounded-lg bg-[#5DB347]/10 text-[#5DB347] text-sm font-medium hover:bg-[#5DB347]/20 transition-colors disabled:opacity-50"
                  >
                    Upload Photo
                  </button>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Or paste image URL</label>
                  <input
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://example.com/photo.jpg"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Basic Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center gap-2 mb-5">
              <User className="w-5 h-5 text-[#5DB347]" />
              <h2 className="text-lg font-semibold text-[#1B2A4A]">Basic Information</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                />
                <p className="text-xs text-gray-400 mt-1">Email cannot be changed here.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+254 700 000 000"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">WhatsApp Number</label>
                <div className="relative">
                  <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="+263 7X XXX XXXX"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Bio */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-[#5DB347]" />
                <h2 className="text-lg font-semibold text-[#1B2A4A]">About You</h2>
              </div>
              <span className="text-xs text-gray-400">{bio.length}/500</span>
            </div>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, 500))}
              rows={4}
              placeholder="Tell potential referrals about yourself, your experience in agriculture, and why they should join AFU..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] resize-none"
            />
          </motion.div>

          {/* Social Media Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center gap-2 mb-5">
              <Globe className="w-5 h-5 text-[#5DB347]" />
              <h2 className="text-lg font-semibold text-[#1B2A4A]">Social Media Links</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">LinkedIn</label>
                <div className="relative">
                  <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="url"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    placeholder="https://linkedin.com/in/yourprofile"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
                  />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Twitter / X</label>
                  <input
                    type="url"
                    value={twitter}
                    onChange={(e) => setTwitter(e.target.value)}
                    placeholder="https://x.com/yourhandle"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Instagram</label>
                  <div className="relative">
                    <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="url"
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      placeholder="https://instagram.com/yourhandle"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Public Profile Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1B2A4A]/5 flex items-center justify-center">
                  {publicProfile ? (
                    <Eye className="w-5 h-5 text-[#5DB347]" />
                  ) : (
                    <EyeOff className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-[#1B2A4A]">Public Profile</h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {publicProfile
                      ? 'Your profile is visible to potential referrals'
                      : 'Your profile is hidden from potential referrals'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPublicProfile(!publicProfile)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  publicProfile ? 'bg-[#5DB347]' : 'bg-gray-200'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                    publicProfile ? 'translate-x-[22px]' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </motion.div>
        </>
      )}

      {/* Payout Tab */}
      {activeTab === 'payout' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center gap-2 mb-5">
            <CreditCard className="w-5 h-5 text-[#5DB347]" />
            <h2 className="text-lg font-semibold text-[#1B2A4A]">Payout Method</h2>
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Payout Method</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { value: 'bank_transfer', label: 'Bank Transfer' },
                { value: 'mobile_money', label: 'Mobile Money' },
                { value: 'ecocash', label: 'EcoCash' },
              ].map((method) => (
                <button
                  key={method.value}
                  onClick={() => setPayoutMethod(method.value)}
                  className={`py-3 px-4 rounded-xl text-sm font-medium border-2 transition-all ${
                    payoutMethod === method.value
                      ? 'border-[#5DB347] bg-[#5DB347]/5 text-[#5DB347]'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {method.label}
                </button>
              ))}
            </div>
          </div>

          {payoutMethod === 'bank_transfer' && (
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Bank Name</label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="e.g., KCB Bank, FNB, Stanbic"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Account Number</label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="Enter account number"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
                />
              </div>
            </div>
          )}

          {payoutMethod === 'mobile_money' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Mobile Money Number</label>
              <input
                type="tel"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="+254 700 000 000"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] max-w-md"
              />
            </div>
          )}

          {payoutMethod === 'ecocash' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">EcoCash Number</label>
              <input
                type="tel"
                value={ecocashNumber}
                onChange={(e) => setEcocashNumber(e.target.value)}
                placeholder="+263 7X XXX XXXX"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] max-w-md"
              />
            </div>
          )}

          <div className="mt-6 p-4 bg-amber-50 border border-amber-100 rounded-xl">
            <p className="text-xs text-amber-700">
              Payout details are stored securely and only visible to AFU administrators processing your commissions. Minimum payout threshold is $10 USD equivalent.
            </p>
          </div>
        </motion.div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center gap-2 mb-5">
              <Bell className="w-5 h-5 text-[#5DB347]" />
              <h2 className="text-lg font-semibold text-[#1B2A4A]">Notification Events</h2>
            </div>
            <div className="space-y-4">
              {[
                { label: 'New Referral Signup', desc: 'Get notified when someone signs up using your referral link.', value: notifyNewReferral, setter: setNotifyNewReferral },
                { label: 'Commission Earned', desc: 'Get notified when you earn a new commission.', value: notifyCommission, setter: setNotifyCommission },
                { label: 'Payout Processed', desc: 'Get notified when your payout has been processed.', value: notifyPayout, setter: setNotifyPayout },
              ].map((pref) => (
                <div key={pref.label} className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium text-[#1B2A4A]">{pref.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{pref.desc}</p>
                  </div>
                  <button
                    onClick={() => pref.setter(!pref.value)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      pref.value ? 'bg-[#5DB347]' : 'bg-gray-200'
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                        pref.value ? 'translate-x-[22px]' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center gap-2 mb-5">
              <Settings className="w-5 h-5 text-[#5DB347]" />
              <h2 className="text-lg font-semibold text-[#1B2A4A]">Notification Channels</h2>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Email Notifications', desc: 'Receive notifications via email.', value: notifyEmail, setter: setNotifyEmail },
                { label: 'SMS Notifications', desc: 'Receive notifications via SMS (requires phone number).', value: notifySMS, setter: setNotifySMS },
              ].map((pref) => (
                <div key={pref.label} className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium text-[#1B2A4A]">{pref.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{pref.desc}</p>
                  </div>
                  <button
                    onClick={() => pref.setter(!pref.value)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      pref.value ? 'bg-[#5DB347]' : 'bg-gray-200'
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                        pref.value ? 'translate-x-[22px]' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}

      {/* Save Button — always visible */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex items-center gap-4 pb-6"
      >
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 rounded-xl bg-[#5DB347] text-white font-medium text-sm hover:bg-[#4ea03c] transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : saved ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
        </button>
        {saved && (
          <span className="text-sm text-green-600">Your settings have been updated successfully.</span>
        )}
      </motion.div>
    </div>
  );
}
