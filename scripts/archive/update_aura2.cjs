const fs = require('fs');

let content = fs.readFileSync('src/components/bank/AuraDriveMap.tsx', 'utf8');

// 1. Imports
content = content.replace(
    /import \{ MapContainer, TileLayer, Marker, Popup, Polyline \} from 'react-leaflet';/,
    "import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip } from 'react-leaflet';"
);

content = content.replace(
    /import \{ Search, Download, PenTool, Trash2, List, Navigation, Camera, Eye, MessageSquare, X, Volume2, BellRing, ChevronRight, Globe, ShieldCheck, Activity, Cpu, Fingerprint, Zap, Lock, Unlock, Thermometer \} from 'lucide-react';/,
    "import { Search, Download, PenTool, Trash2, List, Navigation, Camera, Eye, MessageSquare, X, Volume2, BellRing, ChevronRight, Globe, ShieldCheck, Activity, Cpu, Fingerprint, Zap, Lock, Unlock, Thermometer, Layers, CheckSquare, Square, Timer, MousePointer2 } from 'lucide-react';"
);

// 2. Add New States
const stateBlock = `const [trafficView, setTrafficView] = useState(false);
  const [highContrast, setHighContrast] = useState(false);`;

const newStateBlock = `${stateBlock}
  const [categories, setCategories] = useState({ standard: true, luxury: true, emergency: true });
  const [showLabels, setShowLabels] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedRouteIds, setSelectedRouteIds] = useState<string[]>([]);
  const [animSpeed, setAnimSpeed] = useState(300);
  const [showControls, setShowControls] = useState(false);`;
content = content.replace(stateBlock, newStateBlock);

// 3. Update routeSegments
content = content.replace(
    /distance: "4\.2 km", eta: "14 mins", traffic: "low", speed: "42 km\/h" \}/,
    'distance: "4.2 km", numericDistance: 4.2, eta: "14 mins", traffic: "low", speed: "42 km/h", category: "standard" }'
);
content = content.replace(
    /distance: "1\.8 km", eta: "8 mins", traffic: "high", speed: "12 km\/h" \}/,
    'distance: "1.8 km", numericDistance: 1.8, eta: "8 mins", traffic: "high", speed: "12 km/h", category: "luxury" }'
);
content = content.replace(
    /distance: "6\.5 km", eta: "22 mins", traffic: "medium", speed: "28 km\/h" \}/,
    'distance: "6.5 km", numericDistance: 6.5, eta: "22 mins", traffic: "medium", speed: "28 km/h", category: "emergency" }'
);

// 4. Update getRouteWeight and getRouteOpacity
content = content.replace(/if \(hoveredRouteId === route\.id\) \{/g, "if (hoveredRouteId === route.id || selectedRouteIds.includes(route.id)) {");

// 5. Replace filteredRoutes to respect categories
const oldFiltered = `  const filteredRoutes = routeSegments.filter(route => 
     searchQuery === "" || 
     route.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
     route.id.toLowerCase().includes(searchQuery.toLowerCase())
  );`;

const newFiltered = `  const filteredRoutes = routeSegments.filter(route => 
     (searchQuery === "" || 
      route.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      route.id.toLowerCase().includes(searchQuery.toLowerCase())) &&
     (categories as any)[route.category]
  );
  
  const aggregateDistance = selectedRouteIds.reduce((acc, id) => {
     const r = routeSegments.find(rs => rs.id === id);
     return acc + (r ? (r as any).numericDistance : 0);
  }, 0).toFixed(1);`;
content = content.replace(oldFiltered, newFiltered);

// 6. Polyline class name and event handlers
const oldPathOptions = /pathOptions=\{\{[\s\S]*?className: `transition-all duration-300 ease-in-out \$\{hoveredRouteId === route.id \? "animate-pulse" : ""\}`\s*\}\}/;
const newPathOptions = `pathOptions={{ 
               color: selectedRouteIds.includes(route.id) ? "#f59e0b" : getRouteColor(route), 
               weight: getRouteWeight(route),
               opacity: getRouteOpacity(route),
               className: \`transition-all ease-in-out duration-\${animSpeed} \${(hoveredRouteId === route.id || selectedRouteIds.includes(route.id)) ? "animate-pulse" : ""}\`
            }}`;
content = content.replace(oldPathOptions, newPathOptions);

const oldEventHandlers = /eventHandlers=\{\{\s*mouseover: \(\) => setHoveredRouteId\(route\.id\),\s*mouseout: \(\) => setHoveredRouteId\(null\)\s*\}\}/;
const newEventHandlers = `eventHandlers={{
              mouseover: () => setHoveredRouteId(route.id),
              mouseout: () => setHoveredRouteId(null),
              click: () => {
                 if (selectionMode) {
                     setSelectedRouteIds(prev => 
                         prev.includes(route.id) ? prev.filter(id => id !== route.id) : [...prev, route.id]
                     );
                 }
              }
            }}`;
content = content.replace(oldEventHandlers, newEventHandlers);

// 7. Add Tooltip to Polyline
const popupMatch = /<Popup>/;
const toolTipInjection = `{(showLabels || hoveredRouteId === route.id) && (
              <Tooltip permanent={showLabels} direction="top" className="bg-slate-900 text-white border-slate-700 font-mono text-xs">
                 {route.distance}
              </Tooltip>
            )}
            <Popup>`;
content = content.replace(popupMatch, toolTipInjection);


// 8. Add Multi-Select UI to the bottom-left map overlays
const aggregatePanel = `
      {/* Route Metadata Panel */}
      <div className="absolute bottom-4 left-4 z-[400] w-64 pointer-events-none flex flex-col gap-2 max-h-[70%] overflow-y-auto hide-scrollbar">
         {selectionMode && selectedRouteIds.length > 0 && (
            <div className="bg-amber-500/90 backdrop-blur-md border border-amber-400 p-3 rounded-2xl shadow-xl pointer-events-auto w-full animate-in fade-in slide-in-from-left-4 shrink-0 text-slate-900">
               <div className="flex justify-between items-center mb-1">
                 <h5 className="font-black text-[10px] uppercase tracking-wider">Multi-Segment Route</h5>
                 <span className="font-bold text-xs">{selectedRouteIds.length} segments</span>
               </div>
               <div className="text-2xl font-black font-mono">{aggregateDistance} km</div>
               <div className="text-[9px] uppercase tracking-wider font-bold opacity-80">Aggregate Distance</div>
            </div>
         )}
`;
content = content.replace(/\{\/\* Route Metadata Panel \*\/\}\s*<div className="absolute bottom-4 left-4 z-\[400\] w-64 pointer-events-none flex flex-col gap-2 max-h-\[70%\] overflow-y-auto hide-scrollbar">/, aggregatePanel);

// 9. Add the advanced controls to the search interface
const searchControlsOld = /<div className="flex gap-2 w-full">\s*<button onClick=\{handleSnapshot\}/;
const advancedControls = `
             {showControls && (
               <div className="flex flex-col gap-3 py-2 border-y border-slate-700/50 mt-1 mb-1">
                 <div className="flex flex-col gap-1.5">
                   <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Categories</span>
                   <div className="flex gap-2">
                     {['standard', 'luxury', 'emergency'].map(cat => (
                        <button key={cat} onClick={() => setCategories(prev => ({ ...prev, [cat]: !(prev as any)[cat] }))} className={\`flex-1 rounded-lg p-1 flex items-center justify-center gap-1 text-[9px] uppercase font-bold transition-colors \${(categories as any)[cat] ? 'bg-indigo-600/30 text-indigo-400 border border-indigo-500/50' : 'bg-slate-800 text-slate-500 border border-slate-700'}\`}>
                          {(categories as any)[cat] ? <CheckSquare className="w-2.5 h-2.5" /> : <Square className="w-2.5 h-2.5" />}
                          {cat.slice(0,3)}
                        </button>
                     ))}
                   </div>
                 </div>

                 <div className="flex flex-col gap-1.5">
                   <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Animation Speed (Draw Rate)</span>
                   <div className="flex items-center gap-2">
                     <Timer className="w-3 h-3 text-slate-400" />
                     <input type="range" min="150" max="1000" step="50" value={animSpeed} onChange={(e) => setAnimSpeed(parseInt(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer" />
                     <span className="text-[9px] font-mono text-slate-300 w-8 text-right">{animSpeed}ms</span>
                   </div>
                 </div>

                 <div className="flex gap-2">
                   <button onClick={() => setShowLabels(!showLabels)} className={\`flex-1 rounded-lg p-1.5 flex justify-center items-center gap-1 transition-colors text-[9px] font-black uppercase tracking-wider \${showLabels ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}\`}>
                     <List className="w-3 h-3" /> Labels
                   </button>
                   <button onClick={() => { setSelectionMode(!selectionMode); if(selectionMode) setSelectedRouteIds([]); }} className={\`flex-1 rounded-lg p-1.5 flex justify-center items-center gap-1 transition-colors text-[9px] font-black uppercase tracking-wider \${selectionMode ? 'bg-amber-500 hover:bg-amber-400 text-slate-900' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}\`}>
                     <MousePointer2 className="w-3 h-3" /> Select
                   </button>
                 </div>
               </div>
             )}

             <div className="flex justify-center w-full mb-1">
               <button onClick={() => setShowControls(!showControls)} className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 font-medium transition-colors">
                 <Settings2 className="w-3 h-3" /> {showControls ? 'Hide Controls' : 'Advanced Controls'}
               </button>
             </div>

             <div className="flex gap-2 w-full">
                <button onClick={handleSnapshot}`;
content = content.replace(searchControlsOld, advancedControls);


content = content.replace(/import \{ Search, Download, PenTool, Trash2, List, Navigation, Camera, Eye, MessageSquare, X, Volume2, BellRing, ChevronRight, Globe, ShieldCheck, Activity, Cpu, Fingerprint, Zap, Lock, Unlock, Thermometer, Layers, CheckSquare, Square, Timer, MousePointer2 \}/, "import { Search, Download, PenTool, Trash2, List, Navigation, Camera, Eye, MessageSquare, X, Volume2, BellRing, ChevronRight, Globe, ShieldCheck, Activity, Cpu, Fingerprint, Zap, Lock, Unlock, Thermometer, Layers, CheckSquare, Square, Timer, MousePointer2, Settings2 }");

fs.writeFileSync('src/components/bank/AuraDriveMap.tsx', content);
