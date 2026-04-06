'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Wallet, CheckCircle2, Clock, Building, DollarSign, RefreshCw } from 'lucide-react';

interface Payout {
  id: string;
  supplier_id: string;
  amount: number;
  currency: string;
  status: string;
  payout_method: string | null;
  payout_reference: string | null;
  notes: string | null;
  requested_at: string;
  processed_at: string | null;
  supplier?: { company_name: string; email: string } | null;
}

interface SupplierTotal {
  supplier_id: string;
  company_name: string;
  total_owed: number;
}

export default function AdminPayoutsPage() {
  const supabase = createClient();
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [totals, setTotals] = useState<SupplierTotal[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data: payoutRows } = await supabase
      .from('payouts')
      .select('*, supplier:suppliers(company_name, email)')
      .order('requested_at', { ascending: false });
    setPayouts((payoutRows as unknown as Payout[]) || []);

    // Compute total owed per supplier from unpaid commissions
    const { data: commissionRows } = await supabase
      .from('commissions')
      .select('supplier_id, commission_amount, status, supplier:suppliers(company_name)')
      .in('status', ['pending', 'approved']);

    const map = new Map<string, SupplierTotal>();
    (commissionRows || []).forEach((c: Record<string, unknown>) => {
      const sid = String(c.supplier_id);
      const supplier = c.supplier as { company_name?: string } | null;
      const cur = map.get(sid) || {
        supplier_id: sid,
        company_name: supplier?.company_name || 'Unknown',
        total_owed: 0,
      };
      cur.total_owed += Number(c.commission_amount || 0);
      map.set(sid, cur);
    });
    setTotals(Array.from(map.values()).sort((a, b) => b.total_owed - a.total_owed));
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    load();
  }, [load]);

  const markPaid = async (payoutId: string) => {
    setBusyId(payoutId);
    try {
      const res = await fetch('/api/admin/payouts/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payoutId, action: 'complete' }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        alert(j.error || 'Failed to mark paid');
      } else {
        await load();
      }
    } finally {
      setBusyId(null);
    }
  };

  const pendingPayouts = payouts.filter((p) => p.status === 'pending' || p.status === 'processing');
  const completedPayouts = payouts.filter((p) => p.status === 'completed');

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#1B2A4A] flex items-center gap-2">
              <Wallet className="w-6 h-6 text-[#5DB347]" /> Supplier Payouts
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Process supplier commission payouts and view amounts owed.
            </p>
          </div>
          <button
            onClick={load}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm hover:bg-white"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {/* Pending payouts */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            <h2 className="font-semibold text-[#1B2A4A]">Pending Payouts ({pendingPayouts.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 text-left">Supplier</th>
                  <th className="px-4 py-3 text-left">Amount</th>
                  <th className="px-4 py-3 text-left">Method</th>
                  <th className="px-4 py-3 text-left">Requested</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Loading…</td></tr>
                ) : pendingPayouts.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No pending payouts</td></tr>
                ) : (
                  pendingPayouts.map((p) => (
                    <tr key={p.id} className="border-t border-gray-100">
                      <td className="px-4 py-3 font-medium text-[#1B2A4A]">
                        {p.supplier?.company_name || p.supplier_id.slice(0, 8)}
                      </td>
                      <td className="px-4 py-3 text-[#1B2A4A] font-semibold">
                        ${Number(p.amount).toFixed(2)} {p.currency}
                      </td>
                      <td className="px-4 py-3 text-gray-500">{p.payout_method || '—'}</td>
                      <td className="px-4 py-3 text-gray-500">
                        {new Date(p.requested_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
                          {p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => markPaid(p.id)}
                          disabled={busyId === p.id}
                          className="px-3 py-1.5 rounded-lg bg-[#5DB347] text-white text-xs font-semibold hover:bg-[#449933] disabled:opacity-50"
                        >
                          {busyId === p.id ? 'Processing…' : 'Mark Paid'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Totals owed */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-[#5DB347]" />
            <h2 className="font-semibold text-[#1B2A4A]">Total Commissions Owed by Supplier</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 text-left">Supplier</th>
                  <th className="px-4 py-3 text-right">Owed (Pending + Approved)</th>
                </tr>
              </thead>
              <tbody>
                {totals.length === 0 ? (
                  <tr><td colSpan={2} className="px-4 py-8 text-center text-gray-400">Nothing owed</td></tr>
                ) : (
                  totals.map((t) => (
                    <tr key={t.supplier_id} className="border-t border-gray-100">
                      <td className="px-4 py-3 text-[#1B2A4A] flex items-center gap-2">
                        <Building className="w-4 h-4 text-gray-400" /> {t.company_name}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-[#1B2A4A]">
                        ${t.total_owed.toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Completed payouts */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <h2 className="font-semibold text-[#1B2A4A]">Completed Payouts ({completedPayouts.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 text-left">Supplier</th>
                  <th className="px-4 py-3 text-left">Amount</th>
                  <th className="px-4 py-3 text-left">Reference</th>
                  <th className="px-4 py-3 text-left">Processed</th>
                </tr>
              </thead>
              <tbody>
                {completedPayouts.length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">No completed payouts yet</td></tr>
                ) : (
                  completedPayouts.map((p) => (
                    <tr key={p.id} className="border-t border-gray-100">
                      <td className="px-4 py-3 text-[#1B2A4A]">
                        {p.supplier?.company_name || p.supplier_id.slice(0, 8)}
                      </td>
                      <td className="px-4 py-3 text-[#1B2A4A] font-semibold">
                        ${Number(p.amount).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-gray-500">{p.payout_reference || '—'}</td>
                      <td className="px-4 py-3 text-gray-500">
                        {p.processed_at ? new Date(p.processed_at).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
