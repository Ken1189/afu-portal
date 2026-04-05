'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/supabase/auth-context';
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
  Loader2,
} from 'lucide-react';

// ── Fallback data (shown when no supplier record exists) ──

const fallbackSupplier = {
  id: '',
  companyName: 'Zambezi Agri-Supplies',
  contactName: 'Farai Ndlovu',
  email: 'farai@zambezi-agri.co.zw',
  phone: '+263 77 200 1001',
  country: 'Zimbabwe',
  region: 'Harare',
  category: 'input-supplier',
  status: 'active' as const,
  joinDate: '2024-06-15',
  description:
    'Leading agricultural input supplier across Southern Africa. Specializing in certified seeds, fertilizers, and crop protection products for commercial and smallholder farmers.',
  productsCount: 38,
  totalSales: 1847320,
  totalOrders: 4215,
  rating: 4.8,
  reviewCount: 312,
  memberDiscountPercent: 12,
  commissionRate: 8,
  isFounding: true,
  sponsorshipTier: 'platinum' as const,
  verified: true,
  website: 'https://zambezi-agri.co.zw',
  certifications: ['ISO 9001', 'GlobalGAP Approved', 'SADC Trade Certified'],
};

// -- Animation variants -------------------------------------------------------

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

// -- Category helpers ---------------------------------------------------------

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
  const { user, profile, refreshProfile } = useAuth();
  const supabase = createClient();

  const [supplierId, setSupplierId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);

  // -- Editable form state
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');
  const [country, setCountry] = useState('');
  const [region, setRegion] = useState('');
  const [category, setCategory] = useState('');
  const [address, setAddress] = useState('');

  // -- Display-only from DB
  const [joinDate, setJoinDate] = useState('');
  const [rating, setRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [verified, setVerified] = useState(false);
  const [sponsorshipTier, setSponsorshipTier] = useState<string | null>(null);

  // -- Certifications
  const [certifications, setCertifications] = useState<string[]>([]);
  const [newCert, setNewCert] = useState('');
  const [showAddCert, setShowAddCert] = useState(false);

  // -- Banking (display-only)
  const [bankName] = useState('Standard Chartered Zimbabwe');
  const [accountNumber] = useState('****-****-****-4821');
  const [routingCode] = useState('SCBLZWHX');
  const [mobileMoneyNumber] = useState('+263 77 200 1001');

  // ── Populate from data (supplier record or fallback) ──
  const populateFields = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (data: any, isFallback: boolean) => {
      if (isFallback) {
        setCompanyName(data.companyName);
        setContactPerson(data.contactName);
        setEmail(data.email);
        setPhone(data.phone);
        setWebsite(data.website);
        setDescription(data.description);
        setCountry(data.country);
        setRegion(data.region);
        setCategory(data.category);
        setAddress('');
        setJoinDate(data.joinDate);
        setRating(data.rating);
        setReviewCount(data.reviewCount);
        setVerified(data.verified);
        setSponsorshipTier(data.sponsorshipTier);
        setCertifications(data.certifications || []);
      } else {
        setCompanyName(data.company_name || '');
        setContactPerson(data.contact_name || '');
        setEmail(data.email || '');
        setPhone(data.phone || '');
        setWebsite(data.website || '');
        setDescription(data.description || '');
        setCountry(data.country || '');
        setRegion(data.region || '');
        setCategory(data.category || 'input-supplier');
        setAddress(data.address || '');
        setJoinDate(data.created_at || data.join_date || '');
        setRating(data.rating ?? 0);
        setReviewCount(data.review_count ?? 0);
        setVerified(data.verified ?? false);
        setSponsorshipTier(data.sponsorship_tier || null);
        setCertifications(data.certifications || []);
      }
    },
    []
  );

  // ── Fetch supplier record ──
  useEffect(() => {
    async function fetchProfile() {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const { data: supplier } = await supabase
          .from('suppliers')
          .select('*')
          .eq('profile_id', user.id)
          .maybeSingle();

        if (supplier) {
          setSupplierId(supplier.id);
          setUsingFallback(false);
          populateFields(supplier, false);
        } else {
          setUsingFallback(true);
          populateFields(fallbackSupplier, true);
        }
      } catch {
        setUsingFallback(true);
        populateFields(fallbackSupplier, true);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [user, supabase, populateFields]);

  // ── Save all changes ──
  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    try {
      // Update supplier record
      if (supplierId) {
        await supabase
          .from('suppliers')
          .update({
            company_name: companyName,
            contact_name: contactPerson,
            email,
            phone,
            website,
            description,
            country,
            region,
            category,
            address,
            certifications,
          })
          .eq('id', supplierId);
      }

      // Also update profiles table for name/phone
      await supabase
        .from('profiles')
        .update({
          full_name: contactPerson || undefined,
          phone: phone || null,
        })
        .eq('id', user.id);

      await refreshProfile();

      setSaveSuccess(true);
      setEditing(false);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      setSaveError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // ── Cancel editing ──
  const handleCancel = async () => {
    // Re-fetch to reset fields
    if (supplierId) {
      const { data: supplier } = await supabase
        .from('suppliers')
        .select('*')
        .eq('id', supplierId)
        .single();
      if (supplier) populateFields(supplier, false);
    } else {
      populateFields(fallbackSupplier, true);
    }
    setEditing(false);
  };

  // ── Certification helpers ──
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

  // ── Derived ──
  const companyInitials = companyName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'ZA';

  // ── Loading ──
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[#5DB347] animate-spin" />
      </div>
    );
  }

  // ── Reusable display / input field ──
  function DisplayField({
    label,
    value,
    icon: Icon,
    isEditing,
    onChange,
    type = 'text',
    placeholder,
  }: {
    label: string;
    value: string;
    icon?: React.ElementType;
    isEditing: boolean;
    onChange?: (v: string) => void;
    type?: string;
    placeholder?: string;
  }) {
    const isEmpty = !value;
    return (
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5">{label}</label>
        <div className="relative">
          {Icon && (
            <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          )}
          {isEditing && onChange ? (
            <input
              type={type}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder || `Enter ${label.toLowerCase()}...`}
              className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] transition-colors bg-gray-50`}
            />
          ) : (
            <div
              className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 rounded-lg border border-gray-100 text-sm bg-gray-50/70 ${
                isEmpty ? 'text-gray-400 italic' : 'text-[#1B2A4A]'
              }`}
            >
              {value || 'Not set'}
            </div>
          )}
        </div>
      </div>
    );
  }

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
          <div className="w-10 h-10 rounded-xl bg-[#5DB347]/10 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-[#5DB347]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-[#1B2A4A]">Company Profile</h1>
              {verified && (
                <span className="inline-flex items-center gap-1 bg-[#5DB347]/10 text-[#5DB347] text-xs font-semibold px-2.5 py-1 rounded-full">
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

        {/* Edit / Cancel toggle */}
        <button
          onClick={() => {
            if (editing) {
              handleCancel();
            } else {
              setEditing(true);
            }
          }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm ${
            editing
              ? 'bg-gray-200 text-[#1B2A4A] hover:bg-gray-300'
              : 'bg-[#5DB347] hover:bg-[#449933] text-white'
          }`}
        >
          {editing ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
          {editing ? 'Cancel Editing' : 'Edit Profile'}
        </button>
      </motion.div>

      {/* Fallback notice */}
      {usingFallback && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700 flex items-start gap-2">
          <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>
            No supplier record found for your account. Showing sample data. Your edits will be saved
            once a supplier record is linked to your profile.
          </span>
        </div>
      )}

      {/* Save success banner */}
      {saveSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-700 flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          Profile saved successfully!
        </motion.div>
      )}

      {/* =====================================================================
          2. PROFILE HEADER CARD
      ====================================================================== */}
      <motion.div
        variants={cardVariants}
        className="bg-white rounded-xl border border-gray-100 p-6"
      >
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="relative group">
            <div className="w-24 h-24 rounded-2xl bg-[#5DB347] flex items-center justify-center text-white text-3xl font-bold shadow-lg">
              {companyInitials}
            </div>
            {editing && (
              <button className="absolute inset-0 w-24 h-24 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <Upload className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h2 className="text-xl font-bold text-[#1B2A4A]">{companyName || 'Company Name'}</h2>
              {sponsorshipTier && (
                <span className="inline-flex items-center gap-1 bg-[#D4A843]/10 text-[#D4A843] text-xs font-semibold px-2.5 py-1 rounded-full">
                  <Award className="w-3.5 h-3.5" />
                  {sponsorshipTier.charAt(0).toUpperCase() + sponsorshipTier.slice(1)} Sponsor
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-3">
              <span className="flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5" />
                {categoryLabels[category] || category || 'Not set'}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {[region, country].filter(Boolean).join(', ') || 'Not set'}
              </span>
              {joinDate && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Member since{' '}
                  {new Date(joinDate).toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              )}
            </div>
            {rating > 0 && (
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(rating)
                        ? 'text-[#D4A843] fill-[#D4A843]'
                        : i < rating
                          ? 'text-[#D4A843] fill-[#D4A843]/50'
                          : 'text-gray-200'
                    }`}
                  />
                ))}
                <span className="text-sm font-semibold text-[#1B2A4A] ml-1">{rating}</span>
                <span className="text-xs text-gray-400">({reviewCount} reviews)</span>
              </div>
            )}
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
          <FileText className="w-4.5 h-4.5 text-[#5DB347]" />
          Company Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <DisplayField
            label="Company Name"
            value={companyName}
            icon={Building2}
            isEditing={editing}
            onChange={setCompanyName}
          />
          <DisplayField
            label="Contact Person"
            value={contactPerson}
            icon={User}
            isEditing={editing}
            onChange={setContactPerson}
          />
          <DisplayField
            label="Email Address"
            value={email}
            icon={Mail}
            isEditing={editing}
            onChange={setEmail}
            type="email"
          />
          <DisplayField
            label="Phone Number"
            value={phone}
            icon={Phone}
            isEditing={editing}
            onChange={setPhone}
            type="tel"
          />
          <div className="md:col-span-2">
            <DisplayField
              label="Website"
              value={website}
              icon={Globe}
              isEditing={editing}
              onChange={setWebsite}
              type="url"
            />
          </div>
          <div className="md:col-span-2">
            <DisplayField
              label="Address"
              value={address}
              icon={MapPin}
              isEditing={editing}
              onChange={setAddress}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              Company Description
            </label>
            {editing ? (
              <>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] transition-colors bg-gray-50 resize-none"
                />
                <p className="text-[10px] text-gray-400 mt-1">
                  {description.length}/500 characters
                </p>
              </>
            ) : (
              <div className="w-full px-4 py-2.5 rounded-lg border border-gray-100 text-sm bg-gray-50/70 text-[#1B2A4A] whitespace-pre-wrap">
                {description || <span className="text-gray-400 italic">Not set</span>}
              </div>
            )}
          </div>
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
          <Briefcase className="w-4.5 h-4.5 text-[#5DB347]" />
          Business Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Country */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Country</label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              {editing ? (
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] transition-colors bg-gray-50 appearance-none"
                >
                  <option value="">Select country...</option>
                  {['Botswana', 'Kenya', 'Mozambique', 'Nigeria', 'Sierra Leone', 'South Africa', 'Tanzania', 'Uganda', 'Zambia', 'Zimbabwe'].map(
                    (c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    )
                  )}
                </select>
              ) : (
                <div className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-100 text-sm bg-gray-50/70 text-[#1B2A4A]">
                  {country || <span className="text-gray-400 italic">Not set</span>}
                </div>
              )}
            </div>
          </div>

          {/* Region */}
          <DisplayField
            label="Region"
            value={region}
            icon={MapPin}
            isEditing={editing}
            onChange={setRegion}
          />

          {/* Category */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Category</label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              {editing ? (
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] transition-colors bg-gray-50 appearance-none"
                >
                  {categoryOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-100 text-sm bg-gray-50/70 text-[#1B2A4A]">
                  {categoryLabels[category] || category || (
                    <span className="text-gray-400 italic">Not set</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* =====================================================================
          5. SAVE BUTTON (editing mode only)
      ====================================================================== */}
      {editing && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-3"
        >
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-[#5DB347] hover:bg-[#449933] text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-sm disabled:opacity-60"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? 'Saving...' : 'Save All Changes'}
          </button>
          <button
            onClick={handleCancel}
            className="px-6 py-2.5 rounded-xl font-semibold text-sm border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </motion.div>
      )}

      {/* =====================================================================
          6. BANKING DETAILS (display only)
      ====================================================================== */}
      <motion.div
        variants={cardVariants}
        className="bg-white rounded-xl border border-gray-100 p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-[#1B2A4A] text-base flex items-center gap-2">
            <CreditCard className="w-4.5 h-4.5 text-[#5DB347]" />
            Banking Details
          </h3>
          <button className="inline-flex items-center gap-1.5 bg-[#5DB347]/10 text-[#5DB347] hover:bg-[#5DB347]/20 px-4 py-2 rounded-lg text-xs font-medium transition-colors">
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
          7. CERTIFICATIONS
      ====================================================================== */}
      <motion.div
        variants={cardVariants}
        className="bg-white rounded-xl border border-gray-100 p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-[#1B2A4A] text-base flex items-center gap-2">
            <Award className="w-4.5 h-4.5 text-[#5DB347]" />
            Certifications
          </h3>
          {editing && (
            <button
              onClick={() => setShowAddCert(!showAddCert)}
              className="inline-flex items-center gap-1.5 bg-[#5DB347]/10 text-[#5DB347] hover:bg-[#5DB347]/20 px-4 py-2 rounded-lg text-xs font-medium transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Certification
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {certifications.map((cert) => (
            <motion.div
              key={cert}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 bg-[#5DB347]/10 text-[#5DB347] text-sm font-medium px-4 py-2 rounded-full"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {cert}
              {editing && (
                <button
                  onClick={() => handleRemoveCertification(cert)}
                  className="hover:bg-[#5DB347]/20 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </motion.div>
          ))}
          {certifications.length === 0 && (
            <p className="text-sm text-gray-400">No certifications added yet.</p>
          )}
        </div>

        {showAddCert && editing && (
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
              className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] transition-colors bg-gray-50"
            />
            <button
              onClick={handleAddCertification}
              className="bg-[#5DB347] hover:bg-[#449933] text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
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
          8. PUBLIC PROFILE PREVIEW
      ====================================================================== */}
      <motion.div
        variants={cardVariants}
        className="bg-white rounded-xl border border-gray-100 p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-[#1B2A4A] text-base flex items-center gap-2">
            <Eye className="w-4.5 h-4.5 text-[#5DB347]" />
            Public Profile Preview
          </h3>
          <span className="text-xs text-gray-400">How your profile appears to buyers</span>
        </div>

        <div className="border border-gray-200 rounded-xl p-5 bg-gradient-to-br from-gray-50 to-white max-w-md">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-[#5DB347] flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
              {companyInitials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-sm font-bold text-[#1B2A4A] truncate">{companyName || 'Company'}</h4>
                {verified && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#5DB347] flex-shrink-0" />
                )}
              </div>
              {rating > 0 && (
                <div className="flex items-center gap-1 mb-1.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${
                        i < Math.floor(rating)
                          ? 'text-[#D4A843] fill-[#D4A843]'
                          : 'text-gray-200'
                      }`}
                    />
                  ))}
                  <span className="text-[10px] text-gray-400 ml-1">
                    {rating} ({reviewCount})
                  </span>
                </div>
              )}
              <div className="flex flex-wrap items-center gap-2 text-[10px] text-gray-400">
                <span className="flex items-center gap-0.5">
                  <MapPin className="w-2.5 h-2.5" />
                  {[region, country].filter(Boolean).join(', ') || 'Location not set'}
                </span>
                <span className="flex items-center gap-0.5">
                  <Briefcase className="w-2.5 h-2.5" />
                  {categoryLabels[category] || category || 'Category not set'}
                </span>
              </div>
              {description && (
                <p className="text-xs text-gray-500 mt-2 line-clamp-2">{description}</p>
              )}
              {certifications.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {certifications.slice(0, 3).map((cert) => (
                    <span
                      key={cert}
                      className="text-[9px] bg-[#5DB347]/10 text-[#5DB347] font-medium px-1.5 py-0.5 rounded-full"
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
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
