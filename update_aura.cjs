const fs = require('fs');

let content = fs.readFileSync('src/components/bank/AuraDriveMap.tsx', 'utf8');

// Imports
content = content.replace(
    /import \{ Search, Download, PenTool, Trash2, List, Navigation,/,
    "import html2canvas from 'html2canvas';\nimport { Search, Download, PenTool, Trash2, List, Navigation, Camera, Eye, Activity,"
);

// We need to make sure we don't accidentally import Activity twice if it's already there
// Activity is already imported in the old line, let's just do a clean replace of lucide-react imports.
content = content.replace(
    /import \{ Search, Download, PenTool, Trash2, List, Navigation, MessageSquare, Volume2, BellRing, ChevronRight, Globe, ShieldCheck, Activity, Cpu, Fingerprint, Zap, Lock, Unlock, Thermometer \} from 'lucide-react';/,
    "import { Search, Download, PenTool, Trash2, List, Navigation, MessageSquare, Volume2, BellRing, ChevronRight, Globe, ShieldCheck, Activity, Cpu, Fingerprint, Zap, Lock, Unlock, Thermometer, Camera, Eye } from 'lucide-react';\nimport html2canvas from 'html2canvas';"
);


// State additions
const stateAdditions = `
  const [trafficView, setTrafficView] = useState(false);
  const [highContrast, setHighContrast] = useState(false);

  const handleSnapshot = async () => {
    const mapElement = document.querySelector('.leaflet-container');
    if (!mapElement) return;
    toast.loading("Capturing high-quality snapshot...", { id: "snapshot" });
    try {
      const canvas = await html2canvas(mapElement as HTMLElement, { useCORS: true, logging: false });
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = \`valourian-tactical-map-\${Date.now()}.png\`;
      a.click();
      toast.success("Snapshot captured and saved", { id: "snapshot" });
    } catch (err) {
      toast.error("Failed to capture snapshot", { id: "snapshot" });
    }
  };
`;
content = content.replace(/const \[hoveredRouteId, setHoveredRouteId\] = useState<string \| null>\(null\);/, stateAdditions + '\n  const [hoveredRouteId, setHoveredRouteId] = useState<string | null>(null);');

// update routeSegment array to include traffic and speed
content = content.replace(/distance: "4\.2 km", eta: "14 mins" \}/, 'distance: "4.2 km", eta: "14 mins", traffic: "low", speed: "42 km/h" }');
content = content.replace(/distance: "1\.8 km", eta: "8 mins" \}/, 'distance: "1.8 km", eta: "8 mins", traffic: "high", speed: "12 km/h" }');
content = content.replace(/distance: "6\.5 km", eta: "22 mins" \}/, 'distance: "6.5 km", eta: "22 mins", traffic: "medium", speed: "28 km/h" }');

// helpers for styling
const styleHelpers = `
  const getRouteColor = (route: any) => {
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
     if (searchQuery && (route.name.toLowerCase().includes(searchQuery.toLowerCase()) || route.id.toLowerCase().includes(searchQuery.toLowerCase()))) {
        weight = 6;
     }
     if (hoveredRouteId === route.id) {
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
     if (searchQuery && (route.name.toLowerCase().includes(searchQuery.toLowerCase()) || route.id.toLowerCase().includes(searchQuery.toLowerCase()))) return 1;
     return 0.6;
  }
`;

content = content.replace(/const handleExportKML/, styleHelpers + '\n  const handleExportKML');

// Update Polyline rendering
const polylineOptions = `pathOptions={{ 
               color: getRouteColor(route), 
               weight: getRouteWeight(route),
               opacity: getRouteOpacity(route),
               className: \`transition-all duration-300 ease-in-out \${hoveredRouteId === route.id ? "animate-pulse" : ""}\`
            }}`;

content = content.replace(/pathOptions=\{\{[\s\S]*?className:[^\}]+\}\}/, polylineOptions);


// Map Overlays Updates
const mapOverlays = `
      {/* Route Metadata Panel */}
      <div className="absolute bottom-4 left-4 z-[400] w-64 pointer-events-none flex flex-col gap-2 max-h-[70%] overflow-y-auto hide-scrollbar">
         {filteredRoutes.map(route => (
            <div key={route.id} className="bg-slate-900/90 backdrop-blur-md border border-slate-700 p-3 rounded-2xl shadow-xl pointer-events-auto w-full animate-in fade-in slide-in-from-left-4 shrink-0">
               <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getRouteColor(route) }}></div>
                  <h5 className="text-white font-bold text-xs truncate">{route.name}</h5>
               </div>
               <div className="grid grid-cols-3 gap-1">
                  <div className="bg-slate-950 rounded p-1.5 text-center border border-white/5">
                     <div className="text-[8px] text-slate-500 uppercase font-black">Dist</div>
                     <div className="text-white text-[10px] font-mono">{route.distance}</div>
                  </div>
                  <div className="bg-slate-950 rounded p-1.5 text-center border border-white/5">
                     <div className="text-[8px] text-slate-500 uppercase font-black">Dur</div>
                     <div className="text-white text-[10px] font-mono">{route.eta}</div>
                  </div>
                  <div className="bg-slate-950 rounded p-1.5 text-center border border-white/5">
                     <div className="text-[8px] text-slate-500 uppercase font-black">Spd</div>
                     <div className="text-white text-[10px] font-mono">{route.speed}</div>
                  </div>
               </div>
            </div>
         ))}
      </div>

      <div className="absolute top-4 right-4 z-[400] flex flex-col gap-2 items-end pointer-events-none">
`;
content = content.replace(/<div className="absolute top-4 right-4 z-\[400\] flex flex-col gap-2 items-end pointer-events-none">/, mapOverlays);

const searchControls = `
          <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700 p-2 rounded-2xl shadow-2xl flex flex-col gap-2 pointer-events-auto">
             <div className="flex items-center gap-2">
                 <Search className="w-4 h-4 text-slate-400 ml-2" />
                 <input 
                   type="text"
                   placeholder="Search routes or IDs..."
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   className="bg-transparent border-none outline-none text-xs text-white placeholder-slate-500 w-full font-medium py-1"
                 />
             </div>
             
             <div className="flex gap-2 w-full">
                <button onClick={handleSnapshot} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl p-1.5 flex justify-center items-center gap-1 transition-colors text-[9px] font-black uppercase tracking-wider" title="Snapshot Map">
                   <Camera className="w-3 h-3" /> Snap
                </button>
                <button onClick={() => setTrafficView(!trafficView)} className={\`flex-1 rounded-xl p-1.5 flex justify-center items-center gap-1 transition-colors text-[9px] font-black uppercase tracking-wider \${trafficView ? 'bg-amber-600 hover:bg-amber-500 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}\`} title="Toggle Traffic Density">
                   <Activity className="w-3 h-3" /> Traffic
                </button>
                <button onClick={() => setHighContrast(!highContrast)} className={\`flex-1 rounded-xl p-1.5 flex justify-center items-center gap-1 transition-colors text-[9px] font-black uppercase tracking-wider \${highContrast ? 'bg-white hover:bg-gray-200 text-slate-900' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}\`} title="Toggle High Contrast">
                   <Eye className="w-3 h-3" /> Contrast
                </button>
             </div>
          </div>
`;

content = content.replace(/<div className="bg-slate-900\/90 backdrop-blur-md border border-slate-700 p-2 rounded-2xl shadow-2xl flex items-center gap-2">[\s\S]*?<\/div>/, searchControls);

fs.writeFileSync('src/components/bank/AuraDriveMap.tsx', content);
