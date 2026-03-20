'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import {
  Bell,
  MessageSquare,
  Smartphone,
  Globe,
  DollarSign,
  Clock,
  Calendar,
  Sun,
  Moon,
  Monitor,
  LayoutDashboard,
  Download,
  Cookie,
  Megaphone,
  Database,
  Trash2,
  Shield,
  Check,
  Crown,
  Star,
  Zap,
  Users,
  ArrowUpRight,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react';
/* ------------------------------------------------------------------ */
/*  Member type & data (inlined from @/lib/data/members)                */
/* ------------------------------------------------------------------ */

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  tier: 'smallholder' | 'commercial' | 'enterprise' | 'partner';
  country: string;
  region: string;
  status: 'active' | 'pending' | 'suspended';
  kycStatus: 'complete' | 'partial' | 'pending';
  profileCompleteness: number;
  farmName: string;
  farmSize: number;
  primaryCrops: string[];
  joinDate: string;
  lastActive: string;
  avatar: null;
  creditScore: number;
}

const members: Member[] = [
  { id: 'AFU-2024-001', firstName: 'Kgosi', lastName: 'Mosweu', email: 'kgosi.mosweu@email.com', phone: '+267 71 234 567', tier: 'smallholder', country: 'Botswana', region: 'North-West', status: 'active', kycStatus: 'complete', profileCompleteness: 92, farmName: 'Mosweu Family Fields', farmSize: 4.5, primaryCrops: ['Maize', 'Groundnuts'], joinDate: '2024-10-15', lastActive: '2026-03-12', avatar: null, creditScore: 72 },
  { id: 'AFU-2024-002', firstName: 'Naledi', lastName: 'Sekgoma', email: 'naledi.sekgoma@email.com', phone: '+267 72 345 678', tier: 'smallholder', country: 'Botswana', region: 'Central', status: 'active', kycStatus: 'complete', profileCompleteness: 88, farmName: 'Sunrise Lands', farmSize: 3.2, primaryCrops: ['Sorghum', 'Groundnuts'], joinDate: '2024-11-02', lastActive: '2026-03-11', avatar: null, creditScore: 65 },
];

// ---------------------------------------------------------------------------
// Current user (first member in mock data)
// ---------------------------------------------------------------------------
const currentUser = members[0];

// ---------------------------------------------------------------------------
// Tab configuration
// ---------------------------------------------------------------------------
const tabs = [
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'preferences', label: 'Preferences', icon: Globe },
  { id: 'membership', label: 'Membership', icon: Crown },
  { id: 'privacy', label: 'Data & Privacy', icon: Shield },
] as const;

type TabId = (typeof tabs)[number]['id'];

// ---------------------------------------------------------------------------
// Framer Motion variants  (string enums cast with `as const`)
// ---------------------------------------------------------------------------
const tabContentVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 12,
    transition: {
      duration: 0.15,
      ease: 'easeOut' as const,
    },
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 28,
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: 0.12,
      ease: [0.4, 0, 1, 1] as [number, number, number, number],
    },
  },
};

// ---------------------------------------------------------------------------
// Toggle component (div-based, no native checkbox)
// ---------------------------------------------------------------------------
function Toggle({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={onToggle}
      className={`
        relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full
        transition-colors duration-200 ease-in-out focus:outline-none
        ${enabled ? 'bg-teal' : 'bg-gray-200'}
      `}
    >
      <span
        className={`
          pointer-events-none inline-block h-5 w-5 transform rounded-full
          bg-white shadow-sm ring-0 transition-transform duration-200 ease-in-out
          ${enabled ? 'translate-x-5' : 'translate-x-0.5'}
          mt-[2px] ml-[2px]
        `}
      />
    </button>
  );
}

// ---------------------------------------------------------------------------
// Section card wrapper
// ---------------------------------------------------------------------------
function SectionCard({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-white rounded-xl border border-gray-100 p-6 ${className}`}
    >
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Notification toggle row
// ---------------------------------------------------------------------------
function NotificationRow({
  icon: Icon,
  label,
  description,
  enabled,
  onToggle,
}: {
  icon: React.ElementType;
  label: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 p-1.5 rounded-lg bg-gray-50 text-gray-400">
          <Icon size={16} />
        </div>
        <div>
          <p className="font-medium text-navy text-sm">{label}</p>
          <p className="text-gray-400 text-xs mt-0.5">{description}</p>
        </div>
      </div>
      <Toggle enabled={enabled} onToggle={onToggle} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Selector component (dropdown-style)
// ---------------------------------------------------------------------------
function Selector({
  label,
  icon: Icon,
  value,
  options,
  onChange,
}: {
  label: string;
  icon: React.ElementType;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-50 last:border-0">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-gray-50 text-gray-500">
          <Icon size={18} />
        </div>
        <span className="text-sm font-medium text-navy">{label}</span>
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-navy
                   focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal
                   cursor-pointer min-w-[180px]"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Membership tier data
// ---------------------------------------------------------------------------
const tierData = [
  {
    id: 'smallholder' as const,
    name: 'Smallholder',
    price: '$150/yr',
    gradient: 'from-emerald-500 to-teal',
    features: {
      contracts: 'Up to 3 offtake contracts',
      financing: '$5,000 financing limit',
      training: 'Basic training access',
      support: 'Community support',
    },
  },
  {
    id: 'commercial' as const,
    name: 'Commercial',
    price: '$500/yr',
    gradient: 'from-teal to-cyan-600',
    features: {
      contracts: 'Up to 10 offtake contracts',
      financing: '$50,000 financing limit',
      training: 'Full training library',
      support: 'Priority email support',
    },
  },
  {
    id: 'enterprise' as const,
    name: 'Enterprise',
    price: '$2,000/yr',
    gradient: 'from-gold to-amber-600',
    features: {
      contracts: 'Unlimited offtake contracts',
      financing: '$500,000 financing limit',
      training: 'Premium training + workshops',
      support: 'Dedicated account manager',
    },
  },
  {
    id: 'partner' as const,
    name: 'Partner',
    price: 'Custom',
    gradient: 'from-navy to-navy-light',
    features: {
      contracts: 'Custom contract terms',
      financing: 'Custom financing',
      training: 'White-label training',
      support: '24/7 dedicated support',
    },
  },
];

// ===========================================================================
// PAGE COMPONENT
// ===========================================================================
export default function SettingsPage() {
  // ---- Tab state ----------------------------------------------------------
  const [activeTab, setActiveTab] = useState<TabId>('notifications');

  // ---- Notification toggles -----------------------------------------------
  const [emailNotifs, setEmailNotifs] = useState({
    paymentReminders: true,
    loanStatus: true,
    deliveryAlerts: true,
    marketPrice: false,
  });

  const [smsNotifs, setSmsNotifs] = useState({
    urgentPayment: true,
    deliveryConfirm: true,
    weatherWarnings: false,
  });

  const [pushNotifs, setPushNotifs] = useState({
    trainingCourses: true,
    offtakeOpps: false,
    newsletter: false,
  });

  // ---- Preference states --------------------------------------------------
  const [language, setLanguage] = useState('en');
  const [currency, setCurrency] = useState('USD');
  const [timezone, setTimezone] = useState('Africa/Gaborone');
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');
  const [theme, setTheme] = useState('system');
  const [defaultView, setDefaultView] = useState('overview');

  // ---- Privacy toggles ----------------------------------------------------
  const [cookiePrefs, setCookiePrefs] = useState(true);
  const [marketingConsent, setMarketingConsent] = useState(false);

  // ---- Helpers ------------------------------------------------------------
  const toggleEmail = (key: keyof typeof emailNotifs) =>
    setEmailNotifs((prev) => ({ ...prev, [key]: !prev[key] }));

  const toggleSms = (key: keyof typeof smsNotifs) =>
    setSmsNotifs((prev) => ({ ...prev, [key]: !prev[key] }));

  const togglePush = (key: keyof typeof pushNotifs) =>
    setPushNotifs((prev) => ({ ...prev, [key]: !prev[key] }));

  const currentTier = currentUser.tier;

  // =========================================================================
  // RENDER
  // =========================================================================
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-navy">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage your account preferences and privacy &mdash;{' '}
          <span className="text-navy font-medium">
            {currentUser.firstName} {currentUser.lastName}
          </span>
        </p>
      </div>

      {/* Tab bar */}
      <div className="bg-gray-100 p-1 rounded-xl inline-flex gap-1 mb-8">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                relative flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium
                transition-all duration-200
                ${
                  isActive
                    ? 'bg-white text-navy shadow-sm'
                    : 'text-gray-500 hover:text-navy hover:bg-white/50'
                }
              `}
            >
              <Icon size={16} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="max-w-4xl">
        <AnimatePresence mode="wait">
          {/* ============================================================= */}
          {/* TAB 1 : NOTIFICATIONS                                         */}
          {/* ============================================================= */}
          {activeTab === 'notifications' && (
            <motion.div
              key="notifications"
              variants={tabContentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-6"
            >
              {/* Email Notifications */}
              <SectionCard>
                <div className="flex items-center gap-2 mb-4">
                  <Bell size={18} className="text-teal" />
                  <h3 className="font-semibold text-navy">
                    Email Notifications
                  </h3>
                </div>
                <NotificationRow
                  icon={DollarSign}
                  label="Payment reminders"
                  description="Get notified before payments are due"
                  enabled={emailNotifs.paymentReminders}
                  onToggle={() => toggleEmail('paymentReminders')}
                />
                <NotificationRow
                  icon={Zap}
                  label="Loan status updates"
                  description="Updates on your financing applications"
                  enabled={emailNotifs.loanStatus}
                  onToggle={() => toggleEmail('loanStatus')}
                />
                <NotificationRow
                  icon={ArrowUpRight}
                  label="Delivery alerts"
                  description="Track your produce delivery status"
                  enabled={emailNotifs.deliveryAlerts}
                  onToggle={() => toggleEmail('deliveryAlerts')}
                />
                <NotificationRow
                  icon={Star}
                  label="Market price alerts"
                  description="Get notified when commodity prices change"
                  enabled={emailNotifs.marketPrice}
                  onToggle={() => toggleEmail('marketPrice')}
                />
              </SectionCard>

              {/* SMS / WhatsApp Notifications */}
              <SectionCard>
                <div className="flex items-center gap-2 mb-4">
                  <MessageSquare size={18} className="text-teal" />
                  <h3 className="font-semibold text-navy">
                    SMS / WhatsApp Notifications
                  </h3>
                </div>
                <NotificationRow
                  icon={AlertTriangle}
                  label="Urgent payment alerts"
                  description="Critical payment deadlines via SMS"
                  enabled={smsNotifs.urgentPayment}
                  onToggle={() => toggleSms('urgentPayment')}
                />
                <NotificationRow
                  icon={Check}
                  label="Delivery confirmations"
                  description="Confirmation when produce is received"
                  enabled={smsNotifs.deliveryConfirm}
                  onToggle={() => toggleSms('deliveryConfirm')}
                />
                <NotificationRow
                  icon={Globe}
                  label="Weather warnings"
                  description="Severe weather alerts for your region"
                  enabled={smsNotifs.weatherWarnings}
                  onToggle={() => toggleSms('weatherWarnings')}
                />
              </SectionCard>

              {/* Push Notifications */}
              <SectionCard>
                <div className="flex items-center gap-2 mb-4">
                  <Smartphone size={18} className="text-teal" />
                  <h3 className="font-semibold text-navy">
                    Push Notifications
                  </h3>
                </div>
                <NotificationRow
                  icon={LayoutDashboard}
                  label="New training courses"
                  description="When new courses are available in your region"
                  enabled={pushNotifs.trainingCourses}
                  onToggle={() => togglePush('trainingCourses')}
                />
                <NotificationRow
                  icon={Users}
                  label="Offtake opportunities"
                  description="New buyer contracts and opportunities"
                  enabled={pushNotifs.offtakeOpps}
                  onToggle={() => togglePush('offtakeOpps')}
                />
                <NotificationRow
                  icon={Megaphone}
                  label="AFU newsletter"
                  description="Monthly updates from the African Farmer Union"
                  enabled={pushNotifs.newsletter}
                  onToggle={() => togglePush('newsletter')}
                />
              </SectionCard>
            </motion.div>
          )}

          {/* ============================================================= */}
          {/* TAB 2 : PREFERENCES                                           */}
          {/* ============================================================= */}
          {activeTab === 'preferences' && (
            <motion.div
              key="preferences"
              variants={tabContentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-6"
            >
              {/* Language & Regional */}
              <SectionCard>
                <h3 className="font-semibold text-navy mb-4">
                  Language &amp; Regional
                </h3>
                <Selector
                  label="Language"
                  icon={Globe}
                  value={language}
                  onChange={setLanguage}
                  options={[
                    { value: 'en', label: 'English' },
                    { value: 'fr', label: 'French' },
                    { value: 'pt', label: 'Portuguese' },
                    { value: 'sw', label: 'Swahili' },
                  ]}
                />
                <Selector
                  label="Currency"
                  icon={DollarSign}
                  value={currency}
                  onChange={setCurrency}
                  options={[
                    { value: 'USD', label: 'USD - US Dollar' },
                    { value: 'EUR', label: 'EUR - Euro' },
                    { value: 'GBP', label: 'GBP - British Pound' },
                    { value: 'ZAR', label: 'ZAR - South African Rand' },
                    { value: 'BWP', label: 'BWP - Botswana Pula' },
                    { value: 'TZS', label: 'TZS - Tanzanian Shilling' },
                  ]}
                />
                <Selector
                  label="Timezone"
                  icon={Clock}
                  value={timezone}
                  onChange={setTimezone}
                  options={[
                    {
                      value: 'Africa/Gaborone',
                      label: 'Africa/Gaborone (CAT)',
                    },
                    { value: 'Africa/Harare', label: 'Africa/Harare (CAT)' },
                    {
                      value: 'Africa/Dar_es_Salaam',
                      label: 'Africa/Dar es Salaam (EAT)',
                    },
                  ]}
                />
                <Selector
                  label="Date Format"
                  icon={Calendar}
                  value={dateFormat}
                  onChange={setDateFormat}
                  options={[
                    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
                    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
                    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
                  ]}
                />
              </SectionCard>

              {/* Appearance */}
              <SectionCard>
                <h3 className="font-semibold text-navy mb-4">Appearance</h3>
                <div className="flex items-center gap-3 py-2">
                  {(
                    [
                      { id: 'light', label: 'Light', icon: Sun },
                      { id: 'dark', label: 'Dark', icon: Moon },
                      { id: 'system', label: 'System', icon: Monitor },
                    ] as const
                  ).map((opt) => {
                    const OptIcon = opt.icon;
                    const isSelected = theme === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => setTheme(opt.id)}
                        className={`
                          flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium
                          transition-all duration-200 flex-1 justify-center
                          ${
                            isSelected
                              ? 'bg-teal/10 border-teal text-teal'
                              : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                          }
                        `}
                      >
                        <OptIcon size={16} />
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </SectionCard>

              {/* Dashboard Default View */}
              <SectionCard>
                <h3 className="font-semibold text-navy mb-4">
                  Dashboard Default View
                </h3>
                <div className="flex flex-wrap gap-3">
                  {(
                    [
                      { id: 'overview', label: 'Overview' },
                      { id: 'financing', label: 'Financing' },
                      { id: 'offtake', label: 'Offtake' },
                    ] as const
                  ).map((view) => {
                    const isSelected = defaultView === view.id;
                    return (
                      <button
                        key={view.id}
                        onClick={() => setDefaultView(view.id)}
                        className={`
                          flex items-center gap-2 px-5 py-2.5 rounded-lg border text-sm font-medium
                          transition-all duration-200
                          ${
                            isSelected
                              ? 'bg-teal/10 border-teal text-teal'
                              : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                          }
                        `}
                      >
                        {isSelected && <Check size={14} />}
                        {view.label}
                      </button>
                    );
                  })}
                </div>
              </SectionCard>
            </motion.div>
          )}

          {/* ============================================================= */}
          {/* TAB 3 : MEMBERSHIP                                            */}
          {/* ============================================================= */}
          {activeTab === 'membership' && (
            <motion.div
              key="membership"
              variants={tabContentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-6"
            >
              {/* Current Plan Banner */}
              <div
                className={`
                  relative overflow-hidden rounded-xl p-6
                  bg-gradient-to-r ${
                    tierData.find((t) => t.id === currentTier)?.gradient ??
                    'from-teal to-cyan-600'
                  }
                `}
              >
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-1">
                    <Crown size={20} className="text-white/90" />
                    <span className="text-white/70 text-sm font-medium uppercase tracking-wider">
                      Current Plan
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-1">
                    {tierData.find((t) => t.id === currentTier)?.name} Tier
                  </h2>
                  <p className="text-white/80 text-sm">
                    {tierData.find((t) => t.id === currentTier)?.price} &middot;
                    Member since {currentUser.joinDate}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {Object.values(
                      tierData.find((t) => t.id === currentTier)?.features ?? {}
                    ).map((feat) => (
                      <span
                        key={feat}
                        className="inline-flex items-center gap-1 bg-white/20 text-white text-xs px-3 py-1 rounded-full"
                      >
                        <Check size={12} />
                        {feat}
                      </span>
                    ))}
                  </div>
                </div>
                {/* Decorative circles */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
                <div className="absolute -bottom-8 -right-4 w-24 h-24 bg-white/5 rounded-full" />
              </div>

              {/* Tier Comparison */}
              <div>
                <h3 className="font-semibold text-navy mb-4">
                  Compare Plans
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {tierData.map((tier) => {
                    const isCurrent = tier.id === currentTier;
                    return (
                      <div
                        key={tier.id}
                        className={`
                          relative rounded-xl border p-5 flex flex-col
                          transition-all duration-200
                          ${
                            isCurrent
                              ? 'border-teal bg-teal/5 ring-1 ring-teal/20'
                              : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'
                          }
                        `}
                      >
                        {isCurrent && (
                          <span className="absolute -top-2.5 left-4 bg-teal text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                            Current Plan
                          </span>
                        )}
                        <h4 className="font-bold text-navy text-lg mt-1">
                          {tier.name}
                        </h4>
                        <p
                          className={`text-2xl font-bold mt-1 ${
                            tier.id === 'enterprise'
                              ? 'text-gold'
                              : 'text-navy'
                          }`}
                        >
                          {tier.price}
                        </p>
                        <div className="mt-4 space-y-2.5 flex-1">
                          {Object.entries(tier.features).map(
                            ([key, value]) => (
                              <div
                                key={key}
                                className="flex items-start gap-2"
                              >
                                <Check
                                  size={14}
                                  className={`mt-0.5 shrink-0 ${
                                    isCurrent
                                      ? 'text-teal'
                                      : 'text-gray-400'
                                  }`}
                                />
                                <span className="text-xs text-gray-600">
                                  {value}
                                </span>
                              </div>
                            )
                          )}
                        </div>
                        <div className="mt-5">
                          {isCurrent ? (
                            <div className="w-full text-center py-2 rounded-lg bg-teal/10 text-teal text-sm font-semibold">
                              Active
                            </div>
                          ) : (
                            <button className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-navy text-white text-sm font-semibold hover:bg-navy-light transition-colors">
                              Upgrade
                              <ChevronRight size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* ============================================================= */}
          {/* TAB 4 : DATA & PRIVACY                                        */}
          {/* ============================================================= */}
          {activeTab === 'privacy' && (
            <motion.div
              key="privacy"
              variants={tabContentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-6"
            >
              {/* Data Export */}
              <SectionCard>
                <div className="flex items-center gap-2 mb-2">
                  <Download size={18} className="text-teal" />
                  <h3 className="font-semibold text-navy">Data Export</h3>
                </div>
                <p className="text-gray-500 text-sm mb-4">
                  Download a copy of all data associated with your account,
                  including profile information, transaction history, and
                  activity logs.
                </p>
                <button className="inline-flex items-center gap-2 bg-teal hover:bg-teal-dark text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors">
                  <Download size={16} />
                  Export All My Data
                </button>
              </SectionCard>

              {/* Cookie Preferences */}
              <SectionCard>
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-gray-50 text-gray-500 mt-0.5">
                      <Cookie size={18} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-navy">
                        Cookie Preferences
                      </h3>
                      <p className="text-gray-500 text-sm mt-0.5">
                        Allow non-essential cookies for analytics and
                        personalisation
                      </p>
                    </div>
                  </div>
                  <Toggle
                    enabled={cookiePrefs}
                    onToggle={() => setCookiePrefs((p) => !p)}
                  />
                </div>
              </SectionCard>

              {/* Marketing Consent */}
              <SectionCard>
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-gray-50 text-gray-500 mt-0.5">
                      <Megaphone size={18} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-navy">
                        Marketing Consent
                      </h3>
                      <p className="text-gray-500 text-sm mt-0.5">
                        Receive promotional offers, partner deals, and
                        marketing communications
                      </p>
                    </div>
                  </div>
                  <Toggle
                    enabled={marketingConsent}
                    onToggle={() => setMarketingConsent((p) => !p)}
                  />
                </div>
              </SectionCard>

              {/* Data Retention */}
              <SectionCard>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-gray-50 text-gray-500 mt-0.5">
                    <Database size={18} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-navy">
                      Data Retention Policy
                    </h3>
                    <p className="text-gray-500 text-sm mt-1 leading-relaxed">
                      Your personal data is retained for the duration of your
                      membership plus 12 months after account closure, in
                      accordance with applicable data protection regulations.
                      Transaction records are kept for 7 years for compliance
                      purposes. You may request early deletion of
                      non-regulatory data at any time.
                    </p>
                  </div>
                </div>
              </SectionCard>

              {/* Account Deletion */}
              <div className="bg-white rounded-xl border-2 border-red-200 p-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-red-50 text-red-500 mt-0.5">
                    <Trash2 size={18} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-red-600">
                      Delete Account
                    </h3>
                    <p className="text-gray-500 text-sm mt-1 mb-4 leading-relaxed">
                      Permanently delete your account and all associated data.
                      This action cannot be undone. Active loans, pending
                      offtake contracts, and outstanding balances must be
                      resolved before account deletion.
                    </p>
                    <button className="inline-flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold px-5 py-2.5 rounded-lg border border-red-200 transition-colors">
                      <Trash2 size={16} />
                      Request Account Deletion
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
