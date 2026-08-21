const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

// The issue might be that generative AI needs specific models for v1beta, or the API key is wrong
// Let's change back to basic text model just to test the integration works
content = content.replace(/model: "gemini-1\.5-flash"/g, 'model: "gemini-pro"');

fs.writeFileSync('server.ts', content);
