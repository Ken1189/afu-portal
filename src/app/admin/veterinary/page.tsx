'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Stethoscope, Calendar, Clock, CheckCircle2, Search, ChevronUp, Eye,
  AlertTriangle, MapPin, User, Syringe, Activity, FlaskConical, Heart,
  Loader2, AlertCircle, Save, FileText, Plus, X, Pill, Scissors,
} from 'lucide-react';

// -- Types (DB shape) ---------------------------------------------------------

type ApptStatus = 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
type ServiceType =
  | 'routine_checkup' | 'vaccination' | 'emergency' | 'surgery'
  | 'breeding' | 'nutrition' | 'disease_treatment' | 'deworming'
  | 'pregnancy_check' | 'dental' | 'consultation' | 'lab_test';

type Priority = 'normal' | 'urgent' | 'emergency';

interface VetAppointment {
  id: string;
  user_id: string;
  appointment_number: string;
  service_type: ServiceType;
  animal_type: string;
  animal_count: number;
  description: string;
  status: ApptStatus;
  priority: Priority;
  scheduled_date: string | null;
  country_code: string | null;
  region: string | null;
  farm_location: string | null;
  assigned_vet_name: string | null;
  vet_phone: string | null;
  diagnosis: string | null;
  treatment: string | null;
  estimated_cost: number | null;
  created_at: string;
  user?: { full_name: string | null; email: string | null; country: string | null } | null;
}

interface ProfileLite { id: string; full_name: string | null; email: string | null; country: string | null }

// -- Constants ----------------------------------------------------------------

const SERVICE_TYPES: { value: ServiceType; label: string }[] = [
  { value: 'routine_checkup', label: 'Routine Checkup' },
  { value: 'vaccination', label: 'Vaccination' },
  { value: 'emergency', label: 'Emergency' },
  { value: 'surgery', label: 'Surgery' },
  { value: 'breeding', label: 'Breeding' },
  { value: 'nutrition', label: 'Nutrition' },
  { value: 'disease_treatment', label: 'Disease Treatment' },
  { value: 'deworming', label: 'Deworming' },
  { value: 'pregnancy_check', label: 'Pregnancy Check' },
  { value: 'dental', label: 'Dental' },
  { value: 'consultation', label: 'Consultation' },
  { value: 'lab_test', label: 'Lab Test' },
];

const STATUS_LABELS: Record<ApptStatus, string> = {
  scheduled: 'Scheduled', confirmed: 'Confirmed', in_progress: 'In Progress',
  completed: 'Completed', cancelled: 'Cancelled', no_show: 'No Show',
};

const PRIORITY_LABELS: Record<Priority, string> = { normal: 'Normal', urgent: 'Urgent', emergency: 'Emergency' };

const statusStyles: Record<ApptStatus, string> = {
  scheduled: 'bg-blue-100 text-blue-700',
  confirmed: 'bg-cyan-100 text-cyan-700',
  in_progress: 'bg-amber-100 text-amber-700',
  completed: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-gray-100 text-gray-500',
  no_show: 'bg-gray-100 text-gray-500',
};

const priorityStyles: Record<Priority, string> = {
  normal: 'bg-gray-100 text-gray-500',
  urgent: 'bg-orange-100 text-orange-700',
  emergency: 'bg-red-100 text-red-700',
};

const serviceTypeIcons: Record<ServiceType, React.ReactNode> = {
  routine_checkup: <Activity className="w-3.5 h-3.5" />,
  vaccination: <Syringe className="w-3.5 h-3.5" />,
  emergency: <AlertTriangle className="w-3.5 h-3.5" />,
  surgery: <Scissors className="w-3.5 h-3.5" />,
  breeding: <Heart className="w-3.5 h-3.5" />,
  nutrition: <Pill className="w-3.5 h-3.5" />,
  disease_treatment: <Pill className="w-3.5 h-3.5" />,
  deworming: <Pill className="w-3.5 h-3.5" />,
  pregnancy_check: <Heart className="w-3.5 h-3.5" />,
  dental: <Activity className="w-3.5 h-3.5" />,
  consultation: <FileText className="w-3.5 h-3.5" />,
  lab_test: <FlaskConical className="w-3.5 h-3.5" />,
};

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } } };
const cardVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } } };

// -- Helpers ------------------------------------------------------------------

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function generateAppointmentNumber(): string {
  const d = new Date();
  const yyyymmdd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  const rand = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `VET-${yyyymmdd}-${rand}`;
}

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
      {type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}{message}
    </div>
  );
}

// -- Component ----------------------------------------------------------------

export default function VeterinaryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ApptStatus | 'all'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<VetAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Inline edit
  const [editVet, setEditVet] = useState('');
  const [editStatus, setEditStatus] = useState<ApptStatus>('scheduled');
  const [editDiagnosis, setEditDiagnosis] = useState('');

  // New appointment modal
  const [showNewModal, setShowNewModal] = useState(false);
  const [newAppt, setNewAppt] = useState({
    description: '', service_type: 'routine_checkup' as ServiceType,
    animal_type: 'cattle', animal_count: 1, priority: 'normal' as Priority,
    scheduled_date: '', country_code: '', farm_location: '',
  });
  const [userSearch, setUserSearch] = useState('');
  const [userResults, setUserResults] = useState<ProfileLite[]>([]);
  const [selectedUser, setSelectedUser] = useState<ProfileLite | null>(null);
  const [creating, setCreating] = useState(false);

  const supabase = createClient();

  const fetchData = useCallback(async () => {
    setLoadError(null);
    const { data, error } = await supabase
      .from('vet_appointments')
      .select('*, user:profiles!user_id(full_name, email, country)')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('[veterinary] fetch failed', error);
      setLoadError(error.message || 'Failed to load veterinary appointments');
      setAppointments([]);
    } else {
      setAppointments((data || []) as VetAppointment[]);
    }
    setIsLoading(false);
  }, [supabase]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // User search
  useEffect(() => {
    if (!showNewModal || userSearch.trim().length < 2) { setUserResults([]); return; }
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, email, country')
        .or(`full_name.ilike.%${userSearch}%,email.ilike.%${userSearch}%`)
        .limit(8);
      if (!cancelled) setUserResults((data || []) as ProfileLite[]);
    })();
    return () => { cancelled = true; };
  }, [userSearch, showNewModal, supabase]);

  const statCounts = {
    total: appointments.length,
    upcoming: appointments.filter(a => a.status === 'scheduled' || a.status === 'confirmed').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    emergency: appointments.filter(a => a.priority === 'emergency').length,
  };

  const handleExpand = (a: VetAppointment) => {
    if (expandedId === a.id) { setExpandedId(null); return; }
    setExpandedId(a.id);
    setEditVet(a.assigned_vet_name || '');
    setEditStatus(a.status);
    setEditDiagnosis(a.diagnosis || '');
  };

  const handleAssignVet = async (id: string) => {
    if (!editVet.trim()) return;
    setActionLoading(id + '-vet');
    const { error } = await supabase.from('vet_appointments').update({ assigned_vet_name: editVet.trim() }).eq('id', id);
    setActionLoading(null);
    if (error) { setToast({ message: `Failed: ${error.message}`, type: 'error' }); return; }
    setToast({ message: 'Veterinarian assigned', type: 'success' });
    await fetchData();
  };

  const handleUpdateStatus = async (id: string) => {
    setActionLoading(id + '-status');
    const patch: Record<string, unknown> = { status: editStatus };
    if (editStatus === 'completed') patch.completed_date = new Date().toISOString();
    const { error } = await supabase.from('vet_appointments').update(patch).eq('id', id);
    setActionLoading(null);
    if (error) { setToast({ message: `Failed: ${error.message}`, type: 'error' }); return; }
    setToast({ message: `Status updated to ${STATUS_LABELS[editStatus]}`, type: 'success' });
    await fetchData();
  };

  const handleSaveDiagnosis = async (id: string) => {
    if (!editDiagnosis.trim()) return;
    setActionLoading(id + '-diag');
    const { error } = await supabase.from('vet_appointments').update({ diagnosis: editDiagnosis.trim() }).eq('id', id);
    setActionLoading(null);
    if (error) { setToast({ message: `Failed: ${error.message}`, type: 'error' }); return; }
    setToast({ message: 'Diagnosis saved', type: 'success' });
    await fetchData();
  };

  const handleCreate = async () => {
    if (!newAppt.description.trim() || !selectedUser) {
      setToast({ message: 'Description and farmer are required', type: 'error' });
      return;
    }
    setCreating(true);
    const { error } = await supabase.from('vet_appointments').insert({
      user_id: selectedUser.id,
      appointment_number: generateAppointmentNumber(),
      service_type: newAppt.service_type,
      animal_type: newAppt.animal_type.trim() || 'cattle',
      animal_count: newAppt.animal_count || 1,
      description: newAppt.description.trim(),
      status: 'scheduled',
      priority: newAppt.priority,
      scheduled_date: newAppt.scheduled_date ? new Date(newAppt.scheduled_date).toISOString() : null,
      country_code: newAppt.country_code.trim() || selectedUser.country || null,
      farm_location: newAppt.farm_location.trim() || null,
    });
    setCreating(false);
    if (error) { setToast({ message: `Failed: ${error.message}`, type: 'error' }); return; }
    setToast({ message: 'Appointment created', type: 'success' });
    setShowNewModal(false);
    setNewAppt({ description: '', service_type: 'routine_checkup', animal_type: 'cattle', animal_count: 1, priority: 'normal', scheduled_date: '', country_code: '', farm_location: '' });
    setSelectedUser(null);
    setUserSearch('');
    await fetchData();
  };

  const statusFilters: (ApptStatus | 'all')[] = ['all', 'scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled'];

  const filtered = appointments.filter((a) => {
    if (statusFilter !== 'all' && a.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const farmer = (a.user?.full_name || '').toLowerCase();
      if (!farmer.includes(q) && !a.appointment_number.toLowerCase().includes(q) && !a.animal_type.toLowerCase().includes(q) && !a.service_type.toLowerCase().includes(q) && !(a.country_code || '').toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <motion.div variants={cardVariants} className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#1B2A4A] rounded-lg"><Stethoscope className="w-5 h-5 text-white" /></div>
          <div>
            <h1 className="text-2xl font-bold text-[#1B2A4A] tracking-tight">Veterinary Services</h1>
            <p className="text-gray-500 text-sm">Manage veterinary appointments and animal health services</p>
          </div>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#5DB347] hover:bg-[#4ea03b] text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> New Appointment
        </button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Appointments', value: statCounts.total, icon: <Calendar className="w-5 h-5" />, color: 'text-[#1B2A4A]', bg: 'bg-gray-50' },
          { label: 'Upcoming', value: statCounts.upcoming, icon: <Clock className="w-5 h-5" />, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Completed', value: statCounts.completed, icon: <CheckCircle2 className="w-5 h-5" />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Emergency', value: statCounts.emergency, icon: <AlertTriangle className="w-5 h-5" />, color: 'text-red-600', bg: 'bg-red-50' },
        ].map((stat, i) => (
          <motion.div key={stat.label} variants={cardVariants} custom={i} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{stat.label}</span>
              <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>{stat.icon}</div>
            </div>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Search & Filter */}
      <motion.div variants={cardVariants} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search by farmer, number, animal, service..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] text-[#1B2A4A]" />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {statusFilters.map((s) => (
              <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${statusFilter === s ? 'bg-[#1B2A4A] text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>
                {s === 'all' ? 'All' : STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* List */}
      <motion.div variants={cardVariants} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[#1B2A4A]">Veterinary Appointments</h2>
          <span className="text-xs text-gray-400">{filtered.length} results</span>
        </div>

        {isLoading && (
          <div className="text-center py-16">
            <Loader2 className="w-6 h-6 text-gray-300 mx-auto mb-3 animate-spin" />
            <p className="text-gray-400 text-sm">Loading appointments...</p>
          </div>
        )}

        {!isLoading && loadError && (
          <div className="text-center py-16">
            <AlertCircle className="w-8 h-8 text-red-300 mx-auto mb-3" />
            <p className="text-red-500 text-sm">{loadError}</p>
          </div>
        )}

        {!isLoading && !loadError && filtered.length === 0 && (
          <div className="text-center py-16">
            <Stethoscope className="w-8 h-8 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">
              {appointments.length === 0 ? "No appointments yet. Click 'New Appointment' to create one." : 'No appointments match your filters.'}
            </p>
          </div>
        )}

        {!isLoading && !loadError && filtered.length > 0 && (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50/80">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Number</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Farmer</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Animals</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Service</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Priority</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Scheduled</th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((appt) => {
                    const isExpanded = expandedId === appt.id;
                    const farmerName = appt.user?.full_name || 'Unknown farmer';
                    const country = appt.country_code || appt.user?.country || '';
                    return (
                      <AnimatePresence key={appt.id}>
                        <tr className={`hover:bg-gray-50/50 transition-colors ${isExpanded ? 'bg-blue-50/30' : appt.priority === 'emergency' ? 'bg-red-50/20' : ''}`}>
                          <td className="px-6 py-4 font-mono text-xs text-gray-500 whitespace-nowrap">{appt.appointment_number}</td>
                          <td className="px-6 py-4 font-medium text-[#1B2A4A] whitespace-nowrap">
                            {farmerName}
                            {country && <span className="ml-2 text-xs text-gray-400"><MapPin className="w-3 h-3 inline" />{country}</span>}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap"><span className="text-gray-600 capitalize">{appt.animal_type}</span><span className="ml-1.5 text-xs text-gray-400">({appt.animal_count.toLocaleString()})</span></td>
                          <td className="px-6 py-4 whitespace-nowrap"><span className="inline-flex items-center gap-1.5 text-gray-600 text-xs">{serviceTypeIcons[appt.service_type]}{SERVICE_TYPES.find(t => t.value === appt.service_type)?.label}</span></td>
                          <td className="px-6 py-4 whitespace-nowrap"><span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${priorityStyles[appt.priority]}`}>{appt.priority === 'emergency' && <AlertTriangle className="w-3 h-3" />}{PRIORITY_LABELS[appt.priority]}</span></td>
                          <td className="px-6 py-4 whitespace-nowrap"><span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyles[appt.status]}`}>{STATUS_LABELS[appt.status]}</span></td>
                          <td className="px-6 py-4 text-gray-500 whitespace-nowrap">{formatDate(appt.scheduled_date)}</td>
                          <td className="px-6 py-4 text-right whitespace-nowrap">
                            <button onClick={() => handleExpand(appt)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-[#1B2A4A]" title="View details">
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr key={`${appt.id}-detail`}>
                            <td colSpan={8} className="px-6 py-0">
                              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                                <div className="py-4 space-y-4 border-t border-dashed border-gray-200">
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Description</p>
                                      <p className="text-sm text-gray-600 leading-relaxed">{appt.description}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Assigned Vet</p>
                                      <p className="text-sm text-[#1B2A4A] font-medium"><User className="w-3.5 h-3.5 inline mr-1.5 text-gray-400" />{appt.assigned_vet_name || 'Unassigned'}</p>
                                      {appt.farm_location && <p className="text-xs text-gray-400 mt-1">{appt.farm_location}</p>}
                                    </div>
                                    <div>
                                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Diagnosis</p>
                                      <p className="text-sm text-gray-600 leading-relaxed">{appt.diagnosis || 'No diagnosis yet'}</p>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-gray-100">
                                    <div>
                                      <label className="block text-xs font-semibold text-gray-500 mb-1">Assign Vet</label>
                                      <div className="flex gap-2">
                                        <input value={editVet} onChange={e => setEditVet(e.target.value)} className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-200 outline-none" placeholder="Dr. Name..." />
                                        <button onClick={() => handleAssignVet(appt.id)} disabled={actionLoading === appt.id + '-vet'} className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-1">
                                          {actionLoading === appt.id + '-vet' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} Assign
                                        </button>
                                      </div>
                                    </div>
                                    <div>
                                      <label className="block text-xs font-semibold text-gray-500 mb-1">Update Status</label>
                                      <div className="flex gap-2">
                                        <select value={editStatus} onChange={e => setEditStatus(e.target.value as ApptStatus)} className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white">
                                          {(Object.keys(STATUS_LABELS) as ApptStatus[]).map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                                        </select>
                                        <button onClick={() => handleUpdateStatus(appt.id)} disabled={actionLoading === appt.id + '-status'} className="px-3 py-1.5 bg-[#1B2A4A] text-white text-xs font-medium rounded-lg hover:bg-[#1B2A4A]/90 disabled:opacity-50 transition-colors flex items-center gap-1">
                                          {actionLoading === appt.id + '-status' ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />} Update
                                        </button>
                                      </div>
                                    </div>
                                    <div>
                                      <label className="block text-xs font-semibold text-gray-500 mb-1">Diagnosis</label>
                                      <div className="flex gap-2">
                                        <input value={editDiagnosis} onChange={e => setEditDiagnosis(e.target.value)} className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-200 outline-none" placeholder="Diagnosis..." />
                                        <button onClick={() => handleSaveDiagnosis(appt.id)} disabled={actionLoading === appt.id + '-diag' || !editDiagnosis.trim()} className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors flex items-center gap-1">
                                          {actionLoading === appt.id + '-diag' ? <Loader2 className="w-3 h-3 animate-spin" /> : <FileText className="w-3 h-3" />} Save
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            </td>
                          </tr>
                        )}
                      </AnimatePresence>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-gray-100">
              {filtered.map((appt) => {
                const isExpanded = expandedId === appt.id;
                const farmerName = appt.user?.full_name || 'Unknown farmer';
                return (
                  <div key={appt.id} className={`p-4 ${appt.priority === 'emergency' ? 'bg-red-50/30' : ''}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-[#1B2A4A]">{farmerName}</p>
                        <p className="text-xs text-gray-500">{appt.appointment_number}</p>
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyles[appt.status]}`}>{STATUS_LABELS[appt.status]}</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="inline-flex items-center gap-1.5 text-xs text-gray-600">{serviceTypeIcons[appt.service_type]}{SERVICE_TYPES.find(t => t.value === appt.service_type)?.label}</span>
                      <span className="text-xs text-gray-500 capitalize">{appt.animal_type} ({appt.animal_count.toLocaleString()})</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-gray-400">{formatDate(appt.scheduled_date)}</p>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${priorityStyles[appt.priority]}`}>{PRIORITY_LABELS[appt.priority]}</span>
                      </div>
                      <button onClick={() => handleExpand(appt)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400">{isExpanded ? <ChevronUp className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                    </div>
                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-dashed border-gray-200 space-y-2">
                        <p className="text-xs text-gray-600">{appt.description}</p>
                        <p className="text-xs text-gray-600"><User className="w-3 h-3 inline mr-1" />{appt.assigned_vet_name || 'Unassigned'}</p>
                        <div className="flex gap-2">
                          <input value={editVet} onChange={e => setEditVet(e.target.value)} className="flex-1 px-2 py-1 border border-gray-200 rounded text-xs" placeholder="Vet..." />
                          <button onClick={() => handleAssignVet(appt.id)} className="px-2 py-1 bg-blue-600 text-white text-xs rounded">Assign</button>
                        </div>
                        <div className="flex gap-2">
                          <select value={editStatus} onChange={e => setEditStatus(e.target.value as ApptStatus)} className="flex-1 px-2 py-1 border border-gray-200 rounded text-xs bg-white">
                            {(Object.keys(STATUS_LABELS) as ApptStatus[]).map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                          </select>
                          <button onClick={() => handleUpdateStatus(appt.id)} className="px-2 py-1 bg-[#1B2A4A] text-white text-xs rounded">Update</button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </motion.div>

      {/* New Appointment Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowNewModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-[#1B2A4A]">New Vet Appointment</h3>
              <button onClick={() => setShowNewModal(false)} className="p-1 rounded hover:bg-gray-100"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Farmer (search by name or email)</label>
                {selectedUser ? (
                  <div className="flex items-center justify-between px-3 py-2 bg-emerald-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-[#1B2A4A]">{selectedUser.full_name || selectedUser.email}</p>
                      <p className="text-xs text-gray-500">{selectedUser.email}{selectedUser.country ? ` · ${selectedUser.country}` : ''}</p>
                    </div>
                    <button onClick={() => { setSelectedUser(null); setUserSearch(''); }} className="p-1 hover:bg-emerald-100 rounded"><X className="w-4 h-4 text-gray-500" /></button>
                  </div>
                ) : (
                  <>
                    <input value={userSearch} onChange={e => setUserSearch(e.target.value)} placeholder="Type at least 2 characters..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none" />
                    {userResults.length > 0 && (
                      <div className="mt-1 border border-gray-200 rounded-lg max-h-40 overflow-y-auto">
                        {userResults.map(u => (
                          <button key={u.id} onClick={() => setSelectedUser(u)} className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0">
                            <p className="text-sm text-[#1B2A4A]">{u.full_name || '(no name)'}</p>
                            <p className="text-xs text-gray-500">{u.email}</p>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
                <textarea value={newAppt.description} onChange={e => setNewAppt({ ...newAppt, description: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none" placeholder="What needs to be done..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Service Type</label>
                  <select value={newAppt.service_type} onChange={e => setNewAppt({ ...newAppt, service_type: e.target.value as ServiceType })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
                    {SERVICE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Priority</label>
                  <select value={newAppt.priority} onChange={e => setNewAppt({ ...newAppt, priority: e.target.value as Priority })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
                    {(Object.keys(PRIORITY_LABELS) as Priority[]).map(p => <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Animal Type</label>
                  <input value={newAppt.animal_type} onChange={e => setNewAppt({ ...newAppt, animal_type: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="cattle, goat, poultry..." />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Animal Count</label>
                  <input type="number" min={1} value={newAppt.animal_count} onChange={e => setNewAppt({ ...newAppt, animal_count: parseInt(e.target.value) || 1 })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Scheduled Date</label>
                  <input type="datetime-local" value={newAppt.scheduled_date} onChange={e => setNewAppt({ ...newAppt, scheduled_date: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Country (ISO)</label>
                  <input value={newAppt.country_code} onChange={e => setNewAppt({ ...newAppt, country_code: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="KE, NG, GH" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Farm Location (optional)</label>
                <input value={newAppt.farm_location} onChange={e => setNewAppt({ ...newAppt, farm_location: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Address or landmark" />
              </div>
            </div>
            <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100">
              <button onClick={() => setShowNewModal(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={handleCreate} disabled={creating} className="inline-flex items-center gap-2 px-4 py-2 bg-[#5DB347] hover:bg-[#4ea03b] text-white text-sm font-semibold rounded-lg disabled:opacity-50">
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Create Appointment
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
