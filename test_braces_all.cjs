const fs = require('fs');
let code = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');

// Remove all strings
let noStrings = code.replace(/"[^"]*"/g, '""');
noStrings = noStrings.replace(/'[^']*'/g, "''");
noStrings = noStrings.replace(/`[^`]*`/g, "``");
// Remove comments
noStrings = noStrings.replace(/\/\*[\s\S]*?\*\//g, '');
noStrings = noStrings.replace(/\/\/.*/g, '');

const openBrace = (noStrings.match(/\{/g) || []).length;
const closeBrace = (noStrings.match(/\}/g) || []).length;
console.log("Braces Open:", openBrace, "Close:", closeBrace, "Diff:", openBrace - closeBrace);

const openParen = (noStrings.match(/\(/g) || []).length;
const closeParen = (noStrings.match(/\)/g) || []).length;
console.log("Parens Open:", openParen, "Close:", closeParen, "Diff:", openParen - closeParen);
