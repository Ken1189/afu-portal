'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const categories = [
  'All',
  'Agronomy',
  'Markets',
  'Technology',
  'Finance',
  'Success Stories',
];

const hosts = [
  {
    name: 'Tatenda Mushore',
    role: 'Head of Content, AFU',
    bio: 'Former agricultural journalist with 12 years covering African farming. Hosts the daily market update and technology episodes.',
  },
  {
    name: 'Dr. Amara Osei',
    role: 'Chief Agronomist, AFU',
    bio: 'PhD in tropical agriculture from Sokoine University. Leads the agronomy and climate episodes with deep technical expertise.',
  },
];

const featured = {
  title: 'The Future of Precision Farming in East Africa',
  episode: 'EP 87',
  category: 'Technology',
  duration: '42 min',
  date: '14 Mar 2026',
  description:
    'Eng. Amina Kibali joins us to discuss the AFU precision farming pilot programme, how satellite imagery and IoT sensors are transforming smallholder agriculture in Tanzania, and what the next three years of AgTech innovation look like for the continent. We also take listener questions on drone regulations and affordable sensor solutions.',
};

const episodes = [
  {
    title: 'Weekly Market Price Roundup: March 2026',
    episode: 'EP 86',
    category: 'Markets',
    duration: '18 min',
    date: '12 Mar 2026',
    description:
      'This week\'s maize, soybean, and sesame prices across Zimbabwe, Botswana, and Tanzania. Plus analysis of export demand trends and what they mean for planting decisions.',
  },
  {
    title: 'Fall Armyworm Alert: Early Season Management',
    episode: 'EP 85',
    category: 'Agronomy',
    duration: '24 min',
    date: '10 Mar 2026',
    description:
      'Dr. Rehema Saidi discusses early-season fall armyworm scouting, threshold levels for intervention, and the latest biocontrol options available to African farmers.',
  },
  {
    title: 'How to Access AFU Financing: A Step-by-Step Guide',
    episode: 'EP 84',
    category: 'Finance',
    duration: '28 min',
    date: '7 Mar 2026',
    description:
      'Breaking down the AFU financing application process, from crop plan submission to fund disbursement. What documents you need, typical timelines, and how to improve your approval chances.',
  },
  {
    title: 'From 2 Hectares to 20: A Smallholder Success Story',
    episode: 'EP 83',
    category: 'Success Stories',
    duration: '35 min',
    date: '5 Mar 2026',
    description:
      'Farmer Blessing Moyo from Masvingo shares how he grew his operation from subsistence to commercial scale over five years using AFU financing, training, and guaranteed offtake contracts.',
  },
  {
    title: 'Drone Technology for Crop Monitoring',
    episode: 'EP 82',
    category: 'Technology',
    duration: '30 min',
    date: '3 Mar 2026',
    description:
      'A practical overview of using drones for crop health monitoring, land mapping, and spraying. We cover costs, regulations, and service providers available in the AFU network.',
  },
  {
    title: 'Understanding Crop Insurance in Southern Africa',
    episode: 'EP 81',
    category: 'Finance',
    duration: '22 min',
    date: '28 Feb 2026',
    description:
      'Crop insurance is still underutilised across Africa. We explore available products, how premiums are calculated, and the new index-based insurance options that are making coverage affordable for smallholders.',
  },
  {
    title: 'Weather Patterns and Planting Windows: 2026 Season Outlook',
    episode: 'EP 80',
    category: 'Agronomy',
    duration: '20 min',
    date: '26 Feb 2026',
    description:
      'Meteorologist Dr. Peter Mavhura breaks down the 2026 rainfall forecast for southern and eastern Africa, optimal planting windows by region, and El Nino risk assessment for the coming season.',
  },
  {
    title: 'Exporting Fresh Produce: Standards and Opportunities',
    episode: 'EP 79',
    category: 'Markets',
    duration: '32 min',
    date: '24 Feb 2026',
    description:
      'An in-depth look at export requirements for fresh produce including blueberries, avocados, and citrus. Covering GlobalGAP certification, cold chain logistics, and key buyer markets in Europe and the Middle East.',
  },
  {
    title: 'Goat Farming as a Business: Getting Started Right',
    episode: 'EP 78',
    category: 'Agronomy',
    duration: '26 min',
    date: '21 Feb 2026',
    description:
      'Dr. Nomalanga Dube covers everything aspiring goat farmers need to know: breed selection, housing, feeding, disease management, and marketing strategies for meat and dairy goat enterprises.',
  },
  {
    title: 'Mobile Money and Digital Payments for Farmers',
    episode: 'EP 77',
    category: 'Technology',
    duration: '19 min',
    date: '19 Feb 2026',
    description:
      'How mobile money platforms are changing how African farmers transact. We discuss EcoCash, M-Pesa integration, and AFU\'s own digital payment system for input purchases and produce sales.',
  },
  {
    title: 'Building a Farm Business Plan That Attracts Investors',
    episode: 'EP 76',
    category: 'Finance',
    duration: '34 min',
    date: '17 Feb 2026',
    description:
      'A practical guide to writing a compelling farm business plan. Covers financial projections, market analysis, operational planning, and how to present your plan to lenders and investors.',
  },
  {
    title: 'Women in Agriculture: Breaking Barriers Across Africa',
    episode: 'EP 75',
    category: 'Success Stories',
    duration: '38 min',
    date: '14 Feb 2026',
    description:
      'Three women farmers share their journeys, challenges, and triumphs in a male-dominated industry. Featuring stories from Zimbabwe, Botswana, and Tanzania with practical advice for aspiring women farmers.',
  },
];

const categoryColors: Record<string, string> = {
  Agronomy: 'bg-[#EBF7E5] text-[#449933]',
  Markets: 'bg-[#EBF7E5] text-[#5DB347]',
  Technology: 'bg-[#EBF7E5] text-[#449933]',
  Finance: 'bg-amber-100 text-amber-700',
  'Success Stories': 'bg-pink-100 text-pink-700',
};

export default function PodcastsPage() {
  const [activeFilter, setActiveFilter] = useState('All');

  const filtered =
    activeFilter === 'All'
      ? episodes
      : episodes.filter((ep) => ep.category === activeFilter);

  return (
    <>
      {/* Hero */}
      <section className="bg-navy text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-block bg-[#EBF7E5] text-[#5DB347] px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            Media
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-[#6ABF4B] via-[#5DB347] to-[#8CB89C] bg-clip-text text-transparent">
            AFU Podcasts
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl leading-relaxed">
            Daily insights on African agriculture. Market updates, agronomy tips,
            technology news, financing guidance, and inspiring success stories
            from farmers across the continent.
          </p>
        </div>
      </section>

      {/* Featured Episode */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-[#5DB347] to-[#449933] bg-clip-text text-transparent">
            Latest Episode
          </h2>
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 md:p-10 shadow-lg shadow-[#5DB347]/5 border border-white/20 relative overflow-hidden">
            {/* Gradient accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#5DB347] via-[#6ABF4B] to-[#8CB89C]" />
            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* Play Button */}
              <div className="w-28 h-28 md:w-36 md:h-36 bg-gradient-to-br from-[#EBF7E5] to-white rounded-3xl flex items-center justify-center shrink-0 shadow-lg shadow-[#5DB347]/10">
                <div className="w-16 h-16 bg-gradient-to-br from-[#5DB347] to-[#449933] rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-all duration-300 shadow-lg shadow-[#5DB347]/30">
                  <svg className="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <span className="text-[#5DB347] text-sm font-bold">
                    {featured.episode}
                  </span>
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${categoryColors[featured.category]}`}>
                    {featured.category}
                  </span>
                  <span className="text-gray-400 text-sm">
                    {featured.duration}
                  </span>
                  <span className="text-gray-400 text-sm">
                    {featured.date}
                  </span>
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-[#1B2A4A] mb-3">
                  {featured.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {featured.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Episodes + Sidebar */}
      <section className="py-16 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Main Content */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-[#5DB347] to-[#449933] bg-clip-text text-transparent">
                All Episodes
              </h2>

              {/* Category Filter */}
              <div className="flex flex-wrap gap-2 mb-8">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveFilter(cat)}
                    className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                      activeFilter === cat
                        ? 'bg-gradient-to-r from-[#5DB347] to-[#449933] text-white shadow-lg shadow-[#5DB347]/25'
                        : 'bg-white/80 backdrop-blur-sm text-[#1B2A4A] hover:bg-[#EBF7E5] border border-gray-200 hover:border-[#5DB347]/30'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Episode Grid */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFilter}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.2 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  {filtered.map((ep, i) => (
                    <div
                      key={i}
                      className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg shadow-[#5DB347]/5 hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        {/* Mini Play Button */}
                        <div className="w-11 h-11 bg-gradient-to-br from-[#5DB347] to-[#449933] rounded-full flex items-center justify-center shrink-0 cursor-pointer hover:scale-110 transition-all duration-300 shadow-md shadow-[#5DB347]/20">
                          <svg
                            className="w-4 h-4 text-white ml-0.5"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 text-xs text-gray-400 mb-0.5">
                            <span className="font-bold text-[#5DB347]">
                              {ep.episode}
                            </span>
                            <span>{ep.duration}</span>
                            <span>{ep.date}</span>
                          </div>
                          <h3 className="text-sm font-bold text-[#1B2A4A] leading-snug truncate">
                            {ep.title}
                          </h3>
                        </div>
                      </div>
                      <span
                        className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full mb-3 ${
                          categoryColors[ep.category]
                        }`}
                      >
                        {ep.category}
                      </span>
                      <p className="text-gray-600 text-xs leading-relaxed">
                        {ep.description}
                      </p>
                    </div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Sidebar */}
            <aside className="lg:w-80 shrink-0 space-y-8">
              {/* Subscribe */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg shadow-[#5DB347]/5 border-l-4 border-[#5DB347]">
                <h3 className="text-lg font-bold text-[#1B2A4A] mb-4">
                  Subscribe
                </h3>
                <div className="space-y-3">
                  {[
                    { name: 'Spotify', color: 'bg-[#EBF7E5] text-[#449933] border-[#5DB347]/20' },
                    { name: 'Apple Podcasts', color: 'bg-[#EBF7E5] text-[#449933] border-[#5DB347]/20' },
                    { name: 'Google Podcasts', color: 'bg-[#EBF7E5] text-[#449933] border-[#5DB347]/20' },
                    { name: 'RSS Feed', color: 'bg-[#EBF7E5] text-[#449933] border-[#5DB347]/20' },
                  ].map((platform, i) => (
                    <button
                      key={i}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${platform.color}`}
                    >
                      <svg
                        className="w-5 h-5 shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m2.828-9.9a9 9 0 012.728-2.728"
                        />
                      </svg>
                      {platform.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hosts */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg shadow-[#5DB347]/5 border-l-4 border-[#5DB347]">
                <h3 className="text-lg font-bold text-[#1B2A4A] mb-4">
                  Your Hosts
                </h3>
                <div className="space-y-5">
                  {hosts.map((host, i) => (
                    <div key={i}>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#5DB347] to-[#449933] rounded-full flex items-center justify-center shadow-md shadow-[#5DB347]/20">
                          <span className="text-white font-bold text-sm">
                            {host.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-[#1B2A4A]">
                            {host.name}
                          </div>
                          <div className="text-xs text-gray-400">
                            {host.role}
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        {host.bio}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16" style={{ background: '#1B2A4A' }}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Never Miss an Episode
          </h2>
          <p className="text-white/80 mb-8 max-w-2xl mx-auto">
            Subscribe to the AFU Podcast for daily agricultural insights
            delivered straight to your favourite podcast app.
          </p>
          <Link
            href="/contact"
            className="inline-block bg-gradient-to-r from-[#5DB347] to-[#449933] text-white hover:shadow-lg hover:shadow-[#5DB347]/25 hover:-translate-y-1 px-8 py-3.5 rounded-full font-semibold text-lg transition-all duration-300"
          >
            Get in Touch
          </Link>
        </div>
      </section>
    </>
  );
}
