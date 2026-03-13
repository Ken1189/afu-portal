'use client';
import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, File, Image as ImageIcon, FileText, CheckCircle } from 'lucide-react';

interface UploadedFile {
  id: string;
  file: File;
  preview?: string;
  progress: number;
  status: 'uploading' | 'complete' | 'error';
}

interface FileUploadProps {
  accept?: string;
  maxSize?: number;
  multiple?: boolean;
  onFilesChange?: (files: UploadedFile[]) => void;
  label?: string;
  description?: string;
}

export function FileUpload({ accept = '.pdf,.jpg,.jpeg,.png', maxSize = 10, multiple = true, onFilesChange, label = 'Upload Documents', description }: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback((newFiles: FileList | null) => {
    if (!newFiles) return;
    const incoming = Array.from(newFiles).map((file) => {
      const id = Math.random().toString(36).slice(2, 9);
      const preview = file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined;
      return { id, file, preview, progress: 0, status: 'uploading' as const };
    });
    const updated = multiple ? [...files, ...incoming] : incoming;
    setFiles(updated);
    // Simulate upload progress
    incoming.forEach((f) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30 + 10;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          setFiles((prev) => prev.map((pf) => pf.id === f.id ? { ...pf, progress: 100, status: 'complete' } : pf));
        } else {
          setFiles((prev) => prev.map((pf) => pf.id === f.id ? { ...pf, progress } : pf));
        }
      }, 300);
    });
    onFilesChange?.(updated);
  }, [files, multiple, onFilesChange]);

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
              <img src={f.preview} alt="" className="w-10 h-10 rounded object-cover" />
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
            </div>
            {f.status === 'complete' && <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />}
            <button onClick={(e) => { e.stopPropagation(); removeFile(f.id); }} className="p-1 hover:bg-gray-100 rounded flex-shrink-0" aria-label="Remove file">
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
