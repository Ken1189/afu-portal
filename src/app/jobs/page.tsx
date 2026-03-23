'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  MapPin,
  Clock,
  Users,
  DollarSign,
  Search,
  Filter,
  ChevronRight,
  Wheat,
  Tractor,
  TreePine,
  Egg,
  Beef,
  Factory,
  Sprout,
  ArrowRight,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

/* ─── Types ─── */

interface JobListing {
  id: string;
  title: string;
  sector: string;
  country: string;
  region: string | null;
  job_type: string;
  pay_rate: string | null;
  pay_type: string | null;
  duration: string | null;
  workers_needed: number | null;
  farm_name: string | null;
  description: string | null;
  status: string;
  created_at: string;
}

/* ─── Fallback seed data ─── */

const FALLBACK_JOBS: JobListing[] = [
  {
    id: 'seed-1',
    title: 'Seasonal Maize Harvester',
    sector: 'Grains',
    country: 'Zimbabwe',
    region: 'Mashonaland West',
    job_type: 'Seasonal',
    pay_rate: '$8/day',
    pay_type: 'daily',
    duration: '6 weeks',
    workers_needed: 25,
    farm_name: 'Moyo Family Farm',
    description: 'Harvest and bag hybrid maize across 200 hectares. Experience with hand harvesting preferred.',
    status: 'open',
    created_at: '2026-03-01T00:00:00Z',
  },
  {
    id: 'seed-2',
    title: 'Poultry Farm Manager',
    sector: 'Poultry',
    country: 'Kenya',
    region: 'Kiambu County',
    job_type: 'Permanent',
    pay_rate: '$450/month',
    pay_type: 'monthly',
    duration: 'Permanent',
    workers_needed: 1,
    farm_name: 'Odhiambo Poultry Ltd',
    description: 'Manage a 10,000-bird layer operation. Must have 3+ years poultry experience and understand feed formulation.',
    status: 'open',
    created_at: '2026-02-20T00:00:00Z',
  },
  {
    id: 'seed-3',
    title: 'Tractor Operator',
    sector: 'Machinery',
    country: 'Tanzania',
    region: 'Morogoro',
    job_type: 'Equipment Operator',
    pay_rate: '$15/day',
    pay_type: 'daily',
    duration: '3 months',
    workers_needed: 3,
    farm_name: 'Kilombero Cooperative',
    description: 'Operate and maintain John Deere 5075E tractors for land preparation. Valid driving licence required.',
    status: 'open',
    created_at: '2026-03-10T00:00:00Z',
  },
  {
    id: 'seed-4',
    title: 'Horticulture Specialist',
    sector: 'Horticulture',
    country: 'Botswana',
    region: 'Central District',
    job_type: 'Specialist',
    pay_rate: '$600/month',
    pay_type: 'monthly',
    duration: '12 months',
    workers_needed: 1,
    farm_name: 'Dlamini Agri Holdings',
    description: 'Design and manage drip irrigation systems for vegetable production. Degree in horticulture preferred.',
    status: 'open',
    created_at: '2026-03-05T00:00:00Z',
  },
  {
    id: 'seed-5',
    title: 'Livestock Herder',
    sector: 'Livestock',
    country: 'Botswana',
    region: 'North-West District',
    job_type: 'Seasonal',
    pay_rate: '$6/day',
    pay_type: 'daily',
    duration: '4 months',
    workers_needed: 5,
    farm_name: 'Kalahari Cattle Ranch',
    description: 'Manage rotational grazing for 200+ head Brahman cattle. Experience with livestock handling essential.',
    status: 'open',
    created_at: '2026-02-28T00:00:00Z',
  },
];

/* ─── Constants ─── */

const SECTORS = ['All', 'Livestock', 'Horticulture', 'Poultry', 'Grains', 'Cash Crops', 'Machinery', 'Processing'];
const JOB_TYPES = ['All', 'Seasonal', 'Permanent', 'Specialist', 'Equipment Operator'];

const SECTOR_COLORS: Record<string, string> = {
  Livestock: 'bg-orange-100 text-orange-700',
  Horticulture: 'bg-emerald-100 text-emerald-700',
  Poultry: 'bg-yellow-100 text-yellow-700',
  Grains: 'bg-amber-100 text-amber-700',
  'Cash Crops': 'bg-green-100 text-green-700',
  Machinery: 'bg-blue-100 text-blue-700',
  Processing: 'bg-purple-100 text-purple-700',
};

const SECTOR_ICONS: Record<string, React.ReactNode> = {
  Livestock: <Beef className="w-4 h-4" />,
  Horticulture: <TreePine className="w-4 h-4" />,
  Poultry: <Egg className="w-4 h-4" />,
  Grains: <Wheat className="w-4 h-4" />,
  'Cash Crops': <Sprout className="w-4 h-4" />,
  Machinery: <Tractor className="w-4 h-4" />,
  Processing: <Factory className="w-4 h-4" />,
};

/* ─── Component ─── */

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [sectorFilter, setSectorFilter] = useState('All');
  const [countryFilter, setCountryFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchJobs() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('job_listings')
          .select('*')
          .eq('status', 'open')
          .order('created_at', { ascending: false });

        if (error || !data || data.length === 0) {
          setJobs(FALLBACK_JOBS);
        } else {
          setJobs(data);
        }
      } catch {
        setJobs(FALLBACK_JOBS);
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
  }, []);

  const countries = useMemo(() => {
    const set = new Set(jobs.map((j) => j.country));
    return ['All', ...Array.from(set).sort()];
  }, [jobs]);

  const filtered = useMemo(() => {
    return jobs.filter((j) => {
      if (sectorFilter !== 'All' && j.sector !== sectorFilter) return false;
      if (countryFilter !== 'All' && j.country !== countryFilter) return false;
      if (typeFilter !== 'All' && j.job_type !== typeFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          j.title.toLowerCase().includes(q) ||
          j.farm_name?.toLowerCase().includes(q) ||
          j.description?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [jobs, sectorFilter, countryFilter, typeFilter, searchQuery]);

  const stats = useMemo(() => {
    const countriesSet = new Set(jobs.map((j) => j.country));
    const sectorsSet = new Set(jobs.map((j) => j.sector));
    return {
      total: jobs.length,
      countries: countriesSet.size,
      sectors: sectorsSet.size,
    };
  }, [jobs]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Hero ── */}
      <section
        className="relative py-20 px-4"
        style={{ background: 'linear-gradient(135deg, #1B2A4A 0%, #2A3F6A 100%)' }}
      >
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-white/80 text-sm font-medium mb-6">
            <Briefcase className="w-4 h-4" />
            Jobs Marketplace
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
            Agricultural Jobs
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Find seasonal work, specialist roles, and permanent positions across African farms
          </p>
        </div>
        {/* Decorative dots */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-32 h-32 rounded-full border-2 border-white" />
          <div className="absolute bottom-10 right-10 w-24 h-24 rounded-full border-2 border-white" />
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="max-w-7xl mx-auto px-4 -mt-8 relative z-10">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 grid grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-3xl font-bold" style={{ color: '#5DB347' }}>{stats.total}</p>
            <p className="text-sm text-gray-500 mt-1">Open Positions</p>
          </div>
          <div>
            <p className="text-3xl font-bold" style={{ color: '#1B2A4A' }}>{stats.countries}</p>
            <p className="text-sm text-gray-500 mt-1">Countries</p>
          </div>
          <div>
            <p className="text-3xl font-bold" style={{ color: '#8CB89C' }}>{stats.sectors}</p>
            <p className="text-sm text-gray-500 mt-1">Sectors</p>
          </div>
        </div>
      </section>

      {/* ── Filter Bar ── */}
      <section className="max-w-7xl mx-auto px-4 mt-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#5DB347] transition-colors"
            />
          </div>

          {/* Sector */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400 hidden md:block" />
            <select
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
              className="px-3 py-2.5 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:border-[#5DB347] transition-colors"
            >
              {SECTORS.map((s) => (
                <option key={s} value={s}>{s === 'All' ? 'All Sectors' : s}</option>
              ))}
            </select>
          </div>

          {/* Country */}
          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            className="px-3 py-2.5 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:border-[#5DB347] transition-colors"
          >
            {countries.map((c) => (
              <option key={c} value={c}>{c === 'All' ? 'All Countries' : c}</option>
            ))}
          </select>

          {/* Job Type */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2.5 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:border-[#5DB347] transition-colors"
          >
            {JOB_TYPES.map((t) => (
              <option key={t} value={t}>{t === 'All' ? 'All Types' : t}</option>
            ))}
          </select>
        </div>
      </section>

      {/* ── Job Cards Grid ── */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin w-8 h-8 border-2 border-[#5DB347] border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Loading jobs...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No jobs match your filters. Try broadening your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((job) => (
              <Link
                key={job.id}
                href={`/jobs/${job.id}`}
                className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden group"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${SECTOR_COLORS[job.sector] || 'bg-gray-100 text-gray-700'}`}>
                        {SECTOR_ICONS[job.sector]}
                        {job.sector}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#5DB347]/10 text-[#5DB347]">
                        {job.job_type}
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-[#1B2A4A] mb-2 group-hover:text-[#5DB347] transition-colors">
                    {job.title}
                  </h3>

                  {/* Details */}
                  <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      <span>{job.country}{job.region ? `, ${job.region}` : ''}</span>
                    </div>
                    {job.pay_rate && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-3.5 h-3.5 text-gray-400" />
                        <span className="font-medium text-[#1B2A4A]">{job.pay_rate}</span>
                      </div>
                    )}
                    {job.duration && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span>{job.duration}</span>
                      </div>
                    )}
                    {job.workers_needed && (
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-gray-400" />
                        <span>{job.workers_needed} worker{job.workers_needed !== 1 ? 's' : ''} needed</span>
                      </div>
                    )}
                  </div>

                  {/* Farm + CTA */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                    {job.farm_name && (
                      <span className="text-xs text-gray-400">{job.farm_name}</span>
                    )}
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#5DB347] group-hover:gap-2 transition-all">
                      Apply <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ── CTA ── */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        <div
          className="rounded-2xl p-10 text-center"
          style={{ background: 'linear-gradient(135deg, #5DB347 0%, #449933 100%)' }}
        >
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            Are you a farmer looking for workers?
          </h2>
          <p className="text-white/80 mb-6 max-w-lg mx-auto">
            Post your job listing on AFU&apos;s marketplace and reach thousands of skilled agricultural workers across Africa.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-white text-[#5DB347] px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
          >
            Post a Job <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
