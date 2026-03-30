'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  BookOpen,
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';

// ── Types ──
interface Course {
  name: string;
  description: string;
  category: string;
  duration_hours: number;
  price: number;
  is_free: boolean;
  level: string;
  country: string;
}

const DEFAULT_CATALOG: Course[] = [
  { name: 'Agricultural Best Practices', description: 'Learn modern farming techniques for improved yields and sustainability.', category: 'Agriculture', duration_hours: 12, price: 0, is_free: true, level: 'Beginner', country: 'All' },
  { name: 'Financial Literacy', description: 'Understand budgeting, savings, credit management and farm accounting.', category: 'Business', duration_hours: 8, price: 0, is_free: true, level: 'Beginner', country: 'All' },
  { name: 'Insurance 101', description: 'Introduction to crop and livestock insurance products for smallholder farmers.', category: 'Insurance', duration_hours: 4, price: 15, is_free: false, level: 'Beginner', country: 'All' },
  { name: 'Carbon Credits Basics', description: 'How to participate in carbon credit programs and earn from sustainable practices.', category: 'Environment', duration_hours: 6, price: 20, is_free: false, level: 'Intermediate', country: 'All' },
  { name: 'Livestock Management', description: 'Best practices for animal husbandry, feeding, health and breeding.', category: 'Agriculture', duration_hours: 16, price: 0, is_free: true, level: 'Intermediate', country: 'All' },
  { name: 'Digital Tools Training', description: 'Using mobile apps, GPS mapping and digital record-keeping for farm management.', category: 'Technology', duration_hours: 6, price: 0, is_free: true, level: 'Beginner', country: 'All' },
];

const CATEGORIES = ['Agriculture', 'Business', 'Insurance', 'Environment', 'Technology', 'Compliance', 'Health'];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const COUNTRIES = ['All', 'Zimbabwe', 'Uganda', 'Kenya', 'Tanzania', 'Zambia', 'Malawi', 'Mozambique', 'Rwanda', 'Ethiopia'];

const CONFIG_KEY = 'training_catalog';

export default function TrainingCatalogConfigPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [form, setForm] = useState<Course>({
    name: '', description: '', category: 'Agriculture', duration_hours: 1, price: 0, is_free: true, level: 'Beginner', country: 'All',
  });

  const showToast = useCallback((type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // ── Fetch ──
  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('site_config')
          .select('value')
          .eq('key', CONFIG_KEY)
          .single();
        if (error && error.code !== 'PGRST116') throw error;
        setCourses(data?.value ?? DEFAULT_CATALOG);
      } catch {
        setCourses(DEFAULT_CATALOG);
        showToast('error', 'Failed to load config. Using defaults.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [showToast]);

  // ── Save ──
  async function save(updated: Course[]) {
    setSaving(true);
    try {
      const supabase = createClient();
      const { data: existing } = await supabase
        .from('site_config')
        .select('id')
        .eq('key', CONFIG_KEY)
        .single();

      if (existing) {
        const { error } = await supabase
          .from('site_config')
          .update({ value: updated, updated_at: new Date().toISOString() })
          .eq('key', CONFIG_KEY);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('site_config')
          .insert({ key: CONFIG_KEY, value: updated, description: 'Training course catalog configuration' });
        if (error) throw error;
      }
      setCourses(updated);
      showToast('success', 'Training catalog saved successfully.');
    } catch {
      showToast('error', 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  function openAdd() {
    setEditIndex(null);
    setForm({ name: '', description: '', category: 'Agriculture', duration_hours: 1, price: 0, is_free: true, level: 'Beginner', country: 'All' });
    setModalOpen(true);
  }

  function openEdit(idx: number) {
    setEditIndex(idx);
    setForm({ ...courses[idx] });
    setModalOpen(true);
  }

  function handleSubmit() {
    if (!form.name.trim()) { showToast('error', 'Course name is required.'); return; }
    const updated = [...courses];
    if (editIndex !== null) {
      updated[editIndex] = form;
    } else {
      updated.push(form);
    }
    setModalOpen(false);
    save(updated);
  }

  function handleDelete(idx: number) {
    if (!confirm('Delete this course?')) return;
    const updated = courses.filter((_, i) => i !== idx);
    save(updated);
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
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-white text-sm ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/training" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </Link>
          <div className="p-2 rounded-xl" style={{ backgroundColor: '#5DB34720' }}>
            <BookOpen className="w-6 h-6" style={{ color: '#5DB347' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#1B2A4A' }}>Training Course Catalog</h1>
            <p className="text-sm text-gray-500">Manage available training courses for farmers</p>
          </div>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-medium shadow-sm hover:opacity-90 transition-opacity"
          style={{ backgroundColor: '#5DB347' }}
        >
          <Plus className="w-4 h-4" /> Add Course
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100" style={{ backgroundColor: '#1B2A4A08' }}>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: '#1B2A4A' }}>Course Name</th>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: '#1B2A4A' }}>Category</th>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: '#1B2A4A' }}>Level</th>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: '#1B2A4A' }}>Duration</th>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: '#1B2A4A' }}>Price</th>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: '#1B2A4A' }}>Country</th>
                <th className="text-right px-4 py-3 font-semibold" style={{ color: '#1B2A4A' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((c, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium" style={{ color: '#1B2A4A' }}>{c.name}</div>
                    <div className="text-xs text-gray-400 mt-0.5 line-clamp-1">{c.description}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">{c.category}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{c.level}</td>
                  <td className="px-4 py-3 text-gray-600">{c.duration_hours}h</td>
                  <td className="px-4 py-3">
                    {c.is_free ? (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">Free</span>
                    ) : (
                      <span className="text-gray-700">${c.price}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{c.country}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openEdit(i)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors mr-1">
                      <Pencil className="w-4 h-4 text-gray-500" />
                    </button>
                    <button onClick={() => handleDelete(i)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </td>
                </tr>
              ))}
              {courses.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400">No courses configured. Click &quot;Add Course&quot; to get started.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold" style={{ color: '#1B2A4A' }}>{editIndex !== null ? 'Edit Course' : 'Add Course'}</h2>
              <button onClick={() => setModalOpen(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course Name *</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-200 focus:border-green-400 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-200 focus:border-green-400 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-200 focus:border-green-400 outline-none">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                  <select value={form.level} onChange={e => setForm({ ...form, level: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-200 focus:border-green-400 outline-none">
                    {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (hours)</label>
                  <input type="number" min={1} value={form.duration_hours} onChange={e => setForm({ ...form, duration_hours: parseInt(e.target.value) || 1 })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-200 focus:border-green-400 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <select value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-200 focus:border-green-400 outline-none">
                    {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 items-end">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1 cursor-pointer">
                    <input type="checkbox" checked={form.is_free} onChange={e => setForm({ ...form, is_free: e.target.checked, price: e.target.checked ? 0 : form.price })} className="rounded text-green-600 focus:ring-green-200" />
                    Free Course
                  </label>
                </div>
                {!form.is_free && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (USD)</label>
                    <input type="number" min={0} step={0.01} value={form.price} onChange={e => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-200 focus:border-green-400 outline-none" />
                  </div>
                )}
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
