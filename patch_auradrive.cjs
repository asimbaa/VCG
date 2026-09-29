const fs = require('fs');

let content = fs.readFileSync('src/components/bank/AuraDriveMap.tsx', 'utf-8');

// 1. Add Icons
if (!content.includes('Upload,')) {
    content = content.replace('Settings2,', 'Settings2,\n  Upload,\n  Download as DownloadIcon,\n  Undo,\n  Wand2,');
}

// 2. Add Douglas Peucker Algorithm & Elevation Mock
const utils = `
const getSqDist = (p1, p2) => {
  const dx = p1[0] - p2[0], dy = p1[1] - p2[1];
  return dx * dx + dy * dy;
};
const getSqSegDist = (p, p1, p2) => {
  let x = p1[0], y = p1[1];
  let dx = p2[0] - x, dy = p2[1] - y;
  if (dx !== 0 || dy !== 0) {
    const t = ((p[0] - x) * dx + (p[1] - y) * dy) / (dx * dx + dy * dy);
    if (t > 1) { x = p2[0]; y = p2[1]; } 
    else if (t > 0) { x += dx * t; y += dy * t; }
  }
  dx = p[0] - x; dy = p[1] - y;
  return dx * dx + dy * dy;
};
const simplifyDPStep = (points, first, last, sqTolerance, simplified) => {
  let maxSqDist = sqTolerance, index;
  for (let i = first + 1; i < last; i++) {
    const sqDist = getSqSegDist(points[i], points[first], points[last]);
    if (sqDist > maxSqDist) { index = i; maxSqDist = sqDist; }
  }
  if (maxSqDist > sqTolerance) {
    if (index - first > 1) simplifyDPStep(points, first, index, sqTolerance, simplified);
    simplified.push(points[index]);
    if (last - index > 1) simplifyDPStep(points, index, last, sqTolerance, simplified);
  }
};
const simplifyDouglasPeucker = (points, tolerance) => {
  if (points.length <= 2) return points;
  const sqTolerance = tolerance !== undefined ? tolerance * tolerance : 1;
  const simplified = [points[0]];
  simplifyDPStep(points, 0, points.length - 1, sqTolerance, simplified);
  simplified.push(points[points.length - 1]);
  return simplified;
};
`;
if (!content.includes('simplifyDouglasPeucker')) {
    content = content.replace('const generateMockRoutes', utils + '\nconst generateMockRoutes');
}

// 3. Add states for animating & file upload ref
content = content.replace('const [contextMenu, setContextMenu] = useState<any>(null);', 
  `const [contextMenu, setContextMenu] = useState<any>(null);
  const [isAnimatingRoute, setIsAnimatingRoute] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);`);

// 4. Update the isDrawingRoute HUD
const oldHUD = `
        {isDrawingRoute && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[400] bg-slate-900/90 backdrop-blur-md border border-emerald-500/50 p-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4 pointer-events-auto">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-emerald-400 font-bold text-xs uppercase tracking-widest">Draw Mode Active</span>
            </div>
            <div className="w-px h-6 bg-slate-700" />
            <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">
              Nodes: {newRoutePoints.length}
            </div>
            <div className="w-px h-6 bg-slate-700" />
            <Button 
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-500 text-white h-7 text-[10px] uppercase font-black"
`;
const newHUD = `
        {isDrawingRoute && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[400] bg-slate-900/90 backdrop-blur-md border border-emerald-500/50 p-3 rounded-2xl shadow-2xl flex flex-col gap-3 animate-in slide-in-from-top-4 pointer-events-auto">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-emerald-400 font-bold text-xs uppercase tracking-widest">Draw Mode</span>
              </div>
              <div className="w-px h-6 bg-slate-700" />
              <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider w-16 text-center">
                Nodes: {newRoutePoints.length}
              </div>
              <div className="w-px h-6 bg-slate-700" />
              
              <Button size="icon" variant="ghost" className="h-7 w-7 text-slate-400 hover:text-white" 
                onClick={() => setNewRoutePoints(prev => prev.slice(0, -1))} title="Undo Last Point">
                <Undo className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="ghost" className="h-7 w-7 text-slate-400 hover:text-fuchsia-400" 
                onClick={() => setNewRoutePoints(prev => simplifyDouglasPeucker(prev, 0.001))} title="Simplify Path">
                <Wand2 className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="ghost" className="h-7 w-7 text-slate-400 hover:text-blue-400" 
                onClick={() => { setIsAnimatingRoute(true); setTimeout(() => setIsAnimatingRoute(false), 3000); }} title="Play Route Animation">
                <Play className="w-4 h-4" />
              </Button>

              <div className="w-px h-6 bg-slate-700" />
              <Button 
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-500 text-white h-7 text-[10px] uppercase font-black"
`;
content = content.replace(oldHUD, newHUD);

// 5. Add Elevation Chart below HUD
const chartCode = `
            {newRoutePoints.length > 1 && (
              <div className="h-20 w-full mt-2 border-t border-slate-700/50 pt-2">
                 <div className="text-[9px] font-black uppercase text-slate-500 tracking-wider mb-1">Elevation Profile (Mock)</div>
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={newRoutePoints.map((p, i) => ({ index: i, elevation: 10 + Math.sin(i) * 5 + Math.random() * 2 }))}>
                      <Area type="monotone" dataKey="elevation" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
            )}
          </div>
`;
content = content.replace(/Cancel\s*<\/Button>\s*<\/div>\s*\)\}/, `Cancel\n            </Button>\n            </div>\n` + chartCode + `\n        )}`);

// 6. Update Path rendering for animating
content = content.replace(
`          {newRoutePoints.length > 0 && (
            <Polyline
              positions={newRoutePoints}
              pathOptions={{ color: '#10b981', weight: 4, dashArray: '5, 10' }}`
,
`          <style>{ \`
            @keyframes drawRouteDash {
              to { stroke-dashoffset: 0; }
            }
            .animate-draw-route {
              stroke-dasharray: 1000;
              stroke-dashoffset: 1000;
              animation: drawRouteDash 3s linear forwards;
            }
          \` }</style>
          {newRoutePoints.length > 0 && (
            <Polyline
              positions={newRoutePoints}
              pathOptions={{ 
                color: '#10b981', 
                weight: 4, 
                dashArray: isAnimatingRoute ? '1000' : '5, 10',
                className: isAnimatingRoute ? 'animate-draw-route' : ''
              }}`
);

// 7. Add Import/Export Buttons to Sidebar
const newSidebarButtons = `
            <div className="flex gap-2 border-t border-slate-700/50 pt-2 mt-2">
                <input 
                  type="file" 
                  accept=".json" 
                  ref={fileInputRef} 
                  className="hidden" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        try {
                          const imported = JSON.parse(ev.target?.result as string);
                          if (Array.isArray(imported)) {
                            setRouteSegments(prev => [...prev, ...imported]);
                            toast.success("Routes Imported Successfully");
                          }
                        } catch (e) {
                          toast.error("Failed to parse JSON");
                        }
                      };
                      reader.readAsText(file);
                    }
                  }}
                />
                <button
                    onClick={() => {
                        const blob = new Blob([JSON.stringify(routeSegments, null, 2)], { type: "application/json" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = "routes.json";
                        a.click();
                        toast.success("Routes Exported to JSON");
                    }}
                    className="flex-1 rounded-lg p-1.5 flex justify-center items-center gap-1 text-[9px] uppercase font-bold transition-colors bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700"
                >
                    <DownloadIcon className="w-3 h-3" /> Export
                </button>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 rounded-lg p-1.5 flex justify-center items-center gap-1 text-[9px] uppercase font-bold transition-colors bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700"
                >
                    <Upload className="w-3 h-3" /> Import
                </button>
            </div>
`;
content = content.replace(/<div className="flex gap-2 border-t border-slate-700\/50 pt-2 mt-2">\s*<button[\s\S]*?<Globe className="w-3 h-3" \/>.*?<\/button>\s*<\/div>/, (match) => {
  return match + newSidebarButtons;
});

fs.writeFileSync('src/components/bank/AuraDriveMap.tsx', content);
