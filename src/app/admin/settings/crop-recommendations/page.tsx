'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Sprout,
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';

// ── Types ──
interface CropEntry {
  name: string;
  season: string;
  soil_type: string;
  expected_yield: string;
}

interface RegionRecommendation {
  country: string;
  region: string;
  crops: CropEntry[];
}

const COUNTRIES = ['Zimbabwe', 'Uganda', 'Kenya', 'Tanzania', 'Zambia', 'Malawi', 'Mozambique', 'Rwanda', 'Ethiopia'];
const SEASONS = ['Long Rains', 'Short Rains', 'Dry Season', 'Year-round', 'Winter', 'Summer'];
const SOIL_TYPES = ['Loam', 'Clay', 'Sandy', 'Silt', 'Laterite', 'Alluvial', 'Volcanic', 'Black Cotton'];

const DEFAULT_RECOMMENDATIONS: RegionRecommendation[] = [
  {
    country: 'Zimbabwe', region: 'Mashonaland',
    crops: [
      { name: 'Maize', season: 'Long Rains', soil_type: 'Loam', expected_yield: '4-6 tons/ha' },
      { name: 'Tobacco', season: 'Long Rains', soil_type: 'Sandy', expected_yield: '2-3 tons/ha' },
      { name: 'Soybean', season: 'Long Rains', soil_type: 'Loam', expected_yield: '2-3 tons/ha' },
    ],
  },
  {
    country: 'Uganda', region: 'Central',
    crops: [
      { name: 'Coffee (Robusta)', season: 'Year-round', soil_type: 'Laterite', expected_yield: '1-2 tons/ha' },
      { name: 'Banana', season: 'Year-round', soil_type: 'Loam', expected_yield: '15-20 tons/ha' },
      { name: 'Maize', season: 'Long Rains', soil_type: 'Loam', expected_yield: '3-5 tons/ha' },
    ],
  },
  {
    country: 'Kenya', region: 'Central Highlands',
    crops: [
      { name: 'Tea', season: 'Year-round', soil_type: 'Volcanic', expected_yield: '2-3 tons/ha' },
      { name: 'Coffee (Arabica)', season: 'Long Rains', soil_type: 'Volcanic', expected_yield: '1-2 tons/ha' },
      { name: 'Potatoes', season: 'Long Rains', soil_type: 'Volcanic', expected_yield: '15-25 tons/ha' },
    ],
  },
  {
    country: 'Tanzania', region: 'Northern',
    crops: [
      { name: 'Coffee (Arabica)', season: 'Long Rains', soil_type: 'Volcanic', expected_yield: '1-1.5 tons/ha' },
      { name: 'Maize', season: 'Long Rains', soil_type: 'Loam', expected_yield: '3-5 tons/ha' },
      { name: 'Beans', season: 'Short Rains', soil_type: 'Loam', expected_yield: '1-2 tons/ha' },
    ],
  },
];

const CONFIG_KEY = 'crop_recommendations';

export default function CropRecommendationsConfigPage() {
  const [recs, setRecs] = useState<RegionRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [form, setForm] = useState<RegionRecommendation>({ country: 'Zimbabwe', region: '', crops: [] });
  const [newCrop, setNewCrop] = useState<CropEntry>({ name: '', season: 'Long Rains', soil_type: 'Loam', expected_yield: '' });

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
        setRecs(data?.value ?? DEFAULT_RECOMMENDATIONS);
      } catch {
        setRecs(DEFAULT_RECOMMENDATIONS);
        showToast('error', 'Failed to load config. Using defaults.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [showToast]);

  async function save(updated: RegionRecommendation[]) {
    setSaving(true);
    try {
      const supabase = createClient();
      const { data: existing } = await supabase.from('site_config').select('id').eq('key', CONFIG_KEY).single();
      if (existing) {
        const { error } = await supabase.from('site_config').update({ value: updated, updated_at: new Date().toISOString() }).eq('key', CONFIG_KEY);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('site_config').insert({ key: CONFIG_KEY, value: updated, description: 'Crop recommendations by country/region' });
        if (error) throw error;
      }
      setRecs(updated);
      showToast('success', 'Crop recommendations saved successfully.');
    } catch {
      showToast('error', 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  function openAdd() {
    setEditIndex(null);
    setForm({ country: 'Zimbabwe', region: '', crops: [] });
    setNewCrop({ name: '', season: 'Long Rains', soil_type: 'Loam', expected_yield: '' });
    setModalOpen(true);
  }

  function openEdit(idx: number) {
    setEditIndex(idx);
    setForm({ ...recs[idx], crops: recs[idx].crops.map(c => ({ ...c })) });
    setNewCrop({ name: '', season: 'Long Rains', soil_type: 'Loam', expected_yield: '' });
    setModalOpen(true);
  }

  function addCrop() {
    if (!newCrop.name.trim()) return;
    setForm(prev => ({ ...prev, crops: [...prev.crops, { ...newCrop }] }));
    setNewCrop({ name: '', season: 'Long Rains', soil_type: 'Loam', expected_yield: '' });
  }

  function removeCrop(idx: number) {
    setForm(prev => ({ ...prev, crops: prev.crops.filter((_, i) => i !== idx) }));
  }

  function handleSubmit() {
    if (!form.region.trim()) { showToast('error', 'Region name is required.'); return; }
    const updated = [...recs];
    if (editIndex !== null) { updated[editIndex] = form; } else { updated.push(form); }
    setModalOpen(false);
    save(updated);
  }

  function handleDelete(idx: number) {
    if (!confirm('Delete this region entry?')) return;
    save(recs.filter((_, i) => i !== idx));
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
            <Sprout className="w-6 h-6" style={{ color: '#5DB347' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#1B2A4A' }}>Crop Recommendations</h1>
            <p className="text-sm text-gray-500">Manage crop recommendations by country and region</p>
          </div>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-medium shadow-sm hover:opacity-90 transition-opacity" style={{ backgroundColor: '#5DB347' }}>
          <Plus className="w-4 h-4" /> Add Region
        </button>
      </div>

      {/* Accordion cards */}
      <div className="space-y-3">
        {recs.map((rec, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div
              className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
              onClick={() => setExpandedIdx(expandedIdx === i ? null : i)}
            >
              <div className="flex items-center gap-3">
                {expandedIdx === i ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                <div>
                  <span className="font-semibold text-sm" style={{ color: '#1B2A4A' }}>{rec.region}</span>
                  <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">{rec.country}</span>
                </div>
                <span className="text-xs text-gray-400 ml-2">{rec.crops.length} crop{rec.crops.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={e => { e.stopPropagation(); openEdit(i); }} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"><Pencil className="w-4 h-4 text-gray-500" /></button>
                <button onClick={e => { e.stopPropagation(); handleDelete(i); }} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4 text-red-400" /></button>
              </div>
            </div>
            {expandedIdx === i && (
              <div className="px-5 pb-4 border-t border-gray-100">
                <table className="w-full text-sm mt-3">
                  <thead>
                    <tr className="text-xs text-gray-500">
                      <th className="text-left pb-2 font-medium">Crop</th>
                      <th className="text-left pb-2 font-medium">Season</th>
                      <th className="text-left pb-2 font-medium">Soil Type</th>
                      <th className="text-left pb-2 font-medium">Expected Yield</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rec.crops.map((crop, ci) => (
                      <tr key={ci} className="border-t border-gray-50">
                        <td className="py-2 font-medium" style={{ color: '#1B2A4A' }}>{crop.name}</td>
                        <td className="py-2 text-gray-600">{crop.season}</td>
                        <td className="py-2 text-gray-600">{crop.soil_type}</td>
                        <td className="py-2 text-gray-600">{crop.expected_yield}</td>
                      </tr>
                    ))}
                    {rec.crops.length === 0 && (
                      <tr><td colSpan={4} className="py-4 text-center text-gray-400 text-xs">No crops configured for this region.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
        {recs.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center text-gray-400">
            No crop recommendations configured.
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold" style={{ color: '#1B2A4A' }}>{editIndex !== null ? 'Edit Region' : 'Add Region'}</h2>
              <button onClick={() => setModalOpen(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <select value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-200 focus:border-green-400 outline-none">
                    {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Region *</label>
                  <input value={form.region} onChange={e => setForm({ ...form, region: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-200 focus:border-green-400 outline-none" placeholder="e.g. Central Highlands" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Crops</label>
                <div className="space-y-2 mb-3">
                  {form.crops.map((crop, ci) => (
                    <div key={ci} className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg text-sm">
                      <span className="flex-1 font-medium" style={{ color: '#1B2A4A' }}>{crop.name}</span>
                      <span className="text-gray-400">{crop.season}</span>
                      <span className="text-gray-400">{crop.soil_type}</span>
                      <span className="text-gray-400">{crop.expected_yield}</span>
                      <button onClick={() => removeCrop(ci)} className="p-1 hover:bg-red-50 rounded"><X className="w-3.5 h-3.5 text-red-400" /></button>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <input value={newCrop.name} onChange={e => setNewCrop({ ...newCrop, name: e.target.value })} placeholder="Crop name" className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-200 focus:border-green-400 outline-none" />
                  <select value={newCrop.season} onChange={e => setNewCrop({ ...newCrop, season: e.target.value })} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-200 focus:border-green-400 outline-none">
                    {SEASONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <select value={newCrop.soil_type} onChange={e => setNewCrop({ ...newCrop, soil_type: e.target.value })} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-200 focus:border-green-400 outline-none">
                    {SOIL_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <input value={newCrop.expected_yield} onChange={e => setNewCrop({ ...newCrop, expected_yield: e.target.value })} placeholder="e.g. 4-6 tons/ha" className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-200 focus:border-green-400 outline-none" />
                  <button onClick={addCrop} className="flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium rounded-lg text-white hover:opacity-90 transition-opacity" style={{ backgroundColor: '#5DB347' }}>
                    <Plus className="w-4 h-4" /> Add
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
