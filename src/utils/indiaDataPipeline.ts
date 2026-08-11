import {
  ALL_INDIAN_ATTRACTIONS,
  IndianAttractionRecord,
  INDIAN_CITY_DETAILS
} from '../data/indiaTourismDataset';
import {
  ALL_INDIAN_HOTELS,
  IndianHotelRecord
} from '../data/indianHotelsDataset';
import {
  ALL_INDIAN_RESTAURANTS,
  IndianRestaurantRecord
} from '../data/indianRestaurantsDataset';

/**
 * Coordinate Validation & Geo Types
 */
export interface Coordinates {
  lat: number;
  lng: number;
}

export type GeoConfidence = 'EXACT' | 'APPROXIMATE' | 'CITY_CENTER_FALLBACK' | 'INVALID';

export interface CoordinateValidationResult {
  isValid: boolean;
  coordinates: Coordinates;
  confidence: GeoConfidence;
  warnings?: string[];
}

/**
 * Standardized Processed Entity Interfaces
 */
export type HotelCategoryTier = 'Luxury' | 'Premium' | 'Mid-Range' | 'Budget';
export type DiningCategoryTier = 'Fine Dining' | 'Casual Dining' | 'Quick Service & Cafes' | 'Budget Eats';
export type AttractionCategoryTier = 'UNESCO & Heritage' | 'Spiritual & Cultural' | 'Nature & Scenic' | 'Modern & Urban' | 'Forts & Palaces';

export interface ProcessedAttraction extends IndianAttractionRecord {
  coordinates: Coordinates;
  geoConfidence: GeoConfidence;
  categoryTier: AttractionCategoryTier;
  costCategory: 'Free' | 'Budget' | 'Premium';
  tags: string[];
}

export interface ProcessedHotel extends IndianHotelRecord {
  coordinates: Coordinates;
  geoConfidence: GeoConfidence;
  categoryTier: HotelCategoryTier;
  hasPool: boolean;
  hasBreakfast: boolean;
  hasWifi: boolean;
  hasSpa: boolean;
  tags: string[];
}

export interface ProcessedRestaurant extends IndianRestaurantRecord {
  coordinates: Coordinates;
  geoConfidence: GeoConfidence;
  categoryTier: DiningCategoryTier;
  primaryCuisineCluster: string;
  tags: string[];
}

export interface IngestionSummary {
  timestamp: string;
  totalRecordsProcessed: number;
  attractions: {
    total: number;
    validCoordinatesCount: number;
    fallbackCoordinatesCount: number;
    freeEntryCount: number;
  };
  hotels: {
    total: number;
    validCoordinatesCount: number;
    averageNightlyRateInr: number;
    luxuryCount: number;
  };
  restaurants: {
    total: number;
    validCoordinatesCount: number;
    averageCostForTwoInr: number;
    onlineDeliveryCount: number;
  };
  cityBreakdown: Record<string, { attractions: number; hotels: number; restaurants: number }>;
}

export interface IngestionResult<T> {
  data: T[];
  validCount: number;
  warnings: string[];
  processedAt: string;
}

/**
 * Approximate City Center Coordinates for India Geo-Validation Fallback
 */
export const KNOWN_INDIAN_CITY_COORDINATES: Record<string, Coordinates> = {
  'Delhi': { lat: 28.6139, lng: 77.2090 },
  'New Delhi': { lat: 28.6139, lng: 77.2090 },
  'Mumbai': { lat: 19.0760, lng: 72.8777 },
  'Bangalore': { lat: 12.9716, lng: 77.5946 },
  'Bengaluru': { lat: 12.9716, lng: 77.5946 },
  'Kolkata': { lat: 22.5726, lng: 88.3639 },
  'Chennai': { lat: 13.0827, lng: 80.2707 },
  'Hyderabad': { lat: 17.3850, lng: 78.4867 },
  'Pune': { lat: 18.5204, lng: 73.8567 },
  'Jaipur': { lat: 26.9124, lng: 75.7873 },
  'Agra': { lat: 27.1767, lng: 78.0081 },
  'Varanasi': { lat: 25.3176, lng: 82.9739 },
  'Goa': { lat: 15.2993, lng: 74.1240 },
  'Kochi': { lat: 9.9312, lng: 76.2673 },
  'Amritsar': { lat: 31.6340, lng: 74.8723 },
  'Udaipur': { lat: 24.5854, lng: 73.7125 },
  'Indore': { lat: 22.7196, lng: 75.8577 },
  'Vizag': { lat: 17.6868, lng: 83.2185 },
  'Visakhapatnam': { lat: 17.6868, lng: 83.2185 },
  'Vijayawada': { lat: 16.5062, lng: 80.6480 },
  'Nashik': { lat: 19.9975, lng: 73.7898 },
  'Nagpur': { lat: 21.1458, lng: 79.0882 },
  'Aurangabad': { lat: 19.8762, lng: 75.3433 },
  'Darjeeling': { lat: 27.0410, lng: 88.2663 },
  'Nainital': { lat: 29.3919, lng: 79.4542 },
  'Mysore': { lat: 12.2958, lng: 76.6394 },
  'Shimla': { lat: 31.1048, lng: 77.1734 },
  'Srinagar': { lat: 34.0837, lng: 74.7973 },
  'Rishikesh': { lat: 30.0869, lng: 78.2676 }
};

/**
 * Data Cleaning Routines for Missing or Null Fields
 */
export function sanitizeString(val: any, fallback: string = ''): string {
  if (val === null || val === undefined) return fallback;
  const str = String(val).trim();
  return str.length > 0 ? str : fallback;
}

export function sanitizeNumber(val: any, fallback: number = 0): number {
  if (val === null || val === undefined) return fallback;
  const num = Number(val);
  return isNaN(num) ? fallback : num;
}

export function cleanHotelRecord(record: Partial<IndianHotelRecord>): IndianHotelRecord {
  return {
    id: sanitizeString(record.id, `ht_${Math.random().toString(36).substring(2, 9)}`),
    name: sanitizeString(record.name, 'Unnamed Hotel'),
    city: sanitizeString(record.city, 'Unknown City'),
    rating: Math.min(5, Math.max(1, sanitizeNumber(record.rating, 4.0))),
    features: Array.isArray(record.features) && record.features.length > 0
      ? record.features.map(f => sanitizeString(f)).filter(Boolean)
      : ['Free Wi-Fi', 'Air conditioning'],
    priceInr: Math.max(0, sanitizeNumber(record.priceInr, 1500)),
    starCategory: record.starCategory ? sanitizeString(record.starCategory) : undefined
  };
}

export function cleanRestaurantRecord(record: Partial<IndianRestaurantRecord>): IndianRestaurantRecord {
  return {
    id: sanitizeString(record.id, `rst_${Math.random().toString(36).substring(2, 9)}`),
    name: sanitizeString(record.name, 'Unnamed Restaurant'),
    city: sanitizeString(record.city, 'Unknown City'),
    address: sanitizeString(record.address, `${sanitizeString(record.city, 'City Center')}, India`),
    locality: sanitizeString(record.locality, 'City Center'),
    cuisines: Array.isArray(record.cuisines) && record.cuisines.length > 0
      ? record.cuisines.map(c => sanitizeString(c)).filter(Boolean)
      : ['North Indian', 'Multi-Cuisine'],
    costForTwoInr: Math.max(0, sanitizeNumber(record.costForTwoInr, 600)),
    hasOnlineDelivery: Boolean(record.hasOnlineDelivery),
    hasTableBooking: Boolean(record.hasTableBooking),
    priceRange: Math.min(4, Math.max(1, sanitizeNumber(record.priceRange, 2))),
    rating: Math.min(5, Math.max(1, sanitizeNumber(record.rating, 4.0))),
    ratingText: sanitizeString(record.ratingText, 'Very Good'),
    votes: Math.max(0, sanitizeNumber(record.votes, 50))
  };
}

export function cleanAttractionRecord(record: Partial<IndianAttractionRecord>): IndianAttractionRecord {
  return {
    id: sanitizeString(record.id, `att_${Math.random().toString(36).substring(2, 9)}`),
    name: sanitizeString(record.name, 'Unnamed Attraction'),
    city: sanitizeString(record.city, 'Unknown City'),
    state: sanitizeString(record.state, 'Unknown State'),
    zone: sanitizeString(record.zone, 'North'),
    type: sanitizeString(record.type, 'Monument'),
    estYear: sanitizeString(record.estYear, 'N/A'),
    durationHrs: Math.max(0.5, sanitizeNumber(record.durationHrs, 2.0)),
    googleRating: Math.min(5, Math.max(1, sanitizeNumber(record.googleRating, 4.5))),
    entranceFeeInr: Math.max(0, sanitizeNumber(record.entranceFeeInr, 0)),
    hasAirport: record.hasAirport !== undefined ? Boolean(record.hasAirport) : true,
    weeklyOff: sanitizeString(record.weeklyOff, 'None'),
    significance: sanitizeString(record.significance, 'Historical & Cultural Interest'),
    dslrAllowed: record.dslrAllowed !== undefined ? Boolean(record.dslrAllowed) : true,
    reviewCountLakhs: Math.max(0, sanitizeNumber(record.reviewCountLakhs, 0.5)),
    bestTime: sanitizeString(record.bestTime, 'October to March')
  };
}

/**
 * Bounds for Valid Indian Landmass Coordinates
 * Latitude: 6.0° N to 37.5° N (Indira Point to Indira Col)
 * Longitude: 68.0° E to 97.5° E (Ghuar Mota to Kibithu)
 */
export const INDIA_GEO_BOUNDING_BOX = {
  minLat: 6.0,
  maxLat: 37.5,
  minLng: 68.0,
  maxLng: 97.5
};

export function isLatitudeInIndiaRange(lat: number): boolean {
  return typeof lat === 'number' && !isNaN(lat) && lat >= INDIA_GEO_BOUNDING_BOX.minLat && lat <= INDIA_GEO_BOUNDING_BOX.maxLat;
}

export function isLongitudeInIndiaRange(lng: number): boolean {
  return typeof lng === 'number' && !isNaN(lng) && lng >= INDIA_GEO_BOUNDING_BOX.minLng && lng <= INDIA_GEO_BOUNDING_BOX.maxLng;
}

export function isWithinIndia(lat: number, lon: number): boolean {
  if (typeof lat !== 'number' || typeof lon !== 'number' || isNaN(lat) || isNaN(lon)) {
    return false;
  }
  return lat >= 6.5 && lat <= 35.8 && lon >= 68.0 && lon <= 97.4;
}

/**
 * Verifies if a given latitude and longitude pair is within the geographic bounding box of India
 */
export function isWithinIndiaBoundingBox(lat: number, lng: number): boolean {
  return isWithinIndia(lat, lng) || (isLatitudeInIndiaRange(lat) && isLongitudeInIndiaRange(lng));
}

/**
 * High-level geospatial integrity verification for data ingestion pipelines
 */
export function verifyGeoDataIntegrity(lat?: number, lng?: number): {
  isWithinIndia: boolean;
  isNumeric: boolean;
  statusMessage: string;
} {
  const isNumeric = typeof lat === 'number' && typeof lng === 'number' && !isNaN(lat) && !isNaN(lng) && (lat !== 0 || lng !== 0);
  if (!isNumeric) {
    return {
      isWithinIndia: false,
      isNumeric: false,
      statusMessage: 'Coordinates missing, non-numeric, or null (0.0, 0.0).'
    };
  }

  const isWithinIndia = isWithinIndiaBoundingBox(lat!, lng!);
  return {
    isWithinIndia,
    isNumeric: true,
    statusMessage: isWithinIndia
      ? 'Coordinates verified within valid Indian landmass bounding box.'
      : `Coordinates (${lat}, ${lng}) fall outside standard Indian landmass bounding box [6.0°-37.5°N, 68.0°-97.5°E].`
  };
}

export function validateCoordinates(lat?: number, lng?: number, cityName?: string): CoordinateValidationResult {
  const warnings: string[] = [];

  const isValidNumber =
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    !isNaN(lat) &&
    !isNaN(lng) &&
    (lat !== 0 || lng !== 0);

  if (isValidNumber) {
    if (isWithinIndiaBoundingBox(lat!, lng!)) {
      return {
        isValid: true,
        coordinates: { lat: lat!, lng: lng! },
        confidence: 'EXACT'
      };
    } else {
      warnings.push(`Coordinates (${lat}, ${lng}) lie outside standard Indian geographical boundaries.`);
    }
  } else {
    warnings.push('Original coordinates missing or invalid (0.0, 0.0).');
  }

  // Attempt Fallback to known City Coordinates
  if (cityName) {
    const normalizedCity = Object.keys(KNOWN_INDIAN_CITY_COORDINATES).find(
      c => c.toLowerCase() === cityName.trim().toLowerCase()
    );

    if (normalizedCity) {
      return {
        isValid: true,
        coordinates: KNOWN_INDIAN_CITY_COORDINATES[normalizedCity],
        confidence: 'CITY_CENTER_FALLBACK',
        warnings: [...warnings, `Applied city center coordinate fallback for ${cityName}.`]
      };
    }
  }

  return {
    isValid: false,
    coordinates: { lat: 20.5937, lng: 78.9629 }, // Geographic center of India as absolute default
    confidence: 'INVALID',
    warnings: [...warnings, 'Failed to resolve valid coordinates; assigned India geographic center default.']
  };
}

/**
 * Velora AI Standardized Category Taxonomy Definition & Mappers
 */
export type VeloraEateryCategory =
  | 'Fine Dining'
  | 'Casual Dining'
  | 'Quick Service & Cafes'
  | 'Highway Dhaba & Local Eatery'
  | 'Street Food & Chaat'
  | 'Bakery & Dessert Parlor';

export type VeloraHotelCategory =
  | 'Luxury Heritage & 5-Star'
  | 'Premium Boutique & 4-Star'
  | 'Mid-Range Business & 3-Star'
  | 'Budget Stay & Homestay'
  | 'Eco-Resort & Retreat';

/**
 * Normalizes heterogeneous eatery/restaurant raw category inputs (e.g., 'Cafe', 'Restaurant', 'Dhaba')
 * into the standardized Velora AI taxonomy for eateries.
 */
export function normalizeEateryCategory(
  rawCategory?: string,
  costForTwoInr?: number
): VeloraEateryCategory {
  if (!rawCategory) {
    if (typeof costForTwoInr === 'number') {
      if (costForTwoInr >= 1800) return 'Fine Dining';
      if (costForTwoInr >= 800) return 'Casual Dining';
      if (costForTwoInr >= 400) return 'Quick Service & Cafes';
      return 'Highway Dhaba & Local Eatery';
    }
    return 'Casual Dining';
  }

  const norm = rawCategory.trim().toLowerCase();

  // Street Food / Chaat / Fast Food stalls / Tapri
  if (
    norm.includes('street') ||
    norm.includes('chaat') ||
    norm.includes('stall') ||
    norm.includes('cart') ||
    norm.includes('food truck') ||
    norm.includes('tapri')
  ) {
    return 'Street Food & Chaat';
  }

  // Dhaba / Local Highway Eatery / Mess / Bhojanalaya
  if (
    norm.includes('dhaba') ||
    norm.includes('dhabha') ||
    norm.includes('highway') ||
    norm.includes('mess') ||
    norm.includes('bhojanalaya') ||
    norm.includes('tiffin')
  ) {
    return 'Highway Dhaba & Local Eatery';
  }

  // Cafe / Quick Service / Beverages / Bistro
  if (
    norm.includes('cafe') ||
    norm.includes('coffee') ||
    norm.includes('tea') ||
    norm.includes('chai') ||
    norm.includes('bistro') ||
    norm.includes('qsr') ||
    norm.includes('fast food') ||
    norm.includes('beverage') ||
    norm.includes('juice')
  ) {
    return 'Quick Service & Cafes';
  }

  // Bakery & Sweets / Desserts
  if (
    norm.includes('bakery') ||
    norm.includes('sweet') ||
    norm.includes('mithai') ||
    norm.includes('confectionery') ||
    norm.includes('patisserie') ||
    norm.includes('dessert') ||
    norm.includes('ice cream')
  ) {
    return 'Bakery & Dessert Parlor';
  }

  // Fine Dining / Roof Top / Gourmet / Lounge
  if (
    norm.includes('fine dining') ||
    norm.includes('luxury') ||
    norm.includes('gourmet') ||
    norm.includes('rooftop') ||
    norm.includes('lounge') ||
    (typeof costForTwoInr === 'number' && costForTwoInr >= 1800)
  ) {
    return 'Fine Dining';
  }

  // Default to Casual Dining
  return 'Casual Dining';
}

/**
 * Normalizes heterogeneous hotel/stay raw category inputs (e.g., '5-Star', 'Homestay', 'Resort')
 * into the standardized Velora AI taxonomy for accommodations.
 */
export function normalizeHotelCategory(
  rawCategory?: string,
  priceInr?: number
): VeloraHotelCategory {
  if (!rawCategory) {
    if (typeof priceInr === 'number') {
      if (priceInr >= 9000) return 'Luxury Heritage & 5-Star';
      if (priceInr >= 4000) return 'Premium Boutique & 4-Star';
      if (priceInr >= 1800) return 'Mid-Range Business & 3-Star';
      return 'Budget Stay & Homestay';
    }
    return 'Mid-Range Business & 3-Star';
  }

  const norm = rawCategory.trim().toLowerCase();

  if (
    norm.includes('5-star') ||
    norm.includes('5 star') ||
    norm.includes('palace') ||
    norm.includes('heritage') ||
    norm.includes('luxury') ||
    norm.includes('grand') ||
    (typeof priceInr === 'number' && priceInr >= 9000)
  ) {
    return 'Luxury Heritage & 5-Star';
  }

  if (
    norm.includes('4-star') ||
    norm.includes('4 star') ||
    norm.includes('boutique') ||
    norm.includes('premium') ||
    (typeof priceInr === 'number' && priceInr >= 4000)
  ) {
    return 'Premium Boutique & 4-Star';
  }

  if (
    norm.includes('resort') ||
    norm.includes('retreat') ||
    norm.includes('eco') ||
    norm.includes('nature stay') ||
    norm.includes('glamping')
  ) {
    return 'Eco-Resort & Retreat';
  }

  if (
    norm.includes('homestay') ||
    norm.includes('guest house') ||
    norm.includes('hostel') ||
    norm.includes('lodge') ||
    norm.includes('dharamshala') ||
    norm.includes('budget') ||
    norm.includes('inn')
  ) {
    return 'Budget Stay & Homestay';
  }

  return 'Mid-Range Business & 3-Star';
}

/**
 * Universal Category Normalization Mapper for heterogeneous raw datasets
 */
export function normalizeCategory(
  type: 'eatery' | 'hotel',
  rawCategory?: string,
  priceOrCost?: number
): VeloraEateryCategory | VeloraHotelCategory {
  if (type === 'eatery') {
    return normalizeEateryCategory(rawCategory, priceOrCost);
  } else {
    return normalizeHotelCategory(rawCategory, priceOrCost);
  }
}

/**
 * Categorization Utilities
 */
export function categorizeHotel(hotel: IndianHotelRecord): HotelCategoryTier {
  const price = hotel.priceInr;
  const star = hotel.starCategory;

  if (star === '5-star' || price >= 9000) return 'Luxury';
  if (star === '4-star' || price >= 4000) return 'Premium';
  if (star === '3-star' || price >= 1800) return 'Mid-Range';
  return 'Budget';
}

export function categorizeDining(restaurant: IndianRestaurantRecord): DiningCategoryTier {
  const cost = restaurant.costForTwoInr;
  const cuisines = restaurant.cuisines.map(c => c.toLowerCase());

  if (cost >= 1800) return 'Fine Dining';
  if (cost >= 800) return 'Casual Dining';
  if (cuisines.some(c => c.includes('cafe') || c.includes('bakery') || c.includes('beverages'))) {
    return 'Quick Service & Cafes';
  }
  return 'Budget Eats';
}

export function categorizeAttraction(attraction: IndianAttractionRecord): AttractionCategoryTier {
  const sig = attraction.significance.toLowerCase();
  const type = attraction.type.toLowerCase();
  const name = attraction.name.toLowerCase();

  if (sig.includes('unesco') || sig.includes('world heritage') || name.includes('taj mahal')) {
    return 'UNESCO & Heritage';
  }
  if (type.includes('temple') || type.includes('religious') || sig.includes('pilgrimage') || sig.includes('spiritual')) {
    return 'Spiritual & Cultural';
  }
  if (type.includes('fort') || type.includes('palace') || type.includes('monument')) {
    return 'Forts & Palaces';
  }
  if (type.includes('park') || type.includes('lake') || type.includes('beach') || type.includes('nature') || type.includes('hill')) {
    return 'Nature & Scenic';
  }
  return 'Modern & Urban';
}

export function extractCuisineCluster(cuisines: string[]): string {
  const joined = cuisines.join(' ').toLowerCase();

  if (joined.includes('north indian') || joined.includes('punjabi') || joined.includes('mughlai')) return 'North Indian & Mughlai';
  if (joined.includes('south indian') || joined.includes('andhra') || joined.includes('chettinad') || joined.includes('kerala')) return 'South Indian Regional';
  if (joined.includes('chinese') || joined.includes('asian') || joined.includes('thai') || joined.includes('japanese')) return 'Pan-Asian';
  if (joined.includes('italian') || joined.includes('pizza') || joined.includes('continental') || joined.includes('european')) return 'Continental & Italian';
  if (joined.includes('biryani') || joined.includes('hyderabadi')) return 'Biryani & Kebabs';
  if (joined.includes('street food') || joined.includes('fast food') || joined.includes('burger') || joined.includes('rolls')) return 'Street Food & Fast Food';
  if (joined.includes('goan') || joined.includes('seafood') || joined.includes('maharashtrian') || joined.includes('bengali')) return 'Local Coastal & Regional';
  
  return 'Multi-Cuisine';
}

/**
 * Haversine Distance Calculation (Distance in km between two geo points)
 */
export function calculateHaversineDistance(
  coord1: Coordinates,
  coord2: Coordinates
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (coord2.lat - coord1.lat) * (Math.PI / 180);
  const dLon = (coord2.lng - coord1.lng) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(coord1.lat * (Math.PI / 180)) *
      Math.cos(coord2.lat * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10; // Round to 1 decimal place
}

/**
 * Data Pipeline Ingestion Engines
 */

export function processAttractions(rawRecords: IndianAttractionRecord[] = ALL_INDIAN_ATTRACTIONS): IngestionResult<ProcessedAttraction> {
  const warnings: string[] = [];
  let validCount = 0;

  const data: ProcessedAttraction[] = rawRecords.map(item => {
    const geoResult = validateCoordinates(undefined, undefined, item.city);
    if (geoResult.isValid) validCount++;
    if (geoResult.warnings) warnings.push(...geoResult.warnings);

    const categoryTier = categorizeAttraction(item);
    const costCategory = item.entranceFeeInr === 0 ? 'Free' : item.entranceFeeInr > 500 ? 'Premium' : 'Budget';

    const tags: string[] = [
      categoryTier,
      costCategory,
      `${item.zone} Zone`,
      item.significance
    ];
    if (item.dslrAllowed) tags.push('DSLR Photography Allowed');
    if (item.hasAirport) tags.push('Airport Nearby');

    return {
      ...item,
      coordinates: geoResult.coordinates,
      geoConfidence: geoResult.confidence,
      categoryTier,
      costCategory,
      tags
    };
  });

  return {
    data,
    validCount,
    warnings,
    processedAt: new Date().toISOString()
  };
}

export function processHotels(rawRecords: IndianHotelRecord[] = ALL_INDIAN_HOTELS): IngestionResult<ProcessedHotel> {
  const warnings: string[] = [];
  let validCount = 0;

  const data: ProcessedHotel[] = rawRecords.map(item => {
    const geoResult = validateCoordinates(undefined, undefined, item.city);
    if (geoResult.isValid) validCount++;
    if (geoResult.warnings) warnings.push(...geoResult.warnings);

    const categoryTier = categorizeHotel(item);
    const lowerFeatures = item.features.map(f => f.toLowerCase());

    const hasPool = lowerFeatures.some(f => f.includes('pool'));
    const hasBreakfast = lowerFeatures.some(f => f.includes('breakfast'));
    const hasWifi = lowerFeatures.some(f => f.includes('wi-fi') || f.includes('wifi'));
    const hasSpa = lowerFeatures.some(f => f.includes('spa'));

    const tags: string[] = [
      categoryTier,
      item.starCategory || 'Boutique Stay'
    ];
    if (hasPool) tags.push('Swimming Pool');
    if (hasBreakfast) tags.push('Complimentary Breakfast');
    if (hasSpa) tags.push('Spa & Wellness');

    return {
      ...item,
      coordinates: geoResult.coordinates,
      geoConfidence: geoResult.confidence,
      categoryTier,
      hasPool,
      hasBreakfast,
      hasWifi,
      hasSpa,
      tags
    };
  });

  return {
    data,
    validCount,
    warnings,
    processedAt: new Date().toISOString()
  };
}

export function processRestaurants(rawRecords: IndianRestaurantRecord[] = ALL_INDIAN_RESTAURANTS): IngestionResult<ProcessedRestaurant> {
  const warnings: string[] = [];
  let validCount = 0;

  const data: ProcessedRestaurant[] = rawRecords.map(item => {
    const geoResult = validateCoordinates(undefined, undefined, item.city);
    if (geoResult.isValid) validCount++;
    if (geoResult.warnings) warnings.push(...geoResult.warnings);

    const categoryTier = categorizeDining(item);
    const primaryCuisineCluster = extractCuisineCluster(item.cuisines);

    const tags: string[] = [
      categoryTier,
      primaryCuisineCluster,
      item.ratingText
    ];
    if (item.hasOnlineDelivery) tags.push('Online Delivery');
    if (item.hasTableBooking) tags.push('Table Booking');

    return {
      ...item,
      coordinates: geoResult.coordinates,
      geoConfidence: geoResult.confidence,
      categoryTier,
      primaryCuisineCluster,
      tags
    };
  });

  return {
    data,
    validCount,
    warnings,
    processedAt: new Date().toISOString()
  };
}

/**
 * Unified India-Wide Tourism & Hospitality Platform Ingestion
 */
export function runIndiaDataPipeline(): {
  attractions: ProcessedAttraction[];
  hotels: ProcessedHotel[];
  restaurants: ProcessedRestaurant[];
  summary: IngestionSummary;
} {
  const attractionResult = processAttractions();
  const hotelResult = processHotels();
  const restaurantResult = processRestaurants();

  // Calculate City Breakdown
  const cityBreakdown: Record<string, { attractions: number; hotels: number; restaurants: number }> = {};

  const registerCity = (cityName: string, type: 'attractions' | 'hotels' | 'restaurants') => {
    const norm = cityName.trim();
    if (!cityBreakdown[norm]) {
      cityBreakdown[norm] = { attractions: 0, hotels: 0, restaurants: 0 };
    }
    cityBreakdown[norm][type]++;
  };

  attractionResult.data.forEach(a => registerCity(a.city, 'attractions'));
  hotelResult.data.forEach(h => registerCity(h.city, 'hotels'));
  restaurantResult.data.forEach(r => registerCity(r.city, 'restaurants'));

  // Aggregated Stats
  const avgHotelRate = hotelResult.data.length > 0
    ? Math.round(hotelResult.data.reduce((acc, h) => acc + h.priceInr, 0) / hotelResult.data.length)
    : 0;

  const avgMealCost = restaurantResult.data.length > 0
    ? Math.round(restaurantResult.data.reduce((acc, r) => acc + r.costForTwoInr, 0) / restaurantResult.data.length)
    : 0;

  const summary: IngestionSummary = {
    timestamp: new Date().toISOString(),
    totalRecordsProcessed:
      attractionResult.data.length + hotelResult.data.length + restaurantResult.data.length,
    attractions: {
      total: attractionResult.data.length,
      validCoordinatesCount: attractionResult.validCount,
      fallbackCoordinatesCount: attractionResult.data.filter(a => a.geoConfidence === 'CITY_CENTER_FALLBACK').length,
      freeEntryCount: attractionResult.data.filter(a => a.entranceFeeInr === 0).length
    },
    hotels: {
      total: hotelResult.data.length,
      validCoordinatesCount: hotelResult.validCount,
      averageNightlyRateInr: avgHotelRate,
      luxuryCount: hotelResult.data.filter(h => h.categoryTier === 'Luxury').length
    },
    restaurants: {
      total: restaurantResult.data.length,
      validCoordinatesCount: restaurantResult.validCount,
      averageCostForTwoInr: avgMealCost,
      onlineDeliveryCount: restaurantResult.data.filter(r => r.hasOnlineDelivery).length
    },
    cityBreakdown
  };

  return {
    attractions: attractionResult.data,
    hotels: hotelResult.data,
    restaurants: restaurantResult.data,
    summary
  };
}

/**
 * Nearby Destination Search Utility (Spatial Query Engine)
 */
export function findNearbyHospitality(
  targetCoords: Coordinates,
  radiusKm: number = 10,
  hotels: ProcessedHotel[] = processHotels().data,
  restaurants: ProcessedRestaurant[] = processRestaurants().data
) {
  const nearbyHotels = hotels
    .map(h => ({ ...h, distanceKm: calculateHaversineDistance(targetCoords, h.coordinates) }))
    .filter(h => h.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);

  const nearbyRestaurants = restaurants
    .map(r => ({ ...r, distanceKm: calculateHaversineDistance(targetCoords, r.coordinates) }))
    .filter(r => r.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);

  return {
    nearbyHotels,
    nearbyRestaurants
  };
}
