'use client';

import { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Search,
  FolderOpen,
  Shield,
  BarChart3,
  ScrollText,
  FileCheck,
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
  { key: 'all', label: 'All', icon: FolderOpen },
  { key: 'term_sheets', label: 'Term Sheets', icon: ScrollText },
  { key: 'reports', label: 'Reports', icon: BarChart3 },
  { key: 'legal', label: 'Legal', icon: Shield },
  { key: 'compliance', label: 'Compliance', icon: FileCheck },
];

const demoDocuments: InvestorDocument[] = [
  { id: '1', name: 'AFU Investment Term Sheet 2025', category: 'term_sheets', file_url: '#', file_size: '245 KB', uploaded_at: '2025-01-10T00:00:00Z', description: 'Standard investment terms for debt and equity instruments.' },
  { id: '2', name: 'Q3 2025 Quarterly Report', category: 'reports', file_url: '#', file_size: '1.2 MB', uploaded_at: '2025-10-05T00:00:00Z', description: 'Performance report covering July to September 2025.' },
  { id: '3', name: 'Q4 2025 Quarterly Report', category: 'reports', file_url: '#', file_size: '1.4 MB', uploaded_at: '2025-12-20T00:00:00Z', description: 'Performance report covering October to December 2025.' },
  { id: '4', name: 'Subscription Agreement Template', category: 'legal', file_url: '#', file_size: '320 KB', uploaded_at: '2025-02-15T00:00:00Z', description: 'Template subscription agreement for new investors.' },
  { id: '5', name: 'AML/KYC Policy Document', category: 'compliance', file_url: '#', file_size: '180 KB', uploaded_at: '2025-03-01T00:00:00Z', description: 'Anti-money laundering and know-your-customer policy.' },
  { id: '6', name: 'Annual Impact Report 2024', category: 'reports', file_url: '#', file_size: '3.8 MB', uploaded_at: '2025-04-15T00:00:00Z', description: 'Comprehensive annual report on social and environmental impact.' },
  { id: '7', name: 'Investor Rights Agreement', category: 'legal', file_url: '#', file_size: '410 KB', uploaded_at: '2025-01-20T00:00:00Z', description: 'Agreement outlining investor rights and governance structure.' },
];

const categoryIcons: Record<string, typeof FileText> = {
  term_sheets: ScrollText,
  reports: BarChart3,
  legal: Shield,
  compliance: FileCheck,
};

export default function DocumentsPage() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<InvestorDocument[]>(demoDocuments);
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      if (!user) { setLoading(false); return; }
      try {
        const { data } = await supabase
          .from('investor_documents')
          .select('*')
          .order('uploaded_at', { ascending: false });
        if (data && data.length > 0) setDocuments(data);
      } catch {
        // use demo
      }
      setLoading(false);
    }
    load();
  }, [user, supabase]);

  const filtered = documents.filter((d) => {
    const matchCat = activeCategory === 'all' || d.category === activeCategory;
    const matchSearch = !search || d.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#1B2A4A]">Data Room</h1>
        <p className="text-gray-500 text-sm mt-1">Access investment documents, reports, and legal agreements.</p>
      </div>

      {/* Search + Category Filter */}
      <div className="space-y-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search documents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  activeCategory === cat.key
                    ? 'bg-[#5DB347] text-white shadow-sm'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-[#5DB347]/30'
                }`}
              >
                <Icon className="w-4 h-4" />
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Documents List */}
      <div className="space-y-3">
        {loading ? (
          <div className="bg-white rounded-2xl p-8 text-center text-gray-400 text-sm">Loading documents...</div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-gray-400 text-sm">No documents found.</div>
        ) : (
          filtered.map((doc) => {
            const CatIcon = categoryIcons[doc.category] || FileText;
            return (
              <div key={doc.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
                <div className="w-11 h-11 bg-[#EBF7E5] rounded-xl flex items-center justify-center shrink-0">
                  <CatIcon className="w-5 h-5 text-[#5DB347]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[#1B2A4A] text-sm truncate">{doc.name}</h3>
                  {doc.description && (
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{doc.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                    <span>{doc.category.replace(/_/g, ' ')}</span>
                    {doc.file_size && <span>{doc.file_size}</span>}
                    <span>{new Date(doc.uploaded_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>
                {doc.file_url && (
                  <a
                    href={doc.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl bg-[#5DB347]/10 text-[#5DB347] text-sm font-medium hover:bg-[#5DB347]/20 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">Download</span>
                  </a>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
