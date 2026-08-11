/**
 * Real-time Stats Engine Service
 * Fetches real weather, air quality (AQI), live currency exchange rates,
 * geolocation, city name, dual clocks (IST 24-hr + Home country), and realistic traffic flow.
 */

export interface RealtimeStatsData {
  // Location & City
  city: string;
  country: string;
  lat: number;
  lng: number;
  isCustomLocation?: boolean;

  // Real Weather (Open-Meteo)
  tempC: number;
  feelsLikeC: number;
  weatherCondition: string;
  weatherCode: number;
  humidityPct: number;
  windSpeedKmh: number;
  uvIndexMax: number;
  rainProbabilityPct: number;

  // Real Air Quality (Open-Meteo AQI)
  aqi: number;
  aqiLabel: string; // Good, Moderate, Unhealthy for Sensitive, Unhealthy, Very Unhealthy, Hazardous
  aqiColorClass: string;
  pm25: number;
  pm10: number;

  // Live Exchange Rates
  usdToInr: number;
  eurToInr: number;
  gbpToInr: number;
  aedToInr: number;
  allRatesToInr: Record<string, number>;
  lastUpdatedRates: string;

  // Real Time
  istTime24h: string; // 24-hour format e.g. "22:33:05"
  istDateFormatted: string; // e.g. "Thu, 7 Aug 2026"
  userLocalTime: string; // User's device / country local time
  userTimezoneName: string; // e.g. "America/New_York (GMT-4)"
  userCountryName: string;

  // Realistic Traffic Flow
  trafficStatus: 'Heavy Congestion' | 'Moderate Flow' | 'Smooth & Fast' | 'Free Flow';
  trafficSpeedKmh: number;
  trafficDelayMinsPer10km: number;
  trafficPeakBadge: string;
  trafficColorClass: string;
}

// Open-Meteo WMO Weather Interpretation Codes
export function getWeatherConditionFromCode(code: number): string {
  if (code === 0) return 'Clear Sky ☀️';
  if (code === 1) return 'Mainly Clear 🌤️';
  if (code === 2) return 'Partly Cloudy ⛅';
  if (code === 3) return 'Overcast ☁️';
  if (code === 45 || code === 48) return 'Foggy / Hazy 🌫️';
  if (code >= 51 && code <= 55) return 'Drizzle 🌧️';
  if (code >= 61 && code <= 65) return 'Rainy 🌧️';
  if (code >= 71 && code <= 77) return 'Snowy ❄️';
  if (code >= 80 && code <= 82) return 'Rain Showers 🌦️';
  if (code >= 95 && code <= 99) return 'Thunderstorm 🌩️';
  return 'Partly Cloudy ⛅';
}

// AQI Status Classification
export function getAqiDetails(usAqi: number): { label: string; color: string } {
  if (usAqi <= 50) return { label: 'Good (Clean Air)', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' };
  if (usAqi <= 100) return { label: 'Moderate', color: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10' };
  if (usAqi <= 150) return { label: 'Unhealthy for Sensitive Groups', color: 'text-orange-400 border-orange-500/30 bg-orange-500/10' };
  if (usAqi <= 200) return { label: 'Unhealthy', color: 'text-rose-400 border-rose-500/30 bg-rose-500/10' };
  if (usAqi <= 300) return { label: 'Very Unhealthy', color: 'text-purple-400 border-purple-500/30 bg-purple-500/10' };
  return { label: 'Hazardous', color: 'text-red-500 border-red-500/50 bg-red-500/20' };
}

// Calculate Realistic Traffic Flow based on local city hour
export function calculateTrafficFlow(lat: number, lng: number, localHour24: number) {
  // Morning Peak (8:00 - 10:30) or Evening Peak (17:00 - 20:30)
  const isMorningPeak = localHour24 >= 8 && localHour24 <= 10;
  const isEveningPeak = localHour24 >= 17 && localHour24 <= 20;
  const isMidday = localHour24 >= 11 && localHour24 <= 16;

  if (isMorningPeak || isEveningPeak) {
    return {
      status: 'Heavy Congestion' as const,
      speedKmh: Math.floor(18 + Math.random() * 6),
      delayMins: Math.floor(12 + Math.random() * 8),
      badge: isMorningPeak ? 'Morning Peak Rush' : 'Evening Peak Rush',
      color: 'text-rose-400 border-rose-500/30 bg-rose-500/10',
    };
  } else if (isMidday) {
    return {
      status: 'Moderate Flow' as const,
      speedKmh: Math.floor(30 + Math.random() * 10),
      delayMins: Math.floor(4 + Math.random() * 4),
      badge: 'Midday Normal Transit',
      color: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10',
    };
  } else {
    return {
      status: 'Smooth & Fast' as const,
      speedKmh: Math.floor(55 + Math.random() * 15),
      delayMins: 0,
      badge: 'Off-Peak Clear Transit',
      color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    };
  }
}

// Currency Rates Cache
let cachedRates: Record<string, number> = {
  USD: 83.75,
  EUR: 91.20,
  GBP: 106.50,
  AED: 22.80,
  JPY: 0.56,
  CAD: 61.40,
  AUD: 55.10,
  SGD: 62.30,
  THB: 2.38,
  MYR: 18.90,
  SAR: 22.30,
  CHF: 96.80,
  CNY: 11.60,
  INR: 1.0,
};

// Fetch Live Exchange Rates from open API
export async function fetchLiveExchangeRates(): Promise<Record<string, number>> {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/INR');
    if (res.ok) {
      const data = await res.json();
      if (data && data.rates) {
        // Convert rates so key = Currency Code, value = amount of INR per 1 unit of Foreign Currency
        const inrBaseRates = data.rates;
        const convertedRates: Record<string, number> = {};
        for (const [curr, rateAgainstInr] of Object.entries(inrBaseRates)) {
          // rateAgainstInr is how many units of `curr` per 1 INR.
          // So 1 unit of `curr` = (1 / rateAgainstInr) INR.
          if (typeof rateAgainstInr === 'number' && rateAgainstInr > 0) {
            convertedRates[curr] = 1 / rateAgainstInr;
          }
        }
        convertedRates['INR'] = 1.0;
        cachedRates = { ...cachedRates, ...convertedRates };
        return cachedRates;
      }
    }
  } catch (err) {
    console.warn('Failed to fetch live exchange rates, using fallback rates:', err);
  }
  return cachedRates;
}

// Reverse Geocode Lat/Lng to City Name
export async function fetchCityFromCoordinates(lat: number, lng: number): Promise<{ city: string; country: string }> {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=en`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.address) {
        const addr = data.address;
        const cityName = addr.city || addr.town || addr.village || addr.county || addr.state_district || addr.state || 'My Location';
        const countryName = addr.country || 'India';
        return { city: cityName, country: countryName };
      }
    }
  } catch (err) {
    console.warn('Reverse geocoding error:', err);
  }
  return { city: 'New Delhi', country: 'India' };
}

// IP Geolocation Fallback
export async function fetchCityFromIP(): Promise<{ city: string; country: string; lat: number; lng: number }> {
  try {
    const res = await fetch('https://ipapi.co/json/');
    if (res.ok) {
      const data = await res.json();
      if (data && data.city && data.latitude && data.longitude) {
        return {
          city: data.city,
          country: data.country_name || 'India',
          lat: data.latitude,
          lng: data.longitude,
        };
      }
    }
  } catch (err) {
    console.warn('IP location fetch failed:', err);
  }
  return { city: 'New Delhi', country: 'India', lat: 28.6139, lng: 77.209 };
}

// Primary Combined Fetch for Real Weather & AQI from Open-Meteo
export async function fetchRealWeatherAndAQI(lat: number, lng: number): Promise<{
  tempC: number;
  feelsLikeC: number;
  weatherCondition: string;
  weatherCode: number;
  humidityPct: number;
  windSpeedKmh: number;
  uvIndexMax: number;
  rainProbabilityPct: number;
  aqi: number;
  aqiLabel: string;
  aqiColorClass: string;
  pm25: number;
  pm10: number;
}> {
  let tempC = 28;
  let feelsLikeC = 29;
  let weatherCode = 1;
  let weatherCondition = 'Mainly Clear 🌤️';
  let humidityPct = 62;
  let windSpeedKmh = 12;
  let uvIndexMax = 6;
  let rainProbabilityPct = 15;

  let aqi = 48;
  let pm25 = 12.4;
  let pm10 = 28.1;

  // 1. Fetch Open-Meteo Forecast (Weather)
  try {
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&daily=uv_index_max,precipitation_probability_max&timezone=auto`;
    const wRes = await fetch(weatherUrl);
    if (wRes.ok) {
      const wData = await wRes.json();
      if (wData && wData.current) {
        tempC = Math.round(wData.current.temperature_2m);
        feelsLikeC = Math.round(wData.current.apparent_temperature);
        weatherCode = wData.current.weather_code ?? 0;
        weatherCondition = getWeatherConditionFromCode(weatherCode);
        humidityPct = wData.current.relative_humidity_2m ?? 60;
        windSpeedKmh = Math.round(wData.current.wind_speed_10m ?? 10);
      }
      if (wData && wData.daily) {
        uvIndexMax = Math.round(wData.daily.uv_index_max?.[0] ?? 5);
        rainProbabilityPct = wData.daily.precipitation_probability_max?.[0] ?? 10;
      }
    }
  } catch (err) {
    console.warn('Weather fetch error:', err);
  }

  // 2. Fetch Open-Meteo Air Quality (AQI)
  try {
    const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lng}&current=us_aqi,pm2_5,pm10`;
    const aRes = await fetch(aqiUrl);
    if (aRes.ok) {
      const aData = await aRes.json();
      if (aData && aData.current) {
        aqi = Math.round(aData.current.us_aqi ?? 45);
        pm25 = Number((aData.current.pm2_5 ?? 12).toFixed(1));
        pm10 = Number((aData.current.pm10 ?? 25).toFixed(1));
      }
    }
  } catch (err) {
    console.warn('AQI fetch error:', err);
  }

  const aqiInfo = getAqiDetails(aqi);

  return {
    tempC,
    feelsLikeC,
    weatherCondition,
    weatherCode,
    humidityPct,
    windSpeedKmh,
    uvIndexMax,
    rainProbabilityPct,
    aqi,
    aqiLabel: aqiInfo.label,
    aqiColorClass: aqiInfo.color,
    pm25,
    pm10,
  };
}

// Convert USD or any Foreign Currency value to Rupees (₹ INR)
export function convertToRupees(amountInForeignCurrency: number, foreignCurrencyCode: string = 'USD', rates?: Record<string, number>): number {
  const activeRates = rates || cachedRates;
  const inrRate = activeRates[foreignCurrencyCode.toUpperCase()] || 83.75;
  return Math.round(amountInForeignCurrency * inrRate);
}

// Format Rupee currency string nicely (e.g. "₹45,000")
export function formatRupees(amountInr: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amountInr);
}
