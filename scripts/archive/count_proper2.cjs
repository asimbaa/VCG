const fs = require('fs');
let code = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');

const cardsStart = code.lastIndexOf(') : activeTab === "cards" ? (');
const cardsEnd = code.indexOf(') : null}', cardsStart);
const cardsCode = code.substring(cardsStart, cardsEnd);

const tags = ['div', 'form', 'select', 'input', 'label', 'button', 'p', 'h4', 'h3', 'AnimatePresence', 'motion\\\\.div', 'span'];
tags.forEach(tag => {
    const regexOpen = new RegExp('<' + tag + '(?:\\\\s|\\\\n|>)', 'g');
    const regexClose = new RegExp('</' + tag + '>', 'g');
    
    // For self closing
    const regexSelfClose = new RegExp('<' + tag + '(?:\\\\s|\\\\n)[^>]*/>', 'g');
    
    const open = (cardsCode.match(regexOpen) || []).length;
    const close = (cardsCode.match(regexClose) || []).length;
    const selfClose = (cardsCode.match(regexSelfClose) || []).length;
    
    const isSelfClosingType = ['input'].includes(tag.replace('\\\\', ''));
    if (isSelfClosingType) {
       console.log(tag.replace('\\\\', ''), "Open:", open, "SelfClose:", selfClose, "Close:", close);
    } else {
       console.log(tag.replace('\\\\', ''), "Open:", open, "Close:", close, "Diff:", (open - selfClose) - close);
    }
});
