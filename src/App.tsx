import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WifiOff, HardDrive, CheckCircle2, Sparkles, Compass, MapPin, Zap, Bookmark, Layers, MessageSquare, PhoneCall } from 'lucide-react';
import { Navbar, NavTabType } from './components/Navbar';
import { SmartTripManager } from './components/SmartTripManager';
import { AITripPlanner } from './components/AITripPlanner';
import { GoogleMapView } from './components/GoogleMapView';
import { MultilingualTranslatorHub } from './components/MultilingualTranslatorHub';
import { SecurityPrivacyHub } from './components/SecurityPrivacyHub';
import { VeloraCopilot } from './components/VeloraCopilot';
import { SavedTripsView } from './components/SavedTripsView';
import { EmergencySOSHub } from './components/EmergencySOSHub';
import { TravelerToolsHub } from './components/TravelerToolsHub';
import { TouristExplorerHero } from './components/TouristExplorerHero';
import { LiveStatsWidget } from './components/LiveStatsWidget';
import { AuthenticImageRetrievalHub } from './components/AuthenticImageRetrievalHub';
import { IndianStatesGuideHub } from './components/IndianStatesGuideHub';
import { VoiceCommandListener } from './components/VoiceCommandListener';
import { LoginPage } from './components/LoginPage';
import { TravelDashboard } from './components/TravelDashboard';
import {
  getAttractionsByCity,
  mapAttractionToLocationNode,
  INDIAN_CITY_DETAILS
} from './data/indiaTourismDataset';
import { getLocationImage } from './services/locationImageService';

import { INITIAL_USER_PROFILE, SAMPLE_TRIP_TWINS } from './data/mockData';
import { TripPlan, UserProfile } from './types';
import { db, auth, onAuthStateChanged, User } from './lib/firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot, query, where } from 'firebase/firestore';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTabType>('dashboard');
  const [userProfile, setUserProfile] = useState<UserProfile>(INITIAL_USER_PROFILE as any);

  // Initialize from localStorage for offline caching support
  const [savedTrips, setSavedTrips] = useState<TripPlan[]>(() => {
    try {
      const cached = localStorage.getItem('velora_saved_trips');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (err) {
      console.warn('Failed to load saved trips from localStorage:', err);
    }
    return SAMPLE_TRIP_TWINS as any;
  });

  const [currentTrip, setCurrentTrip] = useState<TripPlan>(() => {
    try {
      const cachedTrip = localStorage.getItem('velora_current_trip');
      if (cachedTrip) {
        return JSON.parse(cachedTrip);
      }
    } catch (err) {
      console.warn('Failed to load current trip from localStorage:', err);
    }
    return SAMPLE_TRIP_TWINS[0] as any;
  });

  const [user, setUser] = useState<User | null>(null);
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);

  // Online / Offline network status listener
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync state changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('velora_saved_trips', JSON.stringify(savedTrips));
    } catch (err) {
      console.warn('Failed to cache saved trips to localStorage:', err);
    }
  }, [savedTrips]);

  useEffect(() => {
    try {
      localStorage.setItem('velora_current_trip', JSON.stringify(currentTrip));
    } catch (err) {
      console.warn('Failed to cache current trip to localStorage:', err);
    }
  }, [currentTrip]);

  // Sync Auth and Firestore saved trips
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;

    // Subscribe to user's saved trips in Firestore when online
    const q = query(collection(db, 'savedTrips'), where('userId', '==', user.uid));
    const unsubscribeSnap = onSnapshot(
      q,
      (snapshot) => {
        const fetchedTrips: TripPlan[] = [];
        snapshot.forEach((docSnap) => {
          fetchedTrips.push(docSnap.data() as TripPlan);
        });
        if (fetchedTrips.length > 0) {
          setSavedTrips(fetchedTrips);
          setCurrentTrip(fetchedTrips[0]);
        }
      },
      (error) => {
        console.warn('Firestore snapshot error (using local cache):', error);
      }
    );

    return () => unsubscribeSnap();
  }, [user]);

  const handleTripGenerated = async (newTrip: TripPlan) => {
    setSavedTrips((prev) => [newTrip, ...prev]);
    setCurrentTrip(newTrip);

    if (user) {
      try {
        await setDoc(doc(db, 'savedTrips', newTrip.id), {
          ...newTrip,
          userId: user.uid,
          updatedAt: new Date().toISOString()
        });
      } catch (err) {
        console.error('Error saving trip to Firestore:', err);
      }
    }
  };

  const handleDeleteTrip = async (id: string) => {
    setSavedTrips((prev) => prev.filter((t) => t.id !== id));
    if (currentTrip?.id === id && savedTrips && savedTrips.length > 1) {
      setCurrentTrip(savedTrips.find((t) => t.id !== id) || SAMPLE_TRIP_TWINS[0] as any);
    }

    if (user) {
      try {
        await deleteDoc(doc(db, 'savedTrips', id));
      } catch (err) {
        console.error('Error deleting trip from Firestore:', err);
      }
    }
  };

  // Dedicated Full-Bleed Standalone Login Experience (No Dashboard wrapper or Live Weather Widget)
  if (activeTab === 'login') {
    return (
      <LoginPage
        currentUser={user}
        onLoginSuccess={() => setActiveTab('dashboard')}
        onNavigateHome={() => setActiveTab('dashboard')}
      />
    );
  }

  return (
    <div id="velora-app-root" className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-cyan-500 selection:text-white flex flex-col">
      {/* Global Hands-Free Emergency & Navigation Voice Command Listener */}
      <VoiceCommandListener
        activeTab={activeTab}
        onNavigateTab={(tab) => setActiveTab(tab)}
      />

      {/* Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userProfile={userProfile}
        setUserProfile={setUserProfile}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 space-y-4">
        {/* Offline Connectivity & Local Cache Banner */}
        {isOffline && (
          <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-2xl p-3.5 flex items-center justify-between text-xs backdrop-blur-md shadow-lg animate-pulse">
            <div className="flex items-center space-x-2.5">
              <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="font-semibold">
                Offline Mode Active — Viewing locally cached itineraries for <strong className="text-white">{currentTrip.destination}</strong> and {savedTrips.length} saved trips.
              </span>
            </div>
            <div className="flex items-center space-x-1.5 bg-amber-500/20 px-2.5 py-1 rounded-lg border border-amber-500/30 font-mono text-[11px] text-amber-200">
              <HardDrive className="w-3.5 h-3.5" />
              <span>localStorage Active</span>
            </div>
          </div>
        )}

        {/* Real-time Weather, AQI, Currency & Time Widget */}
        <LiveStatsWidget />

        {/* Tab View Container with Smooth Motion Transitions */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {activeTab === 'dashboard' && (
              <TravelDashboard
                currentTrip={currentTrip}
                savedTrips={savedTrips}
                userProfile={userProfile}
                onSelectTrip={setCurrentTrip}
                onDeleteTrip={handleDeleteTrip}
                onNavigateTab={(tabKey) => setActiveTab(tabKey)}
              />
            )}

            {activeTab === 'simulator' && (
              <div className="space-y-6">
                <TouristExplorerHero
                  onSelectDestination={(destName) => {
                    setCurrentTrip((prev) => ({ ...prev, destination: destName }));
                    setActiveTab('navigation');
                  }}
                  onNavigateToMap={() => setActiveTab('navigation')}
                  onNavigateToPlanner={(prefilledDest) => {
                    if (prefilledDest) {
                      setCurrentTrip((prev) => ({ ...prev, destination: prefilledDest }));
                    }
                    setActiveTab('engine');
                  }}
                  onNavigateToTab={(tabKey) => setActiveTab(tabKey as NavTabType)}
                />

                <SmartTripManager
                  trips={savedTrips}
                  activeTripId={currentTrip?.id}
                  onSelectTrip={(id) => {
                    const t = savedTrips.find((x) => x.id === id);
                    if (t) setCurrentTrip(t);
                  }}
                  onCreateNewTrip={() => setActiveTab('engine')}
                  onUpdateTrips={(updatedList) => {
                    setSavedTrips(updatedList);
                    const updatedCurrent = updatedList.find((t) => t.id === currentTrip?.id);
                    if (updatedCurrent) setCurrentTrip(updatedCurrent);
                  }}
                  currentTrip={currentTrip}
                  onUpdateTrip={(updated) => {
                    setCurrentTrip(updated);
                    setSavedTrips((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
                  }}
                  onNavigateToPlanner={() => setActiveTab('engine')}
                  onNavigateToMap={() => setActiveTab('navigation')}
                />
              </div>
            )}

            {activeTab === 'navigation' && (
              <GoogleMapView
                trip={currentTrip}
                initialDestination={currentTrip?.destination}
                onSelectDestinationForTrip={(dest) => {
                  setCurrentTrip((prev) => ({ ...prev, destination: dest }));
                  setActiveTab('simulator');
                }}
              />
            )}

            {activeTab === 'engine' && (
              <AITripPlanner
                userProfile={userProfile}
                onTripGenerated={handleTripGenerated}
                onNavigateToManager={() => setActiveTab('simulator')}
              />
            )}

            {activeTab === 'states' && (
              <IndianStatesGuideHub
                onSelectDestinationForMap={(destQuery) => {
                  setCurrentTrip((prev) => ({ ...prev, destination: destQuery }));
                  setActiveTab('navigation');
                }}
                onNavigateToPlanner={(destQuery) => {
                  setCurrentTrip((prev) => ({ ...prev, destination: destQuery }));
                  setActiveTab('engine');
                }}
              />
            )}

            {activeTab === 'translator' && <MultilingualTranslatorHub />}

            {activeTab === 'images' && <AuthenticImageRetrievalHub />}

            {activeTab === 'emergency' && (
              <EmergencySOSHub
                userProfile={userProfile}
                currentTrip={currentTrip}
              />
            )}

            {activeTab === 'tools' && <TravelerToolsHub />}

            {activeTab === 'security' && (
              <SecurityPrivacyHub
                userProfile={userProfile}
                setUserProfile={setUserProfile}
              />
            )}

            {activeTab === 'saved' && (
              <SavedTripsView
                savedTwins={savedTrips}
                onSelectTwin={setCurrentTrip}
                onDeleteTwin={handleDeleteTrip}
                onNavigateToSimulator={() => setActiveTab('simulator')}
              />
            )}

            {activeTab === 'copilot' && (
              <VeloraCopilot currentTwin={currentTrip as any} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Floating Quick Copilot Action Button (when not on Copilot tab) */}
      {activeTab !== 'copilot' && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 260, damping: 20 }}
          className="fixed bottom-20 sm:bottom-6 right-6 z-40 flex items-center space-x-2"
        >
          <button
            onClick={() => setActiveTab('copilot')}
            className="flex items-center space-x-2 px-4 py-3 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-slate-950 font-extrabold text-xs rounded-full shadow-2xl shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all group ring-2 ring-white/20"
          >
            <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            <span className="hidden sm:inline">Ask Velora Copilot</span>
            <span className="sm:hidden">Copilot</span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-950 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-950"></span>
            </span>
          </button>
        </motion.div>
      )}

      {/* Fixed Mobile Bottom Navigation Bar (Dashboard | Explore | Map | Plan | Trips) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800 py-2 px-3 flex items-center justify-around text-white shadow-2xl">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: Layers },
          { id: 'simulator', label: 'Explore', icon: Compass },
          { id: 'navigation', label: 'Map', icon: MapPin },
          { id: 'engine', label: 'Plan', icon: Zap },
          { id: 'saved', label: 'Trips', icon: Bookmark },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as NavTabType)}
              className={`flex flex-col items-center justify-center space-y-1 px-3 py-1 rounded-2xl transition-all ${
                isActive ? 'text-[#D8F864] font-black' : 'text-slate-400 hover:text-white font-medium'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-[#D8F864] stroke-[2.5]' : 'text-slate-400'}`} />
              <span className="text-[10px] tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <span className="font-bold text-slate-300">Velora AI</span> • AI Travel Companion & Trip Management System
          </div>
          <div className="flex items-center space-x-4">
            <span>Server Proxy Protected</span>
            <span>•</span>
            <span>24x7 SOS Safety Shield</span>
            <span>•</span>
            <span>Gemini 3.6 Flash</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
