'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Search,
  Plus,
  Sprout,
  Globe,
  Users,
  BarChart3,
  Eye,
  Pencil,
  ChevronRight,
  Loader2,
  CheckCircle2,
  Clock,
  XCircle,
  Archive,
  Filter,
  DollarSign,
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
}

// ── Constants ─────────────────────────────────────────────────────────────

const COUNTRY_CROPS: Record<string, string[]> = {
  Uganda: ['Coffee', 'Cashews', 'Cocoa'],
  Zimbabwe: ['Blueberries', 'Sugarcane', 'Peas'],
  Tanzania: ['Coffee', 'Cashews'],
  Botswana: ['Sorghum', 'Millet'],
  Zambia: ['Maize', 'Soybeans'],
  Kenya: ['Tea', 'Horticulture'],
  Ghana: ['Cocoa', 'Cassava'],
  Nigeria: ['Sesame', 'Groundnuts'],
  'South Africa': ['Citrus', 'Wheat'],
};

const COUNTRY_FLAGS: Record<string, string> = {
  Uganda: '🇺🇬',
  Zimbabwe: '🇿🇼',
  Tanzania: '🇹🇿',
  Botswana: '🇧🇼',
  Zambia: '🇿🇲',
  Kenya: '🇰🇪',
  Ghana: '🇬🇭',
  Nigeria: '🇳🇬',
  'South Africa': '🇿🇦',
};

const ALL_COUNTRIES = Object.keys(COUNTRY_CROPS);
const ALL_CROPS = [...new Set(Object.values(COUNTRY_CROPS).flat())].sort();

// ── Status helpers ─────────────────────────────────────────────────────────

const statusConfig: Record<
  Program['status'],
  { label: string; color: string; icon: React.ReactNode; next: Program['status'] | null; nextLabel: string | null }
> = {
  draft: {
    label: 'Draft',
    color: 'bg-gray-100 text-gray-600',
    icon: <Clock className="w-3 h-3" />,
    next: 'active',
    nextLabel: 'Publish',
  },
  active: {
    label: 'Active',
    color: 'bg-green-100 text-green-700',
    icon: <CheckCircle2 className="w-3 h-3" />,
    next: 'closed',
    nextLabel: 'Close',
  },
  closed: {
    label: 'Closed',
    color: 'bg-amber-100 text-amber-700',
    icon: <XCircle className="w-3 h-3" />,
    next: 'completed',
    nextLabel: 'Complete',
  },
  completed: {
    label: 'Completed',
    color: 'bg-navy/10 text-navy',
    icon: <Archive className="w-3 h-3" />,
    next: null,
    nextLabel: null,
  },
};

// ── Animation variants ─────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 260, damping: 24 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

// ── Skeleton ──────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr className="border-b border-gray-50">
      {[1, 2, 3, 4, 5, 6, 7].map(i => (
        <td key={i} className="py-3 px-4">
          <div className="h-4 bg-gray-100 rounded animate-pulse" style={{ width: `${60 + i * 5}%` }} />
        </td>
      ))}
    </tr>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function AdminProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [toast, setToast] = useState<{message: string, type: 'success'|'error'}|null>(null);
  const showToast = (message: string, type: 'success'|'error' = 'success') => { setToast({message, type}); setTimeout(() => setToast(null), 3000); };

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [countryFilter, setCountryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [cropFilter, setCropFilter] = useState('all');

  // ── Fetch programs ───────────────────────────────────────────────────
  const fetchPrograms = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ status: 'all' });
      if (countryFilter !== 'all') params.set('country', countryFilter);
      if (cropFilter !== 'all') params.set('crop', cropFilter);
      const res = await fetch(`/api/programs?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch programs');
      const data = await res.json();
      setPrograms(data.programs ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countryFilter, cropFilter]);

  // ── Status toggle ────────────────────────────────────────────────────
  const handleStatusToggle = async (program: Program) => {
    const cfg = statusConfig[program.status];
    if (!cfg.next) return;

    setTogglingId(program.id);
    try {
      const res = await fetch(`/api/programs/${program.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: cfg.next }),
      });
      if (!res.ok) {
        const data = await res.json();
        showToast(data.error ?? 'Failed to update status', 'error');
        return;
      }
      setPrograms(prev =>
        prev.map(p => (p.id === program.id ? { ...p, status: cfg.next! } : p))
      );
    } catch {
      showToast('Failed to update program status', 'error');
    } finally {
      setTogglingId(null);
    }
  };

  // ── Delete program ──────────────────────────────────────────────────
  const handleDelete = async (programId: string) => {
    setDeletingId(programId);
    try {
      const res = await fetch(`/api/programs/${programId}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        showToast(data.error ?? 'Failed to delete program', 'error');
        return;
      }
      setPrograms(prev => prev.filter(p => p.id !== programId));
      showToast('Program deleted');
    } catch {
      showToast('Failed to delete program', 'error');
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  // ── Filtered list ────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let result = [...programs];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.country.toLowerCase().includes(q) ||
        p.crop.toLowerCase().includes(q) ||
        p.offtake_buyer?.toLowerCase().includes(q) ||
        p.region?.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter(p => p.status === statusFilter);
    }

    return result;
  }, [programs, searchQuery, statusFilter]);

  // ── Stats ────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total: programs.length,
    active: programs.filter(p => p.status === 'active').length,
    totalEnrollments: programs.reduce((sum, p) => sum + (p.current_participants ?? 0), 0),
    countries: new Set(programs.map(p => p.country)).size,
  }), [programs]);

  const statCards = [
    { label: 'Total Programs', value: stats.total, icon: <Sprout className="w-5 h-5" />, color: 'text-teal', bg: 'bg-teal/10' },
    { label: 'Active Programs', value: stats.active, icon: <CheckCircle2 className="w-5 h-5" />, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Total Enrollments', value: stats.totalEnrollments, icon: <Users className="w-5 h-5" />, color: 'text-navy', bg: 'bg-navy/10' },
    { label: 'Countries Covered', value: stats.countries, icon: <Globe className="w-5 h-5" />, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* ── Header ────────────────────────────────────────────────────── */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">Programs</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage agricultural programs across all countries</p>
        </div>
        <Link
          href="/admin/programs/new"
          className="inline-flex items-center gap-2 bg-teal text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal/90 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Create Program
        </Link>
      </motion.div>

      {/* ── Stat Cards ────────────────────────────────────────────────── */}
      <motion.div variants={containerVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <motion.div
            key={i}
            variants={cardVariants}
            whileHover={{ y: -2, boxShadow: '0 8px 25px rgba(27,42,74,0.08)' }}
            className="card-polished stat-card bg-white rounded-xl p-4 border border-gray-100"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-9 h-9 rounded-lg ${card.bg} flex items-center justify-center ${card.color}`}>
                {card.icon}
              </div>
            </div>
            <p className="text-2xl font-bold text-navy">{card.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{card.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Filter Bar ────────────────────────────────────────────────── */}
      <motion.div variants={fadeUp} className="bg-white rounded-xl border border-gray-100 p-4 card-polished">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title, country, crop..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors"
            />
          </div>

          {/* Country filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <select
              value={countryFilter}
              onChange={e => setCountryFilter(e.target.value)}
              className="pl-8 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal appearance-none bg-white transition-colors min-w-[140px]"
            >
              <option value="all">All Countries</option>
              {ALL_COUNTRIES.map(c => (
                <option key={c} value={c}>{COUNTRY_FLAGS[c]} {c}</option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal appearance-none bg-white transition-colors min-w-[130px]"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="closed">Closed</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Crop filter */}
          <div className="relative">
            <select
              value={cropFilter}
              onChange={e => setCropFilter(e.target.value)}
              className="pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal appearance-none bg-white transition-colors min-w-[130px]"
            >
              <option value="all">All Crops</option>
              {ALL_CROPS.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* ── Programs Table ─────────────────────────────────────────────── */}
      <motion.div variants={cardVariants} className="bg-white rounded-xl border border-gray-100 overflow-hidden card-polished">
        {/* Table header with count */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-teal" />
            <h3 className="font-semibold text-navy text-sm">
              {loading ? 'Loading...' : `${filtered.length} Program${filtered.length !== 1 ? 's' : ''}`}
            </h3>
          </div>
        </div>

        {error && (
          <div className="p-6 text-center">
            <p className="text-red-500 text-sm">{error}</p>
            <button
              onClick={fetchPrograms}
              className="mt-3 text-teal text-sm font-medium hover:underline"
            >
              Try again
            </button>
          </div>
        )}

        {!error && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-50 bg-gray-50/50">
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Country / Crop</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Program</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Enrollment</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Financing</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Created</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading && Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}

                {!loading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center">
                          <Sprout className="w-7 h-7 text-gray-300" />
                        </div>
                        <p className="text-gray-500 font-medium">No programs found</p>
                        <p className="text-gray-400 text-xs">
                          {programs.length === 0
                            ? 'Create your first program to get started.'
                            : 'Try adjusting your filters.'}
                        </p>
                        {programs.length === 0 && (
                          <Link
                            href="/admin/programs/new"
                            className="mt-2 inline-flex items-center gap-2 bg-teal text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal/90 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                            Create Program
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                )}

                {!loading && filtered.map(program => {
                  const cfg = statusConfig[program.status];
                  const enrollPct = program.max_participants
                    ? Math.min(100, Math.round((program.current_participants / program.max_participants) * 100))
                    : 0;

                  return (
                    <motion.tr
                      key={program.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-cream/40 transition-colors"
                    >
                      {/* Country / Crop */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{COUNTRY_FLAGS[program.country] ?? '🌍'}</span>
                          <div>
                            <p className="font-medium text-navy text-xs">{program.country}</p>
                            <p className="text-gray-500 text-xs">{program.crop}{program.crop_variety ? ` · ${program.crop_variety}` : ''}</p>
                          </div>
                        </div>
                      </td>

                      {/* Program */}
                      <td className="py-3 px-4">
                        <p className="font-medium text-navy text-sm line-clamp-1">{program.title}</p>
                        {program.season_number && (
                          <span className="inline-block mt-0.5 text-[10px] px-1.5 py-0.5 rounded bg-teal/10 text-teal font-medium">
                            Season {program.season_number}
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${cfg.color}`}>
                          {cfg.icon}
                          {cfg.label}
                        </span>
                      </td>

                      {/* Enrollment progress */}
                      <td className="py-3 px-4 min-w-[140px]">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-2 rounded-full transition-all ${enrollPct >= 90 ? 'bg-red-400' : enrollPct >= 60 ? 'bg-amber-400' : 'bg-teal'}`}
                              style={{ width: `${enrollPct}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 whitespace-nowrap tabular-nums">
                            {program.current_participants}{program.max_participants ? `/${program.max_participants}` : ''}
                          </span>
                        </div>
                      </td>

                      {/* Financing */}
                      <td className="py-3 px-4">
                        {program.financing_available ? (
                          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
                            <DollarSign className="w-3 h-3" />
                            {program.financing_percent ? `${program.financing_percent}%` : 'Yes'}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>

                      {/* Created */}
                      <td className="py-3 px-4 text-xs text-gray-400 whitespace-nowrap">
                        {new Date(program.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/programs/${program.id}`}
                            className="inline-flex items-center gap-1 text-xs text-teal font-medium hover:text-teal/80 transition-colors px-2 py-1 rounded hover:bg-teal/10"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View
                          </Link>
                          <Link
                            href={`/admin/programs/${program.id}?tab=edit`}
                            className="inline-flex items-center gap-1 text-xs text-gray-500 font-medium hover:text-navy transition-colors px-2 py-1 rounded hover:bg-gray-100"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            Edit
                          </Link>
                          {cfg.next && (
                            <button
                              onClick={() => handleStatusToggle(program)}
                              disabled={togglingId === program.id}
                              className="inline-flex items-center gap-1 text-xs font-medium text-navy border border-gray-200 px-2 py-1 rounded hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                              {togglingId === program.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <ChevronRight className="w-3.5 h-3.5" />
                              )}
                              {cfg.nextLabel}
                            </button>
                          )}
                          <button
                            onClick={() => setConfirmDeleteId(program.id)}
                            disabled={deletingId === program.id}
                            className="inline-flex items-center gap-1 text-xs font-medium text-red-500 px-2 py-1 rounded hover:bg-red-50 transition-colors disabled:opacity-50"
                          >
                            {deletingId === program.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setConfirmDeleteId(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-navy">Delete Program</h3>
            <p className="text-sm text-gray-600">
              Are you sure you want to delete this program? This will also remove all enrollments and inclusions. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDeleteId)}
                disabled={deletingId === confirmDeleteId}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {deletingId === confirmDeleteId && <Loader2 className="w-4 h-4 animate-spin" />}
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
