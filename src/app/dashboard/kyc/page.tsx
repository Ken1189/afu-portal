'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Shield,
  CheckCircle2,
  Clock,
  XCircle,
  Upload,
  FileText,
  User,
  MapPin,
  CreditCard,
  Camera,
  Building2,
  AlertTriangle,
  Star,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useKyc, useCreditScore, type DocumentType } from '@/lib/supabase/use-kyc';

/* ------------------------------------------------------------------ */
/* Config                                                              */
/* ------------------------------------------------------------------ */
const DOCUMENT_CONFIG: Record<DocumentType, { label: string; icon: typeof FileText; description: string; tier: 1 | 2 | 3 }> = {
  national_id: { label: 'National ID', icon: CreditCard, description: 'Government-issued national identity card', tier: 2 },
  passport: { label: 'Passport', icon: FileText, description: 'Valid passport (bio page)', tier: 2 },
  drivers_license: { label: "Driver's License", icon: CreditCard, description: 'Valid driving license', tier: 2 },
  proof_of_address: { label: 'Proof of Address', icon: MapPin, description: 'Utility bill or bank statement (< 3 months)', tier: 2 },
  bank_statement: { label: 'Bank Statement', icon: Building2, description: 'Recent bank statement showing account details', tier: 3 },
  farm_registration: { label: 'Farm Registration', icon: FileText, description: 'Land title, lease, or cooperative membership proof', tier: 2 },
  selfie: { label: 'Selfie with ID', icon: Camera, description: 'Photo of yourself holding your ID document', tier: 2 },
  source_of_funds: { label: 'Source of Funds', icon: FileText, description: 'Documentation proving income or fund sources', tier: 3 },
};

const TIER_CONFIG = [
  {
    tier: 1,
    name: 'Basic',
    limit: '$500/month',
    requirements: ['Phone number', 'Full name'],
    color: 'from-gray-100 to-gray-50',
    borderColor: 'border-gray-200',
  },
  {
    tier: 2,
    name: 'Standard',
    limit: '$5,000/month',
    requirements: ['National ID or Passport', 'Selfie with ID', 'Proof of Address'],
    color: 'from-teal/10 to-teal/5',
    borderColor: 'border-teal/30',
  },
  {
    tier: 3,
    name: 'Premium',
    limit: 'Unlimited',
    requirements: ['All Tier 2 docs', 'Bank Statement', 'Source of Funds'],
    color: 'from-gold/10 to-gold/5',
    borderColor: 'border-gold/30',
  },
];

const STATUS_ICONS = {
  pending: Clock,
  verified: CheckCircle2,
  rejected: XCircle,
  expired: AlertTriangle,
};

const STATUS_COLORS = {
  pending: 'text-amber-500 bg-amber-50',
  verified: 'text-teal bg-teal/10',
  rejected: 'text-red-500 bg-red-50',
  expired: 'text-gray-500 bg-gray-100',
};

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */
export default function KycPage() {
  const { t } = useLanguage();
  const { documents, currentTier, loading: kycLoading, uploadDocument } = useKyc();
  const { creditScore, loading: scoreLoading } = useCreditScore();

  const [uploadingType, setUploadingType] = useState<DocumentType | null>(null);
  const [uploadForm, setUploadForm] = useState({ documentNumber: '', fileUrl: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleUpload = async () => {
    if (!uploadingType || !uploadForm.fileUrl) return;
    setSubmitting(true);

    await uploadDocument({
      document_type: uploadingType,
      document_number: uploadForm.documentNumber || undefined,
      file_url: uploadForm.fileUrl,
    });

    setUploadingType(null);
    setUploadForm({ documentNumber: '', fileUrl: '' });
    setSubmitting(false);
  };

  const getDocStatus = (docType: DocumentType) => {
    const doc = documents.find((d) => d.document_type === docType);
    return doc?.verification_status || null;
  };

  const currentTierNumber = currentTier ? parseInt(currentTier.replace('tier_', '')) : 1;

  return (
    <div className="px-4 py-5 sm:px-6 lg:px-8 space-y-6">
      {/* Back */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-navy transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-navy">Identity Verification</h1>
          <p className="text-sm text-gray-500 mt-1">
            Verify your identity to unlock higher transaction limits and more features
          </p>
        </div>
        <div className={`px-3 py-1.5 rounded-full text-xs font-bold ${
          currentTierNumber >= 3 ? 'bg-gold/15 text-gold' : currentTierNumber >= 2 ? 'bg-teal/10 text-teal' : 'bg-gray-100 text-gray-500'
        }`}>
          Tier {currentTierNumber}
        </div>
      </div>

      {/* Tier Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {TIER_CONFIG.map((tier) => {
          const isCurrentTier = tier.tier === currentTierNumber;
          const isCompleted = tier.tier < currentTierNumber;

          return (
            <motion.div
              key={tier.tier}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: tier.tier * 0.1 }}
              className={`rounded-xl border-2 p-4 bg-gradient-to-br ${tier.color} ${
                isCurrentTier ? tier.borderColor + ' shadow-sm' : 'border-gray-100'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-navy text-sm">Tier {tier.tier}: {tier.name}</h3>
                {isCompleted && <CheckCircle2 className="w-4 h-4 text-teal" />}
                {isCurrentTier && <Star className="w-4 h-4 text-gold" />}
              </div>
              <p className="text-xs text-gray-500 mb-2">Up to {tier.limit}</p>
              <ul className="space-y-1">
                {tier.requirements.map((req) => (
                  <li key={req} className="text-xs text-gray-600 flex items-center gap-1.5">
                    {isCompleted ? (
                      <CheckCircle2 className="w-3 h-3 text-teal flex-shrink-0" />
                    ) : (
                      <div className="w-3 h-3 rounded-full border border-gray-300 flex-shrink-0" />
                    )}
                    {req}
                  </li>
                ))}
              </ul>
            </motion.div>
          );
        })}
      </div>

      {/* Credit Score Card */}
      {!scoreLoading && creditScore && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-navy to-teal rounded-2xl p-5 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs opacity-75 uppercase tracking-wider">AFU Credit Score</p>
              <p className="text-3xl font-bold mt-1">{creditScore.score}</p>
              <p className="text-sm opacity-85 capitalize mt-0.5">{creditScore.tier.replace('_', ' ')}</p>
            </div>
            <div className="w-16 h-16 rounded-full bg-white/15 flex items-center justify-center">
              <Shield className="w-8 h-8" />
            </div>
          </div>
          {creditScore.max_loan_amount && (
            <p className="text-xs opacity-75 mt-3">
              Maximum loan eligibility: ${creditScore.max_loan_amount.toLocaleString()}
            </p>
          )}
        </motion.div>
      )}

      {/* Document Upload Section */}
      <div>
        <h2 className="text-base font-bold text-navy mb-3">Documents</h2>
        <div className="space-y-2">
          {(Object.entries(DOCUMENT_CONFIG) as [DocumentType, typeof DOCUMENT_CONFIG[DocumentType]][]).map(([type, config]) => {
            const status = getDocStatus(type);
            const StatusIcon = status ? STATUS_ICONS[status] : Upload;
            const statusColor = status ? STATUS_COLORS[status] : 'text-gray-400 bg-gray-50';
            const Icon = config.icon;

            return (
              <div key={type}>
                <button
                  onClick={() => !status || status === 'rejected' ? setUploadingType(type) : undefined}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all text-left min-h-[60px] ${
                    status === 'verified'
                      ? 'border-teal/20 bg-teal/5'
                      : 'border-gray-100 bg-white hover:border-gray-200'
                  }`}
                >
                  <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-navy">{config.label}</p>
                    <p className="text-xs text-gray-400 truncate">{config.description}</p>
                  </div>
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Upload'}
                  </div>
                  {(!status || status === 'rejected') && (
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  )}
                </button>

                {/* Upload form */}
                {uploadingType === type && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 ml-4 border-l-2 border-teal/20 space-y-3 mt-2">
                      <div>
                        <label className="text-xs font-medium text-gray-600 block mb-1">Document Number</label>
                        <input
                          type="text"
                          value={uploadForm.documentNumber}
                          onChange={(e) => setUploadForm((f) => ({ ...f, documentNumber: e.target.value }))}
                          placeholder="e.g., ID12345678"
                          className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-teal/30 focus:border-teal outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600 block mb-1">Document URL</label>
                        <input
                          type="url"
                          value={uploadForm.fileUrl}
                          onChange={(e) => setUploadForm((f) => ({ ...f, fileUrl: e.target.value }))}
                          placeholder="https://storage.example.com/doc.pdf"
                          className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-teal/30 focus:border-teal outline-none"
                        />
                        <p className="text-xs text-gray-400 mt-1">Upload your document to storage first, then paste the URL here</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setUploadingType(null)}
                          className="px-4 py-2 rounded-lg text-xs font-medium text-gray-500 border border-gray-200 hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleUpload}
                          disabled={!uploadForm.fileUrl || submitting}
                          className="flex-1 bg-teal hover:bg-teal-dark disabled:bg-gray-200 disabled:text-gray-400 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                        >
                          {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                          Submit Document
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Security Note */}
      <div className="flex items-start gap-3 bg-blue-50/50 rounded-xl p-4">
        <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-semibold text-navy">Your data is secure</p>
          <p className="text-xs text-gray-500 mt-0.5">
            All documents are encrypted and stored securely. We comply with data protection regulations in all operating countries.
          </p>
        </div>
      </div>
    </div>
  );
}
