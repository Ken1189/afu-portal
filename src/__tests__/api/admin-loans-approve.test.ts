import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// ---------------------------------------------------------------------------
// Mocks — must be defined before importing the route
// ---------------------------------------------------------------------------

const mockGetUser = vi.fn();
const mockFrom = vi.fn();
const mockSvcFrom = vi.fn();

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({
    getAll: vi.fn().mockReturnValue([]),
  }),
}));

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: { getUser: mockGetUser },
  })),
}));

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: mockSvcFrom,
  })),
}));

vi.mock('@/lib/notifications/engine', () => ({
  sendNotification: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/lib/notifications/templates', () => ({
  loanApprovedTemplate: vi.fn().mockReturnValue({
    title: 'Loan Approved',
    body: 'Your loan has been approved.',
  }),
}));

// ---------------------------------------------------------------------------
// Import the handler under test
// ---------------------------------------------------------------------------

import { POST } from '@/app/api/admin/loans/approve/route';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeRequest(body: Record<string, unknown>) {
  return new NextRequest('http://localhost/api/admin/loans/approve', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

const VALID_UUID = 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d';

/** Set up mocks so that auth succeeds and profile has the given role. */
function setupAuth(role: string) {
  mockGetUser.mockResolvedValue({
    data: { user: { id: VALID_UUID } },
    error: null,
  });

  // svc.from('profiles').select().eq().single()
  mockSvcFrom.mockImplementation((table: string) => {
    if (table === 'profiles') {
      return {
        select: () => ({
          eq: () => ({
            single: () =>
              Promise.resolve({ data: { role }, error: null }),
          }),
        }),
      };
    }
    if (table === 'loans') {
      return {
        update: () => ({
          eq: () => ({
            select: () => ({
              single: () =>
                Promise.resolve({
                  data: {
                    id: VALID_UUID,
                    status: 'approved',
                    member_id: VALID_UUID,
                    amount: 1000,
                    loan_number: 'LN-001',
                  },
                  error: null,
                }),
            }),
          }),
        }),
      };
    }
    if (table === 'audit_log') {
      return { insert: () => Promise.resolve({ error: null }) };
    }
    return {};
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('POST /api/admin/loans/approve', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('approves a loan successfully', async () => {
    setupAuth('admin');

    const res = await POST(
      makeRequest({ loanId: VALID_UUID, action: 'approve' }),
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.loan).toBeDefined();
  });

  it('rejects a loan successfully', async () => {
    setupAuth('admin');

    const res = await POST(
      makeRequest({ loanId: VALID_UUID, action: 'reject', notes: 'Incomplete docs' }),
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
  });

  it('returns 400 when loanId is missing', async () => {
    setupAuth('admin');

    const res = await POST(makeRequest({ action: 'approve' }));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toBeDefined();
  });

  it('returns 401 when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Not authenticated' },
    });

    const res = await POST(
      makeRequest({ loanId: VALID_UUID, action: 'approve' }),
    );
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json.error).toBe('Not authenticated');
  });

  it('returns 403 when user is not an admin', async () => {
    setupAuth('member');

    const res = await POST(
      makeRequest({ loanId: VALID_UUID, action: 'approve' }),
    );
    const json = await res.json();

    expect(res.status).toBe(403);
    expect(json.error).toBe('Forbidden');
  });
});
