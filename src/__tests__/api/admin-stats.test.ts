import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockFrom = vi.fn();

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: mockFrom,
  })),
}));

// ---------------------------------------------------------------------------
// Import
// ---------------------------------------------------------------------------

import { GET } from '@/app/api/admin/stats/route';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a mock chain: from(table).select(…, { count }) → { data, count } */
function selectChain(data: unknown[]) {
  return {
    select: () => ({
      order: () => ({
        limit: () => Promise.resolve({ data, error: null, count: data.length }),
      }),
      // When there's no .order() after select, resolve directly
      ...Promise.resolve({ data, error: null, count: data.length }),
      then: (fn: (v: unknown) => unknown) =>
        Promise.resolve({ data, error: null, count: data.length }).then(fn),
    }),
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('GET /api/admin/stats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'svc-key';

    mockFrom.mockImplementation((table: string) => {
      const tableData: Record<string, unknown[]> = {
        members: [
          { id: '1', status: 'active', tier: 'smallholder', created_at: '2025-01-01' },
          { id: '2', status: 'pending', tier: 'commercial', created_at: '2025-02-01' },
        ],
        suppliers: [
          { id: '1', status: 'active', total_sales: 5000, total_orders: 10, created_at: '2025-01-01' },
        ],
        orders: [
          { id: '1', total: 200, status: 'delivered', created_at: '2025-01-01' },
          { id: '2', total: 150, status: 'pending', created_at: '2025-02-01' },
        ],
        payments: [
          { id: '1', amount: 200, status: 'completed', created_at: '2025-01-01' },
        ],
        membership_applications: [
          { id: '1', status: 'pending', created_at: '2025-01-01' },
        ],
        loans: [
          { id: '1', amount: 10000, status: 'approved', created_at: '2025-01-01' },
        ],
        products: [
          { id: '1', in_stock: true },
          { id: '2', in_stock: false },
        ],
        audit_log: [
          { id: '1', action: 'loan_approve', entity_type: 'loan', details: {}, created_at: '2025-01-01' },
        ],
      };

      const data = tableData[table] || [];
      return selectChain(data);
    });
  });

  it('returns aggregated stats from all tables', async () => {
    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(200);

    // Members
    expect(json.members.total).toBe(2);
    expect(json.members.active).toBe(1);
    expect(json.members.pending).toBe(1);

    // Suppliers
    expect(json.suppliers.total).toBe(1);
    expect(json.suppliers.totalSales).toBe(5000);

    // Orders
    expect(json.orders.total).toBe(2);
    expect(json.orders.revenue).toBe(350);
    expect(json.orders.completed).toBe(1);

    // Payments
    expect(json.payments.collected).toBe(200);

    // Applications
    expect(json.applications.pending).toBe(1);

    // Loans
    expect(json.loans.totalAmount).toBe(10000);

    // Products
    expect(json.products.total).toBe(2);
    expect(json.products.inStock).toBe(1);

    // Recent activity
    expect(json.recentActivity).toHaveLength(1);
  });

  it('returns 500 on unexpected error', async () => {
    mockFrom.mockImplementation(() => {
      throw new Error('DB connection failed');
    });

    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json.error).toBe('Failed to fetch stats');
  });
});
