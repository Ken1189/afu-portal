'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Download,
  Eye,
  Search,
  Filter,
  Ship,
  Leaf,
  Receipt,
  Package,
  Shield,
  Stamp,
  Bug,
  Award,
  FileCheck,
  FilePlus,
  FileSpreadsheet,
  FileSignature,
  Calendar,
  Upload,
  ChevronRight,
  Anchor,
  Globe,
} from 'lucide-react';
import {
  exportDocuments,
  exportShipments,
  type ExportDocument,
  type DocumentType,
  type DocumentStatus,
  type ExportShipment,
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

type TabType = 'all' | 'by-shipment' | 'templates';

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

const DOC_STATUS_ICONS: Record<DocumentStatus, React.ReactNode> = {
  'not-started': <Clock className="w-4 h-4 text-gray-400" />,
  'in-progress': <AlertCircle className="w-4 h-4 text-amber-500" />,
  submitted: <Upload className="w-4 h-4 text-blue-500" />,
  approved: <CheckCircle2 className="w-4 h-4 text-green-500" />,
  rejected: <XCircle className="w-4 h-4 text-red-500" />,
};

const DOC_TYPE_LABELS: Record<DocumentType, string> = {
  phytosanitary: 'Phytosanitary Certificate',
  'certificate-of-origin': 'Certificate of Origin',
  'bill-of-lading': 'Bill of Lading',
  'packing-list': 'Packing List',
  'commercial-invoice': 'Commercial Invoice',
  'fumigation-cert': 'Fumigation Certificate',
  'quality-cert': 'Quality Certificate',
  'customs-declaration': 'Customs Declaration',
};

const DOC_TYPE_ICONS: Record<DocumentType, React.ReactNode> = {
  phytosanitary: <Leaf className="w-5 h-5" />,
  'certificate-of-origin': <Globe className="w-5 h-5" />,
  'bill-of-lading': <Ship className="w-5 h-5" />,
  'packing-list': <Package className="w-5 h-5" />,
  'commercial-invoice': <Receipt className="w-5 h-5" />,
  'fumigation-cert': <Bug className="w-5 h-5" />,
  'quality-cert': <Award className="w-5 h-5" />,
  'customs-declaration': <Stamp className="w-5 h-5" />,
};

const DOC_TYPE_COLORS: Record<DocumentType, { bg: string; text: string }> = {
  phytosanitary: { bg: 'bg-green-50', text: 'text-green-600' },
  'certificate-of-origin': { bg: 'bg-blue-50', text: 'text-blue-600' },
  'bill-of-lading': { bg: 'bg-[#1B2A4A]/10', text: 'text-[#1B2A4A]' },
  'packing-list': { bg: 'bg-amber-50', text: 'text-amber-600' },
  'commercial-invoice': { bg: 'bg-[#2AA198]/10', text: 'text-[#2AA198]' },
  'fumigation-cert': { bg: 'bg-purple-50', text: 'text-purple-600' },
  'quality-cert': { bg: 'bg-[#D4A843]/10', text: 'text-[#D4A843]' },
  'customs-declaration': { bg: 'bg-rose-50', text: 'text-rose-600' },
};

const REQUIRED_DOC_TYPES: DocumentType[] = [
  'phytosanitary',
  'certificate-of-origin',
  'bill-of-lading',
  'packing-list',
  'commercial-invoice',
  'fumigation-cert',
  'quality-cert',
  'customs-declaration',
];

interface TemplateItem {
  type: DocumentType;
  name: string;
  description: string;
}

const TEMPLATES: TemplateItem[] = [
  {
    type: 'commercial-invoice',
    name: 'Commercial Invoice',
    description:
      'Standard export invoice template with FOB/CIF/CFR terms, buyer/seller details, and HS code fields.',
  },
  {
    type: 'packing-list',
    name: 'Packing List',
    description:
      'Detailed packing list for containerized cargo with weight, dimensions, and marks/numbers.',
  },
  {
    type: 'certificate-of-origin',
    name: 'Certificate of Origin',
    description:
      'Chamber of commerce origin certificate template for preferential trade agreements.',
  },
  {
    type: 'bill-of-lading',
    name: 'Bill of Lading',
    description:
      'Ocean/air cargo receipt and title document. Pre-formatted for major shipping lines.',
  },
  {
    type: 'phytosanitary',
    name: 'Phytosanitary Application',
    description:
      'Application form for plant health inspection and phytosanitary certification.',
  },
  {
    type: 'fumigation-cert',
    name: 'Fumigation Request',
    description:
      'Pre-treatment request form for container fumigation per ISPM 15 standards.',
  },
  {
    type: 'quality-cert',
    name: 'Quality Inspection Request',
    description:
      'Request form for SGS/Bureau Veritas quality inspection and certification.',
  },
  {
    type: 'customs-declaration',
    name: 'Customs Export Declaration',
    description:
      'Revenue authority export declaration form with HS codes and valuation.',
  },
];

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function isExpiringSoon(dateStr: string | null): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  const diff = d.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return days >= 0 && days <= 30;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
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
    </motion.div>
  );
}

function DocumentCard({ doc }: { doc: ExportDocument }) {
  const shipment = exportShipments.find((s) => s.id === doc.shipmentId);
  const typeColor = DOC_TYPE_COLORS[doc.type];
  const expiringSoon = isExpiringSoon(doc.expiryDate);

  return (
    <motion.div
      variants={cardVariants}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start gap-3">
        {/* Type icon */}
        <div className={`p-2.5 rounded-xl ${typeColor.bg} ${typeColor.text} shrink-0`}>
          {DOC_TYPE_ICONS[doc.type]}
        </div>

        <div className="flex-1 min-w-0">
          {/* Title + Status */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-[#1B2A4A] truncate">
                {doc.title}
              </h3>
              <p className="text-xs text-gray-400">{doc.reference}</p>
            </div>
            <span
              className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border shrink-0 ${DOC_STATUS_STYLES[doc.status]}`}
            >
              {DOC_STATUS_LABELS[doc.status]}
            </span>
          </div>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
            {shipment && (
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Ship className="w-3 h-3" />
                {shipment.id} &mdash; {shipment.destination}
              </span>
            )}
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <FileText className="w-3 h-3" />
              {DOC_TYPE_LABELS[doc.type]}
            </span>
          </div>

          {/* Dates */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
            {doc.issuedDate && (
              <span className="text-xs text-gray-400">
                Issued: {formatDate(doc.issuedDate)}
              </span>
            )}
            {doc.expiryDate && (
              <span
                className={`text-xs flex items-center gap-1 ${
                  expiringSoon ? 'text-amber-600 font-semibold' : 'text-gray-400'
                }`}
              >
                {expiringSoon && <AlertCircle className="w-3 h-3" />}
                Expires: {formatDate(doc.expiryDate)}
              </span>
            )}
          </div>

          {/* Notes */}
          <p className="text-xs text-gray-400 mt-2 line-clamp-2">
            {doc.notes}
          </p>

          {/* Issued by */}
          <p className="text-xs text-gray-300 mt-1">
            Issued by: {doc.issuedBy}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-2 mt-3">
            <button className="flex items-center gap-1 text-xs font-semibold text-[#2AA198] bg-[#2AA198]/10 hover:bg-[#2AA198]/20 px-3 py-1.5 rounded-lg transition-colors">
              <Eye className="w-3.5 h-3.5" /> View
            </button>
            {doc.status === 'approved' && (
              <button className="flex items-center gap-1 text-xs font-semibold text-[#1B2A4A] bg-[#1B2A4A]/10 hover:bg-[#1B2A4A]/20 px-3 py-1.5 rounded-lg transition-colors">
                <Download className="w-3.5 h-3.5" /> Download
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ShipmentDocGroup({ shipment }: { shipment: ExportShipment }) {
  const docs = exportDocuments.filter((d) =>
    shipment.documents.includes(d.id)
  );

  return (
    <motion.div
      variants={cardVariants}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
    >
      {/* Shipment header */}
      <div className="bg-gray-50 px-5 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#1B2A4A]/10">
              <Ship className="w-4 h-4 text-[#1B2A4A]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1B2A4A]">
                {shipment.id} &mdash; {shipment.product}
              </h3>
              <p className="text-xs text-gray-400">
                {shipment.originPort} &rarr; {shipment.destinationPort}
              </p>
            </div>
          </div>
          <span className="text-xs text-gray-400">
            {docs.filter((d) => d.status === 'approved').length}/{docs.length}{' '}
            approved
          </span>
        </div>
      </div>

      {/* Document checklist */}
      <div className="p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {REQUIRED_DOC_TYPES.map((type) => {
            const doc = docs.find((d) => d.type === type);
            const hasDoc = !!doc;
            const isApproved = doc?.status === 'approved';
            const typeColor = DOC_TYPE_COLORS[type];

            return (
              <div
                key={type}
                className={`flex items-center gap-2 p-2.5 rounded-xl border ${
                  hasDoc && isApproved
                    ? 'border-green-200 bg-green-50/50'
                    : hasDoc
                    ? 'border-amber-200 bg-amber-50/50'
                    : 'border-gray-100 bg-gray-50/50'
                }`}
              >
                {hasDoc && isApproved ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                ) : hasDoc ? (
                  <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-gray-300 shrink-0" />
                )}
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-xs font-medium ${
                      hasDoc ? 'text-[#1B2A4A]' : 'text-gray-400'
                    }`}
                  >
                    {DOC_TYPE_LABELS[type]}
                  </p>
                  {doc && (
                    <p className="text-[10px] text-gray-400 truncate">
                      {doc.reference}
                    </p>
                  )}
                </div>
                {doc && (
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${DOC_STATUS_STYLES[doc.status]}`}
                  >
                    {DOC_STATUS_LABELS[doc.status]}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

function TemplateCard({ template }: { template: TemplateItem }) {
  const typeColor = DOC_TYPE_COLORS[template.type];

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ scale: 1.01, y: -2 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow"
    >
      <div
        className={`p-3 rounded-xl ${typeColor.bg} ${typeColor.text} w-fit mb-3`}
      >
        {DOC_TYPE_ICONS[template.type]}
      </div>
      <h3 className="text-sm font-bold text-[#1B2A4A] mb-1">
        {template.name}
      </h3>
      <p className="text-xs text-gray-400 mb-4 line-clamp-2">
        {template.description}
      </p>
      <div className="flex items-center gap-2">
        <button className="flex items-center gap-1 text-xs font-semibold text-[#1B2A4A] bg-[#1B2A4A]/10 hover:bg-[#1B2A4A]/20 px-3 py-1.5 rounded-lg transition-colors">
          <Download className="w-3.5 h-3.5" /> Download
        </button>
        <button className="flex items-center gap-1 text-xs font-semibold text-[#2AA198] bg-[#2AA198]/10 hover:bg-[#2AA198]/20 px-3 py-1.5 rounded-lg transition-colors">
          <FilePlus className="w-3.5 h-3.5" /> Fill Online
        </button>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function ExportDocumentsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [typeFilter, setTypeFilter] = useState<DocumentType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<DocumentStatus | 'all'>(
    'all'
  );
  const [searchQuery, setSearchQuery] = useState('');

  // Stats
  const totalDocs = exportDocuments.length;
  const approvedDocs = exportDocuments.filter(
    (d) => d.status === 'approved'
  ).length;
  const pendingDocs = exportDocuments.filter(
    (d) => d.status === 'in-progress' || d.status === 'submitted'
  ).length;
  const expiringSoon = exportDocuments.filter((d) =>
    isExpiringSoon(d.expiryDate)
  ).length;

  // Filtered documents
  const filteredDocs = useMemo(() => {
    let list = exportDocuments;
    if (typeFilter !== 'all') {
      list = list.filter((d) => d.type === typeFilter);
    }
    if (statusFilter !== 'all') {
      list = list.filter((d) => d.status === statusFilter);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.reference.toLowerCase().includes(q) ||
          d.issuedBy.toLowerCase().includes(q) ||
          d.notes.toLowerCase().includes(q)
      );
    }
    return list;
  }, [typeFilter, statusFilter, searchQuery]);

  const tabs: { key: TabType; label: string }[] = [
    { key: 'all', label: 'All Documents' },
    { key: 'by-shipment', label: 'By Shipment' },
    { key: 'templates', label: 'Templates' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#2AA198] via-[#2AA198] to-[#1B2A4A]/30 text-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 100, damping: 15 }}
          >
            <Link
              href="/farm/exports"
              className="inline-flex items-center gap-1.5 text-sm text-white/70 hover:text-white mb-3 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Export Hub
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/10 backdrop-blur rounded-xl">
                <FileText className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold">
                  Export Documents
                </h1>
                <p className="text-white/70 text-sm">
                  Manage certificates, invoices, and shipping documentation
                </p>
              </div>
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
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6"
        >
          <StatCard
            icon={<FileText className="w-5 h-5 text-[#1B2A4A]" />}
            label="Total Documents"
            value={String(totalDocs)}
            color="bg-[#1B2A4A]/10"
          />
          <StatCard
            icon={<CheckCircle2 className="w-5 h-5 text-green-600" />}
            label="Approved"
            value={String(approvedDocs)}
            color="bg-green-50"
          />
          <StatCard
            icon={<Clock className="w-5 h-5 text-amber-600" />}
            label="Pending Review"
            value={String(pendingDocs)}
            color="bg-amber-50"
          />
          <StatCard
            icon={<AlertCircle className="w-5 h-5 text-rose-600" />}
            label="Expiring Soon"
            value={String(expiringSoon)}
            color="bg-rose-50"
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
                  ? 'bg-[#2AA198] text-white shadow-sm'
                  : 'text-gray-500 hover:text-[#2AA198] hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'all' && (
            <motion.div
              key="all"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ type: 'spring', stiffness: 100, damping: 15 }}
            >
              {/* Filters */}
              <div className="space-y-3 mb-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search documents by title, reference, or issuer..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2AA198]/40 focus:border-[#2AA198]"
                  />
                </div>

                {/* Type filter */}
                <div className="flex gap-1 flex-wrap">
                  <span className="text-xs text-gray-400 self-center mr-1">
                    Type:
                  </span>
                  <button
                    onClick={() => setTypeFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      typeFilter === 'all'
                        ? 'bg-[#2AA198] text-white'
                        : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    All
                  </button>
                  {(Object.keys(DOC_TYPE_LABELS) as DocumentType[]).map(
                    (type) => (
                      <button
                        key={type}
                        onClick={() => setTypeFilter(type)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          typeFilter === type
                            ? 'bg-[#2AA198] text-white'
                            : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {DOC_TYPE_LABELS[type]}
                      </button>
                    )
                  )}
                </div>

                {/* Status filter */}
                <div className="flex gap-1 flex-wrap">
                  <span className="text-xs text-gray-400 self-center mr-1">
                    Status:
                  </span>
                  <button
                    onClick={() => setStatusFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      statusFilter === 'all'
                        ? 'bg-[#2AA198] text-white'
                        : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    All
                  </button>
                  {(
                    Object.keys(DOC_STATUS_LABELS) as DocumentStatus[]
                  ).map((status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        statusFilter === status
                          ? 'bg-[#2AA198] text-white'
                          : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {DOC_STATUS_LABELS[status]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Document list */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-3"
              >
                {filteredDocs.map((doc) => (
                  <DocumentCard key={doc.id} doc={doc} />
                ))}
                {filteredDocs.length === 0 && (
                  <div className="text-center py-16">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-400">
                      No documents match your filters
                    </p>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}

          {activeTab === 'by-shipment' && (
            <motion.div
              key="by-shipment"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {exportShipments.map((shipment) => (
                <ShipmentDocGroup key={shipment.id} shipment={shipment} />
              ))}
            </motion.div>
          )}

          {activeTab === 'templates' && (
            <motion.div
              key="templates"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              {TEMPLATES.map((template) => (
                <TemplateCard key={template.type} template={template} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
