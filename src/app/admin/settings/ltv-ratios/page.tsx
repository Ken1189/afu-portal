'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Banknote,
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Percent,
  ShieldCheck,
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────
interface LtvRatio {
  commodity: string;
  ltv_percent: number;
  max_loan_amount: number;
  storage_fee_included: boolean;
}

const DEFAULT_LTV: LtvRatio[] = [
  { commodity: 'Maize', ltv_percent: 70, max_loan_amount: 50000, storage_fee_included: true },
  { commodity: 'Coffee', ltv_percent: 80, max_loan_amount: 100000, storage_fee_included: true },
  { commodity: 'Cotton', ltv_percent: 65, max_loan_amount: 75000, storage_fee_included: false },
  { commodity: 'Tobacco', ltv_percent: 75, max_loan_amount: 80000, storage_fee_included: true },
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
export default function LtvRatiosPage() {
  const supabase = createClient();

  const [ratios, setRatios] = useState<LtvRatio[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Inline editing
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<LtvRatio>({ commodity: '', ltv_percent: 0, max_loan_amount: 0, storage_fee_included: false });

  // Adding
  const [adding, setAdding] = useState(false);
  const [newForm, setNewForm] = useState<LtvRatio>({ commodity: '', ltv_percent: 70, max_loan_amount: 50000, storage_fee_included: true });

  // ── Load ────────────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('site_config')
      .select('*')
      .eq('key', 'receipt_ltv_ratios')
      .single();

    if (error && error.code !== 'PGRST116') {
      setToast({ message: 'Failed to load LTV ratios', type: 'error' });
    }

    setRatios(data?.value ? (data.value as LtvRatio[]) : DEFAULT_LTV);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Save ────────────────────────────────────────────────────────────────
  const saveRatios = useCallback(async (updated: LtvRatio[]) => {
    setSaving(true);
    const { error } = await supabase
      .from('site_config')
      .upsert(
        {
          key: 'receipt_ltv_ratios',
          value: updated,
          description: 'Loan-to-value ratios for warehouse receipt financing',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'key' }
      );

    if (error) {
      setToast({ message: 'Failed to save LTV ratios', type: 'error' });
    } else {
      setRatios(updated);
      setToast({ message: 'LTV ratios saved successfully', type: 'success' });
    }
    setSaving(false);
  }, []);

  // ── Handlers ────────────────────────────────────────────────────────────
  const startEdit = (idx: number) => {
    setEditIdx(idx);
    setEditForm({ ...ratios[idx] });
  };

  const saveEdit = () => {
    if (editIdx === null) return;
    const updated = [...ratios];
    updated[editIdx] = editForm;
    saveRatios(updated);
    setEditIdx(null);
  };

  const deleteRatio = (idx: number) => {
    saveRatios(ratios.filter((_, i) => i !== idx));
  };

  const addRatio = () => {
    if (!newForm.commodity.trim()) return;
    saveRatios([...ratios, { ...newForm }]);
    setAdding(false);
    setNewForm({ commodity: '', ltv_percent: 70, max_loan_amount: 50000, storage_fee_included: true });
  };

  // ── LTV color helper ────────────────────────────────────────────────────
  const ltvColor = (pct: number) => {
    if (pct >= 80) return 'bg-green-50 text-green-700';
    if (pct >= 70) return 'bg-blue-50 text-blue-700';
    if (pct >= 60) return 'bg-yellow-50 text-yellow-700';
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
            <Banknote size={28} className="text-[#5DB347]" />
            Receipt Financing LTV Ratios
          </h1>
          <p className="text-gray-500 mt-1">Manage loan-to-value ratios for warehouse receipt financing per commodity</p>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#5DB347] text-white rounded-xl hover:bg-[#4ea23c] transition font-medium text-sm"
        >
          <Plus size={16} /> Add Commodity
        </button>
      </div>

      {/* Add Form */}
      {adding && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-[#1B2A4A] mb-3">New LTV Ratio</h3>
          <div className="grid grid-cols-4 gap-4 mb-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Commodity</label>
              <input type="text" value={newForm.commodity} onChange={(e) => setNewForm({ ...newForm, commodity: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none" placeholder="e.g. Sorghum" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">LTV %</label>
              <input type="number" value={newForm.ltv_percent} onChange={(e) => setNewForm({ ...newForm, ltv_percent: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Max Loan Amount ($)</label>
              <input type="number" value={newForm.max_loan_amount} onChange={(e) => setNewForm({ ...newForm, max_loan_amount: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Storage Fee Included</label>
              <button
                onClick={() => setNewForm({ ...newForm, storage_fee_included: !newForm.storage_fee_included })}
                className={`w-full px-3 py-2 rounded-lg text-sm font-medium border transition ${newForm.storage_fee_included ? 'bg-[#5DB347]/10 border-[#5DB347]/30 text-[#5DB347]' : 'bg-gray-50 border-gray-200 text-gray-500'}`}
              >
                {newForm.storage_fee_included ? 'Yes' : 'No'}
              </button>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={addRatio} className="px-4 py-2 bg-[#5DB347] text-white rounded-lg text-sm font-medium hover:bg-[#4ea23c] transition">
              <Save size={14} className="inline mr-1" /> Save
            </button>
            <button onClick={() => setAdding(false)} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="text-left px-5 py-3 font-medium">Commodity</th>
                <th className="text-right px-5 py-3 font-medium">LTV Ratio</th>
                <th className="text-right px-5 py-3 font-medium">Max Loan Amount</th>
                <th className="text-center px-5 py-3 font-medium">Storage Fee Included</th>
                <th className="text-right px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {ratios.map((r, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50 transition">
                  {editIdx === idx ? (
                    <>
                      <td className="px-5 py-3">
                        <input type="text" value={editForm.commodity} onChange={(e) => setEditForm({ ...editForm, commodity: e.target.value })}
                          className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none" />
                      </td>
                      <td className="px-5 py-3">
                        <input type="number" value={editForm.ltv_percent} onChange={(e) => setEditForm({ ...editForm, ltv_percent: parseFloat(e.target.value) || 0 })}
                          className="w-28 px-2 py-1.5 border border-gray-200 rounded-lg text-sm text-right focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none" />
                      </td>
                      <td className="px-5 py-3">
                        <input type="number" value={editForm.max_loan_amount} onChange={(e) => setEditForm({ ...editForm, max_loan_amount: parseFloat(e.target.value) || 0 })}
                          className="w-36 px-2 py-1.5 border border-gray-200 rounded-lg text-sm text-right focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none" />
                      </td>
                      <td className="px-5 py-3 text-center">
                        <button
                          onClick={() => setEditForm({ ...editForm, storage_fee_included: !editForm.storage_fee_included })}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition ${editForm.storage_fee_included ? 'bg-[#5DB347]/10 text-[#5DB347]' : 'bg-gray-100 text-gray-500'}`}
                        >
                          {editForm.storage_fee_included ? 'Yes' : 'No'}
                        </button>
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
                      <td className="px-5 py-3 font-medium text-[#1B2A4A]">{r.commodity}</td>
                      <td className="px-5 py-3 text-right">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${ltvColor(r.ltv_percent)}`}>
                          {r.ltv_percent}%
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right text-gray-700 font-medium">${r.max_loan_amount.toLocaleString()}</td>
                      <td className="px-5 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${r.storage_fee_included ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {r.storage_fee_included ? <ShieldCheck size={12} /> : null}
                          {r.storage_fee_included ? 'Included' : 'Excluded'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => startEdit(idx)} className="p-1.5 text-gray-400 hover:text-[#5DB347] hover:bg-[#5DB347]/10 rounded-lg transition"><Pencil size={14} /></button>
                          <button onClick={() => deleteRatio(idx)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {ratios.length === 0 && (
          <div className="p-12 text-center">
            <Banknote size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No LTV ratios configured yet.</p>
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
