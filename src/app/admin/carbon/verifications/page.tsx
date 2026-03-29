'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardCheck, Plus, Loader2, X, Search, Calendar,
  CheckCircle2, AlertTriangle, Clock, Users, Beaker, TreePine,
} from 'lucide-react';
import { useAuth } from '@/lib/supabase/auth-context';
import { createClient } from '@/lib/supabase/client';

// ── Types ────────────────────────────────────────────────────────────────────

interface Verification {
  id: string;
  project_id: string;
  project_name: string;
  verifier_name: string;
  scheduled_date: string;
  status: string; // pending, in_progress, completed
  farms_to_visit: string[];
  findings: string;
  soil_samples_count: number;
  carbon_verified_tonnes: number;
  recommendation: string; // approve, needs_more_data, reject
  completed_at: string | null;
  created_at: string;
}

interface CarbonProject {
  id: string;
  name: string;
}

// ── Demo data ────────────────────────────────────────────────────────────────

const demoProjects: CarbonProject[] = [
  { id: 'p1', name: 'Chobe Agroforestry Initiative' },
  { id: 'p2', name: 'Makgadikgadi Soil Carbon Project' },
  { id: 'p3', name: 'Eastern Highlands Methane Capture' },
  { id: 'p4', name: 'Kilimanjaro Shade-Grown Coffee' },
  { id: 'p5', name: 'Okavango Delta Biochar Programme' },
  { id: 'p6', name: 'Tuli Block Conservation Tillage' },
];

const demoVerifications: Verification[] = [
  {
    id: 'v1', project_id: 'p1', project_name: 'Chobe Agroforestry Initiative',
    verifier_name: 'Dr. Sarah Moyo', scheduled_date: '2025-04-15',
    status: 'pending', farms_to_visit: ['Moyo Homestead', 'Kgosi Farms', 'Dube Family Farm'],
    findings: '', soil_samples_count: 0, carbon_verified_tonnes: 0, recommendation: '',
    completed_at: null, created_at: '2025-03-20',
  },
  {
    id: 'v2', project_id: 'p2', project_name: 'Makgadikgadi Soil Carbon Project',
    verifier_name: 'James Phiri, EcoVerify Ltd', scheduled_date: '2025-03-28',
    status: 'in_progress', farms_to_visit: ['Phiri Organics', 'Banda Smallholding'],
    findings: '', soil_samples_count: 0, carbon_verified_tonnes: 0, recommendation: '',
    completed_at: null, created_at: '2025-03-10',
  },
  {
    id: 'v3', project_id: 'p3', project_name: 'Eastern Highlands Methane Capture',
    verifier_name: 'Prof. Tendai Chimurenga', scheduled_date: '2025-02-20',
    status: 'completed', farms_to_visit: ['Chimurenga Dairy', 'Highland Biogas Co-op'],
    findings: 'All methane capture systems operational. Biogas output within expected range. Farms compliant with VM0017 requirements.',
    soil_samples_count: 12, carbon_verified_tonnes: 620, recommendation: 'approve',
    completed_at: '2025-02-22', created_at: '2025-02-01',
  },
  {
    id: 'v4', project_id: 'p4', project_name: 'Kilimanjaro Shade-Grown Coffee',
    verifier_name: 'Dr. Amina Juma', scheduled_date: '2025-01-15',
    status: 'completed', farms_to_visit: ['Kilimanjaro Coffee Collective', 'Moshi Shade Farm'],
    findings: 'Additional data on shade tree density needed. Intercropping records incomplete for 2 farms.',
    soil_samples_count: 8, carbon_verified_tonnes: 380, recommendation: 'needs_more_data',
    completed_at: '2025-01-18', created_at: '2024-12-20',
  },
  {
    id: 'v5', project_id: 'p6', project_name: 'Tuli Block Conservation Tillage',
    verifier_name: 'EcoAudit International', scheduled_date: '2024-11-10',
    status: 'completed', farms_to_visit: ['Tuli Tillage Group A', 'Tuli Tillage Group B'],
    findings: 'Conservation tillage practices confirmed across all enrolled farms. Soil organic carbon increase verified through sampling.',
    soil_samples_count: 24, carbon_verified_tonnes: 310, recommendation: 'approve',
    completed_at: '2024-11-13', created_at: '2024-10-25',
  },
];

const statusConfig: Record<string, { color: string; bg: string; icon: typeof Clock }> = {
  pending: { color: 'text-amber-700', bg: 'bg-amber-100', icon: Clock },
  in_progress: { color: 'text-blue-700', bg: 'bg-blue-100', icon: Loader2 },
  completed: { color: 'text-green-700', bg: 'bg-green-100', icon: CheckCircle2 },
};

const recommendationConfig: Record<string, { label: string; color: string; bg: string }> = {
  approve: { label: 'Approved', color: 'text-green-700', bg: 'bg-green-100' },
  needs_more_data: { label: 'Needs More Data', color: 'text-amber-700', bg: 'bg-amber-100' },
  reject: { label: 'Rejected', color: 'text-red-700', bg: 'bg-red-100' },
};

// ── Component ────────────────────────────────────────────────────────────────

export default function AdminCarbonVerificationsPage() {
  const { user } = useAuth();
  const supabase = createClient();

  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [projects, setProjects] = useState<CarbonProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Schedule form
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    project_id: '', verifier_name: '', scheduled_date: '', farms_to_visit: '',
  });

  // Complete form
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [completeForm, setCompleteForm] = useState({
    findings: '', soil_samples_count: 0, carbon_verified_tonnes: 0, recommendation: 'approve',
  });

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = useCallback((type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [verificationsRes, projectsRes] = await Promise.all([
          supabase.from('carbon_verifications').select('*, carbon_projects(name)').order('scheduled_date', { ascending: false }),
          supabase.from('carbon_projects').select('id, name').order('name'),
        ]);

        if (verificationsRes.data?.length) {
          setVerifications(verificationsRes.data.map((v: any) => ({
            ...v,
            project_name: v.carbon_projects?.name || 'Unknown',
          })));
        } else {
          setVerifications(demoVerifications);
        }

        if (projectsRes.data?.length) {
          setProjects(projectsRes.data);
        } else {
          setProjects(demoProjects);
        }
      } catch {
        setVerifications(demoVerifications);
        setProjects(demoProjects);
      }
      setLoading(false);
    };
    fetchData();
  }, [supabase]);

  // Schedule verification
  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleForm.project_id || !scheduleForm.verifier_name || !scheduleForm.scheduled_date) {
      showToast('error', 'Project, verifier, and date are required');
      return;
    }
    setSaving(true);
    const farms = scheduleForm.farms_to_visit.split(',').map(f => f.trim()).filter(Boolean);
    const projectName = projects.find(p => p.id === scheduleForm.project_id)?.name || 'Unknown';

    try {
      const { data, error } = await supabase
        .from('carbon_verifications')
        .insert({
          project_id: scheduleForm.project_id,
          verifier_name: scheduleForm.verifier_name,
          scheduled_date: scheduleForm.scheduled_date,
          farms_to_visit: farms,
          status: 'pending',
        })
        .select()
        .single();

      if (!error && data) {
        setVerifications(prev => [{ ...data, project_name: projectName }, ...prev]);
      } else {
        throw new Error('insert failed');
      }
    } catch {
      // Demo fallback
      setVerifications(prev => [{
        id: `v${Date.now()}`,
        project_id: scheduleForm.project_id,
        project_name: projectName,
        verifier_name: scheduleForm.verifier_name,
        scheduled_date: scheduleForm.scheduled_date,
        status: 'pending',
        farms_to_visit: farms,
        findings: '', soil_samples_count: 0, carbon_verified_tonnes: 0,
        recommendation: '', completed_at: null,
        created_at: new Date().toISOString(),
      }, ...prev]);
    }

    setShowScheduleForm(false);
    setScheduleForm({ project_id: '', verifier_name: '', scheduled_date: '', farms_to_visit: '' });
    showToast('success', 'Verification scheduled');
    setSaving(false);
  };

  // Complete verification
  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completingId) return;
    setSaving(true);

    try {
      await supabase
        .from('carbon_verifications')
        .update({
          findings: completeForm.findings,
          soil_samples_count: completeForm.soil_samples_count,
          carbon_verified_tonnes: completeForm.carbon_verified_tonnes,
          recommendation: completeForm.recommendation,
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', completingId);
    } catch {
      // fallback
    }

    setVerifications(prev => prev.map(v =>
      v.id === completingId ? {
        ...v,
        ...completeForm,
        status: 'completed',
        completed_at: new Date().toISOString(),
      } : v
    ));

    // On approve, update project status to eligible for minting
    if (completeForm.recommendation === 'approve') {
      const ver = verifications.find(v => v.id === completingId);
      if (ver) {
        try {
          await supabase.from('carbon_projects').update({ status: 'active' }).eq('id', ver.project_id);
        } catch {
          // fallback
        }
      }
      showToast('success', 'Verification completed. Project eligible for credit minting.');
    } else {
      showToast('success', 'Verification completed');
    }

    setCompletingId(null);
    setCompleteForm({ findings: '', soil_samples_count: 0, carbon_verified_tonnes: 0, recommendation: 'approve' });
    setSaving(false);
  };

  // Open complete form
  const openComplete = (v: Verification) => {
    setCompletingId(v.id);
    setCompleteForm({
      findings: v.findings || '',
      soil_samples_count: v.soil_samples_count || 0,
      carbon_verified_tonnes: v.carbon_verified_tonnes || 0,
      recommendation: v.recommendation || 'approve',
    });
  };

  // Filter
  const filtered = verifications.filter(v => {
    if (search && !v.project_name.toLowerCase().includes(search.toLowerCase()) && !v.verifier_name.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter && v.status !== statusFilter) return false;
    return true;
  });

  const pendingCount = verifications.filter(v => v.status === 'pending').length;
  const inProgressCount = verifications.filter(v => v.status === 'in_progress').length;

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
          <h1 className="text-2xl font-bold text-[#1B2A4A]">Verifications</h1>
          <p className="text-sm text-gray-500">Schedule and manage carbon project verification audits</p>
        </div>
        <button
          onClick={() => setShowScheduleForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium"
          style={{ background: 'linear-gradient(135deg, #5DB347, #449933)' }}
        >
          <Plus className="w-4 h-4" /> Schedule Verification
        </button>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pending', count: pendingCount, color: '#F59E0B', icon: Clock },
          { label: 'In Progress', count: inProgressCount, color: '#6366F1', icon: Loader2 },
          { label: 'Completed', count: verifications.filter(v => v.status === 'completed').length, color: '#5DB347', icon: CheckCircle2 },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${s.color}15` }}>
              <s.icon className="w-5 h-5" style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className="text-xl font-bold text-[#1B2A4A]">{s.count}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search verifications..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#5DB347]"
          />
        </div>
        <select
          value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#5DB347]"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Verifications List */}
      <div className="space-y-4">
        {filtered.map(v => {
          const sc = statusConfig[v.status] || statusConfig.pending;
          const StatusIcon = sc.icon;
          const rec = v.recommendation ? recommendationConfig[v.recommendation] : null;

          return (
            <motion.div
              key={v.id}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${sc.bg} flex items-center justify-center`}>
                    <StatusIcon className={`w-5 h-5 ${sc.color} ${v.status === 'in_progress' ? 'animate-spin' : ''}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#1B2A4A]">{v.project_name}</h3>
                    <p className="text-sm text-gray-500">Verifier: {v.verifier_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${sc.bg} ${sc.color}`}>
                    {v.status.replace('_', ' ')}
                  </span>
                  {rec && (
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${rec.bg} ${rec.color}`}>
                      {rec.label}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(v.scheduled_date).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Farms to visit */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                <span className="text-xs text-gray-500 flex items-center gap-1"><Users className="w-3.5 h-3.5" /> Farms:</span>
                {v.farms_to_visit.map(f => (
                  <span key={f} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-xs">{f}</span>
                ))}
              </div>

              {/* Completed details */}
              {v.status === 'completed' && (
                <div className="bg-gray-50 rounded-xl p-4 mt-3 space-y-2">
                  <p className="text-sm text-gray-700">{v.findings}</p>
                  <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Beaker className="w-3.5 h-3.5" /> {v.soil_samples_count} soil samples</span>
                    <span className="flex items-center gap-1"><TreePine className="w-3.5 h-3.5" /> {v.carbon_verified_tonnes}t CO2 verified</span>
                    {v.completed_at && <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Completed {new Date(v.completed_at).toLocaleDateString()}</span>}
                  </div>
                </div>
              )}

              {/* Actions */}
              {(v.status === 'pending' || v.status === 'in_progress') && (
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => openComplete(v)}
                    className="px-4 py-2 rounded-xl text-white text-sm font-medium"
                    style={{ background: 'linear-gradient(135deg, #5DB347, #449933)' }}
                  >
                    Complete Verification
                  </button>
                  {v.status === 'pending' && (
                    <button
                      onClick={() => {
                        setVerifications(prev => prev.map(x => x.id === v.id ? { ...x, status: 'in_progress' } : x));
                        showToast('success', 'Verification started');
                      }}
                      className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Mark In Progress
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <ClipboardCheck className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg">No verifications found</p>
        </div>
      )}

      {/* Schedule Verification Modal */}
      <AnimatePresence>
        {showScheduleForm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowScheduleForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-[#1B2A4A] text-lg">Schedule Verification</h3>
                <button onClick={() => setShowScheduleForm(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleSchedule} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project *</label>
                  <select
                    required value={scheduleForm.project_id}
                    onChange={e => setScheduleForm(f => ({ ...f, project_id: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#5DB347]"
                  >
                    <option value="">Select project...</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Verifier Name *</label>
                  <input
                    required value={scheduleForm.verifier_name}
                    onChange={e => setScheduleForm(f => ({ ...f, verifier_name: e.target.value }))}
                    placeholder="e.g. Dr. Sarah Moyo, EcoVerify Ltd"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#5DB347]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Date *</label>
                  <input
                    required type="date" value={scheduleForm.scheduled_date}
                    onChange={e => setScheduleForm(f => ({ ...f, scheduled_date: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#5DB347]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Farms to Visit (comma separated)</label>
                  <textarea
                    rows={2} value={scheduleForm.farms_to_visit}
                    onChange={e => setScheduleForm(f => ({ ...f, farms_to_visit: e.target.value }))}
                    placeholder="Farm A, Farm B, Farm C"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#5DB347]"
                  />
                </div>

                <button
                  type="submit" disabled={saving}
                  className="w-full py-3 rounded-xl text-white font-medium text-sm transition hover:opacity-90 disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #5DB347, #449933)' }}
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Schedule Verification'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Complete Verification Modal */}
      <AnimatePresence>
        {completingId && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setCompletingId(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-[#1B2A4A] text-lg">Complete Verification</h3>
                <button onClick={() => setCompletingId(null)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleComplete} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Findings *</label>
                  <textarea
                    required rows={4} value={completeForm.findings}
                    onChange={e => setCompleteForm(f => ({ ...f, findings: e.target.value }))}
                    placeholder="Describe verification findings..."
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#5DB347]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Soil Samples Count</label>
                    <input
                      type="number" min="0" value={completeForm.soil_samples_count}
                      onChange={e => setCompleteForm(f => ({ ...f, soil_samples_count: parseInt(e.target.value) || 0 }))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#5DB347]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Carbon Verified (tonnes)</label>
                    <input
                      type="number" min="0" step="0.1" value={completeForm.carbon_verified_tonnes}
                      onChange={e => setCompleteForm(f => ({ ...f, carbon_verified_tonnes: parseFloat(e.target.value) || 0 }))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#5DB347]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Recommendation *</label>
                  <select
                    required value={completeForm.recommendation}
                    onChange={e => setCompleteForm(f => ({ ...f, recommendation: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#5DB347]"
                  >
                    <option value="approve">Approve - Project eligible for minting</option>
                    <option value="needs_more_data">Needs More Data</option>
                    <option value="reject">Reject</option>
                  </select>
                </div>

                {completeForm.recommendation === 'approve' && (
                  <div className="bg-green-50 rounded-xl p-3 text-sm text-green-700">
                    Approving this verification will make the project eligible for carbon credit minting.
                  </div>
                )}

                <button
                  type="submit" disabled={saving}
                  className="w-full py-3 rounded-xl text-white font-medium text-sm transition hover:opacity-90 disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #5DB347, #449933)' }}
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Submit Verification'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
