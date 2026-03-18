'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ShoppingCart,
  Star,
  Plus,
  Minus,
  SlidersHorizontal,
  Package,
  ChevronDown,
  Sparkles,
  Tag,
  Leaf,
  Bug,
  Wrench,
  Droplets,
  Cpu,
  Box,
  Warehouse,
  Hammer,
  Filter,
  X,
} from 'lucide-react';
import { supplierProducts as staticProducts, type SupplierProduct } from '@/lib/data/supplierProducts';
import { useProducts, type ProductRow } from '@/lib/supabase/use-products';
import { useCartStore } from '@/lib/stores/cartStore';
import { useLanguage } from '@/lib/i18n/LanguageContext';

// Bridge function: convert Supabase ProductRow to the SupplierProduct shape the UI expects
function dbToSupplierProduct(p: ProductRow): SupplierProduct {
  return {
    id: p.id,
    name: p.name,
    description: p.description || '',
    category: p.category === 'input-supplier' ? 'seeds' :
              p.category === 'equipment' ? 'equipment' :
              p.category === 'logistics' ? 'logistics' :
              p.category === 'processing' ? 'processing' :
              p.category === 'technology' ? 'technology' :
              p.category === 'financial-services' ? 'finance' : 'other',
    subcategory: (p.tags?.[0] || p.category) as string,
    price: p.price,
    memberPrice: p.member_price || p.price,
    discount: p.discount_percent,
    currency: p.currency || 'USD',
    unit: p.unit || 'unit',
    image: p.image_url || 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=300&fit=crop',
    supplier: p.supplier?.company_name || 'Unknown Supplier',
    supplierVerified: p.supplier?.verified || false,
    inStock: p.in_stock,
    rating: p.rating || 0,
    reviewCount: p.review_count || 0,
    featured: p.featured,
    tags: p.tags || [],
  } as unknown as SupplierProduct;
}

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      ease: 'easeOut' as const,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 12 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 260,
      damping: 22,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
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

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

type CategoryKey = 'all' | SupplierProduct['category'];

interface CategoryOption {
  key: CategoryKey;
  label: string;
  icon: React.ReactNode;
}

const categories: CategoryOption[] = [
  { key: 'all', label: 'All', icon: <Package size={14} /> },
  { key: 'seeds', label: 'Seeds', icon: <Leaf size={14} /> },
  { key: 'fertilizer', label: 'Fertilizer', icon: <Sparkles size={14} /> },
  { key: 'pesticides', label: 'Pesticides', icon: <Bug size={14} /> },
  { key: 'equipment', label: 'Equipment', icon: <Wrench size={14} /> },
  { key: 'irrigation', label: 'Irrigation', icon: <Droplets size={14} /> },
  { key: 'technology', label: 'Technology', icon: <Cpu size={14} /> },
  { key: 'packaging', label: 'Packaging', icon: <Box size={14} /> },
  { key: 'storage', label: 'Storage', icon: <Warehouse size={14} /> },
  { key: 'tools', label: 'Tools', icon: <Hammer size={14} /> },
];

type SortKey = 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'popular';

const sortOptions: { key: SortKey; label: string }[] = [
  { key: 'featured', label: 'Featured' },
  { key: 'price-asc', label: 'Price: Low to High' },
  { key: 'price-desc', label: 'Price: High to Low' },
  { key: 'rating', label: 'Best Rated' },
  { key: 'popular', label: 'Most Popular' },
];

const availabilityConfig: Record<
  SupplierProduct['availability'],
  { bg: string; text: string; label: string }
> = {
  'in-stock': { bg: 'bg-green-100', text: 'text-green-700', label: 'In Stock' },
  limited: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Limited' },
  'pre-order': { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Pre-Order' },
  'out-of-stock': { bg: 'bg-red-100', text: 'text-red-700', label: 'Out of Stock' },
};

const categoryColors: Record<string, string> = {
  seeds: 'bg-green-100 text-green-700',
  fertilizer: 'bg-amber-100 text-amber-700',
  pesticides: 'bg-red-100 text-red-700',
  equipment: 'bg-blue-100 text-blue-700',
  irrigation: 'bg-cyan-100 text-cyan-700',
  technology: 'bg-purple-100 text-purple-700',
  packaging: 'bg-orange-100 text-orange-700',
  storage: 'bg-gray-200 text-gray-700',
  tools: 'bg-indigo-100 text-indigo-700',
};

const categoryGradients: Record<string, string> = {
  seeds: 'from-green-400 to-emerald-600',
  fertilizer: 'from-amber-400 to-orange-600',
  pesticides: 'from-red-400 to-rose-600',
  equipment: 'from-blue-400 to-indigo-600',
  irrigation: 'from-cyan-400 to-teal-600',
  technology: 'from-purple-400 to-violet-600',
  packaging: 'from-orange-400 to-amber-600',
  storage: 'from-gray-400 to-slate-600',
  tools: 'from-indigo-400 to-blue-600',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function sortProducts(products: SupplierProduct[], sortKey: SortKey): SupplierProduct[] {
  const sorted = [...products];
  switch (sortKey) {
    case 'featured':
      return sorted.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    case 'price-asc':
      return sorted.sort((a, b) => a.memberPrice - b.memberPrice);
    case 'price-desc':
      return sorted.sort((a, b) => b.memberPrice - a.memberPrice);
    case 'rating':
      return sorted.sort((a, b) => b.rating - a.rating);
    case 'popular':
      return sorted.sort((a, b) => b.soldCount - a.soldCount);
    default:
      return sorted;
  }
}

function getSavingsPercent(original: number, member: number): number {
  return Math.round(((original - member) / original) * 100);
}

// ---------------------------------------------------------------------------
// Product Card Sub-Component
// ---------------------------------------------------------------------------

function ProductCard({ product }: { product: SupplierProduct }) {
  const { addItem } = useCartStore();
  const [quantity, setQuantity] = useState(product.minOrder);
  const [added, setAdded] = useState(false);

  const availability = availabilityConfig[product.availability];
  const savingsPct = getSavingsPercent(product.price, product.memberPrice);
  const gradient = categoryGradients[product.category] || 'from-gray-400 to-gray-600';
  const catColor = categoryColors[product.category] || 'bg-gray-100 text-gray-600';

  const handleAdd = () => {
    if (product.availability === 'out-of-stock') return;
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <motion.div
      variants={cardVariants}
      className="rounded-2xl bg-white border border-gray-100 overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Image area */}
      <div className={`relative h-40 bg-gradient-to-br ${gradient}`}>
        {/* Decorative circles */}
        <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/10 rounded-full" />
        <div className="absolute bottom-2 right-2 w-10 h-10 bg-white/10 rounded-full" />

        {/* Category icon in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
            <Package size={28} className="text-white" />
          </div>
        </div>

        {/* Category badge - top left */}
        <div className="absolute top-2.5 left-2.5">
          <span
            className={`text-[10px] font-semibold px-2 py-1 rounded-full capitalize ${catColor}`}
          >
            {product.category}
          </span>
        </div>

        {/* Availability badge - top right */}
        <div className="absolute top-2.5 right-2.5">
          <span
            className={`text-[10px] font-semibold px-2 py-1 rounded-full ${availability.bg} ${availability.text}`}
          >
            {availability.label}
          </span>
        </div>

        {/* Featured badge */}
        {product.featured && (
          <div className="absolute bottom-2.5 left-2.5">
            <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-gold/90 text-white flex items-center gap-1">
              <Sparkles size={10} />
              Featured
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3.5 flex flex-col flex-1">
        {/* Product name */}
        <h3 className="text-sm font-bold text-navy leading-tight line-clamp-2 min-h-[2.5rem]">
          {product.name}
        </h3>

        {/* Supplier */}
        <p className="text-[11px] text-gray-400 mt-1 truncate">{product.supplierName}</p>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mt-2">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={12}
                className={
                  i < Math.floor(product.rating)
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-gray-200 fill-gray-200'
                }
              />
            ))}
          </div>
          <span className="text-[11px] text-gray-500 font-medium">{product.rating}</span>
          <span className="text-[10px] text-gray-400">({product.reviewCount})</span>
        </div>

        {/* Pricing */}
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-xs text-gray-400 line-through">${product.price.toFixed(2)}</span>
          <span className="text-base font-bold text-teal">${product.memberPrice.toFixed(2)}</span>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-green-100 text-green-700">
            -{savingsPct}%
          </span>
        </div>

        {/* Unit & Min order */}
        <p className="text-[11px] text-gray-400 mt-1">
          {product.unit} &middot; Min order: {product.minOrder}
        </p>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Quantity + Add to Cart */}
        <div className="mt-3 flex items-center gap-2">
          {/* Quantity selector */}
          <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
            <button
              onClick={() => setQuantity(Math.max(product.minOrder, quantity - 1))}
              className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 active:bg-gray-100 transition-colors"
            >
              <Minus size={14} />
            </button>
            <span className="w-8 h-8 flex items-center justify-center text-xs font-bold text-navy border-x border-gray-200">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 active:bg-gray-100 transition-colors"
            >
              <Plus size={14} />
            </button>
          </div>

          {/* Add to Cart button */}
          <button
            onClick={handleAdd}
            disabled={product.availability === 'out-of-stock'}
            className={`flex-1 h-9 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all min-h-[36px] ${
              added
                ? 'bg-green-500 text-white'
                : product.availability === 'out-of-stock'
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-teal text-white hover:bg-teal-dark active:scale-[0.97]'
            }`}
          >
            {added ? (
              <>
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="inline-flex"
                >
                  Added!
                </motion.span>
              </>
            ) : product.availability === 'out-of-stock' ? (
              'Unavailable'
            ) : (
              <>
                <ShoppingCart size={14} />
                Add to Cart
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main Page Component
// ---------------------------------------------------------------------------

export default function MarketplacePage() {
  useLanguage(); // keeps the language context active

  const { products: dbProducts, loading: productsLoading } = useProducts();
  const { getItemCount } = useCartStore();
  const cartCount = useCartStore((state) => state.items.reduce((s, i) => s + i.quantity, 0));

  // Use live products from Supabase if available, fallback to static
  const supplierProducts = dbProducts.length > 0
    ? dbProducts.map(dbToSupplierProduct)
    : staticProducts;

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>('all');
  const [sortKey, setSortKey] = useState<SortKey>('featured');
  const [showSort, setShowSort] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Filtered & sorted products
  const filteredProducts = useMemo(() => {
    let products = [...supplierProducts];

    // Category filter
    if (selectedCategory !== 'all') {
      products = products.filter((p) => p.category === selectedCategory);
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.supplierName.toLowerCase().includes(q) ||
          p.tags.some((tag) => tag.toLowerCase().includes(q)) ||
          p.category.toLowerCase().includes(q)
      );
    }

    // Sort
    return sortProducts(products, sortKey);
  }, [searchQuery, selectedCategory, sortKey]);

  const activeSortLabel = sortOptions.find((o) => o.key === sortKey)?.label || 'Featured';

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4 py-4"
    >
      {/* ================================================================= */}
      {/* HEADER                                                            */}
      {/* ================================================================= */}
      <motion.section variants={itemVariants} className="px-4 lg:px-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-navy leading-tight">Farm Marketplace</h1>
            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
              Browse agricultural supplies at member-discounted prices
            </p>
          </div>

          {/* Cart icon */}
          <Link
            href="/farm/marketplace/cart"
            className="relative shrink-0 w-11 h-11 flex items-center justify-center rounded-xl bg-teal/10 text-teal hover:bg-teal/20 active:scale-95 transition-all"
          >
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-5 h-5 bg-gold text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm"
              >
                {cartCount > 99 ? '99+' : cartCount}
              </motion.span>
            )}
          </Link>
        </div>
      </motion.section>

      {/* ================================================================= */}
      {/* SEARCH BAR                                                        */}
      {/* ================================================================= */}
      <motion.section variants={itemVariants} className="px-4 lg:px-6">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products, suppliers, categories..."
            className="w-full h-11 pl-10 pr-10 rounded-xl border border-gray-200 bg-white text-sm text-navy placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:bg-gray-200"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </motion.section>

      {/* ================================================================= */}
      {/* CATEGORY FILTER CHIPS                                             */}
      {/* ================================================================= */}
      <motion.section variants={itemVariants}>
        <div className="flex gap-2 overflow-x-auto px-4 lg:px-6 pb-1 scrollbar-hide snap-x snap-mandatory">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`shrink-0 snap-start flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all min-h-[36px] ${
                  isActive
                    ? 'bg-teal text-white shadow-sm shadow-teal/20'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 active:bg-gray-100'
                }`}
              >
                {cat.icon}
                {cat.label}
              </button>
            );
          })}
        </div>
      </motion.section>

      {/* ================================================================= */}
      {/* SORT & COUNT BAR                                                  */}
      {/* ================================================================= */}
      <motion.section variants={itemVariants} className="px-4 lg:px-6">
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">
            <span className="font-semibold text-navy">{filteredProducts.length}</span>{' '}
            {filteredProducts.length === 1 ? 'product' : 'products'} found
          </p>

          {/* Sort dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSort(!showSort)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <SlidersHorizontal size={13} />
              {activeSortLabel}
              <ChevronDown size={13} className={`transition-transform ${showSort ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showSort && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowSort(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50"
                  >
                    {sortOptions.map((opt) => (
                      <button
                        key={opt.key}
                        onClick={() => {
                          setSortKey(opt.key);
                          setShowSort(false);
                        }}
                        className={`w-full text-left px-3.5 py-2 text-xs transition-colors ${
                          sortKey === opt.key
                            ? 'bg-teal/10 text-teal font-semibold'
                            : 'text-gray-600 hover:bg-gray-50 active:bg-gray-100'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.section>

      {/* ================================================================= */}
      {/* PRODUCT GRID                                                      */}
      {/* ================================================================= */}
      {filteredProducts.length > 0 ? (
        <motion.section
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="px-4 lg:px-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </motion.section>
      ) : (
        /* ================================================================= */
        /* EMPTY STATE                                                       */
        /* ================================================================= */
        <motion.section variants={itemVariants} className="px-4 lg:px-6">
          <div className="rounded-2xl bg-white border border-gray-100 py-16 px-6 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <Search size={28} className="text-gray-400" />
            </div>
            <h3 className="text-base font-bold text-navy mb-1">No products found</h3>
            <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
              {searchQuery
                ? `No results for "${searchQuery}". Try a different search term or category.`
                : 'No products match the selected filters. Try adjusting your criteria.'}
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSortKey('featured');
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-teal text-white text-sm font-semibold hover:bg-teal-dark active:scale-[0.97] transition-all"
            >
              Clear Filters
            </button>
          </div>
        </motion.section>
      )}

      {/* ================================================================= */}
      {/* MEMBERSHIP BANNER                                                 */}
      {/* ================================================================= */}
      <motion.section variants={itemVariants} className="px-4 lg:px-6 pb-2">
        <div className="rounded-2xl bg-gradient-to-br from-navy to-navy-light p-5 text-white relative overflow-hidden">
          {/* Decorative */}
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/5 rounded-full" />
          <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/5 rounded-full" />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Tag size={16} className="text-gold" />
              <span className="text-xs font-bold text-white/80 uppercase tracking-wide">
                AFU Member Pricing
              </span>
            </div>
            <p className="text-sm leading-relaxed text-white/90">
              Enjoy exclusive discounts of 8-15% on all agricultural supplies as an AFU member.
              Savings are applied automatically at checkout.
            </p>
            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center gap-1.5 text-xs text-white/70">
                <Sparkles size={12} className="text-gold" />
                <span>Up to 15% off</span>
              </div>
              <span className="text-white/30">|</span>
              <div className="flex items-center gap-1.5 text-xs text-white/70">
                <Package size={12} />
                <span>{supplierProducts.length} products</span>
              </div>
              <span className="text-white/30">|</span>
              <div className="flex items-center gap-1.5 text-xs text-white/70">
                <ShoppingCart size={12} />
                <span>Bulk orders welcome</span>
              </div>
            </div>
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
}
