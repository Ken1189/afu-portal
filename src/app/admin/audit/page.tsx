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
import { auditEntries as mockAuditEntries, type AuditEntry, type AuditAction, type AuditSeverity } from '@/lib/data/audit';

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
        <div className="text-xs text-gray-400">
          {auditEntries.length} total events
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
