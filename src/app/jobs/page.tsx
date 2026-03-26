'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  MapPin,
  Clock,
  Users,
  Search,
  Filter,
  ChevronRight,
  Wheat,
  Tractor,
  TreePine,
  Egg,
  Beef,
  Factory,
  Sprout,
  ArrowRight,
  Building2,
  Code2,
  Shield,
  Scale,
  TrendingUp,
  HeartHandshake,
  Globe,
  Landmark,
  BarChart3,
  Megaphone,
  Headphones,
  Link2,
  Leaf,
  Banknote,
  UserCheck,
  Warehouse,
  Truck,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

/* ─── Types ─── */

interface JobListing {
  id: string;
  title: string;
  sector: string;
  country: string;
  region: string | null;
  job_type: string;
  pay_rate: string | null;
  pay_type: string | null;
  duration?: string | null;          // fallback field
  duration_description?: string | null; // DB field
  workers_needed: number | null;
  farm_name: string | null;
  description: string | null;
  status: string;
  created_at: string;
}

/* ─── Fallback seed data ─── */

const FALLBACK_JOBS: JobListing[] = [
  // ── C-Suite ──
  { id: 'afu-1', title: 'Chief Financial Officer (CFO)', sector: 'Executive', country: 'Remote', region: 'Harare, Zimbabwe', job_type: 'Full-time', pay_rate: 'Competitive + Equity', pay_type: 'annual', duration: 'Permanent', workers_needed: 1, farm_name: 'AFU HQ', description: 'Build and lead financial operations across 10 African countries. Manage $500M seed deployment, treasury operations, multi-currency mobile money, and investor-grade reporting. Experience with agricultural finance and African markets required.', status: 'open', created_at: '2026-03-20T00:00:00Z' },
  { id: 'afu-2', title: 'Chief Risk Officer (CRO)', sector: 'Executive', country: 'Remote', region: 'Harare, Zimbabwe', job_type: 'Full-time', pay_rate: 'Competitive + Equity', pay_type: 'annual', duration: 'Permanent', workers_needed: 1, farm_name: 'AFU HQ', description: 'Build credit risk models for smallholder lending, design parametric insurance products, and manage Lloyd\'s of London coverholder compliance. Bridge between traditional insurance and cutting-edge agritech.', status: 'open', created_at: '2026-03-20T00:00:00Z' },
  { id: 'afu-3', title: 'Chief Legal Officer (CLO)', sector: 'Executive', country: 'Remote', region: 'Mauritius / Netherlands', job_type: 'Full-time', pay_rate: 'Competitive + Equity', pay_type: 'annual', duration: 'Permanent', workers_needed: 1, farm_name: 'AFU HQ', description: 'Navigate multi-layered corporate structure: Netherlands Foundation, Mauritius Holdings, country cooperatives, Lloyd\'s coverholder, and trade finance contracts across 10 African jurisdictions.', status: 'open', created_at: '2026-03-20T00:00:00Z' },
  { id: 'afu-4', title: 'Chief Commercial Officer (CCO)', sector: 'Executive', country: 'Nairobi / Harare', region: null, job_type: 'Full-time', pay_rate: 'Competitive + Equity', pay_type: 'annual', duration: 'Permanent', workers_needed: 1, farm_name: 'AFU HQ', description: 'Build the buyer network, negotiate export contracts, manage commodity pricing, and run the trade desk. Ensure every farmer on the platform has a guaranteed offtake buyer.', status: 'open', created_at: '2026-03-20T00:00:00Z' },
  { id: 'afu-5', title: 'Chief People Officer (CPO)', sector: 'Executive', country: 'Remote', region: 'Travel across Africa', job_type: 'Full-time', pay_rate: 'Competitive + Equity', pay_type: 'annual', duration: 'Permanent', workers_needed: 1, farm_name: 'AFU HQ', description: 'Scale AFU from 2 people to 1,000+ across 10 African countries in 5 years. Build talent engine, establish competitive compensation across markets, and create the culture that makes AFU the employer of choice in African agritech.', status: 'open', created_at: '2026-03-20T00:00:00Z' },

  // ── Technology & Product ──
  { id: 'afu-6', title: 'VP Engineering', sector: 'Technology', country: 'Remote', region: null, job_type: 'Full-time', pay_rate: 'Competitive + Equity', pay_type: 'annual', duration: 'Permanent', workers_needed: 1, farm_name: 'AFU Technology', description: 'Lead and grow the engineering team from 2 to 25+ developers. Scale a 200+ page Next.js platform with 40+ database tables, AI integration, and mobile money APIs to handle millions of farmers across 10 countries.', status: 'open', created_at: '2026-03-19T00:00:00Z' },
  { id: 'afu-7', title: 'VP Product', sector: 'Technology', country: 'Remote', region: 'Periodic field visits to Africa', job_type: 'Full-time', pay_rate: 'Competitive + Equity', pay_type: 'annual', duration: 'Permanent', workers_needed: 1, farm_name: 'AFU Technology', description: 'Own the product roadmap across 5 portals serving illiterate smallholders to commercial farm managers. Design progressive disclosure (Seedling→Pioneer), multilingual UX, and offline-first mobile experiences.', status: 'open', created_at: '2026-03-19T00:00:00Z' },
  { id: 'afu-8', title: 'Director of Data & AI', sector: 'Technology', country: 'Remote', region: null, job_type: 'Full-time', pay_rate: 'Competitive + Equity', pay_type: 'annual', duration: 'Permanent', workers_needed: 1, farm_name: 'AFU Technology', description: 'Build credit scoring models using satellite and mobile money data, scale the AI crop doctor, develop yield prediction from satellite imagery, and create the multilingual farmer advisory chatbot.', status: 'open', created_at: '2026-03-19T00:00:00Z' },
  { id: 'afu-9', title: 'Director of Blockchain', sector: 'Technology', country: 'Remote', region: null, job_type: 'Full-time', pay_rate: 'Competitive + Equity', pay_type: 'annual', duration: 'Permanent', workers_needed: 1, farm_name: 'AFU Technology', description: 'Build the EDMA blockchain platform on Polygon: AFUSD stablecoin, RWA tokenization for farm assets, carbon credit trading, supply chain traceability, and smart contracts for automated insurance payouts.', status: 'open', created_at: '2026-03-19T00:00:00Z' },
  { id: 'afu-10', title: 'Director of InfoSec', sector: 'Technology', country: 'Remote', region: null, job_type: 'Full-time', pay_rate: 'Competitive + Equity', pay_type: 'annual', duration: 'Permanent', workers_needed: 1, farm_name: 'AFU Technology', description: 'Build the information security program across sensitive financial data, farmer PII, and payment transactions in 10 countries. SOC 2, ISO 27001, GDPR, POPIA, and PCI-DSS compliance.', status: 'open', created_at: '2026-03-19T00:00:00Z' },

  // ── Operations ──
  { id: 'afu-11', title: 'VP Operations', sector: 'Operations', country: 'Harare, Zimbabwe', region: 'Travel across Africa', job_type: 'Full-time', pay_rate: 'Competitive + Equity', pay_type: 'annual', duration: 'Permanent', workers_needed: 1, farm_name: 'AFU Operations', description: 'Build the operational machine across 10 African countries: farming operations, lending, insurance, trade finance, and supply chain all running simultaneously. Scale from 2 to 10 countries within 36 months.', status: 'open', created_at: '2026-03-18T00:00:00Z' },
  { id: 'afu-12', title: 'Director of Supply Chain', sector: 'Operations', country: 'Harare, Zimbabwe', region: 'Travel across Africa', job_type: 'Full-time', pay_rate: 'Competitive + Equity', pay_type: 'annual', duration: 'Permanent', workers_needed: 1, farm_name: 'AFU Operations', description: 'Build supplier networks for farming inputs across 10 countries. Manage equipment procurement, cold chain for perishable exports, warehouse receipt systems, and last-mile delivery to smallholder farmers.', status: 'open', created_at: '2026-03-18T00:00:00Z' },
  { id: 'afu-13', title: 'Director of Farmer Success', sector: 'Operations', country: 'Harare, Zimbabwe', region: 'Travel across Africa', job_type: 'Full-time', pay_rate: 'Competitive + Equity', pay_type: 'annual', duration: 'Permanent', workers_needed: 1, farm_name: 'AFU Operations', description: 'Design the farmer onboarding journey, build training programs for the Seedling→Pioneer progression, establish multilingual support operations, and track farmer outcomes across yield, income, and satisfaction.', status: 'open', created_at: '2026-03-18T00:00:00Z' },

  // ── Commercial ──
  { id: 'afu-14', title: 'VP Business Development', sector: 'Commercial', country: 'Nairobi / Johannesburg', region: 'Extensive travel', job_type: 'Full-time', pay_rate: 'Competitive + Equity', pay_type: 'annual', duration: 'Permanent', workers_needed: 1, farm_name: 'AFU Commercial', description: 'Open doors: government MOUs, DFI partnerships (IFC, AfDB, CDC), institutional investor relationships, Lloyd\'s syndicates, and strategic alliances. Lead market entry for new countries.', status: 'open', created_at: '2026-03-18T00:00:00Z' },
  { id: 'afu-15', title: 'Director of Trade Finance', sector: 'Finance', country: 'Remote', region: 'Mauritius', job_type: 'Full-time', pay_rate: 'Competitive + Equity', pay_type: 'annual', duration: 'Permanent', workers_needed: 1, farm_name: 'AFU Finance', description: 'Manage SBLC origination, Letters of Credit processing, banking partner coordination, FX operations, export pre-financing, and warehouse receipt financing for agricultural commodity exports.', status: 'open', created_at: '2026-03-18T00:00:00Z' },
  { id: 'afu-16', title: 'Senior Commodity Trader', sector: 'Commercial', country: 'Nairobi / Johannesburg', region: 'Extensive travel', job_type: 'Full-time', pay_rate: 'Competitive + Performance Bonus + Equity', pay_type: 'annual', duration: 'Permanent', workers_needed: 1, farm_name: 'AFU Trade Desk', description: 'Trade physical agricultural commodities from 10 African countries into global markets. Manage positions in maize, soya, blueberries, macadamia, cashew, cocoa, coffee. Execute spot and forward contracts, hedge price risk, and build the counterparty network.', status: 'open', created_at: '2026-03-18T00:00:00Z' },

  // ── Regional Directors ──
  { id: 'afu-17', title: 'Regional Director — Southern Africa', sector: 'Regional', country: 'Zimbabwe', region: 'Harare', job_type: 'Full-time', pay_rate: 'Competitive + Equity', pay_type: 'annual', duration: 'Permanent', workers_needed: 1, farm_name: 'AFU Southern Africa', description: 'Oversee Zimbabwe, Botswana, Mozambique, and Zambia. Own the regional P&L, ensure the Zimbabwe pilot succeeds as the template for all countries, and build cross-border trade operations within SADC.', status: 'open', created_at: '2026-03-17T00:00:00Z' },
  { id: 'afu-18', title: 'Regional Director — East Africa', sector: 'Regional', country: 'Kenya', region: 'Nairobi', job_type: 'Full-time', pay_rate: 'Competitive + Equity', pay_type: 'annual', duration: 'Permanent', workers_needed: 1, farm_name: 'AFU East Africa', description: 'Oversee Uganda, Kenya, and Tanzania. Launch Uganda with 19,000 pre-identified farmers, leverage Kenya\'s fintech ecosystem, and scale to 100,000+ farmers within 3 years across the EAC.', status: 'open', created_at: '2026-03-17T00:00:00Z' },
  { id: 'afu-19', title: 'Regional Director — West Africa', sector: 'Regional', country: 'Ghana', region: 'Accra', job_type: 'Full-time', pay_rate: 'Competitive + Equity', pay_type: 'annual', duration: 'Permanent', workers_needed: 1, farm_name: 'AFU West Africa', description: 'Oversee Ghana, Nigeria, and Senegal — AFU\'s largest total addressable market (40M+ farmers in Nigeria alone). Navigate anglophone and francophone markets, cocoa and cashew value chains.', status: 'open', created_at: '2026-03-17T00:00:00Z' },

  // ── Country Directors ──
  { id: 'afu-20', title: 'Country Director — Zimbabwe (Pilot)', sector: 'Country', country: 'Zimbabwe', region: 'Harare', job_type: 'Full-time', pay_rate: 'Competitive + Performance Bonus + Equity', pay_type: 'annual', duration: 'Permanent', workers_needed: 1, farm_name: 'AFU Zimbabwe', description: 'The most important Country Director role. Launch the Watson & Fine blueberry export program, onboard the first 5,000 smallholder farmers, register the cooperative, and build the proof-of-concept that unlocks the next $450M+ in deployment.', status: 'open', created_at: '2026-03-16T00:00:00Z' },
  { id: 'afu-21', title: 'Country Director — Uganda', sector: 'Country', country: 'Uganda', region: 'Kampala', job_type: 'Full-time', pay_rate: 'Competitive + Performance Bonus', pay_type: 'annual', duration: 'Permanent', workers_needed: 1, farm_name: 'AFU Uganda', description: 'Launch Uganda operations with 19,000 pre-identified farmers. Build the team, register the cooperative, establish MTN MoMo/Airtel Money operations, and scale coffee, maize, and banana value chains.', status: 'open', created_at: '2026-03-16T00:00:00Z' },

  // ── Country Management ──
  { id: 'afu-22', title: 'Country Operations Manager', sector: 'Country', country: 'Multiple Countries', region: 'Various', job_type: 'Full-time', pay_rate: 'Competitive + Performance Bonus', pay_type: 'annual', duration: 'Permanent', workers_needed: 10, farm_name: 'AFU Country Ops', description: 'Manage day-to-day operations in-country: farmer onboarding, input distribution, crop collection, field team supervision, and logistics coordination. You are the engine that makes a country run.', status: 'open', created_at: '2026-03-15T00:00:00Z' },
  { id: 'afu-23', title: 'Country Finance Manager', sector: 'Finance', country: 'Multiple Countries', region: 'Various', job_type: 'Full-time', pay_rate: 'Competitive + Performance Bonus', pay_type: 'annual', duration: 'Permanent', workers_needed: 10, farm_name: 'AFU Country Finance', description: 'Manage loan disbursements, collections, mobile money operations, insurance premium collections, and financial reporting at the country level. Experience with microfinance or agricultural lending in Africa required.', status: 'open', created_at: '2026-03-15T00:00:00Z' },
  { id: 'afu-24', title: 'Country Agronomist Lead', sector: 'Agronomy', country: 'Multiple Countries', region: 'Various', job_type: 'Full-time', pay_rate: 'Competitive + Performance Bonus', pay_type: 'annual', duration: 'Permanent', workers_needed: 10, farm_name: 'AFU Agronomy', description: 'The agricultural brain of the country operation. Assess farms, advise farmers, train extension workers, ensure export quality standards (GlobalGAP, HACCP), and provide technical input for credit and insurance decisions.', status: 'open', created_at: '2026-03-15T00:00:00Z' },
  { id: 'afu-25', title: 'Country Commercial Manager', sector: 'Commercial', country: 'Multiple Countries', region: 'Various', job_type: 'Full-time', pay_rate: 'Competitive + Performance Bonus', pay_type: 'annual', duration: 'Permanent', workers_needed: 10, farm_name: 'AFU Country Commercial', description: 'Find the buyers, negotiate prices, ensure every farmer\'s harvest has a home. Build local buyer relationships, negotiate offtake agreements with guaranteed minimum prices, and manage the AFU Fresh marketplace.', status: 'open', created_at: '2026-03-15T00:00:00Z' },
  { id: 'afu-26', title: 'Country Insurance Officer', sector: 'Insurance', country: 'Multiple Countries', region: 'Various', job_type: 'Full-time', pay_rate: 'Competitive + Performance Bonus', pay_type: 'annual', duration: 'Permanent', workers_needed: 10, farm_name: 'AFU Insurance', description: 'Manage crop insurance sales, process claims, conduct farm assessments, monitor weather data for parametric triggers, and prepare Lloyd\'s coverholder reports. Protect farmers from the risks that can wipe out a season.', status: 'open', created_at: '2026-03-15T00:00:00Z' },
  { id: 'afu-27', title: 'Country Compliance Officer', sector: 'Legal', country: 'Multiple Countries', region: 'Various', job_type: 'Full-time', pay_rate: 'Competitive + Performance Bonus', pay_type: 'annual', duration: 'Permanent', workers_needed: 10, farm_name: 'AFU Compliance', description: 'Manage KYC/AML compliance, cooperative governance, regulatory filings, data protection, and audit preparation at the country level. Ensure AFU operates legally and ethically in every market.', status: 'open', created_at: '2026-03-15T00:00:00Z' },
  { id: 'afu-28', title: 'Country Ambassador Coordinator', sector: 'Community', country: 'Multiple Countries', region: 'Various', job_type: 'Full-time', pay_rate: 'Competitive + Performance Bonus', pay_type: 'annual', duration: 'Permanent', workers_needed: 10, farm_name: 'AFU Community', description: 'Recruit, train, and manage a network of local ambassadors who sign up farmers, provide basic support, and build trust in communities. Manage compensation, events, and community engagement programs.', status: 'open', created_at: '2026-03-15T00:00:00Z' },

  // ── Field Operations ──
  { id: 'afu-29', title: 'Field Agronomist', sector: 'Agronomy', country: 'Multiple Countries', region: 'Rural locations', job_type: 'Full-time', pay_rate: 'Competitive + Performance Bonus', pay_type: 'annual', duration: 'Permanent', workers_needed: 100, farm_name: 'AFU Field Operations', description: 'On the ground with farmers every day. Visit farms, test soil, advise on crops, monitor for disease, deliver training, and use the AFU mobile app to record data. Motorcycle licence required.', status: 'open', created_at: '2026-03-14T00:00:00Z' },
  { id: 'afu-30', title: 'Loan Officer', sector: 'Finance', country: 'Multiple Countries', region: 'Various', job_type: 'Full-time', pay_rate: 'Competitive + Performance Bonus', pay_type: 'annual', duration: 'Permanent', workers_needed: 50, farm_name: 'AFU Field Operations', description: 'Assess farmers for creditworthiness, verify character references, monitor loan usage, and manage collections. In the African context, community reputation matters as much as financials. Integrity is non-negotiable.', status: 'open', created_at: '2026-03-14T00:00:00Z' },
  { id: 'afu-31', title: 'Warehouse Manager', sector: 'Operations', country: 'Multiple Countries', region: 'Processing hub locations', job_type: 'Full-time', pay_rate: 'Competitive + Performance Bonus', pay_type: 'annual', duration: 'Permanent', workers_needed: 20, farm_name: 'AFU Processing', description: 'Manage receiving, grading, weighing, and storage of agricultural commodities. Warehouse receipt finance means your inventory records are financial instruments — accuracy is everything. Cold chain experience preferred.', status: 'open', created_at: '2026-03-14T00:00:00Z' },

  // ── Central HQ ──
  { id: 'afu-32', title: 'Marketing & Communications Lead', sector: 'Marketing', country: 'Remote', region: 'Travel to Africa', job_type: 'Full-time', pay_rate: 'Competitive + Equity', pay_type: 'annual', duration: 'Permanent', workers_needed: 1, farm_name: 'AFU HQ', description: 'Build the AFU brand: investor materials, farmer-facing campaigns in multiple languages, social media, PR, and partnership co-branding with Lloyd\'s, our banking partners, and government partners.', status: 'open', created_at: '2026-03-13T00:00:00Z' },
  { id: 'afu-33', title: 'Customer Support Lead', sector: 'Operations', country: 'Remote', region: 'Harare, Zimbabwe', job_type: 'Full-time', pay_rate: 'Competitive + Performance Bonus', pay_type: 'annual', duration: 'Permanent', workers_needed: 1, farm_name: 'AFU HQ', description: 'Build the support function from scratch: multilingual phone, WhatsApp, in-app chat, and email support across 10 countries. Train the AI chatbot, track farmer satisfaction, and build the knowledge base.', status: 'open', created_at: '2026-03-13T00:00:00Z' },
];

/* ─── Constants ─── */

const SECTORS = ['All', 'Executive', 'Technology', 'Operations', 'Commercial', 'Finance', 'Regional', 'Country', 'Agronomy', 'Insurance', 'Legal', 'Community', 'Marketing'];
const JOB_TYPES = ['All', 'Full-time', 'Contract', 'Seasonal', 'Permanent'];

const SECTOR_COLORS: Record<string, string> = {
  Executive: 'bg-[#1B2A4A]/10 text-[#1B2A4A]',
  Technology: 'bg-blue-100 text-blue-700',
  Operations: 'bg-orange-100 text-orange-700',
  Commercial: 'bg-emerald-100 text-emerald-700',
  Finance: 'bg-green-100 text-green-700',
  Regional: 'bg-purple-100 text-purple-700',
  Country: 'bg-amber-100 text-amber-700',
  Agronomy: 'bg-lime-100 text-lime-700',
  Insurance: 'bg-cyan-100 text-cyan-700',
  Legal: 'bg-slate-100 text-slate-700',
  Community: 'bg-pink-100 text-pink-700',
  Marketing: 'bg-fuchsia-100 text-fuchsia-700',
  Livestock: 'bg-orange-100 text-orange-700',
  Horticulture: 'bg-emerald-100 text-emerald-700',
  Poultry: 'bg-yellow-100 text-yellow-700',
  Grains: 'bg-amber-100 text-amber-700',
  'Cash Crops': 'bg-green-100 text-green-700',
  Machinery: 'bg-blue-100 text-blue-700',
  Processing: 'bg-purple-100 text-purple-700',
};

const SECTOR_ICONS: Record<string, React.ReactNode> = {
  Executive: <Building2 className="w-4 h-4" />,
  Technology: <Code2 className="w-4 h-4" />,
  Operations: <Factory className="w-4 h-4" />,
  Commercial: <TrendingUp className="w-4 h-4" />,
  Finance: <Banknote className="w-4 h-4" />,
  Regional: <Globe className="w-4 h-4" />,
  Country: <Landmark className="w-4 h-4" />,
  Agronomy: <Leaf className="w-4 h-4" />,
  Insurance: <Shield className="w-4 h-4" />,
  Legal: <Scale className="w-4 h-4" />,
  Community: <HeartHandshake className="w-4 h-4" />,
  Marketing: <Megaphone className="w-4 h-4" />,
  Livestock: <Beef className="w-4 h-4" />,
  Horticulture: <TreePine className="w-4 h-4" />,
  Poultry: <Egg className="w-4 h-4" />,
  Grains: <Wheat className="w-4 h-4" />,
  'Cash Crops': <Sprout className="w-4 h-4" />,
  Machinery: <Tractor className="w-4 h-4" />,
  Processing: <Factory className="w-4 h-4" />,
};

/* ─── Component ─── */

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [sectorFilter, setSectorFilter] = useState('All');
  const [countryFilter, setCountryFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchJobs() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('job_listings')
          .select('*')
          .eq('status', 'open')
          .order('created_at', { ascending: false });

        if (error || !data || data.length === 0) {
          setJobs(FALLBACK_JOBS);
        } else {
          setJobs(data);
        }
      } catch {
        setJobs(FALLBACK_JOBS);
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
  }, []);

  const countries = useMemo(() => {
    const set = new Set(jobs.map((j) => j.country));
    return ['All', ...Array.from(set).sort()];
  }, [jobs]);

  const filtered = useMemo(() => {
    return jobs.filter((j) => {
      if (sectorFilter !== 'All' && j.sector !== sectorFilter) return false;
      if (countryFilter !== 'All' && j.country !== countryFilter) return false;
      if (typeFilter !== 'All' && j.job_type !== typeFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          j.title.toLowerCase().includes(q) ||
          j.farm_name?.toLowerCase().includes(q) ||
          j.description?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [jobs, sectorFilter, countryFilter, typeFilter, searchQuery]);

  const stats = useMemo(() => {
    const countriesSet = new Set(jobs.map((j) => j.country));
    const sectorsSet = new Set(jobs.map((j) => j.sector));
    return {
      total: jobs.length,
      countries: countriesSet.size,
      sectors: sectorsSet.size,
    };
  }, [jobs]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Hero ── */}
      <section
        className="relative py-20 px-4"
        style={{ background: 'linear-gradient(135deg, #1B2A4A 0%, #2A3F6A 100%)' }}
      >
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-white/80 text-sm font-medium mb-6">
            <Briefcase className="w-4 h-4" />
            Jobs Marketplace
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
            Careers at AFU
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Join the team building Africa&apos;s largest integrated agricultural platform — from C-suite to field operations across 10 countries
          </p>
        </div>
        {/* Decorative dots */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-32 h-32 rounded-full border-2 border-white" />
          <div className="absolute bottom-10 right-10 w-24 h-24 rounded-full border-2 border-white" />
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="max-w-7xl mx-auto px-4 -mt-8 relative z-10">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 grid grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-3xl font-bold" style={{ color: '#5DB347' }}>{stats.total}</p>
            <p className="text-sm text-gray-500 mt-1">Open Positions</p>
          </div>
          <div>
            <p className="text-3xl font-bold" style={{ color: '#1B2A4A' }}>{stats.countries}</p>
            <p className="text-sm text-gray-500 mt-1">Countries</p>
          </div>
          <div>
            <p className="text-3xl font-bold" style={{ color: '#8CB89C' }}>{stats.sectors}</p>
            <p className="text-sm text-gray-500 mt-1">Sectors</p>
          </div>
        </div>
      </section>

      {/* ── Filter Bar ── */}
      <section className="max-w-7xl mx-auto px-4 mt-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#5DB347] transition-colors"
            />
          </div>

          {/* Sector */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400 hidden md:block" />
            <select
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
              className="px-3 py-2.5 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:border-[#5DB347] transition-colors"
            >
              {SECTORS.map((s) => (
                <option key={s} value={s}>{s === 'All' ? 'All Sectors' : s}</option>
              ))}
            </select>
          </div>

          {/* Country */}
          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            className="px-3 py-2.5 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:border-[#5DB347] transition-colors"
          >
            {countries.map((c) => (
              <option key={c} value={c}>{c === 'All' ? 'All Countries' : c}</option>
            ))}
          </select>

          {/* Job Type */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2.5 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:border-[#5DB347] transition-colors"
          >
            {JOB_TYPES.map((t) => (
              <option key={t} value={t}>{t === 'All' ? 'All Types' : t}</option>
            ))}
          </select>
        </div>
      </section>

      {/* ── Job Cards Grid ── */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin w-8 h-8 border-2 border-[#5DB347] border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Loading jobs...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No jobs match your filters. Try broadening your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((job) => (
              <Link
                key={job.id}
                href={`/jobs/${job.id}`}
                className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden group"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${SECTOR_COLORS[job.sector] || 'bg-gray-100 text-gray-700'}`}>
                        {SECTOR_ICONS[job.sector]}
                        {job.sector}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#5DB347]/10 text-[#5DB347]">
                        {job.job_type}
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-[#1B2A4A] mb-2 group-hover:text-[#5DB347] transition-colors">
                    {job.title}
                  </h3>

                  {/* Details */}
                  <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      <span>{job.country}{job.region ? `, ${job.region}` : ''}</span>
                    </div>
                    {(job.duration_description || job.duration) && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span>{job.duration_description || job.duration}</span>
                      </div>
                    )}
                    {job.workers_needed && (
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-gray-400" />
                        <span>{job.workers_needed} worker{job.workers_needed !== 1 ? 's' : ''} needed</span>
                      </div>
                    )}
                  </div>

                  {/* Farm + CTA */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                    {job.farm_name && (
                      <span className="text-xs text-gray-400">{job.farm_name}</span>
                    )}
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#5DB347] group-hover:gap-2 transition-all">
                      Apply <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ── CTA ── */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        <div
          className="rounded-2xl p-10 text-center"
          style={{ background: 'linear-gradient(135deg, #5DB347 0%, #449933 100%)' }}
        >
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            Ready to Transform African Agriculture?
          </h2>
          <p className="text-white/80 mb-6 max-w-lg mx-auto">
            Join the ground floor of a $500M-backed agritech platform. Equity participation, cutting-edge technology, and direct impact on millions of farmers.
          </p>
          <Link
            href="/contact?subject=careers"
            className="inline-flex items-center gap-2 bg-white text-[#5DB347] px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
          >
            Apply Now <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
