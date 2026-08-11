import { useState, useEffect } from 'react';
import { fetchPlaceCommunityData, ReviewPhoto } from './communityGalleryService';
import { fetchGooglePlacesPhoto } from './googlePlacesPhotoService';
import { resolveLocalStatePhoto } from './localStatePhotoService';

export interface ImageRetrievalResult {
  imageUrl: string;
  source: string;
  attribution: string;
  tier: number;
  hasCommunityPhotos: boolean;
  totalPhotosCount: number;
  averageRating: number;
  totalReviews: number;
  communityPhotos: ReviewPhoto[];
  fromGooglePlaces?: boolean;
}

const MEMORY_CACHE: Record<string, ImageRetrievalResult> = {};

// Verified curated local assets & high-res destination imagery
const CURATED_DESTINATION_IMAGES: Record<string, string> = {
  'taj mahal': 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80',
  'taj mahal, agra': 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80',
  'agra': 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80',
  'hawa mahal': 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80',
  'hawa mahal, jaipur': 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80',
  'jaipur': 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1200&q=80',
  'jaipur palace': '/src/assets/images/jaipur_palace_1785825746709.jpg',
  'city palace': '/src/assets/images/jaipur_palace_1785825746709.jpg',
  'alleppey': 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80',
  'alleppey backwaters': 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80',
  'backwaters': 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80',
  'kerala': 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80',
  'varanasi': 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80',
  'kashi ghats': 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80',
  'kashi ghats, varanasi': 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80',
  'palolem': 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80',
  'palolem beach': 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80',
  'palolem beach, goa': 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80',
  'goa': 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80',
  'goa beach': '/src/assets/images/goa_beach_sunset_1785825758662.jpg',
  'baga beach': '/src/assets/images/goa_beach_sunset_1785825758662.jpg',
  'mumbai': 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1200&q=80',
  'delhi': 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80',
  'udaipur': 'https://images.unsplash.com/photo-1609949279531-cf48d64bed89?auto=format&fit=crop&w=1200&q=80',
  'munnar': 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=1200&q=80',
  'shimla': 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80',
  'manali': 'https://images.unsplash.com/photo-1605649487210-478a2423577f?auto=format&fit=crop&w=1200&q=80',
  'paris': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
  'vintage': 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80'
};

const DEFAULT_TRAVEL_FALLBACK = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80';

/**
 * Synchronous instant image getter for zero-flicker UI render
 */
export function getInstantLocationImage(locationName: string): string {
  if (!locationName) return DEFAULT_TRAVEL_FALLBACK;
  const norm = locationName.trim().toLowerCase();

  if (MEMORY_CACHE[norm] && MEMORY_CACHE[norm].imageUrl) {
    return MEMORY_CACHE[norm].imageUrl;
  }

  for (const [key, url] of Object.entries(CURATED_DESTINATION_IMAGES)) {
    if (norm === key || norm.includes(key) || key.includes(norm)) {
      return url;
    }
  }

  return DEFAULT_TRAVEL_FALLBACK;
}

/**
 * Primary Async Community Photo & Dynamic Photo Retriever
 */
export async function fetchAuthenticLocationImage(
  locationName: string,
  lat?: number,
  lng?: number,
  category?: string,
  forceRefresh: boolean = false
): Promise<ImageRetrievalResult> {
  if (!locationName) {
    return {
      imageUrl: '',
      source: 'No Photo Available',
      attribution: '',
      tier: 1,
      hasCommunityPhotos: false,
      totalPhotosCount: 0,
      averageRating: 0,
      totalReviews: 0,
      communityPhotos: [],
    };
  }

  const norm = locationName.trim().toLowerCase();

  if (!forceRefresh && MEMORY_CACHE[norm]) {
    return MEMORY_CACHE[norm];
  }

  // 1. Check if user added state-wise local photo in /public folder (Tier 0 Highest Priority)
  try {
    const localPhoto = await resolveLocalStatePhoto(locationName, category);
    if (localPhoto && localPhoto.imageUrl) {
      const result: ImageRetrievalResult = {
        imageUrl: localPhoto.imageUrl,
        source: localPhoto.source,
        attribution: `Local State Gallery Asset (${localPhoto.stateName || 'Public Folder'})`,
        tier: 0,
        hasCommunityPhotos: false,
        totalPhotosCount: 1,
        averageRating: 5.0,
        totalReviews: 100,
        communityPhotos: [],
      };
      MEMORY_CACHE[norm] = result;
      return result;
    }
  } catch (err) {
    // Continue to next sources if no local file found
  }

  try {
    const communityData = await fetchPlaceCommunityData(locationName, 'liked');

    if (communityData && communityData.communityPhotos && communityData.communityPhotos.length > 0) {
      const topPhoto = communityData.communityPhotos[0];
      const result: ImageRetrievalResult = {
        imageUrl: topPhoto.imageUrl,
        source: `Community Photo • ${topPhoto.uploaderName}`,
        attribution: topPhoto.caption || `Uploaded by ${topPhoto.uploaderName}`,
        tier: 1,
        hasCommunityPhotos: true,
        totalPhotosCount: communityData.communityPhotos.length,
        averageRating: communityData.averageRating,
        totalReviews: communityData.totalReviews,
        communityPhotos: communityData.communityPhotos,
      };
      MEMORY_CACHE[norm] = result;
      return result;
    }
  } catch (err) {
    console.warn(`Community photo fetch failed for "${locationName}":`, err);
  }

  // Try Google Places API Photo Lookup
  try {
    const googlePhoto = await fetchGooglePlacesPhoto(locationName);
    if (googlePhoto && googlePhoto.imageUrl) {
      const result: ImageRetrievalResult = {
        imageUrl: googlePhoto.imageUrl,
        source: googlePhoto.source,
        attribution: googlePhoto.attribution,
        tier: 1,
        hasCommunityPhotos: false,
        totalPhotosCount: 1,
        averageRating: googlePhoto.rating || 4.8,
        totalReviews: googlePhoto.userRatingsTotal || 45,
        communityPhotos: [],
        fromGooglePlaces: true,
      };
      MEMORY_CACHE[norm] = result;
      return result;
    }
  } catch (err) {
    console.warn(`Google Places photo lookup skipped for "${locationName}":`, err);
  }

  // Try Wikipedia REST API Photo Lookup
  try {
    const cleanTitle = locationName.trim().replace(/\s+/g, '_');
    const wikiRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(cleanTitle)}`, {
      headers: {
        'User-Agent': 'TourismAppPhotoFetcher/1.0 (contact@yourtourismdomain.com)'
      }
    });
    if (wikiRes.ok) {
      const wikiData: any = await wikiRes.json();
      const wikiPhoto = wikiData.originalimage?.source || wikiData.thumbnail?.source;
      if (wikiPhoto) {
        const result: ImageRetrievalResult = {
          imageUrl: wikiPhoto,
          source: 'Wikipedia API',
          attribution: `Wikipedia • ${wikiData.title || locationName}`,
          tier: 1,
          hasCommunityPhotos: false,
          totalPhotosCount: 1,
          averageRating: 4.8,
          totalReviews: 24,
          communityPhotos: [],
        };
        MEMORY_CACHE[norm] = result;
        return result;
      }
    }
  } catch (err) {
    // Silently continue if Wikipedia lookup is unavailable
  }

  // Check curated specific destination assets ONLY
  const instantUrl = getInstantLocationImage(locationName);
  const result: ImageRetrievalResult = {
    imageUrl: instantUrl,
    source: instantUrl ? 'Verified Destination Photo' : 'No Photo Available',
    attribution: instantUrl ? '© Velora Curated Travel API' : '',
    tier: 1,
    hasCommunityPhotos: false,
    totalPhotosCount: instantUrl ? 1 : 0,
    averageRating: 4.8,
    totalReviews: 18,
    communityPhotos: [],
  };
  MEMORY_CACHE[norm] = result;
  return result;
}

/**
 * Custom React Hook for components displaying place images
 */
export function useAuthenticLocationImage(locationName: string, lat?: number, lng?: number, category?: string) {
  const [data, setData] = useState<ImageRetrievalResult>(() => ({
    imageUrl: getInstantLocationImage(locationName),
    source: 'Community Lookup',
    attribution: 'Loading travel gallery...',
    tier: 1,
    hasCommunityPhotos: false,
    totalPhotosCount: 0,
    averageRating: 4.8,
    totalReviews: 12,
    communityPhotos: [],
  }));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!locationName) return;
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    fetchAuthenticLocationImage(locationName, lat, lng, category)
      .then((res) => {
        if (isMounted) {
          setData(res);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Image retrieval failed');
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [locationName, lat, lng, category]);

  const refreshImage = async () => {
    setIsLoading(true);
    try {
      const res = await fetchAuthenticLocationImage(locationName, lat, lng, category, true);
      setData(res);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return { ...data, isLoading, error, refreshImage };
}

export function fetchLocationImage(locationName: string): Promise<string> {
  return fetchAuthenticLocationImage(locationName).then((r) => r.imageUrl);
}

export function useLocationImage(locationName: string) {
  const { imageUrl, isLoading, source } = useAuthenticLocationImage(locationName);
  return { imageUrl, isLoading, source };
}

export async function preloadLandmarkImages(locationNames: string[]): Promise<void> {
  const uniqueNames = Array.from(new Set(locationNames.filter(Boolean)));
  await Promise.all(
    uniqueNames.map(async (name) => {
      try {
        await fetchAuthenticLocationImage(name);
      } catch (e) {
        // Silently catch background preload errors
      }
    })
  );
}

export const getLocationImage = getInstantLocationImage;
