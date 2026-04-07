'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  MapPin,
  Ruler,
  Sprout,
  Beef,
  Pencil,
  Trash2,
  X,
  Loader2,
  Wheat,
  Tractor,
} from 'lucide-react';
import { useAuth } from '@/lib/supabase/auth-context';
import { createClient } from '@/lib/supabase/client';
import ImageUploader from '@/components/ui/ImageUploader';
import { ALL_AFRICAN_COUNTRIES } from '@/lib/countries';

// ── Types ───────────────────────────────────────────────────────────────────

interface FarmRow {
  id: string;
  user_id: string;
  member_id: string | null;
  name: string;
  description: string | null;
  country: string | null;
  region: string | null;
  hectares: number | null;
  gps_lat: number | null;
  gps_lng: number | null;
  photo_url: string | null;
  status: string | null;
  created_at: string;
}

interface FarmFormData {
  name: string;
  description: string;
  country: string;
  region: string;
  hectares: string;
  gps_lat: string;
  gps_lng: string;
  photo_url: string;
}

const EMPTY_FORM: FarmFormData = {
  name: '',
  description: '',
  country: '',
  region: '',
  hectares: '',
  gps_lat: '',
  gps_lng: '',
  photo_url: '',
};

const AFRICAN_COUNTRIES = [...ALL_AFRICAN_COUNTRIES].sort();

// ── Component ───────────────────────────────────────────────────────────────

export default function MyFarmsPage() {
  const { user } = useAuth();
  const supabase = createClient();

  const [farms, setFarms] = useState<FarmRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FarmFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [counts, setCounts] = useState<Record<string, { crops: number; livestock: number }>>({});

  // ── Fetch farms ──
  const fetchFarms = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error: fetchErr } = await supabase
        .from('farms')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchErr) throw fetchErr;
      setFarms((data || []) as FarmRow[]);

      // Fetch crop & livestock counts per farm
      const farmIds = (data || []).map((f: FarmRow) => f.id);
      if (farmIds.length > 0) {
        const [{ data: plots }, { data: stock }] = await Promise.all([
          supabase.from('farm_plots').select('farm_id').in('farm_id', farmIds),
          supabase.from('livestock').select('farm_id').in('farm_id', farmIds),
        ]);
        const c: Record<string, { crops: number; livestock: number }> = {};
        farmIds.forEach((id: string) => {
          c[id] = { crops: 0, livestock: 0 };
        });
        (plots || []).forEach((p: { farm_id: string }) => {
          if (p.farm_id && c[p.farm_id]) c[p.farm_id].crops++;
        });
        (stock || []).forEach((s: { farm_id: string }) => {
          if (s.farm_id && c[s.farm_id]) c[s.farm_id].livestock++;
        });
        setCounts(c);
      }
    } catch (err) {
      console.error('[farms] fetch error', err);
    }
    setLoading(false);
  }, [user, supabase]);

  useEffect(() => {
    fetchFarms();
  }, [fetchFarms]);

  // ── Modal helpers ──
  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError(null);
    setModalOpen(true);
  };

  const openEdit = (farm: FarmRow) => {
    setEditingId(farm.id);
    setForm({
      name: farm.name || '',
      description: farm.description || '',
      country: farm.country || '',
      region: farm.region || '',
      hectares: farm.hectares?.toString() || '',
      gps_lat: farm.gps_lat?.toString() || '',
      gps_lng: farm.gps_lng?.toString() || '',
      photo_url: farm.photo_url || '',
    });
    setError(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError(null);
  };

  // ── Save ──
  const handleSave = async () => {
    if (!user) return;
    if (!form.name.trim()) {
      setError('Farm name is required');
      return;
    }
    const hect = parseFloat(form.hectares || '0');
    if (isNaN(hect) || hect < 0 || hect > 1_000_000) {
      setError('Hectares must be between 0 and 1,000,000');
      return;
    }

    setSaving(true);
    setError(null);

    const payload = {
      user_id: user.id,
      name: form.name.trim(),
      description: form.description.trim() || null,
      country: form.country || null,
      region: form.region.trim() || null,
      hectares: hect,
      gps_lat: form.gps_lat ? parseFloat(form.gps_lat) : null,
      gps_lng: form.gps_lng ? parseFloat(form.gps_lng) : null,
      photo_url: form.photo_url || null,
      updated_at: new Date().toISOString(),
    };

    try {
      if (editingId) {
        const { error: upErr } = await supabase.from('farms').update(payload).eq('id', editingId);
        if (upErr) throw upErr;
      } else {
        const { error: insErr } = await supabase.from('farms').insert(payload);
        if (insErr) throw insErr;
      }
      await fetchFarms();
      closeModal();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save farm';
      setError(msg);
    }
    setSaving(false);
  };

  // ── Delete ──
  const handleDelete = async (farm: FarmRow) => {
    if (!confirm(`Delete farm "${farm.name}"? This cannot be undone.`)) return;
    try {
      const { error: delErr } = await supabase.from('farms').delete().eq('id', farm.id);
      if (delErr) throw delErr;
      await fetchFarms();
    } catch (err) {
      console.error('[farms] delete error', err);
      alert('Failed to delete farm');
    }
  };

  // ── Totals ──
  const totalHectares = farms.reduce((sum, f) => sum + (Number(f.hectares) || 0), 0);

  // ── Render ──
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A] flex items-center gap-2">
            <Tractor className="w-6 h-6 text-[#5DB347]" />
            My Farms
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {farms.length} farm{farms.length !== 1 ? 's' : ''} ·{' '}
            {totalHectares.toLocaleString()} total hectares
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#5DB347] text-white rounded-xl text-sm font-semibold hover:bg-[#4A9A38] transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Farm
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 text-[#5DB347] animate-spin" />
        </div>
      )}

      {/* Empty state */}
      {!loading && farms.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Tractor className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-[#1B2A4A] mb-1">No farms yet</h3>
          <p className="text-sm text-gray-500 mb-5">
            Add your first farm to start tracking crops, livestock, and activities.
          </p>
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#5DB347] text-white rounded-xl text-sm font-semibold hover:bg-[#4A9A38] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Your First Farm
          </button>
        </div>
      )}

      {/* Grid of farm cards */}
      {!loading && farms.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {farms.map((farm) => {
            const farmCounts = counts[farm.id] || { crops: 0, livestock: 0 };
            return (
              <motion.div
                key={farm.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Photo */}
                <div className="relative h-40 bg-gradient-to-br from-[#5DB347]/20 to-[#1B2A4A]/10">
                  {farm.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={farm.photo_url} alt={farm.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Tractor className="w-12 h-12 text-[#5DB347]/40" />
                    </div>
                  )}
                </div>

                <div className="p-5">
                  {/* Name */}
                  <h3 className="text-lg font-semibold text-[#1B2A4A] mb-1">{farm.name}</h3>

                  {/* Location */}
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
                    <MapPin className="w-3.5 h-3.5" />
                    {farm.region ? `${farm.region}, ` : ''}
                    {farm.country || 'Unknown location'}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 mb-4 pb-4 border-b border-gray-100">
                    <div>
                      <div className="flex items-center gap-1 text-xs text-gray-400 mb-0.5">
                        <Ruler className="w-3 h-3" /> Hectares
                      </div>
                      <p className="text-sm font-semibold text-[#1B2A4A]">
                        {Number(farm.hectares || 0).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 text-xs text-gray-400 mb-0.5">
                        <Sprout className="w-3 h-3" /> Crops
                      </div>
                      <p className="text-sm font-semibold text-[#1B2A4A]">{farmCounts.crops}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 text-xs text-gray-400 mb-0.5">
                        <Beef className="w-3 h-3" /> Livestock
                      </div>
                      <p className="text-sm font-semibold text-[#1B2A4A]">{farmCounts.livestock}</p>
                    </div>
                  </div>

                  {/* Links */}
                  <div className="flex gap-2 mb-3">
                    <Link
                      href={`/farm/crops?farm=${farm.id}`}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-medium hover:bg-green-100 transition-colors"
                    >
                      <Wheat className="w-3.5 h-3.5" />
                      View Crops
                    </Link>
                    <Link
                      href={`/farm/livestock?farm=${farm.id}`}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-xs font-medium hover:bg-amber-100 transition-colors"
                    >
                      <Beef className="w-3.5 h-3.5" />
                      View Livestock
                    </Link>
                  </div>

                  {/* Edit / Delete */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(farm)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-100 transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(farm)}
                      className="flex items-center justify-center px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors"
                      aria-label="Delete farm"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ── Add / Edit Modal ── */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold text-[#1B2A4A]">
                    {editingId ? 'Edit Farm' : 'Add New Farm'}
                  </h2>
                  <button
                    onClick={closeModal}
                    className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                    {error}
                  </div>
                )}

                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Farm Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. Highland Blueberry Farm"
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Description
                    </label>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      rows={2}
                      placeholder="Brief description of the farm"
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] resize-none"
                    />
                  </div>

                  {/* Country + Region */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Country
                      </label>
                      <select
                        value={form.country}
                        onChange={(e) => setForm({ ...form, country: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
                      >
                        <option value="">Select country</option>
                        {AFRICAN_COUNTRIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Region / State
                      </label>
                      <input
                        type="text"
                        value={form.region}
                        onChange={(e) => setForm({ ...form, region: e.target.value })}
                        placeholder="e.g. Mashonaland"
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
                      />
                    </div>
                  </div>

                  {/* Hectares */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Total Hectares <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="1000000"
                      step="0.01"
                      value={form.hectares}
                      onChange={(e) => setForm({ ...form, hectares: e.target.value })}
                      placeholder="0"
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
                    />
                  </div>

                  {/* GPS */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        GPS Latitude
                      </label>
                      <input
                        type="number"
                        step="0.0000001"
                        value={form.gps_lat}
                        onChange={(e) => setForm({ ...form, gps_lat: e.target.value })}
                        placeholder="-17.8252"
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        GPS Longitude
                      </label>
                      <input
                        type="number"
                        step="0.0000001"
                        value={form.gps_lng}
                        onChange={(e) => setForm({ ...form, gps_lng: e.target.value })}
                        placeholder="31.0335"
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
                      />
                    </div>
                  </div>

                  {/* Photo */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Farm Photo
                    </label>
                    <ImageUploader
                      bucket="media"
                      folder={`farms/${user?.id || 'shared'}`}
                      value={form.photo_url}
                      onChange={(url) => setForm({ ...form, photo_url: url })}
                      label="Upload Farm Photo"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-6">
                  <button
                    onClick={closeModal}
                    disabled={saving}
                    className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#5DB347] text-white rounded-xl text-sm font-semibold hover:bg-[#4A9A38] transition-colors disabled:opacity-50"
                  >
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    {editingId ? 'Save Changes' : 'Create Farm'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
