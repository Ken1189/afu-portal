'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Eye,
  Star,
  ShoppingCart,
  Tag,
  CheckCircle2,
  AlertCircle,
  Clock,
  Package,
  Users,
  Percent,
} from 'lucide-react';
import { supplierProducts } from '@/lib/data/supplierProducts';

// -- Animation variants -------------------------------------------------------

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

// -- Tier multipliers ---------------------------------------------------------

type MemberTier = 'Smallholder' | 'Commercial' | 'Enterprise';

const tierMultipliers: Record<MemberTier, number> = {
  Smallholder: 1.0,
  Commercial: 0.95,
  Enterprise: 0.88,
};

const tierDescriptions: Record<MemberTier, string> = {
  Smallholder: 'Standard AFU member discount',
  Commercial: 'Additional 5% commercial tier discount',
  Enterprise: 'Maximum 12% enterprise tier discount',
};

const tierColors: Record<MemberTier, { bg: string; text: string; border: string }> = {
  Smallholder: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' },
  Commercial: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
  Enterprise: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' },
};

// -- Availability config ------------------------------------------------------

const availabilityConfig: Record<
  string,
  { label: string; color: string; icon: React.ReactNode }
> = {
  'in-stock': {
    label: 'In Stock',
    color: 'bg-green-100 text-green-700',
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
  limited: {
    label: 'Limited Stock',
    color: 'bg-amber-100 text-amber-700',
    icon: <AlertCircle className="w-3 h-3" />,
  },
  'pre-order': {
    label: 'Pre-Order',
    color: 'bg-blue-100 text-blue-700',
    icon: <Clock className="w-3 h-3" />,
  },
  'out-of-stock': {
    label: 'Out of Stock',
    color: 'bg-red-100 text-red-700',
    icon: <AlertCircle className="w-3 h-3" />,
  },
};

// -- Filter products for SUP-001 ----------------------------------------------

const myProducts = supplierProducts.filter((p) => p.supplierId === 'SUP-001');

// =============================================================================
//  MAIN COMPONENT
// =============================================================================

export default function SupplierMarketplacePage() {
  const [selectedTier, setSelectedTier] = useState<MemberTier>('Smallholder');
  const tiers: MemberTier[] = ['Smallholder', 'Commercial', 'Enterprise'];

  const getDiscountedPrice = (memberPrice: number, tier: MemberTier): number => {
    return Number((memberPrice * tierMultipliers[tier]).toFixed(2));
  };

  const getSavingsPercent = (originalPrice: number, discountedPrice: number): number => {
    return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* =====================================================================
          1. PAGE HEADER
      ====================================================================== */}
      <motion.div
        variants={fadeUp}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#2AA198]/10 flex items-center justify-center">
            <Eye className="w-5 h-5 text-[#2AA198]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1B2A4A]">Marketplace Preview</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              This is how your products appear to AFU members
            </p>
          </div>
        </div>
      </motion.div>

      {/* =====================================================================
          2. TIER TOGGLE
      ====================================================================== */}
      <motion.div
        variants={cardVariants}
        className="bg-white rounded-xl border border-gray-100 p-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#2AA198]" />
            <span className="text-sm font-semibold text-[#1B2A4A]">View as:</span>
          </div>

          <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1">
            {tiers.map((tier) => {
              const colors = tierColors[tier];
              return (
                <button
                  key={tier}
                  onClick={() => setSelectedTier(tier)}
                  className={`relative px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                    selectedTier === tier
                      ? `${colors.bg} ${colors.text} shadow-sm border ${colors.border}`
                      : 'text-gray-500 hover:text-[#1B2A4A] border border-transparent'
                  }`}
                >
                  {tier}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 bg-[#2AA198]/5 rounded-lg px-4 py-2.5">
          <Percent className="w-4 h-4 text-[#2AA198]" />
          <p className="text-xs text-gray-600">
            <span className="font-semibold text-[#2AA198]">{selectedTier} Tier:</span>{' '}
            {tierDescriptions[selectedTier]}
          </p>
        </div>
      </motion.div>

      {/* =====================================================================
          3. PRODUCT GRID
      ====================================================================== */}
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
      >
        {myProducts.map((product, index) => {
          const discountedPrice = getDiscountedPrice(product.memberPrice, selectedTier);
          const savingsPercent = getSavingsPercent(product.price, discountedPrice);
          const avail = availabilityConfig[product.availability];

          return (
            <motion.div
              key={product.id}
              variants={cardVariants}
              whileHover={{ y: -4, boxShadow: '0 12px 30px rgba(27,42,74,0.10)' }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl border border-gray-100 overflow-hidden group"
            >
              {/* Product image */}
              <div className="relative h-44 bg-gray-100 overflow-hidden">
                <div
                  className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                  style={{ backgroundImage: `url(${product.image})` }}
                />
                {/* Savings badge */}
                <div className="absolute top-3 left-3">
                  <span className="inline-flex items-center gap-1 bg-[#2AA198] text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
                    <Tag className="w-3 h-3" />
                    You save {savingsPercent}%
                  </span>
                </div>

                {/* Availability badge */}
                <div className="absolute top-3 right-3">
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full ${avail.color}`}
                  >
                    {avail.icon}
                    {avail.label}
                  </span>
                </div>

                {/* Featured badge */}
                {product.featured && (
                  <div className="absolute bottom-3 left-3">
                    <span className="inline-flex items-center gap-1 bg-[#D4A843] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      <Star className="w-2.5 h-2.5 fill-white" />
                      Featured
                    </span>
                  </div>
                )}
              </div>

              {/* Product details */}
              <div className="p-4">
                {/* Supplier badge */}
                <div className="flex items-center gap-1.5 mb-2">
                  <div className="w-5 h-5 rounded bg-[#2AA198] flex items-center justify-center">
                    <span className="text-white text-[7px] font-bold">ZA</span>
                  </div>
                  <span className="text-[10px] text-gray-400 font-medium">
                    {product.supplierName}
                  </span>
                  <CheckCircle2 className="w-3 h-3 text-[#2AA198]" />
                </div>

                {/* Product name */}
                <h4 className="text-sm font-semibold text-[#1B2A4A] mb-2 leading-tight line-clamp-2">
                  {product.name}
                </h4>

                {/* Rating */}
                <div className="flex items-center gap-1.5 mb-3">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < Math.floor(product.rating)
                            ? 'text-[#D4A843] fill-[#D4A843]'
                            : i < product.rating
                              ? 'text-[#D4A843] fill-[#D4A843]/50'
                              : 'text-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] text-gray-400">
                    {product.rating} ({product.reviewCount})
                  </span>
                </div>

                {/* Pricing */}
                <div className="flex items-end gap-2 mb-3">
                  <span className="text-lg font-bold text-[#2AA198] tabular-nums">
                    ${discountedPrice.toFixed(2)}
                  </span>
                  <span className="text-sm text-gray-400 line-through tabular-nums mb-0.5">
                    ${product.price.toFixed(2)}
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 -mt-2 mb-3">{product.unit}</p>

                {/* Sold count */}
                <div className="flex items-center gap-1 text-[10px] text-gray-400 mb-4">
                  <Package className="w-3 h-3" />
                  <span>{product.soldCount.toLocaleString()} sold</span>
                  <span className="mx-1">|</span>
                  <span>Min order: {product.minOrder}</span>
                </div>

                {/* Add to cart button (disabled mock) */}
                <button
                  disabled
                  className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-400 py-2.5 rounded-lg text-sm font-semibold cursor-not-allowed"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Add to Cart
                </button>
                <p className="text-[9px] text-gray-300 text-center mt-1.5">
                  Preview only &mdash; members purchase from the marketplace
                </p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* =====================================================================
          4. PRICING COMPARISON TABLE
      ====================================================================== */}
      <motion.div
        variants={cardVariants}
        className="bg-white rounded-xl border border-gray-100 overflow-hidden"
      >
        <div className="p-5 border-b border-gray-100">
          <h3 className="font-semibold text-[#1B2A4A] text-sm flex items-center gap-2">
            <Tag className="w-4 h-4 text-[#2AA198]" />
            Pricing Across Tiers
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Comparison of your product pricing across all member tiers
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Product
                </th>
                <th className="text-right py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Retail Price
                </th>
                <th className="text-right py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  <span className="flex items-center justify-end gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-400" />
                    Smallholder
                  </span>
                </th>
                <th className="text-right py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  <span className="flex items-center justify-end gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                    Commercial
                  </span>
                </th>
                <th className="text-right py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  <span className="flex items-center justify-end gap-1">
                    <span className="w-2 h-2 rounded-full bg-purple-400" />
                    Enterprise
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {myProducts.map((product, i) => {
                const smallholderPrice = getDiscountedPrice(product.memberPrice, 'Smallholder');
                const commercialPrice = getDiscountedPrice(product.memberPrice, 'Commercial');
                const enterprisePrice = getDiscountedPrice(product.memberPrice, 'Enterprise');

                return (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <span className="text-sm font-medium text-[#1B2A4A] truncate block max-w-[200px]">
                        {product.name}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-sm text-gray-400 line-through tabular-nums">
                      ${product.price.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-sm font-semibold text-green-600 tabular-nums">
                        ${smallholderPrice.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-sm font-semibold text-blue-600 tabular-nums">
                        ${commercialPrice.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-sm font-semibold text-purple-600 tabular-nums">
                        ${enterprisePrice.toFixed(2)}
                      </span>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
