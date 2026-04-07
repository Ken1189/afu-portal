'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Megaphone,
  Target,
  BarChart3,
  Globe,
  Users,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Smartphone,
  Shield,
  Leaf,
  MapPin,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

// ─── Types ───

type StatItem = { value: string; label: string; icon?: string };
type IconCard = { icon: string; title: string; desc: string };
type PackageItem = {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  popular: boolean;
};
type PricingRow = {
  tier: string;
  countries: string;
  banner: string;
  featured: string;
  directory: string;
};

type AdvertisingContent = {
  hero: {
    badge: string;
    title: string;
    subtitle: string;
    cta1_text: string;
    cta2_text: string;
  };
  stats: StatItem[];
  why: {
    title: string;
    intro: string;
    cards: IconCard[];
  };
  formats: {
    title: string;
    items: IconCard[];
  };
  packages: {
    title: string;
    intro: string;
    items: PackageItem[];
  };
  pricing: {
    title: string;
    rows: PricingRow[];
  };
  final_cta: {
    title: string;
    body: string;
    cta1_text: string;
    cta2_text: string;
  };
};

// ─── Icon map ───

const ICON_MAP: Record<string, LucideIcon> = {
  Users,
  Globe,
  Target,
  Smartphone,
  Megaphone,
  Zap,
  Leaf,
  Shield,
  TrendingUp,
  MapPin,
  BarChart3,
};

function getIcon(name: string | undefined): LucideIcon {
  if (!name) return Megaphone;
  return ICON_MAP[name] || Megaphone;
}

// ─── Fallback ───

const FALLBACK_ADVERTISING: AdvertisingContent = {
  hero: {
    badge: 'Advertising Opportunities',
    title: 'Reach 1M+ Verified African Farmers',
    subtitle:
      'Advertise your agricultural products and services directly to active farmers across Africa. No bots, no wasted spend — just real farmers who need your products.',
    cta1_text: 'Get Started',
    cta2_text: 'View Packages',
  },
  stats: [
    { value: '1M+', label: 'Verified Farmers', icon: 'Users' },
    { value: '20', label: 'Countries', icon: 'Globe' },
    { value: '3.2%', label: 'Average CTR', icon: 'Target' },
    { value: '85%', label: 'Mobile Users', icon: 'Smartphone' },
  ],
  why: {
    title: 'Why Advertise with AFU?',
    intro:
      'Unlike Facebook or Google ads, AFU gives you direct access to a verified, KYC-checked farmer audience with real purchase intent.',
    cards: [
      {
        icon: 'Shield',
        title: 'Verified Audience',
        desc: 'Every farmer on AFU is KYC-verified. No bots, no fake accounts — real farmers with real farms.',
      },
      {
        icon: 'Target',
        title: 'Purchase Intent',
        desc: 'We know what crops they grow, what inputs they need, and when they need them. Target by crop, season, and country.',
      },
      {
        icon: 'Globe',
        title: 'Offline Reach',
        desc: 'Many AFU farmers are in areas where Facebook and Google ads simply do not reach. AFU is their digital lifeline.',
      },
    ],
  },
  formats: {
    title: 'Ad Formats',
    items: [
      {
        icon: 'Megaphone',
        title: 'Banner Ads',
        desc: 'Full-width banners on the homepage, farmer dashboard, and marketplace. High visibility, strong brand awareness.',
      },
      {
        icon: 'Zap',
        title: 'Featured Products',
        desc: 'Your product highlighted in the marketplace with a "Featured" badge. Shown to farmers actively shopping for inputs.',
      },
      {
        icon: 'Leaf',
        title: 'Sponsored Content',
        desc: 'Native content cards in the training and resources sections. Educational format builds trust with farmers.',
      },
      {
        icon: 'Shield',
        title: 'Directory Listing',
        desc: 'Premium listing in the supplier directory. Verified badge, priority placement, detailed company profile.',
      },
      {
        icon: 'TrendingUp',
        title: 'Newsletter Sponsorship',
        desc: 'Branded slot in the weekly farmer newsletter. Reaches inboxes directly with high open rates.',
      },
      {
        icon: 'MapPin',
        title: 'Country Page Sponsor',
        desc: 'Sponsor a country page. "Agriculture in Kenya powered by [Your Brand]". Exclusive placement.',
      },
    ],
  },
  packages: {
    title: 'Advertising Packages',
    intro: 'Fixed monthly pricing. No surprises. Cancel anytime.',
    items: [
      {
        name: 'Starter',
        price: '$100',
        period: '/month',
        description: 'Sidebar ad on 1 page. Perfect for testing.',
        features: ['Sidebar placement', '5,000 impressions', '1 country', 'Basic analytics', 'Self-service'],
        cta: 'Get Started',
        popular: false,
      },
      {
        name: 'Growth',
        price: '$500',
        period: '/month',
        description: 'Banner or featured product on up to 3 pages.',
        features: ['Banner or featured product', '25,000 impressions', 'Up to 5 countries', 'Click tracking', 'Country targeting'],
        cta: 'Start Growing',
        popular: true,
      },
      {
        name: 'Premium',
        price: '$1,500',
        period: '/month',
        description: 'All pages including homepage. Maximum visibility.',
        features: ['Banner + featured product', '75,000 impressions', 'All countries', 'Newsletter inclusion', 'Conversion tracking', 'A/B testing'],
        cta: 'Go Premium',
        popular: false,
      },
      {
        name: 'Enterprise',
        price: '$3,000',
        period: '/month',
        description: 'All ad types, all portals, priority placement.',
        features: ['All ad formats', '200,000 impressions', 'All countries + priority', 'Newsletter + push notifications', 'Dedicated account manager', 'Custom reporting', 'Seasonal targeting'],
        cta: 'Contact Us',
        popular: false,
      },
    ],
  },
  pricing: {
    title: 'Country Targeting & Pricing',
    rows: [
      { tier: 'Tier 1 — Premium', countries: 'Kenya, South Africa, Nigeria, Ghana', banner: '$500', featured: '$300', directory: '$100' },
      { tier: 'Tier 2 — Standard', countries: 'Zimbabwe, Uganda, Tanzania, Botswana, Rwanda, Mozambique', banner: '$300', featured: '$200', directory: '$75' },
      { tier: 'Tier 3 — Emerging', countries: 'Egypt, Ethiopia, Malawi, Namibia, + 6 more', banner: '$150', featured: '$100', directory: '$50' },
      { tier: 'All Countries', countries: 'Bundle — all countries', banner: '$2,500', featured: '$1,500', directory: '$500' },
    ],
  },
  final_cta: {
    title: 'Ready to Reach African Farmers?',
    body:
      'Join the growing list of agricultural suppliers advertising on AFU. Get in touch with our team to discuss the best package for your business.',
    cta1_text: 'Contact Our Team',
    cta2_text: 'Register as Supplier',
  },
};

// ─── Component ───

export default function AdvertisingPage() {
  const [content, setContent] = useState<AdvertisingContent>(FALLBACK_ADVERTISING);

  useEffect(() => {
    async function fetchContent() {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from('site_config')
          .select('value')
          .eq('key', 'page_advertising')
          .maybeSingle();
        if (data && data.value) {
          let parsed: Partial<AdvertisingContent> | null = null;
          try {
            parsed = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
          } catch {
            parsed = null;
          }
          if (parsed && typeof parsed === 'object') {
            setContent({
              hero: { ...FALLBACK_ADVERTISING.hero, ...(parsed.hero || {}) },
              stats:
                Array.isArray(parsed.stats) && parsed.stats.length > 0
                  ? parsed.stats
                  : FALLBACK_ADVERTISING.stats,
              why: {
                ...FALLBACK_ADVERTISING.why,
                ...(parsed.why || {}),
                cards:
                  parsed.why && Array.isArray(parsed.why.cards) && parsed.why.cards.length > 0
                    ? parsed.why.cards
                    : FALLBACK_ADVERTISING.why.cards,
              },
              formats: {
                ...FALLBACK_ADVERTISING.formats,
                ...(parsed.formats || {}),
                items:
                  parsed.formats && Array.isArray(parsed.formats.items) && parsed.formats.items.length > 0
                    ? parsed.formats.items
                    : FALLBACK_ADVERTISING.formats.items,
              },
              packages: {
                ...FALLBACK_ADVERTISING.packages,
                ...(parsed.packages || {}),
                items:
                  parsed.packages && Array.isArray(parsed.packages.items) && parsed.packages.items.length > 0
                    ? parsed.packages.items
                    : FALLBACK_ADVERTISING.packages.items,
              },
              pricing: {
                ...FALLBACK_ADVERTISING.pricing,
                ...(parsed.pricing || {}),
                rows:
                  parsed.pricing && Array.isArray(parsed.pricing.rows) && parsed.pricing.rows.length > 0
                    ? parsed.pricing.rows
                    : FALLBACK_ADVERTISING.pricing.rows,
              },
              final_cta: { ...FALLBACK_ADVERTISING.final_cta, ...(parsed.final_cta || {}) },
            });
          }
        }
      } catch {
        // keep fallback
      }
    }
    fetchContent();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1B2A4A] to-[#0f1a30] text-white">
        <div className="max-w-6xl mx-auto px-4 py-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#5DB347]/20 text-[#5DB347] rounded-full text-sm font-medium mb-6">
            <Megaphone className="w-4 h-4" /> {content.hero.badge}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {content.hero.title}
          </h1>
          <p className="text-xl text-white/60 max-w-2xl mx-auto mb-10">
            {content.hero.subtitle}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/contact"
              className="px-8 py-3 bg-[#5DB347] text-white rounded-full font-semibold hover:bg-[#449933] transition-all hover:-translate-y-0.5 shadow-lg shadow-[#5DB347]/25"
            >
              {content.hero.cta1_text}
            </Link>
            <Link
              href="#packages"
              className="px-8 py-3 border border-white/20 text-white rounded-full font-medium hover:bg-white/10 transition-all"
            >
              {content.hero.cta2_text}
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-[#1B2A4A] border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {content.stats.map((stat) => {
              const Icon = getIcon(stat.icon);
              return (
                <div key={stat.label} className="text-center">
                  <Icon className="w-6 h-6 text-[#5DB347] mx-auto mb-2" />
                  <div className="text-3xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-white/50">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Advertise */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-[#1B2A4A] text-center mb-4">{content.why.title}</h2>
          <p className="text-gray-500 text-center max-w-2xl mx-auto mb-12">
            {content.why.intro}
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {content.why.cards.map((item) => {
              const Icon = getIcon(item.icon);
              return (
                <div key={item.title} className="bg-gray-50 rounded-2xl p-6">
                  <Icon className="w-8 h-8 text-[#5DB347] mb-4" />
                  <h3 className="text-lg font-bold text-[#1B2A4A] mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Ad Types */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-[#1B2A4A] text-center mb-12">{content.formats.title}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {content.formats.items.map((type) => {
              const Icon = getIcon(type.icon);
              return (
                <div key={type.title} className="bg-white rounded-xl border p-6">
                  <Icon className="w-8 h-8 text-[#5DB347] mb-3" />
                  <h3 className="font-bold text-[#1B2A4A] mb-2">{type.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{type.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Packages */}
      <section id="packages" className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-[#1B2A4A] text-center mb-4">{content.packages.title}</h2>
          <p className="text-gray-500 text-center mb-12">{content.packages.intro}</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {content.packages.items.map((pkg) => (
              <div
                key={pkg.name}
                className={`rounded-2xl border-2 p-6 flex flex-col ${
                  pkg.popular ? 'border-[#5DB347] shadow-lg shadow-[#5DB347]/10 relative' : 'border-gray-200'
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-[#5DB347] text-white text-xs font-semibold rounded-full">
                    Most Popular
                  </div>
                )}
                <h3 className="text-lg font-bold text-[#1B2A4A]">{pkg.name}</h3>
                <div className="mt-2 mb-1">
                  <span className="text-3xl font-bold text-[#1B2A4A]">{pkg.price}</span>
                  <span className="text-gray-400 text-sm">{pkg.period}</span>
                </div>
                <p className="text-sm text-gray-500 mb-6">{pkg.description}</p>
                <ul className="space-y-2 mb-6 flex-1">
                  {pkg.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-[#5DB347] mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/contact"
                  className={`block text-center py-3 rounded-xl font-semibold text-sm transition-all ${
                    pkg.popular
                      ? 'bg-[#5DB347] text-white hover:bg-[#449933]'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {pkg.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Country Pricing */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-[#1B2A4A] text-center mb-4">{content.pricing.title}</h2>
          <p className="text-gray-500 text-center mb-12">Only advertise in the countries where you do business. Pay per country tier.</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#1B2A4A] text-white">
                  <th className="text-left px-5 py-3 rounded-tl-xl">Tier</th>
                  <th className="text-left px-5 py-3">Countries</th>
                  <th className="text-right px-5 py-3">Banner/mo</th>
                  <th className="text-right px-5 py-3">Featured/mo</th>
                  <th className="text-right px-5 py-3 rounded-tr-xl">Directory/mo</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {content.pricing.rows.map((t, i) => (
                  <tr key={t.tier} className={i % 2 === 1 ? 'bg-gray-100' : 'bg-white'}>
                    <td className="px-5 py-3 font-semibold text-[#1B2A4A]">{t.tier}</td>
                    <td className="px-5 py-3 text-gray-600">{t.countries}</td>
                    <td className="px-5 py-3 text-right font-semibold">{t.banner}</td>
                    <td className="px-5 py-3 text-right font-semibold">{t.featured}</td>
                    <td className="px-5 py-3 text-right font-semibold">{t.directory}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[#1B2A4A] text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">{content.final_cta.title}</h2>
          <p className="text-white/60 mb-8">
            {content.final_cta.body}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/contact"
              className="px-8 py-3 bg-[#5DB347] text-white rounded-full font-semibold hover:bg-[#449933] transition-all inline-flex items-center gap-2"
            >
              {content.final_cta.cta1_text} <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/apply?type=supplier"
              className="px-8 py-3 border border-white/20 text-white rounded-full font-medium hover:bg-white/10 transition-all"
            >
              {content.final_cta.cta2_text}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
