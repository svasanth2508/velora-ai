export type TripStatus = 'active' | 'upcoming' | 'completed' | 'cancelled' | 'archived';

export type TravelStyle = 'relaxed' | 'balanced' | 'fast-paced' | 'cultural' | 'adventure' | 'luxury';
export type TravelPace = 'slow' | 'moderate' | 'intense' | 'relaxed';
export type PrivacyLevel = 'strict' | 'fuzzy-location' | 'anonymized' | 'public' | 'strict-anonymous';

export interface NearbySpot {
  id?: string;
  name: string;
  type?: string;
  category?: string;
  distanceKm?: number;
  distKm?: number;
  rating: number;
  lat?: number;
  lng?: number;
  entryFeeInr?: string;
  description?: string;
  crowdIndex?: number;
}

export interface LocationNode {
  id: string;
  name: string;
  category: 'landmark' | 'dining' | 'lodging' | 'culture' | 'nature' | 'transit' | 'shopping' | 'museum' | 'viewpoint' | 'park' | 'hospital' | 'parking' | 'hotel' | 'restaurant' | 'cafe';
  lat: number;
  lng: number;
  rating: number;
  avgCostUsd: number;
  entryFeeInr?: string;
  crowdIndex: number; // 0-100
  weatherSensitivity: 'low' | 'medium' | 'high';
  bestVisitingTime?: string;
  description: string;
  imageUrl?: string;
  estimatedTimeMins: number;
  twinMatchReason?: string;
  recommendationReason?: string;
  nearbySpots?: NearbySpot[];
  transitFromPrev?: any;
}

export interface DayItinerary {
  day: number;
  title: string;
  theme: string;
  totalCostUsd: number;
  crowdForecast: 'low' | 'moderate' | 'high' | 'peak';
  weatherForecast: string;
  alternativeRainPlan?: string;
  alternativeCrowdPlan?: string;
  nodes: LocationNode[];
}

export interface TripPlan {
  id: string;
  title?: string;
  destination: string;
  country: string;
  durationDays: number;
  totalBudgetUsd: number;
  spentBudgetUsd?: number;
  originLocation?: string;
  status?: TripStatus;
  travelStyle: TravelStyle;
  pace: TravelPace;
  privacyLevel: PrivacyLevel;
  twinCompatibilityScore?: number;
  createdAt: string;
  imageUrl?: string;
  summary: string;
  highlights: string[];
  securityBadges: string[];
  itinerary: DayItinerary[];
}

export interface UserProfile {
  name: string;
  email?: string;
  role: 'user' | 'admin';
  preferredStyle: TravelStyle;
  preferredPace: TravelPace;
  dietaryPreference?: 'vegetarian' | 'non-vegetarian' | 'jain' | 'vegan' | 'halal';
  dietary?: any;
  locationPrivacy: PrivacyLevel;
  budgetTier?: 'budget' | 'mid-range' | 'luxury';
  language?: string;
  crowdTolerance?: string;
  interests?: string[];
  gpsEnabled?: boolean;
  obfuscationRadiusKm?: number;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactEmail?: string;
}

export interface ExpenseItem {
  id: string;
  title: string;
  category: 'Accommodation' | 'Food & Dining' | 'Transport' | 'Tickets & Sightseeing' | 'Shopping' | 'Miscellaneous' | 'Monument Tickets' | 'Auto & Transit' | 'Hotel & Stay';
  amountInr: number;
  date: string;
}

export interface PackingItem {
  id: string;
  item: string;
  category: 'Clothing' | 'Documents' | 'Electronics' | 'Toiletries' | 'Medicine' | 'Other' | 'Documents & Cash' | 'Sun & Rain Protection' | 'Medicines';
  packed: boolean;
}

export interface TranslatorPhrase {
  id: string;
  english: string;
  hindi: string;
  tamil: string;
  phonetic: string;
  category: 'Emergency' | 'Medical' | 'Transport & Autos' | 'Dining & Food' | 'Shopping & Bargaining' | 'Hotel & Stay' | 'Autos & Bargaining' | 'Directions';
  translations?: Record<string, any>;
}

export interface SecurityAuditItem {
  id: string;
  title?: string;
  category: string;
  status: 'encrypted' | 'fuzzy' | 'anonymized' | 'passed' | 'active';
  timestamp?: string;
  details: string;
  actionLabel?: string;
}

export interface QRTicket {
  id: string;
  destination?: string;
  venue?: string;
  monumentName?: string;
  ticketType?: string;
  passType?: string;
  date?: string;
  validDate?: string;
  timeSlot?: string;
  qrCodeData?: string;
  qrCodeUrl?: string;
  priceInr?: number;
  costInr?: number | string;
  verified?: boolean;
  status?: string;
}

export interface WeatherAlert {
  id: string;
  severity: 'low' | 'moderate' | 'high';
  title: string;
  description: string;
  time: string;
}

export interface ReviewPhotoUpload {
  id: string;
  locationName: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  photoUrl: string;
  timestamp: string;
  likes: number;
}

export interface ReviewItem {
  id: string;
  locationName?: string;
  userName?: string;
  user?: string;
  placeName?: string;
  rating: number;
  comment: string;
  status?: string;
  aiModerationReason?: string;
  date: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  number?: string;
  phone?: string;
  role?: string;
  type?: string;
  address?: string;
  distKm?: number;
  lat?: number;
  lng?: number;
  is24x7?: boolean;
  available?: string;
}

export interface LiveMetrics {
  weatherTemp?: string;
  tempC?: number;
  weatherCondition: string;
  aqiValue?: number;
  aqi?: number;
  aqiStatus?: string;
  aqiLabel?: string;
  currencyRateUsdToInr?: number;
  usdToInr?: number;
  localTimeIndia?: string;
  localTime?: string;
  trafficStatus?: string;
  city?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot' | 'assistant';
  text: string;
  timestamp: string;
  suggestedActions?: string[];
}

// Backward-compatibility aliases
export type TripTwin = TripPlan;
export type UserTwinProfile = UserProfile;
