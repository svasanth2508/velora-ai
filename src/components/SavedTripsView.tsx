import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TripPlan } from '../types';
import { Bookmark, Compass, Trash2, Download, Layers, Sparkles, Sliders, ShieldCheck, MapPin, Heart, Utensils, Hotel, Navigation, Zap, Award, Flame } from 'lucide-react';
import { fetchLocationImage, getInstantLocationImage } from '../services/locationImageService';
import { CinematicHero, EditorialSection, VisualIndex } from './layout';

interface SavedTripsViewProps {
  savedTwins: TripPlan[];
  onSelectTwin: (twin: TripPlan) => void;
  onDeleteTwin: (id: string) => void;
  onNavigateToSimulator: () => void;
}

const DEFAULT_DNA_SCORES = {
  nature: 92,
  heritage: 85,
  food: 78,
  adventure: 60,
  luxury: 70,
  calm: 88,
};

const DNA_RECOMMENDED_DESTINATIONS = [
  { name: 'Munnar', state: 'Kerala', reason: 'High Nature (92%) & Slow Travel (88%) Match' },
  { name: 'Jaipur', state: 'Rajasthan', reason: 'High Heritage (85%) & Royal Stay Match' },
  { name: 'Coorg', state: 'Karnataka', reason: 'Coffee Estates & Nature Walk Match' },
  { name: 'Udaipur', state: 'Rajasthan', reason: 'Luxury Lakes & Culture Match' },
  { name: 'Hampi', state: 'Karnataka', reason: 'Ancient ASI Monuments Match' },
];

const TripCard: React.FC<{
  trip: TripPlan;
  onSelectTwin: (trip: TripPlan) => void;
  onDeleteTwin: (id: string) => void;
  onNavigateToSimulator: () => void;
  onExportJson: (trip: TripPlan) => void;
}> = ({ trip, onSelectTwin, onDeleteTwin, onNavigateToSimulator, onExportJson }) => {
  const [cardImage, setCardImage] = useState<string>(
    trip.imageUrl || trip.itinerary?.[0]?.nodes?.[0]?.imageUrl || getInstantLocationImage(trip.destination)
  );

  useEffect(() => {
    let isMounted = true;
    if (!trip.imageUrl) {
      fetchLocationImage(trip.destination).then((url) => {
        if (isMounted && url) setCardImage(url);
      });
    }
    return () => {
      isMounted = false;
    };
  }, [trip.destination, trip.imageUrl]);

  const budgetInr = Math.round((trip.totalBudgetUsd || 500) * 83.75);

  return (
    <div className="bg-slate-950 border border-slate-800/90 rounded-3xl overflow-hidden shadow-2xl hover:border-slate-700 transition-all flex flex-col justify-between group">
      {/* Image Banner */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-900">
        {cardImage ? (
          <img
            src={cardImage}
            alt={trip.destination}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        
        <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-xl border border-slate-700/60 text-xs font-bold text-white flex items-center space-x-1">
          <MapPin className="w-3.5 h-3.5 text-emerald-400" />
          <span>{trip.destination}, {trip.country}</span>
        </div>

        <div className="absolute top-3 right-3 bg-emerald-400 text-slate-950 px-3 py-1 rounded-xl font-black text-xs shadow-lg uppercase tracking-wide">
          {trip.status || 'Active'}
        </div>
      </div>

      <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black text-white tracking-tight">{trip.destination}</h3>
              <span className="text-[11px] text-slate-400 font-mono">
                Created: {trip.createdAt ? new Date(trip.createdAt).toLocaleDateString() : 'Recent'}
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">{trip.summary}</p>

          {/* Metrics row */}
          <div className="grid grid-cols-3 gap-2 text-xs font-mono">
            <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block">Duration</span>
              <span className="text-white font-bold">{trip.durationDays} Days</span>
            </div>
            <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block">Total Budget</span>
              <span className="text-emerald-400 font-bold">₹{budgetInr.toLocaleString('en-IN')}</span>
            </div>
            <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block">Pace</span>
              <span className="text-cyan-400 font-bold capitalize">{trip.pace}</span>
            </div>
          </div>

          {/* Security badges */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {trip.securityBadges?.map((badge, idx) => (
              <span
                key={idx}
                className="px-2.5 py-0.5 bg-slate-900 border border-slate-800 text-[10px] text-slate-300 rounded-lg flex items-center space-x-1"
              >
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>{badge}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Card Actions */}
        <div className="pt-4 border-t border-slate-900 flex items-center justify-between gap-2">
          <button
            onClick={() => {
              onSelectTwin(trip);
              onNavigateToSimulator();
            }}
            className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl transition-all flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/15"
          >
            <Layers className="w-4 h-4" />
            <span>Open in Smart Manager</span>
          </button>

          <button
            onClick={() => onExportJson(trip)}
            className="p-3 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800"
            title="Export Trip JSON Payload"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={() => onDeleteTwin(trip.id)}
            className="p-3 bg-slate-900 hover:bg-rose-500/20 text-rose-400 rounded-xl border border-slate-800 hover:border-rose-500/30"
            title="Delete Saved Trip"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const SavedTripsView: React.FC<SavedTripsViewProps> = ({
  savedTwins,
  onSelectTwin,
  onDeleteTwin,
  onNavigateToSimulator,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'dna' | 'journeys'>('dna');
  const [dnaScores, setDnaScores] = useState(DEFAULT_DNA_SCORES);
  const [dietaryChoice, setDietaryChoice] = useState<string>('Pure Veg');
  const [accommodationChoice, setAccommodationChoice] = useState<string>('Boutique Heritage');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredTwins = savedTwins.filter((t) => {
    const matchesSearch =
      t.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.country?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || (t.status || 'active').toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const handleExportJson = (trip: TripPlan) => {
    const jsonStr = JSON.stringify(trip, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `velora-trip-${trip.destination.toLowerCase().replace(/\s+/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Cinematic Hero Header */}
      <CinematicHero
        badge={{ label: 'Velora Persona & Saved Journeys', icon: Bookmark, variant: 'cyan' }}
        subtitle="Traveler DNA & Custom Blueprint Vault"
        title="Your Travel DNA & Saved Trips"
        description="Interactively tune your travel persona attributes to unlock tailored destination recommendations, manage offline-cached itineraries, and export trip blueprints."
        backgroundImageUrl="https://images.unsplash.com/photo-1506461883276-594a12b11cf3?auto=format&fit=crop&w=1920&q=80"
        metrics={[
          { label: 'Saved Trips', value: `${savedTwins.length}`, icon: Bookmark },
          { label: 'Top Preference', value: 'Nature & Backwaters', icon: Sparkles },
          { label: 'DNA Score', value: '88% Match', icon: Award },
        ]}
        actions={
          <div className="flex bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 backdrop-blur-md">
            <button
              onClick={() => setActiveSubTab('dna')}
              className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center space-x-2 ${
                activeSubTab === 'dna'
                  ? 'bg-[#D8F864] text-slate-950 shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Travel DNA Profile</span>
            </button>
            <button
              onClick={() => setActiveSubTab('journeys')}
              className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center space-x-2 ${
                activeSubTab === 'journeys'
                  ? 'bg-[#D8F864] text-slate-950 shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span>Saved Journeys ({savedTwins.length})</span>
            </button>
          </div>
        }
      />

      {/* SUB-TAB 1: TRAVEL DNA PROFILE */}
      {activeSubTab === 'dna' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Interactive DNA Sliders (7 Cols) */}
          <div className="lg:col-span-7 bg-slate-950/90 border border-slate-800/90 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-900">
              <div>
                <span className="text-[10px] text-teal-400 font-mono font-bold uppercase tracking-widest block">
                  Interactive Preference Tuner
                </span>
                <h2 className="text-xl font-black text-white">Travel DNA Attributes</h2>
              </div>
              <span className="px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-bold">
                Persona Verified
              </span>
            </div>

            {/* Interactive Sliders Grid */}
            <div className="space-y-5">
              {[
                { key: 'nature', label: '🌿 Nature & Backwaters', score: dnaScores.nature, color: 'text-emerald-400' },
                { key: 'heritage', label: '🏛️ Cultural & Monuments', score: dnaScores.heritage, color: 'text-amber-400' },
                { key: 'food', label: '🍲 Gastronomy & Street Food', score: dnaScores.food, color: 'text-orange-400' },
                { key: 'calm', label: '☕ Slow & Serene Travel', score: dnaScores.calm, color: 'text-cyan-400' },
                { key: 'luxury', label: '🏰 Palace & Resort Stay', score: dnaScores.luxury, color: 'text-purple-400' },
                { key: 'adventure', label: '⛰️ Mountain Treks & Thrill', score: dnaScores.adventure, color: 'text-rose-400' },
              ].map((attr) => (
                <div key={attr.key} className="space-y-1.5 p-3 bg-slate-900/60 rounded-2xl border border-slate-800/80">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-extrabold text-white">{attr.label}</span>
                    <span className={`font-mono font-black text-sm ${attr.color}`}>{attr.score}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={attr.score}
                    onChange={(e) =>
                      setDnaScores((prev) => ({ ...prev, [attr.key]: Number(e.target.value) }))
                    }
                    className="w-full accent-teal-400 cursor-pointer h-2 bg-slate-950 rounded-lg"
                  />
                </div>
              ))}
            </div>

            {/* Interactive Preference Chips */}
            <div className="space-y-4 pt-4 border-t border-slate-900">
              <div>
                <label className="text-xs font-black text-white uppercase tracking-wider block mb-2">
                  Dietary Preference
                </label>
                <div className="flex flex-wrap gap-2">
                  {['Pure Veg', 'Local Street Thalis', 'Seafood Specialist', 'Jain Friendly', 'Fine Dining'].map((diet) => (
                    <button
                      key={diet}
                      type="button"
                      onClick={() => setDietaryChoice(diet)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        dietaryChoice === diet
                          ? 'bg-teal-400 text-slate-950 shadow-md shadow-teal-400/20 scale-105'
                          : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                      }`}
                    >
                      {diet}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-white uppercase tracking-wider block mb-2">
                  Preferred Stays
                </label>
                <div className="flex flex-wrap gap-2">
                  {['Boutique Heritage', 'Eco Resort', 'Luxury Villa', 'Scenic Homestay', 'Centrally Located'].map((stay) => (
                    <button
                      key={stay}
                      type="button"
                      onClick={() => setAccommodationChoice(stay)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        accommodationChoice === stay
                          ? 'bg-teal-400 text-slate-950 shadow-md shadow-teal-400/20 scale-105'
                          : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                      }`}
                    >
                      {stay}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Archetype Summary & Recommendations (5 Cols) */}
          <div className="lg:col-span-5 space-y-6 sticky top-24">
            <div className="bg-slate-950/90 border border-slate-800/90 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center space-x-3 pb-3 border-b border-slate-900">
                <div className="p-2.5 bg-teal-500/20 rounded-2xl border border-teal-500/40">
                  <Award className="w-6 h-6 text-teal-400" />
                </div>
                <div>
                  <span className="text-[10px] text-teal-400 font-mono font-bold uppercase block">YOUR AI ARCHETYPE</span>
                  <h3 className="text-lg font-black text-white">The Heritage & Nature Connoisseur</h3>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Based on your live Travel DNA score ({dnaScores.nature}% Nature, {dnaScores.heritage}% Heritage, {dnaScores.calm}% Slow Travel), Velora AI predicts highest satisfaction in peaceful hill towns, historic palace stays, and coastal backwater trails with {dietaryChoice.toLowerCase()} meals.
              </p>

              {/* Top Recommended Destinations */}
              <div className="space-y-3 pt-2">
                <span className="text-xs font-black text-white uppercase tracking-wider block">
                  Top Recommended Destinations
                </span>
                <div className="space-y-2.5">
                  {DNA_RECOMMENDED_DESTINATIONS.map((rec, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800/80 flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-white text-xs block">{rec.name}, {rec.state}</span>
                        <span className="text-[10px] text-teal-400 block font-mono">{rec.reason}</span>
                      </div>
                      <span className="px-2 py-1 bg-teal-500/10 border border-teal-500/30 text-teal-300 text-[10px] font-bold rounded-lg">
                        98% Match
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: SAVED JOURNEYS LIST */}
      {activeSubTab === 'journeys' && (
        <div className="space-y-6">
          {/* Controls Bar: Search & Status Filters */}
          <div className="bg-slate-950/90 border border-slate-800/90 p-4 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search saved trips..."
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-teal-400"
              />
            </div>

            <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto">
              {['all', 'active', 'planning', 'completed'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                    statusFilter === st
                      ? 'bg-teal-400 text-slate-950 shadow-md shadow-teal-400/20'
                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                  }`}
                >
                  {st === 'all' ? 'All Saved' : st}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid */}
          {filteredTwins.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTwins.map((trip) => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  onSelectTwin={onSelectTwin}
                  onDeleteTwin={onDeleteTwin}
                  onNavigateToSimulator={onNavigateToSimulator}
                  onExportJson={handleExportJson}
                />
              ))}
            </div>
          ) : (
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-12 text-center space-y-4 shadow-xl">
              <Compass className="w-12 h-12 text-teal-400 mx-auto animate-pulse" />
              <h3 className="text-lg font-bold text-white">No Saved Journeys Found</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                No trips matched your search filter. Create a new custom itinerary in the AI Plan tab or reset filters.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
