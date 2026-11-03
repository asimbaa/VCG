const fs = require('fs');
let code = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');

const cardsStart = code.indexOf(') : activeTab === "cards" ? (');
const cardsEnd = code.indexOf(') : null}', cardsStart);
const cardsCode = code.substring(cardsStart, cardsEnd);

const tags = ['form', 'select', 'input', 'label', 'button', 'p', 'h4', 'h3', 'AnimatePresence', 'motion.div', 'span'];
tags.forEach(tag => {
    let t = tag;
    if(t === 'motion.div') t = 'motion\\\\.div';
    const regexOpen = new RegExp('<' + t + '(?:\\\\s|>)', 'g');
    const regexClose = new RegExp('</' + t + '>', 'g');
    const regexSelfClose = new RegExp('<' + t + '[^>]*/>', 'g');
    
    // Instead, let's just do split:
    const open = cardsCode.split('<' + tag + ' ').length - 1 + cardsCode.split('<' + tag + '>').length - 1;
    const close = cardsCode.split('</' + tag + '>').length - 1;
    const selfClose = cardsCode.split('<' + tag).filter(x => x.includes('/>')).length; 
    // ^ this is imprecise, let's just stick to open and close counts
    console.log(tag, "Open:", open, "Close:", close, "Diff:", open - close);
});
