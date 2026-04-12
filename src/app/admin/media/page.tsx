'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  ImageIcon, Upload, Trash2, Copy, Loader2, X, CheckCircle2, AlertCircle,
  File, FileImage, FileText, Grid, List, Search, Info, Folder, FolderOpen, FolderPlus,
  ChevronRight, Home, Layers, Camera, Check, MoveRight, GripVertical,
} from 'lucide-react';
import Image from 'next/image';
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

const PREDEFINED_FOLDERS = [
  'General', 'Profiles', 'Farms', 'Crops', 'Blog', 'Documents', 'Logos', 'Partners',
];

const DEFAULT_NESTED_FOLDERS = [
  'Profiles/farmers', 'Profiles/suppliers', 'Profiles/ambassadors', 'Profiles/investors',
  'Farms/crops', 'Farms/livestock', 'Farms/journal',
  'Blog/posts', 'Blog/pages',
  'Documents/contracts', 'Documents/certificates', 'Documents/invoices',
];

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium transition-all animate-in slide-in-from-right ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
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
  const [currentPath, setCurrentPath] = useState('');
  const [folders, setFolders] = useState<string[]>([]);
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [creatingDefaults, setCreatingDefaults] = useState(false);

  // Drag and drop state
  const [draggedFile, setDraggedFile] = useState<MediaFile | null>(null);
  const [dragOverFolder, setDragOverFolder] = useState<string | null>(null);
  const [movingFiles, setMovingFiles] = useState(false);
  const [desktopDragOver, setDesktopDragOver] = useState(false);

  // Bulk selection state
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [showBulkMove, setShowBulkMove] = useState(false);
  const [bulkMoveTarget, setBulkMoveTarget] = useState('');

  const fileInput = useRef<HTMLInputElement>(null);
  const cameraInput = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const supabase = createClient();

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.storage.from(BUCKET).list(currentPath, {
        limit: 200,
        sortBy: { column: 'created_at', order: 'desc' },
      });

      if (error) {
        if (error.message.includes('not found') || error.message.includes('bucket')) {
          setBucketExists(false);
        }
        setFiles([]);
        setFolders([]);
        setLoading(false);
        return;
      }

      const folderItems: string[] = [];
      const fileItems: MediaFile[] = [];

      (data || []).forEach((f) => {
        if (f.name === '.emptyFolderPlaceholder' || f.name === '.keep') return;
        if (f.id === null || (f.metadata === null && !f.created_at)) {
          folderItems.push(f.name);
        } else {
          const fullPath = currentPath ? `${currentPath}/${f.name}` : f.name;
          const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(fullPath);
          fileItems.push({
            id: f.id || f.name,
            name: f.name,
            url: urlData.publicUrl,
            size: f.metadata?.size || 0,
            type: f.metadata?.mimetype || f.name.split('.').pop() || 'unknown',
            created_at: f.created_at || new Date().toISOString(),
          });
        }
      });

      setFolders(folderItems);
      setFiles(fileItems);
      setSelectedFiles(new Set());
    } catch {
      setBucketExists(false);
      setFiles([]);
      setFolders([]);
    }
    setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPath]);

  useEffect(() => { fetchFiles(); }, [fetchFiles]);

  // Navigate into a folder
  const navigateToFolder = (folderName: string) => {
    setCurrentPath((prev) => prev ? `${prev}/${folderName}` : folderName);
    setSelectedFiles(new Set());
  };

  // Navigate via breadcrumb
  const navigateToBreadcrumb = (index: number) => {
    if (index < 0) {
      setCurrentPath('');
    } else {
      const segments = currentPath.split('/');
      setCurrentPath(segments.slice(0, index + 1).join('/'));
    }
    setSelectedFiles(new Set());
  };

  // Create a new folder
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    setCreatingFolder(true);
    try {
      const folderPath = currentPath
        ? `${currentPath}/${newFolderName.trim()}/.keep`
        : `${newFolderName.trim()}/.keep`;
      const { error } = await supabase.storage.from(BUCKET).upload(folderPath, new Blob([''], { type: 'text/plain' }), { upsert: true });
      if (error) throw error;
      setNewFolderName('');
      setShowNewFolderInput(false);
      setToast({ message: `Folder "${newFolderName.trim()}" created`, type: 'success' });
      await fetchFiles();
    } catch {
      setToast({ message: 'Failed to create folder', type: 'error' });
    }
    setCreatingFolder(false);
  };

  // Create default folder structure
  const handleCreateDefaultFolders = async () => {
    setCreatingDefaults(true);
    let count = 0;
    const allFolders = [
      ...PREDEFINED_FOLDERS.map(f => `${f}/.keep`),
      ...DEFAULT_NESTED_FOLDERS.map(f => `${f}/.keep`),
    ];
    for (const folder of allFolders) {
      try {
        const { error } = await supabase.storage.from(BUCKET).upload(folder, new Blob([''], { type: 'text/plain' }), { upsert: true });
        if (!error) count++;
      } catch { /* skip failures */ }
    }
    setToast({ message: `Created ${count} default folders`, type: 'success' });
    setCreatingDefaults(false);
    setCurrentPath('');
    await fetchFiles();
  };

  // Upload handler
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;
    setUploading(true);

    let successCount = 0;
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const ext = file.name.split('.').pop();
      const baseName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const fileName = currentPath ? `${currentPath}/${baseName}` : baseName;

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

  // Desktop drag-and-drop upload
  const handleDesktopDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDesktopDragOver(false);

    // If we are dragging an internal file, ignore (handled by folder drop)
    if (draggedFile) return;

    const droppedFiles = e.dataTransfer.files;
    if (!droppedFiles || droppedFiles.length === 0) return;
    setUploading(true);

    let successCount = 0;
    for (let i = 0; i < droppedFiles.length; i++) {
      const file = droppedFiles[i];
      const ext = file.name.split('.').pop();
      const baseName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const fileName = currentPath ? `${currentPath}/${baseName}` : baseName;

      const { error } = await supabase.storage.from(BUCKET).upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

      if (!error) successCount++;
    }

    if (successCount > 0) {
      setToast({ message: `${successCount} file(s) uploaded from desktop`, type: 'success' });
      await fetchFiles();
    } else {
      setToast({ message: 'Upload failed. Check storage configuration.', type: 'error' });
    }
    setUploading(false);
  };

  const handleDesktopDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedFile) {
      setDesktopDragOver(true);
    }
  };

  const handleDesktopDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set false if we actually leave the container
    const rect = dropZoneRef.current?.getBoundingClientRect();
    if (rect) {
      const { clientX, clientY } = e;
      if (clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom) {
        setDesktopDragOver(false);
      }
    }
  };

  // Move file to folder (Supabase: copy + delete)
  const moveFileToFolder = async (file: MediaFile, targetFolder: string) => {
    const sourcePath = currentPath ? `${currentPath}/${file.name}` : file.name;
    const destPath = currentPath
      ? `${currentPath}/${targetFolder}/${file.name}`
      : `${targetFolder}/${file.name}`;

    const { error } = await supabase.storage.from(BUCKET).move(sourcePath, destPath);
    return error;
  };

  // Handle drag start on file card
  const handleFileDragStart = (e: React.DragEvent, file: MediaFile) => {
    setDraggedFile(file);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', file.id);
    // Add selected files to drag if dragging a selected file
    if (selectedFiles.has(file.id) && selectedFiles.size > 1) {
      e.dataTransfer.setData('application/json', JSON.stringify(Array.from(selectedFiles)));
    }
  };

  const handleFileDragEnd = () => {
    setDraggedFile(null);
    setDragOverFolder(null);
  };

  // Handle folder drop target
  const handleFolderDragOver = (e: React.DragEvent, folderName: string) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    setDragOverFolder(folderName);
  };

  const handleFolderDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverFolder(null);
  };

  const handleFolderDrop = async (e: React.DragEvent, folderName: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverFolder(null);

    if (!draggedFile) return;

    setMovingFiles(true);

    // Determine which files to move
    let filesToMove: MediaFile[] = [];
    if (selectedFiles.has(draggedFile.id) && selectedFiles.size > 1) {
      filesToMove = files.filter(f => selectedFiles.has(f.id));
    } else {
      filesToMove = [draggedFile];
    }

    let successCount = 0;
    for (const file of filesToMove) {
      const error = await moveFileToFolder(file, folderName);
      if (!error) successCount++;
    }

    setDraggedFile(null);

    if (successCount > 0) {
      const plural = successCount > 1 ? 'files' : 'file';
      setToast({ message: `Moved ${successCount} ${plural} to ${folderName}`, type: 'success' });
      setSelectedFiles(new Set());
      await fetchFiles();
    } else {
      setToast({ message: 'Failed to move files', type: 'error' });
    }
    setMovingFiles(false);
  };

  // Delete single file
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const fullPath = currentPath ? `${currentPath}/${deleteTarget.name}` : deleteTarget.name;
    const { error } = await supabase.storage.from(BUCKET).remove([fullPath]);
    if (error) {
      setToast({ message: 'Failed to delete', type: 'error' });
    } else {
      setToast({ message: 'File deleted', type: 'success' });
      setFiles((p) => p.filter((f) => f.id !== deleteTarget.id));
      setSelectedFiles(prev => { const next = new Set(prev); next.delete(deleteTarget.id); return next; });
    }
    setDeleteTarget(null);
    setDeleting(false);
  };

  // Bulk delete
  const handleBulkDelete = async () => {
    if (selectedFiles.size === 0) return;
    setDeleting(true);
    const paths = files
      .filter(f => selectedFiles.has(f.id))
      .map(f => currentPath ? `${currentPath}/${f.name}` : f.name);

    const { error } = await supabase.storage.from(BUCKET).remove(paths);
    if (error) {
      setToast({ message: 'Failed to delete some files', type: 'error' });
    } else {
      setToast({ message: `${paths.length} file(s) deleted`, type: 'success' });
      setSelectedFiles(new Set());
      await fetchFiles();
    }
    setDeleting(false);
  };

  // Bulk move
  const handleBulkMove = async () => {
    if (selectedFiles.size === 0 || !bulkMoveTarget) return;
    setMovingFiles(true);

    const filesToMove = files.filter(f => selectedFiles.has(f.id));
    let successCount = 0;
    for (const file of filesToMove) {
      const error = await moveFileToFolder(file, bulkMoveTarget);
      if (!error) successCount++;
    }

    if (successCount > 0) {
      setToast({ message: `Moved ${successCount} file(s) to ${bulkMoveTarget}`, type: 'success' });
      setSelectedFiles(new Set());
      setShowBulkMove(false);
      setBulkMoveTarget('');
      await fetchFiles();
    } else {
      setToast({ message: 'Failed to move files', type: 'error' });
    }
    setMovingFiles(false);
  };

  // Selection helpers
  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles(prev => {
      const next = new Set(prev);
      if (next.has(fileId)) next.delete(fileId);
      else next.add(fileId);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedFiles.size === filtered.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(filtered.map(f => f.id)));
    }
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

  const allSelected = filtered.length > 0 && selectedFiles.size === filtered.length;
  const someSelected = selectedFiles.size > 0;

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
    <div
      ref={dropZoneRef}
      className={`space-y-6 relative min-h-[60vh] transition-all duration-200 ${desktopDragOver ? 'ring-2 ring-[#5DB347] ring-offset-4 rounded-2xl bg-green-50/30' : ''}`}
      onDragOver={handleDesktopDragOver}
      onDragLeave={handleDesktopDragLeave}
      onDrop={handleDesktopDrop}
    >
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Desktop drop overlay */}
      {desktopDragOver && !draggedFile && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-[#5DB347]/10 border-2 border-dashed border-[#5DB347] rounded-2xl pointer-events-none">
          <div className="text-center">
            <Upload className="w-12 h-12 text-[#5DB347] mx-auto mb-2" />
            <p className="text-lg font-semibold text-[#1B2A4A]">Drop files to upload</p>
            <p className="text-sm text-gray-500">Files will be added to the current folder</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">Media Library</h1>
          <p className="text-sm text-gray-500 mt-1">Drag files onto folders to organise them</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <input ref={fileInput} type="file" multiple accept="image/*,.pdf,.doc,.docx,.xls,.xlsx" onChange={handleUpload} className="hidden" />
          <input ref={cameraInput} type="file" accept="image/*" capture="environment" onChange={handleUpload} className="hidden" />
          <button onClick={() => setShowNewFolderInput(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white text-[#1B2A4A] text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-50 shadow-sm transition-all">
            <FolderPlus className="w-4 h-4" /> New Folder
          </button>
          <button onClick={() => cameraInput.current?.click()} disabled={uploading}
            className="flex items-center gap-2 px-4 py-2.5 bg-white text-[#1B2A4A] text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-50 shadow-sm transition-all disabled:opacity-50">
            <Camera className="w-4 h-4" /> Take Photo
          </button>
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
        <span className="text-xs text-gray-500">{folders.length > 0 ? `${folders.length} folders, ` : ''}{filtered.length} files</span>
      </div>

      {/* Bulk Actions Bar */}
      {someSelected && (
        <div className="flex items-center gap-3 bg-[#1B2A4A] text-white rounded-xl px-4 py-3 shadow-lg transition-all">
          <button onClick={toggleSelectAll} className="flex items-center gap-2 text-sm font-medium hover:text-green-300 transition-colors">
            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${allSelected ? 'bg-[#5DB347] border-[#5DB347]' : 'border-white/50'}`}>
              {allSelected && <Check className="w-3 h-3" />}
            </div>
            {allSelected ? 'Deselect All' : 'Select All'}
          </button>
          <span className="text-sm text-white/70">{selectedFiles.size} selected</span>
          <div className="flex-1" />
          {folders.length > 0 && (
            <button onClick={() => setShowBulkMove(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-all">
              <MoveRight className="w-4 h-4" /> Move to Folder
            </button>
          )}
          <button onClick={handleBulkDelete} disabled={deleting}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/80 hover:bg-red-500 text-white text-sm font-medium rounded-lg transition-all disabled:opacity-50">
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Delete
          </button>
          <button onClick={() => setSelectedFiles(new Set())} className="p-1.5 hover:bg-white/10 rounded-lg transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Bulk Move Modal */}
      {showBulkMove && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => { setShowBulkMove(false); setBulkMoveTarget(''); }}>
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-[#1B2A4A]">Move {selectedFiles.size} file(s) to folder</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {folders.map((folder) => (
                <button
                  key={folder}
                  onClick={() => setBulkMoveTarget(folder)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm font-medium transition-all ${bulkMoveTarget === folder ? 'bg-[#5DB347]/10 text-[#5DB347] ring-2 ring-[#5DB347]' : 'bg-gray-50 text-[#1B2A4A] hover:bg-gray-100'}`}
                >
                  <Folder className="w-5 h-5 shrink-0" />
                  {folder}
                </button>
              ))}
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => { setShowBulkMove(false); setBulkMoveTarget(''); }} className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleBulkMove} disabled={!bulkMoveTarget || movingFiles}
                className="flex items-center gap-2 px-4 py-2 bg-[#5DB347] text-white text-sm font-medium rounded-lg hover:bg-[#4a9a38] disabled:opacity-50">
                {movingFiles ? <Loader2 className="w-4 h-4 animate-spin" /> : <MoveRight className="w-4 h-4" />}
                Move
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-1 flex-wrap bg-white rounded-lg border border-gray-100 px-4 py-2.5">
        <button onClick={() => navigateToBreadcrumb(-1)} className={`flex items-center gap-1 text-sm font-medium transition-colors ${!currentPath ? 'text-[#1B2A4A]' : 'text-blue-600 hover:text-blue-800'}`}>
          <Home className="w-4 h-4" /> Root
        </button>
        {currentPath && currentPath.split('/').map((segment, idx) => (
          <span key={idx} className="flex items-center gap-1">
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <button
              onClick={() => navigateToBreadcrumb(idx)}
              className={`text-sm font-medium transition-colors ${idx === currentPath.split('/').length - 1 ? 'text-[#1B2A4A]' : 'text-blue-600 hover:text-blue-800'}`}
            >
              {segment}
            </button>
          </span>
        ))}
      </div>

      {/* New Folder Input */}
      {showNewFolderInput && (
        <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-100 px-4 py-3">
          <FolderPlus className="w-5 h-5 text-gray-400" />
          <input
            type="text" autoFocus placeholder="Folder name..."
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleCreateFolder(); if (e.key === 'Escape') { setShowNewFolderInput(false); setNewFolderName(''); } }}
            className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347]"
          />
          <button onClick={handleCreateFolder} disabled={creatingFolder || !newFolderName.trim()}
            className="px-3 py-1.5 bg-[#5DB347] text-white text-sm font-medium rounded-lg hover:bg-[#4a9a38] disabled:opacity-50">
            {creatingFolder ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create'}
          </button>
          <button onClick={() => { setShowNewFolderInput(false); setNewFolderName(''); }} className="p-1.5 rounded-lg hover:bg-gray-100">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      )}

      {/* Create Default Folders */}
      {!currentPath && folders.length === 0 && !loading && (
        <div className="flex items-center justify-between bg-blue-50 rounded-lg border border-blue-100 px-4 py-3">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-500" />
            <span className="text-sm text-blue-700">Set up folders: General, Profiles, Farms, Crops, Blog, Documents, Logos, Partners and sub-folders.</span>
          </div>
          <button onClick={handleCreateDefaultFolders} disabled={creatingDefaults}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 shrink-0">
            {creatingDefaults ? <Loader2 className="w-4 h-4 animate-spin" /> : <FolderPlus className="w-4 h-4" />}
            Create Default Folders
          </button>
        </div>
      )}

      {/* Moving indicator */}
      {movingFiles && (
        <div className="flex items-center gap-2 bg-amber-50 rounded-lg border border-amber-100 px-4 py-3">
          <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
          <span className="text-sm text-amber-700 font-medium">Moving files...</span>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#5DB347] mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading media...</p>
        </div>
      ) : filtered.length === 0 && folders.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-[#1B2A4A]">No files</h3>
          <p className="text-sm text-gray-500 mt-1">Upload files or drag them from your desktop to get started.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div>
          {/* Select All row for grid */}
          {filtered.length > 0 && (
            <div className="flex items-center gap-2 mb-3">
              <button onClick={toggleSelectAll} className="flex items-center gap-2 text-xs font-medium text-gray-500 hover:text-[#1B2A4A] transition-colors">
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${allSelected ? 'bg-[#5DB347] border-[#5DB347] text-white' : 'border-gray-300'}`}>
                  {allSelected && <Check className="w-3 h-3" />}
                </div>
                {allSelected ? 'Deselect all' : 'Select all'}
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {/* Folder cards */}
            {folders.map((folder) => {
              const isDropTarget = dragOverFolder === folder;
              return (
                <button
                  key={`folder-${folder}`}
                  onClick={() => navigateToFolder(folder)}
                  onDragOver={(e) => handleFolderDragOver(e, folder)}
                  onDragLeave={handleFolderDragLeave}
                  onDrop={(e) => handleFolderDrop(e, folder)}
                  className={`bg-white rounded-xl border-2 overflow-hidden group text-left transition-all duration-200 ${
                    isDropTarget
                      ? 'border-[#5DB347] shadow-lg shadow-[#5DB347]/20 scale-105 bg-green-50'
                      : 'border-gray-100 hover:shadow-md hover:border-gray-200'
                  }`}
                >
                  <div className={`aspect-square flex flex-col items-center justify-center gap-2 transition-all duration-200 ${
                    isDropTarget ? 'bg-[#5DB347]/10' : 'bg-amber-50'
                  }`}>
                    {isDropTarget ? (
                      <FolderOpen className="w-12 h-12 text-[#5DB347] transition-transform duration-200 scale-110" />
                    ) : (
                      <Folder className="w-12 h-12 text-amber-500 group-hover:text-amber-600 transition-colors" />
                    )}
                    {isDropTarget && (
                      <span className="text-xs font-medium text-[#5DB347]">Drop here</span>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-medium text-[#1B2A4A] truncate">{folder}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Folder</p>
                  </div>
                </button>
              );
            })}

            {/* File cards */}
            {filtered.map((f) => {
              const isSelected = selectedFiles.has(f.id);
              const isDragging = draggedFile?.id === f.id;
              return (
                <div
                  key={f.id}
                  draggable
                  onDragStart={(e) => handleFileDragStart(e, f)}
                  onDragEnd={handleFileDragEnd}
                  className={`bg-white rounded-xl border-2 overflow-hidden group transition-all duration-200 relative cursor-grab active:cursor-grabbing ${
                    isDragging
                      ? 'opacity-40 scale-95 border-[#5DB347]'
                      : isSelected
                        ? 'border-[#5DB347] shadow-md ring-1 ring-[#5DB347]/20'
                        : 'border-gray-100 hover:shadow-md hover:border-gray-200'
                  }`}
                >
                  {/* Selection checkbox */}
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleFileSelection(f.id); }}
                    className={`absolute top-2 left-2 z-10 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-[#5DB347] border-[#5DB347] text-white shadow-sm'
                        : 'border-white/80 bg-white/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 hover:border-[#5DB347]'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                  </button>

                  {/* Drag grip indicator */}
                  <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-60 transition-opacity">
                    <GripVertical className="w-4 h-4 text-gray-500" />
                  </div>

                  <div className="aspect-square bg-gray-50 flex items-center justify-center overflow-hidden relative">
                    {isImage(f.type) ? (
                      <Image src={f.url} alt={f.name} fill className="object-cover" draggable={false} unoptimized />
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
              );
            })}
          </div>
        </div>
      ) : (
        /* List view */
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="w-10 py-3 px-3">
                  <button onClick={toggleSelectAll} className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${allSelected ? 'bg-[#5DB347] border-[#5DB347] text-white' : 'border-gray-300'}`}>
                    {allSelected && <Check className="w-3 h-3" />}
                  </button>
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500">File</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500">Type</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500">Size</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500">Date</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {folders.map((folder) => {
                const isDropTarget = dragOverFolder === folder;
                return (
                  <tr
                    key={`folder-${folder}`}
                    className={`cursor-pointer transition-all duration-200 ${
                      isDropTarget
                        ? 'bg-[#5DB347]/10 ring-2 ring-inset ring-[#5DB347]'
                        : 'hover:bg-gray-50/50'
                    }`}
                    onClick={() => navigateToFolder(folder)}
                    onDragOver={(e) => handleFolderDragOver(e, folder)}
                    onDragLeave={handleFolderDragLeave}
                    onDrop={(e) => handleFolderDrop(e, folder)}
                  >
                    <td className="py-3 px-3"></td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 flex items-center justify-center">
                          {isDropTarget
                            ? <FolderOpen className="w-6 h-6 text-[#5DB347]" />
                            : <Folder className="w-6 h-6 text-amber-500" />
                          }
                        </div>
                        <span className="font-medium text-[#1B2A4A]">{folder}</span>
                        {isDropTarget && <span className="text-xs text-[#5DB347] font-medium">Drop here</span>}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-500">Folder</td>
                    <td className="py-3 px-4 text-gray-500">--</td>
                    <td className="py-3 px-4 text-gray-500">--</td>
                    <td className="py-3 px-4"></td>
                  </tr>
                );
              })}
              {filtered.map((f) => {
                const isSelected = selectedFiles.has(f.id);
                const isDragging = draggedFile?.id === f.id;
                return (
                  <tr
                    key={f.id}
                    draggable
                    onDragStart={(e) => handleFileDragStart(e, f)}
                    onDragEnd={handleFileDragEnd}
                    className={`transition-all duration-200 cursor-grab active:cursor-grabbing ${
                      isDragging ? 'opacity-40' : isSelected ? 'bg-[#5DB347]/5' : 'hover:bg-gray-50/50'
                    }`}
                  >
                    <td className="py-3 px-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleFileSelection(f.id); }}
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                          isSelected ? 'bg-[#5DB347] border-[#5DB347] text-white' : 'border-gray-300 hover:border-[#5DB347]'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {isImage(f.type) ? (
                          <Image src={f.url} alt="" width={32} height={32} className="w-8 h-8 rounded object-cover" draggable={false} unoptimized />
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
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Drag hint when there are files but no drag has happened */}
      {!loading && files.length > 0 && folders.length > 0 && !someSelected && (
        <p className="text-center text-xs text-gray-400 mt-2">
          Tip: Drag files onto folders to organise them, or select multiple files for bulk actions
        </p>
      )}

      {/* Delete Confirm Modal */}
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
