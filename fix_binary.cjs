const fs = require('fs');

const buffer = fs.readFileSync('src/components/bank/ValourianDashboard.tsx');
let str = '';
let foundBinary = false;
for (let i = 0; i < buffer.length; i++) {
    // Keep only valid ASCII and some basic Latin (32 to 126, 9, 10, 13)
    if (
        (buffer[i] >= 32 && buffer[i] <= 126) ||
        buffer[i] === 9 || buffer[i] === 10 || buffer[i] === 13
    ) {
        str += String.fromCharCode(buffer[i]);
    } else {
        foundBinary = true;
    }
}

console.log("Found binary?", foundBinary);
fs.writeFileSync('src/components/bank/ValourianDashboard.tsx', str);
