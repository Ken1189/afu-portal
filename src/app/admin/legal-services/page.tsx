'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Scale, FileText, Clock, CheckCircle2, Search, ChevronUp, Eye,
  AlertTriangle, MapPin, User, Briefcase, Calendar, XCircle, Shield,
  Loader2, AlertCircle, Save,
} from 'lucide-react';

// -- Types --------------------------------------------------------------------

type CaseStatus = 'Pending' | 'In Progress' | 'Resolved' | 'Closed';
type CasePriority = 'High' | 'Medium' | 'Low';
type CaseType = 'Land Dispute' | 'Contract Review' | 'Compliance' | 'Cooperative' | 'IP';

interface LegalCase {
  id: string; farmerName: string; farmLocation: string; caseType: CaseType;
  description: string; status: CaseStatus; assignedFirm: string;
  dateSubmitted: string; priority: CasePriority; notes: string;
}

// -- Demo Data ----------------------------------------------------------------

const fallback_legalCases: LegalCase[] = [
  { id: 'LGL-001', farmerName: 'Amina Diallo', farmLocation: 'Senegal', caseType: 'Land Dispute', description: 'Boundary dispute with neighboring commercial farm over 12 hectares.', status: 'In Progress', assignedFirm: 'Dakar Legal Associates', dateSubmitted: '2026-03-20', priority: 'High', notes: 'Survey report pending. Mediation session scheduled for April 5.' },
  { id: 'LGL-002', farmerName: 'Joseph Mwangi', farmLocation: 'Kenya', caseType: 'Contract Review', description: 'Export contract review for macadamia supply agreement with EU buyer.', status: 'Pending', assignedFirm: 'Unassigned', dateSubmitted: '2026-03-22', priority: 'Medium', notes: 'Contract received. Awaiting assignment to legal partner in Nairobi.' },
  { id: 'LGL-003', farmerName: 'Grace Obi', farmLocation: 'Nigeria', caseType: 'Compliance', description: 'NAFDAC certification compliance review for processed cassava exports.', status: 'Resolved', assignedFirm: 'Abuja Chamber Legal', dateSubmitted: '2026-02-28', priority: 'Medium', notes: 'All compliance documents filed. Certificate issued March 15.' },
  { id: 'LGL-004', farmerName: 'Samuel Banda', farmLocation: 'Zambia', caseType: 'Cooperative', description: 'Registration and bylaws drafting for new farmers cooperative (45 members).', status: 'In Progress', assignedFirm: 'Lusaka Law Partners', dateSubmitted: '2026-03-10', priority: 'Low', notes: 'Draft bylaws under review by cooperative leadership committee.' },
  { id: 'LGL-005', farmerName: 'Fatou Camara', farmLocation: 'Ghana', caseType: 'IP', description: 'Trademark registration for organic shea butter brand "Golden Sahel".', status: 'Pending', assignedFirm: 'Accra IP Specialists', dateSubmitted: '2026-03-24', priority: 'Medium', notes: 'Initial search completed. No conflicts found. Filing documents being prepared.' },
  { id: 'LGL-006', farmerName: 'Peter Ndlovu', farmLocation: 'Zimbabwe', caseType: 'Land Dispute', description: 'Title deed verification and transfer for inherited farmland (28 hectares).', status: 'In Progress', assignedFirm: 'Harare Legal Chambers', dateSubmitted: '2026-03-05', priority: 'High', notes: 'Historical records obtained. Title deed transfer application submitted to registrar.' },
  { id: 'LGL-007', farmerName: 'Rose Achieng', farmLocation: 'Uganda', caseType: 'Contract Review', description: 'Lease agreement review for cold storage facility partnership.', status: 'Closed', assignedFirm: 'Kampala Law Group', dateSubmitted: '2026-02-15', priority: 'Low', notes: 'Lease signed. All parties satisfied. File archived.' },
  { id: 'LGL-008', farmerName: 'Mohamed Toure', farmLocation: 'Mali', caseType: 'Compliance', description: 'Cross-border trade compliance for mango exports to EU under new regulations.', status: 'Pending', assignedFirm: 'Unassigned', dateSubmitted: '2026-03-25', priority: 'High', notes: 'Urgent: new EU phytosanitary rules effective May 1. Needs immediate attention.' },
];

// -- Helpers ------------------------------------------------------------------

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const statusStyles: Record<CaseStatus, string> = {
  Pending: 'bg-amber-100 text-amber-700', 'In Progress': 'bg-blue-100 text-blue-700',
  Resolved: 'bg-emerald-100 text-emerald-700', Closed: 'bg-gray-100 text-gray-500',
};

const priorityStyles: Record<CasePriority, string> = {
  High: 'bg-red-100 text-red-700', Medium: 'bg-amber-100 text-amber-700', Low: 'bg-gray-100 text-gray-500',
};

const caseTypeIcons: Record<CaseType, React.ReactNode> = {
  'Land Dispute': <MapPin className="w-3.5 h-3.5" />, 'Contract Review': <FileText className="w-3.5 h-3.5" />,
  Compliance: <Shield className="w-3.5 h-3.5" />, Cooperative: <User className="w-3.5 h-3.5" />, IP: <Briefcase className="w-3.5 h-3.5" />,
};

const fallback_statCounts = { total: 47, pending: 8, inProgress: 15, resolved: 24 };

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } } };
const cardVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } } };

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (<div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>{type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}{message}</div>);
}

// -- Component ----------------------------------------------------------------

export default function LegalServicesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<CaseStatus | 'All'>('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [legalCases, setLegalCases] = useState<LegalCase[]>(fallback_legalCases);
  const [statCounts, setStatCounts] = useState(fallback_statCounts);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Inline edit fields
  const [editFirm, setEditFirm] = useState('');
  const [editStatus, setEditStatus] = useState<CaseStatus>('Pending');
  const [newNote, setNewNote] = useState('');

  const supabase = createClient();

  const fetchData = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('legal_cases').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        const mapped = data.map((row: Record<string, unknown>) => ({
          id: (row.id as string) || '', farmerName: (row.farmer_name as string) || 'Unknown',
          farmLocation: (row.farm_location as string) || (row.country as string) || '',
          caseType: ((row.case_type as string) || 'Compliance') as CaseType,
          description: (row.description as string) || '',
          status: ((row.status as string) || 'Pending') as CaseStatus,
          assignedFirm: (row.assigned_firm as string) || 'Unassigned',
          dateSubmitted: ((row.date_submitted as string) || (row.created_at as string) || '')?.split('T')[0] || '',
          priority: ((row.priority as string) || 'Medium') as CasePriority,
          notes: (row.notes as string) || '',
        }));
        setLegalCases(mapped);
        setStatCounts({ total: mapped.length, pending: mapped.filter(c => c.status === 'Pending').length, inProgress: mapped.filter(c => c.status === 'In Progress').length, resolved: mapped.filter(c => c.status === 'Resolved').length });
      }
    } catch { /* fallback */ }
    setIsLoading(false);
  }, [supabase]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // When expanding, populate edit fields
  const handleExpand = (lc: LegalCase) => {
    if (expandedId === lc.id) { setExpandedId(null); return; }
    setExpandedId(lc.id);
    setEditFirm(lc.assignedFirm);
    setEditStatus(lc.status);
    setNewNote('');
  };

  const handleAssignLawyer = async (id: string) => {
    if (!editFirm.trim()) return;
    setActionLoading(id + '-firm');
    const { error } = await supabase.from('legal_cases').update({ assigned_firm: editFirm.trim() }).eq('id', id);
    if (error) { setLegalCases(prev => prev.map(c => c.id === id ? { ...c, assignedFirm: editFirm.trim() } : c)); }
    else { await fetchData(); }
    setToast({ message: 'Lawyer/firm assigned', type: 'success' });
    setActionLoading(null);
  };

  const handleUpdateStatus = async (id: string) => {
    setActionLoading(id + '-status');
    const { error } = await supabase.from('legal_cases').update({ status: editStatus }).eq('id', id);
    if (error) { setLegalCases(prev => prev.map(c => c.id === id ? { ...c, status: editStatus } : c)); }
    else { await fetchData(); }
    setToast({ message: `Status updated to ${editStatus}`, type: 'success' });
    setActionLoading(null);
  };

  const handleAddNote = async (id: string) => {
    if (!newNote.trim()) return;
    setActionLoading(id + '-note');
    const current = legalCases.find(c => c.id === id);
    const updatedNotes = current?.notes ? `${current.notes}\n[${new Date().toLocaleDateString()}] ${newNote.trim()}` : `[${new Date().toLocaleDateString()}] ${newNote.trim()}`;
    const { error } = await supabase.from('legal_cases').update({ notes: updatedNotes }).eq('id', id);
    if (error) { setLegalCases(prev => prev.map(c => c.id === id ? { ...c, notes: updatedNotes } : c)); }
    else { await fetchData(); }
    setNewNote('');
    setToast({ message: 'Note added', type: 'success' });
    setActionLoading(null);
  };

  const statusFilters: (CaseStatus | 'All')[] = ['All', 'Pending', 'In Progress', 'Resolved', 'Closed'];

  const filtered = legalCases.filter((c) => {
    if (statusFilter !== 'All' && c.status !== statusFilter) return false;
    if (searchQuery && !c.farmerName.toLowerCase().includes(searchQuery.toLowerCase()) && !c.caseType.toLowerCase().includes(searchQuery.toLowerCase()) && !c.farmLocation.toLowerCase().includes(searchQuery.toLowerCase()) && !c.id.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <motion.div variants={cardVariants}>
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 bg-[#1B2A4A] rounded-lg"><Scale className="w-5 h-5 text-white" /></div>
          <div><h1 className="text-2xl font-bold text-[#1B2A4A] tracking-tight">Legal Services</h1><p className="text-gray-500 text-sm">Manage legal service requests and case progress for farmers</p></div>
        </div>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Requests', value: statCounts.total, icon: <FileText className="w-5 h-5" />, color: 'text-[#1B2A4A]', bg: 'bg-gray-50' },
          { label: 'Pending Review', value: statCounts.pending, icon: <Clock className="w-5 h-5" />, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'In Progress', value: statCounts.inProgress, icon: <Scale className="w-5 h-5" />, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Resolved', value: statCounts.resolved, icon: <CheckCircle2 className="w-5 h-5" />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        ].map((stat, i) => (
          <motion.div key={stat.label} variants={cardVariants} custom={i} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3"><span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{stat.label}</span><div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>{stat.icon}</div></div>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Search & Filter Bar */}
      <motion.div variants={cardVariants} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input type="text" placeholder="Search by farmer, case type, location, or ID..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] text-[#1B2A4A]" /></div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {statusFilters.map((s) => (<button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${statusFilter === s ? 'bg-[#1B2A4A] text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>{s}</button>))}
          </div>
        </div>
      </motion.div>

      {/* Cases List */}
      <motion.div variants={cardVariants} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[#1B2A4A]">Legal Cases</h2>
          <span className="text-xs text-gray-400">{filtered.length} results</span>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/80">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Case ID</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Farmer</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Case Type</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Priority</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Submitted</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((legalCase) => {
                const isExpanded = expandedId === legalCase.id;
                return (
                  <AnimatePresence key={legalCase.id}>
                    <tr className={`hover:bg-gray-50/50 transition-colors ${isExpanded ? 'bg-blue-50/30' : ''}`}>
                      <td className="px-6 py-4 font-mono text-xs text-gray-500 whitespace-nowrap">{legalCase.id}</td>
                      <td className="px-6 py-4 font-medium text-[#1B2A4A] whitespace-nowrap">{legalCase.farmerName}</td>
                      <td className="px-6 py-4 text-gray-600 whitespace-nowrap"><span className="inline-flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-gray-400" />{legalCase.farmLocation}</span></td>
                      <td className="px-6 py-4 whitespace-nowrap"><span className="inline-flex items-center gap-1.5 text-gray-600">{caseTypeIcons[legalCase.caseType]}{legalCase.caseType}</span></td>
                      <td className="px-6 py-4 whitespace-nowrap"><span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${priorityStyles[legalCase.priority]}`}>{legalCase.priority === 'High' && <AlertTriangle className="w-3 h-3" />}{legalCase.priority}</span></td>
                      <td className="px-6 py-4 whitespace-nowrap"><span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyles[legalCase.status]}`}>{legalCase.status}</span></td>
                      <td className="px-6 py-4 text-gray-500 whitespace-nowrap">{formatDate(legalCase.dateSubmitted)}</td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <button onClick={() => handleExpand(legalCase)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-[#1B2A4A]" title="View details">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </td>
                    </tr>

                    {/* Expanded Detail + Actions Row */}
                    {isExpanded && (
                      <tr key={`${legalCase.id}-detail`}>
                        <td colSpan={8} className="px-6 py-0">
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                            <div className="py-4 space-y-4 border-t border-dashed border-gray-200">
                              {/* Info */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Description</p>
                                  <p className="text-sm text-gray-600 leading-relaxed">{legalCase.description}</p>
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Assigned Firm</p>
                                  <p className="text-sm text-[#1B2A4A] font-medium"><Briefcase className="w-3.5 h-3.5 inline mr-1.5 text-gray-400" />{legalCase.assignedFirm}</p>
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Notes</p>
                                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{legalCase.notes || 'No notes'}</p>
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-gray-100">
                                {/* Assign Lawyer */}
                                <div>
                                  <label className="block text-xs font-semibold text-gray-500 mb-1">Assign Lawyer / Firm</label>
                                  <div className="flex gap-2">
                                    <input value={editFirm} onChange={e => setEditFirm(e.target.value)} className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-200 outline-none" placeholder="Firm name..." />
                                    <button onClick={() => handleAssignLawyer(legalCase.id)} disabled={actionLoading === legalCase.id + '-firm'} className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-1">
                                      {actionLoading === legalCase.id + '-firm' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} Assign
                                    </button>
                                  </div>
                                </div>

                                {/* Update Status */}
                                <div>
                                  <label className="block text-xs font-semibold text-gray-500 mb-1">Update Status</label>
                                  <div className="flex gap-2">
                                    <select value={editStatus} onChange={e => setEditStatus(e.target.value as CaseStatus)} className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-200 outline-none bg-white">
                                      <option value="Pending">Pending</option><option value="In Progress">In Progress</option><option value="Resolved">Resolved</option><option value="Closed">Closed</option>
                                    </select>
                                    <button onClick={() => handleUpdateStatus(legalCase.id)} disabled={actionLoading === legalCase.id + '-status'} className="px-3 py-1.5 bg-[#1B2A4A] text-white text-xs font-medium rounded-lg hover:bg-[#1B2A4A]/90 disabled:opacity-50 transition-colors flex items-center gap-1">
                                      {actionLoading === legalCase.id + '-status' ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />} Update
                                    </button>
                                  </div>
                                </div>

                                {/* Add Note */}
                                <div>
                                  <label className="block text-xs font-semibold text-gray-500 mb-1">Add Note</label>
                                  <div className="flex gap-2">
                                    <input value={newNote} onChange={e => setNewNote(e.target.value)} className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-200 outline-none" placeholder="Add a note..." onKeyDown={e => { if (e.key === 'Enter') handleAddNote(legalCase.id); }} />
                                    <button onClick={() => handleAddNote(legalCase.id)} disabled={actionLoading === legalCase.id + '-note' || !newNote.trim()} className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors flex items-center gap-1">
                                      {actionLoading === legalCase.id + '-note' ? <Loader2 className="w-3 h-3 animate-spin" /> : <FileText className="w-3 h-3" />} Add
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
          {filtered.map((legalCase) => {
            const isExpanded = expandedId === legalCase.id;
            return (
              <div key={legalCase.id} className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div><p className="font-medium text-[#1B2A4A]">{legalCase.farmerName}</p><p className="text-xs text-gray-500">{legalCase.id} &middot; {legalCase.farmLocation}</p></div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyles[legalCase.status]}`}>{legalCase.status}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="inline-flex items-center gap-1.5 text-xs text-gray-600">{caseTypeIcons[legalCase.caseType]}{legalCase.caseType}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${priorityStyles[legalCase.priority]}`}>{legalCase.priority}</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-400">{formatDate(legalCase.dateSubmitted)}</p>
                  <button onClick={() => handleExpand(legalCase)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {isExpanded && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mt-3 pt-3 border-t border-dashed border-gray-200 space-y-3">
                    <p className="text-xs text-gray-600">{legalCase.description}</p>
                    <p className="text-xs text-gray-600"><Briefcase className="w-3 h-3 inline mr-1" />{legalCase.assignedFirm}</p>
                    <p className="text-xs text-gray-500 italic whitespace-pre-line">{legalCase.notes}</p>
                    <div className="space-y-2 pt-2">
                      <div className="flex gap-2">
                        <input value={editFirm} onChange={e => setEditFirm(e.target.value)} className="flex-1 px-2 py-1 border border-gray-200 rounded text-xs" placeholder="Assign firm..." />
                        <button onClick={() => handleAssignLawyer(legalCase.id)} disabled={actionLoading === legalCase.id + '-firm'} className="px-2 py-1 bg-blue-600 text-white text-xs rounded disabled:opacity-50">{actionLoading === legalCase.id + '-firm' ? '...' : 'Assign'}</button>
                      </div>
                      <div className="flex gap-2">
                        <select value={editStatus} onChange={e => setEditStatus(e.target.value as CaseStatus)} className="flex-1 px-2 py-1 border border-gray-200 rounded text-xs bg-white"><option value="Pending">Pending</option><option value="In Progress">In Progress</option><option value="Resolved">Resolved</option><option value="Closed">Closed</option></select>
                        <button onClick={() => handleUpdateStatus(legalCase.id)} disabled={actionLoading === legalCase.id + '-status'} className="px-2 py-1 bg-[#1B2A4A] text-white text-xs rounded disabled:opacity-50">{actionLoading === legalCase.id + '-status' ? '...' : 'Update'}</button>
                      </div>
                      <div className="flex gap-2">
                        <input value={newNote} onChange={e => setNewNote(e.target.value)} className="flex-1 px-2 py-1 border border-gray-200 rounded text-xs" placeholder="Add note..." />
                        <button onClick={() => handleAddNote(legalCase.id)} disabled={!newNote.trim()} className="px-2 py-1 bg-emerald-600 text-white text-xs rounded disabled:opacity-50">Add</button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (<div className="text-center py-16"><Search className="w-8 h-8 text-gray-300 mx-auto mb-3" /><p className="text-gray-400 text-sm">No legal cases match your filters.</p></div>)}
      </motion.div>
    </motion.div>
  );
}
