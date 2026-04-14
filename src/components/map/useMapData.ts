'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { MapDataPoint } from './FarmMap';
import type { MapFilterState } from './MapFilters';

// ── Hook ───────────────────────────────────────────────────────────────────

interface UseMapDataResult {
  data: MapDataPoint[];
  filteredData: MapDataPoint[];
  isLoading: boolean;
  error: string | null;
  availableCrops: string[];
  availableCountries: string[];
  stats: {
    totalFarms: number;
    totalEquipment: number;
    totalCooperatives: number;
    countriesActive: number;
  };
}

export function useMapData(filters: MapFilterState): UseMapDataResult {
  const [rawData, setRawData] = useState<MapDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Fetch data from Supabase ──────────────────────────────
  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();

    async function fetchAll() {
      setIsLoading(true);
      setError(null);

      try {
        const points: MapDataPoint[] = [];

        // 1. Farmer public profiles (demo data with coordinates)
        const { data: farmers } = await supabase
          .from('farmer_public_profiles')
          .select('id, slug, full_name, farm_name, primary_crop, health_score, farm_size_ha, stage, country, region, latitude, longitude')
          .not('latitude', 'is', null)
          .not('longitude', 'is', null);

        if (farmers) {
          for (const f of farmers) {
            points.push({
              id: f.id,
              type: 'farm',
              latitude: Number(f.latitude),
              longitude: Number(f.longitude),
              farmerName: f.full_name,
              farmName: f.farm_name,
              crop: f.primary_crop,
              healthScore: f.health_score,
              farmSize: f.farm_size_ha,
              stage: f.stage,
              country: f.country,
              region: f.region,
              slug: f.slug,
            });
          }
        }

        // 2. Farm plots joined with members
        const { data: plots } = await supabase
          .from('farm_plots')
          .select('id, name, crop_type, size_hectares, health_score, growth_stage, latitude, longitude, member_id, members(full_name, country)')
          .not('latitude', 'is', null)
          .not('longitude', 'is', null);

        if (plots) {
          for (const p of plots) {
            const member = Array.isArray(p.members) ? p.members[0] : p.members;
            points.push({
              id: p.id,
              type: 'farm',
              latitude: Number(p.latitude),
              longitude: Number(p.longitude),
              farmerName: member?.full_name,
              farmName: p.name,
              crop: p.crop_type,
              healthScore: p.health_score,
              farmSize: p.size_hectares,
              stage: p.growth_stage,
              country: member?.country,
            });
          }
        }

        // 3. Equipment
        const { data: equipment } = await supabase
          .from('equipment')
          .select('id, name, type, daily_rate, status, location, country, latitude, longitude')
          .not('latitude', 'is', null)
          .not('longitude', 'is', null);

        if (equipment) {
          for (const e of equipment) {
            points.push({
              id: e.id,
              type: 'equipment',
              latitude: Number(e.latitude),
              longitude: Number(e.longitude),
              equipmentName: e.name,
              equipmentType: e.type,
              dailyRate: e.daily_rate,
              equipmentStatus: e.status,
              country: e.country || e.location,
            });
          }
        }

        // 4. Cooperatives
        const { data: coops } = await supabase
          .from('cooperatives')
          .select('id, name, member_count, region, country, latitude, longitude')
          .not('latitude', 'is', null)
          .not('longitude', 'is', null);

        if (coops) {
          for (const c of coops) {
            points.push({
              id: c.id,
              type: 'cooperative',
              latitude: Number(c.latitude),
              longitude: Number(c.longitude),
              cooperativeName: c.name,
              memberCount: c.member_count,
              region: c.region,
              country: c.country,
            });
          }
        }

        // 5. Warehouses (only those with coordinates)
        try {
          const { data: warehouses } = await supabase
            .from('warehouses')
            .select('id, name, location, country, capacity_mt, current_stock_mt, latitude, longitude')
            .not('latitude', 'is', null)
            .not('longitude', 'is', null);
          if (warehouses) {
            for (const w of warehouses) {
              if (!w.latitude || !w.longitude) continue;
              points.push({
                id: w.id,
                type: 'warehouse' as any,
                latitude: Number(w.latitude),
                longitude: Number(w.longitude),
                warehouseName: w.name,
                location: w.location,
                country: w.country,
                capacity: w.capacity_mt,
                currentStock: w.current_stock_mt,
              } as any);
            }
          }
        } catch { /* warehouses table may not have lat/lng columns */ }

        // 6. Suppliers with location (only those with coordinates)
        try {
          const { data: suppliers } = await supabase
            .from('suppliers')
            .select('id, company_name, category, country, status, latitude, longitude')
            .eq('status', 'active')
            .not('latitude', 'is', null)
            .not('longitude', 'is', null)
            .limit(100);
          if (suppliers) {
            for (const s of suppliers) {
              if (!s.latitude || !s.longitude) continue;
              points.push({
                id: s.id,
                type: 'supplier' as any,
                latitude: Number(s.latitude), longitude: Number(s.longitude),
                supplierName: s.company_name,
                category: s.category,
                country: s.country,
              } as any);
            }
          }
        } catch { /* safe */ }

        if (!cancelled) {
          setRawData(points);
          if (points.length === 0) {
            setError('No location data found. Add GPS coordinates to farms, equipment, or cooperatives to see them on the map.');
          }
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Map data fetch error:', err);
          setError('Failed to load map data. Please try refreshing.');
          setRawData([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchAll();
    return () => {
      cancelled = true;
    };
  }, []);

  // ── Derived: available crops and countries ─────────────────
  const availableCrops = useMemo(() => {
    const crops = new Set<string>();
    for (const d of rawData) {
      if (d.crop) crops.add(d.crop);
    }
    return Array.from(crops).sort();
  }, [rawData]);

  const availableCountries = useMemo(() => {
    const countries = new Set<string>();
    for (const d of rawData) {
      if (d.country) countries.add(d.country);
    }
    return Array.from(countries).sort();
  }, [rawData]);

  // ── Apply client-side filters ─────────────────────────────
  const filteredData = useMemo(() => {
    return rawData.filter((point) => {
      // Country filter
      if (filters.country !== 'all' && point.country !== filters.country) return false;

      // Entity type filter
      if (filters.entityType !== 'all' && point.type !== filters.entityType) return false;

      // Crop filter (farms only)
      if (filters.crops.length > 0 && point.type === 'farm') {
        if (!point.crop || !filters.crops.includes(point.crop)) return false;
      }

      // Health status filter (farms only)
      if (point.type === 'farm') {
        const score = point.healthScore ?? 50;
        let status: 'green' | 'yellow' | 'red';
        if (score > 70) status = 'green';
        else if (score >= 40) status = 'yellow';
        else status = 'red';
        if (!filters.healthStatus.includes(status)) return false;
      }

      // Farm size filter (farms only)
      if (filters.farmSize !== 'all' && point.type === 'farm') {
        const size = point.farmSize ?? 0;
        if (filters.farmSize === 'small' && size >= 5) return false;
        if (filters.farmSize === 'medium' && (size < 5 || size > 20)) return false;
        if (filters.farmSize === 'large' && size <= 20) return false;
      }

      return true;
    });
  }, [rawData, filters]);

  // ── Stats ─────────────────────────────────────────────────
  const stats = useMemo(() => {
    const countries = new Set<string>();
    let farms = 0;
    let eq = 0;
    let coops = 0;

    for (const d of filteredData) {
      if (d.country) countries.add(d.country);
      if (d.type === 'farm') farms++;
      else if (d.type === 'equipment') eq++;
      else if (d.type === 'cooperative') coops++;
    }

    return {
      totalFarms: farms,
      totalEquipment: eq,
      totalCooperatives: coops,
      countriesActive: countries.size,
    };
  }, [filteredData]);

  return {
    data: rawData,
    filteredData,
    isLoading,
    error,
    availableCrops,
    availableCountries,
    stats,
  };
}
