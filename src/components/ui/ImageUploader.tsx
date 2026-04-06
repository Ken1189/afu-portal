'use client';

import { useRef, useState } from 'react';
import { Upload, Camera, Image as ImageIcon, X, Loader2 } from 'lucide-react';
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
    </div>
  );
}
