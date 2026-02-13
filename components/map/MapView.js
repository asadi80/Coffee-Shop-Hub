'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Coffee, MapPin, User } from "lucide-react";

import L from 'leaflet';
import Link from 'next/link';

// Fix Leaflet default marker icon issue with Next.js
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom coffee shop icon

const createCoffeeIcon = () => {
  return L.divIcon({
    html: `
      <div style="
        background:white;
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
    `,
    className: "",
    iconSize: [36, 36],
    iconAnchor: [18, 36],
  });
};

// User location marker
const createUserIcon = () => {
  return L.divIcon({
    html: `
      <div style="
        background: #3B82F6;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 3px solid white;
        box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
      ">
        <div style="
          background: white;
          width: 8px;
          height: 8px;
          border-radius: 50%;
        "></div>
      </div>
    `,
    className: 'user-location-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

function MapController({ center }) {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView([center.latitude, center.longitude], 13);
    }
  }, [center, map]);
  
  return null;
}

export default function MapView({ userLocation }) {
  const coffeeIcon = createCoffeeIcon();
  const userIcon = createUserIcon();
  console.log('Coffee icon:', coffeeIcon);

  
  const [shops, setShops] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchRadius, setSearchRadius] = useState(5000); // 5km default

  useEffect(() => {
    if (userLocation) {
      fetchNearbyShops();
    }
  }, [userLocation, searchRadius]);

  async function fetchNearbyShops() {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/shops/nearby?latitude=${userLocation.latitude}&longitude=${userLocation.longitude}&maxDistance=${searchRadius}`
      );
      
      if (!response.ok) throw new Error('Failed to fetch shops');
      
      const data = await response.json();
      setShops(data.shops || []);
    } catch (error) {
      console.error('Error fetching nearby shops:', error);
    } finally {
      setIsLoading(false);
    }
  }

  if (!userLocation) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coffee-dark mx-auto"></div>
          <p className="mt-4 text-coffee-medium">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="map-container">
      {/* Controls */}
      <div className="flex flex-wrap justify-between items-center p-4 bg-white rounded-xl shadow-sm mb-4 gap-4">
        <div className="flex items-center gap-3">
          <label htmlFor="radius" className="font-semibold text-coffee-dark">
            Search Radius:
          </label>
          <select
            id="radius"
            value={searchRadius}
            onChange={(e) => setSearchRadius(Number(e.target.value))}
            className="px-4 py-2 border-2 border-cream-dark rounded-lg bg-white text-coffee-dark font-medium cursor-pointer focus:outline-none focus:border-coffee-medium transition-colors"
          >
            <option value="2000">2 km</option>
            <option value="5000">5 km</option>
            <option value="10000">10 km</option>
            <option value="20000">20 km</option>
          </select>
        </div>
        
        <div className="text-coffee-medium font-semibold">
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-coffee-medium"></span>
              Searching...
            </span>
          ) : (
            `${shops.length} ${shops.length === 1 ? 'shop' : 'shops'} found`
          )}
        </div>
      </div>

      {/* Map */}
      <MapContainer
        center={[userLocation.latitude, userLocation.longitude]}
        zoom={13}
        style={{ height: '600px', width: '100%' }}
        className="rounded-xl shadow-lg"
      >
        <MapController center={userLocation} />
        
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User location marker */}
        <Marker 
          position={[userLocation.latitude, userLocation.longitude]}
          icon={userIcon}
        >
          <Popup>
            <div className="p-2">
              <strong className="text-blue-600">📍 Your Location</strong>
              <p className="text-sm text-gray-600 mt-1">
                We&apos;ll show coffee shops near here
              </p>
            </div>
          </Popup>
        </Marker>

        {/* Shop markers */}
        {shops.map((shop) => (
          <Marker
            key={shop._id || shop.id}
            position={[shop.location.coordinates[1], shop.location.coordinates[0]]}
            icon={coffeeIcon}
          >
            <Popup>
              <div className="p-3 min-w-[200px]">
                <h3 className="font-serif font-bold text-lg text-coffee-dark mb-1">
                  {shop.name}
                </h3>
                {shop.distance && (
                  <p className="text-emerald-600 font-medium text-sm mb-2">
                    📍 {shop.distance.toFixed(1)} km away
                  </p>
                )}
                <p className="text-coffee-medium text-sm mb-3">
                  {shop.address}
                </p>
                <div className="flex flex-col gap-2">
                  <Link 
                    href={`/shop/${shop.slug || shop._id}`} 
                    className="px-4 py-2 bg-coffee-dark text-white rounded-lg text-center font-semibold hover:bg-coffee-medium transition-colors"
                  >
                    View Menu
                  </Link>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${shop.location.coordinates[1]},${shop.location.coordinates[0]}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-center font-semibold hover:bg-emerald-600 transition-colors"
                    onClick={() => {
                      // Track map click
                      fetch(`/api/shops/${shop._id}/track-click`, {
                        method: 'POST',
                      }).catch(console.error);
                    }}
                  >
                    Get Directions
                  </a>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}