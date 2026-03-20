'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Package,
  Plus,
  Search,
  LayoutGrid,
  List,
  Star,
  Eye,
  Pencil,
  ChevronDown,
  SlidersHorizontal,
  ArrowUpDown,
  ShoppingCart,
  Tag,
  Filter,
} from 'lucide-react';
// ── Inline supplier-product type & fallback data (replaces @/lib/data/supplierProducts import) ──

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

const staticProducts: SupplierProduct[] = [
  { id: 'SPROD-005', supplierId: 'SUP-001', supplierName: 'Zambezi Agri-Supplies', name: 'Groundnut Seed (Nyanda)', description: 'Virginia-type groundnut variety with large kernels. Resistant to rosette disease. Excellent for both oil extraction and confectionery markets. 25kg bag.', category: 'seeds', price: 78, memberPrice: 68.64, currency: 'USD', unit: 'per 25kg bag', image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400&h=300&fit=crop', availability: 'in-stock', rating: 4.8, reviewCount: 98, soldCount: 1678, tags: ['groundnut', 'disease-resistant', 'export-quality', 'virginia-type'], featured: true, minOrder: 1 },
  { id: 'SPROD-014', supplierId: 'SUP-001', supplierName: 'Zambezi Agri-Supplies', name: 'Metalaxyl + Mancozeb Fungicide', description: 'Systemic and contact fungicide combination for control of downy mildew, late blight, and damping-off in vegetables and field crops. 1kg pack.', category: 'pesticides', price: 35, memberPrice: 30.80, currency: 'USD', unit: 'per kg', image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=300&fit=crop', availability: 'in-stock', rating: 4.5, reviewCount: 76, soldCount: 1345, tags: ['fungicide', 'systemic', 'blight', 'downy-mildew'], featured: false, minOrder: 2 },
  { id: 'SPROD-035', supplierId: 'SUP-001', supplierName: 'Zambezi Agri-Supplies', name: 'Knapsack Sprayer (16L Manual)', description: 'High-pressure manual knapsack sprayer with 16L tank. Brass lance and adjustable nozzle. Comfortable padded straps. Ideal for crop protection application.', category: 'tools', price: 35, memberPrice: 30.80, currency: 'USD', unit: 'per unit', image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop', availability: 'in-stock', rating: 4.3, reviewCount: 123, soldCount: 3456, tags: ['sprayer', 'knapsack', 'manual', 'crop-protection'], featured: false, minOrder: 1 },
  { id: 'SPROD-036', supplierId: 'SUP-001', supplierName: 'Zambezi Agri-Supplies', name: 'Soil pH Test Kit (50 tests)', description: 'Portable soil pH testing kit with colour chart. 50 individual tests per kit. Includes sampling tools and interpretation guide. Results in 60 seconds.', category: 'tools', price: 28, memberPrice: 24.64, currency: 'USD', unit: 'per kit', image: 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=400&h=300&fit=crop', availability: 'in-stock', rating: 4.4, reviewCount: 56, soldCount: 789, tags: ['soil-testing', 'pH', 'portable', 'quick-results'], featured: false, minOrder: 1 },
  { id: 'SPROD-038', supplierId: 'SUP-001', supplierName: 'Zambezi Agri-Supplies', name: 'Pruning Shears (Bypass, Professional)', description: 'Professional bypass pruning shears with SK5 steel blades. Ergonomic grip with safety lock. Essential for orchard management and vineyard work.', category: 'tools', price: 12, memberPrice: 10.56, currency: 'USD', unit: 'per unit', image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop', availability: 'in-stock', rating: 4.5, reviewCount: 67, soldCount: 1234, tags: ['pruning', 'shears', 'professional', 'orchard'], featured: false, minOrder: 2 },
];
import { useProducts, type ProductRow } from '@/lib/supabase/use-products';
import { useAuth } from '@/lib/supabase/auth-context';

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

// ── Static fallback ─────────────────────────────────────────────────────────

const staticMyProducts = staticProducts.filter((p) => p.supplierId === 'SUP-001');

// ── All categories from SupplierProduct ─────────────────────────────────────

const allCategories: SupplierProduct['category'][] = [
  'seeds',
  'fertilizer',
  'pesticides',
  'equipment',
  'irrigation',
  'technology',
  'packaging',
  'storage',
  'tools',
];

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

// ── Availability badge config ───────────────────────────────────────────────

const availabilityConfig: Record<string, { label: string; color: string }> = {
  'in-stock': { label: 'In Stock', color: 'bg-green-100 text-green-700' },
  limited: { label: 'Limited', color: 'bg-amber-100 text-amber-700' },
  'pre-order': { label: 'Pre-Order', color: 'bg-blue-100 text-blue-700' },
  'out-of-stock': { label: 'Out of Stock', color: 'bg-red-100 text-red-700' },
};

// ── Sort options ────────────────────────────────────────────────────────────

type SortKey = 'name' | 'price' | 'rating' | 'sold';

const sortOptions: { value: SortKey; label: string }[] = [
  { value: 'name', label: 'Name' },
  { value: 'price', label: 'Price' },
  { value: 'rating', label: 'Rating' },
  { value: 'sold', label: 'Units Sold' },
];

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatCurrency(value: number): string {
  return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ═══════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function SupplierProductsPage() {
  const { products: dbProducts, loading: productsLoading, toggleStock } = useProducts();
  const { profile } = useAuth();
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortKey>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Convert Supabase products to the UI shape if available
  const myProducts: SupplierProduct[] = useMemo(() => {
    if (dbProducts.length > 0) {
      return dbProducts.map((p: ProductRow) => ({
        id: p.id,
        supplierId: p.supplier_id,
        name: p.name,
        description: p.description || '',
        category: p.category === 'input-supplier' ? 'seeds' : p.category === 'financial-services' ? 'finance' : p.category,
        price: p.price,
        memberPrice: p.member_price || p.price,
        discount: p.discount_percent,
        currency: p.currency || 'USD',
        unit: p.unit || 'unit',
        image: p.image_url || 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=300&fit=crop',
        supplier: p.supplier?.company_name || 'My Products',
        supplierVerified: p.supplier?.verified || false,
        inStock: p.in_stock,
        availability: p.in_stock ? 'in-stock' : 'out-of-stock',
        rating: p.rating || 0,
        reviewCount: p.review_count || 0,
        featured: p.featured,
        tags: p.tags || [],
        soldCount: p.sold_count || 0,
        stockQuantity: p.stock_quantity || 0,
      } as unknown as SupplierProduct));
    }
    return staticMyProducts;
  }, [dbProducts]);

  // ── Filtered + sorted products ──────────────────────────────────────────
  const filteredProducts = useMemo(() => {
    let products = [...myProducts];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      products = products.filter((p) => p.category === categoryFilter);
    }

    // Availability filter
    if (availabilityFilter !== 'all') {
      products = products.filter((p) => p.availability === availabilityFilter);
    }

    // Sort
    products.sort((a, b) => {
      let cmp = 0;
      switch (sortBy) {
        case 'name':
          cmp = a.name.localeCompare(b.name);
          break;
        case 'price':
          cmp = a.price - b.price;
          break;
        case 'rating':
          cmp = a.rating - b.rating;
          break;
        case 'sold':
          cmp = a.soldCount - b.soldCount;
          break;
      }
      return sortDirection === 'asc' ? cmp : -cmp;
    });

    return products;
  }, [searchQuery, categoryFilter, availabilityFilter, sortBy, sortDirection]);

  const toggleSort = (key: SortKey) => {
    if (sortBy === key) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(key);
      setSortDirection('asc');
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* ══════════════════════════════════════════════════════════════════
          1. PAGE HEADER
      ═════════════════════════════════════════════════════════════════ */}
      <motion.div
        variants={fadeUp}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#2AA198]/10 flex items-center justify-center">
            <Package className="w-5 h-5 text-[#2AA198]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-[#1B2A4A]">My Products</h1>
              <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#2AA198]/10 text-[#2AA198]">
                {myProducts.length}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">Manage your product listings and inventory</p>
          </div>
        </div>
        <Link
          href="/supplier/products/new"
          className="inline-flex items-center gap-2 bg-[#2AA198] hover:bg-[#1A7A72] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </Link>
      </motion.div>

      {/* ══════════════════════════════════════════════════════════════════
          2. FILTERS BAR
      ═════════════════════════════════════════════════════════════════ */}
      <motion.div
        variants={cardVariants}
        className="bg-white rounded-xl border border-gray-100 p-4"
      >
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products by name, description, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2AA198]/30 focus:border-[#2AA198] transition-colors bg-gray-50 placeholder-gray-400"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="appearance-none pl-9 pr-8 py-2.5 rounded-lg border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#2AA198]/30 focus:border-[#2AA198] transition-colors cursor-pointer"
              >
                <option value="all">All Categories</option>
                {allCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {categoryLabels[cat]}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            </div>

            {/* Availability Filter */}
            <div className="relative">
              <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              <select
                value={availabilityFilter}
                onChange={(e) => setAvailabilityFilter(e.target.value)}
                className="appearance-none pl-9 pr-8 py-2.5 rounded-lg border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#2AA198]/30 focus:border-[#2AA198] transition-colors cursor-pointer"
              >
                <option value="all">All Availability</option>
                <option value="in-stock">In Stock</option>
                <option value="limited">Limited</option>
                <option value="pre-order">Pre-Order</option>
                <option value="out-of-stock">Out of Stock</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            </div>

            {/* Sort By */}
            <div className="relative">
              <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortKey)}
                className="appearance-none pl-9 pr-8 py-2.5 rounded-lg border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#2AA198]/30 focus:border-[#2AA198] transition-colors cursor-pointer"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    Sort: {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            </div>

            {/* Sort Direction Toggle */}
            <button
              onClick={() => setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'))}
              className="p-2.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors"
              title={sortDirection === 'asc' ? 'Ascending' : 'Descending'}
            >
              <ArrowUpDown className={`w-4 h-4 text-gray-500 transition-transform ${sortDirection === 'desc' ? 'rotate-180' : ''}`} />
            </button>

            {/* Divider */}
            <div className="w-px h-8 bg-gray-200 hidden lg:block" />

            {/* View Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white text-[#2AA198] shadow-sm'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-md transition-all ${
                  viewMode === 'table'
                    ? 'bg-white text-[#2AA198] shadow-sm'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Active filter count */}
        {(searchQuery || categoryFilter !== 'all' || availabilityFilter !== 'all') && (
          <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
            <span>
              Showing {filteredProducts.length} of {myProducts.length} products
            </span>
            <button
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('all');
                setAvailabilityFilter('all');
              }}
              className="text-[#2AA198] hover:text-[#1A7A72] font-medium transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </motion.div>

      {/* ══════════════════════════════════════════════════════════════════
          3. PRODUCTS — GRID VIEW
      ═════════════════════════════════════════════════════════════════ */}
      {viewMode === 'grid' && (
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
        >
          {filteredProducts.map((product) => (
            <motion.div
              key={product.id}
              variants={cardVariants}
              whileHover={{ y: -3, boxShadow: '0 12px 30px rgba(27,42,74,0.08)' }}
              className="bg-white rounded-xl border border-gray-100 overflow-hidden group"
            >
              {/* Product Image */}
              <div className="relative h-[200px] overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {/* Featured Badge */}
                {product.featured && (
                  <div className="absolute top-3 left-3 inline-flex items-center gap-1 bg-[#D4A843] text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                    <Star className="w-3 h-3 fill-white" />
                    Featured
                  </div>
                )}
                {/* Availability Badge */}
                <div className="absolute top-3 right-3">
                  <span
                    className={`inline-block text-[10px] font-semibold px-2.5 py-1 rounded-full ${
                      availabilityConfig[product.availability]?.color || 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {availabilityConfig[product.availability]?.label || product.availability}
                  </span>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4 space-y-3">
                {/* Name & Category */}
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <h3 className="font-semibold text-[#1B2A4A] text-sm leading-tight line-clamp-2">
                      {product.name}
                    </h3>
                  </div>
                  <span
                    className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      categoryColors[product.category] || 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {categoryLabels[product.category]}
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-bold text-[#2AA198]">
                    {formatCurrency(product.memberPrice)}
                  </span>
                  <span className="text-sm text-gray-400 line-through">
                    {formatCurrency(product.price)}
                  </span>
                  <span className="text-[10px] font-medium text-[#2AA198] bg-[#2AA198]/10 px-1.5 py-0.5 rounded-full">
                    Member
                  </span>
                </div>

                {/* Rating & Sold */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, si) => (
                      <Star
                        key={si}
                        className={`w-3.5 h-3.5 ${
                          si < Math.floor(product.rating)
                            ? 'text-[#D4A843] fill-[#D4A843]'
                            : si < product.rating
                              ? 'text-[#D4A843] fill-[#D4A843]/50'
                              : 'text-gray-200'
                        }`}
                      />
                    ))}
                    <span className="text-xs text-gray-400 ml-1">
                      {product.rating} ({product.reviewCount})
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <ShoppingCart className="w-3 h-3" />
                    <span className="font-medium tabular-nums">{product.soldCount.toLocaleString()}</span>
                    <span>sold</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                  <Link
                    href={`/supplier/products/${product.id}`}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 bg-[#2AA198]/10 text-[#2AA198] hover:bg-[#2AA198]/20 px-3 py-2 rounded-lg text-xs font-medium transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    View
                  </Link>
                  <button className="flex-1 inline-flex items-center justify-center gap-1.5 bg-[#1B2A4A]/5 text-[#1B2A4A] hover:bg-[#1B2A4A]/10 px-3 py-2 rounded-lg text-xs font-medium transition-colors">
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          4. PRODUCTS — TABLE VIEW
      ═════════════════════════════════════════════════════════════════ */}
      {viewMode === 'table' && (
        <motion.div
          variants={cardVariants}
          className="bg-white rounded-xl border border-gray-100 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider w-16">
                    Image
                  </th>
                  <th
                    onClick={() => toggleSort('name')}
                    className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-[#1B2A4A] transition-colors"
                  >
                    <span className="flex items-center gap-1">
                      Name
                      <ArrowUpDown className="w-3 h-3" />
                    </span>
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Category
                  </th>
                  <th
                    onClick={() => toggleSort('price')}
                    className="text-right py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-[#1B2A4A] transition-colors"
                  >
                    <span className="flex items-center justify-end gap-1">
                      Price
                      <ArrowUpDown className="w-3 h-3" />
                    </span>
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Member Price
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Stock
                  </th>
                  <th
                    onClick={() => toggleSort('sold')}
                    className="text-right py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-[#1B2A4A] transition-colors"
                  >
                    <span className="flex items-center justify-end gap-1">
                      Sold
                      <ArrowUpDown className="w-3 h-3" />
                    </span>
                  </th>
                  <th
                    onClick={() => toggleSort('rating')}
                    className="text-right py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-[#1B2A4A] transition-colors"
                  >
                    <span className="flex items-center justify-end gap-1">
                      Rating
                      <ArrowUpDown className="w-3 h-3" />
                    </span>
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredProducts.map((product, index) => (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className="hover:bg-[#2AA198]/[0.02] transition-colors"
                  >
                    {/* Thumbnail */}
                    <td className="py-3 px-4">
                      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>
                    {/* Name */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-medium text-[#1B2A4A] text-sm truncate max-w-[200px]">
                          {product.name}
                        </span>
                        {product.featured && (
                          <Star className="w-3.5 h-3.5 text-[#D4A843] fill-[#D4A843] flex-shrink-0" />
                        )}
                      </div>
                    </td>
                    {/* Category */}
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full ${
                          categoryColors[product.category] || 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {categoryLabels[product.category]}
                      </span>
                    </td>
                    {/* Price */}
                    <td className="py-3 px-4 text-right font-medium text-[#1B2A4A] tabular-nums text-sm">
                      {formatCurrency(product.price)}
                    </td>
                    {/* Member Price */}
                    <td className="py-3 px-4 text-right font-bold text-[#2AA198] tabular-nums text-sm">
                      {formatCurrency(product.memberPrice)}
                    </td>
                    {/* Stock Status */}
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          availabilityConfig[product.availability]?.color || 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {availabilityConfig[product.availability]?.label || product.availability}
                      </span>
                    </td>
                    {/* Sold */}
                    <td className="py-3 px-4 text-right text-sm text-gray-600 tabular-nums">
                      {product.soldCount.toLocaleString()}
                    </td>
                    {/* Rating */}
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
                        <Star className="w-3.5 h-3.5 text-[#D4A843] fill-[#D4A843]" />
                        <span className="text-sm font-medium text-[#1B2A4A] tabular-nums">{product.rating}</span>
                        <span className="text-[10px] text-gray-400">({product.reviewCount})</span>
                      </div>
                    </td>
                    {/* Actions */}
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1">
                        <Link
                          href={`/supplier/products/${product.id}`}
                          className="p-2 rounded-lg text-[#2AA198] hover:bg-[#2AA198]/10 transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          className="p-2 rounded-lg text-[#1B2A4A] hover:bg-[#1B2A4A]/10 transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              Showing {filteredProducts.length} of {myProducts.length} products
            </span>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Tag className="w-3 h-3" />
              <span>Zambezi Agri-Supplies (SUP-001)</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          5. EMPTY STATE
      ═════════════════════════════════════════════════════════════════ */}
      {filteredProducts.length === 0 && (
        <motion.div
          variants={fadeUp}
          className="bg-white rounded-xl border border-gray-100 p-12 text-center"
        >
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-[#1B2A4A] mb-2">No products found</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
            {searchQuery || categoryFilter !== 'all' || availabilityFilter !== 'all'
              ? 'Try adjusting your search query or filters to find what you are looking for.'
              : 'You have not listed any products yet. Get started by adding your first product.'}
          </p>
          {searchQuery || categoryFilter !== 'all' || availabilityFilter !== 'all' ? (
            <button
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('all');
                setAvailabilityFilter('all');
              }}
              className="inline-flex items-center gap-2 bg-[#2AA198]/10 text-[#2AA198] hover:bg-[#2AA198]/20 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
            >
              Clear All Filters
            </button>
          ) : (
            <Link
              href="/supplier/products/new"
              className="inline-flex items-center gap-2 bg-[#2AA198] hover:bg-[#1A7A72] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Your First Product
            </Link>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
