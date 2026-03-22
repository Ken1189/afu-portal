'use client';

import { useState } from 'react';
import { Search, Filter, X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/* ------------------------------------------------------------------ */
/* Types                                                                */
/* ------------------------------------------------------------------ */

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface FilterConfig {
  /** Unique key for this filter */
  key: string;
  /** Display label */
  label: string;
  /** Available options */
  options: FilterOption[];
  /** Allow selecting multiple options */
  multi?: boolean;
}

export interface FilterValues {
  search: string;
  [key: string]: string | string[];
}

interface FilterBarProps {
  /** Filter configurations */
  filters: FilterConfig[];
  /** Current filter values */
  values: FilterValues;
  /** Called when any filter changes */
  onChange: (values: FilterValues) => void;
  /** Placeholder text for search */
  searchPlaceholder?: string;
  /** Total result count to display */
  resultCount?: number;
}

/* ------------------------------------------------------------------ */
/* Preset filter configs for reuse                                      */
/* ------------------------------------------------------------------ */

export const STATUS_FILTER: FilterConfig = {
  key: 'status',
  label: 'Status',
  options: [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'under_review', label: 'Under Review' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'disbursed', label: 'Disbursed' },
    { value: 'completed', label: 'Completed' },
  ],
};

export const LOAN_STATUS_FILTER: FilterConfig = {
  key: 'status',
  label: 'Status',
  options: [
    { value: 'all', label: 'All' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'pending', label: 'Pending' },
    { value: 'under_review', label: 'Under Review' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'disbursed', label: 'Disbursed' },
    { value: 'repaying', label: 'Repaying' },
    { value: 'completed', label: 'Completed' },
  ],
};

export const KYC_STATUS_FILTER: FilterConfig = {
  key: 'status',
  label: 'Status',
  options: [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'verified', label: 'Verified' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'expired', label: 'Expired' },
  ],
};

export const COUNTRY_FILTER: FilterConfig = {
  key: 'country',
  label: 'Country',
  options: [
    { value: 'all', label: 'All Countries' },
    { value: 'Botswana', label: 'Botswana' },
    { value: 'Zimbabwe', label: 'Zimbabwe' },
    { value: 'Tanzania', label: 'Tanzania' },
    { value: 'Kenya', label: 'Kenya' },
    { value: 'Nigeria', label: 'Nigeria' },
    { value: 'Zambia', label: 'Zambia' },
    { value: 'Mozambique', label: 'Mozambique' },
    { value: 'South Africa', label: 'South Africa' },
    { value: 'Ghana', label: 'Ghana' },
    { value: 'Uganda', label: 'Uganda' },
  ],
};

export const MEMBERSHIP_FILTER: FilterConfig = {
  key: 'tier',
  label: 'Tier',
  options: [
    { value: 'all', label: 'All Tiers' },
    { value: 'smallholder', label: 'Smallholder ($5/mo)' },
    { value: 'commercial', label: 'Commercial ($25/mo)' },
    { value: 'enterprise', label: 'Enterprise ($99/mo)' },
    { value: 'partner', label: 'Partner ($250/mo)' },
  ],
};

export const DATE_RANGE_FILTER: FilterConfig = {
  key: 'dateRange',
  label: 'Date',
  options: [
    { value: 'all', label: 'All Time' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
    { value: '365d', label: 'Last Year' },
  ],
};

/* ------------------------------------------------------------------ */
/* Component                                                            */
/* ------------------------------------------------------------------ */

export default function FilterBar({
  filters,
  values,
  onChange,
  searchPlaceholder = 'Search by name, email, or ID...',
  resultCount,
}: FilterBarProps) {
  const [expanded, setExpanded] = useState(false);

  const activeFilterCount = Object.entries(values).filter(
    ([key, val]) => key !== 'search' && val !== 'all' && val !== '' && !(Array.isArray(val) && val.length === 0)
  ).length;

  const handleSearchChange = (search: string) => {
    onChange({ ...values, search });
  };

  const handleFilterChange = (key: string, value: string) => {
    onChange({ ...values, [key]: value });
  };

  const clearFilters = () => {
    const cleared: FilterValues = { search: '' };
    filters.forEach((f) => { cleared[f.key] = 'all'; });
    onChange(cleared);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      {/* Search + toggle row */}
      <div className="flex items-center gap-2 p-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={values.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none"
          />
          {values.search && (
            <button
              onClick={() => handleSearchChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
            >
              <X className="w-3 h-3 text-gray-500" />
            </button>
          )}
        </div>

        {/* Filter toggle button */}
        <button
          onClick={() => setExpanded(!expanded)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
            expanded || activeFilterCount > 0
              ? 'bg-[#5DB347]/10 border-[#5DB347]/30 text-[#5DB347]'
              : 'border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Filter className="w-3.5 h-3.5" />
          Filters
          {activeFilterCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-[#5DB347] text-white text-[10px] font-bold flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Result count */}
        {resultCount !== undefined && (
          <span className="text-xs text-gray-400 whitespace-nowrap hidden sm:block">
            {resultCount} result{resultCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Expandable filter row */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 flex flex-wrap gap-2 items-center border-t border-gray-100 pt-3">
              {filters.map((filter) => (
                <div key={filter.key} className="relative">
                  <select
                    value={(values[filter.key] as string) || 'all'}
                    onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                    className="appearance-none bg-gray-50 border border-gray-200 rounded-lg pl-3 pr-8 py-1.5 text-xs font-medium text-gray-700 focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none cursor-pointer"
                  >
                    {filter.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {filter.label}: {opt.label}{opt.count !== undefined ? ` (${opt.count})` : ''}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                </div>
              ))}

              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-red-500 hover:text-red-600 font-medium flex items-center gap-1 ml-1"
                >
                  <X className="w-3 h-3" />
                  Clear all
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
