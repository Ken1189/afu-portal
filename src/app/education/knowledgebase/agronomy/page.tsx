'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const topics = ['All', 'Crop Science', 'Soil', 'Irrigation', 'Pest Control'];

const articles = [
  {
    title: 'Maize Cultivation Best Practices for Southern Africa',
    topic: 'Crop Science',
    author: 'Dr. Tendai Moyo',
    date: '12 Feb 2026',
    readTime: '8 min read',
    excerpt:
      'A comprehensive guide to maize cultivation in southern African conditions, covering variety selection, planting density, fertilisation schedules, and harvest timing. Based on five years of field trial data from Zimbabwe and Botswana.',
  },
  {
    title: 'Understanding and Managing Soil pH for Optimal Crop Performance',
    topic: 'Soil',
    author: 'Dr. Kelebogile Phatudi',
    date: '5 Feb 2026',
    readTime: '6 min read',
    excerpt:
      'Soil pH is one of the most critical yet overlooked factors in crop productivity. Learn how to test, interpret, and adjust your soil pH using locally available amendments such as agricultural lime, gypsum, and organic compost.',
  },
  {
    title: 'Setting Up Drip Irrigation: A Step-by-Step Guide for Smallholders',
    topic: 'Irrigation',
    author: 'Eng. Joseph Mwakasege',
    date: '28 Jan 2026',
    readTime: '12 min read',
    excerpt:
      'Drip irrigation can reduce water use by 60% while improving crop yields. This guide walks you through system design, component selection, installation, and maintenance for farms of 0.5 to 5 hectares using affordable, locally sourced materials.',
  },
  {
    title: 'Fall Armyworm Integrated Pest Management: A Field Guide',
    topic: 'Pest Control',
    author: 'Dr. Rehema Saidi',
    date: '15 Jan 2026',
    readTime: '9 min read',
    excerpt:
      'Fall armyworm has devastated maize crops across sub-Saharan Africa since 2016. This integrated pest management guide combines cultural controls, biological agents, and targeted chemical use to protect your harvest while minimising environmental impact.',
  },
  {
    title: 'Crop Rotation Systems for Sustained Soil Fertility',
    topic: 'Soil',
    author: 'Dr. Kelebogile Phatudi',
    date: '8 Jan 2026',
    readTime: '7 min read',
    excerpt:
      'Proper crop rotation can break pest cycles, fix nitrogen naturally, and improve soil structure over time. Explore proven three-year and four-year rotation systems designed for common African cropping patterns including maize, groundnuts, and sorghum.',
  },
  {
    title: 'Making Organic Fertiliser on the Farm: Compost, Manure, and Green Manures',
    topic: 'Soil',
    author: 'Ms. Grace Ndlovu',
    date: '20 Dec 2025',
    readTime: '10 min read',
    excerpt:
      'Reduce your input costs and improve long-term soil health by producing your own organic fertilisers. Step-by-step instructions for hot composting, vermicomposting, liquid manure preparation, and integrating green manure crops into your rotation.',
  },
  {
    title: 'Seed Selection Guide: Choosing the Right Varieties for Your Region',
    topic: 'Crop Science',
    author: 'Dr. Tendai Moyo',
    date: '10 Dec 2025',
    readTime: '8 min read',
    excerpt:
      'Selecting the right seed variety is the single most impactful decision a farmer makes each season. This guide covers maturity groups, disease resistance ratings, yield potential data, and recommended varieties for each agro-ecological zone in Zimbabwe, Botswana, and Tanzania.',
  },
  {
    title: 'Intercropping Benefits: Maximising Yields and Reducing Risk',
    topic: 'Crop Science',
    author: 'Dr. Rehema Saidi',
    date: '1 Dec 2025',
    readTime: '6 min read',
    excerpt:
      'Intercropping maize with legumes can increase total land productivity by 20-40% while providing natural pest suppression and nitrogen fixation. Learn the optimal spatial arrangements, timing, and compatible crop pairings backed by East African research data.',
  },
];

const relatedTopics = [
  'Animal Husbandry',
  'Climate Adaptation',
  'Farm Finance',
  'Agricultural Technology',
  'Post-Harvest Management',
];

const popularArticles = [
  'Maize Cultivation Best Practices',
  'Fall Armyworm IPM Guide',
  'Drip Irrigation Setup',
  'Seed Selection Guide',
];

const topicColors: Record<string, string> = {
  'Crop Science': 'bg-emerald-100 text-emerald-700',
  Soil: 'bg-amber-100 text-amber-700',
  Irrigation: 'bg-blue-100 text-blue-700',
  'Pest Control': 'bg-red-100 text-red-700',
};

export default function AgronomyPage() {
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
      {/* Hero with Breadcrumb */}
      <section className="bg-navy text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
            <Link href="/education/knowledgebase" className="hover:text-[#5DB347] transition-colors">
              Knowledgebase
            </Link>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-[#5DB347]">Agronomy</span>
          </nav>

          <h1 className="text-4xl md:text-5xl font-bold mb-6">Agronomy</h1>
          <p className="text-xl text-gray-300 max-w-3xl leading-relaxed">
            Practical guides and research summaries on crop science, soil
            management, irrigation, and pest control. Written by agricultural
            experts and reviewed for accuracy.
          </p>
        </div>
      </section>

      {/* Content Area */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Main Content */}
            <div className="flex-1">
              {/* Search + Filter */}
              <div className="mb-8 space-y-4">
                <div className="relative">
                  <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search agronomy articles..."
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

              {/* Article Cards */}
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
                      No articles match your search. Try different keywords or
                      clear the filters.
                    </div>
                  )}
                  {filtered.map((article, i) => (
                    <div
                      key={i}
                      className="bg-cream rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <h3 className="text-lg font-bold text-navy leading-snug">
                          {article.title}
                        </h3>
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${
                            topicColors[article.topic]
                          }`}
                        >
                          {article.topic}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-gray-400 mb-3">
                        <span>{article.author}</span>
                        <span>{article.date}</span>
                        <span>{article.readTime}</span>
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed mb-4">
                        {article.excerpt}
                      </p>
                      <button className="text-[#5DB347] text-sm font-semibold hover:text-[#449933] transition-colors">
                        Read More &rarr;
                      </button>
                    </div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Sidebar */}
            <aside className="lg:w-80 shrink-0 space-y-8">
              {/* Related Topics */}
              <div className="bg-cream rounded-2xl p-6 border border-gray-100">
                <h3 className="text-lg font-bold text-navy mb-4">
                  Related Topics
                </h3>
                <div className="space-y-2">
                  {relatedTopics.map((topic, i) => (
                    <Link
                      key={i}
                      href="/education/knowledgebase"
                      className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#5DB347] transition-colors py-1"
                    >
                      <svg
                        className="w-4 h-4 text-[#5DB347] shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                      {topic}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Popular Articles */}
              <div className="bg-cream rounded-2xl p-6 border border-gray-100">
                <h3 className="text-lg font-bold text-navy mb-4">
                  Popular Articles
                </h3>
                <div className="space-y-3">
                  {popularArticles.map((title, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 text-sm text-gray-600 hover:text-[#5DB347] transition-colors cursor-pointer"
                    >
                      <span className="w-6 h-6 bg-[#5DB347]/10 text-[#5DB347] rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                        {i + 1}
                      </span>
                      {title}
                    </div>
                  ))}
                </div>
              </div>

              {/* Ask AI CTA */}
              <div className="bg-navy rounded-2xl p-6 text-white">
                <h3 className="text-lg font-bold mb-3">Ask AI Assistant</h3>
                <p className="text-gray-300 text-sm mb-5 leading-relaxed">
                  Can&apos;t find what you need? Our AI-powered assistant can
                  answer your agronomy questions based on our research database.
                </p>
                <Link
                  href="/contact"
                  className="inline-block bg-[#5DB347] hover:bg-[#449933] text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors w-full text-center"
                >
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
