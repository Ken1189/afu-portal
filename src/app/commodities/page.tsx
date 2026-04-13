'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import {
  TrendingUp, TrendingDown, Search, ArrowRight, BarChart3,
  Wheat, Leaf, Zap, Cherry, Beef, Ribbon, Globe, Filter,
} from 'lucide-react';

/* ─── Types ─── */
interface Commodity {
  name: string;
  slug: string;
  symbol: string;
  price: number;
  unit: string;
  change24h: number;
  high52w: number;
  low52w: number;
  category: string;
  countries: string[];
  volume: number;
  sparkline: number[];
}

/* ─── Categories ─── */
const CATEGORIES = [
  { key: 'All', label: 'All', icon: BarChart3 },
  { key: 'Grains', label: 'Grains', icon: Wheat },
  { key: 'Oilseeds', label: 'Oilseeds', icon: Leaf },
  { key: 'Cash Crops', label: 'Cash Crops', icon: Zap },
  { key: 'Horticulture', label: 'Horticulture', icon: Cherry },
  { key: 'Livestock', label: 'Livestock', icon: Beef },
  { key: 'Fibres', label: 'Fibres', icon: Ribbon },
];

const COUNTRIES = [
  'All', 'Zimbabwe', 'Kenya', 'Tanzania', 'South Africa', 'Nigeria',
  'Ghana', 'Uganda', 'Zambia', 'Mozambique', 'Ethiopia', 'Botswana', 'Sierra Leone',
];

/* ─── Generate sparkline data ─── */
function generateSparkline(base: number, change: number): number[] {
  const points: number[] = [];
  let val = base * (1 - Math.abs(change) / 100 * 2);
  for (let i = 0; i < 20; i++) {
    val += (Math.random() - 0.45) * (base * 0.015);
    points.push(val);
  }
  points.push(base);
  return points;
}

/* ─── Fallback data ─── */
const FALLBACK_COMMODITIES: Commodity[] = [
  { name: 'Maize', slug: 'maize', symbol: 'MZE', price: 248, unit: 'tonne', change24h: 2.4, high52w: 295, low52w: 198, category: 'Grains', countries: ['Zimbabwe', 'Zambia', 'Kenya', 'Tanzania', 'South Africa'], volume: 12450, sparkline: [] },
  { name: 'Coffee Arabica', slug: 'coffee-arabica', symbol: 'COF', price: 4120, unit: 'tonne', change24h: -1.1, high52w: 4580, low52w: 3450, category: 'Cash Crops', countries: ['Ethiopia', 'Kenya', 'Tanzania', 'Uganda'], volume: 8320, sparkline: [] },
  { name: 'Soybean', slug: 'soybean', symbol: 'SOY', price: 615, unit: 'tonne', change24h: 3.7, high52w: 680, low52w: 510, category: 'Oilseeds', countries: ['Zambia', 'Zimbabwe', 'South Africa', 'Nigeria'], volume: 9870, sparkline: [] },
  { name: 'Cocoa', slug: 'cocoa', symbol: 'CCO', price: 3280, unit: 'tonne', change24h: 0.8, high52w: 3650, low52w: 2890, category: 'Cash Crops', countries: ['Ghana', 'Nigeria', 'Sierra Leone'], volume: 7650, sparkline: [] },
  { name: 'Cotton', slug: 'cotton', symbol: 'CTN', price: 1845, unit: 'tonne', change24h: -0.5, high52w: 2100, low52w: 1620, category: 'Fibres', countries: ['Zimbabwe', 'Tanzania', 'Mozambique', 'Nigeria'], volume: 5430, sparkline: [] },
  { name: 'Cashew Nuts', slug: 'cashew-nuts', symbol: 'CSH', price: 1520, unit: 'tonne', change24h: 1.9, high52w: 1780, low52w: 1290, category: 'Horticulture', countries: ['Tanzania', 'Mozambique', 'Nigeria', 'Ghana'], volume: 4210, sparkline: [] },
  { name: 'Tobacco', slug: 'tobacco', symbol: 'TBC', price: 3650, unit: 'tonne', change24h: 0.3, high52w: 4100, low52w: 3200, category: 'Cash Crops', countries: ['Zimbabwe', 'Zambia', 'Tanzania', 'Mozambique'], volume: 6890, sparkline: [] },
  { name: 'Tea', slug: 'tea', symbol: 'TEA', price: 2890, unit: 'tonne', change24h: -0.7, high52w: 3200, low52w: 2450, category: 'Cash Crops', countries: ['Kenya', 'Tanzania', 'Uganda', 'Ethiopia'], volume: 5670, sparkline: [] },
  { name: 'Macadamia', slug: 'macadamia', symbol: 'MAC', price: 7200, unit: 'tonne', change24h: 4.2, high52w: 7800, low52w: 5900, category: 'Horticulture', countries: ['Kenya', 'South Africa', 'Zimbabwe'], volume: 2340, sparkline: [] },
  { name: 'Blueberries', slug: 'blueberries', symbol: 'BLU', price: 5100, unit: 'tonne', change24h: 1.5, high52w: 5800, low52w: 4200, category: 'Horticulture', countries: ['South Africa', 'Zimbabwe', 'Kenya'], volume: 1890, sparkline: [] },
  { name: 'Wheat', slug: 'wheat', symbol: 'WHT', price: 320, unit: 'tonne', change24h: -0.3, high52w: 375, low52w: 268, category: 'Grains', countries: ['South Africa', 'Kenya', 'Ethiopia', 'Tanzania'], volume: 10230, sparkline: [] },
  { name: 'Sorghum', slug: 'sorghum', symbol: 'SRG', price: 210, unit: 'tonne', change24h: 1.2, high52w: 248, low52w: 175, category: 'Grains', countries: ['Nigeria', 'Ethiopia', 'Tanzania', 'Zimbabwe'], volume: 7540, sparkline: [] },
  { name: 'Rice', slug: 'rice', symbol: 'RCE', price: 480, unit: 'tonne', change24h: 0.6, high52w: 540, low52w: 410, category: 'Grains', countries: ['Tanzania', 'Nigeria', 'Ghana', 'Sierra Leone'], volume: 8910, sparkline: [] },
  { name: 'Groundnuts', slug: 'groundnuts', symbol: 'GNT', price: 890, unit: 'tonne', change24h: 2.1, high52w: 980, low52w: 750, category: 'Oilseeds', countries: ['Nigeria', 'Zimbabwe', 'Zambia', 'Tanzania'], volume: 4560, sparkline: [] },
  { name: 'Sunflower', slug: 'sunflower', symbol: 'SNF', price: 720, unit: 'tonne', change24h: -1.3, high52w: 820, low52w: 610, category: 'Oilseeds', countries: ['Tanzania', 'Zimbabwe', 'Zambia', 'South Africa'], volume: 3890, sparkline: [] },
  { name: 'Sugarcane', slug: 'sugarcane', symbol: 'SGC', price: 45, unit: 'tonne', change24h: 0.2, high52w: 52, low52w: 38, category: 'Fibres', countries: ['South Africa', 'Zimbabwe', 'Mozambique', 'Kenya'], volume: 15600, sparkline: [] },
  { name: 'Avocado', slug: 'avocado', symbol: 'AVO', price: 2400, unit: 'tonne', change24h: 3.1, high52w: 2750, low52w: 1980, category: 'Horticulture', countries: ['Kenya', 'South Africa', 'Tanzania', 'Ethiopia'], volume: 3120, sparkline: [] },
  { name: 'Sesame', slug: 'sesame', symbol: 'SES', price: 1680, unit: 'tonne', change24h: 0.9, high52w: 1890, low52w: 1420, category: 'Oilseeds', countries: ['Ethiopia', 'Tanzania', 'Nigeria', 'Uganda'], volume: 2780, sparkline: [] },
  { name: 'Millet', slug: 'millet', symbol: 'MLT', price: 195, unit: 'tonne', change24h: -0.8, high52w: 230, low52w: 165, category: 'Grains', countries: ['Nigeria', 'Uganda', 'Ethiopia', 'Tanzania'], volume: 6340, sparkline: [] },
  { name: 'Beef Cattle', slug: 'beef-cattle', symbol: 'BCT', price: 3200, unit: 'kg', change24h: 0.4, high52w: 3600, low52w: 2800, category: 'Livestock', countries: ['Botswana', 'Zimbabwe', 'South Africa', 'Kenya', 'Tanzania'], volume: 4780, sparkline: [] },
].map(c => ({ ...c, sparkline: generateSparkline(c.price, c.change24h) }));

/* ─── Ticker data (duplicated for seamless loop) ─── */
const TICKER_ITEMS = FALLBACK_COMMODITIES.slice(0, 12).map(c => ({
  symbol: c.symbol, name: c.name, price: c.price, change: c.change24h,
}));

/* ─── Sparkline SVG ─── */
function Sparkline({ data, positive, width = 80, height = 32 }: { data: number[]; positive: boolean; width?: number; height?: number }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="inline-block">
      <polyline
        points={points}
        fill="none"
        stroke={positive ? '#5DB347' : '#ef4444'}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ─── Main Page ─── */
export default function CommoditiesPage() {
  const [commodities, setCommodities] = useState<Commodity[]>(FALLBACK_COMMODITIES);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [country, setCountry] = useState('All');
  const [loading, setLoading] = useState(true);

  // Attempt to fetch from Supabase, fall back to static data
  useEffect(() => {
    let cancelled = false;
    async function fetchPrices() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('market_prices')
          .select('*')
          .order('date', { ascending: false })
          .limit(200);

        if (!cancelled && data && data.length > 0 && !error) {
          // Merge live prices into fallback structure
          const priceMap = new Map<string, number>();
          data.forEach((row: { commodity: string; price: number }) => {
            if (!priceMap.has(row.commodity)) {
              priceMap.set(row.commodity, row.price);
            }
          });

          setCommodities(prev => prev.map(c => {
            const livePrice = priceMap.get(c.name);
            if (livePrice) {
              const change = ((livePrice - c.price) / c.price) * 100;
              return {
                ...c,
                price: livePrice,
                change24h: parseFloat(change.toFixed(2)) || c.change24h,
                sparkline: generateSparkline(livePrice, change || c.change24h),
              };
            }
            return c;
          }));
        }
      } catch {
        // Fallback data already set
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchPrices();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    return commodities.filter(c => {
      if (category !== 'All' && c.category !== category) return false;
      if (country !== 'All' && !c.countries.includes(country)) return false;
      if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.symbol.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [commodities, category, country, search]);

  const marketStats = useMemo(() => {
    const gainers = commodities.filter(c => c.change24h > 0).length;
    const losers = commodities.filter(c => c.change24h < 0).length;
    const totalVolume = commodities.reduce((s, c) => s + c.volume, 0);
    const avgChange = commodities.reduce((s, c) => s + c.change24h, 0) / commodities.length;
    return { gainers, losers, totalVolume, avgChange };
  }, [commodities]);

  return (
    <>
      {/* ─── Animated Ticker Strip ─── */}
      <div className="bg-[#1B2A4A] border-b border-white/5 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap py-2.5">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} className="inline-flex items-center gap-2 mx-6 text-xs">
              <span className="font-mono font-bold text-white/60">{item.symbol}</span>
              <span className="text-white/40">{item.name}</span>
              <span className="text-white/80 font-semibold">${item.price.toLocaleString()}</span>
              <span className={`font-semibold ${item.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {item.change >= 0 ? '+' : ''}{item.change}%
              </span>
              <span className="text-white/10 ml-4">|</span>
            </span>
          ))}
        </div>
      </div>

      {/* ─── Market Overview Header ─── */}
      <section className="bg-gradient-to-br from-[#1B2A4A] via-[#223350] to-[#1B2A4A] text-white">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
              backgroundSize: '40px 40px',
            }} />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-3xl md:text-4xl font-bold mb-3">
                Commodity Markets
              </h1>
              <p className="text-gray-400 text-lg mb-6 max-w-2xl">
                Real-time pricing for 20+ African agricultural commodities across grains, oilseeds, cash crops, horticulture, livestock, and fibres.
              </p>
              <Link
                href="/commodities/signup"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-sm mb-8 transition-all hover:brightness-110 hover:-translate-y-0.5 shadow-lg shadow-[#5DB347]/20"
                style={{ background: 'linear-gradient(135deg, #5DB347, #449933)' }}
              >
                Sign Up to Trade
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

            {/* Market summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Commodities', value: commodities.length.toString(), sub: 'tracked' },
                { label: 'Gainers', value: marketStats.gainers.toString(), sub: 'today', color: 'text-emerald-400' },
                { label: 'Losers', value: marketStats.losers.toString(), sub: 'today', color: 'text-red-400' },
                { label: 'Avg. Change', value: `${marketStats.avgChange >= 0 ? '+' : ''}${marketStats.avgChange.toFixed(2)}%`, sub: '24h', color: marketStats.avgChange >= 0 ? 'text-emerald-400' : 'text-red-400' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 + i * 0.05 }}
                  className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10"
                >
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{stat.label}</p>
                  <p className={`text-2xl font-bold ${stat.color || 'text-white'}`}>{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.sub}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Filters & Search ─── */}
      <section className="bg-white border-b border-gray-200 sticky top-[49px] z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Search */}
            <div className="relative w-full lg:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search commodities..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] transition-all"
              />
            </div>

            {/* Category pills */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide w-full lg:w-auto">
              <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
              {CATEGORIES.map(cat => (
                <button
                  key={cat.key}
                  onClick={() => setCategory(cat.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    category === cat.key
                      ? 'bg-[#5DB347] text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <cat.icon className="w-3.5 h-3.5" />
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Country filter */}
            <select
              value={country}
              onChange={e => setCountry(e.target.value)}
              className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] transition-all"
            >
              {COUNTRIES.map(c => (
                <option key={c} value={c}>{c === 'All' ? 'All Countries' : c}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* ─── Commodity Cards Grid ─── */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Table header for desktop */}
          <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            <div className="col-span-3">Commodity</div>
            <div className="col-span-2 text-right">Price (USD)</div>
            <div className="col-span-1 text-right">24h %</div>
            <div className="col-span-2 text-center">Trend</div>
            <div className="col-span-1 text-right">52w High</div>
            <div className="col-span-1 text-right">52w Low</div>
            <div className="col-span-2 text-right">Volume</div>
          </div>

          <div className="space-y-2">
            {filtered.map((commodity, i) => (
              <motion.div
                key={commodity.slug}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.02 }}
              >
                <Link href={`/commodities/${commodity.slug}`}>
                  {/* Desktop row */}
                  <div className="hidden lg:grid grid-cols-12 gap-4 items-center px-6 py-4 bg-white rounded-xl border border-gray-100 hover:border-[#5DB347]/30 hover:shadow-md hover:shadow-[#5DB347]/5 transition-all cursor-pointer group">
                    <div className="col-span-3 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#1B2A4A]/5 flex items-center justify-center">
                        <span className="text-xs font-bold font-mono text-[#1B2A4A]">{commodity.symbol}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-[#1B2A4A] group-hover:text-[#5DB347] transition-colors">{commodity.name}</p>
                        <p className="text-xs text-gray-400">{commodity.category}</p>
                      </div>
                    </div>
                    <div className="col-span-2 text-right">
                      <p className="font-bold text-[#1B2A4A] text-lg font-mono">
                        ${commodity.price.toLocaleString(undefined, { minimumFractionDigits: commodity.price < 100 ? 2 : 0 })}
                      </p>
                      <p className="text-xs text-gray-400">per {commodity.unit}</p>
                    </div>
                    <div className="col-span-1 text-right">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-sm font-semibold ${
                        commodity.change24h >= 0
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-red-50 text-red-600'
                      }`}>
                        {commodity.change24h >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                        {commodity.change24h >= 0 ? '+' : ''}{commodity.change24h}%
                      </span>
                    </div>
                    <div className="col-span-2 flex justify-center">
                      <Sparkline data={commodity.sparkline} positive={commodity.change24h >= 0} />
                    </div>
                    <div className="col-span-1 text-right font-mono text-sm text-gray-600">
                      ${commodity.high52w.toLocaleString()}
                    </div>
                    <div className="col-span-1 text-right font-mono text-sm text-gray-600">
                      ${commodity.low52w.toLocaleString()}
                    </div>
                    <div className="col-span-2 text-right">
                      <p className="font-mono text-sm text-gray-600">{commodity.volume.toLocaleString()}</p>
                      <p className="text-xs text-gray-400">tonnes/day</p>
                    </div>
                  </div>

                  {/* Mobile card */}
                  <div className="lg:hidden bg-white rounded-xl border border-gray-100 p-4 hover:border-[#5DB347]/30 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#1B2A4A]/5 flex items-center justify-center">
                          <span className="text-xs font-bold font-mono text-[#1B2A4A]">{commodity.symbol}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-[#1B2A4A]">{commodity.name}</p>
                          <p className="text-xs text-gray-400">{commodity.category}</p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold ${
                        commodity.change24h >= 0
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-red-50 text-red-600'
                      }`}>
                        {commodity.change24h >= 0 ? '+' : ''}{commodity.change24h}%
                      </span>
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-2xl font-bold font-mono text-[#1B2A4A]">
                          ${commodity.price.toLocaleString(undefined, { minimumFractionDigits: commodity.price < 100 ? 2 : 0 })}
                        </p>
                        <p className="text-xs text-gray-400">per {commodity.unit}</p>
                      </div>
                      <Sparkline data={commodity.sparkline} positive={commodity.change24h >= 0} width={100} height={36} />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <Globe className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">No commodities found</p>
              <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-16 bg-gradient-to-r from-[#5DB347] to-[#449933]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Trade?
          </h2>
          <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of farmers, buyers, and traders on Africa&apos;s dedicated agricultural commodities platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 bg-white text-[#5DB347] hover:bg-gray-100 px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 shadow-lg"
            >
              Start Trading
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/commodities/trade"
              className="inline-flex items-center justify-center gap-2 border-2 border-white text-white hover:bg-white/10 px-8 py-4 rounded-xl font-semibold text-lg transition-all"
            >
              View Trading Desk
            </Link>
          </div>
        </div>
      </section>

      {/* Marquee animation */}
      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </>
  );
}
