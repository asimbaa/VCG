const fs = require('fs');
let content = fs.readFileSync('src/components/bank/BankDashboard.tsx', 'utf8');

content = content.replace(
  "                  ))}\n                </div>\n              </div>\n            ) : activeTab === \"deposit\" ? (",
  "                  ))}\n                </div>\n              </div>\n              </>\n            ) : activeTab === \"deposit\" ? ("
);

fs.writeFileSync('src/components/bank/BankDashboard.tsx', content);
