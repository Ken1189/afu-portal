'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Percent,
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  ArrowLeftRight,
  FileText,
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────
interface CommissionRate {
  trade_type: string;
  rate_percent: number;
  min_fee: number;
  max_fee: number;
  description: string;
}

const DEFAULT_COMMISSIONS: CommissionRate[] = [
  { trade_type: 'Spot Trade', rate_percent: 2.5, min_fee: 10, max_fee: 5000, description: 'Immediate delivery commodity trades' },
  { trade_type: 'Forward Contract', rate_percent: 3.0, min_fee: 25, max_fee: 10000, description: 'Future delivery contracts with locked pricing' },
  { trade_type: 'Export Trade', rate_percent: 4.0, min_fee: 50, max_fee: 25000, description: 'Cross-border export commodity transactions' },
  { trade_type: 'Cooperative Bulk', rate_percent: 1.5, min_fee: 5, max_fee: 3000, description: 'Bulk trades by registered cooperatives at reduced rates' },
];

// ── Toast ──────────────────────────────────────────────────────────────────
function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`fixed top-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium ${type === 'success' ? 'bg-[#5DB347]' : 'bg-red-500'}`}>
      {type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
      {message}
      <button onClick={onClose} className="ml-2 hover:opacity-70"><X size={14} /></button>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function TradingCommissionsPage() {
  const supabase = createClient();

  const [commissions, setCommissions] = useState<CommissionRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Inline editing
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<CommissionRate>({ trade_type: '', rate_percent: 0, min_fee: 0, max_fee: 0, description: '' });

  // Adding
  const [adding, setAdding] = useState(false);
  const [newForm, setNewForm] = useState<CommissionRate>({ trade_type: '', rate_percent: 2.0, min_fee: 10, max_fee: 5000, description: '' });

  // ── Load ────────────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('site_config')
      .select('*')
      .eq('key', 'trading_commission_rates')
      .single();

    if (error && error.code !== 'PGRST116') {
      setToast({ message: 'Failed to load commission rates', type: 'error' });
    }

    setCommissions(data?.value ? (data.value as CommissionRate[]) : DEFAULT_COMMISSIONS);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Save ────────────────────────────────────────────────────────────────
  const saveCommissions = useCallback(async (updated: CommissionRate[]) => {
    setSaving(true);
    const { error } = await supabase
      .from('site_config')
      .upsert(
        {
          key: 'trading_commission_rates',
          value: updated,
          description: 'Commission rates per trade type',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'key' }
      );

    if (error) {
      setToast({ message: 'Failed to save commission rates', type: 'error' });
    } else {
      setCommissions(updated);
      setToast({ message: 'Commission rates saved successfully', type: 'success' });
    }
    setSaving(false);
  }, []);

  // ── Handlers ────────────────────────────────────────────────────────────
  const startEdit = (idx: number) => { setEditIdx(idx); setEditForm({ ...commissions[idx] }); };
  const saveEdit = () => { if (editIdx === null) return; const u = [...commissions]; u[editIdx] = editForm; saveCommissions(u); setEditIdx(null); };
  const deleteCommission = (idx: number) => { saveCommissions(commissions.filter((_, i) => i !== idx)); };
  const addCommission = () => {
    if (!newForm.trade_type.trim()) return;
    saveCommissions([...commissions, { ...newForm }]);
    setAdding(false);
    setNewForm({ trade_type: '', rate_percent: 2.0, min_fee: 10, max_fee: 5000, description: '' });
  };

  // ── Rate color ──────────────────────────────────────────────────────────
  const rateColor = (pct: number) => {
    if (pct <= 2) return 'bg-green-50 text-green-700';
    if (pct <= 3) return 'bg-blue-50 text-blue-700';
    if (pct <= 4) return 'bg-yellow-50 text-yellow-700';
    return 'bg-orange-50 text-orange-700';
  };

  // ── Render ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-[#5DB347]" size={36} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A] flex items-center gap-2">
            <Percent size={28} className="text-[#5DB347]" />
            Trading Commission Rates
          </h1>
          <p className="text-gray-500 mt-1">Manage commission rates charged per trade type</p>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#5DB347] text-white rounded-xl hover:bg-[#4ea23c] transition font-medium text-sm"
        >
          <Plus size={16} /> Add Trade Type
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-2 text-gray-500 text-xs font-medium mb-1"><ArrowLeftRight size={14} /> Trade Types</div>
          <p className="text-2xl font-bold text-[#1B2A4A]">{commissions.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-2 text-gray-500 text-xs font-medium mb-1"><Percent size={14} /> Avg Rate</div>
          <p className="text-2xl font-bold text-[#1B2A4A]">
            {commissions.length > 0 ? (commissions.reduce((s, c) => s + c.rate_percent, 0) / commissions.length).toFixed(1) : '0'}%
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-2 text-gray-500 text-xs font-medium mb-1"><DollarSign size={14} /> Lowest Rate</div>
          <p className="text-2xl font-bold text-[#5DB347]">
            {commissions.length > 0 ? Math.min(...commissions.map((c) => c.rate_percent)).toFixed(1) : '0'}%
          </p>
        </div>
      </div>

      {/* Add Form */}
      {adding && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-[#1B2A4A] mb-3">New Commission Rate</h3>
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Trade Type</label>
              <input type="text" value={newForm.trade_type} onChange={(e) => setNewForm({ ...newForm, trade_type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none" placeholder="e.g. Auction Trade" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
              <input type="text" value={newForm.description} onChange={(e) => setNewForm({ ...newForm, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none" placeholder="Brief description" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Rate %</label>
              <input type="number" step="0.1" value={newForm.rate_percent} onChange={(e) => setNewForm({ ...newForm, rate_percent: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Min Fee ($)</label>
              <input type="number" value={newForm.min_fee} onChange={(e) => setNewForm({ ...newForm, min_fee: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Max Fee ($)</label>
              <input type="number" value={newForm.max_fee} onChange={(e) => setNewForm({ ...newForm, max_fee: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={addCommission} className="px-4 py-2 bg-[#5DB347] text-white rounded-lg text-sm font-medium hover:bg-[#4ea23c] transition"><Save size={14} className="inline mr-1" /> Save</button>
            <button onClick={() => setAdding(false)} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition">Cancel</button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="text-left px-5 py-3 font-medium">Trade Type</th>
                <th className="text-left px-5 py-3 font-medium">Description</th>
                <th className="text-right px-5 py-3 font-medium">Rate</th>
                <th className="text-right px-5 py-3 font-medium">Min Fee</th>
                <th className="text-right px-5 py-3 font-medium">Max Fee</th>
                <th className="text-right px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {commissions.map((c, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50 transition">
                  {editIdx === idx ? (
                    <>
                      <td className="px-5 py-3">
                        <input type="text" value={editForm.trade_type} onChange={(e) => setEditForm({ ...editForm, trade_type: e.target.value })}
                          className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none" />
                      </td>
                      <td className="px-5 py-3">
                        <input type="text" value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                          className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none" />
                      </td>
                      <td className="px-5 py-3">
                        <input type="number" step="0.1" value={editForm.rate_percent} onChange={(e) => setEditForm({ ...editForm, rate_percent: parseFloat(e.target.value) || 0 })}
                          className="w-24 px-2 py-1.5 border border-gray-200 rounded-lg text-sm text-right focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none" />
                      </td>
                      <td className="px-5 py-3">
                        <input type="number" value={editForm.min_fee} onChange={(e) => setEditForm({ ...editForm, min_fee: parseFloat(e.target.value) || 0 })}
                          className="w-28 px-2 py-1.5 border border-gray-200 rounded-lg text-sm text-right focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none" />
                      </td>
                      <td className="px-5 py-3">
                        <input type="number" value={editForm.max_fee} onChange={(e) => setEditForm({ ...editForm, max_fee: parseFloat(e.target.value) || 0 })}
                          className="w-28 px-2 py-1.5 border border-gray-200 rounded-lg text-sm text-right focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none" />
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={saveEdit} className="p-1.5 text-[#5DB347] hover:bg-[#5DB347]/10 rounded-lg transition"><Save size={15} /></button>
                          <button onClick={() => setEditIdx(null)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition"><X size={15} /></button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-5 py-3 font-medium text-[#1B2A4A]">
                        <div className="flex items-center gap-2">
                          <ArrowLeftRight size={14} className="text-gray-400" />
                          {c.trade_type}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-gray-600">{c.description}</td>
                      <td className="px-5 py-3 text-right">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${rateColor(c.rate_percent)}`}>
                          {c.rate_percent}%
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right text-gray-600">${c.min_fee.toLocaleString()}</td>
                      <td className="px-5 py-3 text-right text-gray-600">${c.max_fee.toLocaleString()}</td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => startEdit(idx)} className="p-1.5 text-gray-400 hover:text-[#5DB347] hover:bg-[#5DB347]/10 rounded-lg transition"><Pencil size={14} /></button>
                          <button onClick={() => deleteCommission(idx)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {commissions.length === 0 && (
          <div className="p-12 text-center">
            <Percent size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No commission rates configured.</p>
          </div>
        )}
      </div>

      {saving && (
        <div className="fixed bottom-6 right-6 bg-[#1B2A4A] text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 text-sm">
          <Loader2 size={16} className="animate-spin" /> Saving...
        </div>
      )}
    </div>
  );
}
