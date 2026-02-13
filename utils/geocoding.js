// src/utils/geocoding.js

/**
 * Calculate distance between two coordinates (Haversine formula)
 * @param {Number} lat1 - Latitude of first point
 * @param {Number} lon1 - Longitude of first point
 * @param {Number} lat2 - Latitude of second point
 * @param {Number} lon2 - Longitude of second point
 * @returns {Number} Distance in kilometers
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
}

/**
 * Convert degrees to radians
 * @param {Number} degrees
 * @returns {Number} Radians
 */
function toRad(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Format distance for display
 * @param {Number} distance - Distance in kilometers
 * @returns {String} Formatted distance
 */
export function formatDistance(distance) {
  if (distance < 1) {
    return `${Math.round(distance * 1000)} m`;
  }
  return `${distance.toFixed(1)} km`;
}

/**
 * Get user's current position
 * @returns {Promise<Object>} { latitude, longitude }
 */
export function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  });
}

/**
 * Geocode address to coordinates (using Google Maps API)
 * @param {String} address - Address to geocode
 * @returns {Promise<Object>} { latitude, longitude, formattedAddress }
 */
export async function geocodeAddress(address) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    throw new Error('Google Maps API key not configured');
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`
    );

    const data = await response.json();

    if (data.status !== 'OK' || !data.results.length) {
      throw new Error('Address not found');
    }

    const result = data.results[0];
    
    return {
      latitude: result.geometry.location.lat,
      longitude: result.geometry.location.lng,
      formattedAddress: result.formatted_address,
      placeId: result.place_id
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    throw error;
  }
}

/**
 * Reverse geocode coordinates to address
 * @param {Number} latitude
 * @param {Number} longitude
 * @returns {Promise<Object>} Address components
 */
export async function reverseGeocode(latitude, longitude) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    throw new Error('Google Maps API key not configured');
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`
    );

    const data = await response.json();

    if (data.status !== 'OK' || !data.results.length) {
      throw new Error('Location not found');
    }

    const result = data.results[0];
    
    return {
      formattedAddress: result.formatted_address,
      components: result.address_components,
      placeId: result.place_id
    };
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    throw error;
  }
}

/**
 * Calculate bounding box for given center and radius
 * @param {Number} latitude - Center latitude
 * @param {Number} longitude - Center longitude
 * @param {Number} radiusKm - Radius in kilometers
 * @returns {Object} { north, south, east, west }
 */
export function getBoundingBox(latitude, longitude, radiusKm) {
  const latRadian = latitude * Math.PI / 180;
  
  const degLat = radiusKm / 110.574;
  const degLon = radiusKm / (111.320 * Math.cos(latRadian));
  
  return {
    north: latitude + degLat,
    south: latitude - degLat,
    east: longitude + degLon,
    west: longitude - degLon
  };
}

/**
 * Check if point is within bounding box
 * @param {Number} latitude
 * @param {Number} longitude
 * @param {Object} bounds - { north, south, east, west }
 * @returns {Boolean}
 */
export function isWithinBounds(latitude, longitude, bounds) {
  return (
    latitude <= bounds.north &&
    latitude >= bounds.south &&
    longitude <= bounds.east &&
    longitude >= bounds.west
  );
}
