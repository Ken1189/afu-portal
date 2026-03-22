'use client';

import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

// ── Animation variants ──────────────────────────────────────────────────────

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

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toLocaleString()}`;
}

interface TooltipPayloadEntry {
  name: string;
  value: number;
  color: string;
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
      <p className="font-semibold text-navy mb-1">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-gray-600">{entry.name}:</span>
          <span className="font-medium text-navy">
            {typeof entry.value === 'number' ? formatCurrency(entry.value) : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Props ────────────────────────────────────────────────────────────────────

interface AdminDashboardChartsProps {
  memberGrowthData: { month: string; members: number }[];
  revenueData: Record<string, unknown>[];
  revenueDataKey: string;
  revenueNameKey: string;
  loanPortfolioData: Record<string, unknown>[];
}

// ── Component ────────────────────────────────────────────────────────────────

export default function AdminDashboardCharts({
  memberGrowthData,
  revenueData,
  revenueDataKey,
  revenueNameKey,
  loanPortfolioData,
}: AdminDashboardChartsProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 lg:grid-cols-3 gap-6"
    >
      {/* ── Member Growth Line Chart ─────────────────────────────────── */}
      <motion.div
        variants={cardVariants}
        className="bg-white rounded-xl border border-gray-100 p-5 card-polished"
      >
        <h3 className="font-semibold text-navy text-sm mb-4">Member Growth</h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={memberGrowthData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="memberGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8CB89C" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8CB89C" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="members"
                stroke="#8CB89C"
                strokeWidth={2.5}
                fill="url(#memberGradient)"
                name="Members"
                dot={{ fill: '#8CB89C', r: 3, strokeWidth: 0 }}
                activeDot={{ fill: '#8CB89C', r: 5, strokeWidth: 2, stroke: '#fff' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* ── Revenue Breakdown Donut ──────────────────────────────────── */}
      <motion.div
        variants={cardVariants}
        className="bg-white rounded-xl border border-gray-100 p-5 card-polished"
      >
        <h3 className="font-semibold text-navy text-sm mb-4">Revenue Breakdown</h3>
        <div className="h-56 flex items-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={revenueData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey={revenueDataKey}
                nameKey={revenueNameKey}
                stroke="none"
              >
                {revenueData.map((entry, index) => {
                  const colors = ['#5DB347', '#1B2A4A', '#8CB89C', '#6ABF4B', '#2D4A7A'];
                  return <Cell key={index} fill={entry.color as string || colors[index % colors.length]} />;
                })}
              </Pie>
              <Tooltip
                formatter={(value) => formatCurrency(Number(value))}
                contentStyle={{
                  borderRadius: '8px',
                  border: '1px solid #f0f0f0',
                  fontSize: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                }}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: '11px' }}
                formatter={(value: string) => <span className="text-gray-600">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* ── Loan Portfolio Stacked Bar Chart ─────────────────────────── */}
      <motion.div
        variants={cardVariants}
        className="bg-white rounded-xl border border-gray-100 p-5 card-polished"
      >
        <h3 className="font-semibold text-navy text-sm mb-4">Loan Portfolio (Last 6 Months)</h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={loanPortfolioData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 11, fill: '#9CA3AF' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => formatCurrency(v)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="workingCapital" stackId="a" fill="#8CB89C" name="Working Capital" radius={[0, 0, 0, 0]} />
              <Bar dataKey="invoiceFinance" stackId="a" fill="#1B2A4A" name="Invoice Finance" />
              <Bar dataKey="equipment" stackId="a" fill="#D4A843" name="Equipment" />
              <Bar dataKey="inputBundle" stackId="a" fill="#2D4A7A" name="Input Bundle" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </motion.div>
  );
}
