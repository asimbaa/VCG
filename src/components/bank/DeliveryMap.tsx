import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Compass, Shield, Gauge, MapPin, Navigation, Activity, ZoomIn, ZoomOut, Layers, Box, Rotate3d, ChevronDown, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleMap, useJsApiLoader, DirectionsRenderer, Marker, TrafficLayer, Polyline } from '@react-google-maps/api';

interface DeliveryMapProps {
  restaurantName: string;
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

const RESTAURANT_LOCATIONS: Record<string, { lat: number, lng: number }> = {
  "Quay Sydney": { lat: -33.8587, lng: 151.2115 },
  "Aria Restaurant": { lat: -33.8592, lng: 151.2133 },
  "Nobu Sydney": { lat: -33.8618, lng: 151.1995 },
  "Maisy's 24 Hour Diner": { lat: -33.8340, lng: 151.2175 },
  "Golden Century Midnight": { lat: -33.8785, lng: 151.2032 }
};

const DESTINATION_COORD = { lat: -33.8675, lng: 151.2070 };

function calculateBearing(lat1: number, lon1: number, lat2: number, lon2: number) {
  const dLng = (lon2 - lon1) * Math.PI / 180;
  const lat1Rad = lat1 * Math.PI / 180;
  const lat2Rad = lat2 * Math.PI / 180;
  const y = Math.sin(dLng) * Math.cos(lat2Rad);
  const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLng);
  let brng = Math.atan2(y, x) * 180 / Math.PI;
  return Math.round((brng + 360) % 360);
}

export function DeliveryMap({ restaurantName, progress, latitude, longitude }: DeliveryMapProps) {
  const [directionsResponse, setDirectionsResponse] = useState<google.maps.DirectionsResult | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [showTraffic, setShowTraffic] = useState(false);
  const [fetchingTraffic, setFetchingTraffic] = useState(false);
  const [mapZoom, setMapZoom] = useState(14);
  const [mapType, setMapType] = useState<'roadmap' | 'hybrid'>('roadmap');
  const [isTilted, setIsTilted] = useState(false);
  const [trafficLevel, setTrafficLevel] = useState<'free-flowing' | 'minor-delays' | 'accident-ahead'>('free-flowing');
  const [isLegendExpanded, setIsLegendExpanded] = useState(true);

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
  
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  });

  const originCoord = useMemo(() => {
    return RESTAURANT_LOCATIONS[restaurantName] || RESTAURANT_LOCATIONS["Quay Sydney"];
  }, [restaurantName]);

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
  const [telemetry, setTelemetry] = useState({
    lat: latitude !== undefined ? latitude : -33.8587, // default fallback latitude
    lng: longitude !== undefined ? longitude : 151.2115, // default fallback longitude
    heading: 0,
    speed: 0,
    distanceRem: 1340
  });

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

    setTelemetry((prev) => ({
      lat: latitude !== undefined ? latitude : prev.lat,
      lng: longitude !== undefined ? longitude : prev.lng,
      heading: headingVal || (latitude ? 12 : 0), 
      speed: currentSpeed,
      distanceRem: distanceRem
    }));
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
        className="relative w-full rounded-2xl overflow-hidden border border-slate-200 shadow-md delivery-map-container"
        role="application"
        aria-label={`Live Courier Delivery Tracking Map. Tracking courier from ${restaurantName || "the restaurant"} to Sovereign Tower.`}
      >
        {/* Screen Reader Live Announcements and Accessibility Context */}
        <div className="sr-only" aria-live="polite">
          <p>
            Delivery Tracking Map from {restaurantName || "the restaurant"} to Sovereign Tower.
            Current status: {progress === 0 
              ? "Awaiting courier dispatch" 
              : progress === 100 
                ? "Courier has arrived at Sovereign Tower. Please confirm delivery." 
                : `In transit. Courier is ${progress}% along the route, traveling at ${telemetry.speed} km/h with bearing ${telemetry.heading} degrees. Estimated arrival in ${Math.max(1, Math.round(18 * (1 - progress/100)))} minutes.`
            }
            Current location latitude: {telemetry.lat.toFixed(6)}, longitude: {telemetry.lng.toFixed(6)}.
            Remaining distance: {telemetry.distanceRem} meters.
            Traffic heatmap is currently {showTraffic ? "visible showing high congestion nodes in red" : "hidden"}.
            Map zoom level is {mapZoom}. Map view style is {mapType === "roadmap" ? "standard road map" : "satellite hybrid imagery"}. Map tilt perspective is {isTilted ? "3D tilted isometric (45 degrees)" : "flat 2D overhead (0 degrees)"}.
          </p>
        </div>

        {/* Floating 'Navigate to Delivery' action button */}
        <a
          id="navigate-delivery-gps-anchor"
          href={`https://www.google.com/maps/dir/?api=1&destination=${DESTINATION_COORD.lat},${DESTINATION_COORD.lng}&travelmode=bicycling`}
          target="_blank"
          referrerPolicy="no-referrer"
          rel="noopener noreferrer"
          className="absolute top-3 left-3 z-[1000] bg-white/95 backdrop-blur-xs hover:bg-slate-50 text-slate-900 border border-slate-200 p-2 px-3 rounded-xl shadow-md flex items-center gap-1.5 transition-all active:scale-95 text-[9px] font-black tracking-widest uppercase cursor-pointer no-underline select-none"
          aria-label="Open external GPS navigation in Google Maps"
        >
          <Navigation className="w-3 h-3 text-emerald-600 animate-bounce" aria-hidden="true" />
          Navigate to Delivery
        </a>

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
              initial={{ opacity: 0, y: -40, scale: 0.95, x: "-50%" }}
              animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }}
              exit={{ opacity: 0, y: -20, scale: 0.95, x: "-50%" }}
              transition={{ type: "spring", stiffness: 120, damping: 15 }}
              className="absolute top-4 left-1/2 z-[1100] w-[92%] max-w-[320px] bg-slate-950/95 backdrop-blur-md border-2 border-emerald-500 text-white p-3.5 rounded-xl shadow-[0_15px_40px_rgba(16,185,129,0.35)] flex items-start gap-3"
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
                  The Valourian courier has completed transit from {restaurantName || 'the chef'} and arrived at Sovereign Tower checkpoint.
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

        {/* Map Interaction Control Stack */}
        <div className="absolute top-[92px] left-3 z-[1000] flex flex-col gap-1.5" role="group" aria-label="Map View Controls">
          {/* Zoom In Button */}
          <button
            onClick={handleZoomIn}
            className="p-2 bg-slate-950/90 hover:bg-slate-900 border border-white/10 text-white rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center"
            title="Zoom In"
            aria-label="Zoom Map In"
          >
            <ZoomIn className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
          
          {/* Zoom Out Button */}
          <button
            onClick={handleZoomOut}
            className="p-2 bg-slate-950/90 hover:bg-slate-900 border border-white/10 text-white rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center"
            title="Zoom Out"
            aria-label="Zoom Map Out"
          >
            <ZoomOut className="w-3.5 h-3.5" aria-hidden="true" />
          </button>

          {/* Toggle Satellite View Button */}
          <button
            onClick={() => setMapType((prev) => prev === 'roadmap' ? 'hybrid' : 'roadmap')}
            className={`p-2 border rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center ${
              mapType === 'hybrid'
                ? "bg-emerald-600 border-emerald-500 text-white hover:bg-emerald-700"
                : "bg-slate-950/90 hover:bg-slate-900 border-white/10 text-white"
            }`}
            title="Toggle Satellite View"
            aria-pressed={mapType === 'hybrid'}
            aria-label="Toggle between standard roadmap view and satellite hybrid imagery"
          >
            <Layers className="w-3.5 h-3.5" aria-hidden="true" />
          </button>

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
                <div className="flex items-center gap-2" aria-label={`Origin location: ${restaurantName || 'Chef'}`}>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 border border-white shrink-0" aria-hidden="true"></span>
                  <span className="text-slate-300">Origin (Chef)</span>
                </div>
                <div className="flex items-center gap-2" aria-label="Delivery Drop-off Point: Sovereign Tower Checkpoint">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white animate-pulse shrink-0" aria-hidden="true"></span>
                  <span className="text-slate-300 font-sans">Delivery Drop-off Point</span>
                </div>
                <div className="flex items-center gap-2" aria-label="Courier Location represented by active green arrow pointer">
                  <div className="w-3.5 h-3 flex items-center justify-center shrink-0" aria-hidden="true">
                    <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400 opacity-80 rotate-45 border border-white"></span>
                  </div>
                  <span className="text-slate-300 font-sans">Courier Location</span>
                </div>
                <div className="flex items-center gap-2" aria-label="Red polyline overlay indicating active congestion nodes">
                  <span className="h-1.5 w-3.5 bg-red-500 rounded-sm shrink-0" aria-hidden="true"></span>
                  <span className="text-slate-300 font-sans">Active Congestion Nodes</span>
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
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={progress === 0 ? originCoord : { lat: telemetry.lat, lng: telemetry.lng }}
            zoom={mapZoom}
            mapTypeId={mapType}
            options={{ disableDefaultUI: true, gestureHandling: 'greedy', tilt: isTilted ? 45 : 0 }}
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
            {/* Start Marker with ARIA attributes */}
            <Marker 
              position={originCoord} 
              label="Start" 
              title={`Restaurant Origin: ${restaurantName}`}
            />
            {/* End Marker with ARIA attributes */}
            <Marker 
              position={DESTINATION_COORD} 
              label="Dest" 
              title="Delivery Destination: Sovereign Tower Checkpoint"
            />
            {/* Current Position Marker with dynamic bearing and state */}
            <Marker
               position={{ lat: telemetry.lat, lng: telemetry.lng }}
               title={`Current Courier Position. Speed is ${telemetry.speed} km/h, bearing is ${telemetry.heading} degrees, with ${telemetry.distanceRem} meters remaining.`}
               icon={window.google && window.google.maps ? {
                 path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                 scale: 6,
                 fillColor: "#06C167",
                 fillOpacity: 1,
                 strokeWeight: 2,
                 strokeColor: "#FFF",
                 rotation: telemetry.heading,
                 anchor: new window.google.maps.Point(0, 0)
               } : {
                 path: 0, // Fallback CIRCLE
                 scale: 8,
                 fillColor: "#06C167",
                 fillOpacity: 1,
                 strokeWeight: 2,
                 strokeColor: "#FFF"
               }}
            />

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
          </GoogleMap>
        ) : (
          <div className="w-full h-80 z-10 flex items-center justify-center bg-slate-100 animate-pulse text-slate-400 text-xs font-bold">
            Loading Live Google Maps API...
          </div>
        )}

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
              Linear progress indicator showing transit coordinates mapped to vector space. Start point at {restaurantName || 'Chef'}, end point at Sovereign Tower Checkpoint, with active courier indicator currently at {progress}% progress.
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
              transition={{ duration: 0.8, ease: "easeOut" }}
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
              aria-label={`Courier dispatch origin: ${restaurantName}`}
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
              aria-label="Delivery destination: Sovereign Tower checkpoint"
            />

            {/* Real-time courier vehicle position pin node with heading rotation */}
            <motion.g
              transform={`translate(${activeX}, ${activeY}) rotate(${telemetry.heading})`}
              animate={{ scale: [0.9, 1.1, 0.9] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
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
            <span className="text-amber-500 flex items-center gap-1 font-mono"><MapPin className="w-2.5 h-2.5" /> START: {restaurantName}</span>
            <span className="text-slate-500 font-mono">COURIER COORDS TRANSIT PHASE</span>
            <span className="text-[#06C167] flex items-center gap-1 font-mono"><MapPin className="w-2.5 h-2.5" /> DEST: SOVEREIGN TOWER</span>
          </div>
        </div>
      </div>
    </div>
  );
}

