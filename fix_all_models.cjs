const fs = require('fs');

let content = fs.readFileSync('server.ts', 'utf8');

// Replace any gemini-* model references with standard supported one
content = content.replace(/model: "gemini-[a-zA-Z0-9\.-]+"/g, 'model: "gemini-1.5-flash-latest"');

fs.writeFileSync('server.ts', content);
console.log("Patched all model strings.");
