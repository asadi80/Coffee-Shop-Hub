/**
 * Geocoding utilities using OpenStreetMap Nominatim API (free, no API key required)
 */

/**
 * Reverse geocode: Get address from coordinates
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<object>} Address data
 */
export async function reverseGeocode(lat, lng) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'en-US,en',
          'User-Agent': 'CoffeeShopHub/1.0', // Nominatim requires a user agent
        }
      }
    );

    if (!response.ok) {
      throw new Error('Geocoding failed');
    }

    const data = await response.json();
    
    return {
      success: true,
      displayName: data.display_name,
      address: {
        road: data.address?.road || '',
        houseNumber: data.address?.house_number || '',
        suburb: data.address?.suburb || data.address?.neighbourhood || '',
        city: data.address?.city || data.address?.town || data.address?.village || '',
        state: data.address?.state || '',
        postcode: data.address?.postcode || '',
        country: data.address?.country || '',
      },
      formatted: formatAddress(data.address),
    };
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Forward geocode: Get coordinates from address
 * @param {string} address - Address string
 * @returns {Promise<object>} Coordinates and address data
 */
export async function forwardGeocode(address) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&addressdetails=1&limit=5`,
      {
        headers: {
          'Accept-Language': 'en-US,en',
          'User-Agent': 'CoffeeShopHub/1.0',
        }
      }
    );

    if (!response.ok) {
      throw new Error('Geocoding failed');
    }

    const data = await response.json();
    
    if (!data || data.length === 0) {
      return {
        success: false,
        error: 'No results found',
      };
    }

    // Return multiple results
    return {
      success: true,
      results: data.map(item => ({
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        displayName: item.display_name,
        address: item.address,
        importance: item.importance,
      })),
    };
  } catch (error) {
    console.error('Forward geocoding error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Format address object into readable string
 * @param {object} address - Address object from Nominatim
 * @returns {string} Formatted address
 */
function formatAddress(address) {
  if (!address) return '';

  const parts = [];
  
  if (address.house_number && address.road) {
    parts.push(`${address.house_number} ${address.road}`);
  } else if (address.road) {
    parts.push(address.road);
  }

  if (address.suburb || address.neighbourhood) {
    parts.push(address.suburb || address.neighbourhood);
  }

  if (address.city || address.town || address.village) {
    parts.push(address.city || address.town || address.village);
  }

  if (address.state) {
    parts.push(address.state);
  }

  if (address.postcode) {
    parts.push(address.postcode);
  }

  if (address.country) {
    parts.push(address.country);
  }

  return parts.filter(Boolean).join(', ');
}

/**
 * Get current location using browser geolocation API
 * @returns {Promise<object>} Current coordinates
 */
export function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          success: true,
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        reject({
          success: false,
          error: error.message,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  });
}

/**
 * Debounced geocoding for search-as-you-type
 * @param {string} address - Address to search
 * @param {number} delay - Delay in ms
 * @returns {Promise} Geocoding results
 */
export function debouncedGeocode(address, delay = 500) {
  let timeoutId;
  
  return new Promise((resolve) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(async () => {
      const results = await forwardGeocode(address);
      resolve(results);
    }, delay);
  });
}
