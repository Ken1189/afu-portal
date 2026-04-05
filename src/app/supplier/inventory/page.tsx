'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/supabase/auth-context';
import { Package, Plus, X, Loader2, Search, Trash2 } from 'lucide-react';

interface InventoryItem {
  id: string; product_name: string; sku: string | null;
  quantity_on_hand: number; quantity_reserved: number; quantity_available: number;
  reorder_point: number; unit: string; cost_price: number | null;
  warehouse_location: string | null; status: string; created_at: string;
}

const STATUS_COLORS: Record<string, string> = { in_stock: 'bg-green-100 text-green-700', low_stock: 'bg-amber-100 text-amber-700', out_of_stock: 'bg-red-100 text-red-600' };

export default function SupplierInventoryPage() {
  const supabase = useMemo(() => createClient(), []);
  const { user } = useAuth();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ product_name: '', sku: '', quantity_on_hand: '', reorder_point: '10', unit: 'units', cost_price: '', warehouse_location: '' });

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('supplier_inventory').select('*').order('product_name');
    setItems((data || []) as InventoryItem[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchInventory(); }, [fetchInventory]);

  const filtered = useMemo(() => {
    if (!searchTerm) return items;
    const q = searchTerm.toLowerCase();
    return items.filter(i => i.product_name.toLowerCase().includes(q));
  }, [items, searchTerm]);

  const handleSave = async () => {
    if (!form.product_name || !form.quantity_on_hand) return;
    setSaving(true);
    const qty = parseFloat(form.quantity_on_hand);
    const reorder = parseFloat(form.reorder_point) || 10;
    await supabase.from('supplier_inventory').insert({
      supplier_id: user?.id || '00000000-0000-0000-0000-000000000000',
      product_name: form.product_name, sku: form.sku || null,
      quantity_on_hand: qty, quantity_available: qty, quantity_reserved: 0,
      reorder_point: reorder, unit: form.unit,
      cost_price: form.cost_price ? parseFloat(form.cost_price) : null,
      warehouse_location: form.warehouse_location || null,
      status: qty <= 0 ? 'out_of_stock' : qty <= reorder ? 'low_stock' : 'in_stock',
    });
    setShowModal(false);
    setForm({ product_name: '', sku: '', quantity_on_hand: '', reorder_point: '10', unit: 'units', cost_price: '', warehouse_location: '' });
    setSaving(false); fetchInventory();
  };

  const deleteItem = async (id: string) => {
    if (!window.confirm('Delete this inventory item?')) return;
    await supabase.from('supplier_inventory').delete().eq('id', id);
    fetchInventory();
  };

  const lowStock = items.filter(i => i.status === 'low_stock').length;
  const outOfStock = items.filter(i => i.status === 'out_of_stock').length;
  const totalValue = items.reduce((s, i) => s + ((i.cost_price || 0) * i.quantity_on_hand), 0);

  return (
    <div className="space-y-6 py-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div><h1 className="text-2xl font-bold text-[#1B2A4A]">Inventory</h1><p className="text-sm text-gray-500">Track stock levels</p></div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-[#5DB347] hover:bg-[#449933] text-white text-sm font-medium px-4 py-2.5 rounded-xl"><Plus className="w-4 h-4" /> Add Item</button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4"><p className="text-xs text-gray-500">Total</p><p className="text-2xl font-bold text-[#1B2A4A]">{items.length}</p></div>
        <div className="bg-white rounded-xl border border-amber-100 p-4"><p className="text-xs text-amber-500">Low Stock</p><p className="text-2xl font-bold text-amber-600">{lowStock}</p></div>
        <div className="bg-white rounded-xl border border-red-100 p-4"><p className="text-xs text-red-500">Out of Stock</p><p className="text-2xl font-bold text-red-600">{outOfStock}</p></div>
        <div className="bg-white rounded-xl border border-gray-100 p-4"><p className="text-xs text-gray-500">Value</p><p className="text-2xl font-bold text-[#5DB347]">${totalValue.toLocaleString()}</p></div>
      </div>

      <div className="relative max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search..." className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]" /></div>

      {loading ? <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-[#5DB347]" /></div> : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border text-center py-16"><Package className="w-12 h-12 text-gray-200 mx-auto mb-3" /><h3 className="text-lg font-semibold text-[#1B2A4A] mb-2">{items.length === 0 ? 'No inventory yet' : 'No results'}</h3><p className="text-sm text-gray-400 mb-4">Add your first product to track stock.</p>{items.length === 0 && <button onClick={() => setShowModal(true)} className="text-sm text-[#5DB347] font-medium hover:underline">+ Add first item</button>}</div>
      ) : (
        <div className="bg-white rounded-2xl border overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b bg-gray-50/50"><th className="text-left py-3 px-4 font-medium text-gray-500">Product</th><th className="text-left py-3 px-4 font-medium text-gray-500">SKU</th><th className="text-right py-3 px-4 font-medium text-gray-500">On Hand</th><th className="text-right py-3 px-4 font-medium text-gray-500">Available</th><th className="text-left py-3 px-4 font-medium text-gray-500">Status</th><th className="text-right py-3 px-4 font-medium text-gray-500">Cost</th><th className="text-right py-3 px-4"></th></tr></thead><tbody className="divide-y divide-gray-50">{filtered.map(item => (<tr key={item.id} className="hover:bg-gray-50"><td className="py-3 px-4 font-medium text-[#1B2A4A]">{item.product_name}</td><td className="py-3 px-4 text-gray-400 text-xs font-mono">{item.sku || '\u2014'}</td><td className="py-3 px-4 text-right font-medium">{item.quantity_on_hand} {item.unit}</td><td className="py-3 px-4 text-right">{item.quantity_available} {item.unit}</td><td className="py-3 px-4"><span className={'text-xs px-2 py-0.5 rounded-full font-medium ' + (STATUS_COLORS[item.status] || 'bg-gray-100')}>{item.status.replace('_', ' ')}</span></td><td className="py-3 px-4 text-right text-gray-500">{item.cost_price ? '$' + item.cost_price.toLocaleString() : '\u2014'}</td><td className="py-3 px-4 text-right"><button onClick={() => deleteItem(item.id)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button></td></tr>))}</tbody></table></div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"><div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4"><div className="p-5 border-b flex items-center justify-between"><h3 className="text-lg font-bold text-[#1B2A4A]">Add Item</h3><button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-gray-100"><X className="w-5 h-5 text-gray-400" /></button></div><div className="p-5 space-y-4"><div className="grid grid-cols-2 gap-4"><div><label className="block text-xs font-medium text-gray-500 mb-1">Product *</label><input type="text" value={form.product_name} onChange={e => setForm(p => ({ ...p, product_name: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" /></div><div><label className="block text-xs font-medium text-gray-500 mb-1">SKU</label><input type="text" value={form.sku} onChange={e => setForm(p => ({ ...p, sku: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" /></div></div><div className="grid grid-cols-3 gap-4"><div><label className="block text-xs font-medium text-gray-500 mb-1">Quantity *</label><input type="number" value={form.quantity_on_hand} onChange={e => setForm(p => ({ ...p, quantity_on_hand: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" /></div><div><label className="block text-xs font-medium text-gray-500 mb-1">Unit</label><select value={form.unit} onChange={e => setForm(p => ({ ...p, unit: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"><option>units</option><option>kg</option><option>tonnes</option><option>bags</option><option>litres</option></select></div><div><label className="block text-xs font-medium text-gray-500 mb-1">Reorder At</label><input type="number" value={form.reorder_point} onChange={e => setForm(p => ({ ...p, reorder_point: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" /></div></div><div className="grid grid-cols-2 gap-4"><div><label className="block text-xs font-medium text-gray-500 mb-1">Cost ($)</label><input type="number" step="0.01" value={form.cost_price} onChange={e => setForm(p => ({ ...p, cost_price: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" /></div><div><label className="block text-xs font-medium text-gray-500 mb-1">Warehouse</label><input type="text" value={form.warehouse_location} onChange={e => setForm(p => ({ ...p, warehouse_location: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" /></div></div></div><div className="p-5 border-t flex justify-end gap-3"><button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100">Cancel</button><button onClick={handleSave} disabled={saving || !form.product_name || !form.quantity_on_hand} className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm bg-[#5DB347] text-white hover:bg-[#449933] disabled:opacity-50">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Add</button></div></div></div>
      )}
    </div>
  );
}
