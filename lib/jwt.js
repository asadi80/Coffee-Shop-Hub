// src/lib/jwt.js
import jwt from 'jsonwebtoken';

// Use NEXTAUTH_SECRET as fallback for JWT_SECRET
const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;

if (!JWT_SECRET) {
  throw new Error('Please define JWT_SECRET or NEXTAUTH_SECRET in environment variables');
}

/**
 * Generate JWT token
 * @param {Object} payload - Data to encode in token
 * @param {String} expiresIn - Token expiration (default: 7 days)
 * @returns {String} JWT token
 */
export function generateToken(payload, expiresIn = '7d') {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn,
    issuer: 'coffee-shop-hub'
  });
}

/**
 * Verify JWT token
 * @param {String} token - JWT token to verify
 * @returns {Object} Decoded payload
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: 'coffee-shop-hub'
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    }
    throw error;
  }
}

/**
 * Decode token without verification (useful for expired tokens)
 * @param {String} token - JWT token
 * @returns {Object} Decoded payload
 */
export function decodeToken(token) {
  return jwt.decode(token);
}

/**
 * Extract token from Authorization header
 * @param {String} authHeader - Authorization header value
 * @returns {String|null} Token or null
 */
export function extractToken(authHeader) {
  if (!authHeader) return null;
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }
  
  return parts[1];
}

/**
 * Extract token from cookies (for NextAuth compatibility)
 * @param {Request} request - Next.js request object
 * @returns {String|null} Token or null
 */
export function extractTokenFromCookies(request) {
  const cookies = request.cookies;
  
  // Try NextAuth cookie first
  const nextAuthToken = cookies.get('next-auth.session-token')?.value ||
                       cookies.get('__Secure-next-auth.session-token')?.value;
  
  if (nextAuthToken) {
    return nextAuthToken;
  }
  
  // Try custom token cookie if you set one
  const customToken = cookies.get('token')?.value;
  
  return customToken || null;
}

/**
 * Create auth response with token and user data
 * @param {Object} user - User object
 * @returns {Object} Auth response
 */
export function createAuthResponse(user) {
  const token = generateToken({
    userId: user._id,
    email: user.email,
    role: user.role
  });

  return {
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar
    }
  };
}

/**
 * Clear auth cookies (for logout)
 * @param {Response} response - Next.js response object
 * @returns {Response} Response with cleared cookies
 */
export function clearAuthCookies(response) {
  // Clear NextAuth cookies
  const cookiesToClear = [
    'next-auth.session-token',
    'next-auth.csrf-token',
    'next-auth.callback-url',
    '__Secure-next-auth.session-token',
    '__Host-next-auth.csrf-token',
    'token' // Clear custom token if you use it
  ];

  cookiesToClear.forEach(cookieName => {
    response.cookies.set(cookieName, '', {
      expires: new Date(0),
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
  });

  return response;
}