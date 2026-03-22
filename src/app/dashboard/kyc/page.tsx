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
import { useFarmerReferences, RELATIONSHIP_OPTIONS } from '@/lib/supabase/use-farmer-references';
import { Phone, UserCheck, Users } from 'lucide-react';

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
    color: 'from-[#8CB89C]/10 to-[#8CB89C]/5',
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

  const { references, loading: refsLoading, addReference, deleteReference } = useFarmerReferences();

  const [uploadingType, setUploadingType] = useState<DocumentType | null>(null);
  const [uploadForm, setUploadForm] = useState({ documentNumber: '', fileUrl: '' });
  const [submitting, setSubmitting] = useState(false);

  // Reference form
  const [showRefForm, setShowRefForm] = useState(false);
  const [refSubmitting, setRefSubmitting] = useState(false);
  const [refForm, setRefForm] = useState({
    reference_name: '',
    relationship: '',
    relationship_other: '',
    phone_number: '',
    location: '',
    years_known: '',
    statement: '',
  });

  const handleAddReference = async () => {
    setRefSubmitting(true);
    const { error } = await addReference({
      reference_name: refForm.reference_name,
      relationship: refForm.relationship,
      relationship_other: refForm.relationship_other || undefined,
      phone_number: refForm.phone_number,
      location: refForm.location || undefined,
      years_known: refForm.years_known ? Number(refForm.years_known) : undefined,
      statement: refForm.statement || undefined,
      is_primary: references.length === 0,
    });
    setRefSubmitting(false);
    if (!error) {
      setShowRefForm(false);
      setRefForm({ reference_name: '', relationship: '', relationship_other: '', phone_number: '', location: '', years_known: '', statement: '' });
    }
  };

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
          className="bg-gradient-to-br from-navy to-[#8CB89C] rounded-2xl p-5 text-white"
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

      {/* Character References */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#5DB347]/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-[#5DB347]" />
              </div>
              <div>
                <h2 className="text-base font-bold text-navy">Character References</h2>
                <p className="text-xs text-gray-500 mt-0.5">Community leaders or established farmers who can vouch for you</p>
              </div>
            </div>
            {!showRefForm && references.length < 3 && (
              <button
                onClick={() => setShowRefForm(true)}
                className="bg-[#5DB347] hover:bg-[#449933] text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors"
              >
                + Add Reference
              </button>
            )}
          </div>
        </div>

        <div className="p-4 sm:p-5 space-y-3">
          {/* Existing references */}
          {refsLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            </div>
          ) : references.length > 0 ? (
            references.map((ref) => {
              const relLabel = RELATIONSHIP_OPTIONS.find(r => r.value === ref.relationship)?.label || ref.relationship;
              const StatusIcon = ref.verification_status === 'verified' ? CheckCircle2 :
                ref.verification_status === 'failed' ? XCircle :
                ref.verification_status === 'contacted' ? Phone : Clock;
              const statusColor = ref.verification_status === 'verified' ? 'text-green-600 bg-green-50' :
                ref.verification_status === 'failed' ? 'text-red-500 bg-red-50' :
                ref.verification_status === 'contacted' ? 'text-blue-500 bg-blue-50' : 'text-amber-500 bg-amber-50';

              return (
                <div key={ref.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
                    <UserCheck className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-navy text-sm">{ref.reference_name}</p>
                        <p className="text-xs text-gray-500">{relLabel}{ref.years_known ? ` \u2022 Known ${ref.years_known} years` : ''}</p>
                        {ref.location && <p className="text-xs text-gray-400">{ref.location}</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 ${statusColor}`}>
                          <StatusIcon className="w-3 h-3" />
                          {ref.verification_status}
                        </span>
                        {ref.is_primary && (
                          <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-[#5DB347]/10 text-[#5DB347]">Primary</span>
                        )}
                      </div>
                    </div>
                    {ref.statement && <p className="text-xs text-gray-500 mt-1 italic">&quot;{ref.statement}&quot;</p>}
                    <p className="text-xs text-gray-400 mt-1">Phone: {ref.phone_number}</p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-6">
              <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-500">No references added yet</p>
              <p className="text-xs text-gray-400 mt-1">Add at least one character reference to strengthen your application</p>
            </div>
          )}

          {/* Add reference form */}
          {showRefForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-white border border-[#5DB347]/20 rounded-xl p-4 space-y-3"
            >
              <h3 className="text-sm font-bold text-navy flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#5DB347]" />
                Add Character Reference
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={refForm.reference_name}
                    onChange={(e) => setRefForm(f => ({ ...f, reference_name: e.target.value }))}
                    placeholder="e.g., Chief Moyo"
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Relationship *</label>
                  <select
                    value={refForm.relationship}
                    onChange={(e) => setRefForm(f => ({ ...f, relationship: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none"
                  >
                    <option value="">Select relationship</option>
                    {RELATIONSHIP_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                {refForm.relationship === 'other' && (
                  <div className="sm:col-span-2">
                    <label className="text-xs font-medium text-gray-600 block mb-1">Specify Relationship</label>
                    <input
                      type="text"
                      value={refForm.relationship_other}
                      onChange={(e) => setRefForm(f => ({ ...f, relationship_other: e.target.value }))}
                      placeholder="Describe the relationship"
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none"
                    />
                  </div>
                )}
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    value={refForm.phone_number}
                    onChange={(e) => setRefForm(f => ({ ...f, phone_number: e.target.value }))}
                    placeholder="+267 7X XXX XXXX"
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Location</label>
                  <input
                    type="text"
                    value={refForm.location}
                    onChange={(e) => setRefForm(f => ({ ...f, location: e.target.value }))}
                    placeholder="Village / District"
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Years Known</label>
                  <input
                    type="number"
                    value={refForm.years_known}
                    onChange={(e) => setRefForm(f => ({ ...f, years_known: e.target.value }))}
                    placeholder="e.g., 5"
                    min="1"
                    max="50"
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-gray-600 block mb-1">Reference Statement (optional)</label>
                  <textarea
                    value={refForm.statement}
                    onChange={(e) => setRefForm(f => ({ ...f, statement: e.target.value }))}
                    placeholder="Brief statement about the farmer's character, reliability, and farming capability..."
                    rows={2}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setShowRefForm(false)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-gray-500 border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddReference}
                  disabled={!refForm.reference_name || !refForm.relationship || !refForm.phone_number || refSubmitting}
                  className="flex-1 bg-[#5DB347] hover:bg-[#449933] disabled:bg-gray-200 disabled:text-gray-400 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  {refSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserCheck className="w-3.5 h-3.5" />}
                  Save Reference
                </button>
              </div>
            </motion.div>
          )}
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
