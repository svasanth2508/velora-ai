export interface IndianHotelRecord {
  id: string;
  name: string;
  rating: number;
  city: string;
  features: string[];
  priceInr: number;
  starCategory?: string;
}

export const ALL_INDIAN_HOTELS: IndianHotelRecord[] = [
  // Kochi
  { id: 'ht-1', name: 'Crowne Plaza Kochi', rating: 4.6, city: 'Kochi', features: ['5-star hotel', 'Free breakfast', 'Free Wi-Fi', 'Free parking', 'Pool', 'Hot tub', 'Air conditioning', 'Fitness center', 'Spa'], priceInr: 8854, starCategory: '5-star' },
  { id: 'ht-2', name: 'Trident Hotel Cochin', rating: 4.5, city: 'Kochi', features: ['5-star hotel', 'Free breakfast', 'Wi-Fi', 'Free parking', 'Pool', 'Air conditioning', 'Fitness center', 'Spa', 'Restaurant'], priceInr: 6441, starCategory: '5-star' },
  { id: 'ht-3', name: 'The Galaxy Suites', rating: 3.8, city: 'Kochi', features: ['Apartment', 'Sleeps 10', 'Free parking', 'Free Wi-Fi'], priceInr: 831 },
  { id: 'ht-4', name: 'The Renai Cochin', rating: 4.2, city: 'Kochi', features: ['4-star hotel', 'Free breakfast', 'Free Wi-Fi', 'Free parking', 'Pool', 'Air conditioning', 'Fitness center', 'Spa', 'Bar'], priceInr: 2768, starCategory: '4-star' },
  { id: 'ht-5', name: 'Ramada by Wyndham Kochi', rating: 4.5, city: 'Kochi', features: ['5-star hotel', 'Breakfast', 'Free Wi-Fi', 'Free parking', 'Pool', 'Air conditioning', 'Fitness center', 'Spa', 'Bar'], priceInr: 8938, starCategory: '5-star' },
  { id: 'ht-6', name: 'Radisson Blu Hotel, Kochi', rating: 4.3, city: 'Kochi', features: ['5-star hotel', 'Breakfast', 'Free Wi-Fi', 'Free parking', 'Pool', 'Hot tub', 'Air conditioning', 'Fitness center', 'Spa'], priceInr: 6061, starCategory: '5-star' },
  { id: 'ht-7', name: 'Holiday Inn Cochin, an IHG Hotel', rating: 4.4, city: 'Kochi', features: ['5-star hotel', 'Breakfast', 'Free Wi-Fi', 'Free parking', 'Pool', 'Air conditioning', 'Fitness center', 'Bar', 'Restaurant'], priceInr: 5689, starCategory: '5-star' },
  { id: 'ht-8', name: 'OAK FIELD INN', rating: 3.8, city: 'Kochi', features: ['Free breakfast', 'Wi-Fi', 'Free parking', 'Air conditioning', 'Restaurant', 'Kitchen', 'Full-service laundry', 'Kid-friendly'], priceInr: 819 },
  { id: 'ht-9', name: 'Grand Hyatt Kochi Bolgatty', rating: 4.7, city: 'Kochi', features: ['5-star hotel', 'Breakfast', 'Free Wi-Fi', 'Free parking', 'Pool', 'Hot tub', 'Air conditioning', 'Fitness center', 'Spa'], priceInr: 14282, starCategory: '5-star' },
  { id: 'ht-10', name: 'Hotel South Gate Residency', rating: 3.9, city: 'Kochi', features: ['3-star hotel', 'Breakfast', 'Free Wi-Fi', 'Free parking', 'Air conditioning', 'Restaurant', 'Airport shuttle', 'Full-service laundry', 'Kid-friendly'], priceInr: 1051, starCategory: '3-star' },
  { id: 'ht-11', name: 'Cherai Beach Resorts', rating: 3.9, city: 'Kochi', features: ['3-star hotel', 'Free breakfast', 'Wi-Fi', 'Free parking', 'Pool', 'Air conditioning', 'Fitness center', 'Spa', 'Beach access'], priceInr: 3281, starCategory: '3-star' },
  { id: 'ht-12', name: 'North Centre Hotel', rating: 4.7, city: 'Kochi', features: ['3-star hotel', 'Breakfast', 'Free Wi-Fi', 'Free parking', 'Air conditioning', 'Airport shuttle', 'Full-service laundry', 'Kid-friendly'], priceInr: 1118, starCategory: '3-star' },
  { id: 'ht-13', name: 'Boche Island - Kumbalangi', rating: 4.1, city: 'Kochi', features: ['3-star hotel', 'Free breakfast', 'Free Wi-Fi', 'Free parking', 'Pool', 'Air conditioning', 'Pet-friendly', 'Spa', 'Restaurant'], priceInr: 5855, starCategory: '3-star' },
  { id: 'ht-14', name: 'Nihara Resort & Spa, Kadamakudy Island', rating: 4.3, city: 'Kochi', features: ['4-star hotel', 'Free breakfast', 'Free Wi-Fi', 'Free parking', 'Pool', 'Air conditioning', 'Spa', 'Restaurant'], priceInr: 4692, starCategory: '4-star' },
  { id: 'ht-15', name: 'Niko Hotels', rating: 4.6, city: 'Kochi', features: ['3-star hotel', 'Free breakfast', 'Free Wi-Fi', 'Free parking', 'Air conditioning', 'Restaurant', 'Room service', 'Airport shuttle'], priceInr: 2073, starCategory: '3-star' },
  { id: 'ht-16', name: 'The Gateway Hotel Marine Drive Ernakulam', rating: 4.3, city: 'Kochi', features: ['5-star hotel', 'Free breakfast', 'Free Wi-Fi', 'Free parking', 'Pool', 'Air conditioning', 'Fitness center', 'Spa', 'Restaurant'], priceInr: 7252, starCategory: '5-star' },
  { id: 'ht-17', name: 'Napier Heritage Fort Kochi', rating: 4.5, city: 'Kochi', features: ['Free breakfast', 'Free Wi-Fi', 'Free parking', 'Pool', 'Air conditioning', 'Beach access', 'Restaurant', 'Room service'], priceInr: 3808 },

  // Trivandrum
  { id: 'ht-18', name: 'Maurya Rajadhani', rating: 4.0, city: 'Trivandrum', features: ['4-star hotel', 'Free breakfast', 'Free Wi-Fi', 'Free parking', 'Hot tub', 'Air conditioning', 'Fitness center', 'Spa', 'Bar'], priceInr: 2812, starCategory: '4-star' },
  { id: 'ht-19', name: 'Biverah Hotel and Suites', rating: 3.8, city: 'Trivandrum', features: ['4-star hotel', 'Free breakfast', 'Free Wi-Fi', 'Free parking', 'Air conditioning', 'Bar', 'Restaurant', 'Room service'], priceInr: 2898, starCategory: '4-star' },
  { id: 'ht-20', name: 'HOTEL HIGHLAND', rating: 4.0, city: 'Trivandrum', features: ['3-star hotel', 'Free breakfast', 'Free Wi-Fi', 'Paid parking', 'Air conditioning', 'Restaurant', 'Room service', 'Airport shuttle'], priceInr: 1350, starCategory: '3-star' },
  { id: 'ht-21', name: 'Ariya Nivaas - A Vegetarian Hotel', rating: 4.2, city: 'Trivandrum', features: ['2-star hotel', 'Breakfast', 'Free Wi-Fi', 'Free parking', 'Air conditioning', 'Restaurant', 'Full-service laundry'], priceInr: 2401, starCategory: '2-star' },
  { id: 'ht-22', name: 'Hilton Garden Inn Trivandrum', rating: 4.3, city: 'Trivandrum', features: ['5-star hotel', 'Breakfast', 'Free Wi-Fi', 'Free parking', 'Pool', 'Air conditioning', 'Fitness center', 'Bar', 'Restaurant'], priceInr: 6837, starCategory: '5-star' },
  { id: 'ht-23', name: 'KTDC Grand Chaithram', rating: 4.1, city: 'Trivandrum', features: ['3-star hotel', 'Free breakfast', 'Free Wi-Fi', 'Free parking', 'Air conditioning', 'Restaurant', 'Room service'], priceInr: 2509, starCategory: '3-star' },
  { id: 'ht-24', name: 'Treebo Trend Goodland Residency', rating: 4.1, city: 'Trivandrum', features: ['3-star hotel', 'Free breakfast', 'Free Wi-Fi', 'Free parking', 'Air conditioning', 'Pet-friendly', 'Restaurant', 'Room service'], priceInr: 4265, starCategory: '3-star' },
  { id: 'ht-25', name: 'Windsor Rajadhani', rating: 4.1, city: 'Trivandrum', features: ['4-star hotel', 'Free breakfast', 'Free Wi-Fi', 'Free parking', 'Pool', 'Hot tub', 'Air conditioning', 'Fitness center', 'Spa'], priceInr: 4341, starCategory: '4-star' },

  // Kumarakom
  { id: 'ht-26', name: 'Backwater Ripples', rating: 4.4, city: 'Kumarakom', features: ['3-star hotel', 'Free breakfast', 'Wi-Fi', 'Free parking', 'Pool', 'Air conditioning', 'Fitness center', 'Spa', 'Restaurant'], priceInr: 8968, starCategory: '3-star' },
  { id: 'ht-27', name: 'Lakesong Resort', rating: 4.2, city: 'Kumarakom', features: ['4-star hotel', 'Free breakfast', 'Wi-Fi', 'Free parking', 'Pool', 'Air conditioning', 'Fitness center', 'Spa', 'Restaurant'], priceInr: 11948, starCategory: '4-star' },
  { id: 'ht-28', name: 'Abad Whispering Palms Resort', rating: 4.3, city: 'Kumarakom', features: ['4-star hotel', 'Free breakfast', 'Free Wi-Fi', 'Free parking', 'Pool', 'Air conditioning', 'Fitness center', 'Spa', 'Restaurant'], priceInr: 6921, starCategory: '4-star' },
  { id: 'ht-29', name: 'Cocobay Resort', rating: 4.2, city: 'Kumarakom', features: ['3-star hotel', 'Free breakfast', 'Wi-Fi', 'Free parking', 'Pool', 'Air conditioning', 'Fitness center', 'Spa', 'Restaurant'], priceInr: 6138, starCategory: '3-star' },
  { id: 'ht-30', name: 'The Zuri Kumarakom, Kerala Resort & Spa', rating: 4.3, city: 'Kumarakom', features: ['5-star hotel', 'Free breakfast', 'Free Wi-Fi', 'Free parking', 'Pool', 'Hot tub', 'Air conditioning', 'Fitness center', 'Spa'], priceInr: 13682, starCategory: '5-star' },
  { id: 'ht-31', name: 'Rhythm Kumarakom', rating: 4.5, city: 'Kumarakom', features: ['5-star hotel', 'Free breakfast', 'Free Wi-Fi', 'Free parking', 'Pool', 'Air conditioning', 'Fitness center', 'Spa', 'Restaurant'], priceInr: 14712, starCategory: '5-star' },
  { id: 'ht-32', name: 'KTDC Waterscapes', rating: 4.5, city: 'Kumarakom', features: ['4-star hotel', 'Free breakfast', 'Free Wi-Fi', 'Free parking', 'Pool', 'Air conditioning', 'Fitness center', 'Spa', 'Bar'], priceInr: 10560, starCategory: '4-star' },
  { id: 'ht-33', name: 'Gokulam Grand Resort and Spa Kumarakom', rating: 4.7, city: 'Kumarakom', features: ['Breakfast', 'Free Wi-Fi', 'Free parking', 'Pool', 'Air conditioning', 'Fitness center', 'Spa', 'Restaurant', 'Room service'], priceInr: 14059 },
  { id: 'ht-34', name: 'Kumarakom Lake Resort', rating: 4.8, city: 'Kumarakom', features: ['5-star hotel', 'Free breakfast', 'Wi-Fi', 'Free parking', 'Pool', 'Hot tub', 'Air conditioning', 'Fitness center', 'Spa'], priceInr: 30267, starCategory: '5-star' },

  // Pune
  { id: 'ht-35', name: 'Hyatt Pune', rating: 4.4, city: 'Pune', features: ['5-star hotel', 'Breakfast', 'Free Wi-Fi', 'Free parking', 'Pool', 'Air conditioning', 'Fitness center', 'Spa', 'Bar'], priceInr: 9701, starCategory: '5-star' },
  { id: 'ht-36', name: 'The Central Park Hotel, Pune', rating: 4.1, city: 'Pune', features: ['4-star hotel', 'Free breakfast', 'Wi-Fi', 'Free parking', 'Pool', 'Air conditioning', 'Fitness center', 'Spa', 'Restaurant'], priceInr: 3708, starCategory: '4-star' },
  { id: 'ht-37', name: 'Four Points by Sheraton Hotel, Pune', rating: 4.3, city: 'Pune', features: ['5-star hotel', 'Breakfast', 'Free Wi-Fi', 'Free parking', 'Pool', 'Air conditioning', 'Fitness center', 'Spa', 'Bar'], priceInr: 6796, starCategory: '5-star' },
  { id: 'ht-38', name: 'Royal Orchid Central Pune', rating: 4.3, city: 'Pune', features: ['4-star hotel', 'Free breakfast', 'Free Wi-Fi', 'Free parking', 'Pool', 'Air conditioning', 'Fitness center', 'Bar', 'Restaurant'], priceInr: 5085, starCategory: '4-star' },
  { id: 'ht-39', name: 'Sheraton Grand Pune Bund Garden Hotel', rating: 4.5, city: 'Pune', features: ['5-star hotel', 'Breakfast', 'Free Wi-Fi', 'Free parking', 'Pool', 'Hot tub', 'Air conditioning', 'Fitness center', 'Spa'], priceInr: 9435, starCategory: '5-star' },
  { id: 'ht-40', name: 'Sunny\'s World', rating: 4.2, city: 'Pune', features: ['Free breakfast', 'Free Wi-Fi', 'Free parking', 'Pool', 'Air conditioning', 'Restaurant', 'Kitchen', 'Full-service laundry'], priceInr: 4549 },
  { id: 'ht-41', name: 'Fairfield by Marriott Pune Kharadi', rating: 4.3, city: 'Pune', features: ['4-star hotel', 'Free breakfast', 'Free Wi-Fi', 'Free parking', 'Air conditioning', 'Fitness center', 'Bar', 'Restaurant'], priceInr: 7280, starCategory: '4-star' },

  // Chennai
  { id: 'ht-42', name: 'Novotel Chennai Sipcot', rating: 4.7, city: 'Chennai', features: ['5-star hotel', 'Free breakfast', 'Free Wi-Fi', 'Free parking', 'Pool', 'Air conditioning', 'Fitness center', 'Bar', 'Restaurant'], priceInr: 5145, starCategory: '5-star' },
  { id: 'ht-43', name: 'Park Plaza Chennai OMR', rating: 4.1, city: 'Chennai', features: ['5-star hotel', 'Breakfast', 'Free Wi-Fi', 'Free parking', 'Pool', 'Air conditioning', 'Fitness center', 'Spa', 'Bar'], priceInr: 4704, starCategory: '5-star' },
  { id: 'ht-44', name: 'Turyaa Chennai', rating: 4.3, city: 'Chennai', features: ['5-star hotel', 'Free breakfast', 'Free Wi-Fi', 'Free parking', 'Pool', 'Air conditioning', 'Fitness center', 'Spa', 'Bar'], priceInr: 3797, starCategory: '5-star' },
  { id: 'ht-45', name: 'Fairfield by Marriott Chennai OMR', rating: 4.2, city: 'Chennai', features: ['4-star hotel', 'Free breakfast', 'Free Wi-Fi', 'Free parking', 'Air conditioning', 'Fitness center', 'Bar', 'Restaurant'], priceInr: 3707, starCategory: '4-star' },
  { id: 'ht-46', name: 'Taj Club House, Chennai', rating: 4.4, city: 'Chennai', features: ['5-star hotel', 'Free breakfast', 'Free Wi-Fi', 'Free parking', 'Pool', 'Air conditioning', 'Pet-friendly', 'Fitness center', 'Spa'], priceInr: 7552, starCategory: '5-star' },
  { id: 'ht-47', name: 'Vivanta Chennai, IT Expressway', rating: 4.3, city: 'Chennai', features: ['5-star hotel', 'Free breakfast', 'Free Wi-Fi', 'Free parking', 'Pool', 'Air conditioning', 'Pet-friendly', 'Fitness center', 'Spa'], priceInr: 5485, starCategory: '5-star' },

  // Delhi
  { id: 'ht-48', name: 'Crowne Plaza New Delhi Rohini', rating: 4.4, city: 'Delhi', features: ['4-star hotel', 'Breakfast', 'Free Wi-Fi', 'Free parking', 'Pool', 'Hot tub', 'Air conditioning', 'Fitness center', 'Spa'], priceInr: 7825, starCategory: '4-star' },
  { id: 'ht-49', name: 'Trident Hotel Gurgaon/Delhi', rating: 4.6, city: 'Delhi', features: ['5-star hotel', 'Free breakfast', 'Free Wi-Fi', 'Free parking', 'Pool', 'Hot tub', 'Air conditioning', 'Fitness center', 'Spa'], priceInr: 12272, starCategory: '5-star' },
  { id: 'ht-50', name: 'The Leela Ambience Convention Hotel Delhi', rating: 4.5, city: 'Delhi', features: ['5-star hotel', 'Free breakfast', 'Wi-Fi', 'Free parking', 'Pool', 'Hot tub', 'Air conditioning', 'Fitness center', 'Spa'], priceInr: 9809, starCategory: '5-star' },
  { id: 'ht-51', name: 'Radisson Blu Hotel New Delhi Paschim Vihar', rating: 4.4, city: 'Delhi', features: ['5-star hotel', 'Breakfast', 'Free Wi-Fi', 'Paid parking', 'Pool', 'Air conditioning', 'Fitness center', 'Spa', 'Bar'], priceInr: 7285, starCategory: '5-star' },
  { id: 'ht-52', name: 'Welcomhotel By ITC Hotels, Dwarka, New Delhi', rating: 4.5, city: 'Delhi', features: ['5-star hotel', 'Free breakfast', 'Free Wi-Fi', 'Free parking', 'Pool', 'Air conditioning', 'Fitness center', 'Spa', 'Bar'], priceInr: 8141, starCategory: '5-star' },
  { id: 'ht-53', name: 'Taj Palace, New Delhi', rating: 4.7, city: 'Delhi', features: ['5-star hotel', 'Breakfast', 'Wi-Fi', 'Free parking', 'Pool', 'Hot tub', 'Air conditioning', 'Fitness center', 'Spa'], priceInr: 15050, starCategory: '5-star' },
  { id: 'ht-54', name: 'Bloomrooms @ Janpath', rating: 4.4, city: 'Delhi', features: ['3-star hotel', 'Breakfast', 'Free Wi-Fi', 'Free parking', 'Air conditioning', 'Fitness center', 'Restaurant', 'Room service'], priceInr: 6451, starCategory: '3-star' },

  // Bhubaneswar
  { id: 'ht-55', name: 'MAYFAIR Convention, Bhubaneswar', rating: 4.5, city: 'Bhubaneswar', features: ['4-star hotel', 'Free breakfast', 'Free Wi-Fi', 'Free parking', 'Hot tub', 'Air conditioning', 'Fitness center', 'Spa', 'Bar'], priceInr: 6476, starCategory: '4-star' },
  { id: 'ht-56', name: 'Mayfair Lagoon', rating: 4.6, city: 'Bhubaneswar', features: ['5-star hotel', 'Free breakfast', 'Free Wi-Fi', 'Free parking', 'Pool', 'Hot tub', 'Air conditioning', 'Fitness center', 'Spa'], priceInr: 10779, starCategory: '5-star' },
  { id: 'ht-57', name: 'Swosti Premium - Luxury 5-Star Hotel in Bhubaneswar', rating: 4.3, city: 'Bhubaneswar', features: ['5-star hotel', 'Free breakfast', 'Free Wi-Fi', 'Free parking', 'Pool', 'Air conditioning', 'Fitness center', 'Bar', 'Restaurant'], priceInr: 6215, starCategory: '5-star' },
  { id: 'ht-58', name: 'Vivanta Bhubaneswar, DN Square', rating: 4.6, city: 'Bhubaneswar', features: ['5-star hotel', 'Free breakfast', 'Free Wi-Fi', 'Free parking', 'Pool', 'Air conditioning', 'Pet-friendly', 'Fitness center', 'Spa'], priceInr: 9089, starCategory: '5-star' },
  { id: 'ht-59', name: 'Welcomhotel By ITC Hotels, Bhubaneswar', rating: 4.7, city: 'Bhubaneswar', features: ['4-star hotel', 'Breakfast', 'Free Wi-Fi', 'Free parking', 'Pool', 'Air conditioning', 'Fitness center', 'Spa', 'Bar'], priceInr: 7616, starCategory: '4-star' },

  // Goa
  { id: 'ht-60', name: 'The Westin Goa', rating: 4.6, city: 'Goa', features: ['5-star hotel', 'Breakfast', 'Free Wi-Fi', 'Free parking', 'Pool', 'Air conditioning', 'Fitness center', 'Spa', 'Bar'], priceInr: 20650, starCategory: '5-star' },
  { id: 'ht-61', name: 'The LaLiT Golf & Spa Resort Goa', rating: 4.4, city: 'Goa', features: ['5-star hotel', 'Free breakfast', 'Wi-Fi', 'Free parking', 'Pool', 'Hot tub', 'Air conditioning', 'Fitness center', 'Spa'], priceInr: 16756, starCategory: '5-star' },
  { id: 'ht-62', name: 'Radisson Resort Goa Baga', rating: 4.8, city: 'Goa', features: ['4-star hotel', 'Breakfast', 'Free Wi-Fi', 'Free parking', 'Pool', 'Hot tub', 'Air conditioning', 'Fitness center', 'Spa'], priceInr: 4397, starCategory: '4-star' },
  { id: 'ht-63', name: 'W Goa', rating: 4.5, city: 'Goa', features: ['5-star hotel', 'Free breakfast', 'Free Wi-Fi', 'Free parking', 'Pool', 'Air conditioning', 'Pet-friendly', 'Fitness center', 'Spa'], priceInr: 7435, starCategory: '5-star' },
  { id: 'ht-64', name: 'Grand Hyatt Goa', rating: 4.6, city: 'Goa', features: ['5-star hotel', 'Breakfast', 'Free Wi-Fi', 'Free parking', 'Pool', 'Hot tub', 'Air conditioning', 'Fitness center', 'Spa'], priceInr: 20307, starCategory: '5-star' },
  { id: 'ht-65', name: 'Holiday Inn Resort Goa, an IHG Hotel', rating: 4.6, city: 'Goa', features: ['5-star hotel', 'Breakfast', 'Free Wi-Fi', 'Free parking', 'Pool', 'Air conditioning', 'Fitness center', 'Spa', 'Beach access'], priceInr: 11934, starCategory: '5-star' },
  { id: 'ht-66', name: 'Radisson Blu Resort Goa Cavelossim Beach', rating: 4.4, city: 'Goa', features: ['5-star hotel', 'Breakfast', 'Free Wi-Fi', 'Free parking', 'Pool', 'Hot tub', 'Air conditioning', 'Fitness center', 'Spa'], priceInr: 15898, starCategory: '5-star' },
  { id: 'ht-67', name: 'Vivanta Goa, Miramar', rating: 4.5, city: 'Goa', features: ['5-star hotel', 'Free breakfast', 'Free Wi-Fi', 'Free parking', 'Pool', 'Pet-friendly', 'Fitness center', 'Restaurant', 'Room service'], priceInr: 11788, starCategory: '5-star' },
  { id: 'ht-68', name: 'The Zuri White Sands, Goa Resort & Casino', rating: 4.4, city: 'Goa', features: ['5-star hotel', 'Free breakfast', 'Free Wi-Fi', 'Free parking', 'Pool', 'Hot tub', 'Air conditioning', 'Fitness center', 'Spa'], priceInr: 16795, starCategory: '5-star' },
  { id: 'ht-69', name: 'Taj Holiday Village Resort and Spa, Goa', rating: 4.7, city: 'Goa', features: ['5-star hotel', 'Free breakfast', 'Free Wi-Fi', 'Free parking', 'Pool', 'Hot tub', 'Air conditioning', 'Fitness center', 'Spa'], priceInr: 26550, starCategory: '5-star' },

  // Mumbai
  { id: 'ht-70', name: 'The Lalit Mumbai', rating: 4.4, city: 'Mumbai', features: ['5-star hotel', 'Free breakfast', 'Free Wi-Fi', 'Free parking', 'Pool', 'Hot tub', 'Air conditioning', 'Fitness center', 'Spa'], priceInr: 14278, starCategory: '5-star' },
  { id: 'ht-71', name: 'JW Marriott Mumbai Juhu', rating: 4.6, city: 'Mumbai', features: ['5-star hotel', 'Free Wi-Fi', 'Free parking', 'Pool', 'Air conditioning', 'Fitness center', 'Spa', 'Breakfast', 'Beach access'], priceInr: 5725, starCategory: '5-star' },
  { id: 'ht-72', name: 'The Taj Mahal Palace, Mumbai', rating: 4.7, city: 'Mumbai', features: ['5-star hotel', 'Free breakfast', 'Free Wi-Fi', 'Paid parking', 'Pool', 'Hot tub', 'Air conditioning', 'Fitness center', 'Spa'], priceInr: 33021, starCategory: '5-star' },
  { id: 'ht-73', name: 'Grand Hyatt Mumbai Hotel & Residences', rating: 4.5, city: 'Mumbai', features: ['5-star hotel', 'Breakfast', 'Free Wi-Fi', 'Free parking', 'Pool', 'Hot tub', 'Air conditioning', 'Pet-friendly', 'Fitness center'], priceInr: 14025, starCategory: '5-star' },
  { id: 'ht-74', name: 'The Leela Mumbai - Resort Style Business Hotel', rating: 4.5, city: 'Mumbai', features: ['5-star hotel', 'Free breakfast', 'Free Wi-Fi', 'Free parking', 'Pool', 'Hot tub', 'Air conditioning', 'Fitness center', 'Spa'], priceInr: 11210, starCategory: '5-star' },
  { id: 'ht-75', name: 'Novotel Mumbai Juhu Beach', rating: 4.3, city: 'Mumbai', features: ['5-star hotel', 'Breakfast', 'Free Wi-Fi', 'Free parking', 'Pool', 'Air conditioning', 'Pet-friendly', 'Fitness center', 'Beach access'], priceInr: 11785, starCategory: '5-star' },
  { id: 'ht-76', name: 'Courtyard by Marriott Mumbai International Airport', rating: 4.4, city: 'Mumbai', features: ['4-star hotel', 'Breakfast', 'Free Wi-Fi', 'Free parking', 'Pool', 'Air conditioning', 'Fitness center', 'Spa', 'Bar'], priceInr: 11103, starCategory: '4-star' },
  { id: 'ht-77', name: 'JW Marriott Mumbai Sahar', rating: 4.6, city: 'Mumbai', features: ['5-star hotel', 'Breakfast', 'Free Wi-Fi', 'Free parking', 'Pool', 'Air conditioning', 'Fitness center', 'Spa', 'Bar'], priceInr: 12963, starCategory: '5-star' },
  { id: 'ht-78', name: 'The Westin Mumbai Garden City', rating: 4.5, city: 'Mumbai', features: ['5-star hotel', 'Free Wi-Fi', 'Free parking', 'Pool', 'Hot tub', 'Air conditioning', 'Fitness center', 'Spa', 'Breakfast'], priceInr: 12963, starCategory: '5-star' },

  // Jaipur
  { id: 'ht-79', name: 'Trident Hotel Jaipur', rating: 4.4, city: 'Jaipur', features: ['5-star hotel', 'Breakfast', 'Free Wi-Fi', 'Free parking', 'Pool', 'Air conditioning', 'Fitness center', 'Spa', 'Bar'], priceInr: 14160, starCategory: '5-star' },
  { id: 'ht-80', name: 'The Lalit Jaipur', rating: 4.4, city: 'Jaipur', features: ['5-star hotel', 'Free breakfast', 'Wi-Fi', 'Free parking', 'Pool', 'Air conditioning', 'Fitness center', 'Spa', 'Bar'], priceInr: 12389, starCategory: '5-star' },
  { id: 'ht-81', name: 'Chokhi Dhani Resort', rating: 4.3, city: 'Jaipur', features: ['5-star hotel', 'Free breakfast', 'Free Wi-Fi', 'Free parking', 'Pool', 'Air conditioning', 'Fitness center', 'Spa', 'Restaurant'], priceInr: 10029, starCategory: '5-star' },
  { id: 'ht-82', name: 'Holiday Inn Jaipur City Centre, an IHG Hotel', rating: 4.5, city: 'Jaipur', features: ['5-star hotel', 'Breakfast', 'Free Wi-Fi', 'Free parking', 'Pool', 'Air conditioning', 'Fitness center', 'Spa', 'Bar'], priceInr: 14190, starCategory: '5-star' },
  { id: 'ht-83', name: 'Jaipur Marriott Hotel', rating: 4.5, city: 'Jaipur', features: ['5-star hotel', 'Breakfast', 'Free Wi-Fi', 'Free parking', 'Pool', 'Hot tub', 'Air conditioning', 'Fitness center', 'Spa'], priceInr: 7840, starCategory: '5-star' },
  { id: 'ht-84', name: 'Devi Ratn, Jaipur – IHCL SeleQtions', rating: 4.5, city: 'Jaipur', features: ['5-star hotel', 'Free breakfast', 'Free Wi-Fi', 'Free parking', 'Pool', 'Hot tub', 'Air conditioning', 'Pet-friendly', 'Fitness center'], priceInr: 16992, starCategory: '5-star' },
  { id: 'ht-85', name: 'Jai Mahal Palace, Jaipur', rating: 4.7, city: 'Jaipur', features: ['5-star hotel', 'Free breakfast', 'Free Wi-Fi', 'Free parking', 'Pool', 'Air conditioning', 'Fitness center', 'Spa', 'Bar'], priceInr: 34173, starCategory: '5-star' },

  // Varanasi
  { id: 'ht-86', name: 'Radisson Hotel Varanasi', rating: 4.2, city: 'Varanasi', features: ['5-star hotel', 'Free breakfast', 'Free Wi-Fi', 'Free parking', 'Pool', 'Air conditioning', 'Fitness center', 'Spa', 'Bar'], priceInr: 7824, starCategory: '5-star' },
  { id: 'ht-87', name: 'Pearl Courtyard', rating: 4.3, city: 'Varanasi', features: ['4-star hotel', 'Free breakfast', 'Free Wi-Fi', 'Paid parking', 'Air conditioning', 'Restaurant', 'Room service', 'Airport shuttle'], priceInr: 6957, starCategory: '4-star' },
  { id: 'ht-88', name: 'Hotel Surya, Kaiser Palace', rating: 4.2, city: 'Varanasi', features: ['3-star hotel', 'Free breakfast', 'Free Wi-Fi', 'Free parking', 'Pool', 'Air conditioning', 'Pet-friendly', 'Spa', 'Bar'], priceInr: 4214, starCategory: '3-star' },
  { id: 'ht-89', name: 'Hotel Ganges Grand - Varanasi', rating: 4.0, city: 'Varanasi', features: ['3-star hotel', 'Free breakfast', 'Free Wi-Fi', 'Free parking', 'Air conditioning', 'Restaurant', 'Room service', 'Airport shuttle'], priceInr: 5914, starCategory: '3-star' },

  // Srinagar / Kashmir
  { id: 'ht-90', name: 'The Khyber Himalayan Resort & Spa', rating: 4.6, city: 'Srinagar', features: ['5-star hotel', 'Free breakfast', 'Wi-Fi', 'Free parking', 'Pool', 'Hot tub', 'Air conditioning', 'Fitness center', 'Spa'], priceInr: 53089, starCategory: '5-star' },
  { id: 'ht-91', name: 'Vivanta Dal View, Srinagar', rating: 4.5, city: 'Srinagar', features: ['5-star hotel', 'Free breakfast', 'Free Wi-Fi', 'Free parking', 'Pool', 'Air conditioning', 'Pet-friendly', 'Fitness center', 'Spa'], priceInr: 28656, starCategory: '5-star' },
  { id: 'ht-92', name: 'The LaLiT Grand Palace Srinagar', rating: 4.3, city: 'Srinagar', features: ['5-star hotel', 'Free breakfast', 'Free Wi-Fi', 'Free parking', 'Pool', 'Air conditioning', 'Fitness center', 'Spa', 'Bar'], priceInr: 25370, starCategory: '5-star' },
  { id: 'ht-93', name: 'The Orchard Retreat & Spa, Srinagar', rating: 4.3, city: 'Srinagar', features: ['5-star hotel', 'Free breakfast', 'Free Wi-Fi', 'Free parking', 'Pool', 'Hot tub', 'Air conditioning', 'Fitness center', 'Spa'], priceInr: 14172, starCategory: '5-star' },

  // Shimla / Dehradun / Gangtok / Varkala
  { id: 'ht-94', name: 'Hyatt Regency Dehradun Resort and Spa', rating: 4.6, city: 'Dehradun', features: ['5-star hotel', 'Breakfast', 'Free Wi-Fi', 'Free parking', 'Pool', 'Air conditioning', 'Pet-friendly', 'Fitness center', 'Spa'], priceInr: 20562, starCategory: '5-star' },
  { id: 'ht-95', name: 'MAYFAIR Spa Resort & Casino, Gangtok', rating: 4.4, city: 'Gangtok', features: ['5-star hotel', 'Free breakfast', 'Free Wi-Fi', 'Free parking', 'Pool', 'Hot tub', 'Air conditioning', 'Fitness center', 'Spa'], priceInr: 9800, starCategory: '5-star' },
  { id: 'ht-96', name: 'Vivanta Sikkim, Pakyong', rating: 4.4, city: 'Gangtok', features: ['5-star hotel', 'Free breakfast', 'Free Wi-Fi', 'Free parking', 'Pool', 'Pet-friendly', 'Spa', 'Restaurant', 'Room service'], priceInr: 12980, starCategory: '5-star' },
  { id: 'ht-97', name: 'Elixir Cliff Beach Resort and Spa, Varkala', rating: 4.5, city: 'Varkala', features: ['Free breakfast', 'Free Wi-Fi', 'Free parking', 'Pool', 'Spa', 'Beach access', 'Restaurant', 'Room service'], priceInr: 8048 },
  { id: 'ht-98', name: 'Sajjoys Varkala', rating: 4.7, city: 'Varkala', features: ['Free breakfast', 'Free Wi-Fi', 'Paid parking', 'Pool', 'Air conditioning', 'Fitness center', 'Spa', 'Beach access'], priceInr: 7018 }
];

/**
 * Filter hotels by city name (case-insensitive)
 */
export function getHotelsByCity(cityName: string): IndianHotelRecord[] {
  const query = cityName.toLowerCase().trim();
  return ALL_INDIAN_HOTELS.filter(
    h => h.city.toLowerCase().includes(query) || query.includes(h.city.toLowerCase())
  );
}

/**
 * Filter hotels by star rating
 */
export function getHotelsByRating(minRating: number): IndianHotelRecord[] {
  return ALL_INDIAN_HOTELS.filter(h => h.rating >= minRating);
}

/**
 * Filter hotels by max price INR
 */
export function getHotelsByPrice(maxPriceInr: number): IndianHotelRecord[] {
  return ALL_INDIAN_HOTELS.filter(h => h.priceInr <= maxPriceInr);
}
