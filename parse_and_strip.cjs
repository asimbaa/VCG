const fs = require('fs');

let content = fs.readFileSync('src/components/pay/RapidPay.tsx', 'utf8');

// The original file is broken entirely at the modal addition around 2200-2400.
// Let's completely remove the `{/* Tap & Pay / Refund Modal */}` block from the file.

let idx = content.indexOf('{/* Tap & Pay / Refund Modal */}');
if (idx !== -1) {
    let start = content.lastIndexOf('<AnimatePresence>', idx);
    if (start !== -1) {
        let end = content.indexOf('</AnimatePresence>', idx) + 18;
        if (end > 17) {
            content = content.substring(0, start) + content.substring(end);
        }
    }
}

// Remove the Selected Card Modal as well
idx = content.indexOf('{/* Selected Card Modal */}');
if (idx !== -1) {
    let start = content.lastIndexOf('<AnimatePresence>', idx);
    if (start !== -1) {
        let end = content.indexOf('</AnimatePresence>', idx) + 18;
        if (end > 17) {
            content = content.substring(0, start) + content.substring(end);
        }
    }
}

fs.writeFileSync('src/components/pay/RapidPay.tsx', content);
console.log("Stripped modals.");
