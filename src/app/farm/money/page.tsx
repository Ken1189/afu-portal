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
import { useFarmPlots, type FarmPlotRow } from '@/lib/supabase/use-farm-plots';
import { useFarmTransactions } from '@/lib/supabase/use-farm-transactions';
import { useAuth } from '@/lib/supabase/auth-context';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { Translations } from '@/lib/i18n/translations';

// ---------------------------------------------------------------------------
// Inlined types & data (previously from @/lib/data/farm & @/lib/data/adapters)
// ---------------------------------------------------------------------------

type TransactionType = 'income' | 'expense';
type TransactionCategory = 'seeds' | 'fertilizer' | 'pesticides' | 'labor' | 'equipment' | 'transport' | 'harvest-sale' | 'contract-payment' | 'subsidy' | 'other';

interface FarmTransaction {
  id: string;
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  currency: string;
  date: string;
  description: string;
  plotId?: string;
  plotName?: string;
  buyer?: string;
  quantity?: number;
  unit?: string;
  pricePerUnit?: number;
}

interface FarmPlot {
  id: string;
  name: string;
  size: number;
  sizeUnit: 'hectares' | 'acres';
  crop: string;
  variety: string;
  stage: string;
  plantingDate: string;
  expectedHarvest: string;
  daysToHarvest: number;
  progressPercent: number;
  healthScore: number;
  lastActivity: string;
  activities: any[];
  image: string;
  soilPH: number;
  location: string;
}

const mockFarmTransactions: FarmTransaction[] = [
  { id: 'TXN-001', type: 'income', category: 'harvest-sale', amount: 960, currency: 'USD', date: '2026-03-07', description: 'Blueberries 120kg @ $8/kg — FreshPack Exports', plotId: 'PLT-001', plotName: 'Main Blueberry Field', buyer: 'FreshPack Exports', quantity: 120, unit: 'kg', pricePerUnit: 8 },
  { id: 'TXN-002', type: 'income', category: 'contract-payment', amount: 500, currency: 'USD', date: '2026-03-01', description: 'Advance payment — March sesame delivery contract', plotId: 'PLT-003', plotName: 'Sesame Strip', buyer: 'SesaMe Trading' },
  { id: 'TXN-003', type: 'expense', category: 'fertilizer', amount: 45, currency: 'USD', date: '2026-03-12', description: 'Sulfur-based soil acidifier — 25kg bag', plotId: 'PLT-001', plotName: 'Main Blueberry Field' },
  { id: 'TXN-004', type: 'expense', category: 'labor', amount: 36, currency: 'USD', date: '2026-03-10', description: '3 laborers x 4 hours weeding @ $3/hr', plotId: 'PLT-002', plotName: 'Cassava Plot' },
  { id: 'TXN-005', type: 'expense', category: 'pesticides', amount: 18, currency: 'USD', date: '2026-03-11', description: 'Neem oil organic pesticide — 1 liter', plotId: 'PLT-003', plotName: 'Sesame Strip' },
  { id: 'TXN-006', type: 'expense', category: 'seeds', amount: 85, currency: 'USD', date: '2026-03-01', description: 'SC 513 maize seed — 10kg bag', plotId: 'PLT-004', plotName: 'Maize Field' },
  { id: 'TXN-007', type: 'expense', category: 'fertilizer', amount: 90, currency: 'USD', date: '2026-03-05', description: 'NPK 15-15-15 — 2 x 50kg bags', plotId: 'PLT-002', plotName: 'Cassava Plot' },
  { id: 'TXN-008', type: 'expense', category: 'equipment', amount: 15, currency: 'USD', date: '2026-03-03', description: 'Soil pH testing supplies', plotId: 'PLT-001', plotName: 'Main Blueberry Field' },
  { id: 'TXN-009', type: 'income', category: 'subsidy', amount: 200, currency: 'USD', date: '2026-02-28', description: 'AFU member input subsidy — Q1 2026' },
  { id: 'TXN-010', type: 'expense', category: 'transport', amount: 25, currency: 'USD', date: '2026-03-07', description: 'Transport blueberries to FreshPack collection point', plotId: 'PLT-001', plotName: 'Main Blueberry Field' },
  { id: 'TXN-011', type: 'income', category: 'harvest-sale', amount: 180, currency: 'USD', date: '2026-02-22', description: 'Cassava chips 300kg @ $0.60/kg — local market', plotId: 'PLT-002', plotName: 'Cassava Plot', buyer: 'Gaborone Market', quantity: 300, unit: 'kg', pricePerUnit: 0.6 },
  { id: 'TXN-012', type: 'expense', category: 'labor', amount: 48, currency: 'USD', date: '2026-02-20', description: '4 laborers x 4 hours harvesting cassava @ $3/hr', plotId: 'PLT-002', plotName: 'Cassava Plot' },
];

const mockFarmPlots: FarmPlot[] = [
  { id: 'PLT-001', name: 'Main Blueberry Field', size: 1.5, sizeUnit: 'hectares', crop: 'Blueberries', variety: 'Duke', stage: 'fruiting', plantingDate: '2025-09-15', expectedHarvest: '2026-04-10', daysToHarvest: 27, progressPercent: 78, healthScore: 92, lastActivity: '2026-03-12', activities: [], image: 'https://images.unsplash.com/photo-1498579809087-ef1e558fd1da?w=400&h=300&fit=crop', soilPH: 4.8, location: 'Plot A — North Field' },
  { id: 'PLT-002', name: 'Cassava Plot', size: 2.0, sizeUnit: 'hectares', crop: 'Cassava', variety: 'TMS 30572', stage: 'vegetative', plantingDate: '2025-12-01', expectedHarvest: '2026-09-30', daysToHarvest: 200, progressPercent: 35, healthScore: 78, lastActivity: '2026-03-10', activities: [], image: 'https://images.unsplash.com/photo-1590682680695-43b964a3ae17?w=400&h=300&fit=crop', soilPH: 6.2, location: 'Plot B — South Field' },
  { id: 'PLT-003', name: 'Sesame Strip', size: 0.8, sizeUnit: 'hectares', crop: 'Sesame', variety: 'S42 White', stage: 'flowering', plantingDate: '2025-11-20', expectedHarvest: '2026-04-25', daysToHarvest: 42, progressPercent: 65, healthScore: 85, lastActivity: '2026-03-11', activities: [], image: 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=400&h=300&fit=crop', soilPH: 6.8, location: 'Plot C — East Strip' },
  { id: 'PLT-004', name: 'Maize Field', size: 1.0, sizeUnit: 'hectares', crop: 'Maize', variety: 'SC 513', stage: 'planted', plantingDate: '2026-03-01', expectedHarvest: '2026-07-15', daysToHarvest: 123, progressPercent: 8, healthScore: 95, lastActivity: '2026-03-01', activities: [], image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=300&fit=crop', soilPH: 6.5, location: 'Plot D — West Field' },
];

function getMockFarmSummary() {
  const totalIncome = mockFarmTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = mockFarmTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const profit = totalIncome - totalExpenses;
  const totalHectares = mockFarmPlots.reduce((sum, p) => sum + p.size, 0);
  const avgHealthScore = Math.round(mockFarmPlots.reduce((sum, p) => sum + p.healthScore, 0) / mockFarmPlots.length);
  return { totalIncome, totalExpenses, profit, totalHectares, avgHealthScore, pendingTasks: 6, highPriorityTasks: 2, plotCount: mockFarmPlots.length };
}

// ─── adaptFarmPlot (inlined from @/lib/data/adapters) ─────────────────────

const CROP_IMAGES: Record<string, string> = {
  blueberries: 'https://images.unsplash.com/photo-1498159332174-be5f8a9afc86?w=600&h=400&fit=crop',
  tomatoes: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=600&h=400&fit=crop',
  maize: 'https://images.unsplash.com/photo-1601004890684-d8573e10e7e7?w=600&h=400&fit=crop',
  cassava: 'https://images.unsplash.com/photo-1590682680695-43b964a3ae17?w=600&h=400&fit=crop',
  sesame: 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=600&h=400&fit=crop',
  sorghum: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&h=400&fit=crop',
  default: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&h=400&fit=crop',
};

function getCropImage(crop: string | null): string {
  if (!crop) return CROP_IMAGES.default;
  const key = crop.toLowerCase();
  for (const [k, v] of Object.entries(CROP_IMAGES)) {
    if (key.includes(k)) return v;
  }
  return CROP_IMAGES.default;
}

function computeProgress(stage: string): number {
  const stages = ['planning', 'planted', 'germinating', 'vegetative', 'flowering', 'fruiting', 'harvesting', 'completed'];
  const idx = stages.indexOf(stage);
  if (idx < 0) return 0;
  return Math.round((idx / (stages.length - 1)) * 100);
}

function computeDaysToHarvest(expectedHarvest: string | null): number {
  if (!expectedHarvest) return 0;
  const diff = new Date(expectedHarvest).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function adaptFarmPlot(row: FarmPlotRow) {
  return {
    id: row.id,
    name: row.name,
    size: row.size_ha || 0,
    sizeUnit: 'hectares' as const,
    crop: row.crop || 'Unknown',
    variety: row.variety || '',
    stage: row.stage as any,
    plantingDate: row.planting_date || '',
    expectedHarvest: row.expected_harvest || '',
    daysToHarvest: computeDaysToHarvest(row.expected_harvest),
    progressPercent: computeProgress(row.stage),
    healthScore: row.health_score,
    lastActivity: row.updated_at,
    activities: [],
    image: getCropImage(row.crop),
    soilPH: row.soil_ph || 6.5,
    location: row.location || '',
  };
}

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
  { icon: React.ElementType; color: string; bg: string }
> = {
  seeds: { icon: Sprout, color: 'text-green-600', bg: 'bg-green-50' },
  fertilizer: { icon: FlaskConical, color: 'text-amber-600', bg: 'bg-amber-50' },
  pesticides: { icon: Bug, color: 'text-red-500', bg: 'bg-red-50' },
  labor: { icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
  equipment: { icon: Wrench, color: 'text-gray-600', bg: 'bg-gray-100' },
  transport: { icon: Truck, color: 'text-purple-600', bg: 'bg-purple-50' },
  'harvest-sale': { icon: ShoppingCart, color: 'text-green-600', bg: 'bg-green-50' },
  'contract-payment': { icon: FileText, color: 'text-teal', bg: 'bg-teal-light' },
  subsidy: { icon: Gift, color: 'text-gold', bg: 'bg-amber-50' },
  other: { icon: MoreHorizontal, color: 'text-gray-500', bg: 'bg-gray-50' },
};

// Map TransactionCategory keys to moneyTracker.categories translation keys
type CategoryKey = keyof Translations['moneyTracker']['categories'];
const categoryTranslationKey: Record<TransactionCategory, CategoryKey> = {
  seeds: 'seeds',
  fertilizer: 'fertilizer',
  pesticides: 'pesticides',
  labor: 'labor',
  equipment: 'equipment',
  transport: 'transport',
  'harvest-sale': 'harvestSale',
  'contract-payment': 'contractPayment',
  subsidy: 'subsidy',
  other: 'other',
};

// ---------------------------------------------------------------------------
// Date grouping helpers
// ---------------------------------------------------------------------------

const NOW = new Date('2026-03-14T12:00:00');

function getDateLabel(dateStr: string, todayLabel: string, yesterdayLabel: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const diffMs = NOW.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return todayLabel;
  if (diffDays === 1) return yesterdayLabel;
  return d.toLocaleDateString('en-GB', { month: 'long', day: 'numeric' });
}

function groupByDate(txns: FarmTransaction[], todayLabel: string, yesterdayLabel: string): { label: string; date: string; transactions: FarmTransaction[] }[] {
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
    label: getDateLabel(date, todayLabel, yesterdayLabel),
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
  const { t } = useLanguage();
  const { user } = useAuth();
  const { createTransaction: createDbTransaction } = useFarmTransactions(user?.id);
  const { plots: livePlots } = useFarmPlots();
  const farmPlots = livePlots.length > 0 ? livePlots.map(adaptFarmPlot) : mockFarmPlots;
  const summary = useMemo(() => getMockFarmSummary(), []);
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
  const farmTransactions = mockFarmTransactions;
  const [transactions, setTransactions] = useState<FarmTransaction[]>(farmTransactions);
  const [savingTxn, setSavingTxn] = useState(false);
  const [txnToast, setTxnToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
  const grouped = useMemo(() => groupByDate(filtered, t.common.today, t.common.yesterday), [filtered, t.common.today, t.common.yesterday]);

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

  const handleSaveTransaction = useCallback(async () => {
    if (!modalAmount || !modalCategory) return;
    setSavingTxn(true);
    setTxnToast(null);

    const newTxn: FarmTransaction = {
      id: `TXN-${Date.now()}`,
      type: modalType,
      category: modalCategory as TransactionCategory,
      amount: parseFloat(modalAmount),
      currency: 'USD',
      date: modalDate,
      description: modalDescription || `${modalType === 'income' ? t.moneyTracker.income : t.moneyTracker.expenses} — ${t.moneyTracker.categories[categoryTranslationKey[modalCategory as TransactionCategory]] || modalCategory}`,
      plotId: modalPlotId || undefined,
      plotName: modalPlotId ? farmPlots.find((p) => p.id === modalPlotId)?.name : undefined,
    };
    setTransactions((prev) => [newTxn, ...prev]);
    setModalOpen(false);

    // Persist to Supabase
    if (user) {
      try {
        const { error } = await createDbTransaction({
          member_id: user.id,
          type: modalType,
          category: modalCategory as string,
          amount: parseFloat(modalAmount),
          currency: 'USD',
          date: modalDate,
          description: newTxn.description,
          plot_id: modalPlotId || null,
        });
        if (error) {
          setTxnToast({ type: 'error', text: error });
        } else {
          setTxnToast({ type: 'success', text: `${modalType === 'income' ? 'Income' : 'Expense'} saved successfully` });
        }
      } catch {
        setTxnToast({ type: 'error', text: 'Could not save to database' });
      }
    } else {
      setTxnToast({ type: 'success', text: 'Transaction recorded locally' });
    }

    setSavingTxn(false);
    setTimeout(() => setTxnToast(null), 3000);
  }, [modalAmount, modalCategory, modalType, modalDate, modalDescription, modalPlotId, t, user, createDbTransaction]);

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
      {/* Toast notification */}
      {txnToast && (
        <div className={`fixed top-4 right-4 z-[60] px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${
          txnToast.type === 'success'
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {txnToast.text}
        </div>
      )}
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
          <div className="rounded-2xl bg-gradient-to-br from-[#8CB89C] to-[#729E82] p-5 text-white relative overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/5 rounded-full" />
            <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/5 rounded-full" />
            <div className="absolute top-12 right-6 w-16 h-16 bg-white/5 rounded-full" />

            <div className="relative z-10 text-center">
              <p className="text-xs font-medium text-white/70 uppercase tracking-wider mb-1">
                {t.moneyTracker.thisSeason}
              </p>
              <motion.p
                className="text-2xl sm:text-[32px] font-extrabold leading-tight"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring' as const, stiffness: 200, damping: 18, delay: 0.2 }}
              >
                ${animatedProfit.toLocaleString()}
              </motion.p>
              <p className="text-sm text-white/80 font-medium mt-0.5">{t.moneyTracker.profit}</p>

              {/* Income / Expenses row */}
              <div className="flex items-center justify-center gap-4 sm:gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center">
                    <TrendingUp size={14} />
                  </div>
                  <div className="text-left">
                    <p className="text-[11px] text-white/60">{t.moneyTracker.income}</p>
                    <p className="text-sm font-bold">${animatedIncome.toLocaleString()}</p>
                  </div>
                </div>
                <div className="w-px h-8 bg-white/20" />
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center">
                    <TrendingDown size={14} />
                  </div>
                  <div className="text-left">
                    <p className="text-[11px] text-white/60">{t.moneyTracker.expenses}</p>
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
              {t.moneyTracker.income}
            </button>
            <button
              onClick={() => openModal('expense')}
              className="flex items-center justify-center gap-2 py-3.5 rounded-xl border-2 border-red-400 text-red-500 font-semibold text-sm active:bg-red-50 transition-colors min-h-[48px]"
            >
              <Plus size={18} strokeWidth={2.5} />
              {t.moneyTracker.expenses}
            </button>
          </div>
        </motion.section>

        {/* ================================================================= */}
        {/* 3. FILTER TABS                                                    */}
        {/* ================================================================= */}
        <motion.section variants={itemVariants} className="px-4">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {([
              { key: 'all' as FilterTab, label: t.moneyTracker.all, count: transactions.length },
              { key: 'income' as FilterTab, label: t.moneyTracker.income, count: incomeCount },
              { key: 'expense' as FilterTab, label: t.moneyTracker.expenses, count: expenseCount },
            ]).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all min-h-[44px] ${
                  filter === tab.key
                    ? 'bg-navy text-white shadow-sm active:bg-navy/90'
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
                          className="w-full flex items-center gap-3 p-3 min-h-[56px] text-left active:bg-gray-50 transition-colors"
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
                                className={`text-[11px] font-medium px-1.5 py-0.5 rounded-full ${config.bg} ${config.color}`}
                              >
                                {t.moneyTracker.categories[categoryTranslationKey[txn.category]]}
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
                                      <p className="text-[11px] text-gray-400 uppercase">Buyer</p>
                                      <p className="text-xs text-navy font-medium">{txn.buyer}</p>
                                    </div>
                                  )}
                                  {txn.quantity != null && (
                                    <div>
                                      <p className="text-[11px] text-gray-400 uppercase">Quantity</p>
                                      <p className="text-xs text-navy font-medium">
                                        {txn.quantity} {txn.unit}
                                      </p>
                                    </div>
                                  )}
                                  {txn.pricePerUnit != null && (
                                    <div>
                                      <p className="text-[11px] text-gray-400 uppercase">Unit Price</p>
                                      <p className="text-xs text-navy font-medium">
                                        ${txn.pricePerUnit}/{txn.unit}
                                      </p>
                                    </div>
                                  )}
                                  <div>
                                    <p className="text-[11px] text-gray-400 uppercase">{t.moneyTracker.date}</p>
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
          <h3 className="text-sm font-bold text-navy mb-3">{t.moneyTracker.incomeBySource}</h3>
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
              {incomeBreakdown.map((item, idx) => (
                  <div key={item.category} className="flex items-center gap-3">
                    <span
                      className={`w-3 h-3 rounded-full shrink-0 ${breakdownColors[idx % breakdownColors.length]}`}
                    />
                    <span className="text-xs text-gray-600 flex-1">{t.moneyTracker.categories[categoryTranslationKey[item.category]]}</span>
                    <span className="text-xs font-bold text-navy">${item.amount.toLocaleString()}</span>
                    <span className="text-[11px] text-gray-400 w-8 text-right">{item.percent}%</span>
                  </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* ================================================================= */}
        {/* 6. EXPENSES BY CATEGORY                                           */}
        {/* ================================================================= */}
        <motion.section variants={itemVariants} className="px-4">
          <h3 className="text-sm font-bold text-navy mb-3">{t.moneyTracker.expensesByCategory}</h3>
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
              {expenseBreakdown.map((item, idx) => (
                  <div key={item.category} className="flex items-center gap-3">
                    <span
                      className={`w-3 h-3 rounded-full shrink-0 ${breakdownColors[idx % breakdownColors.length]}`}
                    />
                    <span className="text-xs text-gray-600 flex-1">{t.moneyTracker.categories[categoryTranslationKey[item.category]]}</span>
                    <span className="text-xs font-bold text-navy">${item.amount.toLocaleString()}</span>
                    <span className="text-[11px] text-gray-400 w-8 text-right">{item.percent}%</span>
                  </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* ================================================================= */}
        {/* 7. AI INSIGHT CARD                                                */}
        {/* ================================================================= */}
        <motion.section variants={itemVariants} className="px-4 pb-2">
          <div className="rounded-2xl bg-gradient-to-br from-[#8CB89C] to-[#729E82] p-4 text-white relative overflow-hidden">
            {/* Decorative */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full" />
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/5 rounded-full" />

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={16} className="text-gold" />
                <span className="text-xs font-bold text-white/80 uppercase tracking-wide">
                  {t.moneyTracker.aiInsight}
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
                {t.moneyTracker.talkToAI}
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
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center"
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              variants={modalContentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl p-5 pb-8 max-h-[85vh] overflow-y-auto"
            >
              {/* Modal header */}
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-navy">
                  {modalType === 'income' ? t.moneyTracker.addIncome : t.moneyTracker.addExpense}
                </h2>
                <button
                  onClick={() => setModalOpen(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 active:bg-gray-200 transition-colors"
                >
                  <X size={18} className="text-gray-500" />
                </button>
              </div>

              {/* Amount input */}
              <div className="mb-5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                  {t.moneyTracker.amount} (USD)
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
                  {t.moneyTracker.category}
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
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
                            className={`text-[11px] font-medium leading-tight text-center ${
                              isSelected ? 'text-navy' : 'text-gray-500'
                            }`}
                          >
                            {t.moneyTracker.categories[categoryTranslationKey[cat]]}
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
                  {t.moneyTracker.description}
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
                  {t.moneyTracker.selectPlot}
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
                  {t.moneyTracker.date}
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
                disabled={!modalAmount || !modalCategory || savingTxn}
                className={`w-full py-4 rounded-xl text-white font-bold text-base transition-all min-h-[52px] flex items-center justify-center gap-2 ${
                  !modalAmount || !modalCategory || savingTxn
                    ? 'bg-gray-300 cursor-not-allowed'
                    : modalType === 'income'
                      ? 'bg-green-500 active:bg-green-600 shadow-lg shadow-green-500/25'
                      : 'bg-red-500 active:bg-red-600 shadow-lg shadow-red-500/25'
                }`}
              >
                {savingTxn ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    Saving...
                  </>
                ) : (
                  modalType === 'income' ? `${t.common.save} ${t.moneyTracker.income}` : `${t.common.save} ${t.moneyTracker.expenses}`
                )}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
