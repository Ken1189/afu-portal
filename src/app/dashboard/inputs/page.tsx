'use client';

import { useState, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import {
  Search,
  ShoppingCart,
  X,
  Plus,
  Minus,
  Trash2,
  Star,
  Sprout,
  Beaker,
  Bug,
  Droplets,
  Wrench,
  Cpu,
  SlidersHorizontal,
  ChevronDown,
  PackageSearch,
  Leaf,
  FileText,
} from 'lucide-react';
import { products, type Product } from '@/lib/data/products';

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

type Category = Product['category'];
type Availability = Product['availability'];
type SortOption = 'price-asc' | 'price-desc' | 'rating' | 'recommended';

interface CartItem {
  product: Product;
  quantity: number;
}

/* ------------------------------------------------------------------ */
/*  Static data                                                       */
/* ------------------------------------------------------------------ */

const categoryMeta: { label: string; value: Category | 'all'; icon: typeof Sprout }[] = [
  { label: 'All', value: 'all', icon: SlidersHorizontal },
  { label: 'Seeds & Seedlings', value: 'Seeds & Seedlings', icon: Sprout },
  { label: 'Fertilizers', value: 'Fertilizers', icon: Beaker },
  { label: 'Pest Control', value: 'Pest Control', icon: Bug },
  { label: 'Irrigation', value: 'Irrigation', icon: Droplets },
  { label: 'Equipment', value: 'Equipment', icon: Wrench },
  { label: 'Technology', value: 'Technology', icon: Cpu },
];

const availabilityMeta: { label: string; value: Availability | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'In Stock', value: 'in-stock' },
  { label: 'Limited', value: 'limited' },
  { label: 'Pre-Order', value: 'pre-order' },
];

const sortOptions: { label: string; value: SortOption }[] = [
  { label: 'Recommended', value: 'recommended' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Rating', value: 'rating' },
];

/* ------------------------------------------------------------------ */
/*  Framer Motion variants                                            */
/* ------------------------------------------------------------------ */

const pageVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 260,
      damping: 24,
    },
  },
};

const drawerVariants: Variants = {
  closed: {
    x: '100%',
    transition: {
      type: 'spring' as const,
      stiffness: 320,
      damping: 32,
    },
  },
  open: {
    x: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 320,
      damping: 32,
    },
  },
};

const overlayVariants: Variants = {
  closed: { opacity: 0 },
  open: { opacity: 1 },
};

const emptyVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 200,
      damping: 20,
    },
  },
};

const badgePop: Variants = {
  initial: { scale: 0 },
  animate: {
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 500,
      damping: 15,
    },
  },
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function formatPrice(price: number): string {
  return price.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: price % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

function availabilityBadge(avail: Availability) {
  switch (avail) {
    case 'in-stock':
      return { text: 'In Stock', bg: 'bg-green-100', fg: 'text-green-700' };
    case 'limited':
      return { text: 'Limited', bg: 'bg-amber-100', fg: 'text-amber-700' };
    case 'pre-order':
      return { text: 'Pre-Order', bg: 'bg-blue-100', fg: 'text-blue-700' };
    case 'out-of-stock':
      return { text: 'Out of Stock', bg: 'bg-gray-100', fg: 'text-gray-500' };
  }
}

function ctaLabel(avail: Availability) {
  switch (avail) {
    case 'in-stock':
    case 'limited':
      return 'Add to Cart';
    case 'pre-order':
      return 'Pre-Order';
    case 'out-of-stock':
      return 'Out of Stock';
  }
}

function countByCategory(cat: Category | 'all'): number {
  if (cat === 'all') return products.length;
  return products.filter((p) => p.category === cat).length;
}

/* ------------------------------------------------------------------ */
/*  Star Rating Component                                             */
/* ------------------------------------------------------------------ */

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const fill = rating >= star ? 1 : rating >= star - 0.5 ? 0.5 : 0;
        return (
          <span key={star} className="relative inline-block w-4 h-4">
            {/* Empty star */}
            <Star className="absolute inset-0 w-4 h-4 text-gray-200" />
            {/* Filled portion */}
            {fill > 0 && (
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${fill * 100}%` }}
              >
                <Star className="w-4 h-4 text-gold fill-gold" />
              </span>
            )}
          </span>
        );
      })}
      <span className="ml-1 text-xs text-gray-500 font-medium">{rating.toFixed(1)}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page Component                                               */
/* ------------------------------------------------------------------ */

export default function InputsMarketplacePage() {
  /* -- State -- */
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [selectedAvailability, setSelectedAvailability] = useState<Availability | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('recommended');
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);

  /* -- Cart helpers -- */
  const cartCount = useMemo(() => cart.reduce((sum, i) => sum + i.quantity, 0), [cart]);
  const cartTotal = useMemo(
    () => cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
    [cart],
  );

  const addToCart = useCallback((product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  }, []);

  const updateQuantity = useCallback((productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  /* -- Filtered & sorted products -- */
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.supplier.toLowerCase().includes(q) ||
          p.recommendedCrops.some((c) => c.toLowerCase().includes(q)),
      );
    }

    // Category
    if (selectedCategory !== 'all') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // Availability
    if (selectedAvailability !== 'all') {
      result = result.filter((p) => p.availability === selectedAvailability);
    }

    // Sort
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'recommended':
      default:
        result.sort((a, b) => b.rating - a.rating || a.price - b.price);
        break;
    }

    return result;
  }, [searchQuery, selectedCategory, selectedAvailability, sortBy]);

  /* ---------------------------------------------------------------- */
  /*  Render                                                          */
  /* ---------------------------------------------------------------- */

  return (
    <div className="relative min-h-screen">
      {/* ========== HEADER ========== */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }}
            className="text-2xl md:text-3xl font-bold text-navy"
          >
            Input Marketplace
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }}
            className="text-gray-500 text-sm mt-1"
          >
            Browse seeds, fertilizers, equipment and farm technology from trusted suppliers
          </motion.p>
        </div>

        {/* Cart button */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setCartOpen(true)}
          className="relative inline-flex items-center gap-2 bg-teal text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-md shadow-teal/20 hover:bg-teal-dark transition-colors self-start sm:self-auto"
        >
          <ShoppingCart className="w-5 h-5" />
          <span>Cart</span>
          <AnimatePresence mode="wait">
            {cartCount > 0 && (
              <motion.span
                key={cartCount}
                variants={badgePop}
                initial="initial"
                animate="animate"
                exit={{ scale: 0 }}
                className="absolute -top-2 -right-2 bg-gold text-navy text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center"
              >
                {cartCount}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* ========== SEARCH BAR ========== */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.15 }}
        className="relative mb-6"
      >
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search products, suppliers, crops..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-sm text-navy placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </motion.div>

      {/* ========== CATEGORY TABS ========== */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.2 }}
        className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none"
      >
        {categoryMeta.map((cat) => {
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.value;
          const count = countByCategory(cat.value);
          return (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-teal text-white shadow-md shadow-teal/20'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-teal/30 hover:text-teal'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{cat.label}</span>
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </motion.div>

      {/* ========== AVAILABILITY FILTER + SORT ========== */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.25 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8"
      >
        {/* Availability toggles */}
        <div className="flex gap-2 flex-wrap">
          {availabilityMeta.map((opt) => {
            const isActive = selectedAvailability === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setSelectedAvailability(opt.value)}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-navy text-white shadow-sm'
                    : 'bg-white text-gray-500 border border-gray-200 hover:border-navy/20 hover:text-navy'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Sort dropdown */}
        <div className="relative">
          <button
            onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 font-medium hover:border-teal/30 transition-all"
          >
            <span>Sort: {sortOptions.find((o) => o.value === sortBy)?.label}</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${sortDropdownOpen ? 'rotate-180' : ''}`}
            />
          </button>
          <AnimatePresence>
            {sortDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-30 overflow-hidden"
              >
                {sortOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setSortBy(opt.value);
                      setSortDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                      sortBy === opt.value
                        ? 'bg-teal-light text-teal font-semibold'
                        : 'text-gray-600 hover:bg-cream'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
          {/* Click-away */}
          {sortDropdownOpen && (
            <div
              className="fixed inset-0 z-20"
              onClick={() => setSortDropdownOpen(false)}
            />
          )}
        </div>
      </motion.div>

      {/* ========== PRODUCT GRID ========== */}
      {filteredProducts.length > 0 ? (
        <motion.div
          key={`${selectedCategory}-${selectedAvailability}-${sortBy}-${searchQuery}`}
          variants={pageVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
        >
          {filteredProducts.map((product) => {
            const badge = availabilityBadge(product.availability);
            const cta = ctaLabel(product.availability);
            const isDisabled = product.availability === 'out-of-stock';

            return (
              <motion.div
                key={product.id}
                variants={cardVariants}
                whileHover={{
                  y: -4,
                  transition: { type: 'spring' as const, stiffness: 300, damping: 20 },
                }}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg hover:border-teal/20 transition-shadow"
              >
                {/* Image */}
                <div className="relative h-[200px] overflow-hidden bg-cream group">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  {/* Availability badge */}
                  <span
                    className={`absolute top-3 left-3 ${badge.bg} ${badge.fg} text-xs font-semibold px-2.5 py-1 rounded-full`}
                  >
                    {badge.text}
                  </span>
                </div>

                {/* Content */}
                <div className="p-5">
                  {/* Name + supplier */}
                  <h3 className="font-bold text-navy text-sm leading-snug line-clamp-2 mb-1">
                    {product.name}
                  </h3>
                  <p className="text-xs text-gray-400 mb-3">{product.supplier}</p>

                  {/* Price */}
                  <div className="flex items-baseline gap-1.5 mb-3">
                    <span className="text-xl font-bold text-navy">
                      {formatPrice(product.price)}
                    </span>
                    <span className="text-xs text-gray-400">{product.unit}</span>
                  </div>

                  {/* Rating */}
                  <div className="mb-3">
                    <StarRating rating={product.rating} />
                  </div>

                  {/* Recommended Crops */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {product.recommendedCrops.map((crop) => (
                      <span
                        key={crop}
                        className="inline-flex items-center gap-1 bg-teal-light text-teal text-[11px] font-medium px-2 py-0.5 rounded-full"
                      >
                        <Leaf className="w-3 h-3" />
                        {crop}
                      </span>
                    ))}
                  </div>

                  {/* CTA */}
                  <button
                    disabled={isDisabled}
                    onClick={() => {
                      if (!isDisabled) addToCart(product);
                    }}
                    className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      isDisabled
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : product.availability === 'pre-order'
                          ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                          : 'bg-teal/10 text-teal hover:bg-teal hover:text-white'
                    }`}
                  >
                    {cta}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      ) : (
        /* ========== EMPTY STATE ========== */
        <motion.div
          variants={emptyVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center justify-center py-24"
        >
          <div className="w-20 h-20 rounded-full bg-cream flex items-center justify-center mb-6">
            <PackageSearch className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-lg font-semibold text-navy mb-2">No products found</h3>
          <p className="text-sm text-gray-400 text-center max-w-sm mb-6">
            Try adjusting your search or filters to find what you are looking for.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setSelectedAvailability('all');
            }}
            className="px-5 py-2.5 bg-teal/10 text-teal rounded-xl text-sm font-semibold hover:bg-teal hover:text-white transition-all"
          >
            Clear all filters
          </button>
        </motion.div>
      )}

      {/* ========== CART DRAWER (overlay + panel) ========== */}
      <AnimatePresence>
        {cartOpen && (
          <>
            {/* Overlay */}
            <motion.div
              key="cart-overlay"
              variants={overlayVariants}
              initial="closed"
              animate="open"
              exit="closed"
              onClick={() => setCartOpen(false)}
              className="fixed inset-0 bg-navy/40 backdrop-blur-sm z-40"
            />

            {/* Drawer */}
            <motion.aside
              key="cart-drawer"
              variants={drawerVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <ShoppingCart className="w-5 h-5 text-teal" />
                  <h2 className="text-lg font-bold text-navy">Your Cart</h2>
                  {cartCount > 0 && (
                    <span className="bg-teal-light text-teal text-xs font-bold px-2 py-0.5 rounded-full">
                      {cartCount} {cartCount === 1 ? 'item' : 'items'}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setCartOpen(false)}
                  className="p-2 rounded-lg hover:bg-cream text-gray-400 hover:text-navy transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer body */}
              <div className="flex-1 overflow-y-auto px-6 py-4">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="w-16 h-16 rounded-full bg-cream flex items-center justify-center mb-4">
                      <ShoppingCart className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Cart is empty</p>
                    <p className="text-xs text-gray-400">Add products to get started</p>
                  </div>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {cart.map((item) => (
                      <motion.div
                        key={item.product.id}
                        layout
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 40, transition: { duration: 0.2 } }}
                        className="flex gap-4 py-4 border-b border-gray-50 last:border-b-0"
                      >
                        {/* Thumbnail */}
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-cream">
                          <Image
                            src={item.product.image}
                            alt={item.product.name}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-navy truncate">
                            {item.product.name}
                          </h4>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {formatPrice(item.product.price)} {item.product.unit}
                          </p>

                          {/* Quantity controls */}
                          <div className="flex items-center gap-3 mt-2">
                            <div className="inline-flex items-center bg-cream rounded-lg">
                              <button
                                onClick={() => updateQuantity(item.product.id, -1)}
                                className="p-1.5 text-gray-500 hover:text-navy transition-colors"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="w-8 text-center text-sm font-semibold text-navy">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.product.id, 1)}
                                className="p-1.5 text-gray-500 hover:text-navy transition-colors"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <button
                              onClick={() => removeFromCart(item.product.id)}
                              className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Line total */}
                        <div className="text-right flex-shrink-0">
                          <span className="text-sm font-bold text-navy">
                            {formatPrice(item.product.price * item.quantity)}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>

              {/* Drawer footer */}
              {cart.length > 0 && (
                <div className="border-t border-gray-100 px-6 py-5 space-y-4">
                  {/* Total */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 font-medium">Estimated Total</span>
                    <span className="text-xl font-bold text-navy">{formatPrice(cartTotal)}</span>
                  </div>

                  {/* Request Quote */}
                  <button className="w-full flex items-center justify-center gap-2 bg-teal text-white py-3.5 rounded-xl font-semibold text-sm shadow-md shadow-teal/20 hover:bg-teal-dark transition-colors">
                    <FileText className="w-4 h-4" />
                    Request Quote
                  </button>

                  {/* Clear cart */}
                  <button
                    onClick={clearCart}
                    className="w-full text-center text-xs text-gray-400 hover:text-red-500 font-medium transition-colors py-1"
                  >
                    Clear Cart
                  </button>
                </div>
              )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
