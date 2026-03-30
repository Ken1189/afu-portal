'use client';

import { useState, useEffect } from 'react';
import {
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Plus,
  Trash2,
  Pencil,
  X,
  ExternalLink,
  ArrowLeft,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

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

// ── Types ─────────────────────────────────────────────────

interface FundDocument {
  id: string;
  investor_profile_id: string | null;
  name: string;
  type: string;
  file_url: string;
  created_at: string;
}

interface DocForm {
  name: string;
  type: string;
  file_url: string;
}

const emptyForm: DocForm = { name: '', type: '', file_url: '' };

const DOC_TYPES = [
  'Fund Overview',
  'Term Sheet',
  'Investment Memo',
  'Financial Statement',
  'Impact Report',
  'Due Diligence',
  'Legal Agreement',
  'Pitch Deck',
  'Other',
];

// ── Main Page ─────────────────────────────────────────────

export default function FundDocumentsPage() {
  const supabase = createClient();
  const [docs, setDocs] = useState<FundDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<DocForm>(emptyForm);

  const loadDocs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('investor_documents')
        .select('*')
        .is('investor_profile_id', null)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setDocs(data || []);
    } catch {
      setToast({ message: 'Failed to load documents', type: 'error' });
    }
    setLoading(false);
  };

  useEffect(() => { loadDocs(); }, [supabase]);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (doc: FundDocument) => {
    setEditingId(doc.id);
    setForm({ name: doc.name, type: doc.type, file_url: doc.file_url });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.file_url.trim()) return;
    setSaving(true);
    try {
      if (editingId) {
        const { error } = await supabase
          .from('investor_documents')
          .update({ name: form.name, type: form.type, file_url: form.file_url })
          .eq('id', editingId);
        if (error) throw error;
        setToast({ message: 'Document updated', type: 'success' });
      } else {
        const { error } = await supabase
          .from('investor_documents')
          .insert({
            name: form.name,
            type: form.type,
            file_url: form.file_url,
            investor_profile_id: null,
          });
        if (error) throw error;
        setToast({ message: 'Document added', type: 'success' });
      }
      setModalOpen(false);
      loadDocs();
    } catch {
      setToast({ message: 'Failed to save document', type: 'error' });
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('investor_documents')
        .delete()
        .eq('id', id);
      if (error) throw error;
      setToast({ message: 'Document deleted', type: 'success' });
      loadDocs();
    } catch {
      setToast({ message: 'Failed to delete document', type: 'error' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-[#5DB347] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/60 p-6 md:p-10">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <Link href="/admin/settings" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1B2A4A] mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Settings
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1B2A4A] flex items-center gap-2">
              <FileText className="w-6 h-6 text-[#5DB347]" />
              Fund Documents
            </h1>
            <p className="text-sm text-gray-500 mt-1">Manage public investor data room documents</p>
          </div>
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#5DB347] text-white rounded-xl font-medium text-sm hover:bg-[#4a9a38] transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Document
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="text-left px-5 py-3 font-medium text-gray-600">Name</th>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Type</th>
              <th className="text-left px-5 py-3 font-medium text-gray-600">File</th>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Added</th>
              <th className="text-right px-5 py-3 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {docs.map((doc) => (
              <tr key={doc.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                <td className="px-5 py-3 font-medium text-[#1B2A4A]">{doc.name}</td>
                <td className="px-5 py-3">
                  <span className="px-2 py-0.5 bg-[#1B2A4A]/5 text-[#1B2A4A] rounded text-xs font-medium">{doc.type}</span>
                </td>
                <td className="px-5 py-3">
                  {doc.file_url && (
                    <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="text-[#5DB347] hover:text-[#4a9a38] inline-flex items-center gap-1 text-xs">
                      <ExternalLink className="w-3 h-3" /> View
                    </a>
                  )}
                </td>
                <td className="px-5 py-3 text-gray-500 text-xs">
                  {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : '—'}
                </td>
                <td className="px-5 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => openEdit(doc)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#1B2A4A]">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(doc.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {docs.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-gray-400">No public fund documents</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#1B2A4A]">{editingId ? 'Edit Document' : 'Add Document'}</h2>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Document Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g., AFU Fund Overview 2025"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347] outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347] outline-none"
                >
                  <option value="">Select type...</option>
                  {DOC_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">File URL</label>
                <input
                  type="text"
                  value={form.file_url}
                  onChange={(e) => setForm({ ...form, file_url: e.target.value })}
                  placeholder="https://storage.example.com/doc.pdf"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347] outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100">Cancel</button>
              <button
                onClick={handleSubmit}
                disabled={saving || !form.name.trim() || !form.file_url.trim()}
                className="px-5 py-2 text-sm bg-[#5DB347] text-white rounded-xl font-medium hover:bg-[#4a9a38] disabled:opacity-50 inline-flex items-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {editingId ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
