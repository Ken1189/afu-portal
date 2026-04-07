'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
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
  Medal,
} from 'lucide-react';
import { useCountUp } from '@/hooks/useCountUp';
import { createClient } from '@/lib/supabase/client';
import LegalDisclaimer from '@/components/ui/LegalDisclaimer';

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

/* ─── Service cards data (FALLBACK) ─── */
const FALLBACK_SERVICES = [
  {
    icon: Banknote,
    title: 'Financing',
    desc: 'Working capital, invoice finance, and crop financing from smallholder to commercial scale.',
    link: '/services/financing',
    img: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=800&h=500&q=80&auto=format&fit=crop',
  },
  {
    icon: Cog,
    title: 'Inputs & Equipment',
    desc: 'Tractors, drones, irrigation, seeds, and fertilizers. Bulk procurement at better prices.',
    link: '/services/inputs',
    img: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&h=500&fit=crop',
  },
  {
    icon: Factory,
    title: 'Processing Hubs',
    desc: 'Milling, drying, cold chain, and packaging. Value-addition at source.',
    link: '/services/processing',
    img: 'https://images.unsplash.com/photo-1518977822534-7049a61ee0c2?w=1200&q=80&auto=format&fit=crop',
  },
  {
    icon: ShieldCheck,
    title: 'Guaranteed Offtake',
    desc: 'Pre-arranged buyers and distribution. No more selling cheap or wasting crops.',
    link: '/services/offtake',
    img: 'https://images.unsplash.com/photo-1504370805625-d32c54b16100?w=800&h=500&fit=crop',
  },
  {
    icon: CircleDollarSign,
    title: 'Trade Finance',
    desc: 'SBLCs, Letters of Credit, export pre-financing, and FX services via our banking partners.',
    link: '/services/trade-finance',
    img: 'https://images.unsplash.com/photo-1530267981375-f0de937f5f13?w=800&h=500&fit=crop',
  },
  {
    icon: GraduationCap,
    title: 'Training & Certification',
    desc: 'Vocational partnerships to build scalable farmer capacity, compliance, and export readiness.',
    link: '/services/training',
    img: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&h=500&fit=crop',
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

/* ─── Testimonials — only shown when real testimonials exist in DB ─── */

/* ─── Partner logos — real partners, fallback if DB empty ─── */
const FALLBACK_PARTNERS = [
  { name: 'RioTrade', initials: 'RT', color: '#1B2A4A', logo_url: '/partners/riotrade.png' },
  { name: 'Watson & Fine', initials: 'WF', color: '#000000', logo_url: '/partners/watson-fine.png' },
  { name: 'Savithi Trading', initials: 'ST', color: '#CC0000', logo_url: '/partners/savithi.jpeg' },
  { name: 'Rajo Beheer BV', initials: 'RB', color: '#7B2D8E', logo_url: '/partners/rajo-beheer.png' },
  { name: 'Alvan Blanch', initials: 'AB', color: '#006633', logo_url: '/partners/alvan-blanch.png' },
  { name: 'Piso Aviation', initials: 'PA', color: '#1B2A4A', logo_url: '/partners/Piso Aviation Logo.jpeg' },
];

/* ─── How it works ─── */
const FALLBACK_HOW_IT_WORKS = [
  { step: '01', title: 'Tell Us Your Story', desc: 'Tell us about you and your vision. Share your farming story, your land, your dreams. We want to understand what makes your farm unique.' },
  { step: '02', title: 'Get Financed', desc: 'Access working capital, input finance, and equipment leasing tailored to your crop cycle.' },
  { step: '03', title: 'Grow & Process', desc: 'Use premium inputs, expert training, and processing hubs to maximize yields and value.' },
  { step: '04', title: 'Sell & Scale', desc: 'Guaranteed offtake contracts and trade finance turn your harvest into predictable cash flows.' },
];
const HOW_IT_WORKS_ICONS = [Users, Banknote, Leaf, TrendingUp];

/* ─── Unified editable homepage content blob (homepage_content key) ─── */
type HomepageContent = {
  flywheel_eyebrow?: string;
  flywheel_title?: string;
  flywheel_subtitle?: string;
  flywheel_labels?: string[];
  flywheel_recycle_text?: string;
  how_it_works_eyebrow?: string;
  how_it_works_title?: string;
  how_it_works_subtitle?: string;
  how_it_works_steps?: { step: string; title: string; desc: string }[];
  ai_eyebrow?: string;
  ai_title?: string;
  ai_body?: string;
  ai_features?: string[];
  ai_link_text?: string;
  ai_image?: string;
  investor_eyebrow?: string;
  investor_title_pre?: string;
  investor_title_highlight?: string;
  investor_body?: string;
  promise_eyebrow?: string;
  promise_title?: string;
  promise_subtitle?: string;
  showup_eyebrow?: string;
  showup_title?: string;
  showup_subtitle?: string;
  sponsor_eyebrow?: string;
  sponsor_title?: string;
  sponsor_subtitle?: string;
  final_cta_title?: string;
  final_cta_body?: string;
  final_cta_primary_text?: string;
  final_cta_primary_link?: string;
  final_cta_secondary_text?: string;
  final_cta_secondary_link?: string;
  stats_eyebrow?: string;
  stats_title?: string;
  stats_subtitle?: string;
  services_eyebrow?: string;
  services_title?: string;
  services_subtitle?: string;
  programs_eyebrow?: string;
  programs_title?: string;
  programs_subtitle?: string;
  hero_headline?: string;
  hero_subtitle?: string;
  hero_cta_text?: string;
  hero_cta_link?: string;
  hero_bg_image?: string;
  hero_badge_text?: string;
};

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* ─── Hero defaults ─── */
const HERO_DEFAULTS = {
  hero_headline: "Let's Grow Together",
  hero_subtitle: 'By farmers, for farmers. Run by Africans, for Africans. We bring the financing, inputs, processing, and guaranteed buyers — you bring the land and the passion. Together, we turn your harvest into real, sustainable income.',
  hero_cta_text: 'Join Our Farming Family',
  hero_cta_link: '/apply',
  hero_bg_image: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1920&h=1080&fit=crop',
};

/* ─── Homepage stats fallback (DB key: homepage_stats) ─── */
type HomepageStat = { value: string; label: string; source?: string };
const FALLBACK_HOMEPAGE_STATS: HomepageStat[] = [
  { value: '60%', label: "Of the world's arable land", source: 'World Bank' },
  { value: '$50B', label: 'Annual food imports into Africa', source: 'AfDB' },
  { value: '23%', label: 'GDP from agriculture', source: 'FAO' },
  { value: '70%', label: 'Of Africans depend on farming', source: 'World Bank' },
];

/* ─── Membership tiers fallback (DB key: membership_tiers_homepage) ─── */
type HomepageMembershipTier = {
  tier: string;
  name: string;
  price: string;
  period?: string;
  features: string[];
  cta: string;
  highlight?: boolean;
  link?: string;
};
const FALLBACK_MEMBERSHIP_TIERS: HomepageMembershipTier[] = [
  { tier: 'Free', name: 'Free', price: '$0', period: '', features: ['Basic crop tracking', '1 free training course', 'Browse marketplace', 'Limited AI assistant'], cta: 'Get Started Free', highlight: false },
  { tier: 'Smallholder', name: 'Smallholder', price: '$4.99', period: '/mo', features: ['Full crop tracking', 'Financing up to $5K', 'Basic insurance', 'Marketplace access', 'AI assistant'], cta: 'Join as Smallholder', highlight: false },
  { tier: 'Commercial', name: 'Commercial', price: '$49', period: '/mo', features: ['Advanced crop tracking', 'Financing up to $50K', 'Full insurance', 'Discounted inputs', 'Basic trade finance'], cta: 'Join Commercial', highlight: false },
  { tier: 'Enterprise', name: 'Enterprise', price: '$499', period: '/mo', features: ['Financing up to $250K', 'Comprehensive insurance', 'Dedicated advisor', 'Full trade finance', 'Legal support & VIP events'], cta: 'Join Enterprise', highlight: true },
  { tier: 'Partner', name: 'Partner / Vendor', price: 'On Request', period: '', features: ['Directory listing', 'Co-branded programs', 'Member network access', 'Deal flow access', 'Dedicated advisor'], cta: 'Contact Us', highlight: false },
];

/* ─── Programs fallback ─── */
const FALLBACK_PROGRAMS = [
  {
    name: 'Blueberry Export Program',
    countries: 'Zimbabwe',
    crop: 'Blueberries',
    desc: '25ha commercial blueberry operation targeting EU markets. Counter-seasonal advantage delivers premium pricing when Northern Hemisphere supply is low.',
    icon: Sprout,
  },
  {
    name: 'Maize & Soya Staples Program',
    countries: 'Multi-country',
    crop: 'Maize & Soya',
    desc: 'Food security crops cultivated across all 9 AFU countries. Building reliable staple supply chains from smallholder to market.',
    icon: Leaf,
  },
  {
    name: 'Sesame Export Program',
    countries: 'Zimbabwe, Tanzania',
    crop: 'Sesame',
    desc: 'High-demand oilseed for export markets. Contract farming model connecting smallholders to international commodity buyers.',
    icon: TrendingUp,
  },
  {
    name: 'Castor Oil Program',
    countries: 'Multi-country',
    crop: 'Castor',
    desc: 'ENI-approved off-take agreement for biofuel feedstock. Industrial-grade castor oil production with guaranteed buyer.',
    icon: Factory,
  },
  {
    name: 'Macadamia Development',
    countries: 'Zimbabwe, Mozambique',
    crop: 'Macadamia',
    desc: 'Premium nut export program. Long-term orchard development delivering high-margin returns in global snack and confectionery markets.',
    icon: Target,
  },
];

/* ─── Icon lookup for programs from DB ─── */
const PROGRAM_ICON_MAP: Record<string, typeof Sprout> = {
  Sprout, Leaf, TrendingUp, Factory, Target, Tractor, Droplets, BarChart3, Star,
};

export default function Home() {
  const [testimonials, setTestimonials] = useState<{ name: string; role: string; quote: string; img: string; rating: number }[]>([]);
  const [partners, setPartners] = useState<{ name: string; initials: string; color: string; logo_url?: string }[]>(FALLBACK_PARTNERS);
  const [hero, setHero] = useState(HERO_DEFAULTS);
  const [services, setServices] = useState(FALLBACK_SERVICES);
  const [programs, setPrograms] = useState(FALLBACK_PROGRAMS);
  const [memberCount, setMemberCount] = useState(0);
  const [homepageStats, setHomepageStats] = useState<HomepageStat[]>(FALLBACK_HOMEPAGE_STATS);
  const [membershipTiers, setMembershipTiers] = useState<HomepageMembershipTier[]>(FALLBACK_MEMBERSHIP_TIERS);

  /* ─── Unified editable content blob (with draft preview) ─── */
  const searchParams = useSearchParams();
  const isPreview = searchParams?.get('preview') === 'draft' || searchParams?.get('preview') === 'true';
  const [content, setContent] = useState<HomepageContent>({});
  const c = (key: keyof HomepageContent, fallback: string): string => {
    const v = content[key];
    return typeof v === 'string' && v.length > 0 ? v : fallback;
  };

  useEffect(() => {
    const supabase = createClient();
    const key = isPreview ? 'homepage_content_draft' : 'homepage_content_published';
    supabase
      .from('site_config')
      .select('value')
      .eq('key', key)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.value) {
          try {
            const parsed = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
            if (parsed && typeof parsed === 'object') setContent(parsed as HomepageContent);
          } catch {
            // ignore parse errors
          }
        }
      });
  }, [isPreview]);

  // Listen for postMessage from parent (content editor) for instant live preview
  useEffect(() => {
    if (!isPreview) return;
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'preview-update' && e.data?.content) {
        setContent(e.data.content as HomepageContent);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [isPreview]);

  // Section visibility from site_config key "homepage_sections"
  const [sectionVisibility, setSectionVisibility] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function fetchSectionVisibility() {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from('site_config')
          .select('value')
          .eq('key', 'homepage_sections')
          .maybeSingle();
        if (data?.value) {
          const parsed = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
          if (Array.isArray(parsed)) {
            const vis: Record<string, boolean> = {};
            parsed.forEach((item: { section?: string; visible?: boolean }) => {
              if (item.section) vis[item.section] = item.visible !== false;
            });
            setSectionVisibility(vis);
          }
        }
      } catch {
        // On failure, sectionVisibility stays empty → all sections shown
      }
    }
    fetchSectionVisibility();
  }, []);

  // Helper: returns true if a section should be shown.
  // If config was never loaded (empty object), default to visible.
  const showSection = (key: string) => {
    if (Object.keys(sectionVisibility).length === 0) return true;
    return sectionVisibility[key] !== false;
  };

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

  useEffect(() => {
    async function fetchTestimonials() {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from('testimonials')
          .select('*')
          .eq('is_featured', true)
          .order('display_order', { ascending: true })
          .limit(6);
        if (data && data.length > 0) {
          setTestimonials(
            data.map((t: Record<string, unknown>) => ({
              name: (t.name as string) || (t.author_name as string) || '',
              role: (t.role as string) || (t.author_role as string) || '',
              quote: (t.quote as string) || (t.content as string) || '',
              img: (t.img as string) || (t.avatar_url as string) || (t.photo_url as string) || '',
              rating: (t.rating as number) || 5,
            }))
          );
        }
        // If no real testimonials in DB, keep empty array — section stays hidden
      } catch {
        // On error, keep empty array — no fake testimonials shown
      }
    }
    fetchTestimonials();
  }, []);

  useEffect(() => {
    async function fetchPartners() {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from('managed_partners')
          .select('*')
          .eq('is_published', true)
          .order('display_order', { ascending: true });
        if (data && data.length > 0) {
          setPartners(
            data.map((p: Record<string, unknown>) => ({
              name: (p.name as string) || (p.company_name as string) || '',
              initials: (p.initials as string) || ((p.name as string) || '').slice(0, 2).toUpperCase(),
              color: (p.brand_color as string) || (p.color as string) || '#5DB347',
              logo_url: (p.logo_url as string) || undefined,
            }))
          );
        }
      } catch {
        // keep fallback
      }
    }
    fetchPartners();
  }, []);

  /* ─── Live member count from profiles ─── */
  useEffect(() => {
    async function fetchMemberCount() {
      try {
        const supabase = createClient();
        const { count } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
        if (count && count > 0) {
          setMemberCount(count);
        }
      } catch {
        // keep fallback 0 – will show "Growing community of" instead
      }
    }
    fetchMemberCount();
  }, []);

  /* ─── Services from site_content ─── */
  useEffect(() => {
    async function fetchServices() {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from('site_content')
          .select('*')
          .eq('section', 'homepage_services')
          .order('display_order', { ascending: true });
        if (data && data.length > 0) {
          const iconMap: Record<string, typeof Banknote> = {
            Banknote, Cog, Factory, ShieldCheck, CircleDollarSign, GraduationCap,
          };
          setServices(
            data.map((s: Record<string, unknown>) => ({
              icon: iconMap[(s.icon as string) || ''] || Banknote,
              title: (s.title as string) || '',
              desc: (s.description as string) || (s.content as string) || '',
              link: (s.link as string) || (s.url as string) || '/services',
              img: (s.image_url as string) || (s.img as string) || 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&h=500&fit=crop',
            }))
          );
        }
      } catch {
        // keep fallback
      }
    }
    fetchServices();
  }, []);

  /* ─── Programs from DB ─── */
  useEffect(() => {
    async function fetchPrograms() {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from('programs')
          .select('*')
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(6);
        if (data && data.length > 0) {
          setPrograms(
            data.map((p: Record<string, unknown>) => ({
              name: (p.title as string) || '',
              countries: (p.country as string) || 'Multi-country',
              crop: (p.crop as string) || '',
              desc: (p.description as string) || '',
              icon: PROGRAM_ICON_MAP[(p.icon as string) || ''] || Sprout,
            }))
          );
        }
      } catch {
        // keep fallback
      }
    }
    fetchPrograms();
  }, []);

  /* ─── Homepage stats from site_config ─── */
  useEffect(() => {
    async function fetchHomepageStats() {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from('site_config')
          .select('value')
          .eq('key', 'homepage_stats')
          .maybeSingle();
        if (data?.value) {
          const parsed = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
          if (Array.isArray(parsed) && parsed.length > 0) {
            setHomepageStats(parsed as HomepageStat[]);
          }
        }
      } catch {
        // keep fallback
      }
    }
    fetchHomepageStats();
  }, []);

  /* ─── Membership tiers from site_config ─── */
  useEffect(() => {
    async function fetchMembershipTiers() {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from('site_config')
          .select('value')
          .eq('key', 'membership_tiers_homepage')
          .maybeSingle();
        if (data?.value) {
          const parsed = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMembershipTiers(parsed as HomepageMembershipTier[]);
          }
        }
      } catch {
        // keep fallback
      }
    }
    fetchMembershipTiers();
  }, []);

  // Resolve hero fields with priority: homepage_content blob > legacy site_config (hero state) > HERO_DEFAULTS
  const resolvedHero = {
    hero_headline:
      (typeof content.hero_headline === 'string' && content.hero_headline) ||
      hero.hero_headline ||
      HERO_DEFAULTS.hero_headline,
    hero_subtitle:
      (typeof content.hero_subtitle === 'string' && content.hero_subtitle) ||
      hero.hero_subtitle ||
      HERO_DEFAULTS.hero_subtitle,
    hero_cta_text:
      (typeof content.hero_cta_text === 'string' && content.hero_cta_text) ||
      hero.hero_cta_text ||
      HERO_DEFAULTS.hero_cta_text,
    hero_cta_link:
      (typeof content.hero_cta_link === 'string' && content.hero_cta_link) ||
      hero.hero_cta_link ||
      HERO_DEFAULTS.hero_cta_link,
    hero_bg_image:
      (typeof content.hero_bg_image === 'string' && content.hero_bg_image) ||
      hero.hero_bg_image ||
      HERO_DEFAULTS.hero_bg_image,
    hero_badge_text:
      (typeof content.hero_badge_text === 'string' && content.hero_badge_text) ||
      'Active across 9 African countries',
  };

  return (
    <>
      {/* ─── HERO ─── */}
      {showSection('hero') && <section className="relative min-h-[92vh] flex items-center overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <Image
            src={resolvedHero.hero_bg_image}
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
            <div className="inline-flex items-center gap-2 bg-[#5DB347]/20 backdrop-blur-sm border border-[#5DB347]/30 text-[#EBF7E5] px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-[#5DB347] rounded-full animate-pulse-soft" />
              {resolvedHero.hero_badge_text}
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] text-white mb-6">
              {resolvedHero.hero_headline.includes('Grow Together') ? (
                <>
                  Let&apos;s{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6ABF4B] to-[#90D87A]">
                    Grow Together
                  </span>
                </>
              ) : (
                resolvedHero.hero_headline
              )}
            </h1>

            <p className="text-lg md:text-xl text-gray-300 mb-10 leading-relaxed max-w-2xl">
              {resolvedHero.hero_subtitle}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href={resolvedHero.hero_cta_link}
                className="group text-white px-8 py-4 rounded-xl font-semibold text-lg transition-smooth flex items-center justify-center gap-2 shadow-lg"
                style={{ background: '#5DB347' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#449933')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#5DB347')}
              >
                {resolvedHero.hero_cta_text}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/about"
                className="group border-2 border-white/30 hover:border-white/60 hover:bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-semibold text-lg transition-smooth flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5" />
                See How It Works
              </Link>
            </div>

            {/* Trust badges */}
            <div className="mt-12 flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 px-4 py-2 rounded-full text-white/70">
                <Globe2 className="w-4 h-4 text-[#5DB347]" />
                <span>9 Countries Active</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 px-4 py-2 rounded-full text-white/70">
                <Users className="w-4 h-4 text-[#5DB347]" />
                <span>{memberCount >= 100 ? `${memberCount.toLocaleString()}+ Farmers` : 'Growing Community'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <ChevronDown className="w-6 h-6 text-white/50 animate-bounce-slow" />
        </div>
      </section>}

      {/* ─── IMPACT STATS (Animated counters) ─── */}
      {showSection('stats') && <section className="py-16 bg-gradient-to-b from-white via-[#f8fdf6] to-white relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#5DB347]/30 to-transparent" />
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #5DB347 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInWhenVisible>
            <div className="text-center mb-14">
              <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#5DB347' }}>{c('stats_eyebrow', 'The Africa Agriculture Paradox')}</span>
              <h2 className="text-3xl md:text-4xl font-bold text-navy mt-2 mb-4 text-gradient-green">
                {c('stats_title', 'The Opportunity is Enormous')}
              </h2>
              <p className="text-gray-500 max-w-2xl mx-auto">
                {c('stats_subtitle', "Africa has the land, labor, and demand. What's missing is the integrated infrastructure and finance to unlock it.")}
              </p>
            </div>
          </FadeInWhenVisible>

          {/* Stats — DB-driven via site_config key "homepage_stats" with fallback */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <FadeInWhenVisible delay={0.2}>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border-l-4 border-[#5DB347] shadow-lg shadow-[#5DB347]/5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <CountStat target={memberCount > 0 ? memberCount : 500} suffix="+" label="farmers across Africa" />
              </div>
            </FadeInWhenVisible>
            {homepageStats.map((stat, i) => (
              <FadeInWhenVisible key={`${stat.label}-${i}`} delay={0.3 + i * 0.1}>
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border-l-4 border-[#5DB347] shadow-lg shadow-[#5DB347]/5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center">
                  <div className="text-4xl md:text-5xl font-bold mb-2" style={{ color: '#5DB347' }}>{stat.value}</div>
                  <p className="text-navy/70 text-lg">{stat.label}</p>
                  {stat.source && (
                    <p className="text-xs text-gray-400 mt-1">Source: {stat.source}</p>
                  )}
                </div>
              </FadeInWhenVisible>
            ))}
          </div>
        </div>
      </section>}

      {/* ─── WHAT AFU PROVIDES (Services Grid) ─── */}
      {showSection('services') && <section className="py-16 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInWhenVisible>
            <div className="text-center mb-14">
              <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#5DB347' }}>{c('services_eyebrow', 'Our Services')}</span>
              <h2 className="text-3xl md:text-4xl font-bold text-navy mt-2 mb-4 text-gradient-green">
                {c('services_title', 'One Platform, Complete Value Chain')}
              </h2>
              <p className="text-gray-500 max-w-2xl mx-auto">
                {c('services_subtitle', 'A vertically integrated agriculture development platform — the specialized agri dev bank and execution engine Africa has been missing.')}
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
      </section>}

      {/* ─── OUR PROGRAMS ─── */}
      {showSection('programs') && <section className="py-16 bg-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #5DB347 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <FadeInWhenVisible>
            <div className="text-center mb-14">
              <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#5DB347' }}>{c('programs_eyebrow', 'Active Programs')}</span>
              <h2 className="text-3xl md:text-4xl font-bold text-navy mt-2 mb-4 text-gradient-green">
                {c('programs_title', 'Our Programs')}
              </h2>
              <p className="text-gray-500 max-w-2xl mx-auto">
                {c('programs_subtitle', 'Real farming programs generating real revenue. From blueberries bound for Europe to castor oil feeding global biofuel demand.')}
              </p>
            </div>
          </FadeInWhenVisible>

          <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map((program) => {
              const Icon = program.icon;
              return (
                <motion.div key={program.name} variants={fadeUpChild}>
                  <Link
                    href="/projects"
                    className="group block bg-white rounded-3xl p-6 shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 h-full"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-md" style={{ background: 'linear-gradient(135deg, #5DB347, #449933)' }}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-navy group-hover:text-[#5DB347] transition-colors leading-tight">
                          {program.name}
                        </h3>
                        <span className="text-xs text-gray-400 font-medium">{program.countries}</span>
                      </div>
                    </div>
                    <span className="inline-block bg-[#EBF7E5] text-[#449933] text-xs font-semibold px-3 py-1 rounded-full mb-3">
                      {program.crop}
                    </span>
                    <p className="text-gray-500 text-sm leading-relaxed mb-4">{program.desc}</p>
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold group-hover:gap-2.5 transition-all" style={{ color: '#5DB347' }}>
                      Learn More
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </Link>
                </motion.div>
              );
            })}
          </StaggerChildren>
        </div>
      </section>}

      {/* ─── THE AFU FLYWHEEL ─── */}
      <section className="py-16 bg-navy text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInWhenVisible>
            <div className="text-center mb-16">
              <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#5DB347' }}>{c('flywheel_eyebrow', 'The Model')}</span>
              <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4 text-glow">
                {c('flywheel_title', 'The AFU Flywheel')}
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                {c('flywheel_subtitle', 'Most players only do one piece. AFU ties the full loop together — capital flows in, crops flow out, cash recycles.')}
              </p>
            </div>
          </FadeInWhenVisible>

          {/* Flywheel steps */}
          <StaggerChildren className="relative">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
              {flywheelSteps.map((item, idx) => {
                const Icon = item.icon;
                const overrideLabel = content.flywheel_labels?.[idx];
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
                      <span className="text-sm font-semibold text-white">{overrideLabel || item.label}</span>
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
                <span className="text-sm font-semibold">{c('flywheel_recycle_text', "That's the compounding flywheel — cash recycles back into capital")}</span>
                <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#5DB347]/50" />
              </div>
            </FadeInWhenVisible>
          </StaggerChildren>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="py-16 bg-white relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#f8fdf6]/50 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <FadeInWhenVisible>
            <div className="text-center mb-14">
              <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#5DB347' }}>{c('how_it_works_eyebrow', 'Getting Started')}</span>
              <h2 className="text-3xl md:text-4xl font-bold text-navy mt-2 mb-4 text-gradient-green">
                {c('how_it_works_title', 'Four Steps to Growth')}
              </h2>
              <p className="text-gray-500 max-w-2xl mx-auto">
                {c('how_it_works_subtitle', 'From your first conversation to export income — we walk the journey with you, every step of the way.')}
              </p>
            </div>
          </FadeInWhenVisible>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {(content.how_it_works_steps && content.how_it_works_steps.length > 0 ? content.how_it_works_steps : FALLBACK_HOW_IT_WORKS).map((item, i) => {
              const Icon = HOW_IT_WORKS_ICONS[i] || HOW_IT_WORKS_ICONS[0];
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
                      {/* Step number with gradient circle */}
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


      {/* ─── IMAGE FEATURE SPLIT ─── */}
      <section className="py-16 bg-cream overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Image */}
            <FadeInWhenVisible direction="right">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src={c('ai_image', 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80&auto=format&fit=crop')}
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
                <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#5DB347' }}>{c('ai_eyebrow', 'Technology Advantage')}</span>
                <h2 className="text-3xl md:text-4xl font-bold text-navy mt-2 mb-6 text-gradient-green">
                  {c('ai_title', 'AI-Powered Agriculture for Smarter Farming')}
                </h2>
                <p className="text-gray-500 mb-8 leading-relaxed">
                  {c('ai_body', 'Our Amara AI assistant helps farmers with crop diagnostics, market pricing, weather alerts, and personalized recommendations — accessible via the portal or WhatsApp.')}
                </p>
                <div className="space-y-4">
                  {(content.ai_features && content.ai_features.length > 0 ? content.ai_features : [
                    'Crop health scanner with photo-based diagnosis',
                    'AI credit scoring for faster loan decisions',
                    'Real-time market prices and trend alerts',
                    'Satellite monitoring and weather forecasts',
                  ]).map((item, i) => (
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
                  {c('ai_link_text', 'Learn more about our technology')}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </FadeInWhenVisible>
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS — only shown when real testimonials exist in DB ─── */}
      {showSection('testimonials') && testimonials.length > 0 && <section className="py-16 bg-white relative">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#5DB347]/20 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInWhenVisible>
            <div className="text-center mb-14">
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
                className="bg-cream rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
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
      </section>}

      {/* ─── PARTNER LOGOS MARQUEE ─── */}
      {showSection('partners') && <section className="py-16 bg-cream border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInWhenVisible>
            <p className="text-center text-sm font-semibold text-gray-400 uppercase tracking-wider mb-10">
              Our Partners
            </p>
          </FadeInWhenVisible>
          <div className="overflow-hidden relative">
            <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-cream to-transparent z-10" />
            <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-cream to-transparent z-10" />
            <div className="animate-marquee flex gap-8 items-center whitespace-nowrap">
              {[...partners, ...partners].map((partner, i) => (
                <div
                  key={`${partner.name}-${i}`}
                  className="flex-shrink-0 flex items-center gap-3 px-6 py-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#5DB347]/20 transition-all"
                >
                  {partner.logo_url ? (
                    <img
                      src={partner.logo_url}
                      alt={partner.name}
                      className="h-12 w-auto max-w-[180px] object-contain"
                      onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }}
                    />
                  ) : null}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm ${partner.logo_url ? 'hidden' : ''}`}
                    style={{ backgroundColor: partner.color }}
                  >
                    <span className={`font-bold text-xs ${partner.color === '#FFCC00' ? 'text-[#1B2A4A]' : 'text-white'}`}>
                      {partner.initials}
                    </span>
                  </div>
                  {!partner.logo_url && <span className="text-navy/70 font-semibold text-sm">{partner.name}</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>}

      {/* ─── MEMBERSHIP TIERS ─── */}
      {showSection('membership_preview') && <section className="py-16 bg-gradient-to-b from-white to-[#f8fdf6]">
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
            {membershipTiers.map((item) => (
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
                    {(() => {
                      // Numeric prices render big; text prices (e.g. "On Request") render small
                      const isNumeric = /^\$?\d/.test(item.price.trim());
                      return (
                        <>
                          <span
                            className={`${
                              isNumeric ? 'text-4xl md:text-5xl font-extrabold' : 'text-xl md:text-2xl font-bold'
                            } ${item.highlight ? 'text-white' : 'text-navy'}`}
                          >
                            {item.price}
                          </span>
                          {item.period && (
                            <span
                              className={`text-sm ${
                                item.highlight ? 'text-gray-300' : 'text-gray-500'
                              }`}
                            >
                              {item.period}
                            </span>
                          )}
                        </>
                      );
                    })()}
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
                    href={item.link || '/apply'}
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
      </section>}

      {/* ─── INVESTOR SECTION ─── */}
      <section className="py-16 bg-gradient-to-br from-navy-dark via-navy to-[#1e3a5f] text-white overflow-hidden relative">
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'1.5\'/%3E%3C/g%3E%3C/svg%3E")' }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Section header */}
          <FadeInWhenVisible>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-gold/20 border border-gold/30 text-gold px-4 py-1.5 rounded-full text-sm font-medium mb-4">
                <Landmark className="w-4 h-4" />
                {c('investor_eyebrow', 'Investment Opportunity')}
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mt-2 mb-4">
                {c('investor_title_pre', "Invest in Africa's Agricultural")}{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold to-amber-300">
                  {c('investor_title_highlight', 'Transformation')}
                </span>
              </h2>
              <p className="text-gray-300 max-w-3xl mx-auto text-lg">
                {c('investor_body', "AFU is raising a multi-million dollar funding round to build Africa's first vertically integrated agriculture development bank and operating platform. Trade finance, input lending, and offtake — tapping into Africa's growing agricultural market.")}
              </p>
            </div>
          </FadeInWhenVisible>

          {/* Investment metrics — specific figures removed pending verified sourcing */}
          <StaggerChildren className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
            {[
              { icon: Target, value: 'Multi-Million', label: 'Funding Round', color: 'from-gold to-amber-500' },
              { icon: TrendingUp, value: 'Growing', label: 'African Agri Market', color: 'from-green-400 to-emerald-500' },
              { icon: PieChart, value: 'Major', label: 'Food Import Gap', color: 'from-[#8CB89C] to-cyan-400' },
              { icon: LineChart, value: 'Integrated', label: 'Value-Chain Model', color: 'from-purple-400 to-indigo-400' },
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
                      title: 'Trade Finance Revenue Engine',
                      desc: 'SBLCs, Letters of Credit, and export pre-financing via our banking partners generate high-margin fee income while unlocking cross-border trade for farmers.',
                    },
                    {
                      title: 'Massive Addressable Market',
                      desc: 'Africa has vast uncultivated arable land and a significant food import gap. That supply gap is our opportunity.',
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
                    min: '$250,000',
                    returns: '12-16% target',
                    features: ['Quarterly distributions', 'Annual impact report', 'Investor portal access'],
                    color: 'border-[#5DB347]/40 bg-[#5DB347]/5',
                    badge: 'bg-[#5DB347]/20 text-[#5DB347]',
                  },
                  {
                    tier: 'Growth Partner',
                    min: '$1,000,000',
                    returns: '15-20% target',
                    features: ['Monthly distributions', 'Advisory board seat', 'Direct deal co-investment', 'Priority pipeline access'],
                    color: 'border-gold/40 bg-gold/5 ring-1 ring-gold/20',
                    badge: 'bg-gold/20 text-gold',
                  },
                  {
                    tier: 'Strategic Partner',
                    min: '$5,000,000+',
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
                  Starting with high-potential markets, AFU is building the playbook to scale
                  the integrated agriculture platform across the continent.
                </p>
                <div className="space-y-6">
                  {[
                    {
                      flag: '🇿🇼',
                      name: 'Zimbabwe',
                      crops: 'Blueberries, Macadamia, Maize',
                      members: 98,
                    },
                    {
                      flag: '🇧🇼',
                      name: 'Botswana',
                      crops: 'Sorghum, Sesame, Groundnuts',
                      members: 82,
                    },
                    {
                      flag: '🇹🇿',
                      name: 'Tanzania',
                      crops: 'Cassava, Sesame, Cashew',
                      members: 67,
                    },
                    {
                      flag: '🇪🇹',
                      name: 'Ethiopia',
                      crops: 'Coffee, Teff, Oilseeds',
                      members: 54,
                    },
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
                  src="https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=800&q=80&auto=format&fit=crop"
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

      {/* ── Sponsor a Farmer Section ─────────────────────────────────── */}
      <section className="py-16 bg-cream">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="inline-block bg-[#5DB347]/10 text-sm font-semibold px-4 py-1.5 rounded-full mb-4" style={{ color: '#5DB347' }}>
              {c('sponsor_eyebrow', 'Sponsor a Farmer')}
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-navy mb-4">
              {content.sponsor_title ? content.sponsor_title : (<>Turn <span className="text-gradient-green">$5 a Month</span> Into a Farm&apos;s Future</>)}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {c('sponsor_subtitle', "Real farmers. Real crops. Real impact. Sponsor an African farmer's membership, inputs, and program access — and get monthly updates as their season unfolds.")}
            </p>
          </div>

          {/* 3 tier preview cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
            {[
              { tierColor: 'text-amber-600', tier: 'Bronze', price: '$5/mo', desc: 'Cover a farmer\'s AFU membership and give them platform access', color: 'border-amber-600' },
              { tierColor: 'text-gray-400', tier: 'Silver', price: '$100/mo', desc: 'Fund a full season of crop inputs — seeds, fertiliser, pest control', color: 'border-gray-400', featured: true },
              { tierColor: 'text-yellow-500', tier: 'Gold', price: '$500/mo', desc: 'Full program sponsorship — inputs, insurance, and working capital', color: 'border-yellow-500' },
            ].map((item) => (
              <div key={item.tier} className={`bg-white rounded-2xl p-6 border-t-4 ${item.color} relative shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300`}>
                {item.featured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-white text-xs font-bold px-3 py-1 rounded-full" style={{ background: '#5DB347' }}>Most Popular</span>
                )}
                <div className="w-12 h-12 rounded-xl bg-[#5DB347]/10 flex items-center justify-center mb-3">
                  <Medal className={`w-6 h-6 ${item.tierColor}`} />
                </div>
                <div className="font-bold text-navy text-lg">{item.tier}</div>
                <div className="text-2xl font-bold my-1" style={{ color: '#5DB347' }}>{item.price}</div>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Farmer profile preview row */}
          <div className="mb-10">
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 max-w-5xl mx-auto">
              {[
                { name: 'Grace M.', country: 'Zimbabwe', flag: '🇿🇼', crop: 'Maize', img: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=300&h=300&q=80&auto=format&fit=crop' },
                { name: 'Joseph O.', country: 'Tanzania', flag: '🇹🇿', crop: 'Coffee', img: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=300&h=300&q=80&auto=format&fit=crop' },
                { name: 'Amina H.', country: 'Kenya', flag: '🇰🇪', crop: 'Teff', img: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=300&h=300&q=80&auto=format&fit=crop' },
                { name: 'Sipho D.', country: 'Botswana', flag: '🇧🇼', crop: 'Beef Cattle', img: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=300&h=300&q=80&auto=format&fit=crop' },
                { name: 'Fatima D.', country: 'Senegal', flag: '🇸🇳', crop: 'Groundnuts', img: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=300&h=300&q=80&auto=format&fit=crop' },
                { name: 'Peter K.', country: 'Ethiopia', flag: '🇪🇹', crop: 'Sorghum', img: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=300&h=300&q=80&auto=format&fit=crop' },
              ].map((f) => (
                <div key={f.name} className="text-center group">
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-3 rounded-full overflow-hidden border-4 border-white shadow-lg ring-2 ring-[#5DB347]/20 group-hover:ring-[#5DB347] transition-all">
                    <Image src={f.img} alt={f.name} fill sizes="96px" className="object-cover" />
                  </div>
                  <div className="font-semibold text-navy text-sm">{f.name}</div>
                  <div className="text-xs text-gray-500">{f.flag} {f.country}</div>
                  <div className="text-xs text-[#5DB347] font-medium mt-1">{f.crop}</div>
                </div>
              ))}
            </div>
            <p className="text-center text-sm text-gray-500 mt-6">
              Real farmers from 11 countries — your sponsorship goes directly to them
            </p>
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

      {/* ─── OUR PROMISE ─── */}
      <section className="py-16 bg-white relative">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#5DB347]/20 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInWhenVisible>
            <div className="text-center mb-14">
              <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#5DB347' }}>{c('promise_eyebrow', 'What Makes Us Different')}</span>
              <h2 className="text-3xl md:text-4xl font-bold text-navy mt-2 mb-4 text-gradient-green">
                {c('promise_title', 'Our Promise')}
              </h2>
              <p className="text-gray-500 max-w-2xl mx-auto">
                {c('promise_subtitle', "We're not a bank in a boardroom. We're farmers who built a platform to solve the problems we lived through ourselves.")}
              </p>
            </div>
          </FadeInWhenVisible>

          <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                icon: Sprout,
                title: 'By Farmers, For Farmers',
                desc: 'Our founding team has decades of commercial farming experience across Africa. We\'ve walked the fields, faced the droughts, and negotiated the markets. This platform was built from that experience.',
              },
              {
                icon: ShieldCheck,
                title: 'We Supply the Finance AND the Offtake',
                desc: 'Capital in, guaranteed revenue out. We don\'t just lend you money and walk away — we arrange the buyers before you even plant. That\'s how we de-risk your season.',
              },
              {
                icon: Users,
                title: '10% of Profits to Community',
                desc: 'Women in agriculture, feed a child, young farmers programs. Ten percent of everything AFU earns goes straight back into the communities that grow the food.',
              },
              {
                icon: Tractor,
                title: 'Farm Managers on the Ground',
                desc: 'We don\'t just lend — we send experts to help you succeed. Real agronomists, real farm managers, real people standing beside you in the field.',
              },
              {
                icon: Scale,
                title: 'We Finance the Trade',
                desc: 'SBLCs and Letters of Credit that unlock export markets. We provide the trade finance instruments that turn harvests into international revenue.',
              },
            ].map((item, i) => {
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

      {/* ─── WE DON'T JUST FINANCE — WE SHOW UP ─── */}
      <section className="py-16 bg-gradient-to-b from-[#f8fdf6] to-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #5DB347 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <FadeInWhenVisible>
            <div className="text-center mb-14">
              <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#5DB347' }}>{c('showup_eyebrow', 'Our People On Your Farm')}</span>
              <h2 className="text-3xl md:text-4xl font-bold text-navy mt-2 mb-4 text-gradient-green">
                {c('showup_title', "We Don't Just Finance — We Show Up")}
              </h2>
              <p className="text-gray-500 max-w-2xl mx-auto">
                {c('showup_subtitle', 'Our network of commercial farmers, agronomists, and specialists come to your farm to help you succeed. These are real people with real experience — not just software.')}
              </p>
            </div>
          </FadeInWhenVisible>

          <StaggerChildren className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              { icon: Tractor, title: 'Commercial Farm Managers', desc: 'Experienced operators who\'ve run large-scale farms across Southern and East Africa.' },
              { icon: Sprout, title: 'Agronomists', desc: 'Crop scientists who help you choose the right varieties, soil treatments, and planting schedules.' },
              { icon: Droplets, title: 'Irrigation Specialists', desc: 'Water management experts who design and install systems that save every drop.' },
              { icon: BarChart3, title: 'Livestock Experts', desc: 'Veterinary and livestock management professionals for mixed farming operations.' },
              { icon: Globe2, title: 'Export Advisors', desc: 'Trade compliance and market access specialists who get your crops into international markets.' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <motion.div key={item.title} variants={fadeUpChild}>
                  <div className="bg-white rounded-3xl p-6 h-full border border-gray-100 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg" style={{ background: 'linear-gradient(135deg, #5DB347, #449933)' }}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-sm font-bold text-navy mb-2">{item.title}</h3>
                    <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </StaggerChildren>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      {showSection('cta') && <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=1920&q=80&auto=format&fit=crop"
            alt="Green crop field"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-dark/95 via-navy/90 to-[#1e3a3a]/85" />
          {/* Subtle radial glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(93,179,71,0.08)_0%,transparent_70%)]" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeInWhenVisible>
            <Droplets className="w-14 h-14 text-[#5DB347]/40 mx-auto mb-6" />
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight text-glow">
              {c('final_cta_title', 'Ready to Grow With Us?')}
            </h2>
            <p className="text-white/80 text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
              {c('final_cta_body', "Whether you farm two hectares or two thousand, we're here to help. Tell us your story, share your vision, and let's build something extraordinary together.")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={c('final_cta_primary_link', '/apply')}
                className="group px-10 py-5 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2 text-white shadow-lg shadow-[#5DB347]/30 hover:shadow-xl hover:shadow-[#5DB347]/40 hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #5DB347, #449933)' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'linear-gradient(135deg, #6ABF4B, #5DB347)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'linear-gradient(135deg, #5DB347, #449933)')}
              >
                {c('final_cta_primary_text', 'Join Our Farming Family')}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href={c('final_cta_secondary_link', '/contact')}
                className="border-2 border-white/50 hover:border-white hover:bg-white/10 text-white px-10 py-5 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center justify-center"
              >
                {c('final_cta_secondary_text', "We're Here to Help")}
              </Link>
            </div>
          </FadeInWhenVisible>
        </div>
      </section>}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <LegalDisclaimer type="general" variant="footnote" />
      </div>
    </>
  );
}
