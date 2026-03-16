'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  Globe,
  Shield,
  Bell,
  Server,
  Pencil,
  Check,
  X,
  ChevronDown,
  ChevronRight,
  Eye,
  ToggleLeft,
  ToggleRight,
  Clock,
  Database,
  Zap,
  HardDrive,
  Activity,
  AlertCircle,
  CheckCircle2,
  Info,
} from 'lucide-react';

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

// ── Types ───────────────────────────────────────────────────────────────────

type TabId = 'general' | 'roles' | 'notifications' | 'system';

interface SettingField {
  key: string;
  label: string;
  value: string;
  type: 'text' | 'number' | 'select' | 'toggle';
  options?: string[];
  suffix?: string;
  description?: string;
}

interface RolePermission {
  role: string;
  label: string;
  color: string;
  userCount: number;
  permissions: string[];
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  enabled: boolean;
  lastEdited: string;
  description: string;
}

interface SystemMetric {
  label: string;
  value: string;
  status: 'green' | 'amber' | 'red';
  description: string;
}

// ── Mock data ───────────────────────────────────────────────────────────────

const generalSettings: SettingField[] = [
  { key: 'platformName', label: 'Platform Name', value: 'AFU Agricultural Finance Union', type: 'text', description: 'Display name across the platform' },
  { key: 'defaultCurrency', label: 'Default Currency', value: 'USD', type: 'select', options: ['USD', 'BWP', 'ZWL', 'TZS', 'ZAR'], description: 'Primary currency for transactions' },
  { key: 'timezone', label: 'Timezone', value: 'Africa/Gaborone (CAT, UTC+2)', type: 'select', options: ['Africa/Gaborone (CAT, UTC+2)', 'Africa/Harare (CAT, UTC+2)', 'Africa/Dar_es_Salaam (EAT, UTC+3)'], description: 'Server timezone for scheduling' },
  { key: 'maintenanceMode', label: 'Maintenance Mode', value: 'false', type: 'toggle', description: 'Enable to show maintenance page to users' },
  { key: 'minLoanAmount', label: 'Minimum Loan Amount', value: '500', type: 'number', suffix: 'USD', description: 'Lowest allowed loan application amount' },
  { key: 'maxLoanAmount', label: 'Maximum Loan Amount', value: '100000', type: 'number', suffix: 'USD', description: 'Highest allowed loan application amount' },
  { key: 'defaultInterestRate', label: 'Default Interest Rate', value: '11.8', type: 'number', suffix: '%', description: 'Base annual interest rate for new loans' },
  { key: 'defaultCommissionRate', label: 'Default Commission Rate', value: '7.5', type: 'number', suffix: '%', description: 'Default supplier marketplace commission' },
];

const rolePermissions: RolePermission[] = [
  {
    role: 'super-admin',
    label: 'Super Admin',
    color: 'bg-purple-100 text-purple-700',
    userCount: 1,
    permissions: ['all', 'system_settings', 'user_manage', 'role_assign', 'data_export', 'audit_manage'],
  },
  {
    role: 'admin',
    label: 'Admin',
    color: 'bg-[#1B2A4A]/10 text-[#1B2A4A]',
    userCount: 2,
    permissions: ['member_manage', 'supplier_manage', 'document_verify', 'report_generate', 'product_manage', 'training_manage'],
  },
  {
    role: 'finance-officer',
    label: 'Finance Officer',
    color: 'bg-green-100 text-green-700',
    userCount: 3,
    permissions: ['loan_approve', 'disbursement_approve', 'payment_view', 'report_generate', 'collection_manage'],
  },
  {
    role: 'loan-officer',
    label: 'Loan Officer',
    color: 'bg-teal-100 text-teal-700',
    userCount: 2,
    permissions: ['loan_review', 'application_manage', 'document_verify', 'member_view', 'credit_assess'],
  },
  {
    role: 'support-agent',
    label: 'Support Agent',
    color: 'bg-blue-100 text-blue-700',
    userCount: 2,
    permissions: ['member_view', 'ticket_manage', 'document_upload', 'faq_manage'],
  },
  {
    role: 'auditor',
    label: 'Auditor',
    color: 'bg-amber-100 text-amber-700',
    userCount: 1,
    permissions: ['read_all_financial', 'audit_view', 'report_generate', 'compliance_view'],
  },
  {
    role: 'read-only',
    label: 'Read Only',
    color: 'bg-gray-100 text-gray-600',
    userCount: 1,
    permissions: ['dashboard_view', 'report_view'],
  },
];

const emailTemplates: EmailTemplate[] = [
  { id: 'tmpl-01', name: 'Welcome Email', subject: 'Welcome to AFU - Your Account is Ready', enabled: true, lastEdited: '2026-02-15', description: 'Sent when a new member account is created and verified' },
  { id: 'tmpl-02', name: 'Loan Approved', subject: 'Your Loan Application Has Been Approved', enabled: true, lastEdited: '2026-03-01', description: 'Notification when a loan application is approved' },
  { id: 'tmpl-03', name: 'Loan Rejected', subject: 'Update on Your Loan Application', enabled: true, lastEdited: '2026-03-01', description: 'Notification when a loan application is rejected with reasons' },
  { id: 'tmpl-04', name: 'Payment Due Reminder', subject: 'Payment Due in 7 Days - Action Required', enabled: true, lastEdited: '2026-02-20', description: 'Sent 7 days before a payment due date' },
  { id: 'tmpl-05', name: 'Payment Overdue', subject: 'Overdue Payment Notice', enabled: true, lastEdited: '2026-02-20', description: 'Sent when a payment is past due' },
  { id: 'tmpl-06', name: 'Payment Received', subject: 'Payment Confirmation - Thank You', enabled: true, lastEdited: '2026-01-10', description: 'Receipt confirmation for successful payments' },
  { id: 'tmpl-07', name: 'KYC Reminder', subject: 'Complete Your Identity Verification', enabled: true, lastEdited: '2026-03-05', description: 'Reminder for members with incomplete KYC' },
  { id: 'tmpl-08', name: 'Training Completion', subject: 'Congratulations - Course Completed!', enabled: true, lastEdited: '2026-01-15', description: 'Certificate notification after course completion' },
  { id: 'tmpl-09', name: 'Supplier Approval', subject: 'Your Supplier Application is Approved', enabled: true, lastEdited: '2026-02-01', description: 'Sent to suppliers when approved on the marketplace' },
  { id: 'tmpl-10', name: 'Monthly Statement', subject: 'Your Monthly Account Statement', enabled: false, lastEdited: '2025-12-15', description: 'Monthly summary of account activity and balances' },
  { id: 'tmpl-11', name: 'Security Alert', subject: 'Security Alert - New Login Detected', enabled: true, lastEdited: '2026-03-10', description: 'Alert when login from a new device or location' },
  { id: 'tmpl-12', name: 'Insurance Claim Update', subject: 'Update on Your Insurance Claim', enabled: false, lastEdited: '2025-11-20', description: 'Status updates for insurance claim processing' },
];

const systemMetrics: SystemMetric[] = [
  { label: 'API Gateway', value: '99.97% uptime', status: 'green', description: 'Last 30 days availability' },
  { label: 'Database Cluster', value: '3 nodes healthy', status: 'green', description: 'PostgreSQL primary + 2 replicas' },
  { label: 'Payment Gateway', value: 'Operational', status: 'green', description: 'Mobile money & bank integrations' },
  { label: 'SMS Provider', value: 'Degraded', status: 'amber', description: 'Africa\'s Talking - intermittent delays' },
  { label: 'Email Service', value: 'Operational', status: 'green', description: 'SendGrid - all regions' },
  { label: 'File Storage', value: '78% capacity', status: 'amber', description: 'AWS S3 - 234 GB / 300 GB used' },
  { label: 'Cache Layer', value: 'Healthy', status: 'green', description: 'Redis cluster - 6 nodes' },
  { label: 'Background Jobs', value: '2 retrying', status: 'amber', description: 'BullMQ - 2 jobs in retry queue' },
];

const systemSettings = {
  apiRateLimit: '1000 req/min',
  apiRateLimitAuth: '100 req/min',
  cacheDefaultTTL: '3600 seconds',
  cacheSessionTTL: '86400 seconds',
  backupFrequency: 'Every 6 hours',
  backupRetention: '30 days',
  lastBackup: '2026-03-16 06:00 UTC',
  version: '2.4.1',
  buildDate: '2026-03-14',
  nodeEnv: 'production',
  region: 'af-south-1',
};

// ── Permission label formatting ─────────────────────────────────────────────

function formatPermission(perm: string): string {
  return perm.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}

// ═══════════════════════════════════════════════════════════════════════════
//  INLINE EDIT FIELD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

function InlineEditField({ field }: { field: SettingField }) {
  const [editing, setEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(field.value);
  const [toggleValue, setToggleValue] = useState(field.value === 'true');

  if (field.type === 'toggle') {
    return (
      <div className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors">
        <div className="flex-1">
          <p className="text-sm font-medium text-navy">{field.label}</p>
          {field.description && (
            <p className="text-xs text-gray-400 mt-0.5">{field.description}</p>
          )}
        </div>
        <button
          onClick={() => setToggleValue(!toggleValue)}
          className="flex-shrink-0"
        >
          {toggleValue ? (
            <ToggleRight className="w-8 h-8 text-teal" />
          ) : (
            <ToggleLeft className="w-8 h-8 text-gray-300" />
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors group">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-navy">{field.label}</p>
        {field.description && (
          <p className="text-xs text-gray-400 mt-0.5">{field.description}</p>
        )}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0 ml-4">
        {editing ? (
          <div className="flex items-center gap-2">
            {field.type === 'select' && field.options ? (
              <select
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                className="border border-gray-200 rounded-lg text-sm px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal text-gray-700"
              >
                {field.options.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : (
              <input
                type={field.type === 'number' ? 'number' : 'text'}
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                className="border border-gray-200 rounded-lg text-sm px-3 py-1.5 w-48 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal text-gray-700"
                autoFocus
              />
            )}
            {field.suffix && <span className="text-xs text-gray-500">{field.suffix}</span>}
            <button
              onClick={() => setEditing(false)}
              className="p-1 rounded-lg hover:bg-green-50 text-green-600 transition-colors"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={() => { setCurrentValue(field.value); setEditing(false); }}
              className="p-1 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            <span className="text-sm text-gray-700 font-mono">
              {currentValue}{field.suffix ? ` ${field.suffix}` : ''}
            </span>
            <button
              onClick={() => setEditing(true)}
              className="p-1 rounded-lg hover:bg-blue-50 text-blue-500 opacity-0 group-hover:opacity-100 transition-all"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  EXPANDABLE ROLE ROW
// ═══════════════════════════════════════════════════════════════════════════

function RoleRow({ role }: { role: RolePermission }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-gray-100 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? 'rotate-90' : ''}`} />
          <span className={`inline-flex items-center text-xs px-2.5 py-1 rounded-full font-medium ${role.color}`}>
            {role.label}
          </span>
          <span className="text-xs text-gray-400">{role.userCount} user{role.userCount !== 1 ? 's' : ''}</span>
        </div>
        <span className="text-xs text-gray-400">{role.permissions.length} permissions</span>
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
            <div className="px-4 pb-4 pt-0 border-t border-gray-100">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 mt-3">
                {role.permissions.map((perm) => (
                  <div
                    key={perm}
                    className="flex items-center gap-1.5 text-xs bg-gray-50 border border-gray-100 px-2.5 py-1.5 rounded-lg"
                  >
                    <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{formatPermission(perm)}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('general');
  const [templateStates, setTemplateStates] = useState<Record<string, boolean>>(
    () => Object.fromEntries(emailTemplates.map((t) => [t.id, t.enabled]))
  );

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'general', label: 'General', icon: <Globe className="w-4 h-4" /> },
    { id: 'roles', label: 'Roles & Permissions', icon: <Shield className="w-4 h-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { id: 'system', label: 'System', icon: <Server className="w-4 h-4" /> },
  ];

  const toggleTemplate = (id: string) => {
    setTemplateStates((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const statusDotColor = {
    green: 'bg-green-500',
    amber: 'bg-amber-500',
    red: 'bg-red-500',
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold text-navy flex items-center gap-2">
          <Settings className="w-6 h-6 text-teal" />
          Admin Settings
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Configure platform settings, roles, notifications, and system parameters
        </p>
      </motion.div>

      {/* ── Tab Navigation ──────────────────────────────────────────────── */}
      <motion.div variants={fadeUp} className="bg-white rounded-xl border border-gray-100 p-1 inline-flex gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-navy text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-50 hover:text-navy'
            }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </motion.div>

      {/* ── Tab Content ─────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {/* ═══════════════════════════════════════════════════════════════
            GENERAL TAB
        ════════════════════════════════════════════════════════════ */}
        {activeTab === 'general' && (
          <motion.div
            key="general"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-xl border border-gray-100 overflow-hidden"
          >
            <div className="p-5 border-b border-gray-100">
              <h3 className="font-semibold text-navy text-sm flex items-center gap-2">
                <Globe className="w-4 h-4 text-teal" />
                General Settings
              </h3>
              <p className="text-xs text-gray-400 mt-1">Platform configuration and default values</p>
            </div>
            <div className="divide-y divide-gray-50">
              {generalSettings.map((field) => (
                <InlineEditField key={field.key} field={field} />
              ))}
            </div>
            <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <Info className="w-3 h-3" />
                Changes are saved automatically (mock)
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-4 py-2 bg-teal text-white text-sm font-medium rounded-lg hover:bg-teal-dark transition-colors"
                onClick={() => alert('Settings saved (mock)')}
              >
                Save Changes
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            ROLES & PERMISSIONS TAB
        ════════════════════════════════════════════════════════════ */}
        {activeTab === 'roles' && (
          <motion.div
            key="roles"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-xl border border-gray-100 overflow-hidden"
          >
            <div className="p-5 border-b border-gray-100">
              <h3 className="font-semibold text-navy text-sm flex items-center gap-2">
                <Shield className="w-4 h-4 text-teal" />
                Roles & Permissions
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                {rolePermissions.length} roles configured with permission groups
              </p>
            </div>
            <div className="p-4 space-y-2">
              {rolePermissions.map((role) => (
                <RoleRow key={role.role} role={role} />
              ))}
            </div>
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            NOTIFICATIONS TAB
        ════════════════════════════════════════════════════════════ */}
        {activeTab === 'notifications' && (
          <motion.div
            key="notifications"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-xl border border-gray-100 overflow-hidden"
          >
            <div className="p-5 border-b border-gray-100">
              <h3 className="font-semibold text-navy text-sm flex items-center gap-2">
                <Bell className="w-4 h-4 text-teal" />
                Email Templates
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                {emailTemplates.length} templates configured
              </p>
            </div>
            <div className="divide-y divide-gray-50">
              {emailTemplates.map((template) => {
                const isEnabled = templateStates[template.id] ?? template.enabled;
                return (
                  <div
                    key={template.id}
                    className={`flex items-center justify-between p-4 transition-colors ${
                      isEnabled ? 'hover:bg-gray-50' : 'bg-gray-50/50 opacity-75'
                    }`}
                  >
                    <div className="flex-1 min-w-0 mr-4">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-medium text-navy">{template.name}</p>
                        {!isEnabled && (
                          <span className="text-[10px] bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded">Disabled</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 truncate">{template.subject}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{template.description}</p>
                      <p className="text-[10px] text-gray-400 mt-1">Last edited: {template.lastEdited}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => alert(`Preview: ${template.name}`)}
                        className="p-2 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors"
                        title="Preview"
                      >
                        <Eye className="w-4 h-4" />
                      </motion.button>
                      <button
                        onClick={() => toggleTemplate(template.id)}
                        className="flex-shrink-0"
                        title={isEnabled ? 'Disable' : 'Enable'}
                      >
                        {isEnabled ? (
                          <ToggleRight className="w-8 h-8 text-teal" />
                        ) : (
                          <ToggleLeft className="w-8 h-8 text-gray-300" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            SYSTEM TAB
        ════════════════════════════════════════════════════════════ */}
        {activeTab === 'system' && (
          <motion.div
            key="system"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* System Health */}
            <motion.div
              variants={cardVariants}
              className="bg-white rounded-xl border border-gray-100 overflow-hidden"
            >
              <div className="p-5 border-b border-gray-100">
                <h3 className="font-semibold text-navy text-sm flex items-center gap-2">
                  <Activity className="w-4 h-4 text-teal" />
                  System Health
                </h3>
                <p className="text-xs text-gray-400 mt-1">Real-time service status monitoring</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-gray-100">
                {systemMetrics.map((metric) => (
                  <div key={metric.label} className="bg-white p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`w-2 h-2 rounded-full ${statusDotColor[metric.status]}`} />
                      <span className="text-sm font-medium text-navy">{metric.label}</span>
                    </div>
                    <p className="text-sm text-gray-700 font-mono">{metric.value}</p>
                    <p className="text-xs text-gray-400 mt-1">{metric.description}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* API & Cache Settings */}
            <motion.div
              variants={cardVariants}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {/* API Rate Limits */}
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-100">
                  <h3 className="font-semibold text-navy text-sm flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500" />
                    API Rate Limits
                  </h3>
                </div>
                <div className="divide-y divide-gray-50">
                  <div className="flex items-center justify-between p-4">
                    <div>
                      <p className="text-sm font-medium text-navy">Public API</p>
                      <p className="text-xs text-gray-400">Unauthenticated requests</p>
                    </div>
                    <span className="text-sm font-mono text-gray-700">{systemSettings.apiRateLimit}</span>
                  </div>
                  <div className="flex items-center justify-between p-4">
                    <div>
                      <p className="text-sm font-medium text-navy">Authenticated API</p>
                      <p className="text-xs text-gray-400">Per-user rate limit</p>
                    </div>
                    <span className="text-sm font-mono text-gray-700">{systemSettings.apiRateLimitAuth}</span>
                  </div>
                </div>
              </div>

              {/* Cache Settings */}
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-100">
                  <h3 className="font-semibold text-navy text-sm flex items-center gap-2">
                    <Database className="w-4 h-4 text-blue-500" />
                    Cache Settings
                  </h3>
                </div>
                <div className="divide-y divide-gray-50">
                  <div className="flex items-center justify-between p-4">
                    <div>
                      <p className="text-sm font-medium text-navy">Default TTL</p>
                      <p className="text-xs text-gray-400">Cache expiration time</p>
                    </div>
                    <span className="text-sm font-mono text-gray-700">{systemSettings.cacheDefaultTTL}</span>
                  </div>
                  <div className="flex items-center justify-between p-4">
                    <div>
                      <p className="text-sm font-medium text-navy">Session TTL</p>
                      <p className="text-xs text-gray-400">User session duration</p>
                    </div>
                    <span className="text-sm font-mono text-gray-700">{systemSettings.cacheSessionTTL}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Backup & Version */}
            <motion.div
              variants={cardVariants}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {/* Backup Schedule */}
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-100">
                  <h3 className="font-semibold text-navy text-sm flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-green-500" />
                    Backup Schedule
                  </h3>
                </div>
                <div className="divide-y divide-gray-50">
                  <div className="flex items-center justify-between p-4">
                    <div>
                      <p className="text-sm font-medium text-navy">Frequency</p>
                      <p className="text-xs text-gray-400">Automated backup interval</p>
                    </div>
                    <span className="text-sm font-mono text-gray-700">{systemSettings.backupFrequency}</span>
                  </div>
                  <div className="flex items-center justify-between p-4">
                    <div>
                      <p className="text-sm font-medium text-navy">Retention</p>
                      <p className="text-xs text-gray-400">Backup retention period</p>
                    </div>
                    <span className="text-sm font-mono text-gray-700">{systemSettings.backupRetention}</span>
                  </div>
                  <div className="flex items-center justify-between p-4">
                    <div>
                      <p className="text-sm font-medium text-navy">Last Backup</p>
                      <p className="text-xs text-gray-400">Most recent successful backup</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-sm font-mono text-gray-700">{systemSettings.lastBackup}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Version Info */}
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-100">
                  <h3 className="font-semibold text-navy text-sm flex items-center gap-2">
                    <Info className="w-4 h-4 text-gray-400" />
                    Version Information
                  </h3>
                </div>
                <div className="divide-y divide-gray-50">
                  <div className="flex items-center justify-between p-4">
                    <div>
                      <p className="text-sm font-medium text-navy">Platform Version</p>
                      <p className="text-xs text-gray-400">Current release</p>
                    </div>
                    <span className="text-sm font-mono bg-teal-light text-teal-dark px-2.5 py-1 rounded-full font-medium">
                      v{systemSettings.version}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4">
                    <div>
                      <p className="text-sm font-medium text-navy">Build Date</p>
                      <p className="text-xs text-gray-400">Last deployment</p>
                    </div>
                    <span className="text-sm font-mono text-gray-700">{systemSettings.buildDate}</span>
                  </div>
                  <div className="flex items-center justify-between p-4">
                    <div>
                      <p className="text-sm font-medium text-navy">Environment</p>
                      <p className="text-xs text-gray-400">Runtime configuration</p>
                    </div>
                    <span className="text-sm font-mono text-gray-700">{systemSettings.nodeEnv}</span>
                  </div>
                  <div className="flex items-center justify-between p-4">
                    <div>
                      <p className="text-sm font-medium text-navy">Region</p>
                      <p className="text-xs text-gray-400">Primary deployment region</p>
                    </div>
                    <span className="text-sm font-mono text-gray-700">{systemSettings.region}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
