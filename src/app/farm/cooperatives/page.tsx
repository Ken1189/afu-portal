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
import { useCooperatives } from '@/lib/supabase/use-cooperatives';

// ---------------------------------------------------------------------------
// Types (inlined from @/lib/data/cooperatives)
// ---------------------------------------------------------------------------

interface Cooperative {
  id: string;
  name: string;
  type: 'crop' | 'livestock' | 'mixed' | 'processing' | 'marketing';
  region: string;
  country: 'Botswana' | 'Zimbabwe' | 'Tanzania';
  description: string;
  established: number;
  memberCount: number;
  chairman: string;
  contactEmail: string;
  contactPhone: string;
  totalHectares: number;
  mainCrops: string[];
  annualRevenue: number;
  certifications: string[];
  logo: string;
  meetingSchedule: string;
  bankBalance: number;
  status: 'active' | 'forming' | 'suspended';
}

interface CooperativeActivity {
  id: string;
  cooperativeId: string;
  type: 'meeting' | 'purchase' | 'sale' | 'training' | 'distribution' | 'harvest' | 'payment';
  description: string;
  date: string;
  amount: number | null;
  participants: number;
}

// ---------------------------------------------------------------------------
// Inline adaptCooperative (from @/lib/data/adapters)
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function adaptCooperative(row: Record<string, any>): Cooperative {
  return {
    id: row.id,
    name: row.name || '',
    type: 'mixed' as const,
    region: row.region || '',
    country: row.country || 'Botswana',
    description: row.description || '',
    established: row.created_at ? new Date(row.created_at).getFullYear() : 2024,
    memberCount: row.member_count || 0,
    chairman: '',
    contactEmail: '',
    contactPhone: '',
    totalHectares: 0,
    mainCrops: [],
    annualRevenue: 0,
    certifications: [],
    logo: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=200&h=200&fit=crop',
    meetingSchedule: '',
    bankBalance: 0,
    status: 'active' as const,
  };
}

// ---------------------------------------------------------------------------
// Inline fallback data (from @/lib/data/cooperatives)
// ---------------------------------------------------------------------------

const mockCooperatives: Cooperative[] = [
  {
    id: 'COOP-001', name: 'Gaborone Grain Collective', type: 'crop', region: 'South-East District', country: 'Botswana',
    description: 'Established cooperative of smallholder grain farmers in the greater Gaborone area focused on dryland sorghum and millet production. Members benefit from bulk input purchasing, shared storage facilities, and collective marketing agreements with the Botswana Agricultural Marketing Board. The collective has invested heavily in drought-resistant seed varieties suited to the semi-arid conditions of southern Botswana.',
    established: 2017, memberCount: 45, chairman: 'Kgosi Mosweu', contactEmail: 'info@gaboronegrain.co.bw', contactPhone: '+267 391 2045',
    totalHectares: 1280, mainCrops: ['sorghum', 'millet'], annualRevenue: 245000, certifications: ['BAMB Registered', 'Fair Trade Pending'],
    logo: 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=200&h=200&fit=crop', meetingSchedule: 'Every 2nd Saturday', bankBalance: 42350, status: 'active',
  },
  {
    id: 'COOP-002', name: 'Mashonaland Blueberry Co-op', type: 'crop', region: 'Mashonaland East', country: 'Zimbabwe',
    description: 'Specialist high-value crop cooperative producing export-grade blueberries and macadamia nuts in the fertile Marondera highlands. Members operate under GlobalGAP certification with established cold chain links to European and Middle Eastern markets. The co-op manages a central packhouse with grading, packing, and cold storage facilities funded through a joint development grant from the Zimbabwe Horticultural Promotion Council.',
    established: 2019, memberCount: 28, chairman: 'Tendai Moyo', contactEmail: 'exports@mashblueberry.co.zw', contactPhone: '+263 279 23456',
    totalHectares: 340, mainCrops: ['blueberries', 'macadamia'], annualRevenue: 680000, certifications: ['GlobalGAP', 'HACCP', 'Zimbabwe GAP'],
    logo: 'https://images.unsplash.com/photo-1498579809087-ef1e558fd1da?w=200&h=200&fit=crop', meetingSchedule: '1st Monday of each month', bankBalance: 128400, status: 'active',
  },
  {
    id: 'COOP-003', name: 'Dodoma Cassava Processors', type: 'processing', region: 'Dodoma Region', country: 'Tanzania',
    description: 'Value-addition cooperative specialising in cassava processing for both domestic food markets and industrial starch production. Members grow and supply fresh cassava roots to the cooperative processing facility which produces high-quality cassava flour (HQCF), chips, and starch. The facility was established with USAID Tanzania Agricultural Productivity Programme support and now operates commercially with growing demand from bakeries and breweries across Tanzania.',
    established: 2015, memberCount: 62, chairman: 'Halima Msuya', contactEmail: 'dodoma.cassava@kilimo.co.tz', contactPhone: '+255 262 321 890',
    totalHectares: 890, mainCrops: ['cassava'], annualRevenue: 390000, certifications: ['TFDA Certified', 'Tanzania Bureau of Standards'],
    logo: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=200&h=200&fit=crop', meetingSchedule: 'Every 3rd Wednesday', bankBalance: 67200, status: 'active',
  },
  {
    id: 'COOP-004', name: 'Tuli Block Cattle Association', type: 'livestock', region: 'Central District', country: 'Botswana',
    description: 'Cattle ranching cooperative operating in the Tuli Block area along the Limpopo River. Members collectively manage grazing lands, veterinary services, and marketing of beef cattle through the Botswana Meat Commission. The association has pioneered rotational grazing practices to combat overgrazing and bush encroachment. Members share access to dipping facilities, breeding bulls, and transport for livestock auctions held quarterly in Francistown and Gaborone.',
    established: 2012, memberCount: 35, chairman: 'Boitumelo Ramotswe', contactEmail: 'tuli.cattle@agri.co.bw', contactPhone: '+267 241 8834',
    totalHectares: 4500, mainCrops: ['cattle'], annualRevenue: 520000, certifications: ['BMC Approved', 'EU Export Certified', 'Livestock Identification'],
    logo: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=200&h=200&fit=crop', meetingSchedule: 'Last Saturday of each month', bankBalance: 95600, status: 'active',
  },
  {
    id: 'COOP-005', name: 'Chimanimani Mixed Farming Co-op', type: 'mixed', region: 'Manicaland', country: 'Zimbabwe',
    description: 'Diversified farming cooperative in the Chimanimani District combining crop production with small livestock rearing. Members cultivate maize and beans on communal and A1 resettlement farms while maintaining goat herds for supplementary income. The co-op has developed a successful intercropping programme with legume-cereal rotations to improve soil fertility and reduce input costs. A recently completed goat breeding programme supplies improved Boer goat genetics to members at subsidised rates.',
    established: 2018, memberCount: 51, chairman: 'Rudo Chidyamakono', contactEmail: 'chimanimani.coop@zimfarm.co.zw', contactPhone: '+263 226 70123',
    totalHectares: 720, mainCrops: ['maize', 'beans', 'goats'], annualRevenue: 185000, certifications: ['AGRITEX Registered', 'Seed Co Partner'],
    logo: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=200&h=200&fit=crop', meetingSchedule: 'Every 2nd and 4th Thursday', bankBalance: 31800, status: 'active',
  },
  {
    id: 'COOP-006', name: 'Arusha Coffee Cooperative', type: 'marketing', region: 'Arusha Region', country: 'Tanzania',
    description: 'Premium coffee and tea marketing cooperative aggregating production from smallholder farms on the slopes of Mount Meru and the surrounding highlands. The cooperative operates a central wet mill and cupping laboratory to ensure quality consistency across member lots. Arabica coffee is marketed through direct trade agreements with specialty roasters in Europe and Japan, achieving significant price premiums over commodity auctions. Tea production is sold through the Mombasa Tea Auction.',
    established: 2010, memberCount: 78, chairman: 'Emmanuel Massawe', contactEmail: 'info@arushacoffee.co.tz', contactPhone: '+255 272 509 112',
    totalHectares: 1650, mainCrops: ['coffee', 'tea'], annualRevenue: 920000, certifications: ['Rainforest Alliance', 'UTZ Certified', 'Fair Trade', 'Organic (USDA)'],
    logo: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=200&h=200&fit=crop', meetingSchedule: '1st Saturday of each month', bankBalance: 214500, status: 'active',
  },
  {
    id: 'COOP-007', name: "Francistown Women's Farming Group", type: 'crop', region: 'North-East District', country: 'Botswana',
    description: 'Women-led cooperative focusing on vegetable and groundnut production in the peri-urban areas around Francistown. The group operates communal garden plots with drip irrigation and supplies fresh produce to local markets, schools, and hospital kitchens under contract. Members receive training in climate-smart agriculture through a partnership with the Botswana College of Agriculture. The group runs a savings and loan scheme to fund input purchases at the start of each planting season.',
    established: 2020, memberCount: 33, chairman: 'Gaone Baitshepi', contactEmail: 'ftown.women@gmail.com', contactPhone: '+267 241 7891',
    totalHectares: 95, mainCrops: ['vegetables', 'groundnuts'], annualRevenue: 78000, certifications: ['Women in Agriculture Network', 'BCA Partnership'],
    logo: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=200&h=200&fit=crop', meetingSchedule: 'Every Saturday morning', bankBalance: 18700, status: 'active',
  },
  {
    id: 'COOP-008', name: 'Masvingo Cotton Growers', type: 'crop', region: 'Masvingo', country: 'Zimbabwe',
    description: 'Cotton and sunflower producing cooperative in the dry lowveld region of Masvingo Province. Members grow cotton under contract farming arrangements with Cottco and supplement income with sunflower for oil pressing. The cooperative has negotiated favourable input loan terms and transport rates for its members. A recently established seed oil pressing facility processes sunflower and cotton seed on behalf of members, adding value at the cooperative level rather than selling raw seed to middlemen.',
    established: 2016, memberCount: 40, chairman: 'Tatenda Maposa', contactEmail: 'masvingo.cotton@zimcottco.co.zw', contactPhone: '+263 239 64321',
    totalHectares: 1100, mainCrops: ['cotton', 'sunflower'], annualRevenue: 310000, certifications: ['Cottco Contract Partner', 'Better Cotton Initiative'],
    logo: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=200&h=200&fit=crop', meetingSchedule: 'Every 1st and 3rd Tuesday', bankBalance: 54100, status: 'active',
  },
];

const cooperativeActivities: CooperativeActivity[] = [
  { id: 'CACT-001', cooperativeId: 'COOP-001', type: 'meeting', description: 'Annual General Meeting: Elected new committee, reviewed 2025 financials, approved 2026 planting budget of $48,000.', date: '2026-01-10', amount: null, participants: 38 },
  { id: 'CACT-002', cooperativeId: 'COOP-001', type: 'purchase', description: 'Bulk purchase of drought-resistant sorghum seed (Macia variety) - 120 bags at discounted member rate from Kalahari Seeds Co.', date: '2026-01-22', amount: 7020, participants: 45 },
  { id: 'CACT-003', cooperativeId: 'COOP-001', type: 'training', description: 'Conservation agriculture workshop led by BCA extension officer. Topics covered: minimum tillage, residue management, crop rotation benefits.', date: '2026-02-08', amount: 350, participants: 32 },
  { id: 'CACT-004', cooperativeId: 'COOP-001', type: 'sale', description: 'Sold 85 tonnes of sorghum grain to BAMB at P2,800/tonne. Proceeds distributed to contributing members.', date: '2026-03-05', amount: 23800, participants: 41 },
  { id: 'CACT-005', cooperativeId: 'COOP-002', type: 'meeting', description: 'Export planning meeting: Reviewed EU market requirements, confirmed cold chain logistics with Limpopo Valley Movers for 2026 season.', date: '2025-11-15', amount: null, participants: 24 },
  { id: 'CACT-006', cooperativeId: 'COOP-002', type: 'harvest', description: 'Early season blueberry harvest commenced. First picking across 12 member farms yielded 8.4 tonnes of export-grade berries.', date: '2026-01-20', amount: null, participants: 28 },
  { id: 'CACT-007', cooperativeId: 'COOP-002', type: 'sale', description: 'Exported 6.2 tonnes of premium blueberries to Rotterdam via Harare airport cold chain. Grade A pricing at $8.50/kg.', date: '2026-02-07', amount: 52700, participants: 22 },
  { id: 'CACT-008', cooperativeId: 'COOP-002', type: 'payment', description: 'Member payout for January-February export sales. Payments deposited to 22 contributing members via EcoCash mobile money.', date: '2026-02-28', amount: 47430, participants: 22 },
  { id: 'CACT-009', cooperativeId: 'COOP-002', type: 'purchase', description: 'Purchased 500 clamshell punnet trays and 200 export cartons for ongoing harvest season from Ngorongoro Packaging.', date: '2026-03-01', amount: 3850, participants: 28 },
  { id: 'CACT-010', cooperativeId: 'COOP-003', type: 'training', description: 'Cassava processing hygiene and food safety training conducted by TFDA inspector. All processing staff certified for 2026.', date: '2025-12-05', amount: 800, participants: 48 },
  { id: 'CACT-011', cooperativeId: 'COOP-003', type: 'harvest', description: 'Peak season cassava harvest. Members delivered 142 tonnes of fresh roots to the processing facility over a two-week period.', date: '2026-01-15', amount: null, participants: 55 },
  { id: 'CACT-012', cooperativeId: 'COOP-003', type: 'sale', description: 'Sold 28 tonnes of high-quality cassava flour (HQCF) to Bakhresa Group bakeries in Dar es Salaam at $420/tonne.', date: '2026-02-12', amount: 11760, participants: 62 },
  { id: 'CACT-013', cooperativeId: 'COOP-003', type: 'purchase', description: 'Purchased replacement grater blades and drying racks for processing facility. Maintenance budget allocation.', date: '2026-02-25', amount: 2100, participants: 8 },
  { id: 'CACT-014', cooperativeId: 'COOP-003', type: 'distribution', description: 'Distributed 18 tonnes of cassava stem cuttings (improved variety TME 419) to members for 2026 planting season.', date: '2026-03-10', amount: null, participants: 58 },
  { id: 'CACT-015', cooperativeId: 'COOP-004', type: 'meeting', description: 'Quarterly livestock auction planning meeting. Agreed to send 180 head to Francistown BMC auction in March.', date: '2025-12-20', amount: null, participants: 30 },
  { id: 'CACT-016', cooperativeId: 'COOP-004', type: 'purchase', description: 'Bulk purchase of veterinary supplies: vaccines (FMD, anthrax), dip chemicals, and deworming medication for the dry season.', date: '2026-01-08', amount: 12400, participants: 35 },
  { id: 'CACT-017', cooperativeId: 'COOP-004', type: 'sale', description: 'Sold 180 head of cattle at Francistown BMC auction. Average price P8,200 per head. Total gross proceeds shared among 28 sellers.', date: '2026-03-08', amount: 147600, participants: 28 },
  { id: 'CACT-018', cooperativeId: 'COOP-004', type: 'training', description: 'Rotational grazing and veld management workshop. Facilitated by Department of Animal Production with GPS paddock mapping demonstration.', date: '2026-02-15', amount: 500, participants: 26 },
  { id: 'CACT-019', cooperativeId: 'COOP-005', type: 'distribution', description: 'Distributed hybrid maize seed (PAN 4M-21) and inoculant-treated bean seed to members for 2025/2026 summer planting season.', date: '2025-11-20', amount: null, participants: 48 },
  { id: 'CACT-020', cooperativeId: 'COOP-005', type: 'purchase', description: 'Purchased 200 bags of NPK 15-15-15 compound fertilizer and 150 bags of ammonium nitrate for top dressing at bulk discount.', date: '2025-11-25', amount: 15750, participants: 51 },
  { id: 'CACT-021', cooperativeId: 'COOP-005', type: 'harvest', description: 'First maize harvest of the season. Members reported above-average yields of 4.2 tonnes/hectare due to good rains.', date: '2026-03-12', amount: null, participants: 44 },
  { id: 'CACT-022', cooperativeId: 'COOP-005', type: 'training', description: 'Goat husbandry and breeding management training. Introduction of improved Boer buck genetics to 15 member herds.', date: '2026-01-18', amount: 600, participants: 22 },
  { id: 'CACT-023', cooperativeId: 'COOP-006', type: 'sale', description: 'Direct trade shipment of 12 tonnes Arabica coffee (AA grade) to specialty roaster in Berlin. Contract price $6.20/kg FOB Dar es Salaam.', date: '2025-12-18', amount: 74400, participants: 65 },
  { id: 'CACT-024', cooperativeId: 'COOP-006', type: 'meeting', description: 'Annual cupping session and quality review. Graded member lots for 2026 season allocation. Top 10 lots selected for specialty auction.', date: '2026-01-12', amount: null, participants: 72 },
  { id: 'CACT-025', cooperativeId: 'COOP-006', type: 'payment', description: 'Second payment tranche for 2025 coffee season. Members received 70% of final sale proceeds via bank transfer.', date: '2026-02-01', amount: 189000, participants: 74 },
  { id: 'CACT-026', cooperativeId: 'COOP-006', type: 'training', description: 'Shade-grown coffee management and organic certification renewal training. Led by Rainforest Alliance auditor.', date: '2026-02-22', amount: 1200, participants: 56 },
  { id: 'CACT-027', cooperativeId: 'COOP-006', type: 'sale', description: 'Sold 8.5 tonnes of CTC black tea through Mombasa Tea Auction at $2.80/kg average. Proceeds pending settlement.', date: '2026-03-04', amount: 23800, participants: 35 },
  { id: 'CACT-028', cooperativeId: 'COOP-007', type: 'purchase', description: 'Purchased drip irrigation kits (10 units) for new garden plots from Chobe Irrigation Systems. Group savings fund used.', date: '2025-12-10', amount: 16500, participants: 33 },
  { id: 'CACT-029', cooperativeId: 'COOP-007', type: 'sale', description: 'Weekly vegetable supply to Nyangabgwe Hospital kitchen and 3 Francistown primary schools. January invoice settled.', date: '2026-01-31', amount: 4200, participants: 28 },
  { id: 'CACT-030', cooperativeId: 'COOP-007', type: 'training', description: 'Financial literacy and savings group management workshop. Facilitated by Barclays Bank Botswana community programme.', date: '2026-02-08', amount: null, participants: 31 },
  { id: 'CACT-031', cooperativeId: 'COOP-007', type: 'harvest', description: 'Groundnut harvest from 22 hectares of communal plots. Total yield 18 tonnes, allocated proportionally to contributing members.', date: '2026-03-14', amount: null, participants: 30 },
  { id: 'CACT-032', cooperativeId: 'COOP-008', type: 'purchase', description: 'Seasonal input loan disbursement: cotton seed, fertilizer, and pesticides supplied by Cottco under contract farming terms.', date: '2025-11-10', amount: 28000, participants: 40 },
  { id: 'CACT-033', cooperativeId: 'COOP-008', type: 'meeting', description: 'Mid-season review meeting. Discussed pest pressure from bollworm, approved emergency spraying budget of $3,200.', date: '2026-01-25', amount: null, participants: 36 },
  { id: 'CACT-034', cooperativeId: 'COOP-008', type: 'harvest', description: 'Cotton picking season commenced. First bales delivered to Cottco collection point. Expected total harvest of 220 tonnes seed cotton.', date: '2026-03-01', amount: null, participants: 40 },
  { id: 'CACT-035', cooperativeId: 'COOP-008', type: 'sale', description: 'Sold 45 tonnes of sunflower seed to National Foods oil pressing plant in Harare at $380/tonne.', date: '2026-02-18', amount: 17100, participants: 25 },
  { id: 'CACT-036', cooperativeId: 'COOP-008', type: 'payment', description: 'Cottco first payment for early-season cotton deliveries. Net payment after input loan deduction distributed to 18 members.', date: '2026-03-15', amount: 32400, participants: 18 },
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
  const { cooperatives: liveCoops, loading: coopsLoading } = useCooperatives();
  const cooperatives: Cooperative[] = liveCoops.length > 0 ? liveCoops.map(adaptCooperative) as Cooperative[] : mockCooperatives;

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
