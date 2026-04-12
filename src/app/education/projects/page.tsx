'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { Loader2, Beaker } from 'lucide-react';

const categories = ['All', 'Agronomy', 'Livestock', 'Technology', 'Climate'];

interface Project {
  id: string;
  name: string;
  category: string;
  status: string;
  duration: string;
  funding: string;
  lead: string;
  partners: string[];
  description: string;
  progress: number;
}

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
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data, error } = await supabase
        .from('education_projects')
        .select('id, name, category, status, duration, funding, lead, partners, description, progress')
        .eq('visible', true)
        .order('display_order', { ascending: true });

      if (!error && data) {
        setProjects(data as Project[]);
      }
      setLoading(false);
    })();
  }, []);

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

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-[#5DB347]" />
            </div>
          )}

          {/* Empty State */}
          {!loading && projects.length === 0 && (
            <div className="text-center py-20">
              <Beaker className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[#1B2A4A] mb-2">Projects coming soon</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Our research and development projects are being finalised. Check back soon for updates on our agricultural innovation initiatives.
              </p>
            </div>
          )}

          {/* Projects Grid */}
          {!loading && projects.length > 0 && (
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
                    key={project.id || i}
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
                            categoryColors[project.category] || 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {project.category}
                        </span>
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                            statusColors[project.status] || 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {project.status}
                        </span>
                      </div>
                    </div>

                    {/* Meta */}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                      {project.duration && <span>{project.duration}</span>}
                      {project.funding && (
                        <span className="font-medium text-[#5DB347]">
                          {project.funding}
                        </span>
                      )}
                      {project.lead && <span>Lead: {project.lead}</span>}
                    </div>

                    {/* Description */}
                    {project.description && (
                      <p className="text-gray-600 text-sm mb-5 leading-relaxed">
                        {project.description}
                      </p>
                    )}

                    {/* Partners */}
                    {project.partners && project.partners.length > 0 && (
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
                    )}

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

                {filtered.length === 0 && (
                  <div className="col-span-2 text-center py-12">
                    <p className="text-gray-500">No projects in this category yet.</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          )}
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
