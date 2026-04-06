'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';

const categories = [
  {
    title: 'Agronomy',
    desc: 'Crop science, soil management, irrigation techniques, and integrated pest control strategies for African farming conditions.',
    articles: 0,
    link: '/education/knowledgebase/agronomy',
    icon: 'M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25',
  },
  {
    title: 'Animal Husbandry',
    desc: 'Livestock management, veterinary care, breeding programmes, and animal nutrition for cattle, goats, poultry, and more.',
    articles: 0,
    link: '/education/knowledgebase/animal',
    icon: 'M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418',
  },
  {
    title: 'Finance',
    desc: 'Farm financial management, market analysis, access to credit, budgeting, and investment planning for agricultural enterprises.',
    articles: 0,
    link: '/education/knowledgebase/finance',
    icon: 'M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z',
  },
  {
    title: 'Technology',
    desc: 'AgTech innovations, precision farming, drone applications, farm management software, and digital extension services.',
    articles: 0,
    link: '/education/knowledgebase/technology',
    icon: 'M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5',
  },
  {
    title: 'Climate',
    desc: 'Climate-smart agriculture, weather adaptation strategies, carbon markets, and sustainable farming practices for a changing climate.',
    articles: 0,
    link: '/education/knowledgebase/climate',
    icon: 'M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z',
  },
  {
    title: 'Business',
    desc: 'Farm business planning, cooperative management, marketing strategies, export readiness, and value chain development.',
    articles: 0,
    link: '/education/knowledgebase/business',
    icon: 'M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21',
  },
];

const featuredArticles = [
  {
    title: 'A Comprehensive Guide to Drought-Resistant Maize Varieties in Southern Africa',
    author: 'Dr. Tendai Moyo',
    date: '12 Feb 2026',
    readTime: '8 min read',
    category: 'Agronomy',
  },
  {
    title: 'Understanding Soil pH: Why It Matters and How to Manage It',
    author: 'Dr. Kelebogile Phatudi',
    date: '5 Feb 2026',
    readTime: '6 min read',
    category: 'Agronomy',
  },
  {
    title: 'Getting Started with Precision Farming: A Smallholder Guide',
    author: 'Eng. Amina Kibali',
    date: '28 Jan 2026',
    readTime: '10 min read',
    category: 'Technology',
  },
  {
    title: 'Cattle Feeding Programmes for Optimal Weight Gain in Semi-Arid Regions',
    author: 'Dr. Farai Chikwanha',
    date: '20 Jan 2026',
    readTime: '7 min read',
    category: 'Animal Husbandry',
  },
];

const popularTopics = [
  'Maize Cultivation',
  'Drip Irrigation',
  'Soil Testing',
  'Cattle Breeds',
  'Pest Control',
  'Organic Farming',
  'Market Prices',
  'Crop Insurance',
  'Goat Farming',
  'Water Harvesting',
  'Seed Selection',
  'Climate Adaptation',
  'Farm Finance',
  'Poultry Management',
  'Carbon Credits',
  'Export Standards',
  'Crop Rotation',
  'Dairy Production',
];

export default function KnowledgebasePage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategories = searchQuery
    ? categories.filter(
        (c) =>
          c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.desc.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : categories;

  return (
    <>
      {/* Hero with Search */}
      <section className="bg-navy text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-block bg-[#5DB347]/20 text-[#5DB347] px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            Education
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white via-[#5DB347] to-[#6ABF4B] bg-clip-text text-transparent">
            Agricultural Knowledgebase
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl leading-relaxed mb-8">
            Over 1,000 expert-reviewed articles covering every aspect of African
            agriculture. Find practical guides, research summaries, and best
            practices to improve your farming operation.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl">
            <div className="relative">
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
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
                placeholder="Search articles, topics, or keywords..."
                className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5DB347] focus:border-transparent text-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Category Cards */}
      <section className="py-16 bg-[#EBF7E5]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-[#1B2A4A] mb-10">
            Browse by Category
          </h2>
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredCategories.map((cat, i) => (
              <motion.div
                key={cat.title}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  href={cat.link}
                  className="block bg-white/80 backdrop-blur-sm rounded-3xl p-8 border-l-4 border-[#5DB347] shadow-lg shadow-[#5DB347]/5 hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#5DB347] to-[#449933] rounded-xl flex items-center justify-center shadow-md">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d={cat.icon}
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#1B2A4A]">
                        {cat.title}
                      </h3>
                      <span className="text-xs text-[#5DB347] font-medium">
                        {cat.articles > 0 ? `${cat.articles} articles` : 'Coming Soon'}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {cat.desc}
                  </p>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Articles */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-[#1B2A4A] mb-10">
            Featured Articles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredArticles.map((article, i) => (
              <div
                key={i}
                className="bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden border border-gray-100 shadow-lg shadow-[#5DB347]/5 hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
              >
                {/* Thumbnail Placeholder */}
                <div className="h-40 bg-gradient-to-br from-[#5DB347]/20 to-[#1B2A4A]/20 flex items-center justify-center">
                  <svg
                    className="w-12 h-12 text-[#5DB347]/40"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                    />
                  </svg>
                </div>
                <div className="p-5">
                  <span className="inline-block bg-[#EBF7E5] text-[#5DB347] text-xs font-medium px-2.5 py-0.5 rounded-full mb-3">
                    {article.category}
                  </span>
                  <h3 className="text-sm font-bold text-[#1B2A4A] mb-3 leading-snug line-clamp-2">
                    {article.title}
                  </h3>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{article.author}</span>
                    <span>{article.readTime}</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {article.date}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Topics */}
      <section className="py-16 bg-[#EBF7E5]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-[#1B2A4A] mb-10">
            Popular Topics
          </h2>
          <div className="flex flex-wrap gap-3">
            {popularTopics.map((topic, i) => (
              <span
                key={i}
                className="bg-white/80 backdrop-blur-sm text-[#1B2A4A] text-sm font-medium px-4 py-2 rounded-full border border-[#5DB347]/20 hover:border-[#5DB347] hover:text-[#5DB347] hover:shadow-md transition-all duration-300 cursor-pointer"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-[#5DB347] to-[#449933]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Can&apos;t Find What You&apos;re Looking For?
          </h2>
          <p className="text-white/80 mb-8 max-w-2xl mx-auto">
            Our knowledge base is continuously growing. If you have a question
            that is not covered, reach out to our agricultural experts or try our
            AI-powered assistant.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/contact"
              className="inline-block bg-white text-[#5DB347] hover:bg-gray-100 hover:scale-105 px-8 py-3.5 rounded-xl font-semibold text-lg transition-all duration-300"
            >
              Ask an Expert
            </Link>
            <Link
              href="/education"
              className="inline-block border-2 border-white text-white hover:bg-white/10 px-8 py-3.5 rounded-xl font-semibold text-lg transition-all duration-300"
            >
              Back to Education Hub
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
