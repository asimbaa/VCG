const fs = require('fs');
let content = fs.readFileSync('src/components/bank/AuraDriveMap.tsx', 'utf8');

const oldSearchBlock = /<div className="flex items-center gap-2 w-full">\s*<Search className="w-4 h-4 text-slate-400 ml-2" \/>\s*<input\s*type="text"\s*placeholder="Search routes or IDs..."\s*value=\{searchQuery\}\s*onChange=\{\(e\) => setSearchQuery\(e\.target\.value\)\}\s*className="bg-transparent border-none outline-none text-xs text-white placeholder-slate-500 w-full font-medium py-1"\s*\/>\s*\{searchQuery && \(\s*<button\s*onClick=\{\(\) => setSearchQuery\(""\)\}\s*className="text-slate-400 hover:text-white transition-colors mr-2"\s*title="Clear search"\s*>\s*<X className="w-4 h-4" \/>\s*<\/button>\s*\)\}\s*<\/div>/;

const newSearchBlock = `<div className="flex items-center gap-2 w-full">
                 <Search className="w-4 h-4 text-slate-400 ml-2" />
                 <input 
                   type="text"
                   placeholder="Search routes or IDs..."
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   className="bg-transparent border-none outline-none text-xs text-white placeholder-slate-500 w-full font-medium py-1"
                 />
                 <button 
                   onClick={() => setTrafficView(!trafficView)} 
                   className={\`p-1.5 rounded transition-colors mr-1 \${trafficView ? 'bg-rose-500/20 text-rose-400' : 'text-slate-400 hover:text-slate-200'}\`}
                   title="Toggle Traffic Heatmap"
                 >
                   <Activity className="w-4 h-4" />
                 </button>
                 {searchQuery && (
                   <button 
                     onClick={() => setSearchQuery("")} 
                     className="text-slate-400 hover:text-white transition-colors mr-2"
                     title="Clear search"
                   >
                     <X className="w-4 h-4" />
                   </button>
                 )}
             </div>`;
             
content = content.replace(oldSearchBlock, newSearchBlock);
fs.writeFileSync('src/components/bank/AuraDriveMap.tsx', content);
