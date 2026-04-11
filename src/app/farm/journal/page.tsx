'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useAuth } from '@/lib/supabase/auth-context';
import { useFarm } from '@/lib/farm-context';
import { createClient } from '@/lib/supabase/client';
import ImageUploader from '@/components/ui/ImageUploader';
import {
  Sprout,
  Droplets,
  FlaskConical,
  Bug,
  Flower2,
  Package,
  Search,
  TestTube,
  Scissors,
  MoreHorizontal,
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudLightning,
  Wind,
  Plus,
  X,
  ChevronDown,
  Camera,
  Image as ImageIcon,
  BookOpen,
  Filter,
  Calendar,
  DollarSign,
  Smile,
  Meh,
  Frown,
  AlertCircle,
  ThumbsUp,
  ChevronLeft,
  ChevronRight,
  FileText,
  BarChart3,
  ArrowRight,
  Leaf,
  Activity,
} from 'lucide-react';
import { type LucideIcon } from 'lucide-react';
// ---------------------------------------------------------------------------
// Inlined types & data (previously from @/lib/data/farm)
// ---------------------------------------------------------------------------

type ActivityType = 'planting' | 'watering' | 'fertilizing' | 'spraying' | 'weeding' | 'harvesting' | 'scouting' | 'soil-test' | 'pruning' | 'other';
type WeatherCondition = 'sunny' | 'partly-cloudy' | 'cloudy' | 'rainy' | 'stormy' | 'windy';

interface JournalEntry {
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

interface FarmPlotOption {
  id: string;
  name: string;
  crop: string;
  variety: string;
}

// ---------------------------------------------------------------------------
// Constants & Mappings
// ---------------------------------------------------------------------------

const activityConfig: Record<
  ActivityType,
  { label: string; icon: typeof Sprout; color: string; bgColor: string; borderColor: string }
> = {
  planting: { label: 'Planting', icon: Sprout, color: 'text-green-600', bgColor: 'bg-green-100', borderColor: 'border-green-500' },
  watering: { label: 'Watering', icon: Droplets, color: 'text-blue-600', bgColor: 'bg-blue-100', borderColor: 'border-blue-500' },
  fertilizing: { label: 'Fertilizing', icon: FlaskConical, color: 'text-purple-600', bgColor: 'bg-purple-100', borderColor: 'border-purple-500' },
  spraying: { label: 'Spraying', icon: Bug, color: 'text-orange-600', bgColor: 'bg-orange-100', borderColor: 'border-orange-500' },
  weeding: { label: 'Weeding', icon: Flower2, color: 'text-yellow-600', bgColor: 'bg-yellow-100', borderColor: 'border-yellow-500' },
  harvesting: { label: 'Harvesting', icon: Package, color: 'text-amber-600', bgColor: 'bg-amber-100', borderColor: 'border-amber-500' },
  scouting: { label: 'Scouting', icon: Search, color: 'text-[#729E82]', bgColor: 'bg-[#EDF4EF]', borderColor: 'border-[#8CB89C]' },
  'soil-test': { label: 'Soil Test', icon: TestTube, color: 'text-amber-800', bgColor: 'bg-amber-50', borderColor: 'border-amber-800' },
  pruning: { label: 'Pruning', icon: Scissors, color: 'text-pink-600', bgColor: 'bg-pink-100', borderColor: 'border-pink-500' },
  other: { label: 'Other', icon: MoreHorizontal, color: 'text-gray-600', bgColor: 'bg-gray-100', borderColor: 'border-gray-400' },
};

const weatherIcons: Record<WeatherCondition, typeof Sun> = {
  sunny: Sun,
  'partly-cloudy': CloudSun,
  cloudy: Cloud,
  rainy: CloudRain,
  stormy: CloudLightning,
  windy: Wind,
};

const moodOptions: { key: JournalEntry['mood']; icon: LucideIcon; label: string; color: string }[] = [
  { key: 'great', icon: Smile, label: 'Great', color: '#5DB347' },
  { key: 'good', icon: ThumbsUp, label: 'Good', color: '#6ABF4B' },
  { key: 'okay', icon: Meh, label: 'Okay', color: '#F59E0B' },
  { key: 'concerned', icon: Frown, label: 'Concerned', color: '#F97316' },
  { key: 'worried', icon: AlertCircle, label: 'Worried', color: '#EF4444' },
];

const moodIcons: Record<string, { icon: LucideIcon; color: string }> = {
  great: { icon: Smile, color: '#5DB347' },
  good: { icon: ThumbsUp, color: '#6ABF4B' },
  okay: { icon: Meh, color: '#F59E0B' },
  concerned: { icon: Frown, color: '#F97316' },
  worried: { icon: AlertCircle, color: '#EF4444' },
};

// Map ActivityType values to farmJournal.activities translation keys
type ActivityTranslationKey = 'planting' | 'watering' | 'fertilizing' | 'spraying' | 'weeding' | 'harvesting' | 'scouting' | 'soilTest' | 'pruning' | 'other';
const activityTranslationKey: Record<ActivityType, ActivityTranslationKey> = {
  planting: 'planting',
  watering: 'watering',
  fertilizing: 'fertilizing',
  spraying: 'spraying',
  weeding: 'weeding',
  harvesting: 'harvesting',
  scouting: 'scouting',
  'soil-test': 'soilTest',
  pruning: 'pruning',
  other: 'other',
};

// ---------------------------------------------------------------------------
// Animation Variants
// ---------------------------------------------------------------------------

const listContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.1,
    },
  },
};

const listItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 24,
    },
  },
};

const expandVariants = {
  collapsed: { height: 0, opacity: 0 },
  expanded: {
    height: 'auto' as const,
    opacity: 1,
    transition: {
      height: { type: 'spring' as const, stiffness: 300, damping: 30 },
      opacity: { duration: 0.2 },
    },
  },
};

const modalOverlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalPanelVariants = {
  hidden: { y: '100%', opacity: 0.5 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring' as const, stiffness: 300, damping: 30 },
  },
  exit: {
    y: '100%',
    opacity: 0,
    transition: { duration: 0.25, ease: [0.4, 0, 1, 1] as [number, number, number, number] },
  },
};

const photoGridItemVariants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 260, damping: 20 },
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDateHeader(dateStr: string, todayLabel: string, yesterdayLabel: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.getTime() === today.getTime()) return todayLabel;
  if (d.getTime() === yesterday.getTime()) return yesterdayLabel;

  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function groupByDate(entries: JournalEntry[]): Record<string, JournalEntry[]> {
  const groups: Record<string, JournalEntry[]> = {};
  for (const entry of entries) {
    if (!groups[entry.date]) groups[entry.date] = [];
    groups[entry.date].push(entry);
  }
  return groups;
}

// ---------------------------------------------------------------------------
// Sub-Components
// ---------------------------------------------------------------------------

function StatsBar({ entries }: { entries: JournalEntry[] }) {
  const { t } = useLanguage();
  const thisMonth = entries.filter((e) => {
    const d = new Date(e.date + 'T00:00:00');
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const withPhotos = thisMonth.filter((e) => e.photo).length;
  const totalSpent = thisMonth.reduce((sum, e) => sum + (e.cost || 0), 0);

  return (
    <div className="flex items-center gap-3 px-4 py-3 overflow-x-auto">
      <div className="flex items-center gap-1.5 bg-teal/10 text-teal px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap">
        <BookOpen className="w-3.5 h-3.5" />
        {thisMonth.length} {t.farmJournal.entries}
      </div>
      <div className="flex items-center gap-1.5 bg-purple-50 text-purple-600 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap">
        <Camera className="w-3.5 h-3.5" />
        {withPhotos} {t.farmJournal.photos}
      </div>
      <div className="flex items-center gap-1.5 bg-red-50 text-red-600 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap">
        <DollarSign className="w-3.5 h-3.5" />
        ${totalSpent} {t.farmJournal.spent}
      </div>
    </div>
  );
}

function FilterBar({
  plotFilter,
  setPlotFilter,
  activityFilter,
  setActivityFilter,
  farmPlots,
}: {
  plotFilter: string;
  setPlotFilter: (v: string) => void;
  activityFilter: ActivityType | 'all';
  setActivityFilter: (v: ActivityType | 'all') => void;
  farmPlots: FarmPlotOption[];
}) {
  const { t } = useLanguage();
  return (
    <div className="px-4 space-y-2.5">
      {/* Plot Filter */}
      <div className="relative">
        <select
          value={plotFilter}
          onChange={(e) => setPlotFilter(e.target.value)}
          className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm font-medium text-navy focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
        >
          <option value="all">{t.farmJournal.allPlots}</option>
          {farmPlots.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>

      {/* Activity Type Filter — horizontal scroll */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
        <button
          onClick={() => setActivityFilter('all')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors min-h-[36px] ${
            activityFilter === 'all'
              ? 'bg-navy text-white'
              : 'bg-gray-100 text-gray-600 active:bg-gray-200'
          }`}
        >
          <Filter className="w-3.5 h-3.5" />
          All
        </button>
        {(Object.keys(activityConfig) as ActivityType[]).map((type) => {
          const cfg = activityConfig[type];
          const Icon = cfg.icon;
          const isActive = activityFilter === type;
          return (
            <button
              key={type}
              onClick={() => setActivityFilter(type)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors min-h-[36px] ${
                isActive ? 'bg-navy text-white' : `${cfg.bgColor} ${cfg.color} active:opacity-80`
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {t.farmJournal.activities[activityTranslationKey[type]]}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function JournalCard({
  entry,
  expanded,
  onToggle,
  onPhotoTap,
}: {
  entry: JournalEntry;
  expanded: boolean;
  onToggle: () => void;
  onPhotoTap: (url: string) => void;
}) {
  const { t } = useLanguage();
  const cfg = activityConfig[entry.type];
  const Icon = cfg.icon;
  const WeatherIcon = entry.weather ? weatherIcons[entry.weather] : null;

  return (
    <motion.div
      variants={listItemVariants}
      layout
      className={`bg-white rounded-2xl border-l-4 ${cfg.borderColor} shadow-sm overflow-hidden`}
    >
      {/* Card Header — always visible, tappable */}
      <button
        onClick={onToggle}
        className="w-full text-left px-4 py-3 active:bg-gray-50 transition-colors"
      >
        <div className="flex items-start gap-3">
          {/* Activity icon */}
          <div className={`w-10 h-10 rounded-xl ${cfg.bgColor} flex items-center justify-center flex-shrink-0`}>
            <Icon className={`w-5 h-5 ${cfg.color}`} />
          </div>

          <div className="flex-1 min-w-0">
            {/* Time + Mood + Weather row */}
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[11px] text-gray-400 font-medium">{entry.time}</span>
              {entry.mood && moodIcons[entry.mood] && (() => {
                const MoodIcon = moodIcons[entry.mood].icon;
                return <MoodIcon className="w-4 h-4" style={{ color: moodIcons[entry.mood].color }} />;
              })()}
              {WeatherIcon && (
                <WeatherIcon className="w-3.5 h-3.5 text-gray-400" />
              )}
            </div>

            {/* Title */}
            <h3 className="text-sm font-bold text-navy leading-snug">{entry.title}</h3>

            {/* Plot badge + cost */}
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {entry.plotName && (
                <span className="text-[11px] font-semibold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                  {entry.plotName}
                </span>
              )}
              {entry.cost != null && entry.cost > 0 && (
                <span className="text-[11px] font-bold bg-red-50 text-red-600 px-2 py-0.5 rounded-full">
                  - ${entry.cost}
                </span>
              )}
            </div>

            {/* Description preview (clamped to 3 lines when collapsed) */}
            {!expanded && (
              <p className="text-xs text-gray-500 mt-1.5 leading-relaxed line-clamp-3">
                {entry.description}
              </p>
            )}
          </div>

          {/* Expand indicator */}
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="mt-1 flex-shrink-0"
          >
            <ChevronDown className="w-4 h-4 text-gray-300" />
          </motion.div>
        </div>
      </button>

      {/* Expanded content */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="expanded"
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            variants={expandVariants}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3">
              {/* Full description */}
              <p className="text-xs text-gray-600 leading-relaxed pl-10 sm:pl-[52px]">
                {entry.description}
              </p>

              {/* Photo */}
              {entry.photo && (
                <div className="pl-10 sm:pl-[52px]">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onPhotoTap(entry.photo!);
                    }}
                    className="block w-full"
                  >
                    <img
                      src={entry.photo}
                      alt={entry.title}
                      className="w-full max-h-[200px] object-cover rounded-xl"
                    />
                  </button>
                </div>
              )}

              {/* Detail chips row */}
              <div className="flex items-center gap-2 flex-wrap pl-10 sm:pl-[52px]">
                <span className={`text-[11px] font-semibold ${cfg.bgColor} ${cfg.color} px-2 py-0.5 rounded-full`}>
                  {t.farmJournal.activities[activityTranslationKey[entry.type]]}
                </span>
                {entry.mood && moodIcons[entry.mood] && (() => {
                  const ChipMoodIcon = moodIcons[entry.mood].icon;
                  return (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-gray-50 text-gray-500 px-2 py-0.5 rounded-full">
                    <ChipMoodIcon className="w-3 h-3" style={{ color: moodIcons[entry.mood].color }} /> {t.farmJournal.moods[entry.mood as keyof typeof t.farmJournal.moods]}
                  </span>
                  );
                })()}
                {entry.weather && (
                  <span className="text-[11px] font-medium bg-gray-50 text-gray-500 px-2 py-0.5 rounded-full capitalize">
                    {entry.weather.replace('-', ' ')}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function PhotoGallery({
  entries,
  onPhotoTap,
}: {
  entries: JournalEntry[];
  onPhotoTap: (url: string) => void;
}) {
  const { t } = useLanguage();
  const photosEntries = entries.filter((e) => e.photo);
  if (photosEntries.length === 0) return null;

  return (
    <div className="px-4">
      <h2 className="text-sm font-bold text-navy mb-3 flex items-center gap-2">
        <ImageIcon className="w-4 h-4 text-teal" />
        {t.farmJournal.photoGallery}
      </h2>
      <motion.div
        variants={listContainerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-3 gap-2"
      >
        {photosEntries.map((entry) => (
          <motion.button
            key={entry.id}
            variants={photoGridItemVariants}
            onClick={() => onPhotoTap(entry.photo!)}
            className="relative aspect-square rounded-xl overflow-hidden group"
          >
            <img
              src={entry.photo}
              alt={entry.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <span className="absolute bottom-1.5 left-2 text-[11px] font-semibold text-white">
              {new Date(entry.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}

function NewEntryForm({ onClose, onSave, farmPlots }: { onClose: () => void; onSave: (entry: JournalEntry) => void; farmPlots: FarmPlotOption[] }) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [activityType, setActivityType] = useState<ActivityType | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [plotId, setPlotId] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [mood, setMood] = useState<JournalEntry['mood']>(undefined);
  const [cost, setCost] = useState('');

  const handleSubmit = () => {
    if (!activityType || !title.trim()) return;
    const plot = farmPlots.find((p) => p.id === plotId);
    const now = new Date();
    const entry: JournalEntry = {
      id: `JRN-${Date.now()}`,
      date: now.toISOString().slice(0, 10),
      time: now.toTimeString().slice(0, 5),
      type: activityType,
      plotId: plotId || undefined,
      plotName: plot?.name,
      title: title.trim(),
      description: description.trim(),
      photo: photoPreview || undefined,
      mood,
      cost: cost ? parseFloat(cost) : undefined,
      currency: cost ? 'USD' : undefined,
    };
    onSave(entry);
  };

  const canSave = activityType && title.trim().length > 0;

  return (
    <>
      {/* Overlay */}
      <motion.div
        variants={modalOverlayVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        variants={modalPanelVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl max-h-[90vh] overflow-y-auto max-w-lg mx-auto"
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-2">
          <h2 className="text-base font-bold text-navy">New Journal Entry</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 active:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="px-5 pb-12 space-y-5">
          {/* Activity Type Selector */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
              {t.farmJournal.activityType}
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {(Object.keys(activityConfig) as ActivityType[]).map((type) => {
                const cfg = activityConfig[type];
                const Icon = cfg.icon;
                const isSelected = activityType === type;
                return (
                  <button
                    key={type}
                    onClick={() => setActivityType(type)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all min-h-[60px] ${
                      isSelected
                        ? `${cfg.bgColor} ring-2 ring-offset-1 ring-current ${cfg.color}`
                        : 'bg-gray-50 text-gray-400 active:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-[10px] font-semibold leading-tight text-center">
                      {t.farmJournal.activities[activityTranslationKey[type]]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
              {t.farmJournal.titleField}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t.farmJournal.whatDidYouDo}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-navy placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
              {t.farmJournal.descriptionField}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t.farmJournal.descriptionField}
              rows={3}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-navy placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal resize-none"
            />
          </div>

          {/* Plot Selector */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
              Plot
            </label>
            <div className="relative">
              <select
                value={plotId}
                onChange={(e) => setPlotId(e.target.value)}
                className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
              >
                <option value="">Select a plot (optional)</option>
                {farmPlots.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {p.crop}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Photo Upload */}
          <div>
            <ImageUploader
              bucket="media"
              folder={`journal/${user?.id || 'anonymous'}`}
              value={photoPreview}
              onChange={(url) => setPhotoPreview(url || null)}
              label={t.farmJournal.addPhoto}
            />
          </div>

          {/* Mood Selector */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
              {t.farmJournal.howAreYou}
            </label>
            <div className="flex items-center gap-2 justify-between overflow-x-auto scrollbar-hide">
              {moodOptions.map((m) => (
                <button
                  key={m.key}
                  onClick={() => setMood(mood === m.key ? undefined : m.key)}
                  className={`flex flex-col items-center gap-0.5 px-2 py-2 rounded-xl transition-all min-w-[48px] min-h-[52px] ${
                    mood === m.key
                      ? 'bg-teal/10 ring-2 ring-teal/40'
                      : 'bg-gray-50 active:bg-gray-100'
                  }`}
                >
                  <m.icon className="w-6 h-6" style={{ color: m.color }} />
                  <span className="text-[9px] font-semibold text-gray-500">{t.farmJournal.moods[m.key as keyof typeof t.farmJournal.moods]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Cost */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
              {t.farmJournal.cost}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-400">
                USD
              </span>
              <input
                type="number"
                inputMode="decimal"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="0.00"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-14 pr-4 py-2.5 text-sm text-navy placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
              />
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSubmit}
            disabled={!canSave}
            className={`w-full py-3.5 rounded-2xl text-sm font-bold transition-all min-h-[48px] ${
              canSave
                ? 'bg-teal text-white active:bg-teal-dark shadow-lg shadow-[#8CB89C]/25'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {t.farmJournal.saveEntry}
          </button>
        </div>
      </motion.div>
    </>
  );
}

function PhotoViewer({ url, onClose }: { url: string; onClose: () => void }) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
        onClick={onClose}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center z-10 active:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5 text-white" />
        </button>
        <motion.img
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: 'spring' as const, stiffness: 260, damping: 20 }}
          src={url}
          alt="Full photo"
          className="max-w-[95vw] max-h-[85vh] object-contain rounded-xl"
          onClick={(e) => e.stopPropagation()}
        />
      </motion.div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Calendar View Component
// ---------------------------------------------------------------------------

function CalendarView({
  entries,
  onDateSelect,
}: {
  entries: JournalEntry[];
  onDateSelect: (date: string) => void;
}) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const daysInMonth = new Date(currentMonth.year, currentMonth.month + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentMonth.year, currentMonth.month, 1).getDay();
  const monthName = new Date(currentMonth.year, currentMonth.month, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Count entries per day
  const entryCounts: Record<string, { count: number; types: Set<ActivityType> }> = {};
  entries.forEach(e => {
    const d = e.date;
    if (!entryCounts[d]) entryCounts[d] = { count: 0, types: new Set() };
    entryCounts[d].count++;
    entryCounts[d].types.add(e.type);
  });

  const goToPrevMonth = () => {
    setCurrentMonth(prev => {
      if (prev.month === 0) return { year: prev.year - 1, month: 11 };
      return { ...prev, month: prev.month - 1 };
    });
  };

  const goToNextMonth = () => {
    setCurrentMonth(prev => {
      if (prev.month === 11) return { year: prev.year + 1, month: 0 };
      return { ...prev, month: prev.month + 1 };
    });
  };

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <div className="px-4">
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        {/* Month navigation */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
          <button onClick={goToPrevMonth} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
            <ChevronLeft size={16} className="text-gray-600" />
          </button>
          <span className="text-sm font-bold text-[#1B2A4A]">{monthName}</span>
          <button onClick={goToNextMonth} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
            <ChevronRight size={16} className="text-gray-600" />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 text-center px-2 pt-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <span key={d} className="text-[10px] font-semibold text-gray-400 uppercase py-1">{d}</span>
          ))}
        </div>

        {/* Day grid */}
        <div className="grid grid-cols-7 gap-0.5 px-2 pb-3">
          {days.map((day, idx) => {
            if (day === null) return <div key={idx} />;
            const dateStr = `${currentMonth.year}-${String(currentMonth.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const data = entryCounts[dateStr];
            const isToday = dateStr === todayStr;

            return (
              <button
                key={idx}
                onClick={() => data?.count ? onDateSelect(dateStr) : undefined}
                className={`relative flex flex-col items-center py-1.5 rounded-lg transition-colors min-h-[40px] ${
                  isToday ? 'bg-[#5DB347]/10 ring-1 ring-[#5DB347]/30' :
                  data?.count ? 'hover:bg-gray-50 cursor-pointer' : ''
                }`}
              >
                <span className={`text-xs font-medium ${
                  isToday ? 'text-[#5DB347] font-bold' :
                  data?.count ? 'text-[#1B2A4A]' : 'text-gray-400'
                }`}>
                  {day}
                </span>
                {data?.count ? (
                  <div className="flex gap-0.5 mt-0.5">
                    {data.count <= 3 ? (
                      Array.from({ length: Math.min(data.count, 3) }).map((_, i) => (
                        <span key={i} className="w-1 h-1 rounded-full bg-[#5DB347]" />
                      ))
                    ) : (
                      <span className="text-[8px] font-bold text-[#5DB347]">{data.count}</span>
                    )}
                  </div>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Crop Cycle Tracking Component
// ---------------------------------------------------------------------------

interface CropCycle {
  id: string;
  plotName: string;
  crop: string;
  variety: string;
  plantingDate: string;
  expectedHarvest: string;
  currentStage: string;
  stageProgress: number;
  totalDays: number;
  daysElapsed: number;
  stages: { name: string; startDay: number; endDay: number; current: boolean }[];
}

const MOCK_CROP_CYCLES: CropCycle[] = [
  {
    id: 'CC-001', plotName: 'Main Blueberry Field', crop: 'Blueberries', variety: 'Duke',
    plantingDate: '2025-09-15', expectedHarvest: '2026-04-20', currentStage: 'Fruiting',
    stageProgress: 82, totalDays: 217, daysElapsed: 207,
    stages: [
      { name: 'Planted', startDay: 0, endDay: 30, current: false },
      { name: 'Vegetative', startDay: 30, endDay: 90, current: false },
      { name: 'Flowering', startDay: 90, endDay: 150, current: false },
      { name: 'Fruiting', startDay: 150, endDay: 200, current: true },
      { name: 'Harvest', startDay: 200, endDay: 217, current: false },
    ],
  },
  {
    id: 'CC-002', plotName: 'Cassava Plot', crop: 'Cassava', variety: 'TMS 30572',
    plantingDate: '2025-12-01', expectedHarvest: '2026-09-30', currentStage: 'Vegetative',
    stageProgress: 44, totalDays: 304, daysElapsed: 131,
    stages: [
      { name: 'Planted', startDay: 0, endDay: 14, current: false },
      { name: 'Sprouting', startDay: 14, endDay: 45, current: false },
      { name: 'Vegetative', startDay: 45, endDay: 180, current: true },
      { name: 'Tuber Fill', startDay: 180, endDay: 270, current: false },
      { name: 'Harvest', startDay: 270, endDay: 304, current: false },
    ],
  },
  {
    id: 'CC-003', plotName: 'Sesame Strip', crop: 'Sesame', variety: 'S42 White',
    plantingDate: '2025-11-20', expectedHarvest: '2026-04-25', currentStage: 'Flowering',
    stageProgress: 90, totalDays: 157, daysElapsed: 142,
    stages: [
      { name: 'Planted', startDay: 0, endDay: 10, current: false },
      { name: 'Vegetative', startDay: 10, endDay: 50, current: false },
      { name: 'Flowering', startDay: 50, endDay: 100, current: true },
      { name: 'Maturing', startDay: 100, endDay: 140, current: false },
      { name: 'Harvest', startDay: 140, endDay: 157, current: false },
    ],
  },
  {
    id: 'CC-004', plotName: 'Maize Field', crop: 'Maize', variety: 'SC 513',
    plantingDate: '2026-03-01', expectedHarvest: '2026-07-15', currentStage: 'Germinating',
    stageProgress: 30, totalDays: 136, daysElapsed: 40,
    stages: [
      { name: 'Planted', startDay: 0, endDay: 7, current: false },
      { name: 'Germinating', startDay: 7, endDay: 21, current: true },
      { name: 'Vegetative', startDay: 21, endDay: 60, current: false },
      { name: 'Tasseling', startDay: 60, endDay: 80, current: false },
      { name: 'Grain Fill', startDay: 80, endDay: 120, current: false },
      { name: 'Harvest', startDay: 120, endDay: 136, current: false },
    ],
  },
];

function CropCycleTracker() {
  return (
    <div className="px-4 space-y-3">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-bold text-[#1B2A4A] flex items-center gap-1.5">
          <Activity size={14} className="text-[#5DB347]" />
          Crop Cycles
        </h3>
      </div>
      {MOCK_CROP_CYCLES.map((cycle) => (
        <div key={cycle.id} className="bg-white rounded-2xl border border-gray-100 p-3.5 shadow-sm">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-sm font-bold text-[#1B2A4A]">{cycle.crop} -- {cycle.variety}</p>
              <p className="text-[11px] text-gray-500">{cycle.plotName}</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#5DB347]/10 text-[#5DB347]">
              {cycle.currentStage}
            </span>
          </div>

          {/* Stage progress bar */}
          <div className="mt-3">
            <div className="flex gap-0.5 mb-1.5">
              {cycle.stages.map((stage, i) => {
                const width = ((stage.endDay - stage.startDay) / cycle.totalDays) * 100;
                const isPast = cycle.daysElapsed > stage.endDay;
                const isCurrent = stage.current;
                return (
                  <div
                    key={i}
                    className="relative group"
                    style={{ width: `${width}%` }}
                  >
                    <div className={`h-2 rounded-full transition-colors ${
                      isPast ? 'bg-[#5DB347]' :
                      isCurrent ? 'bg-[#5DB347]/60' :
                      'bg-gray-200'
                    }`} />
                    {isCurrent && (
                      <motion.div
                        className="absolute top-0 h-2 rounded-full bg-[#5DB347]"
                        style={{
                          width: `${Math.min(100, ((cycle.daysElapsed - stage.startDay) / (stage.endDay - stage.startDay)) * 100)}%`
                        }}
                        initial={{ width: 0 }}
                        animate={{
                          width: `${Math.min(100, ((cycle.daysElapsed - stage.startDay) / (stage.endDay - stage.startDay)) * 100)}%`
                        }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Stage labels */}
            <div className="flex justify-between">
              <span className="text-[9px] text-gray-400">{cycle.stages[0]?.name}</span>
              <span className="text-[9px] text-gray-400">{cycle.stages[cycle.stages.length - 1]?.name}</span>
            </div>
          </div>

          {/* Info row */}
          <div className="flex items-center gap-3 mt-2.5 text-[10px] text-gray-500">
            <span>Day {cycle.daysElapsed}/{cycle.totalDays}</span>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <span>{cycle.stageProgress}% complete</span>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <span>Harvest: {cycle.expectedHarvest}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page Component
// ---------------------------------------------------------------------------

export default function FarmJournalPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { activeFarm } = useFarm();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [farmPlots, setFarmPlots] = useState<FarmPlotOption[]>([]);

  // Load real farm plots for the current user
  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    (async () => {
      try {
        // Resolve member id
        const { data: m } = await supabase
          .from('members')
          .select('id')
          .eq('profile_id', user.id)
          .maybeSingle();
        const memberId = m?.id;
        let query = supabase.from('farm_plots').select('id, name, crop, variety');
        if (activeFarm?.id) query = query.eq('farm_id', activeFarm.id);
        else if (memberId) query = query.eq('member_id', memberId);
        const { data } = await query;
        if (data) {
          setFarmPlots(
            data.map((p: any) => ({
              id: p.id,
              name: p.name || 'Unnamed Plot',
              crop: p.crop || '',
              variety: p.variety || '',
            }))
          );
        }
      } catch { /* leave empty */ }
    })();
  }, [user, activeFarm?.id]);

  useEffect(() => {
    const supabase = createClient();
    const load = async () => {
      try {
        // Resolve member id for current user
        let memberId: string | null = null;
        if (user) {
          const { data: m } = await supabase
            .from('members')
            .select('id')
            .eq('profile_id', user.id)
            .maybeSingle();
          memberId = m?.id || null;
        }
        let query = supabase.from('farm_activities').select('*').order('date', { ascending: false });
        if (activeFarm?.id) query = query.eq('farm_id', activeFarm.id);
        else if (memberId) query = query.eq('member_id', memberId);
        else if (user) query = query.eq('member_id', user.id);
        const { data } = await query;
        if (data) {
          const mapped: JournalEntry[] = data.map((a: any) => ({
            id: a.id,
            date: a.date || a.created_at?.split('T')[0] || '',
            time: a.created_at?.split('T')[1]?.substring(0, 5) || '08:00',
            type: (a.type || 'other') as ActivityType,
            plotId: a.plot_id || undefined,
            plotName: undefined,
            title: a.description?.substring(0, 50) || a.type || 'Activity',
            description: a.description || '',
            photo: a.photo_url || undefined,
            mood: undefined,
            weather: undefined,
            cost: a.cost || undefined,
            currency: a.currency || 'USD',
          }));
          setEntries(mapped);
        }
      } catch { /* leave empty */ }
      setDataLoading(false);
    };
    load();
  }, [user, activeFarm?.id]);
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [plotFilter, setPlotFilter] = useState('all');
  const [activityFilter, setActivityFilter] = useState<ActivityType | 'all'>('all');
  const [viewPhotoUrl, setViewPhotoUrl] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'timeline' | 'gallery' | 'calendar'>('timeline');

  // Filter entries
  const filteredEntries = useMemo(() => {
    let result = entries;
    if (plotFilter !== 'all') {
      result = result.filter((e) => e.plotId === plotFilter);
    }
    if (activityFilter !== 'all') {
      result = result.filter((e) => e.type === activityFilter);
    }
    return result.sort((a, b) => {
      const dateCompare = b.date.localeCompare(a.date);
      if (dateCompare !== 0) return dateCompare;
      return b.time.localeCompare(a.time);
    });
  }, [entries, plotFilter, activityFilter]);

  // Group by date
  const grouped = useMemo(() => groupByDate(filteredEntries), [filteredEntries]);
  const sortedDates = useMemo(
    () => Object.keys(grouped).sort((a, b) => b.localeCompare(a)),
    [grouped],
  );

  const handleSaveEntry = async (entry: JournalEntry) => {
    // Save to DB first
    const supabase = createClient();
    try {
      // Resolve member id from auth user id
      let memberId: string | null = user?.id || null;
      if (user) {
        const { data: m } = await supabase
          .from('members')
          .select('id')
          .eq('profile_id', user.id)
          .maybeSingle();
        memberId = m?.id || user.id;
      }
      await supabase.from('farm_activities').insert({
        member_id: memberId,
        farm_id: activeFarm?.id || null,
        plot_id: entry.plotId || null,
        type: entry.type,
        date: entry.date,
        description: entry.description || entry.title,
        notes: entry.description || null,
        photo_url: entry.photo || null,
        cost: entry.cost || 0,
        currency: entry.currency || 'USD',
      });
    } catch {
      // fallback: still add to local state even if DB fails
    }
    setEntries((prev) => [entry, ...prev]);
    setShowNewEntry(false);
  };

  return (
    <div className="space-y-4 pb-4">
      {/* ─── New Entry + Export Buttons ─── */}
      <div className="px-4 pt-4 flex gap-2">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowNewEntry(true)}
          className="flex-1 bg-gradient-to-r from-[#8CB89C] to-[#729E82] text-white py-3.5 rounded-2xl text-sm font-bold shadow-lg shadow-[#8CB89C]/25 active:shadow-md transition-shadow flex items-center justify-center gap-2 min-h-[48px]"
        >
          <Plus className="w-5 h-5" />
          {t.farmJournal.whatDidYouDo}
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            // Generate a basic CSV export
            const header = 'Date,Time,Type,Plot,Title,Description,Cost\n';
            const rows = entries.map(e =>
              `${e.date},${e.time},${e.type},${e.plotName || ''},${e.title.replace(/,/g, ';')},${e.description.replace(/,/g, ';')},${e.cost || 0}`
            ).join('\n');
            const blob = new Blob([header + rows], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `farm-journal-${new Date().toISOString().slice(0, 10)}.csv`;
            a.click();
            URL.revokeObjectURL(url);
          }}
          className="w-14 bg-white border-2 border-gray-200 text-[#1B2A4A] rounded-2xl flex items-center justify-center min-h-[48px] hover:border-[#5DB347] transition-colors"
          title="Export Journal"
        >
          <FileText className="w-5 h-5" />
        </motion.button>
      </div>

      {/* ─── Stats Bar ─── */}
      <StatsBar entries={entries} />

      {/* ─── Filter Bar ─── */}
      <FilterBar
        plotFilter={plotFilter}
        setPlotFilter={setPlotFilter}
        activityFilter={activityFilter}
        setActivityFilter={setActivityFilter}
        farmPlots={farmPlots}
      />

      {/* ─── View Toggle: Timeline / Calendar / Gallery ─── */}
      <div className="px-4 flex gap-2">
        {([
          { key: 'timeline' as const, label: 'Timeline', icon: <BookOpen className="w-3.5 h-3.5" /> },
          { key: 'calendar' as const, label: 'Calendar', icon: <Calendar className="w-3.5 h-3.5" /> },
          { key: 'gallery' as const, label: t.farmJournal.photos, icon: <ImageIcon className="w-3.5 h-3.5" /> },
        ]).map((v) => (
          <button
            key={v.key}
            onClick={() => setViewMode(v.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-colors min-h-[36px] ${
              viewMode === v.key ? 'bg-navy text-white' : 'bg-gray-100 text-gray-500 active:bg-gray-200'
            }`}
          >
            {v.icon}
            {v.label}
          </button>
        ))}
      </div>

      {/* ─── Main Content ─── */}
      {viewMode === 'gallery' ? (
        <PhotoGallery entries={filteredEntries} onPhotoTap={setViewPhotoUrl} />
      ) : viewMode === 'calendar' ? (
        <>
          <CalendarView
            entries={filteredEntries}
            onDateSelect={() => {
              setViewMode('timeline');
            }}
          />
          <CropCycleTracker />
        </>
      ) : (
        <>
          {/* Journal Timeline */}
          {sortedDates.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <BookOpen className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-sm font-medium text-gray-400">No entries found</p>
              <p className="text-xs text-gray-300 mt-1">Try changing your filters or add a new entry</p>
            </div>
          ) : (
            <motion.div
              variants={listContainerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-5 px-4"
            >
              {sortedDates.map((date) => (
                <div key={date} className="space-y-2.5">
                  {/* Date header */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-navy">{formatDateHeader(date, t.common.today, t.common.yesterday)}</span>
                    <div className="flex-1 h-px bg-gray-100" />
                    <span className="text-[11px] text-gray-400 font-medium">
                      {grouped[date].length} {grouped[date].length === 1 ? 'entry' : 'entries'}
                    </span>
                  </div>

                  {/* Entries for this date */}
                  {grouped[date].map((entry) => (
                    <JournalCard
                      key={entry.id}
                      entry={entry}
                      expanded={expandedId === entry.id}
                      onToggle={() =>
                        setExpandedId((prev) => (prev === entry.id ? null : entry.id))
                      }
                      onPhotoTap={setViewPhotoUrl}
                    />
                  ))}
                </div>
              ))}
            </motion.div>
          )}
        </>
      )}

      {/* ─── New Entry Modal ─── */}
      <AnimatePresence>
        {showNewEntry && (
          <NewEntryForm
            onClose={() => setShowNewEntry(false)}
            onSave={handleSaveEntry}
            farmPlots={farmPlots}
          />
        )}
      </AnimatePresence>

      {/* ─── Photo Viewer Modal ─── */}
      <AnimatePresence>
        {viewPhotoUrl && (
          <PhotoViewer url={viewPhotoUrl} onClose={() => setViewPhotoUrl(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
