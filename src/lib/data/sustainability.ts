// ---------------------------------------------------------------------------
// AFU Portal - Sustainability & Carbon Credits Mock Data
// Carbon credit marketplace, sustainability projects, and environmental metrics
// ---------------------------------------------------------------------------

export type CarbonCreditType =
  | 'agroforestry'
  | 'soil-carbon'
  | 'methane-reduction'
  | 'conservation-tillage'
  | 'biochar';

export type CreditStatus = 'verified' | 'pending' | 'retired' | 'listed';

export type ProjectType =
  | 'agroforestry'
  | 'soil-carbon'
  | 'methane-reduction'
  | 'conservation-tillage'
  | 'biochar'
  | 'water-conservation'
  | 'renewable-energy';

export type ProjectCountry = 'Botswana' | 'Zimbabwe' | 'Tanzania';

export type ProjectStatus = 'active' | 'completed' | 'planning';

export type MetricCategory = 'carbon' | 'water' | 'biodiversity' | 'soil' | 'energy';

export type MetricTrend = 'up' | 'down' | 'stable';

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface CarbonCredit {
  id: string;
  projectName: string;
  type: CarbonCreditType;
  credits: number; // tonnes CO2e
  status: CreditStatus;
  verificationBody: string;
  vintageYear: number;
  pricePerTonne: number;
  totalValue: number;
  issuanceDate: string;
  expiryDate: string;
  buyerName: string | null;
  description: string;
}

export interface SustainabilityProject {
  id: string;
  name: string;
  type: ProjectType;
  country: ProjectCountry;
  region: string;
  description: string;
  startDate: string;
  targetCredits: number;
  earnedCredits: number;
  participatingFarmers: number;
  hectaresCovered: number;
  status: ProjectStatus;
  milestones: { date: string; title: string; completed: boolean }[];
  image: string;
}

export interface SustainabilityMetric {
  id: string;
  category: MetricCategory;
  name: string;
  value: number;
  unit: string;
  trend: MetricTrend;
  changePercent: number;
  period: string;
}

export interface CarbonTransaction {
  id: string;
  date: string;
  type: 'purchase' | 'sale' | 'retirement' | 'issuance';
  creditId: string;
  projectName: string;
  tonnes: number;
  pricePerTonne: number;
  totalAmount: number;
  counterparty: string;
  status: 'completed' | 'pending' | 'cancelled';
  reference: string;
}

// ── Carbon Credits Data ───────────────────────────────────────────────────────

export const carbonCredits: CarbonCredit[] = [
  {
    id: 'CC-001',
    projectName: 'Chobe Agroforestry Initiative',
    type: 'agroforestry',
    credits: 450,
    status: 'verified',
    verificationBody: 'Verra (VCS)',
    vintageYear: 2025,
    pricePerTonne: 18.50,
    totalValue: 8325,
    issuanceDate: '2025-03-15',
    expiryDate: '2035-03-15',
    buyerName: null,
    description:
      'Carbon credits generated from the planting of over 12,000 indigenous and fruit trees across 300 hectares in the Chobe District. The project integrates agroforestry practices with smallholder farming, improving both carbon sequestration and farmer livelihoods.',
  },
  {
    id: 'CC-002',
    projectName: 'Makgadikgadi Soil Carbon Project',
    type: 'soil-carbon',
    credits: 280,
    status: 'verified',
    verificationBody: 'Gold Standard',
    vintageYear: 2025,
    pricePerTonne: 22.00,
    totalValue: 6160,
    issuanceDate: '2025-06-01',
    expiryDate: '2035-06-01',
    buyerName: null,
    description:
      'Regenerative agriculture practices implemented across farms in the Makgadikgadi region have significantly increased soil organic carbon. Cover cropping, composting, and reduced tillage have been key interventions.',
  },
  {
    id: 'CC-003',
    projectName: 'Eastern Highlands Methane Capture',
    type: 'methane-reduction',
    credits: 620,
    status: 'listed',
    verificationBody: 'Verra (VCS)',
    vintageYear: 2024,
    pricePerTonne: 15.75,
    totalValue: 9765,
    issuanceDate: '2024-09-20',
    expiryDate: '2034-09-20',
    buyerName: null,
    description:
      'Methane capture and biogas utilisation from dairy farming operations across the Eastern Highlands of Zimbabwe. Anaerobic digesters have been installed on 45 farms, converting methane emissions into clean cooking fuel.',
  },
  {
    id: 'CC-004',
    projectName: 'Serengeti Buffer Conservation Tillage',
    type: 'conservation-tillage',
    credits: 190,
    status: 'pending',
    verificationBody: 'Gold Standard',
    vintageYear: 2025,
    pricePerTonne: 14.25,
    totalValue: 2707.5,
    issuanceDate: '2025-11-01',
    expiryDate: '2035-11-01',
    buyerName: null,
    description:
      'Conservation tillage practices adopted by farming communities in the buffer zones around the Serengeti National Park. Minimal soil disturbance techniques are preserving soil carbon while maintaining crop yields.',
  },
  {
    id: 'CC-005',
    projectName: 'Okavango Delta Biochar Programme',
    type: 'biochar',
    credits: 340,
    status: 'verified',
    verificationBody: 'Puro.earth',
    vintageYear: 2024,
    pricePerTonne: 85.00,
    totalValue: 28900,
    issuanceDate: '2024-12-01',
    expiryDate: '2034-12-01',
    buyerName: null,
    description:
      'Production and application of biochar from agricultural waste in the Okavango Delta region. The biochar is produced using pyrolysis kilns and applied to farmland, permanently sequestering carbon while improving soil fertility.',
  },
  {
    id: 'CC-006',
    projectName: 'Chobe Agroforestry Initiative',
    type: 'agroforestry',
    credits: 200,
    status: 'retired',
    verificationBody: 'Verra (VCS)',
    vintageYear: 2023,
    pricePerTonne: 16.00,
    totalValue: 3200,
    issuanceDate: '2023-04-10',
    expiryDate: '2033-04-10',
    buyerName: 'GreenFuture Corp',
    description:
      'First vintage from the Chobe Agroforestry Initiative. These credits have been retired on behalf of GreenFuture Corp as part of their corporate carbon neutrality commitment.',
  },
  {
    id: 'CC-007',
    projectName: 'Kilimanjaro Shade-Grown Coffee Carbon',
    type: 'agroforestry',
    credits: 520,
    status: 'listed',
    verificationBody: 'Gold Standard',
    vintageYear: 2025,
    pricePerTonne: 24.50,
    totalValue: 12740,
    issuanceDate: '2025-01-15',
    expiryDate: '2035-01-15',
    buyerName: null,
    description:
      'Shade-grown coffee agroforestry systems on the slopes of Mount Kilimanjaro. Farmers have planted over 8,000 shade trees, creating a multi-layered canopy that sequesters carbon while producing premium specialty coffee.',
  },
  {
    id: 'CC-008',
    projectName: 'Masvingo Regenerative Ranching',
    type: 'soil-carbon',
    credits: 175,
    status: 'pending',
    verificationBody: 'Verra (VCS)',
    vintageYear: 2025,
    pricePerTonne: 19.00,
    totalValue: 3325,
    issuanceDate: '2025-08-01',
    expiryDate: '2035-08-01',
    buyerName: null,
    description:
      'Holistic planned grazing and regenerative ranching practices implemented across communal rangelands in the Masvingo province. Rotational grazing has improved grassland carbon stocks significantly.',
  },
  {
    id: 'CC-009',
    projectName: 'Tuli Block Conservation Tillage',
    type: 'conservation-tillage',
    credits: 310,
    status: 'verified',
    verificationBody: 'Gold Standard',
    vintageYear: 2024,
    pricePerTonne: 13.50,
    totalValue: 4185,
    issuanceDate: '2024-07-15',
    expiryDate: '2034-07-15',
    buyerName: null,
    description:
      'No-till and minimum tillage farming adopted across 420 hectares in the Tuli Block of Botswana. Crop residue retention and direct seeding methods have increased soil organic matter and reduced erosion.',
  },
  {
    id: 'CC-010',
    projectName: 'Eastern Highlands Methane Capture',
    type: 'methane-reduction',
    credits: 380,
    status: 'retired',
    verificationBody: 'Verra (VCS)',
    vintageYear: 2023,
    pricePerTonne: 14.00,
    totalValue: 5320,
    issuanceDate: '2023-11-01',
    expiryDate: '2033-11-01',
    buyerName: 'EcoVentures Ltd',
    description:
      'Second batch of credits from the Eastern Highlands methane capture project. Retired by EcoVentures Ltd as part of their supply chain decarbonisation programme.',
  },
  {
    id: 'CC-011',
    projectName: 'Dodoma Biochar Collective',
    type: 'biochar',
    credits: 150,
    status: 'listed',
    verificationBody: 'Puro.earth',
    vintageYear: 2025,
    pricePerTonne: 78.00,
    totalValue: 11700,
    issuanceDate: '2025-02-28',
    expiryDate: '2035-02-28',
    buyerName: null,
    description:
      'A collective of 60 smallholder farmers in the Dodoma region producing biochar from crop residues and applying it to their fields. The high-quality biochar provides durable carbon removal while boosting crop yields by up to 25%.',
  },
  {
    id: 'CC-012',
    projectName: 'Makgadikgadi Soil Carbon Project',
    type: 'soil-carbon',
    credits: 95,
    status: 'pending',
    verificationBody: 'Gold Standard',
    vintageYear: 2026,
    pricePerTonne: 23.50,
    totalValue: 2232.5,
    issuanceDate: '2026-01-15',
    expiryDate: '2036-01-15',
    buyerName: null,
    description:
      'Expansion phase of the Makgadikgadi Soil Carbon Project. Additional farms have been onboarded, introducing advanced composting techniques and perennial cover crop systems to build soil organic carbon.',
  },
];

// ── Sustainability Projects Data ──────────────────────────────────────────────

export const sustainabilityProjects: SustainabilityProject[] = [
  {
    id: 'SP-001',
    name: 'Chobe Agroforestry Initiative',
    type: 'agroforestry',
    country: 'Botswana',
    region: 'Chobe District',
    description:
      'A flagship agroforestry project integrating indigenous and fruit tree planting with smallholder crop farming. The project aims to sequester carbon, improve soil health, and diversify farmer income through fruit sales and timber products. Over 200 farmers have participated since inception.',
    startDate: '2023-01-15',
    targetCredits: 1200,
    earnedCredits: 650,
    participatingFarmers: 215,
    hectaresCovered: 480,
    status: 'active',
    milestones: [
      { date: '2023-01-15', title: 'Project launch & farmer registration', completed: true },
      { date: '2023-06-01', title: 'First 5,000 trees planted', completed: true },
      { date: '2024-01-20', title: 'Baseline carbon measurement completed', completed: true },
      { date: '2024-09-15', title: 'First credit issuance (200 tonnes)', completed: true },
      { date: '2025-03-15', title: 'Second credit issuance (450 tonnes)', completed: true },
      { date: '2025-12-01', title: 'Reach 10,000 trees milestone', completed: false },
      { date: '2026-06-01', title: 'Phase 2 expansion to new areas', completed: false },
    ],
    image: '/images/projects/agroforestry-chobe.jpg',
  },
  {
    id: 'SP-002',
    name: 'Makgadikgadi Soil Carbon Project',
    type: 'soil-carbon',
    country: 'Botswana',
    region: 'Central District',
    description:
      'Regenerative agriculture practices including cover cropping, composting, and reduced tillage are being implemented across farms near the Makgadikgadi salt pans. The project focuses on building soil organic carbon while improving water retention in this arid region.',
    startDate: '2024-03-01',
    targetCredits: 800,
    earnedCredits: 375,
    participatingFarmers: 128,
    hectaresCovered: 650,
    status: 'active',
    milestones: [
      { date: '2024-03-01', title: 'Project initiation & soil baseline testing', completed: true },
      { date: '2024-06-15', title: 'Cover crop seeds distributed to all farmers', completed: true },
      { date: '2024-12-01', title: 'First soil carbon measurements', completed: true },
      { date: '2025-06-01', title: 'Verification audit by Gold Standard', completed: true },
      { date: '2026-01-15', title: 'Phase 2 farmer onboarding', completed: false },
      { date: '2026-09-01', title: 'Target 600 tonnes verified', completed: false },
    ],
    image: '/images/projects/soil-carbon-makgadikgadi.jpg',
  },
  {
    id: 'SP-003',
    name: 'Eastern Highlands Methane Capture',
    type: 'methane-reduction',
    country: 'Zimbabwe',
    region: 'Manicaland Province',
    description:
      'Installation and operation of small-scale anaerobic digesters on dairy farms in the Eastern Highlands. The project captures methane from cattle manure and converts it to biogas for cooking and heating, replacing firewood and reducing deforestation pressure.',
    startDate: '2023-06-01',
    targetCredits: 1500,
    earnedCredits: 1000,
    participatingFarmers: 92,
    hectaresCovered: 320,
    status: 'active',
    milestones: [
      { date: '2023-06-01', title: 'Feasibility study completed', completed: true },
      { date: '2023-09-15', title: 'First 20 digesters installed', completed: true },
      { date: '2024-03-01', title: 'Methane monitoring systems operational', completed: true },
      { date: '2024-09-20', title: 'First credit issuance (620 tonnes)', completed: true },
      { date: '2025-04-01', title: 'Expansion to 45 farms completed', completed: true },
      { date: '2025-11-01', title: 'Second credit issuance (380 tonnes)', completed: true },
      { date: '2026-06-01', title: 'Target 1,500 tonnes milestone', completed: false },
    ],
    image: '/images/projects/methane-eastern-highlands.jpg',
  },
  {
    id: 'SP-004',
    name: 'Kilimanjaro Shade-Grown Coffee Carbon',
    type: 'agroforestry',
    country: 'Tanzania',
    region: 'Kilimanjaro Region',
    description:
      'Supporting coffee farmers on the slopes of Mount Kilimanjaro to adopt shade-grown practices by planting indigenous canopy trees. The multi-layered agroforestry system sequesters carbon, protects biodiversity, and produces premium specialty coffee.',
    startDate: '2024-01-01',
    targetCredits: 1000,
    earnedCredits: 520,
    participatingFarmers: 340,
    hectaresCovered: 560,
    status: 'active',
    milestones: [
      { date: '2024-01-01', title: 'Partnership with Kilimanjaro coffee cooperative', completed: true },
      { date: '2024-04-15', title: 'Shade tree nurseries established', completed: true },
      { date: '2024-08-01', title: '8,000 shade trees planted', completed: true },
      { date: '2025-01-15', title: 'First credit issuance (520 tonnes)', completed: true },
      { date: '2025-09-01', title: 'Premium coffee branding launched', completed: false },
      { date: '2026-03-01', title: 'Phase 2: additional 5,000 trees', completed: false },
    ],
    image: '/images/projects/coffee-kilimanjaro.jpg',
  },
  {
    id: 'SP-005',
    name: 'Okavango Delta Biochar Programme',
    type: 'biochar',
    country: 'Botswana',
    region: 'North-West District',
    description:
      'Converting agricultural waste into biochar using locally manufactured pyrolysis kilns. The biochar is applied to farmland, creating a permanent carbon sink while dramatically improving soil water retention and nutrient availability in the sandy soils near the Okavango Delta.',
    startDate: '2024-06-01',
    targetCredits: 600,
    earnedCredits: 340,
    participatingFarmers: 75,
    hectaresCovered: 180,
    status: 'active',
    milestones: [
      { date: '2024-06-01', title: 'Kiln manufacturing workshop completed', completed: true },
      { date: '2024-09-01', title: 'First 30 kilns distributed', completed: true },
      { date: '2024-12-01', title: 'First biochar credit verification', completed: true },
      { date: '2025-06-01', title: 'Scale to 75 farmers', completed: true },
      { date: '2026-01-01', title: 'Biochar quality certification', completed: false },
      { date: '2026-07-01', title: 'Commercial biochar sales launch', completed: false },
    ],
    image: '/images/projects/biochar-okavango.jpg',
  },
  {
    id: 'SP-006',
    name: 'Dodoma Water Conservation Initiative',
    type: 'water-conservation',
    country: 'Tanzania',
    region: 'Dodoma Region',
    description:
      'Implementing water-smart farming techniques including rainwater harvesting, drip irrigation, and mulching in the semi-arid Dodoma region. The project reduces water waste by over 40% and improves crop resilience to drought conditions.',
    startDate: '2025-01-01',
    targetCredits: 400,
    earnedCredits: 0,
    participatingFarmers: 156,
    hectaresCovered: 280,
    status: 'planning',
    milestones: [
      { date: '2025-01-01', title: 'Project design & community consultation', completed: true },
      { date: '2025-04-01', title: 'Water audit of participating farms', completed: true },
      { date: '2025-08-01', title: 'Rainwater harvesting systems installed', completed: false },
      { date: '2026-01-01', title: 'Drip irrigation rollout', completed: false },
      { date: '2026-06-01', title: 'First water savings measurement', completed: false },
      { date: '2027-01-01', title: 'Verification and credit issuance', completed: false },
    ],
    image: '/images/projects/water-dodoma.jpg',
  },
];

// ── Sustainability Metrics Data ───────────────────────────────────────────────

export const sustainabilityMetrics: SustainabilityMetric[] = [
  {
    id: 'SM-001',
    category: 'carbon',
    name: 'Total Carbon Offset',
    value: 2885,
    unit: 'tonnes CO2e',
    trend: 'up',
    changePercent: 24.5,
    period: 'Last 12 months',
  },
  {
    id: 'SM-002',
    category: 'water',
    name: 'Water Saved',
    value: 1245000,
    unit: 'litres',
    trend: 'up',
    changePercent: 18.2,
    period: 'Last 12 months',
  },
  {
    id: 'SM-003',
    category: 'biodiversity',
    name: 'Trees Planted',
    value: 21400,
    unit: 'trees',
    trend: 'up',
    changePercent: 35.8,
    period: 'Last 12 months',
  },
  {
    id: 'SM-004',
    category: 'soil',
    name: 'Soil Health Score',
    value: 78,
    unit: '/100',
    trend: 'up',
    changePercent: 8.3,
    period: 'vs previous assessment',
  },
  {
    id: 'SM-005',
    category: 'energy',
    name: 'Energy Savings',
    value: 42,
    unit: '%',
    trend: 'up',
    changePercent: 12.1,
    period: 'vs baseline year',
  },
  {
    id: 'SM-006',
    category: 'carbon',
    name: 'Carbon Intensity',
    value: 0.42,
    unit: 'tCO2e/hectare',
    trend: 'down',
    changePercent: 15.7,
    period: 'Last 12 months',
  },
  {
    id: 'SM-007',
    category: 'water',
    name: 'Water Use Efficiency',
    value: 72,
    unit: '%',
    trend: 'up',
    changePercent: 9.4,
    period: 'vs previous season',
  },
  {
    id: 'SM-008',
    category: 'biodiversity',
    name: 'Pollinator Species Count',
    value: 34,
    unit: 'species',
    trend: 'up',
    changePercent: 21.4,
    period: 'Annual survey',
  },
  {
    id: 'SM-009',
    category: 'soil',
    name: 'Soil Organic Carbon',
    value: 3.2,
    unit: '% SOC',
    trend: 'up',
    changePercent: 6.7,
    period: 'vs previous year',
  },
  {
    id: 'SM-010',
    category: 'energy',
    name: 'Renewable Energy Usage',
    value: 28,
    unit: '%',
    trend: 'up',
    changePercent: 45.0,
    period: 'vs baseline year',
  },
];

// ── Carbon Transactions Data ──────────────────────────────────────────────────

export const carbonTransactions: CarbonTransaction[] = [
  {
    id: 'TX-001',
    date: '2025-03-15',
    type: 'issuance',
    creditId: 'CC-001',
    projectName: 'Chobe Agroforestry Initiative',
    tonnes: 450,
    pricePerTonne: 18.50,
    totalAmount: 8325,
    counterparty: 'Verra (VCS)',
    status: 'completed',
    reference: 'VCS-2025-AFU-0451',
  },
  {
    id: 'TX-002',
    date: '2025-06-01',
    type: 'issuance',
    creditId: 'CC-002',
    projectName: 'Makgadikgadi Soil Carbon Project',
    tonnes: 280,
    pricePerTonne: 22.00,
    totalAmount: 6160,
    counterparty: 'Gold Standard',
    status: 'completed',
    reference: 'GS-2025-AFU-0128',
  },
  {
    id: 'TX-003',
    date: '2024-11-20',
    type: 'sale',
    creditId: 'CC-006',
    projectName: 'Chobe Agroforestry Initiative',
    tonnes: 200,
    pricePerTonne: 16.00,
    totalAmount: 3200,
    counterparty: 'GreenFuture Corp',
    status: 'completed',
    reference: 'SALE-2024-GFC-0042',
  },
  {
    id: 'TX-004',
    date: '2024-12-15',
    type: 'retirement',
    creditId: 'CC-006',
    projectName: 'Chobe Agroforestry Initiative',
    tonnes: 200,
    pricePerTonne: 16.00,
    totalAmount: 3200,
    counterparty: 'GreenFuture Corp',
    status: 'completed',
    reference: 'RET-2024-GFC-0042',
  },
  {
    id: 'TX-005',
    date: '2025-01-15',
    type: 'issuance',
    creditId: 'CC-007',
    projectName: 'Kilimanjaro Shade-Grown Coffee Carbon',
    tonnes: 520,
    pricePerTonne: 24.50,
    totalAmount: 12740,
    counterparty: 'Gold Standard',
    status: 'completed',
    reference: 'GS-2025-KCC-0077',
  },
  {
    id: 'TX-006',
    date: '2025-02-10',
    type: 'sale',
    creditId: 'CC-010',
    projectName: 'Eastern Highlands Methane Capture',
    tonnes: 380,
    pricePerTonne: 14.00,
    totalAmount: 5320,
    counterparty: 'EcoVentures Ltd',
    status: 'completed',
    reference: 'SALE-2025-EVL-0015',
  },
  {
    id: 'TX-007',
    date: '2025-02-28',
    type: 'retirement',
    creditId: 'CC-010',
    projectName: 'Eastern Highlands Methane Capture',
    tonnes: 380,
    pricePerTonne: 14.00,
    totalAmount: 5320,
    counterparty: 'EcoVentures Ltd',
    status: 'completed',
    reference: 'RET-2025-EVL-0015',
  },
  {
    id: 'TX-008',
    date: '2025-12-01',
    type: 'issuance',
    creditId: 'CC-005',
    projectName: 'Okavango Delta Biochar Programme',
    tonnes: 340,
    pricePerTonne: 85.00,
    totalAmount: 28900,
    counterparty: 'Puro.earth',
    status: 'completed',
    reference: 'PURO-2024-OKV-0340',
  },
  {
    id: 'TX-009',
    date: '2026-01-10',
    type: 'purchase',
    creditId: 'CC-011',
    projectName: 'Dodoma Biochar Collective',
    tonnes: 50,
    pricePerTonne: 78.00,
    totalAmount: 3900,
    counterparty: 'Dodoma Biochar Collective',
    status: 'pending',
    reference: 'PUR-2026-DBC-0011',
  },
  {
    id: 'TX-010',
    date: '2026-02-05',
    type: 'sale',
    creditId: 'CC-003',
    projectName: 'Eastern Highlands Methane Capture',
    tonnes: 100,
    pricePerTonne: 15.75,
    totalAmount: 1575,
    counterparty: 'CleanAir Partners',
    status: 'pending',
    reference: 'SALE-2026-CAP-0003',
  },
];

// ── Helper Functions ──────────────────────────────────────────────────────────

export function getCreditsByStatus(status: CreditStatus): CarbonCredit[] {
  return carbonCredits.filter((c) => c.status === status);
}

export function getTotalCredits(): number {
  return carbonCredits.reduce((sum, c) => sum + c.credits, 0);
}

export function getTotalPortfolioValue(): number {
  return carbonCredits.reduce((sum, c) => sum + c.totalValue, 0);
}

export function getVerifiedCredits(): number {
  return carbonCredits
    .filter((c) => c.status === 'verified')
    .reduce((sum, c) => sum + c.credits, 0);
}

export function getPendingCredits(): number {
  return carbonCredits
    .filter((c) => c.status === 'pending')
    .reduce((sum, c) => sum + c.credits, 0);
}

export function getMetricsByCategory(category: MetricCategory): SustainabilityMetric[] {
  return sustainabilityMetrics.filter((m) => m.category === category);
}

export function getActiveProjects(): SustainabilityProject[] {
  return sustainabilityProjects.filter((p) => p.status === 'active');
}

export function getProjectsByCountry(country: ProjectCountry): SustainabilityProject[] {
  return sustainabilityProjects.filter((p) => p.country === country);
}
