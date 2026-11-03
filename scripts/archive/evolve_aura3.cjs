const fs = require('fs');
let content = fs.readFileSync('src/components/bank/AuraDriveMap.tsx', 'utf8');

// 1. Add fileInputRef and new handler functions inside AuraDriveMap component
const hooksStartPattern = /const \[activeCar, setActiveCar\] = useState<any>\(null\);/;
const newHooksAndHandlers = `const [activeCar, setActiveCar] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBulkImport = (e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0];
     if (!file) return;
     const reader = new FileReader();
     reader.onload = (ev) => {
        try {
           const geojson = JSON.parse(ev.target?.result as string);
           const features = geojson.features || (geojson.type === 'Feature' ? [geojson] : []);
           const newRoutes = features.filter((f: any) => f.geometry && (f.geometry.type === 'LineString' || f.geometry.type === 'MultiLineString')).map((f: any, i: number) => {
               const coords = f.geometry.type === 'MultiLineString' ? f.geometry.coordinates[0].map((c: any) => [c[1], c[0]]) : f.geometry.coordinates.map((c: any) => [c[1], c[0]]);
               return {
                   id: \`IMP-\${Date.now().toString().slice(-4)}-\${i}\`,
                   name: f.properties?.name || \`Imported Route \${i+1}\`,
                   positions: coords,
                   nodes: coords.map((c: any) => ({ time: new Date().toISOString().substring(11, 19), vel: "30km/h" })),
                   color: "#06C167",
                   distance: "N/A",
                   numericDistance: 0,
                   eta: "N/A",
                   traffic: "low",
                   speed: "N/A",
                   category: "standard",
                   transportMode: "road",
                   createdAt: new Date().toISOString(),
                   updatedAt: new Date().toISOString()
               };
           });
           if (newRoutes.length === 0) throw new Error("No valid LineStrings found");
           setRouteSegments(prev => [...prev, ...newRoutes]);
           toast.success(\`Successfully imported \${newRoutes.length} routes.\`);
        } catch (err) {
           toast.error("Failed to parse GeoJSON.");
        }
        if (fileInputRef.current) fileInputRef.current.value = "";
     };
     reader.readAsText(file);
  };

  const applyStylePreset = (preset: 'treasury' | 'tech' | 'emergency') => {
      const colors = {
         treasury: '#fbbf24',
         tech: '#3b82f6',
         emergency: '#ef4444'
      };
      setRouteSegments(prev => prev.map(r => ({ ...r, color: colors[preset], updatedAt: new Date().toISOString() })));
      toast.success(\`Applied \${preset.toUpperCase()} theme to all routes.\`);
  };
`;
content = content.replace(hooksStartPattern, newHooksAndHandlers);


// 2. Add Style Presets & Bulk Import UI to Advanced Controls
const advancedControlsEndPattern = /<div className="flex gap-2 mt-2">\s*<button onClick=\{\(\) => setShowLabels\(!showLabels\)\}/;
const newControlsUI = `<div className="flex flex-col gap-1.5 mt-2">
                   <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Style Presets</span>
                   <div className="flex gap-2">
                     <button onClick={() => applyStylePreset('treasury')} className="flex-1 rounded-lg p-1 text-[9px] uppercase font-bold transition-colors bg-slate-800 hover:bg-amber-500/20 text-amber-400 border border-slate-700">Treasury Gold</button>
                     <button onClick={() => applyStylePreset('tech')} className="flex-1 rounded-lg p-1 text-[9px] uppercase font-bold transition-colors bg-slate-800 hover:bg-blue-500/20 text-blue-400 border border-slate-700">Standard Tech</button>
                     <button onClick={() => applyStylePreset('emergency')} className="flex-1 rounded-lg p-1 text-[9px] uppercase font-bold transition-colors bg-slate-800 hover:bg-red-500/20 text-red-400 border border-slate-700">Emergency Red</button>
                   </div>
                 </div>
                 
                 <div className="flex flex-col gap-1.5 mt-2 mb-2">
                    <input type="file" accept=".json,.geojson" className="hidden" ref={fileInputRef} onChange={handleBulkImport} />
                    <button onClick={() => fileInputRef.current?.click()} className="w-full rounded-lg p-1.5 flex justify-center items-center gap-1 text-[9px] uppercase font-bold transition-colors bg-slate-800 hover:bg-emerald-600/20 text-emerald-400 border border-slate-700">
                       <Download className="w-3 h-3 rotate-180" /> Bulk Import GeoJSON
                    </button>
                 </div>
                 <div className="flex gap-2 mt-2">
                   <button onClick={() => setShowLabels(!showLabels)}`;
content = content.replace(advancedControlsEndPattern, newControlsUI);

// 3. Update the Expandable Details view for single selected route
const coordsViewPattern = /\{showCoordsFor === filteredRoutes\[0\]\.id && \(\s*<div className="mt-3 p-2 bg-slate-950 rounded-xl border border-slate-800 max-h-32 overflow-y-auto">[\s\S]*?<\/div>\s*\)\}/;

const newCoordsView = `{showCoordsFor === filteredRoutes[0].id && (
                <div className="mt-3 p-3 bg-slate-950/80 backdrop-blur rounded-xl border border-slate-800 max-h-48 overflow-y-auto hide-scrollbar">
                  <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-3 sticky top-0 bg-slate-950/90 pb-2 border-b border-slate-800/50 flex flex-col gap-2 z-10">
                    <span>Route Metadata & Geometry</span>
                    <div className="flex items-center gap-2">
                       <span className="text-[8px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300 whitespace-nowrap">Created: {filteredRoutes[0].createdAt ? new Date(filteredRoutes[0].createdAt).toLocaleTimeString() : 'N/A'}</span>
                       <span className="text-[8px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300 whitespace-nowrap">Updated: {filteredRoutes[0].updatedAt ? new Date(filteredRoutes[0].updatedAt).toLocaleTimeString() : 'N/A'}</span>
                    </div>
                  </div>
                  <ul className="space-y-1">
                    {filteredRoutes[0].positions.map((pos: any, idx: number) => (
                      <li key={idx} className="text-[10px] font-mono flex items-center justify-between border-b border-white/5 pb-1 last:border-0 hover:bg-white/5 px-1 rounded transition-colors">
                        <span className="text-slate-600 font-bold w-6">[{idx}]</span>
                        <div className="flex gap-4 flex-1 justify-end">
                           <span className="text-emerald-400/80">Lat: {Number(pos[0]).toFixed(6)}</span>
                           <span className="text-blue-400/80">Lng: {Number(pos[1]).toFixed(6)}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}`;

content = content.replace(coordsViewPattern, newCoordsView);

// 4. Update the dragend event to set updatedAt
const dragendPattern = /return \{ \.\.\.r, positions: newPositions \};/;
const newDragend = `return { ...r, positions: newPositions, updatedAt: new Date().toISOString() };`;
content = content.replace(dragendPattern, newDragend);

fs.writeFileSync('src/components/bank/AuraDriveMap.tsx', content);
