const fs = require('fs');
let content = fs.readFileSync('src/components/bank/UberEatsApp.tsx', 'utf8');
const target = `animate={{ scale: [1, 1.4, 1], rotate: [0, -10, 10, 0], opacity: 1 }}`;
const repl = `animate={{ scale: [1, 1.5, 1], opacity: 1 }}`;
content = content.replace(target, repl);
const target2 = `transition={{ type: "spring", stiffness: 400, damping: 8, bounce: 0.6 }}`;
const repl2 = `transition={{ type: "spring", stiffness: 500, damping: 10, bounce: 0.5 }}`;
content = content.replace(target2, repl2);
fs.writeFileSync('src/components/bank/UberEatsApp.tsx', content);
