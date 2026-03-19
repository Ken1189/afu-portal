'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
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
import { suppliers as mockSuppliers } from '@/lib/data/suppliers';
import { supplierProducts as mockSupplierProducts } from '@/lib/data/supplierProducts';
import { commissions as mockCommissions } from '@/lib/data/commissions';
import { advertisements as mockAdvertisements } from '@/lib/data/advertisements';
import { useSuppliers } from '@/lib/supabase/use-suppliers';
import { useProducts } from '@/lib/supabase/use-products';
import { useAuth } from '@/lib/supabase/auth-context';

// ── Module-level aliases (keep component code unchanged) ────────────────────
const staticSuppliers = mockSuppliers;
const supplierProducts = mockSupplierProducts;
const commissions = mockCommissions;
const advertisements = mockAdvertisements;

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

const staticSupplier = staticSuppliers.find((s) => s.id === 'SUP-001')!;
const supplierProductsList = supplierProducts.filter((p) => p.supplierId === 'SUP-001');
const supplierCommissions = commissions.filter((c) => c.supplierId === 'SUP-001');
const supplierAds = advertisements.filter((a) => a.supplierId === 'SUP-001');

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

// ── KPI calculations ────────────────────────────────────────────────────────

const totalRevenue = staticSupplier.totalSales;
const activeProductsCount = supplierProductsList.length;
const pendingOrdersCount = 8;
const commissionBalance = supplierCommissions
  .filter((c) => c.status === 'pending')
  .reduce((sum, c) => sum + c.commissionAmount, 0);
const totalAdImpressions = supplierAds.reduce((sum, a) => sum + a.impressions, 0);
const memberReach = 1240;

// ── Order status colors ─────────────────────────────────────────────────────

const orderStatusColors: Record<string, string> = {
  delivered: 'bg-green-100 text-green-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-amber-100 text-amber-700',
  new: 'bg-gray-100 text-gray-600',
};

// ── Mock recent orders ──────────────────────────────────────────────────────

const recentOrders = [
  { id: 'ORD-2026-0301', product: 'Groundnut Seed (Nyanda)', buyer: 'Kgosi Mosweu', amount: 3900, status: 'delivered', date: '2026-03-14' },
  { id: 'ORD-2026-0298', product: 'Knapsack Sprayer x12', buyer: 'Mashonaland Growers', amount: 420, status: 'shipped', date: '2026-03-13' },
  { id: 'ORD-2026-0285', product: 'Metalaxyl + Mancozeb x10', buyer: 'Tatenda Chikaura', amount: 350, status: 'processing', date: '2026-03-12' },
  { id: 'ORD-2026-0271', product: 'Soil pH Test Kit x25', buyer: 'Chipinge Farmers Union', amount: 700, status: 'delivered', date: '2026-03-11' },
  { id: 'ORD-2026-0263', product: 'Pruning Shears x50', buyer: 'Mutare Orchards Co-op', amount: 600, status: 'delivered', date: '2026-03-10' },
  { id: 'ORD-2026-0254', product: 'Groundnut Seed (Nyanda)', buyer: 'Central District Co-op', amount: 5460, status: 'shipped', date: '2026-03-09' },
  { id: 'ORD-2026-0241', product: 'Knapsack Sprayer x8', buyer: 'Rudo Chidyamakono', amount: 280, status: 'new', date: '2026-03-08' },
  { id: 'ORD-2026-0233', product: 'Metalaxyl + Mancozeb x5', buyer: 'Sipho Dlamini', amount: 175, status: 'processing', date: '2026-03-07' },
];

// ── Mock top products ───────────────────────────────────────────────────────

const topProducts = [
  { name: 'Groundnut Seed (Nyanda)', unitsSold: 1678, revenue: 115_000, rating: 4.8, trend: 'up' as const },
  { name: 'Knapsack Sprayer (16L)', unitsSold: 3456, revenue: 106_680, rating: 4.3, trend: 'up' as const },
  { name: 'Metalaxyl + Mancozeb', unitsSold: 1345, revenue: 47_075, rating: 4.5, trend: 'up' as const },
  { name: 'Soil pH Test Kit (50)', unitsSold: 789, revenue: 22_092, rating: 4.4, trend: 'down' as const },
  { name: 'Pruning Shears (Pro)', unitsSold: 1234, revenue: 14_808, rating: 4.5, trend: 'up' as const },
];

// ── Monthly sales trend data ────────────────────────────────────────────────

const salesTrendData = [
  { month: 'Apr', sales: 98000 },
  { month: 'May', sales: 112000 },
  { month: 'Jun', sales: 134000 },
  { month: 'Jul', sales: 128000 },
  { month: 'Aug', sales: 156000 },
  { month: 'Sep', sales: 178000 },
  { month: 'Oct', sales: 165000 },
  { month: 'Nov', sales: 192000 },
  { month: 'Dec', sales: 148000 },
  { month: 'Jan', sales: 174000 },
  { month: 'Feb', sales: 188000 },
  { month: 'Mar', sales: 210000 },
];

// ── Commission donut data ───────────────────────────────────────────────────

const commissionPaid = supplierCommissions
  .filter((c) => c.status === 'paid')
  .reduce((sum, c) => sum + c.commissionAmount, 0);
const commissionApproved = supplierCommissions
  .filter((c) => c.status === 'approved')
  .reduce((sum, c) => sum + c.commissionAmount, 0);
const commissionPending = supplierCommissions
  .filter((c) => c.status === 'pending')
  .reduce((sum, c) => sum + c.commissionAmount, 0);

const commissionDonutData = [
  { name: 'Paid', value: commissionPaid, color: '#2AA198' },
  { name: 'Approved', value: commissionApproved, color: '#D4A843' },
  { name: 'Pending', value: commissionPending, color: '#1B2A4A' },
];

const commissionTotal = commissionPaid + commissionApproved + commissionPending;

// ── Active ads (top 3) ──────────────────────────────────────────────────────

const activeAds = advertisements
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

  // ── Top-level stat cards data ───────────────────────────────────────────
  const statCards: { label: string; value: string; change: string | null; changeType: 'up' | 'down' | 'neutral'; icon: React.ReactNode; color: string; bgColor: string }[] = [
    {
      label: 'Total Revenue',
      value: formatCurrency(totalRevenue),
      change: '+22%',
      changeType: 'up' as const,
      icon: <DollarSign className="w-5 h-5" />,
      color: 'text-[#2AA198]',
      bgColor: 'bg-[#2AA198]/10',
    },
    {
      label: 'Active Products',
      value: activeProductsCount.toString(),
      change: '+3',
      changeType: 'up' as const,
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
      color: 'text-[#2AA198]',
      bgColor: 'bg-[#2AA198]/10',
    },
    {
      label: 'Ad Impressions',
      value: formatCompact(totalAdImpressions),
      change: '+18%',
      changeType: 'up' as const,
      icon: <Eye className="w-5 h-5" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'Member Reach',
      value: memberReach.toLocaleString(),
      change: '+8%',
      changeType: 'up' as const,
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
      {/* ══════════════════════════════════════════════════════════════════
          1. WELCOME BANNER
      ═════════════════════════════════════════════════════════════════ */}
      <motion.div
        variants={fadeUp}
        className="rounded-xl p-6 text-white relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #2AA198 0%, #1A7A72 100%)',
        }}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-8 -right-8 w-48 h-48 rounded-full bg-white/20" />
          <div className="absolute -bottom-12 -left-12 w-64 h-64 rounded-full bg-white/10" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {staticSupplier.companyName}!</h1>
            <p className="text-white/80 text-sm mt-1">
              {staticSupplier.sponsorshipTier
                ? `${staticSupplier.sponsorshipTier.charAt(0).toUpperCase() + staticSupplier.sponsorshipTier.slice(1)} Sponsor`
                : 'Active Supplier'}{' '}
              &bull; Member since {new Date(staticSupplier.joinDate).getFullYear()}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/supplier/products/new"
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </Link>
            <Link
              href="/supplier/orders"
              className="flex items-center gap-2 bg-white text-[#1A7A72] hover:bg-white/90 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <ClipboardList className="w-4 h-4" />
              View Orders
            </Link>
          </div>
        </div>
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
            <BarChart3 className="w-4 h-4 text-[#2AA198]" />
            Sales Trend (12 Months)
          </h3>
          <span className="text-xs text-gray-400">
            Updated: {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={salesTrendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2AA198" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2AA198" stopOpacity={0} />
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
              className="text-[#2AA198] text-xs font-medium hover:text-[#1A7A72] flex items-center gap-1 transition-colors"
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
                {recentOrders.map((order) => (
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
            {topProducts.map((product, i) => (
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
                        animate={{ width: `${(product.revenue / topProducts[0].revenue) * 100}%` }}
                        transition={{ duration: 0.4 }}
                        className="h-1.5 rounded-full bg-[#2AA198]"
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
            <DollarSign className="w-4 h-4 text-[#2AA198]" />
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
              <div className="bg-[#2AA198]/5 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-0.5">Total All-Time</p>
                <p className="text-xl font-bold text-navy tabular-nums">{formatCurrency(commissionTotal)}</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
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
                    supplierCommissions
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
              <Megaphone className="w-4 h-4 text-[#2AA198]" />
              Active Advertisements
            </h3>
            <Link
              href="/supplier/advertisements"
              className="text-[#2AA198] text-xs font-medium hover:text-[#1A7A72] flex items-center gap-1 transition-colors"
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
                    <span className="flex items-center gap-1 font-medium text-[#2AA198]">
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
                          budgetPct >= 90 ? 'bg-red-400' : budgetPct >= 70 ? 'bg-[#D4A843]' : 'bg-[#2AA198]'
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
    </motion.div>
  );
}
