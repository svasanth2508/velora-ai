import { KNOWN_COORDINATES, lookupKnownCoordinates, Coordinates } from '../data/knownCoordinates';

export interface CachedLocation {
  query: string;
  lat: number;
  lng: number;
  displayName: string;
  state?: string;
  country?: string;
  timestamp: number;
}

const STORAGE_KEY = 'travel_twin_location_cache_v1';
const MAX_CACHE_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days cache validity

class LocationCacheService {
  private memoryCache: Map<string, CachedLocation> = new Map();

  constructor() {
    this.loadFromStorage();
  }

  private normalizeKey(query: string): string {
    return query.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '');
  }

  private loadFromStorage() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          const now = Date.now();
          Object.entries(parsed).forEach(([key, val]: [string, any]) => {
            if (val && now - val.timestamp < MAX_CACHE_AGE_MS) {
              this.memoryCache.set(key, val);
            }
          });
        }
      }
    } catch (e) {
      console.warn('Failed to load location cache from localStorage:', e);
    }
  }

  private persistToStorage() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const obj: Record<string, CachedLocation> = {};
        this.memoryCache.forEach((val, key) => {
          obj[key] = val;
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
      }
    } catch (e) {
      console.warn('Failed to persist location cache:', e);
    }
  }

  public get(query: string): CachedLocation | null {
    if (!query) return null;
    const key = this.normalizeKey(query);
    const cached = this.memoryCache.get(key);
    if (cached && Date.now() - cached.timestamp < MAX_CACHE_AGE_MS) {
      return cached;
    }
    return null;
  }

  public set(query: string, loc: Omit<CachedLocation, 'timestamp'>) {
    if (!query) return;
    const key = this.normalizeKey(query);
    const item: CachedLocation = {
      ...loc,
      timestamp: Date.now(),
    };
    this.memoryCache.set(key, item);
    this.persistToStorage();
  }

  /**
   * Precise Haversine distance in kilometers between two lat/lng coordinates
   */
  public getDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
    if (isNaN(lat1) || isNaN(lng1) || isNaN(lat2) || isNaN(lng2)) return 99999;
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Precise Geocoding Filter: Validates location candidate against reference region or target query hints.
   * Prevents cross-region location mismatches (e.g. returning Goa locations when searching Dharmapuri, Tamil Nadu).
   */
  public isRegionMatch(
    query: string,
    candidate: { lat: number; lng: number; displayName?: string; state?: string },
    referenceCenter?: { lat: number; lng: number; maxRadiusKm?: number }
  ): boolean {
    const qLower = query.toLowerCase().trim();

    // 1. Distance constraint check if a reference center is provided
    if (
      referenceCenter &&
      typeof referenceCenter.lat === 'number' &&
      typeof referenceCenter.lng === 'number' &&
      !isNaN(referenceCenter.lat) &&
      !isNaN(referenceCenter.lng)
    ) {
      const maxDist = referenceCenter.maxRadiusKm || 100; // Default 100km radius threshold for regional proximity
      const dist = this.getDistanceKm(referenceCenter.lat, referenceCenter.lng, candidate.lat, candidate.lng);
      if (dist > maxDist) {
        return false;
      }
    }

    // 2. Specific state/region keywords mismatch checks
    if (qLower.includes('dharmapuri') || qLower.includes('tamil nadu') || qLower.includes('salem') || qLower.includes('karur')) {
      const disp = (candidate.displayName || '').toLowerCase();
      const state = (candidate.state || '').toLowerCase();
      if (disp.includes('goa') || state.includes('goa') || disp.includes('delhi') || state.includes('delhi')) {
        return false;
      }
    }

    return true;
  }

  /**
   * Cached & Filtered Geocode Resolution
   */
  public async resolveLocation(
    query: string,
    referenceCenter?: { lat: number; lng: number; maxRadiusKm?: number }
  ): Promise<CachedLocation | null> {
    if (!query || !query.trim()) return null;

    // 1. Check memory & localStorage cache
    const cached = this.get(query);
    if (cached) {
      if (this.isRegionMatch(query, cached, referenceCenter)) {
        return cached;
      }
    }

    // 2. Check local verified database
    const known = lookupKnownCoordinates(query);
    if (known) {
      const loc: CachedLocation = {
        query,
        lat: known.lat,
        lng: known.lng,
        displayName: known.name || query,
        state: known.state,
        timestamp: Date.now(),
      };
      this.set(query, loc);
      return loc;
    }

    // 3. Query OpenStreetMap Nominatim with region filter
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`;
      const res = await fetch(url, { headers: { 'User-Agent': 'TravelTwinAI/1.0' } });
      if (res.ok) {
        const results = await res.json();
        if (Array.isArray(results) && results.length > 0) {
          for (const item of results) {
            const candidate = {
              lat: parseFloat(item.lat),
              lng: parseFloat(item.lon),
              displayName: item.display_name || query,
              state: item.address?.state || '',
            };

            if (this.isRegionMatch(query, candidate, referenceCenter)) {
              const loc: CachedLocation = {
                query,
                lat: candidate.lat,
                lng: candidate.lng,
                displayName: candidate.displayName,
                state: candidate.state,
                timestamp: Date.now(),
              };
              this.set(query, loc);
              return loc;
            }
          }
        }
      }
    } catch (err) {
      console.warn('Geocoding fetch error:', err);
    }

    return null;
  }
}

export const locationCacheService = new LocationCacheService();
