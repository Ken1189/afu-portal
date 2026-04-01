'use client';

import { useState, useEffect, use, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Briefcase,
  MapPin,
  Clock,
  Users,
  Calendar,
  CheckCircle2,
  Share2,
  Home,
  Utensils,
  Car,
  ChevronRight,
  Copy,
  Check,
  Wheat,
  Tractor,
  TreePine,
  Egg,
  Beef,
  Factory,
  Sprout,
  Building2,
  Code2,
  Shield,
  Scale,
  TrendingUp,
  HeartHandshake,
  Globe,
  Landmark,
  Leaf,
  Banknote,
  Megaphone,
  DollarSign,
  X,
  Upload,
  Loader2,
  FileText,
  LogIn,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/supabase/auth-context';

/* ─── Types ─── */

interface JobDetail {
  id: string;
  title: string;
  sector: string;
  country: string;
  region?: string | null;
  location_detail?: string | null;
  job_type: string;
  pay_rate?: string | null;
  pay_type?: string | null;
  duration?: string | null;
  duration_description?: string | null;
  start_date?: string | null;
  workers_needed?: number | null;
  farm_name?: string | null;
  employer_name?: string | null;
  description?: string | null;
  requirements?: string | null;
  required_skills?: string[] | null;
  skills?: string[] | null;
  min_experience_years?: number | null;
  experience_years?: number | null;
  education_required?: string | null;
  education?: string | null;
  certifications_required?: string | null;
  certifications?: string[] | null;
  includes_housing?: boolean;
  includes_meals?: boolean;
  includes_transport?: boolean;
  housing_included?: boolean;
  meals_included?: boolean;
  transport_included?: boolean;
  status: string;
  created_at: string;
}

/* ─── Fallback data ─── */

const FALLBACK_JOBS: Record<string, JobDetail> = {
  // ── C-Suite ──
  'afu-1': {
    id: 'afu-1', title: 'Chief Financial Officer (CFO)', sector: 'Executive', country: 'Remote', region: 'Harare, Zimbabwe',
    job_type: 'permanent', pay_rate: null, pay_type: 'negotiable', duration: 'Permanent', duration_description: 'Permanent',
    start_date: null, workers_needed: 1, farm_name: 'AFU HQ',
    description: 'Build and lead financial operations across 20 African countries. Manage $500M seed deployment, treasury operations, multi-currency mobile money, and investor-grade reporting.\n\nYou will own the entire finance function: budgeting, forecasting, audit, tax across multiple jurisdictions, and investor relations support.',
    requirements: 'CA/CPA/ACCA qualified with 10+ years in finance leadership, ideally in fintech, agricultural finance, or DFI environments. Experience with African markets and multi-currency operations essential.',
    skills: ['Financial strategy', 'Treasury management', 'Multi-currency operations', 'Investor reporting', 'Agricultural finance'],
    experience_years: 10, education: 'CA/CPA/ACCA or equivalent', certifications: null,
    housing_included: false, meals_included: false, transport_included: false, status: 'open', created_at: '2026-03-20T00:00:00Z',
  },
  'afu-2': {
    id: 'afu-2', title: 'Chief Risk Officer (CRO)', sector: 'Executive', country: 'Remote', region: 'Harare, Zimbabwe',
    job_type: 'permanent', pay_rate: null, pay_type: 'negotiable', duration: 'Permanent', duration_description: 'Permanent',
    start_date: null, workers_needed: 1, farm_name: 'AFU HQ',
    description: 'Build credit risk models for smallholder lending, design parametric insurance products, and manage Lloyd\'s of London coverholder compliance.\n\nBridge between traditional insurance and cutting-edge agritech risk assessment using satellite data, mobile money history, and field assessments.',
    requirements: 'Actuarial or risk management background with agricultural insurance experience. Lloyd\'s of London market experience highly desirable.',
    skills: ['Credit risk modelling', 'Parametric insurance', 'Lloyd\'s compliance', 'Agricultural risk'],
    experience_years: 10, education: 'Actuarial science, Risk Management, or related degree', certifications: ['FIA/FCAS preferred'],
    housing_included: false, meals_included: false, transport_included: false, status: 'open', created_at: '2026-03-20T00:00:00Z',
  },
  'afu-3': {
    id: 'afu-3', title: 'Chief Legal Officer (CLO)', sector: 'Executive', country: 'Remote', region: 'Mauritius / Netherlands',
    job_type: 'permanent', pay_rate: null, pay_type: 'negotiable', duration: 'Permanent', duration_description: 'Permanent',
    start_date: null, workers_needed: 1, farm_name: 'AFU HQ',
    description: 'Navigate a multi-layered corporate structure: Netherlands Foundation, Mauritius Holdings, country cooperatives, Lloyd\'s coverholder, and trade finance contracts across 20 African jurisdictions.\n\nBuild the legal frameworks for cooperative formation, farmer contracts, insurance policies, and cross-border trade.',
    requirements: 'Qualified lawyer with 10+ years experience in African corporate law, financial services regulation, or international trade. Multi-jurisdictional experience essential.',
    skills: ['Corporate law', 'Financial regulation', 'Cooperative law', 'Trade finance', 'Multi-jurisdictional'],
    experience_years: 10, education: 'LLB/JD from accredited institution', certifications: null,
    housing_included: false, meals_included: false, transport_included: false, status: 'open', created_at: '2026-03-20T00:00:00Z',
  },
  'afu-4': {
    id: 'afu-4', title: 'Chief Commercial Officer (CCO)', sector: 'Executive', country: 'Nairobi / Harare', region: null,
    job_type: 'permanent', pay_rate: null, pay_type: 'negotiable', duration: 'Permanent', duration_description: 'Permanent',
    start_date: null, workers_needed: 1, farm_name: 'AFU HQ',
    description: 'Build the buyer network, negotiate export contracts, manage commodity pricing, and run the trade desk.\n\nEnsure every farmer on the platform has a guaranteed offtake buyer. Build relationships with international commodity buyers and food processors.',
    requirements: '10+ years in agricultural commodity trading, export management, or commercial leadership in Africa. Deep network of commodity buyers.',
    skills: ['Commodity trading', 'Export management', 'Buyer relationships', 'Pricing strategy'],
    experience_years: 10, education: 'Business, Agriculture, or related degree', certifications: null,
    housing_included: false, meals_included: false, transport_included: false, status: 'open', created_at: '2026-03-20T00:00:00Z',
  },
  'afu-5': {
    id: 'afu-5', title: 'Chief People Officer (CPO)', sector: 'Executive', country: 'Remote', region: 'Travel across Africa',
    job_type: 'permanent', pay_rate: null, pay_type: 'negotiable', duration: 'Permanent', duration_description: 'Permanent',
    start_date: null, workers_needed: 1, farm_name: 'AFU HQ',
    description: 'Scale AFU from 2 people to 1,000+ across 20 African countries in 5 years.\n\nBuild the talent engine, establish competitive compensation across markets, and create the culture that makes AFU the employer of choice in African agritech.',
    requirements: 'HR leadership experience scaling teams across multiple African countries. Understanding of labour laws across at least 3 African jurisdictions.',
    skills: ['Talent acquisition', 'Compensation design', 'African labour law', 'Culture building', 'Organisational design'],
    experience_years: 8, education: 'HR, Business, or related degree', certifications: null,
    housing_included: false, meals_included: false, transport_included: false, status: 'open', created_at: '2026-03-20T00:00:00Z',
  },

  // ── Technology ──
  'afu-6': {
    id: 'afu-6', title: 'VP Engineering', sector: 'Technology', country: 'Remote', region: null,
    job_type: 'permanent', pay_rate: null, pay_type: 'negotiable', duration: 'Permanent', duration_description: 'Permanent',
    start_date: null, workers_needed: 1, farm_name: 'AFU Technology',
    description: 'Lead and grow the engineering team from 2 to 25+ developers.\n\nScale a 200+ page Next.js platform with 40+ database tables, AI integration, and mobile money APIs to handle millions of farmers across 20 countries.',
    requirements: '8+ years in software engineering with 3+ years in engineering leadership. Experience with Next.js/React, PostgreSQL, and building for African markets.',
    skills: ['Next.js', 'TypeScript', 'PostgreSQL', 'Team leadership', 'System architecture'],
    experience_years: 8, education: 'Computer Science or equivalent', certifications: null,
    housing_included: false, meals_included: false, transport_included: false, status: 'open', created_at: '2026-03-19T00:00:00Z',
  },
  'afu-7': {
    id: 'afu-7', title: 'VP Product', sector: 'Technology', country: 'Remote', region: 'Periodic field visits to Africa',
    job_type: 'permanent', pay_rate: null, pay_type: 'negotiable', duration: 'Permanent', duration_description: 'Permanent',
    start_date: null, workers_needed: 1, farm_name: 'AFU Technology',
    description: 'Own the product roadmap across 5 portals serving illiterate smallholders to commercial farm managers.\n\nDesign progressive disclosure (Seedling to Pioneer), multilingual UX, and offline-first mobile experiences.',
    requirements: '7+ years in product management with experience building for low-literacy users, offline-first mobile, or financial inclusion products.',
    skills: ['Product strategy', 'UX design', 'Multilingual products', 'Offline-first design', 'Agile'],
    experience_years: 7, education: 'Product Management, Design, or related field', certifications: null,
    housing_included: false, meals_included: false, transport_included: false, status: 'open', created_at: '2026-03-19T00:00:00Z',
  },
  'afu-8': {
    id: 'afu-8', title: 'Director of Data & AI', sector: 'Technology', country: 'Remote', region: null,
    job_type: 'permanent', pay_rate: null, pay_type: 'negotiable', duration: 'Permanent', duration_description: 'Permanent',
    start_date: null, workers_needed: 1, farm_name: 'AFU Technology',
    description: 'Build credit scoring models using satellite and mobile money data, scale the AI crop doctor, develop yield prediction from satellite imagery.\n\nCreate the multilingual farmer advisory chatbot serving farmers in 15+ languages.',
    requirements: 'PhD or MSc in Data Science, ML, or related field. Experience with satellite imagery, NLP, or credit scoring in emerging markets.',
    skills: ['Machine learning', 'Satellite imagery', 'Credit scoring', 'NLP', 'Python'],
    experience_years: 5, education: 'MSc/PhD in Data Science or related field', certifications: null,
    housing_included: false, meals_included: false, transport_included: false, status: 'open', created_at: '2026-03-19T00:00:00Z',
  },
  'afu-9': {
    id: 'afu-9', title: 'Director of Blockchain', sector: 'Technology', country: 'Remote', region: null,
    job_type: 'permanent', pay_rate: null, pay_type: 'negotiable', duration: 'Permanent', duration_description: 'Permanent',
    start_date: null, workers_needed: 1, farm_name: 'AFU Technology',
    description: 'Build the EDMA blockchain platform on Polygon: AFUSD stablecoin, RWA tokenization for farm assets, carbon credit trading.\n\nDevelop supply chain traceability and smart contracts for automated insurance payouts.',
    requirements: '5+ years in blockchain development with Solidity/Polygon experience. Understanding of RWA tokenization and DeFi protocols.',
    skills: ['Solidity', 'Polygon', 'Smart contracts', 'RWA tokenization', 'DeFi'],
    experience_years: 5, education: 'Computer Science or related field', certifications: null,
    housing_included: false, meals_included: false, transport_included: false, status: 'open', created_at: '2026-03-19T00:00:00Z',
  },
  'afu-10': {
    id: 'afu-10', title: 'Director of InfoSec', sector: 'Technology', country: 'Remote', region: null,
    job_type: 'permanent', pay_rate: null, pay_type: 'negotiable', duration: 'Permanent', duration_description: 'Permanent',
    start_date: null, workers_needed: 1, farm_name: 'AFU Technology',
    description: 'Build the information security program across sensitive financial data, farmer PII, and payment transactions in 20 countries.\n\nAchieve SOC 2, ISO 27001, GDPR, POPIA, and PCI-DSS compliance.',
    requirements: '7+ years in information security with fintech or financial services experience. CISSP, CISM, or equivalent certification.',
    skills: ['SOC 2', 'ISO 27001', 'PCI-DSS', 'Penetration testing', 'Security architecture'],
    experience_years: 7, education: 'Computer Science, Cybersecurity, or related field', certifications: ['CISSP', 'CISM'],
    housing_included: false, meals_included: false, transport_included: false, status: 'open', created_at: '2026-03-19T00:00:00Z',
  },

  // ── Operations ──
  'afu-11': {
    id: 'afu-11', title: 'VP Operations', sector: 'Operations', country: 'Harare, Zimbabwe', region: 'Travel across Africa',
    job_type: 'permanent', pay_rate: null, pay_type: 'negotiable', duration: 'Permanent', duration_description: 'Permanent',
    start_date: null, workers_needed: 1, farm_name: 'AFU Operations',
    description: 'Build the operational machine across 20 African countries: farming operations, lending, insurance, trade finance, and supply chain all running simultaneously.\n\nScale from 2 to 20 countries within 36 months.',
    requirements: '10+ years in operations leadership with experience scaling across multiple African countries. Agricultural or financial services background.',
    skills: ['Operations management', 'Multi-country scaling', 'Supply chain', 'Process design'],
    experience_years: 10, education: 'Business, Engineering, or related degree', certifications: null,
    housing_included: false, meals_included: false, transport_included: false, status: 'open', created_at: '2026-03-18T00:00:00Z',
  },
  'afu-12': {
    id: 'afu-12', title: 'Director of Supply Chain', sector: 'Operations', country: 'Harare, Zimbabwe', region: 'Travel across Africa',
    job_type: 'permanent', pay_rate: null, pay_type: 'negotiable', duration: 'Permanent', duration_description: 'Permanent',
    start_date: null, workers_needed: 1, farm_name: 'AFU Operations',
    description: 'Build supplier networks for farming inputs across 20 countries.\n\nManage equipment procurement, cold chain for perishable exports, warehouse receipt systems, and last-mile delivery to smallholder farmers.',
    requirements: '7+ years in agricultural supply chain management in Africa. Experience with cold chain logistics and warehouse receipt systems.',
    skills: ['Supply chain management', 'Cold chain logistics', 'Warehouse receipts', 'Procurement'],
    experience_years: 7, education: 'Supply Chain, Business, or related degree', certifications: null,
    housing_included: false, meals_included: false, transport_included: false, status: 'open', created_at: '2026-03-18T00:00:00Z',
  },
  'afu-13': {
    id: 'afu-13', title: 'Director of Farmer Success', sector: 'Operations', country: 'Harare, Zimbabwe', region: 'Travel across Africa',
    job_type: 'permanent', pay_rate: null, pay_type: 'negotiable', duration: 'Permanent', duration_description: 'Permanent',
    start_date: null, workers_needed: 1, farm_name: 'AFU Operations',
    description: 'Design the farmer onboarding journey, build training programs for the Seedling to Pioneer progression.\n\nEstablish multilingual support operations and track farmer outcomes across yield, income, and satisfaction.',
    requirements: '5+ years in customer success, farmer training, or agricultural extension. Experience with smallholder farmers in Africa.',
    skills: ['Farmer training', 'Customer success', 'Program design', 'Impact measurement'],
    experience_years: 5, education: 'Agriculture, Education, or related degree', certifications: null,
    housing_included: false, meals_included: false, transport_included: false, status: 'open', created_at: '2026-03-18T00:00:00Z',
  },

  // ── Commercial & Finance ──
  'afu-14': {
    id: 'afu-14', title: 'VP Business Development', sector: 'Commercial', country: 'Nairobi / Johannesburg', region: 'Extensive travel',
    job_type: 'permanent', pay_rate: null, pay_type: 'negotiable', duration: 'Permanent', duration_description: 'Permanent',
    start_date: null, workers_needed: 1, farm_name: 'AFU Commercial',
    description: 'Open doors: government MOUs, DFI partnerships (IFC, AfDB, CDC), institutional investor relationships, Lloyd\'s syndicates, and strategic alliances.\n\nLead market entry for new countries.',
    requirements: '10+ years in business development with African DFI, government, or institutional partnerships. Strong network across African markets.',
    skills: ['Partnership development', 'DFI relationships', 'Government affairs', 'Market entry'],
    experience_years: 10, education: 'Business, International Relations, or related degree', certifications: null,
    housing_included: false, meals_included: false, transport_included: false, status: 'open', created_at: '2026-03-18T00:00:00Z',
  },
  'afu-15': {
    id: 'afu-15', title: 'Director of Trade Finance', sector: 'Finance', country: 'Remote', region: 'Mauritius',
    job_type: 'permanent', pay_rate: null, pay_type: 'negotiable', duration: 'Permanent', duration_description: 'Permanent',
    start_date: null, workers_needed: 1, farm_name: 'AFU Finance',
    description: 'Manage SBLC origination, Letters of Credit processing, banking partner coordination, FX operations.\n\nOversee export pre-financing and warehouse receipt financing for agricultural commodity exports.',
    requirements: '7+ years in trade finance with LC/SBLC experience. African agricultural commodity trade experience essential.',
    skills: ['Letters of Credit', 'SBLC', 'FX operations', 'Export finance', 'Commodity trade'],
    experience_years: 7, education: 'Finance, Economics, or related degree', certifications: ['CDCS preferred'],
    housing_included: false, meals_included: false, transport_included: false, status: 'open', created_at: '2026-03-18T00:00:00Z',
  },
  'afu-16': {
    id: 'afu-16', title: 'Senior Commodity Trader', sector: 'Commercial', country: 'Nairobi / Johannesburg', region: 'Extensive travel',
    job_type: 'permanent', pay_rate: null, pay_type: 'negotiable', duration: 'Permanent', duration_description: 'Permanent',
    start_date: null, workers_needed: 1, farm_name: 'AFU Trade Desk',
    description: 'Trade physical agricultural commodities from 20 African countries into global markets.\n\nManage positions in maize, soya, blueberries, macadamia, cashew, cocoa, coffee. Execute spot and forward contracts, hedge price risk, and build the counterparty network.',
    requirements: '5+ years trading physical agricultural commodities. Strong understanding of African origin commodities and international markets.',
    skills: ['Commodity trading', 'Risk hedging', 'Forward contracts', 'Market analysis'],
    experience_years: 5, education: 'Finance, Economics, Agriculture, or related field', certifications: null,
    housing_included: false, meals_included: false, transport_included: false, status: 'open', created_at: '2026-03-18T00:00:00Z',
  },

  // ── Regional Directors ──
  'afu-17': {
    id: 'afu-17', title: 'Regional Director — Southern Africa', sector: 'Regional', country: 'Zimbabwe', region: 'Harare',
    job_type: 'permanent', pay_rate: null, pay_type: 'negotiable', duration: 'Permanent', duration_description: 'Permanent',
    start_date: null, workers_needed: 1, farm_name: 'AFU Southern Africa',
    description: 'Oversee Zimbabwe, Botswana, Mozambique, and Zambia. Own the regional P&L.\n\nEnsure the Zimbabwe pilot succeeds as the template for all countries and build cross-border trade operations within SADC.',
    requirements: 'Senior leadership experience in Southern African agriculture, finance, or development. Strong network across SADC countries.',
    skills: ['Regional leadership', 'P&L management', 'SADC trade', 'Agricultural development'],
    experience_years: 10, education: 'Business, Agriculture, or related degree', certifications: null,
    housing_included: false, meals_included: false, transport_included: false, status: 'open', created_at: '2026-03-17T00:00:00Z',
  },
  'afu-18': {
    id: 'afu-18', title: 'Regional Director — East Africa', sector: 'Regional', country: 'Kenya', region: 'Nairobi',
    job_type: 'permanent', pay_rate: null, pay_type: 'negotiable', duration: 'Permanent', duration_description: 'Permanent',
    start_date: null, workers_needed: 1, farm_name: 'AFU East Africa',
    description: 'Oversee Uganda, Kenya, and Tanzania. Launch Uganda with 19,000 pre-identified farmers.\n\nLeverage Kenya\'s fintech ecosystem and scale to 100,000+ farmers within 3 years across the EAC.',
    requirements: 'Senior leadership experience in East African agriculture or fintech. Understanding of M-Pesa ecosystem and EAC markets.',
    skills: ['Regional leadership', 'Mobile money', 'EAC markets', 'Farmer networks'],
    experience_years: 10, education: 'Business, Agriculture, or related degree', certifications: null,
    housing_included: false, meals_included: false, transport_included: false, status: 'open', created_at: '2026-03-17T00:00:00Z',
  },
  'afu-19': {
    id: 'afu-19', title: 'Regional Director — West Africa', sector: 'Regional', country: 'Ghana', region: 'Accra',
    job_type: 'permanent', pay_rate: null, pay_type: 'negotiable', duration: 'Permanent', duration_description: 'Permanent',
    start_date: null, workers_needed: 1, farm_name: 'AFU West Africa',
    description: 'Oversee Ghana, Nigeria, and Senegal — AFU\'s largest total addressable market.\n\nNavigate anglophone and francophone markets, cocoa and cashew value chains, and build operations across ECOWAS.',
    requirements: 'Senior leadership in West African agriculture or commerce. Fluency in English and French preferred.',
    skills: ['Regional leadership', 'Francophone markets', 'Cocoa/cashew value chains', 'ECOWAS trade'],
    experience_years: 10, education: 'Business, Agriculture, or related degree', certifications: null,
    housing_included: false, meals_included: false, transport_included: false, status: 'open', created_at: '2026-03-17T00:00:00Z',
  },

  // ── Country Directors ──
  'afu-20': {
    id: 'afu-20', title: 'Country Director — Zimbabwe (Pilot)', sector: 'Country', country: 'Zimbabwe', region: 'Harare',
    job_type: 'permanent', pay_rate: null, pay_type: 'negotiable', duration: 'Permanent', duration_description: 'Permanent',
    start_date: null, workers_needed: 1, farm_name: 'AFU Zimbabwe',
    description: 'The most important Country Director role. Launch the blueberry export program, onboard the first 5,000 smallholder farmers.\n\nRegister the cooperative and build the proof-of-concept that unlocks the next $450M+ in deployment.',
    requirements: 'Deep knowledge of Zimbabwe\'s agricultural sector, regulatory environment, and financial services. Strong government and farming community relationships.',
    skills: ['Country leadership', 'Cooperative management', 'Agricultural development', 'Regulatory affairs'],
    experience_years: 8, education: 'Business, Agriculture, or related degree', certifications: null,
    housing_included: false, meals_included: false, transport_included: false, status: 'open', created_at: '2026-03-16T00:00:00Z',
  },
  'afu-21': {
    id: 'afu-21', title: 'Country Director — Uganda', sector: 'Country', country: 'Uganda', region: 'Kampala',
    job_type: 'permanent', pay_rate: null, pay_type: 'negotiable', duration: 'Permanent', duration_description: 'Permanent',
    start_date: null, workers_needed: 1, farm_name: 'AFU Uganda',
    description: 'Launch Uganda operations with 19,000 pre-identified farmers.\n\nBuild the team, register the cooperative, establish MTN MoMo/Airtel Money operations, and scale coffee, maize, and banana value chains.',
    requirements: 'Deep knowledge of Uganda\'s agricultural sector. Experience with cooperative formation and mobile money operations.',
    skills: ['Country operations', 'Cooperative formation', 'Mobile money', 'Coffee/maize value chains'],
    experience_years: 7, education: 'Business, Agriculture, or related degree', certifications: null,
    housing_included: false, meals_included: false, transport_included: false, status: 'open', created_at: '2026-03-16T00:00:00Z',
  },

  // ── Country Management ──
  'afu-22': {
    id: 'afu-22', title: 'Country Operations Manager', sector: 'Country', country: 'Multiple Countries', region: 'Various',
    job_type: 'permanent', pay_rate: null, pay_type: 'negotiable', duration: 'Permanent', duration_description: 'Permanent',
    start_date: null, workers_needed: 10, farm_name: 'AFU Country Ops',
    description: 'Manage day-to-day operations in-country: farmer onboarding, input distribution, crop collection, field team supervision, and logistics coordination.\n\nYou are the engine that makes a country run.',
    requirements: '5+ years in operations management in agriculture or financial services. Strong organisational and people management skills.',
    skills: ['Operations management', 'Team leadership', 'Logistics', 'Farmer onboarding'],
    experience_years: 5, education: 'Business, Agriculture, or related degree', certifications: null,
    housing_included: false, meals_included: false, transport_included: false, status: 'open', created_at: '2026-03-15T00:00:00Z',
  },
  'afu-23': {
    id: 'afu-23', title: 'Country Finance Manager', sector: 'Finance', country: 'Multiple Countries', region: 'Various',
    job_type: 'permanent', pay_rate: null, pay_type: 'negotiable', duration: 'Permanent', duration_description: 'Permanent',
    start_date: null, workers_needed: 10, farm_name: 'AFU Country Finance',
    description: 'Manage loan disbursements, collections, mobile money operations, insurance premium collections, and financial reporting at the country level.\n\nExperience with microfinance or agricultural lending in Africa required.',
    requirements: '5+ years in financial management with microfinance or agricultural lending experience. CPA or equivalent qualification.',
    skills: ['Loan management', 'Mobile money', 'Financial reporting', 'Collections'],
    experience_years: 5, education: 'Finance, Accounting, or related degree', certifications: ['CPA preferred'],
    housing_included: false, meals_included: false, transport_included: false, status: 'open', created_at: '2026-03-15T00:00:00Z',
  },
  'afu-24': {
    id: 'afu-24', title: 'Country Agronomist Lead', sector: 'Agronomy', country: 'Multiple Countries', region: 'Various',
    job_type: 'permanent', pay_rate: null, pay_type: 'negotiable', duration: 'Permanent', duration_description: 'Permanent',
    start_date: null, workers_needed: 10, farm_name: 'AFU Agronomy',
    description: 'The agricultural brain of the country operation. Assess farms, advise farmers, train extension workers.\n\nEnsure export quality standards (GlobalGAP, HACCP) and provide technical input for credit and insurance decisions.',
    requirements: 'MSc in Agronomy or related field with 5+ years field experience. Knowledge of local crops, soils, and climate patterns.',
    skills: ['Agronomy', 'Extension services', 'Quality standards', 'Crop advisory'],
    experience_years: 5, education: 'MSc in Agronomy or Agricultural Science', certifications: ['GlobalGAP knowledge preferred'],
    housing_included: false, meals_included: false, transport_included: false, status: 'open', created_at: '2026-03-15T00:00:00Z',
  },
  'afu-25': {
    id: 'afu-25', title: 'Country Commercial Manager', sector: 'Commercial', country: 'Multiple Countries', region: 'Various',
    job_type: 'permanent', pay_rate: null, pay_type: 'negotiable', duration: 'Permanent', duration_description: 'Permanent',
    start_date: null, workers_needed: 10, farm_name: 'AFU Country Commercial',
    description: 'Find the buyers, negotiate prices, ensure every farmer\'s harvest has a home.\n\nBuild local buyer relationships, negotiate offtake agreements with guaranteed minimum prices, and manage the AFU Fresh marketplace.',
    requirements: '5+ years in agricultural trading, marketing, or commercial management. Strong local buyer network.',
    skills: ['Buyer management', 'Price negotiation', 'Offtake agreements', 'Marketplace operations'],
    experience_years: 5, education: 'Business, Agriculture, or related degree', certifications: null,
    housing_included: false, meals_included: false, transport_included: false, status: 'open', created_at: '2026-03-15T00:00:00Z',
  },
  'afu-26': {
    id: 'afu-26', title: 'Country Insurance Officer', sector: 'Insurance', country: 'Multiple Countries', region: 'Various',
    job_type: 'permanent', pay_rate: null, pay_type: 'negotiable', duration: 'Permanent', duration_description: 'Permanent',
    start_date: null, workers_needed: 10, farm_name: 'AFU Insurance',
    description: 'Manage crop insurance sales, process claims, conduct farm assessments, monitor weather data for parametric triggers.\n\nPrepare Lloyd\'s coverholder reports. Protect farmers from the risks that can wipe out a season.',
    requirements: '3+ years in insurance with agricultural or parametric insurance experience. Understanding of weather-indexed products.',
    skills: ['Insurance operations', 'Claims processing', 'Farm assessment', 'Weather data analysis'],
    experience_years: 3, education: 'Insurance, Actuarial, or related field', certifications: null,
    housing_included: false, meals_included: false, transport_included: false, status: 'open', created_at: '2026-03-15T00:00:00Z',
  },
  'afu-27': {
    id: 'afu-27', title: 'Country Compliance Officer', sector: 'Legal', country: 'Multiple Countries', region: 'Various',
    job_type: 'permanent', pay_rate: null, pay_type: 'negotiable', duration: 'Permanent', duration_description: 'Permanent',
    start_date: null, workers_needed: 10, farm_name: 'AFU Compliance',
    description: 'Manage KYC/AML compliance, cooperative governance, regulatory filings, data protection, and audit preparation.\n\nEnsure AFU operates legally and ethically in every market.',
    requirements: '3+ years in compliance, legal, or regulatory affairs. Knowledge of local financial services regulations and data protection laws.',
    skills: ['KYC/AML', 'Regulatory compliance', 'Data protection', 'Audit preparation'],
    experience_years: 3, education: 'Law, Business, or related degree', certifications: null,
    housing_included: false, meals_included: false, transport_included: false, status: 'open', created_at: '2026-03-15T00:00:00Z',
  },
  'afu-28': {
    id: 'afu-28', title: 'Country Ambassador Coordinator', sector: 'Community', country: 'Multiple Countries', region: 'Various',
    job_type: 'permanent', pay_rate: null, pay_type: 'negotiable', duration: 'Permanent', duration_description: 'Permanent',
    start_date: null, workers_needed: 10, farm_name: 'AFU Community',
    description: 'Recruit, train, and manage a network of local ambassadors who sign up farmers, provide basic support, and build trust in communities.\n\nManage compensation, events, and community engagement programs.',
    requirements: '3+ years in community management, field operations, or NGO outreach. Strong local language skills and community connections.',
    skills: ['Community management', 'Ambassador training', 'Event coordination', 'Local engagement'],
    experience_years: 3, education: 'Community Development, Business, or related field', certifications: null,
    housing_included: false, meals_included: false, transport_included: false, status: 'open', created_at: '2026-03-15T00:00:00Z',
  },

  // ── Field Operations ──
  'afu-29': {
    id: 'afu-29', title: 'Field Agronomist', sector: 'Agronomy', country: 'Multiple Countries', region: 'Rural locations',
    job_type: 'permanent', pay_rate: null, pay_type: 'negotiable', duration: 'Permanent', duration_description: 'Permanent',
    start_date: null, workers_needed: 100, farm_name: 'AFU Field Operations',
    description: 'On the ground with farmers every day. Visit farms, test soil, advise on crops, monitor for disease, deliver training.\n\nUse the AFU mobile app to record data. Motorcycle licence required.',
    requirements: 'Diploma or degree in agriculture. 1+ years field experience with smallholder farmers. Motorcycle licence required.',
    skills: ['Soil testing', 'Crop advisory', 'Disease monitoring', 'Farmer training', 'Mobile data collection'],
    experience_years: 1, education: 'Diploma in Agriculture or equivalent', certifications: ['Motorcycle licence'],
    housing_included: false, meals_included: false, transport_included: true, status: 'open', created_at: '2026-03-14T00:00:00Z',
  },
  'afu-30': {
    id: 'afu-30', title: 'Loan Officer', sector: 'Finance', country: 'Multiple Countries', region: 'Various',
    job_type: 'permanent', pay_rate: null, pay_type: 'negotiable', duration: 'Permanent', duration_description: 'Permanent',
    start_date: null, workers_needed: 50, farm_name: 'AFU Field Operations',
    description: 'Assess farmers for creditworthiness, verify character references, monitor loan usage, and manage collections.\n\nIn the African context, community reputation matters as much as financials. Integrity is non-negotiable.',
    requirements: '2+ years in microfinance or agricultural lending. Strong character assessment skills and local community knowledge.',
    skills: ['Credit assessment', 'Character references', 'Loan monitoring', 'Collections', 'Community engagement'],
    experience_years: 2, education: 'Finance, Business, or related diploma', certifications: null,
    housing_included: false, meals_included: false, transport_included: true, status: 'open', created_at: '2026-03-14T00:00:00Z',
  },
  'afu-31': {
    id: 'afu-31', title: 'Warehouse Manager', sector: 'Operations', country: 'Multiple Countries', region: 'Processing hub locations',
    job_type: 'permanent', pay_rate: null, pay_type: 'negotiable', duration: 'Permanent', duration_description: 'Permanent',
    start_date: null, workers_needed: 20, farm_name: 'AFU Processing',
    description: 'Manage receiving, grading, weighing, and storage of agricultural commodities.\n\nWarehouse receipt finance means your inventory records are financial instruments — accuracy is everything. Cold chain experience preferred.',
    requirements: '3+ years in warehouse or logistics management. Experience with agricultural commodities and quality grading.',
    skills: ['Warehouse management', 'Quality grading', 'Inventory management', 'Cold chain'],
    experience_years: 3, education: 'Logistics, Supply Chain, or related diploma', certifications: null,
    housing_included: false, meals_included: false, transport_included: false, status: 'open', created_at: '2026-03-14T00:00:00Z',
  },

  // ── Central HQ ──
  'afu-32': {
    id: 'afu-32', title: 'Marketing & Communications Lead', sector: 'Marketing', country: 'Remote', region: 'Travel to Africa',
    job_type: 'permanent', pay_rate: null, pay_type: 'negotiable', duration: 'Permanent', duration_description: 'Permanent',
    start_date: null, workers_needed: 1, farm_name: 'AFU HQ',
    description: 'Build the AFU brand: investor materials, farmer-facing campaigns in multiple languages, social media, PR.\n\nPartnership co-branding with Lloyd\'s, our banking partners, and government partners.',
    requirements: '5+ years in marketing/communications with agricultural, fintech, or development sector experience. Multilingual content creation ability.',
    skills: ['Brand building', 'Content strategy', 'Multilingual marketing', 'PR', 'Social media'],
    experience_years: 5, education: 'Marketing, Communications, or related degree', certifications: null,
    housing_included: false, meals_included: false, transport_included: false, status: 'open', created_at: '2026-03-13T00:00:00Z',
  },
  'afu-33': {
    id: 'afu-33', title: 'Customer Support Lead', sector: 'Operations', country: 'Remote', region: 'Harare, Zimbabwe',
    job_type: 'permanent', pay_rate: null, pay_type: 'negotiable', duration: 'Permanent', duration_description: 'Permanent',
    start_date: null, workers_needed: 1, farm_name: 'AFU HQ',
    description: 'Build the support function from scratch: multilingual phone, WhatsApp, in-app chat, and email support across 20 countries.\n\nTrain the AI chatbot, track farmer satisfaction, and build the knowledge base.',
    requirements: '5+ years in customer support leadership. Experience building multilingual support teams and implementing support technology.',
    skills: ['Support operations', 'Multilingual teams', 'AI chatbot training', 'Knowledge base management'],
    experience_years: 5, education: 'Business, Communications, or related degree', certifications: null,
    housing_included: false, meals_included: false, transport_included: false, status: 'open', created_at: '2026-03-13T00:00:00Z',
  },
};

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

const STATUS_COLORS: Record<string, string> = {
  open: 'bg-green-100 text-green-700',
  closed: 'bg-red-100 text-red-700',
  filled: 'bg-gray-100 text-gray-600',
};

/* ─── File Upload helpers ─── */

const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

function getFileExt(name: string) {
  return name.split('.').pop()?.toLowerCase() || 'pdf';
}

/* ─── Apply Modal ─── */

function ApplyModal({
  job,
  onClose,
}: {
  job: JobDetail;
  onClose: () => void;
}) {
  const { user, profile, session } = useAuth();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    email: user?.email || '',
    phone: profile?.phone || '',
    cover_message: '',
  });
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvUrl, setCvUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [appId, setAppId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  // Pre-fill when profile loads
  useEffect(() => {
    if (profile?.full_name && !form.full_name) {
      setForm((prev) => ({ ...prev, full_name: profile.full_name }));
    }
    if (user?.email && !form.email) {
      setForm((prev) => ({ ...prev, email: user.email! }));
    }
    if (profile?.phone && !form.phone) {
      setForm((prev) => ({ ...prev, phone: profile.phone || '' }));
    }
  }, [profile, user, form.full_name, form.email, form.phone]);

  const handleFileSelect = useCallback(
    async (file: File) => {
      setError(null);
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError('Please upload a PDF, Word doc, JPG, or PNG file.');
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        setError('File size must be under 10 MB.');
        return;
      }

      setCvFile(file);
      setUploading(true);
      setUploadProgress(0);

      // Simulate progress while uploading
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => (prev < 90 ? prev + 10 : prev));
      }, 200);

      try {
        const ext = getFileExt(file.name);
        const path = `cvs/${user?.id || 'anon'}/${Date.now()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from('cvs')
          .upload(path, file, { upsert: true });

        clearInterval(progressInterval);

        if (uploadError) {
          setError('Upload failed: ' + uploadError.message);
          setCvFile(null);
          setUploadProgress(0);
        } else {
          const { data: urlData } = supabase.storage
            .from('cvs')
            .getPublicUrl(path);
          setCvUrl(urlData.publicUrl);
          setUploadProgress(100);
        }
      } catch {
        clearInterval(progressInterval);
        setError('Upload failed. Please try again.');
        setCvFile(null);
        setUploadProgress(0);
      } finally {
        setUploading(false);
      }
    },
    [supabase, user],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFileSelect(file);
    },
    [handleFileSelect],
  );

  const handleSubmit = async () => {
    setError(null);
    if (!form.full_name.trim() || !form.email.trim() || !form.cover_message.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/jobs/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token
            ? { Authorization: `Bearer ${session.access_token}` }
            : {}),
        },
        body: JSON.stringify({
          job_id: job.id,
          job_title: job.title,
          cover_message: form.cover_message,
          cv_url: cvUrl,
          full_name: form.full_name,
          email: form.email,
          phone: form.phone,
          country: profile?.country || null,
          skills: job.skills || job.required_skills || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
      } else {
        setAppId(data.applicationId);
        setSubmitted(true);
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Success state
  if (submitted) {
    return (
      <div
        className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-16 h-16 bg-[#5DB347]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-[#5DB347]" />
          </div>
          <h3 className="text-xl font-bold text-[#1B2A4A] mb-2">Application Submitted!</h3>
          <p className="text-sm text-gray-500 mb-4">
            Reference: <strong className="text-[#1B2A4A]">APP-{appId}</strong>
          </p>
          <p className="text-sm text-gray-500 mb-6">
            We&apos;ll review your application within 48 hours. Check your email for a confirmation.
          </p>
          <button
            onClick={onClose}
            className="w-full py-3 bg-[#5DB347] text-white font-semibold rounded-xl hover:bg-[#449933] transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-bold text-[#1B2A4A]">Apply for this role</h3>
            <p className="text-sm text-gray-500 mt-0.5">{job.title}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Full name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
            <input
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              placeholder="Your full name"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347] outline-none"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="your@email.com"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347] outline-none"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+263 77 123 4567"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347] outline-none"
            />
          </div>

          {/* Cover message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cover Message *</label>
            <textarea
              value={form.cover_message}
              onChange={(e) => setForm({ ...form, cover_message: e.target.value })}
              rows={4}
              placeholder="Tell us why you're a great fit for this role..."
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347] outline-none resize-y"
            />
          </div>

          {/* CV Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CV / Resume
            </label>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                dragOver
                  ? 'border-[#5DB347] bg-[#5DB347]/5'
                  : cvFile
                    ? 'border-[#5DB347]/40 bg-[#5DB347]/5'
                    : 'border-gray-200 hover:border-gray-300 bg-gray-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file);
                }}
              />

              {uploading ? (
                <div className="space-y-2">
                  <Loader2 className="w-6 h-6 animate-spin text-[#5DB347] mx-auto" />
                  <p className="text-sm text-gray-500">Uploading...</p>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-[#5DB347] h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              ) : cvFile ? (
                <div className="flex items-center justify-center gap-2">
                  <FileText className="w-5 h-5 text-[#5DB347]" />
                  <span className="text-sm font-medium text-[#1B2A4A]">{cvFile.name}</span>
                  <CheckCircle2 className="w-4 h-4 text-[#5DB347]" />
                </div>
              ) : (
                <div className="space-y-1">
                  <Upload className="w-6 h-6 text-gray-400 mx-auto" />
                  <p className="text-sm text-gray-500">
                    <span className="font-medium text-[#5DB347]">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-400">PDF, DOC, DOCX, JPG, PNG (max 10 MB)</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100">
          <button
            onClick={handleSubmit}
            disabled={submitting || uploading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[#5DB347] text-white font-semibold rounded-xl hover:bg-[#449933] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Application'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Component ─── */

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user, isLoading: authLoading } = useAuth();
  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [similarJobs, setSimilarJobs] = useState<JobDetail[]>([]);
  const [showApplyModal, setShowApplyModal] = useState(false);

  useEffect(() => {
    async function fetchJob() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('job_listings')
          .select('*')
          .eq('id', id)
          .single();

        if (error || !data) {
          // Try fallback
          const fallback = FALLBACK_JOBS[id];
          if (fallback) {
            setJob(fallback);
            // Get similar from fallback
            const similar = Object.values(FALLBACK_JOBS).filter(
              (j) => j.id !== id && j.sector === fallback.sector
            );
            setSimilarJobs(similar.slice(0, 3));
          }
        } else {
          setJob(data);
          // Fetch similar jobs
          const { data: simData } = await supabase
            .from('job_listings')
            .select('*')
            .eq('sector', data.sector)
            .neq('id', id)
            .eq('status', 'open')
            .limit(3);
          if (simData) setSimilarJobs(simData);
        }
      } catch {
        const fallback = FALLBACK_JOBS[id];
        if (fallback) {
          setJob(fallback);
          const similar = Object.values(FALLBACK_JOBS).filter(
            (j) => j.id !== id && j.sector === fallback.sector
          );
          setSimilarJobs(similar.slice(0, 3));
        }
      } finally {
        setLoading(false);
      }
    }
    fetchJob();
  }, [id]);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: no-op
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-[#5DB347] border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-[#1B2A4A] mb-2">Job not found</h2>
          <p className="text-gray-500 mb-4">This listing may have been removed or filled.</p>
          <Link href="/jobs" className="text-[#5DB347] font-semibold hover:underline">
            Back to Jobs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back link */}
      <div className="max-w-5xl mx-auto px-4 pt-6">
        <Link
          href="/jobs"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#5DB347] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Jobs
        </Link>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Main Content ── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${SECTOR_COLORS[job.sector] || 'bg-gray-100 text-gray-700'}`}>
                  {SECTOR_ICONS[job.sector]}
                  {job.sector}
                </span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[job.status] || 'bg-gray-100 text-gray-600'}`}>
                  {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#5DB347]/10 text-[#5DB347]">
                  {job.job_type}
                </span>
              </div>

              <h1 className="text-2xl md:text-3xl font-bold text-[#1B2A4A] mb-2">{job.title}</h1>

              {job.farm_name && (
                <p className="text-gray-500 mb-4">at {job.farm_name}</p>
              )}

              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  {job.location_detail || `${job.country}${job.region ? `, ${job.region}` : ''}`}
                </span>
                {job.pay_rate && (
                  <span className="flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    <strong className="text-[#1B2A4A]">{job.pay_rate}</strong>
                  </span>
                )}
                {(job.duration_description || job.duration) && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-gray-400" />
                    {job.duration_description || job.duration}
                  </span>
                )}
                {job.workers_needed && (
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-gray-400" />
                    {job.workers_needed} needed
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            {job.description && (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-lg font-bold text-[#1B2A4A] mb-3">Job Description</h2>
                <div className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                  {job.description}
                </div>
              </div>
            )}

            {/* Requirements */}
            {(() => {
              const skills = job.required_skills?.length ? job.required_skills : job.skills;
              const education = job.education_required || job.education;
              const experience = job.min_experience_years ?? job.experience_years;
              const certs = job.certifications_required
                ? [job.certifications_required]
                : job.certifications;
              const hasContent = job.requirements || skills?.length || education || certs?.length;
              if (!hasContent) return null;
              return (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                  <h2 className="text-lg font-bold text-[#1B2A4A] mb-4">Requirements</h2>

                  {/* If required_skills has detailed requirements, show as bullet list */}
                  {skills && skills.length > 0 && skills[0].length > 30 ? (
                    <ul className="space-y-2.5 mb-5">
                      {skills.map((req, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600 leading-relaxed">
                          <CheckCircle2 className="w-4 h-4 text-[#5DB347] mt-0.5 flex-shrink-0" />
                          {req}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <>
                      {job.requirements && (
                        <p className="text-gray-600 text-sm mb-4 leading-relaxed">{job.requirements}</p>
                      )}
                      {skills && skills.length > 0 && (
                        <div className="mb-4">
                          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Skills</h3>
                          <div className="flex flex-wrap gap-1.5">
                            {skills.map((skill) => (
                              <span key={skill} className="px-2.5 py-1 bg-[#5DB347]/10 text-[#5DB347] rounded-full text-xs font-medium">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {experience != null && (
                      <div>
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Experience</h3>
                        <p className="text-sm text-gray-600">{experience}+ years</p>
                      </div>
                    )}

                    {education && (
                      <div>
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Education</h3>
                        <p className="text-sm text-gray-600">{education}</p>
                      </div>
                    )}

                    {certs && certs.length > 0 && certs[0] && (
                      <div>
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Certifications</h3>
                        <ul className="space-y-1">
                          {certs.map((cert) => (
                            <li key={cert} className="text-sm text-gray-600 flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#5DB347]" />
                              {cert}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Compensation */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-bold text-[#1B2A4A] mb-4">Compensation &amp; Benefits</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {job.pay_rate && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <DollarSign className="w-5 h-5 text-[#5DB347]" />
                    <div>
                      <p className="text-xs text-gray-400">Pay Rate</p>
                      <p className="text-sm font-semibold text-[#1B2A4A]">{job.pay_rate}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Home className="w-5 h-5" style={{ color: (job.includes_housing || job.housing_included) ? '#5DB347' : '#D1D5DB' }} />
                  <div>
                    <p className="text-xs text-gray-400">Housing</p>
                    <p className="text-sm font-semibold text-[#1B2A4A]">{(job.includes_housing || job.housing_included) ? 'Included' : 'Not included'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Utensils className="w-5 h-5" style={{ color: (job.includes_meals || job.meals_included) ? '#5DB347' : '#D1D5DB' }} />
                  <div>
                    <p className="text-xs text-gray-400">Meals</p>
                    <p className="text-sm font-semibold text-[#1B2A4A]">{(job.includes_meals || job.meals_included) ? 'Included' : 'Not included'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Car className="w-5 h-5" style={{ color: (job.includes_transport || job.transport_included) ? '#5DB347' : '#D1D5DB' }} />
                  <div>
                    <p className="text-xs text-gray-400">Transport</p>
                    <p className="text-sm font-semibold text-[#1B2A4A]">{(job.includes_transport || job.transport_included) ? 'Included' : 'Not included'}</p>
                  </div>
                </div>
                {job.start_date && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-[#5DB347]" />
                    <div>
                      <p className="text-xs text-gray-400">Start Date</p>
                      <p className="text-sm font-semibold text-[#1B2A4A]">
                        {new Date(job.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Sidebar ── */}
          <div className="space-y-6">
            {/* Apply Card */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sticky top-24">
              {authLoading ? (
                <div className="w-full py-3 rounded-xl bg-gray-100 animate-pulse" />
              ) : user ? (
                <button
                  onClick={() => setShowApplyModal(true)}
                  className="block w-full text-center text-white font-semibold py-3 rounded-xl transition-colors"
                  style={{ background: '#5DB347' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#449933')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '#5DB347')}
                >
                  Apply Now
                </button>
              ) : (
                <Link
                  href={`/login?redirect=/jobs/${id}`}
                  className="flex items-center justify-center gap-2 w-full text-center text-white font-semibold py-3 rounded-xl transition-colors"
                  style={{ background: '#1B2A4A' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#0f1a2e')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '#1B2A4A')}
                >
                  <LogIn className="w-4 h-4" />
                  Sign in to apply
                </Link>
              )}

              <button
                onClick={handleShare}
                className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-[#5DB347]" />
                    Link copied!
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    Share this job
                  </>
                )}
              </button>

              {/* Quick info */}
              <div className="mt-6 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Posted</span>
                  <span className="text-[#1B2A4A] font-medium">
                    {new Date(job.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Type</span>
                  <span className="text-[#1B2A4A] font-medium">{job.job_type}</span>
                </div>
                {(job.duration_description || job.duration) && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Duration</span>
                    <span className="text-[#1B2A4A] font-medium">{job.duration_description || job.duration}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Similar Jobs */}
            {similarJobs.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-bold text-[#1B2A4A] mb-4">Similar Jobs</h3>
                <div className="space-y-3">
                  {similarJobs.map((sj) => (
                    <Link
                      key={sj.id}
                      href={`/jobs/${sj.id}`}
                      className="block p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                    >
                      <p className="text-sm font-semibold text-[#1B2A4A] group-hover:text-[#5DB347] transition-colors">
                        {sj.title}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {sj.country} &middot; {sj.job_type}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && job && (
        <ApplyModal job={job} onClose={() => setShowApplyModal(false)} />
      )}
    </div>
  );
}
