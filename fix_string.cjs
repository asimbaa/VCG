const fs = require('fs');
let text = fs.readFileSync('src/App.tsx', 'utf8');
text = text.replace(/DEEP SPACE RESPONSE:\n\n/g, 'DEEP SPACE RESPONSE:\\n\\n');
text = text.replace(/ERROR CONNECTING TO CLUSTER:\n\n/g, 'ERROR CONNECTING TO CLUSTER:\\n\\n');
fs.writeFileSync('src/App.tsx', text);
