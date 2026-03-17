'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Ship,
  FileText,
  Globe,
  Package,
  Clock,
  DollarSign,
  MapPin,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Anchor,
  Plane,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Timer,
  Thermometer,
  Container,
  TrendingUp,
  Search,
  Filter,
  Plus,
  Receipt,
  Leaf,
  Box,
  Eye,
  Send,
  BarChart3,
  Users,
  Calendar,
} from 'lucide-react';
import {
  exportShipments,
  exportDocuments,
  type ExportShipment,
  type ShipmentStatus,
  type DocumentStatus,
} from '@/lib/data/exports';

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 100, damping: 15 },
  },
};

// ---------------------------------------------------------------------------
// Helpers & Constants
// ---------------------------------------------------------------------------

type TabType = 'active' | 'history' | 'actions';

const STATUS_STYLES: Record<ShipmentStatus, string> = {
  preparing: 'bg-amber-50 text-amber-700 border-amber-200',
  'customs-clearance': 'bg-blue-50 text-blue-700 border-blue-200',
  'in-transit': 'bg-purple-50 text-purple-700 border-purple-200',
  'at-port': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  delivered: 'bg-green-50 text-green-700 border-green-200',
};

const STATUS_LABELS: Record<ShipmentStatus, string> = {
  preparing: 'Preparing',
  'customs-clearance': 'Customs Clearance',
  'in-transit': 'In Transit',
  'at-port': 'At Port',
  delivered: 'Delivered',
};

const DOC_STATUS_STYLES: Record<DocumentStatus, string> = {
  'not-started': 'bg-gray-50 text-gray-500 border-gray-200',
  'in-progress': 'bg-amber-50 text-amber-700 border-amber-200',
  submitted: 'bg-blue-50 text-blue-700 border-blue-200',
  approved: 'bg-green-50 text-green-700 border-green-200',
  rejected: 'bg-red-50 text-red-600 border-red-200',
};

const DOC_STATUS_LABELS: Record<DocumentStatus, string> = {
  'not-started': 'Not Started',
  'in-progress': 'In Progress',
  submitted: 'Submitted',
  approved: 'Approved',
  rejected: 'Rejected',
};

const COUNTRY_FLAGS: Record<string, string> = {
  Netherlands: '🇳🇱',
  'United Arab Emirates': '🇦🇪',
  India: '🇮🇳',
  'Saudi Arabia': '🇸🇦',
  Germany: '🇩🇪',
  'United Kingdom': '🇬🇧',
  China: '🇨🇳',
  Japan: '🇯🇵',
  Kenya: '🇰🇪',
  'South Africa': '🇿🇦',
};

function formatCurrency(amount: number, currency: string = 'USD'): string {
  return `$${amount.toLocaleString()}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function daysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function getShipmentDocs(shipment: ExportShipment) {
  return exportDocuments.filter((d) => shipment.documents.includes(d.id));
}

// ---------------------------------------------------------------------------
// Quick Action Item
// ---------------------------------------------------------------------------

interface QuickAction {
  icon: React.ReactNode;
  label: string;
  description: string;
  color: string;
  bgColor: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    icon: <Plus className="w-6 h-6" />,
    label: 'New Shipment',
    description: 'Create a new export shipment booking',
    color: 'text-[#1B2A4A]',
    bgColor: 'bg-[#1B2A4A]/10',
  },
  {
    icon: <Receipt className="w-6 h-6" />,
    label: 'Create Invoice',
    description: 'Generate a commercial invoice for export',
    color: 'text-[#2AA198]',
    bgColor: 'bg-[#2AA198]/10',
  },
  {
    icon: <Leaf className="w-6 h-6" />,
    label: 'Phyto Certificate',
    description: 'Apply for phytosanitary certification',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    icon: <Container className="w-6 h-6" />,
    label: 'Book Container',
    description: 'Reserve shipping containers for cargo',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
  },
  {
    icon: <Search className="w-6 h-6" />,
    label: 'Track Shipment',
    description: 'Track a shipment by reference number',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  {
    icon: <Eye className="w-6 h-6" />,
    label: 'View Compliance',
    description: 'Check compliance requirements and status',
    color: 'text-[#D4A843]',
    bgColor: 'bg-[#D4A843]/10',
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    label: 'Market Research',
    description: 'Explore market prices and opportunities',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    icon: <Users className="w-6 h-6" />,
    label: 'Contact Buyer',
    description: 'Reach out to an international buyer',
    color: 'text-rose-600',
    bgColor: 'bg-rose-50',
  },
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  color: string;
}) {
  return (
    <motion.div
      variants={cardVariants}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-2"
    >
      <div className="flex items-center gap-2">
        <div className={`p-2 rounded-xl ${color}`}>{icon}</div>
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          {label}
        </span>
      </div>
      <p className="text-2xl font-bold text-[#1B2A4A]">{value}</p>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </motion.div>
  );
}

function TimelineEvent({
  event,
  isLast,
}: {
  event: { date: string; event: string; location: string };
  isLast: boolean;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className="w-2.5 h-2.5 rounded-full bg-[#2AA198] ring-4 ring-[#2AA198]/20 mt-1.5" />
        {!isLast && <div className="w-0.5 flex-1 bg-gray-200 mt-1" />}
      </div>
      <div className="pb-4">
        <p className="text-sm font-medium text-[#1B2A4A]">{event.event}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-gray-400">{formatDate(event.date)}</span>
          <span className="text-xs text-gray-300">|</span>
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {event.location}
          </span>
        </div>
      </div>
    </div>
  );
}

function ShipmentCard({ shipment }: { shipment: ExportShipment }) {
  const [expanded, setExpanded] = useState(false);
  const docs = getShipmentDocs(shipment);
  const approvedDocs = docs.filter((d) => d.status === 'approved').length;
  const totalDocs = docs.length;
  const eta = daysUntil(shipment.estimatedArrival);
  const isAir = shipment.originPort.toLowerCase().includes('airport');
  const isColdChain =
    shipment.product.toLowerCase().includes('flower') ||
    shipment.product.toLowerCase().includes('citrus');

  return (
    <motion.div
      variants={cardVariants}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
    >
      <div className="p-5">
        {/* Header: reference + status */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#1B2A4A]/10">
              {isAir ? (
                <Plane className="w-5 h-5 text-[#1B2A4A]" />
              ) : (
                <Ship className="w-5 h-5 text-[#1B2A4A]" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1B2A4A]">
                {shipment.id}
              </h3>
              <p className="text-xs text-gray-400">
                {shipment.exporterName}
              </p>
            </div>
          </div>
          <span
            className={`text-xs font-semibold px-3 py-1 rounded-full border ${STATUS_STYLES[shipment.status]}`}
          >
            {STATUS_LABELS[shipment.status]}
          </span>
        </div>

        {/* Route */}
        <div className="flex items-center gap-2 mb-3 bg-gray-50 rounded-xl p-3">
          <div className="flex-1">
            <p className="text-xs text-gray-400 uppercase tracking-wide">
              Origin
            </p>
            <p className="text-sm font-semibold text-[#1B2A4A]">
              {shipment.originPort}
            </p>
          </div>
          <div className="flex items-center gap-1 text-[#2AA198]">
            <div className="w-8 h-px bg-[#2AA198]" />
            {isAir ? (
              <Plane className="w-4 h-4" />
            ) : (
              <Ship className="w-4 h-4" />
            )}
            <div className="w-8 h-px bg-[#2AA198]" />
          </div>
          <div className="flex-1 text-right">
            <p className="text-xs text-gray-400 uppercase tracking-wide">
              Destination
            </p>
            <p className="text-sm font-semibold text-[#1B2A4A]">
              {shipment.destinationPort}
            </p>
          </div>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
          <div>
            <p className="text-xs text-gray-400">Product</p>
            <p className="text-sm font-medium text-[#1B2A4A]">
              {shipment.product}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Quantity</p>
            <p className="text-sm font-medium text-[#1B2A4A]">
              {shipment.quantity}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Buyer Country</p>
            <p className="text-sm font-medium text-[#1B2A4A]">
              {COUNTRY_FLAGS[shipment.destination] || ''}{' '}
              {shipment.destination}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Value (FOB)</p>
            <p className="text-sm font-bold text-[#2AA198]">
              {formatCurrency(shipment.value, shipment.currency)}
            </p>
          </div>
        </div>

        {/* ETA + Documents + Container */}
        <div className="flex flex-wrap items-center gap-3">
          {shipment.vessel && (
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg flex items-center gap-1">
              <Anchor className="w-3 h-3" />
              {shipment.vessel}
            </span>
          )}
          <span className="text-xs bg-[#2AA198]/10 text-[#2AA198] px-2 py-1 rounded-lg flex items-center gap-1">
            <Timer className="w-3 h-3" />
            ETA: {formatDate(shipment.estimatedArrival)}{' '}
            {eta > 0 ? `(${eta} days)` : eta === 0 ? '(Today!)' : '(Arrived)'}
          </span>
          <span
            className={`text-xs px-2 py-1 rounded-lg flex items-center gap-1 ${
              approvedDocs === totalDocs
                ? 'bg-green-50 text-green-700'
                : 'bg-amber-50 text-amber-700'
            }`}
          >
            <FileText className="w-3 h-3" />
            Docs: {approvedDocs}/{totalDocs}
          </span>
          {isColdChain && (
            <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-lg flex items-center gap-1">
              <Thermometer className="w-3 h-3" />
              Cold Chain
            </span>
          )}
        </div>

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 flex items-center gap-1 text-xs font-medium text-[#2AA198] hover:text-[#1B2A4A] transition-colors"
        >
          {expanded ? (
            <>
              <ChevronUp className="w-4 h-4" /> Hide Details
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" /> Show Details
            </>
          )}
        </button>
      </div>

      {/* Expanded section */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 100, damping: 15 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t border-gray-100 pt-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Timeline */}
                <div>
                  <h4 className="text-sm font-bold text-[#1B2A4A] mb-3">
                    Shipment Timeline
                  </h4>
                  <div className="space-y-0">
                    {shipment.timeline.map((event, i) => (
                      <TimelineEvent
                        key={i}
                        event={event}
                        isLast={i === shipment.timeline.length - 1}
                      />
                    ))}
                  </div>
                </div>

                {/* Documents */}
                <div>
                  <h4 className="text-sm font-bold text-[#1B2A4A] mb-3">
                    Documents
                  </h4>
                  <div className="space-y-2">
                    {docs.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {doc.status === 'approved' ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                          ) : doc.status === 'rejected' ? (
                            <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                          )}
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-[#1B2A4A] truncate">
                              {doc.title}
                            </p>
                            <p className="text-[10px] text-gray-400">
                              {doc.reference}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${DOC_STATUS_STYLES[doc.status]}`}
                        >
                          {DOC_STATUS_LABELS[doc.status]}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Cold chain info */}
                  {isColdChain && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Thermometer className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-bold text-blue-800">
                          Cold Chain Monitoring
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <p className="text-[10px] text-blue-500">
                            Set Point
                          </p>
                          <p className="text-sm font-bold text-blue-800">
                            2-4 C
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-blue-500">Current</p>
                          <p className="text-sm font-bold text-blue-800">
                            3.2 C
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-blue-500">Humidity</p>
                          <p className="text-sm font-bold text-blue-800">
                            92%
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function HistoryCard({ shipment }: { shipment: ExportShipment }) {
  return (
    <motion.div
      variants={cardVariants}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-[#1B2A4A]">
            {shipment.id}
          </span>
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_STYLES[shipment.status]}`}
          >
            {STATUS_LABELS[shipment.status]}
          </span>
        </div>
        <span className="text-sm font-bold text-[#2AA198]">
          {formatCurrency(shipment.value)}
        </span>
      </div>
      <p className="text-sm text-gray-600 mb-1">{shipment.product}</p>
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <span>
          {shipment.originPort} &rarr; {shipment.destinationPort}
        </span>
        <span className="text-gray-300">|</span>
        <span>{shipment.quantity}</span>
      </div>
      <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
        <Calendar className="w-3 h-3" />
        <span>Depart: {formatDate(shipment.estimatedDeparture)}</span>
        <span className="text-gray-300">|</span>
        <span>Arrive: {formatDate(shipment.estimatedArrival)}</span>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function ExportHubPage() {
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [historyFilter, setHistoryFilter] = useState<ShipmentStatus | 'all'>(
    'all'
  );
  const [historySearch, setHistorySearch] = useState('');

  // Computed data
  const activeShipments = useMemo(
    () =>
      exportShipments.filter(
        (s) =>
          s.status === 'in-transit' ||
          s.status === 'at-port' ||
          s.status === 'customs-clearance' ||
          s.status === 'preparing'
      ),
    []
  );

  const totalExportValue = useMemo(
    () => exportShipments.reduce((sum, s) => sum + s.value, 0),
    []
  );

  const pendingDocs = useMemo(
    () =>
      exportDocuments.filter(
        (d) =>
          d.status === 'in-progress' ||
          d.status === 'submitted' ||
          d.status === 'not-started'
      ).length,
    []
  );

  const uniqueCountries = useMemo(
    () => new Set(exportShipments.map((s) => s.destination)).size,
    []
  );

  const complianceScore = useMemo(() => {
    const total = exportDocuments.length;
    const approved = exportDocuments.filter(
      (d) => d.status === 'approved'
    ).length;
    return total > 0 ? Math.round((approved / total) * 100) : 0;
  }, []);

  const filteredHistory = useMemo(() => {
    let list = exportShipments;
    if (historyFilter !== 'all') {
      list = list.filter((s) => s.status === historyFilter);
    }
    if (historySearch) {
      const q = historySearch.toLowerCase();
      list = list.filter(
        (s) =>
          s.id.toLowerCase().includes(q) ||
          s.product.toLowerCase().includes(q) ||
          s.destination.toLowerCase().includes(q) ||
          s.exporterName.toLowerCase().includes(q)
      );
    }
    return list;
  }, [historyFilter, historySearch]);

  const historyTotalValue = useMemo(
    () => filteredHistory.reduce((sum, s) => sum + s.value, 0),
    [filteredHistory]
  );

  const tabs: { key: TabType; label: string }[] = [
    { key: 'active', label: 'Active Shipments' },
    { key: 'history', label: 'Export History' },
    { key: 'actions', label: 'Quick Actions' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#1B2A4A] via-[#1B2A4A] to-[#2AA198]/30 text-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 100, damping: 15 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-white/10 backdrop-blur rounded-xl">
                <Ship className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold">Export Hub</h1>
                <p className="text-white/70 text-sm">
                  Manage your export operations and documents
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              <Link
                href="/farm/exports/documents"
                className="flex items-center gap-1.5 text-sm bg-white/10 backdrop-blur hover:bg-white/20 transition-colors px-4 py-2 rounded-xl"
              >
                <FileText className="w-4 h-4" />
                Documents
              </Link>
              <Link
                href="/farm/exports/markets"
                className="flex items-center gap-1.5 text-sm bg-white/10 backdrop-blur hover:bg-white/20 transition-colors px-4 py-2 rounded-xl"
              >
                <Globe className="w-4 h-4" />
                Markets
              </Link>
              <Link
                href="/farm/exports/compliance"
                className="flex items-center gap-1.5 text-sm bg-white/10 backdrop-blur hover:bg-white/20 transition-colors px-4 py-2 rounded-xl"
              >
                <CheckCircle2 className="w-4 h-4" />
                Compliance
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
        {/* Stats Row */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6"
        >
          <StatCard
            icon={<Ship className="w-5 h-5 text-[#1B2A4A]" />}
            label="Active Shipments"
            value={String(activeShipments.length)}
            sub="Currently in pipeline"
            color="bg-[#1B2A4A]/10"
          />
          <StatCard
            icon={<FileText className="w-5 h-5 text-amber-600" />}
            label="Docs Pending"
            value={String(pendingDocs)}
            sub="Require attention"
            color="bg-amber-50"
          />
          <StatCard
            icon={<DollarSign className="w-5 h-5 text-[#2AA198]" />}
            label="Total Value (YTD)"
            value={formatCurrency(totalExportValue)}
            sub="All shipments"
            color="bg-[#2AA198]/10"
          />
          <StatCard
            icon={<Globe className="w-5 h-5 text-[#D4A843]" />}
            label="Countries"
            value={String(uniqueCountries)}
            sub="Shipped to"
            color="bg-[#D4A843]/10"
          />
          <StatCard
            icon={<CheckCircle2 className="w-5 h-5 text-green-600" />}
            label="Compliance"
            value={`${complianceScore}%`}
            sub="Document approval rate"
            color="bg-green-50"
          />
        </motion.div>

        {/* Tab Switcher */}
        <div className="flex gap-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-1.5 mb-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 min-w-fit px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === tab.key
                  ? 'bg-[#1B2A4A] text-white shadow-sm'
                  : 'text-gray-500 hover:text-[#1B2A4A] hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'active' && (
            <motion.div
              key="active"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {activeShipments.length === 0 ? (
                <div className="text-center py-16">
                  <Ship className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-400">No active shipments</p>
                </div>
              ) : (
                activeShipments.map((shipment) => (
                  <ShipmentCard key={shipment.id} shipment={shipment} />
                ))
              )}
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ type: 'spring', stiffness: 100, damping: 15 }}
            >
              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search shipments..."
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2AA198]/40 focus:border-[#2AA198]"
                  />
                </div>
                <div className="flex gap-1 flex-wrap">
                  <button
                    onClick={() => setHistoryFilter('all')}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      historyFilter === 'all'
                        ? 'bg-[#1B2A4A] text-white'
                        : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    All
                  </button>
                  {(
                    Object.keys(STATUS_LABELS) as ShipmentStatus[]
                  ).map((status) => (
                    <button
                      key={status}
                      onClick={() => setHistoryFilter(status)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        historyFilter === status
                          ? 'bg-[#1B2A4A] text-white'
                          : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {STATUS_LABELS[status]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {filteredHistory.length} shipment
                    {filteredHistory.length !== 1 ? 's' : ''} found
                  </span>
                  <span className="text-sm font-bold text-[#2AA198]">
                    Total Value: {formatCurrency(historyTotalValue)}
                  </span>
                </div>
              </div>

              {/* Cards */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-3"
              >
                {filteredHistory.map((shipment) => (
                  <HistoryCard key={shipment.id} shipment={shipment} />
                ))}
                {filteredHistory.length === 0 && (
                  <div className="text-center py-16">
                    <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-400">
                      No shipments match your filters
                    </p>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}

          {activeTab === 'actions' && (
            <motion.div
              key="actions"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              {QUICK_ACTIONS.map((action) => (
                <motion.button
                  key={action.label}
                  variants={cardVariants}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-left hover:shadow-md transition-shadow"
                >
                  <div
                    className={`p-3 rounded-xl ${action.bgColor} ${action.color} w-fit mb-3`}
                  >
                    {action.icon}
                  </div>
                  <h3 className="text-sm font-bold text-[#1B2A4A] mb-1">
                    {action.label}
                  </h3>
                  <p className="text-xs text-gray-400">{action.description}</p>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
