'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Scale, FileText, Clock, CheckCircle2, Search, ChevronUp, Eye,
  AlertTriangle, MapPin, User, Briefcase, Shield, Plus, X,
  Loader2, AlertCircle, Save,
} from 'lucide-react';

// -- Types (DB shape) ---------------------------------------------------------

type CaseStatus = 'pending' | 'in_progress' | 'resolved' | 'closed' | 'escalated';
type CasePriority = 'low' | 'medium' | 'high' | 'urgent';
type CaseType =
  | 'land_dispute' | 'contract_review' | 'compliance' | 'cooperative'
  | 'intellectual_property' | 'employment' | 'insurance_claim' | 'trade_dispute' | 'other';

interface NoteEntry { author?: string; text: string; created_at: string }

interface LegalCase {
  id: string;
  case_number: string;
  user_id: string;
  case_type: CaseType;
  title: string;
  description: string;
  status: CaseStatus;
  priority: CasePriority;
  country_code: string | null;
  region: string | null;
  assigned_firm: string | null;
  assigned_lawyer: string | null;
  notes: NoteEntry[] | null;
  created_at: string;
  user?: { full_name: string | null; email: string | null; country: string | null } | null;
}

interface ProfileLite { id: string; full_name: string | null; email: string | null; country: string | null }

// -- Constants ----------------------------------------------------------------

const CASE_TYPES: { value: CaseType; label: string }[] = [
  { value: 'land_dispute', label: 'Land Dispute' },
  { value: 'contract_review', label: 'Contract Review' },
  { value: 'compliance', label: 'Compliance' },
  { value: 'cooperative', label: 'Cooperative' },
  { value: 'intellectual_property', label: 'Intellectual Property' },
  { value: 'employment', label: 'Employment' },
  { value: 'insurance_claim', label: 'Insurance Claim' },
  { value: 'trade_dispute', label: 'Trade Dispute' },
  { value: 'other', label: 'Other' },
];

const STATUS_LABELS: Record<CaseStatus, string> = {
  pending: 'Pending', in_progress: 'In Progress', resolved: 'Resolved', closed: 'Closed', escalated: 'Escalated',
};

const PRIORITY_LABELS: Record<CasePriority, string> = {
  low: 'Low', medium: 'Medium', high: 'High', urgent: 'Urgent',
};

const statusStyles: Record<CaseStatus, string> = {
  pending: 'bg-amber-100 text-amber-700',
  in_progress: 'bg-blue-100 text-blue-700',
  resolved: 'bg-emerald-100 text-emerald-700',
  closed: 'bg-gray-100 text-gray-500',
  escalated: 'bg-red-100 text-red-700',
};

const priorityStyles: Record<CasePriority, string> = {
  low: 'bg-gray-100 text-gray-500',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
};

const caseTypeIcons: Record<CaseType, React.ReactNode> = {
  land_dispute: <MapPin className="w-3.5 h-3.5" />,
  contract_review: <FileText className="w-3.5 h-3.5" />,
  compliance: <Shield className="w-3.5 h-3.5" />,
  cooperative: <User className="w-3.5 h-3.5" />,
  intellectual_property: <Briefcase className="w-3.5 h-3.5" />,
  employment: <User className="w-3.5 h-3.5" />,
  insurance_claim: <Shield className="w-3.5 h-3.5" />,
  trade_dispute: <Briefcase className="w-3.5 h-3.5" />,
  other: <FileText className="w-3.5 h-3.5" />,
};

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } } };
const cardVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } } };

// -- Helpers ------------------------------------------------------------------

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function generateCaseNumber(): string {
  const d = new Date();
  const yyyymmdd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  const rand = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `LGL-${yyyymmdd}-${rand}`;
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

export default function LegalServicesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<CaseStatus | 'all'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [legalCases, setLegalCases] = useState<LegalCase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Inline edit
  const [editFirm, setEditFirm] = useState('');
  const [editStatus, setEditStatus] = useState<CaseStatus>('pending');
  const [newNote, setNewNote] = useState('');

  // New case modal
  const [showNewModal, setShowNewModal] = useState(false);
  const [newCase, setNewCase] = useState({
    title: '', description: '', case_type: 'compliance' as CaseType,
    priority: 'medium' as CasePriority, country_code: '', user_id: '',
  });
  const [userSearch, setUserSearch] = useState('');
  const [userResults, setUserResults] = useState<ProfileLite[]>([]);
  const [selectedUser, setSelectedUser] = useState<ProfileLite | null>(null);
  const [creating, setCreating] = useState(false);

  const supabase = createClient();

  const fetchData = useCallback(async () => {
    setLoadError(null);
    const { data, error } = await supabase
      .from('legal_cases')
      .select('*, user:profiles!user_id(full_name, email, country)')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('[legal-services] fetch failed', error);
      setLoadError(error.message || 'Failed to load legal cases');
      setLegalCases([]);
    } else {
      setLegalCases((data || []) as LegalCase[]);
    }
    setIsLoading(false);
  }, [supabase]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // User search for new case modal
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
    total: legalCases.length,
    pending: legalCases.filter(c => c.status === 'pending').length,
    inProgress: legalCases.filter(c => c.status === 'in_progress').length,
    resolved: legalCases.filter(c => c.status === 'resolved').length,
  };

  const handleExpand = (lc: LegalCase) => {
    if (expandedId === lc.id) { setExpandedId(null); return; }
    setExpandedId(lc.id);
    setEditFirm(lc.assigned_firm || '');
    setEditStatus(lc.status);
    setNewNote('');
  };

  const handleAssignFirm = async (id: string) => {
    if (!editFirm.trim()) return;
    setActionLoading(id + '-firm');
    const { error } = await supabase.from('legal_cases').update({ assigned_firm: editFirm.trim() }).eq('id', id);
    setActionLoading(null);
    if (error) { setToast({ message: `Failed: ${error.message}`, type: 'error' }); return; }
    setToast({ message: 'Firm assigned', type: 'success' });
    await fetchData();
  };

  const handleUpdateStatus = async (id: string) => {
    setActionLoading(id + '-status');
    const patch: Record<string, unknown> = { status: editStatus };
    if (editStatus === 'resolved') patch.resolved_at = new Date().toISOString();
    const { error } = await supabase.from('legal_cases').update(patch).eq('id', id);
    setActionLoading(null);
    if (error) { setToast({ message: `Failed: ${error.message}`, type: 'error' }); return; }
    setToast({ message: `Status updated to ${STATUS_LABELS[editStatus]}`, type: 'success' });
    await fetchData();
  };

  const handleAddNote = async (id: string) => {
    if (!newNote.trim()) return;
    setActionLoading(id + '-note');
    const current = legalCases.find(c => c.id === id);
    const existingNotes: NoteEntry[] = Array.isArray(current?.notes) ? current!.notes! : [];
    const updatedNotes: NoteEntry[] = [
      ...existingNotes,
      { text: newNote.trim(), created_at: new Date().toISOString(), author: 'admin' },
    ];
    const { error } = await supabase.from('legal_cases').update({ notes: updatedNotes }).eq('id', id);
    setActionLoading(null);
    if (error) { setToast({ message: `Failed: ${error.message}`, type: 'error' }); return; }
    setNewNote('');
    setToast({ message: 'Note added', type: 'success' });
    await fetchData();
  };

  const handleCreate = async () => {
    if (!newCase.title.trim() || !newCase.description.trim() || !selectedUser) {
      setToast({ message: 'Title, description and farmer are required', type: 'error' });
      return;
    }
    setCreating(true);
    const { error } = await supabase.from('legal_cases').insert({
      user_id: selectedUser.id,
      case_number: generateCaseNumber(),
      case_type: newCase.case_type,
      title: newCase.title.trim(),
      description: newCase.description.trim(),
      priority: newCase.priority,
      country_code: newCase.country_code.trim() || selectedUser.country || null,
      status: 'pending',
    });
    setCreating(false);
    if (error) { setToast({ message: `Failed: ${error.message}`, type: 'error' }); return; }
    setToast({ message: 'Case created', type: 'success' });
    setShowNewModal(false);
    setNewCase({ title: '', description: '', case_type: 'compliance', priority: 'medium', country_code: '', user_id: '' });
    setSelectedUser(null);
    setUserSearch('');
    await fetchData();
  };

  const statusFilters: (CaseStatus | 'all')[] = ['all', 'pending', 'in_progress', 'resolved', 'closed', 'escalated'];

  const filtered = legalCases.filter((c) => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const farmer = (c.user?.full_name || '').toLowerCase();
      if (!farmer.includes(q) && !c.case_number.toLowerCase().includes(q) && !c.title.toLowerCase().includes(q) && !(c.country_code || '').toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <motion.div variants={cardVariants} className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#1B2A4A] rounded-lg"><Scale className="w-5 h-5 text-white" /></div>
          <div>
            <h1 className="text-2xl font-bold text-[#1B2A4A] tracking-tight">Legal Services</h1>
            <p className="text-gray-500 text-sm">Manage legal service requests and case progress for farmers</p>
          </div>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#5DB347] hover:bg-[#4ea03b] text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> New Case
        </button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Cases', value: statCounts.total, icon: <FileText className="w-5 h-5" />, color: 'text-[#1B2A4A]', bg: 'bg-gray-50' },
          { label: 'Pending Review', value: statCounts.pending, icon: <Clock className="w-5 h-5" />, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'In Progress', value: statCounts.inProgress, icon: <Scale className="w-5 h-5" />, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Resolved', value: statCounts.resolved, icon: <CheckCircle2 className="w-5 h-5" />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
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
            <input type="text" placeholder="Search by farmer, case number, title, country..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] text-[#1B2A4A]" />
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

      {/* Cases List */}
      <motion.div variants={cardVariants} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[#1B2A4A]">Legal Cases</h2>
          <span className="text-xs text-gray-400">{filtered.length} results</span>
        </div>

        {isLoading && (
          <div className="text-center py-16">
            <Loader2 className="w-6 h-6 text-gray-300 mx-auto mb-3 animate-spin" />
            <p className="text-gray-400 text-sm">Loading legal cases...</p>
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
            <Scale className="w-8 h-8 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">
              {legalCases.length === 0 ? "No legal cases yet. Click 'New Case' to create one." : 'No legal cases match your filters.'}
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
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Case #</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Farmer</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Priority</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((lc) => {
                    const isExpanded = expandedId === lc.id;
                    const farmerName = lc.user?.full_name || 'Unknown farmer';
                    const country = lc.country_code || lc.user?.country || '';
                    return (
                      <AnimatePresence key={lc.id}>
                        <tr className={`hover:bg-gray-50/50 transition-colors ${isExpanded ? 'bg-blue-50/30' : ''}`}>
                          <td className="px-6 py-4 font-mono text-xs text-gray-500 whitespace-nowrap">{lc.case_number}</td>
                          <td className="px-6 py-4 font-medium text-[#1B2A4A] whitespace-nowrap">
                            {farmerName}
                            {country && <span className="ml-2 text-xs text-gray-400"><MapPin className="w-3 h-3 inline" />{country}</span>}
                          </td>
                          <td className="px-6 py-4 text-gray-600 max-w-xs truncate">{lc.title}</td>
                          <td className="px-6 py-4 whitespace-nowrap"><span className="inline-flex items-center gap-1.5 text-gray-600 text-xs">{caseTypeIcons[lc.case_type]}{CASE_TYPES.find(t => t.value === lc.case_type)?.label || lc.case_type}</span></td>
                          <td className="px-6 py-4 whitespace-nowrap"><span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${priorityStyles[lc.priority]}`}>{(lc.priority === 'high' || lc.priority === 'urgent') && <AlertTriangle className="w-3 h-3" />}{PRIORITY_LABELS[lc.priority]}</span></td>
                          <td className="px-6 py-4 whitespace-nowrap"><span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyles[lc.status]}`}>{STATUS_LABELS[lc.status]}</span></td>
                          <td className="px-6 py-4 text-gray-500 whitespace-nowrap">{formatDate(lc.created_at)}</td>
                          <td className="px-6 py-4 text-right whitespace-nowrap">
                            <button onClick={() => handleExpand(lc)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-[#1B2A4A]" title="View details">
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr key={`${lc.id}-detail`}>
                            <td colSpan={8} className="px-6 py-0">
                              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                                <div className="py-4 space-y-4 border-t border-dashed border-gray-200">
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Description</p>
                                      <p className="text-sm text-gray-600 leading-relaxed">{lc.description}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Assigned Firm</p>
                                      <p className="text-sm text-[#1B2A4A] font-medium"><Briefcase className="w-3.5 h-3.5 inline mr-1.5 text-gray-400" />{lc.assigned_firm || 'Unassigned'}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Notes</p>
                                      {Array.isArray(lc.notes) && lc.notes.length > 0 ? (
                                        <ul className="text-xs text-gray-600 space-y-1">
                                          {lc.notes.slice(-3).map((n, idx) => (
                                            <li key={idx} className="border-l-2 border-gray-200 pl-2">
                                              <span className="text-gray-400">{formatDate(n.created_at)}</span> {n.text}
                                            </li>
                                          ))}
                                        </ul>
                                      ) : (
                                        <p className="text-sm text-gray-400">No notes</p>
                                      )}
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-gray-100">
                                    <div>
                                      <label className="block text-xs font-semibold text-gray-500 mb-1">Assign Firm</label>
                                      <div className="flex gap-2">
                                        <input value={editFirm} onChange={e => setEditFirm(e.target.value)} className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-200 outline-none" placeholder="Firm name..." />
                                        <button onClick={() => handleAssignFirm(lc.id)} disabled={actionLoading === lc.id + '-firm'} className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-1">
                                          {actionLoading === lc.id + '-firm' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} Assign
                                        </button>
                                      </div>
                                    </div>
                                    <div>
                                      <label className="block text-xs font-semibold text-gray-500 mb-1">Update Status</label>
                                      <div className="flex gap-2">
                                        <select value={editStatus} onChange={e => setEditStatus(e.target.value as CaseStatus)} className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white">
                                          {(Object.keys(STATUS_LABELS) as CaseStatus[]).map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                                        </select>
                                        <button onClick={() => handleUpdateStatus(lc.id)} disabled={actionLoading === lc.id + '-status'} className="px-3 py-1.5 bg-[#1B2A4A] text-white text-xs font-medium rounded-lg hover:bg-[#1B2A4A]/90 disabled:opacity-50 transition-colors flex items-center gap-1">
                                          {actionLoading === lc.id + '-status' ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />} Update
                                        </button>
                                      </div>
                                    </div>
                                    <div>
                                      <label className="block text-xs font-semibold text-gray-500 mb-1">Add Note</label>
                                      <div className="flex gap-2">
                                        <input value={newNote} onChange={e => setNewNote(e.target.value)} className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-200 outline-none" placeholder="Add a note..." onKeyDown={e => { if (e.key === 'Enter') handleAddNote(lc.id); }} />
                                        <button onClick={() => handleAddNote(lc.id)} disabled={actionLoading === lc.id + '-note' || !newNote.trim()} className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors flex items-center gap-1">
                                          {actionLoading === lc.id + '-note' ? <Loader2 className="w-3 h-3 animate-spin" /> : <FileText className="w-3 h-3" />} Add
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
              {filtered.map((lc) => {
                const isExpanded = expandedId === lc.id;
                const farmerName = lc.user?.full_name || 'Unknown farmer';
                return (
                  <div key={lc.id} className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-[#1B2A4A]">{farmerName}</p>
                        <p className="text-xs text-gray-500">{lc.case_number}</p>
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyles[lc.status]}`}>{STATUS_LABELS[lc.status]}</span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{lc.title}</p>
                    <div className="flex items-center justify-between mb-2">
                      <span className="inline-flex items-center gap-1.5 text-xs text-gray-600">{caseTypeIcons[lc.case_type]}{CASE_TYPES.find(t => t.value === lc.case_type)?.label}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${priorityStyles[lc.priority]}`}>{PRIORITY_LABELS[lc.priority]}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-400">{formatDate(lc.created_at)}</p>
                      <button onClick={() => handleExpand(lc)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-dashed border-gray-200 space-y-2">
                        <p className="text-xs text-gray-600">{lc.description}</p>
                        <p className="text-xs text-gray-600"><Briefcase className="w-3 h-3 inline mr-1" />{lc.assigned_firm || 'Unassigned'}</p>
                        <div className="flex gap-2">
                          <input value={editFirm} onChange={e => setEditFirm(e.target.value)} className="flex-1 px-2 py-1 border border-gray-200 rounded text-xs" placeholder="Firm..." />
                          <button onClick={() => handleAssignFirm(lc.id)} className="px-2 py-1 bg-blue-600 text-white text-xs rounded">Assign</button>
                        </div>
                        <div className="flex gap-2">
                          <select value={editStatus} onChange={e => setEditStatus(e.target.value as CaseStatus)} className="flex-1 px-2 py-1 border border-gray-200 rounded text-xs bg-white">
                            {(Object.keys(STATUS_LABELS) as CaseStatus[]).map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                          </select>
                          <button onClick={() => handleUpdateStatus(lc.id)} className="px-2 py-1 bg-[#1B2A4A] text-white text-xs rounded">Update</button>
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

      {/* New Case Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowNewModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-[#1B2A4A]">New Legal Case</h3>
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
                <label className="block text-xs font-semibold text-gray-600 mb-1">Title</label>
                <input value={newCase.title} onChange={e => setNewCase({ ...newCase, title: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none" placeholder="Brief case title" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
                <textarea value={newCase.description} onChange={e => setNewCase({ ...newCase, description: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none" placeholder="Case details..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Case Type</label>
                  <select value={newCase.case_type} onChange={e => setNewCase({ ...newCase, case_type: e.target.value as CaseType })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
                    {CASE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Priority</label>
                  <select value={newCase.priority} onChange={e => setNewCase({ ...newCase, priority: e.target.value as CasePriority })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
                    {(Object.keys(PRIORITY_LABELS) as CasePriority[]).map(p => <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Country (ISO code, optional)</label>
                <input value={newCase.country_code} onChange={e => setNewCase({ ...newCase, country_code: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none" placeholder="e.g. KE, NG, GH" />
              </div>
            </div>
            <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100">
              <button onClick={() => setShowNewModal(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={handleCreate} disabled={creating} className="inline-flex items-center gap-2 px-4 py-2 bg-[#5DB347] hover:bg-[#4ea03b] text-white text-sm font-semibold rounded-lg disabled:opacity-50">
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Create Case
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
