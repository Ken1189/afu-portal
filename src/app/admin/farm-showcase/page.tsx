'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Sprout, Plus, Pencil, Trash2, Save,
  Loader2, X, CheckCircle2, AlertCircle, MapPin, Ruler,
  Leaf, Eye, EyeOff, GripVertical, Image as ImageIcon,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

/* ─── Types ─── */

interface FarmShowcase {
  id: string;
  slug: string;
  display_name: string;
  story: string | null;
  hero_photo_url: string | null;
  country: string;
  region: string | null;
  crops: string[];
  farm_size_ha: number | null;
  is_showcase: boolean;
  display_order: number;
  created_at: string;
}

interface FarmFormData {
  display_name: string;
  slug: string;
  story: string;
  hero_photo_url: string;
  country: string;
  region: string;
  crops: string;
  farm_size_ha: string;
  is_showcase: boolean;
  display_order: string;
}

const EMPTY_FORM: FarmFormData = {
  display_name: '', slug: '', story: '', hero_photo_url: '',
  country: 'Zimbabwe', region: '', crops: '', farm_size_ha: '',
  is_showcase: true, display_order: '0',
};

const COUNTRIES = [
  'Zimbabwe', 'Botswana', 'Tanzania', 'Ethiopia', 'Kenya', 'Ghana',
  'Nigeria', 'South Africa', 'Uganda', 'Rwanda', 'Malawi', 'Zambia',
  'Mozambique', 'Senegal', 'Mali', 'Cameroon', 'Ivory Coast',
  'Democratic Republic of Congo', 'Madagascar', 'Angola',
];

/* ─── Fallback showcase farms (same as public page) ─── */
const FALLBACK_FARMS: FarmShowcase[] = [
  {
    id: 'showcase-1', slug: 'watson-and-fine', display_name: 'Watson & Fine Group',
    story: 'Watson & Fine is a diversified commercial farming operation and the founding farm behind AFU. Led by Peter Watson, the group spans 120 hectares across Mashonaland with operations in high-value horticulture, tree crops, and livestock.',
    hero_photo_url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=900&h=400&fit=crop',
    country: 'Zimbabwe', region: 'Mashonaland', crops: ['Blueberries', 'Macadamia', 'Citrus', 'Cattle'],
    farm_size_ha: 120, is_showcase: true, display_order: 1, created_at: new Date().toISOString(),
  },
  {
    id: 'showcase-2', slug: 'watson-cassava', display_name: 'Watson Cassava Starch',
    story: 'A dedicated cassava production and starch extraction operation supplying industrial starch to regional manufacturers.',
    hero_photo_url: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=900&h=400&fit=crop',
    country: 'Zimbabwe', region: 'Mashonaland East', crops: ['Cassava', 'Starch Processing'],
    farm_size_ha: 45, is_showcase: true, display_order: 2, created_at: new Date().toISOString(),
  },
  {
    id: 'dummy-1', slug: 'grace-moyo', display_name: 'Grace Moyo',
    story: 'I have been farming maize and groundnuts in Mashonaland West for 14 years.',
    hero_photo_url: 'https://images.unsplash.com/photo-1601648764658-cf37e8c89b70?w=1200&h=600&fit=crop',
    country: 'Zimbabwe', region: 'Mashonaland West', crops: ['Maize', 'Groundnuts', 'Vegetables'],
    farm_size_ha: 4.5, is_showcase: true, display_order: 3, created_at: new Date().toISOString(),
  },
  {
    id: 'dummy-2', slug: 'joseph-odhiambo', display_name: 'Joseph Odhiambo',
    story: 'I grow tea and avocados in the highlands of Kisii.',
    hero_photo_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1200&h=600&fit=crop',
    country: 'Kenya', region: 'Kisii County', crops: ['Tea', 'Avocado'],
    farm_size_ha: 7, is_showcase: true, display_order: 4, created_at: new Date().toISOString(),
  },
  {
    id: 'dummy-3', slug: 'amina-hussein', display_name: 'Amina Hussein',
    story: 'I am a second-generation rice farmer in the Kilombero Valley.',
    hero_photo_url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=1200&h=600&fit=crop',
    country: 'Tanzania', region: 'Morogoro', crops: ['Rice'],
    farm_size_ha: 3, is_showcase: true, display_order: 5, created_at: new Date().toISOString(),
  },
  {
    id: 'dummy-4', slug: 'sipho-dlamini', display_name: 'Sipho Dlamini',
    story: 'I run a diversified livestock operation in the Central District of Botswana.',
    hero_photo_url: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=1200&h=600&fit=crop',
    country: 'Botswana', region: 'Central District', crops: ['Livestock'],
    farm_size_ha: 120, is_showcase: true, display_order: 6, created_at: new Date().toISOString(),
  },
  {
    id: 'dummy-5', slug: 'fatima-diallo', display_name: 'Fatima Diallo',
    story: 'I started farming with just 0.5 hectares and a hand pump.',
    hero_photo_url: 'https://images.unsplash.com/photo-1546484958-7ee64d4dd76e?w=1200&h=600&fit=crop',
    country: 'Ghana', region: 'Greater Accra', crops: ['Tomatoes', 'Peppers', 'Lettuce'],
    farm_size_ha: 2, is_showcase: true, display_order: 7, created_at: new Date().toISOString(),
  },
];

/* ─── Toast ─── */
function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
      {type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
      {message}
    </div>
  );
}

/* ─── Component ─── */

export default function FarmShowcaseAdmin() {
  const [farms, setFarms] = useState<FarmShowcase[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FarmFormData>(EMPTY_FORM);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const supabase = createClient();

  /* ─── Fetch ─── */
  const fetchFarms = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('farmer_public_profiles')
        .select('*')
        .order('display_order', { ascending: true });
      if (error || !data || data.length === 0) {
        setFarms(FALLBACK_FARMS);
      } else {
        setFarms(data.map((f: Record<string, unknown>) => ({
          id: f.id as string,
          slug: (f.slug as string) || '',
          display_name: (f.display_name as string) || '',
          story: (f.story as string) || null,
          hero_photo_url: (f.hero_photo_url as string) || null,
          country: (f.country as string) || '',
          region: (f.region as string) || null,
          crops: (f.crops as string[]) || [],
          farm_size_ha: (f.farm_size_ha as number) || null,
          is_showcase: f.is_showcase !== false,
          display_order: (f.display_order as number) || 0,
          created_at: (f.created_at as string) || new Date().toISOString(),
        })));
      }
    } catch {
      setFarms(FALLBACK_FARMS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFarms(); }, [fetchFarms]);

  /* ─── Form helpers ─── */
  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (farm: FarmShowcase) => {
    setEditingId(farm.id);
    setForm({
      display_name: farm.display_name,
      slug: farm.slug,
      story: farm.story || '',
      hero_photo_url: farm.hero_photo_url || '',
      country: farm.country,
      region: farm.region || '',
      crops: (farm.crops || []).join(', '),
      farm_size_ha: farm.farm_size_ha?.toString() || '',
      is_showcase: farm.is_showcase,
      display_order: farm.display_order.toString(),
    });
    setModalOpen(true);
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  /* ─── Save ─── */
  const handleSave = async () => {
    if (!form.display_name.trim()) {
      setToast({ message: 'Farm name is required', type: 'error' });
      return;
    }
    setSaving(true);
    const slug = form.slug.trim() || generateSlug(form.display_name);
    const payload = {
      display_name: form.display_name.trim(),
      slug,
      story: form.story.trim() || null,
      hero_photo_url: form.hero_photo_url.trim() || null,
      country: form.country,
      region: form.region.trim() || null,
      crops: form.crops.split(',').map((c) => c.trim()).filter(Boolean),
      farm_size_ha: form.farm_size_ha ? parseFloat(form.farm_size_ha) : null,
      is_showcase: form.is_showcase,
      display_order: parseInt(form.display_order) || 0,
    };

    try {
      if (editingId && !editingId.startsWith('showcase-') && !editingId.startsWith('dummy-')) {
        const { error } = await supabase
          .from('farmer_public_profiles')
          .update(payload)
          .eq('id', editingId);
        if (error) throw error;
        setToast({ message: 'Farm updated successfully', type: 'success' });
      } else {
        const { error } = await supabase
          .from('farmer_public_profiles')
          .insert(payload);
        if (error) throw error;
        setToast({ message: 'Farm added successfully', type: 'success' });
      }
      setModalOpen(false);
      fetchFarms();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save';
      setToast({ message: msg, type: 'error' });
      // If DB table doesn't exist yet, update local state
      if (editingId) {
        setFarms((prev) =>
          prev.map((f) => (f.id === editingId ? { ...f, ...payload, crops: payload.crops } : f))
        );
      } else {
        const newFarm: FarmShowcase = {
          ...payload,
          id: `local-${Date.now()}`,
          crops: payload.crops,
          created_at: new Date().toISOString(),
        };
        setFarms((prev) => [...prev, newFarm]);
      }
      setModalOpen(false);
      setToast({ message: editingId ? 'Farm updated (local)' : 'Farm added (local)', type: 'success' });
    } finally {
      setSaving(false);
    }
  };

  /* ─── Delete ─── */
  const handleDelete = async (id: string) => {
    try {
      if (!id.startsWith('showcase-') && !id.startsWith('dummy-') && !id.startsWith('local-')) {
        const { error } = await supabase
          .from('farmer_public_profiles')
          .delete()
          .eq('id', id);
        if (error) throw error;
      }
      setFarms((prev) => prev.filter((f) => f.id !== id));
      setToast({ message: 'Farm removed', type: 'success' });
    } catch {
      setFarms((prev) => prev.filter((f) => f.id !== id));
      setToast({ message: 'Farm removed (local)', type: 'success' });
    }
    setDeleteConfirm(null);
  };

  /* ─── Toggle showcase ─── */
  const toggleShowcase = async (farm: FarmShowcase) => {
    const newVal = !farm.is_showcase;
    setFarms((prev) => prev.map((f) => (f.id === farm.id ? { ...f, is_showcase: newVal } : f)));
    try {
      if (!farm.id.startsWith('showcase-') && !farm.id.startsWith('dummy-') && !farm.id.startsWith('local-')) {
        await supabase
          .from('farmer_public_profiles')
          .update({ is_showcase: newVal })
          .eq('id', farm.id);
      }
    } catch { /* local fallback already applied */ }
  };

  const showcaseCount = farms.filter((f) => f.is_showcase).length;
  const totalCount = farms.length;

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A] flex items-center gap-2">
            <Sprout className="w-6 h-6 text-[#5DB347]" />
            Farm Showcase
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage farms displayed on the public <span className="font-medium">/farms</span> page
          </p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold shadow-lg shadow-[#5DB347]/20 hover:-translate-y-0.5 transition-all"
          style={{ background: 'linear-gradient(135deg, #5DB347, #449933)' }}
        >
          <Plus className="w-4 h-4" /> Add Farm
        </button>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-400 uppercase tracking-wider">Total Farms</p>
          <p className="text-2xl font-bold text-[#1B2A4A] mt-1">{totalCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-400 uppercase tracking-wider">Showcased</p>
          <p className="text-2xl font-bold text-[#5DB347] mt-1">{showcaseCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-400 uppercase tracking-wider">Hidden</p>
          <p className="text-2xl font-bold text-gray-400 mt-1">{totalCount - showcaseCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-400 uppercase tracking-wider">Countries</p>
          <p className="text-2xl font-bold text-[#1B2A4A] mt-1">{new Set(farms.map((f) => f.country)).size}</p>
        </div>
      </div>

      {/* ── Farm List ── */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-[#5DB347] animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 w-8"><GripVertical className="w-4 h-4" /></th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500">Farm</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500">Location</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500">Crops</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500">Size</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-500">Visible</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {farms.map((farm) => (
                  <tr key={farm.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 text-gray-300">
                      <span className="text-xs font-mono">{farm.display_order}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {farm.hero_photo_url ? (
                          <img src={farm.hero_photo_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-[#5DB347]/10 flex items-center justify-center">
                            <Sprout className="w-5 h-5 text-[#5DB347]" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-[#1B2A4A]">{farm.display_name}</p>
                          <p className="text-xs text-gray-400">/{farm.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-gray-500">
                        <MapPin className="w-3.5 h-3.5" />
                        {farm.country}{farm.region ? `, ${farm.region}` : ''}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {(farm.crops || []).slice(0, 3).map((c) => (
                          <span key={c} className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-[10px] font-medium">
                            <Leaf className="w-2.5 h-2.5" />{c}
                          </span>
                        ))}
                        {(farm.crops || []).length > 3 && (
                          <span className="text-[10px] text-gray-400 px-1">+{farm.crops.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {farm.farm_size_ha ? (
                        <span className="flex items-center gap-1"><Ruler className="w-3.5 h-3.5" />{farm.farm_size_ha} ha</span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleShowcase(farm)}
                        className={`p-1.5 rounded-lg transition-colors ${farm.is_showcase ? 'text-[#5DB347] hover:bg-green-50' : 'text-gray-300 hover:bg-gray-100'}`}
                        title={farm.is_showcase ? 'Visible on public site' : 'Hidden from public site'}
                      >
                        {farm.is_showcase ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(farm)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-[#5DB347] hover:bg-green-50 transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        {deleteConfirm === farm.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(farm.id)}
                              className="px-2 py-1 rounded-lg bg-red-500 text-white text-xs font-medium hover:bg-red-600"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="p-1 rounded-lg text-gray-400 hover:bg-gray-100"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(farm.id)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            title="Remove"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Add/Edit Modal ── */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setModalOpen(false)}>
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-[#1B2A4A]">
                {editingId ? 'Edit Farm' : 'Add Farm'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Farm / Farmer Name *</label>
                <input
                  type="text"
                  value={form.display_name}
                  onChange={(e) => {
                    setForm({ ...form, display_name: e.target.value, slug: generateSlug(e.target.value) });
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#5DB347]"
                  placeholder="e.g. Watson & Fine Group"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL Slug</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#5DB347] text-gray-500"
                  placeholder="auto-generated-from-name"
                />
              </div>

              {/* Country + Region */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
                  <select
                    value={form.country}
                    onChange={(e) => setForm({ ...form, country: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#5DB347]"
                  >
                    {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
                  <input
                    type="text"
                    value={form.region}
                    onChange={(e) => setForm({ ...form, region: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#5DB347]"
                    placeholder="e.g. Mashonaland"
                  />
                </div>
              </div>

              {/* Crops + Size */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Crops (comma-separated)</label>
                  <input
                    type="text"
                    value={form.crops}
                    onChange={(e) => setForm({ ...form, crops: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#5DB347]"
                    placeholder="Maize, Groundnuts, Vegetables"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Farm Size (hectares)</label>
                  <input
                    type="number"
                    value={form.farm_size_ha}
                    onChange={(e) => setForm({ ...form, farm_size_ha: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#5DB347]"
                    placeholder="e.g. 120"
                    step="0.1"
                  />
                </div>
              </div>

              {/* Hero Image URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <ImageIcon className="w-3.5 h-3.5 inline mr-1" />
                  Hero Photo URL
                </label>
                <input
                  type="text"
                  value={form.hero_photo_url}
                  onChange={(e) => setForm({ ...form, hero_photo_url: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#5DB347]"
                  placeholder="https://images.unsplash.com/..."
                />
                {form.hero_photo_url && (
                  <img src={form.hero_photo_url} alt="Preview" className="mt-2 h-32 w-full object-cover rounded-lg" />
                )}
              </div>

              {/* Story */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Farm Story</label>
                <textarea
                  value={form.story}
                  onChange={(e) => setForm({ ...form, story: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#5DB347] h-28 resize-y"
                  placeholder="Tell the farm's story..."
                />
              </div>

              {/* Display Order + Showcase */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                  <input
                    type="number"
                    value={form.display_order}
                    onChange={(e) => setForm({ ...form, display_order: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#5DB347]"
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer pb-2">
                    <input
                      type="checkbox"
                      checked={form.is_showcase}
                      onChange={(e) => setForm({ ...form, is_showcase: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-[#5DB347] focus:ring-[#5DB347]"
                    />
                    <span className="text-sm text-gray-700">Show on public site</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-xl text-sm text-gray-500 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-white text-sm font-semibold shadow-lg shadow-[#5DB347]/20 hover:-translate-y-0.5 transition-all disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #5DB347, #449933)' }}
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {editingId ? 'Update Farm' : 'Add Farm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
