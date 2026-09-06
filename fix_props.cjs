const fs = require('fs');

let content = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');

content = content.replace(/<SovereignStore \/>/, '<SovereignStore user={user} balances={balances} setBalances={setBalances} />');
content = content.replace(/<ReceiptsSection \/>/, '<ReceiptsSection transactions={transactions} />');
content = content.replace(/<WorkspaceMail \/>/, '<WorkspaceMail user={user} />');
content = content.replace(/<UberApp \/>/, '<UberApp user={user} balances={balances} setBalances={setBalances} />');
content = content.replace(/<UberEatsApp \/>/, '<UberEatsApp user={user} balances={balances} setBalances={setBalances} />');
content = content.replace(/<PastOrdersView \/>/, '<PastOrdersView transactions={transactions} />');
content = content.replace(/<TerminalMax \/>/, '<TerminalMax isOpen={true} onClose={() => {}} onExecute={() => {}} />');
content = content.replace(/<BookingApp \/>/, '<BookingApp user={user} balances={balances} setBalances={setBalances} />');
content = content.replace(/<OrderSummary \/>/, '<OrderSummary orderId="V-88" status="PENDING" items={[]} eta="N/A" destination="N/A" />');

fs.writeFileSync('src/components/bank/ValourianDashboard.tsx', content);
