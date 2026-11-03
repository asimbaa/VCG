const fs = require('fs');
let code = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');
const cardsStart = code.lastIndexOf(') : activeTab === "cards" ? (');
code = code.substring(0, cardsStart) + '\n\n</div></div></div></div>) : null}</motion.div></AnimatePresence></div></div>);}';
fs.writeFileSync('temp_test.tsx', code);
