'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react';
import { uploadImage } from '@/lib/storage/upload';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ImageUploadProps {
  bucket: string;
  path: string;
  onUpload: (url: string) => void;
  currentUrl?: string;
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ImageUpload({
  bucket,
  path,
  onUpload,
  currentUrl,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // -----------------------------------------------------------------------
  // Validation
  // -----------------------------------------------------------------------

  const validate = useCallback((file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return 'Only JPG, PNG, and WebP images are allowed.';
    }
    if (file.size > MAX_SIZE_BYTES) {
      return 'File size must be 5 MB or less.';
    }
    return null;
  }, []);

  // -----------------------------------------------------------------------
  // Upload handler
  // -----------------------------------------------------------------------

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);

      const validationError = validate(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      // Show local preview immediately
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);

      // Simulate progress (Supabase JS client doesn't expose upload progress)
      setUploading(true);
      setProgress(0);

      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 20 + 5;
        });
      }, 200);

      try {
        // Build a unique-ish file path to avoid collisions
        const ext = file.name.split('.').pop() ?? 'jpg';
        const timestamp = Date.now();
        const fullPath = `${path}/${timestamp}.${ext}`;

        const publicUrl = await uploadImage(file, bucket, fullPath);

        clearInterval(progressInterval);
        setProgress(100);
        setPreview(publicUrl);
        onUpload(publicUrl);
      } catch (err) {
        clearInterval(progressInterval);
        setError(err instanceof Error ? err.message : 'Upload failed');
        setPreview(currentUrl ?? null);
      } finally {
        setUploading(false);
      }
    },
    [bucket, path, onUpload, currentUrl, validate],
  );

  // -----------------------------------------------------------------------
  // Event handlers
  // -----------------------------------------------------------------------

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // Reset input so re-selecting the same file triggers onChange
    e.target.value = '';
  };

  const clearPreview = () => {
    setPreview(null);
    setError(null);
    setProgress(0);
  };

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  return (
    <div className="space-y-2">
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={[
          'relative overflow-hidden border-2 border-dashed rounded-xl',
          'cursor-pointer transition-all duration-200',
          'flex flex-col items-center justify-center',
          preview ? 'p-2' : 'p-8',
          dragActive
            ? 'border-teal bg-teal-light/30 scale-[1.01]'
            : 'border-gray-300 hover:border-teal hover:bg-gray-50',
        ].join(' ')}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          className="hidden"
          onChange={handleInputChange}
        />

        <AnimatePresence mode="wait">
          {preview ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative w-full"
            >
              <img
                src={preview}
                alt="Upload preview"
                className="w-full h-48 object-cover rounded-lg"
              />
              {/* Remove button */}
              {!uploading && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearPreview();
                  }}
                  className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors"
                  aria-label="Remove image"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              )}
              {/* Upload complete badge */}
              {!uploading && progress === 100 && (
                <div className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-1 bg-green-500/90 text-white text-xs font-medium rounded-full backdrop-blur-sm">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Uploaded
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <Upload
                className={`w-10 h-10 mx-auto mb-3 transition-colors ${
                  dragActive ? 'text-teal' : 'text-gray-400'
                }`}
              />
              <p className="text-sm font-medium text-navy">
                {dragActive
                  ? 'Drop your image here'
                  : 'Drag & drop an image, or click to browse'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                JPG, PNG, or WebP &middot; Max 5 MB
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress bar */}
        {uploading && (
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gray-200">
            <motion.div
              className="h-full bg-teal rounded-r-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ ease: 'easeOut' }}
            />
          </div>
        )}
      </div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="flex items-center gap-1.5 text-sm text-red-600"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
