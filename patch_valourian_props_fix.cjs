const fs = require('fs');
let content = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');

content = content.replace(/<VaultRecords user=\{user\} \/>/g, '<VaultRecords />');
content = content.replace(/<ReceiptsSection user=\{user\} transactions=\{transferHistory\} \/>/g, '<ReceiptsSection transactions={transferHistory} />');
content = content.replace(/<PastOrdersView user=\{user\} \/>/g, '<PastOrdersView transactions={transferHistory} />');

fs.writeFileSync('src/components/bank/ValourianDashboard.tsx', content);
