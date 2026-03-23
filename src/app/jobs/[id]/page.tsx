'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Briefcase,
  MapPin,
  Clock,
  Users,
  DollarSign,
  Calendar,
  CheckCircle2,
  Share2,
  Home,
  Utensils,
  Car,
  ChevronRight,
  Copy,
  Check,
  Wheat,
  Tractor,
  TreePine,
  Egg,
  Beef,
  Factory,
  Sprout,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

/* ─── Types ─── */

interface JobDetail {
  id: string;
  title: string;
  sector: string;
  country: string;
  region: string | null;
  job_type: string;
  pay_rate: string | null;
  pay_type: string | null;
  duration: string | null;
  start_date: string | null;
  workers_needed: number | null;
  farm_name: string | null;
  description: string | null;
  requirements: string | null;
  skills: string[] | null;
  experience_years: number | null;
  education: string | null;
  certifications: string[] | null;
  housing_included: boolean;
  meals_included: boolean;
  transport_included: boolean;
  status: string;
  created_at: string;
}

/* ─── Fallback data ─── */

const FALLBACK_JOBS: Record<string, JobDetail> = {
  'seed-1': {
    id: 'seed-1',
    title: 'Seasonal Maize Harvester',
    sector: 'Grains',
    country: 'Zimbabwe',
    region: 'Mashonaland West',
    job_type: 'Seasonal',
    pay_rate: '$8/day',
    pay_type: 'daily',
    duration: '6 weeks',
    start_date: '2026-04-15',
    workers_needed: 25,
    farm_name: 'Moyo Family Farm',
    description: 'We are looking for experienced maize harvesters to join our team for the 2026 harvest season. The role involves hand-harvesting, bagging, and loading hybrid maize across 200 hectares of farmland.\n\nYou will work as part of a team of 25 under the supervision of our farm manager. Days start at 6am and finish at 2pm to avoid the afternoon heat.',
    requirements: 'Must be physically fit and able to work long hours in the field. Previous maize harvesting experience strongly preferred. Must be comfortable working in a team environment.',
    skills: ['Hand harvesting', 'Crop handling', 'Teamwork'],
    experience_years: 1,
    education: 'No formal education required',
    certifications: null,
    housing_included: true,
    meals_included: true,
    transport_included: false,
    status: 'open',
    created_at: '2026-03-01T00:00:00Z',
  },
  'seed-2': {
    id: 'seed-2',
    title: 'Poultry Farm Manager',
    sector: 'Poultry',
    country: 'Kenya',
    region: 'Kiambu County',
    job_type: 'Permanent',
    pay_rate: '$450/month',
    pay_type: 'monthly',
    duration: 'Permanent',
    start_date: '2026-05-01',
    workers_needed: 1,
    farm_name: 'Odhiambo Poultry Ltd',
    description: 'Manage a 10,000-bird commercial layer operation producing table eggs for the Nairobi market. You will oversee daily operations, staff management, feed procurement, and health monitoring.\n\nThe farm is fully automated with modern cages, automated feeding, and egg collection systems.',
    requirements: 'Minimum 3 years managing a commercial poultry farm. Must understand feed formulation, vaccination schedules, and disease prevention protocols.',
    skills: ['Poultry management', 'Feed formulation', 'Staff supervision', 'Disease management'],
    experience_years: 3,
    education: 'Diploma in Animal Science or equivalent',
    certifications: ['Poultry health certificate'],
    housing_included: true,
    meals_included: false,
    transport_included: true,
    status: 'open',
    created_at: '2026-02-20T00:00:00Z',
  },
  'seed-3': {
    id: 'seed-3',
    title: 'Tractor Operator',
    sector: 'Machinery',
    country: 'Tanzania',
    region: 'Morogoro',
    job_type: 'Equipment Operator',
    pay_rate: '$15/day',
    pay_type: 'daily',
    duration: '3 months',
    start_date: '2026-04-01',
    workers_needed: 3,
    farm_name: 'Kilombero Cooperative',
    description: 'Operate and maintain John Deere 5075E tractors for land preparation across cooperative member farms in the Kilombero Valley. Work includes ploughing, harrowing, and ridging.\n\nYou will be responsible for daily maintenance checks and reporting any mechanical issues immediately.',
    requirements: 'Valid driving licence and tractor operation experience. Must be able to perform basic maintenance and troubleshooting.',
    skills: ['Tractor operation', 'Land preparation', 'Basic mechanics'],
    experience_years: 2,
    education: 'Secondary school certificate',
    certifications: ['Valid driving licence'],
    housing_included: false,
    meals_included: true,
    transport_included: false,
    status: 'open',
    created_at: '2026-03-10T00:00:00Z',
  },
  'seed-4': {
    id: 'seed-4',
    title: 'Horticulture Specialist',
    sector: 'Horticulture',
    country: 'Botswana',
    region: 'Central District',
    job_type: 'Specialist',
    pay_rate: '$600/month',
    pay_type: 'monthly',
    duration: '12 months',
    start_date: '2026-04-15',
    workers_needed: 1,
    farm_name: 'Dlamini Agri Holdings',
    description: 'Design and manage drip irrigation systems for a 15-hectare vegetable production unit. Crops include tomatoes, peppers, onions, and leafy greens for the Gaborone market.\n\nYou will train 8 farm workers on irrigation scheduling, fertigation, and crop scouting.',
    requirements: 'Degree in horticulture, agricultural science, or related field. Strong knowledge of drip irrigation design and management.',
    skills: ['Drip irrigation', 'Crop management', 'Fertigation', 'Training'],
    experience_years: 3,
    education: 'Degree in Horticulture or Agricultural Science',
    certifications: ['GlobalG.A.P. knowledge preferred'],
    housing_included: true,
    meals_included: true,
    transport_included: true,
    status: 'open',
    created_at: '2026-03-05T00:00:00Z',
  },
  'seed-5': {
    id: 'seed-5',
    title: 'Livestock Herder',
    sector: 'Livestock',
    country: 'Botswana',
    region: 'North-West District',
    job_type: 'Seasonal',
    pay_rate: '$6/day',
    pay_type: 'daily',
    duration: '4 months',
    start_date: '2026-05-01',
    workers_needed: 5,
    farm_name: 'Kalahari Cattle Ranch',
    description: 'Manage rotational grazing for 200+ head Brahman cattle across a 500-hectare ranch. Work involves moving herds between paddocks, monitoring water points, and checking for health issues.\n\nMust be comfortable working in remote conditions with limited amenities.',
    requirements: 'Experience with cattle handling. Must be physically fit and comfortable working in remote areas.',
    skills: ['Cattle handling', 'Rotational grazing', 'Animal health basics'],
    experience_years: 1,
    education: 'No formal education required',
    certifications: null,
    housing_included: true,
    meals_included: true,
    transport_included: false,
    status: 'open',
    created_at: '2026-02-28T00:00:00Z',
  },
};

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

const STATUS_COLORS: Record<string, string> = {
  open: 'bg-green-100 text-green-700',
  closed: 'bg-red-100 text-red-700',
  filled: 'bg-gray-100 text-gray-600',
};

/* ─── Component ─── */

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [similarJobs, setSimilarJobs] = useState<JobDetail[]>([]);

  useEffect(() => {
    async function fetchJob() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('job_listings')
          .select('*')
          .eq('id', id)
          .single();

        if (error || !data) {
          // Try fallback
          const fallback = FALLBACK_JOBS[id];
          if (fallback) {
            setJob(fallback);
            // Get similar from fallback
            const similar = Object.values(FALLBACK_JOBS).filter(
              (j) => j.id !== id && j.sector === fallback.sector
            );
            setSimilarJobs(similar.slice(0, 3));
          }
        } else {
          setJob(data);
          // Fetch similar jobs
          const { data: simData } = await supabase
            .from('job_listings')
            .select('*')
            .eq('sector', data.sector)
            .neq('id', id)
            .eq('status', 'open')
            .limit(3);
          if (simData) setSimilarJobs(simData);
        }
      } catch {
        const fallback = FALLBACK_JOBS[id];
        if (fallback) {
          setJob(fallback);
          const similar = Object.values(FALLBACK_JOBS).filter(
            (j) => j.id !== id && j.sector === fallback.sector
          );
          setSimilarJobs(similar.slice(0, 3));
        }
      } finally {
        setLoading(false);
      }
    }
    fetchJob();
  }, [id]);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: no-op
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-[#5DB347] border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-[#1B2A4A] mb-2">Job not found</h2>
          <p className="text-gray-500 mb-4">This listing may have been removed or filled.</p>
          <Link href="/jobs" className="text-[#5DB347] font-semibold hover:underline">
            Back to Jobs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back link */}
      <div className="max-w-5xl mx-auto px-4 pt-6">
        <Link
          href="/jobs"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#5DB347] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Jobs
        </Link>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Main Content ── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${SECTOR_COLORS[job.sector] || 'bg-gray-100 text-gray-700'}`}>
                  {SECTOR_ICONS[job.sector]}
                  {job.sector}
                </span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[job.status] || 'bg-gray-100 text-gray-600'}`}>
                  {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#5DB347]/10 text-[#5DB347]">
                  {job.job_type}
                </span>
              </div>

              <h1 className="text-2xl md:text-3xl font-bold text-[#1B2A4A] mb-2">{job.title}</h1>

              {job.farm_name && (
                <p className="text-gray-500 mb-4">at {job.farm_name}</p>
              )}

              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  {job.country}{job.region ? `, ${job.region}` : ''}
                </span>
                {job.pay_rate && (
                  <span className="flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    <strong className="text-[#1B2A4A]">{job.pay_rate}</strong>
                  </span>
                )}
                {job.duration && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-gray-400" />
                    {job.duration}
                  </span>
                )}
                {job.workers_needed && (
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-gray-400" />
                    {job.workers_needed} needed
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            {job.description && (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-lg font-bold text-[#1B2A4A] mb-3">Job Description</h2>
                <div className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                  {job.description}
                </div>
              </div>
            )}

            {/* Requirements */}
            {(job.requirements || job.skills || job.education || job.certifications) && (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-lg font-bold text-[#1B2A4A] mb-4">Requirements</h2>

                {job.requirements && (
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">{job.requirements}</p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {job.skills && job.skills.length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Skills</h3>
                      <div className="flex flex-wrap gap-1.5">
                        {job.skills.map((skill) => (
                          <span key={skill} className="px-2.5 py-1 bg-[#5DB347]/10 text-[#5DB347] rounded-full text-xs font-medium">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {job.experience_years != null && (
                    <div>
                      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Experience</h3>
                      <p className="text-sm text-gray-600">{job.experience_years}+ years</p>
                    </div>
                  )}

                  {job.education && (
                    <div>
                      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Education</h3>
                      <p className="text-sm text-gray-600">{job.education}</p>
                    </div>
                  )}

                  {job.certifications && job.certifications.length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Certifications</h3>
                      <ul className="space-y-1">
                        {job.certifications.map((cert) => (
                          <li key={cert} className="text-sm text-gray-600 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#5DB347]" />
                            {cert}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Compensation */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-bold text-[#1B2A4A] mb-4">Compensation &amp; Benefits</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {job.pay_rate && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <DollarSign className="w-5 h-5 text-[#5DB347]" />
                    <div>
                      <p className="text-xs text-gray-400">Pay Rate</p>
                      <p className="text-sm font-semibold text-[#1B2A4A]">{job.pay_rate}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Home className="w-5 h-5" style={{ color: job.housing_included ? '#5DB347' : '#D1D5DB' }} />
                  <div>
                    <p className="text-xs text-gray-400">Housing</p>
                    <p className="text-sm font-semibold text-[#1B2A4A]">{job.housing_included ? 'Included' : 'Not included'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Utensils className="w-5 h-5" style={{ color: job.meals_included ? '#5DB347' : '#D1D5DB' }} />
                  <div>
                    <p className="text-xs text-gray-400">Meals</p>
                    <p className="text-sm font-semibold text-[#1B2A4A]">{job.meals_included ? 'Included' : 'Not included'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Car className="w-5 h-5" style={{ color: job.transport_included ? '#5DB347' : '#D1D5DB' }} />
                  <div>
                    <p className="text-xs text-gray-400">Transport</p>
                    <p className="text-sm font-semibold text-[#1B2A4A]">{job.transport_included ? 'Included' : 'Not included'}</p>
                  </div>
                </div>
                {job.start_date && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-[#5DB347]" />
                    <div>
                      <p className="text-xs text-gray-400">Start Date</p>
                      <p className="text-sm font-semibold text-[#1B2A4A]">
                        {new Date(job.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Sidebar ── */}
          <div className="space-y-6">
            {/* Apply Card */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sticky top-24">
              <Link
                href={`/contact?subject=job_application&job=${encodeURIComponent(job.title)}`}
                className="block w-full text-center text-white font-semibold py-3 rounded-xl transition-colors"
                style={{ background: '#5DB347' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#449933')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#5DB347')}
              >
                Apply Now
              </Link>

              <button
                onClick={handleShare}
                className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-[#5DB347]" />
                    Link copied!
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    Share this job
                  </>
                )}
              </button>

              {/* Quick info */}
              <div className="mt-6 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Posted</span>
                  <span className="text-[#1B2A4A] font-medium">
                    {new Date(job.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Type</span>
                  <span className="text-[#1B2A4A] font-medium">{job.job_type}</span>
                </div>
                {job.duration && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Duration</span>
                    <span className="text-[#1B2A4A] font-medium">{job.duration}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Similar Jobs */}
            {similarJobs.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-bold text-[#1B2A4A] mb-4">Similar Jobs</h3>
                <div className="space-y-3">
                  {similarJobs.map((sj) => (
                    <Link
                      key={sj.id}
                      href={`/jobs/${sj.id}`}
                      className="block p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                    >
                      <p className="text-sm font-semibold text-[#1B2A4A] group-hover:text-[#5DB347] transition-colors">
                        {sj.title}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {sj.country} &middot; {sj.pay_rate}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
