'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';

/* ─── Types ─── */

interface FarmerUpdate {
  id: string;
  title: string;
  content: string;
  photo_urls: string[] | null;
  program_stage: string | null;
  created_at: string;
}

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
  updates: FarmerUpdate[];
  active_sponsors_count: number;
}

type Tier = 'bronze' | 'silver' | 'gold';
type BillingCycle = 'monthly' | 'annual';

/* ─── Dummy farmer data — matches /sponsor page ─── */
const DUMMY_FARMERS: FarmerProfile[] = [
  {
    id: 'dummy-1',
    slug: 'grace-moyo',
    display_name: 'Grace Moyo',
    story:
      'I have been farming maize and groundnuts in Mashonaland West for 14 years. After losing half my crop to drought in 2022, I joined AFU to access inputs on credit and proper crop insurance. This season I harvested 18 tonnes — my best ever.\n\nBefore AFU I would sell at the farm gate to middle-men who paid me 30% below market price. Now I have a direct offtake contract and I get paid within 7 days of delivery. The difference is life-changing.',
    farm_description:
      'A 4.5-hectare dryland farm on the banks of the Manyame River, planted with hybrid maize, groundnuts and a market garden of tomatoes and leafy greens. I use conservation agriculture — no tillage, crop residue retention — which has built my soil organic matter from 0.8% to 2.1% in three seasons.',
    photo_urls: [
      'https://picsum.photos/seed/grace2/400/400',
      'https://picsum.photos/seed/grace3/400/400',
      'https://picsum.photos/seed/grace4/400/400',
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
    active_sponsors_count: 3,
    updates: [
      {
        id: 'u1a',
        title: 'Planting season underway',
        content:
          'With the first rains in November I planted 3 hectares of hybrid maize. Germination is excellent — 94% stand. The certified seed from AFU Inputs Program is visibly better than what I was using before. Thank you to my sponsors!',
        photo_urls: ['https://picsum.photos/seed/graceu1/400/300'],
        program_stage: 'Planting',
        created_at: '2025-11-20T09:00:00Z',
      },
      {
        id: 'u1b',
        title: 'Soil test results received',
        content:
          'The AFU agronomy team visited and took soil samples. Results show pH 6.2 — ideal for maize — and good phosphorus levels. Recommended a top dressing of LAN fertiliser at V6 stage.',
        photo_urls: null,
        program_stage: 'Growing',
        created_at: '2025-10-05T14:00:00Z',
      },
    ],
  },
  {
    id: 'dummy-2',
    slug: 'joseph-odhiambo',
    display_name: 'Joseph Odhiambo',
    story:
      'I grow tea and avocados in the highlands of Kisii. My father started this farm in 1978 and I have been running it since 2010. AFU helped me access a certified avocado offtake contract with an exporter in Mombasa — my income tripled in one year.\n\nThe farm is certified GlobalG.A.P. through the AFU group certification scheme. I now train 18 neighbouring farmers on good agricultural practices.',
    farm_description:
      'A 7-hectare highland farm at 1,900m elevation. Tea rows inter-planted with Hass avocado trees. Water from a nearby stream powers a small drip irrigation system installed with an AFU equipment loan in 2024.',
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
    active_sponsors_count: 1,
    updates: [
      {
        id: 'u2a',
        title: 'Avocado export shipment dispatched',
        content:
          '4.2 tonnes of Grade A Hass avocados loaded at Mombasa port for the Netherlands. First international export through AFU Offtake Program! Payment received within 14 days — $3,150 net to the farm.',
        photo_urls: ['https://picsum.photos/seed/josephu1/400/300'],
        program_stage: 'Offtake',
        created_at: '2025-12-03T14:30:00Z',
      },
    ],
  },
  {
    id: 'dummy-3',
    slug: 'amina-hussein',
    display_name: 'Amina Hussein',
    story:
      "I am a second-generation rice farmer in the Kilombero Valley, one of Tanzania's most productive rice basins. Through AFU I accessed improved seed varieties and a mobile soil testing kit. My yield went from 2.8 to 5.1 tonnes per hectare.\n\nI also joined the AFU women's cooperative in Morogoro, which gives us collective bargaining power with millers.",
    farm_description:
      'A 3-hectare paddy in the Kilombero floodplain. I use a combination of rain-fed and supplemental irrigation. Paddy is milled locally and sold to the regional food bank and a local rice brand.',
    photo_urls: ['https://picsum.photos/seed/amina2/400/400'],
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
    active_sponsors_count: 1,
    updates: [],
  },
  {
    id: 'dummy-4',
    slug: 'sipho-dlamini',
    display_name: 'Sipho Dlamini',
    story:
      'I run a diversified livestock operation in the Central District of Botswana. I breed Brahman cattle and Boer goats for the local and export market. AFU\'s livestock health program helped me eliminate foot-and-mouth disease from my herd.\n\nI am working towards Botswana Meat Commission Grade A certification, which will open the European export market.',
    farm_description:
      'A 120-hectare cattle post with borehole water supply and 6 paddocks under rotational grazing. Herd size: 84 cattle and 230 goats. A solar-powered pump supplies water to all paddocks.',
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
    active_sponsors_count: 2,
    updates: [
      {
        id: 'u4a',
        title: 'Herd health check complete',
        content:
          'Veterinary team completed annual vaccination and ear-tagging. All 84 cattle cleared for export certification. Planning first sale to the Botswana Meat Commission in March.',
        photo_urls: null,
        program_stage: 'Livestock Health',
        created_at: '2025-12-15T08:00:00Z',
      },
    ],
  },
  {
    id: 'dummy-5',
    slug: 'fatima-banda',
    display_name: 'Fatima Banda',
    story:
      "Growing up, my family survived on one meal a day during the dry season. I started farming soybean on 1 hectare in 2019 with borrowed capital. Today I farm 6 hectares and run a small grain storage co-op with 11 other women in Chipata.\n\nAFU's warehouse receipt system means I no longer have to sell at harvest when prices are lowest. I store for 3 months and sell at 40% better prices.",
    farm_description:
      'A 6-hectare rain-fed farm focused on soybean rotation with maize. I also run an informal grain bank for 12 local women smallholders, buying and storing at harvest and selling at higher dry-season prices.',
    photo_urls: ['https://picsum.photos/seed/fatima2/400/400'],
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
    active_sponsors_count: 2,
    updates: [],
  },
  {
    id: 'dummy-6',
    slug: 'emeka-nwosu',
    display_name: 'Emeka Nwosu',
    story:
      'I left Lagos to return to my family land in Enugu State and grow cassava commercially. Nigeria imports too much starch — I want to be part of the solution. My AFU loan funded a cassava chipper and dryer that process 4 tonnes a day.\n\nI employ 7 full-time workers from my village and source fresh cassava from 23 out-growers on a contract farming arrangement.',
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
    active_sponsors_count: 0,
    updates: [],
  },
];

/* ─── Constants ─── */

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

const TIER_CONFIG: Record<
  Tier,
  { label: string; emoji: string; monthlyPrice: number; color: string }
> = {
  bronze: { label: 'Bronze', emoji: '🥉', monthlyPrice: 5, color: '#CD7F32' },
  silver: { label: 'Silver', emoji: '🥈', monthlyPrice: 100, color: '#5DB347' },
  gold: { label: 'Gold', emoji: '🥇', monthlyPrice: 500, color: '#C9A84C' },
};

const COUNTRIES = [
  'Afghanistan', 'Albania', 'Algeria', 'Angola', 'Argentina', 'Australia',
  'Austria', 'Bahrain', 'Bangladesh', 'Belgium', 'Botswana', 'Brazil',
  'Canada', 'China', 'Colombia', 'Denmark', 'Egypt', 'Ethiopia', 'Finland',
  'France', 'Germany', 'Ghana', 'Greece', 'India', 'Indonesia', 'Iran',
  'Ireland', 'Israel', 'Italy', 'Japan', 'Jordan', 'Kenya', 'Kuwait',
  'Malawi', 'Malaysia', 'Mozambique', 'Netherlands', 'New Zealand', 'Nigeria',
  'Norway', 'Oman', 'Pakistan', 'Philippines', 'Poland', 'Portugal',
  'Qatar', 'Romania', 'Rwanda', 'Saudi Arabia', 'Singapore', 'South Africa',
  'South Korea', 'Spain', 'Sweden', 'Switzerland', 'Tanzania', 'Thailand',
  'Turkey', 'UAE', 'Uganda', 'UK', 'USA', 'Ukraine', 'Vietnam', 'Zambia',
  'Zimbabwe',
];

/* ─── Funding progress bar ─── */
function FundingProgress({
  received,
  needed,
  sponsors,
}: {
  received: number;
  needed: number;
  sponsors: number;
}) {
  const pct = needed > 0 ? Math.min(100, Math.round((received / needed) * 100)) : 0;
  return (
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span className="font-bold text-navy">{pct}% funded</span>
        <span className="text-gray-500">
          ${received} of ${needed}/month
        </span>
      </div>
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            background:
              pct >= 100 ? '#5DB347' : 'linear-gradient(90deg, #5DB347, #449933)',
          }}
        />
      </div>
      <p className="text-xs text-gray-400 mt-2">
        {sponsors} current sponsor{sponsors !== 1 ? 's' : ''}
      </p>
    </div>
  );
}

/* ─── Farm stat item ─── */
function FarmStat({ emoji, label, value }: { emoji: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl p-4" style={{ background: '#EBF7E5' }}>
      <span className="text-2xl">{emoji}</span>
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">{label}</p>
        <p className="font-bold text-navy text-sm">{value}</p>
      </div>
    </div>
  );
}

/* ─── Update Card ─── */
function UpdateCard({ update }: { update: FarmerUpdate }) {
  const date = new Date(update.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  return (
    <div className="border border-gray-100 rounded-2xl p-5 hover:border-green-200 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-bold text-navy">{update.title}</h4>
        <span className="text-xs text-gray-400 shrink-0 ml-2">{date}</span>
      </div>
      {update.program_stage && (
        <span
          className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full mb-2"
          style={{ background: '#EBF7E5', color: '#5DB347' }}
        >
          {update.program_stage}
        </span>
      )}
      <p className="text-sm text-gray-600 leading-relaxed">{update.content}</p>
      {update.photo_urls && update.photo_urls.length > 0 && (
        <div className="flex gap-2 mt-3 flex-wrap">
          {update.photo_urls.slice(0, 3).map((url, i) => (
            <div
              key={i}
              className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100"
            >
              <img src={url} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Main Page ─── */
export default function FarmerProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  const [farmer, setFarmer] = useState<FarmerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sponsor form state
  const [selectedTier, setSelectedTier] = useState<Tier>('silver');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [showForm, setShowForm] = useState(false);
  const [formState, setFormState] = useState({ name: '', email: '', country: '', company: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function loadFarmer() {
      try {
        // First try the API
        const res = await fetch(`/api/sponsor/farmers/${slug}`);
        if (res.ok) {
          const data = await res.json();
          if (data.farmer) {
            setFarmer(data.farmer);
            setLoading(false);
            return;
          }
        }
        // Fall back to dummy data
        const dummy = DUMMY_FARMERS.find((f) => f.slug === slug);
        if (dummy) {
          setFarmer(dummy);
        } else {
          setError('Farmer not found');
        }
      } catch {
        const dummy = DUMMY_FARMERS.find((f) => f.slug === slug);
        if (dummy) {
          setFarmer(dummy);
        } else {
          setError('Failed to load farmer profile');
        }
      } finally {
        setLoading(false);
      }
    }
    loadFarmer();
  }, [slug]);

  const tierConfig = TIER_CONFIG[selectedTier];

  const calculatedAmount =
    billingCycle === 'annual' ? tierConfig.monthlyPrice * 10 : tierConfig.monthlyPrice;

  const savingsAmount = billingCycle === 'annual' ? tierConfig.monthlyPrice * 2 : 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!farmer) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch('/api/sponsor/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmer_profile_id: farmer.id,
          sponsor_name: formState.name,
          sponsor_email: formState.email,
          sponsor_company: formState.company || undefined,
          sponsor_country: formState.country || undefined,
          tier: selectedTier,
          billing_cycle: billingCycle,
          amount_usd: calculatedAmount,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to process sponsorship');

      setSuccess(true);
    } catch (err) {
      // For dummy farmers, still show success
      if (farmer.id.startsWith('dummy-')) {
        setSuccess(true);
      } else {
        setSubmitError(err instanceof Error ? err.message : 'Unknown error');
      }
    } finally {
      setSubmitting(false);
    }
  }

  /* ── Loading state ── */
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div
            className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: '#5DB347', borderTopColor: 'transparent' }}
          />
          <p className="text-gray-500">Loading farmer profile...</p>
        </div>
      </div>
    );
  }

  /* ── Error / 404 state ── */
  if (error || !farmer) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="text-6xl mb-4">🌾</div>
          <h2 className="text-2xl font-bold text-navy mb-3">
            {error === 'Farmer not found' ? 'Farmer Not Found' : 'Something Went Wrong'}
          </h2>
          <p className="text-gray-500 mb-6">
            {error === 'Farmer not found'
              ? "This farmer profile doesn't exist or is no longer active."
              : 'We had trouble loading this profile. Please try again.'}
          </p>
          <Link
            href="/sponsor"
            className="text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            style={{ background: '#5DB347' }}
          >
            ← Back to All Farmers
          </Link>
        </div>
      </div>
    );
  }

  const flag = COUNTRY_FLAGS[farmer.country] ?? '🌍';
  const initials = farmer.display_name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const firstName = farmer.display_name.split(' ')[0];

  return (
    <div>
      {/* ── Back link ── */}
      <div className="bg-white border-b border-gray-100 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/sponsor"
            className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
            style={{ color: '#5DB347' }}
          >
            ← Back to Sponsor a Farmer
          </Link>
        </div>
      </div>

      {/* ── Hero ── */}
      <div className="relative h-[400px] overflow-hidden">
        {farmer.hero_photo_url ? (
          <img
            src={farmer.hero_photo_url}
            alt={farmer.display_name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #1B2A4A 0%, #5DB347 100%)' }}
          >
            {farmer.crops && farmer.crops.length > 0 ? (
              <span className="text-8xl opacity-30">{getCropEmoji(farmer.crops[0])}</span>
            ) : (
              <span className="text-white text-8xl font-black opacity-20">{initials}</span>
            )}
          </div>
        )}

        {/* Overlay gradient */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, transparent 30%, rgba(15,26,48,0.85) 100%)',
          }}
        />

        {/* Hero content */}
        <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-8 pb-8">
          <div className="max-w-7xl mx-auto">
            {farmer.is_featured && (
              <span
                className="inline-block text-white text-xs font-bold px-2.5 py-1 rounded-full mb-3"
                style={{ background: '#C9A84C' }}
              >
                ⭐ Featured Farmer
              </span>
            )}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2">
              {farmer.display_name}
            </h1>
            <p className="text-white/80 text-lg mb-3">
              {flag} {farmer.country}
              {farmer.region ? ` · ${farmer.region}` : ''}
            </p>
            {farmer.crops && farmer.crops.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {farmer.crops.map((crop) => (
                  <span
                    key={crop}
                    className="inline-flex items-center gap-1.5 bg-white/15 border border-white/25 backdrop-blur-sm text-white text-sm font-medium px-3 py-1.5 rounded-full"
                  >
                    {getCropEmoji(crop)} {crop}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Two-column layout ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* ── Main column (2/3) ── */}
          <div className="lg:col-span-2 space-y-10">
            {/* About */}
            {farmer.story && (
              <section>
                <h2 className="text-2xl font-bold text-navy mb-4">About {firstName}</h2>
                <p className="text-gray-600 leading-relaxed text-base whitespace-pre-line">
                  {farmer.story}
                </p>
              </section>
            )}

            {/* Their Farm */}
            <section>
              <h2 className="text-2xl font-bold text-navy mb-5">Their Farm</h2>
              {farmer.farm_description && (
                <p className="text-gray-600 leading-relaxed mb-6 whitespace-pre-line">
                  {farmer.farm_description}
                </p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {farmer.farm_size_ha != null && (
                  <FarmStat emoji="🗺️" label="Farm Size" value={`${farmer.farm_size_ha} ha`} />
                )}
                {farmer.years_farming != null && (
                  <FarmStat
                    emoji="🌱"
                    label="Years Farming"
                    value={`${farmer.years_farming} years`}
                  />
                )}
                {farmer.family_members_supported != null && (
                  <FarmStat
                    emoji="👨‍👩‍👧‍👦"
                    label="Family Supported"
                    value={`${farmer.family_members_supported} members`}
                  />
                )}
              </div>
            </section>

            {/* Photo gallery */}
            {farmer.photo_urls && farmer.photo_urls.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-navy mb-4">Photos</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {farmer.photo_urls.slice(0, 4).map((url, i) => (
                    <div
                      key={i}
                      className="relative aspect-square rounded-xl overflow-hidden bg-gray-100"
                    >
                      <img
                        src={url}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Latest Updates */}
            <section>
              <h2 className="text-2xl font-bold text-navy mb-5">Latest Updates</h2>
              {farmer.updates && farmer.updates.length > 0 ? (
                <div className="space-y-4">
                  {farmer.updates.map((update) => (
                    <UpdateCard key={update.id} update={update} />
                  ))}
                </div>
              ) : (
                <div className="border border-gray-100 rounded-2xl p-8 text-center">
                  <div className="text-4xl mb-3">📭</div>
                  <p className="text-gray-500">
                    No updates yet. Check back after this farmer begins their program.
                  </p>
                </div>
              )}
            </section>
          </div>

          {/* ── Sidebar (1/3) ── */}
          <div className="lg:col-span-1">
            <div className="card-elevated p-6 sticky top-24">
              <h3 className="text-xl font-bold text-navy mb-5">Sponsor {firstName}</h3>

              {/* Funding progress */}
              {farmer.monthly_funding_needed ? (
                <div className="mb-6">
                  <FundingProgress
                    received={farmer.monthly_funding_received ?? 0}
                    needed={farmer.monthly_funding_needed}
                    sponsors={farmer.active_sponsors_count}
                  />
                </div>
              ) : (
                <p className="text-sm text-gray-400 mb-5">
                  {farmer.active_sponsors_count} current sponsor
                  {farmer.active_sponsors_count !== 1 ? 's' : ''}
                </p>
              )}

              {/* Tier selector */}
              <div className="mb-4">
                <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2">
                  Choose a Tier
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(TIER_CONFIG) as Tier[]).map((tier) => {
                    const t = TIER_CONFIG[tier];
                    const isActive = selectedTier === tier;
                    return (
                      <button
                        key={tier}
                        onClick={() => {
                          setSelectedTier(tier);
                          setShowForm(false);
                          setSuccess(false);
                        }}
                        className="flex flex-col items-center py-3 px-2 rounded-xl border-2 text-center transition-all text-xs font-semibold"
                        style={
                          isActive
                            ? { borderColor: '#5DB347', background: '#EBF7E5', color: '#5DB347' }
                            : { borderColor: '#e5e7eb', color: '#9ca3af' }
                        }
                      >
                        <span className="text-xl mb-1">{t.emoji}</span>
                        <span>{t.label}</span>
                        <span className="font-bold text-navy">${t.monthlyPrice}/mo</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Billing toggle */}
              <div className="mb-4">
                <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2">
                  Billing Cycle
                </p>
                <div className="flex rounded-xl overflow-hidden border border-gray-200">
                  <button
                    onClick={() => { setBillingCycle('monthly'); setSuccess(false); }}
                    className="flex-1 py-2.5 text-sm font-semibold transition-colors"
                    style={billingCycle === 'monthly' ? { background: '#1B2A4A', color: '#fff' } : { background: '#fff', color: '#9ca3af' }}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => { setBillingCycle('annual'); setSuccess(false); }}
                    className="flex-1 py-2.5 text-sm font-semibold transition-colors"
                    style={billingCycle === 'annual' ? { background: '#1B2A4A', color: '#fff' } : { background: '#fff', color: '#9ca3af' }}
                  >
                    Annual
                  </button>
                </div>
              </div>

              {/* Calculated amount */}
              <div
                className="rounded-xl px-4 py-3 mb-4 text-center"
                style={{ background: '#EBF7E5' }}
              >
                <span className="text-2xl font-black text-navy">${calculatedAmount}</span>
                <span className="text-gray-500 text-sm">
                  /{billingCycle === 'annual' ? 'year' : 'month'}
                </span>
                {billingCycle === 'annual' && savingsAmount > 0 && (
                  <div className="mt-0.5">
                    <span className="text-xs font-semibold" style={{ color: '#5DB347' }}>
                      You save ${savingsAmount}!
                    </span>
                  </div>
                )}
              </div>

              {/* Success message */}
              {success ? (
                <div
                  className="border rounded-xl p-4 text-center"
                  style={{ background: '#EBF7E5', borderColor: '#5DB347' }}
                >
                  <div className="text-3xl mb-2">🎉</div>
                  <p className="font-bold text-navy mb-1">
                    Thank you! You&apos;re now sponsoring {firstName}.
                  </p>
                  <p className="text-sm text-gray-500">
                    You&apos;ll receive monthly updates at{' '}
                    <span className="font-semibold">{formState.email}</span>.
                  </p>
                </div>
              ) : showForm ? (
                /* ── Sponsorship Form ── */
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formState.name}
                      onChange={(e) => setFormState((s) => ({ ...s, name: e.target.value }))}
                      placeholder="Jane Smith"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
                      style={{ '--tw-ring-color': '#5DB347' } as React.CSSProperties}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formState.email}
                      onChange={(e) => setFormState((s) => ({ ...s, email: e.target.value }))}
                      placeholder="jane@example.com"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Your Country
                    </label>
                    <select
                      value={formState.country}
                      onChange={(e) => setFormState((s) => ({ ...s, country: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 bg-white"
                    >
                      <option value="">Select country...</option>
                      {COUNTRIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  {selectedTier === 'gold' && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Company (optional)
                      </label>
                      <input
                        type="text"
                        value={formState.company}
                        onChange={(e) => setFormState((s) => ({ ...s, company: e.target.value }))}
                        placeholder="Acme Corp"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
                      />
                    </div>
                  )}

                  {submitError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 text-sm text-red-600">
                      {submitError}
                    </div>
                  )}

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="flex-1 border border-gray-200 text-gray-500 font-semibold py-3 rounded-xl text-sm hover:bg-gray-50 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 disabled:opacity-60 text-white font-bold py-3 rounded-xl text-sm transition-colors"
                      style={{ background: '#5DB347' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#449933')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = '#5DB347')}
                    >
                      {submitting ? 'Processing...' : 'Confirm Sponsorship'}
                    </button>
                  </div>
                </form>
              ) : (
                /* ── Sponsor Now button ── */
                <button
                  onClick={() => setShowForm(true)}
                  className="w-full text-white font-bold py-4 rounded-xl text-base transition-colors shadow-lg"
                  style={{ background: '#5DB347' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#449933')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '#5DB347')}
                >
                  Sponsor {firstName} Now →
                </button>
              )}

              {/* Note */}
              {!success && (
                <p className="text-xs text-gray-400 text-center mt-3">
                  Secure sponsorship · Cancel anytime
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
