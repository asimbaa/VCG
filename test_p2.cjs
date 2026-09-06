const fs = require('fs');
let code = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');

const cardsStart = code.lastIndexOf(') : activeTab === "cards" ? (');
const cardsEnd = code.indexOf(') : null}', cardsStart);
const cardsCode = code.substring(cardsStart, cardsEnd);

const openP = (cardsCode.split('<p ').length - 1) + (cardsCode.split('<p>').length - 1);
const closeP = cardsCode.split('</p>').length - 1;
console.log("p Open:", openP, "Close:", closeP);

