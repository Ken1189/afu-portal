'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Search,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Award,
  TrendingUp,
  DollarSign,
  Landmark,
  Wheat,
  ChevronRight,
  ChevronDown,
  Clock,
  ShoppingCart,
  GraduationCap,
  Package,
  Truck,
  CreditCard,
  ArrowRight,
  Filter,
  Star,
  Shield,
  Sprout,
  BarChart3,
  Globe,
} from 'lucide-react';
import {
  cooperatives,
  cooperativeActivities,
  type Cooperative,
  type CooperativeActivity,
} from '@/lib/data/cooperatives';

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

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 260, damping: 24 },
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`;
  }
  return `$${amount.toLocaleString()}`;
}

function formatCurrencyFull(amount: number): string {
  return `$${amount.toLocaleString()}`;
}

function formatNumber(n: number): string {
  if (n >= 1000) {
    return `${(n / 1000).toFixed(1)}K`;
  }
  return n.toLocaleString();
}

function timeAgo(dateStr: string): string {
  const now = new Date('2026-03-16T12:00:00');
  const then = new Date(dateStr);
  const diffMs = now.getTime() - then.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays === 2) return '2 days ago';
  if (diffDays === 3) return '3 days ago';
  if (diffDays <= 6) return `${diffDays} days ago`;
  if (diffDays <= 13) return 'Last week';
  if (diffDays <= 20) return '2 weeks ago';
  if (diffDays <= 27) return '3 weeks ago';
  if (diffDays <= 45) return 'Last month';
  if (diffDays <= 90) return '2 months ago';
  return `${Math.floor(diffDays / 30)} months ago`;
}

function getCountryFlag(country: string): string {
  const flags: Record<string, string> = {
    Botswana: '\u{1F1E7}\u{1F1FC}',
    Zimbabwe: '\u{1F1FF}\u{1F1FC}',
    Tanzania: '\u{1F1F9}\u{1F1FF}',
    Kenya: '\u{1F1F0}\u{1F1EA}',
    Zambia: '\u{1F1FF}\u{1F1F2}',
    Malawi: '\u{1F1F2}\u{1F1FC}',
    Namibia: '\u{1F1F3}\u{1F1E6}',
    Uganda: '\u{1F1FA}\u{1F1EC}',
    Mozambique: '\u{1F1F2}\u{1F1FF}',
    'South Africa': '\u{1F1FF}\u{1F1E6}',
  };
  return flags[country] || '\u{1F30D}';
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

const typeLabels: Record<string, string> = {
  crop: 'Crop',
  livestock: 'Livestock',
  mixed: 'Mixed',
  processing: 'Processing',
  marketing: 'Marketing',
};

const typeBadgeColors: Record<string, string> = {
  crop: 'bg-green-50 text-green-700 border-green-200',
  livestock: 'bg-amber-50 text-amber-700 border-amber-200',
  mixed: 'bg-purple-50 text-purple-700 border-purple-200',
  processing: 'bg-blue-50 text-blue-700 border-blue-200',
  marketing: 'bg-indigo-50 text-indigo-700 border-indigo-200',
};

const statusBadgeColors: Record<string, string> = {
  active: 'bg-green-50 text-green-700 border-green-200',
  forming: 'bg-amber-50 text-amber-700 border-amber-200',
  suspended: 'bg-red-50 text-red-600 border-red-200',
};

const statusDotColors: Record<string, string> = {
  active: 'bg-green-500',
  forming: 'bg-amber-400',
  suspended: 'bg-red-500',
};

const activityTypeConfig: Record<
  string,
  { icon: typeof Users; color: string; bg: string; borderColor: string }
> = {
  meeting: {
    icon: Calendar,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  purchase: {
    icon: ShoppingCart,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    borderColor: 'border-amber-200',
  },
  sale: {
    icon: TrendingUp,
    color: 'text-green-600',
    bg: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  training: {
    icon: GraduationCap,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    borderColor: 'border-purple-200',
  },
  distribution: {
    icon: Package,
    color: 'text-teal',
    bg: 'bg-teal-light',
    borderColor: 'border-teal/20',
  },
  harvest: {
    icon: Wheat,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    borderColor: 'border-orange-200',
  },
  payment: {
    icon: CreditCard,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
  },
};

const typeGradients: Record<string, string> = {
  crop: 'from-green-500 to-emerald-600',
  livestock: 'from-amber-500 to-orange-600',
  mixed: 'from-purple-500 to-violet-600',
  processing: 'from-blue-500 to-cyan-600',
  marketing: 'from-indigo-500 to-purple-600',
};

const filterTabs = ['All', 'Crop', 'Livestock', 'Mixed', 'Processing', 'Marketing'] as const;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CooperativesPage() {
  // The user's cooperative is the first one
  const myCooperative = cooperatives[0];

  // Activity feed state
  const myActivities = useMemo(
    () =>
      cooperativeActivities
        .filter((a) => a.cooperativeId === myCooperative.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [myCooperative.id]
  );
  const [activityLimit, setActivityLimit] = useState(5);
  const visibleActivities = myActivities.slice(0, activityLimit);

  // All cooperatives filter/search
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const filteredCooperatives = useMemo(() => {
    return cooperatives.filter((coop) => {
      const matchesType =
        activeFilter === 'All' || coop.type === activeFilter.toLowerCase();
      const matchesSearch =
        searchQuery === '' ||
        coop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        coop.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
        coop.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        coop.mainCrops.some((c) =>
          c.toLowerCase().includes(searchQuery.toLowerCase())
        );
      return matchesType && matchesSearch;
    });
  }, [activeFilter, searchQuery]);

  // Summary stats
  const summaryStats = useMemo(() => {
    return {
      totalCooperatives: cooperatives.length,
      totalMembers: cooperatives.reduce((sum, c) => sum + c.memberCount, 0),
      combinedHectares: cooperatives.reduce((sum, c) => sum + c.totalHectares, 0),
      combinedRevenue: cooperatives.reduce((sum, c) => sum + c.annualRevenue, 0),
    };
  }, []);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 py-4 lg:py-6"
    >
      {/* ================================================================= */}
      {/* HEADER BANNER                                                     */}
      {/* ================================================================= */}
      <motion.section variants={itemVariants} className="px-4 lg:px-6">
        <div className="rounded-2xl bg-gradient-to-br from-[#1B2A4A] to-[#2AA198] p-5 lg:p-8 text-white relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -top-10 -right-10 w-36 h-36 bg-white/5 rounded-full" />
          <div className="absolute -bottom-8 -right-6 w-24 h-24 bg-white/5 rounded-full" />
          <div className="absolute top-1/2 -left-12 w-28 h-28 bg-white/5 rounded-full" />

          <div className="relative z-10">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-white/15 flex items-center justify-center">
                    <Users size={22} className="text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl lg:text-2xl font-bold leading-tight">
                      My Cooperative
                    </h1>
                    <p className="text-sm text-white/70 mt-0.5">
                      Manage your cooperative membership and activities
                    </p>
                  </div>
                </div>
              </div>
              <Link
                href="#all-cooperatives"
                className="hidden lg:inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-sm font-medium transition-colors"
              >
                View All Co-ops
                <ArrowRight size={16} />
              </Link>
            </div>

            <Link
              href="#all-cooperatives"
              className="lg:hidden inline-flex items-center gap-2 mt-4 px-4 py-2.5 rounded-xl bg-white/15 active:bg-white/25 text-sm font-medium transition-colors min-h-[44px]"
            >
              View All Co-ops
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </motion.section>

      {/* ================================================================= */}
      {/* MY COOPERATIVE CARD                                               */}
      {/* ================================================================= */}
      <motion.section variants={cardVariants} className="px-4 lg:px-6">
        <div className="rounded-2xl bg-white border border-gray-100 overflow-hidden shadow-sm">
          {/* Card header */}
          <div className="p-5 lg:p-6 border-b border-gray-50">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 lg:gap-4 flex-1 min-w-0">
                {/* Logo placeholder */}
                <div
                  className={`shrink-0 w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-gradient-to-br ${
                    typeGradients[myCooperative.type]
                  } flex items-center justify-center shadow-sm`}
                >
                  <span className="text-white text-lg lg:text-xl font-bold">
                    {getInitials(myCooperative.name)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg lg:text-xl font-bold text-[#1B2A4A] leading-tight truncate">
                    {myCooperative.name}
                  </h2>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span
                      className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                        typeBadgeColors[myCooperative.type]
                      }`}
                    >
                      {typeLabels[myCooperative.type]}
                    </span>
                    <span
                      className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${
                        statusBadgeColors[myCooperative.status]
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          statusDotColors[myCooperative.status]
                        }`}
                      />
                      {myCooperative.status.charAt(0).toUpperCase() +
                        myCooperative.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Chairman & contact */}
            <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-3">
              <div className="flex items-center gap-2.5 text-sm text-gray-600">
                <div className="w-8 h-8 rounded-lg bg-[#1B2A4A]/5 flex items-center justify-center">
                  <Shield size={15} className="text-[#1B2A4A]" />
                </div>
                <div>
                  <p className="text-[11px] text-gray-400">Chairman</p>
                  <p className="font-medium text-[#1B2A4A]">{myCooperative.chairman}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 text-sm text-gray-600">
                <div className="w-8 h-8 rounded-lg bg-[#2AA198]/10 flex items-center justify-center">
                  <Phone size={15} className="text-[#2AA198]" />
                </div>
                <div>
                  <p className="text-[11px] text-gray-400">Contact</p>
                  <p className="font-medium text-[#1B2A4A]">{myCooperative.contactPhone}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 text-sm text-gray-600">
                <div className="w-8 h-8 rounded-lg bg-[#D4A843]/10 flex items-center justify-center">
                  <MapPin size={15} className="text-[#D4A843]" />
                </div>
                <div>
                  <p className="text-[11px] text-gray-400">Region</p>
                  <p className="font-medium text-[#1B2A4A]">
                    {getCountryFlag(myCooperative.country)} {myCooperative.region},{' '}
                    {myCooperative.country}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-gray-50">
            <div className="p-4 lg:p-5 text-center">
              <div className="flex items-center justify-center mb-1.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Users size={16} className="text-blue-600" />
                </div>
              </div>
              <p className="text-xl lg:text-2xl font-bold text-[#1B2A4A]">
                {myCooperative.memberCount}
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">Members</p>
            </div>
            <div className="p-4 lg:p-5 text-center">
              <div className="flex items-center justify-center mb-1.5">
                <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                  <Globe size={16} className="text-green-600" />
                </div>
              </div>
              <p className="text-xl lg:text-2xl font-bold text-[#1B2A4A]">
                {formatNumber(myCooperative.totalHectares)}
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">Total Hectares</p>
            </div>
            <div className="p-4 lg:p-5 text-center">
              <div className="flex items-center justify-center mb-1.5">
                <div className="w-8 h-8 rounded-lg bg-[#D4A843]/10 flex items-center justify-center">
                  <DollarSign size={16} className="text-[#D4A843]" />
                </div>
              </div>
              <p className="text-xl lg:text-2xl font-bold text-[#1B2A4A]">
                {formatCurrency(myCooperative.annualRevenue)}
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">Annual Revenue</p>
            </div>
            <div className="p-4 lg:p-5 text-center">
              <div className="flex items-center justify-center mb-1.5">
                <div className="w-8 h-8 rounded-lg bg-[#2AA198]/10 flex items-center justify-center">
                  <Landmark size={16} className="text-[#2AA198]" />
                </div>
              </div>
              <p className="text-xl lg:text-2xl font-bold text-[#1B2A4A]">
                {formatCurrency(myCooperative.bankBalance)}
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">Bank Balance</p>
            </div>
          </div>

          {/* Crops, certifications, meeting */}
          <div className="p-5 lg:p-6 border-t border-gray-50 space-y-4">
            {/* Main crops */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Main Crops
              </p>
              <div className="flex flex-wrap gap-1.5">
                {myCooperative.mainCrops.map((crop) => (
                  <span
                    key={crop}
                    className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full bg-green-50 text-green-700 border border-green-100"
                  >
                    <Sprout size={12} />
                    {crop}
                  </span>
                ))}
              </div>
            </div>

            {/* Certifications */}
            {myCooperative.certifications.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                  Certifications
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {myCooperative.certifications.map((cert) => (
                    <span
                      key={cert}
                      className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full bg-[#D4A843]/10 text-[#D4A843] border border-[#D4A843]/20"
                    >
                      <Award size={11} />
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Meeting schedule */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50/50 border border-blue-100">
              <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
                <Calendar size={16} className="text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#1B2A4A]">Meeting Schedule</p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  {myCooperative.meetingSchedule}
                </p>
              </div>
            </div>

            {/* View Details button */}
            <Link
              href={`/farm/cooperatives/${myCooperative.id}`}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#1B2A4A] text-white text-sm font-medium hover:bg-[#1B2A4A]/90 active:bg-[#1B2A4A]/80 transition-colors min-h-[44px]"
            >
              View Details
              <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </motion.section>

      {/* ================================================================= */}
      {/* RECENT ACTIVITY FEED                                              */}
      {/* ================================================================= */}
      <motion.section variants={itemVariants} className="px-4 lg:px-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm lg:text-base font-bold text-[#1B2A4A]">
            Recent Activity
          </h3>
          <span className="text-[11px] text-gray-400 font-medium">
            {myActivities.length} activities
          </span>
        </div>

        <div className="rounded-2xl bg-white border border-gray-100 overflow-hidden shadow-sm">
          <div className="divide-y divide-gray-50">
            <AnimatePresence mode="popLayout">
              {visibleActivities.map((activity, idx) => {
                const config = activityTypeConfig[activity.type] || activityTypeConfig.meeting;
                const Icon = config.icon;

                return (
                  <motion.div
                    key={activity.id}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, y: -10 }}
                    layout
                    className="flex items-start gap-3 p-4 min-h-[44px]"
                  >
                    {/* Timeline dot & line */}
                    <div className="flex flex-col items-center shrink-0">
                      <div
                        className={`w-9 h-9 rounded-lg ${config.bg} flex items-center justify-center`}
                      >
                        <Icon size={16} className={config.color} />
                      </div>
                      {idx < visibleActivities.length - 1 && (
                        <div className="w-0.5 h-full min-h-[12px] bg-gray-100 mt-1" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#1B2A4A] font-medium leading-snug">
                        {activity.description}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        <span className="text-[11px] text-gray-400 flex items-center gap-1">
                          <Clock size={11} />
                          {timeAgo(activity.date)}
                        </span>
                        {activity.participants > 0 && (
                          <span className="text-[11px] text-gray-400 flex items-center gap-1">
                            <Users size={11} />
                            {activity.participants} participants
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Amount */}
                    {activity.amount != null && activity.amount > 0 && (
                      <span
                        className={`shrink-0 text-xs font-bold px-2.5 py-1 rounded-full ${
                          activity.type === 'sale' || activity.type === 'payment'
                            ? 'bg-green-50 text-green-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {activity.type === 'sale' || activity.type === 'payment'
                          ? '+'
                          : '-'}
                        {formatCurrencyFull(activity.amount)}
                      </span>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Load more button */}
          {activityLimit < myActivities.length && (
            <button
              onClick={() => setActivityLimit((prev) => prev + 5)}
              className="w-full py-3 text-sm font-medium text-[#2AA198] hover:bg-[#2AA198]/5 active:bg-[#2AA198]/10 transition-colors border-t border-gray-50 flex items-center justify-center gap-1.5 min-h-[44px]"
            >
              Load More
              <ChevronDown size={16} />
            </button>
          )}

          {activityLimit >= myActivities.length && myActivities.length > 5 && (
            <button
              onClick={() => setActivityLimit(5)}
              className="w-full py-3 text-sm font-medium text-gray-400 hover:bg-gray-50 transition-colors border-t border-gray-50 flex items-center justify-center gap-1.5 min-h-[44px]"
            >
              Show Less
            </button>
          )}
        </div>
      </motion.section>

      {/* ================================================================= */}
      {/* ALL COOPERATIVES SECTION                                          */}
      {/* ================================================================= */}
      <motion.section
        id="all-cooperatives"
        variants={itemVariants}
        className="px-4 lg:px-6"
      >
        {/* Section header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base lg:text-lg font-bold text-[#1B2A4A]">
              Cooperatives in Your Region
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Browse and discover cooperatives across Southern and East Africa
            </p>
          </div>
          <div className="hidden lg:flex items-center gap-2 text-xs text-gray-400">
            <Filter size={14} />
            {filteredCooperatives.length} of {cooperatives.length}
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-3 scrollbar-hide snap-x snap-mandatory">
          {filterTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`shrink-0 snap-start text-xs font-semibold px-4 py-2 rounded-full border transition-all min-h-[36px] ${
                activeFilter === tab
                  ? 'bg-[#1B2A4A] text-white border-[#1B2A4A]'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 active:bg-gray-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative mb-4">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search cooperatives, regions, crops..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm text-[#1B2A4A] placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2AA198]/30 focus:border-[#2AA198] transition-all bg-white min-h-[44px]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <span className="text-xs text-gray-400">&times;</span>
            </button>
          )}
        </div>

        {/* Cooperative cards grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-2 gap-4"
        >
          <AnimatePresence mode="popLayout">
            {filteredCooperatives.map((coop) => (
              <motion.div
                key={coop.id}
                variants={cardVariants}
                layout
                exit={{ opacity: 0, scale: 0.95 }}
                className="rounded-2xl bg-white border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="p-4 lg:p-5">
                  {/* Card top */}
                  <div className="flex items-start gap-3">
                    {/* Logo placeholder */}
                    <div
                      className={`shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${
                        typeGradients[coop.type]
                      } flex items-center justify-center shadow-sm`}
                    >
                      <span className="text-white text-sm font-bold">
                        {getInitials(coop.name)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-[#1B2A4A] leading-tight truncate">
                        {coop.name}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                            typeBadgeColors[coop.type]
                          }`}
                        >
                          {typeLabels[coop.type]}
                        </span>
                        <span className="text-[11px] text-gray-400">
                          {getCountryFlag(coop.country)} {coop.country}
                        </span>
                      </div>
                    </div>
                    {/* Status badge */}
                    <span
                      className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                        statusBadgeColors[coop.status]
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          statusDotColors[coop.status]
                        }`}
                      />
                      {coop.status.charAt(0).toUpperCase() + coop.status.slice(1)}
                    </span>
                  </div>

                  {/* Stats row */}
                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Users size={12} className="text-[#2AA198]" />
                      <span className="font-semibold text-[#1B2A4A]">
                        {coop.memberCount}
                      </span>{' '}
                      members
                    </span>
                    <span className="flex items-center gap-1">
                      <Globe size={12} className="text-green-500" />
                      <span className="font-semibold text-[#1B2A4A]">
                        {formatNumber(coop.totalHectares)}
                      </span>{' '}
                      ha
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign size={12} className="text-[#D4A843]" />
                      <span className="font-semibold text-[#1B2A4A]">
                        {formatCurrency(coop.annualRevenue)}
                      </span>
                    </span>
                  </div>

                  {/* Main crops */}
                  <div className="flex flex-wrap gap-1 mt-3">
                    {coop.mainCrops.slice(0, 3).map((crop) => (
                      <span
                        key={crop}
                        className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-50 text-gray-500 border border-gray-100"
                      >
                        {crop}
                      </span>
                    ))}
                    {coop.mainCrops.length > 3 && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-50 text-gray-400">
                        +{coop.mainCrops.length - 3} more
                      </span>
                    )}
                  </div>

                  {/* Expanded details */}
                  <AnimatePresence>
                    {expandedCard === coop.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{
                          type: 'spring' as const,
                          stiffness: 300,
                          damping: 28,
                        }}
                        className="overflow-hidden"
                      >
                        <div className="pt-3 mt-3 border-t border-gray-50 space-y-3">
                          <p className="text-xs text-gray-500 leading-relaxed">
                            {coop.description}
                          </p>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Shield size={12} className="text-[#1B2A4A]" />
                              <span>{coop.chairman}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <MapPin size={12} className="text-[#D4A843]" />
                              <span>{coop.region}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Mail size={12} className="text-[#2AA198]" />
                              <span className="truncate">{coop.contactEmail}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Calendar size={12} className="text-blue-500" />
                              <span>Est. {coop.established}</span>
                            </div>
                          </div>

                          {coop.certifications.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {coop.certifications.map((cert) => (
                                <span
                                  key={cert}
                                  className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#D4A843]/10 text-[#D4A843] border border-[#D4A843]/20 flex items-center gap-0.5"
                                >
                                  <Star size={9} />
                                  {cert}
                                </span>
                              ))}
                            </div>
                          )}

                          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-blue-50/50 border border-blue-100">
                            <Calendar size={13} className="text-blue-600 shrink-0" />
                            <span className="text-[11px] text-gray-600">
                              Meetings: {coop.meetingSchedule}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Learn More button */}
                  <button
                    onClick={() =>
                      setExpandedCard(expandedCard === coop.id ? null : coop.id)
                    }
                    className="flex items-center justify-center gap-1.5 w-full mt-3 py-2.5 rounded-xl text-xs font-semibold text-[#2AA198] bg-[#2AA198]/5 hover:bg-[#2AA198]/10 active:bg-[#2AA198]/15 transition-colors min-h-[40px]"
                  >
                    {expandedCard === coop.id ? 'Show Less' : 'Learn More'}
                    <ChevronDown
                      size={14}
                      className={`transition-transform duration-200 ${
                        expandedCard === coop.id ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Empty state */}
        {filteredCooperatives.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
              <Search size={24} className="text-gray-300" />
            </div>
            <p className="text-sm font-semibold text-[#1B2A4A]">No cooperatives found</p>
            <p className="text-xs text-gray-400 mt-1">
              Try adjusting your search or filter criteria
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveFilter('All');
              }}
              className="mt-3 text-xs font-medium text-[#2AA198] hover:underline"
            >
              Clear all filters
            </button>
          </motion.div>
        )}

        {/* Stats summary at bottom */}
        <motion.div
          variants={cardVariants}
          className="mt-6 rounded-2xl bg-gradient-to-br from-[#1B2A4A] to-[#1B2A4A]/90 p-5 lg:p-6 text-white relative overflow-hidden"
        >
          {/* Decorative */}
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/5 rounded-full" />
          <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/5 rounded-full" />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 size={18} className="text-[#D4A843]" />
              <h4 className="text-sm font-bold text-white/90 uppercase tracking-wide">
                Network Summary
              </h4>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <p className="text-2xl lg:text-3xl font-bold">
                  {summaryStats.totalCooperatives}
                </p>
                <p className="text-[11px] text-white/60 mt-0.5">
                  Total Cooperatives
                </p>
              </div>
              <div>
                <p className="text-2xl lg:text-3xl font-bold">
                  {summaryStats.totalMembers}
                </p>
                <p className="text-[11px] text-white/60 mt-0.5">Total Members</p>
              </div>
              <div>
                <p className="text-2xl lg:text-3xl font-bold">
                  {formatNumber(summaryStats.combinedHectares)}
                </p>
                <p className="text-[11px] text-white/60 mt-0.5">Combined Hectares</p>
              </div>
              <div>
                <p className="text-2xl lg:text-3xl font-bold">
                  {formatCurrency(summaryStats.combinedRevenue)}
                </p>
                <p className="text-[11px] text-white/60 mt-0.5">Combined Revenue</p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.section>

      {/* Bottom spacer for mobile nav */}
      <div className="h-4 lg:h-0" />
    </motion.div>
  );
}
