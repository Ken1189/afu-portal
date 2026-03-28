'use client';

import { useState, useEffect, useCallback } from 'react';
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
} from 'lucide-react';
import { useAuth } from '@/lib/supabase/auth-context';
import { createClient } from '@/lib/supabase/client';

// ── Types (same as farmer page) ───────────────────────────────────────────
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

// ── Demo Data ─────────────────────────────────────────────────────────────
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
];

const demoInspections: QualityInspection[] = [
  { id: 'qi-p1', receipt_id: 'r-3', moisture_content: 0, foreign_matter: 0, damage_percentage: 0, aflatoxin_level: 0, grade_assigned: '', status: 'pending', inspection_date: '', notes: '', receipt: demoReceipts[2] },
  { id: 'qi-p2', receipt_id: 'r-5', moisture_content: 0, foreign_matter: 0, damage_percentage: 0, aflatoxin_level: 0, grade_assigned: '', status: 'pending', inspection_date: '', notes: '', receipt: demoReceipts[4] },
];

const demoFinancing: FinancingRecord[] = [
  { id: 'fin-1', receipt_id: 'r-2', borrower_id: 'f-2', requested_amount: 3000, approved_amount: 2800, interest_rate: 12, duration_months: 6, status: 'active', due_date: '2026-09-10', disbursement_date: '2026-03-12', application_date: '2026-03-11', receipt: demoReceipts[1] },
  { id: 'fin-2', receipt_id: 'r-4', borrower_id: 'f-4', requested_amount: 2000, approved_amount: 0, interest_rate: 0, duration_months: 0, status: 'pending', due_date: '', disbursement_date: '', application_date: '2026-03-25', receipt: demoReceipts[3] },
];

// ── Helpers ────────────────────────────────────────────────────────────
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
};

function formatCurrency(v: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(v);
}
function formatDate(d: string) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

const gradeOptions = ['Grade A', 'Grade B', 'Grade C', 'Rejected'];

// ── Main Page ─────────────────────────────────────────────────────────────
export default function AdminWarehousePage() {
  const { user, profile } = useAuth();
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [receipts, setReceipts] = useState<ReceiptRecord[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseRecord[]>([]);
  const [inspections, setInspections] = useState<QualityInspection[]>([]);
  const [financing, setFinancing] = useState<FinancingRecord[]>([]);
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

      const resI = await fetch('/api/warehouse/inspections');
      if (resI.ok) { const j = await resI.json(); setInspections(j.inspections?.length > 0 ? j.inspections : demoInspections); }
      else setInspections(demoInspections);

      const resF = await fetch('/api/warehouse/financing');
      if (resF.ok) { const j = await resF.json(); setFinancing(j.financing?.length > 0 ? j.financing : demoFinancing); }
      else setFinancing(demoFinancing);
    } catch {
      setWarehouses(demoWarehouses);
      setReceipts(demoReceipts);
      setInspections(demoInspections);
      setFinancing(demoFinancing);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const tabs = [
    { label: 'Dashboard', icon: <BarChart3 className="w-4 h-4" /> },
    { label: 'Receipts', icon: <FileText className="w-4 h-4" /> },
    { label: 'Quality Inspections', icon: <ClipboardCheck className="w-4 h-4" /> },
    { label: 'Financing', icon: <DollarSign className="w-4 h-4" /> },
    { label: 'Warehouses', icon: <Warehouse className="w-4 h-4" /> },
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
        <p className="text-gray-500 text-sm">Manage warehouse receipts, quality inspections, and receipt financing</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 overflow-x-auto">
        {tabs.map((tab, i) => (
          <button key={i} onClick={() => setActiveTab(i)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${activeTab === i ? 'bg-white text-[#1B2A4A] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >{tab.icon}<span className="hidden sm:inline">{tab.label}</span></button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#5DB347]" /></div>
      ) : (
        <>
          {activeTab === 0 && <DashboardTab receipts={receipts} warehouses={warehouses} financing={financing} inspections={inspections} />}
          {activeTab === 1 && <ReceiptsTab receipts={receipts} onRefresh={fetchData} showToast={showToast} />}
          {activeTab === 2 && <InspectionsTab inspections={inspections} receipts={receipts} onRefresh={fetchData} showToast={showToast} />}
          {activeTab === 3 && <FinancingAdminTab financing={financing} onRefresh={fetchData} showToast={showToast} />}
          {activeTab === 4 && <WarehousesAdminTab warehouses={warehouses} onRefresh={fetchData} showToast={showToast} />}
        </>
      )}
    </div>
  );
}

// ── Tab 1: Dashboard ────────────────────────────────────────────────────
function DashboardTab({ receipts, warehouses, financing, inspections }: { receipts: ReceiptRecord[]; warehouses: WarehouseRecord[]; financing: FinancingRecord[]; inspections: QualityInspection[] }) {
  const totalStored = receipts.reduce((a, r) => a + r.quantity, 0) / 1000;
  const totalValue = receipts.reduce((a, r) => a + (r.market_value || 0), 0);
  const activeFinancing = financing.filter(f => f.status === 'active' || f.status === 'disbursed');
  const totalFinanced = activeFinancing.reduce((a, f) => a + (f.approved_amount || f.requested_amount), 0);

  const kpis = [
    { label: 'Total Warehouses', value: warehouses.length, icon: <Warehouse className="w-5 h-5" />, color: 'bg-blue-50 text-blue-600' },
    { label: 'Total Receipts', value: receipts.length, icon: <FileText className="w-5 h-5" />, color: 'bg-purple-50 text-purple-600' },
    { label: 'Active Receipts', value: receipts.filter(r => r.status === 'active').length, icon: <CheckCircle2 className="w-5 h-5" />, color: 'bg-green-50 text-green-600' },
    { label: 'Total Stored', value: `${totalStored.toFixed(1)}t`, icon: <Package className="w-5 h-5" />, color: 'bg-orange-50 text-orange-600' },
    { label: 'Total Value', value: formatCurrency(totalValue), icon: <DollarSign className="w-5 h-5" />, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Active Financing', value: formatCurrency(totalFinanced), icon: <Banknote className="w-5 h-5" />, color: 'bg-indigo-50 text-indigo-600' },
  ];

  // Commodity breakdown
  const commodityMap: Record<string, number> = {};
  receipts.forEach(r => { commodityMap[r.commodity_type] = (commodityMap[r.commodity_type] || 0) + r.quantity; });
  const commodityData = Object.entries(commodityMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  const pieColors = ['#5DB347', '#1B2A4A', '#F59E0B', '#3B82F6', '#EF4444', '#8B5CF6', '#EC4899'];

  // Recent activity
  const recentReceipts = [...receipts].sort((a, b) => new Date(b.deposit_date).getTime() - new Date(a.deposit_date).getTime()).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map((kpi, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-xl p-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2 ${kpi.color}`}>{kpi.icon}</div>
            <p className="text-xs text-gray-500">{kpi.label}</p>
            <p className="text-lg font-bold text-[#1B2A4A]">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Capacity by Warehouse */}
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <h3 className="font-semibold text-[#1B2A4A] mb-4">Capacity Utilization</h3>
          <div className="space-y-3">
            {warehouses.map(wh => {
              const pct = Math.round((wh.current_stock_tonnes / wh.capacity_tonnes) * 100);
              return (
                <div key={wh.id}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-gray-700 truncate">{wh.name}</span>
                    <span className="text-gray-500">{pct}%</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${pct > 85 ? 'bg-red-400' : pct > 60 ? 'bg-yellow-400' : 'bg-[#5DB347]'}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Commodity Breakdown */}
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <h3 className="font-semibold text-[#1B2A4A] mb-4">Commodity Breakdown</h3>
          <div className="space-y-2">
            {commodityData.map((item, i) => {
              const totalQty = commodityData.reduce((a, c) => a + c.value, 0);
              const pct = Math.round((item.value / totalQty) * 100);
              return (
                <div key={item.name} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: pieColors[i % pieColors.length] }} />
                  <span className="text-sm flex-1 truncate">{item.name}</span>
                  <span className="text-sm font-medium">{(item.value / 1000).toFixed(1)}t</span>
                  <span className="text-xs text-gray-400 w-10 text-right">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white border border-gray-100 rounded-xl p-5">
        <h3 className="font-semibold text-[#1B2A4A] mb-4 flex items-center gap-2"><Activity className="w-4 h-4" /> Recent Activity</h3>
        <div className="space-y-2">
          {recentReceipts.map(r => (
            <div key={r.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${r.status === 'active' ? 'bg-green-50' : 'bg-yellow-50'}`}>
                <Package className={`w-4 h-4 ${r.status === 'active' ? 'text-green-600' : 'text-yellow-600'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{r.farmer_name} deposited {r.commodity_type}</p>
                <p className="text-xs text-gray-400">{r.receipt_number} - {r.quantity.toLocaleString()} {r.quantity_unit}</p>
              </div>
              <span className="text-xs text-gray-400 shrink-0">{formatDate(r.deposit_date)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Tab 2: Receipts ─────────────────────────────────────────────────────
function ReceiptsTab({ receipts, onRefresh, showToast }: { receipts: ReceiptRecord[]; onRefresh: () => void; showToast: (m: string, t?: 'success' | 'error') => void }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = receipts.filter(r => {
    const matchSearch = r.receipt_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.farmer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.commodity_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'all' || r.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleAction = async (id: string, status: string) => {
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

  return (
    <div className="space-y-4">
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
          <option value="withdrawn">Withdrawn</option>
        </select>
      </div>

      {/* Table */}
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
                <th className="text-left px-4 py-3 font-medium text-gray-500 hidden lg:table-cell">Value</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <>
                  <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50/50 cursor-pointer" onClick={() => setExpanded(expanded === r.id ? null : r.id)}>
                    <td className="px-4 py-3 font-medium text-[#1B2A4A]">{r.receipt_number}</td>
                    <td className="px-4 py-3">{r.farmer_name}</td>
                    <td className="px-4 py-3 hidden md:table-cell">{r.commodity_type}</td>
                    <td className="px-4 py-3 hidden md:table-cell">{r.quantity.toLocaleString()} {r.quantity_unit}</td>
                    <td className="px-4 py-3 hidden lg:table-cell text-xs">{r.warehouse?.name || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[r.status] || 'bg-gray-100'}`}>{r.status}</span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell font-medium">{formatCurrency(r.market_value || 0)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                        {r.status === 'pending' && (
                          <button onClick={() => handleAction(r.id, 'active')} className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs font-medium hover:bg-green-100">Approve</button>
                        )}
                        {r.status === 'active' && (
                          <button onClick={() => handleAction(r.id, 'withdrawn')} className="px-2 py-1 bg-orange-50 text-orange-700 rounded text-xs font-medium hover:bg-orange-100">Release</button>
                        )}
                      </div>
                    </td>
                  </tr>
                  {expanded === r.id && (
                    <tr key={`${r.id}-detail`}>
                      <td colSpan={8} className="px-4 py-4 bg-gray-50">
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
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Tab 3: Quality Inspections ──────────────────────────────────────────
function InspectionsTab({ inspections, receipts, onRefresh, showToast }: { inspections: QualityInspection[]; receipts: ReceiptRecord[]; onRefresh: () => void; showToast: (m: string, t?: 'success' | 'error') => void }) {
  const [showForm, setShowForm] = useState(false);
  const [formReceiptId, setFormReceiptId] = useState('');
  const [form, setForm] = useState({ moisture_content: '', foreign_matter: '', damage_percentage: '', aflatoxin_level: '', grade_assigned: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);

  const pendingReceipts = receipts.filter(r => r.status === 'pending' && (!r.quality_inspection || r.quality_inspection.length === 0));

  const handleSubmitInspection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formReceiptId) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/warehouse/inspections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receipt_id: formReceiptId,
          moisture_content: parseFloat(form.moisture_content),
          foreign_matter: parseFloat(form.foreign_matter),
          damage_percentage: parseFloat(form.damage_percentage),
          aflatoxin_level: parseFloat(form.aflatoxin_level),
          grade_assigned: form.grade_assigned,
          notes: form.notes,
        }),
      });
      if (res.ok) {
        showToast('Inspection submitted and receipt graded');
        setShowForm(false);
        setForm({ moisture_content: '', foreign_matter: '', damage_percentage: '', aflatoxin_level: '', grade_assigned: '', notes: '' });
        setFormReceiptId('');
        onRefresh();
      } else {
        showToast('Inspection saved (demo mode)');
        setShowForm(false);
        onRefresh();
      }
    } catch {
      showToast('Inspection saved (demo mode)');
      setShowForm(false);
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#1B2A4A]">Quality Inspections</h3>
        <button onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-[#5DB347] text-white rounded-lg text-sm font-medium hover:bg-[#4a9a39] flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Inspection
        </button>
      </div>

      {/* Inspection Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <form onSubmit={handleSubmitInspection} className="bg-white border border-gray-100 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-[#1B2A4A]">New Quality Inspection</h4>
                <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Select Receipt</label>
                <select value={formReceiptId} onChange={(e) => setFormReceiptId(e.target.value)} required
                  className="w-full mt-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30">
                  <option value="">Choose a pending receipt...</option>
                  {pendingReceipts.map(r => (
                    <option key={r.id} value={r.id}>{r.receipt_number} - {r.farmer_name} - {r.commodity_type} ({r.quantity} {r.quantity_unit})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600">Moisture %</label>
                  <input type="number" step="0.1" value={form.moisture_content} onChange={(e) => setForm(f => ({ ...f, moisture_content: e.target.value }))} required
                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Foreign Matter %</label>
                  <input type="number" step="0.1" value={form.foreign_matter} onChange={(e) => setForm(f => ({ ...f, foreign_matter: e.target.value }))} required
                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Damage %</label>
                  <input type="number" step="0.1" value={form.damage_percentage} onChange={(e) => setForm(f => ({ ...f, damage_percentage: e.target.value }))} required
                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Aflatoxin (ppb)</label>
                  <input type="number" step="0.1" value={form.aflatoxin_level} onChange={(e) => setForm(f => ({ ...f, aflatoxin_level: e.target.value }))} required
                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600">Grade Assignment</label>
                  <select value={form.grade_assigned} onChange={(e) => setForm(f => ({ ...f, grade_assigned: e.target.value }))} required
                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30">
                    <option value="">Select grade...</option>
                    {gradeOptions.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Notes</label>
                  <input type="text" value={form.notes} onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30" placeholder="Optional notes" />
                </div>
              </div>
              <button type="submit" disabled={submitting}
                className="px-6 py-2.5 bg-[#5DB347] text-white rounded-lg text-sm font-medium hover:bg-[#4a9a39] disabled:opacity-50 flex items-center gap-2">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Submit Inspection
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pending Queue */}
      {pendingReceipts.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4">
          <h4 className="font-semibold text-sm text-yellow-800 mb-2 flex items-center gap-2"><Clock className="w-4 h-4" /> Pending Inspections ({pendingReceipts.length})</h4>
          <div className="space-y-2">
            {pendingReceipts.map(r => (
              <div key={r.id} className="flex items-center justify-between bg-white rounded-lg p-3">
                <div>
                  <p className="text-sm font-medium">{r.receipt_number} - {r.farmer_name}</p>
                  <p className="text-xs text-gray-500">{r.commodity_type} - {r.quantity.toLocaleString()} {r.quantity_unit}</p>
                </div>
                <button onClick={() => { setFormReceiptId(r.id); setShowForm(true); }}
                  className="px-3 py-1.5 bg-[#5DB347] text-white rounded text-xs font-medium hover:bg-[#4a9a39]">
                  Inspect
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed Inspections */}
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Receipt</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">Moisture</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">Foreign</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">Damage</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 hidden lg:table-cell">Aflatoxin</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Grade</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 hidden lg:table-cell">Date</th>
              </tr>
            </thead>
            <tbody>
              {inspections.filter(i => i.status !== 'pending').map(insp => (
                <tr key={insp.id} className="border-b border-gray-50">
                  <td className="px-4 py-3 font-medium">{(insp.receipt as ReceiptRecord)?.receipt_number || insp.receipt_id}</td>
                  <td className="px-4 py-3 hidden md:table-cell">{insp.moisture_content}%</td>
                  <td className="px-4 py-3 hidden md:table-cell">{insp.foreign_matter}%</td>
                  <td className="px-4 py-3 hidden md:table-cell">{insp.damage_percentage}%</td>
                  <td className="px-4 py-3 hidden lg:table-cell">{insp.aflatoxin_level} ppb</td>
                  <td className="px-4 py-3 font-semibold text-[#5DB347]">{insp.grade_assigned}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[insp.status] || 'bg-gray-100'}`}>{insp.status}</span></td>
                  <td className="px-4 py-3 hidden lg:table-cell text-xs">{formatDate(insp.inspection_date)}</td>
                </tr>
              ))}
              {inspections.filter(i => i.status !== 'pending').length === 0 && (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">No completed inspections yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Tab 4: Financing Admin ──────────────────────────────────────────────
function FinancingAdminTab({ financing, onRefresh, showToast }: { financing: FinancingRecord[]; onRefresh: () => void; showToast: (m: string, t?: 'success' | 'error') => void }) {
  const [approveModal, setApproveModal] = useState<FinancingRecord | null>(null);
  const [approveForm, setApproveForm] = useState({ approved_amount: '', interest_rate: '12', duration_months: '6' });

  const pending = financing.filter(f => f.status === 'pending');
  const active = financing.filter(f => f.status === 'active' || f.status === 'disbursed');
  const totalExposure = active.reduce((a, f) => a + (f.approved_amount || f.requested_amount), 0);

  const handleApprove = async () => {
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
      if (res.ok) { showToast('Financing approved'); }
      else { showToast('Financing approved (demo)'); }
    } catch { showToast('Financing approved (demo)'); }
    setApproveModal(null);
    onRefresh();
  };

  const handleReject = async (id: string) => {
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

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white border border-gray-100 rounded-xl p-4">
          <p className="text-xs text-gray-500">Total Applications</p>
          <p className="text-xl font-bold text-[#1B2A4A]">{financing.length}</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-4">
          <p className="text-xs text-gray-500">Pending</p>
          <p className="text-xl font-bold text-yellow-600">{pending.length}</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-4">
          <p className="text-xs text-gray-500">Active Loans</p>
          <p className="text-xl font-bold text-green-600">{active.length}</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-4">
          <p className="text-xs text-gray-500">Total Exposure</p>
          <p className="text-xl font-bold text-[#5DB347]">{formatCurrency(totalExposure)}</p>
        </div>
      </div>

      {/* Pending Requests */}
      {pending.length > 0 && (
        <div>
          <h3 className="font-semibold text-[#1B2A4A] mb-3">Pending Requests</h3>
          <div className="space-y-3">
            {pending.map(fin => (
              <div key={fin.id} className="bg-white border border-yellow-100 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="font-semibold text-sm">{fin.receipt?.receipt_number || fin.receipt_id}</p>
                  <p className="text-xs text-gray-500">{fin.receipt?.commodity_type} - {fin.receipt?.farmer_name}</p>
                  <p className="text-sm mt-1">Requested: <strong>{formatCurrency(fin.requested_amount)}</strong></p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setApproveModal(fin); setApproveForm({ approved_amount: String(fin.requested_amount), interest_rate: '12', duration_months: '6' }); }}
                    className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600">Approve</button>
                  <button onClick={() => handleReject(fin.id)}
                    className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100">Reject</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Approve Modal */}
      <AnimatePresence>
        {approveModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <h3 className="text-lg font-bold text-[#1B2A4A] mb-4">Approve Financing</h3>
              <p className="text-sm text-gray-500 mb-4">Receipt: {approveModal.receipt?.receipt_number}</p>
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
                <button onClick={handleApprove} className="flex-1 py-2.5 bg-[#5DB347] text-white rounded-lg text-sm font-medium hover:bg-[#4a9a39]">Approve & Disburse</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Loans */}
      <div>
        <h3 className="font-semibold text-[#1B2A4A] mb-3">Active Loans</h3>
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Receipt</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Amount</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">Rate</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">Duration</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 hidden lg:table-cell">Due Date</th>
                </tr>
              </thead>
              <tbody>
                {active.map(fin => (
                  <tr key={fin.id} className="border-b border-gray-50">
                    <td className="px-4 py-3 font-medium">{fin.receipt?.receipt_number || fin.receipt_id}</td>
                    <td className="px-4 py-3 font-semibold">{formatCurrency(fin.approved_amount || fin.requested_amount)}</td>
                    <td className="px-4 py-3 hidden md:table-cell">{fin.interest_rate}%</td>
                    <td className="px-4 py-3 hidden md:table-cell">{fin.duration_months}mo</td>
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[fin.status] || 'bg-gray-100'}`}>{fin.status}</span></td>
                    <td className="px-4 py-3 hidden lg:table-cell text-xs">{formatDate(fin.due_date)}</td>
                  </tr>
                ))}
                {active.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No active loans</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Tab 5: Warehouses Admin ─────────────────────────────────────────────
function WarehousesAdminTab({ warehouses, onRefresh, showToast }: { warehouses: WarehouseRecord[]; onRefresh: () => void; showToast: (m: string, t?: 'success' | 'error') => void }) {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', location: '', country: '', capacity_tonnes: '', contact_phone: '', contact_email: '', manager_name: '' });

  const supabase = createClient();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name: form.name,
      location: form.location,
      country: form.country,
      capacity_tonnes: parseInt(form.capacity_tonnes),
      current_stock_tonnes: 0,
      contact_phone: form.contact_phone,
      contact_email: form.contact_email,
      manager_name: form.manager_name,
      status: 'active',
      certifications: [],
    };

    try {
      if (editId) {
        const { error } = await supabase.from('warehouses').update(data).eq('id', editId);
        if (!error) showToast('Warehouse updated');
        else showToast('Updated (demo)');
      } else {
        const { error } = await supabase.from('warehouses').insert(data);
        if (!error) showToast('Warehouse created');
        else showToast('Created (demo)');
      }
    } catch {
      showToast(`${editId ? 'Updated' : 'Created'} (demo)`);
    }
    setShowForm(false);
    setEditId(null);
    setForm({ name: '', location: '', country: '', capacity_tonnes: '', contact_phone: '', contact_email: '', manager_name: '' });
    onRefresh();
  };

  const handleEdit = (wh: WarehouseRecord) => {
    setEditId(wh.id);
    setForm({
      name: wh.name, location: wh.location, country: wh.country,
      capacity_tonnes: String(wh.capacity_tonnes), contact_phone: wh.contact_phone,
      contact_email: wh.contact_email, manager_name: wh.manager_name,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await supabase.from('warehouses').delete().eq('id', id);
      showToast('Warehouse deleted');
    } catch { showToast('Deleted (demo)'); }
    onRefresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#1B2A4A]">Warehouse Network</h3>
        <button onClick={() => { setEditId(null); setForm({ name: '', location: '', country: '', capacity_tonnes: '', contact_phone: '', contact_email: '', manager_name: '' }); setShowForm(true); }}
          className="px-4 py-2 bg-[#5DB347] text-white rounded-lg text-sm font-medium hover:bg-[#4a9a39] flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Warehouse
        </button>
      </div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <form onSubmit={handleSave} className="bg-white border border-gray-100 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-[#1B2A4A]">{editId ? 'Edit Warehouse' : 'Add New Warehouse'}</h4>
                <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600">Warehouse Name</label>
                  <input type="text" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} required
                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Location</label>
                  <input type="text" value={form.location} onChange={(e) => setForm(f => ({ ...f, location: e.target.value }))} required
                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Country</label>
                  <input type="text" value={form.country} onChange={(e) => setForm(f => ({ ...f, country: e.target.value }))} required
                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Capacity (tonnes)</label>
                  <input type="number" value={form.capacity_tonnes} onChange={(e) => setForm(f => ({ ...f, capacity_tonnes: e.target.value }))} required
                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Manager Name</label>
                  <input type="text" value={form.manager_name} onChange={(e) => setForm(f => ({ ...f, manager_name: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Phone</label>
                  <input type="text" value={form.contact_phone} onChange={(e) => setForm(f => ({ ...f, contact_phone: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-medium text-gray-600">Email</label>
                  <input type="email" value={form.contact_email} onChange={(e) => setForm(f => ({ ...f, contact_email: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30" />
                </div>
              </div>
              <button type="submit" className="px-6 py-2.5 bg-[#5DB347] text-white rounded-lg text-sm font-medium hover:bg-[#4a9a39] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> {editId ? 'Update Warehouse' : 'Create Warehouse'}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Warehouse Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {warehouses.map(wh => {
          const pct = Math.round((wh.current_stock_tonnes / wh.capacity_tonnes) * 100);
          return (
            <div key={wh.id} className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-[#1B2A4A] text-sm">{wh.name}</h4>
                  <p className="text-xs text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3" /> {wh.location}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(wh)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"><Edit className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(wh.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              <div className="mb-2">
                <div className="flex justify-between text-xs mb-1">
                  <span>{pct}% utilized</span>
                  <span>{wh.current_stock_tonnes.toLocaleString()} / {wh.capacity_tonnes.toLocaleString()}t</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${pct > 85 ? 'bg-red-400' : pct > 60 ? 'bg-yellow-400' : 'bg-[#5DB347]'}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
              {wh.certifications && wh.certifications.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {wh.certifications.map(c => <span key={c} className="px-1.5 py-0.5 bg-green-50 text-green-700 rounded text-[10px] font-medium">{c}</span>)}
                </div>
              )}
              <div className="text-xs text-gray-500 space-y-0.5">
                <p>Manager: {wh.manager_name}</p>
                <p>{wh.contact_phone} | {wh.contact_email}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
