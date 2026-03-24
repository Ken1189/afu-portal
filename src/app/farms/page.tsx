'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Ruler,
  Leaf,
  ArrowRight,
  Sprout,
  Filter,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

/* ─── Types ─── */

interface FarmProfile {
  id: string;
  slug: string;
  display_name: string;
  story: string | null;
  hero_photo_url: string | null;
  country: string;
  region: string | null;
  crops: string[] | null;
  farm_size_ha: number | null;
  is_showcase?: boolean;
}

/* ─── Fallback data (matches the existing DUMMY_FARMERS structure) ─── */

const DUMMY_FARMERS: FarmProfile[] = [
  {
    id: 'showcase-1',
    slug: 'watson-and-fine',
    display_name: 'Watson & Fine Group',
    story: 'Watson & Fine is a diversified commercial farming operation and the founding farm behind AFU. Led by Peter Watson, the group spans 120 hectares across Mashonaland with operations in high-value horticulture, tree crops, and livestock. As AFU\u2019s flagship partner farm, Watson & Fine serves as the model for what integrated, technology-enabled commercial agriculture looks like in Zimbabwe.',
    hero_photo_url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=900&h=400&fit=crop',
    country: 'Zimbabwe',
    region: 'Mashonaland',
    crops: ['Blueberries', 'Macadamia', 'Citrus', 'Cattle'],
    farm_size_ha: 120,
    is_showcase: true,
  },
  {
    id: 'showcase-2',
    slug: 'watson-cassava',
    display_name: 'Watson Cassava Starch',
    story: 'A dedicated cassava production and starch extraction operation supplying industrial starch to regional manufacturers. The farm demonstrates AFU\u2019s processing hub model \u2014 growing the raw material and adding value before it leaves the farm gate.',
    hero_photo_url: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=900&h=400&fit=crop',
    country: 'Zimbabwe',
    region: 'Mashonaland East',
    crops: ['Cassava', 'Starch Processing'],
    farm_size_ha: 45,
    is_showcase: true,
  },
  {
    id: 'dummy-1',
    slug: 'grace-moyo',
    display_name: 'Grace Moyo',
    story: 'I have been farming maize and groundnuts in Mashonaland West for 14 years. After losing half my crop to drought in 2022, I joined AFU to access inputs on credit and proper crop insurance. This season I harvested 18 tonnes, my best ever.',
    hero_photo_url: 'https://picsum.photos/seed/grace1/900/400',
    country: 'Zimbabwe',
    region: 'Mashonaland West',
    crops: ['Maize', 'Groundnuts', 'Vegetables'],
    farm_size_ha: 4.5,
  },
  {
    id: 'dummy-2',
    slug: 'joseph-odhiambo',
    display_name: 'Joseph Odhiambo',
    story: 'I grow tea and avocados in the highlands of Kisii. My father started this farm in 1978 and I have been running it since 2010. AFU helped me access a certified avocado offtake contract with an exporter in Mombasa, my income tripled in one year.',
    hero_photo_url: 'https://picsum.photos/seed/joseph1/900/400',
    country: 'Kenya',
    region: 'Kisii County',
    crops: ['Tea', 'Avocado'],
    farm_size_ha: 7,
  },
  {
    id: 'dummy-3',
    slug: 'amina-hussein',
    display_name: 'Amina Hussein',
    story: 'I am a second-generation rice farmer in the Kilombero Valley. Through AFU I accessed improved seed varieties and a mobile soil testing kit. My yield went from 2.8 to 5.1 tonnes per hectare.',
    hero_photo_url: 'https://picsum.photos/seed/amina1/900/400',
    country: 'Tanzania',
    region: 'Morogoro',
    crops: ['Rice'],
    farm_size_ha: 3,
  },
  {
    id: 'dummy-4',
    slug: 'sipho-dlamini',
    display_name: 'Sipho Dlamini',
    story: 'I run a diversified livestock operation in the Central District of Botswana. I breed Brahman cattle and Boer goats for the local and export market. AFU\'s livestock health program helped me eliminate foot-and-mouth disease from my herd.',
    hero_photo_url: 'https://picsum.photos/seed/sipho1/900/400',
    country: 'Botswana',
    region: 'Central District',
    crops: ['Livestock'],
    farm_size_ha: 120,
  },
  {
    id: 'dummy-5',
    slug: 'fatima-diallo',
    display_name: 'Fatima Diallo',
    story: 'I started farming with just 0.5 hectares and a hand pump. After joining AFU, I accessed an equipment loan for a drip irrigation system and expanded to 2 hectares. I now grow tomatoes, peppers, and lettuce year-round.',
    hero_photo_url: 'https://picsum.photos/seed/fatima1/900/400',
    country: 'Ghana',
    region: 'Greater Accra',
    crops: ['Tomatoes', 'Peppers', 'Lettuce'],
    farm_size_ha: 2,
  },
];

/* ─── Crop badge colors ─── */

const CROP_COLORS: Record<string, string> = {
  Maize: 'bg-amber-100 text-amber-700',
  Groundnuts: 'bg-yellow-100 text-yellow-700',
  Vegetables: 'bg-emerald-100 text-emerald-700',
  Tea: 'bg-green-100 text-green-700',
  Avocado: 'bg-lime-100 text-lime-700',
  Rice: 'bg-amber-100 text-amber-700',
  Livestock: 'bg-orange-100 text-orange-700',
  Tomatoes: 'bg-red-100 text-red-700',
  Peppers: 'bg-rose-100 text-rose-700',
  Lettuce: 'bg-emerald-100 text-emerald-700',
  Blueberries: 'bg-indigo-100 text-indigo-700',
  Macadamia: 'bg-amber-100 text-amber-700',
  Citrus: 'bg-orange-100 text-orange-700',
  Cattle: 'bg-orange-100 text-orange-700',
  Cassava: 'bg-yellow-100 text-yellow-700',
  'Starch Processing': 'bg-violet-100 text-violet-700',
};

/* ─── Component ─── */

export default function FarmsPage() {
  const [farms, setFarms] = useState<FarmProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [countryFilter, setCountryFilter] = useState('All');

  useEffect(() => {
    async function fetchFarms() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('farmer_public_profiles')
          .select('id, slug, display_name, story, hero_photo_url, country, region, crops, farm_size_ha')
          .eq('is_showcase', true)
          .order('display_name');

        if (error || !data || data.length === 0) {
          setFarms(DUMMY_FARMERS);
        } else {
          setFarms(data);
        }
      } catch {
        setFarms(DUMMY_FARMERS);
      } finally {
        setLoading(false);
      }
    }
    fetchFarms();
  }, []);

  const countries = useMemo(() => {
    const set = new Set(farms.map((f) => f.country));
    return ['All', ...Array.from(set).sort()];
  }, [farms]);

  const filtered = useMemo(() => {
    if (countryFilter === 'All') return farms;
    return farms.filter((f) => f.country === countryFilter);
  }, [farms, countryFilter]);

  const excerpt = (text: string | null, maxLen = 150) => {
    if (!text) return '';
    if (text.length <= maxLen) return text;
    return text.slice(0, maxLen).trim() + '...';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Hero ── */}
      <section
        className="relative py-20 px-4"
        style={{ background: 'linear-gradient(135deg, #1B2A4A 0%, #2A3F6A 100%)' }}
      >
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-white/80 text-sm font-medium mb-6">
            <Sprout className="w-4 h-4" />
            Farm Showcase
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
            Our Partner Farms
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Explore the farms powering Africa&apos;s agricultural revolution
          </p>
        </div>
      </section>

      {/* ── Country Filter ── */}
      <section className="max-w-7xl mx-auto px-4 -mt-6 relative z-10">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:border-[#5DB347] transition-colors"
          >
            {countries.map((c) => (
              <option key={c} value={c}>{c === 'All' ? 'All Countries' : c}</option>
            ))}
          </select>
          <span className="text-sm text-gray-400">
            {filtered.length} farm{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
      </section>

      {/* ── Farm Cards ── */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin w-8 h-8 border-2 border-[#5DB347] border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Loading farms...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Sprout className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No farms to display in this country.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((farm) => (
              <Link
                key={farm.id}
                href={`/farmers/${farm.slug}`}
                className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
              >
                {/* Hero photo */}
                <div className="h-48 bg-gray-100 overflow-hidden">
                  {farm.hero_photo_url ? (
                    <img
                      src={farm.hero_photo_url}
                      alt={`${farm.display_name}'s Farm`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#5DB347]/10">
                      <Sprout className="w-12 h-12 text-[#5DB347]/40" />
                    </div>
                  )}
                </div>

                <div className="p-6">
                  {/* Name */}
                  <h3 className="text-lg font-bold text-[#1B2A4A] group-hover:text-[#5DB347] transition-colors">
                    {farm.display_name}&apos;s Farm
                  </h3>

                  {/* Location + Size */}
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      {farm.country}{farm.region ? `, ${farm.region}` : ''}
                    </span>
                    {farm.farm_size_ha && (
                      <span className="flex items-center gap-1">
                        <Ruler className="w-3.5 h-3.5 text-gray-400" />
                        {farm.farm_size_ha} ha
                      </span>
                    )}
                  </div>

                  {/* Crops */}
                  {farm.crops && farm.crops.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {farm.crops.map((crop) => (
                        <span
                          key={crop}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${CROP_COLORS[crop] || 'bg-gray-100 text-gray-600'}`}
                        >
                          <Leaf className="w-2.5 h-2.5" />
                          {crop}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Story excerpt */}
                  {farm.story && (
                    <p className="text-sm text-gray-500 mt-3 leading-relaxed">
                      {excerpt(farm.story)}
                    </p>
                  )}

                  {/* CTA */}
                  <div className="flex items-center gap-1 mt-4 text-sm font-semibold text-[#5DB347] group-hover:gap-2 transition-all">
                    Visit Farm <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
