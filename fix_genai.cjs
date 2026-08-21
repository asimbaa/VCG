const fs = require('fs');

let content = fs.readFileSync('server.ts', 'utf8');

// I will just change it to use GoogleGenerativeAI with models/gemini-1.5-flash which is the standard name
content = content.replace(/model: "gemini-1\.5-flash"/g, 'model: "models/gemini-1.5-flash"');

fs.writeFileSync('server.ts', content);
