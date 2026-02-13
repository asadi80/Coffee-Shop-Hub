// src/utils/validation.js

/**
 * Validate email format
 * @param {String} email - Email to validate
 * @returns {Boolean}
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 * @param {String} password - Password to validate
 * @returns {Object} { isValid, errors }
 */
export function validatePassword(password) {
  const errors = [];

  if (!password) {
    errors.push('Password is required');
    return { isValid: false, errors };
  }

  if (password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }

  if (password.length > 128) {
    errors.push('Password must be less than 128 characters');
  }

  // Optional: Add more strength requirements
  // if (!/[A-Z]/.test(password)) {
  //   errors.push('Password must contain at least one uppercase letter');
  // }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate phone number
 * @param {String} phone - Phone number to validate
 * @returns {Boolean}
 */
export function isValidPhone(phone) {
  if (!phone) return true; // Optional field
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

/**
 * Validate URL
 * @param {String} url - URL to validate
 * @returns {Boolean}
 */
export function isValidUrl(url) {
  if (!url) return true; // Optional field
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate coordinates
 * @param {Number} longitude - Longitude
 * @param {Number} latitude - Latitude
 * @returns {Boolean}
 */
export function isValidCoordinates(longitude, latitude) {
  return (
    typeof longitude === 'number' &&
    typeof latitude === 'number' &&
    longitude >= -180 &&
    longitude <= 180 &&
    latitude >= -90 &&
    latitude <= 90
  );
}

/**
 * Validate time format (HH:MM)
 * @param {String} time - Time string
 * @returns {Boolean}
 */
export function isValidTime(time) {
  if (!time) return true;
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
}

/**
 * Validate shop data
 * @param {Object} data - Shop data
 * @returns {Object} { isValid, errors }
 */
export function validateShopData(data) {
  const errors = {};

  // Name validation
  if (!data.name || data.name.trim().length === 0) {
    errors.name = 'Shop name is required';
  } else if (data.name.length > 200) {
    errors.name = 'Shop name must be less than 200 characters';
  }

  // Description validation
  if (!data.description || data.description.trim().length === 0) {
    errors.description = 'Description is required';
  } else if (data.description.length > 2000) {
    errors.description = 'Description must be less than 2000 characters';
  }

  // Address validation
  if (!data.address || !data.address.fullAddress) {
    errors.address = 'Full address is required';
  }

  // Coordinates validation
  if (!data.location || !data.location.coordinates) {
    errors.location = 'Location coordinates are required';
  } else {
    const [lng, lat] = data.location.coordinates;
    if (!isValidCoordinates(lng, lat)) {
      errors.location = 'Invalid coordinates';
    }
  }

  // Phone validation
  if (data.phone && !isValidPhone(data.phone)) {
    errors.phone = 'Invalid phone number';
  }

  // Email validation
  if (data.email && !isValidEmail(data.email)) {
    errors.email = 'Invalid email address';
  }

  // Social links validation
  if (data.socialLinks) {
    if (data.socialLinks.website && !isValidUrl(data.socialLinks.website)) {
      errors.website = 'Invalid website URL';
    }
    if (data.socialLinks.facebook && !isValidUrl(data.socialLinks.facebook)) {
      errors.facebook = 'Invalid Facebook URL';
    }
    if (data.socialLinks.instagram && !isValidUrl(data.socialLinks.instagram)) {
      errors.instagram = 'Invalid Instagram URL';
    }
    if (data.socialLinks.twitter && !isValidUrl(data.socialLinks.twitter)) {
      errors.twitter = 'Invalid Twitter URL';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validate menu item data
 * @param {Object} data - Menu item data
 * @returns {Object} { isValid, errors }
 */
export function validateMenuItemData(data) {
  const errors = {};

  if (!data.name || data.name.trim().length === 0) {
    errors.name = 'Item name is required';
  } else if (data.name.length > 200) {
    errors.name = 'Item name must be less than 200 characters';
  }

  if (!data.price || data.price < 0) {
    errors.price = 'Valid price is required';
  }

  if (!data.categoryId) {
    errors.categoryId = 'Category is required';
  }

  if (data.description && data.description.length > 1000) {
    errors.description = 'Description must be less than 1000 characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Sanitize string input
 * @param {String} str - String to sanitize
 * @returns {String}
 */
export function sanitizeString(str) {
  if (!str) return '';
  return str.trim().replace(/[<>]/g, '');
}

/**
 * Validate file size
 * @param {Number} size - File size in bytes
 * @param {Number} maxSize - Max size in MB
 * @returns {Boolean}
 */
export function isValidFileSize(size, maxSize = 5) {
  const maxBytes = maxSize * 1024 * 1024;
  return size <= maxBytes;
}

/**
 * Validate image file type
 * @param {String} type - MIME type
 * @returns {Boolean}
 */
export function isValidImageType(type) {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  return validTypes.includes(type);
}
