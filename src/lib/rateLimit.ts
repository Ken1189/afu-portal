import { NextResponse } from 'next/server';

/**
 * Simple in-memory rate limiter.
 * Suitable for single-instance Vercel deployments.
 * Swap for @upstash/ratelimit + @upstash/redis for distributed rate limiting.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries every 60 seconds
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (now > entry.resetAt) store.delete(key);
    }
  }, 60_000);
}

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

function getIdentifier(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || 'unknown';
  return ip;
}

function getTier(pathname: string, method: string): RateLimitConfig {
  if (pathname.startsWith('/api/auth')) return TIERS.auth;
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) return TIERS.write;
  if (pathname.startsWith('/api/')) return TIERS.read;
  return TIERS.public;
}

export function rateLimit(request: Request): NextResponse | null {
  const url = new URL(request.url);
  const tier = getTier(url.pathname, request.method);
  const id = getIdentifier(request);
  const key = `${id}:${url.pathname}:${request.method}`;
  const now = Date.now();

  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + tier.windowSeconds * 1000 });
    return null;
  }

  entry.count++;

  if (entry.count > tier.limit) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(retryAfter),
          'X-RateLimit-Limit': String(tier.limit),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(entry.resetAt / 1000)),
        },
      }
    );
  }

  return null;
}
