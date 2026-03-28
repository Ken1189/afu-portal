'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/supabase/auth-context';
import { createClient } from '@/lib/supabase/client';
import {
  Globe,
  ArrowLeft,
  Users,
  Mail,
  Eye,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Package,
  Award,
  MapPin,
  Calendar,
  ChevronRight,
  BarChart3,
  Sun,
  Snowflake,
  CloudRain,
  Leaf,
  Building2,
  Phone,
  HandshakeIcon,
  Scale,
  Truck,
  ShieldCheck,
} from 'lucide-react';

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

type RelationshipStatus = 'active' | 'prospect' | 'negotiating';

interface Buyer {
  id: string;
  company: string;
  country: string;
  flag: string;
  products: string[];
  volumeCapacity: string;
  priceRange: string;
  paymentTerms: string;
  certifications: string[];
  status: RelationshipStatus;
  contactPerson: string;
  email: string;
}

interface PriceTrend {
  commodity: string;
  currentPrice: number;
  previousPrice: number;
  unit: string;
  change: number;
  bars: number[];
}

interface DemandForecast {
  region: string;
  commodity: string;
  trend: 'increasing' | 'stable' | 'decreasing';
  notes: string;
}

interface SeasonalWindow {
  product: string;
  peakMonths: string;
  markets: string;
  icon: React.ReactNode;
}

const EUROPE_BUYERS: Buyer[] = [
  {
    id: 'buyer-eu-001',
    company: 'Van der Berg Trading BV',
    country: 'Netherlands',
    flag: '🇳🇱',
    products: ['Tobacco', 'Spices', 'Sesame'],
    volumeCapacity: '5,000 tonnes/year',
    priceRange: '$1,800 - $6,000/tonne',
    paymentTerms: 'LC at sight / 30-day D/P',
    certifications: ['GlobalGAP', 'EU Organic'],
    status: 'active',
    contactPerson: 'Jan van der Berg',
    email: 'jan@vanderberg-trading.nl',
  },
  {
    id: 'buyer-eu-002',
    company: 'Hamburg Spice Importers GmbH',
    country: 'Germany',
    flag: '🇩🇪',
    products: ['Spices', 'Herbs'],
    volumeCapacity: '3,000 tonnes/year',
    priceRange: '$4,500 - $12,000/tonne',
    paymentTerms: '60-day D/P',
    certifications: ['EU Organic', 'HACCP', 'Fair Trade'],
    status: 'active',
    contactPerson: 'Klaus Mueller',
    email: 'k.mueller@hsi-gmbh.de',
  },
  {
    id: 'buyer-eu-003',
    company: 'FloraConnect International',
    country: 'Netherlands',
    flag: '🇳🇱',
    products: ['Cut Flowers', 'Ornamentals'],
    volumeCapacity: '2,000 tonnes/year',
    priceRange: '$8,000 - $15,000/tonne',
    paymentTerms: 'Wire transfer within 7 days of auction',
    certifications: ['GlobalGAP', 'MPS-A'],
    status: 'active',
    contactPerson: 'Pieter de Vries',
    email: 'pieter@floraconnect.nl',
  },
  {
    id: 'buyer-eu-004',
    company: 'British Leaf Tobacco Ltd',
    country: 'United Kingdom',
    flag: '🇬🇧',
    products: ['Tobacco'],
    volumeCapacity: '8,000 tonnes/year',
    priceRange: '$4,000 - $7,500/tonne',
    paymentTerms: 'LC at sight',
    certifications: ['ISO 22000', 'CORESTA GAP'],
    status: 'active',
    contactPerson: 'Andrew Smith',
    email: 'a.smith@britishleaf.co.uk',
  },
  {
    id: 'buyer-eu-005',
    company: 'Groupe Alimentaire du Sud SA',
    country: 'France',
    flag: '🇫🇷',
    products: ['Groundnuts', 'Sesame', 'Cashews'],
    volumeCapacity: '4,000 tonnes/year',
    priceRange: '$1,500 - $3,500/tonne',
    paymentTerms: '45-day D/P',
    certifications: ['GlobalGAP', 'IFS Food'],
    status: 'negotiating',
    contactPerson: 'Marie Dupont',
    email: 'm.dupont@gas-sa.fr',
  },
  {
    id: 'buyer-eu-006',
    company: 'Iberia Fresh Produce SL',
    country: 'Spain',
    flag: '🇪🇸',
    products: ['Citrus', 'Avocados', 'Mangoes'],
    volumeCapacity: '6,000 tonnes/year',
    priceRange: '$800 - $2,500/tonne',
    paymentTerms: '30-day wire transfer',
    certifications: ['GlobalGAP', 'GRASP'],
    status: 'prospect',
    contactPerson: 'Carlos Rodriguez',
    email: 'c.rodriguez@iberiafresh.es',
  },
];

const MIDDLE_EAST_ASIA_BUYERS: Buyer[] = [
  {
    id: 'buyer-mea-001',
    company: 'Al Rashid Foods Trading LLC',
    country: 'UAE',
    flag: '🇦🇪',
    products: ['Sesame', 'Groundnuts', 'Spices'],
    volumeCapacity: '10,000 tonnes/year',
    priceRange: '$1,800 - $5,000/tonne',
    paymentTerms: 'Irrevocable LC at sight',
    certifications: ['HACCP', 'Halal'],
    status: 'active',
    contactPerson: 'Ahmed Al Rashid',
    email: 'ahmed@alrashidfoods.ae',
  },
  {
    id: 'buyer-mea-002',
    company: 'Jeddah Agricultural Imports Co',
    country: 'Saudi Arabia',
    flag: '🇸🇦',
    products: ['Citrus', 'Vegetables', 'Groundnuts'],
    volumeCapacity: '8,000 tonnes/year',
    priceRange: '$700 - $3,000/tonne',
    paymentTerms: 'LC 30 days',
    certifications: ['Halal', 'SASO'],
    status: 'active',
    contactPerson: 'Mohammed Al-Harbi',
    email: 'm.alharbi@jai-co.sa',
  },
  {
    id: 'buyer-mea-003',
    company: 'Rajkot Agri Commodities Pvt Ltd',
    country: 'India',
    flag: '🇮🇳',
    products: ['Groundnuts', 'Sesame', 'Cashews'],
    volumeCapacity: '15,000 tonnes/year',
    priceRange: '$1,200 - $3,000/tonne',
    paymentTerms: 'LC 60 days / TT advance 30%',
    certifications: ['FSSAI', 'ISO 22000'],
    status: 'active',
    contactPerson: 'Vikram Patel',
    email: 'v.patel@rajkotagri.in',
  },
  {
    id: 'buyer-mea-004',
    company: 'Tokyo Spice & Herb Co Ltd',
    country: 'Japan',
    flag: '🇯🇵',
    products: ['Spices', 'Vanilla', 'Sesame'],
    volumeCapacity: '2,000 tonnes/year',
    priceRange: '$5,000 - $15,000/tonne',
    paymentTerms: 'LC at sight',
    certifications: ['JAS Organic', 'HACCP', 'ISO 22000'],
    status: 'negotiating',
    contactPerson: 'Takashi Yamamoto',
    email: 't.yamamoto@tokyospice.jp',
  },
];

const AFRICA_BUYERS: Buyer[] = [
  {
    id: 'buyer-af-001',
    company: 'Nairobi Fresh Exports Ltd',
    country: 'Kenya',
    flag: '🇰🇪',
    products: ['Cut Flowers', 'Vegetables', 'Herbs'],
    volumeCapacity: '3,000 tonnes/year',
    priceRange: '$2,000 - $8,000/tonne',
    paymentTerms: 'TT 50% advance, 50% on delivery',
    certifications: ['GlobalGAP', 'KS 1758'],
    status: 'active',
    contactPerson: 'Grace Wanjiku',
    email: 'g.wanjiku@nairobifresh.co.ke',
  },
  {
    id: 'buyer-af-002',
    company: 'Cape Town Commodity Traders Pty',
    country: 'South Africa',
    flag: '🇿🇦',
    products: ['Tobacco', 'Groundnuts', 'Maize'],
    volumeCapacity: '12,000 tonnes/year',
    priceRange: '$800 - $5,000/tonne',
    paymentTerms: '30-day wire transfer',
    certifications: ['PPECB', 'SABS'],
    status: 'active',
    contactPerson: 'Pieter van Niekerk',
    email: 'p.vanniekerk@ctctraders.co.za',
  },
  {
    id: 'buyer-af-003',
    company: 'Lagos Agro-Industries Plc',
    country: 'Nigeria',
    flag: '🇳🇬',
    products: ['Sesame', 'Cashews', 'Cocoa'],
    volumeCapacity: '7,000 tonnes/year',
    priceRange: '$1,500 - $4,000/tonne',
    paymentTerms: 'LC confirmed',
    certifications: ['NAFDAC', 'SON'],
    status: 'prospect',
    contactPerson: 'Chidi Okafor',
    email: 'c.okafor@lagosagroindustries.ng',
  },
  {
    id: 'buyer-af-004',
    company: 'Addis Ababa Trade Hub',
    country: 'Ethiopia',
    flag: '🇪🇹',
    products: ['Spices', 'Sesame', 'Pulses'],
    volumeCapacity: '5,000 tonnes/year',
    priceRange: '$1,000 - $3,500/tonne',
    paymentTerms: 'LC at sight',
    certifications: ['Ethiopian Standards', 'ECX'],
    status: 'prospect',
    contactPerson: 'Dawit Mekonnen',
    email: 'd.mekonnen@aatradehub.et',
  },
];

const PRICE_TRENDS: PriceTrend[] = [
  {
    commodity: 'Flue-Cured Tobacco',
    currentPrice: 6000,
    previousPrice: 5600,
    unit: '$/tonne',
    change: 7.1,
    bars: [55, 60, 58, 65, 70, 72, 68, 75, 78, 82, 85, 90],
  },
  {
    commodity: 'White Sesame (hulled)',
    currentPrice: 2800,
    previousPrice: 2950,
    unit: '$/tonne',
    change: -5.1,
    bars: [80, 78, 75, 72, 70, 68, 72, 65, 62, 60, 58, 55],
  },
  {
    commodity: 'Groundnuts (Grade A)',
    currentPrice: 3000,
    previousPrice: 2700,
    unit: '$/tonne',
    change: 11.1,
    bars: [45, 48, 50, 55, 60, 62, 65, 70, 72, 78, 82, 88],
  },
  {
    commodity: 'Cloves',
    currentPrice: 9000,
    previousPrice: 8500,
    unit: '$/tonne',
    change: 5.9,
    bars: [60, 58, 62, 65, 70, 68, 72, 75, 78, 80, 83, 85],
  },
  {
    commodity: 'Fresh Citrus',
    currentPrice: 1500,
    previousPrice: 1450,
    unit: '$/tonne',
    change: 3.4,
    bars: [50, 55, 58, 60, 62, 65, 60, 58, 62, 65, 68, 70],
  },
  {
    commodity: 'Cut Flowers (Roses)',
    currentPrice: 15000,
    previousPrice: 14200,
    unit: '$/tonne',
    change: 5.6,
    bars: [65, 70, 68, 72, 75, 78, 80, 82, 85, 88, 90, 92],
  },
];

const DEMAND_FORECASTS: DemandForecast[] = [
  { region: 'Europe', commodity: 'Organic Spices', trend: 'increasing', notes: 'EU organic market growing 8% year-on-year. Premium pricing for certified Zanzibar cloves.' },
  { region: 'Middle East', commodity: 'Sesame Seeds', trend: 'stable', notes: 'Consistent demand from tahini production. UAE remains top import destination.' },
  { region: 'India', commodity: 'Groundnuts', trend: 'increasing', notes: 'Peanut oil demand rising. Gujarat processors seeking African supplies after domestic shortfall.' },
  { region: 'Japan', commodity: 'Specialty Spices', trend: 'increasing', notes: 'Growing interest in African origin spices. Premium market willing to pay 20-30% above benchmark.' },
  { region: 'Europe', commodity: 'Fresh Flowers', trend: 'stable', notes: 'Dutch auction prices steady. Tanzania flowers gaining market share from Kenya.' },
  { region: 'Africa Regional', commodity: 'Maize & Grains', trend: 'decreasing', notes: 'Good harvests across SADC reducing import demand. Focus on value-added exports.' },
];

const SEASONAL_WINDOWS: SeasonalWindow[] = [
  { product: 'Tobacco', peakMonths: 'Feb - May', markets: 'EU, UK, Asia', icon: <Leaf className="w-4 h-4" /> },
  { product: 'Fresh Flowers', peakMonths: 'Oct - Mar', markets: 'Netherlands, UK', icon: <Sun className="w-4 h-4" /> },
  { product: 'Citrus Fruits', peakMonths: 'Apr - Sep', markets: 'Middle East, EU', icon: <Sun className="w-4 h-4" /> },
  { product: 'Spices (Cloves)', peakMonths: 'Aug - Dec', markets: 'EU, India, Japan', icon: <CloudRain className="w-4 h-4" /> },
  { product: 'Sesame Seeds', peakMonths: 'Nov - Mar', markets: 'UAE, Japan, China', icon: <Snowflake className="w-4 h-4" /> },
  { product: 'Groundnuts', peakMonths: 'Mar - Jun', markets: 'India, EU, China', icon: <Sun className="w-4 h-4" /> },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const RELATIONSHIP_STYLES: Record<RelationshipStatus, string> = {
  active: 'bg-green-50 text-green-700 border-green-200',
  prospect: 'bg-blue-50 text-blue-700 border-blue-200',
  negotiating: 'bg-amber-50 text-amber-700 border-amber-200',
};

const RELATIONSHIP_LABELS: Record<RelationshipStatus, string> = {
  active: 'Active',
  prospect: 'Prospect',
  negotiating: 'Negotiating',
};

function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString()}`;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function BuyerCard({ buyer }: { buyer: Buyer }) {
  const [showContact, setShowContact] = useState(false);

  return (
    <motion.div
      variants={cardVariants}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg">{buyer.flag}</span>
            <h3 className="text-sm font-bold text-[#1B2A4A]">
              {buyer.company}
            </h3>
          </div>
          <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {buyer.country}
          </p>
        </div>
        <span
          className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${RELATIONSHIP_STYLES[buyer.status]}`}
        >
          {RELATIONSHIP_LABELS[buyer.status]}
        </span>
      </div>

      {/* Products */}
      <div className="flex flex-wrap gap-1 mb-3">
        {buyer.products.map((product) => (
          <span
            key={product}
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#8CB89C]/10 text-[#8CB89C]"
          >
            {product}
          </span>
        ))}
      </div>

      {/* Details grid */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <Package className="w-3 h-3" /> Volume
          </span>
          <span className="text-xs font-semibold text-[#1B2A4A]">
            {buyer.volumeCapacity}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <DollarSign className="w-3 h-3" /> Price Range
          </span>
          <span className="text-xs font-semibold text-[#8CB89C]">
            {buyer.priceRange}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <Scale className="w-3 h-3" /> Payment
          </span>
          <span className="text-xs font-medium text-gray-600">
            {buyer.paymentTerms}
          </span>
        </div>
      </div>

      {/* Certifications */}
      <div className="flex flex-wrap gap-1 mb-4">
        {buyer.certifications.map((cert) => (
          <span
            key={cert}
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#D4A843]/10 text-[#D4A843] border border-[#D4A843]/20"
          >
            {cert}
          </span>
        ))}
      </div>

      {/* Contact info (expandable) */}
      <AnimatePresence>
        {showContact && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 100, damping: 15 }}
            className="overflow-hidden"
          >
            <div className="bg-gray-50 rounded-xl p-3 mb-3 space-y-1.5">
              <p className="text-xs text-gray-500 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-gray-400" />
                {buyer.contactPerson}
              </p>
              <p className="text-xs text-gray-500 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-gray-400" />
                {buyer.email}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowContact(!showContact)}
          className="flex items-center gap-1 text-xs font-semibold text-[#8CB89C] bg-[#8CB89C]/10 hover:bg-[#8CB89C]/20 px-3 py-1.5 rounded-lg transition-colors"
        >
          <Mail className="w-3.5 h-3.5" />
          {showContact ? 'Hide Contact' : 'Contact'}
        </button>
        <button className="flex items-center gap-1 text-xs font-semibold text-[#1B2A4A] bg-[#1B2A4A]/10 hover:bg-[#1B2A4A]/20 px-3 py-1.5 rounded-lg transition-colors">
          <Eye className="w-3.5 h-3.5" /> View Profile
        </button>
      </div>
    </motion.div>
  );
}

function PriceTrendCard({ trend }: { trend: PriceTrend }) {
  const isPositive = trend.change >= 0;
  const maxBar = Math.max(...trend.bars);

  return (
    <motion.div
      variants={cardVariants}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4"
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="text-sm font-bold text-[#1B2A4A]">
            {trend.commodity}
          </h3>
          <p className="text-lg font-bold text-[#8CB89C]">
            {formatCurrency(trend.currentPrice)}
            <span className="text-xs text-gray-400 font-normal ml-1">
              {trend.unit}
            </span>
          </p>
        </div>
        <span
          className={`text-xs font-bold flex items-center gap-0.5 px-2 py-1 rounded-lg ${
            isPositive
              ? 'text-green-700 bg-green-50'
              : 'text-red-600 bg-red-50'
          }`}
        >
          {isPositive ? (
            <TrendingUp className="w-3.5 h-3.5" />
          ) : (
            <TrendingDown className="w-3.5 h-3.5" />
          )}
          {isPositive ? '+' : ''}
          {trend.change.toFixed(1)}%
        </span>
      </div>

      {/* Bar chart */}
      <div className="flex items-end gap-0.5 h-12 mt-2">
        {trend.bars.map((bar, i) => (
          <div
            key={i}
            className={`flex-1 rounded-sm transition-all ${
              i === trend.bars.length - 1
                ? isPositive
                  ? 'bg-green-500'
                  : 'bg-red-400'
                : 'bg-gray-200'
            }`}
            style={{ height: `${(bar / maxBar) * 100}%` }}
          />
        ))}
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[9px] text-gray-300">12 months ago</span>
        <span className="text-[9px] text-gray-300">Now</span>
      </div>
    </motion.div>
  );
}

function RegionSection({
  title,
  icon,
  buyers,
  bgColor,
}: {
  title: string;
  icon: React.ReactNode;
  buyers: Buyer[];
  bgColor: string;
}) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <div className={`p-2 rounded-xl ${bgColor}`}>{icon}</div>
        <h2 className="text-lg font-bold text-[#1B2A4A]">{title}</h2>
        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
          {buyers.length} buyers
        </span>
      </div>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {buyers.map((buyer) => (
          <BuyerCard key={buyer.id} buyer={buyer} />
        ))}
      </motion.div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function ExportMarketsPage() {
  const { user } = useAuth();
  const [showIntelligence, setShowIntelligence] = useState(true);
  const [livePriceTrends, setLivePriceTrends] = useState<PriceTrend[]>(PRICE_TRENDS);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    const load = async () => {
      try {
        const { data } = await supabase
          .from('market_prices')
          .select('*')
          .order('date', { ascending: false })
          .limit(100);
        if (data && data.length > 0) {
          // Group by commodity and build trends
          const byCommodity: Record<string, any[]> = {};
          data.forEach((row: any) => {
            if (!byCommodity[row.commodity]) byCommodity[row.commodity] = [];
            byCommodity[row.commodity].push(row);
          });
          const trends: PriceTrend[] = Object.entries(byCommodity).slice(0, 6).map(([commodity, rows]) => {
            const sorted = rows.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
            const currentPrice = sorted[sorted.length - 1]?.price || 0;
            const previousPrice = sorted.length > 1 ? sorted[sorted.length - 2]?.price || currentPrice : currentPrice;
            const change = previousPrice > 0 ? ((currentPrice - previousPrice) / previousPrice) * 100 : 0;
            const bars = sorted.slice(-12).map((r: any) => r.price);
            return {
              commodity,
              currentPrice,
              previousPrice,
              unit: `${sorted[0]?.currency || '$'}/${sorted[0]?.unit || 'tonne'}`,
              change: Math.round(change * 10) / 10,
              bars: bars.length > 0 ? bars : [50],
            };
          });
          if (trends.length > 0) setLivePriceTrends(trends);
        }
      } catch { /* keep fallback */ }
      setDataLoading(false);
    };
    load();
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#D4A843] via-[#D4A843] to-[#1B2A4A]/30 text-white">
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
                <Globe className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold">
                  Export Markets
                </h1>
                <p className="text-white/70 text-sm">
                  International buyer connections and market intelligence
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
        {/* Market Overview: Regions */}
        <RegionSection
          title="Europe (EU)"
          icon={<Globe className="w-5 h-5 text-blue-600" />}
          buyers={EUROPE_BUYERS}
          bgColor="bg-blue-50"
        />

        <RegionSection
          title="Middle East & Asia"
          icon={<Globe className="w-5 h-5 text-[#D4A843]" />}
          buyers={MIDDLE_EAST_ASIA_BUYERS}
          bgColor="bg-[#D4A843]/10"
        />

        <RegionSection
          title="Africa (Regional)"
          icon={<Globe className="w-5 h-5 text-green-600" />}
          buyers={AFRICA_BUYERS}
          bgColor="bg-green-50"
        />

        {/* Market Intelligence Section */}
        <div className="mt-8">
          <button
            onClick={() => setShowIntelligence(!showIntelligence)}
            className="flex items-center gap-2 mb-4"
          >
            <div className="p-2 rounded-xl bg-[#1B2A4A]/10">
              <BarChart3 className="w-5 h-5 text-[#1B2A4A]" />
            </div>
            <h2 className="text-lg font-bold text-[#1B2A4A]">
              Market Intelligence
            </h2>
            <ChevronRight
              className={`w-4 h-4 text-gray-400 transition-transform ${
                showIntelligence ? 'rotate-90' : ''
              }`}
            />
          </button>

          <AnimatePresence>
            {showIntelligence && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 100, damping: 15 }}
                className="overflow-hidden"
              >
                {/* Price Trends */}
                <div className="mb-6">
                  <h3 className="text-sm font-bold text-[#1B2A4A] mb-3 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-[#8CB89C]" />
                    Price Trends by Commodity
                  </h3>
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                  >
                    {livePriceTrends.map((trend) => (
                      <PriceTrendCard
                        key={trend.commodity}
                        trend={trend}
                      />
                    ))}
                  </motion.div>
                </div>

                {/* Demand Forecasts */}
                <div className="mb-6">
                  <h3 className="text-sm font-bold text-[#1B2A4A] mb-3 flex items-center gap-1.5">
                    <BarChart3 className="w-4 h-4 text-[#D4A843]" />
                    Demand Forecasts
                  </h3>
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
                  >
                    {DEMAND_FORECASTS.map((forecast, i) => (
                      <motion.div
                        key={i}
                        variants={cardVariants}
                        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="text-sm font-bold text-[#1B2A4A]">
                              {forecast.commodity}
                            </h4>
                            <p className="text-xs text-gray-400">
                              {forecast.region}
                            </p>
                          </div>
                          <span
                            className={`text-xs font-bold flex items-center gap-0.5 px-2 py-1 rounded-lg ${
                              forecast.trend === 'increasing'
                                ? 'text-green-700 bg-green-50'
                                : forecast.trend === 'decreasing'
                                ? 'text-red-600 bg-red-50'
                                : 'text-gray-600 bg-gray-100'
                            }`}
                          >
                            {forecast.trend === 'increasing' ? (
                              <TrendingUp className="w-3.5 h-3.5" />
                            ) : forecast.trend === 'decreasing' ? (
                              <TrendingDown className="w-3.5 h-3.5" />
                            ) : (
                              <span className="w-3.5 text-center">&mdash;</span>
                            )}
                            {forecast.trend.charAt(0).toUpperCase() +
                              forecast.trend.slice(1)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          {forecast.notes}
                        </p>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>

                {/* Seasonal Windows */}
                <div>
                  <h3 className="text-sm font-bold text-[#1B2A4A] mb-3 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-green-600" />
                    Seasonal Export Windows
                  </h3>
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
                  >
                    {SEASONAL_WINDOWS.map((window, i) => (
                      <motion.div
                        key={i}
                        variants={cardVariants}
                        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-start gap-3"
                      >
                        <div className="p-2 rounded-xl bg-[#8CB89C]/10 text-[#8CB89C] shrink-0">
                          {window.icon}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-[#1B2A4A]">
                            {window.product}
                          </h4>
                          <p className="text-xs text-[#8CB89C] font-semibold">
                            {window.peakMonths}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            Markets: {window.markets}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
