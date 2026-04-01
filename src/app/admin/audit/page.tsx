'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  AlertTriangle,
  Info,
  AlertCircle,
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  Clock,
  Users,
  Activity,
  CalendarDays,
} from 'lucide-react';
// ── Inline types & fallback data (formerly from @/lib/data/audit) ───────────

type AuditSeverity = 'info' | 'warning' | 'critical';
type AuditAction =
  | 'login'
  | 'logout'
  | 'member_created'
  | 'member_updated'
  | 'member_suspended'
  | 'member_activated'
  | 'loan_approved'
  | 'loan_rejected'
  | 'loan_disbursed'
  | 'payment_received'
  | 'payment_failed'
  | 'document_uploaded'
  | 'document_verified'
  | 'document_rejected'
  | 'application_submitted'
  | 'application_reviewed'
  | 'training_completed'
  | 'supplier_approved'
  | 'supplier_suspended'
  | 'product_approved'
  | 'product_rejected'
  | 'claim_submitted'
  | 'claim_approved'
  | 'claim_rejected'
  | 'settings_changed'
  | 'role_assigned'
  | 'export_generated'
  | 'bulk_action';

interface AuditEntry {
  id: string;
  timestamp: string;
  action: AuditAction;
  severity: AuditSeverity;
  userId: string;
  userName: string;
  userRole: 'admin' | 'officer' | 'member' | 'supplier' | 'system';
  entityType: 'member' | 'loan' | 'payment' | 'document' | 'supplier' | 'product' | 'claim' | 'training' | 'system';
  entityId: string;
  entityName: string;
  description: string;
  ipAddress: string;
  metadata: Record<string, string>;
}

const mockAuditEntries: AuditEntry[] = [
  { id: 'AUD-001', timestamp: '2026-03-16T09:15:00Z', action: 'loan_approved', severity: 'info', userId: 'ADM-001', userName: 'Tendai Chikwava', userRole: 'officer', entityType: 'loan', entityId: 'LN-2026-0042', entityName: 'Working Capital - Farai Moyo', description: 'Approved working capital loan of $8,500 for Farai Moyo (AFU-2024-012)', ipAddress: '197.221.44.102', metadata: { amount: '$8,500', loanType: 'Working Capital', riskGrade: 'B+' } },
  { id: 'AUD-002', timestamp: '2026-03-16T08:45:00Z', action: 'member_suspended', severity: 'warning', userId: 'ADM-002', userName: 'Sarah Moatlhodi', userRole: 'admin', entityType: 'member', entityId: 'AFU-2024-034', entityName: 'Peter Kgabo', description: 'Suspended member due to document verification failure after 3 attempts', ipAddress: '196.216.170.55', metadata: { reason: 'Document Verification Failure', attempts: '3' } },
  { id: 'AUD-003', timestamp: '2026-03-16T08:30:00Z', action: 'payment_received', severity: 'info', userId: 'SYS-001', userName: 'System', userRole: 'system', entityType: 'payment', entityId: 'PAY-2026-0188', entityName: 'Mobile Money Payment - Naledi Sekgoma', description: 'Mobile money payment of $125.00 received via Mobile Money for loan LN-2026-0015', ipAddress: '0.0.0.0', metadata: { method: 'Mobile Money', amount: '$125.00', loanId: 'LN-2026-0015' } },
  { id: 'AUD-004', timestamp: '2026-03-16T08:12:00Z', action: 'supplier_approved', severity: 'info', userId: 'ADM-001', userName: 'Tendai Chikwava', userRole: 'admin', entityType: 'supplier', entityId: 'SUP-024', entityName: 'Kalahari Seeds & Feeds', description: 'Approved new supplier application for Kalahari Seeds & Feeds (Bronze tier)', ipAddress: '197.221.44.102', metadata: { tier: 'Bronze', category: 'input-supplier', country: 'Botswana' } },
  { id: 'AUD-005', timestamp: '2026-03-16T07:55:00Z', action: 'loan_disbursed', severity: 'info', userId: 'ADM-003', userName: 'Grace Nkomo', userRole: 'officer', entityType: 'loan', entityId: 'LN-2026-0038', entityName: 'Equipment Finance - Chipo Banda', description: 'Disbursed $12,000 equipment loan to Chipo Banda via bank transfer', ipAddress: '196.1.2.88', metadata: { amount: '$12,000', method: 'Bank Transfer', bank: 'FNB Botswana' } },
  { id: 'AUD-006', timestamp: '2026-03-16T07:30:00Z', action: 'document_rejected', severity: 'warning', userId: 'ADM-002', userName: 'Sarah Moatlhodi', userRole: 'officer', entityType: 'document', entityId: 'DOC-2026-0245', entityName: 'Farm Title Deed - James Mwanga', description: 'Rejected farm title deed upload - image quality too low, requested re-upload', ipAddress: '196.216.170.55', metadata: { docType: 'Farm Title Deed', reason: 'Low Image Quality' } },
  { id: 'AUD-007', timestamp: '2026-03-16T07:15:00Z', action: 'login', severity: 'info', userId: 'ADM-001', userName: 'Tendai Chikwava', userRole: 'admin', entityType: 'system', entityId: 'SESSION-88291', entityName: 'Admin Login', description: 'Admin login from Harare, Zimbabwe (verified 2FA)', ipAddress: '197.221.44.102', metadata: { location: 'Harare, ZW', twoFactor: 'verified' } },
  { id: 'AUD-008', timestamp: '2026-03-15T18:45:00Z', action: 'bulk_action', severity: 'warning', userId: 'ADM-003', userName: 'Grace Nkomo', userRole: 'admin', entityType: 'payment', entityId: 'BATCH-0056', entityName: 'Bulk Disbursement Batch #56', description: 'Initiated bulk disbursement of 12 loans totaling $67,500', ipAddress: '196.1.2.88', metadata: { loanCount: '12', totalAmount: '$67,500', batchId: 'BATCH-0056' } },
  { id: 'AUD-009', timestamp: '2026-03-15T17:20:00Z', action: 'claim_submitted', severity: 'info', userId: 'MEM-015', userName: 'Tatenda Mutasa', userRole: 'member', entityType: 'claim', entityId: 'CLM-2026-0012', entityName: 'Crop Loss - Drought', description: 'Insurance claim submitted for drought-related crop loss on 2.5ha maize field', ipAddress: '197.231.12.44', metadata: { claimType: 'Crop Loss', cause: 'Drought', hectares: '2.5', crop: 'Maize' } },
  { id: 'AUD-010', timestamp: '2026-03-15T16:55:00Z', action: 'settings_changed', severity: 'critical', userId: 'ADM-001', userName: 'Tendai Chikwava', userRole: 'admin', entityType: 'system', entityId: 'CFG-INTEREST', entityName: 'Interest Rate Configuration', description: 'Updated base interest rate from 12.5% to 11.8% for working capital loans', ipAddress: '197.221.44.102', metadata: { setting: 'Base Interest Rate', oldValue: '12.5%', newValue: '11.8%' } },
  { id: 'AUD-011', timestamp: '2026-03-15T16:30:00Z', action: 'product_approved', severity: 'info', userId: 'ADM-002', userName: 'Sarah Moatlhodi', userRole: 'admin', entityType: 'product', entityId: 'PROD-039', entityName: 'Premium Hybrid Maize Seed (50kg)', description: 'Approved new product listing from Zambezi Agri-Supplies', ipAddress: '196.216.170.55', metadata: { supplier: 'Zambezi Agri-Supplies', price: '$85.00', category: 'Seeds' } },
  { id: 'AUD-012', timestamp: '2026-03-15T15:45:00Z', action: 'payment_failed', severity: 'critical', userId: 'SYS-001', userName: 'System', userRole: 'system', entityType: 'payment', entityId: 'PAY-2026-0185', entityName: 'M-Pesa Payment - Baraka Mwenda', description: 'Mobile money payment of $200.00 failed - insufficient balance in member wallet', ipAddress: '0.0.0.0', metadata: { method: 'M-Pesa', amount: '$200.00', error: 'Insufficient Balance' } },
  { id: 'AUD-013', timestamp: '2026-03-15T15:15:00Z', action: 'member_created', severity: 'info', userId: 'ADM-002', userName: 'Sarah Moatlhodi', userRole: 'officer', entityType: 'member', entityId: 'AFU-2026-058', entityName: 'Blessing Ncube', description: 'New smallholder member registered from Matabeleland South, Zimbabwe', ipAddress: '196.216.170.55', metadata: { tier: 'Smallholder', country: 'Zimbabwe', region: 'Matabeleland South' } },
  { id: 'AUD-014', timestamp: '2026-03-15T14:30:00Z', action: 'application_reviewed', severity: 'info', userId: 'ADM-003', userName: 'Grace Nkomo', userRole: 'officer', entityType: 'loan', entityId: 'APP-2026-0089', entityName: 'Invoice Finance - Thabo Ramaano', description: 'Completed credit assessment for invoice finance application ($15,000)', ipAddress: '196.1.2.88', metadata: { creditScore: '78', riskGrade: 'A-', recommendedAmount: '$15,000' } },
  { id: 'AUD-015', timestamp: '2026-03-15T14:00:00Z', action: 'training_completed', severity: 'info', userId: 'MEM-023', userName: 'Amara Juma', userRole: 'member', entityType: 'training', entityId: 'CRS-005', entityName: 'Financial Literacy for Farmers', description: 'Completed Financial Literacy for Farmers course with score 88%', ipAddress: '196.192.44.67', metadata: { score: '88%', duration: '4h 30m', certificate: 'Issued' } },
  { id: 'AUD-016', timestamp: '2026-03-15T12:20:00Z', action: 'loan_rejected', severity: 'warning', userId: 'ADM-001', userName: 'Tendai Chikwava', userRole: 'officer', entityType: 'loan', entityId: 'APP-2026-0085', entityName: 'Working Capital - Mpho Ramotswe', description: 'Rejected loan application due to insufficient credit history and missing collateral docs', ipAddress: '197.221.44.102', metadata: { amount: '$6,000', reason: 'Insufficient Credit History', creditScore: '42' } },
  { id: 'AUD-017', timestamp: '2026-03-15T11:45:00Z', action: 'document_verified', severity: 'info', userId: 'ADM-002', userName: 'Sarah Moatlhodi', userRole: 'officer', entityType: 'document', entityId: 'DOC-2026-0238', entityName: 'National ID - Flora Mushi', description: 'Verified national ID document for KYC compliance (Tanzania)', ipAddress: '196.216.170.55', metadata: { docType: 'National ID', country: 'Tanzania', verificationMethod: 'Manual' } },
  { id: 'AUD-018', timestamp: '2026-03-15T10:30:00Z', action: 'export_generated', severity: 'info', userId: 'ADM-001', userName: 'Tendai Chikwava', userRole: 'admin', entityType: 'system', entityId: 'EXP-2026-0034', entityName: 'Monthly Portfolio Report', description: 'Generated monthly portfolio report for February 2026 (PDF, 45 pages)', ipAddress: '197.221.44.102', metadata: { format: 'PDF', pages: '45', period: 'February 2026' } },
  { id: 'AUD-019', timestamp: '2026-03-15T09:15:00Z', action: 'role_assigned', severity: 'warning', userId: 'ADM-001', userName: 'Tendai Chikwava', userRole: 'admin', entityType: 'system', entityId: 'ADM-005', entityName: 'Joseph Tawanda', description: 'Assigned finance-officer role to Joseph Tawanda with disbursement approval permissions', ipAddress: '197.221.44.102', metadata: { role: 'Finance Officer', permissions: 'disbursement_approve, payment_view' } },
  { id: 'AUD-020', timestamp: '2026-03-15T08:00:00Z', action: 'login', severity: 'info', userId: 'ADM-002', userName: 'Sarah Moatlhodi', userRole: 'officer', entityType: 'system', entityId: 'SESSION-88245', entityName: 'Officer Login', description: 'Officer login from Gaborone, Botswana', ipAddress: '196.216.170.55', metadata: { location: 'Gaborone, BW', twoFactor: 'verified' } },
];

// ── Animation variants ──────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 260,
      damping: 24,
    },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
};

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatTimestamp(timestamp: string): string {
  const d = new Date(timestamp);
  const now = new Date('2026-03-16T12:00:00Z');
  const diffMs = now.getTime() - d.getTime();
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  const date = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  if (diffHours < 1) return `${Math.floor(diffMs / 60000)}m ago`;
  if (diffHours < 24) return `${diffHours}h ago at ${time}`;
  if (diffDays === 1) return `Yesterday at ${time}`;
  return `${date} at ${time}`;
}

// ── Color maps ──────────────────────────────────────────────────────────────

const severityDotColor: Record<AuditSeverity, string> = {
  info: 'bg-green-500',
  warning: 'bg-amber-500',
  critical: 'bg-red-500',
};

const severityBgColor: Record<AuditSeverity, string> = {
  info: 'bg-green-50 border-green-200',
  warning: 'bg-amber-50 border-amber-200',
  critical: 'bg-red-50 border-red-200',
};

const severityIcon: Record<AuditSeverity, React.ReactNode> = {
  info: <Info className="w-4 h-4 text-green-600" />,
  warning: <AlertTriangle className="w-4 h-4 text-amber-600" />,
  critical: <AlertCircle className="w-4 h-4 text-red-600" />,
};

const roleColors: Record<string, string> = {
  admin: 'bg-navy/10 text-navy',
  officer: 'bg-teal-light text-teal-dark',
  member: 'bg-blue-100 text-blue-700',
  supplier: 'bg-purple-100 text-purple-700',
  system: 'bg-gray-100 text-gray-600',
};

const actionLabels: Record<string, string> = {
  login: 'Login',
  logout: 'Logout',
  member_created: 'Member Created',
  member_updated: 'Member Updated',
  member_suspended: 'Member Suspended',
  member_activated: 'Member Activated',
  loan_approved: 'Loan Approved',
  loan_rejected: 'Loan Rejected',
  loan_disbursed: 'Loan Disbursed',
  payment_received: 'Payment Received',
  payment_failed: 'Payment Failed',
  document_uploaded: 'Document Uploaded',
  document_verified: 'Document Verified',
  document_rejected: 'Document Rejected',
  application_submitted: 'Application Submitted',
  application_reviewed: 'Application Reviewed',
  training_completed: 'Training Completed',
  supplier_approved: 'Supplier Approved',
  supplier_suspended: 'Supplier Suspended',
  product_approved: 'Product Approved',
  product_rejected: 'Product Rejected',
  claim_submitted: 'Claim Submitted',
  claim_approved: 'Claim Approved',
  claim_rejected: 'Claim Rejected',
  settings_changed: 'Settings Changed',
  role_assigned: 'Role Assigned',
  export_generated: 'Export Generated',
  bulk_action: 'Bulk Action',
};

const entityTypeColors: Record<string, string> = {
  member: 'text-blue-600',
  loan: 'text-teal-dark',
  payment: 'text-green-600',
  document: 'text-amber-600',
  supplier: 'text-purple-600',
  product: 'text-orange-600',
  claim: 'text-rose-600',
  training: 'text-indigo-600',
  system: 'text-gray-500',
};

// ── Constants ───────────────────────────────────────────────────────────────

const ITEMS_PER_LOAD = 15;

// ═══════════════════════════════════════════════════════════════════════════
//  AUDIT LOG ENTRY COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

function AuditLogEntry({ entry }: { entry: AuditEntry }) {
  const [expanded, setExpanded] = useState(false);
  const metadataEntries = Object.entries(entry.metadata);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`border rounded-lg p-4 transition-all hover:shadow-sm ${severityBgColor[entry.severity]}`}
    >
      <div className="flex items-start gap-3">
        {/* Severity indicator */}
        <div className="flex-shrink-0 mt-1">
          <div className={`w-2.5 h-2.5 rounded-full ${severityDotColor[entry.severity]} ring-2 ring-offset-1 ${
            entry.severity === 'info' ? 'ring-green-200' :
            entry.severity === 'warning' ? 'ring-amber-200' : 'ring-red-200'
          }`} />
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center flex-wrap gap-2 mb-1">
            {/* Severity icon + action */}
            <div className="flex items-center gap-1.5">
              {severityIcon[entry.severity]}
              <span className="font-semibold text-sm text-navy">
                {actionLabels[entry.action] || entry.action}
              </span>
            </div>

            {/* User badge */}
            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${roleColors[entry.userRole] || 'bg-gray-100 text-gray-600'}`}>
              {entry.userName}
              <span className="opacity-60">({entry.userRole})</span>
            </span>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-700 mb-2">{entry.description}</p>

          {/* Bottom row: entity, timestamp, IP */}
          <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-xs">
            {/* Entity */}
            <span className={`font-medium ${entityTypeColors[entry.entityType] || 'text-gray-500'}`}>
              {entry.entityType.charAt(0).toUpperCase() + entry.entityType.slice(1)}: {entry.entityId}
            </span>

            {/* Timestamp */}
            <span className="text-gray-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatTimestamp(entry.timestamp)}
            </span>

            {/* IP */}
            {entry.ipAddress !== '0.0.0.0' && (
              <span className="font-mono text-gray-400">
                IP: {entry.ipAddress}
              </span>
            )}
          </div>

          {/* Expandable metadata */}
          {metadataEntries.length > 0 && (
            <div className="mt-2">
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-navy transition-colors"
              >
                <ChevronRight className={`w-3 h-3 transition-transform ${expanded ? 'rotate-90' : ''}`} />
                {expanded ? 'Hide' : 'Show'} metadata ({metadataEntries.length} fields)
              </button>
              <AnimatePresence>
                {expanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-2 bg-white/70 rounded-lg p-3 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
                      {metadataEntries.map(([key, value]) => (
                        <div key={key} className="flex items-center gap-2 text-xs">
                          <span className="text-gray-400 font-mono">{key}:</span>
                          <span className="font-medium text-navy">{value}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function AuditPage() {
  const [severityFilter, setSeverityFilter] = useState<'all' | AuditSeverity>('all');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [entityFilter, setEntityFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_LOAD);
  const [liveAudit, setLiveAudit] = useState<AuditEntry[] | null>(null);

  // Fetch live audit data
  useEffect(() => {
    fetch('/api/admin/financial')
      .then(res => res.json())
      .then(data => {
        if (data?.audit?.length) {
          // Map API audit entries to the existing AuditEntry shape
          const mapped: AuditEntry[] = data.audit.map((a: Record<string, unknown>, i: number) => ({
            id: (a.id as string) || `live-${i}`,
            timestamp: a.created_at as string,
            userId: (a.user_id as string) || 'system',
            userName: (a.details as Record<string, string>)?.user_name || 'System',
            userRole: (a.details as Record<string, string>)?.user_role || 'admin',
            action: (a.action as AuditAction) || 'update',
            entity: (a.entity_type as string) || 'system',
            entityId: (a.entity_id as string) || '',
            description: `${a.action} on ${a.entity_type}`,
            severity: (a.severity as AuditSeverity) || 'info',
            ipAddress: (a.ip_address as string) || '—',
            details: a.details as Record<string, string> || {},
          }));
          setLiveAudit(mapped);
        }
      })
      .catch(() => { /* fallback to mock */ });
  }, []);

  // Use live data or mock
  const auditEntries = liveAudit?.length ? liveAudit : mockAuditEntries;

  // ── Computed stats ────────────────────────────────────────────────────

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayEvents = auditEntries.filter((e) => e.timestamp.startsWith(todayStr));
  const criticalCount = auditEntries.filter((e) => e.severity === 'critical').length;
  const warningCount = auditEntries.filter((e) => e.severity === 'warning').length;
  const sessionCount = auditEntries.filter((e) => e.action === 'login').length;

  // ── Unique values for filters ─────────────────────────────────────────

  const uniqueActions = [...new Set(auditEntries.map((e) => e.action))].sort();
  const uniqueEntityTypes = [...new Set(auditEntries.map((e) => e.entityType))].sort();
  const uniqueRoles = [...new Set(auditEntries.map((e) => e.userRole))].sort();

  // ── Filtered entries ──────────────────────────────────────────────────

  const filteredEntries = useMemo(() => {
    return auditEntries.filter((entry) => {
      if (severityFilter !== 'all' && entry.severity !== severityFilter) return false;
      if (actionFilter !== 'all' && entry.action !== actionFilter) return false;
      if (entityFilter !== 'all' && entry.entityType !== entityFilter) return false;
      if (roleFilter !== 'all' && entry.userRole !== roleFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matches =
          entry.description.toLowerCase().includes(q) ||
          entry.userName.toLowerCase().includes(q) ||
          entry.entityName.toLowerCase().includes(q) ||
          entry.entityId.toLowerCase().includes(q) ||
          entry.id.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (dateFrom) {
        const entryDate = entry.timestamp.split('T')[0];
        if (entryDate < dateFrom) return false;
      }
      if (dateTo) {
        const entryDate = entry.timestamp.split('T')[0];
        if (entryDate > dateTo) return false;
      }
      return true;
    });
  }, [severityFilter, actionFilter, entityFilter, roleFilter, searchQuery, dateFrom, dateTo]);

  const visibleEntries = filteredEntries.slice(0, visibleCount);
  const hasMore = visibleCount < filteredEntries.length;

  const handleExportAuditCSV = () => {
    const headers = ['ID', 'Timestamp', 'Action', 'Severity', 'User', 'Role', 'Entity Type', 'Entity ID', 'Entity Name', 'Description', 'IP Address'];
    const rows = filteredEntries.map((e) => [
      e.id, e.timestamp, e.action, e.severity, e.userName, e.userRole, e.entityType, e.entityId, e.entityName,
      `"${e.description.replace(/"/g, '""')}"`, e.ipAddress,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_log_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Stat cards ────────────────────────────────────────────────────────

  const statCards = [
    {
      label: 'Events Today',
      value: todayEvents.length.toString(),
      icon: <Activity className="w-5 h-5" />,
      color: 'text-teal',
      bgColor: 'bg-teal-light',
    },
    {
      label: 'Critical Events',
      value: criticalCount.toString(),
      icon: <AlertCircle className="w-5 h-5" />,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      label: 'Warnings',
      value: warningCount.toString(),
      icon: <AlertTriangle className="w-5 h-5" />,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      label: 'User Sessions',
      value: sessionCount.toString(),
      icon: <Users className="w-5 h-5" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
  ];

  const severityOptions: { value: 'all' | AuditSeverity; label: string; color: string; activeColor: string }[] = [
    { value: 'all', label: 'All', color: 'border-gray-200 text-gray-600 hover:bg-gray-50', activeColor: 'bg-navy text-white border-navy' },
    { value: 'info', label: 'Info', color: 'border-green-200 text-green-700 hover:bg-green-50', activeColor: 'bg-green-600 text-white border-green-600' },
    { value: 'warning', label: 'Warning', color: 'border-amber-200 text-amber-700 hover:bg-amber-50', activeColor: 'bg-amber-500 text-white border-amber-500' },
    { value: 'critical', label: 'Critical', color: 'border-red-200 text-red-700 hover:bg-red-50', activeColor: 'bg-red-600 text-white border-red-600' },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy flex items-center gap-2">
            <Shield className="w-6 h-6 text-teal" />
            Audit Trail
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Chronological log of all platform events and actions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">
            {auditEntries.length} total events
          </span>
          <button
            onClick={handleExportAuditCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-navy text-white text-xs font-medium rounded-lg hover:bg-navy/90 transition-colors"
          >
            <Activity className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </motion.div>

      {/* ── Stat Cards ──────────────────────────────────────────────────── */}
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {statCards.map((stat, i) => (
          <motion.div
            key={i}
            variants={cardVariants}
            whileHover={{ y: -2, boxShadow: '0 8px 25px rgba(27,42,74,0.08)' }}
            className="bg-white rounded-xl p-4 border border-gray-100 cursor-default"
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`w-9 h-9 rounded-lg ${stat.bgColor} flex items-center justify-center ${stat.color}`}>
                {stat.icon}
              </div>
            </div>
            <p className="text-2xl font-bold text-navy">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Severity Toggle + Filters ───────────────────────────────────── */}
      <motion.div
        variants={fadeUp}
        className="bg-white rounded-xl border border-gray-100 p-4"
      >
        {/* Severity pills */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm font-medium text-navy mr-1">Severity:</span>
          {severityOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { setSeverityFilter(opt.value); setVisibleCount(ITEMS_PER_LOAD); }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                severityFilter === opt.value ? opt.activeColor : opt.color
              }`}
            >
              {opt.label}
              {opt.value !== 'all' && (
                <span className="ml-1 opacity-75">
                  ({auditEntries.filter((e) => e.severity === opt.value).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Filters row */}
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-navy">Filters</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search events, users, entities..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setVisibleCount(ITEMS_PER_LOAD); }}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
            />
          </div>

          {/* Action type */}
          <select
            value={actionFilter}
            onChange={(e) => { setActionFilter(e.target.value); setVisibleCount(ITEMS_PER_LOAD); }}
            className="border border-gray-200 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal text-gray-700"
          >
            <option value="all">All Actions</option>
            {uniqueActions.map((a) => (
              <option key={a} value={a}>{actionLabels[a] || a}</option>
            ))}
          </select>

          {/* Entity type */}
          <select
            value={entityFilter}
            onChange={(e) => { setEntityFilter(e.target.value); setVisibleCount(ITEMS_PER_LOAD); }}
            className="border border-gray-200 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal text-gray-700"
          >
            <option value="all">All Entities</option>
            {uniqueEntityTypes.map((et) => (
              <option key={et} value={et}>{et.charAt(0).toUpperCase() + et.slice(1)}</option>
            ))}
          </select>

          {/* User role */}
          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setVisibleCount(ITEMS_PER_LOAD); }}
            className="border border-gray-200 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal text-gray-700"
          >
            <option value="all">All Roles</option>
            {uniqueRoles.map((r) => (
              <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
            ))}
          </select>

          {/* Date range */}
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setVisibleCount(ITEMS_PER_LOAD); }}
              className="border border-gray-200 rounded-lg text-xs px-2 py-2 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal text-gray-700 w-full"
              placeholder="From"
            />
          </div>
        </div>

        {/* Date To row */}
        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100">
          <label className="text-xs text-gray-500">Date to:</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => { setDateTo(e.target.value); setVisibleCount(ITEMS_PER_LOAD); }}
            className="border border-gray-200 rounded-lg text-sm px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal text-gray-700"
          />
          {(dateFrom || dateTo || searchQuery || actionFilter !== 'all' || entityFilter !== 'all' || roleFilter !== 'all' || severityFilter !== 'all') && (
            <button
              onClick={() => {
                setSeverityFilter('all');
                setActionFilter('all');
                setEntityFilter('all');
                setRoleFilter('all');
                setSearchQuery('');
                setDateFrom('');
                setDateTo('');
                setVisibleCount(ITEMS_PER_LOAD);
              }}
              className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
            >
              Clear All Filters
            </button>
          )}
          <span className="text-xs text-gray-400 ml-auto">
            {filteredEntries.length} events match filters
          </span>
        </div>
      </motion.div>

      {/* ── Event Log ───────────────────────────────────────────────────── */}
      <motion.div variants={fadeUp} className="space-y-3">
        <AnimatePresence mode="popLayout">
          {visibleEntries.map((entry) => (
            <AuditLogEntry key={entry.id} entry={entry} />
          ))}
        </AnimatePresence>

        {filteredEntries.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
            <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No audit events match your filters</p>
            <p className="text-gray-400 text-xs mt-1">Try adjusting your filter criteria</p>
          </div>
        )}

        {/* Load More button */}
        {hasMore && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center pt-4"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setVisibleCount((prev) => prev + ITEMS_PER_LOAD)}
              className="px-6 py-2.5 bg-navy text-white text-sm font-medium rounded-lg hover:bg-navy/90 transition-colors flex items-center gap-2"
            >
              <ChevronDown className="w-4 h-4" />
              Load More ({filteredEntries.length - visibleCount} remaining)
            </motion.button>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
