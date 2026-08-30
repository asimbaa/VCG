const fs = require('fs');
let content = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');

content = content.replace(/<\/>\s*<\/>\s*\);\s*\}/g, '</>\n  );\n}');

fs.writeFileSync('src/components/bank/ValourianDashboard.tsx', content);
