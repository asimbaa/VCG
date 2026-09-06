const fs = require('fs');

let content = fs.readFileSync('src/components/bank/AuraDriveMap.tsx', 'utf8');

// Update routeSegments with distance and eta
const newRouteSegments = `
  const [hoveredRouteId, setHoveredRouteId] = useState<string | null>(null);

  const routeSegments = [
    { id: "R-101", name: "Route Segment - Harbour", positions: [[-33.8650, 151.2050], [-33.8600, 151.2100], [-33.8550, 151.2150]], color: "#06C167", distance: "4.2 km", eta: "14 mins" },
    { id: "R-102", name: "Route Segment - CBD Core", positions: [[-33.8750, 151.2150], [-33.8700, 151.2100], [-33.8650, 151.2000]], color: "#3b82f6", distance: "1.8 km", eta: "8 mins" },
    { id: "R-103", name: "Route Segment - Eastern Suburbs", positions: [[-33.8800, 151.2200], [-33.8850, 151.2250], [-33.8900, 151.2300]], color: "#8b5cf6", distance: "6.5 km", eta: "22 mins" }
  ];
`;

content = content.replace(/const routeSegments = \[\s*\{ id: "R-101"[\s\S]*?\];/, newRouteSegments);

// Add export and edit functions
const newFunctions = `
  const handleExportKML = (route: any) => {
    const kmlContent = \`<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>\${route.name}</name>
    <Placemark>
      <name>\${route.id}</name>
      <LineString>
        <coordinates>
          \${route.positions.map((p: any[]) => \`\${p[1]},\${p[0]},0\`).join(' ')}
        </coordinates>
      </LineString>
    </Placemark>
  </Document>
</kml>\`;

    const blob = new Blob([kmlContent], { type: 'application/vnd.google-earth.kml+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = \`\${route.id}-segment.kml\`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(\`Exported \${route.id} to KML\`);
  };

  const handleEditRoute = (route: any) => {
    toast.info(\`Edit mode activated for \${route.id}. Drag points to adjust.\`);
  };
`;

content = content.replace(/const filteredRoutes =/, newFunctions + '\n  const filteredRoutes =');

// Update Polyline rendering for hover interaction
const newPolyline = `
        {/* Render filtered routes */}
        {filteredRoutes.map((route) => (
          <Polyline 
            key={route.id} 
            positions={route.positions as [number, number][]} 
            pathOptions={{ 
               color: route.color, 
               weight: hoveredRouteId === route.id ? 8 : (searchQuery && (route.name.toLowerCase().includes(searchQuery.toLowerCase()) || route.id.toLowerCase().includes(searchQuery.toLowerCase())) ? 6 : 4),
               opacity: hoveredRouteId === route.id ? 1 : (searchQuery && (route.name.toLowerCase().includes(searchQuery.toLowerCase()) || route.id.toLowerCase().includes(searchQuery.toLowerCase())) ? 1 : 0.6),
               className: hoveredRouteId === route.id ? 'animate-pulse' : ''
            }} 
            eventHandlers={{
              mouseover: () => setHoveredRouteId(route.id),
              mouseout: () => setHoveredRouteId(null)
            }}
          >
`;

content = content.replace(/\{\/\* Render filtered routes \*\/\}[\s\S]*?<Popup>/, newPolyline + '            <Popup>');

// Add Summary Box in UI
const newUI = `
        {/* Fixed Top-Right Search Interface */}
        <div className="w-64 md:w-80 pointer-events-auto space-y-2">
          <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700 p-2 rounded-2xl shadow-2xl flex items-center gap-2">
             <Search className="w-4 h-4 text-slate-400 ml-2" />
             <input 
               type="text"
               placeholder="Search routes or IDs..."
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="bg-transparent border-none outline-none text-xs text-white placeholder-slate-500 w-full font-medium py-1"
             />
          </div>

          {searchQuery && filteredRoutes.length === 1 && (
            <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700 p-4 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-top-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h5 className="text-white font-bold text-sm">{filteredRoutes[0].name}</h5>
                  <p className="text-slate-400 text-[10px] font-mono">{filteredRoutes[0].id}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleEditRoute(filteredRoutes[0])} className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors" title="Edit Route Segment">
                    <PenTool className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleExportKML(filteredRoutes[0])} className="p-1.5 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 border border-indigo-500/30 rounded-lg transition-colors" title="Export as KML">
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-3">
                <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                  <div className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Distance</div>
                  <div className="text-white font-mono text-xs">{filteredRoutes[0].distance}</div>
                </div>
                <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                  <div className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Est. Travel</div>
                  <div className="text-white font-mono text-xs">{filteredRoutes[0].eta}</div>
                </div>
              </div>
            </div>
          )}
        </div>
`;

content = content.replace(/\{\/\* Fixed Top-Right Search Interface \*\/\}[\s\S]*?<\/div>\s*<\/div>/, newUI);

if (!content.includes('PenTool')) {
    content = content.replace(/import { Search,/, "import { Search, Download, PenTool,");
}

fs.writeFileSync('src/components/bank/AuraDriveMap.tsx', content);
