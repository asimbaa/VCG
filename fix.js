const fs = require("fs"); 
let c = fs.readFileSync("src/components/bank/ValourianDashboard.tsx", "utf-8"); 
c = c.replace(/success"\>\("ready"\);\\n  const \[isOffline/g, 'success">("ready");\n  const [isOffline'); 
c = c.replace(/setNfcState\("success"\);/, 'setNfcState("success");');
fs.writeFileSync("src/components/bank/ValourianDashboard.tsx", c);
