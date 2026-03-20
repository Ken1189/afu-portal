'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  DollarSign,
  Clock,
  CheckCircle2,
  Wallet,
  ArrowLeft,
  Download,
  Filter,
  ChevronDown,
  CreditCard,
  Building,
  Calendar,
  TrendingUp,
  AlertCircle,
  Banknote,
} from 'lucide-react';
// ── Inline types & fallback data (replaces @/lib/data/ imports) ─────────────

type SupplierCategory = 'input-supplier' | 'equipment' | 'logistics' | 'processing' | 'technology' | 'financial-services';
type SponsorshipTier = 'platinum' | 'gold' | 'silver' | 'bronze';
type Country = 'Botswana' | 'Kenya' | 'Mozambique' | 'Nigeria' | 'Sierra Leone' | 'South Africa' | 'Tanzania' | 'Zambia' | 'Zimbabwe';

interface Supplier {
  id: string; companyName: string; contactName: string; email: string; phone: string;
  country: Country; region: string; category: SupplierCategory;
  status: 'active' | 'pending' | 'suspended'; joinDate: string; logo: string;
  description: string; productsCount: number; totalSales: number; totalOrders: number;
  rating: number; reviewCount: number; memberDiscountPercent: number; commissionRate: number;
  isFounding: boolean; sponsorshipTier: SponsorshipTier | null; verified: boolean;
  website: string; certifications: string[];
}

interface Commission {
  id: string; supplierId: string; supplierName: string; orderId: string;
  productName: string; buyerName: string;
  buyerType: 'smallholder' | 'commercial' | 'enterprise' | 'cooperative';
  orderAmount: number; commissionRate: number; commissionAmount: number;
  status: 'pending' | 'approved' | 'paid' | 'disputed';
  orderDate: string; paymentDate: string | null;
}

const suppliers: Supplier[] = [
  { id: 'SUP-001', companyName: 'Zambezi Agri-Supplies', contactName: 'Farai Ndlovu', email: 'farai@zambezi-agri.co.zw', phone: '+263 77 200 1001', country: 'Zimbabwe', region: 'Harare', category: 'input-supplier', status: 'active', joinDate: '2024-06-15', logo: 'https://images.unsplash.com/photo-1560693225-b8507d6f3aa9?w=400&h=300&fit=crop', description: 'Leading agricultural input supplier across Southern Africa.', productsCount: 38, totalSales: 1847320, totalOrders: 4215, rating: 4.8, reviewCount: 312, memberDiscountPercent: 12, commissionRate: 8, isFounding: true, sponsorshipTier: 'platinum', verified: true, website: 'https://zambezi-agri.co.zw', certifications: ['ISO 9001', 'GlobalGAP Approved', 'SADC Trade Certified'] },
];

const commissions: Commission[] = [
  { id: 'COM-001', supplierId: 'SUP-001', supplierName: 'Zambezi Agri-Supplies', orderId: 'ORD-2025-0412', productName: 'Groundnut Seed (Nyanda) x 50 bags', buyerName: 'Kgosi Mosweu', buyerType: 'smallholder', orderAmount: 3900, commissionRate: 8, commissionAmount: 312, status: 'paid', orderDate: '2025-09-15', paymentDate: '2025-10-15' },
  { id: 'COM-002', supplierId: 'SUP-002', supplierName: 'Kalahari Seeds Co.', orderId: 'ORD-2025-0489', productName: 'Hybrid Maize Seed (PAN 4M-21) x 20 bags', buyerName: 'Tendai Moyo', buyerType: 'smallholder', orderAmount: 960, commissionRate: 7, commissionAmount: 67.20, status: 'paid', orderDate: '2025-10-02', paymentDate: '2025-11-02' },
  { id: 'COM-003', supplierId: 'SUP-009', supplierName: 'Chobe Irrigation Systems', orderId: 'ORD-2025-0523', productName: 'Drip Irrigation Kit (1 Hectare) x 3', buyerName: 'Mosweu Cooperative', buyerType: 'cooperative', orderAmount: 5550, commissionRate: 11, commissionAmount: 610.50, status: 'paid', orderDate: '2025-10-18', paymentDate: '2025-11-18' },
  { id: 'COM-004', supplierId: 'SUP-004', supplierName: 'Matopos Equipment Hire', orderId: 'ORD-2025-0567', productName: 'Walk-Behind Tractor (15HP Diesel)', buyerName: 'Chiedza Mutasa', buyerType: 'commercial', orderAmount: 3800, commissionRate: 12, commissionAmount: 456, status: 'paid', orderDate: '2025-11-05', paymentDate: '2025-12-05' },
  { id: 'COM-005', supplierId: 'SUP-006', supplierName: 'Okavango Fertilizers', orderId: 'ORD-2025-0612', productName: 'NPK 15-15-15 x 100 bags', buyerName: 'Tshiamo Rapula', buyerType: 'commercial', orderAmount: 4500, commissionRate: 8, commissionAmount: 360, status: 'paid', orderDate: '2025-11-12', paymentDate: '2025-12-12' },
  { id: 'COM-006', supplierId: 'SUP-003', supplierName: 'TechFarm Solutions', orderId: 'ORD-2025-0645', productName: 'IoT Soil Moisture Sensor Kit x 5', buyerName: 'Baraka Mfaume', buyerType: 'enterprise', orderAmount: 1900, commissionRate: 10, commissionAmount: 190, status: 'paid', orderDate: '2025-11-20', paymentDate: '2025-12-20' },
  { id: 'COM-007', supplierId: 'SUP-010', supplierName: 'Kilimanjaro Organic Inputs', orderId: 'ORD-2025-0678', productName: 'Organic Compost Blend x 200 bags', buyerName: 'Upendo Farmers Group', buyerType: 'cooperative', orderAmount: 3600, commissionRate: 9, commissionAmount: 324, status: 'paid', orderDate: '2025-12-01', paymentDate: '2026-01-01' },
  { id: 'COM-008', supplierId: 'SUP-001', supplierName: 'Zambezi Agri-Supplies', orderId: 'ORD-2025-0712', productName: 'Knapsack Sprayer x 30 units', buyerName: 'Mashonaland Growers Association', buyerType: 'cooperative', orderAmount: 1050, commissionRate: 8, commissionAmount: 84, status: 'paid', orderDate: '2025-12-10', paymentDate: '2026-01-10' },
  { id: 'COM-009', supplierId: 'SUP-013', supplierName: 'Tswana Agri-Chem', orderId: 'ORD-2025-0734', productName: 'Lambda-Cyhalothrin 5EC x 50L', buyerName: 'Lesego Keabetswe', buyerType: 'commercial', orderAmount: 1200, commissionRate: 7, commissionAmount: 84, status: 'paid', orderDate: '2025-12-15', paymentDate: '2026-01-15' },
  { id: 'COM-010', supplierId: 'SUP-017', supplierName: 'Chimanimani Grain Storage', orderId: 'ORD-2025-0756', productName: 'Hermetic Grain Storage Bag x 100 packs', buyerName: 'Chipinge Farmers Union', buyerType: 'cooperative', orderAmount: 3500, commissionRate: 9, commissionAmount: 315, status: 'approved', orderDate: '2025-12-22', paymentDate: null },
  { id: 'COM-011', supplierId: 'SUP-011', supplierName: 'Hwange Solar & Pumps', orderId: 'ORD-2026-0012', productName: 'Solar Panel Kit (300W Off-Grid) x 2', buyerName: 'Nyasha Chimbidzikai', buyerType: 'smallholder', orderAmount: 1040, commissionRate: 13, commissionAmount: 135.20, status: 'approved', orderDate: '2026-01-05', paymentDate: null },
  { id: 'COM-012', supplierId: 'SUP-002', supplierName: 'Kalahari Seeds Co.', orderId: 'ORD-2026-0034', productName: 'Drought-Resistant Sorghum (Macia) x 40 bags', buyerName: 'Naledi Sekgoma', buyerType: 'smallholder', orderAmount: 2600, commissionRate: 7, commissionAmount: 182, status: 'approved', orderDate: '2026-01-12', paymentDate: null },
  { id: 'COM-013', supplierId: 'SUP-005', supplierName: 'Safari Logistics Ltd', orderId: 'ORD-2026-0056', productName: 'Cold Chain Transport - Arusha to Dar', buyerName: 'Kilimanjaro Fresh Exports', buyerType: 'enterprise', orderAmount: 2800, commissionRate: 6, commissionAmount: 168, status: 'approved', orderDate: '2026-01-18', paymentDate: null },
  { id: 'COM-014', supplierId: 'SUP-016', supplierName: 'Makgadikgadi Drones', orderId: 'ORD-2026-0078', productName: 'NDVI Crop Mapping Service x 10 flights', buyerName: 'Gaborone Agri-Enterprise', buyerType: 'enterprise', orderAmount: 850, commissionRate: 15, commissionAmount: 127.50, status: 'approved', orderDate: '2026-01-25', paymentDate: null },
  { id: 'COM-015', supplierId: 'SUP-009', supplierName: 'Chobe Irrigation Systems', orderId: 'ORD-2026-0092', productName: 'Solar Water Pump (2HP Submersible)', buyerName: 'Thabo Molefe', buyerType: 'commercial', orderAmount: 2200, commissionRate: 11, commissionAmount: 242, status: 'pending', orderDate: '2026-02-03', paymentDate: null },
  { id: 'COM-016', supplierId: 'SUP-006', supplierName: 'Okavango Fertilizers', orderId: 'ORD-2026-0108', productName: 'Urea (46-0-0) x 80 bags + SSP x 40 bags', buyerName: 'Central District Cooperative', buyerType: 'cooperative', orderAmount: 4160, commissionRate: 8, commissionAmount: 332.80, status: 'pending', orderDate: '2026-02-08', paymentDate: null },
  { id: 'COM-017', supplierId: 'SUP-020', supplierName: 'Victoria Falls Seed Bank', orderId: 'ORD-2026-0124', productName: 'Cowpea Seeds (IT18) x 100 packs', buyerName: 'Rudo Chidyamakono', buyerType: 'commercial', orderAmount: 2200, commissionRate: 7, commissionAmount: 154, status: 'pending', orderDate: '2026-02-14', paymentDate: null },
  { id: 'COM-018', supplierId: 'SUP-004', supplierName: 'Matopos Equipment Hire', orderId: 'ORD-2026-0139', productName: 'Boom Sprayer (Tractor-Mounted 600L)', buyerName: 'Mugabe Farms', buyerType: 'enterprise', orderAmount: 2400, commissionRate: 12, commissionAmount: 288, status: 'pending', orderDate: '2026-02-19', paymentDate: null },
  { id: 'COM-019', supplierId: 'SUP-012', supplierName: 'Ngorongoro Packaging', orderId: 'ORD-2026-0156', productName: 'Export-Grade Produce Cartons x 20 packs', buyerName: 'Moshi Berry Growers', buyerType: 'cooperative', orderAmount: 1500, commissionRate: 8, commissionAmount: 120, status: 'pending', orderDate: '2026-02-25', paymentDate: null },
  { id: 'COM-020', supplierId: 'SUP-001', supplierName: 'Zambezi Agri-Supplies', orderId: 'ORD-2026-0171', productName: 'Metalaxyl + Mancozeb Fungicide x 25kg', buyerName: 'Tatenda Chikaura', buyerType: 'smallholder', orderAmount: 875, commissionRate: 8, commissionAmount: 70, status: 'pending', orderDate: '2026-03-01', paymentDate: null },
  { id: 'COM-021', supplierId: 'SUP-003', supplierName: 'TechFarm Solutions', orderId: 'ORD-2026-0185', productName: 'Precision Weather Station x 3', buyerName: 'Dodoma Agricultural Research', buyerType: 'enterprise', orderAmount: 1260, commissionRate: 10, commissionAmount: 126, status: 'pending', orderDate: '2026-03-03', paymentDate: null },
  { id: 'COM-022', supplierId: 'SUP-008', supplierName: 'Limpopo Agri-Finance', orderId: 'ORD-2026-0198', productName: 'Crop Insurance Premium - Seasonal Plan', buyerName: 'Sipho Dlamini', buyerType: 'smallholder', orderAmount: 320, commissionRate: 5, commissionAmount: 16, status: 'pending', orderDate: '2026-03-05', paymentDate: null },
  { id: 'COM-023', supplierId: 'SUP-015', supplierName: 'Bagamoyo Marine Harvest', orderId: 'ORD-2026-0212', productName: 'Seaweed Bio-Stimulant x 20 containers', buyerName: 'Tanga Horticulture Group', buyerType: 'cooperative', orderAmount: 640, commissionRate: 10, commissionAmount: 64, status: 'pending', orderDate: '2026-03-07', paymentDate: null },
  { id: 'COM-024', supplierId: 'SUP-018', supplierName: 'Morogoro Farm Implements', orderId: 'ORD-2026-0228', productName: 'Ox-Drawn Plough x 15 + Hoe Set x 50', buyerName: 'Iringa Smallholders Network', buyerType: 'cooperative', orderAmount: 2550, commissionRate: 11, commissionAmount: 280.50, status: 'pending', orderDate: '2026-03-08', paymentDate: null },
  { id: 'COM-025', supplierId: 'SUP-009', supplierName: 'Chobe Irrigation Systems', orderId: 'ORD-2026-0243', productName: 'Water Storage Tank (10,000L) x 4', buyerName: 'Boteti Farmers Trust', buyerType: 'cooperative', orderAmount: 2320, commissionRate: 11, commissionAmount: 255.20, status: 'pending', orderDate: '2026-03-10', paymentDate: null },
  { id: 'COM-026', supplierId: 'SUP-019', supplierName: 'Mmegi Digital Agriculture', orderId: 'ORD-2026-0258', productName: 'FarmTrack Pro License x 50', buyerName: 'AFU Botswana Chapter', buyerType: 'cooperative', orderAmount: 6000, commissionRate: 14, commissionAmount: 840, status: 'pending', orderDate: '2026-03-11', paymentDate: null },
  { id: 'COM-027', supplierId: 'SUP-014', supplierName: 'Great Zimbabwe Transport', orderId: 'ORD-2026-0271', productName: 'Grain Haulage - Harare to Beira (40 tonnes)', buyerName: 'Zimbabwe Grain Traders', buyerType: 'enterprise', orderAmount: 4800, commissionRate: 6, commissionAmount: 288, status: 'disputed', orderDate: '2026-02-20', paymentDate: null },
  { id: 'COM-028', supplierId: 'SUP-021', supplierName: 'Zanzibar Spice Exports', orderId: 'ORD-2026-0284', productName: 'Spice Processing Service - Cloves 5 tonnes', buyerName: 'Pemba Clove Growers', buyerType: 'cooperative', orderAmount: 3200, commissionRate: 8, commissionAmount: 256, status: 'disputed', orderDate: '2026-02-28', paymentDate: null },
  { id: 'COM-029', supplierId: 'SUP-016', supplierName: 'Makgadikgadi Drones', orderId: 'ORD-2026-0297', productName: 'DJI Agras T30 Spray Drone', buyerName: 'Maun Agri-Services', buyerType: 'enterprise', orderAmount: 14500, commissionRate: 15, commissionAmount: 2175, status: 'pending', orderDate: '2026-03-12', paymentDate: null },
  { id: 'COM-030', supplierId: 'SUP-022', supplierName: 'Tuli Block Livestock Feeds', orderId: 'ORD-2026-0310', productName: 'Cattle Feed Concentrate x 200 bags', buyerName: 'Tuli Ranchers Assoc.', buyerType: 'cooperative', orderAmount: 5600, commissionRate: 8, commissionAmount: 448, status: 'pending', orderDate: '2026-03-14', paymentDate: null },
];

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

// ── Supplier context ────────────────────────────────────────────────────────

const currentSupplier = suppliers.find((s) => s.id === 'SUP-001')!;
const supplierCommissions = commissions.filter((c) => c.supplierId === currentSupplier.id);

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatCurrencyExact(value: number): string {
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ── Summary calculations ────────────────────────────────────────────────────

const totalEarned = supplierCommissions.reduce((sum, c) => sum + c.commissionAmount, 0);
const pendingBalance = supplierCommissions
  .filter((c) => c.status === 'pending')
  .reduce((sum, c) => sum + c.commissionAmount, 0);
const approvedBalance = supplierCommissions
  .filter((c) => c.status === 'approved')
  .reduce((sum, c) => sum + c.commissionAmount, 0);
const paidOut = supplierCommissions
  .filter((c) => c.status === 'paid')
  .reduce((sum, c) => sum + c.commissionAmount, 0);
const disputedAmount = supplierCommissions
  .filter((c) => c.status === 'disputed')
  .reduce((sum, c) => sum + c.commissionAmount, 0);

// ── Status badge colors ─────────────────────────────────────────────────────

const statusBadgeColors: Record<string, string> = {
  paid: 'bg-green-100 text-green-700',
  approved: 'bg-[#2AA198]/10 text-[#2AA198]',
  pending: 'bg-amber-100 text-amber-700',
  disputed: 'bg-red-100 text-red-700',
};

const statusIcons: Record<string, React.ReactNode> = {
  paid: <CheckCircle2 className="w-3 h-3" />,
  approved: <TrendingUp className="w-3 h-3" />,
  pending: <Clock className="w-3 h-3" />,
  disputed: <AlertCircle className="w-3 h-3" />,
};

// ── Period filter options ───────────────────────────────────────────────────

type Period = 'this-month' | 'last-month' | 'this-quarter' | 'all-time';

const periodFilters: { id: Period; label: string }[] = [
  { id: 'this-month', label: 'This Month' },
  { id: 'last-month', label: 'Last Month' },
  { id: 'this-quarter', label: 'This Quarter' },
  { id: 'all-time', label: 'All Time' },
];

// ── Mock payout history ─────────────────────────────────────────────────────

const payoutHistory = [
  {
    id: 'PAY-001',
    date: '2026-02-15',
    amount: 396,
    method: 'Bank Transfer',
    reference: 'TXN-2026-02-ZAS-001',
    icon: <Building className="w-4 h-4" />,
  },
  {
    id: 'PAY-002',
    date: '2026-01-15',
    amount: 312,
    method: 'Bank Transfer',
    reference: 'TXN-2026-01-ZAS-001',
    icon: <Building className="w-4 h-4" />,
  },
  {
    id: 'PAY-003',
    date: '2025-12-15',
    amount: 84,
    method: 'Mobile Money',
    reference: 'MM-2025-12-ZAS-001',
    icon: <CreditCard className="w-4 h-4" />,
  },
  {
    id: 'PAY-004',
    date: '2025-11-15',
    amount: 312,
    method: 'Bank Transfer',
    reference: 'TXN-2025-11-ZAS-001',
    icon: <Building className="w-4 h-4" />,
  },
  {
    id: 'PAY-005',
    date: '2025-10-15',
    amount: 0,
    method: 'Bank Transfer',
    reference: 'TXN-2025-10-ZAS-001',
    icon: <Building className="w-4 h-4" />,
  },
];

// ── Commission trend chart data ─────────────────────────────────────────────

const commissionTrendData = [
  { month: 'Sep', amount: 312 },
  { month: 'Oct', amount: 0 },
  { month: 'Nov', amount: 0 },
  { month: 'Dec', amount: 84 },
  { month: 'Jan', amount: 0 },
  { month: 'Feb', amount: 0 },
  { month: 'Mar', amount: 70 },
];

// ── Custom tooltip ──────────────────────────────────────────────────────────

interface TooltipPayloadEntry {
  name: string;
  value: number;
  color: string;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
}) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-100 px-3 py-2 text-xs">
      <p className="font-semibold text-[#1B2A4A] mb-1">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-gray-600">{entry.name}:</span>
          <span className="font-medium text-[#1B2A4A]">{formatCurrencyExact(entry.value)}</span>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function CommissionTracking() {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('all-time');
  const [showPayoutModal, setShowPayoutModal] = useState(false);

  // ── Filter commissions by period ──────────────────────────────────────
  const filteredCommissions = useMemo(() => {
    const now = new Date();
    return supplierCommissions.filter((c) => {
      const date = new Date(c.orderDate);
      switch (selectedPeriod) {
        case 'this-month':
          return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        case 'last-month': {
          const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          return date.getMonth() === lastMonth.getMonth() && date.getFullYear() === lastMonth.getFullYear();
        }
        case 'this-quarter': {
          const qStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
          return date >= qStart && date <= now;
        }
        case 'all-time':
        default:
          return true;
      }
    });
  }, [selectedPeriod]);

  // ── Period totals ─────────────────────────────────────────────────────
  const periodTotal = filteredCommissions.reduce((sum, c) => sum + c.commissionAmount, 0);

  // ── Summary cards data ────────────────────────────────────────────────
  const summaryCards = [
    {
      label: 'Total Earned',
      value: formatCurrency(totalEarned),
      sublabel: 'All time',
      icon: <DollarSign className="w-5 h-5" />,
      color: 'text-[#1B2A4A]',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100',
    },
    {
      label: 'Pending Balance',
      value: formatCurrency(pendingBalance + approvedBalance),
      sublabel: `${supplierCommissions.filter((c) => c.status === 'pending' || c.status === 'approved').length} transactions`,
      icon: <Clock className="w-5 h-5" />,
      color: 'text-[#D4A843]',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-100',
    },
    {
      label: 'Paid Out',
      value: formatCurrency(paidOut),
      sublabel: `${supplierCommissions.filter((c) => c.status === 'paid').length} payouts completed`,
      icon: <Wallet className="w-5 h-5" />,
      color: 'text-[#2AA198]',
      bgColor: 'bg-[#2AA198]/10',
      borderColor: 'border-[#2AA198]/20',
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* ══════════════════════════════════════════════════════════════════
          HEADER
      ═════════════════════════════════════════════════════════════════ */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/supplier"
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[#1B2A4A]">Commissions</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Track earnings from marketplace sales and manage payouts
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={() => setShowPayoutModal(!showPayoutModal)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-white text-sm font-medium transition-all hover:shadow-lg"
            style={{ background: 'linear-gradient(135deg, #2AA198 0%, #1A7A72 100%)' }}
          >
            <Banknote className="w-4 h-4" />
            Request Payout
          </button>
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════════════════════════
          PAYOUT REQUEST MODAL
      ═════════════════════════════════════════════════════════════════ */}
      {showPayoutModal && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border-2 border-[#2AA198]/20 p-5 shadow-lg"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-[#1B2A4A] text-sm">Request Payout</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Available balance: {formatCurrencyExact(pendingBalance + approvedBalance)}
              </p>
            </div>
            <button
              onClick={() => setShowPayoutModal(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Amount</label>
              <input
                type="text"
                defaultValue={formatCurrencyExact(pendingBalance + approvedBalance)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-[#1B2A4A] focus:outline-none focus:ring-2 focus:ring-[#2AA198]/30 focus:border-[#2AA198]"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Method</label>
              <select className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-[#1B2A4A] focus:outline-none focus:ring-2 focus:ring-[#2AA198]/30 focus:border-[#2AA198]">
                <option>Bank Transfer</option>
                <option>Mobile Money</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setShowPayoutModal(false)}
                className="w-full px-4 py-2 rounded-lg text-sm font-medium bg-[#2AA198] text-white hover:bg-[#1A7A72] transition-colors"
              >
                Submit Request
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-400">
            Payouts are processed within 3-5 business days. Minimum payout: $50.00
          </p>
        </motion.div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          SUMMARY CARDS
      ═════════════════════════════════════════════════════════════════ */}
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {summaryCards.map((card, i) => (
          <motion.div
            key={i}
            variants={cardVariants}
            whileHover={{ y: -2, boxShadow: '0 8px 25px rgba(27,42,74,0.08)' }}
            className={`bg-white rounded-xl p-5 border ${card.borderColor}`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg ${card.bgColor} flex items-center justify-center ${card.color}`}>
                {card.icon}
              </div>
            </div>
            <p className="text-2xl font-bold text-[#1B2A4A] tabular-nums">{card.value}</p>
            <p className="text-xs text-gray-500 mt-1">{card.label}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{card.sublabel}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* ══════════════════════════════════════════════════════════════════
          COMMISSION TREND CHART
      ═════════════════════════════════════════════════════════════════ */}
      <motion.div
        variants={cardVariants}
        className="bg-white rounded-xl border border-gray-100 p-5"
      >
        <h3 className="font-semibold text-[#1B2A4A] text-sm mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#2AA198]" />
          Commission Trend (Last 7 Months)
        </h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={commissionTrendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="commGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2AA198" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2AA198" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `$${v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#2AA198"
                strokeWidth={2.5}
                fill="url(#commGradient)"
                name="Commission"
                dot={{ fill: '#2AA198', r: 3, strokeWidth: 0 }}
                activeDot={{ fill: '#2AA198', r: 5, strokeWidth: 2, stroke: '#fff' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════════════════════════
          PERIOD SELECTOR + COMMISSION TABLE
      ═════════════════════════════════════════════════════════════════ */}
      <motion.div
        variants={cardVariants}
        className="bg-white rounded-xl border border-gray-100 overflow-hidden"
      >
        {/* Period tabs */}
        <div className="p-5 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h3 className="font-semibold text-[#1B2A4A] text-sm flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#2AA198]" />
              Commission Details
            </h3>
            <div className="flex items-center bg-gray-50 rounded-lg p-1">
              {periodFilters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setSelectedPeriod(filter.id)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    selectedPeriod === filter.id
                      ? 'bg-white text-[#2AA198] shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-3 text-xs text-gray-500">
            {filteredCommissions.length} transactions &bull; Total: {formatCurrencyExact(periodTotal)}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Order ID</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Product</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Buyer</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Order Amt</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Rate</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Commission</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredCommissions.length > 0 ? (
                filteredCommissions
                  .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
                  .map((comm, i) => (
                    <motion.tr
                      key={comm.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="hover:bg-cream/50 transition-colors cursor-default"
                    >
                      <td className="py-3 px-4 text-xs text-gray-500 whitespace-nowrap">
                        {new Date(comm.orderDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3 px-4 text-xs font-mono text-gray-500 whitespace-nowrap">
                        {comm.orderId}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm font-medium text-[#1B2A4A] truncate block max-w-[200px]">
                          {comm.productName}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-600 whitespace-nowrap">{comm.buyerName}</td>
                      <td className="py-3 px-4 text-right text-sm font-medium text-[#1B2A4A] tabular-nums whitespace-nowrap">
                        {formatCurrencyExact(comm.orderAmount)}
                      </td>
                      <td className="py-3 px-4 text-right text-xs text-gray-500 tabular-nums whitespace-nowrap">
                        {comm.commissionRate}%
                      </td>
                      <td className="py-3 px-4 text-right text-sm font-semibold text-[#2AA198] tabular-nums whitespace-nowrap">
                        {formatCurrencyExact(comm.commissionAmount)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium capitalize ${
                            statusBadgeColors[comm.status] || 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {statusIcons[comm.status]}
                          {comm.status}
                        </span>
                      </td>
                    </motion.tr>
                  ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">No commissions found for this period</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════════════════════════
          PAYOUT HISTORY
      ═════════════════════════════════════════════════════════════════ */}
      <motion.div
        variants={cardVariants}
        className="bg-white rounded-xl border border-gray-100 overflow-hidden"
      >
        <div className="p-5 border-b border-gray-100">
          <h3 className="font-semibold text-[#1B2A4A] text-sm flex items-center gap-2">
            <Wallet className="w-4 h-4 text-[#2AA198]" />
            Payout History
          </h3>
        </div>
        <div className="divide-y divide-gray-50">
          {payoutHistory.map((payout, i) => (
            <motion.div
              key={payout.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="px-5 py-4 flex items-center justify-between hover:bg-cream/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                  {payout.icon}
                </div>
                <div>
                  <p className="text-sm font-medium text-[#1B2A4A]">{payout.method}</p>
                  <p className="text-[10px] text-gray-400 font-mono mt-0.5">{payout.reference}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-[#1B2A4A] tabular-nums">
                  {payout.amount > 0 ? formatCurrencyExact(payout.amount) : '--'}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {new Date(payout.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════════════════════════
          DISPUTED COMMISSIONS NOTICE
      ═════════════════════════════════════════════════════════════════ */}
      {disputedAmount > 0 && (
        <motion.div
          variants={fadeUp}
          className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-700">Disputed Commissions</p>
            <p className="text-xs text-red-600 mt-0.5">
              You have {formatCurrencyExact(disputedAmount)} in disputed commissions. Please contact your account
              manager to resolve these disputes.
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
