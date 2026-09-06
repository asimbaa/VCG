const fs = require('fs');
let code = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');

const cardsStart = code.lastIndexOf(') : activeTab === "cards" ? (');
const cardsEnd = code.indexOf(') : null}', cardsStart);
const cardsCode = code.substring(cardsStart, cardsEnd);

const tags = ['form', 'select', 'label', 'button', 'p', 'h4', 'h3', 'AnimatePresence', 'motion.div', 'span', 'h2'];
tags.forEach(tag => {
    const open = cardsCode.split('<' + tag).length - 1;
    let close = cardsCode.split('</' + tag + '>').length - 1;
    // self closed? 
    const selfClose = cardsCode.split('<' + tag).filter(x => x.includes('/>')).length; 
    // Just compare open and close to see if they are close
    console.log(tag, "Open:", open, "Close:", close, "Diff:", open - close);
});
