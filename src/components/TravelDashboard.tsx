import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Compass,
  Zap,
  Globe,
  Bookmark,
  MapPin,
  Calendar,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Award,
  Sun,
  Wind,
  Clock,
  PhoneCall,
  Download,
  Share2,
  Trash2,
  CheckCircle2,
  Layers,
  Search,
  Luggage,
  ShieldCheck,
  RefreshCw,
  Navigation,
  DollarSign,
  Droplets,
  Activity,
  User as UserIcon,
  ChevronRight,
  Plus
} from 'lucide-react';
import { TripPlan, UserProfile } from '../types';
import { NavTabType } from './Navbar';
import { AuthenticImage } from './AuthenticImage';
import { exportTripToPDF } from '../utils/pdfExportGenerator';
import { RealtimeStatsData, fetchRealWeatherAndAQI, fetchCityFromCoordinates, fetchCityFromIP } from '../services/realtimeStatsService';

interface TravelDashboardProps {
  currentTrip: TripPlan;
  savedTrips: TripPlan[];
  userProfile: UserProfile;
  onSelectTrip: (trip: TripPlan) => void;
  onDeleteTrip: (id: string) => void;
  onNavigateTab: (tab: NavTabType) => void;
}

export const TravelDashboard: React.FC<TravelDashboardProps> = ({
  currentTrip,
  savedTrips,
  userProfile,
  onSelectTrip,
  onDeleteTrip,
  onNavigateTab
}) => {
  // Live Weather & Location State for Dashboard
  const [dashboardWeather, setDashboardWeather] = useState<{
    city: string;
    tempC: number;
    weatherCondition: string;
    aqi: number;
    aqiLabel: string;
    humidityPct: number;
    windSpeedKmh: number;
    loading: boolean;
  }>({
    city: currentTrip?.destination || 'New Delhi',
    tempC: 28,
    weatherCondition: 'Mainly Clear 🌤️',
    aqi: 45,
    aqiLabel: 'Good (Clean Air)',
    humidityPct: 60,
    windSpeedKmh: 12,
    loading: false
  });

  // Time of Day Greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Detect Live Location for Weather Card in Dashboard
  const handleDetectLiveLocation = async () => {
    setDashboardWeather((prev) => ({ ...prev, loading: true }));
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          const cityInfo = await fetchCityFromCoordinates(latitude, longitude);
          const weather = await fetchRealWeatherAndAQI(latitude, longitude);
          setDashboardWeather({
            city: cityInfo.city,
            tempC: weather.tempC,
            weatherCondition: weather.weatherCondition,
            aqi: weather.aqi,
            aqiLabel: weather.aqiLabel,
            humidityPct: weather.humidityPct,
            windSpeedKmh: weather.windSpeedKmh,
            loading: false
          });
        },
        async () => {
          const ipLoc = await fetchCityFromIP();
          const weather = await fetchRealWeatherAndAQI(ipLoc.lat, ipLoc.lng);
          setDashboardWeather({
            city: ipLoc.city,
            tempC: weather.tempC,
            weatherCondition: weather.weatherCondition,
            aqi: weather.aqi,
            aqiLabel: weather.aqiLabel,
            humidityPct: weather.humidityPct,
            windSpeedKmh: weather.windSpeedKmh,
            loading: false
          });
        },
        { timeout: 7000 }
      );
    } else {
      setDashboardWeather((prev) => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    handleDetectLiveLocation();
  }, []);

  const featuredStates = [
    { name: 'Rajasthan', Capital: 'Jaipur', category: 'Heritage & Palaces', image: 'Jaipur Hawa Mahal' },
    { name: 'Kerala', Capital: 'Thiruvananthapuram', category: 'Backwaters & Wellness', image: 'Kerala backwaters houseboat' },
    { name: 'Goa', Capital: 'Panaji', category: 'Coastal & Nightlife', image: 'Goa beach sunset' },
    { name: 'Uttar Pradesh', Capital: 'Lucknow', category: 'Spiritual & Heritage', image: 'Taj Mahal Agra' },
    { name: 'Ladakh', Capital: 'Leh', category: 'Himalayan Pass & Glaciers', image: 'Pangong lake Ladakh' }
  ];

  return (
    <div id="velora-dashboard-root" className="space-y-6 pb-12">
      {/* 1. HERO WELCOME DASHBOARD COMMAND BANNER */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-[32px] overflow-hidden bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 text-white p-6 sm:p-8 border border-slate-800 shadow-2xl"
      >
        {/* Background Ambient Glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D8F864]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Welcome Text Left */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#D8F864]/10 border border-[#D8F864]/30 text-[#D8F864] text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Velora Command Center • AI Twin Active</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              {getGreeting()}, {userProfile.name || 'Traveller'}!
            </h1>

            <p className="text-sm text-slate-300 font-medium leading-relaxed max-w-xl">
              Your AI travel twin is ready. Currently managing <strong className="text-white">{savedTrips.length} saved trip twins</strong>, exploring <strong className="text-[#D8F864]">28 States & 8 Union Territories</strong> with offline route caching.
            </p>

            {/* Quick Stat Badges Row */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <div className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-200 font-bold flex items-center space-x-1.5">
                <Bookmark className="w-3.5 h-3.5 text-[#D8F864]" />
                <span>{savedTrips.length} Saved Trips</span>
              </div>

              <div className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-200 font-bold flex items-center space-x-1.5">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span>Active: {currentTrip?.destination || 'Agra'}</span>
              </div>

              <div className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-200 font-bold flex items-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Offline Maps Cached</span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons Right */}
          <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col gap-3 justify-center">
            <button
              onClick={() => onNavigateTab('engine')}
              className="w-full bg-[#D8F864] hover:bg-[#cbe352] text-slate-950 font-black py-3.5 px-5 rounded-2xl text-xs flex items-center justify-center space-x-2.5 shadow-xl transition-all cursor-pointer group"
            >
              <Zap className="w-4 h-4 fill-slate-950 group-hover:rotate-12 transition-transform" />
              <span>Generate New AI Trip Twin</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigateTab('simulator')}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3.5 px-5 rounded-2xl text-xs flex items-center justify-center space-x-2 border border-slate-700 transition-all cursor-pointer"
            >
              <Compass className="w-4 h-4 text-cyan-400" />
              <span>Launch Route Simulator</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* 2. ACTIVE ITINERARY FEATURED CARD & LIVE WEATHER PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 7 Cols: Active Itinerary Highlight */}
        <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <h2 className="text-base font-black text-slate-900 uppercase tracking-wide flex items-center space-x-2">
                <span>Active Trip Twin:</span>
                <span className="text-cyan-700">{currentTrip?.destination}</span>
              </h2>
            </div>
            <span className="text-[10px] uppercase font-extrabold px-2.5 py-1 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200">
              {currentTrip?.durationDays || 3} Days • {currentTrip?.travelStyle || 'Cultural'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
            {/* Authentic Destination Image */}
            <div className="sm:col-span-5 h-44 rounded-2xl overflow-hidden relative bg-slate-100 border border-slate-200">
              <AuthenticImage
                locationName={currentTrip?.destination || 'Taj Mahal Agra'}
                altText={currentTrip?.destination}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
              <div className="absolute bottom-2 left-3 right-3 text-white">
                <p className="text-xs font-black truncate">{currentTrip?.destination}</p>
                <p className="text-[10px] text-slate-300 font-medium">Estimated Budget: ₹{Math.round((currentTrip?.totalBudgetUsd || 180) * 83.75).toLocaleString()}</p>
              </div>
            </div>

            {/* Trip Details & Quick Tools */}
            <div className="sm:col-span-7 space-y-3">
              <div className="space-y-1">
                <p className="text-xs text-slate-600 font-medium line-clamp-2">
                  {currentTrip?.summary || 'Explore iconic monuments, authentic culinary hotspots, and curated daily itineraries with real-time route optimization.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-slate-700">
                <div className="p-2 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center space-x-2">
                  <Calendar className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                  <span>{currentTrip?.itinerary?.length || 3} Daily Phases</span>
                </div>

                <div className="p-2 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center space-x-2">
                  <TrendingUp className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>₹{Math.round((currentTrip?.totalBudgetUsd || 180) * 83.75).toLocaleString()} Budget</span>
                </div>
              </div>

              {/* PDF Export & View Buttons */}
              <div className="flex items-center space-x-2 pt-1">
                <button
                  onClick={() => onNavigateTab('simulator')}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
                >
                  <Compass className="w-3.5 h-3.5 text-[#D8F864]" />
                  <span>Explore Route</span>
                </button>

                <button
                  onClick={() => exportTripToPDF(currentTrip)}
                  className="px-3 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-xl text-xs border border-emerald-200 flex items-center space-x-1 transition-all cursor-pointer"
                  title="Download Itinerary PDF"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Live Weather & AQI Intelligence Panel */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-slate-950 text-white border border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Sun className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-black text-white uppercase tracking-wider">Live Environmental Weather</h2>
            </div>
            <button
              onClick={handleDetectLiveLocation}
              disabled={dashboardWeather.loading}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 transition-all cursor-pointer"
              title="Detect live position weather"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${dashboardWeather.loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 font-medium flex items-center space-x-1">
                  <MapPin className="w-3 h-3 text-cyan-400" />
                  <span>{dashboardWeather.city}</span>
                </span>
                <span className="text-3xl font-black text-white">{dashboardWeather.tempC}°C</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-amber-300 block">{dashboardWeather.weatherCondition}</span>
                <span className="text-[10px] text-emerald-400 font-mono font-bold">AQI {dashboardWeather.aqi} ({dashboardWeather.aqiLabel})</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800">
              <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800 flex justify-between">
                <span className="text-slate-400">Humidity:</span>
                <span className="font-bold text-cyan-300">{dashboardWeather.humidityPct}%</span>
              </div>
              <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800 flex justify-between">
                <span className="text-slate-400">Wind:</span>
                <span className="font-bold text-emerald-300">{dashboardWeather.windSpeedKmh} km/h</span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
            🌤️ Live Open-Meteo climate sync active. Updated in real-time for ideal outdoor excursions.
          </p>
        </div>
      </div>

      {/* 3. AI SUPER TOOLS QUICK LAUNCHERS GRID */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <Zap className="w-4 h-4 text-cyan-600" />
            <span>AI Super Tools & Travel Hubs</span>
          </h2>
          <span className="text-xs text-slate-500 font-semibold">6 Integrated Engines</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { id: 'engine', title: 'AI Planner', desc: 'Gemini Itineraries', icon: Zap, color: 'bg-amber-500/10 text-amber-600 border-amber-200' },
            { id: 'simulator', title: 'Simulator', desc: 'Interactive Maps', icon: Compass, color: 'bg-cyan-500/10 text-cyan-600 border-cyan-200' },
            { id: 'translator', title: 'Translator', desc: '12 Languages', icon: Globe, color: 'bg-indigo-500/10 text-indigo-600 border-indigo-200' },
            { id: 'states', title: 'State Atlas', desc: '28 States & 8 UTs', icon: MapPin, color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200' },
            { id: 'emergency', title: '24/7 SOS', desc: 'Emergency Hub', icon: PhoneCall, color: 'bg-rose-500/10 text-rose-600 border-rose-200' },
            { id: 'copilot', title: '✦ Copilot', desc: 'AI Voice & Chat', icon: Sparkles, color: 'bg-purple-500/10 text-purple-600 border-purple-200' },
          ].map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.id}
                onClick={() => onNavigateTab(tool.id as NavTabType)}
                className="bg-white hover:bg-slate-50 border border-slate-200/90 hover:border-slate-300 p-4 rounded-2xl shadow-sm text-left transition-all hover:-translate-y-0.5 cursor-pointer group space-y-2"
              >
                <div className={`p-2.5 rounded-xl w-fit border ${tool.color} group-hover:scale-110 transition-transform`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-900 group-hover:text-cyan-700 transition-colors">{tool.title}</h3>
                  <p className="text-[10px] text-slate-500 font-medium">{tool.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. SAVED TRIP TWINS COLLECTION GRID */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <Bookmark className="w-4 h-4 text-cyan-600" />
            <span>Saved Trip Twins ({savedTrips.length})</span>
          </h2>

          <button
            onClick={() => onNavigateTab('saved')}
            className="text-xs font-bold text-cyan-700 hover:text-cyan-800 flex items-center space-x-1"
          >
            <span>View All Saved</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {savedTrips.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-3">
            <Luggage className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-xs text-slate-600 font-medium">No saved trips yet. Generate your first itinerary with Velora AI!</p>
            <button
              onClick={() => onNavigateTab('engine')}
              className="px-4 py-2 bg-[#D8F864] text-slate-950 font-black text-xs rounded-xl hover:bg-[#cbe352] transition-all"
            >
              Plan First Trip
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedTrips.map((trip) => {
              const isSelected = currentTrip?.id === trip.id;
              return (
                <div
                  key={trip.id}
                  className={`bg-white rounded-2xl border p-4 shadow-sm hover:shadow-md transition-all space-y-3 flex flex-col justify-between ${
                    isSelected ? 'border-cyan-500 ring-2 ring-cyan-500/20' : 'border-slate-200/90'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900 truncate">{trip.destination}</span>
                      {isSelected && (
                        <span className="px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 text-[10px] font-extrabold">
                          Active
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-500 line-clamp-2 font-medium">
                      {trip.summary || `${trip.durationDays} days travel plan in ${trip.destination}`}
                    </p>

                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-600 pt-1">
                      <span>{trip.durationDays} Days</span>
                      <span>₹{Math.round((trip.totalBudgetUsd || 150) * 83.75).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <button
                      onClick={() => onSelectTrip(trip)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-50 text-cyan-700 border border-cyan-200'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                      }`}
                    >
                      {isSelected ? 'Selected' : 'Set Active'}
                    </button>

                    <button
                      onClick={() => onDeleteTrip(trip.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-all cursor-pointer"
                      title="Delete trip"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. TRENDING REGIONAL ATLAS HIGHLIGHTS */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <Globe className="w-4 h-4 text-cyan-600" />
            <span>Trending Indian States Atlas</span>
          </h2>
          <button
            onClick={() => onNavigateTab('states')}
            className="text-xs font-bold text-cyan-700 hover:text-cyan-800 flex items-center space-x-1"
          >
            <span>Explore 28 States & 8 UTs</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {featuredStates.map((st) => (
            <div
              key={st.name}
              onClick={() => onNavigateTab('states')}
              className="bg-white border border-slate-200 rounded-2xl p-3 shadow-sm hover:shadow-md transition-all cursor-pointer group space-y-2"
            >
              <div className="h-24 rounded-xl overflow-hidden relative bg-slate-100">
                <AuthenticImage
                  locationName={st.image}
                  altText={st.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                <span className="absolute bottom-1.5 left-2 text-[10px] font-black text-white">{st.name}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-semibold block">{st.category}</span>
                <span className="text-[11px] font-extrabold text-slate-900 group-hover:text-cyan-700 transition-colors">
                  Capital: {st.Capital}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
