const fs = require('fs');
let content = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');

content = content.replace(/<\/>\s*\);\s*\}/g, ');\n}');
// And replace all stray </>\n</>
content = content.replace(/<\/>\s*<\/>/g, '</>');
content = content.replace(/<\/>\s*<\/>/g, '</>');
content = content.replace(/<\/>\s*\);\s*\}/g, ');\n}');

fs.writeFileSync('src/components/bank/ValourianDashboard.tsx', content);
