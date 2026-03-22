import { describe, it, expect } from 'vitest';

/**
 * Tests for newsletter API route validation logic.
 * We extract and test the pure validation rules without hitting Supabase.
 */

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateNewsletterInput(body: unknown): { valid: boolean; error?: string } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Email is required' };
  }

  const { email } = body as { email?: unknown };

  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email is required' };
  }

  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Invalid email format' };
  }

  return { valid: true };
}

describe('Newsletter API validation', () => {
  it('rejects missing email', () => {
    const result = validateNewsletterInput({});
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Email is required');
  });

  it('rejects null body', () => {
    const result = validateNewsletterInput(null);
    expect(result.valid).toBe(false);
  });

  it('rejects non-string email', () => {
    const result = validateNewsletterInput({ email: 123 });
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Email is required');
  });

  it('rejects empty string email', () => {
    const result = validateNewsletterInput({ email: '' });
    expect(result.valid).toBe(false);
  });

  it('rejects invalid email format — no @', () => {
    const result = validateNewsletterInput({ email: 'notanemail' });
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Invalid email format');
  });

  it('rejects invalid email format — no domain', () => {
    const result = validateNewsletterInput({ email: 'user@' });
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Invalid email format');
  });

  it('rejects email with spaces', () => {
    const result = validateNewsletterInput({ email: 'user @test.com' });
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Invalid email format');
  });

  it('accepts valid email', () => {
    const result = validateNewsletterInput({ email: 'farmer@afu.africa' });
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('accepts email with subdomains', () => {
    const result = validateNewsletterInput({ email: 'test@mail.example.co.zw' });
    expect(result.valid).toBe(true);
  });

  it('accepts email with plus addressing', () => {
    const result = validateNewsletterInput({ email: 'user+tag@gmail.com' });
    expect(result.valid).toBe(true);
  });
});
