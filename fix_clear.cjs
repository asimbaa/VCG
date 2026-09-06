const fs = require('fs');
let content = fs.readFileSync('src/components/bank/AuraDriveMap.tsx', 'utf8');

const searchBlockOld = `<div className="flex items-center gap-2">
                 <Search className="w-4 h-4 text-slate-400 ml-2" />
                 <input 
                   type="text"
                   placeholder="Search routes or IDs..."
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   className="bg-transparent border-none outline-none text-xs text-white placeholder-slate-500 w-full font-medium py-1"
                 />
             </div>`;

const searchBlockNew = `<div className="flex items-center gap-2 w-full">
                 <Search className="w-4 h-4 text-slate-400 ml-2" />
                 <input 
                   type="text"
                   placeholder="Search routes or IDs..."
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   className="bg-transparent border-none outline-none text-xs text-white placeholder-slate-500 w-full font-medium py-1"
                 />
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

content = content.replace(searchBlockOld, searchBlockNew);

fs.writeFileSync('src/components/bank/AuraDriveMap.tsx', content);
