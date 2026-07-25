const fs = require('fs');
let content = fs.readFileSync('src/components/bank/BankDashboard.tsx', 'utf8');

// The injected code
const badInjected = ") : activeTab === \"cards\" ? (\n              <div className=\"space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500\">\n                <BlackCardsController />";
const goodInjected = ") : activeTab === \"cards\" ? (\n              <div className=\"space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500\">\n                <BlackCardsController />";
// Wait, I can just replace the injected code and add a closing div where appropriate, OR just replace it without the open div!
content = content.replace(
  ") : activeTab === \"cards\" ? (\n              <div className=\"space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500\">\n                <BlackCardsController />",
  ") : activeTab === \"cards\" ? (\n              <>\n                <BlackCardsController />"
);

// Where does activeTab === "cards" end? The next one is activeTab === "deposit"
content = content.replace(
  "                  )}\n                </div>\n              </div>\n            ) : activeTab === \"deposit\"",
  "                  )}\n                </div>\n              </div>\n              </>\n            ) : activeTab === \"deposit\""
);

fs.writeFileSync('src/components/bank/BankDashboard.tsx', content);
