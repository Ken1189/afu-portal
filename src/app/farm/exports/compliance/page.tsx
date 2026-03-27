'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/supabase/auth-context';
import { createClient } from '@/lib/supabase/client';
import {
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Calendar,
  Clock,
  Award,
  FileText,
  Eye,
  Download,
  RefreshCw,
  ClipboardCheck,
  AlertCircle,
  ChevronRight,
  Leaf,
  Package,
  Tag,
  Stamp,
  Shield,
  Users,
  MapPin,
  Search,
  ExternalLink,
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
// Types & Data
// ---------------------------------------------------------------------------

type TabType = 'requirements' | 'certifications' | 'audits';

type ComplianceStatus = 'compliant' | 'non-compliant' | 'partial';

interface ComplianceRequirement {
  name: string;
  checked: boolean;
  notes: string;
}

interface ComplianceCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  status: ComplianceStatus;
  color: string;
  bgColor: string;
  requirements: ComplianceRequirement[];
  nextReviewDate: string;
  actionItems: string[];
}

interface Certification {
  id: string;
  name: string;
  issuingBody: string;
  issueDate: string;
  expiryDate: string;
  status: 'active' | 'expiring' | 'expired' | 'pending';
  description: string;
  renewalReminder: string | null;
}

interface AuditRecord {
  id: string;
  date: string;
  auditor: string;
  scope: string;
  type: 'internal' | 'external' | 'regulatory';
  findings: string[];
  correctiveActions: string[];
  status: 'completed' | 'in-progress' | 'scheduled';
}

const COMPLIANCE_CATEGORIES: ComplianceCategory[] = [
  {
    id: 'food-safety',
    name: 'Food Safety',
    icon: <ShieldCheck className="w-5 h-5" />,
    status: 'compliant',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    requirements: [
      { name: 'HACCP plan documented and implemented', checked: true, notes: 'Last updated Feb 2026' },
      { name: 'Aflatoxin testing for all grain exports', checked: true, notes: 'All shipments within limits' },
      { name: 'Maximum Residue Levels (MRL) compliance', checked: true, notes: 'EU and UAE standards met' },
      { name: 'Cold chain monitoring for perishables', checked: true, notes: 'IoT sensors deployed' },
      { name: 'Traceability system from farm to port', checked: true, notes: 'QR code system active' },
    ],
    nextReviewDate: '2026-06-15',
    actionItems: [],
  },
  {
    id: 'phytosanitary',
    name: 'Phytosanitary',
    icon: <Leaf className="w-5 h-5" />,
    status: 'compliant',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    requirements: [
      { name: 'Pest-free area certification maintained', checked: true, notes: 'Valid through 2026' },
      { name: 'Pre-export inspections completed for all shipments', checked: true, notes: 'EXP-001 to EXP-006' },
      { name: 'ISPM 15 wood packaging treatment', checked: true, notes: 'Methyl bromide protocol' },
      { name: 'Phytosanitary certificates obtained per shipment', checked: false, notes: 'EXP-004, EXP-005 pending' },
    ],
    nextReviewDate: '2026-04-20',
    actionItems: ['Expedite phyto cert for EXP-004 groundnut shipment', 'Schedule inspection for EXP-005 citrus'],
  },
  {
    id: 'customs',
    name: 'Customs',
    icon: <Stamp className="w-5 h-5" />,
    status: 'compliant',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    requirements: [
      { name: 'HS codes correctly classified for all products', checked: true, notes: 'Verified by customs broker' },
      { name: 'Export declarations filed on time', checked: true, notes: 'All current shipments filed' },
      { name: 'Preferential trade agreements documented', checked: true, notes: 'EPA, EBA eligibility confirmed' },
      { name: 'Duty drawback claims processed', checked: true, notes: 'Q1 claims submitted' },
    ],
    nextReviewDate: '2026-05-01',
    actionItems: [],
  },
  {
    id: 'quality-standards',
    name: 'Quality Standards',
    icon: <Award className="w-5 h-5" />,
    status: 'partial',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    requirements: [
      { name: 'Grade A quality for all export products', checked: true, notes: 'SGS/Bureau Veritas certified' },
      { name: 'Moisture content within acceptable range', checked: true, notes: 'All crops tested' },
      { name: 'Third-party inspection reports for each shipment', checked: false, notes: 'EXP-004 awaiting results' },
      { name: 'Buyer quality specifications met', checked: true, notes: 'Per contract specifications' },
    ],
    nextReviewDate: '2026-04-10',
    actionItems: ['Obtain Bureau Veritas report for EXP-004 groundnuts'],
  },
  {
    id: 'packaging',
    name: 'Packaging',
    icon: <Package className="w-5 h-5" />,
    status: 'compliant',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    requirements: [
      { name: 'Export-grade packaging materials used', checked: true, notes: 'Jute bags, cartons certified' },
      { name: 'Container fumigation per ISPM 15', checked: true, notes: 'All containers treated' },
      { name: 'Temperature-controlled packaging for perishables', checked: true, notes: 'Reefer containers booked' },
      { name: 'Packing lists accurate and complete', checked: true, notes: 'Verified per shipment' },
    ],
    nextReviewDate: '2026-07-01',
    actionItems: [],
  },
  {
    id: 'labeling',
    name: 'Labeling',
    icon: <Tag className="w-5 h-5" />,
    status: 'partial',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    requirements: [
      { name: 'Country of origin clearly marked', checked: true, notes: 'All packaging labeled' },
      { name: 'EU labeling requirements met', checked: true, notes: 'Reg. 1169/2011 compliance' },
      { name: 'Arabic labeling for Middle East markets', checked: false, notes: 'EXP-005 labels in design phase' },
      { name: 'Organic/Fair Trade labels where applicable', checked: true, notes: 'Certified products only' },
      { name: 'Batch/lot traceability codes on all units', checked: true, notes: 'QR code system active' },
    ],
    nextReviewDate: '2026-04-15',
    actionItems: ['Complete Arabic labeling design for Saudi citrus shipment'],
  },
];

const CERTIFICATIONS: Certification[] = [
  {
    id: 'cert-001',
    name: 'GlobalGAP',
    issuingBody: 'GLOBALG.A.P. c/o FoodPLUS GmbH',
    issueDate: '2025-09-01',
    expiryDate: '2026-08-31',
    status: 'active',
    description: 'Good Agricultural Practices certification for fruit, vegetable, and crop production. Covers farm operations in Zimbabwe and Tanzania.',
    renewalReminder: null,
  },
  {
    id: 'cert-002',
    name: 'HACCP',
    issuingBody: 'SGS International',
    issueDate: '2025-06-15',
    expiryDate: '2026-06-14',
    status: 'expiring',
    description: 'Hazard Analysis Critical Control Points certification for food safety management across all export processing facilities.',
    renewalReminder: 'Renewal audit scheduled for May 2026. Contact SGS Tanzania office.',
  },
  {
    id: 'cert-003',
    name: 'Organic Certification',
    issuingBody: 'Ecocert SA',
    issueDate: '2025-11-01',
    expiryDate: '2026-10-31',
    status: 'active',
    description: 'EU Organic Regulation (EC) 834/2007 certification for selected crop production. Covers sesame and spice operations.',
    renewalReminder: null,
  },
  {
    id: 'cert-004',
    name: 'Fair Trade',
    issuingBody: 'Fairtrade International',
    issueDate: '2025-04-01',
    expiryDate: '2026-03-31',
    status: 'expiring',
    description: 'Fairtrade certification for coffee, spice, and sesame cooperatives. Enables premium pricing and market access.',
    renewalReminder: 'Renewal due this month. Annual audit to be completed by March 31.',
  },
  {
    id: 'cert-005',
    name: 'ISO 22000',
    issuingBody: 'Bureau Veritas',
    issueDate: '2025-08-15',
    expiryDate: '2028-08-14',
    status: 'active',
    description: 'Food Safety Management System certification. Three-year certification with annual surveillance audits.',
    renewalReminder: null,
  },
];

const AUDIT_RECORDS: AuditRecord[] = [
  {
    id: 'audit-001',
    date: '2026-02-15',
    auditor: 'SGS Tanzania - Internal Audit Team',
    scope: 'HACCP pre-renewal assessment - Processing facilities',
    type: 'internal',
    findings: [
      'Minor: Temperature log gap in cold store B on Feb 3 (2 hours)',
      'Observation: Hand wash station soap dispenser empty in packing area',
    ],
    correctiveActions: [
      'Install backup temperature logger in cold store B - COMPLETED',
      'Assign daily soap check to shift supervisor - COMPLETED',
    ],
    status: 'completed',
  },
  {
    id: 'audit-002',
    date: '2026-01-20',
    auditor: 'Zimbabwe Plant Quarantine Services',
    scope: 'Phytosanitary compliance - Tobacco and groundnut facilities',
    type: 'regulatory',
    findings: [
      'All facilities in compliance with Zimbabwe Plant Pest Act',
      'Pest monitoring traps properly maintained and documented',
    ],
    correctiveActions: [],
    status: 'completed',
  },
  {
    id: 'audit-003',
    date: '2026-03-10',
    auditor: 'Bureau Veritas Zimbabwe',
    scope: 'ISO 22000 surveillance audit - Year 1',
    type: 'external',
    findings: [
      'Minor: Calibration records for weighing scale WS-04 overdue by 2 weeks',
      'Positive: Excellent traceability system implementation with QR codes',
      'Positive: Strong supplier verification program',
    ],
    correctiveActions: [
      'Recalibrate WS-04 and update calibration schedule - IN PROGRESS',
    ],
    status: 'completed',
  },
  {
    id: 'audit-004',
    date: '2026-04-20',
    auditor: 'Ecocert SA - East Africa',
    scope: 'Organic certification annual inspection - Zanzibar spice farms',
    type: 'external',
    findings: [],
    correctiveActions: [],
    status: 'scheduled',
  },
  {
    id: 'audit-005',
    date: '2026-05-05',
    auditor: 'SGS International',
    scope: 'HACCP renewal audit - All facilities',
    type: 'external',
    findings: [],
    correctiveActions: [],
    status: 'scheduled',
  },
  {
    id: 'audit-006',
    date: '2026-03-16',
    auditor: 'AFU Internal Quality Team',
    scope: 'Pre-shipment compliance check - EXP-004, EXP-005',
    type: 'internal',
    findings: [
      'EXP-004: Phytosanitary cert pending - aflatoxin test results awaited',
      'EXP-005: Packing list draft in preparation, not yet finalized',
      'EXP-005: Arabic labeling not yet designed for Saudi market',
    ],
    correctiveActions: [
      'Follow up with lab for EXP-004 results - IN PROGRESS',
      'Finalize EXP-005 packing list by March 20 - IN PROGRESS',
      'Engage label designer for Arabic text - IN PROGRESS',
    ],
    status: 'in-progress',
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const COMPLIANCE_STATUS_STYLES: Record<ComplianceStatus, string> = {
  compliant: 'bg-green-50 text-green-700 border-green-200',
  'non-compliant': 'bg-red-50 text-red-600 border-red-200',
  partial: 'bg-amber-50 text-amber-700 border-amber-200',
};

const COMPLIANCE_STATUS_LABELS: Record<ComplianceStatus, string> = {
  compliant: 'Compliant',
  'non-compliant': 'Non-Compliant',
  partial: 'Partial',
};

const CERT_STATUS_STYLES: Record<string, string> = {
  active: 'bg-green-50 text-green-700 border-green-200',
  expiring: 'bg-amber-50 text-amber-700 border-amber-200',
  expired: 'bg-red-50 text-red-600 border-red-200',
  pending: 'bg-blue-50 text-blue-700 border-blue-200',
};

const CERT_STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  expiring: 'Expiring Soon',
  expired: 'Expired',
  pending: 'Pending',
};

const AUDIT_STATUS_STYLES: Record<string, string> = {
  completed: 'bg-green-50 text-green-700 border-green-200',
  'in-progress': 'bg-amber-50 text-amber-700 border-amber-200',
  scheduled: 'bg-blue-50 text-blue-700 border-blue-200',
};

const AUDIT_STATUS_LABELS: Record<string, string> = {
  completed: 'Completed',
  'in-progress': 'In Progress',
  scheduled: 'Scheduled',
};

const AUDIT_TYPE_STYLES: Record<string, string> = {
  internal: 'bg-gray-100 text-gray-600',
  external: 'bg-[#8CB89C]/10 text-[#8CB89C]',
  regulatory: 'bg-[#1B2A4A]/10 text-[#1B2A4A]',
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function CircularProgress({
  score,
  size = 160,
}: {
  score: number;
  size?: number;
}) {
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const filled = (score / 100) * circumference;
  const color =
    score >= 80
      ? '#22c55e'
      : score >= 60
      ? '#f59e0b'
      : '#ef4444';

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#f3f4f6"
          strokeWidth="10"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - filled }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-3xl font-bold"
          style={{ color }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {score}%
        </motion.span>
        <span className="text-xs text-gray-400">Compliance</span>
      </div>
    </div>
  );
}

function ComplianceCategoryCard({
  category,
}: {
  category: ComplianceCategory;
}) {
  const [expanded, setExpanded] = useState(false);
  const checkedCount = category.requirements.filter((r) => r.checked).length;
  const totalCount = category.requirements.length;

  return (
    <motion.div
      variants={cardVariants}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-5 text-left"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl ${category.bgColor} ${category.color}`}
            >
              {category.icon}
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1B2A4A]">
                {category.name}
              </h3>
              <p className="text-xs text-gray-400">
                {checkedCount}/{totalCount} requirements met
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${COMPLIANCE_STATUS_STYLES[category.status]}`}
            >
              {COMPLIANCE_STATUS_LABELS[category.status]}
            </span>
            <ChevronRight
              className={`w-4 h-4 text-gray-400 transition-transform ${
                expanded ? 'rotate-90' : ''
              }`}
            />
          </div>
        </div>
      </button>

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
              {/* Requirements checklist */}
              <div className="space-y-2 mb-4">
                {category.requirements.map((req, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-2 p-2.5 rounded-xl ${
                      req.checked
                        ? 'bg-green-50/50 border border-green-100'
                        : 'bg-red-50/50 border border-red-100'
                    }`}
                  >
                    {req.checked ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="text-xs font-medium text-[#1B2A4A]">
                        {req.name}
                      </p>
                      <p className="text-[10px] text-gray-400">{req.notes}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Next review */}
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-500">
                  Next Review: {formatDate(category.nextReviewDate)}
                </span>
              </div>

              {/* Action items */}
              {category.actionItems.length > 0 && (
                <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
                  <p className="text-xs font-bold text-amber-700 mb-2 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Action Items
                  </p>
                  <ul className="space-y-1">
                    {category.actionItems.map((item, i) => (
                      <li
                        key={i}
                        className="text-xs text-amber-600 flex items-start gap-1.5"
                      >
                        <ChevronRight className="w-3 h-3 shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function CertificationCard({ cert }: { cert: Certification }) {
  return (
    <motion.div
      variants={cardVariants}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#D4A843]/10">
            <Award className="w-5 h-5 text-[#D4A843]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#1B2A4A]">{cert.name}</h3>
            <p className="text-xs text-gray-400">{cert.issuingBody}</p>
          </div>
        </div>
        <span
          className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${CERT_STATUS_STYLES[cert.status]}`}
        >
          {CERT_STATUS_LABELS[cert.status]}
        </span>
      </div>

      <p className="text-xs text-gray-500 mb-3 line-clamp-2">
        {cert.description}
      </p>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <p className="text-[10px] text-gray-400 uppercase tracking-wide">
            Issued
          </p>
          <p className="text-xs font-semibold text-[#1B2A4A]">
            {formatDate(cert.issueDate)}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-gray-400 uppercase tracking-wide">
            Expires
          </p>
          <p
            className={`text-xs font-semibold ${
              cert.status === 'expiring'
                ? 'text-amber-600'
                : cert.status === 'expired'
                ? 'text-red-600'
                : 'text-[#1B2A4A]'
            }`}
          >
            {formatDate(cert.expiryDate)}
          </p>
        </div>
      </div>

      {cert.renewalReminder && (
        <div className="bg-amber-50 rounded-xl p-2.5 border border-amber-100 mb-3">
          <p className="text-xs text-amber-700 flex items-start gap-1.5">
            <RefreshCw className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            {cert.renewalReminder}
          </p>
        </div>
      )}

      <button className="flex items-center gap-1 text-xs font-semibold text-[#8CB89C] bg-[#8CB89C]/10 hover:bg-[#8CB89C]/20 px-3 py-1.5 rounded-lg transition-colors">
        <Eye className="w-3.5 h-3.5" /> View Certificate
      </button>
    </motion.div>
  );
}

function AuditCard({ audit }: { audit: AuditRecord }) {
  return (
    <motion.div
      variants={cardVariants}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#1B2A4A]/10">
            <ClipboardCheck className="w-5 h-5 text-[#1B2A4A]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#1B2A4A]">
              {formatDate(audit.date)}
            </h3>
            <p className="text-xs text-gray-400">{audit.auditor}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${AUDIT_TYPE_STYLES[audit.type]}`}
          >
            {audit.type.charAt(0).toUpperCase() + audit.type.slice(1)}
          </span>
          <span
            className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${AUDIT_STATUS_STYLES[audit.status]}`}
          >
            {AUDIT_STATUS_LABELS[audit.status]}
          </span>
        </div>
      </div>

      {/* Scope */}
      <p className="text-xs text-gray-600 mb-3 bg-gray-50 rounded-xl p-2.5">
        {audit.scope}
      </p>

      {/* Findings */}
      {audit.findings.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-bold text-[#1B2A4A] mb-1.5">Findings</p>
          <ul className="space-y-1">
            {audit.findings.map((finding, i) => (
              <li
                key={i}
                className="text-xs text-gray-500 flex items-start gap-1.5"
              >
                <span className="shrink-0 mt-1 w-1.5 h-1.5 rounded-full bg-gray-300" />
                {finding}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Corrective actions */}
      {audit.correctiveActions.length > 0 && (
        <div>
          <p className="text-xs font-bold text-[#1B2A4A] mb-1.5">
            Corrective Actions
          </p>
          <ul className="space-y-1">
            {audit.correctiveActions.map((action, i) => (
              <li
                key={i}
                className="text-xs text-gray-500 flex items-start gap-1.5"
              >
                {action.includes('COMPLETED') ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
                ) : (
                  <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                )}
                {action}
              </li>
            ))}
          </ul>
        </div>
      )}

      {audit.status === 'scheduled' && audit.findings.length === 0 && (
        <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 rounded-xl p-2.5">
          <Calendar className="w-3.5 h-3.5" />
          Audit scheduled for {formatDate(audit.date)}
        </div>
      )}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function ExportCompliancePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('requirements');
  const [kycDocs, setKycDocs] = useState<any[]>([]);
  const [_dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    const load = async () => {
      try {
        const { data } = await supabase
          .from('kyc_documents')
          .select('*')
          .order('created_at', { ascending: false });
        if (data && data.length > 0) {
          setKycDocs(data);
        }
      } catch { /* keep fallback */ }
      setDataLoading(false);
    };
    load();
  }, [user]);

  // Overall compliance score
  const overallScore = useMemo(() => {
    const totalReqs = COMPLIANCE_CATEGORIES.reduce(
      (sum, cat) => sum + cat.requirements.length,
      0
    );
    const metReqs = COMPLIANCE_CATEGORIES.reduce(
      (sum, cat) =>
        sum + cat.requirements.filter((r) => r.checked).length,
      0
    );
    return totalReqs > 0 ? Math.round((metReqs / totalReqs) * 100) : 0;
  }, []);

  const tabs: { key: TabType; label: string }[] = [
    { key: 'requirements', label: 'Requirements' },
    { key: 'certifications', label: 'Certifications' },
    { key: 'audits', label: 'Audits' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-700 via-green-700 to-[#8CB89C]/30 text-white">
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
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold">
                  Export Compliance
                </h1>
                <p className="text-white/70 text-sm">
                  Track regulatory requirements, certifications, and audit
                  results
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
        {/* Overall Compliance Score */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 100, damping: 15 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6 flex flex-col sm:flex-row items-center gap-6"
        >
          <CircularProgress score={overallScore} />
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-lg font-bold text-[#1B2A4A] mb-1">
              Overall Compliance Score
            </h2>
            <p className="text-sm text-gray-500 mb-3">
              Based on {COMPLIANCE_CATEGORIES.reduce((s, c) => s + c.requirements.length, 0)} requirements across{' '}
              {COMPLIANCE_CATEGORIES.length} compliance categories
            </p>
            <div className="flex flex-wrap gap-2">
              {COMPLIANCE_CATEGORIES.map((cat) => (
                <span
                  key={cat.id}
                  className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${COMPLIANCE_STATUS_STYLES[cat.status]}`}
                >
                  {cat.name}: {COMPLIANCE_STATUS_LABELS[cat.status]}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Tab Switcher */}
        <div className="flex gap-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-1.5 mb-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 min-w-fit px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === tab.key
                  ? 'bg-green-700 text-white shadow-sm'
                  : 'text-gray-500 hover:text-green-700 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'requirements' && (
            <motion.div
              key="requirements"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              {COMPLIANCE_CATEGORIES.map((category) => (
                <ComplianceCategoryCard
                  key={category.id}
                  category={category}
                />
              ))}
            </motion.div>
          )}

          {activeTab === 'certifications' && (
            <motion.div
              key="certifications"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {CERTIFICATIONS.map((cert) => (
                <CertificationCard key={cert.id} cert={cert} />
              ))}
            </motion.div>
          )}

          {activeTab === 'audits' && (
            <motion.div
              key="audits"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {/* Divider: Upcoming */}
              <div className="flex items-center gap-2 mt-2">
                <Calendar className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-bold text-[#1B2A4A]">
                  Upcoming & In Progress
                </span>
              </div>
              {AUDIT_RECORDS.filter(
                (a) =>
                  a.status === 'scheduled' || a.status === 'in-progress'
              ).map((audit) => (
                <AuditCard key={audit.id} audit={audit} />
              ))}

              {/* Divider: Completed */}
              <div className="flex items-center gap-2 mt-4">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="text-sm font-bold text-[#1B2A4A]">
                  Completed Audits
                </span>
              </div>
              {AUDIT_RECORDS.filter((a) => a.status === 'completed').map(
                (audit) => (
                  <AuditCard key={audit.id} audit={audit} />
                )
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
