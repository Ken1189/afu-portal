'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  Users,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Clock,
  Calendar,
  Award,
  FileCheck,
  ClipboardList,
  XCircle,
  ArrowUpDown,
  Eye,
  MoreHorizontal,
  TrendingUp,
  TrendingDown,
  Minus,
  BadgeCheck,
  RefreshCw,
  MapPin,
  User,
} from 'lucide-react';

// ── Animation variants ──────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 260,
      damping: 24,
    },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
};

// ── Types ───────────────────────────────────────────────────────────────────

type ComplianceStatus = 'compliant' | 'at-risk' | 'non-compliant';
type IssueSeverity = 'critical' | 'high' | 'medium' | 'low';
type IssueStatus = 'open' | 'in-progress' | 'resolved';
type AuditStatus = 'scheduled' | 'in-progress' | 'completed';

interface MemberCompliance {
  id: string;
  memberId: string;
  name: string;
  country: string;
  complianceScore: number;
  certifications: string[];
  lastAudit: string;
  status: ComplianceStatus;
  issuesOpen: number;
  riskFactors: string[];
}

interface ComplianceIssue {
  id: string;
  memberId: string;
  memberName: string;
  severity: IssueSeverity;
  category: string;
  description: string;
  dateRaised: string;
  deadline: string;
  assignedTo: string;
  status: IssueStatus;
}

interface Certification {
  id: string;
  memberId: string;
  memberName: string;
  certType: string;
  issuedDate: string;
  expiryDate: string;
  issuingBody: string;
  status: 'active' | 'expiring-soon' | 'expired';
}

interface AuditRecord {
  id: string;
  memberId: string;
  memberName: string;
  auditType: string;
  date: string;
  auditor: string;
  scope: string;
  status: AuditStatus;
  findings?: number;
  score?: number;
}

// ── Mock Data ───────────────────────────────────────────────────────────────

const fallback_memberCompliance: MemberCompliance[] = [
  {
    id: 'MC-001',
    memberId: 'AFU-2024-037',
    name: 'Rudo Chidyamakono',
    country: 'Zimbabwe',
    complianceScore: 96,
    certifications: ['GlobalG.A.P.', 'ISO 22000', 'Fair Trade'],
    lastAudit: '2026-01-15',
    status: 'compliant',
    issuesOpen: 0,
    riskFactors: [],
  },
  {
    id: 'MC-002',
    memberId: 'AFU-2024-041',
    name: 'Grace Kilango',
    country: 'Tanzania',
    complianceScore: 92,
    certifications: ['GlobalG.A.P.', 'Organic'],
    lastAudit: '2026-02-10',
    status: 'compliant',
    issuesOpen: 1,
    riskFactors: ['Minor documentation gap'],
  },
  {
    id: 'MC-003',
    memberId: 'AFU-2024-047',
    name: 'Joseph Mwangosi',
    country: 'Tanzania',
    complianceScore: 88,
    certifications: ['GlobalG.A.P.', 'Rainforest Alliance'],
    lastAudit: '2025-11-20',
    status: 'compliant',
    issuesOpen: 2,
    riskFactors: ['Overdue audit recertification'],
  },
  {
    id: 'MC-004',
    memberId: 'AFU-2024-046',
    name: 'Blessing Murefu',
    country: 'Zimbabwe',
    complianceScore: 74,
    certifications: ['ISO 22000'],
    lastAudit: '2025-09-05',
    status: 'at-risk',
    issuesOpen: 3,
    riskFactors: ['Overdue audit', 'Expired GlobalG.A.P.', 'Pending corrective actions'],
  },
  {
    id: 'MC-005',
    memberId: 'AFU-2024-042',
    name: 'Phenyo Kebonye',
    country: 'Botswana',
    complianceScore: 82,
    certifications: ['GlobalG.A.P.', 'HACCP'],
    lastAudit: '2025-12-18',
    status: 'compliant',
    issuesOpen: 1,
    riskFactors: ['Pending HACCP renewal'],
  },
  {
    id: 'MC-006',
    memberId: 'AFU-2024-050',
    name: 'Tariro Mhandu',
    country: 'Zimbabwe',
    complianceScore: 98,
    certifications: ['GlobalG.A.P.', 'Organic', 'Fair Trade', 'ISO 14001'],
    lastAudit: '2026-02-28',
    status: 'compliant',
    issuesOpen: 0,
    riskFactors: [],
  },
  {
    id: 'MC-007',
    memberId: 'AFU-2024-038',
    name: 'Amara Diallo',
    country: 'Ghana',
    complianceScore: 91,
    certifications: ['Organic', 'Fair Trade'],
    lastAudit: '2026-01-25',
    status: 'compliant',
    issuesOpen: 0,
    riskFactors: [],
  },
  {
    id: 'MC-008',
    memberId: 'AFU-2024-044',
    name: 'Kwame Asante',
    country: 'Ghana',
    complianceScore: 85,
    certifications: ['UTZ/Rainforest Alliance', 'GlobalG.A.P.'],
    lastAudit: '2025-10-12',
    status: 'compliant',
    issuesOpen: 1,
    riskFactors: ['Overdue for re-audit'],
  },
  {
    id: 'MC-009',
    memberId: 'AFU-2024-051',
    name: 'Fatima Osei',
    country: 'Tanzania',
    complianceScore: 62,
    certifications: ['HACCP'],
    lastAudit: '2025-07-10',
    status: 'non-compliant',
    issuesOpen: 5,
    riskFactors: ['Severely overdue audit', 'Multiple open CARs', 'Missing phyto documentation', 'No GlobalG.A.P.'],
  },
  {
    id: 'MC-010',
    memberId: 'AFU-2024-039',
    name: 'Tendai Moyo',
    country: 'Zimbabwe',
    complianceScore: 94,
    certifications: ['GlobalG.A.P.', 'ISO 22000', 'BRC'],
    lastAudit: '2026-03-02',
    status: 'compliant',
    issuesOpen: 0,
    riskFactors: [],
  },
  {
    id: 'MC-011',
    memberId: 'AFU-2024-053',
    name: 'Nomsa Dlamini',
    country: 'Zimbabwe',
    complianceScore: 78,
    certifications: ['GlobalG.A.P.'],
    lastAudit: '2025-10-28',
    status: 'at-risk',
    issuesOpen: 2,
    riskFactors: ['Overdue audit', 'Pending corrective action'],
  },
  {
    id: 'MC-012',
    memberId: 'AFU-2024-048',
    name: 'Sipho Nkomo',
    country: 'Tanzania',
    complianceScore: 58,
    certifications: [],
    lastAudit: '2025-06-15',
    status: 'non-compliant',
    issuesOpen: 4,
    riskFactors: ['No valid certifications', 'Severely overdue audit', 'Export documentation failures'],
  },
  {
    id: 'MC-013',
    memberId: 'AFU-2024-045',
    name: 'Chenai Mapfumo',
    country: 'Zimbabwe',
    complianceScore: 87,
    certifications: ['GlobalG.A.P.', 'ISO 22000'],
    lastAudit: '2025-12-05',
    status: 'compliant',
    issuesOpen: 1,
    riskFactors: ['Minor non-conformance pending close-out'],
  },
  {
    id: 'MC-014',
    memberId: 'AFU-2024-052',
    name: 'Keletso Molefe',
    country: 'Botswana',
    complianceScore: 71,
    certifications: ['HACCP'],
    lastAudit: '2025-08-22',
    status: 'at-risk',
    issuesOpen: 3,
    riskFactors: ['Overdue audit', 'Missing organic certification', 'Pending traceability system'],
  },
];

const fallback_complianceIssues: ComplianceIssue[] = [
  {
    id: 'ISS-001',
    memberId: 'AFU-2024-051',
    memberName: 'Fatima Osei',
    severity: 'critical',
    category: 'Documentation',
    description: 'Missing phytosanitary certificates for 3 recent shipments. Export compliance at risk.',
    dateRaised: '2026-03-01',
    deadline: '2026-03-15',
    assignedTo: 'John Banda',
    status: 'open',
  },
  {
    id: 'ISS-002',
    memberId: 'AFU-2024-048',
    memberName: 'Sipho Nkomo',
    severity: 'critical',
    category: 'Certification',
    description: 'No valid export certifications. All certifications have expired or were never obtained.',
    dateRaised: '2026-02-15',
    deadline: '2026-03-20',
    assignedTo: 'Mary Chikanda',
    status: 'in-progress',
  },
  {
    id: 'ISS-003',
    memberId: 'AFU-2024-046',
    memberName: 'Blessing Murefu',
    severity: 'high',
    category: 'Audit',
    description: 'Overdue for annual compliance audit. Last audit was September 2025.',
    dateRaised: '2026-01-10',
    deadline: '2026-03-31',
    assignedTo: 'John Banda',
    status: 'in-progress',
  },
  {
    id: 'ISS-004',
    memberId: 'AFU-2024-051',
    memberName: 'Fatima Osei',
    severity: 'high',
    category: 'Process',
    description: 'Traceability system not meeting minimum standards. Unable to trace product from farm to port.',
    dateRaised: '2026-02-20',
    deadline: '2026-04-15',
    assignedTo: 'Sarah Nkomo',
    status: 'open',
  },
  {
    id: 'ISS-005',
    memberId: 'AFU-2024-052',
    memberName: 'Keletso Molefe',
    severity: 'high',
    category: 'Certification',
    description: 'HACCP certification renewal overdue. Current certification expired January 2026.',
    dateRaised: '2026-02-01',
    deadline: '2026-03-30',
    assignedTo: 'Mary Chikanda',
    status: 'in-progress',
  },
  {
    id: 'ISS-006',
    memberId: 'AFU-2024-046',
    memberName: 'Blessing Murefu',
    severity: 'medium',
    category: 'Certification',
    description: 'GlobalG.A.P. certification expired December 2025. Renewal application pending.',
    dateRaised: '2026-01-05',
    deadline: '2026-04-01',
    assignedTo: 'Sarah Nkomo',
    status: 'in-progress',
  },
  {
    id: 'ISS-007',
    memberId: 'AFU-2024-053',
    memberName: 'Nomsa Dlamini',
    severity: 'medium',
    category: 'Audit',
    description: 'Corrective action report from October audit still not fully addressed.',
    dateRaised: '2025-12-15',
    deadline: '2026-03-15',
    assignedTo: 'John Banda',
    status: 'open',
  },
  {
    id: 'ISS-008',
    memberId: 'AFU-2024-041',
    memberName: 'Grace Kilango',
    severity: 'low',
    category: 'Documentation',
    description: 'Minor labelling inconsistency on export packing lists. Template needs updating.',
    dateRaised: '2026-03-05',
    deadline: '2026-04-30',
    assignedTo: 'Sarah Nkomo',
    status: 'open',
  },
  {
    id: 'ISS-009',
    memberId: 'AFU-2024-047',
    memberName: 'Joseph Mwangosi',
    severity: 'medium',
    category: 'Process',
    description: 'Cold chain monitoring records incomplete for recent flower shipment.',
    dateRaised: '2026-03-10',
    deadline: '2026-04-10',
    assignedTo: 'John Banda',
    status: 'open',
  },
  {
    id: 'ISS-010',
    memberId: 'AFU-2024-048',
    memberName: 'Sipho Nkomo',
    severity: 'critical',
    category: 'Process',
    description: 'Pest management plan non-existent. Required for all agricultural exporters.',
    dateRaised: '2026-02-28',
    deadline: '2026-03-28',
    assignedTo: 'Mary Chikanda',
    status: 'open',
  },
  {
    id: 'ISS-011',
    memberId: 'AFU-2024-045',
    memberName: 'Chenai Mapfumo',
    severity: 'low',
    category: 'Documentation',
    description: 'Staff training records not up to date. Annual refresher training overdue.',
    dateRaised: '2026-03-08',
    deadline: '2026-05-01',
    assignedTo: 'Sarah Nkomo',
    status: 'open',
  },
  {
    id: 'ISS-012',
    memberId: 'AFU-2024-044',
    memberName: 'Kwame Asante',
    severity: 'medium',
    category: 'Audit',
    description: 'Annual re-audit overdue. Last audit conducted October 2025.',
    dateRaised: '2026-01-20',
    deadline: '2026-03-31',
    assignedTo: 'John Banda',
    status: 'in-progress',
  },
  {
    id: 'ISS-013',
    memberId: 'AFU-2024-052',
    memberName: 'Keletso Molefe',
    severity: 'medium',
    category: 'Process',
    description: 'Traceability system needs upgrade to support batch-level tracking.',
    dateRaised: '2026-02-10',
    deadline: '2026-05-15',
    assignedTo: 'Sarah Nkomo',
    status: 'open',
  },
  {
    id: 'ISS-014',
    memberId: 'AFU-2024-051',
    memberName: 'Fatima Osei',
    severity: 'high',
    category: 'Audit',
    description: 'Severely overdue for compliance audit. Last audit July 2025.',
    dateRaised: '2026-01-15',
    deadline: '2026-02-28',
    assignedTo: 'John Banda',
    status: 'open',
  },
  {
    id: 'ISS-015',
    memberId: 'AFU-2024-037',
    memberName: 'Rudo Chidyamakono',
    severity: 'low',
    category: 'Documentation',
    description: 'Internal audit checklist template needs minor revision for 2026 standards.',
    dateRaised: '2026-03-12',
    deadline: '2026-06-01',
    assignedTo: 'Sarah Nkomo',
    status: 'resolved',
  },
];

const fallback_certifications: Certification[] = [
  { id: 'CERT-001', memberId: 'AFU-2024-037', memberName: 'Rudo Chidyamakono', certType: 'GlobalG.A.P.', issuedDate: '2025-06-15', expiryDate: '2026-06-15', issuingBody: 'Control Union', status: 'active' },
  { id: 'CERT-002', memberId: 'AFU-2024-037', memberName: 'Rudo Chidyamakono', certType: 'ISO 22000', issuedDate: '2025-03-10', expiryDate: '2028-03-10', issuingBody: 'SGS Zimbabwe', status: 'active' },
  { id: 'CERT-003', memberId: 'AFU-2024-037', memberName: 'Rudo Chidyamakono', certType: 'Fair Trade', issuedDate: '2024-09-01', expiryDate: '2027-09-01', issuingBody: 'FLO-CERT', status: 'active' },
  { id: 'CERT-004', memberId: 'AFU-2024-041', memberName: 'Grace Kilango', certType: 'GlobalG.A.P.', issuedDate: '2025-08-20', expiryDate: '2026-08-20', issuingBody: 'AfriCert', status: 'active' },
  { id: 'CERT-005', memberId: 'AFU-2024-041', memberName: 'Grace Kilango', certType: 'Organic', issuedDate: '2025-05-10', expiryDate: '2026-05-10', issuingBody: 'EcoCert', status: 'expiring-soon' },
  { id: 'CERT-006', memberId: 'AFU-2024-047', memberName: 'Joseph Mwangosi', certType: 'GlobalG.A.P.', issuedDate: '2025-04-15', expiryDate: '2026-04-15', issuingBody: 'AfriCert', status: 'expiring-soon' },
  { id: 'CERT-007', memberId: 'AFU-2024-047', memberName: 'Joseph Mwangosi', certType: 'Rainforest Alliance', issuedDate: '2025-07-01', expiryDate: '2026-07-01', issuingBody: 'RA Cert', status: 'active' },
  { id: 'CERT-008', memberId: 'AFU-2024-046', memberName: 'Blessing Murefu', certType: 'ISO 22000', issuedDate: '2024-11-01', expiryDate: '2027-11-01', issuingBody: 'SGS Zimbabwe', status: 'active' },
  { id: 'CERT-009', memberId: 'AFU-2024-046', memberName: 'Blessing Murefu', certType: 'GlobalG.A.P.', issuedDate: '2024-12-01', expiryDate: '2025-12-01', issuingBody: 'Control Union', status: 'expired' },
  { id: 'CERT-010', memberId: 'AFU-2024-042', memberName: 'Phenyo Kebonye', certType: 'GlobalG.A.P.', issuedDate: '2025-09-01', expiryDate: '2026-09-01', issuingBody: 'SGS Botswana', status: 'active' },
  { id: 'CERT-011', memberId: 'AFU-2024-042', memberName: 'Phenyo Kebonye', certType: 'HACCP', issuedDate: '2025-01-15', expiryDate: '2026-04-15', issuingBody: 'Bureau Veritas', status: 'expiring-soon' },
  { id: 'CERT-012', memberId: 'AFU-2024-050', memberName: 'Tariro Mhandu', certType: 'GlobalG.A.P.', issuedDate: '2025-10-01', expiryDate: '2026-10-01', issuingBody: 'Control Union', status: 'active' },
  { id: 'CERT-013', memberId: 'AFU-2024-050', memberName: 'Tariro Mhandu', certType: 'Organic', issuedDate: '2025-06-01', expiryDate: '2026-06-01', issuingBody: 'EcoCert', status: 'expiring-soon' },
  { id: 'CERT-014', memberId: 'AFU-2024-050', memberName: 'Tariro Mhandu', certType: 'Fair Trade', issuedDate: '2025-02-01', expiryDate: '2028-02-01', issuingBody: 'FLO-CERT', status: 'active' },
  { id: 'CERT-015', memberId: 'AFU-2024-050', memberName: 'Tariro Mhandu', certType: 'ISO 14001', issuedDate: '2025-08-01', expiryDate: '2028-08-01', issuingBody: 'SGS Zimbabwe', status: 'active' },
  { id: 'CERT-016', memberId: 'AFU-2024-038', memberName: 'Amara Diallo', certType: 'Organic', issuedDate: '2025-04-01', expiryDate: '2026-04-01', issuingBody: 'EcoCert', status: 'expiring-soon' },
  { id: 'CERT-017', memberId: 'AFU-2024-038', memberName: 'Amara Diallo', certType: 'Fair Trade', issuedDate: '2025-01-10', expiryDate: '2028-01-10', issuingBody: 'FLO-CERT', status: 'active' },
  { id: 'CERT-018', memberId: 'AFU-2024-044', memberName: 'Kwame Asante', certType: 'UTZ/Rainforest Alliance', issuedDate: '2025-03-15', expiryDate: '2026-03-15', issuingBody: 'RA Cert', status: 'expired' },
  { id: 'CERT-019', memberId: 'AFU-2024-044', memberName: 'Kwame Asante', certType: 'GlobalG.A.P.', issuedDate: '2025-07-20', expiryDate: '2026-07-20', issuingBody: 'AfriCert', status: 'active' },
  { id: 'CERT-020', memberId: 'AFU-2024-051', memberName: 'Fatima Osei', certType: 'HACCP', issuedDate: '2024-06-01', expiryDate: '2025-12-01', issuingBody: 'SGS Tanzania', status: 'expired' },
  { id: 'CERT-021', memberId: 'AFU-2024-039', memberName: 'Tendai Moyo', certType: 'GlobalG.A.P.', issuedDate: '2025-11-01', expiryDate: '2026-11-01', issuingBody: 'Control Union', status: 'active' },
  { id: 'CERT-022', memberId: 'AFU-2024-039', memberName: 'Tendai Moyo', certType: 'ISO 22000', issuedDate: '2025-05-01', expiryDate: '2028-05-01', issuingBody: 'SGS Zimbabwe', status: 'active' },
  { id: 'CERT-023', memberId: 'AFU-2024-039', memberName: 'Tendai Moyo', certType: 'BRC', issuedDate: '2025-09-15', expiryDate: '2026-09-15', issuingBody: 'BRCGS', status: 'active' },
  { id: 'CERT-024', memberId: 'AFU-2024-053', memberName: 'Nomsa Dlamini', certType: 'GlobalG.A.P.', issuedDate: '2025-05-15', expiryDate: '2026-05-15', issuingBody: 'Control Union', status: 'expiring-soon' },
  { id: 'CERT-025', memberId: 'AFU-2024-045', memberName: 'Chenai Mapfumo', certType: 'GlobalG.A.P.', issuedDate: '2025-08-10', expiryDate: '2026-08-10', issuingBody: 'Control Union', status: 'active' },
  { id: 'CERT-026', memberId: 'AFU-2024-045', memberName: 'Chenai Mapfumo', certType: 'ISO 22000', issuedDate: '2025-02-01', expiryDate: '2028-02-01', issuingBody: 'SGS Zimbabwe', status: 'active' },
  { id: 'CERT-027', memberId: 'AFU-2024-052', memberName: 'Keletso Molefe', certType: 'HACCP', issuedDate: '2025-01-01', expiryDate: '2026-01-01', issuingBody: 'Bureau Veritas', status: 'expired' },
];

const fallback_auditRecords: AuditRecord[] = [
  { id: 'AUD-001', memberId: 'AFU-2024-039', memberName: 'Tendai Moyo', auditType: 'Full Compliance', date: '2026-03-02', auditor: 'John Banda', scope: 'Export documentation, food safety, traceability', status: 'completed', findings: 0, score: 97 },
  { id: 'AUD-002', memberId: 'AFU-2024-050', memberName: 'Tariro Mhandu', auditType: 'Full Compliance', date: '2026-02-28', auditor: 'Mary Chikanda', scope: 'Organic standards, environmental compliance, labour practices', status: 'completed', findings: 1, score: 95 },
  { id: 'AUD-003', memberId: 'AFU-2024-041', memberName: 'Grace Kilango', auditType: 'Documentation Review', date: '2026-02-10', auditor: 'Sarah Nkomo', scope: 'Export documentation completeness', status: 'completed', findings: 2, score: 88 },
  { id: 'AUD-004', memberId: 'AFU-2024-038', memberName: 'Amara Diallo', auditType: 'Full Compliance', date: '2026-01-25', auditor: 'John Banda', scope: 'Fair trade standards, organic certification compliance', status: 'completed', findings: 0, score: 93 },
  { id: 'AUD-005', memberId: 'AFU-2024-037', memberName: 'Rudo Chidyamakono', auditType: 'Full Compliance', date: '2026-01-15', auditor: 'Mary Chikanda', scope: 'ISO 22000, export compliance, phytosanitary', status: 'completed', findings: 0, score: 98 },
  { id: 'AUD-006', memberId: 'AFU-2024-046', memberName: 'Blessing Murefu', auditType: 'Corrective Action Follow-up', date: '2026-03-20', auditor: 'John Banda', scope: 'Follow-up on certification gaps and documentation', status: 'scheduled', findings: undefined, score: undefined },
  { id: 'AUD-007', memberId: 'AFU-2024-051', memberName: 'Fatima Osei', auditType: 'Emergency Compliance Audit', date: '2026-03-25', auditor: 'Mary Chikanda', scope: 'Full compliance review - critical issues identified', status: 'scheduled', findings: undefined, score: undefined },
  { id: 'AUD-008', memberId: 'AFU-2024-044', memberName: 'Kwame Asante', auditType: 'Annual Re-Audit', date: '2026-04-02', auditor: 'Sarah Nkomo', scope: 'UTZ/RA compliance, export documentation, cocoa standards', status: 'scheduled', findings: undefined, score: undefined },
  { id: 'AUD-009', memberId: 'AFU-2024-053', memberName: 'Nomsa Dlamini', auditType: 'Corrective Action Follow-up', date: '2026-04-10', auditor: 'John Banda', scope: 'Follow-up on October 2025 audit findings', status: 'scheduled', findings: undefined, score: undefined },
  { id: 'AUD-010', memberId: 'AFU-2024-048', memberName: 'Sipho Nkomo', auditType: 'Emergency Compliance Audit', date: '2026-03-18', auditor: 'John Banda', scope: 'Full compliance assessment - non-compliant member', status: 'in-progress', findings: undefined, score: undefined },
  { id: 'AUD-011', memberId: 'AFU-2024-052', memberName: 'Keletso Molefe', auditType: 'Annual Re-Audit', date: '2026-04-15', auditor: 'Mary Chikanda', scope: 'HACCP renewal, traceability system assessment', status: 'scheduled', findings: undefined, score: undefined },
  { id: 'AUD-012', memberId: 'AFU-2024-047', memberName: 'Joseph Mwangosi', auditType: 'Annual Re-Audit', date: '2026-04-22', auditor: 'Sarah Nkomo', scope: 'GlobalG.A.P. renewal, Rainforest Alliance compliance', status: 'scheduled', findings: undefined, score: undefined },
];

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function daysUntil(dateStr: string): number {
  const now = new Date('2026-03-16');
  const target = new Date(dateStr);
  return Math.ceil((target.getTime() - now.getTime()) / 86400000);
}

// ── Status/Severity Config ──────────────────────────────────────────────────

const complianceStatusConfig: Record<ComplianceStatus, { label: string; bgColor: string; textColor: string }> = {
  compliant: { label: 'Compliant', bgColor: 'bg-green-50 border-green-200', textColor: 'text-green-700' },
  'at-risk': { label: 'At Risk', bgColor: 'bg-amber-50 border-amber-200', textColor: 'text-amber-700' },
  'non-compliant': { label: 'Non-Compliant', bgColor: 'bg-red-50 border-red-200', textColor: 'text-red-700' },
};

const severityConfig: Record<IssueSeverity, { label: string; bgColor: string; textColor: string; dotColor: string }> = {
  critical: { label: 'Critical', bgColor: 'bg-red-50 border-red-200', textColor: 'text-red-700', dotColor: 'bg-red-500' },
  high: { label: 'High', bgColor: 'bg-orange-50 border-orange-200', textColor: 'text-orange-700', dotColor: 'bg-orange-500' },
  medium: { label: 'Medium', bgColor: 'bg-amber-50 border-amber-200', textColor: 'text-amber-700', dotColor: 'bg-amber-500' },
  low: { label: 'Low', bgColor: 'bg-blue-50 border-blue-200', textColor: 'text-blue-700', dotColor: 'bg-blue-500' },
};

const issueStatusConfig: Record<IssueStatus, { label: string; bgColor: string; textColor: string }> = {
  open: { label: 'Open', bgColor: 'bg-red-50 border-red-200', textColor: 'text-red-600' },
  'in-progress': { label: 'In Progress', bgColor: 'bg-blue-50 border-blue-200', textColor: 'text-blue-600' },
  resolved: { label: 'Resolved', bgColor: 'bg-green-50 border-green-200', textColor: 'text-green-600' },
};

const auditStatusConfig: Record<AuditStatus, { label: string; bgColor: string; textColor: string }> = {
  scheduled: { label: 'Scheduled', bgColor: 'bg-blue-50 border-blue-200', textColor: 'text-blue-600' },
  'in-progress': { label: 'In Progress', bgColor: 'bg-amber-50 border-amber-200', textColor: 'text-amber-600' },
  completed: { label: 'Completed', bgColor: 'bg-green-50 border-green-200', textColor: 'text-green-600' },
};

// ═══════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function AdminCompliancePage() {
  const [activeTab, setActiveTab] = useState<'members' | 'issues' | 'certifications' | 'audits'>('members');
  const [memberCompliance, setMemberCompliance] = useState<MemberCompliance[]>(fallback_memberCompliance);
  const [complianceIssues, setComplianceIssues] = useState<ComplianceIssue[]>(fallback_complianceIssues);
  const [certifications, setCertifications] = useState<Certification[]>(fallback_certifications);
  const [auditRecords, setAuditRecords] = useState<AuditRecord[]>(fallback_auditRecords);
  const [isLoading, setIsLoading] = useState(true);

  const handleMarkResolved = (issueId: string) => {
    setComplianceIssues((prev) =>
      prev.map((i) => (i.id === issueId ? { ...i, status: 'resolved' as IssueStatus } : i))
    );
  };

  const handleExportComplianceCSV = () => {
    const headers = ['ID', 'Member', 'Severity', 'Category', 'Description', 'Status', 'Date Raised', 'Deadline', 'Assigned To'];
    const rows = complianceIssues.map((i) => [
      i.id, i.memberName, i.severity, i.category, `"${i.description.replace(/"/g, '""')}"`, i.status, i.dateRaised, i.deadline, i.assignedTo,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compliance_issues_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    const supabase = createClient();
    async function fetchData() {
      try {
        // Fetch KYC documents for compliance data
        const { data: kycData } = await supabase
          .from('kyc_documents')
          .select('*, profiles(full_name, country)')
          .order('created_at', { ascending: false });
        if (kycData && kycData.length > 0) {
          // Use KYC data to enhance compliance view
          // The member compliance data stays as fallback unless real data is available
        }

        // Fetch profiles with compliance info
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id, full_name, country, compliance_score, compliance_status, last_audit_date')
          .not('compliance_score', 'is', null);
        if (profileData && profileData.length > 0) {
          setMemberCompliance(
            profileData.map((row: Record<string, unknown>) => ({
              id: (row.id as string) || '',
              memberId: (row.id as string) || '',
              name: (row.full_name as string) || 'Unknown',
              country: (row.country as string) || '',
              complianceScore: (row.compliance_score as number) || 0,
              certifications: [],
              lastAudit: ((row.last_audit_date as string) || '')?.split('T')[0] || '',
              status: ((row.compliance_status as string) || 'compliant') as ComplianceStatus,
              issuesOpen: 0,
              riskFactors: [],
            }))
          );
        }
      } catch { /* fallback */ }
      setIsLoading(false);
    }
    fetchData();
  }, []);

  // Member Compliance filters
  const [memberSearch, setMemberSearch] = useState('');
  const [countryFilter, setCountryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [scoreFilter, setScoreFilter] = useState<string>('all');
  const [memberSortField, setMemberSortField] = useState<string>('name');
  const [memberSortDir, setMemberSortDir] = useState<'asc' | 'desc'>('asc');
  const [expandedMember, setExpandedMember] = useState<string | null>(null);

  // Issues filters
  const [issueSeverityFilter, setIssueSeverityFilter] = useState<string>('all');
  const [issueCategoryFilter, setIssueCategoryFilter] = useState<string>('all');
  const [issueStatusFilter, setIssueStatusFilter] = useState<string>('all');
  const [issueSearch, setIssueSearch] = useState('');

  // Certifications filters
  const [certStatusFilter, setCertStatusFilter] = useState<string>('all');
  const [certTypeFilter, setCertTypeFilter] = useState<string>('all');

  // Audits filters
  const [auditStatusFilter, setAuditStatusFilter] = useState<string>('all');

  // ── Computed overview stats ─────────────────────────────────────────────

  const overallScore = Math.round(memberCompliance.reduce((sum, m) => sum + m.complianceScore, 0) / memberCompliance.length);
  const compliantCount = memberCompliance.filter((m) => m.status === 'compliant').length;
  const openIssues = complianceIssues.filter((i) => i.status !== 'resolved').length;
  const auditsThisQuarter = auditRecords.filter((a) => {
    const d = new Date(a.date);
    return d >= new Date('2026-01-01') && d <= new Date('2026-03-31');
  }).length;

  // ── Unique values ─────────────────────────────────────────────────────

  const uniqueCountries = [...new Set(memberCompliance.map((m) => m.country))].sort();
  const uniqueIssueCategories = [...new Set(complianceIssues.map((i) => i.category))].sort();
  const uniqueCertTypes = [...new Set(certifications.map((c) => c.certType))].sort();

  // ── Filtered member compliance ────────────────────────────────────────

  const filteredMembers = useMemo(() => {
    const results = memberCompliance.filter((m) => {
      if (countryFilter !== 'all' && m.country !== countryFilter) return false;
      if (statusFilter !== 'all' && m.status !== statusFilter) return false;
      if (scoreFilter === 'high' && m.complianceScore < 90) return false;
      if (scoreFilter === 'medium' && (m.complianceScore < 70 || m.complianceScore >= 90)) return false;
      if (scoreFilter === 'low' && m.complianceScore >= 70) return false;
      if (memberSearch) {
        const q = memberSearch.toLowerCase();
        return m.name.toLowerCase().includes(q) || m.memberId.toLowerCase().includes(q);
      }
      return true;
    });

    results.sort((a, b) => {
      let cmp = 0;
      switch (memberSortField) {
        case 'name': cmp = a.name.localeCompare(b.name); break;
        case 'country': cmp = a.country.localeCompare(b.country); break;
        case 'score': cmp = a.complianceScore - b.complianceScore; break;
        case 'lastAudit': cmp = a.lastAudit.localeCompare(b.lastAudit); break;
        default: cmp = 0;
      }
      return memberSortDir === 'asc' ? cmp : -cmp;
    });

    return results;
  }, [memberSearch, countryFilter, statusFilter, scoreFilter, memberSortField, memberSortDir]);

  // ── Filtered issues ───────────────────────────────────────────────────

  const filteredIssues = useMemo(() => {
    return complianceIssues.filter((issue) => {
      if (issueSeverityFilter !== 'all' && issue.severity !== issueSeverityFilter) return false;
      if (issueCategoryFilter !== 'all' && issue.category !== issueCategoryFilter) return false;
      if (issueStatusFilter !== 'all' && issue.status !== issueStatusFilter) return false;
      if (issueSearch) {
        const q = issueSearch.toLowerCase();
        return (
          issue.memberName.toLowerCase().includes(q) ||
          issue.description.toLowerCase().includes(q) ||
          issue.category.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [issueSeverityFilter, issueCategoryFilter, issueStatusFilter, issueSearch]);

  // ── Filtered certifications ───────────────────────────────────────────

  const filteredCertifications = useMemo(() => {
    return certifications.filter((c) => {
      if (certStatusFilter !== 'all' && c.status !== certStatusFilter) return false;
      if (certTypeFilter !== 'all' && c.certType !== certTypeFilter) return false;
      return true;
    });
  }, [certStatusFilter, certTypeFilter]);

  // ── Filtered audits ───────────────────────────────────────────────────

  const filteredAudits = useMemo(() => {
    return auditRecords.filter((a) => {
      if (auditStatusFilter !== 'all' && a.status !== auditStatusFilter) return false;
      return true;
    });
  }, [auditStatusFilter]);

  // ── Certification distribution ────────────────────────────────────────

  const certDistribution = useMemo(() => {
    const dist: Record<string, number> = {};
    certifications.filter((c) => c.status !== 'expired').forEach((c) => {
      dist[c.certType] = (dist[c.certType] || 0) + 1;
    });
    return Object.entries(dist).sort(([, a], [, b]) => b - a);
  }, []);

  // ── Expiring soon certs ───────────────────────────────────────────────

  const expiringSoon = certifications.filter((c) => c.status === 'expiring-soon');

  // ── Sort handler ──────────────────────────────────────────────────────

  const handleMemberSort = (field: string) => {
    if (memberSortField === field) {
      setMemberSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setMemberSortField(field);
      setMemberSortDir('asc');
    }
  };

  // ── Overview stat cards ───────────────────────────────────────────────

  const overviewCards = [
    {
      label: 'Overall Score',
      value: `${overallScore}%`,
      icon: <ShieldCheck className="w-5 h-5" />,
      color: overallScore >= 90 ? 'text-green-600' : overallScore >= 70 ? 'text-amber-600' : 'text-red-600',
      bgColor: overallScore >= 90 ? 'bg-green-50' : overallScore >= 70 ? 'bg-amber-50' : 'bg-red-50',
    },
    {
      label: 'Members Compliant',
      value: `${compliantCount}/${memberCompliance.length}`,
      icon: <Users className="w-5 h-5" />,
      color: 'text-teal',
      bgColor: 'bg-teal-light',
    },
    {
      label: 'Issues Open',
      value: openIssues.toString(),
      icon: <AlertTriangle className="w-5 h-5" />,
      color: openIssues > 10 ? 'text-red-600' : 'text-amber-600',
      bgColor: openIssues > 10 ? 'bg-red-50' : 'bg-amber-50',
    },
    {
      label: 'Audits This Quarter',
      value: auditsThisQuarter.toString(),
      icon: <ClipboardList className="w-5 h-5" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
  ];

  const tabs = [
    { key: 'members' as const, label: 'Member Compliance' },
    { key: 'issues' as const, label: 'Issues' },
    { key: 'certifications' as const, label: 'Certifications' },
    { key: 'audits' as const, label: 'Audit Schedule' },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-teal" />
            Compliance Monitor
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Monitor member compliance, certifications, and audit schedules
          </p>
        </div>
        <div className="text-xs text-gray-400">
          Last updated: {formatShortDate('2026-03-16')}
        </div>
      </motion.div>

      {/* ── Overview Stats ──────────────────────────────────────────────── */}
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {overviewCards.map((stat, i) => (
          <motion.div
            key={i}
            variants={cardVariants}
            whileHover={{ y: -2, boxShadow: '0 8px 25px rgba(27,42,74,0.08)' }}
            className="bg-white rounded-xl p-4 border border-gray-100 cursor-default"
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`w-9 h-9 rounded-lg ${stat.bgColor} flex items-center justify-center ${stat.color}`}>
                {stat.icon}
              </div>
            </div>
            <p className="text-2xl font-bold text-navy">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Tab Switcher ────────────────────────────────────────────────── */}
      <motion.div variants={fadeUp} className="flex items-center gap-1 bg-white rounded-xl border border-gray-100 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-navy text-white shadow-sm'
                : 'text-gray-500 hover:text-navy hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </motion.div>

      {/* ── Tab Content ─────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">

        {/* ══════════════════════════════════════════════════════════════ */}
        {/*  MEMBER COMPLIANCE TAB                                        */}
        {/* ══════════════════════════════════════════════════════════════ */}
        {activeTab === 'members' && (
          <motion.div
            key="members"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {/* Filters */}
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Filter className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-navy">Filters</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <div className="relative lg:col-span-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by member name..."
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
                  />
                </div>
                <select
                  value={countryFilter}
                  onChange={(e) => setCountryFilter(e.target.value)}
                  className="border border-gray-200 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal text-gray-700"
                >
                  <option value="all">All Countries</option>
                  {uniqueCountries.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-200 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal text-gray-700"
                >
                  <option value="all">All Statuses</option>
                  <option value="compliant">Compliant</option>
                  <option value="at-risk">At Risk</option>
                  <option value="non-compliant">Non-Compliant</option>
                </select>
                <select
                  value={scoreFilter}
                  onChange={(e) => setScoreFilter(e.target.value)}
                  className="border border-gray-200 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal text-gray-700"
                >
                  <option value="all">All Scores</option>
                  <option value="high">90-100% (Green)</option>
                  <option value="medium">70-89% (Amber)</option>
                  <option value="low">Below 70% (Red)</option>
                </select>
              </div>
              {(memberSearch || countryFilter !== 'all' || statusFilter !== 'all' || scoreFilter !== 'all') && (
                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => { setMemberSearch(''); setCountryFilter('all'); setStatusFilter('all'); setScoreFilter('all'); }}
                    className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
                  >
                    Clear All Filters
                  </button>
                  <span className="text-xs text-gray-400 ml-auto">
                    {filteredMembers.length} members match
                  </span>
                </div>
              )}
            </div>

            {/* Member Compliance Table */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      {[
                        { key: 'name', label: 'Member Name' },
                        { key: 'country', label: 'Country' },
                        { key: 'score', label: 'Compliance Score' },
                        { key: 'certs', label: 'Certifications' },
                        { key: 'lastAudit', label: 'Last Audit' },
                        { key: 'status', label: 'Status' },
                        { key: 'actions', label: '' },
                      ].map((col) => (
                        <th
                          key={col.key}
                          className={`text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase ${
                            ['name', 'country', 'score', 'lastAudit'].includes(col.key) ? 'cursor-pointer hover:text-navy transition-colors' : ''
                          }`}
                          onClick={() => {
                            if (['name', 'country', 'score', 'lastAudit'].includes(col.key)) {
                              handleMemberSort(col.key);
                            }
                          }}
                        >
                          <span className="flex items-center gap-1">
                            {col.label}
                            {['name', 'country', 'score', 'lastAudit'].includes(col.key) && (
                              <ArrowUpDown className={`w-3 h-3 ${memberSortField === col.key ? 'text-teal' : 'text-gray-300'}`} />
                            )}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredMembers.map((member) => {
                      const sc = complianceStatusConfig[member.status];
                      const isExpanded = expandedMember === member.id;
                      const scoreColor = member.complianceScore >= 90 ? 'bg-green-500' : member.complianceScore >= 70 ? 'bg-amber-500' : 'bg-red-500';
                      const scoreTextColor = member.complianceScore >= 90 ? 'text-green-700' : member.complianceScore >= 70 ? 'text-amber-700' : 'text-red-700';

                      return (
                        <tr key={member.id} className="group">
                          <td colSpan={7} className="p-0">
                            <div
                              className="flex items-center hover:bg-gray-50/50 transition-colors cursor-pointer"
                              onClick={() => setExpandedMember(isExpanded ? null : member.id)}
                            >
                              <div className="px-4 py-3.5 w-[200px] min-w-[200px]">
                                <div className="flex items-center gap-2">
                                  <ChevronRight className={`w-3.5 h-3.5 text-gray-400 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-90' : ''}`} />
                                  <div>
                                    <p className="text-sm font-medium text-navy">{member.name}</p>
                                    <p className="text-[11px] text-gray-400">{member.memberId}</p>
                                  </div>
                                </div>
                              </div>
                              <div className="px-4 py-3.5 w-[110px] min-w-[110px]">
                                <div className="flex items-center gap-1.5">
                                  <MapPin className="w-3 h-3 text-gray-400" />
                                  <span className="text-sm text-gray-700">{member.country}</span>
                                </div>
                              </div>
                              <div className="px-4 py-3.5 w-[180px] min-w-[180px]">
                                <div className="flex items-center gap-3">
                                  <div className="flex-1">
                                    <div className="w-full bg-gray-100 rounded-full h-2">
                                      <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${member.complianceScore}%` }}
                                        transition={{ duration: 0.6 }}
                                        className={`h-2 rounded-full ${scoreColor}`}
                                      />
                                    </div>
                                  </div>
                                  <span className={`text-sm font-bold ${scoreTextColor} min-w-[36px] text-right`}>
                                    {member.complianceScore}%
                                  </span>
                                </div>
                              </div>
                              <div className="px-4 py-3.5 w-[200px] min-w-[200px]">
                                <div className="flex flex-wrap gap-1">
                                  {member.certifications.slice(0, 3).map((cert) => (
                                    <span key={cert} className="text-[10px] px-1.5 py-0.5 rounded bg-teal-light text-teal-dark font-medium">
                                      {cert}
                                    </span>
                                  ))}
                                  {member.certifications.length > 3 && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 font-medium">
                                      +{member.certifications.length - 3}
                                    </span>
                                  )}
                                  {member.certifications.length === 0 && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-50 text-red-500 font-medium">
                                      None
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="px-4 py-3.5 w-[110px] min-w-[110px]">
                                <span className="text-sm text-gray-500">{formatShortDate(member.lastAudit)}</span>
                              </div>
                              <div className="px-4 py-3.5 w-[130px] min-w-[130px]">
                                <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium border ${sc.bgColor} ${sc.textColor}`}>
                                  {member.status === 'compliant' && <CheckCircle2 className="w-3 h-3" />}
                                  {member.status === 'at-risk' && <AlertTriangle className="w-3 h-3" />}
                                  {member.status === 'non-compliant' && <XCircle className="w-3 h-3" />}
                                  {sc.label}
                                </span>
                              </div>
                              <div className="px-4 py-3.5 w-[50px] min-w-[50px]">
                                <button
                                  onClick={(e) => { e.stopPropagation(); }}
                                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                  <MoreHorizontal className="w-4 h-4 text-gray-400" />
                                </button>
                              </div>
                            </div>

                            {/* Expanded Details */}
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.25 }}
                                  className="overflow-hidden"
                                >
                                  <div className="px-6 pb-5 pt-2 bg-gray-50/50 border-t border-gray-100">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                      <div className="space-y-3">
                                        <h4 className="text-xs font-semibold text-gray-500 uppercase">Certifications</h4>
                                        {member.certifications.length > 0 ? (
                                          <div className="space-y-1.5">
                                            {member.certifications.map((cert) => (
                                              <div key={cert} className="flex items-center gap-2">
                                                <BadgeCheck className="w-3.5 h-3.5 text-teal" />
                                                <span className="text-sm text-navy">{cert}</span>
                                              </div>
                                            ))}
                                          </div>
                                        ) : (
                                          <p className="text-sm text-red-500">No valid certifications</p>
                                        )}
                                      </div>
                                      <div className="space-y-3">
                                        <h4 className="text-xs font-semibold text-gray-500 uppercase">Risk Factors</h4>
                                        {member.riskFactors.length > 0 ? (
                                          <div className="space-y-1.5">
                                            {member.riskFactors.map((risk, idx) => (
                                              <div key={idx} className="flex items-start gap-2">
                                                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5" />
                                                <span className="text-sm text-gray-700">{risk}</span>
                                              </div>
                                            ))}
                                          </div>
                                        ) : (
                                          <div className="flex items-center gap-2">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                                            <span className="text-sm text-green-700">No risk factors identified</span>
                                          </div>
                                        )}
                                      </div>
                                      <div className="space-y-3">
                                        <h4 className="text-xs font-semibold text-gray-500 uppercase">Summary</h4>
                                        <div className="space-y-2">
                                          <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Open Issues</span>
                                            <span className={`font-medium ${member.issuesOpen > 0 ? 'text-amber-600' : 'text-green-600'}`}>{member.issuesOpen}</span>
                                          </div>
                                          <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Last Audit</span>
                                            <span className="text-navy">{formatDate(member.lastAudit)}</span>
                                          </div>
                                          <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Score</span>
                                            <span className={`font-bold ${scoreTextColor}`}>{member.complianceScore}%</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-3">
                                      <button className="px-4 py-2 bg-teal text-white text-xs font-medium rounded-lg hover:bg-teal/90 transition-colors flex items-center gap-1.5">
                                        <Eye className="w-3.5 h-3.5" />
                                        View Full Profile
                                      </button>
                                      <button className="px-4 py-2 bg-navy/10 text-navy text-xs font-medium rounded-lg hover:bg-navy/20 transition-colors flex items-center gap-1.5">
                                        <ClipboardList className="w-3.5 h-3.5" />
                                        Schedule Audit
                                      </button>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {filteredMembers.length === 0 && (
                <div className="p-12 text-center">
                  <ShieldCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No members match your filters</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ══════════════════════════════════════════════════════════════ */}
        {/*  ISSUES TAB                                                   */}
        {/* ══════════════════════════════════════════════════════════════ */}
        {activeTab === 'issues' && (
          <motion.div
            key="issues"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {/* Severity Summary Pills */}
            <div className="flex items-center gap-3 flex-wrap">
              {(['critical', 'high', 'medium', 'low'] as IssueSeverity[]).map((sev) => {
                const count = complianceIssues.filter((i) => i.severity === sev && i.status !== 'resolved').length;
                const cfg = severityConfig[sev];
                return (
                  <div key={sev} className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${cfg.bgColor}`}>
                    <div className={`w-2 h-2 rounded-full ${cfg.dotColor}`} />
                    <span className={`text-xs font-medium ${cfg.textColor}`}>{cfg.label}: {count}</span>
                  </div>
                );
              })}
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <div className="relative lg:col-span-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search issues..."
                    value={issueSearch}
                    onChange={(e) => setIssueSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
                  />
                </div>
                <select
                  value={issueSeverityFilter}
                  onChange={(e) => setIssueSeverityFilter(e.target.value)}
                  className="border border-gray-200 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal text-gray-700"
                >
                  <option value="all">All Severities</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                <select
                  value={issueCategoryFilter}
                  onChange={(e) => setIssueCategoryFilter(e.target.value)}
                  className="border border-gray-200 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal text-gray-700"
                >
                  <option value="all">All Categories</option>
                  {uniqueIssueCategories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <select
                  value={issueStatusFilter}
                  onChange={(e) => setIssueStatusFilter(e.target.value)}
                  className="border border-gray-200 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal text-gray-700"
                >
                  <option value="all">All Statuses</option>
                  <option value="open">Open</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
                <button
                  onClick={handleExportComplianceCSV}
                  className="ml-auto px-3 py-2 rounded-lg text-xs font-medium bg-navy text-white hover:bg-navy/90 transition-colors flex items-center gap-1.5"
                >
                  <FileCheck className="w-3.5 h-3.5" />
                  Export CSV
                </button>
              </div>
            </div>

            {/* Issues List */}
            <div className="space-y-3">
              {filteredIssues.map((issue) => {
                const sev = severityConfig[issue.severity];
                const ist = issueStatusConfig[issue.status];
                const daysLeft = daysUntil(issue.deadline);
                const isOverdue = daysLeft < 0;

                return (
                  <motion.div
                    key={issue.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`bg-white rounded-xl border border-gray-100 p-4 hover:shadow-sm transition-shadow`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full ${sev.dotColor} mt-1.5 flex-shrink-0 ring-2 ring-offset-1 ${
                        issue.severity === 'critical' ? 'ring-red-200' :
                        issue.severity === 'high' ? 'ring-orange-200' :
                        issue.severity === 'medium' ? 'ring-amber-200' : 'ring-blue-200'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center flex-wrap gap-2 mb-1.5">
                          <span className={`inline-flex items-center text-xs px-2 py-0.5 rounded-full font-medium border ${sev.bgColor} ${sev.textColor}`}>
                            {sev.label}
                          </span>
                          <span className={`inline-flex items-center text-xs px-2 py-0.5 rounded-full font-medium border ${ist.bgColor} ${ist.textColor}`}>
                            {ist.label}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">
                            {issue.category}
                          </span>
                          <span className="text-xs text-gray-400 font-mono">{issue.id}</span>
                        </div>
                        <p className="text-sm text-navy font-medium mb-1">{issue.description}</p>
                        <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-xs">
                          <span className="text-gray-500 flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {issue.memberName}
                          </span>
                          <span className="text-gray-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Raised: {formatShortDate(issue.dateRaised)}
                          </span>
                          <span className={`flex items-center gap-1 ${isOverdue && issue.status !== 'resolved' ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                            <Clock className="w-3 h-3" />
                            {issue.status === 'resolved' ? 'Resolved' : isOverdue ? `Overdue by ${Math.abs(daysLeft)} days` : `Due: ${formatShortDate(issue.deadline)} (${daysLeft}d)`}
                          </span>
                          <span className="text-gray-400 flex items-center gap-1">
                            <User className="w-3 h-3" />
                            Assigned: {issue.assignedTo}
                          </span>
                          {issue.status !== 'resolved' && (
                            <button
                              onClick={() => handleMarkResolved(issue.id)}
                              className="ml-auto inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-green-50 text-green-700 hover:bg-green-100 transition-colors border border-green-200"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              Mark Resolved
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {filteredIssues.length === 0 && (
                <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
                  <CheckCircle2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No issues match your filters</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ══════════════════════════════════════════════════════════════ */}
        {/*  CERTIFICATIONS TAB                                           */}
        {/* ══════════════════════════════════════════════════════════════ */}
        {activeTab === 'certifications' && (
          <motion.div
            key="certifications"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Expiring Soon Alert */}
            {expiringSoon.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <h3 className="text-sm font-semibold text-amber-800">Expiring Within 90 Days ({expiringSoon.length} certifications)</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {expiringSoon.map((cert) => (
                    <div key={cert.id} className="bg-white rounded-lg p-3 border border-amber-100">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-navy">{cert.certType}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">
                          {daysUntil(cert.expiryDate)}d left
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">{cert.memberName}</p>
                      <p className="text-[10px] text-gray-400 mt-1">Expires: {formatDate(cert.expiryDate)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cert Type Distribution + Filters */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Distribution */}
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Award className="w-4 h-4 text-teal" />
                  <h3 className="text-sm font-semibold text-navy">Certification Distribution</h3>
                </div>
                <div className="space-y-3">
                  {certDistribution.map(([certType, count], i) => {
                    const colors = ['bg-teal', 'bg-navy', 'bg-purple-500', 'bg-amber-500', 'bg-green-500', 'bg-blue-500', 'bg-rose-500', 'bg-orange-500'];
                    const maxCount = certDistribution[0][1] as number;
                    return (
                      <div key={certType}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-navy font-medium">{certType}</span>
                          <span className="text-xs text-gray-500">{count} members</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(count / maxCount) * 100}%` }}
                            transition={{ duration: 0.6, delay: 0.05 * i }}
                            className={`h-2 rounded-full ${colors[i] || 'bg-gray-400'}`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Certifications Table */}
              <div className="lg:col-span-2 space-y-4">
                {/* Filters */}
                <div className="flex gap-3 flex-wrap">
                  <select
                    value={certStatusFilter}
                    onChange={(e) => setCertStatusFilter(e.target.value)}
                    className="border border-gray-200 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal text-gray-700"
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="expiring-soon">Expiring Soon</option>
                    <option value="expired">Expired</option>
                  </select>
                  <select
                    value={certTypeFilter}
                    onChange={(e) => setCertTypeFilter(e.target.value)}
                    className="border border-gray-200 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal text-gray-700"
                  >
                    <option value="all">All Types</option>
                    {uniqueCertTypes.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                {/* Cert Table */}
                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Member</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Certification</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Issuing Body</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Expiry</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {filteredCertifications.map((cert) => {
                          const certStatusColors = {
                            active: 'bg-green-50 border-green-200 text-green-700',
                            'expiring-soon': 'bg-amber-50 border-amber-200 text-amber-700',
                            expired: 'bg-red-50 border-red-200 text-red-600',
                          };
                          const certStatusLabels = {
                            active: 'Active',
                            'expiring-soon': 'Expiring Soon',
                            expired: 'Expired',
                          };
                          return (
                            <tr key={cert.id} className="hover:bg-gray-50/50 transition-colors">
                              <td className="px-4 py-3">
                                <p className="text-sm font-medium text-navy">{cert.memberName}</p>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-1.5">
                                  <FileCheck className="w-3.5 h-3.5 text-teal" />
                                  <span className="text-sm text-gray-700">{cert.certType}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-500">{cert.issuingBody}</td>
                              <td className="px-4 py-3">
                                <span className="text-sm text-gray-500">{formatShortDate(cert.expiryDate)}</span>
                                {cert.status === 'expiring-soon' && (
                                  <span className="ml-1 text-[10px] text-amber-600 font-medium">({daysUntil(cert.expiryDate)}d)</span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <span className={`inline-flex items-center text-xs px-2.5 py-1 rounded-full font-medium border ${certStatusColors[cert.status]}`}>
                                  {cert.status === 'active' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                                  {cert.status === 'expiring-soon' && <Clock className="w-3 h-3 mr-1" />}
                                  {cert.status === 'expired' && <XCircle className="w-3 h-3 mr-1" />}
                                  {certStatusLabels[cert.status]}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {filteredCertifications.length === 0 && (
                    <div className="p-12 text-center">
                      <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm">No certifications match your filters</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ══════════════════════════════════════════════════════════════ */}
        {/*  AUDIT SCHEDULE TAB                                           */}
        {/* ══════════════════════════════════════════════════════════════ */}
        {activeTab === 'audits' && (
          <motion.div
            key="audits"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Audit Status Filters */}
            <div className="flex items-center gap-2">
              {['all', 'scheduled', 'in-progress', 'completed'].map((status) => (
                <button
                  key={status}
                  onClick={() => setAuditStatusFilter(status)}
                  className={`px-4 py-2 rounded-lg text-xs font-medium border transition-all ${
                    auditStatusFilter === status
                      ? 'bg-navy text-white border-navy'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                  <span className="ml-1 opacity-75">
                    ({status === 'all' ? auditRecords.length : auditRecords.filter((a) => a.status === status).length})
                  </span>
                </button>
              ))}
            </div>

            {/* Upcoming/Scheduled Audits */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Upcoming Audits Calendar-style */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-navy flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-teal" />
                  Upcoming & In-Progress Audits
                </h3>
                {filteredAudits
                  .filter((a) => a.status !== 'completed')
                  .sort((a, b) => a.date.localeCompare(b.date))
                  .map((audit) => {
                    const ast = auditStatusConfig[audit.status];
                    const daysAway = daysUntil(audit.date);
                    return (
                      <motion.div
                        key={audit.id}
                        whileHover={{ y: -1, boxShadow: '0 4px 12px rgba(27,42,74,0.08)' }}
                        className="bg-white rounded-xl border border-gray-100 p-4 cursor-pointer transition-shadow"
                      >
                        <div className="flex items-start gap-3">
                          <div className="bg-gray-50 rounded-lg p-2 text-center min-w-[52px]">
                            <p className="text-lg font-bold text-navy">{new Date(audit.date).getDate()}</p>
                            <p className="text-[10px] text-gray-500 uppercase">{new Date(audit.date).toLocaleDateString('en-US', { month: 'short' })}</p>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`inline-flex items-center text-[10px] px-2 py-0.5 rounded-full font-medium border ${ast.bgColor} ${ast.textColor}`}>
                                {ast.label}
                              </span>
                              {daysAway <= 7 && daysAway >= 0 && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-50 text-red-600 font-medium">
                                  {daysAway === 0 ? 'Today' : `In ${daysAway}d`}
                                </span>
                              )}
                            </div>
                            <p className="text-sm font-medium text-navy">{audit.memberName}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{audit.auditType}</p>
                            <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {audit.auditor}
                              </span>
                              <span className="text-gray-300">|</span>
                              <span className="truncate">{audit.scope}</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}

                {filteredAudits.filter((a) => a.status !== 'completed').length === 0 && (
                  <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
                    <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No upcoming audits</p>
                  </div>
                )}
              </div>

              {/* Completed Audits Summary */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-navy flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Past Audit Results
                </h3>
                {filteredAudits
                  .filter((a) => a.status === 'completed')
                  .sort((a, b) => b.date.localeCompare(a.date))
                  .map((audit) => (
                    <motion.div
                      key={audit.id}
                      whileHover={{ y: -1, boxShadow: '0 4px 12px rgba(27,42,74,0.08)' }}
                      className="bg-white rounded-xl border border-gray-100 p-4 cursor-pointer transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-sm font-medium text-navy">{audit.memberName}</p>
                          <p className="text-xs text-gray-500">{audit.auditType}</p>
                        </div>
                        {audit.score !== undefined && (
                          <div className={`text-right`}>
                            <p className={`text-xl font-bold ${
                              audit.score >= 90 ? 'text-green-600' : audit.score >= 70 ? 'text-amber-600' : 'text-red-600'
                            }`}>
                              {audit.score}%
                            </p>
                            <p className="text-[10px] text-gray-400">Score</p>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatShortDate(audit.date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {audit.auditor}
                        </span>
                        <span className="flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {audit.findings} findings
                        </span>
                      </div>
                      {audit.score !== undefined && (
                        <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${audit.score}%` }}
                            transition={{ duration: 0.6 }}
                            className={`h-1.5 rounded-full ${
                              audit.score >= 90 ? 'bg-green-500' : audit.score >= 70 ? 'bg-amber-500' : 'bg-red-500'
                            }`}
                          />
                        </div>
                      )}
                    </motion.div>
                  ))}

                {filteredAudits.filter((a) => a.status === 'completed').length === 0 && (
                  <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
                    <ClipboardList className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No completed audits match your filter</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
