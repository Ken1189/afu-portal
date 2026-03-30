'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  ChevronLeft,
  CheckCircle2,
  Clock,
  XCircle,
  Archive,
  Users,
  Package,
  DollarSign,
  ShoppingCart,
  MapPin,
  Calendar,
  Loader2,
  CheckCheck,
  X,
  Eye,
  Sprout,
  AlertCircle,
  RefreshCw,
  Trash2,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────

interface ProgramInclusion {
  id: string;
  type: 'inputs' | 'insurance' | 'offtake' | 'financing' | 'advisory';
  title: string;
  description: string | null;
  value_estimate: number | null;
  currency: string | null;
}

interface Program {
  id: string;
  title: string;
  slug: string;
  country: string;
  region: string | null;
  crop: string;
  crop_variety: string | null;
  season_number: number | null;
  description: string | null;
  status: 'draft' | 'active' | 'closed' | 'completed';
  max_participants: number | null;
  current_participants: number;
  min_farm_size_ha: number | null;
  planting_start: string | null;
  planting_end: string | null;
  expected_harvest: string | null;
  financing_available: boolean;
  financing_percent: number | null;
  offtake_buyer: string | null;
  offtake_price_per_kg: number | null;
  offtake_currency: string | null;
  image_url: string | null;
  created_at: string;
  program_inclusions: ProgramInclusion[];
  enrollmentStats?: {
    total: number;
    applied: number;
    approved: number;
    active: number;
    completed: number;
    rejected: number;
  };
}

interface MemberProfile {
  full_name: string | null;
  email: string | null;
  country: string | null;
  phone: string | null;
}

interface EnrollmentMember {
  id: string;
  member_id: string;
  farm_name: string | null;
  profile_id: string;
  profiles: MemberProfile | null;
}

interface Enrollment {
  id: string;
  program_id: string;
  member_id: string;
  status: 'applied' | 'approved' | 'active' | 'completed' | 'rejected' | 'withdrawn';
  current_stage: 'discover' | 'approved' | 'inputs' | 'growing' | 'harvest' | 'offtake' | 'complete';
  farm_size_ha: number | null;
  farm_location: string | null;
  notes: string | null;
  financing_requested: boolean;
  applied_at: string | null;
  approved_at: string | null;
  completed_at: string | null;
  members: EnrollmentMember | null;
}

// ── Constants ─────────────────────────────────────────────────────────────

const COUNTRY_FLAGS: Record<string, string> = {
  Uganda: '🇺🇬', Zimbabwe: '🇿🇼', Tanzania: '🇹🇿', Botswana: '🇧🇼',
  Zambia: '🇿🇲', Kenya: '🇰🇪', Ghana: '🇬🇭', Nigeria: '🇳🇬', 'South Africa': '🇿🇦',
};

const statusConfig: Record<
  Program['status'],
  { label: string; color: string; icon: React.ReactNode }
> = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-600', icon: <Clock className="w-3 h-3" /> },
  active: { label: 'Active', color: 'bg-green-100 text-green-700', icon: <CheckCircle2 className="w-3 h-3" /> },
  closed: { label: 'Closed', color: 'bg-amber-100 text-amber-700', icon: <XCircle className="w-3 h-3" /> },
  completed: { label: 'Completed', color: 'bg-navy/10 text-navy', icon: <Archive className="w-3 h-3" /> },
};

const enrollmentStatusConfig: Record<
  Enrollment['status'],
  { label: string; color: string }
> = {
  applied: { label: 'Applied', color: 'bg-blue-100 text-blue-700' },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-700' },
  active: { label: 'Active', color: 'bg-teal/10 text-teal' },
  completed: { label: 'Completed', color: 'bg-navy/10 text-navy' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700' },
  withdrawn: { label: 'Withdrawn', color: 'bg-gray-100 text-gray-600' },
};

const stageConfig: Record<
  Enrollment['current_stage'],
  { label: string; color: string }
> = {
  discover: { label: 'Discover', color: 'bg-gray-100 text-gray-600' },
  approved: { label: 'Approved', color: 'bg-blue-100 text-blue-700' },
  inputs: { label: 'Inputs', color: 'bg-amber-100 text-amber-700' },
  growing: { label: 'Growing', color: 'bg-green-100 text-green-700' },
  harvest: { label: 'Harvest', color: 'bg-teal/10 text-teal' },
  offtake: { label: 'Offtake', color: 'bg-purple-100 text-purple-700' },
  complete: { label: 'Complete', color: 'bg-navy/10 text-navy' },
};

const INCLUSION_ICONS: Record<ProgramInclusion['type'], React.ReactNode> = {
  inputs: <Package className="w-4 h-4" />,
  insurance: <CheckCircle2 className="w-4 h-4" />,
  offtake: <ShoppingCart className="w-4 h-4" />,
  financing: <DollarSign className="w-4 h-4" />,
  advisory: <Users className="w-4 h-4" />,
};

const INCLUSION_COLORS: Record<ProgramInclusion['type'], string> = {
  inputs: 'bg-green-50 text-green-700 border-green-200',
  insurance: 'bg-blue-50 text-blue-700 border-blue-200',
  offtake: 'bg-purple-50 text-purple-700 border-purple-200',
  financing: 'bg-amber-50 text-amber-700 border-amber-200',
  advisory: 'bg-teal/5 text-teal border-teal/20',
};

const ENROLLMENT_STATUS_FILTERS = ['all', 'applied', 'approved', 'active', 'completed'] as const;

// ── Animation variants ─────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

// ── Skeleton ──────────────────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-gray-100 rounded w-48" />
      <div className="h-40 bg-gray-100 rounded-xl" />
      <div className="h-64 bg-gray-100 rounded-xl" />
    </div>
  );
}

// ── Date formatter ────────────────────────────────────────────────────────

function fmtDate(d: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ═══════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function AdminProgramDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const programId = params.id as string;

  const [activeTab, setActiveTab] = useState<'overview' | 'enrollments'>(
    searchParams.get('tab') === 'enrollments' ? 'enrollments' : 'overview'
  );

  const [program, setProgram] = useState<Program | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [programLoading, setProgramLoading] = useState(true);
  const [enrollmentsLoading, setEnrollmentsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [enrollmentStatusFilter, setEnrollmentStatusFilter] = useState<string>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedEnrollments, setSelectedEnrollments] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deletingProgram, setDeletingProgram] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success'|'error'}|null>(null);
  const showToast = (message: string, type: 'success'|'error' = 'success') => { setToast({message, type}); setTimeout(() => setToast(null), 3000); };

  // ── Fetch program ─────────────────────────────────────────────────────
  const fetchProgram = useCallback(async () => {
    setProgramLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/programs/${programId}`);
      if (!res.ok) {
        if (res.status === 404) {
          router.push('/admin/programs');
          return;
        }
        throw new Error('Failed to fetch program');
      }
      const data = await res.json();
      setProgram(data.program);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load program');
    } finally {
      setProgramLoading(false);
    }
  }, [programId, router]);

  // ── Fetch enrollments ─────────────────────────────────────────────────
  const fetchEnrollments = useCallback(async () => {
    setEnrollmentsLoading(true);
    try {
      const params = new URLSearchParams();
      if (enrollmentStatusFilter !== 'all') params.set('status', enrollmentStatusFilter);
      const res = await fetch(`/api/programs/${programId}/enrollments?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch enrollments');
      const data = await res.json();
      setEnrollments(data.enrollments ?? []);
    } catch (err) {
      console.error('Failed to fetch enrollments:', err);
    } finally {
      setEnrollmentsLoading(false);
    }
  }, [programId, enrollmentStatusFilter]);

  useEffect(() => { fetchProgram(); }, [fetchProgram]);

  useEffect(() => {
    if (activeTab === 'enrollments') {
      fetchEnrollments();
    }
  }, [activeTab, fetchEnrollments]);

  // ── Enrollment action ─────────────────────────────────────────────────
  const handleEnrollmentAction = async (
    enrollmentId: string,
    status: 'approved' | 'rejected',
    stage?: string
  ) => {
    setActionLoading(enrollmentId);
    try {
      const body: Record<string, string> = { enrollment_id: enrollmentId, status };
      if (stage) body.stage = stage;

      const res = await fetch(`/api/programs/${programId}/enrollments`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        showToast(data.error ?? 'Action failed', 'error');
        return;
      }

      await fetchEnrollments();
    } catch {
      showToast('Failed to update enrollment', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // ── Bulk approve ──────────────────────────────────────────────────────
  const handleBulkApprove = async () => {
    if (selectedEnrollments.size === 0) return;
    setBulkLoading(true);
    try {
      await Promise.all(
        Array.from(selectedEnrollments).map(id =>
          fetch(`/api/programs/${programId}/enrollments`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ enrollment_id: id, status: 'approved', stage: 'approved' }),
          })
        )
      );
      setSelectedEnrollments(new Set());
      await fetchEnrollments();
    } catch {
      showToast('Bulk approve failed for some enrollments', 'error');
    } finally {
      setBulkLoading(false);
    }
  };

  // ── Delete program ────────────────────────────────────────────────────
  const handleDeleteProgram = async () => {
    setDeletingProgram(true);
    try {
      const res = await fetch(`/api/programs/${programId}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        showToast(data.error ?? 'Failed to delete program', 'error');
        return;
      }
      router.push('/admin/programs');
    } catch {
      showToast('Failed to delete program', 'error');
    } finally {
      setDeletingProgram(false);
      setConfirmDelete(false);
    }
  };

  // ── Toggle row selection ──────────────────────────────────────────────
  const toggleSelect = (id: string) => {
    setSelectedEnrollments(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    const applied = enrollments.filter(e => e.status === 'applied').map(e => e.id);
    if (selectedEnrollments.size === applied.length && applied.length > 0) {
      setSelectedEnrollments(new Set());
    } else {
      setSelectedEnrollments(new Set(applied));
    }
  };

  // ── Filtered enrollments ──────────────────────────────────────────────
  const filteredEnrollments =
    enrollmentStatusFilter === 'all'
      ? enrollments
      : enrollments.filter(e => e.status === enrollmentStatusFilter);

  if (programLoading) return <PageSkeleton />;

  if (error || !program) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <AlertCircle className="w-10 h-10 text-red-400" />
        <p className="text-gray-500">{error ?? 'Program not found'}</p>
        <Link href="/admin/programs" className="text-teal text-sm font-medium hover:underline">
          Back to Programs
        </Link>
      </div>
    );
  }

  const pCfg = statusConfig[program.status];
  const enrollPct = program.max_participants
    ? Math.min(100, Math.round((program.current_participants / program.max_participants) * 100))
    : 0;

  return (
    <motion.div
      variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } }}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* ── Back + header ─────────────────────────────────────────────── */}
      <motion.div variants={fadeUp} className="flex items-center gap-3">
        <Link
          href="/admin/programs"
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-navy"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-navy truncate">{program.title}</h1>
            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${pCfg.color}`}>
              {pCfg.icon}
              {pCfg.label}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">
            {COUNTRY_FLAGS[program.country] ?? '🌍'} {program.country} · {program.crop}
            {program.season_number ? ` · Season ${program.season_number}` : ''}
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <Link
            href={`/admin/programs/${programId}?tab=edit`}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 hover:text-navy transition-colors"
          >
            Edit Program
          </Link>
          <button
            onClick={() => setConfirmDelete(true)}
            className="inline-flex items-center gap-1.5 text-sm text-red-500 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      </motion.div>

      {/* ── Tabs ──────────────────────────────────────────────────────── */}
      <motion.div variants={fadeUp} className="border-b border-gray-200">
        <nav className="flex gap-1 -mb-px">
          {(['overview', 'enrollments'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors capitalize ${
                activeTab === tab
                  ? 'border-teal text-teal'
                  : 'border-transparent text-gray-500 hover:text-navy hover:border-gray-300'
              }`}
            >
              {tab}
              {tab === 'enrollments' && program.enrollmentStats && (
                <span className="ml-1.5 text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">
                  {program.enrollmentStats.total}
                </span>
              )}
            </button>
          ))}
        </nav>
      </motion.div>

      <AnimatePresence mode="wait">
        {/* ════════════════════════════════════════════════════════════
            OVERVIEW TAB
        ════════════════════════════════════════════════════════════ */}
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="space-y-5"
          >
            {/* Program header card — gradient-navy */}
            <div className="gradient-navy rounded-xl p-6 text-white">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-2xl">{COUNTRY_FLAGS[program.country] ?? '🌍'}</span>
                    <span className="text-white/80 text-sm">{program.country}</span>
                    <span className="text-white/40">·</span>
                    <span className="text-white/80 text-sm">{program.crop}</span>
                    {program.crop_variety && (
                      <>
                        <span className="text-white/40">·</span>
                        <span className="text-white/60 text-sm">{program.crop_variety}</span>
                      </>
                    )}
                  </div>
                  <h2 className="text-xl font-bold">{program.title}</h2>
                  {program.region && (
                    <div className="flex items-center gap-1.5 text-white/70 text-sm">
                      <MapPin className="w-3.5 h-3.5" />
                      {program.region}
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {program.season_number && (
                    <span className="text-xs bg-white/10 text-white px-2.5 py-1 rounded-full">
                      Season {program.season_number}
                    </span>
                  )}
                  <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${pCfg.color}`}>
                    {pCfg.icon}
                    {pCfg.label}
                  </span>
                </div>
              </div>

              {/* Dates row */}
              {(program.planting_start || program.expected_harvest) && (
                <div className="mt-4 flex flex-wrap gap-4 pt-4 border-t border-white/10">
                  {program.planting_start && (
                    <div className="flex items-center gap-2 text-white/70 text-xs">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Planting: {fmtDate(program.planting_start)}</span>
                      {program.planting_end && <span>→ {fmtDate(program.planting_end)}</span>}
                    </div>
                  )}
                  {program.expected_harvest && (
                    <div className="flex items-center gap-2 text-white/70 text-xs">
                      <Sprout className="w-3.5 h-3.5" />
                      <span>Harvest: {fmtDate(program.expected_harvest)}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Enrollment progress */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between mb-1.5 text-xs text-white/70">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    Enrollment
                  </span>
                  <span className="tabular-nums">
                    {program.current_participants}
                    {program.max_participants ? ` / ${program.max_participants}` : ' enrolled'}
                  </span>
                </div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-2 bg-white rounded-full transition-all"
                    style={{ width: `${enrollPct}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Two-column: Inclusions + Details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Inclusions */}
              <div className="lg:col-span-2 card-polished bg-white rounded-xl border border-gray-100 p-5">
                <h3 className="font-semibold text-navy text-sm mb-4 flex items-center gap-2">
                  <Package className="w-4 h-4 text-teal" />
                  Program Inclusions
                </h3>
                {program.program_inclusions.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-6">No inclusions defined.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {program.program_inclusions.map(inc => (
                      <div
                        key={inc.id}
                        className={`flex items-start gap-3 p-3 rounded-lg border ${INCLUSION_COLORS[inc.type]}`}
                      >
                        <span className="mt-0.5 flex-shrink-0">{INCLUSION_ICONS[inc.type]}</span>
                        <div className="min-w-0">
                          <p className="font-medium text-sm">{inc.title}</p>
                          {inc.description && (
                            <p className="text-xs mt-0.5 opacity-80 line-clamp-2">{inc.description}</p>
                          )}
                          {inc.value_estimate && (
                            <p className="text-xs mt-1 font-medium tabular-nums">
                              {inc.value_estimate.toLocaleString()} {inc.currency ?? 'USD'}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Offtake + Financing sidebar */}
              <div className="space-y-4">
                {/* Offtake */}
                <div className="card-polished bg-white rounded-xl border border-gray-100 p-5">
                  <h3 className="font-semibold text-navy text-xs uppercase tracking-wide mb-3 flex items-center gap-2">
                    <ShoppingCart className="w-3.5 h-3.5 text-teal" />
                    Offtake
                  </h3>
                  {program.offtake_buyer ? (
                    <div className="space-y-2">
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide">Buyer</p>
                        <p className="text-sm font-medium text-navy">{program.offtake_buyer}</p>
                      </div>
                      {program.offtake_price_per_kg && (
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase tracking-wide">Price / kg</p>
                          <p className="text-sm font-bold text-navy tabular-nums">
                            {program.offtake_price_per_kg} {program.offtake_currency ?? 'USD'}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">Not specified</p>
                  )}
                </div>

                {/* Financing */}
                <div className="card-polished bg-white rounded-xl border border-gray-100 p-5">
                  <h3 className="font-semibold text-navy text-xs uppercase tracking-wide mb-3 flex items-center gap-2">
                    <DollarSign className="w-3.5 h-3.5 text-teal" />
                    Financing
                  </h3>
                  {program.financing_available ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium text-green-700">Available</span>
                      </div>
                      {program.financing_percent && (
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase tracking-wide">Coverage</p>
                          <p className="text-2xl font-bold text-navy tabular-nums">
                            {program.financing_percent}%
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-500">Not available</span>
                    </div>
                  )}
                </div>

                {/* Capacity */}
                <div className="card-polished bg-white rounded-xl border border-gray-100 p-5">
                  <h3 className="font-semibold text-navy text-xs uppercase tracking-wide mb-3 flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-teal" />
                    Capacity
                  </h3>
                  <div className="space-y-1.5">
                    {program.max_participants && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Max</span>
                        <span className="font-medium text-navy">{program.max_participants}</span>
                      </div>
                    )}
                    {program.min_farm_size_ha && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Min farm</span>
                        <span className="font-medium text-navy">{program.min_farm_size_ha} ha</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            {program.description && (
              <div className="card-polished bg-white rounded-xl border border-gray-100 p-5">
                <h3 className="font-semibold text-navy text-sm mb-3">Description</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{program.description}</p>
              </div>
            )}
          </motion.div>
        )}

        {/* ════════════════════════════════════════════════════════════
            ENROLLMENTS TAB
        ════════════════════════════════════════════════════════════ */}
        {activeTab === 'enrollments' && (
          <motion.div
            key="enrollments"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            {/* Controls bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Status filter tabs */}
              <div className="flex items-center gap-1 flex-wrap">
                {ENROLLMENT_STATUS_FILTERS.map(f => (
                  <button
                    key={f}
                    onClick={() => setEnrollmentStatusFilter(f)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors capitalize ${
                      enrollmentStatusFilter === f
                        ? 'bg-teal text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                {selectedEnrollments.size > 0 && (
                  <button
                    onClick={handleBulkApprove}
                    disabled={bulkLoading}
                    className="inline-flex items-center gap-1.5 bg-green-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {bulkLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <CheckCheck className="w-3.5 h-3.5" />
                    )}
                    Approve {selectedEnrollments.size} Selected
                  </button>
                )}

                <button
                  onClick={fetchEnrollments}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-navy hover:bg-gray-100 transition-colors"
                  title="Refresh"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="card-polished bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <th className="py-3 px-4 w-8">
                        <input
                          type="checkbox"
                          checked={
                            enrollments.filter(e => e.status === 'applied').length > 0 &&
                            selectedEnrollments.size ===
                              enrollments.filter(e => e.status === 'applied').length
                          }
                          onChange={toggleSelectAll}
                          className="rounded border-gray-300 accent-teal"
                        />
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Member</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Country</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Farm Size</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Stage</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Applied</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {enrollmentsLoading && (
                      Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          {Array.from({ length: 8 }).map((_, j) => (
                            <td key={j} className="py-3 px-4">
                              <div className="h-4 bg-gray-100 rounded" style={{ width: `${50 + j * 7}%` }} />
                            </td>
                          ))}
                        </tr>
                      ))
                    )}

                    {!enrollmentsLoading && filteredEnrollments.length === 0 && (
                      <tr>
                        <td colSpan={8} className="py-12 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <Users className="w-8 h-8 text-gray-200" />
                            <p className="text-gray-400 text-sm">No enrollments found</p>
                          </div>
                        </td>
                      </tr>
                    )}

                    {!enrollmentsLoading && filteredEnrollments.map(enrollment => {
                      const eCfg = enrollmentStatusConfig[enrollment.status];
                      const sCfg = stageConfig[enrollment.current_stage];
                      const member = enrollment.members;
                      const profile = member?.profiles;

                      return (
                        <motion.tr
                          key={enrollment.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="hover:bg-cream/40 transition-colors"
                        >
                          <td className="py-3 px-4">
                            {enrollment.status === 'applied' && (
                              <input
                                type="checkbox"
                                checked={selectedEnrollments.has(enrollment.id)}
                                onChange={() => toggleSelect(enrollment.id)}
                                className="rounded border-gray-300 accent-teal"
                              />
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-medium text-navy text-sm">
                              {profile?.full_name ?? 'Unknown'}
                            </p>
                            <p className="text-gray-400 text-xs">{profile?.email ?? member?.member_id ?? '—'}</p>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {profile?.country ?? '—'}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600 tabular-nums">
                            {enrollment.farm_size_ha ? `${enrollment.farm_size_ha} ha` : '—'}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sCfg.color}`}>
                              {sCfg.label}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${eCfg.color}`}>
                              {eCfg.label}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-xs text-gray-400 whitespace-nowrap">
                            {fmtDate(enrollment.applied_at)}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-end gap-1.5">
                              {enrollment.status === 'applied' && (
                                <>
                                  <button
                                    onClick={() => handleEnrollmentAction(enrollment.id, 'approved', 'approved')}
                                    disabled={actionLoading === enrollment.id}
                                    title="Approve"
                                    className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition-colors disabled:opacity-50"
                                  >
                                    {actionLoading === enrollment.id ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <CheckCircle2 className="w-4 h-4" />
                                    )}
                                  </button>
                                  <button
                                    onClick={() => handleEnrollmentAction(enrollment.id, 'rejected')}
                                    disabled={actionLoading === enrollment.id}
                                    title="Reject"
                                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                              {member && (
                                <Link
                                  href={`/admin/members/${member.id}`}
                                  title="View Member"
                                  className="p-1.5 rounded-lg text-gray-400 hover:text-navy hover:bg-gray-100 transition-colors"
                                >
                                  <Eye className="w-4 h-4" />
                                </Link>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setConfirmDelete(false)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-navy">Delete Program</h3>
            <p className="text-sm text-gray-600">
              Are you sure you want to delete &ldquo;{program?.title}&rdquo;? This will also remove all enrollments and inclusions. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProgram}
                disabled={deletingProgram}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {deletingProgram && <Loader2 className="w-4 h-4 animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium transition-all ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.message}
        </div>
      )}
    </motion.div>
  );
}
