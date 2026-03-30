'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Download,
  Search,
  FolderOpen,
  Shield,
  BarChart3,
  ScrollText,
  FileCheck,
  Leaf,
  ArrowUpDown,
  ChevronDown,
  Calendar,
  HardDrive,
  DownloadCloud,
} from 'lucide-react';
import { useAuth } from '@/lib/supabase/auth-context';
import { createClient } from '@/lib/supabase/client';

interface InvestorDocument {
  id: string;
  name: string;
  category: string;
  file_url: string | null;
  file_size: string | null;
  uploaded_at: string;
  description: string | null;
}

const categories = [
  { key: 'all', label: 'All Documents', icon: FolderOpen, count: 12 },
  { key: 'fund_docs', label: 'Fund Documents', icon: ScrollText, count: 2 },
  { key: 'reports', label: 'Quarterly Reports', icon: BarChart3, count: 3 },
  { key: 'financial', label: 'Financial Statements', icon: FileCheck, count: 2 },
  { key: 'legal', label: 'Legal & Compliance', icon: Shield, count: 3 },
  { key: 'impact', label: 'Impact Reports', icon: Leaf, count: 2 },
];

const FALLBACK_DOCUMENTS: InvestorDocument[] = [
  {
    id: '1',
    name: 'AFU Fund I - Subscription Agreement',
    category: 'legal',
    file_url: '#',
    file_size: '2.4 MB',
    uploaded_at: '2025-06-15T00:00:00Z',
    description: 'Standard subscription agreement for AFU Fund I limited partners.',
  },
  {
    id: '2',
    name: 'AFU Fund I - Information Memorandum',
    category: 'fund_docs',
    file_url: '#',
    file_size: '8.1 MB',
    uploaded_at: '2025-03-01T00:00:00Z',
    description: 'Comprehensive fund overview including strategy, terms, risk factors, and track record.',
  },
  {
    id: '3',
    name: 'Q1 2026 Quarterly Report',
    category: 'reports',
    file_url: '#',
    file_size: '3.2 MB',
    uploaded_at: '2026-03-20T00:00:00Z',
    description: 'Performance report covering January to March 2026. Fund I returned 5.2% for the quarter.',
  },
  {
    id: '4',
    name: 'Q4 2025 Quarterly Report',
    category: 'reports',
    file_url: '#',
    file_size: '2.8 MB',
    uploaded_at: '2025-12-22T00:00:00Z',
    description: 'Performance report covering October to December 2025 with full-year summary.',
  },
  {
    id: '5',
    name: 'Q3 2025 Quarterly Report',
    category: 'reports',
    file_url: '#',
    file_size: '2.5 MB',
    uploaded_at: '2025-09-28T00:00:00Z',
    description: 'Performance report covering July to September 2025.',
  },
  {
    id: '6',
    name: 'FY2025 Audited Financial Statements',
    category: 'financial',
    file_url: '#',
    file_size: '4.1 MB',
    uploaded_at: '2026-02-15T00:00:00Z',
    description: 'Independently audited financial statements for AFU Fund I, FY ending 31 Dec 2025.',
  },
  {
    id: '7',
    name: 'Annual Impact Report 2025',
    category: 'impact',
    file_url: '#',
    file_size: '6.3 MB',
    uploaded_at: '2026-01-30T00:00:00Z',
    description: 'Comprehensive impact report covering farmer livelihoods, ESG metrics, and SDG contributions.',
  },
  {
    id: '8',
    name: 'Tax Certificate - FY2025',
    category: 'legal',
    file_url: '#',
    file_size: '0.3 MB',
    uploaded_at: '2026-02-28T00:00:00Z',
    description: 'Annual tax certificate for investor tax filings. Covers FY2025 distributions and income.',
  },
  {
    id: '9',
    name: 'Fund Constitution',
    category: 'fund_docs',
    file_url: '#',
    file_size: '1.8 MB',
    uploaded_at: '2025-01-10T00:00:00Z',
    description: 'Governing document of AFU Fund I outlining fund structure, governance, and investor rights.',
  },
  {
    id: '10',
    name: 'KYC Compliance Pack',
    category: 'legal',
    file_url: '#',
    file_size: '0.5 MB',
    uploaded_at: '2025-08-12T00:00:00Z',
    description: 'Know Your Customer documentation pack including AML policy and compliance procedures.',
  },
  {
    id: '11',
    name: 'Monthly NAV Statement - March 2026',
    category: 'financial',
    file_url: '#',
    file_size: '0.2 MB',
    uploaded_at: '2026-03-25T00:00:00Z',
    description: 'Net asset value statement as at 31 March 2026. Unit price: $1.187.',
  },
  {
    id: '12',
    name: 'SDG Alignment Framework',
    category: 'impact',
    file_url: '#',
    file_size: '1.1 MB',
    uploaded_at: '2025-11-15T00:00:00Z',
    description: 'Framework mapping AFU activities to UN Sustainable Development Goals 1, 2, 8, and 13.',
  },
];

const categoryBadgeColors: Record<string, string> = {
  fund_docs: 'bg-blue-50 text-blue-700 border-blue-100',
  reports: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  financial: 'bg-amber-50 text-amber-700 border-amber-100',
  legal: 'bg-red-50 text-red-700 border-red-100',
  impact: 'bg-purple-50 text-purple-700 border-purple-100',
};

const categoryLabels: Record<string, string> = {
  fund_docs: 'Fund Docs',
  reports: 'Reports',
  financial: 'Financial',
  legal: 'Legal',
  impact: 'Impact',
};

const categoryIcons: Record<string, typeof FileText> = {
  fund_docs: ScrollText,
  reports: BarChart3,
  financial: FileCheck,
  legal: Shield,
  impact: Leaf,
};

type SortField = 'date' | 'name';
type SortDirection = 'asc' | 'desc';

export default function DocumentsPage() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<InvestorDocument[]>(FALLBACK_DOCUMENTS);
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [loading, setLoading] = useState(true);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      if (!user) { setLoading(false); return; }
      try {
        // Try investor_documents table first
        const { data } = await supabase
          .from('investor_documents')
          .select('*')
          .order('uploaded_at', { ascending: false });
        if (data && data.length > 0) {
          setDocuments(data);
        } else {
          // Fall back to documents table
          const { data: docs } = await supabase
            .from('documents')
            .select('*')
            .order('created_at', { ascending: false });
          if (docs && docs.length > 0) {
            const mapped: InvestorDocument[] = docs.map((row: Record<string, unknown>) => ({
              id: String(row.id),
              name: String(row.name || row.title || 'Untitled'),
              category: String(row.category || row.document_type || 'fund_docs'),
              file_url: row.file_url ? String(row.file_url) : row.storage_path ? String(row.storage_path) : null,
              file_size: row.file_size ? String(row.file_size) : null,
              uploaded_at: String(row.uploaded_at || row.created_at || new Date().toISOString()),
              description: row.description ? String(row.description) : null,
            }));
            setDocuments(mapped);
          } else {
            // Try Supabase storage bucket listing as last resort
            const { data: storageFiles } = await supabase.storage
              .from('investor-documents')
              .list('', { limit: 50, sortBy: { column: 'created_at', order: 'desc' } });
            if (storageFiles && storageFiles.length > 0) {
              const mapped: InvestorDocument[] = storageFiles
                .filter((f) => f.name && !f.name.startsWith('.'))
                .map((f) => {
                  const { data: urlData } = supabase.storage
                    .from('investor-documents')
                    .getPublicUrl(f.name);
                  return {
                    id: f.id || f.name,
                    name: f.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
                    category: 'fund_docs',
                    file_url: urlData?.publicUrl || null,
                    file_size: f.metadata?.size ? `${(Number(f.metadata.size) / (1024 * 1024)).toFixed(1)} MB` : null,
                    uploaded_at: f.created_at || new Date().toISOString(),
                    description: null,
                  };
                });
              if (mapped.length > 0) setDocuments(mapped);
            }
          }
        }
      } catch {
        // use demo
      }
      setLoading(false);
    }
    load();
  }, [user, supabase]);

  const filtered = documents
    .filter((d) => {
      const matchCat = activeCategory === 'all' || d.category === activeCategory;
      const matchSearch =
        !search ||
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        (d.description && d.description.toLowerCase().includes(search.toLowerCase()));
      return matchCat && matchSearch;
    })
    .sort((a, b) => {
      if (sortField === 'date') {
        const diff = new Date(a.uploaded_at).getTime() - new Date(b.uploaded_at).getTime();
        return sortDirection === 'desc' ? -diff : diff;
      }
      const diff = a.name.localeCompare(b.name);
      return sortDirection === 'desc' ? -diff : diff;
    });

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection(field === 'date' ? 'desc' : 'asc');
    }
    setShowSortMenu(false);
  };

  const activeCatData = categories.find((c) => c.key === activeCategory);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#1B2A4A]">Data Room</h1>
            <p className="text-gray-500 text-sm mt-1">
              Secure access to fund documents, reports, and legal agreements.
            </p>
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1B2A4A] text-white text-sm font-medium hover:bg-[#1B2A4A]/90 transition-colors shadow-sm">
            <DownloadCloud className="w-4 h-4" />
            Download All
          </button>
        </div>
      </motion.div>

      {/* Search + Sort Controls */}
      <motion.div
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex items-center gap-3 flex-wrap"
      >
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search documents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] bg-white"
          />
        </div>

        <div className="relative">
          <button
            onClick={() => setShowSortMenu(!showSortMenu)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-600 hover:border-gray-300 transition-colors"
          >
            <ArrowUpDown className="w-4 h-4" />
            Sort: {sortField === 'date' ? 'Date' : 'Name'}
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          {showSortMenu && (
            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 py-1 min-w-[160px]">
              <button
                onClick={() => toggleSort('date')}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${sortField === 'date' ? 'text-[#5DB347] font-medium' : 'text-gray-600'}`}
              >
                Date {sortField === 'date' && (sortDirection === 'desc' ? '(Newest)' : '(Oldest)')}
              </button>
              <button
                onClick={() => toggleSort('name')}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${sortField === 'name' ? 'text-[#5DB347] font-medium' : 'text-gray-600'}`}
              >
                Name {sortField === 'name' && (sortDirection === 'asc' ? '(A-Z)' : '(Z-A)')}
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Category Filter Tabs */}
      <motion.div
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="flex gap-2 flex-wrap"
      >
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.key;
          const count =
            cat.key === 'all'
              ? documents.length
              : documents.filter((d) => d.category === cat.key).length;
          return (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-[#1B2A4A] text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-[#1B2A4A]/20 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{cat.label}</span>
              <span
                className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </motion.div>

      {/* Active Category Header */}
      {activeCatData && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="font-medium text-[#1B2A4A]">{activeCatData.label}</span>
          <span>&middot;</span>
          <span>{filtered.length} document{filtered.length !== 1 ? 's' : ''}</span>
        </div>
      )}

      {/* Documents List */}
      <div className="space-y-3">
        {loading ? (
          <div className="bg-white rounded-2xl p-12 text-center">
            <div className="inline-flex items-center gap-3 text-gray-400 text-sm">
              <div className="w-5 h-5 border-2 border-gray-300 border-t-[#5DB347] rounded-full animate-spin" />
              Loading documents...
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center">
            <FolderOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No documents found.</p>
            {search && (
              <button
                onClick={() => setSearch('')}
                className="mt-2 text-[#5DB347] text-sm font-medium hover:underline"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filtered.map((doc, i) => {
              const CatIcon = categoryIcons[doc.category] || FileText;
              const badgeColor = categoryBadgeColors[doc.category] || 'bg-gray-50 text-gray-600 border-gray-100';
              const label = categoryLabels[doc.category] || doc.category;
              return (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25, delay: i * 0.03 }}
                  className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    {/* File icon */}
                    <div className="w-12 h-12 bg-gradient-to-br from-[#EBF7E5] to-[#d4edcc] rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <CatIcon className="w-5 h-5 text-[#5DB347]" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-[#1B2A4A] text-sm truncate">{doc.name}</h3>
                        <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badgeColor}`}>
                          {label}
                        </span>
                      </div>
                      {doc.description && (
                        <p className="text-xs text-gray-500 line-clamp-1 mb-1.5">{doc.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-[11px] text-gray-400">
                        <span className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          PDF
                        </span>
                        {doc.file_size && (
                          <span className="flex items-center gap-1">
                            <HardDrive className="w-3 h-3" />
                            {doc.file_size}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(doc.uploaded_at).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Download button */}
                    {doc.file_url && (
                      <a
                        href={doc.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#5DB347]/10 text-[#5DB347] text-sm font-medium hover:bg-[#5DB347] hover:text-white transition-all"
                      >
                        <Download className="w-4 h-4" />
                        <span className="hidden sm:inline">Download</span>
                      </a>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
