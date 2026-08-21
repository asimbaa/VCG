const fs = require('fs');
let content = fs.readFileSync('src/components/pay/RapidPay.tsx', 'utf8');

const targetStr = `const balance = card.currentBalance || 0;
                    const limitAmt = card.limit || 200000000;
                    const avail = limitAmt - balance;
                    const utilization = limitAmt > 0 ? (balance / limitAmt) * 100 : 0;`;

const replStr = `const balanceRaw = card.currentBalance !== undefined ? card.currentBalance : card.balance || 0;
                    const limitRaw = card.limit !== undefined ? card.limit : 200000000;
                    const balance = typeof balanceRaw === 'string' ? parseFloat(balanceRaw.replace(/[^0-9.]/g, '')) || 0 : balanceRaw;
                    const limitAmt = typeof limitRaw === 'string' ? parseFloat(limitRaw.replace(/[^0-9.]/g, '')) || 200000000 : limitRaw;
                    const avail = limitAmt - balance;
                    const utilization = limitAmt > 0 ? (balance / limitAmt) * 100 : 0;`;

content = content.replace(targetStr, replStr);
fs.writeFileSync('src/components/pay/RapidPay.tsx', content);
console.log("Patched RapidPay math");
