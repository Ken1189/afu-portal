'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Warehouse,
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  Calendar,
  ShieldCheck,
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────
interface StorageFee {
  commodity: string;
  fee_per_ton_per_month: number;
  min_storage_days: number;
  insurance_rate_percent: number;
  handling_fee: number;
}

const DEFAULT_FEES: StorageFee[] = [
  { commodity: 'Maize', fee_per_ton_per_month: 8.50, min_storage_days: 30, insurance_rate_percent: 0.15, handling_fee: 3.00 },
  { commodity: 'Coffee', fee_per_ton_per_month: 15.00, min_storage_days: 14, insurance_rate_percent: 0.25, handling_fee: 5.00 },
  { commodity: 'Cotton', fee_per_ton_per_month: 10.00, min_storage_days: 30, insurance_rate_percent: 0.20, handling_fee: 4.00 },
  { commodity: 'Tobacco', fee_per_ton_per_month: 12.00, min_storage_days: 21, insurance_rate_percent: 0.30, handling_fee: 4.50 },
  { commodity: 'Tea', fee_per_ton_per_month: 14.00, min_storage_days: 14, insurance_rate_percent: 0.20, handling_fee: 5.00 },
  { commodity: 'Cashew Nuts', fee_per_ton_per_month: 11.00, min_storage_days: 30, insurance_rate_percent: 0.18, handling_fee: 3.50 },
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
export default function StorageFeesPage() {
  const supabase = createClient();

  const [fees, setFees] = useState<StorageFee[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Editing
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<StorageFee>({ commodity: '', fee_per_ton_per_month: 0, min_storage_days: 0, insurance_rate_percent: 0, handling_fee: 0 });

  // Adding
  const [adding, setAdding] = useState(false);
  const [newForm, setNewForm] = useState<StorageFee>({ commodity: '', fee_per_ton_per_month: 10, min_storage_days: 30, insurance_rate_percent: 0.15, handling_fee: 3.00 });

  // ── Load ────────────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('site_config')
      .select('*')
      .eq('key', 'storage_fee_schedules')
      .single();

    if (error && error.code !== 'PGRST116') {
      setToast({ message: 'Failed to load storage fees', type: 'error' });
    }

    setFees(data?.value ? (data.value as StorageFee[]) : DEFAULT_FEES);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Save ────────────────────────────────────────────────────────────────
  const saveFees = useCallback(async (updated: StorageFee[]) => {
    setSaving(true);
    const { error } = await supabase
      .from('site_config')
      .upsert(
        {
          key: 'storage_fee_schedules',
          value: updated,
          description: 'Per-commodity storage fee schedules',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'key' }
      );

    if (error) {
      setToast({ message: 'Failed to save storage fees', type: 'error' });
    } else {
      setFees(updated);
      setToast({ message: 'Storage fees saved successfully', type: 'success' });
    }
    setSaving(false);
  }, []);

  const startEdit = (idx: number) => { setEditIdx(idx); setEditForm({ ...fees[idx] }); };
  const saveEdit = () => { if (editIdx === null) return; const u = [...fees]; u[editIdx] = editForm; saveFees(u); setEditIdx(null); };
  const deleteFee = (idx: number) => { saveFees(fees.filter((_, i) => i !== idx)); };
  const addFee = () => {
    if (!newForm.commodity.trim()) return;
    saveFees([...fees, { ...newForm }]);
    setAdding(false);
    setNewForm({ commodity: '', fee_per_ton_per_month: 10, min_storage_days: 30, insurance_rate_percent: 0.15, handling_fee: 3.00 });
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
    <div className="max-w-6xl mx-auto space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A] flex items-center gap-2">
            <Warehouse size={28} className="text-[#5DB347]" />
            Storage Fee Schedules
          </h1>
          <p className="text-gray-500 mt-1">Manage per-commodity storage fees, insurance rates, and handling charges</p>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#5DB347] text-white rounded-xl hover:bg-[#4ea23c] transition font-medium text-sm"
        >
          <Plus size={16} /> Add Fee Schedule
        </button>
      </div>

      {/* Add Form */}
      {adding && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-[#1B2A4A] mb-3">New Storage Fee Schedule</h3>
          <div className="grid grid-cols-5 gap-4 mb-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Commodity</label>
              <input type="text" value={newForm.commodity} onChange={(e) => setNewForm({ ...newForm, commodity: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none" placeholder="e.g. Wheat" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Fee/Ton/Month ($)</label>
              <input type="number" step="0.01" value={newForm.fee_per_ton_per_month} onChange={(e) => setNewForm({ ...newForm, fee_per_ton_per_month: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Min Storage Days</label>
              <input type="number" value={newForm.min_storage_days} onChange={(e) => setNewForm({ ...newForm, min_storage_days: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Insurance Rate %</label>
              <input type="number" step="0.01" value={newForm.insurance_rate_percent} onChange={(e) => setNewForm({ ...newForm, insurance_rate_percent: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Handling Fee ($)</label>
              <input type="number" step="0.01" value={newForm.handling_fee} onChange={(e) => setNewForm({ ...newForm, handling_fee: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={addFee} className="px-4 py-2 bg-[#5DB347] text-white rounded-lg text-sm font-medium hover:bg-[#4ea23c] transition"><Save size={14} className="inline mr-1" /> Save</button>
            <button onClick={() => setAdding(false)} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition">Cancel</button>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-2 text-gray-500 text-xs font-medium mb-1"><DollarSign size={14} /> Avg Fee/Ton/Month</div>
          <p className="text-2xl font-bold text-[#1B2A4A]">${fees.length > 0 ? (fees.reduce((s, f) => s + f.fee_per_ton_per_month, 0) / fees.length).toFixed(2) : '0.00'}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-2 text-gray-500 text-xs font-medium mb-1"><Calendar size={14} /> Avg Min Storage</div>
          <p className="text-2xl font-bold text-[#1B2A4A]">{fees.length > 0 ? Math.round(fees.reduce((s, f) => s + f.min_storage_days, 0) / fees.length) : 0} days</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-2 text-gray-500 text-xs font-medium mb-1"><ShieldCheck size={14} /> Commodities Covered</div>
          <p className="text-2xl font-bold text-[#1B2A4A]">{fees.length}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="text-left px-5 py-3 font-medium">Commodity</th>
                <th className="text-right px-5 py-3 font-medium">Fee/Ton/Month</th>
                <th className="text-right px-5 py-3 font-medium">Min Storage Days</th>
                <th className="text-right px-5 py-3 font-medium">Insurance Rate</th>
                <th className="text-right px-5 py-3 font-medium">Handling Fee</th>
                <th className="text-right px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {fees.map((f, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50 transition">
                  {editIdx === idx ? (
                    <>
                      <td className="px-5 py-3">
                        <input type="text" value={editForm.commodity} onChange={(e) => setEditForm({ ...editForm, commodity: e.target.value })}
                          className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none" />
                      </td>
                      <td className="px-5 py-3">
                        <input type="number" step="0.01" value={editForm.fee_per_ton_per_month} onChange={(e) => setEditForm({ ...editForm, fee_per_ton_per_month: parseFloat(e.target.value) || 0 })}
                          className="w-28 px-2 py-1.5 border border-gray-200 rounded-lg text-sm text-right focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none" />
                      </td>
                      <td className="px-5 py-3">
                        <input type="number" value={editForm.min_storage_days} onChange={(e) => setEditForm({ ...editForm, min_storage_days: parseInt(e.target.value) || 0 })}
                          className="w-24 px-2 py-1.5 border border-gray-200 rounded-lg text-sm text-right focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none" />
                      </td>
                      <td className="px-5 py-3">
                        <input type="number" step="0.01" value={editForm.insurance_rate_percent} onChange={(e) => setEditForm({ ...editForm, insurance_rate_percent: parseFloat(e.target.value) || 0 })}
                          className="w-24 px-2 py-1.5 border border-gray-200 rounded-lg text-sm text-right focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none" />
                      </td>
                      <td className="px-5 py-3">
                        <input type="number" step="0.01" value={editForm.handling_fee} onChange={(e) => setEditForm({ ...editForm, handling_fee: parseFloat(e.target.value) || 0 })}
                          className="w-24 px-2 py-1.5 border border-gray-200 rounded-lg text-sm text-right focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none" />
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
                      <td className="px-5 py-3 font-medium text-[#1B2A4A]">{f.commodity}</td>
                      <td className="px-5 py-3 text-right font-medium text-gray-700">${f.fee_per_ton_per_month.toFixed(2)}</td>
                      <td className="px-5 py-3 text-right text-gray-600">{f.min_storage_days} days</td>
                      <td className="px-5 py-3 text-right text-gray-600">{f.insurance_rate_percent}%</td>
                      <td className="px-5 py-3 text-right text-gray-600">${f.handling_fee.toFixed(2)}</td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => startEdit(idx)} className="p-1.5 text-gray-400 hover:text-[#5DB347] hover:bg-[#5DB347]/10 rounded-lg transition"><Pencil size={14} /></button>
                          <button onClick={() => deleteFee(idx)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {fees.length === 0 && (
          <div className="p-12 text-center">
            <Warehouse size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No storage fee schedules configured.</p>
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
