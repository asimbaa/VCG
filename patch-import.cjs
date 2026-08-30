const fs = require('fs');
let content = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');

if (!content.includes('ShoppingCart')) {
   content = content.replace('import {', 'import { ShoppingCart,');
} else {
   // It might be used elsewhere but not imported?
   const importBlock = content.split('from "lucide-react";')[0];
   if (!importBlock.includes('ShoppingCart')) {
       content = content.replace('import {', 'import { ShoppingCart,');
   }
}

fs.writeFileSync('src/components/bank/ValourianDashboard.tsx', content);
console.log("Import patched");
