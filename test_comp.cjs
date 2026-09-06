const fs = require('fs');
let code = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');
const cardsStart = code.lastIndexOf(') : activeTab === "cards" ? (');
const cardsCode = code.substring(cardsStart);

const comps = ['CheckCircle2', 'CreditCard', 'Workflow', 'Fingerprint', 'FileText', 'AnimatePresence', 'motion.div'];

comps.forEach(tag => {
    let t = tag;
    if (t === 'motion.div') t = 'motion\\\\.div';
    
    // count open
    let openRegex = new RegExp('<' + t + '[\\\\s>]', 'g');
    let openCount = (cardsCode.match(openRegex) || []).length;
    
    let closeRegex = new RegExp('</' + t + '>', 'g');
    let closeCount = (cardsCode.match(closeRegex) || []).length;
    
    let selfCloseRegex = new RegExp('<' + t + '[^>]*/>', 'g');
    let selfCloseCount = (cardsCode.match(selfCloseRegex) || []).length;
    
    console.log(tag, "Open:", openCount, "Close:", closeCount, "Self:", selfCloseCount, "Diff:", openCount - selfCloseCount - closeCount);
});
