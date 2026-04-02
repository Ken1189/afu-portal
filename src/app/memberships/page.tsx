'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const FALLBACK_TIERS = [
  {
    name: 'Free',
    slug: 'free',
    priceMonthly: 'Free',
    priceAnnual: 'Free',
    priceNote: 'forever',
    audience: 'Get started — explore the platform',
    accent: 'border-gray-300 bg-gray-50',
    accentBadge: 'bg-gray-100 text-gray-600',
    popular: false,
    features: {
      'Crop Tracking': 'Basic',
      'Financing Access': false,
      Insurance: false,
      Marketplace: 'Browse Only',
      'Training Courses': '1 Free Course',
      'AI Assistant': 'Limited',
    },
  },
  {
    name: 'Smallholder',
    slug: 'smallholder',
    priceMonthly: '$4.99',
    priceAnnual: '$49',
    priceNote: 'per month',
    audience: 'Farms under 10 hectares',
    accent: 'border-[#5DB347] bg-[#EBF7E5]',
    accentBadge: 'bg-[#5DB347]/10 text-[#5DB347]',
    popular: false,
    features: {
      'Crop Tracking': true,
      'Financing Access': 'Up to $5K',
      Insurance: 'Basic',
      Marketplace: true,
      'Training Courses': true,
      'AI Assistant': true,
      'Export Support': false,
      'Dedicated Advisor': false,
      'Insurance Discounts': false,
      'Equipment Leasing Priority': false,
      'Legal Support': false,
      'Offtake Priority': false,
      'Trade Finance Access': false,
      'Farm Manager Visits': false,
      'VIP Events': false,
    },
  },
  {
    name: 'Commercial Bronze',
    slug: 'bronze',
    priceMonthly: '$49',
    priceAnnual: '$490',
    priceNote: 'per year',
    audience: 'Growing commercial farms',
    accent: 'border-amber-600 bg-amber-50',
    accentBadge: 'bg-amber-100 text-amber-700',
    popular: false,
    features: {
      'Crop Tracking': 'Advanced',
      'Financing Access': 'Up to $50K',
      Insurance: 'Full',
      Marketplace: 'Discounted Inputs',
      'Training Courses': true,
      'AI Assistant': true,
      'Export Support': 'Basic',
      'Dedicated Advisor': false,
      'Insurance Discounts': false,
      'Trade Finance Access': 'Basic',
      'Equipment Leasing Priority': false,
      'Legal Support': false,
      'Offtake Priority': false,
      'Farm Manager Visits': false,
      'VIP Events': false,
    },
  },
  {
    name: 'Commercial Gold',
    slug: 'gold',
    priceMonthly: '$499',
    priceAnnual: '$4,990',
    priceNote: 'per year',
    audience: 'Established commercial operations',
    accent: 'border-yellow-500 bg-yellow-50',
    accentBadge: 'bg-yellow-100 text-yellow-700',
    popular: true,
    features: {
      'Crop Tracking': 'Advanced',
      'Financing Access': 'Up to $250K',
      Insurance: 'Comprehensive',
      Marketplace: 'Discounted Inputs',
      'Training Courses': true,
      'AI Assistant': 'Priority',
      'Export Support': 'Full',
      'Dedicated Advisor': 'Dedicated',
      'Insurance Discounts': '15% off',
      'Trade Finance Access': 'Full',
      'Equipment Leasing Priority': true,
      'Legal Support': false,
      'Offtake Priority': false,
      'Farm Manager Visits': false,
      'VIP Events': false,
    },
  },
  {
    name: 'Commercial Platinum',
    slug: 'platinum',
    priceMonthly: '$999',
    priceAnnual: '$9,990',
    priceNote: 'per year',
    audience: 'Large-scale & estate operations',
    accent: 'border-slate-400 bg-slate-50',
    accentBadge: 'bg-slate-200 text-slate-700',
    popular: false,
    features: {
      'Crop Tracking': 'Advanced',
      'Financing Access': 'Unlimited',
      Insurance: 'Comprehensive',
      Marketplace: 'Discounted Inputs',
      'Training Courses': true,
      'AI Assistant': 'Priority',
      'Export Support': 'Full',
      'Dedicated Advisor': 'Dedicated',
      'Insurance Discounts': '25% off',
      'Trade Finance Access': 'Full + Priority',
      'Equipment Leasing Priority': true,
      'Legal Support': true,
      'Offtake Priority': true,
      'Farm Manager Visits': true,
      'VIP Events': true,
    },
  },
  {
    name: 'Partner / Vendor',
    slug: 'partner',
    priceMonthly: 'By Application',
    priceAnnual: 'By Application',
    priceNote: '',
    byApplication: true,
    audience: 'Suppliers, offtakers, service providers',
    accent: 'border-purple-400 bg-purple-50',
    accentBadge: 'bg-purple-100 text-purple-700',
    popular: false,
    features: {
      'Crop Tracking': false,
      'Financing Access': 'Custom',
      Insurance: 'Custom',
      Marketplace: 'Directory Listing',
      'Training Courses': true,
      'AI Assistant': true,
      'Export Support': false,
      'Dedicated Advisor': 'Dedicated',
      'Insurance Discounts': false,
      'Trade Finance Access': false,
      'Equipment Leasing Priority': false,
      'Legal Support': false,
      'Offtake Priority': false,
      'Farm Manager Visits': false,
      'VIP Events': 'Co-branded Programs',
    },
  },
];

const featureKeys = [
  'Crop Tracking',
  'Financing Access',
  'Insurance',
  'Marketplace',
  'Training Courses',
  'AI Assistant',
  'Export Support',
  'Dedicated Advisor',
  'Insurance Discounts',
  'Trade Finance Access',
  'Equipment Leasing Priority',
  'Legal Support',
  'Offtake Priority',
  'Farm Manager Visits',
  'VIP Events',
];

const faqs = [
  {
    q: 'Can I upgrade or downgrade my membership at any time?',
    a: 'Yes, you can change your membership tier at any time. When upgrading, you will gain immediate access to the new features. When downgrading, your current tier benefits remain active until the end of your billing cycle. There are no penalties or lock-in periods.',
  },
  {
    q: 'Is there a discount for annual billing?',
    a: 'Yes, annual billing provides approximately 18% savings on all paid tiers. When you select annual billing during sign-up, you will see the discounted rate applied automatically. Annual plans are billed once per year.',
  },
  {
    q: 'How does the financing access limit work?',
    a: 'Financing access limits represent the maximum pre-approved credit facility available through the AFU platform. Actual financing amounts depend on your farm assessment, crop plans, and credit history. The limits increase as you build a track record with AFU.',
  },
  {
    q: 'Can I try before committing to a paid plan?',
    a: 'Yes. When you apply for any membership, our team reviews your application and you can discuss the best tier for your needs. The Smallholder plan at $4.99 per month ($49 per year) is an affordable entry point, and you can upgrade to a Commercial tier as your operation grows.',
  },
];

function FeatureCell({ value }: { value: boolean | string | undefined }) {
  if (value === true)
    return (
      <svg className="w-5 h-5 text-[#5DB347] mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    );
  if (value === false || value === undefined)
    return (
      <svg className="w-5 h-5 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    );
  return <span className="text-xs font-medium text-navy">{value}</span>;
}

export default function MembershipsPage() {
  const router = useRouter();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [isAnnual, setIsAnnual] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState('');
  const [tiers, setTiers] = useState(FALLBACK_TIERS);

  useEffect(() => {
    async function fetchTiers() {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from('site_config')
          .select('key, value')
          .like('key', 'membership_%');
        if (data && data.length > 0) {
          // If site_config has membership data in JSON format, parse and use it
          const tiersConfig = data.find((d: { key: string; value: string }) => d.key === 'membership_tiers');
          if (tiersConfig && tiersConfig.value) {
            try {
              const parsed = JSON.parse(tiersConfig.value);
              if (Array.isArray(parsed) && parsed.length > 0) {
                setTiers(parsed);
              }
            } catch {
              // keep fallback if JSON parse fails
            }
          }
        }
      } catch {
        // keep fallback
      }
    }
    fetchTiers();
  }, []);

  const handleCheckout = async (tierSlug: string) => {
    if (tierSlug === 'free') {
      router.push('/apply');
      return;
    }
    if (tierSlug === 'partner') {
      router.push('/contact');
      return;
    }
    setCheckoutLoading(tierSlug);
    setCheckoutError('');
    try {
      const res = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'membership', tier: tierSlug }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.assign(data.url);
      } else {
        setCheckoutError('Payment system is being configured. Please contact us or try again later.');
        setCheckoutLoading(null);
      }
    } catch {
      setCheckoutError('Unable to connect to payment system. Please try again.');
      setCheckoutLoading(null);
    }
  };

  return (
    <>
      {/* Hero */}
      <section className="gradient-navy text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-glow">
            Join the{' '}
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #6ABF4B, #5DB347, #449933)' }}>
              African Farming Union
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl leading-relaxed">
            Empowering farmers at every level &mdash; from students and aspiring
            growers to large commercial operations. Choose the membership that
            fits your farming journey.
          </p>
        </div>
      </section>

      {/* Tier Cards */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-10">
            <span className={`text-sm font-medium ${!isAnnual ? 'text-navy' : 'text-gray-400'}`}>Monthly</span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${isAnnual ? 'bg-[#5DB347]' : 'bg-gray-300'}`}
            >
              <motion.div
                className="absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md"
                animate={{ x: isAnnual ? 28 : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </button>
            <span className={`text-sm font-medium ${isAnnual ? 'text-navy' : 'text-gray-400'}`}>
              Annual
              <span className="ml-1.5 text-xs font-bold text-[#5DB347] bg-[#5DB347]/10 px-2 py-0.5 rounded-full">
                Save ~18%
              </span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {tiers.map((tier, i) => (
              <div
                key={i}
                className={`relative rounded-3xl p-6 flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                  tier.popular
                    ? 'bg-white/80 backdrop-blur-sm shadow-xl shadow-[#5DB347]/10 scale-[1.02] border-2 border-[#5DB347]'
                    : 'bg-white shadow-lg shadow-[#5DB347]/5 border-0'
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="animate-pulse text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg" style={{ background: 'linear-gradient(135deg, #5DB347, #449933)' }}>
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-4">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${tier.accentBadge}`}>
                    {tier.name}
                  </span>
                </div>

                <div className="mb-2">
                  <span className={`font-bold text-navy ${('byApplication' in tier && tier.byApplication) ? 'text-2xl' : 'text-4xl'}`}>
                    {isAnnual ? tier.priceAnnual : tier.priceMonthly}
                  </span>
                  {!('byApplication' in tier && tier.byApplication) && (
                    <span className="text-sm text-gray-500 ml-1">
                      /{isAnnual ? 'year' : 'month'}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mb-5">{tier.audience}</p>

                <ul className="space-y-2 mb-6 flex-1">
                  {Object.entries(tier.features).map(([feature, value]) => {
                    if (value === false) return null;
                    return (
                      <li
                        key={feature}
                        className="flex items-start gap-2 text-xs text-gray-600"
                      >
                        <svg
                          className="w-3.5 h-3.5 text-[#5DB347] mt-0.5 shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span>
                          {feature}
                          {typeof value === 'string' && (
                            <span className="text-[#5DB347] font-medium ml-1">
                              ({value})
                            </span>
                          )}
                        </span>
                      </li>
                    );
                  })}
                </ul>

                <button
                  onClick={() => handleCheckout(tier.slug)}
                  disabled={checkoutLoading === tier.slug}
                  className={`w-full block text-center px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-60 disabled:cursor-wait ${
                    tier.popular
                      ? 'text-white shadow-md shadow-[#5DB347]/20'
                      : 'byApplication' in tier && tier.byApplication
                        ? 'bg-purple-600 hover:bg-purple-700 text-white'
                        : 'bg-navy/10 hover:bg-navy/20 text-navy'
                  }`}
                  style={tier.popular ? { background: 'linear-gradient(135deg, #5DB347, #449933)' } : undefined}
                >
                  {checkoutLoading === tier.slug ? (
                    <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Processing...</span>
                  ) : 'byApplication' in tier && tier.byApplication ? 'Contact Us' : 'Get Started'}
                </button>
                {checkoutError && checkoutLoading === null && (
                  <p className="text-xs text-red-500 mt-2 text-center">{checkoutError}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison Matrix */}
      <section className="py-16 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#1B2A4A] to-[#5DB347]">Feature Comparison</h2>
            <button
              onClick={() => setShowComparison(!showComparison)}
              className="lg:hidden bg-[#5DB347] text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              {showComparison ? 'Hide' : 'Show'} Comparison
            </button>
          </div>

          <div className={`${showComparison ? 'block' : 'hidden'} lg:block overflow-x-auto`}>
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b-2 border-[#5DB347]/20 bg-[#EBF7E5]/50">
                  <th className="text-left py-4 pr-4 text-sm font-semibold text-navy w-48">
                    Feature
                  </th>
                  {tiers.map((tier, i) => (
                    <th
                      key={i}
                      className="py-4 px-2 text-center text-xs font-semibold text-navy"
                    >
                      {tier.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {featureKeys.map((feature, i) => (
                  <tr
                    key={feature}
                    className={i % 2 === 0 ? 'bg-white' : 'bg-transparent'}
                  >
                    <td className="py-3 pr-4 text-sm text-gray-600">
                      {feature}
                    </td>
                    {tiers.map((tier, j) => (
                      <td key={j} className="py-3 px-2 text-center">
                        <FeatureCell
                          value={
                            tier.features[feature as keyof typeof tier.features]
                          }
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-10 text-center text-transparent bg-clip-text bg-gradient-to-r from-[#1B2A4A] to-[#5DB347]">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg shadow-[#5DB347]/5 overflow-hidden hover:-translate-y-0.5 transition-all duration-300"
              >
                <button
                  onClick={() =>
                    setExpandedFaq(expandedFaq === i ? null : i)
                  }
                  className="w-full flex items-center justify-between p-5 text-left focus-ring"
                >
                  <span className="font-semibold text-navy text-sm pr-4">
                    {faq.q}
                  </span>
                  <motion.svg
                    animate={{ rotate: expandedFaq === i ? 180 : 0 }}
                    className="w-5 h-5 text-navy shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </motion.svg>
                </button>
                <AnimatePresence>
                  {expandedFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="px-5 pb-5 text-sm text-gray-600 leading-relaxed">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16" style={{ background: 'linear-gradient(135deg, #5DB347, #449933)' }}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Farming?
          </h2>
          <p className="text-white/80 mb-8 max-w-2xl mx-auto">
            Join thousands of African farmers already benefiting from AFU&apos;s
            integrated platform. Start with a free account and upgrade as you
            grow.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/apply"
              className="inline-block bg-white text-[#5DB347] hover:bg-gray-100 px-8 py-3.5 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 shadow-lg shadow-black/10"
            >
              Apply for Membership
            </Link>
            <Link
              href="/contact"
              className="inline-block border-2 border-white text-white hover:bg-white/10 px-8 py-3.5 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105"
            >
              Talk to Sales
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
