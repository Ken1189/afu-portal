'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CloudSun,
  Sun,
  Cloud,
  CloudRain,
  CloudLightning,
  CloudDrizzle,
  Thermometer,
  Wind,
  Droplets,
  Eye,
  Gauge,
  Sunrise,
  Sunset,
  AlertTriangle,
  ShieldAlert,
  Sprout,
  ArrowUp,
  ArrowDown,
  MapPin,
  Calendar,
  Waves,
  Flame,
  Snowflake,
  Leaf,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Clock,
  ChevronRight,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Animation Variants
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

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 100,
      damping: 15,
    },
  },
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DayForecast {
  day: string;
  date: string;
  icon: 'sun' | 'cloud' | 'cloud-sun' | 'rain' | 'storm' | 'drizzle';
  high: number;
  low: number;
  rainfall: number;
  wind: number;
  advice: string;
}

interface WeatherAlert {
  id: string;
  severity: 'red' | 'amber' | 'green';
  title: string;
  description: string;
  time: string;
  icon: React.ElementType;
}

interface AgriculturalIndex {
  name: string;
  value: number;
  max: number;
  unit: string;
  status: 'low' | 'moderate' | 'high' | 'optimal';
  icon: React.ElementType;
}

interface MonthComparison {
  metric: string;
  thisYear: string;
  lastYear: string;
  change: 'up' | 'down' | 'same';
  changeValue: string;
}

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const currentConditions = {
  temperature: 28,
  feelsLike: 31,
  condition: 'Partly Cloudy',
  humidity: 62,
  windSpeed: 14,
  windDirection: 'NE',
  pressure: 1013,
  uvIndex: 7,
  sunrise: '05:42',
  sunset: '18:28',
  location: 'Gaborone, Botswana',
  visibility: 12,
  dewPoint: 20,
};

const sevenDayForecast: DayForecast[] = [
  { day: 'Today', date: 'Mar 16', icon: 'cloud-sun', high: 28, low: 18, rainfall: 10, wind: 14, advice: 'Good for spraying' },
  { day: 'Tuesday', date: 'Mar 17', icon: 'sun', high: 31, low: 19, rainfall: 0, wind: 8, advice: 'Ideal for harvesting' },
  { day: 'Wednesday', date: 'Mar 18', icon: 'sun', high: 33, low: 21, rainfall: 0, wind: 10, advice: 'Irrigate early morning' },
  { day: 'Thursday', date: 'Mar 19', icon: 'rain', high: 24, low: 17, rainfall: 65, wind: 22, advice: 'Delay planting' },
  { day: 'Friday', date: 'Mar 20', icon: 'drizzle', high: 22, low: 16, rainfall: 40, wind: 18, advice: 'Light field work only' },
  { day: 'Saturday', date: 'Mar 21', icon: 'cloud', high: 25, low: 17, rainfall: 15, wind: 12, advice: 'Good for transplanting' },
  { day: 'Sunday', date: 'Mar 22', icon: 'cloud-sun', high: 27, low: 18, rainfall: 5, wind: 10, advice: 'Optimal planting window' },
];

const weatherAlerts: WeatherAlert[] = [
  {
    id: 'alert-1',
    severity: 'red',
    title: 'Heat Wave Warning',
    description: 'Temperatures expected to exceed 35\u00B0C on Tuesday and Wednesday. Ensure adequate irrigation for all crops and provide shade for livestock. Avoid field work between 11:00-15:00.',
    time: '2 hours ago',
    icon: Flame,
  },
  {
    id: 'alert-2',
    severity: 'amber',
    title: 'Rainfall Expected Thursday',
    description: 'Heavy rainfall of 40-65mm expected Thursday through Friday. Secure loose equipment, check drainage channels, and postpone any spraying activities until Saturday.',
    time: '5 hours ago',
    icon: CloudRain,
  },
  {
    id: 'alert-3',
    severity: 'green',
    title: 'Optimal Planting Window Next Week',
    description: 'Soil moisture and temperature conditions will be ideal for planting maize and sorghum from Sunday onwards. Prepare seedbeds and ensure seed stock is ready.',
    time: '1 day ago',
    icon: Sprout,
  },
];

const agriculturalIndices: AgriculturalIndex[] = [
  { name: 'Soil Moisture Index', value: 68, max: 100, unit: '%', status: 'optimal', icon: Droplets },
  { name: 'Evapotranspiration Rate', value: 5.2, max: 10, unit: 'mm/day', status: 'moderate', icon: Waves },
  { name: 'Growing Degree Days', value: 1240, max: 2000, unit: 'GDD', status: 'high', icon: Thermometer },
  { name: 'Frost Risk', value: 5, max: 100, unit: '%', status: 'low', icon: Snowflake },
  { name: 'Crop Stress Index', value: 32, max: 100, unit: '%', status: 'moderate', icon: Leaf },
];

const historicalComparison: MonthComparison[] = [
  { metric: 'Average Temperature', thisYear: '27.3\u00B0C', lastYear: '25.8\u00B0C', change: 'up', changeValue: '+1.5\u00B0C' },
  { metric: 'Total Rainfall', thisYear: '78mm', lastYear: '112mm', change: 'down', changeValue: '-34mm' },
  { metric: 'Sunny Days', thisYear: '18', lastYear: '14', change: 'up', changeValue: '+4 days' },
  { metric: 'Avg Humidity', thisYear: '58%', lastYear: '65%', change: 'down', changeValue: '-7%' },
  { metric: 'Wind Speed (avg)', thisYear: '12 km/h', lastYear: '10 km/h', change: 'up', changeValue: '+2 km/h' },
];

// ---------------------------------------------------------------------------
// Helper Components
// ---------------------------------------------------------------------------

function WeatherIcon({ type, className = 'w-6 h-6' }: { type: DayForecast['icon']; className?: string }) {
  const icons: Record<DayForecast['icon'], React.ElementType> = {
    sun: Sun,
    cloud: Cloud,
    'cloud-sun': CloudSun,
    rain: CloudRain,
    storm: CloudLightning,
    drizzle: CloudDrizzle,
  };
  const Icon = icons[type];
  const colors: Record<DayForecast['icon'], string> = {
    sun: 'text-amber-500',
    cloud: 'text-gray-400',
    'cloud-sun': 'text-amber-400',
    rain: 'text-blue-500',
    storm: 'text-purple-500',
    drizzle: 'text-blue-400',
  };
  return <Icon className={`${className} ${colors[type]}`} />;
}

function SeverityBadge({ severity }: { severity: WeatherAlert['severity'] }) {
  const config = {
    red: { label: 'Critical', bg: 'bg-red-100 text-red-700 border-red-200' },
    amber: { label: 'Warning', bg: 'bg-amber-100 text-amber-700 border-amber-200' },
    green: { label: 'Advisory', bg: 'bg-green-100 text-green-700 border-green-200' },
  };
  const c = config[severity];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${c.bg}`}>
      {c.label}
    </span>
  );
}

function StatusIndicator({ status }: { status: AgriculturalIndex['status'] }) {
  const config = {
    low: { label: 'Low', color: 'text-blue-600 bg-blue-50' },
    moderate: { label: 'Moderate', color: 'text-amber-600 bg-amber-50' },
    high: { label: 'High', color: 'text-red-600 bg-red-50' },
    optimal: { label: 'Optimal', color: 'text-green-600 bg-green-50' },
  };
  const c = config[status];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${c.color}`}>
      {c.label}
    </span>
  );
}

function ProgressBar({ value, max, status }: { value: number; max: number; status: AgriculturalIndex['status'] }) {
  const pct = Math.min((value / max) * 100, 100);
  const barColors = {
    low: 'bg-blue-500',
    moderate: 'bg-amber-500',
    high: 'bg-red-500',
    optimal: 'bg-green-500',
  };
  return (
    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-700 ${barColors[status]}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function WeatherPage() {
  const [selectedDay, setSelectedDay] = useState<number>(0);
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-gray-50"
    >
      {/* ─── Header Banner ─── */}
      <motion.div
        variants={cardVariants}
        className="bg-gradient-to-r from-sky-400 via-sky-500 to-[#1B2A4A] px-4 lg:px-6 py-8 lg:py-12"
      >
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <CloudSun className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-white">Weather Forecast</h1>
              <p className="text-sky-100 text-sm lg:text-base">Plan your farming activities with accurate forecasts</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sky-200 text-sm mt-4">
            <MapPin className="w-4 h-4" />
            <span>{currentConditions.location}</span>
            <span className="mx-2">|</span>
            <Calendar className="w-4 h-4" />
            <span>March 16, 2026</span>
          </div>
        </div>
      </motion.div>

      <div className="max-w-5xl mx-auto px-4 lg:px-6 py-6 space-y-6">

        {/* ─── Current Conditions Card ─── */}
        <motion.div variants={cardVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 lg:p-8">
            <div className="flex items-center gap-2 mb-6">
              <h2 className="text-lg font-bold text-[#1B2A4A]">Current Conditions</h2>
              <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">Live</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Temperature Display */}
              <div className="flex items-center gap-4 lg:col-span-1">
                <div className="relative">
                  <CloudSun className="w-20 h-20 text-amber-400" />
                </div>
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl lg:text-6xl font-bold text-[#1B2A4A]">{currentConditions.temperature}</span>
                    <span className="text-2xl text-gray-400">&deg;C</span>
                  </div>
                  <p className="text-gray-500 text-sm mt-1">
                    Feels like <span className="font-semibold text-[#1B2A4A]">{currentConditions.feelsLike}&deg;C</span>
                  </p>
                  <p className="text-[#2AA198] font-medium text-sm">{currentConditions.condition}</p>
                </div>
              </div>

              {/* Weather Details Grid */}
              <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                    <Droplets className="w-3.5 h-3.5" />
                    Humidity
                  </div>
                  <p className="text-lg font-bold text-[#1B2A4A]">{currentConditions.humidity}%</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                    <Wind className="w-3.5 h-3.5" />
                    Wind
                  </div>
                  <p className="text-lg font-bold text-[#1B2A4A]">{currentConditions.windSpeed} km/h</p>
                  <p className="text-xs text-gray-400">{currentConditions.windDirection}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                    <Gauge className="w-3.5 h-3.5" />
                    Pressure
                  </div>
                  <p className="text-lg font-bold text-[#1B2A4A]">{currentConditions.pressure} hPa</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                    <Sun className="w-3.5 h-3.5" />
                    UV Index
                  </div>
                  <p className="text-lg font-bold text-amber-600">{currentConditions.uvIndex}</p>
                  <p className="text-xs text-amber-500">High</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                    <Sunrise className="w-3.5 h-3.5" />
                    Sunrise
                  </div>
                  <p className="text-lg font-bold text-[#1B2A4A]">{currentConditions.sunrise}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                    <Sunset className="w-3.5 h-3.5" />
                    Sunset
                  </div>
                  <p className="text-lg font-bold text-[#1B2A4A]">{currentConditions.sunset}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ─── 7-Day Forecast ─── */}
        <motion.div variants={cardVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 lg:p-8">
            <h2 className="text-lg font-bold text-[#1B2A4A] mb-4">7-Day Forecast</h2>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-thin">
              {sevenDayForecast.map((day, idx) => (
                <button
                  key={day.day}
                  onClick={() => setSelectedDay(idx)}
                  className={`flex-shrink-0 w-[140px] rounded-2xl p-4 transition-all border-2 ${
                    selectedDay === idx
                      ? 'border-[#2AA198] bg-[#2AA198]/5 shadow-sm'
                      : 'border-transparent bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <p className={`text-sm font-semibold mb-1 ${selectedDay === idx ? 'text-[#2AA198]' : 'text-[#1B2A4A]'}`}>
                    {day.day}
                  </p>
                  <p className="text-xs text-gray-400 mb-3">{day.date}</p>
                  <WeatherIcon type={day.icon} className="w-10 h-10 mx-auto mb-3" />
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-lg font-bold text-[#1B2A4A]">{day.high}&deg;</span>
                    <span className="text-sm text-gray-400">{day.low}&deg;</span>
                  </div>
                  <div className="flex items-center justify-center gap-1 text-xs text-blue-500 mb-2">
                    <Droplets className="w-3 h-3" />
                    <span>{day.rainfall}%</span>
                  </div>
                  <div className="flex items-center justify-center gap-1 text-xs text-gray-400 mb-3">
                    <Wind className="w-3 h-3" />
                    <span>{day.wind} km/h</span>
                  </div>
                  <div className={`text-[10px] font-medium rounded-lg px-2 py-1 text-center ${
                    selectedDay === idx ? 'bg-[#2AA198]/10 text-[#2AA198]' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {day.advice}
                  </div>
                </button>
              ))}
            </div>

            {/* Selected Day Detail */}
            <motion.div
              key={selectedDay}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-6 bg-gradient-to-r from-[#2AA198]/5 to-sky-50 rounded-2xl p-5 border border-[#2AA198]/10"
            >
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <WeatherIcon type={sevenDayForecast[selectedDay].icon} className="w-12 h-12" />
                  <div>
                    <p className="font-bold text-[#1B2A4A] text-lg">{sevenDayForecast[selectedDay].day}</p>
                    <p className="text-sm text-gray-500">{sevenDayForecast[selectedDay].date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-xs text-gray-400">High</p>
                    <p className="text-xl font-bold text-red-500">{sevenDayForecast[selectedDay].high}&deg;C</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-400">Low</p>
                    <p className="text-xl font-bold text-blue-500">{sevenDayForecast[selectedDay].low}&deg;C</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-400">Rain</p>
                    <p className="text-xl font-bold text-sky-500">{sevenDayForecast[selectedDay].rainfall}%</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 bg-white/70 rounded-xl px-4 py-3">
                <Sprout className="w-5 h-5 text-[#2AA198]" />
                <p className="text-sm font-medium text-[#1B2A4A]">
                  Farm Advice: <span className="text-[#2AA198]">{sevenDayForecast[selectedDay].advice}</span>
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* ─── Farm Weather Alerts ─── */}
        <motion.div variants={cardVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 lg:p-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-[#D4A843]" />
                <h2 className="text-lg font-bold text-[#1B2A4A]">Farm Weather Alerts</h2>
              </div>
              <span className="text-xs font-semibold text-white bg-red-500 px-2.5 py-1 rounded-full">
                {weatherAlerts.length} Active
              </span>
            </div>
            <div className="space-y-3">
              {weatherAlerts.map((alert) => {
                const AlertIcon = alert.icon;
                const borderColors = {
                  red: 'border-l-red-500 bg-red-50/50',
                  amber: 'border-l-amber-500 bg-amber-50/50',
                  green: 'border-l-green-500 bg-green-50/50',
                };
                const iconBg = {
                  red: 'bg-red-100 text-red-600',
                  amber: 'bg-amber-100 text-amber-600',
                  green: 'bg-green-100 text-green-600',
                };
                const isExpanded = expandedAlert === alert.id;
                return (
                  <motion.button
                    key={alert.id}
                    onClick={() => setExpandedAlert(isExpanded ? null : alert.id)}
                    className={`w-full text-left rounded-xl border-l-4 p-4 transition-all ${borderColors[alert.severity]}`}
                    whileHover={{ scale: 1.005 }}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg[alert.severity]}`}>
                        <AlertIcon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="font-semibold text-[#1B2A4A] text-sm">{alert.title}</h3>
                          <SeverityBadge severity={alert.severity} />
                        </div>
                        <p className={`text-sm text-gray-600 ${isExpanded ? '' : 'line-clamp-2'}`}>
                          {alert.description}
                        </p>
                        <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                          <Clock className="w-3 h-3" />
                          {alert.time}
                        </div>
                      </div>
                      <ChevronRight className={`w-5 h-5 text-gray-300 flex-shrink-0 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* ─── Agricultural Indices ─── */}
        <motion.div variants={cardVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 lg:p-8">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="w-5 h-5 text-[#2AA198]" />
              <h2 className="text-lg font-bold text-[#1B2A4A]">Agricultural Indices</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {agriculturalIndices.map((index) => {
                const Icon = index.icon;
                return (
                  <div key={index.name} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center">
                          <Icon className="w-4 h-4 text-[#2AA198]" />
                        </div>
                        <p className="text-sm font-medium text-[#1B2A4A]">{index.name}</p>
                      </div>
                    </div>
                    <div className="flex items-end justify-between mb-2">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-[#1B2A4A]">{index.value}</span>
                        <span className="text-xs text-gray-400">{index.unit}</span>
                      </div>
                      <StatusIndicator status={index.status} />
                    </div>
                    <ProgressBar value={index.value} max={index.max} status={index.status} />
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* ─── Historical Comparison ─── */}
        <motion.div variants={cardVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 lg:p-8">
            <div className="flex items-center gap-2 mb-6">
              <Calendar className="w-5 h-5 text-[#D4A843]" />
              <h2 className="text-lg font-bold text-[#1B2A4A]">Historical Comparison</h2>
              <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">March 2026 vs March 2025</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-4 text-gray-400 font-medium text-xs uppercase tracking-wider">Metric</th>
                    <th className="text-center py-3 px-4 text-gray-400 font-medium text-xs uppercase tracking-wider">This Year</th>
                    <th className="text-center py-3 px-4 text-gray-400 font-medium text-xs uppercase tracking-wider">Last Year</th>
                    <th className="text-center py-3 px-4 text-gray-400 font-medium text-xs uppercase tracking-wider">Change</th>
                  </tr>
                </thead>
                <tbody>
                  {historicalComparison.map((row) => (
                    <tr key={row.metric} className="border-b border-gray-50 last:border-0">
                      <td className="py-3 px-4 font-medium text-[#1B2A4A]">{row.metric}</td>
                      <td className="py-3 px-4 text-center font-semibold text-[#1B2A4A]">{row.thisYear}</td>
                      <td className="py-3 px-4 text-center text-gray-500">{row.lastYear}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1">
                          {row.change === 'up' ? (
                            <ArrowUp className="w-4 h-4 text-red-500" />
                          ) : row.change === 'down' ? (
                            <ArrowDown className="w-4 h-4 text-blue-500" />
                          ) : (
                            <span className="w-4 h-4 text-gray-400">=</span>
                          )}
                          <span className={`font-semibold text-sm ${
                            row.change === 'up' ? 'text-red-500' : row.change === 'down' ? 'text-blue-500' : 'text-gray-400'
                          }`}>
                            {row.changeValue}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>

        {/* Bottom spacer for mobile nav */}
        <div className="h-4" />
      </div>
    </motion.div>
  );
}
