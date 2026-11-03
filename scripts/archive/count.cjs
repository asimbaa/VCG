const fs = require('fs');
let code = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');

const cardsStart = code.indexOf(') : activeTab === "cards" ? (');
const cardsEnd = code.indexOf(') : null}', cardsStart);

const cardsCode = code.substring(cardsStart, cardsEnd);
const openDivs = (cardsCode.match(/<div(\s|>)/g) || []).length;
const closeDivs = (cardsCode.match(/<\/div>/g) || []).length;
console.log("Open:", openDivs, "Close:", closeDivs, "Diff:", openDivs - closeDivs);

// Count spans
const openSpans = (cardsCode.match(/<span(\s|>)/g) || []).length;
const closeSpans = (cardsCode.match(/<\/span>/g) || []).length;
console.log("Spans Open:", openSpans, "Close:", closeSpans, "Diff:", openSpans - closeSpans);

