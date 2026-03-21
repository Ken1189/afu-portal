'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  ArrowLeft,
  Plus,
  CalendarDays,
  CheckCircle2,
  XCircle,
  Clock,
  Baby,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Activity,
  TrendingUp,
  Calendar,
  Users,
  FileText,
} from 'lucide-react';
import { useLivestock } from '@/lib/supabase/use-livestock';

// ---------------------------------------------------------------------------
// Inline fallback data (was @/lib/data/livestock)
// ---------------------------------------------------------------------------

type AnimalType = 'cattle' | 'goat' | 'sheep' | 'poultry' | 'pig';
type AnimalStatus = 'healthy' | 'sick' | 'pregnant' | 'lactating' | 'quarantine' | 'sold' | 'deceased';

interface Animal {
  id: string;
  name: string;
  type: AnimalType;
  breed: string;
  tag: string;
  dateOfBirth: string;
  gender: 'male' | 'female';
  weight: number;
  status: AnimalStatus;
  parentSire: string | null;
  parentDam: string | null;
  acquisitionDate: string;
  acquisitionMethod: 'born' | 'purchased' | 'donated';
  purchasePrice: number | null;
  currentValue: number;
  image: string;
  notes: string;
}

interface BreedingRecord {
  id: string;
  sireId: string;
  sireName: string;
  damId: string;
  damName: string;
  matingDate: string;
  expectedDueDate: string;
  actualBirthDate: string | null;
  method: 'natural' | 'artificial-insemination';
  status: 'mated' | 'confirmed-pregnant' | 'delivered' | 'failed';
  offspring: { id: string; name: string; gender: 'male' | 'female' }[];
  notes: string;
}

const animals: Animal[] = [
  { id: 'ANM-001', name: 'Mosi', type: 'cattle', breed: 'Brahman', tag: 'BW-C-0041', dateOfBirth: '2021-06-15', gender: 'male', weight: 620, status: 'healthy', parentSire: null, parentDam: null, acquisitionDate: '2022-01-10', acquisitionMethod: 'purchased', purchasePrice: 1200, currentValue: 1850, image: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=400&h=300&fit=crop', notes: 'Herd bull. Excellent temperament and conformation. Purchased from Makalamabedi Ranch, Botswana.' },
  { id: 'ANM-002', name: 'Thandi', type: 'cattle', breed: 'Tuli', tag: 'BW-C-0042', dateOfBirth: '2020-09-22', gender: 'female', weight: 480, status: 'lactating', parentSire: null, parentDam: null, acquisitionDate: '2021-03-05', acquisitionMethod: 'purchased', purchasePrice: 950, currentValue: 1400, image: 'https://images.unsplash.com/photo-1596733430284-f7437764b1a9?w=400&h=300&fit=crop', notes: 'Strong milker. Third lactation. Calved January 2026 — calf Lesedi (ANM-009).' },
  { id: 'ANM-003', name: 'Bongani', type: 'cattle', breed: 'Bonsmara', tag: 'ZW-C-0118', dateOfBirth: '2022-02-10', gender: 'male', weight: 560, status: 'healthy', parentSire: null, parentDam: null, acquisitionDate: '2022-02-10', acquisitionMethod: 'born', purchasePrice: null, currentValue: 1650, image: 'https://images.unsplash.com/photo-1527153907836-6c575e1ce12b?w=400&h=300&fit=crop', notes: 'Born on farm in Masvingo, Zimbabwe. Growing well — potential breeding bull.' },
  { id: 'ANM-004', name: 'Naledi', type: 'cattle', breed: 'Brahman', tag: 'BW-C-0043', dateOfBirth: '2021-11-30', gender: 'female', weight: 465, status: 'pregnant', parentSire: 'ANM-001', parentDam: null, acquisitionDate: '2021-11-30', acquisitionMethod: 'born', purchasePrice: null, currentValue: 1350, image: 'https://images.unsplash.com/photo-1595365691689-6b7b7e47858c?w=400&h=300&fit=crop', notes: 'Sired by Mosi. Confirmed pregnant — due April 2026. First calf heifer.' },
  { id: 'ANM-005', name: 'Kwezi', type: 'cattle', breed: 'Tuli', tag: 'TZ-C-0205', dateOfBirth: '2020-04-18', gender: 'female', weight: 490, status: 'healthy', parentSire: null, parentDam: null, acquisitionDate: '2020-12-01', acquisitionMethod: 'purchased', purchasePrice: 880, currentValue: 1300, image: 'https://images.unsplash.com/photo-1587299142216-dd53e3647e08?w=400&h=300&fit=crop', notes: 'Hardy Tuli cow. Heat-tolerant. Purchased from Dodoma auction, Tanzania.' },
  { id: 'ANM-006', name: 'Simba', type: 'cattle', breed: 'Bonsmara', tag: 'ZW-C-0119', dateOfBirth: '2023-01-08', gender: 'male', weight: 410, status: 'healthy', parentSire: 'ANM-003', parentDam: 'ANM-005', acquisitionDate: '2023-01-08', acquisitionMethod: 'born', purchasePrice: null, currentValue: 1100, image: 'https://images.unsplash.com/photo-1545468800-85cc9bc6ecf7?w=400&h=300&fit=crop', notes: 'Young bull calf. Growing fast on veld grazing. May sell at 18 months or keep for breeding.' },
  { id: 'ANM-007', name: 'Lindiwe', type: 'cattle', breed: 'Brahman', tag: 'BW-C-0044', dateOfBirth: '2019-07-25', gender: 'female', weight: 510, status: 'lactating', parentSire: null, parentDam: null, acquisitionDate: '2020-06-15', acquisitionMethod: 'purchased', purchasePrice: 1050, currentValue: 1500, image: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=400&h=300&fit=crop', notes: 'Senior cow. Consistent breeder. Fourth lactation. Top milk producer in the herd.' },
  { id: 'ANM-008', name: 'Tafara', type: 'cattle', breed: 'Tuli', tag: 'ZW-C-0120', dateOfBirth: '2022-08-14', gender: 'female', weight: 430, status: 'pregnant', parentSire: null, parentDam: null, acquisitionDate: '2023-04-20', acquisitionMethod: 'purchased', purchasePrice: 900, currentValue: 1250, image: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=400&h=300&fit=crop', notes: 'Purchased at Bulawayo livestock market. Confirmed pregnant — due May 2026.' },
  { id: 'ANM-009', name: 'Lesedi', type: 'cattle', breed: 'Tuli', tag: 'BW-C-0045', dateOfBirth: '2026-01-12', gender: 'female', weight: 65, status: 'healthy', parentSire: 'ANM-001', parentDam: 'ANM-002', acquisitionDate: '2026-01-12', acquisitionMethod: 'born', purchasePrice: null, currentValue: 350, image: 'https://images.unsplash.com/photo-1605377347974-3f5b7e0a3e6e?w=400&h=300&fit=crop', notes: 'Newborn heifer calf out of Thandi by Mosi. Healthy delivery. Drinking well.' },
  { id: 'ANM-010', name: 'Rudo', type: 'cattle', breed: 'Bonsmara', tag: 'ZW-C-0121', dateOfBirth: '2021-03-20', gender: 'female', weight: 470, status: 'sick', parentSire: null, parentDam: null, acquisitionDate: '2021-09-10', acquisitionMethod: 'purchased', purchasePrice: 920, currentValue: 1200, image: 'https://images.unsplash.com/photo-1594489428504-5c0c480a15fd?w=400&h=300&fit=crop', notes: 'Currently being treated for tick fever (anaplasmosis). Under observation. Reduced appetite since March 8.' },
  { id: 'ANM-011', name: 'Tau', type: 'goat', breed: 'Boer', tag: 'BW-G-0301', dateOfBirth: '2023-03-15', gender: 'male', weight: 95, status: 'healthy', parentSire: null, parentDam: null, acquisitionDate: '2023-08-20', acquisitionMethod: 'purchased', purchasePrice: 280, currentValue: 420, image: 'https://images.unsplash.com/photo-1524024973431-2ad916746264?w=400&h=300&fit=crop', notes: 'Breeding buck. Classic Boer markings — white body, red-brown head. Good conformation.' },
  { id: 'ANM-012', name: 'Dineo', type: 'goat', breed: 'Boer', tag: 'BW-G-0302', dateOfBirth: '2022-10-05', gender: 'female', weight: 72, status: 'pregnant', parentSire: null, parentDam: null, acquisitionDate: '2023-02-14', acquisitionMethod: 'purchased', purchasePrice: 240, currentValue: 380, image: 'https://images.unsplash.com/photo-1560942485-b2a11cc13456?w=400&h=300&fit=crop', notes: 'Due to kid in April 2026. Twin pregnancy confirmed by vet ultrasound.' },
  { id: 'ANM-013', name: 'Kgosi', type: 'goat', breed: 'Kalahari Red', tag: 'BW-G-0303', dateOfBirth: '2023-07-22', gender: 'male', weight: 82, status: 'healthy', parentSire: null, parentDam: null, acquisitionDate: '2024-01-10', acquisitionMethod: 'purchased', purchasePrice: 320, currentValue: 450, image: 'https://images.unsplash.com/photo-1571283056073-a4409aa58946?w=400&h=300&fit=crop', notes: 'Kalahari Red buck. Deep red coat. Purchased from a stud breeder near Ghanzi, Botswana.' },
  { id: 'ANM-014', name: 'Mpho', type: 'goat', breed: 'Kalahari Red', tag: 'BW-G-0304', dateOfBirth: '2023-05-18', gender: 'female', weight: 58, status: 'lactating', parentSire: null, parentDam: null, acquisitionDate: '2023-11-01', acquisitionMethod: 'purchased', purchasePrice: 260, currentValue: 370, image: 'https://images.unsplash.com/photo-1580477667995-2b94f01c9516?w=400&h=300&fit=crop', notes: 'Kidded February 2026. Nursing twin kids. Good milk production.' },
  { id: 'ANM-015', name: 'Zuri', type: 'goat', breed: 'Boer', tag: 'TZ-G-0410', dateOfBirth: '2024-01-28', gender: 'female', weight: 55, status: 'healthy', parentSire: 'ANM-011', parentDam: 'ANM-012', acquisitionDate: '2024-01-28', acquisitionMethod: 'born', purchasePrice: null, currentValue: 300, image: 'https://images.unsplash.com/photo-1557318041-1ce374d55ebf?w=400&h=300&fit=crop', notes: 'Born on farm. Daughter of Tau and Dineo. Strong doe, approaching breeding age.' },
  { id: 'ANM-016', name: 'Sekai', type: 'goat', breed: 'Kalahari Red', tag: 'ZW-G-0411', dateOfBirth: '2024-06-10', gender: 'female', weight: 48, status: 'healthy', parentSire: 'ANM-013', parentDam: 'ANM-014', acquisitionDate: '2024-06-10', acquisitionMethod: 'born', purchasePrice: null, currentValue: 280, image: 'https://images.unsplash.com/photo-1533318087102-b3ad366ed041?w=400&h=300&fit=crop', notes: 'Kalahari Red doeling. Out of Mpho by Kgosi. Deep red coloring inherited from both parents.' },
  { id: 'ANM-017', name: 'Jabari', type: 'sheep', breed: 'Dorper', tag: 'BW-S-0501', dateOfBirth: '2022-05-12', gender: 'male', weight: 105, status: 'healthy', parentSire: null, parentDam: null, acquisitionDate: '2022-11-18', acquisitionMethod: 'purchased', purchasePrice: 350, currentValue: 520, image: 'https://images.unsplash.com/photo-1588943211346-0908a1fb0b01?w=400&h=300&fit=crop', notes: 'Dorper ram. Black-headed. Solid frame — primary breeding ram for the flock.' },
  { id: 'ANM-018', name: 'Amahle', type: 'sheep', breed: 'Dorper', tag: 'BW-S-0502', dateOfBirth: '2023-02-20', gender: 'female', weight: 68, status: 'healthy', parentSire: null, parentDam: null, acquisitionDate: '2023-07-05', acquisitionMethod: 'purchased', purchasePrice: 280, currentValue: 400, image: 'https://images.unsplash.com/photo-1484557985045-edf25e08da73?w=400&h=300&fit=crop', notes: 'Dorper ewe. Excellent condition. First lambing expected June 2026.' },
  { id: 'ANM-019', name: 'Tendai', type: 'sheep', breed: 'Blackhead Persian', tag: 'ZW-S-0503', dateOfBirth: '2022-09-08', gender: 'female', weight: 55, status: 'lactating', parentSire: null, parentDam: null, acquisitionDate: '2023-03-12', acquisitionMethod: 'purchased', purchasePrice: 220, currentValue: 340, image: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=400&h=300&fit=crop', notes: 'Fat-tailed Blackhead Persian ewe. Lambed February 2026 — single ram lamb.' },
  { id: 'ANM-020', name: 'Chipo', type: 'sheep', breed: 'Blackhead Persian', tag: 'ZW-S-0504', dateOfBirth: '2023-11-15', gender: 'female', weight: 50, status: 'quarantine', parentSire: null, parentDam: null, acquisitionDate: '2024-05-20', acquisitionMethod: 'purchased', purchasePrice: 210, currentValue: 310, image: 'https://images.unsplash.com/photo-1580170368960-66f1b6ffbb64?w=400&h=300&fit=crop', notes: 'Quarantined after showing nasal discharge. Suspected bluetongue — awaiting lab results.' },
  { id: 'ANM-021', name: 'RIR Flock A', type: 'poultry', breed: 'Rhode Island Red', tag: 'TZ-P-0601', dateOfBirth: '2025-06-01', gender: 'female', weight: 3.2, status: 'healthy', parentSire: null, parentDam: null, acquisitionDate: '2025-06-15', acquisitionMethod: 'purchased', purchasePrice: 450, currentValue: 720, image: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=400&h=300&fit=crop', notes: 'Flock of 50 Rhode Island Red hens. Laying at 85% production rate. Free-range at Arusha farm.' },
  { id: 'ANM-022', name: 'Kuroiler Flock B', type: 'poultry', breed: 'Kuroiler', tag: 'TZ-P-0602', dateOfBirth: '2025-08-10', gender: 'female', weight: 3.5, status: 'healthy', parentSire: null, parentDam: null, acquisitionDate: '2025-08-25', acquisitionMethod: 'purchased', purchasePrice: 380, currentValue: 650, image: 'https://images.unsplash.com/photo-1612170153139-6f881ff067e0?w=400&h=300&fit=crop', notes: 'Flock of 40 Kuroiler dual-purpose hens. Hardy breed suited to scavenging systems. Dodoma, Tanzania.' },
  { id: 'ANM-023', name: 'Layer Flock C', type: 'poultry', breed: 'Lohmann Brown', tag: 'BW-P-0603', dateOfBirth: '2025-04-18', gender: 'female', weight: 2.8, status: 'sick', parentSire: null, parentDam: null, acquisitionDate: '2025-05-02', acquisitionMethod: 'purchased', purchasePrice: 520, currentValue: 600, image: 'https://images.unsplash.com/photo-1569437061241-a848be43cc82?w=400&h=300&fit=crop', notes: 'Flock of 60 Lohmann Brown layers. Egg production dropped to 55% — suspected Newcastle disease. Gaborone unit.' },
  { id: 'ANM-024', name: 'Themba', type: 'pig', breed: 'Large White', tag: 'ZW-PG-0701', dateOfBirth: '2023-09-10', gender: 'male', weight: 180, status: 'healthy', parentSire: null, parentDam: null, acquisitionDate: '2024-02-15', acquisitionMethod: 'purchased', purchasePrice: 400, currentValue: 680, image: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=400&h=300&fit=crop', notes: 'Large White boar. Purchased from Norton Piggery near Harare, Zimbabwe. Active breeder.' },
  { id: 'ANM-025', name: 'Ayana', type: 'pig', breed: 'Large White', tag: 'ZW-PG-0702', dateOfBirth: '2024-01-20', gender: 'female', weight: 145, status: 'pregnant', parentSire: null, parentDam: null, acquisitionDate: '2024-06-10', acquisitionMethod: 'purchased', purchasePrice: 350, currentValue: 600, image: 'https://images.unsplash.com/photo-1604848698030-c434ba08ece1?w=400&h=300&fit=crop', notes: 'First-time sow. Bred to Themba. Expected to farrow mid-April 2026. Good body condition score.' },
];

const breedingRecords: BreedingRecord[] = [
  { id: 'BRD-001', sireId: 'ANM-001', sireName: 'Mosi', damId: 'ANM-002', damName: 'Thandi', matingDate: '2025-04-10', expectedDueDate: '2026-01-15', actualBirthDate: '2026-01-12', method: 'natural', status: 'delivered', offspring: [{ id: 'ANM-009', name: 'Lesedi', gender: 'female' }], notes: 'Successful natural mating. Heifer calf born 3 days early. Easy calving, no assistance needed.' },
  { id: 'BRD-002', sireId: 'ANM-001', sireName: 'Mosi', damId: 'ANM-004', damName: 'Naledi', matingDate: '2025-07-05', expectedDueDate: '2026-04-10', actualBirthDate: null, method: 'natural', status: 'confirmed-pregnant', offspring: [], notes: 'Pregnancy confirmed at 90-day check via ultrasound. Single calf. First calving for Naledi.' },
  { id: 'BRD-003', sireId: 'ANM-003', sireName: 'Bongani', damId: 'ANM-008', damName: 'Tafara', matingDate: '2025-08-15', expectedDueDate: '2026-05-22', actualBirthDate: null, method: 'natural', status: 'confirmed-pregnant', offspring: [], notes: 'Bonsmara x Tuli cross. Expecting good hybrid vigour. Tafara in excellent condition.' },
  { id: 'BRD-004', sireId: 'ANM-003', sireName: 'Bongani', damId: 'ANM-005', damName: 'Kwezi', matingDate: '2022-04-12', expectedDueDate: '2023-01-18', actualBirthDate: '2023-01-08', method: 'natural', status: 'delivered', offspring: [{ id: 'ANM-006', name: 'Simba', gender: 'male' }], notes: 'Bull calf Simba born healthy. Growing well — retained as potential breeding bull.' },
  { id: 'BRD-005', sireId: 'ANM-001', sireName: 'Mosi', damId: 'ANM-007', damName: 'Lindiwe', matingDate: '2026-02-20', expectedDueDate: '2026-11-27', actualBirthDate: null, method: 'artificial-insemination', status: 'mated', offspring: [], notes: 'AI using Mosi semen. Inseminated on standing heat. Pregnancy check scheduled for April 2026.' },
  { id: 'BRD-006', sireId: 'ANM-011', sireName: 'Tau', damId: 'ANM-012', damName: 'Dineo', matingDate: '2025-11-10', expectedDueDate: '2026-04-08', actualBirthDate: null, method: 'natural', status: 'confirmed-pregnant', offspring: [], notes: 'Twins confirmed on ultrasound. Dineo previously delivered healthy single kid. Expecting twins this time.' },
  { id: 'BRD-007', sireId: 'ANM-013', sireName: 'Kgosi', damId: 'ANM-014', damName: 'Mpho', matingDate: '2025-09-15', expectedDueDate: '2026-02-11', actualBirthDate: '2026-02-14', method: 'natural', status: 'delivered', offspring: [{ id: 'ANM-016', name: 'Sekai', gender: 'female' }, { id: 'KID-002', name: 'Farai', gender: 'male' }], notes: 'Twin kids born 3 days late. Both healthy — Sekai retained, Farai to be sold at weaning.' },
  { id: 'BRD-008', sireId: 'ANM-011', sireName: 'Tau', damId: 'ANM-015', damName: 'Zuri', matingDate: '2026-02-28', expectedDueDate: '2026-07-27', actualBirthDate: null, method: 'natural', status: 'mated', offspring: [], notes: 'First mating for Zuri. Buck exposure for 35 days. Pregnancy check scheduled for April 2026.' },
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
// Types & Constants
// ---------------------------------------------------------------------------

type TabKey = 'active' | 'history' | 'offspring';

const STATUS_CONFIG: Record<
  BreedingRecord['status'],
  { label: string; color: string; bgColor: string; icon: React.ComponentType<{ size?: number; className?: string }> }
> = {
  mated: { label: 'Mated', color: 'text-amber-700', bgColor: 'bg-amber-100', icon: Clock },
  'confirmed-pregnant': { label: 'Pregnant', color: 'text-purple-700', bgColor: 'bg-purple-100', icon: Heart },
  delivered: { label: 'Delivered', color: 'text-green-700', bgColor: 'bg-green-100', icon: CheckCircle2 },
  failed: { label: 'Failed', color: 'text-red-700', bgColor: 'bg-red-100', icon: XCircle },
};

const METHOD_CONFIG: Record<
  BreedingRecord['method'],
  { label: string; color: string; bgColor: string }
> = {
  natural: { label: 'Natural', color: 'text-green-700', bgColor: 'bg-green-100' },
  'artificial-insemination': { label: 'AI', color: 'text-blue-700', bgColor: 'bg-blue-100' },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function daysFromNow(dateStr: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function getAnimal(id: string) {
  return animals.find((a) => a.id === id);
}

function getGestationDays(sireId: string): number {
  // Approximate gestation periods
  const sire = getAnimal(sireId);
  if (!sire) return 283; // default cattle
  switch (sire.type) {
    case 'cattle': return 283;
    case 'goat': return 150;
    case 'sheep': return 150;
    case 'pig': return 114;
    default: return 283;
  }
}

function getGestationProgress(matingDate: string, expectedDueDate: string): number {
  const mating = new Date(matingDate).getTime();
  const due = new Date(expectedDueDate).getTime();
  const now = Date.now();
  const totalDuration = due - mating;
  const elapsed = now - mating;
  if (totalDuration <= 0) return 100;
  return Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100)));
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ActiveBreedingCard({ record }: { record: BreedingRecord }) {
  const sire = getAnimal(record.sireId);
  const dam = getAnimal(record.damId);
  const statusCfg = STATUS_CONFIG[record.status];
  const methodCfg = METHOD_CONFIG[record.method];
  const StatusIcon = statusCfg.icon;

  const daysLeft = record.expectedDueDate ? daysFromNow(record.expectedDueDate) : null;
  const progress = record.expectedDueDate
    ? getGestationProgress(record.matingDate, record.expectedDueDate)
    : 0;

  return (
    <motion.div
      variants={cardVariants}
      className="rounded-2xl bg-white border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
    >
      <div className="p-5 lg:p-6">
        {/* Status + Method badges */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 ${statusCfg.bgColor} ${statusCfg.color}`}>
              <StatusIcon size={10} />
              {statusCfg.label}
            </span>
            <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${methodCfg.bgColor} ${methodCfg.color}`}>
              {methodCfg.label}
            </span>
          </div>
          <span className="text-[10px] font-mono text-gray-400">{record.id}</span>
        </div>

        {/* Sire x Dam pairing visual */}
        <div className="flex items-center gap-3 lg:gap-5">
          {/* Sire */}
          <div className="flex-1 text-center">
            <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-blue-50 border-2 border-blue-200 mx-auto overflow-hidden flex items-center justify-center">
              {sire?.image ? (
                <img
                  src={sire.image}
                  alt={record.sireName}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <span className="text-2xl text-blue-400">&#9794;</span>
              )}
            </div>
            <p className="text-sm font-bold text-[#1B2A4A] mt-2">{record.sireName}</p>
            <p className="text-[10px] text-gray-500">{sire?.breed || 'Unknown breed'}</p>
            <span className="text-blue-500 text-lg">&#9794;</span>
          </div>

          {/* Arrow */}
          <div className="flex flex-col items-center gap-1 shrink-0">
            <div className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center">
              <Heart size={18} className="text-pink-400" />
            </div>
            <ArrowRight size={16} className="text-gray-300" />
          </div>

          {/* Dam */}
          <div className="flex-1 text-center">
            <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-pink-50 border-2 border-pink-200 mx-auto overflow-hidden flex items-center justify-center">
              {dam?.image ? (
                <img
                  src={dam.image}
                  alt={record.damName}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <span className="text-2xl text-pink-400">&#9792;</span>
              )}
            </div>
            <p className="text-sm font-bold text-[#1B2A4A] mt-2">{record.damName}</p>
            <p className="text-[10px] text-gray-500">{dam?.breed || 'Unknown breed'}</p>
            <span className="text-pink-500 text-lg">&#9792;</span>
          </div>
        </div>

        {/* Details */}
        <div className="mt-5 space-y-3">
          {/* Mating date */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500 flex items-center gap-1.5">
              <CalendarDays size={14} className="text-gray-400" />
              Mating Date
            </span>
            <span className="font-semibold text-[#1B2A4A]">{formatDate(record.matingDate)}</span>
          </div>

          {/* Expected due date */}
          {record.expectedDueDate && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500 flex items-center gap-1.5">
                <Baby size={14} className="text-gray-400" />
                Expected Due Date
              </span>
              <span className="font-semibold text-[#1B2A4A]">{formatDate(record.expectedDueDate)}</span>
            </div>
          )}

          {/* Countdown */}
          {daysLeft !== null && record.expectedDueDate && (
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] text-gray-500">Gestation Progress</span>
                <span className={`text-xs font-bold ${daysLeft <= 0 ? 'text-green-600' : daysLeft <= 14 ? 'text-amber-600' : 'text-[#1B2A4A]'}`}>
                  {daysLeft > 0 ? `${daysLeft} days remaining` : daysLeft === 0 ? 'Due today!' : `${Math.abs(daysLeft)} days overdue`}
                </span>
              </div>
              <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className={`h-full rounded-full ${
                    progress >= 90
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                      : progress >= 50
                        ? 'bg-gradient-to-r from-[#8CB89C] to-purple-500'
                        : 'bg-gradient-to-r from-[#8CB89C] to-[#8CB89C]'
                  }`}
                />
              </div>
              <div className="flex items-center justify-between mt-1.5 text-[9px] text-gray-400">
                <span>{formatDate(record.matingDate)}</span>
                <span className="font-semibold">{progress}%</span>
                <span>{formatDate(record.expectedDueDate)}</span>
              </div>
            </div>
          )}

          {/* Notes */}
          {record.notes && (
            <p className="text-[11px] text-gray-500 bg-gray-50 rounded-lg p-2.5 leading-relaxed">
              {record.notes}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
          <button className="flex-1 h-9 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
            Update Status
          </button>
          <button className="flex-1 h-9 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 bg-[#8CB89C] text-white hover:bg-[#729E82] transition-colors">
            <Baby size={14} />
            Record Birth
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function HistoryCard({ record, defaultExpanded = false }: { record: BreedingRecord; defaultExpanded?: boolean }) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const statusCfg = STATUS_CONFIG[record.status];
  const methodCfg = METHOD_CONFIG[record.method];
  const StatusIcon = statusCfg.icon;
  const sire = getAnimal(record.sireId);
  const dam = getAnimal(record.damId);

  return (
    <motion.div
      variants={cardVariants}
      className="rounded-2xl bg-white border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="p-4 lg:p-5">
        <div className="flex items-start gap-3">
          {/* Status icon */}
          <div className={`w-10 h-10 rounded-xl ${statusCfg.bgColor} flex items-center justify-center shrink-0`}>
            <StatusIcon size={20} className={statusCfg.color} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Top row */}
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-[#1B2A4A]">
                {record.sireName} <span className="text-gray-400 font-normal">x</span> {record.damName}
              </h3>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusCfg.bgColor} ${statusCfg.color}`}>
                {statusCfg.label}
              </span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${methodCfg.bgColor} ${methodCfg.color}`}>
                {methodCfg.label}
              </span>
            </div>

            {/* Meta row */}
            <div className="flex items-center gap-3 mt-2 flex-wrap text-[11px] text-gray-500">
              <span className="flex items-center gap-1">
                <CalendarDays size={12} className="text-gray-400" />
                Mated: {formatDate(record.matingDate)}
              </span>
              {record.actualBirthDate && (
                <span className="flex items-center gap-1">
                  <Baby size={12} className="text-gray-400" />
                  Born: {formatDate(record.actualBirthDate)}
                </span>
              )}
              {record.expectedDueDate && !record.actualBirthDate && (
                <span className="flex items-center gap-1">
                  <Clock size={12} className="text-gray-400" />
                  Due: {formatDate(record.expectedDueDate)}
                </span>
              )}
              {record.status === 'delivered' && (
                <span className="flex items-center gap-1 font-medium text-green-600">
                  <Baby size={12} />
                  {record.offspring.length} offspring
                </span>
              )}
            </div>

            {/* Expandable details */}
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 mt-2 text-[11px] text-[#8CB89C] font-medium hover:text-[#729E82] transition-colors"
            >
              {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              {expanded ? 'Hide details' : 'Show details'}
            </button>

            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 space-y-2">
                    {/* Breed info */}
                    <div className="grid grid-cols-2 gap-3 text-[11px]">
                      <div className="bg-blue-50/50 rounded-lg p-2.5">
                        <span className="text-blue-500 font-medium">&#9794; Sire</span>
                        <p className="text-[#1B2A4A] font-semibold mt-0.5">{record.sireName}</p>
                        <p className="text-gray-500 text-[10px]">{sire?.breed || 'Unknown'} &bull; {sire?.tag || ''}</p>
                      </div>
                      <div className="bg-pink-50/50 rounded-lg p-2.5">
                        <span className="text-pink-500 font-medium">&#9792; Dam</span>
                        <p className="text-[#1B2A4A] font-semibold mt-0.5">{record.damName}</p>
                        <p className="text-gray-500 text-[10px]">{dam?.breed || 'Unknown'} &bull; {dam?.tag || ''}</p>
                      </div>
                    </div>

                    {/* Offspring list for delivered */}
                    {record.offspring.length > 0 && (
                      <div className="bg-green-50/50 rounded-lg p-2.5">
                        <span className="text-green-600 font-medium text-[11px]">Offspring</span>
                        <div className="mt-1.5 space-y-1">
                          {record.offspring.map((off) => (
                            <div
                              key={off.id || off.name}
                              className="flex items-center gap-2 text-[11px]"
                            >
                              <span className={off.gender === 'male' ? 'text-blue-500' : 'text-pink-500'}>
                                {off.gender === 'male' ? '\u2642' : '\u2640'}
                              </span>
                              <span className="font-medium text-[#1B2A4A]">{off.name}</span>
                              {off.id && off.id.startsWith('ANM-') && (
                                <Link
                                  href="/farm/livestock"
                                  className="text-[10px] text-[#8CB89C] hover:underline"
                                >
                                  View in herd
                                </Link>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {record.notes && (
                      <p className="text-[11px] text-gray-500 bg-gray-50 rounded-lg p-2.5 leading-relaxed">
                        {record.notes}
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function OffspringGroupCard({
  record,
}: {
  record: BreedingRecord;
}) {
  const sire = getAnimal(record.sireId);
  const dam = getAnimal(record.damId);

  return (
    <motion.div variants={cardVariants} className="rounded-2xl bg-white border border-gray-100 p-4 shadow-sm">
      {/* Breeding pair header */}
      <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1B2A4A]">
          <span className="text-blue-500">&#9794;</span>
          {record.sireName}
          <span className="text-gray-400 font-normal mx-1">x</span>
          <span className="text-pink-500">&#9792;</span>
          {record.damName}
        </div>
        <span className="text-[10px] font-mono text-gray-400 ml-auto">{record.id}</span>
      </div>

      {/* Offspring list */}
      <div className="space-y-2">
        {record.offspring.map((off) => {
          const offAnimal = off.id ? getAnimal(off.id) : null;
          return (
            <div
              key={off.id || off.name}
              className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              {/* Gender icon */}
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  off.gender === 'male' ? 'bg-blue-100' : 'bg-pink-100'
                }`}
              >
                <span className={`text-sm ${off.gender === 'male' ? 'text-blue-600' : 'text-pink-600'}`}>
                  {off.gender === 'male' ? '\u2642' : '\u2640'}
                </span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#1B2A4A]">{off.name}</span>
                  <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${
                    off.gender === 'male' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
                  }`}>
                    {off.gender === 'male' ? 'Male' : 'Female'}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5 text-[10px] text-gray-500">
                  {record.actualBirthDate && (
                    <span>Born: {formatDate(record.actualBirthDate)}</span>
                  )}
                  <span className="text-gray-300">&bull;</span>
                  <span>
                    {record.sireName} x {record.damName}
                  </span>
                </div>
              </div>

              {/* Link to animal */}
              {off.id && off.id.startsWith('ANM-') && (
                <Link
                  href="/farm/livestock"
                  className="text-[10px] font-semibold text-[#8CB89C] hover:text-[#729E82] px-2 py-1 rounded-lg hover:bg-[#EDF4EF] transition-colors shrink-0"
                >
                  View
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main Page Component
// ---------------------------------------------------------------------------

export default function LivestockBreedingPage() {
  // --- Live Supabase data (available when real data is entered) ---
  const { livestock: liveLivestock } = useLivestock();

  // --- State ---
  const [activeTab, setActiveTab] = useState<TabKey>('active');
  const [historyStatusFilter, setHistoryStatusFilter] = useState<BreedingRecord['status'] | 'all'>('all');

  // --- Derived data ---
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];
  const currentYear = today.getFullYear().toString();

  // Summary stats
  const stats = useMemo(() => {
    const activePregnancies = breedingRecords.filter(
      (r) => r.status === 'confirmed-pregnant'
    ).length;

    const thisYearBirths = breedingRecords.filter(
      (r) => r.status === 'delivered' && r.actualBirthDate && r.actualBirthDate.startsWith(currentYear)
    ).length;

    const totalDelivered = breedingRecords.filter((r) => r.status === 'delivered').length;
    const totalAttempts = breedingRecords.length;
    const successRate = totalAttempts > 0 ? Math.round((totalDelivered / totalAttempts) * 100) : 0;

    const upcomingDues = breedingRecords
      .filter(
        (r) =>
          (r.status === 'confirmed-pregnant' || r.status === 'mated') &&
          r.expectedDueDate &&
          r.expectedDueDate >= todayStr
      )
      .map((r) => r.expectedDueDate!)
      .sort();
    const nextDueDate = upcomingDues[0] || null;

    return { activePregnancies, thisYearBirths, successRate, nextDueDate };
  }, [todayStr, currentYear]);

  // Active breeding records
  const activeRecords = useMemo(
    () =>
      breedingRecords
        .filter((r) => r.status === 'mated' || r.status === 'confirmed-pregnant')
        .sort((a, b) => {
          // Sort by expected due date, nearest first
          if (a.expectedDueDate && b.expectedDueDate) {
            return a.expectedDueDate.localeCompare(b.expectedDueDate);
          }
          return b.matingDate.localeCompare(a.matingDate);
        }),
    []
  );

  // History records
  const historyRecords = useMemo(() => {
    let records = [...breedingRecords].sort((a, b) => b.matingDate.localeCompare(a.matingDate));
    if (historyStatusFilter !== 'all') {
      records = records.filter((r) => r.status === historyStatusFilter);
    }
    return records;
  }, [historyStatusFilter]);

  // Offspring records (only from delivered)
  const offspringRecords = useMemo(
    () =>
      breedingRecords
        .filter((r) => r.status === 'delivered' && r.offspring.length > 0)
        .sort((a, b) => {
          const dateA = a.actualBirthDate || a.matingDate;
          const dateB = b.actualBirthDate || b.matingDate;
          return dateB.localeCompare(dateA);
        }),
    []
  );

  const totalOffspring = useMemo(
    () => offspringRecords.reduce((sum, r) => sum + r.offspring.length, 0),
    [offspringRecords]
  );

  // --- Tabs ---
  const tabs: { key: TabKey; label: string; count?: number }[] = [
    { key: 'active', label: 'Active', count: activeRecords.length },
    { key: 'history', label: 'History', count: breedingRecords.length },
    { key: 'offspring', label: 'Offspring', count: totalOffspring },
  ];

  const historyFilterOptions: { key: BreedingRecord['status'] | 'all'; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'delivered', label: 'Delivered' },
    { key: 'confirmed-pregnant', label: 'Pregnant' },
    { key: 'mated', label: 'Mated' },
    { key: 'failed', label: 'Failed' },
  ];

  // =========================================================================
  // Render
  // =========================================================================

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ---------------------------------------------------------------- */}
      {/* Header                                                           */}
      {/* ---------------------------------------------------------------- */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-br from-purple-700 via-purple-800 to-[#1B2A4A] text-white"
      >
        <div className="max-w-6xl mx-auto px-4 lg:px-6 py-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <Heart size={28} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
                  Breeding Program
                </h1>
                <p className="text-white/70 text-sm mt-1">
                  Track mating, pregnancies, and offspring
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/farm/livestock"
                className="hidden sm:flex items-center gap-1.5 text-white/70 hover:text-white text-sm font-medium transition-colors"
              >
                <ArrowLeft size={16} />
                Back to Livestock
              </Link>
              <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors">
                <Plus size={16} />
                Record Mating
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-6xl mx-auto px-4 lg:px-6 py-6">
        {/* ---------------------------------------------------------------- */}
        {/* Summary Bar                                                      */}
        {/* ---------------------------------------------------------------- */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6"
        >
          {[
            {
              label: 'Active Pregnancies',
              value: stats.activePregnancies.toString(),
              icon: <Heart size={20} className="text-purple-500" />,
              accent: 'bg-purple-50',
            },
            {
              label: "This Year's Births",
              value: stats.thisYearBirths.toString(),
              icon: <Baby size={20} className="text-green-500" />,
              accent: 'bg-green-50',
            },
            {
              label: 'Success Rate',
              value: `${stats.successRate}%`,
              icon: <TrendingUp size={20} className="text-[#8CB89C]" />,
              accent: 'bg-[#EDF4EF]',
            },
            {
              label: 'Next Due Date',
              value: stats.nextDueDate ? formatDate(stats.nextDueDate) : 'None',
              icon: <Calendar size={20} className="text-amber-500" />,
              accent: 'bg-amber-50',
            },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              variants={cardVariants}
              className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl ${stat.accent} flex items-center justify-center`}
                >
                  {stat.icon}
                </div>
                <div>
                  <div className="text-lg font-bold text-[#1B2A4A]">
                    {stat.value}
                  </div>
                  <div className="text-[11px] text-gray-400">{stat.label}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ---------------------------------------------------------------- */}
        {/* Tab Switcher                                                     */}
        {/* ---------------------------------------------------------------- */}
        <div className="flex items-center gap-1 bg-white rounded-xl p-1 border border-gray-100 shadow-sm mb-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 min-w-[120px] text-sm font-semibold py-2.5 px-4 rounded-lg transition-all whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-[#1B2A4A] text-white shadow-sm'
                  : 'text-gray-500 hover:text-[#1B2A4A] hover:bg-gray-50'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full ${
                    activeTab === tab.key
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ================================================================ */}
        {/* TAB CONTENT                                                      */}
        {/* ================================================================ */}
        <AnimatePresence mode="wait">
          {/* ============================================================== */}
          {/* ACTIVE TAB                                                     */}
          {/* ============================================================== */}
          {activeTab === 'active' && (
            <motion.div
              key="active"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeRecords.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-16 bg-white rounded-2xl border border-gray-100"
                >
                  <Heart size={40} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-sm text-gray-500 font-medium">No active breeding records</p>
                  <p className="text-xs text-gray-400 mt-1">Record a new mating to get started</p>
                </motion.div>
              ) : (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 lg:grid-cols-2 gap-4"
                >
                  {activeRecords.map((record) => (
                    <ActiveBreedingCard key={record.id} record={record} />
                  ))}
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ============================================================== */}
          {/* HISTORY TAB                                                    */}
          {/* ============================================================== */}
          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Status filter pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
                {historyFilterOptions.map((opt) => {
                  const count =
                    opt.key === 'all'
                      ? breedingRecords.length
                      : breedingRecords.filter((r) => r.status === opt.key).length;
                  return (
                    <button
                      key={opt.key}
                      onClick={() => setHistoryStatusFilter(opt.key)}
                      className={`flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl whitespace-nowrap transition-all border ${
                        historyStatusFilter === opt.key
                          ? 'bg-[#1B2A4A] text-white border-[#1B2A4A] shadow-sm'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-[#8CB89C] hover:text-[#8CB89C]'
                      }`}
                    >
                      {opt.key !== 'all' && (
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            opt.key === 'delivered'
                              ? 'bg-green-500'
                              : opt.key === 'confirmed-pregnant'
                                ? 'bg-purple-500'
                                : opt.key === 'mated'
                                  ? 'bg-amber-500'
                                  : 'bg-red-500'
                          }`}
                        />
                      )}
                      {opt.label}
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                          historyStatusFilter === opt.key
                            ? 'bg-white/20 text-white'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* History list */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-3"
              >
                {historyRecords.length === 0 ? (
                  <motion.div
                    variants={cardVariants}
                    className="text-center py-16 bg-white rounded-2xl border border-gray-100"
                  >
                    <FileText size={40} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-sm text-gray-500 font-medium">No matching records</p>
                    <p className="text-xs text-gray-400 mt-1">Try adjusting your filter</p>
                  </motion.div>
                ) : (
                  historyRecords.map((record) => (
                    <HistoryCard key={record.id} record={record} />
                  ))
                )}
              </motion.div>
            </motion.div>
          )}

          {/* ============================================================== */}
          {/* OFFSPRING TAB                                                  */}
          {/* ============================================================== */}
          {activeTab === 'offspring' && (
            <motion.div
              key="offspring"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Total offspring summary */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-r from-green-50 to-[#EDF4EF] border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                  <Users size={20} className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#1B2A4A]">
                    {totalOffspring} Total Offspring
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    From {offspringRecords.length} breeding pair{offspringRecords.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </motion.div>

              {/* Offspring grouped by breeding pair */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-4"
              >
                {offspringRecords.length === 0 ? (
                  <motion.div
                    variants={cardVariants}
                    className="text-center py-16 bg-white rounded-2xl border border-gray-100"
                  >
                    <Baby size={40} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-sm text-gray-500 font-medium">No offspring recorded</p>
                    <p className="text-xs text-gray-400 mt-1">Offspring will appear here after deliveries</p>
                  </motion.div>
                ) : (
                  offspringRecords.map((record) => (
                    <OffspringGroupCard key={record.id} record={record} />
                  ))
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
