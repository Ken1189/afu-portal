'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  FileText,
  Download,
  Trash2,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Eye,
  Filter,
  Plus,
  X,
  Image as ImageIcon,
  File,
  Shield,
  Loader2,
} from 'lucide-react';
import { FileUpload } from '@/components/ui/FileUpload';
import { useAuth } from '@/lib/supabase/auth-context';
import { createClient } from '@/lib/supabase/client';

type DocStatus = 'verified' | 'pending' | 'rejected' | 'expired';

interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  date: string;
  category: string;
  status: DocStatus;
  statusNote?: string;
}

const FALLBACK_DOCUMENTS: Document[] = [
  { id: 'DOC-001', name: 'Membership Agreement', type: 'PDF', size: '245 KB', date: 'Jan 15, 2026', category: 'Contracts', status: 'verified' },
  { id: 'DOC-002', name: 'Working Capital Loan Agreement - FIN-2026-012', type: 'PDF', size: '380 KB', date: 'Feb 1, 2026', category: 'Financing', status: 'verified' },
  { id: 'DOC-003', name: 'Invoice Finance Agreement - FIN-2026-018', type: 'PDF', size: '320 KB', date: 'Feb 20, 2026', category: 'Financing', status: 'verified' },
  { id: 'DOC-004', name: 'Offtake Contract - Berry Fresh UK', type: 'PDF', size: '450 KB', date: 'Jan 10, 2026', category: 'Offtake', status: 'verified' },
  { id: 'DOC-005', name: 'Farm Inspection Report Q1 2026', type: 'PDF', size: '1.2 MB', date: 'Mar 5, 2026', category: 'Compliance', status: 'pending', statusNote: 'Under review by compliance team' },
  { id: 'DOC-006', name: 'Export Compliance Certificate', type: 'PDF', size: '180 KB', date: 'Mar 1, 2026', category: 'Certifications', status: 'verified' },
  { id: 'DOC-007', name: 'Farm Management Fundamentals - Certificate', type: 'PDF', size: '95 KB', date: 'Feb 15, 2026', category: 'Certifications', status: 'verified' },
  { id: 'DOC-008', name: 'Passport Scan', type: 'JPG', size: '2.1 MB', date: 'Jan 5, 2026', category: 'KYC', status: 'expired', statusNote: 'Expires May 12, 2026 — please renew' },
  { id: 'DOC-009', name: 'Bank Statement (Dec-Feb)', type: 'PDF', size: '890 KB', date: 'Mar 9, 2026', category: 'Financing', status: 'rejected', statusNote: 'Document older than 3 months. Please upload a recent one.' },
  { id: 'DOC-010', name: 'Farm Photos - Season 2', type: 'ZIP', size: '15.4 MB', date: 'Mar 11, 2026', category: 'Compliance', status: 'pending' },
];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileType(name: string): string {
  const ext = name.split('.').pop()?.toUpperCase() || 'FILE';
  return ext;
}

const categories = ['All', 'Contracts', 'Financing', 'Offtake', 'Compliance', 'Certifications', 'KYC'];

const statusConfig: Record<DocStatus, { label: string; cls: string; icon: React.ElementType }> = {
  verified: { label: 'Verified', cls: 'bg-green-50 text-green-700', icon: CheckCircle2 },
  pending: { label: 'Pending', cls: 'bg-amber-50 text-amber-700', icon: Clock },
  rejected: { label: 'Rejected', cls: 'bg-red-50 text-red-700', icon: AlertCircle },
  expired: { label: 'Expiring', cls: 'bg-orange-50 text-orange-700', icon: AlertCircle },
};

const typeIcon: Record<string, React.ElementType> = {
  PDF: FileText,
  JPG: ImageIcon,
  PNG: ImageIcon,
  ZIP: File,
};

export default function DocumentsPage() {
  const { user } = useAuth();
  const supabase = createClient();

  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [documents, setDocuments] = useState<Document[]>(FALLBACK_DOCUMENTS);
  const [loading, setLoading] = useState(true);

  // Fetch documents from Supabase
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    async function fetchDocuments() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('documents')
          .select('*')
          .eq('profile_id', user!.id)
          .order('created_at', { ascending: false });

        if (!cancelled && data && data.length > 0) {
          const mapped: Document[] = data.map((doc: Record<string, unknown>) => ({
            id: (doc.id as string) || '',
            name: (doc.name as string) || (doc.file_name as string) || 'Untitled',
            type: getFileType((doc.name as string) || (doc.file_name as string) || ''),
            size: doc.file_size ? formatFileSize(doc.file_size as number) : 'N/A',
            date: doc.created_at
              ? new Date(doc.created_at as string).toLocaleDateString('en-GB', { month: 'short', day: 'numeric', year: 'numeric' })
              : 'N/A',
            category: (doc.category as string) || 'Compliance',
            status: ((doc.status as string) || 'pending') as DocStatus,
            statusNote: (doc.status_note as string) || undefined,
          }));
          setDocuments(mapped);
        }
        // If no data returned, keep the default demo documents as fallback
      } catch {
        // Supabase fetch failed — keep default documents as fallback
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchDocuments();
    return () => { cancelled = true; };
  }, [user, supabase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-teal animate-spin" />
      </div>
    );
  }

  const filtered = documents.filter((doc) => {
    const matchCat = activeCategory === 'All' || doc.category === activeCategory;
    const matchSearch =
      !searchQuery || doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const pendingCount = documents.filter((d) => d.status === 'pending').length;
  const rejectedCount = documents.filter((d) => d.status === 'rejected').length;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-navy">Documents</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage your contracts, agreements, and certifications
          </p>
        </div>
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="flex items-center gap-2 bg-teal hover:bg-teal-dark text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm"
        >
          {showUpload ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showUpload ? 'Close' : 'Upload Document'}
        </button>
      </div>

      {/* Status Summary */}
      {(pendingCount > 0 || rejectedCount > 0) && (
        <div className="flex gap-4 mb-6">
          {pendingCount > 0 && (
            <div className="flex items-center gap-2 text-sm bg-amber-50 text-amber-700 px-4 py-2 rounded-lg">
              <Clock className="w-4 h-4" />
              {pendingCount} document{pendingCount > 1 ? 's' : ''} pending review
            </div>
          )}
          {rejectedCount > 0 && (
            <div className="flex items-center gap-2 text-sm bg-red-50 text-red-700 px-4 py-2 rounded-lg">
              <AlertCircle className="w-4 h-4" />
              {rejectedCount} document{rejectedCount > 1 ? 's' : ''} need{rejectedCount === 1 ? 's' : ''} attention
            </div>
          )}
        </div>
      )}

      {/* Upload Area (toggle) */}
      <AnimatePresence>
        {showUpload && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-8"
          >
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <Upload className="w-5 h-5 text-teal" />
                <h3 className="font-semibold text-navy">Upload New Documents</h3>
              </div>
              <FileUpload
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.zip"
                maxSize={25}
                multiple
              />
              {uploadedFiles.length > 0 && (
                <div className="mt-4 flex gap-3">
                  <select className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal/50">
                    <option value="">Select category</option>
                    {categories.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <button className="bg-teal hover:bg-teal-dark text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors">
                    Upload {uploadedFiles.length} file{uploadedFiles.length > 1 ? 's' : ''}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search documents..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <Filter className="w-4 h-4 text-gray-400 mr-1" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                activeCategory === cat
                  ? 'bg-teal text-white border-teal'
                  : 'border-gray-200 text-gray-600 hover:border-teal/30 hover:text-teal'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Documents List */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No documents found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((doc) => {
              const status = statusConfig[doc.status];
              const StatusIcon = status.icon;
              const TypeIcon = typeIcon[doc.type] || FileText;
              return (
                <div
                  key={doc.id}
                  className="p-4 flex items-center justify-between hover:bg-cream/50 transition-colors group"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                        doc.type === 'PDF'
                          ? 'bg-red-50'
                          : doc.type === 'JPG' || doc.type === 'PNG'
                          ? 'bg-blue-50'
                          : 'bg-gray-50'
                      }`}
                    >
                      <TypeIcon
                        className={`w-5 h-5 ${
                          doc.type === 'PDF'
                            ? 'text-red-500'
                            : doc.type === 'JPG' || doc.type === 'PNG'
                            ? 'text-blue-500'
                            : 'text-gray-500'
                        }`}
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-navy text-sm truncate">{doc.name}</p>
                      <p className="text-xs text-gray-400">
                        {doc.type} &middot; {doc.size} &middot; {doc.date}
                      </p>
                      {doc.statusNote && (
                        <p className="text-xs text-gray-500 mt-0.5 italic">{doc.statusNote}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${status.cls}`}
                    >
                      <StatusIcon className="w-3 h-3" />
                      {status.label}
                    </span>
                    <span className="hidden sm:block text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">
                      {doc.category}
                    </span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 text-gray-400 hover:text-teal rounded-lg hover:bg-teal/5 transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-gray-400 hover:text-teal rounded-lg hover:bg-teal/5 transition-colors">
                        <Download className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Required Documents Checklist */}
      <div className="mt-8 bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-teal" />
          <h3 className="font-semibold text-navy">Required Documents Checklist</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { label: 'Government ID / Passport', uploaded: true },
            { label: 'Bank Statement (3 months)', uploaded: false },
            { label: 'Proof of Address', uploaded: true },
            { label: 'Farm Registration / Land Title', uploaded: true },
            { label: 'Tax Clearance Certificate', uploaded: false },
            { label: 'Buyer Contract (if applicable)', uploaded: true },
          ].map((item, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 p-3 rounded-lg ${
                item.uploaded ? 'bg-green-50' : 'bg-gray-50'
              }`}
            >
              {item.uploaded ? (
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-gray-300 shrink-0" />
              )}
              <span className={`text-sm ${item.uploaded ? 'text-green-700' : 'text-gray-500'}`}>
                {item.label}
              </span>
              {!item.uploaded && (
                <button className="ml-auto text-xs text-teal font-medium hover:text-teal-dark">
                  Upload
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
