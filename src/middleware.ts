import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

/**
 * Middleware configuration for protected routes and role-based access
 */
export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAuth = !!token
    const isAuthPage = req.nextUrl.pathname.startsWith('/login')

    if (isAuthPage) {
      if (isAuth) {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
      return null
    }

    if (!isAuth) {
      let from = req.nextUrl.pathname
      if (req.nextUrl.search) {
        from += req.nextUrl.search
      }
      return NextResponse.redirect(
        new URL(`/login?from=${encodeURIComponent(from)}`, req.url)
      )
    }

    // Handle role-based access
    if (req.nextUrl.pathname.startsWith('/admin') && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    if (req.nextUrl.pathname.startsWith('/employee') && 
        token?.role !== 'EMPLOYEE' && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
)

/**
 * Configure which routes should be protected by this middleware
 */
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/employee/:path*',
    '/login'
  ]
} 