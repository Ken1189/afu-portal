'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  BadgeCheck,
  Clock,
  Archive,
  Tag,
  ShieldCheck,
  Calendar,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  User,
  ArrowRightLeft,
  Recycle,
  Trash2,
  Download,
  Filter,
  Sparkles,
} from 'lucide-react';
import { useCarbonCredits } from '@/lib/supabase/use-sustainability';

// ---------------------------------------------------------------------------
// Types (inlined from @/lib/data/sustainability)
// ---------------------------------------------------------------------------

type CarbonCreditType = 'agroforestry' | 'soil-carbon' | 'methane-reduction' | 'conservation-tillage' | 'biochar';
type CreditStatus = 'verified' | 'pending' | 'retired' | 'listed';

interface CarbonCredit {
  id: string;
  projectName: string;
  type: CarbonCreditType;
  credits: number;
  status: CreditStatus;
  verificationBody: string;
  vintageYear: number;
  pricePerTonne: number;
  totalValue: number;
  issuanceDate: string;
  expiryDate: string;
  buyerName: string | null;
  description: string;
}

interface CarbonTransaction {
  id: string;
  date: string;
  type: 'purchase' | 'sale' | 'retirement' | 'issuance';
  creditId: string;
  projectName: string;
  tonnes: number;
  pricePerTonne: number;
  totalAmount: number;
  counterparty: string;
  status: 'completed' | 'pending' | 'cancelled';
  reference: string;
}

// ---------------------------------------------------------------------------
// Inline fallback data (from @/lib/data/sustainability)
// ---------------------------------------------------------------------------

const mockCarbonCredits: CarbonCredit[] = [
  { id: 'CC-001', projectName: 'Chobe Agroforestry Initiative', type: 'agroforestry', credits: 450, status: 'verified', verificationBody: 'Verra (VCS)', vintageYear: 2025, pricePerTonne: 18.50, totalValue: 8325, issuanceDate: '2025-03-15', expiryDate: '2035-03-15', buyerName: null, description: 'Carbon credits generated from the planting of over 12,000 indigenous and fruit trees across 300 hectares in the Chobe District. The project integrates agroforestry practices with smallholder farming, improving both carbon sequestration and farmer livelihoods.' },
  { id: 'CC-002', projectName: 'Makgadikgadi Soil Carbon Project', type: 'soil-carbon', credits: 280, status: 'verified', verificationBody: 'Gold Standard', vintageYear: 2025, pricePerTonne: 22.00, totalValue: 6160, issuanceDate: '2025-06-01', expiryDate: '2035-06-01', buyerName: null, description: 'Regenerative agriculture practices implemented across farms in the Makgadikgadi region have significantly increased soil organic carbon. Cover cropping, composting, and reduced tillage have been key interventions.' },
  { id: 'CC-003', projectName: 'Eastern Highlands Methane Capture', type: 'methane-reduction', credits: 620, status: 'listed', verificationBody: 'Verra (VCS)', vintageYear: 2024, pricePerTonne: 15.75, totalValue: 9765, issuanceDate: '2024-09-20', expiryDate: '2034-09-20', buyerName: null, description: 'Methane capture and biogas utilisation from dairy farming operations across the Eastern Highlands of Zimbabwe. Anaerobic digesters have been installed on 45 farms, converting methane emissions into clean cooking fuel.' },
  { id: 'CC-004', projectName: 'Serengeti Buffer Conservation Tillage', type: 'conservation-tillage', credits: 190, status: 'pending', verificationBody: 'Gold Standard', vintageYear: 2025, pricePerTonne: 14.25, totalValue: 2707.5, issuanceDate: '2025-11-01', expiryDate: '2035-11-01', buyerName: null, description: 'Conservation tillage practices adopted by farming communities in the buffer zones around the Serengeti National Park. Minimal soil disturbance techniques are preserving soil carbon while maintaining crop yields.' },
  { id: 'CC-005', projectName: 'Okavango Delta Biochar Programme', type: 'biochar', credits: 340, status: 'verified', verificationBody: 'Puro.earth', vintageYear: 2024, pricePerTonne: 85.00, totalValue: 28900, issuanceDate: '2024-12-01', expiryDate: '2034-12-01', buyerName: null, description: 'Production and application of biochar from agricultural waste in the Okavango Delta region. The biochar is produced using pyrolysis kilns and applied to farmland, permanently sequestering carbon while improving soil fertility.' },
  { id: 'CC-006', projectName: 'Chobe Agroforestry Initiative', type: 'agroforestry', credits: 200, status: 'retired', verificationBody: 'Verra (VCS)', vintageYear: 2023, pricePerTonne: 16.00, totalValue: 3200, issuanceDate: '2023-04-10', expiryDate: '2033-04-10', buyerName: 'GreenFuture Corp', description: 'First vintage from the Chobe Agroforestry Initiative. These credits have been retired on behalf of GreenFuture Corp as part of their corporate carbon neutrality commitment.' },
  { id: 'CC-007', projectName: 'Kilimanjaro Shade-Grown Coffee Carbon', type: 'agroforestry', credits: 520, status: 'listed', verificationBody: 'Gold Standard', vintageYear: 2025, pricePerTonne: 24.50, totalValue: 12740, issuanceDate: '2025-01-15', expiryDate: '2035-01-15', buyerName: null, description: 'Shade-grown coffee agroforestry systems on the slopes of Mount Kilimanjaro. Farmers have planted over 8,000 shade trees, creating a multi-layered canopy that sequesters carbon while producing premium specialty coffee.' },
  { id: 'CC-008', projectName: 'Masvingo Regenerative Ranching', type: 'soil-carbon', credits: 175, status: 'pending', verificationBody: 'Verra (VCS)', vintageYear: 2025, pricePerTonne: 19.00, totalValue: 3325, issuanceDate: '2025-08-01', expiryDate: '2035-08-01', buyerName: null, description: 'Holistic planned grazing and regenerative ranching practices implemented across communal rangelands in the Masvingo province. Rotational grazing has improved grassland carbon stocks significantly.' },
  { id: 'CC-009', projectName: 'Tuli Block Conservation Tillage', type: 'conservation-tillage', credits: 310, status: 'verified', verificationBody: 'Gold Standard', vintageYear: 2024, pricePerTonne: 13.50, totalValue: 4185, issuanceDate: '2024-07-15', expiryDate: '2034-07-15', buyerName: null, description: 'No-till and minimum tillage farming adopted across 420 hectares in the Tuli Block of Botswana. Crop residue retention and direct seeding methods have increased soil organic matter and reduced erosion.' },
  { id: 'CC-010', projectName: 'Eastern Highlands Methane Capture', type: 'methane-reduction', credits: 380, status: 'retired', verificationBody: 'Verra (VCS)', vintageYear: 2023, pricePerTonne: 14.00, totalValue: 5320, issuanceDate: '2023-11-01', expiryDate: '2033-11-01', buyerName: 'EcoVentures Ltd', description: 'Second batch of credits from the Eastern Highlands methane capture project. Retired by EcoVentures Ltd as part of their supply chain decarbonisation programme.' },
  { id: 'CC-011', projectName: 'Dodoma Biochar Collective', type: 'biochar', credits: 150, status: 'listed', verificationBody: 'Puro.earth', vintageYear: 2025, pricePerTonne: 78.00, totalValue: 11700, issuanceDate: '2025-02-28', expiryDate: '2035-02-28', buyerName: null, description: 'A collective of 60 smallholder farmers in the Dodoma region producing biochar from crop residues and applying it to their fields. The high-quality biochar provides durable carbon removal while boosting crop yields by up to 25%.' },
  { id: 'CC-012', projectName: 'Makgadikgadi Soil Carbon Project', type: 'soil-carbon', credits: 95, status: 'pending', verificationBody: 'Gold Standard', vintageYear: 2026, pricePerTonne: 23.50, totalValue: 2232.5, issuanceDate: '2026-01-15', expiryDate: '2036-01-15', buyerName: null, description: 'Expansion phase of the Makgadikgadi Soil Carbon Project. Additional farms have been onboarded, introducing advanced composting techniques and perennial cover crop systems to build soil organic carbon.' },
];

const mockCarbonTransactions: CarbonTransaction[] = [
  { id: 'TX-001', date: '2025-03-15', type: 'issuance', creditId: 'CC-001', projectName: 'Chobe Agroforestry Initiative', tonnes: 450, pricePerTonne: 18.50, totalAmount: 8325, counterparty: 'Verra (VCS)', status: 'completed', reference: 'VCS-2025-AFU-0451' },
  { id: 'TX-002', date: '2025-06-01', type: 'issuance', creditId: 'CC-002', projectName: 'Makgadikgadi Soil Carbon Project', tonnes: 280, pricePerTonne: 22.00, totalAmount: 6160, counterparty: 'Gold Standard', status: 'completed', reference: 'GS-2025-AFU-0128' },
  { id: 'TX-003', date: '2024-11-20', type: 'sale', creditId: 'CC-006', projectName: 'Chobe Agroforestry Initiative', tonnes: 200, pricePerTonne: 16.00, totalAmount: 3200, counterparty: 'GreenFuture Corp', status: 'completed', reference: 'SALE-2024-GFC-0042' },
  { id: 'TX-004', date: '2024-12-15', type: 'retirement', creditId: 'CC-006', projectName: 'Chobe Agroforestry Initiative', tonnes: 200, pricePerTonne: 16.00, totalAmount: 3200, counterparty: 'GreenFuture Corp', status: 'completed', reference: 'RET-2024-GFC-0042' },
  { id: 'TX-005', date: '2025-01-15', type: 'issuance', creditId: 'CC-007', projectName: 'Kilimanjaro Shade-Grown Coffee Carbon', tonnes: 520, pricePerTonne: 24.50, totalAmount: 12740, counterparty: 'Gold Standard', status: 'completed', reference: 'GS-2025-KCC-0077' },
  { id: 'TX-006', date: '2025-02-10', type: 'sale', creditId: 'CC-010', projectName: 'Eastern Highlands Methane Capture', tonnes: 380, pricePerTonne: 14.00, totalAmount: 5320, counterparty: 'EcoVentures Ltd', status: 'completed', reference: 'SALE-2025-EVL-0015' },
  { id: 'TX-007', date: '2025-02-28', type: 'retirement', creditId: 'CC-010', projectName: 'Eastern Highlands Methane Capture', tonnes: 380, pricePerTonne: 14.00, totalAmount: 5320, counterparty: 'EcoVentures Ltd', status: 'completed', reference: 'RET-2025-EVL-0015' },
  { id: 'TX-008', date: '2025-12-01', type: 'issuance', creditId: 'CC-005', projectName: 'Okavango Delta Biochar Programme', tonnes: 340, pricePerTonne: 85.00, totalAmount: 28900, counterparty: 'Puro.earth', status: 'completed', reference: 'PURO-2024-OKV-0340' },
  { id: 'TX-009', date: '2026-01-10', type: 'purchase', creditId: 'CC-011', projectName: 'Dodoma Biochar Collective', tonnes: 50, pricePerTonne: 78.00, totalAmount: 3900, counterparty: 'Dodoma Biochar Collective', status: 'pending', reference: 'PUR-2026-DBC-0011' },
  { id: 'TX-010', date: '2026-02-05', type: 'sale', creditId: 'CC-003', projectName: 'Eastern Highlands Methane Capture', tonnes: 100, pricePerTonne: 15.75, totalAmount: 1575, counterparty: 'CleanAir Partners', status: 'pending', reference: 'SALE-2026-CAP-0003' },
];

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 100,
      damping: 15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 24,
    },
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type TabKey = 'credits' | 'transactions' | 'retire';
type CreditFilter = 'all' | CreditStatus;

const tabLabels: Record<TabKey, string> = {
  credits: 'My Credits',
  transactions: 'Transactions',
  retire: 'Retire',
};

const creditTypeLabels: Record<CarbonCreditType, string> = {
  agroforestry: 'Agroforestry',
  'soil-carbon': 'Soil Carbon',
  'methane-reduction': 'Methane Reduction',
  'conservation-tillage': 'Conservation Tillage',
  biochar: 'Biochar',
};

const creditTypeColors: Record<CarbonCreditType, string> = {
  agroforestry: 'bg-green-100 text-green-700 border-green-200',
  'soil-carbon': 'bg-amber-100 text-amber-700 border-amber-200',
  'methane-reduction': 'bg-blue-100 text-blue-700 border-blue-200',
  'conservation-tillage': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  biochar: 'bg-purple-100 text-purple-700 border-purple-200',
};

const statusConfig: Record<
  CreditStatus,
  { label: string; badge: string; icon: React.ComponentType<{ size?: number; className?: string }> }
> = {
  verified: {
    label: 'Verified',
    badge: 'bg-green-50 text-green-700 border-green-200',
    icon: BadgeCheck,
  },
  pending: {
    label: 'Pending',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: Clock,
  },
  retired: {
    label: 'Retired',
    badge: 'bg-gray-50 text-gray-500 border-gray-200',
    icon: Archive,
  },
  listed: {
    label: 'Listed',
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: Tag,
  },
};

const txTypeConfig: Record<
  string,
  { label: string; color: string; icon: React.ComponentType<{ size?: number; className?: string }> }
> = {
  purchase: { label: 'Purchase', color: 'text-blue-600 bg-blue-50', icon: DollarSign },
  sale: { label: 'Sale', color: 'text-green-600 bg-green-50', icon: TrendingUp },
  retirement: { label: 'Retirement', color: 'text-gray-600 bg-gray-100', icon: Archive },
  issuance: { label: 'Issuance', color: 'text-purple-600 bg-purple-50', icon: Award },
};

const filterLabels: Record<CreditFilter, string> = {
  all: 'All',
  verified: 'Verified',
  pending: 'Pending',
  retired: 'Retired',
  listed: 'Listed',
};

function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// ---------------------------------------------------------------------------
// Portfolio Summary Card
// ---------------------------------------------------------------------------

function SummaryCard({
  icon: Icon,
  label,
  value,
  subValue,
  color,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
  subValue?: string;
  color: string;
}) {
  return (
    <motion.div
      variants={cardVariants}
      className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm"
    >
      <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center mb-3`}>
        <Icon size={18} />
      </div>
      <p className="text-xl font-bold text-[#1B2A4A]">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
      {subValue && <p className="text-[10px] text-gray-400 mt-0.5">{subValue}</p>}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Credit Card Component
// ---------------------------------------------------------------------------

function CreditCard({ credit }: { credit: CarbonCredit }) {
  const [expanded, setExpanded] = useState(false);
  const config = statusConfig[credit.status];
  const StatusIcon = config.icon;

  return (
    <motion.div
      variants={cardVariants}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="p-4">
        {/* Top row: type badge + status badge */}
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${creditTypeColors[credit.type]}`}
            >
              {creditTypeLabels[credit.type]}
            </span>
            <span className="text-[10px] text-gray-400">Vintage {credit.vintageYear}</span>
          </div>
          <span
            className={`text-[10px] font-medium px-2 py-0.5 rounded-full border flex items-center gap-1 ${config.badge}`}
          >
            <StatusIcon size={10} />
            {config.label}
          </span>
        </div>

        {/* Project name */}
        <h4 className="text-sm font-bold text-[#1B2A4A] leading-tight">{credit.projectName}</h4>

        {/* Verification body */}
        <div className="flex items-center gap-1.5 mt-1.5 text-xs text-gray-500">
          <ShieldCheck size={12} className="text-[#8CB89C]" />
          <span>{credit.verificationBody}</span>
        </div>

        {/* Key figures */}
        <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-gray-50">
          <div>
            <p className="text-[10px] text-gray-400">Credits</p>
            <p className="text-sm font-bold text-[#1B2A4A]">
              {credit.credits} <span className="text-[10px] font-normal text-gray-400">tCO2e</span>
            </p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400">Price/tonne</p>
            <p className="text-sm font-bold text-[#1B2A4A]">
              {formatCurrency(credit.pricePerTonne)}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400">Total Value</p>
            <p className="text-sm font-bold text-[#8CB89C]">
              {formatCurrency(credit.totalValue)}
            </p>
          </div>
        </div>

        {/* Dates */}
        <div className="flex items-center gap-4 mt-3 text-[11px] text-gray-400">
          <div className="flex items-center gap-1">
            <Calendar size={10} />
            <span>Issued: {formatDate(credit.issuanceDate)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={10} />
            <span>Expires: {formatDate(credit.expiryDate)}</span>
          </div>
        </div>

        {/* Buyer (if sold/retired) */}
        {credit.buyerName && (
          <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-500">
            <User size={12} className="text-[#D4A843]" />
            <span>
              Buyer: <span className="font-medium text-[#1B2A4A]">{credit.buyerName}</span>
            </span>
          </div>
        )}

        {/* Actions row */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50">
          {credit.status === 'verified' && (
            <>
              <button className="flex-1 py-2 rounded-lg bg-[#8CB89C] text-white text-xs font-semibold hover:bg-[#8CB89C]/90 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5">
                <Tag size={12} />
                List for Sale
              </button>
              <button className="flex-1 py-2 rounded-lg bg-[#1B2A4A] text-white text-xs font-semibold hover:bg-[#1B2A4A]/90 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5">
                <Archive size={12} />
                Retire
              </button>
            </>
          )}
          {credit.status === 'pending' && (
            <button className="flex-1 py-2 rounded-lg bg-amber-500 text-white text-xs font-semibold hover:bg-amber-500/90 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5">
              <AlertCircle size={12} />
              Check Status
            </button>
          )}
          {credit.status === 'listed' && (
            <button className="flex-1 py-2 rounded-lg bg-gray-100 text-gray-700 text-xs font-semibold hover:bg-gray-200 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5">
              <XCircle size={12} />
              Delist
            </button>
          )}
          {credit.status === 'retired' && (
            <button className="flex-1 py-2 rounded-lg bg-gray-50 text-gray-500 text-xs font-medium flex items-center justify-center gap-1.5">
              <FileText size={12} />
              View Certificate
            </button>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors flex-shrink-0"
          >
            {expanded ? (
              <ChevronUp size={14} className="text-gray-500" />
            ) : (
              <ChevronDown size={14} className="text-gray-500" />
            )}
          </button>
        </div>

        {/* Expanded description */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-3 pt-3 border-t border-gray-50">
                <p className="text-xs text-gray-600 leading-relaxed">{credit.description}</p>
                <div className="flex items-center gap-2 mt-2 text-[10px] text-gray-400">
                  <span>ID: {credit.id}</span>
                  <span>&middot;</span>
                  <span>Vintage: {credit.vintageYear}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Transaction Card
// ---------------------------------------------------------------------------

function TransactionCard({ tx }: { tx: CarbonTransaction }) {
  const config = txTypeConfig[tx.type] || txTypeConfig.issuance;
  const TxIcon = config.icon;

  return (
    <motion.div
      variants={cardVariants}
      className="bg-white rounded-xl border border-gray-100 shadow-sm p-4"
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${config.color}`}>
          <TxIcon size={16} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#1B2A4A]">{config.label}</span>
            <span className="text-[10px] text-gray-400">{formatDate(tx.date)}</span>
          </div>
          <p className="text-xs text-gray-600 mt-0.5 truncate">{tx.projectName}</p>

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-3 text-[11px] text-gray-500">
              <span>{tx.tonnes} tCO2e</span>
              <span>&middot;</span>
              <span>{formatCurrency(tx.pricePerTonne)}/t</span>
            </div>
            <span
              className={`text-xs font-bold ${
                tx.type === 'sale' || tx.type === 'issuance'
                  ? 'text-green-600'
                  : tx.type === 'purchase'
                    ? 'text-blue-600'
                    : 'text-gray-500'
              }`}
            >
              {tx.type === 'sale' || tx.type === 'issuance' ? '+' : '-'}
              {formatCurrency(tx.totalAmount)}
            </span>
          </div>

          <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
            <div className="flex items-center gap-1 text-[10px] text-gray-400">
              <ArrowRightLeft size={10} />
              <span>{tx.counterparty}</span>
            </div>
            <span
              className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                tx.status === 'completed'
                  ? 'bg-green-50 text-green-600'
                  : tx.status === 'pending'
                    ? 'bg-amber-50 text-amber-600'
                    : 'bg-red-50 text-red-500'
              }`}
            >
              {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
            </span>
          </div>

          <p className="text-[10px] text-gray-300 mt-1.5">Ref: {tx.reference}</p>
        </div>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Retirement Section
// ---------------------------------------------------------------------------

function RetireSection({ credits }: { credits: CarbonCredit[] }) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [retireReason, setRetireReason] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);

  const retirableCredits = credits.filter((c) => c.status === 'verified');

  const toggleCredit = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectedCredits = retirableCredits.filter((c) => selectedIds.has(c.id));
  const totalTonnes = selectedCredits.reduce((sum, c) => sum + c.credits, 0);
  const totalValue = selectedCredits.reduce((sum, c) => sum + c.totalValue, 0);

  const retireReasons = [
    'Corporate carbon neutrality',
    'Voluntary offset for personal emissions',
    'Supply chain decarbonisation',
    'Event carbon offsetting',
    'Customer-funded offset',
    'Other',
  ];

  return (
    <div className="space-y-4">
      {/* Explanation */}
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="bg-gradient-to-r from-[#1B2A4A]/5 to-emerald-50 rounded-2xl border border-[#1B2A4A]/10 p-4"
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <Recycle size={20} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-[#1B2A4A]">What is Carbon Credit Retirement?</p>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Retiring a carbon credit permanently removes it from circulation, ensuring the
              associated emission reduction is claimed only once. Retired credits cannot be traded
              or transferred. A retirement certificate is issued as proof of your climate action.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Select Credits */}
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4"
      >
        <h4 className="text-sm font-bold text-[#1B2A4A] mb-3">
          Select Credits to Retire ({retirableCredits.length} available)
        </h4>

        {retirableCredits.length === 0 ? (
          <div className="text-center py-6">
            <Archive size={32} className="text-gray-300 mx-auto mb-2" />
            <p className="text-xs text-gray-400">No verified credits available for retirement</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {retirableCredits.map((credit) => {
              const isSelected = selectedIds.has(credit.id);
              return (
                <button
                  key={credit.id}
                  onClick={() => toggleCredit(credit.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    isSelected
                      ? 'border-[#8CB89C] bg-[#8CB89C]/5'
                      : 'border-gray-100 bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                        isSelected ? 'border-[#8CB89C] bg-[#8CB89C]' : 'border-gray-300'
                      }`}
                    >
                      {isSelected && <CheckCircle2 size={12} className="text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-[#1B2A4A] truncate">
                          {credit.projectName}
                        </span>
                        <span
                          className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full border flex-shrink-0 ${creditTypeColors[credit.type]}`}
                        >
                          {creditTypeLabels[credit.type]}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-[10px] text-gray-400">
                        <span>{credit.credits} tCO2e</span>
                        <span>&middot;</span>
                        <span>{formatCurrency(credit.totalValue)}</span>
                        <span>&middot;</span>
                        <span>{credit.vintageYear}</span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Retirement Reason */}
      {selectedIds.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4"
        >
          <h4 className="text-sm font-bold text-[#1B2A4A] mb-3">Retirement Reason</h4>
          <div className="grid grid-cols-2 gap-2">
            {retireReasons.map((reason) => (
              <button
                key={reason}
                onClick={() => setRetireReason(reason)}
                className={`text-left p-2.5 rounded-lg border text-xs transition-all ${
                  retireReason === reason
                    ? 'border-[#8CB89C] bg-[#8CB89C]/5 text-[#8CB89C] font-semibold'
                    : 'border-gray-100 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {reason}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Summary & Retire Button */}
      {selectedIds.size > 0 && retireReason && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4"
        >
          <h4 className="text-sm font-bold text-[#1B2A4A] mb-3">Retirement Summary</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Credits selected</span>
              <span className="font-semibold text-[#1B2A4A]">{selectedIds.size}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Total tonnes CO2e</span>
              <span className="font-semibold text-[#1B2A4A]">
                {totalTonnes.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Total value</span>
              <span className="font-semibold text-[#8CB89C]">{formatCurrency(totalValue)}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Reason</span>
              <span className="font-semibold text-[#1B2A4A]">{retireReason}</span>
            </div>
          </div>

          <button
            onClick={() => setShowConfirm(true)}
            className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-[#1B2A4A] to-[#8CB89C] text-white text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <Trash2 size={14} />
            Retire {totalTonnes.toLocaleString()} tCO2e
          </button>
        </motion.div>
      )}

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center p-4"
            onClick={() => setShowConfirm(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl w-full max-w-md p-5 shadow-xl"
            >
              <div className="text-center mb-4">
                <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-3">
                  <AlertCircle size={28} className="text-amber-500" />
                </div>
                <h3 className="text-base font-bold text-[#1B2A4A]">Confirm Retirement</h3>
                <p className="text-xs text-gray-500 mt-1">
                  This action is permanent and cannot be undone. Retired credits will be removed
                  from your portfolio and recorded on the public registry.
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-3 mb-4 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Credits</span>
                  <span className="font-semibold text-[#1B2A4A]">{selectedIds.size} credits</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Total</span>
                  <span className="font-semibold text-[#1B2A4A]">
                    {totalTonnes.toLocaleString()} tCO2e
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Reason</span>
                  <span className="font-semibold text-[#1B2A4A]">{retireReason}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowConfirm(false);
                    setShowCertificate(true);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-[#1B2A4A] text-white text-sm font-semibold hover:bg-[#1B2A4A]/90 active:scale-[0.98] transition-all"
                >
                  Confirm Retirement
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Retirement Certificate Preview */}
      <AnimatePresence>
        {showCertificate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowCertificate(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden"
            >
              {/* Certificate header */}
              <div className="bg-gradient-to-br from-[#1B2A4A] to-[#8CB89C] p-6 text-center text-white">
                <Award size={40} className="mx-auto mb-2 text-[#D4A843]" />
                <h3 className="text-lg font-bold">Carbon Credit Retirement Certificate</h3>
                <p className="text-xs text-white/70 mt-1">AFU Sustainability Platform</p>
              </div>

              <div className="p-5 space-y-3">
                <div className="text-center">
                  <p className="text-xs text-gray-400">This certifies the permanent retirement of</p>
                  <p className="text-3xl font-bold text-[#1B2A4A] mt-1">
                    {totalTonnes.toLocaleString()} <span className="text-base">tCO2e</span>
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-3 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Certificate ID</span>
                    <span className="font-mono text-[#1B2A4A] font-medium">
                      RET-{Date.now().toString(36).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Retirement Date</span>
                    <span className="text-[#1B2A4A] font-medium">
                      {new Date().toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Credits Retired</span>
                    <span className="text-[#1B2A4A] font-medium">{selectedIds.size}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Purpose</span>
                    <span className="text-[#1B2A4A] font-medium">{retireReason}</span>
                  </div>
                </div>

                <div className="text-center pt-2">
                  <div className="inline-flex items-center gap-1.5 text-[#8CB89C]">
                    <Sparkles size={14} />
                    <span className="text-xs font-semibold">
                      Thank you for your climate commitment!
                    </span>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5">
                    <Download size={14} />
                    Download PDF
                  </button>
                  <button
                    onClick={() => {
                      setShowCertificate(false);
                      setSelectedIds(new Set());
                      setRetireReason('');
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-[#8CB89C] text-white text-sm font-semibold hover:bg-[#8CB89C]/90 active:scale-[0.98] transition-all"
                  >
                    Done
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page Component
// ---------------------------------------------------------------------------

export default function CarbonCreditsPage() {
  const { credits: liveCredits, loading: creditsLoading } = useCarbonCredits();

  // Use live Supabase data when available, fall back to mock data
  const carbonCredits: CarbonCredit[] = liveCredits.length > 0
    ? liveCredits.map((c) => ({
        id: c.id,
        type: c.project_type as CarbonCreditType,
        projectName: c.project_type,
        credits: c.credits_earned,
        pricePerTonne: c.value_usd ? c.value_usd / c.credits_earned : 0,
        totalValue: c.value_usd ?? 0,
        status: c.verification_status as CreditStatus,
        vintageYear: c.vintage_year ?? new Date().getFullYear(),
        verificationBody: c.registry ?? 'Unknown',
        description: '',
        issuanceDate: c.created_at,
        expiryDate: c.updated_at,
        buyerName: null,
      }))
    : mockCarbonCredits;
  const carbonTransactions = mockCarbonTransactions;

  const [activeTab, setActiveTab] = useState<TabKey>('credits');
  const [creditFilter, setCreditFilter] = useState<CreditFilter>('all');

  // Portfolio stats
  const stats = useMemo(() => {
    const totalCredits = carbonCredits.reduce((sum, c) => sum + c.credits, 0);
    const portfolioValue = carbonCredits.reduce((sum, c) => sum + c.totalValue, 0);
    const verifiedCredits = carbonCredits
      .filter((c) => c.status === 'verified')
      .reduce((sum, c) => sum + c.credits, 0);
    const pendingCredits = carbonCredits
      .filter((c) => c.status === 'pending')
      .reduce((sum, c) => sum + c.credits, 0);
    return { totalCredits, portfolioValue, verifiedCredits, pendingCredits };
  }, []);

  // Filtered credits
  const filteredCredits = useMemo(
    () =>
      creditFilter === 'all'
        ? carbonCredits
        : carbonCredits.filter((c) => c.status === creditFilter),
    [creditFilter]
  );

  // Sorted transactions (newest first)
  const sortedTransactions = useMemo(
    () => [...carbonTransactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    []
  );

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-5 py-4"
    >
      {/* ================================================================= */}
      {/* 1. HEADER BANNER                                                  */}
      {/* ================================================================= */}
      <motion.section variants={itemVariants} className="px-4">
        <div className="rounded-2xl bg-gradient-to-br from-emerald-600 via-[#8CB89C] to-[#1B2A4A] p-5 text-white relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full" />
          <div className="absolute -bottom-8 -right-6 w-24 h-24 bg-white/5 rounded-full" />
          <div className="absolute top-4 right-4 opacity-20">
            <Award size={64} strokeWidth={1} />
          </div>

          <div className="relative z-10">
            <Link
              href="/farm/sustainability"
              className="inline-flex items-center gap-1.5 text-xs text-white/70 hover:text-white/90 transition-colors mb-2"
            >
              <ArrowLeft size={14} />
              Back to Sustainability
            </Link>
            <div className="flex items-center gap-2 mb-1">
              <Award size={20} className="text-[#D4A843]" />
              <span className="text-xs font-semibold text-white/70 uppercase tracking-wide">
                Portfolio
              </span>
            </div>
            <h2 className="text-xl font-bold leading-tight">Carbon Credits</h2>
            <p className="text-sm text-white/80 mt-1">Your carbon credit portfolio</p>
          </div>
        </div>
      </motion.section>

      {/* ================================================================= */}
      {/* 2. PORTFOLIO SUMMARY                                              */}
      {/* ================================================================= */}
      <motion.section variants={itemVariants} className="px-4">
        <div className="grid grid-cols-2 gap-3">
          <SummaryCard
            icon={Award}
            label="Total Credits"
            value={`${stats.totalCredits.toLocaleString()}`}
            subValue="tonnes CO2e"
            color="bg-green-100 text-green-600"
          />
          <SummaryCard
            icon={DollarSign}
            label="Portfolio Value"
            value={formatCurrency(stats.portfolioValue)}
            color="bg-[#D4A843]/10 text-[#D4A843]"
          />
          <SummaryCard
            icon={BadgeCheck}
            label="Verified Credits"
            value={`${stats.verifiedCredits.toLocaleString()}`}
            subValue="tonnes CO2e"
            color="bg-[#8CB89C]/10 text-[#8CB89C]"
          />
          <SummaryCard
            icon={Clock}
            label="Pending Verification"
            value={`${stats.pendingCredits.toLocaleString()}`}
            subValue="tonnes CO2e"
            color="bg-amber-100 text-amber-600"
          />
        </div>
      </motion.section>

      {/* ================================================================= */}
      {/* 3. TAB SWITCHER                                                   */}
      {/* ================================================================= */}
      <motion.section variants={itemVariants} className="px-4">
        <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
          {(Object.keys(tabLabels) as TabKey[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === tab
                  ? 'bg-white text-[#1B2A4A] shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tabLabels[tab]}
            </button>
          ))}
        </div>
      </motion.section>

      {/* ================================================================= */}
      {/* 4. TAB CONTENT                                                    */}
      {/* ================================================================= */}
      <AnimatePresence mode="wait">
        {/* ─── My Credits Tab ──────────────────────────────────────────── */}
        {activeTab === 'credits' && (
          <motion.section
            key="credits"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="px-4 space-y-4"
          >
            {/* Filter pills */}
            <div className="flex items-center gap-2">
              <Filter size={14} className="text-gray-400 flex-shrink-0" />
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                {(Object.keys(filterLabels) as CreditFilter[]).map((filter) => {
                  const count =
                    filter === 'all'
                      ? carbonCredits.length
                      : carbonCredits.filter((c) => c.status === filter).length;
                  return (
                    <button
                      key={filter}
                      onClick={() => setCreditFilter(filter)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                        creditFilter === filter
                          ? 'bg-[#1B2A4A] text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {filterLabels[filter]} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Credit cards */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-3"
            >
              {filteredCredits.length === 0 ? (
                <div className="text-center py-10">
                  <Archive size={36} className="text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No credits found for this filter</p>
                </div>
              ) : (
                filteredCredits.map((credit) => <CreditCard key={credit.id} credit={credit} />)
              )}
            </motion.div>
          </motion.section>
        )}

        {/* ─── Transactions Tab ────────────────────────────────────────── */}
        {activeTab === 'transactions' && (
          <motion.section
            key="transactions"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="px-4 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#1B2A4A]">Transaction History</h3>
              <span className="text-xs text-gray-400">{sortedTransactions.length} transactions</span>
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-3"
            >
              {sortedTransactions.map((tx) => (
                <TransactionCard key={tx.id} tx={tx} />
              ))}
            </motion.div>

            {/* Transaction Summary */}
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4"
            >
              <h4 className="text-sm font-bold text-[#1B2A4A] mb-3">Summary</h4>
              <div className="space-y-2.5">
                {(['issuance', 'sale', 'purchase', 'retirement'] as const).map((type) => {
                  const txs = sortedTransactions.filter((t) => t.type === type);
                  const total = txs.reduce((sum, t) => sum + t.totalAmount, 0);
                  const tonnes = txs.reduce((sum, t) => sum + t.tonnes, 0);
                  const config = txTypeConfig[type];
                  const TxIcon = config.icon;
                  return (
                    <div key={type} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center ${config.color}`}
                        >
                          <TxIcon size={13} />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-[#1B2A4A]">{config.label}s</p>
                          <p className="text-[10px] text-gray-400">
                            {txs.length} transactions &middot; {tonnes.toLocaleString()} tCO2e
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-[#1B2A4A]">
                        {formatCurrency(total)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </motion.section>
        )}

        {/* ─── Retire Tab ──────────────────────────────────────────────── */}
        {activeTab === 'retire' && (
          <motion.section
            key="retire"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="px-4"
          >
            <RetireSection credits={carbonCredits} />
          </motion.section>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
