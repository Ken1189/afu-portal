'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Plus, Save, Loader2, CheckCircle2, AlertCircle, X, Trash2, Pencil,
  Eye, EyeOff, Wrench,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

// ── Types ─────────────────────────────────────────────────

interface ServiceItem {
  id: string;
  page: string;
  section: string;
  key: string;
  value: string; // JSON
  display_order: number;
  is_published: boolean;
}

interface ServiceForm {
  key: string;
  title: string;
  description: string;
  link: string;
  icon: string;
  display_order: number;
  is_published: boolean;
}

const emptyForm: ServiceForm = {
  key: '',
  title: '',
  description: '',
  link: '/services',
  icon: 'Wrench',
  display_order: 0,
  is_published: true,
};

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
      {type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
      {message}
    </div>
  );
}

export default function ServicesAdmin() {
  const [items, setItems] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ServiceForm>(emptyForm);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const supabase = createClient();

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('site_content')
      .select('*')
      .eq('section', 'services')
      .order('display_order');
    setItems((data as ServiceItem[]) || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const parseValue = (val: string): Partial<ServiceForm> => {
    try { return JSON.parse(val); } catch { return {}; }
  };

  const openAdd = () => {
    setEditingId(null);
    setForm({ ...emptyForm, display_order: items.length });
    setModalOpen(true);
  };

  const openEdit = (item: ServiceItem) => {
    setEditingId(item.id);
    const parsed = parseValue(item.value);
    setForm({
      key: item.key || '',
      title: parsed.title || '',
      description: parsed.description || '',
      link: parsed.link || '/services',
      icon: parsed.icon || 'Wrench',
      display_order: item.display_order ?? 0,
      is_published: item.is_published ?? true,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    const value = JSON.stringify({
      title: form.title,
      description: form.description,
      link: form.link,
      icon: form.icon,
    });
    const row = {
      page: 'services',
      section: 'services',
      key: form.key || form.title.toLowerCase().replace(/\s+/g, '-'),
      value,
      display_order: form.display_order,
      is_published: form.is_published,
    };

    if (editingId) {
      await supabase.from('site_content').update(row).eq('id', editingId);
    } else {
      await supabase.from('site_content').insert(row);
    }
    setSaving(false);
    setModalOpen(false);
    setToast({ message: editingId ? 'Service updated' : 'Service added', type: 'success' });
    fetchItems();
  };

  const handleDelete = async (id: string) => {
    await supabase.from('site_content').delete().eq('id', id);
    setDeleteConfirm(null);
    setToast({ message: 'Service deleted', type: 'success' });
    fetchItems();
  };

  const togglePublish = async (item: ServiceItem) => {
    await supabase.from('site_content').update({ is_published: !item.is_published }).eq('id', item.id);
    fetchItems();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">Services Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage the service cards shown on the /services page</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium bg-[#5DB347] hover:bg-[#4a9a39] transition-colors">
          <Plus className="w-4 h-4" /> Add Service
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-[#5DB347]" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Wrench className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>No services configured yet. The public page will show default content.</p>
          <button onClick={openAdd} className="mt-4 text-[#5DB347] font-medium text-sm hover:underline">Add your first service</button>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const parsed = parseValue(item.value);
            return (
              <div key={item.id} className={`flex items-center gap-4 p-4 bg-white rounded-xl border ${item.is_published ? 'border-gray-200' : 'border-gray-100 opacity-60'}`}>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#1B2A4A] text-sm">{parsed.title || item.key}</p>
                  <p className="text-xs text-gray-500 truncate">{parsed.description || '—'}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Link: {parsed.link || '—'}</p>
                </div>
                <span className="text-xs text-gray-400 tabular-nums">#{item.display_order}</span>
                <button onClick={() => togglePublish(item)} className="p-1.5 rounded-lg hover:bg-gray-100" title={item.is_published ? 'Unpublish' : 'Publish'}>
                  {item.is_published ? <Eye className="w-4 h-4 text-[#5DB347]" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
                </button>
                <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg hover:bg-gray-100"><Pencil className="w-4 h-4 text-gray-500" /></button>
                <button onClick={() => setDeleteConfirm(item.id)} className="p-1.5 rounded-lg hover:bg-red-50"><Trash2 className="w-4 h-4 text-red-400" /></button>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#1B2A4A]">{editingId ? 'Edit' : 'Add'} Service</h2>
              <button onClick={() => setModalOpen(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Title</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full border rounded-xl px-3 py-2.5 text-sm" placeholder="e.g. Financing" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full border rounded-xl px-3 py-2.5 text-sm" placeholder="Short description..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Link</label>
                  <input value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} className="w-full border rounded-xl px-3 py-2.5 text-sm" placeholder="/services/financing" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Display Order</label>
                  <input type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })} className="w-full border rounded-xl px-3 py-2.5 text-sm" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} className="rounded" id="published" />
                <label htmlFor="published" className="text-sm text-gray-600">Published</label>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl">Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.title.trim()} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium bg-[#5DB347] hover:bg-[#4a9a39] disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {editingId ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <p className="font-semibold text-[#1B2A4A] mb-2">Delete this service?</p>
            <p className="text-sm text-gray-500 mb-4">This cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="px-4 py-2 text-sm text-white bg-red-500 hover:bg-red-600 rounded-xl">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
