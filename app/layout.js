
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth/next';
import Navbar from '@/components/layout/Navbar';
import PWAInstaller from '@/components/PWAInstaller';
import { SessionProvider } from '@/components/SessionProvider';

import './globals.css';

export const metadata = {
  title: 'Coffee Shop Hub - Discover Local Coffee Shops',
  description: 'Find and explore the best coffee shops near you. Shop owners can create their digital presence and showcase their menu.',
  keywords: 'coffee shop, cafe, local coffee, menu, coffee near me',
  manifest: '/manifest.json',
  // themeColor: '#2C1810',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Coffee Hub',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#2C1810',
};

export default async function RootLayout({ children }) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Coffee Hub" />
      </head>
      <body>
        <SessionProvider>

        <Navbar session={session} />
        <main>{children}</main>
        <PWAInstaller />
        </SessionProvider>
      </body>
    </html>
  );
}
