'use client';

import { ChevronDown } from 'lucide-react';

export interface MapFilterState {
  country: string;
  crops: string[];
  healthStatus: ('green' | 'yellow' | 'red')[];
  entityType: 'all' | 'farm' | 'equipment' | 'cooperative';
  farmSize: 'all' | 'small' | 'medium' | 'large';
}

interface MapFiltersProps {
  filters: MapFilterState;
  onFiltersChange: (filters: MapFilterState) => void;
  availableCrops: string[];
  availableCountries: string[];
}

const ALL_COUNTRIES = [
  'Botswana',
  'Egypt',
  'Ethiopia',
  'Ghana',
  'Guinea-Bissau',
  'Ivory Coast',
  'Kenya',
  'Liberia',
  'Malawi',
  'Mali',
  'Mozambique',
  'Namibia',
  'Nigeria',
  'Republic of Guinea',
  'Sierra Leone',
  'South Africa',
  'Tanzania',
  'Uganda',
  'Zambia',
  'Zimbabwe',
];

const HEALTH_OPTIONS: { key: 'green' | 'yellow' | 'red'; label: string; color: string }[] = [
  { key: 'green', label: 'Healthy', color: '#5DB347' },
  { key: 'yellow', label: 'Attention', color: '#F59E0B' },
  { key: 'red', label: 'At Risk', color: '#EF4444' },
];

const ENTITY_OPTIONS: { value: MapFilterState['entityType']; label: string }[] = [
  { value: 'all', label: 'All Types' },
  { value: 'farm', label: 'Farms' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'cooperative', label: 'Cooperatives' },
];

const SIZE_OPTIONS: { value: MapFilterState['farmSize']; label: string }[] = [
  { value: 'all', label: 'All Sizes' },
  { value: 'small', label: 'Small (<5 ha)' },
  { value: 'medium', label: 'Medium (5-20 ha)' },
  { value: 'large', label: 'Large (>20 ha)' },
];

export default function MapFilters({
  filters,
  onFiltersChange,
  availableCrops,
  availableCountries,
}: MapFiltersProps) {
  const countries = availableCountries.length > 0 ? availableCountries : ALL_COUNTRIES;

  const update = (partial: Partial<MapFilterState>) => {
    onFiltersChange({ ...filters, ...partial });
  };

  const toggleHealth = (key: 'green' | 'yellow' | 'red') => {
    const current = filters.healthStatus;
    const next = current.includes(key)
      ? current.filter((s) => s !== key)
      : [...current, key];
    update({ healthStatus: next });
  };

  const toggleCrop = (crop: string) => {
    const current = filters.crops;
    const next = current.includes(crop)
      ? current.filter((c) => c !== crop)
      : [...current, crop];
    update({ crops: next });
  };

  const activeCount =
    (filters.country !== 'all' ? 1 : 0) +
    filters.crops.length +
    (filters.healthStatus.length < 3 ? 1 : 0) +
    (filters.entityType !== 'all' ? 1 : 0) +
    (filters.farmSize !== 'all' ? 1 : 0);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="flex flex-wrap items-center gap-3">
        {/* ── Country ────────────────────────────────────────── */}
        <div className="relative">
          <select
            value={filters.country}
            onChange={(e) => update({ country: e.target.value })}
            className="appearance-none pl-3 pr-8 py-2 text-sm rounded-lg border border-gray-200 bg-white text-[#1B2A4A] font-medium focus:outline-none focus:ring-2 focus:ring-[#5DB347]/40 focus:border-[#5DB347] cursor-pointer"
          >
            <option value="all">All Countries</option>
            {countries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>

        {/* ── Entity Type ────────────────────────────────────── */}
        <div className="flex items-center bg-gray-50 rounded-lg p-0.5">
          {ENTITY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => update({ entityType: opt.value })}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                filters.entityType === opt.value
                  ? 'text-white shadow-sm'
                  : 'text-gray-500 hover:text-[#1B2A4A]'
              }`}
              style={
                filters.entityType === opt.value
                  ? { backgroundColor: '#5DB347' }
                  : {}
              }
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* ── Health Status Toggles ──────────────────────────── */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-400 font-medium mr-1">Health:</span>
          {HEALTH_OPTIONS.map((opt) => {
            const isActive = filters.healthStatus.includes(opt.key);
            return (
              <button
                key={opt.key}
                onClick={() => toggleHealth(opt.key)}
                className={`px-2.5 py-1.5 text-xs font-semibold rounded-md border transition-all ${
                  isActive
                    ? 'text-white border-transparent shadow-sm'
                    : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300'
                }`}
                style={isActive ? { backgroundColor: opt.color, borderColor: opt.color } : {}}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* ── Farm Size ──────────────────────────────────────── */}
        <div className="relative">
          <select
            value={filters.farmSize}
            onChange={(e) =>
              update({ farmSize: e.target.value as MapFilterState['farmSize'] })
            }
            className="appearance-none pl-3 pr-8 py-2 text-sm rounded-lg border border-gray-200 bg-white text-[#1B2A4A] font-medium focus:outline-none focus:ring-2 focus:ring-[#5DB347]/40 focus:border-[#5DB347] cursor-pointer"
          >
            {SIZE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>

        {/* ── Crop Multi-select ──────────────────────────────── */}
        {availableCrops.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-gray-400 font-medium mr-1">Crops:</span>
            {availableCrops.map((crop) => {
              const isActive = filters.crops.includes(crop);
              return (
                <button
                  key={crop}
                  onClick={() => toggleCrop(crop)}
                  className={`px-2.5 py-1.5 text-xs font-semibold rounded-md border transition-all ${
                    isActive
                      ? 'text-white border-transparent shadow-sm'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                  }`}
                  style={
                    isActive
                      ? { backgroundColor: '#5DB347', borderColor: '#5DB347' }
                      : {}
                  }
                >
                  {crop}
                </button>
              );
            })}
          </div>
        )}

        {/* ── Active filter count / reset ─────────────────────── */}
        {activeCount > 0 && (
          <button
            onClick={() =>
              onFiltersChange({
                country: 'all',
                crops: [],
                healthStatus: ['green', 'yellow', 'red'],
                entityType: 'all',
                farmSize: 'all',
              })
            }
            className="ml-auto text-xs text-gray-400 hover:text-red-500 font-medium transition-colors"
          >
            Clear filters ({activeCount})
          </button>
        )}
      </div>
    </div>
  );
}
