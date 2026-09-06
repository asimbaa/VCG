const fs = require('fs');
let code = fs.readFileSync('src/components/bank/AuraDriveMap.tsx', 'utf8');

const targetTooltip = `                    <div className="relative z-10">
                      <div className="font-black text-indigo-400 mb-1 tracking-widest uppercase border-b border-indigo-500/30 pb-1 flex justify-between">
                        <span>{route.id}</span> <span>{route.name}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-2 mb-2">
                        <div className="bg-slate-900 p-1.5 rounded border border-white/5">
                          <span className="text-[8px] text-slate-500 block">
                            ORIGIN
                          </span>
                          <span className="text-white font-bold truncate block">
                            {route.nodes[0]?.time || "Start"}
                          </span>
                        </div>
                        <div className="bg-slate-900 p-1.5 rounded border border-white/5">
                          <span className="text-[8px] text-slate-500 block">
                            DESTINATION
                          </span>
                          <span className="text-white font-bold truncate block">
                            {route.nodes[route.nodes.length - 1]?.time || "End"}
                          </span>
                        </div>
                      </div>
                      <div className="pt-1 border-t border-slate-800 flex justify-between items-center">
                        <span className="text-slate-500 text-[8px] uppercase tracking-wider">
                          Calc. Speed
                        </span>
                        <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                          {route.nodes[route.nodes.length - 1]?.vel || "0 km/h"}
                        </span>
                      </div>
                    </div>`;

const replacementTooltip = `                    <div className="relative z-10 w-44">
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
                    </div>`;

code = code.replace(targetTooltip, replacementTooltip);
fs.writeFileSync('src/components/bank/AuraDriveMap.tsx', code);
