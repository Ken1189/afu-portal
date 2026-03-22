import { describe, it, expect } from 'vitest';
import { z } from 'zod';

/**
 * Tests for the payments/checkout API route validation logic.
 * We replicate the Zod schema from the route and test it in isolation.
 */

const checkoutSchema = z.object({
  type: z.enum(['membership', 'sponsorship']),
  tier: z.string().min(1, 'Tier is required'),
  farmerId: z.string().optional(),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
});

describe('Checkout schema validation', () => {
  it('accepts valid membership checkout', () => {
    const result = checkoutSchema.safeParse({
      type: 'membership',
      tier: 'growth',
    });
    expect(result.success).toBe(true);
  });

  it('accepts valid sponsorship checkout', () => {
    const result = checkoutSchema.safeParse({
      type: 'sponsorship',
      tier: 'gold',
    });
    expect(result.success).toBe(true);
  });

  it('accepts checkout with all optional fields', () => {
    const result = checkoutSchema.safeParse({
      type: 'membership',
      tier: 'pioneer',
      farmerId: 'farmer-123',
      successUrl: 'https://afu.africa/success',
      cancelUrl: 'https://afu.africa/cancel',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.farmerId).toBe('farmer-123');
    }
  });

  it('rejects missing type', () => {
    const result = checkoutSchema.safeParse({ tier: 'growth' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid type', () => {
    const result = checkoutSchema.safeParse({
      type: 'donation',
      tier: 'growth',
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing tier', () => {
    const result = checkoutSchema.safeParse({ type: 'membership' });
    expect(result.success).toBe(false);
  });

  it('rejects empty tier string', () => {
    const result = checkoutSchema.safeParse({
      type: 'membership',
      tier: '',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid successUrl', () => {
    const result = checkoutSchema.safeParse({
      type: 'membership',
      tier: 'growth',
      successUrl: 'not-a-url',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid cancelUrl', () => {
    const result = checkoutSchema.safeParse({
      type: 'membership',
      tier: 'growth',
      cancelUrl: 'not-a-valid-url',
    });
    expect(result.success).toBe(false);
  });

  it('provides readable error messages', () => {
    const result = checkoutSchema.safeParse({
      type: 'membership',
      tier: '',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages).toContain('Tier is required');
    }
  });

  it('allows farmerId to be omitted', () => {
    const result = checkoutSchema.safeParse({
      type: 'sponsorship',
      tier: 'platinum',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.farmerId).toBeUndefined();
    }
  });
});
