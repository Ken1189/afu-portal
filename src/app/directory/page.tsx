'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import {
  Users, Stethoscope, Package, Factory, BarChart3, ArrowRight,
} from 'lucide-react';

/* ─── Category cards config ─── */
const CATEGORIES = [
  {
    key: 'vet',
    label: 'Vets',
    href: '/directory/vets',
    icon: Stethoscope,
    description: 'Find veterinary services near you',
    color: 'from-emerald-500 to-green-600',
  },
  {
    key: 'offtaker',
    label: 'Offtakers',
    href: '/directory/offtakers',
    icon: Package,
    description: 'Connect with commodity buyers',
    color: 'from-blue-500 to-indigo-600',
  },
  {
    key: 'processing',
    label: 'Processing Hubs',
    href: '/directory/processing',
    icon: Factory,
    description: 'Find processing facilities',
    color: 'from-amber-500 to-orange-600',
  },
  {
    key: 'trader',
    label: 'Traders',
    href: '/directory/traders',
    icon: BarChart3,
    description: 'Browse commodity traders',
    color: 'from-purple-500 to-violet-600',
  },
];

export default function DirectoryPage() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function fetchCounts() {
      const results: Record<string, number> = {};
      await Promise.all(
        CATEGORIES.map(async (cat) => {
          const { count } = await supabase
            .from('service_providers')
            .select('id', { count: 'exact', head: true })
            .eq('provider_type', cat.key)
            .eq('is_listed', true);
          results[cat.key] = count ?? 0;
        }),
      );
      setCounts(results);
      setLoading(false);
    }

    fetchCounts();
  }, []);

  const totalProviders = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1B2A4A] to-[#2d4a7a] text-white py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 mb-6">
              <Users className="w-8 h-8 text-[#5DB347]" />
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              Service Provider Directory
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
              Connect with verified veterinarians, offtakers, processing facilities, and traders across Africa.
            </p>
            {!loading && (
              <p className="mt-4 text-sm text-white/60">
                {totalProviders.toLocaleString()} listed providers
              </p>
            )}
          </motion.div>
        </div>
      </section>

      {/* Category cards */}
      <section className="max-w-6xl mx-auto px-4 -mt-12 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CATEGORIES.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <motion.div
                key={cat.key}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <Link href={cat.href}>
                  <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer h-full">
                    <div className={`bg-gradient-to-br ${cat.color} p-6`}>
                      <Icon className="w-10 h-10 text-white" />
                    </div>
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-bold text-[#1B2A4A]">{cat.label}</h3>
                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-[#5DB347] transition-colors" />
                      </div>
                      <p className="text-sm text-gray-600 mb-4">{cat.description}</p>
                      <div className="flex items-center gap-2">
                        {loading ? (
                          <div className="h-5 w-16 bg-gray-200 rounded animate-pulse" />
                        ) : (
                          <span className="text-sm font-semibold text-[#5DB347]">
                            {(counts[cat.key] ?? 0).toLocaleString()} providers
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
