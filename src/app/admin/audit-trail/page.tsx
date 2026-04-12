'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import {
  Shield,
  Search,
  Filter,
  Download,
  Clock,
  Users,
  Activity,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LogIn,
  LogOut,
  Plus,
  Pencil,
  Trash2,
  FileDown,
  CheckCircle2,
  XCircle,
  PenTool,
  Eye,
  Info,
  AlertTriangle,
  AlertCircle,
} from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────

type ActionType =
  | 'login' | 'logout' | 'create' | 'update' | 'delete'
  | 'export' | 'approve' | 'reject' | 'sign' | 'view';

type ResourceType =
  | 'contract' | 'member' | 'loan' | 'trade_order'
  | 'payment' | 'settings' | 'content';

type Severity = 'info' | 'warning' | 'critical';

interface AuditEntry {
  id: string;
  timestamp: string;
  userName: string;
  userEmail: string;
  action: ActionType;
  resource: ResourceType;
  resourceId: string;
  details: string;
  ipAddress: string;
  severity: Severity;
}

// ── No more hardcoded data — fetched from Supabase audit_log table ───────────

// ── Helpers ──────────────────────────────────────────────────────────────────

const ACTION_LABELS: Record<ActionType, string> = {
  login: 'Login', logout: 'Logout', create: 'Create', update: 'Update',
  delete: 'Delete', export: 'Export', approve: 'Approve', reject: 'Reject',
  sign: 'Sign', view: 'View',
};

const ACTION_ICONS: Record<ActionType, React.ReactNode> = {
  login: <LogIn className="w-3.5 h-3.5" />,
  logout: <LogOut className="w-3.5 h-3.5" />,
  create: <Plus className="w-3.5 h-3.5" />,
  update: <Pencil className="w-3.5 h-3.5" />,
  delete: <Trash2 className="w-3.5 h-3.5" />,
  export: <FileDown className="w-3.5 h-3.5" />,
  approve: <CheckCircle2 className="w-3.5 h-3.5" />,
  reject: <XCircle className="w-3.5 h-3.5" />,
  sign: <PenTool className="w-3.5 h-3.5" />,
  view: <Eye className="w-3.5 h-3.5" />,
};

const ACTION_COLORS: Record<ActionType, string> = {
  login: 'bg-blue-100 text-blue-700',
  logout: 'bg-gray-100 text-gray-600',
  create: 'bg-emerald-100 text-emerald-700',
  update: 'bg-indigo-100 text-indigo-700',
  delete: 'bg-red-100 text-red-700',
  export: 'bg-cyan-100 text-cyan-700',
  approve: 'bg-green-100 text-green-700',
  reject: 'bg-orange-100 text-orange-700',
  sign: 'bg-purple-100 text-purple-700',
  view: 'bg-slate-100 text-slate-600',
};

const RESOURCE_LABELS: Record<ResourceType, string> = {
  contract: 'Contract', member: 'Member', loan: 'Loan',
  trade_order: 'Trade Order', payment: 'Payment',
  settings: 'Settings', content: 'Content',
};

const SEVERITY_CONFIG: Record<Severity, { bg: string; text: string; dot: string; icon: React.ReactNode }> = {
  info: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500', icon: <Info className="w-3.5 h-3.5 text-blue-500" /> },
  warning: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500', icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> },
  critical: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500', icon: <AlertCircle className="w-3.5 h-3.5 text-red-500" /> },
};

function formatTimestamp(ts: string): string {
  const d = new Date(ts);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
    ' ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function relativeTime(ts: string): string {
  const now = new Date();
  const d = new Date(ts);
  const diffMs = now.getTime() - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function exportToCsv(entries: AuditEntry[]) {
  const headers = ['Timestamp', 'User', 'Email', 'Action', 'Resource', 'Resource ID', 'Details', 'IP Address', 'Severity'];
  const rows = entries.map(e => [
    e.timestamp, e.userName, e.userEmail, e.action, e.resource,
    e.resourceId, `"${e.details}"`, e.ipAddress, e.severity,
  ]);
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `audit-trail-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Animations ───────────────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.1 } },
};

const rowVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 26 } },
};

// ── Component ────────────────────────────────────────────────────────────────

const ACTIONS: ActionType[] = ['login', 'logout', 'create', 'update', 'delete', 'export', 'approve', 'reject', 'sign', 'view'];
const RESOURCES: ResourceType[] = ['contract', 'member', 'loan', 'trade_order', 'payment', 'settings', 'content'];
const SEVERITIES: Severity[] = ['info', 'warning', 'critical'];
const PAGE_SIZE = 10;

export default function AuditTrailPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<ActionType | ''>('');
  const [resourceFilter, setResourceFilter] = useState<ResourceType | ''>('');
  const [severityFilter, setSeverityFilter] = useState<Severity | ''>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    async function fetchAudit() {
      setLoading(true);
      const { data, error } = await supabase
        .from('audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (!error && data) {
        setEntries(data.map((row: Record<string, unknown>) => {
          const details = row.details as Record<string, unknown> | null;
          return {
            id: String(row.id),
            timestamp: String(row.created_at),
            userName: (details?.user_name as string) || String(row.user_id || 'System'),
            userEmail: (details?.user_email as string) || '',
            action: (String(row.action || 'view')) as ActionType,
            resource: (String(row.entity_type || 'settings')) as ResourceType,
            resourceId: String(row.entity_id || ''),
            details: (details?.description as string) || (details?.message as string) || JSON.stringify(details || {}),
            ipAddress: (details?.ip_address as string) || '',
            severity: (details?.severity as Severity) || 'info',
          };
        }));
      }
      setLoading(false);
    }
    fetchAudit();
  }, []);

  const filtered = useMemo(() => {
    let result = entries;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(e =>
        e.userName.toLowerCase().includes(q) ||
        e.userEmail.toLowerCase().includes(q) ||
        e.details.toLowerCase().includes(q) ||
        e.resourceId.toLowerCase().includes(q)
      );
    }
    if (actionFilter) result = result.filter(e => e.action === actionFilter);
    if (resourceFilter) result = result.filter(e => e.resource === resourceFilter);
    if (severityFilter) result = result.filter(e => e.severity === severityFilter);
    if (dateFrom) result = result.filter(e => e.timestamp >= dateFrom);
    if (dateTo) result = result.filter(e => e.timestamp <= dateTo + 'T23:59:59Z');

    return result;
  }, [entries, searchQuery, actionFilter, resourceFilter, severityFilter, dateFrom, dateTo]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const stats = useMemo(() => ({
    total: entries.length,
    critical: entries.filter(e => e.severity === 'critical').length,
    warning: entries.filter(e => e.severity === 'warning').length,
    uniqueUsers: new Set(entries.filter(e => e.userEmail).map(e => e.userEmail)).size,
  }), [entries]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">Audit Trail</h1>
          <p className="text-sm text-gray-500 mt-1">Comprehensive log of all system activity for compliance and accountability</p>
        </div>
        <button
          onClick={() => exportToCsv(filtered)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1B2A4A] text-white rounded-xl text-sm font-medium hover:bg-[#1B2A4A]/90 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export to CSV
        </button>
      </div>

      {/* Stats Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {[
          { label: 'Total Events', value: stats.total, icon: <Activity className="w-5 h-5" />, color: 'text-[#5DB347]', bg: 'bg-green-50' },
          { label: 'Critical Events', value: stats.critical, icon: <AlertCircle className="w-5 h-5" />, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Warnings', value: stats.warning, icon: <AlertTriangle className="w-5 h-5" />, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Active Users', value: stats.uniqueUsers, icon: <Users className="w-5 h-5" />, color: 'text-blue-600', bg: 'bg-blue-50' },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            variants={rowVariants}
            className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{stat.label}</p>
                <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center ${stat.color}`}>
                {stat.icon}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Search & Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by user, action, resource ID, or details..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-medium transition-colors ${showFilters ? 'bg-[#5DB347]/10 border-[#5DB347] text-[#5DB347]' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            <Filter className="w-4 h-4" />
            Filters
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 border-t border-gray-100 pt-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Action Type</label>
                  <select
                    value={actionFilter}
                    onChange={(e) => { setActionFilter(e.target.value as ActionType | ''); setPage(1); }}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30"
                  >
                    <option value="">All Actions</option>
                    {ACTIONS.map(a => <option key={a} value={a}>{ACTION_LABELS[a]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Resource</label>
                  <select
                    value={resourceFilter}
                    onChange={(e) => { setResourceFilter(e.target.value as ResourceType | ''); setPage(1); }}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30"
                  >
                    <option value="">All Resources</option>
                    {RESOURCES.map(r => <option key={r} value={r}>{RESOURCE_LABELS[r]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Severity</label>
                  <select
                    value={severityFilter}
                    onChange={(e) => { setSeverityFilter(e.target.value as Severity | ''); setPage(1); }}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30"
                  >
                    <option value="">All Severities</option>
                    {SEVERITIES.map(s => <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Date From</label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Date To</label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results count */}
        <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Showing {paged.length} of {filtered.length} entries
            {(actionFilter || resourceFilter || severityFilter || dateFrom || dateTo || searchQuery) && (
              <button
                onClick={() => { setActionFilter(''); setResourceFilter(''); setSeverityFilter(''); setDateFrom(''); setDateTo(''); setSearchQuery(''); setPage(1); }}
                className="ml-2 text-[#5DB347] hover:underline font-medium"
              >
                Clear all filters
              </button>
            )}
          </p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-t border-gray-100 bg-gray-50/50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Timestamp</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Resource</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Details</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">IP Address</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Severity</th>
              </tr>
            </thead>
            <motion.tbody variants={containerVariants} initial="hidden" animate="visible">
              {paged.map((entry) => {
                const sev = SEVERITY_CONFIG[entry.severity];
                return (
                  <motion.tr
                    key={entry.id}
                    variants={rowVariants}
                    className={`border-t border-gray-50 hover:bg-gray-50/50 transition-colors ${entry.severity === 'critical' ? 'bg-red-50/30' : ''}`}
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-gray-700">{relativeTime(entry.timestamp)}</p>
                          <p className="text-[10px] text-gray-400">{formatTimestamp(entry.timestamp)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="text-xs font-medium text-gray-800">{entry.userName}</p>
                      <p className="text-[10px] text-gray-400">{entry.userEmail}</p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${ACTION_COLORS[entry.action]}`}>
                        {ACTION_ICONS[entry.action]}
                        {ACTION_LABELS[entry.action]}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="text-xs font-medium text-gray-700">{RESOURCE_LABELS[entry.resource]}</p>
                      <p className="text-[10px] text-gray-400 font-mono">{entry.resourceId}</p>
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <p className="text-xs text-gray-600 truncate">{entry.details}</p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="text-xs text-gray-500 font-mono">{entry.ipAddress}</p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${sev.bg} ${sev.text}`}>
                        {sev.icon}
                        {entry.severity.charAt(0).toUpperCase() + entry.severity.slice(1)}
                      </span>
                    </td>
                  </motion.tr>
                );
              })}
            </motion.tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-500">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="p-12 text-center">
            <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3 animate-pulse" />
            <p className="text-sm font-medium text-gray-500">Loading audit entries...</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && paged.length === 0 && (
          <div className="p-12 text-center">
            <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-500">No audit entries found</p>
            <p className="text-xs text-gray-400 mt-1">
              {entries.length === 0
                ? 'No audit activity has been recorded yet'
                : 'Try adjusting your search or filter criteria'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
