// ---------------------------------------------------------------------------
// Farm Data Models & Mock Data — Mkulima Hub (Farmer Portal)
// ---------------------------------------------------------------------------

export type CropStage = 'planning' | 'planted' | 'germinating' | 'vegetative' | 'flowering' | 'fruiting' | 'harvesting' | 'completed';
export type ActivityType = 'planting' | 'watering' | 'fertilizing' | 'spraying' | 'weeding' | 'harvesting' | 'scouting' | 'soil-test' | 'pruning' | 'other';
export type TransactionType = 'income' | 'expense';
export type TransactionCategory = 'seeds' | 'fertilizer' | 'pesticides' | 'labor' | 'equipment' | 'transport' | 'harvest-sale' | 'contract-payment' | 'subsidy' | 'other';
export type ScanResult = 'healthy' | 'moderate' | 'severe';
export type WeatherCondition = 'sunny' | 'partly-cloudy' | 'cloudy' | 'rainy' | 'stormy' | 'windy';

export interface FarmPlot {
  id: string;
  name: string;
  size: number; // hectares
  sizeUnit: 'hectares' | 'acres';
  crop: string;
  variety: string;
  stage: CropStage;
  plantingDate: string;
  expectedHarvest: string;
  daysToHarvest: number;
  progressPercent: number;
  healthScore: number; // 0-100
  lastActivity: string;
  activities: FarmActivity[];
  image: string;
  soilPH: number;
  location: string;
}

export interface FarmActivity {
  id: string;
  plotId: string;
  plotName: string;
  type: ActivityType;
  date: string;
  time: string;
  description: string;
  notes?: string;
  photo?: string;
  cost?: number;
  currency: string;
}

export interface FarmTransaction {
  id: string;
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  currency: string;
  date: string;
  description: string;
  plotId?: string;
  plotName?: string;
  buyer?: string;
  quantity?: number;
  unit?: string;
  pricePerUnit?: number;
}

export interface CropScan {
  id: string;
  plotId: string;
  plotName: string;
  date: string;
  image: string;
  diagnosis: string;
  healthScore: number;
  severity: ScanResult;
  confidence: number;
  affectedArea: number;
  recommendations: string[];
  treatments: { name: string; price: number; unit: string }[];
}

export interface WeatherDay {
  date: string;
  day: string;
  condition: WeatherCondition;
  tempHigh: number;
  tempLow: number;
  humidity: number;
  rainChance: number;
  windSpeed: number;
  advice: string;
}

export interface FarmTask {
  id: string;
  title: string;
  plotId?: string;
  plotName?: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  type: ActivityType;
}

export interface JournalEntry {
  id: string;
  date: string;
  time: string;
  type: ActivityType;
  plotId?: string;
  plotName?: string;
  title: string;
  description: string;
  photo?: string;
  mood?: 'great' | 'good' | 'okay' | 'concerned' | 'worried';
  weather?: WeatherCondition;
  cost?: number;
  currency?: string;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  type?: 'text' | 'image' | 'recommendation' | 'alert';
}

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

export const farmPlots: FarmPlot[] = [
  {
    id: 'PLT-001',
    name: 'Main Blueberry Field',
    size: 1.5,
    sizeUnit: 'hectares',
    crop: 'Blueberries',
    variety: 'Duke',
    stage: 'fruiting',
    plantingDate: '2025-09-15',
    expectedHarvest: '2026-04-10',
    daysToHarvest: 27,
    progressPercent: 78,
    healthScore: 92,
    lastActivity: '2026-03-12',
    activities: [],
    image: 'https://images.unsplash.com/photo-1498579809087-ef1e558fd1da?w=400&h=300&fit=crop',
    soilPH: 4.8,
    location: 'Plot A — North Field',
  },
  {
    id: 'PLT-002',
    name: 'Cassava Plot',
    size: 2.0,
    sizeUnit: 'hectares',
    crop: 'Cassava',
    variety: 'TMS 30572',
    stage: 'vegetative',
    plantingDate: '2025-12-01',
    expectedHarvest: '2026-09-30',
    daysToHarvest: 200,
    progressPercent: 35,
    healthScore: 78,
    lastActivity: '2026-03-10',
    activities: [],
    image: 'https://images.unsplash.com/photo-1590682680695-43b964a3ae17?w=400&h=300&fit=crop',
    soilPH: 6.2,
    location: 'Plot B — South Field',
  },
  {
    id: 'PLT-003',
    name: 'Sesame Strip',
    size: 0.8,
    sizeUnit: 'hectares',
    crop: 'Sesame',
    variety: 'S42 White',
    stage: 'flowering',
    plantingDate: '2025-11-20',
    expectedHarvest: '2026-04-25',
    daysToHarvest: 42,
    progressPercent: 65,
    healthScore: 85,
    lastActivity: '2026-03-11',
    activities: [],
    image: 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=400&h=300&fit=crop',
    soilPH: 6.8,
    location: 'Plot C — East Strip',
  },
  {
    id: 'PLT-004',
    name: 'Maize Field',
    size: 1.0,
    sizeUnit: 'hectares',
    crop: 'Maize',
    variety: 'SC 513',
    stage: 'planted',
    plantingDate: '2026-03-01',
    expectedHarvest: '2026-07-15',
    daysToHarvest: 123,
    progressPercent: 8,
    healthScore: 95,
    lastActivity: '2026-03-01',
    activities: [],
    image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=300&fit=crop',
    soilPH: 6.5,
    location: 'Plot D — West Field',
  },
];

export const farmActivities: FarmActivity[] = [
  { id: 'ACT-001', plotId: 'PLT-001', plotName: 'Main Blueberry Field', type: 'fertilizing', date: '2026-03-12', time: '07:30', description: 'Applied sulfur-based acidifier around drip lines', cost: 45, currency: 'USD' },
  { id: 'ACT-002', plotId: 'PLT-001', plotName: 'Main Blueberry Field', type: 'scouting', date: '2026-03-11', time: '06:00', description: 'Checked for aphid presence — minimal activity spotted on north rows', currency: 'USD' },
  { id: 'ACT-003', plotId: 'PLT-002', plotName: 'Cassava Plot', type: 'weeding', date: '2026-03-10', time: '08:00', description: 'Manual weeding between rows, 3 laborers for 4 hours', cost: 36, currency: 'USD' },
  { id: 'ACT-004', plotId: 'PLT-003', plotName: 'Sesame Strip', type: 'spraying', date: '2026-03-11', time: '16:00', description: 'Neem oil application for pest prevention', cost: 18, currency: 'USD' },
  { id: 'ACT-005', plotId: 'PLT-003', plotName: 'Sesame Strip', type: 'watering', date: '2026-03-09', time: '05:30', description: 'Drip irrigation — 2 hours cycle', currency: 'USD' },
  { id: 'ACT-006', plotId: 'PLT-001', plotName: 'Main Blueberry Field', type: 'pruning', date: '2026-03-08', time: '07:00', description: 'Light pruning on mature bushes to improve air circulation', currency: 'USD' },
  { id: 'ACT-007', plotId: 'PLT-004', plotName: 'Maize Field', type: 'planting', date: '2026-03-01', time: '06:00', description: 'Planted SC 513 variety, 75cm row spacing, 25cm plant spacing', cost: 85, currency: 'USD' },
  { id: 'ACT-008', plotId: 'PLT-002', plotName: 'Cassava Plot', type: 'fertilizing', date: '2026-03-05', time: '07:00', description: 'NPK 15-15-15 side dressing, 200kg per hectare', cost: 90, currency: 'USD' },
  { id: 'ACT-009', plotId: 'PLT-001', plotName: 'Main Blueberry Field', type: 'harvesting', date: '2026-03-07', time: '06:00', description: 'First pick — 120kg Grade A berries harvested', currency: 'USD' },
  { id: 'ACT-010', plotId: 'PLT-001', plotName: 'Main Blueberry Field', type: 'soil-test', date: '2026-03-03', time: '09:00', description: 'Soil pH test: 4.8 — optimal for blueberries', cost: 15, currency: 'USD' },
];

export const farmTransactions: FarmTransaction[] = [
  { id: 'TXN-001', type: 'income', category: 'harvest-sale', amount: 960, currency: 'USD', date: '2026-03-07', description: 'Blueberries 120kg @ $8/kg — FreshPack Exports', plotId: 'PLT-001', plotName: 'Main Blueberry Field', buyer: 'FreshPack Exports', quantity: 120, unit: 'kg', pricePerUnit: 8 },
  { id: 'TXN-002', type: 'income', category: 'contract-payment', amount: 500, currency: 'USD', date: '2026-03-01', description: 'Advance payment — March sesame delivery contract', plotId: 'PLT-003', plotName: 'Sesame Strip', buyer: 'SesaMe Trading' },
  { id: 'TXN-003', type: 'expense', category: 'fertilizer', amount: 45, currency: 'USD', date: '2026-03-12', description: 'Sulfur-based soil acidifier — 25kg bag', plotId: 'PLT-001', plotName: 'Main Blueberry Field' },
  { id: 'TXN-004', type: 'expense', category: 'labor', amount: 36, currency: 'USD', date: '2026-03-10', description: '3 laborers × 4 hours weeding @ $3/hr', plotId: 'PLT-002', plotName: 'Cassava Plot' },
  { id: 'TXN-005', type: 'expense', category: 'pesticides', amount: 18, currency: 'USD', date: '2026-03-11', description: 'Neem oil organic pesticide — 1 liter', plotId: 'PLT-003', plotName: 'Sesame Strip' },
  { id: 'TXN-006', type: 'expense', category: 'seeds', amount: 85, currency: 'USD', date: '2026-03-01', description: 'SC 513 maize seed — 10kg bag', plotId: 'PLT-004', plotName: 'Maize Field' },
  { id: 'TXN-007', type: 'expense', category: 'fertilizer', amount: 90, currency: 'USD', date: '2026-03-05', description: 'NPK 15-15-15 — 2 × 50kg bags', plotId: 'PLT-002', plotName: 'Cassava Plot' },
  { id: 'TXN-008', type: 'expense', category: 'equipment', amount: 15, currency: 'USD', date: '2026-03-03', description: 'Soil pH testing supplies', plotId: 'PLT-001', plotName: 'Main Blueberry Field' },
  { id: 'TXN-009', type: 'income', category: 'subsidy', amount: 200, currency: 'USD', date: '2026-02-28', description: 'AFU member input subsidy — Q1 2026' },
  { id: 'TXN-010', type: 'expense', category: 'transport', amount: 25, currency: 'USD', date: '2026-03-07', description: 'Transport blueberries to FreshPack collection point', plotId: 'PLT-001', plotName: 'Main Blueberry Field' },
  { id: 'TXN-011', type: 'income', category: 'harvest-sale', amount: 180, currency: 'USD', date: '2026-02-22', description: 'Cassava chips 300kg @ $0.60/kg — local market', plotId: 'PLT-002', plotName: 'Cassava Plot', buyer: 'Gaborone Market', quantity: 300, unit: 'kg', pricePerUnit: 0.6 },
  { id: 'TXN-012', type: 'expense', category: 'labor', amount: 48, currency: 'USD', date: '2026-02-20', description: '4 laborers × 4 hours harvesting cassava @ $3/hr', plotId: 'PLT-002', plotName: 'Cassava Plot' },
];

export const farmTasks: FarmTask[] = [
  { id: 'TSK-001', title: 'Harvest blueberries — Row 5-8', plotId: 'PLT-001', plotName: 'Main Blueberry Field', dueDate: '2026-03-15', priority: 'high', completed: false, type: 'harvesting' },
  { id: 'TSK-002', title: 'Apply foliar feed to sesame', plotId: 'PLT-003', plotName: 'Sesame Strip', dueDate: '2026-03-16', priority: 'medium', completed: false, type: 'fertilizing' },
  { id: 'TSK-003', title: 'Scout cassava for mosaic virus', plotId: 'PLT-002', plotName: 'Cassava Plot', dueDate: '2026-03-15', priority: 'high', completed: false, type: 'scouting' },
  { id: 'TSK-004', title: 'Irrigate maize field', plotId: 'PLT-004', plotName: 'Maize Field', dueDate: '2026-03-14', priority: 'medium', completed: false, type: 'watering' },
  { id: 'TSK-005', title: 'Check soil moisture sensors', plotId: 'PLT-001', plotName: 'Main Blueberry Field', dueDate: '2026-03-17', priority: 'low', completed: false, type: 'scouting' },
  { id: 'TSK-006', title: 'Weed between cassava rows', plotId: 'PLT-002', plotName: 'Cassava Plot', dueDate: '2026-03-18', priority: 'medium', completed: false, type: 'weeding' },
];

export const weatherForecast: WeatherDay[] = [
  { date: '2026-03-14', day: 'Today', condition: 'partly-cloudy', tempHigh: 31, tempLow: 18, humidity: 55, rainChance: 15, windSpeed: 12, advice: 'Good day for harvesting. Apply pesticides before noon.' },
  { date: '2026-03-15', day: 'Sun', condition: 'sunny', tempHigh: 33, tempLow: 19, humidity: 45, rainChance: 5, windSpeed: 8, advice: 'Hot day ahead. Ensure irrigation is running. Harvest early morning.' },
  { date: '2026-03-16', day: 'Mon', condition: 'partly-cloudy', tempHigh: 30, tempLow: 17, humidity: 60, rainChance: 25, windSpeed: 15, advice: 'Good conditions for foliar feeding.' },
  { date: '2026-03-17', day: 'Tue', condition: 'rainy', tempHigh: 26, tempLow: 16, humidity: 80, rainChance: 75, windSpeed: 20, advice: 'Rain expected. Do not spray. Check drainage channels.' },
  { date: '2026-03-18', day: 'Wed', condition: 'rainy', tempHigh: 24, tempLow: 15, humidity: 85, rainChance: 80, windSpeed: 18, advice: 'Continued rain. Monitor for waterlogging in cassava plot.' },
  { date: '2026-03-19', day: 'Thu', condition: 'cloudy', tempHigh: 27, tempLow: 16, humidity: 70, rainChance: 35, windSpeed: 14, advice: 'Clearing skies. Good day for scouting and weeding.' },
  { date: '2026-03-20', day: 'Fri', condition: 'sunny', tempHigh: 32, tempLow: 18, humidity: 50, rainChance: 10, windSpeed: 10, advice: 'Warm and dry. Resume normal spraying schedule.' },
];

export const cropScans: CropScan[] = [
  {
    id: 'SCN-001', plotId: 'PLT-001', plotName: 'Main Blueberry Field', date: '2026-03-11',
    image: 'https://images.unsplash.com/photo-1498579809087-ef1e558fd1da?w=400&h=300&fit=crop',
    diagnosis: 'Healthy — No Issues Detected', healthScore: 92, severity: 'healthy', confidence: 94, affectedArea: 0,
    recommendations: ['Continue current care regimen', 'Monitor soil pH weekly during fruiting', 'Maintain mulch layer around root zone'],
    treatments: [],
  },
  {
    id: 'SCN-002', plotId: 'PLT-002', plotName: 'Cassava Plot', date: '2026-03-10',
    image: 'https://images.unsplash.com/photo-1590682680695-43b964a3ae17?w=400&h=300&fit=crop',
    diagnosis: 'Possible Cassava Mosaic — Early Signs', healthScore: 72, severity: 'moderate', confidence: 78, affectedArea: 12,
    recommendations: ['Remove and destroy affected plants immediately', 'Apply Imidacloprid for whitefly control', 'Check neighboring plants within 3-meter radius', 'Consider resistant variety for next planting'],
    treatments: [{ name: 'Imidacloprid 200SL', price: 28, unit: 'per liter' }, { name: 'Neem Oil Organic', price: 18, unit: 'per liter' }],
  },
  {
    id: 'SCN-003', plotId: 'PLT-003', plotName: 'Sesame Strip', date: '2026-03-09',
    image: 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=400&h=300&fit=crop',
    diagnosis: 'Minor Leaf Spot (Cercospora)', healthScore: 82, severity: 'moderate', confidence: 85, affectedArea: 8,
    recommendations: ['Apply copper oxychloride fungicide', 'Improve spacing for air circulation', 'Avoid overhead irrigation'],
    treatments: [{ name: 'Copper Oxychloride', price: 22, unit: 'per kg' }],
  },
];

export const journalEntries: JournalEntry[] = [
  { id: 'JRN-001', date: '2026-03-12', time: '07:30', type: 'fertilizing', plotId: 'PLT-001', plotName: 'Main Blueberry Field', title: 'Applied acidifier', description: 'Spread sulfur-based acidifier around drip lines. Berries looking plump — 2 more weeks to peak harvest.', photo: 'https://images.unsplash.com/photo-1498579809087-ef1e558fd1da?w=400&h=300&fit=crop', mood: 'great', weather: 'sunny', cost: 45, currency: 'USD' },
  { id: 'JRN-002', date: '2026-03-11', time: '06:00', type: 'scouting', plotId: 'PLT-001', plotName: 'Main Blueberry Field', title: 'Morning scout — aphid check', description: 'Walked all 12 rows. Found minimal aphid activity on row 7. Will monitor closely. Neem oil sprayed as precaution.', mood: 'good', weather: 'partly-cloudy' },
  { id: 'JRN-003', date: '2026-03-10', time: '08:00', type: 'weeding', plotId: 'PLT-002', plotName: 'Cassava Plot', title: 'Weeding day', description: 'Hired 3 laborers to weed between cassava rows. Took 4 hours. Soil looking dry — need to irrigate soon.', mood: 'okay', weather: 'sunny', cost: 36, currency: 'USD' },
  { id: 'JRN-004', date: '2026-03-09', time: '05:30', type: 'watering', plotId: 'PLT-003', plotName: 'Sesame Strip', title: 'Early morning irrigation', description: 'Ran drip system for 2 hours. Sesame flowers opening beautifully. Should see pods forming within the week.', mood: 'great', weather: 'sunny' },
  { id: 'JRN-005', date: '2026-03-07', time: '06:00', type: 'harvesting', plotId: 'PLT-001', plotName: 'Main Blueberry Field', title: 'First harvest! 🎉', description: 'First pick of the season! 120kg Grade A berries. Sold immediately to FreshPack at $8/kg. Revenue: $960. Great start!', photo: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400&h=300&fit=crop', mood: 'great', weather: 'sunny' },
  { id: 'JRN-006', date: '2026-03-05', time: '07:00', type: 'fertilizing', plotId: 'PLT-002', plotName: 'Cassava Plot', title: 'NPK side dressing', description: 'Applied NPK 15-15-15 at 200kg/ha. Cassava stems growing strong but need to watch for mosaic symptoms.', mood: 'good', weather: 'cloudy', cost: 90, currency: 'USD' },
  { id: 'JRN-007', date: '2026-03-03', time: '09:00', type: 'soil-test', plotId: 'PLT-001', plotName: 'Main Blueberry Field', title: 'Soil pH check', description: 'Tested soil pH across 6 points. Average 4.8 — perfect for blueberries. No sulfur needed this month.', mood: 'great', weather: 'partly-cloudy', cost: 15, currency: 'USD' },
  { id: 'JRN-008', date: '2026-03-01', time: '06:00', type: 'planting', plotId: 'PLT-004', plotName: 'Maize Field', title: 'Planted maize!', description: 'Planted SC 513 variety. 75cm row spacing, 25cm between plants. Used 10kg seed for 1 hectare. Rain expected this week — perfect timing.', photo: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=300&fit=crop', mood: 'great', weather: 'cloudy', cost: 85, currency: 'USD' },
];

export const aiConversation: AIMessage[] = [
  { id: 'AI-001', role: 'assistant', content: 'Good morning! 🌱 I see your blueberries are 27 days from harvest. Rows 5-8 look ready for picking tomorrow. Would you like me to set a reminder?', timestamp: '2026-03-14T06:00:00', type: 'recommendation' },
  { id: 'AI-002', role: 'user', content: 'Yes please. Also when should I spray the sesame?', timestamp: '2026-03-14T06:01:00', type: 'text' },
  { id: 'AI-003', role: 'assistant', content: 'Reminder set for tomorrow 6:00 AM! 🔔\n\nFor your sesame — I recommend spraying copper oxychloride today before noon. Rain is expected on Tuesday so you want at least 24 hours of dry weather after application. The leaf spot I detected last week has not spread, which is good news.', timestamp: '2026-03-14T06:01:30', type: 'recommendation' },
  { id: 'AI-004', role: 'user', content: 'How much fertilizer do I need for the cassava?', timestamp: '2026-03-14T06:05:00', type: 'text' },
  { id: 'AI-005', role: 'assistant', content: 'For your 2-hectare cassava plot (TMS 30572 variety), I recommend:\n\n📊 **NPK 15-15-15**: 400kg total (200kg/ha)\n📊 **Urea top-dress**: 200kg total (100kg/ha) — apply at 8 weeks\n\nYou already applied the NPK on March 5. The urea top-dress is due around March 26. That will cost approximately $76 for the urea.\n\nShall I add this to your calendar?', timestamp: '2026-03-14T06:05:30', type: 'recommendation' },
];

// Helper: Calculate farm summary stats
export function getFarmSummary() {
  const totalIncome = farmTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = farmTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const profit = totalIncome - totalExpenses;
  const totalHectares = farmPlots.reduce((sum, p) => sum + p.size, 0);
  const avgHealthScore = Math.round(farmPlots.reduce((sum, p) => sum + p.healthScore, 0) / farmPlots.length);
  const pendingTasks = farmTasks.filter(t => !t.completed).length;
  const highPriorityTasks = farmTasks.filter(t => !t.completed && t.priority === 'high').length;

  return { totalIncome, totalExpenses, profit, totalHectares, avgHealthScore, pendingTasks, highPriorityTasks, plotCount: farmPlots.length };
}
