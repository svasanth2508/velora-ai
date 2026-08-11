import {
  TripTwin,
  UserTwinProfile,
  SecurityAuditItem,
  ReviewItem,
  EmergencyContact,
  QRTicket,
  ExpenseItem,
  PackingItem,
  TranslatorPhrase,
  LiveMetrics
} from '../types';

export const INITIAL_USER_PROFILE: UserTwinProfile = {
  name: 'Aarav Sharma',
  email: 'aarav.sharma@velora.ai',
  role: 'user',
  preferredStyle: 'balanced',
  preferredPace: 'moderate',
  crowdTolerance: 'low',
  dietary: ['Pure Vegetarian', 'Jain Option', 'North & South Indian Cuisine'],
  interests: ['Ancient Architecture', 'Heritage Forts', 'Photography', 'Spiritual Ghats', 'Local Food Trails'],
  locationPrivacy: 'fuzzy-location',
  gpsEnabled: true,
  obfuscationRadiusKm: 2.5,
};

export const SAMPLE_TRIP_TWINS: TripTwin[] = [
  {
    id: 'twin-jaipur-02',
    destination: 'Jaipur (Pink City)',
    country: 'India',
    durationDays: 3,
    totalBudgetUsd: 380,
    travelStyle: 'balanced',
    pace: 'moderate',
    privacyLevel: 'fuzzy-location',
    twinCompatibilityScore: 94,
    createdAt: '2026-07-29',
    imageUrl: '/src/assets/images/jaipur_palace_1785825746709.jpg',
    summary: 'Amber Fort Elephant-free hilltop route, Hawa Mahal street photography, Jal Mahal water palace sunset, and authentic Rajasthani Thali culinary trail.',
    highlights: ['Amber Fort Light & Sound Show (₹290)', 'Hawa Mahal Palace of Winds (₹50)', 'Nahargarh Fort Sunset Point (₹50)'],
    securityBadges: ['Strict Anonymous GPS', 'Role-Based Secured', 'Rajasthan Tourism Verified'],
    itinerary: [
      {
        day: 1,
        title: 'Pink City Heritage & Fortresses',
        theme: 'Royal Rajput Architecture',
        totalCostUsd: 140,
        crowdForecast: 'moderate',
        weatherForecast: '☀️ Sunny, 29°C',
        nodes: [
          {
            id: 'node-hawa-mahal',
            name: 'Hawa Mahal (Palace of Winds)',
            category: 'landmark',
            lat: 26.9239,
            lng: 75.8267,
            rating: 4.8,
            avgCostUsd: 6,
            entryFeeInr: '₹50 (Indians) / ₹200 (Foreigners)',
            crowdIndex: 40,
            weatherSensitivity: 'low',
            bestVisitingTime: '8:00 AM - 10:00 AM',
            description: 'Five-story pink sandstone honeycomb palace with 953 jharokhas designed for royal ladies to view street parades.',
            imageUrl: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=600&q=80',
            estimatedTimeMins: 60,
            twinMatchReason: 'Iconic photography spot with early morning light alignment.',
            nearbySpots: [
              {
                name: 'City Palace Jaipur',
                category: 'Royal Residence',
                distKm: 0.6,
                entryFeeInr: '₹300 (Indians) / ₹1000 (Foreigners)',
                rating: 4.7,
                crowdIndex: 45,
                description: 'Palace complex with Peacock Courtyard, royal armory, and textiles museum.'
              },
              {
                name: 'Jantar Mantar Astronomical Observatory',
                category: 'UNESCO Science Site',
                distKm: 0.5,
                entryFeeInr: '₹50 (Indians) / ₹200 (Foreigners)',
                rating: 4.6,
                crowdIndex: 30,
                description: '18th-century stone sundials and astronomical instruments.'
              },
              {
                name: 'LMB (Laxmi Misthan Bhandar)',
                category: 'Authentic Food',
                distKm: 0.4,
                entryFeeInr: 'Avg ₹350 for Ghevar & Pyaz Kachori',
                rating: 4.8,
                crowdIndex: 50,
                description: 'Famous 1737 sweet shop serving Ghevar, Dal Baati Churma, and Kachoris.'
              }
            ]
          },
          {
            id: 'node-amber-fort',
            name: 'Amber Fort (Amer Fort Hilltop)',
            category: 'landmark',
            lat: 26.9855,
            lng: 75.8513,
            rating: 4.9,
            avgCostUsd: 12,
            entryFeeInr: '₹100 (Indians) / ₹550 (Foreigners)',
            crowdIndex: 30,
            weatherSensitivity: 'high',
            bestVisitingTime: '3:30 PM - 6:00 PM',
            description: 'Majestic hilltop fort overlooking Maota Lake with Sheesh Mahal mirror palace and Diwan-i-Aam.',
            imageUrl: 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=600&q=80',
            estimatedTimeMins: 150,
            twinMatchReason: 'Matches your interest in heritage forts and architectural photography.'
          }
        ]
      }
    ]
  },
  {
    id: 'twin-agra-01',
    destination: 'Agra',
    country: 'India',
    durationDays: 2,
    totalBudgetUsd: 250,
    travelStyle: 'balanced',
    pace: 'moderate',
    privacyLevel: 'fuzzy-location',
    twinCompatibilityScore: 96,
    createdAt: '2026-08-01',
    imageUrl: '/src/assets/images/taj_mahal_agra_1785825666257.jpg',
    summary: 'Sunrise Taj Mahal entry simulation with zero queue delay, Agra Fort acoustic tour, and quiet evening view from Mehtab Bagh across the Yamuna.',
    highlights: [
      'Taj Mahal Sunrise Gate at 5:45 AM (₹50 Entry)',
      'Agra Fort Diwan-i-Khas Walk (₹50 Entry)',
      'Mehtab Bagh Sunset Reflection (₹25 Entry)',
    ],
    securityBadges: ['Encrypted Location', 'AI Guard Checked', 'Official Archaeological Survey Verified'],
    itinerary: [
      {
        day: 1,
        title: 'Mughal Architectural Marvels',
        theme: 'World Heritage & Sunrise Views',
        totalCostUsd: 120,
        crowdForecast: 'low',
        weatherForecast: '☀️ Pleasant Morning, 26°C',
        alternativeRainPlan: 'Covered galleries inside Agra Fort museum and Taj Museum inside complex.',
        alternativeCrowdPlan: 'Enter via Eastern Gate instead of crowded Western Gate.',
        nodes: [
          {
            id: 'node-taj-mahal',
            name: 'Taj Mahal (West/East Gate)',
            category: 'landmark',
            lat: 27.1751,
            lng: 78.0421,
            rating: 4.9,
            avgCostUsd: 15,
            entryFeeInr: '₹50 (Indians) / ₹1,100 (Foreigners) + ₹200 Main Mausoleum',
            crowdIndex: 22,
            weatherSensitivity: 'high',
            bestVisitingTime: '5:45 AM - 8:30 AM (Bypasses peak 4-hour queue)',
            description: '17th-century white marble mausoleum built by Shah Jahan, famous worldwide for pristine symmetry.',
            imageUrl: '/src/assets/images/taj_mahal_agra_1785825666257.jpg',
            estimatedTimeMins: 150,
            twinMatchReason: 'Simulated 5:45 AM arrival bypasses tour buses for optimal light photography.',
            transitFromPrev: [
              { mode: 'Auto-Rickshaw', estMins: 15, estCostInr: '₹120' },
              { mode: 'Taxi / Cab', estMins: 10, estCostInr: '₹300' }
            ],
            nearbySpots: [
              {
                name: 'Taj Nature Walk & Forest Trail',
                category: 'Nature Park',
                distKm: 0.8,
                entryFeeInr: '₹20 (Indians)',
                rating: 4.5,
                crowdIndex: 15,
                description: 'Serene woodland trail with views of Taj Mahal rising above tree line.'
              },
              {
                name: 'Pancchhi Petha Historic Sweet Mart',
                category: 'Local Culinary',
                distKm: 1.2,
                entryFeeInr: 'Free Entry (Avg ₹150 for tasting box)',
                rating: 4.7,
                crowdIndex: 30,
                description: 'Famous 100-year-old shop serving authentic translucent Agra Petha.'
              },
              {
                name: 'Shilpgram Craft Village',
                category: 'Culture & Arts',
                distKm: 1.5,
                entryFeeInr: '₹10 (Indians)',
                rating: 4.4,
                crowdIndex: 25,
                description: 'Open-air craft complex showcasing marble inlay artisans and zardozi embroidery.'
              }
            ]
          },
          {
            id: 'node-agra-fort',
            name: 'Agra Fort (Red Sandstone Citadel)',
            category: 'landmark',
            lat: 27.1795,
            lng: 78.0211,
            rating: 4.8,
            avgCostUsd: 10,
            entryFeeInr: '₹50 (Indians) / ₹650 (Foreigners)',
            crowdIndex: 35,
            weatherSensitivity: 'medium',
            bestVisitingTime: '10:00 AM - 12:30 PM',
            description: 'Massive 16th-century Mughal red sandstone fortress housing Jahangir Palace & Sheesh Mahal.',
            imageUrl: 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=600&q=80',
            estimatedTimeMins: 120,
            twinMatchReason: 'Deep historical importance with shaded royal pavilions.',
            transitFromPrev: [
              { mode: 'Auto-Rickshaw', estMins: 12, estCostInr: '₹100' },
              { mode: 'Walking', estMins: 25, estCostInr: '₹0' }
            ],
            nearbySpots: [
              {
                name: 'Jama Masjid Agra',
                category: 'Heritage Mosque',
                distKm: 1.0,
                entryFeeInr: 'Free Entry',
                rating: 4.4,
                crowdIndex: 40,
                description: '17th-century mosque built by Shah Jahan for daughter Jahanara Begum.'
              },
              {
                name: 'Kinari Bazaar Spice & Textile Market',
                category: 'Shopping Trail',
                distKm: 0.9,
                entryFeeInr: 'Free Entry',
                rating: 4.6,
                crowdIndex: 55,
                description: 'Bustling alleyways filled with handicrafts, zardozi silks, and brassware.'
              }
            ]
          },
          {
            id: 'node-mehtab-bagh',
            name: 'Mehtab Bagh (Moonlight Garden)',
            category: 'nature',
            lat: 27.1800,
            lng: 78.0423,
            rating: 4.7,
            avgCostUsd: 5,
            entryFeeInr: '₹25 (Indians) / ₹300 (Foreigners)',
            crowdIndex: 20,
            weatherSensitivity: 'high',
            bestVisitingTime: '5:00 PM - 6:30 PM (Sunset)',
            description: 'Charbagh garden complex directly across Yamuna River offering panoramic Taj sunset reflections.',
            imageUrl: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=600&q=80',
            estimatedTimeMins: 90,
            twinMatchReason: 'Low crowd index sunset spot with zero noise pollution.',
            transitFromPrev: [
              { mode: 'Auto-Rickshaw', estMins: 20, estCostInr: '₹150' },
              { mode: 'Taxi / Cab', estMins: 15, estCostInr: '₹250' }
            ],
            nearbySpots: [
              {
                name: 'Gyarah Sidi (Eleven Steps Observatory)',
                category: 'Historical Ruins',
                distKm: 0.5,
                entryFeeInr: 'Free Entry',
                rating: 4.2,
                crowdIndex: 10,
                description: 'Mughal astronomical observatory steps overlooking Yamuna floodplains.'
              }
            ]
          }
        ]
      },
      {
        day: 2,
        title: 'Fatehpur Sikri & Tomb of Itmad-ud-Daulah',
        theme: 'Ghost City & Baby Taj',
        totalCostUsd: 130,
        crowdForecast: 'low',
        weatherForecast: '🌤️ Breezy, 27°C',
        alternativeRainPlan: 'Indoor museum exhibits at Fatehpur Sikri ASI complex.',
        alternativeCrowdPlan: 'Explore Buland Darwaza via quiet northern staircase.',
        nodes: [
          {
            id: 'node-baby-taj',
            name: 'Tomb of Itmad-ud-Daulah (Baby Taj)',
            category: 'landmark',
            lat: 27.1928,
            lng: 78.0310,
            rating: 4.8,
            avgCostUsd: 8,
            entryFeeInr: '₹30 (Indians) / ₹310 (Foreigners)',
            crowdIndex: 18,
            weatherSensitivity: 'medium',
            bestVisitingTime: '9:00 AM - 11:00 AM',
            description: 'Mughal mausoleum nicknamed Baby Taj, often considered draft for Taj Mahal with intricate marble lattice screens.',
            imageUrl: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=600&q=80',
            estimatedTimeMins: 75,
            twinMatchReason: 'High rating with 80% fewer crowds than main Taj.'
          }
        ]
      }
    ]
  },
  {
    id: 'twin-goa-03',
    destination: 'Goa',
    country: 'India',
    durationDays: 3,
    totalBudgetUsd: 320,
    travelStyle: 'balanced',
    pace: 'relaxed',
    privacyLevel: 'strict-anonymous',
    twinCompatibilityScore: 92,
    createdAt: '2026-07-25',
    imageUrl: '/src/assets/images/goa_beach_sunset_1785825758662.jpg',
    summary: 'Fontainhas Latin Quarter heritage stroll, Fort Aguada cliff vistas, Spice Plantation authentic lunch, and quiet sunset at Palolem Beach.',
    highlights: ['Fontainhas Portuguese Walk (Free)', 'Fort Aguada & Lighthouse (₹50)', 'Dudhsagar Waterfalls Jeep Trail (₹500)'],
    securityBadges: ['Encrypted GPS', 'Goa Tourism Verified', 'AI Safety Checked'],
    itinerary: [
      {
        day: 1,
        title: 'Old Goa Heritage & Portuguese Architecture',
        theme: 'Colonial History & Beaches',
        totalCostUsd: 110,
        crowdForecast: 'low',
        weatherForecast: '⛅ Pleasant Breeze, 28°C',
        nodes: [
          {
            id: 'node-bom-jesus',
            name: 'Basilica of Bom Jesus (UNESCO Site)',
            category: 'culture',
            lat: 15.5009,
            lng: 73.9116,
            rating: 4.8,
            avgCostUsd: 2,
            entryFeeInr: 'Free Entry',
            crowdIndex: 25,
            weatherSensitivity: 'low',
            bestVisitingTime: '9:00 AM - 11:00 AM',
            description: '16th-century baroque church holding mortal remains of St. Francis Xavier.',
            imageUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=80',
            estimatedTimeMins: 75,
            twinMatchReason: 'Quiet spiritual heritage location.',
            nearbySpots: [
              {
                name: 'Se Cathedral',
                category: 'Heritage Church',
                distKm: 0.3,
                entryFeeInr: 'Free Entry',
                rating: 4.7,
                crowdIndex: 20,
                description: 'One of Asia\'s largest churches housing Golden Bell.'
              },
              {
                name: 'Fontainhas Latin Quarter Panaji',
                category: 'Colonial Streets',
                distKm: 9.0,
                entryFeeInr: 'Free Entry',
                rating: 4.8,
                crowdIndex: 30,
                description: 'Brightly painted Portuguese-style heritage houses and cozy cafes.'
              }
            ]
          }
        ]
      }
    ]
  }
];

export const SECURITY_CHECKLIST: SecurityAuditItem[] = [
  {
    id: 'sec-01',
    category: 'User Authentication',
    title: 'JWT Session & OAuth Security',
    status: 'passed',
    details: 'JWT tokens use strong HS256 signatures with 1-hour expiration and secure HTTP-only cookie handling.'
  },
  {
    id: 'sec-02',
    category: 'Personal Data Protection',
    title: 'In-Transit Encryption & Anonymization',
    status: 'passed',
    details: 'User profiles and saved trips encrypted via TLS 1.3. Zero persistent identity tracking across sessions.'
  },
  {
    id: 'sec-03',
    category: 'Location Privacy',
    title: 'Fuzzy GPS Obfuscation Shield',
    status: 'active',
    details: 'Location queries are offset by a user-configured 2.5km fuzzy radius before hitting external map tools.',
    actionLabel: 'Configure Radius'
  },
  {
    id: 'sec-04',
    category: 'API Security',
    title: 'Server-Side API Key Proxies',
    status: 'passed',
    details: 'Gemini API and external location keys are strictly guarded server-side and never exposed to browser context.'
  },
  {
    id: 'sec-05',
    category: 'Review Moderation',
    title: 'AI Spam & Sentiment Filter',
    status: 'passed',
    details: 'Automated Gemini review verification active. Prevents fake reviews, malicious links, and offensive text.'
  },
  {
    id: 'sec-06',
    category: 'AI Safety',
    title: 'Prompt Injection Defense',
    status: 'passed',
    details: 'Strict prompt sanitizer and JSON schema validation active on all server-side Gemini decision prompts.'
  },
  {
    id: 'sec-07',
    category: 'Database & Backend',
    title: 'SQL Injection & ORM Guardrails',
    status: 'passed',
    details: 'All backend queries parameterized. Strict least-privilege role permissions enforced.'
  },
  {
    id: 'sec-08',
    category: 'Admin Security',
    title: 'Role-Based Access Control (RBAC)',
    status: 'passed',
    details: 'Sensitive admin actions (review purge, system logs, place edits) require elevated admin token.'
  }
];

export const SAMPLE_REVIEWS: ReviewItem[] = [
  {
    id: 'rev-101',
    user: 'Rohan K.',
    placeName: 'Taj Mahal (West Gate)',
    rating: 5,
    comment: 'The 5:45 AM Velora Digital Twin suggestion saved us from a 3-hour queue! Entered in 5 mins and paid ₹50 at counter.',
    date: '2026-08-02',
    status: 'approved'
  },
  {
    id: 'rev-102',
    user: 'Priya M.',
    placeName: 'Hawa Mahal Jaipur',
    rating: 5,
    comment: 'Velora AI suggested the rooftop cafe opposite Hawa Mahal for photo views away from street traffic. Brilliant spot!',
    date: '2026-08-01',
    status: 'approved'
  },
  {
    id: 'rev-103',
    user: 'Bot_Spammer41',
    placeName: 'Baga Beach Goa',
    rating: 1,
    comment: 'CLICK HERE FOR CHEAP CAB VOUCHERS http://scam-link.test/free-ride',
    date: '2026-08-03',
    status: 'flagged',
    aiModerationReason: 'Automated AI Moderation: Flagged spam URL link and suspicious promotional text.'
  }
];

export const SAMPLE_EMERGENCY_CONTACTS: EmergencyContact[] = [
  {
    id: 'emg-1',
    name: 'District Hospital & Trauma Center Agra',
    type: 'Hospital',
    phone: '+91 562 242 0000',
    address: 'Near MG Road, Tajganj, Agra, UP',
    distKm: 1.8,
    lat: 27.1800,
    lng: 78.0100,
    is24x7: true
  },
  {
    id: 'emg-2',
    name: 'Tourist Police Station Agra (Taj Protection)',
    type: 'Police Station',
    phone: '+91 562 222 6666 / 112',
    address: 'East Gate Road, Tajganj, Agra',
    distKm: 0.6,
    lat: 27.1720,
    lng: 78.0450,
    is24x7: true
  },
  {
    id: 'emg-3',
    name: 'National Tourist Helpline India (24x7 Toll Free)',
    type: 'Tourist Helpline',
    phone: '1363 / 1800-11-1363',
    address: 'Ministry of Tourism, Govt of India',
    distKm: 0.0,
    lat: 28.6139,
    lng: 77.2090,
    is24x7: true
  },
  {
    id: 'emg-4',
    name: 'Apollo Hospital Emergency ER Line',
    type: 'Hospital',
    phone: '1066 / +91 11 2692 5858',
    address: 'Mathura Road, NCR Sector',
    distKm: 3.5,
    lat: 27.2000,
    lng: 78.0300,
    is24x7: true
  }
];

export const SAMPLE_QR_TICKETS: QRTicket[] = [
  {
    id: 'qr-taj-01',
    monumentName: 'Taj Mahal & Main Mausoleum',
    passType: 'Indian Citizen Entry',
    validDate: '2026-08-04',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=VELORA_ASI_TICKET_TAJ_MAHAL_2026_08_04_50INR',
    costInr: '₹250 (Entry ₹50 + Mausoleum ₹200)',
    status: 'active'
  },
  {
    id: 'qr-fort-02',
    monumentName: 'Agra Fort Red Sandstone Citadel',
    passType: 'ASI Heritage Combo Pass',
    validDate: '2026-08-04',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=VELORA_ASI_TICKET_AGRA_FORT_2026_08_04_50INR',
    costInr: '₹50',
    status: 'active'
  },
  {
    id: 'qr-hawa-03',
    monumentName: 'Hawa Mahal & City Palace Combo',
    passType: 'Indian Citizen Entry',
    validDate: '2026-08-06',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=VELORA_JAIPUR_TICKET_HAWA_MAHAL_2026_08_06',
    costInr: '₹350',
    status: 'active'
  }
];

export const SAMPLE_EXPENSES: ExpenseItem[] = [
  { id: 'exp-1', title: 'Taj Mahal Sunrise Ticket + Mausoleum', category: 'Monument Tickets', amountInr: 250, date: '2026-08-04' },
  { id: 'exp-2', title: 'Auto Ride from Hotel to East Gate', category: 'Auto & Transit', amountInr: 120, date: '2026-08-04' },
  { id: 'exp-3', title: 'Panchhi Petha Gift Box & Tea', category: 'Food & Dining', amountInr: 220, date: '2026-08-04' },
  { id: 'exp-4', title: 'Agra Fort Audio Guide & Ticket', category: 'Monument Tickets', amountInr: 150, date: '2026-08-04' },
  { id: 'exp-5', title: 'Heritage Haveli Hotel (Night 1)', category: 'Hotel & Stay', amountInr: 2400, date: '2026-08-04' }
];

export const SAMPLE_PACKING_LIST: PackingItem[] = [
  { id: 'pack-1', item: 'Aadhaar / Passport ID Copy', category: 'Documents & Cash', packed: true },
  { id: 'pack-2', item: 'UPI App & Small Cash (₹100/₹200 notes for Autos)', category: 'Documents & Cash', packed: true },
  { id: 'pack-3', item: 'Light Cotton Clothes & Scarf (for temples)', category: 'Clothing', packed: true },
  { id: 'pack-4', item: 'Power Bank 20,000mAh & Fast Charger', category: 'Electronics', packed: false },
  { id: 'pack-5', item: 'Sunscreen SPF 50 & Water Bottle', category: 'Sun & Rain Protection', packed: false },
  { id: 'pack-6', item: 'ORSL Electrolytes & ORS Pouches', category: 'Medicines', packed: true },
  { id: 'pack-7', item: 'Foldable Compact Umbrella', category: 'Sun & Rain Protection', packed: false }
];

export const INDIAN_LANGUAGE_PHRASES: TranslatorPhrase[] = [
  {
    id: 'phr-1',
    english: 'How much for Auto-Rickshaw to destination?',
    hindi: 'यहाँ से ऑटो का कितना किराया होगा?',
    tamil: 'இங்கிருந்து ஆட்டோவுக்கு எவ்வளவு கட்டணம்?',
    phonetic: 'Yahan se auto ka kitna kiraya hoga?',
    category: 'Autos & Bargaining',
    translations: {
      Hindi: { text: 'यहाँ से ऑटो का कितना किराया होगा?', phonetic: 'Yahan se auto ka kitna kiraya hoga?' },
      Tamil: { text: 'இங்கிருந்து ஆட்டோவுக்கு எவ்வளவு கட்டணம்?', phonetic: 'Ingirundhu auto-vukku evvalavu kattanam?' },
      Bengali: { text: 'এখানে অটো ভাড়া কত হবে?', phonetic: 'Ekhane auto bhara koto hobe?' },
      Telugu: { text: 'ఇక్కడి నుండి ఆటో కి ఎంత ఛార్జ్ చేస్తారు?', phonetic: 'Ikkadi nundi auto ki entha charge chestharu?' },
      Marathi: { text: 'इथून ऑटोचे भाडे किती होईल?', phonetic: 'Ithun auto che bhade kiti hoil?' },
      Kannada: { text: 'இல்லிங் ஆட்டೋ ಬಾಡಿಗೆ ಎಷ್ಟು?', phonetic: 'Illimga auto baadige eshtu?' },
      Gujarati: { text: 'અહીંથી ઓટોનું ભાડું કેટલું થશે?', phonetic: 'Ahin thi auto nu bhaadu ketlu thase?' },
      Malayalam: { text: 'ഇവിടെ നിന്ന് ഓട്ടോയ്ക്ക് എത്ര വാടകയാകും?', phonetic: 'Ivide ninnu auto-ykk etra vaadakayaakum?' }
    }
  },
  {
    id: 'phr-2',
    english: 'Is there a Pure Vegetarian / Jain food option?',
    hindi: 'क्या यहाँ शुद्ध शाकाहारी या जैन खाना उपलब्ध है?',
    tamil: 'இங்கே சுத்த சைவ உணவு கிடைக்குமா?',
    phonetic: 'Kya yahan shuddh shakahari ya jain khana uplabdh hai?',
    category: 'Dining & Food',
    translations: {
      Hindi: { text: 'क्या यहाँ शुद्ध शाकाहारी या जैन खाना उपलब्ध है?', phonetic: 'Kya yahan shuddh shakahari ya jain khana uplabdh hai?' },
      Tamil: { text: 'இங்கே சுத்த சைவ உணவு கிடைக்குமா?', phonetic: 'Inge sutha saiva unavu kidaikuma?' },
      Bengali: { text: 'এখানে কি খাঁটি নিরামিষ খাবার পাওয়া যাবে?', phonetic: 'Ekhane ki khati niramish khabar pawa jabe?' },
      Telugu: { text: 'ఇక్కడ శుద్ధ శాకాహారం లేదా జైన్ భోజనం దొరుకుతుందా?', phonetic: 'Ikkada shuddha shakaharam leda Jain bhojanam dorukuthunda?' },
      Marathi: { text: 'येथे शुद्ध शाकाहारी किंवा जैन जेवण मिळेल का?', phonetic: 'Yethe shuddh shakahari kimva Jain jevan milel ka?' },
      Kannada: { text: 'ಇಲ್ಲಿ ಶುದ್ಧ ಸಸ್ಯಾಹಾರ ಸಿಗುತ್ತದೆಯೇ?', phonetic: 'Illi shuddha sasyaahara siguthadeye?' },
      Gujarati: { text: 'શું અહીં શુદ્ધ શાકાહારી ભોજન મળશે?', phonetic: 'Shu ahin shuddh shakahari bhojan malse?' },
      Malayalam: { text: 'ഇവിടെ പൂർണ്ണ സസ്യാഹാരം ലഭ്യമാണോ?', phonetic: 'Ivide poornna sasyaahaaram labhyamaano?' }
    }
  },
  {
    id: 'phr-3',
    english: 'Where is the main entrance / ticket counter?',
    hindi: 'मुख्य प्रवेश द्वार और टिकट काउंटर कहाँ है?',
    tamil: 'முக்கிய நுழைவாயில் மற்றும் டிக்கெட் கவுண்டர் எங்கே?',
    phonetic: 'Mukhya pravesh dwar aur ticket counter kahan hai?',
    category: 'Directions',
    translations: {
      Hindi: { text: 'मुख्य प्रवेश द्वार और टिकट काउंटर कहाँ है?', phonetic: 'Mukhya pravesh dwar aur ticket counter kahan hai?' },
      Tamil: { text: 'முக்கிய நுழைவாயில் மற்றும் டிக்கெட் கவுண்டர் எங்கே?', phonetic: 'Mukkiya nulaivaayil matrum ticket counter enge?' },
      Bengali: { text: 'প্রধান প্রবেশদ্বার ও টিকিট কাউন্টার কোথায়?', phonetic: 'Prodhān probeshdwār o ticket counter kothāy?' },
      Telugu: { text: 'ముఖ్య ప్రవేశ ద్వారం మరియు టికెట్ కౌంటర్ ఎక్కడ ఉంది?', phonetic: 'Mukhya pravesha dwaram mariyu ticket counter ekkada undi?' },
      Marathi: { text: 'मुख्य प्रवेशद्वार आणि तिकीट काउंटर कुठे आहे?', phonetic: 'Mukhya praveshdwar ani ticket counter kuthe aahe?' },
      Kannada: { text: 'ಮುಖ್ಯ પ્રવેશದ್ವಾರ ಮತ್ತು ಟಿಕೆಟ್ ಕೌಂಟರ್ ಎಲ್ಲಿದೆ?', phonetic: 'Mukhya praveshadwaara mathu ticket counter ellide?' },
      Gujarati: { text: 'મુખ્ય પ્રવેશદ્વાર અને ટિકિટ કાઉન્ટર ક્યાં છે?', phonetic: 'Mukhya praveshdwar ane ticket counter kyan chhe?' },
      Malayalam: { text: 'പ്രധാന കവാടവും ടിക്കറ്റ് കൗണ്ടറും എവിടെയാണ്?', phonetic: 'Pradhaana kavaatavum ticket counter-um evideyaan?' }
    }
  },
  {
    id: 'phr-4',
    english: 'Can I pay using UPI / QR Code / Google Pay?',
    hindi: 'क्या यहाँ UPI या क्यूआर कोड से भुगतान कर सकते हैं?',
    tamil: 'இங்கே UPI அல்லது QR கோட் மூலம் பணம் செலுத்தலாமா?',
    phonetic: 'Kya yahan UPI ya QR code se bhugtan kar sakte hain?',
    category: 'Autos & Bargaining',
    translations: {
      Hindi: { text: 'क्या यहाँ UPI या क्यूआर कोड से पेमेंट कर सकते हैं?', phonetic: 'Kya yahan UPI ya QR code se payment kar sakte hain?' },
      Tamil: { text: 'இங்கே UPI அல்லது GPay மூலமாக பேமெண்ட் செய்யலாமா?', phonetic: 'Inge UPI alladhu GPay moolamaaga payment seyyalaama?' },
      Bengali: { text: 'এখানে কি UPI বা PhonePe পেমেন্ট নেওয়া হয়?', phonetic: 'Ekhane ki UPI ba PhonePe payment newa hoy?' },
      Telugu: { text: 'ఇక్కడ GPay లేదా PhonePe పని చేస్తుందా?', phonetic: 'Ikkada GPay leda PhonePe pani chesthunda?' },
      Marathi: { text: 'येथे UPI किंवा QR कोडने ऑनलाइन पेमेंट चालेल का?', phonetic: 'Yethe UPI kimva QR code ne online payment chalel ka?' },
      Kannada: { text: 'ಇಲ್ಲಿ UPI ಅಥವಾ PhonePe ಪಾವತಿ ಸ್ವೀಕರಿಸುತ್ತೀರಾ?', phonetic: 'Illi UPI athava PhonePe paavati sveekarisutheera?' },
      Gujarati: { text: 'શું અહીં UPI કે GPay સ્વીકારશો?', phonetic: 'Shu ahin UPI ke GPay sveekarsho?' },
      Malayalam: { text: 'ഇവിടെ Google Pay വഴി പണം നൽകാനാകുമോ?', phonetic: 'Ivide Google Pay vazhi panam nalkaanaakumo?' }
    }
  },
  {
    id: 'phr-5',
    english: 'Emergency! Please call a doctor or police immediately!',
    hindi: 'आपातकाल! कृपया तुरंत डॉक्टर या पुलिस को बुलाएं।',
    tamil: 'அவசரம்! தயவுசெய்து உடனடியாக மருத்துவரை அல்லது காவல்துறையை அழையுங்கள்.',
    phonetic: 'Aapatkaal! Kripya turant doctor ya police ko bulayen.',
    category: 'Emergency',
    translations: {
      Hindi: { text: 'आपातकाल! कृपया तुरंत डॉक्टर या पुलिस को बुलाएं।', phonetic: 'Aapatkaal! Kripya turant doctor ya police ko bulayen.' },
      Tamil: { text: 'அவசரம்! தயவுசெய்து உடனடியாக காவல்துறையை அழையுங்கள்.', phonetic: 'Avasaram! Thayavuseydhu udanadiyaaga police-ai azhaiyungal.' },
      Bengali: { text: 'জরুরী আপাতকাল! দয়া করে পুলিশ বা ডাক্তার ডাকুন।', phonetic: 'Joruri aapatkal! Daya kore police ba doctor dakun.' },
      Telugu: { text: 'అత్యవసరం! దయచేసి వెంటనే పోలీస్ లేదా డాక్టర్‌ని పిలవండి.', phonetic: 'Athyavasaram! Dayachesi ventane police leda doctor-ni pilavandi.' },
      Marathi: { text: 'आणीबाणी! कृपया ताबडतोब डॉक्टर किंवा पोलिसांना बोलवा.', phonetic: 'Aanibaani! Kripaya tabadtob doctor kimva police na bolva.' },
      Kannada: { text: 'ತುರ್ತು పరిస్థಿತಿ! ದಯವಿಟ್ಟು ಪೋಲಿಸ್ ಅಥವಾ ವೈದ್ಯರನ್ನು ಕರೆಯಿರಿ.', phonetic: 'Thurtu paristhiti! Dayavittu police athava vaidyarannu kareyiri.' },
      Gujarati: { text: 'ઇમરજન્સી! મહેરબાની કરીને તરત જ પોલીસને બોલાવો.', phonetic: 'Emergency! Meherbani karine tarat ja police ne bolavo.' },
      Malayalam: { text: 'അടിയന്തിരാവസ്ഥ! ദയവായി ഉടൻ പോലീസിനെയോ ഡോക്ടറെയോ വിളിക്കൂ.', phonetic: 'Adiyanthiraavastha! Dayavaayi udan police-ineyo doctor-eyo vilikku.' }
    }
  },
  {
    id: 'phr-6',
    english: 'Please make it less spicy and clean water please.',
    hindi: 'कृपया मिर्च कम रखें और पीने का साफ पानी दीजिए।',
    tamil: 'காரத்தைக் குறைத்து, சுத்தமான குடிநீர் தரவும்.',
    phonetic: 'Kripya mirch kam rakhen aur peene ka saaf paani dijiye.',
    category: 'Dining & Food',
    translations: {
      Hindi: { text: 'कृपया मिर्च कम रखें और पीने का साफ पानी दीजिए।', phonetic: 'Kripya mirch kam rakhen aur peene ka saaf paani dijiye.' },
      Tamil: { text: 'காரத்தைக் குறைத்து, சுத்தமான குடிநீர் தரவும்.', phonetic: 'Kaarathai kuraithu, suthamana kudineer tharavum.' },
      Bengali: { text: 'ঝাল কম দেবেন এবং পরিষ্কার খাবার জল দিন।', phonetic: 'Jhal kom deben ebong porishkar khabar jol din.' },
      Telugu: { text: 'కారంగా చేయకండి, మంచినీళ్ళు ఇవ్వండి.', phonetic: 'Kaaranga cheyakandi, manchineellu ivvandi.' },
      Marathi: { text: 'कृपया तिखट कमी करा आणि पिण्याचे स्वच्छ पाणी द्या.', phonetic: 'Kripaya tikhat kami kara ani pinyache swachh pani dya.' },
      Kannada: { text: 'ಖಾರ ಕಡಿಮೆ ಮಾಡಿ ಮತ್ತು ಕುಡಿಯುವ ನೀರು ಕೊಡಿ.', phonetic: 'Khaara kadime maadi mathu kudiyuva neeru kodi.' },
      Gujarati: { text: 'તીખું ઓછું રાખજો અને પીવાનું ચોખ્ખું પાણી આપજો.', phonetic: 'Teekhu ochhu rakhjo ane peevanu chokkhu pani aapjo.' },
      Malayalam: { text: 'എരിവ് കുറച്ച് വൃത്തിയുള്ള കുടിവെള്ളം തരൂ.', phonetic: 'Erivu kurachu vruthiyuulla kudivellam tharuu.' }
    }
  }
];

export const SAMPLE_LIVE_METRICS: LiveMetrics = {
  city: 'Agra, Uttar Pradesh',
  tempC: 27,
  weatherCondition: 'Partly Cloudy, Gentle Breeze',
  aqi: 68,
  aqiLabel: 'Moderate',
  localTime: '10:30 AM IST',
  usdToInr: 83.2,
  trafficStatus: 'Clear'
};

