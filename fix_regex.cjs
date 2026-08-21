const fs = require('fs');
let content = fs.readFileSync('src/components/bank/DocuCraftAI.tsx', 'utf8');
content = content.replace(/replace\(\/s\+\/g, '_'\)/, "replace(/\\s+/g, '_')");
fs.writeFileSync('src/components/bank/DocuCraftAI.tsx', content);
