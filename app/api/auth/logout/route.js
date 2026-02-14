// app/api/auth/logout/route.js
import { NextResponse } from 'next/server';
import { clearAuthCookies } from '@/lib/jwt';

export async function POST() {
  try {
    const response = NextResponse.json({ 
      success: true, 
      message: 'Logged out successfully' 
    });
    
    // Clear all auth cookies
    return clearAuthCookies(response);
    
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Failed to logout' },
      { status: 500 }
    );
  }
}

// Also handle GET for simplicity
export async function GET() {
  return POST();
}