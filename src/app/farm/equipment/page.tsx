'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useEquipment, useEquipmentBookings, EquipmentRow } from '@/lib/supabase/use-equipment';
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
// ---------------------------------------------------------------------------
// Fallback data (inlined from @/lib/data/equipment)
// ---------------------------------------------------------------------------

type EquipmentCategory = 'tractor' | 'harvester' | 'irrigation' | 'sprayer' | 'planter' | 'trailer' | 'processing' | 'drone';

interface Equipment {
  id: string;
  name: string;
  category: EquipmentCategory;
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

interface EquipmentBooking {
  id: string;
  equipmentId: string;
  equipmentName: string;
  farmerId: string;
  farmerName: string;
  startDate: string;
  endDate: string;
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
  totalCost: number;
  deliveryRequested: boolean;
  notes: string;
}

const FALLBACK_EQUIPMENT: Equipment[] = [
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
    image: 'https://images.unsplash.com/photo-1605338198618-1773c1f7500e?w=400&h=300&fit=crop',
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

const FALLBACK_EQUIPMENT_BOOKINGS: EquipmentBooking[] = [
  {
    id: 'EBOK-001',
    equipmentId: 'EQP-002',
    equipmentName: 'Massey Ferguson 250 Utility Tractor',
    farmerId: 'AFU-2024-003',
    farmerName: 'Tendai Moyo',
    startDate: '2026-03-10',
    endDate: '2026-03-20',
    status: 'active',
    totalCost: 935,
    deliveryRequested: true,
    notes: 'Ploughing and harrowing 25 hectares for blueberry field expansion. Delivery to Marondera farm gate.',
  },
  {
    id: 'EBOK-002',
    equipmentId: 'EQP-007',
    equipmentName: 'Valley 8000 Series Center Pivot',
    farmerId: 'AFU-2024-001',
    farmerName: 'Kgosi Mosweu',
    startDate: '2026-01-15',
    endDate: '2026-04-15',
    status: 'active',
    totalCost: 10500,
    deliveryRequested: false,
    notes: 'Seasonal irrigation contract for 50-hectare sorghum block. Pivot already installed on-site from previous season.',
  },
  {
    id: 'EBOK-003',
    equipmentId: 'EQP-014',
    equipmentName: 'Thai Union Cassava Grater (Electric)',
    farmerId: 'AFU-2024-044',
    farmerName: 'Halima Msuya',
    startDate: '2026-03-01',
    endDate: '2026-03-31',
    status: 'active',
    totalCost: 800,
    deliveryRequested: true,
    notes: 'Peak cassava processing season. Cooperative processing facility running double shifts to handle 142-tonne harvest.',
  },
  {
    id: 'EBOK-004',
    equipmentId: 'EQP-009',
    equipmentName: 'DJI Agras T30 Spray Drone',
    farmerId: 'AFU-2024-040',
    farmerName: 'Munyaradzi Hove',
    startDate: '2026-02-18',
    endDate: '2026-02-20',
    status: 'completed',
    totalCost: 660,
    deliveryRequested: true,
    notes: 'Emergency bollworm spray on 48 hectares of cotton. Lambda-cyhalothrin application completed in 2 days. Excellent coverage reported.',
  },
  {
    id: 'EBOK-005',
    equipmentId: 'EQP-003',
    equipmentName: 'New Holland TD80 4WD Tractor',
    farmerId: 'AFU-2024-038',
    farmerName: 'Emmanuel Massawe',
    startDate: '2026-01-05',
    endDate: '2026-01-18',
    status: 'completed',
    totalCost: 2220,
    deliveryRequested: true,
    notes: 'Land preparation for new coffee nursery blocks. Deep ripping and disc ploughing on 30 hectares of highland slopes near Meru.',
  },
  {
    id: 'EBOK-006',
    equipmentId: 'EQP-015',
    equipmentName: 'DJI Phantom 4 Multispectral Mapping Drone',
    farmerId: 'AFU-2024-037',
    farmerName: 'Rudo Chidyamakono',
    startDate: '2026-03-18',
    endDate: '2026-03-18',
    status: 'confirmed',
    totalCost: 260,
    deliveryRequested: true,
    notes: 'NDVI crop health survey of 40-hectare maize block. Checking for fall armyworm damage zones identified by scouts.',
  },
  {
    id: 'EBOK-007',
    equipmentId: 'EQP-005',
    equipmentName: 'Penagos TPH-30 Maize Sheller',
    farmerId: 'AFU-2024-009',
    farmerName: 'Tapiwa Ncube',
    startDate: '2026-03-22',
    endDate: '2026-03-28',
    status: 'confirmed',
    totalCost: 435,
    deliveryRequested: true,
    notes: 'Post-harvest maize shelling for 60-tonne harvest. Delivery to Hwange farm. Will need diesel fuel provision on-site.',
  },
  {
    id: 'EBOK-008',
    equipmentId: 'EQP-010',
    equipmentName: 'John Deere 1750 Precision Planter (4-Row)',
    farmerId: 'AFU-2024-030',
    farmerName: 'Tatenda Maposa',
    startDate: '2026-04-01',
    endDate: '2026-04-10',
    status: 'pending',
    totalCost: 1285,
    deliveryRequested: true,
    notes: 'Planting 80 hectares of sunflower for oil production. Planter currently in maintenance - awaiting confirmation of availability.',
  },
  {
    id: 'EBOK-009',
    equipmentId: 'EQP-001',
    equipmentName: 'Changfa 15HP Walk-Behind Tractor',
    farmerId: 'AFU-2024-042',
    farmerName: 'Phenyo Kebonye',
    startDate: '2026-02-01',
    endDate: '2026-02-14',
    status: 'completed',
    totalCost: 520,
    deliveryRequested: true,
    notes: 'Ridging and bed preparation for 3 hectares of vegetable gardens near Francistown. Farmer very satisfied with machine performance.',
  },
  {
    id: 'EBOK-010',
    equipmentId: 'EQP-008',
    equipmentName: 'Jacto Condor 600L Boom Sprayer',
    farmerId: 'AFU-2024-047',
    farmerName: 'Joseph Mwangosi',
    startDate: '2026-03-25',
    endDate: '2026-03-27',
    status: 'pending',
    totalCost: 220,
    deliveryRequested: false,
    notes: 'Pre-emergence herbicide application on 60-hectare soybean block. Farmer will collect sprayer from Chinhoyi depot.',
  },
];

// ---------------------------------------------------------------------------
// Map Supabase rows to local Equipment shape (with sensible defaults for
// fields that don't exist in the DB schema yet)
// ---------------------------------------------------------------------------

function mapRowToEquipment(row: EquipmentRow): Equipment {
  const specs: Record<string, string> = {};
  if (row.specifications && typeof row.specifications === 'object') {
    for (const [k, v] of Object.entries(row.specifications)) {
      specs[k] = String(v);
    }
  }

  // Map DB type to local category (best-effort match)
  const typeMap: Record<string, EquipmentCategory> = {
    tractor: 'tractor',
    harvester: 'harvester',
    irrigation: 'irrigation',
    sprayer: 'sprayer',
    planter: 'planter',
    trailer: 'trailer',
    processing: 'processing',
    drone: 'drone',
  };
  const category: EquipmentCategory =
    typeMap[(row.type || '').toLowerCase()] || 'tractor';

  // Map DB status to local availability
  const statusMap: Record<string, Equipment['availability']> = {
    available: 'available',
    booked: 'booked',
    maintenance: 'maintenance',
    rented: 'booked',
    unavailable: 'maintenance',
  };
  const availability: Equipment['availability'] =
    statusMap[(row.status || '').toLowerCase()] || 'available';

  const dailyRate = row.daily_rate ?? 0;

  return {
    id: row.id,
    name: row.name,
    category,
    description: row.description || '',
    specs,
    dailyRate,
    weeklyRate: Math.round(dailyRate * 6),
    monthlyRate: Math.round(dailyRate * 25),
    availability,
    location: row.location || 'Unknown',
    country: (row.country || 'Unknown') as Equipment['country'],
    owner: 'AFU Equipment Pool',
    condition: 'good',
    image:
      row.image_url ||
      'https://images.unsplash.com/photo-1530267981375-f0de937f5f13?w=400&h=300&fit=crop',
    rating: 4.5,
    reviewCount: 0,
    minBookingDays: 1,
    deliveryAvailable: true,
    deliveryFee: Math.round(dailyRate * 0.5),
    insuranceIncluded: false,
  };
}

// equipmentBookings is now resolved dynamically inside the component via useEquipmentBookings

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

function getCategoryCount(cat: CategoryFilter, equipmentList: Equipment[]): number {
  if (cat === 'all') return equipmentList.length;
  return equipmentList.filter((e) => e.category === cat).length;
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
            <span className="text-lg font-bold text-[#8CB89C]">
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
              className="w-full h-10 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 bg-[#8CB89C] text-white hover:bg-[#729E82] active:scale-[0.97] transition-all"
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
              className="flex-1 h-9 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 bg-[#8CB89C] text-white hover:bg-[#729E82] transition-colors"
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
  // --- Supabase data ---
  const {
    equipment: dbEquipment,
    loading: dbLoading,
    error: dbError,
  } = useEquipment();

  // Map DB rows to local shape; fall back to mock when DB returns nothing
  const equipment: Equipment[] = useMemo(() => {
    if (dbEquipment.length > 0) return dbEquipment.map(mapRowToEquipment);
    if (dbLoading) return []; // will show skeleton
    return FALLBACK_EQUIPMENT; // fallback when DB is empty / errored
  }, [dbEquipment, dbLoading]);

  // --- State ---
  const [activeTab, setActiveTab] = useState<TabKey>('browse');
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('rating');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [bookingFilter, setBookingFilter] = useState<BookingFilter>('all');
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  // --- Supabase bookings ---
  const { bookings: dbBookings, loading: bookingsLoading, cancelBooking } = useEquipmentBookings();

  const bookings: EquipmentBooking[] = useMemo(() => {
    if (dbBookings.length > 0) {
      return dbBookings.map((b) => ({
        id: b.id,
        equipmentId: b.equipment_id,
        equipmentName: b.equipment?.name || 'Equipment',
        farmerId: b.member_id,
        farmerName: '',
        startDate: b.start_date,
        endDate: b.end_date,
        status: b.status as EquipmentBooking['status'],
        totalCost: b.total_cost,
        deliveryRequested: false,
        notes: b.notes || '',
      }));
    }
    if (bookingsLoading) return [];
    return FALLBACK_EQUIPMENT_BOOKINGS;
  }, [dbBookings, bookingsLoading]);

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
  }, [equipment, selectedCategory, searchQuery, sortKey]);

  const filteredBookings = useMemo(() => {
    if (bookingFilter === 'all') return bookings;
    return bookings.filter((b) => b.status === bookingFilter);
  }, [bookingFilter, bookings]);

  const savedEquipment = useMemo(
    () => equipment.filter((e) => savedIds.has(e.id)),
    [equipment, savedIds],
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
      equipment.length > 0
        ? equipment.reduce((sum, e) => sum + e.rating, 0) / equipment.length
        : 0;

    return { availableCount, activeRentals, thisMonthSpent, avgRating };
  }, [equipment, bookings]);

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

  const handleCancelBooking = async (id: string) => {
    await cancelBooking(id);
  };

  const handleExtendBooking = (_id: string) => {
    // Extension requires backend support — no-op for now
    // In a full implementation this would call an update endpoint
    void _id;
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
        className="bg-gradient-to-br from-[#1B2A4A] via-[#1B2A4A] to-[#8CB89C]/30 text-white"
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
              icon: <Package size={20} className="text-[#8CB89C]" />,
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
                  const count = getCategoryCount(cat.key, equipment);
                  const isActive = selectedCategory === cat.key;
                  return (
                    <button
                      key={cat.key}
                      onClick={() => setSelectedCategory(cat.key)}
                      className={`flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl whitespace-nowrap transition-all border ${
                        isActive
                          ? 'bg-[#1B2A4A] text-white border-[#1B2A4A] shadow-sm'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-[#8CB89C] hover:text-[#8CB89C]'
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
                    className="w-full h-10 pl-9 pr-4 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8CB89C]/30 focus:border-[#8CB89C] transition"
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
                    className="flex items-center gap-2 h-10 px-4 rounded-xl border border-gray-200 bg-white text-sm text-gray-600 hover:border-[#8CB89C] transition-colors"
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
                                ? 'text-[#8CB89C] font-semibold bg-teal-50/50'
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
                {dbLoading ? 'Loading equipment...' : `Showing ${filteredEquipment.length} of ${equipment.length} items`}
              </div>

              {/* Loading skeleton */}
              {dbLoading ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="rounded-2xl bg-white border border-gray-100 overflow-hidden animate-pulse"
                    >
                      <div className="h-48 bg-gray-200" />
                      <div className="p-4 space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-3 bg-gray-100 rounded w-1/2" />
                        <div className="h-3 bg-gray-100 rounded w-full" />
                        <div className="h-3 bg-gray-100 rounded w-5/6" />
                        <div className="flex gap-2 mt-3">
                          <div className="h-6 bg-gray-100 rounded-lg w-20" />
                          <div className="h-6 bg-gray-100 rounded-lg w-20" />
                        </div>
                        <div className="border-t border-gray-100 pt-3 mt-3">
                          <div className="h-5 bg-gray-200 rounded w-1/3" />
                        </div>
                        <div className="h-10 bg-gray-200 rounded-xl w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : /* Equipment grid */
              filteredEquipment.length > 0 ? (
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
                    className="mt-4 text-xs font-semibold text-[#8CB89C] hover:underline"
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
                          : 'bg-white text-gray-600 border-gray-200 hover:border-[#8CB89C] hover:text-[#8CB89C]'
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
                    className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#8CB89C] hover:underline"
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
                    className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#8CB89C] hover:underline"
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
