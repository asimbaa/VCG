const fs = require('fs');
let content = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');

// Remove ShoppingCart from email
content = content.replace('import { ShoppingCart, sendWorkspaceEmail', 'import { sendWorkspaceEmail');
// Add it to lucide-react
content = content.replace('FileJson,', 'FileJson, ShoppingCart,');

fs.writeFileSync('src/components/bank/ValourianDashboard.tsx', content);
console.log("Fixed import");
