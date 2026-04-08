import { NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

/**
 * Distributed rate limiter.
 *
 * Uses Upstash Redis when UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN
 * are set in env. Falls back to per-instance in-memory map otherwise (dev only —
 * NOT effective on Vercel because each Lambda gets its own instance).
 */

interface RateLimitConfig {
  /** Max requests per window */
  limit: number;
  /** Window size in seconds */
  windowSeconds: number;
}

const TIERS: Record<string, RateLimitConfig> = {
  auth: { limit: 30, windowSeconds: 60 },
  write: { limit: 30, windowSeconds: 60 },
  read: { limit: 120, windowSeconds: 60 },
  public: { limit: 60, windowSeconds: 60 },
};

// ─── Upstash mode ─────────────────────────────────────────────────────────
const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;
const upstashEnabled = Boolean(upstashUrl && upstashToken);

let limiters: Record<string, Ratelimit> | null = null;

if (upstashEnabled) {
  const redis = new Redis({ url: upstashUrl!, token: upstashToken! });
  limiters = {
    auth: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(TIERS.auth.limit, `${TIERS.auth.windowSeconds} s`),
      analytics: true,
      prefix: 'afu:rl:auth',
    }),
    write: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(TIERS.write.limit, `${TIERS.write.windowSeconds} s`),
      analytics: true,
      prefix: 'afu:rl:write',
    }),
    read: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(TIERS.read.limit, `${TIERS.read.windowSeconds} s`),
      analytics: true,
      prefix: 'afu:rl:read',
    }),
    public: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(TIERS.public.limit, `${TIERS.public.windowSeconds} s`),
      analytics: true,
      prefix: 'afu:rl:public',
    }),
  };
} else if (process.env.NODE_ENV === 'production') {
  console.warn(
    '[rateLimit] UPSTASH_REDIS_REST_URL/TOKEN not set — falling back to in-memory limiter. ' +
      'This is INEFFECTIVE on Vercel multi-instance deployments.'
  );
}

// ─── In-memory fallback (dev only) ────────────────────────────────────────
interface RateLimitEntry {
  count: number;
  resetAt: number;
}
const memStore = new Map<string, RateLimitEntry>();

if (typeof setInterval !== 'undefined' && !upstashEnabled) {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of memStore) {
      if (now > entry.resetAt) memStore.delete(key);
    }
  }, 60_000);
}

// ─── Helpers ──────────────────────────────────────────────────────────────
function getIdentifier(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || 'unknown';
  return ip;
}

function getTierName(pathname: string, method: string): keyof typeof TIERS {
  if (pathname.startsWith('/api/auth')) return 'auth';
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) return 'write';
  if (pathname.startsWith('/api/')) return 'read';
  return 'public';
}

function tooManyResponse(limit: number, resetAt: number): NextResponse {
  const retryAfter = Math.max(1, Math.ceil((resetAt - Date.now()) / 1000));
  return NextResponse.json(
    { error: 'Too many requests. Please try again later.' },
    {
      status: 429,
      headers: {
        'Retry-After': String(retryAfter),
        'X-RateLimit-Limit': String(limit),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': String(Math.ceil(resetAt / 1000)),
      },
    }
  );
}

/**
 * Rate limit gate. Returns a 429 NextResponse if blocked, else null.
 *
 * Note: when Upstash is enabled this becomes async-friendly via the
 * `rateLimitAsync` export. The sync `rateLimit` export only does in-memory
 * checks for backwards compatibility with existing call sites.
 */
export function rateLimit(request: Request): NextResponse | null {
  // If Upstash is configured, defer to rateLimitAsync — sync path becomes a noop.
  // Existing sync callers should migrate to rateLimitAsync for production safety.
  if (upstashEnabled) return null;

  const url = new URL(request.url);
  const tierName = getTierName(url.pathname, request.method);
  const tier = TIERS[tierName];
  const id = getIdentifier(request);
  const key = `${id}:${url.pathname}:${request.method}`;
  const now = Date.now();

  const entry = memStore.get(key);
  if (!entry || now > entry.resetAt) {
    memStore.set(key, { count: 1, resetAt: now + tier.windowSeconds * 1000 });
    return null;
  }
  entry.count++;
  if (entry.count > tier.limit) {
    return tooManyResponse(tier.limit, entry.resetAt);
  }
  return null;
}

/**
 * Async rate limit gate (recommended). Uses distributed Upstash Redis when
 * configured, falls back to in-memory otherwise.
 */
export async function rateLimitAsync(request: Request): Promise<NextResponse | null> {
  const url = new URL(request.url);
  const tierName = getTierName(url.pathname, request.method);
  const tier = TIERS[tierName];
  const id = getIdentifier(request);

  if (upstashEnabled && limiters) {
    const key = `${id}:${url.pathname}:${request.method}`;
    const result = await limiters[tierName].limit(key);
    if (!result.success) {
      return tooManyResponse(tier.limit, result.reset);
    }
    return null;
  }

  // Fallback to sync in-memory path
  return rateLimit(request);
}
