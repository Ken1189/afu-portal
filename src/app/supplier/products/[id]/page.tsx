'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  ArrowLeft,
  Star,
  Package,
  ShoppingCart,
  Tag,
  Pencil,
  Trash2,
  Award,
  BadgePercent,
  BarChart3,
  MessageSquare,
  User,
  Calendar,
  ThumbsUp,
  ChevronRight,
  Layers,
} from 'lucide-react';
// ── Inline supplier-product type & fallback data (replaces @/lib/data/supplierProducts import) ──

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

const supplierProducts: SupplierProduct[] = [
  { id: 'SPROD-001', supplierId: 'SUP-002', supplierName: 'Kalahari Seeds Co.', name: 'Drought-Resistant Sorghum (Macia)', description: 'Early-maturing white sorghum variety developed for semi-arid conditions. 90-100 day maturity cycle with excellent grain quality for milling. 25kg bag.', category: 'seeds', price: 65, memberPrice: 58.50, currency: 'USD', unit: 'per 25kg bag', image: 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=400&h=300&fit=crop', availability: 'in-stock', rating: 4.7, reviewCount: 89, soldCount: 1245, tags: ['drought-resistant', 'early-maturing', 'sorghum', 'milling-grade'], featured: true, minOrder: 2 },
  { id: 'SPROD-002', supplierId: 'SUP-002', supplierName: 'Kalahari Seeds Co.', name: 'Hybrid Maize Seed (PAN 4M-21)', description: 'High-yielding hybrid maize variety with good drought tolerance. Expected yield 6-8 tonnes/hectare under optimal conditions. 10kg bag treats 1 hectare.', category: 'seeds', price: 48, memberPrice: 43.20, currency: 'USD', unit: 'per 10kg bag', image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=300&fit=crop', availability: 'in-stock', rating: 4.6, reviewCount: 134, soldCount: 2310, tags: ['hybrid', 'maize', 'high-yield', 'drought-tolerant'], featured: true, minOrder: 1 },
  { id: 'SPROD-003', supplierId: 'SUP-020', supplierName: 'Victoria Falls Seed Bank', name: 'Cowpea Seeds (IT18)', description: 'Improved cowpea variety with resistance to aphids and bruchids. Dual-purpose grain and fodder. Matures in 65-70 days. 5kg pack.', category: 'seeds', price: 22, memberPrice: 20.24, currency: 'USD', unit: 'per 5kg pack', image: 'https://images.unsplash.com/photo-1590682680695-43b964a3ae17?w=400&h=300&fit=crop', availability: 'in-stock', rating: 4.5, reviewCount: 67, soldCount: 890, tags: ['cowpea', 'dual-purpose', 'pest-resistant', 'legume'], featured: false, minOrder: 2 },
  { id: 'SPROD-004', supplierId: 'SUP-020', supplierName: 'Victoria Falls Seed Bank', name: 'Sesame Seed (Lindi 02)', description: 'High-oil content sesame variety bred for East African conditions. White seed preferred for export markets. 2kg pack per hectare planting rate.', category: 'seeds', price: 35, memberPrice: 32.20, currency: 'USD', unit: 'per 2kg pack', image: 'https://images.unsplash.com/photo-1498579809087-ef1e558fd1da?w=400&h=300&fit=crop', availability: 'limited', rating: 4.4, reviewCount: 45, soldCount: 567, tags: ['sesame', 'export-grade', 'high-oil', 'white-seed'], featured: false, minOrder: 3 },
  { id: 'SPROD-005', supplierId: 'SUP-001', supplierName: 'Zambezi Agri-Supplies', name: 'Groundnut Seed (Nyanda)', description: 'Virginia-type groundnut variety with large kernels. Resistant to rosette disease. Excellent for both oil extraction and confectionery markets. 25kg bag.', category: 'seeds', price: 78, memberPrice: 68.64, currency: 'USD', unit: 'per 25kg bag', image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400&h=300&fit=crop', availability: 'in-stock', rating: 4.8, reviewCount: 98, soldCount: 1678, tags: ['groundnut', 'disease-resistant', 'export-quality', 'virginia-type'], featured: true, minOrder: 1 },
  { id: 'SPROD-006', supplierId: 'SUP-006', supplierName: 'Okavango Fertilizers', name: 'NPK 15-15-15 Compound Fertilizer', description: 'Balanced compound fertilizer suitable for a wide range of crops at planting. Granular formulation for easy application. 50kg bag.', category: 'fertilizer', price: 45, memberPrice: 40.95, currency: 'USD', unit: 'per 50kg bag', image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop', availability: 'in-stock', rating: 4.4, reviewCount: 156, soldCount: 3420, tags: ['NPK', 'compound', 'basal', 'all-purpose'], featured: false, minOrder: 5 },
  { id: 'SPROD-007', supplierId: 'SUP-006', supplierName: 'Okavango Fertilizers', name: 'Urea (46-0-0) Top Dressing', description: 'High-nitrogen granular urea for top-dressing cereals and vegetables. 46% nitrogen content. Critical for maize and sorghum yields. 50kg bag.', category: 'fertilizer', price: 38, memberPrice: 34.58, currency: 'USD', unit: 'per 50kg bag', image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=300&fit=crop', availability: 'in-stock', rating: 4.3, reviewCount: 112, soldCount: 2890, tags: ['urea', 'nitrogen', 'top-dressing', 'cereals'], featured: false, minOrder: 5 },
  { id: 'SPROD-008', supplierId: 'SUP-010', supplierName: 'Kilimanjaro Organic Inputs', name: 'Organic Compost Blend (Kilimanjaro Mix)', description: 'Premium organic compost made from coffee husks, banana stems, and cattle manure. Rich in micronutrients and beneficial microbes. 25kg bag.', category: 'fertilizer', price: 18, memberPrice: 16.56, currency: 'USD', unit: 'per 25kg bag', image: 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=400&h=300&fit=crop', availability: 'in-stock', rating: 4.6, reviewCount: 78, soldCount: 1567, tags: ['organic', 'compost', 'micronutrients', 'soil-health'], featured: true, minOrder: 10 },
  { id: 'SPROD-009', supplierId: 'SUP-015', supplierName: 'Bagamoyo Marine Harvest', name: 'Seaweed Bio-Stimulant (Kelp Extract)', description: 'Liquid seaweed extract bio-stimulant for foliar application. Enhances root growth, stress tolerance, and nutrient uptake. 5L container.', category: 'fertilizer', price: 32, memberPrice: 28.80, currency: 'USD', unit: 'per 5L container', image: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=400&h=300&fit=crop', availability: 'in-stock', rating: 4.5, reviewCount: 34, soldCount: 423, tags: ['bio-stimulant', 'seaweed', 'foliar', 'organic'], featured: false, minOrder: 2 },
  { id: 'SPROD-010', supplierId: 'SUP-006', supplierName: 'Okavango Fertilizers', name: 'Single Super Phosphate (SSP)', description: 'Phosphate fertilizer for legumes and root crops. 18% P2O5 content with added sulphur and calcium. Ideal for groundnuts and cowpeas. 50kg bag.', category: 'fertilizer', price: 28, memberPrice: 25.48, currency: 'USD', unit: 'per 50kg bag', image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=300&fit=crop', availability: 'limited', rating: 4.2, reviewCount: 67, soldCount: 1234, tags: ['phosphate', 'SSP', 'legumes', 'root-crops'], featured: false, minOrder: 5 },
  { id: 'SPROD-011', supplierId: 'SUP-013', supplierName: 'Tswana Agri-Chem', name: 'Lambda-Cyhalothrin 5EC Insecticide', description: 'Broad-spectrum pyrethroid insecticide for bollworm, stem borer, and aphid control in cereals, cotton, and vegetables. 1L bottle.', category: 'pesticides', price: 24, memberPrice: 22.08, currency: 'USD', unit: 'per liter', image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=300&fit=crop', availability: 'in-stock', rating: 4.4, reviewCount: 89, soldCount: 1890, tags: ['insecticide', 'pyrethroid', 'bollworm', 'broad-spectrum'], featured: false, minOrder: 2 },
  { id: 'SPROD-012', supplierId: 'SUP-013', supplierName: 'Tswana Agri-Chem', name: 'Glyphosate 480SL Herbicide', description: 'Non-selective systemic herbicide for pre-planting weed control. Effective on annual and perennial grasses and broadleaf weeds. 5L container.', category: 'pesticides', price: 28, memberPrice: 25.76, currency: 'USD', unit: 'per 5L container', image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=300&fit=crop', availability: 'in-stock', rating: 4.3, reviewCount: 145, soldCount: 2567, tags: ['herbicide', 'glyphosate', 'pre-planting', 'systemic'], featured: false, minOrder: 1 },
  { id: 'SPROD-013', supplierId: 'SUP-010', supplierName: 'Kilimanjaro Organic Inputs', name: 'Neem Oil Organic Pesticide', description: 'Cold-pressed neem oil for organic pest and disease management. Controls over 200 pest species including whitefly, mealybugs, and mites. 1L bottle.', category: 'pesticides', price: 18, memberPrice: 16.56, currency: 'USD', unit: 'per liter', image: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=400&h=300&fit=crop', availability: 'in-stock', rating: 4.6, reviewCount: 56, soldCount: 987, tags: ['organic', 'neem', 'biopesticide', 'IPM'], featured: true, minOrder: 2 },
  { id: 'SPROD-014', supplierId: 'SUP-001', supplierName: 'Zambezi Agri-Supplies', name: 'Metalaxyl + Mancozeb Fungicide', description: 'Systemic and contact fungicide combination for control of downy mildew, late blight, and damping-off in vegetables and field crops. 1kg pack.', category: 'pesticides', price: 35, memberPrice: 30.80, currency: 'USD', unit: 'per kg', image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=300&fit=crop', availability: 'in-stock', rating: 4.5, reviewCount: 76, soldCount: 1345, tags: ['fungicide', 'systemic', 'blight', 'downy-mildew'], featured: false, minOrder: 2 },
  { id: 'SPROD-015', supplierId: 'SUP-004', supplierName: 'Matopos Equipment Hire', name: 'Walk-Behind Tractor (15HP Diesel)', description: 'Heavy-duty two-wheel tractor with 15HP diesel engine. Includes plough, ridger, and trailer attachments. Ideal for smallholder farms up to 5 hectares.', category: 'equipment', price: 3800, memberPrice: 3230, currency: 'USD', unit: 'per unit', image: 'https://images.unsplash.com/photo-1530267981375-f0de937f5f13?w=400&h=300&fit=crop', availability: 'in-stock', rating: 4.6, reviewCount: 45, soldCount: 134, tags: ['tractor', 'two-wheel', 'diesel', 'smallholder'], featured: true, minOrder: 1 },
  { id: 'SPROD-016', supplierId: 'SUP-004', supplierName: 'Matopos Equipment Hire', name: 'Maize Sheller (Manual)', description: 'Hand-operated maize sheller with capacity of 100kg/hour. Durable steel construction. Reduces labour costs by 80% compared to hand shelling.', category: 'equipment', price: 185, memberPrice: 157.25, currency: 'USD', unit: 'per unit', image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=300&fit=crop', availability: 'in-stock', rating: 4.4, reviewCount: 89, soldCount: 456, tags: ['maize', 'sheller', 'manual', 'post-harvest'], featured: false, minOrder: 1 },
  { id: 'SPROD-017', supplierId: 'SUP-018', supplierName: 'Morogoro Farm Implements', name: 'Ox-Drawn Plough (Mouldboard)', description: 'Heavy-duty mouldboard plough for ox-drawn cultivation. Hardened steel share and landside. Adjustable depth control. Suitable for most soil types.', category: 'equipment', price: 120, memberPrice: 109.20, currency: 'USD', unit: 'per unit', image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400&h=300&fit=crop', availability: 'in-stock', rating: 4.2, reviewCount: 67, soldCount: 789, tags: ['ox-drawn', 'plough', 'tillage', 'animal-traction'], featured: false, minOrder: 1 },
  { id: 'SPROD-018', supplierId: 'SUP-018', supplierName: 'Morogoro Farm Implements', name: 'Cassava Chipping Machine (Electric)', description: 'Electric cassava chipper and slicer. 500kg/hour capacity. Stainless steel blades. Produces uniform chips for sun-drying or industrial processing.', category: 'equipment', price: 1950, memberPrice: 1774.50, currency: 'USD', unit: 'per unit', image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=300&fit=crop', availability: 'limited', rating: 4.3, reviewCount: 23, soldCount: 67, tags: ['cassava', 'processing', 'electric', 'chipping'], featured: false, minOrder: 1 },
  { id: 'SPROD-019', supplierId: 'SUP-004', supplierName: 'Matopos Equipment Hire', name: 'Boom Sprayer (Tractor-Mounted 600L)', description: 'Tractor-mounted boom sprayer with 600L tank. 12m spray width. Includes pressure regulator and multiple nozzle options for precise chemical application.', category: 'equipment', price: 2400, memberPrice: 2040, currency: 'USD', unit: 'per unit', image: 'https://images.unsplash.com/photo-1530267981375-f0de937f5f13?w=400&h=300&fit=crop', availability: 'pre-order', rating: 4.5, reviewCount: 34, soldCount: 89, tags: ['sprayer', 'tractor-mounted', 'boom', 'crop-protection'], featured: false, minOrder: 1 },
  { id: 'SPROD-020', supplierId: 'SUP-009', supplierName: 'Chobe Irrigation Systems', name: 'Drip Irrigation Kit (1 Hectare)', description: 'Complete drip irrigation system for 1 hectare. Includes mainline, sub-mains, laterals with inline drippers at 30cm spacing, disc filter, and fittings.', category: 'irrigation', price: 1850, memberPrice: 1665, currency: 'USD', unit: 'per kit', image: 'https://images.unsplash.com/photo-1622383563227-04401ab4e5ea?w=400&h=300&fit=crop', availability: 'in-stock', rating: 4.8, reviewCount: 56, soldCount: 234, tags: ['drip', 'irrigation', 'water-efficient', 'complete-kit'], featured: true, minOrder: 1 },
  { id: 'SPROD-021', supplierId: 'SUP-009', supplierName: 'Chobe Irrigation Systems', name: 'Solar Water Pump (2HP Submersible)', description: 'Solar-powered submersible pump with 6 panels. Lifts water from boreholes up to 50m deep. Flow rate 3.5m3/hour. Complete with controller and cables.', category: 'irrigation', price: 2200, memberPrice: 1980, currency: 'USD', unit: 'per unit', image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=300&fit=crop', availability: 'in-stock', rating: 4.7, reviewCount: 43, soldCount: 156, tags: ['solar', 'pump', 'submersible', 'borehole'], featured: true, minOrder: 1 },
  { id: 'SPROD-022', supplierId: 'SUP-009', supplierName: 'Chobe Irrigation Systems', name: 'Water Storage Tank (10,000L JoJo)', description: 'UV-resistant polyethylene water storage tank. 10,000 litre capacity. Food-grade material. Gravity-compatible for drip irrigation systems. Includes fittings.', category: 'irrigation', price: 580, memberPrice: 522, currency: 'USD', unit: 'per tank', image: 'https://images.unsplash.com/photo-1504370805625-d32c54b16100?w=400&h=300&fit=crop', availability: 'in-stock', rating: 4.5, reviewCount: 78, soldCount: 345, tags: ['storage', 'tank', 'water', 'polyethylene'], featured: false, minOrder: 1 },
  { id: 'SPROD-023', supplierId: 'SUP-011', supplierName: 'Hwange Solar & Pumps', name: 'Solar Pump Controller (MPPT)', description: 'Maximum Power Point Tracking solar pump controller. Compatible with 1-5HP pumps. LCD display with flow monitoring. IP65 rated weatherproof enclosure.', category: 'irrigation', price: 450, memberPrice: 405, currency: 'USD', unit: 'per unit', image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=300&fit=crop', availability: 'in-stock', rating: 4.6, reviewCount: 29, soldCount: 198, tags: ['solar', 'controller', 'MPPT', 'pump'], featured: false, minOrder: 1 },
  { id: 'SPROD-024', supplierId: 'SUP-003', supplierName: 'TechFarm Solutions', name: 'IoT Soil Moisture Sensor Kit', description: 'Wireless soil moisture and temperature monitoring system. 4 sensors per kit with solar-powered gateway. Mobile app with real-time alerts and historical data.', category: 'technology', price: 380, memberPrice: 349.60, currency: 'USD', unit: 'per kit', image: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=400&h=300&fit=crop', availability: 'in-stock', rating: 4.7, reviewCount: 45, soldCount: 267, tags: ['IoT', 'sensor', 'soil-moisture', 'smart-farming'], featured: true, minOrder: 1 },
  { id: 'SPROD-025', supplierId: 'SUP-003', supplierName: 'TechFarm Solutions', name: 'Precision Weather Station', description: 'All-in-one weather station measuring temperature, humidity, rainfall, wind speed/direction, and solar radiation. WiFi connected with cloud dashboard.', category: 'technology', price: 420, memberPrice: 386.40, currency: 'USD', unit: 'per unit', image: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=400&h=300&fit=crop', availability: 'in-stock', rating: 4.6, reviewCount: 38, soldCount: 189, tags: ['weather', 'station', 'IoT', 'climate-monitoring'], featured: false, minOrder: 1 },
  { id: 'SPROD-026', supplierId: 'SUP-016', supplierName: 'Makgadikgadi Drones', name: 'DJI Agras T30 Spray Drone', description: 'Agricultural spray drone with 30L tank capacity. GPS-guided precision spraying covering 16 hectares/hour. Includes 3 batteries and charger.', category: 'technology', price: 14500, memberPrice: 12760, currency: 'USD', unit: 'per unit', image: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=400&h=300&fit=crop', availability: 'limited', rating: 4.8, reviewCount: 18, soldCount: 34, tags: ['drone', 'spraying', 'precision', 'DJI'], featured: true, minOrder: 1 },
  { id: 'SPROD-027', supplierId: 'SUP-019', supplierName: 'Mmegi Digital Agriculture', name: 'FarmTrack Pro (Annual License)', description: 'Comprehensive farm management software. Track inputs, labour, harvests, and finances. GPS field mapping, crop calendar, and marketplace integration.', category: 'technology', price: 120, memberPrice: 102, currency: 'USD', unit: 'per license/year', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop', availability: 'in-stock', rating: 4.5, reviewCount: 34, soldCount: 267, tags: ['software', 'farm-management', 'digital', 'analytics'], featured: false, minOrder: 1 },
  { id: 'SPROD-028', supplierId: 'SUP-016', supplierName: 'Makgadikgadi Drones', name: 'NDVI Crop Mapping Service (per flight)', description: 'Drone-based NDVI crop health mapping service. Includes flight, data processing, and detailed crop health report with actionable recommendations.', category: 'technology', price: 85, memberPrice: 74.80, currency: 'USD', unit: 'per flight (up to 20ha)', image: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=400&h=300&fit=crop', availability: 'in-stock', rating: 4.7, reviewCount: 28, soldCount: 145, tags: ['NDVI', 'mapping', 'drone', 'crop-health'], featured: false, minOrder: 1 },
  { id: 'SPROD-029', supplierId: 'SUP-012', supplierName: 'Ngorongoro Packaging', name: 'Export-Grade Produce Cartons (Pack of 50)', description: 'Ventilated corrugated cartons for fresh produce export. 10kg capacity each. Printed with space for brand labelling. Meets EU import standards.', category: 'packaging', price: 75, memberPrice: 69.75, currency: 'USD', unit: 'per pack of 50', image: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=400&h=300&fit=crop', availability: 'in-stock', rating: 4.3, reviewCount: 34, soldCount: 567, tags: ['export', 'cartons', 'fresh-produce', 'packaging'], featured: false, minOrder: 5 },
  { id: 'SPROD-030', supplierId: 'SUP-012', supplierName: 'Ngorongoro Packaging', name: 'Breathable Mesh Produce Bags (100 pack)', description: 'Reusable mesh bags for onions, potatoes, and root vegetables. 25kg capacity. UV-stabilized polypropylene with drawstring closure. Pack of 100.', category: 'packaging', price: 45, memberPrice: 41.85, currency: 'USD', unit: 'per pack of 100', image: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=400&h=300&fit=crop', availability: 'in-stock', rating: 4.2, reviewCount: 45, soldCount: 890, tags: ['mesh', 'bags', 'reusable', 'root-vegetables'], featured: false, minOrder: 2 },
  { id: 'SPROD-031', supplierId: 'SUP-012', supplierName: 'Ngorongoro Packaging', name: 'Vacuum Seal Bags (500 pack, 1kg size)', description: 'Food-grade vacuum seal bags for dried grains, spices, and processed products. Transparent with printed nutrition panel area. 1kg capacity each.', category: 'packaging', price: 55, memberPrice: 51.15, currency: 'USD', unit: 'per pack of 500', image: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=400&h=300&fit=crop', availability: 'limited', rating: 4.4, reviewCount: 23, soldCount: 345, tags: ['vacuum', 'seal', 'grains', 'food-grade'], featured: false, minOrder: 2 },
  { id: 'SPROD-032', supplierId: 'SUP-017', supplierName: 'Chimanimani Grain Storage', name: 'Hermetic Grain Storage Bag (100kg)', description: 'Triple-layer hermetic bag for grain storage without chemicals. Prevents weevil and aflatoxin damage for up to 2 years. Reusable for 3 seasons. Pack of 10.', category: 'storage', price: 35, memberPrice: 32.55, currency: 'USD', unit: 'per pack of 10', image: 'https://images.unsplash.com/photo-1504370805625-d32c54b16100?w=400&h=300&fit=crop', availability: 'in-stock', rating: 4.5, reviewCount: 67, soldCount: 2345, tags: ['hermetic', 'grain', 'storage', 'chemical-free'], featured: true, minOrder: 5 },
  { id: 'SPROD-033', supplierId: 'SUP-017', supplierName: 'Chimanimani Grain Storage', name: 'Metal Silo (1 Tonne Capacity)', description: 'Galvanized steel grain storage silo. 1 tonne capacity with airtight seal. Includes filling chute and discharge outlet. 10-year lifespan minimum.', category: 'storage', price: 280, memberPrice: 260.40, currency: 'USD', unit: 'per unit', image: 'https://images.unsplash.com/photo-1504370805625-d32c54b16100?w=400&h=300&fit=crop', availability: 'in-stock', rating: 4.4, reviewCount: 34, soldCount: 456, tags: ['silo', 'metal', 'grain-storage', 'galvanized'], featured: false, minOrder: 1 },
  { id: 'SPROD-034', supplierId: 'SUP-017', supplierName: 'Chimanimani Grain Storage', name: 'Cold Room (5 Tonne Modular)', description: 'Modular cold storage room with 5 tonne capacity. Solar-compatible compressor. Temperature range 0-10C. Includes shelving and digital thermostat.', category: 'storage', price: 8500, memberPrice: 7905, currency: 'USD', unit: 'per unit', image: 'https://images.unsplash.com/photo-1560693225-b8507d6f3aa9?w=400&h=300&fit=crop', availability: 'pre-order', rating: 4.6, reviewCount: 12, soldCount: 23, tags: ['cold-room', 'modular', 'solar-compatible', 'fresh-produce'], featured: false, minOrder: 1 },
  { id: 'SPROD-035', supplierId: 'SUP-001', supplierName: 'Zambezi Agri-Supplies', name: 'Knapsack Sprayer (16L Manual)', description: 'High-pressure manual knapsack sprayer with 16L tank. Brass lance and adjustable nozzle. Comfortable padded straps. Ideal for crop protection application.', category: 'tools', price: 35, memberPrice: 30.80, currency: 'USD', unit: 'per unit', image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop', availability: 'in-stock', rating: 4.3, reviewCount: 123, soldCount: 3456, tags: ['sprayer', 'knapsack', 'manual', 'crop-protection'], featured: false, minOrder: 1 },
  { id: 'SPROD-036', supplierId: 'SUP-001', supplierName: 'Zambezi Agri-Supplies', name: 'Soil pH Test Kit (50 tests)', description: 'Portable soil pH testing kit with colour chart. 50 individual tests per kit. Includes sampling tools and interpretation guide. Results in 60 seconds.', category: 'tools', price: 28, memberPrice: 24.64, currency: 'USD', unit: 'per kit', image: 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=400&h=300&fit=crop', availability: 'in-stock', rating: 4.4, reviewCount: 56, soldCount: 789, tags: ['soil-testing', 'pH', 'portable', 'quick-results'], featured: false, minOrder: 1 },
  { id: 'SPROD-037', supplierId: 'SUP-018', supplierName: 'Morogoro Farm Implements', name: 'Hoe Set (3-piece Forged Steel)', description: 'Professional-grade forged steel hoe set. Includes broad hoe, narrow hoe, and weeding hoe. Hardwood handles. Essential for manual land preparation.', category: 'tools', price: 15, memberPrice: 13.65, currency: 'USD', unit: 'per set', image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400&h=300&fit=crop', availability: 'in-stock', rating: 4.1, reviewCount: 98, soldCount: 4567, tags: ['hoe', 'hand-tools', 'forged-steel', 'weeding'], featured: false, minOrder: 5 },
  { id: 'SPROD-038', supplierId: 'SUP-001', supplierName: 'Zambezi Agri-Supplies', name: 'Pruning Shears (Bypass, Professional)', description: 'Professional bypass pruning shears with SK5 steel blades. Ergonomic grip with safety lock. Essential for orchard management and vineyard work.', category: 'tools', price: 12, memberPrice: 10.56, currency: 'USD', unit: 'per unit', image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop', availability: 'in-stock', rating: 4.5, reviewCount: 67, soldCount: 1234, tags: ['pruning', 'shears', 'professional', 'orchard'], featured: false, minOrder: 2 },
  { id: 'SPROD-039', supplierId: 'SUP-003', supplierName: 'TechFarm Solutions', name: 'Digital Grain Moisture Meter', description: 'Handheld digital moisture meter for grains and seeds. Measures 12 crop types including maize, wheat, rice, and sorghum. LCD display with backlight.', category: 'tools', price: 65, memberPrice: 59.80, currency: 'USD', unit: 'per unit', image: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=400&h=300&fit=crop', availability: 'in-stock', rating: 4.6, reviewCount: 42, soldCount: 345, tags: ['moisture', 'meter', 'digital', 'grain-quality'], featured: false, minOrder: 1 },
  { id: 'SPROD-040', supplierId: 'SUP-011', supplierName: 'Hwange Solar & Pumps', name: 'Solar Panel Kit (300W Off-Grid)', description: 'Complete 300W solar panel kit for farm buildings. Includes panel, charge controller, 100Ah battery, and inverter. Powers lights, phone charging, and small tools.', category: 'tools', price: 520, memberPrice: 468, currency: 'USD', unit: 'per kit', image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=300&fit=crop', availability: 'in-stock', rating: 4.7, reviewCount: 56, soldCount: 234, tags: ['solar', 'off-grid', 'power', 'farm-building'], featured: true, minOrder: 1 },
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

// ── Category & availability config ──────────────────────────────────────────

const categoryColors: Record<string, string> = {
  seeds: 'bg-green-100 text-green-700',
  fertilizer: 'bg-amber-100 text-amber-700',
  pesticides: 'bg-red-100 text-red-700',
  equipment: 'bg-blue-100 text-blue-700',
  irrigation: 'bg-cyan-100 text-cyan-700',
  technology: 'bg-purple-100 text-purple-700',
  packaging: 'bg-orange-100 text-orange-700',
  storage: 'bg-slate-100 text-slate-700',
  tools: 'bg-indigo-100 text-indigo-700',
};

const categoryLabels: Record<string, string> = {
  seeds: 'Seeds',
  fertilizer: 'Fertilizer',
  pesticides: 'Pesticides',
  equipment: 'Equipment',
  irrigation: 'Irrigation',
  technology: 'Technology',
  packaging: 'Packaging',
  storage: 'Storage',
  tools: 'Tools',
};

const availabilityConfig: Record<string, { label: string; color: string }> = {
  'in-stock': { label: 'In Stock', color: 'bg-green-100 text-green-700' },
  limited: { label: 'Limited Stock', color: 'bg-amber-100 text-amber-700' },
  'pre-order': { label: 'Pre-Order', color: 'bg-blue-100 text-blue-700' },
  'out-of-stock': { label: 'Out of Stock', color: 'bg-red-100 text-red-700' },
};

// ── Mock sales data (last 6 months) ─────────────────────────────────────────

const salesData = [
  { month: 'Oct', units: 145, revenue: 9860 },
  { month: 'Nov', units: 178, revenue: 12104 },
  { month: 'Dec', units: 132, revenue: 8976 },
  { month: 'Jan', units: 198, revenue: 13464 },
  { month: 'Feb', units: 221, revenue: 15028 },
  { month: 'Mar', units: 256, revenue: 17408 },
];

// ── Mock reviews ────────────────────────────────────────────────────────────

const mockReviews = [
  {
    id: 'REV-001',
    author: 'Kgosi Mosweu',
    type: 'Commercial Farmer',
    rating: 5,
    date: '2026-03-08',
    text: 'Excellent product quality. The germination rate was outstanding at over 95%. Will definitely order again for next planting season. Delivery was prompt and packaging was intact.',
    helpful: 12,
  },
  {
    id: 'REV-002',
    author: 'Tatenda Chikaura',
    type: 'Smallholder',
    rating: 5,
    date: '2026-02-22',
    text: 'Very impressed with this product. It performed well even under the dry conditions we experienced this season. The member pricing made it very affordable for our cooperative members.',
    helpful: 8,
  },
  {
    id: 'REV-003',
    author: 'Central District Co-op',
    type: 'Cooperative',
    rating: 4,
    date: '2026-02-15',
    text: 'Good quality product overall. Our members have been using it consistently with positive results. Only reason for 4 stars is that delivery took slightly longer than expected.',
    helpful: 6,
  },
  {
    id: 'REV-004',
    author: 'Sipho Dlamini',
    type: 'Smallholder',
    rating: 5,
    date: '2026-01-28',
    text: 'Highly recommended for anyone in the region. Works exactly as described. The technical guide included was very helpful for first-time users. Great value at the member price.',
    helpful: 15,
  },
  {
    id: 'REV-005',
    author: 'Mutare Orchards Co-op',
    type: 'Cooperative',
    rating: 4,
    date: '2026-01-14',
    text: 'Solid product from a reliable supplier. We have been purchasing from Zambezi Agri-Supplies for three seasons now and they consistently deliver quality inputs. Recommended.',
    helpful: 9,
  },
];

// ── Gallery images (mock thumbnails reusing main image) ─────────────────────

function getGalleryImages(mainImage: string): string[] {
  return [
    mainImage,
    mainImage.replace('w=400', 'w=401'),
    mainImage.replace('w=400', 'w=402'),
    mainImage.replace('w=400', 'w=403'),
  ];
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatCurrency(value: number): string {
  return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatCompact(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toLocaleString()}`;
}

// ── Custom Tooltip ──────────────────────────────────────────────────────────

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
      <p className="font-semibold text-[#1B2A4A] mb-1">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-gray-600">{entry.name}:</span>
          <span className="font-medium text-[#1B2A4A]">
            {entry.name === 'Revenue' ? formatCompact(entry.value) : entry.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function SupplierProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;
  const product = supplierProducts.find((p) => p.id === productId);

  const [selectedImage, setSelectedImage] = useState(0);

  if (!product) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-lg font-semibold text-[#1B2A4A] mb-2">Product Not Found</h2>
          <p className="text-sm text-gray-500 mb-6">
            The product with ID &quot;{productId}&quot; could not be found.
          </p>
          <Link
            href="/supplier/products"
            className="inline-flex items-center gap-2 bg-[#8CB89C] hover:bg-[#729E82] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const galleryImages = getGalleryImages(product.image);
  const discountPercent = Math.round(((product.price - product.memberPrice) / product.price) * 100);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* ══════════════════════════════════════════════════════════════════
          1. BACK BUTTON + HEADING
      ═════════════════════════════════════════════════════════════════ */}
      <motion.div variants={fadeUp} className="flex items-center gap-3">
        <Link
          href="/supplier/products"
          className="w-10 h-10 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 flex items-center justify-center transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-[#1B2A4A]" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-0.5">
            <Link href="/supplier/products" className="hover:text-[#8CB89C] transition-colors">
              Products
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-600 truncate">{product.name}</span>
          </div>
          <h1 className="text-2xl font-bold text-[#1B2A4A] truncate">{product.name}</h1>
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════════════════════════
          2. MAIN CONTENT — TWO COLUMNS
      ═════════════════════════════════════════════════════════════════ */}
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* ── Left Column: Product Images ─────────────────────────────── */}
        <motion.div variants={cardVariants} className="space-y-3">
          {/* Main Image */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="relative aspect-[4/3] overflow-hidden">
              <img
                src={galleryImages[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.featured && (
                <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 bg-[#D4A843] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                  <Award className="w-3.5 h-3.5" />
                  Featured Product
                </div>
              )}
            </div>
          </div>

          {/* Gallery Thumbnails */}
          <div className="grid grid-cols-4 gap-2">
            {galleryImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                  selectedImage === idx
                    ? 'border-[#8CB89C] shadow-md'
                    : 'border-gray-100 hover:border-gray-300'
                }`}
              >
                <img
                  src={img}
                  alt={`${product.name} view ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </motion.div>

        {/* ── Right Column: Product Info ──────────────────────────────── */}
        <motion.div variants={cardVariants} className="space-y-5">
          {/* Product Name + Badges */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span
                  className={`inline-block text-xs font-medium px-2.5 py-0.5 rounded-full ${
                    categoryColors[product.category] || 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {categoryLabels[product.category]}
                </span>
                {product.featured && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full bg-[#D4A843]/10 text-[#D4A843]">
                    <Star className="w-3 h-3 fill-[#D4A843]" />
                    Featured
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold text-[#1B2A4A] mb-1">{product.name}</h2>
              <p className="text-xs text-gray-400">Product ID: {product.id}</p>
            </div>

            {/* Price Section */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-baseline gap-3 mb-1">
                <span className="text-sm text-gray-400 line-through">
                  {formatCurrency(product.price)}
                </span>
                <span className="text-2xl font-bold text-[#8CB89C]">
                  {formatCurrency(product.memberPrice)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-xs font-medium text-[#8CB89C] bg-[#8CB89C]/10 px-2 py-0.5 rounded-full">
                  <BadgePercent className="w-3 h-3" />
                  {discountPercent}% member discount
                </span>
                <span className="text-xs text-gray-400">{product.unit}</span>
              </div>
            </div>

            {/* Availability Badge */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-gray-500">Availability:</span>
              <span
                className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${
                  availabilityConfig[product.availability]?.color || 'bg-gray-100 text-gray-600'
                }`}
              >
                {availabilityConfig[product.availability]?.label || product.availability}
              </span>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, si) => (
                  <Star
                    key={si}
                    className={`w-4 h-4 ${
                      si < Math.floor(product.rating)
                        ? 'text-[#D4A843] fill-[#D4A843]'
                        : si < product.rating
                          ? 'text-[#D4A843] fill-[#D4A843]/50'
                          : 'text-gray-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-semibold text-[#1B2A4A]">{product.rating}</span>
              <span className="text-xs text-gray-400">({product.reviewCount} reviews)</span>
            </div>

            {/* Units Sold & Minimum Order */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#8CB89C]/5 rounded-lg p-3">
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-0.5">
                  <ShoppingCart className="w-3.5 h-3.5" />
                  Units Sold
                </div>
                <p className="text-lg font-bold text-[#1B2A4A] tabular-nums">
                  {product.soldCount.toLocaleString()}
                </p>
              </div>
              <div className="bg-[#1B2A4A]/5 rounded-lg p-3">
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-0.5">
                  <Layers className="w-3.5 h-3.5" />
                  Minimum Order
                </div>
                <p className="text-lg font-bold text-[#1B2A4A] tabular-nums">
                  {product.minOrder} {product.minOrder === 1 ? 'unit' : 'units'}
                </p>
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Description
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Tags */}
            <div>
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Tags
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
              <button className="flex-1 inline-flex items-center justify-center gap-2 bg-[#8CB89C] hover:bg-[#729E82] text-white px-4 py-3 rounded-xl text-sm font-semibold transition-colors">
                <Pencil className="w-4 h-4" />
                Edit Product
              </button>
              <button className="inline-flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-semibold transition-colors">
                <Trash2 className="w-4 h-4" />
                Remove Listing
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* ══════════════════════════════════════════════════════════════════
          3. SALES ANALYTICS
      ═════════════════════════════════════════════════════════════════ */}
      <motion.div
        variants={cardVariants}
        className="bg-white rounded-xl border border-gray-100 p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-[#1B2A4A] text-sm flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#8CB89C]" />
            Sales Analytics (Last 6 Months)
          </h3>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-1 rounded-full bg-[#8CB89C]" />
              Revenue
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-1 rounded-full bg-[#D4A843]" />
              Units
            </span>
          </div>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={salesData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8CB89C" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8CB89C" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis
                yAxisId="revenue"
                orientation="left"
                tick={{ fontSize: 11, fill: '#9CA3AF' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => formatCompact(v)}
              />
              <YAxis
                yAxisId="units"
                orientation="right"
                tick={{ fontSize: 11, fill: '#9CA3AF' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                yAxisId="revenue"
                type="monotone"
                dataKey="revenue"
                stroke="#8CB89C"
                strokeWidth={2.5}
                name="Revenue"
                dot={{ fill: '#8CB89C', r: 4, strokeWidth: 0 }}
                activeDot={{ fill: '#8CB89C', r: 6, strokeWidth: 2, stroke: '#fff' }}
              />
              <Line
                yAxisId="units"
                type="monotone"
                dataKey="units"
                stroke="#D4A843"
                strokeWidth={2}
                name="Units"
                dot={{ fill: '#D4A843', r: 3, strokeWidth: 0 }}
                activeDot={{ fill: '#D4A843', r: 5, strokeWidth: 2, stroke: '#fff' }}
                strokeDasharray="5 5"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        {/* Summary Stats Row */}
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100">
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-0.5">Total Revenue (6m)</p>
            <p className="text-lg font-bold text-[#1B2A4A] tabular-nums">
              {formatCompact(salesData.reduce((sum, d) => sum + d.revenue, 0))}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-0.5">Total Units (6m)</p>
            <p className="text-lg font-bold text-[#1B2A4A] tabular-nums">
              {salesData.reduce((sum, d) => sum + d.units, 0).toLocaleString()}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-0.5">Avg. Monthly Revenue</p>
            <p className="text-lg font-bold text-[#1B2A4A] tabular-nums">
              {formatCompact(Math.round(salesData.reduce((sum, d) => sum + d.revenue, 0) / salesData.length))}
            </p>
          </div>
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════════════════════════
          4. REVIEWS SECTION + DISCOUNT SETTINGS
      ═════════════════════════════════════════════════════════════════ */}
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* ── Reviews ────────────────────────────────────────────────── */}
        <motion.div
          variants={cardVariants}
          className="lg:col-span-2 bg-white rounded-xl border border-gray-100 overflow-hidden"
        >
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-[#1B2A4A] text-sm flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#8CB89C]" />
              Customer Reviews
            </h3>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, si) => (
                  <Star
                    key={si}
                    className={`w-3.5 h-3.5 ${
                      si < Math.floor(product.rating)
                        ? 'text-[#D4A843] fill-[#D4A843]'
                        : 'text-gray-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500 font-medium">{product.rating} avg</span>
            </div>
          </div>
          <div className="divide-y divide-gray-50">
            {mockReviews.map((review, i) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="p-5 hover:bg-[#8CB89C]/[0.01] transition-colors"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#1B2A4A]/10 flex items-center justify-center">
                      <User className="w-4 h-4 text-[#1B2A4A]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#1B2A4A]">{review.author}</p>
                      <p className="text-[10px] text-gray-400">{review.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Calendar className="w-3 h-3" />
                    {review.date}
                  </div>
                </div>
                {/* Stars */}
                <div className="flex items-center gap-1 mb-2">
                  {Array.from({ length: 5 }).map((_, si) => (
                    <Star
                      key={si}
                      className={`w-3.5 h-3.5 ${
                        si < review.rating
                          ? 'text-[#D4A843] fill-[#D4A843]'
                          : 'text-gray-200'
                      }`}
                    />
                  ))}
                </div>
                {/* Text */}
                <p className="text-sm text-gray-600 leading-relaxed mb-2">{review.text}</p>
                {/* Helpful */}
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <ThumbsUp className="w-3 h-3" />
                  <span>{review.helpful} found this helpful</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── Discount Settings Card ─────────────────────────────────── */}
        <motion.div variants={cardVariants} className="space-y-5">
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="font-semibold text-[#1B2A4A] text-sm flex items-center gap-2 mb-4">
              <BadgePercent className="w-4 h-4 text-[#8CB89C]" />
              Discount Settings
            </h3>
            <div className="space-y-4">
              <div className="bg-[#8CB89C]/5 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">Current Member Discount</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-[#8CB89C]">{discountPercent}%</span>
                  <span className="text-sm text-gray-400">off retail</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Retail Price</span>
                  <span className="font-medium text-[#1B2A4A]">{formatCurrency(product.price)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Member Price</span>
                  <span className="font-bold text-[#8CB89C]">{formatCurrency(product.memberPrice)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Savings per Unit</span>
                  <span className="font-medium text-[#1B2A4A]">
                    {formatCurrency(product.price - product.memberPrice)}
                  </span>
                </div>
              </div>
              <button className="w-full inline-flex items-center justify-center gap-2 bg-[#1B2A4A]/5 hover:bg-[#1B2A4A]/10 text-[#1B2A4A] px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
                <Pencil className="w-3.5 h-3.5" />
                Edit Discount
              </button>
            </div>
          </div>

          {/* Quick Stats Card */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="font-semibold text-[#1B2A4A] text-sm mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Total Revenue</span>
                <span className="text-sm font-bold text-[#1B2A4A] tabular-nums">
                  {formatCompact(product.soldCount * product.memberPrice)}
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '78%' }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="h-1.5 rounded-full bg-[#8CB89C]"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Conversion Rate</span>
                <span className="text-sm font-bold text-[#1B2A4A]">4.2%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '42%' }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="h-1.5 rounded-full bg-[#D4A843]"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Repeat Buyers</span>
                <span className="text-sm font-bold text-[#1B2A4A]">67%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '67%' }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  className="h-1.5 rounded-full bg-[#1B2A4A]"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
