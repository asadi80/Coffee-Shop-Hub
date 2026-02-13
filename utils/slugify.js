// src/utils/slugify.js

/**
 * Generate URL-friendly slug from string
 * @param {String} text - Text to slugify
 * @returns {String} Slug
 */
export function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

/**
 * Generate unique slug
 * @param {String} text - Text to slugify
 * @param {Function} checkExists - Function to check if slug exists
 * @returns {String} Unique slug
 */
export async function generateUniqueSlug(text, checkExists) {
  let slug = slugify(text);
  let counter = 1;
  let uniqueSlug = slug;

  while (await checkExists(uniqueSlug)) {
    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }

  return uniqueSlug;
}

/**
 * Extract slug from URL
 * @param {String} url - URL containing slug
 * @returns {String} Extracted slug
 */
export function extractSlug(url) {
  const parts = url.split('/');
  return parts[parts.length - 1];
}
