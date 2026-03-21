import { createClient } from '@/lib/supabase/client';

// ---------------------------------------------------------------------------
// uploadImage
//
// Uploads a file to the given Supabase Storage bucket and returns its public
// URL. Uses `upsert: true` so re-uploads to the same path replace the file.
// ---------------------------------------------------------------------------

export async function uploadImage(
  file: File,
  bucket: string,
  path: string,
): Promise<string> {
  const supabase = createClient();

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(data.path);

  return publicUrl;
}

// ---------------------------------------------------------------------------
// deleteImage
//
// Removes a file from a Supabase Storage bucket.
// ---------------------------------------------------------------------------

export async function deleteImage(
  bucket: string,
  path: string,
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.storage.from(bucket).remove([path]);

  if (error) {
    throw new Error(`Delete failed: ${error.message}`);
  }
}
