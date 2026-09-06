const fs = require('fs');

function processFile(filename) {
    let content = fs.readFileSync(filename, 'utf8');
    
    // Replace: import("../../utils/email").then((module) => { ... })
    content = content.replace(/import\("\.\.\/\.\.\/utils\/email"\)\s*\.then\(\(module\) => \{/g, `Promise.resolve().then(() => { const module = { sendWorkspaceEmail, generateProfessionalReceipt };`);
    
    // Replace: import("../../utils/email").then(({ sendWorkspaceEmail }) => { ... })
    content = content.replace(/import\("\.\.\/\.\.\/utils\/email"\)\s*\.then\(\(\{ sendWorkspaceEmail \}\) => \{/g, `Promise.resolve().then(() => {`);

    fs.writeFileSync(filename, content);
}

processFile('src/components/bank/UberApp.tsx');
processFile('src/components/bank/UberEatsApp.tsx');
processFile('src/components/bank/ValourianDashboard.tsx');

