import re

with open("src/components/bank/UberEatsApp.tsx", "r") as f:
    content = f.read()

target = """                            <div className="flex items-center gap-1 text-[9px] font-black text-emerald-600 bg-emerald-50/50 p-1.5 px-3 rounded-lg border border-emerald-100/50 w-fit">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              SOVEREIGN TRANSACTION SECURELY ENCRYPTED
                            </div>"""

replacement = """                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1 text-[9px] font-black text-emerald-600 bg-emerald-50/50 p-1.5 px-3 rounded-lg border border-emerald-100/50 w-fit">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                SOVEREIGN TRANSACTION SECURELY ENCRYPTED
                              </div>
                              <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    const contentStr = `UBER EATS RECEIPT SUMMARY\\n\\nRestaurant: ${order.recipient}\\nDate: ${orderDate}\\nTotal: $${Math.abs(order.amount).toFixed(2)}\\n\\nItems:\\n${(order.items || []).map((it:any) => `- ${it.name} ($${it.price})`).join('\\n')}\\n\\nDelivery Address: ${order.deliveryAddress || 'N/A'}`;
                                    const blob = new Blob([contentStr], { type: 'text/plain' });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `Receipt_${order.id}.txt`;
                                    document.body.appendChild(a);
                                    a.click();
                                    document.body.removeChild(a);
                                    URL.revokeObjectURL(url);
                                }}
                                className="text-[10px] font-black uppercase tracking-widest text-[#06C167] hover:text-[#05a155] bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
                              >
                                <Download className="w-3 h-3" /> Download Summary
                              </button>
                            </div>"""

content = content.replace(target, replacement)

with open("src/components/bank/UberEatsApp.tsx", "w") as f:
    f.write(content)

print("UberEatsApp patched with download")
