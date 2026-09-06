const fs = require('fs');
let content = fs.readFileSync('src/components/bank/AuraDriveMap.tsx', 'utf8');

if (!content.includes('CircleMarker')) {
    // wait, the error said Cannot find name 'CircleMarker', so it's not imported.
}
content = content.replace('import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap, ZoomControl }', 'import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap, ZoomControl, CircleMarker }');

fs.writeFileSync('src/components/bank/AuraDriveMap.tsx', content);
