'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const topics = ['All', 'Precision Farming', 'Drones', 'Software', 'IoT & Sensors'];

const articles = [
  {
    title: 'Getting Started with Precision Agriculture on a Smallholder Budget',
    topic: 'Precision Farming',
    author: 'Eng. David Kamau',
    date: '15 Feb 2026',
    readTime: '10 min read',
    excerpt:
      'Precision agriculture is no longer reserved for large commercial operations. Learn how African smallholders can leverage GPS-guided planting, variable-rate fertilisation, and soil mapping using affordable smartphone-based tools and satellite imagery.',
  },
  {
    title: 'Drone Applications in African Agriculture: From Scouting to Spraying',
    topic: 'Drones',
    author: 'Dr. Patience Okafor',
    date: '8 Feb 2026',
    readTime: '9 min read',
    excerpt:
      'Agricultural drones can cover 10 hectares per hour for crop scouting and pesticide application. This guide covers drone regulations across AFU countries, recommended models, ROI calculations, and practical deployment workflows.',
  },
  {
    title: 'Farm Management Software: Choosing the Right Platform',
    topic: 'Software',
    author: 'Mr. Thabo Molefe',
    date: '30 Jan 2026',
    readTime: '7 min read',
    excerpt:
      'Digital farm management platforms help track inputs, monitor crop growth, manage finances, and coordinate labour. Compare the top solutions available in Africa, from FarmForce to AgroStar, with offline-first capabilities.',
  },
  {
    title: 'Soil Moisture Sensors: A Practical Guide to Smart Irrigation',
    topic: 'IoT & Sensors',
    author: 'Eng. David Kamau',
    date: '20 Jan 2026',
    readTime: '8 min read',
    excerpt:
      'Soil moisture sensors eliminate guesswork in irrigation scheduling. Learn how to install capacitive and tensiometer-based sensors, interpret readings, and connect them to automated drip systems for water savings of up to 40%.',
  },
  {
    title: 'Satellite Crop Monitoring: Free Tools Every Farmer Should Know',
    topic: 'Precision Farming',
    author: 'Dr. Patience Okafor',
    date: '10 Jan 2026',
    readTime: '6 min read',
    excerpt:
      'Free satellite imagery from Sentinel-2 and Landsat can reveal crop health, water stress, and growth variability across your fields. Learn how to access NDVI maps through free platforms like PlantVillage Nuru and Cropin.',
  },
  {
    title: 'Weather Stations for Farms: Hyper-Local Forecasting on a Budget',
    topic: 'IoT & Sensors',
    author: 'Mr. Thabo Molefe',
    date: '28 Dec 2025',
    readTime: '7 min read',
    excerpt:
      'National weather forecasts lack the precision farmers need. Learn how affordable weather stations from Davis, Ambient, and local African manufacturers can provide field-level temperature, humidity, wind, and rainfall data.',
  },
  {
    title: 'Blockchain for Agricultural Supply Chains: Traceability and Trust',
    topic: 'Software',
    author: 'Dr. Patience Okafor',
    date: '15 Dec 2025',
    readTime: '9 min read',
    excerpt:
      'Blockchain-based traceability is becoming a requirement for premium export markets. Understand how distributed ledger technology can verify provenance, reduce fraud, and connect smallholders directly to international buyers.',
  },
  {
    title: 'Solar-Powered Irrigation: Off-Grid Solutions for Remote Farms',
    topic: 'IoT & Sensors',
    author: 'Eng. David Kamau',
    date: '5 Dec 2025',
    readTime: '8 min read',
    excerpt:
      'Solar-powered pumps and irrigation controllers enable productive farming in areas without grid electricity. Compare system sizes, pump capacities, battery requirements, and payback periods for typical African smallholder operations.',
  },
];

const relatedTopics = [
  'Agronomy',
  'Climate Adaptation',
  'Farm Finance',
  'Business Management',
  'Animal Husbandry',
];

const popularArticles = [
  'Precision Agriculture on a Budget',
  'Drone Applications in Agriculture',
  'Satellite Crop Monitoring',
  'Solar-Powered Irrigation',
];

const topicColors: Record<string, string> = {
  'Precision Farming': 'bg-emerald-100 text-emerald-700',
  Drones: 'bg-blue-100 text-blue-700',
  Software: 'bg-purple-100 text-purple-700',
  'IoT & Sensors': 'bg-amber-100 text-amber-700',
};

export default function TechnologyPage() {
  const [activeTopic, setActiveTopic] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = articles.filter((article) => {
    const matchesTopic =
      activeTopic === 'All' || article.topic === activeTopic;
    const matchesSearch =
      !searchQuery ||
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTopic && matchesSearch;
  });

  return (
    <>
      <section className="bg-navy text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
            <Link href="/education/knowledgebase" className="hover:text-[#5DB347] transition-colors">
              Knowledgebase
            </Link>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-[#5DB347]">Technology</span>
          </nav>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Agricultural Technology</h1>
          <p className="text-xl text-gray-300 max-w-3xl leading-relaxed">
            Explore AgTech innovations, precision farming tools, drone applications, farm management software, and IoT solutions transforming African agriculture.
          </p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-12">
            <div className="flex-1">
              <div className="mb-8 space-y-4">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search technology articles..."
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5DB347] focus:border-transparent"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {topics.map((topic) => (
                    <button
                      key={topic}
                      onClick={() => setActiveTopic(topic)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        activeTopic === topic
                          ? 'bg-[#5DB347] text-white'
                          : 'bg-cream text-navy hover:bg-[#EBF7E5]'
                      }`}
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTopic + searchQuery}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  {filtered.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      No articles match your search. Try different keywords or clear the filters.
                    </div>
                  )}
                  {filtered.map((article, i) => (
                    <div key={i} className="bg-cream rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <h3 className="text-lg font-bold text-navy leading-snug">{article.title}</h3>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${topicColors[article.topic]}`}>
                          {article.topic}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-gray-400 mb-3">
                        <span>{article.author}</span>
                        <span>{article.date}</span>
                        <span>{article.readTime}</span>
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed mb-4">{article.excerpt}</p>
                      <button className="text-[#5DB347] text-sm font-semibold hover:text-[#449933] transition-colors">
                        Read More &rarr;
                      </button>
                    </div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>

            <aside className="lg:w-80 shrink-0 space-y-8">
              <div className="bg-cream rounded-2xl p-6 border border-gray-100">
                <h3 className="text-lg font-bold text-navy mb-4">Related Topics</h3>
                <div className="space-y-2">
                  {relatedTopics.map((topic, i) => (
                    <Link key={i} href="/education/knowledgebase" className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#5DB347] transition-colors py-1">
                      <svg className="w-4 h-4 text-[#5DB347] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      {topic}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="bg-cream rounded-2xl p-6 border border-gray-100">
                <h3 className="text-lg font-bold text-navy mb-4">Popular Articles</h3>
                <div className="space-y-3">
                  {popularArticles.map((title, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm text-gray-600 hover:text-[#5DB347] transition-colors cursor-pointer">
                      <span className="w-6 h-6 bg-[#5DB347]/10 text-[#5DB347] rounded-full flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                      {title}
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-navy rounded-2xl p-6 text-white">
                <h3 className="text-lg font-bold mb-3">Ask AI Assistant</h3>
                <p className="text-gray-300 text-sm mb-5 leading-relaxed">
                  Can&apos;t find what you need? Our AI-powered assistant can answer your AgTech questions.
                </p>
                <Link href="/contact" className="inline-block bg-[#5DB347] hover:bg-[#449933] text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors w-full text-center">
                  Ask a Question
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
