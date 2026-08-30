const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.replace(/input.value = "DEEP SPACE RESPONSE:\n\n"/g, 'input.value = "DEEP SPACE RESPONSE:\\n\\n"');
code = code.replace(/input.value = "ERROR CONNECTING TO CLUSTER:\n\n"/g, 'input.value = "ERROR CONNECTING TO CLUSTER:\\n\\n"');
fs.writeFileSync('src/App.tsx', code);
