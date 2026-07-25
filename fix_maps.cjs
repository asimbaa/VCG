const fs = require('fs');

function fixAuraDrive() {
  let code = fs.readFileSync('src/components/bank/AuraDriveMap.tsx', 'utf-8');
  
  // Fix Route.computeRoutes to DirectionsService
  code = code.replace(
    /routesLib\.Route\.computeRoutes\(\{\s*origin,\s*destination,\s*travelMode: 'DRIVING' as any,\s*fields: \['path', 'viewport'\],\s*\}\)\.then\(\(\{ routes \}\) => \{/g,
    `const directionsService = new routesLib.DirectionsService();
    directionsService.route({
      origin,
      destination,
      travelMode: 'DRIVING' as any,
    }).then(({ routes }) => {`
  );
  
  // Fix routes[0].createPolylines()
  code = code.replace(
    /const newPolylines = routes\[0\]\.createPolylines\(\);\s*newPolylines\.forEach\(p => \{/g,
    `const newPolylines = [new google.maps.Polyline({
          path: routes[0].overview_path,
        })];
        newPolylines.forEach(p => {`
  );
  
  // Remove internalUsageAttributionIds
  code = code.replace(/internalUsageAttributionIds=\{[^}]+\}/g, '');
  
  // Replace glyphText with undefined or remove it if not needed, actually just remove glyphText completely for Pin
  code = code.replace(/glyphText="[^"]*"/g, '');
  
  fs.writeFileSync('src/components/bank/AuraDriveMap.tsx', code);
}

function fixLogisticsMap() {
  let code = fs.readFileSync('src/components/bank/LogisticsMap.tsx', 'utf-8');
  code = code.replace(/internalUsageAttributionIds=\{[^}]+\}/g, '');
  fs.writeFileSync('src/components/bank/LogisticsMap.tsx', code);
}

fixAuraDrive();
fixLogisticsMap();
