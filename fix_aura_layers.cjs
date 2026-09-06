const fs = require('fs');
let content = fs.readFileSync('src/components/bank/AuraDriveMap.tsx', 'utf8');

// 1. Imports Update
content = content.replace(
  /import \{ MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip \} from 'react-leaflet';/,
  "import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip, useMap } from 'react-leaflet';"
);

content = content.replace(
  /import \{ Search, Download, PenTool, Trash2, List, Navigation, Camera, Eye, MessageSquare, X, Volume2, BellRing, ChevronRight, Globe, ShieldCheck, Activity, Cpu, Fingerprint, Zap, Lock, Unlock, Thermometer, Layers, CheckSquare, Square, Timer, MousePointer2, Settings2 \} from 'lucide-react';/,
  "import { Search, Download, PenTool, Trash2, List, Navigation, Camera, Eye, MessageSquare, X, Volume2, BellRing, ChevronRight, Globe, ShieldCheck, Activity, Cpu, Fingerprint, Zap, Lock, Unlock, Thermometer, Layers, CheckSquare, Square, Timer, MousePointer2, Settings2, Map as MapIcon, Palette, Focus } from 'lucide-react';"
);
content = content.replace(/import L from 'leaflet';\n?/, ""); // In case it's there
content = content.replace(/import \{ Icon, DivIcon \} from 'leaflet';/, "import { Icon, DivIcon, LatLngBounds, Polyline as LeafletPolyline } from 'leaflet';");


// 2. New Component for Auto-Fit
const autoFitComponent = `
const AutoFitBounds = ({ routes }: { routes: any[] }) => {
  const map = useMap();
  useEffect(() => {
    if (routes.length === 0) return;
    const bounds = new LatLngBounds([]);
    routes.forEach(route => {
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
`;

content = content.replace(/export function AuraDriveMap/, autoFitComponent + '\nexport function AuraDriveMap');

// 3. New State Variables
const newStates = `
  const [mapLayer, setMapLayer] = useState<'dark' | 'street' | 'satellite'>('dark');
  const [editingStyleFor, setEditingStyleFor] = useState<string | null>(null);
`;
content = content.replace(/const \[showControls, setShowControls\] = useState\(false\);/, 'const [showControls, setShowControls] = useState(false);\n' + newStates);

// 4. Update route segments with node data
content = content.replace(/positions: \[\[-33\.8650, 151\.2050\], \[-33\.8600, 151\.2100\], \[-33\.8550, 151\.2150\]\]/, 'positions: [[-33.8650, 151.2050], [-33.8600, 151.2100], [-33.8550, 151.2150]], nodes: [{time: "08:12:00", vel: "40km/h"}, {time: "08:14:30", vel: "45km/h"}, {time: "08:18:00", vel: "38km/h"}]');
content = content.replace(/positions: \[\[-33\.8750, 151\.2150\], \[-33\.8700, 151\.2100\], \[-33\.8650, 151\.2000\]\]/, 'positions: [[-33.8750, 151.2150], [-33.8700, 151.2100], [-33.8650, 151.2000]], nodes: [{time: "09:00:00", vel: "10km/h"}, {time: "09:05:00", vel: "15km/h"}, {time: "09:08:00", vel: "8km/h"}]');
content = content.replace(/positions: \[\[-33\.8800, 151\.2200\], \[-33\.8850, 151\.2250\], \[-33\.8900, 151\.2300\]\]/, 'positions: [[-33.8800, 151.2200], [-33.8850, 151.2250], [-33.8900, 151.2300]], nodes: [{time: "14:20:00", vel: "25km/h"}, {time: "14:25:00", vel: "30km/h"}, {time: "14:32:00", vel: "35km/h"}]');

// 5. Update Map Layer Selection
const oldTileLayer = /<TileLayer\s*attribution='&copy; <a href="https:\/\/carto\.com\/">CartoDB<\/a>'\s*url="https:\/\/\{s\}\.basemaps\.cartocdn\.com\/dark_all\/\{z\}\/\{x\}\/\{y\}\{r\}\.png"\s*\/>/;
const newTileLayer = `
        {mapLayer === 'dark' && (
          <TileLayer
            attribution='&copy; CartoDB'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
        )}
        {mapLayer === 'street' && (
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        )}
        {mapLayer === 'satellite' && (
          <TileLayer
            attribution='&copy; Esri'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />
        )}
        <AutoFitBounds routes={filteredRoutes} />
`;
content = content.replace(oldTileLayer, newTileLayer);

// 6. Update Polyline Tooltip to include node data
const oldTooltip = /<Tooltip permanent=\{showLabels\} direction="top" className="bg-slate-900 text-white border-slate-700 font-mono text-xs">\s*\{route.distance\}\s*<\/Tooltip>/;
const newTooltip = `<Tooltip permanent={showLabels} direction="top" className="bg-slate-900 text-white border-slate-700 font-mono text-[10px] p-2 leading-tight">
                 <div className="font-bold text-amber-400 mb-1">{route.name}</div>
                 <div>Dist: {route.distance}</div>
                 <div className="mt-1 pt-1 border-t border-slate-700">
                    <div className="text-slate-400 text-[8px] uppercase">Node Telemetry (End)</div>
                    <div>T: {route.nodes[route.nodes.length - 1].time}</div>
                    <div>V: {route.nodes[route.nodes.length - 1].vel}</div>
                 </div>
              </Tooltip>`;
content = content.replace(oldTooltip, newTooltip);


// 7. Add Styling Palette and Layer Controls to Search Interface
const editRouteBtn = /<button onClick=\{\(\) => handleEditRoute\(filteredRoutes\[0\]\)\} className="p-1\.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors" title="Edit Route Segment">\s*<PenTool className="w-3\.5 h-3\.5" \/>\s*<\/button>/;
const paletteBtn = `<button onClick={() => setEditingStyleFor(editingStyleFor === filteredRoutes[0].id ? null : filteredRoutes[0].id)} className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors" title="Edit Style">
                    <Palette className="w-3.5 h-3.5" />
                  </button>`;
content = content.replace(editRouteBtn, paletteBtn);

const newUIInject = `
              {editingStyleFor === filteredRoutes[0].id && (
                <div className="mt-3 p-2 bg-slate-950 rounded-xl border border-slate-800">
                   <div className="text-[9px] font-black uppercase text-slate-500 tracking-wider mb-2">Style Editor</div>
                   <div className="flex gap-2 mb-2">
                      {['#06C167', '#3b82f6', '#8b5cf6', '#ef4444', '#f59e0b', '#ec4899', '#ffffff'].map(c => (
                         <button key={c} onClick={() => {
                            setRouteSegments(prev => prev.map(r => r.id === filteredRoutes[0].id ? {...r, color: c} : r));
                         }} className="w-4 h-4 rounded-full border border-white/20 hover:scale-110 transition-transform" style={{backgroundColor: c}} />
                      ))}
                   </div>
                </div>
              )}`;

content = content.replace(/\{showCoordsFor === filteredRoutes\[0\]\.id && \(/, newUIInject + '\n              {showCoordsFor === filteredRoutes[0].id && (');


const advancedControlsEnd = /<button onClick=\{\(\) => setShowLabels\(!showLabels\)\} className=\{\`flex-1 rounded-lg p-1\.5 flex justify-center items-center gap-1 transition-colors text-\[9px\] font-black uppercase tracking-wider \$\{showLabels \? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'\}\`\}>\s*<List className="w-3 h-3" \/> Labels\s*<\/button>\s*<button onClick=\{\(\) => \{ setSelectionMode\(!selectionMode\); if\(selectionMode\) setSelectedRouteIds\(\[\]\); \}\} className=\{\`flex-1 rounded-lg p-1\.5 flex justify-center items-center gap-1 transition-colors text-\[9px\] font-black uppercase tracking-wider \$\{selectionMode \? 'bg-amber-500 hover:bg-amber-400 text-slate-900' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'\}\`\}>\s*<MousePointer2 className="w-3 h-3" \/> Select\s*<\/button>\s*<\/div>\s*<\/div>\s*\)\}/;

const advancedControlsInject = `
                 <div className="flex flex-col gap-1.5 mt-2">
                   <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Base Map Layer</span>
                   <div className="flex gap-2">
                     <button onClick={() => setMapLayer('dark')} className={\`flex-1 rounded-lg p-1 flex items-center justify-center gap-1 text-[9px] uppercase font-bold transition-colors \${mapLayer === 'dark' ? 'bg-indigo-600/30 text-indigo-400 border border-indigo-500/50' : 'bg-slate-800 text-slate-500 border border-slate-700'}\`}>Dark</button>
                     <button onClick={() => setMapLayer('street')} className={\`flex-1 rounded-lg p-1 flex items-center justify-center gap-1 text-[9px] uppercase font-bold transition-colors \${mapLayer === 'street' ? 'bg-indigo-600/30 text-indigo-400 border border-indigo-500/50' : 'bg-slate-800 text-slate-500 border border-slate-700'}\`}>Street</button>
                     <button onClick={() => setMapLayer('satellite')} className={\`flex-1 rounded-lg p-1 flex items-center justify-center gap-1 text-[9px] uppercase font-bold transition-colors \${mapLayer === 'satellite' ? 'bg-indigo-600/30 text-indigo-400 border border-indigo-500/50' : 'bg-slate-800 text-slate-500 border border-slate-700'}\`}>Sat</button>
                   </div>
                 </div>

                 <div className="flex gap-2 mt-2">
                   <button onClick={() => setShowLabels(!showLabels)} className={\`flex-1 rounded-lg p-1.5 flex justify-center items-center gap-1 transition-colors text-[9px] font-black uppercase tracking-wider \${showLabels ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}\`}>
                     <List className="w-3 h-3" /> Labels
                   </button>
                   <button onClick={() => { setSelectionMode(!selectionMode); if(selectionMode) setSelectedRouteIds([]); }} className={\`flex-1 rounded-lg p-1.5 flex justify-center items-center gap-1 transition-colors text-[9px] font-black uppercase tracking-wider \${selectionMode ? 'bg-amber-500 hover:bg-amber-400 text-slate-900' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}\`}>
                     <MousePointer2 className="w-3 h-3" /> Select
                   </button>
                 </div>
               </div>
             )}`;

content = content.replace(advancedControlsEnd, advancedControlsInject);

fs.writeFileSync('src/components/bank/AuraDriveMap.tsx', content);
