// AFU Portal - Insurance Mock Data
// Crop, livestock, and equipment insurance for smallholder farmers

export type InsuranceType = 'crop' | 'livestock' | 'equipment' | 'weather-index';
export type PolicyStatus = 'active' | 'expired' | 'pending' | 'cancelled';
export type ClaimStatus = 'submitted' | 'under-review' | 'approved' | 'rejected' | 'paid';

export interface InsuranceProduct {
  id: string;
  name: string;
  type: InsuranceType;
  description: string;
  coverageDetails: string[];
  premiumRange: { min: number; max: number };
  coverageRange: { min: number; max: number };
  deductible: number; // percentage
  waitingPeriod: string;
  claimProcess: string;
  eligibility: string[];
  popular: boolean;
  icon: string; // emoji
}

export interface InsurancePolicy {
  id: string;
  productId: string;
  productName: string;
  type: InsuranceType;
  status: PolicyStatus;
  startDate: string;
  endDate: string;
  premiumAmount: number;
  premiumFrequency: 'monthly' | 'quarterly' | 'annual';
  nextPremiumDue: string;
  coverageAmount: number;
  deductible: number;
  coveredItems: string[];
  claimsCount: number;
  lastClaimDate: string | null;
}

export interface InsuranceClaim {
  id: string;
  policyId: string;
  policyName: string;
  type: InsuranceType;
  status: ClaimStatus;
  submittedDate: string;
  incidentDate: string;
  description: string;
  estimatedLoss: number;
  approvedAmount: number | null;
  paidDate: string | null;
  photos: number;
  timeline: { date: string; status: string; note: string }[];
}

// ── Insurance Products ──────────────────────────────────────────────────────

export const insuranceProducts: InsuranceProduct[] = [
  {
    id: 'INS-PROD-001',
    name: 'Crop Shield Basic',
    type: 'crop',
    description: 'Essential crop protection against drought, flood, and pest damage. Ideal for smallholder farmers growing staple crops.',
    coverageDetails: [
      'Drought damage (rainfall below 60% of average)',
      'Flood damage (waterlogging > 72 hours)',
      'Pest infestation (verified by agronomist)',
      'Hail damage',
      'Fire (accidental)',
    ],
    premiumRange: { min: 15, max: 45 },
    coverageRange: { min: 500, max: 5000 },
    deductible: 10,
    waitingPeriod: '14 days after enrollment',
    claimProcess: 'Submit photos + agronomist verification within 7 days of incident',
    eligibility: [
      'AFU member in good standing',
      'Farm size 0.5 - 20 hectares',
      'Crops registered on platform',
    ],
    popular: true,
    icon: '🌾',
  },
  {
    id: 'INS-PROD-002',
    name: 'Crop Shield Premium',
    type: 'crop',
    description: 'Comprehensive crop coverage with higher limits and additional perils including market price drops and disease.',
    coverageDetails: [
      'All Basic plan coverage',
      'Crop disease (verified diagnosis)',
      'Market price decline (> 30% drop)',
      'Input loss (seed/fertilizer spoilage)',
      'Replanting costs',
      'Revenue guarantee up to 80%',
    ],
    premiumRange: { min: 35, max: 90 },
    coverageRange: { min: 2000, max: 15000 },
    deductible: 5,
    waitingPeriod: '7 days after enrollment',
    claimProcess: 'Submit photos + AFU field officer visit within 14 days',
    eligibility: [
      'AFU member for 6+ months',
      'Complete KYC verification',
      'Active crop tracking on platform',
    ],
    popular: false,
    icon: '🛡️',
  },
  {
    id: 'INS-PROD-003',
    name: 'Livestock Guardian',
    type: 'livestock',
    description: 'Protect your livestock investment against disease, theft, and natural disasters. Covers cattle, goats, sheep, and poultry.',
    coverageDetails: [
      'Disease-related death (verified by vet)',
      'Theft (with police report)',
      'Natural disaster (flood, drought stress)',
      'Predator attack',
      'Accidental injury',
      'Emergency veterinary costs',
    ],
    premiumRange: { min: 20, max: 80 },
    coverageRange: { min: 300, max: 10000 },
    deductible: 15,
    waitingPeriod: '21 days after enrollment',
    claimProcess: 'Vet report + photos within 48 hours of incident',
    eligibility: [
      'AFU member in good standing',
      'Livestock registered with ear tags/photos',
      'Vaccination records up to date',
    ],
    popular: true,
    icon: '🐄',
  },
  {
    id: 'INS-PROD-004',
    name: 'Equipment Protect',
    type: 'equipment',
    description: 'Insurance for farming equipment and machinery against breakdowns, theft, and damage. Covers owned and rented equipment.',
    coverageDetails: [
      'Mechanical breakdown',
      'Theft (with police report)',
      'Fire and lightning damage',
      'Flood damage',
      'Vandalism',
      'Transit damage (during transport)',
    ],
    premiumRange: { min: 25, max: 120 },
    coverageRange: { min: 500, max: 25000 },
    deductible: 10,
    waitingPeriod: '7 days after enrollment',
    claimProcess: 'Photos + repair estimate from authorized mechanic',
    eligibility: [
      'AFU member in good standing',
      'Equipment registered on platform',
      'Equipment value verified',
    ],
    popular: false,
    icon: '🚜',
  },
  {
    id: 'INS-PROD-005',
    name: 'Weather Index',
    type: 'weather-index',
    description: 'Automatic payouts based on satellite weather data. No claims process needed — payments trigger automatically when conditions are met.',
    coverageDetails: [
      'Rainfall deficit (< 70% of 10-year average)',
      'Excess rainfall (> 150% of average)',
      'Temperature extremes (> 40°C or < 5°C for 3+ days)',
      'Automatic satellite monitoring',
      'No claims paperwork required',
      'Payout within 14 days of trigger',
    ],
    premiumRange: { min: 10, max: 35 },
    coverageRange: { min: 200, max: 3000 },
    deductible: 0,
    waitingPeriod: 'Coverage starts at planting date',
    claimProcess: 'Automatic — no claims needed. Satellite data triggers payout.',
    eligibility: [
      'AFU member in good standing',
      'Farm GPS coordinates registered',
      'Active for current growing season',
    ],
    popular: true,
    icon: '🌦️',
  },
  {
    id: 'INS-PROD-006',
    name: 'Comprehensive Farm Shield',
    type: 'crop',
    description: 'All-in-one protection combining crop, livestock, and equipment coverage at a bundled discount. Best value for diversified farms.',
    coverageDetails: [
      'Full Crop Shield Premium coverage',
      'Full Livestock Guardian coverage',
      'Basic Equipment Protect coverage',
      '15% bundle discount on premiums',
      'Priority claims processing',
      'Dedicated claims officer',
    ],
    premiumRange: { min: 60, max: 200 },
    coverageRange: { min: 5000, max: 50000 },
    deductible: 5,
    waitingPeriod: '7 days after enrollment',
    claimProcess: 'Priority processing — dedicated officer assigned within 24 hours',
    eligibility: [
      'AFU member for 12+ months',
      'Complete KYC verification',
      'Min 2 hectares farm size',
      'Active crop + livestock records',
    ],
    popular: false,
    icon: '⭐',
  },
];

// ── Active Policies (for the logged-in farmer) ──────────────────────────────

export const insurancePolicies: InsurancePolicy[] = [
  {
    id: 'POL-001',
    productId: 'INS-PROD-001',
    productName: 'Crop Shield Basic',
    type: 'crop',
    status: 'active',
    startDate: '2025-10-01',
    endDate: '2026-09-30',
    premiumAmount: 28,
    premiumFrequency: 'monthly',
    nextPremiumDue: '2026-04-01',
    coverageAmount: 3500,
    deductible: 10,
    coveredItems: ['Maize (Plot A - 2.1 ha)', 'Groundnuts (Plot B - 1.5 ha)'],
    claimsCount: 1,
    lastClaimDate: '2026-01-15',
  },
  {
    id: 'POL-002',
    productId: 'INS-PROD-003',
    productName: 'Livestock Guardian',
    type: 'livestock',
    status: 'active',
    startDate: '2025-11-15',
    endDate: '2026-11-14',
    premiumAmount: 45,
    premiumFrequency: 'monthly',
    nextPremiumDue: '2026-04-15',
    coverageAmount: 6000,
    deductible: 15,
    coveredItems: ['Cattle (12 head)', 'Goats (8 head)'],
    claimsCount: 0,
    lastClaimDate: null,
  },
  {
    id: 'POL-003',
    productId: 'INS-PROD-005',
    productName: 'Weather Index',
    type: 'weather-index',
    status: 'active',
    startDate: '2025-12-01',
    endDate: '2026-05-31',
    premiumAmount: 18,
    premiumFrequency: 'monthly',
    nextPremiumDue: '2026-04-01',
    coverageAmount: 1500,
    deductible: 0,
    coveredItems: ['All registered plots (3.6 ha total)'],
    claimsCount: 1,
    lastClaimDate: '2026-02-10',
  },
  {
    id: 'POL-004',
    productId: 'INS-PROD-004',
    productName: 'Equipment Protect',
    type: 'equipment',
    status: 'expired',
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    premiumAmount: 35,
    premiumFrequency: 'quarterly',
    nextPremiumDue: '2026-01-01',
    coverageAmount: 4500,
    deductible: 10,
    coveredItems: ['Water pump (Honda WB30)', 'Maize sheller (manual)'],
    claimsCount: 1,
    lastClaimDate: '2025-08-20',
  },
  {
    id: 'POL-005',
    productId: 'INS-PROD-002',
    productName: 'Crop Shield Premium',
    type: 'crop',
    status: 'pending',
    startDate: '2026-04-01',
    endDate: '2027-03-31',
    premiumAmount: 55,
    premiumFrequency: 'monthly',
    nextPremiumDue: '2026-04-01',
    coverageAmount: 8000,
    deductible: 5,
    coveredItems: ['Soya Beans (Plot C - 1.8 ha)', 'Sunflower (Plot D - 0.9 ha)'],
    claimsCount: 0,
    lastClaimDate: null,
  },
];

// ── Claims History ──────────────────────────────────────────────────────────

export const insuranceClaims: InsuranceClaim[] = [
  {
    id: 'CLM-001',
    policyId: 'POL-001',
    policyName: 'Crop Shield Basic',
    type: 'crop',
    status: 'paid',
    submittedDate: '2026-01-15',
    incidentDate: '2026-01-12',
    description: 'Severe drought in January affected maize crop on Plot A. Rainfall recorded at 42% of average. Estimated 60% yield loss on 2.1 hectares.',
    estimatedLoss: 2100,
    approvedAmount: 1890,
    paidDate: '2026-02-05',
    photos: 4,
    timeline: [
      { date: '2026-01-15', status: 'Submitted', note: 'Claim submitted with 4 photos and weather station data' },
      { date: '2026-01-17', status: 'Under Review', note: 'Assigned to claims officer Grace Nkomo' },
      { date: '2026-01-22', status: 'Field Visit', note: 'Agronomist field inspection completed — confirmed drought damage' },
      { date: '2026-01-28', status: 'Approved', note: 'Claim approved for $1,890 (90% of estimated loss minus deductible)' },
      { date: '2026-02-05', status: 'Paid', note: 'Payment of $1,890 sent via EcoCash to registered mobile wallet' },
    ],
  },
  {
    id: 'CLM-002',
    policyId: 'POL-003',
    policyName: 'Weather Index',
    type: 'weather-index',
    status: 'paid',
    submittedDate: '2026-02-10',
    incidentDate: '2026-02-10',
    description: 'Automatic trigger: February rainfall at 58% of 10-year average. Weather index payout for all registered plots.',
    estimatedLoss: 750,
    approvedAmount: 750,
    paidDate: '2026-02-24',
    photos: 0,
    timeline: [
      { date: '2026-02-10', status: 'Auto-Triggered', note: 'Satellite data confirmed rainfall deficit (58% of average)' },
      { date: '2026-02-12', status: 'Processing', note: 'Automatic payout calculation: $750 based on coverage parameters' },
      { date: '2026-02-24', status: 'Paid', note: 'Automatic payment of $750 sent to registered account' },
    ],
  },
  {
    id: 'CLM-003',
    policyId: 'POL-004',
    policyName: 'Equipment Protect',
    type: 'equipment',
    status: 'paid',
    submittedDate: '2025-08-20',
    incidentDate: '2025-08-18',
    description: 'Water pump (Honda WB30) mechanical failure during irrigation. Motor seized due to bearing failure. Repair quote from authorized Honda dealer.',
    estimatedLoss: 850,
    approvedAmount: 765,
    paidDate: '2025-09-10',
    photos: 3,
    timeline: [
      { date: '2025-08-20', status: 'Submitted', note: 'Claim submitted with repair quote and 3 photos' },
      { date: '2025-08-23', status: 'Under Review', note: 'Quote verified with authorized Honda dealer' },
      { date: '2025-09-01', status: 'Approved', note: 'Claim approved for $765 (90% after deductible)' },
      { date: '2025-09-10', status: 'Paid', note: 'Payment sent via bank transfer' },
    ],
  },
  {
    id: 'CLM-004',
    policyId: 'POL-001',
    policyName: 'Crop Shield Basic',
    type: 'crop',
    status: 'under-review',
    submittedDate: '2026-03-10',
    incidentDate: '2026-03-08',
    description: 'Pest infestation (fall armyworm) detected on groundnut field (Plot B). Approximately 35% of crop affected across 1.5 hectares.',
    estimatedLoss: 980,
    approvedAmount: null,
    paidDate: null,
    photos: 6,
    timeline: [
      { date: '2026-03-10', status: 'Submitted', note: 'Claim submitted with 6 photos showing armyworm damage' },
      { date: '2026-03-12', status: 'Under Review', note: 'Assigned to claims officer — field visit scheduled for March 18' },
    ],
  },
  {
    id: 'CLM-005',
    policyId: 'POL-002',
    policyName: 'Livestock Guardian',
    type: 'livestock',
    status: 'submitted',
    submittedDate: '2026-03-14',
    incidentDate: '2026-03-13',
    description: 'Two goats lost to suspected predator attack (wild dogs) overnight. Found evidence of attack near northern boundary fence.',
    estimatedLoss: 450,
    approvedAmount: null,
    paidDate: null,
    photos: 3,
    timeline: [
      { date: '2026-03-14', status: 'Submitted', note: 'Claim submitted with photos and incident report' },
    ],
  },
  {
    id: 'CLM-006',
    policyId: 'POL-001',
    policyName: 'Crop Shield Basic',
    type: 'crop',
    status: 'rejected',
    submittedDate: '2025-11-05',
    incidentDate: '2025-10-28',
    description: 'Claim for crop damage due to late planting. Maize planted 6 weeks after recommended window resulted in poor germination.',
    estimatedLoss: 600,
    approvedAmount: null,
    paidDate: null,
    photos: 2,
    timeline: [
      { date: '2025-11-05', status: 'Submitted', note: 'Claim submitted citing poor germination' },
      { date: '2025-11-08', status: 'Under Review', note: 'Claims officer reviewing planting records' },
      { date: '2025-11-15', status: 'Rejected', note: 'Claim rejected — late planting is not a covered peril. Damage resulted from farmer action, not an insured event.' },
    ],
  },
  {
    id: 'CLM-007',
    policyId: 'POL-003',
    policyName: 'Weather Index',
    type: 'weather-index',
    status: 'approved',
    submittedDate: '2026-03-15',
    incidentDate: '2026-03-15',
    description: 'Automatic trigger: March rainfall tracking at 65% of average (below 70% threshold). Payout processing.',
    estimatedLoss: 500,
    approvedAmount: 500,
    paidDate: null,
    photos: 0,
    timeline: [
      { date: '2026-03-15', status: 'Auto-Triggered', note: 'Satellite data confirmed March rainfall deficit (65% of average)' },
      { date: '2026-03-16', status: 'Approved', note: 'Automatic payout of $500 approved — processing payment' },
    ],
  },
  {
    id: 'CLM-008',
    policyId: 'POL-002',
    policyName: 'Livestock Guardian',
    type: 'livestock',
    status: 'paid',
    submittedDate: '2025-12-20',
    incidentDate: '2025-12-18',
    description: 'One cow died from suspected tick-borne disease (East Coast Fever). Vet report confirming diagnosis attached.',
    estimatedLoss: 800,
    approvedAmount: 680,
    paidDate: '2026-01-08',
    photos: 2,
    timeline: [
      { date: '2025-12-20', status: 'Submitted', note: 'Claim submitted with vet report and photos' },
      { date: '2025-12-23', status: 'Under Review', note: 'Vet report being verified' },
      { date: '2025-12-30', status: 'Approved', note: 'Claim approved for $680 (85% after deductible)' },
      { date: '2026-01-08', status: 'Paid', note: 'Payment sent via EcoCash' },
    ],
  },
];
