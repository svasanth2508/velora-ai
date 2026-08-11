import React, { useState, useEffect, useMemo, Component, ErrorInfo, ReactNode } from 'react';
import { TravelTwinOpenStreetMap } from './TravelTwinOpenStreetMap';
import { TripPlan } from '../types';
import { locationCacheService, CachedLocation } from '../services/locationCacheService';
import {
  optimizeMultiWaypointRoute,
  Waypoint,
  RouteOptimizationResult,
} from '../services/routeOptimizerService';
import {
  ShieldCheck,
  Database,
  Route,
  Zap,
  Clock,
  MapPin,
  ArrowUp,
  ArrowDown,
  Plus,
  Trash2,
  Share2,
  Download,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Car,
  Sparkles,
  Navigation,
} from 'lucide-react';

export interface MarkerPoint {
  id?: string;
  name?: string;
  title?: string;
  lat: number;
  lng: number;
  category?: string;
}

export interface GoogleMapViewProps {
  trip?: TripPlan;
  markers?: MarkerPoint[];
  initialDestination?: string;
  onSelectDestinationForTrip?: (dest: string) => void;
  disableAnimations?: boolean;
}

interface MapViewErrorBoundaryProps {
  children: ReactNode;
}

interface MapViewErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class MapViewErrorBoundary extends React.Component<MapViewErrorBoundaryProps, MapViewErrorBoundaryState> {
  override state: MapViewErrorBoundaryState;
  override props: MapViewErrorBoundaryProps;

  constructor(props: MapViewErrorBoundaryProps) {
    super(props);
    this.props = props;
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): MapViewErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('MapView error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-[500px] bg-slate-950 border border-rose-500/30 rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-md">
            <h3 className="font-bold text-white text-base font-sans">Map Layer Error</h3>
            <p className="text-xs text-slate-400">
              {this.state.error?.message || 'An error occurred while rendering the interactive map layer.'}
            </p>
          </div>
          <button
            onClick={this.handleReset}
            className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition-all shadow"
          >
            Reload Interactive Map
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * GoogleMapView Component
 * Enhanced with:
 * 1. Multi-Waypoint Route Optimization Utility using shortest path algorithm (TSP heuristic + OSRM directions).
 * 2. Real-Time Traffic Data factoring with congestion delay calculations, peak hour alerts & time savings.
 * 3. Persistent Location Caching & Precise Regional Filter.
 */
export const GoogleMapView: React.FC<GoogleMapViewProps> = ({
  trip,
  markers = [],
  initialDestination = 'Jaipur',
  onSelectDestinationForTrip,
  disableAnimations = true,
}) => {
  const targetDestinationQuery = trip?.destination || initialDestination;
  const [resolvedCenter, setResolvedCenter] = useState<CachedLocation | null>(null);

  // Route Optimization Utility State
  const [showOptimizerPanel, setShowOptimizerPanel] = useState<boolean>(true);
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [optimizationResult, setOptimizationResult] = useState<RouteOptimizationResult | null>(null);
  const [showTrafficLayer, setShowTrafficLayer] = useState<boolean>(true);
  const [customStopName, setCustomStopName] = useState<string>('');
  const [customStopLat, setCustomStopLat] = useState<string>('');
  const [customStopLng, setCustomStopLng] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 1. Resolve & Cache Location
  useEffect(() => {
    let isMounted = true;

    locationCacheService.resolveLocation(targetDestinationQuery).then((loc) => {
      if (isMounted && loc) {
        setResolvedCenter(loc);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [targetDestinationQuery]);

  // 2. Filter Markers with Geocoding Proximity Check
  const filteredMarkers = useMemo(() => {
    if (!markers || markers.length === 0) return [];
    if (!resolvedCenter) return markers;

    return markers.filter((m) => {
      return locationCacheService.isRegionMatch(
        targetDestinationQuery,
        {
          lat: m.lat,
          lng: m.lng,
          displayName: m.name || m.title || '',
        },
        {
          lat: resolvedCenter.lat,
          lng: resolvedCenter.lng,
          maxRadiusKm: 120,
        }
      );
    });
  }, [markers, resolvedCenter, targetDestinationQuery]);

  // 3. Auto-populate initial waypoints when center or trip changes
  useEffect(() => {
    const defaultCenter = resolvedCenter || {
      lat: 26.9124,
      lng: 75.7873,
      displayName: targetDestinationQuery,
    };

    const initialList: Waypoint[] = [
      {
        id: 'wpt_start',
        name: `Start: ${defaultCenter.displayName || targetDestinationQuery} Station/Hub`,
        lat: defaultCenter.lat,
        lng: defaultCenter.lng,
        category: 'Origin',
      },
    ];

    // Add intermediate waypoints from trip items or filtered markers
    if (filteredMarkers && filteredMarkers.length > 0) {
      filteredMarkers.slice(0, 3).forEach((m, idx) => {
        initialList.push({
          id: `wpt_m_${idx}_${m.lat}`,
          name: m.name || m.title || `Stop ${idx + 1}`,
          lat: m.lat,
          lng: m.lng,
          category: m.category || 'Attraction',
        });
      });
    } else {
      // Offset fallback stops around center
      initialList.push({
        id: 'wpt_stop_1',
        name: `City Landmark 1 (${defaultCenter.displayName || targetDestinationQuery})`,
        lat: defaultCenter.lat + 0.015,
        lng: defaultCenter.lng + 0.018,
        category: 'Landmark',
      });
      initialList.push({
        id: 'wpt_stop_2',
        name: `Heritage Market (${defaultCenter.displayName || targetDestinationQuery})`,
        lat: defaultCenter.lat - 0.012,
        lng: defaultCenter.lng + 0.022,
        category: 'Shopping',
      });
    }

    // End destination
    initialList.push({
      id: 'wpt_end',
      name: `Destination: ${defaultCenter.displayName || targetDestinationQuery} Viewpoint`,
      lat: defaultCenter.lat + 0.028,
      lng: defaultCenter.lng - 0.015,
      category: 'Destination',
    });

    setWaypoints(initialList);
  }, [resolvedCenter, targetDestinationQuery]);

  // Handle Waypoint Reordering & Operations
  const moveWaypoint = (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= waypoints.length) return;
    const updated = [...waypoints];
    const [moved] = updated.splice(index, 1);
    updated.splice(newIdx, 0, moved);
    setWaypoints(updated);
  };

  const removeWaypoint = (id: string) => {
    if (waypoints.length <= 2) {
      showToast('At least 2 waypoints are required for route optimization.');
      return;
    }
    setWaypoints((prev) => prev.filter((w) => w.id !== id));
  };

  const handleAddMarkerToWaypoints = (marker: MarkerPoint) => {
    const newWpt: Waypoint = {
      id: `wpt_custom_${Date.now()}`,
      name: marker.name || marker.title || 'Selected Spot',
      lat: marker.lat,
      lng: marker.lng,
      category: marker.category || 'Attraction',
    };
    setWaypoints((prev) => {
      // Insert before last destination
      const copy = [...prev];
      copy.splice(copy.length - 1, 0, newWpt);
      return copy;
    });
    showToast(`📍 Added "${newWpt.name}" to waypoints!`);
  };

  const handleAddCustomStop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customStopName.trim()) {
      showToast('Please enter a stop name.');
      return;
    }

    const baseLat = resolvedCenter?.lat || 26.9124;
    const baseLng = resolvedCenter?.lng || 75.7873;
    const parsedLat = parseFloat(customStopLat) || baseLat + (Math.random() * 0.02 - 0.01);
    const parsedLng = parseFloat(customStopLng) || baseLng + (Math.random() * 0.02 - 0.01);

    const newWpt: Waypoint = {
      id: `wpt_user_${Date.now()}`,
      name: customStopName.trim(),
      lat: parsedLat,
      lng: parsedLng,
      category: 'Custom Stop',
    };

    setWaypoints((prev) => {
      const copy = [...prev];
      copy.splice(copy.length - 1, 0, newWpt);
      return copy;
    });

    setCustomStopName('');
    setCustomStopLat('');
    setCustomStopLng('');
    showToast(`📍 Added custom stop "${newWpt.name}"!`);
  };

  // Trigger Route Optimization Calculation
  const handleOptimizeRoute = async () => {
    if (waypoints.length < 2) {
      showToast('Please add at least 2 waypoints.');
      return;
    }

    setIsOptimizing(true);
    try {
      const result = await optimizeMultiWaypointRoute(waypoints);
      setOptimizationResult(result);
      setWaypoints(result.optimizedWaypoints);
      showToast(`⚡ Route optimized! Saved ${result.distanceSavedKm} km & ${result.timeSavedMins} mins.`);
    } catch (err: any) {
      showToast(`Error optimizing route: ${err?.message || 'Calculation failed'}`);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleExportGPX = () => {
    if (!optimizationResult) return;
    const gpxContent = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="TravelTwin Route Optimizer Engine">
  <trk>
    <name>Optimized Route (${optimizationResult.totalDistanceKm} km, ${optimizationResult.totalDurationWithTrafficMins} mins)</name>
    <trkseg>
      ${optimizationResult.optimizedWaypoints
        .map((w, idx) => `<trkpt lat="${w.lat}" lon="${w.lng}"><name>Stop ${idx + 1}: ${w.name}</name></trkpt>`)
        .join('\n      ')}
    </trkseg>
  </trk>
</gpx>`;

    const blob = new Blob([gpxContent], { type: 'application/gpx+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Optimized_Route_${targetDestinationQuery.replace(/\s+/g, '_')}.gpx`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('📥 GPX Route directions file downloaded!');
  };

  const handleShareRoute = () => {
    if (!optimizationResult || optimizationResult.optimizedWaypoints.length < 2) return;
    const waypointsStr = optimizationResult.optimizedWaypoints.map((w) => `${w.lat},${w.lng}`).join(';');
    const shareUrl = `https://www.openstreetmap.org/directions?engine=osrm_car&route=${encodeURIComponent(waypointsStr)}`;
    navigator.clipboard.writeText(shareUrl);
    showToast('🔗 Multi-waypoint navigation route link copied to clipboard!');
  };

  const initialCenterObj = useMemo(() => {
    return resolvedCenter ? { lat: resolvedCenter.lat, lng: resolvedCenter.lng } : undefined;
  }, [resolvedCenter?.lat, resolvedCenter?.lng]);

  return (
    <div id="google-map-view-container" className="w-full relative space-y-3">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 border border-cyan-500 text-white font-bold text-xs px-4 py-2 rounded-2xl shadow-2xl backdrop-blur-md flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Status Bar with Route Optimization Toggle */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300 backdrop-blur-md shadow-md">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <Database className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-semibold text-white">Location Cache & Route Engine</span>
          <span className="text-slate-500 hidden sm:inline">•</span>
          <span className="text-slate-400 hidden sm:inline">
            {resolvedCenter ? `Hub: ${resolvedCenter.displayName}` : 'Querying Geocode Cache...'}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Real-Time Traffic Layer Toggle */}
          <button
            onClick={() => {
              const next = !showTrafficLayer;
              setShowTrafficLayer(next);
              showToast(next ? '🚦 Google Traffic Layer Enabled' : '🚦 Traffic Layer Disabled');
            }}
            className={`flex items-center space-x-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all shadow ${
              showTrafficLayer
                ? 'bg-amber-500/15 text-amber-300 border-amber-500/40 hover:bg-amber-500/25'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
            }`}
            title="Toggle Google Maps Real-Time Traffic Congestion Layer"
          >
            <Car className={`w-3.5 h-3.5 ${showTrafficLayer ? 'text-amber-400 animate-pulse' : 'text-slate-400'}`} />
            <span>Traffic {showTrafficLayer ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={() => setShowOptimizerPanel(!showOptimizerPanel)}
            className="flex items-center space-x-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs font-bold px-3 py-1.5 rounded-xl border border-cyan-500/30 transition-all shadow"
          >
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Route Optimizer Utility ({waypoints.length} Stops)</span>
            {showOptimizerPanel ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <div className="hidden md:flex items-center space-x-1.5 text-emerald-400 text-[11px] font-medium bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Precise Region Filtered</span>
          </div>
        </div>
      </div>

      {/* Route Optimization Utility Drawer Panel */}
      {showOptimizerPanel && (
        <div className="bg-slate-900/95 border border-cyan-500/30 rounded-2xl p-4 space-y-4 shadow-2xl backdrop-blur-md text-slate-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30">
                <Route className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm flex items-center space-x-2">
                  <span>Directions & Real-Time Traffic Route Optimizer</span>
                  <span className="bg-cyan-500/20 text-cyan-300 text-[10px] uppercase font-mono px-2 py-0.5 rounded-full border border-cyan-500/30">
                    Live OSRM + Traffic AI
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Calculates the shortest path connecting multiple waypoints while factoring in live traffic delays & peak congestion.
                </p>
              </div>
            </div>

            <button
              onClick={handleOptimizeRoute}
              disabled={isOptimizing || waypoints.length < 2}
              className="bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-black text-xs px-4 py-2 rounded-xl transition-all shadow flex items-center space-x-1.5 disabled:opacity-50"
            >
              {isOptimizing ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Computing Shortest Path...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Optimize Route & Factor Traffic</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left Column: Interactive Waypoints Manager */}
            <div className="lg:col-span-5 space-y-3 bg-slate-950 p-3 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Route Waypoints ({waypoints.length})</span>
                </h4>
                <span className="text-[10px] text-slate-500">Drag/reorder or delete stops</span>
              </div>

              {/* Waypoint Item List */}
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {waypoints.map((wpt, idx) => {
                  const isOrigin = idx === 0;
                  const isDestination = idx === waypoints.length - 1;

                  return (
                    <div
                      key={wpt.id}
                      className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-2 flex items-center justify-between space-x-2 text-xs transition-all"
                    >
                      <div className="flex items-center space-x-2 truncate">
                        <span
                          className={`w-5 h-5 rounded-lg flex items-center justify-center font-bold text-[10px] shrink-0 ${
                            isOrigin
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                              : isDestination
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                              : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <div className="truncate">
                          <p className="font-bold text-white truncate">{wpt.name}</p>
                          <p className="text-[10px] text-slate-500">
                            {wpt.category || 'Stop'} • {wpt.lat.toFixed(4)}, {wpt.lng.toFixed(4)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1 shrink-0">
                        <button
                          onClick={() => moveWaypoint(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded disabled:opacity-30"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => moveWaypoint(idx, 'down')}
                          disabled={idx === waypoints.length - 1}
                          className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded disabled:opacity-30"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => removeWaypoint(wpt.id)}
                          className="p-1 hover:bg-rose-950 text-slate-500 hover:text-rose-400 rounded transition-colors"
                          title="Remove Waypoint"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add Custom Stop Form */}
              <form onSubmit={handleAddCustomStop} className="pt-2 border-t border-slate-800 space-y-2">
                <p className="text-[11px] font-bold text-slate-400">Add Custom Stop to Route</p>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Enter Place Name (e.g., Jal Mahal)"
                    value={customStopName}
                    onChange={(e) => setCustomStopName(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    type="submit"
                    className="bg-slate-800 hover:bg-cyan-600 text-cyan-300 hover:text-white text-xs font-bold px-3 py-1 rounded-xl transition-all flex items-center space-x-1 shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </form>

              {/* Quick Add Spots from Filtered Markers */}
              {filteredMarkers && filteredMarkers.length > 0 && (
                <div className="pt-2 border-t border-slate-800 space-y-1.5">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Quick Add Nearby Spots:</p>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                    {filteredMarkers.slice(0, 5).map((m, idx) => (
                      <button
                        key={`quick_${idx}_${m.lat}`}
                        onClick={() => handleAddMarkerToWaypoints(m)}
                        className="bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 text-slate-300 text-[10px] px-2 py-1 rounded-lg transition-all flex items-center space-x-1"
                      >
                        <Plus className="w-2.5 h-2.5 text-cyan-400" />
                        <span className="truncate max-w-[120px]">{m.name || m.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Optimization Results & Real-Time Traffic Metrics */}
            <div className="lg:col-span-7 space-y-3">
              {optimizationResult ? (
                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-3">
                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 space-y-0.5">
                      <p className="text-[10px] text-slate-400 uppercase font-medium flex items-center space-x-1">
                        <Route className="w-3 h-3 text-cyan-400" />
                        <span>Total Distance</span>
                      </p>
                      <p className="text-base font-black text-white">{optimizationResult.totalDistanceKm} km</p>
                      {optimizationResult.distanceSavedKm > 0 && (
                        <p className="text-[10px] text-emerald-400 font-semibold">
                          Saved -{optimizationResult.distanceSavedKm} km
                        </p>
                      )}
                    </div>

                    <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 space-y-0.5">
                      <p className="text-[10px] text-slate-400 uppercase font-medium flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-amber-400" />
                        <span>Live Traffic ETA</span>
                      </p>
                      <p className="text-base font-black text-white">
                        {optimizationResult.totalDurationWithTrafficMins} mins
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Base: {optimizationResult.baselineDurationMins}m + {optimizationResult.totalTrafficDelayMins}m traffic
                      </p>
                    </div>

                    <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 space-y-0.5">
                      <p className="text-[10px] text-slate-400 uppercase font-medium flex items-center space-x-1">
                        <Zap className="w-3 h-3 text-emerald-400" />
                        <span>Time Saved</span>
                      </p>
                      <p className="text-base font-black text-emerald-400">
                        {optimizationResult.timeSavedMins > 0 ? `-${optimizationResult.timeSavedMins} mins` : 'Optimal'}
                      </p>
                      <p className="text-[10px] text-emerald-500/80">Path TSP Bypassed</p>
                    </div>

                    <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 space-y-0.5">
                      <p className="text-[10px] text-slate-400 uppercase font-medium flex items-center space-x-1">
                        <Car className="w-3 h-3 text-cyan-400" />
                        <span>Transit Mode</span>
                      </p>
                      <p className="text-base font-black text-cyan-300">Driving (OSRM)</p>
                      <p className="text-[10px] text-slate-400">Turn-by-turn live</p>
                    </div>
                  </div>

                  {/* Real-Time Traffic Status Alert Bar */}
                  <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 flex items-start space-x-2 text-xs">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <p className="font-bold text-white">{optimizationResult.trafficStatusSummary}</p>
                      <p className="text-[11px] text-slate-400">
                        Real-time speed restrictions and congestion delays calculated dynamically for peak traffic conditions.
                      </p>
                    </div>
                  </div>

                  {/* Leg Breakdown Accordion */}
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Optimized Leg Breakdown ({optimizationResult.legs.length} Segments)
                    </h5>
                    {optimizationResult.legs.map((leg, lIdx) => {
                      const isHeavy = leg.trafficCondition === 'heavy';
                      const isModerate = leg.trafficCondition === 'moderate';

                      return (
                        <div
                          key={`leg_${lIdx}`}
                          className="bg-slate-900 border border-slate-800 rounded-xl p-2 space-y-1 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1.5 font-bold text-white truncate">
                              <span className="text-cyan-400">Step {lIdx + 1}:</span>
                              <span className="truncate">{leg.from.name}</span>
                              <span className="text-slate-500">→</span>
                              <span className="truncate">{leg.to.name}</span>
                            </div>
                            <div className="flex items-center space-x-2 shrink-0">
                              <span className="font-mono text-cyan-300 font-bold">{leg.distanceKm} km</span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  isHeavy
                                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                    : isModerate
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                }`}
                              >
                                {leg.totalDurationMins} min ({leg.trafficDelayMins > 0 ? `+${leg.trafficDelayMins}m traffic` : 'Clear'})
                              </span>
                            </div>
                          </div>

                          {leg.steps && leg.steps.length > 0 && (
                            <div className="pl-3 border-l-2 border-slate-800 text-[10px] text-slate-400 space-y-0.5">
                              {leg.steps.slice(0, 2).map((st, sIdx) => (
                                <p key={`st_${sIdx}`} className="truncate">
                                  • {st}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleExportGPX}
                        className="bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500 text-slate-200 font-bold text-xs py-1.5 px-3 rounded-xl flex items-center space-x-1.5 transition-all"
                      >
                        <Download className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Export GPX</span>
                      </button>
                      <button
                        onClick={handleShareRoute}
                        className="bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500 text-slate-200 font-bold text-xs py-1.5 px-3 rounded-xl flex items-center space-x-1.5 transition-all"
                      >
                        <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Share Navigation Link</span>
                      </button>
                    </div>

                    <p className="text-[10px] text-slate-500 font-mono">Polyline rendered on map</p>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-center space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                    <Navigation className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-white text-sm">Ready to Optimize Route</h4>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      Arrange your waypoints on the left or add custom stops, then click <strong>"Optimize Route & Factor Traffic"</strong> to calculate the shortest path and live traffic ETA.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Primary OpenStreetMap Render Wrapped in Error Boundary */}
      <MapViewErrorBoundary>
        <TravelTwinOpenStreetMap
          trip={trip}
          markers={filteredMarkers}
          initialCenter={initialCenterObj}
          initialDestinationName={resolvedCenter?.displayName || targetDestinationQuery}
          onSelectDestinationForTrip={onSelectDestinationForTrip}
          disableAnimations={disableAnimations}
          activeOptimizedRoute={optimizationResult}
          showTrafficLayer={showTrafficLayer}
          onToggleTrafficLayer={(enabled) => setShowTrafficLayer(enabled)}
        />
      </MapViewErrorBoundary>
    </div>
  );
};



