'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import GettingStarted from '@/components/ui/GettingStarted';
import {
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Package,
  ShoppingCart,
  Percent,
  Eye,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Star,
  Plus,
  ClipboardList,
  Megaphone,
  BarChart3,
  MousePointerClick,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/supabase/auth-context';
import VideoCard from '@/components/VideoCard';

// ── Inline types ────────────────────────────────────────────────────────────

type SupplierCategory = 'input-supplier' | 'equipment' | 'logistics' | 'processing' | 'technology' | 'financial-services';
type SponsorshipTier = 'platinum' | 'gold' | 'silver' | 'bronze';
type Country = string;

interface Supplier {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  country: Country;
  region: string;
  category: SupplierCategory;
  status: 'active' | 'pending' | 'suspended';
  joinDate: string;
  logo: string;
  description: string;
  productsCount: number;
  totalSales: number;
  totalOrders: number;
  rating: number;
  reviewCount: number;
  memberDiscountPercent: number;
  commissionRate: number;
  isFounding: boolean;
  sponsorshipTier: SponsorshipTier | null;
  verified: boolean;
  website: string;
  certifications: string[];
}

interface SupplierProduct {
  id: string;
  supplierId: string;
  supplierName: string;
  name: string;
  description: string;
  category: 'seeds' | 'fertilizer' | 'pesticides' | 'equipment' | 'irrigation' | 'technology' | 'packaging' | 'storage' | 'tools';
  price: number;
  memberPrice: number;
  currency: string;
  unit: string;
  image: string;
  availability: 'in-stock' | 'limited' | 'pre-order' | 'out-of-stock';
  rating: number;
  reviewCount: number;
  soldCount: number;
  tags: string[];
  featured: boolean;
  minOrder: number;
}

interface Commission {
  id: string;
  supplierId: string;
  supplierName: string;
  orderId: string;
  productName: string;
  buyerName: string;
  buyerType: 'smallholder' | 'commercial' | 'enterprise' | 'cooperative';
  orderAmount: number;
  commissionRate: number;
  commissionAmount: number;
  status: 'pending' | 'approved' | 'paid' | 'disputed';
  orderDate: string;
  paymentDate: string | null;
}

interface Advertisement {
  id: string;
  supplierId: string;
  supplierName: string;
  type: 'banner' | 'featured-product' | 'sponsored-content' | 'sidebar';
  placement: 'dashboard' | 'marketplace' | 'farm-portal' | 'training';
  title: string;
  description: string;
  image: string;
  targetUrl: string;
  startDate: string;
  endDate: string;
  impressions: number;
  clicks: number;
  ctr: number;
  budget: number;
  spent: number;
  status: 'active' | 'paused' | 'completed' | 'pending-review';
}

// ── Inline fallback data ────────────────────────────────────────────────────

const FALLBACK_SUPPLIERS: Supplier[] = [];

const FALLBACK_SUPPLIER_PRODUCTS: SupplierProduct[] = [];

const FALLBACK_ALL_COMMISSIONS: Commission[] = [];


const FALLBACK_ALL_ADVERTISEMENTS: Advertisement[] = [];

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

// ── Static fallback context ──────────────────────────────────────────────────

const FALLBACK_SUPPLIER: Supplier = {
  id: '',
  companyName: 'Your Company',
  contactName: '',
  email: '',
  phone: '',
  country: '',
  region: '',
  category: 'input-supplier',
  status: 'pending',
  joinDate: new Date().toISOString(),
  logo: '',
  description: '',
  productsCount: 0,
  totalSales: 0,
  totalOrders: 0,
  rating: 0,
  reviewCount: 0,
  memberDiscountPercent: 0,
  commissionRate: 0,
  isFounding: false,
  sponsorshipTier: null,
  verified: false,
  website: '',
  certifications: [],
};
const FALLBACK_PRODUCTS: SupplierProduct[] = [];
const FALLBACK_COMMISSIONS: Commission[] = [];
const FALLBACK_ADS: Advertisement[] = [];

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toLocaleString()}`;
}

function formatCompact(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return value.toLocaleString();
}

// ── Fallback KPI calculations ───────────────────────────────────────────────

const FALLBACK_TOTAL_REVENUE = FALLBACK_SUPPLIER.totalSales;
const FALLBACK_ACTIVE_PRODUCTS = FALLBACK_PRODUCTS.length;
const FALLBACK_PENDING_ORDERS = 0;
const FALLBACK_COMMISSION_BALANCE = FALLBACK_COMMISSIONS
  .filter((c) => c.status === 'pending')
  .reduce((sum, c) => sum + c.commissionAmount, 0);
const FALLBACK_AD_IMPRESSIONS = FALLBACK_ADS.reduce((sum, a) => sum + a.impressions, 0);
const FALLBACK_MEMBER_REACH = 0;

// ── Order status colors ─────────────────────────────────────────────────────

const orderStatusColors: Record<string, string> = {
  delivered: 'bg-green-100 text-green-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-amber-100 text-amber-700',
  new: 'bg-gray-100 text-gray-600',
};

// ── Mock recent orders ──────────────────────────────────────────────────────

const FALLBACK_RECENT_ORDERS: { id: string; product: string; buyer: string; amount: number; status: string; date: string }[] = [];

// ── Mock top products ───────────────────────────────────────────────────────

const FALLBACK_TOP_PRODUCTS: { name: string; unitsSold: number; revenue: number; rating: number; trend: "up" | "down" }[] = [];

// ── Monthly sales trend data ────────────────────────────────────────────────

const FALLBACK_SALES_TREND: { month: string; sales: number }[] = [];

// ── Commission donut data ───────────────────────────────────────────────────

const FALLBACK_COMMISSION_PAID = FALLBACK_COMMISSIONS
  .filter((c) => c.status === 'paid')
  .reduce((sum, c) => sum + c.commissionAmount, 0);
const FALLBACK_COMMISSION_APPROVED = FALLBACK_COMMISSIONS
  .filter((c) => c.status === 'approved')
  .reduce((sum, c) => sum + c.commissionAmount, 0);
const FALLBACK_COMMISSION_PENDING = FALLBACK_COMMISSIONS
  .filter((c) => c.status === 'pending')
  .reduce((sum, c) => sum + c.commissionAmount, 0);

const FALLBACK_COMMISSION_DONUT = [
  { name: 'Paid', value: FALLBACK_COMMISSION_PAID, color: '#8CB89C' },
  { name: 'Approved', value: FALLBACK_COMMISSION_APPROVED, color: '#D4A843' },
  { name: 'Pending', value: FALLBACK_COMMISSION_PENDING, color: '#1B2A4A' },
];

const FALLBACK_COMMISSION_TOTAL = FALLBACK_COMMISSION_PAID + FALLBACK_COMMISSION_APPROVED + FALLBACK_COMMISSION_PENDING;

// ── Active ads (top 3) ──────────────────────────────────────────────────────

const FALLBACK_ACTIVE_ADS = FALLBACK_ALL_ADVERTISEMENTS
  .filter((a) => a.status === 'active')
  .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
  .slice(0, 3);

// ── Ad type badge colors ────────────────────────────────────────────────────

const adTypeBadge: Record<string, string> = {
  banner: 'bg-blue-100 text-blue-700',
  'featured-product': 'bg-purple-100 text-purple-700',
  'sponsored-content': 'bg-amber-100 text-amber-700',
  sidebar: 'bg-gray-100 text-gray-600',
};

const adTypeLabels: Record<string, string> = {
  banner: 'Banner',
  'featured-product': 'Featured',
  'sponsored-content': 'Sponsored',
  sidebar: 'Sidebar',
};

// ── Recharts custom tooltip ─────────────────────────────────────────────────

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

// ═══════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function SupplierDashboard() {
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null);

  // ── Live data from Supabase ─────────────────────────────────────────────
  const { user, profile } = useAuth();
  const supabase = createClient();

  // Live supplier profile for the logged-in user
  const [liveSupplier, setLiveSupplier] = useState<Supplier | null>(null);
  // Live dashboard stats
  const [liveStats, setLiveStats] = useState<{
    totalRevenue: number;
    activeProducts: number;
    pendingOrders: number;
    totalOrders: number;
  } | null>(null);
  // Live recent orders
  const [liveRecentOrders, setLiveRecentOrders] = useState<typeof FALLBACK_RECENT_ORDERS | null>(null);
  const [dbLoading, setDbLoading] = useState(true);

  // Supplier resource videos
  const [supplierVideos, setSupplierVideos] = useState<Array<{title: string; url: string; thumbnail?: string; is_featured?: boolean; duration?: string}>>([]);

  useEffect(() => {
    supabase.from('site_config').select('value').eq('key', 'video_section').maybeSingle()
      .then(({ data }) => {
        if (data?.value) {
          const vids = (typeof data.value === 'string' ? JSON.parse(data.value) : data.value) as any[];
          setSupplierVideos(vids.filter((v: any) => v.url));
        }
      });
  }, []);

  const fetchLiveDashboard = useCallback(async () => {
    if (!user) { setDbLoading(false); return; }

    try {
      // 1. Fetch supplier profile linked to current user
      const { data: supplierRow } = await supabase
        .from('suppliers')
        .select('id, company_name, contact_name, email, phone, country, region, category, status, join_date, created_at, logo_url, description, products_count, total_sales, total_orders, rating, review_count, member_discount_percent, commission_rate, is_founding, sponsorship_tier, verified, website, certifications')
        .eq('profile_id', user.id)
        .single();

      if (!supplierRow) { setDbLoading(false); return; }

      const supplierId = supplierRow.id;

      // Map DB row to local Supplier shape
      setLiveSupplier({
        id: supplierRow.id,
        companyName: supplierRow.company_name,
        contactName: supplierRow.contact_name,
        email: supplierRow.email,
        phone: supplierRow.phone || '',
        country: supplierRow.country as Country,
        region: supplierRow.region || '',
        category: supplierRow.category as SupplierCategory,
        status: supplierRow.status,
        joinDate: supplierRow.join_date || supplierRow.created_at,
        logo: supplierRow.logo_url || '',
        description: supplierRow.description || '',
        productsCount: supplierRow.products_count || 0,
        totalSales: supplierRow.total_sales || 0,
        totalOrders: supplierRow.total_orders || 0,
        rating: supplierRow.rating || 0,
        reviewCount: supplierRow.review_count || 0,
        memberDiscountPercent: supplierRow.member_discount_percent || 0,
        commissionRate: supplierRow.commission_rate || 0,
        isFounding: supplierRow.is_founding || false,
        sponsorshipTier: supplierRow.sponsorship_tier || null,
        verified: supplierRow.verified || false,
        website: supplierRow.website || '',
        certifications: supplierRow.certifications || [],
      });

      // 2. Fetch dashboard stats in parallel
      // NOTE: orders table has no reliable supplier_id — use order_items
      const [orderItemsRes, productsRes] = await Promise.all([
        supabase
          .from('order_items')
          .select('order_id, total_price, order:orders(status)')
          .eq('supplier_id', supplierId),
        supabase
          .from('products')
          .select('id', { count: 'exact', head: true })
          .eq('supplier_id', supplierId),
      ]);

      const orderItems = orderItemsRes.data || [];
      // Deduplicate order IDs to count distinct orders
      const uniqueOrderIds = new Set(orderItems.map((oi: any) => oi.order_id));
      const totalRev = orderItems.reduce(
        (sum: number, oi: any) => sum + (Number(oi.total_price) || 0),
        0
      );
      const pendingCount = orderItems.filter((oi: any) => {
        const status = (oi.order as any)?.status;
        return status === 'pending' || status === 'processing' || status === 'new';
      }).length;

      setLiveStats({
        totalRevenue: totalRev || supplierRow.total_sales || 0,
        activeProducts: productsRes.count || supplierRow.products_count || 0,
        pendingOrders: pendingCount,
        totalOrders: uniqueOrderIds.size || supplierRow.total_orders || 0,
      });

      // 3. Fetch recent orders via order_items -> orders -> members -> profiles
      const { data: recentItems } = await supabase
        .from('order_items')
        .select(`
          order_id,
          total_price,
          product:products(name),
          order:orders(
            id,
            order_number,
            status,
            created_at,
            member:members(
              profile:profiles(full_name)
            )
          )
        `)
        .eq('supplier_id', supplierId)
        .order('created_at', { ascending: false })
        .limit(8);

      if (recentItems && recentItems.length > 0) {
        setLiveRecentOrders(
          recentItems.map((item: any) => ({
            id: item.order?.order_number || item.order_id,
            product: item.product?.name || 'Order',
            buyer: item.order?.member?.profile?.full_name || 'Customer',
            amount: Number(item.total_price) || 0,
            status: item.order?.status || 'new',
            date: item.order?.created_at
              ? new Date(item.order.created_at).toISOString().slice(0, 10)
              : '',
          }))
        );
      }
    } catch {
      // On any error, fallback data will be used (liveSupplier stays null)
    } finally {
      setDbLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    fetchLiveDashboard();
  }, [fetchLiveDashboard]);

  // ── Empty state: no suppliers row exists for this user yet ────────────────
  if (!dbLoading && !liveSupplier) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="w-16 h-16 rounded-full bg-[#8CB89C]/10 flex items-center justify-center mx-auto mb-6">
            <Package className="w-8 h-8 text-[#8CB89C]" />
          </div>
          <h1 className="text-2xl font-bold text-[#1B2A4A] mb-3">Welcome!</h1>
          <p className="text-gray-600 mb-6">
            Complete your profile to start selling on the AFU marketplace.
          </p>
          <Link
            href="/supplier/profile"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-sm transition-all hover:shadow-lg"
            style={{ background: 'linear-gradient(135deg, #8CB89C, #729E82)' }}
          >
            Complete Your Profile
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  // ── Resolve live vs fallback data ─────────────────────────────────────────
  const supplier = liveSupplier || FALLBACK_SUPPLIER;
  const totalRevenue = liveStats?.totalRevenue ?? FALLBACK_TOTAL_REVENUE;
  const activeProductsCount = liveStats?.activeProducts ?? FALLBACK_ACTIVE_PRODUCTS;
  const pendingOrdersCount = liveStats?.pendingOrders ?? FALLBACK_PENDING_ORDERS;
  const commissionBalance = FALLBACK_COMMISSION_BALANCE; // commissions not yet in DB — keep fallback
  const totalAdImpressions = FALLBACK_AD_IMPRESSIONS;    // ads not yet in DB — keep fallback
  const memberReach = FALLBACK_MEMBER_REACH;
  const displayRecentOrders = liveRecentOrders || FALLBACK_RECENT_ORDERS;
  const commissionDonutData = FALLBACK_COMMISSION_DONUT;
  const commissionTotal = FALLBACK_COMMISSION_TOTAL;
  const activeAds = FALLBACK_ACTIVE_ADS;
  const supplierCommissionsForMonth = FALLBACK_COMMISSIONS;

  // ── Top-level stat cards data ───────────────────────────────────────────
  const statCards: { label: string; value: string; change: string | null; changeType: 'up' | 'down' | 'neutral'; icon: React.ReactNode; color: string; bgColor: string }[] = [
    {
      label: 'Total Revenue',
      value: formatCurrency(totalRevenue),
      change: null,
      changeType: 'neutral' as const,
      icon: <DollarSign className="w-5 h-5" />,
      color: 'text-[#8CB89C]',
      bgColor: 'bg-[#8CB89C]/10',
    },
    {
      label: 'Active Products',
      value: activeProductsCount.toString(),
      change: null,
      changeType: 'neutral' as const,
      icon: <Package className="w-5 h-5" />,
      color: 'text-navy',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Pending Orders',
      value: pendingOrdersCount.toString(),
      change: null,
      changeType: 'neutral' as const,
      icon: <ShoppingCart className="w-5 h-5" />,
      color: 'text-gold',
      bgColor: 'bg-amber-50',
    },
    {
      label: 'Commission Balance',
      value: formatCurrency(commissionBalance),
      change: null,
      changeType: 'neutral' as const,
      icon: <Percent className="w-5 h-5" />,
      color: 'text-[#8CB89C]',
      bgColor: 'bg-[#8CB89C]/10',
    },
    {
      label: 'Ad Impressions',
      value: formatCompact(totalAdImpressions),
      change: null,
      changeType: 'neutral' as const,
      icon: <Eye className="w-5 h-5" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'Member Reach',
      value: memberReach.toLocaleString(),
      change: null,
      changeType: 'neutral' as const,
      icon: <Users className="w-5 h-5" />,
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
      {/* Getting Started */}
      <GettingStarted
        title="Set Up Your Supplier Portal"
        storageKey="afu_supplier_onboarding"
        steps={[
          { id: 'profile', label: 'Complete your company profile', href: '/supplier/profile', check: () => !!liveSupplier?.companyName },
          { id: 'logo', label: 'Upload your company logo', href: '/supplier/profile', check: () => !!profile?.avatar_url },
          { id: 'product', label: 'Add your first product', href: '/supplier/products', check: () => (liveStats?.activeProducts || 0) > 0 },
          { id: 'estimate', label: 'Create your first estimate', href: '/supplier/estimates', check: () => false },
        ]}
      />

      {/* ══════════════════════════════════════════════════════════════════
          1. WELCOME BANNER
      ═════════════════════════════════════════════════════════════════ */}
      <motion.div
        variants={fadeUp}
        className="rounded-xl p-6 text-white relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #8CB89C 0%, #729E82 100%)',
        }}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-8 -right-8 w-48 h-48 rounded-full bg-white/20" />
          <div className="absolute -bottom-12 -left-12 w-64 h-64 rounded-full bg-white/10" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {supplier.companyName}!</h1>
            <p className="text-white/80 text-sm mt-1">
              {supplier.sponsorshipTier
                ? `${supplier.sponsorshipTier.charAt(0).toUpperCase() + supplier.sponsorshipTier.slice(1)} Sponsor`
                : 'Active Supplier'}{' '}
              &bull; Member since {new Date(supplier.joinDate).getFullYear()}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/supplier/products"
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </Link>
            <Link
              href="/supplier/orders"
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <ClipboardList className="w-4 h-4" />
              View Orders
            </Link>
            <Link
              href="/supplier/billing"
              className="flex items-center gap-2 bg-white text-[#729E82] hover:bg-white/90 px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm"
            >
              <TrendingUp className="w-4 h-4" />
              Upgrade Plan
            </Link>
          </div>
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════════════════════════
          SPONSOR CAPABILITY BANNER
      ═════════════════════════════════════════════════════════════════ */}
      <motion.div variants={fadeUp}>
        {supplier.sponsorshipTier ? (
          <Link
            href="/supplier/sponsorship"
            className="flex items-center justify-between gap-3 rounded-xl border border-[#5DB347]/30 bg-gradient-to-r from-[#5DB347]/10 to-[#F5F0E1]/60 p-4 hover:border-[#5DB347]/60 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#5DB347] flex items-center justify-center flex-shrink-0">
                <Star className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#1B2A4A]">
                  Active sponsor:{' '}
                  <span className="capitalize">{supplier.sponsorshipTier}</span>
                </p>
                <p className="text-xs text-gray-600 mt-0.5">Manage your sponsorship tier</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[#5DB347] flex-shrink-0" />
          </Link>
        ) : (
          <Link
            href="/supplier/sponsorship"
            className="flex items-center justify-between gap-3 rounded-xl border border-[#F5F0E1] bg-gradient-to-r from-[#F5F0E1]/80 to-white p-4 hover:border-[#1B2A4A]/20 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#1B2A4A] flex items-center justify-center flex-shrink-0">
                <Megaphone className="w-5 h-5 text-[#5DB347]" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#1B2A4A]">
                  Sponsor a program for marketing exposure
                </p>
                <p className="text-xs text-gray-600 mt-0.5">
                  Reach more farmers by sponsoring AFU programs
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[#1B2A4A] flex-shrink-0" />
          </Link>
        )}
      </motion.div>

      {/* ══════════════════════════════════════════════════════════════════
          2. KPI STATS ROW
      ═════════════════════════════════════════════════════════════════ */}
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4"
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
              {stat.change && (
                <span
                  className={`text-xs font-medium px-1.5 py-0.5 rounded-full flex items-center gap-0.5 ${
                    stat.changeType === 'up'
                      ? 'bg-green-50 text-green-600'
                      : stat.changeType === 'down'
                        ? 'bg-red-50 text-red-600'
                        : 'bg-gray-50 text-gray-500'
                  }`}
                >
                  {stat.changeType === 'up' && <ArrowUpRight className="w-3 h-3" />}
                  {stat.changeType === 'down' && <ArrowDownRight className="w-3 h-3" />}
                  {stat.change}
                </span>
              )}
            </div>
            <p className="text-2xl font-bold text-navy">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* ══════════════════════════════════════════════════════════════════
          3. SALES TREND CHART
      ═════════════════════════════════════════════════════════════════ */}
      <motion.div
        variants={cardVariants}
        className="bg-white rounded-xl border border-gray-100 p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-navy text-sm flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#8CB89C]" />
            Sales Trend (12 Months)
          </h3>
          <span className="text-xs text-gray-400">
            Updated: {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={FALLBACK_SALES_TREND} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8CB89C" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8CB89C" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 11, fill: '#9CA3AF' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => formatCurrency(v)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="sales"
                stroke="#8CB89C"
                strokeWidth={2.5}
                fill="url(#salesGradient)"
                name="Sales"
                dot={{ fill: '#8CB89C', r: 3, strokeWidth: 0 }}
                activeDot={{ fill: '#8CB89C', r: 5, strokeWidth: 2, stroke: '#fff' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════════════════════════
          4. RECENT ORDERS (2/3) + TOP PRODUCTS (1/3)
      ═════════════════════════════════════════════════════════════════ */}
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* ── Recent Orders Table ──────────────────────────────────────── */}
        <motion.div
          variants={cardVariants}
          className="lg:col-span-2 bg-white rounded-xl border border-gray-100 overflow-hidden"
        >
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-navy text-sm">Recent Orders</h3>
            <Link
              href="/supplier/orders"
              className="text-[#8CB89C] text-xs font-medium hover:text-[#729E82] flex items-center gap-1 transition-colors"
            >
              View All Orders <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="text-left py-2.5 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="text-left py-2.5 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="text-left py-2.5 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Buyer
                  </th>
                  <th className="text-right py-2.5 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="text-left py-2.5 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left py-2.5 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {displayRecentOrders.map((order) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-cream/50 transition-colors cursor-default"
                  >
                    <td className="py-2.5 px-4 text-xs font-mono text-gray-500">{order.id}</td>
                    <td className="py-2.5 px-4">
                      <span className="font-medium text-navy text-sm">{order.product}</span>
                    </td>
                    <td className="py-2.5 px-4 text-gray-600 text-xs">{order.buyer}</td>
                    <td className="py-2.5 px-4 text-right font-medium text-navy text-sm tabular-nums">
                      ${order.amount.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-4">
                      <span
                        className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                          orderStatusColors[order.status] || 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-xs text-gray-400">{order.date}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* ── Top Products ─────────────────────────────────────────────── */}
        <motion.div
          variants={cardVariants}
          className="bg-white rounded-xl border border-gray-100 overflow-hidden"
        >
          <div className="p-5 border-b border-gray-100">
            <h3 className="font-semibold text-navy text-sm">Top Products</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {FALLBACK_TOP_PRODUCTS.map((product, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                onMouseEnter={() => setHoveredProduct(i)}
                onMouseLeave={() => setHoveredProduct(null)}
                className="px-4 py-3 hover:bg-cream/50 transition-colors cursor-default"
              >
                <div className="flex items-start justify-between mb-1">
                  <span className="font-medium text-navy text-sm leading-tight">{product.name}</span>
                  <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                    {product.trend === 'up' ? (
                      <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5 text-red-400" />
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{product.unitsSold.toLocaleString()} sold</span>
                  <span className="font-medium text-navy tabular-nums">{formatCurrency(product.revenue)}</span>
                </div>
                <div className="flex items-center gap-1 mt-1.5">
                  {Array.from({ length: 5 }).map((_, si) => (
                    <Star
                      key={si}
                      className={`w-3 h-3 ${
                        si < Math.floor(product.rating)
                          ? 'text-[#D4A843] fill-[#D4A843]'
                          : si < product.rating
                            ? 'text-[#D4A843] fill-[#D4A843]/50'
                            : 'text-gray-200'
                      }`}
                    />
                  ))}
                  <span className="text-[10px] text-gray-400 ml-1">{product.rating}</span>
                </div>
                {hoveredProduct === i && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-2 pt-2 border-t border-gray-100"
                  >
                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${FALLBACK_TOP_PRODUCTS.length > 0 ? (product.revenue / FALLBACK_TOP_PRODUCTS[0].revenue) * 100 : 0}%` }}
                        transition={{ duration: 0.4 }}
                        className="h-1.5 rounded-full bg-[#8CB89C]"
                      />
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* ══════════════════════════════════════════════════════════════════
          5. COMMISSION SUMMARY + ACTIVE ADVERTISEMENTS
      ═════════════════════════════════════════════════════════════════ */}
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* ── Commission Summary ───────────────────────────────────────── */}
        <motion.div
          variants={cardVariants}
          className="bg-white rounded-xl border border-gray-100 p-5"
        >
          <h3 className="font-semibold text-navy text-sm mb-4 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-[#8CB89C]" />
            Commission Summary
          </h3>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="h-52 w-52 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={commissionDonutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey="name"
                    stroke="none"
                  >
                    {commissionDonutData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value))}
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
            <div className="flex-1 space-y-4 w-full">
              <div className="bg-[#8CB89C]/5 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-0.5">Total All-Time</p>
                <p className="text-xl font-bold text-navy tabular-nums">{formatCurrency(commissionTotal)}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {commissionDonutData.map((item) => (
                  <div key={item.name} className="text-center">
                    <div className="w-2 h-2 rounded-full mx-auto mb-1" style={{ backgroundColor: item.color }} />
                    <p className="text-xs text-gray-500">{item.name}</p>
                    <p className="text-sm font-bold text-navy tabular-nums">{formatCurrency(item.value)}</p>
                  </div>
                ))}
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-0.5">This Month</p>
                <p className="text-lg font-bold text-navy tabular-nums">
                  {formatCurrency(
                    supplierCommissionsForMonth
                      .filter((c) => c.orderDate.startsWith('2026-03'))
                      .reduce((sum, c) => sum + c.commissionAmount, 0)
                  )}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Active Advertisements ────────────────────────────────────── */}
        <motion.div
          variants={cardVariants}
          className="bg-white rounded-xl border border-gray-100 overflow-hidden"
        >
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-navy text-sm flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-[#8CB89C]" />
              Active Advertisements
            </h3>
            <Link
              href="/supplier/advertising"
              className="text-[#8CB89C] text-xs font-medium hover:text-[#729E82] flex items-center gap-1 transition-colors"
            >
              Manage Ads <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {activeAds.map((ad, i) => {
              const budgetPct = Math.round((ad.spent / ad.budget) * 100);
              return (
                <motion.div
                  key={ad.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-4 hover:bg-cream/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-navy truncate">{ad.title}</p>
                      <span
                        className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-medium mt-1 ${
                          adTypeBadge[ad.type] || 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {adTypeLabels[ad.type] || ad.type}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-2.5">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {formatCompact(ad.impressions)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MousePointerClick className="w-3 h-3" />
                      {formatCompact(ad.clicks)}
                    </span>
                    <span className="flex items-center gap-1 font-medium text-[#8CB89C]">
                      CTR {ad.ctr}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${budgetPct}%` }}
                        transition={{ duration: 0.8, delay: 0.3 + i * 0.1, ease: 'easeOut' }}
                        className={`h-2 rounded-full ${
                          budgetPct >= 90 ? 'bg-red-400' : budgetPct >= 70 ? 'bg-[#D4A843]' : 'bg-[#8CB89C]'
                        }`}
                      />
                    </div>
                    <span className="text-[10px] text-gray-400 tabular-nums whitespace-nowrap">
                      ${ad.spent.toLocaleString()} / ${ad.budget.toLocaleString()} ({budgetPct}%)
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </motion.div>

      {/* ══════════════════════════════════════════════════════════════════
          SUPPLIER RESOURCES VIDEOS
      ═════════════════════════════════════════════════════════════════ */}
      {supplierVideos.length > 0 && (
        <motion.div variants={fadeUp} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-navy text-sm flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#8CB89C]" />
              Supplier Resources
            </h3>
            <Link
              href="/supplier/videos"
              className="text-[#8CB89C] text-xs font-medium hover:text-[#729E82] flex items-center gap-1 transition-colors"
            >
              Manage Your Videos <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-3">
            {supplierVideos.slice(0, 2).map((video, idx) => (
              <VideoCard
                key={idx}
                title={video.title}
                duration={video.duration || ''}
                thumbnailUrl={video.thumbnail || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&h=400&fit=crop'}
                videoUrl={video.url}
                size="small"
              />
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
