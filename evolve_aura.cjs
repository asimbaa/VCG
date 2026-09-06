const fs = require('fs');
let content = fs.readFileSync('src/components/bank/AuraDriveMap.tsx', 'utf8');

// 1. Ensure Fragment is imported from React
content = content.replace(
  /import React, \{ useState, useEffect, useRef \} from 'react';/,
  "import React, { useState, useEffect, useRef, Fragment } from 'react';"
);

// 2. Ensure useMapEvents is imported
content = content.replace(
  /useMap \} from 'react-leaflet';/,
  "useMap, useMapEvents } from 'react-leaflet';"
);

// 3. Ensure new Lucide icons are imported
content = content.replace(
  /import \{ Search,/,
  "import { Search, MapPin, Edit3, "
);

// 4. Inject new states
const stateInject = `
  const [contextMenu, setContextMenu] = useState<{x: number, y: number, route: any} | null>(null);
  const [annotateMode, setAnnotateMode] = useState(false);
  const [annotations, setAnnotations] = useState<{id: string, lat: number, lng: number, text: string}[]>([]);
  const [pathEditModeFor, setPathEditModeFor] = useState<string | null>(null);
`;
content = content.replace(/const \[mapLayer, setMapLayer\] = useState/, stateInject + '\n  const [mapLayer, setMapLayer] = useState');

// 5. Inject MapInteractions component
const mapInteractionsComp = `
const MapInteractions = ({ annotateMode, setAnnotations, setContextMenu }: any) => {
   useMapEvents({
      click(e) {
         setContextMenu(null);
         if (annotateMode) {
            const text = window.prompt("Enter Annotation Label:");
            if (text) {
               setAnnotations((prev: any[]) => [...prev, { id: Date.now().toString(), lat: e.latlng.lat, lng: e.latlng.lng, text }]);
               toast.success("Tactical Annotation Deployed.");
            }
         }
      }
   });
   return null;
};
`;
content = content.replace(/const AutoFitBounds =/, mapInteractionsComp + '\nconst AutoFitBounds =');


// 6. Update Filter Logic for smooth transitions
const filterLogic = `
  const checkIsVisible = (route: any) => {
     return (searchQuery === "" || 
      route.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      route.id.toLowerCase().includes(searchQuery.toLowerCase())) &&
     (categories as any)[(route as any).category] &&
     (transportModes as any)[(route as any).transportMode];
  };
  
  const filteredRoutes = routeSegments.filter(checkIsVisible);
`;
content = content.replace(/const filteredRoutes = routeSegments\.filter\([\s\S]*?\);/, filterLogic);


// 7. Re-architect Polyline rendering for transitions, dragging, and context menu
const oldPolylines = /\{filteredRoutes\.map\(\(route\) => \([\s\S]*?<\/Polyline>\s*\)\)\}/;
const newPolylines = `
        <MapInteractions annotateMode={annotateMode} setAnnotations={setAnnotations} setContextMenu={setContextMenu} />
        {routeSegments.map((route) => {
          const isVisible = checkIsVisible(route);
          return (
          <Fragment key={route.id}>
          <Polyline 
             positions={route.positions as [number, number][]}
             pathOptions={{
                color: selectedRouteIds.includes(route.id) ? "#f59e0b" : getRouteColor(route), 
                weight: getRouteWeight(route),
                opacity: isVisible ? getRouteOpacity(route) : 0,
                className: \`transition-all ease-in-out duration-[var(--anim-speed)] transform-gpu \${torrensSync ? 'animate-[dash_2s_linear_infinite] [stroke-dasharray:10_20]' : ''} \${(hoveredRouteId === route.id || selectedRouteIds.includes(route.id)) ? "animate-pulse" : ""} \${isVisible ? '' : 'pointer-events-none'}\`
             }}
             eventHandlers={{
              mouseover: () => { if(isVisible) setHoveredRouteId(route.id); },
              mouseout: () => setHoveredRouteId(null),
              click: () => {
                 if (!isVisible) return;
                 if (selectionMode) {
                     setSelectedRouteIds(prev => 
                         prev.includes(route.id) ? prev.filter(id => id !== route.id) : [...prev, route.id]
                     );
                 }
              },
              contextmenu: (e) => {
                 if (!isVisible) return;
                 e.originalEvent.preventDefault();
                 setContextMenu({ x: (e.originalEvent as MouseEvent).pageX, y: (e.originalEvent as MouseEvent).pageY, route });
              }
            }}
          >
            {(showLabels || hoveredRouteId === route.id) && isVisible && (
              <Tooltip permanent={showLabels} direction="top" className="bg-slate-900 text-white border-slate-700 font-mono text-[10px] p-2 leading-tight">
                 <div className="font-bold text-amber-400 mb-1">{route.name}</div>
                 <div>Dist: {route.distance}</div>
                 <div className="mt-1 pt-1 border-t border-slate-700">
                    <div className="text-slate-400 text-[8px] uppercase">Node Telemetry (End)</div>
                    <div>T: {route.nodes[route.nodes.length - 1].time}</div>
                    <div>V: {route.nodes[route.nodes.length - 1].vel}</div>
                 </div>
              </Tooltip>
            )}
            {isVisible && (
              <Popup>
                <div className="p-2">
                  <h4 className="font-black text-slate-800 mb-1">{route.name}</h4>
                  <p className="text-xs text-slate-500">ID: {route.id}</p>
                </div>
              </Popup>
            )}
          </Polyline>
          
          {isVisible && pathEditModeFor === route.id && route.positions.map((pos: number[], idx: number) => (
             <Marker 
                key={\`edit-\${route.id}-\${idx}\`}
                position={[pos[0], pos[1]]}
                draggable={true}
                eventHandlers={{
                   dragend: (e) => {
                      const newPos = e.target.getLatLng();
                      setRouteSegments((prev: any[]) => prev.map(r => {
                         if (r.id === route.id) {
                            const newPositions = [...r.positions];
                            newPositions[idx] = [newPos.lat, newPos.lng];
                            return { ...r, positions: newPositions };
                         }
                         return r;
                      }));
                   }
                }}
             >
                <Tooltip direction="top">Drag to modify Node {idx}</Tooltip>
             </Marker>
          ))}
          </Fragment>
        )})}
        
        {annotations.map((ann) => (
           <Marker key={ann.id} position={[ann.lat, ann.lng]}>
              <Tooltip permanent direction="bottom" className="bg-emerald-900/90 backdrop-blur text-white border-emerald-700 font-bold text-xs shadow-xl">
                 {ann.text}
              </Tooltip>
           </Marker>
        ))}
`;
content = content.replace(oldPolylines, newPolylines);

// 8. Inject Context Menu Overlay globally
const contextMenuInject = `
      {contextMenu && (
       <div className="fixed z-[99999] bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-xl shadow-2xl py-1 w-56 overflow-hidden animate-in fade-in zoom-in-95" style={{ top: contextMenu.y, left: contextMenu.x }}>
           <div className="px-3 py-2 border-b border-slate-800/50 text-[10px] font-black uppercase text-slate-400 tracking-wider flex justify-between items-center bg-slate-950/50">
              {contextMenu.route.id}
              <button onClick={() => setContextMenu(null)} className="p-1 hover:bg-slate-800 rounded"><X className="w-3 h-3 hover:text-white" /></button>
           </div>
           <button onClick={() => { setSearchQuery(contextMenu.route.id); setContextMenu(null); }} className="w-full text-left px-3 py-2.5 text-[11px] font-medium text-slate-200 hover:bg-indigo-600/20 hover:text-indigo-300 transition-colors flex items-center justify-between">Center & Isolate <Search className="w-3 h-3"/></button>
           <button onClick={() => { handleExportKML(contextMenu.route); setContextMenu(null); }} className="w-full text-left px-3 py-2.5 text-[11px] font-medium text-slate-200 hover:bg-emerald-600/20 hover:text-emerald-300 transition-colors flex items-center justify-between">Export Metadata <Download className="w-3 h-3"/></button>
           <button onClick={() => { setPathEditModeFor(contextMenu.route.id); setContextMenu(null); }} className="w-full text-left px-3 py-2.5 text-[11px] font-medium text-amber-400 hover:bg-amber-500/20 transition-colors flex justify-between items-center border-t border-slate-800/50">Modify Path Nodes <Edit3 className="w-3 h-3" /></button>
           <button onClick={() => { handleArchiveRoute(contextMenu.route); setContextMenu(null); }} className="w-full text-left px-3 py-2.5 text-[11px] font-medium text-rose-500 hover:bg-rose-500/20 transition-colors flex justify-between items-center border-t border-slate-800/50">Delete Segment <Trash2 className="w-3 h-3" /></button>
       </div>
      )}
`;
content = content.replace(/(<div className="w-full h-full relative" id="aura-drive-map-container"[\s\S]*?>)/, '$1\n' + contextMenuInject);

// 9. Add Annotation Toggle Button
const annotateBtn = `
                <button onClick={() => { setAnnotateMode(!annotateMode); toast.success(annotateMode ? "Annotation Matrix Offline" : "Annotation Matrix Online. Click map to deploy pins.", { icon: "📍" }); }} className={\`flex-1 rounded-xl p-1.5 flex justify-center items-center gap-1 transition-colors text-[9px] font-black uppercase tracking-wider \${annotateMode ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(5,150,105,0.4)]' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}\`} title="Annotate Map">
                   <MapPin className="w-3 h-3" /> Pin
                </button>
`;
content = content.replace(/(<button onClick=\{handleSnapshot\})/, annotateBtn + '\n                $1');

fs.writeFileSync('src/components/bank/AuraDriveMap.tsx', content);
