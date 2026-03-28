'use client';

import { useState, useEffect, useMemo } from 'react';
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

const SECTOR_TABS = ['All', 'Grains', 'Cash Crops', 'Livestock', 'Horticulture', 'Poultry'];

const SECTOR_COLORS: Record<string, string> = {
  Grains: 'bg-amber-100 text-amber-700',
  'Cash Crops': 'bg-green-100 text-green-700',
  Livestock: 'bg-orange-100 text-orange-700',
  Horticulture: 'bg-emerald-100 text-emerald-700',
  Poultry: 'bg-yellow-100 text-yellow-700',
};

const SECTOR_ICONS: Record<string, React.ReactNode> = {
  Grains: <Wheat className="w-3.5 h-3.5" />,
  'Cash Crops': <Sprout className="w-3.5 h-3.5" />,
  Livestock: <Beef className="w-3.5 h-3.5" />,
  Horticulture: <TreePine className="w-3.5 h-3.5" />,
  Poultry: <Egg className="w-3.5 h-3.5" />,
};

/* ─── Component ─── */

export default function AmbassadorsPage() {
  const [ambassadors, setAmbassadors] = useState<Ambassador[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSector, setActiveSector] = useState('All');
  const [expandedBio, setExpandedBio] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAmbassadors() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('ambassadors')
          .select('*')
          .order('years_experience', { ascending: false });

        if (error || !data || data.length === 0) {
          setAmbassadors(FALLBACK_AMBASSADORS);
        } else {
          setAmbassadors(data);
        }
      } catch {
        setAmbassadors(FALLBACK_AMBASSADORS);
      } finally {
        setLoading(false);
      }
    }
    fetchAmbassadors();
  }, []);

  const filtered = useMemo(() => {
    if (activeSector === 'All') return ambassadors;
    return ambassadors.filter((a) => a.sector === activeSector);
  }, [ambassadors, activeSector]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Hero ── */}
      <section
        className="relative py-20 px-4"
        style={{ background: 'linear-gradient(135deg, #1B2A4A 0%, #2A3F6A 100%)' }}
      >
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-white/80 text-sm font-medium mb-6">
            <Award className="w-4 h-4" />
            Our Ambassadors
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
            Meet Our Ambassadors
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto mb-8">
            The farmers leading Africa&apos;s agricultural transformation
          </p>
          <Link
            href="/ambassador/apply"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-sm transition-all hover:shadow-lg hover:shadow-[#5DB347]/30 hover:-translate-y-0.5"
            style={{ background: 'linear-gradient(135deg, #5DB347, #449933)' }}
          >
            Become an Ambassador
            <ArrowRight className="w-4 h-4" />
          </Link>
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
    </div>
  );
}
