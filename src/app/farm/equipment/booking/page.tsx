'use client';

import { useState, useMemo, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Star,
  MapPin,
  Truck,
  Shield,
  CalendarDays,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Wrench,
  ArrowRight,
  Package,
  Info,
  Settings,
} from 'lucide-react';
import { equipment as mockEquipment } from '@/lib/data/equipment';

const equipment = mockEquipment;

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

const conditionConfig: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  excellent: {
    bg: 'bg-green-50 border-green-200',
    text: 'text-green-700',
    label: 'Excellent',
  },
  good: {
    bg: 'bg-blue-50 border-blue-200',
    text: 'text-blue-700',
    label: 'Good',
  },
  fair: {
    bg: 'bg-amber-50 border-amber-200',
    text: 'text-amber-700',
    label: 'Fair',
  },
};

const countryFlags: Record<string, string> = {
  Botswana: '\u{1F1E7}\u{1F1FC}',
  Zimbabwe: '\u{1F1FF}\u{1F1FC}',
  Tanzania: '\u{1F1F9}\u{1F1FF}',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function calculateDays(start: string, end: string): number {
  if (!start || !end) return 0;
  const s = new Date(start);
  const e = new Date(end);
  const diff = Math.ceil(
    (e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24),
  );
  return diff > 0 ? diff : 0;
}

function calculateCost(
  days: number,
  dailyRate: number,
  weeklyRate: number,
  monthlyRate: number,
): { breakdown: string; total: number } {
  if (days <= 0) return { breakdown: '', total: 0 };

  const months = Math.floor(days / 30);
  const remainAfterMonths = days % 30;
  const weeks = Math.floor(remainAfterMonths / 7);
  const remainDays = remainAfterMonths % 7;

  let total = 0;
  const parts: string[] = [];

  if (months > 0) {
    total += months * monthlyRate;
    parts.push(`${months} month${months > 1 ? 's' : ''} x $${monthlyRate}`);
  }
  if (weeks > 0) {
    total += weeks * weeklyRate;
    parts.push(`${weeks} week${weeks > 1 ? 's' : ''} x $${weeklyRate}`);
  }
  if (remainDays > 0) {
    total += remainDays * dailyRate;
    parts.push(
      `${remainDays} day${remainDays > 1 ? 's' : ''} x $${dailyRate}`,
    );
  }

  return { breakdown: parts.join(' + '), total };
}

function generateBookingRef(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'BK-';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// ---------------------------------------------------------------------------
// Inner component that uses useSearchParams
// ---------------------------------------------------------------------------

function BookingContent() {
  const searchParams = useSearchParams();
  const equipmentId = searchParams.get('id');
  const selectedEquipment = useMemo(
    () => equipment.find((e) => e.id === equipmentId) ?? null,
    [equipmentId],
  );

  // --- Form state ---
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [deliveryToggle, setDeliveryToggle] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [specialRequirements, setSpecialRequirements] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [bookingRef, setBookingRef] = useState('');

  // --- Derived calculations ---
  const days = useMemo(
    () => calculateDays(startDate, endDate),
    [startDate, endDate],
  );

  const costCalc = useMemo(() => {
    if (!selectedEquipment) return { breakdown: '', total: 0 };
    return calculateCost(
      days,
      selectedEquipment.dailyRate,
      selectedEquipment.weeklyRate,
      selectedEquipment.monthlyRate,
    );
  }, [days, selectedEquipment]);

  const deliveryCost = useMemo(
    () =>
      deliveryToggle && selectedEquipment?.deliveryAvailable
        ? selectedEquipment.deliveryFee
        : 0,
    [deliveryToggle, selectedEquipment],
  );

  const grandTotal = costCalc.total + deliveryCost;

  const minDaysValid = useMemo(() => {
    if (!selectedEquipment) return true;
    return days >= selectedEquipment.minBookingDays;
  }, [days, selectedEquipment]);

  // --- Handlers ---
  const handleSubmit = useCallback(() => {
    if (!startDate || !endDate || days <= 0 || !minDaysValid) return;
    const ref = generateBookingRef();
    setBookingRef(ref);
    setShowSuccess(true);
  }, [startDate, endDate, days, minDaysValid]);

  const todayStr = new Date().toISOString().split('T')[0];

  // =========================================================================
  // No equipment selected
  // =========================================================================
  if (!selectedEquipment) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 lg:px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={36} className="text-amber-500" />
            </div>
            <h2 className="text-xl font-bold text-[#1B2A4A] mb-2">
              No Equipment Selected
            </h2>
            <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
              Please select an equipment item from the catalogue before making a
              booking. Browse our available machinery and click &quot;Book
              Now&quot; to proceed.
            </p>
            <Link
              href="/farm/equipment"
              className="inline-flex items-center gap-2 bg-[#2AA198] text-white text-sm font-semibold px-6 py-3 rounded-xl hover:bg-[#1A7A72] transition-colors"
            >
              <ArrowLeft size={16} />
              Browse Equipment
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  const cond =
    conditionConfig[selectedEquipment.condition] || conditionConfig.good;
  const catColor =
    categoryColors[selectedEquipment.category] || 'bg-gray-100 text-gray-600';
  const flag = countryFlags[selectedEquipment.country] || '';

  // =========================================================================
  // Main booking page
  // =========================================================================
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Success Modal */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
            >
              {/* Green checkmark animation */}
              <div className="flex justify-center mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: 'spring',
                    stiffness: 200,
                    damping: 12,
                    delay: 0.15,
                  }}
                  className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: 'spring',
                      stiffness: 300,
                      damping: 15,
                      delay: 0.3,
                    }}
                  >
                    <CheckCircle2 size={44} className="text-green-500" />
                  </motion.div>
                </motion.div>
              </div>

              <h2 className="text-xl font-bold text-[#1B2A4A] text-center mb-1">
                Booking Confirmed!
              </h2>
              <p className="text-sm text-gray-500 text-center mb-6">
                Your equipment rental has been successfully booked.
              </p>

              {/* Booking summary */}
              <div className="bg-gray-50 rounded-2xl p-4 space-y-3 mb-6">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Reference</span>
                  <span className="font-mono font-bold text-[#1B2A4A]">
                    {bookingRef}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Equipment</span>
                  <span className="font-semibold text-[#1B2A4A] text-right max-w-[60%] truncate">
                    {selectedEquipment.name}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Duration</span>
                  <span className="font-semibold text-[#1B2A4A]">
                    {startDate} to {endDate} ({days} days)
                  </span>
                </div>
                {deliveryToggle && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Delivery</span>
                    <span className="font-semibold text-blue-600">
                      Yes (+${deliveryCost})
                    </span>
                  </div>
                )}
                <div className="pt-2 border-t border-gray-200 flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-600">
                    Total Cost
                  </span>
                  <span className="text-lg font-bold text-[#2AA198]">
                    ${grandTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <Link
                  href="/farm/equipment"
                  onClick={() => setShowSuccess(false)}
                  className="w-full h-11 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 bg-[#1B2A4A] text-white hover:bg-[#1B2A4A]/90 transition-colors"
                >
                  <CalendarDays size={16} />
                  View My Bookings
                </Link>
                <Link
                  href="/farm/equipment"
                  onClick={() => setShowSuccess(false)}
                  className="w-full h-11 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <ArrowLeft size={16} />
                  Back to Browse
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ------------------------------------------------------------------ */}
      {/* Back link header                                                    */}
      {/* ------------------------------------------------------------------ */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 lg:px-6 py-4">
          <Link
            href="/farm/equipment"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#2AA198] transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Equipment
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 lg:px-6 py-6">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="grid grid-cols-1 lg:grid-cols-5 gap-6"
        >
          {/* ================================================================ */}
          {/* Left column: Equipment details (3/5)                             */}
          {/* ================================================================ */}
          <div className="lg:col-span-3 space-y-4">
            {/* Large image */}
            <motion.div
              variants={cardVariants}
              className="rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm"
            >
              <div className="relative h-56 sm:h-72 bg-gray-200">
                <img
                  src={selectedEquipment.image}
                  alt={selectedEquipment.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                {/* Category badge */}
                <div className="absolute top-4 left-4">
                  <span
                    className={`text-xs font-semibold px-3 py-1.5 rounded-full capitalize ${catColor}`}
                  >
                    {selectedEquipment.category}
                  </span>
                </div>
              </div>

              <div className="p-5">
                {/* Name */}
                <h1 className="text-xl font-bold text-[#1B2A4A] leading-tight">
                  {selectedEquipment.name}
                </h1>

                {/* Rating */}
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={
                          i < Math.floor(selectedEquipment.rating)
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-gray-200 fill-gray-200'
                        }
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {selectedEquipment.rating}
                  </span>
                  <span className="text-xs text-gray-400">
                    ({selectedEquipment.reviewCount} reviews)
                  </span>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 mt-4 leading-relaxed">
                  {selectedEquipment.description}
                </p>
              </div>
            </motion.div>

            {/* Specifications */}
            <motion.div
              variants={cardVariants}
              className="rounded-2xl bg-white border border-gray-100 p-5 shadow-sm"
            >
              <h2 className="text-sm font-bold text-[#1B2A4A] mb-4 flex items-center gap-2">
                <Settings size={16} className="text-[#2AA198]" />
                Specifications
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Object.entries(selectedEquipment.specs).map(([key, val]) => (
                  <div
                    key={key}
                    className="bg-gray-50 rounded-xl p-3 border border-gray-100"
                  >
                    <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">
                      {key}
                    </div>
                    <div className="text-sm font-semibold text-[#1B2A4A]">
                      {val}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Location, Owner, Condition */}
            <motion.div
              variants={cardVariants}
              className="rounded-2xl bg-white border border-gray-100 p-5 shadow-sm"
            >
              <h2 className="text-sm font-bold text-[#1B2A4A] mb-4 flex items-center gap-2">
                <Info size={16} className="text-[#2AA198]" />
                Details
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 flex items-center gap-2">
                    <MapPin size={14} className="text-gray-400" />
                    Location
                  </span>
                  <span className="text-sm font-medium text-[#1B2A4A]">
                    {flag} {selectedEquipment.location}
                  </span>
                </div>
                <div className="border-t border-gray-50" />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 flex items-center gap-2">
                    <Package size={14} className="text-gray-400" />
                    Owner
                  </span>
                  <span className="text-sm font-medium text-[#1B2A4A]">
                    {selectedEquipment.owner}
                  </span>
                </div>
                <div className="border-t border-gray-50" />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 flex items-center gap-2">
                    <Wrench size={14} className="text-gray-400" />
                    Condition
                  </span>
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full capitalize border ${cond.bg} ${cond.text}`}
                  >
                    {cond.label}
                  </span>
                </div>
                <div className="border-t border-gray-50" />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 flex items-center gap-2">
                    <Clock size={14} className="text-gray-400" />
                    Min. Booking
                  </span>
                  <span className="text-sm font-medium text-[#1B2A4A]">
                    {selectedEquipment.minBookingDays} day
                    {selectedEquipment.minBookingDays > 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Pricing table */}
            <motion.div
              variants={cardVariants}
              className="rounded-2xl bg-white border border-gray-100 p-5 shadow-sm"
            >
              <h2 className="text-sm font-bold text-[#1B2A4A] mb-4 flex items-center gap-2">
                <DollarSign size={16} className="text-[#2AA198]" />
                Pricing
              </h2>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-teal-50/50 rounded-xl p-4 text-center border border-teal-100">
                  <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">
                    Daily
                  </div>
                  <div className="text-xl font-bold text-[#2AA198]">
                    ${selectedEquipment.dailyRate}
                  </div>
                  <div className="text-[10px] text-gray-400 mt-0.5">
                    per day
                  </div>
                </div>
                <div className="bg-blue-50/50 rounded-xl p-4 text-center border border-blue-100">
                  <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">
                    Weekly
                  </div>
                  <div className="text-xl font-bold text-blue-600">
                    ${selectedEquipment.weeklyRate}
                  </div>
                  <div className="text-[10px] text-gray-400 mt-0.5">
                    per week
                  </div>
                </div>
                <div className="bg-purple-50/50 rounded-xl p-4 text-center border border-purple-100">
                  <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">
                    Monthly
                  </div>
                  <div className="text-xl font-bold text-purple-600">
                    ${selectedEquipment.monthlyRate.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-gray-400 mt-0.5">
                    per month
                  </div>
                </div>
              </div>

              {/* Delivery & Insurance info */}
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-3 text-xs">
                  <Truck
                    size={14}
                    className={
                      selectedEquipment.deliveryAvailable
                        ? 'text-blue-500'
                        : 'text-gray-300'
                    }
                  />
                  {selectedEquipment.deliveryAvailable ? (
                    <span className="text-gray-600">
                      Delivery available:{' '}
                      <span className="font-semibold text-[#1B2A4A]">
                        ${selectedEquipment.deliveryFee}
                      </span>{' '}
                      one-time fee
                    </span>
                  ) : (
                    <span className="text-gray-400">
                      Delivery not available &mdash; collection only
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <Shield
                    size={14}
                    className={
                      selectedEquipment.insuranceIncluded
                        ? 'text-green-500'
                        : 'text-gray-300'
                    }
                  />
                  {selectedEquipment.insuranceIncluded ? (
                    <span className="text-green-600 font-medium">
                      Insurance included in rental price
                    </span>
                  ) : (
                    <span className="text-gray-400">
                      Insurance not included &mdash; renter&apos;s responsibility
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* ================================================================ */}
          {/* Right column: Booking form (2/5)                                 */}
          {/* ================================================================ */}
          <div className="lg:col-span-2">
            <motion.div
              variants={cardVariants}
              className="rounded-2xl bg-white border border-gray-100 p-5 shadow-sm sticky top-6"
            >
              <h2 className="text-base font-bold text-[#1B2A4A] mb-5 flex items-center gap-2">
                <CalendarDays size={18} className="text-[#2AA198]" />
                Book This Equipment
              </h2>

              <div className="space-y-4">
                {/* Start date */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      if (endDate && e.target.value > endDate) {
                        setEndDate('');
                      }
                    }}
                    min={todayStr}
                    className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2AA198]/30 focus:border-[#2AA198] transition"
                  />
                </div>

                {/* End date */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate || todayStr}
                    className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2AA198]/30 focus:border-[#2AA198] transition"
                  />
                </div>

                {/* Min booking days warning */}
                {days > 0 && !minDaysValid && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 rounded-xl p-3 border border-amber-200"
                  >
                    <AlertTriangle size={14} className="shrink-0" />
                    Minimum booking is {selectedEquipment.minBookingDays} day
                    {selectedEquipment.minBookingDays > 1 ? 's' : ''}. Please
                    select a longer period.
                  </motion.div>
                )}

                {/* Duration & cost auto-calc */}
                {days > 0 && minDaysValid && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="bg-teal-50/50 rounded-xl p-4 border border-teal-100"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-500">Duration</span>
                      <span className="text-sm font-bold text-[#1B2A4A]">
                        {days} day{days > 1 ? 's' : ''}
                      </span>
                    </div>
                    {costCalc.breakdown && (
                      <div className="text-[11px] text-gray-500 mb-2">
                        {costCalc.breakdown}
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-2 border-t border-teal-200/50">
                      <span className="text-xs font-semibold text-gray-600">
                        Equipment cost
                      </span>
                      <span className="text-base font-bold text-[#2AA198]">
                        ${costCalc.total.toLocaleString()}
                      </span>
                    </div>
                  </motion.div>
                )}

                {/* Delivery toggle */}
                {selectedEquipment.deliveryAvailable && (
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-gray-600 flex items-center gap-2">
                        <Truck size={14} className="text-blue-500" />
                        Request Delivery
                        <span className="text-[10px] font-normal text-gray-400">
                          (+${selectedEquipment.deliveryFee})
                        </span>
                      </label>
                      <button
                        onClick={() => setDeliveryToggle(!deliveryToggle)}
                        className={`relative w-11 h-6 rounded-full transition-colors ${
                          deliveryToggle ? 'bg-[#2AA198]' : 'bg-gray-200'
                        }`}
                      >
                        <motion.div
                          animate={{ x: deliveryToggle ? 20 : 2 }}
                          transition={{
                            type: 'spring',
                            stiffness: 500,
                            damping: 30,
                          }}
                          className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
                        />
                      </button>
                    </div>

                    {/* Delivery address */}
                    <AnimatePresence>
                      {deliveryToggle && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-3 overflow-hidden"
                        >
                          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                            Delivery Address
                          </label>
                          <input
                            type="text"
                            value={deliveryAddress}
                            onChange={(e) =>
                              setDeliveryAddress(e.target.value)
                            }
                            placeholder="Farm address or coordinates..."
                            className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2AA198]/30 focus:border-[#2AA198] transition"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {!selectedEquipment.deliveryAvailable && (
                  <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <Info size={14} className="shrink-0" />
                    Collection only &mdash; delivery not available for this item.
                  </div>
                )}

                {/* Special requirements */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Special Requirements
                    <span className="text-gray-400 font-normal ml-1">
                      (optional)
                    </span>
                  </label>
                  <textarea
                    value={specialRequirements}
                    onChange={(e) => setSpecialRequirements(e.target.value)}
                    rows={3}
                    placeholder="Any special requests, attachments needed, calibration requirements..."
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2AA198]/30 focus:border-[#2AA198] transition resize-none"
                  />
                </div>

                {/* Grand total */}
                {days > 0 && minDaysValid && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-[#1B2A4A] rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between text-white">
                      <div>
                        <div className="text-xs text-white/60">Total Cost</div>
                        <div className="text-2xl font-bold mt-0.5">
                          ${grandTotal.toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right text-[11px] text-white/60 space-y-0.5">
                        <div>
                          Equipment: ${costCalc.total.toLocaleString()}
                        </div>
                        {deliveryToggle &&
                          selectedEquipment.deliveryAvailable && (
                            <div>Delivery: ${deliveryCost}</div>
                          )}
                        <div>
                          {days} day{days > 1 ? 's' : ''} rental
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Submit button */}
                <button
                  onClick={handleSubmit}
                  disabled={
                    !startDate || !endDate || days <= 0 || !minDaysValid
                  }
                  className={`w-full h-12 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                    startDate && endDate && days > 0 && minDaysValid
                      ? 'bg-[#2AA198] text-white hover:bg-[#1A7A72] active:scale-[0.97] shadow-lg shadow-teal-200/40'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <CheckCircle2 size={18} />
                  Confirm Booking
                </button>

                {/* Hints */}
                <div className="space-y-1.5">
                  <div className="flex items-start gap-2 text-[11px] text-gray-400">
                    <CheckCircle2
                      size={12}
                      className="text-green-400 mt-0.5 shrink-0"
                    />
                    Free cancellation up to 48 hours before start date
                  </div>
                  <div className="flex items-start gap-2 text-[11px] text-gray-400">
                    <CheckCircle2
                      size={12}
                      className="text-green-400 mt-0.5 shrink-0"
                    />
                    Equipment inspected and serviced before each rental
                  </div>
                  <div className="flex items-start gap-2 text-[11px] text-gray-400">
                    <CheckCircle2
                      size={12}
                      className="text-green-400 mt-0.5 shrink-0"
                    />
                    24/7 support line for breakdowns during rental period
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page Component (wrapped in Suspense for useSearchParams)
// ---------------------------------------------------------------------------

export default function EquipmentBookingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3 animate-pulse">
              <Wrench size={24} className="text-gray-400" />
            </div>
            <p className="text-sm text-gray-500">Loading booking...</p>
          </div>
        </div>
      }
    >
      <BookingContent />
    </Suspense>
  );
}
