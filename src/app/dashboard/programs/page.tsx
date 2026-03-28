'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Calendar,
  Users,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  X,
  Loader2,
  Sprout,
  Wheat,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/supabase/auth-context';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ProgramInclusion {
  id: string;
  program_id: string;
  type: 'inputs' | 'insurance' | 'offtake' | 'financing' | 'advisory';
  title: string;
  description: string;
  value_estimate?: number;
  currency?: string;
}

interface Program {
  id: string;
  title: string;
  slug: string;
  country: string;
  crop: string;
  crop_variety?: string;
  season_number: number;
  description?: string;
  status: 'open' | 'closing_soon' | 'closed' | 'draft';
  max_participants: number;
  current_participants: number;
  min_farm_size_ha?: number;
  planting_start?: string;
  planting_end?: string;
  expected_harvest?: string;
  financing_available?: boolean;
  financing_percent?: number;
  offtake_buyer?: string;
  offtake_price_per_kg?: number;
  offtake_currency?: string;
  image_url?: string;
  inclusions?: ProgramInclusion[];
}

interface Enrollment {
  id: string;
  program_id: string;
  member_id: string;
  status: 'applied' | 'approved' | 'active' | 'completed' | 'rejected' | 'withdrawn';
  current_stage: 'discover' | 'approved' | 'inputs' | 'growing' | 'harvest' | 'offtake' | 'complete';
  farm_size_ha?: number;
  farm_location?: string;
  notes?: string;
  financing_requested?: boolean;
  applied_at?: string;
  approved_at?: string;
  program?: Program;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const COUNTRY_FLAGS: Record<string, string> = {
  Zimbabwe: '🇿🇼',
  Kenya: '🇰🇪',
  Tanzania: '🇹🇿',
  Uganda: '🇺🇬',
  Ghana: '🇬🇭',
  Nigeria: '🇳🇬',
  Ethiopia: '🇪🇹',
  Zambia: '🇿🇲',
  Mozambique: '🇲🇿',
};

const INCLUSION_CHIPS: Record<string, { label: string; emoji: string; bg: string; text: string }> = {
  inputs:    { label: 'Inputs',     emoji: '🌱', bg: 'bg-green-50',   text: 'text-green-700' },
  insurance: { label: 'Insurance',  emoji: '🛡️', bg: 'bg-blue-50',    text: 'text-blue-700'  },
  offtake:   { label: 'Offtake',    emoji: '🤝', bg: 'bg-amber-50',   text: 'text-amber-700' },
  financing: { label: 'Financing',  emoji: '💰', bg: 'bg-purple-50',  text: 'text-purple-700'},
  advisory:  { label: 'Advisory',   emoji: '📋', bg: 'bg-[#5DB347]/10',    text: 'text-[#449933]'  },
};

const STAGES = [
  { key: 'discover',  label: 'Discover'  },
  { key: 'approved',  label: 'Approved'  },
  { key: 'inputs',    label: 'Inputs'    },
  { key: 'growing',   label: 'Growing'   },
  { key: 'harvest',   label: 'Harvest'   },
  { key: 'offtake',   label: 'Offtake'   },
  { key: 'complete',  label: 'Complete'  },
];

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const fadeInUp = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const staggerContainer = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const staggerItem = {
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(dateStr?: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

function StatusBadge({ status }: { status: Program['status'] }) {
  if (status === 'open')         return <span className="inline-flex items-center gap-1 text-xs font-semibold bg-green-50 text-green-700 px-2.5 py-0.5 rounded-full">● Open</span>;
  if (status === 'closing_soon') return <span className="inline-flex items-center gap-1 text-xs font-semibold bg-amber-50 text-amber-700 px-2.5 py-0.5 rounded-full">● Closing Soon</span>;
  return <span className="inline-flex items-center gap-1 text-xs font-semibold bg-gray-100 text-gray-500 px-2.5 py-0.5 rounded-full">● Closed</span>;
}

function EnrollmentStatusBadge({ status }: { status: Enrollment['status'] }) {
  const map: Record<string, string> = {
    applied:   'bg-amber-50 text-amber-700',
    approved:  'bg-blue-50 text-blue-700',
    active:    'bg-green-50 text-green-700',
    completed: 'bg-[#5DB347]/10 text-[#449933]',
    rejected:  'bg-red-50 text-red-700',
    withdrawn: 'bg-gray-100 text-gray-500',
  };
  return (
    <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${map[status] || 'bg-gray-100 text-gray-500'}`}>
      {status}
    </span>
  );
}

function InclusionChips({ inclusions }: { inclusions?: ProgramInclusion[] }) {
  if (!inclusions || inclusions.length === 0) return null;
  const types = Array.from(new Set(inclusions.map((i) => i.type)));
  return (
    <div className="flex flex-wrap gap-1.5">
      {types.map((type) => {
        const chip = INCLUSION_CHIPS[type];
        if (!chip) return null;
        return (
          <span key={type} className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${chip.bg} ${chip.text}`}>
            {chip.emoji} {chip.label}
          </span>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Skeleton loader
// ---------------------------------------------------------------------------

function ProgramCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
      <div className="h-16 bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-100 rounded w-1/3" />
        <div className="h-3 bg-gray-100 rounded w-full" />
        <div className="h-3 bg-gray-100 rounded w-2/3" />
        <div className="h-8 bg-gray-100 rounded w-full mt-2" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Apply Modal
// ---------------------------------------------------------------------------

interface ApplyModalProps {
  program: Program;
  onClose: () => void;
  onSuccess: () => void;
}

function ApplyModal({ program, onClose, onSuccess }: ApplyModalProps) {
  const [farmSize, setFarmSize] = useState('');
  const [farmLocation, setFarmLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [financingRequested, setFinancingRequested] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch(`/api/programs/${program.id}/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farm_size_ha: parseFloat(farmSize) || null,
          farm_location: farmLocation,
          notes,
          financing_requested: financingRequested,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to submit application');
      }
      setSubmitted(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          {/* Modal header */}
          <div className="gradient-navy p-5 flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-[#5DB347] uppercase tracking-wider mb-1">Apply to Join</p>
              <h2 className="text-lg font-bold text-white">{program.title}</h2>
              <p className="text-sm text-gray-300 mt-0.5">
                {COUNTRY_FLAGS[program.country] || '🌍'} {program.country} · {program.crop}
              </p>
            </div>
            <button onClick={onClose} className="text-white/60 hover:text-white transition-colors mt-0.5">
              <X className="w-5 h-5" />
            </button>
          </div>

          {submitted ? (
            /* Success state */
            <div className="p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <CheckCircle className="w-8 h-8 text-green-500" />
              </motion.div>
              <h3 className="text-lg font-bold text-navy mb-2">Application Submitted!</h3>
              <p className="text-sm text-gray-500">We&apos;ll review your application and notify you within 48 hours.</p>
            </div>
          ) : (
            /* Form */
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {program.description && (
                <p className="text-sm text-gray-600 bg-cream/50 rounded-lg p-3">{program.description}</p>
              )}

              <div>
                <label className="block text-xs font-semibold text-navy mb-1.5">Farm Size (hectares) <span className="text-red-400">*</span></label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={farmSize}
                  onChange={(e) => setFarmSize(e.target.value)}
                  required
                  placeholder={program.min_farm_size_ha ? `Min. ${program.min_farm_size_ha} ha` : 'e.g. 2.5'}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-navy placeholder-gray-400 focus:outline-none focus:border-[#5DB347] focus:ring-1 focus:ring-[#5DB347]/20 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy mb-1.5">Farm Location <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={farmLocation}
                  onChange={(e) => setFarmLocation(e.target.value)}
                  required
                  placeholder="District / region where farm is located"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-navy placeholder-gray-400 focus:outline-none focus:border-[#5DB347] focus:ring-1 focus:ring-[#5DB347]/20 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy mb-1.5">Additional Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Any extra information you'd like to share…"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-navy placeholder-gray-400 focus:outline-none focus:border-[#5DB347] focus:ring-1 focus:ring-[#5DB347]/20 transition-colors resize-none"
                />
              </div>

              {program.financing_available && (
                <label className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 hover:border-[#5DB347]/30 cursor-pointer transition-colors bg-purple-50/40">
                  <input
                    type="checkbox"
                    checked={financingRequested}
                    onChange={(e) => setFinancingRequested(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-[#5DB347]"
                  />
                  <div>
                    <p className="text-sm font-semibold text-navy">Request input financing</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Cover up to {program.financing_percent ?? 100}% of input cost through AFU financing
                    </p>
                  </div>
                </label>
              )}

              {error && (
                <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 border border-gray-200 text-gray-600 rounded-xl py-2.5 text-sm font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 gradient-navy text-white rounded-xl py-2.5 text-sm font-semibold hover:opacity-90 disabled:opacity-60 transition-opacity flex items-center justify-center gap-2"
                >
                  {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</> : 'Submit Application'}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ---------------------------------------------------------------------------
// Program Card (available)
// ---------------------------------------------------------------------------

function ProgramCard({ program, onApply }: { program: Program; onApply: (p: Program) => void }) {
  const filled = program.current_participants;
  const max    = program.max_participants || 1;
  const pct    = Math.min(100, Math.round((filled / max) * 100));
  const flag   = COUNTRY_FLAGS[program.country] || '🌍';
  const isClosed = program.status === 'closed' || program.status === 'draft';

  return (
    <motion.div
      variants={staggerItem}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 card-polished flex flex-col"
    >
      {/* Card header */}
      <div className="gradient-navy px-4 py-3.5 flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-1.5 text-white font-semibold text-sm">
            <span>{flag}</span>
            <span>{program.country}</span>
            <span className="text-white/40">·</span>
            <span>{program.crop}</span>
            {program.crop_variety && <span className="text-white/60 font-normal">({program.crop_variety})</span>}
          </div>
          <p className="text-white/60 text-xs mt-0.5">Season {program.season_number}</p>
        </div>
        <StatusBadge status={program.status} />
      </div>

      {/* Card body */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        {/* Slots */}
        <div>
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {filled} of {max} spots filled
            </span>
            <span className="font-semibold text-navy">{pct}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div
              className="h-1.5 rounded-full transition-all"
              style={{
                width: `${pct}%`,
                background: pct >= 90 ? '#ef4444' : pct >= 70 ? '#f59e0b' : '#8CB89C',
              }}
            />
          </div>
        </div>

        {/* Inclusions */}
        <InclusionChips inclusions={program.inclusions} />

        {/* Offtake price */}
        {program.offtake_price_per_kg != null && (
          <p className="text-sm font-semibold text-[#5DB347]">
            {program.offtake_currency || '$'}{program.offtake_price_per_kg}/kg guaranteed
            {program.offtake_buyer && <span className="text-gray-400 font-normal"> · {program.offtake_buyer}</span>}
          </p>
        )}

        {/* Dates */}
        <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
          {program.planting_start && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Planting: {formatDate(program.planting_start)}
            </span>
          )}
          {program.expected_harvest && (
            <span className="flex items-center gap-1">
              <Wheat className="w-3.5 h-3.5" />
              Harvest: {formatDate(program.expected_harvest)}
            </span>
          )}
        </div>

        {/* CTA */}
        <div className="mt-auto pt-1">
          <button
            onClick={() => !isClosed && onApply(program)}
            disabled={isClosed}
            className="w-full gradient-navy text-white rounded-xl py-2.5 text-sm font-semibold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-2"
          >
            <Sprout className="w-4 h-4" />
            {isClosed ? 'Applications Closed' : 'Apply to Join'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Enrollment Card (my programs)
// ---------------------------------------------------------------------------

function EnrollmentCard({ enrollment }: { enrollment: Enrollment }) {
  const [expanded, setExpanded] = useState(false);
  const program = enrollment.program;
  if (!program) return null;

  const stageIndex = STAGES.findIndex((s) => s.key === enrollment.current_stage);
  const flag       = COUNTRY_FLAGS[program.country] || '🌍';

  return (
    <motion.div
      variants={staggerItem}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden card-polished"
    >
      {/* Header */}
      <div className="gradient-navy px-4 py-3.5 flex items-center justify-between gap-2">
        <div>
          <p className="text-white font-semibold text-sm">
            {flag} {program.crop} · {program.country}
          </p>
          <p className="text-white/60 text-xs mt-0.5">Season {program.season_number}</p>
        </div>
        <EnrollmentStatusBadge status={enrollment.status} />
      </div>

      <div className="p-4 space-y-4">
        {/* Stage stepper */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2.5">Progress</p>
          <div className="flex items-center gap-0 overflow-x-auto pb-1">
            {STAGES.map((stage, idx) => {
              const isDone    = idx < stageIndex;
              const isCurrent = idx === stageIndex;
              const isLast    = idx === STAGES.length - 1;
              return (
                <div key={stage.key} className="flex items-center min-w-0">
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                        isDone    ? 'bg-[#5DB347] text-white' :
                        isCurrent ? 'bg-navy text-white ring-2 ring-[#5DB347]/40' :
                                    'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {isDone ? '✓' : idx + 1}
                    </div>
                    <span className={`text-[10px] font-medium leading-none ${isCurrent ? 'text-navy' : isDone ? 'text-[#5DB347]' : 'text-gray-400'}`}>
                      {stage.label}
                    </span>
                  </div>
                  {!isLast && (
                    <div className={`h-0.5 w-5 mx-0.5 shrink-0 ${idx < stageIndex ? 'bg-[#5DB347]' : 'bg-gray-100'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Meta row */}
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-gray-500">
          {enrollment.applied_at && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Applied {formatDate(enrollment.applied_at)}
            </span>
          )}
          {program.expected_harvest && (
            <span className="flex items-center gap-1">
              <Wheat className="w-3.5 h-3.5" />
              Expected harvest {formatDate(program.expected_harvest)}
            </span>
          )}
          {enrollment.farm_location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {enrollment.farm_location}
            </span>
          )}
        </div>

        {/* Inclusions */}
        <InclusionChips inclusions={program.inclusions} />

        {/* View Details accordion */}
        <button
          onClick={() => setExpanded((v) => !v)}
          className="w-full flex items-center justify-between text-sm font-medium text-[#5DB347] hover:text-navy transition-colors pt-1 border-t border-gray-50"
        >
          {expanded ? 'Hide Details' : 'View Details'}
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22 }}
              className="overflow-hidden"
            >
              <div className="pt-2 space-y-2 text-sm text-gray-600">
                {program.description && <p className="bg-cream/50 rounded-lg p-3 text-xs">{program.description}</p>}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {enrollment.farm_size_ha != null && (
                    <div className="bg-gray-50 rounded-lg p-2.5">
                      <p className="text-gray-400 font-medium">Farm Size</p>
                      <p className="font-semibold text-navy mt-0.5">{enrollment.farm_size_ha} ha</p>
                    </div>
                  )}
                  {enrollment.financing_requested && (
                    <div className="bg-purple-50 rounded-lg p-2.5">
                      <p className="text-gray-400 font-medium">Financing</p>
                      <p className="font-semibold text-purple-700 mt-0.5">Requested</p>
                    </div>
                  )}
                  {program.offtake_price_per_kg != null && (
                    <div className="bg-[#5DB347]/5 rounded-lg p-2.5">
                      <p className="text-gray-400 font-medium">Offtake Price</p>
                      <p className="font-semibold text-[#5DB347] mt-0.5">{program.offtake_currency || '$'}{program.offtake_price_per_kg}/kg</p>
                    </div>
                  )}
                  {program.planting_start && (
                    <div className="bg-green-50 rounded-lg p-2.5">
                      <p className="text-gray-400 font-medium">Planting Start</p>
                      <p className="font-semibold text-navy mt-0.5">{formatDate(program.planting_start)}</p>
                    </div>
                  )}
                </div>
                {enrollment.notes && (
                  <div className="text-xs bg-gray-50 rounded-lg p-2.5">
                    <p className="text-gray-400 font-medium mb-0.5">Your Notes</p>
                    <p className="text-gray-600">{enrollment.notes}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function ProgramsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'available' | 'mine'>('available');

  // Programs
  const [programs, setPrograms]     = useState<Program[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');

  // Enrollments
  const [enrollments, setEnrollments]   = useState<Enrollment[]>([]);
  const [enrollLoading, setEnrollLoading] = useState(true);

  // Filters
  const [countryFilter, setCountryFilter] = useState('');
  const [cropFilter, setCropFilter]       = useState('');

  // Modal
  const [applyProgram, setApplyProgram] = useState<Program | null>(null);

  // Fetch available programs
  useEffect(() => {
    setLoading(true);
    fetch('/api/programs')
      .then((r) => r.json())
      .then((data) => { setPrograms(data.programs || []); })
      .catch(() => { setError('Could not load programs. Please try again.'); })
      .finally(() => { setLoading(false); });
  }, []);

  // Fetch member enrollments
  useEffect(() => {
    if (!user?.id) { setEnrollLoading(false); return; }
    const supabase = createClient();
    supabase
      .from('program_enrollments')
      .select(`*, program:programs(*, inclusions:program_inclusions(*))`)
      .eq('member_id', user.id)
      .order('applied_at', { ascending: false })
      .then(({ data, error: err }) => {
        if (!err && data) setEnrollments(data as Enrollment[]);
        setEnrollLoading(false);
      });
  }, [user?.id]);

  // Derived filter options
  const countries = Array.from(new Set(programs.map((p) => p.country))).sort();
  const crops     = Array.from(new Set(programs.map((p) => p.crop))).sort();

  const filteredPrograms = programs.filter((p) => {
    if (countryFilter && p.country !== countryFilter) return false;
    if (cropFilter    && p.crop    !== cropFilter)    return false;
    return true;
  });

  function handleApplySuccess() {
    // Re-fetch enrollments after successful apply
    if (!user?.id) return;
    const supabase = createClient();
    supabase
      .from('program_enrollments')
      .select(`*, program:programs(*, inclusions:program_inclusions(*))`)
      .eq('member_id', user.id)
      .order('applied_at', { ascending: false })
      .then(({ data }) => { if (data) setEnrollments(data as Enrollment[]); });
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <motion.div variants={fadeInUp} initial="hidden" animate="visible">
        <h1 className="text-2xl font-bold text-navy">Crop Programs</h1>
        <p className="text-sm text-gray-500 mt-0.5">Fully supported farming programs — inputs, insurance & guaranteed offtake bundled.</p>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="flex gap-1 bg-gray-100/60 rounded-xl p-1 w-fit">
        {(['available', 'mine'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === tab
                ? 'bg-white text-navy shadow-sm'
                : 'text-gray-500 hover:text-navy'
            }`}
          >
            {tab === 'available' ? 'Available Programs' : `My Programs${enrollments.length > 0 ? ` (${enrollments.length})` : ''}`}
          </button>
        ))}
      </motion.div>

      {/* ---------------------------------------------------------------- */}
      {/* AVAILABLE PROGRAMS TAB                                           */}
      {/* ---------------------------------------------------------------- */}
      {activeTab === 'available' && (
        <div className="space-y-5">
          {/* Intro banner */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="gradient-navy rounded-2xl p-5 md:p-6 relative overflow-hidden"
          >
            <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/5 rounded-full pointer-events-none" />
            <div className="absolute right-0 bottom-0 w-24 h-24 bg-[#5DB347]/10 rounded-full pointer-events-none" />
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="text-4xl">🌱</div>
              <div>
                <h2 className="text-lg font-bold text-white">AFU Crop Programs</h2>
                <p className="text-sm text-gray-300 mt-0.5">
                  Join a fully supported farming program. Inputs, insurance &amp; guaranteed offtake — all bundled for you.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Filters */}
          <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
              <select
                value={countryFilter}
                onChange={(e) => setCountryFilter(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-navy bg-white focus:outline-none focus:border-[#5DB347] focus:ring-1 focus:ring-[#5DB347]/20 transition-colors"
              >
                <option value="">All Countries</option>
                {countries.map((c) => <option key={c} value={c}>{COUNTRY_FLAGS[c] || ''} {c}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Wheat className="w-4 h-4 text-gray-400 shrink-0" />
              <select
                value={cropFilter}
                onChange={(e) => setCropFilter(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-navy bg-white focus:outline-none focus:border-[#5DB347] focus:ring-1 focus:ring-[#5DB347]/20 transition-colors"
              >
                <option value="">All Crops</option>
                {crops.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            {(countryFilter || cropFilter) && (
              <button
                onClick={() => { setCountryFilter(''); setCropFilter(''); }}
                className="text-sm text-gray-500 hover:text-navy transition-colors flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" /> Clear filters
              </button>
            )}
          </motion.div>

          {/* Cards grid */}
          {error && (
            <div className="bg-red-50 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {[1, 2, 3].map((i) => <ProgramCardSkeleton key={i} />)}
            </div>
          ) : filteredPrograms.length === 0 ? (
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="text-center py-16 text-gray-400"
            >
              <div className="text-5xl mb-3">🌾</div>
              <p className="text-base font-semibold text-navy">No programs found</p>
              <p className="text-sm mt-1">Try adjusting your filters or check back soon for new programs.</p>
            </motion.div>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
            >
              {filteredPrograms.map((p) => (
                <ProgramCard key={p.id} program={p} onApply={setApplyProgram} />
              ))}
            </motion.div>
          )}
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* MY PROGRAMS TAB                                                  */}
      {/* ---------------------------------------------------------------- */}
      {activeTab === 'mine' && (
        <div className="space-y-5">
          {enrollLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[1, 2].map((i) => <ProgramCardSkeleton key={i} />)}
            </div>
          ) : enrollments.length === 0 ? (
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="text-center py-20"
            >
              <div className="text-6xl mb-4">🌱🌿🌾</div>
              <h3 className="text-lg font-bold text-navy mb-1">You haven&apos;t joined any programs yet</h3>
              <p className="text-sm text-gray-500 mb-5">Browse available programs and apply to get started with a fully supported growing season.</p>
              <button
                onClick={() => setActiveTab('available')}
                className="inline-flex items-center gap-2 gradient-navy text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                Browse Available Programs
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 gap-5"
            >
              {enrollments.map((e) => (
                <EnrollmentCard key={e.id} enrollment={e} />
              ))}
            </motion.div>
          )}
        </div>
      )}

      {/* Apply modal */}
      {applyProgram && (
        <ApplyModal
          program={applyProgram}
          onClose={() => setApplyProgram(null)}
          onSuccess={handleApplySuccess}
        />
      )}
    </div>
  );
}
