'use client';

import { useState, useEffect } from 'react';
import {
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Plus,
  Trash2,
  Pencil,
  X,
  ArrowLeft,
  TrendingUp,
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

interface MetricItem {
  id: string;
  label: string;
  value: string;
  unit: string;
  icon: string;
  description: string;
  target: string;
}

const emptyMetric: Omit<MetricItem, 'id'> = {
  label: '',
  value: '',
  unit: '',
  icon: '',
  description: '',
  target: '',
};

const defaultMetrics: MetricItem[] = [
  { id: '1', label: 'Farmers Reached', value: '5000', unit: 'farmers', icon: 'users', description: 'Total farmers on the platform', target: '10000' },
  { id: '2', label: 'Hectares Under Management', value: '12000', unit: 'hectares', icon: 'map', description: 'Total farmland under management', target: '25000' },
  { id: '3', label: 'Loans Disbursed', value: '$2.5M', unit: 'USD', icon: 'banknote', description: 'Total loan value disbursed', target: '$10M' },
  { id: '4', label: 'Insurance Coverage', value: '$8M', unit: 'USD', icon: 'shield', description: 'Total insurance coverage provided', target: '$20M' },
  { id: '5', label: 'Carbon Credits Issued', value: '15000', unit: 'tons', icon: 'leaf', description: 'Carbon credits issued to date', target: '50000' },
  { id: '6', label: 'Jobs Created', value: '340', unit: 'jobs', icon: 'briefcase', description: 'Direct and indirect jobs created', target: '1000' },
];

const ICON_OPTIONS = [
  'users', 'map', 'banknote', 'shield', 'leaf', 'briefcase',
  'trending-up', 'building', 'globe', 'heart', 'zap', 'star',
  'target', 'award', 'truck', 'sprout', 'coins', 'landmark',
];

// ── Main Page ─────────────────────────────────────────────

export default function ImpactMetricsPage() {
  const supabase = createClient();
  const [metrics, setMetrics] = useState<MetricItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<MetricItem, 'id'>>(emptyMetric);

  useEffect(() => {
    async function load() {
      try {
        const { data } = await supabase
          .from('site_config')
          .select('*')
          .eq('key', 'impact_metrics')
          .single();
        if (data) {
          const parsed = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
          setMetrics(Array.isArray(parsed) ? parsed : defaultMetrics);
        } else {
          setMetrics(defaultMetrics);
        }
      } catch {
        setMetrics(defaultMetrics);
      }
      setLoading(false);
    }
    load();
  }, [supabase]);

  const persist = async (updated: MetricItem[]) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('site_config')
        .upsert(
          {
            key: 'impact_metrics',
            value: JSON.stringify(updated),
            value_type: 'json',
            category: 'investor',
            label: 'Impact Metrics',
            description: 'Impact metrics displayed to investors',
          },
          { onConflict: 'key' }
        );
      if (error) throw error;
      setMetrics(updated);
      setToast({ message: 'Impact metrics saved', type: 'success' });
    } catch {
      setToast({ message: 'Failed to save metrics', type: 'error' });
    }
    setSaving(false);
  };

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyMetric);
    setModalOpen(true);
  };

  const openEdit = (m: MetricItem) => {
    setEditingId(m.id);
    setForm({ label: m.label, value: m.value, unit: m.unit, icon: m.icon, description: m.description, target: m.target });
    setModalOpen(true);
  };

  const handleSubmit = () => {
    if (!form.label.trim()) return;
    let updated: MetricItem[];
    if (editingId) {
      updated = metrics.map((m) => m.id === editingId ? { ...m, ...form } : m);
    } else {
      updated = [...metrics, { ...form, id: crypto.randomUUID() }];
    }
    setModalOpen(false);
    persist(updated);
  };

  const handleDelete = (id: string) => {
    persist(metrics.filter((m) => m.id !== id));
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
              <BarChart3 className="w-6 h-6 text-[#5DB347]" />
              Impact Metrics
            </h1>
            <p className="text-sm text-gray-500 mt-1">Manage impact metrics shown to investors</p>
          </div>
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#5DB347] text-white rounded-xl font-medium text-sm hover:bg-[#4a9a38] transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Metric
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {metrics.map((m) => (
          <div key={m.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 relative group">
            <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => openEdit(m)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#1B2A4A]">
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => handleDelete(m.id)} className="p-1 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-[#5DB347]/10 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-[#5DB347]" />
              </div>
              <span className="text-xs text-gray-400 font-mono">{m.icon}</span>
            </div>
            <p className="text-2xl font-bold text-[#1B2A4A]">{m.value} <span className="text-sm font-normal text-gray-400">{m.unit}</span></p>
            <p className="text-sm font-medium text-gray-700 mt-1">{m.label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{m.description}</p>
            {m.target && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500">Target: <span className="font-medium text-[#1B2A4A]">{m.target} {m.unit}</span></p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="text-left px-5 py-3 font-medium text-gray-600">Metric</th>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Value</th>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Unit</th>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Target</th>
              <th className="text-right px-5 py-3 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {metrics.map((m) => (
              <tr key={m.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                <td className="px-5 py-3 font-medium text-[#1B2A4A]">{m.label}</td>
                <td className="px-5 py-3 text-gray-700 font-semibold">{m.value}</td>
                <td className="px-5 py-3 text-gray-500">{m.unit}</td>
                <td className="px-5 py-3 text-gray-500">{m.target || '—'}</td>
                <td className="px-5 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => openEdit(m)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#1B2A4A]">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(m.id)} className="p-2 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {metrics.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-gray-400">No impact metrics configured</td>
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
              <h2 className="text-lg font-semibold text-[#1B2A4A]">{editingId ? 'Edit Metric' : 'Add Metric'}</h2>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
                <input
                  type="text"
                  value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })}
                  placeholder="e.g., Farmers Reached"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347] outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                  <input
                    type="text"
                    value={form.value}
                    onChange={(e) => setForm({ ...form, value: e.target.value })}
                    placeholder="5000"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <input
                    type="text"
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    placeholder="farmers"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347] outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                  <select
                    value={form.icon}
                    onChange={(e) => setForm({ ...form, icon: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347] outline-none"
                  >
                    <option value="">Select icon...</option>
                    {ICON_OPTIONS.map((i) => (
                      <option key={i} value={i}>{i}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target</label>
                  <input
                    type="text"
                    value={form.target}
                    onChange={(e) => setForm({ ...form, target: e.target.value })}
                    placeholder="10000"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347] outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  placeholder="Brief description of this metric"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347] outline-none resize-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100">Cancel</button>
              <button
                onClick={handleSubmit}
                disabled={saving || !form.label.trim()}
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
