const fs = require('fs');
let code = fs.readFileSync('src/components/bank/AuraDriveMap.tsx', 'utf8');

code = code.replace(/    <\/div>\n  \);\n\}/, '  );\n}');

fs.writeFileSync('src/components/bank/AuraDriveMap.tsx', code);
