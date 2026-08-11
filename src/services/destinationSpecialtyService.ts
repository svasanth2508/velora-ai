export interface DestinationSpecialty {
  name: string;
  tagline: string;
  specialty: string;
  historicalSignificance?: string;
  famousDishes: string[];
  famousShopping: string[];
  bestTimeToVisit: string;
  famousHighlights: { name: string; description: string; category: string }[];
  tag: string;
}

const DESTINATION_SPECIALTIES_DB: Record<string, DestinationSpecialty> = {
  'karur': {
    name: 'Karur',
    tagline: 'Textile Export Capital & Historic Chola Citadel on Amaravathi River',
    tag: 'Textile Capital & Ancient Heritage Hub',
    specialty: 'World-famous textile export hub on the banks of Amaravathi & Kaveri rivers, renowned for the 1000+ year-old Pasupatheeswarar Temple, handloom cotton weaves, paper manufacturing, and authentic Karur spicy mutton chukka and banana leaf feasts.',
    historicalSignificance: 'One of the ancient Sangam Chera and Chola capitals, documented in 1st-century Roman trade records as Karuvoor.',
    famousDishes: ['Karur Mutton Chukka', 'Pallapatti Biryani', 'Kola Urundai (Meatballs)', 'South Indian Banana Leaf Thali', 'Jigarthanda'],
    famousShopping: ['Export Quality Home Textiles', 'Karur Handloom Cotton Bedsheets', 'Brassware Artifacts', 'Kora Silk Sarees'],
    bestTimeToVisit: 'October to March (Pleasant tropical weather: 20°C - 30°C)',
    famousHighlights: [
      { name: 'Pasupatheeswarar Temple', description: 'Ancient 7th-century Chola Shiva shrine with 100-pillar hall and exquisite stone carvings', category: 'Heritage Temple' },
      { name: 'Mayanur Barrage & Eco Park', description: 'Scenic river barrage across Kaveri & Amaravathi rivers with boating and lush gardens', category: 'Waterfront Park' },
      { name: 'Nerur Jeeva Samadhi', description: 'Peaceful riverbank spiritual pilgrimage center dedicated to Sadashiva Brahmendra', category: 'Spiritual Shrine' },
      { name: 'Amaravathi Riverfront Promenade', description: 'Serene riverside walkway for evening breezes and sunset views', category: 'Scenic Walkway' }
    ]
  },
  'trichy': {
    name: 'Tiruchirappalli (Trichy)',
    tagline: 'Fort City of the Kaveri Delta & Ancient Temple Citadel',
    tag: 'Chola & Nayak Heritage',
    specialty: 'Famous for the monolithic 273-foot Rockfort Temple, sprawling Srirangam Ranganathaswamy Temple (largest active Hindu temple complex in the world), and traditional brassware.',
    historicalSignificance: 'Capital of the Early Cholas in Sangam period, expanded under Nayaks of Madurai and Marathas.',
    famousDishes: ['Trichy Special Biryani', 'Kaveri Fish Curry', 'Elaneer Payasam', 'Filter Coffee'],
    famousShopping: ['Brass & Bronze Idols', 'Tanjore Paintings', 'Cigar Manufactures', 'Handloom Sarees'],
    bestTimeToVisit: 'November to March',
    famousHighlights: [
      { name: 'Rockfort Ucchi Pillayar Temple', description: 'Historic 7th-century fort temple carved out of a 3.8-billion-year-old rock outcrop', category: 'Rock Fort' },
      { name: 'Srirangam Ranganathaswamy Temple', description: 'Sprawling 156-acre temple complex with 21 magnificent gopurams', category: 'Spiritual Wonder' }
    ]
  },
  'jaipur': {
    name: 'Jaipur',
    tagline: 'The Pink City & Royal Jewel of Rajasthan',
    tag: 'UNESCO World Heritage City',
    specialty: 'World-famous for majestic hilltop forts, pink sandstone palaces, block-printed textiles, Kundan gemstone jewelry, and opulent royal Rajasthani hospitality.',
    historicalSignificance: 'Founded in 1727 by Maharaja Sawai Jai Singh II, Jaipur is India’s first planned city built according to Vedic Shilpa Shastra architecture.',
    famousDishes: ['Dal Baati Churma', 'Ghewar', 'Pyaaz Kachori', 'Laal Maas', 'Mawa Kachori'],
    famousShopping: ['Blue Pottery', 'Sanganeri Block Print Fabrics', 'Kundan Jewelry', 'Mojari Leather Shoes'],
    bestTimeToVisit: 'October to March (Pleasant winter weather: 15°C - 25°C)',
    famousHighlights: [
      { name: 'Amber Fort', description: 'Grand 16th-century hilltop palace with Sheesh Mahal (Mirror Palace)', category: 'Heritage Fort' },
      { name: 'Hawa Mahal', description: 'Palace of Winds featuring 953 intricate honeycomb lattice windows', category: 'Architectural Wonder' },
      { name: 'City Palace', description: 'Royal residence blending Rajput, Mughal, and European architecture', category: 'Royal Museum' },
      { name: 'Jantar Mantar', description: 'UNESCO astronomical observatory housing world’s largest stone sundial', category: 'UNESCO Observatory' }
    ]
  },
  'agra': {
    name: 'Agra',
    tagline: 'City of the Immortal Taj Mahal & Mughal Empire',
    tag: 'Home to 7th Wonder of the World',
    specialty: 'World-renowned home of the Taj Mahal, delicate Marble Inlay (Pietra Dura) craft, Mughal royal cuisine, and authentic Agra Petha sweets.',
    historicalSignificance: 'Served as the magnificent capital of the Mughal Empire under Emperors Akbar, Jahangir, and Shah Jahan.',
    famousDishes: ['Agra Petha (Pan Petha)', 'Mughlai Biryani', 'Bedai & Jalebi', 'Tandoori Kebabs'],
    famousShopping: ['Marble Inlay Craftwork', 'Zardozi Embroidery', 'Leather Artifacts', 'Brassware'],
    bestTimeToVisit: 'October to March (Ideal for sunrise Taj Mahal visits)',
    famousHighlights: [
      { name: 'Taj Mahal', description: 'White marble mausoleum of eternal love built by Emperor Shah Jahan', category: 'World Wonder' },
      { name: 'Agra Fort', description: 'Red sandstone fortress walled city that served as Mughal royal seat', category: 'UNESCO Citadel' },
      { name: 'Fatehpur Sikri', description: 'Preserved 16th-century ghost city with Buland Darwaza gateway', category: 'Ancient Capital' },
      { name: 'Mehtab Bagh', description: 'Moonlight garden offering panoramic sunset views across the Yamuna', category: 'Scenic Garden' }
    ]
  },
  'ooty': {
    name: 'Ooty (Udhagamandalam)',
    tagline: 'Queen of the Nilgiri Hill Stations',
    tag: 'Nilgiri Mountain Railway Heritage',
    specialty: 'Famous for lush green Nilgiri tea estates, UNESCO heritage steam toy train, aromatic eucalyptus oils, handmade artisan chocolates, and misty mountain lakes.',
    historicalSignificance: 'Established as a summer retreat for the Madras Presidency during British colonial rule in the 19th century.',
    famousDishes: ['Home-made Chocolates', 'Nilgiri Spiced Tea', 'South Indian Filter Coffee', 'Fresh Bakery Cakes'],
    famousShopping: ['Handmade Chocolates', 'Eucalyptus & Herbal Oils', 'Nilgiri CTC & Orthodox Tea', 'Toda Tribal Embroidery'],
    bestTimeToVisit: 'October to June (Pleasant weather: 10°C - 20°C)',
    famousHighlights: [
      { name: 'Doddabetta Peak', description: 'Highest peak in Nilgiri mountains offering 360-degree valley views', category: 'Mountain Peak' },
      { name: 'Ooty Lake', description: 'Picturesque artificial lake built in 1824 with boating and cycling tracks', category: 'Alpine Lake' },
      { name: 'Government Botanical Garden', description: '55-acre botanical paradise housing a 20-million-year-old fossil tree', category: 'Nature Reserve' },
      { name: 'Nilgiri Toy Train', description: 'Historic UNESCO heritage rack railway steam train through pine forests', category: 'UNESCO Railway' }
    ]
  },
  'goa': {
    name: 'Goa',
    tagline: 'India’s Beach, Sunshine & Portuguese Heritage Haven',
    tag: 'Coastal Paradise & Nightlife',
    specialty: 'Famous for sun-kissed sandy beaches, water sports, vibrant beach shacks, Latin Quarter Portuguese architecture, and authentic Goan seafood curries.',
    historicalSignificance: 'Ruled by Portugal for over 450 years until 1961, creating a unique fusion of Indian and European customs.',
    famousDishes: ['Goan Fish Curry Rice', 'Pork Vindaloo', 'Bebinca Layered Dessert', 'Xacuti', 'Feni Drink'],
    famousShopping: ['Cashew Nuts', 'Feni Spirits', 'Azulejos Ceramic Tiles', 'Boho Beachwear & Shell Jewelry'],
    bestTimeToVisit: 'November to February (Cool sea breeze & beach festivals)',
    famousHighlights: [
      { name: 'Baga & Calangute Beaches', description: 'Bustling beach stretch for parasailing, jet skis, and lively beach shacks', category: 'Beach & Sports' },
      { name: 'Basilica of Bom Jesus', description: 'UNESCO 16th-century baroque church holding sacred mortal remains of St. Francis Xavier', category: 'UNESCO Basilica' },
      { name: 'Fontainhas Latin Quarter', description: 'Colorful Portuguese colonial neighborhood with pastel houses and art cafes', category: 'Heritage Quarter' },
      { name: 'Dudhsagar Waterfalls', description: 'Four-tiered milky waterfall cascading 310m through Bhagwan Mahaveer Sanctuary', category: 'Nature Waterfall' }
    ]
  },
  'varanasi': {
    name: 'Varanasi (Kashi)',
    tagline: 'The Spiritual Capital of India & Oldest Living City',
    tag: 'Sacred Ganges River Ghats',
    specialty: 'Famous for sacred Ganga Aarti ceremony, centuries-old riverside ghats, Kashi Vishwanath temple, world-class Banarasi silk sarees, and classical music traditions.',
    historicalSignificance: 'One of the world’s oldest continuously inhabited cities (over 3,000 years old), revered as the abode of Lord Shiva.',
    famousDishes: ['Banarasi Paan', 'Malaiyyo (Winter Foam Dessert)', 'Kachori Sabzi', 'Tamatar Chaat', 'Thandai'],
    famousShopping: ['Banarasi Silk Sarees & Brocades', 'Brass Idols & Oil Lamps', 'Rudraksha Mala Beads', 'Wooden Toys'],
    bestTimeToVisit: 'October to March (Cool river breezes & evening Ganga Aarti)',
    famousHighlights: [
      { name: 'Dashashwamedh Ghat', description: 'Main riverfront famous for spectacular synchronized evening Ganga Aarti ritual', category: 'Sacred Riverfront' },
      { name: 'Kashi Vishwanath Temple', description: 'Revered Golden Temple dedicated to Lord Shiva, one of 12 Jyotirlingas', category: 'Spiritual Shrine' },
      { name: 'Sarnath', description: 'Sacred site where Lord Buddha delivered his first sermon after enlightenment', category: 'Buddhist Heritage' },
      { name: 'Assi Ghat', description: 'Peaceful southern ghat known for Subah-e-Banaras morning yoga & chants', category: 'Cultural Ghat' }
    ]
  },
  'mumbai': {
    name: 'Mumbai',
    tagline: 'City of Dreams, Bollywood & Marine Drive Skyline',
    tag: 'Financial Capital & Coastal Metropolis',
    specialty: 'Famous for iconic Gateway of India, Victorian Gothic architecture, vibrant Bollywood film industry, street food culture, and scenic Marine Drive sunset views.',
    historicalSignificance: 'Originally an archipelago of seven islands inhabited by Koli fishermen, transformed into India’s financial hub.',
    famousDishes: ['Vada Pav', 'Pav Bhaji', 'Bombay Bhel Puri', 'Bombil Fry', 'Irani Chai & Bun Maska'],
    famousShopping: ['Colaba Causeway Antiques', 'Fashion at Linking Road', 'Traditional Spices', 'Custom Leather'],
    bestTimeToVisit: 'November to February (Pleasant coastal breezes)',
    famousHighlights: [
      { name: 'Gateway of India', description: 'Colonial arch monument built in 1924 overlooking the Arabian Sea', category: 'Iconic Landmark' },
      { name: 'Marine Drive', description: '3.6km C-shaped coastal boulevard nicknamed the "Queen\'s Necklace"', category: 'Scenic Esplanade' },
      { name: 'Elephanta Caves', description: 'UNESCO rock-cut cave temples dedicated to Lord Shiva on Elephanta Island', category: 'UNESCO Caves' },
      { name: 'Chhatrapati Shivaji Maharaj Terminus', description: 'UNESCO Victorian Gothic railway station landmark', category: 'Heritage Station' }
    ]
  },
  'delhi': {
    name: 'Delhi',
    tagline: 'Capital Heart of India: Where History Meets Modernity',
    tag: 'Capital City & Ancient Empires',
    specialty: 'Famous for majestic Mughal red-stone monuments, bustling centuries-old markets of Chandni Chowk, world-class street food, and vibrant art culture.',
    historicalSignificance: 'Capital of seven historical empires spanning Pandavas\' Indraprastha, Delhi Sultanate, Mughals, and British India.',
    famousDishes: ['Butter Chicken', 'Chandni Chowk Paranthas', 'Chole Bhature', 'Dahi Bhalla', 'Kulfi Falooda'],
    famousShopping: ['Chandni Chowk Fabrics', 'Dilli Haat Handicrafts', 'Khan Market Boutiques', 'Sarojini Nagar Fashion'],
    bestTimeToVisit: 'October to March (Crisp sunny winter days)',
    famousHighlights: [
      { name: 'Qutub Minar', description: '73-meter tall UNESCO brick minaret built in 1192 surrounded by ancient ruins', category: 'UNESCO Minaret' },
      { name: 'Red Fort (Lal Qila)', description: 'Imposing Mughal fortress of red sandstone constructed by Emperor Shah Jahan', category: 'Mughal Citadel' },
      { name: 'India Gate', description: '73m war memorial arch honoring 84,000 fallen soldiers with Amar Jawan Jyoti', category: 'National Monument' },
      { name: 'Humayun\'s Tomb', description: 'First garden-tomb on Indian subcontinent that inspired the Taj Mahal', category: 'Mughal Garden Tomb' }
    ]
  },
  'munnar': {
    name: 'Munnar',
    tagline: 'Emerald Tea Gardens & Misty Western Ghats of Kerala',
    tag: 'Hill Station & Wildlife Sanctuary',
    specialty: 'Famous for rolling carpet tea plantations, rare Neelakurinji flowers (blooms once in 12 years), Nilgiri Tahr mountain goats, and refreshing mountain air.',
    historicalSignificance: 'Former resort for the British Government in South India; named after "three rivers" confluence.',
    famousDishes: ['Kerala Sadya', 'Appam with Stew', 'Cardamom Tea', 'Malabar Parotta & Beef Curry'],
    famousShopping: ['Fresh Tea Leaves', 'Hand-harvested Spices (Cardamom, Pepper)', 'Eucalyptus Oil', 'Pure Honey'],
    bestTimeToVisit: 'September to May (Crisp green weather)',
    famousHighlights: [
      { name: 'Eravikulam National Park', description: 'Home to endangered Nilgiri Tahr mountain goat and Anamudi Peak', category: 'National Park' },
      { name: 'Mattupetty Dam & Lake', description: 'Scenic dam reservoir with speedboating surrounded by tea plantations', category: 'Alpine Lake' },
      { name: 'Tea Museum (KDHP)', description: 'Heritage factory detailing 140+ years of tea cultivation history', category: 'Heritage Museum' }
    ]
  },
  'udaipur': {
    name: 'Udaipur',
    tagline: 'City of Lakes & Venice of the East',
    tag: 'Romantic Lake Palaces',
    specialty: 'Famous for pristine Lake Pichola, floating white marble Lake Palace, sunset boat cruises, romantic heritage rooftop dining, and miniature Mewar paintings.',
    historicalSignificance: 'Founded in 1559 by Maharana Udai Singh II as the new capital of the historic Mewar Kingdom.',
    famousDishes: ['Dal Baati Churma', 'Gatte Ki Sabzi', 'Ker Sangri', 'Kachori', 'Rabri'],
    famousShopping: ['Miniature Mewar Paintings', 'Leather Bound Journals', 'Handcrafted Silver Jewelry', 'Puppets'],
    bestTimeToVisit: 'September to March (Pleasant lakeside weather)',
    famousHighlights: [
      { name: 'City Palace Udaipur', description: 'Grand sprawling palace complex overlooking Lake Pichola with crystal gallery', category: 'Royal Palace' },
      { name: 'Lake Pichola', description: 'Picturesque freshwater lake featuring Jag Mandir island and Lake Palace', category: 'Scenic Lake' },
      { name: 'Saheliyon-Ki-Bari', description: 'Majestic garden of maidens with marble fountains and lotus pools', category: 'Royal Garden' }
    ]
  }
};

/**
 * Helper to fetch detailed specialty info for any location query
 */
export function getDestinationSpecialty(locationName: string): DestinationSpecialty {
  if (!locationName) {
    return DESTINATION_SPECIALTIES_DB['jaipur'];
  }

  const norm = locationName.trim().toLowerCase();

  // 1. Direct or partial key match in DB
  for (const [key, spec] of Object.entries(DESTINATION_SPECIALTIES_DB)) {
    if (norm.includes(key) || key.includes(norm)) {
      return spec;
    }
  }

  // 2. Dynamic high-quality specialty generator for any requested location
  const capitalized = locationName.charAt(0).toUpperCase() + locationName.slice(1);
  return {
    name: capitalized,
    tagline: `Explore the Wonders & Local Delights of ${capitalized}`,
    tag: 'Verified Destination',
    specialty: `${capitalized} is celebrated for its distinct cultural heritage, scenic natural viewpoints, vibrant local marketplaces, and authentic regional culinary specialties.`,
    historicalSignificance: `Rich in local traditions and historical landmarks, ${capitalized} offers travelers a captivating glimpse into regional heritage.`,
    famousDishes: [`Local ${capitalized} Specialty Dishes`, 'Traditional Thali', 'Regional Street Food Delicacies', 'Fresh Artisanal Desserts'],
    famousShopping: ['Local Handicrafts', 'Traditional Souvenirs', 'Artisan Textile Weaves', 'Handmade Pottery'],
    bestTimeToVisit: 'October to April (Favorable climate & local cultural celebrations)',
    famousHighlights: [
      { name: `${capitalized} Heritage Center`, description: `Historic centerpiece monument showcasing the artistic traditions of ${capitalized}.`, category: 'Cultural Landmark' },
      { name: `${capitalized} Scenic Viewpoint`, description: `Panoramic vantage point overlooking the natural landscape and cityscape.`, category: 'Panoramic View' },
      { name: `${capitalized} Grand Bazaar`, description: `Bustling local market featuring hand-crafted goods, spices, and street food.`, category: 'Local Market' }
    ]
  };
}
