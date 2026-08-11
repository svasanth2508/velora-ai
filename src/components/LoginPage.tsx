import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Compass,
  Mail,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  KeyRound,
  Check,
  Globe,
  MapPin,
  Star,
  X,
  Zap,
  CheckCircle2,
  RefreshCw,
  Bookmark,
  ChevronRight,
  Feather
} from 'lucide-react';
import {
  loginWithGoogle,
  loginWithEmail,
  registerWithEmail,
  loginAnonymously,
  resetPasswordEmail,
  logoutUser,
  User
} from '../lib/firebase';
import { AuthenticImage } from './AuthenticImage';

interface LoginPageProps {
  currentUser: User | null;
  onLoginSuccess?: () => void;
  onNavigateHome?: () => void;
}

const DESTINATION_BACKDROPS = [
  {
    id: 'agra',
    title: 'Taj Mahal, Agra',
    tagline: 'Timeless Monument of Love & Imperial Heritage',
    state: 'Uttar Pradesh',
    coords: '27.1751° N, 78.0421° E',
    rating: '4.9',
    category: 'Heritage',
    est: 'EST. 1632',
    imageQuery: 'Taj Mahal Agra India',
    imageUrl: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'jaipur',
    title: 'Hawa Mahal, Jaipur',
    tagline: 'The Royal Pink City Palace of Winds',
    state: 'Rajasthan',
    coords: '26.9239° N, 75.8267° E',
    rating: '4.85',
    category: 'Architecture',
    est: 'EST. 1799',
    imageQuery: 'Hawa Mahal Jaipur',
    imageUrl: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'kerala',
    title: 'Alleppey Backwaters',
    tagline: 'God’s Own Country Emerald Houseboat Lagoon',
    state: 'Kerala',
    coords: '9.4981° N, 76.3388° E',
    rating: '4.95',
    category: 'Ecology',
    est: 'NATURAL LAGOONS',
    imageQuery: 'Kerala backwaters houseboat palm trees',
    imageUrl: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'varanasi',
    title: 'Kashi Ghats, Varanasi',
    tagline: 'Spiritual Heart of Sacred Ganges & Dawn Rituals',
    state: 'Uttar Pradesh',
    coords: '25.3176° N, 82.9739° E',
    rating: '4.92',
    category: 'Culture',
    est: 'ANCIENT CITY',
    imageQuery: 'Varanasi ghats ganga',
    imageUrl: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'goa',
    title: 'Palolem Beach, Goa',
    tagline: 'Golden Coastlines, Coconut Groves & Sunset Shores',
    state: 'Goa',
    coords: '15.0100° N, 74.0232° E',
    rating: '4.88',
    category: 'Coastal',
    est: 'ARABIAN SEA',
    imageQuery: 'Palolem beach Goa India',
    imageUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80'
  }
];

const TRAVEL_AVATARS = [
  { id: 'av1', emoji: '🧭', label: 'Explorer' },
  { id: 'av2', emoji: '📸', label: 'Photographer' },
  { id: 'av3', emoji: '🏔️', label: 'Trekker' },
  { id: 'av4', emoji: '🏖️', label: 'Coastal Nomad' },
  { id: 'av5', emoji: '🏰', label: 'Historian' },
  { id: 'av6', emoji: '🍲', label: 'Culinary Enthusiast' }
];

const EDITORIAL_TESTIMONIALS = [
  {
    quote: "Velora AI crafted a flawless 12-day journey through Rajasthan. The localized GPS guidance felt like having a veteran private concierge in Jaisalmer.",
    author: "Ananya Sharma",
    location: "New Delhi",
    role: "Solo Luxury Explorer",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"
  },
  {
    quote: "From hidden backwater retreats in Alleppey to private spice estate walks in Munnar, the digital twin recommendations were completely spot on.",
    author: "Rajesh & Meera Iyer",
    location: "Bengaluru",
    role: "Cultural Voyagers",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150"
  },
  {
    quote: "The real-time route optimization and seamless offline maps made navigating Varanasi during Ganga Aarti totally effortless.",
    author: "Priya Nair",
    location: "Mumbai",
    role: "Digital Travel Writer",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150"
  }
];

export const LoginPage: React.FC<LoginPageProps> = ({
  currentUser,
  onLoginSuccess,
  onNavigateHome
}) => {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup' | 'guest'>('signin');

  // Form Inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState('av1');
  const [travelPersona, setTravelPersona] = useState('Explorer');
  const [rememberMe, setRememberMe] = useState(true);

  // Status & Feedback
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [cinematicStep, setCinematicStep] = useState<'none' | 'welcome' | 'preparing'>('none');

  // Forgot Password Modal
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMsg, setResetMsg] = useState<string | null>(null);

  // Backdrop State
  const [selectedBackdropIdx, setSelectedBackdropIdx] = useState(0);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const currentBackdrop = DESTINATION_BACKDROPS[selectedBackdropIdx];

  // Testimonial Rotation
  const [activeTestimonialIdx, setActiveTestimonialIdx] = useState(0);

  useEffect(() => {
    if (!isAutoRotating) return;
    const interval = setInterval(() => {
      setSelectedBackdropIdx((prev) => (prev + 1) % DESTINATION_BACKDROPS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isAutoRotating]);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonialIdx((prev) => (prev + 1) % EDITORIAL_TESTIMONIALS.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  const triggerCinematicTransition = () => {
    setCinematicStep('welcome');
    setTimeout(() => {
      setCinematicStep('preparing');
      setTimeout(() => {
        if (onLoginSuccess) onLoginSuccess();
        if (onNavigateHome) onNavigateHome();
      }, 1200);
    }, 1200);
  };

  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 10) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const passStrength = getPasswordStrength(password);

  const getStrengthLabel = () => {
    if (!password) return { label: 'Empty', color: 'bg-slate-800', text: 'text-slate-500' };
    if (passStrength <= 2) return { label: 'Weak', color: 'bg-rose-500', text: 'text-rose-400' };
    if (passStrength === 3 || passStrength === 4) return { label: 'Moderate', color: 'bg-amber-400', text: 'text-amber-400' };
    return { label: 'Secure Key', color: 'bg-emerald-400', text: 'text-emerald-400' };
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await loginWithGoogle();
      setSuccessMsg('Google Account verified. Welcome!');
      triggerCinematicTransition();
    } catch (err: any) {
      if (err?.code === 'auth/unauthorized-domain' || err?.message?.includes('unauthorized-domain')) {
        setErrorMsg(
          `Domain "${window.location.hostname}" is pending Google Auth whitelist. You can instantly sign in using Email or Guest Explorer below.`
        );
      } else {
        setErrorMsg(err?.message || 'Google authentication failed. Please try Email or Guest Mode.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (activeTab === 'signup') {
        if (!fullName.trim()) throw new Error('Please enter your full name for your Voyager Pass.');
        if (password.length < 6) throw new Error('Password must contain at least 6 characters.');

        await registerWithEmail(email, password, fullName);
        setSuccessMsg('Voyager Profile registered successfully!');
      } else {
        await loginWithEmail(email, password);
        setSuccessMsg('Welcome back to Velora AI!');
      }

      triggerCinematicTransition();
    } catch (err: any) {
      let msg = err?.message || 'Authentication failed. Please check your credentials.';
      if (err?.code === 'auth/user-not-found' || err?.code === 'auth/invalid-credential') {
        msg = 'Invalid credentials. Please verify your email or click "Create Account".';
      } else if (err?.code === 'auth/email-already-in-use') {
        msg = 'This email address is already registered. Please switch to Sign In.';
      }
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestAuth = async () => {
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await loginAnonymously();
      setSuccessMsg('Entered as Guest Voyager!');
      triggerCinematicTransition();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Unable to enter guest mode.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;
    setResetLoading(true);
    setResetMsg(null);
    try {
      await resetPasswordEmail(resetEmail);
      setResetMsg('Password recovery link dispatched! Please check your email inbox.');
    } catch (err: any) {
      setResetMsg(err?.message || 'Unable to send recovery email. Verify email address.');
    } finally {
      setResetLoading(false);
    }
  };

  const handleAutoFillDemo = () => {
    setEmail('voyager@velora.ai');
    setPassword('Velora2026!');
    setFullName('Aarav Vasanth');
    setErrorMsg(null);
    setSuccessMsg('Demo credentials auto-filled. Click below to continue.');
  };

  // Staggered Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-[#060911] text-slate-100 font-sans relative overflow-x-hidden selection:bg-[#E7C75F] selection:text-slate-950 flex flex-col justify-between">
      {/* Dark Vignette & Subtle Warm Gold Glow Background */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#E7C75F]/10 via-[#060911] to-[#060911] pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-amber-900/15 via-transparent to-transparent pointer-events-none" />
      
      {/* Fine Editorial Grid Overlay */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />

      {/* Editorial Top Navigation Header */}
      <header className="relative z-20 px-6 sm:px-12 py-5 flex items-center justify-between border-b border-white/10 bg-[#060911]/80 backdrop-blur-xl">
        <div
          onClick={onNavigateHome}
          className="flex items-center space-x-3.5 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E7C75F] to-amber-600 text-slate-950 flex items-center justify-center font-serif font-bold text-xl shadow-lg shadow-[#E7C75F]/20 group-hover:scale-105 transition-transform">
            V
          </div>
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="text-lg font-serif font-bold tracking-wider text-white">VELORA</span>
              <span className="text-[9px] uppercase tracking-widest font-extrabold px-2 py-0.5 rounded-md bg-[#E7C75F]/15 text-[#E7C75F] border border-[#E7C75F]/30">
                AI TRAVEL TWIN
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide hidden sm:block">
              EDITORIAL TRAVEL & ITINERARY HUB
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={onNavigateHome}
            className="px-4 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-white/10 hover:border-white/20 text-xs font-medium text-slate-300 hover:text-white transition-all flex items-center space-x-2 cursor-pointer shadow-sm"
          >
            <Compass className="w-3.5 h-3.5 text-[#E7C75F]" />
            <span>Explore Velora</span>
          </button>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-8 py-8 sm:py-12 flex-1 flex items-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 w-full items-stretch"
        >
          {/* LEFT COLUMN: Editorial Image Frame & Destination Backdrop Showcase (5 cols) */}
          <motion.div variants={itemVariants} className="lg:col-span-5 flex flex-col justify-between space-y-6">
            
            {/* High-End Editorial Destination Showcase Frame */}
            <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-slate-900/40 backdrop-blur-2xl p-6 sm:p-7 space-y-6 shadow-[0_20px_50px_rgba(0,0,0,0.8)] group">
              
              {/* Image Frame */}
              <div className="relative h-72 sm:h-80 rounded-2xl overflow-hidden bg-slate-950 border border-white/10">
                <AuthenticImage
                  locationName={currentBackdrop.title}
                  altText={currentBackdrop.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
                />
                
                {/* Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#060911] via-[#060911]/30 to-transparent" />

                {/* Rating Badge */}
                <div className="absolute top-3.5 right-3.5 px-3 py-1 rounded-full bg-[#060911]/85 backdrop-blur-md border border-white/10 text-xs font-semibold text-amber-300 flex items-center space-x-1 shadow-lg">
                  <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                  <span>{currentBackdrop.rating}</span>
                </div>

                {/* Coordinates & Region Stamp */}
                <div className="absolute top-3.5 left-3.5 px-3 py-1 rounded-full bg-[#060911]/85 backdrop-blur-md border border-[#E7C75F]/40 text-[10px] font-mono font-medium text-slate-200 flex items-center space-x-1.5 shadow-xl">
                  <MapPin className="w-3 h-3 text-[#E7C75F]" />
                  <span>{currentBackdrop.coords}</span>
                </div>

                {/* Editorial Caption Banner */}
                <div className="absolute bottom-4 left-4 right-4 space-y-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 rounded bg-[#E7C75F] text-slate-950">
                      {currentBackdrop.est}
                    </span>
                    <span className="text-[10px] uppercase tracking-widest text-slate-300 font-medium">
                      {currentBackdrop.state}
                    </span>
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-white tracking-tight leading-snug">
                    {currentBackdrop.title}
                  </h3>
                  <p className="text-xs text-slate-300 font-light italic">
                    "{currentBackdrop.tagline}"
                  </p>
                </div>
              </div>

              {/* Destination Selector Tabs */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-[10px] uppercase tracking-widest font-bold text-slate-400">
                  <span>Curated Travel Backdrops</span>
                  <button
                    type="button"
                    onClick={() => setIsAutoRotating(!isAutoRotating)}
                    className="text-[10px] text-[#E7C75F] hover:underline flex items-center space-x-1 cursor-pointer font-medium"
                  >
                    <RefreshCw className={`w-3 h-3 ${isAutoRotating ? 'animate-spin' : ''}`} style={{ animationDuration: '8s' }} />
                    <span>{isAutoRotating ? 'Auto Transitioning' : 'Paused'}</span>
                  </button>
                </div>

                <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
                  {DESTINATION_BACKDROPS.map((bd, idx) => (
                    <button
                      key={bd.id}
                      onClick={() => {
                        setSelectedBackdropIdx(idx);
                        setIsAutoRotating(false);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 border cursor-pointer ${
                        selectedBackdropIdx === idx
                          ? 'bg-[#E7C75F] text-slate-950 border-[#E7C75F] font-bold shadow-md scale-105'
                          : 'bg-slate-950/80 text-slate-400 border-white/10 hover:text-white hover:border-white/20'
                      }`}
                    >
                      {bd.title.split(',')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Editorial Feature Highlights */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3 bg-slate-950/60 rounded-2xl border border-white/10 space-y-1">
                  <div className="flex items-center space-x-1.5 text-[#E7C75F]">
                    <Zap className="w-3.5 h-3.5" />
                    <span className="text-xs font-semibold">Gemini 2.5 Engine</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-light leading-relaxed">
                    Personalized multi-day travel itineraries built in seconds.
                  </p>
                </div>

                <div className="p-3 bg-slate-950/60 rounded-2xl border border-white/10 space-y-1">
                  <div className="flex items-center space-x-1.5 text-amber-300">
                    <Compass className="w-3.5 h-3.5" />
                    <span className="text-xs font-semibold">Offline Digital Twin</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-light leading-relaxed">
                    Interactive OSM maps and cultural guides without data.
                  </p>
                </div>
              </div>

              {/* Rotating Editorial Testimonial Quote */}
              <div className="p-4 bg-slate-950/80 rounded-2xl border border-white/10 space-y-2.5 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <img
                      src={EDITORIAL_TESTIMONIALS[activeTestimonialIdx].avatar}
                      alt={EDITORIAL_TESTIMONIALS[activeTestimonialIdx].author}
                      className="w-8 h-8 rounded-full object-cover border border-[#E7C75F]/60"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-white">
                        {EDITORIAL_TESTIMONIALS[activeTestimonialIdx].author}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-light">
                        {EDITORIAL_TESTIMONIALS[activeTestimonialIdx].role} • {EDITORIAL_TESTIMONIALS[activeTestimonialIdx].location}
                      </p>
                    </div>
                  </div>

                  <div className="flex space-x-1">
                    {EDITORIAL_TESTIMONIALS.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveTestimonialIdx(i)}
                        className={`w-1.5 h-1.5 rounded-full transition-all ${
                          activeTestimonialIdx === i ? 'bg-[#E7C75F] w-3' : 'bg-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-xs text-slate-300 italic font-serif leading-relaxed">
                  "{EDITORIAL_TESTIMONIALS[activeTestimonialIdx].quote}"
                </p>
              </div>
            </div>
          </motion.div>

          {/* RIGHT COLUMN: Unique Editorial Auth Card (7 cols) */}
          <motion.div variants={itemVariants} className="lg:col-span-7 flex flex-col justify-center">
            
            {/* If USER IS ALREADY LOGGED IN */}
            {currentUser ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-900/60 border border-white/10 text-white rounded-3xl p-8 sm:p-10 shadow-2xl space-y-8 backdrop-blur-2xl text-center relative"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-[#E7C75F]/20 to-amber-900/30 border border-[#E7C75F] text-[#E7C75F] rounded-2xl mx-auto flex items-center justify-center text-3xl shadow-xl">
                  {currentUser.photoURL ? (
                    <img src={currentUser.photoURL} alt="Profile" className="w-full h-full rounded-2xl object-cover" />
                  ) : (
                    <span className="font-serif">
                      {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : 'V'}
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  <span className="px-3 py-1 bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 rounded-full text-[10px] font-bold uppercase tracking-widest">
                    ● Authenticated Voyager
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                    Welcome back, {currentUser.displayName || currentUser.email || 'Explorer'}
                  </h2>
                  <p className="text-xs text-slate-400 font-light max-w-md mx-auto">
                    Your custom travel itineraries and saved state twins are securely synchronized to your profile (<strong className="text-slate-200">{currentUser.email || 'Guest Session'}</strong>).
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto pt-2">
                  <button
                    onClick={onNavigateHome}
                    className="w-full bg-[#E7C75F] hover:bg-[#d9b852] text-slate-950 font-bold py-3.5 px-6 rounded-2xl text-xs flex items-center justify-center space-x-2 shadow-xl transition-all cursor-pointer"
                  >
                    <span>Launch Travel Manager</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={async () => {
                      await logoutUser();
                      setSuccessMsg('Signed out successfully.');
                    }}
                    className="w-full bg-slate-800/80 hover:bg-slate-700 text-rose-300 border border-slate-700 font-medium py-3.5 px-6 rounded-2xl text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                    <span>Sign Out Account</span>
                  </button>
                </div>
              </motion.div>
            ) : (
              /* MAIN EDITORIAL AUTHENTICATION CARD */
              <div className="bg-slate-900/50 border border-white/10 text-white rounded-3xl p-6 sm:p-10 shadow-[0_30px_70px_rgba(0,0,0,0.8)] space-y-6 backdrop-blur-2xl relative overflow-hidden">
                
                {/* Background Gold Ambient Glow */}
                <div className="absolute -top-24 -right-24 w-80 h-80 bg-[#E7C75F]/10 rounded-full blur-3xl pointer-events-none" />

                {/* Tab Navigation Header */}
                <div className="flex items-center justify-between pb-3 border-b border-white/10 relative z-10">
                  <div className="flex items-center space-x-1 bg-slate-950/80 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md">
                    {(
                      [
                        { id: 'signin', label: 'Sign In' },
                        { id: 'signup', label: 'Register Voyager' },
                        { id: 'guest', label: 'Guest Access' }
                      ] as const
                    ).map((tab) => {
                      const isActive = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => {
                            setActiveTab(tab.id);
                            setErrorMsg(null);
                            setSuccessMsg(null);
                          }}
                          className={`relative z-10 px-4 py-2 rounded-xl text-xs font-semibold transition-colors duration-200 cursor-pointer ${
                            isActive ? 'text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {isActive && (
                            <motion.div
                              layoutId="editorialTabIndicator"
                              className="absolute inset-0 bg-[#E7C75F] rounded-xl shadow-md -z-10"
                              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                            />
                          )}
                          <span>{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={handleAutoFillDemo}
                    className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-[#E7C75F] text-[11px] font-medium border border-[#E7C75F]/30 transition-all cursor-pointer"
                    title="Auto-fill sample test credentials"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Auto-Fill Demo</span>
                  </button>
                </div>

                {/* Editorial Title */}
                <div className="space-y-1.5 relative z-10">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-[#E7C75F]">
                    {activeTab === 'signup' ? 'REGISTER PROFILE' : activeTab === 'guest' ? 'INSTANT DISCOVERY' : 'AUTHENTICATION'}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
                    {activeTab === 'signup'
                      ? 'Create Your Voyager Profile'
                      : activeTab === 'guest'
                      ? 'Instant Guest Explorer'
                      : 'Welcome Back, Traveller'}
                  </h2>
                  <p className="text-xs text-slate-400 font-light leading-relaxed">
                    {activeTab === 'signup'
                      ? 'Synchronize custom generative travel itineraries, state maps, and AI preferences.'
                      : activeTab === 'guest'
                      ? 'Access all 28 State guides, OSM map twins, and AI translators immediately.'
                      : 'Sign in to access your saved trips, digital twins, and AI travel assistant.'}
                  </p>
                </div>

                {/* Live Editorial Voyager Boarding Pass Preview */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-[#E7C75F]/30 rounded-2xl relative overflow-hidden shadow-xl z-10"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-white/10 text-[9px] uppercase font-mono tracking-widest text-slate-400">
                    <div className="flex items-center space-x-1.5 text-[#E7C75F]">
                      <Sparkles className="w-3 h-3" />
                      <span>Live Voyager Pass</span>
                    </div>
                    <span className="text-slate-300">VELORA • SEAT 01A</span>
                  </div>

                  <div className="pt-2.5 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-[#E7C75F]/15 border border-[#E7C75F]/40 text-[#E7C75F] flex items-center justify-center text-lg font-bold shrink-0">
                        {TRAVEL_AVATARS.find(a => a.id === selectedAvatar)?.emoji || '🧭'}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-white truncate max-w-[170px] sm:max-w-[220px]">
                          {fullName || (email ? email.split('@')[0] : (activeTab === 'guest' ? 'Guest Voyager' : 'Aarav Vasanth'))}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-light flex items-center space-x-1 truncate">
                          <span>{travelPersona}</span>
                          <span>•</span>
                          <span className="text-[#E7C75F]">{currentBackdrop.title.split(',')[0]}</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right space-y-0.5 shrink-0">
                      <span className="px-2 py-0.5 bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 rounded text-[9px] font-semibold uppercase tracking-wider inline-block">
                        Active Pass
                      </span>
                      <p className="text-[9px] text-slate-500 font-mono">ID #{Math.abs(((fullName || email || 'voyager') + travelPersona).length * 137 + 1024)}</p>
                    </div>
                  </div>
                </motion.div>

                {/* Error & Success Banners */}
                <AnimatePresence mode="wait">
                  {errorMsg && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="p-3.5 bg-rose-950/80 border border-rose-500/40 rounded-2xl text-rose-200 text-xs flex items-start justify-between space-x-3 backdrop-blur-md relative z-10"
                    >
                      <div className="flex items-start space-x-2.5">
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        <span className="font-light leading-relaxed">{errorMsg}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setErrorMsg(null)}
                        className="text-rose-400 hover:text-white p-0.5 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </motion.div>
                  )}

                  {successMsg && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="p-3.5 bg-emerald-950/80 border border-emerald-500/40 rounded-2xl text-emerald-200 text-xs flex items-center justify-between space-x-3 backdrop-blur-md relative z-10"
                    >
                      <div className="flex items-center space-x-2.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="font-light">{successMsg}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSuccessMsg(null)}
                        className="text-emerald-400 hover:text-white p-0.5 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Google Sign In Button */}
                {activeTab !== 'guest' && (
                  <div className="space-y-3 relative z-10">
                    <button
                      type="button"
                      onClick={handleGoogleAuth}
                      disabled={loading}
                      className="w-full bg-slate-950/80 hover:bg-slate-900 text-white font-medium py-3.5 px-4 rounded-2xl text-xs flex items-center justify-center space-x-3 border border-white/10 hover:border-white/20 transition-all duration-200 shadow-lg cursor-pointer disabled:opacity-50 group"
                    >
                      {loading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <svg className="w-4 h-4 shrink-0 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                            <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.2 9 5 12 5z" />
                            <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
                            <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12.5s.7 2.8 1.9 5.2l3.7-2.9z" />
                            <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.2-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z" />
                          </svg>
                          <span>Authenticate via Google Account</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center space-x-3 py-1">
                      <div className="flex-1 border-t border-white/10" />
                      <span className="text-[9px] uppercase tracking-widest font-bold text-slate-500">Or Email Credentials</span>
                      <div className="flex-1 border-t border-white/10" />
                    </div>
                  </div>
                )}

                {/* Email / Password Form */}
                {activeTab !== 'guest' ? (
                  <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                    
                    {/* Full Name field for Sign Up */}
                    <AnimatePresence>
                      {activeTab === 'signup' && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-1.5 overflow-hidden"
                        >
                          <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                            <span>Full Name</span>
                          </label>
                          <div className="group flex items-center space-x-2.5 bg-slate-950/80 border border-white/10 focus-within:border-[#E7C75F] focus-within:ring-1 focus-within:ring-[#E7C75F]/30 rounded-2xl px-4 py-3.5 transition-all">
                            <UserIcon className="w-4 h-4 text-slate-500 group-focus-within:text-[#E7C75F]" />
                            <input
                              type="text"
                              required={activeTab === 'signup'}
                              value={fullName}
                              onChange={(e) => setFullName(e.target.value)}
                              placeholder="e.g. Aarav Vasanth"
                              className="w-full bg-transparent text-xs text-white placeholder-slate-500 outline-none font-medium"
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Email Input */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Email Address</label>
                      <div className="group flex items-center space-x-2.5 bg-slate-950/80 border border-white/10 focus-within:border-[#E7C75F] focus-within:ring-1 focus-within:ring-[#E7C75F]/30 rounded-2xl px-4 py-3.5 transition-all">
                        <Mail className="w-4 h-4 text-slate-500 group-focus-within:text-[#E7C75F]" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="voyager@example.com"
                          className="w-full bg-transparent text-xs text-white placeholder-slate-500 outline-none font-medium"
                        />
                      </div>
                    </div>

                    {/* Password Input */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Password</label>
                        {activeTab === 'signin' && (
                          <button
                            type="button"
                            onClick={() => setShowForgotModal(true)}
                            className="text-[10px] text-[#E7C75F] hover:underline cursor-pointer"
                          >
                            Forgot Password?
                          </button>
                        )}
                      </div>
                      <div className="group flex items-center space-x-2.5 bg-slate-950/80 border border-white/10 focus-within:border-[#E7C75F] focus-within:ring-1 focus-within:ring-[#E7C75F]/30 rounded-2xl px-4 py-3.5 transition-all relative">
                        <Lock className="w-4 h-4 text-slate-500 group-focus-within:text-[#E7C75F]" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-transparent text-xs text-white placeholder-slate-500 outline-none font-medium pr-8"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                          className="absolute right-3.5 text-slate-500 hover:text-[#E7C75F] cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Password Strength Indicator for Sign Up */}
                    {activeTab === 'signup' && password && (
                      <div className="space-y-1 p-2.5 bg-slate-950/60 rounded-xl border border-white/10">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-slate-400 font-semibold uppercase">Security Level</span>
                          <span className={getStrengthLabel().text}>{getStrengthLabel().label}</span>
                        </div>
                        <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                          <div className={`h-full ${getStrengthLabel().color}`} style={{ width: `${(passStrength / 5) * 100}%` }} />
                        </div>
                      </div>
                    )}

                    {/* Persona & Avatar Selector for Sign Up */}
                    {activeTab === 'signup' && (
                      <div className="space-y-2 pt-1">
                        <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Select Persona & Avatar</label>
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                          {TRAVEL_AVATARS.map((av) => (
                            <button
                              key={av.id}
                              type="button"
                              onClick={() => {
                                setSelectedAvatar(av.id);
                                setTravelPersona(av.label);
                              }}
                              className={`p-2 rounded-xl flex flex-col items-center justify-center space-y-1 border transition-all cursor-pointer ${
                                selectedAvatar === av.id
                                  ? 'bg-[#E7C75F]/20 border-[#E7C75F] text-white shadow-sm'
                                  : 'bg-slate-950 border-white/10 text-slate-400 hover:border-white/20'
                              }`}
                            >
                              <span className="text-lg">{av.emoji}</span>
                              <span className="text-[9px] font-medium text-center truncate w-full">{av.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Remember Device Checkbox */}
                    {activeTab === 'signin' && (
                      <div className="flex items-center space-x-2 text-xs text-slate-400 pt-0.5">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="rounded border-slate-700 bg-slate-950 text-[#E7C75F] focus:ring-0 cursor-pointer"
                        />
                        <span className="font-light">Remember session on this device</span>
                      </div>
                    )}

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-[#E7C75F] hover:bg-[#d9b852] text-slate-950 font-bold py-3.5 px-6 rounded-2xl text-xs flex items-center justify-center space-x-2 shadow-xl hover:shadow-[#E7C75F]/20 transition-all cursor-pointer disabled:opacity-80 group"
                    >
                      {loading ? (
                        <div className="flex items-center space-x-2.5">
                          <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                          <span>Processing Profile...</span>
                        </div>
                      ) : (
                        <>
                          <span>{activeTab === 'signup' ? 'Complete Registration' : 'Enter Velora AI'}</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  /* GUEST ACCESS PANEL */
                  <div className="space-y-5 py-1 relative z-10">
                    <div className="p-4 bg-slate-950/80 rounded-2xl border border-white/10 space-y-2.5 text-xs text-slate-300">
                      <div className="flex items-center space-x-2 text-[#E7C75F] font-semibold">
                        <Sparkles className="w-4 h-4" />
                        <span>Instant Access Mode</span>
                      </div>
                      <p className="font-light leading-relaxed">
                        Explore generative trip planners, interactive maps, and cultural guides without password setup.
                      </p>
                      <ul className="space-y-1 text-[11px] text-slate-400 font-light">
                        <li className="flex items-center space-x-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Generate multi-day custom itineraries</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Access 28 Indian States & 8 UTs Database</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Offline OSM Map Twin capabilities</span>
                        </li>
                      </ul>
                    </div>

                    <button
                      type="button"
                      onClick={handleGuestAuth}
                      disabled={loading}
                      className="w-full bg-[#E7C75F] hover:bg-[#d9b852] text-slate-950 font-bold py-3.5 px-6 rounded-2xl text-xs flex items-center justify-center space-x-2 shadow-xl hover:shadow-[#E7C75F]/20 transition-all cursor-pointer group"
                    >
                      {loading ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                          <span>Connecting Guest Voyager...</span>
                        </div>
                      ) : (
                        <>
                          <Compass className="w-4 h-4 group-hover:rotate-45 transition-transform" />
                          <span>Enter Velora AI as Guest</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Footer Switcher */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400 font-medium">
                  {activeTab === 'signin' ? (
                    <div className="flex items-center justify-between w-full">
                      <span>New to Velora AI?</span>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('signup');
                          setErrorMsg(null);
                        }}
                        className="text-[#E7C75F] hover:underline font-bold cursor-pointer"
                      >
                        Create Free Account →
                      </button>
                    </div>
                  ) : activeTab === 'signup' ? (
                    <div className="flex items-center justify-between w-full">
                      <span>Already registered?</span>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('signin');
                          setErrorMsg(null);
                        }}
                        className="text-[#E7C75F] hover:underline font-bold cursor-pointer"
                      >
                        Sign In →
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between w-full">
                      <span>Require cloud sync?</span>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('signin');
                          setErrorMsg(null);
                        }}
                        className="text-[#E7C75F] hover:underline font-bold cursor-pointer"
                      >
                        Sign In →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      </main>

      {/* FORGOT PASSWORD MODAL */}
      <AnimatePresence>
        {showForgotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="bg-slate-900 border border-white/10 text-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-5 relative"
            >
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-1.5">
                <div className="w-10 h-10 rounded-xl bg-[#E7C75F]/20 border border-[#E7C75F]/40 text-[#E7C75F] flex items-center justify-center">
                  <KeyRound className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-serif font-bold text-white">Reset Password</h3>
                <p className="text-xs text-slate-400 font-light">
                  Enter your registered email address. A password recovery link will be dispatched immediately.
                </p>
              </div>

              {resetMsg && (
                <div className="p-3 bg-slate-950 border border-white/10 rounded-xl text-xs text-[#E7C75F] font-medium flex items-center space-x-2">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{resetMsg}</span>
                </div>
              )}

              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Registered Email</label>
                  <div className="flex items-center space-x-2 bg-slate-950 border border-white/10 rounded-2xl px-3.5 py-2.5">
                    <Mail className="w-4 h-4 text-slate-500 shrink-0" />
                    <input
                      type="email"
                      required
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="voyager@example.com"
                      className="w-full bg-transparent text-xs text-white outline-none font-medium"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full bg-[#E7C75F] hover:bg-[#d9b852] text-slate-950 font-bold py-3 px-4 rounded-2xl text-xs flex items-center justify-center space-x-2 shadow-lg cursor-pointer"
                >
                  {resetLoading ? (
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>Send Recovery Link</span>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CINEMATIC AUTHENTICATION OVERLAY */}
      <AnimatePresence>
        {cinematicStep !== 'none' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#060911]/95 backdrop-blur-2xl flex flex-col items-center justify-center text-center p-6 text-white"
          >
            <div className="relative space-y-6 max-w-md">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-slate-900 border border-[#E7C75F]/40 flex items-center justify-center shadow-2xl shadow-[#E7C75F]/20">
                <Compass className="w-10 h-10 text-[#E7C75F] animate-spin" style={{ animationDuration: '6s' }} />
              </div>

              <AnimatePresence mode="wait">
                {cinematicStep === 'welcome' && (
                  <motion.div
                    key="welcome"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-2"
                  >
                    <div className="inline-flex items-center space-x-2 bg-[#E7C75F]/15 border border-[#E7C75F]/30 px-3 py-1 rounded-full text-xs font-bold text-[#E7C75F]">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Credentials Verified</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-white">
                      Welcome, Voyager
                    </h2>
                    <p className="text-xs text-slate-400 font-light">
                      Preparing your personal AI travel companion & digital twins...
                    </p>
                  </motion.div>
                )}

                {cinematicStep === 'preparing' && (
                  <motion.div
                    key="preparing"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-2"
                  >
                    <div className="inline-flex items-center space-x-2 bg-amber-500/15 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-bold text-amber-300">
                      <Compass className="w-3.5 h-3.5" />
                      <span>Initializing Digital Twin</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-white">
                      Launching Travel Engine
                    </h2>
                    <p className="text-xs text-slate-400 font-light">
                      Synchronizing 28 Indian States, 8 Union Territories & AI Itinerary Engines...
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="w-48 h-1 mx-auto bg-slate-900 rounded-full overflow-hidden border border-white/10">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#E7C75F] to-amber-500"
                  initial={{ width: '0%' }}
                  animate={{ width: cinematicStep === 'welcome' ? '50%' : '100%' }}
                  transition={{ duration: 1.1, ease: 'easeInOut' }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Editorial Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-[#060911] py-4 text-center text-[11px] text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>256-Bit SSL Encrypted Firebase Authentication</span>
          </div>
          <span className="font-serif italic">© 2026 Velora AI • Premium AI Travel Companion</span>
        </div>
      </footer>
    </div>
  );
};
