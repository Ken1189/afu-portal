'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  User,
  Mail,
  Phone,
  Globe,
  MapPin,
  FileText,
  CreditCard,
  Shield,
  Star,
  CheckCircle2,
  Upload,
  Plus,
  X,
  Edit3,
  Eye,
  Calendar,
  Award,
  Briefcase,
  Smartphone,
  Save,
} from 'lucide-react';
import { suppliers as mockSuppliers } from '@/lib/data/suppliers';
const suppliers = mockSuppliers;

// -- Animation variants -------------------------------------------------------

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

// -- Current supplier ---------------------------------------------------------

const currentSupplier = suppliers.find((s) => s.id === 'SUP-001')!;

// -- Category labels ----------------------------------------------------------

const categoryLabels: Record<string, string> = {
  'input-supplier': 'Input Supplier',
  equipment: 'Equipment',
  logistics: 'Logistics',
  processing: 'Processing',
  technology: 'Technology',
  'financial-services': 'Financial Services',
};

const categoryOptions = [
  { value: 'input-supplier', label: 'Input Supplier' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'logistics', label: 'Logistics' },
  { value: 'processing', label: 'Processing' },
  { value: 'technology', label: 'Technology' },
  { value: 'financial-services', label: 'Financial Services' },
];

// =============================================================================
//  MAIN COMPONENT
// =============================================================================

export default function SupplierProfilePage() {
  // -- Company details form state
  const [companyName, setCompanyName] = useState(currentSupplier.companyName);
  const [contactPerson, setContactPerson] = useState(currentSupplier.contactName);
  const [email, setEmail] = useState(currentSupplier.email);
  const [phone, setPhone] = useState(currentSupplier.phone);
  const [website, setWebsite] = useState(currentSupplier.website);
  const [description, setDescription] = useState(currentSupplier.description);

  // -- Business information form state
  const [country, setCountry] = useState(currentSupplier.country);
  const [region, setRegion] = useState(currentSupplier.region);
  const [category, setCategory] = useState(currentSupplier.category);
  const [regNumber, setRegNumber] = useState('ZW-BR-2024-001847');

  // -- Banking details
  const [bankName] = useState('Standard Chartered Zimbabwe');
  const [accountNumber] = useState('****-****-****-4821');
  const [routingCode] = useState('SCBLZWHX');
  const [mobileMoneyNumber] = useState('+263 77 200 1001');

  // -- Certifications
  const [certifications, setCertifications] = useState<string[]>([
    'ISO 9001',
    'Africa Green Mark',
    'Fair Trade',
  ]);
  const [newCert, setNewCert] = useState('');
  const [showAddCert, setShowAddCert] = useState(false);

  // -- Save states
  const [companySaved, setCompanySaved] = useState(false);
  const [businessSaved, setBusinessSaved] = useState(false);

  const handleSaveCompany = () => {
    setCompanySaved(true);
    setTimeout(() => setCompanySaved(false), 2000);
  };

  const handleSaveBusiness = () => {
    setBusinessSaved(true);
    setTimeout(() => setBusinessSaved(false), 2000);
  };

  const handleAddCertification = () => {
    if (newCert.trim() && !certifications.includes(newCert.trim())) {
      setCertifications((prev) => [...prev, newCert.trim()]);
      setNewCert('');
      setShowAddCert(false);
    }
  };

  const handleRemoveCertification = (cert: string) => {
    setCertifications((prev) => prev.filter((c) => c !== cert));
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* =====================================================================
          1. PAGE HEADER
      ====================================================================== */}
      <motion.div
        variants={fadeUp}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#2AA198]/10 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-[#2AA198]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-[#1B2A4A]">Company Profile</h1>
              {currentSupplier.verified && (
                <span className="inline-flex items-center gap-1 bg-[#2AA198]/10 text-[#2AA198] text-xs font-semibold px-2.5 py-1 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Verified
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-0.5">
              Manage your company information and public profile
            </p>
          </div>
        </div>
      </motion.div>

      {/* =====================================================================
          2. PROFILE HEADER CARD
      ====================================================================== */}
      <motion.div
        variants={cardVariants}
        className="bg-white rounded-xl border border-gray-100 p-6"
      >
        <div className="flex flex-col sm:flex-row items-start gap-6">
          {/* Logo placeholder */}
          <div className="relative group">
            <div className="w-24 h-24 rounded-2xl bg-[#2AA198] flex items-center justify-center text-white text-3xl font-bold shadow-lg">
              ZA
            </div>
            <button className="absolute inset-0 w-24 h-24 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
              <Upload className="w-5 h-5" />
            </button>
          </div>

          {/* Company info */}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h2 className="text-xl font-bold text-[#1B2A4A]">{currentSupplier.companyName}</h2>
              {currentSupplier.sponsorshipTier && (
                <span className="inline-flex items-center gap-1 bg-[#D4A843]/10 text-[#D4A843] text-xs font-semibold px-2.5 py-1 rounded-full">
                  <Award className="w-3.5 h-3.5" />
                  {currentSupplier.sponsorshipTier.charAt(0).toUpperCase() +
                    currentSupplier.sponsorshipTier.slice(1)}{' '}
                  Sponsor
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-3">
              <span className="flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5" />
                {categoryLabels[currentSupplier.category] || currentSupplier.category}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {currentSupplier.region}, {currentSupplier.country}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Member since{' '}
                {new Date(currentSupplier.joinDate).toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(currentSupplier.rating)
                        ? 'text-[#D4A843] fill-[#D4A843]'
                        : i < currentSupplier.rating
                          ? 'text-[#D4A843] fill-[#D4A843]/50'
                          : 'text-gray-200'
                    }`}
                  />
                ))}
                <span className="text-sm font-semibold text-[#1B2A4A] ml-1">
                  {currentSupplier.rating}
                </span>
                <span className="text-xs text-gray-400">
                  ({currentSupplier.reviewCount} reviews)
                </span>
              </div>
              <button className="text-xs text-[#2AA198] hover:text-[#1A7A72] font-medium flex items-center gap-1 transition-colors">
                <Upload className="w-3.5 h-3.5" />
                Upload Logo
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* =====================================================================
          3. COMPANY DETAILS
      ====================================================================== */}
      <motion.div
        variants={cardVariants}
        className="bg-white rounded-xl border border-gray-100 p-6"
      >
        <h3 className="font-semibold text-[#1B2A4A] text-base flex items-center gap-2 mb-5">
          <FileText className="w-4.5 h-4.5 text-[#2AA198]" />
          Company Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Company Name */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Company Name</label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2AA198]/30 focus:border-[#2AA198] transition-colors bg-gray-50"
              />
            </div>
          </div>

          {/* Contact Person */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              Contact Person
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2AA198]/30 focus:border-[#2AA198] transition-colors bg-gray-50"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2AA198]/30 focus:border-[#2AA198] transition-colors bg-gray-50"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2AA198]/30 focus:border-[#2AA198] transition-colors bg-gray-50"
              />
            </div>
          </div>

          {/* Website */}
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Website</label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2AA198]/30 focus:border-[#2AA198] transition-colors bg-gray-50"
              />
            </div>
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              Company Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2AA198]/30 focus:border-[#2AA198] transition-colors bg-gray-50 resize-none"
            />
            <p className="text-[10px] text-gray-400 mt-1">{description.length}/500 characters</p>
          </div>
        </div>
        <div className="flex justify-end mt-5">
          <button
            onClick={handleSaveCompany}
            className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm ${
              companySaved
                ? 'bg-green-500 text-white'
                : 'bg-[#2AA198] hover:bg-[#1A7A72] text-white'
            }`}
          >
            {companySaved ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Saved!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </motion.div>

      {/* =====================================================================
          4. BUSINESS INFORMATION
      ====================================================================== */}
      <motion.div
        variants={cardVariants}
        className="bg-white rounded-xl border border-gray-100 p-6"
      >
        <h3 className="font-semibold text-[#1B2A4A] text-base flex items-center gap-2 mb-5">
          <Briefcase className="w-4.5 h-4.5 text-[#2AA198]" />
          Business Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Country */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Country</label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value as typeof country)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2AA198]/30 focus:border-[#2AA198] transition-colors bg-gray-50 appearance-none"
              >
                <option value="Botswana">Botswana</option>
                <option value="Zimbabwe">Zimbabwe</option>
                <option value="Tanzania">Tanzania</option>
              </select>
            </div>
          </div>

          {/* Region */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Region</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2AA198]/30 focus:border-[#2AA198] transition-colors bg-gray-50"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Category</label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as typeof category)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2AA198]/30 focus:border-[#2AA198] transition-colors bg-gray-50 appearance-none"
              >
                {categoryOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Registration Number */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              Business Registration Number
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={regNumber}
                onChange={(e) => setRegNumber(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2AA198]/30 focus:border-[#2AA198] transition-colors bg-gray-50"
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end mt-5">
          <button
            onClick={handleSaveBusiness}
            className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm ${
              businessSaved
                ? 'bg-green-500 text-white'
                : 'bg-[#2AA198] hover:bg-[#1A7A72] text-white'
            }`}
          >
            {businessSaved ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Saved!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </motion.div>

      {/* =====================================================================
          5. BANKING DETAILS
      ====================================================================== */}
      <motion.div
        variants={cardVariants}
        className="bg-white rounded-xl border border-gray-100 p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-[#1B2A4A] text-base flex items-center gap-2">
            <CreditCard className="w-4.5 h-4.5 text-[#2AA198]" />
            Banking Details
          </h3>
          <button className="inline-flex items-center gap-1.5 bg-[#2AA198]/10 text-[#2AA198] hover:bg-[#2AA198]/20 px-4 py-2 rounded-lg text-xs font-medium transition-colors">
            <Edit3 className="w-3.5 h-3.5" />
            Edit Banking
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-400 mb-1">Bank Name</p>
            <p className="text-sm font-medium text-[#1B2A4A]">{bankName}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-400 mb-1">Account Number</p>
            <p className="text-sm font-medium text-[#1B2A4A] font-mono tracking-wider">
              {accountNumber}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-400 mb-1">SWIFT / Routing Code</p>
            <p className="text-sm font-medium text-[#1B2A4A] font-mono">{routingCode}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-1 mb-1">
              <Smartphone className="w-3 h-3 text-gray-400" />
              <p className="text-xs text-gray-400">Mobile Money Number</p>
            </div>
            <p className="text-sm font-medium text-[#1B2A4A]">{mobileMoneyNumber}</p>
          </div>
        </div>
        <div className="mt-4 bg-amber-50 rounded-lg p-3 flex items-start gap-2">
          <Shield className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700">
            Banking details are encrypted and only visible to authorized AFU finance administrators.
            Changes require verification.
          </p>
        </div>
      </motion.div>

      {/* =====================================================================
          6. CERTIFICATIONS
      ====================================================================== */}
      <motion.div
        variants={cardVariants}
        className="bg-white rounded-xl border border-gray-100 p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-[#1B2A4A] text-base flex items-center gap-2">
            <Award className="w-4.5 h-4.5 text-[#2AA198]" />
            Certifications
          </h3>
          <button
            onClick={() => setShowAddCert(!showAddCert)}
            className="inline-flex items-center gap-1.5 bg-[#2AA198]/10 text-[#2AA198] hover:bg-[#2AA198]/20 px-4 py-2 rounded-lg text-xs font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Certification
          </button>
        </div>

        {/* Certification badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          {certifications.map((cert) => (
            <motion.div
              key={cert}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="inline-flex items-center gap-2 bg-[#2AA198]/10 text-[#2AA198] text-sm font-medium px-4 py-2 rounded-full"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {cert}
              <button
                onClick={() => handleRemoveCertification(cert)}
                className="hover:bg-[#2AA198]/20 rounded-full p-0.5 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.div>
          ))}
          {certifications.length === 0 && (
            <p className="text-sm text-gray-400">No certifications added yet.</p>
          )}
        </div>

        {/* Add certification input */}
        {showAddCert && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="flex items-center gap-3"
          >
            <input
              type="text"
              value={newCert}
              onChange={(e) => setNewCert(e.target.value)}
              placeholder="Enter certification name..."
              onKeyDown={(e) => e.key === 'Enter' && handleAddCertification()}
              className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2AA198]/30 focus:border-[#2AA198] transition-colors bg-gray-50"
            />
            <button
              onClick={handleAddCertification}
              className="bg-[#2AA198] hover:bg-[#1A7A72] text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
            >
              Add
            </button>
            <button
              onClick={() => {
                setShowAddCert(false);
                setNewCert('');
              }}
              className="text-gray-400 hover:text-gray-600 p-2 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </motion.div>

      {/* =====================================================================
          7. PUBLIC PROFILE PREVIEW
      ====================================================================== */}
      <motion.div
        variants={cardVariants}
        className="bg-white rounded-xl border border-gray-100 p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-[#1B2A4A] text-base flex items-center gap-2">
            <Eye className="w-4.5 h-4.5 text-[#2AA198]" />
            Public Profile Preview
          </h3>
          <span className="text-xs text-gray-400">How your profile appears to buyers</span>
        </div>

        {/* Preview card */}
        <div className="border border-gray-200 rounded-xl p-5 bg-gradient-to-br from-gray-50 to-white max-w-md">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-[#2AA198] flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
              ZA
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-sm font-bold text-[#1B2A4A] truncate">{companyName}</h4>
                {currentSupplier.verified && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2AA198] flex-shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-1 mb-1.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${
                      i < Math.floor(currentSupplier.rating)
                        ? 'text-[#D4A843] fill-[#D4A843]'
                        : 'text-gray-200'
                    }`}
                  />
                ))}
                <span className="text-[10px] text-gray-400 ml-1">
                  {currentSupplier.rating} ({currentSupplier.reviewCount})
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-[10px] text-gray-400">
                <span className="flex items-center gap-0.5">
                  <MapPin className="w-2.5 h-2.5" />
                  {region}, {country}
                </span>
                <span className="flex items-center gap-0.5">
                  <Briefcase className="w-2.5 h-2.5" />
                  {categoryLabels[category] || category}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-2 line-clamp-2">{description}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {certifications.slice(0, 3).map((cert) => (
                  <span
                    key={cert}
                    className="text-[9px] bg-[#2AA198]/10 text-[#2AA198] font-medium px-1.5 py-0.5 rounded-full"
                  >
                    {cert}
                  </span>
                ))}
                {certifications.length > 3 && (
                  <span className="text-[9px] text-gray-400">
                    +{certifications.length - 3} more
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
