'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderOpen, Plus, Edit3, Power, ChevronDown, ChevronRight,
  Users, Loader2, X, Search, TreePine, BadgeCheck, Globe,
} from 'lucide-react';
import { useAuth } from '@/lib/supabase/auth-context';
import { createClient } from '@/lib/supabase/client';

// ── Types ────────────────────────────────────────────────────────────────────

interface CarbonProject {
  id: string;
  name: string;
  description: string;
  methodology: string;
  registry: string;
  country: string;
  region: string;
  eligible_practices: string[];
  price_per_credit: number;
  co_benefits: string[];
  status: string;
  start_date: string | null;
  end_date: string | null;
  target_credits: number;
  created_at: string;
}

interface Enrollment {
  id: string;
  farmer_name: string;
  farm_name: string;
  status: string;
  enrolled_at: string;
}

// ── Demo data ────────────────────────────────────────────────────────────────

const demoProjects: CarbonProject[] = [
  { id: 'p1', name: 'Chobe Agroforestry Initiative', description: 'Large-scale agroforestry carbon sequestration in northern Botswana', methodology: 'VM0042', registry: 'Verra', country: 'Botswana', region: 'Chobe District', eligible_practices: ['Agroforestry', 'Cover Cropping', 'Mulching'], price_per_credit: 18.5, co_benefits: ['Biodiversity', 'Water', 'Community'], status: 'active', start_date: '2024-01-15', end_date: '2034-01-15', target_credits: 5000, created_at: '2024-01-15' },
  { id: 'p2', name: 'Makgadikgadi Soil Carbon Project', description: 'Regenerative agriculture building soil organic carbon', methodology: 'GS-Soil-001', registry: 'Gold Standard', country: 'Botswana', region: 'Central District', eligible_practices: ['No-Till', 'Composting', 'Crop Rotation'], price_per_credit: 22, co_benefits: ['Soil Health', 'Water Retention'], status: 'active', start_date: '2024-03-01', end_date: '2034-03-01', target_credits: 3000, created_at: '2024-03-01' },
  { id: 'p3', name: 'Eastern Highlands Methane Capture', description: 'Biogas from dairy farm methane capture', methodology: 'VM0017', registry: 'Verra', country: 'Zimbabwe', region: 'Manicaland', eligible_practices: ['Biogas Installation', 'Manure Management'], price_per_credit: 15.75, co_benefits: ['Clean Energy', 'Community', 'Health'], status: 'active', start_date: '2024-06-01', end_date: '2034-06-01', target_credits: 8000, created_at: '2024-06-01' },
  { id: 'p4', name: 'Kilimanjaro Shade-Grown Coffee', description: 'Shade-grown coffee agroforestry on Kilimanjaro slopes', methodology: 'GS-Agro-002', registry: 'Gold Standard', country: 'Tanzania', region: 'Kilimanjaro', eligible_practices: ['Shade Trees', 'Intercropping', 'Composting'], price_per_credit: 24.5, co_benefits: ['Biodiversity', 'Livelihoods', 'Water'], status: 'active', start_date: '2024-09-01', end_date: '2034-09-01', target_credits: 4000, created_at: '2024-09-01' },
  { id: 'p5', name: 'Okavango Delta Biochar Programme', description: 'Agricultural waste to biochar carbon removal', methodology: 'Puro-BC-001', registry: 'Verra', country: 'Botswana', region: 'North-West District', eligible_practices: ['Biochar Production', 'Waste Reduction'], price_per_credit: 85, co_benefits: ['Soil Fertility', 'Waste Reduction'], status: 'draft', start_date: null, end_date: null, target_credits: 1000, created_at: '2025-01-10' },
  { id: 'p6', name: 'Tuli Block Conservation Tillage', description: 'No-till and minimum tillage farming practices', methodology: 'GS-Soil-002', registry: 'Gold Standard', country: 'Botswana', region: 'Central District', eligible_practices: ['No-Till', 'Minimum Tillage', 'Cover Cropping'], price_per_credit: 13.5, co_benefits: ['Soil Health', 'Erosion Prevention'], status: 'active', start_date: '2025-02-01', end_date: '2035-02-01', target_credits: 2500, created_at: '2025-02-01' },
];

const demoEnrollments: Record<string, Enrollment[]> = {
  p1: [
    { id: 'e1', farmer_name: 'Tebogo Moyo', farm_name: 'Moyo Homestead', status: 'active', enrolled_at: '2024-02-10' },
    { id: 'e2', farmer_name: 'Naledi Kgosi', farm_name: 'Kgosi Farms', status: 'active', enrolled_at: '2024-03-15' },
    { id: 'e3', farmer_name: 'Mpho Dube', farm_name: 'Dube Family Farm', status: 'active', enrolled_at: '2024-04-20' },
  ],
  p2: [
    { id: 'e4', farmer_name: 'Lesedi Phiri', farm_name: 'Phiri Organics', status: 'active', enrolled_at: '2024-04-01' },
    { id: 'e5', farmer_name: 'Grace Banda', farm_name: 'Banda Smallholding', status: 'active', enrolled_at: '2024-05-10' },
  ],
  p3: [
    { id: 'e6', farmer_name: 'Tinashe Chimurenga', farm_name: 'Chimurenga Dairy', status: 'active', enrolled_at: '2024-07-05' },
  ],
};

const COUNTRIES = ['Botswana', 'Zimbabwe', 'Tanzania', 'Kenya', 'Uganda', 'Mozambique', 'Zambia', 'Malawi', 'South Africa'];
const PRACTICES = ['Agroforestry', 'No-Till', 'Cover Cropping', 'Composting', 'Crop Rotation', 'Mulching', 'Biogas Installation', 'Manure Management', 'Shade Trees', 'Intercropping', 'Biochar Production', 'Minimum Tillage', 'Waste Reduction'];

const emptyForm = {
  name: '', description: '', methodology: '', registry: 'Verra', country: 'Botswana',
  region: '', eligible_practices: [] as string[], price_per_credit: 0, co_benefits: [] as string[],
  start_date: '', end_date: '', target_credits: 0,
};

// ── Component ────────────────────────────────────────────────────────────────

export default function AdminCarbonProjectsPage() {
  const { user } = useAuth();
  const supabase = createClient();

  const [projects, setProjects] = useState<CarbonProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [enrollments, setEnrollments] = useState<Record<string, Enrollment[]>>({});

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<CarbonProject | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = useCallback((type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // Fetch projects
  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('carbon_projects')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data?.length) {
          setProjects(data);
        } else {
          setProjects(demoProjects);
        }
      } catch {
        setProjects(demoProjects);
      }
      setLoading(false);
    };
    fetchProjects();
  }, [supabase]);

  // Fetch enrollments for expanded row
  const fetchEnrollments = async (projectId: string) => {
    if (enrollments[projectId]) return;
    try {
      const { data, error } = await supabase
        .from('carbon_enrollments')
        .select('id, status, enrolled_at, profiles(full_name), farm_plots(name)')
        .eq('project_id', projectId)
        .order('enrolled_at', { ascending: false });

      if (!error && data?.length) {
        setEnrollments(prev => ({
          ...prev,
          [projectId]: data.map((e: any) => ({
            id: e.id,
            farmer_name: e.profiles?.full_name || 'Unknown',
            farm_name: e.farm_plots?.name || 'N/A',
            status: e.status,
            enrolled_at: e.enrolled_at,
          })),
        }));
      } else {
        setEnrollments(prev => ({ ...prev, [projectId]: demoEnrollments[projectId] || [] }));
      }
    } catch {
      setEnrollments(prev => ({ ...prev, [projectId]: demoEnrollments[projectId] || [] }));
    }
  };

  // Toggle expand
  const toggleExpand = (id: string) => {
    if (expandedRow === id) {
      setExpandedRow(null);
    } else {
      setExpandedRow(id);
      fetchEnrollments(id);
    }
  };

  // Open create form
  const openCreate = () => {
    setEditingProject(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  // Open edit form
  const openEdit = (project: CarbonProject) => {
    setEditingProject(project);
    setForm({
      name: project.name,
      description: project.description,
      methodology: project.methodology,
      registry: project.registry,
      country: project.country,
      region: project.region,
      eligible_practices: project.eligible_practices || [],
      price_per_credit: project.price_per_credit,
      co_benefits: project.co_benefits || [],
      start_date: project.start_date || '',
      end_date: project.end_date || '',
      target_credits: project.target_credits,
    });
    setShowForm(true);
  };

  // Save project
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.methodology || !form.registry) {
      showToast('error', 'Name, methodology and registry are required');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/carbon/projects', {
        method: editingProject ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingProject ? { ...form, id: editingProject.id } : { ...form, status: 'draft' }),
      });

      if (res.ok) {
        const data = await res.json();
        if (editingProject) {
          setProjects(prev => prev.map(p => p.id === editingProject.id ? { ...p, ...form } : p));
        } else {
          setProjects(prev => [data.project || { ...form, id: `p${Date.now()}`, status: 'draft', created_at: new Date().toISOString() }, ...prev]);
        }
        setShowForm(false);
        showToast('success', editingProject ? 'Project updated' : 'Project created');
      } else {
        const err = await res.json();
        showToast('error', err.error || 'Failed to save project');
      }
    } catch {
      // Optimistic fallback for demo
      if (editingProject) {
        setProjects(prev => prev.map(p => p.id === editingProject.id ? { ...p, ...form } as CarbonProject : p));
      } else {
        setProjects(prev => [{ ...form, id: `p${Date.now()}`, status: 'draft', created_at: new Date().toISOString() } as unknown as CarbonProject, ...prev]);
      }
      setShowForm(false);
      showToast('success', editingProject ? 'Project updated (demo)' : 'Project created (demo)');
    }
    setSaving(false);
  };

  // Toggle active/inactive
  const toggleStatus = async (project: CarbonProject) => {
    const newStatus = project.status === 'active' ? 'inactive' : 'active';
    try {
      await supabase.from('carbon_projects').update({ status: newStatus }).eq('id', project.id);
    } catch {
      // fallback
    }
    setProjects(prev => prev.map(p => p.id === project.id ? { ...p, status: newStatus } : p));
    showToast('success', `Project ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
  };

  // Toggle practice checkbox
  const togglePractice = (p: string) => {
    setForm(f => ({
      ...f,
      eligible_practices: f.eligible_practices.includes(p) ? f.eligible_practices.filter(x => x !== p) : [...f.eligible_practices, p],
    }));
  };

  // Filtered projects
  const filtered = projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.country.toLowerCase().includes(search.toLowerCase()) ||
    p.registry.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-[#5DB347]" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium ${toast.type === 'success' ? 'bg-[#5DB347]' : 'bg-red-500'}`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">Carbon Projects</h1>
          <p className="text-sm text-gray-500">Manage carbon credit projects, enrollments, and methodologies</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium"
          style={{ background: 'linear-gradient(135deg, #5DB347, #449933)' }}
        >
          <Plus className="w-4 h-4" /> Create Project
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search projects..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#5DB347]"
        />
      </div>

      {/* Projects Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-4 py-3 font-medium text-gray-500"></th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Project Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Methodology</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Registry</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Country</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Target</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Price</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(project => (
                <motion.tbody key={project.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <tr className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                    <td className="px-4 py-3">
                      <button onClick={() => toggleExpand(project.id)} className="p-1 hover:bg-gray-100 rounded">
                        {expandedRow === project.id ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <TreePine className="w-4 h-4 text-[#5DB347] flex-shrink-0" />
                        <span className="font-medium text-[#1B2A4A]">{project.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{project.methodology}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        project.registry === 'Verra' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {project.registry}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      <span className="flex items-center gap-1"><Globe className="w-3.5 h-3.5" />{project.country}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        project.status === 'active' ? 'bg-green-100 text-green-700' : project.status === 'draft' ? 'bg-gray-100 text-gray-600' : 'bg-red-100 text-red-700'
                      }`}>
                        {project.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{project.target_credits?.toLocaleString()}t</td>
                    <td className="px-4 py-3 font-medium text-[#5DB347]">${project.price_per_credit}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(project)} className="p-1.5 hover:bg-gray-100 rounded-lg" title="Edit">
                          <Edit3 className="w-4 h-4 text-gray-500" />
                        </button>
                        <button onClick={() => toggleStatus(project)} className="p-1.5 hover:bg-gray-100 rounded-lg" title={project.status === 'active' ? 'Deactivate' : 'Activate'}>
                          <Power className={`w-4 h-4 ${project.status === 'active' ? 'text-green-500' : 'text-gray-400'}`} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {/* Expanded row: enrolled farmers */}
                  {expandedRow === project.id && (
                    <tr>
                      <td colSpan={9} className="px-8 py-4 bg-gray-50/50">
                        <div className="flex items-center gap-2 mb-3">
                          <Users className="w-4 h-4 text-[#5DB347]" />
                          <span className="font-medium text-[#1B2A4A] text-sm">Enrolled Farmers</span>
                        </div>
                        {(enrollments[project.id] || []).length > 0 ? (
                          <div className="space-y-2">
                            {(enrollments[project.id] || []).map(e => (
                              <div key={e.id} className="flex items-center justify-between bg-white rounded-xl px-4 py-2.5 border border-gray-100">
                                <div>
                                  <p className="text-sm font-medium text-[#1B2A4A]">{e.farmer_name}</p>
                                  <p className="text-xs text-gray-400">{e.farm_name}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${e.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                    {e.status}
                                  </span>
                                  <span className="text-xs text-gray-400">{new Date(e.enrolled_at).toLocaleDateString()}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-400">No farmers enrolled yet</p>
                        )}
                      </td>
                    </tr>
                  )}
                </motion.tbody>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No projects found</p>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-[#1B2A4A] text-lg">{editingProject ? 'Edit Project' : 'Create Project'}</h3>
                <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Project Name *</label>
                    <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#5DB347]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Methodology *</label>
                    <input required value={form.methodology} onChange={e => setForm(f => ({ ...f, methodology: e.target.value }))} placeholder="e.g. VM0042" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#5DB347]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Registry *</label>
                    <select value={form.registry} onChange={e => setForm(f => ({ ...f, registry: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#5DB347]">
                      <option value="Verra">Verra (VCS)</option>
                      <option value="Gold Standard">Gold Standard</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#5DB347]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <select value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#5DB347]">
                      {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
                    <input value={form.region} onChange={e => setForm(f => ({ ...f, region: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#5DB347]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#5DB347]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#5DB347]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price per Credit ($)</label>
                    <input type="number" step="0.01" min="0" value={form.price_per_credit} onChange={e => setForm(f => ({ ...f, price_per_credit: parseFloat(e.target.value) || 0 }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#5DB347]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Target Credits (tonnes)</label>
                    <input type="number" min="0" value={form.target_credits} onChange={e => setForm(f => ({ ...f, target_credits: parseInt(e.target.value) || 0 }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#5DB347]" />
                  </div>
                </div>

                {/* Eligible Practices */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Eligible Practices</label>
                  <div className="flex flex-wrap gap-2">
                    {PRACTICES.map(p => (
                      <label key={p} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs cursor-pointer transition ${
                        form.eligible_practices.includes(p) ? 'bg-[#5DB347]/10 border-[#5DB347] text-[#5DB347]' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}>
                        <input type="checkbox" checked={form.eligible_practices.includes(p)} onChange={() => togglePractice(p)} className="hidden" />
                        {p}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Revenue Split Info */}
                <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-700">
                  <strong>Revenue Split:</strong> Farmer 70% / AFU 20% / Buffer Pool 10%
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3 rounded-xl text-white font-medium text-sm transition hover:opacity-90 disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #5DB347, #449933)' }}
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : editingProject ? 'Update Project' : 'Create Project'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
