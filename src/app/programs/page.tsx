'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

/* ─── Fallback program data ─── */
const fallbackPrograms = [
  {
    name: 'Blueberry Export Program',
    countries: 'Zimbabwe',
    crop: 'Blueberries',
    status: 'Active',
    description:
      '25-hectare commercial blueberry operation targeting EU export markets. Counter-seasonal advantage delivers premium pricing when Northern Hemisphere supply is low. Full cold chain infrastructure from farm gate to Rotterdam.',
    highlights: ['25ha commercial operation', 'EU market focus', 'Counter-seasonal pricing advantage', '200+ jobs created'],
  },
  {
    name: 'Maize & Soya Staples Program',
    countries: 'Multi-country (All 10 AFU countries)',
    crop: 'Maize & Soya',
    status: 'Active',
    description:
      'Food security crops cultivated across all 10 AFU operating countries. Building reliable staple supply chains connecting smallholder farmers to domestic and regional markets through aggregation, quality assurance, and guaranteed off-take.',
    highlights: ['10 countries', 'Food security focus', '5,000+ smallholder target', 'Domestic & regional markets'],
  },
  {
    name: 'Sesame Export Program',
    countries: 'Zimbabwe, Tanzania',
    crop: 'Sesame',
    status: 'Active',
    description:
      'High-demand oilseed for international export markets. Contract farming model connecting smallholders to commodity buyers in India, Japan, and the EU. Includes seed distribution, extension services, and post-harvest handling.',
    highlights: ['2,000 farmers targeted', 'International export routes', 'Contract farming model', 'India, Japan & EU buyers'],
  },
  {
    name: 'Castor Oil Program',
    countries: 'Multi-country',
    crop: 'Castor',
    status: 'Active',
    description:
      'Industrial castor oil production with an ENI-approved off-take agreement for biofuel feedstock. Multi-country cultivation model across East and Southern Africa with guaranteed buyer and fixed pricing structure.',
    highlights: ['ENI-approved off-take', 'Biofuel feedstock', 'Guaranteed buyer', 'Fixed pricing structure'],
  },
  {
    name: 'Macadamia Development',
    countries: 'Zimbabwe, Mozambique',
    crop: 'Macadamia',
    status: 'In Development',
    description:
      'Premium nut export program targeting global snack and confectionery markets. Long-term orchard development delivering high-margin returns. Macadamia is the highest-value tree nut globally with structural undersupply.',
    highlights: ['50ha orchard development', 'Premium export product', 'Highest-value tree nut', '7-year maturity cycle'],
  },
];

type Program = {
  name: string;
  countries: string;
  crop: string;
  status: string;
  description: string;
  highlights: string[];
};

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>(fallbackPrograms);

  useEffect(() => {
    async function fetchPrograms() {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from('programs')
          .select('*')
          .eq('is_public', true)
          .order('display_order', { ascending: true });

        if (data && data.length > 0) {
          setPrograms(
            data.map((p: Record<string, unknown>) => ({
              name: (p.name as string) || '',
              countries: (p.countries as string) || (p.country as string) || '',
              crop: (p.crop as string) || (p.primary_crop as string) || '',
              status: (p.status as string) || 'Active',
              description: (p.description as string) || '',
              highlights: Array.isArray(p.highlights)
                ? (p.highlights as string[])
                : [],
            }))
          );
        }
      } catch {
        // keep fallback data
      }
    }
    fetchPrograms();
  }, []);

  const activePrograms = programs.filter((p) => p.status === 'Active');
  const developmentPrograms = programs.filter((p) => p.status !== 'Active');

  return (
    <>
      {/* Hero */}
      <section className="bg-navy text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-2 bg-[#5DB347]/20 border border-[#5DB347]/30 text-[#EBF7E5] px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-[#5DB347] rounded-full animate-pulse" />
            Live Programs
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-[#6ABF4B] via-[#5DB347] to-[#8CB89C] bg-clip-text text-transparent">
            Our Farming Programs
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl leading-relaxed">
            Real farming programs generating real revenue across Africa. From
            blueberries bound for European supermarkets to castor oil feeding
            global biofuel demand — these are the engines driving AFU&apos;s mission.
          </p>
        </div>
      </section>

      {/* Active Programs */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <span className="text-sm font-semibold uppercase tracking-wider text-[#5DB347]">
              Generating Revenue
            </span>
            <h2 className="text-3xl font-bold text-[#1B2A4A] mt-2">
              Active Programs
            </h2>
          </div>

          <div className="space-y-8">
            {activePrograms.map((program, i) => (
              <div
                key={i}
                className="bg-white rounded-3xl p-8 shadow-lg shadow-[#5DB347]/5 border-l-4 border-[#5DB347] hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex flex-col lg:flex-row gap-8">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <h3 className="text-xl font-bold text-[#1B2A4A]">
                        {program.name}
                      </h3>
                      <span className="bg-gradient-to-r from-[#5DB347] to-[#449933] text-white text-xs font-semibold px-4 py-1.5 rounded-full">
                        {program.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-3 mb-4">
                      <span className="bg-[#EBF7E5] text-[#449933] text-sm font-medium px-3 py-1 rounded-full">
                        {program.countries}
                      </span>
                      <span className="bg-[#1B2A4A] text-white text-sm font-bold px-3 py-1 rounded-full">
                        {program.crop}
                      </span>
                    </div>

                    <p className="text-gray-600 text-sm leading-relaxed mb-5">
                      {program.description}
                    </p>
                  </div>

                  <div className="lg:w-72 shrink-0">
                    <h4 className="text-xs font-semibold text-[#1B2A4A] uppercase tracking-wider mb-4">
                      Key Highlights
                    </h4>
                    <div className="space-y-2">
                      {program.highlights.map((h, j) => (
                        <div
                          key={j}
                          className="flex items-center gap-2 text-sm text-gray-600"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-[#5DB347] shrink-0" />
                          {h}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* In Development */}
      {developmentPrograms.length > 0 && (
        <section className="py-20 bg-[#f8fdf6]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12">
              <span className="text-sm font-semibold uppercase tracking-wider text-[#5DB347]">
                Coming Soon
              </span>
              <h2 className="text-3xl font-bold text-[#1B2A4A] mt-2">
                In Development
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {developmentPrograms.map((program, i) => (
                <div
                  key={i}
                  className="bg-white rounded-3xl p-8 shadow-lg hover:-translate-y-1 hover:shadow-xl transition-all duration-300 border border-gray-100"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold text-[#1B2A4A]">
                      {program.name}
                    </h3>
                    <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap">
                      {program.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-3 mb-4">
                    <span className="bg-[#EBF7E5] text-[#449933] text-sm font-medium px-3 py-1 rounded-full">
                      {program.countries}
                    </span>
                    <span className="bg-[#1B2A4A] text-white text-sm font-bold px-3 py-1 rounded-full">
                      {program.crop}
                    </span>
                  </div>

                  <p className="text-gray-600 text-sm leading-relaxed mb-5">
                    {program.description}
                  </p>

                  <div className="space-y-2">
                    {program.highlights.map((h, j) => (
                      <div
                        key={j}
                        className="flex items-center gap-2 text-sm text-gray-600"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#5DB347] shrink-0" />
                        {h}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16" style={{ background: '#1B2A4A' }}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Want to Participate?
          </h2>
          <p className="text-white/80 mb-8 max-w-2xl mx-auto">
            Whether you want to farm with us, invest in a program, or supply
            inputs and services — we have a place for you in our growing
            ecosystem.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/apply"
              className="inline-block bg-gradient-to-r from-[#5DB347] to-[#449933] text-white hover:shadow-lg hover:shadow-[#5DB347]/25 hover:-translate-y-1 px-8 py-3.5 rounded-full font-semibold text-lg transition-all duration-300"
            >
              Apply to Farm
            </Link>
            <Link
              href="/contact?subject=investor"
              className="inline-block border-2 border-white text-white hover:bg-white/10 hover:-translate-y-1 px-8 py-3.5 rounded-full font-semibold text-lg transition-all duration-300"
            >
              Invest in a Program
            </Link>
            <Link
              href="/projects"
              className="inline-block border-2 border-[#5DB347] text-[#5DB347] hover:bg-[#5DB347]/10 hover:-translate-y-1 px-8 py-3.5 rounded-full font-semibold text-lg transition-all duration-300"
            >
              View Investment Opportunities
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
