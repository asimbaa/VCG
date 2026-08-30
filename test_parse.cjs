const fs = require('fs');
const code = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');
const lines = code.split('\n').slice(0, 11850);

// We want to find which tags are open
let openTags = [];
// This is hard to do with regex perfectly, but let's try a heuristic or just look at the last few lines

for(let i=11800; i<11850; i++) {
   console.log(i + ": " + lines[i]);
}
