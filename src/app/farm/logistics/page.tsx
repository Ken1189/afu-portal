'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/supabase/auth-context';
import { createClient } from '@/lib/supabase/client';
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
// ---------------------------------------------------------------------------
// Inlined types & data (previously from @/lib/data/logistics)
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

interface Carrier {
  id: string;
  name: string;
  type: TransportType[];
  country: string;
  rating: number;
  pricePerKm: number;
  coldChain: boolean;
  insurance: boolean;
  vehicleCount: number;
}

const carriers: Carrier[] = [
  { id: 'CAR-001', name: 'Safari Logistics Ltd', type: ['refrigerated', 'dry-bulk', 'container'], country: 'Tanzania', rating: 4.4, pricePerKm: 0.18, coldChain: true, insurance: true, vehicleCount: 42 },
  { id: 'CAR-002', name: 'Great Zimbabwe Transport', type: ['dry-bulk', 'flatbed', 'container'], country: 'Zimbabwe', rating: 4.1, pricePerKm: 0.15, coldChain: false, insurance: true, vehicleCount: 28 },
  { id: 'CAR-003', name: 'Kasane Border Agri-Trade', type: ['dry-bulk', 'flatbed', 'pickup'], country: 'Botswana', rating: 3.2, pricePerKm: 0.20, coldChain: false, insurance: false, vehicleCount: 9 },
  { id: 'CAR-004', name: 'Kalahari Cold Chain Express', type: ['refrigerated', 'container'], country: 'Botswana', rating: 4.6, pricePerKm: 0.24, coldChain: true, insurance: true, vehicleCount: 18 },
  { id: 'CAR-005', name: 'Uhuru Haulage Co.', type: ['dry-bulk', 'flatbed', 'container', 'pickup'], country: 'Tanzania', rating: 4.3, pricePerKm: 0.14, coldChain: false, insurance: true, vehicleCount: 35 },
  { id: 'CAR-006', name: 'Limpopo Valley Movers', type: ['refrigerated', 'dry-bulk', 'flatbed'], country: 'Zimbabwe', rating: 4.5, pricePerKm: 0.17, coldChain: true, insurance: true, vehicleCount: 22 },
];

const transportBookings: TransportBooking[] = [
  { id: 'TRN-001', farmerId: 'AFU-2024-001', farmerName: 'Kgosi Mosweu', type: 'dry-bulk', carrierId: 'CAR-003', carrierName: 'Kasane Border Agri-Trade', origin: 'Maun, Botswana', destination: 'Francistown, Botswana', cargo: 'Dried maize grain, 50kg bags', weight: 8500, status: 'delivered', requestDate: '2026-01-20', pickupDate: '2026-01-24', deliveryDate: '2026-01-25', estimatedCost: 420, actualCost: 435, currency: 'USD', notes: 'Successful delivery. Slight delay at Nata weighbridge checkpoint.', timeline: [{ date: '2026-01-20', event: 'Booking requested', location: 'Maun, Botswana' }, { date: '2026-01-21', event: 'Booking confirmed by carrier', location: 'Maun, Botswana' }, { date: '2026-01-24', event: 'Cargo loaded and departed', location: 'Maun, Botswana' }, { date: '2026-01-24', event: 'Checkpoint clearance at Nata', location: 'Nata, Botswana' }, { date: '2026-01-25', event: 'Arrived at destination warehouse', location: 'Francistown, Botswana' }, { date: '2026-01-25', event: 'Cargo offloaded and signed for', location: 'Francistown, Botswana' }] },
  { id: 'TRN-002', farmerId: 'AFU-2024-003', farmerName: 'Tendai Moyo', type: 'refrigerated', carrierId: 'CAR-006', carrierName: 'Limpopo Valley Movers', origin: 'Marondera, Zimbabwe', destination: 'Harare, Zimbabwe', cargo: 'Fresh blueberries, export-grade punnets', weight: 3200, status: 'delivered', requestDate: '2026-02-05', pickupDate: '2026-02-07', deliveryDate: '2026-02-07', estimatedCost: 310, actualCost: 295, currency: 'USD', temperature: { min: 1, max: 4 }, notes: 'Cold chain maintained throughout. Delivered to Harare International Airport cold store for onward export.', timeline: [{ date: '2026-02-05', event: 'Booking requested', location: 'Marondera, Zimbabwe' }, { date: '2026-02-06', event: 'Booking confirmed, vehicle dispatched', location: 'Harare, Zimbabwe' }, { date: '2026-02-07', event: 'Cargo loaded at farm packhouse', location: 'Marondera, Zimbabwe' }, { date: '2026-02-07', event: 'Temperature check: 2.3C', location: 'En route' }, { date: '2026-02-07', event: 'Delivered to airport cold store', location: 'Harare, Zimbabwe' }, { date: '2026-02-07', event: 'Cargo signed for, cold chain verified', location: 'Harare, Zimbabwe' }] },
  { id: 'TRN-003', farmerId: 'AFU-2024-041', farmerName: 'Grace Kilango', type: 'dry-bulk', carrierId: 'CAR-005', carrierName: 'Uhuru Haulage Co.', origin: 'Iringa, Tanzania', destination: 'Dar es Salaam, Tanzania', cargo: 'Sesame seeds, cleaned and sorted, bulk bags', weight: 22000, status: 'delivered', requestDate: '2026-01-08', pickupDate: '2026-01-12', deliveryDate: '2026-01-14', estimatedCost: 1180, actualCost: 1200, currency: 'USD', notes: 'Two-truck convoy for large consignment. Minor tyre repair near Morogoro caused 3-hour delay.', timeline: [{ date: '2026-01-08', event: 'Booking requested for 22-tonne load', location: 'Iringa, Tanzania' }, { date: '2026-01-09', event: 'Booking confirmed, two trucks allocated', location: 'Iringa, Tanzania' }, { date: '2026-01-12', event: 'Loading completed at Kilango warehouse', location: 'Iringa, Tanzania' }, { date: '2026-01-12', event: 'Departed Iringa', location: 'Iringa, Tanzania' }, { date: '2026-01-13', event: 'Overnight stop at Morogoro depot', location: 'Morogoro, Tanzania' }, { date: '2026-01-13', event: 'Tyre repaired on Truck 2', location: 'Morogoro, Tanzania' }, { date: '2026-01-14', event: 'Arrived at Dar port warehouse', location: 'Dar es Salaam, Tanzania' }, { date: '2026-01-14', event: 'Cargo weighed and verified: 21,940kg', location: 'Dar es Salaam, Tanzania' }] },
  { id: 'TRN-004', farmerId: 'AFU-2024-037', farmerName: 'Rudo Chidyamakono', type: 'container', carrierId: 'CAR-002', carrierName: 'Great Zimbabwe Transport', origin: 'Marondera, Zimbabwe', destination: 'Beira, Mozambique', cargo: 'Tobacco bales, flue-cured Virginia grade A', weight: 18000, status: 'delivered', requestDate: '2025-12-15', pickupDate: '2025-12-20', deliveryDate: '2025-12-23', estimatedCost: 2800, actualCost: 2750, currency: 'USD', notes: 'Cross-border shipment. Customs documentation pre-arranged. Border crossing at Machipanda took 4 hours.', timeline: [{ date: '2025-12-15', event: 'Booking requested for export consignment', location: 'Marondera, Zimbabwe' }, { date: '2025-12-17', event: 'Booking confirmed, container allocated', location: 'Harare, Zimbabwe' }, { date: '2025-12-20', event: 'Container loaded and sealed', location: 'Marondera, Zimbabwe' }, { date: '2025-12-20', event: 'Departed for Mutare border', location: 'Marondera, Zimbabwe' }, { date: '2025-12-21', event: 'Arrived Mutare, customs processing', location: 'Mutare, Zimbabwe' }, { date: '2025-12-21', event: 'Cleared Zimbabwe customs', location: 'Machipanda Border' }, { date: '2025-12-22', event: 'Cleared Mozambique customs', location: 'Machipanda Border' }, { date: '2025-12-23', event: 'Delivered to Beira port terminal', location: 'Beira, Mozambique' }] },
  { id: 'TRN-005', farmerId: 'AFU-2024-017', farmerName: 'Boitumelo Ramotswe', type: 'pickup', carrierId: 'CAR-003', carrierName: 'Kasane Border Agri-Trade', origin: 'Nata, Botswana', destination: 'Gaborone, Botswana', cargo: 'Sunflower seeds, 25kg bags', weight: 2400, status: 'delivered', requestDate: '2026-02-10', pickupDate: '2026-02-13', deliveryDate: '2026-02-14', estimatedCost: 280, actualCost: 280, currency: 'USD', notes: 'Standard delivery. Two-pickup relay via Francistown distribution centre.', timeline: [{ date: '2026-02-10', event: 'Booking requested', location: 'Nata, Botswana' }, { date: '2026-02-11', event: 'Booking confirmed', location: 'Nata, Botswana' }, { date: '2026-02-13', event: 'Cargo collected from farm store', location: 'Nata, Botswana' }, { date: '2026-02-13', event: 'Transfer at Francistown hub', location: 'Francistown, Botswana' }, { date: '2026-02-14', event: 'Delivered to Gaborone grain depot', location: 'Gaborone, Botswana' }] },
  { id: 'TRN-006', farmerId: 'AFU-2024-038', farmerName: 'Emmanuel Massawe', type: 'refrigerated', carrierId: 'CAR-001', carrierName: 'Safari Logistics Ltd', origin: 'Moshi, Tanzania', destination: 'Dar es Salaam, Tanzania', cargo: 'Fresh blueberries, 125g punnets in export cartons', weight: 4800, status: 'in-transit', requestDate: '2026-03-12', pickupDate: '2026-03-14', deliveryDate: null, estimatedCost: 720, actualCost: null, currency: 'USD', temperature: { min: 0, max: 4 }, notes: 'Priority cold chain shipment for EU export flight. Must arrive by 16:00 on 15 March.', timeline: [{ date: '2026-03-12', event: 'Booking requested with priority flag', location: 'Moshi, Tanzania' }, { date: '2026-03-12', event: 'Booking confirmed, reefer truck assigned', location: 'Arusha, Tanzania' }, { date: '2026-03-14', event: 'Cargo loaded at Massawe packhouse', location: 'Moshi, Tanzania' }, { date: '2026-03-14', event: 'Temperature check at loading: 1.8C', location: 'Moshi, Tanzania' }, { date: '2026-03-14', event: 'Departed Moshi, ETA Dar 15 March 12:00', location: 'Moshi, Tanzania' }, { date: '2026-03-15', event: 'En route, passed Korogwe checkpoint', location: 'Korogwe, Tanzania' }] },
  { id: 'TRN-007', farmerId: 'AFU-2024-036', farmerName: 'Thabo Molefe', type: 'refrigerated', carrierId: 'CAR-004', carrierName: 'Kalahari Cold Chain Express', origin: 'Maun, Botswana', destination: 'Gaborone, Botswana', cargo: 'Fresh blueberries for domestic supermarket distribution', weight: 5600, status: 'in-transit', requestDate: '2026-03-13', pickupDate: '2026-03-15', deliveryDate: null, estimatedCost: 890, actualCost: null, currency: 'USD', temperature: { min: 1, max: 4 }, notes: 'Weekly delivery run for Choppies and Pick n Pay stores. Palletised load.', timeline: [{ date: '2026-03-13', event: 'Weekly booking placed', location: 'Maun, Botswana' }, { date: '2026-03-13', event: 'Booking confirmed', location: 'Maun, Botswana' }, { date: '2026-03-15', event: 'Cargo loaded and pre-cooled', location: 'Maun, Botswana' }, { date: '2026-03-15', event: 'Departed Maun, ETA Gaborone 16 March', location: 'Maun, Botswana' }, { date: '2026-03-15', event: 'Temperature log: 2.1C at Nata', location: 'Nata, Botswana' }] },
  { id: 'TRN-008', farmerId: 'AFU-2024-040', farmerName: 'Munyaradzi Hove', type: 'flatbed', carrierId: 'CAR-002', carrierName: 'Great Zimbabwe Transport', origin: 'Chinhoyi, Zimbabwe', destination: 'Harare, Zimbabwe', cargo: 'Raw cotton bales, gin-ready', weight: 15000, status: 'in-transit', requestDate: '2026-03-10', pickupDate: '2026-03-14', deliveryDate: null, estimatedCost: 580, actualCost: null, currency: 'USD', notes: 'Three-truck flatbed convoy. Delivering to Cottco ginning plant in Harare.', timeline: [{ date: '2026-03-10', event: 'Booking requested for cotton season haul', location: 'Chinhoyi, Zimbabwe' }, { date: '2026-03-11', event: 'Confirmed, three flatbeds allocated', location: 'Chinhoyi, Zimbabwe' }, { date: '2026-03-14', event: 'Loading completed across all three trucks', location: 'Chinhoyi, Zimbabwe' }, { date: '2026-03-14', event: 'Convoy departed Chinhoyi', location: 'Chinhoyi, Zimbabwe' }, { date: '2026-03-15', event: 'Truck 1 arrived at Cottco, others en route', location: 'Harare, Zimbabwe' }] },
  { id: 'TRN-009', farmerId: 'AFU-2024-047', farmerName: 'Joseph Mwangosi', type: 'container', carrierId: 'CAR-001', carrierName: 'Safari Logistics Ltd', origin: 'Mbeya, Tanzania', destination: 'Dar es Salaam, Tanzania', cargo: 'Processed sesame oil, 20L drums in palletised containers', weight: 24000, status: 'in-transit', requestDate: '2026-03-08', pickupDate: '2026-03-13', deliveryDate: null, estimatedCost: 2100, actualCost: null, currency: 'USD', notes: 'Two 20ft containers. Final destination is Dar port for export to Dubai. Requires fumigation cert at port.', timeline: [{ date: '2026-03-08', event: 'Booking requested for export consignment', location: 'Mbeya, Tanzania' }, { date: '2026-03-09', event: 'Confirmed, two containers allocated', location: 'Mbeya, Tanzania' }, { date: '2026-03-13', event: 'Containers loaded and sealed', location: 'Mbeya, Tanzania' }, { date: '2026-03-13', event: 'Departed Mbeya via TANZAM Highway', location: 'Mbeya, Tanzania' }, { date: '2026-03-14', event: 'Passed Iringa checkpoint', location: 'Iringa, Tanzania' }, { date: '2026-03-15', event: 'Stopped at Morogoro weighbridge', location: 'Morogoro, Tanzania' }] },
  { id: 'TRN-010', farmerId: 'AFU-2024-009', farmerName: 'Tapiwa Ncube', type: 'dry-bulk', carrierId: 'CAR-002', carrierName: 'Great Zimbabwe Transport', origin: 'Hwange, Zimbabwe', destination: 'Bulawayo, Zimbabwe', cargo: 'Sorghum grain, dried and bagged', weight: 12000, status: 'confirmed', requestDate: '2026-03-14', pickupDate: '2026-03-18', deliveryDate: null, estimatedCost: 650, actualCost: null, currency: 'USD', notes: 'Confirmed for Monday pickup. Farmer arranging labour for loading.', timeline: [{ date: '2026-03-14', event: 'Booking requested', location: 'Hwange, Zimbabwe' }, { date: '2026-03-15', event: 'Booking confirmed, pickup scheduled for 18 March', location: 'Hwange, Zimbabwe' }] },
  { id: 'TRN-011', farmerId: 'AFU-2024-042', farmerName: 'Phenyo Kebonye', type: 'refrigerated', carrierId: 'CAR-004', carrierName: 'Kalahari Cold Chain Express', origin: 'Gaborone, Botswana', destination: 'Johannesburg, South Africa', cargo: 'Fresh blueberries, premium export grade', weight: 6200, status: 'confirmed', requestDate: '2026-03-15', pickupDate: '2026-03-19', deliveryDate: null, estimatedCost: 1450, actualCost: null, currency: 'USD', temperature: { min: 0, max: 3 }, notes: 'Cross-border cold chain to Joburg fresh produce market. SADC phyto cert required.', timeline: [{ date: '2026-03-15', event: 'Booking requested for cross-border delivery', location: 'Gaborone, Botswana' }, { date: '2026-03-16', event: 'Confirmed with customs pre-clearance arranged', location: 'Gaborone, Botswana' }] },
  { id: 'TRN-012', farmerId: 'AFU-2024-044', farmerName: 'Halima Msuya', type: 'dry-bulk', carrierId: 'CAR-005', carrierName: 'Uhuru Haulage Co.', origin: 'Morogoro, Tanzania', destination: 'Dodoma, Tanzania', cargo: 'Cassava chips, sun-dried, in polypropylene bags', weight: 9500, status: 'requested', requestDate: '2026-03-16', pickupDate: '2026-03-20', deliveryDate: null, estimatedCost: 480, actualCost: null, currency: 'USD', notes: 'Awaiting carrier confirmation. Preferred morning pickup before 08:00.', timeline: [{ date: '2026-03-16', event: 'Booking requested', location: 'Morogoro, Tanzania' }] },
  { id: 'TRN-013', farmerId: 'AFU-2024-030', farmerName: 'Tatenda Maposa', type: 'flatbed', carrierId: 'CAR-006', carrierName: 'Limpopo Valley Movers', origin: 'Bindura, Zimbabwe', destination: 'Harare, Zimbabwe', cargo: 'Soybean harvest, bulk bags on pallets', weight: 14000, status: 'requested', requestDate: '2026-03-16', pickupDate: '2026-03-21', deliveryDate: null, estimatedCost: 520, actualCost: null, currency: 'USD', notes: 'Season-end soybean delivery to Harare oilseed processors. Awaiting quote confirmation.', timeline: [{ date: '2026-03-16', event: 'Booking requested', location: 'Bindura, Zimbabwe' }] },
  { id: 'TRN-014', farmerId: 'AFU-2024-004', farmerName: 'Baraka Mwakasege', type: 'pickup', carrierId: 'CAR-005', carrierName: 'Uhuru Haulage Co.', origin: 'Arusha, Tanzania', destination: 'Moshi, Tanzania', cargo: 'Fresh cassava roots', weight: 1800, status: 'cancelled', requestDate: '2026-03-01', pickupDate: '2026-03-05', deliveryDate: null, estimatedCost: 120, actualCost: null, currency: 'USD', notes: 'Cancelled by farmer. Buyer postponed order due to market oversupply.', timeline: [{ date: '2026-03-01', event: 'Booking requested', location: 'Arusha, Tanzania' }, { date: '2026-03-02', event: 'Booking confirmed', location: 'Arusha, Tanzania' }, { date: '2026-03-04', event: 'Cancelled by farmer - buyer postponed', location: 'Arusha, Tanzania' }] },
  { id: 'TRN-015', farmerId: 'AFU-2024-039', farmerName: 'Gaone Baitshepi', type: 'dry-bulk', carrierId: 'CAR-003', carrierName: 'Kasane Border Agri-Trade', origin: 'Palapye, Botswana', destination: 'Gaborone, Botswana', cargo: 'Maize and sorghum mixed lot, bagged', weight: 10000, status: 'confirmed', requestDate: '2026-03-13', pickupDate: '2026-03-17', deliveryDate: null, estimatedCost: 560, actualCost: null, currency: 'USD', notes: 'Delivering to Botswana Agricultural Marketing Board depot. Grading on arrival.', timeline: [{ date: '2026-03-13', event: 'Booking requested', location: 'Palapye, Botswana' }, { date: '2026-03-14', event: 'Confirmed, vehicle scheduled for 17 March', location: 'Palapye, Botswana' }] },
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
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>('bookings');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');
  const [liveBookings, setLiveBookings] = useState<TransportBooking[]>(transportBookings);
  const [dataLoading, setDataLoading] = useState(true);

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

  // ---------- Computed stats ----------
  const stats = useMemo(() => {
    const active = liveBookings.filter(
      (b) => b.status === 'confirmed' || b.status === 'in-transit' || b.status === 'requested'
    );
    const deliveredThisMonth = liveBookings.filter((b) => {
      if (b.status !== 'delivered' || !b.deliveryDate) return false;
      const d = new Date(b.deliveryDate);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const totalSpent = liveBookings
      .filter((b) => b.actualCost !== null)
      .reduce((sum, b) => sum + (b.actualCost ?? 0), 0);
    const totalDeliveredWeight = liveBookings
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
  }, [liveBookings]);

  // ---------- Filtered bookings ----------
  const filteredBookings = useMemo(() => {
    if (statusFilter === 'all') return liveBookings;
    return liveBookings.filter((b) => b.status === statusFilter);
  }, [statusFilter, liveBookings]);

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
                  All ({liveBookings.length})
                </button>
                {ALL_STATUSES.map((status) => {
                  const count = liveBookings.filter((b) => b.status === status).length;
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
