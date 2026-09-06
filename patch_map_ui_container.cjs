const fs = require('fs');
let code = fs.readFileSync('src/components/bank/AuraDriveMap.tsx', 'utf8');

code = code.replace(
  "{mapLayer === 'satellite' && (",
  "<PolygonSelectionTool polygonSelectionMode={polygonSelectionMode} onComplete={handlePolygonComplete} />\n        {mapLayer === 'satellite' && ("
);

// Add Replay Marker logic
const replayMarker = `
            {replayingRouteId === route.id && (
               <Marker 
                  position={route.positions[Math.min(replayProgress, route.positions.length - 1)] as [number, number]} 
                  icon={transportIcon} 
               />
            )}
`;
code = code.replace(
  "{(showLabels || hoveredRouteId === route.id) && isVisible && (",
  replayMarker + "\n            {(showLabels || hoveredRouteId === route.id) && isVisible && ("
);

fs.writeFileSync('src/components/bank/AuraDriveMap.tsx', code);
