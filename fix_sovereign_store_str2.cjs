const fs = require('fs');
let content = fs.readFileSync('src/components/bank/SovereignStore.tsx', 'utf8');
content = content.replace(/downloaded as PDF!", \{ icon: "📥" \}\);\n  \};\n  \};\n  const forward/g, 'downloaded as PDF!", { icon: "📥" });\n  };\n  const forward');
fs.writeFileSync('src/components/bank/SovereignStore.tsx', content);
