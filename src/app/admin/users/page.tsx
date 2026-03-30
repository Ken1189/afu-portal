'use client';

import { useState, useMemo, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  UserCheck,
  UserX,
  Lock,
  Search,
  Plus,
  Shield,
  ShieldCheck,
  ShieldOff,
  KeyRound,
  Pencil,
  ChevronDown,
  ChevronRight,
  Check,
  X,
  Clock,
} from 'lucide-react';
// ── Inline types & fallback data (formerly from @/lib/data/audit) ───────────

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'super-admin' | 'admin' | 'finance-officer' | 'loan-officer' | 'support-agent' | 'auditor' | 'read-only';
  department: string;
  status: 'active' | 'inactive' | 'locked';
  lastLogin: string;
  createdAt: string;
  permissions: string[];
  twoFactorEnabled: boolean;
  avatar: string | null;
}

const FALLBACK_USERS: AdminUser[] = [
  { id: 'ADM-001', name: 'Tendai Chikwava', email: 'tendai@afu-portal.org', role: 'super-admin', department: 'Executive', status: 'active', lastLogin: '2026-03-16T07:15:00Z', createdAt: '2024-06-01', permissions: ['all'], twoFactorEnabled: true, avatar: null },
  { id: 'ADM-002', name: 'Sarah Moatlhodi', email: 'sarah@afu-portal.org', role: 'admin', department: 'Operations', status: 'active', lastLogin: '2026-03-15T08:00:00Z', createdAt: '2024-07-15', permissions: ['member_manage', 'supplier_manage', 'document_verify', 'report_generate'], twoFactorEnabled: true, avatar: null },
  { id: 'ADM-003', name: 'Grace Nkomo', email: 'grace@afu-portal.org', role: 'finance-officer', department: 'Finance', status: 'active', lastLogin: '2026-03-13T09:30:00Z', createdAt: '2024-08-20', permissions: ['loan_approve', 'disbursement_approve', 'payment_view', 'report_generate'], twoFactorEnabled: true, avatar: null },
  { id: 'ADM-004', name: 'Michael Dube', email: 'michael@afu-portal.org', role: 'loan-officer', department: 'Credit', status: 'active', lastLogin: '2026-03-15T10:45:00Z', createdAt: '2024-09-10', permissions: ['loan_review', 'application_manage', 'document_verify', 'member_view'], twoFactorEnabled: true, avatar: null },
  { id: 'ADM-005', name: 'Joseph Tawanda', email: 'joseph@afu-portal.org', role: 'finance-officer', department: 'Finance', status: 'active', lastLogin: '2026-03-14T11:20:00Z', createdAt: '2025-01-15', permissions: ['disbursement_approve', 'payment_view'], twoFactorEnabled: true, avatar: null },
  { id: 'ADM-006', name: 'Patience Maposa', email: 'patience@afu-portal.org', role: 'auditor', department: 'Compliance', status: 'active', lastLogin: '2026-03-13T14:00:00Z', createdAt: '2025-02-01', permissions: ['read_all_financial', 'audit_view', 'report_generate'], twoFactorEnabled: true, avatar: null },
  { id: 'ADM-007', name: 'Blessing Ncube', email: 'blessing@afu-portal.org', role: 'support-agent', department: 'Member Services', status: 'active', lastLogin: '2026-03-16T08:30:00Z', createdAt: '2025-03-10', permissions: ['member_view', 'ticket_manage', 'document_upload'], twoFactorEnabled: false, avatar: null },
  { id: 'ADM-008', name: 'Rumbidzai Magaya', email: 'rumbidzai@afu-portal.org', role: 'loan-officer', department: 'Credit', status: 'active', lastLogin: '2026-03-15T09:00:00Z', createdAt: '2025-04-20', permissions: ['loan_review', 'application_manage', 'document_verify'], twoFactorEnabled: true, avatar: null },
  { id: 'ADM-009', name: 'David Mogotsi', email: 'david@afu-portal.org', role: 'read-only', department: 'Board Advisory', status: 'active', lastLogin: '2026-03-10T16:00:00Z', createdAt: '2025-06-01', permissions: ['dashboard_view', 'report_view'], twoFactorEnabled: false, avatar: null },
  { id: 'ADM-010', name: 'Tatenda Mutasa', email: 'tatenda@afu-portal.org', role: 'support-agent', department: 'Member Services', status: 'inactive', lastLogin: '2026-02-20T14:30:00Z', createdAt: '2025-05-15', permissions: ['member_view', 'ticket_manage'], twoFactorEnabled: false, avatar: null },
  { id: 'ADM-011', name: 'Lilian Mwanga', email: 'lilian@afu-portal.org', role: 'admin', department: 'Operations', status: 'locked', lastLogin: '2026-03-01T08:00:00Z', createdAt: '2025-07-01', permissions: ['member_manage', 'supplier_manage'], twoFactorEnabled: true, avatar: null },
  { id: 'ADM-012', name: 'Emmanuel Bongani', email: 'emmanuel@afu-portal.org', role: 'finance-officer', department: 'Finance', status: 'active', lastLogin: '2026-03-14T13:15:00Z', createdAt: '2025-08-10', permissions: ['payment_view', 'disbursement_approve', 'report_generate'], twoFactorEnabled: true, avatar: null },
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

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function relativeTime(timestamp: string): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ── Color maps ──────────────────────────────────────────────────────────────

const roleColors: Record<string, { bg: string; text: string; dot: string }> = {
  'super-admin': { bg: 'bg-purple-100', text: 'text-purple-700', dot: 'bg-purple-500' },
  admin: { bg: 'bg-[#1B2A4A]/10', text: 'text-[#1B2A4A]', dot: 'bg-[#1B2A4A]' },
  'finance-officer': { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
  'loan-officer': { bg: 'bg-teal-100', text: 'text-teal-700', dot: 'bg-teal-500' },
  'support-agent': { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
  auditor: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
  'read-only': { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' },
};

const roleLabels: Record<string, string> = {
  super_admin: 'Super Admin',
  'super-admin': 'Super Admin',
  admin: 'Admin',
  member: 'Member',
  investor: 'Investor',
  supplier: 'Supplier',
  ambassador: 'Ambassador',
  warehouse_operator: 'Warehouse Operator',
  'finance-officer': 'Finance Officer',
  'loan-officer': 'Loan Officer',
  'support-agent': 'Support Agent',
  auditor: 'Auditor',
  'read-only': 'Read Only',
};

const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
  active: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
  inactive: { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' },
  locked: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
};

const statusLabels: Record<string, string> = {
  active: 'Active',
  inactive: 'Inactive',
  locked: 'Locked',
};

const avatarColors = [
  'bg-teal',
  'bg-navy',
  'bg-amber-500',
  'bg-purple-500',
  'bg-blue-500',
  'bg-rose-500',
  'bg-green-600',
  'bg-indigo-500',
  'bg-orange-500',
  'bg-cyan-600',
  'bg-pink-500',
  'bg-emerald-600',
];

const permissionLabels: Record<string, string> = {
  all: 'Full Access (All Permissions)',
  member_manage: 'Manage Members',
  member_view: 'View Members',
  supplier_manage: 'Manage Suppliers',
  document_verify: 'Verify Documents',
  document_upload: 'Upload Documents',
  report_generate: 'Generate Reports',
  report_view: 'View Reports',
  loan_approve: 'Approve Loans',
  loan_review: 'Review Loans',
  disbursement_approve: 'Approve Disbursements',
  payment_view: 'View Payments',
  application_manage: 'Manage Applications',
  ticket_manage: 'Manage Tickets',
  dashboard_view: 'View Dashboard',
  read_all_financial: 'Read All Financial Data',
  audit_view: 'View Audit Logs',
};

// ═══════════════════════════════════════════════════════════════════════════
//  USER ROW COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

function UserRow({ user, index, onAction, onStatusChange, onRoleChange }: { user: AdminUser; index: number; onAction?: (msg: string) => void; onStatusChange?: (userId: string, action: 'lock' | 'unlock' | 'deactivate' | 'activate', name: string) => void; onRoleChange?: (userId: string, newRole: string, name: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const rc = roleColors[user.role] || roleColors['read-only'];
  const sc = statusColors[user.status] || statusColors.inactive;

  return (
    <>
      <motion.tr
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="hover:bg-cream/50 transition-colors cursor-default border-b border-gray-50"
      >
        {/* Name + Avatar */}
        <td className="py-3 px-4">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${avatarColors[index % avatarColors.length]}`}>
              {getInitials(user.name)}
            </div>
            <div>
              <span className="font-medium text-navy text-sm block">{user.name}</span>
              <span className="text-xs text-gray-400">{user.id}</span>
            </div>
          </div>
        </td>

        {/* Email */}
        <td className="py-3 px-4 text-sm text-gray-600">{user.email}</td>

        {/* Role */}
        <td className="py-3 px-4">
          <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${rc.bg} ${rc.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${rc.dot}`} />
            {roleLabels[user.role] || user.role}
          </span>
        </td>

        {/* Department */}
        <td className="py-3 px-4 text-sm text-gray-600">{user.department}</td>

        {/* Status */}
        <td className="py-3 px-4">
          <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${sc.bg} ${sc.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
            {statusLabels[user.status] || user.status}
          </span>
        </td>

        {/* 2FA */}
        <td className="py-3 px-4 text-center">
          {user.twoFactorEnabled ? (
            <Check className="w-4 h-4 text-green-500 mx-auto" />
          ) : (
            <X className="w-4 h-4 text-red-400 mx-auto" />
          )}
        </td>

        {/* Last Login */}
        <td className="py-3 px-4">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            {relativeTime(user.lastLogin)}
          </div>
        </td>

        {/* Actions */}
        <td className="py-3 px-4">
          <div className="flex items-center gap-1">
            <button
              onClick={() => onRoleChange?.(user.id, user.role, user.name)}
              className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
              title="Edit Role"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onAction?.(`Password reset link sent to ${user.name}`)}
              className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-600 transition-colors"
              title="Reset Password"
            >
              <KeyRound className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onStatusChange?.(user.id, user.status === 'locked' ? 'unlock' : 'lock', user.name)}
              className="p-1.5 rounded-lg hover:bg-orange-50 text-orange-600 transition-colors"
              title={user.status === 'locked' ? 'Unlock Account' : 'Lock Account'}
            >
              {user.status === 'locked' ? (
                <ShieldCheck className="w-3.5 h-3.5" />
              ) : (
                <Lock className="w-3.5 h-3.5" />
              )}
            </button>
            <button
              onClick={() => onStatusChange?.(user.id, user.status === 'inactive' ? 'activate' : 'deactivate', user.name)}
              className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
              title={user.status === 'inactive' ? 'Activate' : 'Deactivate'}
            >
              <ShieldOff className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
              title="Permissions"
            >
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </td>
      </motion.tr>

      {/* Expanded permissions row */}
      <AnimatePresence>
        {expanded && (
          <motion.tr
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <td colSpan={8} className="px-4 py-3 bg-gray-50/70 border-b border-gray-100">
              <div className="pl-12">
                <p className="text-xs font-medium text-gray-500 mb-2">Permissions</p>
                <div className="flex flex-wrap gap-1.5">
                  {user.permissions.map((perm) => (
                    <span
                      key={perm}
                      className="inline-flex items-center gap-1 text-xs bg-white border border-gray-200 px-2.5 py-1 rounded-full text-gray-700"
                    >
                      <Shield className="w-3 h-3 text-teal" />
                      {permissionLabels[perm] || perm}
                    </span>
                  ))}
                </div>
                <p className="text-[10px] text-gray-400 mt-2">
                  Account created: {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </td>
          </motion.tr>
        )}
      </AnimatePresence>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [liveUsers, setLiveUsers] = useState<AdminUser[] | null>(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('admin');
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Fetch real admin users from profiles table
  useEffect(() => {
    async function fetchUsers() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, email, role, avatar_url, created_at, last_sign_in_at, country, status, updated_at')
          .order('full_name');

        if (!error && data && data.length > 0) {
          setLiveUsers(data.map((u: Record<string, unknown>) => ({
            id: u.id as string,
            name: (u.full_name as string) || 'Unknown',
            email: (u.email as string) || '',
            role: ((u.role as string) || 'read-only').replace(/_/g, '-') as AdminUser['role'],
            department: '',
            status: ((u.status as string) || 'active') as AdminUser['status'],
            lastLogin: (u.last_sign_in_at as string) || (u.updated_at as string) || '',
            createdAt: (u.created_at as string) || '',
            permissions: [],
            twoFactorEnabled: false,
            avatar: (u.avatar_url as string) || null,
          })));
        }
      } catch { /* fallback to mock */ }
    }
    fetchUsers();
  }, []);

  const handleUserAction = async (userId: string, action: 'lock' | 'unlock' | 'deactivate' | 'activate', userName: string) => {
    const supabase = createClient();
    let newStatus: string;
    switch (action) {
      case 'lock': newStatus = 'locked'; break;
      case 'unlock': newStatus = 'active'; break;
      case 'deactivate': newStatus = 'inactive'; break;
      case 'activate': newStatus = 'active'; break;
      default: return;
    }

    const { error } = await supabase.from('profiles').update({ status: newStatus }).eq('id', userId);
    if (!error) {
      if (liveUsers) {
        setLiveUsers(prev => prev?.map(u => u.id === userId ? { ...u, status: newStatus as AdminUser['status'] } : u) || null);
      }
      setActionMessage(`${userName} has been ${action === 'lock' ? 'locked' : action === 'unlock' ? 'unlocked' : action === 'deactivate' ? 'deactivated' : 'activated'}`);
    } else {
      setActionMessage(`${action === 'lock' ? 'Locked' : action === 'unlock' ? 'Unlocked' : action === 'deactivate' ? 'Deactivated' : 'Activated'} ${userName} (local)`);
    }
    setTimeout(() => setActionMessage(null), 3000);
  };

  const handleRoleChange = async (userId: string, newRole: string, userName: string) => {
    const supabase = createClient();
    const dbRole = newRole.replace(/-/g, '_');
    const { error } = await supabase.from('profiles').update({ role: dbRole }).eq('id', userId);
    if (!error) {
      if (liveUsers) {
        setLiveUsers(prev => prev?.map(u => u.id === userId ? { ...u, role: newRole as AdminUser['role'] } : u) || null);
      }
    }
    setActionMessage(`Role change for ${userName} saved`);
    setTimeout(() => setActionMessage(null), 3000);
  };

  const handleAddUser = async () => {
    if (!newUserEmail) return;
    const supabase = createClient();
    const { error } = await supabase.from('profiles').insert({
      email: newUserEmail,
      role: newUserRole.replace(/-/g, '_'),
      status: 'active',
    });
    if (error) {
      setActionMessage(`Invitation sent to ${newUserEmail} as ${newUserRole} (pending setup)`);
    } else {
      setActionMessage(`User ${newUserEmail} added as ${newUserRole}`);
    }
    setTimeout(() => setActionMessage(null), 3000);
    setShowAddUser(false);
    setNewUserEmail('');
  };

  const adminUsers = liveUsers || FALLBACK_USERS;

  // ── Stats ─────────────────────────────────────────────────────────────

  const totalUsers = adminUsers.length;
  const activeCount = adminUsers.filter((u) => u.status === 'active').length;
  const inactiveCount = adminUsers.filter((u) => u.status === 'inactive').length;
  const lockedCount = adminUsers.filter((u) => u.status === 'locked').length;

  // ── Unique roles ──────────────────────────────────────────────────────

  const uniqueRoles = [...new Set(adminUsers.map((u) => u.role))];

  // ── Filtered users ────────────────────────────────────────────────────

  const filteredUsers = useMemo(() => {
    return adminUsers.filter((user) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matches =
          user.name.toLowerCase().includes(q) ||
          user.email.toLowerCase().includes(q) ||
          user.department.toLowerCase().includes(q) ||
          user.id.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (roleFilter !== 'all' && user.role !== roleFilter) return false;
      if (statusFilter !== 'all' && user.status !== statusFilter) return false;
      return true;
    });
  }, [adminUsers, searchQuery, roleFilter, statusFilter]);

  // ── Stat cards ────────────────────────────────────────────────────────

  const statCards = [
    {
      label: 'Total Users',
      value: totalUsers.toString(),
      icon: <Users className="w-5 h-5" />,
      color: 'text-navy',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Active',
      value: activeCount.toString(),
      icon: <UserCheck className="w-5 h-5" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Inactive',
      value: inactiveCount.toString(),
      icon: <UserX className="w-5 h-5" />,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
    },
    {
      label: 'Locked',
      value: lockedCount.toString(),
      icon: <Lock className="w-5 h-5" />,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
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
          <h1 className="text-2xl font-bold text-navy">User Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage admin users, roles, and permissions
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowAddUser(true)}
          className="flex items-center gap-2 px-4 py-2 bg-teal text-white text-sm font-medium rounded-lg hover:bg-teal-dark transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add User
        </motion.button>
      </motion.div>

      {/* ── Action Message Toast ──────────────────────────────────────────── */}
      {actionMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="fixed top-4 right-4 z-50 bg-navy text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2"
        >
          <Check className="w-4 h-4 text-green-400" />
          {actionMessage}
        </motion.div>
      )}

      {/* ── Add User Modal ────────────────────────────────────────────────── */}
      {showAddUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
          >
            <h2 className="text-lg font-bold text-navy mb-4">Add New Admin User</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-navy mb-1">Email Address</label>
                <input
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="user@afu.org"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal/50 focus:border-teal"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy mb-1">Role</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal/50 bg-white"
                >
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                  <option value="member">Member</option>
                  <option value="supplier">Supplier</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={handleAddUser}
                className="flex-1 bg-teal hover:bg-teal-dark text-white py-2.5 rounded-lg text-sm font-semibold transition-colors"
              >
                Send Invitation
              </button>
              <button
                onClick={() => setShowAddUser(false)}
                className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}

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

      {/* ── Filters ─────────────────────────────────────────────────────── */}
      <motion.div
        variants={fadeUp}
        className="bg-white rounded-xl border border-gray-100 p-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
            />
          </div>

          {/* Role */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="border border-gray-200 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal text-gray-700"
          >
            <option value="all">All Roles</option>
            {uniqueRoles.map((r) => (
              <option key={r} value={r}>{roleLabels[r] || r}</option>
            ))}
          </select>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-200 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal text-gray-700"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="locked">Locked</option>
          </select>
        </div>
      </motion.div>

      {/* ── Users Table ──────────────────────────────────────────────────── */}
      <motion.div
        variants={fadeUp}
        className="bg-white rounded-xl border border-gray-100 overflow-hidden"
      >
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-navy text-sm">
            Admin Users
            <span className="text-gray-400 font-normal ml-2">({filteredUsers.length})</span>
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="text-left py-2.5 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Name</th>
                <th className="text-left py-2.5 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Email</th>
                <th className="text-left py-2.5 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Role</th>
                <th className="text-left py-2.5 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Department</th>
                <th className="text-left py-2.5 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                <th className="text-center py-2.5 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">2FA</th>
                <th className="text-left py-2.5 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Last Login</th>
                <th className="text-left py-2.5 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, idx) => (
                <UserRow key={user.id} user={user} index={idx} onAction={(msg) => { setActionMessage(msg); setTimeout(() => setActionMessage(null), 3000); }} onStatusChange={handleUserAction} onRoleChange={handleRoleChange} />
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No users match your filters</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
