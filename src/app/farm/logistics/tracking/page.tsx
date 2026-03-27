'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/supabase/auth-context';
import { createClient } from '@/lib/supabase/client';
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
// ---------------------------------------------------------------------------
// Types (inlined from @/lib/data/logistics)
// ---------------------------------------------------------------------------

type TransportType = 'refrigerated' | 'dry-bulk' | 'flatbed' | 'container' | 'pickup';
type BookingStatus = 'requested' | 'confirmed' | 'in-transit' | 'delivered' | 'cancelled';

interface TransportBooking {
  id: string;
  farmerId: string;
  farmerName: string;
  type: TransportType;
  carrierId: string;
  carrierName: string;
  origin: string;
  destination: string;
  cargo: string;
  weight: number;
  status: BookingStatus;
  requestDate: string;
  pickupDate: string;
  deliveryDate: string | null;
  estimatedCost: number;
  actualCost: number | null;
  currency: string;
  temperature?: { min: number; max: number };
  notes: string;
  timeline: { date: string; event: string; location: string }[];
}

// ---------------------------------------------------------------------------
// Inline fallback data (from @/lib/data/logistics)
// ---------------------------------------------------------------------------

const transportBookings: TransportBooking[] = [
  {
    id: 'TRN-001',
    farmerId: 'AFU-2024-001',
    farmerName: 'Kgosi Mosweu',
    type: 'dry-bulk',
    carrierId: 'CAR-003',
    carrierName: 'Kasane Border Agri-Trade',
    origin: 'Maun, Botswana',
    destination: 'Francistown, Botswana',
    cargo: 'Dried maize grain, 50kg bags',
    weight: 8500,
    status: 'delivered',
    requestDate: '2026-01-20',
    pickupDate: '2026-01-24',
    deliveryDate: '2026-01-25',
    estimatedCost: 420,
    actualCost: 435,
    currency: 'USD',
    notes: 'Successful delivery. Slight delay at Nata weighbridge checkpoint.',
    timeline: [
      { date: '2026-01-20', event: 'Booking requested', location: 'Maun, Botswana' },
      { date: '2026-01-21', event: 'Booking confirmed by carrier', location: 'Maun, Botswana' },
      { date: '2026-01-24', event: 'Cargo loaded and departed', location: 'Maun, Botswana' },
      { date: '2026-01-24', event: 'Checkpoint clearance at Nata', location: 'Nata, Botswana' },
      { date: '2026-01-25', event: 'Arrived at destination warehouse', location: 'Francistown, Botswana' },
      { date: '2026-01-25', event: 'Cargo offloaded and signed for', location: 'Francistown, Botswana' },
    ],
  },
  {
    id: 'TRN-002',
    farmerId: 'AFU-2024-003',
    farmerName: 'Tendai Moyo',
    type: 'refrigerated',
    carrierId: 'CAR-006',
    carrierName: 'Limpopo Valley Movers',
    origin: 'Marondera, Zimbabwe',
    destination: 'Harare, Zimbabwe',
    cargo: 'Fresh blueberries, export-grade punnets',
    weight: 3200,
    status: 'delivered',
    requestDate: '2026-02-05',
    pickupDate: '2026-02-07',
    deliveryDate: '2026-02-07',
    estimatedCost: 310,
    actualCost: 295,
    currency: 'USD',
    temperature: { min: 1, max: 4 },
    notes: 'Cold chain maintained throughout. Delivered to Harare International Airport cold store for onward export.',
    timeline: [
      { date: '2026-02-05', event: 'Booking requested', location: 'Marondera, Zimbabwe' },
      { date: '2026-02-06', event: 'Booking confirmed, vehicle dispatched', location: 'Harare, Zimbabwe' },
      { date: '2026-02-07', event: 'Cargo loaded at farm packhouse', location: 'Marondera, Zimbabwe' },
      { date: '2026-02-07', event: 'Temperature check: 2.3C', location: 'En route' },
      { date: '2026-02-07', event: 'Delivered to airport cold store', location: 'Harare, Zimbabwe' },
      { date: '2026-02-07', event: 'Cargo signed for, cold chain verified', location: 'Harare, Zimbabwe' },
    ],
  },
  {
    id: 'TRN-003',
    farmerId: 'AFU-2024-041',
    farmerName: 'Grace Kilango',
    type: 'dry-bulk',
    carrierId: 'CAR-005',
    carrierName: 'Uhuru Haulage Co.',
    origin: 'Iringa, Tanzania',
    destination: 'Dar es Salaam, Tanzania',
    cargo: 'Sesame seeds, cleaned and sorted, bulk bags',
    weight: 22000,
    status: 'delivered',
    requestDate: '2026-01-08',
    pickupDate: '2026-01-12',
    deliveryDate: '2026-01-14',
    estimatedCost: 1180,
    actualCost: 1200,
    currency: 'USD',
    notes: 'Two-truck convoy for large consignment. Minor tyre repair near Morogoro caused 3-hour delay.',
    timeline: [
      { date: '2026-01-08', event: 'Booking requested for 22-tonne load', location: 'Iringa, Tanzania' },
      { date: '2026-01-09', event: 'Booking confirmed, two trucks allocated', location: 'Iringa, Tanzania' },
      { date: '2026-01-12', event: 'Loading completed at Kilango warehouse', location: 'Iringa, Tanzania' },
      { date: '2026-01-12', event: 'Departed Iringa', location: 'Iringa, Tanzania' },
      { date: '2026-01-13', event: 'Overnight stop at Morogoro depot', location: 'Morogoro, Tanzania' },
      { date: '2026-01-13', event: 'Tyre repaired on Truck 2', location: 'Morogoro, Tanzania' },
      { date: '2026-01-14', event: 'Arrived at Dar port warehouse', location: 'Dar es Salaam, Tanzania' },
      { date: '2026-01-14', event: 'Cargo weighed and verified: 21,940kg', location: 'Dar es Salaam, Tanzania' },
    ],
  },
  {
    id: 'TRN-004',
    farmerId: 'AFU-2024-037',
    farmerName: 'Rudo Chidyamakono',
    type: 'container',
    carrierId: 'CAR-002',
    carrierName: 'Great Zimbabwe Transport',
    origin: 'Marondera, Zimbabwe',
    destination: 'Beira, Mozambique',
    cargo: 'Tobacco bales, flue-cured Virginia grade A',
    weight: 18000,
    status: 'delivered',
    requestDate: '2025-12-15',
    pickupDate: '2025-12-20',
    deliveryDate: '2025-12-23',
    estimatedCost: 2800,
    actualCost: 2750,
    currency: 'USD',
    notes: 'Cross-border shipment. Customs documentation pre-arranged. Border crossing at Machipanda took 4 hours.',
    timeline: [
      { date: '2025-12-15', event: 'Booking requested for export consignment', location: 'Marondera, Zimbabwe' },
      { date: '2025-12-17', event: 'Booking confirmed, container allocated', location: 'Harare, Zimbabwe' },
      { date: '2025-12-20', event: 'Container loaded and sealed', location: 'Marondera, Zimbabwe' },
      { date: '2025-12-20', event: 'Departed for Mutare border', location: 'Marondera, Zimbabwe' },
      { date: '2025-12-21', event: 'Arrived Mutare, customs processing', location: 'Mutare, Zimbabwe' },
      { date: '2025-12-21', event: 'Cleared Zimbabwe customs', location: 'Machipanda Border' },
      { date: '2025-12-22', event: 'Cleared Mozambique customs', location: 'Machipanda Border' },
      { date: '2025-12-23', event: 'Delivered to Beira port terminal', location: 'Beira, Mozambique' },
    ],
  },
  {
    id: 'TRN-005',
    farmerId: 'AFU-2024-017',
    farmerName: 'Boitumelo Ramotswe',
    type: 'pickup',
    carrierId: 'CAR-003',
    carrierName: 'Kasane Border Agri-Trade',
    origin: 'Nata, Botswana',
    destination: 'Gaborone, Botswana',
    cargo: 'Sunflower seeds, 25kg bags',
    weight: 2400,
    status: 'delivered',
    requestDate: '2026-02-10',
    pickupDate: '2026-02-13',
    deliveryDate: '2026-02-14',
    estimatedCost: 280,
    actualCost: 280,
    currency: 'USD',
    notes: 'Standard delivery. Two-pickup relay via Francistown distribution centre.',
    timeline: [
      { date: '2026-02-10', event: 'Booking requested', location: 'Nata, Botswana' },
      { date: '2026-02-11', event: 'Booking confirmed', location: 'Nata, Botswana' },
      { date: '2026-02-13', event: 'Cargo collected from farm store', location: 'Nata, Botswana' },
      { date: '2026-02-13', event: 'Transfer at Francistown hub', location: 'Francistown, Botswana' },
      { date: '2026-02-14', event: 'Delivered to Gaborone grain depot', location: 'Gaborone, Botswana' },
    ],
  },
  {
    id: 'TRN-006',
    farmerId: 'AFU-2024-038',
    farmerName: 'Emmanuel Massawe',
    type: 'refrigerated',
    carrierId: 'CAR-001',
    carrierName: 'Safari Logistics Ltd',
    origin: 'Moshi, Tanzania',
    destination: 'Dar es Salaam, Tanzania',
    cargo: 'Fresh blueberries, 125g punnets in export cartons',
    weight: 4800,
    status: 'in-transit',
    requestDate: '2026-03-12',
    pickupDate: '2026-03-14',
    deliveryDate: null,
    estimatedCost: 720,
    actualCost: null,
    currency: 'USD',
    temperature: { min: 0, max: 4 },
    notes: 'Priority cold chain shipment for EU export flight. Must arrive by 16:00 on 15 March.',
    timeline: [
      { date: '2026-03-12', event: 'Booking requested with priority flag', location: 'Moshi, Tanzania' },
      { date: '2026-03-12', event: 'Booking confirmed, reefer truck assigned', location: 'Arusha, Tanzania' },
      { date: '2026-03-14', event: 'Cargo loaded at Massawe packhouse', location: 'Moshi, Tanzania' },
      { date: '2026-03-14', event: 'Temperature check at loading: 1.8C', location: 'Moshi, Tanzania' },
      { date: '2026-03-14', event: 'Departed Moshi, ETA Dar 15 March 12:00', location: 'Moshi, Tanzania' },
      { date: '2026-03-15', event: 'En route, passed Korogwe checkpoint', location: 'Korogwe, Tanzania' },
    ],
  },
  {
    id: 'TRN-007',
    farmerId: 'AFU-2024-036',
    farmerName: 'Thabo Molefe',
    type: 'refrigerated',
    carrierId: 'CAR-004',
    carrierName: 'Kalahari Cold Chain Express',
    origin: 'Maun, Botswana',
    destination: 'Gaborone, Botswana',
    cargo: 'Fresh blueberries for domestic supermarket distribution',
    weight: 5600,
    status: 'in-transit',
    requestDate: '2026-03-13',
    pickupDate: '2026-03-15',
    deliveryDate: null,
    estimatedCost: 890,
    actualCost: null,
    currency: 'USD',
    temperature: { min: 1, max: 4 },
    notes: 'Weekly delivery run for Choppies and Pick n Pay stores. Palletised load.',
    timeline: [
      { date: '2026-03-13', event: 'Weekly booking placed', location: 'Maun, Botswana' },
      { date: '2026-03-13', event: 'Booking confirmed', location: 'Maun, Botswana' },
      { date: '2026-03-15', event: 'Cargo loaded and pre-cooled', location: 'Maun, Botswana' },
      { date: '2026-03-15', event: 'Departed Maun, ETA Gaborone 16 March', location: 'Maun, Botswana' },
      { date: '2026-03-15', event: 'Temperature log: 2.1C at Nata', location: 'Nata, Botswana' },
    ],
  },
  {
    id: 'TRN-008',
    farmerId: 'AFU-2024-040',
    farmerName: 'Munyaradzi Hove',
    type: 'flatbed',
    carrierId: 'CAR-002',
    carrierName: 'Great Zimbabwe Transport',
    origin: 'Chinhoyi, Zimbabwe',
    destination: 'Harare, Zimbabwe',
    cargo: 'Raw cotton bales, gin-ready',
    weight: 15000,
    status: 'in-transit',
    requestDate: '2026-03-10',
    pickupDate: '2026-03-14',
    deliveryDate: null,
    estimatedCost: 580,
    actualCost: null,
    currency: 'USD',
    notes: 'Three-truck flatbed convoy. Delivering to Cottco ginning plant in Harare.',
    timeline: [
      { date: '2026-03-10', event: 'Booking requested for cotton season haul', location: 'Chinhoyi, Zimbabwe' },
      { date: '2026-03-11', event: 'Confirmed, three flatbeds allocated', location: 'Chinhoyi, Zimbabwe' },
      { date: '2026-03-14', event: 'Loading completed across all three trucks', location: 'Chinhoyi, Zimbabwe' },
      { date: '2026-03-14', event: 'Convoy departed Chinhoyi', location: 'Chinhoyi, Zimbabwe' },
      { date: '2026-03-15', event: 'Truck 1 arrived at Cottco, others en route', location: 'Harare, Zimbabwe' },
    ],
  },
  {
    id: 'TRN-009',
    farmerId: 'AFU-2024-047',
    farmerName: 'Joseph Mwangosi',
    type: 'container',
    carrierId: 'CAR-001',
    carrierName: 'Safari Logistics Ltd',
    origin: 'Mbeya, Tanzania',
    destination: 'Dar es Salaam, Tanzania',
    cargo: 'Processed sesame oil, 20L drums in palletised containers',
    weight: 24000,
    status: 'in-transit',
    requestDate: '2026-03-08',
    pickupDate: '2026-03-13',
    deliveryDate: null,
    estimatedCost: 2100,
    actualCost: null,
    currency: 'USD',
    notes: 'Two 20ft containers. Final destination is Dar port for export to Dubai. Requires fumigation cert at port.',
    timeline: [
      { date: '2026-03-08', event: 'Booking requested for export consignment', location: 'Mbeya, Tanzania' },
      { date: '2026-03-09', event: 'Confirmed, two containers allocated', location: 'Mbeya, Tanzania' },
      { date: '2026-03-13', event: 'Containers loaded and sealed', location: 'Mbeya, Tanzania' },
      { date: '2026-03-13', event: 'Departed Mbeya via TANZAM Highway', location: 'Mbeya, Tanzania' },
      { date: '2026-03-14', event: 'Passed Iringa checkpoint', location: 'Iringa, Tanzania' },
      { date: '2026-03-15', event: 'Stopped at Morogoro weighbridge', location: 'Morogoro, Tanzania' },
    ],
  },
  {
    id: 'TRN-010',
    farmerId: 'AFU-2024-009',
    farmerName: 'Tapiwa Ncube',
    type: 'dry-bulk',
    carrierId: 'CAR-002',
    carrierName: 'Great Zimbabwe Transport',
    origin: 'Hwange, Zimbabwe',
    destination: 'Bulawayo, Zimbabwe',
    cargo: 'Sorghum grain, dried and bagged',
    weight: 12000,
    status: 'confirmed',
    requestDate: '2026-03-14',
    pickupDate: '2026-03-18',
    deliveryDate: null,
    estimatedCost: 650,
    actualCost: null,
    currency: 'USD',
    notes: 'Confirmed for Monday pickup. Farmer arranging labour for loading.',
    timeline: [
      { date: '2026-03-14', event: 'Booking requested', location: 'Hwange, Zimbabwe' },
      { date: '2026-03-15', event: 'Booking confirmed, pickup scheduled for 18 March', location: 'Hwange, Zimbabwe' },
    ],
  },
  {
    id: 'TRN-011',
    farmerId: 'AFU-2024-042',
    farmerName: 'Phenyo Kebonye',
    type: 'refrigerated',
    carrierId: 'CAR-004',
    carrierName: 'Kalahari Cold Chain Express',
    origin: 'Gaborone, Botswana',
    destination: 'Johannesburg, South Africa',
    cargo: 'Fresh blueberries, premium export grade',
    weight: 6200,
    status: 'confirmed',
    requestDate: '2026-03-15',
    pickupDate: '2026-03-19',
    deliveryDate: null,
    estimatedCost: 1450,
    actualCost: null,
    currency: 'USD',
    temperature: { min: 0, max: 3 },
    notes: 'Cross-border cold chain to Joburg fresh produce market. SADC phyto cert required.',
    timeline: [
      { date: '2026-03-15', event: 'Booking requested for cross-border delivery', location: 'Gaborone, Botswana' },
      { date: '2026-03-16', event: 'Confirmed with customs pre-clearance arranged', location: 'Gaborone, Botswana' },
    ],
  },
  {
    id: 'TRN-012',
    farmerId: 'AFU-2024-044',
    farmerName: 'Halima Msuya',
    type: 'dry-bulk',
    carrierId: 'CAR-005',
    carrierName: 'Uhuru Haulage Co.',
    origin: 'Morogoro, Tanzania',
    destination: 'Dodoma, Tanzania',
    cargo: 'Cassava chips, sun-dried, in polypropylene bags',
    weight: 9500,
    status: 'requested',
    requestDate: '2026-03-16',
    pickupDate: '2026-03-20',
    deliveryDate: null,
    estimatedCost: 480,
    actualCost: null,
    currency: 'USD',
    notes: 'Awaiting carrier confirmation. Preferred morning pickup before 08:00.',
    timeline: [
      { date: '2026-03-16', event: 'Booking requested', location: 'Morogoro, Tanzania' },
    ],
  },
  {
    id: 'TRN-013',
    farmerId: 'AFU-2024-030',
    farmerName: 'Tatenda Maposa',
    type: 'flatbed',
    carrierId: 'CAR-006',
    carrierName: 'Limpopo Valley Movers',
    origin: 'Bindura, Zimbabwe',
    destination: 'Harare, Zimbabwe',
    cargo: 'Soybean harvest, bulk bags on pallets',
    weight: 14000,
    status: 'requested',
    requestDate: '2026-03-16',
    pickupDate: '2026-03-21',
    deliveryDate: null,
    estimatedCost: 520,
    actualCost: null,
    currency: 'USD',
    notes: 'Season-end soybean delivery to Harare oilseed processors. Awaiting quote confirmation.',
    timeline: [
      { date: '2026-03-16', event: 'Booking requested', location: 'Bindura, Zimbabwe' },
    ],
  },
  {
    id: 'TRN-014',
    farmerId: 'AFU-2024-004',
    farmerName: 'Baraka Mwakasege',
    type: 'pickup',
    carrierId: 'CAR-005',
    carrierName: 'Uhuru Haulage Co.',
    origin: 'Arusha, Tanzania',
    destination: 'Moshi, Tanzania',
    cargo: 'Fresh cassava roots',
    weight: 1800,
    status: 'cancelled',
    requestDate: '2026-03-01',
    pickupDate: '2026-03-05',
    deliveryDate: null,
    estimatedCost: 120,
    actualCost: null,
    currency: 'USD',
    notes: 'Cancelled by farmer. Buyer postponed order due to market oversupply.',
    timeline: [
      { date: '2026-03-01', event: 'Booking requested', location: 'Arusha, Tanzania' },
      { date: '2026-03-02', event: 'Booking confirmed', location: 'Arusha, Tanzania' },
      { date: '2026-03-04', event: 'Cancelled by farmer - buyer postponed', location: 'Arusha, Tanzania' },
    ],
  },
  {
    id: 'TRN-015',
    farmerId: 'AFU-2024-039',
    farmerName: 'Gaone Baitshepi',
    type: 'dry-bulk',
    carrierId: 'CAR-003',
    carrierName: 'Kasane Border Agri-Trade',
    origin: 'Palapye, Botswana',
    destination: 'Gaborone, Botswana',
    cargo: 'Maize and sorghum mixed lot, bagged',
    weight: 10000,
    status: 'confirmed',
    requestDate: '2026-03-13',
    pickupDate: '2026-03-17',
    deliveryDate: null,
    estimatedCost: 560,
    actualCost: null,
    currency: 'USD',
    notes: 'Delivering to Botswana Agricultural Marketing Board depot. Grading on arrival.',
    timeline: [
      { date: '2026-03-13', event: 'Booking requested', location: 'Palapye, Botswana' },
      { date: '2026-03-14', event: 'Confirmed, vehicle scheduled for 17 March', location: 'Palapye, Botswana' },
    ],
  },
];

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
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showDelivered, setShowDelivered] = useState(false);
  const [liveBookings, setLiveBookings] = useState<TransportBooking[]>(transportBookings);
  const [_dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    const load = async () => {
      try {
        let query = supabase.from('shipments').select('*').order('created_at', { ascending: false });
        if (user) query = query.eq('member_id', user.id);
        const { data } = await query;
        if (data && data.length > 0) {
          setLiveBookings(data.map((s: any) => ({
            id: s.id,
            farmerId: s.member_id || '',
            farmerName: '',
            type: 'dry-bulk' as TransportType,
            carrierId: '',
            carrierName: s.carrier || '',
            origin: s.origin || '',
            destination: s.destination || '',
            cargo: s.cargo_type || '',
            weight: s.weight_kg || 0,
            status: (s.status || 'requested').replace('_', '-') as BookingStatus,
            requestDate: s.created_at?.split('T')[0] || '',
            pickupDate: s.pickup_date || '',
            deliveryDate: s.delivery_date || null,
            estimatedCost: s.cost || 0,
            actualCost: s.status === 'delivered' ? s.cost : null,
            currency: s.currency || 'USD',
            notes: s.notes || '',
            timeline: [],
          })));
        }
      } catch { /* keep fallback */ }
      setDataLoading(false);
    };
    load();
  }, [user]);

  // Active shipments: confirmed or in-transit
  const activeShipments = useMemo(() => {
    const active = liveBookings.filter(
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
    return liveBookings.filter((b) => {
      if (b.status !== 'delivered' || !b.deliveryDate) return false;
      return new Date(b.deliveryDate) >= thirtyDaysAgo;
    });
  }, [liveBookings]);

  // Search across all bookings if searching
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase();
    return liveBookings.filter(
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
        <div className="rounded-2xl bg-gradient-to-br from-[#8CB89C] to-[#8CB89C]/80 p-5 text-white relative overflow-hidden">
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
