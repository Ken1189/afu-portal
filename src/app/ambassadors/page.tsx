'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import {
  Award,
  MapPin,
  Clock,
  Sprout,
  ChevronDown,
  ChevronUp,
  Wheat,
  TreePine,
  Egg,
  Beef,
  Quote,
  ArrowRight,
  UserPlus,
  Share2,
  Users,
  DollarSign,
  Globe,
  TrendingUp,
  Star,
  Crown,
  Gem,
  Shield,
  CheckCircle2,
  Send,
  Loader2,
  Briefcase,
  GraduationCap,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

/* ─── Types ─── */

interface Ambassador {
  id: string;
  full_name: string;
  sector: string;
  country: string;
  country_flag: string;
  farm_name: string | null;
  farm_size_ha: number | null;
  years_experience: number | null;
  photo_url: string | null;
  pull_quote: string | null;
  bio: string | null;
  achievements: string[] | null;
}

interface CommissionRate {
  label: string;
  amount: string;
  description: string;
}

/* ─── Fallback data ─── */

const FALLBACK_AMBASSADORS: Ambassador[] = [
  {
    id: 'amb-1',
    full_name: 'Grace Moyo',
    sector: 'Grains',
    country: 'Zimbabwe',
    country_flag: '\u{1F1FF}\u{1F1FC}',
    farm_name: 'Moyo Family Farm',
    farm_size_ha: 4.5,
    years_experience: 14,
    photo_url: 'https://picsum.photos/seed/amb-grace/300/300',
    pull_quote: 'AFU gave me the tools to triple my maize yield and the market to sell it at a fair price.',
    bio: 'Grace has been farming maize and groundnuts in Mashonaland West for 14 years. After losing half her crop to drought in 2022, she joined AFU to access inputs on credit and crop insurance. Last season she harvested 18 tonnes, her best ever. She now trains 12 neighbouring farmers on conservation agriculture.',
    achievements: ['18t harvest record', 'Conservation agriculture pioneer', 'Trains 12 farmers'],
  },
  {
    id: 'amb-2',
    full_name: 'Joseph Odhiambo',
    sector: 'Cash Crops',
    country: 'Kenya',
    country_flag: '\u{1F1F0}\u{1F1EA}',
    farm_name: 'Odhiambo Highland Farm',
    farm_size_ha: 7,
    years_experience: 15,
    photo_url: 'https://picsum.photos/seed/amb-joseph/300/300',
    pull_quote: 'Through AFU I accessed an export contract. My income tripled in one year.',
    bio: 'Joseph grows tea and avocados in the highlands of Kisii. His father started the farm in 1978 and he has been running it since 2010. AFU helped him access a certified avocado offtake contract with an exporter in Mombasa. The farm is certified GlobalG.A.P. through the AFU group certification scheme.',
    achievements: ['GlobalG.A.P. certified', 'Export to EU markets', 'Trains 18 farmers'],
  },
  {
    id: 'amb-3',
    full_name: 'Amina Hussein',
    sector: 'Grains',
    country: 'Tanzania',
    country_flag: '\u{1F1F9}\u{1F1FF}',
    farm_name: 'Hussein Rice Paddies',
    farm_size_ha: 3,
    years_experience: 8,
    photo_url: 'https://picsum.photos/seed/amb-amina/300/300',
    pull_quote: 'My yield went from 2.8 to 5.1 tonnes per hectare thanks to improved seed from AFU.',
    bio: 'Amina is a second-generation rice farmer in the Kilombero Valley. Through AFU she accessed improved seed varieties and a mobile soil testing kit. She also leads the AFU women\'s cooperative in Morogoro, which gives members collective bargaining power with millers.',
    achievements: ['82% yield increase', 'Women\'s co-op leader', 'Soil health champion'],
  },
  {
    id: 'amb-4',
    full_name: 'Sipho Dlamini',
    sector: 'Livestock',
    country: 'Botswana',
    country_flag: '\u{1F1E7}\u{1F1FC}',
    farm_name: 'Dlamini Cattle Ranch',
    farm_size_ha: 120,
    years_experience: 22,
    photo_url: 'https://picsum.photos/seed/amb-sipho/300/300',
    pull_quote: 'AFU\'s livestock health program eliminated foot-and-mouth disease from my herd entirely.',
    bio: 'Sipho runs a diversified livestock operation in the Central District of Botswana. He breeds Brahman cattle and Boer goats for the local and export market. He is working towards Botswana Meat Commission Grade A certification, which will open the European export market.',
    achievements: ['200+ head operation', 'Export-ready herd', 'BMC Grade A candidate'],
  },
  {
    id: 'amb-5',
    full_name: 'Fatima Diallo',
    sector: 'Horticulture',
    country: 'Ghana',
    country_flag: '\u{1F1EC}\u{1F1ED}',
    farm_name: 'Diallo Market Garden',
    farm_size_ha: 2,
    years_experience: 6,
    photo_url: 'https://picsum.photos/seed/amb-fatima/300/300',
    pull_quote: 'With drip irrigation from AFU, I grow vegetables year-round and supply Accra\'s best restaurants.',
    bio: 'Fatima started farming with just 0.5 hectares and a hand pump. After joining AFU, she accessed an equipment loan for a drip irrigation system and expanded to 2 hectares. She now grows tomatoes, peppers, and lettuce year-round for the premium restaurant market in Accra.',
    achievements: ['Year-round production', '300% revenue growth', 'Premium market supplier'],
  },
  {
    id: 'amb-6',
    full_name: 'Peter Kamau',
    sector: 'Poultry',
    country: 'Kenya',
    country_flag: '\u{1F1F0}\u{1F1EA}',
    farm_name: 'Kamau Layers Farm',
    farm_size_ha: 1.5,
    years_experience: 10,
    photo_url: 'https://picsum.photos/seed/amb-peter/300/300',
    pull_quote: 'AFU helped me scale from 500 to 10,000 birds with proper financing and training.',
    bio: 'Peter started with 500 layers in a backyard operation. Through AFU financing and training, he built a modern 10,000-bird layer house with automated feeding and egg collection. He produces 8,500 eggs daily for the Nairobi market and employs 6 full-time workers.',
    achievements: ['10,000-bird operation', '8,500 eggs/day', 'Employs 6 workers'],
  },
];

/* ─── Constants ─── */

const SECTOR_TABS = ['All', 'Farming', 'Business', 'Community', 'Education', 'Technology'];

const SECTOR_COLORS: Record<string, string> = {
  farming: 'bg-green-100 text-green-700',
  business: 'bg-blue-100 text-blue-700',
  community: 'bg-purple-100 text-purple-700',
  education: 'bg-amber-100 text-amber-700',
  technology: 'bg-cyan-100 text-cyan-700',
  // Legacy crop-based sectors (fallback data)
  Grains: 'bg-amber-100 text-amber-700',
  'Cash Crops': 'bg-green-100 text-green-700',
  Livestock: 'bg-orange-100 text-orange-700',
  Horticulture: 'bg-emerald-100 text-emerald-700',
  Poultry: 'bg-yellow-100 text-yellow-700',
  grains: 'bg-amber-100 text-amber-700',
  cash_crops: 'bg-green-100 text-green-700',
  livestock: 'bg-orange-100 text-orange-700',
  horticulture: 'bg-emerald-100 text-emerald-700',
  poultry: 'bg-yellow-100 text-yellow-700',
};

const SECTOR_ICONS: Record<string, React.ReactNode> = {
  farming: <Wheat className="w-3.5 h-3.5" />,
  business: <Briefcase className="w-3.5 h-3.5" />,
  community: <Users className="w-3.5 h-3.5" />,
  education: <GraduationCap className="w-3.5 h-3.5" />,
  technology: <Globe className="w-3.5 h-3.5" />,
  Grains: <Wheat className="w-3.5 h-3.5" />,
  'Cash Crops': <Sprout className="w-3.5 h-3.5" />,
  Livestock: <Beef className="w-3.5 h-3.5" />,
  Horticulture: <TreePine className="w-3.5 h-3.5" />,
  Poultry: <Egg className="w-3.5 h-3.5" />,
};

const AFU_COUNTRIES = [
  'Botswana',
  'Ghana',
  'Kenya',
  'Mozambique',
  'Nigeria',
  'Sierra Leone',
  'South Africa',
  'Tanzania',
  'Uganda',
  'Zambia',
  'Zimbabwe',
];

const DEFAULT_COMMISSION_RATES: CommissionRate[] = [
  { label: 'New Farmer Signup', amount: '$25 per referral', description: 'Earn for every farmer who joins through your link' },
  { label: 'Supplier Onboarding', amount: '$100 per supplier', description: 'Bring suppliers onto the platform' },
  { label: 'Loan Facilitation', amount: '2% of loan value', description: 'Commission on facilitated agricultural loans' },
  { label: 'Insurance Sale', amount: '5% of first premium', description: 'Earn on crop and livestock insurance sales' },
  { label: 'Trading Commission', amount: '1% of trade value', description: 'Commission on marketplace transactions' },
];

const TIERS = [
  { name: 'Bronze', icon: Shield, color: '#CD7F32', minReferrals: 0, commission: '5%', perks: ['Base commission rate', 'Ambassador dashboard', 'Referral link'] },
  { name: 'Silver', icon: Star, color: '#C0C0C0', minReferrals: 10, commission: '8%', perks: ['Increased commission', 'Monthly bonus', 'Priority email support'] },
  { name: 'Gold', icon: Award, color: '#FFD700', minReferrals: 25, commission: '12%', perks: ['Premium commission', 'Quarterly bonus', 'Priority support'] },
  { name: 'Platinum', icon: Crown, color: '#E5E4E2', minReferrals: 50, commission: '15%', perks: ['Top commission rate', 'Exclusive events', 'Dedicated manager'] },
  { name: 'Diamond', icon: Gem, color: '#B9F2FF', minReferrals: 100, commission: 'Custom', perks: ['Custom rates', 'Advisory role', 'Revenue sharing'] },
];

const HOW_IT_WORKS_STEPS = [
  { icon: UserPlus, title: 'Sign Up', description: 'Apply to join the ambassador program and get approved within 48 hours' },
  { icon: Share2, title: 'Share Your Link', description: 'Get a unique referral link and share it with farmers, suppliers, and investors' },
  { icon: Users, title: 'Farmers Join', description: 'When people sign up through your link, they are tracked to your account' },
  { icon: DollarSign, title: 'Earn Commissions', description: 'Get paid for every signup, transaction, and milestone your referrals achieve' },
];

/* ─── Component ─── */

export default function AmbassadorsPage() {
  const [ambassadors, setAmbassadors] = useState<Ambassador[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSector, setActiveSector] = useState('All');
  const [expandedBio, setExpandedBio] = useState<string | null>(null);

  // Commission rates from site_config
  const [commissionRates, setCommissionRates] = useState<CommissionRate[]>(DEFAULT_COMMISSION_RATES);

  // Apply form state
  const applyFormRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    country: '',
    whatsapp: '',
    motivation: '',
    promotion_plan: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Auth state for pre-fill
  const [authUser, setAuthUser] = useState<{ id: string; full_name: string; email: string; phone: string | null } | null>(null);

  useEffect(() => {
    async function init() {
      const supabase = createClient();

      // Fetch user session for pre-fill (non-blocking)
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, phone')
            .eq('id', user.id)
            .single();
          setAuthUser({
            id: user.id,
            full_name: profile?.full_name || '',
            email: user.email || '',
            phone: profile?.phone || null,
          });
          setFormData((prev) => ({
            ...prev,
            full_name: profile?.full_name || '',
            email: user.email || '',
            phone: profile?.phone || '',
          }));
        }
      } catch {
        // Not logged in or profile fetch failed — continue without pre-fill
      }

      // Fetch active ambassadors for display
      try {
        const { data, error } = await supabase
          .from('ambassadors')
          .select('*')
          .eq('status', 'active')
          .order('sort_order', { ascending: true });

        if (error || !data || data.length === 0) {
          setAmbassadors(FALLBACK_AMBASSADORS);
        } else {
          setAmbassadors(data);
        }
      } catch {
        setAmbassadors(FALLBACK_AMBASSADORS);
      }

      // Fetch commission rates from site_config
      try {
        const { data: configData } = await supabase
          .from('site_config')
          .select('value')
          .eq('key', 'commission_rates')
          .single();
        if (configData?.value) {
          const parsed = typeof configData.value === 'string' ? JSON.parse(configData.value) : configData.value;
          if (Array.isArray(parsed) && parsed.length > 0) {
            setCommissionRates(parsed);
          }
        }
      } catch {
        // keep defaults
      }

      setLoading(false);
    }
    init();
  }, []);

  const filtered = useMemo(() => {
    if (activeSector === 'All') return ambassadors;
    return ambassadors.filter((a) => (a.sector || '').toLowerCase() === activeSector.toLowerCase());
  }, [ambassadors, activeSector]);

  function scrollToApply() {
    applyFormRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  function handleFormChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setFormError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    // Validation
    if (!formData.full_name.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.country) {
      setFormError('Please fill in all required fields.');
      return;
    }
    if (!formData.motivation.trim()) {
      setFormError('Please tell us why you want to be an ambassador.');
      return;
    }

    setSubmitting(true);
    try {
      const supabase = createClient();

      // Insert into ambassadors with pending status
      const ambassadorInsert: Record<string, unknown> = {
        full_name: formData.full_name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        country: formData.country,
        whatsapp: formData.whatsapp.trim() || null,
        motivation: formData.motivation.trim(),
        promotion_plan: formData.promotion_plan.trim() || null,
        status: 'pending',
      };

      if (authUser?.id) {
        ambassadorInsert.user_id = authUser.id;
      }

      const { error: ambError } = await supabase
        .from('ambassadors')
        .insert(ambassadorInsert);

      // Also insert into membership_applications for admin review
      const { error: appError } = await supabase
        .from('membership_applications')
        .insert({
          full_name: formData.full_name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          country: formData.country,
          requested_tier: 'ambassador',
          notes: `Ambassador application. Motivation: ${formData.motivation.trim()}. Promotion plan: ${formData.promotion_plan.trim() || 'N/A'}. WhatsApp: ${formData.whatsapp.trim() || 'N/A'}`,
          status: 'pending',
          profile_id: authUser?.id || null,
        });

      if (ambError && appError) {
        setFormError('Something went wrong: ' + (ambError?.message || appError?.message || 'Unknown error'));
      } else {
        // Send email notifications (fire and forget)
        fetch('/api/ambassador/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.full_name.trim(),
            email: formData.email.trim(),
            country: formData.country,
            phone: formData.phone.trim(),
            sector: '',
            bio: formData.motivation.trim(),
            region: '',
          }),
        }).catch(() => {});

        setSubmitted(true);
      }
    } catch {
      setFormError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 1: HERO
      ═══════════════════════════════════════════════════════════════════ */}
      <section
        className="relative py-24 px-4 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1B2A4A 0%, #2A3F6A 50%, #1B2A4A 100%)' }}
      >
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-5 bg-white" />
          <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full opacity-5 bg-[#5DB347]" />
        </div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#5DB347]/20 text-[#5DB347] text-sm font-semibold mb-6 border border-[#5DB347]/30">
            <Award className="w-4 h-4" />
            Ambassador Program
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight leading-tight">
            Become an AFU<br />Ambassador
          </h1>

          <p className="text-lg md:text-xl text-white/70 max-w-3xl mx-auto mb-10 leading-relaxed">
            Earn commissions by connecting farmers, suppliers, and investors to
            Africa&apos;s largest agricultural platform
          </p>

          <button
            onClick={scrollToApply}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-white font-bold text-lg transition-all hover:shadow-xl hover:shadow-[#5DB347]/30 hover:-translate-y-0.5 active:translate-y-0"
            style={{ background: 'linear-gradient(135deg, #5DB347, #449933)' }}
          >
            Apply Now
            <ArrowRight className="w-5 h-5" />
          </button>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 mt-14">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-white font-bold text-2xl md:text-3xl">
                <Users className="w-6 h-6 text-[#5DB347]" />
                500+
              </div>
              <p className="text-white/50 text-sm mt-1">Ambassadors</p>
            </div>
            <div className="w-px h-10 bg-white/10 hidden md:block" />
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-white font-bold text-2xl md:text-3xl">
                <Globe className="w-6 h-6 text-[#5DB347]" />
                20
              </div>
              <p className="text-white/50 text-sm mt-1">Countries</p>
            </div>
            <div className="w-px h-10 bg-white/10 hidden md:block" />
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-white font-bold text-2xl md:text-3xl">
                <TrendingUp className="w-6 h-6 text-[#5DB347]" />
                15%
              </div>
              <p className="text-white/50 text-sm mt-1">Earn Up To</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 2: HOW IT WORKS
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#1B2A4A] mb-4">
              How It Works
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Start earning in four simple steps. No experience required.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {HOW_IT_WORKS_STEPS.map((step, idx) => (
              <div key={step.title} className="relative text-center group">
                {/* Connector line */}
                {idx < HOW_IT_WORKS_STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-[60%] w-[80%] h-px bg-[#5DB347]/20" />
                )}
                <div
                  className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-5 transition-transform group-hover:scale-110"
                  style={{ background: 'linear-gradient(135deg, #5DB347, #449933)' }}
                >
                  <step.icon className="w-9 h-9 text-white" />
                </div>
                <div className="text-xs font-bold text-[#5DB347] mb-2">STEP {idx + 1}</div>
                <h3 className="text-lg font-bold text-[#1B2A4A] mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 3: COMMISSION STRUCTURE
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#1B2A4A] mb-4">
              Commission Structure
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Multiple revenue streams to maximize your earnings
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {commissionRates.map((rate) => (
              <div
                key={rate.label}
                className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md hover:border-[#5DB347]/30 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div
                    className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #5DB347/15, #5DB347/5)' }}
                  >
                    <DollarSign className="w-6 h-6 text-[#5DB347]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#1B2A4A] mb-1">{rate.label}</h3>
                    <p className="text-xl font-extrabold text-[#5DB347] mb-1">{rate.amount}</p>
                    <p className="text-xs text-gray-400">{rate.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-gray-400 mt-8">
            Rates are configurable by admin and may vary by region and tier level.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 4: TIER SYSTEM
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#1B2A4A] mb-4">
              Ambassador Tiers
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              The more you grow, the more you earn. Advance through tiers as you bring new members to AFU.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {TIERS.map((tier) => (
              <div
                key={tier.name}
                className="relative bg-white rounded-xl border-2 p-6 text-center transition-all hover:shadow-lg hover:-translate-y-1"
                style={{ borderColor: tier.color + '60' }}
              >
                {/* Tier icon */}
                <div
                  className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-4"
                  style={{ backgroundColor: tier.color + '20' }}
                >
                  <tier.icon className="w-7 h-7" style={{ color: tier.color === '#C0C0C0' ? '#888' : tier.color }} />
                </div>

                <h3 className="text-lg font-extrabold text-[#1B2A4A] mb-1">{tier.name}</h3>
                <p className="text-xs text-gray-400 mb-3">{tier.minReferrals}+ referrals</p>

                <div
                  className="text-2xl font-extrabold mb-4"
                  style={{ color: '#5DB347' }}
                >
                  {tier.commission}
                </div>

                <ul className="space-y-2 text-left">
                  {tier.perks.map((perk) => (
                    <li key={perk} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle2 className="w-4 h-4 text-[#5DB347] flex-shrink-0 mt-0.5" />
                      {perk}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 5: EXISTING AMBASSADOR PROFILES (KEPT AS-IS)
      ═══════════════════════════════════════════════════════════════════ */}

      {/* ── Section header ── */}
      <section
        className="relative py-16 px-4"
        style={{ background: 'linear-gradient(135deg, #1B2A4A 0%, #2A3F6A 100%)' }}
      >
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-white/80 text-sm font-medium mb-6">
            <Award className="w-4 h-4" />
            Our Ambassadors
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 tracking-tight">
            Our Ambassadors
          </h2>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            The people driving Africa&apos;s agricultural revolution
          </p>
        </div>
      </section>

      {/* ── Sector Tabs ── */}
      <section className="max-w-7xl mx-auto px-4 -mt-6 relative z-10">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2 flex flex-wrap gap-1 justify-center">
          {SECTOR_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveSector(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeSector === tab
                  ? 'text-white shadow-sm'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-[#1B2A4A]'
              }`}
              style={activeSector === tab ? { background: '#5DB347' } : {}}
            >
              {tab}
            </button>
          ))}
        </div>
      </section>

      {/* ── Ambassador Grid ── */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin w-8 h-8 border-2 border-[#5DB347] border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Loading ambassadors...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No ambassadors in this sector yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((amb) => (
              <div
                key={amb.id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Photo + Badge */}
                <div className="p-6 text-center">
                  <div className="relative inline-block mb-4">
                    <div className="w-28 h-28 rounded-full overflow-hidden mx-auto border-4 border-[#5DB347]/20">
                      {amb.photo_url ? (
                        <img
                          src={amb.photo_url}
                          alt={amb.full_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#5DB347]/10 flex items-center justify-center">
                          <span className="text-3xl font-bold text-[#5DB347]">
                            {amb.full_name.split(' ').map((n) => n[0]).join('')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-[#1B2A4A]">
                    {amb.full_name} {amb.country_flag}
                  </h3>

                  <div className="flex items-center justify-center gap-2 mt-2">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${SECTOR_COLORS[amb.sector] || 'bg-gray-100 text-gray-700'}`}>
                      {SECTOR_ICONS[amb.sector]}
                      {amb.sector}
                    </span>
                  </div>

                  {/* Farm info */}
                  <div className="flex items-center justify-center gap-4 mt-3 text-xs text-gray-400">
                    {amb.farm_name && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {amb.farm_name}
                      </span>
                    )}
                    {amb.farm_size_ha && (
                      <span>{amb.farm_size_ha} ha</span>
                    )}
                    {amb.years_experience && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {amb.years_experience} yrs
                      </span>
                    )}
                  </div>
                </div>

                {/* Quote */}
                {amb.pull_quote && (
                  <div className="px-6 pb-4">
                    <div className="bg-[#5DB347]/5 rounded-lg p-4">
                      <Quote className="w-4 h-4 text-[#5DB347] mb-1" />
                      <p className="text-sm italic text-gray-600 leading-relaxed">
                        &ldquo;{amb.pull_quote}&rdquo;
                      </p>
                    </div>
                  </div>
                )}

                {/* Achievements */}
                {amb.achievements && amb.achievements.length > 0 && (
                  <div className="px-6 pb-4">
                    <div className="flex flex-wrap gap-1.5">
                      {amb.achievements.map((ach) => (
                        <span
                          key={ach}
                          className="px-2 py-0.5 bg-[#1B2A4A]/5 text-[#1B2A4A] rounded-full text-[10px] font-semibold"
                        >
                          {ach}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bio expand */}
                {amb.bio && (
                  <div className="px-6 pb-6">
                    <button
                      onClick={() => setExpandedBio(expandedBio === amb.id ? null : amb.id)}
                      className="flex items-center gap-1 text-sm font-medium text-[#5DB347] hover:text-[#449933] transition-colors"
                    >
                      {expandedBio === amb.id ? (
                        <>
                          Read Less <ChevronUp className="w-4 h-4" />
                        </>
                      ) : (
                        <>
                          Read More <ChevronDown className="w-4 h-4" />
                        </>
                      )}
                    </button>
                    {expandedBio === amb.id && (
                      <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                        {amb.bio}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 6: APPLY FORM
      ═══════════════════════════════════════════════════════════════════ */}
      <section
        ref={applyFormRef}
        className="py-20 px-4"
        style={{ background: 'linear-gradient(135deg, #1B2A4A 0%, #2A3F6A 100%)' }}
      >
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
              Apply to Become an Ambassador
            </h2>
            <p className="text-white/60 max-w-xl mx-auto">
              Join our network of ambassadors across Africa and start earning commissions today.
            </p>
          </div>

          {submitted ? (
            <div className="bg-white rounded-2xl p-10 text-center shadow-xl">
              <div
                className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6"
                style={{ backgroundColor: '#5DB347' + '20' }}
              >
                <CheckCircle2 className="w-10 h-10 text-[#5DB347]" />
              </div>
              <h3 className="text-2xl font-bold text-[#1B2A4A] mb-3">Application Submitted!</h3>
              <p className="text-gray-500 mb-6">
                Thank you for your interest in becoming an AFU Ambassador.
                We review applications within 48 hours. You&apos;ll receive a confirmation email shortly.
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-sm transition-all hover:shadow-lg"
                style={{ background: 'linear-gradient(135deg, #5DB347, #449933)' }}
              >
                Return Home
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-2xl p-8 md:p-10 shadow-xl space-y-6"
            >
              {/* Row: Name + Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-[#1B2A4A] mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleFormChange}
                    placeholder="e.g. Grace Moyo"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5DB347]/40 focus:border-[#5DB347] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#1B2A4A] mb-1.5">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    placeholder="grace@example.com"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5DB347]/40 focus:border-[#5DB347] transition-all"
                  />
                </div>
              </div>

              {/* Row: Phone + WhatsApp */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-[#1B2A4A] mb-1.5">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleFormChange}
                    placeholder="+263 77 123 4567"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5DB347]/40 focus:border-[#5DB347] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#1B2A4A] mb-1.5">
                    WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleFormChange}
                    placeholder="+263 77 123 4567"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5DB347]/40 focus:border-[#5DB347] transition-all"
                  />
                </div>
              </div>

              {/* Country */}
              <div>
                <label className="block text-sm font-semibold text-[#1B2A4A] mb-1.5">
                  Country <span className="text-red-500">*</span>
                </label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleFormChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#5DB347]/40 focus:border-[#5DB347] transition-all bg-white"
                >
                  <option value="">Select your country</option>
                  {AFU_COUNTRIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Motivation */}
              <div>
                <label className="block text-sm font-semibold text-[#1B2A4A] mb-1.5">
                  Why do you want to be an ambassador? <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="motivation"
                  value={formData.motivation}
                  onChange={handleFormChange}
                  placeholder="Tell us about your experience, your network, and why you're passionate about African agriculture..."
                  required
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5DB347]/40 focus:border-[#5DB347] transition-all resize-none"
                />
              </div>

              {/* Promotion plan */}
              <div>
                <label className="block text-sm font-semibold text-[#1B2A4A] mb-1.5">
                  How will you promote AFU?
                </label>
                <textarea
                  name="promotion_plan"
                  value={formData.promotion_plan}
                  onChange={handleFormChange}
                  placeholder="e.g. Social media, community meetings, farmer cooperatives, church groups, WhatsApp groups..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5DB347]/40 focus:border-[#5DB347] transition-all resize-none"
                />
              </div>

              {/* Error */}
              {formError && (
                <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl border border-red-100">
                  {formError}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-white font-bold text-base transition-all hover:shadow-lg hover:shadow-[#5DB347]/30 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg, #5DB347, #449933)' }}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Submit Application
                  </>
                )}
              </button>

              <p className="text-xs text-gray-400 text-center">
                By applying, you agree to our ambassador terms and conditions.
                {authUser && (
                  <span className="block mt-1 text-[#5DB347]">
                    Signed in as {authUser.email} -- your profile will be linked automatically.
                  </span>
                )}
              </p>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
