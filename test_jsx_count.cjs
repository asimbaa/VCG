const fs = require('fs');
let file = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');
const motionOpens = (file.match(/<motion\.div/g) || []).length;
const motionCloses = (file.match(/<\/motion\.div>/g) || []).length;
console.log("motion.div opens:", motionOpens, "closes:", motionCloses);
