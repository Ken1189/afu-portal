'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Megaphone,
  Plus,
  Eye,
  MousePointerClick,
  Target,
  TrendingUp,
  Pause,
  Play,
  Pencil,
  LayoutDashboard,
  ShoppingBag,
  Sprout,
  GraduationCap,
  Calendar,
  DollarSign,
  ArrowLeft,
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

interface Advertisement {
  id: string; supplierId: string; supplierName: string;
  type: 'banner' | 'featured-product' | 'sponsored-content' | 'sidebar';
  placement: 'dashboard' | 'marketplace' | 'farm-portal' | 'training';
  title: string; description: string; image: string; targetUrl: string;
  startDate: string; endDate: string;
  impressions: number; clicks: number; ctr: number;
  budget: number; spent: number;
  status: 'active' | 'paused' | 'completed' | 'pending-review';
}

const suppliers: Supplier[] = [
  { id: 'SUP-001', companyName: 'Zambezi Agri-Supplies', contactName: 'Farai Ndlovu', email: 'farai@zambezi-agri.co.zw', phone: '+263 77 200 1001', country: 'Zimbabwe', region: 'Harare', category: 'input-supplier', status: 'active', joinDate: '2024-06-15', logo: 'https://images.unsplash.com/photo-1560693225-b8507d6f3aa9?w=400&h=300&fit=crop', description: 'Leading agricultural input supplier across Southern Africa.', productsCount: 38, totalSales: 1847320, totalOrders: 4215, rating: 4.8, reviewCount: 312, memberDiscountPercent: 12, commissionRate: 8, isFounding: true, sponsorshipTier: 'platinum', verified: true, website: 'https://zambezi-agri.co.zw', certifications: ['ISO 9001', 'GlobalGAP Approved', 'SADC Trade Certified'] },
];

const advertisements: Advertisement[] = [
  { id: 'AD-001', supplierId: 'SUP-001', supplierName: 'Zambezi Agri-Supplies', type: 'banner', placement: 'dashboard', title: 'Season Opening Sale - 20% Off All Seeds', description: 'Start your planting season right with premium certified seeds from Zambezi Agri-Supplies.', image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=300&fit=crop', targetUrl: 'https://afu-portal.com/marketplace/supplier/SUP-001', startDate: '2026-02-15', endDate: '2026-04-15', impressions: 34500, clicks: 1725, ctr: 5.0, budget: 3500, spent: 2450, status: 'active' },
  { id: 'AD-002', supplierId: 'SUP-002', supplierName: 'Kalahari Seeds Co.', type: 'featured-product', placement: 'marketplace', title: 'New: Drought-Resistant Sorghum Macia Variety', description: 'Introducing the Macia sorghum variety - bred for Botswana conditions.', image: 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=400&h=300&fit=crop', targetUrl: 'https://afu-portal.com/marketplace/product/SPROD-001', startDate: '2026-01-10', endDate: '2026-03-31', impressions: 28900, clicks: 1878, ctr: 6.5, budget: 2500, spent: 2125, status: 'active' },
  { id: 'AD-003', supplierId: 'SUP-003', supplierName: 'TechFarm Solutions', type: 'sponsored-content', placement: 'training', title: 'Smart Farming: How IoT Sensors Boost Yields by 30%', description: 'Learn how TechFarm IoT sensors are helping African farmers monitor soil conditions in real-time.', image: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=400&h=300&fit=crop', targetUrl: 'https://afu-portal.com/training/webinar/smart-farming-iot', startDate: '2026-02-01', endDate: '2026-05-01', impressions: 12400, clicks: 868, ctr: 7.0, budget: 1800, spent: 1080, status: 'active' },
  { id: 'AD-004', supplierId: 'SUP-009', supplierName: 'Chobe Irrigation Systems', type: 'banner', placement: 'farm-portal', title: 'Save Water, Grow More - Drip Irrigation Special', description: 'Complete 1-hectare drip irrigation kits now available at 10% member discount.', image: 'https://images.unsplash.com/photo-1622383563227-04401ab4e5ea?w=400&h=300&fit=crop', targetUrl: 'https://afu-portal.com/marketplace/product/SPROD-020', startDate: '2026-01-20', endDate: '2026-04-20', impressions: 19800, clicks: 1188, ctr: 6.0, budget: 2800, spent: 1960, status: 'active' },
  { id: 'AD-005', supplierId: 'SUP-004', supplierName: 'Matopos Equipment Hire', type: 'sidebar', placement: 'marketplace', title: 'Hire-to-Own: Walk-Behind Tractors', description: 'Get mechanized without the upfront cost.', image: 'https://images.unsplash.com/photo-1530267981375-f0de937f5f13?w=400&h=300&fit=crop', targetUrl: 'https://afu-portal.com/marketplace/product/SPROD-015', startDate: '2025-11-01', endDate: '2026-04-30', impressions: 42300, clicks: 2538, ctr: 6.0, budget: 5000, spent: 4250, status: 'active' },
  { id: 'AD-006', supplierId: 'SUP-016', supplierName: 'Makgadikgadi Drones', type: 'featured-product', placement: 'farm-portal', title: 'Drone Crop Spraying - Book Your Season Flights', description: 'Professional drone spraying services available across Botswana.', image: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=400&h=300&fit=crop', targetUrl: 'https://afu-portal.com/marketplace/product/SPROD-028', startDate: '2026-02-10', endDate: '2026-05-10', impressions: 8700, clicks: 609, ctr: 7.0, budget: 1500, spent: 750, status: 'active' },
  { id: 'AD-007', supplierId: 'SUP-008', supplierName: 'Limpopo Agri-Finance', type: 'banner', placement: 'dashboard', title: 'Crop Insurance from BWP 50/month - Protect Your Harvest', description: 'Weather-index crop insurance now available for AFU members.', image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop', targetUrl: 'https://afu-portal.com/financial-services/insurance', startDate: '2025-12-01', endDate: '2026-03-31', impressions: 48200, clicks: 2892, ctr: 6.0, budget: 4500, spent: 4275, status: 'active' },
  { id: 'AD-008', supplierId: 'SUP-010', supplierName: 'Kilimanjaro Organic Inputs', type: 'sponsored-content', placement: 'training', title: 'Organic Farming Masterclass: Soil Health Fundamentals', description: 'Join our 4-week online course on organic soil management.', image: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=400&h=300&fit=crop', targetUrl: 'https://afu-portal.com/training/organic-masterclass', startDate: '2026-01-15', endDate: '2026-03-15', impressions: 6800, clicks: 544, ctr: 8.0, budget: 800, spent: 800, status: 'completed' },
  { id: 'AD-009', supplierId: 'SUP-006', supplierName: 'Okavango Fertilizers', type: 'sidebar', placement: 'dashboard', title: 'Bulk Fertilizer Orders - Free Delivery Over $200', description: 'Order NPK, Urea, or SSP in bulk and get free delivery.', image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop', targetUrl: 'https://afu-portal.com/marketplace/supplier/SUP-006', startDate: '2026-02-01', endDate: '2026-04-01', impressions: 22100, clicks: 1105, ctr: 5.0, budget: 1200, spent: 840, status: 'active' },
  { id: 'AD-010', supplierId: 'SUP-011', supplierName: 'Hwange Solar & Pumps', type: 'featured-product', placement: 'marketplace', title: 'Solar-Powered Farm: Complete Off-Grid Kits', description: 'Power your entire farm operation with solar energy.', image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=300&fit=crop', targetUrl: 'https://afu-portal.com/marketplace/product/SPROD-040', startDate: '2025-10-15', endDate: '2026-01-15', impressions: 31200, clicks: 1872, ctr: 6.0, budget: 2200, spent: 2200, status: 'completed' },
  { id: 'AD-011', supplierId: 'SUP-017', supplierName: 'Chimanimani Grain Storage', type: 'sidebar', placement: 'farm-portal', title: 'Reduce Post-Harvest Loss by 90%', description: 'Hermetic grain bags and metal silos keeping your harvest safe from weevils and moisture.', image: 'https://images.unsplash.com/photo-1504370805625-d32c54b16100?w=400&h=300&fit=crop', targetUrl: 'https://afu-portal.com/marketplace/product/SPROD-032', startDate: '2026-03-01', endDate: '2026-06-01', impressions: 5400, clicks: 378, ctr: 7.0, budget: 900, spent: 270, status: 'active' },
  { id: 'AD-012', supplierId: 'SUP-005', supplierName: 'Safari Logistics Ltd', type: 'banner', placement: 'marketplace', title: 'Reliable Farm-to-Market Transport', description: 'Refrigerated and dry cargo transport across Tanzania.', image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=300&fit=crop', targetUrl: 'https://afu-portal.com/logistics/safari-logistics', startDate: '2025-09-01', endDate: '2025-12-31', impressions: 38700, clicks: 1548, ctr: 4.0, budget: 3000, spent: 3000, status: 'completed' },
  { id: 'AD-013', supplierId: 'SUP-019', supplierName: 'Mmegi Digital Agriculture', type: 'sponsored-content', placement: 'dashboard', title: 'FarmTrack Pro: Digital Record Keeping for Modern Farmers', description: 'Stop using paper notebooks. FarmTrack Pro helps you track every input.', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop', targetUrl: 'https://afu-portal.com/marketplace/product/SPROD-027', startDate: '2026-03-01', endDate: '2026-06-30', impressions: 3200, clicks: 256, ctr: 8.0, budget: 1000, spent: 200, status: 'active' },
  { id: 'AD-014', supplierId: 'SUP-021', supplierName: 'Zanzibar Spice Exports', type: 'featured-product', placement: 'training', title: 'Spice Value Addition: From Farm to Export Market', description: 'Learn how to process, grade, and package spices for international markets.', image: 'https://images.unsplash.com/photo-1590682680695-43b964a3ae17?w=400&h=300&fit=crop', targetUrl: 'https://afu-portal.com/marketplace/supplier/SUP-021', startDate: '2026-01-01', endDate: '2026-02-28', impressions: 4500, clicks: 315, ctr: 7.0, budget: 600, spent: 600, status: 'completed' },
  { id: 'AD-015', supplierId: 'SUP-022', supplierName: 'Tuli Block Livestock Feeds', type: 'sidebar', placement: 'farm-portal', title: 'Quality Livestock Feeds - Delivered to Your Farm', description: 'Premium cattle feeds, poultry layers mash, and mineral supplements.', image: 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=400&h=300&fit=crop', targetUrl: 'https://afu-portal.com/marketplace/supplier/SUP-022', startDate: '2026-03-10', endDate: '2026-06-10', impressions: 1200, clicks: 72, ctr: 6.0, budget: 500, spent: 100, status: 'pending-review' },
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
const supplierAds = advertisements.filter((a) => a.supplierId === currentSupplier.id);

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatCompact(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString();
}

function formatCurrency(value: number): string {
  return `$${value.toLocaleString()}`;
}

// ── KPI calculations ────────────────────────────────────────────────────────

const activeCampaigns = supplierAds.filter((a) => a.status === 'active').length;
const totalImpressions = supplierAds.reduce((sum, a) => sum + a.impressions, 0);
const totalClicks = supplierAds.reduce((sum, a) => sum + a.clicks, 0);
const avgCTR =
  supplierAds.length > 0
    ? (supplierAds.reduce((sum, a) => sum + a.ctr, 0) / supplierAds.length).toFixed(1)
    : '0.0';

// ── Badge colors ────────────────────────────────────────────────────────────

const typeBadgeColors: Record<string, string> = {
  banner: 'bg-blue-100 text-blue-700',
  'featured-product': 'bg-purple-100 text-purple-700',
  'sponsored-content': 'bg-amber-100 text-amber-700',
  sidebar: 'bg-gray-100 text-gray-600',
};

const typeLabels: Record<string, string> = {
  banner: 'Banner',
  'featured-product': 'Featured',
  'sponsored-content': 'Sponsored',
  sidebar: 'Sidebar',
};

const placementBadgeColors: Record<string, string> = {
  dashboard: 'bg-indigo-100 text-indigo-700',
  marketplace: 'bg-teal-100 text-teal-700',
  'farm-portal': 'bg-green-100 text-green-700',
  training: 'bg-orange-100 text-orange-700',
};

const placementLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  marketplace: 'Marketplace',
  'farm-portal': 'Farm Portal',
  training: 'Training',
};

const placementIcons: Record<string, React.ReactNode> = {
  dashboard: <LayoutDashboard className="w-3 h-3" />,
  marketplace: <ShoppingBag className="w-3 h-3" />,
  'farm-portal': <Sprout className="w-3 h-3" />,
  training: <GraduationCap className="w-3 h-3" />,
};

const statusBadgeColors: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  paused: 'bg-amber-100 text-amber-700',
  completed: 'bg-gray-100 text-gray-500',
  'pending-review': 'bg-blue-100 text-blue-700',
};

const statusLabels: Record<string, string> = {
  active: 'Active',
  paused: 'Paused',
  completed: 'Completed',
  'pending-review': 'Pending',
};

// ── Performance chart data ──────────────────────────────────────────────────

const performanceData = supplierAds
  .filter((a) => a.status === 'active' || a.status === 'completed')
  .map((a) => ({
    name: a.title.length > 20 ? a.title.substring(0, 20) + '...' : a.title,
    impressions: a.impressions,
    clicks: a.clicks,
  }));

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
      <p className="font-semibold text-navy mb-1">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-gray-600">{entry.name}:</span>
          <span className="font-medium text-navy">{formatCompact(entry.value)}</span>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function AdvertisingDashboard() {
  const [campaignStatuses, setCampaignStatuses] = useState<Record<string, string>>(
    Object.fromEntries(supplierAds.map((a) => [a.id, a.status]))
  );

  const handleTogglePause = (adId: string) => {
    setCampaignStatuses((prev) => ({
      ...prev,
      [adId]: prev[adId] === 'active' ? 'paused' : prev[adId] === 'paused' ? 'active' : prev[adId],
    }));
  };

  // ── KPI cards data ────────────────────────────────────────────────────────

  const kpiCards = [
    {
      label: 'Active Campaigns',
      value: activeCampaigns.toString(),
      icon: <Megaphone className="w-5 h-5" />,
      color: 'text-[#8CB89C]',
      bgColor: 'bg-[#8CB89C]/10',
    },
    {
      label: 'Total Impressions',
      value: formatCompact(totalImpressions),
      icon: <Eye className="w-5 h-5" />,
      color: 'text-[#1B2A4A]',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Total Clicks',
      value: formatCompact(totalClicks),
      icon: <MousePointerClick className="w-5 h-5" />,
      color: 'text-[#D4A843]',
      bgColor: 'bg-amber-50',
    },
    {
      label: 'Avg CTR',
      value: `${avgCTR}%`,
      icon: <Target className="w-5 h-5" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
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
            <h1 className="text-2xl font-bold text-[#1B2A4A]">Advertising</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Manage your campaigns and track performance across the AFU portal
            </p>
          </div>
        </div>
        <Link
          href="/supplier/advertising/create"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-white text-sm font-medium transition-all hover:shadow-lg"
          style={{ background: 'linear-gradient(135deg, #D4A843 0%, #B8912E 100%)' }}
        >
          <Plus className="w-4 h-4" />
          Create Campaign
        </Link>
      </motion.div>

      {/* ══════════════════════════════════════════════════════════════════
          KPI ROW
      ═════════════════════════════════════════════════════════════════ */}
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {kpiCards.map((kpi, i) => (
          <motion.div
            key={i}
            variants={cardVariants}
            whileHover={{ y: -2, boxShadow: '0 8px 25px rgba(27,42,74,0.08)' }}
            className="bg-white rounded-xl p-5 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg ${kpi.bgColor} flex items-center justify-center ${kpi.color}`}>
                {kpi.icon}
              </div>
              <TrendingUp className="w-4 h-4 text-green-400" />
            </div>
            <p className="text-2xl font-bold text-[#1B2A4A]">{kpi.value}</p>
            <p className="text-xs text-gray-500 mt-1">{kpi.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* ══════════════════════════════════════════════════════════════════
          PERFORMANCE CHART
      ═════════════════════════════════════════════════════════════════ */}
      <motion.div
        variants={cardVariants}
        className="bg-white rounded-xl border border-gray-100 p-5"
      >
        <h3 className="font-semibold text-[#1B2A4A] text-sm mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#8CB89C]" />
          Campaign Performance Overview
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={performanceData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => formatCompact(v)} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="impressions" fill="#8CB89C" radius={[4, 4, 0, 0]} name="Impressions" />
              <Bar dataKey="clicks" fill="#D4A843" radius={[4, 4, 0, 0]} name="Clicks" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════════════════════════
          CAMPAIGN LIST
      ═════════════════════════════════════════════════════════════════ */}
      <motion.div variants={containerVariants} className="space-y-4">
        <h3 className="font-semibold text-[#1B2A4A] text-sm flex items-center gap-2">
          <Megaphone className="w-4 h-4 text-[#8CB89C]" />
          Your Campaigns ({supplierAds.length})
        </h3>

        {supplierAds.map((ad, i) => {
          const currentStatus = campaignStatuses[ad.id] || ad.status;
          const budgetPct = Math.round((ad.spent / ad.budget) * 100);
          const canToggle = currentStatus === 'active' || currentStatus === 'paused';

          return (
            <motion.div
              key={ad.id}
              variants={cardVariants}
              whileHover={{ y: -1, boxShadow: '0 6px 20px rgba(27,42,74,0.06)' }}
              className="bg-white rounded-xl border border-gray-100 p-5 transition-shadow"
            >
              {/* Top row: title, badges, status */}
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3 mb-4">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-[#1B2A4A] text-base mb-2 truncate">
                    {ad.title}
                  </h4>
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Type badge */}
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full font-medium ${
                        typeBadgeColors[ad.type] || 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {typeLabels[ad.type] || ad.type}
                    </span>
                    {/* Placement badge */}
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full font-medium ${
                        placementBadgeColors[ad.placement] || 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {placementIcons[ad.placement]}
                      {placementLabels[ad.placement] || ad.placement}
                    </span>
                    {/* Status badge */}
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full font-medium ${
                        statusBadgeColors[currentStatus] || 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          currentStatus === 'active'
                            ? 'bg-green-500'
                            : currentStatus === 'paused'
                              ? 'bg-amber-500'
                              : currentStatus === 'completed'
                                ? 'bg-gray-400'
                                : 'bg-blue-500'
                        }`}
                      />
                      {statusLabels[currentStatus] || currentStatus}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {canToggle && (
                    <button
                      onClick={() => handleTogglePause(ad.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        currentStatus === 'active'
                          ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                          : 'bg-green-50 text-green-700 hover:bg-green-100'
                      }`}
                    >
                      {currentStatus === 'active' ? (
                        <>
                          <Pause className="w-3.5 h-3.5" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5" />
                          Resume
                        </>
                      )}
                    </button>
                  )}
                  <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors">
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </button>
                </div>
              </div>

              {/* Metrics row */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Impressions</p>
                    <p className="text-sm font-semibold text-[#1B2A4A] tabular-nums">
                      {formatCompact(ad.impressions)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MousePointerClick className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Clicks</p>
                    <p className="text-sm font-semibold text-[#1B2A4A] tabular-nums">
                      {formatCompact(ad.clicks)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">CTR</p>
                    <p className="text-sm font-semibold text-[#8CB89C] tabular-nums">{ad.ctr}%</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Budget</p>
                    <p className="text-sm font-semibold text-[#1B2A4A] tabular-nums">
                      {formatCurrency(ad.budget)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Date Range</p>
                    <p className="text-xs font-medium text-[#1B2A4A]">
                      {new Date(ad.startDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}{' '}
                      -{' '}
                      {new Date(ad.endDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Budget progress */}
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${budgetPct}%` }}
                    transition={{ duration: 0.8, delay: 0.2 + i * 0.05, ease: 'easeOut' }}
                    className={`h-2.5 rounded-full ${
                      budgetPct >= 90 ? 'bg-red-400' : budgetPct >= 70 ? 'bg-[#D4A843]' : 'bg-[#8CB89C]'
                    }`}
                  />
                </div>
                <span className="text-xs text-gray-500 tabular-nums whitespace-nowrap min-w-[140px] text-right">
                  {formatCurrency(ad.spent)} / {formatCurrency(ad.budget)} ({budgetPct}%)
                </span>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}
