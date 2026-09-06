const fs = require('fs');
let code = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');
const cardsStart = code.lastIndexOf(') : activeTab === "cards" ? (');
const cardsEnd = code.indexOf(') : null}', cardsStart);
let cardsCode = code.substring(cardsStart, cardsEnd);

// Strip JSX expressions {}
let prev;
do {
    prev = cardsCode;
    // Replace { ... } that don't contain < or > inside them to simplify?
    // Actually just find all tags:
} while (prev !== cardsCode);

const tags = cardsCode.match(/<\/?([a-zA-Z0-9\.]+)[^>]*>/g) || [];
const stack = [];
tags.forEach(t => {
    if (t.startsWith('</')) {
        const tagName = t.match(/<\/([a-zA-Z0-9\.]+)/)[1];
        if (stack.length && stack[stack.length - 1] === tagName) {
            stack.pop();
        } else {
            console.log("Unmatched closing:", t, "Expected:", stack[stack.length - 1]);
        }
    } else {
        // is self closing?
        if (!t.endsWith('/>')) {
            const tagName = t.match(/<([a-zA-Z0-9\.]+)/)[1];
            stack.push(tagName);
        }
    }
});
console.log("Remaining on stack:", stack);
