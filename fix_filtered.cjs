const fs = require('fs');

let content = fs.readFileSync('src/components/bank/AuraDriveMap.tsx', 'utf8');

const regex = /const filteredRoutes = routeSegments\.filter\(route =>[\s\S]*?route\.id\.toLowerCase\(\)\.includes\(searchQuery\.toLowerCase\(\)\)\s*\);/;

const replacement = `const filteredRoutes = routeSegments.filter(route => 
     (searchQuery === "" || 
      route.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      route.id.toLowerCase().includes(searchQuery.toLowerCase())) &&
     (categories as any)[(route as any).category]
  );
  
  const aggregateDistance = selectedRouteIds.reduce((acc, id) => {
     const r = routeSegments.find(rs => rs.id === id);
     return acc + (r ? (r as any).numericDistance : 0);
  }, 0).toFixed(1);`;

content = content.replace(regex, replacement);

fs.writeFileSync('src/components/bank/AuraDriveMap.tsx', content);
