import React, { useState, useMemo } from 'react';
import {
  ALL_INDIAN_ATTRACTIONS,
  INDIAN_CITY_DETAILS,
  IndianAttractionRecord
} from '../data/indiaTourismDataset';
import {
  ALL_INDIAN_HOTELS,
  IndianHotelRecord
} from '../data/indianHotelsDataset';
import {
  ALL_INDIAN_RESTAURANTS,
  IndianRestaurantRecord
} from '../data/indianRestaurantsDataset';
import {
  Database,
  Search,
  Filter,
  Camera,
  CheckCircle,
  Star,
  MapPin,
  Eye,
  ArrowUpRight,
  Clock,
  DollarSign,
  Hotel,
  Sparkles,
  Utensils,
  Truck,
  ThumbsUp
} from 'lucide-react';
import { getLocationImage } from '../services/locationImageService';

interface DatasetAnalyticsHubProps {
  onSelectDestinationForTwin?: (cityName: string) => void;
}

export const DatasetAnalyticsHub: React.FC<DatasetAnalyticsHubProps> = ({
  onSelectDestinationForTwin
}) => {
  const [activeDatasetTab, setActiveDatasetTab] = useState<'attractions' | 'hotels' | 'restaurants'>('attractions');

  // Attraction Filters State
  const [searchTerm, setSearchQuery] = useState('');
  const [selectedZone, setSelectedZone] = useState<string>('All');
  const [selectedSignificance, setSelectedSignificance] = useState<string>('All');
  const [dslrFilter, setDslrFilter] = useState<'All' | 'Yes' | 'No'>('All');
  const [feeFilter, setFeeFilter] = useState<'All' | 'Free' | 'Paid'>('All');
  const [selectedAttractionModal, setSelectedAttractionModal] = useState<IndianAttractionRecord | null>(null);

  // Hotel Filters State
  const [hotelSearchTerm, setHotelSearchTerm] = useState('');
  const [selectedHotelCity, setSelectedHotelCity] = useState<string>('All');
  const [selectedStarCategory, setSelectedStarCategory] = useState<string>('All');
  const [maxHotelPrice, setMaxHotelPrice] = useState<number>(35000);
  const [selectedHotelModal, setSelectedHotelModal] = useState<IndianHotelRecord | null>(null);

  // Restaurant Filters State
  const [restaurantSearchTerm, setRestaurantSearchTerm] = useState('');
  const [selectedRestaurantCity, setSelectedRestaurantCity] = useState<string>('All');
  const [selectedCuisine, setSelectedCuisine] = useState<string>('All');
  const [deliveryOnlyFilter, setDeliveryOnlyFilter] = useState<boolean>(false);
  const [maxRestaurantCost, setMaxRestaurantCost] = useState<number>(5000);
  const [selectedRestaurantModal, setSelectedRestaurantModal] = useState<IndianRestaurantRecord | null>(null);

  // Extract unique Zones and Significance categories for attractions
  const zones = useMemo(() => {
    const list = Array.from(new Set(ALL_INDIAN_ATTRACTIONS.map(a => a.zone)));
    return ['All', ...list];
  }, []);

  const significances = useMemo(() => {
    const list = Array.from(new Set(ALL_INDIAN_ATTRACTIONS.map(a => a.significance)));
    return ['All', ...list];
  }, []);

  // Extract unique Cities for Hotels & Restaurants
  const hotelCities = useMemo(() => {
    const list = Array.from(new Set(ALL_INDIAN_HOTELS.map(h => h.city))).sort();
    return ['All', ...list];
  }, []);

  const restaurantCities = useMemo(() => {
    const list = Array.from(new Set(ALL_INDIAN_RESTAURANTS.map(r => r.city))).sort();
    return ['All', ...list];
  }, []);

  const uniqueCuisines = useMemo(() => {
    const set = new Set<string>();
    ALL_INDIAN_RESTAURANTS.forEach(r => r.cuisines.forEach(c => set.add(c)));
    return ['All', ...Array.from(set).sort()];
  }, []);

  // Filtered dataset calculation for attractions
  const filteredDataset = useMemo(() => {
    return ALL_INDIAN_ATTRACTIONS.filter(item => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.type.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesZone = selectedZone === 'All' || item.zone === selectedZone;
      const matchesSig = selectedSignificance === 'All' || item.significance === selectedSignificance;
      const matchesDslr =
        dslrFilter === 'All' ||
        (dslrFilter === 'Yes' && item.dslrAllowed) ||
        (dslrFilter === 'No' && !item.dslrAllowed);
      const matchesFee =
        feeFilter === 'All' ||
        (feeFilter === 'Free' && item.entranceFeeInr === 0) ||
        (feeFilter === 'Paid' && item.entranceFeeInr > 0);

      return matchesSearch && matchesZone && matchesSig && matchesDslr && matchesFee;
    });
  }, [searchTerm, selectedZone, selectedSignificance, dslrFilter, feeFilter]);

  // Filtered dataset calculation for hotels
  const filteredHotels = useMemo(() => {
    return ALL_INDIAN_HOTELS.filter(item => {
      const matchesSearch =
        item.name.toLowerCase().includes(hotelSearchTerm.toLowerCase()) ||
        item.city.toLowerCase().includes(hotelSearchTerm.toLowerCase()) ||
        item.features.some(f => f.toLowerCase().includes(hotelSearchTerm.toLowerCase()));

      const matchesCity =
        selectedHotelCity === 'All' ||
        item.city.toLowerCase() === selectedHotelCity.toLowerCase();

      const matchesStar =
        selectedStarCategory === 'All' ||
        (selectedStarCategory === '5-star' && item.starCategory === '5-star') ||
        (selectedStarCategory === '4-star' && item.starCategory === '4-star') ||
        (selectedStarCategory === '3-star' && item.starCategory === '3-star') ||
        (selectedStarCategory === 'Budget' && !item.starCategory);

      const matchesPrice = item.priceInr <= maxHotelPrice;

      return matchesSearch && matchesCity && matchesStar && matchesPrice;
    });
  }, [hotelSearchTerm, selectedHotelCity, selectedStarCategory, maxHotelPrice]);

  // Filtered dataset calculation for restaurants
  const filteredRestaurants = useMemo(() => {
    return ALL_INDIAN_RESTAURANTS.filter(item => {
      const matchesSearch =
        item.name.toLowerCase().includes(restaurantSearchTerm.toLowerCase()) ||
        item.city.toLowerCase().includes(restaurantSearchTerm.toLowerCase()) ||
        item.locality.toLowerCase().includes(restaurantSearchTerm.toLowerCase()) ||
        item.cuisines.some(c => c.toLowerCase().includes(restaurantSearchTerm.toLowerCase()));

      const matchesCity =
        selectedRestaurantCity === 'All' ||
        item.city.toLowerCase() === selectedRestaurantCity.toLowerCase();

      const matchesCuisine =
        selectedCuisine === 'All' ||
        item.cuisines.includes(selectedCuisine);

      const matchesDelivery = !deliveryOnlyFilter || item.hasOnlineDelivery;
      const matchesCost = item.costForTwoInr <= maxRestaurantCost;

      return matchesSearch && matchesCity && matchesCuisine && matchesDelivery && matchesCost;
    });
  }, [restaurantSearchTerm, selectedRestaurantCity, selectedCuisine, deliveryOnlyFilter, maxRestaurantCost]);

  // Analytics Metrics for Attractions
  const analytics = useMemo(() => {
    const total = filteredDataset.length;
    if (total === 0) return { avgRating: 0, freeCount: 0, avgFee: 0, topRated: null };

    const avgRating = (filteredDataset.reduce((acc, curr) => acc + curr.googleRating, 0) / total).toFixed(2);
    const freeCount = filteredDataset.filter(a => a.entranceFeeInr === 0).length;
    const paidItems = filteredDataset.filter(a => a.entranceFeeInr > 0);
    const avgFee = paidItems.length > 0
      ? Math.round(paidItems.reduce((acc, curr) => acc + curr.entranceFeeInr, 0) / paidItems.length)
      : 0;

    const topRated = [...filteredDataset].sort((a, b) => b.googleRating - a.googleRating || b.reviewCountLakhs - a.reviewCountLakhs)[0];

    return { avgRating, freeCount, avgFee, topRated };
  }, [filteredDataset]);

  // Analytics Metrics for Hotels
  const hotelAnalytics = useMemo(() => {
    const total = filteredHotels.length;
    if (total === 0) return { avgRating: 0, avgPrice: 0, fiveStarCount: 0, topRated: null };

    const avgRating = (filteredHotels.reduce((acc, curr) => acc + curr.rating, 0) / total).toFixed(2);
    const avgPrice = Math.round(filteredHotels.reduce((acc, curr) => acc + curr.priceInr, 0) / total);
    const fiveStarCount = filteredHotels.filter(h => h.starCategory === '5-star').length;
    const topRated = [...filteredHotels].sort((a, b) => b.rating - a.rating || a.priceInr - b.priceInr)[0];

    return { avgRating, avgPrice, fiveStarCount, topRated };
  }, [filteredHotels]);

  // Analytics Metrics for Restaurants
  const restaurantAnalytics = useMemo(() => {
    const total = filteredRestaurants.length;
    if (total === 0) return { avgRating: 0, avgCost: 0, deliveryCount: 0, topVoted: null };

    const avgRating = (filteredRestaurants.reduce((acc, curr) => acc + curr.rating, 0) / total).toFixed(2);
    const avgCost = Math.round(filteredRestaurants.reduce((acc, curr) => acc + curr.costForTwoInr, 0) / total);
    const deliveryCount = filteredRestaurants.filter(r => r.hasOnlineDelivery).length;
    const topVoted = [...filteredRestaurants].sort((a, b) => b.votes - a.votes)[0];

    return { avgRating, avgCost, deliveryCount, topVoted };
  }, [filteredRestaurants]);

  return (
    <div id="dataset-analytics-hub" className="space-y-6">
      {/* Top Banner Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-cyan-950 via-slate-900 to-indigo-950 border border-cyan-800/40 text-slate-100 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-xs font-semibold uppercase tracking-wider">
              <Database className="w-3.5 h-3.5" /> India Tourism, Stays & Dining Dataset
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Verified Destination, Stay & Restaurant Analytics Engine
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Analyzing real-world datasets covering national landmarks, UNESCO monuments, verified hotel stays, and top-rated restaurants across Indian travel hubs.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-900/80 border border-slate-700/60 rounded-xl px-4 py-3 text-center">
              <span className="block text-2xl font-black text-cyan-400">
                {activeDatasetTab === 'attractions'
                  ? filteredDataset.length
                  : activeDatasetTab === 'hotels'
                  ? filteredHotels.length
                  : filteredRestaurants.length}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {activeDatasetTab === 'attractions'
                  ? 'Filtered Spots'
                  : activeDatasetTab === 'hotels'
                  ? 'Filtered Hotels'
                  : 'Filtered Dining'}
              </span>
            </div>
            <div className="bg-slate-900/80 border border-slate-700/60 rounded-xl px-4 py-3 text-center">
              <span className="block text-2xl font-black text-emerald-400">
                {activeDatasetTab === 'attractions'
                  ? `${analytics.avgRating}★`
                  : activeDatasetTab === 'hotels'
                  ? `${hotelAnalytics.avgRating}★`
                  : `${restaurantAnalytics.avgRating}★`}
              </span>
              <span className="text-xs text-slate-400 font-medium">Avg Rating</span>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Dataset Tab Switcher */}
      <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-900 border border-slate-800">
        <button
          onClick={() => setActiveDatasetTab('attractions')}
          className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeDatasetTab === 'attractions'
              ? 'bg-cyan-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Camera className="w-4 h-4" /> Attractions ({ALL_INDIAN_ATTRACTIONS.length})
        </button>

        <button
          onClick={() => setActiveDatasetTab('hotels')}
          className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeDatasetTab === 'hotels'
              ? 'bg-cyan-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Hotel className="w-4 h-4" /> Hotels & Stays ({ALL_INDIAN_HOTELS.length})
        </button>

        <button
          onClick={() => setActiveDatasetTab('restaurants')}
          className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeDatasetTab === 'restaurants'
              ? 'bg-cyan-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Utensils className="w-4 h-4" /> Dining & Restaurants ({ALL_INDIAN_RESTAURANTS.length})
        </button>
      </div>

      {activeDatasetTab === 'attractions' ? (
        <>
          {/* Dataset KPI Cards Grid for Attractions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-3">
              <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-medium text-slate-400 block">Free Entry Monuments</span>
                <span className="text-lg font-bold text-slate-100">{analytics.freeCount} Locations</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-3">
              <div className="p-3 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-medium text-slate-400 block">Avg Paid Ticket</span>
                <span className="text-lg font-bold text-slate-100">₹{analytics.avgFee} INR</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-3">
              <div className="p-3 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-medium text-slate-400 block">DSLR Photography</span>
                <span className="text-lg font-bold text-slate-100">
                  {filteredDataset.filter(a => a.dslrAllowed).length} Allowed
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-3">
              <div className="p-3 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Star className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-medium text-slate-400 block">Top Attraction</span>
                <span className="text-sm font-bold text-slate-100 truncate max-w-[120px] block">
                  {analytics.topRated ? analytics.topRated.name : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Filter Control Bar */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex flex-col md:flex-row gap-3">
              {/* Search bar */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by monument, city (e.g. Jaipur, Delhi, Taj Mahal, Golden Temple)..."
                  value={searchTerm}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-700/80 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>

              {/* Zone Filter */}
              <div className="flex items-center gap-2 min-w-[180px]">
                <Filter className="w-4 h-4 text-slate-400" />
                <select
                  value={selectedZone}
                  onChange={(e) => setSelectedZone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-lg py-2 px-3 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  {zones.map(z => (
                    <option key={z} value={z}>{z === 'All' ? 'All Zones' : z}</option>
                  ))}
                </select>
              </div>

              {/* Significance Filter */}
              <div className="min-w-[180px]">
                <select
                  value={selectedSignificance}
                  onChange={(e) => setSelectedSignificance(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-lg py-2 px-3 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  {significances.map(s => (
                    <option key={s} value={s}>{s === 'All' ? 'All Categories' : s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Pills for DSLR & Fee */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-medium">DSLR Policy:</span>
                {(['All', 'Yes', 'No'] as const).map(option => (
                  <button
                    key={option}
                    onClick={() => setDslrFilter(option)}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      dslrFilter === option
                        ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/40'
                        : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {option === 'All' ? 'All' : option === 'Yes' ? 'DSLR Allowed' : 'Prohibited'}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-medium">Entrance Ticket:</span>
                {(['All', 'Free', 'Paid'] as const).map(option => (
                  <button
                    key={option}
                    onClick={() => setFeeFilter(option)}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      feeFilter === option
                        ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/40'
                        : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Dataset Results Table Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDataset.map((item) => {
              const img = getLocationImage(item.name);

              return (
                <div
                  key={item.id}
                  className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-cyan-500/50 transition-all duration-200 flex flex-col justify-between group"
                >
                  <div>
                    {/* Image Cover */}
                    <div className="relative h-44 overflow-hidden bg-slate-950">
                      <img
                        src={img}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                      {/* Top Badges */}
                      <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
                        <span className="px-2 py-0.5 rounded-md bg-slate-900/90 text-cyan-300 text-[10px] font-semibold border border-cyan-500/30">
                          {item.zone} Zone
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-900/90 text-amber-300 text-[10px] font-semibold border border-amber-500/30">
                          {item.significance}
                        </span>
                      </div>

                      <div className="absolute top-2.5 right-2.5">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-950/90 text-emerald-300 text-xs font-bold border border-emerald-500/30 flex items-center gap-1">
                          <Star className="w-3 h-3 fill-emerald-400 text-emerald-400" />
                          {item.googleRating}
                        </span>
                      </div>

                      {/* Bottom Header text */}
                      <div className="absolute bottom-2.5 left-3 right-3">
                        <h3 className="text-base font-bold text-white drop-shadow-md truncate">
                          {item.name}
                        </h3>
                        <p className="text-xs text-slate-300 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-cyan-400" />
                          {item.city}, {item.state}
                        </p>
                      </div>
                    </div>

                    {/* Specs Content */}
                    <div className="p-3.5 space-y-2.5 text-xs text-slate-300">
                      <div className="grid grid-cols-2 gap-2 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase block font-semibold">Entry Ticket</span>
                          <span className={`font-semibold ${item.entranceFeeInr === 0 ? 'text-emerald-400' : 'text-slate-200'}`}>
                            {item.entranceFeeInr === 0 ? 'Free Entry' : `₹${item.entranceFeeInr} INR`}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] text-slate-500 uppercase block font-semibold">Visit Duration</span>
                          <span className="font-semibold text-slate-200 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-cyan-400" /> {item.durationHrs} hrs
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] text-slate-500 uppercase block font-semibold">Best Window</span>
                          <span className="font-medium text-slate-300 truncate block">
                            {item.bestTime}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] text-slate-500 uppercase block font-semibold">Weekly Off</span>
                          <span className={`font-semibold ${item.weeklyOff !== 'None' ? 'text-amber-400' : 'text-slate-400'}`}>
                            {item.weeklyOff !== 'None' ? `Closed ${item.weeklyOff}` : 'Open Daily'}
                          </span>
                        </div>
                      </div>

                      {/* DSLR & Reviews */}
                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                        <span className="flex items-center gap-1">
                          <Camera className="w-3.5 h-3.5 text-slate-500" />
                          DSLR: {item.dslrAllowed ? <span className="text-emerald-400 font-medium">Allowed</span> : <span className="text-rose-400 font-medium">Prohibited</span>}
                        </span>

                        <span className="text-slate-400 font-medium">
                          {item.reviewCountLakhs}L+ Google Reviews
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action footer */}
                  <div className="p-3 bg-slate-950 border-t border-slate-800/80 flex items-center gap-2">
                    <button
                      onClick={() => setSelectedAttractionModal(item)}
                      className="flex-1 py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5 text-cyan-400" /> View Dataset Details
                    </button>

                    {onSelectDestinationForTwin && (
                      <button
                        onClick={() => onSelectDestinationForTwin(item.city)}
                        className="py-1.5 px-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-colors flex items-center gap-1 shadow-sm"
                      >
                        Simulate <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : activeDatasetTab === 'hotels' ? (
        <>
          {/* Dataset KPI Cards Grid for Hotels */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-3">
              <div className="p-3 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Hotel className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-medium text-slate-400 block">5-Star Luxury Stays</span>
                <span className="text-lg font-bold text-slate-100">{hotelAnalytics.fiveStarCount} Hotels</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-3">
              <div className="p-3 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-medium text-slate-400 block">Avg Room Rate</span>
                <span className="text-lg font-bold text-slate-100">₹{hotelAnalytics.avgPrice} / night</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-3">
              <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Star className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-medium text-slate-400 block">Avg Guest Rating</span>
                <span className="text-lg font-bold text-slate-100">{hotelAnalytics.avgRating} ★</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-3">
              <div className="p-3 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-medium text-slate-400 block">Top Value Stay</span>
                <span className="text-sm font-bold text-slate-100 truncate max-w-[120px] block">
                  {hotelAnalytics.topRated ? hotelAnalytics.topRated.name : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Hotel Filter Control Bar */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex flex-col md:flex-row gap-3">
              {/* Search bar */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search hotel name, city (e.g. Goa, Taj, Oberoi, Kochi, Mumbai)..."
                  value={hotelSearchTerm}
                  onChange={(e) => setHotelSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-700/80 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>

              {/* City Filter */}
              <div className="flex items-center gap-2 min-w-[180px]">
                <MapPin className="w-4 h-4 text-slate-400" />
                <select
                  value={selectedHotelCity}
                  onChange={(e) => setSelectedHotelCity(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-lg py-2 px-3 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 capitalize"
                >
                  {hotelCities.map(c => (
                    <option key={c} value={c}>{c === 'All' ? 'All Cities' : c}</option>
                  ))}
                </select>
              </div>

              {/* Category Filter */}
              <div className="min-w-[180px]">
                <select
                  value={selectedStarCategory}
                  onChange={(e) => setSelectedStarCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-lg py-2 px-3 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="All">All Categories</option>
                  <option value="5-star">5-Star Luxury Hotels</option>
                  <option value="4-star">4-Star Premium Hotels</option>
                  <option value="3-star">3-Star Boutique Stays</option>
                  <option value="Budget">Budget & Homestays</option>
                </select>
              </div>
            </div>

            {/* Price Range Slider */}
            <div className="flex items-center justify-between gap-4 pt-2 border-t border-slate-800 text-xs">
              <span className="text-slate-400 font-medium">Max Nightly Rate:</span>
              <div className="flex items-center gap-3 flex-1 max-w-md">
                <input
                  type="range"
                  min={500}
                  max={40000}
                  step={500}
                  value={maxHotelPrice}
                  onChange={(e) => setMaxHotelPrice(Number(e.target.value))}
                  className="flex-1 accent-cyan-500 bg-slate-950 cursor-pointer"
                />
                <span className="font-bold text-cyan-300 min-w-[90px] text-right">
                  Up to ₹{maxHotelPrice.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Hotels Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredHotels.map((hotel) => (
              <div
                key={hotel.id}
                className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-cyan-500/50 transition-all duration-200 flex flex-col justify-between group"
              >
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 text-[10px] font-bold border border-cyan-500/30 uppercase tracking-wider">
                        {hotel.starCategory || 'Boutique Stay'}
                      </span>
                      <h3 className="text-base font-bold text-white mt-1.5 group-hover:text-cyan-300 transition-colors">
                        {hotel.name}
                      </h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5 capitalize">
                        <MapPin className="w-3 h-3 text-cyan-400" /> {hotel.city}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="px-2 py-1 rounded-md bg-emerald-950 text-emerald-300 text-xs font-bold border border-emerald-500/30 inline-flex items-center gap-1">
                        <Star className="w-3 h-3 fill-emerald-400" /> {hotel.rating}
                      </span>
                      <span className="block text-sm font-black text-cyan-300 mt-1">
                        ₹{hotel.priceInr.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Amenities / Features Chips */}
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {hotel.features.slice(0, 5).map((feat, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] text-slate-300 font-medium"
                      >
                        {feat}
                      </span>
                    ))}
                    {hotel.features.length > 5 && (
                      <span className="px-1.5 py-0.5 rounded bg-slate-950 text-[10px] text-slate-500 font-semibold">
                        +{hotel.features.length - 5} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-3 bg-slate-950 border-t border-slate-800/80 flex items-center gap-2">
                  <button
                    onClick={() => setSelectedHotelModal(hotel)}
                    className="flex-1 py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5 text-cyan-400" /> Hotel Specs
                  </button>

                  {onSelectDestinationForTwin && (
                    <button
                      onClick={() => onSelectDestinationForTwin(hotel.city)}
                      className="py-1.5 px-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-colors flex items-center gap-1"
                    >
                      Plan {hotel.city} <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredHotels.length === 0 && (
            <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 space-y-3">
              <Hotel className="w-10 h-10 mx-auto text-slate-600" />
              <h3 className="text-lg font-bold text-slate-200">No Hotels Match Search Criteria</h3>
              <p className="text-sm max-w-md mx-auto">
                Try raising your price ceiling or selecting 'All Cities' to view available accommodations.
              </p>
              <button
                onClick={() => {
                  setHotelSearchTerm('');
                  setSelectedHotelCity('All');
                  setSelectedStarCategory('All');
                  setMaxHotelPrice(35000);
                }}
                className="px-4 py-2 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-semibold text-xs hover:bg-cyan-500/30 transition-colors"
              >
                Reset Hotel Filters
              </button>
            </div>
          )}
        </>
      ) : (
        /* Restaurants Tab Content */
        <>
          {/* Restaurant KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-3">
              <div className="p-3 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Utensils className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-medium text-slate-400 block">Total Dining Spots</span>
                <span className="text-lg font-bold text-slate-100">{filteredRestaurants.length} Places</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-3">
              <div className="p-3 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-medium text-slate-400 block">Avg Meal for 2</span>
                <span className="text-lg font-bold text-slate-100">₹{restaurantAnalytics.avgCost} INR</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-3">
              <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-medium text-slate-400 block">Online Delivery</span>
                <span className="text-lg font-bold text-slate-100">{restaurantAnalytics.deliveryCount} Available</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-3">
              <div className="p-3 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <ThumbsUp className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-medium text-slate-400 block">Top Voted Dining</span>
                <span className="text-sm font-bold text-slate-100 truncate max-w-[120px] block">
                  {restaurantAnalytics.topVoted ? restaurantAnalytics.topVoted.name : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Restaurant Filter Bar */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex flex-col md:flex-row gap-3">
              {/* Search bar */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search restaurant, locality, or cuisine (e.g. Biryani, Italian, Park Street, Colaba)..."
                  value={restaurantSearchTerm}
                  onChange={(e) => setRestaurantSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-700/80 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>

              {/* City Filter */}
              <div className="flex items-center gap-2 min-w-[180px]">
                <MapPin className="w-4 h-4 text-slate-400" />
                <select
                  value={selectedRestaurantCity}
                  onChange={(e) => setSelectedRestaurantCity(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-lg py-2 px-3 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 capitalize"
                >
                  {restaurantCities.map(c => (
                    <option key={c} value={c}>{c === 'All' ? 'All Cities' : c}</option>
                  ))}
                </select>
              </div>

              {/* Cuisine Filter */}
              <div className="min-w-[180px]">
                <select
                  value={selectedCuisine}
                  onChange={(e) => setSelectedCuisine(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-lg py-2 px-3 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  {uniqueCuisines.map(c => (
                    <option key={c} value={c}>{c === 'All' ? 'All Cuisines' : c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Price & Delivery Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-800 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300 font-medium">
                <input
                  type="checkbox"
                  checked={deliveryOnlyFilter}
                  onChange={(e) => setDeliveryOnlyFilter(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-700 text-cyan-500 focus:ring-cyan-500"
                />
                Online Delivery Available Only
              </label>

              <div className="flex items-center gap-3 flex-1 max-w-xs">
                <span className="text-slate-400 font-medium">Max Cost (for 2):</span>
                <input
                  type="range"
                  min={200}
                  max={6000}
                  step={200}
                  value={maxRestaurantCost}
                  onChange={(e) => setMaxRestaurantCost(Number(e.target.value))}
                  className="flex-1 accent-cyan-500 bg-slate-950 cursor-pointer"
                />
                <span className="font-bold text-cyan-300 min-w-[70px] text-right">
                  ₹{maxRestaurantCost.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Restaurants Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRestaurants.map((restaurant) => (
              <div
                key={restaurant.id}
                className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-cyan-500/50 transition-all duration-200 flex flex-col justify-between group"
              >
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 text-[10px] font-bold border border-amber-500/30 uppercase tracking-wider">
                          {restaurant.ratingText}
                        </span>
                        {restaurant.hasOnlineDelivery && (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold border border-emerald-500/20 flex items-center gap-1">
                            <Truck className="w-3 h-3" /> Delivery
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-white mt-1.5 group-hover:text-cyan-300 transition-colors">
                        {restaurant.name}
                      </h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-cyan-400" /> {restaurant.locality}, {restaurant.city}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="px-2 py-1 rounded-md bg-emerald-950 text-emerald-300 text-xs font-bold border border-emerald-500/30 inline-flex items-center gap-1">
                        <Star className="w-3 h-3 fill-emerald-400" /> {restaurant.rating}
                      </span>
                      <span className="block text-xs text-slate-400 mt-1 font-medium">
                        ₹{restaurant.costForTwoInr} for two
                      </span>
                    </div>
                  </div>

                  {/* Cuisine Pills */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {restaurant.cuisines.map((c, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] text-slate-300 font-medium"
                      >
                        {c}
                      </span>
                    ))}
                  </div>

                  <p className="text-[11px] text-slate-500 line-clamp-1 italic">
                    {restaurant.address}
                  </p>
                </div>

                {/* Footer Action */}
                <div className="p-3 bg-slate-950 border-t border-slate-800/80 flex items-center gap-2">
                  <button
                    onClick={() => setSelectedRestaurantModal(restaurant)}
                    className="flex-1 py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5 text-cyan-400" /> Specs & Reviews
                  </button>

                  {onSelectDestinationForTwin && (
                    <button
                      onClick={() => onSelectDestinationForTwin(restaurant.city)}
                      className="py-1.5 px-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-colors flex items-center gap-1"
                    >
                      Plan {restaurant.city} <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredRestaurants.length === 0 && (
            <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 space-y-3">
              <Utensils className="w-10 h-10 mx-auto text-slate-600" />
              <h3 className="text-lg font-bold text-slate-200">No Restaurants Match Search Criteria</h3>
              <p className="text-sm max-w-md mx-auto">
                Try expanding your price range or clearing search terms to explore options.
              </p>
              <button
                onClick={() => {
                  setRestaurantSearchTerm('');
                  setSelectedRestaurantCity('All');
                  setSelectedCuisine('All');
                  setDeliveryOnlyFilter(false);
                  setMaxRestaurantCost(5000);
                }}
                className="px-4 py-2 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-semibold text-xs hover:bg-cyan-500/30 transition-colors"
              >
                Reset Dining Filters
              </button>
            </div>
          )}
        </>
      )}

      {/* Restaurant Inspector Modal */}
      {selectedRestaurantModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setSelectedRestaurantModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              ✕
            </button>

            <div className="space-y-1">
              <span className="px-2.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold uppercase">
                {selectedRestaurantModal.ratingText} Dining
              </span>
              <h3 className="text-xl font-bold text-white pt-1">{selectedRestaurantModal.name}</h3>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" /> {selectedRestaurantModal.locality}, {selectedRestaurantModal.city}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-semibold">User Rating</span>
                <span className="text-base font-bold text-emerald-400 flex items-center gap-1">
                  <Star className="w-4 h-4 fill-emerald-400" /> {selectedRestaurantModal.rating} / 5.0
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">{selectedRestaurantModal.votes} User Votes</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-semibold">Cost For Two</span>
                <span className="text-base font-bold text-cyan-300">
                  ₹{selectedRestaurantModal.costForTwoInr.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Price Tier: {'₹'.repeat(selectedRestaurantModal.priceRange)}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">Cuisines Offered</h4>
              <div className="flex flex-wrap gap-1.5">
                {selectedRestaurantModal.cuisines.map((c, i) => (
                  <span key={i} className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-slate-200">
                    {c}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-1 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-300">
              <span className="text-[10px] text-slate-500 block uppercase font-semibold">Address & Location</span>
              <p className="leading-relaxed">{selectedRestaurantModal.address}</p>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => setSelectedRestaurantModal(null)}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-200 font-semibold text-xs hover:bg-slate-700 transition-colors"
              >
                Close Specs
              </button>
              {onSelectDestinationForTwin && (
                <button
                  onClick={() => {
                    const city = selectedRestaurantModal.city;
                    setSelectedRestaurantModal(null);
                    onSelectDestinationForTwin(city);
                  }}
                  className="flex-1 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition-colors"
                >
                  Plan {selectedRestaurantModal.city} Trip
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hotel Detail Inspector Modal */}
      {selectedHotelModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setSelectedHotelModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              ✕
            </button>

            <div className="space-y-1">
              <span className="px-2.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold uppercase">
                {selectedHotelModal.starCategory || 'Verified Accommodation'}
              </span>
              <h3 className="text-xl font-bold text-white pt-1">{selectedHotelModal.name}</h3>
              <p className="text-xs text-slate-400 capitalize flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" /> {selectedHotelModal.city}, India
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-semibold">Guest Rating</span>
                <span className="text-base font-bold text-emerald-400 flex items-center gap-1">
                  <Star className="w-4 h-4 fill-emerald-400" /> {selectedHotelModal.rating} / 5.0
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-semibold">Nightly Rate</span>
                <span className="text-base font-bold text-cyan-300">
                  ₹{selectedHotelModal.priceInr.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">Included Amenities</h4>
              <div className="flex flex-wrap gap-1.5">
                {selectedHotelModal.features.map((feat, i) => (
                  <span key={i} className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-slate-200">
                    {feat}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => setSelectedHotelModal(null)}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-200 font-semibold text-xs hover:bg-slate-700 transition-colors"
              >
                Close Specs
              </button>
              {onSelectDestinationForTwin && (
                <button
                  onClick={() => {
                    const city = selectedHotelModal.city;
                    setSelectedHotelModal(null);
                    onSelectDestinationForTwin(city);
                  }}
                  className="flex-1 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition-colors"
                >
                  Plan {selectedHotelModal.city} Trip
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Attraction Modal Inspector */}
      {selectedAttractionModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl space-y-0">
            <div className="relative h-56 bg-slate-950">
              <img
                src={getLocationImage(selectedAttractionModal.name)}
                alt={selectedAttractionModal.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/30 to-transparent" />
              <button
                onClick={() => setSelectedAttractionModal(null)}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-900/80 text-slate-300 hover:text-white border border-slate-700"
              >
                ✕
              </button>

              <div className="absolute bottom-3 left-4 right-4">
                <span className="px-2.5 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-bold uppercase tracking-wider">
                  {selectedAttractionModal.significance}
                </span>
                <h3 className="text-xl font-black text-white mt-1">
                  {selectedAttractionModal.name}
                </h3>
                <p className="text-xs text-slate-300 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  {selectedAttractionModal.city}, {selectedAttractionModal.state} ({selectedAttractionModal.zone} Zone)
                </p>
              </div>
            </div>

            <div className="p-5 space-y-4 text-xs text-slate-300">
              <div className="grid grid-cols-2 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-semibold">Google Rating</span>
                  <span className="text-base font-bold text-emerald-400 flex items-center gap-1">
                    <Star className="w-4 h-4 fill-emerald-400" /> {selectedAttractionModal.googleRating} / 5.0
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-semibold">Total Google Reviews</span>
                  <span className="text-base font-bold text-slate-200">
                    {selectedAttractionModal.reviewCountLakhs} Lakh Reviews
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-semibold">Entrance Fee (INR)</span>
                  <span className="text-sm font-bold text-cyan-400">
                    {selectedAttractionModal.entranceFeeInr === 0 ? 'Free Entry' : `₹${selectedAttractionModal.entranceFeeInr}`}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-semibold">Est. Visit Duration</span>
                  <span className="text-sm font-bold text-slate-200">
                    {selectedAttractionModal.durationHrs} Hours
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider text-slate-400">
                  Key Dataset Parameters
                </h4>
                <ul className="space-y-1.5 text-slate-300">
                  <li className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
                    <span className="text-slate-400">Establishment Year:</span>
                    <span className="font-semibold text-slate-200">{selectedAttractionModal.estYear}</span>
                  </li>
                  <li className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
                    <span className="text-slate-400">Nearest Airport (&lt;50km):</span>
                    <span className="font-semibold text-emerald-400">{selectedAttractionModal.hasAirport ? 'Yes (Airport Nearby)' : 'No (Longer Transit)'}</span>
                  </li>
                  <li className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
                    <span className="text-slate-400">DSLR Photography:</span>
                    <span className="font-semibold text-slate-200">{selectedAttractionModal.dslrAllowed ? 'Allowed' : 'Prohibited'}</span>
                  </li>
                  <li className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
                    <span className="text-slate-400">Weekly Closure:</span>
                    <span className="font-semibold text-amber-400">{selectedAttractionModal.weeklyOff}</span>
                  </li>
                  <li className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
                    <span className="text-slate-400">Recommended Visit Time:</span>
                    <span className="font-semibold text-cyan-300">{selectedAttractionModal.bestTime}</span>
                  </li>
                </ul>
              </div>

              {INDIAN_CITY_DETAILS[selectedAttractionModal.city] && (
                <div className="p-3 bg-cyan-950/40 border border-cyan-800/40 rounded-xl space-y-1">
                  <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider block">
                    City Profile: {selectedAttractionModal.city}
                  </span>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {INDIAN_CITY_DETAILS[selectedAttractionModal.city].description}
                  </p>
                </div>
              )}

              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => setSelectedAttractionModal(null)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors"
                >
                  Close
                </button>
                {onSelectDestinationForTwin && (
                  <button
                    onClick={() => {
                      const city = selectedAttractionModal.city;
                      setSelectedAttractionModal(null);
                      onSelectDestinationForTwin(city);
                    }}
                    className="flex-1 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors"
                  >
                    Simulate {selectedAttractionModal.city} Twin
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
