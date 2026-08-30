const fs = require('fs');
let content = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');

content = content.replace(/<WorkspaceMail \/>/g, '<WorkspaceMail user={user} />');
content = content.replace(/<VaultRecords \/>/g, '<VaultRecords user={user} />');
content = content.replace(/<ReceiptsSection \/>/g, '<ReceiptsSection user={user} transactions={transactions} />');
content = content.replace(/<PastOrdersView \/>/g, '<PastOrdersView user={user} />');
content = content.replace(/<BookingApp \/>/g, '<BookingApp user={user} balances={balances} setBalances={setBalances} />');
content = content.replace(/<UberApp \/>/g, '<UberApp user={user} balances={balances} setBalances={setBalances} />');
content = content.replace(/<UberEatsApp \/>/g, '<UberEatsApp user={user} balances={balances} setBalances={setBalances} />');
content = content.replace(/<SovereignDispatchMonitor \/>/g, '<SovereignDispatchMonitor />');

fs.writeFileSync('src/components/bank/ValourianDashboard.tsx', content);
