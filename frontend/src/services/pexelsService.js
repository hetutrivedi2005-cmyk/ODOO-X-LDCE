import axios from 'axios';

// In-memory cache mapping unique destination key to dynamic Pexels image URL
const imageCache = {};

// Development-only check for duplicate resolved URLs
const resolvedUrls = {}; // URL -> cacheKey

// Standard fallback travel placeholder
const DEFAULT_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=600&q=80';

const API_KEY = import.meta.env.VITE_PEXELS_API_KEY;

export const pexelsService = {
  /**
   * Fetch destination photograph from Pexels API.
   * Caches resolved URL in memory for efficiency.
   * Falls back gracefully to original metadata image or generic placeholder.
   * 
   * @param {string} name - City/Destination name
   * @param {string} country - Country name
   * @param {string} backupUrl - Database metadata image URL
   */
  async getDestinationImage(name, country, backupUrl) {
    const cleanName = name ? name.trim() : '';
    const cleanCountry = country ? country.trim() : '';

    if (!cleanName && !cleanCountry) {
      return backupUrl || DEFAULT_FALLBACK_IMAGE;
    }

    // Cache key format requirement: name|country
    const cacheKey = `${cleanName}|${cleanCountry}`;
    if (imageCache[cacheKey]) {
      return imageCache[cacheKey];
    }

    if (!API_KEY) {
      console.warn('[pexelsService] VITE_PEXELS_API_KEY environment variable is not configured.');
      return backupUrl || DEFAULT_FALLBACK_IMAGE;
    }

    // Build the query dynamically: "${city}, ${country} travel landmark"
    let searchQuery = '';
    if (cleanName && cleanCountry) {
      searchQuery = `${cleanName}, ${cleanCountry} travel landmark`;
    } else if (cleanName) {
      searchQuery = `${cleanName} travel landmark`;
    } else if (cleanCountry) {
      searchQuery = `${cleanCountry} travel landmark`;
    } else {
      searchQuery = 'travel destination';
    }

    try {
      const response = await axios.get('https://api.pexels.com/v1/search', {
        headers: {
          Authorization: API_KEY,
        },
        params: {
          query: searchQuery,
          per_page: 5,
        },
      });

      const photos = response.data?.photos || [];
      // Select a photo matching landscape aspect ratio (width > height)
      const landscapePhoto = photos.find(p => p.width > p.height);
      const selectedPhoto = landscapePhoto || photos[0];

      if (selectedPhoto) {
        const imageUrl = selectedPhoto.src?.large || selectedPhoto.src?.original || selectedPhoto.src?.large2x;
        if (imageUrl) {
          // Development-only duplicate check
          const isDev = import.meta.env.DEV || process.env.NODE_ENV === 'development';
          if (isDev && resolvedUrls[imageUrl] && resolvedUrls[imageUrl] !== cacheKey) {
            console.warn(`Duplicate destination image detected for keys: ["${resolvedUrls[imageUrl]}", "${cacheKey}"] with URL: ${imageUrl}`);
          }
          resolvedUrls[imageUrl] = cacheKey;

          imageCache[cacheKey] = imageUrl;
          return imageUrl;
        }
      }

      console.warn(`[pexelsService] No photo results found on Pexels for search query: "${searchQuery}".`);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        console.error('[pexelsService] Pexels API key authentication failed (401/403).');
      } else if (err.response?.status === 429) {
        console.warn('[pexelsService] Pexels rate limits hit (429).');
      } else {
        console.error('[pexelsService] Error querying Pexels:', err.message);
      }
    }

    // Graceful fallback hierarchy
    const finalUrl = backupUrl || DEFAULT_FALLBACK_IMAGE;
    imageCache[cacheKey] = finalUrl;
    return finalUrl;
  }
};

export default pexelsService;
