import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MapPin,
  Download,
  Search,
  Sparkles,
  Compass,
  CheckCircle2,
  Navigation,
  BookOpen,
  Building,
  Grid,
  List,
  Eye,
  Star,
  Maximize2,
  X,
  Volume2,
  VolumeX,
  Camera,
  Layers,
  Landmark,
  ArrowRight,
  Filter,
  Check,
  BedDouble,
  UtensilsCrossed,
  Palmtree,
  Trees,
  SlidersHorizontal,
  Map as MapIcon,
  Heart,
  Share2,
  Calendar,
  DollarSign,
  ShieldAlert,
  Ticket
} from 'lucide-react';
import { FAMOUS_INDIAN_STATES_DATA, PlaceDetail, StateTourismRecord } from '../data/famousIndianStatesData';
import { ALL_INDIAN_HOTELS, IndianHotelRecord } from '../data/indianHotelsDataset';
import { ALL_INDIAN_RESTAURANTS, IndianRestaurantRecord } from '../data/indianRestaurantsDataset';
import { generateFamousPlacesPdf } from '../utils/pdfExportGenerator';
import { AuthenticImage } from './AuthenticImage';
import { EditorialCard } from './EditorialCard';
import { CinematicHero, EditorialSection, VisualIndex } from './layout';
import { prefetchBatchWikiPhotos } from '../services/wikiPhotoFetcher';

interface IndianStatesGuideHubProps {
  onSelectDestinationForMap: (destQuery: string) => void;
  onNavigateToPlanner: (destQuery: string) => void;
}

type ExploreTab = 'regions' | 'places' | 'hotels' | 'restaurants' | 'activities';
type DisplayLayout = 'cards' | 'map';
type RegionTypeFilter = 'all' | 'states' | 'uts';

export const IndianStatesGuideHub: React.FC<IndianStatesGuideHubProps> = ({
  onSelectDestinationForMap,
  onNavigateToPlanner,
}) => {
  // Main Explore Tabs
  const [activeTab, setActiveTab] = useState<ExploreTab>('regions');
  const [displayLayout, setDisplayLayout] = useState<DisplayLayout>('cards');
  const [regionTypeFilter, setRegionTypeFilter] = useState<RegionTypeFilter>('all');
  const [selectedStateId, setSelectedStateId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Advanced Filter State
  const [showFilterDrawer, setShowFilterDrawer] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBudget, setSelectedBudget] = useState<string>('all'); // all, low, mid, luxury
  const [minRating, setMinRating] = useState<number>(0);
  const [familyFriendlyOnly, setFamilyFriendlyOnly] = useState<boolean>(false);
  const [selectedSeason, setSelectedSeason] = useState<string>('all'); // all, winter, summer, monsoon

  // Favorites state
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  // Modals
  const [activePlaceModal, setActivePlaceModal] = useState<{ place: PlaceDetail; stateName: string } | null>(null);
  const [activeRegionModal, setActiveRegionModal] = useState<StateTourismRecord | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<'places' | 'hotels' | 'restaurants' | 'events'>('places');
  const [shareToast, setShareToast] = useState<string | null>(null);

  // Prefetch high-res Wikipedia photos for all postcards on mount
  useEffect(() => {
    prefetchBatchWikiPhotos();
  }, []);

  // PDF Export
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [pdfSuccessMessage, setPdfSuccessMessage] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleShare = (title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}/?dest=${encodeURIComponent(title)}`);
      setShareToast(`Copied link for ${title} to clipboard!`);
      setTimeout(() => setShareToast(null), 3000);
    }
  };

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    setPdfSuccessMessage(null);
    try {
      await generateFamousPlacesPdf();
      setPdfSuccessMessage('PDF successfully generated: famous_places_india.pdf');
      setTimeout(() => setPdfSuccessMessage(null), 6000);
    } catch (err) {
      console.error('PDF Generation failed:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const isUTRecord = (st: StateTourismRecord) =>
    st.type === 'Union Territory' || st.type === 'UT' || st.stateNum > 28;

  // Active filter count calculation
  // AI Parsed Filter State
  const [aiParsedFilter, setAiParsedFilter] = useState<{
    prompt: string;
    category?: string;
    stateName?: string;
    stateId?: string;
    budget?: string;
    minRating?: number;
    familyFriendly?: boolean;
    keywords: string[];
  } | null>(null);

  const activeFiltersCount = [
    regionTypeFilter !== 'all',
    selectedStateId !== 'all',
    selectedCategory !== 'all',
    selectedBudget !== 'all',
    minRating > 0,
    familyFriendlyOnly,
    selectedSeason !== 'all',
    !!aiParsedFilter
  ].filter(Boolean).length;

  const clearAllFilters = () => {
    setRegionTypeFilter('all');
    setSelectedStateId('all');
    setSelectedCategory('all');
    setSelectedBudget('all');
    setMinRating(0);
    setFamilyFriendlyOnly(false);
    setSelectedSeason('all');
    setSearchQuery('');
    setAiParsedFilter(null);
  };

  // AI Smart Filter Natural Language Processor
  const handleAISmartFilter = (prompt: string) => {
    if (!prompt.trim()) {
      clearAllFilters();
      return;
    }

    const lower = prompt.toLowerCase().trim();
    clearAllFilters();
    setSearchQuery(prompt);

    let parsedCategory: string | undefined = undefined;
    let parsedStateId: string | undefined = undefined;
    let parsedStateName: string | undefined = undefined;
    let parsedBudget: string | undefined = undefined;
    let parsedMinRating: number | undefined = undefined;
    let parsedFamily: boolean | undefined = undefined;

    // 1. Detect Category
    if (lower.includes('waterfall') || lower.includes('nature') || lower.includes('peaceful') || lower.includes('lake') || lower.includes('river') || lower.includes('valley')) {
      parsedCategory = 'Nature';
      setSelectedCategory('Nature');
    } else if (lower.includes('beach') || lower.includes('coastal') || lower.includes('sea') || lower.includes('island')) {
      parsedCategory = 'Beaches';
      setSelectedCategory('Beaches');
    } else if (lower.includes('fort') || lower.includes('temple') || lower.includes('heritage') || lower.includes('palace') || lower.includes('spiritual') || lower.includes('shrine')) {
      parsedCategory = 'Heritage';
      setSelectedCategory('Heritage');
    } else if (lower.includes('hill') || lower.includes('mountain') || lower.includes('trek') || lower.includes('snow') || lower.includes('viewpoint')) {
      parsedCategory = 'Hill Stations';
      setSelectedCategory('Hill Stations');
    }

    // 2. Detect Budget
    if (lower.includes('low budget') || lower.includes('cheap') || lower.includes('pocket friendly') || lower.includes('under 3000') || lower.includes('budget')) {
      parsedBudget = 'low';
      setSelectedBudget('low');
    } else if (lower.includes('luxury') || lower.includes('5-star') || lower.includes('5 star') || lower.includes('resort') || lower.includes('premium')) {
      parsedBudget = 'luxury';
      setSelectedBudget('luxury');
    } else if (lower.includes('mid') || lower.includes('moderate')) {
      parsedBudget = 'mid';
      setSelectedBudget('mid');
    }

    // 3. Detect Rating / Quality
    if (lower.includes('less crowd') || lower.includes('family') || lower.includes('top rated') || lower.includes('best') || lower.includes('peaceful') || lower.includes('popular')) {
      parsedMinRating = 4.5;
      setMinRating(4.5);
    }

    // 4. Detect Family
    if (lower.includes('family') || lower.includes('kids') || lower.includes('children')) {
      parsedFamily = true;
      setFamilyFriendlyOnly(true);
    }

    // 5. Detect State Name in query
    for (const st of FAMOUS_INDIAN_STATES_DATA) {
      const stateClean = st.state.toLowerCase().replace(/^\d+\.\s*/, '');
      if (lower.includes(stateClean) || lower.includes(st.id.toLowerCase())) {
        parsedStateId = st.id;
        parsedStateName = st.state;
        setSelectedStateId(st.id);
        break;
      }
    }

    // 6. Extract key content tokens
    const stopWords = new Set(['show', 'me', 'a', 'an', 'the', 'with', 'and', 'in', 'for', 'of', 'to', 'places', 'place', 'destinations', 'destination', 'spots', 'spot', 'some', 'any', 'that', 'have', 'are', 'find', 'get']);
    const tokens = lower
      .replace(/[^\w\s]/gi, '')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !stopWords.has(w));

    setAiParsedFilter({
      prompt,
      category: parsedCategory,
      stateName: parsedStateName,
      stateId: parsedStateId,
      budget: parsedBudget,
      minRating: parsedMinRating,
      familyFriendly: parsedFamily,
      keywords: tokens
    });
  };

  // Collect all unique categories across all places
  const categories = Array.from(
    new Set(
      FAMOUS_INDIAN_STATES_DATA.flatMap((st) => st.places.map((p) => p.category))
    )
  );

  // Flattened all places with state/UT metadata
  const allPlacesWithState = FAMOUS_INDIAN_STATES_DATA.flatMap((st) =>
    st.places.map((p) => ({
      ...p,
      stateId: st.id,
      stateName: st.state,
      stateNum: st.stateNum,
      isUT: isUTRecord(st),
    }))
  );

  // Filtered Regions (States & UTs)
  const filteredRegions = FAMOUS_INDIAN_STATES_DATA.filter((st) => {
    const isUT = isUTRecord(st);
    if (regionTypeFilter === 'states' && isUT) return false;
    if (regionTypeFilter === 'uts' && !isUT) return false;

    const matchesState = selectedStateId === 'all' || st.id === selectedStateId;
    if (!searchQuery.trim() && selectedCategory === 'all' && minRating === 0) return matchesState;

    if (aiParsedFilter && aiParsedFilter.keywords.length > 0) {
      const text = `${st.state} ${st.description}`.toLowerCase();
      const matchesKW = aiParsedFilter.keywords.some((kw) => text.includes(kw));
      return matchesState && matchesKW;
    }

    const q = searchQuery.toLowerCase();
    const regionNameMatch = st.state.toLowerCase().includes(q) || st.description.toLowerCase().includes(q);
    const placeMatch = st.places.some(
      (p) =>
        (selectedCategory === 'all' || p.category === selectedCategory) &&
        (minRating === 0 || p.rating >= minRating) &&
        (!q || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.category.toLowerCase().includes(q))
    );

    return matchesState && (regionNameMatch || placeMatch);
  });

  // Filtered Places
  const filteredPlaces = allPlacesWithState.filter((item) => {
    if (regionTypeFilter === 'states' && item.isUT) return false;
    if (regionTypeFilter === 'uts' && !item.isUT) return false;

    const matchesState = selectedStateId === 'all' || item.stateId === selectedStateId;
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesRating = minRating === 0 || item.rating >= minRating;

    if (!searchQuery.trim()) return matchesState && matchesCategory && matchesRating;

    if (aiParsedFilter && aiParsedFilter.keywords.length > 0) {
      const text = `${item.name} ${item.stateName} ${item.category} ${item.description}`.toLowerCase();
      const matchesKW = aiParsedFilter.keywords.some((kw) => text.includes(kw));
      return matchesState && matchesCategory && matchesRating && matchesKW;
    }

    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      item.name.toLowerCase().includes(q) ||
      item.stateName.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q);

    return matchesState && matchesCategory && matchesRating && matchesQuery;
  });

  // Filtered Hotels
  const filteredHotels = ALL_INDIAN_HOTELS.filter((hotel) => {
    const q = searchQuery.toLowerCase().trim();
    let matchesSearch = true;

    if (aiParsedFilter && aiParsedFilter.keywords.length > 0) {
      const text = `${hotel.name} ${hotel.city} ${hotel.features.join(' ')}`.toLowerCase();
      matchesSearch = aiParsedFilter.keywords.some((kw) => text.includes(kw));
    } else if (q) {
      matchesSearch = hotel.name.toLowerCase().includes(q) || hotel.city.toLowerCase().includes(q) || hotel.features.some(f => f.toLowerCase().includes(q));
    }

    const matchesRating = minRating === 0 || hotel.rating >= minRating;
    
    let matchesBudget = true;
    if (selectedBudget === 'low') matchesBudget = hotel.priceInr < 3000;
    if (selectedBudget === 'mid') matchesBudget = hotel.priceInr >= 3000 && hotel.priceInr <= 7000;
    if (selectedBudget === 'luxury') matchesBudget = hotel.priceInr > 7000;

    return matchesSearch && matchesRating && matchesBudget;
  });

  // Filtered Restaurants
  const filteredRestaurants = ALL_INDIAN_RESTAURANTS.filter((rst) => {
    const q = searchQuery.toLowerCase().trim();
    let matchesSearch = true;

    if (aiParsedFilter && aiParsedFilter.keywords.length > 0) {
      const text = `${rst.name} ${rst.city} ${rst.locality} ${rst.cuisines.join(' ')}`.toLowerCase();
      matchesSearch = aiParsedFilter.keywords.some((kw) => text.includes(kw));
    } else if (q) {
      matchesSearch = rst.name.toLowerCase().includes(q) || rst.city.toLowerCase().includes(q) || rst.locality.toLowerCase().includes(q) || rst.cuisines.some(c => c.toLowerCase().includes(q));
    }

    const matchesRating = minRating === 0 || rst.rating >= minRating;

    return matchesSearch && matchesRating;
  });

  const toggleSpeech = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const closeModal = () => {
    if (isSpeaking && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    setActivePlaceModal(null);
    setActiveRegionModal(null);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {shareToast && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white font-bold text-xs px-4 py-2.5 rounded-full shadow-2xl border border-slate-700 animate-bounce">
          {shareToast}
        </div>
      )}

      {/* Cinematic Hero Section */}
      <CinematicHero
        badge={{ label: 'Explore All 28 States & 8 Union Territories', icon: Compass, variant: 'lime' }}
        subtitle="Velora Atlas 2026 • Verified Regional Catalog"
        title="Discover Destinations Across India"
        description="Explore 36 distinct regions, world-wonder ASI monuments, luxury heritage stays, authentic regional dining, and curated local travel experiences."
        backgroundImageUrl="https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1920&q=80"
        metrics={[
          { label: 'Regions', value: '36 States & UTs', icon: Layers },
          { label: 'Attractions', value: '100+ Spotlights', icon: MapPin },
          { label: 'Stays & Dining', value: '800+ Verified', icon: BedDouble },
        ]}
        actions={
          <button
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="bg-[#D8F864] hover:bg-[#cbe352] text-slate-950 font-black px-6 py-3.5 rounded-full text-xs flex items-center justify-center space-x-2 transition-all shadow-xl hover:scale-105 active:scale-95 disabled:opacity-50"
            title="Export PDF report for all 36 regions"
          >
            {isGeneratingPdf ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Generating Atlas PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-slate-950" />
                <span>Download 36 Regions PDF</span>
              </>
            )}
          </button>
        }
      >
        {pdfSuccessMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-emerald-300 text-xs font-bold flex items-center space-x-2 backdrop-blur-md"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{pdfSuccessMessage}</span>
          </motion.div>
        )}
      </CinematicHero>

      {/* Main Control Hub: Global Search, Sub-Nav Tabs, Filter Drawer Toggle, Map/Card Toggle */}
      <div className="bg-white/90 backdrop-blur-md border border-slate-200 rounded-[28px] p-4 sm:p-5 shadow-sm space-y-4">
        {/* Row 1: AI Smart Natural Language Filter Input */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1 group">
            <Sparkles className="w-4 h-4 text-emerald-600 absolute left-4 top-1/2 -translate-y-1/2 animate-pulse" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAISmartFilter(searchQuery);
              }}
              placeholder="Ask AI Filter: e.g. 'Show me peaceful hill stations with waterfalls', 'cheap luxury resorts in Goa'..."
              className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-full pl-11 pr-28 py-3 text-xs sm:text-sm font-semibold text-slate-900 outline-none transition-all placeholder-slate-400 shadow-inner"
            />
            {searchQuery ? (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                <button
                  onClick={() => clearAllFilters()}
                  className="text-slate-400 hover:text-slate-900 p-1"
                  title="Clear Query"
                >
                  <X className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleAISmartFilter(searchQuery)}
                  className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-[11px] px-3 py-1.5 rounded-full flex items-center space-x-1 shadow-sm transition-all"
                >
                  <span>Parse AI</span>
                  <Sparkles className="w-3 h-3 text-slate-950" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleAISmartFilter("Show me peaceful hill stations with waterfalls")}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-slate-900 hover:bg-black text-[#D8F864] font-black text-[10px] px-3 py-1.5 rounded-full flex items-center space-x-1 shadow-sm transition-all"
              >
                <span>Try Prompt</span>
                <Sparkles className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Filter Drawer Toggle */}
          <button
            onClick={() => setShowFilterDrawer(true)}
            className={`relative px-4 py-3 rounded-full text-xs font-extrabold flex items-center justify-center space-x-2 border transition-all shrink-0 ${
              activeFiltersCount > 0
                ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Smart Filters</span>
            {activeFiltersCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#D8F864] text-slate-950 font-black text-[10px] flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Card vs Map View Toggle */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-full border border-slate-200 shrink-0">
            <button
              onClick={() => setDisplayLayout('cards')}
              className={`px-3.5 py-2 rounded-full text-xs font-black flex items-center space-x-1.5 transition-all ${
                displayLayout === 'cards'
                  ? 'bg-[#D8F864] text-slate-950 shadow-sm'
                  : 'text-slate-700 hover:text-slate-950'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>
            <button
              onClick={() => setDisplayLayout('map')}
              className={`px-3.5 py-2 rounded-full text-xs font-black flex items-center space-x-1.5 transition-all ${
                displayLayout === 'map'
                  ? 'bg-[#D8F864] text-slate-950 shadow-sm'
                  : 'text-slate-700 hover:text-slate-950'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Map</span>
            </button>
          </div>
        </div>

        {/* Row 1.5: AI Smart Filter Quick Prompt Presets */}
        <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar pt-2 border-t border-slate-100 text-[11px]">
          <div className="flex items-center space-x-1 font-black text-slate-400 uppercase text-[10px] shrink-0 mr-1">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            <span>AI Prompts:</span>
          </div>
          {[
            'Show me peaceful hill stations with waterfalls, low budget and less crowd.',
            'Luxury 5-star resorts in Goa with beaches and water sports',
            'Heritage forts & spiritual temples in Rajasthan for family',
            'Cool mountain destinations with tea gardens & scenic views'
          ].map((prompt) => (
            <button
              key={prompt}
              onClick={() => handleAISmartFilter(prompt)}
              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold px-3 py-1 rounded-full whitespace-nowrap transition-all border border-emerald-200 shrink-0 flex items-center space-x-1"
            >
              <Sparkles className="w-3 h-3 text-emerald-600" />
              <span>"{prompt}"</span>
            </button>
          ))}
        </div>

        {/* AI Parsed Active Filter Banner Breakdown */}
        {aiParsedFilter && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-3.5 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 rounded-2xl text-white border border-emerald-500/40 shadow-lg space-y-2"
          >
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2 font-black text-emerald-400">
                <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" />
                <span>AI Smart Filter Active</span>
                <span className="text-slate-400 font-mono font-normal text-[11px]">"{aiParsedFilter.prompt}"</span>
              </div>

              <button
                onClick={clearAllFilters}
                className="text-slate-300 hover:text-white text-[11px] font-bold flex items-center space-x-1 underline"
              >
                <span>Reset AI Filter</span>
                <X className="w-3 h-3" />
              </button>
            </div>

            <div className="flex items-center flex-wrap gap-1.5 text-[10px] font-bold">
              <span className="text-slate-400 uppercase tracking-wider font-extrabold mr-1">Parsed Criteria:</span>
              {aiParsedFilter.category && (
                <span className="bg-emerald-400/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full">
                  🏷️ Category: {aiParsedFilter.category}
                </span>
              )}
              {aiParsedFilter.stateName && (
                <span className="bg-cyan-400/20 text-cyan-300 border border-cyan-500/40 px-2.5 py-0.5 rounded-full">
                  📍 State: {aiParsedFilter.stateName}
                </span>
              )}
              {aiParsedFilter.minRating && (
                <span className="bg-amber-400/20 text-amber-300 border border-amber-500/40 px-2.5 py-0.5 rounded-full">
                  ⭐ Rating: {aiParsedFilter.minRating}+
                </span>
              )}
              {aiParsedFilter.budget && (
                <span className="bg-purple-400/20 text-purple-300 border border-purple-500/40 px-2.5 py-0.5 rounded-full">
                  💰 Budget: {aiParsedFilter.budget}
                </span>
              )}
              {aiParsedFilter.familyFriendly && (
                <span className="bg-rose-400/20 text-rose-300 border border-rose-500/40 px-2.5 py-0.5 rounded-full">
                  👨‍👩‍👧 Family Friendly
                </span>
              )}
              {aiParsedFilter.keywords.length > 0 && (
                <span className="bg-white/10 text-slate-200 border border-white/20 px-2.5 py-0.5 rounded-full">
                  🔍 Tokens: {aiParsedFilter.keywords.slice(0, 4).join(', ')}
                </span>
              )}
            </div>
          </motion.div>
        )}

        {/* Row 2: Sub-Nav Tabs for Explore */}
        <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pt-2 border-t border-slate-100">
          {[
            { id: 'regions', label: 'All 36 Regions', icon: Layers, count: filteredRegions.length },
            { id: 'places', label: 'Places & Attractions', icon: MapPin, count: filteredPlaces.length },
            { id: 'hotels', label: 'Hotels & Resorts', icon: BedDouble, count: filteredHotels.length },
            { id: 'restaurants', label: 'Restaurants & Dining', icon: UtensilsCrossed, count: filteredRestaurants.length },
            { id: 'activities', label: 'Activities & Experiences', icon: Ticket, count: 24 }
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ExploreTab)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full text-xs font-extrabold transition-all shrink-0 border ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-[#D8F864]' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Removable Active Filter Chips Bar */}
        {activeFiltersCount > 0 && (
          <div className="flex items-center flex-wrap gap-2 pt-2 border-t border-slate-100 text-xs">
            <span className="font-extrabold text-slate-400 text-[11px] uppercase">Active Filters:</span>
            {regionTypeFilter !== 'all' && (
              <span className="bg-slate-100 text-slate-800 font-bold px-3 py-1 rounded-full flex items-center space-x-1">
                <span>{regionTypeFilter === 'states' ? '28 States' : '8 Union Territories'}</span>
                <X className="w-3 h-3 cursor-pointer hover:text-rose-600" onClick={() => setRegionTypeFilter('all')} />
              </span>
            )}
            {selectedCategory !== 'all' && (
              <span className="bg-slate-100 text-slate-800 font-bold px-3 py-1 rounded-full flex items-center space-x-1">
                <span>Category: {selectedCategory}</span>
                <X className="w-3 h-3 cursor-pointer hover:text-rose-600" onClick={() => setSelectedCategory('all')} />
              </span>
            )}
            {minRating > 0 && (
              <span className="bg-slate-100 text-slate-800 font-bold px-3 py-1 rounded-full flex items-center space-x-1">
                <span>{minRating}+ ⭐</span>
                <X className="w-3 h-3 cursor-pointer hover:text-rose-600" onClick={() => setMinRating(0)} />
              </span>
            )}
            {selectedBudget !== 'all' && (
              <span className="bg-slate-100 text-slate-800 font-bold px-3 py-1 rounded-full flex items-center space-x-1">
                <span>Budget: {selectedBudget}</span>
                <X className="w-3 h-3 cursor-pointer hover:text-rose-600" onClick={() => setSelectedBudget('all')} />
              </span>
            )}

            <button
              onClick={clearAllFilters}
              className="text-rose-600 font-extrabold hover:underline text-xs ml-auto"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* MAP VIEW OVERLAY */}
      {displayLayout === 'map' && (
        <div className="bg-white rounded-[32px] p-6 border border-slate-200 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-slate-900 flex items-center space-x-2">
              <MapIcon className="w-5 h-5 text-emerald-600" />
              <span>Interactive Map View (All Places & Services)</span>
            </h3>

            <button
              onClick={() => onSelectDestinationForMap(searchQuery || 'Kerala')}
              className="bg-[#D8F864] text-slate-950 font-black px-4 py-2 rounded-full text-xs hover:bg-[#cbe352]"
            >
              Open Full-screen Map →
            </button>
          </div>

          <div className="h-[450px] rounded-2xl overflow-hidden bg-slate-900 relative flex items-center justify-center text-white p-6">
            <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px]" />
            <div className="relative z-10 text-center space-y-3 max-w-md">
              <Compass className="w-12 h-12 text-[#D8F864] mx-auto animate-pulse" />
              <h4 className="text-xl font-black text-white">Interactive OpenStreetMap Node Active</h4>
              <p className="text-xs text-slate-300 font-medium">
                Viewing markers for filtered places, hotels, and dining spots across India. Click "Open Full-screen Map" to view turn-by-turn route simulations.
              </p>
              <button
                onClick={() => onSelectDestinationForMap(searchQuery || 'India')}
                className="bg-[#D8F864] text-slate-950 font-extrabold px-5 py-2.5 rounded-full text-xs shadow-lg hover:scale-105 transition-all inline-block"
              >
                Launch Geo-Explorer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CARDS DISPLAY LAYER */}
      {displayLayout === 'cards' && (
        <>
          {/* TAB 1: ALL 36 REGIONAL PHOTO CARDS (28 States & 8 UTs) */}
          {activeTab === 'regions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-extrabold text-slate-500 uppercase">Filter:</span>
                  <button
                    onClick={() => setRegionTypeFilter('all')}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                      regionTypeFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    All 36
                  </button>
                  <button
                    onClick={() => setRegionTypeFilter('states')}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                      regionTypeFilter === 'states' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    28 States
                  </button>
                  <button
                    onClick={() => setRegionTypeFilter('uts')}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                      regionTypeFilter === 'uts' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    8 Union Territories
                  </button>
                </div>

                <span className="text-xs text-slate-500 font-bold">
                  Showing {filteredRegions.length} of 36 Regions
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredRegions.map((st) => (
                  <EditorialCard
                    key={st.id}
                    st={st}
                    isFav={!!favorites[st.id]}
                    onToggleFav={toggleFavorite}
                    onShare={handleShare}
                    onExplore={(region) => {
                      setActiveRegionModal(region);
                      setActiveModalTab('places');
                    }}
                    onPlanTrip={(stateName) => onNavigateToPlanner(stateName)}
                    onViewMap={(stateName) => onSelectDestinationForMap(stateName)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: PLACES & ATTRACTIONS CARDS */}
          {activeTab === 'places' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredPlaces.map((item, idx) => (
                <motion.div
                  key={`${item.stateId}-${item.rank}-${idx}`}
                  whileHover={{ y: -6, scale: 1.015 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="bg-white rounded-[32px] border border-slate-200 hover:border-[#D8F864]/80 shadow-sm hover:shadow-2xl transition-all flex flex-col group relative"
                >
                  {/* Ambient Glow Activation Layer */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-[#D8F864]/0 via-cyan-400/0 to-[#D8F864]/0 rounded-[34px] group-hover:from-[#D8F864]/40 group-hover:via-cyan-400/30 group-hover:to-[#D8F864]/40 blur-md transition-all duration-500 opacity-0 group-hover:opacity-100 pointer-events-none" />

                  {/* Main Card Wrapper */}
                  <div className="relative w-full h-full rounded-[32px] overflow-hidden flex flex-col bg-white z-10">
                    <div className="relative h-52 overflow-hidden bg-slate-950">
                      <AuthenticImage
                        locationName={`${item.name} ${item.stateName}`}
                        altText={item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-black text-slate-950">
                        Rank #{item.rank}
                      </div>

                      <div className="absolute bottom-3 left-3 right-3 text-white">
                        <h4 className="text-base font-extrabold text-white leading-tight drop-shadow">
                          {item.name}
                        </h4>
                        <p className="text-[11px] text-slate-200 font-medium flex items-center space-x-1">
                          <MapPin className="w-3 h-3 text-[#D8F864]" />
                          <span>{item.stateName}</span>
                        </p>
                      </div>
                    </div>

                    <div className="p-4 bg-white flex-1 flex flex-col justify-between space-y-3">
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>

                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                        <div className="flex items-center space-x-1 text-amber-500 text-xs font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span>{item.rating}</span>
                        </div>

                        <button
                          onClick={() => setActivePlaceModal({ place: item, stateName: item.stateName })}
                          className="bg-[#D8F864] hover:bg-[#cbe352] text-slate-950 font-black px-3.5 py-1.5 rounded-full text-xs flex items-center space-x-1"
                        >
                          <span>Details</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* TAB 3: HOTELS & RESORTS */}
          {activeTab === 'hotels' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredHotels.map((hotel) => (
                <motion.div
                  key={hotel.id}
                  whileHover={{ y: -6, scale: 1.015 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="bg-white rounded-[28px] border border-slate-200 hover:border-emerald-400/80 shadow-sm hover:shadow-xl transition-all flex flex-col group relative"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-400/0 via-teal-300/0 to-emerald-400/0 rounded-[30px] group-hover:from-emerald-400/30 group-hover:via-teal-300/20 group-hover:to-emerald-400/30 blur-md transition-all duration-500 opacity-0 group-hover:opacity-100 pointer-events-none" />

                  <div className="relative w-full h-full rounded-[28px] p-5 bg-white z-10 flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="bg-emerald-50 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-emerald-200">
                            {hotel.starCategory || 'Hotel'}
                          </span>
                          <h4 className="text-base font-black text-slate-950 mt-1">{hotel.name}</h4>
                          <p className="text-xs text-slate-500 font-medium flex items-center space-x-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>{hotel.city}, India</span>
                          </p>
                        </div>

                        <div className="bg-amber-400/20 text-amber-900 px-2.5 py-1 rounded-xl text-xs font-black flex items-center space-x-1 shrink-0">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          <span>{hotel.rating}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1 pt-1">
                        {hotel.features.slice(0, 4).map((f, i) => (
                          <span key={i} className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-md">
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold uppercase">Price / Night</span>
                        <span className="text-base font-black text-slate-900">₹{hotel.priceInr.toLocaleString('en-IN')}</span>
                      </div>

                      <button
                        onClick={() => onNavigateToPlanner(`${hotel.name} ${hotel.city}`)}
                        className="bg-slate-900 hover:bg-black text-white font-extrabold px-4 py-2 rounded-full text-xs shadow-sm"
                      >
                        Book & Plan Trip
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* TAB 4: RESTAURANTS & DINING */}
          {activeTab === 'restaurants' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredRestaurants.map((rst) => (
                <motion.div
                  key={rst.id}
                  whileHover={{ y: -6, scale: 1.015 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="bg-white rounded-[28px] border border-slate-200 hover:border-amber-400/80 shadow-sm hover:shadow-xl transition-all flex flex-col group relative"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-400/0 via-orange-300/0 to-amber-400/0 rounded-[30px] group-hover:from-amber-400/30 group-hover:via-orange-300/20 group-hover:to-amber-400/30 blur-md transition-all duration-500 opacity-0 group-hover:opacity-100 pointer-events-none" />

                  <div className="relative w-full h-full rounded-[28px] p-5 bg-white z-10 flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="bg-amber-50 text-amber-800 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-amber-200">
                            {rst.ratingText}
                          </span>
                          <h4 className="text-base font-black text-slate-950 mt-1">{rst.name}</h4>
                          <p className="text-xs text-slate-500 font-medium flex items-center space-x-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>{rst.locality}, {rst.city}</span>
                          </p>
                        </div>

                        <div className="bg-emerald-100 text-emerald-900 px-2.5 py-1 rounded-xl text-xs font-black flex items-center space-x-1 shrink-0">
                          <Star className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
                          <span>{rst.rating}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1 pt-1">
                        {rst.cuisines.map((c, i) => (
                          <span key={i} className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-md">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold uppercase">Cost for Two</span>
                        <span className="text-base font-black text-slate-900">₹{rst.costForTwoInr.toLocaleString('en-IN')}</span>
                      </div>

                      <button
                        onClick={() => onSelectDestinationForMap(`${rst.name} ${rst.locality} ${rst.city}`)}
                        className="bg-[#D8F864] hover:bg-[#cbe352] text-slate-950 font-black px-4 py-2 rounded-full text-xs shadow-sm"
                      >
                        Locate on Map
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* TAB 5: ACTIVITIES & LOCAL EXPERIENCES */}
          {activeTab === 'activities' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { title: 'Kerala Houseboat Backwater Cruise', loc: 'Alleppey, Kerala', type: 'Relaxation', duration: '1 Day', price: 4500, rating: 4.9, image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80' },
                { title: 'Desert Safari & Folk Camping', loc: 'Jaisalmer, Rajasthan', type: 'Adventure', duration: 'Overnight', price: 3200, rating: 4.8, image: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80' },
                { title: 'Scuba Diving & Coral Reef Kayaking', loc: 'Havelock, Andaman', type: 'Water Sports', duration: '4 Hours', price: 5500, rating: 4.95, image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80' },
                { title: 'Ganga River Rafting & Cliff Jumping', loc: 'Rishikesh, Uttarakhand', type: 'Extreme Sport', duration: '3 Hours', price: 1500, rating: 4.85, image: 'https://images.unsplash.com/photo-1530541930197-ff16ac917b0e?auto=format&fit=crop&w=800&q=80' },
                { title: 'Taj Mahal Sunrise Guided Photography Tour', loc: 'Agra, Uttar Pradesh', type: 'Heritage', duration: '3 Hours', price: 1200, rating: 4.9, image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80' },
                { title: 'Double Hump Camel Safari in Nubra', loc: 'Ladakh', type: 'Wildlife', duration: '2 Hours', price: 1800, rating: 4.88, image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80' }
              ].map((act, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -6, scale: 1.015 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="bg-white rounded-[32px] border border-slate-200 hover:border-[#D8F864]/80 shadow-sm hover:shadow-xl transition-all flex flex-col group relative"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-[#D8F864]/0 via-cyan-400/0 to-[#D8F864]/0 rounded-[34px] group-hover:from-[#D8F864]/40 group-hover:via-cyan-400/30 group-hover:to-[#D8F864]/40 blur-md transition-all duration-500 opacity-0 group-hover:opacity-100 pointer-events-none" />

                  <div className="relative w-full h-full rounded-[32px] overflow-hidden bg-white z-10 flex flex-col justify-between">
                    <div className="relative h-44 bg-slate-900 overflow-hidden">
                      <img src={act.image} alt={act.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                      <div className="absolute top-3 left-3 bg-[#D8F864] text-slate-950 font-black text-[10px] px-2.5 py-1 rounded-full uppercase">
                        {act.type}
                      </div>
                    </div>

                    <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="text-base font-black text-slate-950">{act.title}</h4>
                        <p className="text-xs text-slate-500 font-medium flex items-center space-x-1 mt-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{act.loc} • {act.duration}</span>
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-bold uppercase">Price / Person</span>
                          <span className="text-base font-black text-slate-900">₹{act.price.toLocaleString('en-IN')}</span>
                        </div>

                        <button
                          onClick={() => onNavigateToPlanner(`${act.title} ${act.loc}`)}
                          className="bg-slate-900 hover:bg-black text-white font-extrabold px-4 py-2 rounded-full text-xs"
                        >
                          Add to Trip
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}

      {/* FILTER DRAWER SLIDE-OVER */}
      <AnimatePresence>
        {showFilterDrawer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end"
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-white w-full max-w-md h-full overflow-y-auto p-6 space-y-6 shadow-2xl flex flex-col justify-between"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <h3 className="text-xl font-black text-slate-950 flex items-center space-x-2">
                    <SlidersHorizontal className="w-5 h-5 text-emerald-600" />
                    <span>Smart Travel Filters</span>
                  </h3>
                  <button
                    onClick={() => setShowFilterDrawer(false)}
                    className="p-2 hover:bg-slate-100 rounded-full text-slate-500"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Region Category Filter */}
                <div className="space-y-2">
                  <label className="text-xs font-extrabold uppercase text-slate-500">Region Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'all', label: 'All 36' },
                      { id: 'states', label: '28 States' },
                      { id: 'uts', label: '8 UTs' }
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setRegionTypeFilter(opt.id as RegionTypeFilter)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                          regionTypeFilter === opt.id
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Destination Interest / Category Filter */}
                <div className="space-y-2">
                  <label className="text-xs font-extrabold uppercase text-slate-500">Experience / Interest</label>
                  <div className="flex flex-wrap gap-2">
                    {['all', 'Parks', 'Forts', 'Beaches', 'Shrines', 'Cafes', 'Shops', 'Stay'].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`py-1.5 px-3 rounded-full text-xs font-bold border transition-all ${
                          selectedCategory === cat
                            ? 'bg-[#D8F864] text-slate-950 border-black/10'
                            : 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        {cat === 'all' ? 'All Experiences' : cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Minimum Rating */}
                <div className="space-y-2">
                  <label className="text-xs font-extrabold uppercase text-slate-500">Minimum Rating</label>
                  <div className="flex items-center space-x-2">
                    {[0, 4.0, 4.5, 4.8].map((rate) => (
                      <button
                        key={rate}
                        onClick={() => setMinRating(rate)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                          minRating === rate
                            ? 'bg-amber-400 text-slate-950 border-amber-500'
                            : 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        {rate === 0 ? 'Any' : `${rate}+ ⭐`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Budget Tier */}
                <div className="space-y-2">
                  <label className="text-xs font-extrabold uppercase text-slate-500">Budget Range</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'all', label: 'All Budgets' },
                      { id: 'low', label: 'Budget (₹ < 3k)' },
                      { id: 'mid', label: 'Mid-range (₹ 3k-7k)' },
                      { id: 'luxury', label: 'Luxury (₹ 7k+)' }
                    ].map((b) => (
                      <button
                        key={b.id}
                        onClick={() => setSelectedBudget(b.id)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                          selectedBudget === b.id
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Drawer Footer Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center space-x-3">
                <button
                  onClick={clearAllFilters}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold py-3 rounded-full text-xs"
                >
                  Reset All
                </button>
                <button
                  onClick={() => setShowFilterDrawer(false)}
                  className="flex-1 bg-[#D8F864] hover:bg-[#cbe352] text-slate-950 font-black py-3 rounded-full text-xs shadow-md"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* STATE / UT DETAIL MODAL */}
      <AnimatePresence>
        {activeRegionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="bg-white rounded-[36px] max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white space-y-6 relative"
            >
              {/* Modal Hero Header */}
              <div className="relative h-64 sm:h-80 bg-slate-950 overflow-hidden">
                <AuthenticImage
                  locationName={`${activeRegionModal.state} tourism`}
                  altText={activeRegionModal.state}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                <button
                  onClick={closeModal}
                  className="absolute top-4 right-4 bg-white/80 hover:bg-white text-slate-900 p-2.5 rounded-full backdrop-blur-md shadow-lg"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
                  <span className="bg-[#D8F864] text-slate-950 font-black text-xs px-3 py-1 rounded-full uppercase">
                    {isUTRecord(activeRegionModal) ? 'Union Territory' : `State #${activeRegionModal.stateNum}`}
                  </span>
                  <h2 className="text-3xl sm:text-5xl font-black text-white">{activeRegionModal.state}</h2>
                  <p className="text-xs sm:text-sm text-slate-200 font-medium max-w-2xl leading-relaxed">
                    {activeRegionModal.description}
                  </p>
                </div>
              </div>

              {/* Modal Body & Sub-tabs */}
              <div className="p-6 space-y-6">
                <div className="flex items-center space-x-2 border-b border-slate-100 pb-3 overflow-x-auto no-scrollbar">
                  {[
                    { id: 'places', label: `Top Attractions (${activeRegionModal.places.length})`, icon: MapPin },
                    { id: 'hotels', label: 'Hotels & Stay', icon: BedDouble },
                    { id: 'restaurants', label: 'Dining & Restaurants', icon: UtensilsCrossed },
                    { id: 'events', label: 'Local Experiences', icon: Ticket }
                  ].map((tb) => {
                    const Icon = tb.icon;
                    const isSelected = activeModalTab === tb.id;
                    return (
                      <button
                        key={tb.id}
                        onClick={() => setActiveModalTab(tb.id as any)}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-full text-xs font-extrabold transition-all shrink-0 ${
                          isSelected ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-[#D8F864]' : 'text-slate-500'}`} />
                        <span>{tb.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Modal Tab Content */}
                {activeModalTab === 'places' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {activeRegionModal.places.map((p, idx) => (
                      <div key={idx} className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black bg-slate-200 px-2 py-0.5 rounded-md text-slate-800">
                              Rank #{p.rank}
                            </span>
                            <div className="flex items-center space-x-1 text-amber-500 text-xs font-bold">
                              <Star className="w-3.5 h-3.5 fill-amber-400" />
                              <span>{p.rating}</span>
                            </div>
                          </div>
                          <h4 className="text-sm font-black text-slate-950 mt-1">{p.name}</h4>
                          <p className="text-xs text-slate-600 line-clamp-2 mt-1">{p.description}</p>
                        </div>

                        <button
                          onClick={() => {
                            closeModal();
                            onSelectDestinationForMap(p.mapSearchQuery || p.name);
                          }}
                          className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-900 font-bold py-1.5 px-3 rounded-full text-xs flex items-center justify-center space-x-1"
                        >
                          <Navigation className="w-3 h-3 text-emerald-600" />
                          <span>View on Map</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Action Bar */}
                <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        closeModal();
                        onNavigateToPlanner(activeRegionModal.state);
                      }}
                      className="bg-[#D8F864] hover:bg-[#cbe352] text-slate-950 font-black px-5 py-2.5 rounded-full text-xs shadow-md"
                    >
                      Plan Trip to {activeRegionModal.state.split('.')[1]?.trim() || activeRegionModal.state}
                    </button>
                    <button
                      onClick={() => {
                        closeModal();
                        onSelectDestinationForMap(activeRegionModal.state);
                      }}
                      className="bg-slate-900 hover:bg-black text-white font-extrabold px-5 py-2.5 rounded-full text-xs shadow-md"
                    >
                      Explore on Map
                    </button>
                  </div>

                  <button
                    onClick={closeModal}
                    className="text-xs font-bold text-slate-500 hover:text-slate-900"
                  >
                    Close Window
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
