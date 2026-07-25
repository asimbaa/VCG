const fs = require('fs');
let content = fs.readFileSync('src/components/bank/CryptoPortfolio.tsx', 'utf8');

const hook = `                            if (viewMode === 'crypto') {
                                setPrices(prev => prev.map(p => p.id === transferAsset ? {...p, balance: p.balance - parseFloat(transferAmount)} : p));
                                toast.success(\`Successfully sent \${transferAmount} to Coinbase Wallet \${transferDestination.substring(0, 8)}...\`);
                            } else {
                                setFiatBalances(prev => prev.map(f => f.id === transferAsset ? {...f, balance: f.balance - parseFloat(transferAmount)} : f));
                                toast.success(\`Wire transfer of \${transferAmount} initiated to \${transferDestination}\`);
                            }`;

const newHook = `                            if (viewMode === 'crypto') {
                                setPrices(prev => prev.map(p => p.id === transferAsset ? {...p, balance: p.balance - parseFloat(transferAmount)} : p));
                                toast.success(\`Successfully sent \${transferAmount} to Coinbase Wallet \${transferDestination.substring(0, 8)}...\`);
                                
                                import('../../utils/email').then(module => {
                                     const htmlBody = module.generateProfessionalReceipt({
                                         merchant: \`Crypto Network: \${transferAsset.toUpperCase()}\`,
                                         amount: \`\${transferAmount} \${transferAsset.toUpperCase()}\`,
                                         recipient: transferDestination,
                                         id: \`TX-\${Math.random().toString(36).substring(2, 10).toUpperCase()}\`
                                     });
                                     module.sendWorkspaceEmail("asim.nsw@gmail.com", \`Crypto Transfer Receipt\`, htmlBody);
                                }).catch(e => console.error(e));

                            } else {
                                setFiatBalances(prev => prev.map(f => f.id === transferAsset ? {...f, balance: f.balance - parseFloat(transferAmount)} : f));
                                toast.success(\`Wire transfer of \${transferAmount} initiated to \${transferDestination}\`);
                                
                                import('../../utils/email').then(module => {
                                     const htmlBody = module.generateProfessionalReceipt({
                                         merchant: "Valourian Sovereign Wire Transfer",
                                         amount: \`\${transferAmount}\`,
                                         recipient: transferDestination,
                                         id: \`WT-\${Math.random().toString(36).substring(2, 10).toUpperCase()}\`
                                     });
                                     module.sendWorkspaceEmail("asim.nsw@gmail.com", \`Wire Transfer Receipt\`, htmlBody);
                                }).catch(e => console.error(e));
                            }`;

content = content.replace(hook, newHook);
fs.writeFileSync('src/components/bank/CryptoPortfolio.tsx', content);
console.log("CryptoPortfolio hooked.");
