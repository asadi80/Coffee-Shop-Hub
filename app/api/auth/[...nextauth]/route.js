// src/app/api/auth/[...nextauth]/route.js
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

// Add logging for production debugging
if (process.env.NODE_ENV === 'production') {
  console.log('NextAuth URL:', process.env.NEXTAUTH_URL);
  console.log('Environment:', process.env.NODE_ENV);
}

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };