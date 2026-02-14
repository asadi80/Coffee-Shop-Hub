// src/lib/middleware.js (updated - remove JWT dependencies)
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import connectDB from './mongodb';
import User from '@/models/User';

/**
 * Authenticate user from request using NextAuth only
 * @param {Request} request - Next.js request object
 * @returns {Object} User object or null
 */
export async function authenticate(request) {
  try {
    // Only use NextAuth token
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    if (!token?.id) {
      return null;
    }

    await connectDB();
    
    const user = await User.findById(token.id).select('-password');

    if (!user || !user.isActive) {
      return null;
    }

    return user;
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

/**
 * Middleware to protect API routes
 */
export async function withAuth(request, handler) {
  const user = await authenticate(request);
  
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  // Add user to request context
  request.user = user;
  return handler(request);
}

/**
 * Middleware to check user roles
 */
export function withRole(roles) {
  return async (request, handler) => {
    const user = await authenticate(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    if (!roles.includes(user.role)) {
      return NextResponse.json(
        { error: 'Forbidden: Insufficient permissions' },
        { status: 403 }
      );
    }
    
    request.user = user;
    return handler(request);
  };
}