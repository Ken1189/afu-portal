'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { Upload, Camera, Image as ImageIcon, X, Loader2, FolderOpen, Check } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface ImageUploaderProps {
  /** Storage bucket name (e.g. 'media', 'avatars') */
  bucket?: string;
  /** Folder path within bucket (e.g. 'crops/userId') */
  folder?: string;
  /** Current image URL to display as preview */
  value?: string | null;
  /** Called with public URL after successful upload */
  onChange: (url: string) => void;
  /** Max file size in MB (default 5) */
  maxSizeMB?: number;
  /** Custom label */
  label?: string;
  /** Accept URL paste as alternative */
  allowUrl?: boolean;
  /** Round preview (for avatars) */
  round?: boolean;
  /** Compact mode for inline use */
  compact?: boolean;
}

export default function ImageUploader({
  bucket = 'media',
  folder = '',
  value,
  onChange,
  maxSizeMB = 5,
  label = 'Upload Image',
  allowUrl = true,
  round = false,
  compact = false,
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [showMediaBrowser, setShowMediaBrowser] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<{ name: string; url: string }[]>([]);
  const [mediaLoading, setMediaLoading] = useState(false);

  const fetchMedia = useCallback(async () => {
    setMediaLoading(true);
    try {
      const supabase = createClient();
      const folders = [folder || '', 'gallery', 'partners', 'crops', ''];
      const seen = new Set<string>();
      const files: { name: string; url: string }[] = [];

      for (const f of folders) {
        const { data } = await supabase.storage.from(bucket).list(f, { limit: 50, sortBy: { column: 'created_at', order: 'desc' } });
        if (data) {
          for (const file of data) {
            if (file.metadata && file.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
              const path = f ? `${f}/${file.name}` : file.name;
              if (!seen.has(path)) {
                seen.add(path);
                const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
                files.push({ name: file.name, url: publicUrl });
              }
            }
          }
        }
      }
      setMediaFiles(files);
    } catch {
      setMediaFiles([]);
    } finally {
      setMediaLoading(false);
    }
  }, [bucket, folder]);

  const handleFile = async (file: File) => {
    setError(null);
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`Image must be smaller than ${maxSizeMB}MB`);
      return;
    }

    setUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split('.').pop() || 'jpg';
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const path = folder ? `${folder}/${filename}` : filename;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(path, file, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
      onChange(publicUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      setUrlInput('');
      setShowUrlInput(false);
    }
  };

  const handleClear = () => {
    onChange('');
    setError(null);
  };

  const previewClass = round
    ? 'w-24 h-24 rounded-full object-cover'
    : 'w-full h-48 object-cover rounded-xl';

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileInput}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#5DB347] text-white rounded-lg hover:bg-[#449933] disabled:opacity-50"
        >
          {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          <Camera className="w-3.5 h-3.5" />
          Camera
        </button>
        {value && (
          <button type="button" onClick={handleClear} className="text-xs text-red-500 hover:text-red-700">
            Remove
          </button>
        )}
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {label && <label className="block text-sm font-medium text-[#1B2A4A]">{label}</label>}

      {/* Preview */}
      {value && (
        <div className="relative inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Preview" className={previewClass} />
          <button
            type="button"
            onClick={handleClear}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow-lg"
            aria-label="Remove image"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileInput}
        className="hidden"
      />

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-[#5DB347] text-white rounded-xl hover:bg-[#449933] disabled:opacity-50 transition-colors"
        >
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {uploading ? 'Uploading...' : 'Choose File'}
        </button>
        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          <Camera className="w-4 h-4" />
          Take Photo
        </button>
        <button
          type="button"
          onClick={() => { setShowMediaBrowser(true); fetchMedia(); }}
          disabled={uploading}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          <FolderOpen className="w-4 h-4" />
          Browse Media
        </button>
        {allowUrl && (
          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            disabled={uploading}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            <ImageIcon className="w-4 h-4" />
            Paste URL
          </button>
        )}
      </div>

      {/* URL input */}
      {showUrlInput && (
        <div className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/40"
          />
          <button
            type="button"
            onClick={handleUrlSubmit}
            className="px-4 py-2 bg-[#5DB347] text-white rounded-xl text-sm font-medium hover:bg-[#449933]"
          >
            Use
          </button>
        </div>
      )}

      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}

      <p className="text-xs text-gray-400">
        Max {maxSizeMB}MB. JPG, PNG, WebP supported. Camera works on mobile.
      </p>

      {/* Media Browser Modal */}
      {showMediaBrowser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="font-bold text-[#1B2A4A]">Browse Media Library</h3>
              <button onClick={() => setShowMediaBrowser(false)} className="p-1 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {mediaLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-[#5DB347]" />
                </div>
              ) : mediaFiles.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <FolderOpen className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">No images in media library yet</p>
                  <p className="text-xs mt-1">Upload an image first, then it will appear here</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {mediaFiles.map((file) => (
                    <button
                      key={file.url}
                      type="button"
                      onClick={() => { onChange(file.url); setShowMediaBrowser(false); }}
                      className={`relative aspect-square rounded-xl overflow-hidden border-2 hover:border-[#5DB347] transition-colors group ${
                        value === file.url ? 'border-[#5DB347] ring-2 ring-[#5DB347]/30' : 'border-gray-200'
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                      {value === file.url && (
                        <div className="absolute top-1 right-1 w-5 h-5 bg-[#5DB347] rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-[10px] text-white truncate">{file.name}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
