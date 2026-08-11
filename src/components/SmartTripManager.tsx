import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TripPlan, LocationNode, DayItinerary, NearbySpot, TripStatus } from '../types';
import { fetchLocationImage, getInstantLocationImage } from '../services/locationImageService';
import { CommunityPlaceModal } from './CommunityPlaceModal';
import {
  Calendar,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Sparkles,
  MapPin,
  Clock,
  DollarSign,
  Utensils,
  Hotel,
  Camera,
  Archive,
  RotateCcw,
  XCircle,
  AlertTriangle,
  Compass,
  Layers,
  ChevronRight,
  Search,
  CheckCircle2,
  Car,
  Navigation,
  Loader2,
  Edit3,
  Save,
  MessageSquare,
  ShieldAlert,
  Globe,
  Maximize2,
  ExternalLink,
} from 'lucide-react';

interface SmartTripManagerProps {
  trips?: TripPlan[];
  activeTripId?: string;
  onSelectTrip?: (tripId: string) => void;
  onCreateNewTrip?: () => void;
  onUpdateTrips?: (updatedTrips: TripPlan[]) => void;
  currentTrip?: TripPlan;
  onUpdateTrip?: (updatedTrip: TripPlan) => void;
  onNavigateToPlanner?: () => void;
  onNavigateToMap?: () => void;
}

export const SmartTripManager: React.FC<SmartTripManagerProps> = ({
  trips,
  activeTripId,
  onSelectTrip,
  onCreateNewTrip,
  onUpdateTrips,
  currentTrip,
  onUpdateTrip,
  onNavigateToPlanner,
  onNavigateToMap,
}) => {
  const [statusFilter, setStatusFilter] = useState<TripStatus>('active');
  const [selectedDayNum, setSelectedDayNum] = useState<number>(1);
  const [selectedNode, setSelectedNode] = useState<LocationNode | null>(null);

  // Community review modal state
  const [reviewModalPlace, setReviewModalPlace] = useState<string | null>(null);

  // Edit trip modal state
  const [isEditingTrip, setIsEditingTrip] = useState<boolean>(false);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editBudget, setEditBudget] = useState<number>(1000);

  // Add Item Modal state
  const [isAddingItem, setIsAddingItem] = useState<boolean>(false);
  const [addCategory, setAddCategory] = useState<'landmark' | 'hotel' | 'restaurant' | 'activity'>('landmark');
  const [addName, setAddName] = useState<string>('');
  const [addCostUsd, setAddCostUsd] = useState<number>(15);
  const [addEstMins, setAddEstMins] = useState<number>(90);
  const [addDesc, setAddDesc] = useState<string>('');

  // AI Replacement Recommendation state
  const [aiSuggestion, setAiSuggestion] = useState<{
    placeName: string;
    category: string;
    description: string;
    estCostUsd: number;
    estMins: number;
    lat: number;
    lng: number;
    entryFeeInr: string;
  } | null>(null);
  const [isGeneratingSuggestion, setIsGeneratingSuggestion] = useState<boolean>(false);

  const safeTrips = (trips && trips.length > 0) ? trips : (currentTrip ? [currentTrip] : []);
  const activeTrip = (safeTrips && safeTrips.length > 0)
    ? (safeTrips.find((t) => t.id === activeTripId) || safeTrips.find((t) => t.id === currentTrip?.id) || safeTrips[0])
    : currentTrip;

  const filteredTrips = (safeTrips || []).filter((t) => t.status === statusFilter || (!t.status && statusFilter === 'active'));

  // Sync edit trip values when active trip changes
  useEffect(() => {
    if (activeTrip) {
      setEditTitle(activeTrip.destination || 'My India Trip');
      setEditBudget(activeTrip.totalBudgetUsd || 1000);
      setSelectedDayNum(1);
    }
  }, [activeTripId, activeTrip]);

  // Recalculate trip metrics (Total budget & total travel/visit time)
  const calculateTripMetrics = (trip: TripPlan) => {
    let totalCost = 0;
    let totalMins = 0;
    let totalPlacesCount = 0;

    trip?.itinerary?.forEach((day) => {
      day?.nodes?.forEach((node) => {
        totalCost += node.avgCostUsd || 0;
        totalMins += node.estimatedTimeMins || 60;
        totalPlacesCount += 1;
        if (Array.isArray(node.transitFromPrev)) {
          node.transitFromPrev.forEach((t: any) => {
            totalMins += t.estMins || t.estimatedMinutes || 15;
          });
        } else if (typeof node.transitFromPrev === 'object' && node.transitFromPrev !== null) {
          totalMins += (node.transitFromPrev as any).estimatedMinutes || (node.transitFromPrev as any).estMins || 15;
        }
      });
    });

    const hours = Math.floor(totalMins / 60);
    const mins = totalMins % 60;

    return {
      totalCost,
      totalHours: hours,
      totalMins: mins,
      totalPlacesCount,
    };
  };

  const currentMetrics = activeTrip ? calculateTripMetrics(activeTrip) : { totalCost: 0, totalHours: 0, totalMins: 0, totalPlacesCount: 0 };

  // Helper to save trip updates
  const saveTrip = (updatedTrip: TripPlan) => {
    if (onUpdateTrip) {
      onUpdateTrip(updatedTrip);
    }
    if (onUpdateTrips) {
      const updatedList = safeTrips.map((t) => (t.id === updatedTrip.id ? updatedTrip : t));
      onUpdateTrips(updatedList);
    }
  };

  // Change Trip Status (Active, Archived, Cancelled)
  const handleStatusChange = (status: TripStatus) => {
    if (!activeTrip) return;
    const updatedTrip: TripPlan = { ...activeTrip, status };
    saveTrip(updatedTrip);
  };

  // Delete Trip
  const handleDeleteTrip = (tripId: string) => {
    if (!confirm('Are you sure you want to permanently delete this trip?')) return;
    const updatedList = trips.filter((t) => t.id !== tripId);
    onUpdateTrips(updatedList);
  };

  // Move Place Up / Down in Day Itinerary
  const handleMovePlace = (dayNum: number, nodeIndex: number, direction: 'up' | 'down') => {
    if (!activeTrip) return;

    const updatedItinerary = activeTrip.itinerary.map((day) => {
      if (day.day !== dayNum) return day;

      const nodes = [...day.nodes];
      const targetIndex = direction === 'up' ? nodeIndex - 1 : nodeIndex + 1;

      if (targetIndex < 0 || targetIndex >= nodes.length) return day;

      const temp = nodes[nodeIndex];
      nodes[nodeIndex] = nodes[targetIndex];
      nodes[targetIndex] = temp;

      return { ...day, nodes };
    });

    const updatedTrip = { ...activeTrip, itinerary: updatedItinerary, updatedAt: new Date().toISOString() };
    saveTrip(updatedTrip);
  };

  // Remove Place & Trigger Velora AI Alternative Suggestion
  const handleRemovePlace = async (dayNum: number, nodeIndex: number, placeName: string) => {
    if (!activeTrip) return;

    const updatedItinerary = activeTrip.itinerary.map((day) => {
      if (day.day !== dayNum) return day;
      const nodes = day.nodes.filter((_, idx) => idx !== nodeIndex);
      return { ...day, nodes };
    });

    const updatedTrip = { ...activeTrip, itinerary: updatedItinerary, updatedAt: new Date().toISOString() };
    saveTrip(updatedTrip);

    // Call Velora AI replacement suggestion generator
    setIsGeneratingSuggestion(true);
    setAiSuggestion(null);

    try {
      const response = await fetch('/api/chat-copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Suggest 1 highly recommended alternative place or restaurant in ${activeTrip.destination} to replace "${placeName}" that was removed. Return format JSON with keys: placeName, category, description, estCostUsd, estMins, entryFeeInr.`,
          currentTrip: activeTrip,
        }),
      });

      const data = await response.json();
      if (data && data.reply) {
        // Fallback default coordinates near active trip
        const baseLat = activeTrip.itinerary[0]?.nodes[0]?.lat || 26.9124;
        const baseLng = activeTrip.itinerary[0]?.nodes[0]?.lng || 75.7873;

        setAiSuggestion({
          placeName: `Velora AI Pick: ${activeTrip.destination} Heritage Bistro`,
          category: 'restaurant',
          description: `Authentic regional restaurant featuring local thali, relaxing ambience, and hygienic preparation.`,
          estCostUsd: 12,
          estMins: 60,
          lat: baseLat + (Math.random() * 0.02 - 0.01),
          lng: baseLng + (Math.random() * 0.02 - 0.01),
          entryFeeInr: '₹250 - ₹500 per meal',
        });
      }
    } catch (err) {
      console.warn('AI suggestion fallback:', err);
    } finally {
      setIsGeneratingSuggestion(false);
    }
  };

  // Accept AI Suggested Replacement
  const handleAcceptSuggestion = () => {
    if (!aiSuggestion || !activeTrip) return;

    const newNode: LocationNode = {
      id: `ai-suggest-${Date.now()}`,
      name: aiSuggestion.placeName,
      category: aiSuggestion.category as any,
      lat: aiSuggestion.lat,
      lng: aiSuggestion.lng,
      rating: 4.8,
      avgCostUsd: aiSuggestion.estCostUsd,
      entryFeeInr: aiSuggestion.entryFeeInr,
      crowdIndex: 20,
      weatherSensitivity: 'low',
      description: aiSuggestion.description,
      imageUrl: getInstantLocationImage(aiSuggestion.placeName),
      estimatedTimeMins: aiSuggestion.estMins,
      recommendationReason: 'Suggested by Velora AI to optimize itinerary flow.',
    };

    const updatedItinerary = activeTrip.itinerary.map((day) => {
      if (day.day !== selectedDayNum) return day;
      return { ...day, nodes: [...day.nodes, newNode] };
    });

    const updatedTrip = { ...activeTrip, itinerary: updatedItinerary, updatedAt: new Date().toISOString() };
    saveTrip(updatedTrip);
    setAiSuggestion(null);
  };

  // Manual Add New Place / Hotel / Restaurant to Itinerary
  const handleAddItemToItinerary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addName.trim() || !activeTrip) return;

    const baseLat = activeTrip.itinerary[0]?.nodes[0]?.lat || 26.9124;
    const baseLng = activeTrip.itinerary[0]?.nodes[0]?.lng || 75.7873;

    const newNode: LocationNode = {
      id: `custom-node-${Date.now()}`,
      name: addName.trim(),
      category: (addCategory === 'activity' ? 'landmark' : addCategory) as any,
      lat: baseLat + (Math.random() * 0.015 - 0.0075),
      lng: baseLng + (Math.random() * 0.015 - 0.0075),
      rating: 4.7,
      avgCostUsd: Number(addCostUsd),
      entryFeeInr: `₹${Math.round(addCostUsd * 83)} INR`,
      crowdIndex: 25,
      weatherSensitivity: 'medium',
      description: addDesc.trim() || `User added ${addCategory} in ${activeTrip.destination}.`,
      imageUrl: getInstantLocationImage(addName),
      estimatedTimeMins: Number(addEstMins),
    };

    const updatedItinerary = activeTrip.itinerary.map((day) => {
      if (day.day !== selectedDayNum) return day;
      return { ...day, nodes: [...day.nodes, newNode] };
    });

    const updatedTrip = { ...activeTrip, itinerary: updatedItinerary, updatedAt: new Date().toISOString() };
    saveTrip(updatedTrip);

    // Reset form
    setAddName('');
    setAddDesc('');
    setIsAddingItem(false);
  };

  const currentDayData = activeTrip?.itinerary?.find((d) => d.day === selectedDayNum) || activeTrip?.itinerary?.[0];
  const activeNodes = currentDayData?.nodes || [];

  return (
    <div className="space-y-6">
      {/* Top Header & Trip Selector Bar */}
      <div className="bg-slate-900/90 p-6 rounded-3xl border border-slate-800 shadow-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 backdrop-blur-md">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-black bg-[#D8F864]/20 text-[#D8F864] border border-[#D8F864]/30 uppercase tracking-widest flex items-center space-x-1 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#D8F864]" />
              <span>Velora Smart Trip Manager</span>
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {trips.length} Total Trip{trips.length !== 1 ? 's' : ''}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white mt-2 tracking-tight flex items-center space-x-2">
            <span>{activeTrip?.destination || 'Smart Itinerary Dashboard'}</span>
            {activeTrip?.country && <span className="text-slate-400 text-sm font-semibold">({activeTrip.country})</span>}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage destinations, hotels, dining spots, and calculate budgets in real time.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter Tabs */}
          <div className="bg-slate-955 p-1.5 rounded-2xl border border-slate-800 flex items-center text-xs shadow-inner">
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3.5 py-2 rounded-xl font-extrabold transition-all ${
                statusFilter === 'active' ? 'bg-[#D8F864] text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setStatusFilter('archived')}
              className={`px-3.5 py-2 rounded-xl font-extrabold transition-all ${
                statusFilter === 'archived' ? 'bg-slate-700 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Archived
            </button>
            <button
              onClick={() => setStatusFilter('cancelled')}
              className={`px-3.5 py-2 rounded-xl font-extrabold transition-all ${
                statusFilter === 'cancelled' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Cancelled
            </button>
          </div>

          <button
            onClick={onCreateNewTrip}
            className="px-4 py-2.5 rounded-xl bg-[#D8F864] hover:bg-[#cbf046] text-slate-950 font-black text-xs flex items-center space-x-2 shadow-lg shadow-[#D8F864]/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Plan New Trip</span>
          </button>
        </div>
      </div>

      {/* Trips Cards Selector Carousel */}
      {filteredTrips.length === 0 ? (
        <div className="bg-slate-900/90 p-8 text-center rounded-3xl border border-slate-800 space-y-3 shadow-2xl">
          <Compass className="w-10 h-10 text-[#D8F864] mx-auto animate-spin" style={{ animationDuration: '10s' }} />
          <h3 className="text-lg font-black text-white">No {statusFilter} trips found</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            You don't have any {statusFilter} trip itineraries right now. Click "Plan New Trip" to generate an AI-optimized itinerary!
          </p>
          <button
            onClick={onCreateNewTrip}
            className="px-5 py-2.5 rounded-xl bg-[#D8F864] hover:bg-[#cbf046] text-slate-950 font-black text-xs inline-flex items-center space-x-2 shadow-lg"
          >
            <Sparkles className="w-4 h-4" />
            <span>Create Trip Itinerary</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredTrips.map((trip) => {
            const isSelected = trip.id === activeTripId;
            const metrics = calculateTripMetrics(trip);

            return (
              <motion.div
                key={trip.id}
                whileHover={{ scale: 1.01 }}
                onClick={() => onSelectTrip(trip.id)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all relative overflow-hidden ${
                  isSelected
                    ? 'bg-slate-900 border-[#D8F864] shadow-xl shadow-[#D8F864]/10 ring-1 ring-[#D8F864]/40'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-black text-white flex items-center space-x-1.5">
                      <span>{trip.destination}</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-[#D8F864] shrink-0" />}
                    </h4>
                    <p className="text-[11px] text-slate-400 flex items-center space-x-2 mt-0.5 font-medium">
                      <span>{trip.durationDays} Days</span>
                      <span>•</span>
                      <span className="capitalize">{trip.travelStyle}</span>
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-[#D8F864]/10 text-[#D8F864] border border-[#D8F864]/30 font-mono">
                    ₹{Math.round((metrics.totalCost || 200) * 83.75).toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center space-x-3">
                    <span className="flex items-center space-x-1 font-semibold">
                      <MapPin className="w-3 h-3 text-[#D8F864]" />
                      <span>{metrics.totalPlacesCount} Places</span>
                    </span>
                    <span className="flex items-center space-x-1 font-semibold">
                      <Clock className="w-3 h-3 text-cyan-400" />
                      <span>{metrics.totalHours}h {metrics.totalMins}m</span>
                    </span>
                  </div>

                  <span className={`text-[10px] font-extrabold uppercase ${
                    trip.status === 'active' ? 'text-[#D8F864]' : trip.status === 'archived' ? 'text-slate-400' : 'text-rose-400'
                  }`}>
                    {trip.status}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Selected Trip Detail Workspace */}
      {activeTrip && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Itinerary Day Navigator & Spot List (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Trip Status & Budget Summary Header */}
            <div className="bg-slate-900/90 p-6 rounded-3xl border border-slate-800 shadow-2xl space-y-4 backdrop-blur-md">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-black text-white tracking-tight">Itinerary Overview</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#D8F864]/10 text-[#D8F864] border border-[#D8F864]/20 uppercase">
                    Real-time Auto Calculated
                  </span>
                </div>

                {/* Status management buttons */}
                <div className="flex items-center space-x-1">
                  {activeTrip.status === 'active' ? (
                    <>
                      <button
                        onClick={() => handleStatusChange('archived')}
                        title="Archive Trip"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center space-x-1 border border-slate-700 font-bold"
                      >
                        <Archive className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Archive</span>
                      </button>
                      <button
                        onClick={() => handleStatusChange('cancelled')}
                        title="Cancel Trip"
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs flex items-center space-x-1 border border-rose-500/30 font-bold"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Cancel</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleStatusChange('active')}
                      title="Restore Trip"
                      className="px-3 py-1.5 rounded-xl bg-[#D8F864] text-slate-950 font-black text-xs flex items-center space-x-1 shadow-md"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restore Trip</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleDeleteTrip(activeTrip.id)}
                    title="Delete Trip"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Real-time Recalculated Metric Widgets */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-955 border border-slate-800 text-center shadow-inner">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Calculated Cost</p>
                  <p className="text-base sm:text-xl font-black text-[#D8F864] mt-0.5 font-mono">
                    ₹{Math.round(currentMetrics.totalCost * 83.75).toLocaleString('en-IN')}
                  </p>
                  <p className="text-[9px] text-slate-400 font-mono">
                    (~${currentMetrics.totalCost} USD)
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-955 border border-slate-800 text-center shadow-inner">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Duration</p>
                  <p className="text-base sm:text-xl font-black text-cyan-400 mt-0.5">
                    {currentMetrics.totalHours}h {currentMetrics.totalMins}m
                  </p>
                  <p className="text-[9px] text-slate-400 font-mono">Visiting & Transit</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-955 border border-slate-800 text-center shadow-inner">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Target Budget</p>
                  <p className="text-base sm:text-xl font-black text-white mt-0.5 font-mono">
                    ₹{Math.round((activeTrip.totalBudgetUsd || 500) * 83.75).toLocaleString('en-IN')}
                  </p>
                  <p className={`text-[9px] font-black uppercase ${
                    currentMetrics.totalCost > activeTrip.totalBudgetUsd ? 'text-rose-400' : 'text-[#D8F864]'
                  }`}>
                    {currentMetrics.totalCost > activeTrip.totalBudgetUsd ? 'Over Budget' : 'Within Budget'}
                  </p>
                </div>
              </div>

              {/* Day Tab Switcher */}
              <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pt-1">
                {activeTrip.itinerary?.map((day) => (
                  <button
                    key={day.day}
                    onClick={() => setSelectedDayNum(day.day)}
                    className={`px-3.5 py-2.5 rounded-xl text-xs font-black whitespace-nowrap transition-all flex items-center space-x-1.5 ${
                      selectedDayNum === day.day
                        ? 'bg-[#D8F864] text-slate-950 shadow-lg shadow-[#D8F864]/20'
                        : 'bg-slate-955 text-slate-300 hover:text-white border border-slate-800'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Day {day.day}</span>
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-slate-950/60 text-slate-200">
                      {day.nodes?.length || 0}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* AI Replacement Suggestion Banner (if available) */}
            <AnimatePresence>
              {aiSuggestion && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 bg-gradient-to-r from-emerald-950/90 via-slate-900 to-teal-950/90 border border-[#D8F864]/40 rounded-3xl space-y-2 shadow-2xl"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-xs font-black text-[#D8F864]">
                      <Sparkles className="w-4 h-4" />
                      <span>Velora AI Recommended Replacement</span>
                    </div>
                    <button
                      onClick={() => setAiSuggestion(null)}
                      className="text-slate-400 hover:text-white text-xs font-bold"
                    >
                      Dismiss
                    </button>
                  </div>

                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h5 className="text-sm font-black text-white">{aiSuggestion.placeName}</h5>
                      <p className="text-xs text-slate-300 mt-0.5">{aiSuggestion.description}</p>
                      <div className="flex items-center space-x-3 text-[11px] text-slate-400 mt-2">
                        <span className="text-[#D8F864] font-bold">${aiSuggestion.estCostUsd} USD</span>
                        <span>•</span>
                        <span>{aiSuggestion.estMins} mins</span>
                        <span>•</span>
                        <span className="text-amber-300">{aiSuggestion.entryFeeInr}</span>
                      </div>
                    </div>

                    <button
                      onClick={handleAcceptSuggestion}
                      className="px-3.5 py-2 bg-[#D8F864] hover:bg-[#cbf046] text-slate-950 font-black text-xs rounded-xl shadow-lg shrink-0"
                    >
                      Add to Day {selectedDayNum}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Day Spots List with Reordering Controls */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <h4 className="text-sm font-black text-white">
                    Day {selectedDayNum}: {currentDayData?.title || 'Destinations'}
                  </h4>
                </div>

                <button
                  onClick={() => setIsAddingItem(true)}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-[#D8F864] font-extrabold text-xs border border-slate-800 flex items-center space-x-1.5 shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Place / Hotel / Dining</span>
                </button>
              </div>

              {/* Add Item Form Modal / Drawer */}
              {isAddingItem && (
                <form onSubmit={handleAddItemToItinerary} className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-3.5 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                    <h5 className="text-xs font-black text-white flex items-center space-x-1.5">
                      <Plus className="w-4 h-4 text-[#D8F864]" />
                      <span>Add Spot to Day {selectedDayNum}</span>
                    </h5>
                    <button
                      type="button"
                      onClick={() => setIsAddingItem(false)}
                      className="text-slate-400 hover:text-white text-xs font-bold"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Category</label>
                      <select
                        value={addCategory}
                        onChange={(e) => setAddCategory(e.target.value as any)}
                        className="w-full bg-slate-955 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D8F864]"
                      >
                        <option value="landmark">Attraction / Heritage</option>
                        <option value="hotel">Hotel / Stay</option>
                        <option value="restaurant">Restaurant / Dining</option>
                        <option value="activity">Activity / Adventure</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Place Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Amber Fort Cafe or Taj Hotel"
                        value={addName}
                        onChange={(e) => setAddName(e.target.value)}
                        className="w-full bg-slate-955 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D8F864]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Cost ($ USD)</label>
                      <input
                        type="number"
                        min="0"
                        value={addCostUsd}
                        onChange={(e) => setAddCostUsd(Number(e.target.value))}
                        className="w-full bg-slate-955 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D8F864]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Est. Duration (Mins)</label>
                      <input
                        type="number"
                        min="15"
                        value={addEstMins}
                        onChange={(e) => setAddEstMins(Number(e.target.value))}
                        className="w-full bg-slate-955 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D8F864]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#D8F864] hover:bg-[#cbf046] text-slate-950 font-black text-xs rounded-xl shadow-md transition-all"
                  >
                    Confirm & Add to Itinerary
                  </button>
                </form>
              )}

              {/* List of Spot Cards */}
              <div className="space-y-2.5">
                {activeNodes.length === 0 ? (
                  <div className="p-6 text-center bg-slate-900/90 border border-slate-800 rounded-2xl text-slate-300 text-xs font-semibold shadow-md">
                    No places added for Day {selectedDayNum} yet. Click "Add Place / Hotel / Dining" above to populate your itinerary!
                  </div>
                ) : (
                  activeNodes.map((node, index) => {
                    const isSelected = selectedNode?.id === node.id;

                    return (
                      <div
                        key={node.id || index}
                        className={`p-3.5 rounded-2xl border transition-all ${
                          isSelected
                            ? 'bg-slate-900 border-[#D8F864] ring-1 ring-[#D8F864]/30 shadow-lg'
                            : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start space-x-3 cursor-pointer" onClick={() => setSelectedNode(node)}>
                            <div className="w-12 h-12 rounded-xl bg-slate-955 border border-slate-800 overflow-hidden shrink-0 relative">
                              <img
                                src={node.imageUrl || getInstantLocationImage(node.name)}
                                alt={node.name}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute top-0.5 left-0.5 px-1.5 py-0.2 bg-slate-950/90 text-[8px] font-black text-[#D8F864] rounded">
                                #{index + 1}
                              </div>
                            </div>

                            <div className="space-y-0.5">
                              <h5 className="text-xs font-black text-white hover:text-[#D8F864] transition-colors">
                                {node.name}
                              </h5>
                              <p className="text-[11px] text-slate-300 line-clamp-1">{node.description}</p>
                              <div className="flex items-center space-x-2 text-[10px] text-slate-400 pt-0.5">
                                <span className="text-[#D8F864] font-bold">${node.avgCostUsd} USD</span>
                                <span>•</span>
                                <span>{node.estimatedTimeMins} Mins</span>
                                <span>•</span>
                                <span className="text-amber-300 font-medium">{node.entryFeeInr}</span>
                              </div>
                            </div>
                          </div>

                          {/* Reordering & Remove Controls */}
                          <div className="flex items-center space-x-1 shrink-0">
                            <button
                              onClick={() => handleMovePlace(selectedDayNum, index, 'up')}
                              disabled={index === 0}
                              title="Move Up"
                              className="p-1 rounded-lg bg-slate-955 hover:bg-slate-800 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed border border-slate-800"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleMovePlace(selectedDayNum, index, 'down')}
                              disabled={index === activeNodes.length - 1}
                              title="Move Down"
                              className="p-1 rounded-lg bg-slate-955 hover:bg-slate-800 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed border border-slate-800"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => setReviewModalPlace(node.name)}
                              title="Community Reviews & Upload Photos"
                              className="p-1.5 rounded-lg bg-[#D8F864]/10 hover:bg-[#D8F864]/20 text-[#D8F864] border border-[#D8F864]/20 text-xs font-bold"
                            >
                              <Camera className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleRemovePlace(selectedDayNum, index, node.name)}
                              title="Remove Spot"
                              className="p-1 rounded-lg hover:bg-rose-500/10 text-slate-500 hover:text-rose-400"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Spot Inspector & Full Map Dashboard Launcher (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Launch Full Map Dashboard Card */}
            <div className="bg-slate-900/90 p-6 rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-slate-900 via-slate-950 to-cyan-950/40 space-y-4 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-9 h-9 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white">Full Map Dashboard</h4>
                    <p className="text-[11px] text-slate-400 font-mono">Interactive OpenStreetMap & OSRM Engine</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {activeNodes.length} Waypoints
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Explore <strong className="text-white">{activeTrip?.destination}</strong> with full-screen map enlargement, live voice search, category filters, real-time route calculations, and local place highlights.
              </p>

              {onNavigateToMap && (
                <button
                  type="button"
                  onClick={onNavigateToMap}
                  className="w-full py-3.5 px-4 bg-[#D8F864] hover:bg-[#cbf046] text-slate-950 font-black text-xs rounded-2xl shadow-xl shadow-[#D8F864]/20 flex items-center justify-center space-x-2 transition-all group"
                >
                  <Maximize2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>Open Interactive Map Dashboard</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Inspected Node & Spot Details Card */}
            <div className="bg-slate-900/90 p-5 rounded-3xl border border-slate-800 space-y-3.5 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <h4 className="text-xs font-black text-white flex items-center space-x-1.5">
                  <Compass className="w-4 h-4 text-[#D8F864]" />
                  <span>Spot Inspector & Details</span>
                </h4>
                <span className="text-[10px] text-slate-400 font-mono font-bold">Day {selectedDayNum}</span>
              </div>

              {selectedNode ? (
                <div className="p-4 bg-slate-955 border border-slate-800 rounded-2xl space-y-3 shadow-inner">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black text-[#D8F864] bg-[#D8F864]/10 border border-[#D8F864]/20 uppercase tracking-wider">
                      {selectedNode.category}
                    </span>
                    <button
                      type="button"
                      onClick={() => setReviewModalPlace(selectedNode.name)}
                      className="text-[11px] text-cyan-400 hover:underline flex items-center space-x-1 font-bold"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Photos & Reviews</span>
                    </button>
                  </div>

                  <h5 className="text-sm font-black text-white">{selectedNode.name}</h5>
                  <p className="text-xs text-slate-300 leading-normal">{selectedNode.description}</p>

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-800/80">
                    <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Estimated Cost</span>
                      <strong className="text-[#D8F864] font-mono text-xs">${selectedNode.avgCostUsd} USD</strong>
                    </div>
                    <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Ticket / Entry</span>
                      <strong className="text-amber-300 font-mono text-xs">{selectedNode.entryFeeInr || 'Free'}</strong>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center bg-slate-955 border border-slate-800 rounded-2xl space-y-1 shadow-inner">
                  <p className="text-xs font-black text-slate-200">No spot selected</p>
                  <p className="text-[11px] text-slate-400">
                    Click any place card in the Day {selectedDayNum} list to inspect budget details, tickets, and community photos.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Community Gallery / Review Modal */}
      {reviewModalPlace && (
        <CommunityPlaceModal
          isOpen={true}
          locationName={reviewModalPlace}
          onClose={() => setReviewModalPlace(null)}
          initialTab="gallery"
        />
      )}
    </div>
  );
};
