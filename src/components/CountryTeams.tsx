'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';

/* ─── Animation helper (matches LeadershipSection pattern) ─── */
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

/* ─── Types ─── */

interface TeamMember {
  name: string;
  title: string;
  bio: string;
}

interface CountryTeam {
  code: string;
  name: string;
  flag: string;
  tagline: string;
  members: TeamMember[];
}

/* ─── Data: 20 countries, 3-4 members each ─── */

const COUNTRY_TEAMS: CountryTeam[] = [
  {
    code: 'BW',
    name: 'Botswana',
    flag: '\ud83c\udde7\ud83c\uddfc',
    tagline: 'Dryland agriculture innovation hub',
    members: [
      { name: 'Kgosi Morapedi', title: 'Country Director', bio: 'Former deputy director at Botswana Agricultural Marketing Board with 15 years in dryland farming policy.' },
      { name: 'Naledi Tau', title: 'Agricultural Officer', bio: 'Agronomist specializing in drought-resistant crop systems across the Kalahari basin.' },
      { name: 'Mpho Kgathi', title: 'Finance & Operations', bio: 'Chartered accountant with experience in SADC development fund management.' },
    ],
  },
  {
    code: 'ZW',
    name: 'Zimbabwe',
    flag: '\ud83c\uddff\ud83c\uddfc',
    tagline: 'Restoring Africa\'s former breadbasket',
    members: [
      { name: 'Tendai Moyo', title: 'Country Director', bio: 'Agricultural economist who led the Zimbabwe National Farmers Union modernization program.' },
      { name: 'Rumbidzai Chikwanha', title: 'Agricultural Officer', bio: 'Crop scientist focused on tobacco diversification and climate-smart horticulture.' },
      { name: 'Tapiwa Mhaka', title: 'Finance & Operations', bio: 'Operations leader with background in multi-currency treasury management.' },
      { name: 'Chiedza Nyambuya', title: 'Community Liaison', bio: 'Grassroots organizer connecting 200+ smallholder cooperatives across Mashonaland.' },
    ],
  },
  {
    code: 'TZ',
    name: 'Tanzania',
    flag: '\ud83c\uddf9\ud83c\uddff',
    tagline: 'East Africa\'s agricultural gateway',
    members: [
      { name: 'Baraka Mwakasege', title: 'Country Director', bio: 'Former regional commissioner for agriculture in the Southern Highlands breadbasket zone.' },
      { name: 'Amina Kibwana', title: 'Agricultural Officer', bio: 'Specialist in cashew nut value chains and tropical fruit processing systems.' },
      { name: 'Juma Mfinanga', title: 'Finance & Operations', bio: 'Financial controller experienced with USAID and World Bank grant compliance.' },
      { name: 'Neema Massawe', title: 'Community Liaison', bio: 'Women-in-agriculture advocate managing farmer field schools across Morogoro and Iringa.' },
    ],
  },
  {
    code: 'KE',
    name: 'Kenya',
    flag: '\ud83c\uddf0\ud83c\uddea',
    tagline: 'Innovation-driven agricultural finance',
    members: [
      { name: 'James Otieno', title: 'Country Director', bio: 'Fintech and agri-lending veteran who built mobile credit products reaching 50,000 farmers.' },
      { name: 'Wanjiku Njeri', title: 'Agricultural Officer', bio: 'Horticulture export specialist with deep ties to the Naivasha flower and vegetable corridor.' },
      { name: 'Daniel Kipchoge', title: 'Finance & Operations', bio: 'Former auditor at a Big Four firm, now focused on agricultural cooperative financial systems.' },
      { name: 'Akinyi Odhiambo', title: 'Community Liaison', bio: 'Leads youth-in-agriculture programs across western Kenya and the Rift Valley.' },
    ],
  },
  {
    code: 'NG',
    name: 'Nigeria',
    flag: '\ud83c\uddf3\ud83c\uddec',
    tagline: 'Scaling Africa\'s largest farm economy',
    members: [
      { name: 'Emeka Okafor', title: 'Country Director', bio: 'Agribusiness executive who managed large-scale rice and cassava processing operations in the North.' },
      { name: 'Folake Adeyemi', title: 'Agricultural Officer', bio: 'Extension specialist coordinating maize and soybean programs across the Middle Belt.' },
      { name: 'Chukwuemeka Nwosu', title: 'Finance & Operations', bio: 'Investment banker turned agri-finance director managing a portfolio of commodity-backed facilities.' },
      { name: 'Hauwa Ibrahim', title: 'Community Liaison', bio: 'Community development expert bridging northern pastoral and southern crop-farming networks.' },
    ],
  },
  {
    code: 'ZM',
    name: 'Zambia',
    flag: '\ud83c\uddff\ud83c\uddf2',
    tagline: 'Southern Africa\'s emerging agri-corridor',
    members: [
      { name: 'Mwamba Chilufya', title: 'Country Director', bio: 'Former programme manager at the Zambia National Farmers Union with policy reform experience.' },
      { name: 'Bupe Musonda', title: 'Agricultural Officer', bio: 'Soil scientist driving conservation agriculture practices across the maize belt.' },
      { name: 'Chanda Mulenga', title: 'Finance & Operations', bio: 'Microfinance specialist who designed loan products for 10,000+ smallholders.' },
    ],
  },
  {
    code: 'MZ',
    name: 'Mozambique',
    flag: '\ud83c\uddf2\ud83c\uddff',
    tagline: 'Coastal agriculture and processing potential',
    members: [
      { name: 'Alberto Macuacua', title: 'Country Director', bio: 'Logistics and trade expert who developed agricultural export corridors from Gaza and Zambezia provinces.' },
      { name: 'Fatima Nhantumbo', title: 'Agricultural Officer', bio: 'Tropical crop specialist in sugarcane, coconut, and emerging macadamia supply chains.' },
      { name: 'Carlos Sitoe', title: 'Finance & Operations', bio: 'Financial systems analyst experienced with Portuguese and English bilingual operations.' },
      { name: 'Graca Tembe', title: 'Community Liaison', bio: 'Rural women empowerment leader connecting farmers in Nampula and Sofala to markets.' },
    ],
  },
  {
    code: 'ZA',
    name: 'South Africa',
    flag: '\ud83c\uddff\ud83c\udde6',
    tagline: 'Continental agricultural finance hub',
    members: [
      { name: 'Sipho Ndlovu', title: 'Country Director', bio: 'Structured finance executive with deep experience in South African agricultural commodity markets.' },
      { name: 'Thandiwe Dlamini', title: 'Agricultural Officer', bio: 'Citrus and deciduous fruit value chain specialist with export market linkages.' },
      { name: 'Pieter van der Merwe', title: 'Finance & Operations', bio: 'Chartered accountant and treasury professional from the development banking sector.' },
    ],
  },
  {
    code: 'GH',
    name: 'Ghana',
    flag: '\ud83c\uddec\ud83c\udded',
    tagline: 'West Africa\'s cocoa and grain powerhouse',
    members: [
      { name: 'Kwame Asante', title: 'Country Director', bio: 'Agricultural trade negotiator with experience across ECOWAS commodity protocols.' },
      { name: 'Abena Mensah', title: 'Agricultural Officer', bio: 'Cocoa sustainability expert integrating climate-smart practices into smallholder production.' },
      { name: 'Yaw Boateng', title: 'Finance & Operations', bio: 'Development finance analyst managing agricultural credit guarantee facilities.' },
      { name: 'Esi Owusu', title: 'Community Liaison', bio: 'Cooperative governance specialist strengthening farmer-based organizations across the Ashanti region.' },
    ],
  },
  {
    code: 'UG',
    name: 'Uganda',
    flag: '\ud83c\uddfa\ud83c\uddec',
    tagline: 'Coffee, dairy, and food security leader',
    members: [
      { name: 'Ronald Mugisha', title: 'Country Director', bio: 'Former senior advisor to Uganda Coffee Development Authority with export market expertise.' },
      { name: 'Prossy Nakamya', title: 'Agricultural Officer', bio: 'Dairy and livestock specialist working with pastoral communities in the cattle corridor.' },
      { name: 'Ivan Ssempijja', title: 'Finance & Operations', bio: 'Financial systems manager experienced in warehouse receipt financing and commodity exchanges.' },
    ],
  },
];

/* ─── Avatar URL helper ─── */
function avatarUrl(name: string) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1B2A4A&color=5DB347&size=128&bold=true`;
}

/* ─── Component ─── */

export default function CountryTeams() {
  const [expandedCountry, setExpandedCountry] = useState<string | null>(null);

  function toggleCountry(code: string) {
    setExpandedCountry((prev) => (prev === code ? null : code));
  }

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <FadeInWhenVisible>
          <div className="mb-12">
            <span
              className="text-sm font-semibold uppercase tracking-wider"
              style={{ color: '#5DB347' }}
            >
              Our Teams
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-3">
              <span className="text-[#1B2A4A]">Country </span>
              <span
                style={{
                  background: 'linear-gradient(135deg, #5DB347, #8CB89C)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Leadership
              </span>
            </h2>
            <p className="text-gray-500 max-w-2xl">
              Each AFU country office is led by experienced local professionals who understand the
              agricultural landscape, regulatory environment, and farmer communities in their region.
            </p>
          </div>
        </FadeInWhenVisible>

        {/* Country Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-2">
          {COUNTRY_TEAMS.map((country, i) => (
            <FadeInWhenVisible key={country.code} delay={i * 0.05}>
              <button
                onClick={() => toggleCountry(country.code)}
                className={`w-full text-left rounded-xl p-4 border-2 transition-all duration-200 group
                  ${
                    expandedCountry === country.code
                      ? 'border-[#5DB347] bg-[#EBF7E5] shadow-md'
                      : 'border-gray-100 bg-white hover:border-[#8CB89C] hover:shadow-sm'
                  }`}
              >
                <div className="text-2xl mb-1">{country.flag}</div>
                <div className="font-semibold text-[#1B2A4A] text-sm">{country.name}</div>
                <div className="text-[11px] text-gray-500 mt-0.5 leading-tight line-clamp-2">
                  {country.tagline}
                </div>
                <div
                  className={`mt-2 text-[10px] font-medium uppercase tracking-wider ${
                    expandedCountry === country.code ? 'text-[#5DB347]' : 'text-gray-400'
                  }`}
                >
                  {expandedCountry === country.code ? 'Showing team' : `${country.members.length} members`}
                </div>
              </button>
            </FadeInWhenVisible>
          ))}
        </div>

        {/* Expanded Team Accordion */}
        <AnimatePresence mode="wait">
          {expandedCountry && (
            <motion.div
              key={expandedCountry}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="bg-[#EBF7E5] rounded-2xl p-6 md:p-8 mt-4 border border-[#5DB347]/20">
                {(() => {
                  const country = COUNTRY_TEAMS.find((c) => c.code === expandedCountry);
                  if (!country) return null;
                  return (
                    <>
                      <div className="flex items-center gap-3 mb-6">
                        <span className="text-3xl">{country.flag}</span>
                        <div>
                          <h3 className="text-xl font-bold text-[#1B2A4A]">
                            {country.name} Team
                          </h3>
                          <p className="text-sm text-gray-500">{country.tagline}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {country.members.map((member, j) => (
                          <motion.div
                            key={member.name}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: j * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                            className="bg-white rounded-xl p-5 shadow-sm border border-gray-100"
                          >
                            <div className="flex items-center gap-3 mb-3">
                              <img
                                src={avatarUrl(member.name)}
                                alt={member.name}
                                className="w-12 h-12 rounded-full"
                              />
                              <div className="min-w-0">
                                <div className="font-semibold text-[#1B2A4A] text-sm truncate">
                                  {member.name}
                                </div>
                                <div className="text-xs text-[#5DB347] font-medium">
                                  {member.title}
                                </div>
                              </div>
                            </div>
                            <p className="text-xs text-gray-500 leading-relaxed">
                              {member.bio}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    </>
                  );
                })()}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
