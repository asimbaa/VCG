const fs = require('fs');
const file = 'src/components/bank/UberEatsApp.tsx';
let code = fs.readFileSync(file, 'utf8');

const target = `<RefreshCw className="w-3 h-3" /> Quick Reorder
                            </button>
                            {/* Display delivery details if they exist */}`;

const replacement = `<RefreshCw className="w-3 h-3" /> Quick Reorder
                            </button>
                            <button
                              onClick={() => {
                                const doc = new jsPDF();
                                doc.setFontSize(22);
                                doc.setTextColor(6, 193, 103);
                                doc.text("Uber Eats Corporate Receipt", 20, 20);
                                doc.setFontSize(12);
                                doc.setTextColor(0, 0, 0);
                                doc.text(\`Order ID: \${order.id}\`, 20, 35);
                                doc.text(\`Date: \${orderDate}\`, 20, 42);
                                doc.text(\`Merchant: \${order.recipient}\`, 20, 49);
                                if (order.deliveryAddress) {
                                  doc.text(\`Delivery Address: \${order.deliveryAddress}\`, 20, 56);
                                }
                                doc.text(\`Total Amount: $\${Math.abs(order.amount).toFixed(2)} AUD\`, 20, 63);
                                
                                doc.setFontSize(10);
                                doc.text("Items:", 20, 75);
                                let y = 82;
                                if (order.items && order.items.length > 0) {
                                  order.items.forEach((it) => {
                                    doc.text(\`- \${it.name}: $\${it.price}\`, 25, y);
                                    y += 7;
                                  });
                                }
                                
                                doc.setFontSize(9);
                                doc.setTextColor(150, 150, 150);
                                doc.text("Official Tax Document - Valourian Sovereign Network", 20, 280);
                                
                                doc.save(\`receipt-\${order.id}.pdf\`);
                                toast.success("Corporate receipt downloaded as PDF.");
                              }}
                              className="w-full mt-2 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
                            >
                              <Download className="w-3 h-3" /> Download Corporate PDF Receipt
                            </button>
                            {/* Display delivery details if they exist */}`;

code = code.replace(target, replacement);

fs.writeFileSync(file, code);
