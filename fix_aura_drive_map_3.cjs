const fs = require('fs');
let code = fs.readFileSync('src/components/bank/AuraDriveMap.tsx', 'utf8');

code = code.replace(/  const activePolylinesCount = routeSegments\.filter\(checkIsVisible\)\.length;\s+const getRouteColor =/g, '  const getRouteColor =');

fs.writeFileSync('src/components/bank/AuraDriveMap.tsx', code);
