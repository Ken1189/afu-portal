'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Handshake, Plus, Pencil, Trash2, Star, StarOff, Save,
  Loader2, X, CheckCircle2, AlertCircle, Globe,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Partner {
  id: string;
  name: string;
  logo_url: string | null;
  website: string | null;
  category: string;
  featured: boolean;
  display_order: number;
  created_at: string;
}

interface PartnerFormData {
  name: string;
  logo_url: string;
  website: string;
  category: string;
  featured: boolean;
  display_order: string;
}

const CATEGORIES = ['DFI', 'Bank', 'Insurance', 'Input Supplier', 'Technology', 'Government', 'NGO'];

const EMPTY_FORM: PartnerFormData = {
  name: '', logo_url: '', website: '', category: 'Technology', featured: false, display_order: '0',
};

const CATEGORY_COLORS: Record<string, string> = {
  DFI: 'bg-blue-100 text-blue-700', Bank: 'bg-green-100 text-green-700',
  Insurance: 'bg-amber-100 text-amber-700', 'Input Supplier': 'bg-purple-100 text-purple-700',
  Technology: 'bg-cyan-100 text-cyan-700', Government: 'bg-red-100 text-red-700',
  NGO: 'bg-emerald-100 text-emerald-700',
};

const DEMO_PARTNERS: Partner[] = [
  { id: 'demo-1', name: 'AfDB', logo_url: null, website: 'https://afdb.org', category: 'DFI', featured: true, display_order: 1, created_at: new Date().toISOString() },
  { id: 'demo-2', name: 'World Bank', logo_url: null, website: 'https://worldbank.org', category: 'DFI', featured: true, display_order: 2, created_at: new Date().toISOString() },
  { id: 'demo-3', name: 'Standard Bank', logo_url: null, website: 'https://standardbank.com', category: 'Bank', featured: false, display_order: 3, created_at: new Date().toISOString() },
];

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
      {type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
      {message}
    </div>
  );
}

export default function AdminPartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<PartnerFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Partner | null>(null);
  const [deleting, setDeleting] = useState(false);

  const supabase = createClient();

  const fetchPartners = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('managed_partners')
      .select('*')
      .order('display_order', { ascending: true });
    if (error) {
      setPartners(DEMO_PARTNERS);
    } else {
      setPartners(data && data.length > 0 ? (data as Partner[]) : DEMO_PARTNERS);
    }
    setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { fetchPartners(); }, [fetchPartners]);

  const openCreate = () => { setEditingId(null); setFormData(EMPTY_FORM); setShowModal(true); };

  const openEdit = (p: Partner) => {
    setEditingId(p.id);
    setFormData({ name: p.name, logo_url: p.logo_url || '', website: p.website || '', category: p.category, featured: p.featured, display_order: String(p.display_order) });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) { setToast({ message: 'Partner name is required', type: 'error' }); return; }
    setSaving(true);
    const payload = {
      name: formData.name,
      logo_url: formData.logo_url || null,
      website: formData.website || null,
      category: formData.category,
      featured: formData.featured,
      display_order: parseInt(formData.display_order, 10) || 0,
    };
    if (editingId && !editingId.startsWith('demo-')) {
      const { error } = await supabase.from('managed_partners').update(payload).eq('id', editingId);
      if (error) { setToast({ message: 'Failed to update partner', type: 'error' }); } else {
        setToast({ message: 'Partner updated', type: 'success' }); setShowModal(false); await fetchPartners();
      }
    } else {
      const { error } = await supabase.from('managed_partners').insert(payload);
      if (error) { setToast({ message: 'Failed to create partner', type: 'error' }); } else {
        setToast({ message: 'Partner added', type: 'success' }); setShowModal(false); await fetchPartners();
      }
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    if (!deleteTarget.id.startsWith('demo-')) {
      const { error } = await supabase.from('managed_partners').delete().eq('id', deleteTarget.id);
      if (error) { setToast({ message: 'Failed to delete partner', type: 'error' }); setDeleting(false); setDeleteTarget(null); return; }
    }
    setPartners((prev) => prev.filter((p) => p.id !== deleteTarget.id));
    setToast({ message: 'Partner deleted', type: 'success' });
    setDeleteTarget(null);
    setDeleting(false);
  };

  const toggleFeatured = async (p: Partner) => {
    if (!p.id.startsWith('demo-')) {
      await supabase.from('managed_partners').update({ featured: !p.featured }).eq('id', p.id);
    }
    setPartners((prev) => prev.map((x) => x.id === p.id ? { ...x, featured: !x.featured } : x));
  };

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">Partner Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage partner logos displayed on the homepage</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#5DB347] text-white text-sm font-medium rounded-lg hover:bg-[#4a9a38] shadow-sm transition-all">
          <Plus className="w-4 h-4" /> Add Partner
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Partners', value: partners.length, color: '#1B2A4A' },
          { label: 'Featured', value: partners.filter((p) => p.featured).length, color: '#5DB347' },
          { label: 'Categories', value: new Set(partners.map((p) => p.category)).size, color: '#3B82F6' },
          { label: 'With Logo', value: partners.filter((p) => p.logo_url).length, color: '#8B5CF6' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-4 border border-gray-100">
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#5DB347] mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading partners...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {partners.map((p) => (
            <div key={p.id} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {p.logo_url ? (
                    <img src={p.logo_url} alt={p.name} className="w-12 h-12 rounded-lg object-contain bg-gray-50 p-1 border border-gray-100" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-[#1B2A4A]/10 flex items-center justify-center">
                      <Handshake className="w-6 h-6 text-[#1B2A4A]" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-[#1B2A4A]">{p.name}</h3>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${CATEGORY_COLORS[p.category] || 'bg-gray-100 text-gray-600'}`}>
                      {p.category}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <span>#{p.display_order}</span>
                </div>
              </div>

              {p.website && (
                <a href={p.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600 mb-3">
                  <Globe className="w-3 h-3" /> {p.website}
                </a>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <button onClick={() => toggleFeatured(p)}
                  className={`flex items-center gap-1 text-xs font-medium transition-colors ${p.featured ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'}`}>
                  {p.featured ? <Star className="w-3.5 h-3.5 fill-yellow-400" /> : <StarOff className="w-3.5 h-3.5" />}
                  {p.featured ? 'Featured' : 'Feature'}
                </button>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(p)} className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => setDeleteTarget(p)} className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 space-y-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#1B2A4A]">{editingId ? 'Edit Partner' : 'Add Partner'}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-gray-100"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Partner Name *</label>
                <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Partner organization name"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
                <input value={formData.logo_url} onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })} placeholder="https://example.com/logo.png"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347]" />
                {formData.logo_url && (
                  <div className="mt-2 p-2 bg-gray-50 rounded-lg inline-block">
                    <img src={formData.logo_url} alt="Preview" className="h-10 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                <input value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} placeholder="https://example.com"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347]">
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                  <input type="number" value={formData.display_order} onChange={(e) => setFormData({ ...formData, display_order: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347]" />
                </div>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <button type="button" onClick={() => setFormData({ ...formData, featured: !formData.featured })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.featured ? 'bg-[#5DB347]' : 'bg-gray-200'}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${formData.featured ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
                <span className="text-sm font-medium text-gray-700">Featured Partner</span>
              </label>
            </div>
            <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleSave} disabled={saving || !formData.name.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-[#5DB347] text-white text-sm font-medium rounded-lg hover:bg-[#4a9a38] disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {editingId ? 'Update' : 'Add Partner'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setDeleteTarget(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-[#1B2A4A]">Delete Partner</h3>
            <p className="text-sm text-gray-600">Are you sure you want to delete &quot;{deleteTarget.name}&quot;? This cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleDelete} disabled={deleting}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50">
                {deleting && <Loader2 className="w-4 h-4 animate-spin" />} Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
