/**
 * Adapters: Convert Supabase DB rows → Mock UI types
 * Used during Phase 1D page rewiring to bridge live data into existing page components.
 * Pages import both the hook (live data) and mock data (fallback).
 */

import type { FarmPlotRow } from '@/lib/supabase/use-farm-plots';

// ─── Farm Plot Adapter ───────────────────────────────────────────────────────

const CROP_IMAGES: Record<string, string> = {
  blueberries: 'https://images.unsplash.com/photo-1498159332174-be5f8a9afc86?w=600&h=400&fit=crop',
  tomatoes: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=600&h=400&fit=crop',
  maize: 'https://images.unsplash.com/photo-1601004890684-d8573e10e7e7?w=600&h=400&fit=crop',
  cassava: 'https://images.unsplash.com/photo-1590682680695-43b964a3ae17?w=600&h=400&fit=crop',
  sesame: 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=600&h=400&fit=crop',
  sorghum: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&h=400&fit=crop',
  default: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&h=400&fit=crop',
};

function getCropImage(crop: string | null): string {
  if (!crop) return CROP_IMAGES.default;
  const key = crop.toLowerCase();
  for (const [k, v] of Object.entries(CROP_IMAGES)) {
    if (key.includes(k)) return v;
  }
  return CROP_IMAGES.default;
}

function computeProgress(stage: string): number {
  const stages = ['planning', 'planted', 'germinating', 'vegetative', 'flowering', 'fruiting', 'harvesting', 'completed'];
  const idx = stages.indexOf(stage);
  if (idx < 0) return 0;
  return Math.round((idx / (stages.length - 1)) * 100);
}

function computeDaysToHarvest(expectedHarvest: string | null): number {
  if (!expectedHarvest) return 0;
  const diff = new Date(expectedHarvest).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function adaptFarmPlot(row: FarmPlotRow) {
  return {
    id: row.id,
    name: row.name,
    size: row.size_ha || 0,
    sizeUnit: 'hectares' as const,
    crop: row.crop || 'Unknown',
    variety: row.variety || '',
    stage: row.stage as any,
    plantingDate: row.planting_date || '',
    expectedHarvest: row.expected_harvest || '',
    daysToHarvest: computeDaysToHarvest(row.expected_harvest),
    progressPercent: computeProgress(row.stage),
    healthScore: row.health_score,
    lastActivity: row.updated_at,
    activities: [],
    image: getCropImage(row.crop),
    soilPH: row.soil_ph || 6.5,
    location: row.location || '',
  };
}

// ─── Course Adapter ──────────────────────────────────────────────────────────

export function adaptCourse(row: any) {
  return {
    id: row.id,
    title: row.title || '',
    description: row.description || '',
    category: row.category || 'Farm Management',
    difficulty: row.difficulty || 'Beginner',
    duration: row.duration_minutes ? `${Math.round(row.duration_minutes / 60)} hours` : '2 hours',
    modules: row.modules_count || 0,
    instructor: row.instructor || 'AFU Instructor',
    rating: row.rating || 4.5,
    enrollmentCount: row.enrollment_count || 0,
    image: row.image_url || 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=300&fit=crop',
    completionRate: row.completion_rate || 0,
    topics: row.topics || [],
  };
}

// ─── Insurance Adapter ───────────────────────────────────────────────────────

export function adaptInsuranceProduct(row: any) {
  const coverage = row.coverage_details || {};
  const premium = row.premium_range || {};
  return {
    id: row.id,
    name: row.name || '',
    type: row.type || 'crop',
    description: row.description || '',
    coverageDetails: coverage.details || [],
    premiumRange: { min: premium.min || 0, max: premium.max || 0 },
    coverageRange: { min: coverage.min || 0, max: coverage.max || 0 },
    deductible: coverage.deductible || 10,
    waitingPeriod: coverage.waiting_period || '30 days',
    claimProcess: coverage.claim_process || 'Submit via portal',
    eligibility: coverage.eligibility || [],
    popular: row.popular || false,
    icon: row.icon || '🌾',
  };
}

// ─── Cooperative Adapter ─────────────────────────────────────────────────────

export function adaptCooperative(row: any) {
  return {
    id: row.id,
    name: row.name || '',
    type: 'mixed' as const,
    region: row.region || '',
    country: row.country || '',
    description: row.description || '',
    established: row.created_at ? new Date(row.created_at).getFullYear() : 2024,
    memberCount: row.member_count || 0,
    chairman: '',
    contactEmail: '',
    contactPhone: '',
    totalHectares: 0,
    mainCrops: [],
    annualRevenue: 0,
    certifications: [],
    logo: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=200&h=200&fit=crop',
    meetingSchedule: '',
    bankBalance: 0,
    status: 'active' as const,
  };
}

// ─── Contract Adapter ────────────────────────────────────────────────────────

export function adaptContract(row: any) {
  return {
    id: row.id,
    buyer: row.buyer_name || '',
    crop: row.commodity || '',
    volume: row.quantity || 0,
    volumeUnit: 'kg',
    pricePerKg: row.price_per_unit || 0,
    currency: 'USD',
    contractPeriod: { start: row.created_at || '', end: row.delivery_date || '' },
    deliveredVolume: 0,
    deliveredPercentage: 0,
    qualityGrade: 'A' as const,
    status: row.status || 'active',
    country: '',
    memberId: row.member_id || '',
    memberName: '',
    nextDeliveryDate: row.delivery_date || '',
    incoterm: '',
  };
}

// ─── Carbon Credit Adapter ───────────────────────────────────────────────────

export function adaptCarbonCredit(row: any) {
  return {
    id: row.id,
    projectType: row.project_type || '',
    creditsEarned: row.credits_earned || 0,
    verificationStatus: row.verification_status || 'pending',
    memberId: row.member_id || '',
    createdAt: row.created_at || '',
  };
}

// ─── Equipment Adapter ───────────────────────────────────────────────────────

export function adaptEquipment(row: any) {
  return {
    id: row.id,
    name: row.name || '',
    category: (row.type || 'tractor') as any,
    description: row.description || '',
    dailyRate: row.daily_rate || 0,
    weeklyRate: (row.daily_rate || 0) * 5,
    monthlyRate: (row.daily_rate || 0) * 22,
    image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&h=400&fit=crop',
    location: row.location || '',
    country: '',
    owner: row.owner_name || 'AFU Equipment Pool',
    rating: 4.5,
    reviewCount: 0,
    availability: row.status === 'available' ? 'available' as const : 'booked' as const,
    condition: 'good' as const,
    specs: {},
    deliveryAvailable: true,
    insuranceIncluded: false,
  };
}

// ─── Livestock Adapter ───────────────────────────────────────────────────────

export function adaptLivestock(row: any) {
  return {
    id: row.id,
    type: row.type || 'cattle',
    breed: row.breed || '',
    count: row.count || 0,
    healthStatus: row.health_status || 'healthy',
    location: row.location || '',
    valueEstimate: row.value_estimate || 0,
    memberId: row.member_id || '',
  };
}
