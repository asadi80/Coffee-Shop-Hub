// src/components/SessionProvider.jsx
'use client';

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';

export function SessionProvider({ children }) {
  return (
    <NextAuthSessionProvider
      refetchInterval={0} // Disable auto-refresh to prevent issues
      refetchOnWindowFocus={false} // Don't refetch on window focus
    >
      {children}
    </NextAuthSessionProvider>
  );
}