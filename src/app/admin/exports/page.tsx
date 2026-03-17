'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Ship,
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  Package,
  Globe,
  DollarSign,
  TrendingUp,
  MapPin,
  ShieldCheck,
  FileText,
  Eye,
  MoreHorizontal,
  Clock,
  ArrowUpDown,
  AlertCircle,
  CheckCircle2,
  Truck,
  Anchor,
  XCircle,
  Loader2,
  BarChart3,
  PieChart,
} from 'lucide-react';

// ── Animation variants ──────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 260,
      damping: 24,
    },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
};

// ── Types ───────────────────────────────────────────────────────────────────

type ShipmentStatus = 'loading' | 'in-transit' | 'delivered' | 'customs-hold' | 'cancelled';
type PipelineStage = 'booking' | 'documentation' | 'loading' | 'in-transit' | 'customs' | 'delivered';

interface Shipment {
  id: string;
  reference: string;
  memberId: string;
  memberName: string;
  product: string;
  destination: string;
  destinationPort: string;
  originPort: string;
  status: ShipmentStatus;
  pipelineStage: PipelineStage;
  value: number;
  currency: string;
  quantity: string;
  vessel: string | null;
  etd: string;
  eta: string;
  documentsComplete: number;
  documentsTotal: number;
  country: string;
}

// ── Mock Data ───────────────────────────────────────────────────────────────

const mockShipments: Shipment[] = [
  {
    id: 'SHP-001',
    reference: 'AFU-EXP-2026-001',
    memberId: 'AFU-2024-037',
    memberName: 'Rudo Chidyamakono',
    product: 'Flue-Cured Virginia Tobacco',
    destination: 'Netherlands',
    destinationPort: 'Rotterdam',
    originPort: 'Beira, Mozambique',
    status: 'in-transit',
    pipelineStage: 'in-transit',
    value: 216000,
    currency: 'USD',
    quantity: '36,000 kg',
    vessel: 'MV Maersk Seletar',
    etd: '2026-03-02',
    eta: '2026-03-28',
    documentsComplete: 4,
    documentsTotal: 4,
    country: 'Zimbabwe',
  },
  {
    id: 'SHP-002',
    reference: 'AFU-EXP-2026-002',
    memberId: 'AFU-2024-041',
    memberName: 'Grace Kilango',
    product: 'White Sesame Seeds (hulled)',
    destination: 'United Arab Emirates',
    destinationPort: 'Jebel Ali, Dubai',
    originPort: 'Dar es Salaam, Tanzania',
    status: 'loading',
    pipelineStage: 'loading',
    value: 123200,
    currency: 'USD',
    quantity: '44,000 kg',
    vessel: 'MSC Anzu',
    etd: '2026-03-18',
    eta: '2026-04-02',
    documentsComplete: 3,
    documentsTotal: 5,
    country: 'Tanzania',
  },
  {
    id: 'SHP-003',
    reference: 'AFU-EXP-2026-003',
    memberId: 'AFU-2024-047',
    memberName: 'Joseph Mwangosi',
    product: 'Fresh Cut Flowers',
    destination: 'Netherlands',
    destinationPort: 'Amsterdam (Schiphol)',
    originPort: 'Julius Nyerere Intl, Dar',
    status: 'customs-hold',
    pipelineStage: 'customs',
    value: 94500,
    currency: 'USD',
    quantity: '420 cartons',
    vessel: null,
    etd: '2026-03-17',
    eta: '2026-03-18',
    documentsComplete: 3,
    documentsTotal: 3,
    country: 'Tanzania',
  },
  {
    id: 'SHP-004',
    reference: 'AFU-EXP-2026-004',
    memberId: 'AFU-2024-046',
    memberName: 'Blessing Murefu',
    product: 'Groundnuts (Virginia, Grade A)',
    destination: 'India',
    destinationPort: 'JNPT, Mumbai',
    originPort: 'Beira, Mozambique',
    status: 'loading',
    pipelineStage: 'documentation',
    value: 240000,
    currency: 'USD',
    quantity: '80,000 kg',
    vessel: null,
    etd: '2026-04-05',
    eta: '2026-04-25',
    documentsComplete: 1,
    documentsTotal: 5,
    country: 'Zimbabwe',
  },
  {
    id: 'SHP-005',
    reference: 'AFU-EXP-2026-005',
    memberId: 'AFU-2024-042',
    memberName: 'Phenyo Kebonye',
    product: 'Fresh Citrus (Oranges & Lemons)',
    destination: 'Saudi Arabia',
    destinationPort: 'Jeddah Islamic Port',
    originPort: 'Durban, South Africa',
    status: 'loading',
    pipelineStage: 'booking',
    value: 66000,
    currency: 'USD',
    quantity: '44,000 kg',
    vessel: null,
    etd: '2026-04-10',
    eta: '2026-05-02',
    documentsComplete: 0,
    documentsTotal: 6,
    country: 'Botswana',
  },
  {
    id: 'SHP-006',
    reference: 'AFU-EXP-2026-006',
    memberId: 'AFU-2024-047',
    memberName: 'Joseph Mwangosi',
    product: 'Mixed Spices (Cloves, Cardamom)',
    destination: 'Germany',
    destinationPort: 'Hamburg',
    originPort: 'Dar es Salaam, Tanzania',
    status: 'customs-hold',
    pipelineStage: 'customs',
    value: 162000,
    currency: 'USD',
    quantity: '18,000 kg',
    vessel: null,
    etd: '2026-03-22',
    eta: '2026-04-18',
    documentsComplete: 4,
    documentsTotal: 5,
    country: 'Tanzania',
  },
  {
    id: 'SHP-007',
    reference: 'AFU-EXP-2026-007',
    memberId: 'AFU-2024-050',
    memberName: 'Tariro Mhandu',
    product: 'Organic Cotton Lint',
    destination: 'China',
    destinationPort: 'Shanghai',
    originPort: 'Beira, Mozambique',
    status: 'in-transit',
    pipelineStage: 'in-transit',
    value: 385000,
    currency: 'USD',
    quantity: '110,000 kg',
    vessel: 'COSCO Harmony',
    etd: '2026-02-20',
    eta: '2026-03-25',
    documentsComplete: 6,
    documentsTotal: 6,
    country: 'Zimbabwe',
  },
  {
    id: 'SHP-008',
    reference: 'AFU-EXP-2026-008',
    memberId: 'AFU-2024-038',
    memberName: 'Amara Diallo',
    product: 'Shea Butter (Unrefined)',
    destination: 'France',
    destinationPort: 'Le Havre',
    originPort: 'Tema, Ghana',
    status: 'delivered',
    pipelineStage: 'delivered',
    value: 78500,
    currency: 'USD',
    quantity: '22,000 kg',
    vessel: 'CMA CGM Thalassa',
    etd: '2026-01-18',
    eta: '2026-02-12',
    documentsComplete: 5,
    documentsTotal: 5,
    country: 'Ghana',
  },
  {
    id: 'SHP-009',
    reference: 'AFU-EXP-2026-009',
    memberId: 'AFU-2024-044',
    memberName: 'Kwame Asante',
    product: 'Cocoa Beans (Grade 1)',
    destination: 'Belgium',
    destinationPort: 'Antwerp',
    originPort: 'Tema, Ghana',
    status: 'delivered',
    pipelineStage: 'delivered',
    value: 312000,
    currency: 'USD',
    quantity: '78,000 kg',
    vessel: 'MSC Gulsun',
    etd: '2026-01-25',
    eta: '2026-02-18',
    documentsComplete: 6,
    documentsTotal: 6,
    country: 'Ghana',
  },
  {
    id: 'SHP-010',
    reference: 'AFU-EXP-2026-010',
    memberId: 'AFU-2024-051',
    memberName: 'Fatima Osei',
    product: 'Cashew Nuts (Raw)',
    destination: 'Vietnam',
    destinationPort: 'Ho Chi Minh City',
    originPort: 'Dar es Salaam, Tanzania',
    status: 'in-transit',
    pipelineStage: 'in-transit',
    value: 198000,
    currency: 'USD',
    quantity: '55,000 kg',
    vessel: 'ONE Columba',
    etd: '2026-02-28',
    eta: '2026-03-22',
    documentsComplete: 5,
    documentsTotal: 5,
    country: 'Tanzania',
  },
  {
    id: 'SHP-011',
    reference: 'AFU-EXP-2026-011',
    memberId: 'AFU-2024-039',
    memberName: 'Tendai Moyo',
    product: 'Macadamia Nuts (Kernel)',
    destination: 'United States',
    destinationPort: 'Los Angeles',
    originPort: 'Durban, South Africa',
    status: 'delivered',
    pipelineStage: 'delivered',
    value: 420000,
    currency: 'USD',
    quantity: '28,000 kg',
    vessel: 'Evergreen Ace',
    etd: '2026-01-10',
    eta: '2026-02-15',
    documentsComplete: 7,
    documentsTotal: 7,
    country: 'Zimbabwe',
  },
  {
    id: 'SHP-012',
    reference: 'AFU-EXP-2026-012',
    memberId: 'AFU-2024-053',
    memberName: 'Nomsa Dlamini',
    product: 'Avocados (Hass)',
    destination: 'United Kingdom',
    destinationPort: 'Tilbury',
    originPort: 'Durban, South Africa',
    status: 'in-transit',
    pipelineStage: 'in-transit',
    value: 145000,
    currency: 'USD',
    quantity: '36,000 kg',
    vessel: 'Hapag-Lloyd Express',
    etd: '2026-03-05',
    eta: '2026-03-26',
    documentsComplete: 5,
    documentsTotal: 5,
    country: 'Zimbabwe',
  },
  {
    id: 'SHP-013',
    reference: 'AFU-EXP-2026-013',
    memberId: 'AFU-2024-048',
    memberName: 'Sipho Nkomo',
    product: 'Dried Mangoes',
    destination: 'Japan',
    destinationPort: 'Yokohama',
    originPort: 'Dar es Salaam, Tanzania',
    status: 'cancelled',
    pipelineStage: 'booking',
    value: 52000,
    currency: 'USD',
    quantity: '8,000 kg',
    vessel: null,
    etd: '2026-03-20',
    eta: '2026-04-18',
    documentsComplete: 0,
    documentsTotal: 5,
    country: 'Tanzania',
  },
  {
    id: 'SHP-014',
    reference: 'AFU-EXP-2026-014',
    memberId: 'AFU-2024-045',
    memberName: 'Chenai Mapfumo',
    product: 'Sugar Beans (Dry)',
    destination: 'South Africa',
    destinationPort: 'Durban',
    originPort: 'Beira, Mozambique',
    status: 'loading',
    pipelineStage: 'loading',
    value: 88000,
    currency: 'USD',
    quantity: '50,000 kg',
    vessel: 'Safmarine Ngami',
    etd: '2026-03-25',
    eta: '2026-04-02',
    documentsComplete: 3,
    documentsTotal: 4,
    country: 'Zimbabwe',
  },
  {
    id: 'SHP-015',
    reference: 'AFU-EXP-2026-015',
    memberId: 'AFU-2024-052',
    memberName: 'Keletso Molefe',
    product: 'Sorghum (Red)',
    destination: 'Kenya',
    destinationPort: 'Mombasa',
    originPort: 'Dar es Salaam, Tanzania',
    status: 'in-transit',
    pipelineStage: 'in-transit',
    value: 72000,
    currency: 'USD',
    quantity: '120,000 kg',
    vessel: 'PIL Taurus',
    etd: '2026-03-08',
    eta: '2026-03-14',
    documentsComplete: 4,
    documentsTotal: 4,
    country: 'Botswana',
  },
];

// ── Monthly export data for analytics ───────────────────────────────────────

const monthlyExportData = [
  { month: 'Jan', value: 810500, shipments: 3 },
  { month: 'Feb', value: 543000, shipments: 2 },
  { month: 'Mar', value: 1161700, shipments: 7 },
  { month: 'Apr', value: 306000, shipments: 2 },
  { month: 'May', value: 0, shipments: 0 },
  { month: 'Jun', value: 0, shipments: 0 },
];

const topDestinations = [
  { country: 'Netherlands', value: 310500, count: 2, percentage: 24 },
  { country: 'Germany', value: 162000, count: 1, percentage: 13 },
  { country: 'China', value: 385000, count: 1, percentage: 16 },
  { country: 'India', value: 240000, count: 1, percentage: 10 },
  { country: 'UAE', value: 123200, count: 1, percentage: 8 },
  { country: 'Belgium', value: 312000, count: 1, percentage: 13 },
  { country: 'Others', value: 489500, count: 5, percentage: 16 },
];

const topProducts = [
  { product: 'Macadamia Nuts', value: 420000, shipments: 1 },
  { product: 'Organic Cotton Lint', value: 385000, shipments: 1 },
  { product: 'Cocoa Beans', value: 312000, shipments: 1 },
  { product: 'Groundnuts', value: 240000, shipments: 1 },
  { product: 'Virginia Tobacco', value: 216000, shipments: 1 },
  { product: 'Cashew Nuts', value: 198000, shipments: 1 },
  { product: 'Mixed Spices', value: 162000, shipments: 1 },
  { product: 'Avocados', value: 145000, shipments: 1 },
];

const complianceIssues = [
  { type: 'Late documentation', count: 3, trend: 'up' },
  { type: 'Phyto cert delays', count: 2, trend: 'down' },
  { type: 'Customs holds', count: 2, trend: 'same' },
  { type: 'Quality rejections', count: 0, trend: 'down' },
];

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatCurrency(amount: number): string {
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(2)}M`;
  if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
  return `$${amount.toLocaleString()}`;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ── Status config ───────────────────────────────────────────────────────────

const statusConfig: Record<ShipmentStatus, { label: string; bgColor: string; textColor: string; icon: React.ReactNode }> = {
  loading: {
    label: 'Loading',
    bgColor: 'bg-blue-50 border-blue-200',
    textColor: 'text-blue-700',
    icon: <Loader2 className="w-3 h-3" />,
  },
  'in-transit': {
    label: 'In Transit',
    bgColor: 'bg-purple-50 border-purple-200',
    textColor: 'text-purple-700',
    icon: <Truck className="w-3 h-3" />,
  },
  delivered: {
    label: 'Delivered',
    bgColor: 'bg-green-50 border-green-200',
    textColor: 'text-green-700',
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
  'customs-hold': {
    label: 'Customs Hold',
    bgColor: 'bg-red-50 border-red-200',
    textColor: 'text-red-700',
    icon: <AlertCircle className="w-3 h-3" />,
  },
  cancelled: {
    label: 'Cancelled',
    bgColor: 'bg-gray-50 border-gray-200',
    textColor: 'text-gray-500',
    icon: <XCircle className="w-3 h-3" />,
  },
};

const pipelineStages: { key: PipelineStage; label: string; color: string; borderColor: string }[] = [
  { key: 'booking', label: 'Booking', color: 'bg-slate-100', borderColor: 'border-slate-300' },
  { key: 'documentation', label: 'Documentation', color: 'bg-amber-50', borderColor: 'border-amber-300' },
  { key: 'loading', label: 'Loading', color: 'bg-blue-50', borderColor: 'border-blue-300' },
  { key: 'in-transit', label: 'In Transit', color: 'bg-purple-50', borderColor: 'border-purple-300' },
  { key: 'customs', label: 'Customs', color: 'bg-orange-50', borderColor: 'border-orange-300' },
  { key: 'delivered', label: 'Delivered', color: 'bg-green-50', borderColor: 'border-green-300' },
];

// ═══════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function AdminExportsPage() {
  const [activeTab, setActiveTab] = useState<'shipments' | 'pipeline' | 'analytics'>('shipments');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [destinationFilter, setDestinationFilter] = useState<string>('all');
  const [productFilter, setProductFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<string>('reference');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  // ── Computed stats ──────────────────────────────────────────────────────

  const activeShipments = mockShipments.filter((s) => s.status !== 'cancelled' && s.status !== 'delivered');
  const inTransitCount = mockShipments.filter((s) => s.status === 'in-transit').length;
  const totalValue = mockShipments.filter((s) => s.status !== 'cancelled').reduce((sum, s) => sum + s.value, 0);
  const avgValue = Math.round(totalValue / mockShipments.filter((s) => s.status !== 'cancelled').length);

  const destinationCounts = mockShipments.reduce<Record<string, number>>((acc, s) => {
    if (s.status !== 'cancelled') {
      acc[s.destination] = (acc[s.destination] || 0) + 1;
    }
    return acc;
  }, {});
  const topDest = Object.entries(destinationCounts).sort(([, a], [, b]) => b - a)[0];

  const compliantShipments = mockShipments.filter((s) => s.status !== 'cancelled' && s.documentsComplete === s.documentsTotal).length;
  const totalNonCancelled = mockShipments.filter((s) => s.status !== 'cancelled').length;
  const complianceRate = Math.round((compliantShipments / totalNonCancelled) * 100);

  // ── Filter unique values ──────────────────────────────────────────────

  const uniqueDestinations = [...new Set(mockShipments.map((s) => s.destination))].sort();
  const uniqueProducts = [...new Set(mockShipments.map((s) => s.product))].sort();

  // ── Filtered & sorted shipments ───────────────────────────────────────

  const filteredShipments = useMemo(() => {
    let results = mockShipments.filter((s) => {
      if (statusFilter !== 'all' && s.status !== statusFilter) return false;
      if (destinationFilter !== 'all' && s.destination !== destinationFilter) return false;
      if (productFilter !== 'all' && s.product !== productFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          s.reference.toLowerCase().includes(q) ||
          s.memberName.toLowerCase().includes(q) ||
          s.product.toLowerCase().includes(q) ||
          s.destination.toLowerCase().includes(q)
        );
      }
      return true;
    });

    results.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'reference': cmp = a.reference.localeCompare(b.reference); break;
        case 'member': cmp = a.memberName.localeCompare(b.memberName); break;
        case 'product': cmp = a.product.localeCompare(b.product); break;
        case 'destination': cmp = a.destination.localeCompare(b.destination); break;
        case 'value': cmp = a.value - b.value; break;
        case 'etd': cmp = a.etd.localeCompare(b.etd); break;
        default: cmp = 0;
      }
      return sortDirection === 'asc' ? cmp : -cmp;
    });

    return results;
  }, [searchQuery, statusFilter, destinationFilter, productFilter, sortField, sortDirection]);

  // ── Sort handler ──────────────────────────────────────────────────────

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // ── Pipeline data ─────────────────────────────────────────────────────

  const pipelineData = useMemo(() => {
    const data: Record<PipelineStage, Shipment[]> = {
      booking: [],
      documentation: [],
      loading: [],
      'in-transit': [],
      customs: [],
      delivered: [],
    };
    mockShipments.filter((s) => s.status !== 'cancelled').forEach((s) => {
      data[s.pipelineStage].push(s);
    });
    return data;
  }, []);

  // ── Stat cards ────────────────────────────────────────────────────────

  const statCards = [
    {
      label: 'Total Shipments (YTD)',
      value: mockShipments.filter((s) => s.status !== 'cancelled').length.toString(),
      icon: <Package className="w-5 h-5" />,
      color: 'text-navy',
      bgColor: 'bg-navy/10',
    },
    {
      label: 'Active In-Transit',
      value: inTransitCount.toString(),
      icon: <Truck className="w-5 h-5" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'Total Export Value',
      value: formatCurrency(totalValue),
      icon: <DollarSign className="w-5 h-5" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Avg Shipment Value',
      value: formatCurrency(avgValue),
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'text-teal',
      bgColor: 'bg-teal-light',
    },
    {
      label: 'Top Destination',
      value: topDest ? topDest[0] : 'N/A',
      icon: <MapPin className="w-5 h-5" />,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      label: 'Compliance Rate',
      value: `${complianceRate}%`,
      icon: <ShieldCheck className="w-5 h-5" />,
      color: complianceRate >= 90 ? 'text-green-600' : complianceRate >= 70 ? 'text-amber-600' : 'text-red-600',
      bgColor: complianceRate >= 90 ? 'bg-green-50' : complianceRate >= 70 ? 'bg-amber-50' : 'bg-red-50',
    },
  ];

  const tabs = [
    { key: 'shipments' as const, label: 'All Shipments' },
    { key: 'pipeline' as const, label: 'Pipeline' },
    { key: 'analytics' as const, label: 'Analytics' },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy flex items-center gap-2">
            <Ship className="w-6 h-6 text-teal" />
            Export Management
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Overview of all member export operations
          </p>
        </div>
        <div className="text-xs text-gray-400">
          {mockShipments.length} total shipments
        </div>
      </motion.div>

      {/* ── Summary Stats ───────────────────────────────────────────────── */}
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {statCards.map((stat, i) => (
          <motion.div
            key={i}
            variants={cardVariants}
            whileHover={{ y: -2, boxShadow: '0 8px 25px rgba(27,42,74,0.08)' }}
            className="bg-white rounded-xl p-4 border border-gray-100 cursor-default"
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`w-9 h-9 rounded-lg ${stat.bgColor} flex items-center justify-center ${stat.color}`}>
                {stat.icon}
              </div>
            </div>
            <p className="text-2xl font-bold text-navy">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Tab Switcher ────────────────────────────────────────────────── */}
      <motion.div variants={fadeUp} className="flex items-center gap-1 bg-white rounded-xl border border-gray-100 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-navy text-white shadow-sm'
                : 'text-gray-500 hover:text-navy hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </motion.div>

      {/* ── Tab Content ─────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {activeTab === 'shipments' && (
          <motion.div
            key="shipments"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {/* Filters */}
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Filter className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-navy">Filters</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <div className="relative lg:col-span-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search shipments..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-200 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal text-gray-700"
                >
                  <option value="all">All Statuses</option>
                  <option value="loading">Loading</option>
                  <option value="in-transit">In Transit</option>
                  <option value="delivered">Delivered</option>
                  <option value="customs-hold">Customs Hold</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <select
                  value={destinationFilter}
                  onChange={(e) => setDestinationFilter(e.target.value)}
                  className="border border-gray-200 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal text-gray-700"
                >
                  <option value="all">All Destinations</option>
                  {uniqueDestinations.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                <select
                  value={productFilter}
                  onChange={(e) => setProductFilter(e.target.value)}
                  className="border border-gray-200 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal text-gray-700"
                >
                  <option value="all">All Products</option>
                  {uniqueProducts.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              {(searchQuery || statusFilter !== 'all' || destinationFilter !== 'all' || productFilter !== 'all') && (
                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => { setSearchQuery(''); setStatusFilter('all'); setDestinationFilter('all'); setProductFilter('all'); }}
                    className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
                  >
                    Clear All Filters
                  </button>
                  <span className="text-xs text-gray-400 ml-auto">
                    {filteredShipments.length} shipments match filters
                  </span>
                </div>
              )}
            </div>

            {/* Shipments Table */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      {[
                        { key: 'reference', label: 'Reference' },
                        { key: 'member', label: 'Member' },
                        { key: 'product', label: 'Product' },
                        { key: 'destination', label: 'Destination' },
                        { key: 'status', label: 'Status' },
                        { key: 'value', label: 'Value' },
                        { key: 'etd', label: 'ETD / ETA' },
                        { key: 'docs', label: 'Documents' },
                        { key: 'actions', label: '' },
                      ].map((col) => (
                        <th
                          key={col.key}
                          className={`text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase ${
                            col.key !== 'docs' && col.key !== 'actions' && col.key !== 'status' ? 'cursor-pointer hover:text-navy transition-colors' : ''
                          }`}
                          onClick={() => {
                            if (col.key !== 'docs' && col.key !== 'actions' && col.key !== 'status') {
                              handleSort(col.key);
                            }
                          }}
                        >
                          <span className="flex items-center gap-1">
                            {col.label}
                            {col.key !== 'docs' && col.key !== 'actions' && col.key !== 'status' && (
                              <ArrowUpDown className={`w-3 h-3 ${sortField === col.key ? 'text-teal' : 'text-gray-300'}`} />
                            )}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredShipments.map((shipment) => {
                      const sc = statusConfig[shipment.status];
                      const isExpanded = expandedRow === shipment.id;
                      return (
                        <motion.tr
                          key={shipment.id}
                          layout
                          className="group"
                        >
                          <td colSpan={9} className="p-0">
                            <div
                              className="flex items-center hover:bg-gray-50/50 transition-colors cursor-pointer"
                              onClick={() => setExpandedRow(isExpanded ? null : shipment.id)}
                            >
                              <div className="px-4 py-3.5 w-[140px] min-w-[140px]">
                                <div className="flex items-center gap-1.5">
                                  <ChevronRight className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                                  <span className="text-sm font-mono font-medium text-navy">{shipment.reference.split('-').slice(-1)[0]}</span>
                                </div>
                              </div>
                              <div className="px-4 py-3.5 w-[160px] min-w-[160px]">
                                <p className="text-sm font-medium text-navy truncate">{shipment.memberName}</p>
                                <p className="text-[11px] text-gray-400">{shipment.memberId}</p>
                              </div>
                              <div className="px-4 py-3.5 w-[180px] min-w-[180px]">
                                <p className="text-sm text-gray-700 truncate">{shipment.product}</p>
                              </div>
                              <div className="px-4 py-3.5 w-[140px] min-w-[140px]">
                                <div className="flex items-center gap-1.5">
                                  <Globe className="w-3.5 h-3.5 text-gray-400" />
                                  <span className="text-sm text-gray-700">{shipment.destination}</span>
                                </div>
                              </div>
                              <div className="px-4 py-3.5 w-[130px] min-w-[130px]">
                                <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium border ${sc.bgColor} ${sc.textColor}`}>
                                  {sc.icon}
                                  {sc.label}
                                </span>
                              </div>
                              <div className="px-4 py-3.5 w-[100px] min-w-[100px]">
                                <span className="text-sm font-semibold text-navy">${shipment.value.toLocaleString()}</span>
                              </div>
                              <div className="px-4 py-3.5 w-[120px] min-w-[120px]">
                                <p className="text-xs text-gray-500">ETD: {formatDate(shipment.etd)}</p>
                                <p className="text-xs text-gray-500">ETA: {formatDate(shipment.eta)}</p>
                              </div>
                              <div className="px-4 py-3.5 w-[100px] min-w-[100px]">
                                <div className="flex items-center gap-1.5">
                                  <FileText className="w-3.5 h-3.5 text-gray-400" />
                                  <span className={`text-xs font-medium ${shipment.documentsComplete === shipment.documentsTotal ? 'text-green-600' : 'text-amber-600'}`}>
                                    {shipment.documentsComplete}/{shipment.documentsTotal}
                                  </span>
                                </div>
                                <div className="mt-1 w-full bg-gray-100 rounded-full h-1.5">
                                  <div
                                    className={`h-1.5 rounded-full ${shipment.documentsComplete === shipment.documentsTotal ? 'bg-green-500' : 'bg-amber-500'}`}
                                    style={{ width: `${shipment.documentsTotal > 0 ? (shipment.documentsComplete / shipment.documentsTotal) * 100 : 0}%` }}
                                  />
                                </div>
                              </div>
                              <div className="px-4 py-3.5 w-[60px] min-w-[60px]">
                                <button
                                  onClick={(e) => { e.stopPropagation(); }}
                                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                  <MoreHorizontal className="w-4 h-4 text-gray-400" />
                                </button>
                              </div>
                            </div>

                            {/* Expanded Details */}
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.25 }}
                                  className="overflow-hidden"
                                >
                                  <div className="px-6 pb-5 pt-2 bg-gray-50/50 border-t border-gray-100">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                      <div className="space-y-3">
                                        <h4 className="text-xs font-semibold text-gray-500 uppercase">Shipment Details</h4>
                                        <div className="space-y-2">
                                          <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Full Reference</span>
                                            <span className="font-mono text-navy">{shipment.reference}</span>
                                          </div>
                                          <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Quantity</span>
                                            <span className="text-navy">{shipment.quantity}</span>
                                          </div>
                                          <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Currency</span>
                                            <span className="text-navy">{shipment.currency}</span>
                                          </div>
                                          <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Member Country</span>
                                            <span className="text-navy">{shipment.country}</span>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="space-y-3">
                                        <h4 className="text-xs font-semibold text-gray-500 uppercase">Route Information</h4>
                                        <div className="space-y-2">
                                          <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Origin Port</span>
                                            <span className="text-navy">{shipment.originPort}</span>
                                          </div>
                                          <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Destination Port</span>
                                            <span className="text-navy">{shipment.destinationPort}</span>
                                          </div>
                                          <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Vessel</span>
                                            <span className="text-navy">{shipment.vessel || 'Not assigned'}</span>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="space-y-3">
                                        <h4 className="text-xs font-semibold text-gray-500 uppercase">Timeline</h4>
                                        <div className="space-y-2">
                                          <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Est. Departure</span>
                                            <span className="text-navy">{formatDate(shipment.etd)}</span>
                                          </div>
                                          <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Est. Arrival</span>
                                            <span className="text-navy">{formatDate(shipment.eta)}</span>
                                          </div>
                                          <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Transit Days</span>
                                            <span className="text-navy">
                                              {Math.round((new Date(shipment.eta).getTime() - new Date(shipment.etd).getTime()) / 86400000)} days
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-3">
                                      <button className="px-4 py-2 bg-teal text-white text-xs font-medium rounded-lg hover:bg-teal/90 transition-colors flex items-center gap-1.5">
                                        <Eye className="w-3.5 h-3.5" />
                                        View Full Details
                                      </button>
                                      <button className="px-4 py-2 bg-navy/10 text-navy text-xs font-medium rounded-lg hover:bg-navy/20 transition-colors flex items-center gap-1.5">
                                        <FileText className="w-3.5 h-3.5" />
                                        View Documents
                                      </button>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {filteredShipments.length === 0 && (
                <div className="p-12 text-center">
                  <Ship className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No shipments match your filters</p>
                  <p className="text-gray-400 text-xs mt-1">Try adjusting your filter criteria</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'pipeline' && (
          <motion.div
            key="pipeline"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {pipelineStages.map((stage) => {
                const stageShipments = pipelineData[stage.key];
                return (
                  <div key={stage.key} className="space-y-3">
                    {/* Column Header */}
                    <div className={`rounded-xl p-3 border ${stage.borderColor} ${stage.color}`}>
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-navy">{stage.label}</h3>
                        <span className="w-6 h-6 rounded-full bg-white/80 flex items-center justify-center text-xs font-bold text-navy border border-gray-200">
                          {stageShipments.length}
                        </span>
                      </div>
                    </div>

                    {/* Cards */}
                    <div className="space-y-2">
                      {stageShipments.map((shipment) => (
                        <motion.div
                          key={shipment.id}
                          whileHover={{ y: -2, boxShadow: '0 4px 12px rgba(27,42,74,0.1)' }}
                          className="bg-white rounded-lg border border-gray-200 p-3 cursor-pointer transition-shadow"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-mono font-semibold text-teal">{shipment.reference.split('-').slice(-1)[0]}</span>
                            <span className={`inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full font-medium border ${statusConfig[shipment.status].bgColor} ${statusConfig[shipment.status].textColor}`}>
                              {statusConfig[shipment.status].icon}
                            </span>
                          </div>
                          <p className="text-xs font-medium text-navy truncate">{shipment.memberName}</p>
                          <p className="text-[11px] text-gray-500 truncate mt-0.5">{shipment.product}</p>
                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                            <span className="text-xs font-semibold text-navy">${shipment.value.toLocaleString()}</span>
                            <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                              <Globe className="w-2.5 h-2.5" />
                              {shipment.destination.split(' ')[0]}
                            </span>
                          </div>
                        </motion.div>
                      ))}

                      {stageShipments.length === 0 && (
                        <div className="bg-white/50 rounded-lg border border-dashed border-gray-200 p-4 text-center">
                          <p className="text-xs text-gray-400">No shipments</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {activeTab === 'analytics' && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Row 1: Volume Chart + Top Destinations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Export Volume by Month */}
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <div className="flex items-center gap-2 mb-5">
                  <BarChart3 className="w-4 h-4 text-teal" />
                  <h3 className="text-sm font-semibold text-navy">Export Volume by Month (2026)</h3>
                </div>
                <div className="flex items-end gap-3 h-48">
                  {monthlyExportData.map((month) => {
                    const maxVal = Math.max(...monthlyExportData.map((m) => m.value));
                    const heightPct = maxVal > 0 ? (month.value / maxVal) * 100 : 0;
                    return (
                      <div key={month.month} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-[10px] font-medium text-navy">
                          {month.value > 0 ? formatCurrency(month.value) : ''}
                        </span>
                        <div className="w-full bg-gray-50 rounded-t-md relative" style={{ height: '160px' }}>
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${heightPct}%` }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="absolute bottom-0 w-full rounded-t-md bg-gradient-to-t from-teal to-teal/70"
                          />
                        </div>
                        <span className="text-[10px] text-gray-500 font-medium">{month.month}</span>
                        <span className="text-[10px] text-gray-400">{month.shipments} ship.</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Top Destinations */}
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <div className="flex items-center gap-2 mb-5">
                  <PieChart className="w-4 h-4 text-teal" />
                  <h3 className="text-sm font-semibold text-navy">Top Destinations by Value</h3>
                </div>
                <div className="space-y-3">
                  {topDestinations.map((dest, i) => {
                    const colors = ['bg-teal', 'bg-navy', 'bg-purple-500', 'bg-amber-500', 'bg-blue-500', 'bg-green-500', 'bg-gray-400'];
                    return (
                      <div key={dest.country} className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-sm ${colors[i] || 'bg-gray-300'} flex-shrink-0`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-navy font-medium">{dest.country}</span>
                            <span className="text-xs text-gray-500">{formatCurrency(dest.value)} ({dest.count})</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-1.5">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${dest.percentage}%` }}
                              transition={{ duration: 0.6, delay: 0.1 * i }}
                              className={`h-1.5 rounded-full ${colors[i] || 'bg-gray-300'}`}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Row 2: Top Products + Transit Times */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Products by Value */}
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <div className="flex items-center gap-2 mb-5">
                  <Package className="w-4 h-4 text-teal" />
                  <h3 className="text-sm font-semibold text-navy">Top Products by Export Value</h3>
                </div>
                <div className="space-y-2">
                  {topProducts.map((product, i) => {
                    const maxVal = topProducts[0].value;
                    const widthPct = (product.value / maxVal) * 100;
                    return (
                      <div key={product.product} className="flex items-center gap-3">
                        <span className="text-xs text-gray-400 w-4 text-right font-mono">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-navy font-medium truncate">{product.product}</span>
                            <span className="text-xs text-gray-500 ml-2">{formatCurrency(product.value)}</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${widthPct}%` }}
                              transition={{ duration: 0.6, delay: 0.05 * i }}
                              className="h-2 rounded-full bg-gradient-to-r from-navy to-teal"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Average Transit Times & Compliance */}
              <div className="space-y-6">
                {/* Transit Times */}
                <div className="bg-white rounded-xl border border-gray-100 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="w-4 h-4 text-teal" />
                    <h3 className="text-sm font-semibold text-navy">Average Transit Times</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { route: 'East Africa → EU', days: 24, icon: <Anchor className="w-3 h-3" /> },
                      { route: 'East Africa → Asia', days: 20, icon: <Ship className="w-3 h-3" /> },
                      { route: 'Southern Africa → EU', days: 26, icon: <Anchor className="w-3 h-3" /> },
                      { route: 'East Africa → ME', days: 15, icon: <Ship className="w-3 h-3" /> },
                    ].map((route) => (
                      <div key={route.route} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-gray-400">{route.icon}</span>
                          <span className="text-[11px] text-gray-500">{route.route}</span>
                        </div>
                        <p className="text-lg font-bold text-navy">{route.days} <span className="text-xs font-normal text-gray-400">days</span></p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Compliance Issues */}
                <div className="bg-white rounded-xl border border-gray-100 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <ShieldCheck className="w-4 h-4 text-teal" />
                    <h3 className="text-sm font-semibold text-navy">Compliance Issues Summary</h3>
                  </div>
                  <div className="space-y-2">
                    {complianceIssues.map((issue) => (
                      <div key={issue.type} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                        <span className="text-sm text-gray-700">{issue.type}</span>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-semibold ${issue.count === 0 ? 'text-green-600' : issue.count >= 3 ? 'text-red-600' : 'text-amber-600'}`}>
                            {issue.count}
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                            issue.trend === 'up' ? 'bg-red-50 text-red-600' :
                            issue.trend === 'down' ? 'bg-green-50 text-green-600' :
                            'bg-gray-50 text-gray-500'
                          }`}>
                            {issue.trend === 'up' ? '^ Up' : issue.trend === 'down' ? 'v Down' : '- Same'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
