// src/lib/middleware.js
import { NextResponse } from 'next/server';
import { verifyToken, extractToken } from './jwt';
import connectDB from './mongodb';
import User from '@/models/User';

/**
 * Authenticate user from request
 * @param {Request} request - Next.js request object
 * @returns {Object} User object or null
 */
export async function authenticate(request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractToken(authHeader);

    if (!token) {
      return null;
    }

    const decoded = verifyToken(token);
    
    await connectDB();
    const user = await User.findById(decoded.userId).select('-password');

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
 * @param {Function} handler - Route handler function
 * @returns {Function} Protected route handler
 */
export function withAuth(handler) {
  return async (request, context) => {
    const user = await authenticate(request);

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please login' },
        { status: 401 }
      );
    }

    // Attach user to request for use in handler
    request.user = user;
    return handler(request, context);
  };
}

/**
 * Middleware to check if user is shop owner
 * @param {Function} handler - Route handler function
 * @returns {Function} Protected route handler
 */
export function withOwnership(handler) {
  return async (request, context) => {
    const user = await authenticate(request);

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please login' },
        { status: 401 }
      );
    }

    request.user = user;
    return handler(request, context);
  };
}

/**
 * Middleware to check if user is admin
 * @param {Function} handler - Route handler function
 * @returns {Function} Protected route handler
 */
export function withAdmin(handler) {
  return async (request, context) => {
    const user = await authenticate(request);

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please login' },
        { status: 401 }
      );
    }

    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    request.user = user;
    return handler(request, context);
  };
}

/**
 * Rate limiting (simple in-memory implementation)
 * For production, use Redis or similar
 */
const rateLimitMap = new Map();

export function rateLimit(options = {}) {
  const {
    windowMs = 60 * 1000, // 1 minute
    maxRequests = 10
  } = options;

  return (handler) => {
    return async (request, context) => {
      const ip = request.headers.get('x-forwarded-for') || 
                 request.headers.get('x-real-ip') || 
                 'unknown';
      
      const key = `${ip}-${request.url}`;
      const now = Date.now();
      
      const requestLog = rateLimitMap.get(key) || [];
      const recentRequests = requestLog.filter(time => now - time < windowMs);
      
      if (recentRequests.length >= maxRequests) {
        return NextResponse.json(
          { error: 'Too many requests - Please try again later' },
          { status: 429 }
        );
      }
      
      recentRequests.push(now);
      rateLimitMap.set(key, recentRequests);
      
      // Clean up old entries periodically
      if (Math.random() < 0.01) {
        for (const [key, times] of rateLimitMap.entries()) {
          const validTimes = times.filter(time => now - time < windowMs);
          if (validTimes.length === 0) {
            rateLimitMap.delete(key);
          } else {
            rateLimitMap.set(key, validTimes);
          }
        }
      }
      
      return handler(request, context);
    };
  };
}

/**
 * Error handler wrapper
 * @param {Function} handler - Route handler function
 * @returns {Function} Error-handled route handler
 */
export function withErrorHandler(handler) {
  return async (request, context) => {
    try {
      return await handler(request, context);
    } catch (error) {
      console.error('API Error:', error);
      
      // Handle specific error types
      if (error.name === 'ValidationError') {
        return NextResponse.json(
          { error: 'Validation failed', details: error.message },
          { status: 400 }
        );
      }
      
      if (error.name === 'CastError') {
        return NextResponse.json(
          { error: 'Invalid ID format' },
          { status: 400 }
        );
      }
      
      // Generic error response
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

/**
 * Compose multiple middleware functions
 * @param  {...Function} middlewares - Middleware functions
 * @returns {Function} Composed middleware
 */
export function compose(...middlewares) {
  return (handler) => {
    return middlewares.reduceRight(
      (acc, middleware) => middleware(acc),
      handler
    );
  };
}
