import type { UserRole } from './types';

/**
 * Check if a role string is an admin role.
 */
export function isAdminRole(role: string | null | undefined): boolean {
  return role === 'admin' || role === 'super_admin';
}

/**
 * Check if a role string is a supplier role.
 */
export function isSupplierRole(role: string | null | undefined): boolean {
  return role === 'supplier' || isAdminRole(role);
}

/**
 * Helper to safely extract role from a profile query result.
 */
export function getRole(profile: { role: string } | null): UserRole | null {
  if (!profile) return null;
  return profile.role as UserRole;
}
