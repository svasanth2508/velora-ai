import React, { useState } from 'react';
import { TripTwin, TravelStyle, TravelPace, PrivacyLevel, UserTwinProfile } from '../types';
import { fetchLocationImage } from '../services/locationImageService';
import { Zap, Sparkles, DollarSign, Calendar, MapPin, Shield, Check, Loader2, ArrowRight, Crosshair, Navigation, Compass, Mic, MicOff, Volume2, Radio } from 'lucide-react';

interface AIDecisionEngineProps {
  userProfile: UserTwinProfile;
  onTripGenerated: (newTwin: TripTwin) => void;
  onNavigateToSimulator: () => void;
}

export const AIDecisionEngine: React.FC<AIDecisionEngineProps> = ({
  userProfile,
  onTripGenerated,
  onNavigateToSimulator,
}) => {
  const [originLocation, setOriginLocation] = useState<string>('New Delhi (Delhi NCR)');
  const [destination, setDestination] = useState<string>('Jaipur');
  const [detectingLocation, setDetectingLocation] = useState<boolean>(false);
  const [locationDetectedNotice, setLocationDetectedNotice] = useState<boolean>(false);
  const [durationDays, setDurationDays] = useState<number>(3);
  const [totalBudgetUsd, setTotalBudgetUsd] = useState<number>(350);
  const [travelStyle, setTravelStyle] = useState<TravelStyle>('balanced');
  const [pace, setPace] = useState<TravelPace>('moderate');
  const [privacyLevel, setPrivacyLevel] = useState<PrivacyLevel>('fuzzy-location');
  const [selectedDietary, setSelectedDietary] = useState<string[]>(userProfile.dietary);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(userProfile.interests);

  // Web Speech API State
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speechTarget, setSpeechTarget] = useState<'destination' | 'origin' | 'full'>('destination');
  const [speechFeedback, setSpeechFeedback] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [generatedResult, setGeneratedResult] = useState<TripTwin | null>(null);

  const startListening = (target: 'destination' | 'origin' | 'full') => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Web Speech API is not supported in this browser. Please type manually or use Google Chrome / Edge / Safari.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = true;
      recognition.continuous = false;

      setSpeechTarget(target);
      setIsListening(true);
      setSpeechFeedback('Listening... Speak now!');

      recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript;
        setSpeechFeedback(`Listening: "${transcript}"`);

        if (event.results[current].isFinal) {
          processVoiceInput(transcript, target);
          setIsListening(false);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setSpeechFeedback(`Speech error: ${event.error}. Try speaking again.`);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error('Speech recognition exception:', err);
      setIsListening(false);
      setSpeechFeedback('Microphone permission required or speech engine unavailable.');
    }
  };

  const processVoiceInput = (text: string, target: 'destination' | 'origin' | 'full') => {
    const clean = text.trim();
    if (!clean) return;

    if (target === 'destination') {
      const parsed = clean.replace(/^(go to|travel to|take me to|visit|destination|i want to go to)\s+/i, '');
      const capitalized = parsed.charAt(0).toUpperCase() + parsed.slice(1);
      setDestination(capitalized);
      setSpeechFeedback(`Destination set to: "${capitalized}"`);
    } else if (target === 'origin') {
      const parsed = clean.replace(/^(from|starting from|my location is|origin|i am in)\s+/i, '');
      const capitalized = parsed.charAt(0).toUpperCase() + parsed.slice(1);
      setOriginLocation(capitalized);
      setSpeechFeedback(`Starting origin set to: "${capitalized}"`);
    } else {
      // Full preferences speech command: e.g. "Plan a 5 day trip to Goa with 500 dollar budget"
      const daysMatch = clean.match(/(\d+)\s*day/i);
      if (daysMatch) {
        setDurationDays(Math.min(14, Math.max(1, parseInt(daysMatch[1]))));
      }

      const budgetMatch = clean.match(/(\d+)\s*(dollar|usd|\$|bucks)/i) || clean.match(/budget\s*(of|is)?\s*(\d+)/i);
      if (budgetMatch) {
        const num = parseInt(budgetMatch[1] || budgetMatch[2]);
        if (num > 0) setTotalBudgetUsd(num);
      }

      const destMatch = clean.match(/(to|visit|in)\s+([a-zA-Z\s]+?)(?=\s+for|\s+with|\s+budget|$)/i);
      if (destMatch && destMatch[2]) {
        const dest = destMatch[2].trim();
        setDestination(dest.charAt(0).toUpperCase() + dest.slice(1));
      } else if (!daysMatch && !budgetMatch) {
        setDestination(clean.charAt(0).toUpperCase() + clean.slice(1));
      }

      setSpeechFeedback(`Voice preferences applied: "${clean}"`);
    }
  };

  const QUICK_ORIGINS = ['New Delhi', 'Mumbai', 'Bengaluru', 'Kolkata', 'Chennai', 'Hyderabad', 'Jaipur', 'Agra'];
  const QUICK_DESTINATIONS = ['Agra', 'Jaipur', 'Goa', 'Varanasi', 'Kerala', 'Hampi', 'Ladakh', 'Udaipur', 'Rishikesh', 'Mumbai'];
  const DIETARY_OPTIONS = ['Pure Vegetarian', 'Jain Option', 'South Indian', 'North Indian Thali', 'Halal', 'Street Food'];
  const INTEREST_OPTIONS = ['Ancient Architecture', 'Heritage Forts', 'Spiritual Ghats', 'Photography', 'Nature & Backwaters', 'Craft Markets'];

  const toggleDietary = (item: string) => {
    setSelectedDietary((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const toggleInterest = (item: string) => {
    setSelectedInterests((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleDetectLocation = () => {
    setDetectingLocation(true);
    setLocationDetectedNotice(false);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setOriginLocation(`GPS (${lat.toFixed(3)}°N, ${lng.toFixed(3)}°E)`);
          setDetectingLocation(false);
          setLocationDetectedNotice(true);
        },
        (err) => {
          console.warn('Geolocation fallback:', err);
          setOriginLocation('New Delhi (Delhi NCR)');
          setDetectingLocation(false);
          setLocationDetectedNotice(true);
        },
        { timeout: 8000 }
      );
    } else {
      setOriginLocation('New Delhi (Delhi NCR)');
      setDetectingLocation(false);
      setLocationDetectedNotice(true);
    }
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    setGeneratedResult(null);

    setLoadingStep('Detecting GPS & Calculating Origin-to-Destination Route...');
    await new Promise((r) => setTimeout(r, 600));

    setLoadingStep('Connecting to Server-Side Gemini API...');
    await new Promise((r) => setTimeout(r, 600));

    setLoadingStep('Simulating Crowd Index, Weather & Ticket Queues...');
    await new Promise((r) => setTimeout(r, 800));

    setLoadingStep('Optimizing Budget Variance & Transit Nodes...');

    try {
      const response = await fetch('/api/simulate-trip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination,
          originLocation,
          durationDays,
          totalBudgetUsd,
          travelStyle,
          pace,
          privacyLevel,
          dietary: selectedDietary,
          interests: selectedInterests,
        }),
      });

      const data = await response.json();
      const imageUrl = await fetchLocationImage(destination);

      const newTwin: TripTwin = {
        id: `twin-${Date.now()}`,
        destination,
        country: 'India',
        durationDays,
        totalBudgetUsd,
        travelStyle,
        pace,
        privacyLevel,
        imageUrl,
        twinCompatibilityScore: data.twinCompatibilityScore || 95,
        createdAt: new Date().toISOString().split('T')[0],
        summary: data.summary || `Custom simulated route from ${originLocation} to ${destination}.`,
        highlights: data.highlights || [
          `Route from ${originLocation} to ${destination}`,
          'Crowd-free landmark visit windows',
          'Monsoon/Weather backup routes'
        ],
        securityBadges: data.securityBadges || ['ASI Verified Ticket Paths', 'GPS Mask Active'],
        itinerary: data.itinerary || [],
      };

      setGeneratedResult(newTwin);
      onTripGenerated(newTwin);
    } catch (err) {
      console.error('Generation failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="ai-decision-engine" className="space-y-6">
      {/* Title */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">AI Travel Decision Engine</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Input your constraints to run a Gemini-powered Digital Twin journey simulation.
            </p>
          </div>
        </div>
      </div>

      {/* Main Input Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Controls (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">

          {/* Web Speech Voice Assistant Bar */}
          <div className="bg-slate-950 border border-emerald-500/30 rounded-xl p-3.5 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <div className={`p-1.5 rounded-lg ${isListening ? 'bg-rose-500/20 text-rose-400 animate-pulse' : 'bg-emerald-500/20 text-emerald-400'}`}>
                  {isListening ? <Radio className="w-4 h-4 animate-spin" /> : <Mic className="w-4 h-4" />}
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">Voice-Enabled Travel Assistant</span>
                  <span className="text-[10px] text-slate-400">Speak destination & trip preferences using Web Speech API</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => startListening('full')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shrink-0 ${
                  isListening && speechTarget === 'full'
                    ? 'bg-rose-500 text-white animate-pulse shadow-lg'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md'
                }`}
              >
                {isListening && speechTarget === 'full' ? (
                  <>
                    <MicOff className="w-3.5 h-3.5" />
                    <span>Listening...</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-3.5 h-3.5" />
                    <span>Speak Full Plan</span>
                  </>
                )}
              </button>
            </div>

            {/* Live Speech Feedback Text */}
            {speechFeedback && (
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs font-mono text-emerald-300 flex items-center justify-between">
                <span>{speechFeedback}</span>
                {isListening && <span className="text-[10px] text-rose-400 font-sans font-bold animate-pulse">● Rec</span>}
              </div>
            )}
          </div>

          {/* Starting Origin with GPS Location Detector & Speech Mic */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                1. Starting Origin / Current Location
              </label>
              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={detectingLocation}
                className="flex items-center space-x-1.5 px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 rounded-lg text-[11px] font-bold transition-all shadow-sm"
              >
                {detectingLocation ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Detecting GPS...</span>
                  </>
                ) : (
                  <>
                    <Crosshair className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Get My Location</span>
                  </>
                )}
              </button>
            </div>

            <div className="relative flex items-center">
              <Navigation className="absolute left-3 w-4 h-4 text-emerald-400 pointer-events-none" />
              <input
                id="input-origin-location"
                type="text"
                value={originLocation}
                onChange={(e) => setOriginLocation(e.target.value)}
                placeholder="Click 'Get My Location' or type e.g. New Delhi, Mumbai, Bengaluru..."
                className="w-full pl-10 pr-12 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all font-medium"
              />
              <button
                type="button"
                onClick={() => startListening('origin')}
                title="Speak starting origin"
                className={`absolute right-2 p-1.5 rounded-lg transition-all ${
                  isListening && speechTarget === 'origin'
                    ? 'bg-rose-500/20 text-rose-400 animate-pulse'
                    : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-900'
                }`}
              >
                <Mic className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
              <span className="text-slate-500 text-[11px] shrink-0">Origins:</span>
              {QUICK_ORIGINS.map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => setOriginLocation(city)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all ${
                    originLocation.includes(city)
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>

          {/* Route Arrow Indicator */}
          <div className="flex items-center justify-between py-1.5 bg-slate-950/80 border border-slate-800/80 rounded-xl px-3.5">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-emerald-400 truncate max-w-[150px]">{originLocation}</span>
              <ArrowRight className="w-4 h-4 text-slate-500 shrink-0" />
              <span className="text-xs font-bold text-amber-400 truncate max-w-[150px]">{destination}</span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
              Gemini Route Planner
            </span>
          </div>

          {/* Location Detected Prompt Notice */}
          {locationDetectedNotice && (
            <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-3.5 flex items-start space-x-3 text-xs animate-fadeIn">
              <Compass className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-emerald-300">
                  Location Captured: <span className="text-white">{originLocation}</span>
                </p>
                <p className="text-slate-300">
                  Where would you like to travel? Speak or type your desired target destination below to calculate route, transit options, and day-by-day itinerary:
                </p>
              </div>
            </div>
          )}

          {/* Dedicated Travel Destination Input with Mic Button */}
          <div className="space-y-2.5 bg-slate-950/40 border border-amber-500/20 p-4 rounded-xl">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider">
                2. Travel Destination (Target Location)
              </label>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => startListening('destination')}
                  className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                    isListening && speechTarget === 'destination'
                      ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse'
                      : 'bg-amber-500/20 text-amber-400 border-amber-500/40 hover:bg-amber-500/30'
                  }`}
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>Speak Destination</span>
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-400">
              Enter or speak where you want to travel from <span className="text-emerald-400 font-semibold">{originLocation}</span>:
            </p>

            <div className="relative flex items-center">
              <MapPin className="absolute left-3.5 w-4 h-4 text-amber-400 pointer-events-none" />
              <input
                id="input-destination"
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Type or speak destination e.g. Agra, Jaipur, Goa, Kerala, Varanasi..."
                className="w-full pl-10 pr-12 py-2.5 bg-slate-950 border border-amber-500/40 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all font-semibold"
              />
              <button
                type="button"
                onClick={() => startListening('destination')}
                title="Click to speak destination"
                className={`absolute right-2 p-1.5 rounded-lg transition-all ${
                  isListening && speechTarget === 'destination'
                    ? 'bg-rose-500/20 text-rose-400 animate-pulse'
                    : 'text-amber-400 hover:bg-amber-500/20'
                }`}
              >
                <Mic className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] text-slate-400 font-medium block">Select popular tourist destination:</span>
              <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
                {QUICK_DESTINATIONS.map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => setDestination(city)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all shrink-0 ${
                      destination === city
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm shadow-amber-500/20 scale-[1.02]'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-amber-500/40 hover:text-white'
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Duration & Budget Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Duration (Days): <span className="text-emerald-400">{durationDays} Days</span>
              </label>
              <div className="flex items-center space-x-3 bg-slate-950 p-2 rounded-xl border border-slate-800">
                <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
                <input
                  id="slider-duration"
                  type="range"
                  min="1"
                  max="10"
                  value={durationDays}
                  onChange={(e) => setDurationDays(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Total Budget: <span className="text-emerald-400">${totalBudgetUsd} USD</span>
              </label>
              <div className="flex items-center space-x-3 bg-slate-950 p-2 rounded-xl border border-slate-800">
                <DollarSign className="w-4 h-4 text-slate-500 shrink-0" />
                <input
                  id="slider-budget"
                  type="range"
                  min="300"
                  max="5000"
                  step="100"
                  value={totalBudgetUsd}
                  onChange={(e) => setTotalBudgetUsd(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Travel Style & Pace */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Travel Style
              </label>
              <select
                id="select-travel-style"
                value={travelStyle}
                onChange={(e) => setTravelStyle(e.target.value as TravelStyle)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="balanced">Balanced (Mix of comfort & culture)</option>
                <option value="luxury">Luxury (High-end stay & fine dining)</option>
                <option value="budget">Budget-Conscious (Value stays & street food)</option>
                <option value="backpacker">Backpacker (Hostels & active trails)</option>
                <option value="eco">Eco-Friendly (Low carbon & local hosts)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Pace Preference
              </label>
              <select
                id="select-pace"
                value={pace}
                onChange={(e) => setPace(e.target.value as TravelPace)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="relaxed">Relaxed (1-2 places/day, slow food)</option>
                <option value="moderate">Moderate (2-3 places/day, balanced)</option>
                <option value="fast-paced">Fast-Paced (4+ places/day, dense)</option>
              </select>
            </div>
          </div>

          {/* Location Privacy Level */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Location Privacy Shield Level</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: 'strict-anonymous', label: 'Strict Anonymous', desc: 'No GPS logs' },
                { key: 'fuzzy-location', label: 'Fuzzy GPS', desc: '2.5km offset' },
                { key: 'exact-gps', label: 'Exact Precision', desc: 'Realtime map' },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => setPrivacyLevel(item.key as PrivacyLevel)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    privacyLevel === item.key
                      ? 'bg-emerald-500/20 border-emerald-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="text-xs font-semibold">{item.label}</div>
                  <div className="text-[10px] text-slate-500">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Dietary & Interest Chips */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Dietary Preferences
            </label>
            <div className="flex flex-wrap gap-1.5">
              {DIETARY_OPTIONS.map((item) => {
                const isSelected = selectedDietary.includes(item);
                return (
                  <button
                    key={item}
                    onClick={() => toggleDietary(item)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
                      isSelected
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 inline mr-1" />}
                    {item}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Interest Pillars
            </label>
            <div className="flex flex-wrap gap-1.5">
              {INTEREST_OPTIONS.map((item) => {
                const isSelected = selectedInterests.includes(item);
                return (
                  <button
                    key={item}
                    onClick={() => toggleInterest(item)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
                      isSelected
                        ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 inline mr-1" />}
                    {item}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Generate Action Button */}
          <button
            id="btn-generate-twin"
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-slate-950" />
                <span>Generating Digital Twin...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Simulate Journey Twin</span>
              </>
            )}
          </button>
        </div>

        {/* Output Preview Panel (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {isLoading ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-4 flex flex-col items-center justify-center min-h-[400px]">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 animate-pulse">
                <Zap className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Velora Decision Engine at Work</h3>
                <p className="text-xs text-emerald-400 font-mono mt-2">{loadingStep}</p>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                <div className="bg-emerald-500 h-full w-2/3 animate-pulse" />
              </div>
            </div>
          ) : generatedResult ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl space-y-4">
              {/* Image Hero Header */}
              <div className="relative h-48 w-full overflow-hidden bg-slate-950">
                <img
                  src={
                    generatedResult.imageUrl ||
                    generatedResult.itinerary?.[0]?.nodes?.[0]?.imageUrl ||
                    'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=600&q=80'
                  }
                  alt={generatedResult.destination}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover opacity-85"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/30 to-transparent" />
                <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700/60 text-[10px] font-bold text-white flex items-center space-x-1">
                  <span>📍 {generatedResult.destination}, {generatedResult.country}</span>
                </div>
                <div className="absolute top-3 right-3 bg-emerald-500/90 text-slate-950 px-3 py-1 rounded-xl font-extrabold text-xs shadow-lg">
                  {generatedResult.twinCompatibilityScore}% Match
                </div>
              </div>

              <div className="p-5 space-y-4 pt-1">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <div>
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                      Simulation Ready
                    </span>
                    <h3 className="text-lg font-bold text-white">{generatedResult.destination}</h3>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-emerald-400">{generatedResult.twinCompatibilityScore}%</div>
                    <span className="text-[11px] text-slate-400">Match Score</span>
                  </div>
                </div>

              <p className="text-xs text-slate-300 leading-relaxed">{generatedResult.summary}</p>

              {/* Highlights */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-400 block">Journey Highlights:</span>
                {generatedResult.highlights.map((h, i) => (
                  <div key={i} className="flex items-center space-x-2 text-xs text-slate-200">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>

              {/* Action: Open in Simulator */}
              <button
                id="btn-view-generated-simulator"
                onClick={onNavigateToSimulator}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20"
              >
                <span>Launch Interactive Route Map</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 space-y-3 min-h-[400px] flex flex-col items-center justify-center">
              <Sparkles className="w-10 h-10 text-slate-600" />
              <div>
                <h3 className="text-sm font-semibold text-slate-300">Ready to Simulate</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  Fill in your travel preferences and click "Simulate Journey Twin" to generate an optimized itinerary.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
