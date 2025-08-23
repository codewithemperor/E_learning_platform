import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('session-token')?.value;

  // If no token, redirect to login based on the requested path
  if (!token) {
    const { pathname } = request.nextUrl;
    
    if (pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    } else if (pathname.startsWith('/teacher')) {
      return NextResponse.redirect(new URL('/teacher/login', request.url));
    } else if (pathname.startsWith('/student')) {
      return NextResponse.redirect(new URL('/student/login', request.url));
    }
    
    return NextResponse.next();
  }

  try {
    // Decode token to get user ID
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [userId] = decoded.split(':');

    // Get user from database
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        studentProfile: true,
        teacherProfile: true,
        adminProfile: true
      }
    });

    if (!user) {
      // Invalid token, clear cookie and redirect to login
      const response = NextResponse.redirect(new URL('/', request.url));
      response.cookies.set('session-token', '', { maxAge: 0 });
      return response;
    }

    // Check if user has access to the requested path
    const { pathname } = request.nextUrl;
    
    if (pathname.startsWith('/admin') && user.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', request.url));
    } else if (pathname.startsWith('/teacher') && user.role !== 'TEACHER') {
      return NextResponse.redirect(new URL('/', request.url));
    } else if (pathname.startsWith('/student') && user.role !== 'STUDENT') {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Add user info to request headers for client-side access
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', user.id);
    requestHeaders.set('x-user-role', user.role);
    requestHeaders.set('x-user-name', user.name);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.error('Middleware error:', error);
    const response = NextResponse.redirect(new URL('/', request.url));
    response.cookies.set('session-token', '', { maxAge: 0 });
    return response;
  }
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/teacher/:path*',
    '/student/:path*',
  ],
};