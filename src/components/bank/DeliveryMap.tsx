import { MapErrorBoundary } from "./MapErrorBoundary";
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Compass, Shield, Gauge, Landmark, MapPin, Navigation, Activity, ZoomIn, ZoomOut, Layers, Box, Rotate3d, ChevronDown, Info, Flame, Bell, BellOff, AlertTriangle, Maximize, Minimize } from 'lucide-react';
import { motion, AnimatePresence, animate } from 'framer-motion';
import { GoogleMap, useJsApiLoader, DirectionsRenderer, Marker, TrafficLayer, Polyline, HeatmapLayer, OverlayViewF, OverlayView, Polygon, InfoWindow } from '@react-google-maps/api';
import toast from 'react-hot-toast';
import { db } from '../../firebase';
import { collection, getDocs, query } from 'firebase/firestore';

interface DeliveryMapProps {
  restaurantName?: string;
  originLabel?: string;
  storeName?: string;
  driverName?: string;
  originName?: string;
  destinationName?: string;
  type?: 'food' | 'retail' | 'ride';
  progress: number;
  latitude?: number;
  longitude?: number;
}

// Ensure you load a valid api key via your env vars for real maps
const containerStyle = {
  width: '100%',
  height: '320px',
  borderRadius: '16px'
};

const LIBRARIES: any = ["visualization"];

const RESTAURANT_LOCATIONS: Record<string, { lat: number, lng: number }> = {
  "Quay Sydney": { lat: -33.8587, lng: 151.2115 },
  "Aria Restaurant": { lat: -33.8592, lng: 151.2133 },
  "Nobu Sydney": { lat: -33.8618, lng: 151.1995 },
  "Maisy's 24 Hour Diner": { lat: -33.8340, lng: 151.2175 },
  "Golden Century Midnight": { lat: -33.8785, lng: 151.2032 }
};


const SOVEREIGN_LANDMARKS = [
  { id: 'sov-1', name: 'Valourian Central Treasury', lat: -33.8688, lng: 151.2093, type: 'hq' },
  { id: 'sov-2', name: 'AURA-9 Data Center (Sector 4)', lat: -33.8568, lng: 151.2153, type: 'data' },
  { id: 'sov-3', name: 'Valourian Sovereign Vault', lat: -33.8720, lng: 151.2030, type: 'vault' }
];

const DESTINATION_COORD = { lat: -33.8675, lng: 151.2070 };

const RESTRICTED_ZONES = [
  {
    id: "zone-alpha",
    name: "Sector Alpha - Executive Blockade",
    color: "#ef4444",
    paths: [
      { lat: -33.8610, lng: 151.2070 },
      { lat: -33.8610, lng: 151.2110 },
      { lat: -33.8645, lng: 151.2110 },
      { lat: -33.8645, lng: 151.2070 }
    ]
  },
  {
    id: "zone-bravo",
    name: "Sector Bravo - Sovereign Vault Perimeter",
    color: "#f59e0b",
    paths: [
      { lat: -33.8660, lng: 151.2085 },
      { lat: -33.8660, lng: 151.2105 },
      { lat: -33.8680, lng: 151.2105 },
      { lat: -33.8680, lng: 151.2085 }
    ]
  }
];

function isPointInPolygon(point: {lat: number, lng: number}, vs: {lat: number, lng: number}[]) {
  let x = point.lng, y = point.lat;
  let inside = false;
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    let xi = vs[i].lng, yi = vs[i].lat;
    let xj = vs[j].lng, yj = vs[j].lat;
    let intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

function calculateBearing(lat1: number, lon1: number, lat2: number, lon2: number) {
  const dLng = (lon2 - lon1) * Math.PI / 180;
  const lat1Rad = lat1 * Math.PI / 180;
  const lat2Rad = lat2 * Math.PI / 180;
  const y = Math.sin(dLng) * Math.cos(lat2Rad);
  const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLng);
  let brng = Math.atan2(y, x) * 180 / Math.PI;
  return Math.round((brng + 360) % 360);
}

const nightModeStyle = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#263c3f" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6b9a76" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#38414e" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#212a37" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9ca5b3" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#746855" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1f2835" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#f3d19c" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#2f3948" }],
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#17263c" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#515c6d" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#17263c" }],
  },
];

function DeliveryMapInner({ restaurantName, storeName, driverName, originName, destinationName, type = 'food', progress, latitude, longitude }: DeliveryMapProps) {
    const originLabel = originName || storeName || restaurantName || 'Origin';
    const destLabel = destinationName || 'Asim Aryal - 712, 15 Barton Rd, Artarmon NSW 2064 Australia';
  
  const [directionsResponse, setDirectionsResponse] = useState<google.maps.DirectionsResult | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showTraffic, setShowTraffic] = useState(false);
  const [fetchingTraffic, setFetchingTraffic] = useState(false);
  const [mapZoom, setMapZoom] = useState(14);
  const [mapViewType, setMapViewType] = useState<'roadmap' | 'satellite' | 'terrain' | 'night'>('roadmap');
  const [isLayerMenuOpen, setIsLayerMenuOpen] = useState(false);
  const [isTilted, setIsTilted] = useState(false);
  const [trafficLevel, setTrafficLevel] = useState<'free-flowing' | 'minor-delays' | 'accident-ahead'>('free-flowing');
  const [isLegendExpanded, setIsLegendExpanded] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [heatmapData, setHeatmapData] = useState<google.maps.LatLng[]>([]);
  const [fetchingHeatmap, setFetchingHeatmap] = useState(false);
  const [heatmapPulseOptions, setHeatmapPulseOptions] = useState({ radius: 30, opacity: 0.8 });
  const [etaNotificationEnabled, setEtaNotificationEnabled] = useState(false);
  const [hasSentNotification, setHasSentNotification] = useState(false);
  const [showRestrictedZones, setShowRestrictedZones] = useState(true);
  const [routingAlgorithm, setRoutingAlgorithm] = useState<"fastest" | "secure">("fastest");
  const [showSovereignLandmarks, setShowSovereignLandmarks] = useState(true);
  const [selectedZone, setSelectedZone] = useState<typeof RESTRICTED_ZONES[0] | null>(null);
  const [activeRestrictedZoneId, setActiveRestrictedZoneId] = useState<string | null>(null);
  
  const [telemetry, setTelemetry] = useState({
    lat: latitude !== undefined ? latitude : 0,
    lng: longitude !== undefined ? longitude : 0,
    speed: 0,
    heading: 0,
    distanceRem: 0
  });

  useEffect(() => {
    if (telemetry.lat && telemetry.lng) {
      const pt = { lat: telemetry.lat, lng: telemetry.lng };
      let foundZone = null;
      for (const zone of RESTRICTED_ZONES) {
        if (isPointInPolygon(pt, zone.paths)) {
          foundZone = zone;
          break;
        }
      }
      
      if (foundZone) {
        if (activeRestrictedZoneId !== foundZone.id) {
          setActiveRestrictedZoneId(foundZone.id);
          toast.error(`ALERT: Courier entered restricted security ${foundZone.name}!`, { icon: <AlertTriangle className="w-5 h-5 text-red-500" /> });
        }
      } else {
        if (activeRestrictedZoneId !== null) {
          setActiveRestrictedZoneId(null);
        }
      }
    }
  }, [telemetry.lat, telemetry.lng, activeRestrictedZoneId]);

  useEffect(() => {
    if (!showHeatmap) return;
    const animation = animate(0, 1, {
      duration: 1.5,
      repeat: Infinity,
      repeatType: "reverse",
      ease: "easeInOut",
      onUpdate: (latest) => {
        setHeatmapPulseOptions({
          radius: 30 + (latest * 15),
          opacity: 0.8 + (latest * 0.15)
        });
      }
    });
    return () => animation.stop();
  }, [showHeatmap]);

  const fetchHeatmapData = async () => {
    if (heatmapData.length > 0) return;
    setFetchingHeatmap(true);
    try {
      const q = query(collection(db, "transactions"));
      const snapshot = await getDocs(q);
      const points: google.maps.LatLng[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.recipient && data.recipient.includes("Uber Eats")) {
          const originLabelMatch = Object.keys(RESTAURANT_LOCATIONS).find(name => data.recipient.includes(name));
          const baseLoc = originLabelMatch ? RESTAURANT_LOCATIONS[originLabelMatch] : DESTINATION_COORD;
          const randomLat = baseLoc.lat + (Math.random() - 0.5) * 0.04;
          const randomLng = baseLoc.lng + (Math.random() - 0.5) * 0.04;
          if (window.google) {
            points.push(new window.google.maps.LatLng(randomLat, randomLng));
          }
        }
      });
      // Fallback dummy points if no real transactions found
      if (points.length === 0 && window.google) {
        for (let i = 0; i < 50; i++) {
           points.push(new window.google.maps.LatLng(DESTINATION_COORD.lat + (Math.random() - 0.5) * 0.05, DESTINATION_COORD.lng + (Math.random() - 0.5) * 0.05));
        }
      }
      setHeatmapData(points);
    } catch (e) {
      console.error(e);
    } finally {
      setFetchingHeatmap(false);
    }
  };

  const dynamicEta = useMemo(() => {
    if (progress === 100) return "Delivered";
    if (progress === 0) return "Awaiting Dispatch";
    const baseMins = Math.max(1, Math.round(18 * (1 - progress / 100)));
    let calculated = baseMins;
    if (trafficLevel === 'minor-delays') {
      calculated = Math.round(baseMins * 1.4) + 2;
    } else if (trafficLevel === 'accident-ahead') {
      calculated = Math.round(baseMins * 2.1) + 7;
    }
    return `${calculated} mins`;
  }, [progress, trafficLevel]);

  useEffect(() => {
    if (etaNotificationEnabled && progress > 0 && progress < 100) {
      const etaMins = parseInt(dynamicEta);
      if (!isNaN(etaMins) && etaMins <= 2 && !hasSentNotification) {
        const sendNotif = () => {
          new Notification("Courier Arriving Soon!", {
            body: `Your delivery from ${originLabel} is arriving in less than 2 minutes.`,
          });
          setHasSentNotification(true);
        };
        
        if ("Notification" in window) {
          if (Notification.permission === "granted") {
            sendNotif();
          } else if (Notification.permission !== "denied") {
            Notification.requestPermission().then(permission => {
              if (permission === "granted") {
                sendNotif();
              }
            });
          }
        }
      }
    }
  }, [etaNotificationEnabled, dynamicEta, progress, hasSentNotification, originLabel]);

  useEffect(() => {
    if (progress === 0 || progress === 100) {
      setHasSentNotification(false);
    }
  }, [progress]);

  useEffect(() => {
    if (map) {
      map.setTilt(isTilted ? 45 : 0);
    }
  }, [map, isTilted]);

  useEffect(() => {
    setMapZoom(progress > 0 && progress < 100 ? 16 : 14);
  }, [progress]);

  const handleZoomIn = () => {
    if (map) {
      const currentZoom = map.getZoom() || mapZoom;
      const nextZoom = Math.min(currentZoom + 1, 20);
      map.setZoom(nextZoom);
      setMapZoom(nextZoom);
    } else {
      setMapZoom((prev) => Math.min(prev + 1, 20));
    }
  };

  const handleZoomOut = () => {
    if (map) {
      const currentZoom = map.getZoom() || mapZoom;
      const nextZoom = Math.max(currentZoom - 1, 1);
      map.setZoom(nextZoom);
      setMapZoom(nextZoom);
    } else {
      setMapZoom((prev) => Math.max(prev - 1, 1));
    }
  };
  
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY || (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY || '',
    libraries: LIBRARIES
  });

  
  React.useEffect(() => {
    if (loadError) {
      console.warn("Google Maps loadError:", loadError);
      window.dispatchEvent(new Event("gm_authFailure"));
    }
  }, [loadError]);
  
  const originCoord = useMemo(() => {
    if (type === 'retail') return { lat: -33.8688, lng: 151.2093 };
    if (type === 'ride') return { lat: -33.8568, lng: 151.2153 };
    return RESTAURANT_LOCATIONS[originLabel] || RESTAURANT_LOCATIONS["Quay Sydney"];
  }, [originLabel]);

  const congestionCoords = useMemo(() => {
    const latDiff = DESTINATION_COORD.lat - originCoord.lat;
    const lngDiff = DESTINATION_COORD.lng - originCoord.lng;
    return [
      { lat: originCoord.lat + latDiff * 0.4, lng: originCoord.lng + lngDiff * 0.4 },
      { lat: originCoord.lat + latDiff * 0.5, lng: originCoord.lng + lngDiff * 0.5 },
      { lat: originCoord.lat + latDiff * 0.6, lng: originCoord.lng + lngDiff * 0.6 },
    ];
  }, [originCoord]);

  const fetchDirections = useCallback(async () => {
    if (!window.google) return;
    const directionsService = new google.maps.DirectionsService();
    try {
      const results = await directionsService.route({
        origin: originCoord,
        destination: DESTINATION_COORD,
        travelMode: google.maps.TravelMode.BICYCLING,
      });
      setDirectionsResponse(results);
    } catch (err) {
      console.error("Error fetching directions", err);
    }
  }, [originCoord]);

  useEffect(() => {
    if (isLoaded) {
      fetchDirections();
    }
  }, [isLoaded, fetchDirections]);

  // Telemetry indicators
  useEffect(() => {
    const startToEndDist = 1850; 
    const pct = progress / 100;
    const distanceRem = Math.max(0, Math.round(startToEndDist * (1 - pct)));
    const currentSpeed = pct <= 0 || pct >= 1 ? 0 : Math.round(42 + Math.sin(pct * Math.PI * 4) * 6);

    // Calculate heading/bearing between originCoord and destination
    let headingVal = 0;
    if (progress > 0 && progress < 100) {
      const baseBearing = calculateBearing(originCoord.lat, originCoord.lng, DESTINATION_COORD.lat, DESTINATION_COORD.lng);
      // Gentle swing/vibration oscillation to feel alive
      const wander = Math.sin(progress * 1.5) * 8;
      headingVal = Math.round((baseBearing + wander + 360) % 360);
    } else if (progress === 100) {
      headingVal = 0;
    } else {
      headingVal = calculateBearing(originCoord.lat, originCoord.lng, DESTINATION_COORD.lat, DESTINATION_COORD.lng);
    }

    
    

    setTelemetry((prev) => {
      // Smooth transition using Framer Motion animate
      if (latitude !== undefined && longitude !== undefined) {
        animate(prev.lat || latitude, latitude, {
          duration: 1.2,
          ease: "linear",
          onUpdate: (val) => setTelemetry(t => ({ ...t, lat: val }))
        });
        animate(prev.lng || longitude, longitude, {
          duration: 1.2,
          ease: "linear",
          onUpdate: (val) => setTelemetry(t => ({ ...t, lng: val }))
        });
      }

      return {
        lat: prev.lat, 
        lng: prev.lng, 
        heading: headingVal || (latitude ? 12 : 0), 
        speed: currentSpeed,
        distanceRem: distanceRem
      };
    });

  }, [progress, latitude, longitude, originCoord]);

  // Subtle Map Camera "Pan-Along" tracking effect following the courier coordinate
  useEffect(() => {
    if (map && telemetry.lat && telemetry.lng) {
      const isTransit = progress > 0 && progress < 100;
      const targetLatLng = { lat: telemetry.lat, lng: telemetry.lng };
      
      // Pan to the new coordinate with a smooth Google Maps pan animation
      map.panTo(targetLatLng);

      // Dynamically adjust zoom: closer look (16) during transit, broader context (14-15) otherwise
      if (progress === 0) {
        map.setZoom(14);
      } else if (isTransit) {
        map.setZoom(16);
      } else if (progress === 100) {
        map.setZoom(15);
      }
    }
  }, [map, telemetry.lat, telemetry.lng, progress]);

  // Normalize route coordinate locations to responsive vector layout bounds (300 width x 100 height)
  // For safety since we removed leaflet explicit route let's just use the start and end as fallback
  const svgPoints = [
    `20,80`,
    `280,20`
  ];
  
  const activeX = 20 + ((telemetry.lng - originCoord.lng) / ((DESTINATION_COORD.lng - originCoord.lng) || 0.0001)) * 260;
  const activeY = 80 - ((telemetry.lat - originCoord.lat) / ((DESTINATION_COORD.lat - originCoord.lat) || 0.0001)) * 60;

  const toggleFullscreen = () => {
    const mapContainer = document.getElementById('delivery-map-container');
    if (!mapContainer) return;
    
    if (!document.fullscreenElement) {
      mapContainer.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        toast.error(`Error attempting to enable fullscreen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div className="space-y-4 relative font-sans">
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5 font-sans">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          REAL-TIME GPS TELEMETRY
        </span>
        <span className="text-[9px] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
          {progress < 100 ? `TRACKING DISPATCH: ${progress}%` : 'COURIER REACHED DESTINATION'}
        </span>
      </div>

      <div 
        id="delivery-map-container"
        className={`relative w-full overflow-hidden shadow-md delivery-map-container ${isFullscreen ? 'h-screen w-screen rounded-none border-none' : 'rounded-2xl border border-slate-200'}`}
        role="application"
        aria-label={`Live Courier Delivery Tracking Map. Tracking courier from ${originLabel} to destLabel.`}
      >
        {/* Screen Reader Live Announcements and Accessibility Context */}
        <div className="sr-only" aria-live="polite">
          <p>
            Delivery Tracking Map from {originLabel} to destLabel.
            Current status: {progress === 0 
              ? "Awaiting courier dispatch" 
              : progress === 100 
                ? "Courier has arrived at destLabel. Please confirm delivery." 
                : `In transit. Courier is ${progress}% along the route, traveling at ${telemetry.speed} km/h with bearing ${telemetry.heading} degrees. Estimated arrival in ${Math.max(1, Math.round(18 * (1 - progress/100)))} minutes.`
            }
            Current location latitude: {telemetry.lat.toFixed(6)}, longitude: {telemetry.lng.toFixed(6)}.
            Remaining distance: {telemetry.distanceRem} meters.
            Traffic heatmap is currently {showTraffic ? "visible showing high congestion nodes in red" : "hidden"}.
            Map zoom level is {mapZoom}. Map view style is {mapViewType === "roadmap" ? "standard road map" : mapViewType === "satellite" ? "satellite hybrid imagery" : mapViewType === "terrain" ? "terrain view" : "night mode view"}. Map tilt perspective is {isTilted ? "3D tilted isometric (45 degrees)" : "flat 2D overhead (0 degrees)"}.
          </p>
        </div>

        {/* Floating 'Navigate to Delivery' action button */}
        <div className="absolute top-3 left-3 z-[1000] flex flex-col gap-2">
          <a
            id="navigate-delivery-gps-anchor"
            href={`https://www.google.com/maps/dir/?api=1&destination=${DESTINATION_COORD.lat},${DESTINATION_COORD.lng}&travelmode=bicycling`}
            target="_blank"
            referrerPolicy="no-referrer"
            rel="noopener noreferrer"
            className="bg-white/95 backdrop-blur-xs hover:bg-slate-50 text-slate-900 border border-slate-200 p-2 px-3 rounded-xl shadow-md flex items-center gap-1.5 transition-all active:scale-95 text-[9px] font-black tracking-widest uppercase cursor-pointer no-underline select-none"
            aria-label="Open external GPS navigation in Google Maps"
          >
            <Navigation className="w-3 h-3 text-emerald-600 animate-bounce" aria-hidden="true" />
            Navigate to Delivery
          </a>
          
          <div className="bg-white/95 backdrop-blur-xs border border-slate-200 rounded-xl shadow-md overflow-hidden flex flex-col">
            <button
              onClick={() => setRoutingAlgorithm('fastest')}
              className={`px-3 py-2 text-[9px] font-black tracking-widest uppercase text-left transition-colors flex items-center gap-2 ${routingAlgorithm === 'fastest' ? 'bg-emerald-50 text-emerald-700 border-b border-emerald-100' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <Activity className={`w-3 h-3 ${routingAlgorithm === 'fastest' ? 'text-emerald-500' : ''}`} />
              Fastest Route
            </button>
            <button
              onClick={() => setRoutingAlgorithm('secure')}
              className={`px-3 py-2 text-[9px] font-black tracking-widest uppercase text-left transition-colors flex items-center gap-2 ${routingAlgorithm === 'secure' ? 'bg-blue-50 text-blue-700 border-b border-blue-100' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <Shield className={`w-3 h-3 ${routingAlgorithm === 'secure' ? 'text-blue-500' : ''}`} />
              Most Secure
            </button>
          </div>
        </div>
          

        {/* Live ETA Badge - dynamically updates along the route */}
        <div 
          className="absolute top-[52px] left-3 z-[1000] bg-emerald-600/95 backdrop-blur-md text-white border border-emerald-400/30 p-1.5 px-2.5 rounded-xl shadow-lg flex items-center gap-1.5 transition-all text-[8px] font-black tracking-widest uppercase select-none"
          role="status"
          aria-live="polite"
          aria-label={`Live Estimated Time of Arrival: ${progress === 0 ? "Awaiting Dispatch" : progress === 100 ? "Delivered" : `${Math.max(1, Math.round(18 * (1 - progress/100)))} minutes`}`}
        >
          <span className="relative flex h-2 w-2" aria-hidden="true">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
          </span>
          Live ETA: {progress === 0 ? "Awaiting Dispatch" : progress === 100 ? "Delivered" : `${Math.max(1, Math.round(18 * (1 - progress/100)))} mins`}
        </div>

        {/* Local Push-Style Notification (Triggers when progress reaches 100%) */}
        <AnimatePresence>
          {progress === 100 && (
            <motion.div
              initial={{ opacity: 0, y: -40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: "tween", stiffness: 120, damping: 15 }}
              className="absolute top-4 left-1/2 -translate-x-1/2 z-[1100] w-[92%] max-w-[320px] bg-slate-950/95 backdrop-blur-md border-2 border-emerald-500 text-white p-3.5 rounded-xl shadow-[0_15px_40px_rgba(16,185,129,0.35)] flex items-start gap-3"
              role="alert"
              aria-labelledby="arrival-alert-title"
              aria-describedby="arrival-alert-desc"
            >
              <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center text-white text-lg animate-bounce shrink-0 shadow-lg shadow-emerald-500/20 select-none" aria-hidden="true">
                📦
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[8px] font-black uppercase text-emerald-400 tracking-wider">Local Alert</span>
                  <span className="text-[7.5px] font-mono text-slate-400 bg-white/10 px-1 py-0.5 rounded">Just Now</span>
                </div>
                <h4 id="arrival-alert-title" className="text-[11px] font-black text-white mt-0.5">Order Reached Destination!</h4>
                <p id="arrival-alert-desc" className="text-[9px] text-slate-200 mt-1 leading-normal font-medium">
                  The Valourian courier has completed transit from {originLabel || 'the chef'} and arrived at destLabel checkpoint.
                </p>
                <div className="mt-2 flex gap-1.5">
                  <button 
                    onClick={() => {
                      alert("Order pickup successfully verified. Bon Appétit, Founder!");
                    }}
                    className="bg-emerald-500 hover:bg-emerald-600 transition-colors text-white text-[7.5px] font-black uppercase tracking-wider py-1 px-2.5 rounded-lg active:scale-95 cursor-pointer"
                    aria-label="Confirm Courier Delivery Check-in"
                  >
                    Confirm Delivery
                  </button>
                  <button 
                    onClick={() => {
                      alert("Securing perimeter. Courier returns to base.");
                    }}
                    className="bg-white/10 hover:bg-white/15 transition-colors text-slate-300 text-[7.5px] font-black uppercase tracking-wider py-1 px-2.5 rounded-lg active:scale-95 cursor-pointer"
                    aria-label="Release Courier Unit"
                  >
                    Release Courier
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Real-Time Traffic & ETA Overlay with Sovereign Mission Details */}
        <div 
          className="absolute top-3 right-3 z-[1000] max-w-[210px] sm:max-w-[240px] bg-slate-950/90 backdrop-blur-md border border-white/10 rounded-xl p-3 text-white shadow-2xl flex flex-col gap-2.5"
          role="region"
          aria-label="Live Transit HUD and Route Info"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
            <span className="text-[8px] font-black uppercase text-emerald-400 tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true"></span>
              Live Transit HUD
            </span>
            <span className="text-[8px] font-mono font-bold text-slate-400">
              {progress > 0 && progress < 100 ? "Active Route" : progress === 100 ? "Completed" : "Standby"}
            </span>
          </div>

          {/* Traffic Condition Selection / Display */}
          <div className="space-y-1 bg-white/5 p-2 rounded-lg border border-white/5">
            <span className="text-[7px] font-black uppercase text-slate-400 tracking-wider block">Traffic Condition Mode</span>
            <div className="grid grid-cols-3 gap-1">
              {(['free-flowing', 'minor-delays', 'accident-ahead'] as const).map((level) => {
                const isSelected = trafficLevel === level;
                let label = "Free";
                if (level === 'minor-delays') label = "Minor";
                if (level === 'accident-ahead') label = "Incident";
                
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setTrafficLevel(level)}
                    className={`py-1 text-[8px] font-bold rounded border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-emerald-600 border-emerald-500 text-white font-extrabold"
                        : "bg-transparent border-transparent text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ETA & Traffic conditions (Always visible, highly responsive during transit status) */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-baseline">
              <span className="text-[8px] font-semibold text-slate-400 uppercase tracking-wider">Est. Arrival Time</span>
              <span className="text-xs font-black font-mono text-white" aria-live="polite">
                {dynamicEta}
              </span>
            </div>

            <div className="flex justify-between items-baseline">
              <span className="text-[8px] font-semibold text-slate-400 uppercase tracking-wider">Traffic Condition</span>
              <span className={`text-[9px] font-bold font-mono ${
                trafficLevel === 'free-flowing'
                  ? "text-emerald-400"
                  : trafficLevel === 'minor-delays'
                    ? "text-amber-400"
                    : "text-red-400 animate-pulse"
              }`} aria-live="polite">
                {trafficLevel === 'free-flowing'
                  ? "Free-flowing"
                  : trafficLevel === 'minor-delays'
                    ? "Minor Delays"
                    : "Accident Ahead"}
              </span>
            </div>

            <button
              onClick={() => {
                setFetchingTraffic(true);
                setTimeout(() => {
                  setShowTraffic(!showTraffic);
                  setFetchingTraffic(false);
                }, 600);
              }}
              className={`w-full py-1.5 px-2.5 rounded-lg border text-[8px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 active:scale-98 ${
                showTraffic 
                  ? "bg-red-500/20 border-red-500/45 text-red-200 hover:bg-red-500/30" 
                  : "bg-white/10 border-white/10 text-white hover:bg-white/15"
              }`}
              aria-pressed={showTraffic}
              aria-label="Toggle live traffic heat map overlay on Google map"
            >
              {fetchingTraffic ? (
                <>
                  <span className="w-2 h-2 rounded-full border border-current border-t-transparent animate-spin" aria-hidden="true"></span>
                  Syncing Live Data...
                </>
              ) : (
                <>
                  <Activity className="w-3 h-3 text-red-400 animate-pulse" aria-hidden="true" />
                  {showTraffic ? "Hide Traffic Heatmap" : "Toggle Traffic"}
                </>
              )}
            </button>

            <button
              onClick={() => {
                if (map && telemetry.lat && telemetry.lng) {
                  map.panTo({ lat: telemetry.lat, lng: telemetry.lng });
                  map.setZoom(16);
                }
              }}
              className="w-full py-1.5 px-2.5 mt-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/20 text-indigo-200 hover:bg-indigo-500/30 text-[8px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 active:scale-98 cursor-pointer"
              aria-label="Re-center the map view on the courier's current coordinates"
            >
              <Compass className="w-3 h-3 text-indigo-400 animate-[spin_6s_linear_infinite]" aria-hidden="true" />
              Center on Courier
            </button>

            <button
              onClick={async () => {
                if (!showHeatmap) {
                   await fetchHeatmapData();
                }
                setShowHeatmap(!showHeatmap);
              }}
              className={`w-full py-1.5 px-2.5 mt-1.5 rounded-lg border text-[8px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 active:scale-98 cursor-pointer ${
                showHeatmap 
                  ? "bg-purple-500/20 border-purple-500/45 text-purple-200 hover:bg-purple-500/30" 
                  : "bg-white/10 border-white/10 text-white hover:bg-white/15"
              }`}
              aria-pressed={showHeatmap}
              aria-label="Toggle Traffic Surge Heatmap overlay on Google map"
            >
              {fetchingHeatmap ? (
                <>
                  <span className="w-2 h-2 rounded-full border border-current border-t-transparent animate-spin" aria-hidden="true"></span>
                  Loading...
                </>
              ) : (
                <>
                  <Flame className={`w-3 h-3 ${showHeatmap ? "text-purple-400 animate-pulse" : "text-slate-400"}`} aria-hidden="true" />
                  {showHeatmap ? "Hide Traffic Surge Heatmap" : "Traffic Surge Heatmap"}
                </>
              )}
            </button>
          </div>

          {/* Sovereign Corporate Mission & Business Plan Statement (Requested luxury/way of life detail) */}
          <div className="border-t border-white/5 pt-2 space-y-1">
            <span className="text-[7.5px] font-black uppercase tracking-widest text-[#06C167] block">VALOURIAN MISSION TARGET</span>
            <p className="text-[8px] text-slate-300 leading-normal font-sans font-medium">
              Elite culinary logistics enabling the Founder's peak cognitive performance and bio-availability. Sovereign standard, zero compromise.
            </p>
          </div>

          {/* Corporate Asset Domain Links */}
          <div className="border-t border-white/5 pt-1.5 flex flex-wrap gap-1.5" role="navigation" aria-label="Valourian Brand Network">
            <a 
              href="https://valourian.com" 
              target="_blank" 
              rel="noreferrer"
              className="text-[7.5px] font-black tracking-wider uppercase text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-0.5"
              aria-label="Visit main corporate gateway: valourian.com"
            >
              valourian.com
            </a>
            <span className="text-slate-600 text-[8px]" aria-hidden="true">•</span>
            <a 
              href="https://asimaus.co" 
              target="_blank" 
              rel="noreferrer"
              className="text-[7.5px] font-black tracking-wider uppercase text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-0.5"
              aria-label="Visit elite digital node: asimaus.co"
            >
              asimaus.co
            </a>
          </div>
        </div>

        {/* Map Interaction Control Stack (Top Left) */}
        <div className="absolute top-[92px] left-3 z-[1000] flex flex-col gap-1.5" role="group" aria-label="Map View Controls">
          
          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2 bg-slate-950/90 border border-white/10 rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center text-white hover:bg-slate-900"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            aria-label="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize className="w-3.5 h-3.5" aria-hidden="true" /> : <Maximize className="w-3.5 h-3.5" aria-hidden="true" />}
          </button>

          {/* Layer Toggle Menu */}
          <div className="relative">
            <button
              onClick={() => setIsLayerMenuOpen(!isLayerMenuOpen)}
              className={`p-2 border rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center ${
                isLayerMenuOpen || mapViewType !== 'roadmap'
                  ? "bg-emerald-600 border-emerald-500 text-white hover:bg-emerald-700"
                  : "bg-slate-950/90 hover:bg-slate-900 border-white/10 text-white"
              }`}
              title="Map Layers"
              aria-expanded={isLayerMenuOpen}
              aria-label="Toggle map layer options"
            >
              <Layers className="w-3.5 h-3.5" aria-hidden="true" />
            </button>

            {/* Dropdown for Layers */}
            <AnimatePresence>
              {isLayerMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, x: -10, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -10, scale: 0.95 }}
                  className="absolute top-0 left-12 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 w-40 flex flex-col gap-1"
                >
                  <button
                    onClick={() => { setMapViewType('roadmap'); setIsLayerMenuOpen(false); }}
                    className={`text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${mapViewType === 'roadmap' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-300 hover:bg-slate-800'}`}
                  >
                    Standard
                  </button>
                  <button
                    onClick={() => { setMapViewType('satellite'); setIsLayerMenuOpen(false); }}
                    className={`text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${mapViewType === 'satellite' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-300 hover:bg-slate-800'}`}
                  >
                    Satellite
                  </button>
                  <button
                    onClick={() => { setMapViewType('terrain'); setIsLayerMenuOpen(false); }}
                    className={`text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${mapViewType === 'terrain' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-300 hover:bg-slate-800'}`}
                  >
                    Terrain
                  </button>
                  <button
                    onClick={() => { setMapViewType('night'); setIsLayerMenuOpen(false); }}
                    className={`text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${mapViewType === 'night' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-300 hover:bg-slate-800'}`}
                  >
                    Night Mode
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Toggle Tilt 3D Isometric View Button */}
          <button
            onClick={() => setIsTilted((prev) => !prev)}
            className={`p-2 border rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center ${
              isTilted
                ? "bg-emerald-600 border-emerald-500 text-white hover:bg-emerald-700"
                : "bg-slate-950/90 hover:bg-slate-900 border-white/10 text-white"
            }`}
            title="Toggle Tilt (3D Isometric View)"
            aria-pressed={isTilted}
            aria-label="Toggle between flat 2D map view and tilted 3D isometric perspective view"
          >
            <Rotate3d className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
          
          {/* Toggle ETA Notification */}
          <button
            onClick={() => {
              if (!etaNotificationEnabled && "Notification" in window && Notification.permission === "default") {
                Notification.requestPermission();
              }
              setEtaNotificationEnabled(!etaNotificationEnabled);
            }}
            className={`p-2 border rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center ${
              etaNotificationEnabled
                ? "bg-emerald-600 border-emerald-500 text-white hover:bg-emerald-700"
                : "bg-slate-950/90 hover:bg-slate-900 border-white/10 text-white"
            }`}
            title="Toggle ETA Proximity Notification"
            aria-pressed={etaNotificationEnabled}
            aria-label="Toggle ETA Proximity Notification"
          >
            {etaNotificationEnabled ? <Bell className="w-3.5 h-3.5" aria-hidden="true" /> : <BellOff className="w-3.5 h-3.5" aria-hidden="true" />}
          </button>
        </div>

        {/* Leaflet-style Zoom Controls (Bottom Right) */}
        <div className="absolute bottom-6 right-3 z-[1000] flex flex-col shadow-md rounded-[4px] overflow-hidden border border-slate-300" role="group" aria-label="Zoom Controls">
          {/* Zoom In Button */}
          <button
            onClick={handleZoomIn}
            className="w-8 h-8 bg-white hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer flex items-center justify-center border-b border-slate-200 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            title="Zoom In"
            aria-label="Zoom Map In"
          >
            <span className="text-lg font-bold leading-none select-none">+</span>
          </button>
          
          {/* Zoom Out Button */}
          <button
            onClick={handleZoomOut}
            className="w-8 h-8 bg-white hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            title="Zoom Out"
            aria-label="Zoom Map Out"
          >
            <span className="text-xl font-bold leading-none select-none -mt-1">-</span>
          </button>
        </div>

        {/* Persistent, Retractable Floating Legend */}
        <div 
          className="absolute bottom-[92px] right-3 z-[1000] bg-slate-950/90 backdrop-blur-md border border-white/10 rounded-xl text-white shadow-xl flex flex-col gap-1.5 text-[9px] select-none transition-all duration-300"
          style={{ 
            width: isLegendExpanded ? '190px' : '40px', 
            height: isLegendExpanded ? 'auto' : '40px',
            padding: isLegendExpanded ? '10px' : '0' 
          }}
          role="region"
          aria-label="Tactical Map Symbol Legend"
        >
          {isLegendExpanded ? (
            <>
              <div className="flex items-center justify-between border-b border-white/10 pb-1">
                <span className="text-[8px] font-black uppercase text-emerald-400 tracking-wider">
                  Tactical Map Legend
                </span>
                <button 
                  onClick={() => setIsLegendExpanded(false)}
                  className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center justify-center"
                  title="Collapse Legend"
                  aria-label="Collapse Legend"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-1 gap-1.5 font-mono">
                <div className="flex items-center gap-2" aria-label={`Origin location: ${originLabel}`}>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 border border-white shrink-0" aria-hidden="true"></span>
                  <span className="text-slate-300 font-sans">Origin (Chef)</span>
                </div>
                <div className="flex items-center gap-2" aria-label="Delivery Drop-off Point">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white animate-pulse shrink-0" aria-hidden="true"></span>
                  <span className="text-slate-300 font-sans">Delivery Drop-off Point</span>
                </div>
                <div className="flex items-center gap-2" aria-label="Active Delivery Routes">
                  <span className="h-1 w-3.5 bg-[#06C167] rounded-sm shrink-0" aria-hidden="true"></span>
                  <span className="text-slate-300 font-sans">Active Delivery Route</span>
                </div>
                <div className="flex items-center gap-2" aria-label="Restricted Security Zones">
                  <span className="h-2.5 w-3.5 bg-red-500/50 border border-red-500 rounded-sm shrink-0" aria-hidden="true"></span>
                  <span className="text-slate-300 font-sans">Restricted Zones</span>
                </div>
                <div className="flex items-center justify-between mt-1 pt-1 border-t border-white/10" aria-label="Toggle Restricted Zones">
                  <span className="text-[9px] font-sans text-slate-400">Show Restricted Zones</span>
                  <button 
                    onClick={() => setShowRestrictedZones(!showRestrictedZones)}
                    className={`relative inline-flex h-3 w-5 items-center rounded-full transition-colors ${showRestrictedZones ? 'bg-red-500' : 'bg-slate-700'}`}
                  >
                    <span className={`inline-block h-2 w-2 transform rounded-full bg-white transition-transform ${showRestrictedZones ? 'translate-x-2.5' : 'translate-x-0.5'}`} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <button
              onClick={() => setIsLegendExpanded(true)}
              className="w-full h-full flex items-center justify-center hover:bg-white/10 rounded-xl text-emerald-400 hover:text-white transition-all cursor-pointer"
              title="Expand Legend"
              aria-label="Expand Legend"
            >
              <Info className="w-4 h-4 animate-pulse" />
            </button>
          )}
        </div>

        {/* The Google Map Container */}
        {isLoaded ? (
          <MapErrorBoundary fallback={<div className="w-full h-full min-h-[350px] rounded-2xl bg-slate-900 border border-emerald-500/20 flex flex-col items-center justify-center space-y-4"><span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span><span className="text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider">Tactical GPS Uplink Offline</span></div>}><GoogleMap
            mapContainerStyle={{
              width: '100%',
              height: isFullscreen ? '100vh' : '320px',
              borderRadius: isFullscreen ? '0px' : '16px'
            }}
            center={progress === 0 ? originCoord : { lat: telemetry.lat, lng: telemetry.lng }}
            zoom={mapZoom}
            mapTypeId={mapViewType === 'night' ? 'roadmap' : (mapViewType === 'satellite' ? 'hybrid' : mapViewType)}
            options={{ 
              disableDefaultUI: true, 
              gestureHandling: 'greedy', 
              tilt: isTilted ? 45 : 0,
              styles: mapViewType === 'night' ? nightModeStyle : undefined
            }}
            onLoad={(mapInstance) => setMap(mapInstance)}
            onUnmount={() => setMap(null)}
          >
            {directionsResponse && (
              <DirectionsRenderer
                directions={directionsResponse}
                options={{
                  suppressMarkers: true,
                  polylineOptions: { strokeColor: "#06C167", strokeWeight: 5 }
                }}
              />
            )}

            {showRestrictedZones && RESTRICTED_ZONES.map((zone) => (
              <Polygon
                key={zone.id}
                paths={zone.paths}
                onClick={() => setSelectedZone(zone)}
                options={{
                  fillColor: zone.color,
                  fillOpacity: activeRestrictedZoneId === zone.id ? 0.6 : 0.3,
                  strokeColor: zone.color,
                  strokeOpacity: 0.8,
                  strokeWeight: 2,
                  clickable: true,
                }}
              />
            ))}

            {selectedZone && (
              <InfoWindow
                position={{ lat: selectedZone.paths[0].lat, lng: selectedZone.paths[0].lng }}
                onCloseClick={() => setSelectedZone(null)}
              >
                <div className="p-1 max-w-[200px]">
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5 mb-1"><Shield className="w-4 h-4 text-red-500" /> {selectedZone.name}</h3>
                  <p className="text-xs text-slate-600">This area is under restricted security protocols. Unauthorized courier transit will trigger immediate alerts.</p>
                </div>
              </InfoWindow>
            )}

            {showRestrictedZones && RESTRICTED_ZONES.map((zone) => (
              <OverlayViewF
                key={`marker-${zone.id}`}
                position={zone.paths[0]}
                mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
              >
                <div className="relative flex items-center justify-center group" style={{ transform: 'translate(-50%, -50%)' }}>
                  <svg className="absolute w-32 h-32 animate-[spin_10s_linear_infinite] opacity-50 pointer-events-none" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke={zone.color} strokeWidth="1" strokeDasharray="4 8" />
                    <circle cx="50" cy="50" r="30" fill="none" stroke={zone.color} strokeWidth="0.5" className="animate-ping" style={{ animationDuration: '3s' }} />
                  </svg>
                  <button
                    onClick={() => setSelectedZone(zone)}
                    className="relative w-8 h-8 rounded-full border-2 shadow-[0_0_15px_rgba(239,68,68,0.6)] flex items-center justify-center hover:scale-110 transition-transform z-10"
                    style={{ backgroundColor: zone.color, borderColor: '#fff' }}
                    aria-label={`Restricted Zone: ${zone.name}`}
                  >
                    <Shield className="w-4 h-4 text-white" />
                  </button>
                  <div className="absolute top-full mt-2 whitespace-nowrap bg-slate-900/90 backdrop-blur px-2 py-1 rounded text-[9px] font-black tracking-widest text-white border border-slate-700/50 opacity-0 group-hover:opacity-100 transition-opacity">
                    {zone.name.toUpperCase()}
                  </div>
                </div>
              </OverlayViewF>
            ))}

            {/* Start Marker (Available Courier/Origin) */}
            <OverlayViewF
              position={originCoord}
              mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
            >
              <div className="relative -top-4 -left-4 w-8 h-8 bg-amber-500 rounded-full border-2 border-white shadow-[0_0_15px_rgba(245,158,11,0.5)] flex items-center justify-center" aria-label={`Available Courier / Origin: ${originLabel}`}>
                <Box className="w-4 h-4 text-white" />
              </div>
            </OverlayViewF>

            
            {/* Sovereign Landmarks */}
            {showSovereignLandmarks && SOVEREIGN_LANDMARKS.map(landmark => (
              <OverlayViewF
                key={landmark.id}
                position={{ lat: landmark.lat, lng: landmark.lng }}
                mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
              >
                <div className="relative flex flex-col items-center justify-center group" style={{ transform: 'translate(-50%, -100%)', marginTop: '-10px' }}>
                  <div className="bg-gradient-to-br from-amber-400 to-amber-600 p-1.5 rounded-lg border-2 border-slate-900 shadow-[0_0_15px_rgba(245,158,11,0.5)] z-10">
                    <Landmark className="w-4 h-4 text-slate-900" />
                  </div>
                  <div className="w-1 h-3 bg-slate-900 z-0"></div>
                  <div className="w-2 h-1 bg-slate-900/50 rounded-full blur-[2px]"></div>
                  
                  <div className="absolute bottom-full mb-2 whitespace-nowrap bg-slate-900/95 backdrop-blur-md px-3 py-1.5 rounded-lg text-[9px] font-black tracking-widest text-amber-400 border border-amber-500/30 opacity-0 group-hover:opacity-100 transition-opacity shadow-xl flex items-center gap-2 z-50">
                    <Shield className="w-3 h-3" />
                    {landmark.name.toUpperCase()}
                  </div>
                </div>
              </OverlayViewF>
            ))}

            {/* End Marker (Active Order) */}
            <OverlayViewF
              position={DESTINATION_COORD}
              mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
            >
              <div className="relative -top-4 -left-4 w-8 h-8 bg-emerald-500 rounded-full border-2 border-white shadow-[0_0_15px_rgba(16,185,129,0.5)] flex items-center justify-center animate-bounce" aria-label="Active Order Destination">
                <MapPin className="w-4 h-4 text-white" />
              </div>
            </OverlayViewF>
            {/* Current Position Marker with dynamic bearing and state */}
            <OverlayViewF
              position={{ lat: telemetry.lat, lng: telemetry.lng }}
              mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
            >
              <div 
                className="relative flex items-center justify-center pointer-events-none"
                style={{ transform: 'translate(-50%, -50%)' }}
                title={`Current Courier Position. Speed is ${telemetry.speed} km/h, bearing is ${telemetry.heading} degrees, with ${telemetry.distanceRem} meters remaining.`}
              >
                {/* Pulse animation when in transit */}
                {progress > 0 && progress < 100 && (
                  <span className="absolute w-12 h-12 rounded-full bg-emerald-500/30 animate-ping"></span>
                )}
                
                {/* Custom Marker Icon */}
                <svg 
                  width="24" height="24" viewBox="0 0 24 24"
                  className="drop-shadow-md relative z-10"
                  style={{ transform: `rotate(${telemetry.heading}deg)` }}
                >
                  <path d="M12 2L22 22L12 18L2 22L12 2Z" fill="#06C167" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
                </svg>
                
                {/* Floating ETA Overlay anchored to courier */}
                {progress > 0 && progress < 100 && (
                  <div className="absolute top-7 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900/90 text-white font-mono font-black text-[10px] uppercase tracking-wider px-2 py-1 rounded border border-emerald-500/50 shadow-lg pointer-events-auto transition-all">
                    ETA {dynamicEta}
                  </div>
                )}
              </div>
            </OverlayViewF>

            {showTraffic && (
              <>
                <TrafficLayer />
                <Polyline
                  path={congestionCoords}
                  options={{
                    strokeColor: "#ef4444",
                    strokeOpacity: 0.95,
                    strokeWeight: 6,
                    geodesic: true,
                  }}
                />
              </>
            )}

            {showHeatmap && heatmapData.length > 0 && (
              <HeatmapLayer
                data={heatmapData}
                options={{
                  radius: heatmapPulseOptions.radius,
                  opacity: heatmapPulseOptions.opacity,
                  gradient: [
                    'rgba(0, 255, 255, 0)',
                    'rgba(0, 255, 255, 1)',
                    'rgba(0, 191, 255, 1)',
                    'rgba(0, 127, 255, 1)',
                    'rgba(0, 63, 255, 1)',
                    'rgba(0, 0, 255, 1)',
                    'rgba(0, 0, 223, 1)',
                    'rgba(0, 0, 191, 1)',
                    'rgba(0, 0, 159, 1)',
                    'rgba(0, 0, 127, 1)',
                    'rgba(63, 0, 91, 1)',
                    'rgba(127, 0, 63, 1)',
                    'rgba(191, 0, 31, 1)',
                    'rgba(255, 0, 0, 1)'
                  ]
                }}
              />
            )}
          </GoogleMap></MapErrorBoundary>
        ) : (
          <div className="w-full h-80 z-10 flex items-center justify-center bg-slate-100 animate-pulse text-slate-400 text-xs font-bold">
            Loading Live Google Maps API...
          </div>
        )}

        {/* Sleek D3-style Animated Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-900/50 z-40 overflow-hidden backdrop-blur-sm pointer-events-none">
          <div 
            className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,1)] transition-all duration-1000 ease-linear relative"
            style={{ width: `${Math.max(2, progress)}%` }}
          >
            <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-l from-white/50 to-transparent"></div>
          </div>
        </div>
        
        {/* Real-Time Glassmorphic HUD overlay (Requested coordinates overlay) */}
        <div className="absolute bottom-3 left-3 right-3 z-30 bg-slate-950/85 backdrop-blur-md rounded-xl p-3 border border-white/10 text-white flex flex-col md:flex-row justify-between items-stretch gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Compass className="w-5 h-5 animate-spin-slow" style={{ transform: `rotate(${telemetry.heading}deg)` }} />
            </div>
            <div>
              <span className="text-[8px] font-semibold text-emerald-400 uppercase tracking-widest block font-sans">Active Satellite Coordinates</span>
              <div className="font-mono text-xs font-bold leading-tight mt-0.5">
                La: {telemetry.lat.toFixed(6)}
                <span className="mx-1 text-slate-500">|</span>
                Lo: {telemetry.lng.toFixed(6)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 flex-1 md:max-w-xs text-center md:text-left">
            <div className="border-l md:border-l border-white/10 pl-2">
              <span className="text-[8px] font-semibold text-slate-400 uppercase block tracking-wider font-sans">Velocity</span>
              <div className="flex items-baseline gap-0.5 justify-center md:justify-start">
                <span className="text-sm font-black font-mono text-emerald-400">{telemetry.speed}</span>
                <span className="text-[8px] font-bold text-slate-500">km/h</span>
              </div>
            </div>
            <div className="border-l border-white/10 pl-2">
              <span className="text-[8px] font-semibold text-slate-400 uppercase block tracking-wider font-sans">Heading</span>
              <div className="flex items-baseline gap-0.5 justify-center md:justify-start">
                <span className="text-sm font-black font-mono text-slate-100">{telemetry.heading}°</span>
                <span className="text-[8px] font-bold text-slate-500">NNE</span>
              </div>
            </div>
            <div className="border-l border-white/10 pl-2">
              <span className="text-[8px] font-semibold text-slate-400 uppercase block tracking-wider font-sans">Distance</span>
              <div className="flex items-baseline gap-0.5 justify-center md:justify-start">
                <span className="text-sm font-black font-mono text-amber-400">{telemetry.distanceRem}</span>
                <span className="text-[8px] font-bold text-slate-500">m</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sovereign High-Fidelity Vector Route path visualizer utilizing Framer Motion polyline */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white overflow-hidden relative shadow-lg">
        <div className="absolute top-3.5 right-4 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#06C167] animate-ping"></span>
          <span className="text-[8px] font-black text-[#06C167] tracking-widest uppercase font-mono">VECTOR LIVE ROUTE</span>
        </div>
        <div className="mb-2">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Framer Motion Animated Companion Route</span>
          <span className="text-[9px] text-slate-500">Direct projection mapping from real GPS telemetry coordinates</span>
        </div>

        <div className="relative mt-2 bg-slate-950 p-4 rounded-xl border border-white/5 flex flex-col items-center">
          <svg 
            viewBox="0 0 300 100" 
            className="w-full h-24 drop-shadow-[0_2px_8px_rgba(6,193,103,0.15)]"
            role="img"
            aria-labelledby="svg-companion-title svg-companion-desc"
          >
            <title id="svg-companion-title">Animated Companion Delivery Route Vector</title>
            <desc id="svg-companion-desc">
              Linear progress indicator showing transit coordinates mapped to vector space. Start point at {originLabel}, end point at destLabel, with active courier indicator currently at {progress}% progress.
            </desc>

            {/* Background static shadow polyline path */}
            <polyline
              points={svgPoints.join(' ')}
              fill="none"
              stroke="#1e293b"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Active animated route drawing overlay */}
            <motion.polyline
              points={svgPoints.join(' ')}
              fill="none"
              stroke="#06C167"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: progress / 100 }}
              transition={{ type: "tween", duration: 0.8, ease: "easeOut" }}
            />

            {/* Start Node */}
            <circle 
              cx={svgPoints[0].split(',')[0]} 
              cy={svgPoints[0].split(',')[1]} 
              r="6" 
              fill="#f59e0b" 
              stroke="#ffffff" 
              strokeWidth="1.5" 
              role="img"
              aria-label={`Courier dispatch origin: ${originLabel}`}
            />

            {/* End Point Node */}
            <circle 
              cx={svgPoints[svgPoints.length-1].split(',')[0]} 
              cy={svgPoints[svgPoints.length-1].split(',')[1]} 
              r="7" 
              fill="#06C167" 
              stroke="#ffffff" 
              strokeWidth="2" 
              className="animate-pulse" 
              role="img"
              aria-label="Delivery destination: destLabel checkpoint"
            />

            {/* Real-time courier vehicle position pin node with heading rotation */}
            <motion.g
              transform={`translate(${activeX}, ${activeY}) rotate(${telemetry.heading})`}
              animate={{ scale: [0.9, 1.1, 0.9] }}
              transition={{ type: "tween", repeat: Infinity, duration: 2, ease: "easeInOut" }}
              role="img"
              aria-label={`Current active courier vector position. Progress is ${progress} percent.`}
            >
              {/* Sleek tactical arrow design representing the high-fidelity transit vector */}
              <path
                d="M 0 -8 L 6 6 L 2 4 L 0 2 L -2 4 L -6 6 Z"
                fill="#06C167"
                stroke="#ffffff"
                strokeWidth="1.5"
              />
            </motion.g>
          </svg>

          <div className="w-full flex justify-between text-[8px] font-black text-slate-400 uppercase tracking-widest mt-2 px-1">
            <span className="text-amber-500 flex items-center gap-1 font-mono"><MapPin className="w-2.5 h-2.5" /> START: {originLabel}</span>
            <span className="text-slate-500 font-mono">COURIER COORDS TRANSIT PHASE</span>
            <span className="text-[#06C167] flex items-center gap-1 font-mono"><MapPin className="w-2.5 h-2.5" /> DEST: 15 BARTON ROAD, ARTARMON</span>
          </div>
        </div>
      </div>
    </div>
  );
}


export function DeliveryMap(props: DeliveryMapProps) {
  const API_KEY = "";
  const hasValidKey = Boolean(API_KEY) && API_KEY !== ('YOUR_API_KEY' as string);
  const [authFailed, setAuthFailed] = React.useState(false);
  
  React.useEffect(() => {
    const handleAuthFail = () => setAuthFailed(true);
    window.addEventListener("gm_authFailure", handleAuthFail);
    
    // Google Maps API calls this global function on auth failure
    (window as any).gm_authFailure = () => {
      setAuthFailed(true);
      window.dispatchEvent(new Event("gm_authFailure"));
    };
    
    return () => {
      window.removeEventListener("gm_authFailure", handleAuthFail);
      delete (window as any).gm_authFailure;
    };
  }, []);

  const effectiveHasValidKey = hasValidKey && !authFailed;


  if (!effectiveHasValidKey) {
     return (
       <div className="w-full h-[350px] rounded-2xl bg-slate-900 border border-emerald-500/20 flex flex-col items-center justify-center space-y-4">
         <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
         </div>
         <div className="text-center space-y-1">
           <h4 className="text-emerald-500 font-mono text-[10px] uppercase tracking-widest font-black">{authFailed ? "Satellite Uplink Rejected" : "Satellite Uplink Offline"}</h4>
           <p className="text-slate-400 text-[10px] max-w-[250px] mx-auto font-medium leading-relaxed">{authFailed ? "Google Maps API is not activated for this key. Please enable the Maps JavaScript API." : "Valourian Tactical Network requires a verified Google Maps Platform Key to stream real-time courier telemetry."}</p>
         </div>
       </div>
     );
  }

  return <DeliveryMapInner {...props} />;
}
