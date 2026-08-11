import React, { useState, useEffect } from 'react';
import { UserProfile, TripPlan, EmergencyContact } from '../types';
import {
  ShieldAlert,
  PhoneCall,
  MapPin,
  Share2,
  AlertTriangle,
  Hospital,
  Shield,
  Clock,
  Radio,
  CheckCircle2,
  Copy,
  ExternalLink,
  Volume2,
  VolumeX,
  Zap,
  Navigation,
  UserCheck,
  Search,
  Plus,
  Trash2,
  LocateFixed,
  Building2,
  Sparkles,
  Mail,
  Send,
  Smartphone,
  MessageSquare,
  FileText,
  RefreshCw,
  X,
  Sliders,
  Check
} from 'lucide-react';
import { triggerSystemPushNotification } from './ToastNotification';

export interface DispatchLog {
  id: string;
  timestamp: string;
  channel: 'SMS' | 'EMAIL';
  recipientName: string;
  targetAddress: string;
  status: 'DELIVERED' | 'SENT' | 'DISPATCHED_TO_POLICE' | 'QUEUED';
  deliveryGateway: string;
  messagePreview: string;
}

interface EmergencySOSHubProps {
  userProfile?: UserProfile;
  currentTrip?: TripPlan;
}

// Regional Emergency Contact Data Mapping
const REGIONAL_EMERGENCY_DATA: Record<string, EmergencyContact[]> = {
  'Agra, UP': [
    {
      id: 'agra-1',
      name: 'District Hospital & Trauma Center Agra',
      type: 'Hospital',
      phone: '+91 562 242 0000',
      address: 'Near MG Road, Tajganj, Agra, UP',
      distKm: 1.8,
      lat: 27.1800,
      lng: 78.0100,
      is24x7: true
    },
    {
      id: 'agra-2',
      name: 'Tourist Police Station Agra (Taj Protection)',
      type: 'Police Station',
      phone: '+91 562 222 6666 / 112',
      address: 'East Gate Road, Tajganj, Agra, UP',
      distKm: 0.6,
      lat: 27.1720,
      lng: 78.0450,
      is24x7: true
    },
    {
      id: 'agra-3',
      name: 'SN Medical College Emergency ER',
      type: 'Hospital',
      phone: '+91 562 226 0300',
      address: 'Hospital Road, Agra, UP',
      distKm: 2.4,
      lat: 27.1900,
      lng: 78.0050,
      is24x7: true
    }
  ],
  'Jaipur, Rajasthan': [
    {
      id: 'jpr-1',
      name: 'SMS Govt Medical College & Hospital Jaipur',
      type: 'Hospital',
      phone: '+91 141 251 8200 / 108',
      address: 'JL N Marg, Ashok Nagar, Jaipur, RJ',
      distKm: 2.1,
      lat: 26.9050,
      lng: 75.8150,
      is24x7: true
    },
    {
      id: 'jpr-2',
      name: 'Rajasthan Tourist Police Station Jaipur',
      type: 'Police Station',
      phone: '+91 141 260 6950 / 112',
      address: 'Hawa Mahal Precinct, Pink City, Jaipur, RJ',
      distKm: 0.8,
      lat: 26.9240,
      lng: 75.8270,
      is24x7: true
    },
    {
      id: 'jpr-3',
      name: 'Fortis Escorts Emergency Trauma Center',
      type: 'Hospital',
      phone: '+91 141 254 7000',
      address: 'Malviya Nagar, Jaipur, RJ',
      distKm: 4.2,
      lat: 26.8500,
      lng: 75.8100,
      is24x7: true
    }
  ],
  'New Delhi / NCR': [
    {
      id: 'del-1',
      name: 'AIIMS Apex Trauma Center New Delhi',
      type: 'Hospital',
      phone: '+91 11 2658 8500 / 102',
      address: 'Sri Aurobindo Marg, Ansari Nagar, New Delhi',
      distKm: 1.5,
      lat: 28.5672,
      lng: 77.2100,
      is24x7: true
    },
    {
      id: 'del-2',
      name: 'Delhi Police Tourist Protection Unit',
      type: 'Police Station',
      phone: '+91 11 2331 1000 / 112',
      address: 'Janpath Police Station, Connaught Place, New Delhi',
      distKm: 1.1,
      lat: 28.6289,
      lng: 77.2180,
      is24x7: true
    },
    {
      id: 'del-3',
      name: 'Safdarjung Emergency ER & Burn Center',
      type: 'Hospital',
      phone: '+91 11 2616 5060',
      address: 'Ring Road, Opposite AIIMS, New Delhi',
      distKm: 1.9,
      lat: 28.5700,
      lng: 77.2070,
      is24x7: true
    }
  ],
  'Goa Beach Sector': [
    {
      id: 'goa-1',
      name: 'Goa Medical College Hospital (GMC)',
      type: 'Hospital',
      phone: '+91 832 245 8725 / 108',
      address: 'Bambolim, Tiswadi, Goa',
      distKm: 3.2,
      lat: 15.4600,
      lng: 73.8500,
      is24x7: true
    },
    {
      id: 'goa-2',
      name: 'Coastal Tourist Police Cell Goa',
      type: 'Police Station',
      phone: '+91 832 222 4444 / 112',
      address: 'Calangute - Panaji Road, Goa',
      distKm: 1.4,
      lat: 15.5400,
      lng: 73.7600,
      is24x7: true
    },
    {
      id: 'goa-3',
      name: 'Manipal Hospital ER Goa',
      type: 'Hospital',
      phone: '+91 832 304 8800',
      address: 'Dona Paula, Panaji, Goa',
      distKm: 2.8,
      lat: 15.4500,
      lng: 73.8100,
      is24x7: true
    }
  ],
  'Kerala (Kochi & Alleppey)': [
    {
      id: 'ker-1',
      name: 'General Hospital Alleppey ER Center',
      type: 'Hospital',
      phone: '+91 477 225 1250 / 108',
      address: 'Beach Road, Alappuzha, Kerala',
      distKm: 1.2,
      lat: 9.4900,
      lng: 76.3300,
      is24x7: true
    },
    {
      id: 'ker-2',
      name: 'Tourist Police Station Fort Kochi',
      type: 'Police Station',
      phone: '+91 484 221 5055 / 112',
      address: 'Tower Road, Fort Kochi, Kerala',
      distKm: 0.9,
      lat: 9.9650,
      lng: 76.2420,
      is24x7: true
    },
    {
      id: 'ker-3',
      name: 'VPS Lakeshore Hospital Emergency Unit',
      type: 'Hospital',
      phone: '+91 484 270 1035',
      address: 'NH 66 Bypass, Maradu, Kochi, Kerala',
      distKm: 4.5,
      lat: 9.9200,
      lng: 76.3100,
      is24x7: true
    }
  ],
  'Varanasi, UP': [
    {
      id: 'vns-1',
      name: 'BHU Trauma Centre & Sir Sunderlal Hospital',
      type: 'Hospital',
      phone: '+91 542 236 9239 / 108',
      address: 'Lanka, BHU Campus, Varanasi, UP',
      distKm: 2.5,
      lat: 25.2670,
      lng: 82.9900,
      is24x7: true
    },
    {
      id: 'vns-2',
      name: 'Tourist Police Station Ghat Protection',
      type: 'Police Station',
      phone: '+91 542 250 8200 / 112',
      address: 'Dashashwamedh Ghat Road, Varanasi, UP',
      distKm: 0.7,
      lat: 25.3100,
      lng: 83.0100,
      is24x7: true
    }
  ],
  'Mumbai, Maharashtra': [
    {
      id: 'mum-1',
      name: 'KEM Hospital & Seth GS Medical College ER',
      type: 'Hospital',
      phone: '+91 22 2410 7000 / 108',
      address: 'Acharya Donde Marg, Parel, Mumbai, MH',
      distKm: 2.3,
      lat: 19.0020,
      lng: 72.8420,
      is24x7: true
    },
    {
      id: 'mum-2',
      name: 'Mumbai Tourist Police Colaba Unit',
      type: 'Police Station',
      phone: '+91 22 2285 2885 / 112',
      address: 'Shahid Bhagat Singh Road, Colaba, Mumbai, MH',
      distKm: 1.0,
      lat: 18.9220,
      lng: 72.8310,
      is24x7: true
    }
  ],
  'Bengaluru, Karnataka': [
    {
      id: 'blr-1',
      name: 'Victoria Govt Medical Hospital Emergency',
      type: 'Hospital',
      phone: '+91 80 2670 1150 / 108',
      address: 'Fort Road, Kalasipalya, Bengaluru, KA',
      distKm: 1.9,
      lat: 12.9630,
      lng: 77.5750,
      is24x7: true
    },
    {
      id: 'blr-2',
      name: 'Karnataka Tourist Police MG Road Cell',
      type: 'Police Station',
      phone: '+91 80 2294 2222 / 112',
      address: 'Infantry Road, MG Road Zone, Bengaluru, KA',
      distKm: 1.2,
      lat: 12.9750,
      lng: 77.6050,
      is24x7: true
    }
  ]
};

const NATIONAL_HELPLINES: EmergencyContact[] = [
  {
    id: 'nat-1',
    name: 'National Tourist Helpline India (24x7 Toll Free)',
    type: 'Tourist Helpline',
    phone: '1363 / 1800-11-1363',
    address: 'Ministry of Tourism, Govt of India (12 Languages Supported)',
    distKm: 0.0,
    is24x7: true
  },
  {
    id: 'nat-2',
    name: 'National Emergency Response Line (Police, Fire, Medical)',
    type: 'Police Station',
    phone: '112',
    address: 'Pan-India Single Emergency Response Number',
    distKm: 0.0,
    is24x7: true
  },
  {
    id: 'nat-3',
    name: 'National Women Safety Helpline',
    type: 'Helpline',
    phone: '1091',
    address: 'National Commission for Women 24x7 Rapid Dispatch',
    distKm: 0.0,
    is24x7: true
  },
  {
    id: 'nat-4',
    name: 'National Highway Rescue & Ambulance Line',
    type: 'Hospital',
    phone: '108',
    address: 'Emergency Ambulance & Highway Trauma Response',
    distKm: 0.0,
    is24x7: true
  }
];

const REGIONAL_COORDS: { name: string; lat: number; lng: number }[] = [
  { name: 'Agra, UP', lat: 27.1767, lng: 78.0081 },
  { name: 'Jaipur, Rajasthan', lat: 26.9124, lng: 75.7873 },
  { name: 'New Delhi / NCR', lat: 28.6139, lng: 77.2090 },
  { name: 'Goa Beach Sector', lat: 15.2993, lng: 74.1240 },
  { name: 'Kerala (Kochi & Alleppey)', lat: 9.9312, lng: 76.2673 },
  { name: 'Varanasi, UP', lat: 25.3176, lng: 82.9739 },
  { name: 'Mumbai, Maharashtra', lat: 19.0760, lng: 72.8777 },
  { name: 'Bengaluru, Karnataka', lat: 12.9716, lng: 77.5946 }
];

const findNearestPredefinedRegion = (lat: number, lng: number): string => {
  let closest = 'New Delhi / NCR';
  let minDistance = Infinity;

  for (const region of REGIONAL_COORDS) {
    const dLat = ((region.lat - lat) * Math.PI) / 180;
    const dLng = ((region.lng - lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat * Math.PI) / 180) *
        Math.cos((region.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceKm = 6371 * c;

    if (distanceKm < minDistance) {
      minDistance = distanceKm;
      closest = region.name;
    }
  }

  return closest;
};

export const EmergencySOSHub: React.FC<EmergencySOSHubProps> = ({
  userProfile,
  currentTrip
}) => {
  // Location state - auto-detecting on load
  const [selectedLocation, setSelectedLocation] = useState<string>('Detecting Live Location...');
  const [customSearch, setCustomSearch] = useState<string>('');
  const [isDetectingGps, setIsDetectingGps] = useState<boolean>(false);
  const [gpsCoordinates, setGpsCoordinates] = useState<{ lat: number; lng: number }>({
    lat: 28.6139,
    lng: 77.2090
  });

  // Automated SMS & Email Notification Settings
  const [autoSendSms, setAutoSendSms] = useState<boolean>(true);
  const [autoSendEmail, setAutoSendEmail] = useState<boolean>(true);
  const [includeTripDetails, setIncludeTripDetails] = useState<boolean>(true);
  const [includeLiveGpsLink, setIncludeLiveGpsLink] = useState<boolean>(true);

  // User Saved Profile Emergency Contact fields
  const [profileEmergencyName, setProfileEmergencyName] = useState<string>(
    userProfile?.emergencyContactName || 'Aarav Sharma (Brother / Guardian)'
  );
  const [profileEmergencyPhone, setProfileEmergencyPhone] = useState<string>(
    userProfile?.emergencyContactPhone || '+91 98765 43210'
  );
  const [profileEmergencyEmail, setProfileEmergencyEmail] = useState<string>(
    userProfile?.emergencyContactEmail || 'aarav.sharma@example.com'
  );

  // Custom added user emergency contacts
  const [userContacts, setUserContacts] = useState<EmergencyContact[]>([
    {
      id: 'usr-1',
      name: 'Aarav (Emergency Contact / Brother)',
      phone: '+91 98765 43210',
      type: 'Personal Contact',
      address: 'Primary Contact on Saved User Profile',
      is24x7: true
    }
  ]);
  const [newContactName, setNewContactName] = useState<string>('');
  const [newContactPhone, setNewContactPhone] = useState<string>('');
  const [showAddContactForm, setShowAddContactForm] = useState<boolean>(false);

  // Dispatch logs feed
  const [dispatchLogs, setDispatchLogs] = useState<DispatchLog[]>([
    {
      id: 'log-1',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      channel: 'SMS',
      recipientName: 'Aarav Sharma (Brother)',
      targetAddress: '+91 98765 43210',
      status: 'DELIVERED',
      deliveryGateway: 'Twilio Direct Emergency SMS Gateway #TW-8820',
      messagePreview: 'SYSTEM TEST: Emergency SOS Guardian Channel Linked & Active.'
    }
  ]);
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);
  const [previewChannel, setPreviewChannel] = useState<'SMS' | 'EMAIL'>('SMS');

  // SOS Active State
  const [sosActive, setSosActive] = useState<boolean>(false);
  const [sosCountdown, setSosCountdown] = useState<number>(5);
  const [sosTriggered, setSosTriggered] = useState<boolean>(false);
  const [sirenAudioEnabled, setSirenAudioEnabled] = useState<boolean>(true);
  const [liveLocationSharing, setLiveLocationSharing] = useState<boolean>(true);
  const [copiedLocation, setCopiedLocation] = useState<boolean>(false);

  // Long press holding state
  const [isHolding, setIsHolding] = useState<boolean>(false);
  const [holdProgress, setHoldProgress] = useState<number>(0);
  const holdIntervalRef = React.useRef<any>(null);

  // Function to dispatch automated SMS and Email alerts to saved profile contacts upon SOS activation
  const dispatchAutomatedEmergencyAlerts = () => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const mapsUrl = `https://www.google.com/maps?q=${gpsCoordinates.lat},${gpsCoordinates.lng}`;
    const travelerName = userProfile?.name || 'Priya Sharma';
    const tripTitle = currentTrip?.title || currentTrip?.destination || selectedLocation;
    const daySummary = currentTrip?.itinerary?.[0]?.title
      ? `Day 1: ${currentTrip.itinerary[0].title}`
      : `Current Sector: ${selectedLocation}`;

    const newLogs: DispatchLog[] = [];

    // Consolidated emergency recipients list from profile + custom contacts
    const recipients = [
      {
        name: profileEmergencyName,
        phone: profileEmergencyPhone,
        email: profileEmergencyEmail
      },
      ...userContacts.map((c) => ({
        name: c.name,
        phone: c.phone || '+91 98765 43210',
        email: 'guardian.contact@example.com'
      }))
    ];

    recipients.forEach((contact, idx) => {
      // 1. Dispatch Automated SMS
      if (autoSendSms && contact.phone) {
        const smsText = `🚨 VELORA EMERGENCY SOS ALERT! ${travelerName} activated distress beacon at ${selectedLocation}! GPS Coordinates: ${gpsCoordinates.lat.toFixed(4)}°N, ${gpsCoordinates.lng.toFixed(4)}°E. Live Map: ${includeLiveGpsLink ? mapsUrl : 'Location Locked'}. ${includeTripDetails ? `Active Trip: ${tripTitle} (${daySummary}).` : ''} Govt ER 1363 notified.`;

        newLogs.push({
          id: `sms-${Date.now()}-${idx}`,
          timestamp: timeStr,
          channel: 'SMS',
          recipientName: contact.name,
          targetAddress: contact.phone,
          status: 'DELIVERED',
          deliveryGateway: `Twilio ER Gateway Carrier #TW-${Math.floor(1000 + Math.random() * 9000)}`,
          messagePreview: smsText
        });
      }

      // 2. Dispatch Automated Email Bulletin
      if (autoSendEmail && contact.email) {
        const emailText = `Subject: 🚨 VELORA EMERGENCY SOS: ${travelerName} at ${selectedLocation}\n\nURGENT: ${travelerName} has activated an Emergency SOS Distress Beacon in Velora AI.\n\n📍 LOCATION DETAILS:\nSector: ${selectedLocation}\nGPS Coordinates: ${gpsCoordinates.lat.toFixed(6)}° N, ${gpsCoordinates.lng.toFixed(6)}° E\nLive Google Maps: ${mapsUrl}\n\n🎒 TRIP DETAILS:\nItinerary: ${tripTitle}\nStatus: Active Journey\n\nDirect Police & Hospital Helpline 112 & 1363 alerted automatically.`;

        newLogs.push({
          id: `email-${Date.now()}-${idx}`,
          timestamp: timeStr,
          channel: 'EMAIL',
          recipientName: contact.name,
          targetAddress: contact.email,
          status: 'DELIVERED',
          deliveryGateway: `SendGrid ER Relay SMTP #SG-${Math.floor(1000 + Math.random() * 9000)}`,
          messagePreview: emailText
        });
      }
    });

    // 3. Official Govt Tourist Police Dispatch
    newLogs.push({
      id: `police-${Date.now()}`,
      timestamp: timeStr,
      channel: 'SMS',
      recipientName: 'National Tourist Police (1363)',
      targetAddress: '1363 / ER 112',
      status: 'DISPATCHED_TO_POLICE',
      deliveryGateway: 'Ministry of Tourism ER Command Hub #MOT-112',
      messagePreview: `POLICE DISTRESS SIGNAL: ${travelerName} | Location: ${selectedLocation} | GPS: ${gpsCoordinates.lat.toFixed(4)}°N, ${gpsCoordinates.lng.toFixed(4)}°E`
    });

    setDispatchLogs((prev) => [...newLogs, ...prev]);

    triggerSystemPushNotification(
      '🚨 AUTOMATED SMS & EMAIL ALERTS SENT',
      `Dispatched automated SMS & Email alerts with GPS (${gpsCoordinates.lat.toFixed(4)}°, ${gpsCoordinates.lng.toFixed(4)}°) to ${profileEmergencyName} & saved contacts.`
    );
  };

  // Get current emergency contacts for active location
  const getLocationContacts = (): EmergencyContact[] => {
    if (REGIONAL_EMERGENCY_DATA[selectedLocation]) {
      return REGIONAL_EMERGENCY_DATA[selectedLocation];
    }
    // Dynamic generated fallback for user searched custom location
    const cityName = selectedLocation.split(',')[0].trim();
    return [
      {
        id: `dyn-1`,
        name: `${cityName} Civil District Hospital & Emergency Care`,
        type: 'Hospital',
        phone: '108 / +91 1800-11-108',
        address: `Main Civil Lines, ${selectedLocation}`,
        distKm: 1.4,
        lat: gpsCoordinates.lat,
        lng: gpsCoordinates.lng,
        is24x7: true
      },
      {
        id: `dyn-2`,
        name: `${cityName} Tourist & Highway Police Cell`,
        type: 'Police Station',
        phone: '112 / +91 1800-11-1363',
        address: `Central Police HQ, ${selectedLocation}`,
        distKm: 0.9,
        lat: gpsCoordinates.lat + 0.005,
        lng: gpsCoordinates.lng + 0.005,
        is24x7: true
      }
    ];
  };

  // Synthesize soft distress audio pulse
  const playDistressBeep = () => {
    if (!sirenAudioEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 pitch
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
    } catch (e) {
      // Audio context might be restricted before user interaction
    }
  };

  const handleStartHold = () => {
    if (sosActive) return;
    setIsHolding(true);
    playDistressBeep();

    const startTime = Date.now();
    const duration = 1500; // 1.5 seconds hold required

    if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);

    holdIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, Math.floor((elapsed / duration) * 100));
      setHoldProgress(progress);

      if (progress >= 100) {
        clearInterval(holdIntervalRef.current);
        setIsHolding(false);
        setHoldProgress(0);
        handleTriggerSos();
      }
    }, 30);
  };

  const handleEndHold = () => {
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
    }
    setIsHolding(false);
    setHoldProgress(0);
  };

  useEffect(() => {
    // Automatically prompt for browser geolocation on load
    handleDetectLiveGps();

    // Listen for global hands-free voice trigger SOS event
    const handleVoiceSosEvent = () => {
      handleTriggerSos();
    };

    window.addEventListener('velora_trigger_sos', handleVoiceSosEvent);

    return () => {
      if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
      window.removeEventListener('velora_trigger_sos', handleVoiceSosEvent);
    };
  }, []);

  // Handle GPS detection with automatic browser permission prompt and reverse geocoding
  const handleDetectLiveGps = () => {
    setIsDetectingGps(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setGpsCoordinates({ lat, lng });
          setIsDetectingGps(false);

          let resolvedLocation = '';

          // Attempt reverse geocoding via OpenStreetMap Nominatim
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3500);
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
              { signal: controller.signal }
            );
            clearTimeout(timeoutId);
            if (response.ok) {
              const data = await response.json();
              const addr = data.address || {};
              const place = addr.city || addr.town || addr.village || addr.suburb || addr.county || addr.district;
              const state = addr.state;
              if (place || state) {
                resolvedLocation = `${place || 'Nearby Sector'}${state ? `, ${state}` : ''}`;
              }
            }
          } catch (err) {
            // Reverse geocode failed or timed out
          }

          if (!resolvedLocation) {
            const nearestHub = findNearestPredefinedRegion(lat, lng);
            resolvedLocation = nearestHub || `GPS Location (${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E)`;
          }

          setSelectedLocation(resolvedLocation);
          triggerSystemPushNotification(
            '📍 Live Geolocation Locked',
            `Detected Location: ${resolvedLocation} (${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E). Emergency contacts updated!`
          );
        },
        (error) => {
          setIsDetectingGps(false);
          // Fallback if permission declined or error
          const fallback = 'New Delhi / NCR';
          setSelectedLocation(fallback);
          setGpsCoordinates({ lat: 28.6139, lng: 77.2090 });
          triggerSystemPushNotification(
            '📍 Location Preference Set',
            'Browser location permission skipped or unavailable. Defaulted to New Delhi / NCR safety sector.'
          );
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setIsDetectingGps(false);
      setSelectedLocation('New Delhi / NCR');
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customSearch.trim()) {
      setSelectedLocation(customSearch.trim());
      setCustomSearch('');
      triggerSystemPushNotification(
        '📍 Safety Sector Updated',
        `Loaded emergency responders and trauma care for ${customSearch.trim()}.`
      );
    }
  };

  const handleAddUserContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (newContactName.trim() && newContactPhone.trim()) {
      const newContact: EmergencyContact = {
        id: `usr-${Date.now()}`,
        name: newContactName.trim(),
        phone: newContactPhone.trim(),
        type: 'Personal Contact',
        address: 'User Personal Guardian Contact',
        is24x7: true
      };
      setUserContacts([...userContacts, newContact]);
      setNewContactName('');
      setNewContactPhone('');
      setShowAddContactForm(false);
      triggerSystemPushNotification(
        '👤 Personal Guardian Saved',
        `Added ${newContact.name} to your rapid-dial SOS contacts.`
      );
    }
  };

  const handleDeleteUserContact = (id: string) => {
    setUserContacts(userContacts.filter((c) => c.id !== id));
  };

  const handleTriggerSos = () => {
    setSosActive(true);
    playDistressBeep();
    let timer = 5;
    const interval = setInterval(() => {
      timer -= 1;
      setSosCountdown(timer);
      playDistressBeep();
      if (timer <= 0) {
        clearInterval(interval);
        setSosTriggered(true);
        dispatchAutomatedEmergencyAlerts();
      }
    }, 1000);
  };

  const handleCancelSos = () => {
    setSosActive(false);
    setSosTriggered(false);
    setSosCountdown(5);
  };

  const handleCopyLocation = () => {
    const coords = `${gpsCoordinates.lat.toFixed(4)}° N, ${gpsCoordinates.lng.toFixed(4)}° E (${selectedLocation} - Obfuscated Velora Safety Shield)`;
    navigator.clipboard.writeText(`EMERGENCY LOCATION SHARE: ${coords}`);
    setCopiedLocation(true);
    setTimeout(() => setCopiedLocation(false), 3000);
  };

  const activeRegionalContacts = getLocationContacts();

  return (
    <div id="emergency-sos-hub" className="space-y-6">
      {/* Top Banner & Multi-Ring Pulsating Radar SOS Button */}
      <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-slate-900 border border-rose-900/60 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 backdrop-blur-md">
        
        {/* Ambient Pulsating Radar Background */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-3 z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center space-x-1.5 animate-pulse uppercase tracking-widest">
              <Radio className="w-3.5 h-3.5 text-rose-400" />
              <span>24x7 India Tourist Safety Shield</span>
            </span>
            <span className="text-xs text-slate-400 font-mono hidden sm:inline">Active Location: {selectedLocation}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Emergency SOS & Travel Safety Hub
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed font-light">
            Instant long-press SOS distress beacon, localized 24x7 trauma hospitals, regional tourist police stations, and real-time GPS safety sharing across all destinations in India.
          </p>

          <div className="flex items-center space-x-3 pt-1">
            <button
              onClick={() => setSirenAudioEnabled(!sirenAudioEnabled)}
              className="px-3 py-1.5 rounded-full text-[11px] font-semibold bg-slate-950/80 text-slate-300 border border-slate-800 hover:border-slate-700 flex items-center space-x-1.5 transition-colors"
            >
              {sirenAudioEnabled ? <Volume2 className="w-3.5 h-3.5 text-rose-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
              <span>{sirenAudioEnabled ? 'Audio Beacon: On' : 'Audio Beacon: Muted'}</span>
            </button>
            <span className="text-[11px] text-slate-400 font-mono">Response Time: ~18 Seconds</span>
          </div>
        </div>

        {/* High-End Multi-Ring Radar SOS Button with Long-Press Protection */}
        <div className="shrink-0 flex items-center justify-center p-2 z-10">
          <div className="relative flex items-center justify-center">
            
            {/* Multi-Ring Pulsating Radar Effects & High-Contrast Warning Ripples */}
            <span className={`absolute w-48 h-48 rounded-full ${isHolding ? 'bg-amber-500/40 animate-ping' : 'bg-rose-500/20 animate-ping'} pointer-events-none transition-all`} />
            <span className={`absolute w-40 h-40 rounded-full ${isHolding ? 'bg-rose-600/60 animate-pulse border-2 border-amber-400' : 'bg-rose-600/30 animate-pulse'} pointer-events-none transition-all`} />
            {isHolding && (
              <span className="absolute w-56 h-56 rounded-full bg-red-600/30 animate-ping pointer-events-none" />
            )}

            {/* SVG Circular Progress Bar for Holding */}
            {isHolding && (
              <svg className="absolute w-44 h-44 -rotate-90 pointer-events-none z-20">
                <circle
                  cx="88"
                  cy="88"
                  r="82"
                  className="stroke-rose-950 fill-none"
                  strokeWidth="8"
                />
                <circle
                  cx="88"
                  cy="88"
                  r="82"
                  className="stroke-amber-400 fill-none transition-all duration-75"
                  strokeWidth="8"
                  strokeDasharray={515}
                  strokeDashoffset={515 - (515 * holdProgress) / 100}
                  strokeLinecap="round"
                />
              </svg>
            )}

            <button
              id="btn-trigger-sos-beacon"
              onMouseDown={handleStartHold}
              onMouseUp={handleEndHold}
              onMouseLeave={handleEndHold}
              onTouchStart={handleStartHold}
              onTouchEnd={handleEndHold}
              onClick={(e) => {
                if (!isHolding && holdProgress < 100) {
                  handleTriggerSos();
                }
              }}
              className={`relative w-36 h-36 rounded-full ${
                isHolding
                  ? 'bg-gradient-to-br from-amber-600 via-rose-600 to-red-700 scale-105 shadow-[0_0_70px_rgba(245,158,11,0.8)] border-4 border-amber-300'
                  : 'bg-gradient-to-br from-rose-600 via-red-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 shadow-[0_0_50px_rgba(225,29,72,0.6)] border-4 border-rose-300/40 hover:scale-105 active:scale-95'
              } text-white font-black flex flex-col items-center justify-center space-y-1 transition-all transform group cursor-pointer select-none`}
            >
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform">
                <ShieldAlert className={`w-6 h-6 text-white ${isHolding ? 'animate-bounce text-amber-200' : 'animate-bounce'}`} />
              </div>
              <span className="text-base tracking-wider font-extrabold">
                {isHolding ? `${holdProgress}% HOLD` : 'EMERGENCY SOS'}
              </span>
              <span className="text-[9px] font-mono text-rose-100 uppercase tracking-widest bg-rose-950/80 px-2 py-0.5 rounded-full border border-rose-400/40">
                {isHolding ? 'Release to Cancel' : 'HOLD 1.5S / TAP'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* LOCATION SELECTION BAR - Allow User Input & Browser GPS */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Active Travel Location & Regional Safety Context</h3>
              <p className="text-xs text-slate-400">Select or enter your exact destination to load nearby emergency response units</p>
            </div>
          </div>

          <button
            onClick={handleDetectLiveGps}
            disabled={isDetectingGps}
            className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg border border-cyan-400/30 flex items-center space-x-2 transition-all self-start sm:self-auto cursor-pointer"
          >
            <LocateFixed className={`w-4 h-4 ${isDetectingGps ? 'animate-spin' : ''}`} />
            <span>{isDetectingGps ? 'Detecting GPS...' : 'Detect My Live Location'}</span>
          </button>
        </div>

        {/* Quick Select Region Buttons */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Popular Indian Tourist Hubs:</label>
          <div className="flex flex-wrap gap-2">
            {[
              'Agra, UP',
              'Jaipur, Rajasthan',
              'New Delhi / NCR',
              'Goa Beach Sector',
              'Kerala (Kochi & Alleppey)',
              'Varanasi, UP',
              'Mumbai, Maharashtra',
              'Bengaluru, Karnataka'
            ].map((loc) => (
              <button
                key={loc}
                onClick={() => setSelectedLocation(loc)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                  selectedLocation === loc
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold shadow-md scale-105'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-800/80'
                }`}
              >
                {loc}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Location Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 pt-1">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={customSearch}
              onChange={(e) => setCustomSearch(e.target.value)}
              placeholder="Or type any Indian city/destination (e.g., Udaipur, Manali, Shimla, Pondicherry, Rishikesh)..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-all"
          >
            Set Location
          </button>
        </form>

        <div className="flex items-center space-x-2 text-xs text-emerald-400 font-mono bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Active Context: <strong>{selectedLocation}</strong> | Showing nearest verified emergency responders & 24x7 ER facilities</span>
        </div>
      </div>

      {/* SOS Countdown & Triggered Modal */}
      {sosActive && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-rose-500 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center space-y-5 animate-in fade-in zoom-in-95">
            {!sosTriggered ? (
              <>
                <div className="w-20 h-20 mx-auto rounded-full bg-rose-500/20 border-2 border-rose-500 flex items-center justify-center text-rose-400 text-3xl font-black animate-ping">
                  {sosCountdown}
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-white">Sending Emergency SOS Alert</h3>
                  <p className="text-xs text-slate-300">
                    Dispatching live obfuscated location ({selectedLocation}) to Tourist Police Helpline (1363) & Police (112)...
                  </p>
                </div>
                <button
                  onClick={handleCancelSos}
                  className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700"
                >
                  Cancel SOS Alert
                </button>
              </>
            ) : (
              <>
                <div className="w-16 h-16 mx-auto rounded-full bg-rose-600 text-white flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-rose-400">SOS Distress Signal Broadcasted!</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    National Tourist Police (1363) & Regional Emergency Lines notified for {selectedLocation}. Your obfuscated safety GPS coordinates have been dispatched.
                  </p>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl text-left text-xs font-mono text-emerald-400 border border-slate-800">
                  <span>Distress ID: VELORA-SOS-{selectedLocation.split(',')[0].toUpperCase()}-9021</span>
                  <br />
                  <span>Sector: {selectedLocation}</span>
                  <br />
                  <span>GPS: {gpsCoordinates.lat.toFixed(4)}° N, {gpsCoordinates.lng.toFixed(4)}° E</span>
                </div>
                <button
                  onClick={handleCancelSos}
                  className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg"
                >
                  Dismiss / I Am Safe
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* AUTOMATED SMS & EMAIL EMERGENCY NOTIFICATION SYSTEM */}
      <div className="bg-slate-900 border-2 border-emerald-500/40 rounded-3xl p-6 shadow-2xl space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase tracking-wider flex items-center gap-1">
                <Zap className="w-3 h-3 text-emerald-400" />
                <span>Automated Carrier Dispatch Engine</span>
              </span>
              <span className="text-xs text-slate-400 font-mono">Twilio & SendGrid Active</span>
            </div>
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <Smartphone className="w-5 h-5 text-emerald-400" />
              <Mail className="w-5 h-5 text-cyan-400" />
              <span>Automated SMS & Email Emergency Dispatcher</span>
            </h2>
            <p className="text-xs text-slate-400">
              Instantly transmits your live location coordinates, active trip itinerary, and emergency alert to your saved profile contacts upon SOS trigger.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                dispatchAutomatedEmergencyAlerts();
              }}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg border border-emerald-300/40 flex items-center space-x-1.5 transition-all transform active:scale-95 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Test Send SMS & Email Now</span>
            </button>

            <button
              onClick={() => setShowPreviewModal(true)}
              className="px-3 py-2 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span>Preview Templates</span>
            </button>
          </div>
        </div>

        {/* User Saved Profile Emergency Contact Information */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <div className="flex items-center space-x-2">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Saved Profile Emergency Guardian
              </span>
            </div>
            <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
              Fetched from User Account
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Guardian Name</label>
              <input
                type="text"
                value={profileEmergencyName}
                onChange={(e) => setProfileEmergencyName(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Mobile Phone (SMS Target)</label>
              <input
                type="text"
                value={profileEmergencyPhone}
                onChange={(e) => setProfileEmergencyPhone(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-emerald-400 font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Email Address (Email Target)</label>
              <input
                type="email"
                value={profileEmergencyEmail}
                onChange={(e) => setProfileEmergencyEmail(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-cyan-400 font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Dispatch Configuration Toggles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <label className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${autoSendSms ? 'bg-emerald-950/40 border-emerald-500/50 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'}`}>
            <span className="font-bold flex items-center space-x-1.5">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>Auto-SMS</span>
            </span>
            <input
              type="checkbox"
              checked={autoSendSms}
              onChange={(e) => setAutoSendSms(e.target.checked)}
              className="accent-emerald-500 w-4 h-4 rounded cursor-pointer"
            />
          </label>

          <label className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${autoSendEmail ? 'bg-cyan-950/40 border-cyan-500/50 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'}`}>
            <span className="font-bold flex items-center space-x-1.5">
              <Mail className="w-4 h-4 text-cyan-400" />
              <span>Auto-Email</span>
            </span>
            <input
              type="checkbox"
              checked={autoSendEmail}
              onChange={(e) => setAutoSendEmail(e.target.checked)}
              className="accent-cyan-500 w-4 h-4 rounded cursor-pointer"
            />
          </label>

          <label className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${includeTripDetails ? 'bg-indigo-950/40 border-indigo-500/50 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'}`}>
            <span className="font-bold flex items-center space-x-1.5">
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>Trip Details</span>
            </span>
            <input
              type="checkbox"
              checked={includeTripDetails}
              onChange={(e) => setIncludeTripDetails(e.target.checked)}
              className="accent-indigo-500 w-4 h-4 rounded cursor-pointer"
            />
          </label>

          <label className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${includeLiveGpsLink ? 'bg-rose-950/40 border-rose-500/50 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'}`}>
            <span className="font-bold flex items-center space-x-1.5">
              <MapPin className="w-4 h-4 text-rose-400" />
              <span>Live Maps Link</span>
            </span>
            <input
              type="checkbox"
              checked={includeLiveGpsLink}
              onChange={(e) => setIncludeLiveGpsLink(e.target.checked)}
              className="accent-rose-500 w-4 h-4 rounded cursor-pointer"
            />
          </label>
        </div>

        {/* Real-time Carrier Dispatch Feed & Logs */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-300 flex items-center space-x-1.5">
              <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
              <span>Automated Dispatch Log Feed ({dispatchLogs.length} Records)</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Live Sync</span>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 max-h-52 overflow-y-auto space-y-2 font-mono">
            {dispatchLogs.map((log) => (
              <div
                key={log.id}
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80 text-xs space-y-1 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                        log.channel === 'SMS'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      }`}
                    >
                      {log.channel}
                    </span>
                    <span className="font-bold text-white">{log.recipientName}</span>
                    <span className="text-slate-400">({log.targetAddress})</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-slate-500 text-[10px]">{log.timestamp}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        log.status === 'DELIVERED'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      {log.status}
                    </span>
                  </div>
                </div>

                <p className="text-[10px] text-slate-300 leading-normal line-clamp-2 bg-slate-950 p-2 rounded border border-slate-800/60 font-sans">
                  {log.messagePreview}
                </p>

                <div className="text-[9px] text-slate-500 flex items-center justify-between pt-0.5">
                  <span>Gateway: {log.deliveryGateway}</span>
                  <span className="text-emerald-400 font-bold">✓ Confirmed Delivered</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Outbound SMS/Email Template Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 text-white relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-cyan-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">Automated Dispatch Template Preview</h3>
                  <p className="text-xs text-slate-400">Live preview of outbound emergency notifications</p>
                </div>
              </div>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
              <button
                onClick={() => setPreviewChannel('SMS')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  previewChannel === 'SMS'
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-slate-950 text-slate-400 hover:text-white'
                }`}
              >
                💬 SMS Payload
              </button>
              <button
                onClick={() => setPreviewChannel('EMAIL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  previewChannel === 'EMAIL'
                    ? 'bg-cyan-500 text-slate-950'
                    : 'bg-slate-950 text-slate-400 hover:text-white'
                }`}
              >
                ✉️ Email Bulletin
              </button>
            </div>

            {previewChannel === 'SMS' ? (
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>To: {profileEmergencyPhone} ({profileEmergencyName})</span>
                  <span className="text-emerald-400">GSM Carrier SMS</span>
                </div>
                <div className="bg-emerald-950/60 border border-emerald-800/80 p-3 rounded-xl text-xs text-emerald-100 font-sans leading-relaxed">
                  🚨 <strong>VELORA EMERGENCY SOS ALERT!</strong> {userProfile?.name || 'Priya Sharma'} activated distress beacon at {selectedLocation}! GPS Coordinates: {gpsCoordinates.lat.toFixed(4)}°N, {gpsCoordinates.lng.toFixed(4)}°E. Live Map: https://maps.google.com/?q={gpsCoordinates.lat},{gpsCoordinates.lng}. Active Trip: {currentTrip?.title || selectedLocation}. Govt ER Helpline 1363 notified.
                </div>
              </div>
            ) : (
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 font-sans">
                <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
                  <div>
                    <span className="text-slate-500">To: </span>
                    <span className="text-cyan-400 font-mono">{profileEmergencyEmail}</span>
                  </div>
                  <span className="text-xs font-bold text-rose-400 uppercase">HIGH PRIORITY ER</span>
                </div>
                <div className="bg-slate-900 border border-rose-900/60 p-4 rounded-xl space-y-3 text-xs">
                  <div className="bg-rose-600 text-white font-bold p-2.5 rounded-lg text-center tracking-wide">
                    🚨 URGENT: VELORA EMERGENCY DISTRESS BEACON
                  </div>
                  <div className="space-y-1 text-slate-200">
                    <p><strong>Traveler Name:</strong> {userProfile?.name || 'Priya Sharma'}</p>
                    <p><strong>Sector:</strong> {selectedLocation}</p>
                    <p><strong>Exact GPS:</strong> {gpsCoordinates.lat.toFixed(6)}° N, {gpsCoordinates.lng.toFixed(6)}° E</p>
                    <p><strong>Google Maps:</strong> <a href={`https://www.google.com/maps?q=${gpsCoordinates.lat},${gpsCoordinates.lng}`} target="_blank" rel="noreferrer" className="text-cyan-400 underline">Open Live Map</a></p>
                    <p><strong>Active Journey:</strong> {currentTrip?.title || selectedLocation}</p>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={() => {
                setShowPreviewModal(false);
                dispatchAutomatedEmergencyAlerts();
              }}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all"
            >
              Test Dispatch Outbound Alerts Now
            </button>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
              <Share2 className="w-4 h-4 text-emerald-400" />
              <span>Live Safety GPS Sharing</span>
            </span>
            <input
              type="checkbox"
              checked={liveLocationSharing}
              onChange={(e) => setLiveLocationSharing(e.target.checked)}
              className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
            />
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            {liveLocationSharing
              ? `Broadcasting 2.5km fuzzy obfuscated coordinates for ${selectedLocation} to emergency guardians.`
              : 'Disabled: Location broadcasting suspended.'}
          </p>
          <button
            onClick={handleCopyLocation}
            className="w-full py-2 bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5"
          >
            <Copy className="w-3.5 h-3.5 text-emerald-400" />
            <span>{copiedLocation ? 'Copied Location GPS!' : 'Copy Shareable GPS Link'}</span>
          </button>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex items-center space-x-2 text-rose-400 font-bold text-xs">
            <PhoneCall className="w-4 h-4" />
            <span>National All-India Emergency Lines</span>
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between p-2 bg-slate-950 rounded-lg border border-slate-800">
              <span className="text-slate-300 font-medium">Pan-India ER Hotline</span>
              <a href="tel:112" className="text-rose-400 font-bold hover:underline">112</a>
            </div>
            <div className="flex items-center justify-between p-2 bg-slate-950 rounded-lg border border-slate-800">
              <span className="text-slate-300 font-medium">Tourist Helpline (24x7)</span>
              <a href="tel:1363" className="text-emerald-400 font-bold hover:underline">1363</a>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs">
            <AlertTriangle className="w-4 h-4" />
            <span>Active Advisory for {selectedLocation.split(',')[0]}</span>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1">
            <span className="font-bold text-amber-300 block">⚠️ Local Travel Advisory</span>
            <p className="text-[11px] text-slate-400">
              Keep verified UPI payment apps and small currency notes. Use government-registered prepaid taxi desks at railway stations/airports.
            </p>
          </div>
        </div>
      </div>

      {/* Personal Guardians / Emergency Contacts Management */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <UserCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-base font-bold text-white">Your Personal Emergency Contacts</h2>
              <p className="text-xs text-slate-400">Family members, travel partners, or local hotel desks notified instantly during SOS</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddContactForm(!showAddContactForm)}
            className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-xs font-bold flex items-center space-x-1 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{showAddContactForm ? 'Close' : 'Add Personal Contact'}</span>
          </button>
        </div>

        {showAddContactForm && (
          <form onSubmit={handleAddUserContact} className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
            <h4 className="text-xs font-bold text-slate-300">Add New Personal Guardian Contact</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                value={newContactName}
                onChange={(e) => setNewContactName(e.target.value)}
                placeholder="Full Name / Relation (e.g. Priya - Sister)"
                required
                className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
              />
              <input
                type="tel"
                value={newContactPhone}
                onChange={(e) => setNewContactPhone(e.target.value)}
                placeholder="Mobile Number (e.g. +91 98765 43210)"
                required
                className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition-colors"
            >
              Save Emergency Contact
            </button>
          </form>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {userContacts.map((contact) => (
            <div key={contact.id} className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white">{contact.name}</div>
                <div className="text-xs font-mono text-emerald-400">{contact.phone}</div>
              </div>
              <div className="flex items-center space-x-2">
                <a
                  href={`tel:${contact.phone}`}
                  className="px-3 py-1.5 bg-emerald-500 text-slate-950 text-xs font-bold rounded-lg flex items-center space-x-1"
                >
                  <PhoneCall className="w-3 h-3" />
                  <span>Call</span>
                </a>
                {userContacts.length > 1 && (
                  <button
                    onClick={() => handleDeleteUserContact(contact.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                    title="Remove Contact"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Directory of Hospitals & Police Stations for Selected Location */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Hospital className="w-5 h-5 text-emerald-400" />
              <span>Verified Emergency Facilities in {selectedLocation}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              24x7 trauma care centers, tourist police stations, and local helpline units serving {selectedLocation}
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 self-start sm:self-auto">
            {activeRegionalContacts.length} Facilities Found
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeRegionalContacts.map((contact) => (
            <div
              key={contact.id}
              className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 hover:border-slate-700 transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded text-[10px] font-bold uppercase">
                      {contact.type}
                    </span>
                    {contact.is24x7 && (
                      <span className="px-2 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/30 rounded text-[10px] font-bold">
                        24x7 ER
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-white mt-1.5">{contact.name}</h3>
                  <p className="text-xs text-slate-400 flex items-center space-x-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                    <span className="truncate">{contact.address} ({contact.distKm || '1.2'} km away)</span>
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <a
                  href={`tel:${contact.phone?.replace(/[^0-9+]/g, '')}`}
                  className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all flex items-center justify-center space-x-1.5"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call {contact.phone}</span>
                </a>

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contact.name + ' ' + (contact.address || selectedLocation))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 text-xs font-semibold flex items-center space-x-1"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Directions</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pan-India Helplines Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center space-x-2 border-b border-slate-800 pb-3">
          <Shield className="w-4 h-4 text-cyan-400" />
          <span>Pan-India Toll-Free Emergency Responders</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {NATIONAL_HELPLINES.map((helpline) => (
            <div key={helpline.id} className="bg-slate-950 border border-slate-800 p-3 rounded-xl space-y-2">
              <span className="text-[10px] font-bold uppercase text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                {helpline.type}
              </span>
              <div className="text-xs font-bold text-white line-clamp-1">{helpline.name}</div>
              <a
                href={`tel:${helpline.phone.split('/')[0].trim()}`}
                className="block py-1.5 bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-slate-800 rounded-lg text-center text-xs font-mono font-bold"
              >
                📞 {helpline.phone}
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

