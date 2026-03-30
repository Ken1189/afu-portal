'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Percent,
  Plus,
  Trash2,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  Pencil,
} from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────

interface CommissionRate {
  category: string;
  rate_percent: number;
  min_order_value: number;
  description: string;
}

const SEED_DATA: CommissionRate[] = [
  { category: 'Seeds & Seedlings', rate_percent: 8, min_order_value: 50, description: 'Standard commission on seed products' },
  { category: 'Fertilisers', rate_percent: 7, min_order_value: 100, description: 'Commission on fertiliser sales' },
  { category: 'Pesticides & Herbicides', rate_percent: 10, min_order_value: 75, description: 'Higher margin on chemical products' },
  { category: 'Farm Equipment', rate_percent: 5, min_order_value: 500, description: 'Lower rate on high-value equipment' },
  { category: 'Animal Feed', rate_percent: 6, min_order_value: 100, description: 'Commission on animal feed products' },
  { category: 'Veterinary Products', rate_percent: 12, min_order_value: 50, description: 'Specialty veterinary product commission' },
  { category: 'Irrigation Systems', rate_percent: 6, min_order_value: 300, description: 'Commission on irrigation equipment' },
  { category: 'Packaging Materials', rate_percent: 10, min_order_value: 50, description: 'Standard packaging commission' },
  { category: 'Farm Tools', rate_percent: 9, min_order_value: 25, description: 'Commission on small farm tools' },
  { category: 'Safety Equipment', rate_percent: 15, min_order_value: 25, description: 'Premium on safety gear' },
];

const CONFIG_KEY = 'supplier_commission_rates';

// ── Toast ────────────────────────────────────────────────────────────────────

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
      {type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
      {message}
    </div>
  );
}

// ── Component ────────────────────────────────────────────────────────────────

export default function SupplierCommissionsConfig() {
  const [rates, setRates] = useState<CommissionRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<CommissionRate | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newRate, setNewRate] = useState<CommissionRate>({ category: '', rate_percent: 10, min_order_value: 50, description: '' });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const supabase = createClient();

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('site_config')
      .select('value')
      .eq('key', CONFIG_KEY)
      .single();

    if (error || !data) {
      setRates(SEED_DATA);
    } else {
      setRates(data.value as CommissionRate[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const saveToDb = async (updated: CommissionRate[]) => {
    setSaving(true);
    const { data: existing } = await supabase
      .from('site_config')
      .select('id')
      .eq('key', CONFIG_KEY)
      .single();

    let error;
    if (existing) {
      ({ error } = await supabase
        .from('site_config')
        .update({ value: updated, updated_at: new Date().toISOString() })
        .eq('key', CONFIG_KEY));
    } else {
      ({ error } = await supabase
        .from('site_config')
        .insert({ key: CONFIG_KEY, value: updated, description: 'Supplier commission rates by product category' }));
    }

    if (error) {
      setToast({ message: 'Failed to save commission rates', type: 'error' });
    } else {
      setRates(updated);
      setToast({ message: 'Commission rates saved successfully', type: 'success' });
    }
    setSaving(false);
  };

  const startEdit = (index: number) => {
    setEditingIndex(index);
    setEditForm({ ...rates[index] });
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditForm(null);
  };

  const confirmEdit = async () => {
    if (editingIndex === null || !editForm) return;
    const updated = [...rates];
    updated[editingIndex] = editForm;
    setEditingIndex(null);
    setEditForm(null);
    await saveToDb(updated);
  };

  const handleAdd = async () => {
    if (!newRate.category.trim()) return;
    const updated = [...rates, newRate];
    setAddModalOpen(false);
    setNewRate({ category: '', rate_percent: 10, min_order_value: 50, description: '' });
    await saveToDb(updated);
  };

  const handleDelete = async (index: number) => {
    if (!confirm(`Delete commission for "${rates[index].category}"?`)) return;
    const updated = rates.filter((_, i) => i !== index);
    await saveToDb(updated);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#5DB347]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Supplier Commission Rates</h1>
          <p className="text-gray-500 mt-1">Set commission rates per product category</p>
        </div>
        <button
          onClick={() => setAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#5DB347] text-white rounded-lg text-sm font-medium hover:bg-[#449933] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Rate
        </button>
      </div>

      {/* Table with inline editing */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">Category</th>
              <th className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">Rate (%)</th>
              <th className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3 hidden sm:table-cell">Min Order ($)</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3 hidden lg:table-cell">Description</th>
              <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rates.map((rate, i) => (
              <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                {editingIndex === i && editForm ? (
                  <>
                    <td className="px-5 py-2">
                      <input
                        type="text"
                        value={editForm.category}
                        onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                        className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-[#5DB347] focus:border-transparent outline-none"
                      />
                    </td>
                    <td className="px-5 py-2">
                      <input
                        type="number"
                        value={editForm.rate_percent}
                        onChange={(e) => setEditForm({ ...editForm, rate_percent: parseFloat(e.target.value) || 0 })}
                        className="w-20 mx-auto block text-center border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-[#5DB347] focus:border-transparent outline-none"
                        min={0}
                        max={100}
                        step={0.5}
                      />
                    </td>
                    <td className="px-5 py-2 hidden sm:table-cell">
                      <input
                        type="number"
                        value={editForm.min_order_value}
                        onChange={(e) => setEditForm({ ...editForm, min_order_value: parseFloat(e.target.value) || 0 })}
                        className="w-24 mx-auto block text-center border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-[#5DB347] focus:border-transparent outline-none"
                        min={0}
                      />
                    </td>
                    <td className="px-5 py-2 hidden lg:table-cell">
                      <input
                        type="text"
                        value={editForm.description}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-[#5DB347] focus:border-transparent outline-none"
                      />
                    </td>
                    <td className="px-5 py-2 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={confirmEdit} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors" disabled={saving}>
                          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                        </button>
                        <button onClick={cancelEdit} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-50 rounded-lg">
                          <Percent className="w-4 h-4 text-amber-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-900">{rate.category}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#5DB347]/10 text-[#5DB347]">
                        {rate.rate_percent}%
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center text-sm text-gray-600 hidden sm:table-cell">
                      ${rate.min_order_value.toLocaleString()}
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-500 hidden lg:table-cell">{rate.description}</td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => startEdit(i)} className="p-1.5 text-gray-400 hover:text-[#1B2A4A] hover:bg-gray-100 rounded-lg transition-colors">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(i)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
            {rates.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-gray-400 text-sm">No commission rates configured</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-900">Add Commission Rate</h2>
              <button onClick={() => setAddModalOpen(false)} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input
                  type="text"
                  value={newRate.category}
                  onChange={(e) => setNewRate({ ...newRate, category: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#5DB347] focus:border-transparent outline-none"
                  placeholder="e.g. Organic Products"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rate (%)</label>
                  <input
                    type="number"
                    value={newRate.rate_percent}
                    onChange={(e) => setNewRate({ ...newRate, rate_percent: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#5DB347] focus:border-transparent outline-none"
                    min={0}
                    max={100}
                    step={0.5}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Order Value ($)</label>
                  <input
                    type="number"
                    value={newRate.min_order_value}
                    onChange={(e) => setNewRate({ ...newRate, min_order_value: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#5DB347] focus:border-transparent outline-none"
                    min={0}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={newRate.description}
                  onChange={(e) => setNewRate({ ...newRate, description: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#5DB347] focus:border-transparent outline-none"
                  placeholder="Brief description of this rate"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setAddModalOpen(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 rounded-lg border border-gray-200 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={saving || !newRate.category.trim()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#5DB347] text-white rounded-lg text-sm font-medium hover:bg-[#449933] disabled:opacity-50 transition-colors"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
