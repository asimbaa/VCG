const fs = require('fs');
let code = fs.readFileSync('src/components/bank/AuraDriveMap.tsx', 'utf8');

// 1. Add Plus, Minus, Download to lucide imports
code = code.replace(/AlertTriangle,\n} from "lucide-react";/g, 'AlertTriangle,\n  Plus,\n  Minus,\n  Download\n} from "lucide-react";');

// 2. Add handleExportSelectedToKML function before return
const exportFn = `
  const handleExportSelectedToKML = () => {
    const selectedRoutes = routeSegments.filter(r => selectedRouteIds.includes(r.id));
    if (selectedRoutes.length === 0) return;

    let kmlContent = \`<?xml version="1.0" encoding="UTF-8"?>\\n<kml xmlns="http://www.opengis.net/kml/2.2">\\n<Document>\\n\`;
    
    selectedRoutes.forEach(route => {
      kmlContent += \`  <Placemark>\\n    <name>\${route.name}</name>\\n    <LineString>\\n      <coordinates>\\n\`;
      route.positions.forEach(pos => {
        kmlContent += \`        \${pos[1]},\${pos[0]},0\\n\`;
      });
      kmlContent += \`      </coordinates>\\n    </LineString>\\n  </Placemark>\\n\`;
    });
    
    kmlContent += \`</Document>\\n</kml>\`;

    const blob = new Blob([kmlContent], { type: "application/vnd.google-earth.kml+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = \`valourian_routes_\${new Date().getTime()}.kml\`;
    a.click();
    URL.revokeObjectURL(url);
  };
`;

code = code.replace(/  return \(\n    <div className="relative/g, exportFn + '\n  return (\n    <div className="relative');

// 3. Update MapContainer to zoomControl={false}
code = code.replace(/<MapContainer/g, '<MapContainer zoomControl={false}');

// 4. Custom Zoom Control Component (can be placed inside the Map UI Overlays div)
// We need useMap, which we already import. But hooks inside a component must be inside a child component of MapContainer.
// So we create a small inline component for the ZoomControl.
const customZoomControlCode = `
const CustomZoomControlOverlay = () => {
  const map = useMap();
  return (
    <div className="absolute top-1/2 -translate-y-1/2 right-4 z-[400] pointer-events-auto flex flex-col gap-2">
      <button onClick={(e) => { e.stopPropagation(); map.zoomIn(); }} className="bg-slate-900/80 backdrop-blur-md border border-slate-700 text-slate-300 p-2 rounded-xl shadow-lg hover:bg-slate-800 transition-colors group" title="Zoom In">
        <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
      </button>
      <button onClick={(e) => { e.stopPropagation(); map.zoomOut(); }} className="bg-slate-900/80 backdrop-blur-md border border-slate-700 text-slate-300 p-2 rounded-xl shadow-lg hover:bg-slate-800 transition-colors group" title="Zoom Out">
        <Minus className="w-4 h-4 group-hover:scale-110 transition-transform" />
      </button>
    </div>
  );
};
`;

// Insert the CustomZoomControlOverlay component outside of AuraDriveMap, right before it.
code = code.replace(/export function AuraDriveMap/g, customZoomControlCode + '\nexport function AuraDriveMap');

// 5. Add CustomZoomControlOverlay inside MapContainer
code = code.replace(/<\/MapContainer>/g, '  <CustomZoomControlOverlay />\n      </MapContainer>');

// 6. Add "Export Selected to KML" button inside Route Metadata Panel
const exportBtnHTML = `
            <button
              onClick={handleExportSelectedToKML}
              className="w-full bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 rounded py-1 mb-2 text-[9px] uppercase font-bold flex items-center justify-center gap-1 transition-colors"
            >
              <Download className="w-3 h-3" /> Export Selected to KML
            </button>
`;
code = code.replace(/<Merge className="w-3 h-3" \/> Merge Selected Routes\n            <\/button>/g, '<Merge className="w-3 h-3" /> Merge Selected Routes\n            </button>\n' + exportBtnHTML);

// 7. Add Status Label for active polylines inside Map UI Overlays
// Wait, we need to know the number of active polylines.
// We can compute this right inside AuraDriveMap
const activePolylinesCode = `
  const activePolylinesCount = routeSegments.filter(checkIsVisible).length;
`;
code = code.replace(/  const getRouteColor =/g, activePolylinesCode + '\n  const getRouteColor =');

const activePolylinesLabelHTML = `
      {/* Active Segments Label */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[400] pointer-events-none">
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700 px-4 py-1.5 rounded-full shadow-lg flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
            Active Segments: <span className="text-white font-black">{activePolylinesCount}</span>
          </span>
        </div>
      </div>
`;
code = code.replace(/{ \/\* Map UI Overlays \*\/ }/g, '{ /* Map UI Overlays */ }\n' + activePolylinesLabelHTML);

fs.writeFileSync('src/components/bank/AuraDriveMap.tsx', code);
