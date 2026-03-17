'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Stethoscope,
  Syringe,
  Pill,
  Scissors,
  Bug,
  Droplets,
  Search,
  Calendar,
  DollarSign,
  AlertTriangle,
  Clock,
  ChevronDown,
  ChevronRight,
  ArrowLeft,
  Plus,
  FileText,
  CheckCircle2,
  XCircle,
  User,
  Building2,
  CalendarDays,
  Activity,
  ChevronUp,
} from 'lucide-react';
import { animals, vetRecords, type VetRecord } from '@/lib/data/livestock';

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 100, damping: 15 },
  },
};

// ---------------------------------------------------------------------------
// Types & Constants
// ---------------------------------------------------------------------------

type TabKey = 'all' | 'vaccinations' | 'treatments' | 'schedule';
type RecordTypeFilter = VetRecord['type'] | 'all';
type DateRangeFilter = '7' | '30' | '90' | 'all';

const RECORD_TYPE_CONFIG: Record<
  VetRecord['type'],
  { label: string; icon: React.ComponentType<{ size?: number; className?: string }>; color: string; bgColor: string }
> = {
  vaccination: { label: 'Vaccination', icon: Syringe, color: 'text-green-600', bgColor: 'bg-green-100' },
  treatment: { label: 'Treatment', icon: Pill, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  checkup: { label: 'Checkup', icon: Stethoscope, color: 'text-teal-600', bgColor: 'bg-teal-100' },
  surgery: { label: 'Surgery', icon: Scissors, color: 'text-red-600', bgColor: 'bg-red-100' },
  deworming: { label: 'Deworming', icon: Bug, color: 'text-amber-600', bgColor: 'bg-amber-100' },
  dipping: { label: 'Dipping', icon: Droplets, color: 'text-cyan-600', bgColor: 'bg-cyan-100' },
};

const STATUS_COLORS = {
  completed: 'bg-green-100 text-green-700',
  upcoming: 'bg-amber-100 text-amber-700',
  overdue: 'bg-red-100 text-red-700',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function daysFromNow(dateStr: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function getAnimalTag(animalId: string): string {
  const animal = animals.find((a) => a.id === animalId);
  return animal?.tag || '';
}

function getCountdownBadge(daysLeft: number): { text: string; className: string } {
  if (daysLeft < 0) {
    return { text: `${Math.abs(daysLeft)}d overdue`, className: 'bg-red-100 text-red-700' };
  }
  if (daysLeft === 0) {
    return { text: 'Due today', className: 'bg-amber-100 text-amber-700' };
  }
  if (daysLeft <= 7) {
    return { text: `${daysLeft}d remaining`, className: 'bg-amber-100 text-amber-700' };
  }
  if (daysLeft <= 30) {
    return { text: `${daysLeft}d remaining`, className: 'bg-blue-100 text-blue-700' };
  }
  return { text: `${daysLeft}d remaining`, className: 'bg-gray-100 text-gray-600' };
}

function getMonthKey(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function getMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-');
  const d = new Date(Number(year), Number(month) - 1, 1);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function RecordCard({ record, defaultExpanded = false }: { record: VetRecord; defaultExpanded?: boolean }) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const config = RECORD_TYPE_CONFIG[record.type];
  const Icon = config.icon;
  const animalName = record.animalName;
  const animalTag = getAnimalTag(record.animalId);
  const daysLeft = record.nextDueDate ? daysFromNow(record.nextDueDate) : null;
  const countdown = daysLeft !== null ? getCountdownBadge(daysLeft) : null;

  return (
    <motion.div
      variants={cardVariants}
      className="rounded-2xl bg-white border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="p-4 lg:p-5">
        <div className="flex items-start gap-3">
          {/* Type Icon */}
          <div className={`w-10 h-10 rounded-xl ${config.bgColor} flex items-center justify-center shrink-0`}>
            <Icon size={20} className={config.color} />
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Top Row: Animal name + type badge */}
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-[#1B2A4A] truncate">{animalName}</h3>
              {animalTag && (
                <span className="text-[10px] font-mono text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">
                  {animalTag}
                </span>
              )}
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${config.bgColor} ${config.color}`}>
                {config.label}
              </span>
            </div>

            {/* Description */}
            <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">{record.description}</p>

            {/* Meta Row */}
            <div className="flex items-center gap-3 mt-2.5 flex-wrap">
              {/* Date */}
              <div className="flex items-center gap-1 text-[11px] text-gray-500">
                <CalendarDays size={12} className="text-gray-400" />
                {formatDate(record.date)}
              </div>

              {/* Vet */}
              <div className="flex items-center gap-1 text-[11px] text-gray-500">
                <User size={12} className="text-gray-400" />
                <span className="truncate max-w-[120px]">{record.veterinarian}</span>
              </div>

              {/* Clinic */}
              <div className="flex items-center gap-1 text-[11px] text-gray-500">
                <Building2 size={12} className="text-gray-400" />
                <span className="truncate max-w-[140px]">{record.clinic}</span>
              </div>

              {/* Cost */}
              <div className="flex items-center gap-1 text-[11px] font-semibold text-[#1B2A4A]">
                <DollarSign size={12} className="text-gray-400" />
                {formatCurrency(record.cost)}
              </div>
            </div>

            {/* Medications */}
            {record.medications.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {record.medications.map((med) => (
                  <span
                    key={med}
                    className="text-[10px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-medium"
                  >
                    {med}
                  </span>
                ))}
              </div>
            )}

            {/* Next Due Date */}
            {record.nextDueDate && countdown && (
              <div className="flex items-center gap-2 mt-2.5">
                <span className="text-[11px] text-gray-500">
                  Next due: {formatDate(record.nextDueDate)}
                </span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${countdown.className}`}>
                  {countdown.text}
                </span>
              </div>
            )}

            {/* Notes (expandable) */}
            {record.notes && (
              <div className="mt-2">
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="flex items-center gap-1 text-[11px] text-[#2AA198] font-medium hover:text-[#1A7A72] transition-colors"
                >
                  {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  {expanded ? 'Hide notes' : 'Show notes'}
                </button>
                <AnimatePresence>
                  {expanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="text-[11px] text-gray-500 mt-1.5 bg-gray-50 rounded-lg p-2.5 leading-relaxed">
                        {record.notes}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function VaccinationCalendarCard({
  record,
  status,
}: {
  record: VetRecord;
  status: 'completed' | 'upcoming' | 'overdue';
}) {
  const statusConfig = {
    completed: { bg: 'bg-green-50 border-green-200', dot: 'bg-green-500', label: 'Completed', labelCls: STATUS_COLORS.completed },
    upcoming: { bg: 'bg-amber-50 border-amber-200', dot: 'bg-amber-500', label: 'Upcoming', labelCls: STATUS_COLORS.upcoming },
    overdue: { bg: 'bg-red-50 border-red-200', dot: 'bg-red-500', label: 'Overdue', labelCls: STATUS_COLORS.overdue },
  };

  const cfg = statusConfig[status];

  return (
    <motion.div
      variants={cardVariants}
      className={`rounded-xl border p-3 ${cfg.bg}`}
    >
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${cfg.dot} shrink-0`} />
        <span className="text-xs font-semibold text-[#1B2A4A] truncate">{record.animalName}</span>
        <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ml-auto ${cfg.labelCls}`}>
          {cfg.label}
        </span>
      </div>
      <p className="text-[11px] text-gray-600 mt-1 leading-snug line-clamp-2">{record.description}</p>
      <div className="flex items-center gap-2 mt-1.5 text-[10px] text-gray-500">
        <CalendarDays size={10} />
        {formatDate(status === 'completed' ? record.date : record.nextDueDate || record.date)}
        {record.medications.length > 0 && (
          <>
            <span className="text-gray-300">|</span>
            <span className="truncate">{record.medications[0]}</span>
          </>
        )}
      </div>
    </motion.div>
  );
}

function ScheduleItem({ record, isOverdue }: { record: VetRecord; isOverdue: boolean }) {
  const config = RECORD_TYPE_CONFIG[record.type];
  const Icon = config.icon;
  const dateStr = record.nextDueDate || record.date;
  const daysLeft = daysFromNow(dateStr);

  return (
    <motion.div
      variants={cardVariants}
      className={`rounded-xl border p-3.5 flex items-center gap-3 ${
        isOverdue
          ? 'bg-red-50 border-red-200'
          : 'bg-white border-gray-100 hover:border-gray-200'
      } transition-colors`}
    >
      <div className={`w-9 h-9 rounded-lg ${config.bgColor} flex items-center justify-center shrink-0`}>
        <Icon size={16} className={config.color} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#1B2A4A] truncate">{record.animalName}</span>
          <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${config.bgColor} ${config.color}`}>
            {config.label}
          </span>
        </div>
        <p className="text-[10px] text-gray-500 mt-0.5 truncate">{record.description}</p>
      </div>
      <div className="text-right shrink-0">
        <div className="text-[11px] font-semibold text-[#1B2A4A]">{formatDate(dateStr)}</div>
        {isOverdue ? (
          <span className="text-[9px] font-semibold text-red-600">{Math.abs(daysLeft)}d overdue</span>
        ) : daysLeft === 0 ? (
          <span className="text-[9px] font-semibold text-amber-600">Today</span>
        ) : (
          <span className="text-[9px] text-gray-400">{daysLeft}d away</span>
        )}
      </div>
      <button className="text-[10px] font-semibold text-[#2AA198] hover:text-[#1A7A72] px-2 py-1 rounded-lg hover:bg-teal-50 transition-colors shrink-0">
        + Schedule
      </button>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main Page Component
// ---------------------------------------------------------------------------

export default function LivestockHealthPage() {
  // --- State ---
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [typeFilter, setTypeFilter] = useState<RecordTypeFilter>('all');
  const [animalFilter, setAnimalFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<DateRangeFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [treatmentFilter, setTreatmentFilter] = useState<'active' | 'completed'>('active');
  const [showAnimalDropdown, setShowAnimalDropdown] = useState(false);

  // --- Derived data ---
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];

  // Summary stats
  const stats = useMemo(() => {
    const totalVisits = vetRecords.length;

    const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    const thisMonthCost = vetRecords
      .filter((r) => r.date.startsWith(currentMonth))
      .reduce((sum, r) => sum + r.cost, 0);

    const overdueVaccinations = vetRecords.filter(
      (r) => r.nextDueDate && r.nextDueDate < todayStr
    ).length;

    const upcomingDates = vetRecords
      .filter((r) => r.nextDueDate && r.nextDueDate >= todayStr)
      .map((r) => r.nextDueDate!)
      .sort();
    const nextScheduled = upcomingDates[0] || null;

    return { totalVisits, thisMonthCost, overdueVaccinations, nextScheduled };
  }, [todayStr]);

  // Filtered records for All Records tab
  const filteredRecords = useMemo(() => {
    let records = [...vetRecords];

    // Type filter
    if (typeFilter !== 'all') {
      records = records.filter((r) => r.type === typeFilter);
    }

    // Animal filter
    if (animalFilter !== 'all') {
      records = records.filter((r) => r.animalId === animalFilter);
    }

    // Date range filter
    if (dateRange !== 'all') {
      const days = Number(dateRange);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      const cutoffStr = cutoff.toISOString().split('T')[0];
      records = records.filter((r) => r.date >= cutoffStr);
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      records = records.filter(
        (r) =>
          r.description.toLowerCase().includes(q) ||
          r.animalName.toLowerCase().includes(q) ||
          r.veterinarian.toLowerCase().includes(q) ||
          r.clinic.toLowerCase().includes(q) ||
          r.medications.some((m) => m.toLowerCase().includes(q)) ||
          (r.notes && r.notes.toLowerCase().includes(q))
      );
    }

    // Sort by date descending
    records.sort((a, b) => b.date.localeCompare(a.date));

    return records;
  }, [typeFilter, animalFilter, dateRange, searchQuery]);

  // Vaccination tab data
  const vaccinationData = useMemo(() => {
    const vaccinations = vetRecords.filter((r) => r.type === 'vaccination');
    const completedVaccinations = vaccinations.filter((r) => r.date <= todayStr);
    const upcomingVaccinations = vaccinations.filter(
      (r) => r.nextDueDate && r.nextDueDate >= todayStr
    );
    const overdueVaccinations = vaccinations.filter(
      (r) => r.nextDueDate && r.nextDueDate < todayStr
    );

    // Group completed by month
    const byMonth: Record<string, { record: VetRecord; status: 'completed' | 'upcoming' | 'overdue' }[]> = {};

    for (const rec of completedVaccinations) {
      const key = getMonthKey(rec.date);
      if (!byMonth[key]) byMonth[key] = [];
      byMonth[key].push({ record: rec, status: 'completed' });
    }

    for (const rec of upcomingVaccinations) {
      const key = getMonthKey(rec.nextDueDate!);
      if (!byMonth[key]) byMonth[key] = [];
      byMonth[key].push({ record: rec, status: 'upcoming' });
    }

    for (const rec of overdueVaccinations) {
      const key = getMonthKey(rec.nextDueDate!);
      if (!byMonth[key]) byMonth[key] = [];
      byMonth[key].push({ record: rec, status: 'overdue' });
    }

    // Sort months
    const sortedMonths = Object.keys(byMonth).sort((a, b) => b.localeCompare(a));

    return { byMonth, sortedMonths, overdueCount: overdueVaccinations.length };
  }, [todayStr]);

  // Treatment tab data
  const treatmentData = useMemo(() => {
    const treatments = vetRecords.filter((r) => r.type === 'treatment');
    const active = treatments.filter(
      (r) => r.nextDueDate && r.nextDueDate >= todayStr
    );
    const completed = treatments.filter(
      (r) => !r.nextDueDate || r.nextDueDate < todayStr
    );
    return { active, completed };
  }, [todayStr]);

  // Schedule tab data
  const scheduleData = useMemo(() => {
    const ninetyDaysFromNow = new Date();
    ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);
    const cutoffStr = ninetyDaysFromNow.toISOString().split('T')[0];

    // Overdue items
    const overdue = vetRecords
      .filter((r) => r.nextDueDate && r.nextDueDate < todayStr)
      .sort((a, b) => a.nextDueDate!.localeCompare(b.nextDueDate!));

    // Upcoming items (next 90 days)
    const upcoming = vetRecords
      .filter((r) => r.nextDueDate && r.nextDueDate >= todayStr && r.nextDueDate <= cutoffStr)
      .sort((a, b) => a.nextDueDate!.localeCompare(b.nextDueDate!));

    // Future scheduled visits
    const futureVisits = vetRecords
      .filter((r) => r.date > todayStr && r.date <= cutoffStr)
      .sort((a, b) => a.date.localeCompare(b.date));

    // Calendar dots grouped by date
    const calendarDots: Record<string, VetRecord['type'][]> = {};
    for (const rec of [...upcoming, ...futureVisits]) {
      const dateKey = rec.nextDueDate || rec.date;
      if (!calendarDots[dateKey]) calendarDots[dateKey] = [];
      calendarDots[dateKey].push(rec.type);
    }

    return { overdue, upcoming, futureVisits, calendarDots };
  }, [todayStr]);

  // --- Unique animals for dropdown ---
  const uniqueAnimals = useMemo(() => {
    const seen = new Set<string>();
    const result: { id: string; name: string }[] = [];
    for (const rec of vetRecords) {
      if (!seen.has(rec.animalId)) {
        seen.add(rec.animalId);
        result.push({ id: rec.animalId, name: rec.animalName });
      }
    }
    return result.sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  // --- Tabs ---
  const tabs: { key: TabKey; label: string }[] = [
    { key: 'all', label: 'All Records' },
    { key: 'vaccinations', label: 'Vaccinations' },
    { key: 'treatments', label: 'Treatments' },
    { key: 'schedule', label: 'Schedule' },
  ];

  const typeFilterOptions: { key: RecordTypeFilter; label: string }[] = [
    { key: 'all', label: 'All Types' },
    { key: 'vaccination', label: 'Vaccination' },
    { key: 'treatment', label: 'Treatment' },
    { key: 'checkup', label: 'Checkup' },
    { key: 'surgery', label: 'Surgery' },
    { key: 'deworming', label: 'Deworming' },
    { key: 'dipping', label: 'Dipping' },
  ];

  const dateRangeOptions: { key: DateRangeFilter; label: string }[] = [
    { key: '7', label: 'Last 7 days' },
    { key: '30', label: 'Last 30 days' },
    { key: '90', label: 'Last 90 days' },
    { key: 'all', label: 'All' },
  ];

  // =========================================================================
  // Render
  // =========================================================================

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ---------------------------------------------------------------- */}
      {/* Header                                                           */}
      {/* ---------------------------------------------------------------- */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-br from-[#2AA198] via-[#2AA198] to-[#1B2A4A]/30 text-white"
      >
        <div className="max-w-6xl mx-auto px-4 lg:px-6 py-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <Stethoscope size={28} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
                  Health Records
                </h1>
                <p className="text-white/70 text-sm mt-1">
                  Vaccination schedules, treatments, and veterinary history
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/farm/livestock"
                className="hidden sm:flex items-center gap-1.5 text-white/70 hover:text-white text-sm font-medium transition-colors"
              >
                <ArrowLeft size={16} />
                Back to Livestock
              </Link>
              <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors">
                <Plus size={16} />
                Record Visit
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-6xl mx-auto px-4 lg:px-6 py-6">
        {/* ---------------------------------------------------------------- */}
        {/* Summary Bar                                                      */}
        {/* ---------------------------------------------------------------- */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6"
        >
          {[
            {
              label: 'Total Vet Visits',
              value: stats.totalVisits.toString(),
              icon: <Activity size={20} className="text-[#2AA198]" />,
              accent: 'bg-teal-50',
            },
            {
              label: "This Month's Cost",
              value: formatCurrency(stats.thisMonthCost),
              icon: <DollarSign size={20} className="text-amber-500" />,
              accent: 'bg-amber-50',
            },
            {
              label: 'Overdue Vaccinations',
              value: stats.overdueVaccinations.toString(),
              icon: <AlertTriangle size={20} className="text-red-500" />,
              accent: 'bg-red-50',
            },
            {
              label: 'Next Scheduled',
              value: stats.nextScheduled ? formatDate(stats.nextScheduled) : 'None',
              icon: <Calendar size={20} className="text-blue-500" />,
              accent: 'bg-blue-50',
            },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              variants={cardVariants}
              className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl ${stat.accent} flex items-center justify-center`}
                >
                  {stat.icon}
                </div>
                <div>
                  <div className="text-lg font-bold text-[#1B2A4A]">
                    {stat.value}
                  </div>
                  <div className="text-[11px] text-gray-400">{stat.label}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ---------------------------------------------------------------- */}
        {/* Tab Switcher                                                     */}
        {/* ---------------------------------------------------------------- */}
        <div className="flex items-center gap-1 bg-white rounded-xl p-1 border border-gray-100 shadow-sm mb-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 min-w-[120px] text-sm font-semibold py-2.5 px-4 rounded-lg transition-all whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-[#1B2A4A] text-white shadow-sm'
                  : 'text-gray-500 hover:text-[#1B2A4A] hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ================================================================ */}
        {/* TAB CONTENT                                                      */}
        {/* ================================================================ */}
        <AnimatePresence mode="wait">
          {/* ============================================================== */}
          {/* ALL RECORDS TAB                                                */}
          {/* ============================================================== */}
          {activeTab === 'all' && (
            <motion.div
              key="all"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Filters */}
              <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm mb-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* Type filter */}
                  <div>
                    <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1 block">
                      Record Type
                    </label>
                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value as RecordTypeFilter)}
                      className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 text-gray-700 bg-white focus:border-[#2AA198] focus:ring-1 focus:ring-[#2AA198] outline-none transition-colors"
                    >
                      {typeFilterOptions.map((opt) => (
                        <option key={opt.key} value={opt.key}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Animal filter */}
                  <div className="relative">
                    <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1 block">
                      Animal
                    </label>
                    <select
                      value={animalFilter}
                      onChange={(e) => setAnimalFilter(e.target.value)}
                      className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 text-gray-700 bg-white focus:border-[#2AA198] focus:ring-1 focus:ring-[#2AA198] outline-none transition-colors"
                    >
                      <option value="all">All Animals</option>
                      {uniqueAnimals.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Date range */}
                  <div>
                    <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1 block">
                      Date Range
                    </label>
                    <div className="flex gap-1">
                      {dateRangeOptions.map((opt) => (
                        <button
                          key={opt.key}
                          onClick={() => setDateRange(opt.key)}
                          className={`flex-1 text-[10px] font-medium py-2 px-1 rounded-lg border transition-all ${
                            dateRange === opt.key
                              ? 'bg-[#1B2A4A] text-white border-[#1B2A4A]'
                              : 'bg-white text-gray-600 border-gray-200 hover:border-[#2AA198]'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Search */}
                  <div>
                    <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1 block">
                      Search
                    </label>
                    <div className="relative">
                      <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search records..."
                        className="w-full text-xs border border-gray-200 rounded-lg pl-8 pr-3 py-2 text-gray-700 bg-white focus:border-[#2AA198] focus:ring-1 focus:ring-[#2AA198] outline-none transition-colors placeholder:text-gray-400"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Results count */}
              <div className="text-xs text-gray-400 mb-3 px-1">
                Showing {filteredRecords.length} of {vetRecords.length} records
              </div>

              {/* Records List */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-3"
              >
                {filteredRecords.length === 0 ? (
                  <motion.div
                    variants={cardVariants}
                    className="text-center py-16 bg-white rounded-2xl border border-gray-100"
                  >
                    <FileText size={40} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-sm text-gray-500 font-medium">No records found</p>
                    <p className="text-xs text-gray-400 mt-1">Try adjusting your filters</p>
                  </motion.div>
                ) : (
                  filteredRecords.map((record) => (
                    <RecordCard key={record.id} record={record} />
                  ))
                )}
              </motion.div>
            </motion.div>
          )}

          {/* ============================================================== */}
          {/* VACCINATIONS TAB                                               */}
          {/* ============================================================== */}
          {activeTab === 'vaccinations' && (
            <motion.div
              key="vaccinations"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Overdue alert */}
              {vaccinationData.overdueCount > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 flex items-center gap-3"
                >
                  <AlertTriangle size={20} className="text-red-500 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-red-700">
                      {vaccinationData.overdueCount} Overdue Vaccination{vaccinationData.overdueCount > 1 ? 's' : ''}
                    </p>
                    <p className="text-xs text-red-600 mt-0.5">
                      Please schedule these vaccinations as soon as possible.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Vaccination Calendar */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-6"
              >
                {vaccinationData.sortedMonths.map((monthKey) => {
                  const items = vaccinationData.byMonth[monthKey];
                  return (
                    <motion.div key={monthKey} variants={cardVariants}>
                      <div className="flex items-center gap-2 mb-3">
                        <Calendar size={16} className="text-[#2AA198]" />
                        <h3 className="text-sm font-bold text-[#1B2A4A]">{getMonthLabel(monthKey)}</h3>
                        <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">
                          {items.length} record{items.length > 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {items.map(({ record, status }) => (
                          <VaccinationCalendarCard
                            key={`${record.id}-${status}`}
                            record={record}
                            status={status}
                          />
                        ))}
                      </div>
                    </motion.div>
                  );
                })}

                {vaccinationData.sortedMonths.length === 0 && (
                  <motion.div
                    variants={cardVariants}
                    className="text-center py-16 bg-white rounded-2xl border border-gray-100"
                  >
                    <Syringe size={40} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-sm text-gray-500 font-medium">No vaccination records</p>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          )}

          {/* ============================================================== */}
          {/* TREATMENTS TAB                                                 */}
          {/* ============================================================== */}
          {activeTab === 'treatments' && (
            <motion.div
              key="treatments"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Active / Completed filter */}
              <div className="flex items-center gap-2 mb-4">
                {(['active', 'completed'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setTreatmentFilter(f)}
                    className={`text-xs font-semibold px-4 py-2 rounded-xl border transition-all ${
                      treatmentFilter === f
                        ? 'bg-[#1B2A4A] text-white border-[#1B2A4A]'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-[#2AA198]'
                    }`}
                  >
                    {f === 'active' ? 'Active Treatments' : 'Completed'}
                    <span
                      className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full ${
                        treatmentFilter === f
                          ? 'bg-white/20 text-white'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {f === 'active' ? treatmentData.active.length : treatmentData.completed.length}
                    </span>
                  </button>
                ))}
              </div>

              {/* Treatment cards */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-3"
              >
                {(treatmentFilter === 'active' ? treatmentData.active : treatmentData.completed).length === 0 ? (
                  <motion.div
                    variants={cardVariants}
                    className="text-center py-16 bg-white rounded-2xl border border-gray-100"
                  >
                    <Pill size={40} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-sm text-gray-500 font-medium">
                      No {treatmentFilter} treatments
                    </p>
                  </motion.div>
                ) : (
                  (treatmentFilter === 'active' ? treatmentData.active : treatmentData.completed).map((record) => {
                    const isActive = treatmentFilter === 'active';
                    return (
                      <motion.div
                        key={record.id}
                        variants={cardVariants}
                        className={`rounded-2xl border overflow-hidden shadow-sm ${
                          isActive ? 'bg-blue-50/50 border-blue-200' : 'bg-white border-gray-100'
                        }`}
                      >
                        <div className="p-4 lg:p-5">
                          <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 rounded-xl ${isActive ? 'bg-blue-100' : 'bg-gray-100'} flex items-center justify-center shrink-0`}>
                              <Pill size={20} className={isActive ? 'text-blue-600' : 'text-gray-500'} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-sm font-bold text-[#1B2A4A]">{record.animalName}</h3>
                                <span
                                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                    isActive
                                      ? 'bg-blue-100 text-blue-700'
                                      : 'bg-green-100 text-green-700'
                                  }`}
                                >
                                  {isActive ? 'Active' : 'Completed'}
                                </span>
                              </div>
                              <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">
                                {record.description}
                              </p>
                              <div className="flex items-center gap-3 mt-2 flex-wrap text-[11px] text-gray-500">
                                <span className="flex items-center gap-1">
                                  <CalendarDays size={12} className="text-gray-400" />
                                  {formatDate(record.date)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <DollarSign size={12} className="text-gray-400" />
                                  {formatCurrency(record.cost)}
                                </span>
                                {record.nextDueDate && (
                                  <span className="flex items-center gap-1">
                                    <Clock size={12} className="text-gray-400" />
                                    Follow-up: {formatDate(record.nextDueDate)}
                                  </span>
                                )}
                              </div>
                              {record.medications.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                  {record.medications.map((med) => (
                                    <span
                                      key={med}
                                      className="text-[10px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-medium"
                                    >
                                      {med}
                                    </span>
                                  ))}
                                </div>
                              )}
                              {record.notes && (
                                <p className="text-[11px] text-gray-500 mt-2 bg-gray-50 rounded-lg p-2.5 leading-relaxed">
                                  {record.notes}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Progress bar for active treatments */}
                        {isActive && record.nextDueDate && (
                          <div className="px-4 pb-3">
                            <div className="flex items-center justify-between text-[10px] text-gray-500 mb-1">
                              <span>Treatment started</span>
                              <span>Follow-up due</span>
                            </div>
                            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-500 rounded-full transition-all"
                                style={{
                                  width: `${Math.min(
                                    100,
                                    Math.max(
                                      5,
                                      ((Date.now() - new Date(record.date).getTime()) /
                                        (new Date(record.nextDueDate).getTime() - new Date(record.date).getTime())) *
                                        100
                                    )
                                  )}%`,
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </motion.div>
                    );
                  })
                )}
              </motion.div>
            </motion.div>
          )}

          {/* ============================================================== */}
          {/* SCHEDULE TAB                                                   */}
          {/* ============================================================== */}
          {activeTab === 'schedule' && (
            <motion.div
              key="schedule"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Overdue items */}
              {scheduleData.overdue.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle size={16} className="text-red-500" />
                    <h3 className="text-sm font-bold text-red-700">
                      Overdue ({scheduleData.overdue.length})
                    </h3>
                  </div>
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-2"
                  >
                    {scheduleData.overdue.map((record) => (
                      <ScheduleItem key={`overdue-${record.id}`} record={record} isOverdue={true} />
                    ))}
                  </motion.div>
                </div>
              )}

              {/* Calendar View */}
              <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm mb-6">
                <h3 className="text-sm font-bold text-[#1B2A4A] mb-3 flex items-center gap-2">
                  <Calendar size={16} className="text-[#2AA198]" />
                  Upcoming Schedule (Next 90 Days)
                </h3>
                <div className="grid grid-cols-7 gap-1">
                  {/* Day headers */}
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="text-[9px] font-semibold text-gray-400 text-center py-1">
                      {day}
                    </div>
                  ))}
                  {/* Calendar grid - next 35 days */}
                  {Array.from({ length: 35 }, (_, i) => {
                    const date = new Date(today);
                    // Start from the beginning of the current week
                    const dayOfWeek = today.getDay();
                    date.setDate(today.getDate() - dayOfWeek + i);
                    const dateStr = date.toISOString().split('T')[0];
                    const dots = scheduleData.calendarDots[dateStr] || [];
                    const isToday = dateStr === todayStr;
                    const isPast = dateStr < todayStr;

                    return (
                      <div
                        key={dateStr}
                        className={`relative h-10 rounded-lg flex flex-col items-center justify-center gap-0.5 ${
                          isToday
                            ? 'bg-[#2AA198]/10 border border-[#2AA198]'
                            : isPast
                              ? 'bg-gray-50 text-gray-300'
                              : 'hover:bg-gray-50'
                        } transition-colors`}
                      >
                        <span
                          className={`text-[10px] font-medium ${
                            isToday ? 'text-[#2AA198] font-bold' : isPast ? 'text-gray-300' : 'text-gray-600'
                          }`}
                        >
                          {date.getDate()}
                        </span>
                        {dots.length > 0 && (
                          <div className="flex items-center gap-0.5">
                            {dots.slice(0, 3).map((type, idx) => {
                              const cfg = RECORD_TYPE_CONFIG[type];
                              return (
                                <div
                                  key={idx}
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    cfg.bgColor.replace('bg-', 'bg-').replace('100', '500')
                                  }`}
                                  style={{
                                    backgroundColor:
                                      type === 'vaccination' ? '#16a34a'
                                      : type === 'treatment' ? '#2563eb'
                                      : type === 'checkup' ? '#0d9488'
                                      : type === 'surgery' ? '#dc2626'
                                      : type === 'deworming' ? '#d97706'
                                      : '#06b6d4',
                                  }}
                                />
                              );
                            })}
                            {dots.length > 3 && (
                              <span className="text-[7px] text-gray-400">+{dots.length - 3}</span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {/* Legend */}
                <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-gray-100">
                  {Object.entries(RECORD_TYPE_CONFIG).map(([type, cfg]) => (
                    <div key={type} className="flex items-center gap-1.5">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{
                          backgroundColor:
                            type === 'vaccination' ? '#16a34a'
                            : type === 'treatment' ? '#2563eb'
                            : type === 'checkup' ? '#0d9488'
                            : type === 'surgery' ? '#dc2626'
                            : type === 'deworming' ? '#d97706'
                            : '#06b6d4',
                        }}
                      />
                      <span className="text-[10px] text-gray-500">{cfg.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upcoming events list */}
              <div className="mb-4">
                <h3 className="text-sm font-bold text-[#1B2A4A] mb-3 flex items-center gap-2">
                  <Clock size={16} className="text-blue-500" />
                  Upcoming Events
                </h3>
              </div>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-2"
              >
                {/* Combine upcoming scheduled follow-ups and future visits */}
                {[...scheduleData.upcoming, ...scheduleData.futureVisits].length === 0 ? (
                  <motion.div
                    variants={cardVariants}
                    className="text-center py-16 bg-white rounded-2xl border border-gray-100"
                  >
                    <Calendar size={40} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-sm text-gray-500 font-medium">No upcoming events</p>
                    <p className="text-xs text-gray-400 mt-1">All scheduled items are up to date</p>
                  </motion.div>
                ) : (
                  [...scheduleData.upcoming, ...scheduleData.futureVisits]
                    .sort((a, b) => (a.nextDueDate || a.date).localeCompare(b.nextDueDate || b.date))
                    .map((record) => (
                      <ScheduleItem key={`upcoming-${record.id}`} record={record} isOverdue={false} />
                    ))
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
