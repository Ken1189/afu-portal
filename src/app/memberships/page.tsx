'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const tiers = [
  {
    name: 'Student & Research',
    price: 'Free',
    priceNote: 'No cost',
    audience: 'Students, researchers, and academics',
    accent: 'border-green-300 bg-green-50',
    accentBadge: 'bg-green-100 text-green-700',
    popular: false,
    features: {
      'Crop Tracking': false,
      'Financing Access': false,
      Insurance: false,
      Marketplace: false,
      'Training Courses': true,
      'AI Assistant': 'Limited',
      'Export Support': false,
      'Dedicated Officer': false,
      'API Access': false,
      'Priority Support': false,
      'Research Library': true,
      'Community Forum': true,
      'Newsletter & Reports': true,
      'Event Invitations': true,
    },
  },
  {
    name: 'New Enterprise',
    price: '$5',
    priceNote: 'per month',
    audience: 'Aspiring farmers starting their first venture',
    accent: 'border-blue-300 bg-blue-50',
    accentBadge: 'bg-blue-100 text-blue-700',
    popular: false,
    features: {
      'Crop Tracking': 'Basic',
      'Financing Access': false,
      Insurance: false,
      Marketplace: 'View Only',
      'Training Courses': true,
      'AI Assistant': 'Limited',
      'Export Support': false,
      'Dedicated Officer': false,
      'API Access': false,
      'Priority Support': false,
      'Research Library': true,
      'Community Forum': true,
      'Newsletter & Reports': true,
      'Event Invitations': true,
    },
  },
  {
    name: 'Smallholder',
    price: '$15',
    priceNote: 'per month',
    audience: 'Smallholder farmers under 10 hectares',
    accent: 'border-teal bg-teal-light',
    accentBadge: 'bg-teal/10 text-teal',
    popular: true,
    features: {
      'Crop Tracking': true,
      'Financing Access': 'Up to $5K',
      Insurance: 'Basic',
      Marketplace: true,
      'Training Courses': true,
      'AI Assistant': true,
      'Export Support': false,
      'Dedicated Officer': false,
      'API Access': false,
      'Priority Support': false,
      'Research Library': true,
      'Community Forum': true,
      'Newsletter & Reports': true,
      'Event Invitations': true,
    },
  },
  {
    name: 'Farmer Grower',
    price: '$35',
    priceNote: 'per month',
    audience: 'Established farmers with 10-100 hectares',
    accent: 'border-gold bg-amber-50',
    accentBadge: 'bg-amber-100 text-amber-700',
    popular: false,
    features: {
      'Crop Tracking': true,
      'Financing Access': 'Up to $50K',
      Insurance: 'Full',
      Marketplace: true,
      'Training Courses': true,
      'AI Assistant': true,
      'Export Support': 'Basic',
      'Dedicated Officer': 'Shared',
      'API Access': 'Basic',
      'Priority Support': true,
      'Research Library': true,
      'Community Forum': true,
      'Newsletter & Reports': true,
      'Event Invitations': true,
    },
  },
  {
    name: 'Commercial',
    price: '$99',
    priceNote: 'per month',
    audience: 'Commercial operations with 100+ hectares',
    accent: 'border-navy bg-slate-50',
    accentBadge: 'bg-navy/10 text-navy',
    popular: false,
    features: {
      'Crop Tracking': 'Advanced',
      'Financing Access': 'Unlimited',
      Insurance: 'Comprehensive',
      Marketplace: 'Priority',
      'Training Courses': true,
      'AI Assistant': 'Priority',
      'Export Support': 'Full',
      'Dedicated Officer': 'Dedicated',
      'API Access': 'Full',
      'Priority Support': true,
      'Research Library': true,
      'Community Forum': true,
      'Newsletter & Reports': true,
      'Event Invitations': 'VIP',
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
  'Dedicated Officer',
  'API Access',
  'Priority Support',
];

const faqs = [
  {
    q: 'Can I upgrade or downgrade my membership at any time?',
    a: 'Yes, you can change your membership tier at any time. When upgrading, you will gain immediate access to the new features. When downgrading, your current tier benefits remain active until the end of your billing cycle. There are no penalties or lock-in periods.',
  },
  {
    q: 'Is there a discount for annual billing?',
    a: 'Yes, annual billing provides a 20% discount on all paid tiers. When you select annual billing during sign-up, you will see the discounted rate applied automatically. Annual plans are billed once per year.',
  },
  {
    q: 'How does the financing access limit work?',
    a: 'Financing access limits represent the maximum pre-approved credit facility available through the AFU platform. Actual financing amounts depend on your farm assessment, crop plans, and credit history. The limits increase as you build a track record with AFU.',
  },
  {
    q: 'Can I try before committing to a paid plan?',
    a: 'Absolutely. The Student & Research tier is completely free and gives you access to our training courses, research library, and community forum. You can explore the platform and upgrade when you are ready to access farming tools, financing, and marketplace features.',
  },
];

function FeatureCell({ value }: { value: boolean | string }) {
  if (value === true)
    return (
      <svg className="w-5 h-5 text-teal mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    );
  if (value === false)
    return (
      <svg className="w-5 h-5 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    );
  return <span className="text-xs font-medium text-navy">{value}</span>;
}

export default function MembershipsPage() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [showComparison, setShowComparison] = useState(false);

  return (
    <>
      {/* Hero */}
      <section className="bg-navy text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Join the African Farming Union
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl leading-relaxed">
            Empowering farmers at every level &mdash; from students and aspiring
            growers to large commercial operations. Choose the membership that
            fits your farming journey.
          </p>
        </div>
      </section>

      {/* Tier Cards */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {tiers.map((tier, i) => (
              <div
                key={i}
                className={`relative rounded-2xl p-6 border-2 ${tier.accent} flex flex-col`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-teal text-white text-xs font-bold px-4 py-1 rounded-full">
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
                  <span className="text-3xl font-bold text-navy">
                    {tier.price}
                  </span>
                  {tier.priceNote !== 'No cost' && (
                    <span className="text-sm text-gray-500 ml-1">
                      /{tier.priceNote.replace('per ', '')}
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
                          className="w-3.5 h-3.5 text-teal mt-0.5 shrink-0"
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
                            <span className="text-teal font-medium ml-1">
                              ({value})
                            </span>
                          )}
                        </span>
                      </li>
                    );
                  })}
                </ul>

                <Link
                  href="/apply"
                  className={`block text-center px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                    tier.popular
                      ? 'bg-teal hover:bg-teal-dark text-white'
                      : 'bg-navy/10 hover:bg-navy/20 text-navy'
                  }`}
                >
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison Matrix */}
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-bold text-navy">Feature Comparison</h2>
            <button
              onClick={() => setShowComparison(!showComparison)}
              className="lg:hidden bg-teal text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              {showComparison ? 'Hide' : 'Show'} Comparison
            </button>
          </div>

          <div className={`${showComparison ? 'block' : 'hidden'} lg:block overflow-x-auto`}>
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-200">
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
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-navy mb-10 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-cream rounded-xl border border-gray-100 overflow-hidden"
              >
                <button
                  onClick={() =>
                    setExpandedFaq(expandedFaq === i ? null : i)
                  }
                  className="w-full flex items-center justify-between p-5 text-left"
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
      <section className="py-16 bg-teal">
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
              className="inline-block bg-white text-teal hover:bg-gray-100 px-8 py-3.5 rounded-lg font-semibold text-lg transition-colors"
            >
              Apply for Membership
            </Link>
            <Link
              href="/contact"
              className="inline-block border-2 border-white text-white hover:bg-white/10 px-8 py-3.5 rounded-lg font-semibold text-lg transition-colors"
            >
              Talk to Sales
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
