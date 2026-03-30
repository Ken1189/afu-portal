'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Search,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  DollarSign,
  TrendingUp,
  Calendar,
  Globe,
  Shield,
  ExternalLink,
  Eye,
  BarChart3,
  FileText,
  Upload,
  Trash2,
  X,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Investor {
  id: string;
  user_id?: string;
  name: string;
  entity: string;
  email: string;
  phone: string;
  type: 'Individual' | 'Institutional' | 'Family Office' | 'Fund';
  status: 'Active' | 'Onboarding' | 'Inactive';
  totalInvested: number;
  totalCommitted: number;
  currentValue: number;
  returns: number;
  joinDate: string;
  country: string;
  kycStatus: 'Verified' | 'Pending' | 'Expired';
  accreditedStatus: 'accredited' | 'pending' | 'not verified';
  pipelineStage: 'Contacted' | 'NDA Signed' | 'Due Diligence' | 'Committed' | 'Deployed';
  investments: {
    name: string;
    type: string;
    amount: number;
    irr: number;
    status: 'Active' | 'Exited';
  }[];
  lastActivity: string;
  relationshipManager: string;
}

interface InvestorDocument {
  id: string;
  investor_profile_id: string;
  name: string;
  type: string;
  file_url: string;
  created_at: string;
  investor_name?: string;
}

interface Opportunity {
  id: string;
  name: string;
  type: string;
  target: number;
  status: string;
}

/* ------------------------------------------------------------------ */
/*  Demo Data                                                          */
/* ------------------------------------------------------------------ */

const demoInvestors: Investor[] = [
  {
    id: '1',
    user_id: 'u1',
    name: 'Devon Kennaird',
    entity: 'AFU Capital (Founder)',
    email: 'devonk@africanfarmingunion.org',
    phone: '+27 82 555 0101',
    type: 'Individual',
    status: 'Active',
    totalInvested: 2500000,
    totalCommitted: 3000000,
    currentValue: 2832500,
    returns: 13.3,
    joinDate: '2024-11-01',
    country: 'South Africa',
    kycStatus: 'Verified',
    accreditedStatus: 'accredited',
    pipelineStage: 'Deployed',
    investments: [
      { name: 'Zim Blueberry Export Program', type: 'Equity', amount: 125000, irr: 16.2, status: 'Active' },
      { name: 'Uganda Smallholder Lending Pool', type: 'Debt', amount: 500000, irr: 12.8, status: 'Active' },
      { name: 'East Africa Crop Insurance Fund', type: 'Insurance', amount: 500000, irr: 11.2, status: 'Active' },
      { name: 'Zimbabwe Maize Lending', type: 'Debt', amount: 500000, irr: 14.7, status: 'Active' },
      { name: 'Kenya Trade Finance Facility', type: 'Debt', amount: 375000, irr: 12.8, status: 'Active' },
      { name: 'Zimbabwe Input Finance', type: 'Debt', amount: 500000, irr: 13.5, status: 'Active' },
    ],
    lastActivity: '2026-03-25',
    relationshipManager: 'Peter Watson',
  },
  {
    id: '2',
    user_id: 'u2',
    name: 'John Mitchell',
    entity: 'Meridian Capital Partners',
    email: 'john@meridiancap.com',
    phone: '+1 212 555 0142',
    type: 'Institutional',
    status: 'Onboarding',
    totalInvested: 0,
    totalCommitted: 500000,
    currentValue: 0,
    returns: 0,
    joinDate: '2026-03-20',
    country: 'United States',
    kycStatus: 'Pending',
    accreditedStatus: 'pending',
    pipelineStage: 'Due Diligence',
    investments: [],
    lastActivity: '2026-03-25',
    relationshipManager: 'Peter Watson',
  },
  {
    id: '3',
    user_id: 'u3',
    name: 'Sarah Chen',
    entity: 'Pacific Rim Investments',
    email: 'sarah@pacificrim.hk',
    phone: '+852 9876 5432',
    type: 'Fund',
    status: 'Onboarding',
    totalInvested: 0,
    totalCommitted: 1000000,
    currentValue: 0,
    returns: 0,
    joinDate: '2026-03-18',
    country: 'Hong Kong',
    kycStatus: 'Pending',
    accreditedStatus: 'not verified',
    pipelineStage: 'NDA Signed',
    investments: [],
    lastActivity: '2026-03-24',
    relationshipManager: 'Peter Watson',
  },
  {
    id: '4',
    user_id: 'u4',
    name: 'Oluwaseun Adebayo',
    entity: 'Lagos Angel Network',
    email: 'seun@lagosangels.ng',
    phone: '+234 803 555 1234',
    type: 'Institutional',
    status: 'Active',
    totalInvested: 750000,
    totalCommitted: 750000,
    currentValue: 838500,
    returns: 11.8,
    joinDate: '2025-06-15',
    country: 'Nigeria',
    kycStatus: 'Verified',
    accreditedStatus: 'accredited',
    pipelineStage: 'Deployed',
    investments: [
      { name: 'Uganda Smallholder Lending Pool', type: 'Debt', amount: 250000, irr: 12.8, status: 'Active' },
      { name: 'Kenya Trade Finance Facility', type: 'Debt', amount: 250000, irr: 12.8, status: 'Active' },
      { name: 'East Africa Crop Insurance Fund', type: 'Insurance', amount: 250000, irr: 11.2, status: 'Active' },
    ],
    lastActivity: '2026-03-22',
    relationshipManager: 'Peter Watson',
  },
  {
    id: '5',
    user_id: 'u5',
    name: 'Emma Van Der Berg',
    entity: 'Cape Agri Ventures',
    email: 'emma@capeagri.co.za',
    phone: '+27 21 555 4567',
    type: 'Family Office',
    status: 'Active',
    totalInvested: 1000000,
    totalCommitted: 1200000,
    currentValue: 1125000,
    returns: 12.5,
    joinDate: '2025-03-01',
    country: 'South Africa',
    kycStatus: 'Verified',
    accreditedStatus: 'accredited',
    pipelineStage: 'Committed',
    investments: [
      { name: 'Zimbabwe Maize Lending', type: 'Debt', amount: 400000, irr: 14.7, status: 'Active' },
      { name: 'Zimbabwe Input Finance', type: 'Debt', amount: 350000, irr: 13.5, status: 'Active' },
      { name: 'Zim Blueberry Export Program', type: 'Equity', amount: 250000, irr: 16.2, status: 'Active' },
    ],
    lastActivity: '2026-03-20',
    relationshipManager: 'Peter Watson',
  },
  {
    id: '6',
    user_id: 'u6',
    name: 'James Mwangi',
    entity: 'Nairobi Impact Fund',
    email: 'james@nairobiimpact.ke',
    phone: '+254 722 555 789',
    type: 'Fund',
    status: 'Active',
    totalInvested: 500000,
    totalCommitted: 500000,
    currentValue: 557500,
    returns: 11.5,
    joinDate: '2025-09-01',
    country: 'Kenya',
    kycStatus: 'Verified',
    accreditedStatus: 'accredited',
    pipelineStage: 'Deployed',
    investments: [
      { name: 'Kenya Trade Finance Facility', type: 'Debt', amount: 300000, irr: 12.8, status: 'Active' },
      { name: 'East Africa Crop Insurance Fund', type: 'Insurance', amount: 200000, irr: 11.2, status: 'Active' },
    ],
    lastActivity: '2026-03-19',
    relationshipManager: 'Peter Watson',
  },
  {
    id: '7',
    user_id: 'u7',
    name: 'Marcus Braun',
    entity: 'Berlin Impact Capital',
    email: 'marcus@berlinimpact.de',
    phone: '+49 30 555 7890',
    type: 'Fund',
    status: 'Onboarding',
    totalInvested: 0,
    totalCommitted: 0,
    currentValue: 0,
    returns: 0,
    joinDate: '2026-03-28',
    country: 'Germany',
    kycStatus: 'Pending',
    accreditedStatus: 'not verified',
    pipelineStage: 'Contacted',
    investments: [],
    lastActivity: '2026-03-28',
    relationshipManager: 'Peter Watson',
  },
];

const demoDocuments: InvestorDocument[] = [
  { id: 'doc1', investor_profile_id: '1', name: 'KYC Verification - Devon Kennaird', type: 'KYC', file_url: '/docs/kyc_devon.pdf', created_at: '2024-11-05', investor_name: 'Devon Kennaird' },
  { id: 'doc2', investor_profile_id: '1', name: 'Subscription Agreement - Uganda Pool', type: 'Agreement', file_url: '/docs/sub_uganda.pdf', created_at: '2025-01-15', investor_name: 'Devon Kennaird' },
  { id: 'doc3', investor_profile_id: '4', name: 'KYC Verification - Lagos Angel Network', type: 'KYC', file_url: '/docs/kyc_lagos.pdf', created_at: '2025-06-20', investor_name: 'Oluwaseun Adebayo' },
  { id: 'doc4', investor_profile_id: '5', name: 'NDA - Cape Agri Ventures', type: 'NDA', file_url: '/docs/nda_cape.pdf', created_at: '2025-03-05', investor_name: 'Emma Van Der Berg' },
  { id: 'doc5', investor_profile_id: '2', name: 'NDA - Meridian Capital', type: 'NDA', file_url: '/docs/nda_meridian.pdf', created_at: '2026-03-21', investor_name: 'John Mitchell' },
];

const demoOpportunities: Opportunity[] = [
  { id: 'opp1', name: 'Zim Blueberry Export Program', type: 'Equity', target: 2000000, status: 'Open' },
  { id: 'opp2', name: 'Uganda Smallholder Lending Pool', type: 'Debt', target: 5000000, status: 'Open' },
  { id: 'opp3', name: 'East Africa Crop Insurance Fund', type: 'Insurance', target: 3000000, status: 'Open' },
  { id: 'opp4', name: 'Kenya Trade Finance Facility', type: 'Debt', target: 4000000, status: 'Open' },
  { id: 'opp5', name: 'Zimbabwe Input Finance', type: 'Debt', target: 3500000, status: 'Open' },
  { id: 'opp6', name: 'Mozambique Cashew Processing', type: 'Equity', target: 2500000, status: 'Open' },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function fmtCurrency(val: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val);
}

const statusColors: Record<string, string> = {
  Active: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  Onboarding: 'bg-amber-50 text-amber-700 border border-amber-200',
  Inactive: 'bg-gray-100 text-gray-600 border border-gray-200',
};

const kycColors: Record<string, string> = {
  Verified: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  Pending: 'bg-amber-50 text-amber-700 border border-amber-200',
  Expired: 'bg-red-50 text-red-600 border border-red-200',
};

const accreditationColors: Record<string, { bg: string; icon: typeof CheckCircle2 }> = {
  accredited: { bg: 'bg-emerald-50 text-emerald-700 border border-emerald-200', icon: CheckCircle2 },
  pending: { bg: 'bg-amber-50 text-amber-700 border border-amber-200', icon: Clock },
  'not verified': { bg: 'bg-red-50 text-red-600 border border-red-200', icon: AlertCircle },
};

const typeColors: Record<string, string> = {
  Individual: 'bg-blue-50 text-blue-700 border border-blue-200',
  Institutional: 'bg-purple-50 text-purple-700 border border-purple-200',
  'Family Office': 'bg-teal-50 text-teal-700 border border-teal-200',
  Fund: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
};

const PIPELINE_STAGES = ['Contacted', 'NDA Signed', 'Due Diligence', 'Committed', 'Deployed'] as const;
type PipelineStage = (typeof PIPELINE_STAGES)[number];

const stageColors: Record<PipelineStage, string> = {
  Contacted: 'border-gray-300 bg-gray-50',
  'NDA Signed': 'border-blue-300 bg-blue-50',
  'Due Diligence': 'border-amber-300 bg-amber-50',
  Committed: 'border-purple-300 bg-purple-50',
  Deployed: 'border-emerald-300 bg-emerald-50',
};

const stageHeaderColors: Record<PipelineStage, string> = {
  Contacted: 'bg-gray-200 text-gray-800',
  'NDA Signed': 'bg-blue-200 text-blue-800',
  'Due Diligence': 'bg-amber-200 text-amber-800',
  Committed: 'bg-purple-200 text-purple-800',
  Deployed: 'bg-emerald-200 text-emerald-800',
};

/* ------------------------------------------------------------------ */
/*  Animation                                                          */
/* ------------------------------------------------------------------ */

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' as const } },
};

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function ProgressBar({ committed, deployed }: { committed: number; deployed: number }) {
  const pct = committed > 0 ? Math.min((deployed / committed) * 100, 100) : 0;
  return (
    <div className="w-full">
      <div className="flex justify-between text-[10px] text-gray-500 mb-1">
        <span>Deployed: {fmtCurrency(deployed)}</span>
        <span>Committed: {fmtCurrency(committed)}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: pct >= 100 ? '#5DB347' : '#1B2A4A' }}
        />
      </div>
      <p className="text-[10px] text-gray-400 mt-0.5 text-right">{pct.toFixed(0)}% deployed</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Assign to Opportunity Modal                                        */
/* ------------------------------------------------------------------ */

function AssignModal({
  investor,
  opportunities,
  onClose,
  onAssign,
}: {
  investor: Investor;
  opportunities: Opportunity[];
  onClose: () => void;
  onAssign: (investorId: string, opportunityId: string, opportunityName: string) => void;
}) {
  const [selectedOpp, setSelectedOpp] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-bold text-[#1B2A4A]">Assign to Opportunity</h3>
            <p className="text-sm text-gray-500 mt-0.5">{investor.name}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Select Opportunity</label>
            <select
              value={selectedOpp}
              onChange={(e) => setSelectedOpp(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#5DB347] focus:ring-1 focus:ring-[#5DB347]/20"
            >
              <option value="">Choose an opportunity...</option>
              {opportunities.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name} ({o.type}) - Target: {fmtCurrency(o.target)}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex items-center gap-3 p-5 border-t border-gray-100 bg-gray-50/50">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button
            onClick={() => {
              if (!selectedOpp) return;
              const opp = opportunities.find((o) => o.id === selectedOpp);
              if (opp) onAssign(investor.id, opp.id, opp.name);
            }}
            disabled={!selectedOpp}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-[#5DB347] text-white hover:bg-[#4fa03d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Assign
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Upload Document Modal                                              */
/* ------------------------------------------------------------------ */

function UploadDocModal({
  investors,
  onClose,
  onUpload,
}: {
  investors: Investor[];
  onClose: () => void;
  onUpload: (investorId: string, name: string, type: string, fileUrl: string) => void;
}) {
  const [selectedInvestor, setSelectedInvestor] = useState('');
  const [docName, setDocName] = useState('');
  const [docType, setDocType] = useState('KYC');
  const [fileUrl, setFileUrl] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="text-lg font-bold text-[#1B2A4A]">Upload Document</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Investor</label>
            <select
              value={selectedInvestor}
              onChange={(e) => setSelectedInvestor(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#5DB347] focus:ring-1 focus:ring-[#5DB347]/20"
            >
              <option value="">Choose an investor...</option>
              {investors.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Document Name</label>
            <input
              type="text"
              value={docName}
              onChange={(e) => setDocName(e.target.value)}
              placeholder="e.g. KYC Verification - Investor Name"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#5DB347] focus:ring-1 focus:ring-[#5DB347]/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Document Type</label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#5DB347] focus:ring-1 focus:ring-[#5DB347]/20"
            >
              <option value="KYC">KYC</option>
              <option value="NDA">NDA</option>
              <option value="Agreement">Agreement</option>
              <option value="Report">Report</option>
              <option value="Tax">Tax Document</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">File URL</label>
            <input
              type="text"
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#5DB347] focus:ring-1 focus:ring-[#5DB347]/20"
            />
          </div>
        </div>
        <div className="flex items-center gap-3 p-5 border-t border-gray-100 bg-gray-50/50">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button
            onClick={() => {
              if (!selectedInvestor || !docName || !fileUrl) return;
              onUpload(selectedInvestor, docName, docType, fileUrl);
            }}
            disabled={!selectedInvestor || !docName || !fileUrl}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-[#5DB347] text-white hover:bg-[#4fa03d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Document
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

type TabKey = 'investors' | 'pipeline' | 'documents';

export default function AllInvestorsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('investors');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [investors, setInvestors] = useState<Investor[]>(demoInvestors);
  const [documents, setDocuments] = useState<InvestorDocument[]>(demoDocuments);
  const [opportunities, setOpportunities] = useState<Opportunity[]>(demoOpportunities);
  const [dbLoading, setDbLoading] = useState(true);

  // Modals
  const [assignModalInvestor, setAssignModalInvestor] = useState<Investor | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Pipeline filter
  const [pipelineStageFilter, setPipelineStageFilter] = useState<PipelineStage | 'All'>('All');

  // Document search
  const [docSearch, setDocSearch] = useState('');

  /* ---- Supabase fetch ---- */
  const supabase = createClient();

  const fetchData = useCallback(async () => {
    try {
      // Fetch investor_profiles
      const { data: profiles } = await supabase.from('investor_profiles').select('*');
      if (profiles && profiles.length > 0) {
        const profileIds = profiles.map((p: Record<string, unknown>) => p.id as string);

        // Fetch investments
        const { data: investmentsData } = await supabase
          .from('investments')
          .select('*')
          .in('investor_profile_id', profileIds);

        const mapped: Investor[] = profiles.map((p: Record<string, unknown>) => {
          const myInvestments = (investmentsData || []).filter(
            (i: Record<string, unknown>) => i.investor_profile_id === p.id
          );
          const totalDeployed = myInvestments
            .filter((i: Record<string, unknown>) => i.status === 'Deployed' || i.status === 'Active')
            .reduce((s: number, i: Record<string, unknown>) => s + ((i.amount as number) || 0), 0);
          const totalCommitted = (p.total_committed as number) || 0;

          return {
            id: p.id as string,
            user_id: (p.user_id as string) || '',
            name: (p.full_name as string) || (p.name as string) || 'Unknown',
            entity: (p.entity as string) || (p.company_name as string) || '',
            email: (p.email as string) || '',
            phone: (p.phone as string) || '',
            type: ((p.investor_type as string) || 'Individual') as Investor['type'],
            status: ((p.status as string) || 'Active') as Investor['status'],
            totalInvested: totalDeployed,
            totalCommitted,
            currentValue: totalDeployed,
            returns: 0,
            joinDate: ((p.created_at as string) || '').slice(0, 10),
            country: (p.country as string) || '',
            kycStatus: ((p.kyc_status as string) || 'Pending') as Investor['kycStatus'],
            accreditedStatus: p.accredited === true ? 'accredited' : p.accredited === false ? 'not verified' : 'pending',
            pipelineStage: ((p.pipeline_stage as string) || 'Contacted') as PipelineStage,
            investments: myInvestments.map((i: Record<string, unknown>) => ({
              name: (i.opportunity_name as string) || 'Investment',
              type: (i.type as string) || 'Debt',
              amount: (i.amount as number) || 0,
              irr: 0,
              status: ((i.status as string) || 'Active') as 'Active' | 'Exited',
            })),
            lastActivity: ((p.updated_at as string) || (p.created_at as string) || '').slice(0, 10),
            relationshipManager: '',
          };
        });
        setInvestors(mapped);
      }

      // Fetch documents
      const { data: docs } = await supabase.from('investor_documents').select('*');
      if (docs && docs.length > 0) {
        setDocuments(
          docs.map((d: Record<string, unknown>) => ({
            id: d.id as string,
            investor_profile_id: d.investor_profile_id as string,
            name: d.name as string,
            type: d.type as string,
            file_url: d.file_url as string,
            created_at: ((d.created_at as string) || '').slice(0, 10),
          }))
        );
      }

      // Fetch opportunities
      const { data: opps } = await supabase.from('investment_opportunities').select('*');
      if (opps && opps.length > 0) {
        setOpportunities(
          opps.map((o: Record<string, unknown>) => ({
            id: o.id as string,
            name: o.name as string,
            type: (o.type as string) || '',
            target: (o.target as number) || 0,
            status: (o.status as string) || 'Open',
          }))
        );
      }
    } catch {
      // keep fallback demo data
    } finally {
      setDbLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ---- Investor list filtering ---- */
  const filtered = investors.filter((inv) => {
    const matchesSearch =
      inv.name.toLowerCase().includes(search.toLowerCase()) ||
      inv.entity.toLowerCase().includes(search.toLowerCase()) ||
      inv.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  /* ---- Stats ---- */
  const totalAUM = investors.reduce((s, i) => s + i.totalInvested, 0);
  const totalValue = investors.reduce((s, i) => s + i.currentValue, 0);
  const activeCount = investors.filter((i) => i.status === 'Active').length;
  const onboardingCount = investors.filter((i) => i.status === 'Onboarding').length;

  /* ---- Pipeline helpers ---- */
  const pipelineInvestors =
    pipelineStageFilter === 'All' ? investors : investors.filter((i) => i.pipelineStage === pipelineStageFilter);

  async function updatePipelineStage(investorId: string, newStage: PipelineStage) {
    // Optimistic update
    setInvestors((prev) =>
      prev.map((inv) => (inv.id === investorId ? { ...inv, pipelineStage: newStage } : inv))
    );
    // DB update
    try {
      await supabase.from('investor_profiles').update({ pipeline_stage: newStage }).eq('id', investorId);
    } catch {
      // revert would go here in production
    }
  }

  /* ---- Assign investor to opportunity ---- */
  async function handleAssign(investorId: string, opportunityId: string, opportunityName: string) {
    try {
      await supabase.from('investments').insert({
        investor_profile_id: investorId,
        opportunity_name: opportunityName,
        amount: 0,
        status: 'Pending',
        invested_at: new Date().toISOString(),
      });
    } catch {
      // silently handle
    }
    // Also add to local state
    setInvestors((prev) =>
      prev.map((inv) =>
        inv.id === investorId
          ? {
              ...inv,
              investments: [
                ...inv.investments,
                { name: opportunityName, type: '', amount: 0, irr: 0, status: 'Active' as const },
              ],
            }
          : inv
      )
    );
    setAssignModalInvestor(null);
    void opportunityId; // used for DB insert context
  }

  /* ---- Document handlers ---- */
  async function handleUploadDoc(investorId: string, name: string, type: string, fileUrl: string) {
    const inv = investors.find((i) => i.id === investorId);
    const newDoc: InvestorDocument = {
      id: 'doc_' + Date.now(),
      investor_profile_id: investorId,
      name,
      type,
      file_url: fileUrl,
      created_at: new Date().toISOString().slice(0, 10),
      investor_name: inv?.name,
    };
    setDocuments((prev) => [newDoc, ...prev]);
    setShowUploadModal(false);

    try {
      await supabase.from('investor_documents').insert({
        investor_profile_id: investorId,
        name,
        type,
        file_url: fileUrl,
      });
    } catch {
      // keep local
    }
  }

  async function handleDeleteDoc(docId: string) {
    setDocuments((prev) => prev.filter((d) => d.id !== docId));
    try {
      await supabase.from('investor_documents').delete().eq('id', docId);
    } catch {
      // keep local
    }
  }

  /* ---- Filtered documents ---- */
  const filteredDocs = documents.filter(
    (d) =>
      d.name.toLowerCase().includes(docSearch.toLowerCase()) ||
      d.type.toLowerCase().includes(docSearch.toLowerCase()) ||
      (d.investor_name || '').toLowerCase().includes(docSearch.toLowerCase())
  );

  /* ---- Tab definitions ---- */
  const tabs: { key: TabKey; label: string; icon: typeof Users }[] = [
    { key: 'investors', label: 'All Investors', icon: Users },
    { key: 'pipeline', label: 'Pipeline', icon: TrendingUp },
    { key: 'documents', label: 'Documents', icon: FileText },
  ];

  return (
    <motion.div className="space-y-6" variants={container} initial="hidden" animate="show">
      {/* Header */}
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">Investor Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage investor profiles, pipeline, and documents. Super Admin only.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 text-red-700 border border-red-200 text-xs font-semibold">
            <Shield className="w-3.5 h-3.5" /> Super Admin Only
          </span>
        </div>
      </motion.div>

      {/* Summary Stats */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-9 h-9 bg-[#1B2A4A] rounded-xl flex items-center justify-center">
              <Users className="w-4 h-4 text-white" />
            </div>
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total Investors</span>
          </div>
          <p className="text-2xl font-bold text-[#1B2A4A]">{investors.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-9 h-9 bg-[#5DB347] rounded-xl flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-white" />
            </div>
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total AUM</span>
          </div>
          <p className="text-2xl font-bold text-[#1B2A4A]">{fmtCurrency(totalAUM)}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Current Value</span>
          </div>
          <p className="text-2xl font-bold text-[#1B2A4A]">{fmtCurrency(totalValue)}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-9 h-9 bg-blue-500 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Active / Onboarding</span>
          </div>
          <p className="text-2xl font-bold text-[#1B2A4A]">
            {activeCount} <span className="text-base text-gray-400 font-normal">/ {onboardingCount}</span>
          </p>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div variants={item} className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-white text-[#1B2A4A] shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </motion.div>

      {/* ============================================================ */}
      {/*  TAB: All Investors                                          */}
      {/* ============================================================ */}
      {activeTab === 'investors' && (
        <>
          {/* Search & Filter */}
          <motion.div variants={item} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, entity, or email..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#5DB347] focus:ring-1 focus:ring-[#5DB347]/20"
              />
            </div>
            <div className="flex gap-2">
              {['All', 'Active', 'Onboarding', 'Inactive'].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    statusFilter === s
                      ? 'bg-[#1B2A4A] text-white'
                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Investor Cards */}
          <motion.div variants={item} className="space-y-3">
            {dbLoading && investors === demoInvestors && (
              <div className="text-center py-8 text-gray-400 text-sm">Loading investors...</div>
            )}
            {filtered.map((inv) => {
              const accred = accreditationColors[inv.accreditedStatus] || accreditationColors['not verified'];
              const AccredIcon = accred.icon;
              return (
                <div key={inv.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  {/* Row Header */}
                  <button
                    onClick={() => setExpanded(expanded === inv.id ? null : inv.id)}
                    className="w-full flex items-center gap-4 p-5 text-left hover:bg-gray-50/50 transition-colors"
                  >
                    <div className="w-11 h-11 bg-[#1B2A4A] rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-bold">
                        {inv.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-[#1B2A4A]">{inv.name}</p>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${typeColors[inv.type]}`}>
                          {inv.type}
                        </span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColors[inv.status]}`}>
                          {inv.status}
                        </span>
                        {/* KYC Badge */}
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${kycColors[inv.kycStatus]}`}>
                          KYC: {inv.kycStatus}
                        </span>
                        {/* Accreditation Badge */}
                        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${accred.bg}`}>
                          <AccredIcon className="w-3 h-3" />
                          {inv.accreditedStatus === 'accredited' ? 'Accredited' : inv.accreditedStatus === 'pending' ? 'Accred. Pending' : 'Not Verified'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 truncate">{inv.entity}</p>
                    </div>
                    <div className="hidden md:flex items-center gap-6 flex-shrink-0">
                      <div className="text-right w-40">
                        <ProgressBar committed={inv.totalCommitted} deployed={inv.totalInvested} />
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400 uppercase tracking-wide">Returns</p>
                        <p className="font-bold text-emerald-600">{inv.returns}%</p>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      {expanded === inv.id ? (
                        <ChevronUp className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </button>

                  {/* Expanded Detail */}
                  <AnimatePresence>
                    {expanded === inv.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-gray-100 p-5 bg-gray-50/30">
                          {/* Contact & Info */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <div className="space-y-2">
                              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Contact</h4>
                              <div className="flex items-center gap-2 text-sm text-gray-700">
                                <Mail className="w-3.5 h-3.5 text-gray-400" /> {inv.email}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-700">
                                <Phone className="w-3.5 h-3.5 text-gray-400" /> {inv.phone}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-700">
                                <Globe className="w-3.5 h-3.5 text-gray-400" /> {inv.country}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Account</h4>
                              <div className="flex items-center gap-2 text-sm text-gray-700">
                                <Calendar className="w-3.5 h-3.5 text-gray-400" /> Joined: {inv.joinDate}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-700">
                                <Eye className="w-3.5 h-3.5 text-gray-400" /> Last active: {inv.lastActivity}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-700">
                                <Users className="w-3.5 h-3.5 text-gray-400" /> RM: {inv.relationshipManager || 'Unassigned'}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Portfolio Summary</h4>
                              <div className="flex items-center gap-2 text-sm text-gray-700">
                                <DollarSign className="w-3.5 h-3.5 text-gray-400" /> Committed: {fmtCurrency(inv.totalCommitted)}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-700">
                                <DollarSign className="w-3.5 h-3.5 text-gray-400" /> Deployed: {fmtCurrency(inv.totalInvested)}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-700">
                                <TrendingUp className="w-3.5 h-3.5 text-gray-400" /> Current Value: {fmtCurrency(inv.currentValue)}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-emerald-600 font-semibold">
                                <BarChart3 className="w-3.5 h-3.5" /> Net Return: {inv.returns}%
                              </div>
                            </div>
                          </div>

                          {/* Commitment Progress (mobile visible) */}
                          <div className="md:hidden mb-6">
                            <ProgressBar committed={inv.totalCommitted} deployed={inv.totalInvested} />
                          </div>

                          {/* Investments Table */}
                          {inv.investments.length > 0 && (
                            <div>
                              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                                Active Investments ({inv.investments.length})
                              </h4>
                              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="bg-gray-50/80 text-left">
                                      <th className="px-4 py-2.5 text-xs font-semibold text-[#1B2A4A] uppercase tracking-wide">Investment</th>
                                      <th className="px-4 py-2.5 text-xs font-semibold text-[#1B2A4A] uppercase tracking-wide">Type</th>
                                      <th className="px-4 py-2.5 text-xs font-semibold text-[#1B2A4A] uppercase tracking-wide text-right">Amount</th>
                                      <th className="px-4 py-2.5 text-xs font-semibold text-[#1B2A4A] uppercase tracking-wide text-right">IRR</th>
                                      <th className="px-4 py-2.5 text-xs font-semibold text-[#1B2A4A] uppercase tracking-wide text-center">Status</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {inv.investments.map((investment, idx) => (
                                      <tr key={idx} className={idx % 2 === 0 ? '' : 'bg-gray-50/40'}>
                                        <td className="px-4 py-2.5 font-medium text-[#1B2A4A]">{investment.name}</td>
                                        <td className="px-4 py-2.5 text-gray-600">{investment.type}</td>
                                        <td className="px-4 py-2.5 text-right font-medium text-gray-700">{fmtCurrency(investment.amount)}</td>
                                        <td className="px-4 py-2.5 text-right font-semibold text-emerald-600">{investment.irr}%</td>
                                        <td className="px-4 py-2.5 text-center">
                                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                            {investment.status}
                                          </span>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}

                          {inv.investments.length === 0 && (
                            <div className="bg-white rounded-xl border border-gray-100 p-6 text-center text-gray-400 text-sm">
                              No investments yet. Investor is still in onboarding.
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100 flex-wrap">
                            <a
                              href={`mailto:${inv.email}`}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-[#1B2A4A] text-white hover:bg-[#243656] transition-colors"
                            >
                              <Mail className="w-3.5 h-3.5" /> Email Investor
                            </a>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setAssignModalInvestor(inv);
                              }}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-[#5DB347] text-white hover:bg-[#4fa03d] transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" /> Assign to Opportunity
                            </button>
                            <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
                              <ExternalLink className="w-3.5 h-3.5" /> View Portal
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No investors match your search.</p>
              </div>
            )}
          </motion.div>
        </>
      )}

      {/* ============================================================ */}
      {/*  TAB: Pipeline                                                */}
      {/* ============================================================ */}
      {activeTab === 'pipeline' && (
        <>
          {/* Stage filters */}
          <motion.div variants={item} className="flex flex-wrap gap-2">
            {(['All', ...PIPELINE_STAGES] as const).map((stage) => {
              const count = stage === 'All' ? investors.length : investors.filter((i) => i.pipelineStage === stage).length;
              return (
                <button
                  key={stage}
                  onClick={() => setPipelineStageFilter(stage as PipelineStage | 'All')}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    pipelineStageFilter === stage
                      ? 'bg-[#1B2A4A] text-white'
                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {stage} ({count})
                </button>
              );
            })}
          </motion.div>

          {/* Kanban Board */}
          <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto">
            {PIPELINE_STAGES.map((stage) => {
              const stageInvestors =
                pipelineStageFilter === 'All'
                  ? investors.filter((i) => i.pipelineStage === stage)
                  : pipelineInvestors.filter((i) => i.pipelineStage === stage);
              return (
                <div key={stage} className={`rounded-2xl border-2 ${stageColors[stage]} min-h-[200px]`}>
                  {/* Stage Header */}
                  <div className={`px-4 py-3 rounded-t-xl ${stageHeaderColors[stage]}`}>
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold">{stage}</h3>
                      <span className="text-xs font-semibold bg-white/50 px-2 py-0.5 rounded-full">
                        {stageInvestors.length}
                      </span>
                    </div>
                  </div>
                  {/* Stage Cards */}
                  <div className="p-3 space-y-2">
                    {stageInvestors.map((inv) => {
                      const stageIdx = PIPELINE_STAGES.indexOf(stage);
                      const nextStage = stageIdx < PIPELINE_STAGES.length - 1 ? PIPELINE_STAGES[stageIdx + 1] : null;
                      return (
                        <div key={inv.id} className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-7 h-7 bg-[#1B2A4A] rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-white text-[10px] font-bold">
                                {inv.name
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')
                                  .slice(0, 2)}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-[#1B2A4A] truncate">{inv.name}</p>
                              <p className="text-[10px] text-gray-500 truncate">{inv.entity}</p>
                            </div>
                          </div>
                          {inv.totalCommitted > 0 && (
                            <p className="text-[10px] text-gray-500 mb-2">
                              Committed: {fmtCurrency(inv.totalCommitted)}
                            </p>
                          )}
                          {/* KYC/Accred badges */}
                          <div className="flex flex-wrap gap-1 mb-2">
                            <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${kycColors[inv.kycStatus]}`}>
                              KYC: {inv.kycStatus}
                            </span>
                          </div>
                          {/* Move to next stage */}
                          {nextStage && (
                            <button
                              onClick={() => updatePipelineStage(inv.id, nextStage)}
                              className="w-full flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-semibold bg-[#5DB347]/10 text-[#5DB347] hover:bg-[#5DB347]/20 transition-colors"
                            >
                              Move to {nextStage} <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                          {!nextStage && (
                            <div className="w-full flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-semibold bg-emerald-50 text-emerald-600">
                              <CheckCircle2 className="w-3 h-3" /> Fully Deployed
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {stageInvestors.length === 0 && (
                      <div className="text-center py-6 text-gray-400 text-xs">No investors</div>
                    )}
                  </div>
                </div>
              );
            })}
          </motion.div>
        </>
      )}

      {/* ============================================================ */}
      {/*  TAB: Documents                                               */}
      {/* ============================================================ */}
      {activeTab === 'documents' && (
        <>
          {/* Search & Upload */}
          <motion.div variants={item} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={docSearch}
                onChange={(e) => setDocSearch(e.target.value)}
                placeholder="Search documents by name, type, or investor..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#5DB347] focus:ring-1 focus:ring-[#5DB347]/20"
              />
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-medium bg-[#5DB347] text-white hover:bg-[#4fa03d] transition-colors"
            >
              <Upload className="w-4 h-4" /> Upload Document
            </button>
          </motion.div>

          {/* Documents Table */}
          <motion.div variants={item} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50/80 text-left">
                  <th className="px-5 py-3 text-xs font-semibold text-[#1B2A4A] uppercase tracking-wide">Document</th>
                  <th className="px-5 py-3 text-xs font-semibold text-[#1B2A4A] uppercase tracking-wide">Type</th>
                  <th className="px-5 py-3 text-xs font-semibold text-[#1B2A4A] uppercase tracking-wide">Investor</th>
                  <th className="px-5 py-3 text-xs font-semibold text-[#1B2A4A] uppercase tracking-wide">Date</th>
                  <th className="px-5 py-3 text-xs font-semibold text-[#1B2A4A] uppercase tracking-wide text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocs.map((doc, idx) => {
                  const inv = investors.find((i) => i.id === doc.investor_profile_id);
                  const investorName = doc.investor_name || inv?.name || 'Unknown';
                  return (
                    <tr key={doc.id} className={idx % 2 === 0 ? '' : 'bg-gray-50/40'}>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-[#1B2A4A]" />
                          <span className="font-medium text-[#1B2A4A]">{doc.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                          {doc.type}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-600">{investorName}</td>
                      <td className="px-5 py-3 text-gray-500">{doc.created_at}</td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={doc.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-[#1B2A4A]"
                            title="View document"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => handleDeleteDoc(doc.id)}
                            className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-gray-400 hover:text-red-600"
                            title="Delete document"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredDocs.length === 0 && (
              <div className="p-12 text-center">
                <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No documents found.</p>
              </div>
            )}
          </motion.div>
        </>
      )}

      {/* ============================================================ */}
      {/*  Modals                                                       */}
      {/* ============================================================ */}
      <AnimatePresence>
        {assignModalInvestor && (
          <AssignModal
            investor={assignModalInvestor}
            opportunities={opportunities}
            onClose={() => setAssignModalInvestor(null)}
            onAssign={handleAssign}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showUploadModal && (
          <UploadDocModal
            investors={investors}
            onClose={() => setShowUploadModal(false)}
            onUpload={handleUploadDoc}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
