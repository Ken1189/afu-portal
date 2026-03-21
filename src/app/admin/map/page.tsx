'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { MapFilters, MapLegend, type MapFilterState } from '@/components/map';
import { useMapData } from '@/components/map/useMapData';
import { MapPin, Wrench, Users, Globe } from 'lucide-react';

// Dynamic import — Leaflet requires `window`
const FarmMap = dynamic(() => import('@/components/map/FarmMap'), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

function MapSkeleton() {
  return (
    <div className="w-full h-[600px] bg-gray-100 rounded-xl animate-pulse flex items-center justify-center">
      <MapPin className="w-8 h-8 text-gray-300" />
    </div>
  );
}

const DEFAULT_FILTERS: MapFilterState = {
  country: 'all',
  crops: [],
  healthStatus: ['green', 'yellow', 'red'],
  entityType: 'all',
  farmSize: 'all',
};

export default function AdminMapPage() {
  const [filters, setFilters] = useState<MapFilterState>(DEFAULT_FILTERS);
  const { filteredData, isLoading, error, availableCrops, availableCountries, stats } =
    useMapData(filters);

  return (
    <div className="space-y-5">
      {/* ── Page Header ────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2.5 mb-1">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: '#EBF7E5' }}
          >
            <MapPin className="w-5 h-5" style={{ color: '#5DB347' }} />
          </div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: '#1B2A4A' }}>
              Farm Intelligence Map
            </h1>
            <p className="text-xs text-gray-500">
              Real-time view of farms, equipment, and cooperatives across Africa
            </p>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          icon={<MapPin className="w-4 h-4" style={{ color: '#5DB347' }} />}
          label="Farms"
          value={stats.totalFarms}
          bg="#EBF7E5"
        />
        <StatCard
          icon={<Wrench className="w-4 h-4" style={{ color: '#3B82F6' }} />}
          label="Equipment"
          value={stats.totalEquipment}
          bg="#EFF6FF"
        />
        <StatCard
          icon={<Users className="w-4 h-4" style={{ color: '#8B5CF6' }} />}
          label="Cooperatives"
          value={stats.totalCooperatives}
          bg="#F5F3FF"
        />
        <StatCard
          icon={<Globe className="w-4 h-4" style={{ color: '#1B2A4A' }} />}
          label="Countries Active"
          value={stats.countriesActive}
          bg="#F1F5F9"
        />
      </div>

      {/* ── Filters ────────────────────────────────────────────── */}
      <MapFilters
        filters={filters}
        onFiltersChange={setFilters}
        availableCrops={availableCrops}
        availableCountries={availableCountries}
      />

      {/* ── Error banner ───────────────────────────────────────── */}
      {error && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 text-sm text-amber-700">
          {error}
        </div>
      )}

      {/* ── Map Container ──────────────────────────────────────── */}
      <div className="relative">
        {isLoading ? (
          <MapSkeleton />
        ) : (
          <>
            <FarmMap data={filteredData} height="calc(100vh - 380px)" />
            <MapLegend />
          </>
        )}

        {/* Empty state */}
        {!isLoading && filteredData.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-xl">
            <div className="text-center">
              <MapPin className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-500">
                No data matches your filters
              </p>
              <button
                onClick={() => setFilters(DEFAULT_FILTERS)}
                className="mt-2 text-xs font-semibold px-4 py-1.5 rounded-lg text-white"
                style={{ backgroundColor: '#5DB347' }}
              >
                Reset Filters
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Stat card sub-component ──────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  bg,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  bg: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-4 py-3 flex items-center gap-3">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: bg }}
      >
        {icon}
      </div>
      <div>
        <p className="text-lg font-bold leading-tight" style={{ color: '#1B2A4A' }}>
          {value}
        </p>
        <p className="text-[11px] text-gray-500 font-medium">{label}</p>
      </div>
    </div>
  );
}
