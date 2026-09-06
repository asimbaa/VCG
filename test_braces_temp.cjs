const fs = require('fs');
let code = fs.readFileSync('temp.tsx', 'utf8');

let noStrings = code.replace(/"[^"]*"/g, '""');
noStrings = noStrings.replace(/'[^']*'/g, "''");
noStrings = noStrings.replace(/`[^`]*`/g, "``");
noStrings = noStrings.replace(/\/\*[\s\S]*?\*\//g, '');
noStrings = noStrings.replace(/\/\/.*/g, '');

const openBrace = (noStrings.match(/\{/g) || []).length;
const closeBrace = (noStrings.match(/\}/g) || []).length;
console.log("temp Braces Open:", openBrace, "Close:", closeBrace, "Diff:", openBrace - closeBrace);

const openParen = (noStrings.match(/\(/g) || []).length;
const closeParen = (noStrings.match(/\)/g) || []).length;
console.log("temp Parens Open:", openParen, "Close:", closeParen, "Diff:", openParen - closeParen);
