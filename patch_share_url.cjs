const fs = require('fs');
let code = fs.readFileSync('src/components/bank/AuraDriveMap.tsx', 'utf8');

// I saw the issue around line 387. A duplicate handleExportKML code block. 
code = code.replace(/    const blob = new Blob\(\[kmlContent\], \{ type: 'application\/vnd\.google-earth\.kml\+xml' \}\);\n    const url = URL\.createObjectURL\(blob\);\n    const a = document\.createElement\('a'\);\n    a\.href = url;\n    a\.download = \`\$\{route\.id\}-segment\.kml\`;\n    a\.click\(\);\n    URL\.revokeObjectURL\(url\);\n    toast\.success\(\`Exported \$\{route\.id\} to KML\`\);\n  \};\n/, '');

fs.writeFileSync('src/components/bank/AuraDriveMap.tsx', code);
