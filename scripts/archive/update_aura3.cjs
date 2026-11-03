const fs = require('fs');
let content = fs.readFileSync('src/components/bank/AuraDriveMap.tsx', 'utf8');

// 1. Add new icons
content = content.replace(
  /import \{ Search, Download, PenTool, Trash2, List, Navigation, Camera, Eye, MessageSquare, X, Volume2, BellRing, ChevronRight, Globe, ShieldCheck, Activity, Cpu, Fingerprint, Zap, Lock, Unlock, Thermometer, Layers, CheckSquare, Square, Timer, MousePointer2, Settings2, Map as MapIcon, Palette, Focus \} from 'lucide-react';/,
  "import { Search, Download, PenTool, Trash2, List, Navigation, Camera, Eye, MessageSquare, X, Volume2, BellRing, ChevronRight, Globe, ShieldCheck, Activity, Cpu, Fingerprint, Zap, Lock, Unlock, Thermometer, Layers, CheckSquare, Square, Timer, MousePointer2, Settings2, Map as MapIcon, Palette, Focus, Plane, Car, Ship, RefreshCw } from 'lucide-react';"
);

// 2. Add New States (Transport Mode, Torrens Sync, Live Traffic)
const stateInject = `
  const [transportModes, setTransportModes] = useState({ road: true, air: true, maritime: true });
  const [torrensSync, setTorrensSync] = useState(false);
  const [liveTraffic, setLiveTraffic] = useState(false);
`;
content = content.replace(/const \[editingStyleFor, setEditingStyleFor\] = useState<string \| null>\(null\);/, 'const [editingStyleFor, setEditingStyleFor] = useState<string | null>(null);\n' + stateInject);


// 3. Update Route Data to include transportMode
content = content.replace(
  /category: "standard" \}/,
  'category: "standard", transportMode: "road" }'
);
content = content.replace(
  /category: "luxury" \}/,
  'category: "luxury", transportMode: "air" }'
);
content = content.replace(
  /category: "emergency" \}/,
  'category: "emergency", transportMode: "maritime" }'
);


// 4. Update the filter
const oldFilter = `const filteredRoutes = routeSegments.filter(route => 
     (searchQuery === "" || 
      route.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      route.id.toLowerCase().includes(searchQuery.toLowerCase())) &&
     (categories as any)[(route as any).category]
  );`;

const newFilter = `const filteredRoutes = routeSegments.filter(route => 
     (searchQuery === "" || 
      route.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      route.id.toLowerCase().includes(searchQuery.toLowerCase())) &&
     (categories as any)[(route as any).category] &&
     (transportModes as any)[(route as any).transportMode]
  );`;
content = content.replace(oldFilter, newFilter);


// 5. Add Live Traffic Effect
const effectInject = `
  useEffect(() => {
    if (!liveTraffic) return;
    const interval = setInterval(() => {
      setRouteSegments(prev => prev.map(r => {
        const trafficLevels = ['low', 'medium', 'high', 'critical'];
        const randomTraffic = trafficLevels[Math.floor(Math.random() * trafficLevels.length)];
        return { ...r, traffic: randomTraffic };
      }));
    }, 2500);
    return () => clearInterval(interval);
  }, [liveTraffic]);
`;
content = content.replace(/const handleSearch = \(e: React\.FormEvent\) => \{/, effectInject + '\n  const handleSearch = (e: React.FormEvent) => {');


// 6. Update Path Options for Torrens Sync (Hardware Accelerated CSS)
const oldPath = /className: \`transition-all ease-in-out duration-\[var\(--anim-speed\)\] \\\$\{\(hoveredRouteId === route.id \|\| selectedRouteIds.includes\(route.id\)\) \? "animate-pulse" : ""\}\`/;
const newPath = `className: \`transition-all ease-in-out duration-[var(--anim-speed)] transform-gpu \${torrensSync ? 'animate-[dash_2s_linear_infinite] [stroke-dasharray:10_20]' : ''} \${(hoveredRouteId === route.id || selectedRouteIds.includes(route.id)) ? "animate-pulse" : ""}\``;
content = content.replace(oldPath, newPath);


// 7. Inject Keyframes for Torrens Sync and Map Styles
const globalStyleInject = `
      <style>{\`
        @keyframes dash {
          to { stroke-dashoffset: -100; }
        }
        .compliance-watermark {
           display: none;
        }
        .taking-snapshot .compliance-watermark {
           display: block;
        }
      \`}</style>
`;
content = content.replace(/<div className="w-full h-full relative" style=\{\{ \.\.\.style, "--anim-speed": \`\$\{animSpeed\}ms\` \} as React\.CSSProperties\}>/, '<div className="w-full h-full relative" id="aura-drive-map-container" style={{ ...style, "--anim-speed": `${animSpeed}ms` } as React.CSSProperties}>\n' + globalStyleInject);


// 8. Update Snapshot function for Compliance
const oldSnapshot = `  const handleSnapshot = async () => {
    if (!mapRef.current) return;
    try {
      const canvas = await html2canvas(mapRef.current);
      const link = document.createElement('a');
      link.download = 'aura-drive-snapshot.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast.success("Snapshot saved to device");
    } catch (err) {
      toast.error("Failed to capture snapshot");
    }
  };`;

const newSnapshot = `  const handleSnapshot = async () => {
    const mapEl = document.getElementById('aura-drive-map-container');
    if (!mapEl) return;
    toast.loading("Generating Treasury Compliance Snapshot...", { id: "snap" });
    try {
      mapEl.classList.add('taking-snapshot');
      // small delay to allow CSS to apply
      await new Promise(r => setTimeout(r, 100));
      const canvas = await html2canvas(mapEl, { useCORS: true, backgroundColor: null });
      mapEl.classList.remove('taking-snapshot');
      const link = document.createElement('a');
      link.download = \`treasury-compliance-\${new Date().getTime()}.png\`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast.success("Compliance Snapshot Verified & Saved", { id: "snap" });
    } catch (err) {
      mapEl.classList.remove('taking-snapshot');
      toast.error("Failed to capture snapshot", { id: "snap" });
    }
  };`;
content = content.replace(oldSnapshot, newSnapshot);


// 9. Inject UI Controls (Transport Mode, Torrens Sync, Live Traffic)
const oldAdvanced = /<div className="flex flex-col gap-1\.5 mt-2">\s*<span className="text-\[9px\] font-black uppercase text-slate-500 tracking-wider">Base Map Layer<\/span>/;
const newAdvanced = `
                 <div className="flex flex-col gap-1.5 mt-2">
                   <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Transport Modes</span>
                   <div className="flex gap-2">
                     <button onClick={() => setTransportModes(prev => ({ ...prev, road: !prev.road }))} className={\`flex-1 rounded-lg p-1 flex items-center justify-center gap-1 text-[9px] uppercase font-bold transition-colors \${transportModes.road ? 'bg-indigo-600/30 text-indigo-400 border border-indigo-500/50' : 'bg-slate-800 text-slate-500 border border-slate-700'}\`}><Car className="w-2.5 h-2.5"/> Road</button>
                     <button onClick={() => setTransportModes(prev => ({ ...prev, air: !prev.air }))} className={\`flex-1 rounded-lg p-1 flex items-center justify-center gap-1 text-[9px] uppercase font-bold transition-colors \${transportModes.air ? 'bg-indigo-600/30 text-indigo-400 border border-indigo-500/50' : 'bg-slate-800 text-slate-500 border border-slate-700'}\`}><Plane className="w-2.5 h-2.5"/> Air</button>
                     <button onClick={() => setTransportModes(prev => ({ ...prev, maritime: !prev.maritime }))} className={\`flex-1 rounded-lg p-1 flex items-center justify-center gap-1 text-[9px] uppercase font-bold transition-colors \${transportModes.maritime ? 'bg-indigo-600/30 text-indigo-400 border border-indigo-500/50' : 'bg-slate-800 text-slate-500 border border-slate-700'}\`}><Ship className="w-2.5 h-2.5"/> Sea</button>
                   </div>
                 </div>

                 <div className="flex flex-col gap-1.5 mt-2">
                   <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Base Map Layer</span>`;
content = content.replace(oldAdvanced, newAdvanced);


// Torrens Sync & Live Traffic Buttons
const oldControlBtns = /<button onClick=\{\(\) => setTrafficView\(!trafficView\)\} className=\{\`flex-1 rounded-xl p-1\.5 flex justify-center items-center gap-1 transition-colors text-\[9px\] font-black uppercase tracking-wider \$\{trafficView \? 'bg-amber-600 hover:bg-amber-500 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'\}\`\} title="Toggle Traffic Density">\s*<Activity className="w-3 h-3" \/> Traffic\s*<\/button>/;
const newControlBtns = `<button onClick={() => setTrafficView(!trafficView)} className={\`flex-1 rounded-xl p-1.5 flex justify-center items-center gap-1 transition-colors text-[9px] font-black uppercase tracking-wider \${trafficView ? 'bg-amber-600 hover:bg-amber-500 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}\`} title="Toggle Traffic Map">
                   <Activity className="w-3 h-3" /> Map
                </button>
                <button onClick={() => setLiveTraffic(!liveTraffic)} className={\`flex-1 rounded-xl p-1.5 flex justify-center items-center gap-1 transition-colors text-[9px] font-black uppercase tracking-wider \${liveTraffic ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}\`} title="Live Traffic Feed">
                   <RefreshCw className={\`w-3 h-3 \${liveTraffic ? 'animate-spin' : ''}\`} /> Live
                </button>
                <button onClick={() => setTorrensSync(!torrensSync)} className={\`flex-1 rounded-xl p-1.5 flex justify-center items-center gap-1 transition-colors text-[9px] font-black uppercase tracking-wider \${torrensSync ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.5)]' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}\`} title="Torrens Sync">
                   <Zap className="w-3 h-3" /> Sync
                </button>`;
content = content.replace(oldControlBtns, newControlBtns);


// Compliance Watermark Overlay (Hidden until snap)
const mapContainerMatch = /<AutoFitBounds routes=\{filteredRoutes\} \/>/;
const watermarkInject = `
        <AutoFitBounds routes={filteredRoutes} />
        <div className="compliance-watermark absolute top-4 right-4 z-[9999] bg-black/80 backdrop-blur border border-red-500/50 p-4 rounded-lg">
           <h3 className="text-red-500 font-black tracking-widest uppercase text-xl mb-1 flex items-center gap-2">
             <ShieldCheck className="w-6 h-6" /> TREASURY COMPLIANCE
           </h3>
           <div className="text-white font-mono text-xs">Geo-referenced Snapshot ID: {new Date().getTime().toString(16).toUpperCase()}</div>
           <div className="text-white font-mono text-xs">Authorized By: Torrens Matrix Security</div>
        </div>
`;
content = content.replace(mapContainerMatch, watermarkInject);

fs.writeFileSync('src/components/bank/AuraDriveMap.tsx', content);
