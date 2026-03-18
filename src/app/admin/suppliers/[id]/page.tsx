'use client';

import { useState, useMemo, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  ArrowLeft,
  ShieldCheck,
  MapPin,
  Globe,
  Mail,
  Phone,
  Calendar,
  Star,
  StarHalf,
  Award,
  Package,
  DollarSign,
  BarChart3,
  FileText,
  Pencil,
  Ban,
  CheckCircle2,
  Settings,
  ExternalLink,
  TrendingUp,
  Users,
  BadgeCheck,
  Clock,
  Percent,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { SupplierCategory, SponsorshipTier } from '@/lib/supabase/types';
import type { SupplierRow } from '@/lib/supabase/use-suppliers';

// ── Animation variants ────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 260, damping: 24 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

// ── Helpers ───────────────────────────────────────────────────────────────

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toLocaleString()}`;
}

const categoryLabels: Record<SupplierCategory, string> = {
  'input-supplier': 'Input Supplier',
  equipment: 'Equipment',
  logistics: 'Logistics',
  processing: 'Processing',
  technology: 'Technology',
  'financial-services': 'Financial Services',
};

const categoryColors: Record<SupplierCategory, string> = {
  'input-supplier': 'bg-green-100 text-green-700',
  equipment: 'bg-blue-100 text-blue-700',
  logistics: 'bg-purple-100 text-purple-700',
  processing: 'bg-orange-100 text-orange-700',
  technology: 'bg-cyan-100 text-cyan-700',
  'financial-services': 'bg-amber-100 text-amber-700',
};

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  pending: 'bg-amber-100 text-amber-700',
  suspended: 'bg-red-100 text-red-700',
};

const tierColors: Record<SponsorshipTier, string> = {
  platinum: 'bg-gray-100 text-gray-800 border border-gray-300',
  gold: 'bg-yellow-50 text-yellow-700 border border-yellow-300',
  silver: 'bg-gray-50 text-gray-600 border border-gray-200',
  bronze: 'bg-orange-50 text-orange-700 border border-orange-200',
};

function RatingStars({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.3 && rating - fullStars < 0.8;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);
  const iconSize = size === 'md' ? 'w-4 h-4' : 'w-3.5 h-3.5';

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: fullStars }).map((_, i) => (
        <Star key={`f${i}`} className={`${iconSize} fill-yellow-400 text-yellow-400`} />
      ))}
      {hasHalf && <StarHalf className={`${iconSize} fill-yellow-400 text-yellow-400`} />}
      {Array.from({ length: emptyStars }).map((_, i) => (
        <Star key={`e${i}`} className={`${iconSize} text-gray-200`} />
      ))}
    </div>
  );
}

// ── Mock data generators ──────────────────────────────────────────────────

function generateMonthlySales(totalSales: number) {
  const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const base = totalSales / 12;
  return months.map((month, i) => ({
    month,
    sales: Math.round(base * (0.6 + Math.random() * 0.8) * (1 + i * 0.03)),
    orders: Math.round((base / 200) * (0.7 + Math.random() * 0.6)),
  }));
}

function generateProducts(category: SupplierCategory, count: number) {
  const productNames: Record<SupplierCategory, string[]> = {
    'input-supplier': [
      'Hybrid Maize Seed 25kg', 'NPK Fertilizer 50kg', 'Organic Compost Blend', 'Foliar Spray 5L',
      'Seed Dressing 1L', 'Urea Granules 50kg', 'Potassium Chloride 25kg', 'Bio-Stimulant 10L',
      'Drip Tape 500m Roll', 'Cowpea Seed 10kg', 'Sorghum Seed 20kg', 'Groundnut Seed 15kg',
    ],
    equipment: [
      'Solar Water Pump 3HP', 'Drip Irrigation Kit (1ha)', 'Hand Planter Pro', 'Tractor Plough 3-Furrow',
      'Grain Mill Electric', 'Sprayer Backpack 20L', 'Borehole Pump Solar', 'Disc Harrow 16-Disc',
      'Ox-Drawn Planter', 'Chaff Cutter Electric', 'Thresher Machine', 'Wheelbarrow Heavy Duty',
    ],
    logistics: [
      'Cold Chain Transport', 'Grain Haulage (per ton)', 'Last-Mile Delivery', 'Warehouse Storage (monthly)',
      'Cross-Border Permit', 'Container Freight', 'Refrigerated Van Hire', 'Customs Brokerage',
    ],
    processing: [
      'Grain Cleaning Service', 'Flour Milling (per ton)', 'Oil Extraction Service', 'Packaging Service',
      'Quality Testing', 'Moisture Testing', 'Grading Service', 'Fumigation Service',
      'Hermetic Storage Bags', 'Metal Silo 5-Ton',
    ],
    technology: [
      'IoT Soil Sensor Kit', 'Drone Mapping (per ha)', 'Farm Management App', 'Weather Station Pro',
      'NDVI Analysis Report', 'GPS Field Mapping', 'Livestock Tracking Tags', 'Data Analytics Platform',
    ],
    'financial-services': [
      'Crop Insurance Plan', 'Input Finance Package', 'Working Capital Loan', 'Savings Account',
      'Mobile Money Integration', 'Equipment Lease', 'Invoice Financing',
    ],
  };

  const names = productNames[category];
  const images = [
    'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=300&h=200&fit=crop',
    'https://images.unsplash.com/photo-1530267981375-f0de937f5f13?w=300&h=200&fit=crop',
    'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=300&h=200&fit=crop',
    'https://images.unsplash.com/photo-1622383563227-04401ab4e5ea?w=300&h=200&fit=crop',
    'https://images.unsplash.com/photo-1560693225-b8507d6f3aa9?w=300&h=200&fit=crop',
    'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=300&h=200&fit=crop',
    'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=300&h=200&fit=crop',
    'https://images.unsplash.com/photo-1504370805625-d32c54b16100?w=300&h=200&fit=crop',
  ];

  return Array.from({ length: Math.min(count, names.length) }).map((_, i) => {
    const price = Math.round((50 + Math.random() * 500) * 10) / 10;
    const discountPct = 5 + Math.floor(Math.random() * 15);
    return {
      id: `PRD-${String(i + 1).padStart(3, '0')}`,
      name: names[i % names.length],
      price,
      memberPrice: Math.round(price * (1 - discountPct / 100) * 10) / 10,
      discountPct,
      image: images[i % images.length],
      inStock: Math.random() > 0.15,
      soldCount: Math.floor(Math.random() * 200 + 10),
    };
  });
}

function generateCommissionHistory(commissionRate: number, totalSales: number) {
  const months = [
    'Oct 2025', 'Nov 2025', 'Dec 2025', 'Jan 2026', 'Feb 2026', 'Mar 2026',
  ];
  return months.map((month, i) => {
    const sales = Math.round((totalSales / 12) * (0.7 + Math.random() * 0.6));
    const rate = commissionRate;
    const commission = Math.round(sales * (rate / 100));
    return {
      month,
      sales,
      rate,
      commission,
      status: i < 5 ? 'paid' : 'pending',
    };
  });
}

const topSellingData = [
  { name: 'Product A', sales: 4200 },
  { name: 'Product B', sales: 3800 },
  { name: 'Product C', sales: 2900 },
  { name: 'Product D', sales: 2100 },
  { name: 'Product E', sales: 1600 },
];

const demographicsData = [
  { name: 'Smallholder', value: 45, color: '#2AA198' },
  { name: 'Commercial', value: 30, color: '#1B2A4A' },
  { name: 'Enterprise', value: 15, color: '#D4A843' },
  { name: 'Cooperative', value: 10, color: '#2D4A7A' },
];

// ── Recharts tooltip ──────────────────────────────────────────────────────

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
          <span className="font-medium text-navy">
            {typeof entry.value === 'number' ? formatCurrency(entry.value) : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Tab definitions ───────────────────────────────────────────────────────

type TabKey = 'overview' | 'products' | 'analytics' | 'commissions';

const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: 'overview', label: 'Overview', icon: <FileText className="w-4 h-4" /> },
  { key: 'products', label: 'Products', icon: <Package className="w-4 h-4" /> },
  { key: 'analytics', label: 'Sales Analytics', icon: <BarChart3 className="w-4 h-4" /> },
  { key: 'commissions', label: 'Commission History', icon: <DollarSign className="w-4 h-4" /> },
];

// ═══════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function SupplierDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [supplier, setSupplier] = useState<SupplierRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('overview');

  // Fetch supplier from Supabase
  useEffect(() => {
    const supabase = createClient();
    supabase
      .from('suppliers')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (!error && data) setSupplier(data as SupplierRow);
        setLoading(false);
      });
  }, [id]);

  // Generate data based on supplier
  const monthlySales = useMemo(
    () => (supplier ? generateMonthlySales(supplier.total_sales) : []),
    [supplier]
  );
  const products = useMemo(
    () => (supplier ? generateProducts(supplier.category, supplier.products_count) : []),
    [supplier]
  );
  const commissionHistory = useMemo(
    () => (supplier ? generateCommissionHistory(supplier.commission_rate, supplier.total_sales) : []),
    [supplier]
  );

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-teal mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="text-sm text-gray-500">Loading supplier details...</p>
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Package className="w-12 h-12 text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-navy mb-2">Supplier Not Found</h2>
        <p className="text-sm text-gray-500 mb-4">
          No supplier exists with ID &quot;{id}&quot;
        </p>
        <Link
          href="/admin/suppliers"
          className="inline-flex items-center gap-2 text-teal hover:text-teal-dark font-medium text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Suppliers
        </Link>
      </div>
    );
  }

  const totalCommission = commissionHistory.reduce((sum, row) => sum + row.commission, 0);
  const paidCommission = commissionHistory
    .filter((r) => r.status === 'paid')
    .reduce((sum, r) => sum + r.commission, 0);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* ── Back link ────────────────────────────────────────────────────── */}
      <motion.div variants={fadeUp}>
        <Link
          href="/admin/suppliers"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-navy transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Suppliers
        </Link>
      </motion.div>

      {/* ── Header Card ──────────────────────────────────────────────────── */}
      <motion.div
        variants={cardVariants}
        className="bg-white rounded-xl border border-gray-100 p-6"
      >
        <div className="flex flex-col lg:flex-row lg:items-start gap-6">
          {/* Logo + Info */}
          <div className="flex items-start gap-4 flex-1">
            <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
              <img
                src={supplier.logo_url || '/placeholder-logo.png'}
                alt={supplier.company_name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-navy">{supplier.company_name}</h1>
                {supplier.verified && (
                  <span className="inline-flex items-center gap-1 text-xs bg-teal/10 text-teal px-2 py-0.5 rounded-full font-medium">
                    <ShieldCheck className="w-3 h-3" />
                    Verified
                  </span>
                )}
                {supplier.is_founding && (
                  <span className="inline-flex items-center gap-1 text-xs bg-navy/10 text-navy px-2 py-0.5 rounded-full font-medium">
                    <Award className="w-3 h-3" />
                    Founding Member
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1">{supplier.contact_name}</p>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <span className={`inline-block text-xs px-2.5 py-0.5 rounded-full font-medium ${categoryColors[supplier.category]}`}>
                  {categoryLabels[supplier.category]}
                </span>
                <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-medium ${statusColors[supplier.status]}`}>
                  {supplier.status.charAt(0).toUpperCase() + supplier.status.slice(1)}
                </span>
                {supplier.sponsorship_tier && (
                  <span className={`inline-block text-xs px-2.5 py-0.5 rounded-full font-medium ${tierColors[supplier.sponsorship_tier]}`}>
                    {supplier.sponsorship_tier.charAt(0).toUpperCase() + supplier.sponsorship_tier.slice(1)} Sponsor
                  </span>
                )}
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <MapPin className="w-3 h-3" />
                  {supplier.region}, {supplier.country}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <RatingStars rating={supplier.rating} size="md" />
                <span className="text-sm font-medium text-navy">{supplier.rating.toFixed(1)}</span>
                <span className="text-xs text-gray-400">({supplier.review_count} reviews)</span>
              </div>
            </div>
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3 lg:w-72">
            <div className="bg-cream rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500">Products</p>
              <p className="text-lg font-bold text-navy">{supplier.products_count}</p>
            </div>
            <div className="bg-cream rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500">Total Sales</p>
              <p className="text-lg font-bold text-navy">{formatCurrency(supplier.total_sales)}</p>
            </div>
            <div className="bg-cream rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500">Orders</p>
              <p className="text-lg font-bold text-navy">{supplier.total_orders.toLocaleString()}</p>
            </div>
            <div className="bg-cream rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500">Commission</p>
              <p className="text-lg font-bold text-navy">{supplier.commission_rate}%</p>
            </div>
          </div>
        </div>

        {/* Admin Actions */}
        <div className="flex flex-wrap gap-2 mt-5 pt-5 border-t border-gray-100">
          <button className="inline-flex items-center gap-1.5 px-4 py-2 bg-navy hover:bg-navy/90 text-white rounded-lg text-sm font-medium transition-colors">
            <Pencil className="w-3.5 h-3.5" />
            Edit Profile
          </button>
          <button className="inline-flex items-center gap-1.5 px-4 py-2 bg-gold hover:bg-gold/90 text-white rounded-lg text-sm font-medium transition-colors">
            <Award className="w-3.5 h-3.5" />
            Change Tier
          </button>
          {supplier.status === 'active' ? (
            <button className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors">
              <Ban className="w-3.5 h-3.5" />
              Suspend
            </button>
          ) : supplier.status === 'pending' ? (
            <button className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Approve
            </button>
          ) : (
            <button className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Activate
            </button>
          )}
          <button className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-colors">
            <Settings className="w-3.5 h-3.5" />
            Adjust Commission Rate
          </button>
        </div>
      </motion.div>

      {/* ── Tab Navigation ───────────────────────────────────────────────── */}
      <motion.div variants={fadeUp} className="bg-white rounded-xl border border-gray-100">
        <div className="flex border-b border-gray-100 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.key
                  ? 'border-teal text-teal'
                  : 'border-transparent text-gray-500 hover:text-navy hover:border-gray-200'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-5">
          <AnimatePresence mode="wait">
            {/* ── Overview Tab ──────────────────────────────────────────── */}
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="space-y-6"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Contact Info */}
                  <motion.div variants={cardVariants} className="space-y-4">
                    <h3 className="font-semibold text-navy text-sm">Contact Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-teal/10 flex items-center justify-center text-teal">
                          <Mail className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Email</p>
                          <a href={`mailto:${supplier.email}`} className="text-sm text-navy hover:text-teal transition-colors">
                            {supplier.email}
                          </a>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-teal/10 flex items-center justify-center text-teal">
                          <Phone className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Phone</p>
                          <p className="text-sm text-navy">{supplier.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-teal/10 flex items-center justify-center text-teal">
                          <Globe className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Website</p>
                          <a
                            href={supplier.website || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-teal hover:text-teal-dark flex items-center gap-1 transition-colors"
                          >
                            {supplier.website} <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-teal/10 flex items-center justify-center text-teal">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Location</p>
                          <p className="text-sm text-navy">{supplier.region}, {supplier.country}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-teal/10 flex items-center justify-center text-teal">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Joined</p>
                          <p className="text-sm text-navy">
                            {new Date(supplier.join_date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Description + Rates */}
                  <motion.div variants={cardVariants} className="space-y-5">
                    <div>
                      <h3 className="font-semibold text-navy text-sm mb-2">About</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{supplier.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-cream rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <Percent className="w-4 h-4 text-teal" />
                          <p className="text-xs text-gray-500">Member Discount</p>
                        </div>
                        <p className="text-xl font-bold text-navy">{supplier.member_discount_percent}%</p>
                        <p className="text-xs text-gray-400">Off retail price</p>
                      </div>
                      <div className="bg-cream rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <DollarSign className="w-4 h-4 text-gold" />
                          <p className="text-xs text-gray-500">Commission Rate</p>
                        </div>
                        <p className="text-xl font-bold text-navy">{supplier.commission_rate}%</p>
                        <p className="text-xs text-gray-400">Per transaction</p>
                      </div>
                    </div>

                    {/* Certifications */}
                    <div>
                      <h3 className="font-semibold text-navy text-sm mb-2">Certifications</h3>
                      {supplier.certifications.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {supplier.certifications.map((cert, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded-full font-medium"
                            >
                              <BadgeCheck className="w-3 h-3" />
                              {cert}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400">No certifications listed</p>
                      )}
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* ── Products Tab ─────────────────────────────────────────── */}
            {activeTab === 'products' && (
              <motion.div
                key="products"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-navy text-sm">
                    Products ({products.length})
                  </h3>
                  <span className="text-xs text-gray-400">
                    Member discount: {supplier.member_discount_percent}% off
                  </span>
                </div>
                {products.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {products.map((product) => (
                      <motion.div
                        key={product.id}
                        variants={cardVariants}
                        className="bg-cream rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition-shadow"
                      >
                        <div className="h-32 bg-gray-100">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-3">
                          <div className="flex items-start justify-between mb-1">
                            <h4 className="text-sm font-medium text-navy line-clamp-2 flex-1">
                              {product.name}
                            </h4>
                            {product.inStock ? (
                              <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium ml-1 whitespace-nowrap">
                                In Stock
                              </span>
                            ) : (
                              <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-medium ml-1 whitespace-nowrap">
                                Out of Stock
                              </span>
                            )}
                          </div>
                          <div className="flex items-baseline gap-2 mt-2">
                            <span className="text-sm font-bold text-navy">${product.memberPrice.toFixed(2)}</span>
                            <span className="text-xs text-gray-400 line-through">${product.price.toFixed(2)}</span>
                            <span className="text-[10px] bg-teal/10 text-teal px-1.5 py-0.5 rounded-full font-medium">
                              -{product.discountPct}%
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">{product.soldCount} sold</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="py-16 text-center">
                    <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">No products listed yet</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* ── Sales Analytics Tab ──────────────────────────────────── */}
            {activeTab === 'analytics' && (
              <motion.div
                key="analytics"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="space-y-6"
              >
                {/* Monthly Sales Area Chart */}
                <motion.div variants={cardVariants}>
                  <h3 className="font-semibold text-navy text-sm mb-4">Monthly Sales Performance</h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={monthlySales} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                        <defs>
                          <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2AA198" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#2AA198" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => formatCurrency(v)} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                          type="monotone"
                          dataKey="sales"
                          stroke="#2AA198"
                          strokeWidth={2.5}
                          fill="url(#salesGradient)"
                          name="Sales"
                          dot={{ fill: '#2AA198', r: 3, strokeWidth: 0 }}
                          activeDot={{ fill: '#2AA198', r: 5, strokeWidth: 2, stroke: '#fff' }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Top Selling Products Bar Chart */}
                  <motion.div variants={cardVariants}>
                    <h3 className="font-semibold text-navy text-sm mb-4">Top Selling Products</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={topSellingData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                          <XAxis type="number" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                          <YAxis
                            type="category"
                            dataKey="name"
                            tick={{ fontSize: 11, fill: '#9CA3AF' }}
                            axisLine={false}
                            tickLine={false}
                            width={80}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar dataKey="sales" fill="#1B2A4A" radius={[0, 4, 4, 0]} name="Units Sold" barSize={24} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </motion.div>

                  {/* Customer Demographics Donut */}
                  <motion.div variants={cardVariants}>
                    <h3 className="font-semibold text-navy text-sm mb-4">Customer Demographics</h3>
                    <div className="h-64 flex items-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={demographicsData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={3}
                            dataKey="value"
                            nameKey="name"
                            stroke="none"
                          >
                            {demographicsData.map((entry, index) => (
                              <Cell key={index} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value) => `${value}%`}
                            contentStyle={{
                              borderRadius: '8px',
                              border: '1px solid #f0f0f0',
                              fontSize: '12px',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                            }}
                          />
                          <Legend
                            iconType="circle"
                            iconSize={8}
                            wrapperStyle={{ fontSize: '11px' }}
                            formatter={(value: string) => <span className="text-gray-600">{value}</span>}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </motion.div>
                </div>

                {/* Quick Stats */}
                <motion.div variants={cardVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-cream rounded-lg p-4">
                    <div className="flex items-center gap-2 text-teal mb-1">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-xs text-gray-500">Avg. Order Value</span>
                    </div>
                    <p className="text-lg font-bold text-navy">
                      ${supplier.total_orders > 0 ? Math.round(supplier.total_sales / supplier.total_orders).toLocaleString() : 0}
                    </p>
                  </div>
                  <div className="bg-cream rounded-lg p-4">
                    <div className="flex items-center gap-2 text-navy mb-1">
                      <Users className="w-4 h-4" />
                      <span className="text-xs text-gray-500">Unique Customers</span>
                    </div>
                    <p className="text-lg font-bold text-navy">
                      {supplier.total_orders > 0 ? Math.round(supplier.total_orders * 0.65) : 0}
                    </p>
                  </div>
                  <div className="bg-cream rounded-lg p-4">
                    <div className="flex items-center gap-2 text-gold mb-1">
                      <Star className="w-4 h-4" />
                      <span className="text-xs text-gray-500">Repeat Rate</span>
                    </div>
                    <p className="text-lg font-bold text-navy">
                      {supplier.total_orders > 0 ? '35%' : '0%'}
                    </p>
                  </div>
                  <div className="bg-cream rounded-lg p-4">
                    <div className="flex items-center gap-2 text-green-600 mb-1">
                      <Package className="w-4 h-4" />
                      <span className="text-xs text-gray-500">Fulfillment Rate</span>
                    </div>
                    <p className="text-lg font-bold text-navy">
                      {supplier.total_orders > 0 ? '97.2%' : '0%'}
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* ── Commission History Tab ───────────────────────────────── */}
            {activeTab === 'commissions' && (
              <motion.div
                key="commissions"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="space-y-6"
              >
                {/* Summary Cards */}
                <motion.div variants={cardVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-cream rounded-lg p-4">
                    <p className="text-xs text-gray-500 mb-1">Total Commission Earned</p>
                    <p className="text-2xl font-bold text-navy">{formatCurrency(totalCommission)}</p>
                    <p className="text-xs text-gray-400 mt-1">Last 6 months</p>
                  </div>
                  <div className="bg-cream rounded-lg p-4">
                    <p className="text-xs text-gray-500 mb-1">Paid Out</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(paidCommission)}</p>
                    <p className="text-xs text-gray-400 mt-1">5 of 6 months settled</p>
                  </div>
                  <div className="bg-cream rounded-lg p-4">
                    <p className="text-xs text-gray-500 mb-1">Pending Payout</p>
                    <p className="text-2xl font-bold text-amber-600">{formatCurrency(totalCommission - paidCommission)}</p>
                    <p className="text-xs text-gray-400 mt-1">Current month</p>
                  </div>
                </motion.div>

                {/* Commission Table */}
                <motion.div variants={cardVariants} className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Month
                        </th>
                        <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Sales
                        </th>
                        <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Rate
                        </th>
                        <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Commission
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {commissionHistory.map((row, i) => (
                        <motion.tr
                          key={i}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.05 }}
                          className="hover:bg-cream/50 transition-colors"
                        >
                          <td className="py-3 px-4 font-medium text-navy">{row.month}</td>
                          <td className="py-3 px-4 text-right text-navy tabular-nums">{formatCurrency(row.sales)}</td>
                          <td className="py-3 px-4 text-right text-gray-500 tabular-nums">{row.rate}%</td>
                          <td className="py-3 px-4 text-right font-semibold text-navy tabular-nums">
                            {formatCurrency(row.commission)}
                          </td>
                          <td className="py-3 px-4">
                            {row.status === 'paid' ? (
                              <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                                <CheckCircle2 className="w-3 h-3" />
                                Paid
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                                <Clock className="w-3 h-3" />
                                Pending
                              </span>
                            )}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-gray-200 bg-cream/50">
                        <td className="py-3 px-4 font-bold text-navy">Total</td>
                        <td className="py-3 px-4 text-right font-bold text-navy tabular-nums">
                          {formatCurrency(commissionHistory.reduce((s, r) => s + r.sales, 0))}
                        </td>
                        <td className="py-3 px-4 text-right text-gray-500 tabular-nums">{supplier.commission_rate}%</td>
                        <td className="py-3 px-4 text-right font-bold text-navy tabular-nums">
                          {formatCurrency(totalCommission)}
                        </td>
                        <td className="py-3 px-4" />
                      </tr>
                    </tfoot>
                  </table>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
