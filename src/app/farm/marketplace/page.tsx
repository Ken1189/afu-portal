'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ShoppingCart,
  Star,
  Plus,
  Minus,
  SlidersHorizontal,
  Package,
  ChevronDown,
  Sparkles,
  Tag,
  Leaf,
  Bug,
  Wrench,
  Droplets,
  Cpu,
  Box,
  Warehouse,
  Hammer,
  Filter,
  X,
} from 'lucide-react';
import { useProducts, type ProductRow } from '@/lib/supabase/use-products';

// ---------------------------------------------------------------------------
// Inlined types & data (previously from @/lib/data/supplierProducts)
// ---------------------------------------------------------------------------

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

const staticProducts: SupplierProduct[] = [
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
import { useCartStore } from '@/lib/stores/cartStore';
import { useLanguage } from '@/lib/i18n/LanguageContext';

// Bridge function: convert Supabase ProductRow to the SupplierProduct shape the UI expects
function dbToSupplierProduct(p: ProductRow): SupplierProduct {
  return {
    id: p.id,
    name: p.name,
    description: p.description || '',
    category: p.category === 'input-supplier' ? 'seeds' :
              p.category === 'equipment' ? 'equipment' :
              p.category === 'logistics' ? 'logistics' :
              p.category === 'processing' ? 'processing' :
              p.category === 'technology' ? 'technology' :
              p.category === 'financial-services' ? 'finance' : 'other',
    subcategory: (p.tags?.[0] || p.category) as string,
    price: p.price,
    memberPrice: p.member_price || p.price,
    discount: p.discount_percent,
    currency: p.currency || 'USD',
    unit: p.unit || 'unit',
    image: p.image_url || 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=300&fit=crop',
    supplier: p.supplier?.company_name || 'Unknown Supplier',
    supplierVerified: p.supplier?.verified || false,
    inStock: p.in_stock,
    rating: p.rating || 0,
    reviewCount: p.review_count || 0,
    featured: p.featured,
    tags: p.tags || [],
  } as unknown as SupplierProduct;
}

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      ease: 'easeOut' as const,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 12 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 260,
      damping: 22,
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
      stiffness: 260,
      damping: 24,
    },
  },
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

type CategoryKey = 'all' | SupplierProduct['category'];

interface CategoryOption {
  key: CategoryKey;
  label: string;
  icon: React.ReactNode;
}

const categories: CategoryOption[] = [
  { key: 'all', label: 'All', icon: <Package size={14} /> },
  { key: 'seeds', label: 'Seeds', icon: <Leaf size={14} /> },
  { key: 'fertilizer', label: 'Fertilizer', icon: <Sparkles size={14} /> },
  { key: 'pesticides', label: 'Pesticides', icon: <Bug size={14} /> },
  { key: 'equipment', label: 'Equipment', icon: <Wrench size={14} /> },
  { key: 'irrigation', label: 'Irrigation', icon: <Droplets size={14} /> },
  { key: 'technology', label: 'Technology', icon: <Cpu size={14} /> },
  { key: 'packaging', label: 'Packaging', icon: <Box size={14} /> },
  { key: 'storage', label: 'Storage', icon: <Warehouse size={14} /> },
  { key: 'tools', label: 'Tools', icon: <Hammer size={14} /> },
];

type SortKey = 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'popular';

const sortOptions: { key: SortKey; label: string }[] = [
  { key: 'featured', label: 'Featured' },
  { key: 'price-asc', label: 'Price: Low to High' },
  { key: 'price-desc', label: 'Price: High to Low' },
  { key: 'rating', label: 'Best Rated' },
  { key: 'popular', label: 'Most Popular' },
];

const availabilityConfig: Record<
  SupplierProduct['availability'],
  { bg: string; text: string; label: string }
> = {
  'in-stock': { bg: 'bg-green-100', text: 'text-green-700', label: 'In Stock' },
  limited: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Limited' },
  'pre-order': { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Pre-Order' },
  'out-of-stock': { bg: 'bg-red-100', text: 'text-red-700', label: 'Out of Stock' },
};

const categoryColors: Record<string, string> = {
  seeds: 'bg-green-100 text-green-700',
  fertilizer: 'bg-amber-100 text-amber-700',
  pesticides: 'bg-red-100 text-red-700',
  equipment: 'bg-blue-100 text-blue-700',
  irrigation: 'bg-cyan-100 text-cyan-700',
  technology: 'bg-purple-100 text-purple-700',
  packaging: 'bg-orange-100 text-orange-700',
  storage: 'bg-gray-200 text-gray-700',
  tools: 'bg-indigo-100 text-indigo-700',
};

const categoryGradients: Record<string, string> = {
  seeds: 'from-green-400 to-emerald-600',
  fertilizer: 'from-amber-400 to-orange-600',
  pesticides: 'from-red-400 to-rose-600',
  equipment: 'from-blue-400 to-indigo-600',
  irrigation: 'from-cyan-400 to-teal-600',
  technology: 'from-purple-400 to-violet-600',
  packaging: 'from-orange-400 to-amber-600',
  storage: 'from-gray-400 to-slate-600',
  tools: 'from-indigo-400 to-blue-600',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function sortProducts(products: SupplierProduct[], sortKey: SortKey): SupplierProduct[] {
  const sorted = [...products];
  switch (sortKey) {
    case 'featured':
      return sorted.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    case 'price-asc':
      return sorted.sort((a, b) => a.memberPrice - b.memberPrice);
    case 'price-desc':
      return sorted.sort((a, b) => b.memberPrice - a.memberPrice);
    case 'rating':
      return sorted.sort((a, b) => b.rating - a.rating);
    case 'popular':
      return sorted.sort((a, b) => b.soldCount - a.soldCount);
    default:
      return sorted;
  }
}

function getSavingsPercent(original: number, member: number): number {
  return Math.round(((original - member) / original) * 100);
}

// ---------------------------------------------------------------------------
// Product Card Sub-Component
// ---------------------------------------------------------------------------

function ProductCard({ product }: { product: SupplierProduct }) {
  const { addItem } = useCartStore();
  const [quantity, setQuantity] = useState(product.minOrder);
  const [added, setAdded] = useState(false);

  const availability = availabilityConfig[product.availability];
  const savingsPct = getSavingsPercent(product.price, product.memberPrice);
  const gradient = categoryGradients[product.category] || 'from-gray-400 to-gray-600';
  const catColor = categoryColors[product.category] || 'bg-gray-100 text-gray-600';

  const handleAdd = () => {
    if (product.availability === 'out-of-stock') return;
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <motion.div
      variants={cardVariants}
      className="rounded-2xl bg-white border border-gray-100 overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Image area */}
      <div className={`relative h-40 bg-gradient-to-br ${gradient}`}>
        {/* Decorative circles */}
        <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/10 rounded-full" />
        <div className="absolute bottom-2 right-2 w-10 h-10 bg-white/10 rounded-full" />

        {/* Category icon in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
            <Package size={28} className="text-white" />
          </div>
        </div>

        {/* Category badge - top left */}
        <div className="absolute top-2.5 left-2.5">
          <span
            className={`text-[10px] font-semibold px-2 py-1 rounded-full capitalize ${catColor}`}
          >
            {product.category}
          </span>
        </div>

        {/* Availability badge - top right */}
        <div className="absolute top-2.5 right-2.5">
          <span
            className={`text-[10px] font-semibold px-2 py-1 rounded-full ${availability.bg} ${availability.text}`}
          >
            {availability.label}
          </span>
        </div>

        {/* Featured badge */}
        {product.featured && (
          <div className="absolute bottom-2.5 left-2.5">
            <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-gold/90 text-white flex items-center gap-1">
              <Sparkles size={10} />
              Featured
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3.5 flex flex-col flex-1">
        {/* Product name */}
        <h3 className="text-sm font-bold text-navy leading-tight line-clamp-2 min-h-[2.5rem]">
          {product.name}
        </h3>

        {/* Supplier */}
        <p className="text-[11px] text-gray-400 mt-1 truncate">{product.supplierName}</p>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mt-2">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={12}
                className={
                  i < Math.floor(product.rating)
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-gray-200 fill-gray-200'
                }
              />
            ))}
          </div>
          <span className="text-[11px] text-gray-500 font-medium">{product.rating}</span>
          <span className="text-[10px] text-gray-400">({product.reviewCount})</span>
        </div>

        {/* Pricing */}
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-xs text-gray-400 line-through">${product.price.toFixed(2)}</span>
          <span className="text-base font-bold text-teal">${product.memberPrice.toFixed(2)}</span>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-green-100 text-green-700">
            -{savingsPct}%
          </span>
        </div>

        {/* Unit & Min order */}
        <p className="text-[11px] text-gray-400 mt-1">
          {product.unit} &middot; Min order: {product.minOrder}
        </p>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Quantity + Add to Cart */}
        <div className="mt-3 flex items-center gap-2">
          {/* Quantity selector */}
          <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
            <button
              onClick={() => setQuantity(Math.max(product.minOrder, quantity - 1))}
              className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 active:bg-gray-100 transition-colors"
            >
              <Minus size={14} />
            </button>
            <span className="w-8 h-8 flex items-center justify-center text-xs font-bold text-navy border-x border-gray-200">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 active:bg-gray-100 transition-colors"
            >
              <Plus size={14} />
            </button>
          </div>

          {/* Add to Cart button */}
          <button
            onClick={handleAdd}
            disabled={product.availability === 'out-of-stock'}
            className={`flex-1 h-9 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all min-h-[36px] ${
              added
                ? 'bg-green-500 text-white'
                : product.availability === 'out-of-stock'
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-teal text-white hover:bg-teal-dark active:scale-[0.97]'
            }`}
          >
            {added ? (
              <>
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="inline-flex"
                >
                  Added!
                </motion.span>
              </>
            ) : product.availability === 'out-of-stock' ? (
              'Unavailable'
            ) : (
              <>
                <ShoppingCart size={14} />
                Add to Cart
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main Page Component
// ---------------------------------------------------------------------------

export default function MarketplacePage() {
  useLanguage(); // keeps the language context active

  const { products: dbProducts, loading: productsLoading } = useProducts();
  const { getItemCount } = useCartStore();
  const cartCount = useCartStore((state) => state.items.reduce((s, i) => s + i.quantity, 0));

  // Use live products from Supabase if available, fallback to static
  const supplierProducts = dbProducts.length > 0
    ? dbProducts.map(dbToSupplierProduct)
    : staticProducts;

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>('all');
  const [sortKey, setSortKey] = useState<SortKey>('featured');
  const [showSort, setShowSort] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Filtered & sorted products
  const filteredProducts = useMemo(() => {
    let products = [...supplierProducts];

    // Category filter
    if (selectedCategory !== 'all') {
      products = products.filter((p) => p.category === selectedCategory);
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.supplierName.toLowerCase().includes(q) ||
          p.tags.some((tag) => tag.toLowerCase().includes(q)) ||
          p.category.toLowerCase().includes(q)
      );
    }

    // Sort
    return sortProducts(products, sortKey);
  }, [searchQuery, selectedCategory, sortKey]);

  const activeSortLabel = sortOptions.find((o) => o.key === sortKey)?.label || 'Featured';

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4 py-4"
    >
      {/* ================================================================= */}
      {/* HEADER                                                            */}
      {/* ================================================================= */}
      <motion.section variants={itemVariants} className="px-4 lg:px-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-navy leading-tight">Farm Marketplace</h1>
            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
              Browse agricultural supplies at member-discounted prices
            </p>
          </div>

          {/* Cart icon */}
          <Link
            href="/farm/marketplace/cart"
            className="relative shrink-0 w-11 h-11 flex items-center justify-center rounded-xl bg-teal/10 text-teal hover:bg-teal/20 active:scale-95 transition-all"
          >
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-5 h-5 bg-gold text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm"
              >
                {cartCount > 99 ? '99+' : cartCount}
              </motion.span>
            )}
          </Link>
        </div>
      </motion.section>

      {/* ================================================================= */}
      {/* SEARCH BAR                                                        */}
      {/* ================================================================= */}
      <motion.section variants={itemVariants} className="px-4 lg:px-6">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products, suppliers, categories..."
            className="w-full h-11 pl-10 pr-10 rounded-xl border border-gray-200 bg-white text-sm text-navy placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:bg-gray-200"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </motion.section>

      {/* ================================================================= */}
      {/* CATEGORY FILTER CHIPS                                             */}
      {/* ================================================================= */}
      <motion.section variants={itemVariants}>
        <div className="flex gap-2 overflow-x-auto px-4 lg:px-6 pb-1 scrollbar-hide snap-x snap-mandatory">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`shrink-0 snap-start flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all min-h-[36px] ${
                  isActive
                    ? 'bg-teal text-white shadow-sm shadow-teal/20'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 active:bg-gray-100'
                }`}
              >
                {cat.icon}
                {cat.label}
              </button>
            );
          })}
        </div>
      </motion.section>

      {/* ================================================================= */}
      {/* SORT & COUNT BAR                                                  */}
      {/* ================================================================= */}
      <motion.section variants={itemVariants} className="px-4 lg:px-6">
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">
            <span className="font-semibold text-navy">{filteredProducts.length}</span>{' '}
            {filteredProducts.length === 1 ? 'product' : 'products'} found
          </p>

          {/* Sort dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSort(!showSort)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <SlidersHorizontal size={13} />
              {activeSortLabel}
              <ChevronDown size={13} className={`transition-transform ${showSort ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showSort && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowSort(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50"
                  >
                    {sortOptions.map((opt) => (
                      <button
                        key={opt.key}
                        onClick={() => {
                          setSortKey(opt.key);
                          setShowSort(false);
                        }}
                        className={`w-full text-left px-3.5 py-2 text-xs transition-colors ${
                          sortKey === opt.key
                            ? 'bg-teal/10 text-teal font-semibold'
                            : 'text-gray-600 hover:bg-gray-50 active:bg-gray-100'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.section>

      {/* ================================================================= */}
      {/* PRODUCT GRID                                                      */}
      {/* ================================================================= */}
      {filteredProducts.length > 0 ? (
        <motion.section
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="px-4 lg:px-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </motion.section>
      ) : (
        /* ================================================================= */
        /* EMPTY STATE                                                       */
        /* ================================================================= */
        <motion.section variants={itemVariants} className="px-4 lg:px-6">
          <div className="rounded-2xl bg-white border border-gray-100 py-16 px-6 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <Search size={28} className="text-gray-400" />
            </div>
            <h3 className="text-base font-bold text-navy mb-1">No products found</h3>
            <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
              {searchQuery
                ? `No results for "${searchQuery}". Try a different search term or category.`
                : 'No products match the selected filters. Try adjusting your criteria.'}
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSortKey('featured');
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-teal text-white text-sm font-semibold hover:bg-teal-dark active:scale-[0.97] transition-all"
            >
              Clear Filters
            </button>
          </div>
        </motion.section>
      )}

      {/* ================================================================= */}
      {/* MEMBERSHIP BANNER                                                 */}
      {/* ================================================================= */}
      <motion.section variants={itemVariants} className="px-4 lg:px-6 pb-2">
        <div className="rounded-2xl bg-gradient-to-br from-navy to-navy-light p-5 text-white relative overflow-hidden">
          {/* Decorative */}
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/5 rounded-full" />
          <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/5 rounded-full" />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Tag size={16} className="text-gold" />
              <span className="text-xs font-bold text-white/80 uppercase tracking-wide">
                AFU Member Pricing
              </span>
            </div>
            <p className="text-sm leading-relaxed text-white/90">
              Enjoy exclusive discounts of 8-15% on all agricultural supplies as an AFU member.
              Savings are applied automatically at checkout.
            </p>
            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center gap-1.5 text-xs text-white/70">
                <Sparkles size={12} className="text-gold" />
                <span>Up to 15% off</span>
              </div>
              <span className="text-white/30">|</span>
              <div className="flex items-center gap-1.5 text-xs text-white/70">
                <Package size={12} />
                <span>{supplierProducts.length} products</span>
              </div>
              <span className="text-white/30">|</span>
              <div className="flex items-center gap-1.5 text-xs text-white/70">
                <ShoppingCart size={12} />
                <span>Bulk orders welcome</span>
              </div>
            </div>
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
}
