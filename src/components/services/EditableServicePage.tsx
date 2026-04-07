'use client';

/**
 * EditableServicePage
 *
 * Renders a public service-page layout (hero + features + how-it-works + stats + CTA)
 * from a config object. On mount it tries to fetch site_config[`service_<slug>`]
 * and if found, overrides any fields the admin has set. The hardcoded
 * `fallback` prop is always rendered first, so the page is never blank.
 *
 * Each service page becomes a thin wrapper:
 *
 *     <EditableServicePage slug="financing" fallback={DEFAULTS} />
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import LegalDisclaimer from '@/components/ui/LegalDisclaimer';

type DisclaimerType = 'banking' | 'insurance' | 'finance' | 'investment' | 'research' | 'legal' | 'medical' | 'general';

export interface ServiceFeature {
  title: string;
  description: string;
  icon?: string;
}

export interface ServiceHowItWorksStep {
  step: number;
  title: string;
  description: string;
}

export interface ServiceStat {
  value: string;
  label: string;
  sub?: string;
}

export interface ServicePageConfig {
  hero_title: string;
  hero_subtitle: string;
  hero_image?: string;
  features: ServiceFeature[];
  how_it_works: ServiceHowItWorksStep[];
  stats?: ServiceStat[];
  cta_text: string;
  cta_link: string;
}

export default function EditableServicePage({
  slug,
  fallback,
  disclaimerType,
}: {
  slug: string;
  fallback: ServicePageConfig;
  disclaimerType?: DisclaimerType;
}) {
  const [cfg, setCfg] = useState<ServicePageConfig>(fallback);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from('site_config')
          .select('value')
          .eq('key', `service_${slug}`)
          .maybeSingle();

        if (cancelled) return;
        const v = data?.value as Partial<ServicePageConfig> | undefined;
        if (v && typeof v === 'object') {
          setCfg({
            hero_title: v.hero_title ?? fallback.hero_title,
            hero_subtitle: v.hero_subtitle ?? fallback.hero_subtitle,
            hero_image: v.hero_image ?? fallback.hero_image,
            features:
              Array.isArray(v.features) && v.features.length > 0
                ? v.features
                : fallback.features,
            how_it_works:
              Array.isArray(v.how_it_works) && v.how_it_works.length > 0
                ? v.how_it_works
                : fallback.how_it_works,
            stats:
              Array.isArray(v.stats) && v.stats.length > 0
                ? v.stats
                : fallback.stats,
            cta_text: v.cta_text ?? fallback.cta_text,
            cta_link: v.cta_link ?? fallback.cta_link,
          });
        }
      } catch (err) {
        // Silent: keep fallback
        console.warn(`service_${slug} config fetch failed`, err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug, fallback]);

  const heroImage =
    cfg.hero_image ||
    "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1920&h=1080&fit=crop";

  return (
    <>
      {disclaimerType && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <LegalDisclaimer type={disclaimerType} />
        </div>
      )}
      {/* HERO */}
      <section className="relative min-h-[520px] flex items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${heroImage}')` }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, rgba(27,42,74,0.92) 0%, rgba(27,42,74,0.7) 50%, rgba(93,179,71,0.45) 100%)',
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="inline-block bg-[#5DB347]/20 text-[#5DB347] px-4 py-1.5 rounded-full text-sm font-medium mb-6 backdrop-blur-sm border border-[#5DB347]/30">
            Service
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white">
            <span
              className="text-transparent bg-clip-text"
              style={{
                backgroundImage: 'linear-gradient(135deg, #6ABF4B, #5DB347)',
              }}
            >
              {cfg.hero_title}
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl">{cfg.hero_subtitle}</p>
        </div>
      </section>

      {/* FEATURES */}
      {cfg.features.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {cfg.features.map((f, i) => (
                <div
                  key={i}
                  className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg shadow-[#5DB347]/5 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 border border-gray-100"
                >
                  {f.icon && <div className="text-3xl mb-3">{f.icon}</div>}
                  <h3 className="text-xl font-bold text-[#1B2A4A] mb-3">
                    {f.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {f.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* HOW IT WORKS */}
      {cfg.how_it_works.length > 0 && (
        <section className="py-16 bg-[#F8FAFC]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-[#1B2A4A] text-center mb-12">
              How It Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {cfg.how_it_works.map((step) => (
                <div
                  key={step.step}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold mb-4"
                    style={{
                      background:
                        'linear-gradient(135deg, #5DB347, #449933)',
                    }}
                  >
                    {step.step}
                  </div>
                  <h3 className="text-lg font-semibold text-[#1B2A4A] mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* STATS */}
      {cfg.stats && cfg.stats.length > 0 && (
        <section className="py-16 bg-[#1B2A4A]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {cfg.stats.map((s, i) => (
                <div
                  key={i}
                  className="text-center bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10"
                >
                  <div
                    className="text-4xl md:text-5xl font-black mb-2"
                    style={{
                      backgroundImage:
                        'linear-gradient(135deg, #6ABF4B, #5DB347)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    {s.value}
                  </div>
                  <div className="text-white font-semibold mb-1">{s.label}</div>
                  {s.sub && <div className="text-gray-400 text-sm">{s.sub}</div>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#EBF7E5] rounded-3xl p-8 text-center shadow-lg shadow-[#5DB347]/5">
            <h3 className="text-2xl font-bold text-[#1B2A4A] mb-6">
              Ready to get started?
            </h3>
            <Link
              href={cfg.cta_link}
              className="inline-block text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-md shadow-[#5DB347]/20"
              style={{
                background: 'linear-gradient(135deg, #5DB347, #449933)',
              }}
            >
              {cfg.cta_text}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
