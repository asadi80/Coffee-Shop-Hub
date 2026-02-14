// app/api/auth/logout/route.js
import { NextResponse } from 'next/server';

export async function POST() {
  // Create response
  const response = NextResponse.json({ 
    success: true, 
    message: 'Logged out successfully' 
  });

  // List of all possible auth cookies to clear
  const cookiesToClear = [
    // NextAuth cookies
    'next-auth.session-token',
    'next-auth.csrf-token',
    'next-auth.callback-url',
    '__Secure-next-auth.session-token',
    '__Host-next-auth.csrf-token',
    
    // Custom JWT cookies
    'token',
    'jwt',
    'access_token',
    'refresh_token',
    
    // Common auth cookies
    'session',
    'sessionid',
    'connect.sid',
    
    // Any other cookies that might be set
    'user',
    'auth',
    'authenticated'
  ];

  // Clear each cookie with all possible variations
  cookiesToClear.forEach(cookieName => {
    // Clear for root path
    response.cookies.set(cookieName, '', {
      expires: new Date(0),
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      domain: process.env.NODE_ENV === 'production' ? '.vercel.app' : undefined
    });

    // Clear for all subpaths
    response.cookies.set(cookieName, '', {
      expires: new Date(0),
      path: '/api',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });

    response.cookies.set(cookieName, '', {
      expires: new Date(0),
      path: '/admin',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
  });

  // Add cache control headers to prevent caching
  response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');

  return response;
}

export async function GET() {
  return POST();
}