'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import {
  Users, Globe, Sprout, Leaf, Briefcase,
  Download, FileText, ArrowRight, Target,
  Calendar, Quote, BarChart3, HandCoins,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

/* ─── ANIMATED COUNTER HOOK ─────────────────────────────────────────────── */

function useCountUp(end: number, duration = 2000, startOnView = true) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  const hasStarted = useRef(false);

  useEffect(() => {
    if (!startOnView || !inView || hasStarted.current) return;
    hasStarted.current = true;

    const startTime = performance.now();
    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, end, duration, startOnView]);

  return { count, ref };
}

/* ─── TYPES ──────────────────────────────────────────────────────────────── */

interface CountryImpact {
  name: string;
  code: string;
  farmers: number;
  programs: number;
  hectares: number;
}

interface Testimonial {
  name: string;
  country: string;
  quote: string;
  crop: string;
}

interface Milestone {
  date: string;
  title: string;
  description: string;
}

interface SDGItem {
  number: number;
  title: string;
  progress: number;
  description: string;
  color: string;
}

/* ─── FALLBACK DATA ──────────────────────────────────────────────────────── */

const FALLBACK_METRICS = {
  farmersEmpowered: 12500,
  countriesActive: 9,
  hectares: 45000,
  loansDisbursed: 2.4,
  carbonCredits: 2885,
  jobsCreated: 3200,
};

const FALLBACK_COUNTRIES: CountryImpact[] = [
  { name: 'Zimbabwe', code: 'zw', farmers: 2800, programs: 6, hectares: 9500 },
  { name: 'Botswana', code: 'bw', farmers: 950, programs: 4, hectares: 3200 },
  { name: 'Tanzania', code: 'tz', farmers: 1800, programs: 5, hectares: 7200 },
  { name: 'Kenya', code: 'ke', farmers: 1600, programs: 5, hectares: 5800 },
  { name: 'Zambia', code: 'zm', farmers: 1400, programs: 4, hectares: 4600 },
  { name: 'Mozambique', code: 'mz', farmers: 1200, programs: 3, hectares: 4100 },
  { name: 'Malawi', code: 'mw', farmers: 1100, programs: 3, hectares: 3800 },
  { name: 'Uganda', code: 'ug', farmers: 950, programs: 4, hectares: 3500 },
  { name: 'South Africa', code: 'za', farmers: 700, programs: 5, hectares: 3300 },
];

const FALLBACK_SDGS: SDGItem[] = [
  { number: 1, title: 'No Poverty', progress: 72, description: 'Providing smallholder farmers with access to financing, fair-price offtake contracts, and income diversification through value-added agriculture.', color: '#E5243B' },
  { number: 2, title: 'Zero Hunger', progress: 68, description: 'Increasing crop yields through training, quality inputs, and sustainable farming practices across 45,000+ hectares.', color: '#DDA63A' },
  { number: 8, title: 'Decent Work and Economic Growth', progress: 65, description: 'Creating 3,200+ direct and indirect jobs through processing hubs, logistics networks, and farm operations.', color: '#A21942' },
  { number: 13, title: 'Climate Action', progress: 58, description: 'Generating verified carbon credits through regenerative agriculture and agroforestry programmes across 9 countries.', color: '#3F7E44' },
  { number: 15, title: 'Life on Land', progress: 55, description: 'Promoting soil health restoration, biodiversity corridors, and sustainable land management practices.', color: '#56C02B' },
];

const FALLBACK_MILESTONES: Milestone[] = [
  { date: '2024 Q1', title: 'AFU Founded', description: 'Launched operations with first 500 farmers enrolled in Zimbabwe.' },
  { date: '2024 Q3', title: 'Loan Programme Launched', description: 'First seasonal working capital loans disbursed to smallholder farmers.' },
  { date: '2025 Q1', title: 'Expanded to 5 Countries', description: 'Operational in Zimbabwe, Botswana, Tanzania, Kenya, and Zambia.' },
  { date: '2025 Q3', title: '10,000 Farmers Milestone', description: 'Reached 10,000 registered farmers across the AFU platform.' },
  { date: '2026 Q1', title: 'Carbon Credit Programme', description: 'Launched verified carbon credit generation through regenerative agriculture.' },
];

const FALLBACK_TESTIMONIALS: Testimonial[] = [
  { name: 'Tendai Moyo', country: 'Zimbabwe', quote: 'Before AFU, I could not access financing for my 5-hectare maize farm. Now I have seasonal loans, quality inputs, and a guaranteed buyer. My yields have tripled in two seasons.', crop: 'Maize' },
  { name: 'Grace Mwangi', country: 'Kenya', quote: 'The training programmes changed everything. I learned modern irrigation techniques and soil management. My family income has doubled and I can now send all my children to school.', crop: 'Horticulture' },
  { name: 'Joseph Banda', country: 'Zambia', quote: 'AFU connected me with export markets I never knew existed. My soya beans now reach processors directly, cutting out middlemen. Fair pricing has transformed my community.', crop: 'Soya Beans' },
  { name: 'Amina Salim', country: 'Tanzania', quote: 'The carbon credit programme is incredible. I get paid for farming sustainably, something I always wanted to do. It is good for the land and good for my income.', crop: 'Agroforestry' },
];

/* ─── ANIMATION VARIANTS ─────────────────────────────────────────────────── */

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

/* ─── METRIC CARD ────────────────────────────────────────────────────────── */

function MetricCard({
  icon: Icon,
  value,
  suffix,
  prefix,
  label,
  index,
  format,
}: {
  icon: typeof Users;
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  index: number;
  format?: (n: number) => string;
}) {
  const { count, ref } = useCountUp(value, 2200);
  const display = format
    ? format(count)
    : `${prefix ?? ''}${count.toLocaleString()}${suffix ?? ''}`;
  return (
    <motion.div
      custom={index}
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#5DB34715' }}>
          <Icon className="w-5 h-5" style={{ color: '#5DB347' }} />
        </div>
      </div>
      <p className="text-3xl font-bold" style={{ color: '#1B2A4A' }}>
        <span ref={ref}>{display}</span>
      </p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </motion.div>
  );
}

/* ─── MAIN PAGE ──────────────────────────────────────────────────────────── */

export default function ImpactPage() {
  const supabase = createClient();
  const [metrics, setMetrics] = useState(FALLBACK_METRICS);
  const [countries, setCountries] = useState(FALLBACK_COUNTRIES);
  const [testimonials, setTestimonials] = useState(FALLBACK_TESTIMONIALS);
  const [milestones, setMilestones] = useState(FALLBACK_MILESTONES);
  const [sdgs, setSdgs] = useState(FALLBACK_SDGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchImpactData() {
      try {
        // Try fetching from Supabase impact_metrics table
        const { data: metricsData } = await supabase
          .from('impact_metrics')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (metricsData) {
          setMetrics({
            farmersEmpowered: metricsData.farmers_empowered ?? FALLBACK_METRICS.farmersEmpowered,
            countriesActive: metricsData.countries_active ?? FALLBACK_METRICS.countriesActive,
            hectares: metricsData.hectares ?? FALLBACK_METRICS.hectares,
            loansDisbursed: metricsData.loans_disbursed ?? FALLBACK_METRICS.loansDisbursed,
            carbonCredits: metricsData.carbon_credits ?? FALLBACK_METRICS.carbonCredits,
            jobsCreated: metricsData.jobs_created ?? FALLBACK_METRICS.jobsCreated,
          });
        }

        // Try fetching country impact data
        const { data: countryData } = await supabase
          .from('impact_countries')
          .select('*')
          .order('farmers', { ascending: false });

        if (countryData && countryData.length > 0) {
          setCountries(countryData.map((c: Record<string, unknown>) => ({
            name: c.name as string,
            code: c.code as string,
            farmers: c.farmers as number,
            programs: c.programs as number,
            hectares: c.hectares as number,
          })));
        }

        // Try fetching testimonials
        const { data: testimonialData } = await supabase
          .from('impact_testimonials')
          .select('*')
          .eq('published', true)
          .limit(4);

        if (testimonialData && testimonialData.length > 0) {
          setTestimonials(testimonialData.map((t: Record<string, unknown>) => ({
            name: t.name as string,
            country: t.country as string,
            quote: t.quote as string,
            crop: t.crop as string,
          })));
        }
      } catch {
        // Fallback data already set
      } finally {
        setLoading(false);
      }
    }

    fetchImpactData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1B2A4A 0%, #0f1d36 50%, #1B2A4A 100%)' }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 rounded-full" style={{ background: 'radial-gradient(circle, #5DB347 0%, transparent 70%)' }} />
          <div className="absolute bottom-10 right-20 w-96 h-96 rounded-full" style={{ background: 'radial-gradient(circle, #5DB347 0%, transparent 70%)' }} />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/80 text-sm mb-6">
              <BarChart3 className="w-4 h-4" style={{ color: '#5DB347' }} />
              Measurable, Verifiable Impact
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Our Impact Across{' '}
              <span style={{ color: '#5DB347' }}>Africa</span>
            </h1>
            <p className="text-lg sm:text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
              We measure and report real outcomes -- farmer incomes, hectares restored, jobs
              created, and carbon sequestered. Transparent data, independently verifiable.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── KEY METRICS ──────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10 mb-20">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <MetricCard icon={Users} value={metrics.farmersEmpowered} suffix="+" label="Farmers Empowered" index={0} />
          <MetricCard icon={Globe} value={metrics.countriesActive} label="Countries Active" index={1} />
          <MetricCard icon={Sprout} value={metrics.hectares} suffix="+" label="Hectares Under Management" index={2} />
          <MetricCard icon={HandCoins} value={24} label="Loans Disbursed" index={3} format={(n) => `$${(n / 10).toFixed(1)}M+`} />
          <MetricCard icon={Leaf} value={metrics.carbonCredits} label="Carbon Credits Generated" index={4} />
          <MetricCard icon={Briefcase} value={metrics.jobsCreated} suffix="+" label="Jobs Created" index={5} />
        </div>
      </section>

      {/* ── IMPACT BY COUNTRY ────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: '#1B2A4A' }}>
            Impact by Country
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            AFU operates across 9 African nations, tailoring programmes to local conditions while
            maintaining consistent quality and governance standards.
          </p>
        </motion.div>

        <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {countries.map((country, i) => (
            <motion.div
              key={country.code}
              custom={i}
              variants={fadeUp}
              className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all hover:-translate-y-1 border border-gray-100 group"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="relative w-10 h-7 rounded overflow-hidden shadow-sm flex-shrink-0">
                  <Image
                    src={`https://flagcdn.com/w80/${country.code}.png`}
                    alt={`${country.name} flag`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <h3 className="text-lg font-semibold" style={{ color: '#1B2A4A' }}>{country.name}</h3>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <p className="text-xl font-bold" style={{ color: '#5DB347' }}>{country.farmers.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Farmers</p>
                </div>
                <div>
                  <p className="text-xl font-bold" style={{ color: '#5DB347' }}>{country.programs}</p>
                  <p className="text-xs text-gray-500">Programmes</p>
                </div>
                <div>
                  <p className="text-xl font-bold" style={{ color: '#5DB347' }}>{country.hectares.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Hectares</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── SDG ALIGNMENT ────────────────────────────────────────────────── */}
      <section className="py-20" style={{ backgroundColor: '#f8faf7' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: '#1B2A4A' }}>
              UN Sustainable Development Goals
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our programmes are designed to deliver measurable progress against the SDGs,
              with third-party verification and transparent reporting.
            </p>
          </motion.div>

          <div className="space-y-6 max-w-4xl mx-auto">
            {sdgs.map((sdg, i) => (
              <motion.div
                key={sdg.number}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-6 shadow-md border border-gray-100"
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold text-lg"
                    style={{ backgroundColor: sdg.color }}
                  >
                    {sdg.number}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold" style={{ color: '#1B2A4A' }}>
                        SDG {sdg.number}: {sdg.title}
                      </h3>
                      <span className="text-sm font-medium" style={{ color: sdg.color }}>
                        {sdg.progress}%
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{sdg.description}</p>
                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: sdg.color }}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${sdg.progress}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, delay: i * 0.15, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── IMPACT TIMELINE ──────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: '#1B2A4A' }}>
            Our Journey
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Key milestones in AFU&apos;s mission to transform agriculture across Africa.
          </p>
        </motion.div>

        <div className="relative max-w-3xl mx-auto">
          {/* Timeline line */}
          <div className="absolute left-6 sm:left-1/2 top-0 bottom-0 w-0.5 bg-gray-200 -translate-x-1/2" />

          {milestones.map((milestone, i) => {
            const isLeft = i % 2 === 0;
            return (
              <motion.div
                key={milestone.date}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className={`relative flex items-start gap-4 mb-10 ${
                  isLeft ? 'sm:flex-row' : 'sm:flex-row-reverse'
                }`}
              >
                {/* Dot */}
                <div className="absolute left-6 sm:left-1/2 w-4 h-4 rounded-full border-4 border-white -translate-x-1/2 z-10 shadow" style={{ backgroundColor: '#5DB347' }} />

                {/* Content */}
                <div className={`ml-12 sm:ml-0 sm:w-[calc(50%-2rem)] ${isLeft ? 'sm:pr-8 sm:text-right' : 'sm:pl-8'}`}>
                  <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100">
                    <div className="flex items-center gap-2 mb-2" style={{ justifyContent: isLeft ? 'flex-end' : 'flex-start' }}>
                      <Calendar className="w-4 h-4 text-gray-400 sm:hidden" />
                      <span className="text-sm font-semibold" style={{ color: '#5DB347' }}>{milestone.date}</span>
                    </div>
                    <h3 className="font-semibold text-base mb-1" style={{ color: '#1B2A4A' }}>{milestone.title}</h3>
                    <p className="text-sm text-gray-600">{milestone.description}</p>
                  </div>
                </div>

                {/* Spacer for the other side */}
                <div className="hidden sm:block sm:w-[calc(50%-2rem)]" />
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────────────── */}
      <section className="py-20" style={{ background: 'linear-gradient(135deg, #1B2A4A 0%, #0f1d36 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Voices From the Field
            </h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              Real stories from the farmers whose lives have been transformed through AFU programmes.
            </p>
          </motion.div>

          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                custom={i}
                variants={fadeUp}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors"
              >
                <Quote className="w-8 h-8 mb-4 opacity-30" style={{ color: '#5DB347' }} />
                <p className="text-white/80 leading-relaxed mb-6 text-sm sm:text-base">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm" style={{ backgroundColor: '#5DB347' }}>
                    {t.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{t.name}</p>
                    <p className="text-white/50 text-xs">{t.crop} Farmer -- {t.country}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── DOWNLOAD / ESG ───────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 sm:p-12 text-center"
        >
          <FileText className="w-12 h-12 mx-auto mb-4" style={{ color: '#5DB347' }} />
          <h2 className="text-2xl sm:text-3xl font-bold mb-3" style={{ color: '#1B2A4A' }}>
            Impact Reports &amp; ESG Scorecard
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto mb-8">
            Download our comprehensive impact report or view our Environmental, Social, and
            Governance scorecard for detailed metrics and methodology.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/pdf/afu-impact-report.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold transition-all hover:opacity-90 hover:shadow-lg"
              style={{ backgroundColor: '#5DB347' }}
            >
              <Download className="w-5 h-5" />
              Download Impact Report
            </a>
            <Link
              href="/investor"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold border-2 transition-all hover:bg-gray-50"
              style={{ borderColor: '#1B2A4A', color: '#1B2A4A' }}
            >
              <BarChart3 className="w-5 h-5" />
              View ESG Scorecard
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="py-20" style={{ backgroundColor: '#f0f7ee' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <Target className="w-12 h-12 mx-auto mb-4" style={{ color: '#5DB347' }} />
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: '#1B2A4A' }}>
              Be Part of the Impact
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-8 text-lg">
              Whether you are an investor seeking ESG-aligned returns, a partner looking to scale
              agricultural development, or a farmer ready to grow -- there is a place for you at AFU.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/partners"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-white font-semibold text-lg transition-all hover:opacity-90 hover:shadow-lg"
                style={{ backgroundColor: '#5DB347' }}
              >
                Partner With Us
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/join"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-lg border-2 transition-all hover:bg-white"
                style={{ borderColor: '#1B2A4A', color: '#1B2A4A' }}
              >
                Join AFU
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
