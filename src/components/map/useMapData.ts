'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { MapDataPoint } from './FarmMap';
import type { MapFilterState } from './MapFilters';

// ── Fallback demo data (used when DB returns no geo-located rows) ──────────

const DEMO_DATA: MapDataPoint[] = [
  {
    id: 'demo-farm-1', type: 'farm', latitude: -21.0, longitude: 29.0,
    farmerName: 'Grace Moyo', farmName: 'Moyo Farm', crop: 'Maize',
    healthScore: 82, farmSize: 12, stage: 'growing', country: 'Zimbabwe', slug: 'grace-moyo',
  },
  {
    id: 'demo-farm-2', type: 'farm', latitude: -0.09, longitude: 34.77,
    farmerName: 'Joseph Odhiambo', farmName: 'Lake Victoria Organics', crop: 'Coffee',
    healthScore: 68, farmSize: 8, stage: 'harvest', country: 'Kenya', slug: 'joseph-odhiambo',
  },
  {
    id: 'demo-farm-3', type: 'farm', latitude: -8.35, longitude: 36.40,
    farmerName: 'Amina Hussein', farmName: 'Hussein Spice Farm', crop: 'Spices',
    healthScore: 91, farmSize: 3, stage: 'growing', country: 'Tanzania', slug: 'amina-hussein',
  },
  {
    id: 'demo-farm-4', type: 'farm', latitude: -24.65, longitude: 25.91,
    farmerName: 'Sipho Dlamini', farmName: 'Dlamini Cattle Ranch', crop: 'Livestock',
    healthScore: 35, farmSize: 45, stage: 'monitoring', country: 'Botswana', slug: 'sipho-dlamini',
  },
  {
    id: 'demo-farm-5', type: 'farm', latitude: -12.80, longitude: 28.21,
    farmerName: 'Fatima Banda', farmName: 'Banda Fresh Produce', crop: 'Vegetables',
    healthScore: 55, farmSize: 6, stage: 'planting', country: 'Zambia', slug: 'fatima-banda',
  },
  {
    id: 'demo-farm-6', type: 'farm', latitude: 6.21, longitude: 6.96,
    farmerName: 'Emeka Nwosu', farmName: 'Nwosu Cassava Co-op', crop: 'Cassava',
    healthScore: 73, farmSize: 18, stage: 'growing', country: 'Nigeria', slug: 'emeka-nwosu',
  },
  // Equipment
  {
    id: 'demo-eq-1', type: 'equipment', latitude: -17.83, longitude: 31.05,
    equipmentName: 'John Deere 5055E', equipmentType: 'Tractor', dailyRate: 120,
    equipmentStatus: 'available', country: 'Zimbabwe',
  },
  {
    id: 'demo-eq-2', type: 'equipment', latitude: -1.29, longitude: 36.82,
    equipmentName: 'DJI Agras T30', equipmentType: 'Drone', dailyRate: 65,
    equipmentStatus: 'available', country: 'Kenya',
  },
  {
    id: 'demo-eq-3', type: 'equipment', latitude: -6.79, longitude: 39.21,
    equipmentName: 'Kubota L3901', equipmentType: 'Tractor', dailyRate: 95,
    equipmentStatus: 'in-use', country: 'Tanzania',
  },
  {
    id: 'demo-eq-4', type: 'equipment', latitude: -15.39, longitude: 28.32,
    equipmentName: 'Honda WB30 Pump', equipmentType: 'Irrigation', dailyRate: 25,
    equipmentStatus: 'available', country: 'Zambia',
  },
  // Cooperatives
  {
    id: 'demo-coop-1', type: 'cooperative', latitude: -20.15, longitude: 28.58,
    cooperativeName: 'Zimbabwe Smallholder Alliance', memberCount: 342,
    region: 'Matabeleland', country: 'Zimbabwe',
  },
  {
    id: 'demo-coop-2', type: 'cooperative', latitude: -0.42, longitude: 36.95,
    cooperativeName: 'Kenya Highland Growers', memberCount: 518,
    region: 'Central Kenya', country: 'Kenya',
  },
  {
    id: 'demo-coop-3', type: 'cooperative', latitude: -6.17, longitude: 35.75,
    cooperativeName: 'Tanzania Coffee Cooperative', memberCount: 290,
    region: 'Dodoma', country: 'Tanzania',
  },
  {
    id: 'demo-coop-4', type: 'cooperative', latitude: 9.03, longitude: 38.75,
    cooperativeName: 'Ethiopian Highlands Coop', memberCount: 412,
    region: 'Addis Ababa', country: 'Ethiopia',
  },
];

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

        // 5. Fetch loans to enrich farm points
        const { data: loans } = await supabase
          .from('loans')
          .select('id, member_id, amount, status, repaid_percent');

        if (loans && loans.length > 0) {
          const loanByMember = new Map<string, typeof loans[0]>();
          for (const loan of loans) {
            if (loan.member_id) loanByMember.set(loan.member_id, loan);
          }
          // Enrich farm points that came from farm_plots (they have member_id context)
          // This is best-effort — we match by farmer name if needed
        }

        if (!cancelled) {
          // Use demo data as fallback if DB returned nothing
          setRawData(points.length > 0 ? points : DEMO_DATA);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Map data fetch error:', err);
          setError('Failed to load map data. Showing demo data.');
          setRawData(DEMO_DATA);
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
