const fs = require('fs');
let code = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');
const cardsStart = code.lastIndexOf(') : activeTab === "cards" ? (');
const cardsCode = code.substring(cardsStart);

// Remove all strings
let noStrings = cardsCode.replace(/"[^"]*"/g, '""');
noStrings = noStrings.replace(/'[^']*'/g, "''");
noStrings = noStrings.replace(/`[^`]*`/g, "``");

const openBrace = (noStrings.match(/\{/g) || []).length;
const closeBrace = (noStrings.match(/\}/g) || []).length;

console.log("Braces Open:", openBrace, "Close:", closeBrace, "Diff:", openBrace - closeBrace);

const openParen = (noStrings.match(/\(/g) || []).length;
const closeParen = (noStrings.match(/\)/g) || []).length;

console.log("Parens Open:", openParen, "Close:", closeParen, "Diff:", openParen - closeParen);

