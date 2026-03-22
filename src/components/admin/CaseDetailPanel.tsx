'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, User, MapPin, Phone, Mail, Calendar, FileText, Shield,
  CheckCircle2, XCircle, Clock, ThumbsUp, ThumbsDown, Loader2,
  MessageSquare, Users, DollarSign, AlertTriangle, ChevronRight,
  Send, History,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

/* ------------------------------------------------------------------ */
/* Types                                                                */
/* ------------------------------------------------------------------ */

export interface CaseRecord {
  id: string;
  type: 'loan' | 'kyc' | 'application' | 'insurance';
  status: string;
  memberName: string;
  memberEmail?: string;
  amount?: number;
  purpose?: string;
  country?: string;
  createdAt: string;
  /** Raw data for display */
  raw?: Record<string, unknown>;
}

interface CaseDetailPanelProps {
  record: CaseRecord | null;
  onClose: () => void;
  onApprove?: (id: string, notes: string) => Promise<void>;
  onReject?: (id: string, notes: string) => Promise<void>;
}

interface AuditEntry {
  id: string;
  action: string;
  details: Record<string, unknown> | null;
  created_at: string;
  user_id: string;
}

interface Reference {
  id: string;
  reference_name: string;
  relationship: string;
  phone_number: string;
  location: string | null;
  years_known: number | null;
  verification_status: string;
}

/* ------------------------------------------------------------------ */
/* Status helpers                                                       */
/* ------------------------------------------------------------------ */

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700', icon: Clock },
  submitted: { label: 'Submitted', color: 'bg-blue-100 text-blue-700', icon: Send },
  under_review: { label: 'Under Review', color: 'bg-purple-100 text-purple-700', icon: FileText },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700', icon: XCircle },
  disbursed: { label: 'Disbursed', color: 'bg-navy/10 text-navy', icon: DollarSign },
  verified: { label: 'Verified', color: 'bg-green-100 text-green-700', icon: Shield },
  repaying: { label: 'Repaying', color: 'bg-teal-100 text-teal-700', icon: DollarSign },
  completed: { label: 'Completed', color: 'bg-gray-100 text-gray-600', icon: CheckCircle2 },
};

function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || { label: status, color: 'bg-gray-100 text-gray-600', icon: Clock };
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Component                                                            */
/* ------------------------------------------------------------------ */

export default function CaseDetailPanel({ record, onClose, onApprove, onReject }: CaseDetailPanelProps) {
  const [tab, setTab] = useState<'details' | 'references' | 'history' | 'notes'>('details');
  const [notes, setNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [references, setReferences] = useState<Reference[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(false);
  const [loadingRefs, setLoadingRefs] = useState(false);

  // Fetch audit log for this entity
  const fetchAuditLog = useCallback(async () => {
    if (!record) return;
    setLoadingAudit(true);
    const supabase = createClient();
    const { data } = await supabase
      .from('audit_log')
      .select('*')
      .eq('entity_id', record.id)
      .order('created_at', { ascending: false })
      .limit(20);
    if (data) setAuditLog(data as AuditEntry[]);
    setLoadingAudit(false);
  }, [record]);

  // Fetch character references if available
  const fetchReferences = useCallback(async () => {
    if (!record?.raw?.member_id && !record?.raw?.profile_id && !record?.raw?.farmer_id) return;
    setLoadingRefs(true);
    const supabase = createClient();
    const farmerId = String(record.raw?.farmer_id || record.raw?.profile_id || record.raw?.member_id);
    const { data } = await supabase
      .from('farmer_references')
      .select('*')
      .eq('farmer_id', farmerId)
      .order('is_primary', { ascending: false });
    if (data) setReferences(data as Reference[]);
    setLoadingRefs(false);
  }, [record]);

  useEffect(() => {
    if (record) {
      fetchAuditLog();
      fetchReferences();
      setTab('details');
      setNotes('');
    }
  }, [record, fetchAuditLog, fetchReferences]);

  const handleApprove = async () => {
    if (!record || !onApprove) return;
    setActionLoading(true);
    await onApprove(record.id, notes);
    setActionLoading(false);
  };

  const handleReject = async () => {
    if (!record || !onReject) return;
    setActionLoading(true);
    await onReject(record.id, notes);
    setActionLoading(false);
  };

  const canAct = record?.status === 'pending' || record?.status === 'submitted' || record?.status === 'under_review';

  return (
    <AnimatePresence>
      {record && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 z-40"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-start justify-between p-5 border-b border-gray-100">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono text-gray-400 bg-gray-50 px-2 py-0.5 rounded">
                    {record.id.slice(0, 12)}
                  </span>
                  <StatusBadge status={record.status} />
                </div>
                <h2 className="text-lg font-bold text-navy">{record.memberName}</h2>
                {record.memberEmail && (
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                    <Mail className="w-3 h-3" />
                    {record.memberEmail}
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Quick info bar */}
            <div className="flex items-center gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs text-gray-600">
              {record.type && (
                <span className="flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  {record.type.charAt(0).toUpperCase() + record.type.slice(1)}
                </span>
              )}
              {record.amount && (
                <span className="flex items-center gap-1 font-semibold text-navy">
                  <DollarSign className="w-3 h-3" />
                  ${record.amount.toLocaleString()}
                </span>
              )}
              {record.country && record.country !== '-' && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {record.country}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(record.createdAt).toLocaleDateString()}
              </span>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 px-5 pt-3 border-b border-gray-100">
              {[
                { key: 'details' as const, label: 'Details', icon: User },
                { key: 'references' as const, label: 'References', icon: Users, count: references.length },
                { key: 'history' as const, label: 'History', icon: History, count: auditLog.length },
                { key: 'notes' as const, label: 'Notes', icon: MessageSquare },
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
                    tab === t.key
                      ? 'border-[#5DB347] text-[#5DB347]'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <t.icon className="w-3.5 h-3.5" />
                  {t.label}
                  {t.count !== undefined && t.count > 0 && (
                    <span className="w-4 h-4 rounded-full bg-gray-200 text-gray-600 text-[10px] flex items-center justify-center">
                      {t.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto p-5">
              {tab === 'details' && (
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Record Details</h3>
                  {record.purpose && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs font-medium text-gray-500 mb-1">Purpose / Notes</p>
                      <p className="text-sm text-navy">{record.purpose}</p>
                    </div>
                  )}
                  {/* Display raw fields */}
                  {record.raw && (
                    <div className="space-y-2">
                      {Object.entries(record.raw)
                        .filter(([k]) => !['id', 'created_at', 'updated_at', 'member_id', 'profile_id', 'profiles', 'members'].includes(k))
                        .map(([key, value]) => (
                          <div key={key} className="flex justify-between py-1.5 border-b border-gray-50">
                            <span className="text-xs text-gray-500 capitalize">{key.replace(/_/g, ' ')}</span>
                            <span className="text-xs font-medium text-navy text-right max-w-[200px] truncate">
                              {value === null ? '-' : typeof value === 'object' ? JSON.stringify(value) : String(value)}
                            </span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}

              {tab === 'references' && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Character References</h3>
                  {loadingRefs ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                    </div>
                  ) : references.length > 0 ? (
                    references.map((ref) => {
                      const vColor = ref.verification_status === 'verified' ? 'text-green-600 bg-green-50'
                        : ref.verification_status === 'failed' ? 'text-red-500 bg-red-50'
                        : 'text-amber-500 bg-amber-50';
                      return (
                        <div key={ref.id} className="bg-gray-50 rounded-lg p-3 space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-navy">{ref.reference_name}</p>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${vColor}`}>
                              {ref.verification_status}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">{ref.relationship.replace(/_/g, ' ')}</p>
                          <div className="flex items-center gap-3 text-xs text-gray-400">
                            <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{ref.phone_number}</span>
                            {ref.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{ref.location}</span>}
                            {ref.years_known && <span>Known {ref.years_known} yrs</span>}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8">
                      <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-xs text-gray-400">No references submitted</p>
                    </div>
                  )}
                </div>
              )}

              {tab === 'history' && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Audit Trail</h3>
                  {loadingAudit ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                    </div>
                  ) : auditLog.length > 0 ? (
                    <div className="relative">
                      <div className="absolute left-3 top-0 bottom-0 w-px bg-gray-200" />
                      {auditLog.map((entry) => (
                        <div key={entry.id} className="relative flex gap-3 pb-4">
                          <div className="w-6 h-6 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center z-10 flex-shrink-0">
                            <History className="w-3 h-3 text-gray-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-navy">{entry.action.replace(/_/g, ' ')}</p>
                            {entry.details && (
                              <p className="text-[11px] text-gray-500 mt-0.5">
                                {typeof entry.details === 'object'
                                  ? Object.entries(entry.details).map(([k, v]) => `${k}: ${v}`).join(' | ')
                                  : String(entry.details)}
                              </p>
                            )}
                            <p className="text-[10px] text-gray-400 mt-0.5">
                              {new Date(entry.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <History className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-xs text-gray-400">No history yet</p>
                    </div>
                  )}
                </div>
              )}

              {tab === 'notes' && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Admin Notes</h3>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add internal notes about this case... (visible only to admins)"
                    rows={4}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none resize-none"
                  />
                  <p className="text-[10px] text-gray-400">Notes are attached to the approve/reject action and saved in the audit trail.</p>
                </div>
              )}
            </div>

            {/* Action footer */}
            {canAct && (onApprove || onReject) && (
              <div className="border-t border-gray-100 p-4 bg-gray-50">
                <div className="flex items-center gap-2">
                  {onApprove && (
                    <button
                      onClick={handleApprove}
                      disabled={actionLoading}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#5DB347] hover:bg-[#449933] disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-colors"
                    >
                      {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ThumbsUp className="w-4 h-4" />}
                      Approve
                    </button>
                  )}
                  {onReject && (
                    <button
                      onClick={handleReject}
                      disabled={actionLoading}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-colors"
                    >
                      {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ThumbsDown className="w-4 h-4" />}
                      Reject
                    </button>
                  )}
                </div>
                {notes && (
                  <p className="text-[10px] text-gray-400 mt-2 text-center">
                    Notes will be attached to this action
                  </p>
                )}
              </div>
            )}

            {/* Already actioned */}
            {!canAct && (
              <div className="border-t border-gray-100 p-4 bg-gray-50 text-center">
                <p className="text-xs text-gray-500">
                  This case has been <strong>{record.status}</strong> and cannot be modified.
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
