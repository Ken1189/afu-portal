'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useEffect, useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  ArrowRight,
  Award,
  BookOpen,
  Briefcase,
  CheckCircle2,
  Globe2,
  GraduationCap,
  Linkedin,
  Mail,
  MapPin,
  Sprout,
  Star,
  Target,
  TrendingUp,
  UserCheck,
  Users,
  Wheat,
} from 'lucide-react';

/* ─── Types ─── */
interface Advisor {
  id: string;
  full_name: string;
  title: string;
  specialization: string;
  bio: string;
  photo_url?: string;
  country?: string;
  linkedin_url?: string;
  email?: string;
  years_experience?: number;
  expertise_areas?: string[];
  is_featured?: boolean;
}

/* ─── Fallback advisors ─── */
const FALLBACK_ADVISORS: Advisor[] = [
  {
    id: '1',
    full_name: 'Dr. Amara Osei',
    title: 'Agricultural Economist',
    specialization: 'Market Access & Trade Finance',
    bio: 'Over 20 years of experience in African agricultural markets, advising governments and NGOs on trade policy and farmer finance programs across East and West Africa.',
    photo_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&q=80&auto=format&fit=crop',
    country: 'Ghana',
    years_experience: 22,
    expertise_areas: ['Trade Finance', 'Market Access', 'Policy Advisory', 'Value Chains'],
    is_featured: true,
  },
  {
    id: '2',
    full_name: 'Prof. Fatou Diallo',
    title: 'Soil Science & Agronomy',
    specialization: 'Sustainable Farming Practices',
    bio: 'Leading researcher in regenerative agriculture and soil health across the Sahel. Developed farming practices now used by over 50,000 smallholders.',
    photo_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&q=80&auto=format&fit=crop',
    country: 'Senegal',
    years_experience: 18,
    expertise_areas: ['Soil Health', 'Regenerative Agriculture', 'Climate Adaptation', 'Research'],
    is_featured: true,
  },
  {
    id: '3',
    full_name: 'James Kariuki',
    title: 'Agribusiness Strategist',
    specialization: 'Commercial Farming Operations',
    bio: 'Built and scaled three commercial farming operations across Kenya and Tanzania. Expert in operational efficiency, supply chain management, and export logistics.',
    photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&q=80&auto=format&fit=crop',
    country: 'Kenya',
    years_experience: 15,
    expertise_areas: ['Operations', 'Supply Chain', 'Export Logistics', 'Business Planning'],
    is_featured: true,
  },
  {
    id: '4',
    full_name: 'Dr. Nkechi Adeyemi',
    title: 'Veterinary & Livestock Expert',
    specialization: 'Livestock Health & Breeding',
    bio: 'Veterinary doctor specializing in tropical livestock diseases and breeding programs. Advises on livestock insurance products and herd health management systems.',
    photo_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&q=80&auto=format&fit=crop',
    country: 'Ethiopia',
    years_experience: 12,
    expertise_areas: ['Livestock Health', 'Breeding Programs', 'Insurance', 'Tropical Diseases'],
    is_featured: false,
  },
  {
    id: '5',
    full_name: 'Emmanuel Ndikumana',
    title: 'Climate & Carbon Advisor',
    specialization: 'Carbon Credits & Sustainability',
    bio: 'Pioneering carbon credit methodologies for African agriculture. Helps farmers monetize sustainable practices through verified carbon offset programs.',
    photo_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&q=80&auto=format&fit=crop',
    country: 'Tanzania',
    years_experience: 10,
    expertise_areas: ['Carbon Credits', 'Sustainability', 'Climate Finance', 'MRV Systems'],
    is_featured: false,
  },
  {
    id: '6',
    full_name: 'Sarah Mensah',
    title: 'Fintech & Digital Agriculture',
    specialization: 'Agricultural Technology',
    bio: 'Former CTO at a leading African agritech startup. Specializes in mobile money integration, precision agriculture tools, and farmer data platforms.',
    photo_url: 'https://images.unsplash.com/photo-1598550874175-4d0ef436c909?w=400&h=400&q=80&auto=format&fit=crop',
    country: 'Botswana',
    years_experience: 14,
    expertise_areas: ['AgriTech', 'Mobile Money', 'Precision Farming', 'Data Platforms'],
    is_featured: false,
  },
];

/* ─── Specialization icons ─── */
const SPEC_ICONS: Record<string, typeof Sprout> = {
  'Market Access & Trade Finance': TrendingUp,
  'Sustainable Farming Practices': Sprout,
  'Commercial Farming Operations': Briefcase,
  'Livestock Health & Breeding': Wheat,
  'Carbon Credits & Sustainability': Globe2,
  'Agricultural Technology': Target,
};

/* ─── Stats ─── */
const STATS = [
  { value: '50+', label: 'Expert Advisors', icon: UserCheck },
  { value: '200+', label: 'Years Combined Experience', icon: Award },
  { value: '9', label: 'Countries Covered', icon: Globe2 },
  { value: '15+', label: 'Specializations', icon: BookOpen },
];

export default function AdvisorsPage() {
  const supabase = useMemo(() => createClient(), []);
  const [advisors, setAdvisors] = useState<Advisor[]>(FALLBACK_ADVISORS);
  const [selectedSpecialization, setSelectedSpecialization] = useState<string>('all');
  const [chrome, setChrome] = useState<Record<string, unknown>>({});

  // Load advisors from DB (if table exists)
  useEffect(() => {
    async function load() {
      try {
        const { data } = await supabase
          .from('advisors')
          .select('*')
          .order('is_featured', { ascending: false })
          .order('years_experience', { ascending: false });
        if (data && data.length > 0) {
          setAdvisors(data as Advisor[]);
        }
      } catch {
        // keep fallback
      }
      // Load chrome
      try {
        const { data: chromeData } = await supabase
          .from('site_config')
          .select('value')
          .eq('key', 'page_chrome_advisors')
          .maybeSingle();
        if (chromeData?.value) {
          const val = typeof chromeData.value === 'string' ? JSON.parse(chromeData.value) : chromeData.value;
          setChrome(val);
        }
      } catch { /* ignore */ }
    }
    load();
  }, [supabase]);

  const c = (key: string, fallback: string) => (chrome[key] as string) || fallback;

  const specializations = ['all', ...Array.from(new Set(advisors.map((a) => a.specialization)))];
  const filtered = selectedSpecialization === 'all'
    ? advisors
    : advisors.filter((a) => a.specialization === selectedSpecialization);

  const featured = advisors.filter((a) => a.is_featured);

  return (
    <main className="bg-white">
      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1B2A4A] via-[#1B2A4A] to-[#2A3A5C] py-20 sm:py-28">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE0djItSDI0di0yaDEyem0wIDhoLTEydjJoMTJ2LTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-block bg-[#5DB347]/20 text-[#5DB347] text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
              {c('hero_badge', 'Expert Network')}
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              {c('hero_title', 'Meet Our Advisors')}
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto mb-8 leading-relaxed">
              {c('hero_subtitle', 'Industry veterans, agricultural scientists, and business leaders who guide AFU programs and mentor our farmers. Decades of real-world experience across African agriculture.')}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/apply?tier=advisor"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#5DB347] to-[#449933] text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-[#449933] hover:to-[#387828] transition-all"
              >
                {c('hero_cta_text', 'Become an Advisor')}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#advisors"
                className="inline-flex items-center gap-2 border border-white/30 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/10 transition-all"
              >
                Browse Advisors
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Stats ─── */}
      <section className="py-12 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {STATS.map((stat) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-[#5DB347]/10 flex items-center justify-center mx-auto mb-3">
                  <stat.icon className="h-6 w-6 text-[#5DB347]" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-[#1B2A4A]">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Featured Advisors ─── */}
      {featured.length > 0 && (
        <section className="py-16 bg-gradient-to-b from-white to-[#FAF8F3]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="text-sm font-semibold uppercase tracking-wider text-[#5DB347]">Featured</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#1B2A4A] mt-2">
                {c('featured_title', 'Lead Advisors')}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featured.map((advisor, i) => {
                const Icon = SPEC_ICONS[advisor.specialization] || UserCheck;
                return (
                  <motion.div
                    key={advisor.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white rounded-3xl border border-gray-100 shadow-lg overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="relative h-64 bg-gradient-to-br from-[#1B2A4A] to-[#2A3A5C]">
                      {advisor.photo_url && (
                        <Image
                          src={advisor.photo_url}
                          alt={advisor.full_name}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1B2A4A]/80 via-transparent to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="flex items-center gap-2 mb-1">
                          <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                          <span className="text-xs font-semibold text-amber-300">Featured Advisor</span>
                        </div>
                        <h3 className="text-xl font-bold text-white">{advisor.full_name}</h3>
                        <p className="text-sm text-gray-300">{advisor.title}</p>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-[#5DB347]/10 flex items-center justify-center">
                          <Icon className="h-4 w-4 text-[#5DB347]" />
                        </div>
                        <span className="text-sm font-semibold text-[#1B2A4A]">{advisor.specialization}</span>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed mb-4">{advisor.bio}</p>
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {advisor.expertise_areas?.slice(0, 4).map((area) => (
                          <span key={area} className="text-[11px] bg-[#5DB347]/10 text-[#449933] px-2.5 py-1 rounded-full font-medium">
                            {area}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          {advisor.country && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" /> {advisor.country}
                            </span>
                          )}
                          {advisor.years_experience && (
                            <span className="flex items-center gap-1">
                              <Briefcase className="h-3 w-3" /> {advisor.years_experience}+ yrs
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {advisor.linkedin_url && (
                            <a href={advisor.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#0077b5] transition-colors">
                              <Linkedin className="h-4 w-4" />
                            </a>
                          )}
                          {advisor.email && (
                            <a href={`mailto:${advisor.email}`} className="text-gray-400 hover:text-[#5DB347] transition-colors">
                              <Mail className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ─── All Advisors ─── */}
      <section id="advisors" className="py-16 bg-[#FAF8F3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-[#1B2A4A]">
              {c('all_title', 'Our Advisory Network')}
            </h2>
            <p className="text-gray-500 mt-2 max-w-2xl mx-auto">
              {c('all_subtitle', 'Filter by specialization to find the expertise you need')}
            </p>
          </div>

          {/* Filter tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {specializations.map((spec) => (
              <button
                key={spec}
                onClick={() => setSelectedSpecialization(spec)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedSpecialization === spec
                    ? 'bg-[#5DB347] text-white shadow-md'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-[#5DB347]/30 hover:text-[#5DB347]'
                }`}
              >
                {spec === 'all' ? 'All Specializations' : spec}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((advisor, i) => {
              const Icon = SPEC_ICONS[advisor.specialization] || UserCheck;
              return (
                <motion.div
                  key={advisor.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: (i % 6) * 0.05 }}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-100 shrink-0">
                      {advisor.photo_url ? (
                        <Image
                          src={advisor.photo_url}
                          alt={advisor.full_name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#5DB347]/10 flex items-center justify-center">
                          <UserCheck className="h-6 w-6 text-[#5DB347]" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-[#1B2A4A] text-base">{advisor.full_name}</h3>
                      <p className="text-sm text-gray-500">{advisor.title}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Icon className="h-3 w-3 text-[#5DB347]" />
                        <span className="text-xs font-medium text-[#5DB347]">{advisor.specialization}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-3">{advisor.bio}</p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {advisor.expertise_areas?.slice(0, 3).map((area) => (
                      <span key={area} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                        {area}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-3">
                      {advisor.country && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {advisor.country}
                        </span>
                      )}
                      {advisor.years_experience && (
                        <span>{advisor.years_experience}+ years</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {advisor.linkedin_url && (
                        <a href={advisor.linkedin_url} target="_blank" rel="noopener noreferrer" className="hover:text-[#0077b5]">
                          <Linkedin className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#1B2A4A]">
              {c('how_title', 'How Our Advisory Network Works')}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Program Assignment',
                desc: 'Advisors are matched to AFU programs based on their expertise, ensuring every initiative has seasoned guidance.',
                icon: Target,
              },
              {
                step: '02',
                title: 'Farmer Mentorship',
                desc: 'Regular workshops, field visits, and one-on-one sessions help farmers apply best practices and solve real challenges.',
                icon: Users,
              },
              {
                step: '03',
                title: 'Continuous Impact',
                desc: 'Advisors track outcomes, refine strategies, and share knowledge across the AFU network to multiply impact.',
                icon: TrendingUp,
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#5DB347]/10 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="h-7 w-7 text-[#5DB347]" />
                </div>
                <span className="text-xs font-bold text-[#5DB347]">Step {item.step}</span>
                <h3 className="text-lg font-bold text-[#1B2A4A] mt-1 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-16 bg-gradient-to-br from-[#1B2A4A] to-[#2A3A5C]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#5DB347]/20 flex items-center justify-center mx-auto mb-6">
            <GraduationCap className="h-8 w-8 text-[#5DB347]" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            {c('cta_title', 'Share Your Expertise')}
          </h2>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            {c('cta_body', 'Are you an experienced agricultural professional? Join our advisory network and help shape the future of African farming. We welcome experts from all agricultural disciplines.')}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/apply?tier=advisor"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#5DB347] to-[#449933] text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
            >
              Apply as Advisor
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 border border-white/30 text-white px-8 py-4 rounded-xl font-bold hover:bg-white/10 transition-all"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
