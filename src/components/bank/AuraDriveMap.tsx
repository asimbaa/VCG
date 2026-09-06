// Complete Reconstruction of AuraDriveMap.tsx
import React, { useState, useEffect, useMemo, useRef, Fragment } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  Tooltip,
  useMap,
  useMapEvents,
  CircleMarker,
  Polygon as LeafletPolygon,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Icon,
  DivIcon,
  LatLngBounds,
  Polyline as LeafletPolyline,
} from "leaflet";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  MapPin,
  Edit3,
  Download,
  Share2,
  Play,
  PenTool,
  Trash2,
  List,
  Navigation,
  Camera,
  Eye,
  MessageSquare,
  X,
  Volume2,
  BellRing,
  ChevronRight,
  Globe,
  ShieldCheck,
  Activity,
  Cpu,
  Fingerprint,
  Zap,
  Lock,
  Unlock,
  Thermometer,
  Car,
  Plane,
  Ship,
  Timer,
  Settings2,
  RefreshCw,
  AlertTriangle
} from "lucide-react";

const bottleneckIcon = new DivIcon({
  html: `<div class="w-6 h-6 flex items-center justify-center bg-rose-500/20 rounded-full border border-rose-500/50 animate-pulse drop-shadow-[0_0_8px_rgba(225,29,72,0.8)]"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg></div>`,
  className: "",
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const transportIcon = new DivIcon({
  html: `<div class="w-3 h-3 bg-indigo-500 rounded-full border border-white shadow-[0_0_10px_rgba(99,102,241,0.8)]"></div>`,
  className: "",
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

const generateMockRoutes = () => {
  return [
    {
      id: "R-101",
      name: "Route Segment - Harbour",
      positions: [
        [-33.865, 151.205],
        [-33.86, 151.21],
        [-33.855, 151.215],
      ],
      category: "luxury",
      transportMode: "car",
      traffic: "high",
      speed: "40km/h",
      eta: "14 mins",
      distance: "2.1km",
      numericDistance: 2.1,
      color: "#f59e0b",
      nodes: [{ time: "08:12", vel: "40km/h" }, { time: "08:15", vel: "45km/h" }, { time: "08:18", vel: "30km/h" }]
    },
    {
      id: "R-102",
      name: "Emergency Corridors",
      positions: [
        [-33.875, 151.2],
        [-33.88, 151.19],
        [-33.885, 151.185],
      ],
      category: "emergency",
      transportMode: "road",
      traffic: "low",
      speed: "80km/h",
      eta: "5 mins",
      distance: "3.5km",
      numericDistance: 3.5,
      color: "#ef4444",
      nodes: [{ time: "08:10", vel: "80km/h" }, { time: "08:12", vel: "85km/h" }, { time: "08:14", vel: "70km/h" }]
    },
    {
      id: "R-103",
      name: "Standard Logistics",
      positions: [
        [-33.870, 151.200],
        [-33.875, 151.205],
        [-33.880, 151.210],
        [-33.865, 151.205], // intersection with R-101
      ],
      category: "standard",
      transportMode: "car",
      traffic: "high",
      speed: "50km/h",
      eta: "12 mins",
      distance: "2.8km",
      numericDistance: 2.8,
      color: "#3b82f6",
      nodes: [{ time: "09:00", vel: "50km/h" }, { time: "09:03", vel: "50km/h" }, { time: "09:06", vel: "50km/h" }, { time: "09:10", vel: "50km/h" }]
    }
  ];
};

const CustomZoomControlOverlay = () => {
  const map = useMap();
  return (
    <div className="absolute top-1/2 -translate-y-1/2 right-4 z-[400] pointer-events-auto flex flex-col gap-2">
      <button onClick={() => map.zoomIn()} className="w-8 h-8 bg-slate-900 border border-slate-700 text-white rounded flex items-center justify-center hover:bg-slate-800">+</button>
      <button onClick={() => map.zoomOut()} className="w-8 h-8 bg-slate-900 border border-slate-700 text-white rounded flex items-center justify-center hover:bg-slate-800">-</button>
    </div>
  );
};

const AutoFitBounds = ({ routes }: { routes: any[] }) => {
  const map = useMap();
  useEffect(() => {
    if (routes.length === 0) return;
    const bounds = new LatLngBounds([]);
    routes.forEach((route) => {
      route.positions.forEach((pos: number[]) => {
        bounds.extend([pos[0], pos[1]]);
      });
    });
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], animate: true, duration: 1 });
    }
  }, [routes, map]);
  return null;
};

const MapInteractions = ({
  annotateMode,
  setAnnotations,
  setContextMenu,
  isDrawingRoute,
  setNewRoutePoints,
  routeSegments
}: any) => {
  const map = useMap();
  useMapEvents({
    click(e) {
      setContextMenu(null);
      if (annotateMode) {
        const text = window.prompt("Enter Annotation Label:");
        if (text) {
          setAnnotations((prev: any[]) => [
            ...prev,
            { id: Date.now().toString(), lat: e.latlng.lat, lng: e.latlng.lng, text },
          ]);
          toast.success("Tactical Annotation Deployed.");
        }
      } else if (isDrawingRoute) {
        let snappedPos = [e.latlng.lat, e.latlng.lng];
        let minDistance = Infinity;
        routeSegments.forEach((route: any) => {
            route.positions.forEach((pos: any) => {
                const dist = map.distance(e.latlng, {lat: pos[0], lng: pos[1]});
                if (dist < 150 && dist < minDistance) { // snap threshold
                    minDistance = dist;
                    snappedPos = [pos[0], pos[1]];
                }
            });
        });
        setNewRoutePoints((prev: any) => [...prev, snappedPos]);
      }
    },
  });
  return null;
};

export const AuraDriveMap = ({ localFleet = [] }: { localFleet?: any[] }) => {
  const [routeSegments, setRouteSegments] = useState<any[]>(generateMockRoutes());
  const [hoveredRouteId, setHoveredRouteId] = useState<string | null>(null);
  const [selectedRouteIds, setSelectedRouteIds] = useState<string[]>([]);
  const [isDrawingRoute, setIsDrawingRoute] = useState(false);
  const [newRoutePoints, setNewRoutePoints] = useState<[number, number][]>([]);
  const [annotateMode, setAnnotateMode] = useState(false);
  const [polygonSelectionMode, setPolygonSelectionMode] = useState(false);
  const [annotations, setAnnotations] = useState<any[]>([]);
  const [contextMenu, setContextMenu] = useState<any>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [showControls, setShowControls] = useState(false);
  const [mapLayer, setMapLayer] = useState("dark");
  const [categories, setCategories] = useState({ standard: true, luxury: true, emergency: true });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Bottleneck calculations
  const bottlenecks = useMemo(() => {
    const highTrafficRoutes = routeSegments.filter((r: any) => r.traffic === "high" || parseInt(r.traffic) > 80);
    const pointMap: { [key: string]: string[] } = {};
    
    highTrafficRoutes.forEach((r: any) => {
      r.positions.forEach((pos: any) => {
        const key = `${pos[0].toFixed(4)},${pos[1].toFixed(4)}`;
        if (!pointMap[key]) pointMap[key] = [];
        if (!pointMap[key].includes(r.id)) pointMap[key].push(r.id);
      });
    });

    const intersections: [number, number][] = [];
    Object.keys(pointMap).forEach((key) => {
      if (pointMap[key].length > 1) {
        const [lat, lng] = key.split(',').map(Number);
        intersections.push([lat, lng]);
      }
    });

    if (intersections.length === 0 && highTrafficRoutes.length > 0) {
        highTrafficRoutes.forEach((r: any) => {
            if(r.positions.length > 2) {
                intersections.push(r.positions[Math.floor(r.positions.length / 2)] as [number, number]);
            }
        });
    }
    return intersections;
  }, [routeSegments]);

  const checkIsVisible = (route: any) => {
    if (searchQuery && !route.name.toLowerCase().includes(searchQuery.toLowerCase()) && !route.id.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
    }
    return (categories as any)[route.category] !== false;
  };

  const filteredRoutes = routeSegments.filter(checkIsVisible);

  return (
    <div className="w-full h-full relative font-sans overflow-hidden bg-slate-900 flex">
      <div className="flex-1 relative h-full">
        <MapContainer center={[-33.8688, 151.2093]} zoom={13} className="w-full h-full bg-slate-900" zoomControl={false}>
          <TileLayer
            url={mapLayer === "dark" ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"}
          />
          <CustomZoomControlOverlay />
          <AutoFitBounds routes={filteredRoutes} />
          <MapInteractions
            annotateMode={annotateMode}
            setAnnotations={setAnnotations}
            setContextMenu={setContextMenu}
            isDrawingRoute={isDrawingRoute}
            setNewRoutePoints={setNewRoutePoints}
            routeSegments={routeSegments}
          />

          {filteredRoutes.map((route) => (
            <Fragment key={route.id}>
              <Polyline
                positions={route.positions as [number, number][]}
                pathOptions={{
                  color: selectedRouteIds.includes(route.id) ? "#f59e0b" : route.color || "#3b82f6",
                  weight: hoveredRouteId === route.id ? 6 : 4,
                  opacity: 0.8
                }}
                eventHandlers={{
                  click: () => {
                      if(selectedRouteIds.includes(route.id)) setSelectedRouteIds(selectedRouteIds.filter(id => id !== route.id));
                      else setSelectedRouteIds([...selectedRouteIds, route.id]);
                  },
                  mouseover: () => setHoveredRouteId(route.id),
                  mouseout: () => setHoveredRouteId(null)
                }}
              >
                <Tooltip direction="top" sticky className="bg-slate-900 text-white border-slate-700">
                  <div className="text-xs font-bold">{route.name}</div>
                  <div className="text-[10px] text-slate-400">Category: {route.category}</div>
                </Tooltip>
              </Polyline>
            </Fragment>
          ))}

          {bottlenecks.map((pos, idx) => (
            <Marker key={`bottleneck-${idx}`} position={pos as any} icon={bottleneckIcon}>
              <Tooltip direction="top" className="custom-leaflet-tooltip bg-slate-900 border border-slate-700 text-white rounded">
                <div className="flex items-center gap-1 font-bold text-rose-500">
                  <AlertTriangle className="w-3 h-3" /> Critical Bottleneck (Traffic &gt; 80%)
                </div>
              </Tooltip>
            </Marker>
          ))}

          {newRoutePoints.length > 0 && (
            <Polyline
              positions={newRoutePoints}
              pathOptions={{ color: '#10b981', weight: 4, dashArray: '5, 10' }}
            />
          )}
          {newRoutePoints.map((pos, i) => (
            <CircleMarker
              key={`new-pt-${i}`}
              center={pos}
              radius={4}
              pathOptions={{ color: '#10b981', fillColor: '#059669', fillOpacity: 1 }}
            />
          ))}

          {annotations.map(ann => (
              <Marker key={ann.id} position={[ann.lat, ann.lng]}>
                  <Popup>{ann.text}</Popup>
              </Marker>
          ))}
        </MapContainer>

        {isDrawingRoute && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[400] bg-slate-900/90 backdrop-blur-md border border-emerald-500/50 p-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4 pointer-events-auto">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-emerald-400 font-bold text-xs uppercase tracking-widest">Draw Mode Active</span>
            </div>
            <div className="w-px h-6 bg-slate-700" />
            <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">
              Nodes: {newRoutePoints.length}
            </div>
            <div className="w-px h-6 bg-slate-700" />
            <Button 
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-500 text-white h-7 text-[10px] uppercase font-black"
              onClick={() => {
                if (newRoutePoints.length > 1) {
                  const newSegment = {
                    id: `R-CUSTOM-${Date.now().toString().slice(-4)}`,
                    name: "User Defined Transit Path",
                    positions: newRoutePoints,
                    category: "standard",
                    transportMode: "road",
                    traffic: "low",
                    speed: "60km/h",
                    eta: "15 mins",
                    distance: "Custom",
                    numericDistance: 5.0,
                    color: "#10b981",
                    nodes: newRoutePoints.map((p,i) => ({ time: "T00", vel: "60km/h" }))
                  };
                  setRouteSegments(prev => [...prev, newSegment]);
                  toast.success("Custom Route Committed to Global Registry.");
                }
                setIsDrawingRoute(false);
                setNewRoutePoints([]);
              }}
            >
              Commit Segment
            </Button>
            <Button 
              size="sm"
              variant="ghost"
              className="text-slate-400 hover:text-rose-400 h-7 text-[10px] uppercase font-black"
              onClick={() => {
                setIsDrawingRoute(false);
                setNewRoutePoints([]);
              }}
            >
              Cancel
            </Button>
          </div>
        )}

      </div>

      <div className="w-96 bg-slate-900/95 backdrop-blur-xl border-l border-slate-700/50 h-full p-4 flex flex-col z-[500] pointer-events-auto overflow-y-auto">
        <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-black uppercase text-white tracking-widest">Route Intelligence</span>
        </div>
        
        <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 mb-4">
            <div className="flex items-center gap-2 mb-3">
                <Search className="w-4 h-4 text-slate-400" />
                <input 
                    type="text"
                    placeholder="Search routes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent border-none outline-none text-xs text-white placeholder-slate-500 flex-1"
                />
            </div>
            
            <div className="flex flex-col gap-1.5 mb-2 border-t border-slate-700/50 pt-2">
                <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Metadata Layer Filtering</span>
                <div className="flex gap-2">
                <button
                    onClick={() => setCategories((prev) => ({ ...prev, luxury: !prev.luxury }))}
                    className={`flex-1 rounded-lg p-1 text-[9px] uppercase font-bold transition-colors ${categories.luxury ? "bg-amber-600/30 text-amber-400 border border-amber-500/50" : "bg-slate-800 text-slate-500 border border-slate-700"}`}
                >
                    Luxury
                </button>
                <button
                    onClick={() => setCategories((prev) => ({ ...prev, standard: !prev.standard }))}
                    className={`flex-1 rounded-lg p-1 text-[9px] uppercase font-bold transition-colors ${categories.standard ? "bg-blue-600/30 text-blue-400 border border-blue-500/50" : "bg-slate-800 text-slate-500 border border-slate-700"}`}
                >
                    Standard
                </button>
                <button
                    onClick={() => setCategories((prev) => ({ ...prev, emergency: !prev.emergency }))}
                    className={`flex-1 rounded-lg p-1 text-[9px] uppercase font-bold transition-colors ${categories.emergency ? "bg-red-600/30 text-red-400 border border-red-500/50" : "bg-slate-800 text-slate-500 border border-slate-700"}`}
                >
                    Emergency
                </button>
                </div>
            </div>

            <div className="flex gap-2 border-t border-slate-700/50 pt-2 mt-2">
                <button
                    onClick={() => {
                        setIsDrawingRoute(!isDrawingRoute);
                        if (isDrawingRoute) setNewRoutePoints([]);
                    }}
                    className={`flex-1 rounded-lg p-1.5 flex justify-center items-center gap-1 text-[9px] uppercase font-bold transition-colors ${isDrawingRoute ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/50" : "bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700"}`}
                    title="Draw Custom Route Segment (Auto-Snaps to Network)"
                >
                    <Navigation className="w-3 h-3" /> Draw Route
                </button>
                <button
                    onClick={() => setMapLayer(mapLayer === "dark" ? "light" : "dark")}
                    className="flex-1 rounded-lg p-1.5 flex justify-center items-center gap-1 text-[9px] uppercase font-bold transition-colors bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700"
                >
                    <Globe className="w-3 h-3" /> {mapLayer === "dark" ? "Light Mode" : "Dark Mode"}
                </button>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-1">
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2 block">Active Routes ({filteredRoutes.length})</span>
            <div className="flex flex-col gap-2">
                {filteredRoutes.map(route => (
                    <div 
                        key={route.id}
                        onMouseEnter={() => setHoveredRouteId(route.id)}
                        onMouseLeave={() => setHoveredRouteId(null)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer ${selectedRouteIds.includes(route.id) ? "bg-slate-800/80 border-emerald-500/50" : "bg-slate-800/30 border-slate-700/50 hover:bg-slate-800"}`}
                        onClick={() => {
                            if(selectedRouteIds.includes(route.id)) setSelectedRouteIds(selectedRouteIds.filter(id => id !== route.id));
                            else setSelectedRouteIds([...selectedRouteIds, route.id]);
                        }}
                    >
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-white">{route.name}</span>
                            <span className="text-[10px] text-slate-400 bg-slate-900 px-1.5 rounded">{route.category}</span>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-slate-400">
                            <span className="flex items-center gap-1"><Timer className="w-3 h-3 text-amber-500" /> {route.eta}</span>
                            <span className="flex items-center gap-1"><Activity className="w-3 h-3 text-rose-500" /> Traffic: {route.traffic}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>

      </div>
    </div>
  );
};
