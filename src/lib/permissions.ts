'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

// ── All granular permissions ─────────────────────────────────────────────

export const ALL_PERMISSIONS = [
  // Members & Applications
  'view_members',
  'edit_members',
  'approve_applications',
  'manage_kyc',
  // Finance & Loans
  'view_loans',
  'approve_loans',
  'disburse_loans',
  'view_payments',
  'manage_collections',
  // Investor Management
  'view_investors',
  'manage_investments',
  'investor_relations',
  // Farm Operations
  'view_farms',
  'manage_crops',
  'manage_livestock',
  'manage_equipment',
  'manage_insurance',
  'manage_legal',
  'manage_veterinary',
  // Programs & Training
  'view_programs',
  'create_programs',
  'manage_training',
  'manage_sponsors',
  'manage_jobs',
  // Marketplace & Partners
  'manage_suppliers',
  'manage_exchange',
  'manage_advertising',
  'manage_partnerships',
  // Trading
  'view_trades',
  'execute_trades',
  'manage_pricing',
  'manage_inventory',
  // Content & CMS
  'edit_content',
  'manage_ambassadors',
  'manage_faq',
  'manage_countries',
  'manage_research',
  'manage_testimonials',
  // System & Security
  'manage_users',
  'manage_roles',
  'view_audit',
  'manage_settings',
  'manage_compliance',
  'run_migrations',
] as const;

export type Permission = (typeof ALL_PERMISSIONS)[number];

// ── Sidebar permission map ───────────────────────────────────────────────
// Maps each sidebar nav group label to the permissions that grant access.
// If the array is empty, everyone sees that group.

export const SIDEBAR_PERMISSION_MAP: Record<string, string[]> = {
  'Overview': [], // everyone sees this
  'Members & Applications': ['view_members', 'edit_members', 'approve_applications', 'manage_kyc'],
  'Finance & Loans': ['view_loans', 'approve_loans', 'disburse_loans', 'view_payments', 'manage_collections'],
  'Investor Management': ['view_investors', 'manage_investments', 'investor_relations'],
  'Farm Operations': ['view_farms', 'manage_crops', 'manage_livestock', 'manage_equipment', 'manage_insurance', 'manage_legal', 'manage_veterinary'],
  'Programs & Training': ['view_programs', 'create_programs', 'manage_training', 'manage_sponsors', 'manage_jobs'],
  'Marketplace & Partners': ['manage_suppliers', 'manage_exchange', 'manage_advertising', 'manage_partnerships'],
  'Trading': ['view_trades', 'execute_trades', 'manage_pricing', 'manage_inventory'],
  'Content & CMS': ['edit_content', 'manage_ambassadors', 'manage_faq', 'manage_countries', 'manage_research', 'manage_testimonials'],
  'System & Security': ['manage_users', 'manage_roles', 'view_audit', 'manage_settings', 'manage_compliance', 'run_migrations'],
  'Switch Portal': [], // super_admin only — handled separately via superAdminOnly flag
};

// ── Permission group definitions (for the management UI) ─────────────────

export interface PermissionGroup {
  label: string;
  permissions: { key: Permission; label: string }[];
}

export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    label: 'Members & Applications',
    permissions: [
      { key: 'view_members', label: 'View Members' },
      { key: 'edit_members', label: 'Edit Members' },
      { key: 'approve_applications', label: 'Approve Applications' },
      { key: 'manage_kyc', label: 'Manage KYC' },
    ],
  },
  {
    label: 'Finance & Loans',
    permissions: [
      { key: 'view_loans', label: 'View Loans' },
      { key: 'approve_loans', label: 'Approve Loans' },
      { key: 'disburse_loans', label: 'Disburse Loans' },
      { key: 'view_payments', label: 'View Payments' },
      { key: 'manage_collections', label: 'Manage Collections' },
    ],
  },
  {
    label: 'Investor Management',
    permissions: [
      { key: 'view_investors', label: 'View Investors' },
      { key: 'manage_investments', label: 'Manage Investments' },
      { key: 'investor_relations', label: 'Investor Relations' },
    ],
  },
  {
    label: 'Farm Operations',
    permissions: [
      { key: 'view_farms', label: 'View Farms' },
      { key: 'manage_crops', label: 'Manage Crops' },
      { key: 'manage_livestock', label: 'Manage Livestock' },
      { key: 'manage_equipment', label: 'Manage Equipment' },
      { key: 'manage_insurance', label: 'Manage Insurance' },
      { key: 'manage_legal', label: 'Manage Legal' },
      { key: 'manage_veterinary', label: 'Manage Veterinary' },
    ],
  },
  {
    label: 'Programs & Training',
    permissions: [
      { key: 'view_programs', label: 'View Programs' },
      { key: 'create_programs', label: 'Create Programs' },
      { key: 'manage_training', label: 'Manage Training' },
      { key: 'manage_sponsors', label: 'Manage Sponsors' },
      { key: 'manage_jobs', label: 'Manage Jobs' },
    ],
  },
  {
    label: 'Marketplace & Partners',
    permissions: [
      { key: 'manage_suppliers', label: 'Manage Suppliers' },
      { key: 'manage_exchange', label: 'Manage Exchange' },
      { key: 'manage_advertising', label: 'Manage Advertising' },
      { key: 'manage_partnerships', label: 'Manage Partnerships' },
    ],
  },
  {
    label: 'Trading',
    permissions: [
      { key: 'view_trades', label: 'View Trades' },
      { key: 'execute_trades', label: 'Execute Trades' },
      { key: 'manage_pricing', label: 'Manage Pricing' },
      { key: 'manage_inventory', label: 'Manage Inventory' },
    ],
  },
  {
    label: 'Content & CMS',
    permissions: [
      { key: 'edit_content', label: 'Edit Content' },
      { key: 'manage_ambassadors', label: 'Manage Ambassadors' },
      { key: 'manage_faq', label: 'Manage FAQ' },
      { key: 'manage_countries', label: 'Manage Countries' },
      { key: 'manage_research', label: 'Manage Research' },
      { key: 'manage_testimonials', label: 'Manage Testimonials' },
    ],
  },
  {
    label: 'System & Security',
    permissions: [
      { key: 'manage_users', label: 'Manage Users' },
      { key: 'manage_roles', label: 'Manage Roles' },
      { key: 'view_audit', label: 'View Audit Trail' },
      { key: 'manage_settings', label: 'Manage Settings' },
      { key: 'manage_compliance', label: 'Manage Compliance' },
      { key: 'run_migrations', label: 'Run Migrations' },
    ],
  },
];

// ── Quick templates ──────────────────────────────────────────────────────

export const PERMISSION_TEMPLATES: Record<string, Permission[]> = {
  'Operations Admin': [
    'view_members', 'edit_members', 'approve_applications', 'manage_kyc',
    'view_farms', 'manage_crops', 'manage_livestock', 'manage_equipment',
    'manage_insurance', 'manage_legal', 'manage_veterinary',
    'view_programs', 'create_programs', 'manage_training', 'manage_sponsors', 'manage_jobs',
  ],
  'Finance Admin': [
    'view_members', 'view_loans', 'approve_loans', 'disburse_loans',
    'view_payments', 'manage_collections',
    'view_investors', 'manage_investments', 'investor_relations',
    'view_trades', 'execute_trades', 'manage_pricing', 'manage_inventory',
  ],
  'Content Admin': [
    'edit_content', 'manage_ambassadors', 'manage_faq', 'manage_countries',
    'manage_research', 'manage_testimonials',
    'view_programs', 'create_programs', 'manage_training',
  ],
  'Full Admin': [...ALL_PERMISSIONS],
};

// ── Permissions cache ────────────────────────────────────────────────────

const permissionsCache = new Map<string, { permissions: string[]; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// ── usePermissions hook ──────────────────────────────────────────────────

export function usePermissions(userId: string | undefined) {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    // Check cache first
    const cached = permissionsCache.get(userId);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      setPermissions(cached.permissions);
      setLoading(false);
      return;
    }

    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const supabase = createClient();
    (async () => {
      try {
        const { data, error } = await supabase
          .from('admin_permissions')
          .select('permission')
          .eq('user_id', userId);
        if (!error && data && data.length > 0) {
          const perms = data.map((row: { permission: string }) => row.permission);
          setPermissions(perms);
          permissionsCache.set(userId, { permissions: perms, timestamp: Date.now() });
        } else {
          setPermissions([]);
        }
      } catch {
        setPermissions([]);
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      fetchedRef.current = false;
    };
  }, [userId]);

  const hasPermission = useCallback(
    (perm: string) => permissions.includes(perm),
    [permissions]
  );

  const hasAnyPermission = useCallback(
    (perms: string[]) => {
      if (perms.length === 0) return true; // empty = everyone
      return perms.some((p) => permissions.includes(p));
    },
    [permissions]
  );

  return { permissions, hasPermission, hasAnyPermission, loading };
}

// ── Utility: invalidate cache for a user ─────────────────────────────────

export function invalidatePermissionsCache(userId: string) {
  permissionsCache.delete(userId);
}
