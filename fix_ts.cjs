const fs = require('fs');
let content = fs.readFileSync('src/components/bank/AuraDriveMap.tsx', 'utf8');

content = content.replace(
  'const [routeSegments, setRouteSegments] = useState([',
  'const [routeSegments, setRouteSegments] = useState<any[]>(['
);

fs.writeFileSync('src/components/bank/AuraDriveMap.tsx', content);
