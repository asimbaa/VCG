const fs = require('fs');

const path = './src/components/pay/RapidPay.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace("if (cards.length > 0) {", "if (allCards.length > 0) {");
content = content.replace("return cards.find((c: any) => c.id === prev.id) || cards[0];", "return allCards.find((c: any) => c.id === prev.id) || allCards[0];");
content = content.replace("return cards[0];", "return allCards[0];");

fs.writeFileSync(path, content);
console.log("RapidPay.tsx fixed");

