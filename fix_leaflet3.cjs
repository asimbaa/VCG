const fs = require('fs');
let content = fs.readFileSync('src/components/bank/AuraDriveMap.tsx', 'utf8');

content = content.replace(
  "import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip, useMap, useMapEvents } from 'react-leaflet';",
  "import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip, useMap, useMapEvents, CircleMarker } from 'react-leaflet';"
);

fs.writeFileSync('src/components/bank/AuraDriveMap.tsx', content);
