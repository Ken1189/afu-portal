'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Boxes,
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Globe,
  Tag,
  Search,
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────
interface TradingCommodity {
  name: string;
  symbol: string;
  unit: string;
  category: string;
  countries: string[];
  is_active: boolean;
}

const CATEGORIES = ['Grain', 'Beverage Crop', 'Fiber', 'Oil Seed', 'Cash Crop', 'Nut'];
const COUNTRIES = ['Zimbabwe', 'Uganda', 'Kenya', 'Tanzania', 'Zambia', 'Malawi', 'Mozambique', 'Ethiopia', 'Rwanda'];

const DEFAULT_COMMODITIES: TradingCommodity[] = [
  { name: 'Maize', symbol: 'MZE', unit: 'MT', category: 'Grain', countries: ['Zimbabwe', 'Kenya', 'Tanzania', 'Zambia', 'Malawi'], is_active: true },
  { name: 'Wheat', symbol: 'WHT', unit: 'MT', category: 'Grain', countries: ['Kenya', 'Tanzania', 'Ethiopia'], is_active: true },
  { name: 'Coffee', symbol: 'CFE', unit: 'MT', category: 'Beverage Crop', countries: ['Uganda', 'Kenya', 'Tanzania', 'Ethiopia', 'Rwanda'], is_active: true },
  { name: 'Cotton', symbol: 'CTN', unit: 'MT', category: 'Fiber', countries: ['Zimbabwe', 'Tanzania', 'Zambia', 'Mozambique'], is_active: true },
  { name: 'Tobacco', symbol: 'TBC', unit: 'MT', category: 'Cash Crop', countries: ['Zimbabwe', 'Malawi', 'Zambia', 'Mozambique'], is_active: true },
  { name: 'Tea', symbol: 'TEA', unit: 'MT', category: 'Beverage Crop', countries: ['Kenya', 'Tanzania', 'Uganda', 'Malawi', 'Rwanda'], is_active: true },
  { name: 'Cocoa', symbol: 'CCO', unit: 'MT', category: 'Beverage Crop', countries: ['Tanzania', 'Uganda'], is_active: true },
  { name: 'Cashew Nuts', symbol: 'CSH', unit: 'MT', category: 'Nut', countries: ['Tanzania', 'Mozambique', 'Kenya'], is_active: true },
  { name: 'Sesame', symbol: 'SSM', unit: 'MT', category: 'Oil Seed', countries: ['Tanzania', 'Ethiopia', 'Uganda', 'Mozambique'], is_active: true },
  { name: 'Sorghum', symbol: 'SRG', unit: 'MT', category: 'Grain', countries: ['Zimbabwe', 'Kenya', 'Tanzania', 'Ethiopia'], is_active: true },
  { name: 'Rice', symbol: 'RCE', unit: 'MT', category: 'Grain', countries: ['Tanzania', 'Mozambique', 'Kenya', 'Uganda'], is_active: true },
  { name: 'Groundnuts', symbol: 'GNT', unit: 'MT', category: 'Oil Seed', countries: ['Malawi', 'Zimbabwe', 'Zambia', 'Tanzania', 'Mozambique'], is_active: true },
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
export default function CommoditiesPage() {
  const supabase = createClient();

  const [commodities, setCommodities] = useState<TradingCommodity[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [search, setSearch] = useState('');

  // Editing
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<TradingCommodity>({ name: '', symbol: '', unit: 'MT', category: 'Grain', countries: [], is_active: true });

  // Adding
  const [adding, setAdding] = useState(false);
  const [newForm, setNewForm] = useState<TradingCommodity>({ name: '', symbol: '', unit: 'MT', category: 'Grain', countries: [], is_active: true });

  // ── Load ────────────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('site_config')
      .select('*')
      .eq('key', 'trading_commodities')
      .single();

    if (error && error.code !== 'PGRST116') {
      setToast({ message: 'Failed to load commodities', type: 'error' });
    }

    setCommodities(data?.value ? (data.value as TradingCommodity[]) : DEFAULT_COMMODITIES);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Save ────────────────────────────────────────────────────────────────
  const saveCommodities = useCallback(async (updated: TradingCommodity[]) => {
    setSaving(true);
    const { error } = await supabase
      .from('site_config')
      .upsert(
        {
          key: 'trading_commodities',
          value: updated,
          description: 'Trading commodities list and configuration',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'key' }
      );

    if (error) {
      setToast({ message: 'Failed to save commodities', type: 'error' });
    } else {
      setCommodities(updated);
      setToast({ message: 'Commodities saved successfully', type: 'success' });
    }
    setSaving(false);
  }, []);

  // ── Country toggle helper ───────────────────────────────────────────────
  const toggleCountry = (form: TradingCommodity, setForm: (f: TradingCommodity) => void, country: string) => {
    const countries = form.countries.includes(country)
      ? form.countries.filter((c) => c !== country)
      : [...form.countries, country];
    setForm({ ...form, countries });
  };

  // ── Handlers ────────────────────────────────────────────────────────────
  const startEdit = (idx: number) => { setEditIdx(idx); setEditForm({ ...commodities[idx] }); };
  const saveEdit = () => { if (editIdx === null) return; const u = [...commodities]; u[editIdx] = editForm; saveCommodities(u); setEditIdx(null); };
  const deleteCommodity = (idx: number) => { saveCommodities(commodities.filter((_, i) => i !== idx)); };
  const toggleActive = (idx: number) => {
    const u = [...commodities];
    u[idx] = { ...u[idx], is_active: !u[idx].is_active };
    saveCommodities(u);
  };
  const addCommodity = () => {
    if (!newForm.name.trim() || !newForm.symbol.trim()) return;
    saveCommodities([...commodities, { ...newForm }]);
    setAdding(false);
    setNewForm({ name: '', symbol: '', unit: 'MT', category: 'Grain', countries: [], is_active: true });
  };

  const filtered = commodities.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.symbol.toLowerCase().includes(search.toLowerCase()) ||
    c.category.toLowerCase().includes(search.toLowerCase())
  );

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
            <Boxes size={28} className="text-[#5DB347]" />
            Trading Commodities
          </h1>
          <p className="text-gray-500 mt-1">Manage which commodities can be traded on the platform</p>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#5DB347] text-white rounded-xl hover:bg-[#4ea23c] transition font-medium text-sm"
        >
          <Plus size={16} /> Add Commodity
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search commodities..."
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none bg-white"
        />
      </div>

      {/* Add Form */}
      {adding && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-[#1B2A4A] mb-3">New Commodity</h3>
          <div className="grid grid-cols-4 gap-4 mb-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Name</label>
              <input type="text" value={newForm.name} onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none" placeholder="e.g. Barley" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Symbol</label>
              <input type="text" value={newForm.symbol} onChange={(e) => setNewForm({ ...newForm, symbol: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm uppercase focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none" placeholder="e.g. BRL" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Unit</label>
              <input type="text" value={newForm.unit} onChange={(e) => setNewForm({ ...newForm, unit: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
              <select value={newForm.category} onChange={(e) => setNewForm({ ...newForm, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none bg-white">
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-500 mb-2">Countries</label>
            <div className="flex flex-wrap gap-2">
              {COUNTRIES.map((country) => (
                <button
                  key={country}
                  onClick={() => toggleCountry(newForm, setNewForm, country)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${newForm.countries.includes(country) ? 'bg-[#5DB347]/10 border-[#5DB347]/30 text-[#5DB347]' : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'}`}
                >
                  {country}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={addCommodity} className="px-4 py-2 bg-[#5DB347] text-white rounded-lg text-sm font-medium hover:bg-[#4ea23c] transition"><Save size={14} className="inline mr-1" /> Save</button>
            <button onClick={() => setAdding(false)} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition">Cancel</button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-2 text-gray-500 text-xs font-medium mb-1"><Boxes size={14} /> Total Commodities</div>
          <p className="text-2xl font-bold text-[#1B2A4A]">{commodities.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-2 text-gray-500 text-xs font-medium mb-1"><ToggleRight size={14} className="text-green-500" /> Active</div>
          <p className="text-2xl font-bold text-[#5DB347]">{commodities.filter((c) => c.is_active).length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-2 text-gray-500 text-xs font-medium mb-1"><Tag size={14} /> Categories</div>
          <p className="text-2xl font-bold text-[#1B2A4A]">{new Set(commodities.map((c) => c.category)).size}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="text-left px-5 py-3 font-medium">Commodity</th>
                <th className="text-left px-5 py-3 font-medium">Symbol</th>
                <th className="text-left px-5 py-3 font-medium">Unit</th>
                <th className="text-left px-5 py-3 font-medium">Category</th>
                <th className="text-left px-5 py-3 font-medium">Countries</th>
                <th className="text-center px-5 py-3 font-medium">Status</th>
                <th className="text-right px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((c, idx) => {
                const realIdx = commodities.indexOf(c);
                return (
                  <tr key={idx} className="hover:bg-gray-50/50 transition">
                    {editIdx === realIdx ? (
                      <>
                        <td className="px-5 py-3">
                          <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none" />
                        </td>
                        <td className="px-5 py-3">
                          <input type="text" value={editForm.symbol} onChange={(e) => setEditForm({ ...editForm, symbol: e.target.value.toUpperCase() })}
                            className="w-20 px-2 py-1.5 border border-gray-200 rounded-lg text-sm uppercase focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none" />
                        </td>
                        <td className="px-5 py-3">
                          <input type="text" value={editForm.unit} onChange={(e) => setEditForm({ ...editForm, unit: e.target.value })}
                            className="w-16 px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none" />
                        </td>
                        <td className="px-5 py-3">
                          <select value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                            className="px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none bg-white">
                            {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                          </select>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex flex-wrap gap-1">
                            {COUNTRIES.map((country) => (
                              <button key={country} onClick={() => toggleCountry(editForm, setEditForm, country)}
                                className={`px-2 py-0.5 rounded text-xs font-medium transition ${editForm.countries.includes(country) ? 'bg-[#5DB347]/15 text-[#5DB347]' : 'bg-gray-100 text-gray-400'}`}>
                                {country.slice(0, 3)}
                              </button>
                            ))}
                          </div>
                        </td>
                        <td className="px-5 py-3 text-center">
                          <button onClick={() => setEditForm({ ...editForm, is_active: !editForm.is_active })}>
                            {editForm.is_active ? <ToggleRight size={22} className="text-[#5DB347]" /> : <ToggleLeft size={22} className="text-gray-400" />}
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
                        <td className="px-5 py-3 font-medium text-[#1B2A4A]">{c.name}</td>
                        <td className="px-5 py-3">
                          <span className="bg-[#1B2A4A]/5 text-[#1B2A4A] px-2 py-0.5 rounded text-xs font-mono font-semibold">{c.symbol}</span>
                        </td>
                        <td className="px-5 py-3 text-gray-600">{c.unit}</td>
                        <td className="px-5 py-3">
                          <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium">{c.category}</span>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex flex-wrap gap-1">
                            {c.countries.slice(0, 3).map((co) => (
                              <span key={co} className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-xs">{co}</span>
                            ))}
                            {c.countries.length > 3 && (
                              <span className="text-xs text-gray-400">+{c.countries.length - 3}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-3 text-center">
                          <button onClick={() => toggleActive(realIdx)} title={c.is_active ? 'Active' : 'Inactive'}>
                            {c.is_active ? <ToggleRight size={22} className="text-[#5DB347]" /> : <ToggleLeft size={22} className="text-gray-400" />}
                          </button>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => startEdit(realIdx)} className="p-1.5 text-gray-400 hover:text-[#5DB347] hover:bg-[#5DB347]/10 rounded-lg transition"><Pencil size={14} /></button>
                            <button onClick={() => deleteCommodity(realIdx)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="p-12 text-center">
            <Boxes size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">{search ? 'No commodities match your search.' : 'No commodities configured.'}</p>
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
