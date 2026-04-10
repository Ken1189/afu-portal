'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  TrendingUp, TrendingDown, Search, Filter, ArrowUpDown, RefreshCw,
  BarChart3, Globe, Clock, DollarSign, Wheat, Leaf, Droplets,
  ChevronDown, ChevronRight, ArrowRight, Star, Bell, ExternalLink,
  Minus, Info, ShieldCheck, Zap, Users,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

/* ─── Types ─── */
interface Commodity {
  id: string;
  name: string;
  symbol: string;
  category: string;
  price: number;
  currency: string;
  unit: string;
  change24h: number;
  change7d: number;
  volume24h: number;
  high52w: number;
  low52w: number;
  marketCap: string;
  origin: string[];
  season: string;
  grade: string;
  lastUpdated: string;
  sparkline: number[];
}

interface MarketAlert {
  id: string;
  commodity: string;
  type: 'surge' | 'drop' | 'opportunity';
  message: string;
  time: string;
}

/* ─── Seed Data ─── */
const CATEGORIES = [
  { value: 'all', label: 'All Commodities' },
  { value: 'grains', label: 'Grains & Cereals' },
  { value: 'oilseeds', label: 'Oilseeds & Pulses' },
  { value: 'cash-crops', label: 'Cash Crops' },
  { value: 'horticulture', label: 'Horticulture' },
  { value: 'livestock', label: 'Livestock & Dairy' },
  { value: 'fibres', label: 'Fibres & Industrial' },
];

const SEED_COMMODITIES: Commodity[] = [
  // Grains & Cereals
  {
    id: 'maize-white', name: 'White Maize', symbol: 'WMAZ', category: 'grains',
    price: 224.50, currency: 'USD', unit: '/MT', change24h: 1.85, change7d: 3.42,
    volume24h: 18500, high52w: 268.00, low52w: 189.00, marketCap: '$4.2B',
    origin: ['Zimbabwe', 'Zambia', 'Mozambique'], season: 'Apr - Jul',
    grade: 'Grade 1 (WM1)', lastUpdated: '2 min ago',
    sparkline: [210, 215, 212, 220, 218, 225, 222, 228, 224, 224.5],
  },
  {
    id: 'maize-yellow', name: 'Yellow Maize', symbol: 'YMAZ', category: 'grains',
    price: 218.30, currency: 'USD', unit: '/MT', change24h: -0.72, change7d: 2.18,
    volume24h: 14200, high52w: 255.00, low52w: 182.50, marketCap: '$3.8B',
    origin: ['Tanzania', 'Kenya', 'Ethiopia'], season: 'Mar - Jun',
    grade: 'Grade 1 (YM1)', lastUpdated: '5 min ago',
    sparkline: [208, 212, 215, 210, 214, 220, 218, 216, 219, 218.3],
  },
  {
    id: 'wheat', name: 'Wheat', symbol: 'WHT', category: 'grains',
    price: 342.80, currency: 'USD', unit: '/MT', change24h: 0.45, change7d: -1.20,
    volume24h: 9800, high52w: 395.00, low52w: 305.00, marketCap: '$2.1B',
    origin: ['Ethiopia', 'Tanzania', 'Kenya'], season: 'Oct - Jan',
    grade: 'Grade B1', lastUpdated: '3 min ago',
    sparkline: [350, 348, 345, 340, 338, 342, 345, 344, 343, 342.8],
  },
  {
    id: 'rice', name: 'Rice (Paddy)', symbol: 'RCE', category: 'grains',
    price: 385.60, currency: 'USD', unit: '/MT', change24h: 2.10, change7d: 4.85,
    volume24h: 7200, high52w: 420.00, low52w: 340.00, marketCap: '$1.5B',
    origin: ['Tanzania', 'Mozambique', 'Madagascar'], season: 'Feb - May',
    grade: 'Grade 1 Long Grain', lastUpdated: '1 min ago',
    sparkline: [360, 365, 370, 368, 375, 380, 378, 382, 384, 385.6],
  },
  {
    id: 'sorghum', name: 'Sorghum', symbol: 'SOR', category: 'grains',
    price: 196.40, currency: 'USD', unit: '/MT', change24h: -0.35, change7d: 1.60,
    volume24h: 5600, high52w: 228.00, low52w: 172.00, marketCap: '$890M',
    origin: ['Ethiopia', 'Nigeria', 'Tanzania'], season: 'Mar - Jun',
    grade: 'Grade 1 Red', lastUpdated: '4 min ago',
    sparkline: [190, 192, 194, 193, 195, 197, 196, 198, 197, 196.4],
  },
  // Oilseeds & Pulses
  {
    id: 'soybean', name: 'Soybeans', symbol: 'SOY', category: 'oilseeds',
    price: 456.20, currency: 'USD', unit: '/MT', change24h: 1.22, change7d: 2.90,
    volume24h: 12400, high52w: 510.00, low52w: 395.00, marketCap: '$3.2B',
    origin: ['Zambia', 'Zimbabwe', 'Malawi'], season: 'Jan - Apr',
    grade: 'Grade 1 (GM)', lastUpdated: '2 min ago',
    sparkline: [440, 445, 442, 448, 450, 455, 452, 456, 454, 456.2],
  },
  {
    id: 'groundnut', name: 'Groundnuts', symbol: 'GND', category: 'oilseeds',
    price: 1120.00, currency: 'USD', unit: '/MT', change24h: 3.15, change7d: 5.40,
    volume24h: 4800, high52w: 1250.00, low52w: 920.00, marketCap: '$1.8B',
    origin: ['Malawi', 'Mozambique', 'Tanzania'], season: 'Mar - Jun',
    grade: 'CG1 (Confectionery)', lastUpdated: '6 min ago',
    sparkline: [1050, 1060, 1070, 1080, 1090, 1100, 1095, 1110, 1115, 1120],
  },
  {
    id: 'sunflower', name: 'Sunflower Seeds', symbol: 'SUN', category: 'oilseeds',
    price: 520.80, currency: 'USD', unit: '/MT', change24h: -1.05, change7d: 0.80,
    volume24h: 6100, high52w: 590.00, low52w: 460.00, marketCap: '$980M',
    origin: ['Tanzania', 'Zambia', 'Zimbabwe'], season: 'May - Aug',
    grade: 'Grade 1', lastUpdated: '8 min ago',
    sparkline: [530, 528, 525, 522, 520, 518, 520, 522, 521, 520.8],
  },
  // Cash Crops
  {
    id: 'coffee-arabica', name: 'Coffee (Arabica)', symbol: 'COFF', category: 'cash-crops',
    price: 4850.00, currency: 'USD', unit: '/MT', change24h: 2.40, change7d: 6.15,
    volume24h: 8900, high52w: 5200.00, low52w: 3800.00, marketCap: '$12.5B',
    origin: ['Ethiopia', 'Kenya', 'Tanzania'], season: 'Oct - Feb',
    grade: 'SHG (Strictly High Grown)', lastUpdated: '1 min ago',
    sparkline: [4600, 4650, 4700, 4720, 4750, 4800, 4780, 4820, 4840, 4850],
  },
  {
    id: 'cocoa', name: 'Cocoa Beans', symbol: 'CCO', category: 'cash-crops',
    price: 3240.00, currency: 'USD', unit: '/MT', change24h: -0.85, change7d: -2.30,
    volume24h: 6500, high52w: 3680.00, low52w: 2850.00, marketCap: '$8.2B',
    origin: ['Ghana', 'Cameroon', 'Tanzania'], season: 'Sep - Mar',
    grade: 'Grade I (Fermented)', lastUpdated: '3 min ago',
    sparkline: [3350, 3320, 3300, 3280, 3260, 3250, 3240, 3250, 3245, 3240],
  },
  {
    id: 'tea', name: 'Tea (Black CTC)', symbol: 'TEA', category: 'cash-crops',
    price: 2680.00, currency: 'USD', unit: '/MT', change24h: 0.92, change7d: 1.45,
    volume24h: 3800, high52w: 3100.00, low52w: 2350.00, marketCap: '$4.6B',
    origin: ['Kenya', 'Malawi', 'Tanzania'], season: 'Year-round',
    grade: 'BP1 (Broken Pekoe 1)', lastUpdated: '5 min ago',
    sparkline: [2620, 2640, 2650, 2660, 2655, 2670, 2675, 2680, 2678, 2680],
  },
  {
    id: 'tobacco', name: 'Tobacco (Virginia)', symbol: 'TBC', category: 'cash-crops',
    price: 3520.00, currency: 'USD', unit: '/MT', change24h: 0.68, change7d: 2.10,
    volume24h: 2900, high52w: 3850.00, low52w: 3100.00, marketCap: '$2.9B',
    origin: ['Zimbabwe', 'Malawi', 'Mozambique'], season: 'Feb - May',
    grade: 'Grade A (Flue-cured)', lastUpdated: '7 min ago',
    sparkline: [3450, 3460, 3480, 3490, 3500, 3510, 3505, 3515, 3518, 3520],
  },
  // Horticulture
  {
    id: 'cashew', name: 'Cashew Nuts (RCN)', symbol: 'CSH', category: 'horticulture',
    price: 1680.00, currency: 'USD', unit: '/MT', change24h: 1.55, change7d: 3.80,
    volume24h: 5200, high52w: 1850.00, low52w: 1420.00, marketCap: '$3.5B',
    origin: ['Mozambique', 'Tanzania', 'Kenya'], season: 'Oct - Jan',
    grade: 'W320 (320 kernels/lb)', lastUpdated: '4 min ago',
    sparkline: [1600, 1620, 1630, 1640, 1650, 1660, 1665, 1670, 1675, 1680],
  },
  {
    id: 'macadamia', name: 'Macadamia (NIS)', symbol: 'MAC', category: 'horticulture',
    price: 4200.00, currency: 'USD', unit: '/MT', change24h: 0.35, change7d: 1.20,
    volume24h: 1800, high52w: 4650.00, low52w: 3700.00, marketCap: '$1.2B',
    origin: ['South Africa', 'Kenya', 'Malawi'], season: 'Mar - Jul',
    grade: 'Style 0 (In Shell)', lastUpdated: '10 min ago',
    sparkline: [4150, 4160, 4170, 4180, 4175, 4185, 4190, 4195, 4198, 4200],
  },
  {
    id: 'avocado', name: 'Avocado (Hass)', symbol: 'AVO', category: 'horticulture',
    price: 2850.00, currency: 'USD', unit: '/MT', change24h: 4.20, change7d: 8.50,
    volume24h: 3400, high52w: 3200.00, low52w: 1900.00, marketCap: '$2.8B',
    origin: ['Kenya', 'Tanzania', 'Ethiopia'], season: 'Mar - Sep',
    grade: 'Class 1 (Export)', lastUpdated: '2 min ago',
    sparkline: [2500, 2550, 2600, 2650, 2700, 2750, 2780, 2800, 2830, 2850],
  },
  {
    id: 'blueberry', name: 'Blueberries', symbol: 'BLU', category: 'horticulture',
    price: 8500.00, currency: 'USD', unit: '/MT', change24h: -2.10, change7d: -4.30,
    volume24h: 1200, high52w: 9800.00, low52w: 6500.00, marketCap: '$680M',
    origin: ['South Africa', 'Zimbabwe'], season: 'Aug - Nov',
    grade: 'Premium (12mm+)', lastUpdated: '12 min ago',
    sparkline: [8900, 8850, 8800, 8750, 8700, 8650, 8600, 8550, 8520, 8500],
  },
  // Livestock & Dairy
  {
    id: 'beef', name: 'Beef (A-Grade)', symbol: 'BEF', category: 'livestock',
    price: 3850.00, currency: 'USD', unit: '/MT', change24h: 0.55, change7d: 1.90,
    volume24h: 4200, high52w: 4200.00, low52w: 3400.00, marketCap: '$5.1B',
    origin: ['Botswana', 'Zimbabwe', 'Tanzania'], season: 'Year-round',
    grade: 'A2/A3 (Carcass)', lastUpdated: '6 min ago',
    sparkline: [3780, 3790, 3800, 3810, 3820, 3830, 3835, 3840, 3845, 3850],
  },
  {
    id: 'chicken', name: 'Poultry (Broiler)', symbol: 'PLT', category: 'livestock',
    price: 1450.00, currency: 'USD', unit: '/MT', change24h: -0.40, change7d: 0.65,
    volume24h: 6800, high52w: 1620.00, low52w: 1280.00, marketCap: '$2.4B',
    origin: ['Zimbabwe', 'Zambia', 'Tanzania'], season: 'Year-round',
    grade: 'Fresh Whole (1.2-1.8kg)', lastUpdated: '9 min ago',
    sparkline: [1440, 1445, 1448, 1452, 1450, 1455, 1453, 1451, 1450, 1450],
  },
  // Fibres & Industrial
  {
    id: 'cotton', name: 'Cotton Lint', symbol: 'CTN', category: 'fibres',
    price: 1820.00, currency: 'USD', unit: '/MT', change24h: 1.30, change7d: 2.65,
    volume24h: 5400, high52w: 2050.00, low52w: 1580.00, marketCap: '$3.8B',
    origin: ['Zimbabwe', 'Mozambique', 'Tanzania'], season: 'Apr - Jul',
    grade: 'Middling (SM 1-1/16")', lastUpdated: '3 min ago',
    sparkline: [1760, 1770, 1780, 1790, 1800, 1810, 1805, 1815, 1818, 1820],
  },
  {
    id: 'sugar', name: 'Raw Sugar', symbol: 'SGR', category: 'fibres',
    price: 480.50, currency: 'USD', unit: '/MT', change24h: -1.60, change7d: -3.20,
    volume24h: 11200, high52w: 560.00, low52w: 420.00, marketCap: '$6.5B',
    origin: ['Mozambique', 'Tanzania', 'Zimbabwe'], season: 'May - Nov',
    grade: 'VHP (Very High Polarisation)', lastUpdated: '1 min ago',
    sparkline: [500, 498, 495, 492, 490, 488, 485, 483, 481, 480.5],
  },
];

const SEED_ALERTS: MarketAlert[] = [
  { id: '1', commodity: 'Avocado (Hass)', type: 'surge', message: 'Up 8.5% this week on strong EU demand', time: '12 min ago' },
  { id: '2', commodity: 'Coffee (Arabica)', type: 'surge', message: 'Hitting 6-month high on frost concerns in Ethiopia', time: '28 min ago' },
  { id: '3', commodity: 'Blueberries', type: 'drop', message: 'Down 4.3% as SA season supply increases', time: '45 min ago' },
  { id: '4', commodity: 'Groundnuts', type: 'opportunity', message: 'Forward contracts available at $1,180/MT for Q3 delivery', time: '1 hr ago' },
  { id: '5', commodity: 'Raw Sugar', type: 'drop', message: 'Global oversupply pushing prices below 6-month average', time: '2 hr ago' },
];

/* ─── Mini Sparkline Component ─── */
function Sparkline({ data, positive }: { data: number[]; positive: boolean }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const h = 32;
  const w = 80;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(' ');

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-20 h-8" preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke={positive ? '#5DB347' : '#EF4444'}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ─── Change Badge ─── */
function ChangeBadge({ value, size = 'sm' }: { value: number; size?: 'sm' | 'md' }) {
  const isUp = value > 0;
  const isFlat = value === 0;
  const sizeClass = size === 'md' ? 'text-xs px-2.5 py-1' : 'text-[10px] px-2 py-0.5';

  if (isFlat) return (
    <span className={`inline-flex items-center gap-1 rounded-full font-semibold bg-slate-100 text-slate-500 ${sizeClass}`}>
      <Minus className="w-3 h-3" /> 0.00%
    </span>
  );

  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-semibold ${sizeClass} ${
      isUp ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
    }`}>
      {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {isUp ? '+' : ''}{value.toFixed(2)}%
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════════════════ */
export default function CommoditiesPage() {
  const [category, setCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'change24h' | 'volume'>('volume');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [showWatchlistOnly, setShowWatchlistOnly] = useState(false);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Load watchlist from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('afu-watchlist');
    if (saved) setWatchlist(JSON.parse(saved));
  }, []);

  const toggleWatchlist = (id: string) => {
    setWatchlist(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      localStorage.setItem('afu-watchlist', JSON.stringify(next));
      return next;
    });
  };

  const handleSort = (key: typeof sortBy) => {
    if (sortBy === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortDir('desc');
    }
  };

  const filtered = useMemo(() => {
    let list = SEED_COMMODITIES;
    if (category !== 'all') list = list.filter(c => c.category === category);
    if (showWatchlistOnly) list = list.filter(c => watchlist.includes(c.id));
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(c => c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q));
    }
    list = [...list].sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'name') cmp = a.name.localeCompare(b.name);
      else if (sortBy === 'price') cmp = a.price - b.price;
      else if (sortBy === 'change24h') cmp = a.change24h - b.change24h;
      else if (sortBy === 'volume') cmp = a.volume24h - b.volume24h;
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [category, searchTerm, sortBy, sortDir, watchlist, showWatchlistOnly]);

  // Market summary stats
  const gainers = SEED_COMMODITIES.filter(c => c.change24h > 0).length;
  const losers = SEED_COMMODITIES.filter(c => c.change24h < 0).length;
  const topGainer = [...SEED_COMMODITIES].sort((a, b) => b.change24h - a.change24h)[0];
  const topLoser = [...SEED_COMMODITIES].sort((a, b) => a.change24h - b.change24h)[0];

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.03 } } };
  const rowVariants = { hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#F8FAFB]">
        {/* Hero */}
        <section className="bg-gradient-to-br from-[#1B2A4A] via-[#223350] to-[#1B2A4A] pt-28 pb-16 relative overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(93,179,71,0.1) 40px, rgba(93,179,71,0.1) 41px), repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(93,179,71,0.1) 40px, rgba(93,179,71,0.1) 41px)' }} />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="text-center max-w-3xl mx-auto">
              <span className="inline-flex items-center gap-2 bg-[#5DB347]/20 text-[#5DB347] text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
                <BarChart3 className="w-3.5 h-3.5" /> African Commodities Trading Platform
              </span>
              <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
                Trade African Commodities
              </h1>
              <p className="text-lg text-white/50 leading-relaxed mb-8">
                Real-time prices, market intelligence, and direct trading for 20+ agricultural
                commodities across Africa. From grains to horticulture, livestock to cash crops.
              </p>

              {/* Market summary bar */}
              <div className="inline-flex items-center gap-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl px-6 py-3">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{SEED_COMMODITIES.length}</p>
                  <p className="text-[10px] text-white/40 uppercase tracking-wider">Commodities</p>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div className="text-center">
                  <p className="text-2xl font-bold text-emerald-400">{gainers}</p>
                  <p className="text-[10px] text-white/40 uppercase tracking-wider">Gainers</p>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-400">{losers}</p>
                  <p className="text-[10px] text-white/40 uppercase tracking-wider">Losers</p>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div className="text-center">
                  <p className="text-sm font-bold text-emerald-400">{topGainer.name}</p>
                  <p className="text-[10px] text-white/40 uppercase tracking-wider">Top Gainer (+{topGainer.change24h.toFixed(1)}%)</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 pb-20">
          {/* Market Alerts */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Bell className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold text-[#1B2A4A]">Market Alerts</h3>
              <span className="text-[10px] bg-amber-50 text-amber-700 font-semibold px-2 py-0.5 rounded-full">{SEED_ALERTS.length} new</span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-1">
              {SEED_ALERTS.map(alert => (
                <div
                  key={alert.id}
                  className={`flex-shrink-0 w-72 rounded-xl border p-3 ${
                    alert.type === 'surge' ? 'border-emerald-200 bg-emerald-50/50' :
                    alert.type === 'drop' ? 'border-red-200 bg-red-50/50' :
                    'border-blue-200 bg-blue-50/50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {alert.type === 'surge' && <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />}
                    {alert.type === 'drop' && <TrendingDown className="w-3.5 h-3.5 text-red-500" />}
                    {alert.type === 'opportunity' && <Zap className="w-3.5 h-3.5 text-blue-600" />}
                    <span className="text-xs font-bold text-[#1B2A4A]">{alert.commodity}</span>
                    <span className="text-[10px] text-gray-400 ml-auto">{alert.time}</span>
                  </div>
                  <p className="text-[11px] text-gray-600 leading-relaxed">{alert.message}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Search by name or symbol..."
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] transition-all"
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.value}
                    onClick={() => setCategory(cat.value)}
                    className={`text-xs font-medium px-3 py-2 rounded-xl transition-all ${
                      category === cat.value
                        ? 'bg-[#1B2A4A] text-white shadow-sm'
                        : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowWatchlistOnly(!showWatchlistOnly)}
                className={`flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl transition-all ${
                  showWatchlistOnly ? 'bg-amber-100 text-amber-700' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                }`}
              >
                <Star className={`w-3.5 h-3.5 ${showWatchlistOnly ? 'fill-amber-500' : ''}`} />
                Watchlist ({watchlist.length})
              </button>

              <button
                onClick={() => setLastRefresh(new Date())}
                className="p-2 rounded-xl bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                title="Refresh prices"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Results info */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs text-gray-400">
              Showing <span className="font-semibold text-gray-600">{filtered.length}</span> commodities
              {category !== 'all' && <> in <span className="font-semibold text-gray-600">{CATEGORIES.find(c => c.value === category)?.label}</span></>}
            </p>
            <p className="text-[10px] text-gray-400 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Last updated: {lastRefresh.toLocaleTimeString()}
            </p>
          </div>

          {/* ═══ COMMODITIES TABLE ═══ */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-[40px_1fr_100px_100px_100px_80px_80px_48px] gap-3 px-5 py-3 bg-slate-50 border-b border-gray-100">
              <span />
              <button onClick={() => handleSort('name')} className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider hover:text-slate-600">
                Commodity {sortBy === 'name' && <ArrowUpDown className="w-3 h-3" />}
              </button>
              <button onClick={() => handleSort('price')} className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider hover:text-slate-600 text-right justify-end">
                Price {sortBy === 'price' && <ArrowUpDown className="w-3 h-3" />}
              </button>
              <button onClick={() => handleSort('change24h')} className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider hover:text-slate-600 text-right justify-end">
                24h {sortBy === 'change24h' && <ArrowUpDown className="w-3 h-3" />}
              </button>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">7d</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Chart</span>
              <button onClick={() => handleSort('volume')} className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider hover:text-slate-600 text-right justify-end">
                Vol {sortBy === 'volume' && <ArrowUpDown className="w-3 h-3" />}
              </button>
              <span />
            </div>

            {/* Table body */}
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="divide-y divide-gray-50">
              {filtered.map(c => {
                const isExpanded = expandedRow === c.id;
                const isWatched = watchlist.includes(c.id);

                return (
                  <motion.div key={c.id} variants={rowVariants}>
                    {/* Main row */}
                    <div
                      className="grid grid-cols-[40px_1fr_100px_100px_100px_80px_80px_48px] gap-3 px-5 py-3.5 items-center hover:bg-slate-50/50 transition-colors cursor-pointer"
                      onClick={() => setExpandedRow(isExpanded ? null : c.id)}
                    >
                      {/* Watchlist star */}
                      <button
                        onClick={e => { e.stopPropagation(); toggleWatchlist(c.id); }}
                        className="p-1"
                      >
                        <Star className={`w-4 h-4 transition-colors ${isWatched ? 'text-amber-400 fill-amber-400' : 'text-gray-200 hover:text-amber-300'}`} />
                      </button>

                      {/* Name + symbol */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-[#1B2A4A]/5 flex items-center justify-center text-xs font-bold text-[#1B2A4A] flex-shrink-0">
                          {c.symbol.substring(0, 2)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[#1B2A4A] truncate">{c.name}</p>
                          <p className="text-[10px] text-gray-400 font-mono">{c.symbol}</p>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <p className="text-sm font-bold text-[#1B2A4A]">${c.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                        <p className="text-[10px] text-gray-400">{c.unit}</p>
                      </div>

                      {/* 24h change */}
                      <div className="text-right">
                        <ChangeBadge value={c.change24h} />
                      </div>

                      {/* 7d change */}
                      <div className="text-right">
                        <ChangeBadge value={c.change7d} />
                      </div>

                      {/* Sparkline */}
                      <div className="flex justify-end">
                        <Sparkline data={c.sparkline} positive={c.change7d >= 0} />
                      </div>

                      {/* Volume */}
                      <div className="text-right">
                        <p className="text-xs font-medium text-gray-600">{(c.volume24h / 1000).toFixed(1)}K</p>
                        <p className="text-[10px] text-gray-400">MT</p>
                      </div>

                      {/* Expand */}
                      <div className="flex justify-center">
                        <ChevronDown className={`w-4 h-4 text-gray-300 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </div>
                    </div>

                    {/* Expanded detail row */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-5 pt-1">
                            <div className="bg-slate-50 rounded-xl p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div>
                                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1">52-Week Range</p>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-500">${c.low52w.toLocaleString()}</span>
                                  <div className="flex-1 h-1.5 bg-gray-200 rounded-full relative">
                                    <div
                                      className="absolute h-full bg-gradient-to-r from-red-400 via-amber-400 to-emerald-400 rounded-full"
                                      style={{ width: `${((c.price - c.low52w) / (c.high52w - c.low52w)) * 100}%` }}
                                    />
                                  </div>
                                  <span className="text-xs text-gray-500">${c.high52w.toLocaleString()}</span>
                                </div>
                              </div>
                              <div>
                                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1">Origin Countries</p>
                                <p className="text-sm text-[#1B2A4A] font-medium">{c.origin.join(', ')}</p>
                              </div>
                              <div>
                                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1">Peak Season</p>
                                <p className="text-sm text-[#1B2A4A] font-medium">{c.season}</p>
                              </div>
                              <div>
                                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1">Quality Grade</p>
                                <p className="text-sm text-[#1B2A4A] font-medium">{c.grade}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 mt-3">
                              <Link
                                href="/apply"
                                className="inline-flex items-center gap-2 bg-[#5DB347] text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-[#449933] transition-colors"
                              >
                                Trade Now <ArrowRight className="w-3.5 h-3.5" />
                              </Link>
                              <Link
                                href="/farm/offtake"
                                className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-600 text-xs font-medium px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors"
                              >
                                View Forward Contracts <ExternalLink className="w-3.5 h-3.5" />
                              </Link>
                              <span className="text-[10px] text-gray-400 ml-auto flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {c.lastUpdated}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>

          {/* Bottom CTA */}
          <div className="mt-12 bg-gradient-to-br from-[#1B2A4A] to-[#223350] rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Start Trading African Commodities</h2>
            <p className="text-white/50 max-w-xl mx-auto mb-6 text-sm leading-relaxed">
              Join AFU to access real-time pricing, forward contracts, and direct trade with
              verified buyers and sellers across 9 African countries.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link
                href="/apply"
                className="inline-flex items-center gap-2 bg-[#5DB347] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#449933] transition-colors shadow-lg shadow-[#5DB347]/20"
              >
                Join AFU <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/services/forward-contracts"
                className="inline-flex items-center gap-2 bg-white/10 text-white font-medium px-6 py-3 rounded-xl hover:bg-white/20 transition-colors"
              >
                Learn About Forward Contracts
              </Link>
            </div>

            {/* Trust signals */}
            <div className="flex items-center justify-center gap-8 mt-8">
              {[
                { icon: ShieldCheck, text: 'Verified Traders' },
                { icon: Globe, text: '9 Countries' },
                { icon: Users, text: '10,000+ Members' },
                { icon: Zap, text: 'Real-Time Data' },
              ].map(s => (
                <div key={s.text} className="flex items-center gap-1.5 text-white/30 text-xs">
                  <s.icon className="w-3.5 h-3.5" />
                  <span>{s.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
