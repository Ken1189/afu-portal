'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Wrench,
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';

// ── Types ──
interface Equipment {
  name: string;
  type: string;
  description: string;
  daily_rate: number;
  purchase_price: number;
  available_countries: string[];
}

const EQUIPMENT_TYPES = ['Machinery', 'Irrigation', 'Processing', 'Planting', 'Spraying', 'Storage', 'Transport'];
const COUNTRIES = ['Zimbabwe', 'Uganda', 'Kenya', 'Tanzania', 'Zambia', 'Malawi', 'Mozambique', 'Rwanda', 'Ethiopia'];

const DEFAULT_CATALOG: Equipment[] = [
  { name: 'Tractor', type: 'Machinery', description: 'Multi-purpose farm tractor for plowing, hauling and field preparation.', daily_rate: 75, purchase_price: 25000, available_countries: ['Zimbabwe', 'Kenya', 'Tanzania', 'Uganda'] },
  { name: 'Irrigation Pump', type: 'Irrigation', description: 'Diesel-powered water pump for crop irrigation from boreholes or rivers.', daily_rate: 25, purchase_price: 3500, available_countries: ['Zimbabwe', 'Kenya', 'Tanzania', 'Uganda', 'Zambia', 'Malawi'] },
  { name: 'Harvester', type: 'Machinery', description: 'Combine harvester for cereal crops including maize, wheat and rice.', daily_rate: 120, purchase_price: 45000, available_countries: ['Zimbabwe', 'Kenya', 'Tanzania'] },
  { name: 'Seed Drill', type: 'Planting', description: 'Precision seed planter for row crops with adjustable spacing.', daily_rate: 30, purchase_price: 4500, available_countries: ['Zimbabwe', 'Kenya', 'Tanzania', 'Uganda', 'Zambia'] },
  { name: 'Sprayer', type: 'Spraying', description: 'Boom sprayer for herbicide, pesticide and foliar fertilizer application.', daily_rate: 20, purchase_price: 2800, available_countries: ['Zimbabwe', 'Kenya', 'Tanzania', 'Uganda', 'Zambia', 'Malawi', 'Mozambique'] },
  { name: 'Solar Dryer', type: 'Processing', description: 'Solar-powered crop drying unit for grains, fruits and vegetables.', daily_rate: 15, purchase_price: 1800, available_countries: ['Zimbabwe', 'Uganda', 'Kenya', 'Tanzania', 'Zambia', 'Malawi', 'Mozambique', 'Rwanda', 'Ethiopia'] },
];

const CONFIG_KEY = 'equipment_catalog';

export default function EquipmentCatalogConfigPage() {
  const [items, setItems] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [form, setForm] = useState<Equipment>({
    name: '', type: 'Machinery', description: '', daily_rate: 0, purchase_price: 0, available_countries: [],
  });

  const showToast = useCallback((type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.from('site_config').select('value').eq('key', CONFIG_KEY).single();
        if (error && error.code !== 'PGRST116') throw error;
        setItems(data?.value ?? DEFAULT_CATALOG);
      } catch {
        setItems(DEFAULT_CATALOG);
        showToast('error', 'Failed to load config. Using defaults.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [showToast]);

  async function save(updated: Equipment[]) {
    setSaving(true);
    try {
      const supabase = createClient();
      const { data: existing } = await supabase.from('site_config').select('id').eq('key', CONFIG_KEY).single();
      if (existing) {
        const { error } = await supabase.from('site_config').update({ value: updated, updated_at: new Date().toISOString() }).eq('key', CONFIG_KEY);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('site_config').insert({ key: CONFIG_KEY, value: updated, description: 'Equipment catalog configuration' });
        if (error) throw error;
      }
      setItems(updated);
      showToast('success', 'Equipment catalog saved successfully.');
    } catch {
      showToast('error', 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  function openAdd() {
    setEditIndex(null);
    setForm({ name: '', type: 'Machinery', description: '', daily_rate: 0, purchase_price: 0, available_countries: [] });
    setModalOpen(true);
  }

  function openEdit(idx: number) {
    setEditIndex(idx);
    setForm({ ...items[idx], available_countries: [...items[idx].available_countries] });
    setModalOpen(true);
  }

  function toggleCountry(country: string) {
    setForm(prev => ({
      ...prev,
      available_countries: prev.available_countries.includes(country)
        ? prev.available_countries.filter(c => c !== country)
        : [...prev.available_countries, country],
    }));
  }

  function handleSubmit() {
    if (!form.name.trim()) { showToast('error', 'Equipment name is required.'); return; }
    const updated = [...items];
    if (editIndex !== null) { updated[editIndex] = form; } else { updated.push(form); }
    setModalOpen(false);
    save(updated);
  }

  function handleDelete(idx: number) {
    if (!confirm('Delete this equipment?')) return;
    save(items.filter((_, i) => i !== idx));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#5DB347' }} />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-white text-sm ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.message}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/settings" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </Link>
          <div className="p-2 rounded-xl" style={{ backgroundColor: '#5DB34720' }}>
            <Wrench className="w-6 h-6" style={{ color: '#5DB347' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#1B2A4A' }}>Equipment Catalog</h1>
            <p className="text-sm text-gray-500">Manage equipment available for rent or purchase</p>
          </div>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-medium shadow-sm hover:opacity-90 transition-opacity" style={{ backgroundColor: '#5DB347' }}>
          <Plus className="w-4 h-4" /> Add Equipment
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100" style={{ backgroundColor: '#1B2A4A08' }}>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: '#1B2A4A' }}>Equipment</th>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: '#1B2A4A' }}>Type</th>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: '#1B2A4A' }}>Daily Rate</th>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: '#1B2A4A' }}>Purchase Price</th>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: '#1B2A4A' }}>Countries</th>
                <th className="text-right px-4 py-3 font-semibold" style={{ color: '#1B2A4A' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((eq, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium" style={{ color: '#1B2A4A' }}>{eq.name}</div>
                    <div className="text-xs text-gray-400 mt-0.5 line-clamp-1">{eq.description}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700">{eq.type}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">${eq.daily_rate}/day</td>
                  <td className="px-4 py-3 text-gray-700">${eq.purchase_price.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {eq.available_countries.slice(0, 3).map(c => (
                        <span key={c} className="px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-600">{c}</span>
                      ))}
                      {eq.available_countries.length > 3 && (
                        <span className="px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-500">+{eq.available_countries.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openEdit(i)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors mr-1"><Pencil className="w-4 h-4 text-gray-500" /></button>
                    <button onClick={() => handleDelete(i)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4 text-red-400" /></button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400">No equipment configured.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold" style={{ color: '#1B2A4A' }}>{editIndex !== null ? 'Edit Equipment' : 'Add Equipment'}</h2>
              <button onClick={() => setModalOpen(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-200 focus:border-green-400 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-200 focus:border-green-400 outline-none">
                  {EQUIPMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-200 focus:border-green-400 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Daily Rate (USD)</label>
                  <input type="number" min={0} step={0.01} value={form.daily_rate} onChange={e => setForm({ ...form, daily_rate: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-200 focus:border-green-400 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Price (USD)</label>
                  <input type="number" min={0} step={0.01} value={form.purchase_price} onChange={e => setForm({ ...form, purchase_price: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-200 focus:border-green-400 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Available Countries</label>
                <div className="flex flex-wrap gap-2">
                  {COUNTRIES.map(c => (
                    <button key={c} type="button" onClick={() => toggleCountry(c)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${form.available_countries.includes(c) ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'}`}
                    >{c}</button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
              <button onClick={handleSubmit} disabled={saving} className="flex items-center gap-2 px-4 py-2 text-sm text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50" style={{ backgroundColor: '#5DB347' }}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {editIndex !== null ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
