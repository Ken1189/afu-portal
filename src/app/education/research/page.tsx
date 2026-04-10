'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import LegalDisclaimer from '@/components/ui/LegalDisclaimer';

interface ResearchCentre {
  id: string;
  name: string;
  description: string;
  focus_areas: string[];
  country: string;
  region: string | null;
  photo_url: string | null;
  website: string | null;
  established_year: number | null;
  team_size: number | null;
  key_projects: string[];
  partner_institutions: string[];
}

// Fallback data — used when DB is empty or unreachable
const FALLBACK_CENTRES: ResearchCentre[] = [
  {
    id: '1',
    name: 'Rusanzi Farms',
    description: 'Rusanzi Farms is AFU\'s flagship agricultural research and demonstration centre, focused on sustainable farming innovation across crops, livestock, and agroforestry systems. Operating as both a working farm and a research hub, Rusanzi develops practical, scalable solutions that African farmers can adopt immediately — from drought-tolerant crop trials and regenerative soil practices to precision irrigation and integrated pest management.',
    focus_areas: ['Sustainable Agriculture', 'Crop Research & Trials', 'Agroforestry', 'Livestock Innovation', 'Climate-Smart Farming'],
    country: 'Zimbabwe',
    region: null,
    photo_url: '/images/rusanzi-logo.png',
    website: null,
    established_year: 2024,
    team_size: null,
    key_projects: [
      'Multi-crop trial programme testing drought-resistant varieties across diverse soil types',
      'Regenerative agriculture pilot integrating cover cropping, composting, and reduced tillage',
      'Agroforestry demonstration plots combining timber, fruit, and crop production systems',
      'Farmer training programme delivering hands-on workshops in sustainable land management',
      'Precision irrigation research reducing water usage while maintaining optimal crop yields',
    ],
    partner_institutions: ['African Farming Union', 'Local Agricultural Extension Services'],
  },
];

export default function ResearchCentresPage() {
  const [centres, setCentres] = useState<ResearchCentre[]>(FALLBACK_CENTRES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from('research_centres')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true })
          .order('established_year', { ascending: true });
        if (data && data.length > 0) {
          // Map DB column `website_url` to interface field `website`
          setCentres(
            data.map((row: Record<string, unknown>) => ({
              id: row.id as string,
              name: row.name as string,
              description: row.description as string,
              focus_areas: (row.focus_areas as string[]) || [],
              country: row.country as string,
              region: (row.region as string) || null,
              photo_url: (row.photo_url as string) || null,
              website: (row.website_url as string) || null,
              established_year: (row.established_year as number) || null,
              team_size: (row.team_size as number) || null,
              key_projects: (row.key_projects as string[]) || [],
              partner_institutions: (row.partner_institutions as string[]) || [],
            }))
          );
        }
      } catch {
        // keep fallback
      }
      setLoading(false);
    }
    load();
  }, []);

  return (
    <>
      {/* Hero */}
      <section className="bg-navy text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/afu-logo.svg" alt="AFU" className="w-14 h-14 brightness-0 invert flex-shrink-0" />
            <div className="inline-block bg-[#5DB347]/20 text-[#5DB347] px-4 py-1.5 rounded-full text-sm font-medium">
              Education
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white via-[#5DB347] to-[#6ABF4B] bg-clip-text text-transparent">
            Research Centres
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl leading-relaxed">
            AFU is building its own network of specialised agricultural research and training
            facilities across Africa, while also pursuing strategic partnerships with leading
            universities and international research organisations. Our centres will drive
            innovation from the lab to the field — combining AFU-led research with collaborative
            programmes across the continent.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <LegalDisclaimer type="research" />
      </div>

      {/* Research Centres Grid */}
      <section className="py-16 bg-[#EBF7E5]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-[#5DB347] border-t-transparent rounded-full mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Loading research centres...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {centres.map((centre) => (
                <div
                  key={centre.id}
                  className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border-l-4 border-[#5DB347] shadow-lg shadow-[#5DB347]/5 hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      {centre.photo_url && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={centre.photo_url}
                          alt={centre.name}
                          className="w-16 h-16 object-contain rounded-xl bg-white border border-gray-100 p-1"
                        />
                      )}
                      <div>
                        <h3 className="text-xl font-bold text-[#1B2A4A]">
                          {centre.name}
                        </h3>
                        <p className="text-gray-500 text-sm">
                          {centre.region ? `${centre.region}, ` : ''}{centre.country}
                        </p>
                      </div>
                    </div>
                    {centre.established_year && (
                      <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#EBF7E5] text-[#5DB347]">
                        Est. {centre.established_year}
                      </span>
                    )}
                  </div>

                  {centre.focus_areas && centre.focus_areas.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {centre.focus_areas.map((fa, j) => (
                        <span key={j} className="inline-block bg-[#5DB347]/10 text-[#5DB347] px-3 py-1 rounded-full text-xs font-medium">
                          {fa}
                        </span>
                      ))}
                    </div>
                  )}

                  <p className="text-gray-600 text-sm mb-5 leading-relaxed">
                    {centre.description}
                  </p>

                  {centre.key_projects && centre.key_projects.length > 0 && (
                    <div className="mb-5">
                      <h4 className="text-sm font-semibold text-[#1B2A4A] mb-3">
                        Key Achievements
                      </h4>
                      <ul className="space-y-2">
                        {centre.key_projects.map((a, j) => (
                          <li
                            key={j}
                            className="flex items-start gap-2 text-gray-600 text-sm"
                          >
                            <svg
                              className="w-4 h-4 text-[#5DB347] mt-0.5 shrink-0"
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
                            {a}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {centre.partner_institutions && centre.partner_institutions.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-[#1B2A4A] mb-2">
                        Partnership Targets
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {centre.partner_institutions.map((p, j) => (
                          <span
                            key={j}
                            className="bg-[#EBF7E5] text-[#1B2A4A] text-xs font-medium px-3 py-1 rounded-full border border-[#5DB347]/20"
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-[#5DB347] to-[#449933]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Partner With Our Research Network
          </h2>
          <p className="text-white/80 mb-8 max-w-2xl mx-auto">
            We are always looking for academic institutions, research
            organisations, and industry partners to collaborate with. Join our
            growing network and help drive agricultural innovation in Africa.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/contact"
              className="inline-block bg-white text-[#5DB347] hover:bg-gray-100 hover:scale-105 px-8 py-3.5 rounded-xl font-semibold text-lg transition-all duration-300"
            >
              Contact Us
            </Link>
            <Link
              href="/education"
              className="inline-block border-2 border-white text-white hover:bg-white/10 px-8 py-3.5 rounded-xl font-semibold text-lg transition-all duration-300"
            >
              Back to Education Hub
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
