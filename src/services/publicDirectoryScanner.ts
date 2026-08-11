/// <reference types="vite/client" />

/**
 * Automated Public Directory Scanner Service
 * Automatically scans the /public directory for state-wise photos, maps images
 * to state and location IDs, and prioritizes these assets over API-fetched images.
 */

export interface ScannedPublicImage {
  locationId: string;
  locationName: string;
  fileName: string;
  url: string;
  fullPath: string;
  stateId: string;
  stateName: string;
  ext?: string;
}

export interface PublicDirectoryScanResult {
  success: boolean;
  scannedAt: string;
  publicDirExists: boolean;
  totalImagesCount: number;
  statesCount: number;
  states: Record<string, ScannedPublicImage[]>;
  locationIndex: Record<string, ScannedPublicImage>;
  message?: string;
}

// In-memory runtime index for scanned assets
let LATEST_SCAN_RESULT: PublicDirectoryScanResult | null = null;
let SCAN_PROMISE: Promise<PublicDirectoryScanResult> | null = null;

/**
 * Normalizes text into a clean location or state ID slug
 * e.g., "Taj Mahal, Agra" -> "taj_mahal"
 */
export function normalizeIdSlug(text: string): string {
  if (!text) return '';
  return text
    .trim()
    .toLowerCase()
    .replace(/,\s*india$/i, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

/**
 * Client-Side Vite Build-Time Automated Glob Scanner
 * Scans all image assets under /public synchronously at app launch
 */
export function scanViteBuildTimePublicAssets(): PublicDirectoryScanResult {
  const globIndex: Record<string, ScannedPublicImage> = {};
  const globStates: Record<string, ScannedPublicImage[]> = {};
  let imageCount = 0;

  try {
    // Vite's import.meta.glob scans public files
    const globFn = (import.meta as any).glob;
    if (typeof globFn === 'function') {
      const publicGlob = globFn('/public/**/*.{jpg,jpeg,png,webp,svg,JPG,JPEG,PNG,WEBP}', {
        eager: true,
        query: '?url',
        import: 'default',
      });

      Object.keys(publicGlob).forEach((pathKey) => {
        // e.g. /public/karnataka/hampi.jpg or /public/taj_mahal.jpg
        const assetUrl = publicGlob[pathKey] as string;
        const cleanPath = pathKey.replace(/^\/public\//, '').replace(/^\//, ''); // e.g. "karnataka/hampi.jpg"
        const parts = cleanPath.split('/');

        let stateFolder = 'general';
        let fileName = cleanPath;

        if (parts.length > 1) {
          stateFolder = parts[0];
          fileName = parts[parts.length - 1];
        }

        const ext = fileName.substring(fileName.lastIndexOf('.'));
        const baseName = fileName.substring(0, fileName.lastIndexOf('.'));
        const locationId = normalizeIdSlug(baseName);
        const stateId = normalizeIdSlug(stateFolder);

        const record: ScannedPublicImage = {
          locationId,
          locationName: baseName.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
          fileName,
          url: assetUrl || `/${cleanPath}`,
          fullPath: pathKey,
          stateId,
          stateName: stateFolder.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
          ext,
        };

        if (!globStates[stateId]) globStates[stateId] = [];
        globStates[stateId].push(record);
        globIndex[locationId] = record;
        globIndex[`${stateId}_${locationId}`] = record;
        imageCount++;
      });
    }
  } catch (err) {
    // Glob scan fallback
  }

  return {
    success: true,
    scannedAt: new Date().toISOString(),
    publicDirExists: true,
    totalImagesCount: imageCount,
    statesCount: Object.keys(globStates).length,
    states: globStates,
    locationIndex: globIndex,
    message: `Vite Build-Time Scanner mapped ${imageCount} public image assets.`,
  };
}

/**
 * Triggers an automated scan of the /public directory via server endpoint + Vite build glob
 */
export async function triggerPublicDirectoryScan(forceRefresh = false): Promise<PublicDirectoryScanResult> {
  if (LATEST_SCAN_RESULT && !forceRefresh) {
    return LATEST_SCAN_RESULT;
  }

  if (SCAN_PROMISE && !forceRefresh) {
    return SCAN_PROMISE;
  }

  SCAN_PROMISE = (async () => {
    // 1. Start with Vite Build-time static scan
    const viteStaticScan = scanViteBuildTimePublicAssets();

    // 2. Fetch live server public directory scan
    try {
      const res = await fetch('/api/images/scan-public-dir');
      if (res.ok) {
        const serverData: PublicDirectoryScanResult = await res.json();
        if (serverData && serverData.success) {
          // Merge server scanned results with static glob results
          const mergedLocationIndex = { ...viteStaticScan.locationIndex, ...(serverData.locationIndex || {}) };
          const mergedStates = { ...viteStaticScan.states, ...(serverData.states || {}) };
          const totalCount = Math.max(viteStaticScan.totalImagesCount, serverData.totalImagesCount);

          LATEST_SCAN_RESULT = {
            ...serverData,
            totalImagesCount: totalCount,
            states: mergedStates,
            locationIndex: mergedLocationIndex,
          };
          return LATEST_SCAN_RESULT;
        }
      }
    } catch (err) {
      console.warn('Server public directory scan API unavailable, falling back to build-time glob scan:', err);
    }

    LATEST_SCAN_RESULT = viteStaticScan;
    return viteStaticScan;
  })();

  return SCAN_PROMISE;
}

/**
 * High Priority Asset Matcher
 * Finds matching public directory image mapped to location & state IDs
 */
export function findMappedPublicAsset(
  locationName: string,
  stateName?: string
): ScannedPublicImage | null {
  if (!locationName) return null;

  const locId = normalizeIdSlug(locationName);
  const stateId = stateName ? normalizeIdSlug(stateName) : '';

  // 1. Check in-memory scan index if available
  if (LATEST_SCAN_RESULT && LATEST_SCAN_RESULT.locationIndex) {
    const idx = LATEST_SCAN_RESULT.locationIndex;

    // Direct state_location match
    if (stateId && idx[`${stateId}_${locId}`]) {
      return idx[`${stateId}_${locId}`];
    }

    // Direct location match
    if (idx[locId]) {
      return idx[locId];
    }

    // Fuzzy matching over location keys
    for (const [key, record] of Object.entries(idx)) {
      if (locId.includes(key) || key.includes(locId)) {
        if (!stateId || record.stateId === stateId) {
          return record;
        }
      }
    }
  }

  return null;
}

/**
 * Gets cached scan results or synchronously triggers initial scan
 */
export function getLatestScanResult(): PublicDirectoryScanResult {
  if (LATEST_SCAN_RESULT) return LATEST_SCAN_RESULT;
  return scanViteBuildTimePublicAssets();
}
