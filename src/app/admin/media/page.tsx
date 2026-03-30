'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  ImageIcon, Upload, Trash2, Copy, Loader2, X, CheckCircle2, AlertCircle,
  File, FileImage, FileText, Grid, List, Search, Info,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface MediaFile {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  created_at: string;
}

const BUCKET = 'media';

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
      {type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
      {message}
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function isImage(type: string): boolean {
  return type.startsWith('image/') || /\.(jpg|jpeg|png|gif|svg|webp|bmp|ico)$/i.test(type);
}

function getFileIcon(type: string) {
  if (isImage(type)) return <FileImage className="w-8 h-8 text-blue-400" />;
  if (type.includes('pdf')) return <FileText className="w-8 h-8 text-red-400" />;
  return <File className="w-8 h-8 text-gray-400" />;
}

export default function AdminMediaPage() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MediaFile | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'images' | 'documents'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [bucketExists, setBucketExists] = useState(true);
  const fileInput = useRef<HTMLInputElement>(null);

  const supabase = createClient();

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.storage.from(BUCKET).list('', {
        limit: 200,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' },
      });

      if (error) {
        if (error.message.includes('not found') || error.message.includes('bucket')) {
          setBucketExists(false);
        }
        setFiles([]);
        setLoading(false);
        return;
      }

      const mediaFiles: MediaFile[] = (data || [])
        .filter((f) => f.name !== '.emptyFolderPlaceholder')
        .map((f) => {
          const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(f.name);
          return {
            id: f.id || f.name,
            name: f.name,
            url: urlData.publicUrl,
            size: f.metadata?.size || 0,
            type: f.metadata?.mimetype || f.name.split('.').pop() || 'unknown',
            created_at: f.created_at || new Date().toISOString(),
          };
        });
      setFiles(mediaFiles);
    } catch {
      setBucketExists(false);
      setFiles([]);
    }
    setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { fetchFiles(); }, [fetchFiles]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;
    setUploading(true);

    let successCount = 0;
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const ext = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

      const { error } = await supabase.storage.from(BUCKET).upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

      if (!error) successCount++;
    }

    if (successCount > 0) {
      setToast({ message: `${successCount} file(s) uploaded`, type: 'success' });
      await fetchFiles();
    } else {
      setToast({ message: 'Upload failed. Check storage configuration.', type: 'error' });
    }
    setUploading(false);
    if (fileInput.current) fileInput.current.value = '';
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const { error } = await supabase.storage.from(BUCKET).remove([deleteTarget.name]);
    if (error) { setToast({ message: 'Failed to delete', type: 'error' }); }
    else { setToast({ message: 'File deleted', type: 'success' }); setFiles((p) => p.filter((f) => f.id !== deleteTarget.id)); }
    setDeleteTarget(null); setDeleting(false);
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setToast({ message: 'URL copied to clipboard', type: 'success' });
  };

  const filtered = files.filter((f) => {
    if (search && !f.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (typeFilter === 'images' && !isImage(f.type)) return false;
    if (typeFilter === 'documents' && isImage(f.type)) return false;
    return true;
  });

  if (!bucketExists) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">Media Library</h1>
          <p className="text-sm text-gray-500 mt-1">Manage uploaded files and images</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <Info className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-[#1B2A4A] mb-2">Storage Not Configured</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto mb-4">
            The Supabase Storage bucket &quot;{BUCKET}&quot; needs to be created. Follow these steps:
          </p>
          <div className="text-left max-w-md mx-auto bg-gray-50 rounded-lg p-4 text-sm space-y-2">
            <p className="font-medium text-[#1B2A4A]">Setup Instructions:</p>
            <ol className="list-decimal list-inside space-y-1 text-gray-600">
              <li>Go to your Supabase dashboard</li>
              <li>Navigate to Storage in the left sidebar</li>
              <li>Click &quot;New bucket&quot;</li>
              <li>Name it &quot;{BUCKET}&quot;</li>
              <li>Set it as a Public bucket</li>
              <li>Click &quot;Save&quot;</li>
            </ol>
          </div>
          <button onClick={fetchFiles} className="mt-4 px-4 py-2 bg-[#5DB347] text-white text-sm font-medium rounded-lg hover:bg-[#4a9a38]">
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">Media Library</h1>
          <p className="text-sm text-gray-500 mt-1">Manage uploaded files and images</p>
        </div>
        <div className="flex gap-2">
          <input ref={fileInput} type="file" multiple accept="image/*,.pdf,.doc,.docx,.xls,.xlsx" onChange={handleUpload} className="hidden" />
          <button onClick={() => fileInput.current?.click()} disabled={uploading}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#5DB347] text-white text-sm font-medium rounded-lg hover:bg-[#4a9a38] shadow-sm transition-all disabled:opacity-50">
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {uploading ? 'Uploading...' : 'Upload Files'}
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search files..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347]" />
        </div>
        <div className="flex gap-2">
          {(['all', 'images', 'documents'] as const).map((t) => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${typeFilter === t ? 'bg-[#1B2A4A] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex gap-1 border border-gray-200 rounded-lg p-0.5">
          <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-[#5DB347] text-white' : 'text-gray-400'}`}><Grid className="w-4 h-4" /></button>
          <button onClick={() => setViewMode('list')} className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-[#5DB347] text-white' : 'text-gray-400'}`}><List className="w-4 h-4" /></button>
        </div>
        <span className="text-xs text-gray-500">{filtered.length} files</span>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#5DB347] mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading media...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-[#1B2A4A]">No files</h3>
          <p className="text-sm text-gray-500 mt-1">Upload files to get started.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((f) => (
            <div key={f.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden group hover:shadow-md transition-shadow">
              <div className="aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
                {isImage(f.type) ? (
                  <img src={f.url} alt={f.name} className="w-full h-full object-cover" />
                ) : (
                  getFileIcon(f.type)
                )}
              </div>
              <div className="p-3">
                <p className="text-xs font-medium text-[#1B2A4A] truncate">{f.name}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{formatBytes(f.size)}</p>
                <div className="flex gap-1 mt-2">
                  <button onClick={() => copyUrl(f.url)} className="flex-1 flex items-center justify-center gap-1 px-2 py-1 rounded bg-blue-50 text-blue-600 text-[10px] font-medium hover:bg-blue-100">
                    <Copy className="w-3 h-3" /> Copy URL
                  </button>
                  <button onClick={() => setDeleteTarget(f)} className="p-1 rounded bg-red-50 text-red-600 hover:bg-red-100">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500">File</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500">Type</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500">Size</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500">Date</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((f) => (
                <tr key={f.id} className="hover:bg-gray-50/50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      {isImage(f.type) ? (
                        <img src={f.url} alt="" className="w-8 h-8 rounded object-cover" />
                      ) : (
                        <div className="w-8 h-8 flex items-center justify-center">{getFileIcon(f.type)}</div>
                      )}
                      <span className="font-medium text-[#1B2A4A] truncate max-w-[200px]">{f.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-500">{f.type}</td>
                  <td className="py-3 px-4 text-gray-500">{formatBytes(f.size)}</td>
                  <td className="py-3 px-4 text-gray-500">{new Date(f.created_at).toLocaleDateString()}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => copyUrl(f.url)} className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100" title="Copy URL"><Copy className="w-3.5 h-3.5" /></button>
                      <button onClick={() => setDeleteTarget(f)} className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setDeleteTarget(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-[#1B2A4A]">Delete File</h3>
            <p className="text-sm text-gray-600">Are you sure you want to delete &quot;{deleteTarget.name}&quot;? This cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleDelete} disabled={deleting}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50">
                {deleting && <Loader2 className="w-4 h-4 animate-spin" />} Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
