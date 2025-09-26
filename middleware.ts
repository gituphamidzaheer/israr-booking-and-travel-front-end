import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protected routes that require authentication
  const protectedRoutes = ['/admin', '/vendor']
  const authRoutes = ['/login']

  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )

  // Check if the current path is an auth route (login, register, etc.)
  const isAuthRoute = authRoutes.some(route => 
    pathname.startsWith(route)
  )

  // Get token and role from cookies
  const token = request.cookies.get('access_token')?.value
  const userRole = request.cookies.get('user_role')?.value

  console.log('Middleware - pathname:', pathname, 'token:', !!token, 'role:', userRole) // Debug log

  // If accessing protected route without token, redirect to login
  if (isProtectedRoute && !token) {
    console.log('Redirecting to login - no token') // Debug log
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // If accessing admin route without admin role
  if (pathname.startsWith('/admin') && token && userRole !== 'admin') {
    console.log('Redirecting - not admin role') // Debug log
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If accessing vendor route without vendor role
  if (pathname.startsWith('/vendor') && token && userRole !== 'vendor' && userRole !== 'hotel') {
    console.log('Redirecting - not vendor/hotel role') // Debug log
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If accessing auth route with valid token, redirect based on role
  if (isAuthRoute && token && userRole) {
    console.log('Redirecting authenticated user from login') // Debug log
    if (userRole === 'admin') {
      return NextResponse.redirect(new URL('/admin/dashboard/users', request.url))
    } else if (userRole === 'vendor' || userRole === 'hotel') {
      return NextResponse.redirect(new URL('/vendor/dashboard/bookings', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}
