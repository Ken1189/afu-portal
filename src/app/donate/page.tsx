'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Heart,
  Users,
  Apple,
  Sprout,
  Shield,
  ArrowLeft,
  CheckCircle2,
  Globe,
  CreditCard,
  Smartphone,
  type LucideIcon,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

// ─── Types ───

type ProgramConfig = {
  slug: string;
  name: string;
  description: string;
  impact: string[];
  preset_amounts: number[];
};

type MethodConfig = { key: string; label: string };

type DonateContent = {
  hero: { title: string; subtitle: string };
  programs: ProgramConfig[];
  sections: {
    choose_title: string;
    donation_title: string;
    impact_title: string;
    methods_label: string;
  };
  methods: MethodConfig[];
  footer_disclaimer: string;
  success: { title: string; body: string };
};

// ─── Fallback ───

const FALLBACK_DONATE: DonateContent = {
  hero: {
    title: 'Support African Farmers',
    subtitle:
      'Every donation directly supports smallholder farmers across Africa. 100% of programme donations go to the field.',
  },
  programs: [
    {
      slug: 'women-in-agriculture',
      name: 'Women in Agriculture',
      description:
        'Empowering women farmers across Africa with access to financing, training, land rights support, and market opportunities. Your donation helps women gain financial independence and feed their communities.',
      impact: [
        'Help women farmers across Africa gain agricultural training',
        'Micro-loans for women-led farms',
        'Legal support for land ownership',
        'Childcare cooperatives enabling women to farm',
      ],
      preset_amounts: [25, 50, 100, 250, 500, 1000],
    },
    {
      slug: 'feed-a-child',
      name: 'Feed a Child',
      description:
        'Connecting surplus farm production to school feeding programmes and orphanages. Every dollar feeds a child for a week. We work directly with smallholder farmers to source nutritious food locally.',
      impact: [
        'Provide nutritious meals to children in need',
        'Connecting schools to local farms for fresh food',
        'Nutrition programmes across Africa',
        'Zero food miles — sourced from local farmers',
      ],
      preset_amounts: [10, 25, 50, 100, 250, 500],
    },
    {
      slug: 'young-farmers',
      name: 'Young Farmers Programme',
      description:
        'Investing in the next generation of African farmers. We provide agricultural education, starter seed kits, mentorship, and micro-financing to young people aged 18-30 to start and grow their own farms.',
      impact: [
        'Enrol young farmers across Africa in training programmes',
        'Starter kits distributed to aspiring farmers',
        'Mentorship pairing with experienced farmers',
        'Building a generation of sustainable farming entrepreneurs',
      ],
      preset_amounts: [25, 50, 100, 250, 500, 1000],
    },
    {
      slug: 'general',
      name: 'General Fund',
      description:
        "Support AFU's mission across all programmes. Your donation goes where it's needed most — from emergency drought relief to building rural infrastructure, veterinary services, and legal assistance for farmers.",
      impact: [
        'Emergency response for drought and flood',
        'Rural infrastructure development',
        'Free veterinary services for smallholders',
        'Legal aid for land rights disputes',
      ],
      preset_amounts: [25, 50, 100, 250, 500, 1000],
    },
  ],
  sections: {
    choose_title: 'Choose a Programme',
    donation_title: 'Your Donation',
    impact_title: 'Your Impact',
    methods_label: 'Payment methods',
  },
  methods: [
    { key: 'card', label: 'Card' },
    { key: 'mpesa', label: 'M-Pesa' },
    { key: 'ecocash', label: 'EcoCash' },
  ],
  footer_disclaimer: 'Secure payment via Stripe. AFU is a registered non-profit.',
  success: {
    title: 'Thank You for Your Generosity!',
    body: 'will make a real difference.',
  },
};

// ─── Visual maps (kept local — not in DB) ───

const PROGRAM_VISUALS: Record<string, { icon: LucideIcon; color: string; accent: string }> = {
  'women-in-agriculture': {
    icon: Users,
    color: 'bg-pink-50 text-pink-600 border-pink-200',
    accent: 'bg-pink-600',
  },
  'feed-a-child': {
    icon: Apple,
    color: 'bg-orange-50 text-orange-600 border-orange-200',
    accent: 'bg-orange-600',
  },
  'young-farmers': {
    icon: Sprout,
    color: 'bg-green-50 text-green-600 border-green-200',
    accent: 'bg-green-600',
  },
  general: {
    icon: Globe,
    color: 'bg-blue-50 text-blue-600 border-blue-200',
    accent: 'bg-blue-600',
  },
};

const METHOD_ICONS: Record<string, LucideIcon> = {
  card: CreditCard,
  mpesa: Smartphone,
  ecocash: Smartphone,
};

function getProgramVisual(slug: string) {
  return (
    PROGRAM_VISUALS[slug] || {
      icon: Globe,
      color: 'bg-gray-50 text-gray-600 border-gray-200',
      accent: 'bg-gray-600',
    }
  );
}

// ─── Component ───

export default function DonatePage() {
  const searchParams = useSearchParams();
  const programSlug = searchParams.get('program');

  const [content, setContent] = useState<DonateContent>(FALLBACK_DONATE);
  const [selectedProgram, setSelectedProgram] = useState<ProgramConfig>(
    FALLBACK_DONATE.programs.find((p) => p.slug === programSlug) || FALLBACK_DONATE.programs[0]
  );
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [isMonthly, setIsMonthly] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Fetch site_config and shallow-merge per section
  useEffect(() => {
    async function fetchContent() {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from('site_config')
          .select('value')
          .eq('key', 'page_donate')
          .single();
        if (data && data.value) {
          let parsed: Partial<DonateContent> | null = null;
          try {
            parsed = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
          } catch {
            parsed = null;
          }
          if (parsed && typeof parsed === 'object') {
            setContent({
              hero: { ...FALLBACK_DONATE.hero, ...(parsed.hero || {}) },
              programs:
                Array.isArray(parsed.programs) && parsed.programs.length > 0
                  ? parsed.programs
                  : FALLBACK_DONATE.programs,
              sections: { ...FALLBACK_DONATE.sections, ...(parsed.sections || {}) },
              methods:
                Array.isArray(parsed.methods) && parsed.methods.length > 0
                  ? parsed.methods
                  : FALLBACK_DONATE.methods,
              footer_disclaimer:
                parsed.footer_disclaimer || FALLBACK_DONATE.footer_disclaimer,
              success: { ...FALLBACK_DONATE.success, ...(parsed.success || {}) },
            });
          }
        }
      } catch {
        // keep fallback
      }
    }
    fetchContent();
  }, []);

  // Keep selected program in sync with content + URL
  useEffect(() => {
    const prog =
      content.programs.find((p) => p.slug === programSlug) || content.programs[0];
    if (prog) setSelectedProgram(prog);
  }, [programSlug, content.programs]);

  const donationAmount = selectedAmount || (customAmount ? parseFloat(customAmount) : 0);

  const [processing, setProcessing] = useState(false);
  const [payError, setPayError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!donationAmount || donationAmount <= 0) return;
    setProcessing(true);
    setPayError('');

    try {
      const res = await fetch('/api/payments/donate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(donationAmount * 100),
          program: selectedProgram.slug,
          isMonthly,
          donorName,
          donorEmail: donorEmail || undefined,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setPayError(data.error || 'Payment system unavailable. Please try again later.');
        setProcessing(false);
      }
    } catch {
      setPayError('Unable to connect to payment system. Please try again.');
      setProcessing(false);
    }
  };

  const selectedVisual = getProgramVisual(selectedProgram.slug);
  const SelectedIcon = selectedVisual.icon;

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">{content.success.title}</h1>
          <p className="text-gray-600 mb-2">
            Your {isMonthly ? 'monthly ' : ''}donation of <span className="font-semibold text-green-600">${donationAmount.toFixed(2)}</span> to{' '}
            <span className="font-semibold">{selectedProgram.name}</span> {content.success.body}
          </p>
          <p className="text-sm text-gray-400 mb-8">
            A confirmation email will be sent to {donorEmail || 'your email address'}.
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/" className="px-6 py-3 bg-[#1B2A4A] text-white rounded-full text-sm font-medium hover:bg-[#243556] transition-colors">
              Back to Home
            </Link>
            <button
              onClick={() => setSubmitted(false)}
              className="px-6 py-3 bg-[#5DB347] text-white rounded-full text-sm font-medium hover:bg-[#449933] transition-colors"
            >
              Donate Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#1B2A4A] text-white">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <Link href="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <Heart className="w-8 h-8 text-[#5DB347]" />
            <h1 className="text-3xl md:text-4xl font-bold">{content.hero.title}</h1>
          </div>
          <p className="text-white/70 text-lg max-w-2xl">{content.hero.subtitle}</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Program Selection + Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Program Cards */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{content.sections.choose_title}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {content.programs.map((prog) => {
                  const visual = getProgramVisual(prog.slug);
                  const Icon = visual.icon;
                  return (
                    <button
                      key={prog.slug}
                      onClick={() => setSelectedProgram(prog)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        selectedProgram.slug === prog.slug
                          ? 'border-[#5DB347] bg-[#EBF7E5] shadow-sm'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${visual.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 text-sm">{prog.name}</div>
                          {selectedProgram.slug === prog.slug && (
                            <div className="text-xs text-[#5DB347]">Selected</div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Program Detail */}
            <div className="bg-white rounded-xl border p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedVisual.color}`}>
                  <SelectedIcon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">{selectedProgram.name}</h3>
              </div>
              <p className="text-gray-600 leading-relaxed mb-6">{selectedProgram.description}</p>
              <h4 className="font-semibold text-gray-900 mb-3">{content.sections.impact_title}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedProgram.impact.map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#5DB347] mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-600">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Donation Form */}
          <div>
            <div className="bg-white rounded-xl border p-6 sticky top-6">
              <h3 className="font-semibold text-gray-900 mb-4">{content.sections.donation_title}</h3>

              {/* One-time / Monthly toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
                <button
                  onClick={() => setIsMonthly(false)}
                  className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                    !isMonthly ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                  }`}
                >
                  One-Time
                </button>
                <button
                  onClick={() => setIsMonthly(true)}
                  className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                    isMonthly ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                  }`}
                >
                  Monthly
                </button>
              </div>

              {/* Amount Selection */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
                {selectedProgram.preset_amounts.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => { setSelectedAmount(amount); setCustomAmount(''); }}
                    className={`py-3 rounded-lg text-sm font-semibold transition-all ${
                      selectedAmount === amount
                        ? 'bg-[#5DB347] text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    ${amount}
                  </button>
                ))}
              </div>

              {/* Custom Amount */}
              <div className="relative mb-6">
                <span className="absolute left-3 top-3 text-gray-400">$</span>
                <input
                  type="number"
                  placeholder="Custom amount"
                  value={customAmount}
                  onChange={(e) => { setCustomAmount(e.target.value); setSelectedAmount(null); }}
                  className="w-full pl-8 pr-4 py-3 border rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347] focus:border-transparent"
                  min="1"
                />
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Your name (optional)"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347] focus:border-transparent"
                />
                <input
                  type="email"
                  placeholder="Email for receipt"
                  value={donorEmail}
                  onChange={(e) => setDonorEmail(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347] focus:border-transparent"
                />

                {/* Payment Methods */}
                <div className="pt-2">
                  <p className="text-xs text-gray-400 mb-3">{content.sections.methods_label}</p>
                  <div className="flex gap-2">
                    {content.methods.map((m) => {
                      const Icon = METHOD_ICONS[m.key] || CreditCard;
                      return (
                        <div key={m.key} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg border text-xs text-gray-600">
                          <Icon className="w-3.5 h-3.5" /> {m.label}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {payError && (
                  <p className="text-sm text-red-500 text-center mb-3">{payError}</p>
                )}
                <button
                  type="submit"
                  disabled={!donationAmount || donationAmount <= 0 || processing}
                  className="w-full py-4 bg-[#5DB347] text-white rounded-xl font-semibold text-base hover:bg-[#449933] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#5DB347]/25 hover:shadow-xl hover:-translate-y-0.5"
                >
                  {processing ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                      Connecting to Stripe...
                    </span>
                  ) : (
                    <>
                      <Heart className="w-5 h-5 inline mr-2" />
                      {donationAmount > 0
                        ? `Donate $${donationAmount.toFixed(2)}${isMonthly ? '/month' : ''}`
                        : 'Select an amount'}
                    </>
                  )}
                </button>
              </form>

              <div className="mt-4 flex items-center gap-2 justify-center">
                <Shield className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-xs text-gray-400">{content.footer_disclaimer}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
