'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, CreditCard, Sprout, Building2, Heart, Users, Baby, Utensils } from 'lucide-react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';

/* ─── Types ─── */

interface FarmerProfile {
  id: string;
  slug: string;
  display_name: string;
  story: string | null;
  farm_description: string | null;
  photo_urls: string[] | null;
  hero_photo_url: string | null;
  country: string;
  region: string | null;
  crops: string[] | null;
  farm_size_ha: number | null;
  family_members_supported: number | null;
  years_farming: number | null;
  is_featured: boolean;
  monthly_funding_needed: number | null;
  monthly_funding_received: number | null;
  total_sponsors: number | null;
  latest_update: {
    id: string;
    title: string;
    content: string;
    created_at: string;
  } | null;
}

/* ─── Fallback farmer data REMOVED — all fake profiles deleted.
     Page now shows empty state when farmer_public_profiles is empty. ─── */
const FALLBACK_FARMERS: FarmerProfile[] = [];

// Dead fake farmer data removed — page now queries farmer_public_profiles from Supabase
const _REMOVED_UNUSED_DATA: FarmerProfile[] = [
  {
    id: 'dummy-1',
    slug: 'grace-moyo',
    display_name: 'Grace Moyo',
    story:
      'I have been farming maize and groundnuts in Mashonaland West for 14 years. After losing half my crop to drought in 2022, I joined AFU to access inputs on credit and proper crop insurance. This season I harvested 18 tonnes — my best ever.',
    farm_description:
      'A 4.5-hectare dryland farm on the banks of the Manyame River, planted with hybrid maize, groundnuts and a market garden of tomatoes and leafy greens.',
    photo_urls: [
      'https://images.unsplash.com/photo-1546484958-7ee64d4dd76e?w=800&h=500&fit=crop',
      'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=500&fit=crop',
    ],
    hero_photo_url: 'https://images.unsplash.com/photo-1601648764658-cf37e8c89b70?w=1200&h=600&fit=crop',
    country: 'Zimbabwe',
    region: 'Mashonaland West',
    crops: ['Maize', 'Groundnuts', 'Vegetables'],
    farm_size_ha: 4.5,
    family_members_supported: 6,
    years_farming: 14,
    is_featured: true,
    monthly_funding_needed: 100,
    monthly_funding_received: 65,
    total_sponsors: 3,
    latest_update: {
      id: 'u1',
      title: 'Planting season underway',
      content: 'With the first rains in November I planted 3 hectares of hybrid maize. Germination is excellent — 94% stand. Thank you to my sponsors!',
      created_at: '2025-11-20T09:00:00Z',
    },
  },
  {
    id: 'dummy-2',
    slug: 'joseph-odhiambo',
    display_name: 'Joseph Odhiambo',
    story:
      'I grow tea and avocados in the highlands of Kisii. My father started this farm in 1978 and I have been running it since 2010. AFU helped me access a certified avocado offtake contract with an exporter in Mombasa — my income tripled in one year.',
    farm_description:
      'A 7-hectare highland farm at 1,900m elevation. Tea rows inter-planted with Hass avocado trees. Water from a nearby stream powers a small drip irrigation system.',
    photo_urls: [
      'https://images.unsplash.com/photo-1591282916091-9e35a7b6e9e6?w=800&h=500&fit=crop',
      'https://images.unsplash.com/photo-1447933601403-56dc2df1ed5a?w=800&h=500&fit=crop',
    ],
    hero_photo_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1200&h=600&fit=crop',
    country: 'Kenya',
    region: 'Kisii County',
    crops: ['Tea', 'Avocado'],
    farm_size_ha: 7,
    family_members_supported: 9,
    years_farming: 15,
    is_featured: true,
    monthly_funding_needed: 500,
    monthly_funding_received: 500,
    total_sponsors: 1,
    latest_update: {
      id: 'u2',
      title: 'Avocado export shipment dispatched',
      content: '4.2 tonnes of Grade A Hass avocados loaded at Mombasa port for the Netherlands. First international export through AFU Offtake Program!',
      created_at: '2025-12-03T14:30:00Z',
    },
  },
  {
    id: 'dummy-3',
    slug: 'amina-hussein',
    display_name: 'Amina Hussein',
    story:
      "I am a second-generation rice farmer in the Kilombero Valley, one of Tanzania's most productive rice basins. Through AFU I accessed improved seed varieties and a mobile soil testing kit. My yield went from 2.8 to 5.1 tonnes per hectare.",
    farm_description:
      'A 3-hectare paddy in the Kilombero floodplain. I use a combination of rain-fed and supplemental irrigation. Paddy is milled locally and sold to the regional food bank.',
    photo_urls: [
      'https://images.unsplash.com/photo-1622383563227-04401ab4e5ea?w=800&h=500&fit=crop',
    ],
    hero_photo_url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=1200&h=600&fit=crop',
    country: 'Tanzania',
    region: 'Morogoro',
    crops: ['Rice'],
    farm_size_ha: 3,
    family_members_supported: 5,
    years_farming: 8,
    is_featured: false,
    monthly_funding_needed: 100,
    monthly_funding_received: 20,
    total_sponsors: 1,
    latest_update: null,
  },
  {
    id: 'dummy-4',
    slug: 'sipho-dlamini',
    display_name: 'Sipho Dlamini',
    story:
      "I run a diversified livestock operation in the Central District of Botswana. I breed Brahman cattle and Boer goats for the local and export market. AFU's livestock health program helped me eliminate foot-and-mouth disease from my herd.",
    farm_description:
      'A 120-hectare cattle post with borehole water supply and 6 paddocks under rotational grazing. Herd size: 84 cattle and 230 goats.',
    photo_urls: [
      'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=800&h=500&fit=crop',
      'https://images.unsplash.com/photo-1524024973431-2ad916746264?w=800&h=500&fit=crop',
    ],
    hero_photo_url: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=1200&h=600&fit=crop',
    country: 'Botswana',
    region: 'Central District',
    crops: ['Livestock'],
    farm_size_ha: 120,
    family_members_supported: 12,
    years_farming: 22,
    is_featured: false,
    monthly_funding_needed: 500,
    monthly_funding_received: 150,
    total_sponsors: 2,
    latest_update: {
      id: 'u4',
      title: 'Herd health check complete',
      content: 'Veterinary team completed annual vaccination and ear-tagging. All 84 cattle cleared for export certification. Planning first sale to the Botswana Meat Commission in March.',
      created_at: '2025-12-15T08:00:00Z',
    },
  },
  {
    id: 'dummy-5',
    slug: 'fatima-banda',
    display_name: 'Fatima Banda',
    story:
      'Growing up, my family survived on one meal a day during the dry season. I started farming soybean on 1 hectare in 2019 with borrowed capital. Today I farm 6 hectares and run a small grain storage co-op with 11 other women in Chipata.',
    farm_description:
      'A 6-hectare rain-fed farm focused on soybean rotation with maize. I also run an informal grain bank for 12 local women smallholders, buying and storing at harvest and selling at higher dry-season prices.',
    photo_urls: [
      'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&h=500&fit=crop',
    ],
    hero_photo_url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&h=600&fit=crop',
    country: 'Zambia',
    region: 'Eastern Province',
    crops: ['Soybean', 'Maize'],
    farm_size_ha: 6,
    family_members_supported: 8,
    years_farming: 6,
    is_featured: false,
    monthly_funding_needed: 100,
    monthly_funding_received: 40,
    total_sponsors: 2,
    latest_update: null,
  },
  {
    id: 'dummy-6',
    slug: 'emeka-nwosu',
    display_name: 'Emeka Nwosu',
    story:
      'I left Lagos to return to my family land in Enugu State and grow cassava commercially. Nigeria imports too much starch — I want to be part of the solution. My AFU loan funded a cassava chipper and dryer that process 4 tonnes a day.',
    farm_description:
      'A 10-hectare cassava plantation using TMS improved varieties. A small processing shed produces dry chips and flour for biscuit manufacturers in Enugu and Onitsha.',
    photo_urls: [
      'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800&h=500&fit=crop',
      'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=800&h=500&fit=crop',
    ],
    hero_photo_url: 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=1200&h=600&fit=crop',
    country: 'Nigeria',
    region: 'Enugu State',
    crops: ['Cassava'],
    farm_size_ha: 10,
    family_members_supported: 7,
    years_farming: 5,
    is_featured: false,
    monthly_funding_needed: 500,
    monthly_funding_received: 0,
    total_sponsors: 0,
    latest_update: null,
  },
];

/* ─── Country codes (no emoji flags) ─── */
const COUNTRY_FLAGS: Record<string, string> = {
  Uganda: 'UG', Zimbabwe: 'ZW', Tanzania: 'TZ', Kenya: 'KE',
  Ghana: 'GH', Nigeria: 'NG', Ethiopia: 'ET', Zambia: 'ZM',
  Botswana: 'BW', Mozambique: 'MZ', Malawi: 'MW', Rwanda: 'RW',
};

/* ─── Crop initials (no emojis) ─── */
function getCropEmoji(_crop: string): string {
  return '';
}

/* ─── Farmer Card ─── */
function FarmerCard({ farmer }: { farmer: FarmerProfile }) {
  const funded = farmer.monthly_funding_needed
    ? Math.min(
        100,
        Math.round(
          ((farmer.monthly_funding_received ?? 0) / farmer.monthly_funding_needed) * 100
        )
      )
    : 0;

  const flag = COUNTRY_FLAGS[farmer.country] ?? '';
  const initials = farmer.display_name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden flex flex-col group shadow-lg shadow-[#5DB347]/5 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
      {/* Hero Photo */}
      <div className="relative h-48 overflow-hidden">
        {farmer.hero_photo_url ? (
          <img
            src={farmer.hero_photo_url}
            alt={farmer.display_name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #1B2A4A 0%, #8CB89C 100%)' }}
          >
            <span className="text-white text-4xl font-bold opacity-60">{initials}</span>
          </div>
        )}
        {farmer.is_featured && (
          <div className="absolute top-3 left-3">
            <span
              className="text-white text-xs font-bold px-2.5 py-1 rounded-full shadow"
              style={{ background: '#C9A84C' }}
            >
              Featured
            </span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-5 flex flex-col flex-1 gap-3">
        {/* Name + location */}
        <div>
          <h3 className="font-bold text-navy text-lg leading-tight">{farmer.display_name}</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            {flag} {farmer.country}
            {farmer.region ? ` · ${farmer.region}` : ''}
          </p>
        </div>

        {/* Story excerpt */}
        {farmer.story && (
          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{farmer.story}</p>
        )}

        {/* Crop chips */}
        {farmer.crops && farmer.crops.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {farmer.crops.slice(0, 4).map((crop) => (
              <span
                key={crop}
                className="inline-flex items-center gap-1 bg-[#EBF7E5] text-[#5DB347] text-xs font-medium px-2.5 py-1 rounded-full"
              >
                {getCropEmoji(crop)} {crop}
              </span>
            ))}
          </div>
        )}

        {/* Funding progress */}
        <div className="mt-auto pt-2">
          {farmer.monthly_funding_needed ? (
            <>
              <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                <span className="font-semibold text-navy">{funded}% funded</span>
                <span>
                  ${farmer.monthly_funding_received ?? 0} of ${farmer.monthly_funding_needed}/month
                </span>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 relative overflow-hidden"
                  style={{
                    width: `${funded}%`,
                    background:
                      funded >= 100
                        ? '#5DB347'
                        : 'linear-gradient(90deg, #5DB347, #6ABF4B)',
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-pulse" />
                </div>
              </div>
            </>
          ) : (
            <div className="h-2" />
          )}

          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-gray-400">
              {farmer.total_sponsors ?? 0} sponsor
              {(farmer.total_sponsors ?? 0) !== 1 ? 's' : ''}
            </span>
            <Link
              href={`/farmers/${farmer.slug}`}
              className="inline-flex items-center gap-1.5 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105 shadow-md shadow-[#5DB347]/20"
              style={{ background: 'linear-gradient(135deg, #5DB347, #449933)' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'linear-gradient(135deg, #449933, #3A8829)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'linear-gradient(135deg, #5DB347, #449933)')}
            >
              Sponsor {farmer.display_name.split(' ')[0]} →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Tier Card ─── */
interface TierCardProps {
  emoji: string;
  name: string;
  monthlyPrice: number | null;
  label: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  isCorporate?: boolean;
  annualSaving?: number;
  showAnnual: boolean;
}

function TierCard({
  emoji,
  name,
  monthlyPrice,
  label,
  description,
  features,
  isPopular,
  isCorporate,
  annualSaving,
  showAnnual,
}: TierCardProps) {
  const displayPrice = isCorporate
    ? null
    : showAnnual && monthlyPrice
    ? monthlyPrice * 10
    : monthlyPrice;

  return (
    <div
      className={`relative flex flex-col rounded-3xl p-6 transition-all duration-300 ${
        isPopular
          ? 'bg-white/80 backdrop-blur-sm shadow-xl shadow-[#5DB347]/10 scale-[1.03] border-2'
          : isCorporate
          ? 'bg-[#1B2A4A] text-white shadow-lg shadow-[#1B2A4A]/20 border-0'
          : 'bg-white shadow-lg shadow-[#5DB347]/5 hover:-translate-y-1 hover:shadow-xl border-0'
      }`}
      style={isPopular ? { borderColor: '#5DB347' } : undefined}
    >
      {isPopular && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span
            className="animate-pulse text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg whitespace-nowrap"
            style={{ background: 'linear-gradient(135deg, #5DB347, #449933)' }}
          >
            Most Popular
          </span>
        </div>
      )}

      <div className="text-3xl mb-2">{emoji || name.charAt(0)}</div>
      <h3 className={`font-bold text-xl mb-1 ${isCorporate ? 'text-white' : 'text-navy'}`}>
        {name}
      </h3>
      <div className="mb-3">
        {isCorporate ? (
          <span className="text-2xl font-bold" style={{ color: '#C9A84C' }}>
            Custom
          </span>
        ) : (
          <>
            <span
              className="text-3xl font-bold"
              style={{ color: isPopular ? '#5DB347' : '#1B2A4A' }}
            >
              ${displayPrice}
            </span>
            <span className={`text-sm ml-1 ${isCorporate ? 'text-white/60' : 'text-gray-400'}`}>
              /{showAnnual ? 'year' : 'month'}
            </span>
            {showAnnual && annualSaving && (
              <div className="mt-1">
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: '#EBF7E5', color: '#5DB347' }}
                >
                  Save ${annualSaving}
                </span>
              </div>
            )}
          </>
        )}
      </div>

      <p className={`text-sm leading-relaxed mb-4 ${isCorporate ? 'text-white/70' : 'text-gray-500'}`}>
        {description}
      </p>

      <ul className="space-y-2 flex-1 mb-6">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm">
            <svg className="w-4 h-4 mt-0.5 shrink-0 text-[#5DB347]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            <span className={isCorporate ? 'text-white/80' : 'text-gray-600'}>{feature}</span>
          </li>
        ))}
      </ul>

      <a
        href="#farmers"
        className="block text-center font-semibold py-3 rounded-xl transition-all duration-300 text-white hover:scale-105 shadow-md"
        style={{
          background: isCorporate ? '#C9A84C' : isPopular ? '#5DB347' : '#1B2A4A',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = isCorporate
            ? '#B88E2E'
            : isPopular
            ? '#449933'
            : '#0F1A30';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = isCorporate
            ? '#C9A84C'
            : isPopular
            ? '#5DB347'
            : '#1B2A4A';
        }}
      >
        {isCorporate ? 'Contact Us' : `Choose ${label}`}
      </a>
    </div>
  );
}

/* ─── Stat bubble ─── */
function ImpactStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center px-6 py-4">
      <div className="text-3xl md:text-4xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-white/70 leading-snug">{label}</div>
    </div>
  );
}

/* ─── Sponsor tier fallback data ─── */
interface SponsorTier {
  emoji: string;
  name: string;
  label: string;
  monthlyPrice: number | null;
  description: string;
  features: string[];
  isPopular?: boolean;
  isCorporate?: boolean;
  annualSaving?: number;
}

const FALLBACK_TIERS: SponsorTier[] = [
  {
    emoji: "",
    name: "Bronze",
    label: "Bronze",
    monthlyPrice: 5,
    description: "Cover their AFU membership. Give them access to training, market prices, and the AFU network.",
    features: ["AFU Membership", "Training Access", "Market Data"],
    annualSaving: 10,
  },
  {
    emoji: "",
    name: "Silver",
    label: "Silver",
    monthlyPrice: 100,
    description: "Fund a full season of crop inputs \u2014 seeds, fertiliser, pest management.",
    features: ["Everything in Bronze", "Crop Inputs", "Crop Insurance", "Monthly Update"],
    isPopular: true,
    annualSaving: 200,
  },
  {
    emoji: "",
    name: "Gold",
    label: "Gold",
    monthlyPrice: 500,
    description: "Full programme sponsorship. Inputs + insurance + working capital for the season.",
    features: ["Everything in Silver", "Working Capital", "Offtake Support", "Quarterly Report", "Named Recognition"],
    annualSaving: 1000,
  },
  {
    emoji: "",
    name: "Corporate",
    label: "Corporate",
    monthlyPrice: null,
    description: "Sponsor a cohort of 10\u201350 farmers. Get a CSR impact report and brand recognition.",
    features: ["Cohort Selection", "Branded Impact Report", "Logo on AFU Website", "Naming Rights"],
    isCorporate: true,
  },
];

/* ─── Main Page ─── */
export default function SponsorPage() {
  const [showAnnual, setShowAnnual] = useState(false);
  const [sponsorTiers, setSponsorTiers] = useState<SponsorTier[]>(FALLBACK_TIERS);
  const [chrome, setChrome] = useState<Record<string, unknown> | null>(null);

  const tiersRef = useRef<HTMLDivElement>(null);
  const impactRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchChrome() {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from('site_config')
          .select('value')
          .eq('key', 'page_chrome_sponsor')
          .maybeSingle();
        if (data?.value) {
          const parsed = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
          if (parsed && typeof parsed === 'object') setChrome(parsed);
        }
      } catch { /* keep fallback */ }
    }
    fetchChrome();
  }, []);

  const heroBadge = (chrome?.hero_badge as string) ?? 'Supporting African smallholder farmers';
  const heroTitle = (chrome?.hero_title as string) ?? null;
  const heroSubtitle = (chrome?.hero_subtitle as string) ?? "Your sponsorship is pooled and distributed across farmers who need it most — funding inputs, insurance, and market access where the impact is greatest.";
  const heroCta1Text = (chrome?.hero_cta1_text as string) ?? 'Start Sponsoring →';
  const heroCta2Text = (chrome?.hero_cta2_text as string) ?? 'See How It Works';
  const howItWorksTitle = (chrome?.how_it_works_title as string) ?? 'How It Works';
  const tiersTitleText = (chrome?.tiers_title as string) ?? 'Sponsorship Tiers';
  const impactTitle = (chrome?.impact_title as string) ?? 'Your Impact in Numbers';
  const impactStats = (chrome?.impact_stats as { value: string; label: string }[]) ?? [
    { value: '847', label: 'Farmers supported this season' },
    { value: '$47', label: 'Average monthly contribution' },
    { value: '94%', label: 'Sponsored farmers complete their season' },
    { value: '3.2×', label: 'Average income increase after first programme' },
  ];
  const finalCtaTitle = (chrome?.final_cta_title as string) ?? 'Watson & Fine and others are already making an impact';
  const finalCtaBody = (chrome?.final_cta_body as string) ?? 'Corporate sponsors partner with AFU to fund entire cohorts of farmers — 10 to 50 at a time. Get a branded CSR impact report, your logo on the AFU platform, and the knowledge that your company is transforming African agriculture at scale.';


  useEffect(() => {
    async function fetchSponsorTiers() {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from('sponsor_tiers')
          .select('*')
          .eq('is_published', true)
          .order('display_order', { ascending: true });
        if (data && data.length > 0) {
          setSponsorTiers(
            data.map((t: Record<string, unknown>) => ({
              emoji: (t.icon as string) || "",
              name: (t.name as string) || '',
              label: (t.name as string) || '',
              monthlyPrice: t.price_usd != null ? Number(t.price_usd) : null,
              description: (t.description as string) || '',
              features: (t.features as string[]) || [],
              isPopular: (t.is_popular as boolean) || false,
              isCorporate: ((t.name as string) || '').toLowerCase() === 'corporate' || t.price_usd == null,
              annualSaving: t.price_usd != null ? Math.round(Number(t.price_usd) * 2) : undefined,
            }))
          );
        }
      } catch {
        // keep fallback
      }
    }
    fetchSponsorTiers();
  }, []);

  function scrollTo(ref: React.RefObject<HTMLDivElement | null>) {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <div>
      {/* ── Hero ── */}
      <section className="gradient-navy text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <span>{heroBadge}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold leading-tight mb-6">
              {heroTitle ?? (
                <>Support{' '}
                <span
                  className="text-transparent bg-clip-text"
                  style={{ backgroundImage: 'linear-gradient(135deg, #6ABF4B, #5DB347, #449933)' }}
                >
                  African Farmers
                </span></>
              )}
            </h1>
            <p className="text-lg md:text-xl text-white/80 leading-relaxed mb-10">
              {heroSubtitle}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <button
                onClick={() => scrollTo(tiersRef)}
                className="w-full sm:w-auto text-white font-bold px-8 py-4 rounded-xl text-lg transition-all duration-300 shadow-lg shadow-[#5DB347]/30 hover:scale-105 hover:shadow-xl"
                style={{ background: 'linear-gradient(135deg, #5DB347, #449933)' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'linear-gradient(135deg, #449933, #3A8829)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'linear-gradient(135deg, #5DB347, #449933)')}
              >
                {heroCta1Text}
              </button>
              <button
                onClick={() => scrollTo(tiersRef)}
                className="w-full sm:w-auto bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-colors"
              >
                {heroCta2Text}
              </button>
            </div>

            {/* Impact stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-white/10 border border-white/10 rounded-2xl overflow-hidden bg-white/5">
              {[
                { value: 'Growing', label: 'Farmers' },
                { value: '20', label: 'Countries' },
                { value: '3', label: 'Sponsorship Tiers' },
                { value: 'Yes', label: 'Monthly Impact Reports' },
              ].map((stat) => (
                <ImpactStat key={stat.label} value={stat.value} label={stat.label} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-[#1B2A4A] to-[#5DB347]">{howItWorksTitle}</h2>
            <p className="text-gray-500 text-lg">Three simple steps from sponsor to impact.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                Icon: CreditCard,
                title: 'Choose Your Level',
                desc: 'Pick a sponsorship tier that works for you — from $5/month to $500/month corporate programs. Every contribution is meaningful.',
              },
              {
                step: '02',
                Icon: Sprout,
                title: 'We Distribute the Funds',
                desc: 'Your sponsorship is pooled and allocated to farmers who need it most — covering inputs, insurance, and market access across AFU programs.',
              },
              {
                step: '03',
                Icon: Search,
                title: 'See Your Impact',
                desc: 'Receive monthly impact reports showing where funds went, which farmers benefited, harvest outcomes, and measurable results from your contribution.',
              },
            ].map((item, i) => (
              <div key={i} className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 text-center relative overflow-hidden shadow-lg shadow-[#5DB347]/5 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
                <div
                  className="absolute top-4 right-4 text-7xl font-black opacity-5 select-none"
                  aria-hidden
                >
                  {item.step}
                </div>
                <div className="w-12 h-12 rounded-xl bg-[#5DB347]/10 flex items-center justify-center mb-4 mx-auto"><item.Icon className="w-6 h-6 text-[#5DB347]" /></div>
                <h3 className="text-xl font-bold text-navy mb-3">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Sponsorship Tiers ── */}
      <section ref={tiersRef} id="tiers" style={{ background: '#F5F0E8' }} className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-[#1B2A4A] to-[#5DB347]">{tiersTitleText}</h2>
            <p className="text-gray-600 text-lg mb-6">
              Choose the level of support that works for you.
            </p>

            {/* Annual toggle */}
            <div className="inline-flex items-center gap-3 bg-white rounded-full px-4 py-2 shadow-sm border border-gray-200">
              <button
                onClick={() => setShowAnnual(false)}
                className={`text-sm font-semibold px-3 py-1.5 rounded-full transition-all ${
                  !showAnnual ? 'bg-navy text-white' : 'text-gray-400 hover:text-navy'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setShowAnnual(true)}
                className={`text-sm font-semibold px-3 py-1.5 rounded-full transition-all ${
                  showAnnual ? 'bg-navy text-white' : 'text-gray-400 hover:text-navy'
                }`}
              >
                Annual
              </button>
              {showAnnual && (
                <span
                  className="text-white text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{ background: '#5DB347' }}
                >
                  Save 2 months
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
            {sponsorTiers.map((tier) => (
              <TierCard
                key={tier.name}
                emoji={tier.emoji}
                name={tier.name}
                label={tier.label}
                monthlyPrice={tier.monthlyPrice}
                description={tier.description}
                features={tier.features}
                isPopular={tier.isPopular}
                isCorporate={tier.isCorporate}
                showAnnual={showAnnual}
                annualSaving={tier.annualSaving}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Donate: Feed Families, Empower Farmers ── */}
      <section id="donate" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6 }}
          >
            <div
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium mb-5"
              style={{ background: '#EBF7E5', color: '#5DB347' }}
            >
              <Heart className="w-4 h-4" />
              <span>Nourish Communities, Grow Futures</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[#1B2A4A] to-[#5DB347]">
              Donate to African Farming Communities
            </h2>
            <p className="text-gray-500 text-lg max-w-3xl mx-auto leading-relaxed">
              Behind every farm is a family. Your donation goes beyond sponsorship — it feeds children,
              empowers women farmers, and strengthens the communities that grow Africa&apos;s food.
              Every contribution makes a measurable difference.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                Icon: Baby,
                title: 'Feed a Child',
                price: 10,
                period: 'month',
                colour: '#5DB347',
                lightBg: '#EBF7E5',
                description:
                  'Provide a child in a farming household with a nutritious daily meal programme. Your donation covers porridge, vegetables, and protein sourced from local AFU farms — keeping children healthy and in school.',
              },
              {
                Icon: Utensils,
                title: 'Feed a Family',
                price: 25,
                period: 'month',
                colour: '#449933',
                lightBg: '#E2F2DC',
                description:
                  'Supply a farming family of five with a monthly food parcel of maize meal, cooking oil, beans, and fresh produce. Families that are food-secure farm better — your support breaks the cycle of hunger and underproduction.',
              },
              {
                Icon: Users,
                title: 'Support a Woman Farmer',
                price: 50,
                period: 'month',
                colour: '#1B2A4A',
                lightBg: '#E8EBF0',
                description:
                  'Fund a woman smallholder with seeds, fertiliser, training, and access to AFU market programmes. Women reinvest 90% of their income back into their families — this is the highest-impact donation you can make.',
              },
              {
                Icon: Sprout,
                title: 'Sponsor a Full Farm',
                price: 100,
                period: 'month',
                colour: '#3A8829',
                lightBg: '#DAF0D2',
                description:
                  'Cover the complete cost of running a smallholder farm for one month — inputs, insurance, market access, and family nutrition. You receive a personalised quarterly impact report showing exactly how your funds were used.',
              },
            ].map((tier, i) => (
              <motion.div
                key={tier.title}
                className="relative bg-white rounded-3xl border border-gray-100 shadow-lg shadow-[#5DB347]/5 p-6 flex flex-col hover:-translate-y-1 hover:shadow-xl transition-all duration-300 overflow-hidden"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                {/* decorative corner arc */}
                <div
                  className="absolute -top-10 -right-10 w-28 h-28 rounded-full opacity-10"
                  style={{ background: tier.colour }}
                />

                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: tier.lightBg }}
                >
                  <tier.Icon className="w-6 h-6" style={{ color: tier.colour }} />
                </div>

                <h3 className="text-xl font-bold text-[#1B2A4A] mb-1">{tier.title}</h3>

                <div className="mb-3">
                  <span className="text-3xl font-bold" style={{ color: tier.colour }}>
                    ${tier.price}
                  </span>
                  <span className="text-sm text-gray-400 ml-1">/{tier.period}</span>
                </div>

                <p className="text-sm text-gray-500 leading-relaxed flex-1 mb-6">
                  {tier.description}
                </p>

                <Link
                  href="/contact"
                  className="block text-center text-white font-semibold py-3 rounded-xl transition-all duration-300 hover:scale-105 shadow-md"
                  style={{ background: tier.colour }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                >
                  Donate ${tier.price}/month
                </Link>
              </motion.div>
            ))}
          </div>

          {/* bottom trust line */}
          <motion.div
            className="mt-12 bg-[#FAF8F3] rounded-2xl p-8 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="flex items-center justify-center gap-2 mb-3">
              <Heart className="w-5 h-5 text-[#5DB347]" />
              <span className="font-semibold text-[#1B2A4A]">100% of donations go to the field</span>
            </div>
            <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed text-sm">
              AFU operational costs are covered separately by our corporate partners and grant funders.
              When you donate, every dollar reaches farmers and their families — no overheads deducted,
              no admin fees, full transparency.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── How Your Sponsorship is Distributed ── */}
      <section ref={impactRef} id="impact" className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-[#1B2A4A] to-[#5DB347]">Where Your Funds Go</h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              Your sponsorship is pooled with other contributors and distributed across farmers who need it most. No single farmer is left behind.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { pct: '35%', title: 'Farm Inputs', desc: 'Certified seed, fertiliser, and crop protection products delivered directly to farmers at the start of each season.', color: '#5DB347' },
              { pct: '25%', title: 'Crop Insurance', desc: 'Weather-indexed and multi-peril insurance that protects farmers against drought, flooding, and pest damage.', color: '#449933' },
              { pct: '25%', title: 'Market Access', desc: 'Offtake contracts, transport to markets, warehousing, and quality grading to maximise farmer prices.', color: '#6ABF4B' },
              { pct: '15%', title: 'Training & Support', desc: 'Agronomic training, financial literacy, and ongoing mentorship through AFU programs.', color: '#3A8829' },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                <div className="text-4xl font-black mb-3" style={{ color: item.color }}>{item.pct}</div>
                <h3 className="text-lg font-bold text-[#1B2A4A] mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-[#FAF8F3] rounded-2xl p-8 text-center">
            <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Every sponsor receives a <span className="font-semibold text-[#1B2A4A]">monthly impact report</span> showing exactly which programs their funds supported, how many farmers benefited, and the measurable outcomes achieved. Full transparency — always.
            </p>
          </div>
        </div>
      </section>

      {/* ── Impact Section ── */}
      <section className="gradient-navy py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              {impactTitle}
            </h2>
            <p className="text-white/60 text-lg">Real outcomes from AFU-sponsored farmers.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { value: impactStats[0]?.value ?? '847', label: impactStats[0]?.label ?? 'Farmers waiting for a sponsor', color: '#6ABF4B' },
              { value: impactStats[1]?.value ?? '$47', label: impactStats[1]?.label ?? 'Average monthly contribution', color: '#C9A84C' },
              { value: impactStats[2]?.value ?? '94%', label: impactStats[2]?.label ?? 'Sponsored farmers complete their season', color: '#6ABF4B' },
              { value: impactStats[3]?.value ?? '3.2×', label: impactStats[3]?.label ?? 'Average income increase after first programme', color: '#C9A84C' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white/5 border border-white/10 rounded-3xl p-8 text-center hover:-translate-y-1 hover:bg-white/10 transition-all duration-300"
              >
                <div className="text-4xl md:text-5xl font-black mb-2" style={{ color: stat.color }}>
                  {stat.value}
                </div>
                <p className="text-white/70 text-sm leading-snug">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Meet Some Farmers ── */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-[#1B2A4A] to-[#5DB347]">
              Farmers Your Sponsorship Supports
            </h2>
            <p className="text-gray-500 text-lg">Real farmers across Africa benefiting from pooled sponsorship funds.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: 'Sipho D.', flag: '🇧🇼', country: 'Botswana', crop: 'Cattle', img: 'https://images.unsplash.com/photo-1509099381441-ea3c0cf98b94?w=300&h=300&q=80&fit=crop&crop=face' },
              { name: 'Joseph O.', flag: '🇹🇿', country: 'Tanzania', crop: 'Coffee', img: 'https://images.unsplash.com/photo-1710149484964-d966b771c204?w=300&h=300&q=80&fit=crop&crop=face' },
              { name: 'Grace M.', flag: '🇿🇼', country: 'Zimbabwe', crop: 'Maize', img: 'https://images.unsplash.com/photo-1509100194014-d49809396daa?w=300&h=300&q=80&fit=crop&crop=face' },
              { name: 'Watson G.', flag: '🇿🇼', country: 'Zimbabwe', crop: 'Blueberries', img: 'https://images.unsplash.com/photo-1746014929708-fcb859fd3185?w=300&h=300&q=80&fit=crop&crop=face' },
              { name: 'Watson S.', flag: '🇿🇼', country: 'Zimbabwe', crop: 'Cassava', img: 'https://images.unsplash.com/photo-1567057409620-3bdca3620a6b?w=300&h=300&q=80&fit=crop&crop=face' },
              { name: 'Tatenda M.', flag: '🇿🇼', country: 'Zimbabwe', crop: 'Cattle', img: 'https://images.unsplash.com/photo-1509099342178-e323b1717dba?w=300&h=300&q=80&fit=crop&crop=face' },
            ].map((farmer) => (
              <div key={farmer.name} className="text-center group">
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-2xl overflow-hidden mb-3 shadow-md group-hover:shadow-lg transition-shadow">
                  <img
                    src={farmer.img}
                    alt={farmer.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <h3 className="font-bold text-[#1B2A4A] text-sm">{farmer.name}</h3>
                <p className="text-xs text-gray-500">{farmer.flag} {farmer.country}</p>
                <p className="text-xs font-medium" style={{ color: '#5DB347' }}>{farmer.crop}</p>
              </div>
            ))}
          </div>

          <p className="text-center text-gray-400 text-sm mt-8">
            Your contribution is distributed across all farmers in AFU programs — everyone benefits.
          </p>
        </div>
      </section>

      {/* ── Corporate CTA ── */}
      <section className="bg-[#FAF8F3] py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-12 h-12 rounded-xl bg-[#5DB347]/10 flex items-center justify-center mb-4 mx-auto"><Building2 className="w-6 h-6 text-[#5DB347]" /></div>
          <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
            {finalCtaTitle}
          </h2>
          <p className="text-gray-500 text-lg leading-relaxed mb-3">
            {finalCtaBody}
          </p>
          <p className="text-gray-500 mb-8">
            Recognised across Africa. Reported quarterly. Fully transparent.
          </p>
          <Link
            href="/contact?subject=sponsorship"
            className="inline-flex items-center gap-2 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all duration-300 shadow-lg shadow-[#1B2A4A]/30 hover:scale-105 hover:shadow-xl"
            style={{ background: 'linear-gradient(135deg, #1B2A4A, #0F1A30)' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'linear-gradient(135deg, #0F1A30, #060D1A)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'linear-gradient(135deg, #1B2A4A, #0F1A30)')}
          >
            Contact Us About Corporate Sponsorship →
          </Link>
        </div>
      </section>
    </div>
  );
}
