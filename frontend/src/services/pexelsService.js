import axios from 'axios';

// In-memory cache to avoid duplicate Pexels requests during the session
const imageCache = {};

// Standard generic fallback placeholder
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
    if (!name) return backupUrl || DEFAULT_FALLBACK_IMAGE;

    const cacheKey = `${name.trim()},${(country || '').trim()}`;
    if (imageCache[cacheKey]) {
      return imageCache[cacheKey];
    }

    if (!API_KEY) {
      console.warn('[pexelsService] VITE_PEXELS_API_KEY environment variable is not configured.');
      return backupUrl || DEFAULT_FALLBACK_IMAGE;
    }

    try {
      const searchQuery = `${name.trim()} ${country ? country.trim() : ''}`.trim();
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
        // Use large/large2x or original sizes
        const imageUrl = selectedPhoto.src?.large || selectedPhoto.src?.original || selectedPhoto.src?.large2x;
        if (imageUrl) {
          imageCache[cacheKey] = imageUrl;
          return imageUrl;
        }
      }

      console.warn(`[pexelsService] No photo results found on Pexels for search: "${searchQuery}".`);
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
