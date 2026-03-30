'use client';

import { useState, useMemo, useEffect, Fragment } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  LayoutGrid,
  List,
  ChevronDown,
  ChevronUp,
  Eye,
  CheckCircle2,
  Ban,
  Pencil,
  Star,
  StarHalf,
  Store,
  Clock,
  XCircle,
  ShieldCheck,
  ShieldAlert,
  Award,
  MapPin,
  Package,
  ArrowUpDown,
  AlertTriangle,
  DollarSign,
  FileText,
  Percent,
  Save,
  Loader2,
  ChevronRight,
  ShoppingCart,
  BarChart3,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useSuppliers, type SupplierRow } from '@/lib/supabase/use-suppliers';
import type { SupplierCategory, SponsorshipTier } from '@/lib/supabase/types';

// ── Animation variants ────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 260, damping: 24 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

const expandVariants = {
  hidden: { height: 0, opacity: 0 },
  visible: { height: 'auto', opacity: 1, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
  exit: { height: 0, opacity: 0, transition: { duration: 0.2 } },
};

// ── Helpers ───────────────────────────────────────────────────────────────

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toLocaleString()}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const categoryLabels: Record<SupplierCategory, string> = {
  'input-supplier': 'Input Supplier',
  equipment: 'Equipment',
  logistics: 'Logistics',
  processing: 'Processing',
  technology: 'Technology',
  'financial-services': 'Financial Services',
};

const categoryColors: Record<SupplierCategory, string> = {
  'input-supplier': 'bg-green-100 text-green-700',
  equipment: 'bg-blue-100 text-blue-700',
  logistics: 'bg-purple-100 text-purple-700',
  processing: 'bg-orange-100 text-orange-700',
  technology: 'bg-cyan-100 text-cyan-700',
  'financial-services': 'bg-amber-100 text-amber-700',
};

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  pending: 'bg-amber-100 text-amber-700',
  suspended: 'bg-red-100 text-red-700',
  rejected: 'bg-gray-100 text-gray-600',
};

const statusIcons: Record<string, React.ReactNode> = {
  active: <CheckCircle2 className="w-3 h-3" />,
  pending: <Clock className="w-3 h-3" />,
  suspended: <XCircle className="w-3 h-3" />,
  rejected: <Ban className="w-3 h-3" />,
};

const tierColors: Record<SponsorshipTier, string> = {
  platinum: 'bg-gray-100 text-gray-800 border border-gray-300',
  gold: 'bg-yellow-50 text-yellow-700 border border-yellow-300',
  silver: 'bg-gray-50 text-gray-600 border border-gray-200',
  bronze: 'bg-orange-50 text-orange-700 border border-orange-200',
};

type SortField = 'companyName' | 'category' | 'country' | 'status' | 'productsCount' | 'totalSales' | 'rating' | 'sponsorshipTier';
type SortDir = 'asc' | 'desc';

function RatingStars({ rating }: { rating: number }) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.3 && rating - fullStars < 0.8;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: fullStars }).map((_, i) => (
        <Star key={`f${i}`} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
      ))}
      {hasHalf && <StarHalf className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />}
      {Array.from({ length: emptyStars }).map((_, i) => (
        <Star key={`e${i}`} className="w-3.5 h-3.5 text-gray-200" />
      ))}
      <span className="ml-1 text-xs text-gray-500">{rating.toFixed(1)}</span>
    </div>
  );
}

// ── Verification Badge ───────────────────────────────────────────────────

function VerificationBadge({ verified }: { verified: boolean }) {
  if (verified) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-[#5DB347]/10 text-[#5DB347]">
        <ShieldCheck className="w-3.5 h-3.5" />
        Verified
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-orange-100 text-orange-600">
      <ShieldAlert className="w-3.5 h-3.5" />
      Pending
    </span>
  );
}

// ── Confirmation Dialog ──────────────────────────────────────────────────

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  confirmColor: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmDialog({ open, title, message, confirmLabel, confirmColor, onConfirm, onCancel }: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4"
      >
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#1B2A4A]">{title}</h3>
            <p className="text-sm text-gray-500 mt-1">{message}</p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${confirmColor}`}
          >
            {confirmLabel}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Supplier Detail Panel Types ──────────────────────────────────────────

interface ProductRow {
  id: string;
  name: string;
  price: number;
  stock_quantity: number;
  status: string;
}

interface OrderRow {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
}

interface SupplierDetail {
  products: ProductRow[];
  productsCount: number;
  recentOrders: OrderRow[];
  totalRevenue: number;
}

// ── Expandable Detail Panel ──────────────────────────────────────────────

function SupplierDetailPanel({ supplier, onCommissionUpdate }: { supplier: SupplierRow; onCommissionUpdate: (id: string, rate: number) => Promise<void> }) {
  const [detail, setDetail] = useState<SupplierDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(true);
  const [commissionRate, setCommissionRate] = useState(supplier.commission_rate);
  const [commissionSaving, setCommissionSaving] = useState(false);
  const [commissionSaved, setCommissionSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchDetail = async () => {
      setDetailLoading(true);
      const supabase = createClient();

      // Fetch products count + top 5
      const [productsRes, ordersRes, revenueRes] = await Promise.all([
        supabase
          .from('products')
          .select('id, name, price, stock_quantity, status')
          .eq('supplier_id', supplier.id)
          .order('sold_count', { ascending: false })
          .limit(5),
        supabase
          .from('orders')
          .select('id, total_amount, status, created_at')
          .eq('supplier_id', supplier.id)
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('orders')
          .select('total_amount')
          .eq('supplier_id', supplier.id),
      ]);

      if (!cancelled) {
        const products = (productsRes.data || []) as ProductRow[];
        const orders = (ordersRes.data || []) as OrderRow[];
        const totalRevenue = (revenueRes.data || []).reduce(
          (sum: number, o: { total_amount: number }) => sum + (o.total_amount || 0),
          0
        );

        setDetail({
          products,
          productsCount: supplier.products_count,
          recentOrders: orders,
          totalRevenue,
        });
        setDetailLoading(false);
      }
    };

    fetchDetail();
    return () => { cancelled = true; };
  }, [supplier.id, supplier.products_count]);

  const handleSaveCommission = async () => {
    setCommissionSaving(true);
    await onCommissionUpdate(supplier.id, commissionRate);
    setCommissionSaving(false);
    setCommissionSaved(true);
    setTimeout(() => setCommissionSaved(false), 2000);
  };

  const orderStatusColor: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    confirmed: 'bg-blue-100 text-blue-700',
    processing: 'bg-indigo-100 text-indigo-700',
    shipped: 'bg-purple-100 text-purple-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
    refunded: 'bg-gray-100 text-gray-600',
  };

  if (detailLoading) {
    return (
      <div className="px-6 py-8 flex items-center justify-center">
        <Loader2 className="w-5 h-5 text-[#5DB347] animate-spin" />
        <span className="ml-2 text-sm text-gray-500">Loading supplier details...</span>
      </div>
    );
  }

  if (!detail) return null;

  return (
    <div className="px-6 py-5 bg-gray-50/70 border-t border-gray-100">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* -- Left Column: Overview + Commission ---- */}
        <div className="space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-lg p-3 border border-gray-100">
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                <Package className="w-3.5 h-3.5" />
                Products
              </div>
              <p className="text-lg font-bold text-[#1B2A4A]">{detail.productsCount}</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-gray-100">
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                <DollarSign className="w-3.5 h-3.5" />
                Revenue
              </div>
              <p className="text-lg font-bold text-[#1B2A4A]">{formatCurrency(detail.totalRevenue)}</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-gray-100">
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                <ShoppingCart className="w-3.5 h-3.5" />
                Orders
              </div>
              <p className="text-lg font-bold text-[#1B2A4A]">{supplier.total_orders}</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-gray-100">
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                <BarChart3 className="w-3.5 h-3.5" />
                Avg Order
              </div>
              <p className="text-lg font-bold text-[#1B2A4A]">
                {supplier.total_orders > 0 ? formatCurrency(detail.totalRevenue / supplier.total_orders) : '$0'}
              </p>
            </div>
          </div>

          {/* Verification Status */}
          <div className="bg-white rounded-lg p-4 border border-gray-100">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Verification & Documents</h4>
            <div className="flex items-center gap-2 mb-3">
              <VerificationBadge verified={supplier.verified} />
            </div>
            {supplier.certifications && supplier.certifications.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {supplier.certifications.map((cert, i) => (
                  <span key={i} className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                    <FileText className="w-3 h-3" />
                    {cert}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400">No certifications uploaded</p>
            )}
          </div>

          {/* Commission Rate Editor */}
          <div className="bg-white rounded-lg p-4 border border-gray-100">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Commission Rate</h4>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={0.5}
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(parseFloat(e.target.value) || 0)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/50 focus:border-[#5DB347]"
                />
              </div>
              <button
                onClick={handleSaveCommission}
                disabled={commissionSaving || commissionRate === supplier.commission_rate}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#5DB347] hover:bg-[#4da03c] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {commissionSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : commissionSaved ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {commissionSaved ? 'Saved' : 'Save'}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1.5">Platform commission on each sale from this supplier</p>
          </div>
        </div>

        {/* -- Middle Column: Top Products ---- */}
        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Top Products ({detail.productsCount} total)
          </h4>
          {detail.products.length > 0 ? (
            <div className="space-y-2.5">
              {detail.products.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[#1B2A4A] truncate">{product.name}</p>
                    <p className="text-xs text-gray-400">Stock: {product.stock_quantity}</p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <p className="text-sm font-semibold text-[#1B2A4A]">${product.price.toFixed(2)}</p>
                    <span className={`inline-block text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                      product.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {product.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center">
              <Package className="w-8 h-8 text-gray-200 mx-auto mb-2" />
              <p className="text-xs text-gray-400">No products listed yet</p>
            </div>
          )}
        </div>

        {/* -- Right Column: Recent Orders ---- */}
        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Recent Orders
          </h4>
          {detail.recentOrders.length > 0 ? (
            <div className="space-y-2.5">
              {detail.recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="min-w-0">
                    <p className="text-xs text-gray-400 font-mono">{order.id.slice(0, 8)}...</p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(order.created_at)}</p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <p className="text-sm font-semibold text-[#1B2A4A]">${order.total_amount.toFixed(2)}</p>
                    <span className={`inline-block text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                      orderStatusColor[order.status] || 'bg-gray-100 text-gray-500'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center">
              <ShoppingCart className="w-8 h-8 text-gray-200 mx-auto mb-2" />
              <p className="text-xs text-gray-400">No orders yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function AdminSuppliersPage() {
  const { suppliers, loading, stats, approveSupplier, suspendSupplier, activateSupplier, rejectSupplier, updateSupplier } = useSuppliers();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [countryFilter, setCountryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [sortField, setSortField] = useState<SortField>('companyName');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // ── Confirmation Dialog State ──────────────────────────────────────────
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    confirmColor: string;
    action: () => Promise<void>;
  }>({ open: false, title: '', message: '', confirmLabel: '', confirmColor: '', action: async () => {} });

  // ── Action handlers ───────────────────────────────────────────────────
  const handleApprove = async (id: string, companyName: string) => {
    setActionLoading(id);
    await approveSupplier(id);
    setActionLoading(null);
  };

  const handleSuspend = (id: string, companyName: string) => {
    setConfirmDialog({
      open: true,
      title: 'Suspend Supplier',
      message: `Are you sure you want to suspend "${companyName}"? Their products will be hidden from the marketplace and they will not be able to accept new orders.`,
      confirmLabel: 'Suspend Supplier',
      confirmColor: 'bg-red-600 hover:bg-red-700',
      action: async () => {
        setActionLoading(id);
        await suspendSupplier(id);
        setActionLoading(null);
        setConfirmDialog((prev) => ({ ...prev, open: false }));
      },
    });
  };

  const handleReject = (id: string, companyName: string) => {
    setConfirmDialog({
      open: true,
      title: 'Reject Supplier',
      message: `Are you sure you want to reject "${companyName}"? This supplier application will be permanently declined. This action cannot be easily undone.`,
      confirmLabel: 'Reject Supplier',
      confirmColor: 'bg-red-600 hover:bg-red-700',
      action: async () => {
        setActionLoading(id);
        await rejectSupplier(id);
        setActionLoading(null);
        setConfirmDialog((prev) => ({ ...prev, open: false }));
      },
    });
  };

  const handleActivate = async (id: string) => {
    setActionLoading(id);
    await activateSupplier(id);
    setActionLoading(null);
  };

  const handleCommissionUpdate = async (id: string, rate: number) => {
    await updateSupplier(id, { commission_rate: rate });
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  // ── Filtering ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let result = [...suppliers];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.company_name.toLowerCase().includes(q) ||
          s.contact_name.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q)
      );
    }
    if (categoryFilter !== 'all') result = result.filter((s) => s.category === categoryFilter);
    if (countryFilter !== 'all') result = result.filter((s) => s.country === countryFilter);
    if (statusFilter !== 'all') result = result.filter((s) => s.status === statusFilter);
    if (tierFilter !== 'all') {
      if (tierFilter === 'none') {
        result = result.filter((s) => s.sponsorship_tier === null);
      } else {
        result = result.filter((s) => s.sponsorship_tier === tierFilter);
      }
    }

    // Sorting
    const tierOrder: Record<string, number> = { platinum: 4, gold: 3, silver: 2, bronze: 1 };
    result.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'companyName':
          cmp = a.company_name.localeCompare(b.company_name);
          break;
        case 'category':
          cmp = a.category.localeCompare(b.category);
          break;
        case 'country':
          cmp = a.country.localeCompare(b.country);
          break;
        case 'status':
          cmp = a.status.localeCompare(b.status);
          break;
        case 'productsCount':
          cmp = a.products_count - b.products_count;
          break;
        case 'totalSales':
          cmp = a.total_sales - b.total_sales;
          break;
        case 'rating':
          cmp = a.rating - b.rating;
          break;
        case 'sponsorshipTier':
          cmp = (tierOrder[a.sponsorship_tier || ''] || 0) - (tierOrder[b.sponsorship_tier || ''] || 0);
          break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [suppliers, searchQuery, categoryFilter, countryFilter, statusFilter, tierFilter, sortField, sortDir]);

  // ── Summary stats ─────────────────────────────────────────────────────
  const totalSuppliers = stats.total;
  const activeCount = stats.active;
  const pendingCount = stats.pending;
  const suspendedCount = stats.suspended;

  const summaryCards = [
    { label: 'Total Suppliers', value: totalSuppliers, icon: <Store className="w-5 h-5" />, color: 'text-[#5DB347]', bgColor: 'bg-[#5DB347]/10' },
    { label: 'Active', value: activeCount, icon: <CheckCircle2 className="w-5 h-5" />, color: 'text-green-600', bgColor: 'bg-green-50' },
    { label: 'Pending Approval', value: pendingCount, icon: <Clock className="w-5 h-5" />, color: 'text-amber-600', bgColor: 'bg-amber-50' },
    { label: 'Suspended', value: suspendedCount, icon: <Ban className="w-5 h-5" />, color: 'text-red-600', bgColor: 'bg-red-50' },
  ];

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  }

  const sortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 text-gray-300" />;
    return sortDir === 'asc' ? (
      <ChevronUp className="w-3 h-3 text-[#5DB347]" />
    ) : (
      <ChevronDown className="w-3 h-3 text-[#5DB347]" />
    );
  };

  // ── Action Buttons per supplier ────────────────────────────────────────
  const renderActionButtons = (supplier: SupplierRow) => (
    <div className="flex items-center justify-end gap-1">
      {/* Expand toggle */}
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleExpand(supplier.id); }}
        className={`p-2 rounded-lg hover:bg-gray-100 transition-colors ${
          expandedId === supplier.id ? 'bg-[#5DB347]/10 text-[#5DB347]' : 'text-gray-400 hover:text-[#1B2A4A]'
        }`}
        title="Expand Details"
      >
        <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${expandedId === supplier.id ? 'rotate-90' : ''}`} />
      </button>

      {/* View */}
      <Link
        href={`/admin/suppliers/${supplier.id}`}
        className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#1B2A4A] transition-colors"
        title="View Details"
      >
        <Eye className="w-4 h-4" />
      </Link>

      {/* Approve (pending only) */}
      {supplier.status === 'pending' && (
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleApprove(supplier.id, supplier.company_name); }}
          disabled={actionLoading === supplier.id}
          className="p-2 rounded-lg hover:bg-green-50 text-[#5DB347] hover:text-green-700 transition-colors disabled:opacity-50"
          title="Approve"
        >
          {actionLoading === supplier.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
        </button>
      )}

      {/* Reject (pending only) */}
      {supplier.status === 'pending' && (
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleReject(supplier.id, supplier.company_name); }}
          disabled={actionLoading === supplier.id}
          className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
          title="Reject"
        >
          <XCircle className="w-4 h-4" />
        </button>
      )}

      {/* Suspend (active only) */}
      {supplier.status === 'active' && (
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleSuspend(supplier.id, supplier.company_name); }}
          disabled={actionLoading === supplier.id}
          className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
          title="Suspend"
        >
          {actionLoading === supplier.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ban className="w-4 h-4" />}
        </button>
      )}

      {/* Activate (suspended or rejected) */}
      {(supplier.status === 'suspended' || supplier.status === 'rejected') && (
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleActivate(supplier.id); }}
          disabled={actionLoading === supplier.id}
          className="p-2 rounded-lg hover:bg-green-50 text-gray-400 hover:text-green-600 transition-colors disabled:opacity-50"
          title="Activate"
        >
          {actionLoading === supplier.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
        </button>
      )}

      {/* Edit */}
      <button
        className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#1B2A4A] transition-colors"
        title="Edit"
      >
        <Pencil className="w-4 h-4" />
      </button>
    </div>
  );

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* ── Confirmation Dialog ──────────────────────────────────────────── */}
      <AnimatePresence>
        {confirmDialog.open && (
          <ConfirmDialog
            open={confirmDialog.open}
            title={confirmDialog.title}
            message={confirmDialog.message}
            confirmLabel={confirmDialog.confirmLabel}
            confirmColor={confirmDialog.confirmColor}
            onConfirm={confirmDialog.action}
            onCancel={() => setConfirmDialog((prev) => ({ ...prev, open: false }))}
          />
        )}
      </AnimatePresence>

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">Supplier Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage all marketplace suppliers and their listings</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/suppliers/new"
            className="inline-flex items-center gap-2 bg-[#5DB347] hover:bg-[#4da03c] text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
          >
            <Package className="w-4 h-4" />
            Add Supplier
          </Link>
          <Link
            href="/admin/suppliers/sponsorships"
            className="inline-flex items-center gap-2 bg-[#1B2A4A] hover:bg-[#1B2A4A]/90 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
          >
            <Award className="w-4 h-4" />
            Sponsorship Tiers
          </Link>
        </div>
      </motion.div>

      {/* ── Loading State ────────────────────────────────────────────────── */}
      {loading && (
        <motion.div variants={fadeUp} className="text-center py-8">
          <div className="inline-flex items-center gap-2 text-sm text-gray-500">
            <Loader2 className="w-4 h-4 text-[#5DB347] animate-spin" />
            Loading suppliers from database...
          </div>
        </motion.div>
      )}

      {/* ── Summary Row ──────────────────────────────────────────────────── */}
      <motion.div variants={containerVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {summaryCards.map((card, i) => (
          <motion.div
            key={i}
            variants={cardVariants}
            whileHover={{ y: -2, boxShadow: '0 8px 25px rgba(27,42,74,0.08)' }}
            className="bg-white rounded-xl p-4 border border-gray-100"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${card.bgColor} flex items-center justify-center ${card.color}`}>
                {card.icon}
              </div>
              <div>
                <p className="text-2xl font-bold text-[#1B2A4A]">{card.value}</p>
                <p className="text-xs text-gray-500">{card.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Filter Bar ───────────────────────────────────────────────────── */}
      <motion.div variants={fadeUp} className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by company name, contact, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/50 focus:border-[#5DB347]"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Filter className="w-3.5 h-3.5" />
              Filters:
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/50 bg-white"
            >
              <option value="all">All Categories</option>
              <option value="input-supplier">Input Supplier</option>
              <option value="equipment">Equipment</option>
              <option value="logistics">Logistics</option>
              <option value="processing">Processing</option>
              <option value="technology">Technology</option>
              <option value="financial-services">Financial Services</option>
            </select>

            <select
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/50 bg-white"
            >
              <option value="all">All Countries</option>
              <option value="Botswana">Botswana</option>
              <option value="Kenya">Kenya</option>
              <option value="Mozambique">Mozambique</option>
              <option value="Nigeria">Nigeria</option>
              <option value="Sierra Leone">Sierra Leone</option>
              <option value="South Africa">South Africa</option>
              <option value="Tanzania">Tanzania</option>
              <option value="Uganda">Uganda</option>
              <option value="Zambia">Zambia</option>
              <option value="Zimbabwe">Zimbabwe</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/50 bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
              <option value="rejected">Rejected</option>
            </select>

            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/50 bg-white"
            >
              <option value="all">All Tiers</option>
              <option value="platinum">Platinum</option>
              <option value="gold">Gold</option>
              <option value="silver">Silver</option>
              <option value="bronze">Bronze</option>
              <option value="none">No Tier</option>
            </select>

            {/* View toggle */}
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden ml-auto">
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 transition-colors ${viewMode === 'table' ? 'bg-[#1B2A4A] text-white' : 'bg-white text-gray-400 hover:text-gray-600'}`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-[#1B2A4A] text-white' : 'bg-white text-gray-400 hover:text-gray-600'}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <p className="text-xs text-gray-400">
            Showing {filtered.length} of {totalSuppliers} suppliers
          </p>
          {(searchQuery || categoryFilter !== 'all' || countryFilter !== 'all' || statusFilter !== 'all' || tierFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('all');
                setCountryFilter('all');
                setStatusFilter('all');
                setTierFilter('all');
              }}
              className="text-xs text-[#5DB347] hover:text-[#4da03c] font-medium transition-colors"
            >
              Clear all filters
            </button>
          )}
        </div>
      </motion.div>

      {/* ── Table View ───────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {viewMode === 'table' ? (
          <motion.div
            key="table"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="bg-white rounded-xl border border-gray-100 overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th
                      className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-[#1B2A4A] transition-colors"
                      onClick={() => toggleSort('companyName')}
                    >
                      <div className="flex items-center gap-1">
                        Company {sortIcon('companyName')}
                      </div>
                    </th>
                    <th
                      className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-[#1B2A4A] transition-colors"
                      onClick={() => toggleSort('category')}
                    >
                      <div className="flex items-center gap-1">
                        Category {sortIcon('category')}
                      </div>
                    </th>
                    <th
                      className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-[#1B2A4A] transition-colors"
                      onClick={() => toggleSort('country')}
                    >
                      <div className="flex items-center gap-1">
                        Country {sortIcon('country')}
                      </div>
                    </th>
                    <th
                      className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-[#1B2A4A] transition-colors"
                      onClick={() => toggleSort('status')}
                    >
                      <div className="flex items-center gap-1">
                        Status {sortIcon('status')}
                      </div>
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Verified
                    </th>
                    <th
                      className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-[#1B2A4A] transition-colors"
                      onClick={() => toggleSort('productsCount')}
                    >
                      <div className="flex items-center justify-end gap-1">
                        Products {sortIcon('productsCount')}
                      </div>
                    </th>
                    <th
                      className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-[#1B2A4A] transition-colors"
                      onClick={() => toggleSort('totalSales')}
                    >
                      <div className="flex items-center justify-end gap-1">
                        Total Sales {sortIcon('totalSales')}
                      </div>
                    </th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Commission
                    </th>
                    <th
                      className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-[#1B2A4A] transition-colors"
                      onClick={() => toggleSort('rating')}
                    >
                      <div className="flex items-center gap-1">
                        Rating {sortIcon('rating')}
                      </div>
                    </th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((supplier) => (
                    <Fragment key={supplier.id}>
                      <motion.tr
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`hover:bg-gray-50/50 transition-colors group cursor-pointer ${
                          expandedId === supplier.id ? 'bg-[#5DB347]/5' : ''
                        }`}
                        onClick={() => toggleExpand(supplier.id)}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                              <img
                                src={supplier.logo_url || '/placeholder-logo.png'}
                                alt={supplier.company_name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-[#1B2A4A] text-sm truncate group-hover:text-[#5DB347] transition-colors">
                                {supplier.company_name}
                              </p>
                              <p className="text-xs text-gray-400 truncate">{supplier.contact_name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${categoryColors[supplier.category]}`}>
                            {categoryLabels[supplier.category]}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5 text-sm text-gray-600">
                            <MapPin className="w-3 h-3 text-gray-400" />
                            {supplier.country}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[supplier.status]}`}>
                            {statusIcons[supplier.status]}
                            {supplier.status.charAt(0).toUpperCase() + supplier.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <VerificationBadge verified={supplier.verified} />
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="text-sm font-medium text-[#1B2A4A] tabular-nums">{supplier.products_count}</span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="text-sm font-medium text-[#1B2A4A] tabular-nums">{formatCurrency(supplier.total_sales)}</span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="text-sm font-medium text-[#1B2A4A] tabular-nums">{supplier.commission_rate}%</span>
                        </td>
                        <td className="py-3 px-4">
                          <RatingStars rating={supplier.rating} />
                        </td>
                        <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                          {renderActionButtons(supplier)}
                        </td>
                      </motion.tr>

                      {/* Expandable Detail Panel */}
                      <AnimatePresence>
                        {expandedId === supplier.id && (
                          <tr>
                            <td colSpan={10}>
                              <motion.div
                                variants={expandVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="overflow-hidden"
                              >
                                <SupplierDetailPanel
                                  supplier={supplier}
                                  onCommissionUpdate={handleCommissionUpdate}
                                />
                              </motion.div>
                            </td>
                          </tr>
                        )}
                      </AnimatePresence>
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && (
              <div className="py-16 text-center">
                <Store className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No suppliers match your filters</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setCategoryFilter('all');
                    setCountryFilter('all');
                    setStatusFilter('all');
                    setTierFilter('all');
                  }}
                  className="mt-2 text-sm text-[#5DB347] hover:text-[#4da03c] font-medium transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </motion.div>
        ) : (
          /* ── Grid View ─────────────────────────────────────────────────── */
          <motion.div
            key="grid"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
          >
            {filtered.map((supplier) => (
              <motion.div key={supplier.id} variants={cardVariants}>
                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-[#5DB347]/20 transition-all group">
                  {/* Card Header - clickable to expand */}
                  <div
                    className="p-5 cursor-pointer"
                    onClick={() => toggleExpand(supplier.id)}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <img src={supplier.logo_url || '/placeholder-logo.png'} alt={supplier.company_name} loading="lazy" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-semibold text-[#1B2A4A] text-sm truncate group-hover:text-[#5DB347] transition-colors">
                            {supplier.company_name}
                          </h3>
                          <VerificationBadge verified={supplier.verified} />
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">{supplier.contact_name}</p>
                      </div>
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${statusColors[supplier.status]}`}>
                        {statusIcons[supplier.status]}
                        {supplier.status.charAt(0).toUpperCase() + supplier.status.slice(1)}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryColors[supplier.category]}`}>
                        {categoryLabels[supplier.category]}
                      </span>
                      {supplier.sponsorship_tier && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${tierColors[supplier.sponsorship_tier]}`}>
                          {supplier.sponsorship_tier.charAt(0).toUpperCase() + supplier.sponsorship_tier.slice(1)}
                        </span>
                      )}
                      {supplier.is_founding && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-[#1B2A4A]/10 text-[#1B2A4A]">
                          Founding
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
                      <MapPin className="w-3 h-3" />
                      {supplier.region}, {supplier.country}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-gray-100">
                      <div>
                        <p className="text-xs text-gray-400">Products</p>
                        <p className="text-sm font-semibold text-[#1B2A4A]">{supplier.products_count}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Sales</p>
                        <p className="text-sm font-semibold text-[#1B2A4A]">{formatCurrency(supplier.total_sales)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Commission</p>
                        <p className="text-sm font-semibold text-[#1B2A4A]">{supplier.commission_rate}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Rating</p>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-semibold text-[#1B2A4A]">{supplier.rating.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons Row */}
                  <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {supplier.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(supplier.id, supplier.company_name)}
                            disabled={actionLoading === supplier.id}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-[#5DB347] text-white rounded-lg hover:bg-[#4da03c] transition-colors disabled:opacity-50"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button
                            onClick={() => handleReject(supplier.id, supplier.company_name)}
                            disabled={actionLoading === supplier.id}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </button>
                        </>
                      )}
                      {supplier.status === 'active' && (
                        <button
                          onClick={() => handleSuspend(supplier.id, supplier.company_name)}
                          disabled={actionLoading === supplier.id}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                          <Ban className="w-3.5 h-3.5" /> Suspend
                        </button>
                      )}
                      {(supplier.status === 'suspended' || supplier.status === 'rejected') && (
                        <button
                          onClick={() => handleActivate(supplier.id)}
                          disabled={actionLoading === supplier.id}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-[#5DB347] border border-[#5DB347]/30 rounded-lg hover:bg-[#5DB347]/10 transition-colors disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Activate
                        </button>
                      )}
                    </div>
                    <Link
                      href={`/admin/suppliers/${supplier.id}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-[#1B2A4A] hover:text-[#5DB347] transition-colors"
                    >
                      View Details <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  {/* Expandable Detail Panel (Grid) */}
                  <AnimatePresence>
                    {expandedId === supplier.id && (
                      <motion.div
                        variants={expandVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="overflow-hidden"
                      >
                        <SupplierDetailPanel
                          supplier={supplier}
                          onCommissionUpdate={handleCommissionUpdate}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full py-16 text-center">
                <Store className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No suppliers match your filters</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
