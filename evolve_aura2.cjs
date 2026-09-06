const fs = require('fs');
let content = fs.readFileSync('src/components/bank/AuraDriveMap.tsx', 'utf8');

// 1. Add new icons
content = content.replace(
  /import \{ Search, MapPin, Edit3, Download, PenTool, Trash2, List, Navigation, Camera, Eye, MessageSquare, X, Volume2, BellRing, ChevronRight, Globe, ShieldCheck, Activity, Cpu, Fingerprint, Zap, Lock, Unlock, Thermometer, Layers, CheckSquare, Square, Timer, MousePointer2, Settings2, Map as MapIcon, Palette, Focus, Plane, Car, Ship, RefreshCw \} from 'lucide-react';/,
  "import { Search, MapPin, Edit3, Download, PenTool, Trash2, List, Navigation, Camera, Eye, MessageSquare, X, Volume2, BellRing, ChevronRight, Globe, ShieldCheck, Activity, Cpu, Fingerprint, Zap, Lock, Unlock, Thermometer, Layers, CheckSquare, Square, Timer, MousePointer2, Settings2, Map as MapIcon, Palette, Focus, Plane, Car, Ship, RefreshCw, FileJson, Scissors, Merge, AlertTriangle } from 'lucide-react';"
);

// 2. Add action helpers
const actionHelpers = `
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
      timestamp: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(schema, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = \`valourian-cold-storage-\${route.id}-\${Date.now()}.json\`;
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

     const r1 = { ...route, id: \`\${route.id}-A\`, name: \`\${route.name} (Alpha)\`, positions: p1, nodes: n1 };
     const r2 = { ...route, id: \`\${route.id}-B\`, name: \`\${route.name} (Beta)\`, positions: p2, nodes: n2 };

     setRouteSegments(prev => {
        const keep = prev.filter(r => r.id !== route.id);
        return [...keep, r1, r2];
     });
     setSearchQuery("");
     toast.success("Segment bifurcated successfully.");
  };

  const handleMergeRoutes = () => {
    if (selectedRouteIds.length < 2) return;
    setRouteSegments(prev => {
       const routesToMerge = prev.filter(r => selectedRouteIds.includes(r.id));
       const keep = prev.filter(r => !selectedRouteIds.includes(r.id));
       const mergedPositions = routesToMerge.flatMap(r => r.positions);
       const mergedNodes = routesToMerge.flatMap(r => r.nodes);
       const newRoute = {
          ...routesToMerge[0],
          id: \`R-MERGED-\${Date.now().toString().slice(-4)}\`,
          name: \`Merged: \${routesToMerge.map(r => r.name).join(' + ')}\`,
          positions: mergedPositions,
          nodes: mergedNodes,
          distance: \`\${routesToMerge.reduce((acc, r) => acc + (r.numericDistance || 0), 0).toFixed(1)} km\`,
          numericDistance: routesToMerge.reduce((acc, r) => acc + (r.numericDistance || 0), 0)
       };
       return [...keep, newRoute];
    });
    setSelectedRouteIds([]);
    setSelectionMode(false);
    toast.success("Segments successfully merged.");
  };
`;
content = content.replace(/const checkIsVisible =/, actionHelpers + '\n  const checkIsVisible =');


// 3. Update the Tooltip and add Congestion Marker
const oldTooltipStr = \`            {(showLabels || hoveredRouteId === route.id) && isVisible && (
              <Tooltip permanent={showLabels} direction="top" className="bg-slate-900 text-white border-slate-700 font-mono text-[10px] p-2 leading-tight">
                 <div className="font-bold text-amber-400 mb-1">{route.name}</div>
                 <div>Dist: {route.distance}</div>
                 <div className="mt-1 pt-1 border-t border-slate-700">
                    <div className="text-slate-400 text-[8px] uppercase">Node Telemetry (End)</div>
                    <div>T: {route.nodes[route.nodes.length - 1].time}</div>
                    <div>V: {route.nodes[route.nodes.length - 1].vel}</div>
                 </div>
              </Tooltip>
            )}\`;
            
const newTooltipStr = \`            {(showLabels || hoveredRouteId === route.id) && isVisible && (
              <Tooltip permanent={showLabels} direction="top" className="bg-slate-950/95 backdrop-blur-md text-slate-100 border border-slate-700 shadow-[0_0_20px_rgba(0,0,0,0.8)] font-mono text-[10px] p-3 leading-tight rounded-xl">
                 <div className="font-black text-indigo-400 mb-1 tracking-widest uppercase border-b border-indigo-500/30 pb-1">{route.name}</div>
                 <div className="grid grid-cols-2 gap-2 mt-2 mb-2">
                     <div className="bg-slate-900 p-1.5 rounded border border-white/5">
                         <span className="text-[8px] text-slate-500 block">DISTANCE</span>
                         <span className="text-white font-bold">{route.distance}</span>
                     </div>
                     <div className="bg-slate-900 p-1.5 rounded border border-white/5">
                         <span className="text-[8px] text-slate-500 block">EST. DURATION</span>
                         <span className="text-white font-bold">{route.eta}</span>
                     </div>
                 </div>
                 <div className="pt-1 border-t border-slate-800">
                    <div className="text-slate-500 text-[8px] uppercase tracking-wider mb-0.5">Telemetry Frame</div>
                    <div className="flex justify-between">
                       <span>{route.nodes[route.nodes.length - 1].time}</span>
                       <span className="text-emerald-400">{route.nodes[route.nodes.length - 1].vel}</span>
                    </div>
                 </div>
              </Tooltip>
            )}
            {isVisible && ['high', 'critical'].includes(route.traffic) && route.positions.length > 0 && (
                <Marker position={route.positions[Math.floor(route.positions.length / 2)] as any} opacity={0.8}>
                   <Tooltip permanent direction="bottom" className="bg-red-950/90 text-red-400 border border-red-500/50 font-bold text-[9px] uppercase tracking-wider shadow-[0_0_15px_rgba(239,68,68,0.5)]">
                      <div className="flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> CONGESTION: {route.traffic}</div>
                   </Tooltip>
                </Marker>
            )}\`;
            
content = content.replace(oldTooltipStr, newTooltipStr);

// 4. Update the Multi-Segment merge UI
const oldMergeHeader = \`<div className="flex justify-between items-center mb-1">
                 <h5 className="font-black text-[10px] uppercase tracking-wider">Multi-Segment Route</h5>
                 <span className="font-bold text-xs">{selectedRouteIds.length} segments</span>
               </div>\`;

const newMergeHeader = \`<div className="flex justify-between items-center mb-1">
                 <h5 className="font-black text-[10px] uppercase tracking-wider">Multi-Segment Route</h5>
                 <span className="font-bold text-xs">{selectedRouteIds.length} segments</span>
               </div>
               <button onClick={handleMergeRoutes} className="w-full bg-amber-600 hover:bg-amber-700 text-white rounded py-1 mb-2 text-[9px] uppercase font-bold flex items-center justify-center gap-1 transition-colors">
                  <Merge className="w-3 h-3" /> Merge Selected Routes
               </button>\`;
content = content.replace(oldMergeHeader, newMergeHeader);

// 5. Update Isolated Route single actions (Split, JSON)
const oldSingleActions = /<button onClick=\{\(\) => handleExportKML\(filteredRoutes\[0\]\)\} className="p-1\.5 bg-indigo-600\/20 hover:bg-indigo-600\/40 text-indigo-400 border border-indigo-500\/30 rounded-lg transition-colors" title="Export as KML">\s*<Download className="w-3\.5 h-3\.5" \/>\s*<\/button>/;

const newSingleActions = \`<button onClick={() => handleSplitRoute(filteredRoutes[0])} className="p-1.5 bg-amber-500/20 hover:bg-amber-500/40 text-amber-400 border border-amber-500/30 rounded-lg transition-colors" title="Split Segment">
                    <Scissors className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleExportJSON(filteredRoutes[0])} className="p-1.5 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 border border-emerald-500/30 rounded-lg transition-colors" title="Backup JSON Schema">
                    <FileJson className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleExportKML(filteredRoutes[0])} className="p-1.5 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 border border-indigo-500/30 rounded-lg transition-colors" title="Export as KML">
                    <Download className="w-3.5 h-3.5" />
                  </button>\`;
content = content.replace(oldSingleActions, newSingleActions);


// 6. Update Context Menu
const oldContextMeta = /<button onClick=\{\(\) => \{ handleExportKML\(contextMenu\.route\); setContextMenu\(null\); \}\} className="w-full text-left px-3 py-2\.5 text-\[11px\] font-medium text-slate-200 hover:bg-emerald-600\/20 hover:text-emerald-300 transition-colors flex items-center justify-between">Export Metadata <Download className="w-3 h-3"\/><\/button>/;
const newContextMeta = \`<button onClick={() => { handleExportKML(contextMenu.route); setContextMenu(null); }} className="w-full text-left px-3 py-2.5 text-[11px] font-medium text-slate-200 hover:bg-emerald-600/20 hover:text-emerald-300 transition-colors flex items-center justify-between">Export KML <Download className="w-3 h-3"/></button>
           <button onClick={() => { handleExportJSON(contextMenu.route); setContextMenu(null); }} className="w-full text-left px-3 py-2.5 text-[11px] font-medium text-slate-200 hover:bg-teal-600/20 hover:text-teal-300 transition-colors flex items-center justify-between">Backup JSON <FileJson className="w-3 h-3"/></button>\`;
content = content.replace(oldContextMeta, newContextMeta);

fs.writeFileSync('src/components/bank/AuraDriveMap.tsx', content);
