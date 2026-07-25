const fs = require('fs');
let content = fs.readFileSync('src/components/bank/BankDashboard.tsx', 'utf8');

content = content.replace(
  ") : activeTab === \"cards\" ? (\n              <div className=\"space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500\">\n                <BlackCardsController />\n                    <CreditCard className=\"w-5 h-5 text-blue-600\" />",
  ") : activeTab === \"cards\" ? (\n                    <CreditCard className=\"w-5 h-5 text-blue-600\" />"
);

content = content.replace(
  ") : activeTab === \"crypto\" ? (\n              <Bitcoin className=\"w-5 h-5 text-blue-600\" />\n            ) : activeTab === \"portfolio\" ? (",
  ") : activeTab === \"crypto\" ? (\n                    <Bitcoin className=\"w-5 h-5 text-blue-600\" />\n                  ) : activeTab === \"portfolio\" ? ("
);

fs.writeFileSync('src/components/bank/BankDashboard.tsx', content);
