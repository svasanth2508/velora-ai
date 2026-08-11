import React, { useState, useEffect } from 'react';
import { TripTwin, LocationNode } from '../types';
import { InteractiveLeafletMap } from './InteractiveLeafletMap';
import {
  Navigation,
  Compass,
  Volume2,
  VolumeX,
  Car,
  Footprints,
  Bike,
  Train,
  Shield,
  Layers,
  MapPin,
  Search,
  Clock,
  Zap,
  Phone,
  AlertTriangle,
  Share2,
  Bookmark,
  Building,
  ParkingCircle,
  Eye,
  Camera,
  Sun,
  Fuel,
  BatteryCharging,
  Sliders,
  DollarSign,
  UserCheck,
  Check,
  ArrowRight,
  Download,
  CheckCircle2,
  Maximize2,
  ListPlus,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Flame,
  Radio,
  ExternalLink,
  Info
} from 'lucide-react';

interface NavigationSuiteProps {
  currentTwin: TripTwin;
  onNavigateToSimulator?: () => void;
}

// Mock POI database for business search
interface POI {
  id: string;
  name: string;
  category: 'restaurant' | 'hospital' | 'atm' | 'petrol' | 'ev' | 'hotel' | 'cafe';
  rating: number;
  reviewsCount: number;
  openHours: string;
  phone: string;
  address: string;
  distKm: number;
  isOpen: boolean;
  evPorts?: string;
  fuelPrices?: { petrol: string; diesel: string; cng: string };
  popularTimes: number[]; // 24 hours crowd %
  wheelchairAccessible: boolean;
  imageUrl: string;
}

const SAMPLE_POIS: POI[] = [
  {
    id: 'poi-1',
    name: 'Peshawri - ITC Mughal Fine Dining',
    category: 'restaurant',
    rating: 4.8,
    reviewsCount: 1420,
    openHours: '12:30 PM - 11:30 PM',
    phone: '+91 562 402 1111',
    address: 'Fatehabad Road, Tajganj, Agra',
    distKm: 1.2,
    isOpen: true,
    popularTimes: [5, 5, 5, 10, 20, 35, 60, 85, 95, 90, 75, 50, 30, 20, 15, 10, 10, 15, 45, 80, 90, 70, 30, 10],
    wheelchairAccessible: true,
    imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'poi-2',
    name: 'Agra City Multispecialty Hospital',
    category: 'hospital',
    rating: 4.6,
    reviewsCount: 380,
    openHours: '24 Hours Open',
    phone: '+91 562 222 5500',
    address: 'MG Road, Near District Court, Agra',
    distKm: 2.5,
    isOpen: true,
    popularTimes: [20, 15, 10, 10, 15, 30, 50, 70, 80, 85, 80, 75, 70, 65, 60, 60, 65, 70, 60, 50, 40, 30, 25, 20],
    wheelchairAccessible: true,
    imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'poi-3',
    name: 'Indian Oil SuperStation & EV Fast Charger',
    category: 'petrol',
    rating: 4.5,
    reviewsCount: 512,
    openHours: '24 Hours Open',
    phone: '+91 98370 12345',
    address: 'Taj East Gate Highway, Agra',
    distKm: 0.8,
    isOpen: true,
    evPorts: '2x 60kW CCS2 Fast Chargers Available',
    fuelPrices: { petrol: '₹94.72/L', diesel: '₹87.62/L', cng: '₹75.00/kg' },
    popularTimes: [10, 10, 10, 15, 25, 40, 70, 90, 85, 80, 75, 70, 70, 75, 80, 85, 90, 95, 85, 60, 40, 30, 20, 15],
    wheelchairAccessible: true,
    imageUrl: 'https://images.unsplash.com/photo-1527018601619-a508a2be00ed?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'poi-4',
    name: 'TATA Power EZ EV Fast Charging Station',
    category: 'ev',
    rating: 4.7,
    reviewsCount: 195,
    openHours: '24 Hours Open',
    phone: '1800 209 5120',
    address: 'Hotel Oberoi Amarvilas Parking, Agra',
    distKm: 0.6,
    isOpen: true,
    evPorts: '4x 120kW Ultra-Fast CCS2 Guns (3 Free)',
    popularTimes: [15, 10, 10, 10, 20, 30, 50, 60, 70, 80, 75, 70, 65, 70, 75, 80, 85, 90, 80, 60, 40, 30, 20, 15],
    wheelchairAccessible: true,
    imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&q=80',
  },
];

export const NavigationSuite: React.FC<NavigationSuiteProps> = ({ currentTwin, onNavigateToSimulator }) => {
  // Navigation Mode States
  const [navMode, setNavMode] = useState<'driving' | 'walking' | 'cycling' | 'transit' | 'wheelchair'>('driving');
  const [routeType, setRouteType] = useState<'fastest' | 'shortest' | 'toll-free' | 'eco'>('fastest');
  const [mapTheme, setMapTheme] = useState<'dark' | 'standard' | 'satellite'>('dark');
  const [voiceGuidance, setVoiceGuidance] = useState<boolean>(true);
  const [isNavigating, setIsNavigating] = useState<boolean>(false);
  const [navStepIndex, setNavStepIndex] = useState<number>(0);

  // Multi-stop stops
  const nodes = currentTwin?.itinerary?.[0]?.nodes || [];
  const [activeStopIndex, setActiveStopIndex] = useState<number>(0);
  const currentStop = nodes[activeStopIndex] || nodes[0] || { name: 'Taj Mahal', lat: 27.1751, lng: 78.0421 };

  // Street View Modal
  const [showStreetView, setShowStreetView] = useState<boolean>(false);
  const [streetViewHeading, setStreetViewHeading] = useState<number>(0);

  // AR Live View Modal
  const [showARView, setShowARView] = useState<boolean>(false);

  // Offline Maps Download
  const [offlineDownloaded, setOfflineDownloaded] = useState<boolean>(false);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  // Search POI state
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [poiSearchQuery, setPoiSearchQuery] = useState<string>('');
  const [selectedPoi, setSelectedPoi] = useState<POI | null>(SAMPLE_POIS[0]);

  // Indoor Maps state
  const [indoorFacility, setIndoorFacility] = useState<'delhi-t3' | 'agra-station' | 'express-mall'>('delhi-t3');
  const [indoorFloor, setIndoorFloor] = useState<string>('L1');

  // Saved Parking State
  const [savedParking, setSavedParking] = useState<{ lat: number; lng: number; spotNote: string; timestamp: string } | null>(
    null
  );
  const [parkingNoteInput, setParkingNoteInput] = useState<string>('P2 Gate 3 Taj East Gate');

  // Saved Places & Timeline History
  const [bookmarkedPlaces, setBookmarkedPlaces] = useState<string[]>(['Taj Mahal Sunrise Gate', 'Oberoi Amarvilas Bar']);
  const [timelineLog, setTimelineLog] = useState<Array<{ place: string; time: string; distance: string }>>([
    { place: 'Agra Fort Main Entrance', time: '08:15 AM', distance: '3.4 km' },
    { place: 'Mehtab Bagh River Bank', time: '11:40 AM', distance: '5.1 km' },
  ]);

  // Incident reporting form
  const [incidentType, setIncidentType] = useState<string>('traffic');
  const [incidentDesc, setIncidentDesc] = useState<string>('');
  const [reportedIncidents, setReportedIncidents] = useState<Array<{ type: string; desc: string; time: string }>>([
    { type: 'Road Closure', desc: 'Taj East Gate Road blocked for VIP movement', time: '10 mins ago' },
  ]);

  // Live Turn Guidance Steps
  const turnSteps = [
    { instruction: 'Head east on Taj East Gate Rd toward Shilpgram', dist: '150 m', lane: 'Keep Right [ ↑ ] [ ↗ ]' },
    { instruction: 'At the roundabout, take the 2nd exit onto Fatehabad Rd', dist: '400 m', lane: 'Middle Lane [ ↑ ]' },
    { instruction: 'Turn left near ITC Mughal Main Gate (Speed Trap Ahead - 50 km/h Limit)', dist: '1.2 km', lane: 'Left Lane [ ↖ ]' },
    { instruction: 'Arrive at Taj Mahal South Gate Parking Area', dist: '300 m', lane: 'Destination Ahead [ 🏁 ]' },
  ];

  // Voice Speech Announcement
  const announceVoice = (text: string) => {
    if (!voiceGuidance || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel(); // clear queue
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  // Toggle navigation simulation loop
  useEffect(() => {
    let interval: any = null;
    if (isNavigating) {
      announceVoice(`Starting turn by turn navigation to ${currentStop.name}. ${turnSteps[0].instruction}`);
      interval = setInterval(() => {
        setNavStepIndex((prev) => {
          const next = (prev + 1) % turnSteps.length;
          announceVoice(turnSteps[next].instruction);
          return next;
        });
      }, 7000);
    } else {
      setNavStepIndex(0);
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    }
    return () => clearInterval(interval);
  }, [isNavigating, currentStop.name]);

  // Handle Offline Download Simulation
  const handleStartDownload = () => {
    setIsDownloading(true);
    setDownloadProgress(10);
    const timer = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setIsDownloading(false);
          setOfflineDownloaded(true);
          return 100;
        }
        return prev + 22;
      });
    }, 400);
  };

  // Toggle Bookmark
  const toggleBookmark = (placeName: string) => {
    if (bookmarkedPlaces.includes(placeName)) {
      setBookmarkedPlaces(bookmarkedPlaces.filter((p) => p !== placeName));
    } else {
      setBookmarkedPlaces([...bookmarkedPlaces, placeName]);
    }
  };

  // Handle Save Parking
  const handleSaveParking = () => {
    setSavedParking({
      lat: currentStop.lat || 27.1751,
      lng: currentStop.lng || 78.0421,
      spotNote: parkingNoteInput || 'Saved Parking Location',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
  };

  // Handle Report Incident
  const handleAddIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!incidentDesc) return;
    setReportedIncidents([
      { type: incidentType, desc: incidentDesc, time: 'Just now' },
      ...reportedIncidents,
    ]);
    setIncidentDesc('');
  };

  return (
    <div id="navigation-suite" className="space-y-6">
      {/* Top Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3 z-10">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 via-teal-500 to-emerald-500 p-0.5 shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-cyan-400">
              <Navigation className="w-6 h-6 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-white tracking-tight">Turn-by-Turn GPS Navigation Suite</h1>
              <span className="px-2.5 py-0.5 text-[10px] font-extrabold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-full tracking-wider uppercase">
                AI Powered
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live traffic, voice-guided routes, 360° Street View, indoor floorplans & offline map pack.
            </p>
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex flex-wrap items-center gap-2 z-10">
          <button
            onClick={() => setVoiceGuidance(!voiceGuidance)}
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center space-x-1.5 ${
              voiceGuidance
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            {voiceGuidance ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            <span>Voice Guidance {voiceGuidance ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={() => setShowStreetView(true)}
            className="px-3 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-cyan-400 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all"
          >
            <Camera className="w-4 h-4" />
            <span>360° Street View</span>
          </button>

          <button
            onClick={() => setShowARView(true)}
            className="px-3 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-purple-600/20"
          >
            <Sparkles className="w-4 h-4" />
            <span>AR Live View</span>
          </button>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Route Planner & Live Navigation Bar (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Mode Selector & Route Preferences */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Compass className="w-4 h-4 text-emerald-400" />
              <span>Transport Mode & Route Options</span>
            </h3>

            {/* Travel Modes */}
            <div className="grid grid-cols-5 gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
              <button
                onClick={() => setNavMode('driving')}
                className={`py-2 rounded-lg text-xs font-bold flex flex-col items-center space-y-1 transition-all ${
                  navMode === 'driving' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Car className="w-4 h-4" />
                <span className="text-[10px]">Driving</span>
              </button>
              <button
                onClick={() => setNavMode('walking')}
                className={`py-2 rounded-lg text-xs font-bold flex flex-col items-center space-y-1 transition-all ${
                  navMode === 'walking' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Footprints className="w-4 h-4" />
                <span className="text-[10px]">Walking</span>
              </button>
              <button
                onClick={() => setNavMode('cycling')}
                className={`py-2 rounded-lg text-xs font-bold flex flex-col items-center space-y-1 transition-all ${
                  navMode === 'cycling' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Bike className="w-4 h-4" />
                <span className="text-[10px]">Cycling</span>
              </button>
              <button
                onClick={() => setNavMode('transit')}
                className={`py-2 rounded-lg text-xs font-bold flex flex-col items-center space-y-1 transition-all ${
                  navMode === 'transit' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Train className="w-4 h-4" />
                <span className="text-[10px]">Transit</span>
              </button>
              <button
                onClick={() => setNavMode('wheelchair')}
                className={`py-2 rounded-lg text-xs font-bold flex flex-col items-center space-y-1 transition-all ${
                  navMode === 'wheelchair' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                }`}
                title="Wheelchair Accessible Routes & Ramp Entrances"
              >
                <UserCheck className="w-4 h-4" />
                <span className="text-[10px]">Accessible</span>
              </button>
            </div>

            {/* Multiple Route Type Comparison Options */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => setRouteType('fastest')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  routeType === 'fastest'
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>🚀 Fastest Route</span>
                  <span className="text-white font-mono font-bold">38 min</span>
                </div>
                <span className="text-[10px] text-slate-500 block mt-0.5">Via Taj Expressway • High Speed</span>
              </button>

              <button
                onClick={() => setRouteType('shortest')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  routeType === 'shortest'
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>📏 Shortest Path</span>
                  <span className="text-white font-mono font-bold">12.1 km</span>
                </div>
                <span className="text-[10px] text-slate-500 block mt-0.5">Bypasses Highway • Local Streets</span>
              </button>

              <button
                onClick={() => setRouteType('toll-free')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  routeType === 'toll-free'
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>🪙 Toll-Free</span>
                  <span className="text-white font-mono font-bold">44 min</span>
                </div>
                <span className="text-[10px] text-slate-500 block mt-0.5">Saves ₹140 Tolls • Clear Service Rd</span>
              </button>

              <button
                onClick={() => setRouteType('eco')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  routeType === 'eco'
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>⛽ Fuel Efficient</span>
                  <span className="text-white font-mono font-bold">Save 0.6L</span>
                </div>
                <span className="text-[10px] text-slate-500 block mt-0.5">Smooth flow • Low acceleration stops</span>
              </button>
            </div>

            {/* Current Multi-Stop Destination & Turn-by-Turn Control */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Target Destination ({activeStopIndex + 1}/{nodes.length || 1})
                </span>
                <button
                  onClick={() => setActiveStopIndex((prev) => (prev + 1) % Math.max(nodes.length, 1))}
                  className="text-[11px] text-cyan-400 hover:underline flex items-center space-x-1"
                >
                  <span>Next Stop</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
                  📍
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-white">{currentStop.name}</h4>
                  <p className="text-xs text-slate-400 truncate">{(currentStop as any).description || 'Historic landmark in Agra, India'}</p>
                </div>
              </div>

              {/* Start Live Navigation Toggle */}
              <button
                onClick={() => setIsNavigating(!isNavigating)}
                className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-lg ${
                  isNavigating
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
                }`}
              >
                {isNavigating ? (
                  <>
                    <Pause className="w-4 h-4" />
                    <span>Stop Turn-by-Turn Navigation</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Start Voice & Live Guidance</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Turn-by-turn Guidance Card (Active HUD) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></div>
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Live Navigation HUD & Lane Assist
                </span>
              </div>
              <div className="bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-[10px] font-mono text-cyan-400">
                Live Speed: 68 km/h
              </div>
            </div>

            {/* Current Step Display */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-2">
              <div className="flex items-start justify-between">
                <span className="text-2xl font-bold text-emerald-400">
                  {turnSteps[navStepIndex].dist}
                </span>
                <span className="bg-slate-900 px-2 py-1 rounded border border-slate-700 text-[10px] font-mono text-amber-300">
                  {turnSteps[navStepIndex].lane}
                </span>
              </div>
              <p className="text-sm font-semibold text-white leading-snug">
                {turnSteps[navStepIndex].instruction}
              </p>
            </div>

            {/* Speed Limit & Radar Camera Warning */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full border-2 border-rose-500 text-rose-500 font-extrabold flex items-center justify-center text-xs">
                  50
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Speed Limit</span>
                  <span className="text-white font-bold">50 km/h</span>
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center space-x-2.5 text-amber-400">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Radar Alert</span>
                  <span className="text-amber-300 text-[11px] font-bold">Speed Trap in 400m</span>
                </div>
              </div>
            </div>
          </div>

          {/* Ride-Hailing Fare Estimator Bonus Feature */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <h3 className="text-xs font-bold text-slate-300 flex items-center space-x-2">
              <Car className="w-4 h-4 text-cyan-400" />
              <span>Ride-Hailing Live Fare Comparison</span>
            </h3>

            <div className="grid grid-cols-3 gap-2 text-xs font-mono">
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-500 block">Uber Premier</span>
                <span className="text-emerald-400 font-bold">₹240</span>
                <span className="text-[9px] text-slate-400 block">3 mins away</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-500 block">Ola Mini</span>
                <span className="text-emerald-400 font-bold">₹210</span>
                <span className="text-[9px] text-slate-400 block">5 mins away</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-500 block">Rapido Auto</span>
                <span className="text-emerald-400 font-bold">₹110</span>
                <span className="text-[9px] text-slate-400 block">2 mins away</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Interactive Map, Layers, Weather, POIs & Indoor (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Map Layer Controls & Tile Switcher */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-bold text-white">
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>Map Tile Engine & View Mode</span>
              </div>

              <div className="flex items-center space-x-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  onClick={() => setMapTheme('dark')}
                  className={`px-2.5 py-1 rounded-lg font-semibold ${
                    mapTheme === 'dark' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Dark Slate
                </button>
                <button
                  onClick={() => setMapTheme('standard')}
                  className={`px-2.5 py-1 rounded-lg font-semibold ${
                    mapTheme === 'standard' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Standard
                </button>
                <button
                  onClick={() => setMapTheme('satellite')}
                  className={`px-2.5 py-1 rounded-lg font-semibold ${
                    mapTheme === 'satellite' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Satellite View
                </button>
              </div>
            </div>

            {/* Interactive Leaflet Map */}
            <div className="relative">
              <InteractiveLeafletMap
                activeNodes={nodes.length > 0 ? nodes : [currentStop as LocationNode]}
                activeNodeIndex={activeStopIndex}
                initialDestination={currentTwin.destination || 'Jaipur'}
                onSelectNode={(idx) => setActiveStopIndex(idx)}
                onSelectNearbySpot={(spot) => console.log('Selected spot:', spot)}
                mapTileTheme={mapTheme === 'satellite' ? 'standard' : mapTheme}
              />

              {/* Traffic Overlay Banner on Map */}
              <div className="absolute top-3 left-3 z-[400] bg-slate-950/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-xs flex items-center space-x-2 text-white">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                <span className="font-bold">Live Traffic: Normal Flow</span>
                <span className="text-[10px] text-slate-400">| ETA: 38 mins</span>
              </div>
            </div>
          </div>

          {/* Offline Maps Downloader Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <Download className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Offline Maps Regional Pack</h3>
              </div>
              <p className="text-xs text-slate-400">
                Download Agra & Golden Triangle offline vector map (42 MB) for zero-connectivity navigation.
              </p>
            </div>

            {offlineDownloaded ? (
              <div className="flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-2 rounded-xl text-xs font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Map Cached Offline (42 MB)</span>
              </div>
            ) : isDownloading ? (
              <div className="w-48 space-y-1">
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>Downloading...</span>
                  <span>{downloadProgress}%</span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${downloadProgress}%` }}></div>
                </div>
              </div>
            ) : (
              <button
                onClick={handleStartDownload}
                className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-xl text-xs font-bold flex items-center space-x-2 shrink-0 transition-all"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Download Offline Map</span>
              </button>
            )}
          </div>

          {/* Business Search & Directory (Restaurants, Hospitals, ATMs, EV & Fuel) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Search className="w-4 h-4 text-cyan-400" />
                <span>Business Search & Nearby Amenities</span>
              </h3>

              {/* Category Pills */}
              <div className="flex items-center space-x-1.5 overflow-x-auto text-xs pb-1 sm:pb-0">
                {['all', 'restaurant', 'hospital', 'petrol', 'ev'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg font-bold capitalize transition-all ${
                      selectedCategory === cat
                        ? 'bg-cyan-500 text-slate-950'
                        : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* POI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {SAMPLE_POIS.filter((p) => selectedCategory === 'all' || p.category === selectedCategory).map((poi) => (
                <div
                  key={poi.id}
                  onClick={() => setSelectedPoi(poi)}
                  className={`bg-slate-950 border rounded-xl p-3 shadow-md space-y-2 cursor-pointer transition-all ${
                    selectedPoi?.id === poi.id ? 'border-cyan-500 ring-1 ring-cyan-500/30' : 'border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white leading-tight">{poi.name}</h4>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{poi.address}</span>
                    </div>
                    <span className="text-xs font-bold text-amber-400 shrink-0">★ {poi.rating}</span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-800/60 pt-2">
                    <span className="text-emerald-400 font-semibold">{poi.openHours}</span>
                    <span className="font-mono">{poi.distKm} km away</span>
                  </div>

                  {poi.fuelPrices && (
                    <div className="bg-slate-900 p-2 rounded-lg border border-slate-800 flex justify-around text-[10px] font-mono text-cyan-300">
                      <span>Petrol: {poi.fuelPrices.petrol}</span>
                      <span>Diesel: {poi.fuelPrices.diesel}</span>
                    </div>
                  )}

                  {poi.evPorts && (
                    <p className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 p-1.5 rounded border border-emerald-500/20">
                      🔌 {poi.evPorts}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Selected POI Popular Times Graph */}
            {selectedPoi && (
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Popular Times & Crowd Histogram ({selectedPoi.name})</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Live Estimate: ~45% Busy</span>
                </div>

                {/* Histogram Bars */}
                <div className="h-16 flex items-end justify-between gap-1 pt-2">
                  {selectedPoi.popularTimes.slice(8, 22).map((val, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                      <div
                        className="w-full bg-cyan-500/80 hover:bg-cyan-400 rounded-t transition-all"
                        style={{ height: `${val}%` }}
                        title={`${idx + 8}:00 - ${val}% busy`}
                      ></div>
                      <span className="text-[8px] font-mono text-slate-500">{idx + 8}h</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Indoor Maps & Parking Spot Saver Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Indoor Floorplans */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-white flex items-center space-x-2">
                  <Building className="w-4 h-4 text-emerald-400" />
                  <span>Indoor Facility Floorplan</span>
                </h3>
              </div>

              <select
                value={indoorFacility}
                onChange={(e: any) => setIndoorFacility(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-xl p-2 focus:outline-none focus:border-emerald-500"
              >
                <option value="delhi-t3">Delhi Airport Terminal 3</option>
                <option value="agra-station">Agra Cantt Railway Station</option>
                <option value="express-mall">Express Avenue Mall & Food Court</option>
              </select>

              <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                {['L1', 'L2', 'Gates / Platform', 'Food Court'].map((fl) => (
                  <button
                    key={fl}
                    onClick={() => setIndoorFloor(fl)}
                    className={`flex-1 py-1 rounded-lg font-bold text-[10px] ${
                      indoorFloor === fl ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {fl}
                  </button>
                ))}
              </div>

              <div className="h-28 bg-slate-950 rounded-xl border border-slate-800/80 flex flex-col items-center justify-center text-center p-3 text-xs text-slate-400 space-y-1">
                <MapPin className="w-5 h-5 text-emerald-400 animate-bounce" />
                <span className="font-bold text-white">Indoor Navigation Ready: {indoorFacility} ({indoorFloor})</span>
                <span className="text-[10px] text-slate-500">Security Gate 4 → Duty Free → Gate 18 (2 min walk)</span>
              </div>
            </div>

            {/* Parking Assistance */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-white flex items-center space-x-2">
                  <ParkingCircle className="w-4 h-4 text-cyan-400" />
                  <span>Parking Assistant & GPS Saver</span>
                </h3>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Easy Parking Area
                </span>
              </div>

              <div className="space-y-2">
                <input
                  type="text"
                  value={parkingNoteInput}
                  onChange={(e) => setParkingNoteInput(e.target.value)}
                  placeholder="Note parking spot details..."
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-xl p-2 focus:outline-none"
                />

                <button
                  onClick={handleSaveParking}
                  className="w-full py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-cyan-400 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Save Current Parking Spot</span>
                </button>

                {savedParking && (
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-cyan-500/30 text-[11px] text-slate-300 space-y-0.5">
                    <span className="font-bold text-cyan-400 block">Saved Parking: {savedParking.spotNote}</span>
                    <span className="text-[10px] text-slate-500 block">Saved at {savedParking.timestamp} • 45m remaining on meter</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Incident Reporting & Community Hazard Form */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <h3 className="text-xs font-bold text-white flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Community Live Incident & Hazard Reporting</span>
            </h3>

            <form onSubmit={handleAddIncident} className="flex flex-col sm:flex-row items-center gap-2">
              <select
                value={incidentType}
                onChange={(e) => setIncidentType(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-xs text-white rounded-xl p-2.5 focus:outline-none"
              >
                <option value="Accident">Accident</option>
                <option value="Police Speed Trap">Police Speed Trap</option>
                <option value="Road Closure">Road Closure</option>
                <option value="Heavy Traffic Jam">Heavy Traffic Jam</option>
              </select>

              <input
                type="text"
                value={incidentDesc}
                onChange={(e) => setIncidentDesc(e.target.value)}
                placeholder="Describe hazard or road condition..."
                className="flex-1 w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-xl p-2.5 focus:outline-none"
              />

              <button
                type="submit"
                className="w-full sm:w-auto px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all shrink-0"
              >
                Report Hazard
              </button>
            </form>

            {/* List of reported incidents */}
            <div className="space-y-1.5 pt-1">
              {reportedIncidents.map((inc, i) => (
                <div key={i} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 text-xs flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    <strong className="text-white">{inc.type}:</strong>
                    <span className="text-slate-300">{inc.desc}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">{inc.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 360° Street View Modal */}
      {showStreetView && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl space-y-4 p-6 relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Camera className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-bold text-white">360° Panoramic Street View</h3>
              </div>
              <button
                onClick={() => setShowStreetView(false)}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold"
              >
                Close View
              </button>
            </div>

            {/* Simulated Interactive 360 Panorama Canvas */}
            <div className="relative h-80 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center group">
              <img
                src={
                  (currentStop as any).imageUrl ||
                  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80'
                }
                alt="360 Street View"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90"
                style={{ transform: `scale(1.05) rotate(${streetViewHeading / 10}deg)` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>

              <div className="absolute top-3 left-3 bg-slate-950/80 px-3 py-1 rounded-xl text-xs text-white border border-slate-800">
                📍 {currentStop.name} • 360° View
              </div>

              {/* Panorama Controls */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center space-x-2 bg-slate-950/90 p-2 rounded-2xl border border-slate-800 backdrop-blur-md">
                <button
                  onClick={() => setStreetViewHeading((prev) => prev - 45)}
                  className="px-3 py-1 bg-slate-800 text-white text-xs font-bold rounded-xl"
                >
                  ↺ Pan Left
                </button>
                <span className="text-xs font-mono text-cyan-400">{streetViewHeading}°</span>
                <button
                  onClick={() => setStreetViewHeading((prev) => prev + 45)}
                  className="px-3 py-1 bg-slate-800 text-white text-xs font-bold rounded-xl"
                >
                  Pan Right ↻
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AR Live View Modal */}
      {showARView && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl space-y-4 p-6 relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-bold text-white">AR Live View Walking Navigation</h3>
              </div>
              <button
                onClick={() => setShowARView(false)}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold"
              >
                Close AR
              </button>
            </div>

            {/* AR Viewfinder Simulation */}
            <div className="relative h-80 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 flex flex-col items-center justify-center">
              <img
                src="https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=80"
                alt="AR Camera Feed"
                className="w-full h-full object-cover opacity-60"
              />

              {/* Floating AR Directional Arrow Overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3 pointer-events-none">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-300 flex items-center justify-center animate-bounce shadow-2xl shadow-emerald-500">
                  <ArrowRight className="w-8 h-8 -rotate-45" />
                </div>
                <div className="bg-slate-950/90 border border-emerald-500/50 text-white px-4 py-2 rounded-2xl text-xs font-bold shadow-xl backdrop-blur-md text-center">
                  <span>WALK 120m THEN TURN RIGHT TOWARD SOUTH GATE</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
