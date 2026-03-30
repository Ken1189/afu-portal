'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Warehouse,
  Package,
  FileText,
  DollarSign,
  MapPin,
  Calendar,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  Plus,
  Loader2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Banknote,
  ShieldCheck,
  Truck,
  BarChart3,
  Star,
  Phone,
  Mail,
  Edit,
  Trash2,
  Eye,
  ClipboardCheck,
  TrendingUp,
  Users,
  Activity,
  X,
  ArrowRight,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '@/lib/supabase/auth-context';
import { createClient } from '@/lib/supabase/client';

// ── Types ────────────────────────────────────────────────────────────────
interface WarehouseRecord {
  id: string;
  name: string;
  location: string;
  country: string;
  capacity_tonnes: number;
  current_stock_tonnes: number;
  certifications: string[];
  contact_phone: string;
  contact_email: string;
  manager_name: string;
  status: string;
}

interface ReceiptRecord {
  id: string;
  receipt_number: string;
  farmer_id: string;
  farmer_name: string;
  commodity_type: string;
  quantity: number;
  quantity_unit: string;
  grade: string;
  grade_estimate: string;
  market_value: number;
  status: string;
  deposit_date: string;
  delivery_date: string;
  notes: string;
  warehouse?: WarehouseRecord;
  quality_inspection?: QualityInspection[];
  financing?: FinancingRecord[];
}

interface QualityInspection {
  id: string;
  receipt_id: string;
  moisture_content: number;
  foreign_matter: number;
  damage_percentage: number;
  aflatoxin_level: number;
  grade_assigned: string;
  status: string;
  inspection_date: string;
  notes: string;
  receipt?: ReceiptRecord;
}

interface FinancingRecord {
  id: string;
  receipt_id: string;
  borrower_id: string;
  requested_amount: number;
  approved_amount: number;
  interest_rate: number;
  duration_months: number;
  status: string;
  due_date: string;
  disbursement_date: string;
  application_date: string;
  receipt?: ReceiptRecord;
}

interface DispatchRecord {
  id: string;
  receipt_id: string;
  receipt_number: string;
  farmer_name: string;
  commodity_type: string;
  quantity: number;
  quantity_unit: string;
  destination: string;
  requested_date: string;
  dispatch_date: string;
  status: string;
  assigned_grader: string;
  warehouse_name: string;
  notes: string;
}

// ── Demo Data ────────────────────────────────────────────────────────────
const demoWarehouses: WarehouseRecord[] = [
  { id: 'wh-1', name: 'Kampala Central Warehouse', location: 'Kampala, Central Region', country: 'Uganda', capacity_tonnes: 5000, current_stock_tonnes: 3200, certifications: ['ISO 22000', 'HACCP'], contact_phone: '+256-700-123456', contact_email: 'kampala@afuwarehouse.com', manager_name: 'James Okello', status: 'active' },
  { id: 'wh-2', name: 'Nairobi Grain Storage', location: 'Nairobi, Nairobi County', country: 'Kenya', capacity_tonnes: 8000, current_stock_tonnes: 5500, certifications: ['ISO 22000', 'GMP'], contact_phone: '+254-700-234567', contact_email: 'nairobi@afuwarehouse.com', manager_name: 'Mary Wanjiku', status: 'active' },
  { id: 'wh-3', name: 'Dar es Salaam Hub', location: 'Dar es Salaam', country: 'Tanzania', capacity_tonnes: 6000, current_stock_tonnes: 2100, certifications: ['HACCP'], contact_phone: '+255-700-345678', contact_email: 'dar@afuwarehouse.com', manager_name: 'Hassan Mwanga', status: 'active' },
  { id: 'wh-4', name: 'Kigali Cold Storage', location: 'Kigali', country: 'Rwanda', capacity_tonnes: 3000, current_stock_tonnes: 1800, certifications: ['ISO 22000', 'HACCP', 'Organic'], contact_phone: '+250-700-456789', contact_email: 'kigali@afuwarehouse.com', manager_name: 'Claire Uwimana', status: 'active' },
  { id: 'wh-5', name: 'Lusaka Agri Store', location: 'Lusaka', country: 'Zambia', capacity_tonnes: 4000, current_stock_tonnes: 900, certifications: ['GMP'], contact_phone: '+260-700-567890', contact_email: 'lusaka@afuwarehouse.com', manager_name: 'David Banda', status: 'active' },
  { id: 'wh-6', name: 'Accra Commodity Depot', location: 'Accra', country: 'Ghana', capacity_tonnes: 7000, current_stock_tonnes: 4300, certifications: ['ISO 22000', 'GMP', 'HACCP'], contact_phone: '+233-700-678901', contact_email: 'accra@afuwarehouse.com', manager_name: 'Kofi Asante', status: 'active' },
];

const demoReceipts: ReceiptRecord[] = [
  { id: 'r-1', receipt_number: 'WR-20260315-1234', farmer_id: 'f-1', farmer_name: 'John Okello', commodity_type: 'Maize', quantity: 2500, quantity_unit: 'kg', grade: 'Grade A', grade_estimate: 'Grade A', market_value: 1875, status: 'active', deposit_date: '2026-03-15', delivery_date: '2026-03-14', notes: '', warehouse: demoWarehouses[0], quality_inspection: [{ id: 'qi-1', receipt_id: 'r-1', moisture_content: 12.5, foreign_matter: 0.8, damage_percentage: 1.2, aflatoxin_level: 3.5, grade_assigned: 'Grade A', status: 'approved', inspection_date: '2026-03-15', notes: 'Excellent' }], financing: [] },
  { id: 'r-2', receipt_number: 'WR-20260310-5678', farmer_id: 'f-2', farmer_name: 'Mary Wanjiku', commodity_type: 'Coffee (Arabica)', quantity: 800, quantity_unit: 'kg', grade: 'Grade B', grade_estimate: 'Grade A', market_value: 4800, status: 'active', deposit_date: '2026-03-10', delivery_date: '2026-03-09', notes: '', warehouse: demoWarehouses[1], quality_inspection: [], financing: [{ id: 'fin-1', receipt_id: 'r-2', borrower_id: 'f-2', requested_amount: 3000, approved_amount: 2800, interest_rate: 12, duration_months: 6, status: 'active', due_date: '2026-09-10', disbursement_date: '2026-03-12', application_date: '2026-03-11' }] },
  { id: 'r-3', receipt_number: 'WR-20260320-9012', farmer_id: 'f-3', farmer_name: 'Hassan Mwanga', commodity_type: 'Sorghum', quantity: 1500, quantity_unit: 'kg', grade: '', grade_estimate: 'Grade B', market_value: 900, status: 'pending', deposit_date: '2026-03-20', delivery_date: '2026-03-19', notes: 'Awaiting inspection', warehouse: demoWarehouses[2], quality_inspection: [], financing: [] },
  { id: 'r-4', receipt_number: 'WR-20260318-3456', farmer_id: 'f-4', farmer_name: 'Claire Uwimana', commodity_type: 'Rice', quantity: 3000, quantity_unit: 'kg', grade: 'Grade A', grade_estimate: 'Grade A', market_value: 3600, status: 'active', deposit_date: '2026-03-18', delivery_date: '2026-03-17', notes: '', warehouse: demoWarehouses[3], quality_inspection: [{ id: 'qi-2', receipt_id: 'r-4', moisture_content: 13.0, foreign_matter: 0.5, damage_percentage: 0.8, aflatoxin_level: 2.0, grade_assigned: 'Grade A', status: 'approved', inspection_date: '2026-03-18', notes: 'Premium quality' }], financing: [] },
  { id: 'r-5', receipt_number: 'WR-20260322-7890', farmer_id: 'f-5', farmer_name: 'David Banda', commodity_type: 'Groundnuts', quantity: 500, quantity_unit: 'kg', grade: '', grade_estimate: 'Grade B', market_value: 750, status: 'pending', deposit_date: '2026-03-22', delivery_date: '2026-03-21', notes: 'Pending quality check', warehouse: demoWarehouses[4], quality_inspection: [], financing: [] },
  { id: 'r-6', receipt_number: 'WR-20260325-2345', farmer_id: 'f-6', farmer_name: 'Kofi Asante', commodity_type: 'Cocoa', quantity: 1200, quantity_unit: 'kg', grade: 'Grade A', grade_estimate: 'Grade A', market_value: 6000, status: 'financed', deposit_date: '2026-03-25', delivery_date: '2026-03-24', notes: '', warehouse: demoWarehouses[5], quality_inspection: [], financing: [{ id: 'fin-3', receipt_id: 'r-6', borrower_id: 'f-6', requested_amount: 4000, approved_amount: 3500, interest_rate: 10, duration_months: 4, status: 'active', due_date: '2026-07-25', disbursement_date: '2026-03-26', application_date: '2026-03-25' }] },
];

const demoFinancing: FinancingRecord[] = [
  { id: 'fin-1', receipt_id: 'r-2', borrower_id: 'f-2', requested_amount: 3000, approved_amount: 2800, interest_rate: 12, duration_months: 6, status: 'active', due_date: '2026-09-10', disbursement_date: '2026-03-12', application_date: '2026-03-11', receipt: demoReceipts[1] },
  { id: 'fin-2', receipt_id: 'r-4', borrower_id: 'f-4', requested_amount: 2000, approved_amount: 0, interest_rate: 0, duration_months: 0, status: 'pending', due_date: '', disbursement_date: '', application_date: '2026-03-25', receipt: demoReceipts[3] },
  { id: 'fin-3', receipt_id: 'r-6', borrower_id: 'f-6', requested_amount: 4000, approved_amount: 3500, interest_rate: 10, duration_months: 4, status: 'active', due_date: '2026-07-25', disbursement_date: '2026-03-26', application_date: '2026-03-25', receipt: demoReceipts[5] },
];

const demoDispatches: DispatchRecord[] = [
  { id: 'd-1', receipt_id: 'r-1', receipt_number: 'WR-20260315-1234', farmer_name: 'John Okello', commodity_type: 'Maize', quantity: 1000, quantity_unit: 'kg', destination: 'Mombasa Export Terminal', requested_date: '2026-03-28', dispatch_date: '', status: 'pending', assigned_grader: '', warehouse_name: 'Kampala Central Warehouse', notes: 'Partial dispatch for export' },
  { id: 'd-2', receipt_id: 'r-2', receipt_number: 'WR-20260310-5678', farmer_name: 'Mary Wanjiku', commodity_type: 'Coffee (Arabica)', quantity: 500, quantity_unit: 'kg', destination: 'Nairobi Auction House', requested_date: '2026-03-27', dispatch_date: '', status: 'pending', assigned_grader: '', warehouse_name: 'Nairobi Grain Storage', notes: 'Auction lot preparation' },
  { id: 'd-3', receipt_id: 'r-4', receipt_number: 'WR-20260318-3456', farmer_name: 'Claire Uwimana', commodity_type: 'Rice', quantity: 2000, quantity_unit: 'kg', destination: 'Kigali Central Market', requested_date: '2026-03-25', dispatch_date: '2026-03-26', status: 'dispatched', assigned_grader: 'Samuel Nkurunziza', warehouse_name: 'Kigali Cold Storage', notes: '' },
  { id: 'd-4', receipt_id: 'r-6', receipt_number: 'WR-20260325-2345', farmer_name: 'Kofi Asante', commodity_type: 'Cocoa', quantity: 600, quantity_unit: 'kg', destination: 'Tema Port Export', requested_date: '2026-03-29', dispatch_date: '', status: 'pending', assigned_grader: '', warehouse_name: 'Accra Commodity Depot', notes: 'For EU buyer' },
];

const demoGraders = [
  { id: 'g-1', name: 'Samuel Nkurunziza' },
  { id: 'g-2', name: 'Aisha Kamara' },
  { id: 'g-3', name: 'Peter Odhiambo' },
  { id: 'g-4', name: 'Fatima Diallo' },
  { id: 'g-5', name: 'Emmanuel Tetteh' },
];

// ── Helpers ──────────────────────────────────────────────────────────────
const statusColor: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  withdrawn: 'bg-gray-100 text-gray-600',
  expired: 'bg-red-100 text-red-600',
  financed: 'bg-blue-100 text-blue-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-600',
  completed: 'bg-blue-100 text-blue-700',
  disbursed: 'bg-purple-100 text-purple-700',
  dispatched: 'bg-indigo-100 text-indigo-700',
};

function formatCurrency(v: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(v);
}
function formatDate(d: string) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// ── Main Page ────────────────────────────────────────────────────────────
export default function AdminWarehousePage() {
  const { user, profile } = useAuth();
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [receipts, setReceipts] = useState<ReceiptRecord[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseRecord[]>([]);
  const [financing, setFinancing] = useState<FinancingRecord[]>([]);
  const [dispatches, setDispatches] = useState<DispatchRecord[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: whData } = await supabase.from('warehouses').select('*');
      if (whData && whData.length > 0) setWarehouses(whData);
      else setWarehouses(demoWarehouses);

      const resR = await fetch('/api/warehouse/receipts');
      if (resR.ok) { const j = await resR.json(); setReceipts(j.receipts?.length > 0 ? j.receipts : demoReceipts); }
      else setReceipts(demoReceipts);

      const resF = await fetch('/api/warehouse/financing');
      if (resF.ok) { const j = await resF.json(); setFinancing(j.financing?.length > 0 ? j.financing : demoFinancing); }
      else setFinancing(demoFinancing);

      const resD = await fetch('/api/warehouse/dispatches');
      if (resD.ok) { const j = await resD.json(); setDispatches(j.dispatches?.length > 0 ? j.dispatches : demoDispatches); }
      else setDispatches(demoDispatches);
    } catch {
      setWarehouses(demoWarehouses);
      setReceipts(demoReceipts);
      setFinancing(demoFinancing);
      setDispatches(demoDispatches);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const tabs = [
    { label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
    { label: 'Receipts', icon: <FileText className="w-4 h-4" /> },
    { label: 'Dispatches', icon: <Truck className="w-4 h-4" /> },
  ];

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium ${toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}
          >{toast.message}</motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1B2A4A]">Warehouse Management</h1>
        <p className="text-gray-500 text-sm">Monitor capacity, receipts, financing, and dispatches across the warehouse network</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 overflow-x-auto">
        {tabs.map((tab, i) => (
          <button key={i} onClick={() => setActiveTab(i)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${activeTab === i ? 'bg-white text-[#1B2A4A] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >{tab.icon}<span>{tab.label}</span></button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#5DB347]" /></div>
      ) : (
        <>
          {activeTab === 0 && <OverviewTab receipts={receipts} warehouses={warehouses} financing={financing} dispatches={dispatches} />}
          {activeTab === 1 && <ReceiptsTab receipts={receipts} financing={financing} onRefresh={fetchData} showToast={showToast} />}
          {activeTab === 2 && <DispatchesTab dispatches={dispatches} onRefresh={fetchData} showToast={showToast} />}
        </>
      )}
    </div>
  );
}

// ── Tab 1: Overview ──────────────────────────────────────────────────────
function OverviewTab({ receipts, warehouses, financing, dispatches }: {
  receipts: ReceiptRecord[];
  warehouses: WarehouseRecord[];
  financing: FinancingRecord[];
  dispatches: DispatchRecord[];
}) {
  const totalStoredValue = receipts.reduce((a, r) => a + (r.market_value || 0), 0);
  const totalReceipts = receipts.length;
  const pendingDispatches = dispatches.filter(d => d.status === 'pending').length;
  const activeFinancing = financing.filter(f => f.status === 'active' || f.status === 'disbursed');
  const totalFinanced = activeFinancing.reduce((a, f) => a + (f.approved_amount || f.requested_amount), 0);
  const totalCapacity = warehouses.reduce((a, w) => a + w.capacity_tonnes, 0);
  const totalStored = warehouses.reduce((a, w) => a + w.current_stock_tonnes, 0);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="text-xs text-gray-500 font-medium">Total Stored Value</span>
          </div>
          <p className="text-2xl font-bold text-[#1B2A4A]">{formatCurrency(totalStoredValue)}</p>
          <p className="text-xs text-gray-400 mt-1">Across {warehouses.length} warehouses</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-xs text-gray-500 font-medium">Total Receipts</span>
          </div>
          <p className="text-2xl font-bold text-[#1B2A4A]">{totalReceipts}</p>
          <p className="text-xs text-gray-400 mt-1">{receipts.filter(r => r.status === 'active').length} active, {receipts.filter(r => r.status === 'pending').length} pending</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
              <Truck className="w-5 h-5 text-orange-600" />
            </div>
            <span className="text-xs text-gray-500 font-medium">Pending Dispatches</span>
          </div>
          <p className="text-2xl font-bold text-[#1B2A4A]">{pendingDispatches}</p>
          <p className="text-xs text-gray-400 mt-1">{dispatches.filter(d => d.status === 'dispatched').length} already dispatched</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
              <Banknote className="w-5 h-5 text-indigo-600" />
            </div>
            <span className="text-xs text-gray-500 font-medium">Active Financing</span>
          </div>
          <p className="text-2xl font-bold text-[#1B2A4A]">{formatCurrency(totalFinanced)}</p>
          <p className="text-xs text-gray-400 mt-1">{activeFinancing.length} active loans, {financing.filter(f => f.status === 'pending').length} pending</p>
        </div>
      </div>

      {/* Multi-Warehouse Capacity Dashboard */}
      <div className="bg-white border border-gray-100 rounded-xl p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-semibold text-[#1B2A4A]">Warehouse Capacity Dashboard</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Network total: {totalStored.toLocaleString()}t of {totalCapacity.toLocaleString()}t ({Math.round((totalStored / totalCapacity) * 100)}% utilized)
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Available capacity</p>
            <p className="text-sm font-bold text-[#5DB347]">{(totalCapacity - totalStored).toLocaleString()}t</p>
          </div>
        </div>

        {/* Network-wide capacity bar */}
        <div className="mb-6">
          <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#5DB347] to-[#1B2A4A] transition-all"
              style={{ width: `${Math.round((totalStored / totalCapacity) * 100)}%` }}
            />
          </div>
        </div>

        {/* Per-warehouse bars */}
        <div className="space-y-4">
          {warehouses.map(wh => {
            const pct = Math.round((wh.current_stock_tonnes / wh.capacity_tonnes) * 100);
            return (
              <div key={wh.id} className="flex items-center gap-4">
                <div className="w-44 lg:w-56 shrink-0">
                  <p className="text-sm font-medium text-[#1B2A4A] truncate">{wh.name}</p>
                  <p className="text-[10px] text-gray-400 flex items-center gap-1"><MapPin className="w-2.5 h-2.5" />{wh.country}</p>
                </div>
                <div className="flex-1">
                  <div className="h-6 bg-gray-50 rounded-full overflow-hidden relative">
                    <div
                      className={`h-full rounded-full transition-all ${pct > 85 ? 'bg-red-400' : pct > 60 ? 'bg-yellow-400' : 'bg-[#5DB347]'}`}
                      style={{ width: `${pct}%` }}
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-gray-700">
                      {wh.current_stock_tonnes.toLocaleString()} / {wh.capacity_tonnes.toLocaleString()}t
                    </span>
                  </div>
                </div>
                <span className={`text-sm font-bold w-12 text-right ${pct > 85 ? 'text-red-500' : pct > 60 ? 'text-yellow-600' : 'text-[#5DB347]'}`}>
                  {pct}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two-column: Commodity Breakdown + Recent Activity */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Commodity Breakdown */}
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <h3 className="font-semibold text-[#1B2A4A] mb-4">Commodity Breakdown</h3>
          {(() => {
            const commodityMap: Record<string, number> = {};
            receipts.forEach(r => { commodityMap[r.commodity_type] = (commodityMap[r.commodity_type] || 0) + r.quantity; });
            const commodityData = Object.entries(commodityMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
            const colors = ['#5DB347', '#1B2A4A', '#F59E0B', '#3B82F6', '#EF4444', '#8B5CF6', '#EC4899'];
            const totalQty = commodityData.reduce((a, c) => a + c.value, 0);
            return (
              <div className="space-y-2">
                {commodityData.map((item, i) => {
                  const pct = Math.round((item.value / totalQty) * 100);
                  return (
                    <div key={item.name} className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: colors[i % colors.length] }} />
                      <span className="text-sm flex-1 truncate">{item.name}</span>
                      <span className="text-sm font-medium">{(item.value / 1000).toFixed(1)}t</span>
                      <span className="text-xs text-gray-400 w-10 text-right">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>

        {/* Recent Activity */}
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <h3 className="font-semibold text-[#1B2A4A] mb-4 flex items-center gap-2"><Activity className="w-4 h-4" /> Recent Activity</h3>
          <div className="space-y-2">
            {[...receipts].sort((a, b) => new Date(b.deposit_date).getTime() - new Date(a.deposit_date).getTime()).slice(0, 5).map(r => (
              <div key={r.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${r.status === 'active' ? 'bg-green-50' : r.status === 'financed' ? 'bg-blue-50' : 'bg-yellow-50'}`}>
                  <Package className={`w-4 h-4 ${r.status === 'active' ? 'text-green-600' : r.status === 'financed' ? 'text-blue-600' : 'text-yellow-600'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{r.farmer_name} deposited {r.commodity_type}</p>
                  <p className="text-xs text-gray-400">{r.receipt_number} - {r.quantity.toLocaleString()} {r.quantity_unit}</p>
                </div>
                <span className="text-xs text-gray-400 shrink-0">{formatDate(r.deposit_date)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Tab 2: Receipts (with financing controls) ────────────────────────────
function ReceiptsTab({ receipts, financing, onRefresh, showToast }: {
  receipts: ReceiptRecord[];
  financing: FinancingRecord[];
  onRefresh: () => void;
  showToast: (m: string, t?: 'success' | 'error') => void;
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [approveModal, setApproveModal] = useState<FinancingRecord | null>(null);
  const [approveForm, setApproveForm] = useState({ approved_amount: '', interest_rate: '12', duration_months: '6' });

  const filtered = receipts.filter(r => {
    const matchSearch = r.receipt_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.farmer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.commodity_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'all' || r.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const pendingFinancing = financing.filter(f => f.status === 'pending');

  const handleReceiptAction = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/warehouse/receipts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) { showToast(`Receipt ${status} successfully`); onRefresh(); }
      else showToast(`Action completed (demo)`, 'success');
    } catch { showToast('Action completed (demo)'); }
  };

  const handleFinancingApprove = async () => {
    if (!approveModal) return;
    const dueDate = new Date();
    dueDate.setMonth(dueDate.getMonth() + parseInt(approveForm.duration_months));
    try {
      const res = await fetch('/api/warehouse/financing', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: approveModal.id,
          status: 'active',
          approved_amount: parseFloat(approveForm.approved_amount),
          interest_rate: parseFloat(approveForm.interest_rate),
          duration_months: parseInt(approveForm.duration_months),
          disbursement_date: new Date().toISOString().slice(0, 10),
          due_date: dueDate.toISOString().slice(0, 10),
        }),
      });
      if (res.ok) showToast('Financing approved');
      else showToast('Financing approved (demo)');
    } catch { showToast('Financing approved (demo)'); }
    setApproveModal(null);
    onRefresh();
  };

  const handleFinancingReject = async (id: string) => {
    try {
      await fetch('/api/warehouse/financing', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'rejected' }),
      });
      showToast('Financing rejected');
    } catch { showToast('Financing rejected (demo)'); }
    onRefresh();
  };

  // Build financing lookup: receipt_id -> financing
  const financingByReceipt: Record<string, FinancingRecord> = {};
  financing.forEach(f => { financingByReceipt[f.receipt_id] = f; });

  return (
    <div className="space-y-5">
      {/* Pending Financing Requests Banner */}
      {pendingFinancing.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-amber-800 mb-3 flex items-center gap-2">
            <Banknote className="w-4 h-4" /> Pending Financing Requests ({pendingFinancing.length})
          </h4>
          <div className="space-y-2">
            {pendingFinancing.map(fin => (
              <div key={fin.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white rounded-lg p-3 border border-amber-100">
                <div>
                  <p className="text-sm font-medium text-[#1B2A4A]">{fin.receipt?.receipt_number || fin.receipt_id}</p>
                  <p className="text-xs text-gray-500">{fin.receipt?.commodity_type} - {fin.receipt?.farmer_name}</p>
                  <p className="text-sm mt-0.5">Requested: <strong className="text-[#1B2A4A]">{formatCurrency(fin.requested_amount)}</strong></p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => { setApproveModal(fin); setApproveForm({ approved_amount: String(fin.requested_amount), interest_rate: '12', duration_months: '6' }); }}
                    className="px-3 py-1.5 bg-[#5DB347] text-white rounded-lg text-xs font-medium hover:bg-[#4a9a39]"
                  >Approve</button>
                  <button
                    onClick={() => handleFinancingReject(fin.id)}
                    className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100"
                  >Reject</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search receipts, farmers, commodities..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30" />
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="financed">Financed</option>
          <option value="withdrawn">Withdrawn</option>
        </select>
      </div>

      {/* Receipts Table */}
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Receipt #</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Farmer</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">Commodity</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">Quantity</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 hidden lg:table-cell">Warehouse</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 hidden lg:table-cell">Financing</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 hidden lg:table-cell">Value</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => {
                const fin = financingByReceipt[r.id];
                return (
                  <React.Fragment key={r.id}>
                    <tr className="border-b border-gray-50 hover:bg-gray-50/50 cursor-pointer" onClick={() => setExpanded(expanded === r.id ? null : r.id)}>
                      <td className="px-4 py-3 font-medium text-[#1B2A4A]">{r.receipt_number}</td>
                      <td className="px-4 py-3">{r.farmer_name}</td>
                      <td className="px-4 py-3 hidden md:table-cell">{r.commodity_type}</td>
                      <td className="px-4 py-3 hidden md:table-cell">{r.quantity.toLocaleString()} {r.quantity_unit}</td>
                      <td className="px-4 py-3 hidden lg:table-cell text-xs">{r.warehouse?.name || '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[r.status] || 'bg-gray-100'}`}>{r.status}</span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        {fin ? (
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[fin.status] || 'bg-gray-100'}`}>
                            {fin.status === 'active' ? `${formatCurrency(fin.approved_amount)} active` : fin.status}
                          </span>
                        ) : <span className="text-xs text-gray-400">None</span>}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell font-medium">{formatCurrency(r.market_value || 0)}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                          {r.status === 'pending' && (
                            <button onClick={() => handleReceiptAction(r.id, 'active')} className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs font-medium hover:bg-green-100">Approve</button>
                          )}
                          {r.status === 'active' && (
                            <button onClick={() => handleReceiptAction(r.id, 'withdrawn')} className="px-2 py-1 bg-orange-50 text-orange-700 rounded text-xs font-medium hover:bg-orange-100">Release</button>
                          )}
                        </div>
                      </td>
                    </tr>
                    {expanded === r.id && (
                      <tr key={`${r.id}-detail`}>
                        <td colSpan={9} className="px-4 py-4 bg-gray-50">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div><p className="text-gray-400 text-xs">Grade</p><p className="font-medium">{r.grade || r.grade_estimate || 'Ungraded'}</p></div>
                            <div><p className="text-gray-400 text-xs">Deposit Date</p><p className="font-medium">{formatDate(r.deposit_date)}</p></div>
                            <div><p className="text-gray-400 text-xs">Warehouse</p><p className="font-medium">{r.warehouse?.name}</p></div>
                            <div><p className="text-gray-400 text-xs">Location</p><p className="font-medium">{r.warehouse?.location}</p></div>
                          </div>
                          {r.quality_inspection && r.quality_inspection.length > 0 && (
                            <div className="mt-3 bg-white rounded-lg p-3">
                              <p className="text-xs font-semibold text-[#1B2A4A] mb-2">Quality Inspection</p>
                              {r.quality_inspection.map(qi => (
                                <div key={qi.id} className="grid grid-cols-5 gap-2 text-xs">
                                  <div>Moisture: {qi.moisture_content}%</div>
                                  <div>Foreign: {qi.foreign_matter}%</div>
                                  <div>Damage: {qi.damage_percentage}%</div>
                                  <div>Aflatoxin: {qi.aflatoxin_level} ppb</div>
                                  <div className="font-semibold text-[#5DB347]">{qi.grade_assigned}</div>
                                </div>
                              ))}
                            </div>
                          )}
                          {fin && (
                            <div className="mt-3 bg-white rounded-lg p-3">
                              <p className="text-xs font-semibold text-[#1B2A4A] mb-2">Financing Details</p>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                                <div>Requested: <strong>{formatCurrency(fin.requested_amount)}</strong></div>
                                <div>Approved: <strong>{formatCurrency(fin.approved_amount)}</strong></div>
                                <div>Rate: <strong>{fin.interest_rate}%</strong></div>
                                <div>Due: <strong>{formatDate(fin.due_date)}</strong></div>
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-400">No receipts match your search</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Approve Financing Modal */}
      <AnimatePresence>
        {approveModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <h3 className="text-lg font-bold text-[#1B2A4A] mb-4">Approve Financing</h3>
              <p className="text-sm text-gray-500 mb-4">Receipt: {approveModal.receipt?.receipt_number} - {approveModal.receipt?.farmer_name}</p>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Disbursement Amount ($)</label>
                  <input type="number" value={approveForm.approved_amount} onChange={(e) => setApproveForm(f => ({ ...f, approved_amount: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Interest Rate (% p.a.)</label>
                  <input type="number" step="0.5" value={approveForm.interest_rate} onChange={(e) => setApproveForm(f => ({ ...f, interest_rate: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Duration (months)</label>
                  <input type="number" value={approveForm.duration_months} onChange={(e) => setApproveForm(f => ({ ...f, duration_months: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30" />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setApproveModal(null)} className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
                <button onClick={handleFinancingApprove} className="flex-1 py-2.5 bg-[#5DB347] text-white rounded-lg text-sm font-medium hover:bg-[#4a9a39]">Approve & Disburse</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Tab 3: Dispatches ────────────────────────────────────────────────────
function DispatchesTab({ dispatches: initialDispatches, onRefresh, showToast }: {
  dispatches: DispatchRecord[];
  onRefresh: () => void;
  showToast: (m: string, t?: 'success' | 'error') => void;
}) {
  const [dispatches, setDispatches] = useState(initialDispatches);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [graderSelections, setGraderSelections] = useState<Record<string, string>>({});

  // Sync with prop updates
  useEffect(() => { setDispatches(initialDispatches); }, [initialDispatches]);

  const pending = dispatches.filter(d => d.status === 'pending');
  const completed = dispatches.filter(d => d.status === 'dispatched');

  const filtered = dispatches.filter(d => {
    const matchSearch = d.receipt_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.farmer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.commodity_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.destination.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'all' || d.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleApproveDispatch = async (id: string) => {
    const grader = graderSelections[id];
    try {
      const res = await fetch('/api/warehouse/dispatches', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          status: 'dispatched',
          dispatch_date: new Date().toISOString().slice(0, 10),
          assigned_grader: grader || '',
        }),
      });
      if (res.ok) {
        showToast('Dispatch approved successfully');
        onRefresh();
      } else {
        // Demo mode fallback
        setDispatches(prev => prev.map(d =>
          d.id === id ? { ...d, status: 'dispatched', dispatch_date: new Date().toISOString().slice(0, 10), assigned_grader: grader || '' } : d
        ));
        showToast('Dispatch approved (demo)');
      }
    } catch {
      setDispatches(prev => prev.map(d =>
        d.id === id ? { ...d, status: 'dispatched', dispatch_date: new Date().toISOString().slice(0, 10), assigned_grader: grader || '' } : d
      ));
      showToast('Dispatch approved (demo)');
    }
  };

  return (
    <div className="space-y-5">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-100 rounded-xl p-4">
          <p className="text-xs text-gray-500">Total Dispatches</p>
          <p className="text-xl font-bold text-[#1B2A4A]">{dispatches.length}</p>
        </div>
        <div className="bg-white border border-yellow-100 rounded-xl p-4">
          <p className="text-xs text-gray-500">Pending Approval</p>
          <p className="text-xl font-bold text-yellow-600">{pending.length}</p>
        </div>
        <div className="bg-white border border-green-100 rounded-xl p-4">
          <p className="text-xs text-gray-500">Dispatched</p>
          <p className="text-xl font-bold text-green-600">{completed.length}</p>
        </div>
      </div>

      {/* Pending Dispatches - action area */}
      {pending.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <h3 className="font-semibold text-[#1B2A4A] mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-yellow-600" /> Pending Dispatches
          </h3>
          <div className="space-y-3">
            {pending.map(d => (
              <div key={d.id} className="border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-sm text-[#1B2A4A]">{d.receipt_number}</p>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-yellow-100 text-yellow-700">Pending</span>
                    </div>
                    <p className="text-xs text-gray-500">{d.farmer_name} - {d.commodity_type}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-xs">
                      <div>
                        <span className="text-gray-400">Quantity:</span>{' '}
                        <span className="font-medium">{d.quantity.toLocaleString()} {d.quantity_unit}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">From:</span>{' '}
                        <span className="font-medium">{d.warehouse_name}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">To:</span>{' '}
                        <span className="font-medium">{d.destination}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Requested:</span>{' '}
                        <span className="font-medium">{formatDate(d.requested_date)}</span>
                      </div>
                    </div>
                    {d.notes && <p className="text-xs text-gray-400 mt-1 italic">{d.notes}</p>}
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 shrink-0">
                    <select
                      value={graderSelections[d.id] || ''}
                      onChange={(e) => setGraderSelections(prev => ({ ...prev, [d.id]: e.target.value }))}
                      className="px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 w-full sm:w-auto"
                    >
                      <option value="">Assign grader...</option>
                      {demoGraders.map(g => (
                        <option key={g.id} value={g.name}>{g.name}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleApproveDispatch(d.id)}
                      className="px-4 py-2 bg-[#5DB347] text-white rounded-lg text-xs font-medium hover:bg-[#4a9a39] flex items-center gap-1.5 w-full sm:w-auto justify-center"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Approve Dispatch
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search dispatches, farmers, destinations..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30" />
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30">
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="dispatched">Dispatched</option>
        </select>
      </div>

      {/* All Dispatches Table */}
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Receipt #</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Farmer</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">Commodity</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">Qty</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 hidden lg:table-cell">Destination</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 hidden lg:table-cell">Grader</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 hidden lg:table-cell">Dispatch Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(d => (
                <tr key={d.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-medium text-[#1B2A4A]">{d.receipt_number}</td>
                  <td className="px-4 py-3">{d.farmer_name}</td>
                  <td className="px-4 py-3 hidden md:table-cell">{d.commodity_type}</td>
                  <td className="px-4 py-3 hidden md:table-cell">{d.quantity.toLocaleString()} {d.quantity_unit}</td>
                  <td className="px-4 py-3 hidden lg:table-cell text-xs">{d.destination}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[d.status] || 'bg-gray-100'}`}>{d.status}</span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-xs">{d.assigned_grader || '-'}</td>
                  <td className="px-4 py-3 hidden lg:table-cell text-xs">{formatDate(d.dispatch_date)}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">No dispatches match your search</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
