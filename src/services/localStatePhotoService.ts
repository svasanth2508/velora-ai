/**
 * Local State-Wise Photo Service
 * Automatically maps and resolves state-wise local photos placed in the /public folder
 * (e.g. /karnataka/hampi.jpg, /kerala/munnar.jpg, /public/{state_name}/{place_name}.jpg)
 */

import { findMappedPublicAsset, triggerPublicDirectoryScan } from './publicDirectoryScanner';

/**
 * Normalizes state or place names into filesystem-friendly folder/file slugs
 * e.g., "Tamil Nadu" -> "tamil_nadu", "Taj Mahal" -> "taj_mahal"
 */
export function toSlug(text: string): string {
  if (!text) return '';
  return text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

/**
 * Generates potential local public image paths for a given location and optional state name.
 */
export function getPossibleLocalImageUrls(locationName: string, stateName?: string): string[] {
  if (!locationName) return [];

  const placeSlug = toSlug(locationName);
  const stateSlug = stateName ? toSlug(stateName) : '';

  const paths: string[] = [];

  if (stateSlug) {
    paths.push(`/${stateSlug}/${placeSlug}.jpg`);
    paths.push(`/${stateSlug}/${placeSlug}.jpeg`);
    paths.push(`/${stateSlug}/${placeSlug}.png`);
    paths.push(`/${stateSlug}/${placeSlug}.webp`);
    paths.push(`/public/${stateSlug}/${placeSlug}.jpg`);
    paths.push(`/public/${stateSlug}/${placeSlug}.png`);
  }

  // Direct root public image paths
  paths.push(`/${placeSlug}.jpg`);
  paths.push(`/${placeSlug}.jpeg`);
  paths.push(`/${placeSlug}.png`);
  paths.push(`/${placeSlug}.webp`);
  paths.push(`/images/${placeSlug}.jpg`);
  paths.push(`/images/${placeSlug}.png`);

  return paths;
}

/**
 * Tests if a local static image file exists in the browser
 */
export async function checkLocalImageExists(url: string): Promise<boolean> {
  if (!url) return false;
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

/**
 * Attempts to resolve a matching local photo from the /public directory using automated scanner
 */
export async function resolveLocalStatePhoto(
  locationName: string,
  stateName?: string
): Promise<{ imageUrl: string; source: string; stateName?: string; locationId?: string } | null> {
  // 1. Check automated public directory scanner index first
  try {
    await triggerPublicDirectoryScan();
    const mapped = findMappedPublicAsset(locationName, stateName);
    if (mapped && mapped.url) {
      const isValid = await checkLocalImageExists(mapped.url);
      if (isValid) {
        return {
          imageUrl: mapped.url,
          source: `Scanned Public Asset • ${mapped.stateName} Folder (${mapped.fileName})`,
          stateName: mapped.stateName,
          locationId: mapped.locationId,
        };
      }
    }
  } catch (scanErr) {
    // Continue to path probes
  }

  // 2. Direct path probes fallback
  const possiblePaths = getPossibleLocalImageUrls(locationName, stateName);

  for (const url of possiblePaths) {
    const exists = await checkLocalImageExists(url);
    if (exists) {
      return {
        imageUrl: url,
        source: `Local Public Asset (${stateName ? stateName + ' Folder' : 'Public Directory'})`,
      };
    }
  }

  return null;
}
