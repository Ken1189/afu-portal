'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Beef,
  Search,
  ChevronDown,
  ChevronRight,
  Heart,
  DollarSign,
  Activity,
  Baby,
  Syringe,
  Pill,
  Plus,
  Droplets,
  Scale,
  FileText,
  AlertTriangle,
  AlertCircle,
  Clock,
  Calendar,
  ShieldAlert,
  Weight,
  Tag,
  ArrowUpDown,
  X,
} from 'lucide-react';
import { useLivestock, useCreateLivestock } from '@/lib/supabase/use-livestock';
import { useAuth } from '@/lib/supabase/auth-context';

// ---------------------------------------------------------------------------
// Inlined types & data (previously from @/lib/data/livestock)
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

interface VetRecord {
  id: string;
  animalId: string;
  animalName: string;
  type: 'vaccination' | 'treatment' | 'checkup' | 'surgery' | 'deworming' | 'dipping';
  description: string;
  date: string;
  veterinarian: string;
  clinic: string;
  cost: number;
  nextDueDate: string | null;
  medications: string[];
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

interface LivestockSummary {
  totalAnimals: number;
  totalValue: number;
  byType: Record<AnimalType, number>;
  healthyPercentage: number;
  pregnantCount: number;
  upcomingVaccinations: number;
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

const vetRecords: VetRecord[] = [
  { id: 'VET-001', animalId: 'ANM-001', animalName: 'Mosi', type: 'vaccination', description: 'Foot-and-Mouth Disease (FMD) vaccination — trivalent SAT1/SAT2/SAT3', date: '2025-03-15', veterinarian: 'Dr. Keabetswe Molefe', clinic: 'Maun Veterinary Services', cost: 18, nextDueDate: '2025-09-15', medications: ['FMD Trivalent Vaccine'], notes: 'Bi-annual FMD vaccination as per Botswana DVS protocol. No adverse reaction.' },
  { id: 'VET-002', animalId: 'ANM-002', animalName: 'Thandi', type: 'vaccination', description: 'Lumpy Skin Disease (LSD) vaccination', date: '2025-04-02', veterinarian: 'Dr. Keabetswe Molefe', clinic: 'Maun Veterinary Services', cost: 12, nextDueDate: '2026-04-02', medications: ['Lumpy Skin Disease Vaccine (Neethling strain)'], notes: 'Annual LSD vaccination. Mild swelling at injection site — resolved in 48 hours.' },
  { id: 'VET-003', animalId: 'ANM-003', animalName: 'Bongani', type: 'vaccination', description: 'Anthrax vaccination — annual booster', date: '2025-05-20', veterinarian: 'Dr. Tatenda Mhike', clinic: 'Masvingo Vet Clinic', cost: 8, nextDueDate: '2026-05-20', medications: ['Anthrax Spore Vaccine (Sterne 34F2)'], notes: 'Anthrax endemic area — annual vaccination mandatory in Masvingo district.' },
  { id: 'VET-004', animalId: 'ANM-005', animalName: 'Kwezi', type: 'vaccination', description: 'Blackleg (Clostridial) vaccination', date: '2025-06-10', veterinarian: 'Dr. Asha Mwinyi', clinic: 'Dodoma Regional Vet Centre', cost: 10, nextDueDate: '2026-06-10', medications: ['Multivax-P Plus (8-in-1 Clostridial)'], notes: 'Combined clostridial vaccine covering blackleg, black disease, enterotoxaemia, and tetanus.' },
  { id: 'VET-005', animalId: 'ANM-023', animalName: 'Layer Flock C', type: 'vaccination', description: 'Newcastle Disease vaccination — LaSota strain via drinking water', date: '2025-07-01', veterinarian: 'Dr. Keabetswe Molefe', clinic: 'Maun Veterinary Services', cost: 25, nextDueDate: '2025-10-01', medications: ['Newcastle Disease Vaccine (LaSota live)'], notes: 'Quarterly Newcastle vaccination for the layer flock. Water withheld for 2 hours before administration.' },
  { id: 'VET-006', animalId: 'ANM-001', animalName: 'Mosi', type: 'vaccination', description: 'Foot-and-Mouth Disease (FMD) vaccination — second bi-annual dose', date: '2025-09-15', veterinarian: 'Dr. Keabetswe Molefe', clinic: 'Maun Veterinary Services', cost: 18, nextDueDate: '2026-03-15', medications: ['FMD Trivalent Vaccine'], notes: 'Second dose for the year. Herd restrained in crush pen — no complications.' },
  { id: 'VET-007', animalId: 'ANM-021', animalName: 'RIR Flock A', type: 'vaccination', description: 'Newcastle Disease and Infectious Bronchitis combo vaccine', date: '2025-09-20', veterinarian: 'Dr. Asha Mwinyi', clinic: 'Dodoma Regional Vet Centre', cost: 30, nextDueDate: '2025-12-20', medications: ['ND-IB Combined Live Vaccine'], notes: 'Combo vaccine administered via eye drop. Flock showing good immune response.' },
  { id: 'VET-008', animalId: 'ANM-011', animalName: 'Tau', type: 'vaccination', description: 'Pasteurella and Clostridial combo vaccination', date: '2025-10-05', veterinarian: 'Dr. Keabetswe Molefe', clinic: 'Maun Veterinary Services', cost: 14, nextDueDate: '2026-10-05', medications: ['Multivax-P Plus', 'Pasteurella Vaccine'], notes: 'Annual vaccination for goat flock. Buck in excellent condition.' },
  { id: 'VET-009', animalId: 'ANM-017', animalName: 'Jabari', type: 'vaccination', description: 'Bluetongue vaccination', date: '2025-11-10', veterinarian: 'Dr. Keabetswe Molefe', clinic: 'Maun Veterinary Services', cost: 15, nextDueDate: '2026-11-10', medications: ['Bluetongue Polyvalent Vaccine'], notes: 'Annual bluetongue vaccination before summer midge season. Ram in good body condition.' },
  { id: 'VET-010', animalId: 'ANM-022', animalName: 'Kuroiler Flock B', type: 'vaccination', description: 'Newcastle Disease vaccination — I-2 thermostable vaccine', date: '2025-12-01', veterinarian: 'Dr. Asha Mwinyi', clinic: 'Dodoma Regional Vet Centre', cost: 20, nextDueDate: '2026-03-01', medications: ['ND I-2 Thermostable Vaccine'], notes: 'I-2 vaccine chosen for heat stability in village conditions. Administered via eye drop.' },
  { id: 'VET-011', animalId: 'ANM-010', animalName: 'Rudo', type: 'treatment', description: 'Treatment for tick fever (anaplasmosis) — imidocarb injection', date: '2026-03-10', veterinarian: 'Dr. Tatenda Mhike', clinic: 'Masvingo Vet Clinic', cost: 45, nextDueDate: '2026-03-17', medications: ['Imidocarb Dipropionate (Imizol)', 'Oxytetracycline LA'], notes: 'PCV at 18% — moderate anaemia. Imidocarb 1.2mg/kg IM plus oxytet 20mg/kg. Recheck in 7 days.' },
  { id: 'VET-012', animalId: 'ANM-007', animalName: 'Lindiwe', type: 'treatment', description: 'Mastitis treatment — left rear quarter', date: '2025-08-22', veterinarian: 'Dr. Keabetswe Molefe', clinic: 'Maun Veterinary Services', cost: 55, nextDueDate: null, medications: ['Cephalexin Intramammary Tubes', 'Meloxicam (anti-inflammatory)'], notes: 'CMT test positive (3+) on left rear. Intramammary antibiotic course for 3 days. Milk withheld 96 hours.' },
  { id: 'VET-013', animalId: 'ANM-006', animalName: 'Simba', type: 'treatment', description: 'Bloat emergency treatment — trocar and oral drench', date: '2025-11-18', veterinarian: 'Dr. Tatenda Mhike', clinic: 'Masvingo Vet Clinic', cost: 65, nextDueDate: null, medications: ['Poloxalene Anti-Bloat Drench', 'Simethicone'], notes: 'Acute frothy bloat after grazing lucerne paddock. Trocar inserted for emergency gas relief. Full recovery within 6 hours.' },
  { id: 'VET-014', animalId: 'ANM-023', animalName: 'Layer Flock C', type: 'treatment', description: 'Suspected Newcastle Disease outbreak — supportive treatment', date: '2026-03-05', veterinarian: 'Dr. Keabetswe Molefe', clinic: 'Maun Veterinary Services', cost: 85, nextDueDate: '2026-03-12', medications: ['Electrolyte Powder', 'Oxytetracycline Water-Soluble', 'Vitamin AD3E'], notes: '12 hens showing respiratory signs, greenish diarrhea, twisted necks. Mortality: 3 birds. Samples sent to BNVL for confirmation. Flock isolated.' },
  { id: 'VET-015', animalId: 'ANM-019', animalName: 'Tendai', type: 'treatment', description: 'Foot rot treatment — topical and injectable', date: '2025-12-14', veterinarian: 'Dr. Tatenda Mhike', clinic: 'Masvingo Vet Clinic', cost: 35, nextDueDate: null, medications: ['Zinc Sulphate Footbath', 'Oxytetracycline LA'], notes: 'Lameness on right front foot. Hoof trimmed and treated. Zinc sulphate footbath for 5 days.' },
  { id: 'VET-016', animalId: 'ANM-004', animalName: 'Naledi', type: 'checkup', description: 'Pregnancy confirmation — rectal palpation and ultrasound', date: '2025-12-20', veterinarian: 'Dr. Keabetswe Molefe', clinic: 'Maun Veterinary Services', cost: 40, nextDueDate: '2026-03-20', medications: [], notes: 'Pregnancy confirmed at approximately 90 days. Single calf detected on ultrasound. Body condition score 3.5/5. Due April 2026.' },
  { id: 'VET-017', animalId: 'ANM-012', animalName: 'Dineo', type: 'checkup', description: 'Pregnancy ultrasound — goat', date: '2026-01-08', veterinarian: 'Dr. Keabetswe Molefe', clinic: 'Maun Veterinary Services', cost: 35, nextDueDate: '2026-03-25', medications: [], notes: 'Twin pregnancy confirmed. Both fetuses viable. Expected kidding mid-April 2026.' },
  { id: 'VET-018', animalId: 'ANM-008', animalName: 'Tafara', type: 'checkup', description: 'Pregnancy confirmation — rectal palpation', date: '2026-01-15', veterinarian: 'Dr. Tatenda Mhike', clinic: 'Masvingo Vet Clinic', cost: 35, nextDueDate: '2026-04-15', medications: [], notes: 'Confirmed pregnant approximately 75 days. Due date estimated May 2026. Cow in good condition.' },
  { id: 'VET-019', animalId: 'ANM-025', animalName: 'Ayana', type: 'checkup', description: 'Pregnancy confirmation — pig ultrasound', date: '2026-02-01', veterinarian: 'Dr. Tatenda Mhike', clinic: 'Masvingo Vet Clinic', cost: 30, nextDueDate: '2026-04-01', medications: [], notes: 'Pregnancy confirmed. Multiple fetuses detected — estimated 8-10 piglets. Expected farrowing mid-April 2026.' },
  { id: 'VET-020', animalId: 'ANM-024', animalName: 'Themba', type: 'checkup', description: 'Breeding soundness evaluation — boar', date: '2025-10-15', veterinarian: 'Dr. Tatenda Mhike', clinic: 'Masvingo Vet Clinic', cost: 50, nextDueDate: null, medications: [], notes: 'BSE passed. Good libido, semen quality excellent. Testes firm and symmetrical. Cleared for breeding.' },
  { id: 'VET-021', animalId: 'ANM-002', animalName: 'Thandi', type: 'deworming', description: 'Broad-spectrum deworming — ivermectin pour-on', date: '2025-07-10', veterinarian: 'Dr. Keabetswe Molefe', clinic: 'Maun Veterinary Services', cost: 8, nextDueDate: '2025-11-10', medications: ['Ivermectin Pour-On (Ivomec)'], notes: 'Routine quarterly deworming. Faecal egg count was 450 EPG — moderate burden.' },
  { id: 'VET-022', animalId: 'ANM-011', animalName: 'Tau', type: 'deworming', description: 'Deworming — albendazole oral drench', date: '2025-08-05', veterinarian: 'Dr. Keabetswe Molefe', clinic: 'Maun Veterinary Services', cost: 6, nextDueDate: '2025-12-05', medications: ['Albendazole 10% Oral Suspension (Valbazen)'], notes: 'Goat showed rough coat and weight loss. Faecal egg count 1200 EPG — heavy Haemonchus burden. Follow-up FAMACHA check in 2 weeks.' },
  { id: 'VET-023', animalId: 'ANM-017', animalName: 'Jabari', type: 'deworming', description: 'Strategic deworming — closantel for liver fluke', date: '2025-10-20', veterinarian: 'Dr. Keabetswe Molefe', clinic: 'Maun Veterinary Services', cost: 10, nextDueDate: '2026-04-20', medications: ['Closantel (Flukiver)'], notes: 'Liver fluke risk area near seasonal dam. Closantel drench at 10mg/kg. Ram in good body condition.' },
  { id: 'VET-024', animalId: 'ANM-014', animalName: 'Mpho', type: 'deworming', description: 'Post-kidding deworming — levamisole', date: '2026-02-18', veterinarian: 'Dr. Keabetswe Molefe', clinic: 'Maun Veterinary Services', cost: 6, nextDueDate: '2026-06-18', medications: ['Levamisole Hydrochloride (Ripercol)'], notes: 'Routine post-kidding deworming. Periparturient rise in egg count expected. Doe nursing twins.' },
  { id: 'VET-025', animalId: 'ANM-005', animalName: 'Kwezi', type: 'deworming', description: 'Broad-spectrum deworming — ivermectin injection', date: '2026-01-22', veterinarian: 'Dr. Asha Mwinyi', clinic: 'Dodoma Regional Vet Centre', cost: 10, nextDueDate: '2026-05-22', medications: ['Ivermectin 1% Injectable'], notes: 'Routine deworming. Also effective against external parasites. Cow in good condition.' },
  { id: 'VET-026', animalId: 'ANM-001', animalName: 'Mosi', type: 'dipping', description: 'Cattle dipping — amitraz plunge dip', date: '2025-11-01', veterinarian: 'Dr. Keabetswe Molefe', clinic: 'Maun Veterinary Services', cost: 5, nextDueDate: '2025-11-15', medications: ['Amitraz (Triatix)'], notes: 'Fortnightly plunge dipping during wet season. High tick load — Boophilus and Amblyomma species.' },
  { id: 'VET-027', animalId: 'ANM-003', animalName: 'Bongani', type: 'dipping', description: 'Cattle dipping — amitraz spray race', date: '2025-12-01', veterinarian: 'Dr. Tatenda Mhike', clinic: 'Masvingo Vet Clinic', cost: 4, nextDueDate: '2025-12-15', medications: ['Amitraz (Triatix)'], notes: 'Spray race dipping. Tick counts reduced from previous dip. Wet season protocol continues.' },
  { id: 'VET-028', animalId: 'ANM-010', animalName: 'Rudo', type: 'dipping', description: 'Emergency acaricide treatment — deltamethrin pour-on for heavy tick infestation', date: '2026-02-28', veterinarian: 'Dr. Tatenda Mhike', clinic: 'Masvingo Vet Clinic', cost: 12, nextDueDate: '2026-03-14', medications: ['Deltamethrin Pour-On (Decatix)'], notes: 'Heavy Rhipicephalus tick load on udder and ear area. Pour-on applied — full body. Likely contributed to subsequent tick fever.' },
  { id: 'VET-029', animalId: 'ANM-007', animalName: 'Lindiwe', type: 'dipping', description: 'Cattle dipping — amitraz plunge dip', date: '2026-01-05', veterinarian: 'Dr. Keabetswe Molefe', clinic: 'Maun Veterinary Services', cost: 5, nextDueDate: '2026-01-19', medications: ['Amitraz (Triatix)'], notes: 'Routine wet-season dip. Tick counts low — dipping programme effective.' },
  { id: 'VET-030', animalId: 'ANM-006', animalName: 'Simba', type: 'dipping', description: 'Cattle dipping — cypermethrin spray', date: '2026-02-10', veterinarian: 'Dr. Tatenda Mhike', clinic: 'Masvingo Vet Clinic', cost: 5, nextDueDate: '2026-02-24', medications: ['Cypermethrin (Ectomin)'], notes: 'Hand-spray application. Young bull cooperated well in the race. Moderate blue tick presence.' },
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

function getLivestockSummary(): LivestockSummary {
  const activeAnimals = animals.filter((a) => a.status !== 'sold' && a.status !== 'deceased');
  const totalAnimals = activeAnimals.length;
  const totalValue = activeAnimals.reduce((sum, a) => sum + a.currentValue, 0);
  const byType: Record<AnimalType, number> = { cattle: 0, goat: 0, sheep: 0, poultry: 0, pig: 0 };
  for (const animal of activeAnimals) { byType[animal.type]++; }
  const healthyCount = activeAnimals.filter((a) => a.status === 'healthy').length;
  const healthyPercentage = totalAnimals > 0 ? Math.round((healthyCount / totalAnimals) * 100) : 0;
  const pregnantCount = activeAnimals.filter((a) => a.status === 'pregnant').length;
  const today = new Date().toISOString().split('T')[0];
  const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const upcomingVaccinations = vetRecords.filter((v) => v.type === 'vaccination' && v.nextDueDate !== null && v.nextDueDate >= today && v.nextDueDate <= thirtyDaysFromNow).length;
  return { totalAnimals, totalValue, byType, healthyPercentage, pregnantCount, upcomingVaccinations };
}

// ─── Animation Variants ──────────────────────────────────────────────────────

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

const expandVariants = {
  collapsed: {
    height: 0,
    opacity: 0,
    transition: {
      height: { duration: 0.3, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] },
      opacity: { duration: 0.2 },
    },
  },
  expanded: {
    height: 'auto' as const,
    opacity: 1,
    transition: {
      height: { duration: 0.3, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] },
      opacity: { duration: 0.25, delay: 0.1 },
    },
  },
};

// ─── Types & Constants ───────────────────────────────────────────────────────

type TabKey = 'herd' | 'actions' | 'alerts';
type SortKey = 'name-az' | 'newest' | 'value-high';
type TypeFilter = 'all' | AnimalType;
type StatusFilter = 'all' | AnimalStatus;

const TYPE_LABELS: Record<AnimalType, string> = {
  cattle: 'Cattle',
  goat: 'Goats',
  sheep: 'Sheep',
  poultry: 'Poultry',
  pig: 'Pigs',
};

const TYPE_BADGE_STYLES: Record<AnimalType, string> = {
  cattle: 'bg-amber-800/90 text-white',
  goat: 'bg-amber-500/90 text-white',
  sheep: 'bg-slate-500/90 text-white',
  poultry: 'bg-orange-500/90 text-white',
  pig: 'bg-pink-500/90 text-white',
};

const STATUS_BADGE_STYLES: Record<AnimalStatus, string> = {
  healthy: 'bg-green-100 text-green-700',
  sick: 'bg-red-100 text-red-700',
  pregnant: 'bg-purple-100 text-purple-700',
  lactating: 'bg-blue-100 text-blue-700',
  quarantine: 'bg-amber-100 text-amber-700',
  sold: 'bg-gray-100 text-gray-500',
  deceased: 'bg-gray-100 text-gray-500',
};

const STATUS_LABELS: Record<AnimalStatus, string> = {
  healthy: 'Healthy',
  sick: 'Sick',
  pregnant: 'Pregnant',
  lactating: 'Lactating',
  quarantine: 'Quarantine',
  sold: 'Sold',
  deceased: 'Deceased',
};

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'name-az', label: 'Name A-Z' },
  { key: 'newest', label: 'Newest' },
  { key: 'value-high', label: 'Value High-Low' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatAge(dob: string): string {
  const birth = new Date(dob);
  const now = new Date('2026-03-16');
  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  if (months < 0) {
    years--;
    months += 12;
  }
  if (years > 0 && months > 0) return `${years}y ${months}m`;
  if (years > 0) return `${years}y`;
  return `${months}m`;
}

function formatCurrency(amount: number): string {
  return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 });
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function getHealthColor(percent: number): string {
  if (percent >= 75) return 'text-green-600';
  if (percent >= 50) return 'text-amber-500';
  return 'text-red-500';
}

function getHealthBg(percent: number): string {
  if (percent >= 75) return 'bg-green-500';
  if (percent >= 50) return 'bg-amber-500';
  return 'bg-red-500';
}

function sortAnimals(items: Animal[], key: SortKey): Animal[] {
  const sorted = [...items];
  switch (key) {
    case 'name-az':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'newest':
      return sorted.sort((a, b) => new Date(b.dateOfBirth).getTime() - new Date(a.dateOfBirth).getTime());
    case 'value-high':
      return sorted.sort((a, b) => b.currentValue - a.currentValue);
    default:
      return sorted;
  }
}

function daysUntil(dateStr: string): number {
  const now = new Date('2026-03-16');
  const target = new Date(dateStr);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

// ─── Component: AnimalCard ───────────────────────────────────────────────────

function AnimalCard({ animal }: { animal: Animal }) {
  const [expanded, setExpanded] = useState(false);

  const animalVetRecords = useMemo(
    () =>
      vetRecords
        .filter((v) => v.animalId === animal.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 3),
    [animal.id]
  );

  return (
    <motion.div
      variants={cardVariants}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
    >
      {/* Image + overlay */}
      <button
        onClick={() => setExpanded((p) => !p)}
        className="w-full text-left focus:outline-none"
      >
        <div className="relative h-[180px] w-full overflow-hidden">
          <Image
            src={animal.image}
            alt={animal.name}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

          {/* Type badge top-left */}
          <div className="absolute top-3 left-3">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold backdrop-blur-sm ${TYPE_BADGE_STYLES[animal.type]}`}
            >
              {TYPE_LABELS[animal.type]}
            </span>
          </div>

          {/* Tag number top-right */}
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold bg-white/90 text-[#1B2A4A] backdrop-blur-sm">
              <Tag className="w-3 h-3" />
              {animal.tag}
            </span>
          </div>

          {/* Name + breed overlay bottom */}
          <div className="absolute bottom-3 left-3 right-3">
            <div className="flex items-center gap-2">
              <h3 className="text-white font-bold text-base leading-tight">{animal.name}</h3>
              <span className="text-white/60 text-sm">{animal.gender === 'male' ? '\u2642' : '\u2640'}</span>
            </div>
            <p className="text-white/80 text-xs mt-0.5">{animal.breed}</p>
          </div>
        </div>
      </button>

      {/* Card body */}
      <div className="p-4">
        {/* Stats row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            {/* Age */}
            <div>
              <p className="text-sm font-bold text-[#1B2A4A]">{formatAge(animal.dateOfBirth)}</p>
              <p className="text-[11px] text-gray-500">Age</p>
            </div>
            <div className="w-px h-8 bg-gray-200" />
            {/* Weight */}
            <div>
              <p className="text-sm font-bold text-[#1B2A4A]">
                {animal.weight}
                <span className="text-[10px] font-normal text-gray-400 ml-0.5">kg</span>
              </p>
              <p className="text-[11px] text-gray-500">Weight</p>
            </div>
          </div>

          {/* Value */}
          <div className="text-right">
            <p className="text-sm font-bold text-[#8CB89C]">{formatCurrency(animal.currentValue)}</p>
            <p className="text-[11px] text-gray-500">Value</p>
          </div>
        </div>

        {/* Status + last vet */}
        <div className="flex items-center justify-between">
          <span
            className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${STATUS_BADGE_STYLES[animal.status]}`}
          >
            {STATUS_LABELS[animal.status]}
          </span>
          <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            Acquired: {formatShortDate(animal.acquisitionDate)}
          </div>
        </div>

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded((p) => !p)}
          className="mt-3 w-full flex items-center justify-center gap-1 py-2 rounded-xl bg-gray-50 text-xs font-medium text-gray-500 active:bg-gray-100 transition-colors min-h-[44px]"
        >
          {expanded ? 'Hide details' : 'View details'}
          <motion.span animate={{ rotate: expanded ? 90 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronRight className="w-3.5 h-3.5" />
          </motion.span>
        </button>
      </div>

      {/* Expanded section */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            variants={expandVariants}
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4 border-t border-gray-100 pt-4">
              {/* Full details */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-[#1B2A4A]">Details</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-gray-50 rounded-xl p-2.5">
                    <p className="text-[10px] text-gray-400">Acquired</p>
                    <p className="text-xs font-medium text-[#1B2A4A] capitalize">
                      {animal.acquisitionMethod.replace(/-/g, ' ')}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-2.5">
                    <p className="text-[10px] text-gray-400">Purchase Price</p>
                    <p className="text-xs font-medium text-[#1B2A4A]">
                      {animal.purchasePrice != null && animal.purchasePrice > 0 ? formatCurrency(animal.purchasePrice) : 'N/A'}
                    </p>
                  </div>
                </div>
                {animal.notes && (
                  <p className="text-[11px] text-gray-600 bg-gray-50 rounded-xl p-2.5 leading-relaxed">
                    {animal.notes}
                  </p>
                )}
              </div>

              {/* Parents */}
              {(animal.parentSire || animal.parentDam) && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-[#1B2A4A]">Parents</p>
                  <div className="flex items-center gap-3">
                    {animal.parentSire && (
                      <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-medium">
                        <span className="text-blue-400">{'\u2642'}</span>
                        Sire: {animals.find((a) => a.id === animal.parentSire)?.name ?? animal.parentSire}
                      </div>
                    )}
                    {animal.parentDam && (
                      <div className="flex items-center gap-1.5 bg-pink-50 text-pink-700 px-3 py-1.5 rounded-lg text-xs font-medium">
                        <span className="text-pink-400">{'\u2640'}</span>
                        Dam: {animals.find((a) => a.id === animal.parentDam)?.name ?? animal.parentDam}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Recent vet records */}
              {animalVetRecords.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-[#1B2A4A]">Recent Vet Records</p>
                  {animalVetRecords.map((rec) => (
                    <div
                      key={rec.id}
                      className="flex items-start gap-3 p-2.5 rounded-xl bg-gray-50 border border-gray-100"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#8CB89C]/10 flex items-center justify-center shrink-0">
                        {rec.type === 'vaccination' && <Syringe className="w-4 h-4 text-[#8CB89C]" />}
                        {rec.type === 'treatment' && <Pill className="w-4 h-4 text-red-500" />}
                        {rec.type === 'checkup' && <Activity className="w-4 h-4 text-blue-500" />}
                        {rec.type === 'deworming' && <Pill className="w-4 h-4 text-amber-500" />}
                        {rec.type === 'dipping' && <Droplets className="w-4 h-4 text-cyan-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-[#1B2A4A] truncate">{rec.description}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] text-gray-500">{formatShortDate(rec.date)}</span>
                          <span className="text-[11px] text-gray-400">{rec.veterinarian}</span>
                          <span className="text-[11px] font-semibold text-amber-600">
                            {formatCurrency(rec.cost)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Action buttons */}
              <div className="grid grid-cols-3 gap-2">
                <button className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl bg-[#8CB89C]/10 text-[#8CB89C] active:bg-[#8CB89C]/20 transition-colors min-h-[64px]">
                  <Heart className="w-5 h-5" />
                  <span className="text-[11px] font-semibold">Record Health</span>
                </button>
                <button className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl bg-amber-50 text-amber-600 active:bg-amber-100 transition-colors min-h-[64px]">
                  <Scale className="w-5 h-5" />
                  <span className="text-[11px] font-semibold">Add Weight</span>
                </button>
                <button className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl bg-[#D4A843]/10 text-[#D4A843] active:bg-[#D4A843]/20 transition-colors min-h-[64px]">
                  <DollarSign className="w-5 h-5" />
                  <span className="text-[11px] font-semibold">Mark for Sale</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Component: Quick Action Card ────────────────────────────────────────────

function QuickActionCard({
  icon,
  title,
  description,
  bgColor,
  iconColor,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  bgColor: string;
  iconColor: string;
  onClick?: () => void;
}) {
  return (
    <motion.button
      variants={cardVariants}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow text-center min-h-[140px]"
    >
      <div
        className={`w-14 h-14 rounded-2xl flex items-center justify-center ${bgColor}`}
      >
        <div className={iconColor}>{icon}</div>
      </div>
      <div>
        <p className="text-sm font-bold text-[#1B2A4A]">{title}</p>
        <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">{description}</p>
      </div>
    </motion.button>
  );
}

// ─── Component: Alert Card ───────────────────────────────────────────────────

function AlertCard({
  urgency,
  icon,
  message,
  animalName,
  animalTag,
  actionLabel,
  urgencyColor,
}: {
  urgency: 'high' | 'medium' | 'low';
  icon: React.ReactNode;
  message: string;
  animalName: string;
  animalTag: string;
  actionLabel: string;
  urgencyColor: string;
}) {
  const urgencyStyles = {
    high: 'border-l-4 border-l-red-500 bg-red-50/50',
    medium: 'border-l-4 border-l-amber-500 bg-amber-50/50',
    low: 'border-l-4 border-l-blue-500 bg-blue-50/50',
  };

  return (
    <motion.div
      variants={cardVariants}
      className={`rounded-2xl p-4 ${urgencyStyles[urgency]}`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${urgencyColor}`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[#1B2A4A] leading-snug">{message}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[11px] font-semibold text-[#1B2A4A]">{animalName}</span>
            <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full font-mono">
              {animalTag}
            </span>
          </div>
          <button className="mt-2 text-xs font-semibold text-[#8CB89C] hover:underline flex items-center gap-1">
            {actionLabel}
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function LivestockPage() {
  // --- Live Supabase data (available when real data is entered) ---
  const { livestock: liveLivestock, fetchLivestock } = useLivestock();
  const { createLivestock } = useCreateLivestock();
  const { user } = useAuth();

  // --- Add Animal form state ---
  const [showAddForm, setShowAddForm] = useState(false);
  const [addFormSubmitting, setAddFormSubmitting] = useState(false);
  const [addFormData, setAddFormData] = useState({
    type: 'cattle' as string,
    breed: '',
    count: 1,
    health_status: 'healthy',
    location: '',
  });

  const handleAddAnimal = async () => {
    if (!user) return;
    setAddFormSubmitting(true);
    try {
      await createLivestock({
        member_id: user.id,
        type: addFormData.type,
        breed: addFormData.breed || null,
        count: addFormData.count,
        tag_id: null,
        health_status: addFormData.health_status,
        location: addFormData.location || null,
        value_estimate: null,
        date_acquired: new Date().toISOString().split('T')[0],
        notes: null,
      });
      setShowAddForm(false);
      setAddFormData({ type: 'cattle', breed: '', count: 1, health_status: 'healthy', location: '' });
      fetchLivestock();
    } catch {
      // silent fail
    } finally {
      setAddFormSubmitting(false);
    }
  };

  // --- State ---
  const [activeTab, setActiveTab] = useState<TabKey>('herd');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('name-az');
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // --- Derived ---
  const summary = useMemo(() => getLivestockSummary(), []);

  const activeAnimals = useMemo(
    () => animals.filter((a) => a.status !== 'sold' && a.status !== 'deceased'),
    []
  );

  const filteredAnimals = useMemo(() => {
    let items = [...activeAnimals];

    if (typeFilter !== 'all') {
      items = items.filter((a) => a.type === typeFilter);
    }
    if (statusFilter !== 'all') {
      items = items.filter((a) => a.status === statusFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.tag.toLowerCase().includes(q) ||
          a.breed.toLowerCase().includes(q)
      );
    }

    return sortAnimals(items, sortKey);
  }, [activeAnimals, typeFilter, statusFilter, searchQuery, sortKey]);

  // --- Alerts ---
  const alerts = useMemo(() => {
    const now = new Date('2026-03-16');
    const in30Days = new Date('2026-04-15');
    const alertList: {
      urgency: 'high' | 'medium' | 'low';
      icon: React.ReactNode;
      message: string;
      animalName: string;
      animalTag: string;
      actionLabel: string;
      urgencyColor: string;
      sortOrder: number;
    }[] = [];

    // Overdue vaccinations
    vetRecords.forEach((v) => {
      if (!v.nextDueDate) return;
      const due = new Date(v.nextDueDate);
      if (due < now) {
        alertList.push({
          urgency: 'high',
          icon: <AlertCircle className="w-5 h-5 text-red-600" />,
          message: `Overdue: ${v.description} (was due ${formatShortDate(v.nextDueDate)})`,
          animalName: v.animalName,
          animalTag: animals.find((a) => a.id === v.animalId)?.tag ?? '',
          actionLabel: 'Schedule Now',
          urgencyColor: 'bg-red-100',
          sortOrder: 0,
        });
      }
    });

    // Upcoming vaccinations (next 30 days)
    vetRecords.forEach((v) => {
      if (!v.nextDueDate) return;
      const due = new Date(v.nextDueDate);
      if (due >= now && due <= in30Days) {
        alertList.push({
          urgency: 'medium',
          icon: <Clock className="w-5 h-5 text-amber-600" />,
          message: `Upcoming: ${v.description} (due ${formatShortDate(v.nextDueDate)})`,
          animalName: v.animalName,
          animalTag: animals.find((a) => a.id === v.animalId)?.tag ?? '',
          actionLabel: 'Schedule',
          urgencyColor: 'bg-amber-100',
          sortOrder: 1,
        });
      }
    });

    // Pregnant animals approaching due date
    breedingRecords
      .filter((b) => b.status === 'confirmed-pregnant' && b.expectedDueDate)
      .forEach((b) => {
        const days = daysUntil(b.expectedDueDate!);
        if (days > 0 && days <= 45) {
          alertList.push({
            urgency: days <= 14 ? 'high' : 'medium',
            icon: <Baby className="w-5 h-5 text-purple-600" />,
            message: `${b.damName} expected to deliver in ${days} days (${formatShortDate(b.expectedDueDate!)})`,
            animalName: b.damName,
            animalTag: animals.find((a) => a.id === b.damId)?.tag || '',
            actionLabel: 'View Breeding Record',
            urgencyColor: 'bg-purple-100',
            sortOrder: days <= 14 ? 0 : 1,
          });
        }
      });

    // Animals in quarantine
    activeAnimals
      .filter((a) => a.status === 'quarantine')
      .forEach((a) => {
        alertList.push({
          urgency: 'medium',
          icon: <ShieldAlert className="w-5 h-5 text-amber-600" />,
          message: `${a.name} is in quarantine. Monitor and review status.`,
          animalName: a.name,
          animalTag: a.tag,
          actionLabel: 'Review Status',
          urgencyColor: 'bg-amber-100',
          sortOrder: 1,
        });
      });

    // Sick animals
    activeAnimals
      .filter((a) => a.status === 'sick')
      .forEach((a) => {
        alertList.push({
          urgency: 'high',
          icon: <AlertTriangle className="w-5 h-5 text-red-600" />,
          message: `${a.name} is sick and needs attention.`,
          animalName: a.name,
          animalTag: a.tag,
          actionLabel: 'View Health Record',
          urgencyColor: 'bg-red-100',
          sortOrder: 0,
        });
      });

    return alertList.sort((a, b) => a.sortOrder - b.sortOrder);
  }, [activeAnimals]);

  // --- Tab config ---
  const tabs: { key: TabKey; label: string }[] = [
    { key: 'herd', label: 'My Herd' },
    { key: 'actions', label: 'Quick Actions' },
    { key: 'alerts', label: 'Alerts' },
  ];

  const typeFilters: { key: TypeFilter; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: activeAnimals.length },
    { key: 'cattle', label: 'Cattle', count: summary.byType.cattle },
    { key: 'goat', label: 'Goats', count: summary.byType.goat },
    { key: 'sheep', label: 'Sheep', count: summary.byType.sheep },
    { key: 'poultry', label: 'Poultry', count: summary.byType.poultry },
    { key: 'pig', label: 'Pigs', count: summary.byType.pig },
  ];

  const statusFilters: { key: StatusFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'healthy', label: 'Healthy' },
    { key: 'sick', label: 'Sick' },
    { key: 'pregnant', label: 'Pregnant' },
    { key: 'lactating', label: 'Lactating' },
    { key: 'quarantine', label: 'Quarantine' },
  ];

  // =========================================================================
  // Render
  // =========================================================================

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ─── Header ─────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-br from-[#1B2A4A] via-[#1B2A4A] to-[#8CB89C]/30 text-white"
      >
        <div className="max-w-6xl mx-auto px-4 lg:px-6 py-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <Beef size={28} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
                  My Livestock
                </h1>
                <p className="text-white/70 text-sm mt-1">
                  Manage your herd, health records, and breeding
                </p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2">
              <Link
                href="/farm/livestock/health"
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
              >
                <Heart size={16} />
                Health Records
              </Link>
              <Link
                href="/farm/livestock/breeding"
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
              >
                <Baby size={16} />
                Breeding
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-6xl mx-auto px-4 lg:px-6 py-6">
        {/* ─── Summary Stats ──────────────────────────────────────────── */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6"
        >
          {[
            {
              label: 'Total Animals',
              value: summary.totalAnimals.toString(),
              icon: <Beef size={20} className="text-[#8CB89C]" />,
              accent: 'bg-[#EBF7E5]',
            },
            {
              label: 'Herd Value',
              value: formatCurrency(summary.totalValue),
              icon: <DollarSign size={20} className="text-[#D4A843]" />,
              accent: 'bg-amber-50',
            },
            {
              label: 'Healthy',
              value: `${summary.healthyPercentage}%`,
              icon: (
                <div className="relative">
                  <Activity size={20} className={getHealthColor(summary.healthyPercentage)} />
                </div>
              ),
              accent: summary.healthyPercentage >= 75 ? 'bg-green-50' : summary.healthyPercentage >= 50 ? 'bg-amber-50' : 'bg-red-50',
            },
            {
              label: 'Pregnant',
              value: summary.pregnantCount.toString(),
              icon: <Baby size={20} className="text-purple-500" />,
              accent: 'bg-purple-50',
            },
            {
              label: 'Upcoming Vaccines',
              value: summary.upcomingVaccinations.toString(),
              icon: <Syringe size={20} className="text-blue-500" />,
              accent: 'bg-blue-50',
            },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              variants={cardVariants}
              className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl ${stat.accent} flex items-center justify-center shrink-0`}
                >
                  {stat.icon}
                </div>
                <div className="min-w-0">
                  <div className="text-lg font-bold text-[#1B2A4A] truncate">{stat.value}</div>
                  <div className="text-[11px] text-gray-400 truncate">{stat.label}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ─── Tab Switcher ───────────────────────────────────────────── */}
        <div className="flex items-center gap-1 bg-white rounded-xl p-1 border border-gray-100 shadow-sm mb-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 min-w-[100px] text-sm font-semibold py-2.5 px-4 rounded-lg transition-all whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-[#1B2A4A] text-white shadow-sm'
                  : 'text-gray-500 hover:text-[#1B2A4A] hover:bg-gray-50'
              }`}
            >
              {tab.label}
              {tab.key === 'alerts' && alerts.length > 0 && (
                <span
                  className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full ${
                    activeTab === tab.key
                      ? 'bg-white/20 text-white'
                      : 'bg-red-100 text-red-600'
                  }`}
                >
                  {alerts.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* MY HERD TAB                                                    */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <AnimatePresence mode="wait">
          {activeTab === 'herd' && (
            <motion.div
              key="herd"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Type filter pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-3 scrollbar-hide">
                {typeFilters.map((tf) => {
                  const isActive = typeFilter === tf.key;
                  return (
                    <button
                      key={tf.key}
                      onClick={() => setTypeFilter(tf.key)}
                      className={`flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl whitespace-nowrap transition-all border ${
                        isActive
                          ? 'bg-[#1B2A4A] text-white border-[#1B2A4A] shadow-sm'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-[#8CB89C] hover:text-[#8CB89C]'
                      }`}
                    >
                      {tf.label}
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {tf.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Status filter pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
                {statusFilters.map((sf) => {
                  const isActive = statusFilter === sf.key;
                  return (
                    <button
                      key={sf.key}
                      onClick={() => setStatusFilter(sf.key)}
                      className={`text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap transition-all border ${
                        isActive
                          ? 'bg-[#8CB89C] text-white border-[#8CB89C]'
                          : 'bg-white text-gray-500 border-gray-200 hover:border-[#8CB89C] hover:text-[#8CB89C]'
                      }`}
                    >
                      {sf.label}
                    </button>
                  );
                })}
              </div>

              {/* Search + Sort row */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 relative">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name or tag..."
                    className="w-full h-10 pl-9 pr-4 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8CB89C]/30 focus:border-[#8CB89C] transition"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Sort dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowSortDropdown(!showSortDropdown)}
                    className="flex items-center gap-2 h-10 px-4 rounded-xl border border-gray-200 bg-white text-sm text-gray-600 hover:border-[#8CB89C] transition-colors"
                  >
                    <ArrowUpDown size={14} />
                    <span className="hidden sm:inline">
                      {SORT_OPTIONS.find((s) => s.key === sortKey)?.label}
                    </span>
                    <ChevronDown size={14} />
                  </button>
                  <AnimatePresence>
                    {showSortDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="absolute right-0 top-12 z-20 w-48 bg-white rounded-xl border border-gray-100 shadow-lg overflow-hidden"
                      >
                        {SORT_OPTIONS.map((opt) => (
                          <button
                            key={opt.key}
                            onClick={() => {
                              setSortKey(opt.key);
                              setShowSortDropdown(false);
                            }}
                            className={`w-full text-left text-sm px-4 py-2.5 hover:bg-gray-50 transition-colors ${
                              sortKey === opt.key
                                ? 'text-[#8CB89C] font-semibold bg-[#EBF7E5]/50'
                                : 'text-gray-600'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Results count */}
              <div className="text-xs text-gray-400 mb-4">
                Showing {filteredAnimals.length} of {activeAnimals.length} animals
              </div>

              {/* Animal cards grid */}
              {filteredAnimals.length > 0 ? (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 lg:grid-cols-2 gap-4"
                >
                  {filteredAnimals.map((animal) => (
                    <AnimalCard key={animal.id} animal={animal} />
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-16"
                >
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Search size={28} className="text-gray-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-[#1B2A4A] mb-1">
                    No animals found
                  </h3>
                  <p className="text-xs text-gray-500">
                    Try adjusting your search or filters
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setTypeFilter('all');
                      setStatusFilter('all');
                    }}
                    className="mt-4 text-xs font-semibold text-[#8CB89C] hover:underline"
                  >
                    Clear all filters
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* QUICK ACTIONS TAB                                              */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {activeTab === 'actions' && (
            <motion.div
              key="actions"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mb-4">
                <h2 className="text-sm font-bold text-[#1B2A4A]">Quick Actions</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Common livestock management tasks at your fingertips
                </p>
              </div>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-2 lg:grid-cols-4 gap-3"
              >
                <QuickActionCard
                  icon={<Syringe size={24} />}
                  title="Record Vaccination"
                  description="Log a new vaccination for any animal"
                  bgColor="bg-[#8CB89C]/10"
                  iconColor="text-[#8CB89C]"
                />
                <QuickActionCard
                  icon={<Pill size={24} />}
                  title="Log Treatment"
                  description="Record medicine or treatment given"
                  bgColor="bg-blue-50"
                  iconColor="text-blue-600"
                />
                <QuickActionCard
                  icon={<Plus size={24} />}
                  title="Add Animal"
                  description="Register a new animal to your herd"
                  bgColor="bg-green-50"
                  iconColor="text-green-600"
                  onClick={() => setShowAddForm(true)}
                />
                <QuickActionCard
                  icon={<Baby size={24} />}
                  title="Record Birth"
                  description="Log a new birth event on your farm"
                  bgColor="bg-purple-50"
                  iconColor="text-purple-600"
                />
                <QuickActionCard
                  icon={<Droplets size={24} />}
                  title="Schedule Dipping"
                  description="Plan tick or parasite dipping sessions"
                  bgColor="bg-amber-50"
                  iconColor="text-amber-600"
                />
                <QuickActionCard
                  icon={<DollarSign size={24} />}
                  title="Record Sale"
                  description="Log an animal sale or auction"
                  bgColor="bg-[#D4A843]/10"
                  iconColor="text-[#D4A843]"
                />
                <QuickActionCard
                  icon={<Weight size={24} />}
                  title="Update Weights"
                  description="Record latest weighing for your animals"
                  bgColor="bg-slate-100"
                  iconColor="text-slate-600"
                />
                <QuickActionCard
                  icon={<FileText size={24} />}
                  title="Generate Report"
                  description="Create herd reports and summaries"
                  bgColor="bg-[#1B2A4A]/10"
                  iconColor="text-[#1B2A4A]"
                />
              </motion.div>
            </motion.div>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* ALERTS TAB                                                     */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {activeTab === 'alerts' && (
            <motion.div
              key="alerts"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mb-4">
                <h2 className="text-sm font-bold text-[#1B2A4A]">Alerts & Notifications</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Items that need your attention, sorted by urgency
                </p>
              </div>

              {alerts.length > 0 ? (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-3"
                >
                  {alerts.map((alert, idx) => (
                    <AlertCard
                      key={`alert-${idx}`}
                      urgency={alert.urgency}
                      icon={alert.icon}
                      message={alert.message}
                      animalName={alert.animalName}
                      animalTag={alert.animalTag}
                      actionLabel={alert.actionLabel}
                      urgencyColor={alert.urgencyColor}
                    />
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-16"
                >
                  <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Activity size={28} className="text-green-500" />
                  </div>
                  <h3 className="text-sm font-semibold text-[#1B2A4A] mb-1">
                    All clear!
                  </h3>
                  <p className="text-xs text-gray-500">
                    No outstanding alerts at this time. Your herd is well managed.
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* ADD ANIMAL MODAL                                                */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
            onClick={() => setShowAddForm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 24 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-[#1B2A4A]">Add Animal</h2>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Type */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Animal Type</label>
                <select
                  value={addFormData.type}
                  onChange={(e) => setAddFormData((p) => ({ ...p, type: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#8CB89C]/30 focus:border-[#8CB89C]"
                >
                  <option value="cattle">Cattle</option>
                  <option value="goat">Goat</option>
                  <option value="sheep">Sheep</option>
                  <option value="poultry">Poultry</option>
                  <option value="pig">Pig</option>
                </select>
              </div>

              {/* Breed */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Breed</label>
                <input
                  type="text"
                  value={addFormData.breed}
                  onChange={(e) => setAddFormData((p) => ({ ...p, breed: e.target.value }))}
                  placeholder="e.g. Brahman, Nguni, Boer"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#8CB89C]/30 focus:border-[#8CB89C]"
                />
              </div>

              {/* Count */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Count</label>
                <input
                  type="number"
                  min={1}
                  value={addFormData.count}
                  onChange={(e) => setAddFormData((p) => ({ ...p, count: parseInt(e.target.value) || 1 }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#8CB89C]/30 focus:border-[#8CB89C]"
                />
              </div>

              {/* Health Status */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Health Status</label>
                <select
                  value={addFormData.health_status}
                  onChange={(e) => setAddFormData((p) => ({ ...p, health_status: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#8CB89C]/30 focus:border-[#8CB89C]"
                >
                  <option value="healthy">Healthy</option>
                  <option value="sick">Sick</option>
                  <option value="pregnant">Pregnant</option>
                  <option value="quarantine">Quarantine</option>
                </select>
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Location</label>
                <input
                  type="text"
                  value={addFormData.location}
                  onChange={(e) => setAddFormData((p) => ({ ...p, location: e.target.value }))}
                  placeholder="e.g. Paddock A, North pasture"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#8CB89C]/30 focus:border-[#8CB89C]"
                />
              </div>

              {/* Submit */}
              <button
                onClick={handleAddAnimal}
                disabled={addFormSubmitting}
                className="w-full bg-[#8CB89C] hover:bg-[#729E82] disabled:opacity-60 text-white py-3 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 min-h-[44px]"
              >
                {addFormSubmitting ? 'Adding...' : 'Add Animal'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
