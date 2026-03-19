'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  DollarSign,
  Landmark,
  CalendarClock,
  CreditCard,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  Eye,
  Wallet,
  FileText,
  Percent,
  Timer,
  CalendarDays,
  Globe2,
  Sprout,
  ShoppingCart,
  Plus,
  Inbox,
  ArrowUpCircle,
} from 'lucide-react';
import { loans as mockLoans, type Loan, type LoanType, type LoanStatus } from '@/lib/data/loans';
import { useLoans } from '@/lib/supabase/use-loans';

// Bridge: use live loans if available, otherwise mock
const loans = mockLoans;

/* ------------------------------------------------------------------ */
/*  Type helpers                                                       */
/* ------------------------------------------------------------------ */

type StatusFilter = 'all' | LoanStatus;

const loanTypeLabels: Record<LoanType, string> = {
  'working-capital': 'Working Capital',
  'invoice-finance': 'Invoice Finance',
  'equipment': 'Equipment',
  'input-bundle': 'Input Bundle',
};

const statusConfig: Record<
  LoanStatus,
  { label: string; cls: string; dot: string; icon: React.ElementType }
> = {
  active: {
    label: 'Active',
    cls: 'bg-green-50 text-green-700',
    dot: 'bg-green-500',
    icon: CheckCircle2,
  },
  completed: {
    label: 'Completed',
    cls: 'bg-blue-50 text-blue-700',
    dot: 'bg-blue-500',
    icon: CheckCircle2,
  },
  overdue: {
    label: 'Overdue',
    cls: 'bg-red-50 text-red-700',
    dot: 'bg-red-500',
    icon: AlertTriangle,
  },
  disbursed: {
    label: 'Disbursed',
    cls: 'bg-amber-50 text-amber-700',
    dot: 'bg-amber-500',
    icon: ArrowUpCircle,
  },
  approved: {
    label: 'Approved',
    cls: 'bg-amber-50 text-amber-700',
    dot: 'bg-amber-500',
    icon: Clock,
  },
};

/* ------------------------------------------------------------------ */
/*  Format helpers                                                     */
/* ------------------------------------------------------------------ */

function fmtCurrency(amount: number) {
  return `$${amount.toLocaleString()}`;
}

function fmtDate(dateStr: string) {
  if (!dateStr) return '--';
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/* ------------------------------------------------------------------ */
/*  Animation variants                                                 */
/* ------------------------------------------------------------------ */

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.04,
      duration: 0.35,
      ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
    },
  }),
};

const statVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: {
      delay: i * 0.08,
      type: 'spring' as const,
      stiffness: 260,
      damping: 22,
    },
  }),
};

const expandVariants = {
  collapsed: { opacity: 0, height: 0 },
  expanded: {
    opacity: 1,
    height: 'auto' as const,
    transition: { duration: 0.3, ease: 'easeOut' as const },
  },
};

/* ------------------------------------------------------------------ */
/*  Filter buttons config                                              */
/* ------------------------------------------------------------------ */

const filterButtons: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'completed', label: 'Completed' },
  { key: 'overdue', label: 'Overdue' },
  { key: 'disbursed', label: 'Disbursed' },
  { key: 'approved', label: 'Approved' },
];

/* ------------------------------------------------------------------ */
/*  Page component                                                     */
/* ------------------------------------------------------------------ */

export default function FinancingPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  /* Filtered loans */
  const filtered = useMemo(
    () =>
      statusFilter === 'all'
        ? loans
        : loans.filter((l) => l.status === statusFilter),
    [statusFilter],
  );

  /* Summary stats */
  const totalFinanced = useMemo(() => loans.reduce((s, l) => s + l.amount, 0), []);
  const outstandingBalance = useMemo(
    () => loans.reduce((s, l) => s + l.outstanding, 0),
    [],
  );
  const activeCount = useMemo(
    () => loans.filter((l) => l.status === 'active').length,
    [],
  );

  const nextPayment = useMemo(() => {
    const upcoming = loans
      .filter((l) => l.nextPaymentDate && l.nextPaymentAmount > 0)
      .sort(
        (a, b) =>
          new Date(a.nextPaymentDate).getTime() -
          new Date(b.nextPaymentDate).getTime(),
      );
    return upcoming.length > 0 ? upcoming[0] : null;
  }, []);

  /* Count per status for filter badges */
  const countByStatus = useMemo(() => {
    const map: Record<string, number> = { all: loans.length };
    for (const l of loans) {
      map[l.status] = (map[l.status] || 0) + 1;
    }
    return map;
  }, []);

  return (
    <div>
      {/* ---- Header ---- */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-navy">Financing</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage your loans, applications, and repayment schedules
          </p>
        </div>
        <Link
          href="/dashboard/financing/apply"
          className="flex items-center gap-2 bg-teal hover:bg-teal-dark text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Application
        </Link>
      </div>

      {/* ---- Summary Stat Cards ---- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: 'Total Financed',
            value: fmtCurrency(totalFinanced),
            icon: Landmark,
            color: 'text-navy',
            bg: 'bg-navy/5',
          },
          {
            label: 'Outstanding Balance',
            value: fmtCurrency(outstandingBalance),
            icon: CreditCard,
            color: 'text-teal',
            bg: 'bg-teal/10',
          },
          {
            label: 'Next Payment Due',
            value: nextPayment ? fmtCurrency(nextPayment.nextPaymentAmount) : '--',
            sub: nextPayment ? fmtDate(nextPayment.nextPaymentDate) : undefined,
            icon: CalendarClock,
            color: 'text-gold',
            bg: 'bg-gold/10',
          },
          {
            label: 'Active Loans',
            value: String(activeCount),
            icon: DollarSign,
            color: 'text-green-600',
            bg: 'bg-green-50',
          },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              custom={i}
              variants={statVariants}
              initial="hidden"
              animate="visible"
              className="bg-white rounded-xl p-5 border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center`}
                >
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  {'sub' in stat && stat.sub && (
                    <p className="text-xs text-gray-400 mt-0.5">{stat.sub}</p>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ---- Status Filter Buttons ---- */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {filterButtons.map((f) => (
          <button
            key={f.key}
            onClick={() => setStatusFilter(f.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === f.key
                ? 'bg-teal text-white'
                : 'border border-gray-200 text-gray-600 hover:border-teal/30 hover:text-teal'
            }`}
          >
            {f.label} ({countByStatus[f.key] || 0})
          </button>
        ))}
      </div>

      {/* ---- Loan Cards ---- */}
      <div className="space-y-4">
        {filtered.map((loan, i) => {
          const cfg = statusConfig[loan.status];
          const StatusIcon = cfg.icon;
          const isExpanded = expanded === loan.id;

          return (
            <motion.div
              key={loan.id}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              layout
              className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* ---- Card Row ---- */}
              <div
                className="p-5 flex items-center gap-4 cursor-pointer"
                onClick={() => setExpanded(isExpanded ? null : loan.id)}
              >
                {/* Status dot */}
                <div className={`w-3 h-3 rounded-full shrink-0 ${cfg.dot}`} />

                {/* Main info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-navy text-sm truncate">
                      {loanTypeLabels[loan.type]}
                    </h3>
                    <span
                      className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${cfg.cls}`}
                    >
                      <StatusIcon className="w-3 h-3" />
                      {cfg.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {loan.id} &middot; {loan.crop}
                    {loan.buyer ? ` \u00B7 ${loan.buyer}` : ''}
                  </p>
                </div>

                {/* Progress + amounts (hidden on mobile) */}
                <div className="hidden sm:flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm font-bold text-gold">
                      {fmtCurrency(loan.amount)}
                    </p>
                    <p className="text-xs text-gray-400">
                      Bal {fmtCurrency(loan.outstanding)}
                    </p>
                  </div>
                  <div className="w-24">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-500">Repaid</span>
                      <span className="text-xs font-semibold text-navy">
                        {loan.repaidPercentage}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full">
                      <div
                        className={`h-1.5 rounded-full transition-all ${
                          loan.status === 'overdue'
                            ? 'bg-red-500'
                            : loan.repaidPercentage === 100
                            ? 'bg-blue-500'
                            : 'bg-teal'
                        }`}
                        style={{ width: `${Math.min(loan.repaidPercentage, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                <ArrowRight
                  className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${
                    isExpanded ? 'rotate-90' : ''
                  }`}
                />
              </div>

              {/* ---- Expanded Details ---- */}
              {isExpanded && (
                <motion.div
                  variants={expandVariants}
                  initial="collapsed"
                  animate="expanded"
                  className="border-t border-gray-100 p-5 bg-cream/50"
                >
                  {/* Detail grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {[
                      {
                        label: 'Interest Rate',
                        value: `${loan.interestRate}% APR`,
                        icon: Percent,
                      },
                      {
                        label: 'Tenor',
                        value: `${loan.tenor} days`,
                        icon: Timer,
                      },
                      {
                        label: 'Disbursement Date',
                        value: fmtDate(loan.disbursementDate),
                        icon: CalendarDays,
                      },
                      {
                        label: 'Maturity Date',
                        value: fmtDate(loan.maturityDate),
                        icon: CalendarClock,
                      },
                    ].map((detail) => {
                      const Icon = detail.icon;
                      return (
                        <div key={detail.label} className="flex items-start gap-2">
                          <Icon className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-xs text-gray-500">{detail.label}</p>
                            <p className="text-sm font-medium text-navy">
                              {detail.value}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {loan.nextPaymentDate && loan.nextPaymentAmount > 0 && (
                      <div className="flex items-start gap-2">
                        <Wallet className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500">Next Payment</p>
                          <p className="text-sm font-medium text-navy">
                            {fmtCurrency(loan.nextPaymentAmount)}
                          </p>
                          <p className="text-xs text-gray-400">
                            {fmtDate(loan.nextPaymentDate)}
                          </p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-start gap-2">
                      <Globe2 className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500">Country</p>
                        <p className="text-sm font-medium text-navy">
                          {loan.country}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Sprout className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500">Crop</p>
                        <p className="text-sm font-medium text-navy">{loan.crop}</p>
                      </div>
                    </div>
                    {loan.buyer && (
                      <div className="flex items-start gap-2">
                        <ShoppingCart className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500">Buyer</p>
                          <p className="text-sm font-medium text-navy">
                            {loan.buyer}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Member info */}
                  <div className="bg-white rounded-lg p-3 mb-4 border border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Borrower / Member</p>
                    <p className="text-sm font-medium text-navy">
                      {loan.memberName}
                    </p>
                    <p className="text-xs text-gray-400">{loan.memberId}</p>
                  </div>

                  {/* Mobile-only progress bar */}
                  <div className="sm:hidden mb-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-500">Repaid</span>
                      <span className="text-xs font-semibold text-navy">
                        {loan.repaidPercentage}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full">
                      <div
                        className={`h-1.5 rounded-full transition-all ${
                          loan.status === 'overdue'
                            ? 'bg-red-500'
                            : loan.repaidPercentage === 100
                            ? 'bg-blue-500'
                            : 'bg-teal'
                        }`}
                        style={{
                          width: `${Math.min(loan.repaidPercentage, 100)}%`,
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gold font-semibold">
                        {fmtCurrency(loan.amount)}
                      </span>
                      <span className="text-xs text-gray-400">
                        Bal {fmtCurrency(loan.outstanding)}
                      </span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-3 flex-wrap">
                    <button className="flex items-center gap-2 text-sm text-teal font-medium hover:text-teal-dark transition-colors px-4 py-2 rounded-lg hover:bg-teal/5">
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                    {loan.status !== 'completed' && (
                      <button className="flex items-center gap-2 text-sm text-navy font-medium hover:text-teal transition-colors px-4 py-2 rounded-lg hover:bg-gray-50">
                        <Wallet className="w-4 h-4" />
                        Make Payment
                      </button>
                    )}
                    <button className="flex items-center gap-2 text-sm text-navy font-medium hover:text-teal transition-colors px-4 py-2 rounded-lg hover:bg-gray-50">
                      <FileText className="w-4 h-4" />
                      Download Statement
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* ---- Empty State ---- */}
      {filtered.length === 0 && (
        <div className="text-center py-16">
          <Inbox className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No loans match your filter</p>
          <button
            onClick={() => setStatusFilter('all')}
            className="mt-3 text-teal text-sm font-medium hover:underline"
          >
            View all loans
          </button>
        </div>
      )}
    </div>
  );
}
