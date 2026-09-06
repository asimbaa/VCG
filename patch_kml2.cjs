const fs = require('fs');
let code = fs.readFileSync('src/components/bank/AuraDriveMap.tsx', 'utf8');

const uiSearch = `<button onClick={() => handleExportKML(filteredRoutes[0])} className="p-1.5 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 border border-indigo-500/30 rounded-lg transition-colors" title="Export as KML">
                    <Download className="w-3.5 h-3.5" />
                  </button>`;

const uiReplace = `<button onClick={() => handleExportKML(filteredRoutes[0], 'high')} className="p-1.5 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 border border-indigo-500/30 rounded-lg transition-colors" title="Export KML (High Precision)">
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleExportKML(filteredRoutes[0], 'simplified')} className="p-1.5 bg-sky-600/20 hover:bg-sky-600/40 text-sky-400 border border-sky-500/30 rounded-lg transition-colors flex items-center justify-center relative" title="Export KML (Simplified)">
                    <Download className="w-3 h-3" /><span className="absolute bottom-0.5 right-0.5 text-[6px] font-black uppercase text-sky-300">S</span>
                  </button>`;

code = code.replace(uiSearch, uiReplace);

fs.writeFileSync('src/components/bank/AuraDriveMap.tsx', code);
