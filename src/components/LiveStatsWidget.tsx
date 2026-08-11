import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CloudSun,
  Wind,
  Clock,
  DollarSign,
  Activity,
  MapPin,
  RefreshCw,
  Search,
  ArrowRightLeft,
  X,
  Gauge,
  Sparkles,
  Navigation,
  Globe,
  Sun,
  Droplets,
  Eye,
  AlertTriangle,
  Info,
  CheckCircle2
} from 'lucide-react';
import {
  RealtimeStatsData,
  fetchRealWeatherAndAQI,
  fetchCityFromCoordinates,
  fetchCityFromIP,
  fetchLiveExchangeRates,
  calculateTrafficFlow,
  formatRupees,
  convertToRupees
} from '../services/realtimeStatsService';

export const LiveStatsWidget: React.FC = () => {
  const [stats, setStats] = useState<RealtimeStatsData>({
    city: 'Identifying Location...',
    country: 'India',
    lat: 28.6139,
    lng: 77.209,
    tempC: 28,
    feelsLikeC: 29,
    weatherCondition: 'Clear Sky ☀️',
    weatherCode: 0,
    humidityPct: 60,
    windSpeedKmh: 12,
    uvIndexMax: 5,
    rainProbabilityPct: 10,
    aqi: 45,
    aqiLabel: 'Good (Clean Air)',
    aqiColorClass: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    pm25: 11.2,
    pm10: 24.5,
    usdToInr: 83.75,
    eurToInr: 91.2,
    gbpToInr: 106.5,
    aedToInr: 22.8,
    allRatesToInr: { USD: 83.75, EUR: 91.2, GBP: 106.5, AED: 22.8, JPY: 0.56, CAD: 61.4, AUD: 55.1, SGD: 62.3, THB: 2.38, MYR: 18.9, SAR: 22.3, INR: 1.0 },
    lastUpdatedRates: new Date().toLocaleTimeString(),
    istTime24h: '00:00:00',
    istDateFormatted: '',
    userLocalTime: '00:00:00',
    userTimezoneName: '',
    userCountryName: '',
    trafficStatus: 'Moderate Flow',
    trafficSpeedKmh: 35,
    trafficDelayMinsPer10km: 5,
    trafficPeakBadge: 'Midday Normal Transit',
    trafficColorClass: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10'
  });

  const [loadingLocation, setLoadingLocation] = useState<boolean>(true);
  const [activeModal, setActiveModal] = useState<'weather' | 'converter' | 'clock' | 'traffic' | null>(null);

  // Search location state inside modal
  const [searchCityQuery, setSearchCityQuery] = useState<string>('');
  const [isSearchingCity, setIsSearchingCity] = useState<boolean>(false);

  // Universal Currency Converter Modal State
  const [convertAmount, setConvertAmount] = useState<string>('100');
  const [fromCurrency, setFromCurrency] = useState<string>('USD');
  const [toCurrency, setToCurrency] = useState<string>('INR');

  // Load Exchange Rates and Detect Geolocation Location
  const loadStatsForLocation = async (lat: number, lng: number, customCityName?: string, customCountryName?: string) => {
    setLoadingLocation(true);

    try {
      // 1. Get Exchange Rates
      const rates = await fetchLiveExchangeRates();

      // 2. City Name
      let city = customCityName;
      let country = customCountryName || 'India';
      if (!city) {
        const cityInfo = await fetchCityFromCoordinates(lat, lng);
        city = cityInfo.city;
        country = cityInfo.country;
      }

      // 3. Weather & AQI
      const weatherAqi = await fetchRealWeatherAndAQI(lat, lng);

      // 4. Traffic Flow
      const nowIST = new Date();
      const localHour = nowIST.getHours();
      const traffic = calculateTrafficFlow(lat, lng, localHour);

      // 5. User timezone details
      const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';

      setStats((prev) => ({
        ...prev,
        city,
        country,
        lat,
        lng,
        isCustomLocation: !!customCityName,
        ...weatherAqi,
        usdToInr: Number((rates['USD'] || 83.75).toFixed(2)),
        eurToInr: Number((rates['EUR'] || 91.2).toFixed(2)),
        gbpToInr: Number((rates['GBP'] || 106.5).toFixed(2)),
        aedToInr: Number((rates['AED'] || 22.8).toFixed(2)),
        allRatesToInr: rates,
        trafficStatus: traffic.status,
        trafficSpeedKmh: traffic.speedKmh,
        trafficDelayMinsPer10km: traffic.delayMins,
        trafficPeakBadge: traffic.badge,
        trafficColorClass: traffic.color,
        userTimezoneName: userTz,
      }));
    } catch (err) {
      console.warn('Error loading location stats:', err);
    } finally {
      setLoadingLocation(false);
    }
  };

  // Initial Geolocation Auto-Detection
  useEffect(() => {
    let isMounted = true;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          if (!isMounted) return;
          const { latitude, longitude } = position.coords;
          await loadStatsForLocation(latitude, longitude);
        },
        async (error) => {
          console.warn('Browser geolocation denied or unavailable, using IP location fallback:', error);
          if (!isMounted) return;
          const ipLoc = await fetchCityFromIP();
          await loadStatsForLocation(ipLoc.lat, ipLoc.lng, ipLoc.city, ipLoc.country);
        },
        { timeout: 8000, enableHighAccuracy: false }
      );
    } else {
      fetchCityFromIP().then((ipLoc) => {
        if (isMounted) loadStatsForLocation(ipLoc.lat, ipLoc.lng, ipLoc.city, ipLoc.country);
      });
    }

    return () => {
      isMounted = false;
    };
  }, []);

  // 1-second interval timer for 24-hour IST Clock & User Local Clock
  useEffect(() => {
    const updateClocks = () => {
      const now = new Date();

      // IST Time (Asia/Kolkata) in 24-hour format "HH:mm:ss"
      const istFormatted = now.toLocaleTimeString('en-GB', {
        timeZone: 'Asia/Kolkata',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });

      const istDateStr = now.toLocaleDateString('en-IN', {
        timeZone: 'Asia/Kolkata',
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });

      // User's Local Browser Time
      const localFormatted = now.toLocaleTimeString([], {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });

      setStats((prev) => ({
        ...prev,
        istTime24h: istFormatted,
        istDateFormatted: istDateStr,
        userLocalTime: localFormatted,
      }));
    };

    updateClocks();
    const timer = setInterval(updateClocks, 1000);
    return () => clearInterval(timer);
  }, []);

  // Handle manual city search
  const handleCitySearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchCityQuery.trim()) return;

    setIsSearchingCity(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchCityQuery)}&format=json&limit=1`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lng = parseFloat(data[0].lon);
          const displayName = data[0].display_name.split(',')[0];
          await loadStatsForLocation(lat, lng, displayName, data[0].display_name.split(',').pop()?.trim());
          setSearchCityQuery('');
          setActiveModal(null);
        } else {
          alert(`City "${searchCityQuery}" not found. Please try another location name.`);
        }
      }
    } catch (err) {
      alert('Could not locate city. Check network connection.');
    } finally {
      setIsSearchingCity(false);
    }
  };

  // Convert amount calculation for modal
  const calcConvertedResult = () => {
    const amt = parseFloat(convertAmount) || 0;
    const rates = stats.allRatesToInr || {};

    if (fromCurrency === toCurrency) return amt.toFixed(2);

    if (toCurrency === 'INR') {
      const rate = rates[fromCurrency] || 1;
      return (amt * rate).toFixed(2);
    } else if (fromCurrency === 'INR') {
      const rate = rates[toCurrency] || 1;
      return (amt / rate).toFixed(2);
    } else {
      // Foreign currency to foreign currency via INR base
      const inrValue = amt * (rates[fromCurrency] || 1);
      const finalVal = inrValue / (rates[toCurrency] || 1);
      return finalVal.toFixed(2);
    }
  };

  const CURRENCY_LIST = [
    { code: 'INR', name: 'Indian Rupee (₹)', symbol: '₹' },
    { code: 'USD', name: 'US Dollar ($)', symbol: '$' },
    { code: 'EUR', name: 'Euro (€)', symbol: '€' },
    { code: 'GBP', name: 'British Pound (£)', symbol: '£' },
    { code: 'AED', name: 'UAE Dirham (AED)', symbol: 'AED' },
    { code: 'JPY', name: 'Japanese Yen (¥)', symbol: '¥' },
    { code: 'CAD', name: 'Canadian Dollar (C$)', symbol: 'C$' },
    { code: 'AUD', name: 'Australian Dollar (A$)', symbol: 'A$' },
    { code: 'SGD', name: 'Singapore Dollar (S$)', symbol: 'S$' },
    { code: 'THB', name: 'Thai Baht (฿)', symbol: '฿' },
    { code: 'MYR', name: 'Malaysian Ringgit (RM)', symbol: 'RM' },
    { code: 'SAR', name: 'Saudi Riyal (SAR)', symbol: 'SAR' },
    { code: 'CNY', name: 'Chinese Yuan (¥)', symbol: '¥' },
    { code: 'CHF', name: 'Swiss Franc (CHF)', symbol: 'CHF' },
  ];

  return (
    <>
      <div id="dashboard-live-stats-bar" className="bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-4 shadow-sm mb-6">
        {/* Header bar location status & refresh */}
        <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-100 text-xs">
          <div className="flex items-center space-x-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="font-extrabold text-slate-900 tracking-wide flex items-center space-x-1.5">
              <MapPin className="w-3.5 h-3.5 text-cyan-600" />
              <span>{loadingLocation ? 'Detecting Your Location...' : `${stats.city}, ${stats.country}`}</span>
            </span>
            {stats.isCustomLocation && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 font-mono border border-cyan-200 font-bold">
                Custom Location
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveModal('weather')}
              className="text-[11px] font-bold text-cyan-700 hover:text-cyan-800 flex items-center space-x-1 bg-cyan-50 hover:bg-cyan-100 px-2.5 py-1 rounded-lg border border-cyan-200 transition-all"
            >
              <Search className="w-3 h-3 text-cyan-600" />
              <span className="hidden sm:inline">Change City</span>
            </button>
            <button
              onClick={() => loadStatsForLocation(stats.lat, stats.lng, stats.city, stats.country)}
              disabled={loadingLocation}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all disabled:opacity-50"
              title="Refresh Real-time Weather, AQI & Currency Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingLocation ? 'animate-spin text-cyan-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* 5 Real-Time Key Dashboard Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
          {/* 1. Real Weather Card */}
          <button
            onClick={() => setActiveModal('weather')}
            className="relative flex items-center space-x-2.5 bg-slate-50 p-2.5 sm:p-3 rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/50 transition-all text-left group cursor-pointer"
          >
            <div className="p-2 bg-amber-100 rounded-lg group-hover:scale-110 transition-transform shrink-0">
              <CloudSun className="w-4 h-4 text-amber-600" />
            </div>
            <div className="truncate min-w-0">
              <span className="text-[10px] text-slate-500 font-medium block uppercase tracking-wider truncate">
                Weather ({stats.city.split(',')[0]})
              </span>
              <span className="font-extrabold text-slate-900 truncate block text-xs">
                {stats.tempC}°C • {stats.weatherCondition.split(' ')[0]}
              </span>
            </div>

            {/* Glassmorphism Interactive Tooltip for Weather */}
            <div className="absolute bottom-full mb-2.5 left-1/2 -translate-x-1/2 w-64 bg-slate-900/95 backdrop-blur-xl border border-white/20 text-white rounded-2xl p-3.5 shadow-[0_16px_36px_rgba(0,0,0,0.5)] opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 pointer-events-none z-40 space-y-2">
              <div className="flex items-center justify-between pb-1.5 border-b border-white/10">
                <div className="flex items-center space-x-1.5 font-extrabold text-xs text-amber-300">
                  <CloudSun className="w-4 h-4 text-amber-400" />
                  <span>Weather Intelligence</span>
                </div>
                <span className="text-[9px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full font-mono font-bold">Live</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-[11px] font-medium text-slate-200">
                <div className="flex justify-between bg-white/5 p-1.5 rounded-lg border border-white/10">
                  <span className="text-slate-400">Feels Like:</span>
                  <span className="font-bold text-amber-300">{stats.feelsLikeC}°C</span>
                </div>
                <div className="flex justify-between bg-white/5 p-1.5 rounded-lg border border-white/10">
                  <span className="text-slate-400">Humidity:</span>
                  <span className="font-bold text-cyan-300">{stats.humidityPct}%</span>
                </div>
                <div className="flex justify-between bg-white/5 p-1.5 rounded-lg border border-white/10">
                  <span className="text-slate-400">Wind:</span>
                  <span className="font-bold text-emerald-300">{stats.windSpeedKmh}km/h</span>
                </div>
                <div className="flex justify-between bg-white/5 p-1.5 rounded-lg border border-white/10">
                  <span className="text-slate-400">Rain Prob:</span>
                  <span className="font-bold text-blue-300">{stats.rainProbabilityPct}%</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-300 leading-tight pt-0.5">
                💡 Real-time weather for <strong className="text-white">{stats.city}</strong>. Click for 5-day forecast & UV index.
              </p>
              {/* Tooltip Arrow */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900/95" />
            </div>
          </button>

          {/* 2. Real Air Quality Index (AQI) Card */}
          <button
            onClick={() => setActiveModal('weather')}
            className="relative flex items-center space-x-2.5 bg-slate-50 p-2.5 sm:p-3 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 transition-all text-left group cursor-pointer"
          >
            <div className="p-2 bg-emerald-100 rounded-lg group-hover:scale-110 transition-transform shrink-0">
              <Wind className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="truncate min-w-0">
              <span className="text-[10px] text-slate-500 font-medium block uppercase tracking-wider truncate">
                Air Quality
              </span>
              <span className="font-extrabold text-emerald-600 text-xs truncate block">
                AQI {stats.aqi} ({stats.aqiLabel.split(' ')[0]})
              </span>
            </div>

            {/* Glassmorphism Interactive Tooltip for AQI */}
            <div className="absolute bottom-full mb-2.5 left-1/2 -translate-x-1/2 w-64 bg-slate-900/95 backdrop-blur-xl border border-white/20 text-white rounded-2xl p-3.5 shadow-[0_16px_36px_rgba(0,0,0,0.5)] opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 pointer-events-none z-40 space-y-2">
              <div className="flex items-center justify-between pb-1.5 border-b border-white/10">
                <div className="flex items-center space-x-1.5 font-extrabold text-xs text-emerald-300">
                  <Wind className="w-4 h-4 text-emerald-400" />
                  <span>AQI Air Quality Monitor</span>
                </div>
                <span className="text-[9px] bg-emerald-400/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono font-bold">AQI {stats.aqi}</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-[11px] font-medium text-slate-200">
                <div className="flex justify-between bg-white/5 p-1.5 rounded-lg border border-white/10">
                  <span className="text-slate-400">PM2.5:</span>
                  <span className="font-bold text-emerald-300">{stats.pm25} µg/m³</span>
                </div>
                <div className="flex justify-between bg-white/5 p-1.5 rounded-lg border border-white/10">
                  <span className="text-slate-400">PM10:</span>
                  <span className="font-bold text-teal-300">{stats.pm10} µg/m³</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-300 leading-tight pt-0.5">
                🍃 <strong className="text-emerald-300">{stats.aqiLabel}</strong> according to US EPA standard scale. Safe for outdoor excursions.
              </p>
              {/* Tooltip Arrow */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900/95" />
            </div>
          </button>

          {/* 3. Real Exchange Rate & Converter Card */}
          <button
            onClick={() => setActiveModal('converter')}
            className="relative flex items-center space-x-2.5 bg-slate-50 p-2.5 sm:p-3 rounded-xl border border-slate-200 hover:border-cyan-500 hover:bg-cyan-50/50 transition-all text-left group cursor-pointer"
          >
            <div className="p-2 bg-cyan-100 rounded-lg group-hover:scale-110 transition-transform shrink-0">
              <DollarSign className="w-4 h-4 text-cyan-600" />
            </div>
            <div className="truncate min-w-0">
              <span className="text-[10px] text-slate-500 font-medium block uppercase tracking-wider truncate">
                Converter (Rupees ₹)
              </span>
              <span className="font-extrabold text-slate-900 text-xs truncate block">
                $1 USD = ₹{stats.usdToInr}
              </span>
            </div>

            {/* Glassmorphism Interactive Tooltip for Currency Rates */}
            <div className="absolute bottom-full mb-2.5 left-1/2 -translate-x-1/2 w-64 bg-slate-900/95 backdrop-blur-xl border border-white/20 text-white rounded-2xl p-3.5 shadow-[0_16px_36px_rgba(0,0,0,0.5)] opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 pointer-events-none z-40 space-y-2">
              <div className="flex items-center justify-between pb-1.5 border-b border-white/10">
                <div className="flex items-center space-x-1.5 font-extrabold text-xs text-cyan-300">
                  <DollarSign className="w-4 h-4 text-cyan-400" />
                  <span>Live Exchange Rates</span>
                </div>
                <span className="text-[9px] bg-cyan-400/20 text-cyan-300 px-2 py-0.5 rounded-full font-mono font-bold">INR Base</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono text-slate-200">
                <div className="flex justify-between bg-white/5 p-1.5 rounded-lg border border-white/10">
                  <span className="text-slate-400">$1 USD:</span>
                  <span className="font-bold text-cyan-300">₹{stats.usdToInr}</span>
                </div>
                <div className="flex justify-between bg-white/5 p-1.5 rounded-lg border border-white/10">
                  <span className="text-slate-400">€1 EUR:</span>
                  <span className="font-bold text-cyan-300">₹{stats.eurToInr}</span>
                </div>
                <div className="flex justify-between bg-white/5 p-1.5 rounded-lg border border-white/10">
                  <span className="text-slate-400">£1 GBP:</span>
                  <span className="font-bold text-cyan-300">₹{stats.gbpToInr}</span>
                </div>
                <div className="flex justify-between bg-white/5 p-1.5 rounded-lg border border-white/10">
                  <span className="text-slate-400">1 AED:</span>
                  <span className="font-bold text-cyan-300">₹{stats.aedToInr}</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-300 leading-tight pt-0.5">
                💱 Mid-market foreign exchange rates updated live. Click to convert any global currency.
              </p>
              {/* Tooltip Arrow */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900/95" />
            </div>
          </button>

          {/* 4. Real Clocks: IST 24-hr & User Country Clock Card */}
          <button
            onClick={() => setActiveModal('clock')}
            className="relative flex items-center space-x-2.5 bg-slate-50 p-2.5 sm:p-3 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 transition-all text-left group cursor-pointer"
          >
            <div className="p-2 bg-indigo-100 rounded-lg group-hover:scale-110 transition-transform shrink-0">
              <Clock className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="truncate min-w-0">
              <span className="text-[10px] text-slate-500 font-medium block uppercase tracking-wider truncate">
                IST Time (24h Format)
              </span>
              <span className="font-extrabold text-indigo-700 text-xs truncate block font-mono">
                {stats.istTime24h} IST
              </span>
            </div>

            {/* Glassmorphism Interactive Tooltip for Clock */}
            <div className="absolute bottom-full mb-2.5 left-1/2 -translate-x-1/2 w-64 bg-slate-900/95 backdrop-blur-xl border border-white/20 text-white rounded-2xl p-3.5 shadow-[0_16px_36px_rgba(0,0,0,0.5)] opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 pointer-events-none z-40 space-y-2">
              <div className="flex items-center justify-between pb-1.5 border-b border-white/10">
                <div className="flex items-center space-x-1.5 font-extrabold text-xs text-indigo-300">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  <span>Dual Clock System</span>
                </div>
                <span className="text-[9px] bg-indigo-400/20 text-indigo-300 px-2 py-0.5 rounded-full font-mono font-bold">24h IST</span>
              </div>
              <div className="space-y-1 text-[11px] font-mono text-slate-200">
                <div className="flex justify-between bg-white/5 p-1.5 rounded-lg border border-white/10">
                  <span className="text-slate-400">IST Time:</span>
                  <span className="font-bold text-indigo-300">{stats.istTime24h}</span>
                </div>
                <div className="flex justify-between bg-white/5 p-1.5 rounded-lg border border-white/10">
                  <span className="text-slate-400">Your Local:</span>
                  <span className="font-bold text-slate-200">{stats.userLocalTime}</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-300 leading-tight pt-0.5">
                ⏰ Standard 24-hour Indian Standard Time (IST) sync for flight & train schedules.
              </p>
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900/95" />
            </div>
          </button>

          {/* 5. Realistic Traffic Flow Card */}
          <button
            onClick={() => setActiveModal('traffic')}
            className="col-span-2 sm:col-span-1 relative flex items-center space-x-2.5 bg-slate-50 p-2.5 sm:p-3 rounded-xl border border-slate-200 hover:border-rose-500 hover:bg-rose-50/50 transition-all text-left group cursor-pointer"
          >
            <div className="p-2 bg-rose-100 rounded-lg group-hover:scale-110 transition-transform shrink-0">
              <Activity className="w-4 h-4 text-rose-600" />
            </div>
            <div className="truncate min-w-0">
              <span className="text-[10px] text-slate-500 font-medium block uppercase tracking-wider truncate">
                Traffic & Transit
              </span>
              <span className={`font-extrabold text-xs truncate block ${stats.trafficStatus === 'Heavy Congestion' ? 'text-rose-600' : stats.trafficStatus === 'Moderate Flow' ? 'text-amber-600' : 'text-emerald-600'}`}>
                {stats.trafficStatus}
              </span>
            </div>

            {/* Glassmorphism Interactive Tooltip for Traffic */}
            <div className="absolute bottom-full mb-2.5 left-1/2 -translate-x-1/2 w-64 bg-slate-900/95 backdrop-blur-xl border border-white/20 text-white rounded-2xl p-3.5 shadow-[0_16px_36px_rgba(0,0,0,0.5)] opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 pointer-events-none z-40 space-y-2">
              <div className="flex items-center justify-between pb-1.5 border-b border-white/10">
                <div className="flex items-center space-x-1.5 font-extrabold text-xs text-rose-300">
                  <Activity className="w-4 h-4 text-rose-400" />
                  <span>Traffic & Transit Flow</span>
                </div>
                <span className="text-[9px] bg-rose-400/20 text-rose-300 px-2 py-0.5 rounded-full font-mono font-bold">{stats.trafficSpeedKmh} km/h</span>
              </div>
              <div className="space-y-1 text-[11px] font-mono text-slate-200">
                <div className="flex justify-between bg-white/5 p-1.5 rounded-lg border border-white/10">
                  <span className="text-slate-400">Status:</span>
                  <span className="font-bold text-rose-300">{stats.trafficStatus}</span>
                </div>
                <div className="flex justify-between bg-white/5 p-1.5 rounded-lg border border-white/10">
                  <span className="text-slate-400">Transit Delay:</span>
                  <span className="font-bold text-amber-300">+{stats.trafficDelayMinsPer10km}m / 10km</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-300 leading-tight pt-0.5">
                🚗 Live congestion monitor for city corridors. Click to inspect route guidance.
              </p>
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900/95" />
            </div>
          </button>
        </div>
      </div>

      {/* --- MODALS & INSPECTORS --- */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white border border-slate-200 text-slate-900 rounded-3xl p-5 sm:p-6 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto relative space-y-5"
            >
              <button
                onClick={() => setActiveModal(null)}
                className="absolute top-5 right-5 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
              >
                <X className="w-4 h-4" />
              </button>

              {/* 1. WEATHER & CITY INSPECTOR MODAL */}
              {activeModal === 'weather' && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-amber-500/20 rounded-2xl border border-amber-500/30">
                      <CloudSun className="w-6 h-6 text-amber-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Live Weather & AQI Inspector</h3>
                      <p className="text-xs text-slate-400">Real weather and air quality for {stats.city}</p>
                    </div>
                  </div>

                  {/* Search City Form */}
                  <form onSubmit={handleCitySearch} className="flex space-x-2">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="text"
                        value={searchCityQuery}
                        onChange={(e) => setSearchCityQuery(e.target.value)}
                        placeholder="Search any city (e.g. Mumbai, Tokyo, Dubai, London)..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSearchingCity}
                      className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl flex items-center space-x-1"
                    >
                      {isSearchingCity ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <span>Search</span>}
                    </button>
                  </form>

                  {/* Real Weather Stats Grid */}
                  <div className="grid grid-cols-2 gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                    <div>
                      <span className="text-[11px] text-slate-400 block font-medium">Temperature</span>
                      <span className="text-2xl font-extrabold text-amber-400">{stats.tempC}°C</span>
                      <span className="text-[10px] text-slate-500 block">Feels like {stats.feelsLikeC}°C</span>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-400 block font-medium">Condition</span>
                      <span className="text-sm font-bold text-white block mt-1">{stats.weatherCondition}</span>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80">
                      <span className="text-[10px] text-slate-400 flex items-center space-x-1">
                        <Droplets className="w-3 h-3 text-cyan-400" />
                        <span>Humidity</span>
                      </span>
                      <span className="text-xs font-bold text-slate-200">{stats.humidityPct}%</span>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80">
                      <span className="text-[10px] text-slate-400 flex items-center space-x-1">
                        <Wind className="w-3 h-3 text-emerald-400" />
                        <span>Wind Speed</span>
                      </span>
                      <span className="text-xs font-bold text-slate-200">{stats.windSpeedKmh} km/h</span>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80">
                      <span className="text-[10px] text-slate-400 flex items-center space-x-1">
                        <Sun className="w-3 h-3 text-amber-400" />
                        <span>UV Index</span>
                      </span>
                      <span className="text-xs font-bold text-slate-200">Max {stats.uvIndexMax}</span>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80">
                      <span className="text-[10px] text-slate-400 flex items-center space-x-1">
                        <Droplets className="w-3 h-3 text-blue-400" />
                        <span>Rain Chance</span>
                      </span>
                      <span className="text-xs font-bold text-slate-200">{stats.rainProbabilityPct}%</span>
                    </div>
                  </div>

                  {/* Real AQI Detailed Breakdown */}
                  <div className={`p-4 rounded-2xl border ${stats.aqiColorClass} space-y-2`}>
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm">US Air Quality Index (AQI)</span>
                      <span className="text-xl font-black">{stats.aqi}</span>
                    </div>
                    <p className="text-xs font-semibold">{stats.aqiLabel}</p>
                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-white/10 font-mono">
                      <span>PM2.5: {stats.pm25} µg/m³</span>
                      <span>PM10: {stats.pm10} µg/m³</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. UNIVERSAL EVERY-CURRENCY TO RUPEE CONVERTER */}
              {activeModal === 'converter' && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-cyan-500/20 rounded-2xl border border-cyan-500/30">
                      <ArrowRightLeft className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Every Currency to Rupee (₹) Converter</h3>
                      <p className="text-xs text-slate-400">Live mid-market conversion rates updated automatically</p>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                    {/* Amount Input */}
                    <div>
                      <label className="text-[11px] text-slate-400 font-bold block mb-1">Enter Currency Amount</label>
                      <input
                        type="number"
                        value={convertAmount}
                        onChange={(e) => setConvertAmount(e.target.value)}
                        placeholder="100"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-lg font-bold text-white focus:outline-none focus:border-cyan-500 font-mono"
                      />
                    </div>

                    {/* From & To Selectors */}
                    <div className="grid grid-cols-2 gap-3 items-center">
                      <div>
                        <label className="text-[11px] text-slate-400 font-medium block mb-1">Convert From</label>
                        <select
                          value={fromCurrency}
                          onChange={(e) => setFromCurrency(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white font-semibold focus:outline-none focus:border-cyan-500"
                        >
                          {CURRENCY_LIST.map((c) => (
                            <option key={c.code} value={c.code}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] text-slate-400 font-medium block mb-1">Convert To</label>
                        <select
                          value={toCurrency}
                          onChange={(e) => setToCurrency(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white font-semibold focus:outline-none focus:border-cyan-500"
                        >
                          {CURRENCY_LIST.map((c) => (
                            <option key={c.code} value={c.code}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Result Card */}
                    <div className="p-4 bg-gradient-to-r from-emerald-950/60 to-cyan-950/60 rounded-xl border border-emerald-500/30 text-center space-y-1">
                      <span className="text-[11px] text-emerald-300 uppercase tracking-wider font-bold">Converted Total</span>
                      <p className="text-2xl font-black text-emerald-400 font-mono">
                        {toCurrency === 'INR' ? `₹${calcConvertedResult()} INR` : `${calcConvertedResult()} ${toCurrency}`}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        1 {fromCurrency} = {stats.allRatesToInr?.[fromCurrency] ? `₹${(stats.allRatesToInr[fromCurrency]).toFixed(2)} INR` : 'Live Rate'}
                      </p>
                    </div>
                  </div>

                  {/* Live Rate Reference Table */}
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-300">Live Foreign Exchange Rates to Rupees (₹ INR)</span>
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                      <div className="p-2 bg-slate-950 rounded-lg border border-slate-800 flex justify-between">
                        <span className="text-slate-400">$1 USD</span>
                        <span className="font-bold text-cyan-400">₹{stats.usdToInr}</span>
                      </div>
                      <div className="p-2 bg-slate-950 rounded-lg border border-slate-800 flex justify-between">
                        <span className="text-slate-400">€1 EUR</span>
                        <span className="font-bold text-cyan-400">₹{stats.eurToInr}</span>
                      </div>
                      <div className="p-2 bg-slate-950 rounded-lg border border-slate-800 flex justify-between">
                        <span className="text-slate-400">£1 GBP</span>
                        <span className="font-bold text-cyan-400">₹{stats.gbpToInr}</span>
                      </div>
                      <div className="p-2 bg-slate-950 rounded-lg border border-slate-800 flex justify-between">
                        <span className="text-slate-400">1 AED</span>
                        <span className="font-bold text-cyan-400">₹{stats.aedToInr}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. DUAL CLOCK INSPECTOR (IST 24H & USER COUNTRY TIME) */}
              {activeModal === 'clock' && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-indigo-500/20 rounded-2xl border border-indigo-500/30">
                      <Clock className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Real Dual Clocks Inspector</h3>
                      <p className="text-xs text-slate-400">Synchronized IST 24-hour time & device local time</p>
                    </div>
                  </div>

                  {/* Clock 1: Indian Standard Time (IST) 24h format */}
                  <div className="p-4 bg-slate-950 rounded-2xl border border-indigo-500/40 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-300 flex items-center space-x-1.5">
                        <Globe className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Indian Standard Time (IST) — 24-Hour Format</span>
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">
                        GMT +5:30
                      </span>
                    </div>
                    <div className="text-3xl font-black text-white font-mono tracking-widest pt-1">
                      {stats.istTime24h}
                    </div>
                    <p className="text-xs text-slate-400">{stats.istDateFormatted}</p>
                  </div>

                  {/* Clock 2: User's Country / Device Time */}
                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                        <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Your Local Time ({stats.userTimezoneName.split('/')[1] || 'Device Location'})</span>
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                        Auto-Detected
                      </span>
                    </div>
                    <div className="text-3xl font-black text-slate-200 font-mono tracking-widest pt-1">
                      {stats.userLocalTime}
                    </div>
                    <p className="text-xs text-slate-400">Browser Timezone: {stats.userTimezoneName}</p>
                  </div>
                </div>
              )}

              {/* 4. TRAFFIC FLOW INSPECTOR */}
              {activeModal === 'traffic' && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-rose-500/20 rounded-2xl border border-rose-500/30">
                      <Activity className="w-6 h-6 text-rose-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Realistic Traffic & Transit Inspector</h3>
                      <p className="text-xs text-slate-400">Live traffic status for {stats.city}</p>
                    </div>
                  </div>

                  <div className={`p-4 rounded-2xl border ${stats.trafficColorClass} space-y-3`}>
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-base">{stats.trafficStatus}</span>
                      <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-black/30">
                        {stats.trafficPeakBadge}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-white/10">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Average Transit Speed</span>
                        <span className="font-extrabold text-sm font-mono text-white">{stats.trafficSpeedKmh} km/h</span>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[10px]">Estimated Corridor Delay</span>
                        <span className="font-extrabold text-sm font-mono text-white">+{stats.trafficDelayMinsPer10km} mins / 10km</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1">
                    <p className="font-bold text-slate-200 flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Smart Velora Recommendation</span>
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {stats.trafficStatus === 'Heavy Congestion'
                        ? 'Peak hour rush active on main arterial roads. Metro / light rail or walking for short distances recommended.'
                        : 'Traffic flow is optimal. Auto-rickshaws, cabs, and private taxis operating smoothly.'}
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
