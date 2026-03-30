'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/supabase/auth-context';
import { createClient } from '@/lib/supabase/client';
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
// ---------------------------------------------------------------------------
// Inline fallback data (was @/lib/data/exports)
// ---------------------------------------------------------------------------

type DocumentType = 'phytosanitary' | 'certificate-of-origin' | 'bill-of-lading' | 'packing-list' | 'commercial-invoice' | 'fumigation-cert' | 'quality-cert' | 'customs-declaration';
type DocumentStatus = 'not-started' | 'in-progress' | 'submitted' | 'approved' | 'rejected';
type ShipmentStatus = 'preparing' | 'customs-clearance' | 'in-transit' | 'at-port' | 'delivered';

interface ExportDocument {
  id: string;
  shipmentId: string;
  type: DocumentType;
  title: string;
  status: DocumentStatus;
  issuedBy: string;
  issuedDate: string | null;
  expiryDate: string | null;
  reference: string;
  notes: string;
}

interface ExportShipment {
  id: string;
  exporterId: string;
  exporterName: string;
  product: string;
  quantity: string;
  destination: string;
  destinationPort: string;
  originPort: string;
  vessel: string | null;
  status: ShipmentStatus;
  estimatedDeparture: string;
  estimatedArrival: string;
  actualDeparture: string | null;
  value: number;
  currency: string;
  documents: string[];
  timeline: { date: string; event: string; location: string }[];
}

const FALLBACK_EXPORT_DOCUMENTS: ExportDocument[] = [
  { id: 'DOC-001', shipmentId: 'EXP-001', type: 'phytosanitary', title: 'Phytosanitary Certificate - Tobacco Leaf Export', status: 'approved', issuedBy: 'Zimbabwe Plant Quarantine Services', issuedDate: '2026-02-18', expiryDate: '2026-04-18', reference: 'ZW-PHYTO-2026-04218', notes: 'Inspected and certified free from pests and diseases. Compliant with EU Commission Regulation 2019/2072.' },
  { id: 'DOC-002', shipmentId: 'EXP-001', type: 'certificate-of-origin', title: 'Certificate of Origin - Zimbabwe Chamber of Commerce', status: 'approved', issuedBy: 'Zimbabwe National Chamber of Commerce', issuedDate: '2026-02-20', expiryDate: null, reference: 'ZNCC-COO-2026-1087', notes: 'Origin confirmed as Mashonaland East, Zimbabwe. Eligible for EPA preferential tariff rate.' },
  { id: 'DOC-003', shipmentId: 'EXP-001', type: 'bill-of-lading', title: 'Bill of Lading - Beira to Rotterdam', status: 'approved', issuedBy: 'Maersk Line', issuedDate: '2026-03-02', expiryDate: null, reference: 'MAEU-BL-264891', notes: 'Three original bills issued. Clean on board. Freight prepaid.' },
  { id: 'DOC-004', shipmentId: 'EXP-001', type: 'fumigation-cert', title: 'Fumigation Certificate - Container Treatment', status: 'approved', issuedBy: 'Rentokil Zimbabwe', issuedDate: '2026-02-25', expiryDate: '2026-03-25', reference: 'RK-FUM-2026-0342', notes: 'Methyl bromide treatment per ISPM 15. Both containers treated and sealed.' },
  { id: 'DOC-005', shipmentId: 'EXP-002', type: 'phytosanitary', title: 'Phytosanitary Certificate - Sesame Seed Export', status: 'approved', issuedBy: 'Tanzania Plant Health Services', issuedDate: '2026-03-01', expiryDate: '2026-05-01', reference: 'TZ-PHYTO-2026-08912', notes: 'Tested for aflatoxin levels, within acceptable limits for UAE import standards.' },
  { id: 'DOC-006', shipmentId: 'EXP-002', type: 'quality-cert', title: 'Quality Certificate - SGS Inspection', status: 'approved', issuedBy: 'SGS Tanzania', issuedDate: '2026-03-03', expiryDate: null, reference: 'SGS-QC-DAR-2026-0456', notes: 'Purity 99.2%, moisture 5.8%, oil content 52.1%. Meets UAE import grade requirements.' },
  { id: 'DOC-007', shipmentId: 'EXP-002', type: 'commercial-invoice', title: 'Commercial Invoice - Sesame Seeds to Dubai', status: 'approved', issuedBy: 'Kilango Sesame Estates', issuedDate: '2026-03-04', expiryDate: null, reference: 'KSE-INV-2026-078', notes: 'FOB Dar es Salaam. Payment terms: irrevocable LC at sight.' },
  { id: 'DOC-008', shipmentId: 'EXP-003', type: 'phytosanitary', title: 'Phytosanitary Certificate - Cut Flowers Export', status: 'approved', issuedBy: 'Tanzania Plant Health Services', issuedDate: '2026-03-10', expiryDate: '2026-03-24', reference: 'TZ-PHYTO-2026-09134', notes: 'Roses and chrysanthemums inspected. No regulated pests detected. EU import compliant.' },
  { id: 'DOC-009', shipmentId: 'EXP-003', type: 'packing-list', title: 'Packing List - Fresh Cut Flowers', status: 'approved', issuedBy: 'Mwangosi Plantation Group', issuedDate: '2026-03-10', expiryDate: null, reference: 'MPG-PL-2026-0312', notes: '240 cartons roses (60 stems each), 180 cartons chrysanthemums (40 stems each). Packed in wet foam.' },
  { id: 'DOC-010', shipmentId: 'EXP-003', type: 'customs-declaration', title: 'Customs Export Declaration - Airfreight', status: 'approved', issuedBy: 'Tanzania Revenue Authority', issuedDate: '2026-03-11', expiryDate: null, reference: 'TRA-EXP-2026-22901', notes: 'HS Code 0603.11 and 0603.19. Zero-rated VAT on agricultural exports.' },
  { id: 'DOC-011', shipmentId: 'EXP-004', type: 'phytosanitary', title: 'Phytosanitary Certificate - Groundnut Export', status: 'in-progress', issuedBy: 'Zimbabwe Plant Quarantine Services', issuedDate: null, expiryDate: null, reference: 'ZW-PHYTO-2026-PENDING', notes: 'Samples submitted for aflatoxin testing. Results expected within 48 hours.' },
  { id: 'DOC-012', shipmentId: 'EXP-004', type: 'certificate-of-origin', title: 'Certificate of Origin - Groundnuts', status: 'submitted', issuedBy: 'Zimbabwe National Chamber of Commerce', issuedDate: null, expiryDate: null, reference: 'ZNCC-COO-2026-PENDING', notes: 'Application submitted. Processing takes 3-5 business days.' },
  { id: 'DOC-013', shipmentId: 'EXP-004', type: 'quality-cert', title: 'Quality Certificate - Groundnut Grade A', status: 'approved', issuedBy: 'Bureau Veritas Zimbabwe', issuedDate: '2026-03-08', expiryDate: null, reference: 'BV-QC-HRE-2026-0189', notes: 'Virginia type, hand-picked selected. Moisture 6.2%, count 38-42/oz. Export grade A confirmed.' },
  { id: 'DOC-014', shipmentId: 'EXP-005', type: 'phytosanitary', title: 'Phytosanitary Certificate - Citrus Export', status: 'not-started', issuedBy: 'Botswana Ministry of Agriculture', issuedDate: null, expiryDate: null, reference: 'BW-PHYTO-2026-PENDING', notes: 'Inspection to be scheduled once packing is complete. Estimate: 22 March.' },
  { id: 'DOC-015', shipmentId: 'EXP-005', type: 'packing-list', title: 'Packing List - Fresh Oranges and Lemons', status: 'in-progress', issuedBy: 'Kebonye Fresh Produce', issuedDate: null, expiryDate: null, reference: 'KFP-PL-2026-DRAFT', notes: 'Draft in preparation. Expected 2,400 cartons oranges (15kg), 800 cartons lemons (10kg).' },
  { id: 'DOC-016', shipmentId: 'EXP-006', type: 'phytosanitary', title: 'Phytosanitary Certificate - Spice Export', status: 'approved', issuedBy: 'Tanzania Plant Health Services', issuedDate: '2026-02-28', expiryDate: '2026-04-28', reference: 'TZ-PHYTO-2026-08756', notes: 'Cloves, cardamom, and black pepper. EU MRL compliance confirmed.' },
  { id: 'DOC-017', shipmentId: 'EXP-006', type: 'certificate-of-origin', title: 'Certificate of Origin - Zanzibar Spices', status: 'approved', issuedBy: 'Tanzania Chamber of Commerce', issuedDate: '2026-03-01', expiryDate: null, reference: 'TCCIA-COO-2026-3312', notes: 'Origin confirmed as Zanzibar and Pemba islands. EBA (Everything But Arms) preferential treatment eligible.' },
  { id: 'DOC-018', shipmentId: 'EXP-006', type: 'fumigation-cert', title: 'Fumigation Certificate - Spice Consignment', status: 'approved', issuedBy: 'Pest Control Services Tanzania', issuedDate: '2026-03-02', expiryDate: '2026-04-02', reference: 'PCST-FUM-2026-0198', notes: 'Phosphine fumigation completed. 72-hour treatment period. All products below EU residue limits.' },
  { id: 'DOC-019', shipmentId: 'EXP-006', type: 'commercial-invoice', title: 'Commercial Invoice - Spices to Hamburg', status: 'approved', issuedBy: 'Zanzibar Spice Exports', issuedDate: '2026-03-03', expiryDate: null, reference: 'ZSE-INV-2026-0045', notes: 'CIF Hamburg. Payment via documentary collection D/P 30 days.' },
  { id: 'DOC-020', shipmentId: 'EXP-006', type: 'bill-of-lading', title: 'Bill of Lading - Dar es Salaam to Hamburg', status: 'submitted', issuedBy: 'MSC Mediterranean Shipping', issuedDate: null, expiryDate: null, reference: 'MSCU-BL-PENDING', notes: 'Draft B/L submitted for shipper approval. Awaiting vessel confirmation for MSC Rosaria.' },
];

const FALLBACK_EXPORT_SHIPMENTS: ExportShipment[] = [
  { id: 'EXP-001', exporterId: 'AFU-2024-037', exporterName: 'Rudo Chidyamakono', product: 'Flue-Cured Virginia Tobacco', quantity: '36,000 kg (2 x 20ft containers)', destination: 'Netherlands', destinationPort: 'Rotterdam', originPort: 'Beira, Mozambique', vessel: 'MV Maersk Seletar', status: 'in-transit', estimatedDeparture: '2026-03-02', estimatedArrival: '2026-03-28', actualDeparture: '2026-03-02', value: 216000, currency: 'USD', documents: ['DOC-001', 'DOC-002', 'DOC-003', 'DOC-004'], timeline: [{ date: '2026-02-10', event: 'Export order confirmed with buyer', location: 'Harare, Zimbabwe' }, { date: '2026-02-18', event: 'Phytosanitary certificate issued', location: 'Harare, Zimbabwe' }, { date: '2026-02-25', event: 'Containers fumigated and sealed', location: 'Harare, Zimbabwe' }, { date: '2026-02-28', event: 'Trucked to Beira port via Machipanda', location: 'Mutare, Zimbabwe' }, { date: '2026-03-01', event: 'Arrived at Beira container terminal', location: 'Beira, Mozambique' }, { date: '2026-03-02', event: 'Loaded on vessel, departed Beira', location: 'Beira, Mozambique' }, { date: '2026-03-15', event: 'Vessel passed Suez Canal', location: 'Suez Canal, Egypt' }] },
  { id: 'EXP-002', exporterId: 'AFU-2024-041', exporterName: 'Grace Kilango', product: 'White Sesame Seeds (hulled)', quantity: '44,000 kg (2 x 20ft containers)', destination: 'United Arab Emirates', destinationPort: 'Jebel Ali, Dubai', originPort: 'Dar es Salaam, Tanzania', vessel: 'MSC Anzu', status: 'at-port', estimatedDeparture: '2026-03-18', estimatedArrival: '2026-04-02', actualDeparture: null, value: 123200, currency: 'USD', documents: ['DOC-005', 'DOC-006', 'DOC-007'], timeline: [{ date: '2026-02-20', event: 'Purchase order received from Dubai buyer', location: 'Iringa, Tanzania' }, { date: '2026-03-01', event: 'Phytosanitary inspection passed', location: 'Dar es Salaam, Tanzania' }, { date: '2026-03-03', event: 'SGS quality inspection completed', location: 'Dar es Salaam, Tanzania' }, { date: '2026-03-10', event: 'Containers stuffed at Dar port CFS', location: 'Dar es Salaam, Tanzania' }, { date: '2026-03-14', event: 'Customs declaration cleared', location: 'Dar es Salaam, Tanzania' }, { date: '2026-03-16', event: 'Containers placed at berth, awaiting vessel', location: 'Dar es Salaam, Tanzania' }] },
  { id: 'EXP-003', exporterId: 'AFU-2024-047', exporterName: 'Joseph Mwangosi', product: 'Fresh Cut Flowers (Roses & Chrysanthemums)', quantity: '420 cartons (approx. 6,300 kg)', destination: 'Netherlands', destinationPort: 'Amsterdam (Schiphol Airport)', originPort: 'Julius Nyerere International Airport, Dar es Salaam', vessel: null, status: 'customs-clearance', estimatedDeparture: '2026-03-17', estimatedArrival: '2026-03-18', actualDeparture: null, value: 94500, currency: 'USD', documents: ['DOC-008', 'DOC-009', 'DOC-010'], timeline: [{ date: '2026-03-08', event: 'Flower order confirmed for Dutch auction', location: 'Mbeya, Tanzania' }, { date: '2026-03-10', event: 'Harvesting and packing completed', location: 'Mbeya, Tanzania' }, { date: '2026-03-11', event: 'Cold chain truck departed for Dar airport', location: 'Mbeya, Tanzania' }, { date: '2026-03-12', event: 'Arrived at airport cold store', location: 'Dar es Salaam, Tanzania' }, { date: '2026-03-14', event: 'Pre-export phyto inspection passed', location: 'Dar es Salaam, Tanzania' }, { date: '2026-03-16', event: 'Customs processing underway', location: 'Dar es Salaam, Tanzania' }] },
  { id: 'EXP-004', exporterId: 'AFU-2024-046', exporterName: 'Blessing Murefu', product: 'Groundnuts (Virginia type, Grade A)', quantity: '80,000 kg (4 x 20ft containers)', destination: 'India', destinationPort: 'Nhava Sheva (JNPT), Mumbai', originPort: 'Beira, Mozambique', vessel: null, status: 'preparing', estimatedDeparture: '2026-04-05', estimatedArrival: '2026-04-25', actualDeparture: null, value: 240000, currency: 'USD', documents: ['DOC-011', 'DOC-012', 'DOC-013'], timeline: [{ date: '2026-02-28', event: 'Contract signed with Indian importer', location: 'Harare, Zimbabwe' }, { date: '2026-03-05', event: 'Grading and sorting commenced', location: 'Marondera, Zimbabwe' }, { date: '2026-03-08', event: 'Quality certificate issued by Bureau Veritas', location: 'Harare, Zimbabwe' }, { date: '2026-03-12', event: 'Phyto samples submitted for lab analysis', location: 'Harare, Zimbabwe' }, { date: '2026-03-15', event: 'Certificate of origin application submitted', location: 'Harare, Zimbabwe' }] },
  { id: 'EXP-005', exporterId: 'AFU-2024-042', exporterName: 'Phenyo Kebonye', product: 'Fresh Citrus (Navel Oranges & Eureka Lemons)', quantity: '44,000 kg (2 x reefer containers)', destination: 'Saudi Arabia', destinationPort: 'Jeddah Islamic Port', originPort: 'Durban, South Africa', vessel: null, status: 'preparing', estimatedDeparture: '2026-04-10', estimatedArrival: '2026-05-02', actualDeparture: null, value: 66000, currency: 'USD', documents: ['DOC-014', 'DOC-015'], timeline: [{ date: '2026-03-05', event: 'Citrus harvest commenced', location: 'Gaborone, Botswana' }, { date: '2026-03-10', event: 'Buyer confirmed order specifications', location: 'Gaborone, Botswana' }, { date: '2026-03-14', event: 'Packing list draft in preparation', location: 'Gaborone, Botswana' }] },
  { id: 'EXP-006', exporterId: 'AFU-2024-047', exporterName: 'Joseph Mwangosi', product: 'Mixed Spices (Cloves, Cardamom, Black Pepper)', quantity: '18,000 kg (1 x 20ft container)', destination: 'Germany', destinationPort: 'Hamburg', originPort: 'Dar es Salaam, Tanzania', vessel: null, status: 'customs-clearance', estimatedDeparture: '2026-03-22', estimatedArrival: '2026-04-18', actualDeparture: null, value: 162000, currency: 'USD', documents: ['DOC-016', 'DOC-017', 'DOC-018', 'DOC-019', 'DOC-020'], timeline: [{ date: '2026-02-15', event: 'Spice procurement from Zanzibar cooperatives', location: 'Zanzibar, Tanzania' }, { date: '2026-02-25', event: 'Quality grading and sorting completed', location: 'Zanzibar, Tanzania' }, { date: '2026-02-28', event: 'Phytosanitary inspection passed', location: 'Dar es Salaam, Tanzania' }, { date: '2026-03-02', event: 'Fumigation treatment completed', location: 'Dar es Salaam, Tanzania' }, { date: '2026-03-05', event: 'Container stuffed at Dar port CFS', location: 'Dar es Salaam, Tanzania' }, { date: '2026-03-10', event: 'Customs documentation submitted', location: 'Dar es Salaam, Tanzania' }, { date: '2026-03-16', event: 'Awaiting Bill of Lading confirmation', location: 'Dar es Salaam, Tanzania' }] },
];

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
  'commercial-invoice': { bg: 'bg-[#8CB89C]/10', text: 'text-[#8CB89C]' },
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
  const shipment = FALLBACK_EXPORT_SHIPMENTS.find((s) => s.id === doc.shipmentId);
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
            <button className="flex items-center gap-1 text-xs font-semibold text-[#8CB89C] bg-[#8CB89C]/10 hover:bg-[#8CB89C]/20 px-3 py-1.5 rounded-lg transition-colors">
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
  const docs = FALLBACK_EXPORT_DOCUMENTS.filter((d) =>
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
        <button className="flex items-center gap-1 text-xs font-semibold text-[#8CB89C] bg-[#8CB89C]/10 hover:bg-[#8CB89C]/20 px-3 py-1.5 rounded-lg transition-colors">
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
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [typeFilter, setTypeFilter] = useState<DocumentType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<DocumentStatus | 'all'>(
    'all'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [liveDocs, setLiveDocs] = useState<ExportDocument[]>(FALLBACK_EXPORT_DOCUMENTS);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    const load = async () => {
      try {
        const { data } = await supabase
          .from('export_documents')
          .select('*')
          .order('created_at', { ascending: false });
        if (data && data.length > 0) {
          setLiveDocs(data.map((d: any) => ({
            id: d.id,
            shipmentId: d.member_id || '',
            type: (d.document_type || 'commercial-invoice') as DocumentType,
            title: d.document_type?.replace(/-/g, ' ') || d.id,
            status: (d.status || 'not-started') as DocumentStatus,
            issuedBy: d.country_of_origin || '',
            issuedDate: d.created_at?.split('T')[0] || null,
            expiryDate: null,
            reference: d.id,
            notes: d.notes || '',
          })));
        }
      } catch { /* keep fallback */ }
      setDataLoading(false);
    };
    load();
  }, [user]);

  // Stats
  const totalDocs = liveDocs.length;
  const approvedDocs = liveDocs.filter(
    (d) => d.status === 'approved'
  ).length;
  const pendingDocs = liveDocs.filter(
    (d) => d.status === 'in-progress' || d.status === 'submitted'
  ).length;
  const expiringSoon = liveDocs.filter((d) =>
    isExpiringSoon(d.expiryDate)
  ).length;

  // Filtered documents
  const filteredDocs = useMemo(() => {
    let list = liveDocs;
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
      <div className="bg-gradient-to-br from-[#8CB89C] via-[#8CB89C] to-[#1B2A4A]/30 text-white">
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
                  ? 'bg-[#8CB89C] text-white shadow-sm'
                  : 'text-gray-500 hover:text-[#8CB89C] hover:bg-gray-50'
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
                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8CB89C]/40 focus:border-[#8CB89C]"
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
                        ? 'bg-[#8CB89C] text-white'
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
                            ? 'bg-[#8CB89C] text-white'
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
                        ? 'bg-[#8CB89C] text-white'
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
                          ? 'bg-[#8CB89C] text-white'
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
              {FALLBACK_EXPORT_SHIPMENTS.map((shipment) => (
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
