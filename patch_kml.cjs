const fs = require('fs');
let code = fs.readFileSync('src/components/bank/AuraDriveMap.tsx', 'utf8');

const exportKMLLogic = `const handleExportKML = (route: any, quality: 'simplified' | 'high' = 'high') => {
    let positionsToExport = route.positions;
    if (quality === 'simplified') {
        // Keep every 3rd point for simplification
        positionsToExport = route.positions.filter((_, i) => i % 3 === 0);
    }
    
    const kmlContent = \`<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>\${route.name}</name>
    <description>Quality: \${quality}</description>
    <Placemark>
      <name>\${route.id}</name>
      <LineString>
        <coordinates>
          \${positionsToExport.map((p: any[]) => \`\${p[1]},\${p[0]},0\`).join(' ')}
        </coordinates>
      </LineString>
    </Placemark>
  </Document>
</kml>\`;

    const blob = new Blob([kmlContent], { type: "application/vnd.google-earth.kml+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = \`\${route.id}-\${quality}.kml\`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(\`Exported \${route.id} KML (\${quality} precision)\`);
  };`;

code = code.replace(/const handleExportKML = \(\w+: any\) => \{[\s\S]*?<\/kml>\`\;/, exportKMLLogic);

fs.writeFileSync('src/components/bank/AuraDriveMap.tsx', code);
