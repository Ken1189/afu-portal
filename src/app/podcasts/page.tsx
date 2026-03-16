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
  Agronomy: 'bg-emerald-100 text-emerald-700',
  Markets: 'bg-blue-100 text-blue-700',
  Technology: 'bg-purple-100 text-purple-700',
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
          <div className="inline-block bg-teal/20 text-teal px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            Media
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">AFU Podcasts</h1>
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
          <h2 className="text-2xl font-bold text-navy mb-6">Latest Episode</h2>
          <div className="bg-gradient-to-r from-navy to-navy-light rounded-2xl p-8 md:p-10 text-white">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* Play Button Placeholder */}
              <div className="w-24 h-24 md:w-32 md:h-32 bg-teal/20 rounded-2xl flex items-center justify-center shrink-0">
                <div className="w-14 h-14 bg-teal rounded-full flex items-center justify-center cursor-pointer hover:bg-teal-dark transition-colors">
                  <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <span className="text-teal text-sm font-bold">
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
                <h3 className="text-xl md:text-2xl font-bold mb-3">
                  {featured.title}
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed">
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
              <h2 className="text-2xl font-bold text-navy mb-6">
                All Episodes
              </h2>

              {/* Category Filter */}
              <div className="flex flex-wrap gap-2 mb-8">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveFilter(cat)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      activeFilter === cat
                        ? 'bg-teal text-white'
                        : 'bg-white text-navy hover:bg-teal-light border border-gray-200'
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
                      className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        {/* Mini Play Button */}
                        <div className="w-10 h-10 bg-teal/10 rounded-full flex items-center justify-center shrink-0 cursor-pointer hover:bg-teal/20 transition-colors">
                          <svg
                            className="w-4 h-4 text-teal ml-0.5"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 text-xs text-gray-400 mb-0.5">
                            <span className="font-bold text-teal">
                              {ep.episode}
                            </span>
                            <span>{ep.duration}</span>
                            <span>{ep.date}</span>
                          </div>
                          <h3 className="text-sm font-bold text-navy leading-snug truncate">
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
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <h3 className="text-lg font-bold text-navy mb-4">
                  Subscribe
                </h3>
                <div className="space-y-3">
                  {[
                    { name: 'Spotify', color: 'bg-green-50 text-green-700 border-green-200' },
                    { name: 'Apple Podcasts', color: 'bg-purple-50 text-purple-700 border-purple-200' },
                    { name: 'Google Podcasts', color: 'bg-blue-50 text-blue-700 border-blue-200' },
                    { name: 'RSS Feed', color: 'bg-orange-50 text-orange-700 border-orange-200' },
                  ].map((platform, i) => (
                    <button
                      key={i}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-colors hover:shadow-sm ${platform.color}`}
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
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <h3 className="text-lg font-bold text-navy mb-4">
                  Your Hosts
                </h3>
                <div className="space-y-5">
                  {hosts.map((host, i) => (
                    <div key={i}>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-teal/10 rounded-full flex items-center justify-center">
                          <span className="text-teal font-bold text-sm">
                            {host.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-navy">
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
      <section className="py-16 bg-teal">
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
            className="inline-block bg-white text-teal hover:bg-gray-100 px-8 py-3.5 rounded-lg font-semibold text-lg transition-colors"
          >
            Get in Touch
          </Link>
        </div>
      </section>
    </>
  );
}
