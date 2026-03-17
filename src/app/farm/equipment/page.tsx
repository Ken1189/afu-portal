'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wrench,
  Search,
  Star,
  MapPin,
  Truck,
  Shield,
  Heart,
  ChevronDown,
  Package,
  Tractor,
  Wheat,
  Droplets,
  SprayCan,
  Rows3,
  TrainTrack,
  Factory,
  Plane,
  Clock,
  DollarSign,
  TrendingUp,
  CalendarDays,
  ArrowRight,
  X,
  Bookmark,
  CheckCircle2,
  Settings,
} from 'lucide-react';
import {
  equipment,
  equipmentBookings,
  type Equipment,
  type EquipmentBooking,
  type EquipmentCategory,
} from '@/lib/data/equipment';

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

type TabKey = 'browse' | 'bookings' | 'saved';
type SortKey = 'price-asc' | 'price-desc' | 'rating' | 'newest';
type CategoryFilter = 'all' | EquipmentCategory;
type BookingFilter = 'all' | EquipmentBooking['status'];

interface CategoryOption {
  key: CategoryFilter;
  label: string;
  icon: React.ReactNode;
}

const categories: CategoryOption[] = [
  { key: 'all', label: 'All', icon: <Package size={14} /> },
  { key: 'tractor', label: 'Tractors', icon: <Tractor size={14} /> },
  { key: 'harvester', label: 'Harvesters', icon: <Wheat size={14} /> },
  { key: 'irrigation', label: 'Irrigation', icon: <Droplets size={14} /> },
  { key: 'sprayer', label: 'Sprayers', icon: <SprayCan size={14} /> },
  { key: 'planter', label: 'Planters', icon: <Rows3 size={14} /> },
  { key: 'trailer', label: 'Trailers', icon: <TrainTrack size={14} /> },
  { key: 'processing', label: 'Processing', icon: <Factory size={14} /> },
  { key: 'drone', label: 'Drones', icon: <Plane size={14} /> },
];

const sortOptions: { key: SortKey; label: string }[] = [
  { key: 'price-asc', label: 'Price: Low to High' },
  { key: 'price-desc', label: 'Price: High to Low' },
  { key: 'rating', label: 'Best Rating' },
  { key: 'newest', label: 'Newest' },
];

const categoryColors: Record<string, string> = {
  tractor: 'bg-blue-100 text-blue-700',
  harvester: 'bg-amber-100 text-amber-700',
  irrigation: 'bg-cyan-100 text-cyan-700',
  sprayer: 'bg-green-100 text-green-700',
  planter: 'bg-purple-100 text-purple-700',
  trailer: 'bg-orange-100 text-orange-700',
  processing: 'bg-rose-100 text-rose-700',
  drone: 'bg-indigo-100 text-indigo-700',
};

const availabilityConfig: Record<
  Equipment['availability'],
  { bg: string; text: string; label: string; icon: React.ReactNode }
> = {
  available: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    label: 'Available',
    icon: <CheckCircle2 size={12} />,
  },
  booked: {
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    label: 'Booked',
    icon: <Clock size={12} />,
  },
  maintenance: {
    bg: 'bg-red-100',
    text: 'text-red-600',
    label: 'Maintenance',
    icon: <Settings size={12} />,
  },
};

const conditionConfig: Record<
  Equipment['condition'],
  { bg: string; text: string }
> = {
  excellent: { bg: 'bg-green-50', text: 'text-green-700' },
  good: { bg: 'bg-blue-50', text: 'text-blue-700' },
  fair: { bg: 'bg-amber-50', text: 'text-amber-700' },
};

const bookingStatusConfig: Record<
  EquipmentBooking['status'],
  { bg: string; text: string; label: string }
> = {
  pending: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Pending' },
  confirmed: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Confirmed' },
  active: { bg: 'bg-green-100', text: 'text-green-700', label: 'Active' },
  completed: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Completed' },
  cancelled: { bg: 'bg-red-100', text: 'text-red-600', label: 'Cancelled' },
};

const countryFlags: Record<string, string> = {
  Botswana: '\u{1F1E7}\u{1F1FC}',
  Zimbabwe: '\u{1F1FF}\u{1F1FC}',
  Tanzania: '\u{1F1F9}\u{1F1FF}',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getCategoryCount(cat: CategoryFilter): number {
  if (cat === 'all') return equipment.length;
  return equipment.filter((e) => e.category === cat).length;
}

function sortEquipment(items: Equipment[], key: SortKey): Equipment[] {
  const sorted = [...items];
  switch (key) {
    case 'price-asc':
      return sorted.sort((a, b) => a.dailyRate - b.dailyRate);
    case 'price-desc':
      return sorted.sort((a, b) => b.dailyRate - a.dailyRate);
    case 'rating':
      return sorted.sort((a, b) => b.rating - a.rating);
    case 'newest':
      return sorted.sort((a, b) => b.reviewCount - a.reviewCount);
    default:
      return sorted;
  }
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function EquipmentCard({
  item,
  onToggleSaved,
  isSaved,
}: {
  item: Equipment;
  onToggleSaved: (id: string) => void;
  isSaved: boolean;
}) {
  const avail = availabilityConfig[item.availability];
  const cond = conditionConfig[item.condition];
  const catColor = categoryColors[item.category] || 'bg-gray-100 text-gray-600';
  const specEntries = Object.entries(item.specs).slice(0, 3);
  const flag = countryFlags[item.country] || '';

  return (
    <motion.div
      variants={cardVariants}
      className="rounded-2xl bg-white border border-gray-100 overflow-hidden flex flex-col shadow-sm hover:shadow-lg transition-shadow"
    >
      {/* Image */}
      <div className="relative h-48 bg-gray-200 overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

        {/* Save button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            onToggleSaved(item.id);
          }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors"
        >
          <Heart
            size={16}
            className={
              isSaved ? 'text-red-500 fill-red-500' : 'text-gray-500'
            }
          />
        </button>

        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <span
            className={`text-[10px] font-semibold px-2 py-1 rounded-full capitalize ${catColor}`}
          >
            {item.category}
          </span>
        </div>

        {/* Availability badge */}
        <div className="absolute bottom-3 left-3">
          <span
            className={`text-[10px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 ${avail.bg} ${avail.text}`}
          >
            {avail.icon}
            {avail.label}
          </span>
        </div>

        {/* Country flag */}
        <div className="absolute bottom-3 right-3">
          <span className="text-lg">{flag}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        {/* Name */}
        <h3 className="text-sm font-bold text-[#1B2A4A] leading-tight line-clamp-2 min-h-[2.5rem]">
          {item.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mt-1.5">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={12}
                className={
                  i < Math.floor(item.rating)
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-gray-200 fill-gray-200'
                }
              />
            ))}
          </div>
          <span className="text-[11px] text-gray-600 font-medium">
            {item.rating}
          </span>
          <span className="text-[10px] text-gray-400">
            ({item.reviewCount} reviews)
          </span>
        </div>

        {/* Description */}
        <p className="text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed">
          {item.description}
        </p>

        {/* Specs pills */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {specEntries.map(([key, val]) => (
            <span
              key={key}
              className="text-[10px] bg-gray-50 text-gray-600 px-2 py-1 rounded-lg border border-gray-100"
            >
              <span className="font-semibold text-[#1B2A4A]">{key}:</span> {val}
            </span>
          ))}
        </div>

        {/* Location & Owner */}
        <div className="flex items-center gap-2 mt-3 text-[11px] text-gray-500">
          <MapPin size={12} className="text-gray-400 shrink-0" />
          <span className="truncate">{item.location}</span>
          <span className="text-gray-300">|</span>
          <span className="truncate font-medium text-gray-600">
            {item.owner}
          </span>
        </div>

        {/* Badges row */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {item.deliveryAvailable && (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 flex items-center gap-1">
              <Truck size={10} />
              Delivery
            </span>
          )}
          {item.insuranceIncluded && (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 flex items-center gap-1">
              <Shield size={10} />
              Insured
            </span>
          )}
          <span
            className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${cond.bg} ${cond.text}`}
          >
            {item.condition}
          </span>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Pricing */}
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="text-xs text-gray-500 mb-1">Rental pricing</div>
          <div className="flex items-baseline gap-1 flex-wrap">
            <span className="text-lg font-bold text-[#2AA198]">
              ${item.dailyRate}
            </span>
            <span className="text-xs text-gray-400">/day</span>
            <span className="text-gray-300 mx-1">&bull;</span>
            <span className="text-sm font-semibold text-gray-700">
              ${item.weeklyRate}
            </span>
            <span className="text-xs text-gray-400">/week</span>
            <span className="text-gray-300 mx-1">&bull;</span>
            <span className="text-sm font-semibold text-gray-700">
              ${item.monthlyRate.toLocaleString()}
            </span>
            <span className="text-xs text-gray-400">/month</span>
          </div>
        </div>

        {/* Action button */}
        <div className="mt-3">
          {item.availability === 'available' ? (
            <Link
              href={`/farm/equipment/booking?id=${item.id}`}
              className="w-full h-10 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 bg-[#2AA198] text-white hover:bg-[#1A7A72] active:scale-[0.97] transition-all"
            >
              Book Now
              <ArrowRight size={16} />
            </Link>
          ) : (
            <div
              className={`w-full h-10 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 ${
                item.availability === 'booked'
                  ? 'bg-amber-50 text-amber-600 border border-amber-200'
                  : 'bg-red-50 text-red-500 border border-red-200'
              }`}
            >
              {item.availability === 'booked' ? (
                <>
                  <Clock size={16} />
                  Currently Booked
                </>
              ) : (
                <>
                  <Settings size={16} />
                  Under Maintenance
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function BookingCard({
  booking,
  onCancel,
  onExtend,
}: {
  booking: EquipmentBooking;
  onCancel: (id: string) => void;
  onExtend: (id: string) => void;
}) {
  const status = bookingStatusConfig[booking.status];

  return (
    <motion.div
      variants={cardVariants}
      className="rounded-2xl bg-white border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-bold text-[#1B2A4A] truncate">
              {booking.equipmentName}
            </h3>
            <span
              className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${status.bg} ${status.text}`}
            >
              {status.label}
            </span>
          </div>

          <div className="mt-3 space-y-2">
            {/* Booking reference */}
            <div className="text-[11px] text-gray-400">
              Ref: <span className="font-mono text-gray-600">{booking.id}</span>
            </div>

            {/* Dates */}
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <CalendarDays size={14} className="text-gray-400 shrink-0" />
              <span className="font-medium">{booking.startDate}</span>
              <ArrowRight size={12} className="text-gray-300" />
              <span className="font-medium">{booking.endDate}</span>
            </div>

            {/* Total cost */}
            <div className="flex items-center gap-2 text-xs">
              <DollarSign size={14} className="text-gray-400 shrink-0" />
              <span className="font-bold text-[#1B2A4A]">
                ${booking.totalCost.toLocaleString()} USD
              </span>
            </div>

            {/* Delivery */}
            {booking.deliveryRequested && (
              <div className="flex items-center gap-2 text-xs text-blue-600">
                <Truck size={14} className="shrink-0" />
                <span className="font-medium">Delivery Requested</span>
              </div>
            )}

            {/* Notes */}
            {booking.notes && (
              <p className="text-[11px] text-gray-500 mt-1 leading-relaxed bg-gray-50 rounded-lg p-2.5">
                {booking.notes}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      {(booking.status === 'pending' || booking.status === 'active') && (
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
          {booking.status === 'pending' && (
            <button
              onClick={() => onCancel(booking.id)}
              className="flex-1 h-9 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
            >
              <X size={14} />
              Cancel Booking
            </button>
          )}
          {booking.status === 'active' && (
            <button
              onClick={() => onExtend(booking.id)}
              className="flex-1 h-9 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 bg-[#2AA198] text-white hover:bg-[#1A7A72] transition-colors"
            >
              <CalendarDays size={14} />
              Extend Rental
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main Page Component
// ---------------------------------------------------------------------------

export default function EquipmentHirePage() {
  // --- State ---
  const [activeTab, setActiveTab] = useState<TabKey>('browse');
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('rating');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [bookingFilter, setBookingFilter] = useState<BookingFilter>('all');
  const [savedIds, setSavedIds] = useState<Set<string>>(
    new Set(['EQP-001', 'EQP-009', 'EQP-015']),
  );
  const [bookings, setBookings] = useState<EquipmentBooking[]>(equipmentBookings);

  // --- Derived ---
  const filteredEquipment = useMemo(() => {
    let items = [...equipment];

    // Category filter
    if (selectedCategory !== 'all') {
      items = items.filter((e) => e.category === selectedCategory);
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q) ||
          e.location.toLowerCase().includes(q) ||
          e.country.toLowerCase().includes(q) ||
          e.owner.toLowerCase().includes(q),
      );
    }

    // Sort
    items = sortEquipment(items, sortKey);

    return items;
  }, [selectedCategory, searchQuery, sortKey]);

  const filteredBookings = useMemo(() => {
    if (bookingFilter === 'all') return bookings;
    return bookings.filter((b) => b.status === bookingFilter);
  }, [bookingFilter, bookings]);

  const savedEquipment = useMemo(
    () => equipment.filter((e) => savedIds.has(e.id)),
    [savedIds],
  );

  // --- Stats ---
  const stats = useMemo(() => {
    const availableCount = equipment.filter(
      (e) => e.availability === 'available',
    ).length;
    const activeRentals = bookings.filter(
      (b) => b.status === 'active',
    ).length;
    const thisMonthSpent = bookings
      .filter(
        (b) =>
          (b.status === 'active' || b.status === 'confirmed') &&
          b.startDate.startsWith('2026-03'),
      )
      .reduce((sum, b) => sum + b.totalCost, 0);
    const avgRating =
      equipment.reduce((sum, e) => sum + e.rating, 0) / equipment.length;

    return { availableCount, activeRentals, thisMonthSpent, avgRating };
  }, [bookings]);

  // --- Handlers ---
  const handleToggleSaved = (id: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleCancelBooking = (id: string) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === id ? { ...b, status: 'cancelled' as const } : b,
      ),
    );
  };

  const handleExtendBooking = (id: string) => {
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b;
        const end = new Date(b.endDate);
        end.setDate(end.getDate() + 7);
        return {
          ...b,
          endDate: end.toISOString().split('T')[0],
          totalCost: b.totalCost + 350,
          notes: b.notes + ' (Extended +7 days)',
        };
      }),
    );
  };

  // --- Tabs ---
  const tabs: { key: TabKey; label: string }[] = [
    { key: 'browse', label: 'Browse Equipment' },
    { key: 'bookings', label: 'My Bookings' },
    { key: 'saved', label: 'Saved' },
  ];

  const bookingFilterOptions: { key: BookingFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'active', label: 'Active' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
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
        className="bg-gradient-to-br from-[#1B2A4A] via-[#1B2A4A] to-[#2AA198]/30 text-white"
      >
        <div className="max-w-6xl mx-auto px-4 lg:px-6 py-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <Wrench size={28} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
                  Equipment Hire
                </h1>
                <p className="text-white/70 text-sm mt-1">
                  Rent tractors, harvesters, and farm machinery
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('bookings')}
              className="hidden sm:flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
            >
              <CalendarDays size={16} />
              My Bookings
            </button>
          </div>
        </div>
      </motion.div>

      <div className="max-w-6xl mx-auto px-4 lg:px-6 py-6">
        {/* ---------------------------------------------------------------- */}
        {/* Stats Row                                                        */}
        {/* ---------------------------------------------------------------- */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6"
        >
          {[
            {
              label: 'Available Equipment',
              value: stats.availableCount.toString(),
              icon: <Package size={20} className="text-[#2AA198]" />,
              accent: 'bg-teal-50',
            },
            {
              label: 'Active Rentals',
              value: stats.activeRentals.toString(),
              icon: <Clock size={20} className="text-blue-500" />,
              accent: 'bg-blue-50',
            },
            {
              label: 'This Month Spent',
              value: `$${stats.thisMonthSpent.toLocaleString()}`,
              icon: <DollarSign size={20} className="text-amber-500" />,
              accent: 'bg-amber-50',
            },
            {
              label: 'Avg Rating',
              value: stats.avgRating.toFixed(1),
              icon: <Star size={20} className="text-[#D4A843] fill-[#D4A843]" />,
              accent: 'bg-yellow-50',
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
              {tab.key === 'bookings' && (
                <span
                  className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full ${
                    activeTab === tab.key
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {bookings.length}
                </span>
              )}
              {tab.key === 'saved' && (
                <span
                  className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full ${
                    activeTab === tab.key
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {savedIds.size}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ================================================================ */}
        {/* BROWSE TAB                                                       */}
        {/* ================================================================ */}
        <AnimatePresence mode="wait">
          {activeTab === 'browse' && (
            <motion.div
              key="browse"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Category filter pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
                {categories.map((cat) => {
                  const count = getCategoryCount(cat.key);
                  const isActive = selectedCategory === cat.key;
                  return (
                    <button
                      key={cat.key}
                      onClick={() => setSelectedCategory(cat.key)}
                      className={`flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl whitespace-nowrap transition-all border ${
                        isActive
                          ? 'bg-[#1B2A4A] text-white border-[#1B2A4A] shadow-sm'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-[#2AA198] hover:text-[#2AA198]'
                      }`}
                    >
                      {cat.icon}
                      {cat.label}
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Search + Sort row */}
              <div className="flex items-center gap-3 mb-6">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search equipment, location, owner..."
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
                    <TrendingUp size={14} />
                    <span className="hidden sm:inline">
                      {sortOptions.find((s) => s.key === sortKey)?.label}
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
                        {sortOptions.map((opt) => (
                          <button
                            key={opt.key}
                            onClick={() => {
                              setSortKey(opt.key);
                              setShowSortDropdown(false);
                            }}
                            className={`w-full text-left text-sm px-4 py-2.5 hover:bg-gray-50 transition-colors ${
                              sortKey === opt.key
                                ? 'text-[#2AA198] font-semibold bg-teal-50/50'
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
                Showing {filteredEquipment.length} of {equipment.length} items
              </div>

              {/* Equipment grid */}
              {filteredEquipment.length > 0 ? (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 lg:grid-cols-2 gap-4"
                >
                  {filteredEquipment.map((item) => (
                    <EquipmentCard
                      key={item.id}
                      item={item}
                      onToggleSaved={handleToggleSaved}
                      isSaved={savedIds.has(item.id)}
                    />
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
                    No equipment found
                  </h3>
                  <p className="text-xs text-gray-500">
                    Try adjusting your search or category filter
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                    }}
                    className="mt-4 text-xs font-semibold text-[#2AA198] hover:underline"
                  >
                    Clear all filters
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ================================================================ */}
          {/* BOOKINGS TAB                                                     */}
          {/* ================================================================ */}
          {activeTab === 'bookings' && (
            <motion.div
              key="bookings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Booking status filter */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
                {bookingFilterOptions.map((opt) => {
                  const isActive = bookingFilter === opt.key;
                  const count =
                    opt.key === 'all'
                      ? bookings.length
                      : bookings.filter((b) => b.status === opt.key).length;
                  return (
                    <button
                      key={opt.key}
                      onClick={() => setBookingFilter(opt.key)}
                      className={`flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl whitespace-nowrap transition-all border ${
                        isActive
                          ? 'bg-[#1B2A4A] text-white border-[#1B2A4A] shadow-sm'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-[#2AA198] hover:text-[#2AA198]'
                      }`}
                    >
                      {opt.label}
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Booking cards */}
              {filteredBookings.length > 0 ? (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-3"
                >
                  {filteredBookings.map((booking) => (
                    <BookingCard
                      key={booking.id}
                      booking={booking}
                      onCancel={handleCancelBooking}
                      onExtend={handleExtendBooking}
                    />
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-16"
                >
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <CalendarDays size={28} className="text-gray-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-[#1B2A4A] mb-1">
                    No bookings found
                  </h3>
                  <p className="text-xs text-gray-500">
                    {bookingFilter === 'all'
                      ? 'You haven\'t made any equipment bookings yet'
                      : `No ${bookingFilter} bookings`}
                  </p>
                  <button
                    onClick={() => setActiveTab('browse')}
                    className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#2AA198] hover:underline"
                  >
                    Browse Equipment
                    <ArrowRight size={12} />
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ================================================================ */}
          {/* SAVED TAB                                                        */}
          {/* ================================================================ */}
          {activeTab === 'saved' && (
            <motion.div
              key="saved"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Info message */}
              <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                    <Heart size={20} className="text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#1B2A4A]">
                      Saved Equipment
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Save equipment for later by clicking the heart icon on any
                      listing. Easily find and book your favourite items here.
                    </p>
                  </div>
                </div>
              </div>

              {savedEquipment.length > 0 ? (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 lg:grid-cols-2 gap-4"
                >
                  {savedEquipment.map((item) => (
                    <EquipmentCard
                      key={item.id}
                      item={item}
                      onToggleSaved={handleToggleSaved}
                      isSaved={true}
                    />
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-16"
                >
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Bookmark size={28} className="text-gray-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-[#1B2A4A] mb-1">
                    No saved items
                  </h3>
                  <p className="text-xs text-gray-500">
                    Browse equipment and click the heart icon to save items here
                  </p>
                  <button
                    onClick={() => setActiveTab('browse')}
                    className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#2AA198] hover:underline"
                  >
                    Browse Equipment
                    <ArrowRight size={12} />
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
