'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/supabase/auth-context';
import {
  FileText, Plus, X, Loader2, Search, Edit3, Trash2, Send,
  CheckCircle2, Clock, DollarSign, Download, RefreshCw, Copy, Eye,
} from 'lucide-react';

/* ─── Types ─── */
interface EstimateItem { name: string; description: string; quantity: number; unit: string; unit_price: number; total: number }
interface Estimate {
  id: string;
  estimate_number: string;
  from_name: string;
  to_name: string;
  to_email: string | null;
  to_phone: string | null;
  items: EstimateItem[];
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount_rate: number;
  discount_amount: number;
  total: number;
  currency: string;
  status: string;
  valid_until: string | null;
  notes: string | null;
  terms: string | null;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  sent: 'bg-blue-100 text-blue-700',
  viewed: 'bg-indigo-100 text-indigo-700',
  accepted: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-600',
  expired: 'bg-amber-100 text-amber-700',
  converted: 'bg-purple-100 text-purple-700',
};

export default function SupplierEstimatesPage() {
  const supabase = useMemo(() => createClient(), []);
  const { user, profile } = useAuth();

  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    to_name: '',
    to_email: '',
    to_phone: '',
    items: [{ name: '', description: '', quantity: 1, unit: 'units', unit_price: 0, total: 0 }] as EstimateItem[],
    tax_rate: 0,
    discount_rate: 0,
    valid_days: 30,
    notes: '',
    terms: 'Payment due within 30 days of acceptance. Prices valid for the period stated.',
    currency: 'USD',
  });

  const fetchEstimates = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('estimates').select('*').order('created_at', { ascending: false });
    setEstimates((data || []) as Estimate[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchEstimates(); }, [fetchEstimates]);

  const filtered = useMemo(() => {
    let list = estimates;
    if (statusFilter !== 'all') list = list.filter(e => e.status === statusFilter);
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(e => e.to_name.toLowerCase().includes(q) || e.estimate_number.toLowerCase().includes(q));
    }
    return list;
  }, [estimates, statusFilter, searchTerm]);

  // Calculate totals
  const calcTotals = (items: EstimateItem[], taxRate: number, discountRate: number) => {
    const subtotal = items.reduce((s, i) => s + i.total, 0);
    const discountAmount = subtotal * (discountRate / 100);
    const taxAmount = (subtotal - discountAmount) * (taxRate / 100);
    const total = subtotal - discountAmount + taxAmount;
    return { subtotal, discountAmount, taxAmount, total };
  };

  const updateItem = (index: number, field: string, value: string | number) => {
    setForm(prev => {
      const items = [...prev.items];
      (items[index] as unknown as Record<string, unknown>)[field] = value;
      items[index].total = items[index].quantity * items[index].unit_price;
      return { ...prev, items };
    });
  };

  const addItem = () => {
    setForm(prev => ({ ...prev, items: [...prev.items, { name: '', description: '', quantity: 1, unit: 'units', unit_price: 0, total: 0 }] }));
  };

  const removeItem = (index: number) => {
    if (form.items.length <= 1) return;
    setForm(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
  };

  const handleSave = async (asDraft: boolean) => {
    if (!form.to_name || form.items.some(i => !i.name)) return;
    setSaving(true);

    const { subtotal, discountAmount, taxAmount, total } = calcTotals(form.items, form.tax_rate, form.discount_rate);
    const now = new Date();
    const estNum = `EST-${now.toISOString().slice(0, 10).replace(/-/g, '')}-${String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0')}`;
    const validUntil = new Date(now.getTime() + form.valid_days * 86400000).toISOString().split('T')[0];

    await supabase.from('estimates').insert({
      estimate_number: estNum,
      from_id: user?.id || null,
      from_type: 'supplier',
      from_name: profile?.full_name || 'Supplier',
      to_name: form.to_name,
      to_email: form.to_email || null,
      to_phone: form.to_phone || null,
      items: form.items,
      subtotal,
      tax_rate: form.tax_rate,
      tax_amount: taxAmount,
      discount_rate: form.discount_rate,
      discount_amount: discountAmount,
      total,
      currency: form.currency,
      status: asDraft ? 'draft' : 'sent',
      valid_until: validUntil,
      notes: form.notes || null,
      terms: form.terms || null,
    });

    setShowModal(false);
    setSaving(false);
    setForm({ to_name: '', to_email: '', to_phone: '', items: [{ name: '', description: '', quantity: 1, unit: 'units', unit_price: 0, total: 0 }], tax_rate: 0, discount_rate: 0, valid_days: 30, notes: '', terms: 'Payment due within 30 days of acceptance. Prices valid for the period stated.', currency: 'USD' });
    fetchEstimates();
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('estimates').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
    setEstimates(prev => prev.map(e => e.id === id ? { ...e, status } : e));
  };

  const deleteEstimate = async (id: string) => {
    await supabase.from('estimates').delete().eq('id', id);
    setEstimates(prev => prev.filter(e => e.id !== id));
  };

  const { subtotal, discountAmount, taxAmount, total } = calcTotals(form.items, form.tax_rate, form.discount_rate);

  // Stats
  const totalSent = estimates.filter(e => e.status !== 'draft').length;
  const totalAccepted = estimates.filter(e => e.status === 'accepted' || e.status === 'converted').length;
  const totalValue = estimates.filter(e => e.status === 'accepted' || e.status === 'converted').reduce((s, e) => s + e.total, 0);

  return (
    <div className="space-y-6 py-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">Estimates & Quotes</h1>
          <p className="text-sm text-gray-500">Create and manage quotations for your customers</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-[#5DB347] hover:bg-[#449933] text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors">
          <Plus className="w-4 h-4" /> New Estimate
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-500">Total Estimates</p>
          <p className="text-2xl font-bold text-[#1B2A4A]">{estimates.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-500">Sent</p>
          <p className="text-2xl font-bold text-blue-600">{totalSent}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-500">Accepted</p>
          <p className="text-2xl font-bold text-[#5DB347]">{totalAccepted}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-500">Value Won</p>
          <p className="text-2xl font-bold text-[#1B2A4A]">${totalValue.toLocaleString()}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search estimates..." className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
          <option value="all">All Status</option>
          {Object.keys(STATUS_COLORS).map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-[#5DB347]" /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 text-center py-16">
          <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">{estimates.length === 0 ? 'No estimates yet. Create your first quote!' : 'No matching estimates.'}</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Estimate #</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Customer</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Total</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Valid Until</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Date</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(e => (
                  <tr key={e.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-[#1B2A4A]">{e.estimate_number}</td>
                    <td className="py-3 px-4">
                      <p className="text-gray-700">{e.to_name}</p>
                      {e.to_email && <p className="text-xs text-gray-400">{e.to_email}</p>}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-[#1B2A4A]">{e.currency} {e.total?.toLocaleString()}</td>
                    <td className="py-3 px-4"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[e.status] || 'bg-gray-100'}`}>{e.status}</span></td>
                    <td className="py-3 px-4 text-gray-400 text-xs">{e.valid_until ? new Date(e.valid_until).toLocaleDateString() : '—'}</td>
                    <td className="py-3 px-4 text-gray-400 text-xs">{new Date(e.created_at).toLocaleDateString()}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
                        {e.status === 'draft' && <button onClick={() => updateStatus(e.id, 'sent')} className="text-xs bg-blue-50 text-blue-600 px-2.5 py-1.5 rounded-lg hover:bg-blue-100">Send</button>}
                        {e.status === 'sent' && <button onClick={() => updateStatus(e.id, 'accepted')} className="text-xs bg-green-50 text-green-600 px-2.5 py-1.5 rounded-lg hover:bg-green-100">Accept</button>}
                        <button onClick={() => deleteEstimate(e.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══ CREATE ESTIMATE MODAL ═══ */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#1B2A4A]">New Estimate</h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-gray-100"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="p-5 space-y-5">
              {/* Customer */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Customer Name *</label>
                  <input type="text" value={form.to_name} onChange={e => setForm(p => ({ ...p, to_name: e.target.value }))} placeholder="Farm or company name" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                  <input type="email" value={form.to_email} onChange={e => setForm(p => ({ ...p, to_email: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Phone</label>
                  <input type="tel" value={form.to_phone} onChange={e => setForm(p => ({ ...p, to_phone: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>

              {/* Line items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Line Items</label>
                  <button type="button" onClick={addItem} className="text-xs text-[#5DB347] font-medium hover:underline flex items-center gap-1"><Plus className="w-3 h-3" /> Add Item</button>
                </div>
                <div className="space-y-2">
                  {form.items.map((item, i) => (
                    <div key={i} className="grid grid-cols-12 gap-2 items-end bg-gray-50 rounded-lg p-3">
                      <div className="col-span-4">
                        {i === 0 && <label className="block text-[10px] text-gray-400 mb-0.5">Product/Service</label>}
                        <input type="text" value={item.name} onChange={e => updateItem(i, 'name', e.target.value)} placeholder="Item name" className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs" />
                      </div>
                      <div className="col-span-2">
                        {i === 0 && <label className="block text-[10px] text-gray-400 mb-0.5">Qty</label>}
                        <input type="number" value={item.quantity} onChange={e => updateItem(i, 'quantity', parseFloat(e.target.value) || 0)} className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs" />
                      </div>
                      <div className="col-span-2">
                        {i === 0 && <label className="block text-[10px] text-gray-400 mb-0.5">Unit</label>}
                        <input type="text" value={item.unit} onChange={e => updateItem(i, 'unit', e.target.value)} className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs" />
                      </div>
                      <div className="col-span-2">
                        {i === 0 && <label className="block text-[10px] text-gray-400 mb-0.5">Price</label>}
                        <input type="number" step="0.01" value={item.unit_price} onChange={e => updateItem(i, 'unit_price', parseFloat(e.target.value) || 0)} className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs" />
                      </div>
                      <div className="col-span-1 text-right">
                        {i === 0 && <label className="block text-[10px] text-gray-400 mb-0.5">Total</label>}
                        <p className="text-xs font-medium text-[#1B2A4A] py-1.5">${item.total.toFixed(2)}</p>
                      </div>
                      <div className="col-span-1 text-right">
                        {form.items.length > 1 && <button type="button" onClick={() => removeItem(i)} className="p-1 text-gray-400 hover:text-red-500"><X className="w-3.5 h-3.5" /></button>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-64 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span className="font-medium">${subtotal.toFixed(2)}</span></div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-gray-500">Discount</span>
                    <div className="flex items-center gap-1">
                      <input type="number" step="0.1" value={form.discount_rate} onChange={e => setForm(p => ({ ...p, discount_rate: parseFloat(e.target.value) || 0 }))} className="w-16 border border-gray-200 rounded px-2 py-1 text-xs text-right" />
                      <span className="text-xs text-gray-400">%</span>
                      <span className="font-medium text-red-500">-${discountAmount.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-gray-500">Tax</span>
                    <div className="flex items-center gap-1">
                      <input type="number" step="0.1" value={form.tax_rate} onChange={e => setForm(p => ({ ...p, tax_rate: parseFloat(e.target.value) || 0 }))} className="w-16 border border-gray-200 rounded px-2 py-1 text-xs text-right" />
                      <span className="text-xs text-gray-400">%</span>
                      <span className="font-medium">${taxAmount.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 pt-2">
                    <span className="font-bold text-[#1B2A4A]">Total</span>
                    <span className="font-bold text-[#5DB347] text-lg">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Notes & Terms */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Notes</label>
                  <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={3} placeholder="Additional notes for the customer..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Terms & Conditions</label>
                  <textarea value={form.terms} onChange={e => setForm(p => ({ ...p, terms: e.target.value }))} rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none" />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Valid for (days)</label>
                  <input type="number" value={form.valid_days} onChange={e => setForm(p => ({ ...p, valid_days: parseInt(e.target.value) || 30 }))} className="w-24 border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100">Cancel</button>
              <button onClick={() => handleSave(true)} disabled={saving || !form.to_name} className="px-5 py-2 rounded-lg text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50">Save Draft</button>
              <button onClick={() => handleSave(false)} disabled={saving || !form.to_name} className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium bg-[#5DB347] text-white hover:bg-[#449933] disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Send Estimate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
