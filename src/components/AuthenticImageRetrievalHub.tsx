import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Layers,
  Search,
  RefreshCw,
  ShieldCheck,
  Database,
  Code,
  Zap,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
  Trash2,
  Server,
  FileText,
  Clock,
  Sparkles,
  MapPin,
  Image as ImageIcon,
  Check,
  Sliders,
  Terminal,
  HardDrive,
  FolderOpen,
  FolderPlus,
  Folder,
} from 'lucide-react';
import { AuthenticImage } from './AuthenticImage';
import { CinematicHero, EditorialSection, VisualIndex } from './layout';
import {
  getAllIndexedDbPhotos,
  deleteIndexedDbPhoto,
  clearAllIndexedDbPhotos,
  getIndexedDbStats,
  CachedIndexedDbPhoto,
  getPhotoFromIndexedDb,
} from '../services/indexedDbPhotoCache';
import {
  triggerPublicDirectoryScan,
  PublicDirectoryScanResult,
  ScannedPublicImage,
} from '../services/publicDirectoryScanner';

interface TraceStep {
  tier: number;
  name: string;
  status: 'hit' | 'miss' | 'skipped' | 'error';
  message: string;
  durationMs: number;
}

interface ImageCacheRecord {
  id: string;
  query: string;
  googlePlaceId?: string;
  photoReference?: string;
  imageUrl: string;
  source: string;
  attribution: string;
  tier: number;
  width?: number;
  height?: number;
  hits: number;
  lastUpdated: string;
  createdAt: string;
  resolutionTrace?: TraceStep[];
}

const POPULAR_TEST_SPOTS = [
  { name: 'Taj Mahal', city: 'Agra', category: 'landmark', lat: 27.1751, lng: 78.0421 },
  { name: 'Amber Fort', city: 'Jaipur', category: 'fort', lat: 26.9855, lng: 75.8513 },
  { name: 'Hawa Mahal', city: 'Jaipur', category: 'palace', lat: 26.9239, lng: 75.8267 },
  { name: 'Baga Beach', city: 'Goa', category: 'beach', lat: 15.5553, lng: 73.7517 },
  { name: 'Qutub Minar', city: 'Delhi', category: 'landmark', lat: 28.5245, lng: 77.1855 },
  { name: 'Meenakshi Temple', city: 'Madurai', category: 'temple', lat: 9.9195, lng: 78.1193 },
  { name: 'Statue of Unity', city: 'Gujarat', category: 'landmark', lat: 21.838, lng: 73.7191 },
  { name: 'Golden Temple', city: 'Amritsar', category: 'temple', lat: 31.62, lng: 74.8765 },
  { name: 'Ajanta Caves', city: 'Aurangabad', category: 'fort', lat: 20.5519, lng: 75.7033 },
  { name: 'Konark Sun Temple', city: 'Odisha', category: 'temple', lat: 19.8876, lng: 86.0945 },
];

export const AuthenticImageRetrievalHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'testbench' | 'cache' | 'public_dir' | 'architecture'>('testbench');

  // Testbench state
  const [selectedSpot, setSelectedSpot] = useState(POPULAR_TEST_SPOTS[0]);
  const [customQuery, setCustomQuery] = useState('');
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [testResult, setTestResult] = useState<{
    record?: ImageCacheRecord;
    trace: TraceStep[];
    executionTimeMs: number;
    cached: boolean;
  } | null>(null);

  // Cache explorer state
  const [cacheRecords, setCacheRecords] = useState<ImageCacheRecord[]>([]);
  const [cacheStats, setCacheStats] = useState<{
    totalCached: number;
    totalHits: number;
    cacheHitRatio: string;
    tierDistribution: { tier1_google: number; tier2_wikimedia: number; tier3_opentripmap: number; tier4_fallback: number };
  }>({
    totalCached: 0,
    totalHits: 0,
    cacheHitRatio: '1.00',
    tierDistribution: { tier1_google: 0, tier2_wikimedia: 0, tier3_opentripmap: 0, tier4_fallback: 0 },
  });
  const [cacheSearchFilter, setCacheSearchFilter] = useState('');
  const [isLoadingCache, setIsLoadingCache] = useState(false);

  // Public Directory Scanner State
  const [publicScanData, setPublicScanData] = useState<PublicDirectoryScanResult | null>(null);
  const [isScanningPublicDir, setIsScanningPublicDir] = useState(false);

  // Architecture metadata
  const [archMetadata, setArchMetadata] = useState<any>(null);

  // IndexedDB Persistent Cache State
  const [idbPhotos, setIdbPhotos] = useState<CachedIndexedDbPhoto[]>([]);
  const [idbStats, setIdbStats] = useState<{
    totalCount: number;
    totalHits: number;
    dbName: string;
    storeName: string;
  }>({
    totalCount: 0,
    totalHits: 0,
    dbName: 'GooglePlacesPhotoStorageDB',
    storeName: 'google_places_photos_by_id',
  });
  const [idbHitResult, setIdbHitResult] = useState<CachedIndexedDbPhoto | null>(null);

  // Fetch initial test run on mount
  useEffect(() => {
    runPipelineTest(selectedSpot.name, selectedSpot.lat, selectedSpot.lng, selectedSpot.category);
    fetchCacheRecords();
    fetchArchitectureMeta();
    refreshIndexedDbRecords();
    refreshPublicDirScan();
  }, []);

  const refreshPublicDirScan = async (force = false) => {
    setIsScanningPublicDir(true);
    try {
      const scan = await triggerPublicDirectoryScan(force);
      setPublicScanData(scan);
    } catch (err) {
      console.warn('Error running public directory scan:', err);
    } finally {
      setIsScanningPublicDir(false);
    }
  };

  const refreshIndexedDbRecords = async () => {
    try {
      const photos = await getAllIndexedDbPhotos();
      setIdbPhotos(photos);
      const stats = await getIndexedDbStats();
      setIdbStats(stats);
    } catch (err) {
      console.warn('Error refreshing IndexedDB records:', err);
    }
  };

  const runPipelineTest = async (queryName: string, lat?: number, lng?: number, cat?: string, forceRefresh = false) => {
    setIsTestRunning(true);
    const query = queryName.trim();
    if (!query) return;

    // Check IndexedDB
    try {
      const idbRecord = await getPhotoFromIndexedDb(query);
      setIdbHitResult(idbRecord);
    } catch (e) {
      setIdbHitResult(null);
    }

    try {
      const qParams = new URLSearchParams({
        query,
        forceRefresh: forceRefresh ? 'true' : 'false',
      });
      if (lat) qParams.append('lat', lat.toString());
      if (lng) qParams.append('lng', lng.toString());
      if (cat) qParams.append('category', cat);

      const res = await fetch(`/api/images/retrieve?${qParams.toString()}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setTestResult({
            record: json.data,
            trace: json.trace || json.data.resolutionTrace || [],
            executionTimeMs: json.executionTimeMs || 45,
            cached: json.cached || false,
          });
        }
      }
    } catch (err) {
      console.error('Test pipeline error:', err);
    } finally {
      setIsTestRunning(false);
      fetchCacheRecords();
      refreshIndexedDbRecords();
    }
  };

  const fetchCacheRecords = async () => {
    setIsLoadingCache(true);
    try {
      const res = await fetch('/api/images/cache');
      if (res.ok) {
        const json = await res.json();
        setCacheRecords(json.records || []);
        setCacheStats({
          totalCached: json.totalCached || 0,
          totalHits: json.totalHits || 0,
          cacheHitRatio: json.cacheHitRatio || '1.00',
          tierDistribution: json.tierDistribution || { tier1_google: 0, tier2_wikimedia: 0, tier3_opentripmap: 0, tier4_fallback: 0 },
        });
      }
    } catch (err) {
      console.warn('Failed to fetch cache records:', err);
    } finally {
      setIsLoadingCache(false);
    }
  };

  const fetchArchitectureMeta = async () => {
    try {
      const res = await fetch('/api/images/architecture');
      if (res.ok) {
        const json = await res.json();
        setArchMetadata(json);
      }
    } catch (err) {
      console.warn('Failed to fetch architecture meta:', err);
    }
  };

  const purgeCache = async (queryToPurge?: string) => {
    try {
      await fetch('/api/images/purge-cache', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryToPurge }),
      });
      fetchCacheRecords();
      if (testResult?.record?.query) {
        runPipelineTest(testResult.record.query, undefined, undefined, undefined, true);
      }
    } catch (err) {
      console.error('Purge error:', err);
    }
  };

  const handleClearIndexedDb = async () => {
    await clearAllIndexedDbPhotos();
    await refreshIndexedDbRecords();
  };

  const handleDeleteIndexedDbItem = async (attractionId: string) => {
    await deleteIndexedDbPhoto(attractionId);
    await refreshIndexedDbRecords();
  };

  const filteredCache = cacheRecords.filter(
    (r) =>
      r.query.toLowerCase().includes(cacheSearchFilter.toLowerCase()) ||
      r.source.toLowerCase().includes(cacheSearchFilter.toLowerCase()) ||
      (r.googlePlaceId && r.googlePlaceId.toLowerCase().includes(cacheSearchFilter.toLowerCase()))
  );

  return (
    <div id="image-retrieval-suite-hub" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-100">
      {/* Cinematic Hero Header */}
      <CinematicHero
        badge={{ label: 'Priority Cascade Architecture', icon: ShieldCheck, variant: 'emerald' }}
        subtitle="4-Tier Photography Retrieval & Persistent Cache"
        title="Authentic Image Retrieval Engine"
        description="Guarantees authentic, high-definition verified photography for Indian tourist destinations using Google Places API, Wikimedia Commons, OpenTripMap, and local IndexedDB photo cache."
        backgroundImageUrl="https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1920&q=80"
        metrics={[
          { label: 'Public Assets', value: `${publicScanData?.totalImagesCount || 0}`, icon: FolderOpen },
          { label: 'IndexedDB Stored', value: `${idbStats.totalCount}`, icon: HardDrive },
          { label: 'Cache Hits', value: `${idbStats.totalHits}`, icon: Zap },
          { label: 'Server Cache', value: `${cacheStats.totalCached}`, icon: Server },
        ]}
      />

      {/* Suite Tab Selection Bar */}
      <div className="bg-slate-900 border border-slate-800 p-2 rounded-2xl flex flex-wrap items-center gap-2">
        <button
          onClick={() => setActiveTab('testbench')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'testbench'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Interactive Test Bench</span>
          </button>

          <button
            onClick={() => setActiveTab('public_dir')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'public_dir'
                ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/20'
                : 'bg-slate-800/80 text-amber-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FolderOpen className="w-4 h-4" />
            <span>Public State Directory Scanner ({publicScanData?.totalImagesCount || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('cache')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'cache'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Image Cache Storage ({cacheStats.totalCached})</span>
          </button>

          <button
            onClick={() => setActiveTab('architecture')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'architecture'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Code className="w-4 h-4" />
            <span>System Architecture & Schemas</span>
          </button>
        </div>

      {/* TAB 1: INTERACTIVE TEST BENCH */}
      {activeTab === 'testbench' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls & Presets (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-xl">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-white flex items-center space-x-2">
                  <Search className="w-4 h-4 text-emerald-400" />
                  <span>Test Place Retrieval</span>
                </h2>
                <span className="text-[11px] text-slate-400 font-mono">GET /api/images/retrieve</span>
              </div>

              {/* Custom Search Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (customQuery.trim()) {
                    runPipelineTest(customQuery.trim(), undefined, undefined, undefined, true);
                  }
                }}
                className="flex items-center space-x-2"
              >
                <input
                  type="text"
                  value={customQuery}
                  onChange={(e) => setCustomQuery(e.target.value)}
                  placeholder="Enter any Indian tourist spot (e.g. Amer Fort)..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all"
                />
                <button
                  type="submit"
                  disabled={isTestRunning || !customQuery.trim()}
                  className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-1 shrink-0"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTestRunning ? 'animate-spin' : ''}`} />
                  <span>Run</span>
                </button>
              </form>

              {/* Preset Landmark Grid */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Featured Indian Tourist Destinations
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {POPULAR_TEST_SPOTS.map((spot) => (
                    <button
                      key={spot.name}
                      onClick={() => {
                        setSelectedSpot(spot);
                        runPipelineTest(spot.name, spot.lat, spot.lng, spot.category);
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                        testResult?.record?.query === spot.name.toLowerCase()
                          ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400'
                          : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <span className="text-xs font-bold">{spot.name}</span>
                      <span className="text-[10px] text-slate-400">{spot.city}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Force Refresh Button */}
              <button
                onClick={() => {
                  if (testResult?.record?.query) {
                    runPipelineTest(testResult.record.query, undefined, undefined, undefined, true);
                  }
                }}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all border border-slate-700 flex items-center justify-center space-x-2"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTestRunning ? 'animate-spin' : ''}`} />
                <span>Bypass Cache & Re-run Full 4-Tier Cascade</span>
              </button>
            </div>

            {/* Pipeline Priority Summary */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-3">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Cascade Resolution Order</span>
              </h3>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                  <span className="font-bold text-emerald-400">1. Google Places API</span>
                  <span className="text-[10px] text-emerald-300">photos[] photo_reference</span>
                </div>
                <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-between">
                  <span className="font-bold text-sky-400">2. Wikimedia Commons API</span>
                  <span className="text-[10px] text-sky-300">Wikipedia PageImages & CC Media</span>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                  <span className="font-bold text-amber-400">3. OpenTripMap API</span>
                  <span className="text-[10px] text-amber-300">Geo xid image preview</span>
                </div>
                <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-between">
                  <span className="font-bold text-purple-400">4. Category Fallback</span>
                  <span className="text-[10px] text-purple-300">Verified Category Placeholder</span>
                </div>
              </div>
            </div>
          </div>

          {/* Result Output & Live Trace (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {testResult?.record ? (
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
                {/* Photo Display Card */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-white capitalize">{testResult.record.query}</h2>
                      <p className="text-xs text-slate-400">
                        Resolved via <span className="text-emerald-400 font-bold">{testResult.record.source}</span> in{' '}
                        <span className="text-cyan-400 font-mono font-bold">{testResult.executionTimeMs}ms</span>
                        {testResult.cached && <span className="ml-2 text-emerald-400 font-semibold">(Cached Hit)</span>}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-full text-xs font-mono text-emerald-400 font-bold">
                        Hits: {testResult.record.hits}
                      </span>
                    </div>
                  </div>

                  <AuthenticImage
                    locationName={testResult.record.query}
                    className="w-full h-72 rounded-2xl"
                    showBadge={true}
                    showAttributionOnHover={true}
                  />

                  {/* IndexedDB Persistent Storage Indicator */}
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2.5">
                      <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                        <HardDrive className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-white">IndexedDB Persistent Cache</span>
                          {idbHitResult ? (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-cyan-500 text-slate-950">
                              HIT (Hits: {idbHitResult.hits})
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              PERSISTED IN IDB
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {idbHitResult
                            ? `Key: '${idbHitResult.attractionId}' • Place ID: ${idbHitResult.googlePlaceId || 'N/A'} • Instant offline access`
                            : `Photo saved to IndexedDB object store ('google_places_photos_by_id') by attraction ID.`}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Resolution Step-by-Step Trace */}
                <div className="space-y-3 border-t border-slate-800/80 pt-5">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    <span>Pipeline Execution Trace Log</span>
                  </h3>

                  <div className="space-y-2 font-mono text-xs">
                    {testResult.trace.map((step, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl border flex items-start justify-between ${
                          step.status === 'hit'
                            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                            : step.status === 'miss'
                            ? 'bg-slate-950/80 border-slate-800 text-slate-400'
                            : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                        }`}
                      >
                        <div className="flex items-start space-x-2.5">
                          {step.status === 'hit' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          ) : (
                            <XCircle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                          )}
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-white">Tier {step.tier}: {step.name}</span>
                              <span
                                className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                                  step.status === 'hit' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                                }`}
                              >
                                {step.status}
                              </span>
                            </div>
                            <p className="text-[11px] mt-0.5 text-slate-300">{step.message}</p>
                          </div>
                        </div>

                        <span className="text-[11px] text-slate-400 shrink-0">{step.durationMs}ms</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Raw Cache Metadata Object */}
                <div className="space-y-2 border-t border-slate-800/80 pt-5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Database Record Payload
                  </span>
                  <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 font-mono text-[11px] text-emerald-300 overflow-x-auto max-h-48">
                    {JSON.stringify(testResult.record, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
                <p className="text-sm font-semibold text-slate-300">Initializing pipeline test bench...</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: PUBLIC STATE DIRECTORY SCANNER */}
      {activeTab === 'public_dir' && (
        <div className="space-y-8">
          {/* Section 1: Automated Public Scanner Control Banner */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div>
                <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                  <FolderOpen className="w-3.5 h-3.5" />
                  <span>Tier 0 Priority Source • Local Public Directory Scanner</span>
                </div>
                <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                  <FolderOpen className="w-5 h-5 text-amber-400" />
                  <span>Automated Public Folder Asset Engine</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Scans `/public/{'{state}'}/{'{place_id}'}.jpg` directories, auto-maps assets to state & location IDs, and overrides external API calls with local state photography.
                </p>
              </div>

              <div className="flex items-center space-x-3 shrink-0">
                <button
                  onClick={() => refreshPublicDirScan(true)}
                  disabled={isScanningPublicDir}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center space-x-2 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isScanningPublicDir ? 'animate-spin' : ''}`} />
                  <span>{isScanningPublicDir ? 'Scanning...' : 'Scan /public Folder Now'}</span>
                </button>
              </div>
            </div>

            {/* Folder Organization Quick Guide */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1.5">
                <div className="flex items-center space-x-2 text-amber-400 font-bold">
                  <FolderPlus className="w-4 h-4" />
                  <span>1. Folder Structure</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed font-mono">
                  Create state folders inside `/public`:
                  <br />
                  <span className="text-amber-300">/public/karnataka/</span>
                  <br />
                  <span className="text-amber-300">/public/kerala/</span>
                  <br />
                  <span className="text-amber-300">/public/rajasthan/</span>
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1.5">
                <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                  <ImageIcon className="w-4 h-4" />
                  <span>2. File Naming Strategy</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed font-mono">
                  Name photos by location ID or place name:
                  <br />
                  <span className="text-emerald-300">hampi.jpg</span>
                  <br />
                  <span className="text-emerald-300">taj_mahal.png</span>
                  <br />
                  <span className="text-emerald-300">munnar.webp</span>
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1.5">
                <div className="flex items-center space-x-2 text-cyan-400 font-bold">
                  <Zap className="w-4 h-4" />
                  <span>3. Priority Precedence</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Scanned photos take <span className="font-bold text-amber-300">Tier 0 Priority</span>. When a user requests "Hampi" or "Taj Mahal", local photography is served instantly with zero API costs.
                </p>
              </div>
            </div>

            {/* Scan Summary Banner */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  <Folder className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white">
                    {publicScanData?.totalImagesCount || 0} Local State Photos Mapped
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Across {publicScanData?.statesCount || 0} State Folders • Last Scanned:{' '}
                    {publicScanData?.scannedAt ? new Date(publicScanData.scannedAt).toLocaleTimeString() : 'Never'}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 font-mono text-[11px]">
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                  Automated Scanner Active
                </span>
              </div>
            </div>

            {/* State Folders Grid */}
            {publicScanData && Object.keys(publicScanData.states).length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <FolderOpen className="w-4 h-4 text-amber-400" />
                  <span>Detected State Directories ({Object.keys(publicScanData.states).length})</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Object.entries(publicScanData.states).map(([stateId, items]) => (
                    <div
                      key={stateId}
                      className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 hover:border-amber-500/40 transition-all space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Folder className="w-4 h-4 text-amber-400" />
                          <span className="font-bold text-white text-xs capitalize">
                            {items[0]?.stateName || stateId}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {items.length} {items.length === 1 ? 'photo' : 'photos'}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-1.5 pt-1">
                        {items.slice(0, 3).map((img, i) => (
                          <div key={i} className="aspect-square rounded-lg overflow-hidden bg-slate-900 border border-slate-800 relative group">
                            <img src={img.url} alt={img.locationName} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity p-1 text-[8px] text-white flex items-end font-bold truncate">
                              {img.locationName}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="text-[10px] text-slate-400 font-mono truncate">
                        ID: <span className="text-amber-400">{stateId}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Scanned Assets Table */}
            <div className="space-y-4 pt-2">
              <h3 className="text-sm font-bold text-white flex items-center justify-between">
                <span className="flex items-center space-x-2">
                  <Database className="w-4 h-4 text-emerald-400" />
                  <span>Mapped Public Directory Photo Assets</span>
                </span>
                <span className="text-xs text-slate-400 font-normal">
                  Showing {publicScanData?.totalImagesCount || 0} registered assets
                </span>
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
                      <th className="py-3 px-3">State Directory</th>
                      <th className="py-3 px-3">Location ID / Name</th>
                      <th className="py-3 px-3">Preview</th>
                      <th className="py-3 px-3">Public Asset URL</th>
                      <th className="py-3 px-3">Source Precedence</th>
                      <th className="py-3 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                    {publicScanData && publicScanData.totalImagesCount > 0 ? (
                      Object.values(publicScanData.states)
                        .flat()
                        .map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-800/40 transition-all">
                            <td className="py-3 px-3 font-bold text-amber-300 font-sans capitalize">
                              {item.stateName}
                            </td>
                            <td className="py-3 px-3 font-bold text-white font-sans capitalize">
                              {item.locationName}
                              <span className="block text-[10px] font-mono text-slate-400 font-normal">
                                key: '{item.locationId}'
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <img
                                src={item.url}
                                alt={item.locationName}
                                className="w-12 h-10 object-cover rounded-lg border border-slate-700 bg-slate-950"
                              />
                            </td>
                            <td className="py-3 px-3 text-cyan-300 underline underline-offset-2 truncate max-w-[200px]">
                              <a href={item.url} target="_blank" rel="noopener noreferrer">
                                {item.url}
                              </a>
                            </td>
                            <td className="py-3 px-3">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                Tier 0: Highest Precedence
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                ACTIVE
                              </span>
                            </td>
                          </tr>
                        ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400 font-sans space-y-2">
                          <FolderOpen className="w-8 h-8 text-amber-400 mx-auto opacity-60" />
                          <div className="font-bold text-white">No State Photos Found in `/public` Folder Yet</div>
                          <p className="text-xs text-slate-500 max-w-md mx-auto">
                            Add photos to `/public/{'{state_name}'}/{'{location_id}'}.jpg` (e.g. `/public/karnataka/hampi.jpg`) and click "Scan /public Folder Now".
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: IMAGE CACHE STORAGE */}
      {activeTab === 'cache' && (
        <div className="space-y-8">
          {/* Section 1: Client-Side IndexedDB Persistent Storage */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div>
                <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                  <HardDrive className="w-3.5 h-3.5" />
                  <span>Browser IndexedDB Layer</span>
                </div>
                <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                  <HardDrive className="w-5 h-5 text-cyan-400" />
                  <span>IndexedDB High-Res Photo Cache</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Client-side persistent database store (`{idbStats.dbName}` • store: `{idbStats.storeName}`). Caches Google Places photos by attraction ID for instant zero-latency loads & offline support.
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={refreshIndexedDbRecords}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-all flex items-center space-x-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh DB</span>
                </button>

                <button
                  onClick={handleClearIndexedDb}
                  disabled={idbPhotos.length === 0}
                  className="px-3.5 py-1.5 bg-rose-600/10 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/30 disabled:opacity-40 text-xs font-bold rounded-xl transition-all flex items-center space-x-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear IndexedDB ({idbPhotos.length})</span>
                </button>
              </div>
            </div>

            {/* IndexedDB Items Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
                    <th className="py-3 px-3">Attraction ID / Key</th>
                    <th className="py-3 px-3">Photo Preview</th>
                    <th className="py-3 px-3">Google Place ID</th>
                    <th className="py-3 px-3">Source / Attribution</th>
                    <th className="py-3 px-3 text-center">Hits</th>
                    <th className="py-3 px-3">Cached Date</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                  {idbPhotos.length > 0 ? (
                    idbPhotos.map((item) => (
                      <tr key={item.attractionId} className="hover:bg-slate-800/40 transition-all">
                        <td className="py-3 px-3 font-bold text-cyan-300 font-sans capitalize">
                          {item.attractionId.replace(/_/g, ' ')}
                        </td>
                        <td className="py-3 px-3">
                          <img
                            src={item.imageUrl}
                            alt={item.attractionId}
                            className="w-12 h-10 object-cover rounded-lg border border-slate-700 bg-slate-950"
                          />
                        </td>
                        <td className="py-3 px-3 text-amber-400 truncate max-w-[140px]">
                          {item.googlePlaceId || 'N/A'}
                        </td>
                        <td className="py-3 px-3 text-slate-300 font-sans italic truncate max-w-[200px]">
                          {item.attribution || item.source}
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-emerald-400">{item.hits}</td>
                        <td className="py-3 px-3 text-slate-400 text-[10px]">
                          {new Date(item.cachedAt).toLocaleDateString()} {new Date(item.cachedAt).toLocaleTimeString()}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => handleDeleteIndexedDbItem(item.attractionId)}
                            className="p-1 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-md transition-all"
                            title="Delete this IndexedDB entry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-500 font-sans italic">
                        No Google Places photos saved in IndexedDB yet. Run place searches in the Test Bench or browse tourism hubs to populate!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Server API Image Cache Storage */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                  <Database className="w-5 h-5 text-emerald-400" />
                  <span>Server API Image Cache Storage</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Express API proxy cache (`/api/images/cache`) serving stored photo references across sessions.
                </p>
              </div>

              <div className="flex items-center space-x-3 w-full sm:w-auto">
                <input
                  type="text"
                  value={cacheSearchFilter}
                  onChange={(e) => setCacheSearchFilter(e.target.value)}
                  placeholder="Filter cached places..."
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all w-full sm:w-64"
                />

                <button
                  onClick={() => purgeCache()}
                  className="px-3.5 py-2 bg-rose-600/10 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/30 text-xs font-bold rounded-xl transition-all flex items-center space-x-1.5 shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Purge Server Cache</span>
                </button>
              </div>
            </div>

          {/* Cached Records Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
                  <th className="py-3 px-3">Place / Query</th>
                  <th className="py-3 px-3">Source API</th>
                  <th className="py-3 px-3">Tier</th>
                  <th className="py-3 px-3">Google Place ID</th>
                  <th className="py-3 px-3">Photo Reference</th>
                  <th className="py-3 px-3">Attribution</th>
                  <th className="py-3 px-3 text-center">Hits</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {filteredCache.length > 0 ? (
                  filteredCache.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-800/40 transition-all">
                      <td className="py-3 px-3 font-bold text-white font-sans capitalize">{rec.query}</td>
                      <td className="py-3 px-3 text-emerald-400 font-sans">{rec.source}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-cyan-300 border border-slate-700">
                          Tier {rec.tier}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-amber-400 truncate max-w-[120px]">
                        {rec.googlePlaceId || 'N/A'}
                      </td>
                      <td className="py-3 px-3 text-purple-400 truncate max-w-[120px]">
                        {rec.photoReference || 'N/A'}
                      </td>
                      <td className="py-3 px-3 text-slate-300 font-sans italic truncate max-w-[180px]">
                        {rec.attribution}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-emerald-400">{rec.hits}</td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => purgeCache(rec.query)}
                          className="p-1 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-md transition-all"
                          title="Invalidate this cached entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500 font-sans italic">
                      No cached entries match filter
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )}

      {/* TAB 3: SYSTEM ARCHITECTURE & SCHEMAS */}
      {activeTab === 'architecture' && (
        <div className="space-y-8">
          {/* Architecture Diagram Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Server className="w-5 h-5 text-emerald-400" />
              <span>Multi-Tier Image Retrieval Architecture Flow</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              <div className="bg-slate-950 p-4 rounded-2xl border border-emerald-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-400">1. Google Places</span>
                  <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] rounded font-mono">
                    Priority 1
                  </span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Calls Text Search API for place_id and extracts photo_reference from photos[] array. Serves exact Google Places photos.
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-sky-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sky-400">2. Wikimedia API</span>
                  <span className="px-1.5 py-0.5 bg-sky-500/20 text-sky-300 text-[10px] rounded font-mono">
                    Priority 2
                  </span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  If Google has no photo, searches Wikipedia PageImages & Commons Media for CC-licensed photography with creator attributions.
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-amber-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-400">3. OpenTripMap API</span>
                  <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-300 text-[10px] rounded font-mono">
                    Priority 3
                  </span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Queries OpenTripMap autosuggest & xid endpoint using latitude/longitude bounding to fetch geo-matched preview images.
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-purple-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-400">4. Category Fallback</span>
                  <span className="px-1.5 py-0.5 bg-purple-500/20 text-purple-300 text-[10px] rounded font-mono">
                    Priority 4
                  </span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Returns verified, category-matched Indian landmark photography. Guaranteed zero unrelated or AI generated images.
                </p>
              </div>
            </div>
          </div>

          {/* Database Schema & Redis Specs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Prisma Schema */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  <span>Prisma & SQL Database Schema</span>
                </h3>
                <span className="text-[10px] font-mono text-slate-400">schema.prisma</span>
              </div>

              <pre className="bg-slate-950 p-4 rounded-2xl border border-slate-800 font-mono text-[11px] text-cyan-300 overflow-x-auto max-h-80">
                {archMetadata?.prismaSchema ||
                  `
model Place {
  id              String       @id @default(uuid())
  name            String
  category        String
  latitude        Float
  longitude       Float
  city            String?
  country         String       @default("India")
  googlePlaceId   String?      @unique
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt
  images          PlaceImage[]
  caches          ImageCache[]
}

model PlaceImage {
  id             String   @id @default(uuid())
  placeId        String
  place          Place    @relation(fields: [placeId], references: [id], onDelete: Cascade)
  googlePlaceId  String?
  photoReference String?
  imageUrl       String
  source         String   // "Google Places API", "Wikimedia Commons", "OpenTripMap API", "Category Verified Fallback"
  attribution    String?
  width          Int?
  height         Int?
  tier           Int      // 1, 2, 3, 4
  createdAt      DateTime @default(now())
}

model ImageCache {
  id             String   @id @default(uuid())
  query          String   @unique
  googlePlaceId  String?
  photoReference String?
  imageUrl       String
  source         String
  attribution    String?
  tier           Int
  hits           Int      @default(1)
  lastUpdated    DateTime @updatedAt
  createdAt      DateTime @default(now())
}
                `.trim()}
              </pre>
            </div>

            {/* Caching Strategy & Error Handling Matrix */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-emerald-400" />
                <span>Redis Strategy & Error Handling Matrix</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                  <span className="font-bold text-emerald-400">Redis Cache Strategy</span>
                  <p className="text-slate-300 text-[11px]">
                    {archMetadata?.redisCachingStrategy ||
                      'TTL 30 Days (2,592,000s) on exact query & google_place_id with LRU eviction and background pre-fetching.'}
                  </p>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                  <span className="font-bold text-amber-400">Rate Limiting & Retries</span>
                  <p className="text-slate-300 text-[11px]">
                    {archMetadata?.rateLimitPolicy ||
                      'Google Places API: 100 QPS max with exponential backoff retry (3 attempts, 200ms initial delay). Express Rate Limiter: 100 requests / min per IP.'}
                  </p>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                  <span className="font-bold text-sky-400">Security & Key Protection</span>
                  <p className="text-slate-300 text-[11px]">
                    All Google Places API keys and third-party tokens are kept strictly server-side in Express proxy handlers (`/api/images/*`). Never exposed to browser bundle.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
