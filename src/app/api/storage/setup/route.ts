import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// ---------------------------------------------------------------------------
// Bucket definitions
// ---------------------------------------------------------------------------

interface BucketConfig {
  id: string;
  public: boolean;
  /** Allowed MIME types — null means all types allowed. */
  allowedMimeTypes: string[] | null;
  /** Max upload size in bytes. */
  fileSizeLimit: number;
}

const BUCKETS: BucketConfig[] = [
  {
    id: 'avatars',
    public: true,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    fileSizeLimit: 5 * 1024 * 1024, // 5 MB
  },
  {
    id: 'farm-photos',
    public: true,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    fileSizeLimit: 10 * 1024 * 1024, // 10 MB
  },
  {
    id: 'logos',
    public: true,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
    fileSizeLimit: 2 * 1024 * 1024, // 2 MB
  },
  {
    id: 'documents',
    public: false,
    allowedMimeTypes: null, // PDFs, spreadsheets, etc.
    fileSizeLimit: 25 * 1024 * 1024, // 25 MB
  },
];

// ---------------------------------------------------------------------------
// Auth helper
// ---------------------------------------------------------------------------

function isServiceRole(req: NextRequest): boolean {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return false;
  return auth.slice(7) === process.env.SUPABASE_SERVICE_ROLE_KEY;
}

async function isAdminUser(req: NextRequest): Promise<boolean> {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return false;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(auth.slice(7));
  if (error || !user) return false;

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  return profile?.role === 'admin';
}

// ---------------------------------------------------------------------------
// POST /api/storage/setup
//
// Creates all required storage buckets if they don't already exist.
// Admin or service-role auth required.
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  try {
    const isService = isServiceRole(req);
    const isAdmin = !isService ? await isAdminUser(req) : false;

    if (!isService && !isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized — admin or service role required' },
        { status: 401 },
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    const results: Array<{ bucket: string; status: 'created' | 'exists' | 'error'; message?: string }> = [];

    // Fetch existing buckets once
    const { data: existingBuckets } = await supabase.storage.listBuckets();
    const existingIds = new Set((existingBuckets ?? []).map((b) => b.id));

    for (const bucket of BUCKETS) {
      if (existingIds.has(bucket.id)) {
        // Update settings on existing bucket
        const { error: updateError } = await supabase.storage.updateBucket(
          bucket.id,
          {
            public: bucket.public,
            allowedMimeTypes: bucket.allowedMimeTypes ?? undefined,
            fileSizeLimit: bucket.fileSizeLimit,
          },
        );

        results.push({
          bucket: bucket.id,
          status: updateError ? 'error' : 'exists',
          message: updateError?.message ?? 'Already exists — settings updated',
        });
        continue;
      }

      const { error: createError } = await supabase.storage.createBucket(
        bucket.id,
        {
          public: bucket.public,
          allowedMimeTypes: bucket.allowedMimeTypes ?? undefined,
          fileSizeLimit: bucket.fileSizeLimit,
        },
      );

      results.push({
        bucket: bucket.id,
        status: createError ? 'error' : 'created',
        message: createError?.message,
      });
    }

    return NextResponse.json({ buckets: results });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Unknown error during storage setup';
    console.error('[POST /api/storage/setup]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
