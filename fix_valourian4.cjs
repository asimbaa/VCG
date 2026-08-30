const fs = require('fs');
let content = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');

if (content.endsWith('      </>\n      </>\n  );\n}')) {
  content = content.replace('      </>\n      </>\n  );\n}', '      </>\n  );\n}');
}

fs.writeFileSync('src/components/bank/ValourianDashboard.tsx', content);
