const fs = require('fs');

let content = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');

if (content.includes("navigator.clipboard.writeText(copyText)")) {
    console.log("Success: Copy logic includes the formatted block");
} else {
    console.log("Failed: Copy logic not updated properly");
}
