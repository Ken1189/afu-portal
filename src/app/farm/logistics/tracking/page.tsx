'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Search,
  Truck,
  Star,
  Clock,
  CheckCircle2,
  Package,
  Phone,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Thermometer,
  ArrowRight,
} from 'lucide-react';
import { transportBookings as mockTransportBookings } from '@/lib/data/logistics';
import type { TransportBooking, BookingStatus } from '@/lib/data/logistics';

const transportBookings = mockTransportBookings;

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
// Helpers
// ---------------------------------------------------------------------------

const STATUS_STYLES: Record<BookingStatus, string> = {
  requested: 'bg-amber-50 text-amber-700 border-amber-200',
  confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
  'in-transit': 'bg-purple-50 text-purple-700 border-purple-200',
  delivered: 'bg-green-50 text-green-700 border-green-200',
  cancelled: 'bg-red-50 text-red-600 border-red-200',
};

const STATUS_LABELS: Record<BookingStatus, string> = {
  requested: 'Requested',
  confirmed: 'Confirmed',
  'in-transit': 'In Transit',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString()}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatWeight(kg: number): string {
  if (kg >= 1000) return `${(kg / 1000).toFixed(1)}t`;
  return `${kg}kg`;
}

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.3;
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-3 h-3 ${
            i < full
              ? 'text-gold fill-gold'
              : i === full && hasHalf
                ? 'text-gold fill-gold/40'
                : 'text-gray-200'
          }`}
        />
      ))}
      <span className="text-[11px] font-semibold text-navy ml-0.5">{rating.toFixed(1)}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Temperature Monitor Component
// ---------------------------------------------------------------------------

function TemperatureMonitor({
  current,
  min,
  max,
}: {
  current: number;
  min: number;
  max: number;
}) {
  const range = max - min;
  const withinRange = current >= min && current <= max;
  // Position as percentage within a visual range (min - 2 to max + 2)
  const visualMin = min - 2;
  const visualMax = max + 2;
  const visualRange = visualMax - visualMin;
  const position = Math.max(0, Math.min(100, ((current - visualMin) / visualRange) * 100));
  // Safe zone position
  const safeStart = ((min - visualMin) / visualRange) * 100;
  const safeEnd = ((max - visualMin) / visualRange) * 100;

  return (
    <div className="rounded-xl bg-gray-50 border border-gray-100 p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Thermometer className="w-4 h-4 text-blue-500" />
          <span className="text-xs font-semibold text-navy">Temperature Monitor</span>
        </div>
        <span
          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
            withinRange
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-orange-50 text-orange-700 border border-orange-200'
          }`}
        >
          {withinRange ? 'Within Range' : 'Warning'}
        </span>
      </div>

      {/* Temperature display */}
      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-2xl font-bold text-navy">{current.toFixed(1)}°C</span>
        <span className="text-xs text-gray-400">
          Required: {min}°C — {max}°C
        </span>
      </div>

      {/* Temperature bar */}
      <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
        {/* Safe zone */}
        <div
          className="absolute top-0 bottom-0 bg-green-100 border-x border-green-300"
          style={{ left: `${safeStart}%`, width: `${safeEnd - safeStart}%` }}
        />
        {/* Current position indicator */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-2 border-white shadow-md ${
            withinRange ? 'bg-green-500' : 'bg-orange-500'
          }`}
          style={{ left: `${position}%`, marginLeft: -7 }}
        />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[10px] text-gray-400">{visualMin}°C</span>
        <span className="text-[10px] text-gray-400">{visualMax}°C</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shipment Timeline Component
// ---------------------------------------------------------------------------

function ShipmentTimeline({
  timeline,
  status,
}: {
  timeline: TransportBooking['timeline'];
  status: BookingStatus;
}) {
  return (
    <div className="rounded-xl bg-gray-50 border border-gray-100 p-3">
      <h4 className="text-xs font-semibold text-navy mb-3 flex items-center gap-1.5">
        <Clock className="w-3.5 h-3.5 text-teal" />
        Shipment Timeline
      </h4>

      <div className="relative pl-6">
        {/* Vertical line */}
        <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-gray-200" />

        {timeline.map((step, idx) => {
          const isLast = idx === timeline.length - 1;
          // Determine if this is a completed, current, or future step
          // The last event in the timeline that has occurred = current step for active shipments
          // For delivered shipments, everything is completed
          const allCompleted = status === 'delivered' || status === 'cancelled';
          const isCurrent = !allCompleted && isLast;
          const isCompleted = allCompleted || !isLast;

          return (
            <div key={idx} className="relative pb-4 last:pb-0">
              {/* Dot */}
              {isCurrent ? (
                /* Pulsing teal dot for current event */
                <div className="absolute left-[-17px] top-1.5">
                  <div className="w-3 h-3 rounded-full bg-teal relative">
                    <span className="absolute inset-0 rounded-full bg-teal animate-ping opacity-40" />
                  </div>
                </div>
              ) : isCompleted ? (
                /* Green checkmark dot for past events */
                <div className="absolute left-[-17px] top-1.5 w-3 h-3 rounded-full bg-green-500 flex items-center justify-center">
                  <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                </div>
              ) : (
                /* Gray dot for future events */
                <div className="absolute left-[-17px] top-1.5 w-3 h-3 rounded-full bg-gray-300 border-2 border-gray-200" />
              )}

              {/* Content */}
              <div>
                <p className="text-[11px] text-gray-400">{step.date}</p>
                <p
                  className={`text-xs font-medium ${
                    isCurrent ? 'text-teal' : isCompleted ? 'text-navy' : 'text-gray-400'
                  }`}
                >
                  {step.event}
                </p>
                <p className="text-[11px] text-gray-400 flex items-center gap-0.5">
                  <MapPin className="w-2.5 h-2.5" />
                  {step.location}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Active Shipment Card
// ---------------------------------------------------------------------------

function ActiveShipmentCard({ booking }: { booking: TransportBooking }) {
  const [expanded, setExpanded] = useState(true);

  // Find the carrier from the data to get rating
  const carrierRating = useMemo(() => {
    // Simple lookup from the carrier data based on carrierName
    const ratingMap: Record<string, number> = {
      'Safari Logistics Ltd': 4.4,
      'Great Zimbabwe Transport': 4.1,
      'Kasane Border Agri-Trade': 3.2,
      'Kalahari Cold Chain Express': 4.6,
      'Uhuru Haulage Co.': 4.3,
      'Limpopo Valley Movers': 4.5,
    };
    return ratingMap[booking.carrierName] ?? 4.0;
  }, [booking.carrierName]);

  // Mock current temperature for cold chain shipments
  const mockCurrentTemp = useMemo(() => {
    if (!booking.temperature) return null;
    // Generate a realistic temp within or near range
    const { min, max } = booking.temperature;
    const mid = (min + max) / 2;
    return parseFloat((mid + (Math.random() - 0.3) * (max - min) * 0.6).toFixed(1));
  }, [booking.temperature]);

  return (
    <motion.div
      variants={cardVariants}
      className="rounded-2xl bg-white border border-gray-100 overflow-hidden"
    >
      {/* Card Header */}
      <div className="p-4">
        {/* Top: ID + Status + Toggle */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold bg-navy/5 text-navy px-2 py-0.5 rounded-md">
              {booking.id}
            </span>
            <span
              className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border capitalize ${
                STATUS_STYLES[booking.status]
              }`}
            >
              {STATUS_LABELS[booking.status]}
            </span>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            {expanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Route with truck icon */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-teal shrink-0" />
              <span className="text-sm font-semibold text-navy truncate">{booking.origin}</span>
            </div>
          </div>
          <div className="shrink-0 flex items-center gap-1 text-gray-300">
            <div className="w-8 h-[1px] bg-gray-200" />
            <Truck className="w-4 h-4 text-teal" />
            <div className="w-8 h-[1px] bg-gray-200" />
          </div>
          <div className="flex-1 min-w-0 text-right">
            <div className="flex items-center justify-end gap-2">
              <span className="text-sm font-semibold text-navy truncate">
                {booking.destination}
              </span>
              <MapPin className="w-4 h-4 text-red-400 shrink-0" />
            </div>
          </div>
        </div>

        {/* Cargo + Weight */}
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
          <Package className="w-3.5 h-3.5 text-gray-400" />
          <span className="truncate">{booking.cargo}</span>
          <span className="shrink-0 font-medium text-navy">{formatWeight(booking.weight)}</span>
        </div>

        {/* Carrier */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Truck className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-xs font-medium text-navy">{booking.carrierName}</span>
          </div>
          <StarRating rating={carrierRating} />
        </div>

        {/* Dates */}
        <div className="flex items-center gap-4 text-xs">
          <div>
            <span className="text-gray-400">Pickup: </span>
            <span className="font-medium text-navy">{formatDate(booking.pickupDate)}</span>
          </div>
          <ArrowRight className="w-3 h-3 text-gray-300" />
          <div>
            <span className="text-gray-400">ETA: </span>
            <span className="font-medium text-navy">
              {formatDate(booking.deliveryDate ?? booking.pickupDate)}
            </span>
          </div>
        </div>

        {/* Cost */}
        <div className="mt-2 text-xs">
          <span className="text-gray-400">
            {booking.actualCost ? 'Cost: ' : 'Est. Cost: '}
          </span>
          <span className="font-bold text-teal">
            {formatCurrency(booking.actualCost ?? booking.estimatedCost)}
          </span>
        </div>
      </div>

      {/* Expanded details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3 border-t border-gray-50 pt-3">
              {/* Temperature Monitor (for cold chain) */}
              {booking.temperature && mockCurrentTemp !== null && (
                <TemperatureMonitor
                  current={mockCurrentTemp}
                  min={booking.temperature.min}
                  max={booking.temperature.max}
                />
              )}

              {/* Timeline */}
              <ShipmentTimeline timeline={booking.timeline} status={booking.status} />

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-teal/10 text-teal font-semibold text-xs hover:bg-teal/20 active:scale-[0.98] transition-all">
                  <Phone className="w-3.5 h-3.5" />
                  Contact Carrier
                </button>
                <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-red-50 text-red-600 font-semibold text-xs hover:bg-red-100 active:scale-[0.98] transition-all">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Report Issue
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Delivered Shipment Card (Compact)
// ---------------------------------------------------------------------------

function DeliveredCard({ booking }: { booking: TransportBooking }) {
  return (
    <motion.div
      variants={cardVariants}
      className="rounded-xl bg-white border border-gray-100 p-3"
    >
      <div className="flex items-start justify-between mb-1.5">
        <span className="text-xs font-mono text-gray-400">{booking.id}</span>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">
          Delivered
        </span>
      </div>

      <div className="flex items-center gap-1.5 mb-1 text-xs">
        <MapPin className="w-3 h-3 text-teal" />
        <span className="font-medium text-navy truncate">{booking.origin}</span>
        <ArrowRight className="w-3 h-3 text-gray-300 shrink-0" />
        <span className="font-medium text-navy truncate">{booking.destination}</span>
      </div>

      <p className="text-[11px] text-gray-400 truncate mb-1">{booking.cargo}</p>

      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-400">
          {booking.deliveryDate && formatDate(booking.deliveryDate)}
        </span>
        <span className="font-semibold text-teal">
          {formatCurrency(booking.actualCost ?? booking.estimatedCost)}
        </span>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function TrackingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showDelivered, setShowDelivered] = useState(false);

  // Active shipments: confirmed or in-transit
  const activeShipments = useMemo(() => {
    const active = transportBookings.filter(
      (b) => b.status === 'confirmed' || b.status === 'in-transit'
    );
    if (!searchQuery.trim()) return active;
    const q = searchQuery.toLowerCase();
    return active.filter(
      (b) =>
        b.id.toLowerCase().includes(q) ||
        b.origin.toLowerCase().includes(q) ||
        b.destination.toLowerCase().includes(q) ||
        b.cargo.toLowerCase().includes(q) ||
        b.carrierName.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Recently delivered (last 30 days)
  const recentlyDelivered = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return transportBookings.filter((b) => {
      if (b.status !== 'delivered' || !b.deliveryDate) return false;
      return new Date(b.deliveryDate) >= thirtyDaysAgo;
    });
  }, []);

  // Search across all bookings if searching
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase();
    return transportBookings.filter(
      (b) =>
        b.id.toLowerCase().includes(q) ||
        b.origin.toLowerCase().includes(q) ||
        b.destination.toLowerCase().includes(q) ||
        b.cargo.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-5 py-4"
    >
      {/* ================================================================= */}
      {/* HEADER                                                            */}
      {/* ================================================================= */}
      <motion.section variants={cardVariants} className="px-4 lg:px-6">
        <div className="rounded-2xl bg-gradient-to-br from-teal to-teal/80 p-5 text-white relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full" />
          <div className="absolute -bottom-8 -right-6 w-24 h-24 bg-white/5 rounded-full" />
          <div className="absolute top-4 right-4 opacity-15">
            <MapPin size={64} strokeWidth={1} />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <MapPin size={20} className="text-white/90" />
              <span className="text-xs font-semibold text-white/60 uppercase tracking-wide">
                Mkulima Hub
              </span>
            </div>
            <h2 className="text-xl font-bold leading-tight">Shipment Tracking</h2>
            <p className="text-sm text-white/70 mt-1">
              Track your active transport bookings
            </p>
          </div>
        </div>
      </motion.section>

      {/* ================================================================= */}
      {/* QUICK SEARCH                                                      */}
      {/* ================================================================= */}
      <motion.section variants={cardVariants} className="px-4 lg:px-6">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by booking ID, location, or cargo..."
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-gray-200 text-sm text-navy placeholder:text-gray-300 focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/10 shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
            >
              <span className="text-xs font-medium">Clear</span>
            </button>
          )}
        </div>
      </motion.section>

      {/* ================================================================= */}
      {/* ACTIVE SHIPMENTS                                                  */}
      {/* ================================================================= */}
      <motion.section variants={cardVariants} className="px-4 lg:px-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-navy flex items-center gap-2">
            <div className="w-2 h-2 bg-teal rounded-full animate-pulse" />
            Active Shipments
            <span className="text-xs font-normal text-gray-400">
              ({activeShipments.length})
            </span>
          </h3>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-3"
        >
          {activeShipments.length === 0 ? (
            <div className="text-center py-12 rounded-2xl bg-white border border-gray-100">
              <Truck className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-400">
                {searchQuery ? 'No active shipments match your search' : 'No active shipments'}
              </p>
              <p className="text-xs text-gray-300 mt-1">
                {searchQuery
                  ? 'Try a different search term'
                  : 'Book a new transport to get started'}
              </p>
            </div>
          ) : (
            activeShipments.map((booking) => (
              <ActiveShipmentCard key={booking.id} booking={booking} />
            ))
          )}
        </motion.div>
      </motion.section>

      {/* ================================================================= */}
      {/* RECENTLY DELIVERED                                                */}
      {/* ================================================================= */}
      {recentlyDelivered.length > 0 && (
        <motion.section variants={cardVariants} className="px-4 lg:px-6 pb-4">
          <button
            onClick={() => setShowDelivered(!showDelivered)}
            className="flex items-center justify-between w-full mb-3"
          >
            <h3 className="text-sm font-bold text-navy flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Recently Delivered
              <span className="text-xs font-normal text-gray-400">
                ({recentlyDelivered.length})
              </span>
            </h3>
            <div className="flex items-center gap-1 text-xs font-medium text-gray-400">
              <span>{showDelivered ? 'Hide' : 'Show'}</span>
              {showDelivered ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </div>
          </button>

          <AnimatePresence>
            {showDelivered && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-2"
                >
                  {recentlyDelivered.map((booking) => (
                    <DeliveredCard key={booking.id} booking={booking} />
                  ))}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>
      )}
    </motion.div>
  );
}
