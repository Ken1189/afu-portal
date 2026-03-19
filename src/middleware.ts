import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { rateLimit } from '@/lib/rateLimit';

export async function middleware(request: NextRequest) {
  // Rate limit API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const rateLimitResponse = rateLimit(request);
    if (rateLimitResponse) return rateLimitResponse;
  }

  // Skip Supabase middleware if not configured yet (dev / demo mode)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
    return NextResponse.next();
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
