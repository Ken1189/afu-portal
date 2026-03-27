'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import {
  Search,
  Wrench,
  DollarSign,
  CheckCircle2,
  Clock,
  AlertTriangle,
  MapPin,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

// ── Types ────────────────────────────────────────────────────────────────────

interface EquipmentRecord {
  id: string;
  name: string;
  type: string;
  ownerName: string;
  farmName: string;
  status: 'available' | 'in-use' | 'maintenance';
  dailyRate: number;
  location: string;
}

type StatusFilter = 'all' | 'available' | 'in-use' | 'maintenance';

// ── Placeholder Data ─────────────────────────────────────────────────────────

const fallback_equipment: EquipmentRecord[] = [
  { id: 'EQ-001', name: 'John Deere 5055E', type: 'Tractor', ownerName: 'Grace Moyo', farmName: 'Moyo Farm', status: 'available', dailyRate: 120, location: 'Zimbabwe' },
  { id: 'EQ-002', name: 'Kubota L3901', type: 'Tractor', ownerName: 'Baraka Mushi', farmName: 'Mushi Agri', status: 'in-use', dailyRate: 95, location: 'Tanzania' },
  { id: 'EQ-003', name: 'Netafim Drip System', type: 'Irrigation', ownerName: 'Tendai Chirwa', farmName: 'Chirwa Orchards', status: 'available', dailyRate: 45, location: 'Zimbabwe' },
  { id: 'EQ-004', name: 'Massey Ferguson Combine', type: 'Harvester', ownerName: 'John Maseko', farmName: 'Maseko Fields', status: 'maintenance', dailyRate: 280, location: 'Zimbabwe' },
  { id: 'EQ-005', name: 'DJI Agras T30', type: 'Drone', ownerName: 'Farai Ndlovu', farmName: 'Ndlovu Estate', status: 'available', dailyRate: 65, location: 'Zimbabwe' },
  { id: 'EQ-006', name: 'Amazone ZA-TS', type: 'Spreader', ownerName: 'Kago Setshedi', farmName: 'Setshedi Farms', status: 'in-use', dailyRate: 55, location: 'Botswana' },
  { id: 'EQ-007', name: 'Isuzu NPR Truck', type: 'Transport', ownerName: 'Halima Mwanga', farmName: 'Mwanga Farm', status: 'available', dailyRate: 150, location: 'Tanzania' },
  { id: 'EQ-008', name: 'Honda WB30 Pump', type: 'Irrigation', ownerName: 'Amina Salim', farmName: 'Salim Holdings', status: 'in-use', dailyRate: 25, location: 'Tanzania' },
  { id: 'EQ-009', name: 'New Holland TC5.30', type: 'Harvester', ownerName: 'Grace Moyo', farmName: 'Moyo Farm', status: 'available', dailyRate: 250, location: 'Zimbabwe' },
  { id: 'EQ-010', name: 'Stihl MS 261', type: 'Chainsaw', ownerName: 'Nyasha Mutasa', farmName: 'Mutasa Growers', status: 'maintenance', dailyRate: 18, location: 'Zimbabwe' },
  { id: 'EQ-011', name: 'Toyota Hilux 4x4', type: 'Transport', ownerName: 'Tinashe Gumbo', farmName: 'Gumbo Orchards', status: 'in-use', dailyRate: 85, location: 'Botswana' },
  { id: 'EQ-012', name: 'Jacto Uniport', type: 'Sprayer', ownerName: 'Rumbidzai Chikore', farmName: 'Chikore Ag', status: 'available', dailyRate: 70, location: 'Zimbabwe' },
];

// ── Animation ────────────────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 260, damping: 24 } },
};

// ── Helpers ──────────────────────────────────────────────────────────────────

const statusColors: Record<string, string> = {
  available: 'bg-green-100 text-green-700',
  'in-use': 'bg-blue-100 text-blue-700',
  maintenance: 'bg-amber-100 text-amber-700',
};

const statusLabels: Record<string, string> = {
  available: 'Available',
  'in-use': 'In Use',
  maintenance: 'Maintenance',
};

const statusIcons: Record<string, React.ReactNode> = {
  available: <CheckCircle2 className="w-3 h-3" />,
  'in-use': <Clock className="w-3 h-3" />,
  maintenance: <AlertTriangle className="w-3 h-3" />,
};

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toLocaleString()}`;
}

// ═══════════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function EquipmentRegistryPage() {
  const { locale: _locale } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [equipment, setEquipment] = useState<EquipmentRecord[]>(fallback_equipment);
  const [_isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    async function fetchData() {
      try {
        const { data, error } = await supabase
          .from('equipment')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          setEquipment(
            data.map((row: Record<string, unknown>) => ({
              id: (row.id as string) || '',
              name: (row.name as string) || 'Unknown',
              type: (row.equipment_type as string) || (row.type as string) || 'Other',
              ownerName: (row.owner_name as string) || 'Unknown',
              farmName: (row.farm_name as string) || '',
              status: ((row.status as string) || 'available') as EquipmentRecord['status'],
              dailyRate: (row.daily_rate as number) || 0,
              location: (row.location as string) || (row.country as string) || '',
            }))
          );
        }
      } catch { /* fallback */ }
      setIsLoading(false);
    }
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    let result = [...equipment];
    if (statusFilter !== 'all') result = result.filter((e) => e.status === statusFilter);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.type.toLowerCase().includes(q) ||
          e.ownerName.toLowerCase().includes(q)
      );
    }
    return result;
  }, [searchQuery, statusFilter]);

  const totalEquipment = equipment.length;
  const availableNow = equipment.filter((e) => e.status === 'available').length;
  const activeBookings = equipment.filter((e) => e.status === 'in-use').length;
  const rentalRevenue = equipment.filter((e) => e.status === 'in-use').reduce((s, e) => s + e.dailyRate * 30, 0);

  const summaryCards = [
    { label: 'Total Equipment', value: totalEquipment.toString(), icon: <Wrench className="w-5 h-5" />, color: 'text-teal', bg: 'bg-teal/10' },
    { label: 'Available Now', value: availableNow.toString(), icon: <CheckCircle2 className="w-5 h-5" />, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Active Bookings', value: activeBookings.toString(), icon: <Clock className="w-5 h-5" />, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Monthly Rental Rev.', value: formatCurrency(rentalRevenue), icon: <DollarSign className="w-5 h-5" />, color: 'text-navy', bg: 'bg-navy/10' },
  ];

  const tabs: { key: StatusFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'available', label: 'Available' },
    { key: 'in-use', label: 'In Use' },
    { key: 'maintenance', label: 'Maintenance' },
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Header */}
      <motion.div variants={cardVariants}>
        <h1 className="text-2xl font-bold text-navy">Equipment Registry</h1>
        <p className="text-sm text-gray-500 mt-0.5">All equipment available for sharing across member farms</p>
      </motion.div>

      {/* Summary Cards */}
      <motion.div variants={containerVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {summaryCards.map((card, i) => (
          <motion.div
            key={i}
            variants={cardVariants}
            whileHover={{ y: -2, boxShadow: '0 8px 25px rgba(27,42,74,0.08)' }}
            className="bg-white rounded-xl p-4 border border-gray-100"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center ${card.color}`}>
                {card.icon}
              </div>
              <div>
                <p className="text-2xl font-bold text-navy">{card.value}</p>
                <p className="text-xs text-gray-500">{card.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Filters */}
      <motion.div variants={cardVariants} className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, type, or owner..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal/50"
            />
          </div>
          <div className="flex flex-wrap gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  statusFilter === tab.key
                    ? 'bg-teal text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-3">Showing {filtered.length} of {totalEquipment} items</p>
      </motion.div>

      {/* Table */}
      <motion.div variants={cardVariants} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-cream/50">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Equipment</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Type</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Owner / Farm</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Daily Rate</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Location</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((eq) => (
                <tr key={eq.id} className="hover:bg-cream/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Wrench className="w-3.5 h-3.5 text-teal flex-shrink-0" />
                      <span className="font-medium text-navy">{eq.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-500">{eq.type}</td>
                  <td className="py-3 px-4">
                    <p className="font-medium text-navy text-sm">{eq.ownerName}</p>
                    <p className="text-xs text-gray-400">{eq.farmName}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[eq.status]}`}>
                      {statusIcons[eq.status]}
                      {statusLabels[eq.status]}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right tabular-nums font-medium text-navy">${eq.dailyRate}/day</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1 text-gray-500 text-xs">
                      <MapPin className="w-3 h-3" />
                      {eq.location}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <Wrench className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No equipment matches your filters</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
