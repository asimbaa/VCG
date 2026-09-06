const fs = require('fs');
let code = fs.readFileSync('src/components/bank/AuraDriveMap.tsx', 'utf8');

// 1. Add bottleneckIcon
const bottleneckIconStr = `const bottleneckIcon = new DivIcon({
  html: \`<div class="w-6 h-6 flex items-center justify-center bg-rose-500/20 rounded-full border border-rose-500/50 animate-pulse drop-shadow-[0_0_8px_rgba(225,29,72,0.8)]"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg></div>\`,
  className: "",
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});\n`;
code = code.replace(/const transportIcon = new DivIcon\(\{/g, bottleneckIconStr + 'const transportIcon = new DivIcon({');


// 2. Modify MapInteractions
const oldMapInteractions = `const MapInteractions = ({
  annotateMode,
  setAnnotations,
  setContextMenu,
}: any) => {
  useMapEvents({
    click(e) {
      setContextMenu(null);
      if (annotateMode) {
        const text = window.prompt("Enter Annotation Label:");
        if (text) {
          setAnnotations((prev: any[]) => [
            ...prev,
            {
              id: Date.now().toString(),
              lat: e.latlng.lat,
              lng: e.latlng.lng,
              text,
            },
          ]);
          toast.success("Tactical Annotation Deployed.");
        }
      }
    },
  });
  return null;
};`;

const newMapInteractions = `const MapInteractions = ({
  annotateMode,
  setAnnotations,
  setContextMenu,
  isDrawingRoute,
  setNewRoutePoints,
  routeSegments
}: any) => {
  const map = useMap();
  useMapEvents({
    click(e) {
      setContextMenu(null);
      if (annotateMode) {
        const text = window.prompt("Enter Annotation Label:");
        if (text) {
          setAnnotations((prev: any[]) => [
            ...prev,
            {
              id: Date.now().toString(),
              lat: e.latlng.lat,
              lng: e.latlng.lng,
              text,
            },
          ]);
          toast.success("Tactical Annotation Deployed.");
        }
      } else if (isDrawingRoute) {
        let snappedPos = [e.latlng.lat, e.latlng.lng];
        let minDistance = Infinity;
        
        routeSegments.forEach((route) => {
            route.positions.forEach((pos) => {
                const pt = {lat: pos[0], lng: pos[1]};
                const dist = map.distance(e.latlng, pt);
                if (dist < 150 && dist < minDistance) {
                    minDistance = dist;
                    snappedPos = [pos[0], pos[1]];
                }
            });
        });
        
        setNewRoutePoints((prev) => [...prev, snappedPos]);
      }
    },
  });
  return null;
};`;

code = code.replace(oldMapInteractions, newMapInteractions);


// 3. Add state variables inside AuraDriveMap
const stateStr = `
  const [isDrawingRoute, setIsDrawingRoute] = useState(false);
  const [newRoutePoints, setNewRoutePoints] = useState<[number, number][]>([]);

  // Bottleneck calculations
  const bottlenecks = React.useMemo(() => {
    const highTrafficRoutes = routeSegments.filter((r: any) => r.traffic === "high");
    const pointMap: { [key: string]: string[] } = {};
    
    highTrafficRoutes.forEach((r: any) => {
      r.positions.forEach((pos: any) => {
        const key = \`\${pos[0].toFixed(4)},\${pos[1].toFixed(4)}\`;
        if (!pointMap[key]) pointMap[key] = [];
        if (!pointMap[key].includes(r.id)) pointMap[key].push(r.id);
      });
    });

    const intersections: [number, number][] = [];
    Object.keys(pointMap).forEach((key) => {
      if (pointMap[key].length > 1) {
        const [lat, lng] = key.split(',').map(Number);
        intersections.push([lat, lng]);
      }
    });

    if (intersections.length === 0 && highTrafficRoutes.length > 0) {
        highTrafficRoutes.forEach((r: any) => {
            if(r.positions.length > 2) {
                intersections.push(r.positions[Math.floor(r.positions.length / 2)] as [number, number]);
            }
        });
    }
    return intersections;
  }, [routeSegments]);
`;
code = code.replace(/const \[hoveredRouteId, setHoveredRouteId\] = useState<string \| null>\(null\);/g, `const [hoveredRouteId, setHoveredRouteId] = useState<string | null>(null);${stateStr}`);


// 4. Render bottlenecks and new route points in MapContainer
const mapRenderStr = `
        <MapInteractions
          annotateMode={annotateMode}
          setAnnotations={setAnnotations}
          setContextMenu={setContextMenu}
          isDrawingRoute={isDrawingRoute}
          setNewRoutePoints={setNewRoutePoints}
          routeSegments={routeSegments}
        />
        {bottlenecks.map((pos, idx) => (
          <Marker key={\`bottleneck-\${idx}\`} position={pos} icon={bottleneckIcon}>
            <Tooltip direction="top" className="custom-leaflet-tooltip bg-slate-900 border border-slate-700 text-white rounded">
              <div className="flex items-center gap-1 font-bold text-rose-500">
                <AlertTriangle className="w-3 h-3" /> Critical Bottleneck (Traffic > 80%)
              </div>
            </Tooltip>
          </Marker>
        ))}
        {newRoutePoints.length > 0 && (
          <Polyline
            positions={newRoutePoints}
            pathOptions={{ color: '#10b981', weight: 4, dashArray: '5, 10' }}
          />
        )}
        {newRoutePoints.map((pos, i) => (
          <CircleMarker
            key={\`new-pt-\${i}\`}
            center={pos}
            radius={4}
            pathOptions={{ color: '#10b981', fillColor: '#059669', fillOpacity: 1 }}
          />
        ))}
`;
code = code.replace(/<MapInteractions[\s\S]*?\/>/g, mapRenderStr);

// 5. Add UI controls
// We want to add drawing controls. Where? Maybe in the top-right search interface right next to Polygon Draw.
const drawBtn = `
              <button
                onClick={() => {
                  setIsDrawingRoute(!isDrawingRoute);
                  if (isDrawingRoute) setNewRoutePoints([]);
                }}
                className={\`p-1.5 rounded transition-colors mr-1 \${isDrawingRoute ? "bg-emerald-500/20 text-emerald-400" : "text-slate-400 hover:text-slate-200"}\`}
                title="Draw Custom Route Segment (Auto-Snaps to Network)"
              >
                <Navigation className="w-4 h-4" />
              </button>
`;
code = code.replace(/<button[\s\S]*?onClick=\{\(\) => setPolygonSelectionMode\(!polygonSelectionMode\)\}[\s\S]*?<\/button>/, drawBtn + `\n              <button
                onClick={() => setPolygonSelectionMode(!polygonSelectionMode)}
                className={\`p-1.5 rounded transition-colors mr-1 \${polygonSelectionMode ? "bg-fuchsia-500/20 text-fuchsia-400" : "text-slate-400 hover:text-slate-200"}\`}
                title="Draw Polygon Selection"
              >
                <PenTool className="w-4 h-4" />
              </button>`);

// Also we need a popup to "Finish Route" when drawing.
const finishDrawUI = `
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
            onClick={() => {
              if (newRoutePoints.length > 1) {
                const newSegment = {
                  id: \`R-CUSTOM-\${Date.now().toString().slice(-4)}\`,
                  name: "User Defined Transit Path",
                  positions: newRoutePoints,
                  category: "standard",
                  transportMode: "car",
                  traffic: "low",
                  speed: "60km/h",
                  eta: "15 mins",
                  distance: "Custom",
                  numericDistance: 5.0,
                  color: "#10b981",
                  nodes: newRoutePoints.map((p,i) => ({ time: "T00", vel: "60km/h" }))
                };
                setRouteSegments(prev => [...prev, newSegment]);
                toast.success("Custom Route Committed to Global Registry.");
              }
              setIsDrawingRoute(false);
              setNewRoutePoints([]);
            }}
          >
            Commit Segment
          </Button>
          <Button 
            size="sm"
            variant="ghost"
            className="text-slate-400 hover:text-rose-400 h-7 text-[10px] uppercase font-black"
            onClick={() => {
              setIsDrawingRoute(false);
              setNewRoutePoints([]);
            }}
          >
            Cancel
          </Button>
        </div>
      )}
`;

code = code.replace(/\{polygonSelectionMode && \(/, finishDrawUI + '\n      {polygonSelectionMode && (');


// 6. Layer-filtering control in search panel. We already have Categories, let's move it out of 'showControls' and put it directly in the top-right panel.
const extractCategoriesStr = code.match(/<div className="flex flex-col gap-1\.5">\s*<span className="text-\[9px\] font-black uppercase text-slate-500 tracking-wider">\s*Categories\s*<\/span>\s*<div className="flex gap-2">[\s\S]*?<\/div>\s*<\/div>/);
if (extractCategoriesStr) {
    code = code.replace(extractCategoriesStr[0], ''); // remove from old place
    // Add to top of the search bar
    const inlineCategories = extractCategoriesStr[0].replace('flex-col gap-1.5', 'flex-col gap-1.5 mb-2 border-b border-slate-700/50 pb-2');
    
    code = code.replace(/<div className="flex items-center gap-2 w-full">/, inlineCategories + '\n            <div className="flex items-center gap-2 w-full">');
}

fs.writeFileSync('src/components/bank/AuraDriveMap.tsx', code);
