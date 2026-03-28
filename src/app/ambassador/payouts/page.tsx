'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Wallet,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  CreditCard,
  AlertCircle,
  ArrowDownToLine,
} from 'lucide-react';
import { useAuth } from '@/lib/supabase/auth-context';
import { createClient } from '@/lib/supabase/client';

// ── Types ────────────────────────────────────────────────────────────────────

interface Payout {
  id: string;
  amount: number;
  method: string;
  status: string;
  reference: string;
  created_at: string;
}

// ── Demo Data ────────────────────────────────────────────────────────────────

const demoPayouts: Payout[] = [
  { id: '1', amount: 1200, method: 'Bank Transfer', status: 'completed', reference: 'PAY-2026-001', created_at: '2026-03-15T10:00:00Z' },
  { id: '2', amount: 850, method: 'Mobile Money', status: 'completed', reference: 'PAY-2026-002', created_at: '2026-02-15T10:00:00Z' },
  { id: '3', amount: 625, method: 'Bank Transfer', status: 'completed', reference: 'PAY-2026-003', created_at: '2026-01-15T10:00:00Z' },
  { id: '4', amount: 475, method: 'PayPal', status: 'processing', reference: 'PAY-2025-012', created_at: '2025-12-15T10:00:00Z' },
  { id: '5', amount: 350, method: 'Mobile Money', status: 'completed', reference: 'PAY-2025-011', created_at: '2025-11-15T10:00:00Z' },
];

const MINIMUM_PAYOUT = 50;

// ── Component ────────────────────────────────────────────────────────────────

export default function PayoutsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [payouts, setPayouts] = useState<Payout[]>(demoPayouts);
  const [payoutMethod, setPayoutMethod] = useState('Bank Transfer');
  const [pendingBalance, setPendingBalance] = useState(475);
  const [requesting, setRequesting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);

  useEffect(() => {
    if (!user) return;

    const supabase = createClient();

    async function fetchPayouts() {
      try {
        const { data: ambassador } = await supabase
          .from('ambassadors')
          .select('id, payout_method')
          .eq('user_id', user!.id)
          .single();

        if (ambassador) {
          if (ambassador.payout_method) setPayoutMethod(ambassador.payout_method);

          const { data } = await supabase
            .from('ambassador_payouts')
            .select('*')
            .eq('ambassador_id', ambassador.id)
            .order('created_at', { ascending: false });

          if (data && data.length > 0) {
            setPayouts(data.map((p: any) => ({
              id: p.id,
              amount: p.amount,
              method: p.method || 'Bank Transfer',
              status: p.status,
              reference: p.reference || `PAY-${p.id.slice(0, 8)}`,
              created_at: p.created_at,
            })));
          }

          // Get pending balance from commission_entries
          const { data: pendingEntries } = await supabase
            .from('commission_entries')
            .select('commission_amount')
            .eq('ambassador_id', ambassador.id)
            .eq('status', 'pending');

          if (pendingEntries) {
            const total = pendingEntries.reduce((s: number, e: any) => s + (e.commission_amount || 0), 0);
            if (total > 0) setPendingBalance(total);
          }
        }
      } catch {
        // Keep demo data
      } finally {
        setLoading(false);
      }
    }

    fetchPayouts();
  }, [user]);

  const handleRequestPayout = async () => {
    if (pendingBalance < MINIMUM_PAYOUT) return;
    setRequesting(true);

    try {
      const supabase = createClient();
      const { data: ambassador } = await supabase
        .from('ambassadors')
        .select('id')
        .eq('user_id', user!.id)
        .single();

      if (ambassador) {
        await supabase.from('ambassador_payouts').insert({
          ambassador_id: ambassador.id,
          amount: pendingBalance,
          method: payoutMethod,
          status: 'pending',
          reference: `PAY-${Date.now().toString(36).toUpperCase()}`,
        });
      }

      setRequestSuccess(true);
      setShowConfirm(false);

      // Add to local state
      setPayouts((prev) => [
        {
          id: `new-${Date.now()}`,
          amount: pendingBalance,
          method: payoutMethod,
          status: 'pending',
          reference: `PAY-${Date.now().toString(36).toUpperCase()}`,
          created_at: new Date().toISOString(),
        },
        ...prev,
      ]);
      setPendingBalance(0);

      setTimeout(() => setRequestSuccess(false), 3000);
    } catch {
      // Silently fail, user can retry
    } finally {
      setRequesting(false);
    }
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(val);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const statusBadge = (status: string) => {
    const config: Record<string, { style: string; icon: typeof CheckCircle }> = {
      completed: { style: 'bg-green-50 text-green-700', icon: CheckCircle },
      pending: { style: 'bg-amber-50 text-amber-700', icon: Clock },
      processing: { style: 'bg-blue-50 text-blue-700', icon: Clock },
      failed: { style: 'bg-red-50 text-red-600', icon: XCircle },
    };
    const c = config[status] || config.pending;
    const Icon = c.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${c.style}`}>
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const totalPaid = payouts.filter((p) => p.status === 'completed').reduce((s, p) => s + p.amount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <svg className="animate-spin h-8 w-8 text-[#5DB347]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1B2A4A]">Payout History</h1>
        <p className="text-gray-500 text-sm mt-1">View your payout history and request new payouts.</p>
      </div>

      {/* Summary + Request */}
      <div className="grid lg:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
        >
          <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3 bg-green-50 text-green-600">
            <DollarSign className="w-4.5 h-4.5" />
          </div>
          <p className="text-xs text-gray-500 mb-1">Total Paid Out</p>
          <p className="text-2xl font-bold text-[#1B2A4A]">{formatCurrency(totalPaid)}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
        >
          <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3 bg-amber-50 text-amber-600">
            <Clock className="w-4.5 h-4.5" />
          </div>
          <p className="text-xs text-gray-500 mb-1">Available Balance</p>
          <p className="text-2xl font-bold text-[#1B2A4A]">{formatCurrency(pendingBalance)}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
        >
          <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3 bg-blue-50 text-blue-600">
            <CreditCard className="w-4.5 h-4.5" />
          </div>
          <p className="text-xs text-gray-500 mb-1">Payout Method</p>
          <p className="text-lg font-bold text-[#1B2A4A]">{payoutMethod}</p>
        </motion.div>
      </div>

      {/* Request Payout */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-lg font-semibold text-[#1B2A4A]">Request Payout</h2>
            <p className="text-sm text-gray-500 mt-1">
              Minimum payout amount: {formatCurrency(MINIMUM_PAYOUT)}. Current available: {formatCurrency(pendingBalance)}.
            </p>
          </div>

          {requestSuccess ? (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2.5 rounded-xl">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Payout request submitted!</span>
            </div>
          ) : showConfirm ? (
            <div className="flex items-center gap-3">
              <p className="text-sm text-gray-600">Confirm payout of {formatCurrency(pendingBalance)}?</p>
              <button
                onClick={handleRequestPayout}
                disabled={requesting}
                className="px-4 py-2.5 rounded-xl bg-[#5DB347] text-white text-sm font-medium hover:bg-[#4ea03c] transition-colors disabled:opacity-50"
              >
                {requesting ? 'Processing...' : 'Confirm'}
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2.5 rounded-xl bg-gray-100 text-gray-600 text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowConfirm(true)}
              disabled={pendingBalance < MINIMUM_PAYOUT}
              className="px-5 py-2.5 rounded-xl bg-[#5DB347] text-white text-sm font-medium hover:bg-[#4ea03c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <ArrowDownToLine className="w-4 h-4" />
              Request Payout
            </button>
          )}
        </div>

        {pendingBalance < MINIMUM_PAYOUT && (
          <div className="mt-3 flex items-center gap-2 text-amber-600 bg-amber-50 rounded-xl px-4 py-2.5">
            <AlertCircle className="w-4 h-4" />
            <p className="text-sm">Your balance is below the minimum payout threshold of {formatCurrency(MINIMUM_PAYOUT)}.</p>
          </div>
        )}
      </motion.div>

      {/* Payout Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Date</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600">Amount</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Method</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Status</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Reference</th>
              </tr>
            </thead>
            <tbody>
              {payouts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-gray-400">
                    <Wallet className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No payouts yet.</p>
                  </td>
                </tr>
              ) : (
                payouts.map((p) => (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3 text-gray-500 whitespace-nowrap">{formatDate(p.created_at)}</td>
                    <td className="px-5 py-3 text-right font-bold text-[#1B2A4A]">{formatCurrency(p.amount)}</td>
                    <td className="px-5 py-3 text-gray-600">{p.method}</td>
                    <td className="px-5 py-3">{statusBadge(p.status)}</td>
                    <td className="px-5 py-3 text-gray-500 font-mono text-xs">{p.reference}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
