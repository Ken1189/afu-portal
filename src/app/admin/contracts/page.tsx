'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/supabase/auth-context';
import {
  FileText, Plus, X, Loader2, CheckCircle2, AlertTriangle,
  Search, Edit3, Trash2, Calendar, DollarSign,
  Users, Building2, Award, RefreshCw, Eye, Printer, PenLine,
  Send, MoreHorizontal, Filter,
  FileCheck, FileClock, FileX, Briefcase, Handshake, FileSignature,
  Mail, Copy, Wheat, Scale, Lock, BookOpen,
  TrendingUp, Truck, Package, Leaf,
} from 'lucide-react';
import { useConfirm } from '@/components/ui/useConfirm';
import { ALL_AFRICAN_COUNTRIES } from '@/lib/countries';

/* ─── Types ─── */
interface Contract {
  id: string;
  party_id: string | null;
  party_type: string;
  party_name: string;
  party_email: string | null;
  contract_type: string;
  document_type: string;
  title: string;
  description: string | null;
  commission_rate: number | null;
  payment_terms: string | null;
  territory: string[] | null;
  exclusivity: boolean;
  minimum_order_value: number | null;
  discount_rate: number | null;
  start_date: string | null;
  end_date: string | null;
  auto_renew: boolean;
  status: string;
  signed_at: string | null;
  notes: string | null;
  created_at: string;
  // Extended fields stored in JSONB
  custom_fields?: Record<string, unknown>;
}

/* ─── Constants ─── */
const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; dot: string; icon: React.ElementType }> = {
  draft:             { label: 'Draft',             bg: 'bg-slate-50',  text: 'text-slate-600',  dot: 'bg-slate-400',  icon: FileClock },
  pending_signature: { label: 'Pending Signature', bg: 'bg-amber-50',  text: 'text-amber-700',  dot: 'bg-amber-400',  icon: FileSignature },
  active:            { label: 'Active',            bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-400', icon: FileCheck },
  expired:           { label: 'Expired',           bg: 'bg-red-50',    text: 'text-red-600',    dot: 'bg-red-400',    icon: FileX },
  terminated:        { label: 'Terminated',        bg: 'bg-red-50',    text: 'text-red-600',    dot: 'bg-red-400',    icon: FileX },
};

const PARTY_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  supplier:   { label: 'Supplier',   icon: Building2,  color: 'text-blue-600 bg-blue-50' },
  partner:    { label: 'Partner',    icon: Handshake,  color: 'text-purple-600 bg-purple-50' },
  ambassador: { label: 'Ambassador', icon: Award,      color: 'text-amber-600 bg-amber-50' },
  investor:   { label: 'Investor',   icon: Briefcase,  color: 'text-emerald-600 bg-emerald-50' },
  farmer:     { label: 'Farmer',     icon: Leaf,       color: 'text-green-600 bg-green-50' },
  buyer:      { label: 'Buyer',      icon: Package,    color: 'text-indigo-600 bg-indigo-50' },
};

/* ─── Document Type Definitions ─── */
interface DocTypeDef {
  value: string;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
  description: string;
  color: string;
  relevantParties: string[];
  sections: string[];
}

const DOCUMENT_TYPES: DocTypeDef[] = [
  {
    value: 'partnership_agreement',
    label: 'Partnership Agreement',
    shortLabel: 'Partnership',
    icon: Handshake,
    description: 'Strategic partnership with organisations, cooperatives, or service providers',
    color: 'text-purple-600 bg-purple-50 border-purple-200',
    relevantParties: ['partner', 'supplier'],
    sections: ['parties', 'scope', 'roles', 'financial', 'duration', 'ip', 'termination'],
  },
  {
    value: 'forward_growing',
    label: 'Forward Growing Contract',
    shortLabel: 'Forward Contract',
    icon: Wheat,
    description: 'Pre-season agreement with a farmer to grow a specific crop at an agreed price',
    color: 'text-green-600 bg-green-50 border-green-200',
    relevantParties: ['farmer'],
    sections: ['parties', 'crop', 'delivery', 'pricing', 'quality', 'inputs', 'duration'],
  },
  {
    value: 'offtake_agreement',
    label: 'Off-take Agreement',
    shortLabel: 'Off-take',
    icon: TrendingUp,
    description: 'Commitment to purchase a defined quantity of commodity at agreed terms',
    color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    relevantParties: ['buyer', 'supplier'],
    sections: ['parties', 'commodity', 'quantity', 'pricing', 'delivery', 'quality', 'duration'],
  },
  {
    value: 'nda',
    label: 'Non-Disclosure Agreement',
    shortLabel: 'NDA',
    icon: Lock,
    description: 'Confidentiality agreement protecting sensitive business information',
    color: 'text-slate-600 bg-slate-50 border-slate-200',
    relevantParties: ['partner', 'investor', 'supplier', 'buyer'],
    sections: ['parties', 'scope', 'confidentiality', 'duration', 'remedies'],
  },
  {
    value: 'mou',
    label: 'Memorandum of Understanding',
    shortLabel: 'MOU',
    icon: BookOpen,
    description: 'Non-binding outline of intended collaboration and shared objectives',
    color: 'text-amber-600 bg-amber-50 border-amber-200',
    relevantParties: ['partner', 'investor', 'supplier'],
    sections: ['parties', 'objectives', 'scope', 'responsibilities', 'duration'],
  },
  {
    value: 'investor_pack',
    label: 'Investor Pack',
    shortLabel: 'Investor',
    icon: Briefcase,
    description: 'Investment terms, equity structure, and return expectations for investors',
    color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    relevantParties: ['investor'],
    sections: ['parties', 'investment', 'equity', 'returns', 'governance', 'exit', 'duration'],
  },
  {
    value: 'supplier_agreement',
    label: 'Supplier Agreement',
    shortLabel: 'Supplier',
    icon: Truck,
    description: 'Terms for supplying inputs, equipment, or services to AFU and its members',
    color: 'text-blue-600 bg-blue-50 border-blue-200',
    relevantParties: ['supplier'],
    sections: ['parties', 'products', 'pricing', 'delivery', 'quality', 'warranty', 'duration'],
  },
  {
    value: 'ambassador_agreement',
    label: 'Ambassador Agreement',
    shortLabel: 'Ambassador',
    icon: Award,
    description: 'Terms for AFU brand ambassadors including commission and territory',
    color: 'text-amber-600 bg-amber-50 border-amber-200',
    relevantParties: ['ambassador'],
    sections: ['parties', 'territory', 'commission', 'obligations', 'targets', 'duration'],
  },
];

const DOC_TYPE_MAP: Record<string, DocTypeDef> = Object.fromEntries(DOCUMENT_TYPES.map(d => [d.value, d]));
const DOCUMENT_TYPE_LABELS: Record<string, string> = Object.fromEntries(DOCUMENT_TYPES.map(d => [d.value, d.label]));

const PAYMENT_TERMS = [
  { value: 'upfront',     label: 'Upfront' },
  { value: 'on_delivery', label: 'On Delivery' },
  { value: 'milestone',   label: 'Milestone-Based' },
  { value: 'net_7',       label: 'Net 7 Days' },
  { value: 'net_14',      label: 'Net 14 Days' },
  { value: 'net_30',      label: 'Net 30 Days' },
  { value: 'net_60',      label: 'Net 60 Days' },
  { value: 'net_90',      label: 'Net 90 Days' },
];

const CROPS = [
  'Maize', 'Wheat', 'Sorghum', 'Rice', 'Millet', 'Soybean', 'Groundnuts', 'Sunflower',
  'Coffee', 'Cocoa', 'Tea', 'Tobacco', 'Cotton', 'Sugarcane', 'Cashew Nuts', 'Macadamia',
  'Blueberries', 'Avocado', 'Citrus', 'Vegetables',
];

const QUALITY_GRADES = ['A+ (Export)', 'A (Premium)', 'B (Standard)', 'C (Economy)', 'Ungraded'];
const DELIVERY_TERMS = ['Ex-Farm', 'FOB', 'CIF', 'Delivered at Place (DAP)', 'Ex-Works', 'Collection by Buyer'];
const PRICING_MECHANISMS = ['Fixed Price', 'Market Price at Delivery', 'Floor + Market', 'Cost + Margin', 'Auction', 'Negotiated'];

const COUNTRIES = [...ALL_AFRICAN_COUNTRIES].sort();

/* ─── Helpers ─── */
function formatDate(d: string | null) {
  if (!d) return null;
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}
function formatDateLong(d: string | null) {
  if (!d) return null;
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}
function daysUntil(d: string | null) {
  if (!d) return null;
  return Math.ceil((new Date(d).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

/* ═══════════════════════════════════════════════════════════════════════════
   CONTRACT PREVIEW — Type-specific professional document
   ═══════════════════════════════════════════════════════════════════════════ */
function ContractPreview({
  contract,
  onClose,
  onSign,
  onSendEmail,
  sendingEmail,
}: {
  contract: Contract;
  onClose: () => void;
  onSign: (id: string) => void;
  onSendEmail: (id: string) => void;
  sendingEmail: boolean;
}) {
  const docType = DOC_TYPE_MAP[contract.document_type];
  const docTypeCode = (contract.document_type || 'contract').toUpperCase().replace(/_/g, '-');
  const year = new Date(contract.created_at).getFullYear();
  const refNumber = `AFU-${docTypeCode}-${year}-${contract.id.substring(0, 6).toUpperCase()}`;
  const docDate = formatDateLong(contract.created_at);
  const cf = contract.custom_fields || {};

  // Build terms based on document type
  const buildTerms = (): [string, string][] => {
    const base: [string, string][] = [];

    if (contract.document_type === 'forward_growing') {
      if (cf.crop) base.push(['Crop / Commodity', cf.crop as string]);
      if (cf.variety) base.push(['Variety', cf.variety as string]);
      if (cf.estimated_yield) base.push(['Estimated Yield', `${cf.estimated_yield} ${cf.yield_unit || 'MT'}`]);
      if (cf.farm_size) base.push(['Farm Size', `${cf.farm_size} hectares`]);
      if (cf.quality_grade) base.push(['Quality Grade', cf.quality_grade as string]);
      if (cf.pricing_mechanism) base.push(['Pricing Mechanism', cf.pricing_mechanism as string]);
      if (contract.minimum_order_value != null) base.push(['Agreed Price', `USD ${contract.minimum_order_value.toLocaleString()} per ${cf.price_unit || 'MT'}`]);
      if (cf.delivery_terms) base.push(['Delivery Terms', cf.delivery_terms as string]);
      if (cf.delivery_location) base.push(['Delivery Location', cf.delivery_location as string]);
      if (cf.inputs_provided) base.push(['Inputs Provided by AFU', cf.inputs_provided as string]);
      if (cf.input_value) base.push(['Input Advance Value', `USD ${Number(cf.input_value).toLocaleString()}`]);
      if (cf.planting_date) base.push(['Planting Window', formatDateLong(cf.planting_date as string) || '']);
      if (cf.harvest_date) base.push(['Expected Harvest', formatDateLong(cf.harvest_date as string) || '']);
    } else if (contract.document_type === 'offtake_agreement') {
      if (cf.commodity) base.push(['Commodity', cf.commodity as string]);
      if (cf.total_quantity) base.push(['Total Quantity', `${cf.total_quantity} ${cf.quantity_unit || 'MT'}`]);
      if (cf.min_quantity) base.push(['Minimum per Delivery', `${cf.min_quantity} ${cf.quantity_unit || 'MT'}`]);
      if (cf.quality_grade) base.push(['Quality Specification', cf.quality_grade as string]);
      if (cf.pricing_mechanism) base.push(['Pricing Mechanism', cf.pricing_mechanism as string]);
      if (contract.minimum_order_value != null) base.push(['Price / Unit', `USD ${contract.minimum_order_value.toLocaleString()}`]);
      if (cf.delivery_terms) base.push(['Delivery Terms', cf.delivery_terms as string]);
      if (cf.delivery_frequency) base.push(['Delivery Frequency', cf.delivery_frequency as string]);
      if (cf.delivery_location) base.push(['Delivery Point', cf.delivery_location as string]);
      if (cf.rejection_threshold) base.push(['Rejection Threshold', cf.rejection_threshold as string]);
    } else if (contract.document_type === 'partnership_agreement') {
      if (cf.partnership_type) base.push(['Partnership Type', cf.partnership_type as string]);
      if (cf.scope) base.push(['Scope of Partnership', cf.scope as string]);
      if (cf.afu_responsibilities) base.push(['AFU Responsibilities', cf.afu_responsibilities as string]);
      if (cf.partner_responsibilities) base.push(['Partner Responsibilities', cf.partner_responsibilities as string]);
      if (cf.revenue_share) base.push(['Revenue Share', cf.revenue_share as string]);
      if (cf.ip_ownership) base.push(['IP Ownership', cf.ip_ownership as string]);
      if (cf.governance) base.push(['Governance', cf.governance as string]);
    } else if (contract.document_type === 'nda') {
      if (cf.confidentiality_scope) base.push(['Scope of Confidentiality', cf.confidentiality_scope as string]);
      if (cf.covered_info) base.push(['Covered Information', cf.covered_info as string]);
      if (cf.exclusions) base.push(['Exclusions', cf.exclusions as string]);
      if (cf.confidentiality_period) base.push(['Confidentiality Period', cf.confidentiality_period as string]);
      if (cf.return_of_materials) base.push(['Return of Materials', cf.return_of_materials as string]);
      if (cf.remedies) base.push(['Remedies for Breach', cf.remedies as string]);
    } else if (contract.document_type === 'investor_pack') {
      if (cf.investment_amount) base.push(['Investment Amount', `USD ${Number(cf.investment_amount).toLocaleString()}`]);
      if (cf.instrument) base.push(['Instrument Type', cf.instrument as string]);
      if (cf.equity_percentage) base.push(['Equity Stake', `${cf.equity_percentage}%`]);
      if (cf.valuation) base.push(['Pre-Money Valuation', `USD ${Number(cf.valuation).toLocaleString()}`]);
      if (cf.target_return) base.push(['Target Return', cf.target_return as string]);
      if (cf.dividend_policy) base.push(['Dividend Policy', cf.dividend_policy as string]);
      if (cf.board_seat) base.push(['Board Representation', cf.board_seat as string]);
      if (cf.exit_mechanism) base.push(['Exit Mechanism', cf.exit_mechanism as string]);
      if (cf.lock_in_period) base.push(['Lock-in Period', cf.lock_in_period as string]);
    } else if (contract.document_type === 'ambassador_agreement') {
      if (contract.territory?.length) base.push(['Territory', contract.territory.join(', ')]);
      if (contract.exclusivity) base.push(['Exclusivity', 'Exclusive territory rights']);
      if (contract.commission_rate != null) base.push(['Commission Rate', `${contract.commission_rate}%`]);
      if (cf.recruitment_target) base.push(['Recruitment Target', `${cf.recruitment_target} members`]);
      if (cf.monthly_target) base.push(['Monthly Revenue Target', `USD ${Number(cf.monthly_target).toLocaleString()}`]);
      if (cf.training_required) base.push(['Training Required', cf.training_required as string]);
      if (cf.brand_guidelines) base.push(['Brand Guidelines', cf.brand_guidelines as string]);
    } else if (contract.document_type === 'supplier_agreement') {
      if (cf.products) base.push(['Products / Services', cf.products as string]);
      if (cf.pricing_structure) base.push(['Pricing Structure', cf.pricing_structure as string]);
      if (contract.discount_rate != null) base.push(['AFU Member Discount', `${contract.discount_rate}%`]);
      if (cf.delivery_terms) base.push(['Delivery Terms', cf.delivery_terms as string]);
      if (cf.lead_time) base.push(['Lead Time', cf.lead_time as string]);
      if (cf.warranty) base.push(['Warranty', cf.warranty as string]);
      if (cf.quality_standard) base.push(['Quality Standard', cf.quality_standard as string]);
      if (contract.minimum_order_value != null) base.push(['Minimum Order Value', `USD ${contract.minimum_order_value.toLocaleString()}`]);
    } else if (contract.document_type === 'mou') {
      if (cf.objectives) base.push(['Objectives', cf.objectives as string]);
      if (cf.scope) base.push(['Scope', cf.scope as string]);
      if (cf.afu_commitments) base.push(['AFU Commitments', cf.afu_commitments as string]);
      if (cf.partner_commitments) base.push(['Partner Commitments', cf.partner_commitments as string]);
      if (cf.milestones) base.push(['Key Milestones', cf.milestones as string]);
    }

    // Always include common terms
    if (contract.payment_terms) {
      const pt = PAYMENT_TERMS.find(t => t.value === contract.payment_terms)?.label || contract.payment_terms;
      base.push(['Payment Terms', pt]);
    }
    if (contract.start_date) base.push(['Commencement Date', formatDateLong(contract.start_date) || 'TBD']);
    if (contract.end_date) base.push(['Expiry Date', formatDateLong(contract.end_date) || 'Ongoing']);
    base.push(['Auto-Renewal', contract.auto_renew ? 'Yes - automatically renews on expiry' : 'No']);

    return base.filter(([, v]) => v && v !== 'undefined' && v !== 'null');
  };

  const terms = buildTerms();

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center bg-black/60 backdrop-blur-sm overflow-y-auto print:bg-white print:static print:overflow-visible">
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #contract-preview, #contract-preview * { visibility: visible !important; }
          #contract-preview { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="w-full max-w-4xl mx-4 my-8 print:my-0 print:mx-0 print:max-w-none">
        {/* Toolbar */}
        <div className="no-print flex items-center justify-between bg-gradient-to-r from-[#1B2A4A] to-[#243556] text-white rounded-t-2xl px-6 py-4 shadow-lg">
          <div>
            <h3 className="font-bold text-sm">Document Preview</h3>
            <p className="text-white/50 text-xs mt-0.5">{refNumber} | {docType?.label || 'Contract'}</p>
          </div>
          <div className="flex items-center gap-2">
            {contract.party_email && (
              <button
                onClick={() => onSendEmail(contract.id)}
                disabled={sendingEmail}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-xs font-medium px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50"
              >
                {sendingEmail ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />}
                Send by Email
              </button>
            )}
            {(contract.status === 'draft' || contract.status === 'pending_signature') && (
              <button
                onClick={() => onSign(contract.id)}
                className="flex items-center gap-2 bg-[#5DB347] hover:bg-[#449933] text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
              >
                <PenLine className="w-3.5 h-3.5" />
                Sign Digitally
              </button>
            )}
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-xs font-medium px-4 py-2.5 rounded-xl transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Print
            </button>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 ml-1">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document body */}
        <div id="contract-preview" className="bg-white shadow-2xl rounded-b-2xl print:shadow-none print:rounded-none overflow-hidden">
          {/* Letterhead */}
          <div className="bg-gradient-to-r from-[#1B2A4A] to-[#223350] px-12 pt-10 pb-8">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/afu-logo.svg" alt="AFU Logo" className="w-16 h-16 brightness-0 invert" />
                <div>
                  <h1 className="text-2xl font-bold text-white tracking-tight">African Farming Union</h1>
                  <p className="text-white/40 text-xs mt-1.5 tracking-wide">Empowering African Agriculture</p>
                </div>
              </div>
              <div className="text-right text-xs text-white/30 leading-relaxed">
                <p>Cape Town, South Africa</p>
                <p>info@africanfarmingunion.org</p>
                <p>www.africanfarmingunion.org</p>
              </div>
            </div>
          </div>

          {/* Green accent */}
          <div className="h-1.5 bg-gradient-to-r from-[#5DB347] via-[#449933] to-[#5DB347]" />

          {/* Document title block */}
          <div className="px-12 pt-10 pb-6">
            <div className="text-center">
              <p className="text-xs font-semibold text-[#5DB347] uppercase tracking-[0.2em] mb-3">
                {docType?.label || 'Contract'}
              </p>
              <h2 className="text-2xl font-bold text-[#1B2A4A] leading-tight">{contract.title}</h2>
            </div>

            {/* Reference bar */}
            <div className="flex justify-between items-center mt-8 py-3 px-5 bg-slate-50 rounded-lg border border-slate-100">
              <div className="flex items-center gap-6 text-xs">
                <div>
                  <span className="text-slate-400 font-medium">Reference</span>
                  <p className="font-mono font-bold text-[#1B2A4A] mt-0.5">{refNumber}</p>
                </div>
                <div className="w-px h-8 bg-slate-200" />
                <div>
                  <span className="text-slate-400 font-medium">Date Issued</span>
                  <p className="font-semibold text-[#1B2A4A] mt-0.5">{docDate}</p>
                </div>
                <div className="w-px h-8 bg-slate-200" />
                <div>
                  <span className="text-slate-400 font-medium">Status</span>
                  <p className="mt-0.5">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full ${STATUS_CONFIG[contract.status]?.bg || 'bg-slate-50'} ${STATUS_CONFIG[contract.status]?.text || 'text-slate-600'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${STATUS_CONFIG[contract.status]?.dot || 'bg-slate-400'}`} />
                      {STATUS_CONFIG[contract.status]?.label || contract.status}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Parties */}
          <div className="px-12 pb-8">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.15em] mb-3">Parties to this Agreement</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-slate-200 rounded-xl p-5 bg-white">
                <p className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider mb-2">Party A</p>
                <p className="font-bold text-[#1B2A4A] text-lg">African Farming Union (AFU)</p>
                <p className="text-xs text-slate-500 mt-1">Cape Town, South Africa</p>
                <p className="text-xs text-slate-500">info@africanfarmingunion.org</p>
              </div>
              <div className="border border-slate-200 rounded-xl p-5 bg-white">
                <p className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Party B {contract.party_type ? `(${PARTY_CONFIG[contract.party_type]?.label || contract.party_type})` : ''}
                </p>
                <p className="font-bold text-[#1B2A4A] text-lg">{contract.party_name}</p>
                {contract.party_email && <p className="text-xs text-slate-500 mt-1">{contract.party_email}</p>}
                {contract.territory?.length ? (
                  <p className="text-xs text-slate-400 mt-1">Territory: {contract.territory.join(', ')}</p>
                ) : null}
              </div>
            </div>
          </div>

          {/* Key Terms */}
          {terms.length > 0 && (
            <div className="px-12 pb-8">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.15em] mb-3">Key Terms &amp; Conditions</h3>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <tbody>
                    {terms.map(([label, value], i) => (
                      <tr key={label} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                        <td className="px-5 py-3 text-slate-400 font-medium w-2/5 border-r border-slate-100">{label}</td>
                        <td className="px-5 py-3 text-[#1B2A4A] font-medium whitespace-pre-line">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Description / Notes */}
          {(contract.description || contract.notes) && (
            <div className="px-12 pb-8">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.15em] mb-3">Description &amp; Notes</h3>
              <div className="border border-slate-200 rounded-xl p-5 space-y-4 text-sm text-slate-700 leading-relaxed bg-white">
                {contract.description && <p className="whitespace-pre-line">{contract.description}</p>}
                {contract.notes && (
                  <>
                    {contract.description && <div className="border-t border-slate-100 pt-4" />}
                    <div>
                      <p className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider mb-2">Internal Notes</p>
                      <p className="whitespace-pre-line">{contract.notes}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* NDA-specific: binding notice */}
          {contract.document_type === 'nda' && (
            <div className="px-12 pb-8">
              <div className="border border-amber-200 bg-amber-50 rounded-xl p-5">
                <p className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2">Important Notice</p>
                <p className="text-sm text-amber-700 leading-relaxed">
                  This Non-Disclosure Agreement is legally binding upon execution. Both parties acknowledge
                  that any breach of confidentiality may result in irreparable harm and agree that the
                  disclosing party shall be entitled to seek injunctive relief in addition to any other
                  remedies available at law or in equity.
                </p>
              </div>
            </div>
          )}

          {/* MOU-specific: non-binding notice */}
          {contract.document_type === 'mou' && (
            <div className="px-12 pb-8">
              <div className="border border-blue-200 bg-blue-50 rounded-xl p-5">
                <p className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-2">Non-Binding Intent</p>
                <p className="text-sm text-blue-700 leading-relaxed">
                  This Memorandum of Understanding represents the intent of the parties to collaborate and
                  is not legally binding. Formal obligations will be established through subsequent definitive
                  agreements between the parties.
                </p>
              </div>
            </div>
          )}

          {/* Signatures */}
          <div className="px-12 pb-10">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.15em] mb-3">Authorised Signatures</h3>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="grid grid-cols-2 divide-x divide-slate-200">
                {[
                  { label: 'For African Farming Union (AFU)', name: 'Authorised Signatory' },
                  { label: `For ${contract.party_name}`, name: contract.party_name },
                ].map((side, i) => (
                  <div key={i} className="p-6">
                    <p className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider mb-1">{side.label}</p>
                    <div className="mt-10 mb-3">
                      {contract.signed_at ? (
                        <div className="border-b-2 border-[#5DB347] pb-2">
                          <p className="text-[#5DB347] font-bold text-sm">Digitally Signed</p>
                        </div>
                      ) : (
                        <div className="border-b-2 border-slate-200 pb-2 h-6" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500 font-medium">{side.name}</p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Date: {contract.signed_at ? formatDateLong(contract.signed_at) : '____________________'}
                    </p>
                  </div>
                ))}
              </div>
              {contract.signed_at && (
                <div className="bg-emerald-50 border-t border-emerald-200 px-5 py-3 flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <p className="text-xs text-emerald-700 font-semibold">
                    Digitally signed on {formatDateLong(contract.signed_at)} at {new Date(contract.signed_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} UTC
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gradient-to-r from-[#1B2A4A] to-[#223350] px-12 py-5">
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-white/30">African Farming Union | Confidential</p>
              <p className="text-[10px] text-white/30 font-mono">ID: {contract.id}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   TYPE-SPECIFIC FORM SECTIONS
   ═══════════════════════════════════════════════════════════════════════════ */
function TypeSpecificFields({
  docType,
  custom,
  setCustom,
  form,
  setForm,
}: {
  docType: string;
  custom: Record<string, unknown>;
  setCustom: React.Dispatch<React.SetStateAction<Record<string, unknown>>>;
  form: Record<string, unknown>;
  setForm: (fn: (p: Record<string, unknown>) => Record<string, unknown>) => void;
}) {
  const cf = (key: string) => (custom[key] as string) || '';
  const setCf = (key: string, val: string) => setCustom(prev => ({ ...prev, [key]: val }));

  const inputClass = "w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]";
  const labelClass = "block text-xs font-semibold text-gray-600 mb-1.5";
  const sectionTitle = (title: string, icon: React.ElementType) => {
    const Icon = icon;
    return (
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4 text-[#5DB347]" />
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</h4>
      </div>
    );
  };

  if (docType === 'forward_growing') {
    return (
      <>
        <div className="border-t border-gray-100 pt-5">
          {sectionTitle('Crop Details', Wheat)}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Crop *</label>
              <select value={cf('crop')} onChange={e => setCf('crop', e.target.value)} className={inputClass}>
                <option value="">Select crop</option>
                {CROPS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Variety / Grade</label>
              <input type="text" value={cf('variety')} onChange={e => setCf('variety', e.target.value)} placeholder="e.g. SC513, AA Arabica" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Quality Grade</label>
              <select value={cf('quality_grade')} onChange={e => setCf('quality_grade', e.target.value)} className={inputClass}>
                <option value="">Select grade</option>
                {QUALITY_GRADES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-3">
            <div>
              <label className={labelClass}>Farm Size (ha)</label>
              <input type="number" value={cf('farm_size')} onChange={e => setCf('farm_size', e.target.value)} placeholder="50" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Estimated Yield</label>
              <input type="number" value={cf('estimated_yield')} onChange={e => setCf('estimated_yield', e.target.value)} placeholder="200" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Yield Unit</label>
              <select value={cf('yield_unit') || 'MT'} onChange={e => setCf('yield_unit', e.target.value)} className={inputClass}>
                <option value="MT">Metric Tons</option>
                <option value="kg">Kilograms</option>
                <option value="bags">Bags (50kg)</option>
                <option value="bales">Bales</option>
              </select>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-5">
          {sectionTitle('Pricing & Delivery', DollarSign)}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Pricing Mechanism</label>
              <select value={cf('pricing_mechanism')} onChange={e => setCf('pricing_mechanism', e.target.value)} className={inputClass}>
                <option value="">Select</option>
                {PRICING_MECHANISMS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Delivery Terms</label>
              <select value={cf('delivery_terms')} onChange={e => setCf('delivery_terms', e.target.value)} className={inputClass}>
                <option value="">Select</option>
                {DELIVERY_TERMS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-3">
            <div>
              <label className={labelClass}>Delivery Location</label>
              <input type="text" value={cf('delivery_location')} onChange={e => setCf('delivery_location', e.target.value)} placeholder="Harare Grain Depot" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Price per Unit (USD)</label>
              <input type="number" value={form.minimum_order_value as string} onChange={e => setForm(p => ({ ...p, minimum_order_value: e.target.value }))} placeholder="350" className={inputClass} />
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-5">
          {sectionTitle('Input Support (if applicable)', Package)}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Inputs Provided by AFU</label>
              <input type="text" value={cf('inputs_provided')} onChange={e => setCf('inputs_provided', e.target.value)} placeholder="Seed, fertiliser, pesticide" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Input Advance Value (USD)</label>
              <input type="number" value={cf('input_value')} onChange={e => setCf('input_value', e.target.value)} placeholder="5000" className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-3">
            <div>
              <label className={labelClass}>Planting Window</label>
              <input type="date" value={cf('planting_date')} onChange={e => setCf('planting_date', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Expected Harvest</label>
              <input type="date" value={cf('harvest_date')} onChange={e => setCf('harvest_date', e.target.value)} className={inputClass} />
            </div>
          </div>
        </div>
      </>
    );
  }

  if (docType === 'offtake_agreement') {
    return (
      <>
        <div className="border-t border-gray-100 pt-5">
          {sectionTitle('Commodity & Quantity', Package)}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Commodity *</label>
              <select value={cf('commodity')} onChange={e => setCf('commodity', e.target.value)} className={inputClass}>
                <option value="">Select commodity</option>
                {CROPS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Total Quantity</label>
              <input type="number" value={cf('total_quantity')} onChange={e => setCf('total_quantity', e.target.value)} placeholder="500" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Unit</label>
              <select value={cf('quantity_unit') || 'MT'} onChange={e => setCf('quantity_unit', e.target.value)} className={inputClass}>
                <option value="MT">Metric Tons</option>
                <option value="kg">Kilograms</option>
                <option value="bags">Bags (50kg)</option>
                <option value="bales">Bales</option>
                <option value="litres">Litres</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-3">
            <div>
              <label className={labelClass}>Min Quantity per Delivery</label>
              <input type="number" value={cf('min_quantity')} onChange={e => setCf('min_quantity', e.target.value)} placeholder="50" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Quality Grade</label>
              <select value={cf('quality_grade')} onChange={e => setCf('quality_grade', e.target.value)} className={inputClass}>
                <option value="">Select grade</option>
                {QUALITY_GRADES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Rejection Threshold</label>
              <input type="text" value={cf('rejection_threshold')} onChange={e => setCf('rejection_threshold', e.target.value)} placeholder="Below Grade C" className={inputClass} />
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-5">
          {sectionTitle('Pricing & Delivery', TrendingUp)}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Pricing Mechanism</label>
              <select value={cf('pricing_mechanism')} onChange={e => setCf('pricing_mechanism', e.target.value)} className={inputClass}>
                <option value="">Select</option>
                {PRICING_MECHANISMS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Price per Unit (USD)</label>
              <input type="number" value={form.minimum_order_value as string} onChange={e => setForm(p => ({ ...p, minimum_order_value: e.target.value }))} placeholder="350" className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-3">
            <div>
              <label className={labelClass}>Delivery Terms</label>
              <select value={cf('delivery_terms')} onChange={e => setCf('delivery_terms', e.target.value)} className={inputClass}>
                <option value="">Select</option>
                {DELIVERY_TERMS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Delivery Frequency</label>
              <select value={cf('delivery_frequency')} onChange={e => setCf('delivery_frequency', e.target.value)} className={inputClass}>
                <option value="">Select</option>
                <option value="Weekly">Weekly</option>
                <option value="Fortnightly">Fortnightly</option>
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Seasonal">Seasonal</option>
                <option value="Single Delivery">Single Delivery</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Delivery Location</label>
              <input type="text" value={cf('delivery_location')} onChange={e => setCf('delivery_location', e.target.value)} placeholder="Buyer's warehouse, Lusaka" className={inputClass} />
            </div>
          </div>
        </div>
      </>
    );
  }

  if (docType === 'partnership_agreement') {
    return (
      <>
        <div className="border-t border-gray-100 pt-5">
          {sectionTitle('Partnership Scope', Handshake)}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Partnership Type</label>
              <select value={cf('partnership_type')} onChange={e => setCf('partnership_type', e.target.value)} className={inputClass}>
                <option value="">Select</option>
                <option value="Strategic">Strategic Partnership</option>
                <option value="Distribution">Distribution Partnership</option>
                <option value="Technology">Technology Partnership</option>
                <option value="Research">Research Collaboration</option>
                <option value="Training">Training & Capacity Building</option>
                <option value="Joint Venture">Joint Venture</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Revenue Share Model</label>
              <input type="text" value={cf('revenue_share')} onChange={e => setCf('revenue_share', e.target.value)} placeholder="e.g. 70/30 AFU/Partner" className={inputClass} />
            </div>
          </div>
          <div className="mt-3">
            <label className={labelClass}>Scope of Partnership</label>
            <textarea value={cf('scope')} onChange={e => setCf('scope', e.target.value)} rows={2} placeholder="Describe the areas of collaboration and objectives..." className={inputClass + ' resize-none'} />
          </div>
        </div>

        <div className="border-t border-gray-100 pt-5">
          {sectionTitle('Roles & Responsibilities', Users)}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>AFU Responsibilities</label>
              <textarea value={cf('afu_responsibilities')} onChange={e => setCf('afu_responsibilities', e.target.value)} rows={3} placeholder="What AFU commits to deliver..." className={inputClass + ' resize-none'} />
            </div>
            <div>
              <label className={labelClass}>Partner Responsibilities</label>
              <textarea value={cf('partner_responsibilities')} onChange={e => setCf('partner_responsibilities', e.target.value)} rows={3} placeholder="What the partner commits to deliver..." className={inputClass + ' resize-none'} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-3">
            <div>
              <label className={labelClass}>IP Ownership</label>
              <select value={cf('ip_ownership')} onChange={e => setCf('ip_ownership', e.target.value)} className={inputClass}>
                <option value="">Select</option>
                <option value="AFU Owned">AFU Owned</option>
                <option value="Partner Owned">Partner Owned</option>
                <option value="Joint Ownership">Joint Ownership</option>
                <option value="Licensed to AFU">Licensed to AFU</option>
                <option value="N/A">Not Applicable</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Governance</label>
              <input type="text" value={cf('governance')} onChange={e => setCf('governance', e.target.value)} placeholder="e.g. Joint steering committee, quarterly reviews" className={inputClass} />
            </div>
          </div>
        </div>
      </>
    );
  }

  if (docType === 'nda') {
    return (
      <div className="border-t border-gray-100 pt-5">
        {sectionTitle('Confidentiality Terms', Lock)}
        <div className="mt-0">
          <label className={labelClass}>Scope of Confidentiality</label>
          <textarea value={cf('confidentiality_scope')} onChange={e => setCf('confidentiality_scope', e.target.value)} rows={2} placeholder="Define what this NDA covers..." className={inputClass + ' resize-none'} />
        </div>
        <div className="mt-3">
          <label className={labelClass}>Covered Information Types</label>
          <textarea value={cf('covered_info')} onChange={e => setCf('covered_info', e.target.value)} rows={2} placeholder="Financial data, business plans, member lists, technology IP..." className={inputClass + ' resize-none'} />
        </div>
        <div className="grid grid-cols-2 gap-4 mt-3">
          <div>
            <label className={labelClass}>Exclusions</label>
            <textarea value={cf('exclusions')} onChange={e => setCf('exclusions', e.target.value)} rows={2} placeholder="Publicly available info, independently developed..." className={inputClass + ' resize-none'} />
          </div>
          <div>
            <label className={labelClass}>Remedies for Breach</label>
            <textarea value={cf('remedies')} onChange={e => setCf('remedies', e.target.value)} rows={2} placeholder="Injunctive relief, damages..." className={inputClass + ' resize-none'} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-3">
          <div>
            <label className={labelClass}>Confidentiality Period</label>
            <select value={cf('confidentiality_period')} onChange={e => setCf('confidentiality_period', e.target.value)} className={inputClass}>
              <option value="">Select</option>
              <option value="1 year after termination">1 Year After Termination</option>
              <option value="2 years after termination">2 Years After Termination</option>
              <option value="3 years after termination">3 Years After Termination</option>
              <option value="5 years after termination">5 Years After Termination</option>
              <option value="Perpetual">Perpetual</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Return of Materials</label>
            <select value={cf('return_of_materials')} onChange={e => setCf('return_of_materials', e.target.value)} className={inputClass}>
              <option value="">Select</option>
              <option value="Return or destroy within 14 days">Return or Destroy within 14 Days</option>
              <option value="Return or destroy within 30 days">Return or Destroy within 30 Days</option>
              <option value="Destroy and certify">Destroy and Certify Destruction</option>
            </select>
          </div>
        </div>
      </div>
    );
  }

  if (docType === 'investor_pack') {
    return (
      <>
        <div className="border-t border-gray-100 pt-5">
          {sectionTitle('Investment Terms', DollarSign)}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Investment Amount (USD) *</label>
              <input type="number" value={cf('investment_amount')} onChange={e => setCf('investment_amount', e.target.value)} placeholder="100000" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Instrument Type</label>
              <select value={cf('instrument')} onChange={e => setCf('instrument', e.target.value)} className={inputClass}>
                <option value="">Select</option>
                <option value="Equity">Equity</option>
                <option value="Convertible Note">Convertible Note</option>
                <option value="SAFE">SAFE</option>
                <option value="Revenue Share">Revenue Share</option>
                <option value="Loan">Loan</option>
                <option value="Grant">Grant</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Pre-Money Valuation (USD)</label>
              <input type="number" value={cf('valuation')} onChange={e => setCf('valuation', e.target.value)} placeholder="5000000" className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-3">
            <div>
              <label className={labelClass}>Equity Stake (%)</label>
              <input type="number" step="0.01" value={cf('equity_percentage')} onChange={e => setCf('equity_percentage', e.target.value)} placeholder="2.0" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Target Return</label>
              <input type="text" value={cf('target_return')} onChange={e => setCf('target_return', e.target.value)} placeholder="e.g. 3x in 5 years" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Lock-in Period</label>
              <select value={cf('lock_in_period')} onChange={e => setCf('lock_in_period', e.target.value)} className={inputClass}>
                <option value="">Select</option>
                <option value="6 months">6 Months</option>
                <option value="1 year">1 Year</option>
                <option value="2 years">2 Years</option>
                <option value="3 years">3 Years</option>
                <option value="5 years">5 Years</option>
              </select>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-5">
          {sectionTitle('Governance & Exit', Scale)}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Board Representation</label>
              <select value={cf('board_seat')} onChange={e => setCf('board_seat', e.target.value)} className={inputClass}>
                <option value="">Select</option>
                <option value="Observer seat">Observer Seat</option>
                <option value="Full board seat">Full Board Seat</option>
                <option value="Advisory role">Advisory Role</option>
                <option value="None">None</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Exit Mechanism</label>
              <select value={cf('exit_mechanism')} onChange={e => setCf('exit_mechanism', e.target.value)} className={inputClass}>
                <option value="">Select</option>
                <option value="IPO">IPO</option>
                <option value="Secondary sale">Secondary Sale</option>
                <option value="Buyback">Company Buyback</option>
                <option value="Acquisition">Acquisition</option>
                <option value="Drag/Tag along">Drag/Tag Along</option>
              </select>
            </div>
          </div>
          <div className="mt-3">
            <label className={labelClass}>Dividend Policy</label>
            <input type="text" value={cf('dividend_policy')} onChange={e => setCf('dividend_policy', e.target.value)} placeholder="e.g. Annual distribution of 20% net profits" className={inputClass} />
          </div>
        </div>
      </>
    );
  }

  if (docType === 'ambassador_agreement') {
    return (
      <div className="border-t border-gray-100 pt-5">
        {sectionTitle('Ambassador Terms', Award)}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Commission Rate (%)</label>
            <input type="number" step="0.1" value={form.commission_rate as string} onChange={e => setForm(p => ({ ...p, commission_rate: e.target.value }))} placeholder="15" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Monthly Revenue Target (USD)</label>
            <input type="number" value={cf('monthly_target')} onChange={e => setCf('monthly_target', e.target.value)} placeholder="5000" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Recruitment Target (members)</label>
            <input type="number" value={cf('recruitment_target')} onChange={e => setCf('recruitment_target', e.target.value)} placeholder="50" className={inputClass} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-3">
          <div>
            <label className={labelClass}>Training Required</label>
            <input type="text" value={cf('training_required')} onChange={e => setCf('training_required', e.target.value)} placeholder="AFU onboarding, product knowledge" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Brand Guidelines</label>
            <input type="text" value={cf('brand_guidelines')} onChange={e => setCf('brand_guidelines', e.target.value)} placeholder="Must follow AFU brand manual" className={inputClass} />
          </div>
        </div>
      </div>
    );
  }

  if (docType === 'supplier_agreement') {
    return (
      <>
        <div className="border-t border-gray-100 pt-5">
          {sectionTitle('Products & Pricing', Package)}
          <div className="mt-0">
            <label className={labelClass}>Products / Services Supplied</label>
            <textarea value={cf('products')} onChange={e => setCf('products', e.target.value)} rows={2} placeholder="List the products or services being supplied..." className={inputClass + ' resize-none'} />
          </div>
          <div className="grid grid-cols-3 gap-4 mt-3">
            <div>
              <label className={labelClass}>Pricing Structure</label>
              <input type="text" value={cf('pricing_structure')} onChange={e => setCf('pricing_structure', e.target.value)} placeholder="e.g. Fixed price list, volume tiers" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>AFU Member Discount (%)</label>
              <input type="number" step="0.1" value={form.discount_rate as string} onChange={e => setForm(p => ({ ...p, discount_rate: e.target.value }))} placeholder="10" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Min Order Value (USD)</label>
              <input type="number" value={form.minimum_order_value as string} onChange={e => setForm(p => ({ ...p, minimum_order_value: e.target.value }))} placeholder="500" className={inputClass} />
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-5">
          {sectionTitle('Delivery & Quality', Truck)}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Delivery Terms</label>
              <select value={cf('delivery_terms')} onChange={e => setCf('delivery_terms', e.target.value)} className={inputClass}>
                <option value="">Select</option>
                {DELIVERY_TERMS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Lead Time</label>
              <input type="text" value={cf('lead_time')} onChange={e => setCf('lead_time', e.target.value)} placeholder="e.g. 7-14 days" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Quality Standard</label>
              <input type="text" value={cf('quality_standard')} onChange={e => setCf('quality_standard', e.target.value)} placeholder="e.g. ISO 9001, SABS" className={inputClass} />
            </div>
          </div>
          <div className="mt-3">
            <label className={labelClass}>Warranty Terms</label>
            <input type="text" value={cf('warranty')} onChange={e => setCf('warranty', e.target.value)} placeholder="e.g. 12 months manufacturer warranty" className={inputClass} />
          </div>
        </div>
      </>
    );
  }

  if (docType === 'mou') {
    return (
      <div className="border-t border-gray-100 pt-5">
        {sectionTitle('MOU Details', BookOpen)}
        <div className="mt-0">
          <label className={labelClass}>Objectives</label>
          <textarea value={cf('objectives')} onChange={e => setCf('objectives', e.target.value)} rows={2} placeholder="What do both parties aim to achieve?" className={inputClass + ' resize-none'} />
        </div>
        <div className="mt-3">
          <label className={labelClass}>Scope of Collaboration</label>
          <textarea value={cf('scope')} onChange={e => setCf('scope', e.target.value)} rows={2} placeholder="Areas of intended cooperation..." className={inputClass + ' resize-none'} />
        </div>
        <div className="grid grid-cols-2 gap-4 mt-3">
          <div>
            <label className={labelClass}>AFU Commitments</label>
            <textarea value={cf('afu_commitments')} onChange={e => setCf('afu_commitments', e.target.value)} rows={2} placeholder="What AFU intends to contribute..." className={inputClass + ' resize-none'} />
          </div>
          <div>
            <label className={labelClass}>Partner Commitments</label>
            <textarea value={cf('partner_commitments')} onChange={e => setCf('partner_commitments', e.target.value)} rows={2} placeholder="What the partner intends to contribute..." className={inputClass + ' resize-none'} />
          </div>
        </div>
        <div className="mt-3">
          <label className={labelClass}>Key Milestones</label>
          <textarea value={cf('milestones')} onChange={e => setCf('milestones', e.target.value)} rows={2} placeholder="Phase 1: ..., Phase 2: ..." className={inputClass + ' resize-none'} />
        </div>
      </div>
    );
  }

  // Fallback: generic commercial terms
  return (
    <div className="border-t border-gray-100 pt-5">
      {sectionTitle('Commercial Terms', DollarSign)}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>Commission Rate (%)</label>
          <input type="number" step="0.1" value={form.commission_rate as string} onChange={e => setForm(p => ({ ...p, commission_rate: e.target.value }))} placeholder="5.0" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Discount Rate (%)</label>
          <input type="number" step="0.1" value={form.discount_rate as string} onChange={e => setForm(p => ({ ...p, discount_rate: e.target.value }))} placeholder="10" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Min Order Value (USD)</label>
          <input type="number" value={form.minimum_order_value as string} onChange={e => setForm(p => ({ ...p, minimum_order_value: e.target.value }))} placeholder="1000" className={inputClass} />
        </div>
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════════════════ */
export default function AdminContractsPage() {
  const supabase = useMemo(() => createClient(), []);
  const { user } = useAuth();
  const [ConfirmDialog, confirm] = useConfirm();

  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [docTypeFilter, setDocTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name'>('newest');

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Contract | null>(null);
  const [saving, setSaving] = useState(false);
  const [previewContract, setPreviewContract] = useState<Contract | null>(null);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [actionMenu, setActionMenu] = useState<string | null>(null);

  // Document type picker
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState<string>('');

  const [form, setForm] = useState<Record<string, unknown>>({
    party_type: 'supplier',
    party_name: '',
    party_email: '',
    contract_type: 'supplier',
    document_type: 'partnership_agreement',
    title: '',
    description: '',
    commission_rate: '',
    payment_terms: 'net_30',
    territory: [] as string[],
    exclusivity: false,
    minimum_order_value: '',
    discount_rate: '',
    start_date: '',
    end_date: '',
    auto_renew: false,
    notes: '',
  });

  const [customFields, setCustomFields] = useState<Record<string, unknown>>({});

  /* ─── Data fetching ─── */
  const fetchContracts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await supabase.from('contracts').select('*').order('created_at', { ascending: false });
      setContracts((data || []) as Contract[]);
    } catch (err) {
      console.error('[contracts] fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => { fetchContracts(); }, [fetchContracts]);

  /* ─── Filtering & sorting ─── */
  const filtered = useMemo(() => {
    let list = contracts;
    if (statusFilter !== 'all') list = list.filter(c => c.status === statusFilter);
    if (typeFilter !== 'all') list = list.filter(c => c.party_type === typeFilter);
    if (docTypeFilter !== 'all') list = list.filter(c => c.document_type === docTypeFilter);
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(c =>
        c.party_name.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.party_email?.toLowerCase().includes(q)
      );
    }
    if (sortBy === 'oldest') list = [...list].reverse();
    if (sortBy === 'name') list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    return list;
  }, [contracts, statusFilter, typeFilter, docTypeFilter, searchTerm, sortBy]);

  /* ─── Stats ─── */
  const stats = useMemo(() => {
    const active = contracts.filter(c => c.status === 'active').length;
    const pending = contracts.filter(c => c.status === 'pending_signature').length;
    const draft = contracts.filter(c => c.status === 'draft').length;
    const expiring = contracts.filter(c => {
      if (!c.end_date || c.status !== 'active') return false;
      const d = daysUntil(c.end_date);
      return d !== null && d <= 30 && d > 0;
    }).length;
    return { total: contracts.length, active, pending, draft, expiring };
  }, [contracts]);

  /* ─── CRUD ─── */
  const startCreate = (docType: string) => {
    const dt = DOC_TYPE_MAP[docType];
    setEditing(null);
    setSelectedDocType(docType);
    setCustomFields({});
    setForm({
      party_type: dt?.relevantParties[0] || 'supplier',
      party_name: '',
      party_email: '',
      contract_type: dt?.relevantParties[0] || 'supplier',
      document_type: docType,
      title: '',
      description: '',
      commission_rate: '',
      payment_terms: 'net_30',
      territory: [] as string[],
      exclusivity: false,
      minimum_order_value: '',
      discount_rate: '',
      start_date: '',
      end_date: '',
      auto_renew: false,
      notes: '',
    });
    setShowTypePicker(false);
    setShowModal(true);
  };

  const openEdit = (c: Contract) => {
    setEditing(c);
    setSelectedDocType(c.document_type || 'partnership_agreement');
    setCustomFields(c.custom_fields || {});
    setForm({
      party_type: c.party_type, party_name: c.party_name, party_email: c.party_email || '',
      contract_type: c.contract_type, document_type: c.document_type || 'partnership_agreement',
      title: c.title, description: c.description || '', commission_rate: c.commission_rate?.toString() || '',
      payment_terms: c.payment_terms || 'net_30', territory: c.territory || [],
      exclusivity: c.exclusivity, minimum_order_value: c.minimum_order_value?.toString() || '',
      discount_rate: c.discount_rate?.toString() || '', start_date: c.start_date || '',
      end_date: c.end_date || '', auto_renew: c.auto_renew, notes: c.notes || '',
    });
    setShowModal(true);
    setActionMenu(null);
  };

  const handleSave = async () => {
    if (!form.party_name || !form.title) return;
    setSaving(true);
    const payload = {
      party_type: form.party_type, party_name: form.party_name,
      party_email: (form.party_email as string) || null, contract_type: form.contract_type,
      document_type: form.document_type, title: form.title,
      description: (form.description as string) || null,
      commission_rate: form.commission_rate ? parseFloat(form.commission_rate as string) : null,
      payment_terms: form.payment_terms,
      territory: (form.territory as string[]).length > 0 ? form.territory : null,
      exclusivity: form.exclusivity,
      minimum_order_value: form.minimum_order_value ? parseFloat(form.minimum_order_value as string) : null,
      discount_rate: form.discount_rate ? parseFloat(form.discount_rate as string) : null,
      start_date: (form.start_date as string) || null,
      end_date: (form.end_date as string) || null,
      auto_renew: form.auto_renew,
      notes: (form.notes as string) || null,
      custom_fields: customFields,
      updated_at: new Date().toISOString(),
    };

    if (editing) {
      await supabase.from('contracts').update(payload).eq('id', editing.id);
    } else {
      await supabase.from('contracts').insert({ ...payload, created_by: user?.id, status: 'draft' });
    }
    setShowModal(false);
    setSaving(false);
    fetchContracts();
  };

  const updateStatus = async (id: string, status: string) => {
    const updates: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
    if (status === 'active') updates.signed_at = new Date().toISOString();
    await supabase.from('contracts').update(updates).eq('id', id);
    setContracts(prev => prev.map(c => c.id === id ? { ...c, status, signed_at: status === 'active' ? new Date().toISOString() : c.signed_at } : c));
    setActionMenu(null);
  };

  const handleDigitalSign = async (id: string) => {
    const contract = contracts.find(c => c.id === id);
    if (!contract) return;
    if (contract.status === 'draft') {
      await updateStatus(id, 'pending_signature');
      setTimeout(async () => {
        await updateStatus(id, 'active');
        setPreviewContract(prev => prev && prev.id === id ? { ...prev, status: 'active', signed_at: new Date().toISOString() } : prev);
      }, 500);
    } else if (contract.status === 'pending_signature') {
      await updateStatus(id, 'active');
      setPreviewContract(prev => prev && prev.id === id ? { ...prev, status: 'active', signed_at: new Date().toISOString() } : prev);
    }
  };

  const handleSendEmail = async (id: string) => {
    setSendingEmail(true);
    try {
      const res = await fetch('/api/contracts/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractId: id }),
      });
      if (res.ok) {
        const contract = contracts.find(c => c.id === id);
        if (contract?.status === 'draft') {
          setContracts(prev => prev.map(c => c.id === id ? { ...c, status: 'pending_signature' } : c));
        }
      }
    } catch {
      // silently fail
    } finally {
      setSendingEmail(false);
    }
  };

  const deleteContract = async (id: string) => {
    setActionMenu(null);
    const ok = await confirm('Delete Document', 'This will permanently delete this document. This action cannot be undone.');
    if (!ok) return;
    await supabase.from('contracts').delete().eq('id', id);
    setContracts(prev => prev.filter(c => c.id !== id));
  };

  const copyRefNumber = (c: Contract) => {
    const ref = `AFU-${(c.document_type || 'contract').toUpperCase().replace(/_/g, '-')}-${new Date(c.created_at).getFullYear()}-${c.id.substring(0, 6).toUpperCase()}`;
    navigator.clipboard.writeText(ref);
    setActionMenu(null);
  };

  const setFormTyped = (fn: (p: Record<string, unknown>) => Record<string, unknown>) => {
    setForm(prev => fn(prev));
  };

  return (
    <div className="space-y-6">
      {ConfirmDialog}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">Proposals &amp; Contracts</h1>
          <p className="text-sm text-gray-500 mt-1">Create, manage, and track all legal documents and agreements</p>
        </div>
        <button
          onClick={() => setShowTypePicker(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-[#5DB347] to-[#449933] hover:from-[#449933] hover:to-[#3a8529] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-sm hover:shadow-md"
        >
          <Plus className="w-4 h-4" /> New Document
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Total Documents', value: stats.total, icon: FileText, color: 'text-[#1B2A4A]', iconBg: 'bg-slate-100' },
          { label: 'Active', value: stats.active, icon: FileCheck, color: 'text-emerald-700', iconBg: 'bg-emerald-50' },
          { label: 'Pending Signature', value: stats.pending, icon: FileSignature, color: 'text-amber-700', iconBg: 'bg-amber-50' },
          { label: 'Drafts', value: stats.draft, icon: FileClock, color: 'text-slate-500', iconBg: 'bg-slate-50' },
          { label: 'Expiring Soon', value: stats.expiring, icon: AlertTriangle, color: stats.expiring > 0 ? 'text-red-600' : 'text-slate-400', iconBg: stats.expiring > 0 ? 'bg-red-50' : 'bg-slate-50' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${s.iconBg} flex items-center justify-center flex-shrink-0`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div>
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by title, party name, or email..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] transition-all"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Filter className="w-3.5 h-3.5" />
              <span className="font-medium">Filters:</span>
            </div>

            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs font-medium text-gray-600 focus:ring-2 focus:ring-[#5DB347]/30">
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="pending_signature">Pending Signature</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="terminated">Terminated</option>
            </select>

            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs font-medium text-gray-600 focus:ring-2 focus:ring-[#5DB347]/30">
              <option value="all">All Party Types</option>
              {Object.entries(PARTY_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>

            <select value={docTypeFilter} onChange={e => setDocTypeFilter(e.target.value)} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs font-medium text-gray-600 focus:ring-2 focus:ring-[#5DB347]/30">
              <option value="all">All Document Types</option>
              {DOCUMENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>

            <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs font-medium text-gray-600 focus:ring-2 focus:ring-[#5DB347]/30">
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Alphabetical</option>
            </select>

            <button onClick={fetchContracts} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors" title="Refresh">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Active filter tags */}
        {(statusFilter !== 'all' || typeFilter !== 'all' || docTypeFilter !== 'all' || searchTerm) && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50">
            <span className="text-[10px] text-gray-400 font-medium">Active:</span>
            {statusFilter !== 'all' && (
              <button onClick={() => setStatusFilter('all')} className="flex items-center gap-1 bg-blue-50 text-blue-700 text-[10px] font-medium px-2 py-0.5 rounded-full hover:bg-blue-100">
                {STATUS_CONFIG[statusFilter]?.label} <X className="w-3 h-3" />
              </button>
            )}
            {typeFilter !== 'all' && (
              <button onClick={() => setTypeFilter('all')} className="flex items-center gap-1 bg-purple-50 text-purple-700 text-[10px] font-medium px-2 py-0.5 rounded-full hover:bg-purple-100">
                {PARTY_CONFIG[typeFilter]?.label} <X className="w-3 h-3" />
              </button>
            )}
            {docTypeFilter !== 'all' && (
              <button onClick={() => setDocTypeFilter('all')} className="flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] font-medium px-2 py-0.5 rounded-full hover:bg-emerald-100">
                {DOCUMENT_TYPE_LABELS[docTypeFilter]} <X className="w-3 h-3" />
              </button>
            )}
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="flex items-center gap-1 bg-gray-100 text-gray-600 text-[10px] font-medium px-2 py-0.5 rounded-full hover:bg-gray-200">
                &ldquo;{searchTerm}&rdquo; <X className="w-3 h-3" />
              </button>
            )}
            <button
              onClick={() => { setStatusFilter('all'); setTypeFilter('all'); setDocTypeFilter('all'); setSearchTerm(''); }}
              className="text-[10px] text-gray-400 hover:text-gray-600 font-medium ml-1"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400">
          Showing <span className="font-semibold text-gray-600">{filtered.length}</span> of {contracts.length} documents
        </p>
      </div>

      {/* ═══ CONTRACT TABLE ═══ */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#5DB347]" />
          <p className="text-sm text-gray-400">Loading documents...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 text-center py-20 px-6">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-slate-300" />
          </div>
          <p className="font-semibold text-[#1B2A4A] mb-1">{contracts.length === 0 ? 'No documents yet' : 'No matching documents'}</p>
          <p className="text-sm text-gray-400 mb-6 max-w-sm mx-auto">
            {contracts.length === 0
              ? 'Create your first proposal, contract, or agreement to get started.'
              : 'Try adjusting your filters or search terms.'}
          </p>
          {contracts.length === 0 && (
            <button onClick={() => setShowTypePicker(true)} className="inline-flex items-center gap-2 bg-[#5DB347] text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-[#449933] transition-colors">
              <Plus className="w-4 h-4" /> Create First Document
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_140px_160px_120px_100px_48px] gap-4 px-6 py-3 bg-slate-50 border-b border-gray-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <span>Document</span>
            <span>Party</span>
            <span>Type</span>
            <span>Period</span>
            <span>Status</span>
            <span />
          </div>

          {/* Table rows */}
          <div className="divide-y divide-gray-50">
            {filtered.map(c => {
              const status = STATUS_CONFIG[c.status] || STATUS_CONFIG.draft;
              const party = PARTY_CONFIG[c.party_type] || PARTY_CONFIG.supplier;
              const PartyIcon = party.icon;
              const docType = DOC_TYPE_MAP[c.document_type];
              const DocIcon = docType?.icon || FileText;
              const days = c.end_date && c.status === 'active' ? daysUntil(c.end_date) : null;
              const isExpiringSoon = days !== null && days <= 30 && days > 0;

              return (
                <div
                  key={c.id}
                  className="grid grid-cols-[1fr_140px_160px_120px_100px_48px] gap-4 px-6 py-4 items-center hover:bg-slate-50/50 transition-colors group"
                >
                  {/* Document info */}
                  <div className="min-w-0">
                    <button
                      onClick={() => setPreviewContract(c)}
                      className="font-semibold text-[#1B2A4A] text-sm hover:text-[#5DB347] transition-colors text-left truncate block w-full"
                    >
                      {c.title}
                    </button>
                    <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                      AFU-{(c.document_type || 'contract').toUpperCase().replace(/_/g, '-')}-{new Date(c.created_at).getFullYear()}-{c.id.substring(0, 6).toUpperCase()}
                    </p>
                  </div>

                  {/* Party */}
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`w-7 h-7 rounded-lg ${party.color} flex items-center justify-center flex-shrink-0`}>
                      <PartyIcon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-[#1B2A4A] truncate">{c.party_name}</p>
                      <p className="text-[10px] text-gray-400 capitalize">{c.party_type}</p>
                    </div>
                  </div>

                  {/* Document type */}
                  <div className="flex items-center gap-2">
                    <DocIcon className={`w-4 h-4 ${docType?.color.split(' ')[0] || 'text-gray-400'} flex-shrink-0`} />
                    <div>
                      <span className="text-xs text-gray-600 font-medium">
                        {docType?.shortLabel || DOCUMENT_TYPE_LABELS[c.document_type] || 'Contract'}
                      </span>
                      {c.payment_terms && (
                        <p className="text-[10px] text-gray-400 mt-0.5">{PAYMENT_TERMS.find(t => t.value === c.payment_terms)?.label}</p>
                      )}
                    </div>
                  </div>

                  {/* Period */}
                  <div className="text-xs text-gray-500">
                    {c.start_date ? (
                      <div>
                        <p>{formatDate(c.start_date)}</p>
                        <p className="text-[10px] text-gray-400">{c.end_date ? `to ${formatDate(c.end_date)}` : 'Ongoing'}</p>
                        {isExpiringSoon && (
                          <p className="text-[10px] text-red-500 font-semibold mt-0.5">{days}d remaining</p>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-300">Not set</span>
                    )}
                  </div>

                  {/* Status */}
                  <div>
                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full ${status.bg} ${status.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                      {status.label}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="relative">
                    <button
                      onClick={() => setActionMenu(actionMenu === c.id ? null : c.id)}
                      className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>

                    {actionMenu === c.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setActionMenu(null)} />
                        <div className="absolute right-0 top-full mt-1 z-20 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 w-52 animate-in fade-in slide-in-from-top-1">
                          <button onClick={() => { setPreviewContract(c); setActionMenu(null); }} className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-gray-600 hover:bg-gray-50">
                            <Eye className="w-3.5 h-3.5 text-gray-400" /> Preview Document
                          </button>
                          <button onClick={() => openEdit(c)} className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-gray-600 hover:bg-gray-50">
                            <Edit3 className="w-3.5 h-3.5 text-gray-400" /> Edit Details
                          </button>
                          <button onClick={() => copyRefNumber(c)} className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-gray-600 hover:bg-gray-50">
                            <Copy className="w-3.5 h-3.5 text-gray-400" /> Copy Reference
                          </button>
                          {c.party_email && (
                            <button onClick={() => { handleSendEmail(c.id); setActionMenu(null); }} className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-gray-600 hover:bg-gray-50">
                              <Mail className="w-3.5 h-3.5 text-gray-400" /> Send by Email
                            </button>
                          )}

                          <div className="my-1.5 border-t border-gray-100" />

                          {c.status === 'draft' && (
                            <button onClick={() => updateStatus(c.id, 'pending_signature')} className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-amber-700 hover:bg-amber-50">
                              <Send className="w-3.5 h-3.5" /> Send for Signature
                            </button>
                          )}
                          {c.status === 'pending_signature' && (
                            <button onClick={() => updateStatus(c.id, 'active')} className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-emerald-700 hover:bg-emerald-50">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Mark as Signed
                            </button>
                          )}
                          {c.status === 'active' && (
                            <button onClick={() => updateStatus(c.id, 'terminated')} className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-red-600 hover:bg-red-50">
                              <FileX className="w-3.5 h-3.5" /> Terminate
                            </button>
                          )}

                          <div className="my-1.5 border-t border-gray-100" />

                          <button onClick={() => deleteContract(c.id)} className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-red-500 hover:bg-red-50">
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══ PREVIEW MODAL ═══ */}
      {previewContract && (
        <ContractPreview
          contract={previewContract}
          onClose={() => setPreviewContract(null)}
          onSign={handleDigitalSign}
          onSendEmail={handleSendEmail}
          sendingEmail={sendingEmail}
        />
      )}

      {/* ═══ DOCUMENT TYPE PICKER ═══ */}
      {showTypePicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-5 flex items-center justify-between rounded-t-2xl">
              <div>
                <h3 className="text-lg font-bold text-[#1B2A4A]">What type of document?</h3>
                <p className="text-xs text-gray-400 mt-0.5">Choose the document type to get the right form and template</p>
              </div>
              <button onClick={() => setShowTypePicker(false)} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {DOCUMENT_TYPES.map(dt => {
                const DtIcon = dt.icon;
                return (
                  <button
                    key={dt.value}
                    onClick={() => startCreate(dt.value)}
                    className={`text-left p-5 rounded-xl border-2 hover:shadow-md transition-all group ${dt.color.split(' ').slice(1).join(' ')} hover:border-[#5DB347]`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-xl ${dt.color.split(' ')[1]} flex items-center justify-center flex-shrink-0`}>
                        <DtIcon className={`w-5 h-5 ${dt.color.split(' ')[0]}`} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-[#1B2A4A] text-sm group-hover:text-[#5DB347] transition-colors">{dt.label}</p>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">{dt.description}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {dt.relevantParties.map(p => (
                            <span key={p} className="text-[9px] font-medium uppercase tracking-wider bg-white/80 text-gray-400 px-1.5 py-0.5 rounded">
                              {PARTY_CONFIG[p]?.label || p}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ═══ CREATE / EDIT MODAL ═══ */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
            {/* Modal header */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center gap-3">
                {(() => {
                  const dt = DOC_TYPE_MAP[selectedDocType];
                  if (!dt) return null;
                  const DtIcon = dt.icon;
                  return (
                    <div className={`w-9 h-9 rounded-lg ${dt.color.split(' ')[1]} flex items-center justify-center`}>
                      <DtIcon className={`w-4.5 h-4.5 ${dt.color.split(' ')[0]}`} />
                    </div>
                  );
                })()}
                <div>
                  <h3 className="text-lg font-bold text-[#1B2A4A]">
                    {editing ? 'Edit' : 'New'} {DOC_TYPE_MAP[selectedDocType]?.label || 'Document'}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {DOC_TYPE_MAP[selectedDocType]?.description || 'Fill in the details below'}
                  </p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Section: Parties */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-4 h-4 text-[#5DB347]" />
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Party Information</h4>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Party Type *</label>
                    <select
                      value={form.party_type as string}
                      onChange={e => setForm(p => ({ ...p, party_type: e.target.value, contract_type: e.target.value }))}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
                    >
                      {Object.entries(PARTY_CONFIG).map(([k, v]) => (
                        <option key={k} value={k}>{v.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Party Name *</label>
                    <input
                      type="text" value={form.party_name as string}
                      onChange={e => setForm(p => ({ ...p, party_name: e.target.value }))}
                      placeholder="Company or individual name"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email Address</label>
                  <input
                    type="email" value={form.party_email as string}
                    onChange={e => setForm(p => ({ ...p, party_email: e.target.value }))}
                    placeholder="contact@example.com"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
                  />
                </div>
              </div>

              <div className="border-t border-gray-100" />

              {/* Section: Document Details */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-4 h-4 text-[#5DB347]" />
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Document Details</h4>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Document Title *</label>
                  <input
                    type="text" value={form.title as string}
                    onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                    placeholder={
                      selectedDocType === 'forward_growing' ? 'e.g. Maize Forward Contract - Chiredzi Farm' :
                      selectedDocType === 'offtake_agreement' ? 'e.g. Coffee Off-take - Starbucks SA' :
                      selectedDocType === 'partnership_agreement' ? 'e.g. Strategic Partnership - AgriTech Solutions' :
                      selectedDocType === 'nda' ? 'e.g. Confidentiality Agreement - Investor X' :
                      selectedDocType === 'investor_pack' ? 'e.g. Series A Investment - Green Capital Fund' :
                      'Document title'
                    }
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
                  />
                </div>
                <div className="mt-3">
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Description</label>
                  <textarea
                    value={form.description as string}
                    onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                    rows={2}
                    placeholder="Brief summary of the agreement scope and purpose..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm resize-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
                  />
                </div>
              </div>

              {/* ─── TYPE-SPECIFIC FIELDS ─── */}
              <TypeSpecificFields
                docType={selectedDocType}
                custom={customFields}
                setCustom={setCustomFields}
                form={form}
                setForm={setFormTyped}
              />

              <div className="border-t border-gray-100" />

              {/* Duration, Payment, Territory */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4 text-[#5DB347]" />
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Duration &amp; Payment</h4>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Start Date</label>
                    <input
                      type="date" value={form.start_date as string}
                      onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">End Date</label>
                    <input
                      type="date" value={form.end_date as string}
                      onChange={e => setForm(p => ({ ...p, end_date: e.target.value }))}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Payment Terms</label>
                    <select
                      value={form.payment_terms as string}
                      onChange={e => setForm(p => ({ ...p, payment_terms: e.target.value }))}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
                    >
                      {PAYMENT_TERMS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                </div>

                {/* Territory (for applicable types) */}
                {['ambassador_agreement', 'partnership_agreement', 'supplier_agreement', 'offtake_agreement'].includes(selectedDocType) && (
                  <div className="mt-3">
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Territory</label>
                    <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto bg-gray-50 border border-gray-200 rounded-xl p-2">
                      {COUNTRIES.map(c => (
                        <button
                          key={c} type="button"
                          onClick={() => setForm(p => {
                            const t = p.territory as string[];
                            return { ...p, territory: t.includes(c) ? t.filter(x => x !== c) : [...t, c] };
                          })}
                          className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${
                            (form.territory as string[]).includes(c)
                              ? 'bg-[#5DB347] text-white border-[#5DB347]'
                              : 'border-gray-200 text-gray-500 hover:border-gray-300'
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-8 mt-4">
                  {['ambassador_agreement', 'supplier_agreement', 'partnership_agreement'].includes(selectedDocType) && (
                    <label className="flex items-center gap-2.5 text-sm text-gray-600 cursor-pointer">
                      <input
                        type="checkbox" checked={form.exclusivity as boolean}
                        onChange={e => setForm(p => ({ ...p, exclusivity: e.target.checked }))}
                        className="rounded border-gray-300 text-[#5DB347] focus:ring-[#5DB347] w-4 h-4"
                      />
                      <span className="font-medium">Exclusive territory</span>
                    </label>
                  )}
                  <label className="flex items-center gap-2.5 text-sm text-gray-600 cursor-pointer">
                    <input
                      type="checkbox" checked={form.auto_renew as boolean}
                      onChange={e => setForm(p => ({ ...p, auto_renew: e.target.checked }))}
                      className="rounded border-gray-300 text-[#5DB347] focus:ring-[#5DB347] w-4 h-4"
                    />
                    <span className="font-medium">Auto-renew on expiry</span>
                  </label>
                </div>
              </div>

              <div className="border-t border-gray-100" />

              {/* Notes */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Edit3 className="w-4 h-4 text-[#5DB347]" />
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Internal Notes</h4>
                </div>
                <textarea
                  value={form.notes as string}
                  onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                  rows={2}
                  placeholder="Internal notes (not shown on the document)..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm resize-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex items-center justify-between rounded-b-2xl">
              <p className="text-[10px] text-gray-400">* Required fields</p>
              <div className="flex gap-3">
                <button onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !(form.party_name as string) || !(form.title as string)}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-[#5DB347] to-[#449933] text-white hover:from-[#449933] hover:to-[#3a8529] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                  {editing ? 'Save Changes' : 'Create Document'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
