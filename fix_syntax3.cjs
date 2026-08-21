const fs = require('fs');
let file = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');

// There's a mismatch in motion.div opens and closes. 82 opens vs 72 closes. That implies there are 10 self-closing <motion.div /> or 10 missing closing tags!
// Actually `<motion.div ... />` is possible. Let's count them.
const motionSelfCloses = (file.match(/<motion\.div[^>]*\/>/g) || []).length;
console.log("motion.div self closes:", motionSelfCloses);

// Wait, the error is: `Expected corresponding JSX closing tag for <div>.`
// That means a `<div>` was opened somewhere in my patch and never closed, so it bled down to the `</motion.div>` on line 21770!

