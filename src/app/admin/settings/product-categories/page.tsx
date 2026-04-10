'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Package,
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sprout,
  Droplets,
  Bug,
  Tractor,
  Beef,
  Stethoscope,
  CloudRain,
  BoxIcon,
  Wrench,
  HardHat,
} from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────

interface ProductCategory {
  name: string;
  description: string;
  icon: string;
  is_active: boolean;
}

const ICON_OPTIONS = [
  'Sprout', 'Droplets', 'Bug', 'Tractor', 'Beef', 'Stethoscope',
  'CloudRain', 'BoxIcon', 'Wrench', 'HardHat', 'Package',
];

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Sprout, Droplets, Bug, Tractor, Beef, Stethoscope,
  CloudRain, BoxIcon, Wrench, HardHat, Package,
};

const SEED_DATA: ProductCategory[] = [
  // Crops & Seeds
  { name: 'Seeds', description: 'Crop seeds and planting materials', icon: 'Sprout', is_active: true },
  { name: 'Seedlings & Nursery', description: 'Seedlings, transplants, and nursery stock', icon: 'Sprout', is_active: true },
  { name: 'Grain & Cereals', description: 'Maize, wheat, sorghum, millet, rice', icon: 'Sprout', is_active: true },
  { name: 'Oilseeds', description: 'Sunflower, soya, groundnuts, sesame', icon: 'Sprout', is_active: true },
  { name: 'Pulses & Legumes', description: 'Beans, cowpeas, chickpeas, lentils', icon: 'Sprout', is_active: true },
  { name: 'Vegetables', description: 'Fresh vegetable seeds and transplants', icon: 'Sprout', is_active: true },
  { name: 'Fruit & Orchards', description: 'Fruit trees, vines, and berry plants', icon: 'Sprout', is_active: true },
  { name: 'Herbs & Spices', description: 'Culinary and medicinal herbs, spices', icon: 'Sprout', is_active: true },
  { name: 'Flowers & Floriculture', description: 'Cut flowers, ornamental plants', icon: 'Sprout', is_active: true },
  { name: 'Coffee & Tea', description: 'Coffee and tea planting materials', icon: 'Sprout', is_active: true },
  { name: 'Nuts & Kernels', description: 'Macadamia, cashew, pecan', icon: 'Sprout', is_active: true },
  // Inputs & Chemicals
  { name: 'Fertilisers', description: 'Organic and chemical fertilisers for crop nutrition', icon: 'Droplets', is_active: true },
  { name: 'Pesticides', description: 'Insecticides and pest control products', icon: 'Bug', is_active: true },
  { name: 'Herbicides', description: 'Weed control products', icon: 'Bug', is_active: true },
  { name: 'Fungicides', description: 'Fungal disease control products', icon: 'Bug', is_active: true },
  { name: 'Biological Inputs', description: 'Bio-pesticides, bio-fertilisers, beneficial insects', icon: 'Bug', is_active: true },
  { name: 'Soil Amendments & Compost', description: 'Lime, gypsum, compost, mulch', icon: 'Droplets', is_active: true },
  // Livestock & Animal
  { name: 'Animal Feed', description: 'Feed and supplements for livestock', icon: 'Beef', is_active: true },
  { name: 'Veterinary Products', description: 'Animal health and veterinary medicines', icon: 'Stethoscope', is_active: true },
  { name: 'Livestock & Genetics', description: 'Breeding stock, semen, embryos', icon: 'Beef', is_active: true },
  { name: 'Poultry', description: 'Day-old chicks, layers, broilers, feed', icon: 'Beef', is_active: true },
  { name: 'Aquaculture & Fisheries', description: 'Fish fingerlings, pond equipment, feed', icon: 'Droplets', is_active: true },
  { name: 'Dairy', description: 'Dairy equipment, cultures, supplies', icon: 'Beef', is_active: true },
  { name: 'Beekeeping & Honey', description: 'Hives, extractors, bee suits', icon: 'Beef', is_active: true },
  // Equipment & Machinery
  { name: 'Farm Equipment & Machinery', description: 'Tractors, ploughs, harvesters', icon: 'Tractor', is_active: true },
  { name: 'Irrigation Systems', description: 'Drip, sprinkler, and pivot irrigation', icon: 'CloudRain', is_active: true },
  { name: 'Hand Tools & Implements', description: 'Hoes, shovels, machetes, shears', icon: 'Wrench', is_active: true },
  { name: 'Spare Parts & Accessories', description: 'Replacement parts for farm machinery', icon: 'Wrench', is_active: true },
  { name: 'Solar & Renewable Energy', description: 'Solar pumps, panels, battery systems', icon: 'Wrench', is_active: true },
  { name: 'Greenhouses & Tunnels', description: 'Shade nets, poly tunnels, greenhouses', icon: 'BoxIcon', is_active: true },
  { name: 'Drones & Precision Ag', description: 'Drones, sensors, GPS guidance', icon: 'Tractor', is_active: true },
  // Processing & Post-Harvest
  { name: 'Processing Equipment', description: 'Mills, presses, graders, sorters', icon: 'Tractor', is_active: true },
  { name: 'Packaging Materials', description: 'Bags, crates, labels, shrink wrap', icon: 'BoxIcon', is_active: true },
  { name: 'Storage & Silos', description: 'Grain bins, hermetic bags, silos', icon: 'BoxIcon', is_active: true },
  { name: 'Cold Chain & Refrigeration', description: 'Cold rooms, refrigerated transport', icon: 'BoxIcon', is_active: true },
  { name: 'Milling & Extraction', description: 'Flour mills, oil presses, juice extractors', icon: 'Tractor', is_active: true },
  { name: 'Drying & Curing', description: 'Solar dryers, dehydrators, curing sheds', icon: 'Wrench', is_active: true },
  // Technology & Services
  { name: 'AgriTech & IoT', description: 'Smart sensors, weather stations, IoT devices', icon: 'Wrench', is_active: true },
  { name: 'Farm Software & Apps', description: 'Farm management, ERP, record-keeping', icon: 'Wrench', is_active: true },
  { name: 'Lab Testing & Soil Analysis', description: 'Soil, water, feed testing services', icon: 'Stethoscope', is_active: true },
  { name: 'Training & Consulting', description: 'Agronomy, business planning, workshops', icon: 'HardHat', is_active: true },
  { name: 'Safety Equipment', description: 'Protective gear, PPE, safety supplies', icon: 'HardHat', is_active: true },
  { name: 'Logistics & Transport', description: 'Delivery, freight, farm-to-market transport', icon: 'Tractor', is_active: true },
  { name: 'Insurance Products', description: 'Crop insurance, livestock insurance', icon: 'HardHat', is_active: true },
  // Enterprise
  { name: 'Enterprise (Custom)', description: 'Custom or bespoke product — contact supplier for details', icon: 'Package', is_active: true },
];

const CONFIG_KEY = 'product_categories';

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

export default function ProductCategoriesConfig() {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [form, setForm] = useState<ProductCategory>({ name: '', description: '', icon: 'Package', is_active: true });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const supabase = createClient();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('site_config')
        .select('value')
        .eq('key', CONFIG_KEY)
        .single();

      if (error || !data) {
        setCategories(SEED_DATA);
      } else {
        setCategories(data.value as ProductCategory[]);
      }
    } catch (err) {
      console.error("[product-categories/page.tsx] fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const saveToDb = async (updated: ProductCategory[]) => {
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
        .insert({ key: CONFIG_KEY, value: updated, description: 'Supplier product categories' }));
    }

    if (error) {
      setToast({ message: 'Failed to save categories', type: 'error' });
    } else {
      setCategories(updated);
      setToast({ message: 'Product categories saved successfully', type: 'success' });
    }
    setSaving(false);
  };

  const openAdd = () => {
    setEditingIndex(null);
    setForm({ name: '', description: '', icon: 'Package', is_active: true });
    setModalOpen(true);
  };

  const openEdit = (index: number) => {
    setEditingIndex(index);
    setForm({ ...categories[index] });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    const updated = [...categories];
    if (editingIndex !== null) {
      updated[editingIndex] = form;
    } else {
      updated.push(form);
    }
    setModalOpen(false);
    await saveToDb(updated);
  };

  const handleDelete = async (index: number) => {
    if (!confirm(`Delete "${categories[index].name}"?`)) return;
    const updated = categories.filter((_, i) => i !== index);
    await saveToDb(updated);
  };

  const toggleActive = async (index: number) => {
    const updated = [...categories];
    updated[index] = { ...updated[index], is_active: !updated[index].is_active };
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
          <h1 className="text-2xl font-bold text-gray-900">Product Categories</h1>
          <p className="text-gray-500 mt-1">Manage supplier product categories for the marketplace</p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#5DB347] text-white rounded-lg text-sm font-medium hover:bg-[#449933] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">Category</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3 hidden md:table-cell">Description</th>
              <th className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">Status</th>
              <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {categories.map((cat, i) => {
              const IconComp = iconMap[cat.icon] || Package;
              return (
                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-50 rounded-lg">
                        <IconComp className="w-4 h-4 text-[#5DB347]" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">{cat.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-500 hidden md:table-cell">{cat.description}</td>
                  <td className="px-5 py-3 text-center">
                    <button onClick={() => toggleActive(i)}>
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${cat.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {cat.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </button>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(i)} className="p-1.5 text-gray-400 hover:text-[#1B2A4A] hover:bg-gray-100 rounded-lg transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(i)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {categories.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-12 text-center text-gray-400 text-sm">No categories configured</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingIndex !== null ? 'Edit Category' : 'Add Category'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#5DB347] focus:border-transparent outline-none"
                  placeholder="e.g. Farm Equipment"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#5DB347] focus:border-transparent outline-none"
                  rows={2}
                  placeholder="Brief description of this category"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                <div className="flex flex-wrap gap-2">
                  {ICON_OPTIONS.map((ic) => {
                    const Ic = iconMap[ic] || Package;
                    return (
                      <button
                        key={ic}
                        type="button"
                        onClick={() => setForm({ ...form, icon: ic })}
                        className={`p-2 rounded-lg border transition-colors ${form.icon === ic ? 'border-[#5DB347] bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}
                      >
                        <Ic className={`w-4 h-4 ${form.icon === ic ? 'text-[#5DB347]' : 'text-gray-500'}`} />
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  className="rounded border-gray-300 text-[#5DB347] focus:ring-[#5DB347]"
                />
                <label className="text-sm text-gray-700">Active</label>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 rounded-lg border border-gray-200 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.name.trim()}
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
