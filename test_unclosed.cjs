const fs = require('fs');
let code = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');
const cardsStart = code.lastIndexOf(') : activeTab === "cards" ? (');
const cardsCode = code.substring(cardsStart);
const matches = cardsCode.match(/<(img|hr|br|input)[^>]*[^/]>/g);
if (matches) {
    console.log("Unclosed tags:", matches);
} else {
    console.log("No unclosed tags");
}
