'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Plus,
  Sparkles,
  ArrowRight,
  X,
  ChevronDown,
  Calendar,
  Sprout,
  FlaskConical,
  Bug,
  Users,
  Wrench,
  Truck,
  ShoppingCart,
  FileText,
  Gift,
  MoreHorizontal,
} from 'lucide-react';
import {
  farmTransactions,
  farmPlots,
  getFarmSummary,
} from '@/lib/data/farm';
import type { FarmTransaction, TransactionCategory } from '@/lib/data/farm';

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      ease: 'easeOut' as const,
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

const modalOverlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const modalContentVariants = {
  hidden: { opacity: 0, y: 60, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 28,
    },
  },
  exit: {
    opacity: 0,
    y: 60,
    scale: 0.95,
    transition: { duration: 0.2 },
  },
};

const transactionCardVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 260,
      damping: 24,
    },
  },
};

// ---------------------------------------------------------------------------
// Category icon / color helpers
// ---------------------------------------------------------------------------

const categoryConfig: Record<
  TransactionCategory,
  { icon: React.ElementType; label: string; color: string; bg: string }
> = {
  seeds: { icon: Sprout, label: 'Seeds', color: 'text-green-600', bg: 'bg-green-50' },
  fertilizer: { icon: FlaskConical, label: 'Fertilizer', color: 'text-amber-600', bg: 'bg-amber-50' },
  pesticides: { icon: Bug, label: 'Pesticides', color: 'text-red-500', bg: 'bg-red-50' },
  labor: { icon: Users, label: 'Labor', color: 'text-blue-600', bg: 'bg-blue-50' },
  equipment: { icon: Wrench, label: 'Equipment', color: 'text-gray-600', bg: 'bg-gray-100' },
  transport: { icon: Truck, label: 'Transport', color: 'text-purple-600', bg: 'bg-purple-50' },
  'harvest-sale': { icon: ShoppingCart, label: 'Harvest Sale', color: 'text-green-600', bg: 'bg-green-50' },
  'contract-payment': { icon: FileText, label: 'Contract', color: 'text-teal', bg: 'bg-teal-light' },
  subsidy: { icon: Gift, label: 'Subsidy', color: 'text-gold', bg: 'bg-amber-50' },
  other: { icon: MoreHorizontal, label: 'Other', color: 'text-gray-500', bg: 'bg-gray-50' },
};

// ---------------------------------------------------------------------------
// Date grouping helpers
// ---------------------------------------------------------------------------

const NOW = new Date('2026-03-14T12:00:00');

function getDateLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const diffMs = NOW.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return d.toLocaleDateString('en-GB', { month: 'long', day: 'numeric' });
}

function groupByDate(txns: FarmTransaction[]): { label: string; date: string; transactions: FarmTransaction[] }[] {
  const map = new Map<string, FarmTransaction[]>();
  const sorted = [...txns].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  for (const t of sorted) {
    const existing = map.get(t.date);
    if (existing) {
      existing.push(t);
    } else {
      map.set(t.date, [t]);
    }
  }
  return Array.from(map.entries()).map(([date, transactions]) => ({
    label: getDateLabel(date),
    date,
    transactions,
  }));
}

// ---------------------------------------------------------------------------
// Animated counter hook
// ---------------------------------------------------------------------------

function useAnimatedCounter(target: number, duration = 1200): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const startTime = performance.now();

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);
      setValue(current);
      if (progress < 1) {
        start = requestAnimationFrame(tick);
      }
    }

    start = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(start);
  }, [target, duration]);

  return value;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

type FilterTab = 'all' | 'income' | 'expense';

export default function MoneyTrackerPage() {
  const summary = useMemo(() => getFarmSummary(), []);
  const [filter, setFilter] = useState<FilterTab>('all');
  const [expandedTxn, setExpandedTxn] = useState<string | null>(null);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'income' | 'expense'>('income');
  const [modalAmount, setModalAmount] = useState('');
  const [modalCategory, setModalCategory] = useState<TransactionCategory | ''>('');
  const [modalDescription, setModalDescription] = useState('');
  const [modalPlotId, setModalPlotId] = useState('');
  const [modalDate, setModalDate] = useState('2026-03-14');

  // Local transactions state (allows "adding")
  const [transactions, setTransactions] = useState<FarmTransaction[]>(farmTransactions);

  // Animated counters
  const animatedProfit = useAnimatedCounter(summary.profit);
  const animatedIncome = useAnimatedCounter(summary.totalIncome);
  const animatedExpenses = useAnimatedCounter(summary.totalExpenses);

  // Filtered transactions
  const filtered = useMemo(() => {
    if (filter === 'all') return transactions;
    return transactions.filter((t) => t.type === filter);
  }, [filter, transactions]);

  const incomeCount = useMemo(() => transactions.filter((t) => t.type === 'income').length, [transactions]);
  const expenseCount = useMemo(() => transactions.filter((t) => t.type === 'expense').length, [transactions]);
  const grouped = useMemo(() => groupByDate(filtered), [filtered]);

  // Income / Expense breakdowns
  const incomeBreakdown = useMemo(() => {
    const map = new Map<TransactionCategory, number>();
    transactions.filter((t) => t.type === 'income').forEach((t) => {
      map.set(t.category, (map.get(t.category) || 0) + t.amount);
    });
    const entries = Array.from(map.entries())
      .map(([cat, amount]) => ({ category: cat, amount }))
      .sort((a, b) => b.amount - a.amount);
    const total = entries.reduce((s, e) => s + e.amount, 0);
    return entries.map((e) => ({ ...e, percent: total > 0 ? Math.round((e.amount / total) * 100) : 0 }));
  }, [transactions]);

  const expenseBreakdown = useMemo(() => {
    const map = new Map<TransactionCategory, number>();
    transactions.filter((t) => t.type === 'expense').forEach((t) => {
      map.set(t.category, (map.get(t.category) || 0) + t.amount);
    });
    const entries = Array.from(map.entries())
      .map(([cat, amount]) => ({ category: cat, amount }))
      .sort((a, b) => b.amount - a.amount);
    const total = entries.reduce((s, e) => s + e.amount, 0);
    return entries.map((e) => ({ ...e, percent: total > 0 ? Math.round((e.amount / total) * 100) : 0 }));
  }, [transactions]);

  // Modal open helpers
  const openModal = useCallback((type: 'income' | 'expense') => {
    setModalType(type);
    setModalAmount('');
    setModalCategory('');
    setModalDescription('');
    setModalPlotId('');
    setModalDate('2026-03-14');
    setModalOpen(true);
  }, []);

  const handleSaveTransaction = useCallback(() => {
    if (!modalAmount || !modalCategory) return;
    const newTxn: FarmTransaction = {
      id: `TXN-${Date.now()}`,
      type: modalType,
      category: modalCategory as TransactionCategory,
      amount: parseFloat(modalAmount),
      currency: 'USD',
      date: modalDate,
      description: modalDescription || `${modalType === 'income' ? 'Income' : 'Expense'} — ${categoryConfig[modalCategory as TransactionCategory]?.label || modalCategory}`,
      plotId: modalPlotId || undefined,
      plotName: modalPlotId ? farmPlots.find((p) => p.id === modalPlotId)?.name : undefined,
    };
    setTransactions((prev) => [newTxn, ...prev]);
    setModalOpen(false);
  }, [modalAmount, modalCategory, modalType, modalDate, modalDescription, modalPlotId]);

  // Income categories for modal
  const incomeCategories: TransactionCategory[] = ['harvest-sale', 'contract-payment', 'subsidy', 'other'];
  const expenseCategories: TransactionCategory[] = ['seeds', 'fertilizer', 'pesticides', 'labor', 'equipment', 'transport', 'other'];

  // Breakdown bar colors
  const breakdownColors = [
    'bg-teal',
    'bg-green-500',
    'bg-amber-500',
    'bg-blue-500',
    'bg-purple-500',
    'bg-red-400',
    'bg-pink-400',
    'bg-indigo-400',
    'bg-orange-400',
    'bg-gray-400',
  ];

  return (
    <>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-5 py-4"
      >
        {/* ================================================================= */}
        {/* 1. PROFIT SUMMARY CARD                                            */}
        {/* ================================================================= */}
        <motion.section variants={itemVariants} className="px-4">
          <div className="rounded-2xl bg-gradient-to-br from-teal to-teal-dark p-5 text-white relative overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/5 rounded-full" />
            <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/5 rounded-full" />
            <div className="absolute top-12 right-6 w-16 h-16 bg-white/5 rounded-full" />

            <div className="relative z-10 text-center">
              <p className="text-xs font-medium text-white/70 uppercase tracking-wider mb-1">
                This Season
              </p>
              <motion.p
                className="text-[32px] font-extrabold leading-tight"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring' as const, stiffness: 200, damping: 18, delay: 0.2 }}
              >
                ${animatedProfit.toLocaleString()}
              </motion.p>
              <p className="text-sm text-white/80 font-medium mt-0.5">Profit</p>

              {/* Income / Expenses row */}
              <div className="flex items-center justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center">
                    <TrendingUp size={14} />
                  </div>
                  <div className="text-left">
                    <p className="text-[11px] text-white/60">Income</p>
                    <p className="text-sm font-bold">${animatedIncome.toLocaleString()}</p>
                  </div>
                </div>
                <div className="w-px h-8 bg-white/20" />
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center">
                    <TrendingDown size={14} />
                  </div>
                  <div className="text-left">
                    <p className="text-[11px] text-white/60">Expenses</p>
                    <p className="text-sm font-bold">${animatedExpenses.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* ================================================================= */}
        {/* 2. QUICK ADD BUTTONS                                              */}
        {/* ================================================================= */}
        <motion.section variants={itemVariants} className="px-4">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => openModal('income')}
              className="flex items-center justify-center gap-2 py-3.5 rounded-xl border-2 border-green-400 text-green-600 font-semibold text-sm active:bg-green-50 transition-colors min-h-[48px]"
            >
              <Plus size={18} strokeWidth={2.5} />
              Income
            </button>
            <button
              onClick={() => openModal('expense')}
              className="flex items-center justify-center gap-2 py-3.5 rounded-xl border-2 border-red-400 text-red-500 font-semibold text-sm active:bg-red-50 transition-colors min-h-[48px]"
            >
              <Plus size={18} strokeWidth={2.5} />
              Expense
            </button>
          </div>
        </motion.section>

        {/* ================================================================= */}
        {/* 3. FILTER TABS                                                    */}
        {/* ================================================================= */}
        <motion.section variants={itemVariants} className="px-4">
          <div className="flex gap-2">
            {([
              { key: 'all' as FilterTab, label: 'All', count: transactions.length },
              { key: 'income' as FilterTab, label: 'Income', count: incomeCount },
              { key: 'expense' as FilterTab, label: 'Expenses', count: expenseCount },
            ]).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all min-h-[44px] ${
                  filter === tab.key
                    ? 'bg-navy text-white shadow-sm'
                    : 'bg-white text-gray-500 border border-gray-200 active:bg-gray-50'
                }`}
              >
                {tab.label}
                <span
                  className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${
                    filter === tab.key
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </motion.section>

        {/* ================================================================= */}
        {/* 4. TRANSACTION LIST (grouped by date)                             */}
        {/* ================================================================= */}
        <motion.section variants={itemVariants} className="px-4">
          <div className="space-y-4">
            {grouped.map((group) => (
              <div key={group.date}>
                {/* Date header */}
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">
                  {group.label}
                </p>

                <div className="space-y-2">
                  {group.transactions.map((txn) => {
                    const config = categoryConfig[txn.category];
                    const Icon = config.icon;
                    const isIncome = txn.type === 'income';
                    const isExpanded = expandedTxn === txn.id;

                    return (
                      <motion.div
                        key={txn.id}
                        variants={transactionCardVariants}
                        layout
                        className="rounded-xl bg-white border border-gray-100 overflow-hidden"
                      >
                        <button
                          onClick={() => setExpandedTxn(isExpanded ? null : txn.id)}
                          className="w-full flex items-center gap-3 p-3 min-h-[56px] text-left"
                        >
                          {/* Category icon */}
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                              isIncome ? 'bg-green-50' : 'bg-red-50'
                            }`}
                          >
                            <Icon
                              size={18}
                              className={isIncome ? 'text-green-600' : 'text-red-500'}
                            />
                          </div>

                          {/* Description */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-navy leading-tight truncate">
                              {txn.description}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {txn.plotName && (
                                <span className="text-[11px] text-gray-400 truncate">
                                  {txn.plotName}
                                </span>
                              )}
                              {txn.plotName && (
                                <span className="text-[11px] text-gray-300">&middot;</span>
                              )}
                              <span
                                className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${config.bg} ${config.color}`}
                              >
                                {config.label}
                              </span>
                            </div>
                          </div>

                          {/* Amount */}
                          <p
                            className={`text-[16px] font-bold shrink-0 ${
                              isIncome ? 'text-green-600' : 'text-red-500'
                            }`}
                          >
                            {isIncome ? '+' : '-'}${txn.amount}
                          </p>
                        </button>

                        {/* Expanded details */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ type: 'spring' as const, stiffness: 300, damping: 28 }}
                              className="overflow-hidden"
                            >
                              <div className="px-3 pb-3 pt-0 border-t border-gray-50">
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                  {txn.buyer && (
                                    <div>
                                      <p className="text-[10px] text-gray-400 uppercase">Buyer</p>
                                      <p className="text-xs text-navy font-medium">{txn.buyer}</p>
                                    </div>
                                  )}
                                  {txn.quantity != null && (
                                    <div>
                                      <p className="text-[10px] text-gray-400 uppercase">Quantity</p>
                                      <p className="text-xs text-navy font-medium">
                                        {txn.quantity} {txn.unit}
                                      </p>
                                    </div>
                                  )}
                                  {txn.pricePerUnit != null && (
                                    <div>
                                      <p className="text-[10px] text-gray-400 uppercase">Unit Price</p>
                                      <p className="text-xs text-navy font-medium">
                                        ${txn.pricePerUnit}/{txn.unit}
                                      </p>
                                    </div>
                                  )}
                                  <div>
                                    <p className="text-[10px] text-gray-400 uppercase">Date</p>
                                    <p className="text-xs text-navy font-medium">
                                      {new Date(txn.date + 'T00:00:00').toLocaleDateString('en-GB', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric',
                                      })}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}

            {grouped.length === 0 && (
              <div className="text-center py-8">
                <p className="text-sm text-gray-400">No transactions found</p>
              </div>
            )}
          </div>
        </motion.section>

        {/* ================================================================= */}
        {/* 5. INCOME BY SOURCE                                               */}
        {/* ================================================================= */}
        <motion.section variants={itemVariants} className="px-4">
          <h3 className="text-sm font-bold text-navy mb-3">Income by Source</h3>
          <div className="rounded-2xl bg-white border border-gray-100 p-4">
            {/* Stacked bar */}
            <div className="h-4 rounded-full overflow-hidden flex mb-4">
              {incomeBreakdown.map((item, idx) => (
                <motion.div
                  key={item.category}
                  className={`h-full ${breakdownColors[idx % breakdownColors.length]}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${item.percent}%` }}
                  transition={{ duration: 0.8, delay: 0.3 + idx * 0.1, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
                />
              ))}
            </div>

            {/* List */}
            <div className="space-y-2.5">
              {incomeBreakdown.map((item, idx) => {
                const config = categoryConfig[item.category];
                return (
                  <div key={item.category} className="flex items-center gap-3">
                    <span
                      className={`w-3 h-3 rounded-full shrink-0 ${breakdownColors[idx % breakdownColors.length]}`}
                    />
                    <span className="text-xs text-gray-600 flex-1">{config.label}</span>
                    <span className="text-xs font-bold text-navy">${item.amount.toLocaleString()}</span>
                    <span className="text-[11px] text-gray-400 w-8 text-right">{item.percent}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.section>

        {/* ================================================================= */}
        {/* 6. EXPENSES BY CATEGORY                                           */}
        {/* ================================================================= */}
        <motion.section variants={itemVariants} className="px-4">
          <h3 className="text-sm font-bold text-navy mb-3">Expenses by Category</h3>
          <div className="rounded-2xl bg-white border border-gray-100 p-4">
            {/* Stacked bar */}
            <div className="h-4 rounded-full overflow-hidden flex mb-4">
              {expenseBreakdown.map((item, idx) => (
                <motion.div
                  key={item.category}
                  className={`h-full ${breakdownColors[idx % breakdownColors.length]}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${item.percent}%` }}
                  transition={{ duration: 0.8, delay: 0.3 + idx * 0.1, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
                />
              ))}
            </div>

            {/* List */}
            <div className="space-y-2.5">
              {expenseBreakdown.map((item, idx) => {
                const config = categoryConfig[item.category];
                return (
                  <div key={item.category} className="flex items-center gap-3">
                    <span
                      className={`w-3 h-3 rounded-full shrink-0 ${breakdownColors[idx % breakdownColors.length]}`}
                    />
                    <span className="text-xs text-gray-600 flex-1">{config.label}</span>
                    <span className="text-xs font-bold text-navy">${item.amount.toLocaleString()}</span>
                    <span className="text-[11px] text-gray-400 w-8 text-right">{item.percent}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.section>

        {/* ================================================================= */}
        {/* 7. AI INSIGHT CARD                                                */}
        {/* ================================================================= */}
        <motion.section variants={itemVariants} className="px-4 pb-2">
          <div className="rounded-2xl bg-gradient-to-br from-teal to-teal-dark p-4 text-white relative overflow-hidden">
            {/* Decorative */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full" />
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/5 rounded-full" />

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={16} className="text-gold" />
                <span className="text-xs font-bold text-white/80 uppercase tracking-wide">
                  Money Insight
                </span>
              </div>
              <p className="text-sm leading-relaxed text-white/95">
                Your blueberries are your most profitable crop at $8/kg. Consider expanding
                your blueberry plot next season.
              </p>
              <Link
                href="/farm/assistant"
                className="inline-flex items-center gap-2 mt-3 px-4 py-2.5 rounded-xl bg-white/15 active:bg-white/25 text-sm font-medium transition-colors min-h-[44px]"
              >
                Talk to AI
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </motion.section>
      </motion.div>

      {/* =================================================================== */}
      {/* ADD TRANSACTION MODAL                                               */}
      {/* =================================================================== */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            variants={modalOverlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end justify-center"
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              variants={modalContentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-white rounded-t-3xl p-5 pb-8 max-h-[85vh] overflow-y-auto"
            >
              {/* Modal header */}
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-navy">
                  {modalType === 'income' ? 'Add Income' : 'Add Expense'}
                </h2>
                <button
                  onClick={() => setModalOpen(false)}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 active:bg-gray-200 transition-colors"
                >
                  <X size={18} className="text-gray-500" />
                </button>
              </div>

              {/* Amount input */}
              <div className="mb-5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                  Amount (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-300">
                    $
                  </span>
                  <input
                    type="number"
                    inputMode="decimal"
                    placeholder="0.00"
                    value={modalAmount}
                    onChange={(e) => setModalAmount(e.target.value)}
                    className="w-full pl-10 pr-4 py-4 text-2xl font-bold text-navy bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/20 transition-all placeholder:text-gray-300"
                  />
                </div>
              </div>

              {/* Category selector */}
              <div className="mb-5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                  Category
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(modalType === 'income' ? incomeCategories : expenseCategories).map(
                    (cat) => {
                      const config = categoryConfig[cat];
                      const Icon = config.icon;
                      const isSelected = modalCategory === cat;
                      return (
                        <button
                          key={cat}
                          onClick={() => setModalCategory(cat)}
                          className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all min-h-[72px] ${
                            isSelected
                              ? modalType === 'income'
                                ? 'border-green-400 bg-green-50'
                                : 'border-red-400 bg-red-50'
                              : 'border-gray-100 bg-white active:bg-gray-50'
                          }`}
                        >
                          <Icon
                            size={20}
                            className={isSelected ? (modalType === 'income' ? 'text-green-600' : 'text-red-500') : 'text-gray-400'}
                          />
                          <span
                            className={`text-[10px] font-medium leading-tight text-center ${
                              isSelected ? 'text-navy' : 'text-gray-500'
                            }`}
                          >
                            {config.label}
                          </span>
                        </button>
                      );
                    }
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="mb-4">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="What was this for?"
                  value={modalDescription}
                  onChange={(e) => setModalDescription(e.target.value)}
                  className="w-full px-4 py-3 text-sm text-navy bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/20 transition-all placeholder:text-gray-400"
                />
              </div>

              {/* Plot selector */}
              <div className="mb-4">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                  Plot (optional)
                </label>
                <div className="relative">
                  <select
                    value={modalPlotId}
                    onChange={(e) => setModalPlotId(e.target.value)}
                    className="w-full px-4 py-3 text-sm text-navy bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/20 transition-all appearance-none pr-10"
                  >
                    <option value="">No plot selected</option>
                    {farmPlots.map((plot) => (
                      <option key={plot.id} value={plot.id}>
                        {plot.name} ({plot.crop})
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={16}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                </div>
              </div>

              {/* Date */}
              <div className="mb-6">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                  Date
                </label>
                <div className="relative">
                  <Calendar
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                  <input
                    type="date"
                    value={modalDate}
                    onChange={(e) => setModalDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 text-sm text-navy bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/20 transition-all"
                  />
                </div>
              </div>

              {/* Save button */}
              <button
                onClick={handleSaveTransaction}
                disabled={!modalAmount || !modalCategory}
                className={`w-full py-4 rounded-xl text-white font-bold text-base transition-all min-h-[52px] ${
                  !modalAmount || !modalCategory
                    ? 'bg-gray-300 cursor-not-allowed'
                    : modalType === 'income'
                      ? 'bg-green-500 active:bg-green-600 shadow-lg shadow-green-500/25'
                      : 'bg-red-500 active:bg-red-600 shadow-lg shadow-red-500/25'
                }`}
              >
                {modalType === 'income' ? 'Save Income' : 'Save Expense'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
