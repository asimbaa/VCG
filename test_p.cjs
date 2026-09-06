const fs = require('fs');
let code = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');

const cardsStart = code.lastIndexOf(') : activeTab === "cards" ? (');
const cardsEnd = code.indexOf(') : null}', cardsStart);
const cardsCode = code.substring(cardsStart, cardsEnd);

const openP = cardsCode.match(/<p(?:\\s|>)/g)?.length || 0;
const closeP = cardsCode.match(/<\/p>/g)?.length || 0;
console.log("p Open:", openP, "Close:", closeP);

