'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Cloud,
  CloudRain,
  Sun,
  Thermometer,
  Droplets,
  ChevronRight,
  X,
  Check,
  Loader2,
  AlertTriangle,
  RefreshCw,
  MapPin,
  Calendar,
  DollarSign,
  Zap,
  CheckCircle2,
  Clock,
  XCircle,
  Wind,
} from 'lucide-react';
import { useAuth } from '@/lib/supabase/auth-context';
import { createClient } from '@/lib/supabase/client';
import { describeTriggerCondition } from '@/lib/insurance/weather';

// ── Types ────────────────────────────────────────────────────────────────

interface Product {
  id: string;
  name: string;
  type: string;
  description: string | null;
  country: string | null;
  trigger_conditions: {
    measurement: string;
    comparison: string;
    threshold: number;
    period_days?: number;
  };
  payout_structure: {
    type: string;
    base_payout_percent?: number;
    max_payout_percent?: number;
  };
  premium_rate: number;
  min_coverage: number;
  max_coverage: number;
  season_start: string | null;
  season_end: string | null;
  active: boolean;
}

interface Policy {
  id: string;
  user_id: string;
  product_id: string;
  policy_number: string;
  status: string;
  coverage_amount: number;
  premium_paid: number;
  latitude: number;
  longitude: number;
  start_date: string;
  end_date: string;
  created_at: string;
  product?: Product;
}

interface Trigger {
  id: string;
  policy_id: string;
  trigger_date: string;
  measured_value: number;
  threshold_value: number;
  payout_amount: number;
  payout_status: string;
  weather_data: Record<string, unknown> | null;
  created_at: string;
  policy?: Policy;
}

interface FarmPlot {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  size_hectares: number;
}

interface WeatherData {
  temperature: number;
  precipitation: number;
  humidity: number;
  wind_speed: number;
  soil_moisture: number;
}

// ── Demo Data ────────────────────────────────────────────────────────────

const demoProducts: Product[] = [
  {
    id: 'demo-1',
    name: 'Drought Shield',
    type: 'drought',
    description: 'Protection against insufficient rainfall during the growing season. Automatic payout when cumulative rainfall drops below threshold.',
    country: null,
    trigger_conditions: { measurement: 'cumulative_rainfall', comparison: 'below', threshold: 50, period_days: 30 },
    payout_structure: { type: 'linear', base_payout_percent: 50, max_payout_percent: 100 },
    premium_rate: 0.05,
    min_coverage: 100,
    max_coverage: 10000,
    season_start: '2026-01-01',
    season_end: '2026-06-30',
    active: true,
  },
  {
    id: 'demo-2',
    name: 'Flood Guard',
    type: 'flood',
    description: 'Covers excessive rainfall events that can damage crops. Triggers when daily rainfall exceeds safe levels.',
    country: null,
    trigger_conditions: { measurement: 'daily_rainfall', comparison: 'above', threshold: 80, period_days: 1 },
    payout_structure: { type: 'fixed', base_payout_percent: 75 },
    premium_rate: 0.04,
    min_coverage: 200,
    max_coverage: 15000,
    season_start: '2026-03-01',
    season_end: '2026-09-30',
    active: true,
  },
  {
    id: 'demo-3',
    name: 'Heat Wave Protect',
    type: 'heat',
    description: 'Protects against extreme heat that can destroy sensitive crops. Automatic payout when max temperature exceeds threshold.',
    country: null,
    trigger_conditions: { measurement: 'max_temperature', comparison: 'above', threshold: 40, period_days: 3 },
    payout_structure: { type: 'tiered', base_payout_percent: 40, max_payout_percent: 100 },
    premium_rate: 0.035,
    min_coverage: 150,
    max_coverage: 8000,
    season_start: null,
    season_end: null,
    active: true,
  },
  {
    id: 'demo-4',
    name: 'Low Rainfall Cover',
    type: 'low_rainfall',
    description: 'Seasonal rainfall insurance. Pays out when total rainfall over the season is below the normal threshold needed for healthy crop growth.',
    country: null,
    trigger_conditions: { measurement: 'cumulative_rainfall', comparison: 'below', threshold: 200, period_days: 90 },
    payout_structure: { type: 'linear', base_payout_percent: 30, max_payout_percent: 90 },
    premium_rate: 0.06,
    min_coverage: 500,
    max_coverage: 25000,
    season_start: '2026-01-01',
    season_end: '2026-12-31',
    active: true,
  },
];

const demoPolicies: Policy[] = [
  {
    id: 'demo-pol-1',
    user_id: 'demo',
    product_id: 'demo-1',
    policy_number: 'PAR-20260115-4821',
    status: 'active',
    coverage_amount: 2500,
    premium_paid: 125,
    latitude: -1.286,
    longitude: 36.817,
    start_date: '2026-01-15',
    end_date: '2026-06-30',
    created_at: '2026-01-15T10:00:00Z',
    product: demoProducts[0],
  },
  {
    id: 'demo-pol-2',
    user_id: 'demo',
    product_id: 'demo-3',
    policy_number: 'PAR-20260201-7193',
    status: 'active',
    coverage_amount: 1800,
    premium_paid: 63,
    latitude: -1.286,
    longitude: 36.817,
    start_date: '2026-02-01',
    end_date: '2026-12-31',
    created_at: '2026-02-01T08:00:00Z',
    product: demoProducts[2],
  },
];

const demoTriggers: Trigger[] = [
  {
    id: 'demo-trig-1',
    policy_id: 'demo-pol-1',
    trigger_date: '2026-03-10',
    measured_value: 32.5,
    threshold_value: 50,
    payout_amount: 1875,
    payout_status: 'paid',
    weather_data: { description: 'Cumulative rainfall over 30 days: 32.5mm' },
    created_at: '2026-03-10T06:00:00Z',
    policy: demoPolicies[0],
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────

const typeIcons: Record<string, React.ReactNode> = {
  drought: <CloudRain className="w-6 h-6 text-amber-500" />,
  flood: <Cloud className="w-6 h-6 text-blue-500" />,
  heat: <Sun className="w-6 h-6 text-orange-500" />,
  frost: <Thermometer className="w-6 h-6 text-cyan-500" />,
  excess_rain: <CloudRain className="w-6 h-6 text-indigo-500" />,
  low_rainfall: <Droplets className="w-6 h-6 text-yellow-600" />,
};

const typeColors: Record<string, string> = {
  drought: 'bg-amber-50 border-amber-200',
  flood: 'bg-blue-50 border-blue-200',
  heat: 'bg-orange-50 border-orange-200',
  frost: 'bg-cyan-50 border-cyan-200',
  excess_rain: 'bg-indigo-50 border-indigo-200',
  low_rainfall: 'bg-yellow-50 border-yellow-200',
};

const statusBadge: Record<string, string> = {
  active: 'bg-green-50 text-green-700 border-green-200',
  expired: 'bg-gray-50 text-gray-500 border-gray-200',
  triggered: 'bg-amber-50 text-amber-700 border-amber-200',
  cancelled: 'bg-red-50 text-red-600 border-red-200',
};

const payoutBadge: Record<string, { color: string; icon: React.ReactNode }> = {
  paid: { color: 'text-green-600', icon: <CheckCircle2 className="w-4 h-4" /> },
  pending: { color: 'text-amber-600', icon: <Clock className="w-4 h-4" /> },
  failed: { color: 'text-red-500', icon: <XCircle className="w-4 h-4" /> },
};

function formatCurrency(n: number) {
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ── Component ────────────────────────────────────────────────────────────

type Tab = 'products' | 'policies' | 'triggers';

export default function ParametricInsurancePage() {
  const { user } = useAuth();
  const supabase = createClient();

  const [tab, setTab] = useState<Tab>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [triggers, setTriggers] = useState<Trigger[]>([]);
  const [farmPlots, setFarmPlots] = useState<FarmPlot[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  // Purchase flow
  const [purchaseProduct, setPurchaseProduct] = useState<Product | null>(null);
  const [purchaseStep, setPurchaseStep] = useState(1);
  const [selectedPlot, setSelectedPlot] = useState<FarmPlot | null>(null);
  const [manualLat, setManualLat] = useState('');
  const [manualLng, setManualLng] = useState('');
  const [coverageAmount, setCoverageAmount] = useState(1000);
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseResult, setPurchaseResult] = useState<{ policy_number: string; premium_charged: number } | null>(null);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // ── Data fetching ──────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    setLoading(true);

    try {
      // Fetch products
      const prodRes = await fetch('/api/insurance/parametric/products');
      const prodData = await prodRes.json();
      if (prodData.products?.length > 0) {
        setProducts(prodData.products);
      } else {
        setProducts(demoProducts);
      }

      // Fetch policies
      const polRes = await fetch('/api/insurance/parametric/policies');
      const polData = await polRes.json();
      if (polData.policies?.length > 0) {
        setPolicies(polData.policies);
      } else {
        setPolicies(demoPolicies);
      }

      // Fetch triggers for user's policies
      if (user) {
        const { data: trigData } = await supabase
          .from('parametric_triggers')
          .select('*, policy:parametric_policies(*, product:parametric_products(name))')
          .order('created_at', { ascending: false });

        if (trigData && trigData.length > 0) {
          setTriggers(trigData as unknown as Trigger[]);
        } else {
          setTriggers(demoTriggers);
        }

        // Fetch farm plots
        const { data: plotData } = await supabase
          .from('farm_plots')
          .select('id, name, latitude, longitude, size_hectares')
          .eq('user_id', user.id);

        if (plotData) setFarmPlots(plotData as FarmPlot[]);
      } else {
        setTriggers(demoTriggers);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setProducts(demoProducts);
      setPolicies(demoPolicies);
      setTriggers(demoTriggers);
    }

    setLoading(false);
  }, [user, supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Fetch weather for primary location
  useEffect(() => {
    const lat = farmPlots[0]?.latitude || policies[0]?.latitude || -1.286;
    const lng = farmPlots[0]?.longitude || policies[0]?.longitude || 36.817;

    fetch(`/api/weather/current?lat=${lat}&lng=${lng}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.current) setWeather(d.current);
      })
      .catch(() => {
        setWeather({
          temperature: 28,
          precipitation: 2.4,
          humidity: 65,
          wind_speed: 12,
          soil_moisture: 25,
        });
      });
  }, [farmPlots, policies]);

  // ── Purchase flow ──────────────────────────────────────────────────────

  const startPurchase = (product: Product) => {
    setPurchaseProduct(product);
    setPurchaseStep(1);
    setCoverageAmount(Math.round((product.min_coverage + product.max_coverage) / 2));
    setSelectedPlot(null);
    setManualLat('');
    setManualLng('');
    setPurchaseResult(null);
  };

  const handlePurchase = async () => {
    if (!purchaseProduct) return;
    setPurchasing(true);

    const lat = selectedPlot?.latitude || parseFloat(manualLat) || -1.286;
    const lng = selectedPlot?.longitude || parseFloat(manualLng) || 36.817;

    try {
      const res = await fetch('/api/insurance/parametric/policies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: purchaseProduct.id,
          coverage_amount: coverageAmount,
          latitude: lat,
          longitude: lng,
          farm_plot_id: selectedPlot?.id || null,
          start_date: purchaseProduct.season_start || new Date().toISOString().split('T')[0],
          end_date: purchaseProduct.season_end || new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setPurchaseResult({ policy_number: data.policy_number, premium_charged: data.premium_charged });
        setPurchaseStep(4);
        showToast('Policy purchased successfully!', 'success');
        fetchData();
      } else {
        showToast(data.error || 'Purchase failed', 'error');
      }
    } catch {
      showToast('Network error — please try again', 'error');
    }

    setPurchasing(false);
  };

  const premium = useMemo(() => {
    if (!purchaseProduct) return 0;
    return Math.round(coverageAmount * purchaseProduct.premium_rate * 100) / 100;
  }, [coverageAmount, purchaseProduct]);

  // ── Render ─────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-[#5DB347]" />
        <span className="ml-2 text-sm text-gray-500">Loading parametric insurance...</span>
      </div>
    );
  }

  return (
    <div className="space-y-5 py-4">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 ${
              toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
            }`}
          >
            {toast.type === 'success' ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Header Banner ── */}
      <section className="px-4">
        <div className="rounded-2xl bg-gradient-to-br from-[#1B2A4A] to-[#5DB347] p-5 text-white relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full" />
          <div className="absolute top-4 right-4 opacity-20">
            <Shield size={64} strokeWidth={1} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <Zap size={18} className="text-yellow-300" />
              <span className="text-xs font-semibold text-white/70 uppercase tracking-wide">
                Parametric Insurance
              </span>
            </div>
            <h2 className="text-xl font-bold leading-tight">
              Automatic Weather Protection
            </h2>
            <p className="text-sm text-white/80 mt-1">
              No claims needed. When weather conditions hit the trigger, you get paid automatically.
            </p>
          </div>
        </div>
      </section>

      {/* ── Weather Panel ── */}
      {weather && (
        <section className="px-4">
          <div className="rounded-2xl bg-white border border-gray-100 p-4">
            <h3 className="text-sm font-bold text-[#1B2A4A] mb-3 flex items-center gap-2">
              <Cloud className="w-4 h-4 text-[#5DB347]" />
              Current Weather at Your Location
            </h3>
            <div className="grid grid-cols-5 gap-2">
              {[
                { label: 'Temp', value: `${weather.temperature.toFixed(0)}\u00B0C`, icon: <Thermometer className="w-4 h-4 text-orange-500" /> },
                { label: 'Rain', value: `${weather.precipitation.toFixed(1)}mm`, icon: <CloudRain className="w-4 h-4 text-blue-500" /> },
                { label: 'Humidity', value: `${weather.humidity.toFixed(0)}%`, icon: <Droplets className="w-4 h-4 text-cyan-500" /> },
                { label: 'Wind', value: `${weather.wind_speed.toFixed(0)}km/h`, icon: <Wind className="w-4 h-4 text-gray-500" /> },
                { label: 'Soil', value: `${weather.soil_moisture.toFixed(0)}%`, icon: <Droplets className="w-4 h-4 text-amber-600" /> },
              ].map((item) => (
                <div key={item.label} className="text-center p-2 rounded-xl bg-gray-50">
                  <div className="flex justify-center mb-1">{item.icon}</div>
                  <p className="text-sm font-bold text-[#1B2A4A]">{item.value}</p>
                  <p className="text-[10px] text-gray-400">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Tabs ── */}
      <section className="px-4">
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {([
            { key: 'products' as Tab, label: 'Available Products' },
            { key: 'policies' as Tab, label: 'My Policies' },
            { key: 'triggers' as Tab, label: 'Trigger History' },
          ]).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 text-xs font-semibold py-2.5 rounded-lg transition-all ${
                tab === t.key
                  ? 'bg-white text-[#1B2A4A] shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </section>

      {/* ── Products Tab ── */}
      {tab === 'products' && (
        <section className="px-4 space-y-3">
          {products.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-2xl border p-4 ${typeColors[product.type] || 'bg-white border-gray-100'}`}
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm shrink-0">
                  {typeIcons[product.type] || <Shield className="w-6 h-6 text-gray-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-[#1B2A4A]">{product.name}</h4>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{product.description}</p>

                  <div className="flex items-center gap-1.5 mt-2 text-xs text-[#5DB347] font-medium">
                    <Zap className="w-3.5 h-3.5" />
                    {describeTriggerCondition(product.trigger_conditions)}
                  </div>

                  <div className="flex flex-wrap gap-3 mt-2 text-[11px] text-gray-500">
                    <span>Premium: <b className="text-[#1B2A4A]">{(product.premium_rate * 100).toFixed(1)}%</b></span>
                    <span>Coverage: <b className="text-[#1B2A4A]">{formatCurrency(product.min_coverage)} - {formatCurrency(product.max_coverage)}</b></span>
                    {product.season_start && (
                      <span>Season: <b className="text-[#1B2A4A]">{formatDate(product.season_start)} - {product.season_end ? formatDate(product.season_end) : 'Open'}</b></span>
                    )}
                  </div>

                  <button
                    onClick={() => startPurchase(product)}
                    className="mt-3 flex items-center gap-2 px-4 py-2 rounded-xl bg-[#5DB347] text-white text-xs font-semibold hover:bg-[#4a9a3a] transition-colors"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    Purchase Policy
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}

          {products.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Shield className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No parametric products available for your region yet.</p>
            </div>
          )}
        </section>
      )}

      {/* ── Policies Tab ── */}
      {tab === 'policies' && (
        <section className="px-4 space-y-3">
          {policies.map((policy) => (
            <motion.div
              key={policy.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl bg-white border border-gray-100 p-4"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {typeIcons[policy.product?.type || ''] || <Shield className="w-5 h-5 text-gray-400" />}
                  <div>
                    <h4 className="text-sm font-bold text-[#1B2A4A]">{policy.product?.name || 'Policy'}</h4>
                    <p className="text-[11px] text-gray-400">{policy.policy_number}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize ${statusBadge[policy.status] || statusBadge.active}`}>
                  {policy.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <p className="text-[10px] text-gray-400">Coverage</p>
                  <p className="text-sm font-bold text-green-600">{formatCurrency(policy.coverage_amount)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400">Premium Paid</p>
                  <p className="text-sm font-semibold text-[#1B2A4A]">{formatCurrency(policy.premium_paid)}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-gray-300" />
                  <p className="text-[11px] text-gray-500">{formatDate(policy.start_date)} - {formatDate(policy.end_date)}</p>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-gray-300" />
                  <p className="text-[11px] text-gray-500">{policy.latitude.toFixed(3)}, {policy.longitude.toFixed(3)}</p>
                </div>
              </div>

              {policy.product?.trigger_conditions && (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-[#5DB347]">
                  <Zap className="w-3 h-3" />
                  <span>{describeTriggerCondition(policy.product.trigger_conditions)}</span>
                </div>
              )}
            </motion.div>
          ))}

          {policies.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Shield className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No policies yet. Browse available products to get started.</p>
              <button onClick={() => setTab('products')} className="mt-3 text-[#5DB347] text-sm font-medium">
                View Products
              </button>
            </div>
          )}
        </section>
      )}

      {/* ── Triggers Tab ── */}
      {tab === 'triggers' && (
        <section className="px-4 space-y-3">
          {triggers.map((trigger) => {
            const badge = payoutBadge[trigger.payout_status] || payoutBadge.pending;
            return (
              <motion.div
                key={trigger.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl bg-white border border-gray-100 p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="text-sm font-bold text-[#1B2A4A]">
                      Trigger on {formatDate(trigger.trigger_date)}
                    </h4>
                    <p className="text-[11px] text-gray-400">
                      {trigger.policy?.policy_number || trigger.policy_id}
                    </p>
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-semibold ${badge.color}`}>
                    {badge.icon}
                    <span className="capitalize">{trigger.payout_status}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mt-2">
                  <div>
                    <p className="text-[10px] text-gray-400">Measured</p>
                    <p className="text-sm font-bold text-red-500">{trigger.measured_value}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400">Threshold</p>
                    <p className="text-sm font-bold text-[#1B2A4A]">{trigger.threshold_value}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400">Payout</p>
                    <p className="text-sm font-bold text-green-600">{formatCurrency(trigger.payout_amount)}</p>
                  </div>
                </div>

                {trigger.weather_data?.description ? (
                  <p className="text-[11px] text-gray-500 mt-2 italic">
                    {String(trigger.weather_data.description)}
                  </p>
                ) : null}

                {trigger.payout_status === 'paid' && (
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-green-600 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Payout deposited to your wallet
                  </div>
                )}
              </motion.div>
            );
          })}

          {triggers.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Zap className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No triggers yet. The system checks weather conditions daily.</p>
            </div>
          )}
        </section>
      )}

      {/* ── Purchase Modal ── */}
      <AnimatePresence>
        {purchaseProduct && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
              onClick={() => setPurchaseProduct(null)}
            />
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              className="fixed inset-x-4 top-[10%] z-50 max-w-lg mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[80vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-[#1B2A4A] to-[#5DB347] p-4 text-white flex items-center justify-between">
                <div>
                  <p className="text-xs text-white/70">Purchase Policy</p>
                  <h3 className="text-lg font-bold">{purchaseProduct.name}</h3>
                </div>
                <button onClick={() => setPurchaseProduct(null)} className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Steps indicator */}
              <div className="flex items-center gap-2 p-4 border-b border-gray-100">
                {[1, 2, 3, 4].map((s) => (
                  <div key={s} className="flex items-center gap-2 flex-1">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      purchaseStep >= s ? 'bg-[#5DB347] text-white' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {purchaseStep > s ? <Check className="w-3 h-3" /> : s}
                    </div>
                    {s < 4 && <div className={`flex-1 h-0.5 ${purchaseStep > s ? 'bg-[#5DB347]' : 'bg-gray-100'}`} />}
                  </div>
                ))}
              </div>

              <div className="p-4">
                {/* Step 1: Select location */}
                {purchaseStep === 1 && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-[#1B2A4A]">Step 1: Select Location</h4>
                    <p className="text-xs text-gray-500">Choose a farm plot or enter coordinates manually.</p>

                    {farmPlots.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-gray-600">Your Farm Plots</p>
                        {farmPlots.map((plot) => (
                          <button
                            key={plot.id}
                            onClick={() => { setSelectedPlot(plot); setManualLat(''); setManualLng(''); }}
                            className={`w-full text-left p-3 rounded-xl border text-sm transition-all ${
                              selectedPlot?.id === plot.id
                                ? 'border-[#5DB347] bg-[#5DB347]/5'
                                : 'border-gray-100 hover:border-gray-200'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-[#5DB347]" />
                              <span className="font-medium text-[#1B2A4A]">{plot.name}</span>
                              {selectedPlot?.id === plot.id && <Check className="w-4 h-4 text-[#5DB347] ml-auto" />}
                            </div>
                            <p className="text-[11px] text-gray-400 ml-6">{plot.latitude.toFixed(3)}, {plot.longitude.toFixed(3)} ({plot.size_hectares}ha)</p>
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-gray-600">Or Enter Coordinates</p>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          step="any"
                          placeholder="Latitude (e.g. -1.286)"
                          value={manualLat}
                          onChange={(e) => { setManualLat(e.target.value); setSelectedPlot(null); }}
                          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#5DB347]"
                        />
                        <input
                          type="number"
                          step="any"
                          placeholder="Longitude (e.g. 36.817)"
                          value={manualLng}
                          onChange={(e) => { setManualLng(e.target.value); setSelectedPlot(null); }}
                          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#5DB347]"
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => setPurchaseStep(2)}
                      disabled={!selectedPlot && (!manualLat || !manualLng)}
                      className="w-full py-3 rounded-xl bg-[#5DB347] text-white text-sm font-semibold disabled:opacity-50 hover:bg-[#4a9a3a] transition-colors"
                    >
                      Continue
                    </button>
                  </div>
                )}

                {/* Step 2: Choose coverage */}
                {purchaseStep === 2 && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-[#1B2A4A]">Step 2: Choose Coverage Amount</h4>

                    <div>
                      <input
                        type="range"
                        min={purchaseProduct.min_coverage}
                        max={purchaseProduct.max_coverage}
                        step={50}
                        value={coverageAmount}
                        onChange={(e) => setCoverageAmount(Number(e.target.value))}
                        className="w-full accent-[#5DB347]"
                      />
                      <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                        <span>{formatCurrency(purchaseProduct.min_coverage)}</span>
                        <span>{formatCurrency(purchaseProduct.max_coverage)}</span>
                      </div>
                    </div>

                    <div className="text-center p-4 rounded-xl bg-[#5DB347]/5 border border-[#5DB347]/20">
                      <p className="text-xs text-gray-500">Coverage Amount</p>
                      <p className="text-3xl font-bold text-[#5DB347]">{formatCurrency(coverageAmount)}</p>
                    </div>

                    <div className="flex gap-4">
                      <button onClick={() => setPurchaseStep(1)} className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600">
                        Back
                      </button>
                      <button onClick={() => setPurchaseStep(3)} className="flex-1 py-3 rounded-xl bg-[#5DB347] text-white text-sm font-semibold">
                        Continue
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: Confirm */}
                {purchaseStep === 3 && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-[#1B2A4A]">Step 3: Confirm Purchase</h4>

                    <div className="space-y-2 p-4 rounded-xl bg-gray-50">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Product</span>
                        <span className="font-semibold text-[#1B2A4A]">{purchaseProduct.name}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Coverage</span>
                        <span className="font-semibold text-green-600">{formatCurrency(coverageAmount)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Premium Rate</span>
                        <span className="font-medium">{(purchaseProduct.premium_rate * 100).toFixed(1)}%</span>
                      </div>
                      <div className="border-t border-gray-200 my-2" />
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 font-semibold">Premium to Pay</span>
                        <span className="font-bold text-[#1B2A4A] text-lg">{formatCurrency(premium)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Location</span>
                        <span className="font-medium">
                          {selectedPlot?.name || `${manualLat}, ${manualLng}`}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Trigger</span>
                        <span className="font-medium text-[#5DB347] text-xs">
                          {describeTriggerCondition(purchaseProduct.trigger_conditions)}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-700 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>Premium will be deducted from your wallet balance. If insufficient, the policy will still be created and you can pay later.</span>
                    </div>

                    <div className="flex gap-4">
                      <button onClick={() => setPurchaseStep(2)} className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600">
                        Back
                      </button>
                      <button
                        onClick={handlePurchase}
                        disabled={purchasing}
                        className="flex-1 py-3 rounded-xl bg-[#5DB347] text-white text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {purchasing ? <Loader2 className="w-4 h-4 animate-spin" /> : <DollarSign className="w-4 h-4" />}
                        {purchasing ? 'Processing...' : `Pay ${formatCurrency(premium)}`}
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 4: Success */}
                {purchaseStep === 4 && purchaseResult && (
                  <div className="text-center py-6 space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle2 className="w-8 h-8 text-green-600" />
                    </div>
                    <h4 className="text-lg font-bold text-[#1B2A4A]">Policy Purchased!</h4>
                    <div className="p-3 rounded-xl bg-gray-50">
                      <p className="text-xs text-gray-500">Policy Number</p>
                      <p className="text-lg font-mono font-bold text-[#5DB347]">{purchaseResult.policy_number}</p>
                    </div>
                    <p className="text-sm text-gray-500">
                      Premium of <b>{formatCurrency(purchaseResult.premium_charged)}</b> has been charged.
                      Your coverage is now active.
                    </p>
                    <button
                      onClick={() => { setPurchaseProduct(null); setTab('policies'); }}
                      className="w-full py-3 rounded-xl bg-[#5DB347] text-white text-sm font-semibold"
                    >
                      View My Policies
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Refresh button */}
      <section className="px-4 pb-4">
        <button
          onClick={fetchData}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Data
        </button>
      </section>
    </div>
  );
}
