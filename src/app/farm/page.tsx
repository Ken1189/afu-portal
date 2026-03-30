'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sun,
  Cloud,
  CloudRain,
  CloudLightning,
  Wind,
  CloudSun,
  Camera,
  ChevronRight,
  Droplets,
  Check,
  Plus,
  TrendingUp,
  TrendingDown,
  Heart,
  Sparkles,
  ArrowRight,
  Leaf,
  Scissors,
  Bug,
  Shovel,
  FlaskConical,
  Sprout,
  Search,
  CircleDot,
  X,
} from 'lucide-react';
import { useFarmPlots, useFarmActivities, useFarmTransactions } from '@/lib/supabase/use-farm-plots';
import type { FarmPlotRow } from '@/lib/supabase/use-farm-plots';
import { useAuth } from '@/lib/supabase/auth-context';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { QuickStartCard } from '@/components/farm/QuickStartCard';

// ---------------------------------------------------------------------------
// Types (inlined from @/lib/data/farm)
// ---------------------------------------------------------------------------

type CropStage = 'planning' | 'planted' | 'germinating' | 'vegetative' | 'flowering' | 'fruiting' | 'harvesting' | 'completed';
type ActivityType = 'planting' | 'watering' | 'fertilizing' | 'spraying' | 'weeding' | 'harvesting' | 'scouting' | 'soil-test' | 'pruning' | 'other';
type WeatherCondition = 'sunny' | 'partly-cloudy' | 'cloudy' | 'rainy' | 'stormy' | 'windy';

interface FarmPlot {
  id: string;
  name: string;
  size: number;
  sizeUnit: 'hectares' | 'acres';
  crop: string;
  variety: string;
  stage: CropStage;
  plantingDate: string;
  expectedHarvest: string;
  daysToHarvest: number;
  progressPercent: number;
  healthScore: number;
  lastActivity: string;
  activities: FarmActivity[];
  image: string;
  soilPH: number;
  location: string;
}

interface FarmActivity {
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

interface FarmTransaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  currency: string;
  date: string;
  description: string;
}

interface FarmTask {
  id: string;
  title: string;
  plotId?: string;
  plotName?: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  type: ActivityType;
}

interface WeatherDay {
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

// ---------------------------------------------------------------------------
// Inline adaptFarmPlot (from @/lib/data/adapters)
// ---------------------------------------------------------------------------

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

function adaptFarmPlot(row: FarmPlotRow) {
  return {
    id: row.id,
    name: row.name,
    size: row.size_ha || 0,
    sizeUnit: 'hectares' as const,
    crop: row.crop || 'Unknown',
    variety: row.variety || '',
    stage: row.stage as CropStage,
    plantingDate: row.planting_date || '',
    expectedHarvest: row.expected_harvest || '',
    daysToHarvest: computeDaysToHarvest(row.expected_harvest),
    progressPercent: computeProgress(row.stage),
    healthScore: row.health_score,
    lastActivity: row.updated_at,
    activities: [] as FarmActivity[],
    image: getCropImage(row.crop),
    soilPH: row.soil_ph || 6.5,
    location: row.location || '',
  };
}

// ---------------------------------------------------------------------------
// Inline fallback data (from @/lib/data/farm)
// ---------------------------------------------------------------------------

const FALLBACK_FARM_PLOTS: FarmPlot[] = [
  { id: 'PLT-001', name: 'Main Blueberry Field', size: 1.5, sizeUnit: 'hectares', crop: 'Blueberries', variety: 'Duke', stage: 'fruiting', plantingDate: '2025-09-15', expectedHarvest: '2026-04-10', daysToHarvest: 27, progressPercent: 78, healthScore: 92, lastActivity: '2026-03-12', activities: [], image: 'https://images.unsplash.com/photo-1498579809087-ef1e558fd1da?w=400&h=300&fit=crop', soilPH: 4.8, location: 'Plot A \u2014 North Field' },
  { id: 'PLT-002', name: 'Cassava Plot', size: 2.0, sizeUnit: 'hectares', crop: 'Cassava', variety: 'TMS 30572', stage: 'vegetative', plantingDate: '2025-12-01', expectedHarvest: '2026-09-30', daysToHarvest: 200, progressPercent: 35, healthScore: 78, lastActivity: '2026-03-10', activities: [], image: 'https://images.unsplash.com/photo-1590682680695-43b964a3ae17?w=400&h=300&fit=crop', soilPH: 6.2, location: 'Plot B \u2014 South Field' },
  { id: 'PLT-003', name: 'Sesame Strip', size: 0.8, sizeUnit: 'hectares', crop: 'Sesame', variety: 'S42 White', stage: 'flowering', plantingDate: '2025-11-20', expectedHarvest: '2026-04-25', daysToHarvest: 42, progressPercent: 65, healthScore: 85, lastActivity: '2026-03-11', activities: [], image: 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=400&h=300&fit=crop', soilPH: 6.8, location: 'Plot C \u2014 East Strip' },
  { id: 'PLT-004', name: 'Maize Field', size: 1.0, sizeUnit: 'hectares', crop: 'Maize', variety: 'SC 513', stage: 'planted', plantingDate: '2026-03-01', expectedHarvest: '2026-07-15', daysToHarvest: 123, progressPercent: 8, healthScore: 95, lastActivity: '2026-03-01', activities: [], image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=300&fit=crop', soilPH: 6.5, location: 'Plot D \u2014 West Field' },
];

const FALLBACK_FARM_ACTIVITIES: FarmActivity[] = [
  { id: 'ACT-001', plotId: 'PLT-001', plotName: 'Main Blueberry Field', type: 'fertilizing', date: '2026-03-12', time: '07:30', description: 'Applied sulfur-based acidifier around drip lines', cost: 45, currency: 'USD' },
  { id: 'ACT-002', plotId: 'PLT-001', plotName: 'Main Blueberry Field', type: 'scouting', date: '2026-03-11', time: '06:00', description: 'Checked for aphid presence \u2014 minimal activity spotted on north rows', currency: 'USD' },
  { id: 'ACT-003', plotId: 'PLT-002', plotName: 'Cassava Plot', type: 'weeding', date: '2026-03-10', time: '08:00', description: 'Manual weeding between rows, 3 laborers for 4 hours', cost: 36, currency: 'USD' },
  { id: 'ACT-004', plotId: 'PLT-003', plotName: 'Sesame Strip', type: 'spraying', date: '2026-03-11', time: '16:00', description: 'Neem oil application for pest prevention', cost: 18, currency: 'USD' },
  { id: 'ACT-005', plotId: 'PLT-003', plotName: 'Sesame Strip', type: 'watering', date: '2026-03-09', time: '05:30', description: 'Drip irrigation \u2014 2 hours cycle', currency: 'USD' },
  { id: 'ACT-006', plotId: 'PLT-001', plotName: 'Main Blueberry Field', type: 'pruning', date: '2026-03-08', time: '07:00', description: 'Light pruning on mature bushes to improve air circulation', currency: 'USD' },
  { id: 'ACT-007', plotId: 'PLT-004', plotName: 'Maize Field', type: 'planting', date: '2026-03-01', time: '06:00', description: 'Planted SC 513 variety, 75cm row spacing, 25cm plant spacing', cost: 85, currency: 'USD' },
  { id: 'ACT-008', plotId: 'PLT-002', plotName: 'Cassava Plot', type: 'fertilizing', date: '2026-03-05', time: '07:00', description: 'NPK 15-15-15 side dressing, 200kg per hectare', cost: 90, currency: 'USD' },
  { id: 'ACT-009', plotId: 'PLT-001', plotName: 'Main Blueberry Field', type: 'harvesting', date: '2026-03-07', time: '06:00', description: 'First pick \u2014 120kg Grade A berries harvested', currency: 'USD' },
  { id: 'ACT-010', plotId: 'PLT-001', plotName: 'Main Blueberry Field', type: 'soil-test', date: '2026-03-03', time: '09:00', description: 'Soil pH test: 4.8 \u2014 optimal for blueberries', cost: 15, currency: 'USD' },
];

const initialFarmTasks: FarmTask[] = [
  { id: 'TSK-001', title: 'Harvest blueberries \u2014 Row 5-8', plotId: 'PLT-001', plotName: 'Main Blueberry Field', dueDate: '2026-03-15', priority: 'high', completed: false, type: 'harvesting' },
  { id: 'TSK-002', title: 'Apply foliar feed to sesame', plotId: 'PLT-003', plotName: 'Sesame Strip', dueDate: '2026-03-16', priority: 'medium', completed: false, type: 'fertilizing' },
  { id: 'TSK-003', title: 'Scout cassava for mosaic virus', plotId: 'PLT-002', plotName: 'Cassava Plot', dueDate: '2026-03-15', priority: 'high', completed: false, type: 'scouting' },
  { id: 'TSK-004', title: 'Irrigate maize field', plotId: 'PLT-004', plotName: 'Maize Field', dueDate: '2026-03-14', priority: 'medium', completed: false, type: 'watering' },
  { id: 'TSK-005', title: 'Check soil moisture sensors', plotId: 'PLT-001', plotName: 'Main Blueberry Field', dueDate: '2026-03-17', priority: 'low', completed: false, type: 'scouting' },
  { id: 'TSK-006', title: 'Weed between cassava rows', plotId: 'PLT-002', plotName: 'Cassava Plot', dueDate: '2026-03-18', priority: 'medium', completed: false, type: 'weeding' },
];

const weatherForecast: WeatherDay[] = [
  { date: '2026-03-14', day: 'Today', condition: 'partly-cloudy', tempHigh: 31, tempLow: 18, humidity: 55, rainChance: 15, windSpeed: 12, advice: 'Good day for harvesting. Apply pesticides before noon.' },
  { date: '2026-03-15', day: 'Sun', condition: 'sunny', tempHigh: 33, tempLow: 19, humidity: 45, rainChance: 5, windSpeed: 8, advice: 'Hot day ahead. Ensure irrigation is running. Harvest early morning.' },
  { date: '2026-03-16', day: 'Mon', condition: 'partly-cloudy', tempHigh: 30, tempLow: 17, humidity: 60, rainChance: 25, windSpeed: 15, advice: 'Good conditions for foliar feeding.' },
  { date: '2026-03-17', day: 'Tue', condition: 'rainy', tempHigh: 26, tempLow: 16, humidity: 80, rainChance: 75, windSpeed: 20, advice: 'Rain expected. Do not spray. Check drainage channels.' },
  { date: '2026-03-18', day: 'Wed', condition: 'rainy', tempHigh: 24, tempLow: 15, humidity: 85, rainChance: 80, windSpeed: 18, advice: 'Continued rain. Monitor for waterlogging in cassava plot.' },
  { date: '2026-03-19', day: 'Thu', condition: 'cloudy', tempHigh: 27, tempLow: 16, humidity: 70, rainChance: 35, windSpeed: 14, advice: 'Clearing skies. Good day for scouting and weeding.' },
  { date: '2026-03-20', day: 'Fri', condition: 'sunny', tempHigh: 32, tempLow: 18, humidity: 50, rainChance: 10, windSpeed: 10, advice: 'Warm and dry. Resume normal spraying schedule.' },
];

const FALLBACK_FARM_TRANSACTIONS: FarmTransaction[] = [
  { id: 'TXN-001', type: 'income', category: 'harvest-sale', amount: 960, currency: 'USD', date: '2026-03-07', description: 'Blueberries 120kg @ $8/kg' },
  { id: 'TXN-002', type: 'income', category: 'contract-payment', amount: 500, currency: 'USD', date: '2026-03-01', description: 'Advance payment' },
  { id: 'TXN-003', type: 'expense', category: 'fertilizer', amount: 45, currency: 'USD', date: '2026-03-12', description: 'Sulfur-based soil acidifier' },
  { id: 'TXN-004', type: 'expense', category: 'labor', amount: 36, currency: 'USD', date: '2026-03-10', description: 'Weeding labor' },
  { id: 'TXN-005', type: 'expense', category: 'pesticides', amount: 18, currency: 'USD', date: '2026-03-11', description: 'Neem oil' },
  { id: 'TXN-006', type: 'expense', category: 'seeds', amount: 85, currency: 'USD', date: '2026-03-01', description: 'Maize seed' },
  { id: 'TXN-007', type: 'expense', category: 'fertilizer', amount: 90, currency: 'USD', date: '2026-03-05', description: 'NPK fertilizer' },
  { id: 'TXN-008', type: 'expense', category: 'equipment', amount: 15, currency: 'USD', date: '2026-03-03', description: 'Soil pH testing' },
  { id: 'TXN-009', type: 'income', category: 'subsidy', amount: 200, currency: 'USD', date: '2026-02-28', description: 'AFU member input subsidy' },
  { id: 'TXN-010', type: 'expense', category: 'transport', amount: 25, currency: 'USD', date: '2026-03-07', description: 'Transport blueberries' },
  { id: 'TXN-011', type: 'income', category: 'harvest-sale', amount: 180, currency: 'USD', date: '2026-02-22', description: 'Cassava chips 300kg' },
  { id: 'TXN-012', type: 'expense', category: 'labor', amount: 48, currency: 'USD', date: '2026-02-20', description: 'Harvesting labor' },
];

function getFallbackFarmSummary() {
  const totalIncome = FALLBACK_FARM_TRANSACTIONS.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = FALLBACK_FARM_TRANSACTIONS.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const profit = totalIncome - totalExpenses;
  const totalHectares = FALLBACK_FARM_PLOTS.reduce((sum, p) => sum + p.size, 0);
  const avgHealthScore = Math.round(FALLBACK_FARM_PLOTS.reduce((sum, p) => sum + p.healthScore, 0) / FALLBACK_FARM_PLOTS.length);
  const pendingTasks = initialFarmTasks.filter(t => !t.completed).length;
  const highPriorityTasks = initialFarmTasks.filter(t => !t.completed && t.priority === 'high').length;
  return { totalIncome, totalExpenses, profit, totalHectares, avgHealthScore, pendingTasks, highPriorityTasks, plotCount: FALLBACK_FARM_PLOTS.length };
}

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      ease: 'easeOut' as const,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 260,
      damping: 24,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 260,
      damping: 22,
    },
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getGreeting(td: { goodMorning: string; goodAfternoon: string; goodEvening: string }): string {
  const hour = new Date().getHours();
  if (hour < 12) return td.goodMorning;
  if (hour < 17) return td.goodAfternoon;
  return td.goodEvening;
}

function formatDate(): string {
  return new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function getWeatherIcon(condition: WeatherCondition, size = 20) {
  const props = { size, strokeWidth: 2 };
  switch (condition) {
    case 'sunny':
      return <Sun {...props} className="text-amber-400" />;
    case 'partly-cloudy':
      return <CloudSun {...props} className="text-amber-300" />;
    case 'cloudy':
      return <Cloud {...props} className="text-gray-400" />;
    case 'rainy':
      return <CloudRain {...props} className="text-blue-400" />;
    case 'stormy':
      return <CloudLightning {...props} className="text-purple-500" />;
    case 'windy':
      return <Wind {...props} className="text-cyan-400" />;
    default:
      return <Sun {...props} className="text-amber-400" />;
  }
}

function getActivityIcon(type: ActivityType, size = 16) {
  const cls = 'shrink-0';
  switch (type) {
    case 'planting':
      return <Sprout size={size} className={`${cls} text-green-500`} />;
    case 'watering':
      return <Droplets size={size} className={`${cls} text-blue-400`} />;
    case 'fertilizing':
      return <FlaskConical size={size} className={`${cls} text-amber-500`} />;
    case 'spraying':
      return <Bug size={size} className={`${cls} text-red-400`} />;
    case 'weeding':
      return <Shovel size={size} className={`${cls} text-amber-600`} />;
    case 'harvesting':
      return <Leaf size={size} className={`${cls} text-green-600`} />;
    case 'scouting':
      return <Search size={size} className={`${cls} text-indigo-400`} />;
    case 'soil-test':
      return <CircleDot size={size} className={`${cls} text-orange-400`} />;
    case 'pruning':
      return <Scissors size={size} className={`${cls} text-[#5DB347]`} />;
    default:
      return <Leaf size={size} className={`${cls} text-gray-400`} />;
  }
}

function timeAgo(dateStr: string): string {
  const now = new Date('2026-03-14T12:00:00');
  const then = new Date(dateStr);
  const diffMs = now.getTime() - then.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays} days ago`;
}

const stageBadgeColor: Record<string, string> = {
  planning: 'bg-gray-100 text-gray-600',
  planted: 'bg-blue-50 text-blue-600',
  germinating: 'bg-lime-50 text-lime-600',
  vegetative: 'bg-green-50 text-green-700',
  flowering: 'bg-purple-50 text-purple-600',
  fruiting: 'bg-amber-50 text-amber-700',
  harvesting: 'bg-[#EBF7E5] text-[#449933]',
  completed: 'bg-gray-100 text-gray-500',
};

const priorityBadge: Record<string, { bg: string; dot: string; label: string }> = {
  high: { bg: 'bg-red-50 text-red-600', dot: 'bg-red-500', label: 'High' },
  medium: { bg: 'bg-amber-50 text-amber-600', dot: 'bg-amber-400', label: 'Med' },
  low: { bg: 'bg-green-50 text-green-600', dot: 'bg-green-400', label: 'Low' },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function FarmDashboardPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { plots: livePlots } = useFarmPlots(user?.id);
  const { activities: liveActivities } = useFarmActivities();
  const { transactions: liveTransactions, income: liveIncome, expenses: liveExpenses } = useFarmTransactions(user?.id);

  const farmPlots = livePlots.length > 0 ? livePlots.map(adaptFarmPlot) : FALLBACK_FARM_PLOTS;

  const farmActivities: FarmActivity[] = liveActivities.length > 0
    ? liveActivities.map((a) => ({
        id: a.id,
        plotId: a.plot_id || '',
        plotName: '',
        type: a.type as ActivityType,
        date: a.date,
        time: '',
        description: a.description || '',
        cost: a.cost || undefined,
        currency: a.currency || 'USD',
      }))
    : FALLBACK_FARM_ACTIVITIES;

  const summary = useMemo(() => {
    if (livePlots.length > 0 || liveTransactions.length > 0) {
      const totalHectares = farmPlots.reduce((sum, p) => sum + p.size, 0);
      const avgHealthScore = farmPlots.length
        ? Math.round(farmPlots.reduce((sum, p) => sum + p.healthScore, 0) / farmPlots.length)
        : 0;
      const pendingTasks = initialFarmTasks.filter(t => !t.completed).length;
      const highPriorityTasks = initialFarmTasks.filter(t => !t.completed && t.priority === 'high').length;
      return {
        totalIncome: liveIncome,
        totalExpenses: liveExpenses,
        profit: liveIncome - liveExpenses,
        totalHectares,
        avgHealthScore,
        pendingTasks,
        highPriorityTasks,
        plotCount: farmPlots.length,
      };
    }
    return getFallbackFarmSummary();
  }, [livePlots, liveTransactions, farmPlots, liveIncome, liveExpenses]);

  const today = weatherForecast[0];

  // Task completion state
  const [tasks, setTasks] = useState<FarmTask[]>(() =>
    [...initialFarmTasks].sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 };
      return order[a.priority] - order[b.priority];
    })
  );

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task))
    );
  };

  // Weather popup state
  const [selectedWeatherDay, setSelectedWeatherDay] = useState<number | null>(null);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-5 py-4"
    >
      {/* ================================================================= */}
      {/* 1. WELCOME BANNER                                                 */}
      {/* ================================================================= */}
      <motion.section variants={itemVariants} className="px-4">
        <div className="rounded-2xl bg-gradient-to-br from-navy to-navy-light p-4 text-white relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -top-8 -right-8 w-28 h-28 bg-white/5 rounded-full" />
          <div className="absolute -bottom-6 -right-4 w-20 h-20 bg-white/5 rounded-full" />

          <div className="relative z-10">
            <h2 className="text-lg font-bold leading-tight">
              {getGreeting(t.dashboard)}, Kgosi!
            </h2>
            <p className="text-xs text-white/70 mt-0.5">{formatDate()}</p>

            <div className="flex items-center gap-2 mt-3 text-sm text-white/90">
              {getWeatherIcon(today.condition, 18)}
              <span>
                {today.tempHigh}°/{today.tempLow}° &middot;{' '}
                {today.rainChance}% rain
              </span>
            </div>

            <Link
              href="/farm/doctor"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2.5 rounded-xl bg-white/15 active:bg-white/25 text-sm font-medium transition-colors min-h-[44px]"
            >
              <Camera size={16} />
              {t.dashboard.takePhoto}
            </Link>
          </div>
        </div>
      </motion.section>

      {/* ================================================================= */}
      {/* QUICK START CARD (shown for new farmers)                          */}
      {/* ================================================================= */}
      <motion.section variants={itemVariants}>
        <QuickStartCard />
      </motion.section>

      {/* ================================================================= */}
      {/* 2. WEATHER STRIP (7-day horizontal scroll)                        */}
      {/* ================================================================= */}
      <motion.section variants={itemVariants}>
        <div className="px-4 mb-2 flex items-center justify-between">
          <h3 className="text-sm font-bold text-navy">{t.dashboard.weatherForecast}</h3>
        </div>

        <div className="flex gap-2.5 overflow-x-auto px-4 pb-2 scrollbar-hide snap-x snap-mandatory">
          {weatherForecast.map((day, idx) => {
            const isToday = idx === 0;
            return (
              <button
                key={day.date}
                onClick={() =>
                  setSelectedWeatherDay(selectedWeatherDay === idx ? null : idx)
                }
                className={`shrink-0 snap-start flex flex-col items-center gap-1 px-3 py-2.5 rounded-2xl min-w-[68px] transition-all min-h-[44px] ${
                  isToday
                    ? 'bg-[#5DB347]/10 border-2 border-[#5DB347]'
                    : 'bg-white border border-gray-100'
                }`}
              >
                <span
                  className={`text-[11px] font-semibold ${
                    isToday ? 'text-[#5DB347]' : 'text-gray-500'
                  }`}
                >
                  {day.day}
                </span>
                {getWeatherIcon(day.condition, 22)}
                <span className="text-xs font-bold text-navy">
                  {day.tempHigh}°
                </span>
                <span className="text-[10px] text-gray-400">
                  {day.tempLow}°
                </span>
                {day.rainChance >= 30 && (
                  <div className="flex items-center gap-0.5">
                    <Droplets size={10} className="text-blue-400" />
                    <span className="text-[10px] text-blue-400 font-medium">
                      {day.rainChance}%
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Weather advice popup */}
        <AnimatePresence>
          {selectedWeatherDay !== null && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ type: 'spring' as const, stiffness: 300, damping: 28 }}
              className="mx-4 overflow-hidden"
            >
              <div className="mt-2 rounded-xl bg-[#5DB347]/5 border border-[#5DB347]/20 p-3 flex items-start gap-2">
                <Sparkles size={14} className="text-[#5DB347] shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-[#5DB347] mb-0.5">
                    {weatherForecast[selectedWeatherDay].day} &mdash; Advice
                  </p>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {weatherForecast[selectedWeatherDay].advice}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedWeatherDay(null)}
                  className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full active:bg-[#5DB347]/10 transition-colors"
                >
                  <X size={14} className="text-gray-400" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>

      {/* ================================================================= */}
      {/* 3. MY PLOTS (horizontal scroll cards)                             */}
      {/* ================================================================= */}
      <motion.section variants={itemVariants}>
        <div className="px-4 mb-2 flex items-center justify-between">
          <h3 className="text-sm font-bold text-navy">{t.dashboard.myPlots}</h3>
          <Link
            href="/farm/crops"
            className="text-xs text-[#5DB347] font-medium flex items-center gap-0.5"
          >
            {t.common.viewAll} <ChevronRight size={14} />
          </Link>
        </div>

        <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide snap-x snap-mandatory">
          {farmPlots.map((plot) => (
            <Link
              key={plot.id}
              href="/farm/crops"
              className="shrink-0 snap-start w-[240px] rounded-2xl bg-white border border-gray-100 overflow-hidden active:scale-[0.98] transition-transform"
            >
              {/* Crop image */}
              <div className="relative h-[110px] w-full">
                <Image
                  src={plot.image}
                  alt={plot.crop}
                  fill
                  className="object-cover"
                  sizes="240px"
                />
                {/* Health score circle */}
                <div className="absolute top-2 right-2 w-10 h-10 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-sm">
                  <span
                    className={`text-xs font-bold ${
                      plot.healthScore >= 85
                        ? 'text-green-600'
                        : plot.healthScore >= 70
                          ? 'text-amber-600'
                          : 'text-red-500'
                    }`}
                  >
                    {plot.healthScore}
                  </span>
                </div>
                {/* Stage badge */}
                <div className="absolute bottom-2 left-2">
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                      stageBadgeColor[plot.stage] || 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {plot.stage}
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="p-3">
                <p className="text-sm font-bold text-navy leading-tight">
                  {plot.crop}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {plot.variety} &middot; {plot.size} ha
                </p>

                {/* Progress bar */}
                <div className="mt-2.5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-gray-400">Progress</span>
                    <span className="text-[10px] font-semibold text-navy">
                      {plot.progressPercent}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#5DB347] transition-all"
                      style={{ width: `${plot.progressPercent}%` }}
                    />
                  </div>
                </div>

                <p className="text-[11px] text-gray-500 mt-2 flex items-center gap-1">
                  <Leaf size={11} className="text-[#5DB347]" />
                  {plot.daysToHarvest} {t.dashboard.daysToHarvest}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </motion.section>

      {/* ================================================================= */}
      {/* 4. TODAY'S TASKS                                                  */}
      {/* ================================================================= */}
      <motion.section variants={itemVariants} className="px-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-bold text-navy">
            {t.dashboard.todaysTasks}{' '}
            <span className="text-xs font-normal text-gray-400">
              ({tasks.filter((task) => !task.completed).length} pending)
            </span>
          </h3>
        </div>

        <div className="rounded-2xl bg-white border border-gray-100 divide-y divide-gray-50 overflow-hidden">
          {tasks.map((task) => {
            const badge = priorityBadge[task.priority];
            return (
              <motion.div
                key={task.id}
                layout
                className={`flex items-start gap-3 p-3 min-h-[44px] transition-colors ${
                  task.completed ? 'bg-gray-50/50' : ''
                }`}
              >
                {/* Checkbox — padded touch area */}
                <button
                  onClick={() => toggleTask(task.id)}
                  className="shrink-0 p-1.5 -m-1.5 touch-target flex items-center justify-center"
                >
                  <span className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                    task.completed
                      ? 'bg-[#5DB347] border-[#5DB347]'
                      : 'border-gray-200 active:border-[#5DB347]'
                  }`}>
                    {task.completed && <Check size={14} className="text-white" />}
                  </span>
                </button>

                {/* Task details */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm leading-tight ${
                      task.completed
                        ? 'text-gray-400 line-through'
                        : 'text-navy font-medium'
                    }`}
                  >
                    {task.title}
                  </p>
                  {task.plotName && (
                    <p className="text-[11px] text-gray-400 mt-0.5 truncate">
                      {task.plotName}
                    </p>
                  )}
                </div>

                {/* Priority badge */}
                <span
                  className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${badge.bg}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                  {task.priority === 'high' ? t.dashboard.high : task.priority === 'medium' ? t.dashboard.medium : t.dashboard.low}
                </span>
              </motion.div>
            );
          })}

          {/* Add task button */}
          <Link
            href="/farm/journal"
            className="flex items-center justify-center gap-2 p-3 text-sm text-[#5DB347] font-medium active:bg-[#5DB347]/5 transition-colors min-h-[44px]"
          >
            <Plus size={16} />
            {t.dashboard.addTask}
          </Link>
        </div>
      </motion.section>

      {/* ================================================================= */}
      {/* 5. QUICK STATS ROW                                                */}
      {/* ================================================================= */}
      <motion.section variants={itemVariants} className="px-4">
        <h3 className="text-sm font-bold text-navy mb-2">{t.dashboard.quickStats}</h3>
        <div className="grid grid-cols-2 gap-2.5">
          {/* Income */}
          <motion.div
            variants={cardVariants}
            className="rounded-2xl bg-white border border-gray-100 p-3"
          >
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center">
                <TrendingUp size={14} className="text-green-600" />
              </div>
              <span className="text-[11px] text-gray-400 truncate">{t.dashboard.totalIncome}</span>
            </div>
            <p className="text-lg font-bold text-green-600">
              ${summary.totalIncome.toLocaleString()}
            </p>
          </motion.div>

          {/* Expenses */}
          <motion.div
            variants={cardVariants}
            className="rounded-2xl bg-white border border-gray-100 p-3"
          >
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center">
                <TrendingDown size={14} className="text-red-500" />
              </div>
              <span className="text-[11px] text-gray-400 truncate">{t.dashboard.totalExpenses}</span>
            </div>
            <p className="text-lg font-bold text-red-500">
              ${summary.totalExpenses.toLocaleString()}
            </p>
          </motion.div>

          {/* Profit */}
          <motion.div
            variants={cardVariants}
            className="rounded-2xl bg-white border border-gray-100 p-3"
          >
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg bg-[#EBF7E5] flex items-center justify-center">
                <TrendingUp size={14} className="text-[#5DB347]" />
              </div>
              <span className="text-[11px] text-gray-400 truncate">{t.dashboard.profit}</span>
            </div>
            <p className="text-lg font-bold text-[#5DB347]">
              ${summary.profit.toLocaleString()}
            </p>
          </motion.div>

          {/* Health Score */}
          <motion.div
            variants={cardVariants}
            className="rounded-2xl bg-white border border-gray-100 p-3"
          >
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
                <Heart size={14} className="text-gold" />
              </div>
              <span className="text-[11px] text-gray-400 truncate">{t.dashboard.healthScore}</span>
            </div>
            <p className="text-lg font-bold text-gold">
              {summary.avgHealthScore}
              <span className="text-xs font-normal text-gray-400">/100</span>
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* ================================================================= */}
      {/* 6. RECENT ACTIVITY                                                */}
      {/* ================================================================= */}
      <motion.section variants={itemVariants} className="px-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-bold text-navy">{t.dashboard.recentActivity}</h3>
          <Link
            href="/farm/journal"
            className="text-xs text-[#5DB347] font-medium flex items-center gap-0.5"
          >
            {t.common.viewAll} <ChevronRight size={14} />
          </Link>
        </div>

        <div className="rounded-2xl bg-white border border-gray-100 divide-y divide-gray-50 overflow-hidden">
          {farmActivities.slice(0, 5).map((activity) => (
            <div
              key={activity.id}
              className="flex items-center gap-3 p-3 min-h-[44px]"
            >
              <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                {getActivityIcon(activity.type, 15)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-navy font-medium leading-tight truncate">
                  {activity.description}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {activity.plotName} &middot; {timeAgo(activity.date)}
                </p>
              </div>
              {activity.cost != null && activity.cost > 0 && (
                <span className="text-[11px] font-semibold text-red-400 shrink-0">
                  -${activity.cost}
                </span>
              )}
            </div>
          ))}
        </div>
      </motion.section>

      {/* ================================================================= */}
      {/* 7. AI TIP OF THE DAY                                              */}
      {/* ================================================================= */}
      <motion.section variants={itemVariants} className="px-4 pb-2">
        <div className="rounded-2xl bg-gradient-to-br from-[#5DB347] to-[#449933] p-4 text-white relative overflow-hidden">
          {/* Decorative */}
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full" />
          <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/5 rounded-full" />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={16} className="text-gold" />
              <span className="text-xs font-bold text-white/80 uppercase tracking-wide">
                {t.dashboard.aiTip}
              </span>
            </div>
            <p className="text-sm leading-relaxed text-white/95">
              {today.advice}
            </p>
            <Link
              href="/farm/assistant"
              className="inline-flex items-center gap-2 mt-3 px-4 py-2.5 rounded-xl bg-white/15 active:bg-white/25 text-sm font-medium transition-colors min-h-[44px]"
            >
              {t.dashboard.askAI}
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
}
