const fs = require('fs');
let file = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');
const search = 'id: `A-NEW-${i}`,';
const replace = 'id: `A-NEW-${prev.length}-${i}`,';
if (file.includes(search)) {
  fs.writeFileSync('src/components/bank/ValourianDashboard.tsx', file.replace(search, replace));
  console.log("Fixed A-NEW duplicate logic");
}
