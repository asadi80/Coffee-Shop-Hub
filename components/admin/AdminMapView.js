'use client';

import { useEffect, useState, useMemo } from 'react';
import dynamic from "next/dynamic";

// Dynamically import Leaflet only on client side
let L;
if (typeof window !== 'undefined') {
  L = require('leaflet');
}

// Dynamic imports for Leaflet components (client-side only)
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);

const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);

const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

// Custom marker icon creator (only create on client side)
const createCustomIcon = (isActive) => {
  if (typeof window === 'undefined') return null;
  
  const color = isActive ? '#4bf188' : '#ef4444';
  const iconHtml = `
    <div style="
        background: ${color};
        width:36px;
        height:36px;
        border-radius:50%;
        display:flex;
        align-items:center;
        justify-content:center;
        box-shadow:0 2px 6px rgba(0,0,0,0.25);
      ">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="#7C3AED" 
          stroke-width="2" 
          stroke-linecap="round" 
          stroke-linejoin="round"
        >
          <path d="M17 8h1a4 4 0 1 1 0 8h-1"/>
          <path d="M3 8h14v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/>
          <line x1="6" y1="2" x2="6" y2="4"/>
          <line x1="10" y1="2" x2="10" y2="4"/>
          <line x1="14" y1="2" x2="14" y2="4"/>
        </svg>
    </div>
  `;

  return L.divIcon({
    html: iconHtml,
    className: 'custom-marker',
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
};

export default function AdminMapView({ shops = [] }) {
  const [mounted, setMounted] = useState(false);
  const [mapError, setMapError] = useState(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  // Initialize Leaflet and fix default icons
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Fix Leaflet default marker icon
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });
      
      setLeafletLoaded(true);
    }
    
    setMounted(true);
  }, []);

  // Memoize icon creator to prevent unnecessary recalculations
  const getIconForShop = useMemo(() => {
    if (typeof window === 'undefined' || !leafletLoaded) return () => null;
    
    const iconCache = new Map();
    return (isActive) => {
      const key = isActive ? 'active' : 'inactive';
      if (!iconCache.has(key)) {
        iconCache.set(key, createCustomIcon(isActive));
      }
      return iconCache.get(key);
    };
  }, [leafletLoaded]);

  // Filter out shops with invalid location data
  const validShops = shops.filter(shop => {
    const hasValidLocation = shop?.location?.coordinates && 
      Array.isArray(shop.location.coordinates) && 
      shop.location.coordinates.length === 2 &&
      !isNaN(shop.location.coordinates[0]) && 
      !isNaN(shop.location.coordinates[1]);
    
    if (!hasValidLocation) {
      console.warn('Shop missing valid location data:', shop?._id || 'unknown');
    }
    return hasValidLocation;
  });

  // Calculate map center based on all valid shops
  const center = useMemo(() => {
    if (validShops.length === 0) {
      return [37.7749, -122.4194]; // Default to San Francisco
    }

    if (validShops.length === 1) {
      return [
        validShops[0].location.coordinates[1],
        validShops[0].location.coordinates[0]
      ];
    }

    return [
      validShops.reduce((sum, shop) => sum + shop.location.coordinates[1], 0) / validShops.length,
      validShops.reduce((sum, shop) => sum + shop.location.coordinates[0], 0) / validShops.length,
    ];
  }, [validShops]);

  // Determine zoom level based on number of shops
  const zoomLevel = useMemo(() => {
    if (validShops.length === 0) return 4;
    if (validShops.length === 1) return 13;
    if (validShops.length < 5) return 10;
    if (validShops.length < 15) return 8;
    return 5;
  }, [validShops.length]);

  // Loading state
  if (!mounted || !leafletLoaded) {
    return (
      <div className="h-[600px] bg-gray-100 flex items-center justify-center rounded-lg">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-600"></div>
          <div className="text-gray-600 font-medium">Loading map...</div>
        </div>
      </div>
    );
  }

  // Error state
  if (mapError) {
    return (
      <div className="h-[600px] bg-red-50 flex items-center justify-center rounded-lg">
        <div className="text-center p-6">
          <div className="text-red-600 text-xl mb-2">⚠️</div>
          <div className="text-red-800 font-medium">Failed to load map</div>
          <div className="text-red-600 text-sm mt-2">{mapError}</div>
          <button 
            onClick={() => setMapError(null)}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[600px] w-full relative rounded-lg overflow-hidden">
      {/* Map Legend */}
      <div 
        className="absolute top-4 right-4 z-[1000] bg-white rounded-lg shadow-lg p-4 min-w-[180px]"
        role="complementary"
        aria-label="Map legend"
      >
        <h3 className="font-bold text-gray-800 mb-3 text-sm border-b pb-2">Legend</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-400 rounded-full shadow-sm"></div>
            <span className="text-gray-700">Active Shop</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-400 rounded-full shadow-sm"></div>
            <span className="text-gray-700">Inactive Shop</span>
          </div>
        </div>
        
        {/* Stats */}
        <div className="mt-4 pt-3 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Total Shops: <span className="font-bold text-gray-900">{shops.length}</span>
          </p>
          {shops.length !== validShops.length && (
            <p className="text-xs text-amber-600 mt-1">
              ⚠️ {shops.length - validShops.length} shop(s) missing location data
            </p>
          )}
          <div className="flex justify-between mt-2 text-xs">
            <span className="text-green-600">Active: {shops.filter(s => s.isActive).length}</span>
            <span className="text-red-600">Inactive: {shops.filter(s => !s.isActive).length}</span>
          </div>
        </div>
      </div>

      {/* Map Container */}
      {leafletLoaded && (
        <MapContainer
          key={`map-${validShops.length}`}
          center={center}
          zoom={zoomLevel}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
          whenCreated={(map) => {
            // Handle map creation errors
            map.on('error', (e) => {
              setMapError(e.message);
            });
          }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Render markers for valid shops */}
          {validShops.map((shop) => (
            <Marker
              key={shop._id}
              position={[
                shop.location.coordinates[1],
                shop.location.coordinates[0]
              ]}
              icon={getIconForShop(shop.isActive)}
              aria-label={`${shop.name} - ${shop.isActive ? 'Active' : 'Inactive'} shop`}
            >
              <Popup>
                <div className="min-w-[250px] max-w-[300px] p-1">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-lg text-gray-800 pr-2 leading-tight">
                      {shop.name}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                      shop.isActive 
                        ? 'bg-green-100 text-green-800 border border-green-200' 
                        : 'bg-red-100 text-red-800 border border-red-200'
                    }`}>
                      {shop.isActive ? '● Active' : '○ Inactive'}
                    </span>
                  </div>
                  
                  {/* Address */}
                  <p className="text-sm text-gray-600 mb-3 pb-2 border-b border-gray-100">
                    📍 {shop.address || 'No address provided'}
                  </p>

                  {/* Owner Info */}
                  {shop.ownerId && (
                    <div className="mb-3 text-sm bg-gray-50 p-2 rounded">
                      <p className="text-gray-700">
                        <span className="font-medium">Owner:</span> {shop.ownerId.name || 'Unknown'}
                      </p>
                      {shop.ownerId.email && (
                        <p className="text-gray-600 text-xs mt-1">
                          ✉️ {shop.ownerId.email}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Analytics */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="bg-amber-50 rounded p-2 text-center">
                      <div className="font-bold text-amber-800">
                        {shop.analytics?.views?.toLocaleString() || 0}
                      </div>
                      <div className="text-xs text-amber-600">Views</div>
                    </div>
                    <div className="bg-amber-50 rounded p-2 text-center">
                      <div className="font-bold text-amber-800">
                        {shop.analytics?.mapClicks?.toLocaleString() || 0}
                      </div>
                      <div className="text-xs text-amber-600">Clicks</div>
                    </div>
                    <div className="bg-amber-50 rounded p-2 text-center">
                      <div className="font-bold text-amber-800">
                        {shop.analytics?.uniqueVisitors?.toLocaleString() || 0}
                      </div>
                      <div className="text-xs text-amber-600">Visitors</div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <a
                      href={`/shop/${shop.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-center bg-amber-600 text-white px-3 py-2 rounded text-xs font-medium hover:bg-amber-700 transition-colors focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                    >
                      View Shop
                    </a>
                    <a
                      href={`/admin/shops/${shop._id}`}
                      className="flex-1 text-center bg-gray-800 text-white px-3 py-2 rounded text-xs font-medium hover:bg-gray-900 transition-colors focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                    >
                      Manage
                    </a>
                  </div>

                  {/* Last Updated */}
                  {shop.updatedAt && (
                    <p className="text-xs text-gray-400 mt-2 text-right">
                      Updated: {new Date(shop.updatedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Show message if no valid shops */}
          {validShops.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-white/90 backdrop-blur-sm px-6 py-4 rounded-lg shadow-lg pointer-events-auto">
                <p className="text-gray-800 font-medium">No shop locations to display</p>
                <p className="text-sm text-gray-600 mt-1">Add shops with location data to see them on the map</p>
              </div>
            </div>
          )}
        </MapContainer>
      )}
    </div>
  );
}