const fs = require('fs');
let code = fs.readFileSync('src/components/bank/GlobalTreasuryTab.tsx', 'utf8');

const tooltipStart = code.indexOf('const formatTrillions');
const tooltipEnd = code.indexOf('return null;\n  };') + 'return null;\n  };\n'.length;

const tooltipCode = code.substring(tooltipStart, tooltipEnd);
code = code.replace(tooltipCode, '');

// insert it right after the imports/data
const insertPos = code.indexOf('export function GlobalTreasuryTab() {');
code = code.substring(0, insertPos) + tooltipCode + '\n' + code.substring(insertPos);

fs.writeFileSync('src/components/bank/GlobalTreasuryTab.tsx', code);
