// src/middleware.js
import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const path = req.nextUrl.pathname

    // Allow public access to /view/* routes (read-only)
    if (path.startsWith('/view')) {
      return NextResponse.next()
    }

    // Allow public access to GET API routes (for read-only)
    if (path.startsWith('/api/') && req.method === 'GET') {
      // But block /api/auth/* from public
      if (path.startsWith('/api/auth')) {
        return NextResponse.next()
      }
      return NextResponse.next()
    }

    // All other routes require authentication
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname
        
        // Public routes don't need auth
        if (path.startsWith('/view')) return true
        
        // GET API routes are public (read-only)
        if (path.startsWith('/api/') && req.method === 'GET') return true
        
        // Everything else needs auth
        return !!token
      }
    },
    pages: { signIn: '/login' }
  }
)

// Protect admin routes, block POST/PATCH/DELETE without auth
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/calendar/:path*',
    '/videos/:path*',
    '/teams/:path*',
    '/reports/:path*',
    '/admin/:path*',
    '/api/:path*',
  ],
}