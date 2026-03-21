'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Heart,
  Bell,
  BellRing,
  Search,
  Filter,
  Plus,
  X,
  ArrowUp,
  ArrowDown,
  Wheat,
  Leaf,
  Beef,
  Sprout,
  CircleDot,
  Clock,
  CheckCircle,
  AlertTriangle,
  ChevronRight,
  Star,
  Trash2,
  ArrowUpDown,
} from 'lucide-react';
import { useMarketPrices, type MarketPriceRow } from '@/lib/supabase/use-market-prices';

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

type CommodityCategory = 'all' | 'grains' | 'oilseeds' | 'cash-crops' | 'livestock' | 'vegetables';

interface Commodity {
  id: string;
  name: string;
  category: CommodityCategory;
  price: number;
  currency: string;
  unit: string;
  dailyChange: number;
  weeklyTrend: number[];
  high52w: number;
  low52w: number;
  market: string;
  inWatchlist: boolean;
}

interface WatchlistItem {
  id: string;
  name: string;
  price: number;
  currency: string;
  unit: string;
  dailyChange: number;
  alertThreshold: number | null;
}

interface PriceAlert {
  id: string;
  commodity: string;
  condition: 'above' | 'below';
  threshold: number;
  active: boolean;
}

interface AlertHistory {
  id: string;
  commodity: string;
  condition: 'above' | 'below';
  threshold: number;
  priceAtTrigger: number;
  date: string;
}

// ---------------------------------------------------------------------------
// Helpers: map DB rows → UI shapes
// ---------------------------------------------------------------------------

/** Infer a commodity category from the commodity name */
function inferCategory(name: string): CommodityCategory {
  const n = name.toLowerCase();
  if (['maize', 'wheat', 'sorghum', 'millet', 'rice', 'barley'].some((g) => n.includes(g))) return 'grains';
  if (['soybean', 'sunflower', 'groundnut', 'sesame', 'rapeseed'].some((g) => n.includes(g))) return 'oilseeds';
  if (['cotton', 'tobacco', 'sugar', 'coffee', 'tea', 'cocoa', 'cashew'].some((g) => n.includes(g))) return 'cash-crops';
  if (['beef', 'cattle', 'goat', 'sheep', 'poultry', 'chicken', 'pig', 'pork'].some((g) => n.includes(g))) return 'livestock';
  if (['tomato', 'onion', 'potato', 'cabbage', 'carrot', 'pepper', 'bean', 'cassava'].some((g) => n.includes(g))) return 'vegetables';
  return 'grains';
}

/** Generate a simple synthetic sparkline around a price point */
function syntheticTrend(price: number): number[] {
  const variance = price * 0.03;
  return Array.from({ length: 7 }, (_, i) =>
    Math.round((price - variance + (variance * 2 * i) / 6) * 100) / 100
  );
}

/** Map a MarketPriceRow → UI Commodity */
function mapPriceRow(row: MarketPriceRow): Commodity {
  const price = row.price ?? 0;
  return {
    id: row.id,
    name: row.commodity,
    category: inferCategory(row.commodity),
    price,
    currency: row.currency || '$',
    unit: row.unit || 'tonne',
    dailyChange: Math.round((Math.random() * 6 - 2) * 10) / 10, // synthetic until historical data exists
    weeklyTrend: syntheticTrend(price),
    high52w: Math.round(price * 1.15),
    low52w: Math.round(price * 0.78),
    market: row.country || row.market_location || 'Africa',
    inWatchlist: false,
  };
}

const initialWatchlist: WatchlistItem[] = [];

const initialAlerts: PriceAlert[] = [
  { id: 'a1', commodity: 'White Maize', condition: 'above', threshold: 300, active: true },
  { id: 'a2', commodity: 'Soybeans', condition: 'above', threshold: 550, active: true },
  { id: 'a3', commodity: 'Beef Cattle', condition: 'below', threshold: 3800, active: true },
];

const alertHistoryData: AlertHistory[] = [
  { id: 'h1', commodity: 'Tomatoes', condition: 'above', threshold: 850, priceAtTrigger: 862, date: 'Mar 14, 2026' },
  { id: 'h2', commodity: 'White Maize', condition: 'above', threshold: 280, priceAtTrigger: 283, date: 'Mar 12, 2026' },
  { id: 'h3', commodity: 'Cotton', condition: 'below', threshold: 1900, priceAtTrigger: 1885, date: 'Mar 10, 2026' },
  { id: 'h4', commodity: 'Wheat', condition: 'above', threshold: 340, priceAtTrigger: 345, date: 'Mar 8, 2026' },
  { id: 'h5', commodity: 'Groundnuts', condition: 'above', threshold: 600, priceAtTrigger: 612, date: 'Mar 5, 2026' },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const categories: { key: CommodityCategory; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'grains', label: 'Grains' },
  { key: 'oilseeds', label: 'Oilseeds' },
  { key: 'cash-crops', label: 'Cash Crops' },
  { key: 'livestock', label: 'Livestock' },
  { key: 'vegetables', label: 'Vegetables' },
];

function MiniSparkline({ data, positive }: { data: number[]; positive: boolean }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const height = 24;
  const width = 60;
  const step = width / (data.length - 1);

  const points = data.map((v, i) => `${i * step},${height - ((v - min) / range) * height}`).join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={positive ? '#8CB89C' : '#ef4444'}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function MarketPricesPage() {
  const { prices, loading, error } = useMarketPrices();

  const allCommodities: Commodity[] = useMemo(
    () => prices.map(mapPriceRow),
    [prices],
  );

  const tickerData = useMemo(
    () =>
      allCommodities.slice(0, 8).map((c) => ({
        name: c.name,
        price: c.price,
        change: c.dailyChange,
      })),
    [allCommodities],
  );

  const [activeTab, setActiveTab] = useState<'commodities' | 'watchlist' | 'alerts'>('commodities');
  const [categoryFilter, setCategoryFilter] = useState<CommodityCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [watchlist, setWatchlist] = useState(initialWatchlist);
  const [alerts, setAlerts] = useState(initialAlerts);
  const [watchlistIds, setWatchlistIds] = useState<Set<string>>(new Set(initialWatchlist.map(w => w.id)));

  // Alert form state
  const [alertCommodity, setAlertCommodity] = useState('');
  const [alertCondition, setAlertCondition] = useState<'above' | 'below'>('above');
  const [alertThreshold, setAlertThreshold] = useState('300');

  // Set default alert commodity when data loads
  useEffect(() => {
    if (allCommodities.length > 0 && !alertCommodity) {
      setAlertCommodity(allCommodities[0].name);
    }
  }, [allCommodities, alertCommodity]);

  const filteredCommodities = allCommodities.filter((c) => {
    const matchCategory = categoryFilter === 'all' || c.category === categoryFilter;
    const matchSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-[#D4A843] via-[#c49a3a] to-[#1B2A4A] px-4 lg:px-6 py-8 lg:py-12">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-white">Market Prices</h1>
                <p className="text-amber-100 text-sm lg:text-base">Loading live prices...</p>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-5xl mx-auto px-4 lg:px-6 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-3" />
                <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mb-3" />
                <div className="h-6 w-full bg-gray-100 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Unable to load market prices</p>
          <p className="text-sm text-gray-400 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  const toggleWatchlist = (commodity: Commodity) => {
    const newIds = new Set(watchlistIds);
    if (newIds.has(commodity.id)) {
      newIds.delete(commodity.id);
      setWatchlist(prev => prev.filter(w => w.id !== commodity.id));
    } else {
      newIds.add(commodity.id);
      setWatchlist(prev => [...prev, {
        id: commodity.id,
        name: commodity.name,
        price: commodity.price,
        currency: commodity.currency,
        unit: commodity.unit,
        dailyChange: commodity.dailyChange,
        alertThreshold: null,
      }]);
    }
    setWatchlistIds(newIds);
  };

  const removeFromWatchlist = (id: string) => {
    setWatchlist(prev => prev.filter(w => w.id !== id));
    const newIds = new Set(watchlistIds);
    newIds.delete(id);
    setWatchlistIds(newIds);
  };

  const addAlert = () => {
    const newAlert: PriceAlert = {
      id: `a${Date.now()}`,
      commodity: alertCommodity,
      condition: alertCondition,
      threshold: parseFloat(alertThreshold),
      active: true,
    };
    setAlerts(prev => [...prev, newAlert]);
  };

  const removeAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const tabs = [
    { key: 'commodities' as const, label: 'Commodities' },
    { key: 'watchlist' as const, label: 'My Watchlist' },
    { key: 'alerts' as const, label: 'Price Alerts' },
  ];

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
        className="bg-gradient-to-r from-[#D4A843] via-[#c49a3a] to-[#1B2A4A] px-4 lg:px-6 py-8 lg:py-12"
      >
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-white">Market Prices</h1>
              <p className="text-amber-100 text-sm lg:text-base">Live agricultural commodity prices</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-amber-200 text-xs mt-4">
            <Clock className="w-3.5 h-3.5" />
            <span>Last updated: {prices.length > 0 ? new Date(prices[0].date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Loading...'}</span>
          </div>
        </div>
      </motion.div>

      {/* ─── Price Ticker ─── */}
      <motion.div variants={cardVariants} className="bg-white border-b border-gray-100 overflow-hidden">
        <div className="flex gap-6 overflow-x-auto px-4 lg:px-6 py-3 scrollbar-thin">
          {tickerData.length === 0 && (
            <div className="text-sm text-gray-400 py-1">No price data available</div>
          )}
          {tickerData.map((item) => (
            <div key={item.name} className="flex items-center gap-2 flex-shrink-0">
              <span className="text-sm font-medium text-[#1B2A4A]">{item.name}</span>
              <span className="text-sm font-bold text-[#1B2A4A]">${item.price}</span>
              <span className={`flex items-center gap-0.5 text-xs font-semibold ${item.change >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                {item.change >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                {Math.abs(item.change)}%
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      <div className="max-w-5xl mx-auto px-4 lg:px-6 py-6 space-y-6">

        {/* ─── Tab Switcher ─── */}
        <motion.div variants={cardVariants} className="flex gap-1 bg-gray-100 p-1 rounded-xl">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-white text-[#1B2A4A] shadow-sm'
                  : 'text-gray-500 hover:text-[#1B2A4A]'
              }`}
            >
              {tab.label}
              {tab.key === 'watchlist' && (
                <span className="ml-1.5 text-xs bg-[#8CB89C]/10 text-[#8CB89C] px-1.5 py-0.5 rounded-full">
                  {watchlist.length}
                </span>
              )}
              {tab.key === 'alerts' && (
                <span className="ml-1.5 text-xs bg-[#D4A843]/10 text-[#D4A843] px-1.5 py-0.5 rounded-full">
                  {alerts.length}
                </span>
              )}
            </button>
          ))}
        </motion.div>

        {/* ─── Commodities Tab ─── */}
        <AnimatePresence mode="wait">
          {activeTab === 'commodities' && (
            <motion.div
              key="commodities"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {/* Search & Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search commodities..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white text-[#1B2A4A] focus:outline-none focus:ring-2 focus:ring-[#8CB89C]/20 focus:border-[#8CB89C]"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                {categories.map((cat) => (
                  <button
                    key={cat.key}
                    onClick={() => setCategoryFilter(cat.key)}
                    className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      categoryFilter === cat.key
                        ? 'bg-[#1B2A4A] text-white shadow-sm'
                        : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Commodity Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCommodities.map((commodity) => (
                  <motion.div
                    key={commodity.id}
                    variants={cardVariants}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-sm font-semibold text-[#1B2A4A]">{commodity.name}</h3>
                        <p className="text-xs text-gray-400">{commodity.market}</p>
                      </div>
                      <button
                        onClick={() => toggleWatchlist(commodity)}
                        className="p-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Heart
                          className={`w-4 h-4 transition-colors ${
                            watchlistIds.has(commodity.id) ? 'fill-red-500 text-red-500' : 'text-gray-300'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-end justify-between mb-3">
                      <div>
                        <p className="text-2xl font-bold text-[#1B2A4A]">
                          {commodity.currency}{commodity.price.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-400">per {commodity.unit}</p>
                      </div>
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${
                        commodity.dailyChange >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'
                      }`}>
                        {commodity.dailyChange >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                        {Math.abs(commodity.dailyChange)}%
                      </div>
                    </div>

                    {/* Mini Sparkline */}
                    <div className="mb-3 flex justify-center">
                      <MiniSparkline data={commodity.weeklyTrend} positive={commodity.dailyChange >= 0} />
                    </div>

                    {/* 52-week range */}
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>52w L: ${commodity.low52w}</span>
                      <div className="flex-1 mx-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-red-400 via-amber-400 to-green-400"
                          style={{
                            width: `${((commodity.price - commodity.low52w) / (commodity.high52w - commodity.low52w)) * 100}%`
                          }}
                        />
                      </div>
                      <span>52w H: ${commodity.high52w}</span>
                    </div>
                  </motion.div>
                ))}
              </div>

              {filteredCommodities.length === 0 && (
                <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                  <Search className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No commodities found matching your criteria</p>
                </div>
              )}
            </motion.div>
          )}

          {/* ─── Watchlist Tab ─── */}
          {activeTab === 'watchlist' && (
            <motion.div
              key="watchlist"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {watchlist.length > 0 ? (
                <div className="space-y-3">
                  {watchlist.map((item) => (
                    <motion.div
                      key={item.id}
                      variants={cardVariants}
                      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#D4A843]/10 flex items-center justify-center">
                            <Star className="w-5 h-5 text-[#D4A843]" />
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-[#1B2A4A]">{item.name}</h3>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-lg font-bold text-[#1B2A4A]">
                                {item.currency}{item.price.toLocaleString()}/{item.unit}
                              </span>
                              <span className={`flex items-center gap-0.5 text-xs font-semibold ${
                                item.dailyChange >= 0 ? 'text-green-600' : 'text-red-500'
                              }`}>
                                {item.dailyChange >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                                {Math.abs(item.dailyChange)}%
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {item.alertThreshold && (
                            <div className="bg-amber-50 border border-amber-100 rounded-lg px-2.5 py-1 text-xs">
                              <span className="text-gray-400">Alert at </span>
                              <span className="font-semibold text-[#D4A843]">${item.alertThreshold}</span>
                            </div>
                          )}
                          <button
                            onClick={() => removeFromWatchlist(item.id)}
                            className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                  <Heart className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-sm font-medium text-[#1B2A4A] mb-1">Your watchlist is empty</p>
                  <p className="text-xs text-gray-400">
                    Click the heart icon on any commodity to add it to your watchlist
                  </p>
                  <button
                    onClick={() => setActiveTab('commodities')}
                    className="mt-4 px-4 py-2 bg-[#8CB89C] text-white rounded-xl text-sm font-medium hover:bg-[#239189] transition-colors"
                  >
                    Browse Commodities
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* ─── Price Alerts Tab ─── */}
          {activeTab === 'alerts' && (
            <motion.div
              key="alerts"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Set New Alert */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h3 className="text-sm font-bold text-[#1B2A4A] mb-4 flex items-center gap-2">
                  <BellRing className="w-4 h-4 text-[#D4A843]" />
                  Set New Alert
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Commodity</label>
                    <select
                      value={alertCommodity}
                      onChange={(e) => setAlertCommodity(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white text-[#1B2A4A] focus:outline-none focus:ring-2 focus:ring-[#D4A843]/20"
                    >
                      {allCommodities.map((c) => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Condition</label>
                    <select
                      value={alertCondition}
                      onChange={(e) => setAlertCondition(e.target.value as 'above' | 'below')}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white text-[#1B2A4A] focus:outline-none focus:ring-2 focus:ring-[#D4A843]/20"
                    >
                      <option value="above">Price Above</option>
                      <option value="below">Price Below</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Threshold ($)</label>
                    <input
                      type="number"
                      value={alertThreshold}
                      onChange={(e) => setAlertThreshold(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white text-[#1B2A4A] focus:outline-none focus:ring-2 focus:ring-[#D4A843]/20"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={addAlert}
                      className="w-full py-2 bg-[#D4A843] text-white rounded-xl text-sm font-medium hover:bg-[#c49a3a] transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Alert
                    </button>
                  </div>
                </div>
              </div>

              {/* Active Alerts */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h3 className="text-sm font-bold text-[#1B2A4A] mb-4 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#8CB89C]" />
                  Active Alerts
                  <span className="text-xs bg-[#8CB89C]/10 text-[#8CB89C] px-2 py-0.5 rounded-full">{alerts.length}</span>
                </h3>
                {alerts.length > 0 ? (
                  <div className="space-y-2">
                    {alerts.map((alert) => (
                      <div
                        key={alert.id}
                        className="flex items-center justify-between bg-gray-50 rounded-xl p-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            alert.condition === 'above' ? 'bg-green-100' : 'bg-red-100'
                          }`}>
                            {alert.condition === 'above' ? (
                              <ArrowUp className="w-4 h-4 text-green-600" />
                            ) : (
                              <ArrowDown className="w-4 h-4 text-red-500" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[#1B2A4A]">{alert.commodity}</p>
                            <p className="text-xs text-gray-400">
                              {alert.condition === 'above' ? 'Price above' : 'Price below'} ${alert.threshold}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                            Active
                          </span>
                          <button
                            onClick={() => removeAlert(alert.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Bell className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">No active alerts</p>
                  </div>
                )}
              </div>

              {/* Alert History */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h3 className="text-sm font-bold text-[#1B2A4A] mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  Alert History
                </h3>
                <div className="space-y-2">
                  {alertHistoryData.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between bg-gray-50 rounded-xl p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-amber-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#1B2A4A]">{item.commodity}</p>
                          <p className="text-xs text-gray-400">
                            {item.condition === 'above' ? 'Rose above' : 'Dropped below'} ${item.threshold}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-[#1B2A4A]">${item.priceAtTrigger}</p>
                        <p className="text-xs text-gray-400">{item.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom spacer for mobile nav */}
        <div className="h-4" />
      </div>
    </motion.div>
  );
}
