const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

// The new SDK hardcodes "gemini-2.5-flash" here
content = content.replace(/model: "gemini-2\.5-flash"/g, 'model: "gemini-1.5-flash"');
content = content.replace(/model: "gemini-pro"/g, 'model: "gemini-1.5-flash"');

fs.writeFileSync('server.ts', content);
