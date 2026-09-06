const fs = require('fs');
let code = fs.readFileSync('src/components/bank/AuraDriveMap.tsx', 'utf8');

const targetColor = `  const getRouteColor = (route: any) => {
    if (highContrast) return "#FFFFFF";
    if (trafficView) {
      if (route.traffic === "low") return "#22c55e";
      if (route.traffic === "medium") return "#eab308";
      if (route.traffic === "high") return "#ef4444";
    }
    return route.color;
  };`;

const replacementColor = `  const getRouteColor = (route: any) => {
    if (hoveredRouteId === route.id) return "#fbbf24";
    if (highContrast) return "#FFFFFF";
    if (trafficView) {
      if (route.traffic === "low") return "#22c55e";
      if (route.traffic === "medium") return "#eab308";
      if (route.traffic === "high") return "#ef4444";
    }
    return route.color;
  };`;
code = code.replace(targetColor, replacementColor);

fs.writeFileSync('src/components/bank/AuraDriveMap.tsx', code);
