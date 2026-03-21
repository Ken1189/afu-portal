'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const categories = ['All', 'Agronomy', 'Livestock', 'Technology', 'Climate'];

const projects = [
  {
    name: 'Drought-Resistant Maize Varieties',
    category: 'Agronomy',
    status: 'Active',
    duration: '2024-2026',
    funding: '$420,000',
    lead: 'Dr. Tendai Moyo',
    partners: ['CIMMYT', 'University of Zimbabwe', 'Seed Co International'],
    description:
      'Developing and field-testing three new drought-resistant maize varieties adapted for southern African conditions. Trials are conducted across 12 sites in Zimbabwe and Botswana with over 300 participating farmers.',
    progress: 65,
  },
  {
    name: 'Precision Farming Pilot Programme',
    category: 'Technology',
    status: 'Active',
    duration: '2024-2027',
    funding: '$780,000',
    lead: 'Eng. Amina Kibali',
    partners: ['Google.org', 'Vodacom Tanzania', 'Sokoine University'],
    description:
      'Deploying satellite imagery, drone monitoring, and IoT soil sensors across 50 farms in Tanzania and Botswana. The programme aims to demonstrate that precision agriculture can boost smallholder yields by 30% while reducing input costs.',
    progress: 35,
  },
  {
    name: 'Livestock Genetics Improvement',
    category: 'Livestock',
    status: 'Active',
    duration: '2023-2026',
    funding: '$350,000',
    lead: 'Dr. Farai Chikwanha',
    partners: ['ILRI', 'Midlands State University', 'Zimbabwe Herd Book Authority'],
    description:
      'Identifying and propagating heat-tolerant, high-yield cattle genetics suitable for southern African rangelands. The project includes AI-assisted breeding selection and a regional semen distribution programme serving 300+ farms.',
    progress: 72,
  },
  {
    name: 'National Soil Mapping Initiative',
    category: 'Agronomy',
    status: 'Active',
    duration: '2023-2025',
    funding: '$290,000',
    lead: 'Dr. Kelebogile Phatudi',
    partners: ['ICRISAT', 'University of Botswana', 'FAO'],
    description:
      'Comprehensive soil health mapping programme covering 50,000 hectares across Botswana, creating detailed fertility maps and generating customised fertilisation recommendations for each soil zone.',
    progress: 88,
  },
  {
    name: 'Rainwater Harvesting at Scale',
    category: 'Climate',
    status: 'Active',
    duration: '2024-2026',
    funding: '$510,000',
    lead: 'Eng. Joseph Mwakasege',
    partners: ['IWMI', 'WaterAid', 'Tanzania Ministry of Water'],
    description:
      'Designing, deploying, and evaluating low-cost rainwater harvesting systems for smallholder farms in semi-arid northern Tanzania. Target of 500 installations with integrated drip irrigation kits.',
    progress: 42,
  },
  {
    name: 'Mobile Extension Services Network',
    category: 'Technology',
    status: 'Completed',
    duration: '2022-2024',
    funding: '$180,000',
    lead: 'Ms. Grace Ndlovu',
    partners: ['Econet Wireless', 'University of Dar es Salaam', 'AGRA'],
    description:
      'Built and launched an SMS and USSD-based agricultural extension platform delivering crop advisories, weather alerts, and market prices to 15,000 farmers across Zimbabwe and Tanzania in local languages.',
    progress: 100,
  },
  {
    name: 'Carbon Credit Verification System',
    category: 'Climate',
    status: 'Planning',
    duration: '2026-2028',
    funding: '$650,000',
    lead: 'Dr. Blessing Tawanda',
    partners: ['Verra', 'Climate Focus', 'AfDB'],
    description:
      'Developing a standardised methodology and digital MRV (Monitoring, Reporting, Verification) platform for agricultural carbon credits in sub-Saharan Africa, enabling smallholder farmers to access voluntary carbon markets.',
    progress: 10,
  },
  {
    name: 'Post-Harvest Loss Reduction',
    category: 'Agronomy',
    status: 'Active',
    duration: '2024-2026',
    funding: '$320,000',
    lead: 'Dr. Rehema Saidi',
    partners: ['APHLIS', 'Tanzania Agricultural Research Institute', 'USAID'],
    description:
      'Tackling the estimated 30-40% post-harvest losses in grain crops through improved storage solutions, hermetic bags, solar dryers, and farmer training on harvest handling best practices across central Tanzania.',
    progress: 55,
  },
];

const statusColors: Record<string, string> = {
  Active: 'bg-[#EBF7E5] text-[#5DB347]',
  Completed: 'bg-blue-100 text-blue-700',
  Planning: 'bg-amber-100 text-amber-700',
};

const categoryColors: Record<string, string> = {
  Agronomy: 'bg-emerald-100 text-emerald-700',
  Livestock: 'bg-orange-100 text-orange-700',
  Technology: 'bg-purple-100 text-purple-700',
  Climate: 'bg-sky-100 text-sky-700',
};

export default function ProjectsPage() {
  const [activeFilter, setActiveFilter] = useState('All');

  const filtered =
    activeFilter === 'All'
      ? projects
      : projects.filter((p) => p.category === activeFilter);

  return (
    <>
      {/* Hero */}
      <section className="bg-navy text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-block bg-[#5DB347]/20 text-[#5DB347] px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            Education
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white via-[#5DB347] to-[#6ABF4B] bg-clip-text text-transparent">Active Projects</h1>
          <p className="text-xl text-gray-300 max-w-3xl leading-relaxed">
            Research and development projects tackling Africa&apos;s most pressing
            agricultural challenges. From drought-resistant crops to precision
            farming technology, our projects deliver measurable impact.
          </p>
        </div>
      </section>

      {/* Filter Tabs + Projects */}
      <section className="py-16 bg-[#EBF7E5]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2 mb-12">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeFilter === cat
                    ? 'bg-gradient-to-r from-[#5DB347] to-[#449933] text-white shadow-md shadow-[#5DB347]/30'
                    : 'bg-white/80 backdrop-blur-sm text-[#1B2A4A] hover:bg-[#EBF7E5] border border-gray-200/60'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Projects Grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeFilter}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
              {filtered.map((project, i) => (
                <div
                  key={i}
                  className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border-l-4 border-[#5DB347] shadow-lg shadow-[#5DB347]/5 hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <h3 className="text-lg font-bold text-[#1B2A4A]">
                      {project.name}
                    </h3>
                    <div className="flex gap-2 shrink-0">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          categoryColors[project.category]
                        }`}
                      >
                        {project.category}
                      </span>
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          statusColors[project.status]
                        }`}
                      >
                        {project.status}
                      </span>
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                    <span>{project.duration}</span>
                    <span className="font-medium text-[#5DB347]">
                      {project.funding}
                    </span>
                    <span>Lead: {project.lead}</span>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-5 leading-relaxed">
                    {project.description}
                  </p>

                  {/* Partners */}
                  <div className="mb-5">
                    <div className="flex flex-wrap gap-2">
                      {project.partners.map((p, j) => (
                        <span
                          key={j}
                          className="bg-[#EBF7E5] text-[#1B2A4A] text-xs font-medium px-3 py-1 rounded-full border border-[#5DB347]/20"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-500">Progress</span>
                      <span className="font-semibold text-[#5DB347]">
                        {project.progress}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-gradient-to-r from-[#5DB347] to-[#6ABF4B] rounded-full h-2.5 transition-all duration-500"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-[#5DB347] to-[#449933]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Get Involved in Our Research
          </h2>
          <p className="text-white/80 mb-8 max-w-2xl mx-auto">
            Whether you are a researcher, funder, or farmer interested in
            participating in field trials, we welcome collaboration on all our
            active projects.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/contact"
              className="inline-block bg-white text-[#5DB347] hover:bg-gray-100 hover:scale-105 px-8 py-3.5 rounded-xl font-semibold text-lg transition-all duration-300"
            >
              Contact Us
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
