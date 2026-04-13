'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/supabase/auth-context';
import {
  ShoppingCart,
  Download,
  Eye,
  ChevronDown,
  Package,
  Calendar,
  User,
  DollarSign,
  Truck,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Inbox,
  MapPin,
  CreditCard,
  AlertCircle,
} from 'lucide-react';

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

// ── Order interface ─────────────────────────────────────────────────────────

export interface SupplierOrder {
  id: string;
  productName: string;
  productId: string;
  buyerName: string;
  buyerType: 'smallholder' | 'commercial' | 'enterprise' | 'cooperative';
  quantity: number;
  amount: number;
  status: 'new' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  orderDate: string;
  deliveryDate: string | null;
  shippingAddress: string;
  paymentMethod: string;
}

// ── No fallback mock orders — real empty state shown when supplier has no orders.
// `supplierOrders` export retained as an empty array for the order detail page import.

export const supplierOrders: SupplierOrder[] = [];
const FALLBACK_ORDERS: SupplierOrder[] = [];


// ── Status config ───────────────────────────────────────────────────────────

type OrderStatus = SupplierOrder['status'];

const statusConfig: Record<OrderStatus, { label: string; color: string; icon: React.ReactNode }> = {
  new: {
    label: 'New',
    color: 'bg-blue-100 text-blue-700',
    icon: <AlertCircle className="w-3.5 h-3.5" />,
  },
  processing: {
    label: 'Processing',
    color: 'bg-amber-100 text-amber-700',
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  shipped: {
    label: 'Shipped',
    color: 'bg-purple-100 text-purple-700',
    icon: <Truck className="w-3.5 h-3.5" />,
  },
  delivered: {
    label: 'Delivered',
    color: 'bg-green-100 text-green-700',
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-red-100 text-red-700',
    icon: <XCircle className="w-3.5 h-3.5" />,
  },
};

// ── Buyer type badge config ─────────────────────────────────────────────────

const buyerTypeConfig: Record<string, { label: string; color: string }> = {
  smallholder: { label: 'Smallholder', color: 'bg-green-50 text-green-600' },
  commercial: { label: 'Commercial', color: 'bg-blue-50 text-blue-600' },
  enterprise: { label: 'Enterprise', color: 'bg-purple-50 text-purple-600' },
  cooperative: { label: 'Cooperative', color: 'bg-amber-50 text-amber-600' },
};

// ── Status update options ───────────────────────────────────────────────────

const statusTransitions: Record<OrderStatus, OrderStatus[]> = {
  new: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
};

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatCurrency(value: number): string {
  return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ═══════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function SupplierOrdersPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'all' | OrderStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [orders, setOrders] = useState<SupplierOrder[]>(FALLBACK_ORDERS);
  const [loading, setLoading] = useState(true);
  const [supplierId, setSupplierId] = useState<string | null>(null);

  // ── Fetch orders from Supabase ──────────────────────────────────────────
  useEffect(() => {
    async function fetchOrders() {
      try {
        const supabase = createClient();

        // 1. Find supplier record via profile_id = auth.uid()
        const { data: supplier } = await supabase
          .from('suppliers')
          .select('id')
          .eq('profile_id', user!.id)
          .maybeSingle();

        if (!supplier) {
          setLoading(false);
          return;
        }
        setSupplierId(supplier.id);

        // 2. Fetch order_items for this supplier, joining orders, products,
        //    and the buyer profile (orders -> members -> profiles)
        const { data: orderItems } = await supabase
          .from('order_items')
          .select(`
            id,
            order_id,
            product_id,
            quantity,
            unit_price,
            total_price,
            created_at,
            product:products ( name ),
            order:orders (
              id,
              order_number,
              status,
              shipping_address,
              currency,
              created_at,
              updated_at,
              member:members (
                tier,
                profile:profiles ( full_name )
              )
            )
          `)
          .eq('supplier_id', supplier.id)
          .order('created_at', { ascending: false });

        if (orderItems && orderItems.length > 0) {
          // Map DB rows -> SupplierOrder shape
          const mapped: SupplierOrder[] = orderItems.map((item: any) => {
            const order = item.order;
            const memberTier: string = order?.member?.tier || 'commercial';
            const buyerName: string = order?.member?.profile?.full_name || 'Customer';
            const addr = order?.shipping_address;

            // Map member tier -> buyerType
            const tierMap: Record<string, SupplierOrder['buyerType']> = {
              smallholder: 'smallholder',
              commercial_farmer: 'commercial',
              new_enterprise: 'enterprise',
              cooperative: 'cooperative',
            };

            // Map DB order status -> local OrderStatus
            const statusMap: Record<string, OrderStatus> = {
              pending: 'new',
              processing: 'processing',
              shipped: 'shipped',
              delivered: 'delivered',
              cancelled: 'cancelled',
            };

            return {
              id: order?.order_number || item.order_id,
              productName: (item.product as any)?.name || 'Product',
              productId: item.product_id,
              buyerName,
              buyerType: tierMap[memberTier] || 'commercial',
              quantity: item.quantity,
              amount: Number(item.total_price),
              status: statusMap[order?.status] || 'new',
              orderDate: order?.created_at?.split('T')[0] || '',
              deliveryDate: order?.status === 'delivered'
                ? (order?.updated_at?.split('T')[0] || null)
                : null,
              shippingAddress: addr
                ? (typeof addr === 'string' ? addr : Object.values(addr).filter(Boolean).join(', '))
                : '',
              paymentMethod: 'Bank Transfer',
              _orderId: order?.id, // internal: real order UUID for status updates
            } as SupplierOrder & { _orderId?: string };
          });
          setOrders(mapped);
        }
        // If orderItems is empty, keep FALLBACK_ORDERS
      } catch (err) {
        console.error('Failed to fetch supplier orders:', err);
        // Keep fallback demo data on error
      } finally {
        setLoading(false);
      }
    }
    if (user) fetchOrders();
    else setLoading(false);
  }, [user]);

  // ── Count by status ─────────────────────────────────────────────────────

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: orders.length };
    for (const order of orders) {
      counts[order.status] = (counts[order.status] || 0) + 1;
    }
    return counts;
  }, [orders]);

  // ── Filtered orders ─────────────────────────────────────────────────────

  const filteredOrders = useMemo(() => {
    let result = [...orders];

    // Status filter
    if (activeTab !== 'all') {
      result = result.filter((o) => o.status === activeTab);
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.productName.toLowerCase().includes(q) ||
          o.buyerName.toLowerCase().includes(q)
      );
    }

    // Sort by date (newest first)
    result.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());

    return result;
  }, [orders, activeTab, searchQuery]);

  // ── Handle status update (writes to Supabase, falls back to local) ─────

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    // Optimistic local update
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: newStatus,
              deliveryDate: newStatus === 'delivered' ? new Date().toISOString().split('T')[0] : o.deliveryDate,
            }
          : o
      )
    );
    setOpenDropdown(null);

    // Persist to Supabase
    try {
      const orderRecord = orders.find((o) => o.id === orderId) as any;
      const realOrderId = orderRecord?._orderId;
      if (!realOrderId) return; // fallback order, no DB row

      // Map local status back to DB enum
      const dbStatusMap: Record<OrderStatus, string> = {
        new: 'pending',
        processing: 'processing',
        shipped: 'shipped',
        delivered: 'delivered',
        cancelled: 'cancelled',
      };

      const supabase = createClient();
      const { error } = await supabase
        .from('orders')
        .update({ status: dbStatusMap[newStatus] })
        .eq('id', realOrderId);

      if (error) {
        console.error('Failed to update order status:', error);
        return;
      }

      // Auto-create commission when order is delivered
      if (newStatus === 'delivered' && supplierId) {
        try {
          // Fetch order items for this order + supplier
          const { data: orderItems } = await supabase
            .from('order_items')
            .select('id, total_price')
            .eq('order_id', realOrderId)
            .eq('supplier_id', supplierId);

          if (orderItems && orderItems.length > 0) {
            const commissionRate = 0.05; // 5% platform commission
            for (const item of orderItems) {
              const saleAmount = Number(item.total_price) || 0;
              const commissionAmount = Math.round(saleAmount * commissionRate * 100) / 100;

              await supabase.from('commissions').insert({
                supplier_id: supplierId,
                order_id: realOrderId,
                order_item_id: item.id,
                sale_amount: saleAmount,
                commission_rate: commissionRate,
                commission_amount: commissionAmount,
                status: 'pending',
              });
            }
          }
        } catch {
          // Commission creation is non-critical
        }
      }
    } catch (err) {
      console.error('Status update error:', err);
    }
  };

  // ── Export CSV (mock) ───────────────────────────────────────────────────

  const handleExportCSV = () => {
    const headers = ['Order ID', 'Product', 'Buyer', 'Buyer Type', 'Quantity', 'Amount', 'Status', 'Order Date', 'Delivery Date'];
    const rows = filteredOrders.map((o) => [
      o.id,
      o.productName,
      o.buyerName,
      o.buyerType,
      o.quantity.toString(),
      o.amount.toFixed(2),
      o.status,
      o.orderDate,
      o.deliveryDate || '',
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `supplier-orders-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Tab definitions ─────────────────────────────────────────────────────

  const tabs: { key: 'all' | OrderStatus; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'new', label: 'New' },
    { key: 'processing', label: 'Processing' },
    { key: 'shipped', label: 'Shipped' },
    { key: 'delivered', label: 'Delivered' },
  ];

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
          <div className="w-10 h-10 rounded-xl bg-[#8CB89C]/10 flex items-center justify-center">
            <ShoppingCart className="w-5 h-5 text-[#8CB89C]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-[#1B2A4A]">Orders</h1>
              <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#8CB89C]/10 text-[#8CB89C]">
                {orders.length}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">Manage and track customer orders</p>
          </div>
        </div>
        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-[#1B2A4A] border border-gray-200 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </motion.div>

      {/* ══════════════════════════════════════════════════════════════════
          2. SEARCH + STATUS TABS
      ═════════════════════════════════════════════════════════════════ */}
      <motion.div
        variants={cardVariants}
        className="bg-white rounded-xl border border-gray-100 p-4 space-y-4"
      >
        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by order ID, product, or buyer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#8CB89C]/30 focus:border-[#8CB89C] transition-colors bg-gray-50 placeholder-gray-400"
          />
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {tabs.map((tab) => {
            const count = statusCounts[tab.key] || 0;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-[#8CB89C] text-white shadow-sm'
                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-[#1B2A4A]'
                }`}
              >
                {tab.label}
                <span
                  className={`inline-flex items-center justify-center min-w-[20px] px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-gray-200/80 text-gray-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════════════════════════
          3. ORDERS LIST
      ═════════════════════════════════════════════════════════════════ */}
      <motion.div variants={containerVariants} className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredOrders.map((order, index) => {
            const status = statusConfig[order.status];
            const buyerType = buyerTypeConfig[order.buyerType];
            const transitions = statusTransitions[order.status];

            return (
              <motion.div
                key={order.id}
                variants={cardVariants}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ delay: index * 0.03 }}
                layout
                className="bg-white rounded-xl border border-gray-100 p-5 hover:border-gray-200 transition-colors"
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Order ID + Date + Product */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-[#1B2A4A] font-mono">{order.id}</span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {order.orderDate}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      <span className="text-sm font-medium text-[#1B2A4A] truncate">{order.productName}</span>
                      <span className="text-xs text-gray-400">x{order.quantity}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <User className="w-3 h-3" />
                        <span>{order.buyerName}</span>
                      </div>
                      <span
                        className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full ${
                          buyerType?.color || 'bg-gray-50 text-gray-500'
                        }`}
                      >
                        {buyerType?.label || order.buyerType}
                      </span>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="flex items-center lg:flex-col lg:items-end gap-3 lg:gap-1">
                    <span className="text-xl font-bold text-[#8CB89C] tabular-nums">
                      {formatCurrency(order.amount)}
                    </span>
                    {order.deliveryDate && (
                      <span className="text-[10px] text-gray-400 flex items-center gap-1">
                        <Truck className="w-3 h-3" />
                        {order.deliveryDate}
                      </span>
                    )}
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${status.color}`}
                    >
                      {status.icon}
                      {status.label}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/supplier/orders/${order.id}`}
                      className="inline-flex items-center gap-1.5 bg-[#8CB89C]/10 text-[#8CB89C] hover:bg-[#8CB89C]/20 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View Details
                    </Link>

                    {/* Update Status Dropdown */}
                    {transitions.length > 0 && (
                      <div className="relative">
                        <button
                          onClick={() =>
                            setOpenDropdown(openDropdown === order.id ? null : order.id)
                          }
                          className="inline-flex items-center gap-1.5 bg-[#1B2A4A]/5 text-[#1B2A4A] hover:bg-[#1B2A4A]/10 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors"
                        >
                          Update Status
                          <ChevronDown
                            className={`w-3.5 h-3.5 transition-transform ${
                              openDropdown === order.id ? 'rotate-180' : ''
                            }`}
                          />
                        </button>

                        <AnimatePresence>
                          {openDropdown === order.id && (
                            <motion.div
                              initial={{ opacity: 0, y: -5, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -5, scale: 0.95 }}
                              transition={{ duration: 0.15 }}
                              className="absolute right-0 top-full mt-1 z-20 bg-white rounded-lg shadow-lg border border-gray-100 py-1 min-w-[160px]"
                            >
                              {transitions.map((nextStatus) => {
                                const cfg = statusConfig[nextStatus];
                                return (
                                  <button
                                    key={nextStatus}
                                    onClick={() => handleStatusUpdate(order.id, nextStatus)}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                                  >
                                    <span
                                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${cfg.color}`}
                                    >
                                      {cfg.icon}
                                      {cfg.label}
                                    </span>
                                  </button>
                                );
                              })}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* ══════════════════════════════════════════════════════════════════
          4. EMPTY STATE
      ═════════════════════════════════════════════════════════════════ */}
      {filteredOrders.length === 0 && (
        <motion.div
          variants={fadeUp}
          className="bg-white rounded-xl border border-gray-100 p-12 text-center"
        >
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Inbox className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-[#1B2A4A] mb-2">No orders found</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
            {searchQuery
              ? 'Try adjusting your search query to find the orders you are looking for.'
              : activeTab !== 'all'
                ? `There are no ${activeTab} orders at this time.`
                : 'No orders yet — products will appear here when farmers buy from you.'}
          </p>
          {(searchQuery || activeTab !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveTab('all');
              }}
              className="inline-flex items-center gap-2 bg-[#8CB89C]/10 text-[#8CB89C] hover:bg-[#8CB89C]/20 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
            >
              Clear Filters
            </button>
          )}
        </motion.div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          5. SUMMARY STATS ROW
      ═════════════════════════════════════════════════════════════════ */}
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <motion.div
          variants={cardVariants}
          className="bg-white rounded-xl border border-gray-100 p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-xs text-gray-500">New Orders</span>
          </div>
          <p className="text-2xl font-bold text-[#1B2A4A] tabular-nums">{statusCounts.new || 0}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">Awaiting processing</p>
        </motion.div>

        <motion.div
          variants={cardVariants}
          className="bg-white rounded-xl border border-gray-100 p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <span className="text-xs text-gray-500">Processing</span>
          </div>
          <p className="text-2xl font-bold text-[#1B2A4A] tabular-nums">{statusCounts.processing || 0}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">Being prepared</p>
        </motion.div>

        <motion.div
          variants={cardVariants}
          className="bg-white rounded-xl border border-gray-100 p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
              <Truck className="w-4 h-4 text-purple-600" />
            </div>
            <span className="text-xs text-gray-500">In Transit</span>
          </div>
          <p className="text-2xl font-bold text-[#1B2A4A] tabular-nums">{statusCounts.shipped || 0}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">On the way</p>
        </motion.div>

        <motion.div
          variants={cardVariants}
          className="bg-white rounded-xl border border-gray-100 p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-[#8CB89C]/10 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-[#8CB89C]" />
            </div>
            <span className="text-xs text-gray-500">Total Revenue</span>
          </div>
          <p className="text-2xl font-bold text-[#8CB89C] tabular-nums">
            {formatCurrency(orders.filter((o) => o.status !== 'cancelled').reduce((sum, o) => sum + o.amount, 0))}
          </p>
          <p className="text-[10px] text-gray-400 mt-0.5">Excl. cancelled orders</p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
