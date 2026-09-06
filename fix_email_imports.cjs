const fs = require('fs');

// ValourianDashboard
let vd = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');

// replace import("../../utils/email").then(({ sendWorkspaceEmail }) => { ... })
vd = vd.replace(/import\("\.\.\/\.\.\/utils\/email"\)\.then\(\(\{ sendWorkspaceEmail \}\) => \{([\s\S]*?)\}\)\.catch/g, `Promise.resolve().then(() => { $1 }).catch`);

vd = vd.replace(/const emailUtils = await import\("\.\.\/\.\.\/utils\/email"\);/g, `const emailUtils = { sendWorkspaceEmail, generateProfessionalReceipt };`);

vd = vd.replace(/import\("\.\.\/\.\.\/utils\/email"\)\s*\.then\(\(\{ sendWorkspaceEmail, generateProfessionalReceipt \}\) => \{/g, `Promise.resolve().then(() => {`);

fs.writeFileSync('src/components/bank/ValourianDashboard.tsx', vd);

// UberApp
let ua = fs.readFileSync('src/components/bank/UberApp.tsx', 'utf8');
if (!ua.includes("import { sendWorkspaceEmail")) {
    ua = `import { sendWorkspaceEmail, generateProfessionalReceipt } from "../../utils/email";\n` + ua;
}
ua = ua.replace(/import\("\.\.\/\.\.\/utils\/email"\)\s*\.then\(\(\{ sendWorkspaceEmail, generateProfessionalReceipt \}\) => \{/g, `Promise.resolve().then(() => {`);
fs.writeFileSync('src/components/bank/UberApp.tsx', ua);

// UberEatsApp
let uea = fs.readFileSync('src/components/bank/UberEatsApp.tsx', 'utf8');
if (!uea.includes("import { sendWorkspaceEmail")) {
    uea = `import { sendWorkspaceEmail, generateProfessionalReceipt } from "../../utils/email";\n` + uea;
}
uea = uea.replace(/import\("\.\.\/\.\.\/utils\/email"\)\s*\.then\(\(\{ sendWorkspaceEmail, generateProfessionalReceipt \}\) => \{/g, `Promise.resolve().then(() => {`);
fs.writeFileSync('src/components/bank/UberEatsApp.tsx', uea);

