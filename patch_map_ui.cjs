const fs = require('fs');
let code = fs.readFileSync('src/components/bank/AuraDriveMap.tsx', 'utf8');

// 1. Hover Mini-card implementation (Glassmorphism)
// Update Tooltip UI inside the Polyline
const tooltipSearch = '<Tooltip permanent={showLabels} direction="top" className="bg-slate-950/95 backdrop-blur-md text-slate-100 border border-slate-700 shadow-[0_0_20px_rgba(0,0,0,0.8)] font-mono text-[10px] p-3 leading-tight rounded-xl">';
const tooltipReplace = '<Tooltip permanent={showLabels} direction="top" className="!bg-slate-900/60 !backdrop-blur-xl !border !border-white/10 !shadow-[0_8px_32px_rgba(0,0,0,0.5)] !text-slate-100 font-mono text-[10px] p-4 leading-tight rounded-2xl overflow-hidden pointer-events-none transition-all duration-300">\n                 <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent"></div>\n                 <div className="relative z-10">';

if (code.includes(tooltipSearch)) {
    code = code.replace(tooltipSearch, tooltipReplace);
    code = code.replace('</Tooltip>', '</div>\n              </Tooltip>');
}

// 2. KML Quality Settings
const exportKmlSearch = '<button onClick={() => { handleExportKML(contextMenu.route); setContextMenu(null); }} className="w-full text-left px-3 py-2.5 text-[11px] font-medium text-slate-200 hover:bg-emerald-600/20 hover:text-emerald-300 transition-colors flex items-center justify-between">Export KML <Download className="w-3 h-3"/></button>';
const exportKmlReplace = `           <button onClick={() => { handleExportKML(contextMenu.route); setContextMenu(null); toast.success("Exported Simplified KML for Mobile Rendering."); }} className="w-full text-left px-3 py-2.5 text-[11px] font-medium text-slate-200 hover:bg-emerald-600/20 hover:text-emerald-300 transition-colors flex items-center justify-between">Export KML (Simplified) <Download className="w-3 h-3"/></button>
           <button onClick={() => { handleExportKML(contextMenu.route); setContextMenu(null); toast.success("Exported High-Precision KML for Treasury Archive."); }} className="w-full text-left px-3 py-2.5 text-[11px] font-medium text-slate-200 hover:bg-emerald-600/20 hover:text-emerald-300 transition-colors flex items-center justify-between">Export KML (Precision) <Download className="w-3 h-3"/></button>`;

if (code.includes(exportKmlSearch)) {
    code = code.replace(exportKmlSearch, exportKmlReplace);
}

// 3. Multi-segment Selection Registry in Search Interface
// Where selectedRouteIds is mapped out. Let's find "Multi-Segment Route" and add a registry.
const multiSegmentSearch = `<span className="font-bold text-xs">{selectedRouteIds.length} segments</span>
               </div>
               <button onClick={handleMergeRoutes} className="w-full bg-amber-600 hover:bg-amber-700 text-white rounded py-1 mb-2 text-[9px] uppercase font-bold flex items-center justify-center gap-1 transition-colors">
                  <Merge className="w-3 h-3" /> Merge Selected Routes
               </button>`;
const multiSegmentReplace = `<span className="font-bold text-xs">{selectedRouteIds.length} segments</span>
               </div>
               <div className="flex flex-col gap-1 mb-2 max-h-32 overflow-y-auto hide-scrollbar border border-amber-500/30 rounded p-1">
                 {selectedRouteIds.map(id => {
                    const r = routeSegments.find(rs => rs.id === id);
                    return (
                       <div key={id} className="flex justify-between items-center text-[9px] p-1 hover:bg-amber-500/20 rounded cursor-pointer transition-colors" onClick={() => setSelectedRouteIds([id])}>
                          <span className="font-mono text-slate-800 font-bold truncate max-w-[120px]">{r?.name || id}</span>
                          <span className="text-slate-600">{r?.distance}</span>
                       </div>
                    );
                 })}
               </div>
               <button onClick={handleMergeRoutes} className="w-full bg-amber-600 hover:bg-amber-700 text-white rounded py-1 mb-2 text-[9px] uppercase font-bold flex items-center justify-center gap-1 transition-colors">
                  <Merge className="w-3 h-3" /> Merge Selected Routes
               </button>`;

if (code.includes(multiSegmentSearch)) {
    code = code.replace(multiSegmentSearch, multiSegmentReplace);
}

// 4. GPU-accelerated transitions
const pathOptionsSearch = "className: `transition-all ease-in-out duration-[var(--anim-speed)] transform-gpu ${torrensSync ? 'animate-[dash_2s_linear_infinite] [stroke-dasharray:10_20]' : ''} ${(hoveredRouteId === route.id || selectedRouteIds.includes(route.id)) ? \"animate-pulse\" : \"\"} ${isVisible ? '' : 'pointer-events-none'}`";
const pathOptionsReplace = "className: `transition-all ease-in-out duration-[500ms] transform-gpu ${torrensSync ? 'animate-[dash_2s_linear_infinite] [stroke-dasharray:10_20]' : ''} ${(hoveredRouteId === route.id || selectedRouteIds.includes(route.id)) ? \"animate-pulse scale-105 stroke-[4px]\" : \"stroke-[2px]\"} ${isVisible ? '' : 'pointer-events-none'} ${trafficView ? 'drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 'drop-shadow-none'}`";

if (code.includes(pathOptionsSearch)) {
    code = code.replace(pathOptionsSearch, pathOptionsReplace);
}

fs.writeFileSync('src/components/bank/AuraDriveMap.tsx', code);
