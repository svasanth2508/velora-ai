import React, { useState, useEffect } from 'react';
import { TripTwin, LocationNode, NearbySpot } from '../types';
import { fetchLocationImage, getInstantLocationImage, preloadLandmarkImages } from '../services/locationImageService';
import { InteractiveLeafletMap } from './InteractiveLeafletMap';
import {
  Play,
  Pause,
  SkipForward,
  Users,
  CloudSun,
  DollarSign,
  Shield,
  Sparkles,
  MapPin,
  Compass,
  AlertCircle,
  RefreshCw,
  Search,
  Layers,
  Car,
  Clock,
  Ticket,
  ExternalLink,
  Navigation,
  Eye,
  Info,
  Globe,
  Map
} from 'lucide-react';

interface DigitalTwinSimulatorProps {
  currentTwin: TripTwin;
  onNavigateToEngine: () => void;
}

export const DigitalTwinSimulator: React.FC<DigitalTwinSimulatorProps> = ({
  currentTwin,
  onNavigateToEngine,
}) => {
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [activeNodeIndex, setActiveNodeIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  
  // Interactive Map Modes
  const [mapEngine, setMapEngine] = useState<'leaflet' | 'vector'>('leaflet');
  const [mapMode, setMapMode] = useState<'standard' | 'traffic' | 'crowd' | 'weather'>('standard');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedNearbySpot, setSelectedNearbySpot] = useState<NearbySpot | null>(null);

  // Quick Condition Tweaks Modifiers
  const [budgetMultiplier, setBudgetMultiplier] = useState<number>(1.0);
  const [avoidCrowds, setAvoidCrowds] = useState<boolean>(false);
  const [publicTransit, setPublicTransit] = useState<boolean>(false);
  const [hotelTier, setHotelTier] = useState<'standard' | 'luxury'>('standard');

  const currentDayData = currentTwin?.itinerary?.find((d) => d.day === selectedDay) || currentTwin?.itinerary?.[0];
  const activeNodes = currentDayData?.nodes || [];
  const selectedNode: LocationNode | undefined = activeNodes[activeNodeIndex] || activeNodes[0];

  // Reset selected nearby spot when node changes
  const [nodeImage, setNodeImage] = useState<string>('');

  // Pre-load all landmark images across all days of the current digital twin in background
  useEffect(() => {
    if (!currentTwin || !currentTwin.itinerary) return;

    const namesToPreload: string[] = [];
    currentTwin.itinerary.forEach((day) => {
      day.nodes?.forEach((node) => {
        if (node.name) namesToPreload.push(node.name);
        node.nearbySpots?.forEach((spot) => {
          if (spot.name) namesToPreload.push(spot.name);
        });
      });
    });

    if (namesToPreload.length > 0) {
      preloadLandmarkImages(namesToPreload);
    }
  }, [currentTwin]);

  // Pre-load next and previous nodes for active day to ensure zero flicker during stepping
  useEffect(() => {
    if (activeNodes.length === 0) return;
    const nextIdx = (activeNodeIndex + 1) % activeNodes.length;
    const prevIdx = (activeNodeIndex - 1 + activeNodes.length) % activeNodes.length;
    
    const targets = [
      activeNodes[nextIdx]?.name,
      activeNodes[prevIdx]?.name
    ].filter(Boolean) as string[];

    if (targets.length > 0) {
      preloadLandmarkImages(targets);
    }
  }, [activeNodeIndex, activeNodes]);

  useEffect(() => {
    if (selectedNode) {
      const initial = selectedNode.imageUrl || getInstantLocationImage(selectedNode.name);
      setNodeImage(initial);

      fetchLocationImage(selectedNode.name).then((url) => {
        if (url) setNodeImage(url);
      });
    }
  }, [selectedNode]);

  useEffect(() => {
    if (selectedNode?.nearbySpots && selectedNode.nearbySpots.length > 0) {
      setSelectedNearbySpot(selectedNode.nearbySpots[0]);
    } else {
      setSelectedNearbySpot(null);
    }
  }, [selectedNode]);

  // Auto time-lapse step playback
  useEffect(() => {
    let interval: any = null;
    if (isPlaying && activeNodes.length > 0) {
      interval = setInterval(() => {
        setActiveNodeIndex((prev) => {
          if (prev + 1 >= activeNodes.length) {
            if (selectedDay < currentTwin.itinerary.length) {
              setSelectedDay(selectedDay + 1);
              return 0;
            }
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 3500 / playbackSpeed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, activeNodes.length, selectedDay, currentTwin.itinerary.length, playbackSpeed]);

  // Search filter
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const foundIdx = activeNodes.findIndex(
      (n) =>
        n.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (foundIdx !== -1) {
      setActiveNodeIndex(foundIdx);
    }
  };

  // Map projections with NaN safety
  const lats = activeNodes.map((n) => Number(n.lat)).filter((v) => !isNaN(v) && isFinite(v));
  const lngs = activeNodes.map((n) => Number(n.lng)).filter((v) => !isNaN(v) && isFinite(v));
  const minLat = lats.length ? Math.min(...lats) : 26.0;
  const maxLat = lats.length ? Math.max(...lats) : 28.0;
  const minLng = lngs.length ? Math.min(...lngs) : 77.0;
  const maxLng = lngs.length ? Math.max(...lngs) : 79.0;

  const mapWidth = 640;
  const mapHeight = 340;

  const projectPoint = (lat: number, lng: number) => {
    const numLat = Number(lat);
    const numLng = Number(lng);
    const safeLat = !isNaN(numLat) && isFinite(numLat) ? numLat : minLat;
    const safeLng = !isNaN(numLng) && isFinite(numLng) ? numLng : minLng;
    const latSpan = (maxLat - minLat) || 0.05;
    const lngSpan = (maxLng - minLng) || 0.05;

    const x = 60 + ((safeLng - minLng) / lngSpan) * (mapWidth - 120);
    const y = mapHeight - (60 + ((safeLat - minLat) / latSpan) * (mapHeight - 120));
    return { x: isNaN(x) ? 60 : x, y: isNaN(y) ? 60 : y };
  };

  return (
    <div id="digital-twin-simulator" className="space-y-6">
      {/* Top Banner: Indian Tourist Destination Twin Overview */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
        <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3 mb-1">
              <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                🇮🇳 Indian Tourist Digital Twin Active
              </span>
              <span className="text-xs text-slate-400">ID: {currentTwin.id}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {currentTwin.destination}, {currentTwin.country} Interactive Map & Decision Engine
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
              {currentTwin.summary}
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              id="btn-re-simulate"
              onClick={onNavigateToEngine}
              className="flex items-center space-x-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs rounded-xl transition-all shadow-lg shadow-emerald-500/20"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Modify Twin Parameters</span>
            </button>
          </div>
        </div>

        {/* Digital Twin Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800/80">
          <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Twin Match Score</span>
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl font-bold text-emerald-400 mt-1">{currentTwin.twinCompatibilityScore}%</div>
            <div className="text-[11px] text-slate-400 mt-0.5">High India Heritage Fit</div>
          </div>

          <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Crowd Forecast</span>
              <Users className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-xl font-bold text-white mt-1 capitalize">{currentDayData?.crowdForecast || 'Low'}</div>
            <div className="text-[11px] text-emerald-400 mt-0.5">Early sunrise entry</div>
          </div>

          <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Weather Micro-Climate</span>
              <CloudSun className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-sm font-semibold text-white mt-1.5 truncate">{currentDayData?.weatherForecast}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Shaded heritage routes</div>
          </div>

          <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Day Est. Expense</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl font-bold text-white mt-1">₹{Math.round((currentDayData?.totalCostUsd || 100) * 83 * budgetMultiplier * (hotelTier === 'luxury' ? 1.4 : 1.0))} INR</div>
            <div className="text-[11px] text-emerald-400 mt-0.5">Approx ${Math.round((currentDayData?.totalCostUsd || 100) * budgetMultiplier * (hotelTier === 'luxury' ? 1.4 : 1.0))} USD</div>
          </div>
        </div>

        {/* Quick Simulation Condition Tweaks */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 space-y-2">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-3.5 h-3.5 text-[#D8F864]" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Quick Condition Tweaks:</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <button
              type="button"
              onClick={() => setBudgetMultiplier(prev => prev === 1.2 ? 1.0 : 1.2)}
              className={`px-3 py-1.5 rounded-lg border font-semibold transition-all ${
                budgetMultiplier === 1.2
                  ? 'bg-[#D8F864] text-slate-950 border-[#D8F864] font-black'
                  : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              💰 Increase Budget (+20%)
            </button>

            <button
              type="button"
              onClick={() => setHotelTier(prev => prev === 'luxury' ? 'standard' : 'luxury')}
              className={`px-3 py-1.5 rounded-lg border font-semibold transition-all ${
                hotelTier === 'luxury'
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-black'
                  : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              🏨 Upgrade Hotel (5-Star Luxury)
            </button>

            <button
              type="button"
              onClick={() => setAvoidCrowds(prev => !prev)}
              className={`px-3 py-1.5 rounded-lg border font-semibold transition-all ${
                avoidCrowds
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-black'
                  : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              👥 Avoid Crowded Locations
            </button>

            <button
              type="button"
              onClick={() => setPublicTransit(prev => !prev)}
              className={`px-3 py-1.5 rounded-lg border font-semibold transition-all ${
                publicTransit
                  ? 'bg-amber-400 text-slate-950 border-amber-400 font-black'
                  : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              🚌 Use Public Transit (-15% Cost)
            </button>
          </div>
        </div>
      </div>

      {/* Search & OpenStreetMap Style Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-md">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="map-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Taj Mahal, Hawa Mahal, Forts..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </form>

        {/* Map Layers Toggle */}
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <span className="text-[11px] text-slate-400 font-semibold mr-1 flex items-center space-x-1">
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span>Map Layer:</span>
          </span>
          <button
            onClick={() => setMapMode('standard')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              mapMode === 'standard' ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            🛰️ Satellite / Terrain
          </button>
          <button
            onClick={() => setMapMode('traffic')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              mapMode === 'traffic' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            🚦 India Traffic Flow
          </button>
          <button
            onClick={() => setMapMode('crowd')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              mapMode === 'crowd' ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            👥 Crowd Heatmap
          </button>
        </div>
      </div>

      {/* Main Simulation Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Map Canvas & Sequence Timeline */}
        <div className="lg:col-span-7 space-y-4">
          {/* Day Switcher & Time-lapse Controls */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Day:</span>
              <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                {currentTwin.itinerary.map((d) => (
                  <button
                    key={d.day}
                    id={`btn-select-day-${d.day}`}
                    onClick={() => {
                      setSelectedDay(d.day);
                      setActiveNodeIndex(0);
                    }}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                      selectedDay === d.day
                        ? 'bg-emerald-500 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Day {d.day}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                id="btn-toggle-play"
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-lg text-xs font-semibold border border-slate-700 transition-all"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5 text-amber-400" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Play Twin Path</span>
                  </>
                )}
              </button>

              <button
                id="btn-step-forward"
                onClick={() => setActiveNodeIndex((prev) => (prev + 1) % activeNodes.length)}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700"
                title="Next location node"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Interactive Map Box (Leaflet / Vector) */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 relative overflow-hidden shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 px-1">
              <div className="flex items-center space-x-2 text-xs text-slate-300">
                <Compass className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-white">{currentDayData?.title}</span>
                <span className="text-slate-400">• {currentDayData?.theme}</span>
              </div>

              {/* Map Engine Selector */}
              <div className="flex items-center space-x-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setMapEngine('leaflet')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${
                    mapEngine === 'leaflet'
                      ? 'bg-emerald-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Leaflet Map</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMapEngine('vector')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${
                    mapEngine === 'vector'
                      ? 'bg-emerald-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Map className="w-3.5 h-3.5" />
                  <span>Vector Route</span>
                </button>
              </div>
            </div>

            {/* Render Leaflet Map or Vector Canvas */}
            {mapEngine === 'leaflet' ? (
              <InteractiveLeafletMap
                activeNodes={activeNodes}
                activeNodeIndex={activeNodeIndex}
                initialDestination={currentTwin.destination || 'Jaipur'}
                onSelectNode={(idx) => {
                  setActiveNodeIndex(idx);
                  setIsPlaying(false);
                }}
                onSelectNearbySpot={(spot) => {
                  setSelectedNearbySpot(spot);
                }}
                onAddSpotToTrip={(spot) => {
                  const newLocationNode: LocationNode = {
                    id: `node-${Date.now()}`,
                    name: spot.name,
                    category: (spot.category as any) || 'landmark',
                    lat: spot.lat,
                    lng: spot.lng,
                    rating: spot.rating,
                    avgCostUsd: 10,
                    entryFeeInr: spot.entryFeeInr,
                    crowdIndex: 25,
                    weatherSensitivity: 'low',
                    bestVisitingTime: spot.openHours,
                    description: spot.description,
                    imageUrl: spot.imageUrl || '',
                    estimatedTimeMins: spot.estimatedTravelMins || 60,
                    twinMatchReason: `Added from map search near ${currentTwin.destination}`,
                  };

                  if (currentTwin?.itinerary && currentTwin.itinerary.length > 0) {
                    const dayObj = currentTwin.itinerary.find((d) => d.day === selectedDay) || currentTwin.itinerary[0];
                    if (dayObj) {
                      if (!dayObj.nodes) dayObj.nodes = [];
                      dayObj.nodes.push(newLocationNode);
                    }
                  }
                }}
                mapTileTheme={mapMode === 'traffic' ? 'standard' : 'dark'}
              />
            ) : (
              <div className="relative w-full h-[350px] bg-slate-900/90 rounded-xl border border-slate-800 flex items-center justify-center overflow-hidden cursor-crosshair">
                {/* Map grid lines or traffic overlays */}
                <div
                  className={`absolute inset-0 transition-all ${
                    mapMode === 'traffic'
                      ? 'bg-[radial-gradient(#b45309_1px,transparent_1px)] [background-size:12px_12px] opacity-80'
                      : mapMode === 'crowd'
                      ? 'bg-[radial-gradient(#0891b2_1px,transparent_1px)] [background-size:20px_20px] opacity-80'
                      : 'bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-60'
                  }`}
                />

                {/* Vector SVG Map Rendering */}
                <svg className="w-full h-full relative z-10" viewBox={`0 0 ${mapWidth} ${mapHeight}`}>
                  {/* Connecting Path Lines */}
                  {activeNodes.map((node, i) => {
                    if (i === 0) return null;
                    const prevNode = activeNodes[i - 1];
                    const p1 = projectPoint(prevNode.lat, prevNode.lng);
                    const p2 = projectPoint(node.lat, node.lng);
                    const isPassed = i <= activeNodeIndex;

                    return (
                      <g key={`path-${i}`}>
                        <line
                          x1={p1.x}
                          y1={p1.y}
                          x2={p2.x}
                          y2={p2.y}
                          stroke={isPassed ? '#10b981' : '#334155'}
                          strokeWidth={isPassed ? '3' : '2'}
                          strokeDasharray={isPassed ? 'none' : '4 4'}
                        />
                      </g>
                    );
                  })}

                  {/* Location Nodes Pins */}
                  {activeNodes.map((node, i) => {
                    const pt = projectPoint(node.lat, node.lng);
                    const isActive = i === activeNodeIndex;

                    return (
                      <g
                        key={node.id}
                        onClick={() => {
                          setActiveNodeIndex(i);
                          setIsPlaying(false);
                        }}
                        className="cursor-pointer group"
                      >
                        {/* Active Pulse Aura */}
                        {isActive && (
                          <circle
                            cx={pt.x}
                            cy={pt.y}
                            r="20"
                            className="fill-emerald-500/20 stroke-emerald-400 animate-ping"
                            strokeWidth="1.5"
                          />
                        )}

                        {/* Node Base Pin */}
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r={isActive ? '14' : '10'}
                          className={`${
                            isActive
                              ? 'fill-emerald-400 stroke-slate-950'
                              : 'fill-slate-800 stroke-emerald-500/60 hover:fill-slate-700'
                          } transition-all duration-300`}
                          strokeWidth="2"
                        />

                        {/* Sequence Number */}
                        <text
                          x={pt.x}
                          y={pt.y + 3.5}
                          textAnchor="middle"
                          fontSize="11"
                          fontWeight="bold"
                          fill={isActive ? '#020617' : '#e2e8f0'}
                        >
                          {i + 1}
                        </text>

                        {/* Title Tag */}
                        <text
                          x={pt.x}
                          y={pt.y - 18}
                          textAnchor="middle"
                          fontSize="11"
                          fontWeight="700"
                          fill={isActive ? '#34d399' : '#cbd5e1'}
                        >
                          {node.name.length > 22 ? `${node.name.slice(0, 20)}...` : node.name}
                        </text>

                        {/* Entry Fee Pill below Pin */}
                        <text
                          x={pt.x}
                          y={pt.y + 24}
                          textAnchor="middle"
                          fontSize="9"
                          fontWeight="600"
                          fill="#a7f3d0"
                        >
                          {node.entryFeeInr || 'Entry ₹50'}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* Map Footer Helper */}
                <div className="absolute bottom-2 left-2 z-20 bg-slate-950/90 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-slate-800 text-[11px] text-slate-300 flex items-center space-x-3">
                  <span className="flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Click pin to inspect entry fees & nearby spots</span>
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Node Sequence Timeline */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Day {selectedDay} Itinerary Route ({activeNodes.length} Famous Places)
            </h3>
            <div className="space-y-2">
              {activeNodes.map((node, idx) => {
                const isSelected = idx === activeNodeIndex;
                return (
                  <div
                    key={node.id}
                    id={`timeline-node-${node.id}`}
                    onClick={() => setActiveNodeIndex(idx)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-slate-800/90 border-emerald-500/60 shadow-lg shadow-emerald-500/10'
                        : 'bg-slate-950/50 border-slate-800 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                          isSelected ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {idx + 1}
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-white">{node.name}</h4>
                        <div className="flex items-center space-x-2 text-[11px] text-emerald-400">
                          <Ticket className="w-3 h-3 text-emerald-400" />
                          <span>{node.entryFeeInr || '₹50 (Indians)'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right text-xs">
                      <span className="text-white font-bold block">{node.bestVisitingTime || '~90 mins'}</span>
                      <span className="text-slate-400 text-[10px]">Crowd: {node.crowdIndex}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Selected Location Details, Entry Fee Breakdown, Transit & Nearby Places */}
        <div className="lg:col-span-5 space-y-4">
          {selectedNode ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              {/* Image & Header */}
              <div className="relative h-48 rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                <img
                  src={nodeImage || selectedNode.imageUrl || getInstantLocationImage(selectedNode.name)}
                  alt={selectedNode.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 px-2.5 py-1 bg-slate-950/90 backdrop-blur-md rounded-lg text-xs font-bold text-emerald-400 border border-slate-700">
                  ★ {selectedNode.rating}
                </div>
                <div className="absolute bottom-2 left-2 px-2.5 py-1 bg-slate-950/90 backdrop-blur-md rounded-lg text-xs font-bold text-amber-300 border border-slate-700 flex items-center space-x-1">
                  <Ticket className="w-3.5 h-3.5" />
                  <span>{selectedNode.entryFeeInr || '₹50 (Indians) / ₹1,100 (Foreigners)'}</span>
                </div>
              </div>

              {/* Title & Description */}
              <div>
                <h3 className="text-xl font-bold text-white">{selectedNode.name}</h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{selectedNode.description}</p>
              </div>

              {/* Best Visiting Time Highlight */}
              {selectedNode.bestVisitingTime && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-xs text-amber-200 flex items-start space-x-2">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-300 block">Best Visiting Hour:</span>
                    {selectedNode.bestVisitingTime}
                  </div>
                </div>
              )}

              {/* Entry Cost Highlight Card */}
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 text-xs space-y-1">
                <div className="flex items-center justify-between text-emerald-400 font-bold">
                  <span className="flex items-center space-x-1">
                    <Ticket className="w-4 h-4" />
                    <span>Official Ticket Entry Fee</span>
                  </span>
                  <span>₹{selectedNode.entryFeeInr || '50'}</span>
                </div>
                <p className="text-slate-300 text-[11px]">
                  Fee Breakdown: {selectedNode.entryFeeInr || '₹50 (Indian Citizens) / ₹1,100 (Foreign Nationals)'}
                </p>
              </div>

              {/* Transit & Directions Panel */}
              <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 space-y-2">
                <h4 className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                  <Car className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Transit & Travel Modes from Previous Stop</span>
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {Array.isArray(selectedNode?.transitFromPrev) ? (
                    selectedNode.transitFromPrev.map((t: any, idx: number) => (
                      <div key={idx} className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                        <span className="font-bold text-slate-200 block">{t.mode || t.recommendedMode || 'Transit'}</span>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-0.5">
                          <span>~{t.estMins || t.estimatedMinutes || 15} mins</span>
                          <span className="text-emerald-400 font-semibold">{t.estCostInr || (t.estimatedCostInr ? `₹${t.estimatedCostInr}` : '₹150')}</span>
                        </div>
                      </div>
                    ))
                  ) : typeof selectedNode?.transitFromPrev === 'object' && selectedNode?.transitFromPrev ? (
                    <div className="bg-slate-900 p-2 rounded-lg border border-slate-800 col-span-2 flex items-center justify-between">
                      <span className="font-bold text-slate-200">{selectedNode.transitFromPrev.recommendedMode || selectedNode.transitFromPrev.mode || 'Auto / Cab'}</span>
                      <span className="text-slate-400 font-medium">~{selectedNode.transitFromPrev.estimatedMinutes || selectedNode.transitFromPrev.estMins || 15} mins</span>
                      <span className="text-emerald-400 font-semibold">{selectedNode.transitFromPrev.estimatedCostInr ? `₹${selectedNode.transitFromPrev.estimatedCostInr}` : selectedNode.transitFromPrev.estCostInr || '₹150'}</span>
                    </div>
                  ) : (
                    <>
                      <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                        <span className="font-bold text-slate-200 block">🛺 Auto-Rickshaw</span>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-0.5">
                          <span>~15 mins</span>
                          <span className="text-emerald-400 font-semibold">₹120</span>
                        </div>
                      </div>
                      <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                        <span className="font-bold text-slate-200 block">🚕 Taxi / Cab</span>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-0.5">
                          <span>~10 mins</span>
                          <span className="text-emerald-400 font-semibold">₹280</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Famous Nearby Places Section (Key requested feature) */}
              <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white flex items-center space-x-1.5">
                    <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Famous Places Near {selectedNode.name}</span>
                  </h4>
                  <span className="text-[10px] text-emerald-400 font-mono">Within 5km Radius</span>
                </div>

                {selectedNode.nearbySpots && selectedNode.nearbySpots.length > 0 ? (
                  <div className="space-y-2">
                    {selectedNode.nearbySpots.map((spot, idx) => (
                      <div
                        key={idx}
                        onClick={() => setSelectedNearbySpot(spot)}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer text-xs ${
                          selectedNearbySpot?.name === spot.name
                            ? 'bg-emerald-500/10 border-emerald-500/50 text-white'
                            : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold">
                          <span>{spot.name}</span>
                          <span className="text-emerald-400 text-[11px] font-mono">{spot.entryFeeInr}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{spot.description}</p>
                        <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                          <span>Dist: {spot.distKm} km • {spot.category}</span>
                          <span>★ {spot.rating}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-400 p-2 bg-slate-900 rounded-lg text-center">
                    Nearby artisan markets, food stalls, and heritage gates accessible within walking distance.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center text-slate-400 text-xs">
              Select a location node to view entry costs and nearby spots.
            </div>
          )}

          {/* Contingency Plans */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span>Simulated Contingency Plans</span>
            </h3>

            {currentDayData?.alternativeRainPlan && (
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
                <span className="font-semibold text-amber-400 block mb-1">🌧️ Rain / Heat Fallback Route:</span>
                <p className="text-slate-300">{currentDayData.alternativeRainPlan}</p>
              </div>
            )}

            {currentDayData?.alternativeCrowdPlan && (
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
                <span className="font-semibold text-cyan-400 block mb-1">👥 Peak Queue Bypass:</span>
                <p className="text-slate-300">{currentDayData.alternativeCrowdPlan}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
