const fs = require('fs');
let code = fs.readFileSync('src/components/bank/AuraDriveMap.tsx', 'utf8');

const regex = /<\/MapContainer>\s*\{\/\* Map UI Overlays \*\/\}/;

if (!regex.test(code)) {
    console.log("Regex not found");
} else {
    // wait I don't see any syntax error here. Let's see what line 497 error means:
    // error TS17008: JSX element 'div' has no corresponding closing tag.
}

