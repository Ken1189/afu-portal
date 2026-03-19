'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Truck,
  Plus,
  Package,
  CheckCircle2,
  DollarSign,
  TrendingDown,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Snowflake,
  Star,
  Shield,
  Clock,
  MapPin,
  Box,
  CarFront,
} from 'lucide-react';
import { transportBookings as mockTransportBookings, carriers as mockCarriers } from '@/lib/data/logistics';
import type { TransportBooking, Carrier, TransportType, BookingStatus } from '@/lib/data/logistics';

const transportBookings = mockTransportBookings;
const carriers = mockCarriers;

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
// Helpers & Constants
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

const ALL_STATUSES: BookingStatus[] = [
  'requested',
  'confirmed',
  'in-transit',
  'delivered',
  'cancelled',
];

const TRANSPORT_TYPE_ICONS: Record<TransportType, React.ReactNode> = {
  refrigerated: <Snowflake className="w-5 h-5" />,
  'dry-bulk': <Package className="w-5 h-5" />,
  flatbed: <Truck className="w-5 h-5" />,
  container: <Box className="w-5 h-5" />,
  pickup: <CarFront className="w-5 h-5" />,
};

const TRANSPORT_TYPE_LABELS: Record<TransportType, string> = {
  refrigerated: 'Refrigerated',
  'dry-bulk': 'Dry Bulk',
  flatbed: 'Flatbed',
  container: 'Container',
  pickup: 'Pickup',
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

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.3;
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${
            i < full
              ? 'text-gold fill-gold'
              : i === full && hasHalf
                ? 'text-gold fill-gold/40'
                : 'text-gray-200'
          }`}
        />
      ))}
      <span className="text-xs font-semibold text-navy ml-1">{rating.toFixed(1)}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Booking Card
// ---------------------------------------------------------------------------

function BookingCard({ booking }: { booking: TransportBooking }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      variants={cardVariants}
      className="rounded-2xl bg-white border border-gray-100 overflow-hidden"
    >
      <div className="p-4">
        {/* Top row: ID + Status */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono text-gray-400">{booking.id}</span>
          <span
            className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border capitalize ${
              STATUS_STYLES[booking.status]
            }`}
          >
            {STATUS_LABELS[booking.status]}
          </span>
        </div>

        {/* Route */}
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="w-4 h-4 text-teal shrink-0" />
          <span className="text-sm font-semibold text-navy truncate">{booking.origin}</span>
          <ArrowRight className="w-4 h-4 text-gray-300 shrink-0" />
          <span className="text-sm font-semibold text-navy truncate">{booking.destination}</span>
        </div>

        {/* Cargo + Weight */}
        <p className="text-xs text-gray-500 mb-1">{booking.cargo}</p>
        <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
          <span className="flex items-center gap-1">
            <Package className="w-3.5 h-3.5" />
            {formatWeight(booking.weight)}
          </span>
          <span className="flex items-center gap-1">
            <Truck className="w-3.5 h-3.5" />
            {booking.carrierName}
          </span>
        </div>

        {/* Dates */}
        <div className="flex items-center gap-4 text-xs mb-2">
          <div>
            <span className="text-gray-400">Pickup: </span>
            <span className="font-medium text-navy">{formatDate(booking.pickupDate)}</span>
          </div>
          <div>
            <span className="text-gray-400">
              {booking.deliveryDate ? 'Delivered: ' : 'ETA: '}
            </span>
            <span className="font-medium text-navy">
              {booking.deliveryDate
                ? formatDate(booking.deliveryDate)
                : formatDate(booking.pickupDate)}
            </span>
          </div>
        </div>

        {/* Cost */}
        <div className="flex items-center gap-4 text-xs mb-2">
          <div>
            <span className="text-gray-400">
              {booking.actualCost ? 'Cost: ' : 'Est. Cost: '}
            </span>
            <span className="font-bold text-teal">
              {formatCurrency(booking.actualCost ?? booking.estimatedCost)}
            </span>
          </div>
        </div>

        {/* Cold chain badge */}
        {booking.temperature && (
          <div className="flex items-center gap-1.5 mt-2">
            <Snowflake className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-[11px] text-blue-600 font-medium">
              Cold Chain: {booking.temperature.min}°C — {booking.temperature.max}°C
            </span>
          </div>
        )}

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 mt-3 text-xs font-medium text-teal hover:text-teal/80 transition-colors"
        >
          {expanded ? 'Hide Timeline' : 'View Timeline'}
          {expanded ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* Timeline */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1 border-t border-gray-50">
              <div className="relative pl-6">
                {/* Vertical line */}
                <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-gray-100" />
                {booking.timeline.map((step, idx) => {
                  const isLast = idx === booking.timeline.length - 1;
                  return (
                    <div key={idx} className="relative pb-3 last:pb-0">
                      {/* Dot */}
                      <div
                        className={`absolute left-[-17px] top-1.5 w-3 h-3 rounded-full border-2 ${
                          isLast && booking.status !== 'delivered' && booking.status !== 'cancelled'
                            ? 'border-teal bg-teal/20'
                            : 'border-green-400 bg-green-50'
                        }`}
                      />
                      <p className="text-[11px] text-gray-400">{step.date}</p>
                      <p className="text-xs font-medium text-navy">{step.event}</p>
                      <p className="text-[11px] text-gray-400">{step.location}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Book Transport Form
// ---------------------------------------------------------------------------

function BookTransportTab() {
  const [selectedType, setSelectedType] = useState<TransportType | null>(null);
  const [pickupLocation, setPickupLocation] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [cargoDesc, setCargoDesc] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [coldChain, setColdChain] = useState(false);
  const [tempMin, setTempMin] = useState('');
  const [tempMax, setTempMax] = useState('');
  const [notes, setNotes] = useState('');
  const [showQuotes, setShowQuotes] = useState(false);

  const transportTypes: TransportType[] = [
    'refrigerated',
    'dry-bulk',
    'flatbed',
    'container',
    'pickup',
  ];

  const mockQuotes = [
    {
      carrier: 'Safari Logistics Ltd',
      rating: 4.4,
      price: 680,
      eta: '2-3 days',
      coldChain: true,
      insurance: true,
    },
    {
      carrier: 'Kalahari Cold Chain Express',
      rating: 4.6,
      price: 750,
      eta: '1-2 days',
      coldChain: true,
      insurance: true,
    },
    {
      carrier: 'Uhuru Haulage Co.',
      rating: 4.3,
      price: 520,
      eta: '3-4 days',
      coldChain: false,
      insurance: true,
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {!showQuotes ? (
        <>
          {/* Transport Type Selector */}
          <motion.div variants={cardVariants}>
            <label className="text-xs font-semibold text-navy block mb-2">Transport Type</label>
            <div className="grid grid-cols-3 lg:grid-cols-5 gap-2">
              {transportTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                    selectedType === type
                      ? 'border-teal bg-teal/5 text-teal'
                      : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'
                  }`}
                >
                  {TRANSPORT_TYPE_ICONS[type]}
                  <span className="text-[11px] font-medium">{TRANSPORT_TYPE_LABELS[type]}</span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Pickup Location */}
          <motion.div variants={cardVariants}>
            <label className="text-xs font-semibold text-navy block mb-1.5">Pickup Location</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
              <input
                type="text"
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                placeholder="e.g. Maun, Botswana"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm text-navy placeholder:text-gray-300 focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal/20"
              />
            </div>
          </motion.div>

          {/* Delivery Location */}
          <motion.div variants={cardVariants}>
            <label className="text-xs font-semibold text-navy block mb-1.5">
              Delivery Location
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
              <input
                type="text"
                value={deliveryLocation}
                onChange={(e) => setDeliveryLocation(e.target.value)}
                placeholder="e.g. Gaborone, Botswana"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm text-navy placeholder:text-gray-300 focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal/20"
              />
            </div>
          </motion.div>

          {/* Cargo Description */}
          <motion.div variants={cardVariants}>
            <label className="text-xs font-semibold text-navy block mb-1.5">
              Cargo Description
            </label>
            <textarea
              value={cargoDesc}
              onChange={(e) => setCargoDesc(e.target.value)}
              placeholder="Describe your cargo (e.g. Fresh blueberries, 125g punnets in export cartons)"
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-navy placeholder:text-gray-300 focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal/20 resize-none"
            />
          </motion.div>

          {/* Weight */}
          <motion.div variants={cardVariants}>
            <label className="text-xs font-semibold text-navy block mb-1.5">Weight (kg)</label>
            <input
              type="number"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              placeholder="e.g. 5000"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-navy placeholder:text-gray-300 focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal/20"
            />
          </motion.div>

          {/* Preferred Pickup Date */}
          <motion.div variants={cardVariants}>
            <label className="text-xs font-semibold text-navy block mb-1.5">
              Preferred Pickup Date
            </label>
            <input
              type="date"
              value={pickupDate}
              onChange={(e) => setPickupDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-navy focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal/20"
            />
          </motion.div>

          {/* Temperature Requirements */}
          <motion.div variants={cardVariants}>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-navy">Temperature Requirements</label>
              <button
                onClick={() => setColdChain(!coldChain)}
                className={`relative w-10 h-5.5 rounded-full transition-colors ${
                  coldChain ? 'bg-teal' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 bg-white rounded-full shadow transition-transform ${
                    coldChain ? 'translate-x-[18px]' : ''
                  }`}
                  style={{ width: 18, height: 18 }}
                />
              </button>
            </div>
            <AnimatePresence>
              {coldChain && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="flex gap-3 mt-2">
                    <div className="flex-1">
                      <label className="text-[11px] text-gray-400 block mb-1">Min Temp (°C)</label>
                      <input
                        type="number"
                        value={tempMin}
                        onChange={(e) => setTempMin(e.target.value)}
                        placeholder="0"
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm text-navy placeholder:text-gray-300 focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal/20"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-[11px] text-gray-400 block mb-1">Max Temp (°C)</label>
                      <input
                        type="number"
                        value={tempMax}
                        onChange={(e) => setTempMax(e.target.value)}
                        placeholder="4"
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm text-navy placeholder:text-gray-300 focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal/20"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Notes */}
          <motion.div variants={cardVariants}>
            <label className="text-xs font-semibold text-navy block mb-1.5">
              Additional Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special requirements or instructions..."
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-navy placeholder:text-gray-300 focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal/20 resize-none"
            />
          </motion.div>

          {/* Get Quotes Button */}
          <motion.div variants={cardVariants}>
            <button
              onClick={() => setShowQuotes(true)}
              className="w-full py-3 rounded-xl bg-teal text-white font-semibold text-sm hover:bg-teal/90 active:scale-[0.98] transition-all shadow-sm"
            >
              Get Quotes
            </button>
          </motion.div>
        </>
      ) : (
        /* Carrier Quotes */
        <>
          <motion.div variants={cardVariants}>
            <button
              onClick={() => setShowQuotes(false)}
              className="text-xs font-medium text-teal hover:text-teal/80 transition-colors mb-2 flex items-center gap-1"
            >
              <ChevronDown className="w-3.5 h-3.5 rotate-90" />
              Back to form
            </button>
            <h3 className="text-sm font-bold text-navy mb-1">Available Carrier Quotes</h3>
            <p className="text-xs text-gray-400 mb-4">
              Select a carrier to book your transport
            </p>
          </motion.div>

          {mockQuotes.map((quote, idx) => (
            <motion.div
              key={idx}
              variants={cardVariants}
              className="rounded-2xl bg-white border border-gray-100 p-4"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="text-sm font-bold text-navy">{quote.carrier}</h4>
                  <StarRating rating={quote.rating} />
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-teal">{formatCurrency(quote.price)}</p>
                  <p className="text-[11px] text-gray-400">estimated</p>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-3 mb-3">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="w-3.5 h-3.5" />
                  <span>ETA: {quote.eta}</span>
                </div>
                {quote.coldChain && (
                  <span className="flex items-center gap-1 text-[11px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                    <Snowflake className="w-3 h-3" />
                    Cold Chain
                  </span>
                )}
                {quote.insurance && (
                  <span className="flex items-center gap-1 text-[11px] font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                    <Shield className="w-3 h-3" />
                    Insured
                  </span>
                )}
              </div>

              <button className="w-full py-2.5 rounded-xl bg-navy text-white font-semibold text-sm hover:bg-navy/90 active:scale-[0.98] transition-all">
                Book Now
              </button>
            </motion.div>
          ))}
        </>
      )}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Carriers Tab
// ---------------------------------------------------------------------------

function CarriersTab() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-3"
    >
      {carriers.map((carrier) => (
        <motion.div
          key={carrier.id}
          variants={cardVariants}
          className="rounded-2xl bg-white border border-gray-100 p-4"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div>
              <h4 className="text-sm font-bold text-navy">{carrier.name}</h4>
              <p className="text-xs text-gray-400">{carrier.country}</p>
            </div>
            <span className="text-xs font-mono text-gray-300">{carrier.id}</span>
          </div>

          {/* Rating */}
          <div className="mb-3">
            <StarRating rating={carrier.rating} />
          </div>

          {/* Vehicle Types */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {carrier.type.map((vType) => (
              <span
                key={vType}
                className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-50 text-gray-600 border border-gray-100"
              >
                {TRANSPORT_TYPE_LABELS[vType]}
              </span>
            ))}
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
            <div>
              <span className="text-gray-400">Price: </span>
              <span className="font-semibold text-navy">
                ${carrier.pricePerKm.toFixed(2)}/km/t
              </span>
            </div>
            <div>
              <span className="text-gray-400">Vehicles: </span>
              <span className="font-semibold text-navy">{carrier.vehicleCount}</span>
            </div>
          </div>

          {/* Badges */}
          <div className="flex items-center gap-2 mb-3">
            {carrier.coldChain && (
              <span className="flex items-center gap-1 text-[11px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                <Snowflake className="w-3 h-3" />
                Cold Chain
              </span>
            )}
            {carrier.insurance && (
              <span className="flex items-center gap-1 text-[11px] font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                <Shield className="w-3 h-3" />
                Insurance
              </span>
            )}
          </div>

          {/* Request Quote button */}
          <button className="w-full py-2.5 rounded-xl bg-teal/10 text-teal font-semibold text-sm hover:bg-teal/20 active:scale-[0.98] transition-all">
            Request Quote
          </button>
        </motion.div>
      ))}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

type TabId = 'bookings' | 'book' | 'carriers';

export default function LogisticsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('bookings');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');

  // ---------- Computed stats ----------
  const stats = useMemo(() => {
    const active = transportBookings.filter(
      (b) => b.status === 'confirmed' || b.status === 'in-transit' || b.status === 'requested'
    );
    const deliveredThisMonth = transportBookings.filter((b) => {
      if (b.status !== 'delivered' || !b.deliveryDate) return false;
      const d = new Date(b.deliveryDate);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const totalSpent = transportBookings
      .filter((b) => b.actualCost !== null)
      .reduce((sum, b) => sum + (b.actualCost ?? 0), 0);
    const totalDeliveredWeight = transportBookings
      .filter((b) => b.status === 'delivered')
      .reduce((sum, b) => sum + b.weight, 0);
    const avgCostPerTonne =
      totalDeliveredWeight > 0
        ? totalSpent / (totalDeliveredWeight / 1000)
        : 0;

    return {
      activeCount: active.length,
      deliveredThisMonth: deliveredThisMonth.length,
      totalSpent,
      avgCostPerTonne,
    };
  }, []);

  // ---------- Filtered bookings ----------
  const filteredBookings = useMemo(() => {
    if (statusFilter === 'all') return transportBookings;
    return transportBookings.filter((b) => b.status === statusFilter);
  }, [statusFilter]);

  // ---------- Tab definitions ----------
  const tabs: { id: TabId; label: string }[] = [
    { id: 'bookings', label: 'My Bookings' },
    { id: 'book', label: 'Book Transport' },
    { id: 'carriers', label: 'Carriers' },
  ];

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
        <div className="rounded-2xl bg-gradient-to-br from-navy to-navy/80 p-5 text-white relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full" />
          <div className="absolute -bottom-8 -right-6 w-24 h-24 bg-white/5 rounded-full" />
          <div className="absolute top-4 right-4 opacity-15">
            <Truck size={64} strokeWidth={1} />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <Truck size={20} className="text-white/90" />
              <span className="text-xs font-semibold text-white/60 uppercase tracking-wide">
                Mkulima Hub
              </span>
            </div>
            <h2 className="text-xl font-bold leading-tight">Transport & Logistics</h2>
            <p className="text-sm text-white/70 mt-1">
              Book transport for your harvest and inputs
            </p>

            <button
              onClick={() => setActiveTab('book')}
              className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 active:bg-white/30 text-sm font-medium transition-colors min-h-[44px]"
            >
              <Plus size={16} />
              New Booking
            </button>
          </div>
        </div>
      </motion.section>

      {/* ================================================================= */}
      {/* STATS ROW                                                         */}
      {/* ================================================================= */}
      <motion.section variants={cardVariants} className="px-4 lg:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* Active Bookings */}
          <motion.div
            variants={cardVariants}
            className="rounded-2xl bg-white border border-gray-100 p-3"
          >
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg bg-teal/10 flex items-center justify-center">
                <Truck size={14} className="text-teal" />
              </div>
              <span className="text-[11px] text-gray-400 truncate">Active Bookings</span>
            </div>
            <p className="text-2xl font-bold text-teal">{stats.activeCount}</p>
          </motion.div>

          {/* Delivered This Month */}
          <motion.div
            variants={cardVariants}
            className="rounded-2xl bg-white border border-gray-100 p-3"
          >
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center">
                <CheckCircle2 size={14} className="text-green-600" />
              </div>
              <span className="text-[11px] text-gray-400 truncate">Delivered (Month)</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{stats.deliveredThisMonth}</p>
          </motion.div>

          {/* Total Spent */}
          <motion.div
            variants={cardVariants}
            className="rounded-2xl bg-white border border-gray-100 p-3"
          >
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
                <DollarSign size={14} className="text-gold" />
              </div>
              <span className="text-[11px] text-gray-400 truncate">Total Spent</span>
            </div>
            <p className="text-2xl font-bold text-gold">{formatCurrency(stats.totalSpent)}</p>
          </motion.div>

          {/* Avg Cost / Tonne */}
          <motion.div
            variants={cardVariants}
            className="rounded-2xl bg-white border border-gray-100 p-3"
          >
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center">
                <TrendingDown size={14} className="text-purple-600" />
              </div>
              <span className="text-[11px] text-gray-400 truncate">Avg Cost/Tonne</span>
            </div>
            <p className="text-2xl font-bold text-purple-600">
              {formatCurrency(Math.round(stats.avgCostPerTonne))}
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* ================================================================= */}
      {/* TAB SWITCHER                                                      */}
      {/* ================================================================= */}
      <motion.section variants={cardVariants} className="px-4 lg:px-6">
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-navy shadow-sm'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </motion.section>

      {/* ================================================================= */}
      {/* TAB CONTENT                                                       */}
      {/* ================================================================= */}
      <section className="px-4 lg:px-6">
        <AnimatePresence mode="wait">
          {activeTab === 'bookings' && (
            <motion.div
              key="bookings"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Status filter pills */}
              <div className="flex items-center gap-1.5 mb-4 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`shrink-0 text-[11px] font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                    statusFilter === 'all'
                      ? 'bg-navy text-white border-navy'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  All ({transportBookings.length})
                </button>
                {ALL_STATUSES.map((status) => {
                  const count = transportBookings.filter((b) => b.status === status).length;
                  return (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`shrink-0 text-[11px] font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                        statusFilter === status
                          ? 'bg-navy text-white border-navy'
                          : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {STATUS_LABELS[status]} ({count})
                    </button>
                  );
                })}
              </div>

              {/* Bookings list */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-3"
              >
                {filteredBookings.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                    <p className="text-sm text-gray-400">No bookings found</p>
                  </div>
                ) : (
                  filteredBookings.map((booking) => (
                    <BookingCard key={booking.id} booking={booking} />
                  ))
                )}
              </motion.div>
            </motion.div>
          )}

          {activeTab === 'book' && (
            <motion.div
              key="book"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
            >
              <BookTransportTab />
            </motion.div>
          )}

          {activeTab === 'carriers' && (
            <motion.div
              key="carriers"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
            >
              <CarriersTab />
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </motion.div>
  );
}
