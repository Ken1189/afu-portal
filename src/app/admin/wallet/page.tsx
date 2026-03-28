'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Wallet,
  Users,
  Activity,
  AlertTriangle,
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  Shield,
  ShieldOff,
  Loader2,
  TrendingUp,
  Eye,
  X,
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

interface AdminWallet {
  id: string;
  user_id: string;
  account_number: string;
  account_type: string;
  currency: string;
  display_name: string | null;
  status: string;
  balance: number;
  created_at: string;
  user_email?: string;
  user_name?: string;
}

interface AdminTransaction {
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
  user_name?: string;
  user_email?: string;
}

interface TransactionFlag {
  id: string;
  transaction_id: string | null;
  wallet_txn_id: string | null;
  user_id: string | null;
  flag_type: string;
  severity: string;
  details: Record<string, unknown>;
  status: string;
  created_at: string;
}

interface VolumeData {
  date: string;
  deposits: number;
  withdrawals: number;
  transfers: number;
}

// ─── Demo Data ────────────────────────────────────────────────────────────

const demoWallets: AdminWallet[] = [
  { id: 'w-001', user_id: 'u-001', account_number: 'AFU-2026-00471', account_type: 'savings', currency: 'USD', display_name: 'Main Wallet', status: 'active', balance: 2847.50, created_at: '2025-09-15T10:00:00Z', user_name: 'Grace Banda', user_email: 'grace@example.com' },
  { id: 'w-002', user_id: 'u-002', account_number: 'AFU-2026-00472', account_type: 'savings', currency: 'USD', display_name: 'Farm Account', status: 'active', balance: 5230.00, created_at: '2025-10-01T08:00:00Z', user_name: 'John Mutua', user_email: 'john@example.com' },
  { id: 'w-003', user_id: 'u-003', account_number: 'AFU-2026-00473', account_type: 'savings', currency: 'KES', display_name: null, status: 'active', balance: 185400, created_at: '2025-11-20T14:00:00Z', user_name: 'Mary Njeri', user_email: 'mary@example.com' },
  { id: 'w-004', user_id: 'u-004', account_number: 'AFU-2026-00474', account_type: 'savings', currency: 'USD', display_name: 'Savings', status: 'frozen', balance: 12050.00, created_at: '2025-08-05T09:00:00Z', user_name: 'Tendai Moyo', user_email: 'tendai@example.com' },
  { id: 'w-005', user_id: 'u-005', account_number: 'AFU-2026-00475', account_type: 'savings', currency: 'ZAR', display_name: null, status: 'active', balance: 44200, created_at: '2026-01-10T11:00:00Z', user_name: 'Sipho Dlamini', user_email: 'sipho@example.com' },
  { id: 'w-006', user_id: 'u-006', account_number: 'AFU-2026-00476', account_type: 'savings', currency: 'USD', display_name: 'Primary', status: 'active', balance: 890.25, created_at: '2026-02-01T07:30:00Z', user_name: 'Aisha Ibrahim', user_email: 'aisha@example.com' },
];

const demoAdminTxns: AdminTransaction[] = [
  { id: 'at-001', wallet_id: 'w-001', type: 'deposit', amount: 500, currency: 'USD', balance_after: 2847.50, description: 'M-Pesa deposit', reference: 'MPE-001', counterparty: null, status: 'completed', created_at: '2026-03-25T14:30:00Z', user_name: 'Grace Banda', user_email: 'grace@example.com' },
  { id: 'at-002', wallet_id: 'w-002', type: 'withdrawal', amount: 200, currency: 'USD', balance_after: 5030.00, description: 'Bank withdrawal', reference: 'WDR-002', counterparty: null, status: 'completed', created_at: '2026-03-25T11:15:00Z', user_name: 'John Mutua', user_email: 'john@example.com' },
  { id: 'at-003', wallet_id: 'w-003', type: 'transfer', amount: 15000, currency: 'KES', balance_after: 170400, description: 'P2P transfer', reference: 'TRF-003', counterparty: 'James Otieno', status: 'completed', created_at: '2026-03-24T16:45:00Z', user_name: 'Mary Njeri', user_email: 'mary@example.com' },
  { id: 'at-004', wallet_id: 'w-004', type: 'deposit', amount: 3000, currency: 'USD', balance_after: 12050, description: 'Large cash deposit', reference: 'DEP-004', counterparty: null, status: 'pending', created_at: '2026-03-24T09:00:00Z', user_name: 'Tendai Moyo', user_email: 'tendai@example.com' },
  { id: 'at-005', wallet_id: 'w-001', type: 'payment', amount: 85, currency: 'USD', balance_after: 2347.50, description: 'Fertilizer purchase', reference: 'PAY-005', counterparty: 'AgriSupply Ltd', status: 'completed', created_at: '2026-03-23T09:15:00Z', user_name: 'Grace Banda', user_email: 'grace@example.com' },
  { id: 'at-006', wallet_id: 'w-005', type: 'deposit', amount: 8500, currency: 'ZAR', balance_after: 44200, description: 'Harvest sale', reference: 'DEP-006', counterparty: 'FreshMark', status: 'completed', created_at: '2026-03-22T10:30:00Z', user_name: 'Sipho Dlamini', user_email: 'sipho@example.com' },
  { id: 'at-007', wallet_id: 'w-006', type: 'transfer', amount: 150, currency: 'USD', balance_after: 890.25, description: 'Seed purchase', reference: 'TRF-007', counterparty: 'Grace Banda', status: 'completed', created_at: '2026-03-21T14:00:00Z', user_name: 'Aisha Ibrahim', user_email: 'aisha@example.com' },
  { id: 'at-008', wallet_id: 'w-002', type: 'deposit', amount: 1200, currency: 'USD', balance_after: 5230, description: 'Contract payment', reference: 'DEP-008', counterparty: 'SesaMe Trading', status: 'completed', created_at: '2026-03-20T08:00:00Z', user_name: 'John Mutua', user_email: 'john@example.com' },
];

const demoFlags: TransactionFlag[] = [
  { id: 'f-001', transaction_id: null, wallet_txn_id: 'at-004', user_id: 'u-004', flag_type: 'amount_threshold', severity: 'medium', details: { reason: 'Deposit exceeds $2,500 threshold' }, status: 'pending', created_at: '2026-03-24T09:01:00Z' },
  { id: 'f-002', transaction_id: null, wallet_txn_id: 'at-003', user_id: 'u-003', flag_type: 'velocity', severity: 'low', details: { reason: '5 transfers in 24 hours' }, status: 'investigating', created_at: '2026-03-24T17:00:00Z' },
  { id: 'f-003', transaction_id: null, wallet_txn_id: null, user_id: 'u-004', flag_type: 'unusual_pattern', severity: 'high', details: { reason: 'Account frozen — multiple failed withdrawal attempts' }, status: 'escalated', created_at: '2026-03-23T12:00:00Z' },
];

function generateVolumeData(): VolumeData[] {
  const data: VolumeData[] = [];
  const now = new Date('2026-03-28');
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    data.push({
      date: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      deposits: Math.floor(Math.random() * 15000) + 2000,
      withdrawals: Math.floor(Math.random() * 8000) + 1000,
      transfers: Math.floor(Math.random() * 5000) + 500,
    });
  }
  return data;
}

// ═══════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function AdminWalletPage() {
  const { user } = useAuth();
  const supabase = createClient();

  const [wallets, setWallets] = useState<AdminWallet[]>([]);
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [flags, setFlags] = useState<TransactionFlag[]>([]);
  const [volumeData] = useState<VolumeData[]>(() => generateVolumeData());
  const [loading, setLoading] = useState(true);
  const [txnSearch, setTxnSearch] = useState('');
  const [walletSearch, setWalletSearch] = useState('');
  const [txnPage, setTxnPage] = useState(1);
  const [walletPage, setWalletPage] = useState(1);
  const [freezingId, setFreezingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const TXN_PER_PAGE = 6;
  const WALLET_PER_PAGE = 5;

  // ── Toast ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  // ── Fetch Data ────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch all wallets
      const { data: walletData } = await supabase
        .from('wallet_accounts')
        .select('*, ledger_accounts!wallet_accounts_ledger_account_id_fkey(balance), profiles!wallet_accounts_user_id_fkey(full_name, email)')
        .order('created_at', { ascending: false });

      if (walletData && walletData.length > 0) {
        setWallets(walletData.map((w: any) => ({
          ...w,
          balance: w.ledger_accounts?.balance ?? 0,
          user_name: w.profiles?.full_name || 'Unknown',
          user_email: w.profiles?.email || '',
        })));
      } else {
        setWallets(demoWallets);
      }

      // Fetch recent transactions
      const { data: txnData } = await supabase
        .from('wallet_transactions')
        .select('*, wallet_accounts!wallet_transactions_wallet_id_fkey(user_id, profiles!wallet_accounts_user_id_fkey(full_name, email))')
        .order('created_at', { ascending: false })
        .limit(100);

      if (txnData && txnData.length > 0) {
        setTransactions(txnData.map((t: any) => ({
          ...t,
          user_name: t.wallet_accounts?.profiles?.full_name || 'Unknown',
          user_email: t.wallet_accounts?.profiles?.email || '',
        })));
      } else {
        setTransactions(demoAdminTxns);
      }

      // Fetch flags
      const { data: flagData } = await supabase
        .from('transaction_flags')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (flagData && flagData.length > 0) {
        setFlags(flagData);
      } else {
        setFlags(demoFlags);
      }
    } catch {
      setWallets(demoWallets);
      setTransactions(demoAdminTxns);
      setFlags(demoFlags);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── KPIs ──────────────────────────────────────────────────────────────
  const kpis = useMemo(() => {
    const totalFloat = wallets
      .filter((w) => w.currency === 'USD')
      .reduce((s, w) => s + (w.balance || 0), 0);
    const totalWallets = wallets.length;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const activeWalletIds = new Set(
      transactions
        .filter((t) => new Date(t.created_at) >= thirtyDaysAgo)
        .map((t) => t.wallet_id)
    );
    const activeWallets = activeWalletIds.size;
    const flaggedCount = flags.filter((f) => f.status === 'pending' || f.status === 'investigating').length;

    return { totalFloat, totalWallets, activeWallets, flaggedCount };
  }, [wallets, transactions, flags]);

  // ── Filtered data ─────────────────────────────────────────────────────
  const filteredTxns = useMemo(() => {
    if (!txnSearch.trim()) return transactions;
    const q = txnSearch.toLowerCase();
    return transactions.filter(
      (t) =>
        (t.user_name?.toLowerCase().includes(q)) ||
        (t.user_email?.toLowerCase().includes(q)) ||
        (t.type.toLowerCase().includes(q)) ||
        (t.description?.toLowerCase().includes(q)) ||
        (t.reference?.toLowerCase().includes(q)) ||
        String(t.amount).includes(q)
    );
  }, [transactions, txnSearch]);

  const filteredWallets = useMemo(() => {
    if (!walletSearch.trim()) return wallets;
    const q = walletSearch.toLowerCase();
    return wallets.filter(
      (w) =>
        (w.user_name?.toLowerCase().includes(q)) ||
        (w.user_email?.toLowerCase().includes(q)) ||
        (w.account_number.toLowerCase().includes(q)) ||
        (w.status.toLowerCase().includes(q))
    );
  }, [wallets, walletSearch]);

  const txnTotalPages = Math.max(1, Math.ceil(filteredTxns.length / TXN_PER_PAGE));
  const pagedTxns = filteredTxns.slice((txnPage - 1) * TXN_PER_PAGE, txnPage * TXN_PER_PAGE);
  const walletTotalPages = Math.max(1, Math.ceil(filteredWallets.length / WALLET_PER_PAGE));
  const pagedWallets = filteredWallets.slice((walletPage - 1) * WALLET_PER_PAGE, walletPage * WALLET_PER_PAGE);

  // ── Freeze / Unfreeze ─────────────────────────────────────────────────
  const toggleFreeze = async (walletId: string, currentStatus: string) => {
    setFreezingId(walletId);
    const newStatus = currentStatus === 'frozen' ? 'active' : 'frozen';
    try {
      const { error } = await supabase
        .from('wallet_accounts')
        .update({ status: newStatus, frozen_at: newStatus === 'frozen' ? new Date().toISOString() : null })
        .eq('id', walletId);

      if (error) throw error;

      setWallets((prev) =>
        prev.map((w) => (w.id === walletId ? { ...w, status: newStatus } : w))
      );
      setToast({ message: `Wallet ${newStatus === 'frozen' ? 'frozen' : 'unfrozen'} successfully`, type: 'success' });
    } catch {
      setToast({ message: 'Failed to update wallet status', type: 'error' });
    } finally {
      setFreezingId(null);
    }
  };

  // ── Export CSV ─────────────────────────────────────────────────────────
  const exportCSV = () => {
    const headers = ['Date', 'User', 'Type', 'Amount', 'Currency', 'Description', 'Status', 'Reference'];
    const rows = transactions.map((t) => [
      new Date(t.created_at).toISOString(),
      t.user_name || '',
      t.type,
      t.amount,
      t.currency,
      t.description || '',
      t.status,
      t.reference || '',
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wallet-transactions-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setToast({ message: 'CSV exported successfully', type: 'success' });
  };

  // ── Helpers ───────────────────────────────────────────────────────────
  const formatCurrency = (amount: number, currency = 'USD') =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 2 }).format(amount);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const severityBadge = (severity: string) => {
    const styles: Record<string, string> = {
      low: 'bg-blue-50 text-blue-700',
      medium: 'bg-amber-50 text-amber-700',
      high: 'bg-orange-50 text-orange-700',
      critical: 'bg-red-50 text-red-700',
    };
    return styles[severity] || 'bg-gray-50 text-gray-700';
  };

  const flagStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-amber-50 text-amber-700',
      investigating: 'bg-blue-50 text-blue-700',
      cleared: 'bg-green-50 text-green-700',
      escalated: 'bg-red-50 text-red-700',
      reported: 'bg-purple-50 text-purple-700',
    };
    return styles[status] || 'bg-gray-50 text-gray-700';
  };

  // ── Loading ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#5DB347] mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading wallet data...</p>
        </div>
      </div>
    );
  }

  // ═════════════════════════════════════════════════════════════════════════
  //  RENDER
  // ═════════════════════════════════════════════════════════════════════════

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium ${
          toast.type === 'success' ? 'bg-[#5DB347]' : 'bg-red-600'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">Wallet Management</h1>
          <p className="text-sm text-gray-500 mt-1">Overview of all wallet accounts and transactions</p>
        </div>
        <button
          onClick={exportCSV}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#1B2A4A] hover:bg-[#152238] text-white rounded-xl text-sm font-medium transition-colors"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* ── KPI Cards ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total System Float', value: formatCurrency(kpis.totalFloat), icon: Wallet, color: 'bg-[#5DB347]/10 text-[#5DB347]' },
          { label: 'Total Wallets', value: kpis.totalWallets.toLocaleString(), icon: Users, color: 'bg-blue-50 text-blue-600' },
          { label: 'Active (30d)', value: kpis.activeWallets.toLocaleString(), icon: Activity, color: 'bg-purple-50 text-purple-600' },
          { label: 'Flagged Transactions', value: kpis.flaggedCount.toLocaleString(), icon: AlertTriangle, color: kpis.flaggedCount > 0 ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-500' },
        ].map((kpi) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">{kpi.label}</span>
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${kpi.color}`}>
                <kpi.icon className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-[#1B2A4A]">{kpi.value}</p>
          </motion.div>
        ))}
      </div>

      {/* ── Transaction Volume Chart ─────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h2 className="text-lg font-semibold text-[#1B2A4A] mb-4">Transaction Volume (30 Days)</h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={volumeData} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" fontSize={10} tickLine={false} stroke="#999" interval={4} />
              <YAxis fontSize={11} tickLine={false} stroke="#999" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(value) => [`$${Number(value).toLocaleString()}`, '']}
                contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="deposits" name="Deposits" fill="#5DB347" radius={[3, 3, 0, 0]} />
              <Bar dataKey="withdrawals" name="Withdrawals" fill="#1B2A4A" radius={[3, 3, 0, 0]} />
              <Bar dataKey="transfers" name="Transfers" fill="#6366f1" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Two-column: Transactions + Flags ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h2 className="text-lg font-semibold text-[#1B2A4A]">Recent Transactions</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by user, type, amount..."
                value={txnSearch}
                onChange={(e) => { setTxnSearch(e.target.value); setTxnPage(1); }}
                className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] w-full sm:w-56"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pagedTxns.map((txn) => (
                  <tr key={txn.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#1B2A4A]">{txn.user_name}</p>
                      <p className="text-xs text-gray-400">{txn.user_email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        txn.type === 'deposit' ? 'bg-green-50 text-[#5DB347]' :
                        txn.type === 'withdrawal' ? 'bg-red-50 text-red-600' :
                        txn.type === 'transfer' ? 'bg-blue-50 text-blue-600' :
                        'bg-amber-50 text-amber-600'
                      }`}>
                        {txn.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-[#1B2A4A]">
                      {formatCurrency(txn.amount, txn.currency)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                        txn.status === 'completed' ? 'bg-green-50 text-green-700' :
                        txn.status === 'pending' ? 'bg-amber-50 text-amber-700' :
                        'bg-gray-50 text-gray-600'
                      }`}>
                        {txn.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {formatDate(txn.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {txnTotalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">Page {txnPage} of {txnTotalPages}</p>
              <div className="flex gap-1">
                <button onClick={() => setTxnPage((p) => Math.max(1, p - 1))} disabled={txnPage === 1} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button>
                <button onClick={() => setTxnPage((p) => Math.min(txnTotalPages, p + 1))} disabled={txnPage === txnTotalPages} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
          )}
        </div>

        {/* Suspicious Activity Panel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-[#1B2A4A] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Suspicious Activity
            </h2>
          </div>
          <div className="divide-y divide-gray-50">
            {flags.length === 0 ? (
              <div className="p-6 text-center text-gray-400 text-sm">No flagged transactions</div>
            ) : (
              flags.map((f) => (
                <div key={f.id} className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${severityBadge(f.severity)}`}>
                      {f.severity}
                    </span>
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${flagStatusBadge(f.status)}`}>
                      {f.status}
                    </span>
                  </div>
                  <p className="text-sm text-[#1B2A4A] font-medium">{f.flag_type.replace(/_/g, ' ')}</p>
                  <p className="text-xs text-gray-500">{(f.details as any)?.reason || 'No details'}</p>
                  <p className="text-xs text-gray-400">{formatDate(f.created_at)}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── Wallet List ──────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-lg font-semibold text-[#1B2A4A]">All Wallets</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search wallets..."
              value={walletSearch}
              onChange={(e) => { setWalletSearch(e.target.value); setWalletPage(1); }}
              className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] w-full sm:w-56"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">Account</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">Balance</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">Currency</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">Created</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {pagedWallets.map((w) => (
                <tr key={w.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-[#1B2A4A]">{w.user_name}</p>
                    <p className="text-xs text-gray-400">{w.user_email}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600 font-mono text-xs">{w.account_number}</td>
                  <td className="px-4 py-3 font-semibold text-[#1B2A4A]">{formatCurrency(w.balance, w.currency)}</td>
                  <td className="px-4 py-3 text-gray-500">{w.currency}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                      w.status === 'active' ? 'bg-green-50 text-green-700' :
                      w.status === 'frozen' ? 'bg-red-50 text-red-700' :
                      'bg-gray-50 text-gray-600'
                    }`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {w.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDate(w.created_at)}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleFreeze(w.id, w.status)}
                      disabled={freezingId === w.id}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        w.status === 'frozen'
                          ? 'bg-[#5DB347]/10 text-[#5DB347] hover:bg-[#5DB347]/20'
                          : 'bg-red-50 text-red-600 hover:bg-red-100'
                      }`}
                    >
                      {freezingId === w.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : w.status === 'frozen' ? (
                        <Shield className="w-3 h-3" />
                      ) : (
                        <ShieldOff className="w-3 h-3" />
                      )}
                      {w.status === 'frozen' ? 'Unfreeze' : 'Freeze'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {walletTotalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">Page {walletPage} of {walletTotalPages} ({filteredWallets.length} wallets)</p>
            <div className="flex gap-1">
              <button onClick={() => setWalletPage((p) => Math.max(1, p - 1))} disabled={walletPage === 1} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button>
              <button onClick={() => setWalletPage((p) => Math.min(walletTotalPages, p + 1))} disabled={walletPage === walletTotalPages} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
