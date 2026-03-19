'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Beef,
  Search,
  ChevronDown,
  ChevronRight,
  Heart,
  DollarSign,
  Activity,
  Baby,
  Syringe,
  Pill,
  Plus,
  Droplets,
  Scale,
  FileText,
  AlertTriangle,
  AlertCircle,
  Clock,
  Calendar,
  ShieldAlert,
  Weight,
  Tag,
  ArrowUpDown,
  X,
} from 'lucide-react';
import {
  animals as mockAnimals,
  vetRecords as mockVetRecords,
  breedingRecords as mockBreedingRecords,
  getLivestockSummary as mockGetLivestockSummary,
  type Animal,
  type AnimalType,
  type AnimalStatus,
} from '@/lib/data/livestock';
import { useLivestock } from '@/lib/supabase/use-livestock';

// Use mock data as primary source (rich UI types not yet in DB)
const animals = mockAnimals;
const vetRecords = mockVetRecords;
const breedingRecords = mockBreedingRecords;
const getLivestockSummary = mockGetLivestockSummary;

// ─── Animation Variants ──────────────────────────────────────────────────────

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

const expandVariants = {
  collapsed: {
    height: 0,
    opacity: 0,
    transition: {
      height: { duration: 0.3, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] },
      opacity: { duration: 0.2 },
    },
  },
  expanded: {
    height: 'auto' as const,
    opacity: 1,
    transition: {
      height: { duration: 0.3, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] },
      opacity: { duration: 0.25, delay: 0.1 },
    },
  },
};

// ─── Types & Constants ───────────────────────────────────────────────────────

type TabKey = 'herd' | 'actions' | 'alerts';
type SortKey = 'name-az' | 'newest' | 'value-high';
type TypeFilter = 'all' | AnimalType;
type StatusFilter = 'all' | AnimalStatus;

const TYPE_LABELS: Record<AnimalType, string> = {
  cattle: 'Cattle',
  goat: 'Goats',
  sheep: 'Sheep',
  poultry: 'Poultry',
  pig: 'Pigs',
};

const TYPE_BADGE_STYLES: Record<AnimalType, string> = {
  cattle: 'bg-amber-800/90 text-white',
  goat: 'bg-amber-500/90 text-white',
  sheep: 'bg-slate-500/90 text-white',
  poultry: 'bg-orange-500/90 text-white',
  pig: 'bg-pink-500/90 text-white',
};

const STATUS_BADGE_STYLES: Record<AnimalStatus, string> = {
  healthy: 'bg-green-100 text-green-700',
  sick: 'bg-red-100 text-red-700',
  pregnant: 'bg-purple-100 text-purple-700',
  lactating: 'bg-blue-100 text-blue-700',
  quarantine: 'bg-amber-100 text-amber-700',
  sold: 'bg-gray-100 text-gray-500',
  deceased: 'bg-gray-100 text-gray-500',
};

const STATUS_LABELS: Record<AnimalStatus, string> = {
  healthy: 'Healthy',
  sick: 'Sick',
  pregnant: 'Pregnant',
  lactating: 'Lactating',
  quarantine: 'Quarantine',
  sold: 'Sold',
  deceased: 'Deceased',
};

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'name-az', label: 'Name A-Z' },
  { key: 'newest', label: 'Newest' },
  { key: 'value-high', label: 'Value High-Low' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatAge(dob: string): string {
  const birth = new Date(dob);
  const now = new Date('2026-03-16');
  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  if (months < 0) {
    years--;
    months += 12;
  }
  if (years > 0 && months > 0) return `${years}y ${months}m`;
  if (years > 0) return `${years}y`;
  return `${months}m`;
}

function formatCurrency(amount: number): string {
  return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 });
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function getHealthColor(percent: number): string {
  if (percent >= 75) return 'text-green-600';
  if (percent >= 50) return 'text-amber-500';
  return 'text-red-500';
}

function getHealthBg(percent: number): string {
  if (percent >= 75) return 'bg-green-500';
  if (percent >= 50) return 'bg-amber-500';
  return 'bg-red-500';
}

function sortAnimals(items: Animal[], key: SortKey): Animal[] {
  const sorted = [...items];
  switch (key) {
    case 'name-az':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'newest':
      return sorted.sort((a, b) => new Date(b.dateOfBirth).getTime() - new Date(a.dateOfBirth).getTime());
    case 'value-high':
      return sorted.sort((a, b) => b.currentValue - a.currentValue);
    default:
      return sorted;
  }
}

function daysUntil(dateStr: string): number {
  const now = new Date('2026-03-16');
  const target = new Date(dateStr);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

// ─── Component: AnimalCard ───────────────────────────────────────────────────

function AnimalCard({ animal }: { animal: Animal }) {
  const [expanded, setExpanded] = useState(false);

  const animalVetRecords = useMemo(
    () =>
      vetRecords
        .filter((v) => v.animalId === animal.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 3),
    [animal.id]
  );

  return (
    <motion.div
      variants={cardVariants}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
    >
      {/* Image + overlay */}
      <button
        onClick={() => setExpanded((p) => !p)}
        className="w-full text-left focus:outline-none"
      >
        <div className="relative h-[180px] w-full overflow-hidden">
          <Image
            src={animal.image}
            alt={animal.name}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

          {/* Type badge top-left */}
          <div className="absolute top-3 left-3">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold backdrop-blur-sm ${TYPE_BADGE_STYLES[animal.type]}`}
            >
              {TYPE_LABELS[animal.type]}
            </span>
          </div>

          {/* Tag number top-right */}
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold bg-white/90 text-[#1B2A4A] backdrop-blur-sm">
              <Tag className="w-3 h-3" />
              {animal.tag}
            </span>
          </div>

          {/* Name + breed overlay bottom */}
          <div className="absolute bottom-3 left-3 right-3">
            <div className="flex items-center gap-2">
              <h3 className="text-white font-bold text-base leading-tight">{animal.name}</h3>
              <span className="text-white/60 text-sm">{animal.gender === 'male' ? '\u2642' : '\u2640'}</span>
            </div>
            <p className="text-white/80 text-xs mt-0.5">{animal.breed}</p>
          </div>
        </div>
      </button>

      {/* Card body */}
      <div className="p-4">
        {/* Stats row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            {/* Age */}
            <div>
              <p className="text-sm font-bold text-[#1B2A4A]">{formatAge(animal.dateOfBirth)}</p>
              <p className="text-[11px] text-gray-500">Age</p>
            </div>
            <div className="w-px h-8 bg-gray-200" />
            {/* Weight */}
            <div>
              <p className="text-sm font-bold text-[#1B2A4A]">
                {animal.weight}
                <span className="text-[10px] font-normal text-gray-400 ml-0.5">kg</span>
              </p>
              <p className="text-[11px] text-gray-500">Weight</p>
            </div>
          </div>

          {/* Value */}
          <div className="text-right">
            <p className="text-sm font-bold text-[#2AA198]">{formatCurrency(animal.currentValue)}</p>
            <p className="text-[11px] text-gray-500">Value</p>
          </div>
        </div>

        {/* Status + last vet */}
        <div className="flex items-center justify-between">
          <span
            className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${STATUS_BADGE_STYLES[animal.status]}`}
          >
            {STATUS_LABELS[animal.status]}
          </span>
          <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            Acquired: {formatShortDate(animal.acquisitionDate)}
          </div>
        </div>

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded((p) => !p)}
          className="mt-3 w-full flex items-center justify-center gap-1 py-2 rounded-xl bg-gray-50 text-xs font-medium text-gray-500 active:bg-gray-100 transition-colors min-h-[44px]"
        >
          {expanded ? 'Hide details' : 'View details'}
          <motion.span animate={{ rotate: expanded ? 90 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronRight className="w-3.5 h-3.5" />
          </motion.span>
        </button>
      </div>

      {/* Expanded section */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            variants={expandVariants}
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4 border-t border-gray-100 pt-4">
              {/* Full details */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-[#1B2A4A]">Details</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-gray-50 rounded-xl p-2.5">
                    <p className="text-[10px] text-gray-400">Acquired</p>
                    <p className="text-xs font-medium text-[#1B2A4A] capitalize">
                      {animal.acquisitionMethod.replace(/-/g, ' ')}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-2.5">
                    <p className="text-[10px] text-gray-400">Purchase Price</p>
                    <p className="text-xs font-medium text-[#1B2A4A]">
                      {animal.purchasePrice != null && animal.purchasePrice > 0 ? formatCurrency(animal.purchasePrice) : 'N/A'}
                    </p>
                  </div>
                </div>
                {animal.notes && (
                  <p className="text-[11px] text-gray-600 bg-gray-50 rounded-xl p-2.5 leading-relaxed">
                    {animal.notes}
                  </p>
                )}
              </div>

              {/* Parents */}
              {(animal.parentSire || animal.parentDam) && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-[#1B2A4A]">Parents</p>
                  <div className="flex items-center gap-3">
                    {animal.parentSire && (
                      <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-medium">
                        <span className="text-blue-400">{'\u2642'}</span>
                        Sire: {animals.find((a) => a.id === animal.parentSire)?.name ?? animal.parentSire}
                      </div>
                    )}
                    {animal.parentDam && (
                      <div className="flex items-center gap-1.5 bg-pink-50 text-pink-700 px-3 py-1.5 rounded-lg text-xs font-medium">
                        <span className="text-pink-400">{'\u2640'}</span>
                        Dam: {animals.find((a) => a.id === animal.parentDam)?.name ?? animal.parentDam}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Recent vet records */}
              {animalVetRecords.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-[#1B2A4A]">Recent Vet Records</p>
                  {animalVetRecords.map((rec) => (
                    <div
                      key={rec.id}
                      className="flex items-start gap-3 p-2.5 rounded-xl bg-gray-50 border border-gray-100"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#2AA198]/10 flex items-center justify-center shrink-0">
                        {rec.type === 'vaccination' && <Syringe className="w-4 h-4 text-[#2AA198]" />}
                        {rec.type === 'treatment' && <Pill className="w-4 h-4 text-red-500" />}
                        {rec.type === 'checkup' && <Activity className="w-4 h-4 text-blue-500" />}
                        {rec.type === 'deworming' && <Pill className="w-4 h-4 text-amber-500" />}
                        {rec.type === 'dipping' && <Droplets className="w-4 h-4 text-cyan-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-[#1B2A4A] truncate">{rec.description}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] text-gray-500">{formatShortDate(rec.date)}</span>
                          <span className="text-[11px] text-gray-400">{rec.veterinarian}</span>
                          <span className="text-[11px] font-semibold text-amber-600">
                            {formatCurrency(rec.cost)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Action buttons */}
              <div className="grid grid-cols-3 gap-2">
                <button className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl bg-[#2AA198]/10 text-[#2AA198] active:bg-[#2AA198]/20 transition-colors min-h-[64px]">
                  <Heart className="w-5 h-5" />
                  <span className="text-[11px] font-semibold">Record Health</span>
                </button>
                <button className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl bg-amber-50 text-amber-600 active:bg-amber-100 transition-colors min-h-[64px]">
                  <Scale className="w-5 h-5" />
                  <span className="text-[11px] font-semibold">Add Weight</span>
                </button>
                <button className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl bg-[#D4A843]/10 text-[#D4A843] active:bg-[#D4A843]/20 transition-colors min-h-[64px]">
                  <DollarSign className="w-5 h-5" />
                  <span className="text-[11px] font-semibold">Mark for Sale</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Component: Quick Action Card ────────────────────────────────────────────

function QuickActionCard({
  icon,
  title,
  description,
  bgColor,
  iconColor,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  bgColor: string;
  iconColor: string;
}) {
  return (
    <motion.button
      variants={cardVariants}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow text-center min-h-[140px]"
    >
      <div
        className={`w-14 h-14 rounded-2xl flex items-center justify-center ${bgColor}`}
      >
        <div className={iconColor}>{icon}</div>
      </div>
      <div>
        <p className="text-sm font-bold text-[#1B2A4A]">{title}</p>
        <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">{description}</p>
      </div>
    </motion.button>
  );
}

// ─── Component: Alert Card ───────────────────────────────────────────────────

function AlertCard({
  urgency,
  icon,
  message,
  animalName,
  animalTag,
  actionLabel,
  urgencyColor,
}: {
  urgency: 'high' | 'medium' | 'low';
  icon: React.ReactNode;
  message: string;
  animalName: string;
  animalTag: string;
  actionLabel: string;
  urgencyColor: string;
}) {
  const urgencyStyles = {
    high: 'border-l-4 border-l-red-500 bg-red-50/50',
    medium: 'border-l-4 border-l-amber-500 bg-amber-50/50',
    low: 'border-l-4 border-l-blue-500 bg-blue-50/50',
  };

  return (
    <motion.div
      variants={cardVariants}
      className={`rounded-2xl p-4 ${urgencyStyles[urgency]}`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${urgencyColor}`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[#1B2A4A] leading-snug">{message}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[11px] font-semibold text-[#1B2A4A]">{animalName}</span>
            <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full font-mono">
              {animalTag}
            </span>
          </div>
          <button className="mt-2 text-xs font-semibold text-[#2AA198] hover:underline flex items-center gap-1">
            {actionLabel}
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function LivestockPage() {
  // --- Live Supabase data (available when real data is entered) ---
  const { livestock: liveLivestock } = useLivestock();

  // --- State ---
  const [activeTab, setActiveTab] = useState<TabKey>('herd');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('name-az');
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // --- Derived ---
  const summary = useMemo(() => getLivestockSummary(), []);

  const activeAnimals = useMemo(
    () => animals.filter((a) => a.status !== 'sold' && a.status !== 'deceased'),
    []
  );

  const filteredAnimals = useMemo(() => {
    let items = [...activeAnimals];

    if (typeFilter !== 'all') {
      items = items.filter((a) => a.type === typeFilter);
    }
    if (statusFilter !== 'all') {
      items = items.filter((a) => a.status === statusFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.tag.toLowerCase().includes(q) ||
          a.breed.toLowerCase().includes(q)
      );
    }

    return sortAnimals(items, sortKey);
  }, [activeAnimals, typeFilter, statusFilter, searchQuery, sortKey]);

  // --- Alerts ---
  const alerts = useMemo(() => {
    const now = new Date('2026-03-16');
    const in30Days = new Date('2026-04-15');
    const alertList: {
      urgency: 'high' | 'medium' | 'low';
      icon: React.ReactNode;
      message: string;
      animalName: string;
      animalTag: string;
      actionLabel: string;
      urgencyColor: string;
      sortOrder: number;
    }[] = [];

    // Overdue vaccinations
    vetRecords.forEach((v) => {
      if (!v.nextDueDate) return;
      const due = new Date(v.nextDueDate);
      if (due < now) {
        alertList.push({
          urgency: 'high',
          icon: <AlertCircle className="w-5 h-5 text-red-600" />,
          message: `Overdue: ${v.description} (was due ${formatShortDate(v.nextDueDate)})`,
          animalName: v.animalName,
          animalTag: animals.find((a) => a.id === v.animalId)?.tag ?? '',
          actionLabel: 'Schedule Now',
          urgencyColor: 'bg-red-100',
          sortOrder: 0,
        });
      }
    });

    // Upcoming vaccinations (next 30 days)
    vetRecords.forEach((v) => {
      if (!v.nextDueDate) return;
      const due = new Date(v.nextDueDate);
      if (due >= now && due <= in30Days) {
        alertList.push({
          urgency: 'medium',
          icon: <Clock className="w-5 h-5 text-amber-600" />,
          message: `Upcoming: ${v.description} (due ${formatShortDate(v.nextDueDate)})`,
          animalName: v.animalName,
          animalTag: animals.find((a) => a.id === v.animalId)?.tag ?? '',
          actionLabel: 'Schedule',
          urgencyColor: 'bg-amber-100',
          sortOrder: 1,
        });
      }
    });

    // Pregnant animals approaching due date
    breedingRecords
      .filter((b) => b.status === 'confirmed-pregnant' && b.expectedDueDate)
      .forEach((b) => {
        const days = daysUntil(b.expectedDueDate!);
        if (days > 0 && days <= 45) {
          alertList.push({
            urgency: days <= 14 ? 'high' : 'medium',
            icon: <Baby className="w-5 h-5 text-purple-600" />,
            message: `${b.damName} expected to deliver in ${days} days (${formatShortDate(b.expectedDueDate!)})`,
            animalName: b.damName,
            animalTag: animals.find((a) => a.id === b.damId)?.tag || '',
            actionLabel: 'View Breeding Record',
            urgencyColor: 'bg-purple-100',
            sortOrder: days <= 14 ? 0 : 1,
          });
        }
      });

    // Animals in quarantine
    activeAnimals
      .filter((a) => a.status === 'quarantine')
      .forEach((a) => {
        alertList.push({
          urgency: 'medium',
          icon: <ShieldAlert className="w-5 h-5 text-amber-600" />,
          message: `${a.name} is in quarantine. Monitor and review status.`,
          animalName: a.name,
          animalTag: a.tag,
          actionLabel: 'Review Status',
          urgencyColor: 'bg-amber-100',
          sortOrder: 1,
        });
      });

    // Sick animals
    activeAnimals
      .filter((a) => a.status === 'sick')
      .forEach((a) => {
        alertList.push({
          urgency: 'high',
          icon: <AlertTriangle className="w-5 h-5 text-red-600" />,
          message: `${a.name} is sick and needs attention.`,
          animalName: a.name,
          animalTag: a.tag,
          actionLabel: 'View Health Record',
          urgencyColor: 'bg-red-100',
          sortOrder: 0,
        });
      });

    return alertList.sort((a, b) => a.sortOrder - b.sortOrder);
  }, [activeAnimals]);

  // --- Tab config ---
  const tabs: { key: TabKey; label: string }[] = [
    { key: 'herd', label: 'My Herd' },
    { key: 'actions', label: 'Quick Actions' },
    { key: 'alerts', label: 'Alerts' },
  ];

  const typeFilters: { key: TypeFilter; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: activeAnimals.length },
    { key: 'cattle', label: 'Cattle', count: summary.byType.cattle },
    { key: 'goat', label: 'Goats', count: summary.byType.goat },
    { key: 'sheep', label: 'Sheep', count: summary.byType.sheep },
    { key: 'poultry', label: 'Poultry', count: summary.byType.poultry },
    { key: 'pig', label: 'Pigs', count: summary.byType.pig },
  ];

  const statusFilters: { key: StatusFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'healthy', label: 'Healthy' },
    { key: 'sick', label: 'Sick' },
    { key: 'pregnant', label: 'Pregnant' },
    { key: 'lactating', label: 'Lactating' },
    { key: 'quarantine', label: 'Quarantine' },
  ];

  // =========================================================================
  // Render
  // =========================================================================

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ─── Header ─────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-br from-[#1B2A4A] via-[#1B2A4A] to-[#2AA198]/30 text-white"
      >
        <div className="max-w-6xl mx-auto px-4 lg:px-6 py-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <Beef size={28} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
                  My Livestock
                </h1>
                <p className="text-white/70 text-sm mt-1">
                  Manage your herd, health records, and breeding
                </p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2">
              <Link
                href="/farm/livestock/health"
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
              >
                <Heart size={16} />
                Health Records
              </Link>
              <Link
                href="/farm/livestock/breeding"
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
              >
                <Baby size={16} />
                Breeding
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-6xl mx-auto px-4 lg:px-6 py-6">
        {/* ─── Summary Stats ──────────────────────────────────────────── */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6"
        >
          {[
            {
              label: 'Total Animals',
              value: summary.totalAnimals.toString(),
              icon: <Beef size={20} className="text-[#2AA198]" />,
              accent: 'bg-teal-light',
            },
            {
              label: 'Herd Value',
              value: formatCurrency(summary.totalValue),
              icon: <DollarSign size={20} className="text-[#D4A843]" />,
              accent: 'bg-amber-50',
            },
            {
              label: 'Healthy',
              value: `${summary.healthyPercentage}%`,
              icon: (
                <div className="relative">
                  <Activity size={20} className={getHealthColor(summary.healthyPercentage)} />
                </div>
              ),
              accent: summary.healthyPercentage >= 75 ? 'bg-green-50' : summary.healthyPercentage >= 50 ? 'bg-amber-50' : 'bg-red-50',
            },
            {
              label: 'Pregnant',
              value: summary.pregnantCount.toString(),
              icon: <Baby size={20} className="text-purple-500" />,
              accent: 'bg-purple-50',
            },
            {
              label: 'Upcoming Vaccines',
              value: summary.upcomingVaccinations.toString(),
              icon: <Syringe size={20} className="text-blue-500" />,
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
                  className={`w-10 h-10 rounded-xl ${stat.accent} flex items-center justify-center shrink-0`}
                >
                  {stat.icon}
                </div>
                <div className="min-w-0">
                  <div className="text-lg font-bold text-[#1B2A4A] truncate">{stat.value}</div>
                  <div className="text-[11px] text-gray-400 truncate">{stat.label}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ─── Tab Switcher ───────────────────────────────────────────── */}
        <div className="flex items-center gap-1 bg-white rounded-xl p-1 border border-gray-100 shadow-sm mb-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 min-w-[100px] text-sm font-semibold py-2.5 px-4 rounded-lg transition-all whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-[#1B2A4A] text-white shadow-sm'
                  : 'text-gray-500 hover:text-[#1B2A4A] hover:bg-gray-50'
              }`}
            >
              {tab.label}
              {tab.key === 'alerts' && alerts.length > 0 && (
                <span
                  className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full ${
                    activeTab === tab.key
                      ? 'bg-white/20 text-white'
                      : 'bg-red-100 text-red-600'
                  }`}
                >
                  {alerts.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* MY HERD TAB                                                    */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <AnimatePresence mode="wait">
          {activeTab === 'herd' && (
            <motion.div
              key="herd"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Type filter pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-3 scrollbar-hide">
                {typeFilters.map((tf) => {
                  const isActive = typeFilter === tf.key;
                  return (
                    <button
                      key={tf.key}
                      onClick={() => setTypeFilter(tf.key)}
                      className={`flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl whitespace-nowrap transition-all border ${
                        isActive
                          ? 'bg-[#1B2A4A] text-white border-[#1B2A4A] shadow-sm'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-[#2AA198] hover:text-[#2AA198]'
                      }`}
                    >
                      {tf.label}
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {tf.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Status filter pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
                {statusFilters.map((sf) => {
                  const isActive = statusFilter === sf.key;
                  return (
                    <button
                      key={sf.key}
                      onClick={() => setStatusFilter(sf.key)}
                      className={`text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap transition-all border ${
                        isActive
                          ? 'bg-[#2AA198] text-white border-[#2AA198]'
                          : 'bg-white text-gray-500 border-gray-200 hover:border-[#2AA198] hover:text-[#2AA198]'
                      }`}
                    >
                      {sf.label}
                    </button>
                  );
                })}
              </div>

              {/* Search + Sort row */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 relative">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name or tag..."
                    className="w-full h-10 pl-9 pr-4 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2AA198]/30 focus:border-[#2AA198] transition"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Sort dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowSortDropdown(!showSortDropdown)}
                    className="flex items-center gap-2 h-10 px-4 rounded-xl border border-gray-200 bg-white text-sm text-gray-600 hover:border-[#2AA198] transition-colors"
                  >
                    <ArrowUpDown size={14} />
                    <span className="hidden sm:inline">
                      {SORT_OPTIONS.find((s) => s.key === sortKey)?.label}
                    </span>
                    <ChevronDown size={14} />
                  </button>
                  <AnimatePresence>
                    {showSortDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="absolute right-0 top-12 z-20 w-48 bg-white rounded-xl border border-gray-100 shadow-lg overflow-hidden"
                      >
                        {SORT_OPTIONS.map((opt) => (
                          <button
                            key={opt.key}
                            onClick={() => {
                              setSortKey(opt.key);
                              setShowSortDropdown(false);
                            }}
                            className={`w-full text-left text-sm px-4 py-2.5 hover:bg-gray-50 transition-colors ${
                              sortKey === opt.key
                                ? 'text-[#2AA198] font-semibold bg-teal-light/50'
                                : 'text-gray-600'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Results count */}
              <div className="text-xs text-gray-400 mb-4">
                Showing {filteredAnimals.length} of {activeAnimals.length} animals
              </div>

              {/* Animal cards grid */}
              {filteredAnimals.length > 0 ? (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 lg:grid-cols-2 gap-4"
                >
                  {filteredAnimals.map((animal) => (
                    <AnimalCard key={animal.id} animal={animal} />
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-16"
                >
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Search size={28} className="text-gray-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-[#1B2A4A] mb-1">
                    No animals found
                  </h3>
                  <p className="text-xs text-gray-500">
                    Try adjusting your search or filters
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setTypeFilter('all');
                      setStatusFilter('all');
                    }}
                    className="mt-4 text-xs font-semibold text-[#2AA198] hover:underline"
                  >
                    Clear all filters
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* QUICK ACTIONS TAB                                              */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {activeTab === 'actions' && (
            <motion.div
              key="actions"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mb-4">
                <h2 className="text-sm font-bold text-[#1B2A4A]">Quick Actions</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Common livestock management tasks at your fingertips
                </p>
              </div>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-2 lg:grid-cols-4 gap-3"
              >
                <QuickActionCard
                  icon={<Syringe size={24} />}
                  title="Record Vaccination"
                  description="Log a new vaccination for any animal"
                  bgColor="bg-[#2AA198]/10"
                  iconColor="text-[#2AA198]"
                />
                <QuickActionCard
                  icon={<Pill size={24} />}
                  title="Log Treatment"
                  description="Record medicine or treatment given"
                  bgColor="bg-blue-50"
                  iconColor="text-blue-600"
                />
                <QuickActionCard
                  icon={<Plus size={24} />}
                  title="Add Animal"
                  description="Register a new animal to your herd"
                  bgColor="bg-green-50"
                  iconColor="text-green-600"
                />
                <QuickActionCard
                  icon={<Baby size={24} />}
                  title="Record Birth"
                  description="Log a new birth event on your farm"
                  bgColor="bg-purple-50"
                  iconColor="text-purple-600"
                />
                <QuickActionCard
                  icon={<Droplets size={24} />}
                  title="Schedule Dipping"
                  description="Plan tick or parasite dipping sessions"
                  bgColor="bg-amber-50"
                  iconColor="text-amber-600"
                />
                <QuickActionCard
                  icon={<DollarSign size={24} />}
                  title="Record Sale"
                  description="Log an animal sale or auction"
                  bgColor="bg-[#D4A843]/10"
                  iconColor="text-[#D4A843]"
                />
                <QuickActionCard
                  icon={<Weight size={24} />}
                  title="Update Weights"
                  description="Record latest weighing for your animals"
                  bgColor="bg-slate-100"
                  iconColor="text-slate-600"
                />
                <QuickActionCard
                  icon={<FileText size={24} />}
                  title="Generate Report"
                  description="Create herd reports and summaries"
                  bgColor="bg-[#1B2A4A]/10"
                  iconColor="text-[#1B2A4A]"
                />
              </motion.div>
            </motion.div>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* ALERTS TAB                                                     */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {activeTab === 'alerts' && (
            <motion.div
              key="alerts"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mb-4">
                <h2 className="text-sm font-bold text-[#1B2A4A]">Alerts & Notifications</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Items that need your attention, sorted by urgency
                </p>
              </div>

              {alerts.length > 0 ? (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-3"
                >
                  {alerts.map((alert, idx) => (
                    <AlertCard
                      key={`alert-${idx}`}
                      urgency={alert.urgency}
                      icon={alert.icon}
                      message={alert.message}
                      animalName={alert.animalName}
                      animalTag={alert.animalTag}
                      actionLabel={alert.actionLabel}
                      urgencyColor={alert.urgencyColor}
                    />
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-16"
                >
                  <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Activity size={28} className="text-green-500" />
                  </div>
                  <h3 className="text-sm font-semibold text-[#1B2A4A] mb-1">
                    All clear!
                  </h3>
                  <p className="text-xs text-gray-500">
                    No outstanding alerts at this time. Your herd is well managed.
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
