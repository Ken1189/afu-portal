'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  CloudLightning,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Droplets,
  Thermometer,
  Wind,
  Sun,
  CloudRain,
} from 'lucide-react';
import Link from 'next/link';

// ── Types ──
interface WeatherThresholds {
  drought_days_no_rain: number;
  flood_mm_per_day: number;
  frost_temp_celsius: number;
  heat_temp_celsius: number;
  wind_speed_kmh: number;
}

const DEFAULT_THRESHOLDS: WeatherThresholds = {
  drought_days_no_rain: 14,
  flood_mm_per_day: 100,
  frost_temp_celsius: 2,
  heat_temp_celsius: 40,
  wind_speed_kmh: 60,
};

const CONFIG_KEY = 'weather_alert_thresholds';

export default function WeatherAlertThresholdsConfigPage() {
  const [thresholds, setThresholds] = useState<WeatherThresholds>(DEFAULT_THRESHOLDS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = useCallback((type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.from('site_config').select('value').eq('key', CONFIG_KEY).single();
        if (error && error.code !== 'PGRST116') throw error;
        if (data?.value) setThresholds(data.value);
      } catch {
        showToast('error', 'Failed to load config. Using defaults.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [showToast]);

  async function handleSave() {
    setSaving(true);
    try {
      const supabase = createClient();
      const { data: existing } = await supabase.from('site_config').select('id').eq('key', CONFIG_KEY).single();
      if (existing) {
        const { error } = await supabase.from('site_config').update({ value: thresholds, updated_at: new Date().toISOString() }).eq('key', CONFIG_KEY);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('site_config').insert({ key: CONFIG_KEY, value: thresholds, description: 'Weather alert threshold configuration' });
        if (error) throw error;
      }
      showToast('success', 'Weather alert thresholds saved successfully.');
    } catch {
      showToast('error', 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#5DB347' }} />
      </div>
    );
  }

  const fields = [
    {
      key: 'drought_days_no_rain' as const,
      label: 'Drought Alert',
      description: 'Alert when no rainfall for this many consecutive days',
      unit: 'days',
      icon: <Sun className="w-5 h-5 text-amber-500" />,
      min: 1,
      max: 90,
      color: 'bg-amber-50 border-amber-200',
    },
    {
      key: 'flood_mm_per_day' as const,
      label: 'Flood Alert',
      description: 'Alert when rainfall exceeds this amount in a single day',
      unit: 'mm/day',
      icon: <CloudRain className="w-5 h-5 text-blue-500" />,
      min: 10,
      max: 500,
      color: 'bg-blue-50 border-blue-200',
    },
    {
      key: 'frost_temp_celsius' as const,
      label: 'Frost Alert',
      description: 'Alert when temperature drops below this threshold',
      unit: '\u00B0C',
      icon: <Thermometer className="w-5 h-5 text-cyan-500" />,
      min: -10,
      max: 10,
      color: 'bg-cyan-50 border-cyan-200',
    },
    {
      key: 'heat_temp_celsius' as const,
      label: 'Heat Alert',
      description: 'Alert when temperature exceeds this threshold',
      unit: '\u00B0C',
      icon: <Thermometer className="w-5 h-5 text-red-500" />,
      min: 25,
      max: 55,
      color: 'bg-red-50 border-red-200',
    },
    {
      key: 'wind_speed_kmh' as const,
      label: 'High Wind Alert',
      description: 'Alert when wind speed exceeds this threshold',
      unit: 'km/h',
      icon: <Wind className="w-5 h-5 text-gray-500" />,
      min: 10,
      max: 200,
      color: 'bg-gray-50 border-gray-200',
    },
  ];

  return (
    <div className="space-y-6 p-6 max-w-3xl mx-auto">
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-white text-sm ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.message}
        </div>
      )}

      <div className="flex items-center gap-3">
        <Link href="/admin/settings" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </Link>
        <div className="p-2 rounded-xl" style={{ backgroundColor: '#5DB34720' }}>
          <CloudLightning className="w-6 h-6" style={{ color: '#5DB347' }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#1B2A4A' }}>Weather Alert Thresholds</h1>
          <p className="text-sm text-gray-500">Configure when to send weather alerts to farmers</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="space-y-5">
          {fields.map(field => (
            <div key={field.key} className={`flex items-start gap-4 p-4 rounded-xl border ${field.color}`}>
              <div className="mt-0.5">{field.icon}</div>
              <div className="flex-1">
                <label className="block text-sm font-semibold mb-0.5" style={{ color: '#1B2A4A' }}>{field.label}</label>
                <p className="text-xs text-gray-500 mb-3">{field.description}</p>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={field.min}
                    max={field.max}
                    value={thresholds[field.key]}
                    onChange={e => setThresholds({ ...thresholds, [field.key]: parseFloat(e.target.value) || 0 })}
                    className="w-28 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-green-200 focus:border-green-400 outline-none"
                  />
                  <span className="text-sm text-gray-500 font-medium">{field.unit}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end mt-8 pt-6 border-t border-gray-100">
          <button
            onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 text-sm text-white rounded-xl font-medium shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50"
            style={{ backgroundColor: '#5DB347' }}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Thresholds
          </button>
        </div>
      </div>
    </div>
  );
}
