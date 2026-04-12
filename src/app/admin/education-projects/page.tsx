'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  GraduationCap,
  Loader2,
  X,
  BookOpen,
  Beaker,
  Cpu,
  CloudSun,
  Beef,
} from 'lucide-react';

/* ── Types ────────────────────────────────────────────────────── */

interface Project {
  id: string;
  name: string;
  category: string;
  status: string;
  duration: string;
  funding: string;
  lead: string;
  partners: string[];
  description: string;
  progress: number;
  display_order: number;
  visible: boolean;
}

interface FormData {
  name: string;
  category: string;
  status: string;
  duration: string;
  funding: string;
  lead: string;
  partners: string;
  description: string;
  progress: number;
  visible: boolean;
}

const EMPTY_FORM: FormData = {
  name: '',
  category: 'Agronomy',
  status: 'Active',
  duration: '',
  funding: '',
  lead: '',
  partners: '',
  description: '',
  progress: 0,
  visible: true,
};

const CATEGORIES = ['Agronomy', 'Livestock', 'Technology', 'Climate'];
const STATUSES = ['Active', 'Completed', 'Planning'];

const categoryIcons: Record<string, React.ReactNode> = {
  Agronomy: <BookOpen className="w-4 h-4" />,
  Livestock: <Beef className="w-4 h-4" />,
  Technology: <Cpu className="w-4 h-4" />,
  Climate: <CloudSun className="w-4 h-4" />,
};

const categoryColors: Record<string, string> = {
  Agronomy: 'bg-emerald-100 text-emerald-700',
  Livestock: 'bg-orange-100 text-orange-700',
  Technology: 'bg-purple-100 text-purple-700',
  Climate: 'bg-sky-100 text-sky-700',
};

const statusColors: Record<string, string> = {
  Active: 'bg-green-100 text-green-700',
  Completed: 'bg-blue-100 text-blue-700',
  Planning: 'bg-amber-100 text-amber-700',
};

/* ── Toast ─────────────────────────────────────────────────────── */

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white ${type === 'success' ? 'bg-[#5DB347]' : 'bg-red-500'}`}>
      {message}
    </div>
  );
}

/* ── Page ──────────────────────────────────────────────────────── */

export default function AdminEducationProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const supabase = createClient();

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('education_projects')
      .select('*')
      .order('display_order', { ascending: true });

    if (!error && data) {
      setProjects(data as Project[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  /* ── CRUD handlers ─────────────────────────────────────────── */

  function openCreate() {
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setShowModal(true);
  }

  function openEdit(project: Project) {
    setEditingId(project.id);
    setFormData({
      name: project.name,
      category: project.category,
      status: project.status,
      duration: project.duration || '',
      funding: project.funding || '',
      lead: project.lead || '',
      partners: (project.partners || []).join(', '),
      description: project.description || '',
      progress: project.progress || 0,
      visible: project.visible,
    });
    setShowModal(true);
  }

  async function handleSave() {
    if (!formData.name.trim()) {
      setToast({ message: 'Project name is required', type: 'error' });
      return;
    }
    setSaving(true);

    const payload = {
      name: formData.name.trim(),
      category: formData.category,
      status: formData.status,
      duration: formData.duration.trim() || null,
      funding: formData.funding.trim() || null,
      lead: formData.lead.trim() || null,
      partners: formData.partners.split(',').map((p) => p.trim()).filter(Boolean),
      description: formData.description.trim() || null,
      progress: formData.progress,
      visible: formData.visible,
      updated_at: new Date().toISOString(),
    };

    let error;
    if (editingId) {
      ({ error } = await supabase.from('education_projects').update(payload).eq('id', editingId));
    } else {
      ({ error } = await supabase.from('education_projects').insert({ ...payload, display_order: projects.length }));
    }

    if (error) {
      setToast({ message: `Failed to save: ${error.message}`, type: 'error' });
    } else {
      setToast({ message: editingId ? 'Project updated' : 'Project created', type: 'success' });
      setShowModal(false);
      await fetchProjects();
    }
    setSaving(false);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    const { error } = await supabase.from('education_projects').delete().eq('id', deleteTarget.id);
    if (error) {
      setToast({ message: 'Failed to delete', type: 'error' });
    } else {
      setToast({ message: 'Project deleted', type: 'success' });
      await fetchProjects();
    }
    setDeleteTarget(null);
  }

  async function toggleVisibility(project: Project) {
    await supabase.from('education_projects').update({ visible: !project.visible }).eq('id', project.id);
    setProjects((prev) => prev.map((p) => p.id === project.id ? { ...p, visible: !p.visible } : p));
  }

  /* ── Stats ──────────────────────────────────────────────────── */

  const totalProjects = projects.length;
  const activeProjects = projects.filter((p) => p.status === 'Active').length;
  const completedProjects = projects.filter((p) => p.status === 'Completed').length;
  const categoryCounts = CATEGORIES.map((c) => ({ name: c, count: projects.filter((p) => p.category === c).length }));

  /* ── Render ─────────────────────────────────────────────────── */

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#5DB347]/10 flex items-center justify-center">
            <Beaker className="w-5 h-5 text-[#5DB347]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#1B2A4A]">Education Projects</h1>
            <p className="text-sm text-gray-500">Manage research and development projects</p>
          </div>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium bg-[#5DB347] hover:bg-[#4a9a39] transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Project
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Projects', value: totalProjects },
          { label: 'Active', value: activeProjects },
          { label: 'Completed', value: completedProjects },
          { label: 'Categories', value: categoryCounts.filter((c) => c.count > 0).length },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-xs text-gray-400 uppercase tracking-wider">{stat.label}</p>
            <p className="text-2xl font-bold text-[#1B2A4A] mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Projects Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-[#5DB347]" />
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-[#1B2A4A] mb-2">No projects yet</h3>
          <p className="text-sm text-gray-500 mb-6">Add your first research or development project.</p>
          <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-medium bg-[#5DB347]">
            <Plus className="w-4 h-4" /> Add Project
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Project</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Category</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Progress</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Lead</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Funding</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <motion.tr
                    key={project.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {!project.visible && <EyeOff className="w-3.5 h-3.5 text-gray-300" />}
                        <span className="font-medium text-[#1B2A4A]">{project.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${categoryColors[project.category] || 'bg-gray-100 text-gray-600'}`}>
                        {categoryIcons[project.category]} {project.category}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[project.status] || 'bg-gray-100 text-gray-600'}`}>
                        {project.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-1.5">
                          <div className="bg-[#5DB347] rounded-full h-1.5" style={{ width: `${project.progress}%` }} />
                        </div>
                        <span className="text-xs text-gray-500">{project.progress}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{project.lead || '—'}</td>
                    <td className="py-3 px-4 text-gray-600 font-medium">{project.funding || '—'}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => toggleVisibility(project)} className="p-1.5 rounded-lg hover:bg-gray-100" title={project.visible ? 'Hide' : 'Show'}>
                          {project.visible ? <Eye className="w-4 h-4 text-[#5DB347]" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
                        </button>
                        <button onClick={() => openEdit(project)} className="p-1.5 rounded-lg hover:bg-gray-100" title="Edit">
                          <Pencil className="w-4 h-4 text-gray-500" />
                        </button>
                        <button onClick={() => setDeleteTarget(project)} className="p-1.5 rounded-lg hover:bg-red-50" title="Delete">
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Add/Edit Modal ─────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-[#1B2A4A]">
                {editingId ? 'Edit Project' : 'Add Project'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Project Name *</label>
                <input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-[#5DB347] focus:outline-none"
                  placeholder="Drought-Resistant Maize Varieties"
                />
              </div>

              {/* Category + Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-[#5DB347] focus:outline-none"
                  >
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-[#5DB347] focus:outline-none"
                  >
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* Duration + Funding */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Duration</label>
                  <input
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-[#5DB347] focus:outline-none"
                    placeholder="2024-2026"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Funding</label>
                  <input
                    value={formData.funding}
                    onChange={(e) => setFormData({ ...formData, funding: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-[#5DB347] focus:outline-none"
                    placeholder="$420,000"
                  />
                </div>
              </div>

              {/* Lead */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Project Lead</label>
                <input
                  value={formData.lead}
                  onChange={(e) => setFormData({ ...formData, lead: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-[#5DB347] focus:outline-none"
                  placeholder="Dr. Tendai Moyo"
                />
              </div>

              {/* Partners */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Partners (comma-separated)</label>
                <input
                  value={formData.partners}
                  onChange={(e) => setFormData({ ...formData, partners: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-[#5DB347] focus:outline-none"
                  placeholder="CIMMYT, University of Zimbabwe, Seed Co"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-[#5DB347] focus:outline-none resize-none"
                  placeholder="Brief description of the project..."
                />
              </div>

              {/* Progress */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Progress ({formData.progress}%)</label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={formData.progress}
                  onChange={(e) => setFormData({ ...formData, progress: Number(e.target.value) })}
                  className="w-full accent-[#5DB347]"
                />
              </div>

              {/* Visible toggle */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.visible}
                  onChange={(e) => setFormData({ ...formData, visible: e.target.checked })}
                  className="rounded border-gray-300 text-[#5DB347] focus:ring-[#5DB347]"
                />
                <span className="text-sm text-gray-600">Visible on public page</span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium text-white bg-[#5DB347] hover:bg-[#4a9a39] disabled:opacity-50"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingId ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation ────────────────────────────────── */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 text-center">
            <Trash2 className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-[#1B2A4A] mb-2">Delete Project?</h3>
            <p className="text-sm text-gray-500 mb-6">
              &quot;{deleteTarget.name}&quot; will be permanently removed.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100">
                Cancel
              </button>
              <button onClick={handleDelete} className="px-5 py-2 rounded-xl text-sm font-medium text-white bg-red-500 hover:bg-red-600">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
