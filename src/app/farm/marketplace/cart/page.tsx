'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart,
  ArrowLeft,
  Trash2,
  Plus,
  Minus,
  Package,
  Tag,
  Truck,
  CreditCard,
  Sparkles,
  CheckCircle,
  X,
  Smartphone,
  Landmark,
  Leaf,
  Bug,
  Wrench,
  Droplets,
  Cpu,
  Box,
  Warehouse,
  Hammer,
} from 'lucide-react';
import { useCartStore, type CartItem } from '@/lib/stores/cartStore';
import { useOrders } from '@/lib/supabase/use-orders';
import { useAuth } from '@/lib/supabase/auth-context';
import { createClient } from '@/lib/supabase/client';
import { useLanguage } from '@/lib/i18n/LanguageContext';

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
  exit: {
    opacity: 0,
    scale: 0.9,
    x: -80,
    transition: {
      duration: 0.25,
      ease: 'easeIn' as const,
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

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'orange-money',
    name: 'Orange Money',
    icon: <Smartphone size={16} />,
    color: 'bg-orange-100 text-orange-700 border-orange-200',
  },
  {
    id: 'ecocash',
    name: 'EcoCash',
    icon: <Smartphone size={16} />,
    color: 'bg-green-100 text-green-700 border-green-200',
  },
  {
    id: 'mpesa',
    name: 'M-Pesa',
    icon: <Smartphone size={16} />,
    color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  },
  {
    id: 'bank-transfer',
    name: 'Bank Transfer',
    icon: <Landmark size={16} />,
    color: 'bg-blue-100 text-blue-700 border-blue-200',
  },
];

// ---------------------------------------------------------------------------
// Cart Item Sub-Component
// ---------------------------------------------------------------------------

function CartItemRow({
  item,
  onRemove,
  onUpdateQuantity,
}: {
  item: CartItem;
  onRemove: () => void;
  onUpdateQuantity: (qty: number) => void;
}) {
  const { product, quantity } = item;
  const gradient = categoryGradients[product.category] || 'from-gray-400 to-gray-600';
  const catColor = categoryColors[product.category] || 'bg-gray-100 text-gray-600';
  const lineTotal = product.memberPrice * quantity;

  return (
    <motion.div
      variants={cardVariants}
      layout
      exit="exit"
      className="rounded-2xl bg-white border border-gray-100 p-3.5 shadow-sm"
    >
      <div className="flex gap-3">
        {/* Product image area */}
        <div
          className={`shrink-0 w-20 h-20 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center relative overflow-hidden`}
        >
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-white/10 rounded-full" />
          <Package size={24} className="text-white relative z-10" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-navy leading-tight line-clamp-2">
                {product.name}
              </h3>
              <p className="text-[11px] text-gray-400 mt-0.5 truncate">{product.supplierName}</p>
            </div>

            {/* Remove button */}
            <button
              onClick={onRemove}
              className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-red-400 hover:bg-red-50 hover:text-red-500 active:bg-red-100 transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>

          {/* Category badge */}
          <span
            className={`inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize mt-1.5 ${catColor}`}
          >
            {product.category}
          </span>

          {/* Price row */}
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[11px] text-gray-400 line-through">
              ${product.price.toFixed(2)}
            </span>
            <span className="text-sm font-bold text-teal">${product.memberPrice.toFixed(2)}</span>
            <span className="text-[10px] text-gray-400">{product.unit}</span>
          </div>

          {/* Quantity + Line Total */}
          <div className="flex items-center justify-between mt-3">
            {/* Quantity editor */}
            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => onUpdateQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 active:bg-gray-100 transition-colors"
              >
                <Minus size={14} />
              </button>
              <span className="w-10 h-8 flex items-center justify-center text-xs font-bold text-navy border-x border-gray-200">
                {quantity}
              </span>
              <button
                onClick={() => onUpdateQuantity(quantity + 1)}
                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 active:bg-gray-100 transition-colors"
              >
                <Plus size={14} />
              </button>
            </div>

            {/* Line total */}
            <p className="text-sm font-bold text-navy">${lineTotal.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main Cart Page Component
// ---------------------------------------------------------------------------

export default function CartPage() {
  useLanguage(); // keeps the language context active

  const { user, profile } = useAuth();
  const { createOrder } = useOrders();
  const { items, removeItem, updateQuantity, clearCart, getTotal, getMemberTotal, getSavings, getItemCount } =
    useCartStore();

  const [selectedPayment, setSelectedPayment] = useState<string>('orange-money');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string>('');
  const [isPlacing, setIsPlacing] = useState(false);

  const itemCount = getItemCount();
  const subtotal = getTotal();
  const memberTotal = getMemberTotal();
  const savings = getSavings();
  const deliveryFee = memberTotal >= 200 ? 0 : 15;
  const orderTotal = memberTotal + deliveryFee;

  const handlePlaceOrder = async () => {
    if (items.length === 0) return;
    setIsPlacing(true);

    // Try to create a real order if user is logged in
    if (user) {
      try {
        // Look up the member record for this user
        const supabase = createClient();
        const { data: member } = await supabase
          .from('members')
          .select('id')
          .eq('profile_id', user.id)
          .single();

        if (member) {
          // Build order items from cart — need supplier_id for each product
          const orderItems = await Promise.all(
            items.map(async (item) => {
              // Look up product to get supplier_id
              const { data: product } = await supabase
                .from('products')
                .select('supplier_id')
                .eq('id', item.product.id)
                .single();

              return {
                product_id: item.product.id,
                supplier_id: product?.supplier_id || '',
                quantity: item.quantity,
                unit_price: item.product.memberPrice || item.product.price,
                total_price: (item.product.memberPrice || item.product.price) * item.quantity,
              };
            })
          );

          const validItems = orderItems.filter(i => i.supplier_id);

          if (validItems.length > 0) {
            const { data: order } = await createOrder(
              member.id,
              validItems,
              { country: profile?.country || '', region: profile?.region || '' }
            );
            if (order) {
              setOrderNumber(order.order_number);
            }
          }
        }
      } catch (err) {
        console.error('Order creation error:', err);
      }
    }

    setIsPlacing(false);
    setOrderPlaced(true);
    setTimeout(() => {
      clearCart();
    }, 5000);
  };

  const handleClearCart = () => {
    clearCart();
    setShowClearConfirm(false);
  };

  // -----------------------------------------------------------------------
  // Empty cart state
  // -----------------------------------------------------------------------
  if (items.length === 0 && !orderPlaced) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-4 py-4"
      >
        {/* Header */}
        <motion.section variants={itemVariants} className="px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/farm/marketplace"
              className="shrink-0 w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 active:scale-95 transition-all"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-navy leading-tight">Shopping Cart</h1>
              <p className="text-xs text-gray-500 mt-0.5">0 items in your cart</p>
            </div>
          </div>
        </motion.section>

        {/* Empty state */}
        <motion.section variants={itemVariants} className="px-4 lg:px-6">
          <div className="rounded-2xl bg-white border border-gray-100 py-20 px-6 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mb-5">
              <ShoppingCart size={36} className="text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-navy mb-1">Your cart is empty</h3>
            <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
              Browse our marketplace to find agricultural supplies at exclusive member prices.
            </p>
            <Link
              href="/farm/marketplace"
              className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal text-white text-sm font-semibold hover:bg-teal-dark active:scale-[0.97] transition-all min-h-[44px]"
            >
              <Package size={16} />
              Browse Marketplace
            </Link>
          </div>
        </motion.section>
      </motion.div>
    );
  }

  // -----------------------------------------------------------------------
  // Order placed success state
  // -----------------------------------------------------------------------
  if (orderPlaced) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-4 py-4"
      >
        <motion.section variants={itemVariants} className="px-4 lg:px-6">
          <div className="rounded-2xl bg-gradient-to-br from-teal to-teal-dark py-20 px-6 flex flex-col items-center text-center relative overflow-hidden">
            {/* Decorative */}
            <div className="absolute -top-8 -right-8 w-28 h-28 bg-white/10 rounded-full" />
            <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-white/5 rounded-full" />

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
              className="relative z-10"
            >
              <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mb-5">
                <CheckCircle size={40} className="text-white" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="relative z-10"
            >
              <h2 className="text-xl font-bold text-white mb-2">Order Placed Successfully!</h2>
              {orderNumber && (
                <p className="text-xs font-mono bg-white/20 px-3 py-1 rounded-full mb-2">{orderNumber}</p>
              )}
              <p className="text-sm text-white/80 max-w-sm leading-relaxed">
                Your order has been submitted{orderNumber ? ` as ${orderNumber}` : ''}. You will receive a confirmation via SMS shortly.
                Thank you for shopping with AFU Marketplace!
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="relative z-10 mt-6"
            >
              <Link
                href="/farm/marketplace"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/20 text-white text-sm font-semibold hover:bg-white/30 active:scale-[0.97] transition-all min-h-[44px]"
              >
                Continue Shopping
              </Link>
            </motion.div>
          </div>
        </motion.section>
      </motion.div>
    );
  }

  // -----------------------------------------------------------------------
  // Cart with items
  // -----------------------------------------------------------------------
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
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/farm/marketplace"
              className="shrink-0 w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 active:scale-95 transition-all"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-navy leading-tight">Shopping Cart</h1>
              <p className="text-xs text-gray-500 mt-0.5">
                {itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart
              </p>
            </div>
          </div>

          <Link
            href="/farm/marketplace"
            className="text-xs font-semibold text-teal hover:text-teal-dark transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </motion.section>

      {/* ================================================================= */}
      {/* MAIN CONTENT: Cart Items + Order Summary                          */}
      {/* ================================================================= */}
      <div className="px-4 lg:px-6">
        <div className="lg:flex lg:gap-6 lg:items-start">
          {/* --------------------------------------------------------------- */}
          {/* CART ITEMS                                                       */}
          {/* --------------------------------------------------------------- */}
          <div className="flex-1 space-y-3 min-w-0">
            <AnimatePresence mode="popLayout">
              {items.map((item) => (
                <CartItemRow
                  key={item.product.id}
                  item={item}
                  onRemove={() => removeItem(item.product.id)}
                  onUpdateQuantity={(qty) => updateQuantity(item.product.id, qty)}
                />
              ))}
            </AnimatePresence>

            {/* Clear cart button */}
            <motion.div variants={itemVariants} className="pt-1">
              {showClearConfirm ? (
                <div className="flex items-center justify-center gap-3 py-2">
                  <span className="text-xs text-gray-500">Clear all items?</span>
                  <button
                    onClick={handleClearCart}
                    className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-semibold hover:bg-red-600 active:scale-95 transition-all"
                  >
                    Yes, Clear
                  </button>
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-xs font-semibold hover:bg-gray-200 active:scale-95 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="w-full text-center py-2 text-xs font-medium text-red-400 hover:text-red-500 transition-colors"
                >
                  Clear Cart
                </button>
              )}
            </motion.div>
          </div>

          {/* --------------------------------------------------------------- */}
          {/* ORDER SUMMARY                                                    */}
          {/* --------------------------------------------------------------- */}
          <motion.div
            variants={itemVariants}
            className="mt-4 lg:mt-0 lg:w-[360px] lg:shrink-0 lg:sticky lg:top-24"
          >
            <div className="rounded-2xl bg-white border border-gray-100 overflow-hidden shadow-sm">
              {/* Summary header */}
              <div className="px-4 py-3.5 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-sm font-bold text-navy">Order Summary</h2>
              </div>

              <div className="p-4 space-y-3">
                {/* Subtotal */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Subtotal (regular prices)</span>
                  <span className="text-sm text-gray-600">${subtotal.toFixed(2)}</span>
                </div>

                {/* Member discount */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-green-600 flex items-center gap-1">
                    <Tag size={12} />
                    Member Discount
                  </span>
                  <span className="text-sm font-semibold text-green-600">
                    -${savings.toFixed(2)}
                  </span>
                </div>

                {/* Delivery fee */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Truck size={12} />
                    Estimated Delivery
                  </span>
                  <span className="text-sm text-gray-600">
                    {deliveryFee === 0 ? (
                      <span className="text-green-600 font-semibold">FREE</span>
                    ) : (
                      `$${deliveryFee.toFixed(2)}`
                    )}
                  </span>
                </div>

                {deliveryFee > 0 && (
                  <p className="text-[10px] text-gray-400 -mt-1 pl-4">
                    Free delivery on orders over $200
                  </p>
                )}

                {/* Divider */}
                <div className="border-t border-gray-100 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-navy">Total</span>
                    <span className="text-lg font-bold text-navy">${orderTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Savings callout */}
                <div className="rounded-xl bg-green-50 border border-green-100 p-3 flex items-start gap-2">
                  <Sparkles size={14} className="text-green-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-green-700 leading-relaxed font-medium">
                    You save ${savings.toFixed(2)} with AFU membership!
                  </p>
                </div>

                {/* Payment method */}
                <div className="pt-1">
                  <p className="text-xs font-semibold text-navy mb-2 flex items-center gap-1.5">
                    <CreditCard size={13} />
                    Payment Method
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {paymentMethods.map((pm) => {
                      const isSelected = selectedPayment === pm.id;
                      return (
                        <button
                          key={pm.id}
                          onClick={() => setSelectedPayment(pm.id)}
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium border transition-all min-h-[40px] ${
                            isSelected
                              ? 'border-teal bg-teal/5 text-teal ring-1 ring-teal/20'
                              : `${pm.color} hover:opacity-80`
                          }`}
                        >
                          {pm.icon}
                          <span className="truncate">{pm.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Place Order button */}
                <button
                  onClick={handlePlaceOrder}
                  disabled={isPlacing}
                  className="w-full mt-2 h-12 rounded-xl bg-teal text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-teal-dark active:scale-[0.98] transition-all shadow-sm shadow-teal/20 min-h-[48px] disabled:opacity-60"
                >
                  {isPlacing ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={18} />
                      Place Order &middot; ${orderTotal.toFixed(2)}
                    </>
                  )}
                </button>

                {/* Security note */}
                <p className="text-[10px] text-gray-400 text-center leading-relaxed">
                  Your payment is secured and encrypted. Orders are processed within 24 hours.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
