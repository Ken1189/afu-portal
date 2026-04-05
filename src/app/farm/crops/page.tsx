'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Sprout,
  Droplets,
  FlaskConical,
  SprayCan,
  Scissors,
  Wheat,
  Search,
  TestTube,
  MoreHorizontal,
  MapPin,
  Calendar,
  ChevronRight,
  X,
  Camera,
  History,
  ClipboardPlus,
  Leaf,
  Timer,
  Beaker,
  Ruler,
  CircleDot,
  Check,
  Loader2,
} from 'lucide-react';
import { useFarmPlots, useCreateFarmPlot, useUpdateFarmPlot, useCreateFarmActivity, type FarmPlotRow } from '@/lib/supabase/use-farm-plots';
import { useFarmActivities } from '@/lib/supabase/use-farm-activities';
import { useAuth } from '@/lib/supabase/auth-context';
import { useLanguage } from '@/lib/i18n/LanguageContext';

// ---------------------------------------------------------------------------
// Inlined types & data (previously from @/lib/data/farm & @/lib/data/adapters)
// ---------------------------------------------------------------------------

type CropStage = 'planning' | 'planted' | 'germinating' | 'vegetative' | 'flowering' | 'fruiting' | 'harvesting' | 'completed';
type ActivityType = 'planting' | 'watering' | 'fertilizing' | 'spraying' | 'weeding' | 'harvesting' | 'scouting' | 'soil-test' | 'pruning' | 'other';

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

const FALLBACK_FARM_PLOTS: FarmPlot[] = [
  { id: 'PLT-001', name: 'Main Blueberry Field', size: 1.5, sizeUnit: 'hectares', crop: 'Blueberries', variety: 'Duke', stage: 'fruiting', plantingDate: '2025-09-15', expectedHarvest: '2026-04-10', daysToHarvest: 27, progressPercent: 78, healthScore: 92, lastActivity: '2026-03-12', activities: [], image: 'https://images.unsplash.com/photo-1498579809087-ef1e558fd1da?w=400&h=300&fit=crop', soilPH: 4.8, location: 'Plot A — North Field' },
  { id: 'PLT-002', name: 'Cassava Plot', size: 2.0, sizeUnit: 'hectares', crop: 'Cassava', variety: 'TMS 30572', stage: 'vegetative', plantingDate: '2025-12-01', expectedHarvest: '2026-09-30', daysToHarvest: 200, progressPercent: 35, healthScore: 78, lastActivity: '2026-03-10', activities: [], image: 'https://images.unsplash.com/photo-1590682680695-43b964a3ae17?w=400&h=300&fit=crop', soilPH: 6.2, location: 'Plot B — South Field' },
  { id: 'PLT-003', name: 'Sesame Strip', size: 0.8, sizeUnit: 'hectares', crop: 'Sesame', variety: 'S42 White', stage: 'flowering', plantingDate: '2025-11-20', expectedHarvest: '2026-04-25', daysToHarvest: 42, progressPercent: 65, healthScore: 85, lastActivity: '2026-03-11', activities: [], image: 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=400&h=300&fit=crop', soilPH: 6.8, location: 'Plot C — East Strip' },
  { id: 'PLT-004', name: 'Maize Field', size: 1.0, sizeUnit: 'hectares', crop: 'Maize', variety: 'SC 513', stage: 'planted', plantingDate: '2026-03-01', expectedHarvest: '2026-07-15', daysToHarvest: 123, progressPercent: 8, healthScore: 95, lastActivity: '2026-03-01', activities: [], image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=300&fit=crop', soilPH: 6.5, location: 'Plot D — West Field' },
];

const FALLBACK_FARM_ACTIVITIES: FarmActivity[] = [
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

function getFarmSummary() {
  const farmTransactions = [
    { type: 'income', amount: 960 }, { type: 'income', amount: 500 }, { type: 'expense', amount: 45 },
    { type: 'expense', amount: 36 }, { type: 'expense', amount: 18 }, { type: 'expense', amount: 85 },
    { type: 'expense', amount: 90 }, { type: 'expense', amount: 15 }, { type: 'income', amount: 200 },
    { type: 'expense', amount: 25 }, { type: 'income', amount: 180 }, { type: 'expense', amount: 48 },
  ];
  const totalIncome = farmTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = farmTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const profit = totalIncome - totalExpenses;
  const totalHectares = FALLBACK_FARM_PLOTS.reduce((sum, p) => sum + p.size, 0);
  const avgHealthScore = Math.round(FALLBACK_FARM_PLOTS.reduce((sum, p) => sum + p.healthScore, 0) / FALLBACK_FARM_PLOTS.length);
  return { totalIncome, totalExpenses, profit, totalHectares, avgHealthScore, pendingTasks: 6, highPriorityTasks: 2, plotCount: FALLBACK_FARM_PLOTS.length };
}

// ─── adaptFarmPlot (inlined from @/lib/data/adapters) ─────────────────────

const CROP_IMAGES: Record<string, string> = {
  blueberries: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600&h=400&fit=crop',
  tomatoes: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=600&h=400&fit=crop',
  maize: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600&h=400&fit=crop',
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

// ─── Constants ───────────────────────────────────────────────────────────────

const ALL_STAGES: CropStage[] = [
  'planning',
  'planted',
  'germinating',
  'vegetative',
  'flowering',
  'fruiting',
  'harvesting',
  'completed',
];

const STAGE_LABELS: Record<CropStage, string> = {
  planning: 'Planning',
  planted: 'Planted',
  germinating: 'Germinating',
  vegetative: 'Vegetative',
  flowering: 'Flowering',
  fruiting: 'Fruiting',
  harvesting: 'Harvesting',
  completed: 'Completed',
};

const STAGE_BADGE_STYLES: Record<CropStage, string> = {
  planning: 'bg-gray-500/90 text-white',
  planted: 'bg-blue-500/90 text-white',
  germinating: 'bg-blue-400/90 text-white',
  vegetative: 'bg-amber-500/90 text-white',
  flowering: 'bg-amber-400/90 text-white',
  fruiting: 'bg-green-500/90 text-white',
  harvesting: 'bg-green-600/90 text-white',
  completed: 'bg-gray-600/90 text-white',
};

const ACTIVITY_ICONS: Record<ActivityType, React.ComponentType<{ className?: string }>> = {
  planting: Sprout,
  watering: Droplets,
  fertilizing: FlaskConical,
  spraying: SprayCan,
  weeding: Scissors,
  harvesting: Wheat,
  scouting: Search,
  'soil-test': TestTube,
  pruning: Scissors,
  other: MoreHorizontal,
};

const ACTIVITY_LABELS: Record<ActivityType, string> = {
  planting: 'Planting',
  watering: 'Watering',
  fertilizing: 'Fertilizing',
  spraying: 'Spraying',
  weeding: 'Weeding',
  harvesting: 'Harvesting',
  scouting: 'Scouting',
  'soil-test': 'Soil Test',
  pruning: 'Pruning',
  other: 'Other',
};

const ACTIVITY_COLORS: Record<ActivityType, string> = {
  planting: 'bg-green-100 text-green-700',
  watering: 'bg-blue-100 text-blue-700',
  fertilizing: 'bg-purple-100 text-purple-700',
  spraying: 'bg-orange-100 text-orange-700',
  weeding: 'bg-yellow-100 text-yellow-700',
  harvesting: 'bg-amber-100 text-amber-700',
  scouting: 'bg-[#EBF7E5] text-[#449933]',
  'soil-test': 'bg-rose-100 text-rose-700',
  pruning: 'bg-lime-100 text-lime-700',
  other: 'bg-gray-100 text-gray-700',
};

const ALL_ACTIVITY_TYPES: ActivityType[] = [
  'planting',
  'watering',
  'fertilizing',
  'spraying',
  'weeding',
  'harvesting',
  'scouting',
  'soil-test',
  'pruning',
  'other',
];

// ─── Animation Variants ──────────────────────────────────────────────────────

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 260, damping: 24 },
  },
};

const expandVariants = {
  collapsed: {
    height: 0,
    opacity: 0,
    transition: {
      height: { duration: 0.3, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] },
      opacity: { duration: 0.2 },
    },
  },
  expanded: {
    height: 'auto' as const,
    opacity: 1,
    transition: {
      height: { duration: 0.3, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] },
      opacity: { duration: 0.25, delay: 0.1 },
    },
  },
};

const modalOverlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalContentVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 300, damping: 25 },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: { duration: 0.15 },
  },
};

const fabVariants = {
  rest: { scale: 1 },
  hover: { scale: 1.08 },
  tap: { scale: 0.95 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getHealthColor(score: number): string {
  if (score > 80) return 'text-green-500';
  if (score >= 60) return 'text-amber-500';
  return 'text-red-500';
}

function getHealthBg(score: number): string {
  if (score > 80) return 'bg-green-500';
  if (score >= 60) return 'bg-amber-500';
  return 'bg-red-500';
}

function getProgressColor(stage: CropStage): string {
  if (stage === 'fruiting' || stage === 'harvesting') return 'bg-green-500';
  if (stage === 'planted' || stage === 'germinating') return 'bg-blue-500';
  if (stage === 'vegetative' || stage === 'flowering') return 'bg-amber-500';
  return 'bg-gray-400';
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

// ─── Component: Summary Bar ──────────────────────────────────────────────────

function SummaryBar() {
  const { t } = useLanguage();
  const summary = getFarmSummary();
  return (
    <div className="px-4 pt-4 pb-2">
      <div className="flex items-center gap-3 bg-white rounded-2xl p-3 shadow-sm border border-gray-100">
        <div className="flex-1 text-center">
          <p className="text-lg font-bold text-navy">{summary.totalHectares}</p>
          <p className="text-[11px] text-gray-500 leading-tight">{t.cropTracker.totalHectares}</p>
        </div>
        <div className="w-px h-8 bg-gray-200" />
        <div className="flex-1 text-center">
          <p className="text-lg font-bold text-navy">{summary.plotCount}</p>
          <p className="text-[11px] text-gray-500 leading-tight">{t.cropTracker.plots}</p>
        </div>
        <div className="w-px h-8 bg-gray-200" />
        <div className="flex-1 text-center">
          <div className="flex items-center justify-center gap-1">
            <span className={`w-2 h-2 rounded-full ${getHealthBg(summary.avgHealthScore)}`} />
            <p className="text-lg font-bold text-navy">{summary.avgHealthScore}%</p>
          </div>
          <p className="text-[11px] text-gray-500 leading-tight">{t.cropTracker.avgHealth}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Component: Growth Timeline ──────────────────────────────────────────────

function GrowthTimeline({ currentStage }: { currentStage: CropStage }) {
  const { t } = useLanguage();
  const stageLabels = t.cropTracker.stages;
  const currentIndex = ALL_STAGES.indexOf(currentStage);

  return (
    <div className="py-3">
      <p className="text-xs font-semibold text-navy mb-3">{t.cropTracker.growthTimeline}</p>
      <div className="relative">
        {/* Track line */}
        <div className="absolute top-3 left-0 right-0 h-0.5 bg-gray-200 rounded-full" />
        <div
          className="absolute top-3 left-0 h-0.5 bg-[#5DB347] rounded-full transition-all duration-500"
          style={{ width: `${(currentIndex / (ALL_STAGES.length - 1)) * 100}%` }}
        />

        {/* Stage dots */}
        <div className="relative flex justify-between">
          {ALL_STAGES.map((stage, i) => {
            const isPast = i < currentIndex;
            const isCurrent = i === currentIndex;
            const isFuture = i > currentIndex;

            return (
              <div key={stage} className="flex flex-col items-center" style={{ width: '12.5%' }}>
                <div className="relative">
                  {isCurrent && (
                    <span className="absolute inset-0 -m-1 rounded-full bg-[#5DB347]/30 animate-ping" />
                  )}
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center z-10 relative ${
                      isCurrent
                        ? 'bg-[#5DB347] border-[#5DB347] text-white'
                        : isPast
                          ? 'bg-[#5DB347] border-[#5DB347] text-white'
                          : 'bg-white border-gray-300 text-gray-400'
                    }`}
                  >
                    {isPast ? (
                      <Check className="w-3 h-3" />
                    ) : isCurrent ? (
                      <CircleDot className="w-3 h-3" />
                    ) : null}
                  </div>
                </div>
                <span
                  className={`mt-1.5 text-[10px] font-medium leading-tight text-center ${
                    isCurrent
                      ? 'text-[#5DB347] font-bold'
                      : isPast
                        ? 'text-[#449933]'
                        : 'text-gray-400'
                  }`}
                >
                  {stageLabels[stage]}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Component: Activity Log ─────────────────────────────────────────────────

function ActivityLog({ plotId }: { plotId: string }) {
  const { activities: dbActivities, loading: activitiesLoading } = useFarmActivities();

  const activities = useMemo(() => {
    // Use real data if available, else fall back to mock
    const source: FarmActivity[] =
      dbActivities.length > 0
        ? dbActivities.map((a) => ({
            id: a.id,
            plotId: a.plot_id || '',
            plotName: '',
            type: a.type as ActivityType,
            date: a.date,
            time: '',
            description: a.description || a.notes || '',
            notes: a.notes || undefined,
            photo: a.photo_url || undefined,
            cost: a.cost || undefined,
            currency: a.currency || 'USD',
          }))
        : FALLBACK_FARM_ACTIVITIES;

    return source
      .filter((a) => a.plotId === plotId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [plotId, dbActivities]);

  if (activities.length === 0) {
    return (
      <p className="text-sm text-gray-400 text-center py-4">No activities logged yet.</p>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-navy">Recent Activities</p>
      {activities.map((act) => {
        const Icon = ACTIVITY_ICONS[act.type];
        return (
          <div
            key={act.id}
            className="flex items-start gap-3 p-2.5 rounded-xl bg-gray-50 border border-gray-100"
          >
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${ACTIVITY_COLORS[act.type]}`}
            >
              <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-navy truncate">{act.description}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[11px] text-gray-500">{formatDate(act.date)}</span>
                <span className="text-[11px] text-gray-400">{act.time}</span>
                {act.cost != null && act.cost > 0 && (
                  <span className="text-[11px] font-semibold text-amber-600">
                    ${act.cost}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Component: Log Activity Modal ───────────────────────────────────────────

function LogActivityModal({
  open,
  onClose,
  plotName,
  plotId,
}: {
  open: boolean;
  onClose: () => void;
  plotName: string;
  plotId: string;
}) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { createActivity } = useCreateFarmActivity();
  const [selectedType, setSelectedType] = useState<ActivityType | null>(null);
  const [notes, setNotes] = useState('');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!selectedType || !user) return;
    setSaving(true);
    setSaveError(null);
    const { error } = await createActivity({
      plot_id: plotId,
      member_id: user.id,
      type: selectedType,
      date: new Date().toISOString().split('T')[0],
      description: notes || `${selectedType} activity`,
      notes: notes || null,
      photo_url: null,
      cost: 0,
      currency: 'USD',
    });
    setSaving(false);
    if (error) {
      setSaveError(error);
      return;
    }
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setSelectedType(null);
      setNotes('');
      setSaveError(null);
      onClose();
    }, 1200);
  };

  const handleClose = () => {
    setSelectedType(null);
    setNotes('');
    setSaved(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            variants={modalOverlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.2 }}
            onClick={handleClose}
          />
          <motion.div
            className="relative w-full max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[85vh] overflow-y-auto"
            variants={modalContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div>
                <h3 className="text-base font-bold text-navy">{t.cropTracker.logActivity}</h3>
                <p className="text-xs text-gray-500">{plotName}</p>
              </div>
              <button
                onClick={handleClose}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 text-gray-500 active:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Activity type grid */}
              <div>
                <p className="text-xs font-semibold text-navy mb-2">What did you do?</p>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {ALL_ACTIVITY_TYPES.map((type) => {
                    const Icon = ACTIVITY_ICONS[type];
                    const isSelected = selectedType === type;
                    return (
                      <button
                        key={type}
                        onClick={() => setSelectedType(type)}
                        className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border transition-all min-h-[64px] ${
                          isSelected
                            ? 'border-[#5DB347] bg-[#5DB347]/10 ring-1 ring-[#5DB347]/30'
                            : 'border-gray-200 bg-white active:bg-gray-50'
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                            isSelected ? 'bg-[#5DB347] text-white' : ACTIVITY_COLORS[type]
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span
                          className={`text-[10px] font-medium leading-tight text-center ${
                            isSelected ? 'text-[#449933]' : 'text-gray-600'
                          }`}
                        >
                          {ACTIVITY_LABELS[type]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-semibold text-navy block mb-1.5">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="What happened? Add any details..."
                  rows={3}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-navy placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5DB347]/40 focus:border-[#5DB347] resize-none"
                />
              </div>

              {/* Error message */}
              {saveError && (
                <div className="px-3 py-2 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600">
                  {saveError}
                </div>
              )}

              {/* Save */}
              <button
                onClick={handleSave}
                disabled={!selectedType || saved || saving}
                className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                  saved
                    ? 'bg-green-500 text-white'
                    : selectedType && !saving
                      ? 'bg-[#5DB347] text-white active:bg-[#449933]'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {saved ? 'Saved!' : saving ? 'Saving...' : t.common.save}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ─── Component: Add Plot Modal ───────────────────────────────────────────────

const CROP_TYPE_OPTIONS = [
  'Maize', 'Coffee', 'Cotton', 'Tobacco', 'Tea', 'Wheat', 'Sorghum',
  'Groundnuts', 'Blueberries', 'Sesame', 'Cassava', 'Rice', 'Beans',
  'Tomatoes', 'Potatoes', 'Sugarcane', 'Sunflower', 'Soybeans', 'Other',
];

function AddPlotModal({
  open,
  onClose,
  editPlot,
}: {
  open: boolean;
  onClose: () => void;
  editPlot?: FarmPlotRow | null;
}) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { createPlot } = useCreateFarmPlot();
  const { updatePlot } = useUpdateFarmPlot();
  const [plotName, setPlotName] = useState('');
  const [crop, setCrop] = useState('');
  const [variety, setVariety] = useState('');
  const [size, setSize] = useState('');
  const [plantingDate, setPlantingDate] = useState('');
  const [country, setCountry] = useState('');
  const [region, setRegion] = useState('');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Pre-fill when editing
  useState(() => {
    if (editPlot) {
      setPlotName(editPlot.name || '');
      setCrop(editPlot.crop || '');
      setVariety(editPlot.variety || '');
      setSize(editPlot.size_ha ? String(editPlot.size_ha) : '');
      setPlantingDate(editPlot.planting_date || '');
      // location may contain "country / region" format
      const loc = editPlot.location || '';
      if (loc.includes('/')) {
        const parts = loc.split('/').map((s: string) => s.trim());
        setCountry(parts[0] || '');
        setRegion(parts[1] || '');
      } else {
        setCountry(loc);
      }
    }
  });

  // Reset form when editPlot changes
  const prevEditRef = useState<string | null>(null);
  if (open) {
    const editId = editPlot?.id ?? null;
    if (editId !== prevEditRef[0]) {
      prevEditRef[0] = editId;
      if (editPlot) {
        setPlotName(editPlot.name || '');
        setCrop(editPlot.crop || '');
        setVariety(editPlot.variety || '');
        setSize(editPlot.size_ha ? String(editPlot.size_ha) : '');
        setPlantingDate(editPlot.planting_date || '');
        const loc = editPlot.location || '';
        if (loc.includes('/')) {
          const parts = loc.split('/').map((s: string) => s.trim());
          setCountry(parts[0] || '');
          setRegion(parts[1] || '');
        } else {
          setCountry(loc);
          setRegion('');
        }
      } else {
        setPlotName(''); setCrop(''); setVariety(''); setSize('');
        setPlantingDate(''); setCountry(''); setRegion('');
      }
      setSaved(false); setSaveError(null);
    }
  }

  const handleSave = async () => {
    if (!plotName.trim() || !crop.trim() || !user) return;
    setSaving(true);
    setSaveError(null);

    const locationStr = [country.trim(), region.trim()].filter(Boolean).join(' / ') || null;

    if (editPlot) {
      // Update existing plot
      const { error } = await updatePlot(editPlot.id, {
        name: plotName.trim(),
        crop: crop.trim(),
        variety: variety.trim() || null,
        size_ha: size ? parseFloat(size) : null,
        planting_date: plantingDate || null,
        location: locationStr,
      });
      setSaving(false);
      if (error) { setSaveError(error); return; }
    } else {
      // Create new plot
      const { error } = await createPlot({
        member_id: user.id,
        name: plotName.trim(),
        crop: crop.trim(),
        variety: variety.trim() || null,
        size_ha: size ? parseFloat(size) : null,
        planting_date: plantingDate || null,
        expected_harvest: null,
        stage: 'planning',
        soil_ph: null,
        location: locationStr,
        notes: null,
      });
      setSaving(false);
      if (error) { setSaveError(error); return; }
    }

    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setPlotName(''); setCrop(''); setVariety(''); setSize('');
      setPlantingDate(''); setCountry(''); setRegion('');
      setSaveError(null);
      onClose();
    }, 1200);
  };

  const handleClose = () => {
    setPlotName(''); setCrop(''); setVariety(''); setSize('');
    setPlantingDate(''); setCountry(''); setRegion('');
    setSaved(false);
    onClose();
  };

  const isValid = plotName.trim() && crop.trim();
  const isEditing = !!editPlot;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            variants={modalOverlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.2 }}
            onClick={handleClose}
          />
          <motion.div
            className="relative w-full max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[85vh] overflow-y-auto"
            variants={modalContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div>
                <h3 className="text-base font-bold text-navy">
                  {isEditing ? 'Edit Plot' : t.cropTracker.addPlot}
                </h3>
                <p className="text-xs text-gray-500">
                  {isEditing ? 'Update your crop plot details' : 'Register a new planting area'}
                </p>
              </div>
              <button
                onClick={handleClose}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 text-gray-500 active:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              {/* Plot name */}
              <div>
                <label className="text-xs font-semibold text-navy block mb-1">{t.cropTracker.plotName} *</label>
                <input
                  type="text"
                  value={plotName}
                  onChange={(e) => setPlotName(e.target.value)}
                  placeholder="e.g. North Tomato Field"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-navy placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5DB347]/40 focus:border-[#5DB347]"
                />
              </div>

              {/* Crop Type (dropdown) */}
              <div>
                <label className="text-xs font-semibold text-navy block mb-1">{t.cropTracker.crop} *</label>
                <select
                  value={CROP_TYPE_OPTIONS.includes(crop) ? crop : crop ? '__custom__' : ''}
                  onChange={(e) => {
                    if (e.target.value === '__custom__') return;
                    setCrop(e.target.value);
                  }}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-[#5DB347]/40 focus:border-[#5DB347]"
                >
                  <option value="">Select crop type...</option>
                  {CROP_TYPE_OPTIONS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                {/* Allow custom entry if "Other" is selected */}
                {crop === 'Other' && (
                  <input
                    type="text"
                    placeholder="Enter custom crop name"
                    className="w-full mt-2 rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-navy placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5DB347]/40 focus:border-[#5DB347]"
                    onChange={(e) => setCrop(e.target.value || 'Other')}
                  />
                )}
              </div>

              {/* Variety */}
              <div>
                <label className="text-xs font-semibold text-navy block mb-1">{t.cropTracker.variety}</label>
                <input
                  type="text"
                  value={variety}
                  onChange={(e) => setVariety(e.target.value)}
                  placeholder="e.g. Roma VF"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-navy placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5DB347]/40 focus:border-[#5DB347]"
                />
              </div>

              {/* Size and Date row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-navy block mb-1">{t.cropTracker.size}</label>
                  <input
                    type="number"
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    placeholder="0.5"
                    step="0.1"
                    min="0"
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-navy placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5DB347]/40 focus:border-[#5DB347]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-navy block mb-1">
                    {t.cropTracker.plantingDate}
                  </label>
                  <input
                    type="date"
                    value={plantingDate}
                    onChange={(e) => setPlantingDate(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-navy placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5DB347]/40 focus:border-[#5DB347]"
                  />
                </div>
              </div>

              {/* Country and Region row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-navy block mb-1">Country</label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-[#5DB347]/40 focus:border-[#5DB347]"
                  >
                    <option value="">Select country</option>
                    {['Botswana', 'Ghana', 'Kenya', 'Mozambique', 'Nigeria', 'Sierra Leone', 'South Africa', 'Tanzania', 'Uganda', 'Zambia', 'Zimbabwe'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-navy block mb-1">Region</label>
                  <input
                    type="text"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    placeholder="e.g. Mashonaland"
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-navy placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5DB347]/40 focus:border-[#5DB347]"
                  />
                </div>
              </div>

              {/* Error message */}
              {saveError && (
                <div className="px-3 py-2 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600">
                  {saveError}
                </div>
              )}

              {/* Save */}
              <button
                onClick={handleSave}
                disabled={!isValid || saved || saving}
                className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all mt-2 flex items-center justify-center gap-2 ${
                  saved
                    ? 'bg-green-500 text-white'
                    : isValid && !saving
                      ? 'bg-[#5DB347] text-white active:bg-[#449933]'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {saved
                  ? (isEditing ? 'Updated!' : 'Plot Added!')
                  : saving
                    ? 'Saving...'
                    : (isEditing ? 'Save Changes' : t.cropTracker.addPlot)
                }
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ─── Component: Plot Card ────────────────────────────────────────────────────

function PlotCard({ plot, onEdit }: { plot: FarmPlot; onEdit?: () => void }) {
  const { t } = useLanguage();
  const stageLabels = t.cropTracker.stages;
  const [expanded, setExpanded] = useState(false);
  const [logModalOpen, setLogModalOpen] = useState(false);

  return (
    <>
      <motion.div
        variants={cardVariants}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
      >
        {/* Image Header */}
        <button
          onClick={() => setExpanded((prev) => !prev)}
          className="w-full text-left focus:outline-none"
        >
          <div className="relative h-[160px] sm:h-[200px] w-full overflow-hidden">
            <Image
              src={plot.image}
              alt={`${plot.crop} — ${plot.name}`}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 480px"
            />
            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

            {/* Stage badge */}
            <div className="absolute top-3 left-3">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold backdrop-blur-sm ${STAGE_BADGE_STYLES[plot.stage]}`}
              >
                <Leaf className="w-3 h-3" />
                {stageLabels[plot.stage]}
              </span>
            </div>

            {/* Size badge */}
            <div className="absolute top-3 right-3">
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold bg-white/90 text-navy backdrop-blur-sm">
                <Ruler className="w-3 h-3" />
                {plot.size} ha
              </span>
            </div>

            {/* Crop info overlaid on bottom */}
            <div className="absolute bottom-3 left-3 right-3">
              <h3 className="text-white font-bold text-base leading-tight">{plot.crop}</h3>
              <p className="text-white/80 text-xs">{plot.variety}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-white/60" />
                <span className="text-white/70 text-[11px]">{plot.location}</span>
              </div>
            </div>
          </div>
        </button>

        {/* Card Body */}
        <div className="p-4">
          {/* Health + Harvest row */}
          <div className="flex items-center justify-between mb-3">
            {/* Health Score */}
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${getHealthBg(plot.healthScore)}`} />
              <div>
                <p className={`text-sm font-bold ${getHealthColor(plot.healthScore)}`}>
                  {plot.healthScore}%
                </p>
                <p className="text-[11px] text-gray-500">{t.dashboard.healthScore}</p>
              </div>
            </div>

            {/* Harvest Countdown */}
            <div className="text-right">
              <div className="flex items-center gap-1 justify-end">
                <Timer className="w-4 h-4 text-gold" />
                <span className="text-xl font-bold text-gold">{plot.daysToHarvest}</span>
              </div>
              <p className="text-[11px] text-gray-500">{t.dashboard.daysToHarvest}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-medium text-gray-500">{t.cropTracker.growthTimeline}</span>
              <span className="text-[11px] font-bold text-navy">{plot.progressPercent}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${getProgressColor(plot.stage)}`}
                initial={{ width: 0 }}
                animate={{ width: `${plot.progressPercent}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' as const }}
              />
            </div>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Stage: {stageLabels[plot.stage]}
            </p>
          </div>

          {/* Soil pH + Last Activity */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Beaker className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs text-gray-600">
                pH <span className="font-semibold text-navy">{plot.soilPH}</span>
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-[11px] text-gray-500">
                Last: {formatDate(plot.lastActivity)}
              </span>
            </div>
          </div>

          {/* Expand toggle hint */}
          <button
            onClick={() => setExpanded((prev) => !prev)}
            className="mt-3 w-full flex items-center justify-center gap-1 py-2 rounded-xl bg-gray-50 text-xs font-medium text-gray-500 active:bg-gray-100 transition-colors min-h-[44px]"
          >
            {expanded ? 'Hide details' : 'Tap for details'}
            <motion.span
              animate={{ rotate: expanded ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </motion.span>
          </button>
        </div>

        {/* Expanded Detail */}
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              variants={expandVariants}
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 space-y-4 border-t border-gray-100 pt-4">
                {/* Growth Timeline */}
                <GrowthTimeline currentStage={plot.stage} />

                {/* Activity Log */}
                <ActivityLog plotId={plot.id} />

                {/* Quick Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                  <button
                    onClick={() => setLogModalOpen(true)}
                    className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl bg-[#5DB347]/10 text-[#5DB347] active:bg-[#5DB347]/20 transition-colors min-h-[64px]"
                  >
                    <ClipboardPlus className="w-5 h-5" />
                    <span className="text-[11px] font-semibold">{t.cropTracker.logActivity}</span>
                  </button>
                  {onEdit && (
                    <button
                      onClick={onEdit}
                      className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl bg-[#1B2A4A]/10 text-[#1B2A4A] active:bg-[#1B2A4A]/20 transition-colors min-h-[64px]"
                    >
                      <MoreHorizontal className="w-5 h-5" />
                      <span className="text-[11px] font-semibold">Edit</span>
                    </button>
                  )}
                  <Link
                    href="/farm/doctor"
                    className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl bg-amber-50 text-amber-600 active:bg-amber-100 transition-colors min-h-[64px]"
                  >
                    <Camera className="w-5 h-5" />
                    <span className="text-[11px] font-semibold">{t.cropTracker.scanCrop}</span>
                  </Link>
                  <button className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl bg-blue-50 text-blue-600 active:bg-blue-100 transition-colors min-h-[64px]">
                    <History className="w-5 h-5" />
                    <span className="text-[11px] font-semibold">{t.cropTracker.viewHistory}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Log Activity Modal */}
      <LogActivityModal
        open={logModalOpen}
        onClose={() => setLogModalOpen(false)}
        plotName={plot.name}
        plotId={plot.id}
      />
    </>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function CropsPage() {
  const [addPlotOpen, setAddPlotOpen] = useState(false);
  const [editingPlot, setEditingPlot] = useState<FarmPlotRow | null>(null);
  const { plots: livePlots, loading } = useFarmPlots();
  const farmPlots: FarmPlot[] = livePlots.length > 0 ? livePlots.map(adaptFarmPlot) as FarmPlot[] : FALLBACK_FARM_PLOTS;

  const handleEdit = (plotId: string) => {
    const dbPlot = livePlots.find((p) => p.id === plotId);
    if (dbPlot) {
      setEditingPlot(dbPlot);
      setAddPlotOpen(true);
    }
  };

  const handleCloseModal = () => {
    setAddPlotOpen(false);
    setEditingPlot(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        <span className="ml-2 text-sm text-gray-500">Loading crops data...</span>
      </div>
    );
  }

  return (
    <div className="relative min-h-full">
      {/* Summary Bar */}
      <SummaryBar />

      {/* Plot Cards */}
      <motion.div
        className="px-4 pb-6 space-y-4"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {farmPlots.map((plot) => (
          <PlotCard
            key={plot.id}
            plot={plot}
            onEdit={livePlots.length > 0 ? () => handleEdit(plot.id) : undefined}
          />
        ))}
      </motion.div>

      {/* Floating Action Button */}
      <motion.button
        onClick={() => { setEditingPlot(null); setAddPlotOpen(true); }}
        variants={fabVariants}
        initial="rest"
        whileHover="hover"
        whileTap="tap"
        className="fixed bottom-28 right-4 z-30 w-14 h-14 rounded-full bg-[#5DB347] text-white shadow-lg shadow-[#5DB347]/30 flex items-center justify-center max-w-lg"
        aria-label="Add new plot"
      >
        <Plus className="w-6 h-6" />
      </motion.button>

      {/* Add/Edit Plot Modal */}
      <AddPlotModal open={addPlotOpen} onClose={handleCloseModal} editPlot={editingPlot} />
    </div>
  );
}
