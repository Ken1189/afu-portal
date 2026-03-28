'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet,
  ArrowDownToLine,
  ArrowUpFromLine,
  Send,
  QrCode,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  X,
  Loader2,
  Phone,
  Building2,
  CreditCard,
  Calendar,
  TrendingUp,
  TrendingDown,
  Clock,
  RefreshCw,
  Shield,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/supabase/auth-context';

// ─── Types ────────────────────────────────────────────────────────────────

interface WalletAccount {
  id: string;
  user_id: string;
  account_number: string;
  account_type: string;
  currency: string;
  display_name: string | null;
  status: string;
  balance?: number;
  created_at: string;
}

interface WalletTransaction {
  id: string;
  wallet_id: string;
  type: string;
  amount: number;
  currency: string;
  balance_after: number;
  description: string | null;
  reference: string | null;
  counterparty: string | null;
  status: string;
  created_at: string;
}

interface AutoDeduction {
  id: string;
  label: string;
  type: 'loan' | 'insurance' | 'subscription';
  amount: number;
  currency: string;
  nextDate: string;
  frequency: string;
}

type ModalType = 'deposit' | 'withdraw' | 'transfer' | 'qr' | null;
type TxnFilter = 'all' | 'deposit' | 'withdrawal' | 'transfer' | 'payment';

// ─── Constants ────────────────────────────────────────────────────────────

const MOBILE_MONEY_METHODS = [
  { id: 'mpesa', label: 'M-Pesa', icon: '🇰🇪', countries: 'Kenya, Tanzania' },
  { id: 'ecocash', label: 'EcoCash', icon: '🇿🇼', countries: 'Zimbabwe' },
  { id: 'mtn', label: 'MTN MoMo', icon: '🇺🇬', countries: 'Uganda, Ghana, Rwanda' },
  { id: 'orange', label: 'Orange Money', icon: '🇸🇳', countries: 'Senegal, Mali, Cameroon' },
  { id: 'bank', label: 'Bank Transfer', icon: '🏦', countries: 'All countries' },
];

const EXCHANGE_RATE = 0.92; // USD equivalent approximation

// ─── Demo Data ────────────────────────────────────────────────────────────

const demoWallet: WalletAccount = {
  id: 'demo-wallet-001',
  user_id: 'demo',
  account_number: 'AFU-2026-00471',
  account_type: 'savings',
  currency: 'USD',
  display_name: 'Main Wallet',
  status: 'active',
  balance: 2847.50,
  created_at: '2025-09-15T10:00:00Z',
};

const demoTransactions: WalletTransaction[] = [
  { id: 'txn-001', wallet_id: 'demo-wallet-001', type: 'deposit', amount: 500, currency: 'USD', balance_after: 2847.50, description: 'M-Pesa deposit', reference: 'MPE-20260325-001', counterparty: null, status: 'completed', created_at: '2026-03-25T14:30:00Z' },
  { id: 'txn-002', wallet_id: 'demo-wallet-001', type: 'payment', amount: 85, currency: 'USD', balance_after: 2347.50, description: 'Fertilizer purchase — AgriSupply', reference: 'PAY-20260323-002', counterparty: 'AgriSupply Ltd', status: 'completed', created_at: '2026-03-23T09:15:00Z' },
  { id: 'txn-003', wallet_id: 'demo-wallet-001', type: 'transfer', amount: 150, currency: 'USD', balance_after: 2432.50, description: 'P2P transfer to John Mutua', reference: 'TRF-20260322-001', counterparty: 'John Mutua', status: 'completed', created_at: '2026-03-22T16:45:00Z' },
  { id: 'txn-004', wallet_id: 'demo-wallet-001', type: 'withdrawal', amount: 200, currency: 'USD', balance_after: 2582.50, description: 'EcoCash withdrawal', reference: 'WDR-20260320-003', counterparty: null, status: 'completed', created_at: '2026-03-20T11:00:00Z' },
  { id: 'txn-005', wallet_id: 'demo-wallet-001', type: 'deposit', amount: 1200, currency: 'USD', balance_after: 2782.50, description: 'Harvest sale — FreshPack Exports', reference: 'DEP-20260318-001', counterparty: 'FreshPack Exports', status: 'completed', created_at: '2026-03-18T08:30:00Z' },
  { id: 'txn-006', wallet_id: 'demo-wallet-001', type: 'payment', amount: 45, currency: 'USD', balance_after: 1582.50, description: 'Insurance premium — crop cover', reference: 'PAY-20260315-004', counterparty: 'AFU Insurance', status: 'completed', created_at: '2026-03-15T10:00:00Z' },
  { id: 'txn-007', wallet_id: 'demo-wallet-001', type: 'withdrawal', amount: 300, currency: 'USD', balance_after: 1627.50, description: 'Bank withdrawal to Standard Bank', reference: 'WDR-20260312-002', counterparty: null, status: 'completed', created_at: '2026-03-12T14:20:00Z' },
  { id: 'txn-008', wallet_id: 'demo-wallet-001', type: 'deposit', amount: 350, currency: 'USD', balance_after: 1927.50, description: 'Contract payment — SesaMe Trading', reference: 'DEP-20260310-003', counterparty: 'SesaMe Trading', status: 'completed', created_at: '2026-03-10T09:00:00Z' },
  { id: 'txn-009', wallet_id: 'demo-wallet-001', type: 'transfer', amount: 75, currency: 'USD', balance_after: 1577.50, description: 'P2P transfer to Grace Banda', reference: 'TRF-20260308-001', counterparty: 'Grace Banda', status: 'completed', created_at: '2026-03-08T13:15:00Z' },
  { id: 'txn-010', wallet_id: 'demo-wallet-001', type: 'deposit', amount: 200, currency: 'USD', balance_after: 1652.50, description: 'AFU subsidy — Q1 input support', reference: 'DEP-20260301-001', counterparty: 'AFU', status: 'completed', created_at: '2026-03-01T08:00:00Z' },
];

const demoDeductions: AutoDeduction[] = [
  { id: 'ded-001', label: 'Micro-loan repayment', type: 'loan', amount: 45, currency: 'USD', nextDate: '2026-04-01', frequency: 'Monthly' },
  { id: 'ded-002', label: 'Crop insurance premium', type: 'insurance', amount: 22, currency: 'USD', nextDate: '2026-04-15', frequency: 'Monthly' },
  { id: 'ded-003', label: 'Equipment lease', type: 'subscription', amount: 30, currency: 'USD', nextDate: '2026-04-01', frequency: 'Monthly' },
];

const demoMonthlySummary = [
  { month: 'Oct', income: 1200, expenses: 380 },
  { month: 'Nov', income: 950, expenses: 420 },
  { month: 'Dec', income: 1800, expenses: 510 },
  { month: 'Jan', income: 1100, expenses: 350 },
  { month: 'Feb', income: 1450, expenses: 480 },
  { month: 'Mar', income: 2250, expenses: 555 },
];

// ─── Toast Component ──────────────────────────────────────────────────────

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`fixed top-4 right-4 z-[100] px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium ${
        type === 'success' ? 'bg-[#5DB347]' : 'bg-red-600'
      }`}
    >
      {message}
    </motion.div>
  );
}

// ─── Simple QR Code SVG Generator ─────────────────────────────────────────

function generateQRModules(data: string): boolean[][] {
  // Simple deterministic pattern based on data hash — visual placeholder
  const size = 21;
  const grid: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  // Finder patterns (top-left, top-right, bottom-left)
  const drawFinder = (r: number, c: number) => {
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 7; j++) {
        const isBorder = i === 0 || i === 6 || j === 0 || j === 6;
        const isInner = i >= 2 && i <= 4 && j >= 2 && j <= 4;
        grid[r + i][c + j] = isBorder || isInner;
      }
    }
  };
  drawFinder(0, 0);
  drawFinder(0, 14);
  drawFinder(14, 0);

  // Data area fill based on string hash
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    hash = ((hash << 5) - hash + data.charCodeAt(i)) | 0;
  }
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c]) continue;
      // Skip timing patterns
      if (r === 6 || c === 6) { grid[r][c] = (r + c) % 2 === 0; continue; }
      // Skip finder areas + separators
      if ((r < 9 && c < 9) || (r < 9 && c > 12) || (r > 12 && c < 9)) continue;
      hash = ((hash << 5) - hash + r * 31 + c * 17) | 0;
      grid[r][c] = (Math.abs(hash) % 3) !== 0;
    }
  }
  return grid;
}

function QRCodeSVG({ data, size = 180 }: { data: string; size?: number }) {
  const modules = useMemo(() => generateQRModules(data), [data]);
  const moduleSize = size / modules.length;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rounded-lg">
      <rect width={size} height={size} fill="white" />
      {modules.map((row, r) =>
        row.map((cell, c) =>
          cell ? (
            <rect
              key={`${r}-${c}`}
              x={c * moduleSize}
              y={r * moduleSize}
              width={moduleSize}
              height={moduleSize}
              fill="#1B2A4A"
              rx={moduleSize * 0.15}
            />
          ) : null
        )
      )}
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function WalletPage() {
  const { user } = useAuth();
  const supabase = createClient();

  // ── State ─────────────────────────────────────────────────────────────
  const [wallet, setWallet] = useState<WalletAccount | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [deductions] = useState<AutoDeduction[]>(demoDeductions);
  const [monthlySummary] = useState(demoMonthlySummary);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [txnFilter, setTxnFilter] = useState<TxnFilter>('all');
  const [txnSearch, setTxnSearch] = useState('');
  const [txnPage, setTxnPage] = useState(1);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [copied, setCopied] = useState(false);

  // Modal form state
  const [depositMethod, setDepositMethod] = useState('mpesa');
  const [depositAmount, setDepositAmount] = useState('');
  const [depositStep, setDepositStep] = useState<'form' | 'confirm' | 'instructions'>('form');
  const [withdrawMethod, setWithdrawMethod] = useState('mpesa');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawDest, setWithdrawDest] = useState('');
  const [withdrawStep, setWithdrawStep] = useState<'form' | 'confirm'>('form');
  const [transferRecipient, setTransferRecipient] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferNote, setTransferNote] = useState('');
  const [transferStep, setTransferStep] = useState<'form' | 'confirm'>('form');
  const [modalLoading, setModalLoading] = useState(false);

  const TXN_PER_PAGE = 5;

  // ── Fetch Data ────────────────────────────────────────────────────────
  const fetchWalletData = useCallback(async () => {
    if (!user?.id) { setLoading(false); return; }
    setLoading(true);
    try {
      // Fetch wallet
      const { data: wallets } = await supabase
        .from('wallet_accounts')
        .select('*, ledger_accounts!wallet_accounts_ledger_account_id_fkey(balance)')
        .eq('user_id', user.id)
        .limit(1);

      if (wallets && wallets.length > 0) {
        const w = wallets[0];
        const ledger = (w as any).ledger_accounts;
        setWallet({
          ...w,
          balance: ledger?.balance ?? 0,
        });

        // Fetch transactions
        const { data: txns } = await supabase
          .from('wallet_transactions')
          .select('*')
          .eq('wallet_id', w.id)
          .order('created_at', { ascending: false })
          .limit(50);

        if (txns && txns.length > 0) {
          setTransactions(txns);
        } else {
          setTransactions(demoTransactions);
        }
      } else {
        // Fallback to demo
        setWallet(demoWallet);
        setTransactions(demoTransactions);
      }
    } catch {
      setWallet(demoWallet);
      setTransactions(demoTransactions);
    } finally {
      setLoading(false);
    }
  }, [user?.id, supabase]);

  useEffect(() => { fetchWalletData(); }, [fetchWalletData]);

  // ── Filtered Transactions ─────────────────────────────────────────────
  const filteredTxns = useMemo(() => {
    let result = transactions;
    if (txnFilter !== 'all') {
      result = result.filter((t) => t.type === txnFilter);
    }
    if (txnSearch.trim()) {
      const q = txnSearch.toLowerCase();
      result = result.filter(
        (t) =>
          (t.description?.toLowerCase().includes(q)) ||
          (t.reference?.toLowerCase().includes(q)) ||
          (t.counterparty?.toLowerCase().includes(q))
      );
    }
    return result;
  }, [transactions, txnFilter, txnSearch]);

  const totalPages = Math.max(1, Math.ceil(filteredTxns.length / TXN_PER_PAGE));
  const pagedTxns = filteredTxns.slice((txnPage - 1) * TXN_PER_PAGE, txnPage * TXN_PER_PAGE);

  // ── Helpers ───────────────────────────────────────────────────────────
  const showToast = (message: string, type: 'success' | 'error' = 'success') => setToast({ message, type });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast('Copied to clipboard');
  };

  const resetModals = () => {
    setDepositAmount('');
    setDepositMethod('mpesa');
    setDepositStep('form');
    setWithdrawAmount('');
    setWithdrawMethod('mpesa');
    setWithdrawDest('');
    setWithdrawStep('form');
    setTransferRecipient('');
    setTransferAmount('');
    setTransferNote('');
    setTransferStep('form');
    setModalLoading(false);
  };

  const openModal = (type: ModalType) => {
    resetModals();
    setActiveModal(type);
  };

  const closeModal = () => {
    setActiveModal(null);
    resetModals();
  };

  // ── API Calls ─────────────────────────────────────────────────────────
  const handleDeposit = async () => {
    if (!wallet || !depositAmount) return;
    setModalLoading(true);
    try {
      const res = await fetch('/api/banking/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'deposit',
          wallet_id: wallet.id,
          amount: parseFloat(depositAmount),
          description: `${MOBILE_MONEY_METHODS.find((m) => m.id === depositMethod)?.label} deposit`,
          reference: `DEP-${Date.now()}`,
        }),
      });
      if (!res.ok) throw new Error('Deposit failed');
      setDepositStep('instructions');
      showToast('Deposit initiated successfully');
      fetchWalletData();
    } catch {
      showToast('Deposit failed. Please try again.', 'error');
    } finally {
      setModalLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!wallet || !withdrawAmount) return;
    setModalLoading(true);
    try {
      const res = await fetch('/api/banking/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'withdraw',
          wallet_id: wallet.id,
          amount: parseFloat(withdrawAmount),
          description: `${MOBILE_MONEY_METHODS.find((m) => m.id === withdrawMethod)?.label} withdrawal to ${withdrawDest}`,
          reference: `WDR-${Date.now()}`,
        }),
      });
      if (!res.ok) throw new Error('Withdrawal failed');
      closeModal();
      showToast('Withdrawal request submitted');
      fetchWalletData();
    } catch {
      showToast('Withdrawal failed. Please try again.', 'error');
    } finally {
      setModalLoading(false);
    }
  };

  const handleTransfer = async () => {
    if (!wallet || !transferAmount || !transferRecipient) return;
    setModalLoading(true);
    try {
      const res = await fetch('/api/banking/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'transfer',
          from_wallet_id: wallet.id,
          to_wallet_id: transferRecipient, // In production this would resolve from search
          amount: parseFloat(transferAmount),
          description: transferNote || `P2P transfer`,
          reference: `TRF-${Date.now()}`,
        }),
      });
      if (!res.ok) throw new Error('Transfer failed');
      closeModal();
      showToast('Transfer completed successfully');
      fetchWalletData();
    } catch {
      showToast('Transfer failed. Please try again.', 'error');
    } finally {
      setModalLoading(false);
    }
  };

  const txnTypeIcon = (type: string) => {
    switch (type) {
      case 'deposit': return <ArrowDownToLine className="w-4 h-4 text-[#5DB347]" />;
      case 'withdrawal': return <ArrowUpFromLine className="w-4 h-4 text-red-500" />;
      case 'transfer': return <Send className="w-4 h-4 text-blue-500" />;
      case 'payment': return <CreditCard className="w-4 h-4 text-amber-600" />;
      default: return <Wallet className="w-4 h-4 text-gray-400" />;
    }
  };

  const txnTypeColor = (type: string) => {
    switch (type) {
      case 'deposit': return 'text-[#5DB347]';
      case 'withdrawal': return 'text-red-500';
      case 'transfer': return 'text-blue-500';
      case 'payment': return 'text-amber-600';
      default: return 'text-gray-500';
    }
  };

  const formatCurrency = (amount: number, currency = 'USD') =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 2 }).format(amount);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  // ── Loading ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#5DB347] mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading wallet...</p>
        </div>
      </div>
    );
  }

  const balance = wallet?.balance ?? 0;
  const localEquiv = balance * EXCHANGE_RATE;

  // ═════════════════════════════════════════════════════════════════════════
  //  RENDER
  // ═════════════════════════════════════════════════════════════════════════

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">Digital Wallet</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your AFU credits, send and receive funds</p>
        </div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#1B2A4A] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </div>

      {/* ── Balance Card ─────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-[#1B2A4A] to-[#2d4470] rounded-2xl p-6 sm:p-8 text-white shadow-xl"
      >
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="text-sm text-gray-300 mb-1">Available Balance</p>
            <p className="text-4xl sm:text-5xl font-bold tracking-tight">
              {formatCurrency(balance, wallet?.currency)}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              ≈ {formatCurrency(localEquiv, 'EUR')} equivalent
            </p>
            <div className="flex items-center gap-2 mt-3">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10 text-xs text-gray-300">
                <Wallet className="w-3 h-3" />
                {wallet?.account_number || 'AFU-XXXX'}
              </span>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
                wallet?.status === 'active' ? 'bg-[#5DB347]/20 text-green-300' : 'bg-red-500/20 text-red-300'
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                {wallet?.status || 'Active'}
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => openModal('deposit')}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#5DB347] hover:bg-[#4ea03d] text-white rounded-xl font-medium text-sm transition-colors shadow-lg"
            >
              <ArrowDownToLine className="w-4 h-4" /> Deposit
            </button>
            <button
              onClick={() => openModal('withdraw')}
              className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium text-sm transition-colors border border-white/20"
            >
              <ArrowUpFromLine className="w-4 h-4" /> Withdraw
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── Quick Actions Row ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: ArrowDownToLine, label: 'Deposit', color: 'bg-green-50 text-[#5DB347]', modal: 'deposit' as ModalType },
          { icon: ArrowUpFromLine, label: 'Withdraw', color: 'bg-red-50 text-red-500', modal: 'withdraw' as ModalType },
          { icon: Send, label: 'Transfer', color: 'bg-blue-50 text-blue-500', modal: 'transfer' as ModalType },
          { icon: QrCode, label: 'Scan QR', color: 'bg-purple-50 text-purple-500', modal: 'qr' as ModalType },
        ].map((action) => (
          <motion.button
            key={action.label}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => openModal(action.modal)}
            className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all"
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${action.color}`}>
              <action.icon className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-[#1B2A4A]">{action.label}</span>
          </motion.button>
        ))}
      </div>

      {/* ── Main Content Grid ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Transactions (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Transaction History */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h2 className="text-lg font-semibold text-[#1B2A4A]">Transaction History</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search transactions..."
                    value={txnSearch}
                    onChange={(e) => { setTxnSearch(e.target.value); setTxnPage(1); }}
                    className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] w-full sm:w-64"
                  />
                </div>
              </div>
              {/* Filter tabs */}
              <div className="flex gap-2 mt-3 overflow-x-auto">
                {(['all', 'deposit', 'withdrawal', 'transfer', 'payment'] as TxnFilter[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => { setTxnFilter(f); setTxnPage(1); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                      txnFilter === f
                        ? 'bg-[#1B2A4A] text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Transactions list */}
            <div className="divide-y divide-gray-50">
              {pagedTxns.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm">
                  No transactions found
                </div>
              ) : (
                pagedTxns.map((txn) => (
                  <div key={txn.id} className="flex items-center gap-3 px-4 sm:px-5 py-3 hover:bg-gray-50/50 transition-colors">
                    <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                      {txnTypeIcon(txn.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1B2A4A] truncate">
                        {txn.description || txn.type}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatDate(txn.created_at)} &middot; {formatTime(txn.created_at)}
                        {txn.reference && <> &middot; {txn.reference}</>}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`text-sm font-semibold ${
                        txn.type === 'deposit' ? 'text-[#5DB347]' : 'text-[#1B2A4A]'
                      }`}>
                        {txn.type === 'deposit' ? '+' : '-'}{formatCurrency(txn.amount, txn.currency)}
                      </p>
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${
                        txn.status === 'completed' ? 'bg-green-50 text-[#5DB347]' :
                        txn.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                        'bg-gray-50 text-gray-500'
                      }`}>
                        {txn.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  Page {txnPage} of {totalPages} ({filteredTxns.length} results)
                </p>
                <div className="flex gap-1">
                  <button
                    onClick={() => setTxnPage((p) => Math.max(1, p - 1))}
                    disabled={txnPage === 1}
                    className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setTxnPage((p) => Math.min(totalPages, p + 1))}
                    disabled={txnPage === totalPages}
                    className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Monthly Summary Chart */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5">
            <h2 className="text-lg font-semibold text-[#1B2A4A] mb-4">Monthly Summary</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlySummary} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" fontSize={12} tickLine={false} stroke="#999" />
                  <YAxis fontSize={12} tickLine={false} stroke="#999" tickFormatter={(v) => `$${v}`} />
                  <Tooltip
                    formatter={(value) => [`$${value}`, '']}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '13px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="income" name="Income" fill="#5DB347" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" name="Expenses" fill="#1B2A4A" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          {/* QR Code Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-base font-semibold text-[#1B2A4A] mb-3">Receive Payments</h3>
            <div className="flex flex-col items-center">
              <div className="p-3 bg-gray-50 rounded-xl mb-3">
                <QRCodeSVG data={`afu:pay:${wallet?.account_number || 'AFU-XXXX'}`} size={160} />
              </div>
              <p className="text-xs text-gray-500 mb-2">Scan to pay me</p>
              <button
                onClick={() => copyToClipboard(wallet?.account_number || 'AFU-XXXX')}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium text-[#1B2A4A] transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#5DB347]" /> : <Copy className="w-3.5 h-3.5" />}
                {wallet?.account_number || 'AFU-XXXX'}
              </button>
            </div>
          </div>

          {/* Auto-Deductions */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-base font-semibold text-[#1B2A4A] mb-3">Scheduled Deductions</h3>
            <div className="space-y-3">
              {deductions.map((d) => (
                <div key={d.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    d.type === 'loan' ? 'bg-amber-100 text-amber-600' :
                    d.type === 'insurance' ? 'bg-blue-100 text-blue-600' :
                    'bg-purple-100 text-purple-600'
                  }`}>
                    {d.type === 'loan' ? <CreditCard className="w-4 h-4" /> :
                     d.type === 'insurance' ? <Shield className="w-4 h-4" /> :
                     <RefreshCw className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1B2A4A] truncate">{d.label}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(d.nextDate)} &middot; {d.frequency}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-[#1B2A4A]">
                    -{formatCurrency(d.amount, d.currency)}
                  </p>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-3 text-center">
              Total upcoming: {formatCurrency(deductions.reduce((s, d) => s + d.amount, 0))}
            </p>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/*  MODALS                                                            */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {activeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* ── Deposit Modal ──────────────────────────────────────── */}
              {activeModal === 'deposit' && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-bold text-[#1B2A4A]">Deposit Funds</h3>
                    <button onClick={closeModal} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                      <X className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>

                  {depositStep === 'form' && (
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Payment Method</label>
                        <div className="space-y-2">
                          {MOBILE_MONEY_METHODS.map((m) => (
                            <button
                              key={m.id}
                              onClick={() => setDepositMethod(m.id)}
                              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                                depositMethod === m.id
                                  ? 'border-[#5DB347] bg-green-50/50 ring-1 ring-[#5DB347]/20'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <span className="text-xl">{m.icon}</span>
                              <div>
                                <p className="text-sm font-medium text-[#1B2A4A]">{m.label}</p>
                                <p className="text-xs text-gray-400">{m.countries}</p>
                              </div>
                              {depositMethod === m.id && <Check className="w-4 h-4 text-[#5DB347] ml-auto" />}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1.5 block">Amount (USD)</label>
                        <input
                          type="number"
                          min="1"
                          step="0.01"
                          placeholder="0.00"
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-lg font-semibold text-[#1B2A4A] focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
                        />
                      </div>
                      <button
                        onClick={() => depositAmount && parseFloat(depositAmount) > 0 && setDepositStep('confirm')}
                        disabled={!depositAmount || parseFloat(depositAmount) <= 0}
                        className="w-full py-3 bg-[#5DB347] hover:bg-[#4ea03d] disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-xl font-medium transition-colors"
                      >
                        Continue
                      </button>
                    </div>
                  )}

                  {depositStep === 'confirm' && (
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 rounded-xl space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Method</span>
                          <span className="font-medium text-[#1B2A4A]">
                            {MOBILE_MONEY_METHODS.find((m) => m.id === depositMethod)?.label}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Amount</span>
                          <span className="font-semibold text-[#1B2A4A]">{formatCurrency(parseFloat(depositAmount))}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Fee</span>
                          <span className="font-medium text-gray-600">$0.00</span>
                        </div>
                        <div className="border-t pt-2 flex justify-between text-sm">
                          <span className="text-gray-500">Total</span>
                          <span className="font-bold text-[#5DB347]">{formatCurrency(parseFloat(depositAmount))}</span>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setDepositStep('form')}
                          className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-[#1B2A4A] rounded-xl font-medium transition-colors"
                        >
                          Back
                        </button>
                        <button
                          onClick={handleDeposit}
                          disabled={modalLoading}
                          className="flex-1 py-3 bg-[#5DB347] hover:bg-[#4ea03d] disabled:bg-gray-300 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                        >
                          {modalLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                          Confirm Deposit
                        </button>
                      </div>
                    </div>
                  )}

                  {depositStep === 'instructions' && (
                    <div className="space-y-4">
                      <div className="text-center p-4">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Check className="w-6 h-6 text-[#5DB347]" />
                        </div>
                        <p className="font-semibold text-[#1B2A4A]">Deposit Initiated</p>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-xl text-sm text-blue-800 space-y-2">
                        {depositMethod === 'bank' ? (
                          <>
                            <p className="font-medium">Bank Transfer Instructions:</p>
                            <p>Bank: Standard Chartered</p>
                            <p>Account: AFU Trust - 0284719302</p>
                            <p>Swift: SCBLZAJJ</p>
                            <p>Reference: {wallet?.account_number}</p>
                          </>
                        ) : (
                          <>
                            <p className="font-medium">Mobile Money Instructions:</p>
                            <p>1. Open {MOBILE_MONEY_METHODS.find((m) => m.id === depositMethod)?.label}</p>
                            <p>2. Select &ldquo;Pay Bill&rdquo; or &ldquo;Send Money&rdquo;</p>
                            <p>3. Enter Business Number: <strong>847291</strong></p>
                            <p>4. Account: <strong>{wallet?.account_number}</strong></p>
                            <p>5. Amount: <strong>{formatCurrency(parseFloat(depositAmount))}</strong></p>
                          </>
                        )}
                      </div>
                      <button
                        onClick={closeModal}
                        className="w-full py-3 bg-[#1B2A4A] hover:bg-[#152238] text-white rounded-xl font-medium transition-colors"
                      >
                        Done
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* ── Withdraw Modal ─────────────────────────────────────── */}
              {activeModal === 'withdraw' && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-bold text-[#1B2A4A]">Withdraw Funds</h3>
                    <button onClick={closeModal} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                      <X className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>

                  {withdrawStep === 'form' && (
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Withdrawal Method</label>
                        <div className="space-y-2">
                          {MOBILE_MONEY_METHODS.map((m) => (
                            <button
                              key={m.id}
                              onClick={() => setWithdrawMethod(m.id)}
                              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                                withdrawMethod === m.id
                                  ? 'border-[#5DB347] bg-green-50/50 ring-1 ring-[#5DB347]/20'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <span className="text-xl">{m.icon}</span>
                              <div>
                                <p className="text-sm font-medium text-[#1B2A4A]">{m.label}</p>
                                <p className="text-xs text-gray-400">{m.countries}</p>
                              </div>
                              {withdrawMethod === m.id && <Check className="w-4 h-4 text-[#5DB347] ml-auto" />}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1.5 block">Amount (USD)</label>
                        <input
                          type="number"
                          min="1"
                          step="0.01"
                          placeholder="0.00"
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-lg font-semibold text-[#1B2A4A] focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
                        />
                        <p className="text-xs text-gray-400 mt-1">
                          Available: {formatCurrency(balance)}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                          {withdrawMethod === 'bank' ? 'Bank Account Number' : 'Phone Number'}
                        </label>
                        <div className="relative">
                          {withdrawMethod === 'bank' ? (
                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          ) : (
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          )}
                          <input
                            type="text"
                            placeholder={withdrawMethod === 'bank' ? 'e.g. 0284719302' : 'e.g. +254 712 345 678'}
                            value={withdrawDest}
                            onChange={(e) => setWithdrawDest(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          if (withdrawAmount && parseFloat(withdrawAmount) > 0 && withdrawDest) {
                            if (parseFloat(withdrawAmount) > balance) {
                              showToast('Insufficient balance', 'error');
                              return;
                            }
                            setWithdrawStep('confirm');
                          }
                        }}
                        disabled={!withdrawAmount || !withdrawDest || parseFloat(withdrawAmount) <= 0}
                        className="w-full py-3 bg-[#5DB347] hover:bg-[#4ea03d] disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-xl font-medium transition-colors"
                      >
                        Continue
                      </button>
                    </div>
                  )}

                  {withdrawStep === 'confirm' && (
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 rounded-xl space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Method</span>
                          <span className="font-medium text-[#1B2A4A]">
                            {MOBILE_MONEY_METHODS.find((m) => m.id === withdrawMethod)?.label}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Destination</span>
                          <span className="font-medium text-[#1B2A4A]">{withdrawDest}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Amount</span>
                          <span className="font-semibold text-[#1B2A4A]">{formatCurrency(parseFloat(withdrawAmount))}</span>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setWithdrawStep('form')}
                          className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-[#1B2A4A] rounded-xl font-medium transition-colors"
                        >
                          Back
                        </button>
                        <button
                          onClick={handleWithdraw}
                          disabled={modalLoading}
                          className="flex-1 py-3 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                        >
                          {modalLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                          Confirm Withdrawal
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── Transfer Modal ─────────────────────────────────────── */}
              {activeModal === 'transfer' && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-bold text-[#1B2A4A]">Send Money</h3>
                    <button onClick={closeModal} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                      <X className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>

                  {transferStep === 'form' && (
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1.5 block">Recipient (name, email, or phone)</label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search by name, email, or phone..."
                            value={transferRecipient}
                            onChange={(e) => setTransferRecipient(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1.5 block">Amount (USD)</label>
                        <input
                          type="number"
                          min="1"
                          step="0.01"
                          placeholder="0.00"
                          value={transferAmount}
                          onChange={(e) => setTransferAmount(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-lg font-semibold text-[#1B2A4A] focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
                        />
                        <p className="text-xs text-gray-400 mt-1">
                          Available: {formatCurrency(balance)}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1.5 block">Note (optional)</label>
                        <input
                          type="text"
                          placeholder="What is this for?"
                          value={transferNote}
                          onChange={(e) => setTransferNote(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
                        />
                      </div>
                      <button
                        onClick={() => {
                          if (transferRecipient && transferAmount && parseFloat(transferAmount) > 0) {
                            if (parseFloat(transferAmount) > balance) {
                              showToast('Insufficient balance', 'error');
                              return;
                            }
                            setTransferStep('confirm');
                          }
                        }}
                        disabled={!transferRecipient || !transferAmount || parseFloat(transferAmount) <= 0}
                        className="w-full py-3 bg-[#5DB347] hover:bg-[#4ea03d] disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-xl font-medium transition-colors"
                      >
                        Continue
                      </button>
                    </div>
                  )}

                  {transferStep === 'confirm' && (
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 rounded-xl space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">To</span>
                          <span className="font-medium text-[#1B2A4A]">{transferRecipient}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Amount</span>
                          <span className="font-semibold text-[#1B2A4A]">{formatCurrency(parseFloat(transferAmount))}</span>
                        </div>
                        {transferNote && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Note</span>
                            <span className="text-gray-600">{transferNote}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setTransferStep('form')}
                          className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-[#1B2A4A] rounded-xl font-medium transition-colors"
                        >
                          Back
                        </button>
                        <button
                          onClick={handleTransfer}
                          disabled={modalLoading}
                          className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                        >
                          {modalLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                          Send Money
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── QR Code Modal ──────────────────────────────────────── */}
              {activeModal === 'qr' && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-bold text-[#1B2A4A]">My QR Code</h3>
                    <button onClick={closeModal} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                      <X className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>
                  <div className="flex flex-col items-center space-y-4">
                    <div className="p-4 bg-white border-2 border-gray-100 rounded-2xl">
                      <QRCodeSVG data={`afu:pay:${wallet?.account_number || 'AFU-XXXX'}`} size={220} />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-[#1B2A4A]">{wallet?.display_name || 'My Wallet'}</p>
                      <p className="text-sm text-gray-500">{wallet?.account_number || 'AFU-XXXX'}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(wallet?.account_number || 'AFU-XXXX')}
                      className="flex items-center gap-2 px-4 py-2 bg-[#1B2A4A] hover:bg-[#152238] text-white rounded-xl text-sm font-medium transition-colors"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      Copy Wallet Address
                    </button>
                    <p className="text-xs text-gray-400 text-center">
                      Share this QR code to receive payments from other AFU members
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
