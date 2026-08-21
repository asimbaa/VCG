import re

with open("src/components/bank/UberEatsApp.tsx", "r") as f:
    content = f.read()

bad_str = """                                      </div>
                                    )}                                  
                            {/* Download summary button */}
                            <div className="pt-2 border-t border-slate-100 flex justify-end mt-2">
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
                            </div>
                          </div>"""

# replace it back to original div closing
content = content.replace(bad_str, """                                      </div>
                                    )}                                  """)

# We also need to add 'Download' to lucide-react import
if "Download," not in content:
    content = content.replace("import {", "import { Download,", 1)

with open("src/components/bank/UberEatsApp.tsx", "w") as f:
    f.write(content)

