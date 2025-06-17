import { NextRequest, NextResponse } from 'next/server';

/**
 * Minimal Next.js Middleware - Static Redirects Only
 *
 * WARNING: Due to CVE-2025-29927, authentication logic should NOT be in middleware.
 * Use Data Access Layer (DAL) in Server Components instead.
 *
 * This middleware only handles:
 * - Static redirects
 * - Headers manipulation
 * - Basic routing (non-auth related)
 */

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Static redirects only - no authentication logic

  // Redirect root to dashboard for convenience
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Redirect old auth routes to new ones
  if (pathname === '/signin') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (pathname === '/signup') {
    return NextResponse.redirect(new URL('/register', request.url));
  }

  // Add security headers to all responses
  const response = NextResponse.next();

  // Security headers (non-auth related)
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');

  return response;
}

// Only run on specific paths - avoid protected routes
export const config = {
  matcher: [
    // Include root and auth redirects
    '/',
    '/signin',
    '/signup',
    // Exclude API routes and static files
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
