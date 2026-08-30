const fs = require('fs');
let code = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');

const targetLimits2 = `Withdrawal limits: {" "}
                                    <strong className="text-white">
                                      $100,000 Valourian Capital Bypass
                                    </strong>
                                    . Valid for 30 minutes at any Chatswood,
                                    CBD, or Prosegur Vault terminal.`;
const newLimits2 = `Withdrawal limits: {" "}
                                    <strong className="text-emerald-400">
                                      $50,000,000 Valourian Capital Bypass
                                    </strong>
                                    . Institutional physical cash liquidation limits unlocked for Federal vaults (Chatswood HQ, Prosegur CBD, Martin Place). Valid for 30 minutes.`;

code = code.replace(targetLimits2, newLimits2);

fs.writeFileSync('src/components/bank/ValourianDashboard.tsx', code);
console.log("Patched ValourianDashboard.tsx withdraw limits properly");
