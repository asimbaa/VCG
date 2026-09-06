const fs = require('fs');
let content = fs.readFileSync('src/components/bank/AuraDriveMap.tsx', 'utf8');

const markerImport = `import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap, ZoomControl, CircleMarker } from "react-leaflet";`;
content = content.replace(/import \{ MapContainer, TileLayer, Polyline, Marker, Popup, useMap, ZoomControl \} from "react-leaflet";/, markerImport);

const replacement = `
             <Polyline
             key={route.id}
             positions={route.positions as [number, number][]}
             pathOptions={{
                color: selectedRouteIds.includes(route.id) ? "#f59e0b" : getRouteColor(route), 
                weight: getRouteWeight(route),
                opacity: isVisible ? getRouteOpacity(route) : 0,
                className: \`transition-all ease-in-out duration-[var(--anim-speed)] transform-gpu hover:scale-105 \${torrensSync ? 'animate-[dash_2s_linear_infinite] [stroke-dasharray:10_20]' : ''} \${(hoveredRouteId === route.id || selectedRouteIds.includes(route.id)) ? "animate-pulse stroke-[6px]" : ""} \${isVisible ? '' : 'pointer-events-none'}\`
             }}
             eventHandlers={{
`;
content = content.replace(/<Polyline\s*key=\{route\.id\}\s*positions=\{route\.positions as \[number, number\]\[\]\}\s*pathOptions=\{\{[\s\S]*?className: \`transition-all ease-in-out duration-\[var\(--anim-speed\)\] transform-gpu[\s\S]*?\}\}\s*eventHandlers=\{\{/, replacement);

const circleMarkers = `{route.traffic === 'high' && trafficView && isVisible && (
                <CircleMarker center={route.positions[Math.floor(route.positions.length / 2)] as [number, number]} radius={6} pathOptions={{color: 'transparent', fillColor: '#ef4444', fillOpacity: 0.9, className: 'animate-ping pointer-events-none'}} />
             )}
             {route.traffic === 'high' && trafficView && isVisible && (
                <CircleMarker center={route.positions[Math.floor(route.positions.length / 2)] as [number, number]} radius={4} pathOptions={{color: '#fff', weight: 1, fillColor: '#ef4444', fillOpacity: 1, className: 'pointer-events-none'}} />
             )}`;

content = content.replace(/<\/Polyline>/g, `</Polyline>\n             ${circleMarkers}`);

fs.writeFileSync('src/components/bank/AuraDriveMap.tsx', content);
