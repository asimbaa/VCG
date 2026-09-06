// AuraDriveMap.tsx - Updated with Route Simulation & Neural Sentry (Leaflet version)
import React, { useState, useEffect, useRef, Fragment } from "react";
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
import html2canvas from "html2canvas";
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
  Layers,
  CheckSquare,
  Square,
  Timer,
  MousePointer2,
  Settings2,
  Map as MapIcon,
  Palette,
  Focus,
  Plane,
  Car,
  Ship,
  RefreshCw,
  FileJson,
  Scissors,
  Merge,
  AlertTriangle,
  Plus,
  Minus
} from "lucide-react";

const transportIcon = new DivIcon({
  html: `<div class="w-4 h-4 bg-indigo-500 rounded-full border-2 border-white shadow-lg"></div>`,
  className: "",
  iconSize: [16, 16],
});

const NeuralSentryOverlay = () => {
  return (
    <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden rounded-[2.5rem]">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full border-[1px] border-emerald-500/10 rounded-full animate-[spin_10s_linear_infinite]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 border-[1px] border-emerald-500/20 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
    </div>
  );
};

const MapInteractions = ({
  annotateMode,
  setAnnotations,
  setContextMenu,
}: any) => {
  useMapEvents({
    click(e) {
      setContextMenu(null);
      if (annotateMode) {
        const text = window.prompt("Enter Annotation Label:");
        if (text) {
          setAnnotations((prev: any[]) => [
            ...prev,
            {
              id: Date.now().toString(),
              lat: e.latlng.lat,
              lng: e.latlng.lng,
              text,
            },
          ]);
          toast.success("Tactical Annotation Deployed.");
        }
      }
    },
  });
  return null;
};

function isPointInPolygon(point, vs) {
  let x = point[0],
    y = point[1];
  let inside = false;
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    let xi = vs[i][0],
      yi = vs[i][1];
    let xj = vs[j][0],
      yj = vs[j][1];
    let intersect =
      yi > y != yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

const PolygonSelectionTool = ({ polygonSelectionMode, onComplete }: any) => {
  const [drawing, setDrawing] = useState(false);
  const [points, setPoints] = useState<[number, number][]>([]);
  const map = useMap();

  useMapEvents({
    mousedown(e) {
      if (!polygonSelectionMode) return;
      map.dragging.disable();
      setDrawing(true);
      setPoints([[e.latlng.lat, e.latlng.lng]]);
    },
    mousemove(e) {
      if (!drawing) return;
      setPoints((prev) => [...prev, [e.latlng.lat, e.latlng.lng]]);
    },
    mouseup(e) {
      if (!drawing) return;
      setDrawing(false);
      map.dragging.enable();
      if (points.length > 2) {
        onComplete(points);
      }
      setPoints([]);
    },
  });

  return points.length > 2 ? (
    <LeafletPolygon
      positions={points}
      pathOptions={{
        color: "#8b5cf6",
        fillOpacity: 0.2,
        weight: 2,
        dashArray: "5, 5",
      }}
    />
  ) : null;
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


const CustomZoomControlOverlay = () => {
  const map = useMap();
  return (
    <div className="absolute top-1/2 -translate-y-1/2 right-4 z-[400] pointer-events-auto flex flex-col gap-2">
      <button onClick={(e) => { e.stopPropagation(); map.zoomIn(); }} className="bg-slate-900/80 backdrop-blur-md border border-slate-700 text-slate-300 p-2 rounded-xl shadow-lg hover:bg-slate-800 transition-colors group" title="Zoom In">
        <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
      </button>
      <button onClick={(e) => { e.stopPropagation(); map.zoomOut(); }} className="bg-slate-900/80 backdrop-blur-md border border-slate-700 text-slate-300 p-2 rounded-xl shadow-lg hover:bg-slate-800 transition-colors group" title="Zoom Out">
        <Minus className="w-4 h-4 group-hover:scale-110 transition-transform" />
      </button>
    </div>
  );
};

export function AuraDriveMap({
  style,
  fleet,
}: {
  style?: React.CSSProperties;
  fleet?: any[];
}) {
  const [activeCar, setActiveCar] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBulkImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const geojson = JSON.parse(ev.target?.result as string);
        const features =
          geojson.features || (geojson.type === "Feature" ? [geojson] : []);
        const newRoutes = features
          .filter(
            (f: any) =>
              f.geometry &&
              (f.geometry.type === "LineString" ||
                f.geometry.type === "MultiLineString"),
          )
          .map((f: any, i: number) => {
            const coords =
              f.geometry.type === "MultiLineString"
                ? f.geometry.coordinates[0].map((c: any) => [c[1], c[0]])
                : f.geometry.coordinates.map((c: any) => [c[1], c[0]]);
            return {
              id: `IMP-${Date.now().toString().slice(-4)}-${i}`,
              name: f.properties?.name || `Imported Route ${i + 1}`,
              positions: coords,
              nodes: coords.map((c: any) => ({
                time: new Date().toISOString().substring(11, 19),
                vel: "30km/h",
              })),
              color: "#06C167",
              distance: "N/A",
              numericDistance: 0,
              eta: "N/A",
              traffic: "low",
              speed: "N/A",
              category: "standard",
              transportMode: "road",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
          });
        if (newRoutes.length === 0)
          throw new Error("No valid LineStrings found");
        setRouteSegments((prev) => [...prev, ...newRoutes]);
        toast.success(`Successfully imported ${newRoutes.length} routes.`);
      } catch (err) {
        toast.error("Failed to parse GeoJSON.");
      }
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsText(file);
  };

  const applyStylePreset = (preset: "treasury" | "tech" | "emergency") => {
    const colors = {
      treasury: "#fbbf24",
      tech: "#3b82f6",
      emergency: "#ef4444",
    };
    setRouteSegments((prev) =>
      prev.map((r) => ({
        ...r,
        color: colors[preset],
        updatedAt: new Date().toISOString(),
      })),
    );
    toast.success(`Applied ${preset.toUpperCase()} theme to all routes.`);
  };

  const [sentryActive, setSentryActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const localFleet = fleet || [
    {
      id: 1,
      lat: -33.8688,
      lng: 151.2093,
      name: "AURA-9 Alpha",
      status: "Active",
    },
    { id: 2, lat: -33.87, lng: 151.2, name: "AURA-9 Beta", status: "Charging" },
    { id: 3, lat: -33.88, lng: 151.21, name: "AURA-9 Gamma", status: "Active" },
  ];

  const [trafficView, setTrafficView] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [categories, setCategories] = useState({
    standard: true,
    luxury: true,
    emergency: true,
  });
  const [showLabels, setShowLabels] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedRouteIds, setSelectedRouteIds] = useState<string[]>([]);
  const [animSpeed, setAnimSpeed] = useState(300);
  const [showControls, setShowControls] = useState(false);

  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    route: any;
  } | null>(null);
  const [annotateMode, setAnnotateMode] = useState(false);
  const [annotations, setAnnotations] = useState<
    { id: string; lat: number; lng: number; text: string }[]
  >([]);
  const [pathEditModeFor, setPathEditModeFor] = useState<string | null>(null);

  const [mapLayer, setMapLayer] = useState<"dark" | "street" | "satellite">(
    "dark",
  );
  const [editingStyleFor, setEditingStyleFor] = useState<string | null>(null);

  const [transportModes, setTransportModes] = useState({
    road: true,
    air: true,
    maritime: true,
  });
  const [torrensSync, setTorrensSync] = useState(false);
  const [liveTraffic, setLiveTraffic] = useState(false);

  const [polygonSelectionMode, setPolygonSelectionMode] = useState(false);
  const [replayingRouteId, setReplayingRouteId] = useState<string | null>(null);
  const [replayPos, setReplayPos] = useState<[number, number] | null>(null);



  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const routeIds = urlParams.get("routeIds");
    const routeId = urlParams.get("routeId"); // Backwards compatibility
    if (routeIds) {
      setSelectedRouteIds(routeIds.split(","));
    } else if (routeId) {
      setSelectedRouteIds([routeId]);
    }

    if (urlParams.get("q")) setSearchQuery(urlParams.get("q") || "");
    if (urlParams.get("layer")) setMapLayer(urlParams.get("layer") as any);
    if (urlParams.get("traffic") === "true") setTrafficView(true);

    const cats = urlParams.get("cats");
    if (cats) {
      const active = cats.split(",");
      setCategories({
        standard: active.includes("standard"),
        luxury: active.includes("luxury"),
        emergency: active.includes("emergency"),
      });
    }

    const transports = urlParams.get("transports");
    if (transports) {
      const active = transports.split(",");
      setTransportModes({
        road: active.includes("road"),
        air: active.includes("air"),
        maritime: active.includes("maritime"),
      });
    }
  }, []);

  const handlePolygonComplete = (polygon: [number, number][]) => {
    setPolygonSelectionMode(false);
    const selected = routeSegments
      .filter((route) => {
        return route.positions.some((pos) => isPointInPolygon(pos, polygon));
      })
      .map((r) => r.id);

    if (selected.length > 0) {
      setSelectedRouteIds(selected);
      toast.success(`Selected ${selected.length} routes via polygon.`);
    } else {
      toast.info("No routes found in selected area.");
    }
  };

  const handleShare = () => {
    const url = new URL(window.location.href);
    if (selectedRouteIds.length > 0) {
      url.searchParams.set("routeIds", selectedRouteIds.join(","));
    }
    url.searchParams.set("traffic", trafficView ? "true" : "false");
    if (searchQuery) url.searchParams.set("q", searchQuery);
    url.searchParams.set("layer", mapLayer);

    // Add categories
    const activeCats = Object.keys(categories)
      .filter((k) => categories[k])
      .join(",");
    if (activeCats) url.searchParams.set("cats", activeCats);

    // Add transport modes
    const activeTransports = Object.keys(transportModes)
      .filter((k) => transportModes[k])
      .join(",");
    if (activeTransports) url.searchParams.set("transports", activeTransports);

    window.history.pushState({}, "", url.toString());
    navigator.clipboard.writeText(url.toString());
    toast.success("Share link generated and copied to clipboard.");
  };

  const handleReplayRoute = (id: string) => {
    if (replayingRouteId === id) {
      setReplayingRouteId(null);
      setReplayPos(null);
    } else {
      setReplayingRouteId(id);
      setReplayPos(null);
    }
  };

  const handleSnapshot = async () => {
    const mapElement = document.querySelector(".leaflet-container");
    if (!mapElement) return;
    toast.loading("Capturing high-quality snapshot...", { id: "snapshot" });
    try {
      const canvas = await html2canvas(mapElement as HTMLElement, {
        useCORS: true,
        logging: false,
      });
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = `valourian-tactical-map-${Date.now()}.png`;
      a.click();
      toast.success("Snapshot captured and saved", { id: "snapshot" });
    } catch (err) {
      toast.error("Failed to capture snapshot", { id: "snapshot" });
    }
  };

  const [hoveredRouteId, setHoveredRouteId] = useState<string | null>(null);

  const [routeSegments, setRouteSegments] = useState<any[]>([
    {
      id: "R-101",
      name: "Route Segment - Harbour",
      positions: [
        [-33.865, 151.205],
        [-33.86, 151.21],
        [-33.855, 151.215],
      ],
      nodes: [
        { time: "08:12:00", vel: "40km/h" },
        { time: "08:14:30", vel: "45km/h" },
        { time: "08:18:00", vel: "38km/h" },
      ],
      color: "#06C167",
      distance: "4.2 km",
      numericDistance: 4.2,
      eta: "14 mins",
      traffic: "low",
      speed: "42 km/h",
      category: "standard",
      transportMode: "road",
    },
    {
      id: "R-102",
      name: "Route Segment - CBD Core",
      positions: [
        [-33.875, 151.215],
        [-33.87, 151.21],
        [-33.865, 151.2],
      ],
      nodes: [
        { time: "09:00:00", vel: "10km/h" },
        { time: "09:05:00", vel: "15km/h" },
        { time: "09:08:00", vel: "8km/h" },
      ],
      color: "#3b82f6",
      distance: "1.8 km",
      numericDistance: 1.8,
      eta: "8 mins",
      traffic: "high",
      speed: "12 km/h",
      category: "luxury",
      transportMode: "air",
    },
    {
      id: "R-103",
      name: "Route Segment - Eastern Suburbs",
      positions: [
        [-33.88, 151.22],
        [-33.885, 151.225],
        [-33.89, 151.23],
      ],
      nodes: [
        { time: "14:20:00", vel: "25km/h" },
        { time: "14:25:00", vel: "30km/h" },
        { time: "14:32:00", vel: "35km/h" },
      ],
      color: "#8b5cf6",
      distance: "6.5 km",
      numericDistance: 6.5,
      eta: "22 mins",
      traffic: "medium",
      speed: "28 km/h",
      category: "emergency",
      transportMode: "maritime",
    },
  ]);
  const [showCoordsFor, setShowCoordsFor] = useState<string | null>(null);

  useEffect(() => {
    let animationFrame: number;
    let startTime: number;
    
    if (replayingRouteId) {
      const route = routeSegments.find(r => r.id === replayingRouteId);
      if (!route || route.positions.length < 2) {
        setReplayingRouteId(null);
        return;
      }
      
      const parseTime = (t: string) => {
        const [h,m,s] = t.split(':').map(Number);
        return (h*3600 + m*60 + (s || 0)) * 1000;
      };
      
      const nodes = route.nodes || [];
      const positions = route.positions;
      const timestamps = positions.map((_, i) => {
        if (nodes[i] && nodes[i].time) return parseTime(nodes[i].time);
        return i * 5000;
      });
      
      for (let i = 1; i < timestamps.length; i++) {
        if (timestamps[i] <= timestamps[i-1]) timestamps[i] = timestamps[i-1] + 5000;
      }
      
      const totalDuration = timestamps[timestamps.length - 1] - timestamps[0];
      const speedUpFactor = 10;
      const actualDuration = totalDuration / speedUpFactor;

      const animate = (time: number) => {
        if (!startTime) startTime = time;
        const elapsed = time - startTime;
        
        if (elapsed >= actualDuration) {
          setReplayPos(positions[positions.length - 1] as [number, number]);
          setTimeout(() => setReplayingRouteId(null), 1000);
          return;
        }
        
        const simTime = timestamps[0] + (elapsed * speedUpFactor);
        
        let i = 0;
        while (i < timestamps.length - 1 && timestamps[i+1] < simTime) {
          i++;
        }
        
        const p1 = positions[i];
        const p2 = positions[i+1] || p1;
        const t1 = timestamps[i];
        const t2 = timestamps[i+1] || t1;
        
        const progress = t2 === t1 ? 0 : (simTime - t1) / (t2 - t1);
        const lat = p1[0] + (p2[0] - p1[0]) * progress;
        const lng = p1[1] + (p2[1] - p1[1]) * progress;
        
        setReplayPos([lat, lng]);
        animationFrame = requestAnimationFrame(animate);
      };
      
      animationFrame = requestAnimationFrame(animate);
    }
    
    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [replayingRouteId, routeSegments]);

  const filteredFleet = localFleet.filter(
    (car) =>
      car.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      car.id.toString() === searchQuery,
  );


  const getRouteColor = (route: any) => {
    if (hoveredRouteId === route.id) return "#fbbf24";
    if (highContrast) return "#FFFFFF";
    if (trafficView) {
      if (route.traffic === "low") return "#22c55e";
      if (route.traffic === "medium") return "#eab308";
      if (route.traffic === "high") return "#ef4444";
    }
    return route.color;
  };

  const getRouteWeight = (route: any) => {
    let weight = 4;
    if (
      searchQuery &&
      (route.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        route.id.toLowerCase().includes(searchQuery.toLowerCase()))
    ) {
      weight = 6;
    }
    if (hoveredRouteId === route.id || selectedRouteIds.includes(route.id)) {
      weight = 8;
    }
    if (highContrast) {
      weight += 3;
    }
    return weight;
  };

  const getRouteOpacity = (route: any) => {
    if (highContrast) return 1;
    if (hoveredRouteId === route.id) return 1;
    if (
      searchQuery &&
      (route.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        route.id.toLowerCase().includes(searchQuery.toLowerCase()))
    )
      return 1;
    return 0.6;
  };

  const handleExportKML = (
    route: any,
    quality: "simplified" | "high" = "high",
  ) => {
    let positionsToExport = route.positions;
    if (quality === "simplified") {
      // Keep every 3rd point for simplification
      positionsToExport = route.positions.filter((_, i) => i % 3 === 0);
    }

    const kmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>${route.name}</name>
    <description>Quality: ${quality}</description>
    <Placemark>
      <name>${route.id}</name>
      <LineString>
        <coordinates>
          ${positionsToExport.map((p: any[]) => `${p[1]},${p[0]},0`).join(" ")}
        </coordinates>
      </LineString>
    </Placemark>
  </Document>
</kml>`;

    const blob = new Blob([kmlContent], {
      type: "application/vnd.google-earth.kml+xml",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${route.id}-${quality}.kml`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${route.id} KML (${quality} precision)`);
  };

  const handleArchiveRoute = async (route: any) => {
    try {
      const { db } = await import('../../firebase');
      const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
      await addDoc(collection(db, "archived_routes"), {
        ...route,
        archivedAt: serverTimestamp()
      });
      setRouteSegments((prev) => prev.filter((r) => r.id !== route.id));
      setSearchQuery("");
      setShowCoordsFor(null);
      toast.success(`Archived ${route.id} from active view and persisted to database`);
    } catch (e) {
      console.error(e);
      toast.error("Failed to archive route to database.");
    }
  };

  const handleEditRoute = (route: any) => {
    toast.info(`Edit mode activated for ${route.id}. Drag points to adjust.`);
  };

  const handleExportJSON = (route: any) => {
    const schema = {
      id: route.id,
      name: route.name,
      distance: route.distance,
      eta: route.eta,
      geometry: route.positions,
      telemetry: route.nodes,
      classification: route.category,
      transportMode: route.transportMode,
      timestamp: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(schema, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `valourian-cold-storage-${route.id}-${Date.now()}.json`;
    a.click();
    toast.success("JSON Schema backed up to Cold Storage");
  };

  const handleSplitRoute = (route: any) => {
    if (route.positions.length < 2) {
      toast.error("Segment too short to split.");
      return;
    }
    const mid = Math.floor(route.positions.length / 2);
    const p1 = route.positions.slice(0, mid + 1);
    const p2 = route.positions.slice(mid);
    const n1 = route.nodes.slice(0, mid + 1);
    const n2 = route.nodes.slice(mid);

    const r1 = {
      ...route,
      id: `${route.id}-A`,
      name: `${route.name} (Alpha)`,
      positions: p1,
      nodes: n1,
    };
    const r2 = {
      ...route,
      id: `${route.id}-B`,
      name: `${route.name} (Beta)`,
      positions: p2,
      nodes: n2,
    };

    setRouteSegments((prev) => {
      const keep = prev.filter((r) => r.id !== route.id);
      return [...keep, r1, r2];
    });
    setSearchQuery("");
    toast.success("Segment bifurcated successfully.");
  };

  const handleMergeRoutes = () => {
    if (selectedRouteIds.length < 2) return;
    setRouteSegments((prev) => {
      const routesToMerge = prev.filter((r) => selectedRouteIds.includes(r.id));
      const keep = prev.filter((r) => !selectedRouteIds.includes(r.id));
      const mergedPositions = routesToMerge.flatMap((r) => r.positions);
      const mergedNodes = routesToMerge.flatMap((r) => r.nodes);
      const newRoute = {
        ...routesToMerge[0],
        id: `R-MERGED-${Date.now().toString().slice(-4)}`,
        name: `Merged: ${routesToMerge.map((r) => r.name).join(" + ")}`,
        positions: mergedPositions,
        nodes: mergedNodes,
        distance: `${routesToMerge.reduce((acc, r) => acc + (r.numericDistance || 0), 0).toFixed(1)} km`,
        numericDistance: routesToMerge.reduce(
          (acc, r) => acc + (r.numericDistance || 0),
          0,
        ),
      };
      return [...keep, newRoute];
    });
    setSelectedRouteIds([]);
    setSelectionMode(false);
    toast.success("Segments successfully merged.");
  };

  const checkIsVisible = (route: any) => {
    return (
      (searchQuery === "" ||
        route.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        route.id.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (categories as any)[(route as any).category] &&
      (transportModes as any)[(route as any).transportMode]
    );
  };

  const filteredRoutes = routeSegments.filter(checkIsVisible);
  const activePolylinesCount = filteredRoutes.length;

  const aggregateMetrics = selectedRouteIds.reduce((acc, id) => {
    const r = routeSegments.find((rs) => rs.id === id);
    if (!r) return acc;
    acc.distance += r.numericDistance || 0;
    
    // Parse ETA (e.g. "14 mins" or "1.5 hours")
    let mins = 0;
    if (r.eta) {
      const match = r.eta.match(/(\d+(\.\d+)?)\s*(min|hour)/i);
      if (match) {
        mins = parseFloat(match[1]) * (match[3].toLowerCase().startsWith('hour') ? 60 : 1);
      }
    }
    acc.etaMins += mins;
    return acc;
  }, { distance: 0, etaMins: 0 });
  const aggregateDistance = aggregateMetrics.distance.toFixed(1);
  const aggregateEta = aggregateMetrics.etaMins > 60 
    ? (aggregateMetrics.etaMins / 60).toFixed(1) + ' hrs' 
    : Math.round(aggregateMetrics.etaMins) + ' mins';


  const handleExportSelectedToKML = () => {
    const selectedRoutes = routeSegments.filter(r => selectedRouteIds.includes(r.id));
    if (selectedRoutes.length === 0) return;

    let kmlContent = `<?xml version="1.0" encoding="UTF-8"?>\n<kml xmlns="http://www.opengis.net/kml/2.2">\n<Document>\n`;
    
    selectedRoutes.forEach(route => {
      kmlContent += `  <Placemark>\n    <name>${route.name}</name>\n    <LineString>\n      <coordinates>\n`;
      route.positions.forEach(pos => {
        kmlContent += `        ${pos[1]},${pos[0]},0\n`;
      });
      kmlContent += `      </coordinates>\n    </LineString>\n  </Placemark>\n`;
    });
    
    kmlContent += `</Document>\n</kml>`;

    const blob = new Blob([kmlContent], { type: "application/vnd.google-earth.kml+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `valourian_routes_${new Date().getTime()}.kml`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="w-full h-full relative"
      id="aura-drive-map-container"
      style={
        { ...style, "--anim-speed": `${animSpeed}ms` } as React.CSSProperties
      }
    >
      {contextMenu && (
        <div
          className="fixed z-[99999] bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-xl shadow-2xl py-1 w-56 overflow-hidden animate-in fade-in zoom-in-95"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <div className="px-3 py-2 border-b border-slate-800/50 text-[10px] font-black uppercase text-slate-400 tracking-wider flex justify-between items-center bg-slate-950/50">
            {contextMenu.route.id}
            <button
              onClick={() => setContextMenu(null)}
              className="p-1 hover:bg-slate-800 rounded"
            >
              <X className="w-3 h-3 hover:text-white" />
            </button>
          </div>
          <button
            onClick={() => {
              setSearchQuery(contextMenu.route.id);
              setContextMenu(null);
            }}
            className="w-full text-left px-3 py-2.5 text-[11px] font-medium text-slate-200 hover:bg-indigo-600/20 hover:text-indigo-300 transition-colors flex items-center justify-between"
          >
            Center Map <Search className="w-3 h-3" />
          </button>
          <button
            onClick={() => {
              handleExportJSON(contextMenu.route);
              setContextMenu(null);
            }}
            className="w-full text-left px-3 py-2.5 text-[11px] font-medium text-slate-200 hover:bg-teal-600/20 hover:text-teal-300 transition-colors flex items-center justify-between"
          >
            Export Metadata <FileJson className="w-3 h-3" />
          </button>
          <button
            onClick={() => {
              setPathEditModeFor(contextMenu.route.id);
              setContextMenu(null);
            }}
            className="w-full text-left px-3 py-2.5 text-[11px] font-medium text-amber-400 hover:bg-amber-500/20 transition-colors flex justify-between items-center border-t border-slate-800/50"
          >
            Modify Path Nodes <Edit3 className="w-3 h-3" />
          </button>
          <button
            onClick={() => {
              handleArchiveRoute(contextMenu.route);
              setContextMenu(null);
            }}
            className="w-full text-left px-3 py-2.5 text-[11px] font-medium text-rose-500 hover:bg-rose-500/20 transition-colors flex justify-between items-center border-t border-slate-800/50"
          >
            Archive Segment <Trash2 className="w-3 h-3" />
          </button>
        </div>
      )}

      <style>{`
        @keyframes dash {
          to { stroke-dashoffset: -100; }
        }
        .compliance-watermark {
           display: none;
        }
        .taking-snapshot .compliance-watermark {
           display: block;
        }
      `}</style>

      <MapContainer zoomControl={false}
        center={[-33.8688, 151.2093]}
        zoom={13}
        style={{ height: "100%", width: "100%", borderRadius: "2.5rem" }}
        scrollWheelZoom={false}
      >
        {mapLayer === "dark" && (
          <TileLayer
            attribution="&copy; CartoDB"
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
        )}
        {mapLayer === "street" && (
          <TileLayer
            attribution="&copy; OpenStreetMap"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        )}
        <PolygonSelectionTool
          polygonSelectionMode={polygonSelectionMode}
          onComplete={handlePolygonComplete}
        />
        {mapLayer === "satellite" && (
          <TileLayer
            attribution="&copy; Esri"
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />
        )}

        <AutoFitBounds routes={filteredRoutes} />
        <div className="compliance-watermark absolute top-4 right-4 z-[9999] bg-black/80 backdrop-blur border border-red-500/50 p-4 rounded-lg">
          <h3 className="text-red-500 font-black tracking-widest uppercase text-xl mb-1 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6" /> TREASURY COMPLIANCE
          </h3>
          <div className="text-white font-mono text-xs">
            Geo-referenced Snapshot ID:{" "}
            {new Date().getTime().toString(16).toUpperCase()}
          </div>
          <div className="text-white font-mono text-xs">
            Authorized By: Torrens Matrix Security
          </div>
        </div>

        {/* Render filtered routes */}

        <MapInteractions
          annotateMode={annotateMode}
          setAnnotations={setAnnotations}
          setContextMenu={setContextMenu}
        />
        {routeSegments.map((route) => {
          const isVisible = checkIsVisible(route);
          return (
            <Fragment key={route.id}>
              <Polyline
                positions={route.positions as [number, number][]}
                pathOptions={{
                  color: selectedRouteIds.includes(route.id)
                    ? "#f59e0b"
                    : getRouteColor(route),
                  weight: getRouteWeight(route),
                  opacity: isVisible ? getRouteOpacity(route) : 0,
                  className: `transition-all ease-[cubic-bezier(0.34,1.56,0.64,1)] duration-[600ms] transform-gpu ${torrensSync ? "animate-[dash_2s_linear_infinite] [stroke-dasharray:10_20]" : ""} ${hoveredRouteId === route.id ? "route-hover-glow" : selectedRouteIds.includes(route.id) ? "scale-110 stroke-[5px]" : "stroke-[2px]"} ${isVisible ? "" : "pointer-events-none"} ${trafficView ? "drop-shadow-[0_0_12px_rgba(239,68,68,0.9)] stroke-rose-500" : "drop-shadow-none"}`,
                }}
                eventHandlers={{
                  mouseover: () => {
                    if (isVisible) setHoveredRouteId(route.id);
                  },
                  mouseout: () => setHoveredRouteId(null),
                  click: () => {
                    if (!isVisible) return;
                    if (selectionMode) {
                      setSelectedRouteIds((prev) =>
                        prev.includes(route.id)
                          ? prev.filter((id) => id !== route.id)
                          : [...prev, route.id],
                      );
                    }
                  },
                  contextmenu: (e) => {
                    if (!isVisible) return;
                    e.originalEvent.preventDefault();
                    setContextMenu({
                      x: (e.originalEvent as MouseEvent).pageX,
                      y: (e.originalEvent as MouseEvent).pageY,
                      route,
                    });
                  },
                }}
              >
                {replayingRouteId === route.id && replayPos && (
                  <Marker
                    position={replayPos}
                    icon={transportIcon}
                  />
                )}

                {(showLabels || hoveredRouteId === route.id) && isVisible && (
                  <Tooltip
                    permanent={showLabels}
                    direction="top"
                    className="!bg-slate-900/60 !backdrop-blur-xl !border !border-white/10 !shadow-[0_8px_32px_rgba(0,0,0,0.5)] !text-slate-100 font-mono text-[10px] p-4 leading-tight rounded-2xl overflow-hidden pointer-events-none transition-all duration-300 group-hover:!scale-110 origin-bottom"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent"></div>
                    <div className="relative z-10 w-44">
                      <div className="font-black text-indigo-400 mb-2 tracking-widest uppercase border-b border-indigo-500/30 pb-1 flex justify-between">
                        <span>{route.id}</span>
                      </div>
                      <div className="font-bold text-white mb-2 truncate">
                        {route.name}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 mt-2 mb-2">
                        <div className="bg-slate-900 p-1.5 rounded border border-white/5">
                          <span className="text-[8px] text-slate-500 block">DISTANCE</span>
                          <span className="text-white font-bold truncate block">{route.distance}</span>
                        </div>
                        <div className="bg-slate-900 p-1.5 rounded border border-white/5">
                          <span className="text-[8px] text-slate-500 block">DURATION</span>
                          <span className="text-white font-bold truncate block">{route.eta}</span>
                        </div>
                      </div>
                      
                      <div className="pt-2 mt-2 border-t border-slate-800 flex justify-between items-center">
                        <span className="text-slate-500 text-[8px] uppercase tracking-wider">
                          Velocity
                        </span>
                        <span className="text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full text-[10px]">
                          {route.speed || route.nodes[route.nodes.length - 1]?.vel || "0 km/h"}
                        </span>
                      </div>
                    </div>
                  </Tooltip>
                )}
                {isVisible &&
                  ["high", "critical"].includes(route.traffic) &&
                  route.positions.length > 0 && (
                    <Marker
                      position={
                        route.positions[
                          Math.floor(route.positions.length / 2)
                        ] as any
                      }
                    >
                      <Tooltip
                        permanent
                        direction="bottom"
                        className="bg-red-950/90 text-red-400 border border-red-500/50 font-bold text-[9px] uppercase tracking-wider shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                      >
                        <div className="flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> CONGESTION:{" "}
                          {route.traffic}
                        </div>
                      </Tooltip>
                    </Marker>
                  )}
                {isVisible && (
                  <Popup>
                    <div className="p-2">
                      <h4 className="font-black text-slate-800 mb-1">
                        {route.name}
                      </h4>
                      <p className="text-xs text-slate-500">ID: {route.id}</p>
                    </div>
                  </Popup>
                )}
              </Polyline>
              {route.traffic === "high" && trafficView && isVisible && (
                <CircleMarker
                  center={
                    route.positions[Math.floor(route.positions.length / 2)] as [
                      number,
                      number,
                    ]
                  }
                  radius={6}
                  pathOptions={{
                    color: "transparent",
                    fillColor: "#ef4444",
                    fillOpacity: 0.9,
                    className: "animate-ping pointer-events-none",
                  }}
                />
              )}
              {route.traffic === "high" && trafficView && isVisible && (
                <CircleMarker
                  center={
                    route.positions[Math.floor(route.positions.length / 2)] as [
                      number,
                      number,
                    ]
                  }
                  radius={4}
                  pathOptions={{
                    color: "#fff",
                    weight: 1,
                    fillColor: "#ef4444",
                    fillOpacity: 1,
                    className: "pointer-events-none",
                  }}
                />
              )}

              {isVisible &&
                pathEditModeFor === route.id &&
                route.positions.map((pos: number[], idx: number) => (
                  <Marker
                    key={`edit-${route.id}-${idx}`}
                    position={[pos[0], pos[1]]}
                    draggable={true}
                    eventHandlers={{
                      dragend: (e) => {
                        const newPos = e.target.getLatLng();
                        setRouteSegments((prev: any[]) =>
                          prev.map((r) => {
                            if (r.id === route.id) {
                              const newPositions = [...r.positions];
                              newPositions[idx] = [newPos.lat, newPos.lng];
                              return {
                                ...r,
                                positions: newPositions,
                                updatedAt: new Date().toISOString(),
                              };
                            }
                            return r;
                          }),
                        );
                      },
                    }}
                  >
                    <Tooltip direction="top">Drag to modify Node {idx}</Tooltip>
                  </Marker>
                ))}
            </Fragment>
          );
        })}

        {annotations.map((ann) => (
          <Marker key={ann.id} position={[ann.lat, ann.lng]}>
            <Tooltip
              permanent
              direction="bottom"
              className="bg-emerald-900/90 backdrop-blur text-white border-emerald-700 font-bold text-xs shadow-xl"
            >
              {ann.text}
            </Tooltip>
          </Marker>
        ))}

        {filteredFleet.map((car) => (
          <Marker
            key={car.id}
            position={[car.lat, car.lng]}
            icon={transportIcon}
            eventHandlers={{
              click: () => setActiveCar(car),
            }}
          >
            <Popup>
              <div className="p-2">
                <h4 className="font-black text-slate-800 mb-1">{car.name}</h4>
                <p className="text-xs text-slate-500">{car.status}</p>
              </div>
            </Popup>
          </Marker>
        ))}
        <CustomZoomControlOverlay />
      </MapContainer>

      {/* Map UI Overlays */}
      <div className="absolute top-4 right-4 z-[400] pointer-events-auto">
        <button
          onClick={() => setTrafficView(!trafficView)}
          className={`flex items-center justify-center p-3 rounded-xl shadow-lg transition-all duration-300 backdrop-blur-md border ${trafficView ? "bg-rose-500/20 border-rose-500/50 text-rose-400 drop-shadow-[0_0_10px_rgba(225,29,72,0.8)]" : "bg-slate-900/60 border-white/10 text-slate-300 hover:bg-slate-800/80"} group`}
          title="Toggle Traffic Heatmap"
        >
          <Activity
            className={`w-4 h-4 ${trafficView ? "animate-pulse" : "group-hover:scale-110 transition-transform"}`}
          />
        </button>
      </div>

      <div className="absolute top-4 right-4 z-[400] flex flex-col gap-2 items-end pointer-events-none">
        {/* Fixed Top-Right Search Interface */}
        <div className="w-64 md:w-80 pointer-events-auto space-y-2">
          <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700 p-2 rounded-2xl shadow-2xl flex flex-col gap-2 pointer-events-auto">
            {selectedRouteIds.length > 0 && (
              <div className="w-full flex flex-col gap-2 mb-2 border-b border-slate-700/50 pb-2">
                <div className="flex justify-between items-center w-full px-1">
                  <div className="flex items-center gap-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest">
                    Registry Summary: {selectedRouteIds.length} Segments
                  </div>
                  {selectedRouteIds.length === 1 && (
                    <button
                      onClick={() => handleReplayRoute(selectedRouteIds[0])}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white px-2 py-0.5 rounded transition-colors flex items-center gap-1 text-[9px] uppercase font-bold"
                    >
                      <Play className="w-3 h-3" />{" "}
                      {replayingRouteId === selectedRouteIds[0]
                        ? "Stop Replay"
                        : "Replay Route"}
                    </button>
                  )}
                </div>
                
                <div className="flex justify-between items-end px-1 mt-1">
                  <div>
                    <div className="text-xl font-black font-mono leading-none text-emerald-400">
                      {aggregateDistance} <span className="text-xs">km</span>
                    </div>
                    <div className="text-[9px] uppercase tracking-wider font-bold opacity-80 mt-1 text-slate-400">
                      Aggregate Distance
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-black font-mono leading-none text-amber-400">
                      {aggregateEta}
                    </div>
                    <div className="text-[9px] uppercase tracking-wider font-bold opacity-80 mt-1 text-slate-400">
                      Est. Travel Time
                    </div>
                  </div>
                </div>

                {selectionMode && selectedRouteIds.length > 1 && (
                  <div className="flex gap-2 mt-1">
                    <button
                      onClick={handleMergeRoutes}
                      className="flex-1 bg-amber-600/80 hover:bg-amber-600 text-white rounded py-1 text-[9px] uppercase font-bold flex items-center justify-center gap-1 transition-colors"
                    >
                      <Merge className="w-3 h-3" /> Merge
                    </button>
                    <button
                      onClick={handleExportSelectedToKML}
                      className="flex-1 bg-emerald-600/80 hover:bg-emerald-600 text-white rounded py-1 text-[9px] uppercase font-bold flex items-center justify-center gap-1 transition-colors"
                    >
                      <Download className="w-3 h-3" /> KML Export
                    </button>
                  </div>
                )}
                {selectionMode && selectedRouteIds.length === 1 && (
                  <div className="flex gap-2 mt-1">
                    <button
                      onClick={handleExportSelectedToKML}
                      className="w-full bg-emerald-600/80 hover:bg-emerald-600 text-white rounded py-1 text-[9px] uppercase font-bold flex items-center justify-center gap-1 transition-colors"
                    >
                      <Download className="w-3 h-3" /> KML Export
                    </button>
                  </div>
                )}
              </div>
            )}
            {selectedRouteIds.length === 1 && (
              <div className="h-24 w-full mb-2 border-b border-slate-700/50 pb-2">
                <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider">
                  Elevation Profile
                </span>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={
                      routeSegments
                        .find((r) => r.id === selectedRouteIds[0])
                        ?.positions.map((p, i) => ({
                          dist: i,
                          elevation: Math.abs(Math.sin(p[0] * 100) * 100) + 50,
                        })) || []
                    }
                  >
                    <defs>
                      <linearGradient
                        id="colorElevation"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#8b5cf6"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#8b5cf6"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="dist" hide />
                    <YAxis hide domain={["dataMin - 10", "dataMax + 10"]} />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        borderColor: "#334155",
                        borderRadius: "8px",
                        fontSize: "10px",
                      }}
                      itemStyle={{ color: "#8b5cf6" }}
                      labelStyle={{ display: "none" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="elevation"
                      stroke="#8b5cf6"
                      fillOpacity={1}
                      fill="url(#colorElevation)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
            <div className="flex items-center gap-2 w-full">
              <Search className="w-4 h-4 text-slate-400 ml-2" />
              <input
                type="text"
                placeholder="Search routes or IDs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-xs text-white placeholder-slate-500 w-full font-medium py-1"
              />
              <button
                onClick={() => {
                  setSelectionMode(!selectionMode);
                  if (selectionMode) setSelectedRouteIds([]);
                }}
                className={`p-1.5 rounded transition-colors mr-1 ${selectionMode ? "bg-amber-500/20 text-amber-400" : "text-slate-400 hover:text-slate-200"}`}
                title="Selection Mode"
              >
                <MousePointer2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setTrafficView(!trafficView)}
                className={`p-1.5 rounded transition-colors mr-1 ${trafficView ? "bg-rose-500/20 text-rose-400" : "text-slate-400 hover:text-slate-200"}`}
                title="Toggle Traffic Heatmap"
              >
                <Activity className="w-4 h-4" />
              </button>

              <button
                onClick={() => setPolygonSelectionMode(!polygonSelectionMode)}
                className={`p-1.5 rounded transition-colors mr-1 ${polygonSelectionMode ? "bg-fuchsia-500/20 text-fuchsia-400" : "text-slate-400 hover:text-slate-200"}`}
                title="Draw Polygon Selection"
              >
                <PenTool className="w-4 h-4" />
              </button>
              <button
                onClick={handleShare}
                className="p-1.5 rounded transition-colors mr-1 text-slate-400 hover:text-slate-200"
                title="Share View"
              >
                <Share2 className="w-4 h-4" />
              </button>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-slate-400 hover:text-white transition-colors mr-2"
                  title="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {showControls && (
              <div className="flex flex-col gap-3 py-2 border-y border-slate-700/50 mt-1 mb-1">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider">
                    Categories
                  </span>
                  <div className="flex gap-2">
                    {["standard", "luxury", "emergency"].map((cat) => (
                      <button
                        key={cat}
                        onClick={() =>
                          setCategories((prev) => ({
                            ...prev,
                            [cat]: !(prev as any)[cat],
                          }))
                        }
                        className={`flex-1 rounded-lg p-1 flex items-center justify-center gap-1 text-[9px] uppercase font-bold transition-colors ${(categories as any)[cat] ? "bg-indigo-600/30 text-indigo-400 border border-indigo-500/50" : "bg-slate-800 text-slate-500 border border-slate-700"}`}
                      >
                        {(categories as any)[cat] ? (
                          <CheckSquare className="w-2.5 h-2.5" />
                        ) : (
                          <Square className="w-2.5 h-2.5" />
                        )}
                        {cat.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider">
                    Animation Speed (Draw Rate)
                  </span>
                  <div className="flex items-center gap-2">
                    <Timer className="w-3 h-3 text-slate-400" />
                    <input
                      type="range"
                      min="150"
                      max="1000"
                      step="50"
                      value={animSpeed}
                      onChange={(e) => setAnimSpeed(parseInt(e.target.value))}
                      className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-[9px] font-mono text-slate-300 w-8 text-right">
                      {animSpeed}ms
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 mt-2">
                  <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider">
                    Transport Modes
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        setTransportModes((prev) => ({
                          ...prev,
                          road: !prev.road,
                        }))
                      }
                      className={`flex-1 rounded-lg p-1 flex items-center justify-center gap-1 text-[9px] uppercase font-bold transition-colors ${transportModes.road ? "bg-indigo-600/30 text-indigo-400 border border-indigo-500/50" : "bg-slate-800 text-slate-500 border border-slate-700"}`}
                    >
                      <Car className="w-2.5 h-2.5" /> Road
                    </button>
                    <button
                      onClick={() =>
                        setTransportModes((prev) => ({
                          ...prev,
                          air: !prev.air,
                        }))
                      }
                      className={`flex-1 rounded-lg p-1 flex items-center justify-center gap-1 text-[9px] uppercase font-bold transition-colors ${transportModes.air ? "bg-indigo-600/30 text-indigo-400 border border-indigo-500/50" : "bg-slate-800 text-slate-500 border border-slate-700"}`}
                    >
                      <Plane className="w-2.5 h-2.5" /> Air
                    </button>
                    <button
                      onClick={() =>
                        setTransportModes((prev) => ({
                          ...prev,
                          maritime: !prev.maritime,
                        }))
                      }
                      className={`flex-1 rounded-lg p-1 flex items-center justify-center gap-1 text-[9px] uppercase font-bold transition-colors ${transportModes.maritime ? "bg-indigo-600/30 text-indigo-400 border border-indigo-500/50" : "bg-slate-800 text-slate-500 border border-slate-700"}`}
                    >
                      <Ship className="w-2.5 h-2.5" /> Sea
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 mt-2">
                  <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider">
                    Base Map Layer
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setMapLayer("dark")}
                      className={`flex-1 rounded-lg p-1 flex items-center justify-center gap-1 text-[9px] uppercase font-bold transition-colors ${mapLayer === "dark" ? "bg-indigo-600/30 text-indigo-400 border border-indigo-500/50" : "bg-slate-800 text-slate-500 border border-slate-700"}`}
                    >
                      Dark
                    </button>
                    <button
                      onClick={() => setMapLayer("street")}
                      className={`flex-1 rounded-lg p-1 flex items-center justify-center gap-1 text-[9px] uppercase font-bold transition-colors ${mapLayer === "street" ? "bg-indigo-600/30 text-indigo-400 border border-indigo-500/50" : "bg-slate-800 text-slate-500 border border-slate-700"}`}
                    >
                      Street
                    </button>
                    <button
                      onClick={() => setMapLayer("satellite")}
                      className={`flex-1 rounded-lg p-1 flex items-center justify-center gap-1 text-[9px] uppercase font-bold transition-colors ${mapLayer === "satellite" ? "bg-indigo-600/30 text-indigo-400 border border-indigo-500/50" : "bg-slate-800 text-slate-500 border border-slate-700"}`}
                    >
                      Sat
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 mt-2">
                  <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider">
                    Style Presets
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => applyStylePreset("treasury")}
                      className="flex-1 rounded-lg p-1 text-[9px] uppercase font-bold transition-colors bg-slate-800 hover:bg-amber-500/20 text-amber-400 border border-slate-700"
                    >
                      Treasury Gold
                    </button>
                    <button
                      onClick={() => applyStylePreset("tech")}
                      className="flex-1 rounded-lg p-1 text-[9px] uppercase font-bold transition-colors bg-slate-800 hover:bg-blue-500/20 text-blue-400 border border-slate-700"
                    >
                      Standard Tech
                    </button>
                    <button
                      onClick={() => applyStylePreset("emergency")}
                      className="flex-1 rounded-lg p-1 text-[9px] uppercase font-bold transition-colors bg-slate-800 hover:bg-red-500/20 text-red-400 border border-slate-700"
                    >
                      Emergency Red
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 mt-2 mb-2">
                  <input
                    type="file"
                    accept=".json,.geojson"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleBulkImport}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full rounded-lg p-1.5 flex justify-center items-center gap-1 text-[9px] uppercase font-bold transition-colors bg-slate-800 hover:bg-emerald-600/20 text-emerald-400 border border-slate-700"
                  >
                    <Download className="w-3 h-3 rotate-180" /> Bulk Import
                    GeoJSON
                  </button>
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => setShowLabels(!showLabels)}
                    className={`flex-1 rounded-lg p-1.5 flex justify-center items-center gap-1 transition-colors text-[9px] font-black uppercase tracking-wider ${showLabels ? "bg-blue-600 hover:bg-blue-500 text-white" : "bg-slate-800 hover:bg-slate-700 text-slate-300"}`}
                  >
                    <List className="w-3 h-3" /> Labels
                  </button>
                  
                </div>
              </div>
            )}

            <div className="flex justify-center w-full mb-1">
              <button
                onClick={() => setShowControls(!showControls)}
                className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 font-medium transition-colors"
              >
                <Settings2 className="w-3 h-3" />{" "}
                {showControls ? "Hide Controls" : "Advanced Controls"}
              </button>
            </div>

            <div className="flex gap-2 w-full">
              <button
                onClick={() => {
                  setAnnotateMode(!annotateMode);
                  toast.success(
                    annotateMode
                      ? "Annotation Matrix Offline"
                      : "Annotation Matrix Online. Click map to deploy pins.",
                    { icon: "📍" },
                  );
                }}
                className={`flex-1 rounded-xl p-1.5 flex justify-center items-center gap-1 transition-colors text-[9px] font-black uppercase tracking-wider ${annotateMode ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(5,150,105,0.4)]" : "bg-slate-800 hover:bg-slate-700 text-slate-300"}`}
                title="Annotate Map"
              >
                <MapPin className="w-3 h-3" /> Pin
              </button>

              <button
                onClick={handleSnapshot}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl p-1.5 flex justify-center items-center gap-1 transition-colors text-[9px] font-black uppercase tracking-wider"
                title="Snapshot Map"
              >
                <Camera className="w-3 h-3" /> Snap
              </button>
              <button
                onClick={() => setTrafficView(!trafficView)}
                className={`flex-1 rounded-xl p-1.5 flex justify-center items-center gap-1 transition-colors text-[9px] font-black uppercase tracking-wider ${trafficView ? "bg-amber-600 hover:bg-amber-500 text-white" : "bg-slate-800 hover:bg-slate-700 text-slate-300"}`}
                title="Toggle Traffic Map"
              >
                <Activity className="w-3 h-3" /> Map
              </button>
              <button
                onClick={() => setLiveTraffic(!liveTraffic)}
                className={`flex-1 rounded-xl p-1.5 flex justify-center items-center gap-1 transition-colors text-[9px] font-black uppercase tracking-wider ${liveTraffic ? "bg-rose-600 hover:bg-rose-500 text-white animate-pulse" : "bg-slate-800 hover:bg-slate-700 text-slate-300"}`}
                title="Live Traffic Feed"
              >
                <RefreshCw
                  className={`w-3 h-3 ${liveTraffic ? "animate-spin" : ""}`}
                />{" "}
                Live
              </button>
              <button
                onClick={() => setTorrensSync(!torrensSync)}
                className={`flex-1 rounded-xl p-1.5 flex justify-center items-center gap-1 transition-colors text-[9px] font-black uppercase tracking-wider ${torrensSync ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.5)]" : "bg-slate-800 hover:bg-slate-700 text-slate-300"}`}
                title="Torrens Sync"
              >
                <Zap className="w-3 h-3" /> Sync
              </button>
              <button
                onClick={() => setHighContrast(!highContrast)}
                className={`flex-1 rounded-xl p-1.5 flex justify-center items-center gap-1 transition-colors text-[9px] font-black uppercase tracking-wider ${highContrast ? "bg-white hover:bg-gray-200 text-slate-900" : "bg-slate-800 hover:bg-slate-700 text-slate-300"}`}
                title="Toggle High Contrast"
              >
                <Eye className="w-3 h-3" /> Contrast
              </button>
            </div>
          </div>

          {searchQuery && filteredRoutes.length === 1 && (
            <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700 p-4 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-top-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h5 className="text-white font-bold text-sm">
                    {filteredRoutes[0].name}
                  </h5>
                  <p className="text-slate-400 text-[10px] font-mono">
                    {filteredRoutes[0].id}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() =>
                      setShowCoordsFor(
                        showCoordsFor === filteredRoutes[0].id
                          ? null
                          : filteredRoutes[0].id,
                      )
                    }
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                    title="View Coordinates"
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() =>
                      setEditingStyleFor(
                        editingStyleFor === filteredRoutes[0].id
                          ? null
                          : filteredRoutes[0].id,
                      )
                    }
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                    title="Edit Style"
                  >
                    <Palette className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleSplitRoute(filteredRoutes[0])}
                    className="p-1.5 bg-amber-500/20 hover:bg-amber-500/40 text-amber-400 border border-amber-500/30 rounded-lg transition-colors"
                    title="Split Segment"
                  >
                    <Scissors className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleExportJSON(filteredRoutes[0])}
                    className="p-1.5 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 border border-emerald-500/30 rounded-lg transition-colors"
                    title="Backup JSON Schema"
                  >
                    <FileJson className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleExportKML(filteredRoutes[0], "high")}
                    className="p-1.5 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 border border-indigo-500/30 rounded-lg transition-colors"
                    title="Export KML (High Precision)"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() =>
                      handleExportKML(filteredRoutes[0], "simplified")
                    }
                    className="p-1.5 bg-sky-600/20 hover:bg-sky-600/40 text-sky-400 border border-sky-500/30 rounded-lg transition-colors flex items-center justify-center relative"
                    title="Export KML (Simplified)"
                  >
                    <Download className="w-3 h-3" />
                    <span className="absolute bottom-0.5 right-0.5 text-[6px] font-black uppercase text-sky-300">
                      S
                    </span>
                  </button>
                  <button
                    onClick={() => handleArchiveRoute(filteredRoutes[0])}
                    className="p-1.5 bg-rose-500/20 hover:bg-rose-500/40 text-rose-400 border border-rose-500/30 rounded-lg transition-colors"
                    title="Archive Segment"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-3">
                <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                  <div className="text-[9px] font-black uppercase text-slate-500 tracking-wider">
                    Distance
                  </div>
                  <div className="text-white font-mono text-xs">
                    {filteredRoutes[0].distance}
                  </div>
                </div>
                <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                  <div className="text-[9px] font-black uppercase text-slate-500 tracking-wider">
                    Est. Travel
                  </div>
                  <div className="text-white font-mono text-xs">
                    {filteredRoutes[0].eta}
                  </div>
                </div>
              </div>

              {editingStyleFor === filteredRoutes[0].id && (
                <div className="mt-3 p-2 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-[9px] font-black uppercase text-slate-500 tracking-wider mb-2">
                    Style Editor
                  </div>
                  <div className="flex gap-2 mb-2">
                    {[
                      "#06C167",
                      "#3b82f6",
                      "#8b5cf6",
                      "#ef4444",
                      "#f59e0b",
                      "#ec4899",
                      "#ffffff",
                    ].map((c) => (
                      <button
                        key={c}
                        onClick={() => {
                          setRouteSegments((prev) =>
                            prev.map((r) =>
                              r.id === filteredRoutes[0].id
                                ? { ...r, color: c }
                                : r,
                            ),
                          );
                        }}
                        className="w-4 h-4 rounded-full border border-white/20 hover:scale-110 transition-transform"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              )}
              {showCoordsFor === filteredRoutes[0].id && (
                <div className="mt-3 p-3 bg-slate-950/80 backdrop-blur rounded-xl border border-slate-800 max-h-48 overflow-y-auto hide-scrollbar">
                  <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-3 sticky top-0 bg-slate-950/90 pb-2 border-b border-slate-800/50 flex flex-col gap-2 z-10">
                    <span>Route Metadata & Geometry</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[8px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300 whitespace-nowrap">
                        Created:{" "}
                        {filteredRoutes[0].createdAt
                          ? new Date(
                              filteredRoutes[0].createdAt,
                            ).toLocaleTimeString()
                          : "N/A"}
                      </span>
                      <span className="text-[8px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300 whitespace-nowrap">
                        Updated:{" "}
                        {filteredRoutes[0].updatedAt
                          ? new Date(
                              filteredRoutes[0].updatedAt,
                            ).toLocaleTimeString()
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                  <ul className="space-y-1">
                    {filteredRoutes[0].positions.map(
                      (pos: any, idx: number) => (
                        <li
                          key={idx}
                          className="text-[10px] font-mono flex items-center justify-between border-b border-white/5 pb-1 last:border-0 hover:bg-white/5 px-1 rounded transition-colors"
                        >
                          <span className="text-slate-600 font-bold w-6">
                            [{idx}]
                          </span>
                          <div className="flex gap-4 flex-1 justify-end">
                            <span className="text-emerald-400/80">
                              Lat: {Number(pos[0]).toFixed(6)}
                            </span>
                            <span className="text-blue-400/80">
                              Lng: {Number(pos[1]).toFixed(6)}
                            </span>
                          </div>
                        </li>
                      ),
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="pointer-events-auto">
          <Button
            onClick={() => {
              setSentryActive(!sentryActive);
              toast.success(
                sentryActive
                  ? "Neural Sentry Deactivated"
                  : "Neural Sentry Activated",
              );
            }}
            className={
              sentryActive
                ? "bg-emerald-600 hover:bg-emerald-500"
                : "bg-slate-800 hover:bg-slate-700"
            }
          >
            <Cpu className="w-4 h-4 mr-2" />
            {sentryActive ? "Sentry Active" : "Enable Sentry"}
          </Button>
        </div>
      </div>
    </div>
  );
}
