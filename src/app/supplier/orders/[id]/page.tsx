'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/supabase/auth-context';
import {
  ArrowLeft,
  ChevronRight,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  User,
  MapPin,
  CreditCard,
  Phone,
  Mail,
  FileText,
  Download,
  MessageSquare,
  Printer,
  ShoppingCart,
  Calendar,
  Hash,
  Building2,
  CircleDot,
  CheckCheck,
  Send,
} from 'lucide-react';

// ── Import orders from orders page ──────────────────────────────────────────

import { supplierOrders, SupplierOrder } from '../page';

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

// ── Status config ───────────────────────────────────────────────────────────

type OrderStatus = SupplierOrder['status'];

const statusConfig: Record<OrderStatus, { label: string; color: string; bgColor: string; icon: React.ReactNode }> = {
  new: {
    label: 'New Order',
    color: 'bg-blue-100 text-blue-700',
    bgColor: 'bg-blue-50',
    icon: <AlertCircle className="w-4 h-4" />,
  },
  processing: {
    label: 'Processing',
    color: 'bg-amber-100 text-amber-700',
    bgColor: 'bg-amber-50',
    icon: <Clock className="w-4 h-4" />,
  },
  shipped: {
    label: 'Shipped',
    color: 'bg-purple-100 text-purple-700',
    bgColor: 'bg-purple-50',
    icon: <Truck className="w-4 h-4" />,
  },
  delivered: {
    label: 'Delivered',
    color: 'bg-green-100 text-green-700',
    bgColor: 'bg-green-50',
    icon: <CheckCircle2 className="w-4 h-4" />,
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-red-100 text-red-700',
    bgColor: 'bg-red-50',
    icon: <XCircle className="w-4 h-4" />,
  },
};

// ── Buyer type badge config ─────────────────────────────────────────────────

const buyerTypeConfig: Record<string, { label: string; color: string }> = {
  smallholder: { label: 'Smallholder', color: 'bg-green-50 text-green-600' },
  commercial: { label: 'Commercial', color: 'bg-blue-50 text-blue-600' },
  enterprise: { label: 'Enterprise', color: 'bg-purple-50 text-purple-600' },
  cooperative: { label: 'Cooperative', color: 'bg-amber-50 text-amber-600' },
};

// ── Timeline step definitions ───────────────────────────────────────────────

interface TimelineStep {
  key: string;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const timelineSteps: TimelineStep[] = [
  {
    key: 'new',
    label: 'Order Placed',
    description: 'Order has been received and confirmed',
    icon: <ShoppingCart className="w-4 h-4" />,
  },
  {
    key: 'processing',
    label: 'Processing',
    description: 'Order is being prepared for shipment',
    icon: <Clock className="w-4 h-4" />,
  },
  {
    key: 'shipped',
    label: 'Shipped',
    description: 'Order has been dispatched for delivery',
    icon: <Truck className="w-4 h-4" />,
  },
  {
    key: 'delivered',
    label: 'Delivered',
    description: 'Order has been delivered to the buyer',
    icon: <CheckCircle2 className="w-4 h-4" />,
  },
];

// ── Mock buyer data ─────────────────────────────────────────────────────────

const buyerDetails: Record<string, { email: string; phone: string }> = {
  'Kgosi Mosweu': { email: 'kgosi.mosweu@farmmail.bw', phone: '+267 7412 3456' },
  'Mashonaland Growers Co-op': { email: 'orders@mashgrowers.co.zw', phone: '+263 242 789 012' },
  'Tatenda Chikaura': { email: 'tatenda.c@gmail.com', phone: '+263 773 456 789' },
  'Central District Farmers Union': { email: 'procurement@cdfu.org.bw', phone: '+267 4631 2345' },
  'Mutare Orchards Co-op': { email: 'admin@mutareorchards.co.zw', phone: '+263 220 234 567' },
  'Sipho Dlamini': { email: 'sipho.dlamini@outlook.com', phone: '+263 712 345 678' },
  'Rudo Chidyamakono': { email: 'rudo.chidy@farmmail.zw', phone: '+263 778 901 234' },
  'Gaborone Agri Enterprise': { email: 'orders@gabenagri.co.bw', phone: '+267 3951 4567' },
  'Mosetse Farms': { email: 'info@mosetsefarms.bw', phone: '+267 7234 5678' },
  'Chimanimani Horticulture': { email: 'buying@chimhort.co.zw', phone: '+263 226 345 678' },
  'Nata Farmers Cooperative': { email: 'coop@natafarmers.org.bw', phone: '+267 6211 2345' },
  'Tongaat Farms Ltd': { email: 'procurement@tongaatfarms.co.zw', phone: '+263 231 456 789' },
  'Palapye Vegetable Growers': { email: 'admin@palapyeveg.co.bw', phone: '+267 4921 3456' },
  'Makoni District Extension': { email: 'makoni.ext@agritex.gov.zw', phone: '+263 225 678 901' },
  'Thabo Mokoena': { email: 'thabo.mokoena@gmail.com', phone: '+267 7345 6789' },
  'Maun Agricultural Co-op': { email: 'orders@maunagrco.org.bw', phone: '+267 6860 1234' },
  'Binga Smallholder Network': { email: 'network@bingafarmers.co.zw', phone: '+263 215 234 567' },
  'Mvuma Tobacco Growers': { email: 'mvuma.tobacco@farmmail.zw', phone: '+263 254 345 678' },
  'Kasane Border Farm': { email: 'kasanefarm@agrimail.bw', phone: '+267 6250 4567' },
  'Hwange Citrus Estate': { email: 'procurement@hwangecitrus.co.zw', phone: '+263 218 567 890' },
};

// ── Mock product images ─────────────────────────────────────────────────────

const productImages: Record<string, string> = {
  'SPROD-005': 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400&h=300&fit=crop',
  'SPROD-035': 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop',
  'SPROD-014': 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=300&fit=crop',
  'SPROD-036': 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=400&h=300&fit=crop',
  'SPROD-038': 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop',
};

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatCurrency(value: number): string {
  return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function getStepStatus(orderStatus: OrderStatus, stepKey: string): 'completed' | 'active' | 'upcoming' | 'cancelled' {
  if (orderStatus === 'cancelled') {
    return stepKey === 'new' ? 'completed' : 'cancelled';
  }

  const statusOrder = ['new', 'processing', 'shipped', 'delivered'];
  const currentIdx = statusOrder.indexOf(orderStatus);
  const stepIdx = statusOrder.indexOf(stepKey);

  if (stepIdx < currentIdx) return 'completed';
  if (stepIdx === currentIdx) return 'active';
  return 'upcoming';
}

function generateTrackingId(orderId: string): string {
  const hash = orderId.replace('ORD-', '');
  return `TRK-ZAS-2026${hash.padStart(4, '0')}`;
}

function generatePaymentRef(orderId: string): string {
  const hash = orderId.replace('ORD-', '');
  return `PAY-${hash.padStart(6, '0')}-ZAS`;
}

// ═══════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function SupplierOrderDetailPage() {
  const params = useParams();
  const { user } = useAuth();
  const orderId = params.id as string;
  const [dbOrder, setDbOrder] = useState<SupplierOrder | null>(null);
  const [_loading, setLoading] = useState(true);

  // ── Fetch single order from Supabase ─────────────────────────────────────
  useEffect(() => {
    async function fetchOrder() {
      try {
        const supabase = createClient();
        const { data: orderData } = await supabase
          .from('orders')
          .select('*, order_items(*, product:products(name))')
          .eq('order_number', orderId)
          .single();

        if (orderData) {
          const item = orderData.order_items?.[0];
          const mapped: SupplierOrder = {
            id: orderData.order_number,
            productName: item?.product?.name || 'Product',
            productId: item?.product_id || '',
            buyerName: orderData.shipping_address?.name || 'Customer',
            buyerType: 'commercial',
            quantity: item?.quantity || 1,
            amount: orderData.total,
            status: (orderData.status === 'pending' ? 'new' : orderData.status) || 'new',
            orderDate: orderData.created_at?.split('T')[0] || '',
            deliveryDate: orderData.updated_at?.split('T')[0] || null,
            shippingAddress: orderData.shipping_address
              ? Object.values(orderData.shipping_address).join(', ')
              : '',
            paymentMethod: 'Bank Transfer',
          };
          setDbOrder(mapped);
        }
      } catch (_err) {
        // Fall back to static data
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [orderId]);

  const order = dbOrder || supplierOrders.find((o) => o.id === orderId);

  const [currentStatus, setCurrentStatus] = useState<OrderStatus>(order?.status || 'new');

  // Update currentStatus when dbOrder loads
  useEffect(() => {
    if (dbOrder) setCurrentStatus(dbOrder.status);
  }, [dbOrder]);

  if (!order) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-lg font-semibold text-[#1B2A4A] mb-2">Order Not Found</h2>
          <p className="text-sm text-gray-500 mb-6">
            The order &quot;{orderId}&quot; could not be found.
          </p>
          <Link
            href="/supplier/orders"
            className="inline-flex items-center gap-2 bg-[#8CB89C] hover:bg-[#729E82] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const status = statusConfig[currentStatus];
  const buyerType = buyerTypeConfig[order.buyerType];
  const buyer = buyerDetails[order.buyerName] || { email: 'buyer@farmmail.com', phone: '+000 000 0000' };
  const productImage = productImages[order.productId] || 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400&h=300&fit=crop';
  const unitPrice = order.amount / order.quantity;
  const trackingId = generateTrackingId(order.id);
  const paymentRef = generatePaymentRef(order.id);

  // ── Context-based action buttons ────────────────────────────────────────

  const handleMarkShipped = () => setCurrentStatus('shipped');
  const handleMarkDelivered = () => setCurrentStatus('delivered');

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* ══════════════════════════════════════════════════════════════════
          1. BACK BUTTON + HEADING + STATUS BADGE
      ═════════════════════════════════════════════════════════════════ */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/supplier/orders"
            className="w-10 h-10 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[#1B2A4A]" />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-0.5">
              <Link href="/supplier/orders" className="hover:text-[#8CB89C] transition-colors">
                Orders
              </Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-gray-600">{order.id}</span>
            </div>
            <h1 className="text-2xl font-bold text-[#1B2A4A]">Order #{order.id}</h1>
          </div>
        </div>
        <span
          className={`inline-flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-full ${status.color}`}
        >
          {status.icon}
          {status.label}
        </span>
      </motion.div>

      {/* ══════════════════════════════════════════════════════════════════
          2. ORDER TIMELINE
      ═════════════════════════════════════════════════════════════════ */}
      <motion.div
        variants={cardVariants}
        className="bg-white rounded-xl border border-gray-100 p-6"
      >
        <h3 className="font-semibold text-[#1B2A4A] text-sm mb-6">Order Progress</h3>

        {/* Desktop Timeline (horizontal) */}
        <div className="hidden md:block">
          <div className="flex items-start justify-between relative">
            {/* Connecting Line */}
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 mx-[60px]" />
            <div
              className="absolute top-5 left-0 h-0.5 bg-[#8CB89C] mx-[60px] transition-all duration-700"
              style={{
                width: currentStatus === 'cancelled'
                  ? '0%'
                  : `${
                      ((['new', 'processing', 'shipped', 'delivered'].indexOf(currentStatus)) /
                        3) *
                      100
                    }%`,
                maxWidth: 'calc(100% - 120px)',
              }}
            />

            {timelineSteps.map((step, index) => {
              const stepStatus = getStepStatus(currentStatus, step.key);
              return (
                <motion.div
                  key={step.key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex flex-col items-center text-center relative z-10 flex-1"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all ${
                      stepStatus === 'completed'
                        ? 'bg-[#8CB89C] text-white'
                        : stepStatus === 'active'
                          ? 'bg-[#8CB89C] text-white ring-4 ring-[#8CB89C]/20'
                          : stepStatus === 'cancelled'
                            ? 'bg-gray-100 text-gray-300'
                            : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {stepStatus === 'completed' ? (
                      <CheckCheck className="w-4 h-4" />
                    ) : (
                      step.icon
                    )}
                  </div>
                  <p
                    className={`text-xs font-semibold mb-0.5 ${
                      stepStatus === 'completed' || stepStatus === 'active'
                        ? 'text-[#1B2A4A]'
                        : 'text-gray-400'
                    }`}
                  >
                    {step.label}
                  </p>
                  <p
                    className={`text-[10px] max-w-[120px] ${
                      stepStatus === 'completed' || stepStatus === 'active'
                        ? 'text-gray-500'
                        : 'text-gray-300'
                    }`}
                  >
                    {step.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Mobile Timeline (vertical) */}
        <div className="md:hidden space-y-0">
          {timelineSteps.map((step, index) => {
            const stepStatus = getStepStatus(currentStatus, step.key);
            const isLast = index === timelineSteps.length - 1;
            return (
              <motion.div
                key={step.key}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.08 }}
                className="flex gap-3"
              >
                {/* Vertical Line + Dot */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      stepStatus === 'completed'
                        ? 'bg-[#8CB89C] text-white'
                        : stepStatus === 'active'
                          ? 'bg-[#8CB89C] text-white ring-4 ring-[#8CB89C]/20'
                          : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {stepStatus === 'completed' ? (
                      <CheckCheck className="w-3.5 h-3.5" />
                    ) : (
                      step.icon
                    )}
                  </div>
                  {!isLast && (
                    <div
                      className={`w-0.5 flex-1 min-h-[24px] ${
                        stepStatus === 'completed' ? 'bg-[#8CB89C]' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
                {/* Text */}
                <div className={`pb-4 ${isLast ? '' : ''}`}>
                  <p
                    className={`text-sm font-semibold ${
                      stepStatus === 'completed' || stepStatus === 'active'
                        ? 'text-[#1B2A4A]'
                        : 'text-gray-400'
                    }`}
                  >
                    {step.label}
                  </p>
                  <p
                    className={`text-xs ${
                      stepStatus === 'completed' || stepStatus === 'active'
                        ? 'text-gray-500'
                        : 'text-gray-300'
                    }`}
                  >
                    {step.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Cancelled banner */}
        {currentStatus === 'cancelled' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 bg-red-50 border border-red-100 rounded-lg p-3 flex items-center gap-2 text-sm text-red-700"
          >
            <XCircle className="w-4 h-4 flex-shrink-0" />
            This order has been cancelled.
          </motion.div>
        )}
      </motion.div>

      {/* ══════════════════════════════════════════════════════════════════
          3. MAIN CONTENT — TWO COLUMNS
      ═════════════════════════════════════════════════════════════════ */}
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* ── Left Column ────────────────────────────────────────────── */}
        <div className="space-y-6">
          {/* Order Items Card */}
          <motion.div
            variants={cardVariants}
            className="bg-white rounded-xl border border-gray-100 overflow-hidden"
          >
            <div className="p-5 border-b border-gray-100">
              <h3 className="font-semibold text-[#1B2A4A] text-sm flex items-center gap-2">
                <Package className="w-4 h-4 text-[#8CB89C]" />
                Order Items
              </h3>
            </div>
            <div className="p-5">
              <div className="flex gap-4">
                {/* Product Image */}
                <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
                  <img
                    src={productImage}
                    alt={order.productName}
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/supplier/products/${order.productId}`}
                    className="text-sm font-medium text-[#1B2A4A] hover:text-[#8CB89C] transition-colors"
                  >
                    {order.productName}
                  </Link>
                  <p className="text-xs text-gray-400 mt-0.5">Product ID: {order.productId}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span>Qty: <strong className="text-[#1B2A4A]">{order.quantity}</strong></span>
                    <span>Unit: <strong className="text-[#1B2A4A]">{formatCurrency(unitPrice)}</strong></span>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Subtotal ({order.quantity} items)</span>
                  <span className="font-medium text-[#1B2A4A] tabular-nums">{formatCurrency(order.amount)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Shipping</span>
                  <span className="font-medium text-green-600">Free</span>
                </div>
                <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-100">
                  <span className="font-semibold text-[#1B2A4A]">Total</span>
                  <span className="text-lg font-bold text-[#8CB89C] tabular-nums">{formatCurrency(order.amount)}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Payment Info Card */}
          <motion.div
            variants={cardVariants}
            className="bg-white rounded-xl border border-gray-100 overflow-hidden"
          >
            <div className="p-5 border-b border-gray-100">
              <h3 className="font-semibold text-[#1B2A4A] text-sm flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#8CB89C]" />
                Payment Information
              </h3>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Payment Method</span>
                <span className="font-medium text-[#1B2A4A]">{order.paymentMethod}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Reference</span>
                <span className="font-mono text-xs text-[#1B2A4A] bg-gray-50 px-2 py-0.5 rounded">{paymentRef}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Payment Status</span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                  <CheckCircle2 className="w-3 h-3" />
                  Paid
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Amount</span>
                <span className="font-bold text-[#8CB89C] tabular-nums">{formatCurrency(order.amount)}</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── Right Column ───────────────────────────────────────────── */}
        <div className="space-y-6">
          {/* Buyer Info Card */}
          <motion.div
            variants={cardVariants}
            className="bg-white rounded-xl border border-gray-100 overflow-hidden"
          >
            <div className="p-5 border-b border-gray-100">
              <h3 className="font-semibold text-[#1B2A4A] text-sm flex items-center gap-2">
                <User className="w-4 h-4 text-[#8CB89C]" />
                Buyer Information
              </h3>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#1B2A4A]/10 flex items-center justify-center">
                  {order.buyerType === 'cooperative' || order.buyerType === 'enterprise' ? (
                    <Building2 className="w-5 h-5 text-[#1B2A4A]" />
                  ) : (
                    <User className="w-5 h-5 text-[#1B2A4A]" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#1B2A4A]">{order.buyerName}</p>
                  <span
                    className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full mt-0.5 ${
                      buyerType?.color || 'bg-gray-50 text-gray-500'
                    }`}
                  >
                    {buyerType?.label || order.buyerType}
                  </span>
                </div>
              </div>
              <div className="pt-2 space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  <span>{buyer.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  <span>{buyer.phone}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Delivery Info Card */}
          <motion.div
            variants={cardVariants}
            className="bg-white rounded-xl border border-gray-100 overflow-hidden"
          >
            <div className="p-5 border-b border-gray-100">
              <h3 className="font-semibold text-[#1B2A4A] text-sm flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#8CB89C]" />
                Delivery Information
              </h3>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                <span className="text-gray-600">{order.shippingAddress}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Delivery Method</span>
                <span className="font-medium text-[#1B2A4A]">Standard Courier</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Tracking ID</span>
                <span className="font-mono text-xs text-[#8CB89C] bg-[#8CB89C]/5 px-2 py-0.5 rounded">
                  {trackingId}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Order Date</span>
                <span className="font-medium text-[#1B2A4A] flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-gray-400" />
                  {order.orderDate}
                </span>
              </div>
              {order.deliveryDate && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    {currentStatus === 'delivered' ? 'Delivered On' : 'Expected Delivery'}
                  </span>
                  <span className="font-medium text-[#1B2A4A] flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-gray-400" />
                    {order.deliveryDate}
                  </span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Invoice Card */}
          <motion.div
            variants={cardVariants}
            className="bg-white rounded-xl border border-gray-100 overflow-hidden"
          >
            <div className="p-5 border-b border-gray-100">
              <h3 className="font-semibold text-[#1B2A4A] text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#8CB89C]" />
                Invoice
              </h3>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Invoice Number</span>
                <span className="font-mono text-xs text-[#1B2A4A]">INV-ZAS-{order.id.replace('ORD-', '')}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Issue Date</span>
                <span className="font-medium text-[#1B2A4A]">{order.orderDate}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Total Amount</span>
                <span className="font-bold text-[#8CB89C] tabular-nums">{formatCurrency(order.amount)}</span>
              </div>
              <button className="w-full inline-flex items-center justify-center gap-2 bg-[#8CB89C]/10 text-[#8CB89C] hover:bg-[#8CB89C]/20 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors mt-2">
                <Download className="w-4 h-4" />
                Download PDF
              </button>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════════════════════════
          4. ACTION BUTTONS
      ═════════════════════════════════════════════════════════════════ */}
      <motion.div
        variants={cardVariants}
        className="bg-white rounded-xl border border-gray-100 p-5"
      >
        <div className="flex flex-wrap items-center gap-3">
          {/* Contextual Status Actions */}
          {(currentStatus === 'new' || currentStatus === 'processing') && (
            <button
              onClick={handleMarkShipped}
              className="inline-flex items-center gap-2 bg-[#8CB89C] hover:bg-[#729E82] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm"
            >
              <Send className="w-4 h-4" />
              Mark as Shipped
            </button>
          )}
          {currentStatus === 'shipped' && (
            <button
              onClick={handleMarkDelivered}
              className="inline-flex items-center gap-2 bg-[#8CB89C] hover:bg-[#729E82] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              Mark as Delivered
            </button>
          )}
          {currentStatus === 'delivered' && (
            <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-5 py-2.5 rounded-xl text-sm font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              Order Complete
            </div>
          )}

          {/* Contact Buyer */}
          <button className="inline-flex items-center gap-2 bg-[#1B2A4A]/5 hover:bg-[#1B2A4A]/10 text-[#1B2A4A] px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors">
            <MessageSquare className="w-4 h-4" />
            Contact Buyer
          </button>

          {/* Print Invoice */}
          <button className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-[#1B2A4A] border border-gray-200 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors">
            <Printer className="w-4 h-4" />
            Print Invoice
          </button>
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════════════════════════
          5. ORDER METADATA FOOTER
      ═════════════════════════════════════════════════════════════════ */}
      <motion.div
        variants={fadeUp}
        className="flex flex-wrap items-center justify-between gap-4 text-xs text-gray-400 px-1"
      >
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Hash className="w-3 h-3" />
            {order.id}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Placed {order.orderDate}
          </span>
          <span className="flex items-center gap-1">
            <CircleDot className="w-3 h-3" />
            {trackingId}
          </span>
        </div>
        <span>Zambezi Agri-Supplies (SUP-001)</span>
      </motion.div>
    </motion.div>
  );
}
