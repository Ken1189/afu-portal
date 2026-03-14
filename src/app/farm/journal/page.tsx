'use client';

import { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/lib/i18n/LanguageContext';
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
} from 'lucide-react';
import {
  journalEntries as initialEntries,
  farmPlots,
  type JournalEntry,
  type ActivityType,
  type WeatherCondition,
} from '@/lib/data/farm';

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
  scouting: { label: 'Scouting', icon: Search, color: 'text-teal-600', bgColor: 'bg-teal-100', borderColor: 'border-teal-500' },
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

const moodOptions: { key: JournalEntry['mood']; emoji: string; label: string }[] = [
  { key: 'great', emoji: '\u{1F60A}', label: 'Great' },
  { key: 'good', emoji: '\u{1F642}', label: 'Good' },
  { key: 'okay', emoji: '\u{1F610}', label: 'Okay' },
  { key: 'concerned', emoji: '\u{1F61F}', label: 'Concerned' },
  { key: 'worried', emoji: '\u{1F630}', label: 'Worried' },
];

const moodEmoji: Record<string, string> = {
  great: '\u{1F60A}',
  good: '\u{1F642}',
  okay: '\u{1F610}',
  concerned: '\u{1F61F}',
  worried: '\u{1F630}',
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
}: {
  plotFilter: string;
  setPlotFilter: (v: string) => void;
  activityFilter: ActivityType | 'all';
  setActivityFilter: (v: ActivityType | 'all') => void;
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
              {entry.mood && (
                <span className="text-base leading-none">{moodEmoji[entry.mood]}</span>
              )}
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
                {entry.mood && (
                  <span className="text-[11px] font-medium bg-gray-50 text-gray-500 px-2 py-0.5 rounded-full">
                    {moodEmoji[entry.mood]} {t.farmJournal.moods[entry.mood as keyof typeof t.farmJournal.moods]}
                  </span>
                )}
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
        className="grid grid-cols-3 gap-2"
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

function NewEntryForm({ onClose, onSave }: { onClose: () => void; onSave: (entry: JournalEntry) => void }) {
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activityType, setActivityType] = useState<ActivityType | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [plotId, setPlotId] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [mood, setMood] = useState<JournalEntry['mood']>(undefined);
  const [cost, setCost] = useState('');

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

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

          {/* Photo Button */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoChange}
              className="hidden"
            />
            {photoPreview ? (
              <div className="relative">
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="w-full max-h-[180px] object-cover rounded-xl"
                />
                <button
                  onClick={() => {
                    setPhotoPreview(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="absolute top-2 right-2 w-7 h-7 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl py-3 text-sm font-medium text-gray-500 active:bg-gray-100 transition-colors min-h-[48px]"
              >
                <Camera className="w-5 h-5" />
                {t.farmJournal.addPhoto}
              </button>
            )}
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
                  <span className="text-2xl leading-none">{m.emoji}</span>
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
                ? 'bg-teal text-white active:bg-teal-dark shadow-lg shadow-teal/25'
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
// Main Page Component
// ---------------------------------------------------------------------------

export default function FarmJournalPage() {
  const { t } = useLanguage();
  const [entries, setEntries] = useState<JournalEntry[]>(initialEntries);
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [plotFilter, setPlotFilter] = useState('all');
  const [activityFilter, setActivityFilter] = useState<ActivityType | 'all'>('all');
  const [viewPhotoUrl, setViewPhotoUrl] = useState<string | null>(null);
  const [showGallery, setShowGallery] = useState(false);

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

  const handleSaveEntry = (entry: JournalEntry) => {
    setEntries((prev) => [entry, ...prev]);
    setShowNewEntry(false);
  };

  return (
    <div className="space-y-4 pb-4">
      {/* ─── New Entry Button ─── */}
      <div className="px-4 pt-4">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowNewEntry(true)}
          className="w-full bg-gradient-to-r from-teal to-teal-dark text-white py-3.5 rounded-2xl text-sm font-bold shadow-lg shadow-teal/25 active:shadow-md transition-shadow flex items-center justify-center gap-2 min-h-[48px]"
        >
          <Plus className="w-5 h-5" />
          {t.farmJournal.whatDidYouDo}
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
      />

      {/* ─── View Toggle: Timeline / Gallery ─── */}
      <div className="px-4 flex gap-2">
        <button
          onClick={() => setShowGallery(false)}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-colors min-h-[36px] ${
            !showGallery ? 'bg-navy text-white' : 'bg-gray-100 text-gray-500 active:bg-gray-200'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          Timeline
        </button>
        <button
          onClick={() => setShowGallery(true)}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-colors min-h-[36px] ${
            showGallery ? 'bg-navy text-white' : 'bg-gray-100 text-gray-500 active:bg-gray-200'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          {t.farmJournal.photos}
        </button>
      </div>

      {/* ─── Main Content ─── */}
      {showGallery ? (
        <PhotoGallery entries={filteredEntries} onPhotoTap={setViewPhotoUrl} />
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
