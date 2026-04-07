'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/supabase/auth-context';
import {
  Bell,
  MessageSquare,
  Phone,
  DollarSign,
  Globe,
  Clock,
  Loader2,
  Check,
  ChevronLeft,
  Save,
} from 'lucide-react';

type ChannelKey = 'orders' | 'payments' | 'training' | 'system' | 'marketing';
type ChannelMap = Record<ChannelKey, boolean>;

const CHANNEL_LABELS: Record<ChannelKey, string> = {
  orders: 'Orders & deliveries',
  payments: 'Payments & payouts',
  training: 'Training & courses',
  system: 'System & account',
  marketing: 'Marketing & offers',
};

const DEFAULT_EMAIL: ChannelMap = {
  orders: true,
  payments: true,
  training: true,
  system: true,
  marketing: false,
};
const DEFAULT_SMS: ChannelMap = {
  orders: true,
  payments: true,
  training: false,
  system: false,
  marketing: false,
};
const DEFAULT_WHATSAPP: ChannelMap = {
  orders: false,
  payments: false,
  training: false,
  system: false,
  marketing: false,
};

const CURRENCIES = [
  { code: 'USD', label: 'US Dollar (USD)' },
  { code: 'KES', label: 'Kenyan Shilling (KES)' },
  { code: 'TZS', label: 'Tanzanian Shilling (TZS)' },
  { code: 'UGX', label: 'Ugandan Shilling (UGX)' },
  { code: 'ZWL', label: 'Zimbabwean Dollar (ZWL)' },
  { code: 'NGN', label: 'Nigerian Naira (NGN)' },
  { code: 'GHS', label: 'Ghanaian Cedi (GHS)' },
  { code: 'ZAR', label: 'South African Rand (ZAR)' },
  { code: 'RWF', label: 'Rwandan Franc (RWF)' },
  { code: 'EUR', label: 'Euro (EUR)' },
  { code: 'GBP', label: 'British Pound (GBP)' },
];

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'sw', label: 'Swahili' },
  { code: 'fr', label: 'French' },
  { code: 'pt', label: 'Portuguese' },
  { code: 'ar', label: 'Arabic' },
  { code: 'am', label: 'Amharic' },
  { code: 'ha', label: 'Hausa' },
  { code: 'yo', label: 'Yoruba' },
  { code: 'ig', label: 'Igbo' },
  { code: 'zu', label: 'Zulu' },
  { code: 'rw', label: 'Kinyarwanda' },
  { code: 'so', label: 'Somali' },
];

const TIMEZONES = [
  'UTC',
  'Africa/Nairobi',
  'Africa/Dar_es_Salaam',
  'Africa/Kampala',
  'Africa/Kigali',
  'Africa/Addis_Ababa',
  'Africa/Lagos',
  'Africa/Accra',
  'Africa/Johannesburg',
  'Africa/Harare',
  'Africa/Cairo',
  'Africa/Casablanca',
  'Europe/London',
  'Europe/Paris',
  'America/New_York',
  'America/Los_Angeles',
  'Asia/Dubai',
];

export default function PreferencesPage() {
  const { user } = useAuth();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [emailPrefs, setEmailPrefs] = useState<ChannelMap>(DEFAULT_EMAIL);
  const [smsPrefs, setSmsPrefs] = useState<ChannelMap>(DEFAULT_SMS);
  const [whatsappPrefs, setWhatsappPrefs] = useState<ChannelMap>(DEFAULT_WHATSAPP);
  const [currency, setCurrency] = useState('USD');
  const [language, setLanguage] = useState('en');
  const [timezone, setTimezone] = useState('UTC');

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        if (data.email_notifications) setEmailPrefs({ ...DEFAULT_EMAIL, ...data.email_notifications });
        if (data.sms_notifications) setSmsPrefs({ ...DEFAULT_SMS, ...data.sms_notifications });
        if (data.whatsapp_notifications)
          setWhatsappPrefs({ ...DEFAULT_WHATSAPP, ...data.whatsapp_notifications });
        if (data.currency) setCurrency(data.currency);
        if (data.language) setLanguage(data.language);
        if (data.timezone) setTimezone(data.timezone);
      }
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const { error } = await supabase.from('user_preferences').upsert(
        {
          user_id: user.id,
          email_notifications: emailPrefs,
          sms_notifications: smsPrefs,
          whatsapp_notifications: whatsappPrefs,
          currency,
          language,
          timezone,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );
      if (error) throw error;
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e: any) {
      setError(e?.message || 'Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const ChannelGrid = ({
    title,
    icon: Icon,
    state,
    onChange,
  }: {
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    state: ChannelMap;
    onChange: (next: ChannelMap) => void;
  }) => (
    <div className="border border-gray-200 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4 text-[#5DB347]" />
        <h3 className="text-sm font-semibold text-[#1B2A4A]">{title}</h3>
      </div>
      <div className="space-y-2">
        {(Object.keys(CHANNEL_LABELS) as ChannelKey[]).map((key) => (
          <label
            key={key}
            className="flex items-center justify-between gap-3 py-1.5 cursor-pointer"
          >
            <span className="text-sm text-gray-700">{CHANNEL_LABELS[key]}</span>
            <button
              type="button"
              onClick={() => onChange({ ...state, [key]: !state[key] })}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                state[key] ? 'bg-[#5DB347]' : 'bg-gray-200'
              }`}
              aria-pressed={state[key]}
            >
              <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                  state[key] ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </button>
          </label>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-6 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Link
        href="/dashboard/settings"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1B2A4A] mb-4"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Settings
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1B2A4A]">Preferences</h1>
        <p className="text-sm text-gray-500 mt-1">
          Choose how AFU communicates with you and how data is displayed.
        </p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-100 text-red-700 text-sm p-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Notifications */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-6">
        <h2 className="text-lg font-semibold text-[#1B2A4A] mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5 text-[#5DB347]" />
          Notification Channels
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          <ChannelGrid title="Email" icon={MessageSquare} state={emailPrefs} onChange={setEmailPrefs} />
          <ChannelGrid title="SMS" icon={Phone} state={smsPrefs} onChange={setSmsPrefs} />
          <ChannelGrid title="WhatsApp" icon={MessageSquare} state={whatsappPrefs} onChange={setWhatsappPrefs} />
        </div>
      </div>

      {/* Regional */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-6">
        <h2 className="text-lg font-semibold text-[#1B2A4A] mb-4">Regional Settings</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-[#1B2A4A] mb-1">
              <DollarSign className="w-4 h-4 text-[#5DB347]" />
              Preferred currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-[#1B2A4A] mb-1">
              <Globe className="w-4 h-4 text-[#5DB347]" />
              Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-[#1B2A4A] mb-1">
              <Clock className="w-4 h-4 text-[#5DB347]" />
              Timezone
            </label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Save bar */}
      <div className="flex items-center gap-3">
        <button
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-[#5DB347] hover:bg-[#449933] text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors disabled:opacity-60"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save preferences
        </button>
        {saved && (
          <span className="inline-flex items-center gap-1.5 text-sm text-green-600">
            <Check className="w-4 h-4" />
            Saved
          </span>
        )}
      </div>
    </div>
  );
}
