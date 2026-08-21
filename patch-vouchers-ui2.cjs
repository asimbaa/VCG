const fs = require('fs');
let content = fs.readFileSync('src/components/bank/UberEatsApp.tsx', 'utf8');

const target = `toast.success("Voucher shared across linked sub-accounts!");`;
const repl = `toast.success("Voucher securely broadcasted to all linked sub-accounts via Firebase Registry.");`;
content = content.replace(target, repl);

fs.writeFileSync('src/components/bank/UberEatsApp.tsx', content);
