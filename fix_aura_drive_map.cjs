const fs = require('fs');
let code = fs.readFileSync('src/components/bank/AuraDriveMap.tsx', 'utf8');

// Remove the wrongly placed activePolylinesCount at getRouteColor
code = code.replace(/  const activePolylinesCount = routeSegments.filter\(checkIsVisible\)\.length;\n  const getRouteColor =/g, '  const getRouteColor =');

// Add activePolylinesCount after filteredRoutes
code = code.replace(/  const filteredRoutes = routeSegments\.filter\(checkIsVisible\);/g, '  const filteredRoutes = routeSegments.filter(checkIsVisible);\n  const activePolylinesCount = filteredRoutes.length;');

// Find handleExportSelectedToKML and ensure it's in the right place.
// Let's first check if handleExportSelectedToKML exists, if so remove it (it might be misplaced)
const kmlFuncPattern = /  const handleExportSelectedToKML = \(\) => {[\s\S]*?URL\.revokeObjectURL\(url\);\n  };\n/g;
code = code.replace(kmlFuncPattern, '');

const exportFn = `
  const handleExportSelectedToKML = () => {
    const selectedRoutes = routeSegments.filter(r => selectedRouteIds.includes(r.id));
    if (selectedRoutes.length === 0) return;

    let kmlContent = \`<?xml version="1.0" encoding="UTF-8"?>\\n<kml xmlns="http://www.opengis.net/kml/2.2">\\n<Document>\\n\`;
    
    selectedRoutes.forEach(route => {
      kmlContent += \`  <Placemark>\\n    <name>\${route.name}</name>\\n    <LineString>\\n      <coordinates>\\n\`;
      route.positions.forEach(pos => {
        kmlContent += \`        \${pos[1]},\${pos[0]},0\\n\`;
      });
      kmlContent += \`      </coordinates>\\n    </LineString>\\n  </Placemark>\\n\`;
    });
    
    kmlContent += \`</Document>\\n</kml>\`;

    const blob = new Blob([kmlContent], { type: "application/vnd.google-earth.kml+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = \`valourian_routes_\${new Date().getTime()}.kml\`;
    a.click();
    URL.revokeObjectURL(url);
  };
`;

code = code.replace(/  return \(\n    <div\n      className="w-full h-full relative"/g, exportFn + '\n  return (\n    <div\n      className="w-full h-full relative"');


// Remove duplicate Download from lucide-react if any.
// The easiest way is to re-parse the import.
code = code.replace(/Download,\n  Plus,\n  Minus,\n  Download\n} from "lucide-react";/g, 'Plus,\n  Minus,\n  Download\n} from "lucide-react";');
code = code.replace(/Download,\n  AlertTriangle,\n  Plus,\n  Minus,\n  Download\n} from "lucide-react";/g, 'AlertTriangle,\n  Plus,\n  Minus,\n  Download\n} from "lucide-react";');


fs.writeFileSync('src/components/bank/AuraDriveMap.tsx', code);
