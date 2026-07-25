const fs = require('fs');
let code = fs.readFileSync('src/components/bank/SovereignStore.tsx', 'utf-8');

// Ensure description is in the interface
if (!code.includes('description?: string')) {
  code = code.replace(/specs: string\[\];/g, 'specs: string[];\n  description?: string;');
}
fs.writeFileSync('src/components/bank/SovereignStore.tsx', code);
