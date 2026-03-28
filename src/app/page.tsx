'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import {
  Banknote,
  Cog,
  Factory,
  ShieldCheck,
  CircleDollarSign,
  GraduationCap,
  ArrowRight,
  ChevronDown,
  Globe2,
  Users,
  TrendingUp,
  Leaf,
  Sprout,
  Tractor,
  Droplets,
  Play,
  Zap,
  ShieldPlus,
  Scale,
  CheckCircle2,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

/* ─── Animation helpers ─── */
function FadeInWhenVisible({
  children,
  delay = 0,
  className = '',
  direction = 'up',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right';
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  const offsets = {
    up: { y: 40 },
    down: { y: -40 },
    left: { x: 40 },
    right: { x: -40 },
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, ...offsets[direction] }}
      animate={isInView ? { opacity: 1, x: 0, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function StaggerChildren({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={{
        visible: { transition: { staggerChildren: 0.1 } },
        hidden: {},
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const fadeUpChild = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

/* ─── Service cards data ─── */
const services = [
  {
    icon: Banknote,
    title: 'Financing',
    desc: 'Working capital, invoice finance, and crop financing from smallholder to commercial scale.',
    link: '/services/financing',
    img: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=500&fit=crop',
  },
  {
    icon: Cog,
    title: 'Inputs & Equipment',
    desc: 'Tractors, drones, irrigation, seeds, and fertilizers. Bulk procurement at better prices.',
    link: '/services/inputs',
    img: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&h=500&fit=crop',
  },
  {
    icon: Factory,
    title: 'Processing Hubs',
    desc: 'Milling, drying, cold chain, and packaging. Value-addition at source.',
    link: '/services/processing',
    img: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80',
  },
  {
    icon: ShieldCheck,
    title: 'Guaranteed Offtake',
    desc: 'Pre-arranged buyers and distribution. No more selling cheap or wasting crops.',
    link: '/services/offtake',
    img: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80',
  },
  {
    icon: CircleDollarSign,
    title: 'Trade Finance',
    desc: 'SBLCs, Letters of Credit, export pre-financing, and FX services via our banking partners.',
    link: '/services/trade-finance',
    img: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80',
  },
  {
    icon: GraduationCap,
    title: 'Training & Certification',
    desc: 'Vocational partnerships to build scalable farmer capacity, compliance, and export readiness.',
    link: '/services/training',
    img: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&h=500&fit=crop',
  },
];

/* ─── Flywheel steps ─── */
const flywheelSteps = [
  { step: 1, label: 'Capital', icon: Banknote, bg: 'linear-gradient(135deg, #1B2A4A, #2D4A7A)' },
  { step: 2, label: 'Inputs', icon: Sprout, bg: 'linear-gradient(135deg, #5DB347, #449933)' },
  { step: 3, label: 'Production', icon: Tractor, bg: 'linear-gradient(135deg, #8CB89C, #729E82)' },
  { step: 4, label: 'Processing', icon: Factory, bg: 'linear-gradient(135deg, #4A9E35, #449933)' },
  { step: 5, label: 'Offtake', icon: ShieldCheck, bg: 'linear-gradient(135deg, #2D4A7A, #1B2A4A)' },
  { step: 6, label: 'Trade Finance', icon: Scale, bg: 'linear-gradient(135deg, #6ABF4B, #5DB347)' },
  { step: 7, label: 'Cash Recycle', icon: TrendingUp, bg: 'linear-gradient(135deg, #5DB347, #8CB89C)' },
];

/* ─── How it works ─── */
const howItWorks = [
  { step: '01', title: 'Tell Us Your Story', desc: 'Share your farming story, your land, your dreams. We want to understand what makes your farm unique.', icon: Users },
  { step: '02', title: 'Get Financed', desc: 'Access working capital, input finance, and equipment leasing tailored to your crop cycle.', icon: Banknote },
  { step: '03', title: 'Grow & Process', desc: 'Use premium inputs, expert training, and processing hubs to maximize yields and value.', icon: Leaf },
  { step: '04', title: 'Sell & Scale', desc: 'Guaranteed offtake contracts and trade finance turn your harvest into predictable cash flows.', icon: TrendingUp },
];

/* ─── Hero defaults ─── */
const HERO_DEFAULTS = {
  hero_headline: "Let's Grow Together",
  hero_subtitle: 'Financing, inputs, processing, and guaranteed buyers — you bring the land and passion. Together, we turn your harvest into real, sustainable income.',
  hero_cta_text: 'Join Our Farming Family',
  hero_cta_link: '/apply',
  hero_bg_image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920&h=1080&fit=crop',
};

export default function Home() {
  const [hero, setHero] = useState(HERO_DEFAULTS);

  useEffect(() => {
    async function fetchHero() {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from('site_config')
          .select('key, value')
          .in('key', Object.keys(HERO_DEFAULTS));
        if (data && data.length > 0) {
          const updates: Record<string, string> = {};
          data.forEach((row: { key: string; value: string }) => {
            if (row.value) updates[row.key] = row.value;
          });
          setHero((prev) => ({ ...prev, ...updates }));
        }
      } catch {
        // keep defaults
      }
    }
    fetchHero();
  }, []);

  return (
    <>
      {/* ─── HERO ─── */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <Image
            src={hero.hero_bg_image}
            alt="African farmland at sunrise"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-dark/90 via-navy/80 to-navy/50" />
        </div>

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 w-full">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-[#5DB347]/20 backdrop-blur-sm border border-[#5DB347]/30 text-[#EBF7E5] px-4 py-1.5 rounded-full text-sm font-medium mb-6"
            >
              <span className="w-2 h-2 bg-[#5DB347] rounded-full animate-pulse-soft" />
              60% of the world&apos;s uncultivated arable land is in Africa
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] text-white mb-6"
            >
              {hero.hero_headline.includes('Grow Together') ? (
                <>
                  Let&apos;s{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6ABF4B] to-[#90D87A]">
                    Grow Together
                  </span>
                </>
              ) : (
                hero.hero_headline
              )}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-lg md:text-xl text-gray-300 mb-10 leading-relaxed max-w-2xl"
            >
              {hero.hero_subtitle}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link
                href={hero.hero_cta_link}
                className="group text-white px-8 py-4 rounded-xl font-semibold text-lg transition-smooth flex items-center justify-center gap-2 shadow-lg"
                style={{ background: '#5DB347' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#449933')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#5DB347')}
              >
                {hero.hero_cta_text}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/about"
                className="group border-2 border-white/30 hover:border-white/60 hover:bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-semibold text-lg transition-smooth flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5" />
                Watch Demo
              </Link>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="mt-12 flex flex-wrap items-center gap-4 text-sm"
            >
              <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 px-4 py-2 rounded-full text-white/70">
                <ShieldPlus className="w-4 h-4 text-[#5DB347]" />
                <span>Licensed & Regulated</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 px-4 py-2 rounded-full text-white/70">
                <Globe2 className="w-4 h-4 text-[#5DB347]" />
                <span>10 Countries Active</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 px-4 py-2 rounded-full text-white/70">
                <Users className="w-4 h-4 text-[#5DB347]" />
                <span>247+ Active Members</span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <ChevronDown className="w-6 h-6 text-white/50 animate-bounce-slow" />
        </motion.div>
      </section>

      {/* ─── WHAT AFU PROVIDES (Services Grid) ─── */}
      <section className="py-16 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInWhenVisible>
            <div className="text-center mb-14">
              <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#5DB347' }}>Our Services</span>
              <h2 className="text-3xl md:text-4xl font-bold text-navy mt-2 mb-4 text-gradient-green">
                One Platform, Complete Value Chain
              </h2>
              <p className="text-gray-500 max-w-2xl mx-auto">
                A vertically integrated agriculture development platform — the specialized agri dev bank and execution engine Africa has been missing.
              </p>
            </div>
          </FadeInWhenVisible>

          <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((svc) => {
              const Icon = svc.icon;
              return (
                <motion.div key={svc.title} variants={fadeUpChild}>
                  <Link
                    href={svc.link}
                    className="group block bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                  >
                    {/* Card image */}
                    <div className="relative h-52 overflow-hidden">
                      <Image
                        src={svc.img}
                        alt={svc.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/80 via-navy/20 to-transparent" />
                      {/* Floating icon over image bottom */}
                      <div className="absolute -bottom-5 left-6">
                        <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-xl shadow-black/10">
                          <Icon className="w-7 h-7" style={{ color: '#5DB347' }} />
                        </div>
                      </div>
                    </div>
                    {/* Card body */}
                    <div className="p-6 pt-8">
                      <h3 className="text-lg font-bold text-navy mb-2 group-hover:text-[#5DB347] transition-colors">
                        {svc.title}
                      </h3>
                      <p className="text-gray-500 text-sm leading-relaxed mb-4">{svc.desc}</p>
                      <span className="inline-flex items-center gap-1.5 text-sm font-semibold group-hover:gap-2.5 transition-all" style={{ color: '#5DB347' }}>
                        Learn More
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </StaggerChildren>
        </div>
      </section>

      {/* ─── THE AFU FLYWHEEL ─── */}
      <section className="py-16 bg-navy text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInWhenVisible>
            <div className="text-center mb-16">
              <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#5DB347' }}>The Model</span>
              <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4 text-glow">
                The AFU Flywheel
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Most players only do one piece. AFU ties the full loop together — capital flows in, crops flow out, cash recycles.
              </p>
            </div>
          </FadeInWhenVisible>

          {/* Flywheel steps */}
          <StaggerChildren className="relative">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
              {flywheelSteps.map((item) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.step}
                    variants={fadeUpChild}
                    className="group relative"
                  >
                    <div className="flex flex-col items-center text-center">
                      <div
                        className="w-20 h-20 rounded-2xl flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(93,179,71,0.3)] transition-all duration-300"
                        style={{ background: item.bg }}
                      >
                        <Icon className="w-9 h-9 text-white" />
                      </div>
                      <span className="text-xs font-bold mb-1" style={{ color: '#5DB347' }}>Step {item.step}</span>
                      <span className="text-sm font-semibold text-white">{item.label}</span>
                    </div>
                    {/* Connector arrow (hidden on last item and small screens) */}
                    {item.step < 7 && (
                      <div className="hidden lg:flex absolute top-10 -right-2 w-4 items-center justify-center">
                        <ArrowRight className="w-4 h-4 text-[#5DB347]/60" />
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
            {/* Recycle arrow */}
            <FadeInWhenVisible delay={0.5}>
              <div className="mt-8 flex items-center justify-center gap-3" style={{ color: '#5DB347' }}>
                <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#5DB347]/50" />
                <Zap className="w-5 h-5" />
                <span className="text-sm font-semibold">That&apos;s the compounding flywheel — cash recycles back into capital</span>
                <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#5DB347]/50" />
              </div>
            </FadeInWhenVisible>
          </StaggerChildren>
        </div>
      </section>

      {/* ─── HOW IT WORKS (4 Steps) ─── */}
      <section className="py-16 bg-white relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#f8fdf6]/50 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <FadeInWhenVisible>
            <div className="text-center mb-14">
              <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#5DB347' }}>Getting Started</span>
              <h2 className="text-3xl md:text-4xl font-bold text-navy mt-2 mb-4 text-gradient-green">
                Four Steps to Growth
              </h2>
              <p className="text-gray-500 max-w-2xl mx-auto">
                From your first conversation to export income — we walk the journey with you, every step of the way.
              </p>
            </div>
          </FadeInWhenVisible>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((item, i) => {
              const Icon = item.icon;
              return (
                <FadeInWhenVisible key={item.step} delay={i * 0.12}>
                  <div className="relative group">
                    {/* Connector line */}
                    {i < 3 && (
                      <div className="hidden lg:block absolute top-8 left-[calc(100%+0.25rem)] w-[calc(100%-0.5rem)] h-0.5 border-t-2 border-dashed border-[#5DB347]/25">
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full shadow-sm" style={{ background: '#5DB347' }} />
                      </div>
                    )}
                    <div className="bg-white rounded-3xl p-8 h-full shadow-md group-hover:shadow-xl group-hover:-translate-y-1 transition-all duration-300 border border-gray-100 group-hover:border-[#5DB347]/20">
                      <div className="w-14 h-14 rounded-full flex items-center justify-center mb-5 shadow-lg" style={{ background: 'linear-gradient(135deg, #5DB347, #449933)' }}>
                        <span className="text-white text-lg font-bold">{item.step}</span>
                      </div>
                      <div className="w-12 h-12 bg-[#EBF7E5] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Icon className="w-6 h-6" style={{ color: '#5DB347' }} />
                      </div>
                      <h3 className="text-lg font-bold text-navy mb-2">{item.title}</h3>
                      <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </FadeInWhenVisible>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── MEMBERSHIP TIERS ─── */}
      <section className="py-16 bg-gradient-to-b from-white to-[#f8fdf6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInWhenVisible>
            <div className="text-center mb-16">
              <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#5DB347' }}>Join the Family</span>
              <h2 className="text-3xl md:text-4xl font-bold text-navy mt-2 mb-4 text-gradient-green">
                Find Your Fit
              </h2>
              <p className="text-gray-500 max-w-2xl mx-auto">
                Every member gets access to the full AFU ecosystem — financing, inputs, markets, and expert support. Pick the level that matches your farm.
              </p>
            </div>
          </FadeInWhenVisible>

          <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
            {[
              {
                tier: 'Smallholder',
                name: 'Smallholder',
                price: '$4.99',
                period: '/month',
                features: [
                  'Platform access & AI chatbot',
                  'Training & certification',
                  'Market prices & weather',
                  'Seasonal working capital',
                  'Input bundles access',
                ],
                cta: 'Join as Smallholder',
                highlight: false,
              },
              {
                tier: 'Bronze',
                name: 'Commercial Bronze',
                price: '$49',
                period: '/month',
                features: [
                  'Everything in Smallholder',
                  'Discounted inputs',
                  'Market access & off-take',
                  'Equipment rental priority',
                  'Basic trade finance',
                ],
                cta: 'Join Bronze',
                highlight: false,
              },
              {
                tier: 'Gold',
                name: 'Commercial Gold',
                price: '$499',
                period: '/month',
                features: [
                  'Everything in Bronze',
                  'Equipment leasing priority',
                  '15% insurance discounts',
                  'Dedicated advisor',
                  'Full trade finance access',
                ],
                cta: 'Join Gold',
                highlight: true,
              },
              {
                tier: 'Platinum',
                name: 'Commercial Platinum',
                price: '$999',
                period: '/month',
                features: [
                  'Everything in Gold',
                  'Legal support',
                  'Off-take priority',
                  'Farm manager visits',
                  'VIP events & networking',
                ],
                cta: 'Join Platinum',
                highlight: false,
              },
              {
                tier: 'Partner',
                name: 'Partner / Vendor',
                price: 'Apply',
                period: '',
                features: [
                  'Directory listing',
                  'Co-branded programs',
                  'Member network access',
                  'Deal flow access',
                  'Dedicated advisor',
                ],
                cta: 'Contact Us',
                highlight: false,
              },
            ].map((item) => (
              <motion.div key={item.name} variants={fadeUpChild}>
                <div
                  className={`rounded-3xl p-8 h-full flex flex-col transition-all duration-300 hover:-translate-y-1 ${
                    item.highlight
                      ? 'bg-navy/95 backdrop-blur-sm text-white ring-2 ring-[#5DB347] shadow-2xl shadow-[#5DB347]/10 relative scale-[1.02]'
                      : 'bg-white border border-gray-200 hover:border-[#5DB347]/30 shadow-md hover:shadow-xl'
                  }`}
                >
                  {item.highlight && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-white text-xs font-bold px-5 py-1.5 rounded-full shadow-lg shadow-[#5DB347]/30 animate-pulse-soft" style={{ background: 'linear-gradient(135deg, #5DB347, #449933)' }}>
                      Most Popular
                    </div>
                  )}
                  <div
                    className="text-xs font-semibold uppercase tracking-wider mb-1"
                    style={{ color: '#5DB347' }}
                  >
                    {item.tier}
                  </div>
                  <h3
                    className={`text-xl font-bold mb-4 ${
                      item.highlight ? 'text-white' : 'text-navy'
                    }`}
                  >
                    {item.name}
                  </h3>
                  <div className="mb-6">
                    <span
                      className={`text-4xl md:text-5xl font-extrabold ${
                        item.highlight ? 'text-white' : 'text-navy'
                      }`}
                    >
                      {item.price}
                    </span>
                    <span
                      className={`text-sm ${
                        item.highlight ? 'text-gray-300' : 'text-gray-500'
                      }`}
                    >
                      {item.period}
                    </span>
                  </div>
                  <ul className="space-y-3 mb-8 flex-1">
                    {item.features.map((f, j) => (
                      <li
                        key={j}
                        className={`flex items-start gap-2 text-sm ${
                          item.highlight ? 'text-gray-200' : 'text-gray-600'
                        }`}
                      >
                        <CheckCircle2
                          className="w-4 h-4 shrink-0 mt-0.5"
                          style={{ color: '#5DB347' }}
                        />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/apply"
                    className={`block text-center py-3 rounded-xl font-semibold text-sm transition-smooth ${
                      item.highlight
                        ? 'text-white shadow-lg'
                        : 'bg-[#EBF7E5] hover:bg-[#d4efcc] text-[#449933]'
                    }`}
                    style={item.highlight ? { background: '#5DB347' } : {}}
                    onMouseEnter={item.highlight ? (e) => (e.currentTarget.style.background = '#449933') : undefined}
                    onMouseLeave={item.highlight ? (e) => (e.currentTarget.style.background = '#5DB347') : undefined}
                  >
                    {item.cta}
                  </Link>
                </div>
              </motion.div>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ─── COUNTRIES / COVERAGE ─── */}
      <section className="py-16 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <FadeInWhenVisible direction="right">
              <div>
                <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#5DB347' }}>Coverage</span>
                <h2 className="text-3xl md:text-4xl font-bold text-navy mt-2 mb-6 text-gradient-green">
                  Expanding Across Africa
                </h2>
                <p className="text-gray-500 mb-8 leading-relaxed">
                  Starting with three high-potential markets, AFU is building the playbook to scale
                  the integrated agriculture platform across the continent.
                </p>
                <div className="space-y-6">
                  {[
                    { flag: '\u{1F1FF}\u{1F1FC}', name: 'Zimbabwe', crops: 'Blueberries, Macadamia, Maize', members: 98 },
                    { flag: '\u{1F1E7}\u{1F1FC}', name: 'Botswana', crops: 'Sorghum, Sesame, Groundnuts', members: 82 },
                    { flag: '\u{1F1F9}\u{1F1FF}', name: 'Tanzania', crops: 'Cassava, Sesame, Cashew', members: 67 },
                  ].map((c) => (
                    <div
                      key={c.name}
                      className="flex items-center gap-4 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:border-[#5DB347]/20 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                    >
                      <span className="text-3xl">{c.flag}</span>
                      <div className="flex-1">
                        <h3 className="text-navy font-bold text-sm">{c.name}</h3>
                        <p className="text-gray-500 text-xs">{c.crops}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-lg" style={{ color: '#5DB347' }}>{c.members}</span>
                        <p className="text-gray-400 text-xs">members</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Link
                  href="/countries"
                  className="inline-flex items-center gap-2 mt-8 font-semibold hover:gap-3 transition-all"
                  style={{ color: '#5DB347' }}
                >
                  View all countries
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </FadeInWhenVisible>

            <FadeInWhenVisible direction="left">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1592982537447-6f2a6a0c8b8b?w=800&q=80"
                  alt="African farmer in field"
                  width={800}
                  height={600}
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-navy/20" />
              </div>
            </FadeInWhenVisible>
          </div>
        </div>
      </section>

      {/* ─── OUR PROMISE (Condensed to 3 key points) ─── */}
      <section className="py-16 bg-white relative">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#5DB347]/20 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInWhenVisible>
            <div className="text-center mb-14">
              <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#5DB347' }}>What Makes Us Different</span>
              <h2 className="text-3xl md:text-4xl font-bold text-navy mt-2 mb-4 text-gradient-green">
                Our Promise
              </h2>
            </div>
          </FadeInWhenVisible>

          <StaggerChildren className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Sprout,
                title: 'By Farmers, For Farmers',
                desc: 'Our founding team has decades of commercial farming experience across Africa. This platform was built from real field experience.',
              },
              {
                icon: ShieldCheck,
                title: 'Finance + Guaranteed Offtake',
                desc: 'Capital in, guaranteed revenue out. We arrange the buyers before you plant — that\'s how we de-risk your season.',
              },
              {
                icon: Users,
                title: '10% of Profits to Community',
                desc: 'Women in agriculture, feed a child, young farmers programs. Ten percent of everything AFU earns goes back into farming communities.',
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <motion.div key={item.title} variants={fadeUpChild}>
                  <div className="bg-cream rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center mb-5 shadow-lg" style={{ background: 'linear-gradient(135deg, #5DB347, #449933)' }}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-navy mb-2">{item.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </StaggerChildren>
        </div>
      </section>

      {/* ─── SPONSOR A FARMER CTA BANNER ─── */}
      <section className="py-12 bg-gradient-to-r from-[#5DB347] to-[#449933]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-white">
            <div>
              <h3 className="text-2xl sm:text-3xl font-bold mb-2">
                Sponsor a Farmer from $5/month
              </h3>
              <p className="text-white/80 text-sm md:text-base max-w-xl">
                Real farmers. Real crops. Real impact. Fund a farmer&apos;s membership, inputs, or full program — and get monthly updates as their season unfolds.
              </p>
            </div>
            <Link
              href="/sponsor"
              className="shrink-0 bg-white text-[#449933] px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-lg"
            >
              Meet the Farmers
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1920&q=80"
            alt="Green crop field"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-dark/95 via-navy/90 to-[#1e3a3a]/85" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(93,179,71,0.08)_0%,transparent_70%)]" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeInWhenVisible>
            <Droplets className="w-14 h-14 text-[#5DB347]/40 mx-auto mb-6" />
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight text-glow">
              Ready to Grow With Us?
            </h2>
            <p className="text-white/80 text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
              Whether you farm two hectares or two thousand, we&apos;re here to help.
              Tell us your story and let&apos;s build something extraordinary together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/apply"
                className="group px-10 py-5 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2 text-white shadow-lg shadow-[#5DB347]/30 hover:shadow-xl hover:shadow-[#5DB347]/40 hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #5DB347, #449933)' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'linear-gradient(135deg, #6ABF4B, #5DB347)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'linear-gradient(135deg, #5DB347, #449933)')}
              >
                Join Our Farming Family
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/contact"
                className="border-2 border-white/50 hover:border-white hover:bg-white/10 text-white px-10 py-5 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center justify-center"
              >
                We&apos;re Here to Help
              </Link>
            </div>
          </FadeInWhenVisible>
        </div>
      </section>
    </>
  );
}
