'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import {
  Search,
  ShoppingCart,
  Star,
  SlidersHorizontal,
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
  ArrowRight,
  Package,
  ChevronDown,
  Users,
  Shield,
  Truck,
  Award,
} from 'lucide-react';

/* ─── Types ─── */

interface Product {
  id: string;
  supplierName: string;
  name: string;
  description: string;
  category: string;
  price: number;
  memberPrice: number;
  currency: string;
  unit: string;
  image: string;
  availability: 'in-stock' | 'limited' | 'pre-order' | 'out-of-stock';
  rating: number;
  reviewCount: number;
  tags: string[];
  featured: boolean;
}

/* ─── Static products ─── */

const PRODUCTS: Product[] = [
  { id: 'P001', supplierName: 'Kalahari Seeds Co.', name: 'Drought-Resistant Sorghum (Macia)', description: 'Early-maturing white sorghum variety for semi-arid conditions. 25kg bag.', category: 'seeds', price: 65, memberPrice: 58.50, currency: 'USD', unit: 'per 25kg bag', image: 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=400&h=300&fit=crop', availability: 'in-stock', rating: 4.7, reviewCount: 89, tags: ['drought-resistant', 'sorghum'], featured: true },
  { id: 'P002', supplierName: 'Kalahari Seeds Co.', name: 'Hybrid Maize Seed (PAN 4M-21)', description: 'High-yielding hybrid maize with drought tolerance. 10kg bag treats 1 hectare.', category: 'seeds', price: 48, memberPrice: 43.20, currency: 'USD', unit: 'per 10kg bag', image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=300&fit=crop', availability: 'in-stock', rating: 4.6, reviewCount: 134, tags: ['maize', 'hybrid'], featured: true },
  { id: 'P003', supplierName: 'Victoria Falls Seed Bank', name: 'Cowpea Seeds (IT18)', description: 'Improved cowpea variety with pest resistance. Dual-purpose grain and fodder. 5kg pack.', category: 'seeds', price: 22, memberPrice: 20.24, currency: 'USD', unit: 'per 5kg pack', image: 'https://images.unsplash.com/photo-1590682680695-43b964a3ae17?w=400&h=300&fit=crop', availability: 'in-stock', rating: 4.5, reviewCount: 67, tags: ['cowpea', 'legume'], featured: false },
  { id: 'P004', supplierName: 'Zambezi Agri-Supplies', name: 'Groundnut Seed (Nyanda)', description: 'Virginia-type groundnut with large kernels. Excellent for oil extraction and confectionery. 25kg bag.', category: 'seeds', price: 78, memberPrice: 68.64, currency: 'USD', unit: 'per 25kg bag', image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400&h=300&fit=crop', availability: 'in-stock', rating: 4.8, reviewCount: 98, tags: ['groundnut', 'export-quality'], featured: true },
  { id: 'P005', supplierName: 'Okavango Fertilizers', name: 'NPK 15-15-15 Compound Fertilizer', description: 'Balanced compound fertilizer for a wide range of crops at planting. 50kg bag.', category: 'fertilizer', price: 45, memberPrice: 40.95, currency: 'USD', unit: 'per 50kg bag', image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop', availability: 'in-stock', rating: 4.4, reviewCount: 156, tags: ['NPK', 'compound'], featured: false },
  { id: 'P006', supplierName: 'Okavango Fertilizers', name: 'Urea (46-0-0) Top Dressing', description: 'High-nitrogen granular urea for top-dressing cereals. 46% nitrogen content. 50kg bag.', category: 'fertilizer', price: 38, memberPrice: 34.58, currency: 'USD', unit: 'per 50kg bag', image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=300&fit=crop', availability: 'in-stock', rating: 4.3, reviewCount: 112, tags: ['urea', 'nitrogen'], featured: false },
  { id: 'P007', supplierName: 'Kilimanjaro Organic Inputs', name: 'Organic Compost Blend (Kilimanjaro Mix)', description: 'Premium organic compost from coffee husks, banana stems, and cattle manure. 25kg bag.', category: 'fertilizer', price: 18, memberPrice: 16.56, currency: 'USD', unit: 'per 25kg bag', image: 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=400&h=300&fit=crop', availability: 'in-stock', rating: 4.6, reviewCount: 78, tags: ['organic', 'compost'], featured: true },
  { id: 'P008', supplierName: 'Tswana Agri-Chem', name: 'Lambda-Cyhalothrin 5EC Insecticide', description: 'Broad-spectrum pyrethroid insecticide for bollworm, stem borer, and aphid control. 1L bottle.', category: 'pesticides', price: 24, memberPrice: 22.08, currency: 'USD', unit: 'per liter', image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=300&fit=crop', availability: 'in-stock', rating: 4.4, reviewCount: 89, tags: ['insecticide', 'pyrethroid'], featured: false },
  { id: 'P009', supplierName: 'Kilimanjaro Organic Inputs', name: 'Neem Oil Organic Pesticide', description: 'Cold-pressed neem oil for organic pest management. Controls over 200 pest species. 1L bottle.', category: 'pesticides', price: 18, memberPrice: 16.56, currency: 'USD', unit: 'per liter', image: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=400&h=300&fit=crop', availability: 'in-stock', rating: 4.6, reviewCount: 56, tags: ['organic', 'neem'], featured: true },
  { id: 'P010', supplierName: 'Matopos Equipment Hire', name: 'Walk-Behind Tractor (15HP Diesel)', description: 'Heavy-duty two-wheel tractor with plough, ridger, and trailer. Ideal for farms up to 5 hectares.', category: 'equipment', price: 3800, memberPrice: 3230, currency: 'USD', unit: 'per unit', image: 'https://images.unsplash.com/photo-1530267981375-f0de937f5f13?w=400&h=300&fit=crop', availability: 'in-stock', rating: 4.6, reviewCount: 45, tags: ['tractor', 'smallholder'], featured: true },
  { id: 'P011', supplierName: 'Matopos Equipment Hire', name: 'Maize Sheller (Manual)', description: 'Hand-operated maize sheller, 100kg/hour. Reduces labour costs by 80%.', category: 'equipment', price: 185, memberPrice: 157.25, currency: 'USD', unit: 'per unit', image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=300&fit=crop', availability: 'in-stock', rating: 4.4, reviewCount: 89, tags: ['maize', 'post-harvest'], featured: false },
  { id: 'P012', supplierName: 'Nairobi Drip Systems', name: 'Drip Irrigation Kit (1 Hectare)', description: 'Complete drip irrigation system with mainline, laterals, emitters, and filter. Gravity-fed option.', category: 'irrigation', price: 850, memberPrice: 722.50, currency: 'USD', unit: 'per kit', image: 'https://images.unsplash.com/photo-1622383563227-04401ab4e5ea?w=400&h=300&fit=crop', availability: 'in-stock', rating: 4.7, reviewCount: 34, tags: ['drip', 'water-saving'], featured: true },
];

const CATEGORIES = [
  { key: 'all', label: 'All Products', icon: Package },
  { key: 'seeds', label: 'Seeds', icon: Leaf },
  { key: 'fertilizer', label: 'Fertilizer', icon: Tag },
  { key: 'pesticides', label: 'Pesticides', icon: Bug },
  { key: 'equipment', label: 'Equipment', icon: Wrench },
  { key: 'irrigation', label: 'Irrigation', icon: Droplets },
  { key: 'technology', label: 'Technology', icon: Cpu },
  { key: 'packaging', label: 'Packaging', icon: Box },
  { key: 'storage', label: 'Storage', icon: Warehouse },
  { key: 'tools', label: 'Tools', icon: Hammer },
];

const AVAILABILITY_LABELS: Record<string, { text: string; color: string }> = {
  'in-stock': { text: 'In Stock', color: 'bg-green-100 text-green-700' },
  limited: { text: 'Limited', color: 'bg-amber-100 text-amber-700' },
  'pre-order': { text: 'Pre-Order', color: 'bg-blue-100 text-blue-700' },
  'out-of-stock': { text: 'Sold Out', color: 'bg-red-100 text-red-600' },
};

/* ─── Component ─── */

export default function PublicMarketplacePage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [products, setProducts] = useState<Product[]>(PRODUCTS);

  // Fetch real products from DB
  useEffect(() => {
    const supabase = createClient();
    async function fetch() {
      const { data } = await supabase.from('products').select('*').eq('status', 'active').order('name');
      if (data && data.length > 0) {
        setProducts(data.map((p: Record<string, unknown>) => ({
          id: String(p.id), supplierName: String(p.supplier_name || p.brand || 'AFU Supplier'),
          name: String(p.name), description: String(p.description || ''),
          category: String(p.category || 'seeds'), price: Number(p.price || 0),
          memberPrice: Number(p.member_price || (Number(p.price || 0) * 0.9)),
          currency: 'USD', unit: String(p.unit || 'per unit'),
          image: String(p.image_url || p.image || 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=300&fit=crop'),
          availability: (p.status === 'active' ? 'in-stock' : 'out-of-stock') as Product['availability'],
          rating: Number(p.rating || 4.5), reviewCount: Number(p.review_count || 0),
          tags: Array.isArray(p.tags) ? p.tags as string[] : [], featured: Boolean(p.featured),
        })));
      }
      // If no DB products, keep PRODUCTS fallback
    }
    fetch();
  }, []);

  const filtered = useMemo(() => {
    let list = products;
    if (category !== 'all') list = list.filter((p) => p.category === category);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.supplierName.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return list;
  }, [search, category]);

  const featuredProducts = PRODUCTS.filter((p) => p.featured);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section
        className="relative py-20 px-4 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1B2A4A 0%, #2A3F6A 50%, #1B2A4A 100%)' }}
      >
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-5 bg-white" />
          <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full opacity-5 bg-[#5DB347]" />
        </div>
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#5DB347]/20 text-[#5DB347] text-sm font-semibold mb-6 border border-[#5DB347]/30">
            <ShoppingCart className="w-4 h-4" />
            AFU Marketplace
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
            Agricultural Inputs<br />& Equipment
          </h1>
          <p className="text-lg md:text-xl text-white/70 max-w-3xl mx-auto mb-10">
            Browse seeds, fertilizers, equipment, and more from verified African suppliers.
            Members get up to 15% off every purchase.
          </p>

          {/* Search */}
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search seeds, fertilizer, equipment..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-900 bg-white shadow-lg text-lg focus:outline-none focus:ring-2 focus:ring-[#5DB347]"
            />
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 mt-12">
            <div className="flex items-center gap-2 text-white/60 text-sm">
              <Shield className="w-5 h-5 text-[#5DB347]" />
              Verified Suppliers
            </div>
            <div className="flex items-center gap-2 text-white/60 text-sm">
              <Truck className="w-5 h-5 text-[#5DB347]" />
              Pan-African Delivery
            </div>
            <div className="flex items-center gap-2 text-white/60 text-sm">
              <Award className="w-5 h-5 text-[#5DB347]" />
              Member Discounts
            </div>
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="bg-[#5DB347] py-4 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <p className="text-white font-medium text-sm md:text-base">
            <Users className="w-4 h-4 inline mr-2" />
            Join AFU for <strong>free</strong> to unlock member pricing on all products
          </p>
          <div className="flex gap-3">
            <Link
              href="/memberships"
              className="px-5 py-2 rounded-lg bg-white text-[#5DB347] font-bold text-sm hover:bg-gray-100 transition-colors"
            >
              View Plans
            </Link>
            <Link
              href="/apply?tier=free"
              className="px-5 py-2 rounded-lg bg-white/20 text-white font-bold text-sm hover:bg-white/30 transition-colors border border-white/30"
            >
              Sign Up Free
            </Link>
          </div>
        </div>
      </section>

      {/* Category tabs */}
      <section className="sticky top-0 z-20 bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex-shrink-0 p-2 rounded-lg border border-gray-200 hover:bg-gray-50 lg:hidden"
            >
              <SlidersHorizontal className="w-5 h-5 text-gray-500" />
            </button>
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.key}
                  onClick={() => setCategory(cat.key)}
                  className={`flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    category === cat.key
                      ? 'bg-[#5DB347] text-white shadow-sm'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-[#1B2A4A]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mobile filter panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-white border-b border-gray-100 overflow-hidden lg:hidden"
          >
            <div className="p-4 flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => { setCategory(cat.key); setShowFilters(false); }}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                    category === cat.key ? 'bg-[#5DB347] text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Products grid */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-[#1B2A4A]">
              {category === 'all' ? 'All Products' : CATEGORIES.find((c) => c.key === category)?.label}
            </h2>
            <p className="text-sm text-gray-400 mt-1">{filtered.length} products</p>
          </div>
          {search && (
            <button onClick={() => setSearch('')} className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1">
              <X className="w-4 h-4" /> Clear search
            </button>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No products found. Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((product) => {
              const avail = AVAILABILITY_LABELS[product.availability] || AVAILABILITY_LABELS['in-stock'];
              return (
                <div
                  key={product.id}
                  className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 group"
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden bg-gray-100">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {product.featured && (
                      <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-[#5DB347] text-white text-[10px] font-bold uppercase tracking-wider">
                        Featured
                      </div>
                    )}
                    <div className={`absolute top-3 right-3 px-2 py-1 rounded-md text-[10px] font-bold ${avail.color}`}>
                      {avail.text}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1">{product.supplierName}</p>
                    <h3 className="font-bold text-[#1B2A4A] text-sm leading-snug mb-2 line-clamp-2">{product.name}</h3>
                    <p className="text-xs text-gray-400 leading-relaxed mb-3 line-clamp-2">{product.description}</p>

                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-3">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span className="text-xs font-medium text-gray-600">{product.rating}</span>
                      <span className="text-xs text-gray-400">({product.reviewCount})</span>
                    </div>

                    {/* Prices */}
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-lg font-extrabold text-[#1B2A4A]">
                          ${product.price}
                          <span className="text-xs font-normal text-gray-400 ml-1">{product.unit}</span>
                        </p>
                        <p className="text-xs text-[#5DB347] font-semibold">
                          Member: ${product.memberPrice.toFixed(2)}
                        </p>
                      </div>
                      <Link
                        href="/memberships"
                        className="p-2 rounded-lg bg-[#5DB347]/10 text-[#5DB347] hover:bg-[#5DB347] hover:text-white transition-colors"
                      >
                        <ShoppingCart className="w-5 h-5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Become a supplier CTA */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-[#1B2A4A] mb-4">Sell on AFU Marketplace</h2>
          <p className="text-gray-500 max-w-2xl mx-auto mb-8">
            Reach thousands of farmers across Africa. List your agricultural inputs, equipment,
            and services on the continent&apos;s largest farming platform.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/supplier/apply"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-white font-bold text-lg hover:shadow-xl hover:shadow-[#5DB347]/30 hover:-translate-y-0.5 transition-all"
              style={{ background: 'linear-gradient(135deg, #5DB347, #449933)' }}
            >
              Apply as Supplier
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/apply?tier=free"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-[#1B2A4A] font-bold text-lg border-2 border-gray-200 hover:border-[#5DB347] hover:-translate-y-0.5 transition-all"
            >
              Join as Member
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
