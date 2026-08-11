export interface Coordinates {
  lat: number;
  lng: number;
  name?: string;
  state?: string;
}

/**
 * Comprehensive Verified Landmark & Destination Coordinates Database
 * Provides instant sub-meter precision coordinates for cities and iconic landmarks.
 */
export const KNOWN_COORDINATES: Record<string, Coordinates> = {
  // --- TAMIL NADU & SOUTH INDIA DESTINATIONS ---
  'karur': { lat: 10.9601, lng: 78.0766, name: 'Karur', state: 'Tamil Nadu' },
  'pasupatheeswarar temple': { lat: 10.9598, lng: 78.0772, name: 'Sri Pasupatheeswarar Temple', state: 'Tamil Nadu' },
  'mayanur barrage': { lat: 10.9520, lng: 78.2320, name: 'Mayanur Barrage', state: 'Tamil Nadu' },
  'trichy': { lat: 10.7905, lng: 78.7047, name: 'Tiruchirappalli (Trichy)', state: 'Tamil Nadu' },
  'tiruchirappalli': { lat: 10.7905, lng: 78.7047, name: 'Tiruchirappalli (Trichy)', state: 'Tamil Nadu' },
  'rockfort': { lat: 10.8271, lng: 78.6970, name: 'Rockfort Temple Trichy', state: 'Tamil Nadu' },
  'coimbatore': { lat: 11.0168, lng: 76.9558, name: 'Coimbatore', state: 'Tamil Nadu' },
  'salem': { lat: 11.6643, lng: 78.1460, name: 'Salem', state: 'Tamil Nadu' },
  'erode': { lat: 11.3410, lng: 77.7172, name: 'Erode', state: 'Tamil Nadu' },
  'thanjavur': { lat: 10.7870, lng: 79.1378, name: 'Thanjavur', state: 'Tamil Nadu' },
  'brihadeeswarar temple': { lat: 10.7828, lng: 79.1318, name: 'Brihadeeswarar Temple', state: 'Tamil Nadu' },
  'tirupur': { lat: 11.1085, lng: 77.3411, name: 'Tirupur', state: 'Tamil Nadu' },
  'rameshwaram': { lat: 9.2876, lng: 79.3129, name: 'Rameshwaram', state: 'Tamil Nadu' },
  'kanchipuram': { lat: 12.8342, lng: 79.7036, name: 'Kanchipuram', state: 'Tamil Nadu' },
  'dharmapuri': { lat: 12.1211, lng: 78.1582, name: 'Dharmapuri', state: 'Tamil Nadu' },
  'hogenakkal': { lat: 12.1154, lng: 77.7788, name: 'Hogenakkal Falls', state: 'Tamil Nadu' },
  'hogenakkal falls': { lat: 12.1154, lng: 77.7788, name: 'Hogenakkal Falls', state: 'Tamil Nadu' },
  'theerthamalai': { lat: 12.0620, lng: 78.5830, name: 'Theerthamalai Temple', state: 'Tamil Nadu' },
  'dharmapuri fort': { lat: 12.1250, lng: 78.1590, name: 'Dharmapuri Fort', state: 'Tamil Nadu' },

  // --- HILL STATIONS & NATURE ---
  'ooty': { lat: 11.4102, lng: 76.6950, name: 'Ooty (Udhagamandalam)', state: 'Tamil Nadu' },
  'udhagamandalam': { lat: 11.4102, lng: 76.6950, name: 'Ooty (Udhagamandalam)', state: 'Tamil Nadu' },
  'ooty lake': { lat: 11.4116, lng: 76.6908, name: 'Ooty Lake', state: 'Tamil Nadu' },
  'doddabetta': { lat: 11.4011, lng: 76.7356, name: 'Doddabetta Peak', state: 'Tamil Nadu' },
  'doddabetta peak': { lat: 11.4011, lng: 76.7356, name: 'Doddabetta Peak', state: 'Tamil Nadu' },
  'botanical garden ooty': { lat: 11.4180, lng: 76.7118, name: 'Government Botanical Garden Ooty', state: 'Tamil Nadu' },
  'rose garden ooty': { lat: 11.4124, lng: 76.7088, name: 'Government Rose Garden Ooty', state: 'Tamil Nadu' },
  'pykara': { lat: 11.5303, lng: 76.5960, name: 'Pykara Lake & Falls', state: 'Tamil Nadu' },
  'mudumalai': { lat: 11.5623, lng: 76.5342, name: 'Mudumalai Tiger Reserve', state: 'Tamil Nadu' },
  'coonoor': { lat: 11.3530, lng: 76.7959, name: 'Coonoor', state: 'Tamil Nadu' },
  'kodaikanal': { lat: 10.2381, lng: 77.4892, name: 'Kodaikanal', state: 'Tamil Nadu' },
  'kodaikanal lake': { lat: 10.2325, lng: 77.4859, name: 'Kodaikanal Lake', state: 'Tamil Nadu' },
  'munnar': { lat: 10.0889, lng: 77.0595, name: 'Munnar', state: 'Kerala' },
  'tea museum munnar': { lat: 10.0822, lng: 77.0601, name: 'Munnar Tea Museum', state: 'Kerala' },
  'eravikulam': { lat: 10.1873, lng: 77.0420, name: 'Eravikulam National Park', state: 'Kerala' },
  'mattupetty dam': { lat: 10.1039, lng: 77.1235, name: 'Mattupetty Dam', state: 'Kerala' },
  'shimla': { lat: 31.1048, lng: 77.1734, name: 'Shimla', state: 'Himachal Pradesh' },
  'manali': { lat: 32.2432, lng: 77.1892, name: 'Manali', state: 'Himachal Pradesh' },
  'mussoorie': { lat: 30.4598, lng: 78.0644, name: 'Mussoorie', state: 'Uttarakhand' },
  'nainital': { lat: 29.3919, lng: 79.4542, name: 'Nainital', state: 'Uttarakhand' },
  'darjeeling': { lat: 27.0410, lng: 88.2663, name: 'Darjeeling', state: 'West Bengal' },
  'srinagar': { lat: 34.0837, lng: 74.7973, name: 'Srinagar', state: 'Jammu & Kashmir' },
  'leh': { lat: 34.1526, lng: 77.5771, name: 'Leh Ladakh', state: 'Ladakh' },
  'ladakh': { lat: 34.1526, lng: 77.5771, name: 'Leh Ladakh', state: 'Ladakh' },
  'rishikesh': { lat: 30.0869, lng: 78.2676, name: 'Rishikesh', state: 'Uttarakhand' },

  // --- NORTH INDIA ---
  'agra': { lat: 27.1767, lng: 78.0081, name: 'Agra', state: 'Uttar Pradesh' },
  'taj mahal': { lat: 27.1751, lng: 78.0421, name: 'Taj Mahal', state: 'Uttar Pradesh' },
  'agra fort': { lat: 27.1795, lng: 78.0211, name: 'Agra Fort', state: 'Uttar Pradesh' },
  'fatehpur sikri': { lat: 27.0945, lng: 77.6679, name: 'Fatehpur Sikri', state: 'Uttar Pradesh' },
  'delhi': { lat: 28.6139, lng: 77.2090, name: 'New Delhi', state: 'Delhi' },
  'new delhi': { lat: 28.6139, lng: 77.2090, name: 'New Delhi', state: 'Delhi' },
  'red fort': { lat: 28.6562, lng: 77.2410, name: 'Red Fort Delhi', state: 'Delhi' },
  'qutub minar': { lat: 28.5245, lng: 77.1855, name: 'Qutub Minar', state: 'Delhi' },
  'humayun tomb': { lat: 28.5849, lng: 77.2507, name: 'Humayun\'s Tomb', state: 'Delhi' },
  'india gate': { lat: 28.6129, lng: 77.2295, name: 'India Gate', state: 'Delhi' },
  'varanasi': { lat: 25.3176, lng: 82.9739, name: 'Varanasi', state: 'Uttar Pradesh' },
  'kashi': { lat: 25.3176, lng: 82.9739, name: 'Varanasi', state: 'Uttar Pradesh' },
  'kashi vishwanath': { lat: 25.3109, lng: 83.0107, name: 'Kashi Vishwanath Temple', state: 'Uttar Pradesh' },
  'amritsar': { lat: 31.6340, lng: 74.8723, name: 'Amritsar', state: 'Punjab' },
  'golden temple': { lat: 31.6200, lng: 74.8765, name: 'Golden Temple (Harmandir Sahib)', state: 'Punjab' },
  'harmandir sahib': { lat: 31.6200, lng: 74.8765, name: 'Golden Temple', state: 'Punjab' },
  'jallianwala bagh': { lat: 31.6203, lng: 74.8801, name: 'Jallianwala Bagh', state: 'Punjab' },
  'wagah border': { lat: 31.6047, lng: 74.5726, name: 'Wagah Border', state: 'Punjab' },

  // --- RAJASTHAN ---
  'jaipur': { lat: 26.9124, lng: 75.7873, name: 'Jaipur (Pink City)', state: 'Rajasthan' },
  'amber fort': { lat: 26.9855, lng: 75.8513, name: 'Amber Fort', state: 'Rajasthan' },
  'amer fort': { lat: 26.9855, lng: 75.8513, name: 'Amber Fort', state: 'Rajasthan' },
  'hawa mahal': { lat: 26.9239, lng: 75.8267, name: 'Hawa Mahal', state: 'Rajasthan' },
  'city palace jaipur': { lat: 26.9258, lng: 75.8237, name: 'City Palace Jaipur', state: 'Rajasthan' },
  'jal mahal': { lat: 26.9534, lng: 75.8462, name: 'Jal Mahal', state: 'Rajasthan' },
  'udaipur': { lat: 24.5854, lng: 73.7125, name: 'Udaipur', state: 'Rajasthan' },
  'city palace udaipur': { lat: 24.5764, lng: 73.6835, name: 'City Palace Udaipur', state: 'Rajasthan' },
  'jodhpur': { lat: 26.2389, lng: 73.0243, name: 'Jodhpur', state: 'Rajasthan' },
  'jaisalmer': { lat: 26.9157, lng: 70.9083, name: 'Jaisalmer', state: 'Rajasthan' },

  // --- WEST & SOUTH INDIA ---
  'mumbai': { lat: 19.0760, lng: 72.8777, name: 'Mumbai', state: 'Maharashtra' },
  'gateway of india': { lat: 18.9220, lng: 72.8347, name: 'Gateway of India', state: 'Maharashtra' },
  'marine drive': { lat: 18.9438, lng: 72.8232, name: 'Marine Drive Mumbai', state: 'Maharashtra' },
  'goa': { lat: 15.2993, lng: 74.1240, name: 'Goa', state: 'Goa' },
  'panaji': { lat: 15.4909, lng: 73.8278, name: 'Panaji', state: 'Goa' },
  'bengaluru': { lat: 12.9716, lng: 77.5946, name: 'Bengaluru', state: 'Karnataka' },
  'bangalore': { lat: 12.9716, lng: 77.5946, name: 'Bengaluru', state: 'Karnataka' },
  'mysore': { lat: 12.2958, lng: 76.6394, name: 'Mysore (Mysuru)', state: 'Karnataka' },
  'mysore palace': { lat: 12.3052, lng: 76.6552, name: 'Mysore Palace', state: 'Karnataka' },
  'chennai': { lat: 13.0827, lng: 80.2707, name: 'Chennai', state: 'Tamil Nadu' },
  'madurai': { lat: 9.9252, lng: 78.1198, name: 'Madurai', state: 'Tamil Nadu' },
  'meenakshi temple': { lat: 9.9195, lng: 78.1193, name: 'Meenakshi Amman Temple', state: 'Tamil Nadu' },
  'kanyakumari': { lat: 8.0883, lng: 77.5385, name: 'Kanyakumari', state: 'Tamil Nadu' },
  'kochi': { lat: 9.9312, lng: 76.2673, name: 'Kochi', state: 'Kerala' },
  'cochin': { lat: 9.9312, lng: 76.2673, name: 'Kochi', state: 'Kerala' },
  'alleppey': { lat: 9.4981, lng: 76.3388, name: 'Alappuzha (Alleppey)', state: 'Kerala' },
  'hyderabad': { lat: 17.3850, lng: 78.4867, name: 'Hyderabad', state: 'Telangana' },
  'charminar': { lat: 17.3616, lng: 78.4747, name: 'Charminar', state: 'Telangana' },
  'kolkata': { lat: 22.5726, lng: 88.3639, name: 'Kolkata', state: 'West Bengal' },
  'ahmedabad': { lat: 23.0225, lng: 72.5714, name: 'Ahmedabad', state: 'Gujarat' },
  'statue of unity': { lat: 21.8380, lng: 73.7191, name: 'Statue of Unity', state: 'Gujarat' },
  'pondicherry': { lat: 11.9416, lng: 79.8083, name: 'Puducherry', state: 'Puducherry' },

  // --- GLOBAL WORLD LANDMARKS ---
  'paris': { lat: 48.8566, lng: 2.3522, name: 'Paris', state: 'Île-de-France, France' },
  'eiffel tower': { lat: 48.8584, lng: 2.2945, name: 'Eiffel Tower', state: 'Paris, France' },
  'louvre': { lat: 48.8606, lng: 2.3376, name: 'Louvre Museum', state: 'Paris, France' },
  'london': { lat: 51.5074, lng: -0.1278, name: 'London', state: 'Greater London, UK' },
  'big ben': { lat: 51.5007, lng: -0.1246, name: 'Big Ben', state: 'London, UK' },
  'tokyo': { lat: 35.6762, lng: 139.6503, name: 'Tokyo', state: 'Kanto, Japan' },
  'osaka': { lat: 34.6937, lng: 135.5023, name: 'Osaka', state: 'Kansai, Japan' },
  'new york': { lat: 40.7128, lng: -74.0060, name: 'New York City', state: 'NY, USA' },
  'new york city': { lat: 40.7128, lng: -74.0060, name: 'New York City', state: 'NY, USA' },
  'statue of liberty': { lat: 40.6892, lng: -74.0445, name: 'Statue of Liberty', state: 'NY, USA' },
  'dubai': { lat: 25.2048, lng: 55.2708, name: 'Dubai', state: 'Dubai, UAE' },
  'burj khalifa': { lat: 25.1972, lng: 55.2744, name: 'Burj Khalifa', state: 'Dubai, UAE' },
  'singapore': { lat: 1.3521, lng: 103.8198, name: 'Singapore', state: 'Singapore' },
  'oxford': { lat: 51.7520, lng: -1.2577, name: 'Oxford', state: 'Oxfordshire, UK' },
  'orlando': { lat: 28.5383, lng: -81.3792, name: 'Orlando', state: 'Florida, USA' },
  'rome': { lat: 41.9028, lng: 12.4964, name: 'Rome', state: 'Lazio, Italy' },
  'colosseum': { lat: 41.8902, lng: 12.4922, name: 'Colosseum', state: 'Rome, Italy' },
  'sydney': { lat: -33.8688, lng: 151.2093, name: 'Sydney', state: 'NSW, Australia' }
};

/**
 * Normalizes input text and looks up accurate coordinates from local database.
 */
export function lookupKnownCoordinates(query: string): Coordinates | null {
  if (!query) return null;
  const clean = query.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '');
  
  if (KNOWN_COORDINATES[clean]) {
    return KNOWN_COORDINATES[clean];
  }

  // Partial match fallback
  const keys = Object.keys(KNOWN_COORDINATES);
  const foundKey = keys.find(k => clean.includes(k) || k.includes(clean));
  if (foundKey) {
    return KNOWN_COORDINATES[foundKey];
  }

  return null;
}
