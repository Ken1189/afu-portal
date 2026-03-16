'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const topics = ['All', 'Cattle Management', 'Goat Farming', 'Poultry', 'Veterinary Care'];

const articles = [
  {
    title: 'Cattle Feeding Programmes for Optimal Weight Gain in Semi-Arid Regions',
    topic: 'Cattle Management',
    author: 'Dr. Farai Chikwanha',
    date: '10 Feb 2026',
    readTime: '7 min read',
    excerpt:
      'Designing an effective feeding programme is essential for profitable cattle production in water-scarce areas. This guide covers seasonal feed planning, supplementary feeding strategies, mineral requirements, and cost-effective feed formulation using locally available ingredients.',
  },
  {
    title: 'Goat Breed Selection for Southern African Smallholders',
    topic: 'Goat Farming',
    author: 'Dr. Nomalanga Dube',
    date: '3 Feb 2026',
    readTime: '6 min read',
    excerpt:
      'Choosing the right goat breed can make the difference between a thriving enterprise and a struggling one. Compare the characteristics, productivity, and adaptability of Boer, Kalahari Red, Savanna, and indigenous breeds for meat and dairy production across different agro-ecological zones.',
  },
  {
    title: 'Poultry Housing Design: Ventilation, Space, and Biosecurity',
    topic: 'Poultry',
    author: 'Ms. Esther Mwangi',
    date: '25 Jan 2026',
    readTime: '9 min read',
    excerpt:
      'Proper housing is the foundation of successful poultry production. Learn how to design and build a poultry house that provides optimal ventilation, adequate space per bird, effective temperature control, and strong biosecurity measures to prevent disease outbreaks.',
  },
  {
    title: 'Tick-Borne Disease Prevention: An Integrated Approach',
    topic: 'Veterinary Care',
    author: 'Dr. Samuel Nyamadzawo',
    date: '18 Jan 2026',
    readTime: '8 min read',
    excerpt:
      'Tick-borne diseases including East Coast Fever, anaplasmosis, and babesiosis cause estimated annual losses of $160 million across sub-Saharan Africa. This guide presents an integrated tick management strategy combining acaricide application, pasture management, and strategic vaccination.',
  },
  {
    title: 'Livestock Vaccination Schedules: A Complete Calendar',
    topic: 'Veterinary Care',
    author: 'Dr. Samuel Nyamadzawo',
    date: '10 Jan 2026',
    readTime: '10 min read',
    excerpt:
      'A well-planned vaccination programme is the most cost-effective investment in livestock health. Access complete vaccination calendars for cattle, goats, sheep, and poultry covering anthrax, blackleg, brucellosis, foot-and-mouth, Newcastle disease, and more, tailored for Zimbabwe, Botswana, and Tanzania.',
  },
  {
    title: 'Dairy Production: From Pasture to Market',
    topic: 'Cattle Management',
    author: 'Dr. Farai Chikwanha',
    date: '28 Dec 2025',
    readTime: '11 min read',
    excerpt:
      'A step-by-step guide to establishing and running a profitable small-scale dairy operation. Covers breed selection, feeding for milk production, milking hygiene, cold chain management, quality testing, and strategies for accessing formal dairy markets in southern Africa.',
  },
  {
    title: 'Livestock Record Keeping: The Foundation of Good Management',
    topic: 'Cattle Management',
    author: 'Ms. Grace Ndlovu',
    date: '15 Dec 2025',
    readTime: '5 min read',
    excerpt:
      'Good record keeping separates profitable farmers from those operating blind. Learn what records to keep for each animal — breeding, health, production, and financial records — plus simple templates and digital tools that make the process easy even for large herds.',
  },
  {
    title: 'Pasture Management for Year-Round Grazing in Variable Climates',
    topic: 'Goat Farming',
    author: 'Dr. Nomalanga Dube',
    date: '5 Dec 2025',
    readTime: '8 min read',
    excerpt:
      'Effective pasture management ensures sustainable grazing capacity even in drought-prone regions. Explore rotational grazing systems, paddock design, grass species selection, bush encroachment control, and supplementary fodder production strategies for cattle and goat operations.',
  },
];

const relatedTopics = [
  'Agronomy',
  'Climate Adaptation',
  'Farm Finance',
  'Agricultural Technology',
  'Feed Production',
];

const popularArticles = [
  'Tick-Borne Disease Prevention',
  'Cattle Feeding Programmes',
  'Vaccination Schedules',
  'Poultry Housing Design',
];

const topicColors: Record<string, string> = {
  'Cattle Management': 'bg-amber-100 text-amber-700',
  'Goat Farming': 'bg-orange-100 text-orange-700',
  Poultry: 'bg-yellow-100 text-yellow-700',
  'Veterinary Care': 'bg-red-100 text-red-700',
};

export default function AnimalHusbandryPage() {
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
            <Link href="/education/knowledgebase" className="hover:text-teal transition-colors">
              Knowledgebase
            </Link>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-teal">Animal Husbandry</span>
          </nav>

          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Animal Husbandry
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl leading-relaxed">
            Expert guides on livestock management, veterinary care, breeding
            programmes, and animal nutrition. Practical knowledge for cattle,
            goat, and poultry farmers across Africa.
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
                    placeholder="Search animal husbandry articles..."
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  {topics.map((topic) => (
                    <button
                      key={topic}
                      onClick={() => setActiveTopic(topic)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        activeTopic === topic
                          ? 'bg-teal text-white'
                          : 'bg-cream text-navy hover:bg-teal-light'
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
                      <button className="text-teal text-sm font-semibold hover:text-teal-dark transition-colors">
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
                      className="flex items-center gap-2 text-sm text-gray-600 hover:text-teal transition-colors py-1"
                    >
                      <svg
                        className="w-4 h-4 text-teal shrink-0"
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
                      className="flex items-start gap-3 text-sm text-gray-600 hover:text-teal transition-colors cursor-pointer"
                    >
                      <span className="w-6 h-6 bg-teal/10 text-teal rounded-full flex items-center justify-center text-xs font-bold shrink-0">
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
                  Have a livestock question? Our AI-powered assistant can help
                  you find answers based on our research database and veterinary
                  knowledge.
                </p>
                <Link
                  href="/contact"
                  className="inline-block bg-teal hover:bg-teal-dark text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors w-full text-center"
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
