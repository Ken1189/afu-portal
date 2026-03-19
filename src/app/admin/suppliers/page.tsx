'use client';

import { useState, useMemo } from 'react';
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
  Users,
  ShieldCheck,
  Award,
  MapPin,
  Package,
  ArrowUpDown,
} from 'lucide-react';
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

// ── Helpers ───────────────────────────────────────────────────────────────

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toLocaleString()}`;
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
};

const statusIcons: Record<string, React.ReactNode> = {
  active: <CheckCircle2 className="w-3 h-3" />,
  pending: <Clock className="w-3 h-3" />,
  suspended: <XCircle className="w-3 h-3" />,
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

// ═══════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function AdminSuppliersPage() {
  const { suppliers, loading, stats, approveSupplier, suspendSupplier, activateSupplier } = useSuppliers();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [countryFilter, setCountryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [sortField, setSortField] = useState<SortField>('companyName');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // ── Action handlers ───────────────────────────────────────────────────
  const handleApprove = async (id: string) => {
    setActionLoading(id);
    await approveSupplier(id);
    setActionLoading(null);
  };

  const handleSuspend = async (id: string) => {
    setActionLoading(id);
    await suspendSupplier(id);
    setActionLoading(null);
  };

  const handleActivate = async (id: string) => {
    setActionLoading(id);
    await activateSupplier(id);
    setActionLoading(null);
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
    { label: 'Total Suppliers', value: totalSuppliers, icon: <Store className="w-5 h-5" />, color: 'text-teal', bgColor: 'bg-teal/10' },
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

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 text-gray-300" />;
    return sortDir === 'asc' ? (
      <ChevronUp className="w-3 h-3 text-teal" />
    ) : (
      <ChevronDown className="w-3 h-3 text-teal" />
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">Supplier Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage all marketplace suppliers and their listings</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/suppliers/new"
            className="inline-flex items-center gap-2 bg-teal hover:bg-teal-dark text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
          >
            <Package className="w-4 h-4" />
            Add Supplier
          </Link>
          <Link
            href="/admin/suppliers/sponsorships"
            className="inline-flex items-center gap-2 bg-navy hover:bg-navy/90 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
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
            <svg className="animate-spin h-4 w-4 text-teal" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
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
                <p className="text-2xl font-bold text-navy">{card.value}</p>
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
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal/50 focus:border-teal"
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
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal/50 bg-white"
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
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal/50 bg-white"
            >
              <option value="all">All Countries</option>
              <option value="Botswana">Botswana</option>
              <option value="Kenya">Kenya</option>
              <option value="Mozambique">Mozambique</option>
              <option value="Nigeria">Nigeria</option>
              <option value="Sierra Leone">Sierra Leone</option>
              <option value="South Africa">South Africa</option>
              <option value="Tanzania">Tanzania</option>
              <option value="Zambia">Zambia</option>
              <option value="Zimbabwe">Zimbabwe</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal/50 bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
            </select>

            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal/50 bg-white"
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
                className={`p-2 transition-colors ${viewMode === 'table' ? 'bg-navy text-white' : 'bg-white text-gray-400 hover:text-gray-600'}`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-navy text-white' : 'bg-white text-gray-400 hover:text-gray-600'}`}
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
              className="text-xs text-teal hover:text-teal-dark font-medium transition-colors"
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
                  <tr className="border-b border-gray-100 bg-cream/50">
                    <th
                      className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-navy transition-colors"
                      onClick={() => toggleSort('companyName')}
                    >
                      <div className="flex items-center gap-1">
                        Company <SortIcon field="companyName" />
                      </div>
                    </th>
                    <th
                      className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-navy transition-colors"
                      onClick={() => toggleSort('category')}
                    >
                      <div className="flex items-center gap-1">
                        Category <SortIcon field="category" />
                      </div>
                    </th>
                    <th
                      className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-navy transition-colors"
                      onClick={() => toggleSort('country')}
                    >
                      <div className="flex items-center gap-1">
                        Country <SortIcon field="country" />
                      </div>
                    </th>
                    <th
                      className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-navy transition-colors"
                      onClick={() => toggleSort('status')}
                    >
                      <div className="flex items-center gap-1">
                        Status <SortIcon field="status" />
                      </div>
                    </th>
                    <th
                      className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-navy transition-colors"
                      onClick={() => toggleSort('productsCount')}
                    >
                      <div className="flex items-center justify-end gap-1">
                        Products <SortIcon field="productsCount" />
                      </div>
                    </th>
                    <th
                      className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-navy transition-colors"
                      onClick={() => toggleSort('totalSales')}
                    >
                      <div className="flex items-center justify-end gap-1">
                        Total Sales <SortIcon field="totalSales" />
                      </div>
                    </th>
                    <th
                      className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-navy transition-colors"
                      onClick={() => toggleSort('rating')}
                    >
                      <div className="flex items-center gap-1">
                        Rating <SortIcon field="rating" />
                      </div>
                    </th>
                    <th
                      className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-navy transition-colors"
                      onClick={() => toggleSort('sponsorshipTier')}
                    >
                      <div className="flex items-center gap-1">
                        Tier <SortIcon field="sponsorshipTier" />
                      </div>
                    </th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((supplier) => (
                    <motion.tr
                      key={supplier.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-cream/50 transition-colors group"
                    >
                      <td className="py-3 px-4">
                        <Link href={`/admin/suppliers/${supplier.id}`} className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            <img
                              src={supplier.logo_url || '/placeholder-logo.png'}
                              alt={supplier.company_name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-navy text-sm truncate group-hover:text-teal transition-colors">
                              {supplier.company_name}
                            </p>
                            <p className="text-xs text-gray-400 truncate">{supplier.contact_name}</p>
                          </div>
                          {supplier.verified && (
                            <ShieldCheck className="w-4 h-4 text-teal flex-shrink-0" />
                          )}
                        </Link>
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
                      <td className="py-3 px-4 text-right">
                        <span className="text-sm font-medium text-navy tabular-nums">{supplier.products_count}</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-sm font-medium text-navy tabular-nums">{formatCurrency(supplier.total_sales)}</span>
                      </td>
                      <td className="py-3 px-4">
                        <RatingStars rating={supplier.rating} />
                      </td>
                      <td className="py-3 px-4">
                        {supplier.sponsorship_tier ? (
                          <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${tierColors[supplier.sponsorship_tier]}`}>
                            {supplier.sponsorship_tier.charAt(0).toUpperCase() + supplier.sponsorship_tier.slice(1)}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-300">--</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/admin/suppliers/${supplier.id}`}
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-navy transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          {supplier.status === 'pending' && (
                            <button
                              onClick={(e) => { e.preventDefault(); handleApprove(supplier.id); }}
                              disabled={actionLoading === supplier.id}
                              className="p-1.5 rounded-lg hover:bg-green-50 text-gray-400 hover:text-green-600 transition-colors disabled:opacity-50"
                              title="Approve"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}
                          {supplier.status === 'active' && (
                            <button
                              onClick={(e) => { e.preventDefault(); handleSuspend(supplier.id); }}
                              disabled={actionLoading === supplier.id}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                              title="Suspend"
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          )}
                          {supplier.status === 'suspended' && (
                            <button
                              onClick={(e) => { e.preventDefault(); handleActivate(supplier.id); }}
                              disabled={actionLoading === supplier.id}
                              className="p-1.5 rounded-lg hover:bg-green-50 text-gray-400 hover:text-green-600 transition-colors disabled:opacity-50"
                              title="Activate"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-navy transition-colors"
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
                  className="mt-2 text-sm text-teal hover:text-teal-dark font-medium transition-colors"
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
                <Link
                  href={`/admin/suppliers/${supplier.id}`}
                  className="block bg-white rounded-xl border border-gray-100 p-5 hover:shadow-lg hover:border-teal/20 transition-all group"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <img src={supplier.logo_url || '/placeholder-logo.png'} alt={supplier.company_name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-semibold text-navy text-sm truncate group-hover:text-teal transition-colors">
                          {supplier.company_name}
                        </h3>
                        {supplier.verified && <ShieldCheck className="w-4 h-4 text-teal flex-shrink-0" />}
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
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-navy/10 text-navy">
                        Founding
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
                    <MapPin className="w-3 h-3" />
                    {supplier.region}, {supplier.country}
                  </div>

                  <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-100">
                    <div>
                      <p className="text-xs text-gray-400">Products</p>
                      <p className="text-sm font-semibold text-navy">{supplier.products_count}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Sales</p>
                      <p className="text-sm font-semibold text-navy">{formatCurrency(supplier.total_sales)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Rating</p>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-semibold text-navy">{supplier.rating.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                </Link>
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
