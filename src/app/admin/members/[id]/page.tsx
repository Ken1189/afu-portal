'use client';

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Sprout,
  Landmark,
  Shield,
  Star,
  Edit3,
  MessageSquare,
  Ban,
  RefreshCw,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Upload,
  Download,
  Eye,
  TrendingUp,
  DollarSign,
  Calendar,
  BookOpen,
  Award,
  Activity,
  ChevronRight,
  CreditCard,
} from 'lucide-react';
// ── Inline types & fallback data (formerly from @/lib/data/members & @/lib/data/loans) ─

type MemberTier = 'smallholder' | 'commercial' | 'enterprise' | 'partner';
type MemberStatus = 'active' | 'pending' | 'suspended';
type KycStatus = 'complete' | 'partial' | 'pending';
type MemberCountry = 'Botswana' | 'Kenya' | 'Mozambique' | 'Nigeria' | 'Sierra Leone' | 'South Africa' | 'Tanzania' | 'Zambia' | 'Zimbabwe';

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  tier: MemberTier;
  country: MemberCountry;
  region: string;
  status: MemberStatus;
  kycStatus: KycStatus;
  profileCompleteness: number;
  farmName: string;
  farmSize: number;
  primaryCrops: string[];
  joinDate: string;
  lastActive: string;
  avatar: null;
  creditScore: number;
}

const mockMembers: Member[] = [
  { id: 'AFU-2024-001', firstName: 'Kgosi', lastName: 'Mosweu', email: 'kgosi.mosweu@email.com', phone: '+267 71 234 567', tier: 'smallholder', country: 'Botswana', region: 'North-West', status: 'active', kycStatus: 'complete', profileCompleteness: 92, farmName: 'Mosweu Family Fields', farmSize: 4.5, primaryCrops: ['Maize', 'Groundnuts'], joinDate: '2024-10-15', lastActive: '2026-03-12', avatar: null, creditScore: 72 },
  { id: 'AFU-2024-002', firstName: 'Naledi', lastName: 'Sekgoma', email: 'naledi.sekgoma@email.com', phone: '+267 72 345 678', tier: 'smallholder', country: 'Botswana', region: 'Central', status: 'active', kycStatus: 'complete', profileCompleteness: 88, farmName: 'Sunrise Lands', farmSize: 3.2, primaryCrops: ['Sorghum', 'Groundnuts'], joinDate: '2024-11-02', lastActive: '2026-03-11', avatar: null, creditScore: 65 },
  { id: 'AFU-2024-003', firstName: 'Tendai', lastName: 'Moyo', email: 'tendai.moyo@email.com', phone: '+263 77 123 4567', tier: 'smallholder', country: 'Zimbabwe', region: 'Mashonaland East', status: 'active', kycStatus: 'complete', profileCompleteness: 95, farmName: 'Moyo Heritage Farm', farmSize: 6.0, primaryCrops: ['Maize', 'Soybeans'], joinDate: '2024-09-20', lastActive: '2026-03-13', avatar: null, creditScore: 78 },
  { id: 'AFU-2024-036', firstName: 'Thabo', lastName: 'Molefe', email: 'thabo.molefe@email.com', phone: '+267 71 567 890', tier: 'commercial', country: 'Botswana', region: 'North-West', status: 'active', kycStatus: 'complete', profileCompleteness: 98, farmName: 'Molefe Commercial Blueberries', farmSize: 45.0, primaryCrops: ['Blueberries', 'Sunflower'], joinDate: '2024-09-05', lastActive: '2026-03-13', avatar: null, creditScore: 88 },
  { id: 'AFU-2024-037', firstName: 'Rudo', lastName: 'Chidyamakono', email: 'rudo.chidyamakono@email.com', phone: '+263 77 234 5678', tier: 'commercial', country: 'Zimbabwe', region: 'Mashonaland East', status: 'active', kycStatus: 'complete', profileCompleteness: 96, farmName: 'Chidyamakono Export Farms', farmSize: 120.0, primaryCrops: ['Tobacco', 'Soybeans', 'Maize'], joinDate: '2024-09-12', lastActive: '2026-03-13', avatar: null, creditScore: 91 },
  { id: 'AFU-2024-046', firstName: 'Blessing', lastName: 'Murefu', email: 'blessing.murefu@email.com', phone: '+263 77 567 8901', tier: 'enterprise', country: 'Zimbabwe', region: 'Mashonaland East', status: 'active', kycStatus: 'complete', profileCompleteness: 100, farmName: 'Murefu Agricultural Conglomerate', farmSize: 850.0, primaryCrops: ['Tobacco', 'Cotton', 'Maize', 'Soybeans'], joinDate: '2024-09-01', lastActive: '2026-03-13', avatar: null, creditScore: 95 },
  { id: 'AFU-2024-047', firstName: 'Joseph', lastName: 'Mwangosi', email: 'joseph.mwangosi@email.com', phone: '+255 712 678 901', tier: 'enterprise', country: 'Tanzania', region: 'Mbeya', status: 'active', kycStatus: 'complete', profileCompleteness: 100, farmName: 'Mwangosi Plantation Group', farmSize: 520.0, primaryCrops: ['Sesame', 'Cassava', 'Sunflower', 'Blueberries'], joinDate: '2024-09-08', lastActive: '2026-03-13', avatar: null, creditScore: 93 },
  { id: 'AFU-2024-009', firstName: 'Tapiwa', lastName: 'Ncube', email: 'tapiwa.ncube@email.com', phone: '+263 78 345 6789', tier: 'smallholder', country: 'Zimbabwe', region: 'Matabeleland North', status: 'active', kycStatus: 'complete', profileCompleteness: 91, farmName: 'Ncube Ancestral Lands', farmSize: 7.2, primaryCrops: ['Cotton', 'Sorghum'], joinDate: '2024-11-15', lastActive: '2026-03-13', avatar: null, creditScore: 74 },
  { id: 'AFU-2024-038', firstName: 'Emmanuel', lastName: 'Massawe', email: 'emmanuel.massawe@email.com', phone: '+255 754 345 678', tier: 'commercial', country: 'Tanzania', region: 'Kilimanjaro', status: 'active', kycStatus: 'complete', profileCompleteness: 95, farmName: 'Massawe Highland Berries', farmSize: 55.0, primaryCrops: ['Blueberries', 'Sesame'], joinDate: '2024-10-01', lastActive: '2026-03-12', avatar: null, creditScore: 86 },
];

interface Loan {
  id: string;
  memberId: string;
  memberName: string;
  type: 'working-capital' | 'invoice-finance' | 'equipment' | 'input-bundle';
  amount: number;
  outstanding: number;
  interestRate: number;
  tenor: number;
  status: 'active' | 'completed' | 'overdue' | 'disbursed' | 'approved';
  disbursementDate: string;
  maturityDate: string;
  nextPaymentDate: string;
  nextPaymentAmount: number;
  repaidPercentage: number;
  crop: string;
  buyer: string | null;
  country: string;
}

const mockLoans: Loan[] = [
  { id: 'FIN-2024-001', memberId: 'AFU-2024-036', memberName: 'Thabo Molefe', type: 'working-capital', amount: 85000, outstanding: 42500, interestRate: 12.5, tenor: 180, status: 'active', disbursementDate: '2025-10-15', maturityDate: '2026-04-13', nextPaymentDate: '2026-03-15', nextPaymentAmount: 14800, repaidPercentage: 50, crop: 'Blueberries', buyer: null, country: 'Botswana' },
  { id: 'FIN-2024-002', memberId: 'AFU-2024-037', memberName: 'Rudo Chidyamakono', type: 'invoice-finance', amount: 120000, outstanding: 36000, interestRate: 10.0, tenor: 90, status: 'active', disbursementDate: '2026-01-10', maturityDate: '2026-04-10', nextPaymentDate: '2026-03-20', nextPaymentAmount: 18500, repaidPercentage: 70, crop: 'Tobacco', buyer: 'Berry Fresh UK', country: 'Zimbabwe' },
  { id: 'FIN-2024-003', memberId: 'AFU-2024-003', memberName: 'Tendai Moyo', type: 'input-bundle', amount: 8500, outstanding: 5950, interestRate: 15.0, tenor: 120, status: 'active', disbursementDate: '2025-12-20', maturityDate: '2026-04-19', nextPaymentDate: '2026-03-20', nextPaymentAmount: 2200, repaidPercentage: 30, crop: 'Maize', buyer: null, country: 'Zimbabwe' },
  { id: 'FIN-2024-005', memberId: 'AFU-2024-001', memberName: 'Kgosi Mosweu', type: 'working-capital', amount: 12000, outstanding: 3600, interestRate: 14.0, tenor: 150, status: 'active', disbursementDate: '2025-11-01', maturityDate: '2026-03-31', nextPaymentDate: '2026-03-18', nextPaymentAmount: 3800, repaidPercentage: 70, crop: 'Maize', buyer: null, country: 'Botswana' },
  { id: 'FIN-2024-006', memberId: 'AFU-2024-046', memberName: 'Blessing Murefu', type: 'invoice-finance', amount: 200000, outstanding: 80000, interestRate: 8.5, tenor: 120, status: 'active', disbursementDate: '2025-12-01', maturityDate: '2026-03-31', nextPaymentDate: '2026-03-15', nextPaymentAmount: 42000, repaidPercentage: 60, crop: 'Cotton', buyer: 'Marks & Spencer', country: 'Zimbabwe' },
  { id: 'FIN-2024-009', memberId: 'AFU-2024-047', memberName: 'Joseph Mwangosi', type: 'equipment', amount: 180000, outstanding: 144000, interestRate: 9.0, tenor: 365, status: 'disbursed', disbursementDate: '2026-01-15', maturityDate: '2027-01-15', nextPaymentDate: '2026-03-15', nextPaymentAmount: 16800, repaidPercentage: 20, crop: 'Sesame', buyer: null, country: 'Tanzania' },
  { id: 'FIN-2024-010', memberId: 'AFU-2024-009', memberName: 'Tapiwa Ncube', type: 'working-capital', amount: 15000, outstanding: 17250, interestRate: 16.0, tenor: 120, status: 'overdue', disbursementDate: '2025-08-10', maturityDate: '2025-12-08', nextPaymentDate: '2025-12-08', nextPaymentAmount: 17250, repaidPercentage: 0, crop: 'Cotton', buyer: null, country: 'Zimbabwe' },
  { id: 'FIN-2024-004', memberId: 'AFU-2024-038', memberName: 'Emmanuel Massawe', type: 'equipment', amount: 65000, outstanding: 48750, interestRate: 11.0, tenor: 365, status: 'active', disbursementDate: '2025-09-01', maturityDate: '2026-09-01', nextPaymentDate: '2026-03-25', nextPaymentAmount: 6200, repaidPercentage: 25, crop: 'Blueberries', buyer: null, country: 'Tanzania' },
];

// ── Module-level aliases (keep component code unchanged) ────────────────────
const members = mockMembers;
const loans = mockLoans;

// ── Animation variants ──────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 260, damping: 24 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toLocaleString()}`;
}

const countryFlags: Record<string, string> = {
  Botswana: '\uD83C\uDDE7\uD83C\uDDFC',
  Zimbabwe: '\uD83C\uDDFF\uD83C\uDDFC',
  Tanzania: '\uD83C\uDDF9\uD83C\uDDFF',
};

const tierColors: Record<string, string> = {
  smallholder: 'bg-teal/10 text-teal-dark',
  commercial: 'bg-navy/10 text-navy',
  enterprise: 'bg-gold/20 text-amber-700',
  partner: 'bg-purple-100 text-purple-700',
};

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  pending: 'bg-amber-100 text-amber-700',
  suspended: 'bg-red-100 text-red-700',
};

const kycColors: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  complete: { bg: 'bg-green-100', text: 'text-green-700', icon: <CheckCircle2 className="w-4 h-4" /> },
  partial: { bg: 'bg-amber-100', text: 'text-amber-700', icon: <Clock className="w-4 h-4" /> },
  pending: { bg: 'bg-red-100', text: 'text-red-700', icon: <AlertCircle className="w-4 h-4" /> },
};

// ── Mock Data ───────────────────────────────────────────────────────────────

const mockDocuments = [
  { id: 'DOC-001', name: 'National ID', type: 'identity', uploadDate: '2024-10-15', status: 'verified', fileSize: '2.4 MB' },
  { id: 'DOC-002', name: 'Farm Title Deed', type: 'property', uploadDate: '2024-10-16', status: 'verified', fileSize: '5.1 MB' },
  { id: 'DOC-003', name: 'Bank Statement (3 months)', type: 'financial', uploadDate: '2024-11-02', status: 'verified', fileSize: '1.8 MB' },
  { id: 'DOC-004', name: 'Tax Clearance Certificate', type: 'tax', uploadDate: '2024-11-10', status: 'pending', fileSize: '890 KB' },
  { id: 'DOC-005', name: 'Crop Insurance Policy', type: 'insurance', uploadDate: '2025-01-05', status: 'verified', fileSize: '3.2 MB' },
  { id: 'DOC-006', name: 'Water Rights Permit', type: 'permit', uploadDate: '2025-02-20', status: 'expired', fileSize: '1.1 MB' },
  { id: 'DOC-007', name: 'Cooperative Membership Card', type: 'membership', uploadDate: '2025-03-01', status: 'verified', fileSize: '450 KB' },
];

const mockRepaymentData = [
  { month: 'Oct', paid: 1200, expected: 1200 },
  { month: 'Nov', paid: 1200, expected: 1200 },
  { month: 'Dec', paid: 1350, expected: 1200 },
  { month: 'Jan', paid: 1200, expected: 1200 },
  { month: 'Feb', paid: 1200, expected: 1200 },
  { month: 'Mar', paid: 800, expected: 1200 },
];

const mockCreditBreakdown = [
  { factor: 'Repayment History', score: 85, weight: '35%' },
  { factor: 'Farm Productivity', score: 72, weight: '20%' },
  { factor: 'Documentation', score: 90, weight: '15%' },
  { factor: 'Training Completion', score: 68, weight: '15%' },
  { factor: 'Time on Platform', score: 60, weight: '15%' },
];

const mockCourses = [
  { id: 'CRS-001', title: 'Sustainable Farming Practices', progress: 100, status: 'completed', completedDate: '2025-01-15', certificate: true },
  { id: 'CRS-002', title: 'Financial Literacy for Farmers', progress: 100, status: 'completed', completedDate: '2025-02-28', certificate: true },
  { id: 'CRS-003', title: 'Blueberry Cultivation Techniques', progress: 72, status: 'in-progress', completedDate: null, certificate: false },
  { id: 'CRS-004', title: 'Post-Harvest Handling & Storage', progress: 45, status: 'in-progress', completedDate: null, certificate: false },
  { id: 'CRS-005', title: 'Market Access & Export Standards', progress: 0, status: 'enrolled', completedDate: null, certificate: false },
  { id: 'CRS-006', title: 'Climate-Smart Agriculture', progress: 100, status: 'completed', completedDate: '2025-03-10', certificate: true },
];

const mockActivity = [
  { id: 1, action: 'Completed training module', detail: 'Climate-Smart Agriculture - Final Assessment', timestamp: '2026-03-13T09:30:00Z', type: 'training' },
  { id: 2, action: 'Loan payment received', detail: '$1,200.00 payment processed for FIN-2024-005', timestamp: '2026-03-12T14:15:00Z', type: 'payment' },
  { id: 3, action: 'Document uploaded', detail: 'Cooperative Membership Card submitted for verification', timestamp: '2026-03-10T11:00:00Z', type: 'document' },
  { id: 4, action: 'Profile updated', detail: 'Updated phone number and farm size details', timestamp: '2026-03-08T16:45:00Z', type: 'profile' },
  { id: 5, action: 'Logged in', detail: 'Mobile app login from Gaborone, Botswana', timestamp: '2026-03-07T08:20:00Z', type: 'login' },
  { id: 6, action: 'Marketplace order placed', detail: 'Purchased 50kg fertilizer from Nkwe Agri Supplies', timestamp: '2026-03-05T13:30:00Z', type: 'order' },
  { id: 7, action: 'Started training module', detail: 'Enrolled in Market Access & Export Standards', timestamp: '2026-03-03T10:00:00Z', type: 'training' },
  { id: 8, action: 'KYC document verified', detail: 'Crop Insurance Policy verified by compliance team', timestamp: '2026-03-01T09:15:00Z', type: 'kyc' },
  { id: 9, action: 'Loan application submitted', detail: 'Working Capital - $12,000 for Maize season', timestamp: '2026-02-25T11:45:00Z', type: 'application' },
  { id: 10, action: 'Training certificate earned', detail: 'Financial Literacy for Farmers - Certificate issued', timestamp: '2026-02-20T15:00:00Z', type: 'training' },
];

const activityTypeConfig: Record<string, { color: string; icon: React.ReactNode }> = {
  training: { color: 'bg-purple-500', icon: <BookOpen className="w-4 h-4" /> },
  payment: { color: 'bg-green-500', icon: <DollarSign className="w-4 h-4" /> },
  document: { color: 'bg-amber-500', icon: <FileText className="w-4 h-4" /> },
  profile: { color: 'bg-teal', icon: <User className="w-4 h-4" /> },
  login: { color: 'bg-gray-400', icon: <Activity className="w-4 h-4" /> },
  order: { color: 'bg-blue-500', icon: <CreditCard className="w-4 h-4" /> },
  kyc: { color: 'bg-navy', icon: <Shield className="w-4 h-4" /> },
  application: { color: 'bg-teal', icon: <FileText className="w-4 h-4" /> },
};

const docStatusConfig: Record<string, { bg: string; text: string }> = {
  verified: { bg: 'bg-green-100', text: 'text-green-700' },
  pending: { bg: 'bg-amber-100', text: 'text-amber-700' },
  expired: { bg: 'bg-red-100', text: 'text-red-700' },
  rejected: { bg: 'bg-red-100', text: 'text-red-700' },
};

type TabId = 'profile' | 'documents' | 'financing' | 'training' | 'activity';

const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
  { id: 'documents', label: 'Documents', icon: <FileText className="w-4 h-4" /> },
  { id: 'financing', label: 'Financing', icon: <Landmark className="w-4 h-4" /> },
  { id: 'training', label: 'Training', icon: <BookOpen className="w-4 h-4" /> },
  { id: 'activity', label: 'Activity', icon: <Activity className="w-4 h-4" /> },
];

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
      <p className="font-semibold text-navy mb-1">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-gray-600">{entry.name}:</span>
          <span className="font-medium text-navy">${entry.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

// ── Credit Score Gauge ──────────────────────────────────────────────────────

function CreditScoreGauge({ score }: { score: number }) {
  const getColor = (s: number) => {
    if (s >= 80) return '#22C55E';
    if (s >= 60) return '#2AA198';
    if (s >= 40) return '#F59E0B';
    return '#EF4444';
  };

  const getLabel = (s: number) => {
    if (s >= 80) return 'Excellent';
    if (s >= 60) return 'Good';
    if (s >= 40) return 'Fair';
    return 'Poor';
  };

  const color = getColor(score);
  const circumference = 2 * Math.PI * 60;
  const offset = circumference - (score / 100) * circumference * 0.75;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-40 h-40">
        <svg className="w-40 h-40 -rotate-[135deg]" viewBox="0 0 140 140">
          <circle cx="70" cy="70" r="60" fill="none" stroke="#f3f4f6" strokeWidth="12" strokeLinecap="round" strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`} />
          <motion.circle
            cx="70"
            cy="70"
            r="60"
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
            initial={{ strokeDashoffset: circumference * 0.75 }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-navy">{score}</span>
          <span className="text-xs font-medium" style={{ color }}>{getLabel(score)}</span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function MemberDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>('profile');

  const memberId = params.id as string;
  const member = useMemo(() => members.find((m) => m.id === memberId), [memberId]);
  const memberLoans = useMemo(() => loans.filter((l) => l.memberId === memberId), [memberId]);

  // ── Not Found State ─────────────────────────────────────────────────────
  if (!member) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center min-h-[60vh] text-center"
      >
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-4">
          <XCircle className="w-10 h-10 text-red-400" />
        </div>
        <h2 className="text-xl font-bold text-navy mb-2">Member Not Found</h2>
        <p className="text-gray-500 text-sm mb-6 max-w-md">
          No member with ID &ldquo;{memberId}&rdquo; was found. The member may have been removed or the ID is incorrect.
        </p>
        <Link
          href="/admin/members"
          className="flex items-center gap-2 text-sm font-medium text-teal hover:text-teal-dark transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Members
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* ── Back Button ──────────────────────────────────────────────────── */}
      <motion.div variants={fadeUp}>
        <button
          onClick={() => router.push('/admin/members')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-navy transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Members
        </button>
      </motion.div>

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <motion.div
        variants={cardVariants}
        className="bg-white rounded-xl border border-gray-100 p-6"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-teal to-navy rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white text-xl font-bold">
                {member.firstName[0]}{member.lastName[0]}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-navy">
                  {member.firstName} {member.lastName}
                </h1>
                <span className="text-lg">{countryFlags[member.country] || ''}</span>
              </div>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${tierColors[member.tier]}`}>
                  {member.tier}
                </span>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${statusColors[member.status]}`}>
                  {member.status}
                </span>
                <span className="text-xs text-gray-400 font-mono">{member.id}</span>
              </div>
            </div>
          </div>

          {/* Admin Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-navy bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
              <Edit3 className="w-3.5 h-3.5" />
              Edit Profile
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-teal-dark bg-teal/10 hover:bg-teal/20 rounded-lg transition-colors">
              <MessageSquare className="w-3.5 h-3.5" />
              Send Message
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors">
              <RefreshCw className="w-3.5 h-3.5" />
              Change Tier
            </button>
            {member.status === 'active' ? (
              <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                <Ban className="w-3.5 h-3.5" />
                Suspend
              </button>
            ) : (
              <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Activate
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* ── Tab Navigation ───────────────────────────────────────────────── */}
      <motion.div variants={fadeUp} className="bg-white rounded-xl border border-gray-100 px-2 py-1.5">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-teal-dark bg-teal/10'
                  : 'text-gray-500 hover:text-navy hover:bg-gray-50'
              }`}
            >
              {tab.icon}
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute bottom-0 left-2 right-2 h-0.5 bg-teal rounded-full"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── Tab Content ──────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              PROFILE TAB
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          {activeTab === 'profile' && (
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Personal Info */}
                <motion.div variants={cardVariants} className="bg-white rounded-xl border border-gray-100 p-5">
                  <h3 className="font-semibold text-navy text-sm mb-4 flex items-center gap-2">
                    <User className="w-4 h-4 text-teal" />
                    Personal Information
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Mail className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400">Email</p>
                        <p className="text-sm text-navy font-medium">{member.email}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Phone className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400">Phone</p>
                        <p className="text-sm text-navy font-medium">{member.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400">Location</p>
                        <p className="text-sm text-navy font-medium">{member.region}, {member.country}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Calendar className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400">Member Since</p>
                        <p className="text-sm text-navy font-medium">
                          {new Date(member.joinDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Activity className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400">Last Active</p>
                        <p className="text-sm text-navy font-medium">{member.lastActive}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Farm Details */}
                <motion.div variants={cardVariants} className="bg-white rounded-xl border border-gray-100 p-5">
                  <h3 className="font-semibold text-navy text-sm mb-4 flex items-center gap-2">
                    <Sprout className="w-4 h-4 text-teal" />
                    Farm Details
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-gray-400">Farm Name</p>
                      <p className="text-sm text-navy font-medium">{member.farmName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Farm Size</p>
                      <p className="text-sm text-navy font-medium">{member.farmSize} hectares</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Primary Crops</p>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {member.primaryCrops.map((crop) => (
                          <span key={crop} className="text-xs px-2.5 py-1 bg-green-50 text-green-700 rounded-full font-medium">
                            {crop}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Tier</p>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${tierColors[member.tier]}`}>
                        {member.tier}
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* KYC & Credit Score */}
                <motion.div variants={cardVariants} className="bg-white rounded-xl border border-gray-100 p-5">
                  <h3 className="font-semibold text-navy text-sm mb-4 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-teal" />
                    KYC & Credit Score
                  </h3>

                  {/* KYC Status */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-gray-400">KYC Status</p>
                      <span className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium capitalize ${kycColors[member.kycStatus].bg} ${kycColors[member.kycStatus].text}`}>
                        {kycColors[member.kycStatus].icon}
                        {member.kycStatus}
                      </span>
                    </div>
                  </div>

                  {/* Profile Completeness */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-gray-400">Profile Completeness</p>
                      <span className="text-xs font-bold text-navy">{member.profileCompleteness}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${member.profileCompleteness}%` }}
                        transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
                        className={`h-2.5 rounded-full ${
                          member.profileCompleteness >= 80 ? 'bg-green-500' :
                          member.profileCompleteness >= 60 ? 'bg-teal' :
                          'bg-amber-500'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Credit Score Gauge */}
                  <CreditScoreGauge score={member.creditScore} />
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              DOCUMENTS TAB
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          {activeTab === 'documents' && (
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
              <motion.div variants={cardVariants} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-semibold text-navy text-sm">Member Documents</h3>
                  <button className="flex items-center gap-1.5 text-xs font-medium text-teal hover:text-teal-dark transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    Request Document
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-50 bg-cream/50">
                        <th className="text-left py-3 px-5 text-xs font-medium text-gray-400 uppercase tracking-wider">Document</th>
                        <th className="text-left py-3 px-5 text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
                        <th className="text-left py-3 px-5 text-xs font-medium text-gray-400 uppercase tracking-wider">Upload Date</th>
                        <th className="text-left py-3 px-5 text-xs font-medium text-gray-400 uppercase tracking-wider">Size</th>
                        <th className="text-left py-3 px-5 text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                        <th className="text-right py-3 px-5 text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {mockDocuments.map((doc) => (
                        <motion.tr
                          key={doc.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="hover:bg-cream/50 transition-colors"
                        >
                          <td className="py-3 px-5">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-gray-400" />
                              <span className="font-medium text-navy">{doc.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-5 text-gray-500 capitalize text-xs">{doc.type}</td>
                          <td className="py-3 px-5 text-gray-500 text-xs">{doc.uploadDate}</td>
                          <td className="py-3 px-5 text-gray-500 text-xs">{doc.fileSize}</td>
                          <td className="py-3 px-5">
                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${docStatusConfig[doc.status]?.bg || 'bg-gray-100'} ${docStatusConfig[doc.status]?.text || 'text-gray-600'}`}>
                              {doc.status}
                            </span>
                          </td>
                          <td className="py-3 px-5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" title="View">
                                <Eye className="w-3.5 h-3.5 text-gray-400" />
                              </button>
                              <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" title="Download">
                                <Download className="w-3.5 h-3.5 text-gray-400" />
                              </button>
                              {doc.status === 'pending' && (
                                <button className="p-1.5 hover:bg-green-50 rounded-lg transition-colors" title="Verify">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                                </button>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              FINANCING TAB
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          {activeTab === 'financing' && (
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
              {/* Loan History Table */}
              <motion.div variants={cardVariants} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-100">
                  <h3 className="font-semibold text-navy text-sm">Loan History</h3>
                </div>
                {memberLoans.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-50 bg-cream/50">
                          <th className="text-left py-3 px-5 text-xs font-medium text-gray-400 uppercase tracking-wider">Loan ID</th>
                          <th className="text-left py-3 px-5 text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
                          <th className="text-right py-3 px-5 text-xs font-medium text-gray-400 uppercase tracking-wider">Amount</th>
                          <th className="text-right py-3 px-5 text-xs font-medium text-gray-400 uppercase tracking-wider">Outstanding</th>
                          <th className="text-left py-3 px-5 text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                          <th className="text-left py-3 px-5 text-xs font-medium text-gray-400 uppercase tracking-wider">Disbursed</th>
                          <th className="text-left py-3 px-5 text-xs font-medium text-gray-400 uppercase tracking-wider">Maturity</th>
                          <th className="text-right py-3 px-5 text-xs font-medium text-gray-400 uppercase tracking-wider">Repaid</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {memberLoans.map((loan) => {
                          const loanStatusColors: Record<string, string> = {
                            active: 'bg-green-100 text-green-700',
                            completed: 'bg-blue-100 text-blue-700',
                            overdue: 'bg-red-100 text-red-700',
                            disbursed: 'bg-teal/10 text-teal-dark',
                            approved: 'bg-amber-100 text-amber-700',
                          };
                          return (
                            <tr key={loan.id} className="hover:bg-cream/50 transition-colors">
                              <td className="py-3 px-5 font-mono text-xs text-gray-500">{loan.id}</td>
                              <td className="py-3 px-5 text-xs capitalize text-gray-600">{loan.type.replace('-', ' ')}</td>
                              <td className="py-3 px-5 text-right font-medium text-navy tabular-nums">${loan.amount.toLocaleString()}</td>
                              <td className="py-3 px-5 text-right tabular-nums text-gray-600">${loan.outstanding.toLocaleString()}</td>
                              <td className="py-3 px-5">
                                <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${loanStatusColors[loan.status] || 'bg-gray-100 text-gray-600'}`}>
                                  {loan.status}
                                </span>
                              </td>
                              <td className="py-3 px-5 text-xs text-gray-500">{loan.disbursementDate}</td>
                              <td className="py-3 px-5 text-xs text-gray-500">{loan.maturityDate}</td>
                              <td className="py-3 px-5 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <div className="w-16 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                    <div
                                      className={`h-1.5 rounded-full ${loan.repaidPercentage === 100 ? 'bg-green-500' : 'bg-teal'}`}
                                      style={{ width: `${loan.repaidPercentage}%` }}
                                    />
                                  </div>
                                  <span className="text-xs text-gray-500 tabular-nums">{loan.repaidPercentage}%</span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-400 text-sm">No loan history found for this member.</div>
                )}
              </motion.div>

              {/* Repayment Chart & Credit Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div variants={cardVariants} className="bg-white rounded-xl border border-gray-100 p-5">
                  <h3 className="font-semibold text-navy text-sm mb-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-teal" />
                    Repayment History
                  </h3>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={mockRepaymentData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="paidGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2AA198" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#2AA198" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `$${v}`} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="expected" stroke="#D4A843" strokeWidth={2} fill="none" strokeDasharray="5 5" name="Expected" />
                        <Area type="monotone" dataKey="paid" stroke="#2AA198" strokeWidth={2.5} fill="url(#paidGradient)" name="Paid" dot={{ fill: '#2AA198', r: 3, strokeWidth: 0 }} activeDot={{ fill: '#2AA198', r: 5, strokeWidth: 2, stroke: '#fff' }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>

                <motion.div variants={cardVariants} className="bg-white rounded-xl border border-gray-100 p-5">
                  <h3 className="font-semibold text-navy text-sm mb-4 flex items-center gap-2">
                    <Star className="w-4 h-4 text-gold" />
                    Credit Score Breakdown
                  </h3>
                  <div className="space-y-3">
                    {mockCreditBreakdown.map((item, i) => (
                      <motion.div
                        key={item.factor}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + i * 0.08 }}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-medium text-navy">{item.factor}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">{item.weight}</span>
                            <span className="text-xs font-bold text-navy tabular-nums">{item.score}</span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${item.score}%` }}
                            transition={{ duration: 0.8, delay: 0.3 + i * 0.1, ease: 'easeOut' }}
                            className={`h-2 rounded-full ${
                              item.score >= 80 ? 'bg-green-500' :
                              item.score >= 60 ? 'bg-teal' :
                              'bg-amber-500'
                            }`}
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs text-gray-400">Weighted Total</span>
                    <span className="text-lg font-bold text-navy">{member.creditScore}</span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              TRAINING TAB
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          {activeTab === 'training' && (
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
              {/* Stats */}
              <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { label: 'Completed', value: mockCourses.filter((c) => c.status === 'completed').length.toString(), color: 'text-green-600', bg: 'bg-green-50' },
                  { label: 'In Progress', value: mockCourses.filter((c) => c.status === 'in-progress').length.toString(), color: 'text-amber-600', bg: 'bg-amber-50' },
                  { label: 'Enrolled', value: mockCourses.filter((c) => c.status === 'enrolled').length.toString(), color: 'text-blue-600', bg: 'bg-blue-50' },
                  { label: 'Certificates', value: mockCourses.filter((c) => c.certificate).length.toString(), color: 'text-purple-600', bg: 'bg-purple-50' },
                ].map((stat, i) => (
                  <motion.div key={i} variants={cardVariants} className="bg-white rounded-xl border border-gray-100 p-4">
                    <p className="text-xs text-gray-500">{stat.label}</p>
                    <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
                  </motion.div>
                ))}
              </motion.div>

              {/* Courses List */}
              <motion.div variants={cardVariants} className="bg-white rounded-xl border border-gray-100 p-5">
                <h3 className="font-semibold text-navy text-sm mb-4">Training Courses</h3>
                <div className="space-y-4">
                  {mockCourses.map((course, i) => {
                    const courseStatusConfig: Record<string, { bg: string; text: string; label: string }> = {
                      completed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Completed' },
                      'in-progress': { bg: 'bg-amber-100', text: 'text-amber-700', label: 'In Progress' },
                      enrolled: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Enrolled' },
                    };
                    const cfg = courseStatusConfig[course.status] || courseStatusConfig.enrolled;
                    return (
                      <motion.div
                        key={course.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className="flex items-center gap-4 p-3 rounded-lg hover:bg-cream/50 transition-colors"
                      >
                        <div className={`w-10 h-10 rounded-xl ${course.status === 'completed' ? 'bg-green-50' : course.status === 'in-progress' ? 'bg-amber-50' : 'bg-blue-50'} flex items-center justify-center flex-shrink-0`}>
                          {course.status === 'completed' ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          ) : course.status === 'in-progress' ? (
                            <BookOpen className="w-5 h-5 text-amber-500" />
                          ) : (
                            <Clock className="w-5 h-5 text-blue-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-medium text-navy truncate">{course.title}</p>
                            {course.certificate && (
                              <Award className="w-4 h-4 text-gold flex-shrink-0" />
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 max-w-xs bg-gray-100 rounded-full h-1.5 overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${course.progress}%` }}
                                transition={{ duration: 0.8, delay: 0.2 + i * 0.08 }}
                                className={`h-1.5 rounded-full ${
                                  course.progress === 100 ? 'bg-green-500' :
                                  course.progress > 0 ? 'bg-teal' : 'bg-gray-300'
                                }`}
                              />
                            </div>
                            <span className="text-xs text-gray-400 tabular-nums flex-shrink-0">{course.progress}%</span>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${cfg.bg} ${cfg.text}`}>
                            {cfg.label}
                          </span>
                          {course.completedDate && (
                            <p className="text-[10px] text-gray-400 mt-1">{course.completedDate}</p>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              ACTIVITY TAB
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          {activeTab === 'activity' && (
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
              <motion.div variants={cardVariants} className="bg-white rounded-xl border border-gray-100 p-5">
                <h3 className="font-semibold text-navy text-sm mb-6 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-teal" />
                  Recent Activity Timeline
                </h3>
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-5 top-0 bottom-0 w-px bg-gray-200" />
                  <div className="space-y-0">
                    {mockActivity.map((act, i) => {
                      const config = activityTypeConfig[act.type] || activityTypeConfig.login;
                      const date = new Date(act.timestamp);
                      return (
                        <motion.div
                          key={act.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.06 }}
                          className="relative flex items-start gap-4 pb-6 last:pb-0"
                        >
                          <div className={`relative z-10 w-10 h-10 rounded-full ${config.color} flex items-center justify-center text-white flex-shrink-0`}>
                            {config.icon}
                          </div>
                          <div className="flex-1 min-w-0 pt-1">
                            <p className="text-sm font-medium text-navy">{act.action}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{act.detail}</p>
                            <p className="text-[10px] text-gray-400 mt-1">
                              {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at{' '}
                              {date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
