'use client';

import { useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Shield,
  Search,
  Filter,
  Download,
  Users,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Clock,
  Calendar,
  FileCheck,
  ClipboardList,
  XCircle,
  Eye,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  RefreshCw,
  MapPin,
  User,
  FileText,
  Activity,
  Layers,
  ToggleLeft,
  ToggleRight,
  Bell,
} from 'lucide-react';

// ── Animation variants ──────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 260, damping: 24 } },
};

// ── Types ────────────────────────────────────────────────────────────────────

type KycSubmissionStatus = 'pending' | 'verified' | 'requires_action' | 'expired';
type MemberType = 'farmer' | 'supplier' | 'investor';
type RiskLevel = 'low' | 'medium' | 'high';

interface KycSubmission {
  id: string;
  name: string;
  type: MemberType;
  status: KycSubmissionStatus;
  submittedDate: string;
  documents: string[];
  country: string;
}

interface ComplianceItem {
  id: string;
  label: string;
  description: string;
  category: string;
  completed: boolean;
  lastReviewed: string;
}

interface RiskArea {
  area: string;
  level: RiskLevel;
  score: number;
  description: string;
}

interface PendingDocument {
  id: string;
  memberName: string;
  docType: string;
  uploadedDate: string;
  status: 'awaiting_review' | 'in_review';
}

interface ExpiryAlert {
  id: string;
  memberName: string;
  docType: string;
  expiryDate: string;
  daysRemaining: number;
}

// ── Fallback data ────────────────────────────────────────────────────────────

const KYC_SUMMARY = {
  verified: 187,
  pending: 34,
  requires_action: 12,
  expired: 8,
};

const COMPLIANCE_CHECKLIST: ComplianceItem[] = [
  { id: 'c1', label: 'Anti-Money Laundering (AML) Policy', description: 'AML procedures documented and enforced across all transactions', category: 'Financial', completed: true, lastReviewed: '2026-03-15' },
  { id: 'c2', label: 'Data Protection & GDPR Compliance', description: 'Personal data handling meets GDPR and POPIA requirements', category: 'Data', completed: true, lastReviewed: '2026-03-20' },
  { id: 'c3', label: 'Tax Compliance Reporting', description: 'Quarterly tax reports filed for all operating jurisdictions', category: 'Financial', completed: true, lastReviewed: '2026-03-31' },
  { id: 'c4', label: 'Know Your Customer (KYC) Verification', description: 'All active members have valid KYC documentation on file', category: 'Identity', completed: false, lastReviewed: '2026-04-01' },
  { id: 'c5', label: 'Sanctions Screening', description: 'All members screened against OFAC, EU, and UN sanctions lists', category: 'Financial', completed: true, lastReviewed: '2026-04-05' },
  { id: 'c6', label: 'Transaction Monitoring', description: 'Automated monitoring for suspicious transactions over $5,000', category: 'Financial', completed: true, lastReviewed: '2026-04-08' },
  { id: 'c7', label: 'Board Compliance Training', description: 'Annual compliance training completed by all board members', category: 'Governance', completed: false, lastReviewed: '2026-01-15' },
  { id: 'c8', label: 'Risk Assessment Review', description: 'Quarterly risk assessment covering all operational areas', category: 'Governance', completed: true, lastReviewed: '2026-03-28' },
  { id: 'c9', label: 'Cybersecurity Audit', description: 'Annual penetration testing and vulnerability assessment', category: 'Data', completed: false, lastReviewed: '2025-11-20' },
  { id: 'c10', label: 'Insurance Coverage Review', description: 'Adequate insurance coverage for all crop and trade products', category: 'Insurance', completed: true, lastReviewed: '2026-04-02' },
];

const RISK_AREAS: RiskArea[] = [
  { area: 'Trading Operations', level: 'low', score: 22, description: 'All export documentation verified, phytosanitary compliance up to date' },
  { area: 'Lending & Credit', level: 'medium', score: 55, description: '3 overdue loans flagged, credit scoring model being updated' },
  { area: 'Data & Privacy', level: 'low', score: 18, description: 'POPIA compliant, data encryption active, regular audits passed' },
  { area: 'Payment Processing', level: 'low', score: 25, description: 'PCI-DSS compliant, mobile money integrations verified' },
  { area: 'Cross-Border Transactions', level: 'high', score: 78, description: 'New Mozambique corridor requires additional regulatory approval' },
  { area: 'Member Onboarding', level: 'medium', score: 45, description: '12 pending KYC verifications exceeding 7-day SLA' },
];

const RECENT_KYC: KycSubmission[] = [
  { id: 'KS-001', name: 'Amara Diallo', type: 'farmer', status: 'pending', submittedDate: '2026-04-09', documents: ['National ID', 'Proof of Address', 'Farm Registration'], country: 'Sierra Leone' },
  { id: 'KS-002', name: 'Watson Vine Holdings', type: 'supplier', status: 'verified', submittedDate: '2026-04-08', documents: ['Business Registration', 'Tax Certificate', 'Director IDs'], country: 'South Africa' },
  { id: 'KS-003', name: 'Chidi Okonkwo', type: 'investor', status: 'requires_action', submittedDate: '2026-04-07', documents: ['Passport', 'Source of Funds'], country: 'Nigeria' },
  { id: 'KS-004', name: 'Fatima Nkosi', type: 'farmer', status: 'verified', submittedDate: '2026-04-06', documents: ['National ID', 'Proof of Address'], country: 'South Africa' },
  { id: 'KS-005', name: 'Zanele Dube', type: 'farmer', status: 'expired', submittedDate: '2025-10-15', documents: ['National ID', 'Farm Registration'], country: 'Zimbabwe' },
  { id: 'KS-006', name: 'Mwangi Kamau', type: 'supplier', status: 'pending', submittedDate: '2026-04-09', documents: ['Business Registration', 'Tax Certificate'], country: 'Kenya' },
  { id: 'KS-007', name: 'Lebo Sithole', type: 'investor', status: 'requires_action', submittedDate: '2026-04-05', documents: ['Passport', 'Bank Statement'], country: 'Botswana' },
  { id: 'KS-008', name: 'Grace Phiri', type: 'farmer', status: 'pending', submittedDate: '2026-04-10', documents: ['National ID', 'Proof of Address', 'Selfie'], country: 'Zambia' },
];

const PENDING_DOCS: PendingDocument[] = [
  { id: 'PD-001', memberName: 'Amara Diallo', docType: 'Farm Registration', uploadedDate: '2026-04-09', status: 'awaiting_review' },
  { id: 'PD-002', memberName: 'Grace Phiri', docType: 'National ID', uploadedDate: '2026-04-10', status: 'awaiting_review' },
  { id: 'PD-003', memberName: 'Chidi Okonkwo', docType: 'Source of Funds', uploadedDate: '2026-04-07', status: 'in_review' },
  { id: 'PD-004', memberName: 'Mwangi Kamau', docType: 'Tax Certificate', uploadedDate: '2026-04-09', status: 'awaiting_review' },
  { id: 'PD-005', memberName: 'Lebo Sithole', docType: 'Bank Statement', uploadedDate: '2026-04-05', status: 'in_review' },
];

const EXPIRY_ALERTS: ExpiryAlert[] = [
  { id: 'EA-001', memberName: 'Zanele Dube', docType: 'National ID', expiryDate: '2026-04-15', daysRemaining: 5 },
  { id: 'EA-002', memberName: 'Thabo Ramaano', docType: 'Passport', expiryDate: '2026-04-20', daysRemaining: 10 },
  { id: 'EA-003', memberName: 'Baraka Mwenda', docType: 'Business Registration', expiryDate: '2026-04-25', daysRemaining: 15 },
  { id: 'EA-004', memberName: 'Mpho Ramotswe', docType: 'Proof of Address', expiryDate: '2026-05-01', daysRemaining: 21 },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<KycSubmissionStatus, { bg: string; text: string; label: string; icon: React.ReactNode }> = {
  verified: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Verified', icon: <CheckCircle2 className="w-3 h-3" /> },
  pending: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Pending Review', icon: <Clock className="w-3 h-3" /> },
  requires_action: { bg: 'bg-red-100', text: 'text-red-700', label: 'Requires Action', icon: <AlertCircle className="w-3 h-3" /> },
  expired: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Expired', icon: <XCircle className="w-3 h-3" /> },
};

const TYPE_CONFIG: Record<MemberType, { bg: string; text: string; label: string }> = {
  farmer: { bg: 'bg-green-100', text: 'text-green-700', label: 'Farmer' },
  supplier: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Supplier' },
  investor: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Investor' },
};

const RISK_CONFIG: Record<RiskLevel, { bg: string; text: string; barColor: string }> = {
  low: { bg: 'bg-emerald-100', text: 'text-emerald-700', barColor: 'bg-emerald-500' },
  medium: { bg: 'bg-amber-100', text: 'text-amber-700', barColor: 'bg-amber-500' },
  high: { bg: 'bg-red-100', text: 'text-red-700', barColor: 'bg-red-500' },
};

function exportComplianceReport() {
  const lines = [
    'AFU Platform - Compliance Report',
    `Generated: ${new Date().toISOString()}`,
    '',
    '== KYC Summary ==',
    `Verified: ${KYC_SUMMARY.verified}`,
    `Pending: ${KYC_SUMMARY.pending}`,
    `Requires Action: ${KYC_SUMMARY.requires_action}`,
    `Expired: ${KYC_SUMMARY.expired}`,
    '',
    '== Compliance Checklist ==',
    ...COMPLIANCE_CHECKLIST.map(c => `[${c.completed ? 'X' : ' '}] ${c.label} (Last reviewed: ${c.lastReviewed})`),
    '',
    '== Risk Assessment ==',
    ...RISK_AREAS.map(r => `${r.area}: ${r.level.toUpperCase()} (Score: ${r.score}/100) - ${r.description}`),
  ];
  const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `compliance-report-${new Date().toISOString().split('T')[0]}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Component ────────────────────────────────────────────────────────────────

export default function ComplianceDashboardPage() {
  const [checklist, setChecklist] = useState(COMPLIANCE_CHECKLIST);
  const [kycFilter, setKycFilter] = useState<KycSubmissionStatus | ''>('');

  const toggleItem = (id: string) => {
    setChecklist(prev => prev.map(c => c.id === id ? { ...c, completed: !c.completed } : c));
  };

  const completedCount = checklist.filter(c => c.completed).length;
  const completionPct = Math.round((completedCount / checklist.length) * 100);

  const filteredKyc = useMemo(() => {
    if (!kycFilter) return RECENT_KYC;
    return RECENT_KYC.filter(s => s.status === kycFilter);
  }, [kycFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">Compliance Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Platform compliance status, KYC oversight, and regulatory monitoring</p>
        </div>
        <button
          onClick={exportComplianceReport}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1B2A4A] text-white rounded-xl text-sm font-medium hover:bg-[#1B2A4A]/90 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export Compliance Report
        </button>
      </div>

      {/* KYC Status Summary Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {[
          { label: 'Verified', value: KYC_SUMMARY.verified, icon: <ShieldCheck className="w-5 h-5" />, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
          { label: 'Pending Review', value: KYC_SUMMARY.pending, icon: <Clock className="w-5 h-5" />, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
          { label: 'Requires Action', value: KYC_SUMMARY.requires_action, icon: <AlertCircle className="w-5 h-5" />, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
          { label: 'Expired', value: KYC_SUMMARY.expired, icon: <XCircle className="w-5 h-5" />, color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' },
        ].map((card) => (
          <motion.div
            key={card.label}
            variants={cardVariants}
            className={`bg-white rounded-2xl border ${card.border} p-5 shadow-sm`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{card.label}</p>
                <p className={`text-3xl font-bold mt-1 ${card.color}`}>{card.value}</p>
              </div>
              <div className={`w-11 h-11 rounded-xl ${card.bg} flex items-center justify-center ${card.color}`}>
                {card.icon}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Compliance Checklist */}
        <motion.div variants={cardVariants} initial="hidden" animate="visible" className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-[#1B2A4A] flex items-center gap-2">
                <ClipboardList className="w-4.5 h-4.5 text-[#5DB347]" />
                Compliance Checklist
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">{completedCount}/{checklist.length} items completed ({completionPct}%)</p>
            </div>
            <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-[#5DB347] rounded-full transition-all" style={{ width: `${completionPct}%` }} />
            </div>
          </div>
          <div className="divide-y divide-gray-50 max-h-[480px] overflow-y-auto">
            {checklist.map((item) => (
              <button
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className="w-full flex items-start gap-3 p-4 text-left hover:bg-gray-50/50 transition-colors"
              >
                <div className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-colors ${item.completed ? 'bg-[#5DB347] text-white' : 'border-2 border-gray-300'}`}>
                  {item.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${item.completed ? 'text-gray-500 line-through' : 'text-gray-800'}`}>{item.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.description}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 font-medium">{item.category}</span>
                    <span className="text-[10px] text-gray-400">Reviewed: {item.lastReviewed}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Risk Assessment */}
        <motion.div variants={cardVariants} initial="hidden" animate="visible" className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="p-5 border-b border-gray-100">
            <h2 className="text-base font-semibold text-[#1B2A4A] flex items-center gap-2">
              <AlertTriangle className="w-4.5 h-4.5 text-amber-500" />
              Risk Assessment
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Color-coded risk levels across operational areas</p>
          </div>
          <div className="p-4 space-y-4">
            {RISK_AREAS.map((risk) => {
              const cfg = RISK_CONFIG[risk.level];
              return (
                <div key={risk.area} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-800">{risk.area}</p>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${cfg.bg} ${cfg.text}`}>
                        {risk.level.toUpperCase()}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400 font-medium">{risk.score}/100</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${cfg.barColor} transition-all`} style={{ width: `${risk.score}%` }} />
                  </div>
                  <p className="text-xs text-gray-500">{risk.description}</p>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Recent KYC Submissions */}
      <motion.div variants={cardVariants} initial="hidden" animate="visible" className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-[#1B2A4A] flex items-center gap-2">
              <Users className="w-4.5 h-4.5 text-[#5DB347]" />
              Recent KYC Submissions
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Latest member verification submissions</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {(['', 'pending', 'verified', 'requires_action', 'expired'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setKycFilter(status)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${kycFilter === status ? 'bg-[#5DB347] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {status === '' ? 'All' : STATUS_CONFIG[status].label}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Country</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Submitted</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Documents</th>
              </tr>
            </thead>
            <tbody>
              {filteredKyc.map((sub) => {
                const sc = STATUS_CONFIG[sub.status];
                const tc = TYPE_CONFIG[sub.type];
                return (
                  <tr key={sub.id} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-800">{sub.name}</p>
                      <p className="text-[10px] text-gray-400 font-mono">{sub.id}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${tc.bg} ${tc.text}`}>{tc.label}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-600 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        {sub.country}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${sc.bg} ${sc.text}`}>
                        {sc.icon} {sc.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">{sub.submittedDate}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {sub.documents.map((doc) => (
                          <span key={doc} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-gray-100 text-[10px] text-gray-600">
                            <FileText className="w-2.5 h-2.5" />
                            {doc}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Document Verification Queue */}
        <motion.div variants={cardVariants} initial="hidden" animate="visible" className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="p-5 border-b border-gray-100">
            <h2 className="text-base font-semibold text-[#1B2A4A] flex items-center gap-2">
              <FileCheck className="w-4.5 h-4.5 text-blue-500" />
              Document Verification Queue
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">{PENDING_DOCS.length} documents pending review</p>
          </div>
          <div className="divide-y divide-gray-50">
            {PENDING_DOCS.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-4 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${doc.status === 'in_review' ? 'bg-blue-100' : 'bg-amber-100'}`}>
                    {doc.status === 'in_review' ? <Eye className="w-4 h-4 text-blue-600" /> : <Clock className="w-4 h-4 text-amber-600" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{doc.memberName}</p>
                    <p className="text-xs text-gray-500">{doc.docType}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${doc.status === 'in_review' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                    {doc.status === 'in_review' ? 'In Review' : 'Awaiting Review'}
                  </span>
                  <p className="text-[10px] text-gray-400 mt-1">Uploaded {doc.uploadedDate}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Expiry Alerts */}
        <motion.div variants={cardVariants} initial="hidden" animate="visible" className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="p-5 border-b border-gray-100">
            <h2 className="text-base font-semibold text-[#1B2A4A] flex items-center gap-2">
              <Bell className="w-4.5 h-4.5 text-red-500" />
              Expiry Alerts
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Documents nearing expiry that require renewal</p>
          </div>
          <div className="divide-y divide-gray-50">
            {EXPIRY_ALERTS.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between p-4 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${alert.daysRemaining <= 7 ? 'bg-red-100' : alert.daysRemaining <= 14 ? 'bg-amber-100' : 'bg-yellow-100'}`}>
                    <AlertTriangle className={`w-4 h-4 ${alert.daysRemaining <= 7 ? 'text-red-600' : alert.daysRemaining <= 14 ? 'text-amber-600' : 'text-yellow-600'}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{alert.memberName}</p>
                    <p className="text-xs text-gray-500">{alert.docType}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${alert.daysRemaining <= 7 ? 'bg-red-100 text-red-700' : alert.daysRemaining <= 14 ? 'bg-amber-100 text-amber-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {alert.daysRemaining} days remaining
                  </span>
                  <p className="text-[10px] text-gray-400 mt-1">Expires {alert.expiryDate}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
