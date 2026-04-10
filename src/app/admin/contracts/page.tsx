'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/supabase/auth-context';
import {
  FileText, Plus, X, Loader2, CheckCircle2, Clock, AlertTriangle,
  Search, Edit3, Trash2, Calendar, DollarSign, Globe,
  Users, Building2, Award, Shield, RefreshCw, Eye, Printer, PenLine,
  Send, ChevronDown, MoreHorizontal, Filter, ArrowUpDown,
  FileCheck, FileClock, FileX, Briefcase, Handshake, FileSignature,
  Mail, Copy, ExternalLink,
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
};

const DOCUMENT_TYPES = [
  { value: 'contract',              label: 'Standard Contract' },
  { value: 'proposal',              label: 'Business Proposal' },
  { value: 'forward_growing',       label: 'Forward Growing Contract' },
  { value: 'offtake_agreement',     label: 'Off-take Agreement' },
  { value: 'investor_pack',         label: 'Investor Pack' },
  { value: 'partnership_agreement', label: 'Partnership Agreement' },
  { value: 'nda',                   label: 'Non-Disclosure Agreement' },
  { value: 'mou',                   label: 'Memorandum of Understanding' },
];

const DOCUMENT_TYPE_LABELS: Record<string, string> = Object.fromEntries(DOCUMENT_TYPES.map(d => [d.value, d.label]));

const PAYMENT_TERMS = [
  { value: 'upfront',     label: 'Upfront' },
  { value: 'on_delivery', label: 'On Delivery' },
  { value: 'net_7',       label: 'Net 7 Days' },
  { value: 'net_14',      label: 'Net 14 Days' },
  { value: 'net_30',      label: 'Net 30 Days' },
  { value: 'net_60',      label: 'Net 60 Days' },
  { value: 'net_90',      label: 'Net 90 Days' },
];

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
   CONTRACT PREVIEW — Professional document with AFU letterhead
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
  const docTypeCode = (contract.document_type || 'contract').toUpperCase().replace('_', '-');
  const year = new Date(contract.created_at).getFullYear();
  const refNumber = `AFU-${docTypeCode}-${year}-${contract.id.substring(0, 6).toUpperCase()}`;
  const docDate = formatDateLong(contract.created_at);

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
            <p className="text-white/50 text-xs mt-0.5">{refNumber}</p>
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

          {/* Green accent line */}
          <div className="h-1.5 bg-gradient-to-r from-[#5DB347] via-[#449933] to-[#5DB347]" />

          {/* Document title block */}
          <div className="px-12 pt-10 pb-6">
            <div className="text-center">
              <p className="text-xs font-semibold text-[#5DB347] uppercase tracking-[0.2em] mb-3">
                {DOCUMENT_TYPE_LABELS[contract.document_type] || 'Contract'}
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
                <p className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider mb-2">Party B</p>
                <p className="font-bold text-[#1B2A4A] text-lg">{contract.party_name}</p>
                {contract.party_email && (
                  <p className="text-xs text-slate-500 mt-1">{contract.party_email}</p>
                )}
                <p className="text-xs text-slate-400 mt-1 capitalize">{contract.party_type}</p>
              </div>
            </div>
          </div>

          {/* Key Terms */}
          <div className="px-12 pb-8">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.15em] mb-3">Key Terms &amp; Conditions</h3>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <tbody>
                  {[
                    ['Contract Type', contract.contract_type ? contract.contract_type.charAt(0).toUpperCase() + contract.contract_type.slice(1) + ' Agreement' : 'N/A'],
                    ['Document Type', DOCUMENT_TYPE_LABELS[contract.document_type] || contract.document_type],
                    ['Payment Terms', PAYMENT_TERMS.find(t => t.value === contract.payment_terms)?.label || contract.payment_terms || 'N/A'],
                    ['Territory', contract.territory?.length ? contract.territory.join(', ') : 'All territories'],
                    ['Exclusivity', contract.exclusivity ? 'Exclusive' : 'Non-exclusive'],
                    ...(contract.commission_rate != null ? [['Commission Rate', `${contract.commission_rate}%`]] : []),
                    ...(contract.minimum_order_value != null ? [['Minimum Order Value', `USD ${contract.minimum_order_value.toLocaleString()}`]] : []),
                    ...(contract.discount_rate != null ? [['Member Discount', `${contract.discount_rate}%`]] : []),
                    ['Commencement Date', formatDateLong(contract.start_date) || 'To be determined'],
                    ['Expiry Date', formatDateLong(contract.end_date) || 'Ongoing / Perpetual'],
                    ['Auto-Renewal', contract.auto_renew ? 'Yes — automatically renews on expiry' : 'No'],
                  ].map(([label, value], i) => (
                    <tr key={label as string} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                      <td className="px-5 py-3 text-slate-400 font-medium w-2/5 border-r border-slate-100">{label}</td>
                      <td className="px-5 py-3 text-[#1B2A4A] font-medium">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Description */}
          {(contract.description || contract.notes) && (
            <div className="px-12 pb-8">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.15em] mb-3">Description &amp; Additional Notes</h3>
              <div className="border border-slate-200 rounded-xl p-5 space-y-4 text-sm text-slate-700 leading-relaxed bg-white">
                {contract.description && <p>{contract.description}</p>}
                {contract.notes && (
                  <>
                    {contract.description && <div className="border-t border-slate-100 pt-4" />}
                    <div>
                      <p className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider mb-2">Internal Notes</p>
                      <p>{contract.notes}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Signature Block */}
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
              <p className="text-[10px] text-white/30">
                African Farming Union | Confidential
              </p>
              <p className="text-[10px] text-white/30 font-mono">
                ID: {contract.id}
              </p>
            </div>
          </div>
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

  const [form, setForm] = useState({
    party_type: 'supplier',
    party_name: '',
    party_email: '',
    contract_type: 'supplier',
    document_type: 'contract',
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

  /* ─── CRUD operations ─── */
  const openCreate = () => {
    setEditing(null);
    setForm({
      party_type: 'supplier', party_name: '', party_email: '', contract_type: 'supplier',
      document_type: 'contract', title: '', description: '', commission_rate: '',
      payment_terms: 'net_30', territory: [], exclusivity: false, minimum_order_value: '',
      discount_rate: '', start_date: '', end_date: '', auto_renew: false, notes: '',
    });
    setShowModal(true);
  };

  const openEdit = (c: Contract) => {
    setEditing(c);
    setForm({
      party_type: c.party_type, party_name: c.party_name, party_email: c.party_email || '',
      contract_type: c.contract_type, document_type: c.document_type || 'contract',
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
      party_email: form.party_email || null, contract_type: form.contract_type,
      document_type: form.document_type, title: form.title,
      description: form.description || null,
      commission_rate: form.commission_rate ? parseFloat(form.commission_rate) : null,
      payment_terms: form.payment_terms,
      territory: form.territory.length > 0 ? form.territory : null,
      exclusivity: form.exclusivity,
      minimum_order_value: form.minimum_order_value ? parseFloat(form.minimum_order_value) : null,
      discount_rate: form.discount_rate ? parseFloat(form.discount_rate) : null,
      start_date: form.start_date || null, end_date: form.end_date || null,
      auto_renew: form.auto_renew, notes: form.notes || null,
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
        // Update local state if status changed
        const contract = contracts.find(c => c.id === id);
        if (contract?.status === 'draft') {
          setContracts(prev => prev.map(c => c.id === id ? { ...c, status: 'pending_signature' } : c));
        }
      }
    } catch {
      // Silently fail — user can retry
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
    const ref = `AFU-${(c.document_type || 'contract').toUpperCase().replace('_', '-')}-${new Date(c.created_at).getFullYear()}-${c.id.substring(0, 6).toUpperCase()}`;
    navigator.clipboard.writeText(ref);
    setActionMenu(null);
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
          onClick={openCreate}
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
              <option value="supplier">Supplier</option>
              <option value="partner">Partner</option>
              <option value="ambassador">Ambassador</option>
              <option value="investor">Investor</option>
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
            <button onClick={openCreate} className="inline-flex items-center gap-2 bg-[#5DB347] text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-[#449933] transition-colors">
              <Plus className="w-4 h-4" /> Create First Document
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_140px_140px_120px_100px_48px] gap-4 px-6 py-3 bg-slate-50 border-b border-gray-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
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
              const days = c.end_date && c.status === 'active' ? daysUntil(c.end_date) : null;
              const isExpiringSoon = days !== null && days <= 30 && days > 0;

              return (
                <div
                  key={c.id}
                  className="grid grid-cols-[1fr_140px_140px_120px_100px_48px] gap-4 px-6 py-4 items-center hover:bg-slate-50/50 transition-colors group"
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
                      AFU-{(c.document_type || 'contract').toUpperCase().replace('_', '-')}-{new Date(c.created_at).getFullYear()}-{c.id.substring(0, 6).toUpperCase()}
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
                  <div>
                    <span className="text-xs text-gray-600 font-medium">
                      {DOCUMENT_TYPE_LABELS[c.document_type] || 'Contract'}
                    </span>
                    {c.payment_terms && (
                      <p className="text-[10px] text-gray-400 mt-0.5">{PAYMENT_TERMS.find(t => t.value === c.payment_terms)?.label}</p>
                    )}
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

      {/* ═══ CREATE / EDIT MODAL ═══ */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            {/* Modal header */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <div>
                <h3 className="text-lg font-bold text-[#1B2A4A]">{editing ? 'Edit Document' : 'Create New Document'}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{editing ? 'Update the document details below' : 'Fill in the details to create a new document'}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Section: Parties */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Party Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Party Type *</label>
                    <select
                      value={form.party_type}
                      onChange={e => setForm(p => ({ ...p, party_type: e.target.value, contract_type: e.target.value }))}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
                    >
                      <option value="supplier">Supplier</option>
                      <option value="partner">Partner</option>
                      <option value="ambassador">Ambassador</option>
                      <option value="investor">Investor</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Party Name *</label>
                    <input
                      type="text" value={form.party_name}
                      onChange={e => setForm(p => ({ ...p, party_name: e.target.value }))}
                      placeholder="Company or individual name"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email Address</label>
                  <input
                    type="email" value={form.party_email}
                    onChange={e => setForm(p => ({ ...p, party_email: e.target.value }))}
                    placeholder="contact@example.com"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
                  />
                </div>
              </div>

              <div className="border-t border-gray-100" />

              {/* Section: Document Details */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Document Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Document Title *</label>
                    <input
                      type="text" value={form.title}
                      onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                      placeholder="e.g. Supplier Agreement - Kalahari Seeds"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Document Type</label>
                    <select
                      value={form.document_type}
                      onChange={e => setForm(p => ({ ...p, document_type: e.target.value }))}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
                    >
                      {DOCUMENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                </div>
                <div className="mt-3">
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Description</label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                    rows={3}
                    placeholder="Brief description of the document scope and purpose..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm resize-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
                  />
                </div>
              </div>

              <div className="border-t border-gray-100" />

              {/* Section: Commercial Terms */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Commercial Terms</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Commission Rate (%)</label>
                    <input
                      type="number" step="0.1" value={form.commission_rate}
                      onChange={e => setForm(p => ({ ...p, commission_rate: e.target.value }))}
                      placeholder="5.0"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Member Discount (%)</label>
                    <input
                      type="number" step="0.1" value={form.discount_rate}
                      onChange={e => setForm(p => ({ ...p, discount_rate: e.target.value }))}
                      placeholder="10.0"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Payment Terms</label>
                    <select
                      value={form.payment_terms}
                      onChange={e => setForm(p => ({ ...p, payment_terms: e.target.value }))}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
                    >
                      {PAYMENT_TERMS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Min Order Value (USD)</label>
                    <input
                      type="number" value={form.minimum_order_value}
                      onChange={e => setForm(p => ({ ...p, minimum_order_value: e.target.value }))}
                      placeholder="1000"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Territory</label>
                    <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto bg-gray-50 border border-gray-200 rounded-xl p-2">
                      {COUNTRIES.map(c => (
                        <button
                          key={c} type="button"
                          onClick={() => setForm(p => ({
                            ...p,
                            territory: p.territory.includes(c) ? p.territory.filter(t => t !== c) : [...p.territory, c],
                          }))}
                          className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${
                            form.territory.includes(c)
                              ? 'bg-[#5DB347] text-white border-[#5DB347]'
                              : 'border-gray-200 text-gray-500 hover:border-gray-300'
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100" />

              {/* Section: Duration & Options */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Duration &amp; Options</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Start Date</label>
                    <input
                      type="date" value={form.start_date}
                      onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">End Date</label>
                    <input
                      type="date" value={form.end_date}
                      onChange={e => setForm(p => ({ ...p, end_date: e.target.value }))}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
                    />
                  </div>
                </div>
                <div className="flex gap-8 mt-4">
                  <label className="flex items-center gap-2.5 text-sm text-gray-600 cursor-pointer">
                    <input
                      type="checkbox" checked={form.exclusivity}
                      onChange={e => setForm(p => ({ ...p, exclusivity: e.target.checked }))}
                      className="rounded border-gray-300 text-[#5DB347] focus:ring-[#5DB347] w-4 h-4"
                    />
                    <span className="font-medium">Exclusive territory</span>
                  </label>
                  <label className="flex items-center gap-2.5 text-sm text-gray-600 cursor-pointer">
                    <input
                      type="checkbox" checked={form.auto_renew}
                      onChange={e => setForm(p => ({ ...p, auto_renew: e.target.checked }))}
                      className="rounded border-gray-300 text-[#5DB347] focus:ring-[#5DB347] w-4 h-4"
                    />
                    <span className="font-medium">Auto-renew on expiry</span>
                  </label>
                </div>
              </div>

              <div className="border-t border-gray-100" />

              {/* Section: Notes */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Internal Notes</h4>
                <textarea
                  value={form.notes}
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
                  disabled={saving || !form.party_name || !form.title}
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
