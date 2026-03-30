'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/supabase/auth-context';
import {
  Percent,
  ArrowLeft,
  Save,
  Tag,
  Users,
  Package,
  Layers,
  ChevronDown,
  ChevronUp,
  Check,
  Edit3,
  X,
  Info,
  ShoppingCart,
} from 'lucide-react';
// ── Inline types & fallback data (replaces @/lib/data/ imports) ─────────────

type SupplierCategory = 'input-supplier' | 'equipment' | 'logistics' | 'processing' | 'technology' | 'financial-services';
type SponsorshipTier = 'platinum' | 'gold' | 'silver' | 'bronze';
type Country = 'Botswana' | 'Kenya' | 'Mozambique' | 'Nigeria' | 'Sierra Leone' | 'South Africa' | 'Tanzania' | 'Uganda' | 'Zambia' | 'Zimbabwe';

interface Supplier {
  id: string; companyName: string; contactName: string; email: string; phone: string;
  country: Country; region: string; category: SupplierCategory;
  status: 'active' | 'pending' | 'suspended'; joinDate: string; logo: string;
  description: string; productsCount: number; totalSales: number; totalOrders: number;
  rating: number; reviewCount: number; memberDiscountPercent: number; commissionRate: number;
  isFounding: boolean; sponsorshipTier: SponsorshipTier | null; verified: boolean;
  website: string; certifications: string[];
}

interface SupplierProduct {
  id: string; supplierId: string; supplierName: string; name: string; description: string;
  category: 'seeds' | 'fertilizer' | 'pesticides' | 'equipment' | 'irrigation' | 'technology' | 'packaging' | 'storage' | 'tools';
  price: number; memberPrice: number; currency: string; unit: string; image: string;
  availability: 'in-stock' | 'limited' | 'pre-order' | 'out-of-stock';
  rating: number; reviewCount: number; soldCount: number; tags: string[];
  featured: boolean; minOrder: number;
}

const FALLBACK_SUPPLIERS: Supplier[] = [
  { id: 'SUP-001', companyName: 'Zambezi Agri-Supplies', contactName: 'Farai Ndlovu', email: 'farai@zambezi-agri.co.zw', phone: '+263 77 200 1001', country: 'Zimbabwe', region: 'Harare', category: 'input-supplier', status: 'active', joinDate: '2024-06-15', logo: 'https://images.unsplash.com/photo-1560693225-b8507d6f3aa9?w=400&h=300&fit=crop', description: 'Leading agricultural input supplier across Southern Africa.', productsCount: 38, totalSales: 1847320, totalOrders: 4215, rating: 4.8, reviewCount: 312, memberDiscountPercent: 12, commissionRate: 8, isFounding: true, sponsorshipTier: 'platinum', verified: true, website: 'https://zambezi-agri.co.zw', certifications: ['ISO 9001', 'GlobalGAP Approved', 'SADC Trade Certified'] },
];

const FALLBACK_PRODUCTS: SupplierProduct[] = [
  { id: 'SPROD-005', supplierId: 'SUP-001', supplierName: 'Zambezi Agri-Supplies', name: 'Groundnut Seed (Nyanda)', description: 'Virginia-type groundnut variety.', category: 'seeds', price: 78, memberPrice: 68.64, currency: 'USD', unit: 'per 25kg bag', image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400&h=300&fit=crop', availability: 'in-stock', rating: 4.8, reviewCount: 98, soldCount: 1678, tags: ['groundnut'], featured: true, minOrder: 1 },
  { id: 'SPROD-014', supplierId: 'SUP-001', supplierName: 'Zambezi Agri-Supplies', name: 'Metalaxyl + Mancozeb Fungicide', description: 'Systemic and contact fungicide.', category: 'pesticides', price: 35, memberPrice: 30.80, currency: 'USD', unit: 'per kg', image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=300&fit=crop', availability: 'in-stock', rating: 4.5, reviewCount: 76, soldCount: 1345, tags: ['fungicide'], featured: false, minOrder: 2 },
  { id: 'SPROD-035', supplierId: 'SUP-001', supplierName: 'Zambezi Agri-Supplies', name: 'Knapsack Sprayer (16L Manual)', description: 'High-pressure manual knapsack sprayer.', category: 'tools', price: 35, memberPrice: 30.80, currency: 'USD', unit: 'per unit', image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop', availability: 'in-stock', rating: 4.3, reviewCount: 123, soldCount: 3456, tags: ['sprayer'], featured: false, minOrder: 1 },
  { id: 'SPROD-036', supplierId: 'SUP-001', supplierName: 'Zambezi Agri-Supplies', name: 'Soil pH Test Kit (50 tests)', description: 'Portable soil pH testing kit.', category: 'tools', price: 28, memberPrice: 24.64, currency: 'USD', unit: 'per kit', image: 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=400&h=300&fit=crop', availability: 'in-stock', rating: 4.4, reviewCount: 56, soldCount: 789, tags: ['soil-testing'], featured: false, minOrder: 1 },
  { id: 'SPROD-038', supplierId: 'SUP-001', supplierName: 'Zambezi Agri-Supplies', name: 'Pruning Shears (Bypass, Professional)', description: 'Professional bypass pruning shears.', category: 'tools', price: 12, memberPrice: 10.56, currency: 'USD', unit: 'per unit', image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop', availability: 'in-stock', rating: 4.5, reviewCount: 67, soldCount: 1234, tags: ['pruning'], featured: false, minOrder: 2 },
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

const FALLBACK_SUPPLIER = FALLBACK_SUPPLIERS.find((s) => s.id === 'SUP-001')!;
const FALLBACK_MY_PRODUCTS = FALLBACK_PRODUCTS.filter((p) => p.supplierId === FALLBACK_SUPPLIER.id);

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatCurrency(value: number): string {
  return `$${value.toFixed(2)}`;
}

// ── Types ───────────────────────────────────────────────────────────────────

interface ProductDiscount {
  productId: string;
  discount: number;
}

interface TierMultiplier {
  tier: string;
  label: string;
  multiplier: number;
}

interface VolumeRange {
  label: string;
  min: number;
  max: number | null;
  discount: number;
}

// ═══════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function MemberDiscounts() {
  const { user } = useAuth();
  const [liveProducts, setLiveProducts] = useState<SupplierProduct[]>(FALLBACK_MY_PRODUCTS);
  const [liveSupplier, setLiveSupplier] = useState(FALLBACK_SUPPLIER);
  const [loading, setLoading] = useState(true);

  // ── Fetch products & supplier from Supabase ─────────────────────────────
  useEffect(() => {
    async function fetchData() {
      try {
        const supabase = createClient();
        const { data: supplier } = await supabase
          .from('suppliers')
          .select('*')
          .eq('profile_id', user?.id ?? '')
          .single();

        if (supplier) {
          setLiveSupplier({
            ...FALLBACK_SUPPLIER,
            id: supplier.id,
            companyName: supplier.company_name,
            memberDiscountPercent: supplier.member_discount_percent ?? FALLBACK_SUPPLIER.memberDiscountPercent,
            commissionRate: supplier.commission_rate ?? FALLBACK_SUPPLIER.commissionRate,
          });

          const { data: products } = await supabase
            .from('products')
            .select('*')
            .eq('supplier_id', supplier.id);

          if (products && products.length > 0) {
            const mapped: SupplierProduct[] = products.map((p: any) => ({
              id: p.id,
              supplierId: p.supplier_id,
              supplierName: supplier.company_name,
              name: p.name,
              description: p.description || '',
              category: p.category || 'seeds',
              price: p.price,
              memberPrice: p.member_price || p.price,
              currency: p.currency || 'USD',
              unit: p.unit || 'unit',
              image: p.image_url || 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=300&fit=crop',
              availability: p.in_stock ? 'in-stock' : 'out-of-stock',
              rating: p.rating || 0,
              reviewCount: p.review_count || 0,
              soldCount: p.sold_count || 0,
              tags: p.tags || [],
              featured: p.featured || false,
              minOrder: 1,
            }));
            setLiveProducts(mapped);
          }
        }
      } catch (err) {
        // Keep fallback
      } finally {
        setLoading(false);
      }
    }
    if (user) fetchData();
    else setLoading(false);
  }, [user]);

  // ── Global discount state ─────────────────────────────────────────────
  const [globalDiscount, setGlobalDiscount] = useState(FALLBACK_SUPPLIER.memberDiscountPercent);
  const [savedGlobalDiscount, setSavedGlobalDiscount] = useState(FALLBACK_SUPPLIER.memberDiscountPercent);
  const [globalSaved, setGlobalSaved] = useState(false);

  // Sync global discount when supplier loads from DB
  useEffect(() => {
    setGlobalDiscount(liveSupplier.memberDiscountPercent);
    setSavedGlobalDiscount(liveSupplier.memberDiscountPercent);
  }, [liveSupplier]);

  // ── Per-product discount state ────────────────────────────────────────
  const [productDiscounts, setProductDiscounts] = useState<ProductDiscount[]>(
    liveProducts.map((p) => ({
      productId: p.id,
      discount: Math.round(((p.price - p.memberPrice) / p.price) * 100),
    }))
  );
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);

  // ── Tier-based discount state ─────────────────────────────────────────
  const [tierMultipliers, setTierMultipliers] = useState<TierMultiplier[]>([
    { tier: 'smallholder', label: 'Smallholder', multiplier: 1.0 },
    { tier: 'commercial', label: 'Commercial', multiplier: 1.25 },
    { tier: 'enterprise', label: 'Enterprise', multiplier: 1.5 },
    { tier: 'partner', label: 'Partner', multiplier: 2.0 },
  ]);

  // ── Volume discount state ─────────────────────────────────────────────
  const [volumeDiscounts, setVolumeDiscounts] = useState<VolumeRange[]>([
    { label: '1 - 10 units', min: 1, max: 10, discount: 0 },
    { label: '11 - 50 units', min: 11, max: 50, discount: 3 },
    { label: '51 - 100 units', min: 51, max: 100, discount: 5 },
    { label: '100+ units', min: 101, max: null, discount: 8 },
  ]);

  // ── Section collapse state ────────────────────────────────────────────
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    products: true,
    tiers: true,
    volume: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // ── Save global discount ──────────────────────────────────────────────
  const handleSaveGlobal = () => {
    setSavedGlobalDiscount(globalDiscount);
    setGlobalSaved(true);
    setTimeout(() => setGlobalSaved(false), 2000);
  };

  // ── Edit product discount ─────────────────────────────────────────────
  const startEdit = (productId: string) => {
    const current = productDiscounts.find((p) => p.productId === productId);
    setEditingProduct(productId);
    setEditValue(current?.discount || 0);
  };

  const saveEdit = () => {
    if (editingProduct) {
      setProductDiscounts((prev) =>
        prev.map((p) =>
          p.productId === editingProduct ? { ...p, discount: editValue } : p
        )
      );
      setEditingProduct(null);
    }
  };

  const cancelEdit = () => {
    setEditingProduct(null);
  };

  // ── Multiplier options ────────────────────────────────────────────────
  const multiplierOptions = [1.0, 1.25, 1.5, 1.75, 2.0, 2.5, 3.0];

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
      <motion.div variants={fadeUp} className="flex items-center gap-3">
        <Link
          href="/supplier"
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">Member Discounts</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Configure discounts for AFU members across your products
          </p>
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════════════════════════
          CURRENT GLOBAL DISCOUNT
      ═════════════════════════════════════════════════════════════════ */}
      <motion.div
        variants={cardVariants}
        className="bg-white rounded-xl border border-gray-100 p-6"
      >
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-[#8CB89C]/10 flex items-center justify-center text-[#8CB89C]">
              <Percent className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-[#1B2A4A] text-base">Current Global Discount</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Base discount applied to all products for AFU members
              </p>
            </div>
          </div>
          {globalSaved && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-100 text-green-700 text-xs font-medium"
            >
              <Check className="w-3 h-3" />
              Saved
            </motion.div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-3">
              <span className="text-4xl font-bold text-[#8CB89C] tabular-nums">{globalDiscount}%</span>
              {globalDiscount !== savedGlobalDiscount && (
                <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                  Unsaved changes
                </span>
              )}
            </div>
            <input
              type="range"
              min={5}
              max={25}
              value={globalDiscount}
              onChange={(e) => setGlobalDiscount(parseInt(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #8CB89C ${((globalDiscount - 5) / 20) * 100}%, #E5E7EB ${((globalDiscount - 5) / 20) * 100}%)`,
              }}
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>5%</span>
              <span>15%</span>
              <span>25%</span>
            </div>
          </div>
          <button
            onClick={handleSaveGlobal}
            disabled={globalDiscount === savedGlobalDiscount}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              globalDiscount !== savedGlobalDiscount
                ? 'bg-[#8CB89C] text-white hover:bg-[#729E82] hover:shadow-lg'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>

        {/* Info notice */}
        <div className="mt-4 flex items-start gap-2 bg-blue-50 rounded-lg p-3">
          <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-blue-600">
            The global discount is applied as the base rate for all products. Per-product and tier-based
            overrides can increase or decrease the effective discount.
          </p>
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════════════════════════
          PER-PRODUCT DISCOUNTS
      ═════════════════════════════════════════════════════════════════ */}
      <motion.div
        variants={cardVariants}
        className="bg-white rounded-xl border border-gray-100 overflow-hidden"
      >
        <button
          onClick={() => toggleSection('products')}
          className="w-full p-5 flex items-center justify-between border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
        >
          <h3 className="font-semibold text-[#1B2A4A] text-sm flex items-center gap-2">
            <Package className="w-4 h-4 text-[#8CB89C]" />
            Per-Product Discounts ({liveProducts.length} products)
          </h3>
          {expandedSections.products ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </button>

        {expandedSections.products && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Product Name
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Retail Price
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Current Discount
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Member Price
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {liveProducts.map((product, i) => {
                  const discountInfo = productDiscounts.find((p) => p.productId === product.id);
                  const discountPct = discountInfo?.discount || 0;
                  const memberPrice = product.price * (1 - discountPct / 100);
                  const isEditing = editingProduct === product.id;

                  return (
                    <motion.tr
                      key={product.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="hover:bg-cream/50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <Tag className="w-3.5 h-3.5 text-gray-400" />
                          </div>
                          <span className="font-medium text-[#1B2A4A] text-sm truncate max-w-[200px]">
                            {product.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right text-sm text-gray-600 tabular-nums">
                        {formatCurrency(product.price)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-1">
                            <input
                              type="number"
                              min={0}
                              max={50}
                              value={editValue}
                              onChange={(e) => setEditValue(Math.min(50, Math.max(0, parseInt(e.target.value) || 0)))}
                              className="w-16 px-2 py-1 rounded border border-[#8CB89C] text-sm text-right text-[#1B2A4A] focus:outline-none focus:ring-1 focus:ring-[#8CB89C]"
                              autoFocus
                            />
                            <span className="text-xs text-gray-500">%</span>
                          </div>
                        ) : (
                          <span className="text-sm font-semibold text-[#8CB89C] tabular-nums">
                            {discountPct}%
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-sm font-medium text-[#1B2A4A] tabular-nums">
                          {isEditing
                            ? formatCurrency(product.price * (1 - editValue / 100))
                            : formatCurrency(memberPrice)}
                        </span>
                        {discountPct > 0 && !isEditing && (
                          <span className="block text-[10px] text-green-600">
                            Save {formatCurrency(product.price - memberPrice)}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {isEditing ? (
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={saveEdit}
                              className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="p-1.5 rounded-lg bg-gray-50 text-gray-400 hover:bg-gray-100 transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startEdit(product.id)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#8CB89C] transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* ══════════════════════════════════════════════════════════════════
          TIER-BASED DISCOUNTS
      ═════════════════════════════════════════════════════════════════ */}
      <motion.div
        variants={cardVariants}
        className="bg-white rounded-xl border border-gray-100 overflow-hidden"
      >
        <button
          onClick={() => toggleSection('tiers')}
          className="w-full p-5 flex items-center justify-between border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
        >
          <h3 className="font-semibold text-[#1B2A4A] text-sm flex items-center gap-2">
            <Users className="w-4 h-4 text-[#8CB89C]" />
            Tier-Based Discounts
          </h3>
          {expandedSections.tiers ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </button>

        {expandedSections.tiers && (
          <div className="p-5">
            <p className="text-xs text-gray-500 mb-4">
              Set a discount multiplier for each member tier. The base discount is multiplied by this factor.
              For example, a 1.5x multiplier on a 12% base discount gives an 18% effective discount.
            </p>

            <div className="space-y-3">
              {tierMultipliers.map((tier, i) => {
                const effectiveDiscount = Math.round(globalDiscount * tier.multiplier);
                return (
                  <motion.div
                    key={tier.tier}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg bg-gray-50 gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${
                          tier.tier === 'partner'
                            ? 'bg-[#D4A843]/20 text-[#D4A843]'
                            : tier.tier === 'enterprise'
                              ? 'bg-purple-100 text-purple-600'
                              : tier.tier === 'commercial'
                                ? 'bg-blue-100 text-blue-600'
                                : 'bg-green-100 text-green-600'
                        }`}
                      >
                        {tier.label.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#1B2A4A]">{tier.label}</p>
                        <p className="text-[10px] text-gray-400">
                          Effective discount:{' '}
                          <span className="font-semibold text-[#8CB89C]">{effectiveDiscount}%</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500">Multiplier:</span>
                      <div className="flex items-center gap-1">
                        {multiplierOptions.map((mult) => (
                          <button
                            key={mult}
                            onClick={() =>
                              setTierMultipliers((prev) =>
                                prev.map((t) =>
                                  t.tier === tier.tier ? { ...t, multiplier: mult } : t
                                )
                              )
                            }
                            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                              tier.multiplier === mult
                                ? 'bg-[#8CB89C] text-white shadow-sm'
                                : 'bg-white border border-gray-200 text-gray-600 hover:border-[#8CB89C]/30'
                            }`}
                          >
                            {mult}x
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Tier discount summary */}
            <div className="mt-4 p-4 rounded-lg bg-[#8CB89C]/5 border border-[#8CB89C]/10">
              <p className="text-xs font-medium text-[#1B2A4A] mb-2">Effective Discount Summary</p>
              <div className="grid grid-cols-4 gap-3">
                {tierMultipliers.map((tier) => (
                  <div key={tier.tier} className="text-center">
                    <p className="text-lg font-bold text-[#8CB89C] tabular-nums">
                      {Math.round(globalDiscount * tier.multiplier)}%
                    </p>
                    <p className="text-[10px] text-gray-500">{tier.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* ══════════════════════════════════════════════════════════════════
          VOLUME DISCOUNTS
      ═════════════════════════════════════════════════════════════════ */}
      <motion.div
        variants={cardVariants}
        className="bg-white rounded-xl border border-gray-100 overflow-hidden"
      >
        <button
          onClick={() => toggleSection('volume')}
          className="w-full p-5 flex items-center justify-between border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
        >
          <h3 className="font-semibold text-[#1B2A4A] text-sm flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#8CB89C]" />
            Volume Discounts
          </h3>
          {expandedSections.volume ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </button>

        {expandedSections.volume && (
          <div className="p-5">
            <p className="text-xs text-gray-500 mb-4">
              Additional discounts applied on top of the member tier discount when order quantity exceeds thresholds.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2.5 px-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Quantity Range
                    </th>
                    <th className="text-right py-2.5 px-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Additional Discount
                    </th>
                    <th className="text-right py-2.5 px-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Effective Total (Smallholder)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {volumeDiscounts.map((range, i) => {
                    const baseDiscount = globalDiscount * tierMultipliers[0].multiplier;
                    const totalDiscount = baseDiscount + range.discount;
                    return (
                      <motion.tr
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="hover:bg-cream/50 transition-colors"
                      >
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <ShoppingCart className="w-3.5 h-3.5 text-gray-400" />
                            <span className="font-medium text-[#1B2A4A]">{range.label}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <input
                              type="number"
                              min={0}
                              max={25}
                              value={range.discount}
                              onChange={(e) =>
                                setVolumeDiscounts((prev) =>
                                  prev.map((r, ri) =>
                                    ri === i ? { ...r, discount: Math.min(25, Math.max(0, parseInt(e.target.value) || 0)) } : r
                                  )
                                )
                              }
                              className="w-16 px-2 py-1.5 rounded-lg border border-gray-200 text-sm text-right text-[#1B2A4A] focus:outline-none focus:ring-2 focus:ring-[#8CB89C]/30 focus:border-[#8CB89C]"
                            />
                            <span className="text-xs text-gray-500">%</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <span
                            className={`text-sm font-semibold tabular-nums ${
                              totalDiscount > 20 ? 'text-[#D4A843]' : 'text-[#8CB89C]'
                            }`}
                          >
                            {Math.round(totalDiscount)}%
                          </span>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Visual representation */}
            <div className="mt-4 flex items-end gap-2 h-28">
              {volumeDiscounts.map((range, i) => {
                const baseDiscount = globalDiscount * tierMultipliers[0].multiplier;
                const totalDiscount = baseDiscount + range.discount;
                const heightPct = Math.min((totalDiscount / 30) * 100, 100);
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] font-semibold text-[#1B2A4A] tabular-nums">
                      {Math.round(totalDiscount)}%
                    </span>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${heightPct}%` }}
                      transition={{ duration: 0.6, delay: i * 0.1 }}
                      className="w-full rounded-t-lg"
                      style={{
                        background: `linear-gradient(180deg, #8CB89C 0%, ${totalDiscount > 20 ? '#D4A843' : '#729E82'} 100%)`,
                      }}
                    />
                    <span className="text-[9px] text-gray-400 text-center leading-tight">{range.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </motion.div>

      {/* ══════════════════════════════════════════════════════════════════
          SAVE ALL BUTTON
      ═════════════════════════════════════════════════════════════════ */}
      <motion.div variants={fadeUp} className="flex justify-end pt-2">
        <button
          onClick={handleSaveGlobal}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium text-white transition-all hover:shadow-lg"
          style={{ background: 'linear-gradient(135deg, #8CB89C 0%, #729E82 100%)' }}
        >
          <Save className="w-4 h-4" />
          Save All Discount Settings
        </button>
      </motion.div>
    </motion.div>
  );
}
