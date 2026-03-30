'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  ShieldCheck,
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileText,
  FileCheck,
  FileBadge,
  FileWarning,
  FileKey,
} from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────

interface VerificationRequirement {
  name: string;
  description: string;
  required: boolean;
  document_type: string;
}

const DOCUMENT_TYPES = ['pdf', 'image', 'pdf_or_image', 'any'];

const SEED_DATA: VerificationRequirement[] = [
  { name: 'Business Registration Certificate', description: 'Official company registration document from the relevant authority', required: true, document_type: 'pdf' },
  { name: 'Tax Clearance', description: 'Valid tax clearance certificate or tax compliance status', required: true, document_type: 'pdf' },
  { name: 'Product Quality Certificates', description: 'Quality assurance certifications for products being sold', required: true, document_type: 'pdf_or_image' },
  { name: 'Insurance Certificate', description: 'Business liability or product insurance documentation', required: false, document_type: 'pdf' },
  { name: 'Bank Account Verification', description: 'Bank statement or letter confirming business account details', required: true, document_type: 'pdf' },
];

const CONFIG_KEY = 'supplier_verification_requirements';

const docTypeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  pdf: FileText,
  image: FileBadge,
  pdf_or_image: FileCheck,
  any: FileKey,
};

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

export default function SupplierVerificationConfig() {
  const [requirements, setRequirements] = useState<VerificationRequirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [form, setForm] = useState<VerificationRequirement>({ name: '', description: '', required: true, document_type: 'pdf' });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const supabase = createClient();

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('site_config')
      .select('value')
      .eq('key', CONFIG_KEY)
      .single();

    if (error || !data) {
      setRequirements(SEED_DATA);
    } else {
      setRequirements(data.value as VerificationRequirement[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const saveToDb = async (updated: VerificationRequirement[]) => {
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
        .insert({ key: CONFIG_KEY, value: updated, description: 'Supplier verification requirements' }));
    }

    if (error) {
      setToast({ message: 'Failed to save requirements', type: 'error' });
    } else {
      setRequirements(updated);
      setToast({ message: 'Verification requirements saved successfully', type: 'success' });
    }
    setSaving(false);
  };

  const openAdd = () => {
    setEditingIndex(null);
    setForm({ name: '', description: '', required: true, document_type: 'pdf' });
    setModalOpen(true);
  };

  const openEdit = (index: number) => {
    setEditingIndex(index);
    setForm({ ...requirements[index] });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    const updated = [...requirements];
    if (editingIndex !== null) {
      updated[editingIndex] = form;
    } else {
      updated.push(form);
    }
    setModalOpen(false);
    await saveToDb(updated);
  };

  const handleDelete = async (index: number) => {
    if (!confirm(`Delete "${requirements[index].name}"?`)) return;
    const updated = requirements.filter((_, i) => i !== index);
    await saveToDb(updated);
  };

  const toggleRequired = async (index: number) => {
    const updated = [...requirements];
    updated[index] = { ...updated[index], required: !updated[index].required };
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
          <h1 className="text-2xl font-bold text-gray-900">Supplier Verification Requirements</h1>
          <p className="text-gray-500 mt-1">Manage documents suppliers must submit for verification</p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#5DB347] text-white rounded-lg text-sm font-medium hover:bg-[#449933] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Requirement
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">Requirement</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3 hidden md:table-cell">Description</th>
              <th className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">Doc Type</th>
              <th className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">Required</th>
              <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {requirements.map((req, i) => {
              const IconComp = docTypeIcons[req.document_type] || FileText;
              return (
                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <IconComp className="w-4 h-4 text-[#1B2A4A]" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">{req.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-500 hidden md:table-cell">{req.description}</td>
                  <td className="px-5 py-3 text-center">
                    <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                      {req.document_type.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <button onClick={() => toggleRequired(i)}>
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${req.required ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'}`}>
                        {req.required ? 'Required' : 'Optional'}
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
            {requirements.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-gray-400 text-sm">No verification requirements configured</td>
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
                {editingIndex !== null ? 'Edit Requirement' : 'Add Requirement'}
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
                  placeholder="e.g. Business Registration Certificate"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#5DB347] focus:border-transparent outline-none"
                  rows={2}
                  placeholder="Describe what this document should contain"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
                <select
                  value={form.document_type}
                  onChange={(e) => setForm({ ...form, document_type: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#5DB347] focus:border-transparent outline-none"
                >
                  {DOCUMENT_TYPES.map((dt) => (
                    <option key={dt} value={dt}>{dt.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.required}
                  onChange={(e) => setForm({ ...form, required: e.target.checked })}
                  className="rounded border-gray-300 text-[#5DB347] focus:ring-[#5DB347]"
                />
                <label className="text-sm text-gray-700">Required for verification</label>
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
