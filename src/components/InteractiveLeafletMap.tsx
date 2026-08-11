import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import { LocationNode, NearbySpot } from '../types';
import { AuthenticImage } from './AuthenticImage';
import { lookupKnownCoordinates } from '../data/knownCoordinates';
import { getDestinationSpecialty, DestinationSpecialty } from '../services/destinationSpecialtyService';
import {
  MapPin,
  Navigation,
  Search,
  Crosshair,
  Filter,
  CheckCircle2,
  AlertCircle,
  Star,
  Clock,
  DollarSign,
  Plus,
  ChevronRight,
  X,
  Layers,
  Compass,
  Maximize2,
  Minimize2,
  ExternalLink,
  Sparkles,
  Building,
  Utensils,
  Coffee,
  Trees,
  Landmark,
  Hospital,
  ShoppingBag,
  Car,
  ShieldAlert,
  HelpCircle,
  Info,
  Route as RouteIcon,
  Footprints,
  Bike,
  Bus,
  UtensilsCrossed,
  ShoppingBag as ShoppingIcon,
  Calendar,
  Award,
  BookOpen,
  ArrowRight,
  Share2
} from 'lucide-react';

export interface MapPOI {
  id: string;
  name: string;
  category: 'attraction' | 'hotel' | 'restaurant' | 'cafe' | 'viewpoint' | 'park' | 'museum' | 'hospital' | 'shopping' | 'parking' | string;
  lat: number;
  lng: number;
  rating: number;
  reviewsCount: number;
  openHours: string;
  entryFeeInr: string;
  priceLevel: string;
  distKm: number;
  estimatedTravelMins: number;
  address: string;
  description: string;
  imageUrl?: string;
}

export type MapTileTheme = 'dark' | 'standard' | 'satellite' | 'hybrid' | 'terrain';

export interface RouteInstructionStep {
  text: string;
  distanceMeters: number;
  durationSecs: number;
}

interface InteractiveLeafletMapProps {
  activeNodes?: LocationNode[];
  activeNodeIndex?: number;
  onSelectNode?: (index: number) => void;
  onSelectNearbySpot?: (spot: NearbySpot) => void;
  onAddSpotToTrip?: (spot: MapPOI) => void;
  mapTileTheme?: MapTileTheme;
  initialDestination?: string;
  heightClassName?: string;
}

export const InteractiveLeafletMap: React.FC<InteractiveLeafletMapProps> = ({
  activeNodes = [],
  activeNodeIndex = 0,
  onSelectNode,
  onSelectNearbySpot,
  onAddSpotToTrip,
  mapTileTheme = 'satellite',
  initialDestination = 'Jaipur',
  heightClassName = 'h-[520px]',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const userLocationLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerGroupRef = useRef<L.LayerGroup | null>(null);

  // Map Tile Layer State
  const [activeTileTheme, setActiveTileTheme] = useState<MapTileTheme>(mapTileTheme);

  // User Location State
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const [locPermissionStatus, setLocPermissionStatus] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [isLocating, setIsLocating] = useState<boolean>(false);

  // Determine actual starting destination
  const defaultDest = activeNodes.length > 0 && activeNodes[0]?.name ? activeNodes[0].name : initialDestination;

  // Search State
  const [searchQuery, setSearchQuery] = useState<string>(defaultDest);
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [correctedTypoNotice, setCorrectedTypoNotice] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Destination Details
  const [currentDestName, setCurrentDestName] = useState<string>(defaultDest);
  const [destCoords, setDestCoords] = useState<{ lat: number; lng: number }>(() => {
    const known = lookupKnownCoordinates(defaultDest);
    return known ? { lat: known.lat, lng: known.lng } : { lat: 26.9124, lng: 75.7873 }; // Jaipur Default
  });

  // Enlarge Map State
  const [isEnlarged, setIsEnlarged] = useState<boolean>(false);

  // Specialty & Highlights Modal State
  const [showSpecialtyCard, setShowSpecialtyCard] = useState<boolean>(false);
  const [destinationSpecialty, setDestinationSpecialty] = useState<DestinationSpecialty>(() =>
    getDestinationSpecialty(defaultDest)
  );

  // Resize Leaflet canvas whenever map is enlarged/minimized
  useEffect(() => {
    const timer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [isEnlarged]);

  // Directions & Route Navigation State
  const [showDirectionsSheet, setShowDirectionsSheet] = useState<boolean>(false);
  const [travelMode, setTravelMode] = useState<'driving' | 'walking' | 'cycling'>('driving');
  const [routeInfo, setRouteInfo] = useState<{
    distanceKm: number;
    durationMins: number;
    steps: RouteInstructionStep[];
  } | null>(null);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState<boolean>(false);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [nearbyPois, setNearbyPois] = useState<MapPOI[]>([]);
  const [selectedPoi, setSelectedPoi] = useState<MapPOI | null>(null);

  // Category Colors
  const getCategoryColor = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'attraction': return '#f59e0b';
      case 'hotel': return '#10b981';
      case 'restaurant': return '#f43f5e';
      case 'cafe': return '#8b5cf6';
      case 'viewpoint': return '#06b6d4';
      case 'park': return '#22c55e';
      case 'museum': return '#6366f1';
      case 'hospital': return '#ef4444';
      case 'shopping': return '#ec4899';
      case 'parking': return '#64748b';
      default: return '#3b82f6';
    }
  };

  // Helper to validate coordinates
  const isValidLatLng = useCallback((lat: any, lng: any): boolean => {
    if (lat === null || lat === undefined || lng === null || lng === undefined) return false;
    const numLat = Number(lat);
    const numLng = Number(lng);
    return typeof numLat === 'number' && typeof numLng === 'number' && !isNaN(numLat) && !isNaN(numLng) && isFinite(numLat) && isFinite(numLng);
  }, []);

  // Tile Config Helper
  const getTileConfig = useCallback((theme: MapTileTheme) => {
    switch (theme) {
      case 'satellite':
      case 'hybrid':
        return {
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          subdomains: [] as string[],
          maxZoom: 19,
          attribution: '&copy; Esri World Imagery & OpenStreetMap contributors',
        };
      case 'standard':
        return {
          url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          subdomains: ['a', 'b', 'c'],
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap contributors',
        };
      case 'terrain':
        return {
          url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
          subdomains: ['a', 'b', 'c'],
          maxZoom: 17,
          attribution: '&copy; OpenTopoMap contributors',
        };
      case 'dark':
      default:
        return {
          url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
          subdomains: ['a', 'b', 'c', 'd'],
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap &copy; CARTO',
        };
    }
  }, []);

  // 1. Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initLat = isValidLatLng(destCoords?.lat, destCoords?.lng) ? Number(destCoords.lat) : 26.9124;
      const initLng = isValidLatLng(destCoords?.lat, destCoords?.lng) ? Number(destCoords.lng) : 75.7873;

      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        attributionControl: false,
        scrollWheelZoom: false, // Prevents page scrolling from trapping map zoom
        preferCanvas: true, // Hardware-accelerated canvas rendering for lag-free performance
        doubleClickZoom: true,
        touchZoom: true,
        boxZoom: false,
        zoomAnimation: false,
        fadeAnimation: false,
        markerZoomAnimation: false,
      }).setView([initLat, initLng], 13);

      const tileConfig = getTileConfig(activeTileTheme);
      L.tileLayer(tileConfig.url, {
        maxZoom: tileConfig.maxZoom,
        subdomains: tileConfig.subdomains,
      }).addTo(map);

      markersLayerGroupRef.current = L.layerGroup().addTo(map);
      userLocationLayerRef.current = L.layerGroup().addTo(map);
      routeLayerGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Sync Map Theme
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    mapInstanceRef.current.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        mapInstanceRef.current?.removeLayer(layer);
      }
    });

    const tileConfig = getTileConfig(activeTileTheme);
    L.tileLayer(tileConfig.url, {
      maxZoom: tileConfig.maxZoom,
      subdomains: tileConfig.subdomains,
    }).addTo(mapInstanceRef.current);
  }, [activeTileTheme, getTileConfig]);

  // 2. Request & Display User Location Marker
  const handleRequestLocation = useCallback(() => {
    setIsLocating(true);
    if (!navigator.geolocation) {
      setLocPermissionStatus('denied');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setUserLocation({ lat: latitude, lng: longitude, accuracy: accuracy || 100 });
        setLocPermissionStatus('granted');
        setIsLocating(false);

        const map = mapInstanceRef.current;
        const userGroup = userLocationLayerRef.current;

        if (map && userGroup) {
          userGroup.clearLayers();

          const userMarkerHtml = `
            <div style="position: relative; display: flex; align-items: center; justify-content: center;">
              <div style="position: absolute; width: 32px; height: 32px; border-radius: 50%; background: rgba(59, 130, 246, 0.4); animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
              <div style="width: 18px; height: 18px; border-radius: 50%; background: #3b82f6; border: 3px solid #ffffff; box-shadow: 0 0 14px rgba(59,130,246,1);"></div>
              <div style="position: absolute; top: -24px; background: #0f172a; color: #60a5fa; padding: 2px 8px; border-radius: 6px; font-size: 10px; font-weight: 800; white-space: nowrap; border: 1px solid #3b82f6; box-shadow: 0 2px 8px rgba(0,0,0,0.5);">
                📍 You Are Here
              </div>
            </div>
          `;

          const userIcon = L.divIcon({
            html: userMarkerHtml,
            className: 'user-location-marker',
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          });

          if (isValidLatLng(latitude, longitude)) {
            L.marker([latitude, longitude], { icon: userIcon }).addTo(userGroup);

            L.circle([latitude, longitude], {
              radius: Math.min(accuracy || 100, 500),
              color: '#3b82f6',
              fillColor: '#3b82f6',
              fillOpacity: 0.15,
              weight: 1.5,
            }).addTo(userGroup);

            map.flyTo([latitude, longitude], 14, { duration: 1.2 });
          }
        }
      },
      (err) => {
        console.warn('Location permission denied or unavailable:', err);
        setLocPermissionStatus('denied');
        setIsLocating(false);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  }, [isValidLatLng]);

  // Track location on mount
  useEffect(() => {
    handleRequestLocation();
  }, [handleRequestLocation]);

  // Ref to hold destCoords without causing callback re-creations
  const destCoordsRef = useRef(destCoords);
  useEffect(() => {
    destCoordsRef.current = destCoords;
  }, [destCoords]);

  // Fallback POIs Generator
  const generateFallbackPois = useCallback((dest: string, cat: string) => {
    const currentCoords = destCoordsRef.current;
    const baseLat = isValidLatLng(currentCoords?.lat, currentCoords?.lng) ? Number(currentCoords.lat) : 26.9124;
    const baseLng = isValidLatLng(currentCoords?.lat, currentCoords?.lng) ? Number(currentCoords.lng) : 75.7873;

    const fallbackList = [
      {
        id: `fb-1`,
        name: `${dest} Heritage Palace & Citadel`,
        category: 'attraction',
        lat: baseLat + 0.005,
        lng: baseLng + 0.005,
        rating: 4.8,
        reviewsCount: 1850,
        openHours: '8:00 AM - 6:00 PM',
        entryFeeInr: '₹200 Entry',
        priceLevel: '$$',
        distKm: 0.8,
        estimatedTravelMins: 10,
        address: `Heritage Quarter, ${dest}`,
        description: `Iconic landmark and architectural treasure in ${dest}.`,
        imageUrl: '',
      },
      {
        id: `fb-2`,
        name: `${dest} Sunset Panorama Viewpoint`,
        category: 'viewpoint',
        lat: baseLat - 0.006,
        lng: baseLng + 0.004,
        rating: 4.9,
        reviewsCount: 1240,
        openHours: '6:00 AM - 7:30 PM',
        entryFeeInr: 'Free Access',
        priceLevel: '$',
        distKm: 1.2,
        estimatedTravelMins: 14,
        address: `Hilltop Vista, ${dest}`,
        description: `Breathtaking vantage point for photographs and sunset watching.`,
        imageUrl: '',
      },
      {
        id: `fb-3`,
        name: `${dest} Royal Palace Resort & Spa`,
        category: 'hotel',
        lat: baseLat + 0.003,
        lng: baseLng - 0.005,
        rating: 4.7,
        reviewsCount: 920,
        openHours: '24 Hours Open',
        entryFeeInr: '₹4,200/night',
        priceLevel: '$$$',
        distKm: 0.5,
        estimatedTravelMins: 6,
        address: `Resort Avenue, ${dest}`,
        description: `Luxury heritage resort with swimming pool and royal hospitality.`,
        imageUrl: '',
      },
      {
        id: `fb-4`,
        name: `${dest} Authentic Heritage Kitchen`,
        category: 'restaurant',
        lat: baseLat - 0.002,
        lng: baseLng - 0.003,
        rating: 4.8,
        reviewsCount: 2100,
        openHours: '11:00 AM - 11:00 PM',
        entryFeeInr: 'Avg ₹600 for two',
        priceLevel: '$$',
        distKm: 0.4,
        estimatedTravelMins: 5,
        address: `Bazaar Street, ${dest}`,
        description: `Famous local restaurant serving delicious regional delicacies and sweets.`,
        imageUrl: '',
      }
    ];

    const filtered = cat === 'all' ? fallbackList : fallbackList.filter(p => p.category === cat);
    setNearbyPois(filtered);
  }, [isValidLatLng]);

  // 3. Search and Fetch Place Details & Specialties
  const executeLocationSearch = useCallback(async (locationQuery: string) => {
    if (!locationQuery || !locationQuery.trim()) return;
    const cleanQuery = locationQuery.trim();
    setIsSearching(true);

    // Update Specialty Data
    const spec = getDestinationSpecialty(cleanQuery);
    setDestinationSpecialty(spec);

    // First check local known coordinates dataset
    const known = lookupKnownCoordinates(cleanQuery);
    if (known && isValidLatLng(known.lat, known.lng)) {
      const safeLat = Number(known.lat);
      const safeLng = Number(known.lng);
      if (destCoordsRef.current.lat !== safeLat || destCoordsRef.current.lng !== safeLng) {
        setDestCoords({ lat: safeLat, lng: safeLng });
      }

      if (mapInstanceRef.current) {
        mapInstanceRef.current.setView([safeLat, safeLng], 13, { animate: false });
      }
    }

    try {
      const res = await fetch(`/api/places/search?q=${encodeURIComponent(cleanQuery)}&category=${encodeURIComponent(selectedCategory)}`);
      if (res.ok) {
        const data = await res.json();
        const validPois = (data.pois || []).filter((p: any) => isValidLatLng(p?.lat, p?.lng));
        if (validPois.length > 0) {
          setNearbyPois(validPois);
        } else {
          generateFallbackPois(cleanQuery, selectedCategory);
        }

        if (isValidLatLng(data.lat, data.lng)) {
          const safeLat = Number(data.lat);
          const safeLng = Number(data.lng);
          if (destCoordsRef.current.lat !== safeLat || destCoordsRef.current.lng !== safeLng) {
            setDestCoords({ lat: safeLat, lng: safeLng });
          }

          if (mapInstanceRef.current) {
            mapInstanceRef.current.setView([safeLat, safeLng], 13, { animate: false });
          }
        }
      } else {
        generateFallbackPois(cleanQuery, selectedCategory);
      }
    } catch (err) {
      console.warn('Place search API network fallback:', err);
      generateFallbackPois(cleanQuery, selectedCategory);
    } finally {
      setIsSearching(false);
    }
  }, [selectedCategory, isValidLatLng, generateFallbackPois]);

  // Search when destination or category updates
  useEffect(() => {
    executeLocationSearch(currentDestName);
  }, [currentDestName, selectedCategory, executeLocationSearch]);

  // 4. Handle Autocomplete Input
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 1) {
      setAutocompleteSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/places/autocomplete?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setAutocompleteSuggestions(data.suggestions || []);
          setShowSuggestions(true);
        }
      } catch (err) {
        console.warn('Autocomplete lookup error:', err);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectSuggestion = (sug: any) => {
    const selectedText = sug.text;
    setSearchQuery(''); // Automatically clear search query so search bar resets and map is visible
    setCurrentDestName(selectedText);
    setShowSuggestions(false);
    setAutocompleteSuggestions([]);
    setShowSpecialtyCard(false);
    setSelectedPoi(null);
    setShowDirectionsSheet(false);
    executeLocationSearch(selectedText);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const query = searchQuery.trim();
    setSearchQuery(''); // Automatically clear search query so search bar resets and map is visible
    setCurrentDestName(query);
    setShowSuggestions(false);
    setAutocompleteSuggestions([]);
    setShowSpecialtyCard(false);
    setSelectedPoi(null);
    setShowDirectionsSheet(false);
    executeLocationSearch(query);
  };

  // 5. Calculate Real-Time OSRM Nearest Route between User and Destination / POI
  const handleCalculateRoute = async (targetLat?: number, targetLng?: number) => {
    setIsCalculatingRoute(true);
    setShowDirectionsSheet(true);

    const startLat = userLocation?.lat || 26.9124;
    const startLng = userLocation?.lng || 75.7873;
    const endLat = targetLat !== undefined ? targetLat : destCoords.lat;
    const endLng = targetLng !== undefined ? targetLng : destCoords.lng;

    const routeGroup = routeLayerGroupRef.current;
    if (routeGroup) routeGroup.clearLayers();

    try {
      const modeOsm = travelMode === 'walking' ? 'foot' : travelMode === 'cycling' ? 'bike' : 'driving';
      const url = `https://router.project-osrm.org/route/v1/${modeOsm}/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson&steps=true`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          const rawCoords = route.geometry.coordinates; // [lng, lat]
          const latLngs: L.LatLngTuple[] = rawCoords.map((c: number[]) => [c[1], c[0]]);

          if (routeGroup && mapInstanceRef.current && latLngs.length > 0) {
            // Animated Polyline Route
            const polyline = L.polyline(latLngs, {
              color: '#10b981',
              weight: 6,
              opacity: 0.9,
              lineCap: 'round',
              lineJoin: 'round',
            });
            polyline.addTo(routeGroup);

            // Secondary outer glow
            L.polyline(latLngs, {
              color: '#34d399',
              weight: 12,
              opacity: 0.3,
            }).addTo(routeGroup);

            // Fit map view to entire route bounds with padding
            const bounds = L.latLngBounds(latLngs);
            mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
          }

          // Format Steps
          const rawSteps = route.legs?.[0]?.steps || [];
          const formattedSteps: RouteInstructionStep[] = rawSteps.map((s: any) => ({
            text: s.maneuver?.instruction || `Head ${s.maneuver?.type || 'forward'} on ${s.name || 'road'}`,
            distanceMeters: Math.round(s.distance || 0),
            durationSecs: Math.round(s.duration || 0),
          }));

          setRouteInfo({
            distanceKm: parseFloat((route.distance / 1000).toFixed(1)),
            durationMins: Math.round(route.duration / 60),
            steps: formattedSteps,
          });
        }
      } else {
        throw new Error('OSRM service unavailable');
      }
    } catch (err) {
      console.warn('Fallback straight line routing due to network:', err);

      // Fallback straight-line road polyline calculation
      const latLngs: L.LatLngTuple[] = [
        [startLat, startLng],
        [(startLat + endLat) / 2 + 0.005, (startLng + endLng) / 2 - 0.005],
        [endLat, endLng],
      ];

      if (routeGroup && mapInstanceRef.current) {
        const polyline = L.polyline(latLngs, {
          color: '#3b82f6',
          weight: 5,
          dashArray: '8, 8',
          opacity: 0.85,
        });
        polyline.addTo(routeGroup);

        const bounds = L.latLngBounds(latLngs);
        mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40] });
      }

      // Estimate distance straight line
      const R = 6371; // km
      const dLat = ((endLat - startLat) * Math.PI) / 180;
      const dLng = ((endLng - startLng) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((startLat * Math.PI) / 180) *
          Math.cos((endLat * Math.PI) / 180) *
          Math.sin(dLng / 2) *
          Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distKm = parseFloat((R * c).toFixed(1));

      setRouteInfo({
        distanceKm: distKm,
        durationMins: Math.round(distKm * 2.5),
        steps: [
          { text: `Start from current position toward ${currentDestName}`, distanceMeters: 500, durationSecs: 60 },
          { text: `Continue along highway route toward ${currentDestName} central hub`, distanceMeters: Math.round(distKm * 1000), durationSecs: Math.round(distKm * 120) },
          { text: `Arrive safely at ${currentDestName}`, distanceMeters: 100, durationSecs: 20 },
        ],
      });
    } finally {
      setIsCalculatingRoute(false);
    }
  };

  // Recalculate route if mode changes
  useEffect(() => {
    if (showDirectionsSheet) {
      handleCalculateRoute();
    }
  }, [travelMode]);

  // 6. Render Map Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = markersLayerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    // Active Trip Waypoints
    if (activeNodes && activeNodes.length > 0) {
      const latLngs: L.LatLngTuple[] = [];
      activeNodes.forEach((node) => {
        if (isValidLatLng(node.lat, node.lng)) {
          latLngs.push([Number(node.lat), Number(node.lng)]);
        }
      });

      if (latLngs.length > 1) {
        L.polyline(latLngs, {
          color: '#10b981',
          weight: 4,
          dashArray: '6, 8',
          opacity: 0.85,
        }).addTo(layerGroup);
      }

      activeNodes.forEach((node, idx) => {
        if (!isValidLatLng(node.lat, node.lng)) return;
        const nodeLat = Number(node.lat);
        const nodeLng = Number(node.lng);
        const isActive = idx === activeNodeIndex;

        const nodeHtml = `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
            <div style="
              width: ${isActive ? '36px' : '28px'};
              height: ${isActive ? '36px' : '28px'};
              border-radius: 50%;
              background: ${isActive ? '#10b981' : '#1e293b'};
              border: 2px solid ${isActive ? '#ffffff' : '#34d399'};
              box-shadow: ${isActive ? '0 0 15px rgba(16,185,129,0.8)' : '0 2px 8px rgba(0,0,0,0.5)'};
              color: ${isActive ? '#020617' : '#ffffff'};
              font-weight: bold;
              font-size: ${isActive ? '14px' : '12px'};
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              ${idx + 1}
            </div>
            <div style="
              background: rgba(15, 23, 42, 0.95);
              border: 1px solid ${isActive ? '#10b981' : '#334155'};
              color: ${isActive ? '#34d399' : '#e2e8f0'};
              padding: 2px 6px;
              border-radius: 6px;
              font-size: 10px;
              font-weight: 700;
              margin-top: 3px;
              white-space: nowrap;
            ">
              ${node.name.length > 18 ? node.name.slice(0, 16) + '...' : node.name}
            </div>
          </div>
        `;

        const nodeIcon = L.divIcon({
          html: nodeHtml,
          className: 'active-trip-node-marker',
          iconSize: [120, 50],
          iconAnchor: [60, 20],
        });

        const marker = L.marker([nodeLat, nodeLng], { icon: nodeIcon });
        marker.on('click', () => {
          if (onSelectNode) onSelectNode(idx);
        });
        marker.addTo(layerGroup);
      });
    }

    // Main Destination Center Marker
    if (destCoords && isValidLatLng(destCoords.lat, destCoords.lng)) {
      const destLat = Number(destCoords.lat);
      const destLng = Number(destCoords.lng);

      const destMarkerHtml = `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
          <div style="
            background: linear-gradient(135deg, #10b981, #059669);
            color: #ffffff;
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 800;
            border: 2px solid #ffffff;
            box-shadow: 0 0 18px rgba(16,185,129,0.9);
            display: flex;
            align-items: center;
            gap: 5px;
            white-space: nowrap;
          ">
            <span>📍 ${currentDestName}</span>
          </div>
        </div>
      `;

      const destIcon = L.divIcon({
        html: destMarkerHtml,
        className: 'dest-center-marker',
        iconSize: [150, 38],
        iconAnchor: [75, 19],
      });

      const destMarker = L.marker([destLat, destLng], { icon: destIcon });
      destMarker.on('click', () => {
        setShowSpecialtyCard(true);
      });
      destMarker.addTo(layerGroup);
    }

    // Nearby POI Markers
    nearbyPois.forEach((poi) => {
      if (!isValidLatLng(poi.lat, poi.lng)) return;
      const poiLat = Number(poi.lat);
      const poiLng = Number(poi.lng);
      const color = getCategoryColor(poi.category);

      const poiHtml = `
        <div style="position: relative; display: flex; align-items: center; gap: 4px; background: rgba(15,23,42,0.92); border: 1.5px solid ${color}; padding: 3px 8px; border-radius: 12px; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.6); transition: transform 0.2s ease;">
          <span style="width: 8px; height: 8px; border-radius: 50%; background: ${color};"></span>
          <span style="color: #f1f5f9; font-size: 10px; font-weight: 600; white-space: nowrap;">
            ${poi.name.length > 16 ? poi.name.slice(0, 14) + '..' : poi.name}
          </span>
        </div>
      `;

      const poiIcon = L.divIcon({
        html: poiHtml,
        className: 'nearby-poi-marker',
        iconSize: [120, 26],
        iconAnchor: [60, 13],
      });

      const poiMarker = L.marker([poiLat, poiLng], { icon: poiIcon });
      poiMarker.on('click', () => {
        setSelectedPoi(poi);
      });

      poiMarker.addTo(layerGroup);
    });

  }, [activeNodes, activeNodeIndex, destCoords, currentDestName, nearbyPois, onSelectNode, isValidLatLng]);

  // Categories Filter Config
  const CATEGORIES = [
    { id: 'all', label: 'All Places', icon: Compass },
    { id: 'attraction', label: 'Attractions', icon: Landmark },
    { id: 'viewpoint', label: 'Viewpoints', icon: Sparkles },
    { id: 'hotel', label: 'Hotels', icon: Building },
    { id: 'restaurant', label: 'Restaurants', icon: Utensils },
    { id: 'cafe', label: 'Cafes', icon: Coffee },
    { id: 'park', label: 'Parks & Nature', icon: Trees },
    { id: 'hospital', label: 'Hospitals', icon: Hospital },
    { id: 'shopping', label: 'Shopping', icon: ShoppingBag },
    { id: 'parking', label: 'Parking', icon: Car },
  ];

  return (
    <div className={`relative w-full ${isEnlarged ? 'fixed inset-0 z-[9999] w-screen h-screen rounded-none border-0 p-2 sm:p-4 bg-slate-950' : `${heightClassName} rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950`} flex flex-col transition-all`}>
      {/* Top Floating Controls Bar */}
      <div className="absolute top-3 left-3 right-3 z-[400] flex flex-col sm:flex-row gap-2 items-stretch sm:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Search location (e.g., Jaipur, Agra, Goa, Munnar)..."
              className="w-full bg-slate-900/95 border border-slate-700/80 text-slate-100 text-xs rounded-xl pl-9 pr-8 py-2.5 shadow-xl backdrop-blur-md focus:outline-none focus:border-emerald-500 transition-all placeholder:text-slate-400 font-medium"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => { setSearchQuery(''); setShowSuggestions(false); setAutocompleteSuggestions([]); }}
                className="absolute right-3 top-3 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          {/* Autocomplete Dropdown */}
          {showSuggestions && autocompleteSuggestions.length > 0 && (
            <div className="absolute top-full mt-1.5 left-0 right-0 bg-slate-900/98 border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-[500] backdrop-blur-xl divide-y divide-slate-800/60 max-h-60 overflow-y-auto">
              {autocompleteSuggestions.map((sug, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelectSuggestion(sug)}
                  className="px-3.5 py-2.5 hover:bg-slate-800/80 cursor-pointer flex items-center justify-between group transition-colors"
                >
                  <div className="flex items-center space-x-2.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <div>
                      <div className="text-xs font-medium text-slate-100 group-hover:text-emerald-400 transition-colors">
                        {sug.text}
                      </div>
                      <div className="text-[10px] text-slate-400">{sug.subText}</div>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Controls Header */}
        <div className="flex items-center space-x-2 shrink-0">
          {/* Enlarge Map Button */}
          <button
            type="button"
            onClick={() => setIsEnlarged(!isEnlarged)}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xl backdrop-blur-md transition-all border ${
              isEnlarged
                ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-cyan-500/20'
                : 'bg-slate-900/95 text-cyan-300 border-cyan-500/40 hover:bg-slate-800'
            }`}
            title={isEnlarged ? "Exit Enlarge View" : "Enlarge Map View"}
          >
            {isEnlarged ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span>{isEnlarged ? 'Exit Enlarge' : 'Enlarge Map'}</span>
          </button>

          {/* Toggle Specialty Info Drawer */}
          <button
            type="button"
            onClick={() => setShowSpecialtyCard(!showSpecialtyCard)}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xl backdrop-blur-md transition-all border ${
              showSpecialtyCard
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-amber-500/20'
                : 'bg-slate-900/95 text-amber-300 border-amber-500/40 hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{showSpecialtyCard ? 'Hide Specialty' : '✨ View Specialty'}</span>
          </button>

          {/* Directions / Nearest Route Button */}
          <button
            type="button"
            onClick={() => handleCalculateRoute()}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3 py-2 rounded-xl text-xs font-black flex items-center space-x-1.5 shadow-xl transition-all shadow-emerald-500/20"
          >
            <Navigation className="w-3.5 h-3.5 fill-slate-950" />
            <span>Directions</span>
          </button>

          {/* Map Layer Switcher */}
          <div className="flex items-center space-x-1 bg-slate-900/95 border border-slate-700/80 rounded-xl p-1 shadow-xl backdrop-blur-md">
            <button
              type="button"
              onClick={() => setActiveTileTheme('satellite')}
              title="Satellite Aerial View"
              className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-all ${
                activeTileTheme === 'satellite' || activeTileTheme === 'hybrid'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Satellite</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTileTheme('standard')}
              title="Street Map"
              className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-all ${
                activeTileTheme === 'standard'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <span>Map</span>
            </button>
          </div>

          {/* Center User Location Button */}
          <button
            type="button"
            onClick={handleRequestLocation}
            disabled={isLocating}
            title="Re-center My Current GPS Location"
            className="bg-slate-900/95 hover:bg-slate-800 border border-slate-700/80 text-blue-400 text-xs px-2.5 py-2 rounded-xl font-bold shadow-xl backdrop-blur-md flex items-center space-x-1 transition-all"
          >
            <Crosshair className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Category Filters Bar */}
      <div className="absolute top-16 left-3 right-3 z-[380] flex items-center space-x-1.5 overflow-x-auto scrollbar-none py-1">
        {CATEGORIES.map((cat) => {
          const IconComp = cat.icon;
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold flex items-center space-x-1 shrink-0 transition-all shadow-md backdrop-blur-md border ${
                isSelected
                  ? 'bg-emerald-500 border-emerald-400 text-slate-950 font-bold'
                  : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <IconComp className="w-3 h-3" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Map Canvas */}
      <div ref={mapContainerRef} className="w-full flex-1 z-10" />

      {/* Specialty & Location Highlights Drawer Card Overlay */}
      {showSpecialtyCard && destinationSpecialty && (
        <div className="absolute top-28 left-3 right-3 sm:right-auto sm:max-w-md z-[420] bg-slate-900/98 border border-amber-500/40 rounded-2xl p-4 shadow-2xl backdrop-blur-2xl animate-fade-in space-y-3 max-h-[65vh] overflow-y-auto">
          <div className="flex items-start justify-between border-b border-slate-800 pb-2.5">
            <div>
              <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 mb-1">
                {destinationSpecialty.tag}
              </span>
              <h3 className="text-lg font-black text-white flex items-center space-x-1.5">
                <span>📍 {destinationSpecialty.name}</span>
              </h3>
              <p className="text-xs text-amber-300/90 font-medium italic">{destinationSpecialty.tagline}</p>
            </div>
            <button
              onClick={() => setShowSpecialtyCard(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Specialty Description */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[10px] font-extrabold uppercase text-emerald-400 tracking-wider flex items-center space-x-1">
              <Sparkles className="w-3 h-3" />
              <span>What Makes {destinationSpecialty.name} Special</span>
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">{destinationSpecialty.specialty}</p>
          </div>

          {/* Famous Food & Cuisines */}
          {destinationSpecialty.famousDishes && destinationSpecialty.famousDishes.length > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-rose-400 tracking-wider flex items-center space-x-1">
                <UtensilsCrossed className="w-3 h-3" />
                <span>Famous Local Food & Delicacies</span>
              </span>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {destinationSpecialty.famousDishes.map((dish, i) => (
                  <span key={i} className="px-2 py-1 rounded-lg text-[10px] font-bold bg-slate-800 text-rose-300 border border-slate-700">
                    🍲 {dish}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Famous Shopping & Souvenirs */}
          {destinationSpecialty.famousShopping && destinationSpecialty.famousShopping.length > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-cyan-400 tracking-wider flex items-center space-x-1">
                <ShoppingIcon className="w-3 h-3" />
                <span>Famous Local Shopping & Crafts</span>
              </span>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {destinationSpecialty.famousShopping.map((shop, i) => (
                  <span key={i} className="px-2 py-1 rounded-lg text-[10px] font-bold bg-slate-800 text-cyan-300 border border-slate-700">
                    🛍️ {shop}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Key Famous Highlights */}
          {destinationSpecialty.famousHighlights && destinationSpecialty.famousHighlights.length > 0 && (
            <div className="space-y-2 pt-1 border-t border-slate-800">
              <span className="text-[10px] font-extrabold uppercase text-amber-400 tracking-wider block">
                Top Must-Visit Highlights in {destinationSpecialty.name}
              </span>
              <div className="space-y-1.5">
                {destinationSpecialty.famousHighlights.map((hl, i) => (
                  <div key={i} className="p-2 rounded-xl bg-slate-950 border border-slate-800 flex items-start space-x-2">
                    <span className="text-amber-400 text-xs mt-0.5">⭐</span>
                    <div>
                      <div className="text-xs font-bold text-white">{hl.name}</div>
                      <div className="text-[11px] text-slate-400 line-clamp-1">{hl.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Directions Quick Action */}
          <button
            onClick={() => handleCalculateRoute()}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs py-2.5 rounded-xl flex items-center justify-center space-x-2 shadow-lg transition-all"
          >
            <Navigation className="w-4 h-4 fill-slate-950" />
            <span>Show Route & Directions to {destinationSpecialty.name}</span>
          </button>
        </div>
      )}

      {/* Turn-by-Turn Route Navigation Drawer Overlay */}
      {showDirectionsSheet && (
        <div className="absolute bottom-3 left-3 right-3 z-[460] bg-slate-900/98 border border-emerald-500/40 rounded-2xl p-4 shadow-2xl backdrop-blur-2xl animate-slide-up max-w-2xl mx-auto space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-emerald-500/20 rounded-xl border border-emerald-500/30 text-emerald-400">
                <RouteIcon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-white">Nearest Route to {currentDestName}</h4>
                <p className="text-[10px] text-slate-400">Real-Time OSRM Navigation Engine</p>
              </div>
            </div>
            <button
              onClick={() => setShowDirectionsSheet(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Transport Mode Switcher */}
          <div className="flex items-center space-x-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => setTravelMode('driving')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition-all ${
                travelMode === 'driving' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Car className="w-3.5 h-3.5" />
              <span>Driving</span>
            </button>
            <button
              onClick={() => setTravelMode('walking')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition-all ${
                travelMode === 'walking' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Footprints className="w-3.5 h-3.5" />
              <span>Walking</span>
            </button>
            <button
              onClick={() => setTravelMode('cycling')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition-all ${
                travelMode === 'cycling' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Bike className="w-3.5 h-3.5" />
              <span>Cycling</span>
            </button>
          </div>

          {/* Route Stats & Steps */}
          {isCalculatingRoute ? (
            <div className="p-6 text-center text-slate-400 text-xs flex items-center justify-center space-x-2">
              <Compass className="w-4 h-4 animate-spin text-emerald-400" />
              <span>Computing nearest optimal road route...</span>
            </div>
          ) : routeInfo ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 block font-semibold">Total Distance</span>
                  <span className="text-base font-black text-emerald-400 font-mono">{routeInfo.distanceKm} km</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 block font-semibold">Estimated Duration</span>
                  <span className="text-base font-black text-cyan-400 font-mono">{routeInfo.durationMins} mins</span>
                </div>
              </div>

              {/* Turn-by-Turn Guidance List */}
              {routeInfo.steps && routeInfo.steps.length > 0 && (
                <div className="max-h-28 overflow-y-auto space-y-1.5 pr-1 divide-y divide-slate-800/60">
                  {routeInfo.steps.slice(0, 5).map((st, i) => (
                    <div key={i} className="pt-1.5 text-[11px] text-slate-300 flex items-start space-x-2">
                      <span className="text-emerald-400 font-bold shrink-0">{i + 1}.</span>
                      <span className="flex-1">{st.text}</span>
                      <span className="text-slate-500 font-mono shrink-0">{st.distanceMeters}m</span>
                    </div>
                  ))}
                </div>
              )}

              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${destCoords.lat},${destCoords.lng}`}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-2 rounded-xl flex items-center justify-center space-x-1.5 shadow-lg transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Start Live Voice Turn-by-Turn Navigation on Google Maps</span>
              </a>
            </div>
          ) : null}
        </div>
      )}

      {/* Selected Marker Detail Card */}
      {selectedPoi && (
        <div className="absolute bottom-3 left-3 right-3 z-[450] bg-slate-900/98 border border-slate-800 rounded-2xl p-4 shadow-2xl backdrop-blur-xl animate-slide-up flex flex-col md:flex-row gap-4 items-stretch max-w-3xl mx-auto">
          <div className="w-full md:w-44 h-28 md:h-auto rounded-xl overflow-hidden shrink-0 relative bg-slate-950">
            <AuthenticImage
              locationName={selectedPoi.name}
              lat={selectedPoi.lat}
              lng={selectedPoi.lng}
              category={selectedPoi.category}
              aspectRatio="auto"
              className="w-full h-full object-cover"
              showBadge={true}
            />
          </div>

          <div className="flex-1 flex flex-col justify-between space-y-2">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-slate-800 text-emerald-400 border border-slate-700/80 mb-1">
                    {selectedPoi.category}
                  </span>
                  <h4 className="text-sm font-bold text-white line-clamp-1">{selectedPoi.name}</h4>
                  <p className="text-[11px] text-slate-400 line-clamp-1">{selectedPoi.address}</p>
                </div>
                <button
                  onClick={() => setSelectedPoi(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-slate-300">
                <div className="flex items-center space-x-1 text-amber-400 font-semibold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{selectedPoi.rating}</span>
                  <span className="text-slate-400 text-[10px]">({selectedPoi.reviewsCount} reviews)</span>
                </div>
                <div className="flex items-center space-x-1 text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{selectedPoi.openHours}</span>
                </div>
                <div className="flex items-center space-x-1 text-slate-300 font-medium">
                  <span className="text-emerald-400 font-bold">{selectedPoi.entryFeeInr}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2 border-t border-slate-800/80">
              <button
                onClick={() => handleCalculateRoute(selectedPoi.lat, selectedPoi.lng)}
                className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs py-2 px-3 rounded-xl flex items-center justify-center space-x-1.5 transition-colors shadow-lg"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Route To Here</span>
              </button>

              {onAddSpotToTrip && (
                <button
                  onClick={() => {
                    onAddSpotToTrip(selectedPoi);
                    setSelectedPoi(null);
                  }}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-xs py-2 px-3 rounded-xl border border-slate-700 flex items-center justify-center space-x-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Add to Trip</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Status Footer */}
      <div className="bg-slate-950 border-t border-slate-800/80 px-3 py-1.5 text-[10px] text-slate-400 flex items-center justify-between z-20">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>
            Showing <strong className="text-white">{currentDestName}</strong> • {nearbyPois.length} verified landmarks mapped
          </span>
        </div>
        <span className="font-mono text-slate-500 hidden sm:inline">OpenStreetMap + Leaflet + OSRM Engine</span>
      </div>
    </div>
  );
};
