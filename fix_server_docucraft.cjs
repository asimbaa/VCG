const fs = require('fs');

const path = './server.ts';
let content = fs.readFileSync(path, 'utf8');

content = content.replace("CommBank VIP DocuCraft", "Valourian Capital DocuCraft");

fs.writeFileSync(path, content);
console.log("Fixed server.ts references to Valourian");
