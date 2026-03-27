'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  CloudSun,
  Sun,
  Cloud,
  CloudRain,
  CloudLightning,
  CloudDrizzle,
  CloudSnow,
  CloudFog,
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
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/lib/supabase/auth-context';

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
// Country Coordinates
// ---------------------------------------------------------------------------

const COUNTRY_COORDS: Record<string, { lat: number; lng: number; city: string }> = {
  Zimbabwe: { lat: -17.83, lng: 31.05, city: 'Harare' },
  ZW: { lat: -17.83, lng: 31.05, city: 'Harare' },
  Uganda: { lat: 0.35, lng: 32.58, city: 'Kampala' },
  UG: { lat: 0.35, lng: 32.58, city: 'Kampala' },
  Kenya: { lat: -1.29, lng: 36.82, city: 'Nairobi' },
  KE: { lat: -1.29, lng: 36.82, city: 'Nairobi' },
  Tanzania: { lat: -6.79, lng: 39.28, city: 'Dar es Salaam' },
  TZ: { lat: -6.79, lng: 39.28, city: 'Dar es Salaam' },
  Nigeria: { lat: 9.06, lng: 7.49, city: 'Abuja' },
  NG: { lat: 9.06, lng: 7.49, city: 'Abuja' },
  'South Africa': { lat: -33.93, lng: 18.42, city: 'Cape Town' },
  ZA: { lat: -33.93, lng: 18.42, city: 'Cape Town' },
  Ghana: { lat: 5.56, lng: -0.19, city: 'Accra' },
  GH: { lat: 5.56, lng: -0.19, city: 'Accra' },
  Zambia: { lat: -15.39, lng: 28.32, city: 'Lusaka' },
  ZM: { lat: -15.39, lng: 28.32, city: 'Lusaka' },
  Mozambique: { lat: -25.97, lng: 32.57, city: 'Maputo' },
  MZ: { lat: -25.97, lng: 32.57, city: 'Maputo' },
  Botswana: { lat: -24.65, lng: 25.91, city: 'Gaborone' },
  BW: { lat: -24.65, lng: 25.91, city: 'Gaborone' },
};

const DEFAULT_COORDS = { lat: -24.65, lng: 25.91, city: 'Gaborone' };

// ---------------------------------------------------------------------------
// WMO Weather Code Mapping
// ---------------------------------------------------------------------------

type IconType = 'sun' | 'cloud' | 'cloud-sun' | 'rain' | 'storm' | 'drizzle' | 'snow' | 'fog';

function wmoToIcon(code: number): IconType {
  if (code === 0) return 'sun';
  if (code === 1 || code === 2) return 'cloud-sun';
  if (code === 3) return 'cloud';
  if (code >= 45 && code <= 48) return 'fog';
  if (code >= 51 && code <= 57) return 'drizzle';
  if (code >= 61 && code <= 67) return 'rain';
  if (code >= 71 && code <= 77) return 'snow';
  if (code >= 80 && code <= 82) return 'rain';
  if (code >= 85 && code <= 86) return 'snow';
  if (code >= 95 && code <= 99) return 'storm';
  return 'cloud';
}

function wmoToCondition(code: number): string {
  if (code === 0) return 'Clear Sky';
  if (code === 1) return 'Mainly Clear';
  if (code === 2) return 'Partly Cloudy';
  if (code === 3) return 'Overcast';
  if (code >= 45 && code <= 48) return 'Foggy';
  if (code >= 51 && code <= 55) return 'Drizzle';
  if (code === 56 || code === 57) return 'Freezing Drizzle';
  if (code >= 61 && code <= 65) return 'Rain';
  if (code === 66 || code === 67) return 'Freezing Rain';
  if (code >= 71 && code <= 77) return 'Snow';
  if (code >= 80 && code <= 82) return 'Rain Showers';
  if (code >= 85 && code <= 86) return 'Snow Showers';
  if (code === 95) return 'Thunderstorm';
  if (code >= 96 && code <= 99) return 'Thunderstorm with Hail';
  return 'Unknown';
}

function getFarmAdvice(code: number, precipitation: number): string {
  if (code >= 95) return 'Stay indoors, secure equipment';
  if (precipitation > 50) return 'Delay planting';
  if (precipitation > 20) return 'Light field work only';
  if (code >= 61 && code <= 67) return 'Good for transplanting';
  if (code >= 51 && code <= 57) return 'Good for transplanting';
  if (code === 0) return 'Ideal for harvesting';
  if (code <= 2) return 'Good for spraying';
  return 'Optimal planting window';
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CurrentWeather {
  temperature: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  weatherCode: number;
}

interface DayForecast {
  day: string;
  date: string;
  icon: IconType;
  high: number;
  low: number;
  rainfall: number;
  advice: string;
}

// ---------------------------------------------------------------------------
// Weather Icon Component
// ---------------------------------------------------------------------------

function WeatherIcon({ type, className = 'w-6 h-6' }: { type: IconType; className?: string }) {
  const icons: Record<IconType, React.ElementType> = {
    sun: Sun,
    cloud: Cloud,
    'cloud-sun': CloudSun,
    rain: CloudRain,
    storm: CloudLightning,
    drizzle: CloudDrizzle,
    snow: CloudSnow,
    fog: CloudFog,
  };
  const Icon = icons[type] || Cloud;
  const colors: Record<IconType, string> = {
    sun: 'text-amber-500',
    cloud: 'text-gray-400',
    'cloud-sun': 'text-amber-400',
    rain: 'text-blue-500',
    storm: 'text-purple-500',
    drizzle: 'text-blue-400',
    snow: 'text-cyan-400',
    fog: 'text-gray-300',
  };
  return <Icon className={`${className} ${colors[type] || 'text-gray-400'}`} />;
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function WeatherPage() {
  const { profile } = useAuth();
  const [selectedDay, setSelectedDay] = useState<number>(0);
  const [current, setCurrent] = useState<CurrentWeather | null>(null);
  const [forecast, setForecast] = useState<DayForecast[]>([]);
  const [_loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState('');

  const fetchWeather = useCallback(async () => {
    setLoading(true);
    setError(null);

    // Determine coordinates from farmer profile
    const country = profile?.country || '';
    const coords = COUNTRY_COORDS[country] || DEFAULT_COORDS;
    const city = coords.city;
    const countryName = country || 'Botswana';
    setLocation(`${city}, ${countryName}`);

    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lng}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code&timezone=auto&forecast_days=7`;

      const res = await fetch(url);
      if (!res.ok) throw new Error('Weather API failed');
      const data = await res.json();

      // Parse current conditions
      const currentData = data.current;
      setCurrent({
        temperature: Math.round(currentData.temperature_2m),
        humidity: Math.round(currentData.relative_humidity_2m),
        windSpeed: Math.round(currentData.wind_speed_10m),
        weatherCode: currentData.weather_code,
        condition: wmoToCondition(currentData.weather_code),
      });

      // Parse 7-day forecast
      const daily = data.daily;
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      const forecastDays: DayForecast[] = daily.time.map((dateStr: string, i: number) => {
        const d = new Date(dateStr + 'T12:00:00');
        const code = daily.weather_code[i] as number;
        const precip = (daily.precipitation_sum[i] as number) || 0;
        return {
          day: i === 0 ? 'Today' : days[d.getDay()],
          date: `${months[d.getMonth()]} ${d.getDate()}`,
          icon: wmoToIcon(code),
          high: Math.round(daily.temperature_2m_max[i] as number),
          low: Math.round(daily.temperature_2m_min[i] as number),
          rainfall: Math.round(precip),
          advice: getFarmAdvice(code, precip),
        };
      });

      setForecast(forecastDays);
    } catch {
      setError('Unable to fetch weather data. Please try again later.');
    }
    setLoading(false);
  }, [profile?.country]);

  useEffect(() => {
    fetchWeather();
  }, [fetchWeather]);

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-sky-500 animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading weather data...</p>
        </div>
      </div>
    );
  }

  if (error || !current) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-sm">
          <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
          <p className="text-sm text-gray-600 mb-4">{error || 'Unable to load weather'}</p>
          <button
            onClick={fetchWeather}
            className="px-4 py-2 bg-sky-500 text-white rounded-lg text-sm font-medium hover:bg-sky-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

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
            <span>{location}</span>
            <span className="mx-2">|</span>
            <Calendar className="w-4 h-4" />
            <span>{dateStr}</span>
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
                  <WeatherIcon type={wmoToIcon(current.weatherCode)} className="w-20 h-20" />
                </div>
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl lg:text-6xl font-bold text-[#1B2A4A]">{current.temperature}</span>
                    <span className="text-2xl text-gray-400">&deg;C</span>
                  </div>
                  <p className="text-[#8CB89C] font-medium text-sm">{current.condition}</p>
                </div>
              </div>

              {/* Weather Details Grid */}
              <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                    <Droplets className="w-3.5 h-3.5" />
                    Humidity
                  </div>
                  <p className="text-lg font-bold text-[#1B2A4A]">{current.humidity}%</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                    <Wind className="w-3.5 h-3.5" />
                    Wind
                  </div>
                  <p className="text-lg font-bold text-[#1B2A4A]">{current.windSpeed} km/h</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                    <Thermometer className="w-3.5 h-3.5" />
                    Condition
                  </div>
                  <p className="text-sm font-bold text-[#1B2A4A]">{current.condition}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ─── 7-Day Forecast ─── */}
        {forecast.length > 0 && (
          <motion.div variants={cardVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 lg:p-8">
              <h2 className="text-lg font-bold text-[#1B2A4A] mb-4">7-Day Forecast</h2>
              <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-thin">
                {forecast.map((day, idx) => (
                  <button
                    key={day.date}
                    onClick={() => setSelectedDay(idx)}
                    className={`flex-shrink-0 w-[140px] rounded-2xl p-4 transition-all border-2 ${
                      selectedDay === idx
                        ? 'border-[#8CB89C] bg-[#8CB89C]/5 shadow-sm'
                        : 'border-transparent bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <p className={`text-sm font-semibold mb-1 ${selectedDay === idx ? 'text-[#8CB89C]' : 'text-[#1B2A4A]'}`}>
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
                      <span>{day.rainfall}mm</span>
                    </div>
                    <div className={`text-[10px] font-medium rounded-lg px-2 py-1 text-center ${
                      selectedDay === idx ? 'bg-[#8CB89C]/10 text-[#8CB89C]' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {day.advice}
                    </div>
                  </button>
                ))}
              </div>

              {/* Selected Day Detail */}
              {forecast[selectedDay] && (
                <motion.div
                  key={selectedDay}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-6 bg-gradient-to-r from-[#8CB89C]/5 to-sky-50 rounded-2xl p-5 border border-[#8CB89C]/10"
                >
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <WeatherIcon type={forecast[selectedDay].icon} className="w-12 h-12" />
                      <div>
                        <p className="font-bold text-[#1B2A4A] text-lg">{forecast[selectedDay].day}</p>
                        <p className="text-sm text-gray-500">{forecast[selectedDay].date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-xs text-gray-400">High</p>
                        <p className="text-xl font-bold text-red-500">{forecast[selectedDay].high}&deg;C</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-400">Low</p>
                        <p className="text-xl font-bold text-blue-500">{forecast[selectedDay].low}&deg;C</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-400">Rain</p>
                        <p className="text-xl font-bold text-sky-500">{forecast[selectedDay].rainfall}mm</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2 bg-white/70 rounded-xl px-4 py-3">
                    <Sprout className="w-5 h-5 text-[#8CB89C]" />
                    <p className="text-sm font-medium text-[#1B2A4A]">
                      Farm Advice: <span className="text-[#8CB89C]">{forecast[selectedDay].advice}</span>
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {/* Bottom spacer for mobile nav */}
        <div className="h-4" />
      </div>
    </motion.div>
  );
}
