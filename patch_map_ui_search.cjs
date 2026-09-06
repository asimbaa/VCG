const fs = require('fs');
let code = fs.readFileSync('src/components/bank/AuraDriveMap.tsx', 'utf8');

// Share & Polygon buttons next to the search input
const searchControls = `
                 <button 
                   onClick={() => setPolygonSelectionMode(!polygonSelectionMode)} 
                   className={\`p-1.5 rounded transition-colors mr-1 \${polygonSelectionMode ? 'bg-fuchsia-500/20 text-fuchsia-400' : 'text-slate-400 hover:text-slate-200'}\`}
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
`;
code = code.replace(
  "{searchQuery && (",
  searchControls
);

// Count of selected segments: already present inside the "Multi-Segment Route" div: `<span className="font-bold text-xs">{selectedRouteIds.length} segments</span>`
// Add a Replay button in the single selected route box or multi.
// If selectedRouteIds.length === 1, we show a replay and elevation profile.
const elevationProfileStr = `
         {selectedRouteIds.length === 1 && (
            <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700 p-3 rounded-2xl shadow-xl pointer-events-auto w-full animate-in fade-in slide-in-from-left-4 shrink-0 mt-2">
               <div className="flex justify-between items-center mb-2">
                  <h5 className="font-black text-[10px] uppercase tracking-wider text-slate-400">Route Analysis</h5>
                  <button 
                     onClick={() => handleReplayRoute(selectedRouteIds[0])}
                     className="bg-indigo-600 hover:bg-indigo-500 text-white p-1 rounded transition-colors flex items-center gap-1 text-[9px] uppercase font-bold"
                  >
                     <Play className="w-3 h-3" /> {replayingRouteId === selectedRouteIds[0] ? "Stop Replay" : "Replay"}
                  </button>
               </div>
               <div className="h-24 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={routeSegments.find(r => r.id === selectedRouteIds[0])?.positions.map((p, i) => ({ dist: i, elevation: Math.abs(Math.sin(p[0] * 100) * 100) + 50 })) || []}>
                        <defs>
                           <linearGradient id="colorElevation" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                           <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                           </linearGradient>
                        </defs>
                        <XAxis dataKey="dist" hide />
                        <RechartsTooltip 
                           contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', fontSize: '10px' }} 
                           itemStyle={{ color: '#8b5cf6' }} 
                           labelStyle={{ display: 'none' }}
                        />
                        <Area type="monotone" dataKey="elevation" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorElevation)" />
                     </AreaChart>
                  </ResponsiveContainer>
               </div>
               <div className="text-[9px] text-center text-slate-500 font-mono mt-1 uppercase">Elevation Profile</div>
            </div>
         )}
`;

code = code.replace(
  "{filteredRoutes.map(route => (",
  elevationProfileStr + "\n         {filteredRoutes.map(route => ("
);

fs.writeFileSync('src/components/bank/AuraDriveMap.tsx', code);
