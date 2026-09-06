const fs = require('fs');
let code = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');
const cardsStart = code.lastIndexOf(') : activeTab === "cards" ? (');
const cardsEnd = code.indexOf(') : null}', cardsStart);
let cardsCode = code.substring(cardsStart, cardsEnd);
console.log(cardsCode.substring(41519 - 100, 41519 + 100));
