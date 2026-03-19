'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  ArrowLeft,
  Star,
  Package,
  ShoppingCart,
  Tag,
  Pencil,
  Trash2,
  Award,
  BadgePercent,
  BarChart3,
  MessageSquare,
  User,
  Calendar,
  ThumbsUp,
  ChevronRight,
  Layers,
} from 'lucide-react';
import { supplierProducts as mockSupplierProducts } from '@/lib/data/supplierProducts';
const supplierProducts = mockSupplierProducts;

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

// ── Category & availability config ──────────────────────────────────────────

const categoryColors: Record<string, string> = {
  seeds: 'bg-green-100 text-green-700',
  fertilizer: 'bg-amber-100 text-amber-700',
  pesticides: 'bg-red-100 text-red-700',
  equipment: 'bg-blue-100 text-blue-700',
  irrigation: 'bg-cyan-100 text-cyan-700',
  technology: 'bg-purple-100 text-purple-700',
  packaging: 'bg-orange-100 text-orange-700',
  storage: 'bg-slate-100 text-slate-700',
  tools: 'bg-indigo-100 text-indigo-700',
};

const categoryLabels: Record<string, string> = {
  seeds: 'Seeds',
  fertilizer: 'Fertilizer',
  pesticides: 'Pesticides',
  equipment: 'Equipment',
  irrigation: 'Irrigation',
  technology: 'Technology',
  packaging: 'Packaging',
  storage: 'Storage',
  tools: 'Tools',
};

const availabilityConfig: Record<string, { label: string; color: string }> = {
  'in-stock': { label: 'In Stock', color: 'bg-green-100 text-green-700' },
  limited: { label: 'Limited Stock', color: 'bg-amber-100 text-amber-700' },
  'pre-order': { label: 'Pre-Order', color: 'bg-blue-100 text-blue-700' },
  'out-of-stock': { label: 'Out of Stock', color: 'bg-red-100 text-red-700' },
};

// ── Mock sales data (last 6 months) ─────────────────────────────────────────

const salesData = [
  { month: 'Oct', units: 145, revenue: 9860 },
  { month: 'Nov', units: 178, revenue: 12104 },
  { month: 'Dec', units: 132, revenue: 8976 },
  { month: 'Jan', units: 198, revenue: 13464 },
  { month: 'Feb', units: 221, revenue: 15028 },
  { month: 'Mar', units: 256, revenue: 17408 },
];

// ── Mock reviews ────────────────────────────────────────────────────────────

const mockReviews = [
  {
    id: 'REV-001',
    author: 'Kgosi Mosweu',
    type: 'Commercial Farmer',
    rating: 5,
    date: '2026-03-08',
    text: 'Excellent product quality. The germination rate was outstanding at over 95%. Will definitely order again for next planting season. Delivery was prompt and packaging was intact.',
    helpful: 12,
  },
  {
    id: 'REV-002',
    author: 'Tatenda Chikaura',
    type: 'Smallholder',
    rating: 5,
    date: '2026-02-22',
    text: 'Very impressed with this product. It performed well even under the dry conditions we experienced this season. The member pricing made it very affordable for our cooperative members.',
    helpful: 8,
  },
  {
    id: 'REV-003',
    author: 'Central District Co-op',
    type: 'Cooperative',
    rating: 4,
    date: '2026-02-15',
    text: 'Good quality product overall. Our members have been using it consistently with positive results. Only reason for 4 stars is that delivery took slightly longer than expected.',
    helpful: 6,
  },
  {
    id: 'REV-004',
    author: 'Sipho Dlamini',
    type: 'Smallholder',
    rating: 5,
    date: '2026-01-28',
    text: 'Highly recommended for anyone in the region. Works exactly as described. The technical guide included was very helpful for first-time users. Great value at the member price.',
    helpful: 15,
  },
  {
    id: 'REV-005',
    author: 'Mutare Orchards Co-op',
    type: 'Cooperative',
    rating: 4,
    date: '2026-01-14',
    text: 'Solid product from a reliable supplier. We have been purchasing from Zambezi Agri-Supplies for three seasons now and they consistently deliver quality inputs. Recommended.',
    helpful: 9,
  },
];

// ── Gallery images (mock thumbnails reusing main image) ─────────────────────

function getGalleryImages(mainImage: string): string[] {
  return [
    mainImage,
    mainImage.replace('w=400', 'w=401'),
    mainImage.replace('w=400', 'w=402'),
    mainImage.replace('w=400', 'w=403'),
  ];
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatCurrency(value: number): string {
  return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatCompact(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toLocaleString()}`;
}

// ── Custom Tooltip ──────────────────────────────────────────────────────────

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
          <span className="font-medium text-[#1B2A4A]">
            {entry.name === 'Revenue' ? formatCompact(entry.value) : entry.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function SupplierProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;
  const product = supplierProducts.find((p) => p.id === productId);

  const [selectedImage, setSelectedImage] = useState(0);

  if (!product) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-lg font-semibold text-[#1B2A4A] mb-2">Product Not Found</h2>
          <p className="text-sm text-gray-500 mb-6">
            The product with ID &quot;{productId}&quot; could not be found.
          </p>
          <Link
            href="/supplier/products"
            className="inline-flex items-center gap-2 bg-[#2AA198] hover:bg-[#1A7A72] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const galleryImages = getGalleryImages(product.image);
  const discountPercent = Math.round(((product.price - product.memberPrice) / product.price) * 100);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* ══════════════════════════════════════════════════════════════════
          1. BACK BUTTON + HEADING
      ═════════════════════════════════════════════════════════════════ */}
      <motion.div variants={fadeUp} className="flex items-center gap-3">
        <Link
          href="/supplier/products"
          className="w-10 h-10 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 flex items-center justify-center transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-[#1B2A4A]" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-0.5">
            <Link href="/supplier/products" className="hover:text-[#2AA198] transition-colors">
              Products
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-600 truncate">{product.name}</span>
          </div>
          <h1 className="text-2xl font-bold text-[#1B2A4A] truncate">{product.name}</h1>
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════════════════════════
          2. MAIN CONTENT — TWO COLUMNS
      ═════════════════════════════════════════════════════════════════ */}
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* ── Left Column: Product Images ─────────────────────────────── */}
        <motion.div variants={cardVariants} className="space-y-3">
          {/* Main Image */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="relative aspect-[4/3] overflow-hidden">
              <img
                src={galleryImages[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.featured && (
                <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 bg-[#D4A843] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                  <Award className="w-3.5 h-3.5" />
                  Featured Product
                </div>
              )}
            </div>
          </div>

          {/* Gallery Thumbnails */}
          <div className="grid grid-cols-4 gap-2">
            {galleryImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                  selectedImage === idx
                    ? 'border-[#2AA198] shadow-md'
                    : 'border-gray-100 hover:border-gray-300'
                }`}
              >
                <img
                  src={img}
                  alt={`${product.name} view ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </motion.div>

        {/* ── Right Column: Product Info ──────────────────────────────── */}
        <motion.div variants={cardVariants} className="space-y-5">
          {/* Product Name + Badges */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span
                  className={`inline-block text-xs font-medium px-2.5 py-0.5 rounded-full ${
                    categoryColors[product.category] || 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {categoryLabels[product.category]}
                </span>
                {product.featured && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full bg-[#D4A843]/10 text-[#D4A843]">
                    <Star className="w-3 h-3 fill-[#D4A843]" />
                    Featured
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold text-[#1B2A4A] mb-1">{product.name}</h2>
              <p className="text-xs text-gray-400">Product ID: {product.id}</p>
            </div>

            {/* Price Section */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-baseline gap-3 mb-1">
                <span className="text-sm text-gray-400 line-through">
                  {formatCurrency(product.price)}
                </span>
                <span className="text-2xl font-bold text-[#2AA198]">
                  {formatCurrency(product.memberPrice)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-xs font-medium text-[#2AA198] bg-[#2AA198]/10 px-2 py-0.5 rounded-full">
                  <BadgePercent className="w-3 h-3" />
                  {discountPercent}% member discount
                </span>
                <span className="text-xs text-gray-400">{product.unit}</span>
              </div>
            </div>

            {/* Availability Badge */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-gray-500">Availability:</span>
              <span
                className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${
                  availabilityConfig[product.availability]?.color || 'bg-gray-100 text-gray-600'
                }`}
              >
                {availabilityConfig[product.availability]?.label || product.availability}
              </span>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, si) => (
                  <Star
                    key={si}
                    className={`w-4 h-4 ${
                      si < Math.floor(product.rating)
                        ? 'text-[#D4A843] fill-[#D4A843]'
                        : si < product.rating
                          ? 'text-[#D4A843] fill-[#D4A843]/50'
                          : 'text-gray-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-semibold text-[#1B2A4A]">{product.rating}</span>
              <span className="text-xs text-gray-400">({product.reviewCount} reviews)</span>
            </div>

            {/* Units Sold & Minimum Order */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#2AA198]/5 rounded-lg p-3">
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-0.5">
                  <ShoppingCart className="w-3.5 h-3.5" />
                  Units Sold
                </div>
                <p className="text-lg font-bold text-[#1B2A4A] tabular-nums">
                  {product.soldCount.toLocaleString()}
                </p>
              </div>
              <div className="bg-[#1B2A4A]/5 rounded-lg p-3">
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-0.5">
                  <Layers className="w-3.5 h-3.5" />
                  Minimum Order
                </div>
                <p className="text-lg font-bold text-[#1B2A4A] tabular-nums">
                  {product.minOrder} {product.minOrder === 1 ? 'unit' : 'units'}
                </p>
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Description
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Tags */}
            <div>
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Tags
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
              <button className="flex-1 inline-flex items-center justify-center gap-2 bg-[#2AA198] hover:bg-[#1A7A72] text-white px-4 py-3 rounded-xl text-sm font-semibold transition-colors">
                <Pencil className="w-4 h-4" />
                Edit Product
              </button>
              <button className="inline-flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-semibold transition-colors">
                <Trash2 className="w-4 h-4" />
                Remove Listing
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* ══════════════════════════════════════════════════════════════════
          3. SALES ANALYTICS
      ═════════════════════════════════════════════════════════════════ */}
      <motion.div
        variants={cardVariants}
        className="bg-white rounded-xl border border-gray-100 p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-[#1B2A4A] text-sm flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#2AA198]" />
            Sales Analytics (Last 6 Months)
          </h3>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-1 rounded-full bg-[#2AA198]" />
              Revenue
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-1 rounded-full bg-[#D4A843]" />
              Units
            </span>
          </div>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={salesData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2AA198" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2AA198" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis
                yAxisId="revenue"
                orientation="left"
                tick={{ fontSize: 11, fill: '#9CA3AF' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => formatCompact(v)}
              />
              <YAxis
                yAxisId="units"
                orientation="right"
                tick={{ fontSize: 11, fill: '#9CA3AF' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                yAxisId="revenue"
                type="monotone"
                dataKey="revenue"
                stroke="#2AA198"
                strokeWidth={2.5}
                name="Revenue"
                dot={{ fill: '#2AA198', r: 4, strokeWidth: 0 }}
                activeDot={{ fill: '#2AA198', r: 6, strokeWidth: 2, stroke: '#fff' }}
              />
              <Line
                yAxisId="units"
                type="monotone"
                dataKey="units"
                stroke="#D4A843"
                strokeWidth={2}
                name="Units"
                dot={{ fill: '#D4A843', r: 3, strokeWidth: 0 }}
                activeDot={{ fill: '#D4A843', r: 5, strokeWidth: 2, stroke: '#fff' }}
                strokeDasharray="5 5"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        {/* Summary Stats Row */}
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100">
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-0.5">Total Revenue (6m)</p>
            <p className="text-lg font-bold text-[#1B2A4A] tabular-nums">
              {formatCompact(salesData.reduce((sum, d) => sum + d.revenue, 0))}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-0.5">Total Units (6m)</p>
            <p className="text-lg font-bold text-[#1B2A4A] tabular-nums">
              {salesData.reduce((sum, d) => sum + d.units, 0).toLocaleString()}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-0.5">Avg. Monthly Revenue</p>
            <p className="text-lg font-bold text-[#1B2A4A] tabular-nums">
              {formatCompact(Math.round(salesData.reduce((sum, d) => sum + d.revenue, 0) / salesData.length))}
            </p>
          </div>
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════════════════════════
          4. REVIEWS SECTION + DISCOUNT SETTINGS
      ═════════════════════════════════════════════════════════════════ */}
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* ── Reviews ────────────────────────────────────────────────── */}
        <motion.div
          variants={cardVariants}
          className="lg:col-span-2 bg-white rounded-xl border border-gray-100 overflow-hidden"
        >
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-[#1B2A4A] text-sm flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#2AA198]" />
              Customer Reviews
            </h3>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, si) => (
                  <Star
                    key={si}
                    className={`w-3.5 h-3.5 ${
                      si < Math.floor(product.rating)
                        ? 'text-[#D4A843] fill-[#D4A843]'
                        : 'text-gray-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500 font-medium">{product.rating} avg</span>
            </div>
          </div>
          <div className="divide-y divide-gray-50">
            {mockReviews.map((review, i) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="p-5 hover:bg-[#2AA198]/[0.01] transition-colors"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#1B2A4A]/10 flex items-center justify-center">
                      <User className="w-4 h-4 text-[#1B2A4A]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#1B2A4A]">{review.author}</p>
                      <p className="text-[10px] text-gray-400">{review.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Calendar className="w-3 h-3" />
                    {review.date}
                  </div>
                </div>
                {/* Stars */}
                <div className="flex items-center gap-1 mb-2">
                  {Array.from({ length: 5 }).map((_, si) => (
                    <Star
                      key={si}
                      className={`w-3.5 h-3.5 ${
                        si < review.rating
                          ? 'text-[#D4A843] fill-[#D4A843]'
                          : 'text-gray-200'
                      }`}
                    />
                  ))}
                </div>
                {/* Text */}
                <p className="text-sm text-gray-600 leading-relaxed mb-2">{review.text}</p>
                {/* Helpful */}
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <ThumbsUp className="w-3 h-3" />
                  <span>{review.helpful} found this helpful</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── Discount Settings Card ─────────────────────────────────── */}
        <motion.div variants={cardVariants} className="space-y-5">
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="font-semibold text-[#1B2A4A] text-sm flex items-center gap-2 mb-4">
              <BadgePercent className="w-4 h-4 text-[#2AA198]" />
              Discount Settings
            </h3>
            <div className="space-y-4">
              <div className="bg-[#2AA198]/5 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">Current Member Discount</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-[#2AA198]">{discountPercent}%</span>
                  <span className="text-sm text-gray-400">off retail</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Retail Price</span>
                  <span className="font-medium text-[#1B2A4A]">{formatCurrency(product.price)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Member Price</span>
                  <span className="font-bold text-[#2AA198]">{formatCurrency(product.memberPrice)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Savings per Unit</span>
                  <span className="font-medium text-[#1B2A4A]">
                    {formatCurrency(product.price - product.memberPrice)}
                  </span>
                </div>
              </div>
              <button className="w-full inline-flex items-center justify-center gap-2 bg-[#1B2A4A]/5 hover:bg-[#1B2A4A]/10 text-[#1B2A4A] px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
                <Pencil className="w-3.5 h-3.5" />
                Edit Discount
              </button>
            </div>
          </div>

          {/* Quick Stats Card */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="font-semibold text-[#1B2A4A] text-sm mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Total Revenue</span>
                <span className="text-sm font-bold text-[#1B2A4A] tabular-nums">
                  {formatCompact(product.soldCount * product.memberPrice)}
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '78%' }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="h-1.5 rounded-full bg-[#2AA198]"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Conversion Rate</span>
                <span className="text-sm font-bold text-[#1B2A4A]">4.2%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '42%' }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="h-1.5 rounded-full bg-[#D4A843]"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Repeat Buyers</span>
                <span className="text-sm font-bold text-[#1B2A4A]">67%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '67%' }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  className="h-1.5 rounded-full bg-[#1B2A4A]"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
