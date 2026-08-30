const fs = require('fs');
let content = fs.readFileSync('src/components/bank/BankDashboard.tsx', 'utf8');

let openTags = 0;
// very simple counter to see if something is off
// This is not a real JSX parser, just looking for obvious things.
