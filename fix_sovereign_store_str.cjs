const fs = require('fs');
let content = fs.readFileSync('src/components/bank/SovereignStore.tsx', 'utf8');
content = content.replace('  };\n  };\n  const forwardConfirmationToBoard', '  };\n  const forwardConfirmationToBoard');
fs.writeFileSync('src/components/bank/SovereignStore.tsx', content);
