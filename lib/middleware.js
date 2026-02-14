// src/lib/middleware.js (update the authenticate function)
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { verifyToken, extractToken, extractTokenFromCookies } from './jwt';
import connectDB from './mongodb';
import User from '@/models/User';

/**
 * Authenticate user from request
 * @param {Request} request - Next.js request object
 * @returns {Object} User object or null
 */
export async function authenticate(request) {
  try {
    let token = null;
    
    // 1. Try to get token from NextAuth
    const nextAuthToken = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    if (nextAuthToken?.id) {
      token = nextAuthToken;
    } else {
      // 2. Try custom JWT from Authorization header
      const authHeader = request.headers.get('authorization');
      token = extractToken(authHeader);
      
      // 3. Try custom JWT from cookies
      if (!token) {
        token = extractTokenFromCookies(request);
      }
      
      if (token) {
        try {
          const decoded = verifyToken(token);
          if (decoded) {
            token = { id: decoded.userId, role: decoded.role };
          }
        } catch (error) {
          console.error('JWT verification failed:', error.message);
          return null;
        }
      }
    }

    if (!token) {
      return null;
    }

    await connectDB();
    
    const userId = token.id || token.userId;
    const user = await User.findById(userId).select('-password');

    if (!user || !user.isActive) {
      return null;
    }

    return user;
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}