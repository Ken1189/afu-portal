'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  Trash2,
  Pencil,
  Eye,
  EyeOff,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  GripVertical,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

// ── Types ─────────────────────────────────────────────────

interface FaqItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  display_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

interface FormData {
  category: string;
  question: string;
  answer: string;
  display_order: number;
  is_published: boolean;
}

const emptyForm: FormData = {
  category: 'general',
  question: '',
  answer: '',
  display_order: 0,
  is_published: true,
};

const CATEGORIES = [
  { value: 'general', label: 'General', color: '#3B82F6' },
  { value: 'membership', label: 'Membership', color: '#5DB347' },
  { value: 'payments', label: 'Payments', color: '#8B5CF6' },
  { value: 'farming', label: 'Farming', color: '#F59E0B' },
  { value: 'loans', label: 'Loans', color: '#EF4444' },
  { value: 'sponsorship', label: 'Sponsorship', color: '#EC4899' },
];

// ── Toast ─────────────────────────────────────────────────

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
      {type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
      {message}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────

export default function FaqAdmin() {
  const [items, setItems] = useState<FaqItem[]>([]);
  const [_loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({});

  const supabase = createClient();

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('faq_items')
      .select('*')
      .order('display_order', { ascending: true });
    if (error) {
      setToast({ message: 'Failed to load FAQ items', type: 'error' });
    } else {
      setItems(data || []);
      // Auto-expand all categories
      const cats: Record<string, boolean> = {};
      (data || []).forEach((d) => { cats[d.category] = true; });
      setExpandedCats(cats);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  // Group by category
  const grouped = CATEGORIES.map((cat) => ({
    ...cat,
    items: items.filter((i) => i.category === cat.value),
  })).filter((g) => g.items.length > 0);

  const openAdd = () => {
    setEditingId(null);
    setForm({ ...emptyForm, display_order: items.length + 1 });
    setModalOpen(true);
  };

  const openEdit = (item: FaqItem) => {
    setEditingId(item.id);
    setForm({
      category: item.category,
      question: item.question,
      answer: item.answer,
      display_order: item.display_order,
      is_published: item.is_published,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.question.trim() || !form.answer.trim()) {
      setToast({ message: 'Question and answer are required', type: 'error' });
      return;
    }
    setSaving(true);
    const payload = {
      category: form.category,
      question: form.question.trim(),
      answer: form.answer.trim(),
      display_order: form.display_order,
      is_published: form.is_published,
    };

    let error;
    if (editingId) {
      ({ error } = await supabase.from('faq_items').update(payload).eq('id', editingId));
    } else {
      ({ error } = await supabase.from('faq_items').insert(payload));
    }

    if (error) {
      setToast({ message: `Failed to ${editingId ? 'update' : 'create'} FAQ item`, type: 'error' });
    } else {
      setToast({ message: `FAQ item ${editingId ? 'updated' : 'created'} successfully`, type: 'success' });
      setModalOpen(false);
      fetchItems();
    }
    setSaving(false);
  };

  const togglePublished = async (id: string, current: boolean) => {
    const { error } = await supabase.from('faq_items').update({ is_published: !current }).eq('id', id);
    if (error) {
      setToast({ message: 'Failed to update', type: 'error' });
    } else {
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, is_published: !current } : i)));
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('faq_items').delete().eq('id', id);
    if (error) {
      setToast({ message: 'Failed to delete FAQ item', type: 'error' });
    } else {
      setToast({ message: 'FAQ item deleted', type: 'success' });
      setItems((prev) => prev.filter((i) => i.id !== id));
    }
    setDeleteConfirm(null);
  };

  const toggleCategory = (cat: string) => {
    setExpandedCats((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">FAQ Manager</h1>
          <p className="text-sm text-gray-500 mt-1">Manage frequently asked questions by category</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-opacity"
          style={{ background: '#5DB347' }}
        >
          <Plus className="w-4 h-4" />
          Add FAQ
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Total</p>
          <p className="text-2xl font-bold text-[#1B2A4A] mt-1">{items.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Published</p>
          <p className="text-2xl font-bold text-[#5DB347] mt-1">{items.filter((i) => i.is_published).length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Categories</p>
          <p className="text-2xl font-bold text-[#8B5CF6] mt-1">{grouped.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Drafts</p>
          <p className="text-2xl font-bold text-gray-400 mt-1">{items.filter((i) => !i.is_published).length}</p>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-xl p-6 border border-gray-100 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-1/3 mb-4" />
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && items.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-[#1B2A4A]">No FAQ items yet</h3>
          <p className="text-sm text-gray-500 mt-1">Add your first frequently asked question</p>
          <button onClick={openAdd} className="mt-4 px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ background: '#5DB347' }}>
            <Plus className="w-4 h-4 inline mr-1" />Add FAQ
          </button>
        </div>
      )}

      {/* Accordion by category */}
      {!loading && grouped.map((group) => (
        <div key={group.value} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <button
            onClick={() => toggleCategory(group.value)}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full" style={{ background: group.color }} />
              <h3 className="text-sm font-semibold text-[#1B2A4A]">{group.label}</h3>
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{group.items.length}</span>
            </div>
            {expandedCats[group.value] ? (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            )}
          </button>

          {expandedCats[group.value] && (
            <div className="border-t border-gray-100 divide-y divide-gray-50">
              {group.items.map((item) => (
                <div key={item.id} className={`p-4 group hover:bg-gray-50/50 transition-colors ${!item.is_published ? 'opacity-50' : ''}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-[#1B2A4A]">{item.question}</p>
                        {!item.is_published && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">Draft</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.answer}</p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <button
                        onClick={() => togglePublished(item.id, item.is_published)}
                        className={`p-1.5 rounded-lg transition-colors ${item.is_published ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}
                        title={item.is_published ? 'Unpublish' : 'Publish'}
                      >
                        {item.is_published ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => openEdit(item)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(item.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-[#1B2A4A] mb-2">Delete FAQ Item?</h3>
            <p className="text-sm text-gray-500 mb-4">This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-xl max-w-lg w-full shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-[#1B2A4A]">
                {editingId ? 'Edit FAQ Item' : 'Add FAQ Item'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-200 focus:border-green-400 outline-none"
                >
                  {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>

              {/* Question */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Question *</label>
                <input
                  value={form.question}
                  onChange={(e) => setForm({ ...form, question: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-200 focus:border-green-400 outline-none"
                  placeholder="What is the African Farming Union?"
                />
              </div>

              {/* Answer */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Answer *</label>
                <textarea
                  value={form.answer}
                  onChange={(e) => setForm({ ...form, answer: e.target.value })}
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-200 focus:border-green-400 outline-none resize-none"
                  placeholder="Provide a detailed answer..."
                />
              </div>

              {/* Order + Published */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Display Order</label>
                  <input
                    type="number"
                    value={form.display_order}
                    onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-200 focus:border-green-400 outline-none"
                  />
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.is_published}
                      onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-green-500 focus:ring-green-200"
                    />
                    <span className="text-sm text-gray-600">Published</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-5 border-t border-gray-100">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100">Cancel</button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                style={{ background: '#5DB347' }}
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {editingId ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
