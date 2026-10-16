import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from "sonner";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { 
  Package, Truck, ShieldCheck, MapPin, Navigation, Bell, 
  MessageSquare, PenTool, CheckCircle2, AlertTriangle, 
  Search, RefreshCw, Send, ChevronRight, X,
  Maximize2, Minimize2, Ruler, Camera, Layers, Eye, Compass,
  Bookmark, ZoomIn, ZoomOut, ArrowUp, ArrowDown, ArrowLeft, ArrowRight,
  Sun, Moon, Shield
} from 'lucide-react';
import { db } from "../../firebase";
import { collection, addDoc, getDocs, query, orderBy, limit } from "firebase/firestore";

// Setup custom icons for Leaflet to fix default icon issues
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Real-time Distance Calculator (Haversine Formula)
function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Sovereign Dispatch Coordinate (SDC) System
// Fixed origin: Sydney Sovereign Treasury (-33.8688, 151.2093)
function toSovereignDispatchCoords(lat: number, lng: number) {
  const dLatKm = (lat - (-33.8688)) * 111.32;
  const dLngKm = (lng - 151.2093) * 92.4;
  const sdcX = (dLngKm * 10).toFixed(1);
  const sdcY = (dLatKm * 10).toFixed(1);
  return {
    sdcString: `SDC[${parseFloat(sdcX) >= 0 ? "+" : ""}${sdcX}, ${parseFloat(sdcY) >= 0 ? "+" : ""}${sdcY}]`,
    gridSector: `SEC-SYD-${Math.abs(Math.round(dLatKm * 2 + dLngKm * 3)) % 99}`,
    dispatchVector: `VEC-${Math.abs(Math.round(lat * 1000)).toString(36).toUpperCase()}`
  };
}

// Bearing angle in degrees
function calculateBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLng = (lon2 - lon1) * (Math.PI / 180);
  const lat1Rad = lat1 * (Math.PI / 180);
  const lat2Rad = lat2 * (Math.PI / 180);
  const y = Math.sin(dLng) * Math.cos(lat2Rad);
  const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLng);
  return Math.round((Math.atan2(y, x) * (180 / Math.PI) + 360) % 360);
}

const vehicleIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-black.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/2.0.0/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const hubIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/2.0.0/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Coordinates
const CHATSWOOD_STORE = { lat: -33.7969, lng: 151.1834 };
const ARTARMON_HUB = { lat: -33.8115, lng: 151.1866 }; // approx Artarmon hub
const GLOBAL_POINTS = [
  { name: 'Apple Store, Sydney (367 George St)', lat: -33.8688, lng: 151.2069 },
  { name: 'Westfield Sydney (Pitt St Mall)', lat: -33.8698, lng: 151.2081 },
  { name: 'Tesla Showroom (Alexandria, NSW)', lat: -33.9103, lng: 151.1963 }
];

// Interactive Controller inside Leaflet Map: Keyboard Navigation, Ruler Clicks, and Center sync
function MapControllerComponent({
  isRulerActive,
  onRulerPoint,
  onMapCenterChange,
}: {
  isRulerActive: boolean;
  onRulerPoint: (pt: { lat: number; lng: number }) => void;
  onMapCenterChange: (center: { lat: number; lng: number }, zoom: number) => void;
}) {
  const map = useMap();

  useMapEvents({
    click(e) {
      if (isRulerActive) {
        onRulerPoint({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    },
    moveend() {
      const c = map.getCenter();
      onMapCenterChange({ lat: c.lat, lng: c.lng }, map.getZoom());
    }
  });

  // Accessible Keyboard navigation (Arrow keys, +, -)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) return;
      const panStep = 0.006;
      const center = map.getCenter();

      if (e.key === "ArrowUp") {
        e.preventDefault();
        map.panTo([center.lat + panStep, center.lng]);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        map.panTo([center.lat - panStep, center.lng]);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        map.panTo([center.lat, center.lng - panStep]);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        map.panTo([center.lat, center.lng + panStep]);
      } else if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        map.zoomIn();
      } else if (e.key === "-" || e.key === "_") {
        e.preventDefault();
        map.zoomOut();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [map]);

  return null;
}

// Quick fly-to helper for Favorite Routes
function MapFlyToHandler({ target }: { target: { center: { lat: number; lng: number }; zoom: number } | null }) {
  const map = useMap();
  useEffect(() => {
    if (target) {
      map.flyTo([target.center.lat, target.center.lng], target.zoom, { duration: 1.2 });
    }
  }, [target, map]);
  return null;
}

export function SovereignLogisticsDashboard() {
  const [activeTab, setActiveTab] = useState<'map' | 'order' | 'support'>('map');
  const [vehiclePos, setVehiclePos] = useState(CHATSWOOD_STORE);
  const [notifications, setNotifications] = useState<any[]>([
    { id: 1, text: "Sovereign Fleet #01 Dispatched from Chatswood", time: "Just now", type: "info" }
  ]);
  const [chatMsg, setChatMsg] = useState("");
  const [chatHistory, setChatHistory] = useState([
    { sender: "Sovereign Control", text: "How can we assist with your high-value transit today?", time: "09:00 AM" }
  ]);
  const [orderForm, setOrderForm] = useState({
    item: "",
    value: "",
    origin: "Westfield Chatswood",
    signatureRequired: true,
    noAuthorityToLeave: true,
    knockOnDoor: true
  });

  // Focus Mode & High Contrast
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isHighContrast, setIsHighContrast] = useState(false);

  // Ruler Tool (Sovereign Dispatch Coordinate System)
  const [isRulerActive, setIsRulerActive] = useState(false);
  const [rulerPoints, setRulerPoints] = useState<{ lat: number; lng: number }[]>([]);

  // Map Center & Favorite Routes Snapshot
  const [currentCenter, setCurrentCenter] = useState({ lat: -33.8042, lng: 151.1850 });
  const [currentZoom, setCurrentZoom] = useState(14);
  const [flyTarget, setFlyTarget] = useState<{ center: { lat: number; lng: number }; zoom: number } | null>(null);
  const [favoriteRoutes, setFavoriteRoutes] = useState<any[]>([]);
  const [showFavoritesDrawer, setShowFavoritesDrawer] = useState(false);

  // Initial load of favorite routes from Firestore & defaults
  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const qRoutes = query(collection(db, "favorite_routes"), limit(10));
        const snap = await getDocs(qRoutes);
        const list: any[] = [];
        snap.forEach(d => list.push({ id: d.id, ...d.data() }));
        if (list.length > 0) {
          setFavoriteRoutes(list);
          return;
        }
      } catch (err) {
        console.warn("Firestore favorite routes notice:", err);
      }

      setFavoriteRoutes([
        {
          id: 'fav-1',
          name: 'Chatswood → Artarmon Vault Corridor',
          center: { lat: -33.8042, lng: 151.1850 },
          zoom: 14,
          sdcCode: 'SDC[+2.4, +6.8]',
          gridSector: 'SEC-SYD-14',
          dispatchVector: 'VEC-SYD-CORR-1',
          timestamp: new Date().toISOString()
        },
        {
          id: 'fav-2',
          name: 'Sydney Treasury Core (367 George St)',
          center: { lat: -33.8688, lng: 151.2069 },
          zoom: 15,
          sdcCode: 'SDC[+0.0, +0.0]',
          gridSector: 'SEC-SYD-00',
          dispatchVector: 'VEC-SYD-TREASURY',
          timestamp: new Date().toISOString()
        }
      ]);
    };
    fetchRoutes();
  }, []);

  // Snapshot Current Map Center & Zoom as Favorite Route in Database
  const handleSaveSnapshot = async () => {
    try {
      const sdc = toSovereignDispatchCoords(currentCenter.lat, currentCenter.lng);
      const newRoute = {
        name: `SDC Favorite Sector ${sdc.gridSector}`,
        center: currentCenter,
        zoom: currentZoom,
        sdcCode: sdc.sdcString,
        gridSector: sdc.gridSector,
        dispatchVector: sdc.dispatchVector,
        timestamp: new Date().toISOString(),
        description: `Sovereign Route Snapshot (${currentCenter.lat.toFixed(4)}, ${currentCenter.lng.toFixed(4)})`,
      };

      setFavoriteRoutes(prev => [newRoute, ...prev]);

      try {
        await addDoc(collection(db, "favorite_routes"), newRoute);
      } catch (err) {
        console.warn("Firestore snapshot record (cached):", err);
      }

      toast.success(`Route Snapshot saved to database: ${sdc.sdcString} (Zoom ${currentZoom})`);
    } catch (e: any) {
      toast.error("Snapshot failed: " + e.message);
    }
  };

  // Handle ruler point clicking
  const handleRulerPoint = useCallback((pt: { lat: number; lng: number }) => {
    setRulerPoints(prev => {
      if (prev.length >= 2) return [pt]; // reset to 1 point
      return [...prev, pt];
    });
  }, []);

  // Calculate real-time distance and dispatch parameters
  const rulerDistance = rulerPoints.length === 2 
    ? calculateHaversineDistance(rulerPoints[0].lat, rulerPoints[0].lng, rulerPoints[1].lat, rulerPoints[1].lng)
    : 0;
  const rulerBearing = rulerPoints.length === 2
    ? calculateBearing(rulerPoints[0].lat, rulerPoints[0].lng, rulerPoints[1].lat, rulerPoints[1].lng)
    : 0;
  const sdcStart = rulerPoints[0] ? toSovereignDispatchCoords(rulerPoints[0].lat, rulerPoints[0].lng) : null;
  const sdcEnd = rulerPoints[1] ? toSovereignDispatchCoords(rulerPoints[1].lat, rulerPoints[1].lng) : null;

  // Animate vehicle movement from Chatswood to Artarmon
  useEffect(() => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 0.01;
      if (progress > 1) progress = 0; // loop for demo
      
      const newLat = CHATSWOOD_STORE.lat + (ARTARMON_HUB.lat - CHATSWOOD_STORE.lat) * progress;
      const newLng = CHATSWOOD_STORE.lng + (ARTARMON_HUB.lng - CHATSWOOD_STORE.lng) * progress;
      
      setVehiclePos({ lat: newLat, lng: newLng });
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const handleOrderSubmit = (e: any) => {
    e.preventDefault();
    setNotifications(prev => [
      { id: Date.now(), text: `High-value order initiated: ${orderForm.item}. Routing via Secure Fleet to Artarmon.`, time: "Just now", type: "success" },
      ...prev
    ]);
    setActiveTab('map');
  };

  const handleSendMessage = (e: any) => {
    e.preventDefault();
    if (!chatMsg.trim()) return;
    setChatHistory(prev => [...prev, { sender: "You", text: chatMsg, time: "Now" }]);
    setChatMsg("");
    setTimeout(() => {
      setChatHistory(prev => [...prev, { sender: "Sovereign Control", text: "Confirmed. Fleet routing parameters updated. ETA remains stable.", time: "Now" }]);
      setNotifications(prev => [
        { id: Date.now(), text: "Logistics update confirmed by Control.", time: "Just now", type: "info" },
        ...prev
      ]);
    }, 1000);
  };

  return (
    <div className={`min-h-screen rounded-[2.5rem] border overflow-hidden flex flex-col md:flex-row shadow-2xl relative z-10 transition-colors duration-300 ${isHighContrast ? 'bg-black border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
      
      {/* Sidebar Navigation - Collapses when Focus Mode is Active */}
      {!isFocusMode && (
        <div className="w-full md:w-80 bg-slate-900 text-white flex flex-col shrink-0">
          <div className="p-8 border-b border-white/10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h2 className="font-black tracking-widest uppercase text-sm">Sovereign</h2>
                <p className="text-[10px] text-amber-400 font-bold uppercase tracking-widest">Global Logistics Fleet</p>
              </div>
            </div>
            <div className="space-y-2">
              <button 
                onClick={() => setActiveTab('map')}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold tracking-wider uppercase transition-colors flex items-center justify-between ${activeTab === 'map' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
              >
                <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Live Fleet Map</div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </button>
              <button 
                onClick={() => setActiveTab('order')}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold tracking-wider uppercase transition-colors flex items-center justify-between ${activeTab === 'order' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
              >
                <div className="flex items-center gap-2"><Package className="w-4 h-4" /> Secure Receivables</div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </button>
              <button 
                onClick={() => setActiveTab('support')}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold tracking-wider uppercase transition-colors flex items-center justify-between ${activeTab === 'support' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
              >
                <div className="flex items-center gap-2"><MessageSquare className="w-4 h-4" /> Command & Requests</div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </button>
            </div>
          </div>
          
          {/* Live Notifications Feed */}
          <div className="flex-1 p-6 overflow-y-auto">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Bell className="w-3 h-3" /> Live Feed
            </h3>
            <div className="space-y-4">
              <AnimatePresence>
                {notifications.map((n, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={`notif-${n.id}-${idx}`}
                    className="bg-black/40 border border-white/5 rounded-xl p-4"
                  >
                    <p className="text-xs font-semibold text-slate-300 leading-relaxed mb-2">{n.text}</p>
                    <p className="text-[9px] text-slate-500 font-mono uppercase tracking-widest">{n.time}</p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 bg-white relative flex flex-col">
        {activeTab === 'map' && (
          <div className="h-full w-full relative flex-1 min-h-[550px]">
             {/* Overlay Header UI with Focus Mode, High Contrast, Ruler, and Snapshot */}
             <div className="absolute top-4 left-4 right-4 z-[400] flex flex-col gap-3 pointer-events-none">
               <div className="flex flex-wrap items-center justify-between gap-3">
                 
                 {/* Status card */}
                 <div className={`px-5 py-3 rounded-2xl shadow-xl border pointer-events-auto flex items-center gap-5 transition-all ${isHighContrast ? 'bg-black text-white border-amber-400/80 shadow-amber-950/40' : 'bg-white/95 backdrop-blur-md text-slate-900 border-slate-200'}`}>
                   <div>
                     <h3 className={`text-[9px] font-black uppercase tracking-[0.2em] mb-0.5 ${isHighContrast ? 'text-amber-400' : 'text-slate-500'}`}>Tracking ID</h3>
                     <p className="text-xs font-bold font-mono">VAL-9942-XC</p>
                   </div>
                   <div className="w-px h-8 bg-slate-300 dark:bg-slate-700"></div>
                   <div>
                     <h3 className={`text-[9px] font-black uppercase tracking-[0.2em] mb-0.5 ${isHighContrast ? 'text-amber-400' : 'text-slate-500'}`}>Delivery</h3>
                     <p className="text-xs font-bold text-emerald-500 flex items-center gap-1.5">
                       <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                       In Transit
                     </p>
                   </div>
                   <div className="w-px h-8 bg-slate-300 dark:bg-slate-700"></div>
                   <div>
                     <h3 className={`text-[9px] font-black uppercase tracking-[0.2em] mb-0.5 ${isHighContrast ? 'text-amber-400' : 'text-slate-500'}`}>SDC Sector</h3>
                     <p className="text-xs font-mono font-bold text-amber-500">
                       {toSovereignDispatchCoords(currentCenter.lat, currentCenter.lng).sdcString}
                     </p>
                   </div>
                 </div>

                 {/* Focus Mode & Map Tool Controls */}
                 <div className="flex items-center gap-2 pointer-events-auto">
                   
                   {/* Focus Mode Toggle */}
                   <button
                     onClick={() => {
                       setIsFocusMode(prev => !prev);
                       toast.success(isFocusMode ? "Exited Focus Mode" : "Focus Mode Activated: Full-bleed view with high-contrast accessibility & keyboard controls");
                     }}
                     className={`px-3 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md cursor-pointer ${
                       isFocusMode 
                         ? 'bg-amber-500 text-slate-950 border border-amber-300 scale-105' 
                         : isHighContrast 
                         ? 'bg-slate-900 text-white border border-slate-700 hover:bg-slate-800' 
                         : 'bg-white text-slate-800 border border-slate-200 hover:bg-slate-50'
                     }`}
                     title="Focus Mode (Shortcut: F)"
                   >
                     {isFocusMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                     <span className="hidden sm:inline">{isFocusMode ? "Exit Focus" : "Focus Mode"}</span>
                   </button>

                   {/* High Contrast Mode Toggle */}
                   <button
                     onClick={() => {
                       setIsHighContrast(prev => !prev);
                       toast.info(!isHighContrast ? "High-Contrast Accessibility Mode Enabled" : "Standard Palette Restored");
                     }}
                     className={`px-3 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md cursor-pointer ${
                       isHighContrast 
                         ? 'bg-yellow-400 text-slate-950 border border-yellow-300' 
                         : 'bg-white text-slate-800 border border-slate-200 hover:bg-slate-50'
                     }`}
                     title="Toggle High Contrast for Accessibility"
                   >
                     <Sun className="w-4 h-4" />
                     <span className="hidden sm:inline">High Contrast</span>
                   </button>

                   {/* Ruler Tool Toggle */}
                   <button
                     onClick={() => {
                       setIsRulerActive(prev => {
                         const next = !prev;
                         if (!next) setRulerPoints([]);
                         else toast.info("Ruler Active: Click any 2 points on the map to calculate real-time distance and Sovereign dispatch vector");
                         return next;
                       });
                     }}
                     className={`px-3 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md cursor-pointer ${
                       isRulerActive 
                         ? 'bg-rose-600 text-white border border-rose-400 animate-pulse' 
                         : isHighContrast 
                         ? 'bg-slate-900 text-white border border-slate-700' 
                         : 'bg-white text-slate-800 border border-slate-200 hover:bg-slate-50'
                     }`}
                     title="Ruler Tool (Distance Measurement)"
                   >
                     <Ruler className="w-4 h-4" />
                     <span className="hidden sm:inline">Ruler Tool</span>
                   </button>

                   {/* Snapshot Button */}
                   <button
                     onClick={handleSaveSnapshot}
                     className="px-3 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                     title="Save current coordinates & zoom level as Favorite Route in database"
                   >
                     <Camera className="w-4 h-4" />
                     <span className="hidden sm:inline">Snapshot</span>
                   </button>

                   {/* Favorite Routes Dropdown */}
                   <button
                     onClick={() => setShowFavoritesDrawer(prev => !prev)}
                     className={`px-3 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md cursor-pointer ${
                       showFavoritesDrawer 
                         ? 'bg-slate-900 text-white' 
                         : isHighContrast 
                         ? 'bg-slate-900 text-white border border-slate-700' 
                         : 'bg-white text-slate-800 border border-slate-200 hover:bg-slate-50'
                     }`}
                     title="View Saved Favorite Routes"
                   >
                     <Bookmark className="w-4 h-4 text-amber-500" />
                     <span>Favorites ({favoriteRoutes.length})</span>
                   </button>
                 </div>
               </div>

               {/* Ruler instructions banner when active */}
               {isRulerActive && (
                 <div className="bg-rose-950/90 border border-rose-500/50 text-white px-4 py-2 rounded-xl text-xs flex items-center justify-between pointer-events-auto backdrop-blur-md shadow-lg max-w-max">
                   <div className="flex items-center gap-2">
                     <Ruler className="w-4 h-4 text-rose-400" />
                     <span>
                       {rulerPoints.length === 0 && "Click starting point on the map..."}
                       {rulerPoints.length === 1 && "Point 1 selected. Click destination point on map..."}
                       {rulerPoints.length === 2 && "Measurement vector locked."}
                     </span>
                   </div>
                   {rulerPoints.length > 0 && (
                     <button
                       onClick={() => setRulerPoints([])}
                       className="ml-4 text-[10px] uppercase font-bold text-rose-300 hover:underline cursor-pointer"
                     >
                       Reset Points
                     </button>
                   )}
                 </div>
               )}
             </div>

             {/* Floating Ruler Real-Time Distance HUD */}
             {isRulerActive && rulerPoints.length === 2 && (
               <div className="absolute bottom-6 left-6 z-[400] bg-slate-950/95 border border-rose-500/50 rounded-2xl p-4 text-white shadow-2xl max-w-sm backdrop-blur-md">
                 <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                   <div className="flex items-center gap-2">
                     <Compass className="w-4 h-4 text-rose-400" />
                     <span className="text-xs font-black uppercase tracking-wider text-rose-300">
                       Sovereign Dispatch Measurement
                     </span>
                   </div>
                   <button
                     onClick={() => setRulerPoints([])}
                     className="text-slate-400 hover:text-white text-xs font-bold"
                   >
                     <X className="w-3.5 h-3.5" />
                   </button>
                 </div>

                 <div className="space-y-2 text-xs">
                   <div className="flex justify-between items-baseline">
                     <span className="text-slate-400 uppercase text-[10px] font-bold">Real-time Distance</span>
                     <span className="text-xl font-black text-rose-400 font-mono">
                       {rulerDistance.toFixed(2)} km <span className="text-xs text-slate-400">({Math.round(rulerDistance * 1000).toLocaleString()} m)</span>
                     </span>
                   </div>

                   <div className="flex justify-between items-center text-[11px] font-mono">
                     <span className="text-slate-400">Sovereign Vector:</span>
                     <span className="text-amber-400 font-bold">
                       {sdcStart?.sdcString} ➔ {sdcEnd?.sdcString}
                     </span>
                   </div>

                   <div className="flex justify-between items-center text-[11px] font-mono border-t border-slate-800/80 pt-1.5">
                     <span className="text-slate-400">Bearing / Azimuth:</span>
                     <span className="text-white">{rulerBearing}° True North</span>
                   </div>

                   <div className="flex justify-between items-center text-[11px] font-mono">
                     <span className="text-slate-400">Fleet Transit Latency:</span>
                     <span className="text-emerald-400 font-bold">
                       ~{Math.max(1, Math.round(rulerDistance * 1.5))} mins (Priority Drone)
                     </span>
                   </div>
                 </div>
               </div>
             )}

             {/* Accessible Keyboard Controls & Directional Pan Keypad */}
             <div className="absolute bottom-6 right-6 z-[400] flex flex-col items-end gap-2 pointer-events-none">
               <div className={`p-2.5 rounded-2xl shadow-xl border pointer-events-auto flex flex-col items-center gap-1.5 backdrop-blur-md ${isHighContrast ? 'bg-black text-white border-amber-400' : 'bg-white/95 text-slate-800 border-slate-200'}`}>
                 <div className="text-[9px] font-black uppercase tracking-wider text-slate-400 text-center mb-0.5">
                   Accessible Controls
                 </div>
                 
                 {/* Directional pan buttons */}
                 <div className="grid grid-cols-3 gap-1">
                   <div />
                   <button
                     aria-label="Pan North"
                     onClick={() => {
                       const c = currentCenter;
                       setCurrentCenter({ lat: c.lat + 0.006, lng: c.lng });
                       setFlyTarget({ center: { lat: c.lat + 0.006, lng: c.lng }, zoom: currentZoom });
                     }}
                     className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 cursor-pointer"
                   >
                     <ArrowUp className="w-3.5 h-3.5" />
                   </button>
                   <div />
                   <button
                     aria-label="Pan West"
                     onClick={() => {
                       const c = currentCenter;
                       setCurrentCenter({ lat: c.lat, lng: c.lng - 0.006 });
                       setFlyTarget({ center: { lat: c.lat, lng: c.lng - 0.006 }, zoom: currentZoom });
                     }}
                     className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 cursor-pointer"
                   >
                     <ArrowLeft className="w-3.5 h-3.5" />
                   </button>
                   <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-600 flex items-center justify-center text-[10px] font-mono font-black">
                     SDC
                   </div>
                   <button
                     aria-label="Pan East"
                     onClick={() => {
                       const c = currentCenter;
                       setCurrentCenter({ lat: c.lat, lng: c.lng + 0.006 });
                       setFlyTarget({ center: { lat: c.lat, lng: c.lng + 0.006 }, zoom: currentZoom });
                     }}
                     className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 cursor-pointer"
                   >
                     <ArrowRight className="w-3.5 h-3.5" />
                   </button>
                   <div />
                   <button
                     aria-label="Pan South"
                     onClick={() => {
                       const c = currentCenter;
                       setCurrentCenter({ lat: c.lat - 0.006, lng: c.lng });
                       setFlyTarget({ center: { lat: c.lat - 0.006, lng: c.lng }, zoom: currentZoom });
                     }}
                     className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 cursor-pointer"
                   >
                     <ArrowDown className="w-3.5 h-3.5" />
                   </button>
                   <div />
                 </div>

                 {/* Zoom in/out buttons */}
                 <div className="flex items-center gap-1.5 mt-1 border-t border-slate-200 dark:border-slate-700 pt-1.5 w-full justify-center">
                   <button
                     aria-label="Zoom In"
                     onClick={() => {
                       setCurrentZoom(z => z + 1);
                       setFlyTarget({ center: currentCenter, zoom: currentZoom + 1 });
                     }}
                     className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 cursor-pointer"
                   >
                     <ZoomIn className="w-3.5 h-3.5" />
                   </button>
                   <button
                     aria-label="Zoom Out"
                     onClick={() => {
                       setCurrentZoom(z => Math.max(z - 1, 2));
                       setFlyTarget({ center: currentCenter, zoom: Math.max(currentZoom - 1, 2) });
                     }}
                     className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 cursor-pointer"
                   >
                     <ZoomOut className="w-3.5 h-3.5" />
                   </button>
                 </div>

                 <div className="text-[8px] font-mono text-slate-400 text-center mt-0.5">
                   Keys: Arrows / +/-
                 </div>
               </div>
             </div>

             {/* Favorite Routes Drawer Modal */}
             <AnimatePresence>
               {showFavoritesDrawer && (
                 <motion.div
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: 20 }}
                   className="absolute top-20 right-4 z-[450] w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-4 max-h-[70vh] overflow-y-auto"
                 >
                   <div className="flex justify-between items-center mb-3 border-b border-slate-100 dark:border-slate-800 pb-2">
                     <div className="flex items-center gap-2">
                       <Bookmark className="w-4 h-4 text-amber-500" />
                       <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                         Favorite Routes
                       </h4>
                     </div>
                     <button onClick={() => setShowFavoritesDrawer(false)} className="text-slate-400 hover:text-slate-600">
                       <X className="w-4 h-4" />
                     </button>
                   </div>

                   <div className="space-y-2">
                     {favoriteRoutes.map((route, idx) => (
                       <button
                         key={route.id || idx}
                         onClick={() => {
                           setFlyTarget({ center: route.center, zoom: route.zoom || 14 });
                           toast.success(`Navigating to Favorite Route: ${route.name}`);
                           setShowFavoritesDrawer(false);
                         }}
                         className="w-full text-left p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/40 border border-slate-200 dark:border-slate-700 transition-colors group cursor-pointer"
                       >
                         <div className="flex justify-between items-start">
                           <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-amber-600">
                             {route.name}
                           </span>
                           <span className="text-[9px] font-mono uppercase bg-amber-500/20 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded">
                             {route.sdcCode || "SDC"}
                           </span>
                         </div>
                         <div className="text-[10px] text-slate-500 font-mono mt-1">
                           Lat: {route.center?.lat?.toFixed(4)}, Lng: {route.center?.lng?.toFixed(4)} (Zoom {route.zoom})
                         </div>
                       </button>
                     ))}
                   </div>
                 </motion.div>
               )}
             </AnimatePresence>
              
             <MapContainer 
               center={[-33.8042, 151.1850]} 
               zoom={14} 
               scrollWheelZoom={true} 
               style={{ height: '100%', width: '100%', zIndex: 10 }}
               zoomControl={false}
             >
               <TileLayer
                 url={isHighContrast 
                   ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" 
                   : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                 }
                 attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
               />
               
               {/* Map Controllers */}
               <MapControllerComponent 
                 isRulerActive={isRulerActive}
                 onRulerPoint={handleRulerPoint}
                 onMapCenterChange={(c, z) => {
                   setCurrentCenter(c);
                   setCurrentZoom(z);
                 }}
               />
               <MapFlyToHandler target={flyTarget} />

               {/* Westfield Chatswood */}
               <Marker position={[CHATSWOOD_STORE.lat, CHATSWOOD_STORE.lng]} icon={hubIcon}>
                 <Popup>
                   <div className="font-sans">
                     <p className="font-bold text-sm">Westfield Chatswood</p>
                     <p className="text-xs text-slate-500">Origin Point • SDC[+2.4, +6.8]</p>
                   </div>
                 </Popup>
               </Marker>
               
               {/* Artarmon Hub */}
               <Marker position={[ARTARMON_HUB.lat, ARTARMON_HUB.lng]} icon={hubIcon}>
                 <Popup>
                   <div className="font-sans">
                     <p className="font-bold text-sm">Artarmon Sovereign Hub</p>
                     <p className="text-xs text-slate-500">Destination Point • Secure Vault</p>
                   </div>
                 </Popup>
               </Marker>
               
               {/* Moving Vehicle */}
               <Marker position={[vehiclePos.lat, vehiclePos.lng]} icon={vehicleIcon}>
                 <Popup>
                   <div className="font-sans">
                     <p className="font-bold text-sm">Sovereign Fleet #01</p>
                     <p className="text-xs text-emerald-600 font-bold">En Route to Artarmon</p>
                   </div>
                 </Popup>
               </Marker>
               
               <Polyline 
                 positions={[
                   [CHATSWOOD_STORE.lat, CHATSWOOD_STORE.lng],
                   [ARTARMON_HUB.lat, ARTARMON_HUB.lng]
                 ]} 
                 color={isHighContrast ? "#f59e0b" : "#0f172a"} 
                 weight={isHighContrast ? 5 : 4} 
                 dashArray="10, 10" 
                 opacity={0.8} 
               />
               
               {/* Ruler measurement vector line & endpoints */}
               {rulerPoints.length === 2 && (
                 <>
                   <Polyline
                     positions={rulerPoints.map(p => [p.lat, p.lng] as [number, number])}
                     color="#ef4444"
                     weight={4}
                     dashArray="6, 6"
                   />
                   <CircleMarker center={[rulerPoints[0].lat, rulerPoints[0].lng]} radius={8} pathOptions={{ color: '#ef4444', fillColor: '#ffffff', fillOpacity: 1, weight: 3 }} />
                   <CircleMarker center={[rulerPoints[1].lat, rulerPoints[1].lng]} radius={8} pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 1, weight: 3 }} />
                 </>
               )}
               {rulerPoints.length === 1 && (
                 <CircleMarker center={[rulerPoints[0].lat, rulerPoints[0].lng]} radius={8} pathOptions={{ color: '#3b82f6', fillColor: '#ffffff', fillOpacity: 1, weight: 3 }} />
               )}

               {/* Global Points */}
               {GLOBAL_POINTS.map((pt, i) => (
                 <Marker key={`global-pt-${pt.name}-${i}`} position={[pt.lat, pt.lng]}>
                   <Popup>{pt.name} - Global Intercept Point</Popup>
                 </Marker>
               ))}
             </MapContainer>
          </div>
        )}

        {activeTab === 'order' && (
          <div className="h-full overflow-y-auto p-8 md:p-12">
            <div className="max-w-2xl mx-auto">
              <div className="mb-10">
                <h1 className="text-3xl font-black tracking-tighter text-slate-900 mb-3">Order & Receive High-Value Goods</h1>
                <p className="text-slate-500 font-medium">Deploy the Sovereign Fleet to acquire and transport items globally to the Artarmon Hub. Full door-to-door escort guaranteed.</p>
              </div>
              
              <form onSubmit={handleOrderSubmit} className="space-y-8">
                <div className="space-y-6 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Item Description</label>
                    <input 
                      required
                      type="text" 
                      value={orderForm.item}
                      onChange={e => setOrderForm({...orderForm, item: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900" 
                      placeholder="e.g. Apple Vision Pro, 10kg Gold Bullion, Rare Art" 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Declared Value (USD)</label>
                      <input 
                        required
                        type="text" 
                        value={orderForm.value}
                        onChange={e => setOrderForm({...orderForm, value: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900" 
                        placeholder="$10,000+" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Origin Point</label>
                      <select 
                        value={orderForm.origin}
                        onChange={e => setOrderForm({...orderForm, origin: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                      >
                        <option value="Westfield Chatswood">Westfield Chatswood</option>
                        <option value="Apple Store, Sydney (367 George St)">Apple Store, Sydney (367 George St)</option>
                        <option value="Westfield Sydney (Pitt St Mall)">Westfield Sydney (Pitt St Mall)</option>
                        <option value="Custom Location">Custom Location...</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 p-8 rounded-3xl border border-amber-200/50">
                  <h3 className="text-sm font-black text-amber-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-amber-600" /> Strict Delivery Protocol
                  </h3>
                  
                  <div className="space-y-4">
                    <label className="flex items-center justify-between p-4 bg-white rounded-xl border border-amber-100 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600">
                          <PenTool className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">Strict Signature Required</p>
                          <p className="text-xs text-slate-500">Only release parcel to verified ID.</p>
                        </div>
                      </div>
                      <input type="checkbox" checked={orderForm.signatureRequired} readOnly className="w-5 h-5 text-amber-600 rounded" />
                    </label>

                    <label className="flex items-center justify-between p-4 bg-white rounded-xl border border-amber-100 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600">
                          <X className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">NO Authority to Leave (ATL)</p>
                          <p className="text-xs text-slate-500">Do not leave parcel unattended under any circumstances.</p>
                        </div>
                      </div>
                      <input type="checkbox" checked={orderForm.noAuthorityToLeave} readOnly className="w-5 h-5 text-amber-600 rounded" />
                    </label>

                    <label className="flex items-center justify-between p-4 bg-white rounded-xl border border-amber-100 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600">
                          <Bell className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">Direct Door Knock</p>
                          <p className="text-xs text-slate-500">Physical notification upon arrival at Artarmon Hub.</p>
                        </div>
                      </div>
                      <input type="checkbox" checked={orderForm.knockOnDoor} readOnly className="w-5 h-5 text-amber-600 rounded" />
                    </label>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-black text-white py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-3"
                >
                  <Truck className="w-5 h-5" />
                  Dispatch Sovereign Fleet
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'support' && (
          <div className="h-full flex flex-col">
            <div className="p-8 border-b border-slate-100 bg-white">
              <h1 className="text-2xl font-black tracking-tighter text-slate-900">Logistics Command Center</h1>
              <p className="text-slate-500 text-sm font-medium">Direct secure line to fleet operators for routing changes, questions, and intercepts.</p>
            </div>
            
            <div className="flex-1 p-8 overflow-y-auto bg-slate-50/50 space-y-6">
              {chatHistory.map((msg, i) => (
                <div key={`chat-msg-${i}-${msg.sender}`} className={`flex flex-col ${msg.sender === 'You' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[80%] p-4 rounded-2xl ${msg.sender === 'You' ? 'bg-slate-900 text-white rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm'}`}>
                    <p className="text-sm font-semibold">{msg.text}</p>
                  </div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2 px-1">{msg.sender} • {msg.time}</span>
                </div>
              ))}
            </div>

            <div className="p-6 bg-white border-t border-slate-100">
              <form onSubmit={handleSendMessage} className="flex items-center gap-4 max-w-4xl mx-auto">
                <input 
                  type="text" 
                  value={chatMsg}
                  onChange={e => setChatMsg(e.target.value)}
                  placeholder="Request reroute, ETA update, or special handling..." 
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
                <button 
                  type="submit"
                  className="bg-slate-900 hover:bg-black text-white p-3 rounded-xl flex items-center justify-center transition-colors shadow-lg"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
