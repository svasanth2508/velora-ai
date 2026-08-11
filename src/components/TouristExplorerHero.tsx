import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Search,
  Mic,
  ArrowRight,
  LocateFixed,
  MapPin,
  Compass,
  Heart,
  Volume2,
  VolumeX,
  Clock,
  Navigation,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';

interface TouristExplorerHeroProps {
  onSelectDestination: (destName: string) => void;
  onNavigateToMap: () => void;
  onNavigateToPlanner: (prefilledDest?: string) => void;
  onNavigateToTab: (tab: string) => void;
}

const HERO_SLIDES = [
  {
    id: 'kerala',
    title: 'KERALA',
    subtitle: 'Where palm fronds whisper over emerald backwaters.',
    tagline: 'TRAVEL BEYOND THE MAP.',
    image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1600&q=80',
    location: 'Alleppey & Munnar, Kerala',
    score: 96,
    experiences: 18,
    avgCost: '₹12,500',
    audioText: 'Welcome to Kerala, India\'s emerald palm-fringed backwater paradise.'
  },
  {
    id: 'ladakh',
    title: 'LADAKH',
    subtitle: '4,500 meters above ordinary expectations.',
    tagline: 'INDIA HAS MORE TO SHOW.',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80',
    location: 'Pangong Tso & Nubra, Ladakh',
    score: 98,
    experiences: 12,
    avgCost: '₹18,000',
    audioText: 'Ladakh, the land of high passes, turquoise lakes, and silent monasteries.'
  },
  {
    id: 'varanasi',
    title: 'VARANASI',
    subtitle: 'Walk through three thousand years of living light.',
    tagline: 'WHAT\'S CALLING YOU?',
    image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1600&q=80',
    location: 'Dashashwamedh Ghat, Uttar Pradesh',
    score: 94,
    experiences: 22,
    avgCost: '₹8,500',
    audioText: 'Varanasi, one of the oldest living cities on earth.'
  },
  {
    id: 'tajmahal',
    title: 'AGRA',
    subtitle: 'An eternal monument crafted from pure white marble.',
    tagline: 'PLAN SOMETHING WORTH REMEMBERING.',
    image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1600&q=80',
    location: 'Yamuna Riverbank, Agra',
    score: 95,
    experiences: 14,
    avgCost: '₹11,000',
    audioText: 'The Taj Mahal, an architectural wonder standing silently along the Yamuna.'
  }
];

const DISCOVERY_WALL = [
  {
    category: 'WILD',
    title: 'Mountains & Waterfalls',
    subtitle: 'Where nature asserts its grandeur.',
    items: [
      { name: 'Meghalaya', desc: 'Living root bridges & mist-shrouded valleys', image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80', number: '01' },
      { name: 'Munnar', desc: 'Emerald tea gardens floating above the clouds', image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80', number: '02' }
    ]
  },
  {
    category: 'SLOW',
    title: 'Villages & Backwaters',
    subtitle: 'Moments measured in gentle river currents.',
    items: [
      { name: 'Kumarakom', desc: 'Houseboats gliding under coconut canopy', image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80', number: '03' },
      { name: 'Chettinad', desc: 'Centuries-old heritage mansions & spicy curries', image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=800&q=80', number: '04' }
    ]
  },
  {
    category: 'TIMELESS',
    title: 'Forts & Heritage',
    subtitle: 'Stone corridors echoing with royal history.',
    items: [
      { name: 'Hampi', desc: 'Surreal boulder landscapes & ancient empires', image: 'https://images.unsplash.com/photo-1600100395162-43210e8ce499?auto=format&fit=crop&w=800&q=80', number: '05' },
      { name: 'Jaisalmer', desc: 'Golden sandstone fort rising from desert sands', image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80', number: '06' }
    ]
  },
  {
    category: 'ALIVE',
    title: 'Markets & Food Streets',
    subtitle: 'Sensory symphonies of spice and color.',
    items: [
      { name: 'Old Delhi', desc: 'Savouring Paranthe Wali Gali at sunset', image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80', number: '07' },
      { name: 'Madurai', desc: 'Jasmine fragrance & midnight street food stalls', image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80', number: '08' }
    ]
  },
  {
    category: 'ESCAPE',
    title: 'Islands & Coastlines',
    subtitle: 'Where turquoise seas meet untouched horizons.',
    items: [
      { name: 'Andaman Islands', desc: 'Radhanagar beach & luminous bioluminescence', image: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=800&q=80', number: '09' },
      { name: 'Gokarna', desc: 'Cliffside beaches and serene coastal walks', image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80', number: '10' }
    ]
  }
];

export const TouristExplorerHero: React.FC<TouristExplorerHeroProps> = ({
  onSelectDestination,
  onNavigateToMap,
  onNavigateToPlanner,
  onNavigateToTab
}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [searchPrompt, setSearchPrompt] = useState<string>('');
  const [locationEnabled, setLocationEnabled] = useState<boolean>(false);
  const [playingAudio, setPlayingAudio] = useState<boolean>(false);

  const currentSlide = HERO_SLIDES[currentSlideIndex];

  // Auto-slide transition
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const handleVoiceInput = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      try {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.onstart = () => setSearchPrompt('Listening...');
        recognition.onresult = (e: any) => {
          const text = e.results[0][0].transcript;
          setSearchPrompt(text);
        };
        recognition.start();
      } catch (err) {
        setSearchPrompt('I want a quiet 4-day trip with waterfalls under ₹15,000');
      }
    } else {
      setSearchPrompt('I want a quiet 4-day trip with waterfalls under ₹15,000');
    }
  };

  const handleAudioGuide = () => {
    if ('speechSynthesis' in window) {
      if (playingAudio) {
        window.speechSynthesis.cancel();
        setPlayingAudio(false);
      } else {
        window.speechSynthesis.cancel();
        const msg = new SpeechSynthesisUtterance(currentSlide.audioText);
        msg.rate = 0.9;
        msg.onend = () => setPlayingAudio(false);
        window.speechSynthesis.speak(msg);
        setPlayingAudio(true);
      }
    }
  };

  return (
    <div className="space-y-16 pb-12 text-[#151515]">
      {/* 1. CINEMATIC FULL-BLEED HERO CANVAS (65–75% Screen Height) */}
      <section className="relative h-[72vh] min-h-[520px] max-h-[750px] w-full rounded-[36px] overflow-hidden shadow-2xl group border border-[#151515]/10">
        {/* Dynamic Image Background */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide.id}
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${currentSlide.image})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-[#101513] via-[#101513]/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#101513]/70 via-transparent to-[#101513]/30" />
          </motion.div>
        </AnimatePresence>

        {/* Top Minimal Editorial Badge */}
        <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-20 text-white/90 text-xs font-mono">
          <div className="flex items-center space-x-3 bg-[#101513]/60 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20">
            <span className="w-2 h-2 rounded-full bg-[#E7C75F] animate-pulse" />
            <span className="font-sans font-semibold text-white tracking-widest text-[10px] uppercase">
              VELORA EDITORIAL • EDITION 2026
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {HERO_SLIDES.map((slide, idx) => (
              <button
                key={slide.id}
                onClick={() => setCurrentSlideIndex(idx)}
                className={`transition-all ${
                  idx === currentSlideIndex
                    ? 'w-8 h-1.5 bg-[#E7C75F] rounded-full'
                    : 'w-2 h-2 bg-white/40 hover:bg-white rounded-full'
                }`}
                title={slide.title}
              />
            ))}
          </div>
        </div>

        {/* Hero Editorial Headlines */}
        <div className="absolute bottom-10 left-6 sm:left-12 right-6 sm:right-12 z-20 text-white space-y-4 max-w-4xl">
          <motion.div
            key={`headline-${currentSlide.id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-2"
          >
            <span className="text-xs sm:text-sm font-sans font-extrabold uppercase tracking-[0.3em] text-[#E7C75F]">
              {currentSlide.tagline}
            </span>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-editorial font-bold tracking-tight text-white leading-none">
              {currentSlide.title}
            </h1>

            <p className="text-sm sm:text-base font-sans font-medium text-white/80 max-w-xl">
              {currentSlide.subtitle}
            </p>
          </motion.div>

          {/* Quick Audio Guide & Details Bar */}
          <div className="flex flex-wrap items-center gap-4 text-xs pt-2 border-t border-white/15">
            <button
              onClick={handleAudioGuide}
              className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 text-white transition-all"
            >
              {playingAudio ? (
                <VolumeX className="w-3.5 h-3.5 text-[#E7C75F]" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-[#E7C75F]" />
              )}
              <span>Audio Guide</span>
            </button>

            <span className="text-white/60">•</span>
            <span className="text-white/90 font-medium">📍 {currentSlide.location}</span>
            <span className="text-white/60">•</span>
            <span className="text-[#E7C75F] font-bold">Velora Score: {currentSlide.score}/100</span>
          </div>
        </div>
      </section>

      {/* 2. FLOATING ORGANIC AI SEARCH INTERFACE */}
      <section className="relative -mt-20 z-30 max-w-3xl mx-auto px-4">
        <div className="bg-[#FAF8F5] border border-[#151515]/10 rounded-[28px] p-5 shadow-2xl space-y-4 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-semibold text-[#163D32]">
              <Sparkles className="w-4 h-4 text-[#C76B45]" />
              <span className="uppercase tracking-widest font-sans font-bold">Ask Velora Companion</span>
            </div>
            <span className="text-[10px] font-mono text-[#6E6E67]">Natural Language Parser</span>
          </div>

          <div className="relative">
            <textarea
              rows={2}
              value={searchPrompt}
              onChange={(e) => setSearchPrompt(e.target.value)}
              placeholder='e.g. "I want a quiet 4-day trip with waterfalls and good local food under ₹15,000."'
              className="w-full bg-[#F6F3EC] border border-[#151515]/10 focus:border-[#163D32] rounded-2xl p-3.5 text-xs sm:text-sm font-medium text-[#151515] outline-none transition-all placeholder:text-[#6E6E67]/60 resize-none"
            />

            <div className="absolute right-3 bottom-3 flex items-center space-x-2">
              <button
                type="button"
                onClick={handleVoiceInput}
                className="p-2 text-[#151515]/60 hover:text-[#163D32] bg-[#E8E2D5] rounded-full transition-all"
                title="Voice input"
              >
                <Mic className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  if (searchPrompt) {
                    onSelectDestination(searchPrompt);
                    onNavigateToPlanner(searchPrompt);
                  } else {
                    onNavigateToPlanner('Kerala');
                  }
                }}
                className="bg-[#163D32] hover:bg-[#101513] text-white font-semibold text-xs px-4 py-2 rounded-full flex items-center space-x-1.5 transition-all shadow-md"
              >
                <span>Curate</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#E7C75F]" />
              </button>
            </div>
          </div>

          {/* Quick Suggestion Chips */}
          <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar pt-1 text-[11px]">
            <span className="text-[#6E6E67] font-semibold shrink-0 mr-1">Suggestions:</span>
            {[
              "Find hidden places",
              "Plan my weekend",
              "Best food trails",
              "Explore near me",
              "Build my dream trip"
            ].map((chip) => (
              <button
                key={chip}
                onClick={() => {
                  setSearchPrompt(chip);
                  if (chip === "Explore near me") {
                    setLocationEnabled(true);
                  }
                }}
                className="bg-[#E8E2D5]/70 hover:bg-[#E8E2D5] text-[#151515] font-medium px-3 py-1 rounded-full whitespace-nowrap transition-all border border-[#151515]/05 shrink-0"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 3. "YOU ARE HERE" NEARBY LOCATION PULSE EXPERIENCE */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="bg-[#FAF8F5] border border-[#151515]/10 rounded-[32px] p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#151515]/08 pb-5">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C76B45] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[#C76B45]"></span>
                </span>
                <span className="text-xs font-sans font-extrabold uppercase tracking-widest text-[#C76B45]">
                  {locationEnabled ? 'YOU ARE HERE' : 'LOCATION DISCOVERY'}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-editorial font-bold text-[#151515]">
                {locationEnabled ? 'Nearby Experiences Around You' : 'Find Somewhere Unexpected Near You'}
              </h2>
            </div>

            <button
              onClick={() => setLocationEnabled(!locationEnabled)}
              className="bg-[#163D32] hover:bg-[#101513] text-white font-medium text-xs px-5 py-2.5 rounded-full flex items-center space-x-2 transition-all shadow-sm"
            >
              <LocateFixed className="w-4 h-4 text-[#E7C75F]" />
              <span>{locationEnabled ? 'Location Active' : 'Enable Location Pulse'}</span>
            </button>
          </div>

          {/* Radial Nearby Results Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { time: '18 min', title: 'Hidden Waterfall', location: 'Munnar Valley Trail', type: 'Nature', image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80' },
              { time: '24 min', title: 'Local Breakfast', location: 'Heritage Spice Cafe', type: 'Food', image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=600&q=80' },
              { time: '31 min', title: 'Historic Temple', location: 'Ancient Granite Sanctum', type: 'Heritage', image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=600&q=80' },
              { time: '45 min', title: 'Sunset Viewpoint', location: 'Cliffside Panorama', type: 'Scenic', image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80' },
            ].map((spot, idx) => (
              <div
                key={idx}
                onClick={() => onNavigateToMap()}
                className="bg-[#F6F3EC] border border-[#151515]/08 rounded-2xl p-4 space-y-3 cursor-pointer hover:border-[#163D32] transition-all group"
              >
                <div className="relative h-32 rounded-xl overflow-hidden bg-slate-200">
                  <img src={spot.image} alt={spot.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <span className="absolute top-2.5 left-2.5 bg-[#101513]/80 backdrop-blur-md text-[#E7C75F] font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                    ⏱ {spot.time}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#C76B45]">
                    {spot.type}
                  </span>
                  <h4 className="text-sm font-editorial font-bold text-[#151515] group-hover:text-[#163D32] transition-colors">
                    {spot.title}
                  </h4>
                  <p className="text-xs text-[#6E6E67] font-sans truncate">{spot.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. DISCOVERY WALL (INFINITE EDITORIAL WALL WITH VARIED COMPOSITIONS) */}
      <section className="max-w-7xl mx-auto px-4 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-sans font-extrabold uppercase tracking-[0.25em] text-[#C76B45]">
            CURATED SECTIONS
          </span>
          <h2 className="text-3xl sm:text-5xl font-editorial font-bold text-[#151515]">
            The Discovery Wall
          </h2>
          <p className="text-sm text-[#6E6E67] font-sans">
            Where should we disappear to? Explore India by mood, tempo, and atmosphere.
          </p>
        </div>

        <div className="space-y-12">
          {DISCOVERY_WALL.map((sec, secIdx) => (
            <div key={sec.category} className="space-y-4 border-t border-[#151515]/10 pt-8">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                <div>
                  <span className="text-xs font-sans font-black tracking-widest text-[#163D32] uppercase">
                    {sec.category}
                  </span>
                  <h3 className="text-2xl font-editorial font-bold text-[#151515]">
                    {sec.title}
                  </h3>
                </div>
                <p className="text-xs text-[#6E6E67] font-sans italic">{sec.subtitle}</p>
              </div>

              {/* Asymmetric Editorial Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sec.items.map((item) => (
                  <div
                    key={item.name}
                    onClick={() => {
                      onSelectDestination(item.name);
                      onNavigateToTab('states');
                    }}
                    className="bg-[#FAF8F5] border border-[#151515]/08 rounded-3xl p-5 flex flex-col sm:flex-row gap-5 cursor-pointer hover:shadow-xl hover:border-[#163D32]/30 transition-all group"
                  >
                    <div className="sm:w-2/5 h-48 sm:h-auto rounded-2xl overflow-hidden relative shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <span className="absolute top-3 left-3 text-2xl font-editorial font-bold text-white drop-shadow">
                        {item.number}
                      </span>
                    </div>

                    <div className="sm:w-3/5 flex flex-col justify-between space-y-3">
                      <div className="space-y-1.5">
                        <h4 className="text-xl font-editorial font-bold text-[#151515] group-hover:text-[#163D32] transition-colors">
                          {item.name}
                        </h4>
                        <p className="text-xs text-[#6E6E67] leading-relaxed font-sans">
                          {item.desc}
                        </p>
                      </div>

                      <div className="flex items-center space-x-1 text-xs font-bold text-[#163D32]">
                        <span>Explore Story</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. HUMAN TRAVEL STATEMENT FOOTER BANNER */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="bg-[#101513] text-white rounded-[36px] p-8 sm:p-14 text-center space-y-6 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <span className="text-xs font-sans font-bold uppercase tracking-[0.3em] text-[#E7C75F]">
              LEAVE THE ROAD BEHIND
            </span>
            <h2 className="text-3xl sm:text-5xl font-editorial font-bold leading-tight">
              "Show me the road less travelled."
            </h2>
            <p className="text-xs sm:text-sm text-white/70 font-sans leading-relaxed">
              Every state is a canvas. Every journey is a story waiting to be written. Start exploring India with Velora AI today.
            </p>
            <button
              onClick={() => onNavigateToTab('states')}
              className="mt-2 bg-[#E7C75F] hover:bg-[#d9b850] text-[#101513] font-bold text-xs px-8 py-3.5 rounded-full inline-flex items-center space-x-2 transition-all shadow-lg"
            >
              <span>Explore The Interactive Atlas</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
