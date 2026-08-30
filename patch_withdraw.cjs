const fs = require('fs');
let code = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');

// Replace the max ATM limit and add a massive new one
const targetAmounts = `["500", "1000", "2000", "5000", "100000"]`;
const newAmounts = `["500", "1000", "2000", "100000", "5000000", "50000000"]`;
code = code.replace(targetAmounts, newAmounts);

const targetLimits = `Withdrawal limits: {" "}
                                    <strong className="text-white">
                                      $100,000 Valourian Capital Bypass
                                    </strong>
                                    . Valid for 30 minutes at any Chatswood,`;
const newLimits = `Withdrawal limits: {" "}
                                    <strong className="text-emerald-400">
                                      $50,000,000 Valourian Capital Bypass
                                    </strong>
                                    . Institutional physical cash liquidation limits unlocked for Federal vaults (Chatswood HQ, Prosegur CBD, Martin Place). Valid for 30 minutes.`;
code = code.replace(targetLimits, newLimits);

const targetCondition = `if (bank === "Westpac")
                                              setAtmWithdrawAmount("500");
                                            else setAtmWithdrawAmount("100000");`;
const newCondition = `if (bank === "Westpac")
                                              setAtmWithdrawAmount("500");
                                            else setAtmWithdrawAmount("5000000");`;
code = code.replace(targetCondition, newCondition);

fs.writeFileSync('src/components/bank/ValourianDashboard.tsx', code);
console.log("Patched ValourianDashboard.tsx withdraw limits");
