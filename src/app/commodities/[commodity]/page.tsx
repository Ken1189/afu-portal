'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import {
  TrendingUp, TrendingDown, ArrowRight, ChevronRight,
  Clock, BarChart3, Globe, Activity, ArrowUpDown, Newspaper,
} from 'lucide-react';

/* ─── Types ─── */
interface CommodityDetail {
  name: string;
  slug: string;
  symbol: string;
  price: number;
  unit: string;
  change24h: number;
  changeAmount: number;
  open: number;
  high: number;
  low: number;
  high52w: number;
  low52w: number;
  volume: number;
  category: string;
  description: string;
  countries: { country: string; price: number; currency: string; market: string }[];
}

/* ─── Fallback commodities ─── */
const COMMODITY_DB: Record<string, CommodityDetail> = {
  'maize': { name: 'Maize', slug: 'maize', symbol: 'MZE', price: 248, unit: 'tonne', change24h: 2.4, changeAmount: 5.81, open: 242.19, high: 251.30, low: 240.10, high52w: 295, low52w: 198, volume: 12450, category: 'Grains', description: 'Maize (corn) is the most widely grown staple crop in sub-Saharan Africa, serving as both a food security crop and a major export commodity. It is a key feedstock for animal nutrition and industrial processing across the continent.', countries: [
    { country: 'Zimbabwe', price: 245, currency: 'USD', market: 'Harare GMB' },
    { country: 'Zambia', price: 252, currency: 'USD', market: 'Lusaka ZAMACE' },
    { country: 'Kenya', price: 261, currency: 'USD', market: 'Nairobi NCPB' },
    { country: 'Tanzania', price: 238, currency: 'USD', market: 'Dar es Salaam CPB' },
    { country: 'South Africa', price: 244, currency: 'USD', market: 'SAFEX Randfontein' },
  ]},
  'coffee-arabica': { name: 'Coffee Arabica', slug: 'coffee-arabica', symbol: 'COF', price: 4120, unit: 'tonne', change24h: -1.1, changeAmount: -45.76, open: 4165.76, high: 4180.00, low: 4095.50, high52w: 4580, low52w: 3450, volume: 8320, category: 'Cash Crops', description: 'Arabica coffee is the premium coffee variety grown across East Africa, renowned for its complex flavor profile. Ethiopia is considered the birthplace of coffee, while Kenya and Tanzania produce some of the world\'s most sought-after single-origin beans.', countries: [
    { country: 'Ethiopia', price: 4050, currency: 'USD', market: 'Addis Ababa ECX' },
    { country: 'Kenya', price: 4280, currency: 'USD', market: 'Nairobi Coffee Exchange' },
    { country: 'Tanzania', price: 4010, currency: 'USD', market: 'Moshi Auction' },
    { country: 'Uganda', price: 3890, currency: 'USD', market: 'Kampala UCDA' },
  ]},
  'soybean': { name: 'Soybean', slug: 'soybean', symbol: 'SOY', price: 615, unit: 'tonne', change24h: 3.7, changeAmount: 21.94, open: 593.06, high: 621.50, low: 590.80, high52w: 680, low52w: 510, volume: 9870, category: 'Oilseeds', description: 'Soybean is a critical oilseed crop in Africa, used for animal feed, vegetable oil production, and direct human consumption. Zambia, Zimbabwe, and South Africa lead production, with growing demand from the livestock and poultry sectors.', countries: [
    { country: 'Zambia', price: 620, currency: 'USD', market: 'Lusaka ZAMACE' },
    { country: 'Zimbabwe', price: 608, currency: 'USD', market: 'Harare GMB' },
    { country: 'South Africa', price: 625, currency: 'USD', market: 'SAFEX' },
    { country: 'Nigeria', price: 598, currency: 'USD', market: 'Lagos Commodity Exchange' },
  ]},
  'cocoa': { name: 'Cocoa', slug: 'cocoa', symbol: 'CCO', price: 3280, unit: 'tonne', change24h: 0.8, changeAmount: 26.05, open: 3253.95, high: 3310.00, low: 3245.20, high52w: 3650, low52w: 2890, volume: 7650, category: 'Cash Crops', description: 'West Africa produces over 70% of the world\'s cocoa. Ghana and Nigeria are among the top global producers, with cocoa serving as a major source of foreign exchange and rural livelihoods.', countries: [
    { country: 'Ghana', price: 3310, currency: 'USD', market: 'Accra COCOBOD' },
    { country: 'Nigeria', price: 3240, currency: 'USD', market: 'Lagos Exchange' },
    { country: 'Sierra Leone', price: 3180, currency: 'USD', market: 'Freetown Market' },
  ]},
  'cotton': { name: 'Cotton', slug: 'cotton', symbol: 'CTN', price: 1845, unit: 'tonne', change24h: -0.5, changeAmount: -9.27, open: 1854.27, high: 1862.00, low: 1838.50, high52w: 2100, low52w: 1620, volume: 5430, category: 'Fibres', description: 'Cotton is a major cash crop and fibre export for several African countries. Zimbabwe, Tanzania, and Mozambique are key producers, supplying both local textile industries and international markets.', countries: [
    { country: 'Zimbabwe', price: 1860, currency: 'USD', market: 'Harare Cotton Exchange' },
    { country: 'Tanzania', price: 1830, currency: 'USD', market: 'Dar es Salaam TCB' },
    { country: 'Mozambique', price: 1815, currency: 'USD', market: 'Maputo Exchange' },
    { country: 'Nigeria', price: 1850, currency: 'USD', market: 'Lagos Commodity Exchange' },
  ]},
  'cashew-nuts': { name: 'Cashew Nuts', slug: 'cashew-nuts', symbol: 'CSH', price: 1520, unit: 'tonne', change24h: 1.9, changeAmount: 28.41, open: 1491.59, high: 1535.00, low: 1485.20, high52w: 1780, low52w: 1290, volume: 4210, category: 'Horticulture', description: 'Cashew nuts are a high-value export crop grown extensively in coastal East and West Africa. Tanzania and Mozambique are leading producers, with growing processing capacity across the continent.', countries: [
    { country: 'Tanzania', price: 1540, currency: 'USD', market: 'Dar es Salaam CBT' },
    { country: 'Mozambique', price: 1510, currency: 'USD', market: 'Maputo Exchange' },
    { country: 'Nigeria', price: 1495, currency: 'USD', market: 'Lagos Exchange' },
    { country: 'Ghana', price: 1530, currency: 'USD', market: 'Accra Market' },
  ]},
  'tobacco': { name: 'Tobacco', slug: 'tobacco', symbol: 'TBC', price: 3650, unit: 'tonne', change24h: 0.3, changeAmount: 10.91, open: 3639.09, high: 3670.00, low: 3632.00, high52w: 4100, low52w: 3200, volume: 6890, category: 'Cash Crops', description: 'Tobacco remains one of the most valuable agricultural exports in Southern Africa, with Zimbabwe being the largest producer on the continent and one of the top exporters globally.', countries: [
    { country: 'Zimbabwe', price: 3680, currency: 'USD', market: 'Harare Tobacco Floors' },
    { country: 'Zambia', price: 3610, currency: 'USD', market: 'Lusaka TAZ' },
    { country: 'Tanzania', price: 3590, currency: 'USD', market: 'Morogoro Auction' },
    { country: 'Mozambique', price: 3570, currency: 'USD', market: 'Maputo Exchange' },
  ]},
  'tea': { name: 'Tea', slug: 'tea', symbol: 'TEA', price: 2890, unit: 'tonne', change24h: -0.7, changeAmount: -20.37, open: 2910.37, high: 2920.50, low: 2878.00, high52w: 3200, low52w: 2450, volume: 5670, category: 'Cash Crops', description: 'Kenya is the world\'s largest exporter of black tea, with Tanzania, Uganda, and Ethiopia also significant producers. African tea is prized for its strong, brisk character.', countries: [
    { country: 'Kenya', price: 2950, currency: 'USD', market: 'Mombasa Tea Auction' },
    { country: 'Tanzania', price: 2840, currency: 'USD', market: 'Dar es Salaam TBT' },
    { country: 'Uganda', price: 2810, currency: 'USD', market: 'Kampala UCDA' },
    { country: 'Ethiopia', price: 2780, currency: 'USD', market: 'Addis Ababa ECX' },
  ]},
  'macadamia': { name: 'Macadamia', slug: 'macadamia', symbol: 'MAC', price: 7200, unit: 'tonne', change24h: 4.2, changeAmount: 290.23, open: 6909.77, high: 7250.00, low: 6880.50, high52w: 7800, low52w: 5900, volume: 2340, category: 'Horticulture', description: 'Macadamia nuts are among the highest-value tree crops in Africa. South Africa is the world\'s largest producer, with Kenya and Zimbabwe also contributing significantly to global supply.', countries: [
    { country: 'Kenya', price: 7350, currency: 'USD', market: 'Nairobi Exchange' },
    { country: 'South Africa', price: 7180, currency: 'USD', market: 'SAMAC' },
    { country: 'Zimbabwe', price: 7050, currency: 'USD', market: 'Harare Market' },
  ]},
  'blueberries': { name: 'Blueberries', slug: 'blueberries', symbol: 'BLU', price: 5100, unit: 'tonne', change24h: 1.5, changeAmount: 75.37, open: 5024.63, high: 5150.00, low: 5010.20, high52w: 5800, low52w: 4200, volume: 1890, category: 'Horticulture', description: 'Blueberry production in Africa has surged, with South Africa, Zimbabwe, and Kenya emerging as counter-seasonal suppliers to European and Asian markets.', countries: [
    { country: 'South Africa', price: 5150, currency: 'USD', market: 'Cape Town Fresh Produce' },
    { country: 'Zimbabwe', price: 5050, currency: 'USD', market: 'Harare Horticultural' },
    { country: 'Kenya', price: 5080, currency: 'USD', market: 'Nairobi Market' },
  ]},
  'wheat': { name: 'Wheat', slug: 'wheat', symbol: 'WHT', price: 320, unit: 'tonne', change24h: -0.3, changeAmount: -0.96, open: 320.96, high: 324.50, low: 317.80, high52w: 375, low52w: 268, volume: 10230, category: 'Grains', description: 'Wheat is a critical food security crop across Africa, with South Africa, Kenya, and Ethiopia among the continent\'s largest producers. Demand continues to outpace domestic production in most African countries.', countries: [
    { country: 'South Africa', price: 318, currency: 'USD', market: 'SAFEX' },
    { country: 'Kenya', price: 328, currency: 'USD', market: 'Nairobi NCPB' },
    { country: 'Ethiopia', price: 315, currency: 'USD', market: 'Addis Ababa ECX' },
    { country: 'Tanzania', price: 322, currency: 'USD', market: 'Dar es Salaam Market' },
  ]},
  'sorghum': { name: 'Sorghum', slug: 'sorghum', symbol: 'SRG', price: 210, unit: 'tonne', change24h: 1.2, changeAmount: 2.49, open: 207.51, high: 213.50, low: 206.80, high52w: 248, low52w: 175, volume: 7540, category: 'Grains', description: 'Sorghum is a drought-resistant cereal vital to food security in semi-arid regions of Africa. Nigeria and Ethiopia are the continent\'s largest producers.', countries: [
    { country: 'Nigeria', price: 215, currency: 'USD', market: 'Lagos Exchange' },
    { country: 'Ethiopia', price: 205, currency: 'USD', market: 'Addis Ababa ECX' },
    { country: 'Tanzania', price: 208, currency: 'USD', market: 'Dodoma Market' },
    { country: 'Zimbabwe', price: 212, currency: 'USD', market: 'Harare GMB' },
  ]},
  'rice': { name: 'Rice', slug: 'rice', symbol: 'RCE', price: 480, unit: 'tonne', change24h: 0.6, changeAmount: 2.86, open: 477.14, high: 485.20, low: 475.00, high52w: 540, low52w: 410, volume: 8910, category: 'Grains', description: 'Rice consumption in Africa is growing rapidly, driven by urbanization and changing dietary preferences. Tanzania, Nigeria, and Ghana are among the continent\'s largest producers.', countries: [
    { country: 'Tanzania', price: 475, currency: 'USD', market: 'Mbeya Market' },
    { country: 'Nigeria', price: 490, currency: 'USD', market: 'Lagos Exchange' },
    { country: 'Ghana', price: 482, currency: 'USD', market: 'Accra Market' },
    { country: 'Sierra Leone', price: 468, currency: 'USD', market: 'Freetown Market' },
  ]},
  'groundnuts': { name: 'Groundnuts', slug: 'groundnuts', symbol: 'GNT', price: 890, unit: 'tonne', change24h: 2.1, changeAmount: 18.32, open: 871.68, high: 898.50, low: 868.20, high52w: 980, low52w: 750, volume: 4560, category: 'Oilseeds', description: 'Groundnuts (peanuts) are a major oilseed and food crop across Africa, used for oil extraction, confectionery, and direct consumption. Nigeria is the continent\'s largest producer.', countries: [
    { country: 'Nigeria', price: 895, currency: 'USD', market: 'Kano Market' },
    { country: 'Zimbabwe', price: 880, currency: 'USD', market: 'Harare GMB' },
    { country: 'Zambia', price: 885, currency: 'USD', market: 'Lusaka ZAMACE' },
    { country: 'Tanzania', price: 870, currency: 'USD', market: 'Dodoma Market' },
  ]},
  'sunflower': { name: 'Sunflower', slug: 'sunflower', symbol: 'SNF', price: 720, unit: 'tonne', change24h: -1.3, changeAmount: -9.47, open: 729.47, high: 732.50, low: 715.00, high52w: 820, low52w: 610, volume: 3890, category: 'Oilseeds', description: 'Sunflower is a key oilseed crop in East and Southern Africa, primarily grown for cooking oil production. Tanzania is the continent\'s largest producer.', countries: [
    { country: 'Tanzania', price: 715, currency: 'USD', market: 'Dodoma Market' },
    { country: 'Zimbabwe', price: 725, currency: 'USD', market: 'Harare GMB' },
    { country: 'Zambia', price: 718, currency: 'USD', market: 'Lusaka ZAMACE' },
    { country: 'South Africa', price: 730, currency: 'USD', market: 'SAFEX' },
  ]},
  'sugarcane': { name: 'Sugarcane', slug: 'sugarcane', symbol: 'SGC', price: 45, unit: 'tonne', change24h: 0.2, changeAmount: 0.09, open: 44.91, high: 45.50, low: 44.60, high52w: 52, low52w: 38, volume: 15600, category: 'Fibres', description: 'Sugarcane is grown extensively across tropical Africa for sugar production, ethanol, and molasses. South Africa, Zimbabwe, and Mozambique are the leading producers on the continent.', countries: [
    { country: 'South Africa', price: 46, currency: 'USD', market: 'SASA' },
    { country: 'Zimbabwe', price: 44, currency: 'USD', market: 'Triangle/Hippo Valley' },
    { country: 'Mozambique', price: 43, currency: 'USD', market: 'Maputo Exchange' },
    { country: 'Kenya', price: 47, currency: 'USD', market: 'Mumias Market' },
  ]},
  'avocado': { name: 'Avocado', slug: 'avocado', symbol: 'AVO', price: 2400, unit: 'tonne', change24h: 3.1, changeAmount: 72.19, open: 2327.81, high: 2435.00, low: 2318.50, high52w: 2750, low52w: 1980, volume: 3120, category: 'Horticulture', description: 'Avocado exports from Africa have grown exponentially, with Kenya emerging as a major global supplier. South Africa, Tanzania, and Ethiopia also contribute significantly to growing international demand.', countries: [
    { country: 'Kenya', price: 2450, currency: 'USD', market: 'Nairobi Horticultural' },
    { country: 'South Africa', price: 2380, currency: 'USD', market: 'Johannesburg Market' },
    { country: 'Tanzania', price: 2350, currency: 'USD', market: 'Arusha Market' },
    { country: 'Ethiopia', price: 2320, currency: 'USD', market: 'Addis Ababa ECX' },
  ]},
  'sesame': { name: 'Sesame', slug: 'sesame', symbol: 'SES', price: 1680, unit: 'tonne', change24h: 0.9, changeAmount: 15.02, open: 1664.98, high: 1695.00, low: 1658.50, high52w: 1890, low52w: 1420, volume: 2780, category: 'Oilseeds', description: 'Sesame is a high-value oilseed crop with strong export demand from Asia and the Middle East. Ethiopia is Africa\'s largest producer and one of the top global exporters.', countries: [
    { country: 'Ethiopia', price: 1700, currency: 'USD', market: 'Addis Ababa ECX' },
    { country: 'Tanzania', price: 1660, currency: 'USD', market: 'Dar es Salaam Market' },
    { country: 'Nigeria', price: 1650, currency: 'USD', market: 'Lagos Exchange' },
    { country: 'Uganda', price: 1640, currency: 'USD', market: 'Kampala Market' },
  ]},
  'millet': { name: 'Millet', slug: 'millet', symbol: 'MLT', price: 195, unit: 'tonne', change24h: -0.8, changeAmount: -1.57, open: 196.57, high: 198.50, low: 193.20, high52w: 230, low52w: 165, volume: 6340, category: 'Grains', description: 'Millet is a hardy, drought-resistant cereal that is vital to food security in arid and semi-arid regions of Africa. Nigeria, Uganda, and Ethiopia are major producers.', countries: [
    { country: 'Nigeria', price: 198, currency: 'USD', market: 'Kano Market' },
    { country: 'Uganda', price: 192, currency: 'USD', market: 'Kampala Market' },
    { country: 'Ethiopia', price: 190, currency: 'USD', market: 'Addis Ababa ECX' },
    { country: 'Tanzania', price: 194, currency: 'USD', market: 'Dodoma Market' },
  ]},
  'beef-cattle': { name: 'Beef Cattle', slug: 'beef-cattle', symbol: 'BCT', price: 3200, unit: 'kg', change24h: 0.4, changeAmount: 12.75, open: 3187.25, high: 3220.00, low: 3180.50, high52w: 3600, low52w: 2800, volume: 4780, category: 'Livestock', description: 'Beef cattle represent one of Africa\'s most valuable livestock commodities. Botswana is renowned for its premium grass-fed beef, while Zimbabwe, South Africa, Kenya, and Tanzania all maintain significant cattle populations.', countries: [
    { country: 'Botswana', price: 3350, currency: 'USD', market: 'BMC Lobatse' },
    { country: 'Zimbabwe', price: 3180, currency: 'USD', market: 'CSC Bulawayo' },
    { country: 'South Africa', price: 3250, currency: 'USD', market: 'SAFEX Livestock' },
    { country: 'Kenya', price: 3100, currency: 'USD', market: 'Nairobi KMC' },
    { country: 'Tanzania', price: 3050, currency: 'USD', market: 'Dar es Salaam Market' },
  ]},
};

/* ─── Generate price chart data ─── */
function generateChartData(base: number, period: string): { points: number[]; labels: string[] } {
  const counts: Record<string, number> = { '1D': 24, '1W': 7, '1M': 30, '3M': 90, '1Y': 52 };
  const n = counts[period] || 30;
  const volatility = period === '1D' ? 0.003 : period === '1W' ? 0.008 : period === '1M' ? 0.015 : period === '3M' ? 0.025 : 0.04;

  const points: number[] = [];
  let val = base * (1 - volatility * 5);
  for (let i = 0; i < n; i++) {
    val += (Math.random() - 0.47) * (base * volatility);
    val = Math.max(val, base * 0.7);
    points.push(parseFloat(val.toFixed(2)));
  }
  points.push(base);

  const labels: string[] = [];
  const now = new Date();
  for (let i = 0; i <= n; i++) {
    if (period === '1D') {
      labels.push(`${String(i).padStart(2, '0')}:00`);
    } else if (period === '1W') {
      const d = new Date(now);
      d.setDate(d.getDate() - (n - i));
      labels.push(d.toLocaleDateString('en', { weekday: 'short' }));
    } else {
      const d = new Date(now);
      d.setDate(d.getDate() - (n - i));
      labels.push(d.toLocaleDateString('en', { month: 'short', day: 'numeric' }));
    }
  }

  return { points, labels };
}

/* ─── SVG Chart ─── */
function PriceChart({ data, positive }: { data: number[]; positive: boolean }) {
  const width = 800;
  const height = 300;
  const padding = { top: 20, right: 20, bottom: 30, left: 60 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const min = Math.min(...data) * 0.998;
  const max = Math.max(...data) * 1.002;
  const range = max - min || 1;

  const points = data.map((v, i) => {
    const x = padding.left + (i / (data.length - 1)) * chartW;
    const y = padding.top + chartH - ((v - min) / range) * chartH;
    return { x, y };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const areaPath = `${linePath} L${points[points.length - 1].x},${padding.top + chartH} L${points[0].x},${padding.top + chartH} Z`;
  const color = positive ? '#5DB347' : '#ef4444';
  const colorLight = positive ? '#5DB34715' : '#ef444415';

  // Y-axis labels
  const yLabels = Array.from({ length: 5 }, (_, i) => {
    const val = min + (range * i) / 4;
    const y = padding.top + chartH - (i / 4) * chartH;
    return { val, y };
  });

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
      {/* Grid lines */}
      {yLabels.map((l, i) => (
        <g key={i}>
          <line x1={padding.left} y1={l.y} x2={width - padding.right} y2={l.y} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4,4" />
          <text x={padding.left - 8} y={l.y + 4} textAnchor="end" className="text-[11px] fill-gray-400 font-mono">
            ${l.val.toLocaleString(undefined, { maximumFractionDigits: l.val < 100 ? 2 : 0 })}
          </text>
        </g>
      ))}
      {/* Area fill */}
      <path d={areaPath} fill={colorLight} />
      {/* Line */}
      <path d={linePath} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Current price dot */}
      <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="5" fill={color} stroke="white" strokeWidth="2" />
    </svg>
  );
}

/* ─── News placeholder ─── */
const NEWS_ITEMS = [
  { title: 'African commodity markets show resilience amid global volatility', source: 'AFU Market Intelligence', time: '2 hours ago', category: 'Market Update' },
  { title: 'East African grain harvest expected to exceed 2025 levels', source: 'Reuters Africa', time: '5 hours ago', category: 'Supply' },
  { title: 'New trade corridor reduces logistics costs by 15% for Southern African exports', source: 'AFU Research', time: '1 day ago', category: 'Logistics' },
  { title: 'Sustainable farming practices driving premium pricing in key markets', source: 'Bloomberg Africa', time: '2 days ago', category: 'Sustainability' },
];

/* ─── Page ─── */
export default function CommodityDetailPage() {
  const params = useParams();
  const slug = typeof params.commodity === 'string' ? params.commodity : '';
  const [period, setPeriod] = useState('1M');
  const [commodity, setCommodity] = useState<CommodityDetail | null>(null);

  useEffect(() => {
    const data = COMMODITY_DB[slug];
    if (data) {
      setCommodity(data);
    }
  }, [slug]);

  // Try loading live price from Supabase
  useEffect(() => {
    if (!commodity) return;
    let cancelled = false;
    async function fetchLive() {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from('market_prices')
          .select('*')
          .eq('commodity', commodity!.name)
          .order('date', { ascending: false })
          .limit(1);
        if (!cancelled && data && data.length > 0) {
          const livePrice = data[0].price;
          if (livePrice && livePrice !== commodity!.price) {
            setCommodity(prev => prev ? {
              ...prev,
              price: livePrice,
              change24h: parseFloat((((livePrice - prev.open) / prev.open) * 100).toFixed(2)),
              changeAmount: parseFloat((livePrice - prev.open).toFixed(2)),
            } : prev);
          }
        }
      } catch {
        // Keep fallback data
      }
    }
    fetchLive();
    return () => { cancelled = true; };
  }, [commodity?.name]);

  const chartData = useMemo(() => {
    if (!commodity) return { points: [], labels: [] };
    return generateChartData(commodity.price, period);
  }, [commodity, period]);

  if (!commodity) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[#1B2A4A] mb-2">Commodity Not Found</h2>
          <p className="text-gray-500 mb-6">The commodity you are looking for does not exist.</p>
          <Link href="/commodities" className="text-[#5DB347] font-semibold hover:underline">
            Back to Markets
          </Link>
        </div>
      </div>
    );
  }

  const positive = commodity.change24h >= 0;

  return (
    <div className="pb-16">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/commodities" className="hover:text-[#5DB347] transition-colors">Commodities</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-[#1B2A4A] font-medium">{commodity.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-[#1B2A4A] flex items-center justify-center">
                  <span className="text-sm font-bold font-mono text-white">{commodity.symbol}</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-[#1B2A4A]">{commodity.name}</h1>
                  <p className="text-sm text-gray-400">{commodity.category} -- per {commodity.unit}</p>
                </div>
              </div>
            </div>

            <Link
              href="/commodities/trade"
              className="inline-flex items-center gap-2 bg-[#5DB347] hover:bg-[#449933] text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-md shadow-[#5DB347]/20 hover:shadow-lg"
            >
              <ArrowUpDown className="w-4 h-4" />
              Trade {commodity.name}
            </Link>
          </div>

          {/* Price display */}
          <div className="flex items-end gap-4 flex-wrap">
            <span className="text-5xl md:text-6xl font-bold font-mono text-[#1B2A4A]">
              ${commodity.price.toLocaleString(undefined, { minimumFractionDigits: commodity.price < 100 ? 2 : 0 })}
            </span>
            <div className="mb-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-lg font-semibold ${
                positive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
              }`}>
                {positive ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                {positive ? '+' : ''}{commodity.changeAmount.toFixed(2)} ({positive ? '+' : ''}{commodity.change24h}%)
              </span>
              <span className="text-sm text-gray-400 ml-3">24h change</span>
            </div>
          </div>
        </motion.div>

        {/* Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white rounded-2xl border border-gray-200 p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-[#1B2A4A]">Price Chart</h2>
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              {['1D', '1W', '1M', '3M', '1Y'].map(p => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    period === p
                      ? 'bg-[#1B2A4A] text-white shadow-sm'
                      : 'text-gray-500 hover:text-[#1B2A4A]'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <PriceChart data={chartData.points} positive={positive} />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Key Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-[#1B2A4A] mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#5DB347]" />
                Key Statistics
              </h3>
              <div className="space-y-4">
                {[
                  { label: 'Open', value: `$${commodity.open.toLocaleString(undefined, { minimumFractionDigits: 2 })}` },
                  { label: 'Day High', value: `$${commodity.high.toLocaleString(undefined, { minimumFractionDigits: 2 })}` },
                  { label: 'Day Low', value: `$${commodity.low.toLocaleString(undefined, { minimumFractionDigits: 2 })}` },
                  { label: '52-Week High', value: `$${commodity.high52w.toLocaleString()}` },
                  { label: '52-Week Low', value: `$${commodity.low52w.toLocaleString()}` },
                  { label: 'Volume', value: `${commodity.volume.toLocaleString()} tonnes` },
                ].map(stat => (
                  <div key={stat.label} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <span className="text-sm text-gray-500">{stat.label}</span>
                    <span className="text-sm font-semibold font-mono text-[#1B2A4A]">{stat.value}</span>
                  </div>
                ))}
              </div>

              {/* 52-week range bar */}
              <div className="mt-6">
                <p className="text-xs text-gray-400 mb-2">52-Week Range</p>
                <div className="relative h-2 bg-gray-200 rounded-full">
                  <div
                    className="absolute h-2 bg-gradient-to-r from-red-400 via-yellow-400 to-emerald-400 rounded-full"
                    style={{ width: '100%' }}
                  />
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-[#1B2A4A] border-2 border-white rounded-full shadow-md"
                    style={{
                      left: `${((commodity.price - commodity.low52w) / (commodity.high52w - commodity.low52w)) * 100}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-400 font-mono">${commodity.low52w}</span>
                  <span className="text-xs text-gray-400 font-mono">${commodity.high52w}</span>
                </div>
              </div>
            </div>

            {/* About section */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 mt-6">
              <h3 className="text-lg font-bold text-[#1B2A4A] mb-3">About {commodity.name}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{commodity.description}</p>
            </div>
          </motion.div>

          {/* Price by Country + News */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="lg:col-span-2 space-y-8"
          >
            {/* Price by Country */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-[#1B2A4A] mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-[#5DB347]" />
                Price by Market
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs text-gray-400 uppercase tracking-wider border-b border-gray-100">
                      <th className="pb-3 pr-4">Country</th>
                      <th className="pb-3 pr-4">Market</th>
                      <th className="pb-3 text-right">Price (USD)</th>
                      <th className="pb-3 text-right">vs. Avg</th>
                    </tr>
                  </thead>
                  <tbody>
                    {commodity.countries.map((c, i) => {
                      const diff = ((c.price - commodity.price) / commodity.price) * 100;
                      return (
                        <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                          <td className="py-3 pr-4">
                            <span className="font-medium text-[#1B2A4A] text-sm">{c.country}</span>
                          </td>
                          <td className="py-3 pr-4 text-sm text-gray-500">{c.market}</td>
                          <td className="py-3 text-right font-mono font-semibold text-sm text-[#1B2A4A]">
                            ${c.price.toLocaleString(undefined, { minimumFractionDigits: c.price < 100 ? 2 : 0 })}
                          </td>
                          <td className="py-3 text-right">
                            <span className={`text-xs font-semibold ${diff >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                              {diff >= 0 ? '+' : ''}{diff.toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Related News */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-[#1B2A4A] mb-4 flex items-center gap-2">
                <Newspaper className="w-5 h-5 text-[#5DB347]" />
                Related Insights
              </h3>
              <div className="space-y-4">
                {NEWS_ITEMS.map((news, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#1B2A4A]/5 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Newspaper className="w-5 h-5 text-[#1B2A4A]/40" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[#1B2A4A] text-sm group-hover:text-[#5DB347] transition-colors leading-snug mb-1">
                        {news.title}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span>{news.source}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {news.time}
                        </span>
                        <span className="px-2 py-0.5 bg-[#5DB347]/10 text-[#5DB347] rounded-full font-medium">{news.category}</span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#5DB347] transition-colors flex-shrink-0 mt-1" />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
