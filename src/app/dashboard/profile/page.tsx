'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShieldCheck,
  Edit3,
  Save,
  X,
  Camera,
  Award,
  Sprout,
  Ruler,
  Leaf,
  Star,
  CreditCard,
  FileCheck,
  AlertCircle,
  CheckCircle2,
  Clock,
  TrendingUp,
  Banknote,
  Globe2,
  Lock,
  Key,
  Smartphone,
  History,
  ChevronRight,
  Copy,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/lib/supabase/auth-context';
import { createClient } from '@/lib/supabase/client';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface MemberRecord {
  id: string;
  member_id: string;
  tier: string;
  status: string;
  farm_name: string | null;
  farm_size_ha: number | null;
  primary_crops: string[] | null;
  credit_score: number;
  join_date: string;
  bio: string | null;
  certifications: string[] | null;
}

interface KycRecord {
  id: string;
  status: string;
  created_at: string;
}

/* ------------------------------------------------------------------ */
/*  Tier / KYC display configs                                         */
/* ------------------------------------------------------------------ */

const tierConfig: Record<string, { label: string; cls: string; badge: string }> = {
  student:        { label: 'Student',            cls: 'from-sky-500 to-blue-600',       badge: 'bg-sky-500' },
  new_enterprise: { label: 'New Enterprise',     cls: 'from-amber-500 to-orange-600',   badge: 'bg-amber-500' },
  smallholder:    { label: 'Tier A: Smallholder', cls: 'from-emerald-500 to-[#5DB347]', badge: 'bg-emerald-500' },
  farmer_grower:  { label: 'Tier B: Farmer Grower', cls: 'from-blue-600 to-[#5DB347]',  badge: 'bg-blue-600' },
  commercial:     { label: 'Tier C: Commercial',  cls: 'from-purple-600 to-indigo-600', badge: 'bg-purple-600' },
};

const kycConfig: Record<string, { label: string; cls: string; icon: React.ElementType }> = {
  approved:  { label: 'Verified',    cls: 'bg-green-50 text-green-700', icon: CheckCircle2 },
  pending:   { label: 'Pending',     cls: 'bg-amber-50 text-amber-700', icon: Clock },
  rejected:  { label: 'Rejected',    cls: 'bg-red-50 text-red-700',     icon: AlertCircle },
  not_started: { label: 'Not started', cls: 'bg-gray-50 text-gray-500', icon: AlertCircle },
};

type Tab = 'personal' | 'farm' | 'security' | 'activity';

const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: 'personal', label: 'Personal Info', icon: User },
  { key: 'farm',     label: 'Farm Details',  icon: Sprout },
  { key: 'security', label: 'Security',      icon: Lock },
  { key: 'activity', label: 'Activity',      icon: History },
];

/* ------------------------------------------------------------------ */
/*  Editable field component                                           */
/* ------------------------------------------------------------------ */

function Field({
  label,
  value,
  name,
  editing,
  type = 'text',
  icon: Icon,
  onChange,
}: {
  label: string;
  value: string;
  name?: string;
  editing: boolean;
  type?: string;
  icon?: React.ElementType;
  onChange?: (val: string) => void;
}) {
  const display = value || 'Not set — click to edit';
  const isEmpty = !value;

  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1.5">{label}</label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        )}
        {editing && onChange ? (
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Not set — click to edit"
            className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/50 transition-colors`}
          />
        ) : (
          <div
            className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-cream/70 ${
              isEmpty ? 'text-gray-400 italic' : 'text-gray-700'
            }`}
          >
            {display}
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Profile page component                                             */
/* ------------------------------------------------------------------ */

export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const supabase = createClient();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('personal');
  const [copied, setCopied] = useState(false);

  // Editable fields (local state while editing)
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editCountry, setEditCountry] = useState('');

  // Avatar upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  // Extra data from members + kyc tables
  const [member, setMember] = useState<MemberRecord | null>(null);
  const [kycStatus, setKycStatus] = useState<string>('not_started');
  const [loading, setLoading] = useState(true);

  // ── Fetch member record + KYC ──
  const fetchExtras = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const [memberRes, kycRes] = await Promise.all([
      supabase
        .from('members')
        .select('*')
        .eq('profile_id', user.id)
        .maybeSingle(),
      supabase
        .from('kyc_verifications')
        .select('id, status, created_at')
        .eq('profile_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1),
    ]);

    if (memberRes.data) setMember(memberRes.data as MemberRecord);
    if (kycRes.data && kycRes.data.length > 0) {
      setKycStatus((kycRes.data[0] as KycRecord).status);
    }

    setLoading(false);
  }, [user, supabase]);

  useEffect(() => {
    fetchExtras();
  }, [fetchExtras]);

  // Sync edit fields when profile loads or editing starts
  useEffect(() => {
    if (profile) {
      setEditName(profile.full_name || '');
      setEditPhone(profile.phone || '');
      setEditCountry(profile.country || '');
      setAvatarUrl(profile.avatar_url || null);
    }
  }, [profile, editing]);

  // ── Avatar upload handler ──
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setAvatarError('Please select a JPG, PNG, or WebP image.');
      setTimeout(() => setAvatarError(null), 4000);
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setAvatarError('Image must be under 2MB.');
      setTimeout(() => setAvatarError(null), 4000);
      return;
    }

    setAvatarUploading(true);
    setAvatarError(null);

    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const filePath = `${user.id}.${ext}`;

      const { data, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      if (data) {
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(data.path);

        // Add cache-buster to force reload
        const urlWithBuster = `${publicUrl}?t=${Date.now()}`;

        await supabase
          .from('profiles')
          .update({ avatar_url: publicUrl })
          .eq('id', user.id);

        setAvatarUrl(urlWithBuster);
        await refreshProfile();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Upload failed. Please try again.';
      setAvatarError(message);
      setTimeout(() => setAvatarError(null), 4000);
    } finally {
      setAvatarUploading(false);
      // Reset file input so same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // ── Save handler ──
  const [saveError, setSaveError] = useState<string | null>(null);
  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setSaveError(null);

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: editName,
        phone: editPhone || null,
        country: editCountry || null,
      })
      .eq('id', user.id);

    if (error) {
      setSaveError('Failed to save: ' + error.message);
      setSaving(false);
      return;
    }

    await refreshProfile();
    setSaving(false);
    setEditing(false);
  };

  // ── Copy member ID ──
  const memberId = member?.member_id || profile?.id?.slice(0, 13).toUpperCase() || '';
  const handleCopyId = () => {
    navigator.clipboard.writeText(memberId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Derived values ──
  const displayName = profile?.full_name || profile?.email?.split('@')[0] || 'Member';
  const initials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const tierKey = member?.tier || 'smallholder';
  const tier = tierConfig[tierKey] || tierConfig.smallholder;
  const kyc = kycConfig[kycStatus] || kycConfig.not_started;
  const KycIcon = kyc.icon;
  const creditScore = member?.credit_score ?? null;
  const joinDate = member?.join_date || user?.created_at || '';

  // ── Loading state ──
  if (loading && !profile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[#5DB347] animate-spin" />
      </div>
    );
  }

  // ── Activity log (placeholder — would come from activity table) ──
  const activityLog = [
    { date: joinDate ? new Date(joinDate).toLocaleDateString('en-GB', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A', action: 'Joined AFU', type: 'login' as const },
  ];

  const activityIcons: Record<string, { icon: React.ElementType; color: string }> = {
    login: { icon: Globe2, color: 'text-blue-500 bg-blue-50' },
    edit: { icon: Edit3, color: 'text-[#5DB347] bg-[#5DB347]/10' },
    finance: { icon: Banknote, color: 'text-gold bg-gold/10' },
    document: { icon: FileCheck, color: 'text-purple-500 bg-purple-50' },
    training: { icon: Award, color: 'text-green-500 bg-green-50' },
    security: { icon: Lock, color: 'text-red-500 bg-red-50' },
    delivery: { icon: Leaf, color: 'text-emerald-500 bg-emerald-50' },
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-navy">My Profile</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage your account, farm details, and security settings
          </p>
        </div>
        <button
          onClick={() => {
            if (editing) {
              // cancel — reset fields
              setEditName(profile?.full_name || '');
              setEditPhone(profile?.phone || '');
              setEditCountry(profile?.country || '');
            }
            setEditing(!editing);
          }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm ${
            editing
              ? 'bg-gray-200 text-navy hover:bg-gray-300'
              : 'bg-[#5DB347] hover:bg-[#449933] text-white'
          }`}
        >
          {editing ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
          {editing ? 'Cancel Editing' : 'Edit Profile'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ==================== LEFT COLUMN ==================== */}
        <div className="lg:col-span-4 space-y-6">
          {/* Member Card */}
          <div className={`bg-gradient-to-br ${tier.cls} rounded-2xl p-6 text-white relative overflow-hidden`}>
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-4 right-4 w-32 h-32 border border-white/30 rounded-full" />
              <div className="absolute bottom-4 left-4 w-20 h-20 border border-white/20 rounded-full" />
            </div>

            <div className="relative z-10">
              {/* Avatar */}
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={avatarUploading}
                    className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30 overflow-hidden cursor-pointer hover:border-white/60 transition-colors group relative"
                    title="Click to upload avatar"
                  >
                    {avatarUploading ? (
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                    ) : avatarUrl ? (
                      <>
                        <Image
                          src={avatarUrl}
                          alt={displayName}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
                          <Camera className="w-4 h-4 text-white" />
                        </div>
                      </>
                    ) : (
                      <>
                        <span className="text-white text-xl font-bold group-hover:hidden">{initials}</span>
                        <Camera className="w-5 h-5 text-white hidden group-hover:block" />
                      </>
                    )}
                  </button>
                </div>
                <div>
                  <h2 className="text-lg font-bold">{displayName}</h2>
                  <p className="text-white/70 text-sm">{tier.label}</p>
                </div>
              </div>

              {/* Avatar error toast */}
              {avatarError && (
                <div className="bg-red-500/20 backdrop-blur-sm border border-red-400/30 rounded-lg p-2 mb-2 flex items-center gap-2 text-sm text-white">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {avatarError}
                </div>
              )}

              {/* Member ID */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 flex items-center justify-between mb-4">
                <div>
                  <p className="text-white/60 text-xs">Member ID</p>
                  <p className="font-mono font-bold text-sm">{memberId || 'N/A'}</p>
                </div>
                <button
                  onClick={handleCopyId}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  title="Copy member ID"
                >
                  {copied ? (
                    <CheckCircle2 className="w-4 h-4 text-green-300" />
                  ) : (
                    <Copy className="w-4 h-4 text-white/60" />
                  )}
                </button>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/10 rounded-lg p-3">
                  <p className="text-white/60 text-xs">Credit Score</p>
                  <p className="text-lg font-bold">{creditScore !== null ? `${creditScore}/100` : 'N/A'}</p>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <p className="text-white/60 text-xs">Member Since</p>
                  <p className="text-lg font-bold">
                    {joinDate
                      ? new Date(joinDate).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* KYC Status */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="w-5 h-5 text-[#5DB347]" />
              <h3 className="font-semibold text-navy text-sm">Verification Status</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Identity (KYC)</span>
                <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${kyc.cls}`}>
                  <KycIcon className="w-3 h-3" />
                  {kyc.label}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Info */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="font-semibold text-navy text-sm mb-4">Account Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Role</span>
                <span className="font-medium text-navy capitalize">{profile?.role || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Email</span>
                <span className="font-medium text-navy">{profile?.email || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Created</span>
                <span className="font-medium text-navy">
                  {user?.created_at
                    ? new Date(user.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                    : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ==================== RIGHT COLUMN ==================== */}
        <div className="lg:col-span-8">
          {/* Tab Navigation */}
          <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex-1 justify-center ${
                    activeTab === tab.key
                      ? 'bg-white text-navy shadow-sm'
                      : 'text-gray-500 hover:text-navy'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {/* ---------- PERSONAL INFO TAB ---------- */}
              {activeTab === 'personal' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-xl border border-gray-100 p-6">
                    <h3 className="font-semibold text-navy mb-5 flex items-center gap-2">
                      <User className="w-4 h-4 text-[#5DB347]" />
                      Personal Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <Field
                        label="Full Name"
                        value={editing ? editName : (profile?.full_name || '')}
                        editing={editing}
                        icon={User}
                        onChange={setEditName}
                      />
                      <Field
                        label="Email Address"
                        value={profile?.email || ''}
                        editing={false}
                        type="email"
                        icon={Mail}
                      />
                      <Field
                        label="Phone Number"
                        value={editing ? editPhone : (profile?.phone || '')}
                        editing={editing}
                        type="tel"
                        icon={Phone}
                        onChange={setEditPhone}
                      />
                      <Field
                        label="Country"
                        value={editing ? editCountry : (profile?.country || '')}
                        editing={editing}
                        icon={Globe2}
                        onChange={setEditCountry}
                      />
                      <Field
                        label="Region"
                        value={profile?.region || ''}
                        editing={false}
                        icon={MapPin}
                      />
                      <Field
                        label="Role"
                        value={profile?.role || ''}
                        editing={false}
                        icon={ShieldCheck}
                      />
                    </div>
                  </div>

                  {editing && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-3"
                    >
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 bg-[#5DB347] hover:bg-[#449933] text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-sm disabled:opacity-60"
                      >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        onClick={() => {
                          setEditing(false);
                          setEditName(profile?.full_name || '');
                          setEditPhone(profile?.phone || '');
                          setEditCountry(profile?.country || '');
                        }}
                        className="px-6 py-2.5 rounded-xl font-semibold text-sm border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </motion.div>
                  )}
                </div>
              )}

              {/* ---------- FARM DETAILS TAB ---------- */}
              {activeTab === 'farm' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-xl border border-gray-100 p-6">
                    <h3 className="font-semibold text-navy mb-5 flex items-center gap-2">
                      <Sprout className="w-4 h-4 text-[#5DB347]" />
                      Farm Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <Field label="Farm Name" value={member?.farm_name || ''} editing={false} icon={Sprout} />
                      <Field label="Farm Size (hectares)" value={member?.farm_size_ha != null ? String(member.farm_size_ha) : ''} editing={false} icon={Ruler} />
                      <Field label="Primary Crops" value={member?.primary_crops?.join(', ') || ''} editing={false} icon={Leaf} />
                      <Field label="Location" value={[profile?.region, profile?.country].filter(Boolean).join(', ') || ''} editing={false} icon={MapPin} />
                    </div>
                  </div>

                  {/* Farm Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'Farm Size', value: member?.farm_size_ha != null ? `${member.farm_size_ha} ha` : 'N/A', icon: Ruler, color: 'text-[#5DB347]', bg: 'bg-[#5DB347]/10' },
                      { label: 'Crops', value: member?.primary_crops ? String(member.primary_crops.length) : '0', icon: Leaf, color: 'text-green-600', bg: 'bg-green-50' },
                      { label: 'Credit Score', value: creditScore !== null ? `${creditScore}/100` : 'N/A', icon: TrendingUp, color: 'text-gold', bg: 'bg-gold/10' },
                      { label: 'Status', value: member?.status === 'active' ? 'Active' : (member?.status || 'N/A'), icon: Star, color: 'text-navy', bg: 'bg-navy/5' },
                    ].map((s) => {
                      const SIcon = s.icon;
                      return (
                        <div key={s.label} className="bg-white rounded-xl p-4 border border-gray-100">
                          <div className={`w-9 h-9 ${s.bg} rounded-lg flex items-center justify-center mb-2`}>
                            <SIcon className={`w-4 h-4 ${s.color}`} />
                          </div>
                          <p className="text-xs text-gray-500">{s.label}</p>
                          <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Certifications */}
                  <div className="bg-white rounded-xl border border-gray-100 p-6">
                    <h3 className="font-semibold text-navy mb-4 flex items-center gap-2">
                      <Award className="w-4 h-4 text-[#5DB347]" />
                      Certifications & Badges
                    </h3>
                    {member?.certifications && member.certifications.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {member.certifications.map((cert) => (
                          <div
                            key={cert}
                            className="flex items-center gap-3 p-3 rounded-lg border bg-[#5DB347]/10 border-[#5DB347]/20 text-[#5DB347]"
                          >
                            <Award className="w-5 h-5 shrink-0" />
                            <p className="text-sm font-medium">{cert}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 italic">No certifications yet</p>
                    )}
                  </div>
                </div>
              )}

              {/* ---------- SECURITY TAB ---------- */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-xl border border-gray-100 p-6">
                    <h3 className="font-semibold text-navy mb-5 flex items-center gap-2">
                      <Lock className="w-4 h-4 text-[#5DB347]" />
                      Account Security
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                            <Key className="w-5 h-5 text-navy" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-navy">Password</p>
                            <p className="text-xs text-gray-400">Manage your password</p>
                          </div>
                        </div>
                        <button className="text-sm text-[#5DB347] font-medium hover:text-[#449933] flex items-center gap-1">
                          Change <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                            <Smartphone className="w-5 h-5 text-navy" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-navy">Two-Factor Authentication</p>
                            <p className="text-xs text-gray-400">Add extra security to your account</p>
                          </div>
                        </div>
                        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium bg-amber-50 text-amber-700">
                          <AlertCircle className="w-3 h-3" />
                          Not Enabled
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                            <Globe2 className="w-5 h-5 text-navy" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-navy">Active Sessions</p>
                            <p className="text-xs text-gray-400">Manage your login sessions</p>
                          </div>
                        </div>
                        <button className="text-sm text-[#5DB347] font-medium hover:text-[#449933] flex items-center gap-1">
                          Manage <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div className="bg-white rounded-xl border border-red-200 p-6">
                    <h3 className="font-semibold text-red-600 mb-2">Danger Zone</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                    <button className="text-sm text-red-600 font-medium border border-red-200 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors">
                      Delete Account
                    </button>
                  </div>
                </div>
              )}

              {/* ---------- ACTIVITY TAB ---------- */}
              {activeTab === 'activity' && (
                <div className="bg-white rounded-xl border border-gray-100 p-6">
                  <h3 className="font-semibold text-navy mb-5 flex items-center gap-2">
                    <History className="w-4 h-4 text-[#5DB347]" />
                    Recent Activity
                  </h3>
                  <div className="relative">
                    <div className="absolute left-5 top-2 bottom-2 w-px bg-gray-200" />
                    <div className="space-y-1">
                      {activityLog.map((entry, i) => {
                        const config = activityIcons[entry.type] || activityIcons.edit;
                        const EntryIcon = config.icon;
                        return (
                          <div key={i} className="flex items-start gap-4 p-3 hover:bg-cream/50 rounded-lg transition-colors relative">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${config.color} z-10`}>
                              <EntryIcon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0 pt-1.5">
                              <p className="text-sm text-navy">{entry.action}</p>
                              <p className="text-xs text-gray-400 mt-0.5">{entry.date}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
