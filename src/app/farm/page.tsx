'use client';

import { useState, useMemo } from 'react';
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
import {
  farmPlots,
  weatherForecast,
  farmTasks as initialFarmTasks,
  farmActivities,
  getFarmSummary,
} from '@/lib/data/farm';
import type { WeatherCondition, ActivityType, FarmTask } from '@/lib/data/farm';

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

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
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
      return <Scissors size={size} className={`${cls} text-teal`} />;
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
  harvesting: 'bg-teal-light text-teal-dark',
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
  const summary = useMemo(() => getFarmSummary(), []);
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
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
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
              {getGreeting()}, Kgosi!
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
              Take a crop photo
            </Link>
          </div>
        </div>
      </motion.section>

      {/* ================================================================= */}
      {/* 2. WEATHER STRIP (7-day horizontal scroll)                        */}
      {/* ================================================================= */}
      <motion.section variants={itemVariants}>
        <div className="px-4 mb-2 flex items-center justify-between">
          <h3 className="text-sm font-bold text-navy">7-Day Forecast</h3>
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
                    ? 'bg-teal/10 border-2 border-teal'
                    : 'bg-white border border-gray-100'
                }`}
              >
                <span
                  className={`text-[11px] font-semibold ${
                    isToday ? 'text-teal' : 'text-gray-500'
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
              <div className="mt-2 rounded-xl bg-teal/5 border border-teal/20 p-3 flex items-start gap-2">
                <Sparkles size={14} className="text-teal shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-teal mb-0.5">
                    {weatherForecast[selectedWeatherDay].day} &mdash; Advice
                  </p>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {weatherForecast[selectedWeatherDay].advice}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedWeatherDay(null)}
                  className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full hover:bg-teal/10"
                >
                  <X size={12} className="text-gray-400" />
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
          <h3 className="text-sm font-bold text-navy">My Plots</h3>
          <Link
            href="/farm/crops"
            className="text-xs text-teal font-medium flex items-center gap-0.5"
          >
            See all <ChevronRight size={14} />
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
                      className="h-full rounded-full bg-teal transition-all"
                      style={{ width: `${plot.progressPercent}%` }}
                    />
                  </div>
                </div>

                <p className="text-[11px] text-gray-500 mt-2 flex items-center gap-1">
                  <Leaf size={11} className="text-teal" />
                  {plot.daysToHarvest} days to harvest
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
            Today&apos;s Tasks{' '}
            <span className="text-xs font-normal text-gray-400">
              ({tasks.filter((t) => !t.completed).length} pending)
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
                {/* Checkbox */}
                <button
                  onClick={() => toggleTask(task.id)}
                  className={`shrink-0 mt-0.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                    task.completed
                      ? 'bg-teal border-teal'
                      : 'border-gray-200 active:border-teal'
                  }`}
                >
                  {task.completed && <Check size={14} className="text-white" />}
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
                  {badge.label}
                </span>
              </motion.div>
            );
          })}

          {/* Add task button */}
          <Link
            href="/farm/journal"
            className="flex items-center justify-center gap-2 p-3 text-sm text-teal font-medium active:bg-teal/5 transition-colors min-h-[44px]"
          >
            <Plus size={16} />
            Add Task
          </Link>
        </div>
      </motion.section>

      {/* ================================================================= */}
      {/* 5. QUICK STATS ROW                                                */}
      {/* ================================================================= */}
      <motion.section variants={itemVariants} className="px-4">
        <h3 className="text-sm font-bold text-navy mb-2">Quick Stats</h3>
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
              <span className="text-[11px] text-gray-400">Income</span>
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
              <span className="text-[11px] text-gray-400">Expenses</span>
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
              <div className="w-7 h-7 rounded-lg bg-teal-light flex items-center justify-center">
                <TrendingUp size={14} className="text-teal" />
              </div>
              <span className="text-[11px] text-gray-400">Profit</span>
            </div>
            <p className="text-lg font-bold text-teal">
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
              <span className="text-[11px] text-gray-400">Health Score</span>
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
          <h3 className="text-sm font-bold text-navy">Recent Activity</h3>
          <Link
            href="/farm/journal"
            className="text-xs text-teal font-medium flex items-center gap-0.5"
          >
            View All <ChevronRight size={14} />
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
        <div className="rounded-2xl bg-gradient-to-br from-teal to-teal-dark p-4 text-white relative overflow-hidden">
          {/* Decorative */}
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full" />
          <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/5 rounded-full" />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={16} className="text-gold" />
              <span className="text-xs font-bold text-white/80 uppercase tracking-wide">
                AI Tip of the Day
              </span>
            </div>
            <p className="text-sm leading-relaxed text-white/95">
              {today.advice}
            </p>
            <Link
              href="/farm/assistant"
              className="inline-flex items-center gap-2 mt-3 px-4 py-2.5 rounded-xl bg-white/15 active:bg-white/25 text-sm font-medium transition-colors min-h-[44px]"
            >
              Ask AI Assistant
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
}
