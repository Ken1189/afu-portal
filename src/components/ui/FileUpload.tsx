'use client';
import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, File, Image as ImageIcon, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface UploadedFile {
  id: string;
  file: File;
  preview?: string;
  progress: number;
  status: 'uploading' | 'complete' | 'error';
  url?: string;
  error?: string;
}

interface FileUploadProps {
  accept?: string;
  maxSize?: number;
  multiple?: boolean;
  onFilesChange?: (files: UploadedFile[]) => void;
  label?: string;
  description?: string;
  bucket?: string;
  folder?: string;
}

export function FileUpload({
  accept = '.pdf,.jpg,.jpeg,.png',
  maxSize = 10,
  multiple = true,
  onFilesChange,
  label = 'Upload Documents',
  description,
  bucket = 'documents',
  folder = 'uploads',
}: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadToStorage = useCallback(async (fileEntry: UploadedFile) => {
    const supabase = createClient();
    const ext = fileEntry.file.name.split('.').pop() || 'bin';
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, fileEntry.file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      throw new Error(error.message);
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
    return urlData.publicUrl;
  }, [bucket, folder]);

  const handleFiles = useCallback(async (newFiles: FileList | null) => {
    if (!newFiles) return;

    // Validate file sizes
    const incoming = Array.from(newFiles).map((file) => {
      const id = Math.random().toString(36).slice(2, 9);
      const preview = file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined;

      if (file.size > maxSize * 1024 * 1024) {
        return { id, file, preview, progress: 100, status: 'error' as const, error: `File exceeds ${maxSize}MB limit` };
      }

      return { id, file, preview, progress: 0, status: 'uploading' as const };
    });

    const updated = multiple ? [...files, ...incoming] : incoming;
    setFiles(updated);
    onFilesChange?.(updated);

    // Upload each file that passed validation
    for (const entry of incoming) {
      if (entry.status === 'error') continue;

      // Simulate initial progress
      setFiles((prev) => prev.map((f) => f.id === entry.id ? { ...f, progress: 30 } : f));

      try {
        const url = await uploadToStorage(entry);

        setFiles((prev) => {
          const next = prev.map((f) => f.id === entry.id ? { ...f, progress: 100, status: 'complete' as const, url } : f);
          onFilesChange?.(next);
          return next;
        });
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Upload failed';
        setFiles((prev) => {
          const next = prev.map((f) => f.id === entry.id ? { ...f, progress: 100, status: 'error' as const, error: errorMsg } : f);
          onFilesChange?.(next);
          return next;
        });
      }
    }
  }, [files, multiple, maxSize, onFilesChange, uploadToStorage]);

  const removeFile = (id: string) => {
    const updated = files.filter((f) => f.id !== id);
    setFiles(updated);
    onFilesChange?.(updated);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon className="w-5 h-5 text-blue-500" />;
    if (type === 'application/pdf') return <FileText className="w-5 h-5 text-red-500" />;
    return <File className="w-5 h-5 text-gray-500" />;
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-3">
      {label && <label className="block text-sm font-semibold text-navy">{label}</label>}
      <div
        onDragEnter={handleDrag} onDragOver={handleDrag} onDragLeave={handleDrag} onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${dragActive ? 'border-teal bg-teal-light/50 scale-[1.01]' : 'border-gray-300 hover:border-teal hover:bg-gray-50'}`}
      >
        <input ref={inputRef} type="file" accept={accept} multiple={multiple} className="hidden" onChange={(e) => handleFiles(e.target.files)} />
        <Upload className={`w-10 h-10 mx-auto mb-3 ${dragActive ? 'text-teal' : 'text-gray-400'}`} />
        <p className="text-sm font-medium text-navy">
          {dragActive ? 'Drop files here' : 'Drag & drop files here, or click to browse'}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {description || `Accepted: ${accept} • Max ${maxSize}MB per file`}
        </p>
      </div>

      <AnimatePresence>
        {files.map((f) => (
          <motion.div key={f.id} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg">
            {f.preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={f.preview} alt={`Preview of ${f.file.name}`} className="w-10 h-10 rounded object-cover" />
            ) : (
              <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center">{getFileIcon(f.file.type)}</div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-navy truncate">{f.file.name}</p>
              <p className="text-xs text-gray-500">{formatSize(f.file.size)}</p>
              {f.status === 'uploading' && (
                <div className="mt-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div className="h-full bg-teal rounded-full" initial={{ width: 0 }} animate={{ width: `${f.progress}%` }} />
                </div>
              )}
              {f.status === 'error' && (
                <p className="text-xs text-red-500 mt-0.5">{f.error || 'Upload failed'}</p>
              )}
            </div>
            {f.status === 'complete' && <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />}
            {f.status === 'error' && <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />}
            <button onClick={(e) => { e.stopPropagation(); removeFile(f.id); }} className="p-1 hover:bg-gray-100 rounded flex-shrink-0" aria-label="Remove file">
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
