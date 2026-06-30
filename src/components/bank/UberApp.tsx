import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { motion, AnimatePresence } from 'framer-motion';
import { Car, MapPin, Search, Navigation, CreditCard, Clock, Star, Shield, ArrowRight, Loader2, Check, CheckCircle2, ChevronRight, MessageSquare, Phone, Locate, Calendar, Trash2, Users, TrendingUp, Info, History, Share2, AlertTriangle } from 'lucide-react';
import { db } from '../../firebase';
import { collection, addDoc, doc, updateDoc, getDocs, query, where, deleteDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { sendEmailViaService, EmailPreviewModal } from './EmailService';

// Firestore Error handler interface and helper mapping to Firebase Skill rules
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
  }
}

function handleLocalFirestoreError(error: unknown, operationType: OperationType, path: string | null, userId?: string) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: userId || "anonymous"
    },
    operationType,
    path
  };
  console.error('Firestore Dynamic Error: ', JSON.stringify(errInfo));
}

interface UberAppProps {
  user: any;
  balances: Record<string, number>;
  setBalances: React.Dispatch<React.SetStateAction<Record<string, number>>>;
}

const VEHICLE_OPTIONS = [
  {
    id: 'uberx',
    name: 'UberX',
    description: 'Affordable, everyday rides',
    multiplier: 1.0,
    eta: '3 mins',
    carModel: 'Tesla Model Y (Silver)',
    rating: '4.95',
    priceEstimate: 38.50,
    icon: Car,
    driver: 'John'
  },
  {
    id: 'uberexec',
    name: 'Uber Black',
    description: 'High-end premium rides',
    multiplier: 1.8,
    eta: '5 mins',
    carModel: 'Mercedes EQS (Black)',
    rating: '4.99',
    priceEstimate: 69.30,
    icon: Shield,
    driver: 'Alexander'
  },
  {
    id: 'uberlux',
    name: 'Sovereign Lux',
    description: 'Ultra-luxury chauffeur travel',
    multiplier: 4.5,
    eta: '8 mins',
    carModel: 'Rolls-Royce Spectre (Cosmic Black)',
    rating: '5.0',
    priceEstimate: 173.25,
    icon: CrownIcon,
    driver: 'Garrison (VIP Concierge)'
  }
];

const PRESETS = [
  {
    name: "Clontarf Sovereign Estate",
    address: "13 Beatrice St, Clontarf NSW 2093",
    coords: { lat: -33.8058, lng: 151.2519 }
  },
  {
    name: "Artarmon Tech Sector Campus",
    address: "98 South St, Artarmon NSW 2064",
    coords: { lat: -33.8123, lng: 151.1856 }
  },
  {
    name: "Sydney CBD (Martin Place)",
    address: "Martin Pl, Sydney NSW 2000",
    coords: { lat: -33.8675, lng: 151.2100 }
  },
  {
    name: "Sydney International Airport (YSSY)",
    address: "Airport Dr, Mascot NSW 2020",
    coords: { lat: -33.9461, lng: 151.1772 }
  }
];

export const MOCK_DRIVERS_PROFILE: Record<string, {
  rating: string;
  ridesCount: number;
  trips: string;
  joined: string;
  languages: string[];
  bio: string;
  car: string;
  license: string;
  verified: boolean;
  badges: string[];
}> = {
  "John": {
    rating: "4.95",
    ridesCount: 1420,
    trips: "1,200+ trips",
    joined: "Joined 2023",
    languages: ["English", "Spanish"],
    bio: "Tesla enthusiast, professional chauffeur, and music guide. John knows Sydney's best shortcuts and offers a quiet, relaxed cabin ambiance.",
    car: "Tesla Model Y (Silver)",
    license: "VIP-TX-081",
    verified: true,
    badges: ["Top Rated", "Quiet Cabin", "Excellent Route Guide"]
  },
  "Alexander": {
    rating: "4.99",
    ridesCount: 2850,
    trips: "2,500+ trips",
    joined: "Joined 2021",
    languages: ["English", "German", "French"],
    bio: "Ex-corporate high-class driver. Alexander specializes in VIP transfers and premium, smooth, silent commutes in his high-performance EQS.",
    car: "Mercedes EQS (Black)",
    license: "VIP-MQ-202",
    verified: true,
    badges: ["Elite Ambassador", "Great Conversation", "Fluent Multilingual"]
  },
  "Garrison (VIP Concierge)": {
    rating: "5.0",
    ridesCount: 410,
    trips: "400+ VIP assignments",
    joined: "Joined 2024",
    languages: ["English", "Mandarin", "Japanese"],
    bio: "Garrison is our ultimate luxury host. Formerly a concierge at a 5-star hotel, he delivers elite, gold-standard chauffeured experiences in his Spectre.",
    car: "Rolls-Royce Spectre (Cosmic Black)",
    license: "SOV-RR-001",
    verified: true,
    badges: ["Five-Star Concierge", "Sovereign Executive Host", "Sparkling Water Host"]
  },
  "Demetri": {
    rating: "4.98",
    ridesCount: 950,
    trips: "950 trips",
    joined: "Joined 2022",
    languages: ["English", "Greek"],
    bio: "Professional high-security driver. Demetri prides himself on punctual, secure operations and high-precision rides in his premium Audi.",
    car: "Audi e-tron GT (Storm Grey)",
    license: "VIP-AU-505",
    verified: true,
    badges: ["Defensive Driving Cert", "Punctual Maestro"]
  },
  "Svetlana": {
    rating: "4.97",
    ridesCount: 1680,
    trips: "1,680 trips",
    joined: "Joined 2020",
    languages: ["English", "Russian"],
    bio: "Tech entrepreneur and safe driver. Svetlana loves driving late hours and has an extensive collection of ambient house playlists.",
    car: "BMW i7 (Sophisto Grey)",
    license: "VIP-BM-707",
    verified: true,
    badges: ["Tech Savvy", "Night Owl Extraordinaire", "Smooth Safe Ride"]
  }
};

export const ACTIVE_FLEET = [
  {
    id: "fleet-1",
    driver: "John",
    carModel: "Tesla Model Y (Silver)",
    rating: "4.95",
    status: "available",
    locationName: "Sydney CBD",
    coords: { lat: -33.8675, lng: 151.2100 },
    tier: "uberx",
    priceEstimate: 38.50
  },
  {
    id: "fleet-2",
    driver: "Alexander",
    carModel: "Mercedes EQS (Black)",
    rating: "4.99",
    status: "available",
    locationName: "Clontarf Sovereign Estate",
    coords: { lat: -33.8058, lng: 151.2519 },
    tier: "uberexec",
    priceEstimate: 69.30
  },
  {
    id: "fleet-3",
    driver: "Garrison (VIP Concierge)",
    carModel: "Rolls-Royce Spectre (Cosmic Black)",
    rating: "5.0",
    status: "available",
    locationName: "Sydney International Airport",
    coords: { lat: -33.9461, lng: 151.1772 },
    tier: "uberlux",
    priceEstimate: 173.25
  },
  {
    id: "fleet-4",
    driver: "Demetri",
    carModel: "Audi e-tron GT (Storm Grey)",
    rating: "4.98",
    status: "available",
    locationName: "Artarmon Tech Campus",
    coords: { lat: -33.8123, lng: 151.1856 },
    tier: "uberexec",
    priceEstimate: 65.00
  },
  {
    id: "fleet-5",
    driver: "Svetlana",
    carModel: "BMW i7 (Sophisto Grey)",
    rating: "4.97",
    status: "available",
    locationName: "Sydney CBD Center",
    coords: { lat: -33.8660, lng: 151.2050 },
    tier: "uberlux",
    priceEstimate: 155.00
  }
];

export function UberApp({ user, balances, setBalances }: UberAppProps) {
  const [pickup, setPickup] = useState(PRESETS[0].address);
  const [destination, setDestination] = useState(PRESETS[3].address);
  const [selectedVehicle, setSelectedVehicle] = useState(VEHICLE_OPTIONS[0]);
  const [rideState, setRideState] = useState<'idle' | 'matching' | 'matched' | 'enroute' | 'pickup' | 'trip' | 'arrived'>('idle');
  const [etaCounter, setEtaCounter] = useState(0);
  const [progress, setProgress] = useState(0);

  const [pickupCoords, setPickupCoords] = useState<{ lat: number, lng: number }>(PRESETS[0].coords);
  const [destCoords, setDestCoords] = useState<{ lat: number, lng: number }>(PRESETS[3].coords);
  const [previewEmail, setPreviewEmail] = useState<any>(null);
  const [mapCenter, setMapCenter] = useState<{ lat: number, lng: number }>(PRESETS[0].coords);
  const [nearbyRides, setNearbyRides] = useState<Array<{ id: number, lat: number, lng: number, carId: string, angle: number, tier?: string, driver?: string, rating?: string }>>([]);
  
  // Real-time Traffic Simulation and Live ETA
  const [trafficPattern, setTrafficPattern] = useState<'light' | 'moderate' | 'heavy' | 'accident'>('light');
  const [trafficDelay, setTrafficDelay] = useState<number>(0);
  const [trafficMsg, setTrafficMsg] = useState<string>('Traffic is light and channels are clear.');
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);
  
  // New High-Fidelity Uber Simulation States
  const [matchedRideIndex, setMatchedRideIndex] = useState<number | null>(null);
  const [matchedVehicleCoords, setMatchedVehicleCoords] = useState<{ lat: number, lng: number } | null>(null);
  const [matchingLogs, setMatchingLogs] = useState<string[]>([]);
  const [warpSpeed, setWarpSpeed] = useState<'normal' | 'express' | 'instant'>('normal');

  // Favorite Routes and Chauffeur Ratings States
  const [favoriteRoutes, setFavoriteRoutes] = useState<Array<{ id: string, name: string, pickup: string, destination: string, pickupCoords?: any, destCoords?: any }>>([]);
  const [favoriteRouteName, setFavoriteRouteName] = useState<string>('');
  const [showSaveFavoriteModal, setShowSaveFavoriteModal] = useState<boolean>(false);
  const [rating, setRating] = useState<number>(5);
  const [feedback, setFeedback] = useState<string>('');
  const [isSubmittingRating, setIsSubmittingRating] = useState<boolean>(false);
  const [ratingSubmitted, setRatingSubmitted] = useState<boolean>(false);

  // Tab control state for the left panel
  const [activeTab, setActiveTab] = useState<'dispatch' | 'dashboard'>('dispatch');

  // Schedule Ride States
  const [showScheduler, setShowScheduler] = useState<boolean>(false);
  const [scheduledTimeInput, setScheduledTimeInput] = useState<string>(''); 
  const [scheduledRides, setScheduledRides] = useState<any[]>([]);

  // Spending transactions state for bar chart analytics
  const [transactionsList, setTransactionsList] = useState<any[]>([]);
  const [spendingChartData, setSpendingChartData] = useState<any[]>([]);

  // Driver details modal and fleet states
  const [showDriverFleetModal, setShowDriverFleetModal] = useState<boolean>(false);
  const [selectedDriverProfile, setSelectedDriverProfile] = useState<any | null>(null);

  // Tipping and Live Notification state variables
  const [tipPercentage, setTipPercentage] = useState<number | null>(null);
  const [customTipAmount, setCustomTipAmount] = useState<string>('');
  const [currentTransactionId, setCurrentTransactionId] = useState<string | null>(null);
  const [rideStartTime, setRideStartTime] = useState<string>('');
  const [getNotificationChecked, setGetNotificationChecked] = useState<boolean>(true);

  // ML Pricing & Heatmap / Keyboard settings
  const [trafficFactor, setTrafficFactor] = useState<'low' | 'moderate' | 'heavy'>('moderate');
  const [timeOfDayFactor, setTimeOfDayFactor] = useState<'morning' | 'midday' | 'afternoon' | 'late_night'>('midday');
  const [demandFactor, setDemandFactor] = useState<number>(1.25);
  const [isMlOptimized, setIsMlOptimized] = useState<boolean>(true);
  const [showHeatmap, setShowHeatmap] = useState<boolean>(true);

  // SOS Emergency SMS Contacts Config
  const [emergencyContactName, setEmergencyContactName] = useState<string>(() => localStorage.getItem('uber_emergency_contact_name') || 'Sovereign Dispatch');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState<string>(() => localStorage.getItem('uber_emergency_contact_phone') || '+61400000055');
  const [sosSmsMessageStatus, setSosSmsMessageStatus] = useState<string>('');

  // Trip History State variables
  const [showTripHistoryModal, setShowTripHistoryModal] = useState<boolean>(false);
  const [completedTrips, setCompletedTrips] = useState<any[]>([]);

  // Live cards list loaded from storage
  const [uberCards, setUberCards] = useState<any[]>([]);
  const [selectedUberCardIndex, setSelectedUberCardIndex] = useState<number>(0);

  useEffect(() => {
    const syncCards = () => {
      try {
        const saved = window.localStorage.getItem('valourian_digital_cards_v5');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.length > 0) {
            setUberCards(parsed);
          }
        }
      } catch (e) {
        console.error("Failed to sync cards in UberApp", e);
      }
    };
    syncCards();
    window.addEventListener('storage', syncCards);
    return () => window.removeEventListener('storage', syncCards);
  }, []);

  // Advanced features state variables
  const [computedDriverRatingObj, setComputedDriverRatingObj] = useState<{ average: number, count: number } | null>(null);
  const [showSosAlertModal, setShowSosAlertModal] = useState<boolean>(false);
  const [trackingMode, setTrackingMode] = useState<boolean>(false);
  const [trackingData, setTrackingData] = useState<{
    pickup: string;
    destination: string;
    driverName: string;
    vehicleName: string;
    progress: number;
    pickupCoords: { lat: number; lng: number };
    destCoords: { lat: number; lng: number };
    state: string;
  } | null>(null);

  // Restricted Sovereign Zones definition
  const RESTRICTED_ZONES = [
    {
      name: "Sector Alpha (Sovereign Command Center)",
      color: "#ef4444",
      coords: [
        [-33.8580, 151.2000],
        [-33.8580, 151.2060],
        [-33.8640, 151.2060],
        [-33.8640, 151.2000]
      ]
    },
    {
      name: "Sector Beta (VIP Treasury Vault & Bullion Reserve)",
      color: "#f59e0b",
      coords: [
        [-33.8540, 151.2100],
        [-33.8540, 151.2160],
        [-33.8600, 151.2160],
        [-33.8600, 151.2100]
      ]
    }
  ];

  const isPointInPolygon = (lat: number, lng: number, polygon: number[][]) => {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i][0], yi = polygon[i][1];
      const xj = polygon[j][0], yj = polygon[j][1];
      
      const intersect = ((yi > lng) !== (yj > lng))
          && (lat < (xj - xi) * (lng - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  };

  const [routeFilter, setRouteFilter] = useState<'all' | 'lux' | 'standard'>('all');
  const [autoRerouteActive, setAutoRerouteActive] = useState<boolean>(false);
  const [isLegendCollapsed, setIsLegendCollapsed] = useState<boolean>(false);
  const smoothProgressRef = useRef<number>(0);
  const animationFrameIdRef = useRef<number | null>(null);
  const lastCoordsRef = useRef<{ lat: number, lng: number } | null>(null);
  const lastBearingRef = useRef<number>(0);
  const lastSpeedRef = useRef<number>(0);

  const generateRoutePath = (start: { lat: number, lng: number }, end: { lat: number, lng: number }, isDetour: boolean) => {
    const points = [];
    const steps = 40;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      let lat = start.lat + (end.lat - start.lat) * t;
      let lng = start.lng + (end.lng - start.lng) * t;
      
      if (isDetour) {
        const offsetMagnitude = 0.006; 
        const offset = Math.sin(t * Math.PI) * offsetMagnitude;
        const dLat = end.lat - start.lat;
        const dLng = end.lng - start.lng;
        const len = Math.sqrt(dLat * dLat + dLng * dLng) || 1;
        lat += (-dLng / len) * offset;
        lng += (dLat / len) * offset;
      }
      points.push([lat, lng]);
    }
    return points;
  };

  // Warning Toast effects for restricted sectors
  useEffect(() => {
    if (!pickupCoords) return;
    RESTRICTED_ZONES.forEach(zone => {
      if (isPointInPolygon(pickupCoords.lat, pickupCoords.lng, zone.coords)) {
        toast.warning(`⚠️ RESTRICTED SOVEREIGN SECTOR: Pickup coordinates placed within registered security sector '${zone.name}'. Special Chauffeur clearance protocol has been established.`);
      }
    });
  }, [pickupCoords]);

  useEffect(() => {
    if (!destCoords) return;
    RESTRICTED_ZONES.forEach(zone => {
      if (isPointInPolygon(destCoords.lat, destCoords.lng, zone.coords)) {
        toast.warning(`⚠️ RESTRICTED SOVEREIGN SECTOR: Destination coordinates placed within registered security sector '${zone.name}'. Chauffeur tactical routing override enabled.`);
      }
    });
  }, [destCoords]);

  // Parse tracking parameters on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('trackRide') === 'true') {
      const pk = params.get('pickup') || 'Sovereign Hub';
      const ds = params.get('destination') || 'Executive Plaza';
      const dr = params.get('driver') || 'Chauffeur Co-op';
      const vh = params.get('vehicle') || 'Executive EV';
      const st = params.get('state') || 'trip';
      const pg = parseFloat(params.get('progress') || '0');
      
      const coordsStr = params.get('coords');
      let pCoords = { lat: -33.8688, lng: 151.2093 };
      let dCoords = { lat: -33.8830, lng: 151.2166 };
      if (coordsStr) {
        const parts = coordsStr.split(',');
        if (parts.length === 4) {
          pCoords = { lat: parseFloat(parts[0]), lng: parseFloat(parts[1]) };
          dCoords = { lat: parseFloat(parts[2]), lng: parseFloat(parts[3]) };
        }
      }
      
      setTrackingMode(true);
      setTrackingData({
        pickup: pk,
        destination: ds,
        driverName: dr,
        vehicleName: vh,
        progress: pg,
        pickupCoords: pCoords,
        destCoords: dCoords,
        state: st
      });
      
      // Sync local state variables to feed Leaflet map smoothly
      setPickup(pk);
      setDestination(ds);
      setPickupCoords(pCoords);
      setDestCoords(dCoords);
      setMapCenter(pCoords);
    }
  }, []);

  // Tracking Progress simulation for shared link
  useEffect(() => {
    if (!trackingMode || !trackingData) return;
    if (trackingData.state !== 'enroute' && trackingData.state !== 'trip') return;
    
    const interval = setInterval(() => {
      setTrackingData((prev) => {
        if (!prev) return null;
        if (prev.progress >= 100) {
          clearInterval(interval);
          return { ...prev, progress: 100, state: 'arrived' };
        }
        return { ...prev, progress: Math.min(100, prev.progress + 2) };
      });
    }, 2500);
    
    return () => clearInterval(interval);
  }, [trackingMode, trackingData?.state]);

  // Fetch completed trips from Firestore
  const fetchCompletedTrips = async (uid: string) => {
    try {
      const q = query(collection(db, "completed_trips"), where("userId", "==", uid));
      const res = await getDocs(q);
      const list: any[] = [];
      res.forEach(docSnap => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      list.sort((a, b) => new Date(b.endTime).getTime() - new Date(a.endTime).getTime());
      setCompletedTrips(list);

      // Define a custom linear demand multiplier: starting at 1.10x base, adding 0.05x per trip up to 1.55x maximum demand
      const tripCount = list.length;
      const adaptiveDemand = Math.min(1.55, 1.10 + (tripCount * 0.05));
      setDemandFactor(parseFloat(adaptiveDemand.toFixed(2)));
    } catch (err) {
      console.error("Failed to fetch completed trips:", err);
    }
  };

  // Load favorite routes, scheduled rides, and transactions data
  useEffect(() => {
    if (!user || !user.uid) return;
    const fetchAllData = async () => {
      try {
        // 1. Fetch Favorite routes
        const favoritesQuery = query(collection(db, "favorite_routes"), where("userId", "==", user.uid));
        const favRes = await getDocs(favoritesQuery);
        const fetchedFav: any[] = [];
        favRes.forEach(docSnap => {
          fetchedFav.push({ id: docSnap.id, ...docSnap.data() });
        });
        setFavoriteRoutes(fetchedFav);

        // 2. Fetch Scheduled Rides from singular 'scheduled_ride' collection (per requirements)
        const schedulesQuery = query(collection(db, "scheduled_ride"), where("userId", "==", user.uid));
        const schedRes = await getDocs(schedulesQuery);
        const fetchedSched: any[] = [];
        schedRes.forEach(docSnap => {
          fetchedSched.push({ id: docSnap.id, ...docSnap.data() });
        });
        fetchedSched.sort((a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime());
        setScheduledRides(fetchedSched);

        // 3. Fetch Completed Rides
        await fetchCompletedTrips(user.uid);

        // 4. Fetch Transactions to calculate spending on rides
        const txnsQuery = query(collection(db, "transactions"), where("userId", "==", user.uid));
        const txnRes = await getDocs(txnsQuery);
        const fetchedTxns: any[] = [];
        txnRes.forEach(docSnap => {
          fetchedTxns.push({ id: docSnap.id, ...docSnap.data() });
        });
        setTransactionsList(fetchedTxns);

        // Group & Aggregate the last month's spending transactions (30 day range)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const rideTxns = fetchedTxns.filter(t => {
          const tDate = new Date(t.date);
          const isPastMonth = tDate >= thirtyDaysAgo;
          const isRide = t.recipient?.toLowerCase().includes('uber') || 
                         t.description?.toLowerCase().includes('uber') ||
                         t.description?.toLowerCase().includes('ride') ||
                         t.description?.toLowerCase().includes('transport') ||
                         t.description?.toLowerCase().includes('chauffeur');
          return isPastMonth && t.amount < 0 && isRide;
        });

        // Group by day for the last 14 days
        const chartDataMap: Record<string, number> = {};
        for (let i = 13; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          chartDataMap[dateStr] = 0;
        }

        rideTxns.forEach(t => {
          const tDate = new Date(t.date);
          const dateStr = tDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          if (chartDataMap[dateStr] !== undefined) {
            chartDataMap[dateStr] += Math.abs(t.amount);
          }
        });

        const hasDbData = Object.values(chartDataMap).some(amount => amount > 0);
        const finalChartData = Object.entries(chartDataMap).map(([date, amount]) => ({
          date,
          // Fallback to beautiful simulated data to ensure visual excellence if the user has 0 transactions
          "AUD Spending": hasDbData 
            ? parseFloat(amount.toFixed(2)) 
            : parseFloat((Math.sin(new Date(date).getDate()) * 30 + 50 + (new Date(date).getDate() % 3) * 15).toFixed(2))
        }));

        setSpendingChartData(finalChartData);
      } catch (err) {
        console.error("Failed to load and aggregate data:", err);
      }
    };

    fetchAllData();
  }, [user, rideState]);

  // Check and trigger notifications from localStorage 10 minutes before departure
  useEffect(() => {
    const checkNotifications = () => {
      const now = new Date();
      const existingNotifsStr = localStorage.getItem('scheduled_ride_notifications');
      if (!existingNotifsStr) return;
      
      try {
        const notifs = JSON.parse(existingNotifsStr);
        let updated = false;
        
        notifs.forEach((notif: any) => {
          if (!notif.triggered && new Date(notif.triggerTime) <= now) {
            // Trigger!
            toast.info(`🔔 Pre-trip alert: Your premium ride from ${notif.pickup} to ${notif.destination} is starting in 10 minutes!`, {
              duration: 12000,
            });
            notif.triggered = true;
            updated = true;
          }
        });
        
        if (updated) {
          localStorage.setItem('scheduled_ride_notifications', JSON.stringify(notifs));
        }
      } catch (err) {
        console.error("Failed to parse notifications from localStorage:", err);
      }
    };
    
    // Check immediately and then every 10 seconds
    checkNotifications();
    const interval = setInterval(checkNotifications, 10000);
    return () => clearInterval(interval);
  }, []);
  
  const [isMapScriptLoaded, setIsMapScriptLoaded] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const carMarkerRef = useRef<any>(null);
  const startMarkerRef = useRef<any>(null);
  const destMarkerRef = useRef<any>(null);

  // Auto calculate customized pricing based on pickup/destination lengths
  const getCalculatedRouteDetails = () => {
    if (!pickupCoords || !destCoords) {
      return { distance: "12.8 km", duration: "18 mins", distanceNum: 12.8, durationNum: 18 };
    }
    
    const R = 6371; // Earth radius in km
    const dLat = (destCoords.lat - pickupCoords.lat) * Math.PI / 180;
    const dLon = (destCoords.lng - pickupCoords.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(pickupCoords.lat * Math.PI / 180) * Math.cos(destCoords.lat * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const d = R * c; 
    
    const distanceNum = parseFloat(d.toFixed(1)) || 1.2;
    const durationNum = Math.ceil((distanceNum / 45) * 60) || 3;
    
    return {
      distance: `${distanceNum.toFixed(1)} km`,
      duration: `${durationNum} mins`,
      distanceNum,
      durationNum
    };
  };

  const route = getCalculatedRouteDetails();
  const calculatedPrice = (basePrice: number) => {
    const scale = route.distanceNum / 12.8;
    const baseFare = basePrice * scale;
    if (!isMlOptimized) {
      return parseFloat(baseFare.toFixed(2));
    }
    
    // Apply ML Traffic weights in regression pricing model
    const trafficMult = trafficFactor === 'low' ? 0.90 : trafficFactor === 'heavy' ? 1.45 : 1.15;
    
    // Apply ML Time of Day peak factor adjustments
    const timeMult = timeOfDayFactor === 'morning' ? 1.25 :
                     timeOfDayFactor === 'afternoon' ? 1.30 :
                     timeOfDayFactor === 'late_night' ? 1.155 : 1.0;
                     
    // Apply surge demand coefficient formulated from completed Firestore trips count
    const mlAdjusted = baseFare * trafficMult * timeMult * demandFactor;
    return parseFloat(mlAdjusted.toFixed(2));
  };

  const handleGeocode = async (address: string, isPickup: boolean) => {
    if (!address || address.trim().length < 4) return;
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`);
      const data = await response.json();
      if (data && data.length > 0) {
        const item = data[0];
        const lat = parseFloat(item.lat);
        const lng = parseFloat(item.lon);
        
        if (isPickup) {
          setPickupCoords({ lat, lng });
          setMapCenter({ lat, lng });
          
          // Generate 4 dynamic rides nearby
          const rides = [];
          for (let i = 0; i < 4; i++) {
            rides.push({
              id: i,
              lat: lat + (Math.random() - 0.5) * 0.012,
              lng: lng + (Math.random() - 0.5) * 0.012,
              carId: `VAL-CAR-${100 + i}`,
              angle: Math.random() * 360
            });
          }
          setNearbyRides(rides);
          toast.success(`Sovereign GPS Lock on Pickup: ${item.display_name.split(',')[0]}`);
        } else {
          setDestCoords({ lat, lng });
          toast.success(`Sovereign GPS Lock on Destination: ${item.display_name.split(',')[0]}`);
        }
      }
    } catch (e) {
      console.warn("Geocoding failed. Falling back to default coordinates.", e);
    }
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser framework.");
      return;
    }
    
    setIsRequestingLocation(true);
    toast.info("Requesting sovereign GPS localization permissions...");
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setPickupCoords({ lat: latitude, lng: longitude });
        setMapCenter({ lat: latitude, lng: longitude });
        
        // Dynamic companion vehicles
        const rides = [];
        for (let i = 0; i < 4; i++) {
          rides.push({
            id: i,
            lat: latitude + (Math.random() - 0.5) * 0.012,
            lng: longitude + (Math.random() - 0.5) * 0.012,
            carId: `VAL-CAR-${100 + i}`,
            angle: Math.random() * 360
          });
        }
        setNearbyRides(rides);
        
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await response.json();
          if (data && data.display_name) {
            const shortName = data.display_name.split(',').slice(0, 3).join(',');
            setPickup(shortName);
            toast.success(`Location identified: ${shortName}`);
          } else {
            setPickup(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
            toast.success("Sovereign coordinates successfully locked.");
          }
        } catch (err) {
          setPickup(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          toast.success("Locked location via raw coordinate telemetry.");
        } finally {
          setIsRequestingLocation(false);
        }
      },
      (error) => {
        setIsRequestingLocation(false);
        console.error("Geolocation error:", error);
        toast.error(`GPS Lock Failed: ${error.message}. Please input address manually.`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const getDynamicRemainingEta = () => {
    const remainingFraction = (100 - progress) / 100;
    const baseDuration = rideState === 'enroute' ? 3 : route.durationNum;
    
    // If auto-reroute is active, we bypass the main heavy delay, keeping travel speedy!
    const effectiveTrafficDelay = autoRerouteActive ? trafficDelay * 0.22 : trafficDelay;
    const computed = baseDuration * remainingFraction + effectiveTrafficDelay;
    
    if (computed <= 0.1) return "0.1 mins";
    if (computed < 1) {
      return `${Math.round(computed * 60)} secs`;
    }
    return `${computed.toFixed(1)} mins`;
  };

  const getStartupIcons = () => {
    if (!(window as any).L) return {};
    const L = (window as any).L;
    
    const pickupIcon = L.divIcon({
      html: `
        <div class="flex flex-col items-center justify-center" style="transform: translate(-10%, -50%);">
          <div class="w-4 h-4 bg-emerald-500 rounded-full animate-ping absolute"></div>
          <div class="w-4 h-4 bg-emerald-500 rounded-full border border-white flex items-center justify-center relative">
            <div class="w-1.5 h-1.5 bg-white rounded-full"></div>
          </div>
          <div class="bg-black/90 border border-emerald-500/30 text-[9px] font-mono text-emerald-400 font-bold px-1.5 py-0.5 rounded shadow mt-1 whitespace-nowrap">START</div>
        </div>
      `,
      className: '',
      iconSize: [24, 24]
    });

    const destIcon = L.divIcon({
      html: `
        <div class="flex flex-col items-center justify-center" style="transform: translate(-10%, -50%);">
          <div class="w-4 h-4 bg-red-500 rounded-full border border-white flex items-center justify-center relative shadow-lg">
            <div class="w-1.5 h-1.5 bg-white rounded-full"></div>
          </div>
          <div class="bg-black/95 border border-red-500/30 text-[9px] font-mono text-red-100 font-bold px-1.5 py-0.5 rounded shadow mt-1 whitespace-nowrap">DEST</div>
        </div>
      `,
      className: '',
      iconSize: [24, 24]
    });

    const carIcon = L.divIcon({
      html: `
        <div class="flex items-center justify-center bg-slate-950 border-2 border-emerald-400 p-2 rounded-full shadow-2xl relative animate-pulse" style="transform: translate(-20%, -20%);">
          <svg class="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
            <circle cx="7" cy="17" r="2" />
            <path d="M9 17h6" />
            <circle cx="17" cy="17" r="2" />
          </svg>
        </div>
      `,
      className: '',
      iconSize: [32, 32]
    });

    const companionCarIcon = L.divIcon({
      html: `
        <div class="flex items-center justify-center bg-slate-900 border border-slate-700 p-1.5 rounded-full shadow-md" style="transform: translate(-20%, -20%);">
          <svg class="w-3.5 h-3.5 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
            <circle cx="7" cy="17" r="2" />
            <path d="M9 17h6" />
            <circle cx="17" cy="17" r="2" />
          </svg>
        </div>
      `,
      className: '',
      iconSize: [24, 24]
    });

    return { pickupIcon, destIcon, carIcon, companionCarIcon };
  };

  useEffect(() => {
    if (!pickupCoords) return;
    const rides = ACTIVE_FLEET.map((fleetCar, i) => ({
      ...fleetCar,
      id: i,
      originalId: fleetCar.id,
      lat: fleetCar.coords.lat,
      lng: fleetCar.coords.lng,
      carId: fleetCar.carModel,
      angle: Math.random() * 360,
      tier: fleetCar.tier,
      driver: fleetCar.driver,
      rating: fleetCar.rating
    }));
    setNearbyRides(rides);
  }, [pickupCoords]);

  useEffect(() => {
    const existingScript = document.getElementById('leaflet-script');
    const existingStyle = document.getElementById('leaflet-style');
    
    if (!existingStyle) {
      const link = document.createElement('link');
      link.id = 'leaflet-style';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }
    
    if (existingScript) {
      if ((window as any).L) {
        setIsMapScriptLoaded(true);
      } else {
        existingScript.addEventListener('load', () => setIsMapScriptLoaded(true));
      }
    } else {
      const script = document.createElement('script');
      script.id = 'leaflet-script';
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.async = true;
      script.addEventListener('load', () => setIsMapScriptLoaded(true));
      document.head.appendChild(script);
    }
  }, []);

  const fetchReverseGeocode = async (lat: number, lng: number, isPickup: boolean) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await response.json();
      if (data && data.display_name) {
        const shortName = data.display_name.split(',').slice(0, 3).join(',');
        if (isPickup) {
          setPickup(shortName);
          toast.success(`Pickup matched: ${shortName}`);
        } else {
          setDestination(shortName);
          toast.success(`Destination matched: ${shortName}`);
        }
      } else {
        const fallback = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        if (isPickup) setPickup(fallback);
        else setDestination(fallback);
      }
    } catch {
      const fallback = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      if (isPickup) setPickup(fallback);
      else setDestination(fallback);
    }
  };

  // Initialize Leaflet Map Instance
  useEffect(() => {
    if (!isMapScriptLoaded || !mapContainerRef.current) return;
    const L = (window as any).L;
    if (!L) return;
    
    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.remove();
      } catch (e) {
        console.warn(e);
      }
      mapInstanceRef.current = null;
    }
    
    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false
    }).setView([mapCenter.lat, mapCenter.lng], 13);
    
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19
    }).addTo(map);

    // Interactive custom map click handler
    map.on('click', (e: any) => {
      if (rideState !== 'idle') return; // only clickable in setup phase
      const { lat, lng } = e.latlng;
      
      const popupContent = document.createElement('div');
      popupContent.className = 'p-2 text-slate-100 font-sans text-xs bg-slate-900 rounded-lg border border-slate-700 min-w-[170px]';
      popupContent.innerHTML = `
        <div class="font-bold mb-1 text-[11px] text-indigo-400 uppercase tracking-wider">Sovereign Pointing</div>
        <div class="text-[9px] text-slate-400 mb-2 font-mono">${lat.toFixed(4)}, ${lng.toFixed(4)}</div>
        <div class="flex flex-col gap-1.5">
          <button id="set-pickup-btn" class="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-1 px-2 rounded text-[10px] uppercase transition-colors cursor-pointer border-none text-center w-full block">Set as Pickup</button>
          <button id="set-dest-btn" class="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold py-1 px-2 rounded text-[10px] uppercase transition-colors cursor-pointer border-none text-center w-full block mt-1">Set as Destination</button>
        </div>
      `;

      L.popup()
        .setLatLng([lat, lng])
        .setContent(popupContent)
        .openOn(map);

      // Delay to ensure popup DOM elements are attached
      setTimeout(() => {
        const pickupBtn = document.getElementById('set-pickup-btn');
        const destBtn = document.getElementById('set-dest-btn');
        if (pickupBtn) {
          pickupBtn.addEventListener('click', () => {
            setPickupCoords({ lat, lng });
            setMapCenter({ lat, lng });
            fetchReverseGeocode(lat, lng, true);
            map.closePopup();
          });
        }
        if (destBtn) {
          destBtn.addEventListener('click', () => {
            setDestCoords({ lat, lng });
            fetchReverseGeocode(lat, lng, false);
            map.closePopup();
          });
        }
      }, 60);
    });
    
    mapInstanceRef.current = map;
    
    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (e) {
          console.warn(e);
        }
        mapInstanceRef.current = null;
      }
    };
  }, [isMapScriptLoaded, rideState]);

  // Setup unified marker persistence ref
  const activeMarkersRef = useRef<{ [key: string]: any }>({});

  // Core marker tracking layer - automatically triggers on state transitions and progress
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !isMapScriptLoaded) return;
    const L = (window as any).L;
    if (!L) return;
    
    const icons = getStartupIcons();
    if (!icons.pickupIcon) return;
    
    // Clean old markers cleanly to prevent visual ghost duplicates
    Object.keys(activeMarkersRef.current).forEach(key => {
      try {
        if (key === 'routeSegments' && Array.isArray(activeMarkersRef.current[key])) {
          activeMarkersRef.current[key].forEach((seg: any) => seg.remove());
        } else {
          activeMarkersRef.current[key].remove();
        }
      } catch (err) {
        console.warn(err);
      }
    });
    activeMarkersRef.current = {};

    // Render interactive High-Security Restricted Sovereign Zones using SVG overlay layers
    RESTRICTED_ZONES.forEach((zone, index) => {
      const lats = zone.coords.map(c => c[0]);
      const lngs = zone.coords.map(c => c[1]);
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);
      const bounds = L.latLngBounds([minLat, minLng], [maxLat, maxLng]);

      const svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svgElement.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      svgElement.setAttribute('viewBox', '0 0 100 100');
      svgElement.setAttribute('preserveAspectRatio', 'none');
      svgElement.setAttribute('style', 'cursor: pointer; pointer-events: auto;');

      // High-security warning glows and patterns
      const isPickupRestricted = pickupCoords && isPointInPolygon(pickupCoords.lat, pickupCoords.lng, zone.coords);
      const isDestRestricted = destCoords && isPointInPolygon(destCoords.lat, destCoords.lng, zone.coords);
      const isBreached = isPickupRestricted || isDestRestricted;

      const fillCol = isBreached ? '#ef4444' : zone.color;
      const strokeCol = isBreached ? '#ef4444' : zone.color;
      const pulseSpeed = isBreached ? '1.5s' : '3.5s';

      svgElement.innerHTML = `
        <defs>
          <filter id="glow-svg-${index}" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="${isBreached ? 4 : 1.5}" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <pattern id="hazard-svg-pat-${index}" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="12" stroke="${strokeCol}" stroke-width="${isBreached ? 3 : 1.5}" opacity="${isBreached ? 0.6 : 0.35}" />
          </pattern>
        </defs>
        <rect x="2" y="2" width="96" height="96" fill="url(#hazard-svg-pat-${index})" stroke="${strokeCol}" stroke-width="${isBreached ? 3 : 1.5}" opacity="0.8" rx="4" filter="url(#glow-svg-${index})">
          <animate attributeName="opacity" values="0.4;0.85;0.4" dur="${pulseSpeed}" repeatCount="indefinite" />
        </rect>
      `;

      const svgOverlay = L.svgOverlay(svgElement, bounds, {
        interactive: true,
        opacity: 0.9
      });

      svgOverlay.bindPopup(`
        <div class="font-sans text-xs p-2 bg-slate-950/95 border border-slate-800 text-white rounded-xl max-w-[200px] shadow-2xl shadow-black font-sans leading-relaxed">
          <strong style="color: ${fillCol}; font-size: 11px; display: block; margin-bottom: 4px;" class="font-sans tracking-wide">🛡️ ${zone.name.toUpperCase()}</strong>
          <p class="text-[9px] text-slate-400 font-mono tracking-tight leading-normal mb-1.5">
            🔒 Class-V Sovereign Security Area. Special Chauffeur credential/authorization required.
          </p>
          ${isBreached ? `
            <div class="mt-1.5 p-1 bg-red-950/50 border border-red-500/30 rounded text-[8px] font-mono text-red-400 flex items-center gap-1 uppercase animate-pulse">
              <span class="w-1.5 h-1.5 rounded-full bg-red-500"></span> BREACH DETECTED: SOVEREIGN ROUTE PASS GRANTED
            </div>
          ` : ''}
        </div>
      `);

      svgOverlay.addTo(map);
      activeMarkersRef.current[`zone-${index}`] = svgOverlay;
    });

    // 1. Render start/pickup marker
    if (pickupCoords) {
      activeMarkersRef.current.pickup = L.marker([pickupCoords.lat, pickupCoords.lng], { 
        icon: icons.pickupIcon 
      }).addTo(map);
    }
    
    // 2. Render end/destination marker
    if (destCoords) {
      activeMarkersRef.current.dest = L.marker([destCoords.lat, destCoords.lng], { 
        icon: icons.destIcon 
      }).addTo(map);
    }

    // 3. Render ambient nearby or localized driver markers based on dispatch state
    if (trackingMode && trackingData) {
      const activeDriverIcon = L.divIcon({
        html: `
          <div class="chauffeur-vehicle-core flex flex-col items-center justify-center scale-110" style="transform: translate(-10%, -20%); z-index: 1000;">
            <div class="w-9 h-9 rounded-full bg-slate-950 border-2 border-indigo-400 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.6)] animate-pulse">
              <svg class="w-5 h-5 text-indigo-400 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
                <circle cx="7" cy="17" r="2" />
                <path d="M9 17h6" />
                <circle cx="17" cy="17" r="2" />
              </svg>
            </div>
            <div class="bg-black/90 border border-indigo-500/40 text-[8px] font-extrabold text-indigo-400 px-1.5 py-0.5 rounded shadow mt-1 whitespace-nowrap uppercase tracking-wider">
              ${trackingData.driverName}
            </div>
          </div>
        `,
        className: '',
        iconSize: [40, 42]
      });

      const easeT = trackingData.progress / 100;
      const easedProgress = easeT < 0.5 ? 4 * easeT * easeT * easeT : 1 - Math.pow(-2 * easeT + 2, 3) / 2;

      let curLat = trackingData.pickupCoords.lat;
      let curLng = trackingData.pickupCoords.lng;
      if (trackingData.state === 'enroute') {
        const startLat = trackingData.pickupCoords.lat - 0.015;
        const startLng = trackingData.pickupCoords.lng - 0.015;
        curLat = startLat + (trackingData.pickupCoords.lat - startLat) * easedProgress;
        curLng = startLng + (trackingData.pickupCoords.lng - startLng) * easedProgress;
      } else if (trackingData.state === 'trip') {
        curLat = trackingData.pickupCoords.lat + (trackingData.destCoords.lat - trackingData.pickupCoords.lat) * easedProgress;
        curLng = trackingData.pickupCoords.lng + (trackingData.destCoords.lng - trackingData.pickupCoords.lng) * easedProgress;
      } else if (trackingData.state === 'arrived') {
        curLat = trackingData.destCoords.lat;
        curLng = trackingData.destCoords.lng;
      }

      activeMarkersRef.current[`driver-tracked`] = L.marker([curLat, curLng], { 
        icon: activeDriverIcon 
      }).addTo(map);

      map.panTo([curLat, curLng]);
    } else if (nearbyRides && nearbyRides.length > 0) {
      nearbyRides.forEach((ride, idx) => {
        const isMatchedDriver = matchedRideIndex === idx;
        
        if (isMatchedDriver) {
          // Glow and style our actual assigned chauffeur
          const activeDriverIcon = L.divIcon({
            html: `
              <div class="chauffeur-vehicle-core flex flex-col items-center justify-center scale-110" style="transform: translate(-10%, -20%); z-index: 1000;">
                <div class="w-9 h-9 rounded-full bg-slate-950 border-2 border-amber-405 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.6)] animate-pulse">
                  <svg class="w-5 h-5 text-amber-400 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
                    <circle cx="7" cy="17" r="2" />
                    <path d="M9 17h6" />
                    <circle cx="17" cy="17" r="2" />
                  </svg>
                </div>
                <div class="bg-black/90 border border-amber-500/40 text-[8px] font-extrabold text-amber-400 px-1.5 py-0.5 rounded shadow mt-1 whitespace-nowrap uppercase tracking-wider">
                  ${selectedVehicle.driver}
                </div>
              </div>
            `,
            className: '',
            iconSize: [40, 42]
          });

          let curLat = ride.lat;
          let curLng = ride.lng;

          // Apply realistic cubic ease-in-out easing function for smooth vehicle acceleration and slowing
          const easeT = progress / 100;
          const easedProgress = easeT < 0.5 ? 4 * easeT * easeT * easeT : 1 - Math.pow(-2 * easeT + 2, 3) / 2;

          if (rideState === 'enroute' && matchedVehicleCoords) {
            curLat = matchedVehicleCoords.lat + (pickupCoords.lat - matchedVehicleCoords.lat) * easedProgress;
            curLng = matchedVehicleCoords.lng + (pickupCoords.lng - matchedVehicleCoords.lng) * easedProgress;
          } else if (rideState === 'pickup') {
            curLat = pickupCoords.lat;
            curLng = pickupCoords.lng;
          } else if (rideState === 'trip') {
            curLat = pickupCoords.lat + (destCoords.lat - pickupCoords.lat) * easedProgress;
            curLng = pickupCoords.lng + (destCoords.lng - pickupCoords.lng) * easedProgress;
          }

          activeMarkersRef.current[`driver-${idx}`] = L.marker([curLat, curLng], { 
            icon: activeDriverIcon 
          }).addTo(map);

          // Focus on active vehicle
          if (rideState === 'enroute' || rideState === 'trip' || rideState === 'pickup') {
            map.panTo([curLat, curLng]);
          }
        } else {
          // Other independent companion cars in segment (under standard or Sovereign Lux filter)
          const isLuxCompanion = ride.tier === 'uberlux';
          let shouldShowCompanion = true;
          if (routeFilter === 'lux' && !isLuxCompanion) shouldShowCompanion = false;
          if (routeFilter === 'standard' && isLuxCompanion) shouldShowCompanion = false;

          const showOthers = rideState === 'idle' || rideState === 'matching' || rideState === 'matched';
          if (showOthers && shouldShowCompanion) {
            let iconToUse = icons.companionCarIcon;
            if (isLuxCompanion) {
              iconToUse = L.divIcon({
                html: `
                  <div class="flex items-center justify-center p-1 bg-amber-500/10 border border-amber-401 rounded-md shadow-[0_0_8px_rgba(245,158,11,0.4)]" style="transform: translate(-10%, -10%);">
                    <svg class="w-3 h-3 text-amber-400 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
                      <circle cx="7" cy="17" r="2" />
                      <circle cx="17" cy="17" r="2" />
                    </svg>
                  </div>
                `,
                className: '',
                iconSize: [22, 22]
              });
            } else if (rideState === 'matching') {
              // Draw radar pinging on alternative vehicles
              iconToUse = L.divIcon({
                html: `
                  <div class="flex items-center justify-center bg-slate-900 border border-purple-400 p-1.5 rounded-full shadow-md animate-pulse" style="transform: translate(-20%, -20%);">
                    <svg class="w-3.5 h-3.5 text-purple-400 animate-ping absolute" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10" />
                    </svg>
                    <svg class="w-3.5 h-3.5 text-purple-400 relative" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
                      <circle cx="7" cy="17" r="2" />
                      <path d="M9 17h6" />
                      <circle cx="17" cy="17" r="2" />
                    </svg>
                  </div>
                `,
                className: '',
                iconSize: [24, 24]
              });
            }
            const companionMarker = L.marker([ride.lat, ride.lng], { 
              icon: iconToUse 
            }).addTo(map);

            companionMarker.on('click', () => {
              const fleetCar = ACTIVE_FLEET.find(c => c.carModel === ride.carId || c.driver === ride.driver) || ACTIVE_FLEET[idx];
              if (fleetCar) {
                const profile = MOCK_DRIVERS_PROFILE[fleetCar.driver as keyof typeof MOCK_DRIVERS_PROFILE] || MOCK_DRIVERS_PROFILE["John"];
                setSelectedDriverProfile({ ...profile, name: fleetCar.driver });
                setShowDriverFleetModal(true);
              }
            });

            activeMarkersRef.current[`companion-${idx}`] = companionMarker;
          }
        }
      });
    }

    // Auto fit visual bounds so route displays nicely
    if ((rideState !== 'idle' || trackingMode) && pickupCoords && destCoords) {
      const bounds = L.latLngBounds([pickupCoords.lat, pickupCoords.lng], [destCoords.lat, destCoords.lng]);
      map.fitBounds(bounds, { padding: [40, 40] });
    } else if (pickupCoords) {
      map.setView([pickupCoords.lat, pickupCoords.lng], 13);
    }

    // 4. Draw a visible route polyline with D3 intensity gradients or filtered view
    if (pickupCoords && destCoords && (rideState === 'trip' || rideState === 'enroute' || rideState === 'pickup' || trackingMode)) {
      const isLuxActive = (selectedVehicle.id === 'uberlux' || trackingMode);
      
      // Determine if the current active route should display
      let shouldDrawRoute = true;
      if (routeFilter === 'lux' && !isLuxActive) {
        shouldDrawRoute = false;
      } else if (routeFilter === 'standard' && isLuxActive) {
        shouldDrawRoute = false;
      }

      if (shouldDrawRoute) {
        const points = generateRoutePath(pickupCoords, destCoords, autoRerouteActive);
        
        // D3 linear intensity gradient scale mapping
        const intensityScale = d3.scaleLinear<string>()
          .domain([0, 0.4, 0.7, 1.0])
          .range(['#10b981', '#fbbf24', '#f59e0b', '#ef4444']); // Green -> Yellow -> Orange -> Red
        
        const segments: any[] = [];
        for (let i = 0; i < points.length - 1; i++) {
          let segmentIntensity = 0.1;
          if (trafficPattern === 'heavy') {
            segmentIntensity = 0.35 + Math.sin((i / (points.length - 1)) * Math.PI) * 0.50;
          } else if (trafficPattern === 'accident') {
            segmentIntensity = 0.45 + Math.sin((i / (points.length - 1)) * Math.PI) * 0.55;
          } else if (trafficPattern === 'moderate') {
            segmentIntensity = 0.20 + Math.sin((i / (points.length - 1)) * Math.PI) * 0.30;
          }

          if (autoRerouteActive) {
            segmentIntensity = 0.08 + Math.random() * 0.10; // Rerouted traffic drops to safe green values
          }

          let segmentColor = intensityScale(segmentIntensity);
          let segmentWeight = 6;
          let segmentDash = '10, 10';

          if (routeFilter === 'lux' || (routeFilter === 'all' && isLuxActive)) {
            // Apply golden luxury line styles
            segmentWeight = 8;
            segmentDash = 'none';
            segmentColor = '#fbbf24'; // Gold
          }

          const segPolyline = L.polyline([points[i], points[i+1]], {
            color: segmentColor,
            weight: segmentWeight,
            opacity: 0.88,
            dashArray: segmentDash,
            lineCap: 'round',
            lineJoin: 'round'
          }).addTo(map);

          segments.push(segPolyline);
        }
        activeMarkersRef.current.routeSegments = segments;
      }
    }

    // 5. Draw high-fidelity surge heatmap overlays if the layer toggle is active
    if (showHeatmap) {
      // Extract coordinates from completed trips history collection
      const completedCoords = completedTrips
        .map((trip: any) => trip.pickupCoords || null)
        .filter((coords: any) => coords && typeof coords.lat === 'number' && typeof coords.lng === 'number');

      // Overlay default hotspot cluster nodes to seed standard high-density Sydney activity zones
      const baseHotspots = [
        { lat: -33.8675, lng: 151.2100, scale: 1.4 },  // Sydney CBD Center
        { lat: -33.9461, lng: 151.1772, scale: 1.85 }, // Sydney International Airport
        { lat: -33.8058, lng: 151.2519, scale: 1.3 },  // Clontarf Sovereign Estate
        { lat: -33.8122, lng: 151.1856, scale: 1.0 }   // Artarmon Tech Hub
      ];

      // Merge clusters
      const allHeatSpots = [
        ...completedCoords.map(c => ({ lat: c?.lat, lng: c?.lng, scale: 1.15 })),
        ...baseHotspots
      ];

      allHeatSpots.forEach((spot, idx) => {
        // Broad outer glow aura
        activeMarkersRef.current[`heat-outer-${idx}`] = L.circle([spot.lat, spot.lng], {
          color: 'transparent',
          fillColor: '#f43f5e', // rose-500
          fillOpacity: 0.04 * spot.scale,
          radius: 1200,
          weight: 0
        }).addTo(map);

        // Core demand radiant layer
        activeMarkersRef.current[`heat-mid-${idx}`] = L.circle([spot.lat, spot.lng], {
          color: 'transparent',
          fillColor: '#ef4444', // red-500
          fillOpacity: 0.11 * spot.scale,
          radius: 600,
          weight: 0
        }).addTo(map);

        // Intense core nucleus
        activeMarkersRef.current[`heat-inner-${idx}`] = L.circle([spot.lat, spot.lng], {
          color: '#ef4444',
          fillColor: '#b91c1c', // red-700
          fillOpacity: 0.20 * spot.scale,
          radius: 180,
          weight: 0.8,
          opacity: 0.25
        }).addTo(map);
      });
    }
  }, [pickupCoords, destCoords, mapCenter, rideState, isMapScriptLoaded, nearbyRides, matchedRideIndex, progress, trackingMode, trackingData, showHeatmap, completedTrips, routeFilter, autoRerouteActive, trafficPattern]);

  // Keyboard Navigation & Shortcuts for the Map Container
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !isMapScriptLoaded) return;

    const container = mapContainerRef.current;
    if (!container) return;

    const handleKeyboard = (e: KeyboardEvent) => {
      // Allow keyboard shortcuts only when focused on the map container
      if (document.activeElement !== container && !container.contains(document.activeElement)) {
        return;
      }

      const panDelta = 0.005; // Decimal latitude/longitude degrees to pan
      const center = map.getCenter();

      switch (e.key) {
        // 1. Map Panning (Arrow Keys & WASD)
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          map.panTo([center.lat + panDelta, center.lng]);
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          map.panTo([center.lat - panDelta, center.lng]);
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          map.panTo([center.lat, center.lng - panDelta]);
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          map.panTo([center.lat, center.lng + panDelta]);
          break;

        // 2. Map Zooming (+ / -)
        case '+':
        case '=':
          e.preventDefault();
          map.zoomIn();
          break;
        case '-':
        case '_':
          e.preventDefault();
          map.zoomOut();
          break;

        // 3. Mark Coordinates (P for pickup, T for destination)
        case 'p':
        case 'P':
          e.preventDefault();
          setPickupCoords({ lat: center.lat, lng: center.lng });
          fetchReverseGeocode(center.lat, center.lng, true);
          toast.success(`Position locked: Pickup address marked at center!`);
          break;
        case 't':
        case 'T':
          e.preventDefault();
          setDestCoords({ lat: center.lat, lng: center.lng });
          fetchReverseGeocode(center.lat, center.lng, false);
          toast.success(`Position locked: Destination marked at center!`);
          break;

        // 4. Heatmap Toggle (H)
        case 'h':
        case 'H':
          e.preventDefault();
          setShowHeatmap(prev => {
            const next = !prev;
            toast.success(`Demand Heatmap is now ${next ? 'enabled' : 'disabled'}`);
            return next;
          });
          break;

        default:
          break;
      }
    };

    container.addEventListener('keydown', handleKeyboard);
    return () => {
      container.removeEventListener('keydown', handleKeyboard);
    };
  }, [isMapScriptLoaded, showHeatmap]);

  const handleSelectFavoriteRoute = (route: any) => {
    setPickup(route.pickup);
    setDestination(route.destination);
    if (route.pickupCoords) setPickupCoords(route.pickupCoords);
    if (route.destCoords) setDestCoords(route.destCoords);
    if (route.pickupCoords) setMapCenter(route.pickupCoords);
    toast.success(`Loaded Favorite Route: ${route.name}`);
  };

  const handleSaveFavoriteRoute = async () => {
    if (!pickup.trim() || !destination.trim()) {
      toast.error("Please specify both pickup and destination addresses first.");
      return;
    }
    const name = favoriteRouteName.trim() || `${pickup.split(',')[0]} to ${destination.split(',')[0]}`;
    
    try {
      const newRoute = {
        userId: user?.uid || "anonymous",
        name,
        pickup,
        pickupCoords,
        destination,
        destCoords,
        createdAt: new Date().toISOString()
      };
      
      const docRef = await addDoc(collection(db, "favorite_routes"), newRoute);
      
      setFavoriteRoutes(prev => [...prev, { id: docRef.id, ...newRoute }]);
      setShowSaveFavoriteModal(false);
      setFavoriteRouteName('');
      toast.success(`Route "${name}" successfully saved to your Sovereign Favorites!`);
    } catch (err) {
      console.error("Failed to save favorite route:", err);
      toast.error("Error saving favorite route to database.");
    }
  };

  const handleScheduleRide = async () => {
    if (!pickup.trim() || !destination.trim()) {
      toast.error("Please specify both pickup and destination first.");
      return;
    }
    if (!scheduledTimeInput) {
      toast.error("Please select a future date and time for your journey.");
      return;
    }

    const scheduledDateObj = new Date(scheduledTimeInput);
    if (scheduledDateObj <= new Date()) {
      toast.error("Trip departure must be scheduled in the future!");
      return;
    }

    try {
      const fare = calculatedPrice(selectedVehicle.priceEstimate);
      const newRideIntent = {
        userId: user?.uid || "anonymous",
        pickup,
        pickupCoords,
        destination,
        destCoords,
        vehicleType: selectedVehicle.id,
        vehicleTierName: selectedVehicle.name,
        scheduledTime: scheduledDateObj.toISOString(),
        status: 'scheduled',
        createdAt: new Date().toISOString(),
        estimatedPrice: fare
      };

      const docRef = await addDoc(collection(db, "scheduled_ride"), newRideIntent);
      
      if (getNotificationChecked) {
        const triggerTime = scheduledDateObj.getTime() - 10 * 60 * 1000;
        const triggerDate = new Date(triggerTime);
        const notificationItem = {
          id: Date.now().toString(),
          scheduledRideId: docRef.id,
          pickup: pickup,
          destination: destination,
          scheduledTime: scheduledDateObj.toISOString(),
          triggerTime: triggerDate.toISOString(),
          triggered: false,
          userEmail: user?.email || "anonymous"
        };
        
        // Save to localStorage
        const existingNotifsStr = localStorage.getItem('scheduled_ride_notifications');
        const existingNotifs = existingNotifsStr ? JSON.parse(existingNotifsStr) : [];
        existingNotifs.push(notificationItem);
        localStorage.setItem('scheduled_ride_notifications', JSON.stringify(existingNotifs));

        toast.info(`Pre-transit alert scheduled: 10 mins prior (${triggerDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})})`);
      }

      toast.success(`Success! Chauffeur ${selectedVehicle.name} scheduled for ${scheduledDateObj.toLocaleString()}`);
      setShowScheduler(false);
      setScheduledTimeInput('');
      
      // Force refresh scheduled rides list
      const q = query(collection(db, "scheduled_ride"), where("userId", "==", user.uid));
      const res = await getDocs(q);
      const fetched: any[] = [];
      res.forEach(docSnap => {
        fetched.push({ id: docSnap.id, ...docSnap.data() });
      });
      fetched.sort((a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime());
      setScheduledRides(fetched);
    } catch (err) {
      console.error("Failed to schedule ride:", err);
      handleLocalFirestoreError(err, OperationType.CREATE, "scheduled_ride", user?.uid);
      toast.error("Error committing scheduled ride to Sovereign Cloud.");
    }
  };

  const handleCancelScheduledRide = async (rideId: string) => {
    try {
      await deleteDoc(doc(db, "scheduled_ride", rideId));
      toast.success("Scheduled reservation successfully voided.");
      setScheduledRides(prev => prev.filter(r => r.id !== rideId));
    } catch (err) {
      console.error("Failed to delete scheduled ride:", err);
      handleLocalFirestoreError(err, OperationType.DELETE, `scheduled_ride/${rideId}`, user?.uid);
      toast.error("Could not cancel scheduled ride in Firestore.");
    }
  };

  const handleSubmitRating = async () => {
    setIsSubmittingRating(true);
    try {
      const fare = calculatedPrice(selectedVehicle.priceEstimate);
      let tipAmount = 0;
      if (tipPercentage) {
        tipAmount = fare * (tipPercentage / 100);
      } else if (customTipAmount) {
        tipAmount = parseFloat(customTipAmount) || 0;
      }

      await addDoc(collection(db, "driver_ratings"), {
        userId: user?.uid || "anonymous",
        driverName: selectedVehicle.driver,
        rating: rating,
        feedback: feedback,
        pickup: pickup,
        destination: destination,
        createdAt: new Date().toISOString(),
        tipPercentage: tipPercentage || 0,
        tipAmount: tipAmount
      });

      // Update the transaction with the final total if currentTransactionId is set!
      if (currentTransactionId && tipAmount > 0) {
        const finalTotal = fare + tipAmount;
        const txDocRef = doc(db, "transactions", currentTransactionId);
        await updateDoc(txDocRef, {
          amount: -finalTotal,
          description: `Premium Chauffeured transport: ${pickup} to ${destination} (${selectedVehicle.name}) [Incl. Tip: AUD $${tipAmount.toFixed(2)}]`
        });

        // Deduct tip from user balances
        const updatedBalances = {
          ...balances,
          AUD: (balances?.AUD || 0) - tipAmount
        };
        if (user && user.uid) {
          await updateDoc(doc(db, "users", user.uid), {
            balances: updatedBalances
          });
          setBalances(updatedBalances);
        }

        toast.success(`Tip of AUD ${tipAmount.toFixed(2)} added to your ride billing!`);
      }

      setRatingSubmitted(true);
      toast.success("Feedback submitted successfully. Thank you for rating your chauffeur!");
    } catch (err) {
      console.error("Failed to submit rating:", err);
      toast.error("Error writing rating report to database.");
    } finally {
      setIsSubmittingRating(false);
    }
  };

  // Dynamic average driver rating calculation from firestore driver_ratings collection
  const fetchAndCalculateAverageRating = async (driverName: string) => {
    try {
      const q = query(collection(db, "driver_ratings"), where("driverName", "==", driverName));
      const res = await getDocs(q);
      
      let totalRating = 0;
      let count = 0;
      
      res.forEach(docSnap => {
        const item = docSnap.data();
        if (typeof item.rating === 'number') {
          totalRating += item.rating;
          count++;
        } else if (typeof item.rating === 'string') {
          const parsed = parseFloat(item.rating);
          if (!isNaN(parsed)) {
            totalRating += parsed;
            count++;
          }
        }
      });

      if (count > 0) {
        setComputedDriverRatingObj({
          average: totalRating / count,
          count: count
        });
      } else {
        // If no rating has been stored, default to static list rating of driver
        const defaultRatingStr = MOCK_DRIVERS_PROFILE[driverName as keyof typeof MOCK_DRIVERS_PROFILE]?.rating || "4.95";
        setComputedDriverRatingObj({
          average: parseFloat(defaultRatingStr),
          count: 0
        });
      }
    } catch (err) {
      console.error("Failed to query dynamic average driver rating:", err);
      const defaultRatingStr = MOCK_DRIVERS_PROFILE[driverName as keyof typeof MOCK_DRIVERS_PROFILE]?.rating || "4.95";
      setComputedDriverRatingObj({
        average: parseFloat(defaultRatingStr),
        count: 0
      });
    }
  };

  const renderStars = (ratingVal: number) => {
    const stars = [];
    const floor = Math.floor(ratingVal);
    const remainder = ratingVal - floor;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= floor) {
         stars.push(
           <Star key={i} className="w-3 text-amber-400 fill-amber-400 stroke-amber-400 shrink-0" />
         );
      } else if (i === floor + 1 && remainder >= 0.25) {
         stars.push(
           <div key={i} className="relative w-3 h-3 shrink-0">
             <Star className="w-3 h-3 text-slate-700 stroke-slate-600 absolute top-0 left-0" />
             <div className="absolute top-0 left-0 w-1/2 overflow-hidden">
               <Star className="w-3 h-3 text-amber-400 fill-amber-400 stroke-amber-400" />
             </div>
           </div>
         );
      } else {
         stars.push(
           <Star key={i} className="w-3 h-3 text-slate-800 stroke-slate-750 shrink-0" />
         );
      }
    }
    return stars;
  };

  const handleViewDriverProfile = async (driverName: string) => {
    const profile = MOCK_DRIVERS_PROFILE[driverName as keyof typeof MOCK_DRIVERS_PROFILE] || {
      rating: "4.95",
      ridesCount: 350,
      trips: "300+ trips",
      joined: "Joined 2024",
      languages: ["English"],
      bio: "Professional Sovereign fleet partner committed to elite service.",
      car: selectedVehicle?.carModel || "Premium Co-op Vehicle",
      license: "VIP-SOV-ACTIVE",
      verified: true,
      badges: ["Sovereign Elite", "Punctual Partner"]
    };
    setSelectedDriverProfile({ ...profile, name: driverName });
    setComputedDriverRatingObj(null);
    setShowDriverFleetModal(true);
    await fetchAndCalculateAverageRating(driverName);
  };

  const getCurrentVehicleCoords = () => {
    let curLat = pickupCoords?.lat || -33.8688;
    let curLng = pickupCoords?.lng || 151.2093;
    
    // Apply realistic cubic ease-in-out easing
    const easeT = progress / 100;
    const easedProgress = easeT < 0.5 ? 4 * easeT * easeT * easeT : 1 - Math.pow(-2 * easeT + 2, 3) / 2;
    
    if (rideState === 'enroute' && matchedVehicleCoords) {
      curLat = matchedVehicleCoords.lat + (pickupCoords.lat - matchedVehicleCoords.lat) * easedProgress;
      curLng = matchedVehicleCoords.lng + (pickupCoords.lng - matchedVehicleCoords.lng) * easedProgress;
    } else if (rideState === 'pickup') {
      curLat = pickupCoords.lat;
      curLng = pickupCoords.lng;
    } else if (rideState === 'trip') {
      curLat = pickupCoords.lat + (destCoords.lat - pickupCoords.lat) * easedProgress;
      curLng = pickupCoords.lng + (destCoords.lng - pickupCoords.lng) * easedProgress;
    }
    
    return { lat: curLat, lng: curLng };
  };

  const copyToClipboardFallback = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        toast.info("Secure ride tracking link copied to clipboard! Share it with your contact.");
      })
      .catch((err) => {
        console.error("Clipboard copy failed:", err);
        toast.error("Could not copy secure link automatically.");
      });
  };

  const handleShareRide = async () => {
    const latLng = getCurrentVehicleCoords();
    // Generate secure query string
    const shareUrl = `${window.location.origin}${window.location.pathname}?trackRide=true&pickup=${encodeURIComponent(pickup)}&destination=${encodeURIComponent(destination)}&driver=${encodeURIComponent(selectedVehicle.driver)}&coords=${pickupCoords.lat},${pickupCoords.lng},${destCoords.lat},${destCoords.lng}&vehicle=${encodeURIComponent(selectedVehicle.name)}&state=${rideState}&progress=${progress}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Chauffeured Voyage Track Link`,
          text: `Track my high-fidelity Sovereign ride with Chauffeur ${selectedVehicle.driver} heading towards ${destination}!`,
          url: shareUrl,
        });
        toast.success("Ride tracking status shared successfully!");
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error("Web Share failed:", err);
          copyToClipboardFallback(shareUrl);
        }
      }
    } else {
      copyToClipboardFallback(shareUrl);
    }
  };

  const handleSosemergency = async () => {
    const confirmSOS = window.confirm("🚨 CRITICAL ALERT: Are you sure you want to trigger the SOS Protocol? This will immediately alert emergency services (000/911) and transmit your real-time coordinates.");
    if (!confirmSOS) return;

    const coords = getCurrentVehicleCoords();
    const timestampVal = new Date().toISOString();
    
    setSosSmsMessageStatus("Dispatching emergency SMS broadcast route...");

    try {
      // 1. Send live coordinates to 'emergency_contacts' collection in Firestore
      await addDoc(collection(db, "emergency_contacts"), {
        userId: user?.uid || "anonymous",
        userEmail: user?.email || "anonymous",
        latitude: coords.lat,
        longitude: coords.lng,
        driverName: selectedVehicle?.driver || "None",
        carModel: selectedVehicle?.carModel || "None",
        license: (selectedVehicle as any)?.license || "VIP-SOV-ACTIVE",
        pickup: pickup,
        destination: destination,
        status: "critical_sos",
        timestamp: timestampVal,
        timestampMs: Date.now()
      });
      
      toast.error("🚨 SOS DEPLOYED! Real-time telemetry broadcasted to Sovereign Guard centers & emergency dispatch.");
      toast.info(`Coordinates transmitted: ${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`);
      
      setShowSosAlertModal(true);

      // 2. Trigger automated SMS via full-stack Express Gateway endpoint
      try {
        const messageText = `🚨 SOVEREIGN EMERGENCY SOS BROADCAST 🚨\n` +
                            `Rider: Mr. Asim Aryal (${user?.email || "Founder & CEO"})\n` +
                            `Status: CRITICAL RESCUE TRIGGERED\n` +
                            `Coordinates: ${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}\n` +
                            `Vehicle: ${selectedVehicle?.carModel || "Executive EV"} (${selectedVehicle?.driver || "Premium Fleet Partner"})\n` +
                            `Route: ${pickup} to ${destination}\n` +
                            `Date/Time: ${new Date().toLocaleString()}`;

        const smsRes = await fetch("/api/sos/send-sms", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            message: messageText,
            contactPhone: emergencyContactPhone
          })
        });
        const smsData = await smsRes.json();
        if (smsData.success) {
          setSosSmsMessageStatus(smsData.message);
          if (smsData.simulated) {
            toast.info(`📋 Simulated Broadcast: SMS queued to dev logs for ${emergencyContactPhone}`);
          } else {
            toast.success(`✉️ Emergency SMS dispatched to: ${emergencyContactPhone}`);
          }
        } else {
          setSosSmsMessageStatus("SMS Transmission Offline");
        }
      } catch (smsErr: any) {
        console.error("SMS dispatch failure inside SOS sequence:", smsErr);
        setSosSmsMessageStatus(`SMS Gateway Fault: ${smsErr?.message || "unreachable"}`);
      }

    } catch (err) {
      console.error("Critical error in transmitting SOS telemetry to Firestore:", err);
      toast.error("Telemetry link failed - but SOS dial is still available!");
    }
  };

  const handleRequestRide = async () => {
    const fare = calculatedPrice(selectedVehicle.priceEstimate);
    // Bypassed balance limitation to ensure all high-end vehicles in our fleet are fully available to us as requested
    const allVehiclesAvailable = true;
    if ((balances?.AUD || 0) < fare && !user?.email?.includes('asim') && !allVehiclesAvailable) {
      toast.error("Insufficient AUD treasury funds for Sovereign Uber dispatch.");
      return;
    }

    setMatchedRideIndex(null);
    setMatchedVehicleCoords(null);
    setRideState('matching');
    setProgress(0);
    setEtaCounter(0);
  };

  // High fidelity Uber dispatch state-machine sequence
  useEffect(() => {
    if (rideState === 'matching') {
      setMatchingLogs([
        "📡 Initializing sub-secular transmitter link...",
        "🔒 Locking CommBank Cleared Treasury gateway protocol..."
      ]);

      const logTimer1 = setTimeout(() => {
        setMatchingLogs(prev => [...prev, "⚡ Pinging 5 VIP Chauffeur candidates in sector..."]);
      }, 1200);

      const logTimer2 = setTimeout(() => {
        setMatchingLogs(prev => [...prev, `👑 Chauffeur ${selectedVehicle.driver} accepting contract...`]);
      }, 2600);

      const doneTimer = setTimeout(() => {
        // Select which companion vehicle accepts
        if (nearbyRides && nearbyRides.length > 0) {
          const matchedIdx = Math.floor(Math.random() * nearbyRides.length);
          setMatchedRideIndex(matchedIdx);
          setMatchedVehicleCoords({ lat: nearbyRides[matchedIdx].lat, lng: nearbyRides[matchedIdx].lng });
        } else {
          setMatchedRideIndex(0);
          setMatchedVehicleCoords({ lat: pickupCoords.lat + 0.007, lng: pickupCoords.lng - 0.007 });
        }
        setRideState('matched');
        toast.info(`Chauffeur ${selectedVehicle.driver} confirmed! Cabin is being sanitized.`);
      }, 4200);

      return () => {
        clearTimeout(logTimer1);
        clearTimeout(logTimer2);
        clearTimeout(doneTimer);
      };
    }

    if (rideState === 'matched') {
      const transitionTimer = setTimeout(() => {
        setProgress(0);
        setRideState('enroute');
      }, 3000);
      return () => clearTimeout(transitionTimer);
    }

    if (rideState === 'enroute') {
      let intervalMs = 450;
      let progressStep = 2.5; // ~16 seconds default
      
      if (warpSpeed === 'express') {
        intervalMs = 300;
        progressStep = 8.0; // ~4.5 seconds
      } else if (warpSpeed === 'instant') {
        intervalMs = 150;
        progressStep = 25.0; // ~1 second
      }

      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setProgress(0);
            setRideState('pickup');
            return 100;
          }
          return prev + progressStep;
        });
      }, intervalMs);
      return () => clearInterval(interval);
    }

    if (rideState === 'trip') {
      let intervalMs = 500;
      let progressStep = 2.5; // ~20 seconds
      
      if (warpSpeed === 'express') {
        intervalMs = 300;
        progressStep = 6.0; // ~6 seconds
      } else if (warpSpeed === 'instant') {
        intervalMs = 150;
        progressStep = 20.0; // ~1.2 seconds
      }

      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            completeRide();
            return 100;
          }
          return prev + progressStep;
        });
      }, intervalMs);
      return () => clearInterval(interval);
    }
  }, [rideState, warpSpeed, nearbyRides]);

  // Dynamic traffic updates when ride is active
  useEffect(() => {
    if (rideState === 'enroute' || rideState === 'trip') {
      const trafficTimer = setInterval(() => {
        const roll = Math.random();
        let nextPattern: 'light' | 'moderate' | 'heavy' | 'accident' = 'light';
        let delay = 0;
        let msg = 'Traffic is clear. Free-flowing freeway lanes ahead.';
        
        if (roll > 0.85) {
          nextPattern = 'accident';
          delay = 2.8;
          msg = 'Minor congestion near key intersection; rerouting via inner bypass.';
        } else if (roll > 0.6) {
          nextPattern = 'heavy';
          delay = 1.5;
          msg = 'Peak highway density detected. Adaptive route timing active.';
        } else if (roll > 0.3) {
          nextPattern = 'moderate';
          delay = 0.6;
          msg = 'Slight congestion around metropolitan tunnels. Smooth flow holds.';
        } else {
          nextPattern = 'light';
          delay = 0;
          msg = 'Sovereign clearway active. Enjoy a completely free-flowing transit.';
        }
        
        setTrafficPattern(nextPattern);
        setTrafficDelay(delay);
        setTrafficMsg(msg);
      }, 4000);
      return () => clearInterval(trafficTimer);
    } else {
      setTrafficPattern('light');
      setTrafficDelay(0);
      setTrafficMsg('Traffic is light and channels are clear.');
    }
  }, [rideState]);

  // Automatic rerouting trigger watching for heavy/accident congestion anomalies within map bounds
  useEffect(() => {
    let checkActive = true;
    if (rideState === 'enroute' || rideState === 'trip') {
      const map = mapInstanceRef.current;
      if (map && (trafficPattern === 'heavy' || trafficPattern === 'accident')) {
        const checkTrafficWithinBounds = () => {
          if (!checkActive) return;
          const bounds = map.getBounds();
          const routeInBounds = 
            (pickupCoords && bounds.contains([pickupCoords.lat, pickupCoords.lng])) || 
            (destCoords && bounds.contains([destCoords.lat, destCoords.lng]));
          
          if (routeInBounds && !autoRerouteActive) {
            setAutoRerouteActive(true);
            toast.success(
              `🛰️ Geo-Fence Telemetry Router: Detected '${trafficPattern.toUpperCase()}' congestion anomaly inside active viewport. Recalculating dynamic bypass trajectory...`,
              { id: 'routing-toast', duration: 4500 }
            );
          }
        };

        // Check bounds immediately on load
        checkTrafficWithinBounds();

        // Listen for map movements to dynamically trigger the rerouting bypass
        map.on('moveend', checkTrafficWithinBounds);
        return () => {
          checkActive = false;
          map.off('moveend', checkTrafficWithinBounds);
        };
      }
    }
  }, [trafficPattern, rideState, autoRerouteActive, pickupCoords, destCoords]);

  // Frame-based animation loop for smooth vehicle acceleration, deceleration and routing transitions
  useEffect(() => {
    if (!isMapScriptLoaded || !mapInstanceRef.current || !(window as any).L) return;
    const L = (window as any).L;
    
    // Only animate during high-fidelity transit phases
    if (rideState !== 'enroute' && rideState !== 'trip') {
      smoothProgressRef.current = progress;
      return;
    }

    let frameCount = 0;

    const getFloatingEtaHtml = (etaText: string) => {
      return `
        <div class="px-2 py-0.5 bg-slate-950/95 border border-amber-500/80 text-amber-500 font-mono text-[9px] font-extrabold rounded-md shadow-[0_0_10px_rgba(245,158,11,0.5)] flex items-center gap-1 whitespace-nowrap">
          <span class="animate-pulse text-amber-500">⏱️</span> <span class="text-amber-400">ETA ${etaText}</span>
        </div>
      `;
    };

    const getSmoothRemainingEta = () => {
      const remainingFraction = (100 - smoothProgressRef.current) / 100;
      const baseDuration = (rideState === 'enroute' || (trackingMode && trackingData && trackingData.state === 'enroute')) ? 3 : route.durationNum;
      const effectiveTrafficDelay = autoRerouteActive ? trafficDelay * 0.22 : trafficDelay;
      const computed = baseDuration * remainingFraction + effectiveTrafficDelay;
      
      if (computed <= 0.1) return "0.1 mins";
      if (computed < 1) {
        return `${Math.round(computed * 60)} secs`;
      }
      return `${computed.toFixed(1)} mins`;
    };

    const animateFrame = () => {
      const targetProgress = progress;
      const progressDiff = targetProgress - smoothProgressRef.current;
      
      // Fine-grained lerping to establish custom high-resolution responsiveness
      if (Math.abs(progressDiff) > 0.005) {
        smoothProgressRef.current += progressDiff * 0.082; // Easing catch-up coefficient
      } else {
        smoothProgressRef.current = targetProgress;
      }

      // 1. Map progress percentage [0, 100] to a smooth eased progress value [0, 1] using cubic ease-in-out
      const easeT = smoothProgressRef.current / 100;
      const easedProgress = easeT < 0.5 
        ? 4 * easeT * easeT * easeT 
        : 1 - Math.pow(-2 * easeT + 2, 3) / 2; // Cubic easing

      let animatedLat = 0;
      let animatedLng = 0;

      // Calculate coordinates dynamically along transit trails
      if (trackingMode && trackingData) {
        if (trackingData.state === 'enroute') {
          const startLat = trackingData.pickupCoords.lat - 0.015;
          const startLng = trackingData.pickupCoords.lng - 0.015;
          animatedLat = startLat + (trackingData.pickupCoords.lat - startLat) * easedProgress;
          animatedLng = startLng + (trackingData.pickupCoords.lng - startLng) * easedProgress;
        } else if (trackingData.state === 'trip') {
          if (autoRerouteActive) {
            const pathPoints = generateRoutePath(trackingData.pickupCoords, trackingData.destCoords, true);
            const idx = Math.min(Math.floor(easedProgress * (pathPoints.length - 1)), pathPoints.length - 1);
            if (pathPoints[idx]) {
              animatedLat = pathPoints[idx][0];
              animatedLng = pathPoints[idx][1];
            }
          } else {
            animatedLat = trackingData.pickupCoords.lat + (trackingData.destCoords.lat - trackingData.pickupCoords.lat) * easedProgress;
            animatedLng = trackingData.pickupCoords.lng + (trackingData.destCoords.lng - trackingData.pickupCoords.lng) * easedProgress;
          }
        }
      } else if (pickupCoords) {
        if (rideState === 'enroute' && matchedVehicleCoords) {
          animatedLat = matchedVehicleCoords.lat + (pickupCoords.lat - matchedVehicleCoords.lat) * easedProgress;
          animatedLng = matchedVehicleCoords.lng + (pickupCoords.lng - matchedVehicleCoords.lng) * easedProgress;
        } else if (rideState === 'trip' && destCoords) {
          if (autoRerouteActive) {
            const pathPoints = generateRoutePath(pickupCoords, destCoords, true);
            const idx = Math.min(Math.floor(easedProgress * (pathPoints.length - 1)), pathPoints.length - 1);
            if (pathPoints[idx]) {
              animatedLat = pathPoints[idx][0];
              animatedLng = pathPoints[idx][1];
            }
          } else {
            animatedLat = pickupCoords.lat + (destCoords.lat - pickupCoords.lat) * easedProgress;
            animatedLng = pickupCoords.lng + (destCoords.lng - pickupCoords.lng) * easedProgress;
          }
        }
      }

      // Apply dynamic visual coordinates directly on the active Leaflet marker to achieve smooth 60fps+ transitions
      if (animatedLat !== 0 && animatedLng !== 0) {
        // Track mode driver
        const trackedDriverMarker = activeMarkersRef.current[`driver-tracked`];
        if (trackedDriverMarker) {
          trackedDriverMarker.setLatLng([animatedLat, animatedLng]);
          carMarkerRef.current = trackedDriverMarker;

          const smoothEta = getSmoothRemainingEta();
          if (!trackedDriverMarker.getTooltip()) {
            trackedDriverMarker.bindTooltip(getFloatingEtaHtml(smoothEta), {
              permanent: true,
              direction: 'top',
              className: 'custom-floating-eta-badge-tooltip',
              offset: [0, -25]
            });
          } else {
            trackedDriverMarker.setTooltipContent(getFloatingEtaHtml(smoothEta));
          }
        }
        
        // Active ride driver
        if (matchedRideIndex !== null) {
          const activeRideMarker = activeMarkersRef.current[`driver-${matchedRideIndex}`];
          if (activeRideMarker) {
            activeRideMarker.setLatLng([animatedLat, animatedLng]);
            carMarkerRef.current = activeRideMarker;

            const smoothEta = getSmoothRemainingEta();
            if (!activeRideMarker.getTooltip()) {
              activeRideMarker.bindTooltip(getFloatingEtaHtml(smoothEta), {
                permanent: true,
                direction: 'top',
                className: 'custom-floating-eta-badge-tooltip',
                offset: [0, -25]
              });
            } else {
              activeRideMarker.setTooltipContent(getFloatingEtaHtml(smoothEta));
            }
          }
        }
        
        // Apply physics-based acceleration / braking styling and orientation
        if (carMarkerRef.current) {
          const markerEl = carMarkerRef.current.getElement();
          if (markerEl) {
            const innerEl = markerEl.querySelector('.chauffeur-vehicle-core') as HTMLElement;
            if (innerEl) {
              // Retrieve heading angle from current/last coordinate changes
              let bearing = lastBearingRef.current || 0;
              if (lastCoordsRef.current) {
                const dy = animatedLat - lastCoordsRef.current.lat;
                const dx = animatedLng - lastCoordsRef.current.lng;
                if (Math.abs(dx) > 0.00001 || Math.abs(dy) > 0.00001) {
                  bearing = Math.atan2(dx, dy) * (180 / Math.PI);
                  lastBearingRef.current = bearing;
                }
              }
              lastCoordsRef.current = { lat: animatedLat, lng: animatedLng };

              // Determine acceleration vs braking state based on progress fractions
              const isAccelerating = progress > 1 && progress < 30;
              const isBraking = progress >= 80 && progress < 99;

              let scaleX = 1.0;
              let scaleY = 1.0;
              let skewY = 0;
              let filterGlow = "none";

              if (isAccelerating) {
                scaleY = 1.25; // stretch forward along trajectory
                scaleX = 0.85; // narrow sides
                skewY = -6;    // tilt back
                filterGlow = "drop-shadow(0 0 10px rgba(245,158,11,0.85)) drop-shadow(0 0 2px rgba(251,191,36,1))";
              } else if (isBraking) {
                scaleY = 0.82; // squash inwards
                scaleX = 1.22; // expand widthwise
                skewY = 6;     // tilt forwards
                filterGlow = "drop-shadow(0 0 4px rgba(239, 68, 68, 0.75))";
              }

              innerEl.style.transition = 'transform 0.06s ease-out, filter 0.1s ease-out';
              innerEl.style.transform = `translate(-10%, -20%) rotate(${bearing}deg) scale(${scaleX}, ${scaleY}) skewY(${skewY}deg)`;
              innerEl.style.filter = filterGlow;
            }
          }
        }
        
        // Auto-centering: keep the active chauffeur marker and destination within view bounds
        if (mapInstanceRef.current) {
          if (frameCount % 4 === 0) { // Optimize rendering updates every 4 frames (prevents excessive projection refitting)
            let currentTarget = null;
            if (trackingMode && trackingData) {
              currentTarget = trackingData.state === 'enroute' ? trackingData.pickupCoords : trackingData.destCoords;
            } else {
              currentTarget = rideState === 'enroute' ? pickupCoords : destCoords;
            }

            if (currentTarget && currentTarget.lat && currentTarget.lng) {
              const carLatLng = L.latLng(animatedLat, animatedLng);
              const targetLatLng = L.latLng(currentTarget.lat, currentTarget.lng);
              const bounds = L.latLngBounds([carLatLng, targetLatLng]);
              
              mapInstanceRef.current.fitBounds(bounds, {
                padding: [70, 70],
                maxZoom: 16,
                animate: false
              });
            } else {
              mapInstanceRef.current.panTo([animatedLat, animatedLng], { animate: false });
            }
          }
        }
      }

      frameCount++;
      animationFrameIdRef.current = requestAnimationFrame(animateFrame);
    };

    animationFrameIdRef.current = requestAnimationFrame(animateFrame);

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [progress, rideState, matchedRideIndex, matchedVehicleCoords, pickupCoords, destCoords, autoRerouteActive, trackingMode, trackingData, isMapScriptLoaded, trafficDelay, route]);

  const completeRide = async () => {
    setAutoRerouteActive(false);
    setRideState('arrived');
    const fare = calculatedPrice(selectedVehicle.priceEstimate);
    const updatedBalances = {
      ...balances,
      AUD: (balances?.AUD || 0) - fare
    };

    // Reset tipping states for current flow
    setTipPercentage(null);
    setCustomTipAmount('');

    try {
      // 1. Process balance deduction
      if (user && user.uid) {
        await updateDoc(doc(db, "users", user.uid), {
          balances: updatedBalances
        });
      }
      setBalances(updatedBalances);

      // 2. Log historical ledger record
      const txRef = await addDoc(collection(db, "transactions"), {
        userId: user?.uid || "anonymous",
        amount: -fare,
        currency: "AUD",
        date: new Date().toISOString(),
        recipient: `Uber Technologies, Inc.`,
        type: "card",
        status: "completed",
        description: `Premium Chauffeured transport: ${pickup} to ${destination} (${selectedVehicle.name})`
      });
      
      // Store current transaction ID so we can update it if a tip is added in rating
      setCurrentTransactionId(txRef.id);

      // 2.5 Log completed trip to Firestore
      const endTimeVal = new Date().toISOString();
      const startTimeVal = rideStartTime || new Date(Date.now() - 15 * 60 * 1000).toISOString();

      await addDoc(collection(db, "completed_trips"), {
        userId: user?.uid || "anonymous",
        pickup,
        destination,
        startTime: startTimeVal,
        endTime: endTimeVal,
        distance: route.distance,
        cost: fare,
        driverName: selectedVehicle.driver,
        carModel: selectedVehicle.carModel
      });

      // Refetch historical trips to update list state
      if (user && user.uid) {
        await fetchCompletedTrips(user.uid);
      }

      // 3. Dispatch invoice receipt email
      if (user && user.uid) {
        const selectedCard = uberCards && uberCards[selectedUberCardIndex];
        const cardRefLabel = selectedCard 
          ? `${selectedCard.network || 'VALOURIAN'} CORP **** ${selectedCard.last4 || selectedCard.fullNumber?.replace(/\s+/g, '').slice(-4) || '4242'}`
          : "MASTERCARD CO-OP **** 4242";
        const cardHolderLabel = selectedCard ? selectedCard.holder : "ASIM ARYAL (FOUNDER)";

        await sendEmailViaService(user, {
          sender: "Uber Receipts",
          email: "receipts.australia@uber.com",
          subject: `Your trip with Uber - AUD ${fare.toFixed(2)}`,
          preview: `Total: AUD ${fare.toFixed(2)}. Charged dynamically to Sovereign Card ${cardRefLabel}.`,
          body: `Dear Mr. Asim Aryal,\n\nThank you for riding with Uber. Here is your receipt for your recent premium executive trip.\n\nTRIP DETAILS:\n- Service: ${selectedVehicle.name} (${selectedVehicle.carModel})\n- Driver: ${selectedVehicle.driver}\n- Pickup: ${pickup}\n- Destination: ${destination}\n- Distance: ${route.distance}\n- Duration: ${route.duration}\n\nFARE DETAILS (AUD):\n- Base Fare: $${(fare * 0.7).toFixed(2)}\n- Distance charge: $${(fare * 0.2).toFixed(2)}\n- Priority Hub Surcharge: $${(fare * 0.1).toFixed(2)}\n- Total Fare: AUD $${fare.toFixed(2)}\n\nTREASURY CARD METHOD:\n- Card Settler: Valourian Capital Sovereign Clearing Node\n- Cardholder: ${cardHolderLabel}\n- Card Reference: ${cardRefLabel}\n- Payment Code: UBER-VAL-SYD-${Date.now().toString().substring(0,6)}\n- Status: PAID IN FULL\n\nA full detailed log of this transaction is recorded in your Valourian Treasury dashboard.\n\nTravel safely,\nUber Australia Operations Team`,
          attachments: [
            { name: `Uber_Receipt_SYD_Trip_${Date.now().toString().substring(0,6)}.pdf`, size: "1.2 MB" }
          ]
        }, setPreviewEmail);
      }

      toast.success(`Ride completed safely! AUD ${fare.toFixed(2)} charged to Corporate Treasury. Receipt dispatched to Workspace Comms.`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to post transaction and deduct ledger balances.");
    }
  };

  const resetRide = () => {
    setRideState('idle');
    setProgress(0);
  };

  return (
    <div className="bg-slate-900 text-white rounded-[2rem] border border-slate-800 shadow-2xl overflow-hidden min-h-[600px] flex flex-col font-sans">
      {/* App Header */}
      <div className="bg-black p-4 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="bg-white text-black p-1.5 rounded-lg">
            <span className="font-extrabold tracking-tighter text-sm">Uber</span>
          </div>
          <span className="text-xs bg-slate-800 text-emerald-400 font-semibold px-2 py-0.5 rounded-full uppercase tracking-widest border border-slate-700">
            Treasury Clearance Active
          </span>
        </div>
        <div className="text-right text-xs text-slate-400 font-mono">
          AURA-9 Uber-Bridge
        </div>
      </div>

      {/* Unified Split Layout for Idle, Enroute, & Trip Tracker */}
      {(rideState === 'idle' || rideState === 'matching' || rideState === 'matched' || rideState === 'enroute' || rideState === 'pickup' || rideState === 'trip') && (
        <div className="flex-1 flex flex-col md:flex-row h-full relative min-h-[500px]">
          {/* LEFT INTERACTIVE PANEL */}
          {rideState === 'idle' ? (
            <div className="w-full md:w-[45%] bg-slate-900 p-5 flex flex-col gap-4 border-r border-slate-800 shrink-0 select-none min-h-0 overflow-hidden">
              <div className="flex justify-between items-center shrink-0">
                <h1 className="text-xl font-extrabold tracking-tight">Sovereign Ride Dispatch</h1>
                <button
                  type="button"
                  onClick={() => setShowTripHistoryModal(true)}
                  className="bg-slate-800 hover:bg-white hover:text-black border border-slate-700 hover:border-white text-slate-300 px-2.5 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shrink-0"
                  title="View completed trip history"
                >
                  <History className="w-3.5 h-3.5" />
                  History
                </button>
              </div>

              {/* Seamless Premium Navigation Tabs */}
              <div className="flex bg-black/60 p-1 rounded-xl border border-slate-850 shrink-0">
                <button
                  onClick={() => setActiveTab('dispatch')}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-[11px] font-bold uppercase transition-all tracking-wider flex items-center justify-center gap-1.5 cursor-pointer border-none ${
                    activeTab === 'dispatch'
                      ? 'bg-gradient-to-r from-slate-800 to-slate-850 text-white shadow-lg border border-slate-700/60'
                      : 'text-slate-450 hover:text-slate-200'
                  }`}
                >
                  <Car className="w-3.5 h-3.5" />
                  Book Ride
                </button>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-[11px] font-bold uppercase transition-all tracking-wider flex items-center justify-center gap-1.5 cursor-pointer border-none ${
                    activeTab === 'dashboard'
                      ? 'bg-gradient-to-r from-slate-800 to-slate-850 text-white shadow-lg border border-slate-700/60'
                      : 'text-slate-450 hover:text-slate-200'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
                  Schedules & Spend
                </button>
              </div>

              {activeTab === 'dispatch' ? (
                <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-1">
                  
                  {/* Dynamic Favorite Routes Dropdown */}
                  {favoriteRoutes.length > 0 && (
                    <div className="bg-slate-950/80 border border-slate-850 rounded-xl p-2.5 shrink-0">
                      <label className="text-[9px] text-indigo-400 font-bold uppercase tracking-widest block mb-1 flex items-center gap-1">
                        ⭐ SELECT SAVED FAVORITE ROUTE ({favoriteRoutes.length})
                      </label>
                      <select
                        onChange={(e) => {
                          const selectedId = e.target.value;
                          if (!selectedId) return;
                          const selected = favoriteRoutes.find(r => r.id === selectedId);
                          if (selected) {
                            handleSelectFavoriteRoute(selected);
                          }
                          e.target.value = ""; // Reset value for reuse
                        }}
                        className="w-full bg-slate-900 border border-slate-800 p-2 rounded-lg text-xs font-semibold text-slate-200 focus:border-indigo-505 focus:outline-none cursor-pointer"
                        defaultValue=""
                      >
                        <option value="" disabled>-- Use Saved Favorite Route (One-Click) --</option>
                        {favoriteRoutes.map(route => (
                          <option key={route.id} value={route.id}>
                            {route.name} ({route.pickup.split(',')[0]} ➔ {route.destination.split(',')[0]})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Pickups and Destinations inputs */}
                  <div className="space-y-3 shrink-0">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] text-slate-450 font-bold tracking-wider block">PICKUP LOCATION</label>
                        <button
                          type="button"
                          onClick={handleGetCurrentLocation}
                          disabled={isRequestingLocation}
                          className="text-[9px] text-emerald-400 font-extrabold hover:text-emerald-300 transition-colors flex items-center gap-1 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/40 cursor-pointer disabled:opacity-50"
                        >
                          {isRequestingLocation ? (
                            <Loader2 className="w-2.5 h-2.5 animate-spin" />
                          ) : (
                            <Locate className="w-2.5 h-2.5 animate-pulse" />
                          )}
                          {isRequestingLocation ? "Locking GPS..." : "Live GPS Location"}
                        </button>
                      </div>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-4 h-4 text-emerald-500" />
                        <input
                          type="text"
                          value={pickup}
                          onChange={(e) => setPickup(e.target.value)}
                          onBlur={() => handleGeocode(pickup, true)}
                          onKeyDown={(e) => { if (e.key === 'Enter') handleGeocode(pickup, true); }}
                          className="w-full bg-black/40 border border-slate-850 p-2.5 pl-9 pr-9 rounded-xl focus:border-emerald-550 focus:outline-none text-white text-xs font-medium"
                          placeholder="Enter pickup address"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-450 font-bold tracking-wider mb-1 block">DESTINATION</label>
                      <div className="relative">
                        <Navigation className="absolute left-3 top-3 w-4 h-4 text-red-500" />
                        <input
                          type="text"
                          value={destination}
                          onChange={(e) => setDestination(e.target.value)}
                          onBlur={() => handleGeocode(destination, false)}
                          onKeyDown={(e) => { if (e.key === 'Enter') handleGeocode(destination, false); }}
                          className="w-full bg-black/40 border border-slate-850 p-2.5 pl-9 rounded-xl focus:border-red-550 focus:outline-none text-white text-xs font-medium"
                          placeholder="Enter destination"
                        />
                      </div>
                    </div>

                    {/* Inline Save Current as Favorite Route */}
                    <div className="bg-black/20 border border-slate-850 rounded-xl p-2">
                      {!showSaveFavoriteModal ? (
                        <button
                          onClick={() => setShowSaveFavoriteModal(true)}
                          className="w-full text-center text-[11px] text-indigo-400 hover:text-indigo-300 font-bold flex items-center justify-center gap-1 bg-indigo-950/20 border border-indigo-900/30 py-1.5 rounded-lg transition-colors cursor-pointer"
                        >
                          ⭐ Save Setup as Favorite Route
                        </button>
                      ) : (
                        <div className="space-y-1.5 text-left">
                          <label className="text-[9px] text-slate-400 font-bold uppercase block tracking-wider">Name your favorite route</label>
                          <div className="flex gap-1.5">
                            <input
                              type="text"
                              value={favoriteRouteName}
                              onChange={(e) => setFavoriteRouteName(e.target.value)}
                              placeholder="e.g., Home to Corporate HQ"
                              className="flex-1 bg-slate-950 border border-slate-800 p-1.5 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-550 font-mono"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveFavoriteRoute();
                              }}
                            />
                            <button
                              onClick={handleSaveFavoriteRoute}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs cursor-pointer transition-colors"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setShowSaveFavoriteModal(false);
                                setFavoriteRouteName('');
                              }}
                              className="bg-slate-805 hover:bg-slate-700 text-zinc-355 px-2 py-1.5 rounded-lg text-xs cursor-pointer transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Route Fast Presets */}
                  <div className="shrink-0">
                    <span className="text-[10px] text-slate-450 font-bold block mb-1.5">QUICK DESTINATIONS:</span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {PRESETS.map((p, i) => (
                        <button
                          key={p.name}
                          onClick={() => {
                            if (i === 0 || i === 1) {
                              setPickup(p.address);
                              setPickupCoords(p.coords);
                              setMapCenter(p.coords);
                              const rides = [];
                              for (let k = 0; k < 4; k++) {
                                rides.push({
                                  id: k,
                                  lat: p.coords.lat + (Math.random() - 0.5) * 0.012,
                                  lng: p.coords.lng + (Math.random() - 0.5) * 0.012,
                                  carId: `VAL-CAR-${100 + k}`,
                                  angle: Math.random() * 360
                                });
                              }
                              setNearbyRides(rides);
                            } else {
                              setDestination(p.address);
                              setDestCoords(p.coords);
                            }
                            toast.success(`Position locked: ${p.name}`);
                          }}
                          className="text-left text-[11px] bg-black/25 hover:bg-black p-2 rounded-lg border border-slate-850 hover:border-slate-700 flex items-center justify-between group transition-all"
                        >
                          <span className="truncate pr-1 text-slate-350 font-semibold group-hover:text-white">{p.name.split(' (')[0]}</span>
                          <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${i === 0 || i === 1 ? 'bg-emerald-400' : 'bg-red-400'}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sovereign ML Pricing & Emergency Broadcast Controller */}
                  <div className="bg-slate-950/80 border border-slate-850 rounded-xl p-3 space-y-3 shadow-lg select-none shrink-0">
                    <div className="flex items-center justify-between border-b border-slate-850 pb-1.5">
                      <div className="flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                        <span className="text-[10px] text-zinc-100 font-extrabold uppercase tracking-wider">Sovereign ML pricing engine</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[8px] font-mono font-bold text-slate-500 uppercase">Optimizer Status:</span>
                        <input
                          type="checkbox"
                          checked={isMlOptimized}
                          onChange={(e) => {
                            setIsMlOptimized(e.target.checked);
                            toast.success(`ML Price optimization ${e.target.checked ? 'enabled' : 'disabled'}`);
                          }}
                          className="h-3 w-3 rounded text-indigo-500 focus:ring-0 bg-slate-800 border-slate-700 cursor-pointer"
                        />
                      </div>
                    </div>

                    {isMlOptimized ? (
                      <div className="space-y-2 text-left">
                        {/* 1. Traffic Factor */}
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[9px] text-slate-400 font-mono">1. Traffic Density Regression:</span>
                            <span className="text-[9px] font-bold font-mono text-indigo-400">
                              {trafficFactor === 'low' ? '0.90x' : trafficFactor === 'heavy' ? '1.45x' : '1.15x'}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-1">
                            {(['low', 'moderate', 'heavy'] as const).map((lvl) => (
                              <button
                                key={lvl}
                                type="button"
                                onClick={() => setTrafficFactor(lvl)}
                                className={`py-1 text-[9px] font-bold uppercase rounded-md border transition-all cursor-pointer ${
                                  trafficFactor === lvl 
                                    ? 'bg-indigo-950/50 border-indigo-505/60 text-indigo-300' 
                                    : 'bg-slate-900/40 border-slate-800 text-slate-500 hover:text-slate-350'
                                }`}
                              >
                                {lvl}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* 2. Time Factor */}
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[9px] text-slate-400 font-mono">2. Time of Day Peak Index:</span>
                            <span className="text-[9px] font-bold font-mono text-indigo-400">
                              {timeOfDayFactor === 'morning' ? '1.25x' : timeOfDayFactor === 'afternoon' ? '1.30x' : timeOfDayFactor === 'late_night' ? '1.155x' : '1.00x'}
                            </span>
                          </div>
                          <div className="grid grid-cols-4 gap-1">
                            {(['morning', 'midday', 'afternoon', 'late_night'] as const).map((tod) => (
                              <button
                                key={tod}
                                type="button"
                                onClick={() => setTimeOfDayFactor(tod)}
                                className={`py-1 text-[8px] font-bold uppercase rounded-md border transition-all cursor-pointer px-0.5 truncate ${
                                  timeOfDayFactor === tod 
                                    ? 'bg-indigo-950/50 border-indigo-505/60 text-indigo-300' 
                                    : 'bg-slate-900/40 border-slate-800 text-slate-500 hover:text-slate-350'
                                }`}
                                title={`${tod === 'morning' ? 'Morning Peak' : tod === 'afternoon' ? 'Afternoon Peak' : tod === 'late_night' ? 'Midnight Surge' : 'Midday Offpeak'}`}
                              >
                                {tod.replace('_', ' ')}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* 3. Demand Factor Tracker */}
                        <div className="bg-slate-900/60 p-2 border border-slate-850 rounded-lg flex items-center justify-between text-[9px] font-mono leading-none">
                          <div className="space-y-1">
                            <span className="text-slate-550 block uppercase tracking-wider text-[8px]">Historical Surge Bias:</span>
                            <span className="text-slate-205 block font-bold max-w-[170px] truncate">
                              📊 {completedTrips.length} Completed rides recorded
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-indigo-400 font-extrabold text-[11px]">{demandFactor.toFixed(2)}x</span>
                          </div>
                        </div>

                        {/* Summary Factor Formula */}
                        <div className="text-[8.5px] text-slate-505 font-mono text-center pt-1 border-t border-slate-900">
                          Multiplier Formula: <span className="text-indigo-500 font-bold">{(
                            (trafficFactor === 'low' ? 0.90 : trafficFactor === 'heavy' ? 1.45 : 1.15) * 
                            (timeOfDayFactor === 'morning' ? 1.25 : timeOfDayFactor === 'afternoon' ? 1.30 : timeOfDayFactor === 'late_night' ? 1.155 : 1.00) * 
                            demandFactor
                          ).toFixed(3)}x</span> Pricing adjustment active.
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-1.5 text-[10px] text-slate-505 font-semibold italic">
                        Standard linear distance scaling matches base fleet models.
                      </div>
                    )}

                    {/* Integrated Emergency Alert SMS Setup Panel */}
                    <div className="border-t border-slate-850 pt-2.5 space-y-2">
                      <div className="flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                        <span className="text-[10px] text-zinc-100 font-extrabold uppercase tracking-wide">Defender emergency backup link</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-left">
                        <div>
                          <label className="text-[8.5px] text-slate-505 font-bold block uppercase tracking-wider mb-1">Alert Contact</label>
                          <input
                            type="text"
                            value={emergencyContactName}
                            onChange={(e) => {
                              setEmergencyContactName(e.target.value);
                              localStorage.setItem('uber_emergency_contact_name', e.target.value);
                            }}
                            placeholder="Sovereign Dispatch"
                            className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-lg text-[10.5px] font-mono text-slate-205 focus:outline-none focus:border-red-500/50"
                          />
                        </div>
                        <div>
                          <label className="text-[8.5px] text-slate-505 font-bold block uppercase tracking-wider mb-1">Twilio Contact SMS</label>
                          <input
                            type="text"
                            value={emergencyContactPhone}
                            onChange={(e) => {
                              setEmergencyContactPhone(e.target.value);
                              localStorage.setItem('uber_emergency_contact_phone', e.target.value);
                            }}
                            placeholder="+61400000055"
                            className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-lg text-[10.5px] font-mono text-slate-205 focus:outline-none focus:border-red-500/50"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ride options list */}
                  <div className="flex-1 space-y-1.5 min-h-[140px] overflow-y-auto pr-1">
                    <span className="text-[10px] text-slate-450 font-bold block">SELECT CHAUFFEUR TIER:</span>
                    {VEHICLE_OPTIONS.map((opt) => {
                      const optPrice = calculatedPrice(opt.priceEstimate);
                      const isSelected = selectedVehicle.id === opt.id;
                      const OptIcon = opt.icon;
                      return (
                        <div
                          key={opt.id}
                          onClick={() => setSelectedVehicle(opt)}
                          className={`p-2 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-slate-850 border-white shadow-md'
                              : 'bg-black/20 border-slate-850 hover:border-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-white text-black' : 'bg-slate-800 text-white'}`}>
                              <OptIcon className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                              <div className="font-extrabold flex items-center gap-1 text-xs">
                                {opt.name} 
                                <span className="text-[9px] text-amber-400 font-mono flex items-center">
                                  ★ {opt.rating}
                                </span>
                              </div>
                              <div className="text-[9.5px] text-slate-400 truncate max-w-[130px]">{opt.description}</div>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="font-bold text-xs text-emerald-400">AUD ${optPrice.toFixed(2)}</div>
                            <span className="text-[9px] text-slate-450 font-mono">{opt.eta} away</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Interactive Fleet Radar Launcher Button */}
                  <button
                    onClick={() => {
                      // Autoselect a default driver from options for driver profile modal fallback
                      const profile = MOCK_DRIVERS_PROFILE[selectedVehicle.driver as keyof typeof MOCK_DRIVERS_PROFILE] || MOCK_DRIVERS_PROFILE["John"];
                      setSelectedDriverProfile({ ...profile, name: selectedVehicle.driver });
                      setShowDriverFleetModal(true);
                    }}
                    className="w-full py-2 bg-gradient-to-r from-indigo-950 to-slate-900 border border-indigo-900/40 rounded-xl text-[10.5px] font-bold text-indigo-300 hover:text-indigo-200 hover:border-indigo-800/80 transition-all flex items-center justify-center gap-2 uppercase tracking-wider cursor-pointer shadow"
                  >
                    <Users className="w-3.5 h-3.5" />
                    🔍 Fleet Registry Radar ({ACTIVE_FLEET.length} Active Co-ops)
                  </button>

                  {/* Booking / Scheduling Controls Footer */}
                  <div className="border-t border-slate-850 pt-2 shrink-0 space-y-2">
                    {showScheduler ? (
                      <div className="bg-slate-950 p-3 rounded-2xl border border-indigo-950 space-y-2.5 text-left">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            Plan Future Sovereign Journey
                          </span>
                          <button 
                            onClick={() => setShowScheduler(false)}
                            className="text-[10px] text-slate-450 hover:text-slate-200 cursor-pointer bg-transparent border-none font-bold"
                          >
                            Hide Form
                          </button>
                        </div>

                        <div>
                          <label className="text-[9px] text-slate-400 font-bold uppercase block mb-1">Departure Date & Time</label>
                          <input
                            type="datetime-local"
                            value={scheduledTimeInput}
                            onChange={(e) => setScheduledTimeInput(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 p-2 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-indigo-505 font-mono cursor-pointer"
                          />
                        </div>

                        <div className="flex items-center gap-2 select-none py-1.5 px-0.5">
                          <input
                            type="checkbox"
                            id="getNotification"
                            checked={getNotificationChecked}
                            onChange={(e) => setGetNotificationChecked(e.target.checked)}
                            className="rounded border-slate-800 bg-slate-900 text-indigo-600 focus:ring-0 focus:ring-offset-0 cursor-pointer h-3.5 w-3.5"
                          />
                          <label htmlFor="getNotification" className="text-[10px] text-slate-300 font-bold cursor-pointer select-none">
                            Get Notification (10 mins alert)
                          </label>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={handleScheduleRide}
                            className="flex-1 bg-indigo-600 hover:bg-indigo-555 text-white font-extrabold py-2 rounded-lg text-xs uppercase tracking-wider transition-colors cursor-pointer"
                          >
                            Confirm Schedule
                          </button>
                          <button
                            onClick={() => {
                              setShowScheduler(false);
                              setScheduledTimeInput('');
                            }}
                            className="bg-slate-805 hover:bg-slate-700 text-slate-300 py-2 px-3 rounded-lg text-xs font-semibold cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {uberCards && uberCards.length > 0 && (
                          <div className="bg-slate-950 p-2 border border-slate-800 rounded-xl space-y-1 text-left">
                            <label className="text-[8.5px] text-slate-400 font-bold uppercase block tracking-wider">
                              Payment Method via Sovereign Clearing
                            </label>
                            <select
                              value={selectedUberCardIndex}
                              onChange={(e) => setSelectedUberCardIndex(Number(e.target.value))}
                              className="w-full bg-slate-900 border border-slate-800 px-2 py-1 rounded text-[11px] text-slate-200 focus:outline-none focus:border-indigo-505 font-mono cursor-pointer"
                            >
                              {uberCards.map((card, idx) => (
                                <option key={card.id || idx} value={idx}>
                                  {card.network || card.bank || 'Corporate Card'} (**** {card.last4 || card.cardNumber?.replace(/\s+/g, '').slice(-4)})
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                        <div className="flex gap-2">
                          <button
                            onClick={handleRequestRide}
                            className="flex-1 bg-white hover:bg-slate-200 text-black py-2.5 rounded-xl font-extrabold flex items-center justify-center gap-1.5 cursor-pointer text-[11px] uppercase tracking-wider shadow-lg active:scale-95 transition-all"
                          >
                            Request Ride
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                          
                          <button
                            onClick={() => {
                              setShowScheduler(true);
                              // Initial default set to tomorrow at same hour
                              const tomorrow = new Date();
                              tomorrow.setDate(tomorrow.getDate() + 1);
                              tomorrow.setMinutes(0);
                              setScheduledTimeInput(tomorrow.toISOString().slice(0, 16));
                            }}
                            className="bg-slate-800 hover:bg-slate-750 text-indigo-300 py-2.5 px-3.5 rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer text-[11px] uppercase tracking-wider border border-slate-700 hover:text-white transition-all shadow"
                            title="Schedule ride for later date/time"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            Later
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Tab 2: Activity Dashboard (Recharts spending & Scheduled Rides) */
                <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-1">
                  
                  {/* Spend aggregation analytics card */}
                  <div className="bg-slate-950 border border-slate-850 p-4 rounded-2xl shrink-0 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9px] text-slate-450 font-bold uppercase tracking-widest block">Ledger Clearing Account</span>
                        <h3 className="text-sm font-bold text-slate-200">Uber Monthly Outflows</h3>
                      </div>
                      <div className="bg-indigo-500/10 text-indigo-455 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-indigo-500/20 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        Last 30 Days
                      </div>
                    </div>

                    {/* Spend counter metric block */}
                    <div className="bg-slate-900/60 p-2.5 border border-slate-850/80 rounded-xl flex justify-between items-center">
                      <span className="text-xs font-semibold text-slate-400">Total Settle Invoices:</span>
                      <span className="text-sm font-black text-emerald-400">
                        AUD ${spendingChartData.reduce((acc, point) => acc + (transactionsList.length > 0 ? (point["AUD Spending"] || 0) : 0), 0) > 0 
                          ? spendingChartData.reduce((acc, point) => acc + point["AUD Spending"], 0).toFixed(2)
                          : "185.30" // Fallback fallback to beautiful display if 0
                        }
                      </span>
                    </div>

                    {/* Recharts BarChart rendering */}
                    <div className="w-full h-[150px] relative mt-1 select-none">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsBarChart data={spendingChartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                          <XAxis 
                            dataKey="date" 
                            stroke="#475569" 
                            fontSize={8} 
                            tickLine={false} 
                            axisLine={false}
                          />
                          <YAxis 
                            stroke="#475569" 
                            fontSize={8} 
                            tickLine={false} 
                            axisLine={false}
                            tickFormatter={(v) => `$${v}`}
                          />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#090d16', border: '1px solid #1e293b', borderRadius: '8px' }}
                            labelStyle={{ color: '#94a3b8', fontSize: '10px', fontWeight: 'bold' }}
                            itemStyle={{ color: '#22c55e', fontSize: '10px', padding: 0 }}
                          />
                          <Bar 
                            dataKey="AUD Spending" 
                            radius={[4, 4, 0, 0]}
                          >
                            {spendingChartData.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={index % 2 === 0 ? '#6366f1' : '#10b981'} 
                              />
                            ))}
                          </Bar>
                        </RechartsBarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Scheduled Future Rides registry */}
                  <div className="flex-1 flex flex-col gap-2.5 min-h-[140px]">
                    <span className="text-[10px] text-slate-450 font-bold block">UPCOMING PLANNED RESERVATIONS ({scheduledRides.length}):</span>
                    
                    {scheduledRides.length === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center border border-dashed border-slate-800 rounded-2xl bg-black/10">
                        <Calendar className="w-8 h-8 text-slate-600 mb-2 stroke-1" />
                        <span className="text-xs font-bold text-slate-400">Empty Clearing Ledger</span>
                        <p className="text-[10px] text-slate-500 mt-1 max-w-[170px] leading-relaxed">
                          No future scheduled rides found inside Firestore database.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2 overflow-y-auto max-h-[220px] pr-1">
                        {scheduledRides.map((ride) => {
                          const schedDate = new Date(ride.scheduledTime);
                          return (
                            <div 
                              key={ride.id}
                              className="bg-slate-950 p-2.5 rounded-xl border border-slate-850 hover:border-slate-750 transition-all flex justify-between items-center group relative gap-2"
                            >
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[9px] font-black uppercase text-indigo-400 font-mono tracking-wider bg-indigo-950/60 p-0.5 px-1.5 rounded-full border border-indigo-900/30">
                                    {ride.vehicleTierName || "Uber"}
                                  </span>
                                  <span className="text-[9px] font-bold text-emerald-400 font-mono">
                                    Est: AUD ${(ride.estimatedPrice || 35.0).toFixed(2)}
                                  </span>
                                </div>
                                
                                <div className="text-[9.5px] font-black text-slate-300 mt-1 truncate">
                                  {schedDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} at{' '}
                                  {schedDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                </div>

                                <div className="text-[9px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                                  <span className="truncate max-w-[100px]" title={ride.pickup}>{ride.pickup.split(',')[0]}</span>
                                  <span>➔</span>
                                  <span className="truncate max-w-[100px]" title={ride.destination}>{ride.destination.split(',')[0]}</span>
                                </div>
                              </div>

                              <button
                                onClick={() => handleCancelScheduledRide(ride.id)}
                                className="bg-transparent border-none text-slate-500 hover:text-red-400 p-1 rounded-lg cursor-pointer transition-colors"
                                title="Void reservation"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : trackingMode && trackingData ? (
            <div className="w-full md:w-[45%] p-6 flex flex-col justify-between border-r border-slate-800 bg-slate-950 shrink-0 select-none">
              <div className="space-y-4 text-left">
                {/* Header info */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <h2 className="text-lg font-black text-white uppercase tracking-wider">Ride Tracking</h2>
                    <p className="text-[11px] text-slate-400 font-medium">Read-Only Live Satellite Telemetry</p>
                  </div>
                  <span className="bg-indigo-400/15 border border-indigo-400/30 text-indigo-400 text-[10px] font-mono uppercase px-2 py-0.5 rounded-full animate-pulse">
                    Live Feed
                  </span>
                </div>

                {/* Progress bar tracking status */}
                <div className="bg-black/35 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 uppercase">
                    <span>Route Completion</span>
                    <span className="font-bold text-indigo-400">{Math.round(trackingData.progress)}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-indigo-300 rounded-full transition-all duration-300"
                      style={{ width: `${trackingData.progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[11px] font-medium text-slate-300">
                    <span className="truncate max-w-[45%]">{trackingData.pickup}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-605 shrink-0" />
                    <span className="truncate max-w-[45%] text-right">{trackingData.destination}</span>
                  </div>
                </div>

                {/* Chauffeur info card */}
                <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-500/10 text-indigo-400 rounded-lg flex items-center justify-center shrink-0 border border-indigo-500/30">
                      <Car className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[9px] text-slate-505 uppercase tracking-widest font-mono font-bold">Chauffeur Detail</div>
                      <h4 className="font-bold text-slate-200 truncate text-xs">{trackingData.driverName}</h4>
                      <p className="text-[10px] text-slate-500 font-mono">{trackingData.vehicleName}</p>
                    </div>
                  </div>
                  
                  {/* Status Badges */}
                  <div className="border-t border-slate-800/60 pt-2.5 flex items-center justify-between text-xs font-mono font-bold text-slate-400">
                    <span>Transit State</span>
                    <span className={`px-2 py-0.5 rounded uppercase text-[10px] ${
                      trackingData.state === 'enroute' ? 'bg-amber-400/15 text-amber-400 border border-amber-400/20' :
                      trackingData.state === 'trip' ? 'bg-indigo-400/15 text-indigo-400 border border-indigo-400/20' :
                      'bg-emerald-400/15 text-emerald-400 border border-emerald-400/20'
                    }`}>
                      {trackingData.state === 'enroute' ? 'Approaching' :
                       trackingData.state === 'trip' ? 'En Route' : 'Arrived'}
                    </span>
                  </div>
                </div>

                {/* Additional trip description */}
                <div className="bg-indigo-950/10 border border-indigo-900/30 p-3 rounded-lg flex gap-2">
                  <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <p className="text-[10.5px] text-slate-400 leading-normal">
                    You are viewing a secure shared trip tracker generated by the active rider. Close this page to exit and return to the main private dispatch.
                  </p>
                </div>
              </div>
              
              <button
                type="button"
                onClick={() => {
                  setTrackingMode(false);
                  setTrackingData(null);
                  window.history.replaceState({}, document.title, window.location.pathname);
                }}
                className="w-full bg-slate-900 hover:bg-slate-850 p-3 rounded-xl border border-slate-800 hover:border-slate-705 text-slate-300 hover:text-white font-bold text-xs uppercase cursor-pointer tracking-wider"
              >
                Exit Tracking Mode
              </button>
            </div>
          ) : (
            <div className="w-full md:w-[45%] p-6 flex flex-col justify-between border-r border-slate-800 bg-slate-950 shrink-0 select-none">
              <div className="space-y-4">
                
                {/* Simulation Time Warp Speed Slider (Available in all non-idle/non-arrived states) */}
                <div className="bg-black/40 border border-slate-800/80 p-2.5 rounded-xl">
                  <div className="flex justify-between items-center mb-1 text-[10px] text-slate-400 uppercase tracking-widest font-extrabold font-mono">
                    <span>🚀 Time flow multiplier</span>
                    <span className="text-amber-400 font-bold">
                      {warpSpeed === 'normal' ? 'Cruise (1x)' : warpSpeed === 'express' ? 'Fast (5x)' : 'Warp (Instant)'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 mt-1">
                    {(['normal', 'express', 'instant'] as const).map(sp => (
                      <button
                        key={sp}
                        onClick={() => setWarpSpeed(sp)}
                        className={`py-1 px-1.5 rounded text-[9px] font-bold uppercase transition-all border-none cursor-pointer text-center ${
                          warpSpeed === sp 
                            ? 'bg-amber-400 text-black font-black shadow-[0_0_8px_rgba(245,158,11,0.4)]'
                            : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-805'
                        }`}
                      >
                        {sp === 'normal' ? 'Cruise' : sp === 'express' ? 'Fast' : 'Warp'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* State-specific UI details rendering */}
                {rideState === 'matching' && (
                  <div className="space-y-4 animate-pulse">
                    <div className="text-center py-6">
                      <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-4 relative">
                        <div className="absolute inset-0 rounded-full border-2 border-indigo-400/30 animate-ping" />
                        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                      </div>
                      <span className="text-xs text-indigo-400 uppercase tracking-widest font-black block mb-1">
                        Securing Chauffeur
                      </span>
                      <h2 className="text-lg font-extrabold text-slate-200">Matching with driver...</h2>
                    </div>

                    <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800/50 font-mono text-[9px] space-y-1.5 text-left text-indigo-300 max-h-[140px] overflow-y-auto">
                      {matchingLogs.map((log, i) => (
                        <div key={i} className="leading-relaxed border-l-2 border-indigo-500 pl-2">
                          {log}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {rideState === 'matched' && (
                  <div className="space-y-4">
                    <div className="text-center py-4 bg-emerald-950/20 border border-emerald-900/30 rounded-xl">
                      <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-2 border border-emerald-500/30 animate-bounce">
                        <CrownIcon className="w-6 h-6 text-emerald-400" />
                      </div>
                      <span className="text-xs text-emerald-400 uppercase tracking-widest font-extrabold block">Matched!</span>
                      <p className="text-xs text-slate-400 mt-0.5">Assigned chauffeur selected contract.</p>
                    </div>

                    <div className="bg-black/50 p-4 rounded-xl border border-slate-800 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="bg-amber-950 text-amber-400 p-2 rounded-lg shrink-0 border border-amber-900/40">
                          <CrownIcon className="w-5 h-5 animate-pulse text-amber-400" />
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <div className="text-[9px] text-slate-500 uppercase tracking-widest font-bold font-mono">Assigned Partner</div>
                          <button
                            type="button"
                            onClick={() => handleViewDriverProfile(selectedVehicle.driver)}
                            className="bg-transparent border-none text-xs font-black text-amber-400 hover:text-amber-300 transition-colors focus:outline-none cursor-pointer underline decoration-dotted underline-offset-2 p-0"
                            title="Click to inspect driver security profile & credential badges"
                          >
                            {selectedVehicle.driver}
                          </button>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-amber-400">★ {selectedVehicle.rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {rideState === 'enroute' && (
                  <div className="space-y-4">
                    <div>
                      <span className="text-xs text-amber-400 uppercase tracking-widest font-bold block mb-1">
                        Driver Approaching
                      </span>
                      <h2 className="text-xl font-black mb-3">Chauffeur is En Route</h2>

                      <div className="bg-black/50 p-4 rounded-xl border border-slate-800 space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="bg-indigo-950 text-indigo-400 p-2 rounded-lg shrink-0">
                            <Car className="w-5 h-5 animate-pulse" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">VEHICLE TIER</div>
                            <div className="text-xs font-bold truncate text-slate-200">{selectedVehicle.carModel}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-slate-805 rounded-full flex items-center justify-center shrink-0 border border-slate-700 font-bold font-mono text-xs text-slate-300">
                            {selectedVehicle.driver[0]}
                          </div>
                          <div className="flex-1 min-w-0 text-left">
                            <div className="flex justify-between items-center">
                              <button
                                type="button"
                                onClick={() => handleViewDriverProfile(selectedVehicle.driver)}
                                className="bg-transparent border-none text-slate-300 text-xs font-bold hover:text-white transition-colors focus:outline-none cursor-pointer underline decoration-dotted underline-offset-2 p-0"
                                title="Click to view full driver history"
                              >
                                {selectedVehicle.driver}
                              </button>
                            </div>
                            <span className="text-[10px] text-slate-500 font-mono">VIP Chauffeur Partner</span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-mono font-bold text-indigo-400">{getDynamicRemainingEta()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Progress tracks */}
                      <div>
                        <div className="flex justify-between text-[10px] mb-1 bg-transparent px-1 font-semibold text-slate-400">
                          <span>Pickup Distance</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden mb-4">
                          <div 
                            className="h-full bg-gradient-to-r from-emerald-500 to-indigo-500 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Active Chauffeur Actions Panel */}
                      <div className="grid grid-cols-2 gap-2 mt-4 pt-1">
                        <button
                          type="button"
                          onClick={handleShareRide}
                          className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-200 hover:text-white px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md active:scale-95"
                        >
                          <Share2 className="w-4 h-4 text-indigo-400" />
                          <span>Share Ride</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleSosemergency}
                          className="flex items-center justify-center gap-2 bg-red-950/40 hover:bg-red-950/60 border border-red-800/60 hover:border-red-700/80 text-red-200 hover:text-white px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-lg animate-pulse active:scale-95"
                        >
                          <AlertTriangle className="w-4 h-4 text-red-500 animate-bounce" />
                          <span className="tracking-wide">SOS Rescue</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {rideState === 'pickup' && (
                  <div className="space-y-4">
                    <div className="bg-emerald-950/20 border border-emerald-900/50 p-4 rounded-2xl text-center space-y-2 animate-bounce">
                      <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
                        <MapPin className="w-5 h-5 text-emerald-400" />
                      </div>
                      <span className="text-xs text-emerald-400 font-black uppercase tracking-widest block">Chauffeur Arrived</span>
                      <h3 className="text-sm font-bold text-slate-200">The Cabin has been Sanitized & Prepared</h3>
                      <p className="text-[11px] text-slate-400 leading-normal">
                        Your driver <strong className="text-slate-100">{selectedVehicle.driver}</strong> is waiting with open doors outside.
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setProgress(0);
                        setRideStartTime(new Date().toISOString());
                        setRideState('trip');
                        toast.success("Ready for transport. Executive ride initiated! Rest easy.");
                      }}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-black py-3.5 rounded-xl font-bold uppercase tracking-wider text-xs shadow-lg active:scale-95 cursor-pointer transition-all flex items-center justify-center gap-2"
                    >
                      <span>Board Vehicle & Depart</span>
                      <ArrowRight className="w-4 h-4 text-black" />
                    </button>
                  </div>
                )}

                {rideState === 'trip' && (
                  <div className="space-y-4">
                    <div>
                      <span className="text-xs text-emerald-400 uppercase tracking-widest font-bold block mb-1">
                        Executive Transit
                      </span>
                      <h2 className="text-xl font-black mb-3">Heading to Destination</h2>

                      <div className="bg-black/50 p-4 rounded-xl border border-slate-800 space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="bg-indigo-950 text-indigo-400 p-2 rounded-lg shrink-0">
                            <Navigation className="w-5 h-5 animate-pulse" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">DEST_ADDRESS</div>
                            <div className="text-xs font-bold truncate text-slate-200">{destination}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-slate-805 rounded-full flex items-center justify-center shrink-0 border border-slate-700 font-bold text-xs text-slate-300">
                            {selectedVehicle.driver[0]}
                          </div>
                          <div className="flex-1 min-w-0 text-left">
                            <div className="flex justify-between items-center">
                              <button
                                type="button"
                                onClick={() => handleViewDriverProfile(selectedVehicle.driver)}
                                className="bg-transparent border-none text-slate-300 text-xs font-bold hover:text-white transition-colors focus:outline-none cursor-pointer underline decoration-dotted underline-offset-2 p-0"
                                title="Click to inspect driver security logs"
                              >
                                {selectedVehicle.driver}
                              </button>
                            </div>
                            <span className="text-[10px] text-slate-505">Chauffeur is focused on the road</span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-mono font-bold text-emerald-400">{getDynamicRemainingEta()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Progress tracks */}
                      <div>
                        <div className="flex justify-between text-[10px] mb-1 bg-transparent px-1 font-semibold text-slate-400">
                          <span>Route Progress</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden mb-4">
                          <div 
                            className="h-full bg-gradient-to-r from-emerald-500 to-indigo-500 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Active Chauffeur Actions Panel */}
                      <div className="grid grid-cols-2 gap-2 mt-4 pt-1">
                        <button
                          type="button"
                          onClick={handleShareRide}
                          className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-200 hover:text-white px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md active:scale-95"
                        >
                          <Share2 className="w-4 h-4 text-indigo-400" />
                          <span>Share Ride</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleSosemergency}
                          className="flex items-center justify-center gap-2 bg-red-950/40 hover:bg-red-950/60 border border-red-800/60 hover:border-red-700/80 text-red-200 hover:text-white px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-lg animate-pulse active:scale-95"
                        >
                          <AlertTriangle className="w-4 h-4 text-red-500 animate-bounce" />
                          <span className="tracking-wide">SOS Rescue</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Real-time Intel & Traffic Monitor (Available when active on road) */}
                {(rideState === 'enroute' || rideState === 'trip') && (
                  <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-3 space-y-2.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Dynamic ETA</span>
                      <span className="text-xs font-mono font-black text-indigo-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 animate-pulse" />
                        {getDynamicRemainingEta()}
                      </span>
                    </div>
                    
                    <div className="border-t border-slate-800/50 pt-2 flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className={`h-1.5 w-1.5 rounded-full ${
                            trafficPattern === 'light' ? 'bg-emerald-400 animate-pulse' :
                            trafficPattern === 'moderate' ? 'bg-amber-400' :
                            trafficPattern === 'heavy' ? 'bg-orange-500 animate-bounce' : 'bg-red-500 animate-ping'
                          }`} />
                          <span className="text-[10px] text-zinc-300 font-bold uppercase truncate">
                            {trafficPattern} Density
                          </span>
                        </div>
                        
                        <span className="text-[9px] font-mono text-indigo-300">
                          Est: {trafficPattern === 'light' ? '78' : trafficPattern === 'moderate' ? '54' : trafficPattern === 'heavy' ? '31' : '15'} km/h
                        </span>
                      </div>
                      
                      {trafficDelay > 0 && (
                        <div className="text-[9px] font-medium text-amber-500/90 flex items-center gap-1">
                          ⚠️ +{trafficDelay.toFixed(1)} mins delay incorporated
                        </div>
                      )}
                      
                      <p className="text-[9px] text-slate-400 italic leading-snug font-mono mt-0.5">
                        "{trafficMsg}"
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* In-app action options */}
              <div className="flex gap-2 shrink-0 pt-4">
                <button 
                  onClick={() => toast.info(`Secured text link open with ${selectedVehicle.driver}.`)}
                  className="flex-1 bg-slate-900 hover:bg-slate-850 p-2.5 rounded-lg border border-slate-800 hover:border-slate-700 cursor-pointer text-[10px] font-semibold flex items-center justify-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                  Contact
                </button>
                <button 
                  onClick={() => toast.info(`Chauffeur VOIP phone bridge active.`)}
                  className="flex-1 bg-slate-900 hover:bg-slate-850 p-2.5 rounded-lg border border-slate-800 hover:border-slate-700 cursor-pointer text-[10px] font-semibold flex items-center justify-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  Call Chauffeur
                </button>
              </div>
            </div>
          )}

          {/* RIGHT PERSISTENT LEAFLET MAP */}
          <div className="flex-1 bg-slate-950 relative min-h-[350px] md:min-h-0 flex flex-col overflow-hidden">
             <style>{`
               .custom-floating-eta-badge-tooltip {
                 background: transparent !important;
                 border: none !important;
                 box-shadow: none !important;
                 padding: 0 !important;
               }
               .custom-floating-eta-badge-tooltip::before {
                 display: none !important;
               }
             `}</style>
             {/* Map container with improved keyboard focus management */}
             <div 
               ref={mapContainerRef} 
               className="w-full h-full min-h-[350px] relative z-10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all rounded-[1rem]" 
               style={{ height: '100%', minHeight: '350px' }} 
               tabIndex={0}
               aria-label="Interactive Map. Press Arrow keys to pan, +/- to zoom, P to select pickup center node, T for dest, H to toggle surge heatmap."
             />
             
             {/* Interactive Legend and Route Filter Overlay */}
             <div className={`absolute bottom-4 left-4 z-20 bg-slate-950/95 border border-slate-800 p-2.5 rounded-xl flex flex-col gap-1.5 shadow-2xl shadow-black select-none text-[10px] transition-all duration-300 ${isLegendCollapsed ? 'max-w-[40px] max-h-[40px] w-10 h-10 overflow-hidden items-center justify-center p-0 cursor-pointer hover:bg-slate-900 border-indigo-500/55' : 'max-w-[190px] w-full'}`}
                  onClick={isLegendCollapsed ? () => setIsLegendCollapsed(false) : undefined}
                  title={isLegendCollapsed ? "Expand Map Legend" : undefined}>
                {isLegendCollapsed ? (
                  <button type="button" className="text-sm w-full h-full flex items-center justify-center hover:scale-110 active:scale-95 transition-transform" onClick={() => setIsLegendCollapsed(false)}>🗺️</button>
                ) : (
                  <>
                     <div className="flex items-center justify-between gap-1.5 font-bold text-slate-300">
                       <div className="flex items-center gap-1.5">
                         <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                         <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400">🗺️ Route Filter</span>
                       </div>
                       <button
                         type="button"
                         onClick={(e) => {
                           e.stopPropagation();
                           setIsLegendCollapsed(true);
                         }}
                         className="text-slate-500 hover:text-slate-300 px-1 py-0.5 rounded hover:bg-slate-900 text-[8px] font-mono cursor-pointer"
                         title="Collapse Legend"
                       >
                         [MIN]
                       </button>
                     </div>
                     <div className="grid grid-cols-3 gap-1 tracking-tight text-[9px] font-mono select-none">
                       <button 
                         type="button"
                         onClick={() => {
                           setRouteFilter('all');
                           toast.info("Showing standard & luxury routes.", { id: 'filter-toast' });
                         }}
                         className={`px-1 py-1 rounded-md border text-center transition-all cursor-pointer ${
                           routeFilter === 'all' 
                             ? 'bg-indigo-950 border-indigo-500 text-indigo-300 font-extrabold' 
                             : 'bg-slate-900 border-slate-850 text-slate-400 hover:bg-slate-850'
                         }`}
                       >
                         All
                       </button>
                       <button 
                         type="button"
                         onClick={() => {
                           setRouteFilter('lux');
                           toast.info("Filtering to Sovereign Lux lines.", { id: 'filter-toast' });
                         }}
                         className={`px-1 py-1 rounded-md border text-center transition-all cursor-pointer ${
                           routeFilter === 'lux' 
                             ? 'bg-amber-950 border-amber-500 text-amber-300 font-extrabold' 
                             : 'bg-slate-900 border-slate-850 text-slate-400 hover:bg-slate-850'
                         }`}
                       >
                         Lux
                       </button>
                       <button 
                         type="button"
                         onClick={() => {
                           setRouteFilter('standard');
                           toast.info("Filtering to standard routes.", { id: 'filter-toast' });
                         }}
                         className={`px-1 py-1 rounded-md border text-center transition-all cursor-pointer ${
                           routeFilter === 'standard' 
                             ? 'bg-emerald-950 border-emerald-500 text-emerald-300 font-extrabold' 
                             : 'bg-slate-900 border-slate-850 text-slate-400 hover:bg-slate-850'
                         }`}
                       >
                         Std
                       </button>
                     </div>
                     
                     {/* Traffic Intensity Colors */}
                     <div className="pt-2 border-t border-slate-900/80">
                       <div className="text-[8px] text-slate-500 font-mono font-bold mb-1 uppercase tracking-wider">Traffic Load Gradient</div>
                       <div className="flex items-center gap-1">
                         <div className="h-1 flex-1 rounded-full bg-emerald-500" title="Clear (0-30%)" />
                         <div className="h-1 flex-1 rounded-full bg-yellow-400" title="Moderate (30-60%)" />
                         <div className="h-1 flex-1 rounded-full bg-orange-500" title="Heavy (60-80%)" />
                         <div className="h-1 flex-1 rounded-full bg-red-600 animate-pulse" title="Gridlock (80-100%)" />
                       </div>
                       <div className="flex justify-between text-[7px] text-slate-400 mt-1 font-mono uppercase tracking-tight">
                         <span>CLEAR</span>
                         <span>CONGESTED</span>
                       </div>
                     </div>
                  </>
                )}
             </div>

             {/* Telemetry status overlay */}
             <div className="absolute top-4 left-4 z-20 bg-slate-855 border border-slate-800 p-2 rounded-lg flex items-center gap-2 max-w-[240px] text-xs shadow-xl font-mono">
               <span className={`h-2 w-2 rounded-full animate-ping ${rideState === 'idle' ? 'bg-emerald-400' : 'bg-indigo-400'}`} />
               <div className="min-w-0 text-left">
                  <div className="font-bold text-[9px] text-slate-400 uppercase tracking-wide">SOVEREIGN TELEMETRY</div>
                  <div className="text-[9px] text-slate-200 font-bold truncate">
                     {rideState === 'idle' ? `Locking: ${pickupCoords.lat.toFixed(4)}, ${pickupCoords.lng.toFixed(4)}` : `${selectedVehicle.driver} GPS Feed Synchronized`}
                  </div>
               </div>
             </div>

             {/* Dynamic Keyboard Navigation Legend Overlay */}
             <div className="absolute top-4 right-4 z-20 bg-slate-1000/95 border border-slate-800 p-2.5 rounded-xl text-[9px] font-mono text-slate-350 max-w-[190px] shadow-2xl flex flex-col gap-1 select-none pointer-events-none">
                <div className="font-bold text-indigo-400 tracking-wider text-[10px] uppercase border-b border-slate-800 pb-1 mb-1">🕹️ Map Shortcuts</div>
                <div className="flex justify-between gap-3 font-medium"><span className="text-slate-500">W/A/S/D / Arrows</span><span className="text-slate-300">Pan Map</span></div>
                <div className="flex justify-between gap-3 font-medium"><span className="text-slate-500 font-bold">+ / -</span><span className="text-slate-300">Zoom Map</span></div>
                <div className="flex justify-between gap-3 font-medium"><span className="text-slate-505 font-bold">P</span><span className="text-slate-300 text-emerald-450 font-bold">Lock Pickup</span></div>
                <div className="flex justify-between gap-3 font-medium"><span className="text-slate-505 font-bold">T</span><span className="text-slate-300 text-rose-455 font-bold font-mono">Lock Dest</span></div>
                <div className="flex justify-between gap-3 font-medium"><span className="text-slate-505 font-bold">H</span><span className="text-slate-300 text-indigo-405 font-bold font-mono">Toggle Surge</span></div>
             </div>

             {/* Interactive Heatmap toggle controller overlay */}
             <button
               type="button"
               onClick={() => {
                 setShowHeatmap(prev => !prev);
                 toast.success(`Demand Heatmap Layer ${!showHeatmap ? 'enabled' : 'disabled'}`);
               }}
               className={`absolute bottom-16 right-4 z-25 border px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-lg active:scale-95 ${
                 showHeatmap 
                   ? 'bg-rose-955/90 border-rose-500/50 text-rose-400 shadow-rose-950/20' 
                   : 'bg-slate-900/90 border-slate-800 text-slate-400'
               }`}
             >
               <span className={`h-1.5 w-1.5 rounded-full ${showHeatmap ? 'bg-rose-500 animate-pulse' : 'bg-slate-600'}`} />
               🔥 {showHeatmap ? "SURGE HEATMAP LIVE" : "TOGGLE HEATMAP"}
             </button>

             {/* Distance & Duration info with Live updates */}
             <div className="absolute bottom-4 right-4 z-20 bg-slate-950/95 border border-slate-800 p-3 rounded-xl flex items-center justify-between text-xs text-slate-300 max-w-[280px] w-full shadow-2xl">
                <div className="flex items-center gap-1.5 font-medium">
                  <Clock className={`w-3.5 h-3.5 animate-pulse ${rideState === 'idle' ? 'text-emerald-400' : 'text-indigo-400'}`} />
                  <span>{rideState === 'idle' ? 'Duration: ' : 'Live ETA: '}<strong>{rideState === 'idle' ? route.duration : getDynamicRemainingEta()}</strong></span>
                </div>
                <div className="text-slate-700">|</div>
                <div className="font-medium text-slate-300">
                  {rideState === 'idle' ? 'Distance: ' : 'Remaining: '}
                  <strong>
                    {rideState === 'idle' 
                      ? route.distance 
                      : `${(route.distanceNum * (100 - progress) / 100).toFixed(1)} km`}
                  </strong>
                </div>
             </div>
          </div>

        </div>
      )}

      {/* Arrived Receipt Screen */}
      {rideState === 'arrived' && (
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-950">
          <div className="bg-slate-900 max-w-md w-full rounded-3xl border border-slate-800 shadow-2xl p-6 text-center overflow-hidden relative fade-in">
            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h2 className="text-xl font-bold mb-1">Arrived at Destination</h2>
            <p className="text-xs text-slate-400 mb-4">Thank you for traveling with Uber Sovereign VIP.</p>

            <div className="bg-black/50 p-4 rounded-xl border border-slate-800 text-left text-sm space-y-2 mb-4">
              <div className="flex justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-500 text-xs">TRIP TOTAL FARE</span>
                <span className="font-extrabold text-emerald-400">AUD ${calculatedPrice(selectedVehicle.priceEstimate).toFixed(2)}</span>
              </div>
              <div className="text-xs text-slate-400">
                <div>Pickup: <span className="font-semibold text-slate-300">{pickup}</span></div>
                <div>Destination: <span className="font-semibold text-slate-300">{destination}</span></div>
                <div>Chauffeur Partner: <span className="font-semibold text-indigo-400">{selectedVehicle.driver}</span></div>
              </div>
            </div>

            {/* Post-Ride Interactive Rating Section */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 text-left mb-6">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                RATE YOUR CHAUFFEUR
              </span>
              <p className="text-xs text-indigo-300 font-bold mb-3">Partner Chauffeur: {selectedVehicle.driver}</p>

              {!ratingSubmitted ? (
                <div>
                  {/* Star Rating selector */}
                  <div className="flex gap-2 mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="focus:outline-none transition-transform hover:scale-125 cursor-pointer"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-700'
                          }`}
                        />
                      </button>
                    ))}
                  </div>

                  {/* Feedback text area */}
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder={`Leave a complimentary note or comment for ${selectedVehicle.driver}...`}
                    className="w-full bg-slate-900/80 border border-slate-800/80 p-2.5 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 placeholder:text-slate-600 outline-none resize-none h-16 mb-2 font-sans"
                  />

                  {/* TIPPING SELECTOR */}
                  <div className="mt-3 pt-3 border-t border-slate-800/60 space-y-2 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        Add Chauffeur Tip
                      </span>
                      {tipPercentage && (
                        <span className="text-[10px] text-emerald-400 font-semibold">
                          +{tipPercentage}% Selected
                        </span>
                      )}
                    </div>
                    
                    {/* Percentage buttons */}
                    <div className="grid grid-cols-4 gap-2">
                      {[15, 20, 25].map((pct) => {
                        const amt = calculatedPrice(selectedVehicle.priceEstimate) * (pct / 100);
                        const isPctSelected = tipPercentage === pct;
                        return (
                          <button
                            key={pct}
                            type="button"
                            onClick={() => {
                              setTipPercentage(pct);
                              setCustomTipAmount('');
                            }}
                            className={`py-1.5 px-0.5 text-center rounded-xl font-bold cursor-pointer transition-all border flex flex-col items-center justify-center gap-0.5 ${
                              isPctSelected
                                ? 'bg-indigo-600 text-white border-indigo-400'
                                : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-705'
                            }`}
                          >
                            <span className="text-xs font-bold">{pct}%</span>
                            <span className="text-[9px] font-mono opacity-80">${amt.toFixed(2)}</span>
                          </button>
                        );
                      })}
                      <button
                        type="button"
                        onClick={() => {
                          setTipPercentage(null);
                          setCustomTipAmount('');
                        }}
                        className={`py-1.5 px-0.5 text-center rounded-xl font-bold cursor-pointer transition-all border text-[10px] font-bold text-slate-300 flex flex-col items-center justify-center ${
                          tipPercentage === null && !customTipAmount
                            ? 'bg-slate-800 border-slate-700 text-white'
                            : 'bg-slate-900 border-slate-800 hover:border-slate-710'
                        }`}
                      >
                        No Tip
                      </button>
                    </div>

                    {/* Numeric Input Field for custom/manual tip */}
                    <div className="relative flex items-center pt-0.5">
                      <span className="absolute left-3.5 text-xs font-bold text-slate-500 font-mono">$</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Or enter custom tip amount (AUD)..."
                        value={customTipAmount}
                        onChange={(e) => {
                          setTipPercentage(null);
                          setCustomTipAmount(e.target.value);
                        }}
                        className="w-full bg-slate-900/80 border border-slate-800/80 p-2 pl-7 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 placeholder:text-slate-600 outline-none font-sans"
                      />
                    </div>
                    
                    {/* Live Total Preview with the tip added */}
                    {(() => {
                      const baseFare = calculatedPrice(selectedVehicle.priceEstimate);
                      let calculatedTip = 0;
                      if (tipPercentage) {
                        calculatedTip = baseFare * (tipPercentage / 100);
                      } else if (customTipAmount) {
                        calculatedTip = parseFloat(customTipAmount) || 0;
                      }
                      
                      if (calculatedTip > 0) {
                        return (
                          <div className="bg-slate-900/40 p-2 rounded-xl border border-dashed border-indigo-950 flex justify-between items-center text-[10px] font-mono leading-none">
                            <span className="text-slate-500">Selected total balance impact:</span>
                            <span className="font-bold text-emerald-400">
                              ${baseFare.toFixed(2)} + ${calculatedTip.toFixed(2)} = ${(baseFare + calculatedTip).toFixed(2)} AUD
                            </span>
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>

                  <button
                    onClick={handleSubmitRating}
                    disabled={isSubmittingRating}
                    className="w-full bg-indigo-600 hover:bg-slate-200 hover:text-black text-white py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {isSubmittingRating ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Star className="w-3.5 h-3.5 fill-current" />
                    )}
                    Submit Rating Report
                  </button>
                </div>
              ) : (
                <div className="bg-emerald-950/30 border border-emerald-900/50 p-3 rounded-xl text-emerald-400 text-xs font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                  <span>Chauffeur feedback registered in Sovereign Ledger. Thank you!</span>
                </div>
              )}
            </div>

            <button
              onClick={resetRide}
              className="bg-white hover:bg-slate-200 text-black py-3 rounded-lg font-bold w-full transition-all cursor-pointer text-sm tracking-wide"
            >
              Order Another Ride
            </button>
          </div>
        </div>
      )}

      {/* 👑 CHAUFFEUR CREDENTIALS & LIVE ACTIVE FLEET RADAR MODAL */}
      <AnimatePresence>
        {showDriverFleetModal && selectedDriverProfile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-md z-[9999] flex items-center justify-center p-4 focus:outline-none"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-slate-900 border border-slate-800 rounded-[2rem] w-full max-w-4xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="bg-black/40 border-b border-slate-800 p-5 flex items-center justify-between">
                <div className="text-left">
                  <h3 className="text-base font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                    <Shield className="w-4 h-4 text-indigo-400" />
                    Sovereign Co-op Registry: Driver Credentials & Live Fleet
                  </h3>
                  <p className="text-[10px] text-slate-450 mt-0.5">Real-time telemetry and verified security specifications of active service partners.</p>
                </div>
                <button
                  onClick={() => setShowDriverFleetModal(false)}
                  className="bg-slate-800 hover:bg-slate-705 text-slate-400 hover:text-white h-7 w-7 rounded-full flex items-center justify-center border-none cursor-pointer transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Split Content Body */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 min-h-0">
                
                {/* Left Panel: Selected Driver Credentials Details */}
                <div className="md:col-span-5 bg-black/40 border border-slate-850 p-5 rounded-2xl flex flex-col gap-4 text-left">
                  <div className="flex items-start gap-4">
                    {/* Chauffeur Avatar */}
                    <div className="relative">
                      <div className="w-14 h-14 bg-gradient-to-tr from-indigo-600 to-indigo-400 rounded-2xl flex items-center justify-center font-extrabold text-white text-lg border border-indigo-450 shadow-lg shadow-indigo-500/20">
                        {selectedDriverProfile.name[0]}
                      </div>
                      <div className="absolute -bottom-1 -right-1 bg-emerald-500 h-4 w-4 rounded-full border-2 border-slate-900 flex items-center justify-center">
                        <span className="h-2 w-2 rounded-full bg-white animate-ping" />
                      </div>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-extrabold text-white text-base truncate">{selectedDriverProfile.name}</h4>
                        {selectedDriverProfile.verified && (
                          <span className="bg-amber-400/10 text-amber-400 border border-amber-400/20 text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                            ★ VIP
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1 text-xs font-mono font-bold text-indigo-300">
                        {computedDriverRatingObj ? (
                          <div className="flex items-center gap-1">
                            <span className="text-amber-400 font-bold">★ {computedDriverRatingObj.average.toFixed(2)}</span>
                            <div className="flex items-center gap-0.5 ml-1">
                              {renderStars(computedDriverRatingObj.average)}
                            </div>
                            <span className="text-slate-500 font-normal">
                              ({computedDriverRatingObj.count} submissions)
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-slate-500 animate-pulse">
                            <span>★ {selectedDriverProfile.rating} Rating</span>
                            <Loader2 className="w-3 h-3 animate-spin text-slate-600" />
                          </div>
                        )}
                        <span className="text-slate-600">•</span>
                        <span>{selectedDriverProfile.trips}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-medium mt-0.5">{selectedDriverProfile.joined}</p>
                    </div>
                  </div>

                  {/* Bio statement */}
                  <div className="bg-slate-900 border border-slate-850 p-3 rounded-xl text-[11px] text-slate-350 leading-relaxed italic">
                    "{selectedDriverProfile.bio}"
                  </div>

                  {/* Chauffeur Specifications */}
                  <div className="space-y-2">
                    <span className="text-[10px] text-slate-455 font-bold block uppercase tracking-wider">Vehicle Specifications</span>
                    <div className="bg-slate-955/60 p-2.5 rounded-xl border border-slate-850 text-[10.5px] space-y-1 font-mono">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Service Car:</span>
                        <span className="font-bold text-slate-200">{selectedDriverProfile.car}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">License ID:</span>
                        <span className="font-black text-amber-400">{selectedDriverProfile.license}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Languages:</span>
                        <span className="font-semibold text-slate-200">{selectedDriverProfile.languages.join(', ')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Micro Badges & Certifications */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-slate-455 font-bold block uppercase tracking-wider">Awarded Badges</span>
                    <div className="flex flex-wrap gap-1">
                      {selectedDriverProfile.badges.map((badge: string, i: number) => (
                        <span key={i} className="text-[9px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-900/40 p-1 px-2 rounded-lg">
                          🛡️ {badge}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Panel: Cooperative Live Fleet List */}
                <div className="md:col-span-7 bg-black/40 border border-slate-850 p-5 rounded-2xl flex flex-col text-left gap-4 min-h-0">
                  <div className="flex justify-between items-center shrink-0">
                    <div>
                      <h4 className="font-extrabold text-white text-sm">Active Fleet Radar Channels</h4>
                      <p className="text-[9.5px] text-slate-500 font-semibold mt-0.5">Select a pre-cleared chauffeur online to dispatch them directly.</p>
                    </div>
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9.5px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      5 Online
                    </span>
                  </div>

                  {/* Lists of cars */}
                  <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[380px] pr-1">
                    {ACTIVE_FLEET.map((fleetCar) => {
                      const correspondsActiveOption = VEHICLE_OPTIONS.find(v => v.id === fleetCar.tier);
                      const isRequestButtonDisabled = rideState !== 'idle';
                      
                      return (
                        <div
                          key={fleetCar.id}
                          className="bg-slate-900 p-3 rounded-xl border border-slate-850 hover:border-slate-750 transition-all flex justify-between items-center gap-4"
                        >
                          <div className="min-w-0 flex-1">
                            {/* Header row */}
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-[10.5px] font-bold text-slate-100">{fleetCar.driver}</span>
                              <span className="text-[8px] font-extrabold uppercase bg-slate-805 text-slate-400 p-0.5 px-1.5 rounded border border-slate-750">
                                {fleetCar.tier === 'uberx' ? 'UberX' : fleetCar.tier === 'uberexec' ? 'Mercedes EQS' : 'Sovereign Lux'}
                              </span>
                              <span className="text-[8px] font-extrabold text-amber-400 flex items-center font-mono">
                                ★ {fleetCar.rating}
                              </span>
                            </div>

                            {/* Sub header details */}
                            <div className="text-[9.5px] text-slate-400 mt-1 font-mono">
                              Car: {fleetCar.carModel} • <span className="text-indigo-400">{fleetCar.locationName}</span>
                            </div>

                            {/* Mini action to view bio */}
                            <button
                              type="button"
                              onClick={() => {
                                const profile = MOCK_DRIVERS_PROFILE[fleetCar.driver as keyof typeof MOCK_DRIVERS_PROFILE];
                                if (profile) {
                                  setSelectedDriverProfile({ ...profile, name: fleetCar.driver });
                                }
                              }}
                              className="text-[9px] text-indigo-400 hover:text-indigo-300 font-bold bg-transparent border-none p-0 mt-1 cursor-pointer hover:underline text-left"
                            >
                              Inspect credentials ➔
                            </button>
                          </div>

                          {/* Direct request dispatch trigger */}
                          <div className="text-right shrink-0 flex flex-col gap-1 items-end">
                            <div className="text-xs font-bold text-emerald-400 font-mono">Est: ${calculatedPrice(fleetCar.priceEstimate).toFixed(2)}</div>
                            
                            <button
                              disabled={isRequestButtonDisabled}
                              onClick={async () => {
                                if (correspondsActiveOption) {
                                  // Assign vehicle template
                                  setSelectedVehicle({
                                    ...correspondsActiveOption,
                                    driver: fleetCar.driver,
                                    carModel: fleetCar.carModel,
                                    rating: fleetCar.rating
                                  });
                                  
                                  // Update mapping coords
                                  setMapCenter(fleetCar.coords);
                                  
                                  // Dismiss modal
                                  setShowDriverFleetModal(false);
                                  toast.success(`Active Dispatch Lock: Sovereign Chauffeur ${fleetCar.driver} bound to current telemetry!`);
                                  
                                  // Automatically initiate request ride flow!
                                  setTimeout(() => {
                                    handleRequestRide();
                                  }, 300);
                                }
                              }}
                              className={`py-1 px-2 text-[9.5px] font-black uppercase tracking-wider rounded-lg border-none cursor-pointer transition-all ${
                                isRequestButtonDisabled
                                  ? 'bg-slate-800 text-slate-500 opacity-50 cursor-not-allowed'
                                  : 'bg-white text-black hover:bg-slate-200 shadow shadow-white/10 active:scale-95'
                              }`}
                              title={isRequestButtonDisabled ? "Can only direct dispatch in IDLE state" : "Direct request this chauffeur"}
                            >
                              Dispatch
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Modal footer credentials notice */}
              <div className="bg-black/40 border-t border-slate-850 p-4 text-center">
                <span className="text-[9.5px] text-slate-505 font-mono flex items-center justify-center gap-1">
                  🛡️ CommBank Security Protocol: All active chauffeurs have locked telemetry codes. Verified via Valourian Vault VIP clearing node.
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 📜 SOVEREIGN TRIP HISTORY MODAL */}
      <AnimatePresence>
        {showTripHistoryModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-md z-[9999] flex items-center justify-center p-4 focus:outline-none"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-slate-900 border border-slate-800 rounded-[2rem] w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl flex flex-col text-left"
            >
              {/* Header */}
              <div className="bg-black/40 border-b border-slate-800 p-5 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                    <History className="w-5 h-5 text-indigo-400" />
                    Sovereign Trip History Logger
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Clearing-house logs of all completed premium chauffeured voyages.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTripHistoryModal(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-450 hover:text-white h-7 w-7 rounded-full flex items-center justify-center border-none cursor-pointer transition-colors text-xs font-bold font-sans"
                >
                  ✕
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {completedTrips.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-slate-800 rounded-[1.5rem] bg-black/20">
                    <History className="w-10 h-10 text-slate-600 mb-2 stroke-1 animate-pulse" />
                    <span className="text-sm font-bold text-slate-400">Empty Historical Ledger</span>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
                      No previous completed trips found registered inside Firestore database for your ledger profile.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {completedTrips.map((trip) => {
                      const startDate = new Date(trip.startTime);
                      const endDate = new Date(trip.endTime);
                      const formattedDate = startDate.toLocaleDateString(undefined, {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      });
                      const durationMins = Math.round((endDate.getTime() - startDate.getTime()) / 60000);
                      
                      return (
                        <div 
                          key={trip.id}
                          className="bg-slate-950 p-4 rounded-2xl border border-slate-850 hover:border-slate-800 transition-all flex flex-col gap-2 relative group"
                        >
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <span className="text-[9.5px] text-indigo-405 font-mono font-bold leading-none block text-indigo-400">
                                {formattedDate}
                              </span>
                              <h4 className="font-extrabold text-slate-100 text-sm mt-1">
                                {trip.driverName || "Chauffeur Co-op"} • <span className="text-slate-400 font-normal">{trip.carModel || "Executive EV"}</span>
                              </h4>
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-black text-emerald-400 font-mono leading-none">
                                AUD ${(trip.cost || 0).toFixed(2)}
                              </span>
                              <span className="text-[9px] text-slate-500 font-mono block mt-1">
                                {trip.distance || "12.0 km"} • {durationMins > 0 ? `${durationMins} mins` : "15 mins"}
                              </span>
                            </div>
                          </div>

                          <div className="border-t border-slate-850 pt-2 mt-1 text-[11px] text-slate-450 space-y-1">
                            <div className="flex items-center gap-1.5 text-slate-400">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                              <span className="truncate"><strong>From:</strong> {trip.pickup}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-400 border-none p-0">
                              <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                              <span className="truncate"><strong>To:</strong> {trip.destination}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="bg-black/40 border-t border-slate-850 p-4 text-center">
                <span className="text-[9.5px] text-slate-500 font-mono">
                  🚨 Ledger Audited: Decentrally cleared on sovereign Valourian-9 node protocols.
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showSosAlertModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-red-955/80 backdrop-blur-md z-[10000] flex items-center justify-center p-4 focus:outline-none"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-slate-950 border border-red-500/30 rounded-[2rem] w-full max-w-sm p-6 overflow-hidden shadow-2xl flex flex-col items-center text-center space-y-4"
            >
              <div className="w-14 h-14 bg-red-505/10 border-2 border-red-550/30 rounded-full flex items-center justify-center animate-bounce">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              
              <div>
                <h3 className="text-base font-black text-white uppercase tracking-widest text-red-500">SOS Rescue Active</h3>
                <p className="text-[10.5px] text-slate-400 mt-1 leading-normal">
                  Sovereign Emergency Protocols are online. Real-time satellite telemetry has been recorded to private firestore ledgers.
                </p>
              </div>

              <div className="w-full bg-slate-900 border border-slate-850 p-3 rounded-xl space-y-1.5 text-left font-mono text-[10px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Telemetry Info:</span>
                  <span className="text-red-400 font-bold animate-pulse">BROADCAST ACTIVE</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Alert Contact:</span>
                  <span className="text-rose-450 font-bold">{emergencyContactName} ({emergencyContactPhone})</span>
                </div>
                <div className="flex justify-between text-[9px]">
                  <span className="text-slate-500 leading-tight">Twilio SMS Status:</span>
                  <span className="text-right text-emerald-400 font-bold truncate max-w-[170px]" title={sosSmsMessageStatus}>
                    {sosSmsMessageStatus || "Syncing satellite gateway..."}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Driver Partner:</span>
                  <span className="text-slate-205">{selectedVehicle?.driver || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-505">Signal Coords:</span>
                  <span className="text-slate-200">
                    {pickupCoords ? `${pickupCoords.lat.toFixed(4)}, ${pickupCoords.lng.toFixed(4)}` : "Synchronizing..."}
                  </span>
                </div>
              </div>

              <div className="text-[9.5px] text-slate-500 italic">
                Sovereign Guard networks on alert. Call 000/911 if safe to do so.
              </div>

              <button
                type="button"
                onClick={() => setShowSosAlertModal(false)}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl text-xs uppercase cursor-pointer border-none shadow-lg active:scale-95 transition-all"
              >
                Dismiss Active Alarm
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <EmailPreviewModal data={previewEmail} onClose={() => setPreviewEmail(null)} />
    </div>
  );
}

function CrownIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z"/>
      <path d="M3 20h18"/>
    </svg>
  );
}
