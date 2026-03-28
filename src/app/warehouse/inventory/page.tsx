'use client';

import { useState, useEffect } from 'react';
import {
  Warehouse,
  Loader2,
  AlertTriangle,
  Clock,
  TrendingUp,
  BarChart3,
  DollarSign,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface CommodityStock {
  commodity: string;
  total_qty_kg: number;
  receipt_count: number;
  avg_grade: string;
  total_value: number;
}

interface AgingItem {
  id: string;
  receipt_number: string;
  farmer_name: string | null;
  commodity: string;
  net_weight_kg: number;
  grade: string | null;
  total_value: number;
  created_at: string;
  days_stored: number;
}

interface WarehouseInfo {
  name: string;
  capacity_mt: number;
  current_stock_mt: number;
}

export default function InventoryPage() {
  const [commodityStocks, setCommodityStocks] = useState<CommodityStock[]>([]);
  const [agingItems, setAgingItems] = useState<AgingItem[]>([]);
  const [warehouseInfo, setWarehouseInfo] = useState<WarehouseInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInventory();
  }, []);

  async function fetchInventory() {
    setLoading(true);
    try {
      const supabase = createClient();

      // Warehouse info
      const { data: wh } = await supabase
        .from('warehouses')
        .select('name, capacity_mt, current_stock_mt')
        .limit(1)
        .single();
      setWarehouseInfo(wh as WarehouseInfo | null);

      // All active receipts (received, not released)
      const { data: activeReceipts } = await supabase
        .from('warehouse_receipts')
        .select('id, receipt_number, farmer_name, commodity, net_weight_kg, grade, total_value, created_at, status')
        .eq('status', 'received')
        .order('created_at', { ascending: true });

      if (activeReceipts) {
        // Commodity aggregation
        const commodityMap = new Map<string, { totalKg: number; count: number; totalValue: number; grades: string[] }>();
        const now = Date.now();

        const aging: AgingItem[] = [];

        activeReceipts.forEach((r) => {
          const existing = commodityMap.get(r.commodity) || { totalKg: 0, count: 0, totalValue: 0, grades: [] };
          commodityMap.set(r.commodity, {
            totalKg: existing.totalKg + (r.net_weight_kg || 0),
            count: existing.count + 1,
            totalValue: existing.totalValue + (r.total_value || 0),
            grades: [...existing.grades, r.grade || ''],
          });

          const daysStored = Math.floor((now - new Date(r.created_at).getTime()) / (1000 * 60 * 60 * 24));
          aging.push({ ...r, days_stored: daysStored });
        });

        const stocks: CommodityStock[] = [];
        commodityMap.forEach((v, k) => {
          const gradeCounts: Record<string, number> = {};
          v.grades.forEach((g) => {
            if (g) gradeCounts[g] = (gradeCounts[g] || 0) + 1;
          });
          const topGrade = Object.entries(gradeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';
          stocks.push({
            commodity: k,
            total_qty_kg: v.totalKg,
            receipt_count: v.count,
            avg_grade: topGrade,
            total_value: v.totalValue,
          });
        });
        stocks.sort((a, b) => b.total_qty_kg - a.total_qty_kg);

        // Sort aging by days descending
        aging.sort((a, b) => b.days_stored - a.days_stored);

        setCommodityStocks(stocks);
        setAgingItems(aging);
      }
    } catch (err) {
      console.error('Fetch inventory error:', err);
    } finally {
      setLoading(false);
    }
  }

  const formatWeight = (kg: number) =>
    kg >= 1000 ? `${(kg / 1000).toFixed(1)} MT` : `${kg.toFixed(0)} kg`;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  const capacityPercent = warehouseInfo
    ? Math.round(((warehouseInfo.current_stock_mt || 0) / (warehouseInfo.capacity_mt || 1)) * 100)
    : 0;

  const totalStockKg = commodityStocks.reduce((s, c) => s + c.total_qty_kg, 0);
  const totalValue = commodityStocks.reduce((s, c) => s + c.total_value, 0);
  const totalReceipts = commodityStocks.reduce((s, c) => s + c.receipt_count, 0);

  const atRiskItems = agingItems.filter((item) => item.days_stored > 60);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#5DB347]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#1B2A4A]">Current Stock Inventory</h1>

      {/* Capacity Gauge and Summary */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Warehouse className="w-5 h-5 text-[#1B2A4A]" />
              <span className="font-bold text-[#1B2A4A]">Warehouse Capacity</span>
            </div>
            <span className="text-sm text-gray-500">{warehouseInfo?.name || 'Main Warehouse'}</span>
          </div>
          <div className="flex items-end justify-between mb-2">
            <span className={`text-4xl font-black ${capacityPercent > 90 ? 'text-red-600' : capacityPercent > 70 ? 'text-yellow-600' : 'text-[#5DB347]'}`}>
              {capacityPercent}%
            </span>
            <span className="text-sm text-gray-500">
              {warehouseInfo?.current_stock_mt?.toFixed(1) || 0} / {warehouseInfo?.capacity_mt?.toFixed(0) || 0} MT
            </span>
          </div>
          <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                capacityPercent > 90 ? 'bg-red-500' : capacityPercent > 70 ? 'bg-yellow-500' : 'bg-[#5DB347]'
              }`}
              style={{ width: `${Math.min(capacityPercent, 100)}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-5 h-5 text-blue-500" />
            <span className="text-sm text-gray-500 font-medium">Total Stock</span>
          </div>
          <p className="text-3xl font-bold text-[#1B2A4A]">{formatWeight(totalStockKg)}</p>
          <p className="text-sm text-gray-400 mt-1">{totalReceipts} receipts</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-green-500" />
            <span className="text-sm text-gray-500 font-medium">Total Value</span>
          </div>
          <p className="text-3xl font-bold text-[#1B2A4A]">{formatCurrency(totalValue)}</p>
          <p className="text-sm text-gray-400 mt-1">{commodityStocks.length} commodities</p>
        </div>
      </div>

      {/* Inventory by Commodity */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-bold text-[#1B2A4A] text-lg">Inventory by Commodity</h3>
        </div>
        {commodityStocks.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Warehouse className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-lg font-medium">No stock in warehouse</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs text-gray-500 uppercase border-b border-gray-100 bg-gray-50/50">
                  <th className="px-5 py-3 font-medium">Commodity</th>
                  <th className="px-5 py-3 font-medium">Total Quantity</th>
                  <th className="px-5 py-3 font-medium">Receipts</th>
                  <th className="px-5 py-3 font-medium">Most Common Grade</th>
                  <th className="px-5 py-3 font-medium text-right">Total Value</th>
                  <th className="px-5 py-3 font-medium">Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {commodityStocks.map((s) => (
                  <tr key={s.commodity} className="hover:bg-gray-50">
                    <td className="px-5 py-4 font-medium text-[#1B2A4A] text-base capitalize">{s.commodity}</td>
                    <td className="px-5 py-4 text-base font-bold">{formatWeight(s.total_qty_kg)}</td>
                    <td className="px-5 py-4 text-sm">{s.receipt_count}</td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                        s.avg_grade === 'A' ? 'bg-green-100 text-green-700' :
                        s.avg_grade === 'B' ? 'bg-blue-100 text-blue-700' :
                        s.avg_grade === 'C' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-500'
                      }`}>{s.avg_grade}</span>
                    </td>
                    <td className="px-5 py-4 text-base font-medium text-right">{formatCurrency(s.total_value)}</td>
                    <td className="px-5 py-4">
                      <div className="w-24">
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#5DB347] rounded-full"
                            style={{ width: `${totalStockKg > 0 ? (s.total_qty_kg / totalStockKg) * 100 : 0}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400">{totalStockKg > 0 ? Math.round((s.total_qty_kg / totalStockKg) * 100) : 0}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Value at Risk / Aging Report */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-[#1B2A4A] text-lg flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            Aging Report &amp; Value at Risk
          </h3>
          {atRiskItems.length > 0 && (
            <span className="bg-red-100 text-red-700 text-xs font-semibold px-2.5 py-1 rounded-full">
              {atRiskItems.length} at risk
            </span>
          )}
        </div>
        {agingItems.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-lg font-medium">No items in storage</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs text-gray-500 uppercase border-b border-gray-100 bg-gray-50/50">
                  <th className="px-5 py-3 font-medium">Receipt #</th>
                  <th className="px-5 py-3 font-medium">Farmer</th>
                  <th className="px-5 py-3 font-medium">Commodity</th>
                  <th className="px-5 py-3 font-medium">Weight</th>
                  <th className="px-5 py-3 font-medium">Days Stored</th>
                  <th className="px-5 py-3 font-medium text-right">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {agingItems.slice(0, 30).map((item) => (
                  <tr key={item.id} className={`hover:bg-gray-50 ${item.days_stored > 90 ? 'bg-red-50/50' : item.days_stored > 60 ? 'bg-yellow-50/50' : ''}`}>
                    <td className="px-5 py-3 font-mono text-sm">{item.receipt_number}</td>
                    <td className="px-5 py-3 text-sm">{item.farmer_name || 'Walk-in'}</td>
                    <td className="px-5 py-3 text-sm capitalize">{item.commodity}</td>
                    <td className="px-5 py-3 text-sm font-medium">{formatWeight(item.net_weight_kg)}</td>
                    <td className="px-5 py-3">
                      <span className={`text-sm font-bold ${
                        item.days_stored > 90 ? 'text-red-600' : item.days_stored > 60 ? 'text-yellow-600' : item.days_stored > 30 ? 'text-orange-500' : 'text-green-600'
                      }`}>
                        {item.days_stored} days
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm font-medium text-right">{formatCurrency(item.total_value)}</td>
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
