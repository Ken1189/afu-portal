'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

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
  silver: { label: 'Silver', emoji: '🥈', monthlyPrice: 100, color: '#A8A9AD' },
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
              pct >= 100
                ? '#2AA198'
                : 'linear-gradient(90deg, #2AA198, #1A7A72)',
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
function FarmStat({
  emoji,
  label,
  value,
}: {
  emoji: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 bg-teal-light rounded-xl p-4">
      <span className="text-2xl">{emoji}</span>
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">
          {label}
        </p>
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
    <div className="border border-gray-100 rounded-2xl p-5 hover:border-teal/30 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-bold text-navy">{update.title}</h4>
        <span className="text-xs text-gray-400 shrink-0 ml-2">{date}</span>
      </div>
      {update.program_stage && (
        <span className="inline-block bg-teal-light text-teal text-xs font-semibold px-2.5 py-1 rounded-full mb-2">
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
              <Image src={url} alt="" fill className="object-cover" />
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
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    country: '',
    company: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function loadFarmer() {
      try {
        setLoading(true);
        const res = await fetch(`/api/sponsor/farmers/${slug}`);
        if (!res.ok) {
          if (res.status === 404) throw new Error('Farmer not found');
          throw new Error('Failed to load farmer profile');
        }
        const data = await res.json();
        setFarmer(data.farmer);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    loadFarmer();
  }, [slug]);

  const tierConfig = TIER_CONFIG[selectedTier];

  const calculatedAmount =
    billingCycle === 'annual'
      ? tierConfig.monthlyPrice * 10
      : tierConfig.monthlyPrice;

  const savingsAmount =
    billingCycle === 'annual' ? tierConfig.monthlyPrice * 2 : 0;

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

      if (!res.ok) {
        throw new Error(data.error || 'Failed to process sponsorship');
      }

      setSuccess(true);
      // Refresh farmer data so counts update
      const updated = await fetch(`/api/sponsor/farmers/${slug}`);
      if (updated.ok) {
        const updatedData = await updated.json();
        setFarmer(updatedData.farmer);
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSubmitting(false);
    }
  }

  /* ── Loading state ── */
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-teal border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading farmer profile...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  /* ── Error / 404 state ── */
  if (error || !farmer) {
    return (
      <>
        <Navbar />
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center max-w-md px-4">
            <div className="text-6xl mb-4">🌾</div>
            <h2 className="text-2xl font-bold text-navy mb-3">
              {error === 'Farmer not found' ? 'Farmer Not Found' : 'Something Went Wrong'}
            </h2>
            <p className="text-gray-500 mb-6">
              {error === 'Farmer not found'
                ? 'This farmer profile doesn\'t exist or is no longer active.'
                : 'We had trouble loading this profile. Please try again.'}
            </p>
            <Link
              href="/sponsor"
              className="bg-teal hover:bg-teal-dark text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              ← Back to All Farmers
            </Link>
          </div>
        </div>
        <Footer />
      </>
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
    <>
      <Navbar />

      <main>
        {/* ── Back link ── */}
        <div className="bg-white border-b border-gray-100 py-3">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link
              href="/sponsor"
              className="inline-flex items-center gap-1.5 text-sm text-teal hover:text-teal-dark font-medium transition-colors"
            >
              ← Back to Sponsor a Farmer
            </Link>
          </div>
        </div>

        {/* ── Hero ── */}
        <div className="relative h-[400px] overflow-hidden">
          {farmer.hero_photo_url ? (
            <Image
              src={farmer.hero_photo_url}
              alt={farmer.display_name}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #1B2A4A 0%, #2AA198 100%)',
              }}
            >
              {farmer.crops && farmer.crops.length > 0 ? (
                <span className="text-8xl opacity-30">
                  {getCropEmoji(farmer.crops[0])}
                </span>
              ) : (
                <span className="text-white text-8xl font-black opacity-20">
                  {initials}
                </span>
              )}
            </div>
          )}

          {/* Overlay gradient */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to bottom, transparent 30%, rgba(15,26,48,0.85) 100%)',
            }}
          />

          {/* Hero content */}
          <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-8 pb-8">
            <div className="max-w-7xl mx-auto">
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
                  <h2 className="text-2xl font-bold text-navy mb-4">
                    About {firstName}
                  </h2>
                  <p className="text-gray-600 leading-relaxed text-base whitespace-pre-line">
                    {farmer.story}
                  </p>
                </section>
              )}

              {/* Their Farm */}
              <section>
                <h2 className="text-2xl font-bold text-navy mb-5">
                  Their Farm
                </h2>
                {farmer.farm_description && (
                  <p className="text-gray-600 leading-relaxed mb-6 whitespace-pre-line">
                    {farmer.farm_description}
                  </p>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {farmer.farm_size_ha != null && (
                    <FarmStat
                      emoji="🗺️"
                      label="Farm Size"
                      value={`${farmer.farm_size_ha} ha`}
                    />
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
                  <h2 className="text-2xl font-bold text-navy mb-4">
                    Photos
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {farmer.photo_urls.slice(0, 4).map((url, i) => (
                      <div
                        key={i}
                        className="relative aspect-square rounded-xl overflow-hidden bg-gray-100"
                      >
                        <Image src={url} alt="" fill className="object-cover" />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Latest Updates */}
              <section>
                <h2 className="text-2xl font-bold text-navy mb-5">
                  Latest Updates
                </h2>
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
                      No updates yet. Check back after this farmer begins their
                      program.
                    </p>
                  </div>
                )}
              </section>
            </div>

            {/* ── Sidebar (1/3) ── */}
            <div className="lg:col-span-1">
              <div className="card-elevated p-6 sticky top-24">
                <h3 className="text-xl font-bold text-navy mb-5">
                  Sponsor {firstName}
                </h3>

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
                          className={`flex flex-col items-center py-3 px-2 rounded-xl border-2 text-center transition-all text-xs font-semibold ${
                            isActive
                              ? 'border-teal bg-teal-light text-teal'
                              : 'border-gray-200 text-gray-500 hover:border-teal/40'
                          }`}
                        >
                          <span className="text-xl mb-1">{t.emoji}</span>
                          <span>{t.label}</span>
                          <span className="font-bold text-navy">
                            ${t.monthlyPrice}/mo
                          </span>
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
                      onClick={() => {
                        setBillingCycle('monthly');
                        setSuccess(false);
                      }}
                      className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
                        billingCycle === 'monthly'
                          ? 'bg-navy text-white'
                          : 'bg-white text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      Monthly
                    </button>
                    <button
                      onClick={() => {
                        setBillingCycle('annual');
                        setSuccess(false);
                      }}
                      className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
                        billingCycle === 'annual'
                          ? 'bg-navy text-white'
                          : 'bg-white text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      Annual
                    </button>
                  </div>
                </div>

                {/* Calculated amount */}
                <div className="bg-teal-light rounded-xl px-4 py-3 mb-4 text-center">
                  <span className="text-2xl font-black text-navy">
                    ${calculatedAmount}
                  </span>
                  <span className="text-gray-500 text-sm">
                    /{billingCycle === 'annual' ? 'year' : 'month'}
                  </span>
                  {billingCycle === 'annual' && savingsAmount > 0 && (
                    <div className="mt-0.5">
                      <span className="text-xs text-teal font-semibold">
                        You save ${savingsAmount}!
                      </span>
                    </div>
                  )}
                </div>

                {/* Success message */}
                {success ? (
                  <div className="bg-teal-light border border-teal/20 rounded-xl p-4 text-center">
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
                        onChange={(e) =>
                          setFormState((s) => ({ ...s, name: e.target.value }))
                        }
                        placeholder="Jane Smith"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
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
                        onChange={(e) =>
                          setFormState((s) => ({ ...s, email: e.target.value }))
                        }
                        placeholder="jane@example.com"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Your Country
                      </label>
                      <select
                        value={formState.country}
                        onChange={(e) =>
                          setFormState((s) => ({
                            ...s,
                            country: e.target.value,
                          }))
                        }
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal bg-white"
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
                          onChange={(e) =>
                            setFormState((s) => ({
                              ...s,
                              company: e.target.value,
                            }))
                          }
                          placeholder="Acme Corp"
                          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
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
                        className="flex-1 bg-teal hover:bg-teal-dark disabled:opacity-60 text-white font-bold py-3 rounded-xl text-sm transition-colors"
                      >
                        {submitting ? 'Processing...' : 'Confirm Sponsorship'}
                      </button>
                    </div>
                  </form>
                ) : (
                  /* ── Sponsor Now button ── */
                  <button
                    onClick={() => setShowForm(true)}
                    className="w-full bg-teal hover:bg-teal-dark text-white font-bold py-4 rounded-xl text-base transition-colors shadow-lg shadow-teal/20"
                  >
                    Sponsor {firstName} Now →
                  </button>
                )}

                {/* Divider and note */}
                {!success && (
                  <p className="text-xs text-gray-400 text-center mt-3">
                    Secure sponsorship · Cancel anytime
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
