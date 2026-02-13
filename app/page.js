'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { getCurrentPosition } from '@/lib/utils';

// Dynamically import map component to avoid SSR issues with Leaflet
const MapView = dynamic(
  () => import('@/components/map/MapView'),
  { ssr: false }
);

export default function HomePage() {
  const [userLocation, setUserLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function getLocation() {
      try {
        const position = await getCurrentPosition();
        setUserLocation(position);
      } catch (err) {
        console.error('Error getting location:', err);
        // Use default location (San Francisco)
        setUserLocation({
          latitude: parseFloat(process.env.NEXT_PUBLIC_MAP_DEFAULT_LAT || 37.7749),
          longitude: parseFloat(process.env.NEXT_PUBLIC_MAP_DEFAULT_LNG || -122.4194),
        });
        setError('Unable to get your location. Showing default area.');
      } finally {
        setIsLoading(false);
      }
    }

    getLocation();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-coffee-dark via-coffee-medium to-coffee-dark text-white py-16 px-4 overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 text-[20rem] opacity-5 pointer-events-none">
          ☕
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-4 text-white">
            Discover Your Next Favorite
            <span className="block text-accent-orange mt-2">Coffee Shop</span>
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
            Explore local coffee shops near you, browse their menus, and find your perfect cup of coffee.
          </p>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-8 px-4 bg-cream">
        <div className="max-w-7xl mx-auto">
          {error && (
            <div className="bg-accent-orange text-white px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
              <span className="text-xl">ℹ️</span>
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <svg className="animate-spin h-12 w-12 text-coffee-dark" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <p className="text-coffee-medium font-medium">Loading map...</p>
            </div>
          ) : (
            <MapView userLocation={userLocation} />
          )}
        </div>
      </section>
    </div>
  );
}
