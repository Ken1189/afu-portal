'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const topics = ['All', 'Credit & Loans', 'Budgeting', 'Insurance', 'Investment'];

const articles = [
  {
    title: 'Understanding Agricultural Loan Products: A Farmer\'s Guide',
    topic: 'Credit & Loans',
    author: 'Mr. Blessing Moyo',
    date: '18 Feb 2026',
    readTime: '9 min read',
    excerpt:
      'Navigate the landscape of agricultural finance products available to African smallholders. From input finance and seasonal loans to asset-backed lending, learn which products suit your farm size, crop cycle, and repayment capacity.',
  },
  {
    title: 'Farm Budgeting 101: Planning Your Season for Profit',
    topic: 'Budgeting',
    author: 'Ms. Amina Juma',
    date: '10 Feb 2026',
    readTime: '7 min read',
    excerpt:
      'A step-by-step guide to building a seasonal farm budget. Covers input cost estimation, labor planning, yield projections, revenue forecasting, and the break-even analysis every farmer needs before planting.',
  },
  {
    title: 'Crop Insurance Explained: Protecting Your Harvest and Income',
    topic: 'Insurance',
    author: 'Dr. Farai Mutasa',
    date: '1 Feb 2026',
    readTime: '8 min read',
    excerpt:
      'Crop insurance can be the difference between recovery and ruin after a bad season. This guide covers index-based weather insurance, area-yield policies, and multi-peril coverage options available across AFU markets.',
  },
  {
    title: 'Mobile Money for Farmers: Digital Payments and Savings',
    topic: 'Budgeting',
    author: 'Mr. Samuel Ochieng',
    date: '22 Jan 2026',
    readTime: '6 min read',
    excerpt:
      'Mobile money has transformed rural finance across Africa. Learn how to use M-Pesa, MTN MoMo, and Airtel Money for input purchases, savings groups, loan repayments, and receiving market payments securely.',
  },
  {
    title: 'Building a Farm Investment Plan: From Subsistence to Commercial',
    topic: 'Investment',
    author: 'Dr. Farai Mutasa',
    date: '12 Jan 2026',
    readTime: '11 min read',
    excerpt:
      'Transitioning from subsistence to commercial farming requires strategic investment. Learn how to prioritise capital expenditure, phase equipment purchases, and build a bankable business plan that attracts financing.',
  },
  {
    title: 'Interest Rates and Loan Terms: What Every Farmer Should Know',
    topic: 'Credit & Loans',
    author: 'Mr. Blessing Moyo',
    date: '5 Jan 2026',
    readTime: '7 min read',
    excerpt:
      'Understanding interest rates, grace periods, collateral requirements, and repayment schedules is critical before signing a loan. This guide demystifies agricultural lending terms and helps you compare products effectively.',
  },
  {
    title: 'Cooperative Savings and Lending: Pooling Resources for Growth',
    topic: 'Investment',
    author: 'Ms. Amina Juma',
    date: '18 Dec 2025',
    readTime: '8 min read',
    excerpt:
      'Agricultural cooperatives can access better loan terms, bulk input pricing, and shared equipment through pooled savings. Learn how village savings and loan associations (VSLAs) operate and how to start one in your community.',
  },
  {
    title: 'Livestock Insurance: Covering Your Most Valuable Assets',
    topic: 'Insurance',
    author: 'Dr. Farai Mutasa',
    date: '5 Dec 2025',
    readTime: '6 min read',
    excerpt:
      'Livestock represents a significant capital investment for many African farmers. Explore insurance options for cattle, goats, and poultry, including ear-tag-based coverage and satellite-monitored pasture insurance.',
  },
];

const relatedTopics = [
  'Agronomy',
  'Animal Husbandry',
  'Business Management',
  'Agricultural Technology',
  'Climate Adaptation',
];

const popularArticles = [
  'Agricultural Loan Products Guide',
  'Farm Budgeting 101',
  'Crop Insurance Explained',
  'Mobile Money for Farmers',
];

const topicColors: Record<string, string> = {
  'Credit & Loans': 'bg-emerald-100 text-emerald-700',
  Budgeting: 'bg-blue-100 text-blue-700',
  Insurance: 'bg-amber-100 text-amber-700',
  Investment: 'bg-purple-100 text-purple-700',
};

export default function FinancePage() {
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
          <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
            <Link href="/education/knowledgebase" className="hover:text-[#5DB347] transition-colors">
              Knowledgebase
            </Link>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-[#5DB347]">Finance</span>
          </nav>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Agricultural Finance</h1>
          <p className="text-xl text-gray-300 max-w-3xl leading-relaxed">
            Practical guides on farm financial management, credit products, insurance, budgeting, and investment planning. Helping African farmers build bankable operations.
          </p>
        </div>
      </section>

      {/* Content Area */}
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
                    placeholder="Search finance articles..."
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
                  Can&apos;t find what you need? Our AI-powered assistant can answer your agricultural finance questions.
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
