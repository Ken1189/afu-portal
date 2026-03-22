import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockCheckoutCreate = vi.fn();

vi.mock('@/lib/stripe', () => ({
  getStripe: () => ({
    checkout: {
      sessions: {
        create: mockCheckoutCreate,
      },
    },
  }),
  MEMBERSHIP_PRICES: {
    smallholder: { amount: 500, currency: 'usd', name: 'Smallholder Membership', interval: 'month' },
  },
  SPONSOR_PRICES: {
    bronze: { amount: 500, currency: 'usd', name: 'Bronze Sponsorship', interval: 'month' },
  },
}));

// ---------------------------------------------------------------------------
// Import handler under test
// ---------------------------------------------------------------------------

import { POST } from '@/app/api/payments/checkout/route';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeRequest(body: Record<string, unknown>) {
  return new NextRequest('http://localhost/api/payments/checkout', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('POST /api/payments/checkout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.STRIPE_SECRET_KEY = 'sk_test_fake';
  });

  it('creates a checkout session for a valid membership tier', async () => {
    mockCheckoutCreate.mockResolvedValue({ url: 'https://checkout.stripe.com/session123' });

    const res = await POST(
      makeRequest({ type: 'membership', tier: 'smallholder' }),
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.url).toBe('https://checkout.stripe.com/session123');
    expect(mockCheckoutCreate).toHaveBeenCalledOnce();
  });

  it('returns 400 when tier is missing', async () => {
    const res = await POST(makeRequest({ type: 'membership' }));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toBeDefined();
  });

  it('returns 400 when type is missing', async () => {
    const res = await POST(makeRequest({ tier: 'smallholder' }));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toBeDefined();
  });

  it('returns 400 for an invalid tier', async () => {
    const res = await POST(
      makeRequest({ type: 'membership', tier: 'nonexistent' }),
    );
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toContain('Invalid tier');
  });

  it('returns 503 when STRIPE_SECRET_KEY is not set', async () => {
    delete process.env.STRIPE_SECRET_KEY;

    const res = await POST(
      makeRequest({ type: 'membership', tier: 'smallholder' }),
    );
    const json = await res.json();

    expect(res.status).toBe(503);
    expect(json.error).toContain('not configured');
  });
});
