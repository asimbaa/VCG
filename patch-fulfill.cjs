const fs = require('fs');
let content = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');

const target = `                        <p
                          className={\`text-sm font-bold \${txn.amount > 0 ? "text-green-600" : "text-slate-900"}\`}
                        >
                          {formatCurrencySafe(txn.amount, txn.currency || "USD")}
                        </p>`;
                        
const repl = `                        <p
                          className={\`text-sm font-bold \${txn.amount > 0 ? "text-green-600" : "text-slate-900"}\`}
                        >
                          {formatCurrencySafe(txn.amount, txn.currency || "USD")}
                        </p>
                        {txn.type === "request" && txn.status === "pending" && (
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              const toastId = toast.loading("Processing fulfillment...");
                              try {
                                const newAmount = Math.abs(txn.amount);
                                const currency = txn.currency || "USD";
                                
                                const updatedBalances = { ...balances };
                                updatedBalances[currency] = (updatedBalances[currency] || 0) + newAmount;
                                
                                await updateDoc(doc(db, "users", user!.uid), {
                                  balances: updatedBalances
                                });
                                
                                await updateDoc(doc(db, "transactions", txn.id), {
                                  status: "completed"
                                });
                                
                                setBalances(updatedBalances);
                                setTransactions(prev => prev.map(t => t.id === txn.id ? { ...t, status: "completed" } : t));
                                toast.success("Request fulfilled! Funds deposited into your account.", { id: toastId });
                              } catch(err) {
                                toast.error("Fulfillment failed", { id: toastId });
                              }
                            }}
                            className="bg-emerald-500 hover:bg-emerald-400 text-white text-[10px] font-black uppercase px-2 py-1 rounded"
                          >
                            Simulate Payment Received
                          </button>
                        )}`;

content = content.replace(target, repl);
fs.writeFileSync('src/components/bank/ValourianDashboard.tsx', content);
console.log("ValourianDashboard patched for requests.");
