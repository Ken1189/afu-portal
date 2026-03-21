'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
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
  BarChart3,
  Star,
  CheckCircle2,
  Play,
  Zap,
  ShieldPlus,
  Scale,
  PieChart,
  Target,
  Building2,
  LineChart,
  Landmark,
  BadgeDollarSign,
} from 'lucide-react';
import { useCountUp } from '@/hooks/useCountUp';

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

/* ─── Stat counter card ─── */
function CountStat({
  target,
  prefix = '',
  suffix = '',
  label,
  decimals = 0,
}: {
  target: number;
  prefix?: string;
  suffix?: string;
  label: string;
  decimals?: number;
}) {
  const { ref, formatted } = useCountUp({ target, prefix, suffix, decimals, duration: 2200 });
  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl md:text-5xl font-bold mb-2" style={{ color: '#5DB347' }}>{formatted}</div>
      <p className="text-navy/70 text-lg">{label}</p>
    </div>
  );
}

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
    img: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&h=500&fit=crop',
  },
  {
    icon: ShieldCheck,
    title: 'Guaranteed Offtake',
    desc: 'Pre-arranged buyers and distribution. No more selling cheap or wasting crops.',
    link: '/services/offtake',
    img: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=500&fit=crop',
  },
  {
    icon: CircleDollarSign,
    title: 'Trade Finance',
    desc: 'Letters of credit, invoice finance, and commodities partner distribution.',
    link: '/services/trade-finance',
    img: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=500&fit=crop',
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

/* ─── Testimonials ─── */
const testimonials = [
  {
    name: 'Tendai Moyo',
    role: 'Blueberry Farmer, Zimbabwe',
    quote: 'AFU connected me with EU buyers and financed my cold chain. My export revenue tripled in one season.',
    img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
    rating: 5,
  },
  {
    name: 'Amina Bakari',
    role: 'Cassava Processor, Tanzania',
    quote: 'The processing hub access changed everything. We now sell dried cassava chips to three countries instead of raw tubers locally.',
    img: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&h=200&fit=crop&crop=face',
    rating: 5,
  },
  {
    name: 'Kabo Mothibi',
    role: 'Sesame Grower, Botswana',
    quote: 'From seed to sale, AFU handled the inputs, training, and buyer contracts. I just focused on growing.',
    img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face',
    rating: 5,
  },
];

/* ─── Partner logos (text-based placeholders) ─── */
const partners = [
  'World Bank', 'African Dev Bank', 'Netafim', 'Bayer CropScience',
  'DHL Supply Chain', 'Tesco', 'Woolworths', 'Standard Chartered',
  'USAID', 'Gates Foundation', 'IFC', 'Rabobank',
];

/* ─── How it works ─── */
const howItWorks = [
  { step: '01', title: 'Apply & Join', desc: 'Complete your membership application. Upload farm details and documents.', icon: Users },
  { step: '02', title: 'Get Financed', desc: 'Access working capital, input finance, and equipment leasing tailored to your crop cycle.', icon: Banknote },
  { step: '03', title: 'Grow & Process', desc: 'Use premium inputs, expert training, and processing hubs to maximize yields and value.', icon: Leaf },
  { step: '04', title: 'Sell & Scale', desc: 'Guaranteed offtake contracts and trade finance turn your harvest into predictable cash flows.', icon: TrendingUp },
];

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export default function Home() {
  return (
    <>
      {/* ─── HERO ─── */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920&h=1080&fit=crop"
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
              Phase 1: Botswana &bull; Zimbabwe &bull; Tanzania
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] text-white mb-6"
            >
              Africa&apos;s Agriculture{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6ABF4B] to-[#90D87A]">
                Development Bank
              </span>{' '}
              + Operating Platform
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-lg md:text-xl text-gray-300 mb-10 leading-relaxed max-w-2xl"
            >
              Financing, Inputs, Processing, Offtake, Trade Finance &amp; Training.
              One integrated loop that turns crops into controlled cashflows.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link
                href="/apply"
                className="group text-white px-8 py-4 rounded-xl font-semibold text-lg transition-smooth flex items-center justify-center gap-2 shadow-lg"
                style={{ background: '#5DB347' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#449933')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#5DB347')}
              >
                Become a Member
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/services/financing"
                className="group border-2 border-white/30 hover:border-white/60 hover:bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-semibold text-lg transition-smooth flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5" />
                See How It Works
              </Link>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="mt-12 flex flex-wrap items-center gap-6 text-white/60 text-sm"
            >
              <div className="flex items-center gap-2">
                <ShieldPlus className="w-4 h-4" />
                <span>Licensed & Regulated</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe2 className="w-4 h-4" />
                <span>3 Countries Active</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
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

      {/* ─── IMPACT STATS (Animated counters) ─── */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#5DB347]/30 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInWhenVisible>
            <div className="text-center mb-14">
              <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#5DB347' }}>The Africa Agriculture Paradox</span>
              <h2 className="text-3xl md:text-4xl font-bold text-navy mt-2 mb-4 text-gradient-green">
                The Opportunity is Enormous
              </h2>
              <p className="text-gray-500 max-w-2xl mx-auto">
                Africa has the land, labor, and demand. What&apos;s missing is the integrated infrastructure and finance to unlock it.
              </p>
            </div>
          </FadeInWhenVisible>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <FadeInWhenVisible delay={0}>
              <div className="card-polished stat-card bg-gradient-to-br from-[#EBF7E5] to-white rounded-2xl p-8 border border-[#5DB347]/10">
                <CountStat target={60} suffix="%" label="of world's uncultivated arable land is in Africa" />
              </div>
            </FadeInWhenVisible>
            <FadeInWhenVisible delay={0.1}>
              <div className="card-polished stat-card bg-gradient-to-br from-[#EBF7E5] to-white rounded-2xl p-8 border border-[#5DB347]/10">
                <CountStat target={50} prefix="$" suffix="B+" label="of food imported annually across Africa" />
              </div>
            </FadeInWhenVisible>
            <FadeInWhenVisible delay={0.2}>
              <div className="card-polished stat-card bg-gradient-to-br from-[#EBF7E5] to-white rounded-2xl p-8 border border-[#5DB347]/10">
                <CountStat target={40} suffix="%" label="of food lost post-harvest due to weak infrastructure" />
              </div>
            </FadeInWhenVisible>
            <FadeInWhenVisible delay={0.3}>
              <div className="card-polished stat-card bg-gradient-to-br from-[#EBF7E5] to-white rounded-2xl p-8 border border-[#5DB347]/10">
                <CountStat target={247} suffix="+" label="active AFU members across 3 countries" />
              </div>
            </FadeInWhenVisible>
          </div>
        </div>
      </section>

      {/* ─── WHAT AFU PROVIDES (Services Grid) ─── */}
      <section className="py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInWhenVisible>
            <div className="text-center mb-16">
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
                    className="group block bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-[#5DB347]/30 hover:shadow-xl transition-all duration-300 card-polished"
                  >
                    {/* Card image */}
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={svc.img}
                        alt={svc.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-navy/60 to-transparent" />
                      <div className="absolute bottom-4 left-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ background: '#5DB347' }}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    </div>
                    {/* Card body */}
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-navy mb-2 group-hover:text-[#5DB347] transition-colors flex items-center gap-2">
                        {svc.title}
                        <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                      </h3>
                      <p className="text-gray-500 text-sm leading-relaxed">{svc.desc}</p>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </StaggerChildren>
        </div>
      </section>

      {/* ─── THE AFU FLYWHEEL ─── */}
      <section className="py-24 bg-navy text-white overflow-hidden">
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
                        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform"
                        style={{ background: item.bg }}
                      >
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <span className="text-xs font-bold mb-1" style={{ color: '#5DB347' }}>Step {item.step}</span>
                      <span className="text-sm font-semibold text-white">{item.label}</span>
                    </div>
                    {/* Connector arrow (hidden on last item and small screens) */}
                    {item.step < 7 && (
                      <div className="hidden lg:flex absolute top-8 -right-2 w-4 items-center justify-center">
                        <ArrowRight className="w-4 h-4 text-[#5DB347]/50" />
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

      {/* ─── HOW IT WORKS ─── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInWhenVisible>
            <div className="text-center mb-16">
              <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#5DB347' }}>Getting Started</span>
              <h2 className="text-3xl md:text-4xl font-bold text-navy mt-2 mb-4 text-gradient-green">
                Four Steps to Growth
              </h2>
              <p className="text-gray-500 max-w-2xl mx-auto">
                From application to export income — AFU makes the journey clear and supported.
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
                      <div className="hidden lg:block absolute top-12 left-[calc(100%+0.5rem)] w-[calc(100%-1rem)] h-px bg-gray-200">
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full" style={{ background: '#5DB347' }} />
                      </div>
                    )}
                    <div className="card-polished bg-cream rounded-2xl p-8 h-full group-hover:shadow-lg transition-shadow border border-transparent group-hover:border-[#5DB347]/20">
                      <div className="text-5xl font-bold text-[#5DB347]/15 mb-4">{item.step}</div>
                      <div className="w-12 h-12 bg-[#EBF7E5] rounded-xl flex items-center justify-center mb-4">
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

      {/* ─── IMAGE FEATURE SPLIT ─── */}
      <section className="py-24 bg-cream overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Image */}
            <FadeInWhenVisible direction="right">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&h=600&fit=crop"
                  alt="African farmer inspecting crops"
                  width={800}
                  height={600}
                  className="w-full h-auto"
                />
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-navy/80 to-transparent p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: '#5DB347' }}>
                      <BarChart3 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">AI-Powered Insights</p>
                      <p className="text-white/60 text-xs">Real-time crop health &amp; market analytics</p>
                    </div>
                  </div>
                </div>
              </div>
            </FadeInWhenVisible>

            {/* Text */}
            <FadeInWhenVisible direction="left">
              <div>
                <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#5DB347' }}>Technology Advantage</span>
                <h2 className="text-3xl md:text-4xl font-bold text-navy mt-2 mb-6 text-gradient-green">
                  AI-Powered Agriculture for Smarter Farming
                </h2>
                <p className="text-gray-500 mb-8 leading-relaxed">
                  Our Mkulima AI assistant helps farmers with crop diagnostics, market pricing,
                  weather alerts, and personalized recommendations — accessible via the portal or WhatsApp.
                </p>
                <div className="space-y-4">
                  {[
                    'Crop health scanner with photo-based diagnosis',
                    'AI credit scoring for faster loan decisions',
                    'Real-time market prices and trend alerts',
                    'Satellite monitoring and weather forecasts',
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" style={{ color: '#5DB347' }} />
                      <span className="text-navy text-sm font-medium">{item}</span>
                    </div>
                  ))}
                </div>
                <Link
                  href="/services/financing"
                  className="inline-flex items-center gap-2 mt-8 font-semibold hover:gap-3 transition-all"
                  style={{ color: '#5DB347' }}
                >
                  Learn more about our technology
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </FadeInWhenVisible>
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInWhenVisible>
            <div className="text-center mb-16">
              <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#5DB347' }}>Success Stories</span>
              <h2 className="text-3xl md:text-4xl font-bold text-navy mt-2 mb-4 text-gradient-green">
                Hear From Our Members
              </h2>
              <p className="text-gray-500 max-w-2xl mx-auto">
                Real farmers, real results. See how AFU is transforming agriculture across the continent.
              </p>
            </div>
          </FadeInWhenVisible>

          <StaggerChildren className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <motion.div
                key={t.name}
                variants={fadeUpChild}
                className="card-polished bg-cream rounded-2xl p-8 border border-gray-100 hover:shadow-lg transition-shadow"
              >
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-gold fill-gold" />
                  ))}
                </div>
                {/* Quote */}
                <p className="text-navy/80 text-sm leading-relaxed mb-6 italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden">
                    <Image
                      src={t.img}
                      alt={t.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-navy font-semibold text-sm">{t.name}</p>
                    <p className="text-gray-500 text-xs">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ─── PARTNER LOGOS MARQUEE ─── */}
      <section className="py-16 bg-cream border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInWhenVisible>
            <p className="text-center text-sm font-semibold text-gray-400 uppercase tracking-wider mb-10">
              Trusted by Leading Organizations
            </p>
          </FadeInWhenVisible>
          <div className="overflow-hidden relative">
            <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-cream to-transparent z-10" />
            <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-cream to-transparent z-10" />
            <div className="animate-marquee flex gap-12 items-center whitespace-nowrap">
              {[...partners, ...partners].map((name, i) => (
                <div
                  key={`${name}-${i}`}
                  className="flex-shrink-0 px-6 py-3 bg-white rounded-lg border border-gray-100 shadow-sm"
                >
                  <span className="text-navy/60 font-semibold text-sm">{name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── MEMBERSHIP TIERS ─── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInWhenVisible>
            <div className="text-center mb-16">
              <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#5DB347' }}>Membership</span>
              <h2 className="text-3xl md:text-4xl font-bold text-navy mt-2 mb-4 text-gradient-green">
                Choose Your Tier
              </h2>
              <p className="text-gray-500 max-w-2xl mx-auto">
                Every tier gets access to the full AFU ecosystem. Pick the level that matches your operation.
              </p>
            </div>
          </FadeInWhenVisible>

          <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                tier: 'Tier A',
                name: 'Smallholder',
                price: '$50',
                period: '/year',
                features: [
                  'Input bundles access',
                  'Seasonal working capital',
                  'Training & compliance onboarding',
                  'Guaranteed buy-back routes',
                  'Member dashboard & AI chatbot',
                ],
                cta: 'Join as Smallholder',
                highlight: false,
              },
              {
                tier: 'Tier B',
                name: 'Commercial',
                price: '$500',
                period: '/year',
                features: [
                  'Everything in Tier A',
                  'Equipment finance & irrigation',
                  'High-value crop financing',
                  'Structured offtake contracts',
                  'Processing access & export packaging',
                ],
                cta: 'Join as Commercial',
                highlight: true,
              },
              {
                tier: 'Tier C',
                name: 'Enterprise',
                price: 'Custom',
                period: '',
                features: [
                  'Everything in Tier B',
                  'Project finance & infrastructure',
                  'Anchor processing hub access',
                  'Full corridor offtake contracts',
                  'Dedicated account manager',
                ],
                cta: 'Contact Us',
                highlight: false,
              },
              {
                tier: 'Partner',
                name: 'Partner',
                price: '$250',
                period: '/year',
                features: [
                  'Partner directory listing',
                  'Deal flow access',
                  'Co-branded programs',
                  'Member network access',
                  'Training partnership options',
                ],
                cta: 'Become a Partner',
                highlight: false,
              },
            ].map((item) => (
              <motion.div key={item.name} variants={fadeUpChild}>
                <div
                  className={`rounded-2xl p-8 h-full flex flex-col transition-all duration-300 hover:shadow-xl ${
                    item.highlight
                      ? 'bg-navy text-white ring-2 ring-[#5DB347] shadow-xl relative'
                      : 'card-polished bg-white border border-gray-200 hover:border-[#5DB347]/30'
                  }`}
                >
                  {item.highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg" style={{ background: '#5DB347' }}>
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
                      className={`text-3xl font-bold ${
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

      {/* ─── INVESTOR SECTION ─── */}
      <section className="py-24 bg-gradient-to-br from-navy-dark via-navy to-[#1e3a5f] text-white overflow-hidden relative">
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'1.5\'/%3E%3C/g%3E%3C/svg%3E")' }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Section header */}
          <FadeInWhenVisible>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-gold/20 border border-gold/30 text-gold px-4 py-1.5 rounded-full text-sm font-medium mb-4">
                <Landmark className="w-4 h-4" />
                Investment Opportunity
              </div>
              <h2 className="text-3xl md:text-5xl font-bold mt-2 mb-4">
                Invest in Africa&apos;s Agricultural{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold to-amber-300">
                  Transformation
                </span>
              </h2>
              <p className="text-gray-300 max-w-3xl mx-auto text-lg">
                Join a generational investment opportunity. Africa&apos;s agriculture sector is projected to reach
                $1 trillion by 2030. AFU is the integrated platform positioned to capture this growth.
              </p>
            </div>
          </FadeInWhenVisible>

          {/* Investment metrics */}
          <StaggerChildren className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
            {[
              { icon: Target, value: '$1T', label: 'African Agri Market by 2030', color: 'from-gold to-amber-500' },
              { icon: TrendingUp, value: '32%', label: 'Projected Annual ROI', color: 'from-green-400 to-emerald-500' },
              { icon: PieChart, value: '$50B+', label: 'Annual Food Import Gap', color: 'from-[#8CB89C] to-cyan-400' },
              { icon: LineChart, value: '10x', label: 'Value-Chain Multiplier', color: 'from-purple-400 to-indigo-400' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <motion.div key={item.label} variants={fadeUpChild}>
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 transition-colors group">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform shadow-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-2xl md:text-3xl font-bold text-white mb-1">{item.value}</div>
                    <p className="text-gray-400 text-xs sm:text-sm">{item.label}</p>
                  </div>
                </motion.div>
              );
            })}
          </StaggerChildren>

          {/* Two column: Investment thesis + Investment tiers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Left: Investment thesis */}
            <FadeInWhenVisible direction="right">
              <div>
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <BadgeDollarSign className="w-7 h-7 text-gold" />
                  Why Invest in AFU
                </h3>
                <div className="space-y-5">
                  {[
                    {
                      title: 'Vertically Integrated Model',
                      desc: 'AFU controls the full value chain — financing, inputs, processing, and offtake — creating compounding returns at every stage.',
                    },
                    {
                      title: 'Capital-Efficient Flywheel',
                      desc: 'Cash recycles through the loop: farmer repayments fund new disbursements. Each rotation costs less and yields more.',
                    },
                    {
                      title: 'Massive Addressable Market',
                      desc: 'Africa imports $50B+ in food annually despite having 60% of the world\'s uncultivated arable land. The supply gap is our opportunity.',
                    },
                    {
                      title: 'Technology Moat',
                      desc: 'AI credit scoring, satellite crop monitoring, and blockchain traceability create defensible advantages over traditional lenders.',
                    },
                    {
                      title: 'ESG & Impact Aligned',
                      desc: 'Every dollar deployed creates measurable social impact: jobs, food security, rural income growth, and climate resilience.',
                    },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4 group">
                      <div className="w-8 h-8 rounded-lg bg-[#5DB347]/20 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-[#5DB347]/30 transition-colors">
                        <CheckCircle2 className="w-4 h-4" style={{ color: '#5DB347' }} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white text-sm mb-1">{item.title}</h4>
                        <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </FadeInWhenVisible>

            {/* Right: Investment tiers */}
            <FadeInWhenVisible direction="left">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <Building2 className="w-7 h-7 text-gold" />
                  Investment Tiers
                </h3>
                {[
                  {
                    tier: 'Seed Investor',
                    min: '$10,000',
                    returns: '18-24% target',
                    features: ['Quarterly distributions', 'Annual impact report', 'Investor portal access'],
                    color: 'border-[#5DB347]/40 bg-[#5DB347]/5',
                    badge: 'bg-[#5DB347]/20 text-[#5DB347]',
                  },
                  {
                    tier: 'Growth Partner',
                    min: '$100,000',
                    returns: '24-32% target',
                    features: ['Monthly distributions', 'Advisory board seat', 'Direct deal co-investment', 'Priority pipeline access'],
                    color: 'border-gold/40 bg-gold/5 ring-1 ring-gold/20',
                    badge: 'bg-gold/20 text-gold',
                  },
                  {
                    tier: 'Strategic Partner',
                    min: '$1,000,000+',
                    returns: 'Custom structure',
                    features: ['Board observer rights', 'Country exclusivity options', 'Joint venture structures', 'Equity participation option', 'Dedicated relationship manager'],
                    color: 'border-purple-400/40 bg-purple-500/5',
                    badge: 'bg-purple-500/20 text-purple-300',
                  },
                ].map((item) => (
                  <div
                    key={item.tier}
                    className={`border rounded-2xl p-6 ${item.color} hover:scale-[1.02] transition-all duration-300`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${item.badge}`}>
                        {item.tier}
                      </span>
                      <span className="text-white font-bold text-lg">{item.min}</span>
                    </div>
                    <p className="text-gray-300 text-sm mb-3">
                      Target returns: <span className="text-white font-semibold">{item.returns}</span>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {item.features.map((f, j) => (
                        <span key={j} className="text-xs bg-white/5 border border-white/10 text-gray-300 px-2.5 py-1 rounded-lg">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}

                {/* CTA */}
                <div className="pt-4 flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/contact"
                    className="group flex-1 bg-gradient-to-r from-gold to-amber-500 hover:from-gold hover:to-amber-400 text-navy-dark px-6 py-3.5 rounded-xl font-bold text-sm transition-smooth flex items-center justify-center gap-2 shadow-lg shadow-gold/20"
                  >
                    Request Investor Pack
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    href="/contact"
                    className="flex-1 border border-white/30 hover:border-white/60 hover:bg-white/5 text-white px-6 py-3.5 rounded-xl font-bold text-sm transition-smooth flex items-center justify-center gap-2"
                  >
                    Schedule a Call
                  </Link>
                </div>
              </div>
            </FadeInWhenVisible>
          </div>

          {/* Trusted investors / backing */}
          <FadeInWhenVisible delay={0.3}>
            <div className="mt-16 pt-12 border-t border-white/10 text-center">
              <p className="text-gray-400 text-sm mb-6">Backed by institutional-grade agriculture finance infrastructure</p>
              <div className="flex flex-wrap items-center justify-center gap-6">
                {['DFI-Ready Structure', 'Ring-Fenced SPV', 'Annual Audits (Big 4)', 'IFRS Compliant', 'ESG Framework'].map((badge) => (
                  <div key={badge} className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-lg">
                    <ShieldPlus className="w-3.5 h-3.5" style={{ color: '#5DB347' }} />
                    <span className="text-gray-300 text-xs font-medium">{badge}</span>
                  </div>
                ))}
              </div>
            </div>
          </FadeInWhenVisible>
        </div>
      </section>

      {/* ─── COUNTRIES MAP / COVERAGE ─── */}
      <section className="py-24 bg-cream">
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
                    {
                      flag: '🇧🇼',
                      name: 'Botswana',
                      crops: 'Sorghum, Sesame, Groundnuts',
                      members: 82,
                    },
                    {
                      flag: '🇿🇼',
                      name: 'Zimbabwe',
                      crops: 'Blueberries, Macadamia, Maize',
                      members: 98,
                    },
                    {
                      flag: '🇹🇿',
                      name: 'Tanzania',
                      crops: 'Cassava, Sesame, Cashew',
                      members: 67,
                    },
                  ].map((c) => (
                    <div
                      key={c.name}
                      className="card-polished flex items-center gap-4 bg-white rounded-xl p-4 border border-gray-100 hover:border-[#5DB347]/20 hover:shadow-md transition-smooth"
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
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1489392191049-fc10c97e64b6?w=800&h=600&fit=crop"
                  alt="Map of Africa"
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

      {/* ── Sponsor a Farmer Section ─────────────────────────────────── */}
      <section className="py-20 bg-cream">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="inline-block bg-[#5DB347]/10 text-sm font-semibold px-4 py-1.5 rounded-full mb-4" style={{ color: '#5DB347' }}>
              🤝 Sponsor a Farmer
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-navy mb-4">
              Turn <span className="text-gradient-green">$5 a Month</span> Into a Farm&apos;s Future
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Real farmers. Real crops. Real impact. Sponsor an African farmer&apos;s membership, inputs,
              and program access — and get monthly updates as their season unfolds.
            </p>
          </div>

          {/* 3 tier preview cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
            {[
              { emoji: '🥉', tier: 'Bronze', price: '$5/mo', desc: 'Cover a farmer\'s AFU membership and give them platform access', color: 'border-amber-600' },
              { emoji: '🥈', tier: 'Silver', price: '$100/mo', desc: 'Fund a full season of crop inputs — seeds, fertiliser, pest control', color: 'border-gray-400', featured: true },
              { emoji: '🥇', tier: 'Gold', price: '$500/mo', desc: 'Full program sponsorship — inputs, insurance, and working capital', color: 'border-yellow-500' },
            ].map((item) => (
              <div key={item.tier} className={`card-polished p-6 border-t-4 ${item.color} relative`}>
                {item.featured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-white text-xs font-bold px-3 py-1 rounded-full" style={{ background: '#5DB347' }}>Most Popular</span>
                )}
                <div className="text-3xl mb-3">{item.emoji}</div>
                <div className="font-bold text-navy text-lg">{item.tier}</div>
                <div className="text-2xl font-bold my-1" style={{ color: '#5DB347' }}>{item.price}</div>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link href="/sponsor" className="inline-flex items-center gap-2 text-white font-semibold px-8 py-4 rounded-xl transition-smooth shadow-lg hover:shadow-xl" style={{ background: '#5DB347' }} onMouseEnter={(e) => (e.currentTarget.style.background = '#449933')} onMouseLeave={(e) => (e.currentTarget.style.background = '#5DB347')}>
              Meet the Farmers
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="relative py-28 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=1920&h=800&fit=crop"
            alt="Agricultural landscape"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-dark/95 via-navy/90 to-[#1e3a3a]/85" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeInWhenVisible>
            <Droplets className="w-12 h-12 text-white/30 mx-auto mb-6" />
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight text-glow">
              Ready to Join the Future of African Agriculture?
            </h2>
            <p className="text-white/80 text-lg mb-10 max-w-2xl mx-auto">
              AFU is building the agriculture development bank Africa has been missing.
              Not just capital — a full execution loop from seed to sale.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/apply"
                className="group bg-white hover:bg-gray-50 px-8 py-4 rounded-xl font-semibold text-lg transition-smooth flex items-center justify-center gap-2 shadow-lg"
                style={{ color: '#5DB347' }}
              >
                Apply for Membership
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/contact"
                className="border-2 border-white/50 hover:border-white text-white px-8 py-4 rounded-xl font-semibold text-lg transition-smooth flex items-center justify-center"
              >
                Get in Touch
              </Link>
            </div>
          </FadeInWhenVisible>
        </div>
      </section>
    </>
  );
}
