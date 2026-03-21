'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sprout,
  Store,
  Users,
  ChevronRight,
  ChevronLeft,
  Check,
  Globe2,
  User,
  Phone,
  MapPin,
  Wheat,
  BarChart3,
  Bell,
  Mail,
  MessageSquare,
  Smartphone,
  BookOpen,
  ShieldCheck,
  TrendingUp,
  Package,
  UserPlus,
  LayoutDashboard,
  DollarSign,
  SkipForward,
  Loader2,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
type Role = 'farmer' | 'supplier' | 'partner';

interface OnboardingData {
  role: Role | null;
  country: string;
  fullName: string;
  phone: string;
  // Farmer
  farmName: string;
  farmSize: number;
  primaryCrops: string[];
  hasLivestock: boolean;
  // Supplier
  companyName: string;
  productCategories: string[];
  // Partner
  organizationName: string;
  partnershipType: string;
  // Preferences
  preferredLanguage: string;
  notifications: string[];
  currency: string;
}

const initialData: OnboardingData = {
  role: null,
  country: '',
  fullName: '',
  phone: '',
  farmName: '',
  farmSize: 5,
  primaryCrops: [],
  hasLivestock: false,
  companyName: '',
  productCategories: [],
  organizationName: '',
  partnershipType: '',
  preferredLanguage: 'English',
  notifications: ['Email'],
  currency: 'USD',
};

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */
const COUNTRIES = [
  { name: 'Botswana', currency: 'BWP' },
  { name: 'Zimbabwe', currency: 'ZWL' },
  { name: 'Tanzania', currency: 'TZS' },
  { name: 'Kenya', currency: 'KES' },
  { name: 'South Africa', currency: 'ZAR' },
  { name: 'Nigeria', currency: 'NGN' },
  { name: 'Zambia', currency: 'ZMW' },
  { name: 'Mozambique', currency: 'MZN' },
  { name: 'Sierra Leone', currency: 'SLL' },
];

const CROPS = ['Maize', 'Wheat', 'Sorghum', 'Coffee', 'Cotton', 'Tobacco', 'Sugarcane', 'Tea'];

const SUPPLIER_CATEGORIES = [
  'Seeds',
  'Fertilizer',
  'Pesticides',
  'Equipment',
  'Insurance',
  'Financial Services',
  'Logistics',
];

const LANGUAGES = ['English', 'Shona', 'Ndebele', 'Swahili', 'Setswana', 'Portuguese', 'Hausa'];

const NOTIFICATION_CHANNELS = [
  { key: 'SMS', icon: Phone },
  { key: 'Email', icon: Mail },
  { key: 'WhatsApp', icon: MessageSquare },
  { key: 'Push', icon: Smartphone },
];

const PARTNERSHIP_TYPES = ['NGO', 'Government', 'Research', 'Financial Institution', 'Other'];

const STEP_LABELS = ['Role', 'Profile', 'Preferences', 'Get Started'];

const roleCards: { key: Role; label: string; description: string; icon: React.ElementType; gradient: string }[] = [
  {
    key: 'farmer',
    label: 'Farmer',
    description: 'I grow crops or raise livestock',
    icon: Sprout,
    gradient: 'from-emerald-500 to-[#729E82]',
  },
  {
    key: 'supplier',
    label: 'Supplier',
    description: 'I sell agricultural inputs or services',
    icon: Store,
    gradient: 'from-blue-500 to-indigo-600',
  },
  {
    key: 'partner',
    label: 'Partner',
    description: "I'm a referral or development partner",
    icon: Users,
    gradient: 'from-amber-500 to-orange-600',
  },
];

/* ------------------------------------------------------------------ */
/*  Animation variants                                                 */
/* ------------------------------------------------------------------ */
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
  }),
};

/* ------------------------------------------------------------------ */
/*  Chip component                                                     */
/* ------------------------------------------------------------------ */
function Chip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
        selected
          ? 'bg-[#8CB89C] text-white border-[#8CB89C] shadow-md shadow-[#8CB89C]/20'
          : 'bg-white text-gray-600 border-gray-200 hover:border-[#8CB89C] hover:text-[#8CB89C]'
      }`}
    >
      {label}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */
export default function OnboardingPage() {
  const { t } = useLanguage();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [data, setData] = useState<OnboardingData>(initialData);
  const [submitting, setSubmitting] = useState(false);

  const update = <K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) =>
    setData((prev) => ({ ...prev, [key]: value }));

  const toggleArrayItem = (key: 'primaryCrops' | 'productCategories' | 'notifications', item: string) => {
    setData((prev) => {
      const arr = prev[key] as string[];
      return {
        ...prev,
        [key]: arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item],
      };
    });
  };

  const canAdvance = (): boolean => {
    if (step === 0) return data.role !== null;
    if (step === 1) return data.country !== '' && data.fullName.trim() !== '';
    return true;
  };

  const goNext = () => {
    if (!canAdvance()) return;
    setDirection(1);
    setStep((s) => Math.min(s + 1, 3));
  };

  const goBack = () => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 0));
  };

  const handleComplete = async () => {
    setSubmitting(true);
    try {
      console.log('Onboarding data:', data);
      await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } catch (err) {
      console.error('Onboarding submit error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  /* Auto-detect currency when country changes */
  const handleCountryChange = (country: string) => {
    update('country', country);
    const match = COUNTRIES.find((c) => c.name === country);
    if (match) update('currency', match.currency);
  };

  /* ---------------------------------------------------------------- */
  /*  Step 1: Welcome + Role Selection                                 */
  /* ---------------------------------------------------------------- */
  const renderStep0 = () => (
    <div className="space-y-8">
      <div className="text-center">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-4xl font-bold text-[#1B2A4A]"
        >
          Welcome to AFU Portal
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-3 text-gray-500 text-lg"
        >
          Let&apos;s get you set up. First, tell us your role.
        </motion.p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {roleCards.map((role, idx) => {
          const Icon = role.icon;
          const selected = data.role === role.key;
          return (
            <motion.button
              key={role.key}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * idx }}
              type="button"
              onClick={() => update('role', role.key)}
              className={`relative p-6 rounded-2xl border-2 transition-all duration-300 text-left ${
                selected
                  ? 'border-[#8CB89C] bg-[#EDF4EF]/50 shadow-lg shadow-[#8CB89C]/10'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
              }`}
            >
              {selected && (
                <motion.div
                  layoutId="role-check"
                  className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#8CB89C] flex items-center justify-center"
                >
                  <Check className="w-4 h-4 text-white" />
                </motion.div>
              )}
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${role.gradient} flex items-center justify-center mb-4`}
              >
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-[#1B2A4A]">{role.label}</h3>
              <p className="text-sm text-gray-500 mt-1">{role.description}</p>
            </motion.button>
          );
        })}
      </div>
    </div>
  );

  /* ---------------------------------------------------------------- */
  /*  Step 2: Country + Profile                                        */
  /* ---------------------------------------------------------------- */
  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-2">
        <h2 className="text-2xl font-bold text-[#1B2A4A]">Your Profile</h2>
        <p className="text-gray-500 mt-1">Tell us a bit about yourself</p>
      </div>

      {/* Common fields */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Country */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <MapPin className="w-4 h-4 inline mr-1" />
            Country
          </label>
          <select
            value={data.country}
            onChange={(e) => handleCountryChange(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#8CB89C] focus:border-transparent bg-white"
          >
            <option value="">Select your country</option>
            {COUNTRIES.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Full name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <User className="w-4 h-4 inline mr-1" />
            Full Name
          </label>
          <input
            type="text"
            value={data.fullName}
            onChange={(e) => update('fullName', e.target.value)}
            placeholder="Enter your full name"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#8CB89C] focus:border-transparent"
          />
        </div>

        {/* Phone */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Phone className="w-4 h-4 inline mr-1" />
            Phone Number
          </label>
          <input
            type="tel"
            value={data.phone}
            onChange={(e) => update('phone', e.target.value)}
            placeholder="+263 7XX XXX XXX"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#8CB89C] focus:border-transparent"
          />
        </div>
      </div>

      {/* Role-specific fields */}
      {data.role === 'farmer' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-4 pt-4 border-t border-gray-100"
        >
          <h3 className="font-semibold text-[#1B2A4A] flex items-center gap-2">
            <Sprout className="w-5 h-5 text-[#8CB89C]" />
            Farm Details
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Farm Name</label>
              <input
                type="text"
                value={data.farmName}
                onChange={(e) => update('farmName', e.target.value)}
                placeholder="e.g. Green Valley Farm"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#8CB89C] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Farm Size: <span className="text-[#8CB89C] font-bold">{data.farmSize} ha</span>
              </label>
              <input
                type="range"
                min={1}
                max={500}
                value={data.farmSize}
                onChange={(e) => update('farmSize', Number(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-[#8CB89C]"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>1 ha</span>
                <span>500 ha</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Primary Crops</label>
            <div className="flex flex-wrap gap-2">
              {CROPS.map((crop) => (
                <Chip
                  key={crop}
                  label={crop}
                  selected={data.primaryCrops.includes(crop)}
                  onClick={() => toggleArrayItem('primaryCrops', crop)}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">Do you have livestock?</label>
            <button
              type="button"
              onClick={() => update('hasLivestock', !data.hasLivestock)}
              className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                data.hasLivestock ? 'bg-[#8CB89C]' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
                  data.hasLivestock ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
            <span className="text-sm text-gray-500">{data.hasLivestock ? 'Yes' : 'No'}</span>
          </div>
        </motion.div>
      )}

      {data.role === 'supplier' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-4 pt-4 border-t border-gray-100"
        >
          <h3 className="font-semibold text-[#1B2A4A] flex items-center gap-2">
            <Store className="w-5 h-5 text-[#8CB89C]" />
            Company Details
          </h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
            <input
              type="text"
              value={data.companyName}
              onChange={(e) => update('companyName', e.target.value)}
              placeholder="Your company name"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#8CB89C] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Product Categories</label>
            <div className="flex flex-wrap gap-2">
              {SUPPLIER_CATEGORIES.map((cat) => (
                <Chip
                  key={cat}
                  label={cat}
                  selected={data.productCategories.includes(cat)}
                  onClick={() => toggleArrayItem('productCategories', cat)}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {data.role === 'partner' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-4 pt-4 border-t border-gray-100"
        >
          <h3 className="font-semibold text-[#1B2A4A] flex items-center gap-2">
            <Users className="w-5 h-5 text-[#8CB89C]" />
            Organization Details
          </h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name</label>
            <input
              type="text"
              value={data.organizationName}
              onChange={(e) => update('organizationName', e.target.value)}
              placeholder="Your organization"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#8CB89C] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Partnership Type</label>
            <select
              value={data.partnershipType}
              onChange={(e) => update('partnershipType', e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#8CB89C] focus:border-transparent bg-white"
            >
              <option value="">Select type</option>
              {PARTNERSHIP_TYPES.map((pt) => (
                <option key={pt} value={pt}>
                  {pt}
                </option>
              ))}
            </select>
          </div>
        </motion.div>
      )}
    </div>
  );

  /* ---------------------------------------------------------------- */
  /*  Step 3: Preferences                                              */
  /* ---------------------------------------------------------------- */
  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-2">
        <h2 className="text-2xl font-bold text-[#1B2A4A]">Your Preferences</h2>
        <p className="text-gray-500 mt-1">Customize your experience</p>
      </div>

      {/* Language */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <Globe2 className="w-4 h-4 inline mr-1" />
          Preferred Language
        </label>
        <select
          value={data.preferredLanguage}
          onChange={(e) => update('preferredLanguage', e.target.value)}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#8CB89C] focus:border-transparent bg-white"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>
      </div>

      {/* Notifications */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          <Bell className="w-4 h-4 inline mr-1" />
          Notification Preferences
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {NOTIFICATION_CHANNELS.map((ch) => {
            const Icon = ch.icon;
            const selected = data.notifications.includes(ch.key);
            return (
              <button
                key={ch.key}
                type="button"
                onClick={() => toggleArrayItem('notifications', ch.key)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all duration-200 text-sm font-medium ${
                  selected
                    ? 'border-[#8CB89C] bg-[#EDF4EF] text-[#8CB89C]'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {ch.key}
                {selected && <Check className="w-3 h-3 ml-auto" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Currency */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <DollarSign className="w-4 h-4 inline mr-1" />
          Currency Preference
          {data.country && (
            <span className="text-xs text-gray-400 ml-2">(auto-detected from {data.country})</span>
          )}
        </label>
        <input
          type="text"
          value={data.currency}
          onChange={(e) => update('currency', e.target.value)}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#8CB89C] focus:border-transparent"
        />
      </div>
    </div>
  );

  /* ---------------------------------------------------------------- */
  /*  Step 4: Getting Started                                          */
  /* ---------------------------------------------------------------- */
  const farmerRecs = [
    { label: 'Set up your farm plots', href: '/farm/crops', icon: Sprout, color: 'from-emerald-500 to-green-600' },
    { label: 'Browse insurance products', href: '/farm/insurance', icon: ShieldCheck, color: 'from-blue-500 to-indigo-600' },
    { label: 'Check market prices', href: '/farm/market-prices', icon: TrendingUp, color: 'from-amber-500 to-orange-600' },
    { label: 'Start a training course', href: '/education', icon: BookOpen, color: 'from-purple-500 to-violet-600' },
  ];

  const supplierRecs = [
    { label: 'Add your first product', href: '/supplier/products', icon: Package, color: 'from-emerald-500 to-green-600' },
    { label: 'Set up your profile', href: '/dashboard/profile', icon: User, color: 'from-blue-500 to-indigo-600' },
    { label: 'View commission structure', href: '/supplier/analytics', icon: BarChart3, color: 'from-amber-500 to-orange-600' },
  ];

  const partnerRecs = [
    { label: 'Get your referral code', href: '/dashboard/referral', icon: UserPlus, color: 'from-emerald-500 to-green-600' },
    { label: 'Explore the dashboard', href: '/dashboard', icon: LayoutDashboard, color: 'from-blue-500 to-indigo-600' },
  ];

  const recommendations =
    data.role === 'farmer' ? farmerRecs : data.role === 'supplier' ? supplierRecs : partnerRecs;

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-2">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-[#8CB89C] to-emerald-500 flex items-center justify-center mx-auto mb-4"
        >
          <Check className="w-8 h-8 text-white" />
        </motion.div>
        <h2 className="text-2xl font-bold text-[#1B2A4A]">You&apos;re All Set!</h2>
        <p className="text-gray-500 mt-1">
          Welcome aboard, <span className="font-semibold text-[#1B2A4A]">{data.fullName || 'there'}</span>. Here
          are some things you can do next:
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {recommendations.map((rec, idx) => {
          const Icon = rec.icon;
          return (
            <motion.div
              key={rec.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * idx }}
            >
              <Link
                href={rec.href}
                className="flex items-center gap-4 p-4 rounded-2xl border border-gray-200 hover:border-[#8CB89C] hover:shadow-md transition-all duration-200 group bg-white"
              >
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${rec.color} flex items-center justify-center shrink-0`}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-medium text-[#1B2A4A] group-hover:text-[#8CB89C] transition-colors">
                  {rec.label}
                </span>
                <ChevronRight className="w-4 h-4 text-gray-400 ml-auto group-hover:text-[#8CB89C] transition-colors" />
              </Link>
            </motion.div>
          );
        })}
      </div>

      <div className="pt-4">
        <button
          type="button"
          onClick={handleComplete}
          disabled={submitting}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#1B2A4A] to-[#8CB89C] text-white font-semibold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <LayoutDashboard className="w-4 h-4" />
              Go to Dashboard
            </>
          )}
        </button>
      </div>
    </div>
  );

  /* ---------------------------------------------------------------- */
  /*  Step renderers map                                               */
  /* ---------------------------------------------------------------- */
  const steps = [renderStep0, renderStep1, renderStep2, renderStep3];

  /* ---------------------------------------------------------------- */
  /*  Main render                                                      */
  /* ---------------------------------------------------------------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-[#EDF4EF]/30 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            {STEP_LABELS.map((label, idx) => (
              <div key={label} className="flex flex-col items-center flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    idx < step
                      ? 'bg-[#8CB89C] text-white'
                      : idx === step
                      ? 'bg-[#1B2A4A] text-white ring-4 ring-[#1B2A4A]/10'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {idx < step ? <Check className="w-4 h-4" /> : idx + 1}
                </div>
                <span
                  className={`text-xs mt-1.5 font-medium ${
                    idx <= step ? 'text-[#1B2A4A]' : 'text-gray-400'
                  }`}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
          {/* Progress bar */}
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#1B2A4A] to-[#8CB89C] rounded-full"
              initial={false}
              animate={{ width: `${((step + 1) / 4) * 100}%` }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
            />
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
          <div className="p-6 md:p-8">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                {steps[step]()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          {step < 3 && (
            <div className="px-6 md:px-8 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                {step > 0 && (
                  <button
                    type="button"
                    onClick={goBack}
                    className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-[#1B2A4A] transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                {step === 2 && (
                  <button
                    type="button"
                    onClick={goNext}
                    className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <SkipForward className="w-4 h-4" />
                    Skip
                  </button>
                )}
                <button
                  type="button"
                  onClick={goNext}
                  disabled={!canAdvance()}
                  className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#1B2A4A] to-[#8CB89C] text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          You can always update these settings later in your{' '}
          <Link href="/dashboard/settings" className="text-[#8CB89C] hover:underline">
            account settings
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
