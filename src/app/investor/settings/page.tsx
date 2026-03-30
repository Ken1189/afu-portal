'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  User,
  Mail,
  Phone,
  Building2,
  Bell,
  Shield,
  Key,
  Smartphone,
  Monitor,
  Clock,
  BadgeCheck,
  Calendar,
  UserCircle,
  Lock,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/lib/supabase/auth-context';
import { createClient } from '@/lib/supabase/client';

// ── Animation ────────────────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 260, damping: 24 } },
};

// ── Types ────────────────────────────────────────────────────────────────────

type CommChannel = 'email' | 'portal' | 'both';

interface CommPreferences {
  quarterlyReports: CommChannel;
  fundUpdates: CommChannel;
  marketIntelligence: CommChannel;
  impactReports: CommChannel;
}

interface ActiveSession {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  current: boolean;
}

// ── Demo Data ────────────────────────────────────────────────────────────────

const FALLBACK_SESSIONS: ActiveSession[] = [
  {
    id: '1',
    device: 'Chrome on Windows',
    location: 'London, UK',
    lastActive: 'Now',
    current: true,
  },
  {
    id: '2',
    device: 'Safari on iPhone',
    location: 'London, UK',
    lastActive: '2 hours ago',
    current: false,
  },
  {
    id: '3',
    device: 'Firefox on macOS',
    location: 'Harare, Zimbabwe',
    lastActive: '3 days ago',
    current: false,
  },
];

// ── Toggle Component ─────────────────────────────────────────────────────────

function ChannelToggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: CommChannel;
  onChange: (v: CommChannel) => void;
}) {
  const options: { key: CommChannel; label: string }[] = [
    { key: 'email', label: 'Email' },
    { key: 'portal', label: 'Portal' },
    { key: 'both', label: 'Both' },
  ];

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
      <span className="text-sm text-[#1B2A4A] font-medium">{label}</span>
      <div className="flex bg-gray-100 rounded-lg p-0.5">
        {options.map((opt) => (
          <button
            key={opt.key}
            onClick={() => onChange(opt.key)}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
              value === opt.key
                ? 'bg-[#1B2A4A] text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function InvestorSettingsPage() {
  const { user, profile, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);

  // Editable fields
  const [entityName, setEntityName] = useState('Watson Capital Partners');
  const [phoneNumber, setPhoneNumber] = useState('+44 20 7123 4567');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Investor profile fields
  const [investorProfileId, setInvestorProfileId] = useState<string | null>(null);
  const [accreditationStatus, setAccreditationStatus] = useState('verified');
  const [investorType, setInvestorType] = useState('institutional');
  const [accountOpened, setAccountOpened] = useState('15 January 2025');

  // Communication preferences
  const [commPrefs, setCommPrefs] = useState<CommPreferences>({
    quarterlyReports: 'both',
    fundUpdates: 'email',
    marketIntelligence: 'portal',
    impactReports: 'both',
  });

  // Load profile data from Supabase or use fallbacks
  useEffect(() => {
    async function loadSettings() {
      const supabase = createClient();
      try {
        if (user) {
          // Try profiles table first for core user data
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (profileData) {
            if (profileData.company_name || profileData.entity_name || profileData.organization) {
              setEntityName(String(profileData.company_name || profileData.entity_name || profileData.organization));
            }
            if (profileData.phone || profileData.phone_number) {
              setPhoneNumber(String(profileData.phone || profileData.phone_number));
            }
          }

          // Fetch investor_profiles for accreditation/type
          const { data: investorProfile } = await supabase
            .from('investor_profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();

          if (investorProfile) {
            setInvestorProfileId(investorProfile.id);
            if (investorProfile.company_name) setEntityName(investorProfile.company_name);
            if (investorProfile.accreditation_status) setAccreditationStatus(investorProfile.accreditation_status);
            if (investorProfile.investor_type) setInvestorType(investorProfile.investor_type);
            if (investorProfile.created_at) {
              setAccountOpened(new Date(investorProfile.created_at).toLocaleDateString('en-GB', {
                day: 'numeric', month: 'long', year: 'numeric',
              }));
            }
            // Load notification_preferences from investor_profiles if available
            if (investorProfile.notification_preferences) {
              const prefs = typeof investorProfile.notification_preferences === 'string'
                ? JSON.parse(investorProfile.notification_preferences)
                : investorProfile.notification_preferences;
              if (prefs.quarterlyReports || prefs.fundUpdates) {
                setCommPrefs(prefs as CommPreferences);
              }
            }
          }

          // Also try investor_settings for comm preferences (fallback)
          const { data: settingsData } = await supabase
            .from('investor_settings')
            .select('*')
            .eq('user_id', user.id)
            .single();

          if (settingsData) {
            if (settingsData.entity_name && !investorProfile?.company_name && !profileData?.company_name) {
              setEntityName(settingsData.entity_name);
            }
            if (settingsData.phone && !profileData?.phone) setPhoneNumber(settingsData.phone);
            if (settingsData.comm_preferences) {
              setCommPrefs(settingsData.comm_preferences as CommPreferences);
            }
          }
        }
      } catch {
        // keep demo fallbacks
      }
      setLoading(false);
    }
    loadSettings();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const supabase = createClient();

      // Save to profiles table
      await supabase
        .from('profiles')
        .update({
          company_name: entityName,
          phone: phoneNumber,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      // Save to investor_profiles table (accreditation, company name, notification prefs)
      if (investorProfileId) {
        await supabase
          .from('investor_profiles')
          .update({
            company_name: entityName,
            accreditation_status: accreditationStatus,
            investor_type: investorType,
            notification_preferences: commPrefs,
            updated_at: new Date().toISOString(),
          })
          .eq('id', investorProfileId);
      }

      // Save comm preferences to investor_settings (upsert) as backup
      await supabase
        .from('investor_settings')
        .upsert({
          user_id: user.id,
          entity_name: entityName,
          phone: phoneNumber,
          comm_preferences: commPrefs,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      // S2.15: Show error instead of silently failing
      alert('Failed to save settings. Please try again.');
    }
    setSaving(false);
  };

  const updateCommPref = (key: keyof CommPreferences, value: CommChannel) => {
    setCommPrefs((prev) => ({ ...prev, [key]: value }));
  };

  const displayName = profile?.full_name || 'Peter Watson';
  const displayEmail = profile?.email || user?.email || 'peter@watsoncapital.com';

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-6 h-6 text-[#1B2A4A] animate-spin" />
      </div>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* ─── Header ─── */}
      <motion.div variants={cardVariants}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 bg-[#1B2A4A]/10 rounded-xl flex items-center justify-center">
            <Settings className="w-5 h-5 text-[#1B2A4A]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1B2A4A]">Settings</h1>
            <p className="text-sm text-gray-500">Manage your account and preferences</p>
          </div>
        </div>
      </motion.div>

      {/* ─── Profile Section ─── */}
      <motion.div variants={cardVariants} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-6">
          <User className="w-5 h-5 text-[#1B2A4A]" />
          <h2 className="text-lg font-bold text-[#1B2A4A]">Profile</h2>
        </div>

        <div className="space-y-4">
          {/* Display Name - read only */}
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block">
              Display Name
            </label>
            <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
              <UserCircle className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-[#1B2A4A] font-medium">{displayName}</span>
              <span className="ml-auto text-[10px] text-gray-400 bg-gray-200 px-2 py-0.5 rounded">Read-only</span>
            </div>
          </div>

          {/* Email - read only */}
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block">
              Email
            </label>
            <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
              <Mail className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-[#1B2A4A]">{displayEmail}</span>
              <span className="ml-auto text-[10px] text-gray-400 bg-gray-200 px-2 py-0.5 rounded">Read-only</span>
            </div>
          </div>

          {/* Entity Name - editable */}
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block">
              Investment Entity Name
            </label>
            <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-gray-200 focus-within:border-[#1B2A4A] focus-within:ring-1 focus-within:ring-[#1B2A4A]/20 transition-all">
              <Building2 className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={entityName}
                onChange={(e) => setEntityName(e.target.value)}
                className="flex-1 text-sm text-[#1B2A4A] bg-transparent outline-none"
              />
            </div>
          </div>

          {/* Phone - editable */}
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block">
              Phone Number
            </label>
            <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-gray-200 focus-within:border-[#1B2A4A] focus-within:ring-1 focus-within:ring-[#1B2A4A]/20 transition-all">
              <Phone className="w-4 h-4 text-gray-400" />
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="flex-1 text-sm text-[#1B2A4A] bg-transparent outline-none"
              />
            </div>
          </div>

          {/* Save button */}
          <div className="flex justify-end pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 bg-[#1B2A4A] text-white text-sm font-medium rounded-xl hover:bg-[#243556] transition-colors disabled:opacity-60 flex items-center gap-2"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : saved ? (
                <BadgeCheck className="w-4 h-4 text-[#5DB347]" />
              ) : null}
              {saved ? 'Saved' : saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </motion.div>

      {/* ─── Communication Preferences ─── */}
      <motion.div variants={cardVariants} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-6">
          <Bell className="w-5 h-5 text-[#5DB347]" />
          <h2 className="text-lg font-bold text-[#1B2A4A]">Communication Preferences</h2>
        </div>

        <div className="space-y-0">
          <ChannelToggle
            label="Quarterly Reports"
            value={commPrefs.quarterlyReports}
            onChange={(v) => updateCommPref('quarterlyReports', v)}
          />
          <ChannelToggle
            label="Fund Updates"
            value={commPrefs.fundUpdates}
            onChange={(v) => updateCommPref('fundUpdates', v)}
          />
          <ChannelToggle
            label="Market Intelligence"
            value={commPrefs.marketIntelligence}
            onChange={(v) => updateCommPref('marketIntelligence', v)}
          />
          <ChannelToggle
            label="Impact Reports"
            value={commPrefs.impactReports}
            onChange={(v) => updateCommPref('impactReports', v)}
          />
        </div>
      </motion.div>

      {/* ─── Security ─── */}
      <motion.div variants={cardVariants} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-6">
          <Shield className="w-5 h-5 text-[#1B2A4A]" />
          <h2 className="text-lg font-bold text-[#1B2A4A]">Security</h2>
        </div>

        <div className="space-y-4">
          {/* Change Password */}
          <div className="flex items-center justify-between py-3 border-b border-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#1B2A4A]/10 flex items-center justify-center">
                <Key className="w-4 h-4 text-[#1B2A4A]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#1B2A4A]">Password</p>
                <p className="text-xs text-gray-400">Last changed 45 days ago</p>
              </div>
            </div>
            <button className="px-4 py-1.5 text-xs font-medium text-[#1B2A4A] border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              Change Password
            </button>
          </div>

          {/* 2FA */}
          <div className="flex items-center justify-between py-3 border-b border-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#5DB347]/10 flex items-center justify-center">
                <Smartphone className="w-4 h-4 text-[#5DB347]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#1B2A4A]">Two-Factor Authentication</p>
                <p className="text-xs text-gray-400">Add an extra layer of security</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                COMING SOON
              </span>
              <div className="w-10 h-5 bg-gray-200 rounded-full relative cursor-not-allowed opacity-50">
                <div className="w-4 h-4 bg-white rounded-full absolute top-0.5 left-0.5 shadow-sm" />
              </div>
            </div>
          </div>

          {/* Active Sessions */}
          <div className="pt-2">
            <p className="text-sm font-medium text-[#1B2A4A] mb-3">Active Sessions</p>
            <div className="space-y-2">
              {FALLBACK_SESSIONS.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <Monitor className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs font-medium text-[#1B2A4A]">
                        {session.device}
                        {session.current && (
                          <span className="ml-2 text-[10px] font-semibold text-[#5DB347] bg-[#5DB347]/10 px-1.5 py-0.5 rounded">
                            CURRENT
                          </span>
                        )}
                      </p>
                      <p className="text-[10px] text-gray-400">{session.location}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-400">{session.lastActive}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ─── Account ─── */}
      <motion.div variants={cardVariants} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-6">
          <Building2 className="w-5 h-5 text-[#1B2A4A]" />
          <h2 className="text-lg font-bold text-[#1B2A4A]">Account</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Investor Type */}
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <label className="text-xs text-gray-400 mb-1.5 block">Investor Type</label>
            <select
              value={investorType}
              onChange={(e) => setInvestorType(e.target.value)}
              className="w-full text-sm font-semibold text-[#1B2A4A] bg-transparent outline-none cursor-pointer"
            >
              <option value="institutional">Institutional</option>
              <option value="individual">Individual</option>
              <option value="family_office">Family Office</option>
              <option value="fund_of_funds">Fund of Funds</option>
              <option value="corporate">Corporate</option>
            </select>
          </div>

          {/* Accreditation Status */}
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <label className="text-xs text-gray-400 mb-1.5 block">Accreditation Status</label>
            <select
              value={accreditationStatus}
              onChange={(e) => setAccreditationStatus(e.target.value)}
              className={`w-full text-sm font-semibold bg-transparent outline-none cursor-pointer ${
                accreditationStatus === 'verified' ? 'text-[#5DB347]' :
                accreditationStatus === 'pending' ? 'text-amber-600' : 'text-gray-600'
              }`}
            >
              <option value="verified">Verified</option>
              <option value="pending">Pending Verification</option>
              <option value="unverified">Unverified</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          {/* Account Opened */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-400 mb-1">Account Opened</p>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <p className="text-sm font-semibold text-[#1B2A4A]">{accountOpened}</p>
            </div>
          </div>

          {/* Relationship Manager */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-400 mb-1">Relationship Manager</p>
            <p className="text-sm font-semibold text-[#1B2A4A]">AFU Investor Relations</p>
          </div>
        </div>
      </motion.div>

      {/* Bottom spacer */}
      <div className="h-4" />
    </motion.div>
  );
}
