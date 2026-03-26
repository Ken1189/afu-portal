/**
 * Partner API Authentication
 *
 * HMAC-SHA256 request signing for bank-to-AFU and AFU-to-bank
 * communication. Each partner gets a unique API key and secret.
 */

import { NextRequest } from 'next/server';

interface PartnerConfig {
  partner_id: string;
  name: string;
  api_key: string;
  api_secret: string;
  webhook_secret: string;
  ip_whitelist: string[];
  is_active: boolean;
}

// In production, these would come from a database table
// For now, configured via environment variables
function getPartnerConfigs(): PartnerConfig[] {
  const configs: PartnerConfig[] = [];

  // Primary bank partner
  if (process.env.PARTNER_API_KEY && process.env.PARTNER_API_SECRET) {
    configs.push({
      partner_id: 'bank_primary',
      name: process.env.PARTNER_NAME || 'Bank Partner',
      api_key: process.env.PARTNER_API_KEY,
      api_secret: process.env.PARTNER_API_SECRET,
      webhook_secret: process.env.PARTNER_WEBHOOK_SECRET || '',
      ip_whitelist: (process.env.PARTNER_IP_WHITELIST || '').split(',').filter(Boolean),
      is_active: true,
    });
  }

  return configs;
}

/**
 * Verify HMAC-SHA256 signature on incoming request
 */
async function verifySignature(
  payload: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  const computed = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return computed === signature;
}

/**
 * Generate HMAC-SHA256 signature for outgoing request
 */
export async function signRequest(
  payload: string,
  secret: string
): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Authenticate a partner API request.
 * Checks API key, HMAC signature, and IP whitelist.
 */
export async function authenticatePartner(
  req: NextRequest
): Promise<{ partner: PartnerConfig } | { error: string; status: number }> {
  const apiKey = req.headers.get('x-api-key');
  const signature = req.headers.get('x-signature');
  const timestamp = req.headers.get('x-timestamp');

  if (!apiKey) {
    return { error: 'Missing x-api-key header', status: 401 };
  }

  const configs = getPartnerConfigs();
  const partner = configs.find((c) => c.api_key === apiKey && c.is_active);

  if (!partner) {
    return { error: 'Invalid API key or partner is inactive', status: 401 };
  }

  // Check IP whitelist (if configured)
  if (partner.ip_whitelist.length > 0) {
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    if (!partner.ip_whitelist.includes(clientIp)) {
      return { error: 'IP address not whitelisted', status: 403 };
    }
  }

  // Verify HMAC signature (if provided)
  if (signature && timestamp) {
    // Check timestamp is within 5 minutes
    const ts = parseInt(timestamp);
    if (Math.abs(Date.now() - ts) > 5 * 60 * 1000) {
      return { error: 'Request timestamp expired', status: 401 };
    }

    // Verify signature: HMAC(timestamp + body)
    const body = await req.clone().text();
    const payload = `${timestamp}${body}`;
    const valid = await verifySignature(payload, signature, partner.api_secret);

    if (!valid) {
      return { error: 'Invalid signature', status: 401 };
    }
  }

  return { partner };
}

/**
 * Rate limiting for partner API (simple in-memory)
 * In production, use Redis or similar
 */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  partnerId: string,
  maxRequests = 100,
  windowMs = 60000
): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(partnerId);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(partnerId, { count: 1, resetAt: now + windowMs });
    return true;
  }

  entry.count++;
  return entry.count <= maxRequests;
}
