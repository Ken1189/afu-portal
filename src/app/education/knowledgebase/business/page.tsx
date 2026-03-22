'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const topics = ['All', 'Business Planning', 'Cooperatives', 'Marketing', 'Export'];

const articles = [
  {
    title: 'Writing a Farm Business Plan That Attracts Investors',
    topic: 'Business Planning',
    author: 'Ms. Nomsa Dlamini',
    date: '17 Feb 2026',
    readTime: '10 min read',
    excerpt:
      'A well-structured business plan is the foundation for accessing finance, attracting partners, and scaling your farm. This template-driven guide walks you through executive summary, market analysis, operational plan, and financial projections tailored for African agriculture.',
  },
  {
    title: 'Starting and Managing an Agricultural Cooperative',
    topic: 'Cooperatives',
    author: 'Mr. Isaac Mensah',
    date: '9 Feb 2026',
    readTime: '9 min read',
    excerpt:
      'Cooperatives give smallholders collective bargaining power, shared infrastructure, and access to markets they cannot reach alone. Learn the legal requirements, governance structures, and operational best practices for registering and running a successful agricultural cooperative.',
  },
  {
    title: 'Marketing Your Farm Products: From Local Markets to Supermarkets',
    topic: 'Marketing',
    author: 'Ms. Nomsa Dlamini',
    date: '1 Feb 2026',
    readTime: '8 min read',
    excerpt:
      'Moving beyond farmgate sales requires understanding grading standards, packaging requirements, shelf-life management, and buyer relationship building. A practical guide to marketing fresh produce, processed goods, and specialty crops in African markets.',
  },
  {
    title: 'Export Readiness: Meeting International Quality Standards',
    topic: 'Export',
    author: 'Dr. Emmanuel Okello',
    date: '22 Jan 2026',
    readTime: '11 min read',
    excerpt:
      'Exporting agricultural products to the EU, UK, and Middle East requires compliance with GlobalGAP, HACCP, phytosanitary standards, and maximum residue limits. This checklist-based guide covers certification pathways, costs, and timelines for African exporters.',
  },
  {
    title: 'Farm Record Keeping: The Foundation of Good Business',
    topic: 'Business Planning',
    author: 'Mr. Isaac Mensah',
    date: '12 Jan 2026',
    readTime: '6 min read',
    excerpt:
      'Good record keeping is the difference between farming as a livelihood and farming as a business. Learn simple systems for tracking input costs, yields, sales, and profitability using paper-based and smartphone-based tools.',
  },
  {
    title: 'Value Addition: Processing Farm Products for Higher Returns',
    topic: 'Marketing',
    author: 'Dr. Emmanuel Okello',
    date: '3 Jan 2026',
    readTime: '8 min read',
    excerpt:
      'Processing raw produce into finished goods can multiply margins by 3-5x. Explore value addition opportunities in grain milling, oil pressing, fruit drying, dairy processing, and meat preservation with equipment costs and ROI analysis.',
  },
  {
    title: 'Contract Farming: Securing Markets Before You Plant',
    topic: 'Export',
    author: 'Ms. Nomsa Dlamini',
    date: '18 Dec 2025',
    readTime: '7 min read',
    excerpt:
      'Contract farming arrangements with buyers, processors, and exporters reduce market risk and can unlock input financing. Understand different contract models, negotiation points, legal protections, and how to evaluate whether a contract is fair.',
  },
  {
    title: 'Cooperative Governance: Elections, Meetings, and Financial Oversight',
    topic: 'Cooperatives',
    author: 'Mr. Isaac Mensah',
    date: '5 Dec 2025',
    readTime: '7 min read',
    excerpt:
      'Many cooperatives fail due to poor governance rather than poor farming. Best practices for board elections, meeting procedures, financial transparency, member communication, and conflict resolution drawn from successful cooperatives across East and Southern Africa.',
  },
];

const relatedTopics = [
  'Agronomy',
  'Farm Finance',
  'Agricultural Technology',
  'Climate Adaptation',
  'Animal Husbandry',
];

const popularArticles = [
  'Farm Business Plan Guide',
  'Starting a Cooperative',
  'Export Readiness Checklist',
  'Value Addition Opportunities',
];

const topicColors: Record<string, string> = {
  'Business Planning': 'bg-emerald-100 text-emerald-700',
  Cooperatives: 'bg-blue-100 text-blue-700',
  Marketing: 'bg-amber-100 text-amber-700',
  Export: 'bg-purple-100 text-purple-700',
};

export default function BusinessPage() {
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
            <span className="text-[#5DB347]">Business</span>
          </nav>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Business Management</h1>
          <p className="text-xl text-gray-300 max-w-3xl leading-relaxed">
            Farm business planning, cooperative management, marketing strategies, export readiness, and value chain development for African agricultural enterprises.
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
                    placeholder="Search business articles..."
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
                  Can&apos;t find what you need? Our AI-powered assistant can answer your farm business questions.
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
