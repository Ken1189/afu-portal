'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

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

/* ─── Dummy farmer data (shown until DB is seeded) ─── */
const DUMMY_FARMERS: FarmerProfile[] = [
  {
    id: 'dummy-1',
    slug: 'grace-moyo',
    display_name: 'Grace Moyo',
    story:
      'I have been farming maize and groundnuts in Mashonaland West for 14 years. After losing half my crop to drought in 2022, I joined AFU to access inputs on credit and proper crop insurance. This season I harvested 18 tonnes — my best ever.',
    farm_description:
      'A 4.5-hectare dryland farm on the banks of the Manyame River, planted with hybrid maize, groundnuts and a market garden of tomatoes and leafy greens.',
    photo_urls: [
      'https://picsum.photos/seed/grace2/400/400',
      'https://picsum.photos/seed/grace3/400/400',
    ],
    hero_photo_url: 'https://picsum.photos/seed/grace1/900/400',
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
      'https://picsum.photos/seed/joseph2/400/400',
      'https://picsum.photos/seed/joseph3/400/400',
    ],
    hero_photo_url: 'https://picsum.photos/seed/joseph1/900/400',
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
      'https://picsum.photos/seed/amina2/400/400',
    ],
    hero_photo_url: 'https://picsum.photos/seed/amina1/900/400',
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
      'https://picsum.photos/seed/sipho2/400/400',
      'https://picsum.photos/seed/sipho3/400/400',
    ],
    hero_photo_url: 'https://picsum.photos/seed/sipho1/900/400',
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
      'https://picsum.photos/seed/fatima2/400/400',
    ],
    hero_photo_url: 'https://picsum.photos/seed/fatima1/900/400',
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
      'https://picsum.photos/seed/emeka2/400/400',
      'https://picsum.photos/seed/emeka3/400/400',
    ],
    hero_photo_url: 'https://picsum.photos/seed/emeka1/900/400',
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

/* ─── Country flag emojis ─── */
const COUNTRY_FLAGS: Record<string, string> = {
  Uganda: '🇺🇬',
  Zimbabwe: '🇿🇼',
  Tanzania: '🇹🇿',
  Kenya: '🇰🇪',
  Ghana: '🇬🇭',
  Nigeria: '🇳🇬',
  Ethiopia: '🇪🇹',
  Zambia: '🇿🇲',
  Botswana: '🇧🇼',
  Mozambique: '🇲🇿',
  Malawi: '🇲🇼',
  Rwanda: '🇷🇼',
};

/* ─── Crop emojis ─── */
const CROP_EMOJI: Record<string, string> = {
  Coffee: '☕',
  Cashews: '🌰',
  Maize: '🌽',
  Rice: '🌾',
  Tobacco: '🌿',
  Cotton: '🪴',
  Sunflower: '🌻',
  Soybean: '🫘',
  Groundnuts: '🥜',
  Tea: '🍵',
  Cocoa: '🍫',
  Mango: '🥭',
  Avocado: '🥑',
  Cassava: '🍠',
  Banana: '🍌',
  Sugarcane: '🌱',
  Wheat: '🌾',
  Vegetables: '🥦',
  Livestock: '🐄',
  Poultry: '🐔',
};

function getCropEmoji(crop: string): string {
  for (const [key, emoji] of Object.entries(CROP_EMOJI)) {
    if (crop.toLowerCase().includes(key.toLowerCase())) return emoji;
  }
  return '🌱';
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

  const flag = COUNTRY_FLAGS[farmer.country] ?? '🌍';
  const initials = farmer.display_name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="card-polished overflow-hidden flex flex-col group">
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
            style={{ background: 'linear-gradient(135deg, #1B2A4A 0%, #2AA198 100%)' }}
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
              ⭐ Featured
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
                className="inline-flex items-center gap-1 bg-teal-light text-teal text-xs font-medium px-2.5 py-1 rounded-full"
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
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${funded}%`,
                    background:
                      funded >= 100
                        ? '#5DB347'
                        : 'linear-gradient(90deg, #5DB347, #449933)',
                  }}
                />
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
              className="inline-flex items-center gap-1.5 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
              style={{ background: '#5DB347' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#449933')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#5DB347')}
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
      className={`relative flex flex-col rounded-2xl border-2 p-6 transition-all duration-200 ${
        isPopular
          ? 'shadow-lg scale-[1.02]'
          : isCorporate
          ? 'border-navy/20 bg-navy text-white'
          : 'border-gray-200 bg-white hover:shadow-md'
      }`}
      style={isPopular ? { borderColor: '#5DB347' } : undefined}
    >
      {isPopular && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span
            className="text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md whitespace-nowrap"
            style={{ background: '#5DB347' }}
          >
            Most Popular
          </span>
        </div>
      )}

      <div className="text-3xl mb-2">{emoji}</div>
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
            <span style={{ color: '#5DB347' }} className="mt-0.5 shrink-0">
              ✓
            </span>
            <span className={isCorporate ? 'text-white/80' : 'text-gray-600'}>{feature}</span>
          </li>
        ))}
      </ul>

      <a
        href="#farmers"
        className="block text-center font-semibold py-3 rounded-xl transition-colors text-white"
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

/* ─── Main Page ─── */
export default function SponsorPage() {
  const [farmers, setFarmers] = useState<FarmerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState<string>('All');
  const [showAnnual, setShowAnnual] = useState(false);

  const farmersRef = useRef<HTMLDivElement>(null);
  const tiersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadFarmers() {
      try {
        const res = await fetch('/api/sponsor/farmers');
        if (res.ok) {
          const data = await res.json();
          const live = data.farmers ?? [];
          // Use live data if available, otherwise fall back to dummy data
          setFarmers(live.length > 0 ? live : DUMMY_FARMERS);
        } else {
          setFarmers(DUMMY_FARMERS);
        }
      } catch {
        setFarmers(DUMMY_FARMERS);
      } finally {
        setLoading(false);
      }
    }
    loadFarmers();
  }, []);

  const countries = ['All', ...Array.from(new Set(farmers.map((f) => f.country))).sort()];

  const filteredFarmers =
    selectedCountry === 'All' ? farmers : farmers.filter((f) => f.country === selectedCountry);

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
              <span>🌍</span>
              <span>Supporting African smallholder farmers</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Sponsor an{' '}
              <span
                className="text-transparent bg-clip-text"
                style={{ backgroundImage: 'linear-gradient(90deg, #6ABF4B, #5DB347)' }}
              >
                African Farmer
              </span>
            </h1>
            <p className="text-lg md:text-xl text-white/80 leading-relaxed mb-10">
              Your monthly contribution funds a real farmer&apos;s inputs, insurance, and offtake
              — transforming a smallholder into a thriving agri-business.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <button
                onClick={() => scrollTo(farmersRef)}
                className="w-full sm:w-auto text-white font-bold px-8 py-4 rounded-xl text-lg transition-colors shadow-lg"
                style={{ background: '#5DB347' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#449933')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#5DB347')}
              >
                Sponsor a Farmer →
              </button>
              <button
                onClick={() => scrollTo(tiersRef)}
                className="w-full sm:w-auto bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-colors"
              >
                Learn How It Works
              </button>
            </div>

            {/* Impact stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-white/10 border border-white/10 rounded-2xl overflow-hidden bg-white/5">
              {[
                { value: '2,400+', label: 'Farmers' },
                { value: '9', label: 'Countries' },
                { value: '3', label: 'Sponsorship Tiers' },
                { value: '📊', label: 'Monthly Impact Reports' },
              ].map((stat) => (
                <ImpactStat key={stat.label} value={stat.value} label={stat.label} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-navy mb-3">How It Works</h2>
            <p className="text-gray-500 text-lg">Three simple steps from sponsor to impact.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                emoji: '🔍',
                title: 'Choose a Farmer',
                desc: 'Browse real farmer profiles — read their story, see their farm, and learn what they need to succeed this season.',
              },
              {
                step: '02',
                emoji: '💳',
                title: 'Pick Your Tier',
                desc: 'From $5/month membership coverage to $500/month full program funding. Every contribution makes a measurable difference.',
              },
              {
                step: '03',
                emoji: '🌱',
                title: 'Watch Them Grow',
                desc: 'Receive monthly updates, harvest photos, and impact reports directly from your farmer. See your money at work.',
              },
            ].map((item, i) => (
              <div key={i} className="card-polished p-8 text-center relative overflow-hidden">
                <div
                  className="absolute top-4 right-4 text-7xl font-black opacity-5 select-none"
                  aria-hidden
                >
                  {item.step}
                </div>
                <div className="text-5xl mb-4">{item.emoji}</div>
                <h3 className="text-xl font-bold text-navy mb-3">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Sponsorship Tiers ── */}
      <section ref={tiersRef} id="tiers" style={{ background: '#F5F0E8' }} className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-navy mb-3">Sponsorship Tiers</h2>
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
            <TierCard
              emoji="🥉"
              name="Bronze"
              label="Bronze"
              monthlyPrice={5}
              description="Cover their AFU membership. Give them access to training, market prices, and the AFU network."
              features={['AFU Membership', 'Training Access', 'Market Data']}
              showAnnual={showAnnual}
              annualSaving={10}
            />
            <TierCard
              emoji="🥈"
              name="Silver"
              label="Silver"
              monthlyPrice={100}
              description="Fund a full season of crop inputs — seeds, fertiliser, pest management."
              features={[
                'Everything in Bronze',
                'Crop Inputs',
                'Crop Insurance',
                'Monthly Update',
              ]}
              isPopular
              showAnnual={showAnnual}
              annualSaving={200}
            />
            <TierCard
              emoji="🥇"
              name="Gold"
              label="Gold"
              monthlyPrice={500}
              description="Full program sponsorship. Inputs + insurance + working capital for the season."
              features={[
                'Everything in Silver',
                'Working Capital',
                'Offtake Support',
                'Quarterly Report',
                'Named Recognition',
              ]}
              showAnnual={showAnnual}
              annualSaving={1000}
            />
            <TierCard
              emoji="🏢"
              name="Corporate"
              label="Corporate"
              monthlyPrice={null}
              description="Sponsor a cohort of 10–50 farmers. Get a CSR impact report and brand recognition."
              features={[
                'Cohort Selection',
                'Branded Impact Report',
                'Logo on AFU Website',
                'Naming Rights',
              ]}
              isCorporate
              showAnnual={showAnnual}
            />
          </div>
        </div>
      </section>

      {/* ── Browse Farmers ── */}
      <section ref={farmersRef} id="farmers" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-navy mb-3">Meet the Farmers</h2>
            <p className="text-gray-500 text-lg">Real people, real farms, real impact.</p>
          </div>

          {/* Country filter */}
          {!loading && farmers.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mb-10">
              {countries.map((country) => (
                <button
                  key={country}
                  onClick={() => setSelectedCountry(country)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                    selectedCountry === country
                      ? 'text-white border-transparent'
                      : 'bg-white text-navy border-gray-200'
                  }`}
                  style={
                    selectedCountry === country
                      ? { background: '#1B2A4A' }
                      : undefined
                  }
                >
                  {country === 'All'
                    ? 'All Countries'
                    : `${COUNTRY_FLAGS[country] ?? '🌍'} ${country}`}
                </button>
              ))}
            </div>
          )}

          {/* Loading skeleton */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card-polished overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-200" />
                  <div className="p-5 space-y-3">
                    <div className="h-5 bg-gray-200 rounded w-2/3" />
                    <div className="h-4 bg-gray-100 rounded w-1/2" />
                    <div className="h-16 bg-gray-100 rounded" />
                    <div className="h-2 bg-gray-200 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Farmer grid */}
          {!loading && filteredFarmers.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFarmers.map((farmer) => (
                <FarmerCard key={farmer.id} farmer={farmer} />
              ))}
            </div>
          )}

          {/* No results for filter */}
          {!loading && farmers.length > 0 && filteredFarmers.length === 0 && (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">🔍</div>
              <p className="text-gray-500">
                No farmers found in {selectedCountry} yet.{' '}
                <button
                  onClick={() => setSelectedCountry('All')}
                  className="font-semibold underline"
                  style={{ color: '#5DB347' }}
                >
                  View all countries
                </button>
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ── Impact Section ── */}
      <section className="gradient-navy py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Your Impact in Numbers
            </h2>
            <p className="text-white/60 text-lg">Real outcomes from AFU-sponsored farmers.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { value: '847', label: 'Farmers waiting for a sponsor', color: '#6ABF4B' },
              { value: '$47', label: 'Average monthly contribution', color: '#C9A84C' },
              { value: '94%', label: 'Sponsored farmers complete their season', color: '#6ABF4B' },
              { value: '3.2×', label: 'Average income increase after first program', color: '#C9A84C' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center"
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

      {/* ── Corporate CTA ── */}
      <section className="bg-white py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-4xl mb-4">🏢</div>
          <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
            Watson &amp; Fine and others are already making an impact
          </h2>
          <p className="text-gray-500 text-lg leading-relaxed mb-3">
            Corporate sponsors partner with AFU to fund entire cohorts of farmers — 10 to 50 at a
            time. Get a branded CSR impact report, your logo on the AFU platform, and the knowledge
            that your company is transforming African agriculture at scale.
          </p>
          <p className="text-gray-500 mb-8">
            Recognised across 9 countries. Reported quarterly. Fully transparent.
          </p>
          <a
            href="mailto:partners@afu.org"
            className="inline-flex items-center gap-2 text-white font-bold px-8 py-4 rounded-xl text-lg transition-colors shadow-lg"
            style={{ background: '#1B2A4A' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#0F1A30')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#1B2A4A')}
          >
            Contact Us About Corporate Sponsorship →
          </a>
        </div>
      </section>
    </div>
  );
}
