'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Download,
  Printer,
  Loader2,
  FileText,
  ArrowUpDown,
  Package,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Receipt {
  id: string;
  receipt_number: string;
  farmer_id: string | null;
  farmer_name: string | null;
  commodity: string;
  bags: number;
  gross_weight_kg: number;
  tare_weight_kg: number;
  net_weight_kg: number;
  unit_price: number;
  total_value: number;
  grade: string | null;
  status: string;
  created_at: string;
  quality_inspection?: {
    moisture_percent: number;
    foreign_matter_percent: number;
    damage_percent: number;
    aflatoxin_level: string;
    color_assessment: string;
    odor: string;
  } | null;
}

const STATUS_OPTIONS = ['all', 'pending', 'received', 'released', 'rejected'];
const COMMODITY_OPTIONS = ['all', 'Maize', 'Soya Beans', 'Wheat', 'Rice', 'Sorghum', 'Groundnuts', 'Coffee', 'Cocoa'];

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [commodityFilter, setCommodityFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState<'created_at' | 'net_weight_kg' | 'total_value'>('created_at');
  const [sortAsc, setSortAsc] = useState(false);

  useEffect(() => {
    fetchReceipts();
  }, [statusFilter, commodityFilter, dateFrom, dateTo, sortField, sortAsc]);

  async function fetchReceipts() {
    setLoading(true);
    try {
      const supabase = createClient();
      let query = supabase
        .from('warehouse_receipts')
        .select('*')
        .order(sortField, { ascending: sortAsc })
        .limit(200);

      if (statusFilter !== 'all') query = query.eq('status', statusFilter);
      if (commodityFilter !== 'all') query = query.ilike('commodity', commodityFilter);
      if (dateFrom) query = query.gte('created_at', `${dateFrom}T00:00:00`);
      if (dateTo) query = query.lte('created_at', `${dateTo}T23:59:59`);

      const { data } = await query;
      setReceipts(data || []);
    } catch (err) {
      console.error('Fetch receipts error:', err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = receipts.filter((r) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.receipt_number?.toLowerCase().includes(q) ||
      r.farmer_name?.toLowerCase().includes(q)
    );
  });

  const handleRelease = async (id: string) => {
    try {
      const supabase = createClient();
      await supabase.from('warehouse_receipts').update({ status: 'released' }).eq('id', id);
      fetchReceipts();
    } catch (err) {
      console.error('Release error:', err);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Receipt #', 'Farmer', 'Commodity', 'Bags', 'Net Weight (kg)', 'Grade', 'Status', 'Value', 'Date'];
    const rows = filtered.map((r) => [
      r.receipt_number,
      r.farmer_name || 'Walk-in',
      r.commodity,
      r.bags,
      r.net_weight_kg,
      r.grade || '-',
      r.status,
      r.total_value,
      new Date(r.created_at).toLocaleDateString(),
    ]);
    const csv = [headers.join(','), ...rows.map((row) => row.map((v) => `"${v}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `warehouse-receipts-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleSort = (field: 'created_at' | 'net_weight_kg' | 'total_value') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'received': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'released': return 'bg-blue-100 text-blue-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const gradeColor = (grade: string | null) => {
    switch (grade) {
      case 'A': return 'bg-green-100 text-green-700';
      case 'B': return 'bg-blue-100 text-blue-700';
      case 'C': return 'bg-yellow-100 text-yellow-700';
      case 'Reject': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-500';
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-[#1B2A4A]">Warehouse Receipts</h1>
        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1B2A4A] text-white rounded-xl text-sm font-medium hover:bg-[#243658] transition-colors min-h-[44px]"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-3">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search receipt # or farmer name..."
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-[#5DB347] min-h-[48px]"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 min-h-[48px]"
          >
            <Filter className="w-4 h-4" />
            Filters
            {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-gray-100">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white min-h-[44px]"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s === 'all' ? 'All Statuses' : s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Commodity</label>
              <select
                value={commodityFilter}
                onChange={(e) => setCommodityFilter(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white min-h-[44px]"
              >
                {COMMODITY_OPTIONS.map((c) => (
                  <option key={c} value={c}>{c === 'all' ? 'All Commodities' : c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">From</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm min-h-[44px]"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">To</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm min-h-[44px]"
              />
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-[#5DB347]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <FileText className="w-12 h-12 mb-3 opacity-50" />
            <p className="text-lg font-medium">No receipts found</p>
            <p className="text-sm">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs text-gray-500 uppercase border-b border-gray-100 bg-gray-50/50">
                  <th className="px-4 py-3 font-medium">Receipt #</th>
                  <th className="px-4 py-3 font-medium">Farmer</th>
                  <th className="px-4 py-3 font-medium">Commodity</th>
                  <th className="px-4 py-3 font-medium cursor-pointer" onClick={() => toggleSort('net_weight_kg')}>
                    <span className="inline-flex items-center gap-1">Qty (kg) <ArrowUpDown className="w-3 h-3" /></span>
                  </th>
                  <th className="px-4 py-3 font-medium">Grade</th>
                  <th className="px-4 py-3 font-medium cursor-pointer" onClick={() => toggleSort('created_at')}>
                    <span className="inline-flex items-center gap-1">Date <ArrowUpDown className="w-3 h-3" /></span>
                  </th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium cursor-pointer text-right" onClick={() => toggleSort('total_value')}>
                    <span className="inline-flex items-center gap-1 justify-end">Value <ArrowUpDown className="w-3 h-3" /></span>
                  </th>
                  <th className="px-4 py-3 font-medium w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((r) => (
                  <tr key={r.id} className="group">
                    <td className="px-4 py-3">
                      <button onClick={() => setExpandedId(expandedId === r.id ? null : r.id)} className="font-mono text-sm text-[#1B2A4A] hover:text-[#5DB347] font-medium">
                        {r.receipt_number}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-sm">{r.farmer_name || 'Walk-in'}</td>
                    <td className="px-4 py-3 text-sm capitalize">{r.commodity}</td>
                    <td className="px-4 py-3 text-sm font-medium">{r.net_weight_kg?.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded ${gradeColor(r.grade)}`}>{r.grade || '-'}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{new Date(r.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor(r.status)}`}>{r.status}</span>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-right">${r.total_value?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => setExpandedId(expandedId === r.id ? null : r.id)} className="p-1 hover:bg-gray-100 rounded min-w-[44px] min-h-[44px] flex items-center justify-center">
                        {expandedId === r.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </td>
                    {/* Expanded Details Row — rendered via CSS trick with colSpan */}
                    {expandedId === r.id && (
                      <td colSpan={9} className="px-4 py-4 bg-gray-50 border-t border-gray-100">
                        <div className="grid sm:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500 text-xs uppercase font-medium mb-2">Weight Details</p>
                            <p>Gross: {r.gross_weight_kg?.toLocaleString()} kg</p>
                            <p>Tare: {r.tare_weight_kg?.toLocaleString()} kg</p>
                            <p className="font-bold">Net: {r.net_weight_kg?.toLocaleString()} kg</p>
                            <p>Bags: {r.bags}</p>
                            <p>Unit Price: ${r.unit_price?.toFixed(2)}/kg</p>
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs uppercase font-medium mb-2">Quality</p>
                            {r.quality_inspection ? (
                              <>
                                <p>Moisture: {r.quality_inspection.moisture_percent}%</p>
                                <p>Foreign Matter: {r.quality_inspection.foreign_matter_percent}%</p>
                                <p>Damage: {r.quality_inspection.damage_percent}%</p>
                                <p>Aflatoxin: <span className="capitalize">{r.quality_inspection.aflatoxin_level}</span></p>
                                <p>Color: <span className="capitalize">{r.quality_inspection.color_assessment}</span></p>
                                <p>Odor: <span className="capitalize">{r.quality_inspection.odor}</span></p>
                              </>
                            ) : (
                              <p className="text-gray-400">No inspection data</p>
                            )}
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs uppercase font-medium mb-2">Actions</p>
                            <div className="flex flex-col gap-2">
                              {r.status === 'received' && (
                                <button
                                  onClick={() => handleRelease(r.id)}
                                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 min-h-[44px]"
                                >
                                  <Package className="w-4 h-4" />
                                  Release
                                </button>
                              )}
                              <button
                                onClick={() => window.print()}
                                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 min-h-[44px]"
                              >
                                <Printer className="w-4 h-4" />
                                Print
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
