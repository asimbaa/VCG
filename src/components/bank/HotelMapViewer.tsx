import React, { useEffect, useState, useRef, useMemo } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { 
  Camera, Compass, Sparkles, RefreshCw, Car, Navigation, MapPin, 
  Eye, Check, ShieldCheck, ArrowRight, Sun, Trees, Waves
} from 'lucide-react';

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

export interface ScenicWaypoint {
  id: string;
  lat: number;
  lng: number;
  name: string;
  category: 'coastal' | 'lookout' | 'heritage' | 'nature';
  photoSpotDescription: string;
}

/**
 * Generates randomized geographic waypoints along a scenic detour vector
 */
export function generateRandomizedScenicWaypoints(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  seed: number = 1
): ScenicWaypoint[] {
  const dLat = destination.lat - origin.lat;
  const dLng = destination.lng - origin.lng;
  const dist = Math.sqrt(dLat * dLat + dLng * dLng) || 0.04;

  // Normalized perpendicular unit vector
  const perpLat = -dLng / dist;
  const perpLng = dLat / dist;

  // Deterministic pseudo-random generation based on seed and coordinates
  const pseudo1 = Math.abs(Math.sin(seed * 4927 + origin.lat * 83));
  const pseudo2 = Math.abs(Math.cos(seed * 3181 + destination.lng * 67));
  const pseudo3 = Math.abs(Math.sin(seed * 7723 + (origin.lng + destination.lat) * 41));

  // Waypoint 1: Scenic Coastal or Harbor Outlook
  const sign1 = (seed % 2 === 0) ? 1 : -1;
  const lateralOffset1 = (0.22 + pseudo1 * 0.28) * dist * sign1;
  const wp1Lat = origin.lat + dLat * (0.28 + pseudo1 * 0.12) + perpLat * lateralOffset1;
  const wp1Lng = origin.lng + dLng * (0.28 + pseudo1 * 0.12) + perpLng * lateralOffset1;

  // Waypoint 2: Historic Heritage or Botanical Loop
  const sign2 = (seed % 3 === 0) ? -1 : 1;
  const lateralOffset2 = (0.18 + pseudo2 * 0.26) * dist * sign2;
  const wp2Lat = origin.lat + dLat * (0.65 + pseudo2 * 0.15) + perpLat * lateralOffset2;
  const wp2Lng = origin.lng + dLng * (0.65 + pseudo2 * 0.15) + perpLng * lateralOffset2;

  const namesPool = [
    { name: "Harbor Foreshore & Panoramic Cliffway", cat: "coastal" as const, desc: "Ocean spray views with elevated coastal vantage points" },
    { name: "Botanical Heritage Garden Path", cat: "nature" as const, desc: "Canopied tree-lined boulevard passing heritage gardens" },
    { name: "Skyline Promenade & Scenic Lookaround", cat: "lookout" as const, desc: "High-angle architectural skyline views and photogenic curves" },
    { name: "Waterfront Esplanade & Lighthouse Loop", cat: "coastal" as const, desc: "Marina boardwalk detour with sweeping water reflections" },
    { name: "Historic Reserve & Sculpture Park", cat: "heritage" as const, desc: "Curated colonial stone facades and public art boulevard" },
  ];

  const item1 = namesPool[(seed + 1) % namesPool.length];
  const item2 = namesPool[(seed + 3) % namesPool.length];

  return [
    {
      id: `wp_scenic_1_${seed}`,
      lat: wp1Lat,
      lng: wp1Lng,
      name: item1.name,
      category: item1.cat,
      photoSpotDescription: item1.desc,
    },
    {
      id: `wp_scenic_2_${seed}`,
      lat: wp2Lat,
      lng: wp2Lng,
      name: item2.name,
      category: item2.cat,
      photoSpotDescription: item2.desc,
    },
  ];
}

function RouteDisplay({ 
  origin, 
  destination, 
  setDistanceInfo,
  scenicRoute = false,
  waypoints = []
}: {
  origin: google.maps.LatLngLiteral | null;
  destination: google.maps.LatLngLiteral | null;
  setDistanceInfo: (info: string) => void;
  scenicRoute?: boolean;
  waypoints?: ScenicWaypoint[];
}) {
  const map = useMap();
  const routesLib = useMapsLibrary('routes');
  const polylinesRef = useRef<google.maps.Polyline[]>([]);

  useEffect(() => {
    if (!routesLib || !map || !origin || !destination) return;
    
    // Clear previous route polylines
    polylinesRef.current.forEach(p => p.setMap(null));
    polylinesRef.current = [];

    if ((routesLib as any)?.Route?.computeRoutes) {
      const requestPayload: any = {
        origin,
        destination,
        travelMode: 'DRIVING',
        fields: ['path', 'distanceMeters', 'durationMillis', 'viewport'],
      };

      if (scenicRoute && waypoints.length > 0) {
        requestPayload.intermediates = waypoints.map(w => ({
          location: { latLng: { latitude: w.lat, longitude: w.lng } }
        }));
      }

      (routesLib as any).Route.computeRoutes(requestPayload).then(({ routes }: any) => {
        if (routes?.[0]) {
          const route = routes[0];
          const newPolylines = route.createPolylines?.() || [];
          newPolylines.forEach((p: any) => {
            if (scenicRoute) {
              p.setOptions({
                strokeColor: '#06b6d4', // Vibrant Cyan / Azure for Scenic Route
                strokeWeight: 6,
                strokeOpacity: 0.9,
              });
            } else {
              p.setOptions({
                strokeColor: '#003580', // Booking Classic Blue
                strokeWeight: 5,
                strokeOpacity: 0.85,
              });
            }
            p.setMap(map);
          });
          polylinesRef.current = newPolylines;
          if (route.viewport) map.fitBounds(route.viewport);
          
          const distKm = route.distanceMeters ? (route.distanceMeters / 1000).toFixed(1) : '6.4';
          const durMin = route.durationMillis ? Math.round(route.durationMillis / 60000) : '15';
          
          if (scenicRoute) {
            setDistanceInfo(`${distKm} km • ${durMin} min (Scenic Detour Active • +${waypoints.length} Viewpoints)`);
          } else {
            setDistanceInfo(`${distKm} km • ${durMin} min direct transit`);
          }
        }
      }).catch((err: any) => {
        console.warn("Google Maps computeRoutes fallback:", err);
        // Fallback distance calculation
        const baseKm = 7.2;
        const scenicKm = (baseKm * 1.45).toFixed(1);
        if (scenicRoute) {
          setDistanceInfo(`${scenicKm} km • 24 min (Scenic Coastline & Panorama Loop)`);
        } else {
          setDistanceInfo(`${baseKm} km • 14 min direct transit`);
        }
      });
    }

    return () => polylinesRef.current.forEach(p => p.setMap(null));
  }, [routesLib, map, origin, destination, scenicRoute, waypoints, setDistanceInfo]);

  return null;
}

function MapContent({ 
  hotelName, 
  hotelLocation,
  scenicRoute,
  onToggleScenicRoute,
  waypointSeed,
  onRegenerateWaypoints
}: { 
  hotelName: string;
  hotelLocation: string;
  scenicRoute: boolean;
  onToggleScenicRoute?: () => void;
  waypointSeed: number;
  onRegenerateWaypoints?: () => void;
}) {
  const placesLib = useMapsLibrary('places');
  const map = useMap();
  
  const [hotelLatLng, setHotelLatLng] = useState<google.maps.LatLngLiteral | null>(null);
  const [attraction, setAttraction] = useState<any>(null);
  const [distanceInfo, setDistanceInfo] = useState<string>('');

  useEffect(() => {
    if (!placesLib || !map) return;
    
    // Search for hotel location
    placesLib.Place.searchByText({
      textQuery: `${hotelName} ${hotelLocation}`,
      fields: ['location', 'displayName'],
      maxResultCount: 1,
    }).then(({ places }) => {
      if (places && places.length > 0) {
        const loc = places[0].location;
        if (loc) {
          const coords = { lat: loc.lat(), lng: loc.lng() };
          setHotelLatLng(coords);
          map.setCenter(coords);
          map.setZoom(13);
          
          // Search nearby attractions / airport / landmarks
          placesLib.Place.searchNearby({
            locationRestriction: {
              center: coords,
              radius: 6000,
            },
            includedPrimaryTypes: ['tourist_attraction'],
            maxResultCount: 1,
            fields: ['location', 'displayName'],
          }).then((res) => {
             if (res.places && res.places.length > 0) {
                setAttraction(res.places[0]);
             } else {
               // Default landmark offset if no places returned
               setAttraction({
                 displayName: "Sydney Harbor & Opera Esplanade",
                 location: { lat: () => coords.lat + 0.028, lng: () => coords.lng + 0.035 }
               });
             }
          }).catch(() => {
            setAttraction({
              displayName: "Foreshore Promenade & Airport Link",
              location: { lat: () => coords.lat + 0.025, lng: () => coords.lng + 0.032 }
            });
          });
        }
      }
    }).catch(console.error);
  }, [placesLib, map, hotelName, hotelLocation]);

  const targetCoords = useMemo(() => {
    if (attraction?.location?.lat && attraction?.location?.lng) {
      return {
        lat: typeof attraction.location.lat === 'function' ? attraction.location.lat() : attraction.location.lat,
        lng: typeof attraction.location.lng === 'function' ? attraction.location.lng() : attraction.location.lng,
      };
    }
    return null;
  }, [attraction]);

  // Generate randomized scenic waypoints if scenic route is active
  const scenicWaypoints = useMemo(() => {
    if (!hotelLatLng || !targetCoords) return [];
    return generateRandomizedScenicWaypoints(hotelLatLng, targetCoords, waypointSeed);
  }, [hotelLatLng, targetCoords, waypointSeed]);

  return (
    <>
      {/* Hotel Marker */}
      {hotelLatLng && (
        <AdvancedMarker position={hotelLatLng} title={hotelName} zIndex={100}>
          <Pin background="#003580" glyphColor="#fff" borderColor="#001840">
            <span className="text-[10px] font-bold text-white">🏨</span>
          </Pin>
        </AdvancedMarker>
      )}
      
      {/* Attraction / Destination Marker */}
      {targetCoords && (
        <AdvancedMarker position={targetCoords} title={attraction?.displayName || "Destination"} zIndex={90}>
          <Pin background="#10b981" glyphColor="#fff" borderColor="#047857">
            <span className="text-[10px] font-bold text-white">📍</span>
          </Pin>
        </AdvancedMarker>
      )}

      {/* Scenic Waypoints Markers when Scenic Route is Active */}
      {scenicRoute && scenicWaypoints.map((wp, i) => (
        <AdvancedMarker key={wp.id} position={{ lat: wp.lat, lng: wp.lng }} title={wp.name} zIndex={95}>
          <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-1.5 rounded-full shadow-lg border-2 border-white flex items-center justify-center animate-bounce">
            <Camera className="w-3.5 h-3.5 fill-white text-cyan-200" />
          </div>
        </AdvancedMarker>
      ))}

      {/* Dynamic Route Polyline */}
      {hotelLatLng && targetCoords && (
        <RouteDisplay 
          origin={hotelLatLng} 
          destination={targetCoords} 
          setDistanceInfo={setDistanceInfo}
          scenicRoute={scenicRoute}
          waypoints={scenicWaypoints}
        />
      )}
      
      {/* Floating Transit Telemetry & Control Panel */}
      <div className="absolute top-3 left-3 right-3 sm:right-auto sm:max-w-xs bg-slate-900/90 border border-slate-700/80 p-3 rounded-2xl shadow-2xl backdrop-blur-md text-xs text-white z-10 space-y-2">
        <div className="flex items-center justify-between gap-2 border-b border-slate-700/60 pb-2">
          <div className="flex items-center gap-1.5">
            <Car className="w-4 h-4 text-cyan-400" />
            <span className="font-black text-white uppercase tracking-wider text-[11px]">Uber Executive Transit</span>
          </div>
          <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
            scenicRoute ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-slate-800 text-slate-300 border border-slate-700'
          }`}>
            {scenicRoute ? 'Scenic Mode' : 'Direct Rail'}
          </span>
        </div>

        <div className="space-y-1 text-[11px] text-slate-300">
          <p className="truncate"><span className="text-cyan-400 font-bold">From:</span> {hotelName}</p>
          <p className="truncate"><span className="text-emerald-400 font-bold">To:</span> {attraction?.displayName || 'Scenic Destination'}</p>
          {distanceInfo && (
            <p className="font-mono text-cyan-300 font-bold pt-1 border-t border-slate-800">{distanceInfo}</p>
          )}
        </div>

        {/* Scenic Route Toggle & Shuffle Buttons */}
        <div className="flex items-center gap-2 pt-1">
          {onToggleScenicRoute && (
            <button
              onClick={onToggleScenicRoute}
              className={`flex-1 py-1.5 px-2.5 rounded-xl font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-1 transition-all cursor-pointer ${
                scenicRoute 
                  ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
            >
              <Compass className="w-3 h-3" />
              {scenicRoute ? 'Scenic: ON' : 'Enable Scenic Detour'}
            </button>
          )}

          {scenicRoute && onRegenerateWaypoints && (
            <button
              onClick={onRegenerateWaypoints}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 transition-colors cursor-pointer"
              title="Shuffle & re-randomize scenic waypoints"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Scenic Waypoint Descriptions */}
        {scenicRoute && scenicWaypoints.length > 0 && (
          <div className="mt-2 pt-2 border-t border-slate-800/80 space-y-1.5">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">
              Randomized Waypoints ({scenicWaypoints.length})
            </span>
            {scenicWaypoints.map((wp, i) => (
              <div key={wp.id} className="text-[10px] bg-slate-950/60 p-1.5 rounded-lg border border-slate-800/80">
                <span className="font-bold text-cyan-300 flex items-center gap-1">
                  <Camera className="w-2.5 h-2.5" /> Stop {i + 1}: {wp.name}
                </span>
                <span className="text-[9px] text-slate-400 block mt-0.5">{wp.photoSpotDescription}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

/**
 * Interactive Vector Radar Map Fallback when Google Maps API key is in demo or mock mode
 */
function InteractiveVectorScenicMap({
  hotelName,
  hotelLocation,
  scenicRoute,
  onToggleScenicRoute,
  waypointSeed,
  onRegenerateWaypoints,
}: {
  hotelName: string;
  hotelLocation: string;
  scenicRoute: boolean;
  onToggleScenicRoute?: () => void;
  waypointSeed: number;
  onRegenerateWaypoints?: () => void;
}) {
  const waypoints = useMemo(() => {
    return generateRandomizedScenicWaypoints(
      { lat: -33.8688, lng: 151.2093 },
      { lat: -33.8568, lng: 151.2153 },
      waypointSeed
    );
  }, [waypointSeed]);

  // Curve coordinates for SVG visualization
  // Start: (80, 240) - Hotel
  // End: (380, 80) - Destination
  // Direct: Line from (80, 240) to (380, 80)
  // Scenic Detour: Bezier with 2 randomized inflection points
  const p1 = {
    x: 160 + (Math.sin(waypointSeed * 3.7) * 40),
    y: 120 + (Math.cos(waypointSeed * 2.5) * 45)
  };
  const p2 = {
    x: 290 + (Math.cos(waypointSeed * 4.1) * 35),
    y: 190 + (Math.sin(waypointSeed * 5.3) * 40)
  };

  return (
    <div className="relative w-full h-[360px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl select-none">
      {/* Radar Map Grid Background */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(56, 189, 248, 0.15) 0%, transparent 70%), linear-gradient(#1e293b 1px, transparent 1px), linear-gradient(90deg, #1e293b 1px, transparent 1px)',
          backgroundSize: '100% 100%, 32px 32px, 32px 32px'
        }}
      />

      {/* SVG Navigation Map Canvas */}
      <svg className="w-full h-full absolute inset-0 pointer-events-none" viewBox="0 0 460 320" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="scenicGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Direct Baseline Path (Dashed) */}
        <line
          x1="80"
          y1="240"
          x2="380"
          y2="80"
          stroke="#475569"
          strokeWidth="2"
          strokeDasharray="4 4"
          opacity="0.6"
        />

        {/* Scenic Detour Path (Curved Spline with Glowing Animated Pulses) */}
        {scenicRoute ? (
          <>
            <path
              d={`M 80 240 C ${p1.x} ${p1.y}, ${p2.x} ${p2.y}, 380 80`}
              fill="none"
              stroke="url(#scenicGrad)"
              strokeWidth="5"
              filter="url(#glow)"
              strokeLinecap="round"
            />
            {/* Animated Pulses traversing the curve */}
            <circle r="4" fill="#38bdf8">
              <animateMotion
                path={`M 80 240 C ${p1.x} ${p1.y}, ${p2.x} ${p2.y}, 380 80`}
                dur="4s"
                repeatCount="indefinite"
              />
            </circle>
            <circle r="3" fill="#a855f7">
              <animateMotion
                path={`M 80 240 C ${p1.x} ${p1.y}, ${p2.x} ${p2.y}, 380 80`}
                dur="4s"
                begin="1.5s"
                repeatCount="indefinite"
              />
            </circle>
          </>
        ) : (
          <line
            x1="80"
            y1="240"
            x2="380"
            y2="80"
            stroke="#0284c7"
            strokeWidth="4"
            filter="url(#glow)"
          />
        )}
      </svg>

      {/* HTML Markers Placed on Canvas */}
      {/* 1. Hotel Origin Pin */}
      <div className="absolute left-[17%] top-[75%] -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center pointer-events-auto">
        <div className="px-2 py-0.5 rounded-md bg-[#003580] text-white text-[9px] font-black uppercase tracking-wider shadow-lg mb-1 whitespace-nowrap border border-blue-400">
          🏨 {hotelName.slice(0, 18)}...
        </div>
        <div className="w-5 h-5 rounded-full bg-[#003580] border-2 border-white flex items-center justify-center shadow-lg animate-pulse">
          <div className="w-2 h-2 rounded-full bg-white" />
        </div>
      </div>

      {/* 2. Destination Pin */}
      <div className="absolute left-[82%] top-[25%] -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center pointer-events-auto">
        <div className="px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[9px] font-black uppercase tracking-wider shadow-lg mb-1 whitespace-nowrap border border-emerald-400">
          📍 Sydney Harbor & Terminal
        </div>
        <div className="w-5 h-5 rounded-full bg-emerald-600 border-2 border-white flex items-center justify-center shadow-lg">
          <div className="w-2 h-2 rounded-full bg-white" />
        </div>
      </div>

      {/* 3. Scenic Waypoints when enabled */}
      {scenicRoute && (
        <>
          <div 
            className="absolute z-20 flex flex-col items-center pointer-events-auto transition-all duration-500"
            style={{ left: `${(p1.x / 460) * 100}%`, top: `${(p1.y / 320) * 100}%` }}
          >
            <div className="px-2 py-0.5 rounded-md bg-cyan-900/90 text-cyan-200 text-[8px] font-bold shadow-md mb-1 border border-cyan-400 whitespace-nowrap flex items-center gap-1">
              <Camera className="w-2.5 h-2.5" /> {waypoints[0].name.slice(0, 22)}
            </div>
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 border-2 border-white flex items-center justify-center shadow-xl animate-bounce">
              <Camera className="w-3 h-3 text-white" />
            </div>
          </div>

          <div 
            className="absolute z-20 flex flex-col items-center pointer-events-auto transition-all duration-500"
            style={{ left: `${(p2.x / 460) * 100}%`, top: `${(p2.y / 320) * 100}%` }}
          >
            <div className="px-2 py-0.5 rounded-md bg-purple-900/90 text-purple-200 text-[8px] font-bold shadow-md mb-1 border border-purple-400 whitespace-nowrap flex items-center gap-1">
              <Compass className="w-2.5 h-2.5" /> {waypoints[1].name.slice(0, 22)}
            </div>
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 border-2 border-white flex items-center justify-center shadow-xl animate-bounce">
              <Compass className="w-3 h-3 text-white" />
            </div>
          </div>
        </>
      )}

      {/* Floating Control Card */}
      <div className="absolute top-3 left-3 bg-slate-900/90 border border-slate-700/80 p-3.5 rounded-2xl shadow-2xl backdrop-blur-md text-xs text-white z-30 max-w-[260px] space-y-2">
        <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
          <div className="flex items-center gap-1.5">
            <Car className="w-4 h-4 text-cyan-400" />
            <span className="font-black text-white text-[11px] uppercase tracking-wider">Uber Transit Route</span>
          </div>
          <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
            scenicRoute ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-slate-800 text-slate-300'
          }`}>
            {scenicRoute ? 'Scenic Detour' : 'Direct Path'}
          </span>
        </div>

        <div className="space-y-1 text-[11px] text-slate-300">
          <p className="font-mono text-cyan-300 font-bold">
            {scenicRoute ? '12.8 km • 24 min (Scenic Coastline & Lookouts)' : '6.4 km • 14 min (Direct Express Transit)'}
          </p>
          <p className="text-[10px] text-slate-400">
            {scenicRoute 
              ? 'Route modified with 2 randomized viewpoints along cliffs & coastal botanic loops.'
              : 'Fastest urban route directly between hotel and destination.'}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2 pt-1">
          {onToggleScenicRoute && (
            <button
              onClick={onToggleScenicRoute}
              className={`flex-1 py-1.5 px-3 rounded-xl font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                scenicRoute 
                  ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
            >
              <Compass className="w-3 h-3" />
              {scenicRoute ? 'Scenic Detour: ON' : 'Toggle Scenic Route'}
            </button>
          )}

          {scenicRoute && onRegenerateWaypoints && (
            <button
              onClick={onRegenerateWaypoints}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 transition-colors cursor-pointer"
              title="Shuffle randomized waypoints"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function HotelMapViewer({ 
  hotelName, 
  hotelLocation,
  scenicRoute = false,
  onToggleScenicRoute,
  waypointSeed = 1,
  onRegenerateWaypoints,
}: { 
  hotelName: string; 
  hotelLocation: string;
  scenicRoute?: boolean;
  onToggleScenicRoute?: () => void;
  waypointSeed?: number;
  onRegenerateWaypoints?: () => void;
}) {
  if (!hasValidKey) {
    return (
      <div className="w-full mt-4">
        <InteractiveVectorScenicMap
          hotelName={hotelName}
          hotelLocation={hotelLocation}
          scenicRoute={scenicRoute}
          onToggleScenicRoute={onToggleScenicRoute}
          waypointSeed={waypointSeed}
          onRegenerateWaypoints={onRegenerateWaypoints}
        />
      </div>
    );
  }

  return (
    <div className="w-full h-[370px] rounded-2xl overflow-hidden shadow-inner relative border border-slate-200 mt-4 relative">
      <APIProvider apiKey={API_KEY} version="weekly">
        <Map
          defaultCenter={{ lat: -33.8688, lng: 151.2093 }}
          defaultZoom={13}
          mapId="HOTEL_BOOKING_MAP_ID"
          style={{ width: '100%', height: '100%' }}
          disableDefaultUI={true}
        >
          <MapContent 
            hotelName={hotelName} 
            hotelLocation={hotelLocation} 
            scenicRoute={scenicRoute}
            onToggleScenicRoute={onToggleScenicRoute}
            waypointSeed={waypointSeed}
            onRegenerateWaypoints={onRegenerateWaypoints}
          />
        </Map>
      </APIProvider>
    </div>
  );
}
