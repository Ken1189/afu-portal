import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockSendTemplatedEmail = vi.fn();

vi.mock('@/lib/email', () => ({
  sendTemplatedEmail: (...args: unknown[]) => mockSendTemplatedEmail(...args),
}));

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null,
      }),
    },
    from: vi.fn(() => ({
      select: () => ({
        eq: () => ({
          single: () =>
            Promise.resolve({ data: { role: 'admin' }, error: null }),
        }),
      }),
    })),
  })),
}));

// ---------------------------------------------------------------------------
// Import
// ---------------------------------------------------------------------------

import { POST } from '@/app/api/email/send/route';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeRequest(
  body: Record<string, unknown>,
  headers: Record<string, string> = {},
) {
  return new NextRequest('http://localhost/api/email/send', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('POST /api/email/send', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'svc-key';
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
  });

  it('sends an email when authenticated with service role key', async () => {
    mockSendTemplatedEmail.mockResolvedValue({ success: true });

    const res = await POST(
      makeRequest(
        {
          to: 'user@example.com',
          templateKey: 'welcome',
          variables: { name: 'Alice' },
        },
        { Authorization: 'Bearer svc-key' },
      ),
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(mockSendTemplatedEmail).toHaveBeenCalledOnce();
  });

  it('returns 400 when recipient email is missing', async () => {
    const res = await POST(
      makeRequest(
        { templateKey: 'welcome' },
        { Authorization: 'Bearer svc-key' },
      ),
    );
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toBe('Validation failed');
  });

  it('returns 400 when templateKey is missing', async () => {
    const res = await POST(
      makeRequest(
        { to: 'user@example.com' },
        { Authorization: 'Bearer svc-key' },
      ),
    );
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toBe('Validation failed');
  });

  it('returns 401 when no authorization header is provided', async () => {
    const res = await POST(
      makeRequest({ to: 'user@example.com', templateKey: 'welcome' }),
    );
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json.error).toContain('Unauthorized');
  });
});
