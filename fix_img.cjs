const fs = require('fs');

const fixFile = (file) => {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/\/ loading="lazy">/g, ' loading="lazy" />');
    fs.writeFileSync(file, content);
}

fixFile('src/components/bank/ValourianDashboard.tsx');
fixFile('src/components/bank/BankDashboard.tsx');
fixFile('src/components/bank/WorkspaceMail.tsx');
fixFile('src/components/bank/DocuCraftAI.tsx');
console.log("Images fixed.");
