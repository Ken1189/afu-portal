import { NextResponse } from 'next/server';

// Web Vitals receiver — accepts POSTs from WebVitals.tsx via sendBeacon.
// Logged-only for now; can be wired to a proper analytics sink later.

export async function POST(request: Request) {
  try {
    const body = await request.text();
    // Optional: console.debug('[web-vitals]', body);
    // Future: forward to Sentry / Plausible / custom analytics_events table
    void body;
  } catch (err) {
    console.error("[analytics/vitals] non-critical:", err);
    // Ignore — fire-and-forget analytics
  }
  return new NextResponse(null, { status: 204 });
}

export async function GET() {
  return new NextResponse(null, { status: 204 });
}
