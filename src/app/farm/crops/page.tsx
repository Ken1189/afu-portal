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
} from 'lucide-react';
import {
  farmPlots,
  farmActivities,
  getFarmSummary,
  type CropStage,
  type ActivityType,
  type FarmPlot,
} from '@/lib/data/farm';
import { useLanguage } from '@/lib/i18n/LanguageContext';

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
  scouting: 'bg-teal-light text-teal-dark',
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
          className="absolute top-3 left-0 h-0.5 bg-teal rounded-full transition-all duration-500"
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
                    <span className="absolute inset-0 -m-1 rounded-full bg-teal/30 animate-ping" />
                  )}
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center z-10 relative ${
                      isCurrent
                        ? 'bg-teal border-teal text-white'
                        : isPast
                          ? 'bg-teal border-teal text-white'
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
                  className={`mt-1.5 text-[8px] font-medium leading-tight text-center ${
                    isCurrent
                      ? 'text-teal font-bold'
                      : isPast
                        ? 'text-teal-dark'
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
  const activities = useMemo(
    () =>
      farmActivities
        .filter((a) => a.plotId === plotId)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5),
    [plotId]
  );

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
                <span className="text-[10px] text-gray-500">{formatDate(act.date)}</span>
                <span className="text-[10px] text-gray-400">{act.time}</span>
                {act.cost != null && act.cost > 0 && (
                  <span className="text-[10px] font-semibold text-amber-600">
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
}: {
  open: boolean;
  onClose: () => void;
  plotName: string;
}) {
  const { t } = useLanguage();
  const [selectedType, setSelectedType] = useState<ActivityType | null>(null);
  const [notes, setNotes] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setSelectedType(null);
      setNotes('');
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
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 text-gray-500 active:bg-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Activity type grid */}
              <div>
                <p className="text-xs font-semibold text-navy mb-2">What did you do?</p>
                <div className="grid grid-cols-5 gap-2">
                  {ALL_ACTIVITY_TYPES.map((type) => {
                    const Icon = ACTIVITY_ICONS[type];
                    const isSelected = selectedType === type;
                    return (
                      <button
                        key={type}
                        onClick={() => setSelectedType(type)}
                        className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border transition-all min-h-[64px] ${
                          isSelected
                            ? 'border-teal bg-teal/10 ring-1 ring-teal/30'
                            : 'border-gray-200 bg-white active:bg-gray-50'
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                            isSelected ? 'bg-teal text-white' : ACTIVITY_COLORS[type]
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span
                          className={`text-[9px] font-medium leading-tight text-center ${
                            isSelected ? 'text-teal-dark' : 'text-gray-600'
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
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-navy placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-teal resize-none"
                />
              </div>

              {/* Save */}
              <button
                onClick={handleSave}
                disabled={!selectedType || saved}
                className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all ${
                  saved
                    ? 'bg-green-500 text-white'
                    : selectedType
                      ? 'bg-teal text-white active:bg-teal-dark'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {saved ? 'Saved!' : t.common.save}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ─── Component: Add Plot Modal ───────────────────────────────────────────────

function AddPlotModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useLanguage();
  const [plotName, setPlotName] = useState('');
  const [crop, setCrop] = useState('');
  const [variety, setVariety] = useState('');
  const [size, setSize] = useState('');
  const [plantingDate, setPlantingDate] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setPlotName('');
      setCrop('');
      setVariety('');
      setSize('');
      setPlantingDate('');
      onClose();
    }, 1200);
  };

  const handleClose = () => {
    setPlotName('');
    setCrop('');
    setVariety('');
    setSize('');
    setPlantingDate('');
    setSaved(false);
    onClose();
  };

  const isValid = plotName.trim() && crop.trim();

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
                <h3 className="text-base font-bold text-navy">{t.cropTracker.addPlot}</h3>
                <p className="text-xs text-gray-500">Register a new planting area</p>
              </div>
              <button
                onClick={handleClose}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 text-gray-500 active:bg-gray-200"
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
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-navy placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-teal"
                />
              </div>

              {/* Crop */}
              <div>
                <label className="text-xs font-semibold text-navy block mb-1">{t.cropTracker.crop} *</label>
                <input
                  type="text"
                  value={crop}
                  onChange={(e) => setCrop(e.target.value)}
                  placeholder="e.g. Tomatoes"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-navy placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-teal"
                />
              </div>

              {/* Variety */}
              <div>
                <label className="text-xs font-semibold text-navy block mb-1">{t.cropTracker.variety}</label>
                <input
                  type="text"
                  value={variety}
                  onChange={(e) => setVariety(e.target.value)}
                  placeholder="e.g. Roma VF"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-navy placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-teal"
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
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-navy placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-teal"
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
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-navy placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-teal"
                  />
                </div>
              </div>

              {/* Save */}
              <button
                onClick={handleSave}
                disabled={!isValid || saved}
                className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all mt-2 ${
                  saved
                    ? 'bg-green-500 text-white'
                    : isValid
                      ? 'bg-teal text-white active:bg-teal-dark'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {saved ? 'Plot Added!' : t.cropTracker.addPlot}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ─── Component: Plot Card ────────────────────────────────────────────────────

function PlotCard({ plot }: { plot: FarmPlot }) {
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
          <div className="relative h-[200px] w-full overflow-hidden">
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
                <p className="text-[10px] text-gray-500">{t.dashboard.healthScore}</p>
              </div>
            </div>

            {/* Harvest Countdown */}
            <div className="text-right">
              <div className="flex items-center gap-1 justify-end">
                <Timer className="w-4 h-4 text-gold" />
                <span className="text-xl font-bold text-gold">{plot.daysToHarvest}</span>
              </div>
              <p className="text-[10px] text-gray-500">{t.dashboard.daysToHarvest}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-medium text-gray-500">{t.cropTracker.growthTimeline}</span>
              <span className="text-[10px] font-bold text-navy">{plot.progressPercent}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${getProgressColor(plot.stage)}`}
                initial={{ width: 0 }}
                animate={{ width: `${plot.progressPercent}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' as const }}
              />
            </div>
            <p className="text-[10px] text-gray-400 mt-0.5">
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
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setLogModalOpen(true)}
                    className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl bg-teal/10 text-teal active:bg-teal/20 transition-colors min-h-[64px]"
                  >
                    <ClipboardPlus className="w-5 h-5" />
                    <span className="text-[10px] font-semibold">{t.cropTracker.logActivity}</span>
                  </button>
                  <Link
                    href="/farm/doctor"
                    className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl bg-amber-50 text-amber-600 active:bg-amber-100 transition-colors min-h-[64px]"
                  >
                    <Camera className="w-5 h-5" />
                    <span className="text-[10px] font-semibold">{t.cropTracker.scanCrop}</span>
                  </Link>
                  <button className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl bg-blue-50 text-blue-600 active:bg-blue-100 transition-colors min-h-[64px]">
                    <History className="w-5 h-5" />
                    <span className="text-[10px] font-semibold">{t.cropTracker.viewHistory}</span>
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
      />
    </>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function CropsPage() {
  const [addPlotOpen, setAddPlotOpen] = useState(false);

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
          <PlotCard key={plot.id} plot={plot} />
        ))}
      </motion.div>

      {/* Floating Action Button */}
      <motion.button
        onClick={() => setAddPlotOpen(true)}
        variants={fabVariants}
        initial="rest"
        whileHover="hover"
        whileTap="tap"
        className="fixed bottom-24 right-4 z-30 w-14 h-14 rounded-full bg-teal text-white shadow-lg shadow-teal/30 flex items-center justify-center max-w-lg"
        aria-label="Add new plot"
      >
        <Plus className="w-6 h-6" />
      </motion.button>

      {/* Add Plot Modal */}
      <AddPlotModal open={addPlotOpen} onClose={() => setAddPlotOpen(false)} />
    </div>
  );
}
