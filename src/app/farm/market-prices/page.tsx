'use client';

import { useState } from 'react';
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
// Mock Data
// ---------------------------------------------------------------------------

const tickerData = [
  { name: 'Maize', price: 285, change: 2.4 },
  { name: 'Wheat', price: 342, change: -1.2 },
  { name: 'Sorghum', price: 265, change: 0.8 },
  { name: 'Soybeans', price: 520, change: 3.1 },
  { name: 'Sunflower', price: 480, change: -0.5 },
  { name: 'Cotton', price: 1850, change: 1.7 },
  { name: 'Beef', price: 4200, change: -0.3 },
  { name: 'Tomatoes', price: 890, change: 5.2 },
];

const allCommodities: Commodity[] = [
  { id: 'c1', name: 'White Maize', category: 'grains', price: 285, currency: '$', unit: 'tonne', dailyChange: 2.4, weeklyTrend: [270, 275, 278, 280, 282, 283, 285], high52w: 310, low52w: 220, market: 'Botswana', inWatchlist: true },
  { id: 'c2', name: 'Yellow Maize', category: 'grains', price: 278, currency: '$', unit: 'tonne', dailyChange: 1.8, weeklyTrend: [265, 268, 270, 272, 275, 276, 278], high52w: 295, low52w: 215, market: 'Zimbabwe', inWatchlist: false },
  { id: 'c3', name: 'Wheat', category: 'grains', price: 342, currency: '$', unit: 'tonne', dailyChange: -1.2, weeklyTrend: [350, 348, 345, 344, 343, 342, 342], high52w: 380, low52w: 290, market: 'Tanzania', inWatchlist: true },
  { id: 'c4', name: 'Sorghum', category: 'grains', price: 265, currency: '$', unit: 'tonne', dailyChange: 0.8, weeklyTrend: [258, 260, 261, 262, 263, 264, 265], high52w: 285, low52w: 195, market: 'Botswana', inWatchlist: false },
  { id: 'c5', name: 'Millet', category: 'grains', price: 310, currency: '$', unit: 'tonne', dailyChange: 0.3, weeklyTrend: [305, 306, 307, 308, 309, 309, 310], high52w: 330, low52w: 240, market: 'Zimbabwe', inWatchlist: false },
  { id: 'c6', name: 'Soybeans', category: 'oilseeds', price: 520, currency: '$', unit: 'tonne', dailyChange: 3.1, weeklyTrend: [490, 495, 500, 505, 510, 515, 520], high52w: 560, low52w: 410, market: 'Botswana', inWatchlist: true },
  { id: 'c7', name: 'Sunflower Seeds', category: 'oilseeds', price: 480, currency: '$', unit: 'tonne', dailyChange: -0.5, weeklyTrend: [485, 484, 483, 482, 481, 480, 480], high52w: 520, low52w: 380, market: 'Tanzania', inWatchlist: false },
  { id: 'c8', name: 'Groundnuts', category: 'oilseeds', price: 620, currency: '$', unit: 'tonne', dailyChange: 1.5, weeklyTrend: [605, 608, 610, 612, 615, 618, 620], high52w: 680, low52w: 490, market: 'Botswana', inWatchlist: true },
  { id: 'c9', name: 'Cotton', category: 'cash-crops', price: 1850, currency: '$', unit: 'tonne', dailyChange: 1.7, weeklyTrend: [1800, 1810, 1820, 1830, 1840, 1845, 1850], high52w: 2100, low52w: 1500, market: 'Zimbabwe', inWatchlist: false },
  { id: 'c10', name: 'Tobacco', category: 'cash-crops', price: 3200, currency: '$', unit: 'tonne', dailyChange: -0.8, weeklyTrend: [3240, 3230, 3225, 3220, 3215, 3210, 3200], high52w: 3500, low52w: 2800, market: 'Zimbabwe', inWatchlist: false },
  { id: 'c11', name: 'Sugar Cane', category: 'cash-crops', price: 42, currency: '$', unit: 'tonne', dailyChange: 0.5, weeklyTrend: [40, 40.5, 41, 41.2, 41.5, 41.8, 42], high52w: 48, low52w: 35, market: 'Tanzania', inWatchlist: false },
  { id: 'c12', name: 'Beef Cattle', category: 'livestock', price: 4200, currency: '$', unit: 'head', dailyChange: -0.3, weeklyTrend: [4220, 4215, 4210, 4208, 4205, 4202, 4200], high52w: 4800, low52w: 3600, market: 'Botswana', inWatchlist: true },
  { id: 'c13', name: 'Goats', category: 'livestock', price: 1200, currency: '$', unit: 'head', dailyChange: 2.0, weeklyTrend: [1150, 1160, 1170, 1180, 1185, 1190, 1200], high52w: 1350, low52w: 900, market: 'Botswana', inWatchlist: false },
  { id: 'c14', name: 'Tomatoes', category: 'vegetables', price: 890, currency: '$', unit: 'tonne', dailyChange: 5.2, weeklyTrend: [810, 830, 845, 860, 870, 880, 890], high52w: 950, low52w: 450, market: 'Botswana', inWatchlist: false },
  { id: 'c15', name: 'Onions', category: 'vegetables', price: 540, currency: '$', unit: 'tonne', dailyChange: -2.1, weeklyTrend: [560, 555, 550, 548, 545, 542, 540], high52w: 620, low52w: 350, market: 'Tanzania', inWatchlist: false },
];

const initialWatchlist: WatchlistItem[] = [
  { id: 'c1', name: 'White Maize', price: 285, currency: '$', unit: 'tonne', dailyChange: 2.4, alertThreshold: 300 },
  { id: 'c3', name: 'Wheat', price: 342, currency: '$', unit: 'tonne', dailyChange: -1.2, alertThreshold: null },
  { id: 'c6', name: 'Soybeans', price: 520, currency: '$', unit: 'tonne', dailyChange: 3.1, alertThreshold: 550 },
  { id: 'c8', name: 'Groundnuts', price: 620, currency: '$', unit: 'tonne', dailyChange: 1.5, alertThreshold: null },
  { id: 'c12', name: 'Beef Cattle', price: 4200, currency: '$', unit: 'head', dailyChange: -0.3, alertThreshold: 4500 },
];

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
        stroke={positive ? '#2AA198' : '#ef4444'}
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
  const [activeTab, setActiveTab] = useState<'commodities' | 'watchlist' | 'alerts'>('commodities');
  const [categoryFilter, setCategoryFilter] = useState<CommodityCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [watchlist, setWatchlist] = useState(initialWatchlist);
  const [alerts, setAlerts] = useState(initialAlerts);
  const [watchlistIds, setWatchlistIds] = useState<Set<string>>(new Set(initialWatchlist.map(w => w.id)));

  // Alert form state
  const [alertCommodity, setAlertCommodity] = useState('White Maize');
  const [alertCondition, setAlertCondition] = useState<'above' | 'below'>('above');
  const [alertThreshold, setAlertThreshold] = useState('300');

  const filteredCommodities = allCommodities.filter((c) => {
    const matchCategory = categoryFilter === 'all' || c.category === categoryFilter;
    const matchSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

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
            <span>Last updated: March 16, 2026 at 14:30 CAT</span>
          </div>
        </div>
      </motion.div>

      {/* ─── Price Ticker ─── */}
      <motion.div variants={cardVariants} className="bg-white border-b border-gray-100 overflow-hidden">
        <div className="flex gap-6 overflow-x-auto px-4 lg:px-6 py-3 scrollbar-thin">
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
                <span className="ml-1.5 text-xs bg-[#2AA198]/10 text-[#2AA198] px-1.5 py-0.5 rounded-full">
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
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white text-[#1B2A4A] focus:outline-none focus:ring-2 focus:ring-[#2AA198]/20 focus:border-[#2AA198]"
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
                    className="mt-4 px-4 py-2 bg-[#2AA198] text-white rounded-xl text-sm font-medium hover:bg-[#239189] transition-colors"
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
                  <Bell className="w-4 h-4 text-[#2AA198]" />
                  Active Alerts
                  <span className="text-xs bg-[#2AA198]/10 text-[#2AA198] px-2 py-0.5 rounded-full">{alerts.length}</span>
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
