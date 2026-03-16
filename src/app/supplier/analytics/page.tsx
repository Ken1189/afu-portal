'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  BarChart3,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Globe,
  Users,
  Package,
  ChevronDown,
} from 'lucide-react';

// -- Animation variants -------------------------------------------------------

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
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
      stiffness: 260,
      damping: 24,
    },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
};

// -- Helpers ------------------------------------------------------------------

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toLocaleString()}`;
}

function formatCurrencyFull(value: number): string {
  return `$${value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

// -- Revenue trend data (12 months) -------------------------------------------

const revenueTrendData = [
  { month: 'Apr 25', revenue: 98400, orders: 312 },
  { month: 'May 25', revenue: 112800, orders: 345 },
  { month: 'Jun 25', revenue: 134200, orders: 378 },
  { month: 'Jul 25', revenue: 128600, orders: 356 },
  { month: 'Aug 25', revenue: 156300, orders: 401 },
  { month: 'Sep 25', revenue: 178900, orders: 428 },
  { month: 'Oct 25', revenue: 165400, orders: 412 },
  { month: 'Nov 25', revenue: 192600, orders: 445 },
  { month: 'Dec 25', revenue: 148200, orders: 367 },
  { month: 'Jan 26', revenue: 174800, orders: 423 },
  { month: 'Feb 26', revenue: 188500, orders: 441 },
  { month: 'Mar 26', revenue: 210400, orders: 478 },
];

// -- Top products data --------------------------------------------------------

const topProductsData = [
  { name: 'Groundnut Seed (Nyanda)', revenue: 115000 },
  { name: 'Knapsack Sprayer (16L)', revenue: 106680 },
  { name: 'Metalaxyl + Mancozeb', revenue: 47075 },
  { name: 'Soil pH Test Kit (50)', revenue: 22092 },
  { name: 'Pruning Shears (Pro)', revenue: 14808 },
];

// -- Customer demographics ----------------------------------------------------

const demographicsData = [
  { name: 'Smallholder', value: 45, color: '#2AA198' },
  { name: 'Commercial', value: 30, color: '#1B2A4A' },
  { name: 'Enterprise', value: 15, color: '#D4A843' },
  { name: 'Cooperative', value: 10, color: '#1A7A72' },
];

// -- Revenue by country -------------------------------------------------------

const countryRevenueData = [
  { country: 'Botswana', revenue: 78400, orders: 186 },
  { country: 'Zimbabwe', revenue: 98200, orders: 224 },
  { country: 'Tanzania', revenue: 33800, orders: 68 },
];

// -- Monthly comparison (6 months) --------------------------------------------

const monthlyComparison = [
  { month: 'Oct 2025', revenue: 165400, orders: 412, avgOrder: 401.46, prevChange: 7.8 },
  { month: 'Nov 2025', revenue: 192600, orders: 445, avgOrder: 432.81, prevChange: 16.4 },
  { month: 'Dec 2025', revenue: 148200, orders: 367, avgOrder: 403.81, prevChange: -23.1 },
  { month: 'Jan 2026', revenue: 174800, orders: 423, avgOrder: 413.24, prevChange: 17.9 },
  { month: 'Feb 2026', revenue: 188500, orders: 441, avgOrder: 427.44, prevChange: 7.8 },
  { month: 'Mar 2026', revenue: 210400, orders: 478, avgOrder: 440.17, prevChange: 11.6 },
];

// -- Date ranges --------------------------------------------------------------

const dateRanges = ['This Month', 'Quarter', 'Year', 'All Time'] as const;
type DateRange = (typeof dateRanges)[number];

// -- Stat card data -----------------------------------------------------------

const statCards = [
  {
    label: 'Total Revenue',
    value: '$1.89M',
    change: '+22.4%',
    changeType: 'up' as const,
    icon: <DollarSign className="w-5 h-5" />,
    color: 'text-[#2AA198]',
    bgColor: 'bg-[#2AA198]/10',
    subtext: 'vs. previous period',
  },
  {
    label: 'Total Orders',
    value: '4,786',
    change: '+18.2%',
    changeType: 'up' as const,
    icon: <ShoppingCart className="w-5 h-5" />,
    color: 'text-[#1B2A4A]',
    bgColor: 'bg-blue-50',
    subtext: 'vs. previous period',
  },
  {
    label: 'Avg. Order Value',
    value: '$394.80',
    change: '+3.5%',
    changeType: 'up' as const,
    icon: <TrendingUp className="w-5 h-5" />,
    color: 'text-[#D4A843]',
    bgColor: 'bg-amber-50',
    subtext: 'vs. previous period',
  },
];

// -- Chart trend toggle -------------------------------------------------------

type ChartView = 'Revenue' | 'Orders' | 'Both';
const chartViews: ChartView[] = ['Revenue', 'Orders', 'Both'];

// -- Custom tooltip -----------------------------------------------------------

interface TooltipPayloadEntry {
  name: string;
  value: number;
  color: string;
  dataKey: string;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
}) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-100 px-3 py-2 text-xs">
      <p className="font-semibold text-[#1B2A4A] mb-1">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-gray-600">{entry.name}:</span>
          <span className="font-medium text-[#1B2A4A]">
            {entry.dataKey === 'orders'
              ? entry.value.toLocaleString()
              : formatCurrency(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

function BarTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
}) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-100 px-3 py-2 text-xs">
      <p className="font-semibold text-[#1B2A4A] mb-1">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-gray-600">{entry.name}:</span>
          <span className="font-medium text-[#1B2A4A]">{formatCurrencyFull(entry.value)}</span>
        </div>
      ))}
    </div>
  );
}

function CountryTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
}) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-100 px-3 py-2 text-xs">
      <p className="font-semibold text-[#1B2A4A] mb-1">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-gray-600">{entry.name}:</span>
          <span className="font-medium text-[#1B2A4A]">
            {entry.dataKey === 'orders'
              ? entry.value.toLocaleString()
              : formatCurrencyFull(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

// =============================================================================
//  MAIN COMPONENT
// =============================================================================

export default function SupplierAnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange>('All Time');
  const [chartView, setChartView] = useState<ChartView>('Revenue');
  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* =====================================================================
          1. PAGE HEADER
      ====================================================================== */}
      <motion.div
        variants={fadeUp}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#2AA198]/10 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-[#2AA198]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1B2A4A]">Analytics</h1>
            <p className="text-sm text-gray-500 mt-0.5">Track your sales performance and trends</p>
          </div>
        </div>

        {/* Date range selector */}
        <div className="relative">
          <button
            onClick={() => setDateDropdownOpen(!dateDropdownOpen)}
            className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-[#1B2A4A] border border-gray-200 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm"
          >
            <Calendar className="w-4 h-4 text-[#2AA198]" />
            {dateRange}
            <ChevronDown
              className={`w-4 h-4 transition-transform ${dateDropdownOpen ? 'rotate-180' : ''}`}
            />
          </button>
          {dateDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -5, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="absolute right-0 top-full mt-1 z-20 bg-white rounded-lg shadow-lg border border-gray-100 py-1 min-w-[160px]"
            >
              {dateRanges.map((range) => (
                <button
                  key={range}
                  onClick={() => {
                    setDateRange(range);
                    setDateDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                    dateRange === range
                      ? 'bg-[#2AA198]/10 text-[#2AA198] font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {range}
                </button>
              ))}
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* =====================================================================
          2. KPI STATS ROW (3 cards)
      ====================================================================== */}
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {statCards.map((stat, i) => (
          <motion.div
            key={i}
            variants={cardVariants}
            whileHover={{ y: -2, boxShadow: '0 8px 25px rgba(27,42,74,0.08)' }}
            className="bg-white rounded-xl p-5 border border-gray-100 cursor-default"
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center ${stat.color}`}
              >
                {stat.icon}
              </div>
              <span
                className={`text-xs font-medium px-2 py-1 rounded-full flex items-center gap-0.5 ${
                  stat.changeType === 'up'
                    ? 'bg-green-50 text-green-600'
                    : 'bg-red-50 text-red-600'
                }`}
              >
                {stat.changeType === 'up' ? (
                  <ArrowUpRight className="w-3 h-3" />
                ) : (
                  <ArrowDownRight className="w-3 h-3" />
                )}
                {stat.change}
              </span>
            </div>
            <p className="text-3xl font-bold text-[#1B2A4A] tabular-nums">{stat.value}</p>
            <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
            <p className="text-[10px] text-gray-300 mt-0.5">{stat.subtext}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* =====================================================================
          3. REVENUE TREND AREA CHART
      ====================================================================== */}
      <motion.div
        variants={cardVariants}
        className="bg-white rounded-xl border border-gray-100 p-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
          <h3 className="font-semibold text-[#1B2A4A] text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#2AA198]" />
            Revenue Trend (12 Months)
          </h3>
          <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1">
            {chartViews.map((view) => (
              <button
                key={view}
                onClick={() => setChartView(view)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  chartView === view
                    ? 'bg-[#2AA198] text-white shadow-sm'
                    : 'text-gray-500 hover:text-[#1B2A4A]'
                }`}
              >
                {view}
              </button>
            ))}
          </div>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueTrendData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2AA198" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2AA198" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D4A843" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#D4A843" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: '#9CA3AF' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                yAxisId="revenue"
                tick={{ fontSize: 11, fill: '#9CA3AF' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => formatCurrency(v)}
                hide={chartView === 'Orders'}
              />
              {(chartView === 'Orders' || chartView === 'Both') && (
                <YAxis
                  yAxisId="orders"
                  orientation="right"
                  tick={{ fontSize: 11, fill: '#9CA3AF' }}
                  axisLine={false}
                  tickLine={false}
                />
              )}
              <Tooltip content={<CustomTooltip />} />
              {chartView === 'Both' && (
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: '11px' }}
                  formatter={(value: string) => (
                    <span className="text-gray-600">{value}</span>
                  )}
                />
              )}
              {(chartView === 'Revenue' || chartView === 'Both') && (
                <Area
                  yAxisId="revenue"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#2AA198"
                  strokeWidth={2.5}
                  fill="url(#revenueGradient)"
                  name="Revenue"
                  dot={{ fill: '#2AA198', r: 3, strokeWidth: 0 }}
                  activeDot={{ fill: '#2AA198', r: 5, strokeWidth: 2, stroke: '#fff' }}
                />
              )}
              {(chartView === 'Orders' || chartView === 'Both') && (
                <Area
                  yAxisId={chartView === 'Orders' ? 'revenue' : 'orders'}
                  type="monotone"
                  dataKey="orders"
                  stroke="#D4A843"
                  strokeWidth={2.5}
                  fill="url(#ordersGradient)"
                  name="Orders"
                  dot={{ fill: '#D4A843', r: 3, strokeWidth: 0 }}
                  activeDot={{ fill: '#D4A843', r: 5, strokeWidth: 2, stroke: '#fff' }}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* =====================================================================
          4. TOP PRODUCTS (BarChart) + DEMOGRAPHICS (Donut)
      ====================================================================== */}
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* -- Top Products Bar Chart ---------------------------------------- */}
        <motion.div
          variants={cardVariants}
          className="bg-white rounded-xl border border-gray-100 p-5"
        >
          <h3 className="font-semibold text-[#1B2A4A] text-sm flex items-center gap-2 mb-4">
            <Package className="w-4 h-4 text-[#2AA198]" />
            Top Products by Revenue
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topProductsData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: '#9CA3AF' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => formatCurrency(v)}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={140}
                  tick={{ fontSize: 11, fill: '#6B7280' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<BarTooltip />} />
                <Bar
                  dataKey="revenue"
                  name="Revenue"
                  fill="#2AA198"
                  radius={[0, 6, 6, 0]}
                  barSize={28}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* -- Customer Demographics Donut ----------------------------------- */}
        <motion.div
          variants={cardVariants}
          className="bg-white rounded-xl border border-gray-100 p-5"
        >
          <h3 className="font-semibold text-[#1B2A4A] text-sm flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-[#2AA198]" />
            Customer Demographics
          </h3>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="h-56 w-56 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={demographicsData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey="name"
                    stroke="none"
                  >
                    {demographicsData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => `${value}%`}
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid #f0f0f0',
                      fontSize: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-3 w-full">
              {demographicsData.map((item) => (
                <div key={item.name}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm text-gray-700 font-medium">{item.name}</span>
                    </div>
                    <span className="text-sm font-bold text-[#1B2A4A] tabular-nums">
                      {item.value}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.value}%` }}
                      transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
                      className="h-2 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* =====================================================================
          5. REVENUE BY COUNTRY + MONTHLY COMPARISON TABLE
      ====================================================================== */}
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* -- Revenue by Country Bar Chart ---------------------------------- */}
        <motion.div
          variants={cardVariants}
          className="bg-white rounded-xl border border-gray-100 p-5"
        >
          <h3 className="font-semibold text-[#1B2A4A] text-sm flex items-center gap-2 mb-4">
            <Globe className="w-4 h-4 text-[#2AA198]" />
            Revenue by Country
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={countryRevenueData}
                margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="country"
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#9CA3AF' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => formatCurrency(v)}
                />
                <Tooltip content={<CountryTooltip />} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: '11px' }}
                  formatter={(value: string) => (
                    <span className="text-gray-600">{value}</span>
                  )}
                />
                <Bar
                  dataKey="revenue"
                  name="Revenue"
                  fill="#2AA198"
                  radius={[6, 6, 0, 0]}
                  barSize={48}
                />
                <Bar
                  dataKey="orders"
                  name="Orders"
                  fill="#1B2A4A"
                  radius={[6, 6, 0, 0]}
                  barSize={48}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* -- Monthly Comparison Table -------------------------------------- */}
        <motion.div
          variants={cardVariants}
          className="bg-white rounded-xl border border-gray-100 overflow-hidden"
        >
          <div className="p-5 border-b border-gray-100">
            <h3 className="font-semibold text-[#1B2A4A] text-sm flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#2AA198]" />
              Monthly Comparison
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Month
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Orders
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Avg Order
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Change
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {monthlyComparison.map((row, i) => (
                  <motion.tr
                    key={row.month}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="py-3 px-4 text-sm font-medium text-[#1B2A4A]">{row.month}</td>
                    <td className="py-3 px-4 text-right text-sm font-semibold text-[#1B2A4A] tabular-nums">
                      {formatCurrencyFull(row.revenue)}
                    </td>
                    <td className="py-3 px-4 text-right text-sm text-gray-600 tabular-nums">
                      {row.orders.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right text-sm text-gray-600 tabular-nums">
                      ${row.avgOrder.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${
                          row.prevChange >= 0
                            ? 'bg-green-50 text-green-600'
                            : 'bg-red-50 text-red-600'
                        }`}
                      >
                        {row.prevChange >= 0 ? (
                          <ArrowUpRight className="w-3 h-3" />
                        ) : (
                          <ArrowDownRight className="w-3 h-3" />
                        )}
                        {Math.abs(row.prevChange)}%
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
