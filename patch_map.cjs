const fs = require('fs');
let code = fs.readFileSync('src/components/bank/AuraDriveMap.tsx', 'utf8');

// 1. Add top-right traffic toggle
const overlaysSearch = '{/* Map UI Overlays */}';
const overlaysReplace = `{/* Map UI Overlays */}
      <div className="absolute top-4 right-4 z-[400] pointer-events-auto">
         <button onClick={() => setTrafficView(!trafficView)} className={\`flex items-center justify-center p-3 rounded-xl shadow-lg transition-all duration-300 backdrop-blur-md border \${trafficView ? 'bg-rose-500/20 border-rose-500/50 text-rose-400 drop-shadow-[0_0_10px_rgba(225,29,72,0.8)]' : 'bg-slate-900/60 border-white/10 text-slate-300 hover:bg-slate-800/80'} group\`} title="Toggle Traffic Heatmap">
            <Activity className={\`w-4 h-4 \${trafficView ? 'animate-pulse' : 'group-hover:scale-110 transition-transform'}\`} />
         </button>
      </div>`;
if (code.includes(overlaysSearch) && !code.includes('absolute top-4 right-4 z-[400] pointer-events-auto')) {
    code = code.replace(overlaysSearch, overlaysReplace);
}

// 2. CSS transition for polylines
const cssSearch = 'className: `transition-all ease-in-out duration-[500ms] transform-gpu ${torrensSync ? \'animate-[dash_2s_linear_infinite] [stroke-dasharray:10_20]\' : \'\'} ${(hoveredRouteId === route.id || selectedRouteIds.includes(route.id)) ? "animate-pulse scale-105 stroke-[4px]" : "stroke-[2px]"} ${isVisible ? \'\' : \'pointer-events-none\'} ${trafficView ? \'drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]\' : \'drop-shadow-none\'}`';
const cssReplace = 'className: `transition-all ease-[cubic-bezier(0.34,1.56,0.64,1)] duration-[600ms] transform-gpu ${torrensSync ? \'animate-[dash_2s_linear_infinite] [stroke-dasharray:10_20]\' : \'\'} ${(hoveredRouteId === route.id || selectedRouteIds.includes(route.id)) ? "animate-pulse scale-110 stroke-[5px]" : "stroke-[2px]"} ${isVisible ? \'\' : \'pointer-events-none\'} ${trafficView ? \'drop-shadow-[0_0_12px_rgba(239,68,68,0.9)] stroke-rose-500\' : \'drop-shadow-none\'}`';
if (code.includes(cssSearch)) {
    code = code.replace(cssSearch, cssReplace);
}

// 3. Hover mini card origin, dest, etc.
const tooltipSearch = `<Tooltip permanent={showLabels} direction="top" className="!bg-slate-900/60 !backdrop-blur-xl !border !border-white/10 !shadow-[0_8px_32px_rgba(0,0,0,0.5)] !text-slate-100 font-mono text-[10px] p-4 leading-tight rounded-2xl overflow-hidden pointer-events-none transition-all duration-300">
                 <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent"></div>
                 <div className="relative z-10">
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
              </div>
              </Tooltip>`;

const tooltipReplace = `<Tooltip permanent={showLabels} direction="top" className="!bg-slate-900/60 !backdrop-blur-xl !border !border-white/10 !shadow-[0_8px_32px_rgba(0,0,0,0.5)] !text-slate-100 font-mono text-[10px] p-4 leading-tight rounded-2xl overflow-hidden pointer-events-none transition-all duration-300 group-hover:!scale-110 origin-bottom">
                 <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent"></div>
                 <div className="relative z-10">
                 <div className="font-black text-indigo-400 mb-1 tracking-widest uppercase border-b border-indigo-500/30 pb-1 flex justify-between"><span>{route.id}</span> <span>{route.name}</span></div>
                 <div className="grid grid-cols-2 gap-2 mt-2 mb-2">
                     <div className="bg-slate-900 p-1.5 rounded border border-white/5">
                         <span className="text-[8px] text-slate-500 block">ORIGIN</span>
                         <span className="text-white font-bold truncate block">{route.nodes[0]?.time || 'Start'}</span>
                     </div>
                     <div className="bg-slate-900 p-1.5 rounded border border-white/5">
                         <span className="text-[8px] text-slate-500 block">DESTINATION</span>
                         <span className="text-white font-bold truncate block">{route.nodes[route.nodes.length - 1]?.time || 'End'}</span>
                     </div>
                 </div>
                 <div className="pt-1 border-t border-slate-800 flex justify-between items-center">
                    <span className="text-slate-500 text-[8px] uppercase tracking-wider">Calc. Speed</span>
                    <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">{route.nodes[route.nodes.length - 1]?.vel || '0 km/h'}</span>
                 </div>
              </div>
              </Tooltip>`;

if (code.includes(tooltipSearch)) {
    code = code.replace(tooltipSearch, tooltipReplace);
}

// 4. Context Menu
const contextSearch = `<button onClick={() => { setSearchQuery(contextMenu.route.id); setContextMenu(null); }} className="w-full text-left px-3 py-2.5 text-[11px] font-medium text-slate-200 hover:bg-indigo-600/20 hover:text-indigo-300 transition-colors flex items-center justify-between">Center & Isolate <Search className="w-3 h-3"/></button>
                      <button onClick={() => { handleExportKML(contextMenu.route); setContextMenu(null); toast.success("Exported Simplified KML for Mobile Rendering."); }} className="w-full text-left px-3 py-2.5 text-[11px] font-medium text-slate-200 hover:bg-emerald-600/20 hover:text-emerald-300 transition-colors flex items-center justify-between">Export KML (Simplified) <Download className="w-3 h-3"/></button>
           <button onClick={() => { handleExportKML(contextMenu.route); setContextMenu(null); toast.success("Exported High-Precision KML for Treasury Archive."); }} className="w-full text-left px-3 py-2.5 text-[11px] font-medium text-slate-200 hover:bg-emerald-600/20 hover:text-emerald-300 transition-colors flex items-center justify-between">Export KML (Precision) <Download className="w-3 h-3"/></button>
           <button onClick={() => { handleExportJSON(contextMenu.route); setContextMenu(null); }} className="w-full text-left px-3 py-2.5 text-[11px] font-medium text-slate-200 hover:bg-teal-600/20 hover:text-teal-300 transition-colors flex items-center justify-between">Backup JSON <FileJson className="w-3 h-3"/></button>
           <button onClick={() => { setPathEditModeFor(contextMenu.route.id); setContextMenu(null); }} className="w-full text-left px-3 py-2.5 text-[11px] font-medium text-amber-400 hover:bg-amber-500/20 transition-colors flex justify-between items-center border-t border-slate-800/50">Modify Path Nodes <Edit3 className="w-3 h-3" /></button>
           <button onClick={() => { handleArchiveRoute(contextMenu.route); setContextMenu(null); }} className="w-full text-left px-3 py-2.5 text-[11px] font-medium text-rose-500 hover:bg-rose-500/20 transition-colors flex justify-between items-center border-t border-slate-800/50">Delete Segment <Trash2 className="w-3 h-3" /></button>`;

const contextReplace = `<button onClick={() => { setSearchQuery(contextMenu.route.id); setContextMenu(null); }} className="w-full text-left px-3 py-2.5 text-[11px] font-medium text-slate-200 hover:bg-indigo-600/20 hover:text-indigo-300 transition-colors flex items-center justify-between">Center Map <Search className="w-3 h-3"/></button>
           <button onClick={() => { handleExportJSON(contextMenu.route); setContextMenu(null); }} className="w-full text-left px-3 py-2.5 text-[11px] font-medium text-slate-200 hover:bg-teal-600/20 hover:text-teal-300 transition-colors flex items-center justify-between">Export Metadata <FileJson className="w-3 h-3"/></button>
           <button onClick={() => { setPathEditModeFor(contextMenu.route.id); setContextMenu(null); }} className="w-full text-left px-3 py-2.5 text-[11px] font-medium text-amber-400 hover:bg-amber-500/20 transition-colors flex justify-between items-center border-t border-slate-800/50">Modify Path Nodes <Edit3 className="w-3 h-3" /></button>
           <button onClick={() => { handleArchiveRoute(contextMenu.route); setContextMenu(null); }} className="w-full text-left px-3 py-2.5 text-[11px] font-medium text-rose-500 hover:bg-rose-500/20 transition-colors flex justify-between items-center border-t border-slate-800/50">Archive Segment <Trash2 className="w-3 h-3" /></button>`;

if (code.includes(contextSearch)) {
    code = code.replace(contextSearch, contextReplace);
}

fs.writeFileSync('src/components/bank/AuraDriveMap.tsx', code);
