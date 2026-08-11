import { LocationNode, TripTwin } from '../types';
import { getLocationImage } from '../services/locationImageService';
import { lookupKnownCoordinates } from './knownCoordinates';

export interface IndianAttractionRecord {
  id: string;
  zone: string;
  state: string;
  city: string;
  name: string;
  type: string;
  estYear: string;
  durationHrs: number;
  googleRating: number;
  entranceFeeInr: number;
  hasAirport: boolean;
  weeklyOff: string;
  significance: string;
  dslrAllowed: boolean;
  reviewCountLakhs: number;
  bestTime: string;
}

export interface IndianCityDetail {
  city: string;
  rating: number;
  idealDuration: string;
  bestTimeToVisit: string;
  description: string;
}

export const INDIAN_CITY_DETAILS: Record<string, IndianCityDetail> = {
  'Delhi': {
    city: 'Delhi',
    rating: 4.1,
    idealDuration: '3-5 days',
    bestTimeToVisit: 'October - March',
    description: 'The capital of India, a cosmopolitan city with historic Old Delhi and modern New Delhi. Famous for Mughal monuments like Red Fort, Jama Masjid, Humayun\'s Tomb, Qutub Minar, vibrant markets of Chandni Chowk, and mouth-watering street food.'
  },
  'Mumbai': {
    city: 'Mumbai',
    rating: 4.2,
    idealDuration: '3-5 days',
    bestTimeToVisit: 'October - February',
    description: 'The City of Dreams, capital of Maharashtra. A melting pot of glamour, coastal promenades, British colonial architecture, Gateway of India, Marine Drive, Siddhivinayak Temple, and vibrant street life.'
  },
  'Bangalore': {
    city: 'Bangalore',
    rating: 4.1,
    idealDuration: '2-3 days',
    bestTimeToVisit: 'September - March',
    description: 'India\'s Silicon Valley and Garden City, known for Cubbon Park, Lalbagh Botanical Gardens, Bangalore Palace, pleasant climate, craft breweries, and tech innovation.'
  },
  'Hyderabad': {
    city: 'Hyderabad',
    rating: 4.1,
    idealDuration: '2-4 days',
    bestTimeToVisit: 'October - March',
    description: 'The City of Pearls and Biryani. Home to Charminar, Golconda Fort, Ramoji Film City, Salar Jung Museum, and HiTech City.'
  },
  'Kolkata': {
    city: 'Kolkata',
    rating: 4.3,
    idealDuration: '2-4 days',
    bestTimeToVisit: 'October - March',
    description: 'The City of Joy, artistic and cultural capital of India. Home to Victoria Memorial, Howrah Bridge, Dakshineswar Kali Temple, Indian Museum, and iconic tramways.'
  },
  'Goa': {
    city: 'Goa',
    rating: 4.5,
    idealDuration: '3-7 days',
    bestTimeToVisit: 'November - February',
    description: 'India\'s beach paradise known for pristine golden sand beaches, Basilica of Bom Jesus, Fort Aguada, Dudhsagar Waterfalls, Portuguese heritage, and seafood.'
  },
  'Jaipur': {
    city: 'Jaipur',
    rating: 4.4,
    idealDuration: '2-3 days',
    bestTimeToVisit: 'November - March',
    description: 'The Pink City of Rajasthan. Famous for Hawa Mahal, Amber Fort, City Palace, Jantar Mantar, block printing crafts, and royal Rajasthani cuisine.'
  },
  'Udaipur': {
    city: 'Udaipur',
    rating: 4.3,
    idealDuration: '2-3 days',
    bestTimeToVisit: 'October - March',
    description: 'The City of Lakes, Venice of the East. Beautiful floating palaces, Lake Pichola, City Palace, Aravalli hills backdrop, and romantic sunsets.'
  },
  'Varanasi': {
    city: 'Varanasi',
    rating: 4.5,
    idealDuration: '2-3 days',
    bestTimeToVisit: 'October - March',
    description: 'World\'s oldest living city and spiritual capital of India. Kashi Vishwanath temple, Ganga Aarti at Dashashwamedh Ghat, narrow heritage galis, and silk handlooms.'
  },
  'Agra': {
    city: 'Agra',
    rating: 4.2,
    idealDuration: '1-2 days',
    bestTimeToVisit: 'October - March',
    description: 'Home to the iconic Taj Mahal, Agra Fort, and Fatehpur Sikri. Famous worldwide for Mughal architecture, marble inlay art, and sweet Petha.'
  },
  'Amritsar': {
    city: 'Amritsar',
    rating: 4.4,
    idealDuration: '2-3 days',
    bestTimeToVisit: 'October - March',
    description: 'Spiritual heart of Sikhism, home to Sri Harmandir Sahib (Golden Temple), Jallianwala Bagh memorial, Wagah Border retreat ceremony, and rich Punjabi kulchas.'
  },
  'Munnar': {
    city: 'Munnar',
    rating: 4.5,
    idealDuration: '2-3 days',
    bestTimeToVisit: 'September - March',
    description: 'Lush tea plantated hill station in Western Ghats of Kerala. Mist-covered peaks, Eravikulam National Park, endangered Nilgiri Tahr, and tea tasting trails.'
  },
  'Manali': {
    city: 'Manali',
    rating: 4.5,
    idealDuration: '2-4 days',
    bestTimeToVisit: 'October - June',
    description: 'Popular Himalayan adventure hub in Himachal Pradesh. Solang Valley paragliding, snow at Rohtang Pass, Old Manali cafes, and river rafting in Beas.'
  },
  'Leh': {
    city: 'Leh',
    rating: 4.6,
    idealDuration: '5-7 days',
    bestTimeToVisit: 'July - October',
    description: 'High-altitude desert in Ladakh. Pangong Tso lake, Nubra Valley sand dunes, Khardung La pass, ancient Buddhist gompas, and dramatically stark mountains.'
  },
  'Kochi': {
    city: 'Kochi',
    rating: 4.2,
    idealDuration: '1-2 days',
    bestTimeToVisit: 'October - March',
    description: 'Queen of the Arabian Sea. Chinese fishing nets, Fort Kochi colonial streets, Mattancherry Palace, spice markets, and Kathakali cultural performances.'
  },
  'Shimla': {
    city: 'Shimla',
    rating: 4.2,
    idealDuration: '2-4 days',
    bestTimeToVisit: 'March - June',
    description: 'Capital of Himachal Pradesh and summer capital of British India. Pedestrian Mall Road, The Ridge, Jakhoo Temple, and Kalka-Shimla UNESCO toy train.'
  },
  'Darjeeling': {
    city: 'Darjeeling',
    rating: 4.3,
    idealDuration: '2-3 days',
    bestTimeToVisit: 'March - May',
    description: 'Queen of the Hills in West Bengal. World-famous Darjeeling tea gardens, view of Kanchenjunga peak, Tiger Hill sunrise, and historic UNESCO Heritage steam train.'
  },
  'Hampi': {
    city: 'Hampi',
    rating: 4.5,
    idealDuration: '2-4 days',
    bestTimeToVisit: 'October - March',
    description: 'UNESCO World Heritage site in Karnataka. Majestic 15th-century Vijayanagara empire ruins, Virupaksha temple, stone chariot, boulder-strewn landscape across Tungabhadra.'
  },
  'Puri': {
    city: 'Puri',
    rating: 4.3,
    idealDuration: '1-2 days',
    bestTimeToVisit: 'October - March',
    description: 'Sacred coastal city in Odisha, home to Sri Jagannath Temple, annual Rath Yatra festival, golden sandy beaches of Bay of Bengal, and Chilika lake.'
  },
  'Chennai': {
    city: 'Chennai',
    rating: 3.9,
    idealDuration: '2-3 days',
    bestTimeToVisit: 'November - February',
    description: 'Gateway to South India. Marina Beach, Kapaleeshwarar temple, San Thome Basilica, Carnatic music heritage, and classicfilter coffee.'
  },
  'Madurai': {
    city: 'Madurai',
    rating: 4.1,
    idealDuration: '1-2 days',
    bestTimeToVisit: 'October - March',
    description: 'Cultural capital of Tamil Nadu, Lotus City. World famous Meenakshi Amman Temple with sculptured gopurams, Thirumalai Nayakkar Palace, and 24-hour food streets.'
  },
  'Visakhapatnam': {
    city: 'Visakhapatnam',
    rating: 4.4,
    idealDuration: '2-3 days',
    bestTimeToVisit: 'October - March',
    description: 'Jewel of the East Coast in Andhra Pradesh. Rishikonda Beach, INS Kursura Submarine Museum, Kailasagiri hill views, Borra Caves, and Araku Valley.'
  },
  'Rishikesh': {
    city: 'Rishikesh',
    rating: 4.3,
    idealDuration: '2-3 days',
    bestTimeToVisit: 'September - June',
    description: 'Yoga Capital of the World along holy Ganges river in Uttarakhand. Laxman Jhula, Beatles Ashram, white-water rafting, and serene evening Ganga Aarti.'
  },
  'Gangtok': {
    city: 'Gangtok',
    rating: 4.4,
    idealDuration: '2-4 days',
    bestTimeToVisit: 'March - May',
    description: 'Capital of Sikkim surrounded by Himalayan snow peaks. Views of Mt. Kanchenjunga, Tsomgo Lake, Nathula Pass, Rumtek Monastery, and MG Marg promenade.'
  }
};

export const ALL_INDIAN_ATTRACTIONS: IndianAttractionRecord[] = [
  // Dharmapuri & Tamil Nadu
  { id: 'att-dharmapuri-1', zone: 'Southern', state: 'Tamil Nadu', city: 'Dharmapuri', name: 'Hogenakkal Falls', type: 'Waterfall', estYear: 'Natural', durationHrs: 3.0, googleRating: 4.6, entranceFeeInr: 20, hasAirport: false, weeklyOff: 'None', significance: 'Natural Wonder', dslrAllowed: true, reviewCountLakhs: 0.8, bestTime: 'Morning' },
  { id: 'att-dharmapuri-2', zone: 'Southern', state: 'Tamil Nadu', city: 'Dharmapuri', name: 'Theerthamalai Temple', type: 'Temple', estYear: 'Ancient', durationHrs: 2.0, googleRating: 4.7, entranceFeeInr: 0, hasAirport: false, weeklyOff: 'None', significance: 'Spiritual Heritage', dslrAllowed: true, reviewCountLakhs: 0.25, bestTime: 'Morning' },
  { id: 'att-dharmapuri-3', zone: 'Southern', state: 'Tamil Nadu', city: 'Dharmapuri', name: 'Dharmapuri Fort & Mallikarjuna Temple', type: 'Temple', estYear: '1500', durationHrs: 1.5, googleRating: 4.5, entranceFeeInr: 0, hasAirport: false, weeklyOff: 'None', significance: 'Historical Architecture', dslrAllowed: true, reviewCountLakhs: 0.15, bestTime: 'Afternoon' },
  { id: 'att-dharmapuri-4', zone: 'Southern', state: 'Tamil Nadu', city: 'Dharmapuri', name: 'Subramanya Siva Memorial Park', type: 'Memorial', estYear: '1980', durationHrs: 1.0, googleRating: 4.4, entranceFeeInr: 0, hasAirport: false, weeklyOff: 'None', significance: 'Freedom Movement Heritage', dslrAllowed: true, reviewCountLakhs: 0.1, bestTime: 'Evening' },

  // Delhi
  { id: 'att-0', zone: 'Northern', state: 'Delhi', city: 'Delhi', name: 'India Gate', type: 'War Memorial', estYear: '1921', durationHrs: 0.5, googleRating: 4.6, entranceFeeInr: 0, hasAirport: true, weeklyOff: 'None', significance: 'Historical', dslrAllowed: true, reviewCountLakhs: 2.6, bestTime: 'Evening' },
  { id: 'att-1', zone: 'Northern', state: 'Delhi', city: 'Delhi', name: "Humayun's Tomb", type: 'Tomb', estYear: '1572', durationHrs: 2.0, googleRating: 4.5, entranceFeeInr: 30, hasAirport: true, weeklyOff: 'None', significance: 'Historical', dslrAllowed: true, reviewCountLakhs: 0.4, bestTime: 'Afternoon' },
  { id: 'att-2', zone: 'Northern', state: 'Delhi', city: 'Delhi', name: 'Akshardham Temple', type: 'Temple', estYear: '2005', durationHrs: 5.0, googleRating: 4.6, entranceFeeInr: 60, hasAirport: true, weeklyOff: 'None', significance: 'Religious', dslrAllowed: false, reviewCountLakhs: 0.4, bestTime: 'Afternoon' },
  { id: 'att-3', zone: 'Northern', state: 'Delhi', city: 'Delhi', name: 'Waste to Wonder Park', type: 'Theme Park', estYear: '2019', durationHrs: 2.0, googleRating: 4.1, entranceFeeInr: 50, hasAirport: true, weeklyOff: 'Monday', significance: 'Environmental', dslrAllowed: true, reviewCountLakhs: 0.27, bestTime: 'Evening' },
  { id: 'att-4', zone: 'Northern', state: 'Delhi', city: 'Delhi', name: 'Jantar Mantar', type: 'Observatory', estYear: '1724', durationHrs: 2.0, googleRating: 4.2, entranceFeeInr: 15, hasAirport: true, weeklyOff: 'None', significance: 'Scientific', dslrAllowed: true, reviewCountLakhs: 0.31, bestTime: 'Morning' },
  { id: 'att-5', zone: 'Northern', state: 'Delhi', city: 'Delhi', name: 'Chandni Chowk', type: 'Market', estYear: '1700', durationHrs: 3.0, googleRating: 4.2, entranceFeeInr: 0, hasAirport: true, weeklyOff: 'Sunday', significance: 'Market', dslrAllowed: true, reviewCountLakhs: 0.25, bestTime: 'Afternoon' },
  { id: 'att-6', zone: 'Northern', state: 'Delhi', city: 'Delhi', name: 'Lotus Temple', type: 'Temple', estYear: '1986', durationHrs: 1.0, googleRating: 4.5, entranceFeeInr: 0, hasAirport: true, weeklyOff: 'Monday', significance: 'Religious', dslrAllowed: true, reviewCountLakhs: 0.59, bestTime: 'Evening' },
  { id: 'att-7', zone: 'Northern', state: 'Delhi', city: 'Delhi', name: 'Red Fort', type: 'Fort', estYear: '1648', durationHrs: 2.0, googleRating: 4.5, entranceFeeInr: 35, hasAirport: true, weeklyOff: 'None', significance: 'Historical', dslrAllowed: true, reviewCountLakhs: 1.5, bestTime: 'Afternoon' },
  { id: 'att-8', zone: 'Northern', state: 'Delhi', city: 'Delhi', name: 'Agrasen ki Baoli', type: 'Stepwell', estYear: '1400', durationHrs: 1.0, googleRating: 4.2, entranceFeeInr: 0, hasAirport: true, weeklyOff: 'None', significance: 'Historical', dslrAllowed: true, reviewCountLakhs: 0.41, bestTime: 'Afternoon' },
  { id: 'att-9', zone: 'Northern', state: 'Delhi', city: 'Delhi', name: 'Sunder Nursery', type: 'Park', estYear: '1600', durationHrs: 2.0, googleRating: 4.6, entranceFeeInr: 0, hasAirport: true, weeklyOff: 'None', significance: 'Botanical', dslrAllowed: true, reviewCountLakhs: 0.16, bestTime: 'Afternoon' },
  { id: 'att-10', zone: 'Northern', state: 'Delhi', city: 'Delhi', name: 'Garden of Five Senses', type: 'Park', estYear: '2003', durationHrs: 2.0, googleRating: 4.1, entranceFeeInr: 35, hasAirport: true, weeklyOff: 'None', significance: 'Botanical', dslrAllowed: true, reviewCountLakhs: 0.23, bestTime: 'Morning' },
  { id: 'att-11', zone: 'Northern', state: 'Delhi', city: 'Delhi', name: 'Lodhi Garden', type: 'Park', estYear: '1500', durationHrs: 1.0, googleRating: 4.5, entranceFeeInr: 0, hasAirport: true, weeklyOff: 'None', significance: 'Botanical', dslrAllowed: true, reviewCountLakhs: 0.48, bestTime: 'All' },
  { id: 'att-12', zone: 'Northern', state: 'Delhi', city: 'Delhi', name: 'National Gallery of Modern Art', type: 'Museum', estYear: '1954', durationHrs: 3.0, googleRating: 4.5, entranceFeeInr: 20, hasAirport: true, weeklyOff: 'Monday', significance: 'Artistic', dslrAllowed: true, reviewCountLakhs: 0.08, bestTime: 'All' },
  { id: 'att-13', zone: 'Northern', state: 'Delhi', city: 'Delhi', name: 'National Zoological Park', type: 'Zoo', estYear: '1959', durationHrs: 3.0, googleRating: 4.1, entranceFeeInr: 80, hasAirport: true, weeklyOff: 'Friday', significance: 'Environmental', dslrAllowed: true, reviewCountLakhs: 0.41, bestTime: 'All' },
  { id: 'att-14', zone: 'Northern', state: 'Delhi', city: 'Delhi', name: 'Qutub Minar', type: 'Monument', estYear: '1192', durationHrs: 1.0, googleRating: 4.5, entranceFeeInr: 35, hasAirport: true, weeklyOff: 'None', significance: 'Historical', dslrAllowed: true, reviewCountLakhs: 1.37, bestTime: 'Afternoon' },
  { id: 'att-15', zone: 'Northern', state: 'Delhi', city: 'Delhi', name: 'National Science Centre', type: 'Science', estYear: '1992', durationHrs: 5.0, googleRating: 4.4, entranceFeeInr: 70, hasAirport: true, weeklyOff: 'None', significance: 'Scientific', dslrAllowed: true, reviewCountLakhs: 0.23, bestTime: 'All' },
  
  // Mumbai
  { id: 'att-16', zone: 'Western', state: 'Maharastra', city: 'Mumbai', name: 'Marine Drive', type: 'Promenade', estYear: '1920', durationHrs: 2.0, googleRating: 4.5, entranceFeeInr: 0, hasAirport: true, weeklyOff: 'None', significance: 'Scenic', dslrAllowed: true, reviewCountLakhs: 1.5, bestTime: 'Evening' },
  { id: 'att-17', zone: 'Western', state: 'Maharastra', city: 'Mumbai', name: 'Gateway of India', type: 'Monument', estYear: '1924', durationHrs: 1.0, googleRating: 4.6, entranceFeeInr: 0, hasAirport: true, weeklyOff: 'None', significance: 'Historical', dslrAllowed: true, reviewCountLakhs: 3.6, bestTime: 'All' },
  { id: 'att-18', zone: 'Western', state: 'Maharastra', city: 'Mumbai', name: 'Chhatrapati Shivaji Maharaj Vastu Sangrahalaya', type: 'Museum', estYear: '1922', durationHrs: 1.0, googleRating: 4.6, entranceFeeInr: 500, hasAirport: true, weeklyOff: 'None', significance: 'Historical', dslrAllowed: true, reviewCountLakhs: 0.34, bestTime: 'All' },
  { id: 'att-19', zone: 'Western', state: 'Maharastra', city: 'Mumbai', name: 'Sanjay Gandhi National Park', type: 'National Park', estYear: '1996', durationHrs: 3.0, googleRating: 4.3, entranceFeeInr: 50, hasAirport: true, weeklyOff: 'Monday', significance: 'Wildlife', dslrAllowed: true, reviewCountLakhs: 0.6, bestTime: 'All' },
  { id: 'att-20', zone: 'Western', state: 'Maharastra', city: 'Mumbai', name: 'Siddhivinayak Temple', type: 'Temple', estYear: '1881', durationHrs: 2.0, googleRating: 4.8, entranceFeeInr: 0, hasAirport: true, weeklyOff: 'None', significance: 'Religious', dslrAllowed: false, reviewCountLakhs: 1.05, bestTime: 'All' },
  { id: 'att-21', zone: 'Western', state: 'Maharastra', city: 'Mumbai', name: 'Mahalaxmi Temple', type: 'Temple', estYear: '1831', durationHrs: 1.0, googleRating: 4.7, entranceFeeInr: 0, hasAirport: true, weeklyOff: 'None', significance: 'Religious', dslrAllowed: false, reviewCountLakhs: 0.33, bestTime: 'All' },
  { id: 'att-22', zone: 'Western', state: 'Maharastra', city: 'Mumbai', name: 'Haji Ali Dargah', type: 'Religious Shrine', estYear: '1431', durationHrs: 2.0, googleRating: 4.4, entranceFeeInr: 0, hasAirport: true, weeklyOff: 'None', significance: 'Religious', dslrAllowed: false, reviewCountLakhs: 0.16, bestTime: 'All' },
  { id: 'att-23', zone: 'Western', state: 'Maharastra', city: 'Mumbai', name: 'Chowpatty Beach', type: 'Beach', estYear: 'Unknown', durationHrs: 2.0, googleRating: 4.3, entranceFeeInr: 0, hasAirport: true, weeklyOff: 'None', significance: 'Recreational', dslrAllowed: true, reviewCountLakhs: 0.05, bestTime: 'Evening' },
  { id: 'att-24', zone: 'Western', state: 'Maharastra', city: 'Mumbai', name: 'Essel World', type: 'Amusement Park', estYear: '1986', durationHrs: 5.0, googleRating: 4.3, entranceFeeInr: 1149, hasAirport: true, weeklyOff: 'None', significance: 'Recreational', dslrAllowed: true, reviewCountLakhs: 0.27, bestTime: 'All' },
  { id: 'att-25', zone: 'Western', state: 'Maharastra', city: 'Mumbai', name: 'Elephanta Caves', type: 'Monument', estYear: '1987', durationHrs: 4.0, googleRating: 4.3, entranceFeeInr: 550, hasAirport: true, weeklyOff: 'None', significance: 'Historical', dslrAllowed: true, reviewCountLakhs: 0.35, bestTime: 'All' },

  // Bangalore / Bengaluru
  { id: 'att-27', zone: 'Southern', state: 'Karnataka', city: 'Bangalore', name: 'Bangalore Palace', type: 'Palace', estYear: '1878', durationHrs: 2.0, googleRating: 4.2, entranceFeeInr: 500, hasAirport: true, weeklyOff: 'Monday', significance: 'Historical', dslrAllowed: true, reviewCountLakhs: 0.9, bestTime: 'Morning' },
  { id: 'att-28', zone: 'Southern', state: 'Karnataka', city: 'Bangalore', name: 'Lalbagh Botanical Garden', type: 'Botanical Garden', estYear: '1760', durationHrs: 1.5, googleRating: 4.4, entranceFeeInr: 20, hasAirport: true, weeklyOff: 'None', significance: 'Nature', dslrAllowed: true, reviewCountLakhs: 1.5, bestTime: 'Evening' },
  { id: 'att-29', zone: 'Southern', state: 'Karnataka', city: 'Bangalore', name: 'Cubbon Park', type: 'Park', estYear: '1870', durationHrs: 1.0, googleRating: 4.4, entranceFeeInr: 0, hasAirport: true, weeklyOff: 'None', significance: 'Nature', dslrAllowed: true, reviewCountLakhs: 1.32, bestTime: 'Morning' },
  { id: 'att-30', zone: 'Southern', state: 'Karnataka', city: 'Bangalore', name: 'Vidhana Soudha', type: 'Government Building', estYear: '1956', durationHrs: 0.5, googleRating: 4.6, entranceFeeInr: 0, hasAirport: true, weeklyOff: 'None', significance: 'Architectural', dslrAllowed: false, reviewCountLakhs: 0.8, bestTime: 'Morning' },
  { id: 'att-31', zone: 'Southern', state: 'Karnataka', city: 'Bangalore', name: 'ISKCON Temple Bangalore', type: 'Temple', estYear: '1997', durationHrs: 1.0, googleRating: 4.6, entranceFeeInr: 0, hasAirport: true, weeklyOff: 'None', significance: 'Religious', dslrAllowed: true, reviewCountLakhs: 1.14, bestTime: 'Evening' },

  // Hyderabad
  { id: 'att-32', zone: 'Southern', state: 'Telangana', city: 'Hyderabad', name: 'Charminar', type: 'Landmark', estYear: '1591', durationHrs: 1.0, googleRating: 4.5, entranceFeeInr: 25, hasAirport: true, weeklyOff: 'Friday', significance: 'Historical', dslrAllowed: true, reviewCountLakhs: 2.1, bestTime: 'Morning' },
  { id: 'att-33', zone: 'Southern', state: 'Telangana', city: 'Hyderabad', name: 'Golconda Fort', type: 'Fort', estYear: '1600', durationHrs: 2.0, googleRating: 4.4, entranceFeeInr: 30, hasAirport: true, weeklyOff: 'None', significance: 'Historical', dslrAllowed: true, reviewCountLakhs: 1.2, bestTime: 'Morning' },
  { id: 'att-34', zone: 'Southern', state: 'Telangana', city: 'Hyderabad', name: 'Hussain Sagar Lake', type: 'Lake', estYear: '1563', durationHrs: 1.0, googleRating: 4.3, entranceFeeInr: 0, hasAirport: true, weeklyOff: 'None', significance: 'Scenic', dslrAllowed: true, reviewCountLakhs: 0.5, bestTime: 'Evening' },
  { id: 'att-35', zone: 'Southern', state: 'Telangana', city: 'Hyderabad', name: 'Ramoji Film City', type: 'Film Studio', estYear: '1996', durationHrs: 4.0, googleRating: 4.4, entranceFeeInr: 1150, hasAirport: true, weeklyOff: 'None', significance: 'Entertainment', dslrAllowed: true, reviewCountLakhs: 0.45, bestTime: 'All' },
  { id: 'att-36', zone: 'Southern', state: 'Telangana', city: 'Hyderabad', name: 'Salar Jung Museum', type: 'Museum', estYear: '1951', durationHrs: 2.0, googleRating: 4.4, entranceFeeInr: 20, hasAirport: true, weeklyOff: 'None', significance: 'Historical', dslrAllowed: true, reviewCountLakhs: 0.67, bestTime: 'All' },

  // Kolkata
  { id: 'att-42', zone: 'Eastern', state: 'West Bengal', city: 'Kolkata', name: 'Victoria Memorial', type: 'Museum', estYear: '1921', durationHrs: 1.5, googleRating: 4.6, entranceFeeInr: 30, hasAirport: true, weeklyOff: 'Monday', significance: 'Historical', dslrAllowed: true, reviewCountLakhs: 0.73, bestTime: 'Morning' },
  { id: 'att-43', zone: 'Eastern', state: 'West Bengal', city: 'Kolkata', name: 'Howrah Bridge', type: 'Bridge', estYear: '1943', durationHrs: 0.5, googleRating: 4.6, entranceFeeInr: 0, hasAirport: true, weeklyOff: 'None', significance: 'Architectural', dslrAllowed: false, reviewCountLakhs: 1.2, bestTime: 'Anytime' },
  { id: 'att-44', zone: 'Eastern', state: 'West Bengal', city: 'Kolkata', name: 'Indian Museum', type: 'Museum', estYear: '1814', durationHrs: 2.0, googleRating: 4.6, entranceFeeInr: 50, hasAirport: true, weeklyOff: 'Monday', significance: 'Historical', dslrAllowed: true, reviewCountLakhs: 0.18, bestTime: 'Morning' },
  { id: 'att-45', zone: 'Eastern', state: 'West Bengal', city: 'Kolkata', name: 'Dakshineswar Kali Temple', type: 'Temple', estYear: '1855', durationHrs: 1.0, googleRating: 4.7, entranceFeeInr: 0, hasAirport: true, weeklyOff: 'None', significance: 'Religious', dslrAllowed: true, reviewCountLakhs: 0.82, bestTime: 'Morning' },

  // Goa
  { id: 'att-52', zone: 'Southern', state: 'Goa', city: 'Goa', name: 'Calangute Beach', type: 'Beach', estYear: 'Unknown', durationHrs: 2.0, googleRating: 4.4, entranceFeeInr: 0, hasAirport: true, weeklyOff: 'None', significance: 'Scenic', dslrAllowed: true, reviewCountLakhs: 0.26, bestTime: 'Evening' },
  { id: 'att-53', zone: 'Southern', state: 'Goa', city: 'Goa', name: 'Basilica of Bom Jesus', type: 'Church', estYear: '1605', durationHrs: 1.0, googleRating: 4.5, entranceFeeInr: 0, hasAirport: true, weeklyOff: 'None', significance: 'Historical', dslrAllowed: true, reviewCountLakhs: 0.59, bestTime: 'Afternoon' },
  { id: 'att-54', zone: 'Southern', state: 'Goa', city: 'Goa', name: 'Fort Aguada', type: 'Fort', estYear: '1612', durationHrs: 1.5, googleRating: 4.2, entranceFeeInr: 0, hasAirport: true, weeklyOff: 'None', significance: 'Historical', dslrAllowed: true, reviewCountLakhs: 0.95, bestTime: 'Morning' },
  { id: 'att-55', zone: 'Southern', state: 'Goa', city: 'Goa', name: 'Dudhsagar Falls', type: 'Waterfall', estYear: 'Unknown', durationHrs: 3.0, googleRating: 4.6, entranceFeeInr: 500, hasAirport: true, weeklyOff: 'None', significance: 'Nature', dslrAllowed: true, reviewCountLakhs: 0.3, bestTime: 'Afternoon' },
  { id: 'att-59', zone: 'Southern', state: 'Goa', city: 'Goa', name: 'Baga Beach', type: 'Beach', estYear: 'Unknown', durationHrs: 2.0, googleRating: 4.5, entranceFeeInr: 0, hasAirport: true, weeklyOff: 'None', significance: 'Scenic', dslrAllowed: true, reviewCountLakhs: 0.35, bestTime: 'Evening' },

  // Jaipur
  { id: 'att-79', zone: 'Northern', state: 'Rajasthan', city: 'Jaipur', name: 'Hawa Mahal', type: 'Palace', estYear: '1799', durationHrs: 1.0, googleRating: 4.4, entranceFeeInr: 50, hasAirport: true, weeklyOff: 'None', significance: 'Architectural', dslrAllowed: true, reviewCountLakhs: 1.3, bestTime: 'Morning' },
  { id: 'att-89', zone: 'Northern', state: 'Rajasthan', city: 'Jaipur', name: 'Amber Fort', type: 'Fort', estYear: '1592', durationHrs: 2.0, googleRating: 4.6, entranceFeeInr: 100, hasAirport: true, weeklyOff: 'None', significance: 'Historical', dslrAllowed: true, reviewCountLakhs: 1.5, bestTime: 'All' },
  { id: 'att-90', zone: 'Northern', state: 'Rajasthan', city: 'Jaipur', name: 'Jaigarh Fort', type: 'Fort', estYear: '1726', durationHrs: 1.5, googleRating: 4.5, entranceFeeInr: 35, hasAirport: true, weeklyOff: 'None', significance: 'Historical', dslrAllowed: true, reviewCountLakhs: 0.3, bestTime: 'All' },
  { id: 'att-323', zone: 'Northern', state: 'Rajasthan', city: 'Jaipur', name: 'City Palace Jaipur', type: 'Palace', estYear: '1727', durationHrs: 2.0, googleRating: 4.4, entranceFeeInr: 200, hasAirport: true, weeklyOff: 'None', significance: 'Historical', dslrAllowed: true, reviewCountLakhs: 0.51, bestTime: 'Morning' },

  // Amritsar
  { id: 'att-92', zone: 'Northern', state: 'Punjab', city: 'Amritsar', name: 'Golden Temple (Harmandir Sahib)', type: 'Religious Site', estYear: '1604', durationHrs: 1.5, googleRating: 4.9, entranceFeeInr: 0, hasAirport: true, weeklyOff: 'None', significance: 'Spiritual', dslrAllowed: true, reviewCountLakhs: 1.9, bestTime: 'All' },
  { id: 'att-93', zone: 'Northern', state: 'Punjab', city: 'Amritsar', name: 'Jallianwala Bagh', type: 'Memorial', estYear: '1951', durationHrs: 1.0, googleRating: 4.8, entranceFeeInr: 0, hasAirport: true, weeklyOff: 'None', significance: 'Historical', dslrAllowed: true, reviewCountLakhs: 0.3, bestTime: 'Afternoon' },
  { id: 'att-94', zone: 'Northern', state: 'Punjab', city: 'Amritsar', name: 'Wagah Border', type: 'Border Crossing', estYear: '1950', durationHrs: 2.0, googleRating: 4.8, entranceFeeInr: 0, hasAirport: true, weeklyOff: 'None', significance: 'Cultural', dslrAllowed: true, reviewCountLakhs: 0.17, bestTime: 'Evening' },

  // Agra
  { id: 'att-181', zone: 'Central', state: 'Uttar Pradesh', city: 'Agra', name: 'Taj Mahal', type: 'Mausoleum', estYear: '1632', durationHrs: 2.0, googleRating: 4.6, entranceFeeInr: 50, hasAirport: true, weeklyOff: 'Friday', significance: 'Historical', dslrAllowed: true, reviewCountLakhs: 2.25, bestTime: 'Morning' },
  { id: 'att-321', zone: 'Central', state: 'Uttar Pradesh', city: 'Agra', name: 'Agra Fort', type: 'Fort', estYear: '1565', durationHrs: 2.0, googleRating: 4.5, entranceFeeInr: 40, hasAirport: true, weeklyOff: 'None', significance: 'Historical', dslrAllowed: true, reviewCountLakhs: 1.3, bestTime: 'Afternoon' },
  { id: 'att-190', zone: 'Central', state: 'Uttar Pradesh', city: 'Agra', name: 'Buland Darwaza (Fatehpur Sikri)', type: 'Monument', estYear: '1571', durationHrs: 2.0, googleRating: 4.4, entranceFeeInr: 40, hasAirport: true, weeklyOff: 'None', significance: 'Historical', dslrAllowed: true, reviewCountLakhs: 0.07, bestTime: 'Afternoon' },

  // Varanasi
  { id: 'att-182', zone: 'Central', state: 'Uttar Pradesh', city: 'Varanasi', name: 'Kashi Vishwanath Temple', type: 'Temple', estYear: 'Ancient', durationHrs: 1.0, googleRating: 4.7, entranceFeeInr: 0, hasAirport: true, weeklyOff: 'None', significance: 'Religious', dslrAllowed: false, reviewCountLakhs: 0.9, bestTime: 'All' },
  { id: 'att-189', zone: 'Central', state: 'Uttar Pradesh', city: 'Varanasi', name: 'Dhamek Stupa Sarnath', type: 'Monument', estYear: '-500', durationHrs: 1.0, googleRating: 4.6, entranceFeeInr: 5, hasAirport: true, weeklyOff: 'None', significance: 'Historical', dslrAllowed: true, reviewCountLakhs: 0.065, bestTime: 'All' },

  // Tamil Nadu (Madurai, Chennai, Kanyakumari, Ooty)
  { id: 'att-237', zone: 'Southern', state: 'Tamil Nadu', city: 'Madurai', name: 'Meenakshi Amman Temple', type: 'Temple', estYear: '6th century AD', durationHrs: 2.0, googleRating: 4.7, entranceFeeInr: 0, hasAirport: true, weeklyOff: 'None', significance: 'Religious', dslrAllowed: false, reviewCountLakhs: 0.65, bestTime: 'All' },
  { id: 'att-236', zone: 'Southern', state: 'Tamil Nadu', city: 'Chennai', name: 'Marina Beach', type: 'Beach', estYear: 'Unknown', durationHrs: 1.5, googleRating: 3.9, entranceFeeInr: 0, hasAirport: true, weeklyOff: 'None', significance: 'Recreational', dslrAllowed: true, reviewCountLakhs: 0.1, bestTime: 'Morning' },
  { id: 'att-239', zone: 'Southern', state: 'Tamil Nadu', city: 'Kanyakumari', name: 'Vivekananda Rock Memorial', type: 'Memorial', estYear: '1970', durationHrs: 1.0, googleRating: 4.6, entranceFeeInr: 20, hasAirport: true, weeklyOff: 'None', significance: 'Historical', dslrAllowed: false, reviewCountLakhs: 0.47, bestTime: 'Morning' },
  { id: 'att-243', zone: 'Southern', state: 'Tamil Nadu', city: 'Thanjavur', name: 'Brihadeeswarar Temple', type: 'Temple', estYear: '1010', durationHrs: 1.5, googleRating: 4.8, entranceFeeInr: 0, hasAirport: true, weeklyOff: 'None', significance: 'Religious', dslrAllowed: false, reviewCountLakhs: 0.35, bestTime: 'All' },

  // Gujarat
  { id: 'att-66', zone: 'Western', state: 'Gujarat', city: 'Ahmedabad', name: 'Sabarmati Ashram', type: 'Historical', estYear: '1915', durationHrs: 1.5, googleRating: 4.6, entranceFeeInr: 0, hasAirport: true, weeklyOff: 'None', significance: 'Historical', dslrAllowed: true, reviewCountLakhs: 0.35, bestTime: 'Morning' },
  { id: 'att-73', zone: 'Western', state: 'Gujarat', city: 'Kevadia', name: 'Statue of Unity', type: 'Monument', estYear: '2018', durationHrs: 3.0, googleRating: 4.6, entranceFeeInr: 350, hasAirport: false, weeklyOff: 'Monday', significance: 'Historical', dslrAllowed: true, reviewCountLakhs: 0.67, bestTime: 'All' },
  { id: 'att-68', zone: 'Western', state: 'Gujarat', city: 'Junagadh', name: 'Gir National Park', type: 'National Park', estYear: '1965', durationHrs: 3.0, googleRating: 4.5, entranceFeeInr: 3500, hasAirport: false, weeklyOff: 'None', significance: 'Wildlife', dslrAllowed: true, reviewCountLakhs: 0.08, bestTime: 'Morning' }
];

/**
 * Filter attractions by city name (case-insensitive)
 */
export function getAttractionsByCity(cityName: string): IndianAttractionRecord[] {
  const query = cityName.toLowerCase().trim();
  return ALL_INDIAN_ATTRACTIONS.filter((item) => item.city.toLowerCase().includes(query) || query.includes(item.city.toLowerCase()));
}

/**
 * Filter attractions by state
 */
export function getAttractionsByState(stateName: string): IndianAttractionRecord[] {
  const query = stateName.toLowerCase().trim();
  return ALL_INDIAN_ATTRACTIONS.filter((item) => item.state.toLowerCase().includes(query));
}

/**
 * Convert dataset record to LocationNode for simulator
 */
export function mapAttractionToLocationNode(record: IndianAttractionRecord): LocationNode {
  const knownLoc = lookupKnownCoordinates(record.name) || lookupKnownCoordinates(`${record.name} ${record.city}`) || lookupKnownCoordinates(record.city);
  const lat = knownLoc ? knownLoc.lat : 26.9124;
  const lng = knownLoc ? knownLoc.lng : 75.7873;

  return {
    id: record.id,
    name: record.name,
    category: record.type.toLowerCase().includes('temple') || record.type.toLowerCase().includes('church') ? 'culture' : record.type.toLowerCase().includes('fort') || record.type.toLowerCase().includes('palace') ? 'landmark' : 'landmark',
    lat,
    lng,
    rating: record.googleRating,
    avgCostUsd: Math.max(1, Math.round(record.entranceFeeInr / 80)),
    entryFeeInr: record.entranceFeeInr > 0 ? `₹${record.entranceFeeInr}` : 'Free Entry',
    crowdIndex: record.googleRating >= 4.6 ? 45 : 25,
    weatherSensitivity: record.type.includes('Beach') || record.type.includes('Park') || record.type.includes('Lake') ? 'high' : 'medium',
    bestVisitingTime: record.bestTime !== 'All' ? `${record.bestTime} (${record.durationHrs}h Visit)` : `Anytime (${record.durationHrs}h Visit)`,
    description: `${record.significance} ${record.type} established around ${record.estYear}. Rated ${record.googleRating}★ by ${record.reviewCountLakhs} Lakh visitors on Google Reviews. ${record.dslrAllowed ? 'DSLR Cameras Allowed.' : 'DSLR Not Allowed.'}`,
    imageUrl: getLocationImage(record.name),
    estimatedTimeMins: Math.round(record.durationHrs * 60),
    twinMatchReason: `Verified dataset entry with ${record.reviewCountLakhs}L+ Google reviews. ${record.weeklyOff !== 'None' ? `Closed on ${record.weeklyOff}s.` : 'Open all 7 days.'}`
  };
}
