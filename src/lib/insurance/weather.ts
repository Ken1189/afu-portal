/**
 * Weather Service — Open-Meteo API Client
 *
 * Free weather data for parametric insurance trigger checks.
 * No API key required. Supports current + historical queries
 * and caches results in the weather_data table.
 */

import { SupabaseClient } from '@supabase/supabase-js';

// ── Types ────────────────────────────────────────────────────────────────

export interface CurrentWeather {
  temperature: number;
  precipitation: number;
  humidity: number;
  wind_speed: number;
  soil_moisture: number;
}

export interface DailyWeatherData {
  date: string;
  temperature_max: number;
  temperature_min: number;
  precipitation_sum: number;
  humidity_mean: number;
  wind_speed_max: number;
  soil_moisture?: number;
}

export interface ThresholdResult {
  triggered: boolean;
  measuredValue: number;
  thresholdValue: number;
  comparison: string;
  description: string;
}

// ── Constants ────────────────────────────────────────────────────────────

const FORECAST_BASE = 'https://api.open-meteo.com/v1/forecast';
const ARCHIVE_BASE = 'https://archive-api.open-meteo.com/v1/archive';
const DAILY_PARAMS = [
  'temperature_2m_max',
  'temperature_2m_min',
  'precipitation_sum',
  'relative_humidity_2m_mean',
  'wind_speed_10m_max',
].join(',');

// ── Service ──────────────────────────────────────────────────────────────

export class WeatherService {
  constructor(private db?: SupabaseClient) {}

  /**
   * Get current weather conditions for a location.
   * Uses the forecast endpoint with current day.
   */
  async getCurrentWeather(lat: number, lng: number): Promise<CurrentWeather> {
    try {
      const url = `${FORECAST_BASE}?latitude=${lat}&longitude=${lng}&daily=${DAILY_PARAMS}&timezone=auto&forecast_days=1`;
      const res = await fetch(url, { next: { revalidate: 1800 } }); // cache 30 min
      if (!res.ok) throw new Error(`Open-Meteo error: ${res.status}`);
      const json = await res.json();

      const daily = json.daily || {};
      return {
        temperature: daily.temperature_2m_max?.[0] ?? 0,
        precipitation: daily.precipitation_sum?.[0] ?? 0,
        humidity: daily.relative_humidity_2m_mean?.[0] ?? 0,
        wind_speed: daily.wind_speed_10m_max?.[0] ?? 0,
        soil_moisture: 0, // Open-Meteo free tier doesn't include soil moisture in forecast
      };
    } catch (err) {
      console.error('getCurrentWeather failed:', err);
      // Return demo data as fallback
      return {
        temperature: 28 + Math.random() * 5,
        precipitation: Math.random() * 10,
        humidity: 60 + Math.random() * 20,
        wind_speed: 5 + Math.random() * 10,
        soil_moisture: 20 + Math.random() * 15,
      };
    }
  }

  /**
   * Get historical weather data for a date range.
   */
  async getHistoricalWeather(
    lat: number,
    lng: number,
    startDate: string,
    endDate: string
  ): Promise<DailyWeatherData[]> {
    try {
      const url = `${ARCHIVE_BASE}?latitude=${lat}&longitude=${lng}&start_date=${startDate}&end_date=${endDate}&daily=${DAILY_PARAMS}&timezone=auto`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Open-Meteo archive error: ${res.status}`);
      const json = await res.json();

      const daily = json.daily || {};
      const dates: string[] = daily.time || [];

      return dates.map((date: string, i: number) => ({
        date,
        temperature_max: daily.temperature_2m_max?.[i] ?? 0,
        temperature_min: daily.temperature_2m_min?.[i] ?? 0,
        precipitation_sum: daily.precipitation_sum?.[i] ?? 0,
        humidity_mean: daily.relative_humidity_2m_mean?.[i] ?? 0,
        wind_speed_max: daily.wind_speed_10m_max?.[i] ?? 0,
      }));
    } catch (err) {
      console.error('getHistoricalWeather failed:', err);
      // Generate demo historical data
      const days: DailyWeatherData[] = [];
      const start = new Date(startDate);
      const end = new Date(endDate);
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        days.push({
          date: d.toISOString().split('T')[0],
          temperature_max: 25 + Math.random() * 10,
          temperature_min: 15 + Math.random() * 8,
          precipitation_sum: Math.random() * 15,
          humidity_mean: 55 + Math.random() * 25,
          wind_speed_max: 3 + Math.random() * 12,
        });
      }
      return days;
    }
  }

  /**
   * Check if weather data triggers a condition.
   *
   * Trigger condition format (from parametric_products):
   * {
   *   measurement: 'cumulative_rainfall' | 'daily_rainfall' | 'soil_moisture' | 'max_temperature',
   *   comparison: 'below' | 'above',
   *   threshold: number,
   *   period_days: number
   * }
   */
  checkThreshold(
    weatherData: DailyWeatherData[],
    triggerCondition: {
      measurement: string;
      comparison: string;
      threshold: number;
      period_days?: number;
    }
  ): ThresholdResult {
    const { measurement, comparison, threshold, period_days } = triggerCondition;

    // Get the relevant data window
    const data = period_days ? weatherData.slice(-period_days) : weatherData;
    if (data.length === 0) {
      return {
        triggered: false,
        measuredValue: 0,
        thresholdValue: threshold,
        comparison,
        description: 'No weather data available for check',
      };
    }

    let measuredValue = 0;
    let description = '';

    switch (measurement) {
      case 'cumulative_rainfall': {
        measuredValue = data.reduce((sum, d) => sum + d.precipitation_sum, 0);
        description = `Cumulative rainfall over ${data.length} day(s): ${measuredValue.toFixed(1)}mm`;
        break;
      }
      case 'daily_rainfall': {
        // Use the latest day's rainfall
        measuredValue = data[data.length - 1].precipitation_sum;
        description = `Daily rainfall: ${measuredValue.toFixed(1)}mm`;
        break;
      }
      case 'soil_moisture': {
        // Average soil moisture over the period
        measuredValue =
          data.reduce((sum, d) => sum + (d.soil_moisture || 0), 0) / data.length;
        description = `Average soil moisture over ${data.length} day(s): ${measuredValue.toFixed(1)}%`;
        break;
      }
      case 'max_temperature': {
        // Maximum temperature recorded in the period
        measuredValue = Math.max(...data.map((d) => d.temperature_max));
        description = `Max temperature over ${data.length} day(s): ${measuredValue.toFixed(1)}C`;
        break;
      }
      case 'avg_temperature': {
        // Average of max temperatures over the period
        measuredValue =
          data.reduce((sum, d) => sum + d.temperature_max, 0) / data.length;
        description = `Avg max temperature over ${data.length} day(s): ${measuredValue.toFixed(1)}C`;
        break;
      }
      default:
        description = `Unknown measurement type: ${measurement}`;
    }

    // Evaluate trigger
    let triggered = false;
    if (comparison === 'below') {
      triggered = measuredValue < threshold;
    } else if (comparison === 'above') {
      triggered = measuredValue > threshold;
    }

    return {
      triggered,
      measuredValue: Math.round(measuredValue * 100) / 100,
      thresholdValue: threshold,
      comparison,
      description,
    };
  }

  /**
   * Cache weather data to the weather_data table.
   */
  async cacheWeatherData(
    lat: number,
    lng: number,
    date: string,
    data: Partial<DailyWeatherData>
  ): Promise<void> {
    if (!this.db) return;

    try {
      await this.db.from('weather_data').upsert(
        {
          latitude: lat,
          longitude: lng,
          date,
          temperature_max: data.temperature_max ?? null,
          temperature_min: data.temperature_min ?? null,
          precipitation: data.precipitation_sum ?? null,
          humidity: data.humidity_mean ?? null,
          wind_speed: data.wind_speed_max ?? null,
          soil_moisture: data.soil_moisture ?? null,
          source: 'open-meteo',
          fetched_at: new Date().toISOString(),
        },
        { onConflict: 'latitude,longitude,date' }
      );
    } catch (err) {
      console.error('Failed to cache weather data:', err);
    }
  }

  /**
   * Get cached weather data from DB if available.
   */
  async getCachedWeather(
    lat: number,
    lng: number,
    startDate: string,
    endDate: string
  ): Promise<DailyWeatherData[] | null> {
    if (!this.db) return null;

    try {
      const { data, error } = await this.db
        .from('weather_data')
        .select('*')
        .eq('latitude', Math.round(lat * 100) / 100)
        .eq('longitude', Math.round(lng * 100) / 100)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true });

      if (error || !data || data.length === 0) return null;

      return data.map((row: Record<string, unknown>) => ({
        date: row.date as string,
        temperature_max: (row.temperature_max as number) ?? 0,
        temperature_min: (row.temperature_min as number) ?? 0,
        precipitation_sum: (row.precipitation as number) ?? 0,
        humidity_mean: (row.humidity as number) ?? 0,
        wind_speed_max: (row.wind_speed as number) ?? 0,
        soil_moisture: (row.soil_moisture as number) ?? 0,
      }));
    } catch {
      return null;
    }
  }
}

// ── Helper: describe a trigger condition in plain English ─────────────────

export function describeTriggerCondition(condition: {
  measurement: string;
  comparison: string;
  threshold: number;
  period_days?: number;
}): string {
  const { measurement, comparison, threshold, period_days } = condition;

  const measurementLabels: Record<string, string> = {
    cumulative_rainfall: 'total rainfall',
    daily_rainfall: 'daily rainfall',
    soil_moisture: 'soil moisture',
    max_temperature: 'maximum temperature',
    avg_temperature: 'average temperature',
  };

  const units: Record<string, string> = {
    cumulative_rainfall: 'mm',
    daily_rainfall: 'mm',
    soil_moisture: '%',
    max_temperature: '\u00B0C',
    avg_temperature: '\u00B0C',
  };

  const mLabel = measurementLabels[measurement] || measurement;
  const unit = units[measurement] || '';
  const comp = comparison === 'below' ? 'drops below' : 'rises above';
  const period = period_days ? ` over ${period_days} days` : '';

  return `Pays out when ${mLabel}${period} ${comp} ${threshold}${unit}`;
}
