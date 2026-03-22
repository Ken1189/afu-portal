'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const topics = ['All', 'Adaptation', 'Carbon Markets', 'Water Management', 'Sustainable Practices'];

const articles = [
  {
    title: 'Climate-Smart Agriculture: A Framework for African Smallholders',
    topic: 'Adaptation',
    author: 'Dr. Wanjiku Maina',
    date: '20 Feb 2026',
    readTime: '10 min read',
    excerpt:
      'Climate-smart agriculture (CSA) integrates productivity, resilience, and emissions reduction into a single approach. Learn the three pillars of CSA and how to implement practical strategies on farms from 0.5 to 50 hectares across different agro-ecological zones.',
  },
  {
    title: 'Carbon Credit Markets for African Farmers: Earning from Sustainability',
    topic: 'Carbon Markets',
    author: 'Mr. Kwame Asante',
    date: '12 Feb 2026',
    readTime: '9 min read',
    excerpt:
      'Carbon credit programmes offer new revenue streams for farmers who adopt sustainable practices. This guide explains verification standards (Verra, Gold Standard), aggregation models for smallholders, and current carbon prices for different practices.',
  },
  {
    title: 'Drought-Resistant Crop Varieties: What Works in Southern Africa',
    topic: 'Adaptation',
    author: 'Dr. Wanjiku Maina',
    date: '5 Feb 2026',
    readTime: '8 min read',
    excerpt:
      'As rainfall becomes more erratic, drought-tolerant varieties are essential for food security. Compare performance data for drought-resistant maize, sorghum, millet, and cowpea varieties developed by CIMMYT and ICRISAT for African conditions.',
  },
  {
    title: 'Rainwater Harvesting Systems for Dryland Farming',
    topic: 'Water Management',
    author: 'Eng. Chipo Banda',
    date: '25 Jan 2026',
    readTime: '7 min read',
    excerpt:
      'Capturing and storing rainwater can extend the growing season by weeks. Explore rooftop harvesting, contour bunds, zai pits, half-moon structures, and underground cistern designs proven effective across the Sahel and Southern Africa.',
  },
  {
    title: 'Conservation Agriculture: Minimum Tillage for Maximum Returns',
    topic: 'Sustainable Practices',
    author: 'Dr. Wanjiku Maina',
    date: '15 Jan 2026',
    readTime: '8 min read',
    excerpt:
      'Conservation agriculture combines minimum soil disturbance, permanent soil cover, and crop rotation to build resilience. Review the evidence from 15 years of trials across Zambia, Zimbabwe, and Malawi showing yield improvements of 20-30%.',
  },
  {
    title: 'Agroforestry Systems: Trees as Climate Insurance on the Farm',
    topic: 'Sustainable Practices',
    author: 'Mr. Kwame Asante',
    date: '5 Jan 2026',
    readTime: '9 min read',
    excerpt:
      'Integrating trees into farming systems provides shade, windbreaks, nitrogen fixation, and diversified income. Learn about Faidherbia albida, Gliricidia, and moringa-based agroforestry models generating both carbon credits and cash income.',
  },
  {
    title: 'Flood Risk Management for Lowland Farms',
    topic: 'Water Management',
    author: 'Eng. Chipo Banda',
    date: '20 Dec 2025',
    readTime: '7 min read',
    excerpt:
      'Flooding destroys crops and erodes topsoil in river valley farming zones. Practical approaches to raised bed cultivation, drainage channels, flood-tolerant rice varieties, and early warning systems using community-based river monitoring.',
  },
  {
    title: 'Soil Carbon Sequestration: Farming Practices That Store Carbon',
    topic: 'Carbon Markets',
    author: 'Mr. Kwame Asante',
    date: '10 Dec 2025',
    readTime: '8 min read',
    excerpt:
      'Healthy soils are the largest terrestrial carbon sink. Cover cropping, composting, biochar application, and rotational grazing can increase soil organic carbon by 0.4% annually. Understand the science and the revenue potential.',
  },
];

const relatedTopics = [
  'Agronomy',
  'Agricultural Technology',
  'Farm Finance',
  'Business Management',
  'Animal Husbandry',
];

const popularArticles = [
  'Climate-Smart Agriculture Framework',
  'Carbon Credit Markets Guide',
  'Drought-Resistant Varieties',
  'Rainwater Harvesting Systems',
];

const topicColors: Record<string, string> = {
  Adaptation: 'bg-emerald-100 text-emerald-700',
  'Carbon Markets': 'bg-purple-100 text-purple-700',
  'Water Management': 'bg-blue-100 text-blue-700',
  'Sustainable Practices': 'bg-amber-100 text-amber-700',
};

export default function ClimatePage() {
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
            <span className="text-[#5DB347]">Climate</span>
          </nav>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Climate & Sustainability</h1>
          <p className="text-xl text-gray-300 max-w-3xl leading-relaxed">
            Climate-smart agriculture, weather adaptation strategies, carbon markets, water management, and sustainable farming practices for a changing African climate.
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
                    placeholder="Search climate articles..."
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
                  Can&apos;t find what you need? Our AI-powered assistant can answer your climate and sustainability questions.
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
