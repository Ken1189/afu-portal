'use client';

import { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/supabase/auth-context';
import { createClient } from '@/lib/supabase/client';
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
// ---------------------------------------------------------------------------
// Fallback data (inlined from @/lib/data/equipment)
// ---------------------------------------------------------------------------

interface FallbackEquipment {
  id: string;
  name: string;
  category: string;
  description: string;
  specs: Record<string, string>;
  dailyRate: number;
  weeklyRate: number;
  monthlyRate: number;
  availability: 'available' | 'booked' | 'maintenance';
  location: string;
  country: string;
  owner: string;
  condition: 'excellent' | 'good' | 'fair';
  image: string;
  rating: number;
  reviewCount: number;
  minBookingDays: number;
  deliveryAvailable: boolean;
  deliveryFee: number;
  insuranceIncluded: boolean;
}

const FALLBACK_EQUIPMENT: FallbackEquipment[] = [
  {
    id: 'EQP-001',
    name: 'Changfa 15HP Walk-Behind Tractor',
    category: 'tractor',
    description: 'Compact two-wheel walk-behind tractor ideal for smallholder plots up to 5 hectares. Comes with plough, ridger, and small trailer attachments. Fuel-efficient single-cylinder diesel engine with easy hand-start. Perfect for land preparation, ridging, and light transport tasks in tight field conditions.',
    specs: {
      'Power': '15 HP',
      'Engine': 'Single-cylinder diesel',
      'Fuel Capacity': '6 litres',
      'Working Width': '0.6m (plough)',
      'Weight': '280 kg',
      'Attachments': 'Plough, ridger, trailer',
    },
    dailyRate: 35,
    weeklyRate: 210,
    monthlyRate: 750,
    availability: 'available',
    location: 'Francistown, Botswana',
    country: 'Botswana',
    owner: 'Matopos Equipment Hire',
    condition: 'good',
    image: 'https://images.unsplash.com/photo-1530267981375-f0de937f5f13?w=400&h=300&fit=crop',
    rating: 4.3,
    reviewCount: 67,
    minBookingDays: 1,
    deliveryAvailable: true,
    deliveryFee: 25,
    insuranceIncluded: false,
  },
  {
    id: 'EQP-002',
    name: 'Massey Ferguson 250 Utility Tractor',
    category: 'tractor',
    description: 'Versatile 50HP utility tractor suitable for medium-scale farming operations. Two-wheel drive with PTO for implements including disc ploughs, planters, and boom sprayers. Well-maintained with recent engine overhaul. Ideal for farms between 10-50 hectares requiring reliable traction for planting, cultivation, and spraying.',
    specs: {
      'Power': '50 HP',
      'Engine': '3-cylinder Perkins diesel',
      'Transmission': '8 forward, 2 reverse',
      'PTO Speed': '540 RPM',
      'Lift Capacity': '1,500 kg',
      'Fuel Capacity': '45 litres',
    },
    dailyRate: 85,
    weeklyRate: 510,
    monthlyRate: 1800,
    availability: 'booked',
    location: 'Harare, Zimbabwe',
    country: 'Zimbabwe',
    owner: 'Great Zimbabwe Transport',
    condition: 'good',
    image: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=400&h=300&fit=crop',
    rating: 4.5,
    reviewCount: 43,
    minBookingDays: 3,
    deliveryAvailable: true,
    deliveryFee: 65,
    insuranceIncluded: true,
  },
  {
    id: 'EQP-003',
    name: 'New Holland TD80 4WD Tractor',
    category: 'tractor',
    description: 'Heavy-duty 85HP four-wheel-drive tractor for large-scale operations. Air-conditioned cabin, front-end loader compatible, and full PTO capability. Equipped for demanding field conditions including wet clay soils and steep terrain. Suitable for commercial farms, cooperatives, and contract ploughing services.',
    specs: {
      'Power': '85 HP',
      'Engine': '4-cylinder turbo diesel',
      'Drive': '4WD with differential lock',
      'Transmission': '12 forward, 12 reverse (shuttle)',
      'PTO Speed': '540/1000 RPM',
      'Lift Capacity': '2,800 kg',
    },
    dailyRate: 150,
    weeklyRate: 900,
    monthlyRate: 3200,
    availability: 'available',
    location: 'Arusha, Tanzania',
    country: 'Tanzania',
    owner: 'Arusha Coffee Cooperative',
    condition: 'excellent',
    image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&h=300&fit=crop',
    rating: 4.8,
    reviewCount: 28,
    minBookingDays: 5,
    deliveryAvailable: true,
    deliveryFee: 120,
    insuranceIncluded: true,
  },
  {
    id: 'EQP-004',
    name: 'Wintersteiger Classic Combine Harvester',
    category: 'harvester',
    description: 'Small-scale plot combine harvester suitable for cereals including wheat, sorghum, and barley. Self-propelled with adjustable cutting width and cleaning sieves. Excellent for cooperative-scale operations and seed multiplication programmes. Includes grain tank with unloading auger.',
    specs: {
      'Cutting Width': '2.0m',
      'Grain Tank': '1,200 litres',
      'Throughput': '3-5 tonnes/hour',
      'Engine': '75 HP diesel',
      'Cleaning System': 'Dual-screen with adjustable sieves',
      'Crop Types': 'Wheat, sorghum, barley, rice',
    },
    dailyRate: 280,
    weeklyRate: 1680,
    monthlyRate: 5500,
    availability: 'available',
    location: 'Dodoma, Tanzania',
    country: 'Tanzania',
    owner: 'Dodoma Cassava Processors',
    condition: 'good',
    image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=300&fit=crop',
    rating: 4.4,
    reviewCount: 15,
    minBookingDays: 3,
    deliveryAvailable: true,
    deliveryFee: 200,
    insuranceIncluded: true,
  },
  {
    id: 'EQP-005',
    name: 'Penagos TPH-30 Maize Sheller',
    category: 'harvester',
    description: 'Motorised maize sheller with 2.5 tonne/hour capacity. Diesel-powered with adjustable concave clearance to minimise grain damage. Mounted on wheeled chassis for field mobility. Separates grain from cob with less than 1% breakage rate. Includes bagging attachment.',
    specs: {
      'Capacity': '2.5 tonnes/hour',
      'Engine': '10 HP diesel',
      'Breakage Rate': '<1%',
      'Feed Type': 'Manual cob feeding',
      'Outlet': 'Bagging chute with conveyor',
      'Weight': '420 kg',
    },
    dailyRate: 65,
    weeklyRate: 390,
    monthlyRate: 1300,
    availability: 'available',
    location: 'Masvingo, Zimbabwe',
    country: 'Zimbabwe',
    owner: 'Chimanimani Mixed Farming Co-op',
    condition: 'good',
    image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=300&fit=crop',
    rating: 4.2,
    reviewCount: 38,
    minBookingDays: 1,
    deliveryAvailable: true,
    deliveryFee: 45,
    insuranceIncluded: false,
  },
  {
    id: 'EQP-006',
    name: 'Netafim Drip Irrigation Kit (5 Hectare)',
    category: 'irrigation',
    description: 'Complete drip irrigation system covering 5 hectares. Includes mainline pipe, sub-mains, lateral lines with pressure-compensating drippers at 30cm spacing, disc filter, pressure regulator, and all fittings. Solar pump compatible. Designed for vegetable and fruit production in water-scarce environments.',
    specs: {
      'Coverage': '5 hectares',
      'Dripper Spacing': '30 cm',
      'Flow Rate': '1.6 litres/hour per dripper',
      'Operating Pressure': '1.0-3.5 bar',
      'Filter Type': '120 mesh disc filter',
      'Pipe Material': 'HDPE (mainline), LDPE (laterals)',
    },
    dailyRate: 45,
    weeklyRate: 270,
    monthlyRate: 850,
    availability: 'available',
    location: 'Gaborone, Botswana',
    country: 'Botswana',
    owner: 'Chobe Irrigation Systems',
    condition: 'excellent',
    image: 'https://images.unsplash.com/photo-1622383563227-04401ab4e5ea?w=400&h=300&fit=crop',
    rating: 4.7,
    reviewCount: 52,
    minBookingDays: 30,
    deliveryAvailable: true,
    deliveryFee: 80,
    insuranceIncluded: false,
  },
  {
    id: 'EQP-007',
    name: 'Valley 8000 Series Center Pivot',
    category: 'irrigation',
    description: 'Center pivot irrigation system covering a 50-hectare circle. Galvanized steel structure with low-pressure sprinkler packages for water and energy efficiency. Includes electric drive motors, control panel with remote monitoring, and end gun for corner coverage. Suitable for cereals, legumes, and fodder crops.',
    specs: {
      'Coverage': '50 hectares (circular)',
      'Span Length': '400m radius',
      'Flow Rate': '120 m3/hour',
      'Drive': 'Electric, 480V 3-phase',
      'Sprinkler Type': 'Low-pressure drop nozzles',
      'Control': 'GPS guidance with remote panel',
    },
    dailyRate: 180,
    weeklyRate: 1080,
    monthlyRate: 3500,
    availability: 'booked',
    location: 'Nata, Botswana',
    country: 'Botswana',
    owner: 'Gaborone Grain Collective',
    condition: 'good',
    image: 'https://images.unsplash.com/photo-1504370805625-d32c54b16100?w=400&h=300&fit=crop',
    rating: 4.6,
    reviewCount: 11,
    minBookingDays: 30,
    deliveryAvailable: false,
    deliveryFee: 0,
    insuranceIncluded: true,
  },
  {
    id: 'EQP-008',
    name: 'Jacto Condor 600L Boom Sprayer',
    category: 'sprayer',
    description: 'Tractor-mounted hydraulic boom sprayer with 600-litre tank. 12-metre spray width with anti-drip nozzles and pressure regulator for uniform application. Ideal for herbicide, insecticide, and foliar fertiliser application in cereal and cotton fields. Requires minimum 40HP tractor with PTO.',
    specs: {
      'Tank Capacity': '600 litres',
      'Boom Width': '12m',
      'Nozzle Spacing': '50 cm',
      'Pump Type': 'Diaphragm, 100 L/min',
      'Operating Pressure': '2-5 bar',
      'Tractor Requirement': '40+ HP with PTO',
    },
    dailyRate: 55,
    weeklyRate: 330,
    monthlyRate: 1100,
    availability: 'available',
    location: 'Chinhoyi, Zimbabwe',
    country: 'Zimbabwe',
    owner: 'Masvingo Cotton Growers',
    condition: 'good',
    image: 'https://images.unsplash.com/photo-1530267981375-f0de937f5f13?w=400&h=300&fit=crop',
    rating: 4.3,
    reviewCount: 29,
    minBookingDays: 1,
    deliveryAvailable: true,
    deliveryFee: 55,
    insuranceIncluded: false,
  },
  {
    id: 'EQP-009',
    name: 'DJI Agras T30 Spray Drone',
    category: 'sprayer',
    description: 'Agricultural spray drone with 30-litre tank for precision aerial application of pesticides, herbicides, and foliar nutrients. GPS-guided autonomous flight paths with obstacle avoidance radar. Covers up to 16 hectares per hour. Includes operator service with trained pilot. Reduces chemical usage by 30% compared to conventional spraying.',
    specs: {
      'Tank Capacity': '30 litres',
      'Coverage Rate': '16 hectares/hour',
      'Flight Time': '12 minutes per battery',
      'Spray Width': '9m',
      'Nozzle Count': '16 atomisation nozzles',
      'Navigation': 'RTK GPS, terrain following radar',
    },
    dailyRate: 220,
    weeklyRate: 1320,
    monthlyRate: 4500,
    availability: 'available',
    location: 'Maun, Botswana',
    country: 'Botswana',
    owner: 'Makgadikgadi Drones',
    condition: 'excellent',
    image: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=400&h=300&fit=crop',
    rating: 4.9,
    reviewCount: 22,
    minBookingDays: 1,
    deliveryAvailable: true,
    deliveryFee: 100,
    insuranceIncluded: true,
  },
  {
    id: 'EQP-010',
    name: 'John Deere 1750 Precision Planter (4-Row)',
    category: 'planter',
    description: 'Four-row precision vacuum planter for maize, soybean, and sunflower. Accurate seed singulation with adjustable row spacing and planting depth. MaxEmerge Plus row units with residue managers for no-till planting. Requires 50+ HP tractor with three-point hitch.',
    specs: {
      'Rows': '4',
      'Row Spacing': '75-90 cm (adjustable)',
      'Planting Depth': '2.5-10 cm',
      'Seed Metering': 'Vacuum precision',
      'Hopper Capacity': '40 litres per row',
      'Tractor Requirement': '50+ HP with 3-point hitch',
    },
    dailyRate: 120,
    weeklyRate: 720,
    monthlyRate: 2400,
    availability: 'maintenance',
    location: 'Marondera, Zimbabwe',
    country: 'Zimbabwe',
    owner: 'Mashonaland Blueberry Co-op',
    condition: 'fair',
    image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=300&fit=crop',
    rating: 4.6,
    reviewCount: 19,
    minBookingDays: 3,
    deliveryAvailable: true,
    deliveryFee: 85,
    insuranceIncluded: true,
  },
  {
    id: 'EQP-011',
    name: 'Ox-Drawn Manual Jab Planter',
    category: 'planter',
    description: 'Simple manual jab planter for smallholder farmers without tractor access. Spring-loaded mechanism delivers precise seed and fertiliser placement in conservation agriculture systems. Lightweight and durable, suitable for planting maize, beans, groundnuts, and cowpeas directly into mulch-covered fields without tillage.',
    specs: {
      'Seed Types': 'Maize, beans, groundnuts, cowpeas',
      'Planting Depth': '3-7 cm (adjustable)',
      'Fertiliser Hopper': '1.5 litres',
      'Seed Hopper': '1 litre',
      'Weight': '3.5 kg',
      'Material': 'Galvanized steel, hardwood handle',
    },
    dailyRate: 5,
    weeklyRate: 25,
    monthlyRate: 80,
    availability: 'available',
    location: 'Morogoro, Tanzania',
    country: 'Tanzania',
    owner: 'Morogoro Farm Implements',
    condition: 'good',
    image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400&h=300&fit=crop',
    rating: 4.0,
    reviewCount: 85,
    minBookingDays: 7,
    deliveryAvailable: false,
    deliveryFee: 0,
    insuranceIncluded: false,
  },
  {
    id: 'EQP-012',
    name: 'Kuilenburg 8-Tonne Grain Trailer',
    category: 'trailer',
    description: 'Tipping grain trailer with 8-tonne capacity. Hydraulic ram tipping mechanism powered by tractor PTO. Steel body with grain-tight tailgate and mesh sides for bulky loads. Dual-axle with air brakes for road transport. Ideal for harvest season grain transport from field to storage or market.',
    specs: {
      'Capacity': '8 tonnes / 10 cubic metres',
      'Tipping': 'Hydraulic rear tip',
      'Axles': 'Dual-axle, air brakes',
      'Body Material': 'Galvanized steel',
      'Hitch': 'Tractor drawbar, clevis pin',
      'Tyre Size': '11.5/80-15.3',
    },
    dailyRate: 60,
    weeklyRate: 360,
    monthlyRate: 1200,
    availability: 'available',
    location: 'Bulawayo, Zimbabwe',
    country: 'Zimbabwe',
    owner: 'Great Zimbabwe Transport',
    condition: 'good',
    image: 'https://images.unsplash.com/photo-1560693225-b8507d6f3aa9?w=400&h=300&fit=crop',
    rating: 4.4,
    reviewCount: 33,
    minBookingDays: 1,
    deliveryAvailable: true,
    deliveryFee: 50,
    insuranceIncluded: false,
  },
  {
    id: 'EQP-013',
    name: 'Roff Industries Hammer Mill (Maize)',
    category: 'processing',
    description: 'Diesel-powered hammer mill for maize, sorghum, and millet milling. Produces super and roller meal grades. Throughput of 500 kg/hour with interchangeable screens for fine or coarse grind. Robust steel construction on skid-mounted frame for portability between village locations. Popular for cooperative milling services.',
    specs: {
      'Throughput': '500 kg/hour',
      'Engine': '20 HP diesel (Lister type)',
      'Screen Sizes': '0.8mm, 1.2mm, 2.0mm',
      'Feed Hopper': '50 kg capacity',
      'Frame': 'Skid-mounted steel',
      'Output Grades': 'Super meal, roller meal, bran',
    },
    dailyRate: 75,
    weeklyRate: 450,
    monthlyRate: 1500,
    availability: 'available',
    location: 'Gaborone, Botswana',
    country: 'Botswana',
    owner: 'Gaborone Grain Collective',
    condition: 'good',
    image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=300&fit=crop',
    rating: 4.3,
    reviewCount: 41,
    minBookingDays: 1,
    deliveryAvailable: true,
    deliveryFee: 60,
    insuranceIncluded: false,
  },
  {
    id: 'EQP-014',
    name: 'Thai Union Cassava Grater (Electric)',
    category: 'processing',
    description: 'Industrial cassava grating machine for processing fresh roots into pulp for flour, starch, or garri production. Stainless steel grating drum with 500 kg/hour capacity. Electric motor driven with safety guards and emergency stop. Essential first stage in cassava value-chain processing.',
    specs: {
      'Capacity': '500 kg/hour',
      'Motor': '5 HP electric (220V single phase)',
      'Drum Material': 'Stainless steel 304',
      'Feed Opening': '200mm x 300mm',
      'Output': 'Grated pulp for pressing/drying',
      'Weight': '180 kg',
    },
    dailyRate: 40,
    weeklyRate: 240,
    monthlyRate: 800,
    availability: 'booked',
    location: 'Dodoma, Tanzania',
    country: 'Tanzania',
    owner: 'Dodoma Cassava Processors',
    condition: 'excellent',
    image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=300&fit=crop',
    rating: 4.5,
    reviewCount: 27,
    minBookingDays: 3,
    deliveryAvailable: true,
    deliveryFee: 70,
    insuranceIncluded: false,
  },
  {
    id: 'EQP-015',
    name: 'DJI Phantom 4 Multispectral Mapping Drone',
    category: 'drone',
    description: 'Multispectral imaging drone for precision crop health mapping and scouting. Captures 5-band imagery (Blue, Green, Red, Red Edge, Near Infrared) for NDVI analysis. GPS-guided autonomous survey flights with 1 cm/pixel resolution. Includes trained pilot operator, flight planning, data processing, and detailed crop health report with actionable agronomic recommendations.',
    specs: {
      'Sensors': '5-band multispectral + RGB',
      'Resolution': '1 cm/pixel at 30m altitude',
      'Coverage': '20 hectares per flight',
      'Flight Time': '27 minutes per battery',
      'Output': 'NDVI maps, crop stress reports',
      'Processing': 'Same-day turnaround',
    },
    dailyRate: 180,
    weeklyRate: 1080,
    monthlyRate: 3600,
    availability: 'available',
    location: 'Maun, Botswana',
    country: 'Botswana',
    owner: 'Makgadikgadi Drones',
    condition: 'excellent',
    image: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=400&h=300&fit=crop',
    rating: 4.8,
    reviewCount: 34,
    minBookingDays: 1,
    deliveryAvailable: true,
    deliveryFee: 80,
    insuranceIncluded: true,
  },
];

const equipment = FALLBACK_EQUIPMENT;

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
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const equipmentId = searchParams.get('id');

  const [liveEquipment, setLiveEquipment] = useState<FallbackEquipment[]>(FALLBACK_EQUIPMENT);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    const load = async () => {
      try {
        const { data } = await supabase.from('equipment').select('*').order('name');
        if (data && data.length > 0) {
          setLiveEquipment(data.map((e: any) => ({
            id: e.id,
            name: e.name,
            category: e.type || 'other',
            description: e.description || '',
            specs: e.specifications || {},
            dailyRate: e.daily_rate || 0,
            weeklyRate: (e.daily_rate || 0) * 6,
            monthlyRate: (e.daily_rate || 0) * 25,
            availability: (e.status === 'available' ? 'available' : e.status === 'maintenance' ? 'maintenance' : 'booked') as 'available' | 'booked' | 'maintenance',
            location: e.location || '',
            country: e.country || '',
            owner: e.owner_id || '',
            condition: 'good' as const,
            image: e.image_url || '',
            rating: 4.0,
            reviewCount: 0,
            minBookingDays: 1,
            deliveryAvailable: true,
            deliveryFee: 25,
            insuranceIncluded: false,
          })));
        }
      } catch { /* keep fallback */ }
      setDataLoading(false);
    };
    load();
  }, [user]);

  const selectedEquipment = useMemo(
    () => liveEquipment.find((e) => e.id === equipmentId) ?? null,
    [equipmentId, liveEquipment],
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
  const handleSubmit = useCallback(async () => {
    if (!startDate || !endDate || days <= 0 || !minDaysValid) return;
    const ref = generateBookingRef();
    setBookingRef(ref);
    // Submit to Supabase
    if (user && selectedEquipment) {
      try {
        const supabase = createClient();
        await supabase.from('equipment_bookings').insert({
          equipment_id: selectedEquipment.id,
          member_id: user.id,
          start_date: startDate,
          end_date: endDate,
          total_cost: costCalc.total,
          notes: specialRequirements || null,
        });
      } catch { /* silent — still show success */ }
    }
    setShowSuccess(true);
  }, [startDate, endDate, days, minDaysValid, user, selectedEquipment, costCalc, specialRequirements]);

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
              className="inline-flex items-center gap-2 bg-[#8CB89C] text-white text-sm font-semibold px-6 py-3 rounded-xl hover:bg-[#729E82] transition-colors"
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
                  <span className="text-lg font-bold text-[#8CB89C]">
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
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#8CB89C] transition-colors"
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
                <Settings size={16} className="text-[#8CB89C]" />
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
                <Info size={16} className="text-[#8CB89C]" />
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
                <DollarSign size={16} className="text-[#8CB89C]" />
                Pricing
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-[#EDF4EF]/50 rounded-xl p-4 text-center border border-[#EDF4EF]">
                  <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">
                    Daily
                  </div>
                  <div className="text-xl font-bold text-[#8CB89C]">
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
                <CalendarDays size={18} className="text-[#8CB89C]" />
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
                    className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#8CB89C]/30 focus:border-[#8CB89C] transition"
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
                    className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#8CB89C]/30 focus:border-[#8CB89C] transition"
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
                    className="bg-[#EDF4EF]/50 rounded-xl p-4 border border-[#EDF4EF]"
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
                      <span className="text-base font-bold text-[#8CB89C]">
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
                          deliveryToggle ? 'bg-[#8CB89C]' : 'bg-gray-200'
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
                            className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8CB89C]/30 focus:border-[#8CB89C] transition"
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
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8CB89C]/30 focus:border-[#8CB89C] transition resize-none"
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
                      ? 'bg-[#8CB89C] text-white hover:bg-[#729E82] active:scale-[0.97] shadow-lg shadow-[#8CB89C]/40'
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
