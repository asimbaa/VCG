const fs = require('fs');
let code = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');

const cardsStart = code.lastIndexOf(') : activeTab === "cards" ? (');
code = code.substring(0, cardsStart);

let noStrings = code.replace(/"(?:[^"\\]|\\.)*"/g, '""')
                    .replace(/'(?:[^'\\]|\\.)*'/g, "''")
                    .replace(/`(?:[^`\\]|\\.)*`/g, "``");
noStrings = noStrings.replace(/\/\*[\s\S]*?\*\//g, '');
noStrings = noStrings.replace(/\/\/.*/g, '');

const lines = noStrings.split('\n');
let openB = 0, closeB = 0;
let openP = 0, closeP = 0;

for (let i = 0; i < lines.length; i++) {
    openB += (lines[i].match(/\{/g) || []).length;
    closeB += (lines[i].match(/\}/g) || []).length;
    openP += (lines[i].match(/\(/g) || []).length;
    closeP += (lines[i].match(/\)/g) || []).length;
    
    if (i % 500 === 0) {
        console.log(`Line ${i}: B_Diff=${openB - closeB}, P_Diff=${openP - closeP}`);
    }
}
console.log(`End: B_Diff=${openB - closeB}, P_Diff=${openP - closeP}`);
