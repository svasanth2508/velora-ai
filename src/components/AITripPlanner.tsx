import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TripPlan, TravelStyle, TravelPace, UserProfile } from '../types';
import { fetchLocationImage, getInstantLocationImage } from '../services/locationImageService';
import {
  Zap,
  Sparkles,
  Calendar,
  MapPin,
  Loader2,
  ArrowRight,
  Navigation,
  Compass,
  Mic,
  MicOff,
  Check,
  DollarSign,
  Utensils,
  Search,
  Crosshair,
  Hotel,
  ShieldCheck,
  Sliders,
  Sun,
  Shield,
  Layers,
  Award,
  Flame,
  Globe,
  Heart,
  Briefcase,
  Users,
} from 'lucide-react';
import { CinematicHero, EditorialSection, VisualIndex } from './layout';

interface AITripPlannerProps {
  userProfile?: UserProfile;
  onTripGenerated: (newTrip: TripPlan) => void;
  onNavigateToManager: () => void;
}

const ORIGIN_PRESETS = [
  'New Delhi NCR',
  'Mumbai',
  'Bengaluru',
  'Chennai',
  'Kolkata',
  'Hyderabad',
  'Jaipur',
  'Pune',
];

const DESTINATION_PRESETS = [
  { name: 'Jaipur', state: 'Rajasthan', icon: '🏰', tag: 'Royal Forts' },
  { name: 'Munnar', state: 'Kerala', icon: '🌿', tag: 'Tea Hills' },
  { name: 'Goa', state: 'Goa', icon: '🏖️', tag: 'Beaches & Food' },
  { name: 'Ooty', state: 'Tamil Nadu', icon: '🌲', tag: 'Misty Valleys' },
  { name: 'Taj Mahal Agra', state: 'Uttar Pradesh', icon: '🕌', tag: 'World Wonder' },
  { name: 'Manali', state: 'Himachal Pradesh', icon: '🏔️', tag: 'Snow Peaks' },
  { name: 'Coorg', state: 'Karnataka', icon: '☕', tag: 'Coffee & Falls' },
  { name: 'Varanasi', state: 'Uttar Pradesh', icon: '🪔', tag: 'Sacred Ghats' },
  { name: 'Kochi', state: 'Kerala', icon: '⛵', tag: 'Coastal History' },
  { name: 'Udaipur', state: 'Rajasthan', icon: '👑', tag: 'City of Lakes' },
  { name: 'Darjeeling', state: 'West Bengal', icon: '🚂', tag: 'Toy Train & Tea' },
  { name: 'Rishikesh', state: 'Uttarakhand', icon: '🧘', tag: 'Yoga & Rafting' },
  { name: 'Pondicherry', state: 'Puducherry', icon: '🇫🇷', tag: 'French Colony' },
  { name: 'Kanyakumari', state: 'Tamil Nadu', icon: '🌅', tag: 'Triple Ocean' },
];

const BUDGET_PRESETS = [
  { label: 'Backpacker', inr: 10000, usd: 120, desc: 'Hostels, local thalis, buses' },
  { label: 'Balanced', inr: 25000, usd: 300, desc: '3★ Hotels, cabs, entry passes' },
  { label: 'Premium', inr: 50000, usd: 600, desc: '4★ Resorts, fine dining, private tours' },
  { label: 'Luxury', inr: 150000, usd: 1800, desc: 'Palace stays, private guide & SUV' },
];

const VIBE_STYLES = [
  { id: 'cultural', title: 'Royal Heritage', icon: '🏛️', desc: 'Forts, temples, museums & monuments' },
  { id: 'relaxed', title: 'Nature & Calm', icon: '🌿', desc: 'Hills, waterfalls, lakes & clean air' },
  { id: 'adventure', title: 'Thrill & Treks', icon: '⛰️', desc: 'Rafting, hiking, safaris & passes' },
  { id: 'balanced', title: 'Coastal & Beaches', icon: '🏖️', desc: 'Sunsets, shacks, seafood & cruises' },
  { id: 'fast-paced', title: 'Culinary Trail', icon: '🍲', desc: 'Local eats, thalis, street food & cafes' },
  { id: 'luxury', title: 'Spiritual & Serene', icon: '🪔', desc: 'Ashrams, evening aarti & quiet meditation' },
];

export const AITripPlanner: React.FC<AITripPlannerProps> = ({
  userProfile,
  onTripGenerated,
  onNavigateToManager,
}) => {
  const [originLocation, setOriginLocation] = useState<string>('New Delhi NCR');
  const [destination, setDestination] = useState<string>('Jaipur');
  const [detectingLocation, setDetectingLocation] = useState<boolean>(false);
  const [durationDays, setDurationDays] = useState<number>(3);
  const [totalBudgetUsd, setTotalBudgetUsd] = useState<number>(300);
  const [travelStyle, setTravelStyle] = useState<TravelStyle>('balanced');
  const [pace, setPace] = useState<TravelPace>('moderate');

  // Preview Image
  const [previewImage, setPreviewImage] = useState<string>(getInstantLocationImage('Jaipur'));

  // Autocomplete state
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState<any[]>([]);
  const [showAutocomplete, setShowAutocomplete] = useState<boolean>(false);

  // Voice speech state
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speechFeedback, setSpeechFeedback] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [generatedTrip, setGeneratedTrip] = useState<TripPlan | null>(null);

  // Update preview image when destination changes
  useEffect(() => {
    let isMounted = true;
    if (destination.trim()) {
      fetchLocationImage(destination).then((url) => {
        if (isMounted && url) setPreviewImage(url);
      });
    }
    return () => {
      isMounted = false;
    };
  }, [destination]);

  // Handle Autocomplete Search
  const handleDestinationChange = async (val: string) => {
    setDestination(val);
    if (val.trim().length >= 2) {
      try {
        const res = await fetch(`/api/places/autocomplete?q=${encodeURIComponent(val)}`);
        const data = await res.json();
        if (data && data.suggestions) {
          setAutocompleteSuggestions(data.suggestions);
          setShowAutocomplete(true);
        }
      } catch (err) {
        console.warn('Autocomplete fetch error:', err);
      }
    } else {
      setShowAutocomplete(false);
    }
  };

  // Detect GPS origin location
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(4);
        const lng = pos.coords.longitude.toFixed(4);
        setOriginLocation(`GPS Current Location (${lat}, ${lng})`);
        setDetectingLocation(false);
      },
      (err) => {
        console.warn('GPS location error:', err);
        setOriginLocation('New Delhi, India');
        setDetectingLocation(false);
      }
    );
  };

  // Web Speech Input
  const handleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice recognition is not supported in this browser.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;

      setIsListening(true);
      setSpeechFeedback('Listening... Speak destination city (e.g. "Munnar", "Goa", "Agra")');

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setDestination(transcript);
        setSpeechFeedback(`Voice set destination to: "${transcript}"`);
        setIsListening(false);
        handleDestinationChange(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
        setSpeechFeedback('Voice input error. Please type manually.');
      };

      recognition.start();
    } catch (err) {
      setIsListening(false);
      setSpeechFeedback('Microphone permission required.');
    }
  };

  // Submit AI Plan Generator
  const handleGenerateTripPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination.trim()) return;

    setIsLoading(true);
    setLoadingStep('Consulting Velora AI Destination Engine...');

    try {
      setTimeout(() => setLoadingStep('Optimizing routes, hotels, and ASI entrance fees in ₹ INR...'), 1000);
      setTimeout(() => setLoadingStep('Calculating budget allocations & crowd-avoidance windows...'), 2000);

      const response = await fetch('/api/simulate-trip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination,
          originLocation,
          durationDays,
          travelStyle,
          pace,
          totalBudgetUsd,
          dietary: userProfile?.dietary || ['Pure Veg'],
          interests: userProfile?.interests || ['Heritage', 'Nature'],
          privacyLevel: 'fuzzy-location',
        }),
      });

      const data = await response.json();

      const newTrip: TripPlan = {
        id: `trip-${Date.now()}`,
        title: `${destination} AI Journey Plan`,
        destination: destination,
        originLocation: originLocation,
        country: 'India',
        durationDays: durationDays,
        totalBudgetUsd: totalBudgetUsd,
        spentBudgetUsd: 0,
        travelStyle: travelStyle,
        pace: pace,
        privacyLevel: 'fuzzy-location',
        createdAt: new Date().toISOString(),
        itinerary: data.itinerary || [],
        securityBadges: data.securityBadges || ['ASI Ticket Verified', 'Route Optimized', '24x7 SOS Shield'],
        summary: data.summary || `Velora AI generated trip plan for ${destination}.`,
        highlights: data.highlights || [`Explore ${destination}`, 'ASI Heritage Sites', 'Local Cuisine'],
      };

      setGeneratedTrip(newTrip);
      onTripGenerated(newTrip);
    } catch (err) {
      console.error('Error generating trip plan:', err);
      alert('Connected fallback trip generator for ' + destination);
    } finally {
      setIsLoading(false);
    }
  };

  const currentBudgetInr = Math.round(totalBudgetUsd * 83.75);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Cinematic Hero Header */}
      <CinematicHero
        badge={{ label: 'Velora AI Interactive Planner', icon: Zap, variant: 'lime' }}
        subtitle="Real-time Route & Budget Simulation Engine"
        title="Design Your Tailored India Journey"
        description="Select starting point, destination, duration, and budget. Our AI calculates transit routes, ASI monument entry fees in ₹ INR, hotel recommendations, and crowd avoidance windows."
        backgroundImageUrl="https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1920&q=80"
        metrics={[
          { label: 'Origin', value: originLocation, icon: MapPin },
          { label: 'Destination', value: destination || 'Select', icon: Navigation },
          { label: 'Budget', value: `₹${currentBudgetInr.toLocaleString('en-IN')}`, icon: DollarSign },
        ]}
      />

      {/* Main Interactive Work Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleGenerateTripPlan} className="bg-slate-950/90 border border-slate-800/90 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-xl">
            
            {/* 1. STARTING POINT / ORIGIN */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-white uppercase tracking-wider flex items-center space-x-1.5">
                  <Navigation className="w-4 h-4 text-[#D8F864]" />
                  <span>1. Starting Point / Origin</span>
                </label>

                <button
                  type="button"
                  onClick={handleDetectGPS}
                  className="text-[11px] font-bold text-[#D8F864] hover:text-[#e4ff7a] flex items-center space-x-1 bg-[#D8F864]/10 px-2.5 py-1 rounded-full border border-[#D8F864]/30 transition-all hover:scale-105"
                >
                  <Crosshair className={`w-3.5 h-3.5 ${detectingLocation ? 'animate-spin' : ''}`} />
                  <span>{detectingLocation ? 'Locating GPS...' : 'Use Current GPS'}</span>
                </button>
              </div>

              {/* Interactive Origin Chips */}
              <div className="flex flex-wrap gap-1.5">
                {ORIGIN_PRESETS.map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => setOriginLocation(city)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      originLocation === city
                        ? 'bg-[#D8F864] text-slate-950 font-black shadow-md shadow-[#D8F864]/20 scale-105'
                        : 'bg-slate-900 text-slate-300 border border-slate-800 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    📍 {city}
                  </button>
                ))}
              </div>

              <div className="relative">
                <input
                  type="text"
                  required
                  value={originLocation}
                  onChange={(e) => setOriginLocation(e.target.value)}
                  placeholder="e.g. New Delhi, Mumbai, Bengaluru, Hyderabad..."
                  className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#D8F864] font-medium shadow-inner"
                />
              </div>
            </div>

            {/* 2. DESTINATION CITY */}
            <div className="space-y-3 pt-2 border-t border-slate-900">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-white uppercase tracking-wider flex items-center space-x-1.5">
                  <MapPin className="w-4 h-4 text-[#D8F864]" />
                  <span>2. Destination City / Spot</span>
                </label>

                <button
                  type="button"
                  onClick={handleVoiceInput}
                  className={`text-[11px] font-bold px-3 py-1 rounded-full border flex items-center space-x-1.5 transition-all ${
                    isListening
                      ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <Mic className="w-3.5 h-3.5 text-[#D8F864]" />
                  <span>{isListening ? 'Listening...' : 'Voice Search'}</span>
                </button>
              </div>

              {/* Interactive Destination Chips */}
              <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-1 custom-scrollbar">
                {DESTINATION_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => {
                      setDestination(preset.name);
                      setShowAutocomplete(false);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center space-x-1.5 ${
                      destination.toLowerCase() === preset.name.toLowerCase()
                        ? 'bg-[#D8F864] text-slate-950 font-black shadow-lg shadow-[#D8F864]/20 scale-105 ring-2 ring-[#D8F864]'
                        : 'bg-slate-900/80 text-slate-300 border border-slate-800 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <span>{preset.icon}</span>
                    <span>{preset.name}</span>
                    <span className="text-[9px] text-slate-400 opacity-70">({preset.state})</span>
                  </button>
                ))}
              </div>

              <div className="relative">
                <input
                  type="text"
                  required
                  value={destination}
                  onChange={(e) => handleDestinationChange(e.target.value)}
                  placeholder="e.g. Jaipur, Munnar, Goa, Taj Mahal Agra, Ooty, Manali..."
                  className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#D8F864] font-medium shadow-inner"
                />

                {speechFeedback && (
                  <p className="text-[11px] text-amber-400 mt-1 font-medium">{speechFeedback}</p>
                )}

                {/* Autocomplete Dropdown */}
                {showAutocomplete && autocompleteSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-50 mt-1.5 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-h-52 overflow-y-auto divide-y divide-slate-800/80">
                    {autocompleteSuggestions.map((sug, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          setDestination(sug.text);
                          setShowAutocomplete(false);
                        }}
                        className="p-3 hover:bg-slate-800 cursor-pointer text-xs transition-colors flex items-center justify-between"
                      >
                        <span className="font-bold text-white flex items-center space-x-2">
                          <MapPin className="w-3.5 h-3.5 text-[#D8F864] shrink-0" />
                          <span>{sug.text}</span>
                        </span>
                        <span className="text-[10px] text-slate-400">{sug.subText || 'India'}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 3. TRIP DURATION (DAYS) */}
            <div className="space-y-3 pt-2 border-t border-slate-900">
              <label className="text-xs font-black text-white uppercase tracking-wider flex items-center space-x-1.5">
                <Calendar className="w-4 h-4 text-[#D8F864]" />
                <span>3. Trip Duration (Days)</span>
              </label>

              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {[1, 2, 3, 4, 5, 7, 10, 14].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDurationDays(d)}
                    className={`py-2.5 rounded-xl text-xs font-extrabold transition-all text-center flex flex-col items-center justify-center ${
                      durationDays === d
                        ? 'bg-[#D8F864] text-slate-950 font-black shadow-lg shadow-[#D8F864]/20 scale-105 ring-2 ring-[#D8F864]'
                        : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    <span>{d}</span>
                    <span className="text-[9px] font-normal opacity-80">Day{d > 1 ? 's' : ''}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 4. BUDGET SELECTOR */}
            <div className="space-y-3 pt-2 border-t border-slate-900">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-white uppercase tracking-wider flex items-center space-x-1.5">
                  <span className="text-[#D8F864] font-black text-sm">₹</span>
                  <span>4. Total Budget Allocation</span>
                </label>
                <div className="text-[#D8F864] font-mono font-black text-base">
                  ₹{currentBudgetInr.toLocaleString('en-IN')}{' '}
                  <span className="text-[10px] text-slate-400 font-sans font-normal">
                    (~${totalBudgetUsd} USD)
                  </span>
                </div>
              </div>

              {/* Budget Preset Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {BUDGET_PRESETS.map((bp) => (
                  <button
                    key={bp.label}
                    type="button"
                    onClick={() => setTotalBudgetUsd(bp.usd)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      totalBudgetUsd === bp.usd
                        ? 'bg-[#D8F864]/20 border-[#D8F864] text-white font-bold ring-1 ring-[#D8F864]'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-300'
                    }`}
                  >
                    <span className="text-xs font-extrabold block text-[#D8F864]">
                      ₹{bp.inr.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-white block font-bold">{bp.label}</span>
                  </button>
                ))}
              </div>

              {/* Budget Slider */}
              <input
                type="range"
                min="100"
                max="3000"
                step="50"
                value={totalBudgetUsd}
                onChange={(e) => setTotalBudgetUsd(Number(e.target.value))}
                className="w-full accent-[#D8F864] cursor-pointer h-2 bg-slate-900 rounded-lg"
              />

              {/* Budget Breakdown Indicator */}
              <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-[10px] text-slate-400 font-mono uppercase block">Estimated Daily Allocation:</span>
                <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-mono">
                  <div className="bg-slate-950 p-1.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block">Hotels (40%)</span>
                    <span className="text-[#D8F864] font-bold">₹{Math.round((currentBudgetInr * 0.4) / durationDays).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="bg-slate-950 p-1.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block">Food (30%)</span>
                    <span className="text-[#D8F864] font-bold">₹{Math.round((currentBudgetInr * 0.3) / durationDays).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="bg-slate-950 p-1.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block">Cab/Transit (20%)</span>
                    <span className="text-[#D8F864] font-bold">₹{Math.round((currentBudgetInr * 0.2) / durationDays).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="bg-slate-950 p-1.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block">Monuments (10%)</span>
                    <span className="text-[#D8F864] font-bold">₹{Math.round((currentBudgetInr * 0.1) / durationDays).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 5. TRAVEL STYLE / VIBE */}
            <div className="space-y-3 pt-2 border-t border-slate-900">
              <label className="text-xs font-black text-white uppercase tracking-wider block">
                5. Travel Style & Vibe
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {VIBE_STYLES.map((style) => (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => setTravelStyle(style.id as TravelStyle)}
                    className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                      travelStyle === style.id
                        ? 'bg-[#D8F864]/20 border-[#D8F864] text-white shadow-lg ring-1 ring-[#D8F864]'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-base">{style.icon}</span>
                      <span className="text-xs font-bold text-white">{style.title}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 line-clamp-1">{style.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 6. PACE & SPEED */}
            <div className="space-y-3 pt-2 border-t border-slate-900">
              <label className="text-xs font-black text-white uppercase tracking-wider block">
                6. Daily Travel Pace
              </label>

              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: 'slow', label: '☕ Relaxed & Slow', desc: '2-3 spots/day, leisurely thalis' },
                  { id: 'moderate', label: '🌿 Moderate Pace', desc: '3-4 spots/day, balanced flow' },
                  { id: 'intense', label: '⚡ Fast-Paced', desc: '5+ spots/day, max coverage' },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPace(p.id as TravelPace)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      pace === p.id
                        ? 'bg-[#D8F864]/20 border-[#D8F864] text-white shadow-lg ring-1 ring-[#D8F864] font-bold'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    <span className="text-xs font-bold block text-white">{p.label}</span>
                    <span className="text-[9px] text-slate-400 block mt-0.5">{p.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-[#D8F864] hover:bg-[#cbf046] text-slate-950 font-black text-sm rounded-2xl shadow-2xl shadow-[#D8F864]/25 transition-all flex items-center justify-center space-x-2.5 active:scale-98 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-slate-950" />
                  <span>{loadingStep || 'Generating Itinerary...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Generate Custom Itinerary for {destination}</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Live Preview Canvas (5 Cols) */}
        <div className="lg:col-span-5 space-y-6 sticky top-24">
          <div className="bg-slate-950/90 border border-slate-800/90 rounded-3xl p-6 space-y-5 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Compass className="w-5 h-5 text-[#D8F864] animate-spin" style={{ animationDuration: '10s' }} />
                <span className="text-xs font-black text-white uppercase tracking-wider">
                  Live Journey Blueprint
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#D8F864]/20 text-[#D8F864] border border-[#D8F864]/30 uppercase">
                Auto Sync
              </span>
            </div>

            {/* Destination Preview Thumbnail */}
            <div className="relative h-48 w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-800">
              {previewImage && previewImage.trim() ? (
                <img
                  src={previewImage}
                  alt={destination}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-all duration-700"
                />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
              
              <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-xl border border-slate-700/60 text-xs font-bold text-white flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-[#D8F864]" />
                <span>{destination}</span>
              </div>

              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-300 block font-mono">From {originLocation}</span>
                  <span className="text-lg font-black text-white">{durationDays} Days Tour</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-300 block font-mono">Total Est. Budget</span>
                  <span className="text-base font-black text-[#D8F864] font-mono">
                    ₹{currentBudgetInr.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Blueprint Key Highlights */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-mono font-bold">TRAVEL STYLE</span>
                <span className="font-extrabold text-white capitalize">{travelStyle}</span>
              </div>
              <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-mono font-bold">PACING</span>
                <span className="font-extrabold text-[#D8F864] capitalize">{pace}</span>
              </div>
            </div>

            {/* Security & Route Badges */}
            <div className="space-y-2">
              <span className="text-[10px] text-slate-400 font-mono uppercase block font-bold">Velora Engine Security Badges:</span>
              <div className="flex flex-wrap gap-1.5">
                {['ASI Monument Verified', 'Route & Transit Optimized', 'Live Weather Protected', '24x7 Emergency SOS'].map((badge, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[10px] text-slate-300 flex items-center space-x-1 font-semibold">
                    <ShieldCheck className="w-3 h-3 text-[#D8F864]" />
                    <span>{badge}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Generated Trip Quick Action */}
            {generatedTrip ? (
              <div className="p-4 bg-[#D8F864]/10 border border-[#D8F864]/40 rounded-2xl space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-[#D8F864]">🎉 Trip Ready!</span>
                  <span className="text-[10px] text-slate-300">{generatedTrip.itinerary?.length || durationDays} Days Created</span>
                </div>
                <button
                  onClick={onNavigateToManager}
                  className="w-full py-3 bg-[#D8F864] hover:bg-[#cbf046] text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2"
                >
                  <span>Open in Smart Trip Manager</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 text-center leading-relaxed italic">
                Adjust parameters on the left. Click "Generate Custom Itinerary" to compute routes, entry tickets, and hotel bookings.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
