const fs = require('fs');
let content = fs.readFileSync('src/components/bank/AuraDriveMap.tsx', 'utf8');

// 1. Imports
content = content.replace(/import \{ Search, Download, PenTool,/, 'import { Search, Download, PenTool, Trash2, List,');

// 2. State for routeSegments and showCoordsFor
const oldRouteSegments = `  const routeSegments = [
    { id: "R-101", name: "Route Segment - Harbour", positions: [[-33.8650, 151.2050], [-33.8600, 151.2100], [-33.8550, 151.2150]], color: "#06C167", distance: "4.2 km", eta: "14 mins" },
    { id: "R-102", name: "Route Segment - CBD Core", positions: [[-33.8750, 151.2150], [-33.8700, 151.2100], [-33.8650, 151.2000]], color: "#3b82f6", distance: "1.8 km", eta: "8 mins" },
    { id: "R-103", name: "Route Segment - Eastern Suburbs", positions: [[-33.8800, 151.2200], [-33.8850, 151.2250], [-33.8900, 151.2300]], color: "#8b5cf6", distance: "6.5 km", eta: "22 mins" }
  ];`;

const newRouteSegments = `  const [routeSegments, setRouteSegments] = useState([
    { id: "R-101", name: "Route Segment - Harbour", positions: [[-33.8650, 151.2050], [-33.8600, 151.2100], [-33.8550, 151.2150]], color: "#06C167", distance: "4.2 km", eta: "14 mins" },
    { id: "R-102", name: "Route Segment - CBD Core", positions: [[-33.8750, 151.2150], [-33.8700, 151.2100], [-33.8650, 151.2000]], color: "#3b82f6", distance: "1.8 km", eta: "8 mins" },
    { id: "R-103", name: "Route Segment - Eastern Suburbs", positions: [[-33.8800, 151.2200], [-33.8850, 151.2250], [-33.8900, 151.2300]], color: "#8b5cf6", distance: "6.5 km", eta: "22 mins" }
  ]);
  const [showCoordsFor, setShowCoordsFor] = useState<string | null>(null);`;

content = content.replace(oldRouteSegments, newRouteSegments);

// 3. handleArchiveRoute function
const archiveFunction = `  const handleArchiveRoute = (route: any) => {
    setRouteSegments(prev => prev.filter(r => r.id !== route.id));
    setSearchQuery("");
    setShowCoordsFor(null);
    toast.success(\`Archived \${route.id} from active view\`);
  };

  const handleEditRoute =`;
content = content.replace(/  const handleEditRoute =/, archiveFunction);

// 4. Update Polyline className for smooth transitions
content = content.replace(/className: hoveredRouteId === route\.id \? 'animate-pulse' : ''/g, 'className: `transition-all duration-300 ease-in-out ${hoveredRouteId === route.id ? "animate-pulse" : ""}`');

// 5. Replace the buttons and add the coords panel
const oldUIBlock = `<div className="flex gap-1">
                  <button onClick={() => handleEditRoute(filteredRoutes[0])} className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors" title="Edit Route Segment">
                    <PenTool className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleExportKML(filteredRoutes[0])} className="p-1.5 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 border border-indigo-500/30 rounded-lg transition-colors" title="Export as KML">
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-3">
                <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                  <div className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Distance</div>
                  <div className="text-white font-mono text-xs">{filteredRoutes[0].distance}</div>
                </div>
                <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                  <div className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Est. Travel</div>
                  <div className="text-white font-mono text-xs">{filteredRoutes[0].eta}</div>
                </div>
              </div>`;

const newUIBlock = `<div className="flex gap-1">
                  <button onClick={() => setShowCoordsFor(showCoordsFor === filteredRoutes[0].id ? null : filteredRoutes[0].id)} className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors" title="View Coordinates">
                    <List className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleEditRoute(filteredRoutes[0])} className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors" title="Edit Route Segment">
                    <PenTool className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleExportKML(filteredRoutes[0])} className="p-1.5 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 border border-indigo-500/30 rounded-lg transition-colors" title="Export as KML">
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleArchiveRoute(filteredRoutes[0])} className="p-1.5 bg-rose-500/20 hover:bg-rose-500/40 text-rose-400 border border-rose-500/30 rounded-lg transition-colors" title="Archive Segment">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-3">
                <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                  <div className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Distance</div>
                  <div className="text-white font-mono text-xs">{filteredRoutes[0].distance}</div>
                </div>
                <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                  <div className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Est. Travel</div>
                  <div className="text-white font-mono text-xs">{filteredRoutes[0].eta}</div>
                </div>
              </div>
              
              {showCoordsFor === filteredRoutes[0].id && (
                <div className="mt-3 p-2 bg-slate-950 rounded-xl border border-slate-800 max-h-32 overflow-y-auto">
                  <div className="text-[9px] font-black uppercase text-slate-500 tracking-wider mb-2 sticky top-0 bg-slate-950 pb-1 border-b border-slate-800">Geospatial Coordinates</div>
                  <ul className="space-y-1">
                    {filteredRoutes[0].positions.map((pos: any, idx: number) => (
                      <li key={idx} className="text-[10px] font-mono flex gap-2 border-b border-white/5 pb-1 last:border-0">
                        <span className="text-slate-600">[{idx}]</span>
                        <span className="text-emerald-400">Lat: {pos[0]}</span>
                        <span className="text-blue-400">Lng: {pos[1]}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}`;

content = content.replace(oldUIBlock, newUIBlock);

fs.writeFileSync('src/components/bank/AuraDriveMap.tsx', content);
