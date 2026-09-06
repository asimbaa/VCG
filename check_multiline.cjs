const fs = require('fs');
let code = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');

const tics = (code.match(/`/g) || []).length;
console.log("Backticks:", tics);

const commentsOpen = (code.match(/\/\*/g) || []).length;
const commentsClose = (code.match(/\*\//g) || []).length;
console.log("/*:", commentsOpen, "*/:", commentsClose);

