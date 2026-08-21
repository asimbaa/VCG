const fs = require('fs');

let content = fs.readFileSync('server.ts', 'utf8');
content = content.replace(/res\.status\(500\)\.json\(\{ error: "Failed to process chat" \}\);/, 'res.status(500).json({ error: "Failed to process chat", details: error.message });');

fs.writeFileSync('server.ts', content);
