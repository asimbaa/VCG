const fs = require('fs');
let code = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');

const cardsStart = code.lastIndexOf(') : activeTab === "cards" ? (');
const cardsEnd = code.indexOf(') : null}', cardsStart);
const cardsCode = code.substring(cardsStart, cardsEnd);

const divOpen = cardsCode.split('<div').length - 1;
const divClose = cardsCode.split('</div').length - 1;
console.log("div Open:", divOpen, "Close:", divClose, "Diff:", divOpen - divClose);
