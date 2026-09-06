const fs = require('fs');
let code = fs.readFileSync('src/components/bank/AuraDriveMap.tsx', 'utf8');

const searchBlockStart = '<div className="flex items-center gap-2 w-full">';

const insertions = `
             {selectedRouteIds.length > 0 && (
                 <div className="flex justify-between items-center w-full px-1 mb-1 border-b border-slate-700/50 pb-2">
                     <div className="flex items-center gap-1 bg-fuchsia-500/20 text-fuchsia-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest">
                       {selectedRouteIds.length} Selected
                     </div>
                     {selectedRouteIds.length === 1 && (
                       <button 
                          onClick={() => handleReplayRoute(selectedRouteIds[0])}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white px-2 py-0.5 rounded transition-colors flex items-center gap-1 text-[9px] uppercase font-bold"
                       >
                          <Play className="w-3 h-3" /> {replayingRouteId === selectedRouteIds[0] ? "Stop Replay" : "Replay Route"}
                       </button>
                     )}
                 </div>
             )}
             {selectedRouteIds.length === 1 && (
                 <div className="h-24 w-full mb-2 border-b border-slate-700/50 pb-2">
                    <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Elevation Profile</span>
                    <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={routeSegments.find(r => r.id === selectedRouteIds[0])?.positions.map((p, i) => ({ dist: i, elevation: Math.abs(Math.sin(p[0] * 100) * 100) + 50 })) || []}>
                          <defs>
                             <linearGradient id="colorElevation" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                             <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                             </linearGradient>
                          </defs>
                          <XAxis dataKey="dist" hide />
                          <YAxis hide domain={['dataMin - 10', 'dataMax + 10']} />
                          <RechartsTooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '10px'}} itemStyle={{color: '#8b5cf6'}} labelStyle={{display: 'none'}} />
                          <Area type="monotone" dataKey="elevation" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorElevation)" />
                       </AreaChart>
                    </ResponsiveContainer>
                 </div>
             )}
             <div className="flex items-center gap-2 w-full">
`;

code = code.replace(searchBlockStart, insertions);

fs.writeFileSync('src/components/bank/AuraDriveMap.tsx', code);
