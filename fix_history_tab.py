with open("src/components/bank/UberEatsApp.tsx", "r") as f:
    lines = f.readlines()

new_lines = []
skip = False
for i, line in enumerate(lines):
    if 'Re-Order Items' in line and '                                  </button>' in lines[i+1]:
        # we found it. We should keep this line and the next.
        new_lines.append(line)
        new_lines.append(lines[i+1])
        new_lines.append('                                </div>\n')
        new_lines.append('                              )}\n')
        
        # Add the download summary button here cleanly.
        new_lines.append('                            {/* Download summary button */}\n')
        new_lines.append('                            <div className="pt-2 border-t border-slate-100 flex justify-end mt-2">\n')
        new_lines.append('                                <button\n')
        new_lines.append('                                  onClick={(e) => {\n')
        new_lines.append('                                      e.stopPropagation();\n')
        new_lines.append('                                      const contentStr = `UBER EATS RECEIPT SUMMARY\\n\\nRestaurant: ${order.recipient}\\nDate: ${orderDate}\\nTotal: $${Math.abs(order.amount).toFixed(2)}\\n\\nItems:\\n${(order.items || []).map((it:any) => `- ${it.name} ($${it.price})`).join(\'\\n\')}\\n\\nDelivery Address: ${order.deliveryAddress || \'N/A\'}`;\n')
        new_lines.append('                                      const blob = new Blob([contentStr], { type: \'text/plain\' });\n')
        new_lines.append('                                      const url = URL.createObjectURL(blob);\n')
        new_lines.append('                                      const a = document.createElement(\'a\');\n')
        new_lines.append('                                      a.href = url;\n')
        new_lines.append('                                      a.download = `Receipt_${order.id}.txt`;\n')
        new_lines.append('                                      document.body.appendChild(a);\n')
        new_lines.append('                                      a.click();\n')
        new_lines.append('                                      document.body.removeChild(a);\n')
        new_lines.append('                                      URL.revokeObjectURL(url);\n')
        new_lines.append('                                  }}\n')
        new_lines.append('                                  className="text-[10px] font-black uppercase tracking-widest text-[#06C167] hover:text-[#05a155] bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"\n')
        new_lines.append('                                >\n')
        new_lines.append('                                  <Download className="w-3 h-3" /> Download Summary\n')
        new_lines.append('                                </button>\n')
        new_lines.append('                            </div>\n')
        
        new_lines.append('                          </div>\n')
        new_lines.append('                        );\n')
        new_lines.append('                      })}\n')
        new_lines.append('                    </div>\n')
        
        # Now skip everything in the original file until we hit `</div>` that matches the end of the history tab content
        # wait, the next thing in the file is `) : (` which is the else block for trackingMode? 
        # No, the history tab just ends. Let's find what is after the `filteredOrders.map` block.
        skip = True
        continue
        
    if skip:
        if '                  </div>' in line and '                </div>' in lines[i+1] and '              ) : (' in lines[i+2]:
            # This is the end of the whole trackingMode ternary? No, this is the search/sort controls.
            # Let's just skip until we see `                  </div>` and `                </div>`
            pass
        if '                    </div>' in line and '                  </div>' in lines[i+1] and '                </div>' in lines[i+2]:
            skip = False
            # append these lines? Let's check context.
            
    if not skip:
        new_lines.append(line)

# Let me just manually edit the file with ED or vim but I can't.
