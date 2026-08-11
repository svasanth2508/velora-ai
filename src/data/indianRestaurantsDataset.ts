export interface IndianRestaurantRecord {
  id: string;
  name: string;
  city: string;
  address: string;
  locality: string;
  cuisines: string[];
  costForTwoInr: number;
  hasOnlineDelivery: boolean;
  hasTableBooking: boolean;
  priceRange: number;
  rating: number;
  ratingText: string;
  votes: number;
}

export const ALL_INDIAN_RESTAURANTS: IndianRestaurantRecord[] = [
  // Pune
  { id: 'rst-101', name: 'BarBerry', city: 'Pune', address: '121/122, Rambaug Colony, Paud road, Kothrud', locality: 'Kothrud', cuisines: ['North Indian', 'Italian', 'Finger Food'], costForTwoInr: 1200, hasOnlineDelivery: false, hasTableBooking: false, priceRange: 3, rating: 4.7, ratingText: 'Excellent', votes: 680 },
  { id: 'rst-102', name: 'La Gustosa', city: 'Pune', address: 'Survey 1/3 4, Behind Karve Putla, Kothrud', locality: 'Kothrud', cuisines: ['Italian'], costForTwoInr: 1200, hasOnlineDelivery: false, hasTableBooking: false, priceRange: 3, rating: 4.5, ratingText: 'Excellent', votes: 1484 },
  { id: 'rst-103', name: 'Wood Fire Grill', city: 'Pune', address: 'Plot 108, Rambaug Colony, Off MIT Road, Kothrud', locality: 'Kothrud', cuisines: ['Healthy Food', 'Continental', 'Seafood', 'North Indian', 'BBQ'], costForTwoInr: 1000, hasOnlineDelivery: true, hasTableBooking: false, priceRange: 3, rating: 3.8, ratingText: 'Good', votes: 1445 },
  { id: 'rst-104', name: 'Le Plaisir', city: 'Pune', address: 'Survey 759/125, Prabhat Road, Deccan Gymkhana', locality: 'Deccan Gymkhana', cuisines: ['European', 'Italian', 'Fast Food', 'Desserts'], costForTwoInr: 1000, hasOnlineDelivery: true, hasTableBooking: false, priceRange: 3, rating: 4.8, ratingText: 'Excellent', votes: 4167 },
  { id: 'rst-105', name: 'Tales & Spirits', city: 'Pune', address: 'Plot 64, Shivaji Housing Society, Senapati Bapat Road', locality: 'Senapati Bapat Road', cuisines: ['Italian', 'Continental', 'Salad'], costForTwoInr: 1200, hasOnlineDelivery: true, hasTableBooking: false, priceRange: 3, rating: 4.3, ratingText: 'Very Good', votes: 3475 },
  { id: 'rst-106', name: 'Cafe Goodluck', city: 'Pune', address: '759/75, Goodluck Chowk, Deccan Gymkhana', locality: 'Deccan Gymkhana', cuisines: ['North Indian', 'Fast Food'], costForTwoInr: 600, hasOnlineDelivery: true, hasTableBooking: false, priceRange: 2, rating: 4.3, ratingText: 'Very Good', votes: 6552 },
  { id: 'rst-107', name: 'Vaishali', city: 'Pune', address: '1218/1, FC Road', locality: 'FC Road', cuisines: ['South Indian', 'Street Food', 'Fast Food'], costForTwoInr: 500, hasOnlineDelivery: true, hasTableBooking: false, priceRange: 2, rating: 4.4, ratingText: 'Very Good', votes: 5086 },
  { id: 'rst-108', name: 'Laa Unico', city: 'Pune', address: 'Arihant Aura Building, Near Laxmi Narayan Theatre, Swargate', locality: 'Swargate', cuisines: ['Italian', 'Mexican', 'Continental', 'Modern Indian'], costForTwoInr: 1100, hasOnlineDelivery: true, hasTableBooking: false, priceRange: 3, rating: 4.7, ratingText: 'Excellent', votes: 1180 },
  { id: 'rst-109', name: 'SP\'s Biryani House', city: 'Pune', address: '1472, Sadashiv Peth', locality: 'Sadashiv Peth', cuisines: ['Biryani', 'Mughlai'], costForTwoInr: 650, hasOnlineDelivery: false, hasTableBooking: false, priceRange: 2, rating: 4.0, ratingText: 'Very Good', votes: 1842 },
  { id: 'rst-110', name: 'Effingut Brewerkz', city: 'Pune', address: 'Shop 4, Deron Heights, Baner', locality: 'Baner', cuisines: ['Continental', 'North Indian', 'Mughlai', 'Italian'], costForTwoInr: 1700, hasOnlineDelivery: true, hasTableBooking: false, priceRange: 3, rating: 4.6, ratingText: 'Excellent', votes: 2377 },

  // Mumbai
  { id: 'rst-201', name: 'Persian Darbar', city: 'Mumbai', address: 'Shop 101 - 102, Noori Baug, Andheri Kurla Road, Marol Naka', locality: 'Marol', cuisines: ['Biryani', 'North Indian', 'Chinese', 'Mughlai', 'Iranian'], costForTwoInr: 1300, hasOnlineDelivery: true, hasTableBooking: false, priceRange: 3, rating: 4.1, ratingText: 'Very Good', votes: 2870 },
  { id: 'rst-202', name: 'Bastian', city: 'Mumbai', address: 'B/1, New Kamal Building, Opposite National College, Linking Road, Bandra West', locality: 'Bandra West', cuisines: ['Seafood', 'Continental'], costForTwoInr: 2500, hasOnlineDelivery: false, hasTableBooking: false, priceRange: 4, rating: 4.5, ratingText: 'Excellent', votes: 1747 },
  { id: 'rst-203', name: 'Hakkasan', city: 'Mumbai', address: '206, Krystal, Waterfield Road, Linking Road, Bandra West', locality: 'Bandra West', cuisines: ['Chinese', 'Cantonese', 'Asian'], costForTwoInr: 2600, hasOnlineDelivery: false, hasTableBooking: false, priceRange: 4, rating: 4.6, ratingText: 'Excellent', votes: 2606 },
  { id: 'rst-204', name: 'Colaba Social', city: 'Mumbai', address: '24, Ground Floor, Glen Rose Building, Behind Taj Mahal Palace, Colaba', locality: 'Colaba', cuisines: ['American', 'North Indian', 'Chinese', 'Finger Food'], costForTwoInr: 1400, hasOnlineDelivery: true, hasTableBooking: false, priceRange: 3, rating: 4.7, ratingText: 'Excellent', votes: 7695 },
  { id: 'rst-205', name: 'Bayroute', city: 'Mumbai', address: 'Minoo Manor Building 7, Cuffe Parade', locality: 'Cuffe Parade', cuisines: ['Egyptian', 'Turkish', 'Lebanese', 'Greek'], costForTwoInr: 3000, hasOnlineDelivery: false, hasTableBooking: false, priceRange: 4, rating: 4.8, ratingText: 'Excellent', votes: 1427 },
  { id: 'rst-206', name: 'The Sassy Spoon', city: 'Mumbai', address: 'Ground Floor, Express Towers, Nariman Point', locality: 'Nariman Point', cuisines: ['European', 'Mediterranean', 'Asian', 'Modern Indian'], costForTwoInr: 1800, hasOnlineDelivery: true, hasTableBooking: false, priceRange: 3, rating: 4.3, ratingText: 'Very Good', votes: 2643 },
  { id: 'rst-207', name: 'Bademiya', city: 'Mumbai', address: 'Tulloch Road, Apollo Bunder, Colaba', locality: 'Colaba', cuisines: ['Street Food', 'Fast Food', 'North Indian', 'Mughlai', 'Kebab'], costForTwoInr: 900, hasOnlineDelivery: true, hasTableBooking: false, priceRange: 2, rating: 3.3, ratingText: 'Average', votes: 6404 },
  { id: 'rst-208', name: 'Prithvi Cafe', city: 'Mumbai', address: 'Prithvi Theatre, Janki Kutir, Juhu Church Road, Juhu', locality: 'Juhu', cuisines: ['Cafe', 'Fast Food'], costForTwoInr: 700, hasOnlineDelivery: false, hasTableBooking: false, priceRange: 2, rating: 4.4, ratingText: 'Very Good', votes: 7654 },
  { id: 'rst-209', name: 'Joey\'s Pizza', city: 'Mumbai', address: 'Shop 1, Samruddhi Complex, Chincholi Bunder Road, Malad West', locality: 'Malad West', cuisines: ['Pizza', 'Italian'], costForTwoInr: 800, hasOnlineDelivery: false, hasTableBooking: false, priceRange: 2, rating: 4.7, ratingText: 'Excellent', votes: 6818 },
  { id: 'rst-210', name: 'Tamasha', city: 'Mumbai', address: 'Ground Floor, Victoria House, Lower Parel', locality: 'Lower Parel', cuisines: ['Finger Food', 'Continental', 'Modern Indian'], costForTwoInr: 1800, hasOnlineDelivery: false, hasTableBooking: false, priceRange: 3, rating: 4.9, ratingText: 'Excellent', votes: 4062 },

  // Delhi
  { id: 'rst-301', name: 'Indian Accent', city: 'Delhi', address: 'The Lodhi, Lodhi Road', locality: 'Lodhi Road', cuisines: ['Modern Indian'], costForTwoInr: 5000, hasOnlineDelivery: false, hasTableBooking: false, priceRange: 4, rating: 4.4, ratingText: 'Very Good', votes: 3249 },
  { id: 'rst-302', name: 'Gulati', city: 'Delhi', address: '6, Pandara Road Market', locality: 'Pandara Road', cuisines: ['North Indian', 'Mughlai', 'Kebab'], costForTwoInr: 1900, hasOnlineDelivery: true, hasTableBooking: false, priceRange: 3, rating: 4.4, ratingText: 'Very Good', votes: 5883 },
  { id: 'rst-303', name: 'Big Chill', city: 'Delhi', address: '68-A, Khan Market', locality: 'Khan Market', cuisines: ['Italian', 'Continental', 'European', 'Cafe'], costForTwoInr: 1500, hasOnlineDelivery: false, hasTableBooking: false, priceRange: 3, rating: 4.4, ratingText: 'Very Good', votes: 6186 },
  { id: 'rst-304', name: 'Karim\'s', city: 'Delhi', address: '16, Gali Kababian, Jama Masjid', locality: 'Jama Masjid', cuisines: ['Mughlai', 'North Indian', 'Kebab'], costForTwoInr: 500, hasOnlineDelivery: false, hasTableBooking: false, priceRange: 2, rating: 3.9, ratingText: 'Good', votes: 6306 },
  { id: 'rst-305', name: 'Burma Burma', city: 'Delhi', address: 'Select Citywalk Mall, Saket', locality: 'Saket', cuisines: ['Asian', 'Burmese'], costForTwoInr: 1500, hasOnlineDelivery: true, hasTableBooking: false, priceRange: 3, rating: 4.8, ratingText: 'Excellent', votes: 1276 },
  { id: 'rst-306', name: 'Olive Bar & Kitchen', city: 'Delhi', address: 'One Style Mile, Kalka Das Marg, Mehrauli', locality: 'Mehrauli', cuisines: ['Mediterranean', 'Italian', 'European', 'Seafood'], costForTwoInr: 4000, hasOnlineDelivery: false, hasTableBooking: false, priceRange: 4, rating: 4.3, ratingText: 'Very Good', votes: 2283 },
  { id: 'rst-307', name: 'Pa Pa Ya', city: 'Delhi', address: 'Dome, Level 4, Select Citywalk, Saket', locality: 'Saket', cuisines: ['Asian', 'Chinese', 'Thai', 'Japanese'], costForTwoInr: 2000, hasOnlineDelivery: false, hasTableBooking: false, priceRange: 4, rating: 4.6, ratingText: 'Excellent', votes: 2424 },

  // Bangalore
  { id: 'rst-401', name: 'Empire Restaurant', city: 'Bangalore', address: '232, 6th Cross, Majestic', locality: 'Majestic', cuisines: ['North Indian', 'Arabian', 'South Indian', 'Biryani'], costForTwoInr: 750, hasOnlineDelivery: true, hasTableBooking: false, priceRange: 2, rating: 4.0, ratingText: 'Very Good', votes: 1556 },
  { id: 'rst-402', name: 'Brahmin\'s Coffee Bar', city: 'Bangalore', address: 'Ranga Rao Road, Basavanagudi', locality: 'Basavanagudi', cuisines: ['South Indian'], costForTwoInr: 100, hasOnlineDelivery: false, hasTableBooking: false, priceRange: 1, rating: 4.8, ratingText: 'Excellent', votes: 2661 },
  { id: 'rst-403', name: 'Arbor Brewing Company', city: 'Bangalore', address: '8, 3rd Floor, Magrath Road, Brigade Road', locality: 'Brigade Road', cuisines: ['American', 'Continental', 'Salad'], costForTwoInr: 2000, hasOnlineDelivery: false, hasTableBooking: false, priceRange: 4, rating: 4.5, ratingText: 'Excellent', votes: 8323 },
  { id: 'rst-404', name: 'Windmills Craftworks', city: 'Bangalore', address: '331, Road 5B, EPIP Area, Whitefield', locality: 'Whitefield', cuisines: ['American', 'North Indian', 'Salad'], costForTwoInr: 2500, hasOnlineDelivery: false, hasTableBooking: false, priceRange: 4, rating: 4.6, ratingText: 'Excellent', votes: 5839 },
  { id: 'rst-405', name: 'Brik Oven', city: 'Bangalore', address: '19, Church Street', locality: 'Church Street', cuisines: ['Cafe', 'Pizza', 'Beverages'], costForTwoInr: 1100, hasOnlineDelivery: false, hasTableBooking: false, priceRange: 3, rating: 4.6, ratingText: 'Excellent', votes: 2230 },
  { id: 'rst-406', name: 'Karama Restaurant', city: 'Bangalore', address: '55, Mosque Road, Frazer Town', locality: 'Frazer Town', cuisines: ['Arabian', 'North Indian', 'Beverages'], costForTwoInr: 750, hasOnlineDelivery: true, hasTableBooking: false, priceRange: 2, rating: 4.4, ratingText: 'Very Good', votes: 2836 },

  // Kolkata
  { id: 'rst-501', name: 'Peter Cat', city: 'Kolkata', address: '18A, Park Street', locality: 'Park Street', cuisines: ['Continental', 'North Indian'], costForTwoInr: 1200, hasOnlineDelivery: true, hasTableBooking: false, priceRange: 3, rating: 4.3, ratingText: 'Very Good', votes: 11118 },
  { id: 'rst-502', name: 'Mocambo', city: 'Kolkata', address: '25B, Park Street', locality: 'Park Street', cuisines: ['Continental'], costForTwoInr: 1100, hasOnlineDelivery: true, hasTableBooking: false, priceRange: 3, rating: 4.2, ratingText: 'Very Good', votes: 6067 },
  { id: 'rst-503', name: 'Barbeque Nation', city: 'Kolkata', address: '1st Floor, Park Center Building, Park Street', locality: 'Park Street', cuisines: ['North Indian', 'Chinese', 'Kebab', 'BBQ'], costForTwoInr: 1800, hasOnlineDelivery: false, hasTableBooking: false, priceRange: 3, rating: 4.8, ratingText: 'Excellent', votes: 4375 },
  { id: 'rst-504', name: 'Oudh 1590', city: 'Kolkata', address: 'Shop CD 86, Sector 1, Salt Lake', locality: 'Salt Lake', cuisines: ['Mughlai', 'Awadhi', 'Biryani'], costForTwoInr: 1200, hasOnlineDelivery: true, hasTableBooking: false, priceRange: 3, rating: 4.2, ratingText: 'Very Good', votes: 3696 },
  { id: 'rst-505', name: '6 Ballygunge Place', city: 'Kolkata', address: '6, Ballygunge Place', locality: 'Ballygunge', cuisines: ['Bengali'], costForTwoInr: 1000, hasOnlineDelivery: true, hasTableBooking: false, priceRange: 3, rating: 4.5, ratingText: 'Excellent', votes: 3256 },

  // Hyderabad
  { id: 'rst-601', name: 'Paradise', city: 'Hyderabad', address: 'NTR Gardens, Beside Prasads IMAX, Necklace Road', locality: 'Necklace Road', cuisines: ['Biryani', 'North Indian', 'Chinese'], costForTwoInr: 950, hasOnlineDelivery: true, hasTableBooking: false, priceRange: 2, rating: 4.3, ratingText: 'Very Good', votes: 2362 },
  { id: 'rst-602', name: 'Chili\'s American Grill & Bar', city: 'Hyderabad', address: 'Flat 48, Road 1, Banjara Hills', locality: 'Banjara Hills', cuisines: ['Mexican', 'American', 'Tex-Mex', 'Burger'], costForTwoInr: 1400, hasOnlineDelivery: true, hasTableBooking: false, priceRange: 3, rating: 4.8, ratingText: 'Excellent', votes: 4475 },
  { id: 'rst-603', name: 'Chutneys', city: 'Hyderabad', address: 'Shilpa Arcade, Road 3, Banjara Hills', locality: 'Banjara Hills', cuisines: ['South Indian', 'North Indian', 'Chinese'], costForTwoInr: 600, hasOnlineDelivery: true, hasTableBooking: false, priceRange: 2, rating: 4.4, ratingText: 'Very Good', votes: 1310 },
  { id: 'rst-604', name: 'Shah Ghouse Cafe', city: 'Hyderabad', address: 'Opposite SA Imperial Gardens, Tolichowki', locality: 'Tolichowki', cuisines: ['Biryani', 'North Indian', 'Chinese'], costForTwoInr: 600, hasOnlineDelivery: true, hasTableBooking: false, priceRange: 2, rating: 4.2, ratingText: 'Very Good', votes: 6877 },

  // Chennai
  { id: 'rst-701', name: 'Haunted', city: 'Chennai', address: '273, F13, 2nd Main Road, Anna Nagar East', locality: 'Anna Nagar East', cuisines: ['North Indian', 'Chinese', 'Arabian', 'BBQ'], costForTwoInr: 800, hasOnlineDelivery: true, hasTableBooking: false, priceRange: 2, rating: 4.0, ratingText: 'Very Good', votes: 1921 },
  { id: 'rst-702', name: 'Savoury Sea Shell', city: 'Chennai', address: '3, E Block, 3rd Avenue, Anna Nagar East', locality: 'Anna Nagar East', cuisines: ['Arabian', 'Chinese', 'North Indian', 'Biryani'], costForTwoInr: 800, hasOnlineDelivery: true, hasTableBooking: false, priceRange: 2, rating: 4.1, ratingText: 'Very Good', votes: 2333 },

  // Goa
  { id: 'rst-801', name: 'The Black Sheep Bistro', city: 'Goa', address: 'Swami Vivekanand Road, Panaji', locality: 'Panaji', cuisines: ['Seafood', 'Continental', 'European'], costForTwoInr: 1500, hasOnlineDelivery: false, hasTableBooking: false, priceRange: 4, rating: 4.9, ratingText: 'Excellent', votes: 1755 },
  { id: 'rst-802', name: 'Kokni Kanteen', city: 'Goa', address: 'Near Mahalaxmi Temple, Dr. Dada Vaidya Road, Panaji', locality: 'Panaji', cuisines: ['Goan', 'Seafood'], costForTwoInr: 550, hasOnlineDelivery: false, hasTableBooking: false, priceRange: 3, rating: 4.5, ratingText: 'Excellent', votes: 745 },
  { id: 'rst-803', name: 'The Fisherman\'s Wharf', city: 'Goa', address: 'D. B. Bandodkar Road, Campal, Panaji', locality: 'Panaji', cuisines: ['Asian', 'Continental', 'Goan', 'Seafood'], costForTwoInr: 1100, hasOnlineDelivery: true, hasTableBooking: false, priceRange: 4, rating: 4.6, ratingText: 'Excellent', votes: 1127 },

  // Indore
  { id: 'rst-901', name: 'Indore Kitchen', city: 'Indore', address: 'Indore Marriott Hotel, Vijay Nagar', locality: 'Vijay Nagar', cuisines: ['North Indian', 'Italian', 'Asian'], costForTwoInr: 1800, hasOnlineDelivery: false, hasTableBooking: false, priceRange: 4, rating: 4.4, ratingText: 'Very Good', votes: 478 },
  { id: 'rst-902', name: 'Hobnob Gourmet Cafébar', city: 'Indore', address: 'Infiniti Hotel, Vijay Nagar', locality: 'Vijay Nagar', cuisines: ['Italian', 'Continental'], costForTwoInr: 1950, hasOnlineDelivery: false, hasTableBooking: false, priceRange: 4, rating: 4.6, ratingText: 'Excellent', votes: 887 },

  // Vizag / Vijayawada
  { id: 'rst-1001', name: 'Mekong - Hotel GreenPark', city: 'Vizag', address: 'Hotel GreenPark, Waltair Main Road', locality: 'Waltair Uplands', cuisines: ['Chinese', 'Thai', 'Japanese'], costForTwoInr: 1300, hasOnlineDelivery: true, hasTableBooking: false, priceRange: 3, rating: 4.8, ratingText: 'Excellent', votes: 548 },
  { id: 'rst-1002', name: 'Barkaas Arabic Restaurant', city: 'Vijayawada', address: 'Tikkle Road, Labbipet', locality: 'Labbipet', cuisines: ['Arabian'], costForTwoInr: 550, hasOnlineDelivery: true, hasTableBooking: false, priceRange: 2, rating: 4.5, ratingText: 'Excellent', votes: 273 }
];

export function getRestaurantsByCity(cityName: string): IndianRestaurantRecord[] {
  const query = cityName.toLowerCase().trim();
  return ALL_INDIAN_RESTAURANTS.filter(
    r => r.city.toLowerCase().includes(query) || query.includes(r.city.toLowerCase())
  );
}

export function getRestaurantsByCuisine(cuisine: string): IndianRestaurantRecord[] {
  const query = cuisine.toLowerCase().trim();
  return ALL_INDIAN_RESTAURANTS.filter(r => r.cuisines.some(c => c.toLowerCase().includes(query)));
}
