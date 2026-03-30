'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Package,
  ShoppingCart,
  Percent,
  Eye,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Star,
  Plus,
  ClipboardList,
  Megaphone,
  BarChart3,
  MousePointerClick,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/supabase/auth-context';

// ── Inline types ────────────────────────────────────────────────────────────

type SupplierCategory = 'input-supplier' | 'equipment' | 'logistics' | 'processing' | 'technology' | 'financial-services';
type SponsorshipTier = 'platinum' | 'gold' | 'silver' | 'bronze';
type Country = 'Botswana' | 'Kenya' | 'Mozambique' | 'Nigeria' | 'Sierra Leone' | 'South Africa' | 'Tanzania' | 'Uganda' | 'Zambia' | 'Zimbabwe';

interface Supplier {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  country: Country;
  region: string;
  category: SupplierCategory;
  status: 'active' | 'pending' | 'suspended';
  joinDate: string;
  logo: string;
  description: string;
  productsCount: number;
  totalSales: number;
  totalOrders: number;
  rating: number;
  reviewCount: number;
  memberDiscountPercent: number;
  commissionRate: number;
  isFounding: boolean;
  sponsorshipTier: SponsorshipTier | null;
  verified: boolean;
  website: string;
  certifications: string[];
}

interface SupplierProduct {
  id: string;
  supplierId: string;
  supplierName: string;
  name: string;
  description: string;
  category: 'seeds' | 'fertilizer' | 'pesticides' | 'equipment' | 'irrigation' | 'technology' | 'packaging' | 'storage' | 'tools';
  price: number;
  memberPrice: number;
  currency: string;
  unit: string;
  image: string;
  availability: 'in-stock' | 'limited' | 'pre-order' | 'out-of-stock';
  rating: number;
  reviewCount: number;
  soldCount: number;
  tags: string[];
  featured: boolean;
  minOrder: number;
}

interface Commission {
  id: string;
  supplierId: string;
  supplierName: string;
  orderId: string;
  productName: string;
  buyerName: string;
  buyerType: 'smallholder' | 'commercial' | 'enterprise' | 'cooperative';
  orderAmount: number;
  commissionRate: number;
  commissionAmount: number;
  status: 'pending' | 'approved' | 'paid' | 'disputed';
  orderDate: string;
  paymentDate: string | null;
}

interface Advertisement {
  id: string;
  supplierId: string;
  supplierName: string;
  type: 'banner' | 'featured-product' | 'sponsored-content' | 'sidebar';
  placement: 'dashboard' | 'marketplace' | 'farm-portal' | 'training';
  title: string;
  description: string;
  image: string;
  targetUrl: string;
  startDate: string;
  endDate: string;
  impressions: number;
  clicks: number;
  ctr: number;
  budget: number;
  spent: number;
  status: 'active' | 'paused' | 'completed' | 'pending-review';
}

// ── Inline fallback data ────────────────────────────────────────────────────

const staticSuppliers: Supplier[] = [
  {
    id: 'SUP-001',
    companyName: 'Zambezi Agri-Supplies',
    contactName: 'Farai Ndlovu',
    email: 'farai@zambezi-agri.co.zw',
    phone: '+263 77 200 1001',
    country: 'Zimbabwe',
    region: 'Harare',
    category: 'input-supplier',
    status: 'active',
    joinDate: '2024-06-15',
    logo: 'https://images.unsplash.com/photo-1560693225-b8507d6f3aa9?w=400&h=300&fit=crop',
    description: 'Leading agricultural input supplier across Southern Africa. Specializing in certified seeds, fertilizers, and crop protection products for commercial and smallholder farmers.',
    productsCount: 38,
    totalSales: 1847320,
    totalOrders: 4215,
    rating: 4.8,
    reviewCount: 312,
    memberDiscountPercent: 12,
    commissionRate: 8,
    isFounding: true,
    sponsorshipTier: 'platinum',
    verified: true,
    website: 'https://zambezi-agri.co.zw',
    certifications: ['ISO 9001', 'GlobalGAP Approved', 'SADC Trade Certified'],
  },
];

const supplierProducts: SupplierProduct[] = [
  { id: 'SPROD-005', supplierId: 'SUP-001', supplierName: 'Zambezi Agri-Supplies', name: 'Groundnut Seed (Nyanda)', description: 'Virginia-type groundnut variety with large kernels.', category: 'seeds', price: 78, memberPrice: 68.64, currency: 'USD', unit: 'per 25kg bag', image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400&h=300&fit=crop', availability: 'in-stock', rating: 4.8, reviewCount: 98, soldCount: 1678, tags: ['groundnut', 'disease-resistant', 'export-quality', 'virginia-type'], featured: true, minOrder: 1 },
  { id: 'SPROD-014', supplierId: 'SUP-001', supplierName: 'Zambezi Agri-Supplies', name: 'Metalaxyl + Mancozeb Fungicide', description: 'Systemic and contact fungicide combination.', category: 'pesticides', price: 35, memberPrice: 30.80, currency: 'USD', unit: 'per kg', image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=300&fit=crop', availability: 'in-stock', rating: 4.5, reviewCount: 76, soldCount: 1345, tags: ['fungicide', 'systemic', 'blight', 'downy-mildew'], featured: false, minOrder: 2 },
  { id: 'SPROD-035', supplierId: 'SUP-001', supplierName: 'Zambezi Agri-Supplies', name: 'Knapsack Sprayer (16L Manual)', description: 'High-pressure manual knapsack sprayer with 16L tank.', category: 'tools', price: 35, memberPrice: 30.80, currency: 'USD', unit: 'per unit', image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop', availability: 'in-stock', rating: 4.3, reviewCount: 123, soldCount: 3456, tags: ['sprayer', 'knapsack', 'manual', 'crop-protection'], featured: false, minOrder: 1 },
  { id: 'SPROD-036', supplierId: 'SUP-001', supplierName: 'Zambezi Agri-Supplies', name: 'Soil pH Test Kit (50 tests)', description: 'Portable soil pH testing kit with colour chart.', category: 'tools', price: 28, memberPrice: 24.64, currency: 'USD', unit: 'per kit', image: 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=400&h=300&fit=crop', availability: 'in-stock', rating: 4.4, reviewCount: 56, soldCount: 789, tags: ['soil-testing', 'pH', 'portable', 'quick-results'], featured: false, minOrder: 1 },
  { id: 'SPROD-038', supplierId: 'SUP-001', supplierName: 'Zambezi Agri-Supplies', name: 'Pruning Shears (Bypass, Professional)', description: 'Professional bypass pruning shears with SK5 steel blades.', category: 'tools', price: 12, memberPrice: 10.56, currency: 'USD', unit: 'per unit', image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop', availability: 'in-stock', rating: 4.5, reviewCount: 67, soldCount: 1234, tags: ['pruning', 'shears', 'professional', 'orchard'], featured: false, minOrder: 2 },
];

const commissions: Commission[] = [
  { id: 'COM-001', supplierId: 'SUP-001', supplierName: 'Zambezi Agri-Supplies', orderId: 'ORD-2025-0412', productName: 'Groundnut Seed (Nyanda) x 50 bags', buyerName: 'Kgosi Mosweu', buyerType: 'smallholder', orderAmount: 3900, commissionRate: 8, commissionAmount: 312, status: 'paid', orderDate: '2025-09-15', paymentDate: '2025-10-15' },
  { id: 'COM-002', supplierId: 'SUP-002', supplierName: 'Kalahari Seeds Co.', orderId: 'ORD-2025-0489', productName: 'Hybrid Maize Seed (PAN 4M-21) x 20 bags', buyerName: 'Tendai Moyo', buyerType: 'smallholder', orderAmount: 960, commissionRate: 7, commissionAmount: 67.20, status: 'paid', orderDate: '2025-10-02', paymentDate: '2025-11-02' },
  { id: 'COM-003', supplierId: 'SUP-009', supplierName: 'Chobe Irrigation Systems', orderId: 'ORD-2025-0523', productName: 'Drip Irrigation Kit (1 Hectare) x 3', buyerName: 'Mosweu Cooperative', buyerType: 'cooperative', orderAmount: 5550, commissionRate: 11, commissionAmount: 610.50, status: 'paid', orderDate: '2025-10-18', paymentDate: '2025-11-18' },
  { id: 'COM-004', supplierId: 'SUP-004', supplierName: 'Matopos Equipment Hire', orderId: 'ORD-2025-0567', productName: 'Walk-Behind Tractor (15HP Diesel)', buyerName: 'Chiedza Mutasa', buyerType: 'commercial', orderAmount: 3800, commissionRate: 12, commissionAmount: 456, status: 'paid', orderDate: '2025-11-05', paymentDate: '2025-12-05' },
  { id: 'COM-005', supplierId: 'SUP-006', supplierName: 'Okavango Fertilizers', orderId: 'ORD-2025-0612', productName: 'NPK 15-15-15 x 100 bags', buyerName: 'Tshiamo Rapula', buyerType: 'commercial', orderAmount: 4500, commissionRate: 8, commissionAmount: 360, status: 'paid', orderDate: '2025-11-12', paymentDate: '2025-12-12' },
  { id: 'COM-006', supplierId: 'SUP-003', supplierName: 'TechFarm Solutions', orderId: 'ORD-2025-0645', productName: 'IoT Soil Moisture Sensor Kit x 5', buyerName: 'Baraka Mfaume', buyerType: 'enterprise', orderAmount: 1900, commissionRate: 10, commissionAmount: 190, status: 'paid', orderDate: '2025-11-20', paymentDate: '2025-12-20' },
  { id: 'COM-007', supplierId: 'SUP-010', supplierName: 'Kilimanjaro Organic Inputs', orderId: 'ORD-2025-0678', productName: 'Organic Compost Blend x 200 bags', buyerName: 'Upendo Farmers Group', buyerType: 'cooperative', orderAmount: 3600, commissionRate: 9, commissionAmount: 324, status: 'paid', orderDate: '2025-12-01', paymentDate: '2026-01-01' },
  { id: 'COM-008', supplierId: 'SUP-001', supplierName: 'Zambezi Agri-Supplies', orderId: 'ORD-2025-0712', productName: 'Knapsack Sprayer x 30 units', buyerName: 'Mashonaland Growers Association', buyerType: 'cooperative', orderAmount: 1050, commissionRate: 8, commissionAmount: 84, status: 'paid', orderDate: '2025-12-10', paymentDate: '2026-01-10' },
  { id: 'COM-009', supplierId: 'SUP-013', supplierName: 'Tswana Agri-Chem', orderId: 'ORD-2025-0734', productName: 'Lambda-Cyhalothrin 5EC x 50L', buyerName: 'Lesego Keabetswe', buyerType: 'commercial', orderAmount: 1200, commissionRate: 7, commissionAmount: 84, status: 'paid', orderDate: '2025-12-15', paymentDate: '2026-01-15' },
  { id: 'COM-010', supplierId: 'SUP-017', supplierName: 'Chimanimani Grain Storage', orderId: 'ORD-2025-0756', productName: 'Hermetic Grain Storage Bag x 100 packs', buyerName: 'Chipinge Farmers Union', buyerType: 'cooperative', orderAmount: 3500, commissionRate: 9, commissionAmount: 315, status: 'approved', orderDate: '2025-12-22', paymentDate: null },
  { id: 'COM-011', supplierId: 'SUP-011', supplierName: 'Hwange Solar & Pumps', orderId: 'ORD-2026-0012', productName: 'Solar Panel Kit (300W Off-Grid) x 2', buyerName: 'Nyasha Chimbidzikai', buyerType: 'smallholder', orderAmount: 1040, commissionRate: 13, commissionAmount: 135.20, status: 'approved', orderDate: '2026-01-05', paymentDate: null },
  { id: 'COM-012', supplierId: 'SUP-002', supplierName: 'Kalahari Seeds Co.', orderId: 'ORD-2026-0034', productName: 'Drought-Resistant Sorghum (Macia) x 40 bags', buyerName: 'Naledi Sekgoma', buyerType: 'smallholder', orderAmount: 2600, commissionRate: 7, commissionAmount: 182, status: 'approved', orderDate: '2026-01-12', paymentDate: null },
  { id: 'COM-013', supplierId: 'SUP-005', supplierName: 'Safari Logistics Ltd', orderId: 'ORD-2026-0056', productName: 'Cold Chain Transport - Arusha to Dar', buyerName: 'Kilimanjaro Fresh Exports', buyerType: 'enterprise', orderAmount: 2800, commissionRate: 6, commissionAmount: 168, status: 'approved', orderDate: '2026-01-18', paymentDate: null },
  { id: 'COM-014', supplierId: 'SUP-016', supplierName: 'Makgadikgadi Drones', orderId: 'ORD-2026-0078', productName: 'NDVI Crop Mapping Service x 10 flights', buyerName: 'Gaborone Agri-Enterprise', buyerType: 'enterprise', orderAmount: 850, commissionRate: 15, commissionAmount: 127.50, status: 'approved', orderDate: '2026-01-25', paymentDate: null },
  { id: 'COM-015', supplierId: 'SUP-009', supplierName: 'Chobe Irrigation Systems', orderId: 'ORD-2026-0092', productName: 'Solar Water Pump (2HP Submersible)', buyerName: 'Thabo Molefe', buyerType: 'commercial', orderAmount: 2200, commissionRate: 11, commissionAmount: 242, status: 'pending', orderDate: '2026-02-03', paymentDate: null },
  { id: 'COM-016', supplierId: 'SUP-006', supplierName: 'Okavango Fertilizers', orderId: 'ORD-2026-0108', productName: 'Urea (46-0-0) x 80 bags + SSP x 40 bags', buyerName: 'Central District Cooperative', buyerType: 'cooperative', orderAmount: 4160, commissionRate: 8, commissionAmount: 332.80, status: 'pending', orderDate: '2026-02-08', paymentDate: null },
  { id: 'COM-017', supplierId: 'SUP-020', supplierName: 'Victoria Falls Seed Bank', orderId: 'ORD-2026-0124', productName: 'Cowpea Seeds (IT18) x 100 packs', buyerName: 'Rudo Chidyamakono', buyerType: 'commercial', orderAmount: 2200, commissionRate: 7, commissionAmount: 154, status: 'pending', orderDate: '2026-02-14', paymentDate: null },
  { id: 'COM-018', supplierId: 'SUP-004', supplierName: 'Matopos Equipment Hire', orderId: 'ORD-2026-0139', productName: 'Boom Sprayer (Tractor-Mounted 600L)', buyerName: 'Mugabe Farms', buyerType: 'enterprise', orderAmount: 2400, commissionRate: 12, commissionAmount: 288, status: 'pending', orderDate: '2026-02-19', paymentDate: null },
  { id: 'COM-019', supplierId: 'SUP-012', supplierName: 'Ngorongoro Packaging', orderId: 'ORD-2026-0156', productName: 'Export-Grade Produce Cartons x 20 packs', buyerName: 'Moshi Berry Growers', buyerType: 'cooperative', orderAmount: 1500, commissionRate: 8, commissionAmount: 120, status: 'pending', orderDate: '2026-02-25', paymentDate: null },
  { id: 'COM-020', supplierId: 'SUP-001', supplierName: 'Zambezi Agri-Supplies', orderId: 'ORD-2026-0171', productName: 'Metalaxyl + Mancozeb Fungicide x 25kg', buyerName: 'Tatenda Chikaura', buyerType: 'smallholder', orderAmount: 875, commissionRate: 8, commissionAmount: 70, status: 'pending', orderDate: '2026-03-01', paymentDate: null },
  { id: 'COM-021', supplierId: 'SUP-003', supplierName: 'TechFarm Solutions', orderId: 'ORD-2026-0185', productName: 'Precision Weather Station x 3', buyerName: 'Dodoma Agricultural Research', buyerType: 'enterprise', orderAmount: 1260, commissionRate: 10, commissionAmount: 126, status: 'pending', orderDate: '2026-03-03', paymentDate: null },
  { id: 'COM-022', supplierId: 'SUP-008', supplierName: 'Limpopo Agri-Finance', orderId: 'ORD-2026-0198', productName: 'Crop Insurance Premium - Seasonal Plan', buyerName: 'Sipho Dlamini', buyerType: 'smallholder', orderAmount: 320, commissionRate: 5, commissionAmount: 16, status: 'pending', orderDate: '2026-03-05', paymentDate: null },
  { id: 'COM-023', supplierId: 'SUP-015', supplierName: 'Bagamoyo Marine Harvest', orderId: 'ORD-2026-0212', productName: 'Seaweed Bio-Stimulant x 20 containers', buyerName: 'Tanga Horticulture Group', buyerType: 'cooperative', orderAmount: 640, commissionRate: 10, commissionAmount: 64, status: 'pending', orderDate: '2026-03-07', paymentDate: null },
  { id: 'COM-024', supplierId: 'SUP-018', supplierName: 'Morogoro Farm Implements', orderId: 'ORD-2026-0228', productName: 'Ox-Drawn Plough x 15 + Hoe Set x 50', buyerName: 'Iringa Smallholders Network', buyerType: 'cooperative', orderAmount: 2550, commissionRate: 11, commissionAmount: 280.50, status: 'pending', orderDate: '2026-03-08', paymentDate: null },
  { id: 'COM-025', supplierId: 'SUP-009', supplierName: 'Chobe Irrigation Systems', orderId: 'ORD-2026-0243', productName: 'Water Storage Tank (10,000L) x 4', buyerName: 'Boteti Farmers Trust', buyerType: 'cooperative', orderAmount: 2320, commissionRate: 11, commissionAmount: 255.20, status: 'pending', orderDate: '2026-03-10', paymentDate: null },
  { id: 'COM-026', supplierId: 'SUP-019', supplierName: 'Mmegi Digital Agriculture', orderId: 'ORD-2026-0258', productName: 'FarmTrack Pro License x 50', buyerName: 'AFU Botswana Chapter', buyerType: 'cooperative', orderAmount: 6000, commissionRate: 14, commissionAmount: 840, status: 'pending', orderDate: '2026-03-11', paymentDate: null },
  { id: 'COM-027', supplierId: 'SUP-014', supplierName: 'Great Zimbabwe Transport', orderId: 'ORD-2026-0271', productName: 'Grain Haulage - Harare to Beira (40 tonnes)', buyerName: 'Zimbabwe Grain Traders', buyerType: 'enterprise', orderAmount: 4800, commissionRate: 6, commissionAmount: 288, status: 'disputed', orderDate: '2026-02-20', paymentDate: null },
  { id: 'COM-028', supplierId: 'SUP-021', supplierName: 'Zanzibar Spice Exports', orderId: 'ORD-2026-0284', productName: 'Spice Processing Service - Cloves 5 tonnes', buyerName: 'Pemba Clove Growers', buyerType: 'cooperative', orderAmount: 3200, commissionRate: 8, commissionAmount: 256, status: 'disputed', orderDate: '2026-02-28', paymentDate: null },
  { id: 'COM-029', supplierId: 'SUP-016', supplierName: 'Makgadikgadi Drones', orderId: 'ORD-2026-0297', productName: 'DJI Agras T30 Spray Drone', buyerName: 'Maun Agri-Services', buyerType: 'enterprise', orderAmount: 14500, commissionRate: 15, commissionAmount: 2175, status: 'pending', orderDate: '2026-03-12', paymentDate: null },
  { id: 'COM-030', supplierId: 'SUP-022', supplierName: 'Tuli Block Livestock Feeds', orderId: 'ORD-2026-0310', productName: 'Cattle Feed Concentrate x 200 bags', buyerName: 'Tuli Ranchers Assoc.', buyerType: 'cooperative', orderAmount: 5600, commissionRate: 8, commissionAmount: 448, status: 'pending', orderDate: '2026-03-14', paymentDate: null },
];

const advertisements: Advertisement[] = [
  { id: 'AD-001', supplierId: 'SUP-001', supplierName: 'Zambezi Agri-Supplies', type: 'banner', placement: 'dashboard', title: 'Season Opening Sale - 20% Off All Seeds', description: 'Start your planting season right with premium certified seeds from Zambezi Agri-Supplies.', image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=300&fit=crop', targetUrl: 'https://afu-portal.com/marketplace/supplier/SUP-001', startDate: '2026-02-15', endDate: '2026-04-15', impressions: 34500, clicks: 1725, ctr: 5.0, budget: 3500, spent: 2450, status: 'active' },
  { id: 'AD-002', supplierId: 'SUP-002', supplierName: 'Kalahari Seeds Co.', type: 'featured-product', placement: 'marketplace', title: 'New: Drought-Resistant Sorghum Macia Variety', description: 'Introducing the Macia sorghum variety - bred for Botswana conditions.', image: 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=400&h=300&fit=crop', targetUrl: 'https://afu-portal.com/marketplace/product/SPROD-001', startDate: '2026-01-10', endDate: '2026-03-31', impressions: 28900, clicks: 1878, ctr: 6.5, budget: 2500, spent: 2125, status: 'active' },
  { id: 'AD-003', supplierId: 'SUP-003', supplierName: 'TechFarm Solutions', type: 'sponsored-content', placement: 'training', title: 'Smart Farming: How IoT Sensors Boost Yields by 30%', description: 'Learn how TechFarm IoT sensors are helping African farmers monitor soil conditions in real-time.', image: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=400&h=300&fit=crop', targetUrl: 'https://afu-portal.com/training/webinar/smart-farming-iot', startDate: '2026-02-01', endDate: '2026-05-01', impressions: 12400, clicks: 868, ctr: 7.0, budget: 1800, spent: 1080, status: 'active' },
  { id: 'AD-004', supplierId: 'SUP-009', supplierName: 'Chobe Irrigation Systems', type: 'banner', placement: 'farm-portal', title: 'Save Water, Grow More - Drip Irrigation Special', description: 'Complete 1-hectare drip irrigation kits now available at 10% member discount.', image: 'https://images.unsplash.com/photo-1622383563227-04401ab4e5ea?w=400&h=300&fit=crop', targetUrl: 'https://afu-portal.com/marketplace/product/SPROD-020', startDate: '2026-01-20', endDate: '2026-04-20', impressions: 19800, clicks: 1188, ctr: 6.0, budget: 2800, spent: 1960, status: 'active' },
  { id: 'AD-005', supplierId: 'SUP-004', supplierName: 'Matopos Equipment Hire', type: 'sidebar', placement: 'marketplace', title: 'Hire-to-Own: Walk-Behind Tractors', description: 'Get mechanized without the upfront cost.', image: 'https://images.unsplash.com/photo-1530267981375-f0de937f5f13?w=400&h=300&fit=crop', targetUrl: 'https://afu-portal.com/marketplace/product/SPROD-015', startDate: '2025-11-01', endDate: '2026-04-30', impressions: 42300, clicks: 2538, ctr: 6.0, budget: 5000, spent: 4250, status: 'active' },
  { id: 'AD-006', supplierId: 'SUP-016', supplierName: 'Makgadikgadi Drones', type: 'featured-product', placement: 'farm-portal', title: 'Drone Crop Spraying - Book Your Season Flights', description: 'Professional drone spraying services available across Botswana.', image: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=400&h=300&fit=crop', targetUrl: 'https://afu-portal.com/marketplace/product/SPROD-028', startDate: '2026-02-10', endDate: '2026-05-10', impressions: 8700, clicks: 609, ctr: 7.0, budget: 1500, spent: 750, status: 'active' },
  { id: 'AD-007', supplierId: 'SUP-008', supplierName: 'Limpopo Agri-Finance', type: 'banner', placement: 'dashboard', title: 'Crop Insurance from BWP 50/month - Protect Your Harvest', description: 'Weather-index crop insurance now available for AFU members.', image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop', targetUrl: 'https://afu-portal.com/financial-services/insurance', startDate: '2025-12-01', endDate: '2026-03-31', impressions: 48200, clicks: 2892, ctr: 6.0, budget: 4500, spent: 4275, status: 'active' },
  { id: 'AD-008', supplierId: 'SUP-010', supplierName: 'Kilimanjaro Organic Inputs', type: 'sponsored-content', placement: 'training', title: 'Organic Farming Masterclass: Soil Health Fundamentals', description: 'Join our 4-week online course on organic soil management.', image: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=400&h=300&fit=crop', targetUrl: 'https://afu-portal.com/training/organic-masterclass', startDate: '2026-01-15', endDate: '2026-03-15', impressions: 6800, clicks: 544, ctr: 8.0, budget: 800, spent: 800, status: 'completed' },
  { id: 'AD-009', supplierId: 'SUP-006', supplierName: 'Okavango Fertilizers', type: 'sidebar', placement: 'dashboard', title: 'Bulk Fertilizer Orders - Free Delivery Over $200', description: 'Order NPK, Urea, or SSP in bulk and get free delivery.', image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop', targetUrl: 'https://afu-portal.com/marketplace/supplier/SUP-006', startDate: '2026-02-01', endDate: '2026-04-01', impressions: 22100, clicks: 1105, ctr: 5.0, budget: 1200, spent: 840, status: 'active' },
  { id: 'AD-010', supplierId: 'SUP-011', supplierName: 'Hwange Solar & Pumps', type: 'featured-product', placement: 'marketplace', title: 'Solar-Powered Farm: Complete Off-Grid Kits', description: 'Power your entire farm operation with solar energy.', image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=300&fit=crop', targetUrl: 'https://afu-portal.com/marketplace/product/SPROD-040', startDate: '2025-10-15', endDate: '2026-01-15', impressions: 31200, clicks: 1872, ctr: 6.0, budget: 2200, spent: 2200, status: 'completed' },
  { id: 'AD-011', supplierId: 'SUP-017', supplierName: 'Chimanimani Grain Storage', type: 'sidebar', placement: 'farm-portal', title: 'Reduce Post-Harvest Loss by 90%', description: 'Hermetic grain bags and metal silos keeping your harvest safe.', image: 'https://images.unsplash.com/photo-1504370805625-d32c54b16100?w=400&h=300&fit=crop', targetUrl: 'https://afu-portal.com/marketplace/product/SPROD-032', startDate: '2026-03-01', endDate: '2026-06-01', impressions: 5400, clicks: 378, ctr: 7.0, budget: 900, spent: 270, status: 'active' },
  { id: 'AD-012', supplierId: 'SUP-005', supplierName: 'Safari Logistics Ltd', type: 'banner', placement: 'marketplace', title: 'Reliable Farm-to-Market Transport', description: 'Refrigerated and dry cargo transport across Tanzania.', image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=300&fit=crop', targetUrl: 'https://afu-portal.com/logistics/safari-logistics', startDate: '2025-09-01', endDate: '2025-12-31', impressions: 38700, clicks: 1548, ctr: 4.0, budget: 3000, spent: 3000, status: 'completed' },
  { id: 'AD-013', supplierId: 'SUP-019', supplierName: 'Mmegi Digital Agriculture', type: 'sponsored-content', placement: 'dashboard', title: 'FarmTrack Pro: Digital Record Keeping for Modern Farmers', description: 'Stop using paper notebooks. FarmTrack Pro helps you track every input.', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop', targetUrl: 'https://afu-portal.com/marketplace/product/SPROD-027', startDate: '2026-03-01', endDate: '2026-06-30', impressions: 3200, clicks: 256, ctr: 8.0, budget: 1000, spent: 200, status: 'active' },
  { id: 'AD-014', supplierId: 'SUP-021', supplierName: 'Zanzibar Spice Exports', type: 'featured-product', placement: 'training', title: 'Spice Value Addition: From Farm to Export Market', description: 'Learn how to process, grade, and package spices for international markets.', image: 'https://images.unsplash.com/photo-1590682680695-43b964a3ae17?w=400&h=300&fit=crop', targetUrl: 'https://afu-portal.com/marketplace/supplier/SUP-021', startDate: '2026-01-01', endDate: '2026-02-28', impressions: 4500, clicks: 315, ctr: 7.0, budget: 600, spent: 600, status: 'completed' },
  { id: 'AD-015', supplierId: 'SUP-022', supplierName: 'Tuli Block Livestock Feeds', type: 'sidebar', placement: 'farm-portal', title: 'Quality Livestock Feeds - Delivered to Your Farm', description: 'Premium cattle feeds, poultry layers mash, and mineral supplements.', image: 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=400&h=300&fit=crop', targetUrl: 'https://afu-portal.com/marketplace/supplier/SUP-022', startDate: '2026-03-10', endDate: '2026-06-10', impressions: 1200, clicks: 72, ctr: 6.0, budget: 500, spent: 100, status: 'pending-review' },
];

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

// ── Static fallback context ──────────────────────────────────────────────────

const FALLBACK_SUPPLIER = staticSuppliers.find((s) => s.id === 'SUP-001')!;
const FALLBACK_PRODUCTS = supplierProducts.filter((p) => p.supplierId === 'SUP-001');
const FALLBACK_COMMISSIONS = commissions.filter((c) => c.supplierId === 'SUP-001');
const FALLBACK_ADS = advertisements.filter((a) => a.supplierId === 'SUP-001');

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toLocaleString()}`;
}

function formatCompact(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return value.toLocaleString();
}

// ── Fallback KPI calculations ───────────────────────────────────────────────

const FALLBACK_TOTAL_REVENUE = FALLBACK_SUPPLIER.totalSales;
const FALLBACK_ACTIVE_PRODUCTS = FALLBACK_PRODUCTS.length;
const FALLBACK_PENDING_ORDERS = 8;
const FALLBACK_COMMISSION_BALANCE = FALLBACK_COMMISSIONS
  .filter((c) => c.status === 'pending')
  .reduce((sum, c) => sum + c.commissionAmount, 0);
const FALLBACK_AD_IMPRESSIONS = FALLBACK_ADS.reduce((sum, a) => sum + a.impressions, 0);
const FALLBACK_MEMBER_REACH = 1240;

// ── Order status colors ─────────────────────────────────────────────────────

const orderStatusColors: Record<string, string> = {
  delivered: 'bg-green-100 text-green-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-amber-100 text-amber-700',
  new: 'bg-gray-100 text-gray-600',
};

// ── Mock recent orders ──────────────────────────────────────────────────────

const recentOrders = [
  { id: 'ORD-2026-0301', product: 'Groundnut Seed (Nyanda)', buyer: 'Kgosi Mosweu', amount: 3900, status: 'delivered', date: '2026-03-14' },
  { id: 'ORD-2026-0298', product: 'Knapsack Sprayer x12', buyer: 'Mashonaland Growers', amount: 420, status: 'shipped', date: '2026-03-13' },
  { id: 'ORD-2026-0285', product: 'Metalaxyl + Mancozeb x10', buyer: 'Tatenda Chikaura', amount: 350, status: 'processing', date: '2026-03-12' },
  { id: 'ORD-2026-0271', product: 'Soil pH Test Kit x25', buyer: 'Chipinge Farmers Union', amount: 700, status: 'delivered', date: '2026-03-11' },
  { id: 'ORD-2026-0263', product: 'Pruning Shears x50', buyer: 'Mutare Orchards Co-op', amount: 600, status: 'delivered', date: '2026-03-10' },
  { id: 'ORD-2026-0254', product: 'Groundnut Seed (Nyanda)', buyer: 'Central District Co-op', amount: 5460, status: 'shipped', date: '2026-03-09' },
  { id: 'ORD-2026-0241', product: 'Knapsack Sprayer x8', buyer: 'Rudo Chidyamakono', amount: 280, status: 'new', date: '2026-03-08' },
  { id: 'ORD-2026-0233', product: 'Metalaxyl + Mancozeb x5', buyer: 'Sipho Dlamini', amount: 175, status: 'processing', date: '2026-03-07' },
];

// ── Mock top products ───────────────────────────────────────────────────────

const topProducts = [
  { name: 'Groundnut Seed (Nyanda)', unitsSold: 1678, revenue: 115_000, rating: 4.8, trend: 'up' as const },
  { name: 'Knapsack Sprayer (16L)', unitsSold: 3456, revenue: 106_680, rating: 4.3, trend: 'up' as const },
  { name: 'Metalaxyl + Mancozeb', unitsSold: 1345, revenue: 47_075, rating: 4.5, trend: 'up' as const },
  { name: 'Soil pH Test Kit (50)', unitsSold: 789, revenue: 22_092, rating: 4.4, trend: 'down' as const },
  { name: 'Pruning Shears (Pro)', unitsSold: 1234, revenue: 14_808, rating: 4.5, trend: 'up' as const },
];

// ── Monthly sales trend data ────────────────────────────────────────────────

const salesTrendData = [
  { month: 'Apr', sales: 98000 },
  { month: 'May', sales: 112000 },
  { month: 'Jun', sales: 134000 },
  { month: 'Jul', sales: 128000 },
  { month: 'Aug', sales: 156000 },
  { month: 'Sep', sales: 178000 },
  { month: 'Oct', sales: 165000 },
  { month: 'Nov', sales: 192000 },
  { month: 'Dec', sales: 148000 },
  { month: 'Jan', sales: 174000 },
  { month: 'Feb', sales: 188000 },
  { month: 'Mar', sales: 210000 },
];

// ── Commission donut data ───────────────────────────────────────────────────

const FALLBACK_COMMISSION_PAID = FALLBACK_COMMISSIONS
  .filter((c) => c.status === 'paid')
  .reduce((sum, c) => sum + c.commissionAmount, 0);
const FALLBACK_COMMISSION_APPROVED = FALLBACK_COMMISSIONS
  .filter((c) => c.status === 'approved')
  .reduce((sum, c) => sum + c.commissionAmount, 0);
const FALLBACK_COMMISSION_PENDING = FALLBACK_COMMISSIONS
  .filter((c) => c.status === 'pending')
  .reduce((sum, c) => sum + c.commissionAmount, 0);

const FALLBACK_COMMISSION_DONUT = [
  { name: 'Paid', value: FALLBACK_COMMISSION_PAID, color: '#8CB89C' },
  { name: 'Approved', value: FALLBACK_COMMISSION_APPROVED, color: '#D4A843' },
  { name: 'Pending', value: FALLBACK_COMMISSION_PENDING, color: '#1B2A4A' },
];

const FALLBACK_COMMISSION_TOTAL = FALLBACK_COMMISSION_PAID + FALLBACK_COMMISSION_APPROVED + FALLBACK_COMMISSION_PENDING;

// ── Active ads (top 3) ──────────────────────────────────────────────────────

const FALLBACK_ACTIVE_ADS = advertisements
  .filter((a) => a.status === 'active')
  .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
  .slice(0, 3);

// ── Ad type badge colors ────────────────────────────────────────────────────

const adTypeBadge: Record<string, string> = {
  banner: 'bg-blue-100 text-blue-700',
  'featured-product': 'bg-purple-100 text-purple-700',
  'sponsored-content': 'bg-amber-100 text-amber-700',
  sidebar: 'bg-gray-100 text-gray-600',
};

const adTypeLabels: Record<string, string> = {
  banner: 'Banner',
  'featured-product': 'Featured',
  'sponsored-content': 'Sponsored',
  sidebar: 'Sidebar',
};

// ── Recharts custom tooltip ─────────────────────────────────────────────────

interface TooltipPayloadEntry {
  name: string;
  value: number;
  color: string;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
}) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-100 px-3 py-2 text-xs">
      <p className="font-semibold text-navy mb-1">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-gray-600">{entry.name}:</span>
          <span className="font-medium text-navy">
            {typeof entry.value === 'number' ? formatCurrency(entry.value) : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function SupplierDashboard() {
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null);

  // ── Live data from Supabase ─────────────────────────────────────────────
  const { user, profile } = useAuth();
  const supabase = createClient();

  // Live supplier profile for the logged-in user
  const [liveSupplier, setLiveSupplier] = useState<Supplier | null>(null);
  // Live dashboard stats
  const [liveStats, setLiveStats] = useState<{
    totalRevenue: number;
    activeProducts: number;
    pendingOrders: number;
    totalOrders: number;
  } | null>(null);
  // Live recent orders
  const [liveRecentOrders, setLiveRecentOrders] = useState<typeof recentOrders | null>(null);
  const [dbLoading, setDbLoading] = useState(true);

  const fetchLiveDashboard = useCallback(async () => {
    if (!user) { setDbLoading(false); return; }

    try {
      // 1. Fetch supplier profile linked to current user
      const { data: supplierRow } = await supabase
        .from('suppliers')
        .select('*')
        .eq('profile_id', user.id)
        .single();

      if (!supplierRow) { setDbLoading(false); return; }

      const supplierId = supplierRow.id;

      // Map DB row to local Supplier shape
      setLiveSupplier({
        id: supplierRow.id,
        companyName: supplierRow.company_name,
        contactName: supplierRow.contact_name,
        email: supplierRow.email,
        phone: supplierRow.phone || '',
        country: supplierRow.country as Country,
        region: supplierRow.region || '',
        category: supplierRow.category as SupplierCategory,
        status: supplierRow.status,
        joinDate: supplierRow.join_date || supplierRow.created_at,
        logo: supplierRow.logo_url || '',
        description: supplierRow.description || '',
        productsCount: supplierRow.products_count || 0,
        totalSales: supplierRow.total_sales || 0,
        totalOrders: supplierRow.total_orders || 0,
        rating: supplierRow.rating || 0,
        reviewCount: supplierRow.review_count || 0,
        memberDiscountPercent: supplierRow.member_discount_percent || 0,
        commissionRate: supplierRow.commission_rate || 0,
        isFounding: supplierRow.is_founding || false,
        sponsorshipTier: supplierRow.sponsorship_tier || null,
        verified: supplierRow.verified || false,
        website: supplierRow.website || '',
        certifications: supplierRow.certifications || [],
      });

      // 2. Fetch dashboard stats in parallel
      const [ordersRes, productsRes, revenueRes, pendingRes] = await Promise.all([
        supabase
          .from('orders')
          .select('id', { count: 'exact', head: true })
          .eq('supplier_id', supplierId),
        supabase
          .from('products')
          .select('id', { count: 'exact', head: true })
          .eq('supplier_id', supplierId),
        supabase
          .from('orders')
          .select('total_amount')
          .eq('supplier_id', supplierId),
        supabase
          .from('orders')
          .select('id', { count: 'exact', head: true })
          .eq('supplier_id', supplierId)
          .in('status', ['pending', 'processing', 'new']),
      ]);

      const totalRev = (revenueRes.data || []).reduce(
        (sum: number, o: { total_amount: number }) => sum + (o.total_amount || 0),
        0
      );

      setLiveStats({
        totalRevenue: totalRev || supplierRow.total_sales || 0,
        activeProducts: productsRes.count || supplierRow.products_count || 0,
        pendingOrders: pendingRes.count || 0,
        totalOrders: ordersRes.count || supplierRow.total_orders || 0,
      });

      // 3. Fetch recent orders
      const { data: ordersData } = await supabase
        .from('orders')
        .select('id, total_amount, status, created_at, member:profiles!orders_member_id_fkey(full_name)')
        .eq('supplier_id', supplierId)
        .order('created_at', { ascending: false })
        .limit(8);

      if (ordersData && ordersData.length > 0) {
        setLiveRecentOrders(
          ordersData.map((o: Record<string, unknown>) => ({
            id: o.id as string,
            product: 'Order',
            buyer: ((o.member as Record<string, unknown>)?.full_name as string) || 'Customer',
            amount: (o.total_amount as number) || 0,
            status: (o.status as string) || 'new',
            date: new Date(o.created_at as string).toISOString().slice(0, 10),
          }))
        );
      }
    } catch {
      // On any error, fallback data will be used (liveSupplier stays null)
    } finally {
      setDbLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    fetchLiveDashboard();
  }, [fetchLiveDashboard]);

  // ── Resolve live vs fallback data ─────────────────────────────────────────
  const supplier = liveSupplier || FALLBACK_SUPPLIER;
  const totalRevenue = liveStats?.totalRevenue ?? FALLBACK_TOTAL_REVENUE;
  const activeProductsCount = liveStats?.activeProducts ?? FALLBACK_ACTIVE_PRODUCTS;
  const pendingOrdersCount = liveStats?.pendingOrders ?? FALLBACK_PENDING_ORDERS;
  const commissionBalance = FALLBACK_COMMISSION_BALANCE; // commissions not yet in DB — keep fallback
  const totalAdImpressions = FALLBACK_AD_IMPRESSIONS;    // ads not yet in DB — keep fallback
  const memberReach = FALLBACK_MEMBER_REACH;
  const displayRecentOrders = liveRecentOrders || recentOrders;
  const commissionDonutData = FALLBACK_COMMISSION_DONUT;
  const commissionTotal = FALLBACK_COMMISSION_TOTAL;
  const activeAds = FALLBACK_ACTIVE_ADS;
  const supplierCommissionsForMonth = FALLBACK_COMMISSIONS;

  // ── Top-level stat cards data ───────────────────────────────────────────
  const statCards: { label: string; value: string; change: string | null; changeType: 'up' | 'down' | 'neutral'; icon: React.ReactNode; color: string; bgColor: string }[] = [
    {
      label: 'Total Revenue',
      value: formatCurrency(totalRevenue),
      change: '+22%',
      changeType: 'up' as const,
      icon: <DollarSign className="w-5 h-5" />,
      color: 'text-[#8CB89C]',
      bgColor: 'bg-[#8CB89C]/10',
    },
    {
      label: 'Active Products',
      value: activeProductsCount.toString(),
      change: '+3',
      changeType: 'up' as const,
      icon: <Package className="w-5 h-5" />,
      color: 'text-navy',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Pending Orders',
      value: pendingOrdersCount.toString(),
      change: null,
      changeType: 'neutral' as const,
      icon: <ShoppingCart className="w-5 h-5" />,
      color: 'text-gold',
      bgColor: 'bg-amber-50',
    },
    {
      label: 'Commission Balance',
      value: formatCurrency(commissionBalance),
      change: null,
      changeType: 'neutral' as const,
      icon: <Percent className="w-5 h-5" />,
      color: 'text-[#8CB89C]',
      bgColor: 'bg-[#8CB89C]/10',
    },
    {
      label: 'Ad Impressions',
      value: formatCompact(totalAdImpressions),
      change: '+18%',
      changeType: 'up' as const,
      icon: <Eye className="w-5 h-5" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'Member Reach',
      value: memberReach.toLocaleString(),
      change: '+8%',
      changeType: 'up' as const,
      icon: <Users className="w-5 h-5" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* ══════════════════════════════════════════════════════════════════
          1. WELCOME BANNER
      ═════════════════════════════════════════════════════════════════ */}
      <motion.div
        variants={fadeUp}
        className="rounded-xl p-6 text-white relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #8CB89C 0%, #729E82 100%)',
        }}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-8 -right-8 w-48 h-48 rounded-full bg-white/20" />
          <div className="absolute -bottom-12 -left-12 w-64 h-64 rounded-full bg-white/10" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {supplier.companyName}!</h1>
            <p className="text-white/80 text-sm mt-1">
              {supplier.sponsorshipTier
                ? `${supplier.sponsorshipTier.charAt(0).toUpperCase() + supplier.sponsorshipTier.slice(1)} Sponsor`
                : 'Active Supplier'}{' '}
              &bull; Member since {new Date(supplier.joinDate).getFullYear()}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/supplier/products"
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </Link>
            <Link
              href="/supplier/orders"
              className="flex items-center gap-2 bg-white text-[#729E82] hover:bg-white/90 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <ClipboardList className="w-4 h-4" />
              View Orders
            </Link>
          </div>
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════════════════════════
          2. KPI STATS ROW
      ═════════════════════════════════════════════════════════════════ */}
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4"
      >
        {statCards.map((stat, i) => (
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
              {stat.change && (
                <span
                  className={`text-xs font-medium px-1.5 py-0.5 rounded-full flex items-center gap-0.5 ${
                    stat.changeType === 'up'
                      ? 'bg-green-50 text-green-600'
                      : stat.changeType === 'down'
                        ? 'bg-red-50 text-red-600'
                        : 'bg-gray-50 text-gray-500'
                  }`}
                >
                  {stat.changeType === 'up' && <ArrowUpRight className="w-3 h-3" />}
                  {stat.changeType === 'down' && <ArrowDownRight className="w-3 h-3" />}
                  {stat.change}
                </span>
              )}
            </div>
            <p className="text-2xl font-bold text-navy">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* ══════════════════════════════════════════════════════════════════
          3. SALES TREND CHART
      ═════════════════════════════════════════════════════════════════ */}
      <motion.div
        variants={cardVariants}
        className="bg-white rounded-xl border border-gray-100 p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-navy text-sm flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#8CB89C]" />
            Sales Trend (12 Months)
          </h3>
          <span className="text-xs text-gray-400">
            Updated: {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={salesTrendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8CB89C" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8CB89C" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 11, fill: '#9CA3AF' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => formatCurrency(v)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="sales"
                stroke="#8CB89C"
                strokeWidth={2.5}
                fill="url(#salesGradient)"
                name="Sales"
                dot={{ fill: '#8CB89C', r: 3, strokeWidth: 0 }}
                activeDot={{ fill: '#8CB89C', r: 5, strokeWidth: 2, stroke: '#fff' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════════════════════════
          4. RECENT ORDERS (2/3) + TOP PRODUCTS (1/3)
      ═════════════════════════════════════════════════════════════════ */}
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* ── Recent Orders Table ──────────────────────────────────────── */}
        <motion.div
          variants={cardVariants}
          className="lg:col-span-2 bg-white rounded-xl border border-gray-100 overflow-hidden"
        >
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-navy text-sm">Recent Orders</h3>
            <Link
              href="/supplier/orders"
              className="text-[#8CB89C] text-xs font-medium hover:text-[#729E82] flex items-center gap-1 transition-colors"
            >
              View All Orders <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="text-left py-2.5 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="text-left py-2.5 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="text-left py-2.5 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Buyer
                  </th>
                  <th className="text-right py-2.5 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="text-left py-2.5 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left py-2.5 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {displayRecentOrders.map((order) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-cream/50 transition-colors cursor-default"
                  >
                    <td className="py-2.5 px-4 text-xs font-mono text-gray-500">{order.id}</td>
                    <td className="py-2.5 px-4">
                      <span className="font-medium text-navy text-sm">{order.product}</span>
                    </td>
                    <td className="py-2.5 px-4 text-gray-600 text-xs">{order.buyer}</td>
                    <td className="py-2.5 px-4 text-right font-medium text-navy text-sm tabular-nums">
                      ${order.amount.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-4">
                      <span
                        className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                          orderStatusColors[order.status] || 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-xs text-gray-400">{order.date}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* ── Top Products ─────────────────────────────────────────────── */}
        <motion.div
          variants={cardVariants}
          className="bg-white rounded-xl border border-gray-100 overflow-hidden"
        >
          <div className="p-5 border-b border-gray-100">
            <h3 className="font-semibold text-navy text-sm">Top Products</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {topProducts.map((product, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                onMouseEnter={() => setHoveredProduct(i)}
                onMouseLeave={() => setHoveredProduct(null)}
                className="px-4 py-3 hover:bg-cream/50 transition-colors cursor-default"
              >
                <div className="flex items-start justify-between mb-1">
                  <span className="font-medium text-navy text-sm leading-tight">{product.name}</span>
                  <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                    {product.trend === 'up' ? (
                      <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5 text-red-400" />
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{product.unitsSold.toLocaleString()} sold</span>
                  <span className="font-medium text-navy tabular-nums">{formatCurrency(product.revenue)}</span>
                </div>
                <div className="flex items-center gap-1 mt-1.5">
                  {Array.from({ length: 5 }).map((_, si) => (
                    <Star
                      key={si}
                      className={`w-3 h-3 ${
                        si < Math.floor(product.rating)
                          ? 'text-[#D4A843] fill-[#D4A843]'
                          : si < product.rating
                            ? 'text-[#D4A843] fill-[#D4A843]/50'
                            : 'text-gray-200'
                      }`}
                    />
                  ))}
                  <span className="text-[10px] text-gray-400 ml-1">{product.rating}</span>
                </div>
                {hoveredProduct === i && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-2 pt-2 border-t border-gray-100"
                  >
                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(product.revenue / topProducts[0].revenue) * 100}%` }}
                        transition={{ duration: 0.4 }}
                        className="h-1.5 rounded-full bg-[#8CB89C]"
                      />
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* ══════════════════════════════════════════════════════════════════
          5. COMMISSION SUMMARY + ACTIVE ADVERTISEMENTS
      ═════════════════════════════════════════════════════════════════ */}
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* ── Commission Summary ───────────────────────────────────────── */}
        <motion.div
          variants={cardVariants}
          className="bg-white rounded-xl border border-gray-100 p-5"
        >
          <h3 className="font-semibold text-navy text-sm mb-4 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-[#8CB89C]" />
            Commission Summary
          </h3>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="h-52 w-52 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={commissionDonutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey="name"
                    stroke="none"
                  >
                    {commissionDonutData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value))}
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid #f0f0f0',
                      fontSize: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    }}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: '11px' }}
                    formatter={(value: string) => <span className="text-gray-600">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-4 w-full">
              <div className="bg-[#8CB89C]/5 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-0.5">Total All-Time</p>
                <p className="text-xl font-bold text-navy tabular-nums">{formatCurrency(commissionTotal)}</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {commissionDonutData.map((item) => (
                  <div key={item.name} className="text-center">
                    <div className="w-2 h-2 rounded-full mx-auto mb-1" style={{ backgroundColor: item.color }} />
                    <p className="text-xs text-gray-500">{item.name}</p>
                    <p className="text-sm font-bold text-navy tabular-nums">{formatCurrency(item.value)}</p>
                  </div>
                ))}
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-0.5">This Month</p>
                <p className="text-lg font-bold text-navy tabular-nums">
                  {formatCurrency(
                    supplierCommissionsForMonth
                      .filter((c) => c.orderDate.startsWith('2026-03'))
                      .reduce((sum, c) => sum + c.commissionAmount, 0)
                  )}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Active Advertisements ────────────────────────────────────── */}
        <motion.div
          variants={cardVariants}
          className="bg-white rounded-xl border border-gray-100 overflow-hidden"
        >
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-navy text-sm flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-[#8CB89C]" />
              Active Advertisements
            </h3>
            <Link
              href="/supplier/advertising"
              className="text-[#8CB89C] text-xs font-medium hover:text-[#729E82] flex items-center gap-1 transition-colors"
            >
              Manage Ads <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {activeAds.map((ad, i) => {
              const budgetPct = Math.round((ad.spent / ad.budget) * 100);
              return (
                <motion.div
                  key={ad.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-4 hover:bg-cream/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-navy truncate">{ad.title}</p>
                      <span
                        className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-medium mt-1 ${
                          adTypeBadge[ad.type] || 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {adTypeLabels[ad.type] || ad.type}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-2.5">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {formatCompact(ad.impressions)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MousePointerClick className="w-3 h-3" />
                      {formatCompact(ad.clicks)}
                    </span>
                    <span className="flex items-center gap-1 font-medium text-[#8CB89C]">
                      CTR {ad.ctr}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${budgetPct}%` }}
                        transition={{ duration: 0.8, delay: 0.3 + i * 0.1, ease: 'easeOut' }}
                        className={`h-2 rounded-full ${
                          budgetPct >= 90 ? 'bg-red-400' : budgetPct >= 70 ? 'bg-[#D4A843]' : 'bg-[#8CB89C]'
                        }`}
                      />
                    </div>
                    <span className="text-[10px] text-gray-400 tabular-nums whitespace-nowrap">
                      ${ad.spent.toLocaleString()} / ${ad.budget.toLocaleString()} ({budgetPct}%)
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
