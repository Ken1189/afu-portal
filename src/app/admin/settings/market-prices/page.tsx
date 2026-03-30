'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  BarChart3,
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  MapPin,
} from 'lucide-react';
import Link from 'next/link';

// ── Types ──
interface MarketEntry {
  name: string;
  country: string;
}

interface CommoditySource {
  commodity: string;
  unit: string;
  markets: MarketEntry[];
}

const UNITS = ['kg', 'ton', 'bag (50kg)', 'bag (90kg)', 'bushel', 'crate', 'litre'];
const COUNTRIES = ['Zimbabwe', 'Uganda', 'Kenya', 'Tanzania', 'Zambia', 'Malawi', 'Mozambique', 'Rwanda', 'Ethiopia'];

const DEFAULT_SOURCES: CommoditySource[] = [
  { commodity: 'Maize', unit: 'ton', markets: [{ name: 'Harare Mbare', country: 'Zimbabwe' }, { name: 'Nairobi Exchange', country: 'Kenya' }, { name: 'Dar es Salaam', country: 'Tanzania' }] },
  { commodity: 'Coffee', unit: 'kg', markets: [{ name: 'Kampala Coffee Exchange', country: 'Uganda' }, { name: 'Nairobi Auction', country: 'Kenya' }, { name: 'Addis Ababa ECX', country: 'Ethiopia' }] },
  { commodity: 'Cotton', unit: 'kg', markets: [{ name: 'Harare Cotton', country: 'Zimbabwe' }, { name: 'Lilongwe Auction', country: 'Malawi' }, { name: 'Dar es Salaam', country: 'Tanzania' }] },
  { commodity: 'Tobacco', unit: 'kg', markets: [{ name: 'Harare Tobacco Floor', country: 'Zimbabwe' }, { name: 'Lilongwe Auction Floor', country: 'Malawi' }] },
  { commodity: 'Tea', unit: 'kg', markets: [{ name: 'Mombasa Tea Auction', country: 'Kenya' }, { name: 'Limbe Tea Auction', country: 'Malawi' }, { name: 'Kigali', country: 'Rwanda' }] },
  { commodity: 'Cocoa', unit: 'kg', markets: [{ name: 'Kampala', country: 'Uganda' }, { name: 'Dar es Salaam', country: 'Tanzania' }] },
  { commodity: 'Cashews', unit: 'kg', markets: [{ name: 'Maputo Exchange', country: 'Mozambique' }, { name: 'Dar es Salaam', country: 'Tanzania' }] },
  { commodity: 'Sesame', unit: 'kg', markets: [{ name: 'Addis Ababa ECX', country: 'Ethiopia' }, { name: 'Dar es Salaam', country: 'Tanzania' }] },
];

const CONFIG_KEY = 'market_price_sources';

export default function MarketPriceSourcesConfigPage() {
  const [sources, setSources] = useState<CommoditySource[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [form, setForm] = useState<CommoditySource>({ commodity: '', unit: 'kg', markets: [] });
  const [newMarket, setNewMarket] = useState<MarketEntry>({ name: '', country: 'Zimbabwe' });

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
        setSources(data?.value ?? DEFAULT_SOURCES);
      } catch {
        setSources(DEFAULT_SOURCES);
        showToast('error', 'Failed to load config. Using defaults.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [showToast]);

  async function save(updated: CommoditySource[]) {
    setSaving(true);
    try {
      const supabase = createClient();
      const { data: existing } = await supabase.from('site_config').select('id').eq('key', CONFIG_KEY).single();
      if (existing) {
        const { error } = await supabase.from('site_config').update({ value: updated, updated_at: new Date().toISOString() }).eq('key', CONFIG_KEY);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('site_config').insert({ key: CONFIG_KEY, value: updated, description: 'Market price sources configuration' });
        if (error) throw error;
      }
      setSources(updated);
      showToast('success', 'Market price sources saved successfully.');
    } catch {
      showToast('error', 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  function openAdd() {
    setEditIndex(null);
    setForm({ commodity: '', unit: 'kg', markets: [] });
    setNewMarket({ name: '', country: 'Zimbabwe' });
    setModalOpen(true);
  }

  function openEdit(idx: number) {
    setEditIndex(idx);
    setForm({ ...sources[idx], markets: sources[idx].markets.map(m => ({ ...m })) });
    setNewMarket({ name: '', country: 'Zimbabwe' });
    setModalOpen(true);
  }

  function addMarket() {
    if (!newMarket.name.trim()) return;
    setForm(prev => ({ ...prev, markets: [...prev.markets, { ...newMarket }] }));
    setNewMarket({ name: '', country: 'Zimbabwe' });
  }

  function removeMarket(idx: number) {
    setForm(prev => ({ ...prev, markets: prev.markets.filter((_, i) => i !== idx) }));
  }

  function handleSubmit() {
    if (!form.commodity.trim()) { showToast('error', 'Commodity name is required.'); return; }
    const updated = [...sources];
    if (editIndex !== null) { updated[editIndex] = form; } else { updated.push(form); }
    setModalOpen(false);
    save(updated);
  }

  function handleDelete(idx: number) {
    if (!confirm('Delete this commodity?')) return;
    save(sources.filter((_, i) => i !== idx));
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
            <BarChart3 className="w-6 h-6" style={{ color: '#5DB347' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#1B2A4A' }}>Market Price Sources</h1>
            <p className="text-sm text-gray-500">Configure tracked commodities and market locations</p>
          </div>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-medium shadow-sm hover:opacity-90 transition-opacity" style={{ backgroundColor: '#5DB347' }}>
          <Plus className="w-4 h-4" /> Add Commodity
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100" style={{ backgroundColor: '#1B2A4A08' }}>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: '#1B2A4A' }}>Commodity</th>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: '#1B2A4A' }}>Unit</th>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: '#1B2A4A' }}>Markets</th>
                <th className="text-right px-4 py-3 font-semibold" style={{ color: '#1B2A4A' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sources.map((s, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 font-medium" style={{ color: '#1B2A4A' }}>{s.commodity}</td>
                  <td className="px-4 py-3 text-gray-600">{s.unit}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {s.markets.map((m, mi) => (
                        <span key={mi} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-amber-50 text-amber-700">
                          <MapPin className="w-3 h-3" />{m.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openEdit(i)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors mr-1"><Pencil className="w-4 h-4 text-gray-500" /></button>
                    <button onClick={() => handleDelete(i)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4 text-red-400" /></button>
                  </td>
                </tr>
              ))}
              {sources.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-12 text-center text-gray-400">No commodities configured.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold" style={{ color: '#1B2A4A' }}>{editIndex !== null ? 'Edit Commodity' : 'Add Commodity'}</h2>
              <button onClick={() => setModalOpen(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Commodity Name *</label>
                  <input value={form.commodity} onChange={e => setForm({ ...form, commodity: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-200 focus:border-green-400 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <select value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-200 focus:border-green-400 outline-none">
                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Markets</label>
                <div className="space-y-2 mb-3">
                  {form.markets.map((m, mi) => (
                    <div key={mi} className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                      <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-sm flex-1">{m.name} <span className="text-gray-400">({m.country})</span></span>
                      <button onClick={() => removeMarket(mi)} className="p-1 hover:bg-red-50 rounded"><X className="w-3.5 h-3.5 text-red-400" /></button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input value={newMarket.name} onChange={e => setNewMarket({ ...newMarket, name: e.target.value })} placeholder="Market name" className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-200 focus:border-green-400 outline-none" />
                  <select value={newMarket.country} onChange={e => setNewMarket({ ...newMarket, country: e.target.value })} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-200 focus:border-green-400 outline-none">
                    {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <button onClick={addMarket} className="px-3 py-2 text-sm font-medium rounded-lg text-white hover:opacity-90 transition-opacity" style={{ backgroundColor: '#5DB347' }}>
                    <Plus className="w-4 h-4" />
                  </button>
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
