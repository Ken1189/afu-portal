'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  Search,
  Download,
} from 'lucide-react';

type SortDirection = 'asc' | 'desc' | null;

interface ColumnDef<T> {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (value: unknown, row: T, rowIndex: number) => React.ReactNode;
  className?: string;
  headerClassName?: string;
}

interface DataTableProps<T extends Record<string, unknown>> {
  columns: ColumnDef<T>[];
  data: T[];
  pageSize?: number;
  pageSizeOptions?: number[];
  searchable?: boolean;
  searchPlaceholder?: string;
  searchKeys?: string[];
  selectable?: boolean;
  onSelectionChange?: (selectedRows: T[]) => void;
  onExport?: () => void;
  exportLabel?: string;
  emptyMessage?: string;
  className?: string;
  rowKey?: string | ((row: T, index: number) => string);
}

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, part) => {
    if (acc && typeof acc === 'object' && part in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, obj);
}

function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  pageSize: initialPageSize = 10,
  pageSizeOptions = [5, 10, 25, 50],
  searchable = true,
  searchPlaceholder = 'Search...',
  searchKeys,
  selectable = false,
  onSelectionChange,
  onExport,
  exportLabel = 'Export',
  emptyMessage = 'No data available',
  className = '',
  rowKey = 'id',
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDirection>(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const getRowKey = useCallback(
    (row: T, index: number): string => {
      if (typeof rowKey === 'function') return rowKey(row, index);
      const val = getNestedValue(row, rowKey);
      return val !== undefined && val !== null ? String(val) : String(index);
    },
    [rowKey]
  );

  const filteredData = useMemo(() => {
    if (!search.trim()) return data;
    const term = search.toLowerCase();
    const keys =
      searchKeys ?? columns.map((c) => c.key);

    return data.filter((row) =>
      keys.some((key) => {
        const val = getNestedValue(row, key);
        return val !== undefined && val !== null && String(val).toLowerCase().includes(term);
      })
    );
  }, [data, search, searchKeys, columns]);

  const sortedData = useMemo(() => {
    if (!sortKey || !sortDir) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = getNestedValue(a, sortKey);
      const bVal = getNestedValue(b, sortKey);

      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      let comparison = 0;
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        comparison = aVal - bVal;
      } else {
        comparison = String(aVal).localeCompare(String(bVal));
      }
      return sortDir === 'desc' ? -comparison : comparison;
    });
  }, [filteredData, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const paginatedData = sortedData.slice(
    safePage * pageSize,
    safePage * pageSize + pageSize
  );

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDir === 'asc') setSortDir('desc');
      else if (sortDir === 'desc') {
        setSortKey(null);
        setSortDir(null);
      }
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setPage(0);
  };

  const allVisibleSelected =
    paginatedData.length > 0 &&
    paginatedData.every((row, i) =>
      selectedIds.has(getRowKey(row, safePage * pageSize + i))
    );

  const someVisibleSelected =
    !allVisibleSelected &&
    paginatedData.some((row, i) =>
      selectedIds.has(getRowKey(row, safePage * pageSize + i))
    );

  const toggleAll = () => {
    const newSelected = new Set(selectedIds);
    if (allVisibleSelected) {
      paginatedData.forEach((row, i) =>
        newSelected.delete(getRowKey(row, safePage * pageSize + i))
      );
    } else {
      paginatedData.forEach((row, i) =>
        newSelected.add(getRowKey(row, safePage * pageSize + i))
      );
    }
    setSelectedIds(newSelected);
    if (onSelectionChange) {
      const selected = sortedData.filter((row, i) =>
        newSelected.has(getRowKey(row, i))
      );
      onSelectionChange(selected);
    }
  };

  const toggleRow = (row: T, globalIndex: number) => {
    const key = getRowKey(row, globalIndex);
    const newSelected = new Set(selectedIds);
    if (newSelected.has(key)) {
      newSelected.delete(key);
    } else {
      newSelected.add(key);
    }
    setSelectedIds(newSelected);
    if (onSelectionChange) {
      const selected = sortedData.filter((r, i) =>
        newSelected.has(getRowKey(r, i))
      );
      onSelectionChange(selected);
    }
  };

  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    if (sortKey !== columnKey)
      return <ChevronsUpDown className="h-3.5 w-3.5 text-gray-400" />;
    if (sortDir === 'asc')
      return <ChevronUp className="h-3.5 w-3.5 text-teal" />;
    return <ChevronDown className="h-3.5 w-3.5 text-teal" />;
  };

  const startRange = sortedData.length === 0 ? 0 : safePage * pageSize + 1;
  const endRange = Math.min((safePage + 1) * pageSize, sortedData.length);

  return (
    <div
      className={`bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden ${className}`}
    >
      {(searchable || onExport) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b border-gray-100">
          {searchable && (
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(0);
                }}
                placeholder={searchPlaceholder}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal/50 focus:border-teal transition-colors"
                aria-label="Search table"
              />
            </div>
          )}
          {onExport && (
            <button
              type="button"
              onClick={onExport}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-navy border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/50"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              {exportLabel}
            </button>
          )}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm" role="grid">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/50">
              {selectable && (
                <th className="w-12 px-4 py-3" scope="col">
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someVisibleSelected;
                    }}
                    onChange={toggleAll}
                    className="h-4 w-4 rounded border-gray-300 text-teal focus:ring-teal/50"
                    aria-label="Select all rows on this page"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={[
                    'px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider',
                    col.sortable !== false ? 'cursor-pointer select-none hover:text-navy' : '',
                    col.headerClassName ?? '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={col.sortable !== false ? () => handleSort(col.key) : undefined}
                  aria-sort={
                    sortKey === col.key
                      ? sortDir === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : 'none'
                  }
                  tabIndex={col.sortable !== false ? 0 : undefined}
                  onKeyDown={(e) => {
                    if (col.sortable !== false && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      handleSort(col.key);
                    }
                  }}
                >
                  <div className="flex items-center gap-1">
                    {col.header}
                    {col.sortable !== false && <SortIcon columnKey={col.key} />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="px-4 py-12 text-center text-gray-400"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, localIdx) => {
                const globalIdx = safePage * pageSize + localIdx;
                const key = getRowKey(row, globalIdx);
                const isSelected = selectedIds.has(key);
                return (
                  <tr
                    key={key}
                    className={[
                      'transition-colors',
                      isSelected ? 'bg-teal-light/30' : 'hover:bg-gray-50/50',
                    ].join(' ')}
                  >
                    {selectable && (
                      <td className="w-12 px-4 py-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleRow(row, globalIdx)}
                          className="h-4 w-4 rounded border-gray-300 text-teal focus:ring-teal/50"
                          aria-label={`Select row ${globalIdx + 1}`}
                        />
                      </td>
                    )}
                    {columns.map((col) => {
                      const cellValue = getNestedValue(row, col.key);
                      return (
                        <td
                          key={col.key}
                          className={`px-4 py-3 text-navy ${col.className ?? ''}`}
                        >
                          {col.render
                            ? col.render(cellValue, row, globalIdx)
                            : cellValue !== undefined && cellValue !== null
                            ? String(cellValue)
                            : ''}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 border-t border-gray-100 text-sm">
        <div className="flex items-center gap-2 text-gray-500">
          <span>
            Showing {startRange}-{endRange} of {sortedData.length}
          </span>
          <span className="text-gray-300">|</span>
          <label className="flex items-center gap-1.5">
            <span>Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(0);
              }}
              className="border border-gray-200 rounded-md px-2 py-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal/50"
              aria-label="Rows per page"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={safePage === 0}
            className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/50"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {Array.from({ length: totalPages }).map((_, i) => {
            if (
              totalPages <= 7 ||
              i === 0 ||
              i === totalPages - 1 ||
              Math.abs(i - safePage) <= 1
            ) {
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setPage(i)}
                  className={[
                    'min-w-[32px] h-8 px-2 rounded-md text-sm font-medium transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/50',
                    i === safePage
                      ? 'bg-teal text-white'
                      : 'text-gray-600 hover:bg-gray-100',
                  ].join(' ')}
                  aria-label={`Go to page ${i + 1}`}
                  aria-current={i === safePage ? 'page' : undefined}
                >
                  {i + 1}
                </button>
              );
            }
            if (
              (i === 1 && safePage > 3) ||
              (i === totalPages - 2 && safePage < totalPages - 4)
            ) {
              return (
                <span
                  key={`ellipsis-${i}`}
                  className="px-1 text-gray-400"
                  aria-hidden="true"
                >
                  ...
                </span>
              );
            }
            return null;
          })}

          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={safePage >= totalPages - 1}
            className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/50"
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export { DataTable };
export type { DataTableProps, ColumnDef, SortDirection };
