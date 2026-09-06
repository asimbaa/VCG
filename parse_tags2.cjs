const fs = require('fs');
let code = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');
const cardsStart = code.lastIndexOf(') : activeTab === "cards" ? (');
const cardsEnd = code.indexOf(') : null}', cardsStart);
let cardsCode = code.substring(cardsStart, cardsEnd);

const tags = cardsCode.matchAll(/<\/?([a-zA-Z0-9\.]+)[^>]*>/g);
const stack = [];
for (const match of tags) {
    const t = match[0];
    if (t.startsWith('</')) {
        const tagName = t.match(/<\/([a-zA-Z0-9\.]+)/)[1];
        if (stack.length && stack[stack.length - 1] === tagName) {
            stack.pop();
        } else {
            console.log("Unmatched closing:", t, "at index", match.index, "Expected:", stack[stack.length - 1]);
        }
    } else {
        if (!t.endsWith('/>')) {
            const tagName = t.match(/<([a-zA-Z0-9\.]+)/)[1];
            stack.push(tagName);
        }
    }
}
console.log("Remaining on stack:", stack);
