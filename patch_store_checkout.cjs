const fs = require('fs');
let content = fs.readFileSync('src/components/bank/SovereignStore.tsx', 'utf8');

// The checkout process is likely in SovereignStore. Let's find how it's handled.
content = content.replace(/Unit 3702, 101 George Street, Sydney/g, "Unit 712, 15 Barton Rd, Artarmon NSW 2064 Australia");
content = content.replace(/Sovereign Internal Dispatch/g, "Amazon Prime Enterprise Logistics & Apple Store Fleet");

fs.writeFileSync('src/components/bank/SovereignStore.tsx', content);
