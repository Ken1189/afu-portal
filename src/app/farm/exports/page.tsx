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
// ---------------------------------------------------------------------------
// Inlined types & data (previously from @/lib/data/exports)
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

const exportDocuments: ExportDocument[] = [
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

const exportShipments: ExportShipment[] = [
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
