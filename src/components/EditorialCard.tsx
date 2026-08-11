import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Heart,
  Share2,
  ArrowRight,
  RotateCw,
  Volume2,
  VolumeX,
  MapPin,
  Calendar,
  Utensils,
  Compass,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Navigation,
  Star,
  Eye,
  Award
} from 'lucide-react';
import { StateTourismRecord } from '../data/famousIndianStatesData';
import { WIKI_INDIAN_ENTITIES, fetchWikipediaEntitySummary, WikiPhotoSummaryResult } from '../services/wikiPhotoFetcher';

export interface EditorialCardProps {
  st: StateTourismRecord;
  isFav: boolean;
  onToggleFav: (id: string, e: React.MouseEvent) => void;
  onShare: (title: string, e: React.MouseEvent) => void;
  onExplore: (st: StateTourismRecord) => void;
  onPlanTrip: (stateName: string) => void;
  onViewMap: (stateName: string) => void;
}

export const EditorialCard: React.FC<EditorialCardProps> = ({
  st,
  isFav,
  onToggleFav,
  onShare,
  onExplore,
  onPlanTrip,
  onViewMap,
}) => {
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [currentImageIdx, setCurrentImageIdx] = useState<number>(0);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [wikiData, setWikiData] = useState<WikiPhotoSummaryResult | null>(null);

  // Look up metadata (greeting, capital, food, code) from entities list
  const meta = WIKI_INDIAN_ENTITIES.find(
    (e) => e.name.toLowerCase() === st.state.toLowerCase() || st.state.toLowerCase().includes(e.name.toLowerCase())
  ) || {
    greeting: 'Swagatam',
    capital: 'Capital Hub',
    bestMonths: 'Oct - Mar',
    famousFood: 'Local Delicacies',
    code: 'IN',
    wiki_title: st.state.replace(/\s+/g, '_'),
  };

  const isUT = st.type === 'Union Territory' || st.type === 'UT' || st.stateNum > 28;

  // Compute deterministic Velora Score (92 - 99 range)
  const veloraScore = 92 + ((st.stateNum * 7 + st.places.length * 3) % 8);

  // Build photo gallery array for multi-photo carousel on postcard
  const galleryPhotos: string[] = [];
  if (wikiData?.photo_url) galleryPhotos.push(wikiData.photo_url);
  if (st.imageUrl && !galleryPhotos.includes(st.imageUrl)) galleryPhotos.push(st.imageUrl);
  st.places.slice(0, 3).forEach((p) => {
    if (p.imageUrl && !galleryPhotos.includes(p.imageUrl)) galleryPhotos.push(p.imageUrl);
  });

  const activeImage = galleryPhotos[currentImageIdx] || st.imageUrl;

  // Fetch Wikipedia API image & description on load
  useEffect(() => {
    let isMounted = true;
    if (meta.wiki_title) {
      fetchWikipediaEntitySummary(meta.wiki_title).then((res) => {
        if (isMounted && res.photo_url) {
          setWikiData(res);
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, [meta.wiki_title]);

  // Audio Speech Greeting Handler
  const handleSpeakGreeting = (e: React.MouseEvent) => {
    e.stopPropagation();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      if (isSpeaking) {
        setIsSpeaking(false);
        return;
      }

      const text = `${meta.greeting}! Welcome to ${st.state}. ${st.description}`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIdx((prev) => (prev + 1) % galleryPhotos.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIdx((prev) => (prev - 1 + galleryPhotos.length) % galleryPhotos.length);
  };

  return (
    <div
      className="perspective-1000 w-full min-h-[460px] h-[460px] relative group select-none cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        style={{ transformStyle: 'preserve-3d' }}
        className="w-full h-full relative rounded-[32px] overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 border border-slate-200/80"
      >
        {/* ==================== FRONT OF EDITORIAL CARD ==================== */}
        <div
          style={{ backfaceVisibility: 'hidden' }}
          className="w-full h-full absolute inset-0 bg-slate-950 flex flex-col justify-between overflow-hidden"
        >
          {/* Full-Bleed Cinematic Hero Background Image */}
          <motion.img
            key={activeImage}
            initial={{ opacity: 0.85, scale: 1 }}
            animate={{ opacity: 1, scale: isHovered ? 1.08 : 1 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            src={activeImage}
            alt={st.state}
            className="w-full h-full absolute inset-0 object-cover"
          />

          {/* Cinematic Vignette Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-slate-950/40 pointer-events-none" />

          {/* Top Postcard Controls & Badges */}
          <div className="relative z-10 p-4 flex items-start justify-between">
            {/* Top Left Badges */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span
                className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-md shadow-md border ${
                  isUT
                    ? 'bg-cyan-500/90 text-slate-950 border-cyan-300'
                    : 'bg-[#D8F864] text-slate-950 border-emerald-400'
                }`}
              >
                {isUT ? 'Union Territory' : `State #${st.stateNum}`}
              </span>

              {/* Velora Score Badge */}
              <span className="bg-slate-900/85 text-amber-300 border border-amber-400/40 backdrop-blur-md text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center space-x-1 shadow-md">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span>{veloraScore} Velora Score</span>
              </span>
            </div>

            {/* Vintage Postmark Stamp Top Right */}
            <div className="flex items-center space-x-1.5 scale-90 origin-top-right">
              <div className="bg-amber-100 text-amber-950 border-2 border-amber-800/80 p-1.5 rounded-lg shadow-lg flex flex-col items-center justify-center text-[9px] font-black tracking-tighter w-11 h-13 rotate-3 hover:rotate-0 transition-transform">
                <span className="text-[6.5px] text-amber-800 uppercase font-black">INDIA POST</span>
                <span className="text-xs my-0.5">🇮🇳</span>
                <span className="text-[7.5px] bg-amber-900 text-amber-100 px-1 rounded font-mono">
                  {meta.code || 'IN'}
                </span>
              </div>
            </div>
          </div>

          {/* Gallery Carousel Controls */}
          {galleryPhotos.length > 1 && (
            <div className="absolute top-1/2 -translate-y-1/2 inset-x-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
              <button
                onClick={prevImage}
                className="p-2 rounded-full bg-slate-900/80 text-white hover:bg-black backdrop-blur-md pointer-events-auto shadow-md transition-transform hover:scale-110"
                title="Previous photo"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextImage}
                className="p-2 rounded-full bg-slate-900/80 text-white hover:bg-black backdrop-blur-md pointer-events-auto shadow-md transition-transform hover:scale-110"
                title="Next photo"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Photo Dots Indicator */}
          {galleryPhotos.length > 1 && (
            <div className="absolute top-16 left-4 flex items-center space-x-1 z-20">
              {galleryPhotos.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIdx(idx);
                  }}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === currentImageIdx ? 'w-5 bg-[#D8F864]' : 'w-1.5 bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Static Title (Default State) */}
          <div className="relative z-10 p-5 space-y-1">
            <span className="text-[10px] font-mono text-amber-300 tracking-widest uppercase font-bold drop-shadow-sm flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Greetings from</span>
            </span>
            <div className="flex items-end justify-between">
              <h3 className="text-3xl font-black text-white leading-tight drop-shadow-lg">
                {st.state}
              </h3>
              <span className="text-[10px] text-slate-300 bg-slate-900/70 border border-white/20 px-2.5 py-1 rounded-full backdrop-blur-xs flex items-center space-x-1 font-bold">
                <Eye className="w-3 h-3 text-[#D8F864]" />
                <span>Hover Details</span>
              </span>
            </div>
          </div>

          {/* FLOATING HOVER OVERLAY: Reveals Metadata smoothly without taking space below */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="absolute inset-x-3 bottom-3 z-30 p-4 bg-slate-950/90 backdrop-blur-xl border border-white/20 rounded-[26px] shadow-2xl flex flex-col justify-between space-y-3"
              >
                {/* Floating Metadata Header */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-amber-300 font-extrabold flex items-center space-x-1">
                      <Award className="w-3.5 h-3.5 text-amber-400" />
                      <span>Velora Score: {veloraScore}/100</span>
                    </span>
                    <span className="text-emerald-300 font-extrabold flex items-center space-x-1 bg-emerald-950/80 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                      <Calendar className="w-3 h-3 text-emerald-400" />
                      <span>{meta.bestMonths}</span>
                    </span>
                  </div>

                  <p className="text-xs text-slate-200 line-clamp-2 leading-relaxed font-medium">
                    {wikiData?.short_description || st.description}
                  </p>

                  {/* Top Attractions Tags */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {st.places.slice(0, 3).map((p, idx) => (
                      <span
                        key={idx}
                        className="bg-white/10 text-slate-200 border border-white/10 text-[10px] font-bold px-2.5 py-0.5 rounded-full truncate max-w-[130px]"
                      >
                        {p.name.replace(/^\d+\.\s*/, '')}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Floating Overlay Action Controls */}
                <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsFlipped(true);
                    }}
                    className="bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/40 font-extrabold px-3 py-2 rounded-full text-xs flex items-center space-x-1 transition-colors"
                    title="Flip postcard to read note & details"
                  >
                    <RotateCw className="w-3.5 h-3.5 text-amber-300" />
                    <span>Flip Postcard</span>
                  </button>

                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={(e) => onShare(st.state, e)}
                      className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                      title="Share destination"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={(e) => onToggleFav(st.id, e)}
                      className={`p-2 rounded-full transition-colors ${
                        isFav ? 'bg-rose-500 text-white' : 'bg-white/10 hover:bg-white/20 text-white'
                      }`}
                      title="Save to favorites"
                    >
                      <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-white' : ''}`} />
                    </button>

                    <button
                      onClick={() => onExplore(st)}
                      className="bg-[#D8F864] hover:bg-[#cbe352] text-slate-950 font-black py-2 px-3.5 rounded-full text-xs flex items-center space-x-1 shadow-md"
                    >
                      <span>Explore</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-950" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ==================== BACK OF EDITORIAL CARD (POSTCARD BACK) ==================== */}
        <div
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
          className="absolute inset-0 w-full h-full min-h-[460px] h-[460px] bg-[#FFFDF5] rounded-[32px] p-5 border-2 border-amber-800/20 shadow-2xl flex flex-col justify-between overflow-hidden"
        >
          {/* Postcard Center Vertical Divider Line */}
          <div className="absolute inset-y-6 left-1/2 w-0.5 bg-amber-900/10 hidden sm:block" />

          {/* Postcard Back Top Header */}
          <div className="flex items-start justify-between border-b border-amber-900/15 pb-3">
            <div className="space-y-0.5">
              <div className="flex items-center space-x-2">
                <h4 className="text-xl font-black text-amber-950">{st.state}</h4>
                <button
                  onClick={handleSpeakGreeting}
                  className={`p-1.5 rounded-full text-xs font-bold transition-all ${
                    isSpeaking ? 'bg-amber-600 text-white animate-pulse' : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                  }`}
                  title="Listen to audio greeting"
                >
                  {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-amber-800" />}
                </button>
              </div>
              <p className="text-xs font-serif italic text-amber-800">
                "{meta.greeting}! Greetings from {meta.capital}"
              </p>
            </div>

            {/* Back Postcard Stamp */}
            <div className="bg-amber-200/80 border border-amber-800/40 px-2.5 py-1.5 rounded-lg text-center flex flex-col items-center rotate-2">
              <span className="text-[8px] font-mono text-amber-900 font-black uppercase">AIR MAIL</span>
              <span className="text-xs font-bold text-amber-950 font-serif my-0.5">{meta.code || 'IN'}</span>
              <span className="text-[7px] text-amber-800 font-mono">POSTAGE PAID</span>
            </div>
          </div>

          {/* Postcard Message & Stats Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-2 flex-1 items-center">
            {/* Left Column: Ruled Letter Note */}
            <div className="space-y-2 text-amber-900/90 font-serif text-xs leading-relaxed pr-2 sm:border-r sm:border-amber-900/10">
              <p className="italic font-bold">
                Dear Traveler,
              </p>
              <p className="line-clamp-4">
                {st.description}
              </p>
              <p className="italic font-bold text-amber-950 pt-1">
                Wish you were here in {st.state}! ✨
              </p>
            </div>

            {/* Right Column: Quick Travel Highlights */}
            <div className="space-y-2.5 bg-amber-100/60 p-3 rounded-2xl border border-amber-800/10 text-xs">
              <div className="flex items-center justify-between text-amber-950 pb-1 border-b border-amber-900/10">
                <span className="font-bold flex items-center space-x-1">
                  <Star className="w-3 h-3 text-amber-600 fill-amber-600" />
                  <span>Velora Index:</span>
                </span>
                <span className="font-black text-amber-950">{veloraScore} / 100</span>
              </div>

              <div className="flex items-center space-x-2 text-amber-950">
                <Compass className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span className="font-bold">Capital:</span>
                <span className="font-medium text-amber-900">{meta.capital}</span>
              </div>

              <div className="flex items-center space-x-2 text-amber-950">
                <Calendar className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span className="font-bold">Best Months:</span>
                <span className="font-medium text-amber-900">{meta.bestMonths}</span>
              </div>

              <div className="flex items-center space-x-2 text-amber-950">
                <Utensils className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span className="font-bold">Famous Food:</span>
                <span className="font-medium text-amber-900 truncate max-w-[130px]">{meta.famousFood}</span>
              </div>
            </div>
          </div>

          {/* Back Action Bar */}
          <div className="pt-3 border-t border-amber-900/15 flex items-center justify-between gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsFlipped(false);
              }}
              className="bg-amber-200 hover:bg-amber-300 text-amber-950 font-extrabold px-3 py-2 rounded-full text-xs flex items-center space-x-1 border border-amber-400"
            >
              <RotateCw className="w-3.5 h-3.5 text-amber-800" />
              <span>Flip Front</span>
            </button>

            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => onViewMap(st.state)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-900 font-extrabold px-3 py-2 rounded-full text-xs flex items-center space-x-1"
                title="View on Interactive Map"
              >
                <Navigation className="w-3 h-3 text-emerald-600" />
                <span>Map</span>
              </button>

              <button
                onClick={() => onPlanTrip(st.state)}
                className="bg-[#D8F864] hover:bg-[#cbe352] text-slate-950 font-black px-4 py-2 rounded-full text-xs shadow-md"
              >
                Plan Trip
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
