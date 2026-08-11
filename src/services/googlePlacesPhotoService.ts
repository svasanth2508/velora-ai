/**
 * Google Places Photo Integration Service
 * Fetches real, authentic high-resolution photos directly from Google Places API
 * for any landmark, city, or tourist attraction in India or globally.
 */

declare global {
  interface Window {
    google?: any;
  }
}

import { getPhotoFromIndexedDb, savePhotoToIndexedDb } from './indexedDbPhotoCache';

export interface GooglePlacePhotoResult {
  imageUrl: string;
  source: string;
  attribution: string;
  placeId?: string;
  rating?: number;
  userRatingsTotal?: number;
  formattedAddress?: string;
  fromGooglePlaces: boolean;
}

const PLACES_PHOTO_CACHE: Record<string, GooglePlacePhotoResult> = {};
let googleMapsScriptLoadingPromise: Promise<void> | null = null;

/**
 * Dynamically loads the Google Maps JavaScript API with Places library if an API key is available
 */
export function loadGoogleMapsPlacesApi(): Promise<void> {
  if (typeof window !== 'undefined' && window.google?.maps?.places) {
    return Promise.resolve();
  }

  if (googleMapsScriptLoadingPromise) {
    return googleMapsScriptLoadingPromise;
  }

  const apiKey =
    process.env.GOOGLE_MAPS_PLATFORM_KEY ||
    (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
    (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
    '';

  if (!apiKey || apiKey === 'YOUR_API_KEY') {
    return Promise.reject(new Error('Google Maps API Key not configured in environment'));
  }

  googleMapsScriptLoadingPromise = new Promise((resolve, reject) => {
    // Check if script already exists
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      const checkInterval = setInterval(() => {
        if (window.google?.maps?.places) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
      setTimeout(() => {
        clearInterval(checkInterval);
        if (window.google?.maps?.places) resolve();
        else reject(new Error('Google Maps script load timeout'));
      }, 5000);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
      apiKey
    )}&libraries=places&version=weekly`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      if (window.google?.maps?.places) {
        resolve();
      } else {
        reject(new Error('Google Maps Places library not available after script load'));
      }
    };

    script.onerror = () => {
      reject(new Error('Failed to load Google Maps JS API script'));
    };

    document.head.appendChild(script);
  });

  return googleMapsScriptLoadingPromise;
}

/**
 * Search Google Places API for a place query and extract its top photo URL
 */
export async function fetchGooglePlacesPhoto(
  searchQuery: string
): Promise<GooglePlacePhotoResult | null> {
  if (!searchQuery || !searchQuery.trim()) return null;

  const normalizedQuery = searchQuery.trim().toLowerCase();

  // 1. Check in-memory cache
  if (PLACES_PHOTO_CACHE[normalizedQuery]) {
    return PLACES_PHOTO_CACHE[normalizedQuery];
  }

  // 2. Check IndexedDB persistent storage
  try {
    const idbCached = await getPhotoFromIndexedDb(normalizedQuery);
    if (idbCached && idbCached.imageUrl) {
      const result: GooglePlacePhotoResult = {
        imageUrl: idbCached.imageUrl,
        source: idbCached.source || 'Google Places API (IndexedDB Persistent Cache)',
        attribution: idbCached.attribution || 'Google Places Contributor',
        placeId: idbCached.googlePlaceId,
        rating: idbCached.rating,
        userRatingsTotal: idbCached.userRatingsTotal,
        formattedAddress: idbCached.formattedAddress,
        fromGooglePlaces: true,
      };
      PLACES_PHOTO_CACHE[normalizedQuery] = result;
      return result;
    }
  } catch (idbErr) {
    // Continue to API fetch if IndexedDB fails
  }

  try {
    await loadGoogleMapsPlacesApi();

    if (!window.google?.maps?.places) {
      return null;
    }

    // Dummy element required for PlacesService in Google Maps JS API
    const dummyDiv = document.createElement('div');
    const service = new window.google.maps.places.PlacesService(dummyDiv);

    return new Promise((resolve) => {
      const request: any = {
        query: searchQuery,
      };

      service.textSearch(request, (results, status) => {
        if (
          status === window.google.maps.places.PlacesServiceStatus.OK &&
          results &&
          results.length > 0
        ) {
          const topResult = results[0];

          if (topResult.photos && topResult.photos.length > 0) {
            const photo = topResult.photos[0];
            // Support both getUrl and getURI per Google Maps JS API standard
            const photoUrl =
              typeof photo.getUrl === 'function'
                ? photo.getUrl({ maxWidth: 1200, maxHeight: 800 })
                : (photo as any).getURI
                ? (photo as any).getURI({ maxWidth: 1200, maxHeight: 800 })
                : null;

            if (photoUrl) {
              let attribution = 'Google Places API';
              if (photo.html_attributions && photo.html_attributions.length > 0) {
                // Strip HTML tags from attribution string
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = photo.html_attributions[0];
                attribution = tempDiv.textContent || tempDiv.innerText || 'Google Places Contributor';
              }

              const result: GooglePlacePhotoResult = {
                imageUrl: photoUrl,
                source: 'Google Places API • Verified Photography',
                attribution: attribution,
                placeId: topResult.place_id,
                rating: topResult.rating,
                userRatingsTotal: topResult.user_ratings_total,
                formattedAddress: topResult.formatted_address,
                fromGooglePlaces: true,
              };

              PLACES_PHOTO_CACHE[normalizedQuery] = result;

              // Save asynchronously to IndexedDB persistent storage by attraction ID & place ID
              savePhotoToIndexedDb(normalizedQuery, {
                imageUrl: photoUrl,
                googlePlaceId: topResult.place_id,
                source: 'Google Places API (IndexedDB Cached)',
                attribution: attribution,
                rating: topResult.rating,
                userRatingsTotal: topResult.user_ratings_total,
                formattedAddress: topResult.formatted_address,
                fromGooglePlaces: true,
              }).catch(() => {});

              return resolve(result);
            }
          }
        }
        resolve(null);
      });
    });
  } catch (err) {
    // API Key not present or network error
    return null;
  }
}
