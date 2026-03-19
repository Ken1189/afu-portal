'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShieldCheck,
  Edit3,
  Save,
  X,
  Camera,
  Award,
  Sprout,
  Ruler,
  Leaf,
  Star,
  CreditCard,
  FileCheck,
  AlertCircle,
  CheckCircle2,
  Clock,
  TrendingUp,
  Banknote,
  Globe2,
  Lock,
  Key,
  Smartphone,
  History,
  ChevronRight,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { members as mockMembers, type Member } from '@/lib/data/members';

const members = mockMembers;

/* ------------------------------------------------------------------ */
/*  Use first member as the logged-in user for demo                    */
/* ------------------------------------------------------------------ */
const me: Member = members[0];

const tierConfig: Record<string, { label: string; cls: string; badge: string }> = {
  smallholder: { label: 'Tier A: Smallholder', cls: 'from-emerald-500 to-teal', badge: 'bg-emerald-500' },
  commercial: { label: 'Tier B: Commercial', cls: 'from-blue-600 to-teal', badge: 'bg-blue-600' },
  enterprise: { label: 'Tier C: Enterprise', cls: 'from-purple-600 to-indigo-600', badge: 'bg-purple-600' },
  partner: { label: 'Tier D: Partner', cls: 'from-gold to-amber-600', badge: 'bg-gold' },
};

const kycConfig: Record<string, { label: string; cls: string; icon: React.ElementType }> = {
  complete: { label: 'Verified', cls: 'bg-green-50 text-green-700', icon: CheckCircle2 },
  partial: { label: 'Partial', cls: 'bg-amber-50 text-amber-700', icon: Clock },
  pending: { label: 'Pending', cls: 'bg-red-50 text-red-700', icon: AlertCircle },
};

type Tab = 'personal' | 'farm' | 'security' | 'activity';

const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: 'personal', label: 'Personal Info', icon: User },
  { key: 'farm', label: 'Farm Details', icon: Sprout },
  { key: 'security', label: 'Security', icon: Lock },
  { key: 'activity', label: 'Activity', icon: History },
];

/* ---------- Input helper ---------- */
function Field({
  label,
  value,
  editing,
  type = 'text',
  icon: Icon,
}: {
  label: string;
  value: string;
  editing: boolean;
  type?: string;
  icon?: React.ElementType;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1.5">{label}</label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        )}
        <input
          type={type}
          disabled={!editing}
          defaultValue={value}
          className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 border border-gray-200 rounded-lg text-sm disabled:bg-cream/70 disabled:text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal/50 transition-colors`}
        />
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('personal');
  const [copied, setCopied] = useState(false);

  const tier = tierConfig[me.tier] || tierConfig.smallholder;
  const kyc = kycConfig[me.kycStatus] || kycConfig.pending;
  const KycIcon = kyc.icon;
  const initials = `${me.firstName[0]}${me.lastName[0]}`;

  const handleCopyId = () => {
    navigator.clipboard.writeText(me.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const completionItems = [
    { label: 'Personal Info', done: true },
    { label: 'Farm Details', done: true },
    { label: 'KYC Documents', done: me.kycStatus === 'complete' },
    { label: 'Bank Account', done: true },
    { label: 'Farm Photos', done: false },
    { label: 'Certifications', done: me.profileCompleteness > 85 },
  ];

  const activityLog = [
    { date: 'Mar 12, 2026', action: 'Logged in from Gaborone, BW', type: 'login' as const },
    { date: 'Mar 10, 2026', action: 'Updated farm size details', type: 'edit' as const },
    { date: 'Mar 8, 2026', action: 'Submitted financing application FIN-2026-028', type: 'finance' as const },
    { date: 'Mar 5, 2026', action: 'Uploaded Farm Inspection Report Q1', type: 'document' as const },
    { date: 'Mar 1, 2026', action: 'Completed "Pest Management" training course', type: 'training' as const },
    { date: 'Feb 28, 2026', action: 'Changed password successfully', type: 'security' as const },
    { date: 'Feb 20, 2026', action: 'Logged delivery for OFT-001 (2,500 kg)', type: 'delivery' as const },
    { date: 'Feb 15, 2026', action: 'Updated profile photo', type: 'edit' as const },
  ];

  const activityIcons: Record<string, { icon: React.ElementType; color: string }> = {
    login: { icon: Globe2, color: 'text-blue-500 bg-blue-50' },
    edit: { icon: Edit3, color: 'text-teal bg-teal/10' },
    finance: { icon: Banknote, color: 'text-gold bg-gold/10' },
    document: { icon: FileCheck, color: 'text-purple-500 bg-purple-50' },
    training: { icon: Award, color: 'text-green-500 bg-green-50' },
    security: { icon: Lock, color: 'text-red-500 bg-red-50' },
    delivery: { icon: Leaf, color: 'text-emerald-500 bg-emerald-50' },
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-navy">My Profile</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage your account, farm details, and security settings
          </p>
        </div>
        <button
          onClick={() => setEditing(!editing)}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm ${
            editing
              ? 'bg-gray-200 text-navy hover:bg-gray-300'
              : 'bg-teal hover:bg-teal-dark text-white'
          }`}
        >
          {editing ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
          {editing ? 'Cancel Editing' : 'Edit Profile'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ==================== LEFT COLUMN ==================== */}
        <div className="lg:col-span-4 space-y-6">
          {/* Member Card */}
          <div className={`bg-gradient-to-br ${tier.cls} rounded-2xl p-6 text-white relative overflow-hidden`}>
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-4 right-4 w-32 h-32 border border-white/30 rounded-full" />
              <div className="absolute bottom-4 left-4 w-20 h-20 border border-white/20 rounded-full" />
            </div>

            <div className="relative z-10">
              {/* Avatar */}
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30">
                    <span className="text-white text-xl font-bold">{initials}</span>
                  </div>
                  {editing && (
                    <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-md">
                      <Camera className="w-3.5 h-3.5 text-navy" />
                    </button>
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-bold">{me.firstName} {me.lastName}</h2>
                  <p className="text-white/70 text-sm">{tier.label}</p>
                </div>
              </div>

              {/* Member ID */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 flex items-center justify-between mb-4">
                <div>
                  <p className="text-white/60 text-xs">Member ID</p>
                  <p className="font-mono font-bold text-sm">{me.id}</p>
                </div>
                <button
                  onClick={handleCopyId}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  title="Copy member ID"
                >
                  {copied ? (
                    <CheckCircle2 className="w-4 h-4 text-green-300" />
                  ) : (
                    <Copy className="w-4 h-4 text-white/60" />
                  )}
                </button>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/10 rounded-lg p-3">
                  <p className="text-white/60 text-xs">Credit Score</p>
                  <p className="text-lg font-bold">{me.creditScore}/100</p>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <p className="text-white/60 text-xs">Member Since</p>
                  <p className="text-lg font-bold">
                    {new Date(me.joinDate).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Completion */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-navy text-sm">Profile Completion</h3>
              <span className="text-sm font-bold text-teal">{me.profileCompleteness}%</span>
            </div>
            {/* Progress bar */}
            <div className="h-2 bg-gray-100 rounded-full mb-4">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${me.profileCompleteness}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-2 bg-gradient-to-r from-teal to-emerald-400 rounded-full"
              />
            </div>
            <div className="space-y-2.5">
              {completionItems.map((item) => (
                <div key={item.label} className="flex items-center gap-2.5">
                  {item.done ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-gray-300 shrink-0" />
                  )}
                  <span className={`text-sm ${item.done ? 'text-gray-700' : 'text-gray-400'}`}>
                    {item.label}
                  </span>
                  {!item.done && (
                    <button className="ml-auto text-xs text-teal font-medium hover:text-teal-dark">
                      Complete
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* KYC Status */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="w-5 h-5 text-teal" />
              <h3 className="font-semibold text-navy text-sm">Verification Status</h3>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Identity (KYC)', status: me.kycStatus === 'complete' ? 'verified' : 'pending' },
                { label: 'Bank Account', status: 'verified' },
                { label: 'Farm Registration', status: 'verified' },
                { label: 'Address Proof', status: me.profileCompleteness > 85 ? 'verified' : 'pending' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{item.label}</span>
                  <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${
                    item.status === 'verified'
                      ? 'bg-green-50 text-green-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}>
                    {item.status === 'verified' ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : (
                      <Clock className="w-3 h-3" />
                    )}
                    {item.status === 'verified' ? 'Verified' : 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ==================== RIGHT COLUMN ==================== */}
        <div className="lg:col-span-8">
          {/* Tab Navigation */}
          <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex-1 justify-center ${
                    activeTab === tab.key
                      ? 'bg-white text-navy shadow-sm'
                      : 'text-gray-500 hover:text-navy'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {/* ---------- PERSONAL INFO TAB ---------- */}
              {activeTab === 'personal' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-xl border border-gray-100 p-6">
                    <h3 className="font-semibold text-navy mb-5 flex items-center gap-2">
                      <User className="w-4 h-4 text-teal" />
                      Personal Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <Field label="First Name" value={me.firstName} editing={editing} icon={User} />
                      <Field label="Last Name" value={me.lastName} editing={editing} icon={User} />
                      <Field label="Email Address" value={me.email} editing={editing} type="email" icon={Mail} />
                      <Field label="Phone Number" value={me.phone} editing={editing} type="tel" icon={Phone} />
                      <Field label="Country" value={me.country} editing={editing} icon={Globe2} />
                      <Field label="Region" value={me.region} editing={editing} icon={MapPin} />
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-gray-100 p-6">
                    <h3 className="font-semibold text-navy mb-5 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-teal" />
                      Banking Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <Field label="Bank Name" value="First National Bank" editing={editing} icon={Banknote} />
                      <Field label="Account Holder" value={`${me.firstName} ${me.lastName}`} editing={editing} icon={User} />
                      <Field label="Account Number" value="••••••4567" editing={false} icon={CreditCard} />
                      <Field label="Branch Code" value="260051" editing={editing} icon={Key} />
                    </div>
                    <p className="text-xs text-gray-400 mt-4">
                      Bank account details are used for payment disbursements. Contact support to update account number.
                    </p>
                  </div>

                  {editing && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-3"
                    >
                      <button
                        onClick={() => setEditing(false)}
                        className="flex items-center gap-2 bg-teal hover:bg-teal-dark text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-sm"
                      >
                        <Save className="w-4 h-4" />
                        Save Changes
                      </button>
                      <button
                        onClick={() => setEditing(false)}
                        className="px-6 py-2.5 rounded-xl font-semibold text-sm border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </motion.div>
                  )}
                </div>
              )}

              {/* ---------- FARM DETAILS TAB ---------- */}
              {activeTab === 'farm' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-xl border border-gray-100 p-6">
                    <h3 className="font-semibold text-navy mb-5 flex items-center gap-2">
                      <Sprout className="w-4 h-4 text-teal" />
                      Farm Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <Field label="Farm Name" value={me.farmName} editing={editing} icon={Sprout} />
                      <Field label="Farm Size (hectares)" value={String(me.farmSize)} editing={editing} icon={Ruler} />
                      <Field label="Primary Crops" value={me.primaryCrops.join(', ')} editing={editing} icon={Leaf} />
                      <Field label="Location" value={`${me.region}, ${me.country}`} editing={editing} icon={MapPin} />
                    </div>
                  </div>

                  {/* Farm Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'Farm Size', value: `${me.farmSize} ha`, icon: Ruler, color: 'text-teal', bg: 'bg-teal/10' },
                      { label: 'Crops', value: String(me.primaryCrops.length), icon: Leaf, color: 'text-green-600', bg: 'bg-green-50' },
                      { label: 'Credit Score', value: `${me.creditScore}/100`, icon: TrendingUp, color: 'text-gold', bg: 'bg-gold/10' },
                      { label: 'Status', value: me.status === 'active' ? 'Active' : 'Inactive', icon: Star, color: 'text-navy', bg: 'bg-navy/5' },
                    ].map((s) => {
                      const Icon = s.icon;
                      return (
                        <div key={s.label} className="bg-white rounded-xl p-4 border border-gray-100">
                          <div className={`w-9 h-9 ${s.bg} rounded-lg flex items-center justify-center mb-2`}>
                            <Icon className={`w-4 h-4 ${s.color}`} />
                          </div>
                          <p className="text-xs text-gray-500">{s.label}</p>
                          <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Farm Photos Placeholder */}
                  <div className="bg-white rounded-xl border border-gray-100 p-6">
                    <h3 className="font-semibold text-navy mb-4 flex items-center gap-2">
                      <Camera className="w-4 h-4 text-teal" />
                      Farm Gallery
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=300&fit=crop',
                        'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=300&fit=crop',
                        'https://images.unsplash.com/photo-1592982537447-6f2a6a0c7c18?w=400&h=300&fit=crop',
                      ].map((src, i) => (
                        <div key={i} className="relative aspect-[4/3] rounded-lg overflow-hidden group">
                          <Image src={src} alt={`Farm photo ${i + 1}`} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                        </div>
                      ))}
                      <button className="aspect-[4/3] rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-teal hover:border-teal/30 transition-colors">
                        <Camera className="w-6 h-6" />
                        <span className="text-xs font-medium">Add Photo</span>
                      </button>
                    </div>
                  </div>

                  {/* Certifications */}
                  <div className="bg-white rounded-xl border border-gray-100 p-6">
                    <h3 className="font-semibold text-navy mb-4 flex items-center gap-2">
                      <Award className="w-4 h-4 text-teal" />
                      Certifications & Badges
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { label: 'AFU Verified Member', earned: true, date: 'Oct 2024', color: 'bg-teal/10 border-teal/20 text-teal' },
                        { label: 'Farm Management Basics', earned: true, date: 'Feb 2026', color: 'bg-blue-50 border-blue-200 text-blue-700' },
                        { label: 'Export Ready', earned: false, date: 'In progress', color: 'bg-gray-50 border-gray-200 text-gray-400' },
                      ].map((cert) => (
                        <div
                          key={cert.label}
                          className={`flex items-center gap-3 p-3 rounded-lg border ${cert.color}`}
                        >
                          {cert.earned ? (
                            <Award className="w-5 h-5 shrink-0" />
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-current shrink-0 opacity-50" />
                          )}
                          <div>
                            <p className="text-sm font-medium">{cert.label}</p>
                            <p className="text-xs opacity-70">{cert.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {editing && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-3"
                    >
                      <button
                        onClick={() => setEditing(false)}
                        className="flex items-center gap-2 bg-teal hover:bg-teal-dark text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-sm"
                      >
                        <Save className="w-4 h-4" />
                        Save Changes
                      </button>
                    </motion.div>
                  )}
                </div>
              )}

              {/* ---------- SECURITY TAB ---------- */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-xl border border-gray-100 p-6">
                    <h3 className="font-semibold text-navy mb-5 flex items-center gap-2">
                      <Lock className="w-4 h-4 text-teal" />
                      Account Security
                    </h3>
                    <div className="space-y-4">
                      {/* Password */}
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                            <Key className="w-5 h-5 text-navy" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-navy">Password</p>
                            <p className="text-xs text-gray-400">Last changed 14 days ago</p>
                          </div>
                        </div>
                        <button className="text-sm text-teal font-medium hover:text-teal-dark flex items-center gap-1">
                          Change <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>

                      {/* 2FA */}
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                            <Smartphone className="w-5 h-5 text-navy" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-navy">Two-Factor Authentication</p>
                            <p className="text-xs text-gray-400">Add extra security to your account</p>
                          </div>
                        </div>
                        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium bg-amber-50 text-amber-700">
                          <AlertCircle className="w-3 h-3" />
                          Not Enabled
                        </span>
                      </div>

                      {/* Login Sessions */}
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                            <Globe2 className="w-5 h-5 text-navy" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-navy">Active Sessions</p>
                            <p className="text-xs text-gray-400">2 active sessions</p>
                          </div>
                        </div>
                        <button className="text-sm text-teal font-medium hover:text-teal-dark flex items-center gap-1">
                          Manage <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Connected Services */}
                  <div className="bg-white rounded-xl border border-gray-100 p-6">
                    <h3 className="font-semibold text-navy mb-4 flex items-center gap-2">
                      <ExternalLink className="w-4 h-4 text-teal" />
                      Connected Services
                    </h3>
                    <div className="space-y-3">
                      {[
                        { name: 'WhatsApp Notifications', connected: true, desc: 'Receive delivery and payment alerts' },
                        { name: 'Weather Station API', connected: true, desc: 'Automated weather data for your farm' },
                        { name: 'Bank Account (FNB)', connected: true, desc: 'Automatic payment processing' },
                      ].map((service) => (
                        <div key={service.name} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                          <div>
                            <p className="text-sm font-medium text-navy">{service.name}</p>
                            <p className="text-xs text-gray-400">{service.desc}</p>
                          </div>
                          <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${
                            service.connected ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'
                          }`}>
                            {service.connected ? (
                              <>
                                <CheckCircle2 className="w-3 h-3" />
                                Connected
                              </>
                            ) : (
                              'Not Connected'
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div className="bg-white rounded-xl border border-red-200 p-6">
                    <h3 className="font-semibold text-red-600 mb-2">Danger Zone</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                    <button className="text-sm text-red-600 font-medium border border-red-200 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors">
                      Delete Account
                    </button>
                  </div>
                </div>
              )}

              {/* ---------- ACTIVITY TAB ---------- */}
              {activeTab === 'activity' && (
                <div className="bg-white rounded-xl border border-gray-100 p-6">
                  <h3 className="font-semibold text-navy mb-5 flex items-center gap-2">
                    <History className="w-4 h-4 text-teal" />
                    Recent Activity
                  </h3>
                  <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-5 top-2 bottom-2 w-px bg-gray-200" />

                    <div className="space-y-1">
                      {activityLog.map((entry, i) => {
                        const config = activityIcons[entry.type] || activityIcons.edit;
                        const EntryIcon = config.icon;
                        return (
                          <div key={i} className="flex items-start gap-4 p-3 hover:bg-cream/50 rounded-lg transition-colors relative">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${config.color} z-10`}>
                              <EntryIcon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0 pt-1.5">
                              <p className="text-sm text-navy">{entry.action}</p>
                              <p className="text-xs text-gray-400 mt-0.5">{entry.date}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <button className="mt-4 w-full text-sm text-teal font-medium hover:text-teal-dark py-2 text-center rounded-lg hover:bg-teal/5 transition-colors">
                    View Full Activity History
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
