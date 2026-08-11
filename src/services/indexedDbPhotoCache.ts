/**
 * IndexedDB Persistent Storage Layer for Google Places Photos
 * Caches high-resolution Google Places photos by attraction ID / place query
 * to prevent redundant API calls, support offline capability, and drastically improve load times.
 */

export interface CachedIndexedDbPhoto {
  attractionId: string; // Query or place key (e.g., 'taj_mahal', 'amber_fort', 'ChIJ...')
  imageUrl: string;
  googlePlaceId?: string;
  source: string;
  attribution: string;
  rating?: number;
  userRatingsTotal?: number;
  formattedAddress?: string;
  hits: number;
  cachedAt: number; // Timestamp ms
  expiresAt: number; // TTL timestamp ms (e.g. 30 days)
  fromGooglePlaces: boolean;
}

const DB_NAME = 'GooglePlacesPhotoStorageDB';
const DB_VERSION = 1;
const STORE_NAME = 'google_places_photos_by_id';
const DEFAULT_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days cache retention

let dbPromise: Promise<IDBDatabase> | null = null;

function getDb(): Promise<IDBDatabase> {
  if (typeof window === 'undefined' || !('indexedDB' in window)) {
    return Promise.reject(new Error('IndexedDB is not supported in this environment'));
  }

  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'attractionId' });
        store.createIndex('googlePlaceId', 'googlePlaceId', { unique: false });
        store.createIndex('cachedAt', 'cachedAt', { unique: false });
        store.createIndex('hits', 'hits', { unique: false });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = (event) => {
      console.warn('IndexedDB failed to open:', request.error);
      reject(request.error);
    };
  });

  return dbPromise;
}

/**
 * Normalizes an attraction ID or query into a clean key string
 */
export function normalizeAttractionId(rawId: string): string {
  if (!rawId) return 'unknown';
  return rawId.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
}

/**
 * Retrieves a photo from IndexedDB by attraction ID / query or place ID
 */
export async function getPhotoFromIndexedDb(
  rawAttractionId: string
): Promise<CachedIndexedDbPhoto | null> {
  const attractionId = normalizeAttractionId(rawAttractionId);
  try {
    const db = await getDb();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const getReq = store.get(attractionId);

      getReq.onsuccess = () => {
        const record = getReq.result as CachedIndexedDbPhoto | undefined;
        if (!record) {
          resolve(null);
          return;
        }

        // Check TTL expiration
        if (record.expiresAt && Date.now() > record.expiresAt) {
          store.delete(attractionId);
          resolve(null);
          return;
        }

        // Increment hit count
        record.hits = (record.hits || 0) + 1;
        store.put(record);

        resolve(record);
      };

      getReq.onerror = () => {
        resolve(null);
      };
    });
  } catch (err) {
    return null;
  }
}

/**
 * Saves a Google Places photo record into IndexedDB persistent storage
 */
export async function savePhotoToIndexedDb(
  rawAttractionId: string,
  photoData: {
    imageUrl: string;
    googlePlaceId?: string;
    source?: string;
    attribution?: string;
    rating?: number;
    userRatingsTotal?: number;
    formattedAddress?: string;
    fromGooglePlaces?: boolean;
  },
  ttlMs: number = DEFAULT_TTL_MS
): Promise<CachedIndexedDbPhoto | null> {
  if (!photoData.imageUrl) return null;

  const attractionId = normalizeAttractionId(rawAttractionId);
  const now = Date.now();

  const record: CachedIndexedDbPhoto = {
    attractionId,
    imageUrl: photoData.imageUrl,
    googlePlaceId: photoData.googlePlaceId || photoData.googlePlaceId,
    source: photoData.source || 'Google Places API (Cached in IndexedDB)',
    attribution: photoData.attribution || 'Google Places Contributor',
    rating: photoData.rating,
    userRatingsTotal: photoData.userRatingsTotal,
    formattedAddress: photoData.formattedAddress,
    hits: 1,
    cachedAt: now,
    expiresAt: now + ttlMs,
    fromGooglePlaces: photoData.fromGooglePlaces ?? true,
  };

  try {
    const db = await getDb();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const putReq = store.put(record);

      putReq.onsuccess = () => {
        resolve(record);
      };

      putReq.onerror = () => {
        console.warn('Failed to save photo to IndexedDB:', putReq.error);
        resolve(null);
      };
    });
  } catch (err) {
    return null;
  }
}

/**
 * Retrieves all cached photos stored in IndexedDB
 */
export async function getAllIndexedDbPhotos(): Promise<CachedIndexedDbPhoto[]> {
  try {
    const db = await getDb();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();

      req.onsuccess = () => {
        resolve((req.result as CachedIndexedDbPhoto[]) || []);
      };

      req.onerror = () => {
        resolve([]);
      };
    });
  } catch (err) {
    return [];
  }
}

/**
 * Deletes a cached photo by attraction ID
 */
export async function deleteIndexedDbPhoto(rawAttractionId: string): Promise<boolean> {
  const attractionId = normalizeAttractionId(rawAttractionId);
  try {
    const db = await getDb();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const delReq = store.delete(attractionId);

      delReq.onsuccess = () => resolve(true);
      delReq.onerror = () => resolve(false);
    });
  } catch (err) {
    return false;
  }
}

/**
 * Clears all cached Google Places photos from IndexedDB
 */
export async function clearAllIndexedDbPhotos(): Promise<boolean> {
  try {
    const db = await getDb();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const clearReq = store.clear();

      clearReq.onsuccess = () => resolve(true);
      clearReq.onerror = () => resolve(false);
    });
  } catch (err) {
    return false;
  }
}

/**
 * Gets IndexedDB storage stats
 */
export async function getIndexedDbStats(): Promise<{
  totalCount: number;
  totalHits: number;
  dbName: string;
  storeName: string;
}> {
  const photos = await getAllIndexedDbPhotos();
  const totalHits = photos.reduce((acc, curr) => acc + (curr.hits || 0), 0);
  return {
    totalCount: photos.length,
    totalHits,
    dbName: DB_NAME,
    storeName: STORE_NAME,
  };
}
