'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Landmark,
  DollarSign,
  Clock,
  CheckCircle2,
  MessageSquare,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Mail,
  MoreHorizontal,
  TrendingUp,
  Users,
  Eye,
  Send,
  X,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

type ExpressionStatus = 'Pending' | 'In Discussion' | 'Committed' | 'Declined';

interface Expression {
  id: string;
  date: string;
  investorName: string;
  entityName: string;
  opportunity: string;
  amount: number;
  status: ExpressionStatus;
  email: string;
  phone: string;
  notes: string;
}

// ── Demo Data ─────────────────────────────────────────────────────────────────

const expressions: Expression[] = [
  {
    id: '1',
    date: '2026-03-25',
    investorName: 'John Mitchell',
    entityName: 'Meridian Capital Partners',
    opportunity: 'AFU Debt Fund II',
    amount: 500000,
    status: 'Pending',
    email: 'john@meridiancap.com',
    phone: '+1 212 555 0142',
    notes: 'Interested in quarterly reporting and ESG metrics.',
  },
  {
    id: '2',
    date: '2026-03-24',
    investorName: 'Sarah Chen',
    entityName: 'Pacific Rim Investments',
    opportunity: 'Zimbabwe Blueberry',
    amount: 250000,
    status: 'In Discussion',
    email: 'schen@pacificrim.hk',
    phone: '+852 9876 5432',
    notes: 'Wants site visit before committing. Available April.',
  },
  {
    id: '3',
    date: '2026-03-22',
    investorName: 'David Okonkwo',
    entityName: 'Lagos Angel Network',
    opportunity: 'Trade Finance Facility',
    amount: 1000000,
    status: 'Pending',
    email: 'david@lagosangels.ng',
    phone: '+234 801 234 5678',
    notes: 'Exploring co-investment with DFI partners.',
  },
  {
    id: '4',
    date: '2026-03-20',
    investorName: 'Emma Thornton',
    entityName: 'Thornton Family Office',
    opportunity: 'Macadamia Orchard',
    amount: 200000,
    status: 'Committed',
    email: 'emma@thorntonfamily.co.uk',
    phone: '+44 7700 900123',
    notes: 'Subscription docs signed. Wire pending.',
  },
  {
    id: '5',
    date: '2026-03-18',
    investorName: 'James Kimani',
    entityName: 'Nairobi Venture Fund',
    opportunity: 'East Africa Insurance',
    amount: 300000,
    status: 'In Discussion',
    email: 'jkimani@nvf.co.ke',
    phone: '+254 722 000 111',
    notes: 'Requesting insurance pool actuarial data.',
  },
  {
    id: '6',
    date: '2026-03-15',
    investorName: 'Michael Roberts',
    entityName: 'Impact Capital Group',
    opportunity: 'AFU Debt Fund II',
    amount: 750000,
    status: 'Committed',
    email: 'mroberts@impactcap.com',
    phone: '+1 415 555 0198',
    notes: 'Committed. Impact reporting required quarterly.',
  },
  {
    id: '7',
    date: '2026-03-12',
    investorName: 'Fatima Al-Hassan',
    entityName: 'Gulf Agriculture Fund',
    opportunity: 'Trade Finance Facility',
    amount: 2000000,
    status: 'In Discussion',
    email: 'fatima@gulfagri.ae',
    phone: '+971 50 123 4567',
    notes: 'Due diligence in progress. Legal review of SBLC structure.',
  },
  {
    id: '8',
    date: '2026-03-10',
    investorName: 'Robert van der Berg',
    entityName: 'Cape Town PE',
    opportunity: 'Zimbabwe Blueberry',
    amount: 500000,
    status: 'Committed',
    email: 'rvdb@ctpe.co.za',
    phone: '+27 82 555 6789',
    notes: 'Funds wired. Wants board observer seat.',
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatCurrency(value: number): string {
  return `$${value.toLocaleString()}`;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const statusStyles: Record<ExpressionStatus, string> = {
  Pending: 'bg-amber-100 text-amber-700',
  'In Discussion': 'bg-blue-100 text-blue-700',
  Committed: 'bg-green-100 text-green-700',
  Declined: 'bg-red-100 text-red-700',
};

const defaultStatusCounts = {
  total: expressions.length,
  pending: expressions.filter((e) => e.status === 'Pending').length,
  inDiscussion: expressions.filter((e) => e.status === 'In Discussion').length,
  committed: expressions.filter((e) => e.status === 'Committed').length,
};

const defaultPipelineValue = expressions.reduce((sum, e) => sum + e.amount, 0);

// ── Animation Variants ────────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 260, damping: 24 },
  },
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function InvestorRelationsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ExpressionStatus | 'All'>('All');
  const [opportunityFilter, setOpportunityFilter] = useState<string>('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusEditing, setStatusEditing] = useState<string | null>(null);
  const [localStatuses, setLocalStatuses] = useState<Record<string, ExpressionStatus>>({});
  const [dbExpressions, setDbExpressions] = useState<Expression[]>([]);
  const [dbLoading, setDbLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    async function fetchInterests() {
      try {
        const { data } = await supabase
          .from('investor_interests')
          .select('*, profiles!investor_interests_profile_id_fkey(full_name, email)')
          .order('created_at', { ascending: false });
        if (data && data.length > 0) {
          const mapped: Expression[] = data.map((row: Record<string, unknown>, idx: number) => {
            const profile = row.profiles as Record<string, unknown> | null;
            return {
              id: (row.id as string) || String(idx + 1),
              date: ((row.created_at as string) || '').slice(0, 10),
              investorName: (profile?.full_name as string) || (row.investor_name as string) || 'Unknown',
              entityName: (row.entity_name as string) || (row.company_name as string) || '',
              opportunity: (row.opportunity as string) || (row.interest_type as string) || 'General',
              amount: (row.amount as number) || 0,
              status: (((row.status as string) || 'Pending').charAt(0).toUpperCase() + ((row.status as string) || 'pending').slice(1)) as ExpressionStatus,
              email: (profile?.email as string) || (row.email as string) || '',
              phone: (row.phone as string) || '',
              notes: (row.notes as string) || '',
            };
          });
          setDbExpressions(mapped);
        }
      } catch {
        // keep fallback demo data
      } finally {
        setDbLoading(false);
      }
    }
    fetchInterests();
  }, []);

  // Use DB data if available, otherwise fallback
  const activeExpressions = dbExpressions.length > 0 ? dbExpressions : expressions;

  const statusCounts = dbExpressions.length > 0 ? {
    total: activeExpressions.length,
    pending: activeExpressions.filter((e) => e.status === 'Pending').length,
    inDiscussion: activeExpressions.filter((e) => e.status === 'In Discussion').length,
    committed: activeExpressions.filter((e) => e.status === 'Committed').length,
  } : defaultStatusCounts;

  const totalPipelineValue = dbExpressions.length > 0
    ? activeExpressions.reduce((sum, e) => sum + e.amount, 0)
    : defaultPipelineValue;

  const uniqueOpportunities = Array.from(new Set(activeExpressions.map((e) => e.opportunity)));

  const filtered = activeExpressions.filter((e) => {
    const currentStatus = localStatuses[e.id] || e.status;
    if (statusFilter !== 'All' && currentStatus !== statusFilter) return false;
    if (opportunityFilter !== 'All' && e.opportunity !== opportunityFilter) return false;
    if (
      searchQuery &&
      !e.investorName.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !e.entityName.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  });

  const getStatus = (e: Expression): ExpressionStatus => localStatuses[e.id] || e.status;

  const handleStatusChange = (id: string, newStatus: ExpressionStatus) => {
    setLocalStatuses((prev) => ({ ...prev, [id]: newStatus }));
    setStatusEditing(null);
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6"
    >
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <motion.div variants={cardVariants}>
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 bg-[#1B2A4A] rounded-lg">
            <Landmark className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1B2A4A] tracking-tight">
              Investor Relations
            </h1>
            <p className="text-gray-500 text-sm">
              Manage investment expressions of interest and investor communications
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── Stats Row ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Expressions',
            value: statusCounts.total,
            icon: <Users className="w-5 h-5" />,
            color: 'text-[#1B2A4A]',
            bg: 'bg-gray-50',
          },
          {
            label: 'Pending Review',
            value: statusCounts.pending,
            icon: <Clock className="w-5 h-5" />,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
          },
          {
            label: 'In Discussion',
            value: statusCounts.inDiscussion,
            icon: <MessageSquare className="w-5 h-5" />,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
          },
          {
            label: 'Committed',
            value: statusCounts.committed,
            icon: <CheckCircle2 className="w-5 h-5" />,
            color: 'text-green-600',
            bg: 'bg-green-50',
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            variants={cardVariants}
            custom={i}
            className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                {stat.label}
              </span>
              <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>{stat.icon}</div>
            </div>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* ── Pipeline Value Banner ───────────────────────────────────────────── */}
      <motion.div
        variants={cardVariants}
        className="bg-gradient-to-r from-[#1B2A4A] to-[#2d4170] rounded-xl p-5 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-lg">
            <TrendingUp className="w-5 h-5 text-[#5DB347]" />
          </div>
          <div>
            <p className="text-sm text-gray-300">Total Pipeline Value</p>
            <p className="text-2xl font-bold text-white">{formatCurrency(totalPipelineValue)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-[#5DB347]" />
          <span className="text-sm text-gray-300">
            {statusCounts.committed} committed &middot; {statusCounts.inDiscussion} in discussion
          </span>
        </div>
      </motion.div>

      {/* ── Filters & Search ────────────────────────────────────────────────── */}
      <motion.div
        variants={cardVariants}
        className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm"
      >
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by investor name or entity..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] text-[#1B2A4A]"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ExpressionStatus | 'All')}
              className="pl-10 pr-8 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] text-[#1B2A4A] bg-white appearance-none cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Discussion">In Discussion</option>
              <option value="Committed">Committed</option>
              <option value="Declined">Declined</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Opportunity Filter */}
          <div className="relative">
            <Landmark className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={opportunityFilter}
              onChange={(e) => setOpportunityFilter(e.target.value)}
              className="pl-10 pr-8 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] text-[#1B2A4A] bg-white appearance-none cursor-pointer"
            >
              <option value="All">All Opportunities</option>
              {uniqueOpportunities.map((opp) => (
                <option key={opp} value={opp}>
                  {opp}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </motion.div>

      {/* ── Expressions Table ───────────────────────────────────────────────── */}
      <motion.div
        variants={cardVariants}
        className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[#1B2A4A]">
            Expressions of Interest
          </h2>
          <span className="text-xs text-gray-400">{filtered.length} results</span>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/80">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Investor
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Entity
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Opportunity
                </th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((expr) => {
                const currentStatus = getStatus(expr);
                const isExpanded = expandedId === expr.id;
                const isEditingStatus = statusEditing === expr.id;

                return (
                  <AnimatePresence key={expr.id}>
                    <tr
                      className={`hover:bg-gray-50/50 transition-colors ${
                        isExpanded ? 'bg-blue-50/30' : ''
                      }`}
                    >
                      <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                        {formatDate(expr.date)}
                      </td>
                      <td className="px-6 py-4 font-medium text-[#1B2A4A] whitespace-nowrap">
                        {expr.investorName}
                      </td>
                      <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                        {expr.entityName}
                      </td>
                      <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                        {expr.opportunity}
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-[#1B2A4A] whitespace-nowrap">
                        {formatCurrency(expr.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isEditingStatus ? (
                          <div className="flex items-center gap-1">
                            <select
                              value={currentStatus}
                              onChange={(e) =>
                                handleStatusChange(expr.id, e.target.value as ExpressionStatus)
                              }
                              className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 bg-white"
                              autoFocus
                            >
                              <option value="Pending">Pending</option>
                              <option value="In Discussion">In Discussion</option>
                              <option value="Committed">Committed</option>
                              <option value="Declined">Declined</option>
                            </select>
                            <button
                              onClick={() => setStatusEditing(null)}
                              className="p-1 hover:bg-gray-100 rounded"
                            >
                              <X className="w-3 h-3 text-gray-400" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setStatusEditing(expr.id)}
                            className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full cursor-pointer hover:opacity-80 transition-opacity ${statusStyles[currentStatus]}`}
                          >
                            {currentStatus}
                            <ChevronDown className="w-3 h-3" />
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() =>
                              setExpandedId(isExpanded ? null : expr.id)
                            }
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-[#1B2A4A]"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <a
                            href={`mailto:${expr.email}?subject=Re: ${expr.opportunity} Investment Interest`}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-[#1B2A4A]"
                            title="Send email"
                          >
                            <Send className="w-4 h-4" />
                          </a>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded Detail Row */}
                    {isExpanded && (
                      <tr key={`${expr.id}-detail`}>
                        <td colSpan={7} className="px-6 py-0">
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="py-4 grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-dashed border-gray-200">
                              <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                                  Contact
                                </p>
                                <p className="text-sm text-[#1B2A4A]">
                                  <Mail className="w-3.5 h-3.5 inline mr-1.5 text-gray-400" />
                                  <a
                                    href={`mailto:${expr.email}`}
                                    className="text-blue-600 hover:underline"
                                  >
                                    {expr.email}
                                  </a>
                                </p>
                                <p className="text-sm text-[#1B2A4A] mt-1">
                                  {expr.phone}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                                  Notes
                                </p>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                  {expr.notes || 'No notes'}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                                  Quick Actions
                                </p>
                                <div className="flex gap-2">
                                  <a
                                    href={`mailto:${expr.email}?subject=Re: ${expr.opportunity} — Next Steps&body=Dear ${expr.investorName},%0D%0A%0D%0AThank you for your interest in the ${expr.opportunity}.%0D%0A%0D%0A`}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#1B2A4A] text-white rounded-lg hover:bg-[#2d4170] transition-colors"
                                  >
                                    <Mail className="w-3.5 h-3.5" />
                                    Send Follow-up
                                  </a>
                                  <button
                                    onClick={() =>
                                      handleStatusChange(
                                        expr.id,
                                        currentStatus === 'Pending'
                                          ? 'In Discussion'
                                          : 'Committed'
                                      )
                                    }
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#5DB347] text-white rounded-lg hover:bg-[#4A9A38] transition-colors"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    Advance Status
                                  </button>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-gray-100">
          {filtered.map((expr) => {
            const currentStatus = getStatus(expr);
            const isExpanded = expandedId === expr.id;

            return (
              <div key={expr.id} className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-[#1B2A4A]">{expr.investorName}</p>
                    <p className="text-xs text-gray-500">{expr.entityName}</p>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyles[currentStatus]}`}
                  >
                    {currentStatus}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-gray-500">{expr.opportunity}</p>
                  <p className="font-semibold text-[#1B2A4A]">{formatCurrency(expr.amount)}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-400">{formatDate(expr.date)}</p>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : expr.id)}
                      className="p-2 rounded-lg hover:bg-gray-100 text-gray-400"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                    <a
                      href={`mailto:${expr.email}`}
                      className="p-2 rounded-lg hover:bg-gray-100 text-gray-400"
                    >
                      <Send className="w-4 h-4" />
                    </a>
                  </div>
                </div>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="mt-3 pt-3 border-t border-dashed border-gray-200 space-y-2"
                  >
                    <p className="text-xs text-gray-600">
                      <Mail className="w-3 h-3 inline mr-1" />
                      {expr.email}
                    </p>
                    <p className="text-xs text-gray-600">{expr.phone}</p>
                    <p className="text-xs text-gray-500 italic">{expr.notes}</p>
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Search className="w-8 h-8 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No expressions match your filters.</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
