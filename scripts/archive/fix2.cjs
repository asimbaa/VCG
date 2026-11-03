const fs = require('fs');
let code = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');
code = code.replace(
`              </motion.div>
            )}
          </AnimatePresence>`,
`              </div>`
);
fs.writeFileSync('src/components/bank/ValourianDashboard.tsx', code);
