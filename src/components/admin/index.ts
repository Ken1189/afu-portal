export { default as FilterBar } from './FilterBar';
export { default as CaseDetailPanel } from './CaseDetailPanel';
export type { CaseRecord } from './CaseDetailPanel';
export type { FilterConfig, FilterOption, FilterValues } from './FilterBar';
export {
  STATUS_FILTER,
  LOAN_STATUS_FILTER,
  KYC_STATUS_FILTER,
  COUNTRY_FILTER,
  MEMBERSHIP_FILTER,
  DATE_RANGE_FILTER,
} from './FilterBar';

/**
 * Apply filter values to an array of records.
 * Supports search across multiple fields, status, country, tier, and date range.
 */
export function applyFilters<T extends Record<string, unknown>>(
  records: T[],
  filters: Record<string, string | string[]>,
  searchFields: (keyof T)[],
): T[] {
  return records.filter((record) => {
    // Search filter
    if (filters.search && typeof filters.search === 'string' && filters.search.trim()) {
      const q = (filters.search as string).toLowerCase();
      const match = searchFields.some((field) => {
        const val = record[field];
        return typeof val === 'string' && val.toLowerCase().includes(q);
      });
      if (!match) return false;
    }

    // Status filter
    if (filters.status && filters.status !== 'all') {
      if (record.status !== filters.status) return false;
    }

    // Country filter
    if (filters.country && filters.country !== 'all') {
      if (record.country !== filters.country) return false;
    }

    // Tier filter
    if (filters.tier && filters.tier !== 'all') {
      if (record.tier !== filters.tier && record.membership_tier !== filters.tier) return false;
    }

    // Date range filter
    if (filters.dateRange && filters.dateRange !== 'all') {
      const dateField = (record.created_at || record.submittedDate || record.appliedDate) as string;
      if (dateField) {
        const date = new Date(dateField);
        const now = new Date();
        const daysMap: Record<string, number> = { '7d': 7, '30d': 30, '90d': 90, '365d': 365 };
        const days = daysMap[filters.dateRange as string];
        if (days) {
          const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
          if (date < cutoff) return false;
        }
      }
    }

    return true;
  });
}
